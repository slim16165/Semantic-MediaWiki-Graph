/**
 * Semantic MediaWiki Graph - Enterprise Edition
 * Main application logic
 * 
 * @file
 * @version 2.0.0
 */

(function() {
    'use strict';

    // Configuration from server
    const config = window.SMWGraphConfig || {
        maxNodes: 500,
        maxLinks: 1000,
        defaultWidth: 1200,
        defaultHeight: 800,
        tooltips: true,
        nodeColors: {},
        apiUrl: '/api.php'
    };

    // State management
    const state = {
        nodeSet: [],
        linkSet: [],
        invisibleNode: [],
        invisibleEdge: [],
        invisibleType: [],
        done: [],
        focalNodeID: '',
        force: null,
        select2Instance: null
    };

    // Color mapping
    const defaultColors = {
        'Internal Link': '#1f77b4',
        'Category': '#071f55',
        'URI': '#17a8cf',
        'Telephone': '#13d1e3',
        'Email': '#75d3dd',
        'Number': '#2ca02c',
        'Quantity': '#114911',
        'Temperature': '#b6e75a',
        'Monolingual Text': '#f2cd0c',
        'Text': '#ff7f0e',
        'Code': '#b37845',
        'Boolean': '#d62728',
        'Date': '#d62790',
        'Record': '#8927d6'
    };

    const nodeColors = Object.assign({}, defaultColors, config.nodeColors || {});

    /**
     * Initialize application
     */
    function init() {
        setupEventListeners();
        loadWikiArticles();
        initializeSelect2();
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        const form = document.getElementById('smwgraph-form');
        const submitButton = document.getElementById('visualiseSite');

        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }

        if (submitButton) {
            submitButton.addEventListener('click', handleSubmit);
        }

        // Window resize handler
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(handleResize, 250);
        });
    }

    /**
     * Handle form submission
     */
    function handleFormSubmit(e) {
        e.preventDefault();
        handleSubmit();
    }

    /**
     * Handle submit button click
     */
    function handleSubmit() {
        const articleSelect = document.getElementById('wikiArticle');
        const errorMsg = document.getElementById('error_msg');
        const loadingIndicator = document.getElementById('loading_indicator');

        if (!articleSelect || !articleSelect.value) {
            if (errorMsg) {
                errorMsg.style.display = 'inline';
            }
            return;
        }

        if (errorMsg) {
            errorMsg.style.display = 'none';
        }

        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
        }

        exec(articleSelect.value);
    }

    /**
     * Handle window resize
     */
    function handleResize() {
        if (state.force) {
            const chart = document.querySelector('.chart');
            if (chart) {
                const width = chart.clientWidth;
                const height = chart.clientHeight;
                state.force.size([width, height]);
                state.force.restart();
            }
        }
    }

    /**
     * Initialize Select2 dropdown
     */
    function initializeSelect2() {
        const articleSelect = document.getElementById('wikiArticle');
        if (articleSelect && typeof jQuery !== 'undefined' && jQuery.fn.select2) {
            state.select2Instance = jQuery(articleSelect).select2({
                placeholder: mw.msg('smwgraph-article-label') || 'Select a Wiki Article',
                allowClear: true,
                width: '100%'
            });
        }
    }

    /**
     * Load wiki articles list
     */
    function loadWikiArticles() {
        const articleSelect = document.getElementById('wikiArticle');
        if (!articleSelect) {
            return;
        }

        const api = new mw.Api();
        api.get({
            action: 'smwgraph',
            action: 'getArticles',
            limit: config.pageLimit || 1000,
            format: 'json'
        }).done(function(data) {
            if (data && data.query && data.query.allpages) {
                const pages = data.query.allpages;
                pages.forEach(function(page) {
                    const option = document.createElement('option');
                    option.value = page.title;
                    option.textContent = page.title;
                    articleSelect.appendChild(option);
                });

                // Reinitialize Select2 if needed
                if (state.select2Instance) {
                    jQuery(articleSelect).trigger('change');
                }
            }
        }).fail(function(error) {
            console.error('Failed to load articles:', error);
            showError(mw.msg('smwgraph-error-api-failed') || 'Failed to load articles');
        });
    }

    /**
     * Execute graph visualization
     */
    function exec(wikiArticle) {
        if (!wikiArticle) {
            return;
        }

        // Reset state
        state.done = [];
        state.nodeSet = [];
        state.linkSet = [];
        state.invisibleNode = [];
        state.invisibleEdge = [];
        state.invisibleType = [];

        const api = new mw.Api();
        api.get({
            action: 'smwgraph',
            subject: wikiArticle,
            format: 'json'
        }).done(function(data) {
            hideLoading();
            if (data && data.query) {
                processGraphData(data.query, wikiArticle);
            } else {
                showError(mw.msg('smwgraph-no-data') || 'No data available');
            }
        }).fail(function(error) {
            hideLoading();
            console.error('API error:', error);
            showError(mw.msg('smwgraph-error-api-failed') || 'Failed to fetch data');
        });
    }

    /**
     * Process graph data from API
     */
    function processGraphData(data, wikiArticle) {
        state.done.push(wikiArticle);

        // Add focal node
        const focalNodeId = data.subject || wikiArticle;
        state.focalNodeID = focalNodeId;

        state.nodeSet.push({
            id: focalNodeId,
            name: focalNodeId.split('#')[0].replace(/_/g, ' '),
            type: 'Internal Link',
            fixed: true,
            x: 0,
            y: 0,
            hlink: './' + focalNodeId.split('#')[0]
        });

        // Process nodes and links
        if (data.nodes && Array.isArray(data.nodes)) {
            data.nodes.forEach(function(node) {
                if (state.nodeSet.length < config.maxNodes) {
                    state.nodeSet.push(node);
                }
            });
        }

        if (data.links && Array.isArray(data.links)) {
            data.links.forEach(function(link) {
                if (state.linkSet.length < config.maxLinks) {
                    state.linkSet.push(link);
                }
            });
        }

        // Draw graph
        const chartElement = document.querySelector('#cluster_chart .chart');
        if (chartElement) {
            chartElement.innerHTML = '';
            drawCluster('Drawing1', state.focalNodeID, state.nodeSet, state.linkSet, '#cluster_chart .chart', 'colorScale20');
            
            // Center focal node
            const focalNodeElement = document.querySelector(`[id="${state.focalNodeID}"]`);
            if (focalNodeElement && focalNodeElement.__data__) {
                const chart = document.querySelector('.chart');
                if (chart) {
                    focalNodeElement.__data__.px = chart.clientWidth / 2;
                    focalNodeElement.__data__.py = chart.clientHeight / 2;
                }
            }
        }
    }

    /**
     * Show error message
     */
    function showError(message) {
        const errorMsg = document.getElementById('error_msg');
        if (errorMsg) {
            errorMsg.textContent = message;
            errorMsg.style.display = 'inline';
        }
    }

    /**
     * Hide loading indicator
     */
    function hideLoading() {
        const loadingIndicator = document.getElementById('loading_indicator');
        if (loadingIndicator) {
            loadingIndicator.style.display = 'none';
        }
    }

    /**
     * Get node type name
     */
    function getNodeTypeName(name, type) {
        const typeMap = {
            '_boo': 'Boolean',
            '_cod': 'Code',
            '_dat': 'Date',
            '_ema': 'Email',
            '_num': 'Number',
            '_qty': 'Quantity',
            '_rec': 'Record',
            '_tem': 'Temperature',
            '_uri': 'URI',
            '_wpg': 'Internal Link',
            '_TEXT': 'Text',
            '_INST': 'Category',
            'Monolingual': 'Monolingual Text',
            'Telephone': 'Telephone'
        };

        if (typeMap[name]) {
            return typeMap[name];
        }

        const typeCodeMap = {
            1: 'Number',
            2: 'Text',
            4: 'Boolean',
            5: 'URI',
            6: 'Date',
            9: 'Internal Link'
        };

        return typeCodeMap[type] || 'Unknown Type';
    }

    /**
     * Format property name
     */
    function nicePropertyName(name) {
        const nameMap = {
            '_boo': 'Boolean',
            '_cod': 'Code',
            '_dat': 'Date',
            '_ema': 'Email',
            '_num': 'Number',
            '_qty': 'Quantity',
            '_rec': 'Record',
            '_tem': 'Temperature',
            '_uri': 'URI',
            '_wpg': 'Internal Link',
            '_TEXT': 'Text',
            '_INST': 'isA',
            'Monolingual': 'Monolingual Text',
            'Telephone': 'Telephone'
        };

        return nameMap[name] || name.replace(/_/g, ' ');
    }

    /**
     * Color scale function
     */
    function colorScaleMW(type) {
        return nodeColors[type] || '#999999';
    }

    // Expose drawCluster function from utility.js
    // This will be called after utility.js loads
    window.SMWGraphApp = {
        init: init,
        exec: exec,
        state: state,
        config: config,
        nodeColors: nodeColors,
        colorScaleMW: colorScaleMW,
        getNodeTypeName: getNodeTypeName,
        nicePropertyName: nicePropertyName
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

