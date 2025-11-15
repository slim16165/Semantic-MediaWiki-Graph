import { MainEntry } from "../app";
import { NodeType } from "../Model/nodeType";
import { MediaWikiArticle } from "../SemanticMediaWikiApi/Types/mediaWikiArticle";
import { INode } from "../Model/INode";
import { Link } from "../Model/Link";
import { SemanticPropertyAndItems2Node } from "./semanticPropertyAndItems2Node";

export class MediaWiki2NodesExt  {

  static getNodesAndLinks(article : MediaWikiArticle) {
    MainEntry.focalNodeID = article.Id;
    let node = this.GetNode(article);
    let propertyList = this.ConvertPropertiesToNodesAndLinks(article);
    let nodeList = propertyList.nodeList.concat(node);
    let linkList = propertyList.linkList;

    return {nodeList, linkList}
  }

  private static GetNode(article: MediaWikiArticle) {
    console.log("Method enter: GetNode");
    let nameDoslike = article.Id.split("#")[0];
    let nodeName = nameDoslike.replace("_", " ");
    let node = new INode(NodeType.Article, article.Id, nodeName, "Internal Link", 10, 0, `./${nameDoslike}`);
    node.fixed = true;
    return node;
  }

  private static ConvertPropertiesToNodesAndLinks(article: MediaWikiArticle): { linkList: Link[]; nodeList: INode[] } {
    console.log("Method enter: HandleProperties");

    let nodeList = [];
    let linkList = [];

    for (let semanticNode of article.semanticNodeList) {
      if (semanticNode.IsSpecialProperty()) continue; // Non fare nulla se la proprietà è una delle proprietà speciali "_SKEY", "_MDAT" o "_ASK"


      semanticNode.SetUri();

      //All the nodes should be initialized before the links
      for (let dataitem of semanticNode.dataitems) {
        let node = SemanticPropertyAndItems2Node.GetNode(semanticNode, dataitem);
        nodeList.push(node);
      }

      for (let dataitem of semanticNode.dataitems) {
        let link = SemanticPropertyAndItems2Node.GetLink(semanticNode, dataitem);
        linkList.push(link);
      }
    }

    return { nodeList, linkList };
  }
}