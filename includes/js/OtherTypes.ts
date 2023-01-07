export class ILink {
    public sourceId: any;
    public linkName: any;
    public targetId: any;
    source: INode;
    target: INode;
    direction: string;

    constructor(sourceId: any, linkName: any, targetId: any) {
        this.sourceId = sourceId;
        this.linkName = linkName;
        this.targetId = targetId;
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

export interface INode {
    id: any;
    name: any;
    type: string;
    fixed?: boolean;
    x?: number;
    y?: number;
    hlink?: any;
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
    property;
    dataitem: any[];
    subject ;
}