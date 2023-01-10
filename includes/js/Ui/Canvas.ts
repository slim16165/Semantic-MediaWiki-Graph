import * as d3 from "d3";
import {Selection} from "d3";
import {Utility} from "./utility";

export class Canvas {
    public static svgCanvas: d3.Selection<any, any, any, any>;
    public static width = $(".chart")[0].clientWidth;
    public static heigth = $(".chart")[0].clientHeight;

    constructor() {
        Canvas.svgCanvas = Canvas.InitCanvas();
    }

    /**
     * Initialize the canvas and create the svg element with all its attributes.
     * @returns {d3.Selection<any, any, any, any>} svgCanvas - The svg canvas element
     */
    public static InitCanvas(): Selection<any, any, any, any> {
        Canvas.setCanvasSize();

        //outer = .chart
        //inner = svgCanvas
        //inner = .focalNodeCanvas

        const svgCanvas = d3.select("#cluster_chart .chart")
            .append("svg:svg")
            .call((selection: any, ...args: any[]) => {
                d3.zoom().on("zoom", (event: any) => {
                    Utility.scale = event.transform.k;
                    selection.attr("transform", event.transform);
                })(selection, ...args);
            })
            .attr("width", this.width)
            .attr("height", this.heigth)
            .attr("id", "svgCanvas")
            .append("svg:g")
            .attr("class", "focalNodeCanvas");
        return svgCanvas;
    }

    public static updateWindowSize() {
        console.log("Called method updateWindow");

        let c = $(".chart")[0];
        this.setCanvasSize(c.clientWidth - 60, c.clientHeight - 60);

        $('#svgCanvas').width(Canvas.width + 90);
        $('#svgCanvas').height(Canvas.heigth + 60);
    }

    private static setCanvasSize(canvasWidth : number = $(".chart")[0].clientWidth,
                                 canvasHeigth : number = $(".chart")[0].clientHeight)
    {
        this.width = canvasWidth;
        this.heigth = canvasHeigth;

        Canvas.svgCanvas
          .attr("width", Canvas.width)
          .attr("height", Canvas.heigth);
    }
}