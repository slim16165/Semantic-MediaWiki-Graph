import * as d3 from "d3";
import { BaseType, DragBehavior, Selection } from "d3";
import { ColorHelper } from "../Helpers/ColorHelper";
import { Canvas } from "./Canvas";
import { NodeStore } from "../nodeStore";
import { INode } from "../Model/INode";
import { UiEventHandler } from "./UiEventHandler";
import { MainEntry } from "../app";
import { LinkAndForcesManager } from "./LinkAndForcesManager";

export class NodeManager {
  static svgNodes: Selection<any, INode, any, any>;

  static DrawNodes() {
    // Create Nodes
    NodeManager.CreateNodes();

    // Append circles to Nodes
    NodeManager.AppendCirclesToNodes();

    // Append text to Nodes
    NodeManager.AppendTextToNodes();
  }

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

    NodeManager.svgNodes = Canvas.svgCanvas.selectAll(".node")
      .data(NodeStore.nodeList)
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("id", (node: INode) => node.id)
      .attr("type_value", (d: INode) => d.type)
      .attr("color_value", (d: INode) => ColorHelper.color_hash[d.type])
      .attr("xlink:href", (d: INode) => d.hlink as string)
      .attr("fixed", d => d.fixed)
      // .setXYPos()
      .attr("cx", (d: INode) => d.x)
      .attr("cy", (d: INode) => d.y)
      .on("mouseover", () => UiEventHandler.nodeMouseOver)
      .on("click", () => UiEventHandler.mouseClickNode)
      .on("mouseout", () => UiEventHandler.nodeMouseOut)
      .call(LinkAndForcesManager.forceDragBehaviour)
      .attr("transform", function(d) {
        return `translate(${d.x},${d.y})`;
      })
      .append("a");

    return this.svgNodes;
  }

  public static setNodeStylesOnMouseMove(strippedTypeValue: string, colorValue: string, fontWeight: string, nodeSize: number, focalNode: boolean) {
    if(isNaN(nodeSize) )
      nodeSize = 10;

    d3.selectAll(`.nodeText-${strippedTypeValue}`)
      .style("font", `${fontWeight} 16px Arial`)
      .style("fill", colorValue);

    d3.selectAll(`.nodeCircle-${strippedTypeValue}`)
      .style("fill", colorValue)
      .style("stroke", colorValue)
      .attr("r", focalNode ? nodeSize : 1.2 * nodeSize);

    if (focalNode) {
      d3.selectAll(".focalNodeCircle")
        .style("stroke", colorValue)
        .style("fill", "White");

      d3.selectAll(".focalNodeText")
        .style("fill", colorValue)
        .style("font", `${fontWeight} 16px Arial`);
    }
  }

  static updateNodePositions() {
    this.svgNodes.datum().updatePositions();
    this.svgNodes.attr("cx", (d: INode) => d.x)
        .attr("cy", (d: INode) => d.y);
  }

  static AppendTextToNodes() {
    this.svgNodes.append("text")
      .attr("x", (d: INode) => d.IsFocalNode() ? 0 : 20)
      .attr("y", (d: INode) => {
        return d.IsFocalNode() ? 0 : -10;
      })
      .attr("text-anchor", (d: INode) => d.IsFocalNode() ? "middle" : "start")
      .on("click", function() {
        // @ts-ignore
        UiEventHandler.mouseClickNodeText(d3.select(this), false);
      })
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

  static AppendCirclesToNodes() {
    this.svgNodes.append("circle")
      .attr("x", d => d.x)
      .attr("y", d => d.y)
      .attr("r", (d: INode) => d.IsFocalNode() ? MainEntry.centerNodeSize : MainEntry.nodeSize)
      .style("fill", "White") // Make the nodes hollow looking
      .attr("type_value", (d: INode) => d.type)
      .attr("color_value", (d: INode) => ColorHelper.color_hash[d.type])
      .attr("fixed", function(d) {
        return d.fixed;
      })
      .attr("x", d => d.fixed ? Canvas.width / 2 : d.x)
      .attr("y", d => d.fixed ? Canvas.heigth / 2 : d.y)
      .attr("class", (d: INode) => {
        const strippedString = d.type.replace(/ /g, "_");
        // return "nodeCircle-" + strippedString; })
        return d.fixed ? "focalNodeCircle" : `nodeCircle-${strippedString}`;
      })
      .style("stroke-width", 5) // Give the node strokes some thickness
      .style("stroke", (d: INode) => "Blue" /*TODO: ColorHelper.color_hash[d.type]*/) // Node stroke colors
      // .call(LinkAndForcesManager.forceDragBehaviour);
  }
}

