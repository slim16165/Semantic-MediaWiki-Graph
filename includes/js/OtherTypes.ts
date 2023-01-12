import { Link } from "./Link";
import { INode } from "./INode";

export interface CustomHTMLElement extends HTMLElement {
    __data__: Link | INode;
}

// export type LinkType = {
//     linkName: string;
//     targetId: string;
//     sourceId: string;
// }
//
// export type NodeType ={
//     id: string;
//     type: string;
// }

export interface Article {
    title: string;
}

export interface Point {
    x: number
    y: number
}