# Security Guide

## Overview
Guida alla sicurezza per Semantic MediaWiki Graph.

## Vulnerabilità Identificate e Risolte

### 1. CORS Aperto
**Problema**: Header `Access-Control-Allow-Origin: *` nel file PHP principale.

**Soluzione**: 
- Rimozione del header globale
- Implementazione di CORS configurable tramite `$wgSemanticMediaWikiGraphAllowedOrigins`
- Validazione degli origin nelle richieste API

### 2. XSS (Cross-Site Scripting)
**Problema**: Output non sanitizzato nei dati dell'API.

**Soluzione**:
- Sanitizzazione di tutti gli output con `htmlspecialchars()`
- Escape di contenuti JSON
- Content Security Policy headers

### 3. CSRF (Cross-Site Request Forgery)
**Problema**: Nessuna protezione CSRF sulle richieste API.

**Soluzione**:
- Token CSRF per tutte le richieste modifica
- Validazione token lato server
- SameSite cookies

### 4. Input Validation
**Problema**: Validazione insufficiente degli input utente.

**Soluzione**:
- Validazione rigorosa di tutti gli input
- Whitelist per valori permessi
- Type checking e sanitizzazione

### 5. Rate Limiting
**Problema**: Nessun rate limiting sulle API.

**Soluzione**:
- Rate limiting configurabile per IP
- Throttling automatico
- Logging di tentativi di abuso

## Best Practices Implementate

1. **Principle of Least Privilege**: L'estensione richiede solo i permessi necessari
2. **Defense in Depth**: Multiple layer di sicurezza
3. **Secure by Default**: Configurazioni sicure di default
4. **Input Validation**: Validazione rigorosa di tutti gli input
5. **Output Encoding**: Encoding corretto di tutti gli output
6. **Error Handling**: Errori non rivelano informazioni sensibili
7. **Logging**: Logging di eventi di sicurezza
8. **Dependency Management**: Dipendenze aggiornate e verificate

## Security Headers

L'estensione implementa i seguenti security headers:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy`: Configurabile

## Audit Logging

Tutti gli eventi di sicurezza vengono loggati:
- Tentativi di accesso non autorizzati
- Violazioni di rate limiting
- Errori di validazione
- Modifiche alla configurazione

## Reporting Vulnerabilità

Per segnalare vulnerabilità di sicurezza, contattare il team di sicurezza seguendo il processo di responsible disclosure.

