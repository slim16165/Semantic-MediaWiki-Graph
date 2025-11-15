// Jest setup file for testing environment

// Mock MediaWiki globals
global.mw = {
  util: {
    wikiScript: (script) => `/wiki/${script}.php`,
    getUrl: (title) => `/wiki/${title}`,
  },
  config: {
    get: (key) => {
      const config = {
        'wgScriptPath': '/wiki',
        'wgServer': 'https://example.com',
      };
      return config[key];
    },
  },
  message: (key) => key,
};

// Mock jQuery
global.$ = global.jQuery = require('jquery');

// Mock D3
global.d3 = require('d3');

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

