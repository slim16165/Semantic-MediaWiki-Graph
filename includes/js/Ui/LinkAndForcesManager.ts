import { NodeStore } from "../nodeStore";
import { DragBehavior, Selection, Simulation, SimulationNodeDatum } from "d3";
import * as d3 from "d3";
import { Canvas } from "./Canvas";
import { Link } from "../Model/Link";
import { NodeManager } from "./nodeManager";
import { INode } from "../Model/INode";
import { Point } from "../Model/OtherTypes";

export class LinkAndForcesManager {
  private static clickText: boolean;
  static force: Simulation<SimulationNodeDatum, any>;
  static svgLinks: Selection<any, Link, any, any>;
  static forceDragBehaviour()
  {
    LinkAndForcesManager.CreateAForceLayoutAndBindNodesAndLinks()
  }

  static DrawLinks() {
    NodeStore.UpdateSourceAndTarget2()
    NodeStore.isThereAnyUncompleteLink();


    // Append text to Link edges
    this.AppendTextToLinkEdges();

    // Draw lines for Links between Nodes
    this.DrawLinesForLinksBetweenNodes();
    this.clickText = false;

    // Create a force layout and bind Nodes and Links
    this.CreateAForceLayoutAndBindNodesAndLinks()
      .on("tick", () => {
        this.Tick();
      });

    //Build the Arrows
    this.buildArrows();
  }

  private static CreateAForceLayoutAndBindNodesAndLinks() : Simulation<any, any>{
    this.force = d3.forceSimulation()
      .nodes(NodeStore.nodeList)
      .force("link", d3.forceLink(NodeStore.linkList))
      .force("charge", d3.forceManyBody().strength(-1000))
      .force("gravity", d3.forceManyBody().strength(.01))
      .force("friction", d3.forceManyBody().strength(.2))
      //commento
      // .force("link", d3.forceLink().id((d:SimulationNodeDatum) => d.).distance(100).strength(1)) //=> d.id).strength(9))
      // .force("link", d3.forceLink().id((d: any) => d.id).distance(() => $(".chart")[0].clientWidth < $(".chart")[0].clientHeight ? $(".chart")[0].clientWidth / 3 : $(".chart")[0].clientHeight / 3))
      .force("center", d3.forceCenter(Canvas.width / 2, Canvas.heigth / 2));
      // .restart();

    function dragStarted(d: { fx: number; x: number; fy: number; y: number; }) {
      if (!d3.event.active) LinkAndForcesManager.force.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(d: { fx: number; x: number; fy: number; y: number; }) {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
    }

    function dragEnded(d: { fx: number; x: number; fy: number; y: number; }) {
      if (!d3.event.active) LinkAndForcesManager.force.alphaTarget(0);
      d.fx = d.x;
      d.fy = d.y;
    }

    d3.drag()
      .on("start", () => dragStarted)
      .on("drag", () => dragged)
      .on("end", () => dragEnded);

    return this.force;
  }

  private static DrawLinesForLinksBetweenNodes() {
    this.svgLinks = Canvas.svgCanvas.selectAll(".gLink")
      .data(NodeStore.linkList)
      .enter().append("g")
      .attr("class", "gLink")
      .attr("class", "link")
      .attr("endNode", (d: Link) => d.targetId)
      .attr("startNode", (d: Link) => d.sourceId)
      .attr("targetType", (d: Link) => d.target.type)
      .attr("sourceType", (d: Link) => d.source.type)
      .append("line")
      .style("stroke", "#ccc")
      .style("stroke-width", "1.5px")
      .attr("marker-end", (d: Link, index:number) => `url(#arrow_${index})`)
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

  static updateLinkPositions() {
    this.svgLinks
        .attr("x1", (link: Link) =>link.source.x)
        .attr("y1", (link: Link) => link.source.y)
        .attr("x2", (link: Link) => link.target.x)
        .attr("y2", (link: Link) => link.target.y);
  }

  private static Tick() {
    //TODO: blocco l'aggiornamento delle posizioni dei nodi
    // NodeManager.updateNodePositions();
    // LinkAndForcesManager.updateLinkPositions();

    let nodes = Canvas.svgCanvas.selectAll(".gLink")
    //Questo sembra tanto tanto un doppione
    // NodeManager.svgNodes.attr("transform", (d: INode) => `translate(${d.x},${d.y})`);


    // Questo pezzo di codice si occupa di aggiungere del testo ai link e di posizionarlo nella parte centrale del link stesso.
    // Il testo viene posizionato in modo che sia metà strada tra il nodo di partenza e quello di destinazione. Se il nodo di destinazione ha una coordinata x maggiore di quella del nodo di partenza, allora il testo viene posizionato a metà strada tra le due coordinate x (e lo stesso vale per le coordinate y). Se invece il nodo di destinazione ha una coordinata x minore di quella del nodo di partenza, allora il testo viene posizionato a metà strada tra le due coordinate x (e lo stesso vale per le coordinate y).
    // this.setLinkTextInMiddle();
  }

  /**
   Calculates and sets the position of the text element for the given link.
   @returns {void}
   */
  private static setLinkTextInMiddle(linkText: Selection<HTMLAnchorElement, Link, HTMLAnchorElement, Link>) {
    if (linkText.empty()) {
      console.log("linkText is empty");
      return;
    }

    let center: Point = linkText.datum().CalculateMidpoint();
    linkText
      .attr("x", center.x)
      .attr("y", center.y);
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

    let selection = Canvas.svgCanvas.selectAll('.gLink')
      .data(NodeStore.linkList)
      .append('marker')
      .attr('id', (d: any,  i: number) => `arrow_${i}`)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', (d: Link) => d.pointsFocalNode ? 55 : 20)
      .attr('refY', 0)
      .attr('markerWidth', 8)
      .attr('markerHeight', 8)
      .attr('orient', 'auto')
      .append('svg:path')
      .attr('d', 'M0,-5L10,0L0,5');
  }
}