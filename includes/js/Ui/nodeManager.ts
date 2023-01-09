import * as d3 from "d3";
import {Selection} from "d3";
import {MyClass} from "../app";
import {LegendManager} from "./legendManager";
import {ColorHelper} from "../ColorHelper";
import {Utility} from "./utility";
import {Canvas} from "./Canvas";
import { NodeStore } from "../nodeStore";
import { INode } from "../INode";
import { SemanticWikiApi } from "../semanticWikiApi";

const TRANSACTION_DURATION : number = 250;

export class NodeManager {

    public static mouseClickNode(selector: string, clickText: boolean) {
        const thisObject: Selection<any, any, HTMLElement, any> = d3.select(selector);
        const typeValue = thisObject.attr("type_value");

        if (!clickText && typeValue === 'Internal Link') {
            const nodeName = thisObject.node().__data__.name;
            if (!MyClass.downloadedArticles.includes(nodeName)) {
                SemanticWikiApi.BrowseBySubject(nodeName);
            }
        }

        clickText = false;
    };

    public static mouseClickNodeText(selector: string, clickText: boolean) {
        // let selector = this.this1;
        // let win: any;
        const thisObject = d3.select(selector);
        const typeValue = thisObject.attr("type_value");

        let node = thisObject.node() as any;
        if (typeValue === 'Internal Link') {
            if (node) {
                let win = window.open(node.__data__.hlink);
            }
        } else if (typeValue === 'URI') {
            if (node) {
                let win = window.open(node.__data__.hlink);
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
            .attr("r", (d: any, i) => d.id === MyClass.focalNodeID ? 65 : 15);

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

        function getValue(d: { id: string }) {
            return d.id === MyClass.focalNodeID ? Utility.centerNodeSize : Utility.nodeSize;
        }

        d3.select(selector).select("circle")
            .transition()
            .duration(TRANSACTION_DURATION)
            .attr("r", (d: any) => getValue(d));

        d3.select(selector).select("text")
            .transition()
            .duration(TRANSACTION_DURATION)
            .style("font", "normal 16px Arial")
            .attr("fill", "Blue");

        LegendManager.setLegendStyles("strippedTypeValue", "colorValue", 6);
    };

    static CreateNodes() {
        const node = Canvas.svgCanvas.selectAll(".node")
            .data(NodeStore.nodeList)
            .enter().append("g")
            .attr("class", "node")
            .attr("id", (node: INode) => node.id)
            .attr("type_value", (d: INode) => d.type)
            .attr("color_value", (d: INode) => ColorHelper.color_hash[d.type])
            .attr("xlink:href", (d: INode) => d.hlink)
            .attr("fixed", function(d) { return d.id == MyClass.focalNodeID; } )
            .on("mouseover", (d)=> this.nodeMouseOver)
            .on("click", () => this.mouseClickNode)
            .on("mouseout", () => this.nodeMouseOut)
            // .call(force.drag)
            .append("a");
        return node;
    }

    public static setNodeStyles(strippedTypeValue: string, colorValue: string, fontWeight: string, nodeSize: number, focalNode: boolean) {
        const nodeTextSelector = `.nodeText-${strippedTypeValue}`;
        const selectedNodeText = d3.selectAll(nodeTextSelector);
        selectedNodeText.style("font", `${fontWeight} 16px Arial`);
        selectedNodeText.style("fill", colorValue);

        const nodeCircleSelector = `.nodeCircle-${strippedTypeValue}`;
        const selectedCircle = d3.selectAll(nodeCircleSelector);
        selectedCircle.style("fill", colorValue);
        selectedCircle.style("stroke", colorValue);
        selectedCircle.attr("r", focalNode ? nodeSize : 1.2 * nodeSize);

        if (focalNode) {
            const focalNodeCircleSelector = ".focalNodeCircle";
            const selectedFocalNodeCircle = d3.selectAll(focalNodeCircleSelector);
            selectedFocalNodeCircle.style("stroke", colorValue);
            selectedFocalNodeCircle.style("fill", "White");

            const focalNodeTextSelector = ".focalNodeText";
            const selectedFocalNodeText = d3.selectAll(focalNodeTextSelector);
            selectedFocalNodeText.style("fill", colorValue);
            selectedFocalNodeText.style("font", `${fontWeight} 16px Arial`);
        }
    }

    static updateNodePositions(node: Selection<SVGGElement, INode, any, any>, clientWidth: number, clientHeight: number, scale: number) {
        node.attr("cx", (d: any) => {
            if (d.id === MyClass.focalNodeID) {
                const s = 1 / scale;
                return d.x = Math.max(60, Math.min(s * (clientWidth - 60), d.x));
            } else {
                const s = 1 / scale;
                return d.x = Math.max(20, Math.min(s * (clientWidth - 20), d.x));
            }
        }).attr("cy", (d: any) => {
            if (d.id === MyClass.focalNodeID) {
                const s = 1 / scale;
                return d.y = Math.max(60, Math.min(s * (clientHeight - 60), d.y));
            } else {
                const s = 1 / scale;
                return d.y = Math.max(20, Math.min(s * (clientHeight - 20), d.y));
            }
        });
    }

    static AppendTextToNodes(node: Selection<SVGGElement, INode, any, any>) {
        node.append("text")
            .attr("x", (d: any) => d.id === MyClass.focalNodeID ? 0 : 20)
            .attr("y", (d: any) => {
                return d.id === MyClass.focalNodeID ? 0 : -10;
            })
            .attr("text-anchor", (d: any) => d.id === MyClass.focalNodeID ? "middle" : "start")
            // .on("click", this.mouseClickNodeText)
            .attr("font-family", "Arial, Helvetica, sans-serif")
            .style("font", "normal 16px Arial")
            .attr("fill", "Blue")
            .style("fill", (d: any) => ColorHelper.color_hash[d])
            .attr("type_value", (d: any) => d.type)
            .attr("color_value", (d: any) => ColorHelper.color_hash[d.type])
            .attr("class", (d: any) => {
                const str = d.type;
                const strippedString = str.replace(/ /g, "_");
                //return "nodeText-" + strippedString; })
                return d.id === MyClass.focalNodeID ? "focalNodeText" : `nodeText-${strippedString}`;
            })
            .attr("dy", ".35em")
            .text((d: any) => d.name);
    }

    static AppendCirclesToNodes(node: Selection<SVGGElement, INode, any, any>) {
        node.append("circle")
            .attr("x", function(d) { return d.x; })
            .attr("y", function(d) { return d.y; })
            .attr("r", (d: any) => d.id === MyClass.focalNodeID ? Utility.centerNodeSize : Utility.nodeSize)
            .style("fill", "White") // Make the nodes hollow looking
            .style("fill", "transparent")
            .attr("type_value", (d: any) => d.type)
            .attr("color_value", (d: any) => ColorHelper.color_hash[d.type])
            //.attr("fixed", function(d) { if (d.id==focalNodeID) { return true; } else { return false; } } )
            //.attr("x", function(d) { if (d.id==focalNodeID) { return width/2; } else { return d.x; } })
            //.attr("y", function(d) { if (d.id==focalNodeID) { return height/2; } else { return d.y; } })
            .attr("class", (d: any) => {
                const str = d.type;
                const strippedString = str.replace(/ /g, "_");
                //return "nodeCircle-" + strippedString; })
                return d.id === MyClass.focalNodeID ? "focalNodeCircle" : `nodeCircle-${strippedString}`;
            })
            .style("stroke-width", 5) // Give the node strokes some thickness
            .style("stroke", (d: any) => ColorHelper.color_hash[d.type]) // Node stroke colors
        // .call(force.drag);
    }
}