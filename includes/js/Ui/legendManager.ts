import * as d3 from "d3";
import { BaseType, Selection, selector } from "d3";
import { ColorHelper } from "../Helpers/ColorHelper";
import { NodeManager } from "./nodeManager";
import { NodeStore } from "../nodeStore";
import { Canvas } from "./Canvas";
import { CustomHTMLElement } from "../Model/OtherTypes";
import { VisibilityHandler } from "./visibilityHandler";
import { INode } from "../Model/INode";
import { LinkAndForcesManager } from "./LinkAndForcesManager";

export class LegendManager {

  public static DrawLegend() {
    const sortedColors = ColorHelper.GetColors("colorScale20");
    // Plot the bullet circles...

    // Print Legend Title...
    LegendManager.PrintLegendTitle();

    LegendManager.PlotTheBulletCircles(sortedColors);

    // Create legend text that acts as label keys...
    LegendManager.CreateLegendTextThatActsAsLabelKeys(sortedColors);

    d3.select("input[type=range]")
      .on("input", function(){ changeForceStrength((this as any).value); });

    function changeForceStrength(val: number) {
      // @ts-ignore
      LinkAndForcesManager.simulation.force("link").strength(val);
      LinkAndForcesManager.simulation.alpha(1).restart();

      LinkAndForcesManager.simulation.force("link", d3.forceLink().strength(val));
      LinkAndForcesManager.simulation.alphaTarget(0);
      LinkAndForcesManager.simulation.alphaMin(1);
    }
  }

  public static clickLegend(selector:  Selection<SVGGElement, INode, SVGGElement, INode>) {
    const typeValue: string = selector.attr("type_value");

    let invisibleType: string[] = [];
    const invIndexType = invisibleType.indexOf(typeValue);
    if (invIndexType > -1) {
      invisibleType.splice(Number(typeValue), 1);
    } else {
      invisibleType.push(typeValue);
    }
    $(".node").each((index, el) => VisibilityHandler.MakeInvisible(el as CustomHTMLElement, typeValue));

    $(".gLink").each((index, el) => VisibilityHandler.MakeInvisible2(el as CustomHTMLElement));

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

  public static PlotTheBulletCircles(sortedColors: string[]) {
    Canvas.svgCanvas.selectAll("focalNodeCanvas")
      .data(sortedColors).enter().append("svg:circle") // Append circle elements
      .attr("cx", 20)
      .attr("cy", (d: string, i: number) => (45 + (i * 20)))
      .attr("stroke-width", ".5")
      .style("fill", (d: string) => ColorHelper.color_hash[d])
      .attr("r", 6)
      .attr("color_value", (d: string) => ColorHelper.color_hash[d])
      .attr("type_value", (d: string) => d)
      .attr("index_value", (d: string, i: number) => `index-${i}`)
      .attr("class", (d: string) => {
        const strippedString = d.replace(/ /g, "_");
        return `legendBullet-${strippedString}`;
      })
      // @ts-ignore
      .on("mouseover", function(d) {LegendManager.typeMouseOver(d3.select(this), 20); })
      // @ts-ignore
      .on("mouseout", function(d) { LegendManager.typeMouseOut(d3.select(this), 20); })
      .on("click", function() { // @ts-ignore
        LegendManager.clickLegend(d3.select(this)); });
  }

  public static typeMouseOver(selector:  Selection<SVGGElement, INode, SVGGElement, INode>, nodeSize: number) {
    const typeValue = selector.attr("type_value");
    const strippedTypeValue = typeValue.replace(/ /g, "_");

    LegendManager.setLegendStyles("strippedTypeValue", "Maroon", 1.2 * 6);
    NodeManager.setNodeStylesOnMouseMove(strippedTypeValue, "Maroon", "bold", nodeSize, false);
  }

  public static typeMouseOut(selector: Selection<SVGGElement, INode, SVGGElement, INode>, nodeSize: number) {
    const typeValue = selector.attr("type_value") as string;
    const colorValue = selector.attr("color_value") as string;
    const strippedTypeValue = typeValue.replace(/ /g, "_");

    LegendManager.setLegendStyles(strippedTypeValue, colorValue, 6);
    NodeManager.setNodeStylesOnMouseMove(strippedTypeValue, "Blue", "normal", nodeSize, false);

  }

  private static CreateLegendTextThatActsAsLabelKeys(sortedColors: string[]) {
    Canvas.svgCanvas.selectAll("a.legend_link")
      .data(sortedColors) // Instruct to bind dataSet to text elements
      .enter().append("svg:a") // Append legend elements
      .append("text")
      .attr("text-anchor", "center")
      .attr("x", 40)
      .attr("y", (d: string, i: number) => (45 + (i * 20)))
      .attr("dx", 0)
      .attr("dy", "4px") // Controls padding to place text in alignment with bullets
      .text((d) => d.toString())
      .attr("color_value", (d: string) => ColorHelper.color_hash[d])
      .attr("type_value", (d: string) => d)
      .attr("index_value", (d: string, i: number) => `index-${i}`)
      .attr("class", (d: string) => {
        const strippedString = d.replace(/ /g, "_");
        return `legendText-${strippedString}`;
      })
      .style("fill", "Black")
      .style("font", "normal 14px Arial")
      .on("mouseover", function(d) {  // @ts-ignore
        LegendManager.typeMouseOver(d3.select(this), d.nodeSize) })
      .on("mouseout", function(d) {   // @ts-ignore
        LegendManager.typeMouseOut(d3.select(this), d.nodeSize) });
  }

  private static PrintLegendTitle() {
    Canvas.svgCanvas.append("text").attr("class", "region")
      .text("Color Keys for Data Types...")
      .attr("x", 15)
      .attr("y", 25)
      .style("fill", "Black")
      .style("font", "bold 16px Arial")
      .attr("text-anchor", "start");
  }
}