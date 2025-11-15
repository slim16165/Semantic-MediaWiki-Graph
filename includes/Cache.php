<?php
/**
 * Caching system for Semantic MediaWiki Graph
 * 
 * @file
 * @ingroup SemanticMediaWikiGraph
 */

namespace SemanticMediaWikiGraph;

/**
 * Simple cache wrapper using MediaWiki's caching or in-memory fallback
 */
class Cache {
    
    /**
     * Cache instance
     * 
     * @var \BagOStuff|null
     */
    private static $cache = null;
    
    /**
     * In-memory cache fallback
     * 
     * @var array
     */
    private static $memoryCache = [];
    
    /**
     * Get cache instance
     * 
     * @return \BagOStuff|object Cache instance
     */
    public static function getInstance() {
        if (self::$cache === null) {
            // Try to use MediaWiki's cache
            if (class_exists('\ObjectCache')) {
                try {
                    self::$cache = \ObjectCache::getInstance(\CACHE_ANYTHING);
                } catch (\Exception $e) {
                    Logger::warning('Failed to initialize MediaWiki cache, using memory cache', [
                        'error' => $e->getMessage()
                    ]);
                    self::$cache = new self();
                }
            } else {
                // Fallback to in-memory cache
                self::$cache = new self();
            }
        }
        
        return self::$cache;
    }
    
    /**
     * Get value from cache
     * 
     * @param string $key Cache key
     * @param mixed $default Default value if key not found
     * @return mixed
     */
    public function get($key, $default = null) {
        // If using MediaWiki cache
        if ($this !== self::$cache && method_exists($this, 'get')) {
            $value = parent::get($key);
            if ($value !== false) {
                return $value;
            }
            return $default;
        }
        
        // In-memory cache fallback
        if (isset(self::$memoryCache[$key])) {
            $entry = self::$memoryCache[$key];
            if ($entry['expires'] > time()) {
                return $entry['value'];
            }
            unset(self::$memoryCache[$key]);
        }
        
        return $default;
    }
    
    /**
     * Set value in cache
     * 
     * @param string $key Cache key
     * @param mixed $value Value to cache
     * @param int $ttl Time to live in seconds
     * @return bool Success
     */
    public function set($key, $value, $ttl = 3600) {
        // If using MediaWiki cache
        if ($this !== self::$cache && method_exists($this, 'set')) {
            return parent::set($key, $value, $ttl);
        }
        
        // In-memory cache fallback
        self::$memoryCache[$key] = [
            'value' => $value,
            'expires' => time() + $ttl
        ];
        
        // Limit memory cache size
        if (count(self::$memoryCache) > 1000) {
            // Remove oldest entries
            uasort(self::$memoryCache, function($a, $b) {
                return $a['expires'] - $b['expires'];
            });
            self::$memoryCache = array_slice(self::$memoryCache, 0, 500, true);
        }
        
        return true;
    }
    
    /**
     * Delete value from cache
     * 
     * @param string $key Cache key
     * @return bool Success
     */
    public function delete($key) {
        // If using MediaWiki cache
        if ($this !== self::$cache && method_exists($this, 'delete')) {
            return parent::delete($key);
        }
        
        // In-memory cache fallback
        unset(self::$memoryCache[$key]);
        return true;
    }
    
    /**
     * Clear all cache
     * 
     * @return bool Success
     */
    public function clear() {
        // If using MediaWiki cache
        if ($this !== self::$cache && method_exists($this, 'clear')) {
            return parent::clear();
        }
        
        // In-memory cache fallback
        self::$memoryCache = [];
        return true;
    }
}

