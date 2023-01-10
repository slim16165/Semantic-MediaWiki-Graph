/* Connection between two Nodes
* */
import {INode} from "./INode";

export class Link {
    public linkName: any;
    public sourceId: any;
    public targetId: any;
    public source!: INode;
    public target!: INode;
    public direction!: string;

    constructor(linkName: string, sourceId: string, targetId: string, source: INode | null, target: INode | null, direction: string) {
        this.sourceId = sourceId;
        this.linkName = linkName;
        this.targetId = targetId;
        this.direction = direction;
        if(source)
            this.source = source;
        if(target)
            this.target = target;
    }

    public static cloneEdge(array: Link[]) {

        const newArr: Link[] = [];
        array.forEach((item: Link) => {
            newArr.push(new Link(item.linkName, item.sourceId, item.targetId, item.source, item.target, item.direction));
        });

        return newArr;
    }

    /**
     Calculates the x-coordinate for the midpoint of a link.
     @param {ILink} link - The link whose midpoint x-coordinate we want to calculate.
     @return {number} The x-coordinate for the midpoint of the link.
     */
    public CalculateMidpoint(): { x: number; y: number }
    {
        let source = this.source;
        let target = this.target;

        let x = this.CalcMiddlePoint(source.x, target.x);
        let y = this.CalcMiddlePoint(source.y, target.y);

        return {x, y};
    }

    private CalcMiddlePoint(x: number, y: number) {
        return Math.min(x, y) + Math.abs(y - x) / 2;
    }
}

export interface Article {
    title: string;
}

