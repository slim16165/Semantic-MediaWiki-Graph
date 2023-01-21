import * as d3 from "d3";
import { BaseType, drag, DragBehavior, Selection } from "d3";
import { ColorHelper } from "../Helpers/ColorHelper";
import { Canvas } from "./Canvas";
import { NodeStore } from "../nodeStore";
import { INode } from "../Model/INode";
import { UiEventHandler } from "./UiEventHandler";
import { MainEntry } from "../app";
import { LinkAndForcesManager } from "./LinkAndForcesManager";

export class NodeManager {
  static svgNodes: Selection<HTMLAnchorElement, INode, HTMLAnchorElement, INode>;

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

    // LinkAndForcesManager.forceDragBehaviour();

    NodeManager.svgNodes = Canvas.svgCanvas.selectAll(".node")
      .data(NodeStore.nodeList)
      .enter().append("g")
      .attr("class", "node")
      .attr("id", (node: INode) => node.id)
      .attr("type_value", (node: INode) => node.type)
      .attr("color_value", (node: INode) => ColorHelper.color_hash[node.type])
      .attr("xlink:href", (node: INode) => node.hlink as string)
      .attr("fixed", node => node.IsFocalNode())
      // .attr("cx", (node: INode) => node.x)
      // .attr("cy", (node: INode) => node.y)
      .on("mouseover", () => UiEventHandler.nodeMouseOver)
      .on("click", () => UiEventHandler.mouseClickNode)
      .on("mouseout", () => UiEventHandler.nodeMouseOut)
      .call(LinkAndForcesManager.MyDrag(LinkAndForcesManager.simulation))
      // .attr("transform", function(d) {
      //   return `translate(${d.x},${d.y})`;
      // })
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

  static AppendTextToNodes() {
    this.svgNodes.append("text")
      //the text (inside each group) is offset of 10 px
      .attr("x", (d: INode) => /*d.IsFocalNode() ?*/ 10)
      .attr("y", (d: INode) => /*d.IsFocalNode() ? 0 : -10*/ 10)
      .attr("text-anchor", (d: INode) => d.IsFocalNode() ? "middle" : "start") //Not visible, just an attribute
      .style("font-family", "Arial, Helvetica, sans-serif")
      .style("font", "normal 16px Arial")
      .style("fill", (d: INode) => ColorHelper.color_hash[d.type])
      .attr("type_value", (d: INode) => d.type)
      .attr("color_value", (d: INode) => ColorHelper.color_hash[d.type])
      .attr("class", (d: INode) => {
        const type_string = d.type.replace(/ /g, "_");
        //return "nodeText-" + type_string; })
        return d.IsFocalNode() ? "focalNodeText" : `nodeText-${type_string}`;
      })
      .on("click", function() {
        // @ts-ignore
        UiEventHandler.mouseClickNodeText(d3.select(this), false);
      })
      //TODO: commento dy
      .attr("dy", ".35em")
      .text((d: INode) => d.name);
  }

  static AppendCirclesToNodes() {
    this.svgNodes.append("circle")
      //the circle (inside each group) is centered to the center of the group
      .attr("r", (d: INode) => d.IsFocalNode() ? MainEntry.centerNodeSize : MainEntry.nodeSize)
      .attr("type_value", (d: INode) => d.type)
      .attr("color_value", (d: INode) => ColorHelper.color_hash[d.type])
      .attr("fixed", d => d.fixed)
      .attr("class", (d: INode) => {
        const strippedString = d.type.replace(/ /g, "_");
        // return "nodeCircle-" + strippedString; })
        return d.IsFocalNode() ? "focalNodeCircle" : `nodeCircle-${strippedString}`;
      })
      .style("fill", "White") // Make the nodes hollow looking
      .style("stroke-width", 5) // Give the node strokes some thickness
      .style("stroke", (d: INode) => "Blue" /*TODO: ColorHelper.color_hash[d.type]*/) // Node stroke colors
    // .call(LinkAndForcesManager.forceDragBehaviour);
  }
}

