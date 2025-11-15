# Semantic MediaWiki Graph API Documentation

## Overview
API endpoints per l'estensione Semantic MediaWiki Graph.

## Endpoints

### GET /api.php?action=browsebysubject

Recupera i dati semantici per un soggetto specifico.

**Parameters:**
- `subject` (string, required): Nome dell'articolo wiki
- `format` (string, default: 'json'): Formato di risposta

**Response:**
```json
{
  "query": {
    "subject": "ArticleName",
    "data": [
      {
        "property": "PropertyName",
        "dataitem": [
          {
            "item": "Value",
            "type": 9
          }
        ]
      }
    ]
  }
}
```

### GET /api.php?action=query&list=allpages

Recupera la lista di tutti gli articoli disponibili.

**Parameters:**
- `aplimit` (integer, default: 1000): Numero massimo di risultati
- `format` (string, default: 'json'): Formato di risposta

**Response:**
```json
{
  "query": {
    "allpages": [
      {
        "title": "ArticleName"
      }
    ]
  }
}
```

## Rate Limiting

- Default: 100 richieste per minuto per IP
- Configurabile tramite `$wgSemanticMediaWikiGraphRateLimit`

## Error Handling

Tutti gli endpoint restituiscono errori nel formato:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "info": "Error message"
  }
}
```

## Versioning

API versioning supportato tramite parametro `version` (default: v1).

