import { Utility } from "../Ui/utility";
import { MainEntry } from "../app";
import { Canvas } from "../Ui/Canvas";
import { NodeType } from "./nodeType";

export class INode {
    id: string;
    name: string;
    type: string;
    fixed?: boolean;
    x: number;
    y: number;
    hlink?: string;
    private readonly notetype: NodeType;

    public constructor(nodeType : NodeType, id: string, name: string, type: string, x: number, y: number, hlink: string) {
        this.id = id;
        this.name = name;
        this.x = 0;
        this.y = 0;
        this.hlink = hlink;
        this.type = type;
        this.notetype = nodeType;
    }


    // noinspection JSUnusedGlobalSymbols
    public static cloneNode(array: INode[]) {
        const newArr: INode[] = [];

        array.forEach((node: INode) => {
            let newNode = new INode(node.notetype, node.id, node.name, node.type, node.x, node.y, "");

            if (typeof node.hlink !== "undefined") {
                newNode.hlink = node.hlink;
            }

            newArr.push(newNode);

        });

        return newArr;
    }

    public IsFocalNode() : boolean {
        return this.id === MainEntry.focalNodeID;
    }

    public updatePositions() {
        this.x = this.calcNewPosition(Canvas.width, this.x)
        this.y = this.calcNewPosition(Canvas.heigth, this.y)
    }

    public calcNewPosition(containerSize: number, currentPos: number) {
        const minDistFromBorder = this.IsFocalNode() ? 60 : 20;
        const maxDistFromBorder = (containerSize - minDistFromBorder) / Utility.scale;
        return Math.max(minDistFromBorder, Math.min(maxDistFromBorder, currentPos));
    }
}