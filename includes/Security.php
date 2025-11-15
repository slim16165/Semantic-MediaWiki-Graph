<?php
/**
 * Security utilities for Semantic MediaWiki Graph
 * 
 * @file
 * @ingroup SemanticMediaWikiGraph
 */

namespace SemanticMediaWikiGraph;

/**
 * Security helper class for input validation, output sanitization, and security headers
 */
class Security {
    
    /**
     * Add security headers to output
     * 
     * @param \OutputPage $out OutputPage object
     * @return void
     */
    public static function addSecurityHeaders(\OutputPage $out): void {
        // X-Content-Type-Options
        $out->addHeader('X-Content-Type-Options', 'nosniff');
        
        // X-Frame-Options
        $out->addHeader('X-Frame-Options', 'DENY');
        
        // X-XSS-Protection
        $out->addHeader('X-XSS-Protection', '1; mode=block');
        
        // Content Security Policy
        $csp = self::buildCSP();
        if ($csp) {
            $out->addHeader('Content-Security-Policy', $csp);
        }
        
        // CORS headers (if configured)
        $allowedOrigins = Config::get('AllowedOrigins', []);
        if (!empty($allowedOrigins)) {
            $origin = $_SERVER['HTTP_ORIGIN'] ?? null;
            if ($origin && in_array($origin, $allowedOrigins)) {
                $out->addHeader('Access-Control-Allow-Origin', $origin);
                $out->addHeader('Access-Control-Allow-Credentials', 'true');
            }
        }
    }
    
    /**
     * Build Content Security Policy header
     * 
     * @return string|null
     */
    private static function buildCSP() {
        // Basic CSP - can be customized via config
        $directives = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Needed for D3.js
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data:",
            "font-src 'self' data:",
            "connect-src 'self'",
        ];
        
        return implode('; ', $directives);
    }
    
    /**
     * Sanitize string input
     * 
     * @param string $input Input string
     * @param bool $allowHtml Whether to allow HTML (default: false)
     * @return string Sanitized string
     */
    public static function sanitizeInput(string $input, bool $allowHtml = false): string {
        if (!is_string($input)) {
            return '';
        }
        
        // Trim whitespace
        $input = trim($input);
        
        if ($allowHtml) {
            // Allow HTML but sanitize it
            return htmlspecialchars($input, ENT_QUOTES | ENT_HTML5, 'UTF-8');
        } else {
            // Remove all HTML tags
            return strip_tags($input);
        }
    }
    
    /**
     * Validate wiki article title
     * 
     * @param string $title Article title
     * @return bool True if valid
     */
    public static function validateArticleTitle(string $title): bool {
        if (empty($title) || !is_string($title)) {
            return false;
        }
        
        // Check length
        if (strlen($title) > 255) {
            return false;
        }
        
        // Check for invalid characters
        if (preg_match('/[<>{}|\[\]]/', $title)) {
            return false;
        }
        
        // Additional MediaWiki title validation
        // Titles should not start with colon or contain certain patterns
        if (preg_match('/^[:#]/', $title)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * Escape output for HTML
     * 
     * @param string $output Output string
     * @return string Escaped string
     */
    public static function escapeOutput(string $output): string {
        if (!is_string($output)) {
            return '';
        }
        
        return htmlspecialchars($output, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    }
    
    /**
     * Escape output for JavaScript/JSON
     * 
     * @param mixed $data Data to escape
     * @return string JSON-encoded string
     */
    public static function escapeJson($data) {
        return json_encode($data, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE);
    }
    
    /**
     * Validate CSRF token
     * 
     * @param string $token Token to validate
     * @return bool True if valid
     */
    public static function validateCSRFToken(string $token): bool {
        if (!Config::get('CSRFProtection', true)) {
            return true; // CSRF protection disabled
        }
        
        global $wgUser;
        if (!$wgUser) {
            return false;
        }
        
        // Use MediaWiki's CSRF token system
        if (method_exists($wgUser, 'getEditToken')) {
            $expectedToken = $wgUser->getEditToken();
            return hash_equals($expectedToken, $token);
        }
        
        return false;
    }
    
    /**
     * Rate limiting check
     * 
     * @param string $identifier Identifier (usually IP address)
     * @return bool True if within rate limit
     */
    public static function checkRateLimit(string $identifier): bool {
        $rateLimit = Config::get('RateLimit', 100);
        $cacheKey = 'smwgraph_ratelimit_' . md5($identifier);
        
        $cache = Cache::getInstance();
        $count = $cache->get($cacheKey, 0);
        
        if ($count >= $rateLimit) {
            Logger::warning('Rate limit exceeded', [
                'identifier' => $identifier,
                'count' => $count,
                'limit' => $rateLimit
            ]);
            return false;
        }
        
        // Increment counter
        $cache->set($cacheKey, $count + 1, 60); // 1 minute window
        
        return true;
    }
    
    /**
     * Get client IP address
     * 
     * @return string IP address
     */
    public static function getClientIP(): string {
        $ipKeys = ['HTTP_CF_CONNECTING_IP', 'HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'REMOTE_ADDR'];
        
        foreach ($ipKeys as $key) {
            if (!empty($_SERVER[$key])) {
                $ip = $_SERVER[$key];
                // Handle comma-separated IPs (from proxies)
                if (strpos($ip, ',') !== false) {
                    $ip = trim(explode(',', $ip)[0]);
                }
                // Validate IP
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }
}

