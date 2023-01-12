import * as d3 from "d3";
import { Selection } from "d3";
import {Link} from "../Link";
import {ColorHelper} from "../ColorHelper";
import {MyClass} from "../app";
import {NodeManager} from "./nodeManager";
import { NodeStore } from "../nodeStore";
import { Canvas } from "./Canvas";
import { CustomHTMLElement } from "../OtherTypes";
import { INode } from "../INode";
import { VisibilityHandler } from "./visibilityHandler";

export class LegendManager {

    public static DrawLegend() {
        const sortedColors = ColorHelper.GetColors('colorScale20', NodeStore.nodeList);
        // Plot the bullet circles...

        // Print Legend Title...
        LegendManager.PrintLegendTitle(Canvas.svgCanvas);

        LegendManager.PlotTheBulletCircles(Canvas.svgCanvas, sortedColors);

        // Create legend text that acts as label keys...
        LegendManager.CreateLegendTextThatActsAsLabelKeys(Canvas.svgCanvas, sortedColors);
    }

    private static CreateLegendTextThatActsAsLabelKeys(svgCanvas: Selection<any, any, any, any>, sortedColors: any[]) {
        svgCanvas.selectAll("a.legend_link")
            .data(sortedColors) // Instruct to bind dataSet to text elements
            .enter().append("svg:a") // Append legend elements
            .append("text")
            .attr("text-anchor", "center")
            .attr("x", 40)
            .attr("y", (d: any, i: number) => (45 + (i * 20)))
            .attr("dx", 0)
            .attr("dy", "4px") // Controls padding to place text in alignment with bullets
            .text((d: any) => d)
            .attr("color_value", (d: any) => ColorHelper.color_hash[d])
            .attr("type_value", (d: string) => d)
            .attr("index_value", (d: any, i: number) => `index-${i}`)
            .attr("class", (d: any) => {
                const strippedString = d.replace(/ /g, "_");
                return `legendText-${strippedString}`;
            })
            .style("fill", "Black")
            .style("font", "normal 14px Arial")
            .on('mouseover', LegendManager.typeMouseOver)
            .on("mouseout", LegendManager.typeMouseOut);
    }

    private static PrintLegendTitle(svgCanvas: any) {
        svgCanvas.append("text").attr("class", "region")
            .text("Color Keys for Data Types...")
            .attr("x", 15)
            .attr("y", 25)
            .style("fill", "Black")
            .style("font", "bold 16px Arial")
            .attr("text-anchor", "start");
    }

    public static clickLegend(selector: string) {
        // let selector = this.this1;
        const thisObject = Array.isArray(selector) ? d3.select(selector[0]) : d3.select(selector /*vuole una stringa*/);
        const typeValue: string = thisObject.attr("type_value");

        let invisibleType: string[] = [];
        const invIndexType = invisibleType.indexOf(typeValue);
        if (invIndexType > -1) {
            invisibleType.splice(Number(typeValue), 1);
        } else {
            invisibleType.push(typeValue);
        }
        $(".node").each((index, el) => this.MakeInvisible(index, el as CustomHTMLElement, typeValue));

        $(".gLink").each((index, el) => this.MakeInvisible2(el as CustomHTMLElement));

    };

    public static setLegendStyles(strippedTypeValue: string, colorValue: string, radius: number) {
        const legendBulletSelector = `.legendBullet-${strippedTypeValue}`;
        const selectedBullet = d3.selectAll(legendBulletSelector);
        selectedBullet.style("fill", colorValue);
        selectedBullet.attr("r", radius);

        const legendTextSelector = `.legendText-${strippedTypeValue}`;
        const selectedLegendText = d3.selectAll(legendTextSelector);
        selectedLegendText.style("font", colorValue === "Maroon" ? "bold 14px Arial" : "normal 14px Arial");
        selectedLegendText.style("fill", colorValue === "Maroon" ? "Maroon" : "Black");
    }

    private static MakeInvisible(index: any, el: CustomHTMLElement, typeValue: string) {
        let node = el.__data__ as INode;
        if (node.type !== typeValue) {
            return;
        }
        const invIndex = VisibilityHandler.invisibleNode.indexOf(node.id);
        if (invIndex > -1) {
            VisibilityHandler.invisibleNode.splice(invIndex, 1);
        } else {
            VisibilityHandler.invisibleNode.push(node.id);
        }
        $(this).toggle();
    }

    private static MakeInvisible2(el: CustomHTMLElement) {
        //      debugger;
        let data = el.__data__ as Link;
        const valSource = data.sourceId;
        const valTarget = data.targetId;
        //if beide
        const indexSource = VisibilityHandler.invisibleNode.indexOf(valSource);
        const indexTarget = VisibilityHandler.invisibleNode.indexOf(valTarget);
        const indexEdge = VisibilityHandler.invisibleEdge.indexOf(`${valSource}_${valTarget}_${data.linkName}`);

        if ((indexSource > -1 || indexTarget > -1) && indexEdge === -1) {
            //Einer der beiden Knoten ist unsichtbar, aber Kante noch nicht
            $(this).toggle();
            VisibilityHandler.invisibleEdge.push(`${valSource}_${valTarget}_${data.linkName}`);
        } else if (indexSource === -1 && indexTarget === -1 && indexEdge === -1) {
            //Beide Knoten sind nicht unsichtbar und Kante ist nicht unsichtbar
        } else if (indexSource === -1 && indexTarget === -1 && indexEdge > -1) {
            //Knoten sind nicht unsichtbar, aber Kante ist es
            $(this).toggle();
            VisibilityHandler.invisibleEdge.splice(indexEdge, 1);
        }
    }

    public static PlotTheBulletCircles(svgCanvas: { svgCanvas?: void; selectAll?: any; }, sortedColors: any[]) {
        svgCanvas.selectAll("focalNodeCanvas")
            .data(sortedColors).enter().append("svg:circle") // Append circle elements
            .attr("cx", 20)
            .attr("cy", (d: any, i: number) => (45 + (i * 20)))
            .attr("stroke-width", ".5")
            .style("fill", (d: number) => ColorHelper.color_hash[d])
            .attr("r", 6)
            .attr("color_value", (d: any) => ColorHelper.color_hash[d])
            .attr("type_value", (d: any) => d)
            .attr("index_value", (d: any, i: number) => `index-${i}`)
            .attr("class", (d: any) => {
                const strippedString = d.replace(/ /g, "_");
                return `legendBullet-${strippedString}`;
            })
            .on('mouseover', LegendManager.typeMouseOver)
            .on("mouseout", LegendManager.typeMouseOut)
            .on('click', LegendManager.clickLegend);
    }

    public static typeMouseOver(selector: string, nodeSize: number) {
        const thisObject = d3.select(selector);
        const typeValue = thisObject.attr("type_value");
        const strippedTypeValue = typeValue.replace(/ /g, "_");

        LegendManager.setLegendStyles("strippedTypeValue", "Maroon", 1.2 * 6);
        NodeManager.setNodeStyles(strippedTypeValue, "Maroon", "bold", nodeSize, false);
    }

    public static typeMouseOut(selector: string, nodeSize: number) {
        const thisObject = d3.select(selector);
        const typeValue = thisObject.attr("type_value");
        const colorValue = thisObject.attr("color_value");
        const strippedTypeValue = typeValue.replace(/ /g, "_");

        LegendManager.setLegendStyles(strippedTypeValue, colorValue, 6);
        NodeManager.setNodeStyles(strippedTypeValue, "Blue", "normal", nodeSize, false);
    }
}