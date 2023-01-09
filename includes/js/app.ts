import { Article, Link } from "./Link";
import "select2";
import { INode } from "./INode";
import { IForce } from "./IForce";
import { NameHelper } from "./nameHelper";
import { DataItem, SemanticNode, SemanticWikiApi } from "./semanticWikiApi";


export class MyClass {
  static invisibleNode: any[] = [];
  static invisibleEdge: string[] = [];
  static invisibleType: any[] = [];
  static downloadedArticles: any[] = [];
  static focalNodeID: string = ""; // Esempio  di valore reale: 'Abbandono_dei_principi_giornalistici,_nascita_delle_Fuck_News_ed_episodi_vari#0##'
  static nodeSet: INode[] = [];
  static linkSet: Link[] = [];
  static force: IForce;

  private static wikiArticleElement: JQuery = $("#wikiArticle");

  constructor() {
    MyClass.InitialPageLoad();
  }

  static InitialPageLoad(): void {
    SemanticWikiApi.AllPagesCall();
    // MyClass.loadScript('select2.full.min.js');

    $(() => {
      $("#visualiseSite").click(() => {
        let wikiArticleTitle = MyClass.wikiArticleElement.val() as string;

        if (wikiArticleTitle === "") {
          // Error Message
          $("#error_msg").show();
        } else {
          $("#error_msg").hide();

          MyClass.downloadedArticles = [];
          SemanticWikiApi.BrowseBySubject(wikiArticleTitle);
        }
      });
    });
  }

  public static getNodesAndLinks(semanticNode: SemanticNode, url: string)
  {
    // Non fare nulla se la proprietà è una delle proprietà speciali "_SKEY", "_MDAT" o "_ASK"
    if (["_SKEY", "_MDAT", "_ASK"].includes(semanticNode.property)) {
      /*
      I valori delle property "_SKEY", "_MDAT" e "_ASK" sono proprietà speciali predefinite in Semantic MediaWiki.
      "_SKEY" è una proprietà che viene utilizzata per memorizzare le chiavi di ricerca per ogni oggetto di dati, che vengono utilizzate per velocizzare le query su quell'oggetto.
      "_MDAT" è una proprietà che viene utilizzata per memorizzare la data di modifica di un oggetto di dati.
      "_ASK" è una proprietà che viene utilizzata per memorizzare una query SPARQL o una query di tipo "ask" per un oggetto di dati. Questa proprietà viene utilizzata per eseguire query complesse sui dati semantici.
      * INST
      */
      return;
    }

    // JSON.stringify(dataitem)
    // '[{"type":9,"item":"Polarizzazione#14##"},{"type":9,"item":"Social_network#14##"},{"type":9,"item":"Cancel_Culture#14##"},{"type":9,"item":"Episodio#14##"},{"type":9,"item":"Razzismo#14##"}]'
    //
    // JSON.stringify(semanticNode)
    // '{"property":"_INST","dataitem":[{"type":9,"item":"Polarizzazione#14##"},{"type":9,"item":"Social_network#14##"},{"type":9,"item":"Cancel_Culture#14##"},{"type":9,"item":"Episodio#14##"},{"type":9,"item":"Razzismo#14##"}]}'
    //
    // JSON.stringify(data)
    // '[{"property":"_INST","dataitem":[{"type":9,"item":"Polarizzazione#14##"},{"type":9,"item":"Social_network#14##"},{"type":9,"item":"Cancel_Culture#14##"},{"type":9,"item":"Episodio#14##"},{"type":9,"item":"Razzismo#14##"}]},{"property":"_MDAT","dataitem":[{"type":6,"item":"1/2022/12/21/9/38/54/0"}]},{"property":"_SKEY","dataitem":[{"type":2,"item":"Abbandono dei principi giornalistici, nascita delle Fuck News ed episodi vari"}]}]'

    let dataitems = semanticNode.dataitem;
    this.ForceFirstElemUrl(dataitems, semanticNode, url);

    for (let dataitem of dataitems)
    {
      //In the original version it was using the firstElement for the last 2 parameters
      const type: string = SemanticWikiApi.getNodeType(semanticNode.property, dataitem.type);
      let {node,link } = this.InitializeNodesAndLinks(url, dataitem, semanticNode.property, dataitem.item, type);

      MyClass.nodeSet.push(node);
      MyClass.linkSet.push(link);
    }
  }

  //Unclear why...
  private static ForceFirstElemUrl(dataitems: any, semanticNode: any, url: string) {
    let firstDataitem = dataitems[0];
    let urlFromItem = firstDataitem.item;

    if (urlFromItem === url) {
      firstDataitem.item = `${urlFromItem}_${semanticNode.property}`;
    }
  }

  static addArticleDownloaded(wikiArticleTitle: string, mw_article_id: string) {
    MyClass.downloadedArticles.push(wikiArticleTitle);
    let node = this.ParseNode(mw_article_id);
    MyClass.nodeSet.push(node);
    MyClass.focalNodeID = mw_article_id;
  }

  static InitNodeAndLinks(backlinks: Article[]) {
    for (let article of backlinks) {
      let node = new INode(article.title, article.title, "Unknown", 0, 0, article.title);
      let link = { sourceId: article.title, linkName: "Unknown", targetId: MyClass.focalNodeID } as Link;

      MyClass.nodeSet.push(node);
      MyClass.linkSet.push(link);
    }
  }

  static resetData() {
    MyClass.nodeSet = [];
    MyClass.linkSet = [];
    MyClass.downloadedArticles = [];
  }

  static PopulateSelectorWithWikiArticleUi(articles: Article[]) {
    for (const article of articles) {
      $("#wikiArticle").append(`<option value="${article.title}">${article.title}</option>`);
    }

    // require("select2");
    //
    // $("#wikiArticle").select2({
    //     placeholder: "Select a Wiki Article",
    //     allowClear: true
    // });
  }

  public static hideElements() {
    $(".node").each(HideEach);

    function HideEach(index: number, element: HTMLElement) {
      let el = element as CustomHTMLElement;
      const invIndex = MyClass.invisibleType.indexOf(el.__data__.type);
      if (!(invIndex > -1)) {
        return;
      }
      $(el).toggle();
      const invIndexNode = MyClass.invisibleNode.indexOf(el.__data__.id);
      if (invIndexNode === -1) {
        MyClass.invisibleNode.push(el.__data__.id);
      }
    }

    $(".gLink").each((index, element) => MyClass.SomethingRelatedToNodeVisibility(index, element as CustomHTMLElement));
  }

  private static InitializeNodesAndLinks(url: string, arrayElement: DataItem, propertyName: string, nameToParse: any, type: string) {

    let { name, hlink } = NameHelper.parseNodeName(nameToParse, type, url);
    let node = new INode(nameToParse, name, "null", 0, 0, hlink);
    let link = new Link(url, NameHelper.nicePropertyName(propertyName), [arrayElement][0].item, null, null, "");

    return { node, link };
  }

  private static ParseNode(mw_article_id: string) {
    let name = mw_article_id.split("#")[0].replace("_", " ");
    let node: INode = new INode(mw_article_id, name, "Internal Link", 10, 0, `./${mw_article_id.split("#")[0]}`);
    node.fixed = true;
    return node;
  }

  private static SomethingRelatedToNodeVisibility(index: number, el: CustomHTMLElement) {
    //(this: el: CustomHTMLElement)
    //      debugger;
    const valSource = el.__data__.sourceId;
    const valTarget = el.__data__.targetId;
    let indexEdge: number;

    const indexSource = MyClass.invisibleNode.indexOf(valSource);
    const indexTarget = MyClass.invisibleNode.indexOf(valTarget);
    indexEdge = MyClass.invisibleEdge.indexOf(`${valSource}_${valTarget}_${el.__data__.linkName}`);

    if (indexEdge > -1) {
      //Einer der beiden Knoten ist unsichtbar, aber Kante noch nicht
      $(this).toggle();
      //    invisibleEdge.push(valSource + "_" + valTarget + "_" + el.__data__.linkName);
    } else if ((indexSource > -1 || indexTarget > -1)) {
      //Knoten sind nicht unsichtbar, aber Kante ist es
      $(this).toggle();
      MyClass.invisibleEdge.push(`${valSource}_${valTarget}_${el.__data__.linkName}`);
    }
  };


}

new MyClass();