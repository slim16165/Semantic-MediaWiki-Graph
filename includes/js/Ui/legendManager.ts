import * as d3 from "d3";
import { BaseType, Selection, selector } from "d3";
import { ColorHelper } from "../Helpers/ColorHelper";
import { NodeManager } from "./nodeManager";
import { NodeStore } from "../nodeStore";
import { Canvas } from "./Canvas";
import { CustomHTMLElement } from "../Model/OtherTypes";
import { VisibilityHandler } from "./visibilityHandler";

export class LegendManager {

  public static DrawLegend() {
    const sortedColors = ColorHelper.GetColors("colorScale20", NodeStore.nodeList);
    // Plot the bullet circles...

    // Print Legend Title...
    LegendManager.PrintLegendTitle();

    LegendManager.PlotTheBulletCircles(sortedColors);

    // Create legend text that acts as label keys...
    LegendManager.CreateLegendTextThatActsAsLabelKeys(sortedColors);
  }

  public static clickLegend(selector:  Selection<any, any, any, any>) {
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

  public static PlotTheBulletCircles(sortedColors: any[]) {
    Canvas.svgCanvas.selectAll("focalNodeCanvas")
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
      .on("mouseover", function(d) {LegendManager.typeMouseOver(d3.select(this), d.nodeSize)})
      .on("mouseout", function(d) { LegendManager.typeMouseOut(d3.select(this), d.nodeSize); })
      .on("click", function() { LegendManager.clickLegend(d3.select(this)); });
  }

  public static typeMouseOver(selector:  Selection<any, any, any, any>, nodeSize: number) {
    const typeValue = selector.attr("type_value");
    const strippedTypeValue = typeValue.replace(/ /g, "_");

    LegendManager.setLegendStyles("strippedTypeValue", "Maroon", 1.2 * 6);
    NodeManager.setNodeStyles(strippedTypeValue, "Maroon", "bold", nodeSize, false);
  }

  public static typeMouseOut(selector: Selection<any, any, any, any>, nodeSize: number) {
    const typeValue = selector.attr("type_value") as string;
    const colorValue = selector.attr("color_value") as string;
    const strippedTypeValue = typeValue.replace(/ /g, "_");

    LegendManager.setLegendStyles(strippedTypeValue, colorValue, 6);
    NodeManager.setNodeStyles(strippedTypeValue, "Blue", "normal", nodeSize, false);

  }

  private static CreateLegendTextThatActsAsLabelKeys(sortedColors: any[]) {
    Canvas.svgCanvas.selectAll("a.legend_link")
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
      .on("mouseover", LegendManager.typeMouseOver)
      .on("mouseout", LegendManager.typeMouseOut);
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