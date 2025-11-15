# Configuration Guide

## Overview
Guida completa alla configurazione dell'estensione Semantic MediaWiki Graph.

## Configurazione Base

Aggiungi al tuo `LocalSettings.php`:

```php
wfLoadExtension( 'SemanticMediaWikiGraph' );

// Configurazioni base
$wgSemanticMediaWikiGraphMaxNodes = 500;
$wgSemanticMediaWikiGraphMaxLinks = 1000;
$wgSemanticMediaWikiGraphCacheTTL = 3600;
```

## Opzioni di Configurazione

### Performance

```php
// Numero massimo di nodi nel grafo
$wgSemanticMediaWikiGraphMaxNodes = 500;

// Numero massimo di link nel grafo
$wgSemanticMediaWikiGraphMaxLinks = 1000;

// TTL cache in secondi
$wgSemanticMediaWikiGraphCacheTTL = 3600;

// Abilita lazy loading
$wgSemanticMediaWikiGraphLazyLoad = true;

// Limite paginazione
$wgSemanticMediaWikiGraphPageLimit = 1000;
```

### Sicurezza

```php
// Abilita CSRF protection
$wgSemanticMediaWikiGraphCSRFProtection = true;

// Rate limiting (richieste per minuto)
$wgSemanticMediaWikiGraphRateLimit = 100;

// Domini consentiti per CORS
$wgSemanticMediaWikiGraphAllowedOrigins = ['https://example.com'];
```

### UI/UX

```php
// Colori personalizzati per tipi di nodi
$wgSemanticMediaWikiGraphNodeColors = [
    'Internal Link' => '#1f77b4',
    'Category' => '#071f55',
    'URI' => '#17a8cf',
];

// Dimensioni default del grafo
$wgSemanticMediaWikiGraphDefaultWidth = 1200;
$wgSemanticMediaWikiGraphDefaultHeight = 800;

// Abilita tooltip
$wgSemanticMediaWikiGraphTooltips = true;
```

### Debugging

```php
// Abilita logging dettagliato
$wgSemanticMediaWikiGraphDebug = false;

// Livello di log (debug, info, warning, error)
$wgSemanticMediaWikiGraphLogLevel = 'info';
```

## Variabili d'Ambiente

Supporto per configurazione tramite variabili d'ambiente:

- `SMW_GRAPH_MAX_NODES`: Numero massimo di nodi
- `SMW_GRAPH_CACHE_TTL`: TTL cache
- `SMW_GRAPH_DEBUG`: Abilita debug mode

## Validazione

Tutte le configurazioni vengono validate al caricamento dell'estensione. Errori di configurazione vengono loggati e l'estensione utilizza valori di default sicuri.

