export class INode {
    id: any;
    name: any;
    type: string;
    fixed?: boolean;
    x: number;
    y: number;
    hlink?: any;

    public constructor(id: any, name: any, type: string, x: number, y: number) {
        this.x = 0;
        this.y = 0;
        this.type = "";
    }
}