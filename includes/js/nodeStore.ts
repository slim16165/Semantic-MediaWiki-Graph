import {INode} from "./INode";
import {Link} from "./Link";
import {MyClass} from "./app";

export class NodeStore {

    public static nodeList: INode[] = [];
    public static linkList: Link[] = [];

    private constructor(nodeList: INode[], linkList: Link[]) {
        NodeStore.nodeList = nodeList;
        NodeStore.linkList = linkList;
    }

    /*
        @param {INode[]} nodeSetApp - Set of nodes and their relevant data.
        @param {Link[]} linkSetApp - Set of links and their relevant data.
     */
    public static InitialSetup(nodeSetApp: INode[], linkSetApp: Link[]) {
        new NodeStore(nodeSetApp, linkSetApp);

        // Append the source Node and the target Node to each Link
        for (const link of linkSetApp) {
            NodeStore.LinkInit(link);
        }
    }

    private static LinkInit(link: Link) {
        link.source = NodeStore.getNodeById(link.sourceId);
        link.target = NodeStore.getNodeById(link.targetId);
        link.direction = link.sourceId === MyClass.focalNodeID ? "OUT" : "IN";
    }

    private static getNodeById(sourceId: any) :  INode{
        return NodeStore.nodeList[sourceId];
    }
}