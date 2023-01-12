"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorHelper = void 0;
// @ts-ignore
var d3_1 = require("d3");
var ColorHelper = /** @class */ (function () {
    function ColorHelper() {
    }
    ColorHelper.colorScaleMW = function (type) {
        return this.color[type];
    };
    ColorHelper.GetColor = function (colors) {
        var colorScale;
        switch (colors) {
            case "colorScale10":
                colorScale = d3_1.default.schemeCategory10;
                break;
            case "colorScale20":
                colorScale = d3_1.default.schemeCategory20;
                break;
            case "colorScale20b":
                colorScale = d3_1.default.schemeCategory20b;
                break;
            case "colorScale20c":
                colorScale = d3_1.default.schemeCategory20c;
                break;
            default:
                colorScale = d3_1.default.schemeCategory20c;
        }
    };
    ColorHelper.GetColors = function (colors, nodeSetApp) {
        var _this = this;
        // Color Scale Handling...
        ColorHelper.GetColor(colors);
        // Create a hash that maps colors to types...
        nodeSetApp.forEach(function (d, i) {
            _this.color_hash[d.type] = d.type;
        });
        var sortedColors = ColorHelper.keys(this.color_hash).sort();
        sortedColors.forEach(function (d, i) {
            _this.color_hash[d] = ColorHelper.colorScaleMW(d);
            //document.writeln(color_hash[d]);
        });
        // Add colors to original node records...
        nodeSetApp.forEach(function (d, i) {
            d.color = _this.color_hash[d.type];
            //document.writeln(d.type);
        });
        return sortedColors;
    };
    ColorHelper.keys = function (obj) {
        var keys = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                keys.push((key));
            }
        }
        return keys;
    };
    ColorHelper.color = {
        InternalLink: '#1f77b4',
        Category: '#071f55',
        URI: '#17a8cf',
        Telephone: '#13d1e3',
        Email: '#75d3dd',
        Number: '#2ca02c',
        Quantity: '#114911',
        Temperature: '#b6e75a',
        MonolingualText: '#f2cd0c',
        Text: '#ff7f0e',
        Code: '#b37845',
        Boolean: '#d62728',
        Date: '#d62790',
        Record: '#8927d6'
    };
    ColorHelper.color_hash = [];
    return ColorHelper;
}());
exports.ColorHelper = ColorHelper;
