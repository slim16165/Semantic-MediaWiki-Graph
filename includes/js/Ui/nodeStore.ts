import {INode} from "../INode";
import {Link} from "../Link";
import {MyClass} from "../app";

export class NodeStore {
    public static nodeList: INode[] = [];
    public static linkList: Link[] = [];

    public constructor(nodeList: INode[], linkList: Link[]) {
        NodeStore.nodeList = nodeList;
        NodeStore.linkList = linkList;
    }

    public static LinkInit(link1: Link) {
        link1.Source = NodeStore.getNodeById(link1.sourceId);
        link1.Target = NodeStore.getNodeById(link1.targetId);
        link1.direction = link1.sourceId === MyClass.focalNodeID ? "OUT" : "IN";
    }

    private static getNodeById(sourceId: any) :  INode{
        return NodeStore.nodeList[sourceId];
    }
}