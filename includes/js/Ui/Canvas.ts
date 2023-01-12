import * as d3 from "d3";
import {Selection} from "d3";
import {Utility} from "./utility";
//import needed
import * as d3Ext from "./d3Extension";

export class Canvas {
    public static svgCanvas: d3.Selection<any, any, any, any>;
    public static width = $(".chart")[0].clientWidth;
    public static heigth = $(".chart")[0].clientHeight;
    public static margin = {top: 20, right: 20, bottom: 30, left: 40};

    constructor() {
        Canvas.InitCanvas();
    }

    /**
     * Initialize the canvas and create the svg element with all its attributes.
     * @returns {d3.Selection<any, any, any, any>} svgCanvas - The svg canvas element
     */
    public static InitCanvas(){
        //outer = .chart
        //inner = svgCanvas
        //inner = .focalNodeCanvas

        this.svgCanvas = d3.select("#cluster_chart .chart")
            .append("svg:svg")
            .call((selection: any, ...args: any[]) => {
                d3.zoom().on("zoom", (event: any) => {
                    Utility.scale = event.transform.k;
                    selection.attr("transform", event.transform);
                })(selection, ...args);
            })
            .setWidthAndHeight(this.width, this.heigth)
            .attr("id", "svgCanvas")
            .append("svg:g")
            .attr("class", "focalNodeCanvas");

        Canvas.setCanvasSize();
    }

    // public static setWidthAndHeight(width: number, heigth: number) {
    //     this.width = width;
    //     this.heigth = heigth;
    //
    //     this.svgCanvas
    //       .attr("width", this.width + this.margin.left + this.margin.right)
    //       .attr("height", this.heigth + this.margin.top + this.margin.bottom);
    // }

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

        if(!Canvas.svgCanvas)
            console.log("svgCanvas not set");

        Canvas.svgCanvas.setWidthAndHeight(Canvas.width, Canvas.heigth)
    }
}