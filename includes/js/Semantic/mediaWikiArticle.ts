import { INode } from "../Model/INode";
import { MainEntry } from "../app";
import { SemanticPropertyAndItems } from "./semanticPropertyAndItems";
import { NodeType } from "../Model/nodeType";
import { NodeStore } from "../nodeStore";

export class MediaWikiArticle {
  node: INode;
  Id: string;
  semanticNodeList: SemanticPropertyAndItems[];

  constructor(id: string, semanticNodeList: any[]) {
    this.Id = id; //'Abbandono_dei_principi_giornalistici,_nascita_delle_Fuck_News_ed_episodi_vari#0##'
    MainEntry.focalNodeID = id;
    this.node = this.ParseNodeBrowseBySubject();

    this.semanticNodeList = [];
    for (const data of semanticNodeList) {
      let item = new SemanticPropertyAndItems(data.property, data.dataitem, data.subject, this);
      this.semanticNodeList.push(item);
    }
  }

  private ParseNodeBrowseBySubject() {
    let nameDoslike = this.Id.split("#")[0];
    let nodeName = nameDoslike.replace("_", " ");
    let node = new INode(NodeType.Article, this.Id, nodeName, "Internal Link", 10, 0, `./${nameDoslike}`);
    node.fixed = true;
    return node;
  }

  HandleProperties()
  {
    for (const semanticNode of this.semanticNodeList) {
      if (semanticNode.IsSpecialProperty()) continue; // Non fare nulla se la proprietà è una delle proprietà speciali "_SKEY", "_MDAT" o "_ASK"

      semanticNode.SemanticNodeParse();

      for (let dataitem of semanticNode.nodeAndLinks) {
        NodeStore.nodeList.push(dataitem.node);
        NodeStore.linkList.push(dataitem.link);
      }
    }
  }
}