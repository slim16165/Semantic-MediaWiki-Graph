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

    public static getNodeType(name: string, type: number) {
        switch (name) {
            case "_boo":
                return "Boolean";
            case "_cod":
                return "Code";
            case "_dat":
                return "Date";
            case "_ema":
                return "Email";
            case "_num":
                return "Number"; //oder Email //oder Telefon
            case "_qty":
                return "Quantity";
            case "_rec":
                return "Record";
            case "_tem":
                return "Temperature";
            case "_uri":
                return "URI";
            case "_wpg":
                return "Internal Link";
            case "Monolingual":
                return "Monolingual Text";
            case "Telephone":
                return "Telephone";
            case "_TEXT":
                return "Text";
            case "_INST":
                return "Category";
            default:
                switch (type) {
                    case 1:
                        return "Number";
                    case 2:
                        return "Text";
                    case 4:
                        return "Boolean";
                    case 5:
                        return "URI"; //oder Email //oder Telefon
                    case 6:
                        return "Date";
                    case 9:
                        return "Internal Link";
                    default:
                        return "Unknown Type";
                }
        }
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