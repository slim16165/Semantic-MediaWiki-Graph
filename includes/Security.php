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
        
        // Strict Transport Security (HSTS) - only for HTTPS
        if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
            $out->addHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }
        
        // Referrer Policy
        $out->addHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        
        // Permissions Policy (formerly Feature Policy)
        $out->addHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
        
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
                $out->addHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
                $out->addHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            }
        }
    }
    
    /**
     * Build Content Security Policy header
     * 
     * @return string|null
     */
    private static function buildCSP() {
        // Enhanced CSP with nonce support for inline scripts
        $nonce = self::generateNonce();
        $directives = [
            "default-src 'self'",
            "script-src 'self' 'nonce-{$nonce}' 'unsafe-inline' 'unsafe-eval'", // Needed for D3.js
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "font-src 'self' data:",
            "connect-src 'self'",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ];
        
        return implode('; ', $directives);
    }
    
    /**
     * Generate CSP nonce
     * 
     * @return string Nonce value
     */
    private static function generateNonce(): string {
        if (!isset($GLOBALS['smwgraph_csp_nonce'])) {
            $GLOBALS['smwgraph_csp_nonce'] = base64_encode(random_bytes(16));
        }
        return $GLOBALS['smwgraph_csp_nonce'];
    }
    
    /**
     * Get CSP nonce for inline scripts
     * 
     * @return string Nonce value
     */
    public static function getCSPNonce(): string {
        return self::generateNonce();
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
    
    /**
     * Audit log security event
     * 
     * @param string $event Event type
     * @param array $context Additional context
     * @return void
     */
    public static function auditLog(string $event, array $context = []): void {
        $logData = [
            'event' => $event,
            'timestamp' => date('c'),
            'ip' => self::getClientIP(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'request_uri' => $_SERVER['REQUEST_URI'] ?? 'unknown',
            'context' => $context
        ];
        
        // Log security events
        Logger::warning('Security audit: ' . $event, $logData);
        
        // Store in audit log file (if configured)
        $auditLogFile = Config::get('AuditLogFile', null);
        if ($auditLogFile) {
            $logLine = json_encode($logData) . "\n";
            @file_put_contents($auditLogFile, $logLine, FILE_APPEND | LOCK_EX);
        }
    }
    
    /**
     * Validate and sanitize file upload
     * 
     * @param array $file $_FILES array entry
     * @param array $allowedTypes Allowed MIME types
     * @param int $maxSize Maximum file size in bytes
     * @return array|false Sanitized file info or false on error
     */
    public static function validateFileUpload(array $file, array $allowedTypes = [], int $maxSize = 10485760) {
        // Check for upload errors
        if ($file['error'] !== UPLOAD_ERR_OK) {
            self::auditLog('file_upload_error', ['error_code' => $file['error']]);
            return false;
        }
        
        // Check file size
        if ($file['size'] > $maxSize) {
            self::auditLog('file_upload_size_exceeded', ['size' => $file['size'], 'max' => $maxSize]);
            return false;
        }
        
        // Validate MIME type
        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $file['tmp_name']);
        finfo_close($finfo);
        
        if (!empty($allowedTypes) && !in_array($mimeType, $allowedTypes)) {
            self::auditLog('file_upload_invalid_type', ['type' => $mimeType, 'allowed' => $allowedTypes]);
            return false;
        }
        
        // Sanitize filename
        $filename = self::sanitizeInput(basename($file['name']), false);
        
        return [
            'name' => $filename,
            'type' => $mimeType,
            'size' => $file['size'],
            'tmp_name' => $file['tmp_name']
        ];
    }
}

