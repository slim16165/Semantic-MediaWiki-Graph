import { INode } from "./INode";
import { NodeType } from "./nodeType";
import { Point } from "./OtherTypes";
import { MainEntry } from "../app";
import { NodeStore } from "../nodeStore";
import { SimulationLinkDatum } from "d3-force";

/* Connection between two Nodes
* */
export class Link {
  public linkName: string;
  public pointsFocalNode: boolean;
  public source!: INode;
  public target!: INode;
  public direction!: string;
  public nodetype: NodeType;
  public isValid: boolean;
  private sourceId!: string;
  private targetId!: string;

  constructor(nodetype: NodeType, linkName: string, sourceId: string, targetId: string, direction: string) {
    this.linkName = linkName;
    this.direction = direction;
    this.isValid = false;
    this.sourceId = sourceId;
    this.targetId = targetId;
    if (!sourceId || !targetId)
      debugger;
    //this.Fix(false);

    this.nodetype = nodetype;
    this.pointsFocalNode = targetId === MainEntry.focalNodeID;
  }

  // noinspection JSUnusedGlobalSymbols
  public static cloneEdge(array: Link[]) {

    const newArr: Link[] = [];
    array.forEach((item: Link) => {
      newArr.push(new Link(item.nodetype, item.linkName, item.source.id, item.target.id, item.direction));
    });

    return newArr;
  }

  /**
   Calculates the x-y coordinates for the midpoint of a link.
   */
  public CalculateMidpoint(): Point {
    let source = this.source;
    let target = this.target;

    let x = this.CalcMiddlePoint(source.x, target.x);
    let y = this.CalcMiddlePoint(source.y, target.y);

    return { x, y } as Point;
  }

  debugString() {
    return `Link Name: ${this.linkName}, ` +
      `Source ID: ${this.source?.id}, ` +
      `Target ID: ${this.target?.id},` +
      `source type: ${typeof this.source}` +
      `target type: ${typeof this.target}` +
      `Points to Focal Node: ${this.pointsFocalNode}, ` +
      `Direction: ${this.direction}, ` +
      `nodetype: ${this.nodetype}`;
  }

  private CalcMiddlePoint(p1: number, p2: number) {
    return Math.min(p1, p2) + Math.abs(p2 - p1) / 2;
  }

  Fix(isBlocking : boolean) {
    this.isValid = true;

    try {
      this.source = NodeStore.getNodeById(this.sourceId, isBlocking);

    } catch (e) {
      console.log("The node "+ this.sourceId + " was not found. Nodes MUST be added to the node list before creating the links.");
      NodeStore.logNodeAndLinkStatus(true);
      debugger
      this.isValid = false;
    }

    try {
      this.target = NodeStore.getNodeById(this.targetId, isBlocking);
    } catch (e) {
      console.log("The node "+ this.targetId + " was not found. Nodes MUST be added to the node list before creating the links.");
      NodeStore.logNodeAndLinkStatus(true);
      debugger
      this.isValid = false;
    }

    this.direction = this.sourceId === MainEntry.focalNodeID ? "OUT" : "IN";
  }
}



