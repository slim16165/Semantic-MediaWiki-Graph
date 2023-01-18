import { INode } from "./Model/INode";
import { Link } from "./Model/Link";
import { MainEntry } from "./app";

export class NodeStore {

    public static nodeList: INode[] = [];
    public static linkList: Link[] = [];

    // private constructor() {
    //     NodeStore.nodeList = [];
    //     NodeStore.linkList = [];
    // }

    /*
        @param {INode[]} nodeSetApp - Set of nodes and their relevant data.
        @param {Link[]} linkSetApp - Set of links and their relevant data.
     */
    public static UpdateSourceAndTarget() {
        console.log("Updating Source and Target of " + this.linkList.length + " links");
        // Append the source Node and the target Node to each Link
        for (let link of this.linkList) {
            link.source = NodeStore.getNodeById(link.sourceId);
            link.target = NodeStore.getNodeById(link.targetId);
            link.direction = link.sourceId === MainEntry.focalNodeID ? "OUT" : "IN";
        }
        NodeStore.isThereAnyUncompleteLink();
        // this.logNodeAndLinkStatus();
    }
    static getNodeById(sourceId: string): INode {
        let p = NodeStore.nodeList.find((node) => node.id === sourceId);
        if(p instanceof INode) {
            return p as INode;
        }
        else {
            console.log("N° of nodes " + NodeStore.nodeList.length);
            console.log("N° of links " + NodeStore.linkList.length);
            console.log("sourceId " + sourceId);
            console.log(NodeStore.nodeList.map(node => node.id));

            throw new DOMException("Node not found");
        }
    }

    private static logNodeAndLinkStatus() {
        console.log("Node Status:");
        let debugString = "";
        NodeStore.nodeList.forEach((node) => {
            debugString += node.debugString() + "\n";
        });
        debugString += "Link Status:\n";
        NodeStore.linkList.forEach((link) => {
            debugString += link.debugString() + "\n";
        });
        console.log(debugString);
    }

    static isThereAnyUncompleteLink() {
        for (const link of NodeStore.linkList) {
            if(!link.source)
            {
                console.log("SourceId missing "+ link.sourceId);
                debugger;
            }
            if(!link.target)
            {
                console.log("SourceId missing "+ link.targetId);
                debugger;
            }

        }
    }
}