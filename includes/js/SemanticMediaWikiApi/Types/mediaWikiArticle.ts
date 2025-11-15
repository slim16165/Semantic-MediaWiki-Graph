import { SemanticPropertyAndItems } from "./semanticPropertyAndItems";

export class MediaWikiArticle {
  Id: string;
  semanticNodeList: SemanticPropertyAndItems[];

  constructor(id: string, semanticNodeList : any) {
    console.log("Method enter: MediaWikiArticle constructor");
    this.Id = id; //'Abbandono_dei_principi_giornalistici,_nascita_delle_Fuck_News_ed_episodi_vari#0##'

    this.semanticNodeList = []  ;
    for (const data of semanticNodeList) {
      let item = new SemanticPropertyAndItems(data.property, data.dataitem, data.subject, this);
      this.semanticNodeList.push(item);
    }
  }
}