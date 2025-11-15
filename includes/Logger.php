<?php
/**
 * Logging system for Semantic MediaWiki Graph
 * 
 * @file
 * @ingroup SemanticMediaWikiGraph
 */

namespace SemanticMediaWikiGraph;

/**
 * Structured logging with different log levels
 */
class Logger {
    
    /**
     * Log levels
     */
    const LEVEL_DEBUG = 'debug';
    const LEVEL_INFO = 'info';
    const LEVEL_WARNING = 'warning';
    const LEVEL_ERROR = 'error';
    
    /**
     * Log a debug message
     * 
     * @param string $message Log message
     * @param array $context Additional context data
     */
    public static function debug($message, array $context = []) {
        self::log(self::LEVEL_DEBUG, $message, $context);
    }
    
    /**
     * Log an info message
     * 
     * @param string $message Log message
     * @param array $context Additional context data
     */
    public static function info($message, array $context = []) {
        self::log(self::LEVEL_INFO, $message, $context);
    }
    
    /**
     * Log a warning message
     * 
     * @param string $message Log message
     * @param array $context Additional context data
     */
    public static function warning($message, array $context = []) {
        self::log(self::LEVEL_WARNING, $message, $context);
    }
    
    /**
     * Log an error message
     * 
     * @param string $message Log message
     * @param array $context Additional context data
     */
    public static function error($message, array $context = []) {
        self::log(self::LEVEL_ERROR, $message, $context);
    }
    
    /**
     * Log a message with specified level
     * 
     * @param string $level Log level
     * @param string $message Log message
     * @param array $context Additional context data
     * @return void
     */
    private static function log(string $level, string $message, array $context = []): void {
        // Check if logging is enabled for this level
        if (!self::shouldLog($level)) {
            return;
        }
        
        // Build log entry
        $logEntry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'level' => strtoupper($level),
            'message' => $message,
            'context' => $context,
            'extension' => 'SemanticMediaWikiGraph',
        ];
        
        // Add user information if available
        global $wgUser;
        if ($wgUser && $wgUser->isLoggedIn()) {
            $logEntry['user'] = $wgUser->getName();
        }
        
        // Add request information
        $logEntry['request_id'] = self::getRequestId();
        
        // Format and write log
        $logLine = self::formatLogEntry($logEntry);
        self::writeLog($logLine, $level);
    }
    
    /**
     * Check if message should be logged based on configured log level
     * 
     * @param string $level Log level to check
     * @return bool
     */
    private static function shouldLog($level) {
        $configuredLevel = strtolower(Config::get('LogLevel', 'info'));
        $debugEnabled = Config::get('Debug', false);
        
        // If debug is enabled, log everything
        if ($debugEnabled) {
            return true;
        }
        
        // Check level hierarchy
        $levels = [
            self::LEVEL_DEBUG => 0,
            self::LEVEL_INFO => 1,
            self::LEVEL_WARNING => 2,
            self::LEVEL_ERROR => 3,
        ];
        
        $configuredValue = $levels[$configuredLevel] ?? 1;
        $messageValue = $levels[$level] ?? 1;
        
        return $messageValue >= $configuredValue;
    }
    
    /**
     * Format log entry as string
     * 
     * @param array $entry Log entry data
     * @return string
     */
    private static function formatLogEntry(array $entry): string {
        $parts = [
            "[{$entry['timestamp']}]",
            "[{$entry['level']}]",
            "[{$entry['extension']}]",
        ];
        
        if (isset($entry['user'])) {
            $parts[] = "[User: {$entry['user']}]";
        }
        
        if (isset($entry['request_id'])) {
            $parts[] = "[Request: {$entry['request_id']}]";
        }
        
        $parts[] = $entry['message'];
        
        if (!empty($entry['context'])) {
            $parts[] = json_encode($entry['context'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }
        
        return implode(' ', $parts) . "\n";
    }
    
    /**
     * Write log entry to appropriate destination
     * 
     * @param string $logLine Formatted log line
     * @param string $level Log level
     * @return void
     */
    private static function writeLog(string $logLine, string $level): void {
        // Use MediaWiki's logging system if available
        if (function_exists('wfDebugLog')) {
            wfDebugLog('SemanticMediaWikiGraph', $logLine);
        } else {
            // Fallback to error_log for errors and warnings
            if (in_array($level, [self::LEVEL_ERROR, self::LEVEL_WARNING])) {
                error_log($logLine);
            }
        }
    }
    
    /**
     * Generate unique request ID
     * 
     * @return string
     */
    private static function getRequestId(): string {
        static $requestId = null;
        
        if ($requestId === null) {
            $requestId = substr(md5(uniqid('', true)), 0, 8);
        }
        
        return $requestId;
    }
}

