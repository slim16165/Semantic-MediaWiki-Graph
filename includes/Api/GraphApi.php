<?php
/**
 * API endpoint for Semantic MediaWiki Graph
 * 
 * @file
 * @ingroup SemanticMediaWikiGraph
 */

namespace SemanticMediaWikiGraph\Api;

use ApiBase;
use SemanticMediaWikiGraph\Config;
use SemanticMediaWikiGraph\Logger;
use SemanticMediaWikiGraph\Security;
use SemanticMediaWikiGraph\Cache;

/**
 * API module for graph data retrieval
 */
class GraphApi extends ApiBase {
    
    /**
     * Execute API request
     */
    public function execute() {
        // Check rate limiting
        $clientIP = Security::getClientIP();
        if (!Security::checkRateLimit($clientIP)) {
            $this->dieWithError('Rate limit exceeded', 'ratelimited');
        }
        
        $params = $this->extractRequestParams();
        $action = $params['action'] ?? 'getGraph';
        
        switch ($action) {
            case 'getGraph':
                $this->getGraph($params);
                break;
            case 'getArticles':
                $this->getArticles($params);
                break;
            default:
                $this->dieWithError('Invalid action', 'invalidaction');
        }
    }
        
    /**
     * Get graph data for a subject
     * 
     * @param array $params Request parameters
     */
    private function getGraph($params) {
        $subject = $params['subject'] ?? '';
        
        // Validate input
        if (empty($subject) || !Security::validateArticleTitle($subject)) {
            $this->dieWithError('Invalid subject', 'invalidsubject');
        }
        
        // Check cache
        $cache = Cache::getInstance();
        $cacheKey = 'smwgraph_' . md5($subject);
        $cached = $cache->get($cacheKey);
        
        if ($cached !== null) {
            Logger::debug('Returning cached graph data', ['subject' => $subject]);
            $this->getResult()->addValue(null, 'query', $cached);
            return;
        }
        
        // Fetch from MediaWiki API
        $data = $this->fetchSemanticData($subject);
        
        if ($data === null) {
            $this->dieWithError('Failed to fetch semantic data', 'apifailed');
        }
        
        // Process and validate data
        $processedData = $this->processGraphData($data, $subject);
        
        // Cache result
        $cacheTTL = Config::get('CacheTTL', 3600);
        $cache->set($cacheKey, $processedData, $cacheTTL);
        
        // Return result
        $this->getResult()->addValue(null, 'query', $processedData);
        
        Logger::info('Graph data retrieved', [
            'subject' => $subject,
            'nodes' => count($processedData['nodes'] ?? []),
            'links' => count($processedData['links'] ?? [])
        ]);
    }
    
    /**
     * Get list of articles
     * 
     * @param array $params Request parameters
     */
    private function getArticles($params) {
        $limit = min((int)($params['limit'] ?? 1000), Config::get('PageLimit', 1000));
        $search = $params['search'] ?? '';
        
        // Check cache
        $cache = Cache::getInstance();
        $cacheKey = 'smwgraph_articles_' . md5($limit . $search);
        $cached = $cache->get($cacheKey);
        
        if ($cached !== null) {
            $this->getResult()->addValue(null, 'query', $cached);
            return;
        }
        
        // Fetch from MediaWiki API
        $data = $this->fetchArticles($limit, $search);
        
        if ($data === null) {
            $this->dieWithError('Failed to fetch articles', 'apifailed');
        }
        
        // Cache result (shorter TTL for article lists)
        $cache->set($cacheKey, $data, 300); // 5 minutes
        
        $this->getResult()->addValue(null, 'query', $data);
    }
    
    /**
     * Fetch semantic data from MediaWiki API
     * 
     * @param string $subject Article title
     * @return array|null
     */
    private function fetchSemanticData($subject) {
        $api = new \MediaWiki\Api\ApiMain([
            'action' => 'browsebysubject',
            'subject' => $subject,
            'format' => 'json'
        ]);
        
        try {
            $api->execute();
            $result = $api->getResult()->getResultData();
            
            if (isset($result['query'])) {
                return $result['query'];
            }
            
            return null;
        } catch (\Exception $e) {
            Logger::error('Failed to fetch semantic data', [
                'subject' => $subject,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }
    
    /**
     * Fetch articles list from MediaWiki API
     * 
     * @param int $limit Maximum number of articles
     * @param string $search Search query
     * @return array|null
     */
    private function fetchArticles($limit, $search = '') {
        $params = [
            'action' => 'query',
            'list' => 'allpages',
            'aplimit' => $limit,
            'format' => 'json'
        ];
        
        if (!empty($search)) {
            $params['apprefix'] = $search;
        }
        
        $api = new \MediaWiki\Api\ApiMain($params);
        
        try {
            $api->execute();
            $result = $api->getResult()->getResultData();
            
            if (isset($result['query']['allpages'])) {
                return ['allpages' => $result['query']['allpages']];
            }
            
            return ['allpages' => []];
        } catch (\Exception $e) {
            Logger::error('Failed to fetch articles', [
                'limit' => $limit,
                'search' => $search,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }
    
    /**
     * Process and validate graph data
     * 
     * @param array $data Raw API data
     * @param string $subject Subject article title
     * @return array Processed data
     */
    private function processGraphData($data, $subject) {
        $nodes = [];
        $links = [];
        
        // Add focal node
        $focalNodeId = $data['subject'] ?? $subject;
        $nodes[] = [
            'id' => Security::escapeOutput($focalNodeId),
            'name' => Security::escapeOutput(str_replace('_', ' ', explode('#', $focalNodeId)[0])),
            'type' => 'Internal Link',
            'hlink' => './' . urlencode(explode('#', $focalNodeId)[0])
        ];
        
        $maxNodes = Config::get('MaxNodes', 500);
        $maxLinks = Config::get('MaxLinks', 1000);
        
        // Process data items
        if (isset($data['data']) && is_array($data['data'])) {
            foreach ($data['data'] as $item) {
                if (count($nodes) >= $maxNodes || count($links) >= $maxLinks) {
                    Logger::warning('Graph size limit reached', [
                        'nodes' => count($nodes),
                        'links' => count($links)
                    ]);
                    break;
                }
                
                $property = $item['property'] ?? '';
                
                // Skip system properties
                if (in_array($property, ['_SKEY', '_MDAT', '_ASK'])) {
                    continue;
                }
                
                if (isset($item['dataitem']) && is_array($item['dataitem'])) {
                    foreach ($item['dataitem'] as $dataItem) {
                        $type = $this->getNodeType($property, $dataItem['type'] ?? null);
                        $itemValue = $dataItem['item'] ?? '';
                        
                        // Sanitize and validate
                        $itemValue = Security::sanitizeInput($itemValue);
                        if (empty($itemValue)) {
                            continue;
                        }
                        
                        // Add node
                        $nodeId = $itemValue;
                        if ($nodeId === $focalNodeId) {
                            $nodeId = $itemValue . '_' . $property;
                        }
                        
                        $node = [
                            'id' => Security::escapeOutput($nodeId),
                            'name' => Security::escapeOutput($this->formatNodeName($nodeId, $type)),
                            'type' => $type,
                        ];
                        
                        if ($type === 'URI') {
                            $node['hlink'] = Security::escapeOutput($itemValue);
                        } elseif ($type === 'Internal Link') {
                            $node['hlink'] = './' . urlencode(explode('#', $itemValue)[0]);
                        }
                        
                        $nodes[] = $node;
                        
                        // Add link
                        $links[] = [
                            'sourceId' => Security::escapeOutput($focalNodeId),
                            'targetId' => Security::escapeOutput($nodeId),
                            'linkName' => Security::escapeOutput($this->formatPropertyName($property))
                        ];
                    }
                }
            }
        }
        
        return [
            'subject' => Security::escapeOutput($focalNodeId),
            'nodes' => $nodes,
            'links' => $links
        ];
    }
    
    /**
     * Get node type name
     * 
     * @param string $property Property name
     * @param int|null $type Type code
     * @return string Type name
     */
    private function getNodeType($property, $type) {
        $typeMap = [
            '_boo' => 'Boolean',
            '_cod' => 'Code',
            '_dat' => 'Date',
            '_ema' => 'Email',
            '_num' => 'Number',
            '_qty' => 'Quantity',
            '_rec' => 'Record',
            '_tem' => 'Temperature',
            '_uri' => 'URI',
            '_wpg' => 'Internal Link',
            '_TEXT' => 'Text',
            '_INST' => 'Category',
            'Monolingual' => 'Monolingual Text',
            'Telephone' => 'Telephone',
        ];
        
        if (isset($typeMap[$property])) {
            return $typeMap[$property];
        }
        
        // Fallback to type code
        $typeCodeMap = [
            1 => 'Number',
            2 => 'Text',
            4 => 'Boolean',
            5 => 'URI',
            6 => 'Date',
            9 => 'Internal Link',
        ];
        
        return $typeCodeMap[$type] ?? 'Unknown Type';
    }
    
    /**
     * Format node name for display
     * 
     * @param string $nodeId Node ID
     * @param string $type Node type
     * @return string Formatted name
     */
    private function formatNodeName($nodeId, $type) {
        if ($type === 'Date') {
            return substr($nodeId, 2);
        }
        
        return str_replace('_', ' ', explode('#', $nodeId)[0]);
    }
    
    /**
     * Format property name for display
     * 
     * @param string $property Property name
     * @return string Formatted name
     */
    private function formatPropertyName($property) {
        $nameMap = [
            '_boo' => 'Boolean',
            '_cod' => 'Code',
            '_dat' => 'Date',
            '_ema' => 'Email',
            '_num' => 'Number',
            '_qty' => 'Quantity',
            '_rec' => 'Record',
            '_tem' => 'Temperature',
            '_uri' => 'URI',
            '_wpg' => 'Internal Link',
            '_TEXT' => 'Text',
            '_INST' => 'isA',
            'Monolingual' => 'Monolingual Text',
            'Telephone' => 'Telephone',
        ];
        
        return $nameMap[$property] ?? str_replace('_', ' ', $property);
    }
    
    /**
     * Get API parameter descriptions
     * 
     * @return array
     */
    public function getAllowedParams() {
        return [
            'action' => [
                ApiBase::PARAM_TYPE => ['getGraph', 'getArticles'],
                ApiBase::PARAM_DEFAULT => 'getGraph',
            ],
            'subject' => [
                ApiBase::PARAM_TYPE => 'string',
                ApiBase::PARAM_REQUIRED => false,
            ],
            'limit' => [
                ApiBase::PARAM_TYPE => 'integer',
                ApiBase::PARAM_DEFAULT => 1000,
                ApiBase::PARAM_MIN => 1,
                ApiBase::PARAM_MAX => 10000,
            ],
            'search' => [
                ApiBase::PARAM_TYPE => 'string',
                ApiBase::PARAM_DEFAULT => '',
            ],
        ];
    }
    
    /**
     * Get API description
     * 
     * @return array
     */
    public function getDescription() {
        return 'API for Semantic MediaWiki Graph extension';
    }
    
    /**
     * Get examples
     * 
     * @return array
     */
    public function getExamples() {
        return [
            'api.php?action=smwgraph&subject=ArticleName' => 'Get graph data for an article',
            'api.php?action=smwgraph&action=getArticles&limit=100' => 'Get list of articles',
        ];
    }
}

