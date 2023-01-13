import * as d3 from "d3";

//import needed
import * as D3Ext from "./d3Extension"
import { MainEntry } from "../app";

export class Chart {
  public width: number;
  public height: number;

  constructor() {
    this.width = $(".chart")[0].clientWidth;
    this.height = $(".chart")[0].clientHeight;
  }
}


export class Canvas {
  public static svgCanvas: d3.Selection<any, any, any, any>;
  public static width: number;
  public static heigth: number;
  public static margin = { top: 120, right: 120, bottom: 120, left: 120 };

  constructor() {
    Canvas.InitCanvas();
  }

  /**
   * Initialize the canvas and create the svg element with all its attributes.
   * @returns {d3.Selection<any, any, any, any>} svgCanvas - The svg canvas element
   */
  public static InitCanvas() {
    //outer = .chart
    //inner = svgCanvas
    //inner = .focalNodeCanvas

    let chart = new Chart();
    this.width = $(".chart")[0].clientWidth;
    this.heigth = $(".chart")[0].clientHeight;

    d3.selection.prototype.setWidthAndHeight = function(width: number, heigth: number) {
      // if (!Canvas.svgCanvas)
      //   throw new DOMException("svgCanvas not set");
      // console.log("Canvas width: " + this.width);
      // console.log("Canvas height: " + this.heigth);

      // this.AddMargin(width, height);

      if (isNaN(width) || isNaN(heigth))
        throw new DOMException("width or heigth is not a number");

      this
        .attr("width", width)
        .attr("height", heigth);
      return this;
    };

    this.svgCanvas = d3.select("#cluster_chart .chart")
      .append("svg:svg")
      .call((selection: any, ...args: any[]) => {
        d3.zoom().on("zoom", (event: any) => {
          MainEntry.scale = event.transform.k;
          selection.attr("transform", event.transform);
        })(selection, ...args);
      })
      .setWidthAndHeight(this.width, this.heigth)
      .attr("id", "svgCanvas")
      .append("svg:g")
      .attr("class", "focalNodeCanvas");

    Canvas.setCanvasSize();
  }

  public static updateWindowSize() {
    console.log("Called method updateWindow");

    // let c = new Chart()
    // this.setCanvasSize(c.width - 60, c.height - 60);
    let width = $(".chart")[0].clientWidth - 60;
    let height = $(".chart")[0].clientHeight - 60;

    Canvas.svgCanvas.attr("width", width).attr("height", height);
    $("#svgCanvas").width(width + 90);
    $("#svgCanvas").height(height + 60);
  }

  private static setCanvasSize(canvasWidth: number = $(".chart")[0].clientWidth,
                               canvasHeigth: number = $(".chart")[0].clientHeight) {
    this.width = canvasWidth + this.margin.left + this.margin.right;
    this.heigth = canvasHeigth + this.margin.top + this.margin.bottom;

    if (!Canvas.svgCanvas)
      console.log("svgCanvas not set");

    this.svgCanvas
      .attr("width", this.width)
      .attr("height", this.heigth);

    // console.log("Canvas width: " + this.width);
    // console.log("Canvas height: " + this.heigth);

    // Canvas.svgCanvas.setWidthAndHeight(Canvas.width, Canvas.heigth)
  }
}
