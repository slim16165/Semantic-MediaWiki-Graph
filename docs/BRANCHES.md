# Branch Documentation

Questo documento descrive tutte le branch attive del repository Semantic MediaWiki Graph.

## Branch Principali

### `main`
**Branch principale di produzione**

- **Tecnologie**: JavaScript vanilla (ES6+), D3.js v7, PHP 7.4+
- **Stato**: Stabile, in produzione
- **Caratteristiche**:
  - Architettura enterprise con classi PHP modulari (Config, Logger, Security, Cache)
  - JavaScript vanilla senza dipendenze npm/TypeScript
  - Compatibile con MediaWiki ResourceLoader
  - Gestione errori migliorata (no alert(), error handling robusto)
  - Event handling corretto ($(document).ready, event.preventDefault)
  - Documentazione completa (API, Configuration, Security)

**Quando usare**: Per deployment in produzione senza dipendenze Node.js/TypeScript.

---

### `migration-to-ts`
**Versione TypeScript con architettura modulare**

- **Tecnologie**: TypeScript, D3.js v7, Webpack, npm
- **Stato**: Sviluppo avanzato, tag `v2-alpha`
- **Caratteristiche**:
  - Architettura completamente modulare TypeScript
  - Separazione responsabilità (BLL, Model, UI, API)
  - Type safety completo
  - Build system con Webpack
  - Componenti separati: ForcesManager, LinkManager, Canvas, NodeManager, LegendManager
  - API wrapper TypeScript per Semantic MediaWiki
  - Test framework incluso

**Struttura**:
```
includes/js/
├── Bll/                    # Business Logic Layer
├── Model/                   # TypeScript interfaces e types
├── Ui/                      # Componenti UI (Canvas, ForcesManager, ecc.)
├── SemanticMediaWikiApi/    # API wrapper
├── Helpers/                 # Utility functions
└── app.ts                   # Entry point principale
```

**Quando usare**: Per sviluppo futuro con TypeScript, quando si vuole un'architettura più moderna e type-safe.

---

## Branch di Supporto

### `no_ts_no_npm`
**Branch di riferimento per fix e miglioramenti**

- **Stato**: Branch di riferimento, fix mergiati in `main`
- **Contenuto**: Fix utili applicati:
  - Workaround bug D3 v2 transition()
  - Fix window.onload → $(document).ready
  - Rimozione alert() → gestione errori migliorata
  - Fix colorScale API per D3 v7
  - Miglioramenti codice (===, rimozione console.log)

**Nota**: I fix di questa branch sono stati mergiati in `main`. La branch può essere mantenuta come riferimento storico.

---

## Branch Eliminate

Le seguenti branch sono state eliminate perché obsolete o già integrate:

- `try-observablehq-version` - Già mergeata in `migration-to-ts` (PR #5)
- `dependabot/npm_and_yarn/d3-7.8.4` - Obsoleta (main ha già D3 7.8.5)
- `dependabot/npm_and_yarn/typescript-5.0.4` - Solo utile per migration-to-ts
- `D3_v3` - Non necessaria (main usa D3 v7, nessun requisito di retrocompatibilità)

---

## Strategia di Sviluppo

### Per Main (JavaScript Vanilla)
1. Mantenere compatibilità con MediaWiki ResourceLoader
2. Non introdurre dipendenze npm/TypeScript
3. Migliorare codice ES6+ mantenendo compatibilità
4. Aggiungere JSDoc per documentazione
5. Refactoring modulare senza build system

### Per Migration-to-TS
1. Completare architettura modulare
2. Aggiungere test completi
3. Migliorare type safety
4. Ottimizzare build system
5. Preparare per merge futuro in main (quando TypeScript sarà standard)

---

## Migrazione tra Branch

### Da `main` a `migration-to-ts`
La migrazione richiede:
- Installazione dipendenze npm (`npm install`)
- Build del progetto (`npm run build`)
- Configurazione TypeScript
- Verifica compatibilità API

### Da `migration-to-ts` a `main`
Non raccomandato - `main` è la versione stabile senza TypeScript.

---

## Tag e Versioni

- `v1.0.1` - Versione originale
- `v2-alpha` - Tag su `migration-to-ts`, versione TypeScript in sviluppo

---

## Note per Sviluppatori

- **Main**: Usa per produzione, deployment semplice, nessuna dipendenza Node.js
- **Migration-to-TS**: Usa per sviluppo futuro, architettura moderna, type safety
- **No_TS_No_NPM**: Riferimento storico, fix già integrati

Per domande o chiarimenti, consultare la documentazione principale in `README.md` e `ARCHITECTURE.md`.

