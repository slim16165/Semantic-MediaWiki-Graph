import { Simulation } from "d3";
import * as d3 from "d3";
import { NodeStore } from "../nodeStore";
import { INode } from "../Model/INode";
import { Canvas } from "./Canvas";
import { NodeManager } from "./nodeManager";
import { Link } from "../Model/Link";
import { LinkManager } from "./LinkManager";

export class ForcesManager{
  static simulation: Simulation<any, any>;

  public static  CreateAForceLayoutAndBindNodesAndLinks(): Simulation<any, any> {
    /* Convert the values of an object into a format that can be used to compare or sort the values.
          Specifically, if the value passed is nonzero and its type is an object, then the valueOf() method is used to obtain the primitive value of the object.
          Otherwise, the original value is returned.       */
    function intern(value: { valueOf: () => any; } | null) {
      return value !== null && typeof value === "object" ? value.valueOf() : value;
    }

//     //A map (aka Dictionary) is created from the nodes object using nodeId as the key, and then each value in the map is converted using the intern() function.
//     const Nodes = nodes.map((node: { id: any; }) => node.id);
//     const LinkSources = links.map((link: { source: any; }) => link.source);
//     const LinkTargets = links.map((link: { target: any; }) => link.target);
//
//
// // Replace the input nodes and links with mutable objects for the simulation.
//     let nodes = nodes.map((_, i) => ({id: Nodes[i]}));
//     let links = links.map((_, i) => ({source: LinkSources[i], target: LinkTargets[i]}));


    // Compute default domains.
    // if (NodeGroups && nodeGroups === undefined) nodeGroups = d3.sort(NodeGroups);

    // Construct the scales.
    // const color = nodeGroup == null ? null : d3.scaleOrdinal(nodeGroups, colors);

    /* Construct the forces.
      d3.forceManyBody() creates a repulsion force between all nodes, where each node repels itself from its neighbors. This function needs no parameters,
      so forceNode represents a repulsion force between nodes.
      d3.forceLink(links) creates a force of attraction between nodes, based on the specified links.
      This function accepts an array of links as a parameter.
      forceLink.id(({index: i}) => Nodes[i]) specifies that the unique identifier of the nodes for the force pull is the index of the node in the Nodes array.*/

    this.simulation = d3.forceSimulation()
      .nodes(NodeStore.nodeList)
      .force('link',
        d3
          .forceLink(NodeStore.linkList)
          .id((d) => {
            return (d as INode).name
          }).strength(0.05)
        // .distance()
        // .strength(this.props.linkStrength)
      )
      .force("charge", d3.forceManyBody())
      .force("gravity", d3.forceManyBody())
      .force("friction", d3.forceManyBody())
      .force("center", d3.forceCenter(Canvas.width/2, Canvas.heigth/2))
      .alphaTarget(0.03);
    // linkForce.distance(() => width < height ? width / 3 : height / 3);

    return this.simulation;
  }

  public static MyDrag(simulation : any) : any {
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
  }

  static Tick() {
    console.log("Method enter: Tick");
    NodeStore.logNodeAndLinkStatus(false);

    ForcesManager.updateNodePositionsOnUi();
    ForcesManager.updateLinkPositionsOnUi();

    // Questo pezzo di codice si occupa di aggiungere del testo ai link e di posizionarlo nella parte centrale del link stesso.
    // Il testo viene posizionato in modo che sia metà strada tra il nodo di partenza e quello di destinazione. Se il nodo di destinazione ha una coordinata x maggiore di quella del nodo di partenza, allora il testo viene posizionato a metà strada tra le due coordinate x (e lo stesso vale per le coordinate y). Se invece il nodo di destinazione ha una coordinata x minore di quella del nodo di partenza, allora il testo viene posizionato a metà strada tra le due coordinate x (e lo stesso vale per le coordinate y).
    // LinkAndForcesManager.setLinkTextInMiddle("link");
  }

  static updateNodePositionsOnUi() {
    NodeManager.svgNodes
      .attr("transform", function(d) {
        return `translate(${d.x},${d.y})`;
      })
  }

  static updateLinkPositionsOnUi() {

    LinkManager.svgLinks
      //.each((link: Link) => LinkAndForcesManager.checkValues(link))
      .attr("x1", (link: Link) => link.source.x)
      .attr("y1", (link: Link) => link.source.y)
      .attr("x2", (link: Link) => link.target.x)
      .attr("y2", (link: Link) => link.target.y);


    LinkManager.svgLinks.append("text")
      .attr("font-family", "Arial, Helvetica, sans-serif")
      .call(() => LinkManager.setLinkTextInMiddle)
  }

  private static checkValues(link: Link) {
    if(!link.source || !link.target ||  isNaN(link.source.x) || isNaN(link.source.y))
      debugger;
  }
}