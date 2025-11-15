# Semantic MediaWiki Graph - Enterprise Edition

Visualizzazione interattiva di grafi per Semantic MediaWiki con architettura enterprise.

**Documentazione**: Vedi [README-ENTERPRISE.md](README-ENTERPRISE.md) per la documentazione completa.

## Caratteristiche Principali

- **Visualizzazione Interattiva**: Grafi force-directed interattivi con D3.js v7
- **Architettura Enterprise**: Codice PHP modulare con classi separate (Config, Logger, Security, Cache)
- **Sicurezza**: CSRF protection, rate limiting, input validation, output sanitization
- **Performance**: Sistema di cache, lazy loading, ottimizzazioni rendering
- **JavaScript Vanilla**: Nessuna dipendenza npm/TypeScript su main branch
- **Compatibilità**: MediaWiki >= 1.38.0, PHP >= 7.4.0

## Installazione Rapida

1. Clona l'estensione nella cartella `extensions`:
```bash
cd extensions
git clone [repository-url] SemanticMediaWikiGraph
```

2. Aggiungi a `LocalSettings.php`:
```php
wfLoadExtension( 'SemanticMediaWikiGraph' );
```

3. Configurazione opzionale:
```php
// Performance
$wgSemanticMediaWikiGraphMaxNodes = 500;
$wgSemanticMediaWikiGraphMaxLinks = 1000;

// Security
$wgSemanticMediaWikiGraphCSRFProtection = true;
$wgSemanticMediaWikiGraphRateLimit = 100;
```

## Branch Disponibili

- **`main`**: Branch principale, JavaScript vanilla, produzione-ready
- **`migration-to-ts`**: Versione TypeScript con architettura modulare (sviluppo)

Vedi [docs/BRANCHES.md](docs/BRANCHES.md) per dettagli completi.

## Documentazione

- [Architecture](ARCHITECTURE.md) - Architettura del sistema
- [API Documentation](docs/API.md) - Documentazione API
- [Configuration Guide](docs/CONFIGURATION.md) - Guida alla configurazione
- [Security Guide](docs/SECURITY.md) - Guida alla sicurezza
- [Branches](docs/BRANCHES.md) - Documentazione branch

## Link Utili

- [Semantic MediaWiki Graph Extension](https://www.mediawiki.org/wiki/Extension:Semantic_MediaWiki_Graph)
- [D3.js Documentation](https://d3js.org/)

## Licenza

Apache License 2.0

## Autori

- Tobias Weller (original author)
- Enterprise Contributors
