<?php
/**
 * Semantic MediaWiki Graph Extension
 * Enterprise Edition
 * 
 * Provides special pages for browsing Semantic MediaWiki links with interactive graph visualization.
 * 
 * @file
 * @ingroup Extensions
 * @author Tobias Weller (original), Enterprise Contributors
 * @license Apache License 2.0
 * @version 2.0.0
 */

// Security: Catch invalid access
if (!defined('MEDIAWIKI')) {
    http_response_code(403);
    header('Content-Type: text/plain');
    echo "This file is no valid access point to MediaWiki.\n";
    echo "Install this Extension by placing:\n";
    echo "wfLoadExtension( 'SemanticMediaWikiGraph' );\n";
    echo "in LocalSettings.php\n";
    exit(1);
}

// Load configuration class
require_once __DIR__ . '/includes/Config.php';

// Initialize configuration with defaults
SemanticMediaWikiGraph\Config::initialize();

// Register extension credits
$wgExtensionCredits[defined('SEMANTIC_EXTENSION_TYPE') ? 'semantic' : 'specialpage'][] = [
    'path' => __FILE__,
    'name' => 'Semantic MediaWiki Graph',
    'author' => [
        '[http://www.aifb.kit.edu/web/Tobias_Weller Tobias Weller] (original)',
        'Enterprise Contributors'
    ],
    'description' => 'Provides special pages for browsing Semantic MediaWiki links with enterprise features.',
    'version' => '2.0.0',
    'license-name' => 'Apache-2.0',
    'url' => 'https://www.mediawiki.org/wiki/Extension:SemanticMediaWiki_Graph',
    'requires' => [
        'MediaWiki' => '>= 1.38.0',
        'PHP' => '>= 7.4.0'
    ]
];

// Register autoloader for classes
$wgAutoloadClasses['SemanticMediaWikiGraph\\Config'] = __DIR__ . '/includes/Config.php';
$wgAutoloadClasses['SemanticMediaWikiGraph\\Logger'] = __DIR__ . '/includes/Logger.php';
$wgAutoloadClasses['SemanticMediaWikiGraph\\Security'] = __DIR__ . '/includes/Security.php';
$wgAutoloadClasses['SemanticMediaWikiGraph\\Cache'] = __DIR__ . '/includes/Cache.php';
$wgAutoloadClasses['SemanticMediaWikiGraph\\Api\\GraphApi'] = __DIR__ . '/includes/Api/GraphApi.php';

// Register special pages
$wgMessagesDirs['SemanticMediaWikiGraph'] = __DIR__ . '/i18n';
$wgExtensionMessagesFiles['SpecialSemanticMediaWikiGraphAlias'] = __DIR__ . '/includes/SpecialSemanticMediaWikiGraph.alias.php';
$wgAutoloadClasses['SpecialSemanticMediaWikiGraph'] = __DIR__ . '/includes/SpecialSemanticMediaWikiGraph.php';
$wgSpecialPages['SemanticMediaWikiGraph'] = 'SpecialSemanticMediaWikiGraph';

// Register API modules
$wgAPIModules['smwgraph'] = 'SemanticMediaWikiGraph\\Api\\GraphApi';

// Register hooks
$wgHooks['BeforePageDisplay'][] = function($out) {
    // Add security headers
    SemanticMediaWikiGraph\Security::addSecurityHeaders($out);
    return true;
};

// Register resource modules with TypeScript build output
$wgResourceModules['ext.SemanticMediaWikiGraph.init'] = [
    'scripts' => [
        'dist/main.js',
    ],
    'dependencies' => [
        'jquery',
        'mediawiki.util',
        'mediawiki.api'
    ],
    'styles' => [
        'includes/css/select2.css',
        'includes/css/screen.css',
    ],
    'localBasePath' => __DIR__,
    'remoteExtPath' => 'SemanticMediaWikiGraph',
    'messages' => [
        'smwgraph-error-invalid-input',
        'smwgraph-error-api-failed',
        'smwgraph-loading',
    ]
];

// Register logging
if (SemanticMediaWikiGraph\Config::get('Debug')) {
    SemanticMediaWikiGraph\Logger::info('Semantic MediaWiki Graph Extension loaded', [
        'version' => '2.0.0',
        'php_version' => PHP_VERSION,
        'mediawiki_version' => $wgVersion ?? 'unknown'
    ]);
}
