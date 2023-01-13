import {INode} from "./INode";
import { NodeType } from "./nodeType";
import { Point } from "./OtherTypes";
import { MainEntry } from "../app";
import { NodeStore } from "../nodeStore";

/* Connection between two Nodes
* */
export class Link {
    public linkName: string;
    public sourceId: string;
    public targetId: string;
    public pointsFocalNode : boolean;
    public source!: INode;
    public target!: INode;
    public direction!: string;
    public nodetype: NodeType;

    constructor(nodetype: NodeType, linkName: string, sourceId: string, targetId: string, source: INode | null, target: INode | null, direction: string) {
        this.sourceId = sourceId;
        this.linkName = linkName;
        this.targetId = targetId;
        this.direction = direction;
        this.UpdateSourceAndTarget(source, target);

        this.nodetype = nodetype;
        this.pointsFocalNode = targetId === MainEntry.focalNodeID;
    }

    UpdateSourceAndTarget(source: INode | null, target: INode | null) {
        try{
        if(source)
            this.source = source;
        // else
        //     this.source = NodeStore.getNodeById(this.sourceId);
        if(target)
            this.target = target;
        // else
        //     this.target = NodeStore.getNodeById(this.targetId);
        }
        catch(e){
            console.log("Early link initialization error: " + e);
        }

        this.direction = this.sourceId === MainEntry.focalNodeID ? "OUT" : "IN";
    }

    // noinspection JSUnusedGlobalSymbols
    public static cloneEdge(array: Link[]) {

        const newArr: Link[] = [];
        array.forEach((item: Link) => {
            newArr.push(new Link(item.nodetype, item.linkName, item.sourceId, item.targetId, item.source, item.target, item.direction));
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

    private CalcMiddlePoint(x: number, y: number) {
        return Math.min(x, y) + Math.abs(y - x) / 2;
    }
}



