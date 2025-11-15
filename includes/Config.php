<?php
/**
 * Configuration management for Semantic MediaWiki Graph
 * 
 * @file
 * @ingroup SemanticMediaWikiGraph
 */

namespace SemanticMediaWikiGraph;

/**
 * Configuration manager with validation and defaults
 */
class Config {
    
    /**
     * Default configuration values
     * 
     * @var array
     */
    private static $defaults = [
        // Performance
        'MaxNodes' => 500,
        'MaxLinks' => 1000,
        'CacheTTL' => 3600,
        'LazyLoad' => true,
        'PageLimit' => 1000,
        
        // Security
        'CSRFProtection' => true,
        'RateLimit' => 100,
        'AllowedOrigins' => [],
        
        // UI/UX
        'DefaultWidth' => 1200,
        'DefaultHeight' => 800,
        'Tooltips' => true,
        'NodeColors' => [
            'Internal Link' => '#1f77b4',
            'Category' => '#071f55',
            'URI' => '#17a8cf',
            'Telephone' => '#13d1e3',
            'Email' => '#75d3dd',
            'Number' => '#2ca02c',
            'Quantity' => '#114911',
            'Temperature' => '#b6e75a',
            'Monolingual Text' => '#f2cd0c',
            'Text' => '#ff7f0e',
            'Code' => '#b37845',
            'Boolean' => '#d62728',
            'Date' => '#d62790',
            'Record' => '#8927d6',
        ],
        
        // Debugging
        'Debug' => false,
        'LogLevel' => 'info',
    ];
    
    /**
     * Configuration cache
     * 
     * @var array
     */
    private static $config = [];
    
    /**
     * Initialize configuration
     * Loads from global variables and environment variables
     */
    public static function initialize() {
        global $wgSemanticMediaWikiGraphMaxNodes,
               $wgSemanticMediaWikiGraphMaxLinks,
               $wgSemanticMediaWikiGraphCacheTTL,
               $wgSemanticMediaWikiGraphLazyLoad,
               $wgSemanticMediaWikiGraphPageLimit,
               $wgSemanticMediaWikiGraphCSRFProtection,
               $wgSemanticMediaWikiGraphRateLimit,
               $wgSemanticMediaWikiGraphAllowedOrigins,
               $wgSemanticMediaWikiGraphDefaultWidth,
               $wgSemanticMediaWikiGraphDefaultHeight,
               $wgSemanticMediaWikiGraphTooltips,
               $wgSemanticMediaWikiGraphNodeColors,
               $wgSemanticMediaWikiGraphDebug,
               $wgSemanticMediaWikiGraphLogLevel;
        
        // Load from globals with fallback to defaults
        self::$config = [
            'MaxNodes' => $wgSemanticMediaWikiGraphMaxNodes ?? self::getEnv('SMW_GRAPH_MAX_NODES', self::$defaults['MaxNodes']),
            'MaxLinks' => $wgSemanticMediaWikiGraphMaxLinks ?? self::getEnv('SMW_GRAPH_MAX_LINKS', self::$defaults['MaxLinks']),
            'CacheTTL' => $wgSemanticMediaWikiGraphCacheTTL ?? self::getEnv('SMW_GRAPH_CACHE_TTL', self::$defaults['CacheTTL']),
            'LazyLoad' => $wgSemanticMediaWikiGraphLazyLoad ?? self::getEnv('SMW_GRAPH_LAZY_LOAD', self::$defaults['LazyLoad']),
            'PageLimit' => $wgSemanticMediaWikiGraphPageLimit ?? self::getEnv('SMW_GRAPH_PAGE_LIMIT', self::$defaults['PageLimit']),
            'CSRFProtection' => $wgSemanticMediaWikiGraphCSRFProtection ?? self::getEnv('SMW_GRAPH_CSRF_PROTECTION', self::$defaults['CSRFProtection']),
            'RateLimit' => $wgSemanticMediaWikiGraphRateLimit ?? self::getEnv('SMW_GRAPH_RATE_LIMIT', self::$defaults['RateLimit']),
            'AllowedOrigins' => $wgSemanticMediaWikiGraphAllowedOrigins ?? self::parseEnvArray('SMW_GRAPH_ALLOWED_ORIGINS', self::$defaults['AllowedOrigins']),
            'DefaultWidth' => $wgSemanticMediaWikiGraphDefaultWidth ?? self::getEnv('SMW_GRAPH_DEFAULT_WIDTH', self::$defaults['DefaultWidth']),
            'DefaultHeight' => $wgSemanticMediaWikiGraphDefaultHeight ?? self::getEnv('SMW_GRAPH_DEFAULT_HEIGHT', self::$defaults['DefaultHeight']),
            'Tooltips' => $wgSemanticMediaWikiGraphTooltips ?? self::getEnv('SMW_GRAPH_TOOLTIPS', self::$defaults['Tooltips']),
            'NodeColors' => array_merge(self::$defaults['NodeColors'], $wgSemanticMediaWikiGraphNodeColors ?? []),
            'Debug' => $wgSemanticMediaWikiGraphDebug ?? self::getEnv('SMW_GRAPH_DEBUG', self::$defaults['Debug']),
            'LogLevel' => $wgSemanticMediaWikiGraphLogLevel ?? self::getEnv('SMW_GRAPH_LOG_LEVEL', self::$defaults['LogLevel']),
        ];
        
        // Validate configuration
        self::validate();
    }
    
    /**
     * Get configuration value
     * 
     * @param string $key Configuration key
     * @param mixed $default Default value if key not found
     * @return mixed
     */
    public static function get($key, $default = null) {
        if (empty(self::$config)) {
            self::initialize();
        }
        
        return self::$config[$key] ?? $default ?? self::$defaults[$key] ?? null;
    }
    
    /**
     * Set configuration value (runtime only)
     * 
     * @param string $key Configuration key
     * @param mixed $value Value to set
     */
    public static function set($key, $value) {
        self::$config[$key] = $value;
    }
    
    /**
     * Get all configuration
     * 
     * @return array
     */
    public static function getAll() {
        if (empty(self::$config)) {
            self::initialize();
        }
        
        return self::$config;
    }
    
    /**
     * Validate configuration values
     * 
     * @throws \InvalidArgumentException
     */
    private static function validate() {
        // Validate numeric values
        $numericKeys = ['MaxNodes', 'MaxLinks', 'CacheTTL', 'PageLimit', 'RateLimit', 'DefaultWidth', 'DefaultHeight'];
        foreach ($numericKeys as $key) {
            $value = self::$config[$key];
            if (!is_numeric($value) || $value < 0) {
                Logger::warning("Invalid configuration value for {$key}: {$value}, using default");
                self::$config[$key] = self::$defaults[$key];
            }
        }
        
        // Validate boolean values
        $booleanKeys = ['LazyLoad', 'CSRFProtection', 'Tooltips', 'Debug'];
        foreach ($booleanKeys as $key) {
            if (!is_bool(self::$config[$key])) {
                self::$config[$key] = (bool)self::$config[$key];
            }
        }
        
        // Validate LogLevel
        $validLogLevels = ['debug', 'info', 'warning', 'error'];
        if (!in_array(strtolower(self::$config['LogLevel']), $validLogLevels)) {
            Logger::warning("Invalid LogLevel: " . self::$config['LogLevel'] . ", using default");
            self::$config['LogLevel'] = self::$defaults['LogLevel'];
        }
    }
    
    /**
     * Get environment variable with fallback
     * 
     * @param string $name Environment variable name
     * @param mixed $default Default value
     * @return mixed
     */
    private static function getEnv($name, $default = null) {
        $value = getenv($name);
        if ($value === false) {
            return $default;
        }
        
        // Convert string booleans
        if (strtolower($value) === 'true') {
            return true;
        }
        if (strtolower($value) === 'false') {
            return false;
        }
        
        // Convert numeric strings
        if (is_numeric($value)) {
            return $value + 0; // Convert to int or float
        }
        
        return $value;
    }
    
    /**
     * Parse comma-separated environment variable into array
     * 
     * @param string $name Environment variable name
     * @param array $default Default array
     * @return array
     */
    private static function parseEnvArray($name, $default = []) {
        $value = getenv($name);
        if ($value === false) {
            return $default;
        }
        
        return array_map('trim', explode(',', $value));
    }
}

