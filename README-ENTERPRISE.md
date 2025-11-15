# Semantic MediaWiki Graph - Enterprise Edition

## Overview

Semantic MediaWiki Graph Enterprise Edition è una versione completamente rinnovata dell'estensione originale, progettata per ambienti enterprise con requisiti di sicurezza, performance e scalabilità avanzati.

## Caratteristiche Enterprise

### 🔒 Sicurezza
- **CSRF Protection**: Protezione contro attacchi Cross-Site Request Forgery
- **Rate Limiting**: Limite di richieste configurabile per prevenire abusi
- **Input Validation**: Validazione rigorosa di tutti gli input utente
- **Output Sanitization**: Sanitizzazione di tutti gli output per prevenire XSS
- **Security Headers**: Headers di sicurezza (CSP, X-Frame-Options, etc.)

### ⚡ Performance
- **Caching**: Sistema di cache per migliorare le performance
- **Lazy Loading**: Caricamento lazy per liste di articoli
- **Debouncing**: Ottimizzazione degli eventi di resize
- **Limit Configuration**: Limiti configurabili per nodi e link

### 📊 Monitoring & Logging
- **Structured Logging**: Sistema di logging strutturato con diversi livelli
- **Error Tracking**: Tracciamento completo degli errori
- **Performance Metrics**: Metriche di performance

### 🛠️ Developer Experience
- **Modern JavaScript**: ES6+ con architettura modulare
- **Type Hints**: Type hints completi in PHP
- **PSR Standards**: Codice PHP conforme agli standard PSR
- **Documentation**: Documentazione completa (Architecture, API, Configuration, Security)
- **Build System**: ESLint e Prettier per qualità del codice

## Installazione

### Requisiti
- MediaWiki >= 1.38.0
- PHP >= 7.4.0
- Node.js >= 14.0.0 (per build)
- Semantic MediaWiki installato

### Passi di Installazione

1. **Clona o scarica l'estensione**
```bash
cd extensions
git clone [repository-url] SemanticMediaWikiGraph
```

2. **Installa dipendenze JavaScript**
```bash
cd SemanticMediaWikiGraph
npm install
```

3. **Aggiungi a LocalSettings.php**
```php
wfLoadExtension( 'SemanticMediaWikiGraph' );
```

4. **Configurazione (opzionale)**
```php
// Performance
$wgSemanticMediaWikiGraphMaxNodes = 500;
$wgSemanticMediaWikiGraphMaxLinks = 1000;
$wgSemanticMediaWikiGraphCacheTTL = 3600;

// Security
$wgSemanticMediaWikiGraphCSRFProtection = true;
$wgSemanticMediaWikiGraphRateLimit = 100;

// UI/UX
$wgSemanticMediaWikiGraphDefaultWidth = 1200;
$wgSemanticMediaWikiGraphDefaultHeight = 800;
```

## Configurazione

Vedi [docs/CONFIGURATION.md](docs/CONFIGURATION.md) per la documentazione completa della configurazione.

## API

L'estensione fornisce un endpoint API RESTful:

```
GET /api.php?action=smwgraph&subject=ArticleName
GET /api.php?action=smwgraph&action=getArticles&limit=100
```

Vedi [docs/API.md](docs/API.md) per la documentazione completa dell'API.

## Documentazione

- [Architecture](ARCHITECTURE.md) - Architettura del sistema
- [API Documentation](docs/API.md) - Documentazione API
- [Configuration Guide](docs/CONFIGURATION.md) - Guida alla configurazione
- [Security Guide](docs/SECURITY.md) - Guida alla sicurezza

## Sviluppo

### Build
```bash
npm run build
```

### Linting
```bash
npm run lint
```

### Formatting
```bash
npm run format
```

## Migrazione dalla Versione 1.0

La versione 2.0 è retrocompatibile con la configurazione base, ma introduce nuove funzionalità enterprise. Per migrare:

1. Backup della configurazione esistente
2. Aggiorna l'estensione
3. Installa le dipendenze: `npm install`
4. Verifica la configurazione in LocalSettings.php
5. Testa le funzionalità

## Supporto

Per problemi o domande:
- Issues: [GitHub Issues](https://github.com/...)
- Documentazione: Vedi la cartella `docs/`

## Licenza

Apache License 2.0

## Autori

- Tobias Weller (original author)
- Enterprise Contributors

