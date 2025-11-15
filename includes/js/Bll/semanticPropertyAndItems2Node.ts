import { PropertyDataItem } from "../SemanticMediaWikiApi/Types/propertyDataItem";
import { NodeType } from "../Model/nodeType";
import { SemanticPropertyAndItems } from "../SemanticMediaWikiApi/Types/semanticPropertyAndItems";
import { INode } from "../Model/INode";
import { Link } from "../Model/Link";

export class SemanticPropertyAndItems2Node  {

  static GetNode(prop : SemanticPropertyAndItems, dataitem: PropertyDataItem) {
    //In the original version it was using the firstElement for the last 2 parameters
    let name = this.parseNodeName(dataitem.item, dataitem.typeStr);
    let hlink = this.parseHlink(dataitem.item, dataitem.typeStr, prop.sourceNodeUrl);
    let node = new INode(NodeType.Property, dataitem.item, name, "null", 0, 0, hlink);
    return node;
  }

  static GetLink(prop : SemanticPropertyAndItems, dataitem: PropertyDataItem) {
    return new Link(NodeType.Property, prop.nicePropertyName, prop.sourceNodeUrl, dataitem.item /*targetId*/, "");
  }

  private static parseNodeName(nameToParse: string, type: string) {
    function parseNodeName() {
      return nameToParse.split("#")[0].replace("_", " ");
    }

    let name;

    switch (type) {
      case "URI":
        name = parseNodeName();
        break;
      case "Internal Link":
        name = parseNodeName();
        break;
      case "Date":
        name = nameToParse.substring(2);
        break;
      case "Boolean":
        name = nameToParse === "t" ? "true" : "false";
        break;
      default:
        name = parseNodeName();
        break;
    }
    return name;
  }

  private static parseHlink(nameToParse: string, type: string, url: string) {
    return type === "URI" ? url : type === "Internal Link" ? `./${nameToParse.split("#")[0]}` : "";
  }
}