import {INode} from "./INode";
import { NodeType } from "./nodeType";
import { Point } from "./OtherTypes";
import { MainEntry } from "../app";
import { NodeStore } from "../nodeStore";
import { SimulationLinkDatum } from "d3-force";

/* Connection between two Nodes
* */
export class Link implements SimulationLinkDatum<INode>{
    public linkName: string;
    public pointsFocalNode : boolean;
    public source!: INode;
    public target!: INode;
    public direction!: string;
    public nodetype: NodeType;

    constructor(nodetype: NodeType, linkName: string, sourceId: string, targetId: string, direction: string) {
        this.linkName = linkName;
        this.direction = direction;
        try{
            if(!sourceId)
                debugger;
            if(!targetId)
                debugger;
            this.source = NodeStore.getNodeById(sourceId);
            this.target = NodeStore.getNodeById(targetId);
        }
        catch(e){
            console.log("The nodes MUST be added to the node list before creating the links: " + e);
        }

        this.direction = sourceId === MainEntry.focalNodeID ? "OUT" : "IN";

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
    public CalculateMidpoint(): Point
    {
        let source = this.source;
        let target = this.target;

        let x = this.CalcMiddlePoint(source.x, target.x);
        let y = this.CalcMiddlePoint(source.y, target.y);

        return {x, y} as Point;
    }

    private CalcMiddlePoint(p1: number, p2: number) {
        return Math.min(p1, p2) + Math.abs(p2 - p1) / 2;
    }

    debugString() {
        return `Link Name: ${this.linkName}, `+
        `Source ID: ${this.source.id}, `+
        `Target ID: ${this.target.id},`+
        `source type: ${typeof this.source}`+
        `target type: ${typeof this.target}`+
        `Points to Focal Node: ${this.pointsFocalNode}, `+
        `Direction: ${this.direction}, `+
        `nodetype: ${this.nodetype}`;
    }
}



