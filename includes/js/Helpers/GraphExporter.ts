/**
 * Graph export functionality (PNG, SVG, PDF)
 */

import * as d3 from 'd3';

export class GraphExporter {
  /**
   * Export graph as PNG
   */
  static async exportPNG(svgElement: SVGElement, filename: string = 'graph.png'): Promise<void> {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    return new Promise((resolve, reject) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            this.downloadBlob(blob, filename);
            resolve();
          } else {
            reject(new Error('Failed to create PNG'));
          }
        }, 'image/png');
      };
      
      img.onerror = reject;
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    });
  }

  /**
   * Export graph as SVG
   */
  static exportSVG(svgElement: SVGElement, filename: string = 'graph.svg'): void {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    this.downloadBlob(blob, filename);
  }

  /**
   * Export graph as PDF (requires jsPDF library)
   */
  static async exportPDF(
    svgElement: SVGElement,
    filename: string = 'graph.pdf',
    width: number = 800,
    height: number = 600
  ): Promise<void> {
    // Check if jsPDF is available
    if (typeof (window as any).jspdf === 'undefined') {
      throw new Error('jsPDF library not loaded. Please include jsPDF for PDF export.');
    }

    const JsPDF = (window as any).jspdf.jsPDF;
    const pdf = new JsPDF({
      orientation: width > height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [width, height]
    });

    // Convert SVG to image
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const img = new Image();
    
    return new Promise((resolve, reject) => {
      img.onload = () => {
        pdf.addImage(img, 'PNG', 0, 0, width, height);
        pdf.save(filename);
        resolve();
      };
      
      img.onerror = reject;
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    });
  }

  /**
   * Download blob as file
   */
  private static downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Get graph data as JSON
   */
  static exportJSON(data: any, filename: string = 'graph.json'): void {
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    this.downloadBlob(blob, filename);
  }
}

