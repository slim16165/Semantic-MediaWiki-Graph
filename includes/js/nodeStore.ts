import { INode } from "./Model/INode";
import { Link } from "./Model/Link";
import { MainEntry } from "./app";

export class NodeStore {

    public static nodeList: INode[] = [];
    public static linkList: Link[] = [];

    /*
        @param {INode[]} nodeSetApp - Set of nodes and their relevant data.
        @param {Link[]} linkSetApp - Set of links and their relevant data.
     */
    public static ConnectLinkSourceAndTarget() {
        console.log("Method enter: UpdateSourceAndTarget")
        console.log("Updating Source and Target of " + this.linkList.length + " links");
        // Append the source Node and the target Node to each Link
        for (let node of this.nodeList)
        {
            node.x = Math.random() * (500 - 20 + 1) + 20
            node.y = Math.random() * (500 - 20 + 1) + 20
        }

        for (let link of this.linkList)
        {
            if(!link.isValid)
                link.Fix(true);
        }
        NodeStore.isThereAnyUncompleteLink();
        // this.logNodeAndLinkStatus();
    }

    static getNodeById(nodeId: string, isBlocking : boolean = false): INode {
        console.log("Method enter: getNodeById");
        let p = NodeStore.nodeList.find((node) => node.id === nodeId);
        if(p instanceof INode) {
            return p as INode;
        }
        else if(isBlocking) {
            console.log("N° of nodes " + NodeStore.nodeList.length);
            console.log("N° of links " + NodeStore.linkList.length);
            console.log("nodeId " + nodeId);
            console.log(NodeStore.nodeList.map(node => node.id));
            debugger;
        }
        throw new DOMException("Node not found");
    }

    static logNodeAndLinkStatus(details : boolean) {
        console.log("N° of nodes " + NodeStore.nodeList.length + "; N° of links " + NodeStore.linkList.length);

        if(details) {
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
    }

    static isThereAnyUncompleteLink() {
        for (const link of NodeStore.linkList) {
            if(!link.source)
            {
                debugger;
            }
            if(!link.target)
            {
                debugger;
            }

        }
    }
}