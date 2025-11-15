/**
 * Web Worker for heavy graph processing operations
 * Processes large graphs without blocking the main thread
 */

import { INode } from '../Model/INode';
import { Link } from '../Model/Link';

export interface GraphProcessingMessage {
  type: 'process' | 'cluster' | 'layout';
  data: {
    nodes: INode[];
    links: Link[];
    options?: {
      maxNodes?: number;
      clusteringEnabled?: boolean;
      layoutType?: 'force' | 'hierarchical' | 'circular';
    };
  };
}

export interface GraphProcessingResult {
  type: 'result' | 'progress' | 'error';
  data: {
    nodes?: INode[];
    links?: Link[];
    clusters?: any[];
    progress?: number;
    error?: string;
  };
}

// Worker context
self.onmessage = function(e: MessageEvent<GraphProcessingMessage>) {
  const { type, data } = e.data;

  try {
    switch (type) {
      case 'process':
        processGraph(data.nodes, data.links, data.options);
        break;
      case 'cluster':
        clusterNodes(data.nodes, data.links);
        break;
      case 'layout':
        calculateLayout(data.nodes, data.links, data.options);
        break;
      default:
        postMessage({
          type: 'error',
          data: { error: `Unknown processing type: ${type}` }
        } as GraphProcessingResult);
    }
  } catch (error) {
    postMessage({
      type: 'error',
      data: { error: error instanceof Error ? error.message : 'Unknown error' }
    } as GraphProcessingResult);
  }
};

function processGraph(nodes: INode[], links: Link[], options?: any) {
  const maxNodes = options?.maxNodes || 1000;
  const processedNodes = nodes.slice(0, maxNodes);
  const processedLinks = links.filter(link => 
    processedNodes.some(n => n.id === link.source.id || n.id === link.target.id)
  );

  postMessage({
    type: 'result',
    data: { nodes: processedNodes, links: processedLinks }
  } as GraphProcessingResult);
}

function clusterNodes(nodes: INode[], links: Link[]) {
  // Simple clustering algorithm - can be enhanced
  const clusters: any[] = [];
  const visited = new Set<string>();

  nodes.forEach(node => {
    if (visited.has(node.id)) return;

    const cluster = {
      id: `cluster_${clusters.length}`,
      nodes: [node],
      center: { x: node.x, y: node.y }
    };

    // Find connected nodes
    links.forEach(link => {
      if (link.source.id === node.id && !visited.has(link.target.id)) {
        cluster.nodes.push(link.target);
        visited.add(link.target.id);
      }
    });

    if (cluster.nodes.length > 1) {
      clusters.push(cluster);
    }
    visited.add(node.id);
  });

  postMessage({
    type: 'result',
    data: { clusters }
  } as GraphProcessingResult);
}

function calculateLayout(nodes: INode[], links: Link[], options?: any) {
  const layoutType = options?.layoutType || 'force';
  
  // Calculate initial positions
  const centerX = 400;
  const centerY = 300;
  const radius = 200;

  nodes.forEach((node, i) => {
    if (layoutType === 'circular') {
      const angle = (2 * Math.PI * i) / nodes.length;
      node.x = centerX + radius * Math.cos(angle);
      node.y = centerY + radius * Math.sin(angle);
    } else if (layoutType === 'hierarchical') {
      const level = Math.floor(i / 10);
      node.x = centerX + (level * 100);
      node.y = centerY + ((i % 10) * 30);
    }
  });

  postMessage({
    type: 'result',
    data: { nodes }
  } as GraphProcessingResult);
}

