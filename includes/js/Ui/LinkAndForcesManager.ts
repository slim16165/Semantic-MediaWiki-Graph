import { NodeStore } from "../nodeStore";
import * as d3 from "d3";
import { Selection, Simulation, SimulationNodeDatum } from "d3";
import { Canvas } from "./Canvas";
import { Link } from "../Model/Link";
import { Point } from "../Model/OtherTypes";
import { NodeManager } from "./nodeManager";
import { INode } from "../Model/INode";

export class LinkAndForcesManager {
  static simulation: Simulation<any, any>;
  static svgLinks: Selection<any, Link, any, any>;
  private static clickText: boolean;

  static DrawLinks() {
    NodeStore.UpdateSourceAndTarget();



    // Append text to Link edges
    this.AppendTextToLinkEdges();

    // Draw lines for Links between Nodes
    this.DrawLinesForLinksBetweenNodes();
    this.clickText = false;

    // Create a force layout and bind Nodes and Links
    //TODO: da erorre, per ora commento
    this.CreateAForceLayoutAndBindNodesAndLinks()
      .on("tick", () => {
        this.Tick();
      });

    //Build the Arrows
    this.buildArrows();
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

    let selection = Canvas.svgCanvas.selectAll(".gLink")
      .data(NodeStore.linkList)
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

  private static  CreateAForceLayoutAndBindNodesAndLinks(): Simulation<any, any> {
    this.simulation = d3.forceSimulation()
      .nodes(NodeStore.nodeList)
        .force('link',
        d3
          .forceLink(NodeStore.linkList)
          .id((d) => {
            return (d as INode).name
          })
          // .distance()
          // .strength(this.props.linkStrength)
      )
      .force("charge", d3.forceManyBody())
      .force("gravity", d3.forceManyBody())
      .force("friction", d3.forceManyBody())
      .force("center", d3.forceCenter())
      .alphaTarget(0.03);

    // const linkForce = d3.forceLink().id((d: any) => d.id);

    // const width = Canvas.width;
    // const height = Canvas.heigth;
    // linkForce.distance(() => width < height ? width / 3 : height / 3);
    // this.simulation.force("link", linkForce);

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

  private static DrawLinesForLinksBetweenNodes() {
    this.svgLinks = Canvas.svgCanvas.selectAll(".gLink")
      .data(NodeStore.linkList)
      .enter().append("g")
      // .attr("class", "gLink")
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

    Canvas.svgCanvas.selectAll(".gLink")
      .data(NodeStore.linkList)
      .append("text")
      .attr("font-family", "Arial, Helvetica, sans-serif")
      .call(() => this.setLinkTextInMiddle)
      .attr("fill", "Black")
      .style("font", "normal 12px Arial")
      .attr("dy", ".35em")
      .text((link: Link) => link.linkName);
  }

  private static Tick() {
    LinkAndForcesManager.updateNodePositionsOnUi();
    LinkAndForcesManager.updateLinkPositionsOnUi();

    // Questo pezzo di codice si occupa di aggiungere del testo ai link e di posizionarlo nella parte centrale del link stesso.
    // Il testo viene posizionato in modo che sia metà strada tra il nodo di partenza e quello di destinazione. Se il nodo di destinazione ha una coordinata x maggiore di quella del nodo di partenza, allora il testo viene posizionato a metà strada tra le due coordinate x (e lo stesso vale per le coordinate y). Se invece il nodo di destinazione ha una coordinata x minore di quella del nodo di partenza, allora il testo viene posizionato a metà strada tra le due coordinate x (e lo stesso vale per le coordinate y).
    // LinkAndForcesManager.setLinkTextInMiddle("link");
  }

  static updateNodePositionsOnUi() {
    NodeManager.svgNodes
      .attr("cx", (d: any) => d.x)
      .attr("cy", (d: any) => d.y);
  }

  static updateLinkPositionsOnUi() {

    this.svgLinks
      .attr("x1", (link: Link) => link.source.x)
      .attr("y1", (link: Link) => link.source.y)
      .attr("x2", (link: Link) => link.target.x)
      .attr("y2", (link: Link) => link.target.y);
  }


  /**
   Calculates and sets the position of the text element for the given link.
   @returns {void}
   */
  private static setLinkTextInMiddle(link: Selection<HTMLAnchorElement, Link, HTMLAnchorElement, Link>) {
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