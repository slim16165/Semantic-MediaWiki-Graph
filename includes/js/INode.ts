export class INode {
    id: any;
    name: any;
    type: string;
    fixed?: boolean;
    x: number;
    y: number;
    hlink?: any;

    public constructor(id: any, name: any, type: string, x: number, y: number, hlink: string) {
        this.x = 0;
        this.y = 0;
        this.type = "";
    }


    public static cloneNode(array: INode[]) {
        const newArr: INode[] = [];

        array.forEach((node: INode) => {
            let newNode = new INode(node.id, node.name, node.type, node.x, node.y, "");

            if (typeof node.hlink !== "undefined") {
                newNode.hlink = node.hlink;
            }

            newArr.push(newNode);

        });

        return newArr;
    }
}