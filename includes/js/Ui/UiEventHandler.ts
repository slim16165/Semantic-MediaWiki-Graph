import { Selection } from "d3";
import { MainEntry } from "../app";
import { SemanticWikiApi } from "../Semantic/semanticWikiApi";
import { INode } from "../Model/INode";
import { LegendManager } from "./legendManager";

const TRANSACTION_DURATION : number = 250;

export class UiEventHandler {
  public static mouseClickNode(selector: Selection<any, any, any, any>, clickText: boolean) {
    //TODO: clickText è di tipo capture? Devo mettere i ... sul chiamante?
    const thisObject: Selection<any, any, HTMLElement, any> = selector;
    const typeValue = thisObject.attr("type_value");

    if (!clickText && typeValue === 'Internal Link') {
      const nodeName = thisObject.node().__data__.name;
      if (!MainEntry.downloadedArticles.includes(nodeName)) {
        SemanticWikiApi.BrowseBySubject(nodeName);
      }
    }

    clickText = false;
  };

  public static mouseClickNodeText(selector: Selection<any, any, any, any>, clickText: boolean) {

    const typeValue = selector.attr("type_value");

    let node = selector.datum() as INode;
    if (typeValue === "Internal Link" || typeValue === "URI") {
      if (node) {
        window.open(node.hlink);
      }
    }

    clickText = true;
  };

  public static nodeMouseOver(selector: Selection<any, any, any, any>) {
    const typeValue = selector.attr("type_value");
    const strippedTypeValue = typeValue.replace(/ /g, "_");

    selector.select("circle").transition()
      .duration(TRANSACTION_DURATION)
      .attr("r", (d: any) => d.IsFocalNode() ? 65 : 15);

    selector.select("text").transition()
      .duration(TRANSACTION_DURATION)
      .style("font", "bold 20px Arial")
      .attr("fill", "Blue");

    LegendManager.setLegendStyles(strippedTypeValue, "Maroon", 1.2 * 6);
  };

  public static nodeMouseOut(selector: Selection<any, any, any, any>) {

    const typeValue = selector.attr("type_value");
    const colorValue = selector.attr("color_value");
    const strippedTypeValue = typeValue.replace(/ /g, "_");

    selector.select("circle")
      .transition()
      .duration(TRANSACTION_DURATION)
      .attr("r", (d: any) => {return d.IsFocalNode() ? MainEntry.centerNodeSize : MainEntry.nodeSize});

    selector.select("text")
      .transition()
      .duration(TRANSACTION_DURATION)
      .style("font", "normal 16px Arial")
      .attr("fill", "Blue");

    LegendManager.setLegendStyles(strippedTypeValue, colorValue, 6);
  };
}