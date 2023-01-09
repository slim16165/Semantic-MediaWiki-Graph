"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utility = void 0;
var d3_1 = require("d3");
var ColorHelper_1 = require("../ColorHelper");
var app_1 = require("../app");
var Utility = /** @class */ (function () {
    function Utility() {
    }
    Utility.drawCluster = function (drawingName, focalNode, nodeSetApp, linkSetApp, selectString, colors) {
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
        var _this = this;
        this.this1 = this;
        var sortedColors = ColorHelper_1.ColorHelper.GetColors(colors, nodeSetApp);
        var svgCanvas = this.InitCanvas(selectString);
        this.InitialSetup(nodeSetApp, linkSetApp);
        // Create a force layout and bind Nodes and Links
        var force = this.CreateAForceLayoutAndBindNodesAndLinks(nodeSetApp)
            .on("tick", function () {
            _this.Tick(link, node, linkText);
        });
        // Draw lines for Links between Nodes
        var link = this.DrawLinesForLinksBetweenNodes(svgCanvas);
        var clickText = false;
        // Create Nodes
        var node = this.CreateNodes(svgCanvas, force);
        // Append circles to Nodes
        this.AppendCirclesToNodes(node);
        // Append text to Nodes
        this.AppendTextToNodes(node);
        // Append text to Link edges
        var linkText = this.AppendTextToLinkEdges(svgCanvas);
        // Print Legend Title...
        this.PrintLegendTitle(svgCanvas);
        //Build the Arrows
        this.BuildTheArrows({ svgCanvas: svgCanvas });
        // Plot the bullet circles...
        this.PlotTheBulletCircles({ svgCanvas: svgCanvas }, sortedColors);
        // Create legend text that acts as label keys...
        this.CreateLegendTextThatActsAsLabelKeys({ svgCanvas: svgCanvas }, sortedColors);
        d3_1.default.select(window).on('resize.updatesvg', this.updateWindow);
    };
    Utility.InitialSetup = function (nodeSetApp, linkSetApp) {
        var node_hash = [];
        var type_hash = [];
        // Create a hash that allows access to each node by its id
        nodeSetApp.forEach(function (node1) {
            node_hash[node1.id] = node1;
            type_hash[node1.type] = node1.type;
        });
        // Append the source Node and the target Node to each Link
        linkSetApp.forEach(function (link1) {
            link1.source = node_hash[link1.sourceId];
            link1.target = node_hash[link1.targetId];
            link1.direction = link1.sourceId === app_1.MyClass.focalNodeID ? "OUT" : "IN";
        });
    };
    Utility.updateWindow = function () {
        this.width = $(".chart")[0].clientWidth - 60;
        this.height = $(".chart")[0].clientHeight - 60;
        this.svgCanvas.attr("width", this.width).attr("height", this.height);
        $('#svgCanvas').width(this.width + 90);
        $('#svgCanvas').height(this.height + 60);
    };
    Utility.clickLegend = function () {
        var selector = this.this1;
        var thisObject = d3_1.default.select(selector);
        var typeValue = thisObject.attr("type_value");
        var invisibleType = [];
        var invIndexType = invisibleType.indexOf(typeValue);
        if (invIndexType > -1) {
            invisibleType.splice(Number(typeValue), 1);
        }
        else {
            invisibleType.push(typeValue);
        }
        $(".node").each(MakeInvisible);
        function MakeInvisible(index, el) {
            if (el.__data__.type !== typeValue) {
                return;
            }
            var invIndex = app_1.MyClass.invisibleNode.indexOf(el.__data__.id);
            if (invIndex > -1) {
                app_1.MyClass.invisibleNode.splice(invIndex, 1);
            }
            else {
                app_1.MyClass.invisibleNode.push(el.__data__.id);
            }
            $(this).toggle();
        }
        $(".gLink").each(MakeInvisible2);
        function MakeInvisible2(index, el) {
            //      debugger;
            var valSource = el.__data__.sourceId;
            var valTarget = el.__data__.targetId;
            //if beide
            var indexSource = app_1.MyClass.invisibleNode.indexOf(valSource);
            var indexTarget = app_1.MyClass.invisibleNode.indexOf(valTarget);
            var indexEdge = app_1.MyClass.invisibleEdge.indexOf("".concat(valSource, "_").concat(valTarget, "_").concat(el.__data__.linkName));
            if ((indexSource > -1 || indexTarget > -1) && indexEdge === -1) {
                //Einer der beiden Knoten ist unsichtbar, aber Kante noch nicht
                $(this).toggle();
                app_1.MyClass.invisibleEdge.push("".concat(valSource, "_").concat(valTarget, "_").concat(el.__data__.linkName));
            }
            else if (indexSource === -1 && indexTarget === -1 && indexEdge === -1) {
                //Beide Knoten sind nicht unsichtbar und Kante ist nicht unsichtbar
            }
            else if (indexSource === -1 && indexTarget === -1 && indexEdge > -1) {
                //Knoten sind nicht unsichtbar, aber Kante ist es
                $(this).toggle();
                app_1.MyClass.invisibleEdge.splice(indexEdge, 1);
            }
        }
    };
    ;
    Utility.mouseClickNode = function (clickText) {
        var selector = this.this1;
        var thisObject = d3_1.default.select(selector);
        var typeValue = thisObject.attr("type_value");
        if (!clickText && typeValue === 'Internal Link') {
            var n = thisObject[0][0].__data__.name;
            if (!app_1.MyClass.done.includes(n)) {
                app_1.MyClass.askNode(n);
            }
        }
        clickText = false;
    };
    ;
    Utility.mouseClickNodeText = function (clickText) {
        var selector = this.this1;
        var win;
        var thisObject = d3_1.default.select(selector);
        var typeValue = thisObject.attr("type_value");
        if (typeValue === 'Internal Link') {
            //    var win = window.open("index.php/" + thisObject[0][0].__data__.hlink);
            var win_1 = window.open(thisObject[0][0].__data__.hlink);
        }
        else if (typeValue === 'URI') {
            var win_2 = window.open(thisObject[0][0].__data__.hlink);
        }
        clickText = true;
    };
    ;
    Utility.nodeMouseOver = function () {
        var selector = this.this1;
        var thisObject = d3_1.default.select(selector);
        var typeValue = thisObject.attr("type_value");
        var strippedTypeValue = typeValue.replace(/ /g, "_");
        d3_1.default.select(selector).select("circle").transition()
            .duration(250)
            .attr("r", function (d, i) { return d.id === app_1.MyClass.focalNodeID ? 65 : 15; });
        d3_1.default.select(selector).select("text").transition()
            .duration(250)
            .style("font", "bold 20px Arial")
            .attr("fill", "Blue");
        Utility.setLegendStyles("strippedTypeValue", "Maroon", 1.2 * 6);
    };
    ;
    Utility.nodeMouseOut = function () {
        var _this = this;
        var selector = this.this1;
        var thisObject = d3_1.default.select(selector);
        var typeValue = thisObject.attr("type_value");
        var colorValue = thisObject.attr("color_value");
        var strippedTypeValue = typeValue.replace(/ /g, "_");
        d3_1.default.select(selector).select("circle").transition()
            .duration(250)
            .attr("r", function (d, i) { return d.id === app_1.MyClass.focalNodeID ? _this.centerNodeSize : _this.nodeSize; });
        d3_1.default.select(selector).select("text").transition()
            .duration(250)
            .style("font", "normal 16px Arial")
            .attr("fill", "Blue");
        Utility.setLegendStyles("strippedTypeValue", "colorValue", 6);
    };
    ;
    Utility.typeMouseOver = function (nodeSize) {
        var selector = this.this1;
        var thisObject = d3_1.default.select(selector);
        var typeValue = thisObject.attr("type_value");
        var strippedTypeValue = typeValue.replace(/ /g, "_");
        Utility.setLegendStyles("strippedTypeValue", "Maroon", 1.2 * 6);
        Utility.setNodeStyles(strippedTypeValue, "Maroon", "bold", nodeSize, false);
    };
    Utility.typeMouseOut = function (selector, nodeSize) {
        var thisObject = d3_1.default.select(selector);
        var typeValue = thisObject.attr("type_value");
        var colorValue = thisObject.attr("color_value");
        var strippedTypeValue = typeValue.replace(/ /g, "_");
        Utility.setLegendStyles("strippedTypeValue", "colorValue", 6);
        Utility.setNodeStyles(strippedTypeValue, "Blue", "normal", nodeSize, false);
    };
    Utility.InitCanvas = function (selectString) {
        var _this = this;
        var svgCanvas = d3_1.default.select(selectString)
            .append("svg:svg")
            .call(d3_1.default.zoom().on("zoom", function () {
            _this.scale = d3_1.default.event.transform.k;
            svgCanvas.attr("transform", d3_1.default.event.transform);
        }))
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("id", "svgCanvas")
            .append("svg:g")
            .attr("class", "focalNodeCanvas");
        return svgCanvas;
    };
    Utility.CreateAForceLayoutAndBindNodesAndLinks = function (nodeSetApp) {
        var force = d3_1.default.forceSimulation()
            .nodes(nodeSetApp)
            // .links(linkSetApp)
            .force("charge", d3_1.default.forceManyBody().strength(-1000))
            .force("gravity", d3_1.default.forceManyBody().strength(.01))
            .force("friction", d3_1.default.forceManyBody().strength(.2))
            // .force("link", d3.forceLink().id((d: any) => d.id).distance(100).strength(1)) => d.id).strength(9))
            // .force("link", d3.forceLink().id((d: any) => d.id).distance((d) => width < height ? width * 1 / 3 : height * 1 / 3))
            .force("center", d3_1.default.forceCenter(this.width / 2, this.height / 2));
        // .start();
        return force;
    };
    Utility.DrawLinesForLinksBetweenNodes = function (svgCanvas) {
        var link = svgCanvas.selectAll(".gLink")
            // .data(force.links())
            .enter().append("g")
            .attr("class", "gLink")
            //    .attr("class", "link")
            .attr("endNode", function (d, i) { return d.targetId; })
            .attr("startNode", function (d, i) { return d.sourceId; })
            .attr("targetType", function (d, i) { return d.target.type; })
            .attr("sourceType", function (d, i) { return d.source.type; })
            .append("line")
            .style("stroke", "#ccc")
            .style("stroke-width", "1.5px")
            .attr("marker-end", function (d, i) { return "url(#arrow_".concat(i, ")"); })
            .attr("x1", function (l) { return l.source.x; })
            .attr("y1", function (l) { return l.source.y; })
            .attr("x2", function (l) { return l.target.x; })
            .attr("y2", function (l) { return l.target.y; });
        return link;
    };
    Utility.CreateNodes = function (svgCanvas, force) {
        var node = svgCanvas.selectAll(".node")
            .data(force.nodes())
            .enter().append("g")
            .attr("class", "node")
            .attr("id", function (d) { return d.id; })
            .attr("type_value", function (d, i) { return d.type; })
            .attr("color_value", function (d, i) { return ColorHelper_1.ColorHelper.color_hash[d.type]; })
            .attr("xlink:href", function (d) { return d.hlink; })
            //.attr("fixed", function(d) { if (d.id==focalNodeID) { return true; } else { return false; } } )
            .on("mouseover", this.nodeMouseOver)
            .on("click", this.mouseClickNode)
            .on("mouseout", this.nodeMouseOut)
            // .call(force.drag)
            .append("a");
        return node;
    };
    Utility.AppendCirclesToNodes = function (node) {
        var _this = this;
        node.append("circle")
            //.attr("x", function(d) { return d.x; })
            //.attr("y", function(d) { return d.y; })
            .attr("r", function (d) { return d.id === app_1.MyClass.focalNodeID ? _this.centerNodeSize : _this.nodeSize; })
            .style("fill", "White") // Make the nodes hollow looking
            //.style("fill", "transparent")
            .attr("type_value", function (d, i) { return d.type; })
            .attr("color_value", function (d, i) { return ColorHelper_1.ColorHelper.color_hash[d.type]; })
            //.attr("fixed", function(d) { if (d.id==focalNodeID) { return true; } else { return false; } } )
            //.attr("x", function(d) { if (d.id==focalNodeID) { return width/2; } else { return d.x; } })
            //.attr("y", function(d) { if (d.id==focalNodeID) { return height/2; } else { return d.y; } })
            .attr("class", function (d, i) {
            var str = d.type;
            var strippedString = str.replace(/ /g, "_");
            //return "nodeCircle-" + strippedString; })
            return d.id === app_1.MyClass.focalNodeID ? "focalNodeCircle" : "nodeCircle-".concat(strippedString);
        })
            .style("stroke-width", 5) // Give the node strokes some thickness
            .style("stroke", function (d, i) { return ColorHelper_1.ColorHelper.color_hash[d.type]; }); // Node stroke colors
        // .call(force.drag);
    };
    Utility.AppendTextToNodes = function (node) {
        node.append("text")
            .attr("x", function (d) { return d.id === app_1.MyClass.focalNodeID ? 0 : 20; })
            .attr("y", function (d) {
            return d.id === app_1.MyClass.focalNodeID ? 0 : -10;
        })
            .attr("text-anchor", function (d) { return d.id === app_1.MyClass.focalNodeID ? "middle" : "start"; })
            .on("click", this.mouseClickNodeText)
            .attr("font-family", "Arial, Helvetica, sans-serif")
            .style("font", "normal 16px Arial")
            .attr("fill", "Blue")
            .style("fill", function (d, i) { return ColorHelper_1.ColorHelper.color_hash[d]; })
            .attr("type_value", function (d, i) { return d.type; })
            .attr("color_value", function (d, i) { return ColorHelper_1.ColorHelper.color_hash[d.type]; })
            .attr("class", function (d, i) {
            var str = d.type;
            var strippedString = str.replace(/ /g, "_");
            //return "nodeText-" + strippedString; })
            return d.id === app_1.MyClass.focalNodeID ? "focalNodeText" : "nodeText-".concat(strippedString);
        })
            .attr("dy", ".35em")
            .text(function (d) { return d.name; });
    };
    Utility.AppendTextToLinkEdges = function (svgCanvas) {
        var linkText = svgCanvas.selectAll(".gLink")
            // .data(force.links())
            .append("text")
            .attr("font-family", "Arial, Helvetica, sans-serif")
            .attr("x", function (d) { return d.target.x > d.source.x ? (d.source.x + (d.target.x - d.source.x) / 2) : (d.target.x + (d.source.x - d.target.x) / 2); })
            .attr("y", function (d) { return d.target.y > d.source.y ? (d.source.y + (d.target.y - d.source.y) / 2) : (d.target.y + (d.source.y - d.target.y) / 2); })
            .attr("fill", "Black")
            .style("font", "normal 12px Arial")
            .attr("dy", ".35em")
            .text(function (d) { return d.linkName; });
        return linkText;
    };
    Utility.updateLinkPositions = function (link, data, source, target) {
        link.attr("x1", function (link) { return source.x; })
            .attr("y1", function (link) { return source.y; })
            .attr("x2", function (link) { return target.x; })
            .attr("y2", function (link) { return target.y; });
    };
    Utility.updateNodePositions = function (node, clientWidth, clientHeight) {
        var _this = this;
        node.attr("cx", function (d) {
            if (d.id === app_1.MyClass.focalNodeID) {
                var s = 1 / _this.scale;
                return d.x = Math.max(60, Math.min(s * (clientWidth - 60), d.x));
            }
            else {
                var s = 1 / _this.scale;
                return d.x = Math.max(20, Math.min(s * (clientWidth - 20), d.x));
            }
        }).attr("cy", function (d) {
            if (d.id === app_1.MyClass.focalNodeID) {
                var s = 1 / _this.scale;
                return d.y = Math.max(60, Math.min(s * (clientHeight - 60), d.y));
            }
            else {
                var s = 1 / _this.scale;
                return d.y = Math.max(20, Math.min(s * (clientHeight - 20), d.y));
            }
        });
    };
    Utility.Tick = function (link, node, linkText) {
        var clientWidth = $(".chart")[0].clientWidth;
        var clientHeight = $(".chart")[0].clientHeight;
        Utility.updateLinkPositions(link, link.data(), link.source, link.target);
        Utility.updateNodePositions(node, clientWidth, clientHeight);
        Utility.updateLinkPositions(link, link.data(), link.source, link.target);
        node.attr("transform", function (d) { return "translate(".concat(d.x, ",").concat(d.y, ")"); });
        linkText
            .attr("x", function (d) { return d.target.x > d.source.x ? (d.source.x + (d.target.x - d.source.x) / 2) : (d.target.x + (d.source.x - d.target.x) / 2); })
            .attr("y", function (d) { return d.target.y > d.source.y ? (d.source.y + (d.target.y - d.source.y) / 2) : (d.target.y + (d.source.y - d.target.y) / 2); });
    };
    Utility.CreateLegendTextThatActsAsLabelKeys = function (svgCanvas, sortedColors) {
        svgCanvas.selectAll("a.legend_link")
            .data(sortedColors) // Instruct to bind dataSet to text elements
            .enter().append("svg:a") // Append legend elements
            .append("text")
            .attr("text-anchor", "center")
            .attr("x", 40)
            .attr("y", function (d, i) { return (45 + (i * 20)); })
            .attr("dx", 0)
            .attr("dy", "4px") // Controls padding to place text in alignment with bullets
            .text(function (d) { return d; })
            .attr("color_value", function (d, i) { return ColorHelper_1.ColorHelper.color_hash[d]; })
            .attr("type_value", function (d, i) { return d; })
            .attr("index_value", function (d, i) { return "index-".concat(i); })
            .attr("class", function (d) {
            var strippedString = d.replace(/ /g, "_");
            return "legendText-".concat(strippedString);
        })
            .style("fill", "Black")
            .style("font", "normal 14px Arial")
            .on('mouseover', this.typeMouseOver)
            .on("mouseout", this.typeMouseOut);
    };
    Utility.PlotTheBulletCircles = function (svgCanvas, sortedColors) {
        svgCanvas.selectAll("focalNodeCanvas")
            .data(sortedColors).enter().append("svg:circle") // Append circle elements
            .attr("cx", 20)
            .attr("cy", function (d, i) { return (45 + (i * 20)); })
            .attr("stroke-width", ".5")
            .style("fill", function (d, i) { return ColorHelper_1.ColorHelper.color_hash[d]; })
            .attr("r", 6)
            .attr("color_value", function (d, i) { return ColorHelper_1.ColorHelper.color_hash[d]; })
            .attr("type_value", function (d, i) { return d; })
            .attr("index_value", function (d, i) { return "index-".concat(i); })
            .attr("class", function (d) {
            var strippedString = d.replace(/ /g, "_");
            return "legendBullet-".concat(strippedString);
        })
            .on('mouseover', this.typeMouseOver)
            .on("mouseout", this.typeMouseOut)
            .on('click', this.clickLegend);
    };
    Utility.BuildTheArrows = function (svgCanvas) {
        svgCanvas.selectAll(".gLink").append("marker")
            .attr("id", function (d, i) { return "arrow_".concat(i); })
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", function (d, i) {
            return d.targetId === app_1.MyClass.focalNodeID ? 55 : 20;
        })
            .attr("refY", 0)
            .attr("markerWidth", 8)
            .attr("markerHeight", 8)
            .attr("orient", "auto")
            .append("svg:path")
            .attr("d", "M0,-5L10,0L0,5");
    };
    Utility.PrintLegendTitle = function (svgCanvas) {
        svgCanvas.append("text").attr("class", "region")
            .text("Color Keys for Data Types...")
            .attr("x", 15)
            .attr("y", 25)
            .style("fill", "Black")
            .style("font", "bold 16px Arial")
            .attr("text-anchor", "start");
    };
    Utility.setNodeStyles = function (strippedTypeValue, colorValue, fontWeight, nodeSize, focalNode) {
        var nodeTextSelector = ".nodeText-".concat(strippedTypeValue);
        var selectedNodeText = d3_1.default.selectAll(nodeTextSelector);
        selectedNodeText.style("font", "".concat(fontWeight, " 16px Arial"));
        selectedNodeText.style("fill", colorValue);
        var nodeCircleSelector = ".nodeCircle-".concat(strippedTypeValue);
        var selectedCircle = d3_1.default.selectAll(nodeCircleSelector);
        selectedCircle.style("fill", colorValue);
        selectedCircle.style("stroke", colorValue);
        selectedCircle.attr("r", focalNode ? nodeSize : 1.2 * nodeSize);
        if (focalNode) {
            var focalNodeCircleSelector = ".focalNodeCircle";
            var selectedFocalNodeCircle = d3_1.default.selectAll(focalNodeCircleSelector);
            selectedFocalNodeCircle.style("stroke", colorValue);
            selectedFocalNodeCircle.style("fill", "White");
            var focalNodeTextSelector = ".focalNodeText";
            var selectedFocalNodeText = d3_1.default.selectAll(focalNodeTextSelector);
            selectedFocalNodeText.style("fill", colorValue);
            selectedFocalNodeText.style("font", "".concat(fontWeight, " 16px Arial"));
        }
    };
    Utility.setLegendStyles = function (strippedTypeValue, colorValue, radius) {
        var legendBulletSelector = ".legendBullet-".concat(strippedTypeValue);
        var selectedBullet = d3_1.default.selectAll(legendBulletSelector);
        selectedBullet.style("fill", colorValue);
        selectedBullet.attr("r", radius);
        var legendTextSelector = ".legendText-".concat(strippedTypeValue);
        var selectedLegendText = d3_1.default.selectAll(legendTextSelector);
        selectedLegendText.style("font", colorValue === "Maroon" ? "bold 14px Arial" : "normal 14px Arial");
        selectedLegendText.style("fill", colorValue === "Maroon" ? "Maroon" : "Black");
    };
    Utility.width = $(".chart")[0].clientWidth;
    Utility.height = $(".chart")[0].clientHeight;
    Utility.centerNodeSize = 50;
    Utility.nodeSize = 10;
    Utility.scale = 1;
    return Utility;
}());
exports.Utility = Utility;
