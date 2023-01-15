import { MainEntry } from "../app";
import { Canvas } from "../Ui/Canvas";
import { NodeType } from "./nodeType";

export class INode {
    id: string;
    name: string;
    type: string;
    fixed: boolean; //è il focal node?
    x: number;
    y: number;
    hlink?: string;
    private readonly notetype: NodeType;
    color: string;

    public constructor(nodeType : NodeType, id: string, name: string, type: string, x: number, y: number, hlink: string) {
        this.id = id;
        this.name = name;
        //Randomize initial position
        this.x = Math.floor(Math.random() * (500 - 20 + 1) + 20);
        this.y = Math.floor(Math.random() * (500 - 20 + 1) + 20);
        this.hlink = hlink;
        this.type = type;
        this.notetype = nodeType;
        this.fixed = this.id === MainEntry.focalNodeID;
        this.color = "green"
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
        return this.fixed;
    }

    public updatePositions() {
        this.x = this.calcNewPosition(Canvas.width, this.x)
        this.y = this.calcNewPosition(Canvas.heigth, this.y)
        console.log(`posizione x e y: ${this.x} ${this.y}`)
    }

    public calcNewPosition(containerSize: number, currentPos: number) {
        const minDistFromBorder = this.IsFocalNode() ? 60 : 20;
        const maxDistFromBorder = (containerSize - minDistFromBorder) / MainEntry.scale;
        return Math.max(minDistFromBorder, Math.min(maxDistFromBorder, currentPos));
        //return Math.floor(Math.random() * (500 - 20 + 1) + 20);
    }

  debugString() {
      return `ID: ${this.id}, Name: ${this.name}, Type: ${this.type}, Fixed: ${this.fixed}, x: ${this.x}, y: ${this.y}, hlink: ${this.hlink}, notetype: ${this.notetype}`;
  }
}