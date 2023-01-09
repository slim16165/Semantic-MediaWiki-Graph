import * as d3 from "d3";
import {Selection} from "d3";
import {Utility} from "./utility";

export class Canvas {
    public static svgCanvas: d3.Selection<any, any, any, any>;
    public static width = $(".chart")[0].clientWidth;
    public static heigth = $(".chart")[0].clientHeight;

    constructor() {
        Canvas.svgCanvas = Canvas.InitCanvas('#cluster_chart .chart');
    }

    public static InitCanvas(selectString: string): Selection<any, any, any, any> {
        const svgCanvas = d3.select(selectString)
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

    public static updateWindow() {
        Canvas.width = $(".chart")[0].clientWidth - 60;
        Canvas.heigth = $(".chart")[0].clientHeight - 60;

        Canvas.svgCanvas.attr("width", Canvas.width).attr("height", Canvas.heigth);
        $('#svgCanvas').width(Canvas.width + 90);
        $('#svgCanvas').height(Canvas.heigth + 60);
    }
}