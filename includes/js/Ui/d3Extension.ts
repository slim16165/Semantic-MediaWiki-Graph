import * as d3 from "d3";

declare module "d3" {

  export interface Selection<GElement, Datum, PElement, PDatum> {
    setWidthAndHeight(width: number, height: number): Selection<GElement, Datum, PElement, PDatum>;
  }
}

d3.selection.prototype.setWidthAndHeight = function(width: number, height: number) {
  this.attr("width", width + this.margin.left + this.margin.right)
    .attr("height", height + this.margin.top + this.margin.bottom);
  return this;
};