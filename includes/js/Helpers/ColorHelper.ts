import d3 from "d3-scale-chromatic";
import {INode} from "../Model/INode";
import { NodeStore } from "../nodeStore";

//TODO: color maanagement doesn't work properly
export class ColorHelper
{
    private static color = {
        "InternalLink": '#1f77b4',
        "Category": '#071f55',
        "URI": '#17a8cf',
        "Telephone": '#13d1e3',
        "Email": '#75d3dd',
        "Number": '#2ca02c',
        "Quantity": '#114911',
        "Temperature": '#b6e75a',
        "MonolingualText": '#f2cd0c',
        "Text": '#ff7f0e',
        "Code": '#b37845',
        "Boolean": '#d62728',
        "Date": '#d62790',
        "Record": '#8927d6'
    };

    public static colorScaleMW(type: string) : string {
        const colorArray = Object.entries(this.color).map(([name, color]) => ({ name, color }));
        const colorObject = colorArray.find(c => c.name === type);
        return colorObject ? colorObject.color : "green";
    }

    public static color_hash: { [key: string]: string } = {};


    public static GetColor(colorScaleName: string)
    {
        let  colorScale: readonly string[];
        switch (colorScaleName) {
            // case "colorScale10":
            //     colorScale = d3.schemeSet1;
            //     break;
            // case "colorScale20":
            //     colorScale = d3.schemeSet2;
            //     break;
            // case "colorScale20b":
            //     colorScale = d3.schemeSet3;
            //     break;
            default:
                colorScale = d3.schemeSet1;
        }
        return colorScale;
    }

    public static GetColors(colorScaleName: string) {
        // Color Scale Handling...
        //ColorHelper.GetColor(colorScaleName);

        // Create a hash that maps colors to types...
        NodeStore.nodeList.forEach((d: INode) => {
            this.color_hash[d.type] = "green";
        });

        const sortedColors = ColorHelper.keys(this.color_hash).sort();

        sortedColors.forEach((d: string) => {
            this.color_hash[d] = ColorHelper.colorScaleMW(d);
            //document.writeln(color_hash[d]);
        });


        // Add colors to original node records...
        NodeStore.nodeList.forEach((d: INode) => {
            d.color = this.color_hash[d.type];
            //document.writeln(d.type);
        });
        return sortedColors;
    }

    public static keys(obj: { [p: string]: string })
    {
        const keys = [];

        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                keys.push((key));
            }
        }
        return keys;
    }
}