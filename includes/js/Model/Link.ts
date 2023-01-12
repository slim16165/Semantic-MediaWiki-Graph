import {INode} from "./INode";
import { NodeType } from "./nodeType";
import { Point } from "./OtherTypes";

/* Connection between two Nodes
* */
export class Link {
    public linkName: string;
    public sourceId: string;
    public targetId: string;
    public source!: INode;
    public target!: INode;
    public direction!: string;
    public nodetype: NodeType;

    constructor(nodetype: NodeType, linkName: string, sourceId: string, targetId: string, source: INode | null, target: INode | null, direction: string) {
        this.sourceId = sourceId;
        this.linkName = linkName;
        this.targetId = targetId;
        this.direction = direction;
        if(source)
            this.source = source;
        if(target)
            this.target = target;
        this.nodetype = nodetype;
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



