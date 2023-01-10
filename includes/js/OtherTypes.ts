export interface CustomHTMLElement extends HTMLElement {
    __data__: LinkType | NodeType;
}

export type LinkType = {
    linkName: string;
    targetId: string;
    sourceId: string;
}

export type NodeType ={
    id: string;
    type: string;
}

export interface Article {
    title: string;
}