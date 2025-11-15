/**
 * Bookmarking and sharing functionality
 */

export interface GraphState {
  article: string;
  nodes: any[];
  links: any[];
  viewport?: {
    x: number;
    y: number;
    zoom: number;
  };
}

export class GraphBookmark {
  /**
   * Save current graph state to localStorage
   */
  static saveBookmark(name: string, state: GraphState): void {
    const bookmarks = this.getBookmarks();
    bookmarks[name] = {
      ...state,
      savedAt: new Date().toISOString()
    };
    localStorage.setItem('smwgraph_bookmarks', JSON.stringify(bookmarks));
  }

  /**
   * Get all bookmarks
   */
  static getBookmarks(): Record<string, GraphState & { savedAt: string }> {
    const stored = localStorage.getItem('smwgraph_bookmarks');
    return stored ? JSON.parse(stored) : {};
  }

  /**
   * Load bookmark by name
   */
  static loadBookmark(name: string): GraphState | null {
    const bookmarks = this.getBookmarks();
    return bookmarks[name] || null;
  }

  /**
   * Delete bookmark
   */
  static deleteBookmark(name: string): void {
    const bookmarks = this.getBookmarks();
    delete bookmarks[name];
    localStorage.setItem('smwgraph_bookmarks', JSON.stringify(bookmarks));
  }

  /**
   * Generate shareable URL with state
   */
  static generateShareableURL(state: GraphState): string {
    const params = new URLSearchParams();
    params.set('article', state.article);
    if (state.viewport) {
      params.set('x', state.viewport.x.toString());
      params.set('y', state.viewport.y.toString());
      params.set('zoom', state.viewport.zoom.toString());
    }
    return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
  }

  /**
   * Load state from URL parameters
   */
  static loadStateFromURL(): Partial<GraphState> | null {
    const params = new URLSearchParams(window.location.search);
    const article = params.get('article');
    
    if (!article) return null;

    const state: Partial<GraphState> = {
      article
    };

    const x = params.get('x');
    const y = params.get('y');
    const zoom = params.get('zoom');

    if (x && y && zoom) {
      state.viewport = {
        x: parseFloat(x),
        y: parseFloat(y),
        zoom: parseFloat(zoom)
      };
    }

    return state;
  }

  /**
   * Copy shareable URL to clipboard
   */
  static async copyShareableURL(state: GraphState): Promise<boolean> {
    const url = this.generateShareableURL(state);
    
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        return true;
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      }
    } catch (error) {
      console.error('Failed to copy URL:', error);
      return false;
    }
  }
}

