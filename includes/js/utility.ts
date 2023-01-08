import * as d3 from 'd3';
import {ColorHelper} from "./ColorHelper";
import {MyClass} from "./app";
import {ILink, INode} from "./OtherTypes";
// import $ from "JQuery";

export class Utility {
    public static width = $(".chart")[0].clientWidth;
    public static height = $(".chart")[0].clientHeight;
    public static centerNodeSize = 50;
    public static nodeSize = 10;

    public static scale = 1;

    public static this1: typeof Utility;
    private static svgCanvas: any;

    public static drawCluster(drawingName: string, focalNode: string, nodeSetApp: INode[],
                              linkSetApp: ILink[], selectString: string, colors: any): void {
        // drawingName => A unique drawing identifier that has no spaces, no "." and no "#" characters.
        // focalNode => Primary Node of Context.
        // nodeSetApp => Set of nodes and their relevant data.
        // linkSetApp => Set of links and their relevant data.
        // selectString => String that allows you to pass in
        //           a D3 select string.
        // colors => String to set color scale.  Values can be...
        //           => "colorScale10"
        //           => "colorScale20"
        //           => "colorScale20b"
        //           => "colorScale20c"
        // margin => Integer margin offset value.
        // outerRadius => Integer outer radius value.
        // innerRadius => Integer inner radius value.
        // sortArcs => Controls sorting of Arcs by value.
        //              0 = No Sort.  Maintain original order.
        //              1 = Sort by arc value size.

        this.this1 = this;

        const sortedColors = ColorHelper.GetColors(colors, nodeSetApp);

        const svgCanvas = this.InitCanvas(selectString);

        this.InitialSetup(nodeSetApp, linkSetApp);

        // Append text to Link edges
        const linkText = this.AppendTextToLinkEdges(svgCanvas);

        // Create a force layout and bind Nodes and Links
        let force = this.CreateAForceLayoutAndBindNodesAndLinks(nodeSetApp)
            .on("tick", () => {
                this.Tick(link, node as any, linkText as any);
            });

        // Draw lines for Links between Nodes
        let link = this.DrawLinesForLinksBetweenNodes(svgCanvas);
        // let clickText = false;

        // Create Nodes
        const node = this.CreateNodes(svgCanvas, force);

        // Append circles to Nodes
        this.AppendCirclesToNodes(node);

        // Append text to Nodes
        this.AppendTextToNodes(node);




        // Print Legend Title...
        this.PrintLegendTitle(svgCanvas);

        //Build the Arrows
        this.BuildTheArrows({svgCanvas: svgCanvas});

        // Plot the bullet circles...
        this.PlotTheBulletCircles({svgCanvas: svgCanvas}, sortedColors);

        // Create legend text that acts as label keys...
        this.CreateLegendTextThatActsAsLabelKeys({svgCanvas: svgCanvas}, sortedColors);


        d3.select(window).on('resize.updatesvg', this.updateWindow);
    }

    private static InitialSetup(nodeSetApp: INode[], linkSetApp: ILink[]) {
        const node_hash: { [key: string]: INode } = {};
        const type_hash: { [key: string]: string } = {};

        nodeSetApp.forEach((node1: INode) => {
            node_hash[node1.id] = node1;
            type_hash[node1.type] = node1.type;
        });

        // Append the source Node and the target Node to each Link
        linkSetApp.forEach((link1: ILink) => {
            link1.source = node_hash[link1.sourceId];
            link1.target = node_hash[link1.targetId];
            link1.direction = link1.sourceId === MyClass.focalNodeID ? "OUT" : "IN";
        });
    }

    public static updateWindow() {
        this.width = $(".chart")[0].clientWidth - 60;
        this.height = $(".chart")[0].clientHeight - 60;

        this.svgCanvas.attr("width", this.width).attr("height", this.height);
        $('#svgCanvas').width(this.width + 90);
        $('#svgCanvas').height(this.height + 60);
    }

    public static clickLegend() {

        // let selector = this.this1;
        // const thisObject = Array.isArray(selector) ? d3.select(selector[0]) : d3.select(selector /*vuole una stringa*/);
        // const typeValue: string = thisObject.attr("type_value");
        //
        // let invisibleType: string[] = [];
        // const invIndexType = invisibleType.indexOf(typeValue);
        // if (invIndexType > -1) {
        //     invisibleType.splice(Number(typeValue), 1);
        // } else {
        //     invisibleType.push(typeValue);
        // }
        // $(".node").each(MakeInvisible(undefined, undefined));
        //
        // function MakeInvisible(index: any, el: CustomHTMLElement) {
        //     if (el.__data__.type !== typeValue) {
        //         return;
        //     }
        //     const invIndex = MyClass.invisibleNode.indexOf(el.__data__.id);
        //     if (invIndex > -1) {
        //         MyClass.invisibleNode.splice(invIndex, 1);
        //     } else {
        //         MyClass.invisibleNode.push(el.__data__.id);
        //     }
        //     $(this).toggle();
        //
        // }
        //
        // $(".gLink").each(MakeInvisible2);
        //
        // function MakeInvisible2(index, el: CustomHTMLElement) {
        //     //      debugger;
        //     const valSource = el.__data__.sourceId;
        //     const valTarget = el.__data__.targetId;
        //     //if beide
        //     const indexSource = MyClass.invisibleNode.indexOf(valSource);
        //     const indexTarget = MyClass.invisibleNode.indexOf(valTarget);
        //     const indexEdge = MyClass.invisibleEdge.indexOf(`${valSource}_${valTarget}_${el.__data__.linkName}`);
        //
        //     if ((indexSource > -1 || indexTarget > -1) && indexEdge === -1) {
        //         //Einer der beiden Knoten ist unsichtbar, aber Kante noch nicht
        //         $(this).toggle();
        //         MyClass.invisibleEdge.push(`${valSource}_${valTarget}_${el.__data__.linkName}`);
        //     } else if (indexSource === -1 && indexTarget === -1 && indexEdge === -1) {
        //         //Beide Knoten sind nicht unsichtbar und Kante ist nicht unsichtbar
        //     } else if (indexSource === -1 && indexTarget === -1 && indexEdge > -1) {
        //         //Knoten sind nicht unsichtbar, aber Kante ist es
        //         $(this).toggle();
        //         MyClass.invisibleEdge.splice(indexEdge, 1);
        //     }
        // }
    };

    public static mouseClickNode(clickText: boolean) {
        // let selector = this.this1;
        // const thisObject : Selection<any, any, HTMLElement, any> = d3.select(selector);
        // const typeValue = thisObject.attr("type_value");
        //
        // if (!clickText && typeValue === 'Internal Link') {
        //     const n = thisObject[0][0].__data__.name;
        //     if (!MyClass.done.includes(n)) {
        //         MyClass.askNode(n);
        //     }
        // }

        clickText = false;
    };

    public static mouseClickNodeText(clickText: boolean) {
        // let selector = this.this1;
        // // let win: any;
        // const thisObject = d3.select(selector);
        // const typeValue = thisObject.attr("type_value");
        //
        // if (typeValue === 'Internal Link') {
        //     //    var win = window.open("index.php/" + thisObject[0][0].__data__.hlink);
        //     let win = window.open(thisObject[0][0].__data__.hlink);
        // } else if (typeValue === 'URI') {
        //     let win = window.open(thisObject[0][0].__data__.hlink);
        // }

        clickText = true;
    };

    public static nodeMouseOver() {
        let selector = this.this1;
        // const thisObject = d3.select(selector);
        // const typeValue = thisObject.attr("type_value");
        // const strippedTypeValue = typeValue.replace(/ /g, "_");
        //
        // d3.select(selector).select("circle").transition()
        //     .duration(250)
        //     .attr("r", (d: any, i) => d.id === MyClass.focalNodeID ? 65 : 15);
        // d3.select(selector).select("text").transition()
        //     .duration(250)
        //     .style("font", "bold 20px Arial")
        //     .attr("fill", "Blue");

        Utility.setLegendStyles("strippedTypeValue", "Maroon", 1.2 * 6);
    };

    public static nodeMouseOut() {
        let selector = this.this1;
        // const thisObject = d3.select(selector);
        // const typeValue = thisObject.attr("type_value");
        // const colorValue = thisObject.attr("color_value");
        // const strippedTypeValue = typeValue.replace(/ /g, "_");

        // d3.select(selector).select("circle").transition()
        //     .duration(250)
        //     .attr("r", (d: { id: string }) => d.id === MyClass.focalNodeID ? MyClass.centerNodeSize : MyClass.nodeSize);
        // d3.select(selector).select("text").transition()
        //     .duration(250)
        //     .style("font", "normal 16px Arial")
        //     .attr("fill", "Blue");

        Utility.setLegendStyles("strippedTypeValue", "colorValue", 6);
    };

    public static typeMouseOver(nodeSize: number) {
        // let selector = this.this1;
        // const thisObject = d3.select(selector);
        // const typeValue = thisObject.attr("type_value");
        // const strippedTypeValue = typeValue.replace(/ /g, "_");
        //
        // Utility.setLegendStyles("strippedTypeValue", "Maroon", 1.2 * 6);
        // Utility.setNodeStyles(strippedTypeValue, "Maroon", "bold", nodeSize, false);
    }

    public static typeMouseOut(selector: string, nodeSize: number) {
        const thisObject = d3.select(selector);
        const typeValue = thisObject.attr("type_value");
        const colorValue = thisObject.attr("color_value");
        const strippedTypeValue = typeValue.replace(/ /g, "_");

        Utility.setLegendStyles("strippedTypeValue", "colorValue", 6);
        Utility.setNodeStyles(strippedTypeValue, "Blue", "normal", nodeSize, false);
    }

    private static InitCanvas(selectString: string) {
        // const svgCanvas = d3.select(selectString)
        //     .append("svg:svg")
        //     .call(d3.zoom().on("zoom", (event: any) => {
        //         this.scale = event.transform.k;
        //         svgCanvas.attr("transform", event.transform);
        //         }))
        //     .attr("width", this.width)
        //     .attr("height", this.height)
        //     .attr("id", "svgCanvas")
        //     .append("svg:g")
        //     .attr("class", "focalNodeCanvas");
        // return svgCanvas;
    }

    private static CreateAForceLayoutAndBindNodesAndLinks(nodeSetApp: INode[]) {
        let force = d3.forceSimulation()
            .nodes(nodeSetApp)
            // .links(linkSetApp)
            .force("charge", d3.forceManyBody().strength(-1000))
            .force("gravity", d3.forceManyBody().strength(.01))
            .force("friction", d3.forceManyBody().strength(.2))
            // .force("link", d3.forceLink().id((d: any) => d.id).distance(100).strength(1)) => d.id).strength(9))
            // .force("link", d3.forceLink().id((d: any) => d.id).distance((d) => width < height ? width * 1 / 3 : height * 1 / 3))
            .force("center", d3.forceCenter(this.width / 2, this.height / 2))

        // .start();
        return force;
    }

    private static DrawLinesForLinksBetweenNodes(svgCanvas: any) {
        let link: ILink = svgCanvas.selectAll(".gLink")
            // .data(force.links())
            .enter().append("g")
            .attr("class", "gLink")
            //    .attr("class", "link")
            .attr("endNode", (d: CustomDto) => d.targetId)
            .attr("startNode", (d: CustomDto) => d.sourceId)
            .attr("targetType", (d: any) => d.target.type)
            .attr("sourceType", (d: any) => d.source.type)
            .append("line")
            .style("stroke", "#ccc")
            .style("stroke-width", "1.5px")
            .attr("marker-end", (d: any, i: any) => `url(#arrow_${i})`)
            .attr("x1", (l: ILink) => l.source.x)
            .attr("y1", (l: ILink) => l.source.y)
            .attr("x2", (l: ILink) => l.target.x)
            .attr("y2", (l: ILink) => l.target.y);
        return link;
    }

    private static CreateNodes(svgCanvas: any, force: any) {
        const node = svgCanvas.selectAll(".node")
            .data(force.nodes())
            .enter().append("g")
            .attr("class", "node")
            .attr("id", (d: any) => d.id)
            .attr("type_value", (d: any) => d.type)
            .attr("color_value", (d: any) => ColorHelper.color_hash[d.type])
            .attr("xlink:href", (d: any) => d.hlink)
            //.attr("fixed", function(d) { if (d.id==focalNodeID) { return true; } else { return false; } } )
            .on("mouseover", this.nodeMouseOver)
            .on("click", this.mouseClickNode)
            .on("mouseout", this.nodeMouseOut)
            // .call(force.drag)
            .append("a");
        return node;
    }

    private static AppendCirclesToNodes(node: any) {
        node.append("circle")
            //.attr("x", function(d) { return d.x; })
            //.attr("y", function(d) { return d.y; })
            .attr("r", (d: any) => d.id === MyClass.focalNodeID ? this.centerNodeSize : this.nodeSize)
            .style("fill", "White") // Make the nodes hollow looking
            //.style("fill", "transparent")
            .attr("type_value", (d: any) => d.type)
            .attr("color_value", (d: any) => ColorHelper.color_hash[d.type])
            //.attr("fixed", function(d) { if (d.id==focalNodeID) { return true; } else { return false; } } )
            //.attr("x", function(d) { if (d.id==focalNodeID) { return width/2; } else { return d.x; } })
            //.attr("y", function(d) { if (d.id==focalNodeID) { return height/2; } else { return d.y; } })
            .attr("class", (d: any) => {
                const str = d.type;
                const strippedString = str.replace(/ /g, "_");
                //return "nodeCircle-" + strippedString; })
                return d.id === MyClass.focalNodeID ? "focalNodeCircle" : `nodeCircle-${strippedString}`;
            })
            .style("stroke-width", 5) // Give the node strokes some thickness
            .style("stroke", (d: any) => ColorHelper.color_hash[d.type]) // Node stroke colors
        // .call(force.drag);
    }

    private static AppendTextToNodes(node: any) {
        node.append("text")
            .attr("x", (d: any) => d.id === MyClass.focalNodeID ? 0 : 20)
            .attr("y", (d: any) => {
                return d.id === MyClass.focalNodeID ? 0 : -10;
            })
            .attr("text-anchor", (d: any) => d.id === MyClass.focalNodeID ? "middle" : "start")
            .on("click", this.mouseClickNodeText)
            .attr("font-family", "Arial, Helvetica, sans-serif")
            .style("font", "normal 16px Arial")
            .attr("fill", "Blue")
            .style("fill", (d: any) => ColorHelper.color_hash[d])
            .attr("type_value", (d: any) => d.type)
            .attr("color_value", (d: any) => ColorHelper.color_hash[d.type])
            .attr("class", (d: any) => {
                const str = d.type;
                const strippedString = str.replace(/ /g, "_");
                //return "nodeText-" + strippedString; })
                return d.id === MyClass.focalNodeID ? "focalNodeText" : `nodeText-${strippedString}`;
            })
            .attr("dy", ".35em")
            .text((d: any) => d.name);
    }

    private static AppendTextToLinkEdges(svgCanvas: any) {
        const linkText = svgCanvas.selectAll(".gLink")
            // .data(force.links())
            .append("text")
            .attr("font-family", "Arial, Helvetica, sans-serif")
            .attr("x", (d: ILink) => this.getNumber2(d))
            .attr("y", (d: ILink) => this.getNumber2(d))
            .attr("fill", "Black")
            .style("font", "normal 12px Arial")
            .attr("dy", ".35em")
            .text((d: any) => d.linkName);
        return linkText;
    }

    private static getNumber2(d: ILink) {
        return d.target.y > d.source.y ? (d.source.y + (d.target.y - d.source.y) / 2) : (d.target.y + (d.source.y - d.target.y) / 2);
    }

    private static getNumber(d: ILink) {
        return d.target.x > d.source.x ? (d.source.x + (d.target.x - d.source.x) / 2) : (d.target.x + (d.source.x - d.target.x) / 2);
    }

    private static updateLinkPositions(link: any, data: ILink, source: INode, target: INode) {
        link.attr("x1", (link: ILink) => source.x)
            .attr("y1", (link: ILink) => source.y)
            .attr("x2", (link: ILink) => target.x)
            .attr("y2", (link: ILink) => target.y);
    }

    private static updateNodePositions(node: any, clientWidth: number, clientHeight: number) {
        node.attr("cx", (d: any) => {
            if (d.id === MyClass.focalNodeID) {
                const s = 1 / this.scale;
                return d.x = Math.max(60, Math.min(s * (clientWidth - 60), d.x));
            } else {
                const s = 1 / this.scale;
                return d.x = Math.max(20, Math.min(s * (clientWidth - 20), d.x));
            }
        }).attr("cy", (d: any) => {
            if (d.id === MyClass.focalNodeID) {
                const s = 1 / this.scale;
                return d.y = Math.max(60, Math.min(s * (clientHeight - 60), d.y));
            } else {
                const s = 1 / this.scale;
                return d.y = Math.max(20, Math.min(s * (clientHeight - 20), d.y));
            }
        });
    }

    private static Tick(link: any, node: any, linkText: any) {
        let clientWidth = $(".chart")[0].clientWidth;
        let clientHeight = $(".chart")[0].clientHeight;

        Utility.updateLinkPositions(link, link.data(), link.source, link.target);

        Utility.updateNodePositions(node, clientWidth, clientHeight);

        Utility.updateLinkPositions(link, link.data(), link.source, link.target);

        node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);

        linkText
            .attr("x", (d: ILink) => d.target.x > d.source.x ? (d.source.x + (d.target.x - d.source.x) / 2) : (d.target.x + (d.source.x - d.target.x) / 2))
            .attr("y", (d: ILink) => d.target.y > d.source.y ? (d.source.y + (d.target.y - d.source.y) / 2) : (d.target.y + (d.source.y - d.target.y) / 2));
    }

    private static CreateLegendTextThatActsAsLabelKeys(svgCanvas: any, sortedColors: any[]) {
        svgCanvas.selectAll("a.legend_link")
            .data(sortedColors) // Instruct to bind dataSet to text elements
            .enter().append("svg:a") // Append legend elements
            .append("text")
            .attr("text-anchor", "center")
            .attr("x", 40)
            .attr("y", (d: any, i: number) => (45 + (i * 20)))
            .attr("dx", 0)
            .attr("dy", "4px") // Controls padding to place text in alignment with bullets
            .text((d: any) => d)
            .attr("color_value", (d: any) => ColorHelper.color_hash[d])
            .attr("type_value", (d : string) => d)
            .attr("index_value", (d: any, i : number) => `index-${i}`)
            .attr("class", (d: any) => {
                const strippedString = d.replace(/ /g, "_");
                return `legendText-${strippedString}`;
            })
            .style("fill", "Black")
            .style("font", "normal 14px Arial")
            .on('mouseover', this.typeMouseOver)
            .on("mouseout", this.typeMouseOut);
    }

    private static PlotTheBulletCircles(svgCanvas: { svgCanvas?: void; selectAll?: any; }, sortedColors: any[]) {
        svgCanvas.selectAll("focalNodeCanvas")
            .data(sortedColors).enter().append("svg:circle") // Append circle elements
            .attr("cx", 20)
            .attr("cy", (d: any, i: number) => (45 + (i * 20)))
            .attr("stroke-width", ".5")
            .style("fill", (d: number) => ColorHelper.color_hash[d])
            .attr("r", 6)
            .attr("color_value", (d: any) => ColorHelper.color_hash[d])
            .attr("type_value", (d: any) => d)
            .attr("index_value", (d: any, i: number) => `index-${i}`)
            .attr("class", (d: any) => {
                const strippedString = d.replace(/ /g, "_");
                return `legendBullet-${strippedString}`;
            })
            .on('mouseover', this.typeMouseOver)
            .on("mouseout", this.typeMouseOut)
            .on('click', this.clickLegend);
    }

    private static BuildTheArrows(svgCanvas: any) {
        svgCanvas.selectAll(".gLink").append("marker")
            .attr("id", (d: any, i: number) => `arrow_${i}`)
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", (d: any) =>
                d.targetId === MyClass.focalNodeID ? 55 : 20
            )
            .attr("refY", 0)
            .attr("markerWidth", 8)
            .attr("markerHeight", 8)
            .attr("orient", "auto")
            .append("svg:path")
            .attr("d", "M0,-5L10,0L0,5");
    }

    private static PrintLegendTitle(svgCanvas: any) {
        svgCanvas.append("text").attr("class", "region")
            .text("Color Keys for Data Types...")
            .attr("x", 15)
            .attr("y", 25)
            .style("fill", "Black")
            .style("font", "bold 16px Arial")
            .attr("text-anchor", "start");
    }

    private static setNodeStyles(strippedTypeValue: string, colorValue: string, fontWeight: string, nodeSize: number, focalNode: boolean) {
        const nodeTextSelector = `.nodeText-${strippedTypeValue}`;
        const selectedNodeText = d3.selectAll(nodeTextSelector);
        selectedNodeText.style("font", `${fontWeight} 16px Arial`);
        selectedNodeText.style("fill", colorValue);

        const nodeCircleSelector = `.nodeCircle-${strippedTypeValue}`;
        const selectedCircle = d3.selectAll(nodeCircleSelector);
        selectedCircle.style("fill", colorValue);
        selectedCircle.style("stroke", colorValue);
        selectedCircle.attr("r", focalNode ? nodeSize : 1.2 * nodeSize);

        if (focalNode) {
            const focalNodeCircleSelector = ".focalNodeCircle";
            const selectedFocalNodeCircle = d3.selectAll(focalNodeCircleSelector);
            selectedFocalNodeCircle.style("stroke", colorValue);
            selectedFocalNodeCircle.style("fill", "White");

            const focalNodeTextSelector = ".focalNodeText";
            const selectedFocalNodeText = d3.selectAll(focalNodeTextSelector);
            selectedFocalNodeText.style("fill", colorValue);
            selectedFocalNodeText.style("font", `${fontWeight} 16px Arial`);
        }
    }

    private static setLegendStyles(strippedTypeValue: string, colorValue: string, radius: number) {
        const legendBulletSelector = `.legendBullet-${strippedTypeValue}`;
        const selectedBullet = d3.selectAll(legendBulletSelector);
        selectedBullet.style("fill", colorValue);
        selectedBullet.attr("r", radius);

        const legendTextSelector = `.legendText-${strippedTypeValue}`;
        const selectedLegendText = d3.selectAll(legendTextSelector);
        selectedLegendText.style("font", colorValue === "Maroon" ? "bold 14px Arial" : "normal 14px Arial");
        selectedLegendText.style("fill", colorValue === "Maroon" ? "Maroon" : "Black");
    }
}
