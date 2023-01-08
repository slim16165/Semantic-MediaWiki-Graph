export class ILink {
    public sourceId: any;
    public linkName: any;
    public targetId: any;
    public source!: INode;
    public target!: INode;
    public direction!: string;

    constructor(sourceId: any, linkName: any, targetId: any, source: INode, target: INode, direction: string) {
        this.sourceId = sourceId;
        this.linkName = linkName;
        this.targetId = targetId;
        this.direction = direction;
        this.source = source;
        this.target = target;
    }
}

export interface IForce {
    links: () => any;
    nodes: () => any;
    drag: any;
    stop: () => void;
}

export interface Article {
    title: string;
}

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


export interface SuccessParams {
    edit: { result: string };
    error: any;
    query: { allpages: any }
}

export interface BacklinksCallbackParams {
    data: { edit: { result: string }; error: any; query: { backlinks: any } };
}

export interface ExtractedParams {
    property: string;
    dataitem: any[];
    subject: any;
}