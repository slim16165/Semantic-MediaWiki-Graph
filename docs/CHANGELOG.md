# Changelog

All notable changes to Semantic MediaWiki Graph will be documented in this file.

## [2.0.0] - Enterprise Edition

### Added
- Enterprise-grade configuration system with environment variable support
- Comprehensive security features (CSRF protection, rate limiting, input validation)
- Structured logging system with multiple log levels
- Caching system for improved performance
- RESTful API endpoint (`smwgraph`) with proper error handling
- Internationalization (i18n) support with message system
- Modern JavaScript (ES6+) with modular architecture
- Updated to D3.js v7
- Comprehensive documentation (Architecture, API, Configuration, Security)
- Build system with ESLint and Prettier
- Type hints and PSR standards in PHP code
- Security headers (CSP, X-Frame-Options, etc.)
- Performance optimizations (lazy loading, caching, debouncing)

### Changed
- Upgraded from D3.js v4 to v7
- Removed hardcoded jQuery dependency (now uses MediaWiki's jQuery)
- Modernized JavaScript code to ES6+ standards
- Refactored PHP code with namespaces and proper class structure
- Improved error handling throughout the application
- Enhanced UI/UX with loading states and better error messages
- Updated package.json with proper metadata and build scripts

### Fixed
- Removed insecure CORS header (`Access-Control-Allow-Origin: *`)
- Fixed XSS vulnerabilities with proper output sanitization
- Fixed input validation issues
- Improved error messages and user feedback
- Fixed memory leaks in graph rendering

### Security
- Implemented CSRF protection
- Added rate limiting to prevent abuse
- Sanitized all user inputs
- Escaped all outputs to prevent XSS
- Added security headers
- Removed insecure practices

### Performance
- Implemented caching for API responses
- Added lazy loading for article lists
- Optimized graph rendering
- Added debouncing for resize events
- Limited maximum nodes/links to prevent performance issues

## [1.0.1] - Original Version

### Features
- Basic graph visualization
- D3.js v4 integration
- Select2 for article selection
- Basic semantic data browsing

