# Semantic MediaWiki Graph - Enterprise Architecture

## Overview
Semantic MediaWiki Graph è un'estensione MediaWiki che visualizza graficamente le relazioni semantiche tra articoli utilizzando visualizzazioni interattive basate su D3.js.

## Architettura del Sistema

### Componenti Principali

1. **Backend (PHP)**
   - `SemanticMediaWikiGraph.php`: Entry point dell'estensione
   - `SpecialSemanticMediaWikiGraph.php`: Special page handler
   - API endpoints per dati semantici

2. **Frontend (JavaScript)**
   - `app.js`: Logica principale dell'applicazione
   - `utility.js`: Funzioni di utilità e rendering grafico
   - D3.js v7: Visualizzazione grafica
   - Select2: Selezione articoli

3. **Styling (CSS)**
   - `screen.css`: Stili principali
   - `select2.css`: Stili per Select2

## Flusso dei Dati

1. Utente seleziona un articolo dalla dropdown
2. Frontend invia richiesta AJAX all'API MediaWiki (`browsebysubject`)
3. Backend recupera dati semantici dall'API
4. Frontend processa i dati e costruisce il grafo
5. D3.js renderizza la visualizzazione interattiva

## Design Patterns

- **MVC Pattern**: Separazione tra logica (PHP), presentazione (HTML/CSS), e interazione (JavaScript)
- **Module Pattern**: JavaScript organizzato in moduli
- **Factory Pattern**: Creazione dinamica di nodi e link

## Sicurezza

- Sanitizzazione di tutti gli input utente
- Validazione lato server
- Protezione CSRF
- Escape di output per prevenire XSS
- Rate limiting su API endpoints

## Performance

- Caching dei risultati API
- Lazy loading per grandi dataset
- Debouncing per ricerche
- Virtualizzazione per liste lunghe
- Ottimizzazione rendering D3.js

## Scalabilità

- Supporto per grafi di grandi dimensioni
- Paginazione dei risultati
- Configurazione per limiti di nodi/link
- Web Workers per processing pesante

## Estensibilità

- Plugin system per nuovi tipi di nodi
- API pubblica per integrazioni
- Hook system per customizzazioni
- Template system per visualizzazioni

