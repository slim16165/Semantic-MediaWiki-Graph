/**
 * Web Worker Manager for graph processing
 */

import { INode } from '../Model/INode';
import { Link } from '../Model/Link';
import {
  GraphProcessingMessage,
  GraphProcessingResult
} from '../Workers/graphProcessor.worker';

export class WebWorkerManager {
  private worker: Worker | null = null;
  private messageQueue: GraphProcessingMessage[] = [];
  private isProcessing: boolean = false;

  constructor() {
    this.initWorker();
  }

  private initWorker(): void {
    try {
      // Create worker from inline code or external file
      const workerCode = `
        // Worker code will be loaded from graphProcessor.worker.ts
        // For now, we'll use a simple inline implementation
        self.onmessage = function(e) {
          const { type, data } = e.data;
          if (type === 'process') {
            const maxNodes = data.options?.maxNodes || 1000;
            const processedNodes = data.nodes.slice(0, maxNodes);
            const processedLinks = data.links.filter(link => 
              processedNodes.some(n => n.id === link.source.id || n.id === link.target.id)
            );
            self.postMessage({
              type: 'result',
              data: { nodes: processedNodes, links: processedLinks }
            });
          }
        };
      `;
      const blob = new Blob([workerCode], { type: 'application/javascript' });
      this.worker = new Worker(URL.createObjectURL(blob));

      this.worker.onmessage = (e: MessageEvent<GraphProcessingResult>) => {
        this.handleWorkerMessage(e.data);
      };

      this.worker.onerror = (error) => {
        console.error('Web Worker error:', error);
        this.isProcessing = false;
        this.processQueue();
      };
    } catch (error) {
      console.warn('Web Workers not supported, falling back to main thread:', error);
      this.worker = null;
    }
  }

  private handleWorkerMessage(result: GraphProcessingResult): void {
    this.isProcessing = false;

    // Dispatch custom event with result
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('graph-processing-result', {
          detail: result
        })
      );
    }

    this.processQueue();
  }

  /**
   * Process graph data in worker
   */
  processGraph(
    nodes: INode[],
    links: Link[],
    options?: {
      maxNodes?: number;
      clusteringEnabled?: boolean;
      layoutType?: 'force' | 'hierarchical' | 'circular';
    }
  ): Promise<GraphProcessingResult> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        // Fallback to main thread processing
        const maxNodes = options?.maxNodes || 1000;
        const processedNodes = nodes.slice(0, maxNodes);
        const processedLinks = links.filter(link =>
          processedNodes.some(n => n.id === link.source.id || n.id === link.target.id)
        );
        resolve({
          type: 'result',
          data: { nodes: processedNodes, links: processedLinks }
        });
        return;
      }

      const message: GraphProcessingMessage = {
        type: 'process',
        data: { nodes, links, options }
      };

      // Set up one-time listener
      const handler = (e: MessageEvent<GraphProcessingResult>) => {
        this.worker?.removeEventListener('message', handler);
        if (e.data.type === 'error') {
          reject(new Error(e.data.data.error || 'Processing failed'));
        } else {
          resolve(e.data);
        }
      };

      this.worker.addEventListener('message', handler);
      this.worker.postMessage(message);
    });
  }

  private processQueue(): void {
    if (this.isProcessing || this.messageQueue.length === 0) {
      return;
    }

    const message = this.messageQueue.shift();
    if (message && this.worker) {
      this.isProcessing = true;
      this.worker.postMessage(message);
    }
  }

  /**
   * Terminate worker
   */
  terminate(): void {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    this.messageQueue = [];
    this.isProcessing = false;
  }
}

