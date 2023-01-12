import { INode } from "./INode";
import { MyClass } from "./app";
import { SemanticPropertyAndItems } from "./semanticPropertyAndItems";

export class MediaWikiArticle {
  node: INode;
  Id: string;
  semanticNodeList: SemanticPropertyAndItems[];

  constructor(id: string, semanticNodeList: any[]) {
    this.Id = id; //'Abbandono_dei_principi_giornalistici,_nascita_delle_Fuck_News_ed_episodi_vari#0##'
    this.node = this.ParseNodeBrowseBySubject1();

    this.semanticNodeList = [];
    for (const data of semanticNodeList) {
      let item = new SemanticPropertyAndItems(data.property, data.dataitem, data.subject, this);
      this.semanticNodeList.push(item);
    }
  }

  private ParseNodeBrowseBySubject1() {
    let nameDoslike = this.Id.split("#")[0];
    let nodeName = nameDoslike.replace("_", " ");
    let nodeHlink = `./${nameDoslike}`;
    let node = new INode(this.Id, nodeName, "Internal Link", 10, 0, nodeHlink);
    node.fixed = true;
    return node;
  }

  HandleProperties()
  {
    for (const semanticNode of this.semanticNodeList) {
      if (semanticNode.IsSpecialProperty()) continue; // Non fare nulla se la proprietà è una delle proprietà speciali "_SKEY", "_MDAT" o "_ASK"

      semanticNode.SemanticNodeParse();

      for (let dataitem of semanticNode.nodeAndLinks) {
        MyClass.nodeSet.push(dataitem.node);
        MyClass.linkSet.push(dataitem.link);
      }
    }
  }


}