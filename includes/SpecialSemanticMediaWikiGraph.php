<?php
/**
 * Special page for Semantic MediaWiki Graph visualization
 * 
 * @file
 * @ingroup SemanticMediaWikiGraph
 */

use SemanticMediaWikiGraph\Config;
use SemanticMediaWikiGraph\Security;
use MediaWiki\Html\Html;

/**
 * Special page implementation
 */
class SpecialSemanticMediaWikiGraph extends SpecialPage {
    
    /**
     * Constructor
     */
    public function __construct() {
        parent::__construct('SemanticMediaWikiGraph');
    }
    
    /**
     * Get group name for special page
     * 
     * @return string
     */
    public function getGroupName(): string {
        return 'smw_group';
    }
    
    /**
     * Execute special page
     * 
     * @param string|null $par Subpage parameter
     */
    public function execute($par) {
        $request = $this->getRequest();
        $out = $this->getOutput();
        
        $this->setHeaders();
        $this->outputHeader();
        
        // Add required modules
        $out->addModules(['ext.SemanticMediaWikiGraph.init']);
        
        // Get configuration values for JavaScript
        $config = [
            'maxNodes' => Config::get('MaxNodes', 500),
            'maxLinks' => Config::get('MaxLinks', 1000),
            'defaultWidth' => Config::get('DefaultWidth', 1200),
            'defaultHeight' => Config::get('DefaultHeight', 800),
            'tooltips' => Config::get('Tooltips', true),
            'nodeColors' => Config::get('NodeColors', []),
            'apiUrl' => $this->getConfig()->get('ScriptPath') . '/api.php',
        ];
        
        // Inject configuration into page
        $out->addInlineScript(
            'window.SMWGraphConfig = ' . Security::escapeJson($config) . ';'
        );
        
        // Build HTML
        $html = $this->buildHTML();
        $out->addHTML($html);
    }
    
    /**
     * Build HTML content
     * 
     * @return string HTML content
     */
    private function buildHTML(): string {
        $defaultHeight = Config::get('DefaultHeight', 800);
        
        return Html::rawElement('div', ['class' => 'smwgraph-container'],
            Html::rawElement('div', ['class' => 'smwgraph-form-wrapper'],
                Html::rawElement('section', ['class' => 'smwgraph-form-section'],
                    Html::rawElement('article', [],
                        Html::rawElement('form', [
                            'id' => 'smwgraph-form',
                            'class' => 'smwgraph-form'
                        ],
                            Html::rawElement('div', ['class' => 'smwgraph-form-group'],
                                Html::rawElement('label', [
                                    'for' => 'wikiArticle',
                                    'class' => 'smwgraph-label'
                                ],
                                    $this->msg('smwgraph-article-label')->text() .
                                    Html::rawElement('span', ['class' => 'smwgraph-required'], '*')
                                ) .
                                Html::rawElement('select', [
                                    'id' => 'wikiArticle',
                                    'class' => 'select2-input smwgraph-select',
                                    'name' => 'article'
                                ],
                                    Html::rawElement('option', ['value' => ''], '')
                                )
                            ) .
                            Html::rawElement('div', ['class' => 'smwgraph-form-actions'],
                                Html::rawElement('button', [
                                    'type' => 'submit',
                                    'id' => 'visualiseSite',
                                    'class' => 'smwgraph-button smwgraph-button-primary'
                                ],
                                    $this->msg('smwgraph-submit-button')->text()
                                ) .
                                Html::rawElement('span', [
                                    'id' => 'error_msg',
                                    'class' => 'smwgraph-error',
                                    'style' => 'display:none'
                                ],
                                    $this->msg('smwgraph-error-missing-article')->text()
                                )
                            ) .
                            Html::rawElement('div', [
                                'id' => 'loading_indicator',
                                'class' => 'smwgraph-loading',
                                'style' => 'display:none'
                            ],
                                Html::rawElement('span', ['class' => 'smwgraph-spinner'], '') .
                                $this->msg('smwgraph-loading')->text()
                            )
                        )
                    )
                )
            ) .
            Html::rawElement('div', [
                'id' => 'cluster_chart',
                'class' => 'smwgraph-chart-wrapper'
            ],
                Html::rawElement('div', [
                    'class' => 'chart smwgraph-chart',
                    'style' => 'height:' . $defaultHeight . 'px'
                ], '')
            )
        );
    }
}
