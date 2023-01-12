import * as d3 from "d3";
import { Selection } from "d3";
import { MainEntry } from "../app";
import { LegendManager } from "./legendManager";
import { ColorHelper } from "../Helpers/ColorHelper";
import { Utility } from "./utility";
import { Canvas } from "./Canvas";
import { NodeStore } from "../Model/nodeStore";
import { INode } from "../Model/INode";
import { SemanticWikiApi } from "../Semantic/semanticWikiApi";

const TRANSACTION_DURATION : number = 250;

export class NodeManager {

    public static mouseClickNode(selector: string, clickText: boolean) {
        const thisObject: Selection<any, any, HTMLElement, any> = d3.select(selector);
        const typeValue = thisObject.attr("type_value");

        if (!clickText && typeValue === 'Internal Link') {
            const nodeName = thisObject.node().__data__.name;
            if (!MainEntry.downloadedArticles.includes(nodeName)) {
                SemanticWikiApi.BrowseBySubject(nodeName);
            }
        }

        clickText = false;
    };

    public static mouseClickNodeText(selector: string, clickText: boolean) {
        const thisObject = d3.select(selector);
        const typeValue = thisObject.attr("type_value");

        let node = thisObject.datum() as any;
        if (typeValue === "Internal Link" || typeValue === "URI") {
            if (node) {
                window.open(node.__data__.hlink);
            }
        }

        clickText = true;
    };

    public static nodeMouseOver(selector: string) {
        // let selector = this.this1;
        const thisObject = d3.select(selector);
        const typeValue = thisObject.attr("type_value");
        const strippedTypeValue = typeValue.replace(/ /g, "_");

        d3.select(selector).select("circle").transition()
            .duration(TRANSACTION_DURATION)
            .attr("r", (d: any, i) => d.IsFocalNode() ? 65 : 15);

        d3.select(selector).select("text").transition()
            .duration(TRANSACTION_DURATION)
            .style("font", "bold 20px Arial")
            .attr("fill", "Blue");

        LegendManager.setLegendStyles("strippedTypeValue", "Maroon", 1.2 * 6);
    };

    public static nodeMouseOut(selector: string) {
        // let selector = this.this1;
        const thisObject = d3.select(selector);
        const typeValue = thisObject.attr("type_value");
        const colorValue = thisObject.attr("color_value");
        const strippedTypeValue = typeValue.replace(/ /g, "_");

        d3.select(selector).select("circle")
            .transition()
            .duration(TRANSACTION_DURATION)
            .attr("r", (d: any) => {return d.IsFocalNode() ? Utility.centerNodeSize : Utility.nodeSize});

        d3.select(selector).select("text")
            .transition()
            .duration(TRANSACTION_DURATION)
            .style("font", "normal 16px Arial")
            .attr("fill", "Blue");

        LegendManager.setLegendStyles(strippedTypeValue, colorValue, 6);
    };

    /*
    They are initially invisible
    * */
    static CreateNodes() {

        /*
        In the provided code, the enter() function is used to create a new g group for each element in the NodeStore.nodeList
        dataset that does not yet have a corresponding element in the HTML. The "node" class attribute and several other attributes
        are then assigned to the created group. Additionally, the events on("mouseover", (d)=> this.nodeMouseOver),
        on("click", () => this.mouseClickNode), on("mouseout", () => this.nodeMouseOut) are associated with the created group.
        In summary enter() allows to select and operate on data elements that haven't been associated yet to DOM elements.
        * */

        console.log(NodeStore.nodeList.length);

        const node = Canvas.svgCanvas.selectAll(".node");

            let x1 = node.data(NodeStore.nodeList);
            let x2 = x1.enter();

            let x3 = x2.append("g")
            .attr("class", "node")
            .attr("id", (node: INode) => node.id)
            .attr("type_value", (d: INode) => d.type)
            .attr("color_value", (d: INode) => ColorHelper.color_hash[d.type])
            .attr("xlink:href", (d: INode) => d.hlink as string)
            .attr("fixed", function(d) { return d.id == MainEntry.focalNodeID; } )
            .on("mouseover", (d)=> this.nodeMouseOver)
            .on("click", () => this.mouseClickNode)
            .on("mouseout", () => this.nodeMouseOut)
            // .call(force.drag)
            // .attr("transform", function(d) {
            //     return `translate(${d.x},${d.y})`;
            // })
            .append("a");


        return x3;
    }

    public static setNodeStyles(strippedTypeValue: string, colorValue: string, fontWeight: string, nodeSize: number, focalNode: boolean) {
        const selectedNodeText = d3.selectAll(`.nodeText-${strippedTypeValue}`);
        selectedNodeText.style("font", `${fontWeight} 16px Arial`);
        selectedNodeText.style("fill", colorValue);

        const selectedCircle = d3.selectAll(`.nodeCircle-${strippedTypeValue}`);
        selectedCircle.style("fill", colorValue);
        selectedCircle.style("stroke", colorValue);
        selectedCircle.attr("r", focalNode ? nodeSize : 1.2 * nodeSize);

        if (focalNode) {
            const selectedFocalNodeCircle = d3.selectAll(".focalNodeCircle");
            selectedFocalNodeCircle.style("stroke", colorValue);
            selectedFocalNodeCircle.style("fill", "White");

            const selectedFocalNodeText = d3.selectAll(".focalNodeText");
            selectedFocalNodeText.style("fill", colorValue);
            selectedFocalNodeText.style("font", `${fontWeight} 16px Arial`);
        }
    }

    static updateNodePositions(node: Selection<SVGGElement, INode, any, any>) {
        node.datum().updatePositions()
        node.attr("cx", (d: INode) => d.x)
            .attr("cy", (d: INode) => d.y);
    }

    static AppendTextToNodes(node: Selection<SVGGElement, INode, any, any>) {
        node.append("text")
            .attr("x", (d: INode) => d.IsFocalNode() ? 0 : 20)
            .attr("y", (d: INode) => {
                return d.IsFocalNode() ? 0 : -10;
            })
            .attr("text-anchor", (d: INode) => d.IsFocalNode() ? "middle" : "start")
            // .on("click", this.mouseClickNodeText)
            .attr("font-family", "Arial, Helvetica, sans-serif")
            .style("font", "normal 16px Arial")
            .attr("fill", "Blue")
            .style("fill", (d: INode) => ColorHelper.color_hash[d.type])
            .attr("type_value", (d: INode) => d.type)
            .attr("color_value", (d: INode) => ColorHelper.color_hash[d.type])
            .attr("class", (d: INode) => {
                const type_string = d.type.replace(/ /g, "_");
                //return "nodeText-" + type_string; })
                return d.IsFocalNode() ? "focalNodeText" : `nodeText-${type_string}`;
            })
            .attr("dy", ".35em")
            .text((d: INode) => d.name);
    }

    static AppendCirclesToNodes(node: Selection<SVGGElement, INode, any, any>) {
        node.append("circle")
            .attr("x", function(d) { return d.x; })
            .attr("y", function(d) { return d.y; })
            .attr("r", (d: INode) => d.IsFocalNode() ? Utility.centerNodeSize : Utility.nodeSize)
            .style("fill", "White") // Make the nodes hollow looking
            .style("fill", "transparent")
            .attr("type_value", (d: INode) => d.type)
            .attr("color_value", (d: INode) => ColorHelper.color_hash[d.type])
            .attr("fixed", function(d) { return d.id == MainEntry.focalNodeID ? true : false; } )
            .attr("x", function(d) { return d.id == MainEntry.focalNodeID ? Canvas.width / 2 : d.x; })
            .attr("y", function(d) { return d.id == MainEntry.focalNodeID ? Canvas.heigth / 2 : d.y; })
            .attr("class", (d: INode) => {
                const str = d.type;
                const strippedString = str.replace(/ /g, "_");
                //return "nodeCircle-" + strippedString; })
                return d.IsFocalNode() ? "focalNodeCircle" : `nodeCircle-${strippedString}`;
            })
            .style("stroke-width", 5) // Give the node strokes some thickness
            .style("stroke", (d: INode) => ColorHelper.color_hash[d.type]) // Node stroke colors
        // .call(force.drag);
    }
}

