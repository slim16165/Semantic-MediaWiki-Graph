import * as d3 from 'd3';
import {Selection, Simulation, SimulationNodeDatum} from 'd3';
import {MainEntry} from "../app";
import {Link} from "../Model/Link";
import {Canvas} from "./Canvas";
import {LegendManager} from "./legendManager";
import {NodeManager} from "./nodeManager";
import {NodeStore} from "../Model/nodeStore";
import {Point} from "../Model/OtherTypes";

// noinspection UnnecessaryLocalVariableJS
export class Utility {
    public static centerNodeSize :number = 50;
    public static nodeSize :number = 10;
    public static scale :number = 1;
    private static linkText: d3.Selection<SVGTextElement, any, SVGGElement, Link>;
    private static nodes: any;
    private static link: Selection<SVGGElement, Link, SVGGElement, Link>;
    private static force: Simulation<SimulationNodeDatum, any>;

    /**
     * Draws a cluster using the provided data.
     *
     * @param {string} drawingName - A unique drawing identifier that has no spaces, no "." and no "#" characters.
     * @param {string} focalNode - Primary Node of Context.
     *
     *              0 = No Sort.  Maintain original order.
     *              1 = Sort by arc value size.
     */
    public static drawCluster(drawingName: string, focalNode: string): void {
        new Canvas();

        console.log("N° NodeStore.nodeList: " +NodeStore.nodeList.length);
        if(NodeStore.nodeList.length == 0) return;

        // Create Nodes
        this.nodes = NodeManager.CreateNodes();

        // Append circles to Nodes
        NodeManager.AppendCirclesToNodes(this.nodes);

        // Append text to Nodes
        NodeManager.AppendTextToNodes(this.nodes);


        // Append text to Link edges
        this.linkText = this.AppendTextToLinkEdges();

        // Draw lines for Links between Nodes
        // this.link = this.DrawLinesForLinksBetweenNodes();
        // let clickText = false;

        // Create a force layout and bind Nodes and Links
        // this.force = this.CreateAForceLayoutAndBindNodesAndLinks()
        //     .on("tick", () => {
        //         this.Tick();
        //     });



        //Build the Arrows
        this.buildArrows();

        LegendManager.DrawLegend();

        d3.select(window).on('resize.updatesvg', Canvas.updateWindowSize);
    }





    private static CreateAForceLayoutAndBindNodesAndLinks() {
        let force = d3.forceSimulation()
            .nodes(NodeStore.nodeList)
            .force("link", d3.forceLink(NodeStore.linkList))
            .force("charge", d3.forceManyBody().strength(-1000))
            .force("gravity", d3.forceManyBody().strength(.01))
            .force("friction", d3.forceManyBody().strength(.2))
            .force("link", d3.forceLink().id((d: any) => d.id).distance(100).strength(1)) //=> d.id).strength(9))
            //.force("link", d3.forceLink().id((d: any) => d.id).distance(d => width < height ? width * 1 / 3 : height * 1 / 3))
            .force("center", d3.forceCenter(Canvas.width / 2, Canvas.heigth / 2))

        // .start();
        return force;
    }

    private static DrawLinesForLinksBetweenNodes() {
        let link = Canvas.svgCanvas.selectAll(".gLink")
             // .data(force.links())
            .enter().append("g")
            .attr("class", "gLink")
            //    .attr("class", "link")
            // .attr("endNode", (d: Link) => d.targetId)
            // .attr("startNode", (d: Link) => d.sourceId)
            // .attr("targetType", (d: any) => d.target.type)
            // .attr("sourceType", (d: any) => d.source.type)
            // .append("line")
            // .style("stroke", "#ccc")
            // .style("stroke-width", "1.5px")
            // .attr("marker-end", (d: any, i: any) => `url(#arrow_${i})`)
            // .attr("x1", (l: Link) => l.Source.x)
            // .attr("y1", (l: Link) => l.Source.y)
            // .attr("x2", (l: Link) => l.Target.x)
            // .attr("y2", (l: Link) => l.Target.y);
        return link;
    }

    private static AppendTextToLinkEdges() {

        let linkText = Canvas.svgCanvas.selectAll(".gLink")
            .data(NodeStore.linkList)
            .append("text")
            .attr("font-family", "Arial, Helvetica, sans-serif")
            // .call(this.setLinkTextInMiddle, ink)
            .attr("fill", "Black")
            .style("font", "normal 12px Arial")
            .attr("dy", ".35em")
            .text((link: Link) => link.linkName);

        if (linkText.empty()) {
            console.log("linkText is empty");
        } else {
            this.setLinkTextInMiddle(linkText);
        }


        return linkText;
    }

    private static updateLinkPositions(linkText: Selection<SVGGElement, Link, SVGGElement, Link>) {
        linkText.attr("x1", (link: Link) =>link.source.x)
            .attr("y1", (link: Link) => link.source.y)
            .attr("x2", (link: Link) => link.target.x)
            .attr("y2", (link: Link) => link.target.y);
    }


    private static Tick() {
        Utility.updateLinkPositions(this.link);

        NodeManager.updateNodePositions(this.nodes);

        Utility.updateLinkPositions(this.link);

        this.nodes.attr("transform", (d: any) => `translate(${d.x},${d.y})`);


        // Questo pezzo di codice si occupa di aggiungere del testo ai link e di posizionarlo nella parte centrale del link stesso.
        // Il testo viene posizionato in modo che sia metà strada tra il nodo di partenza e quello di destinazione. Se il nodo di destinazione ha una coordinata x maggiore di quella del nodo di partenza, allora il testo viene posizionato a metà strada tra le due coordinate x (e lo stesso vale per le coordinate y). Se invece il nodo di destinazione ha una coordinata x minore di quella del nodo di partenza, allora il testo viene posizionato a metà strada tra le due coordinate x (e lo stesso vale per le coordinate y).
        this.setLinkTextInMiddle(Utility.linkText);
    }

    /**

     Calculates and sets the position of the text element for the given link.
     @param linkText
     @returns {void}
     */
    private static setLinkTextInMiddle(linkText: Selection<SVGTextElement, Link, any, any>) {
        let center: Point = linkText.datum().CalculateMidpoint();
        linkText.attr("x", center.x)
            .attr("y", center.y);

        return linkText;
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

        let selection: Selection<SVGGElement, Link, SVGGElement, any> = Canvas.svgCanvas.selectAll('.gLink');

        selection.append('marker')
            .attr('id', (d: Link, i: number) => `arrow_${i}`)
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', (d: Link) => d.targetId === MainEntry.focalNodeID ? 55 : 20)
            .attr('refY', 0)
            .attr('markerWidth', 8)
            .attr('markerHeight', 8)
            .attr('orient', 'auto')
            .append('svg:path')
            .attr('d', 'M0,-5L10,0L0,5');
    }
}



