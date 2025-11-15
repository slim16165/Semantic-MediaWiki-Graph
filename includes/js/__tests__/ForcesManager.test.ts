/**
 * Unit tests for ForcesManager
 */

import { ForcesManager } from '../Ui/ForcesManager';

describe('ForcesManager', () => {
  let forcesManager: ForcesManager;
  let mockNodes: any[];
  let mockLinks: any[];

  beforeEach(() => {
    mockNodes = [
      { id: 'node1', x: 0, y: 0 },
      { id: 'node2', x: 100, y: 100 },
    ];
    mockLinks = [
      { source: 'node1', target: 'node2' },
    ];
    forcesManager = new ForcesManager(mockNodes, mockLinks);
  });

  test('should initialize with nodes and links', () => {
    expect(forcesManager).toBeDefined();
    expect(forcesManager.getNodes()).toEqual(mockNodes);
    expect(forcesManager.getLinks()).toEqual(mockLinks);
  });

  test('should start force simulation', () => {
    forcesManager.start();
    // Verify simulation is running
    expect(forcesManager.isRunning()).toBe(true);
  });

  test('should stop force simulation', () => {
    forcesManager.start();
    forcesManager.stop();
    expect(forcesManager.isRunning()).toBe(false);
  });

  test('should update node positions', () => {
    forcesManager.start();
    // Wait for simulation tick
    setTimeout(() => {
      const nodes = forcesManager.getNodes();
      expect(nodes[0].x).toBeDefined();
      expect(nodes[0].y).toBeDefined();
    }, 100);
  });
});

