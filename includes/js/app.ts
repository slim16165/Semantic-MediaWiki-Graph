import { Link } from "./Link";
import "select2";
import { INode } from "./INode";
import { IForce } from "./IForce";
import { NameHelper } from "./nameHelper";
import { DataItem, SemanticNode, SemanticWikiApi } from "./semanticWikiApi";
import { Article, CustomHTMLElement } from "./OtherTypes";


export class MyClass {

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

          SemanticWikiApi.BrowseBySubject(wikiArticleTitle);
        }
      });
    });
  }

  static PopulateSelectorWithWikiArticleUi(articles: Article[]) {
    MyClass.downloadedArticles = [];
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

  //TODO: tutti i metodi che seguono sono molto simili

  public static AddMainArticle_BrowseBySubject(wikiArticleTitle: string, mediawikiArticleId: string, semanticNodeList: any) {
    let node = this.ParseNodeBrowseBySubject1(mediawikiArticleId);
    MyClass.nodeSet.push(node);
    MyClass.focalNodeID = mediawikiArticleId;

    for (const semanticNode of semanticNodeList)
    {
      if (SemanticWikiApi.IsSpecialProperty(semanticNode.property)) continue; // Non fare nulla se la proprietà è una delle proprietà speciali "_SKEY", "_MDAT" o "_ASK"

      MyClass.getNodesAndLinksBrowseBySubject(semanticNode, mediawikiArticleId);
    }
  }

  private static ParseNodeBrowseBySubject1(mediawikiArticleId: string) {
    let nameDoslike = mediawikiArticleId.split("#")[0];
    let name = nameDoslike.replace("_", " ");
    let node = new INode(mediawikiArticleId, name, "Internal Link", 10, 0, `./${nameDoslike}`);
    node.fixed = true;
    return node;
  }

  public static getNodesAndLinksBrowseBySubject(semanticNode: SemanticNode, sourceNodeUrl: string)
  {
    // JSON.stringify(dataitem)
    // '[{"type":9,"item":"Polarizzazione#14##"},{"type":9,"item":"Social_network#14##"},{"type":9,"item":"Cancel_Culture#14##"},{"type":9,"item":"Episodio#14##"},{"type":9,"item":"Razzismo#14##"}]'
    //
    // JSON.stringify(semanticNode)
    // '{"property":"_INST","dataitem":[{"type":9,"item":"Polarizzazione#14##"},{"type":9,"item":"Social_network#14##"},{"type":9,"item":"Cancel_Culture#14##"},{"type":9,"item":"Episodio#14##"},{"type":9,"item":"Razzismo#14##"}]}'
    //
    // JSON.stringify(data)
    // '[{"property":"_INST","dataitem":[{"type":9,"item":"Polarizzazione#14##"},{"type":9,"item":"Social_network#14##"},{"type":9,"item":"Cancel_Culture#14##"},{"type":9,"item":"Episodio#14##"},{"type":9,"item":"Razzismo#14##"}]},{"property":"_MDAT","dataitem":[{"type":6,"item":"1/2022/12/21/9/38/54/0"}]},{"property":"_SKEY","dataitem":[{"type":2,"item":"Abbandono dei principi giornalistici, nascita delle Fuck News ed episodi vari"}]}]'

    let dataitems = semanticNode.dataitem;
    this.ForceFirstElemUrlBrowseBySubject(sourceNodeUrl, dataitems[0], semanticNode.property);

    for (let dataitem of dataitems)
    {
      let node = this.ParseNodeBrowseBySubject2(dataitem.item, sourceNodeUrl, semanticNode.property, dataitem.type);
      let link = this.ParseLinkBrowseBySubject(semanticNode.property, dataitem, sourceNodeUrl);


      MyClass.nodeSet.push(node);
      MyClass.linkSet.push(link);
    }
  }

  static InitNodeAndLinks_Backlinks(backlinks: Article[])
  {
    for (let article of backlinks) {
      let node = new INode(article.title, article.title, "Unknown", 0, 0, article.title);
      let link = new Link("Unknown", article.title, MyClass.focalNodeID, null, null, "");

      MyClass.nodeSet.push(node);
      MyClass.linkSet.push(link);
    }
  }

  //Unclear why...
  private static ForceFirstElemUrlBrowseBySubject(url: string, firstDataitem: any, property: any) {
    let urlFromFirstItem = firstDataitem.item;

    if (urlFromFirstItem === url)
      firstDataitem.item = `${urlFromFirstItem}_${property}`;
  }

  private static ParseNodeBrowseBySubject2(nameToParse: string, sourceNodeUrl: string, propertyName: string, type: number) {
    //In the original version it was using the firstElement for the last 2 parameters
    const typeStr: string = SemanticWikiApi.getNodeType(propertyName, type);
    let { name, hlink } = NameHelper.parseNodeName(nameToParse, typeStr, sourceNodeUrl);
    let node = new INode(nameToParse, name, "null", 0, 0, hlink);
    return node;
  }

  private static ParseLinkBrowseBySubject(propertyTypeName: string, arrayElement: DataItem, sourceNodeUrl: string) {
    let linkName = NameHelper.nicePropertyName(propertyTypeName);
    let targetId = [arrayElement][0].item;
    let link = new Link(linkName, sourceNodeUrl, targetId, null, null, "");
    return link;
  }

  static resetData() {
    MyClass.nodeSet = [];
    MyClass.linkSet = [];
    MyClass.downloadedArticles = [];
  }
}

new MyClass();