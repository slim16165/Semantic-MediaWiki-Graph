# Semantic MediaWiki Graph - Enterprise Edition

Visualizzazione interattiva di grafi per Semantic MediaWiki con architettura enterprise e TypeScript.

**Documentazione**: Vedi [README-ENTERPRISE.md](README-ENTERPRISE.md) per la documentazione completa.

## Caratteristiche Principali

- **Visualizzazione Interattiva**: Grafi force-directed interattivi con D3.js v7
- **Architettura Enterprise**: Codice PHP modulare con classi separate (Config, Logger, Security, Cache)
- **TypeScript**: Architettura completamente modulare TypeScript con type safety
- **Sicurezza**: CSRF protection, rate limiting, input validation, output sanitization
- **Performance**: Sistema di cache, lazy loading, ottimizzazioni rendering
- **Build System**: Webpack per bundling e ottimizzazione
- **Compatibilità**: MediaWiki >= 1.38.0, PHP >= 7.4.0

## Installazione Rapida

1. **Clona l'estensione** nella cartella `extensions`:
```bash
cd extensions
git clone [repository-url] SemanticMediaWikiGraph
```

2. **Installa dipendenze**:
```bash
cd SemanticMediaWikiGraph
npm install
npm run build
```

3. **Aggiungi a `LocalSettings.php`**:
```php
wfLoadExtension( 'SemanticMediaWikiGraph' );
```

4. **Configurazione opzionale**:
```php
// Performance
$wgSemanticMediaWikiGraphMaxNodes = 500;
$wgSemanticMediaWikiGraphMaxLinks = 1000;

// Security
$wgSemanticMediaWikiGraphCSRFProtection = true;
$wgSemanticMediaWikiGraphRateLimit = 100;
```

## Sviluppo

### Build
```bash
npm run build
```

### Development
```bash
npm run dev  # Con watch mode e hot reload
```

### Testing
```bash
npm test
```

## Architettura

L'estensione usa TypeScript con architettura modulare:

```
includes/js/
├── Bll/                    # Business Logic Layer
├── Model/                   # TypeScript interfaces e types
├── Ui/                      # Componenti UI (Canvas, ForcesManager, ecc.)
├── SemanticMediaWikiApi/    # API wrapper
├── Helpers/                 # Utility functions
└── app.ts                   # Entry point principale
```

Il codice TypeScript viene compilato in `dist/main.js` tramite Webpack.

## Documentazione

- [Architecture](ARCHITECTURE.md) - Architettura del sistema
- [API Documentation](docs/API.md) - Documentazione API
- [Configuration Guide](docs/CONFIGURATION.md) - Guida alla configurazione
- [Security Guide](docs/SECURITY.md) - Guida alla sicurezza

## Link Utili

- [Semantic MediaWiki Graph Extension](https://www.mediawiki.org/wiki/Extension:Semantic_MediaWiki_Graph)
- [D3.js Documentation](https://d3js.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)

## Licenza

Apache License 2.0

## Autori

- Tobias Weller (original author)
- Enterprise Contributors
