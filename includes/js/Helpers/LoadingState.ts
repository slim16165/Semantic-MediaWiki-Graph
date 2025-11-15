/**
 * Loading states and skeleton screens
 */

export class LoadingState {
  private static loadingElements: Map<string, HTMLElement> = new Map();

  /**
   * Show loading skeleton
   */
  static showSkeleton(containerId: string, type: 'graph' | 'list' | 'form' = 'graph'): void {
    const container = document.getElementById(containerId);
    if (!container) return;

    const skeleton = this.createSkeleton(type);
    container.appendChild(skeleton);
    this.loadingElements.set(containerId, skeleton);
  }

  /**
   * Hide loading skeleton
   */
  static hideSkeleton(containerId: string): void {
    const skeleton = this.loadingElements.get(containerId);
    if (skeleton) {
      skeleton.remove();
      this.loadingElements.delete(containerId);
    }
  }

  /**
   * Create skeleton element
   */
  private static createSkeleton(type: string): HTMLElement {
    const skeleton = document.createElement('div');
    skeleton.className = `smwgraph-skeleton smwgraph-skeleton-${type}`;
    
    if (type === 'graph') {
      skeleton.innerHTML = `
        <div class="smwgraph-skeleton-graph">
          <div class="smwgraph-skeleton-node"></div>
          <div class="smwgraph-skeleton-node"></div>
          <div class="smwgraph-skeleton-node"></div>
          <div class="smwgraph-skeleton-link"></div>
        </div>
      `;
    } else if (type === 'list') {
      skeleton.innerHTML = `
        <div class="smwgraph-skeleton-list">
          <div class="smwgraph-skeleton-item"></div>
          <div class="smwgraph-skeleton-item"></div>
          <div class="smwgraph-skeleton-item"></div>
        </div>
      `;
    }

    return skeleton;
  }

  /**
   * Show loading spinner
   */
  static showSpinner(containerId: string): void {
    const container = document.getElementById(containerId);
    if (!container) return;

    const spinner = document.createElement('div');
    spinner.className = 'smwgraph-spinner';
    spinner.innerHTML = '<div class="spinner"></div>';
    container.appendChild(spinner);
    this.loadingElements.set(`${containerId}-spinner`, spinner);
  }

  /**
   * Hide loading spinner
   */
  static hideSpinner(containerId: string): void {
    const spinner = this.loadingElements.get(`${containerId}-spinner`);
    if (spinner) {
      spinner.remove();
      this.loadingElements.delete(`${containerId}-spinner`);
    }
  }
}

