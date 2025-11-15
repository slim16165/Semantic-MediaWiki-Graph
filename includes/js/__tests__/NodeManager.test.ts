/**
 * Unit tests for NodeManager
 */

import { NodeManager } from '../Ui/nodeManager';
import { INode } from '../Model/INode';
import { NodeType } from '../Model/nodeType';

describe('NodeManager', () => {
  let nodeManager: NodeManager;
  let mockNodes: INode[];

  beforeEach(() => {
    mockNodes = [
      {
        id: 'node1',
        name: 'Test Node 1',
        type: NodeType.Article,
        x: 0,
        y: 0,
        hlink: '/wiki/Test_Node_1',
      },
    ];
    nodeManager = new NodeManager(mockNodes);
  });

  test('should initialize with nodes', () => {
    expect(nodeManager).toBeDefined();
    expect(nodeManager.getNodes()).toEqual(mockNodes);
  });

  test('should add node', () => {
    const newNode: INode = {
      id: 'node2',
      name: 'Test Node 2',
      type: NodeType.Article,
      x: 100,
      y: 100,
    };
    nodeManager.addNode(newNode);
    expect(nodeManager.getNodes()).toHaveLength(2);
  });

  test('should remove node by id', () => {
    nodeManager.removeNode('node1');
    expect(nodeManager.getNodes()).toHaveLength(0);
  });

  test('should find node by id', () => {
    const node = nodeManager.findNode('node1');
    expect(node).toBeDefined();
    expect(node?.id).toBe('node1');
  });

  test('should update node position', () => {
    nodeManager.updateNodePosition('node1', 50, 50);
    const node = nodeManager.findNode('node1');
    expect(node?.x).toBe(50);
    expect(node?.y).toBe(50);
  });
});

