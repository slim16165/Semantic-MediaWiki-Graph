import { NodeStore } from "../nodeStore";
import * as d3 from "d3";
import { Selection, Simulation, SimulationNodeDatum } from "d3";
import { Canvas } from "./Canvas";
import { Link } from "../Model/Link";
import { Point } from "../Model/OtherTypes";
import { NodeManager } from "./nodeManager";
import { INode } from "../Model/INode";

export class LinkManager {
  static svgLinks: Selection<any, Link, any, any>;
  private static clickText: boolean;

  static DrawLinks() {
    console.log("Method enter: DrawLinks");

    // Draw lines for Links between Nodes
    this.DrawLinesForLinksBetweenNodes();

    // Append text to Link edges
    this.AppendTextToLinkEdges();

    this.clickText = false;

    //Build the Arrows
    this.buildArrows();
  }

  private static DrawLinesForLinksBetweenNodes() {
    this.svgLinks = Canvas.svgCanvas.selectAll(".gLink")
      .data(NodeStore.linkList)
      .enter().append("g")
      .attr("class", "gLink")
      .attr("class", "link")
      .attr("endNode", (d: Link) => d.target.id)
      .attr("startNode", (d: Link) => d.source.id)
      .attr("targetType", (d: Link) => d.target.type)
      .attr("sourceType", (d: Link) => d.source.type)
      .append("line")
      .style("stroke", "#ccc")
      .style("stroke-width", "1.5px")
      .attr("marker-end", (d: Link, index: number) => `url(#arrow_${index})`)
      .attr("x1", (l: Link) => l.source.x)
      .attr("y1", (l: Link) => l.source.y)
      .attr("x2", (l: Link) => l.target.x)
      .attr("y2", (l: Link) => l.target.y);
  }

  private static AppendTextToLinkEdges() {
    console.log("Method enter: AppendTextToLinkEdges");

    this.svgLinks
      .append("text")
      .attr("font-family", "Arial, Helvetica, sans-serif")
      .call(() => this.setLinkTextInMiddle)
      .attr("fill", "Black")
      .style("font", "normal 12px Arial")
      .attr("dy", ".35em")
      .text((link: Link) => link.linkName);
  }

  /**
   * Builds the arrows for the specified SVG canvas.
   */
  public static buildArrows(): void {
    /*
    * Il tipo marker è un tipo di elemento SVG (Scalable Vector Graphics). Viene utilizzato per definire un segno o un simbolo da inserire in un altro elemento SVG, ad esempio una linea o un percorso. In questo caso, il codice sta creando un marker che verrà inserito come "punta di freccia" in tutti gli elementi di classe gLink.
    Il marker viene creato con l'elemento marker di SVG, che ha un insieme di attributi che ne definiscono l'aspetto e il comportamento. Gli attributi id, viewBox, refX, refY, markerWidth e markerHeight sono tutti attributi standard del tag marker di SVG, mentre l'attributo orient è un attributo non standard che viene utilizzato per specificare l'orientamento del simbolo all'interno del marker.
    L'attributo id viene utilizzato per assegnare un identificatore univoco al marker, che può essere utilizzato per fare riferimento al marker in altri punti del codice o nei fogli di stile CSS. L'attributo viewBox definisce l'area di visualizzazione del marker e il suo contenuto. L'attributo refX e refY vengono utilizzati per specificare le coordinate del punto di riferimento del marker, ovvero il punto del marker che verrà ancorato al percorso o all'elemento che lo utilizza. Gli attributi markerWidth e markerHeight definiscono la dimensione del marker.
    Una volta creato il marker, viene aggiunto un elemento path che definisce la forma del simbolo all'interno del marker. In questo caso, la forma del simbolo è una freccia, definita dal valore "M0,-5L10,0L0,5" dell'attributo d dell'elemento path.*/

    let selection = this.svgLinks
      .append("marker")
      .attr("id", (d: any, i: number) => `arrow_${i}`)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", (d: Link) => d.pointsFocalNode ? 55 : 20)
      .attr("refY", 0)
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("orient", "auto")
      .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5");
  }




  /**
   Calculates and sets the position of the text element for the given link.
   @returns {void}
   */
  public static setLinkTextInMiddle(link: Selection<HTMLAnchorElement, Link, HTMLAnchorElement, Link>) {
    if (link.empty()) {
      console.log("link is empty");
      return;
    }

    let center: Point = link.datum().CalculateMidpoint();
    link
      .attr("x", center.x)
      .attr("y", center.y);
  }
}