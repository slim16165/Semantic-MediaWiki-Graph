export class INode {
    id: string;
    name: string;
    type: string;
    fixed?: boolean;
    x: number;
    y: number;
    hlink?: string;

    public constructor(id: string, name: string, type: string, x: number, y: number, hlink: string) {
        this.id = id;
        this.name = name;
        this.x = 0;
        this.y = 0;
        this.hlink = hlink;
        this.type = type;
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