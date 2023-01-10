import { Link } from "./Link";
import "select2";
import { INode } from "./INode";
import { IForce } from "./IForce";
import { NameHelper } from "./nameHelper";
import { DataItem, SemanticNode, SemanticWikiApi } from "./semanticWikiApi";
import { Article, CustomHTMLElement, LinkType, NodeType } from "./OtherTypes";


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



  //Unclear why...
  private static ForceFirstElemUrl(dataitems: any, semanticNode: any, url: string) {
    let firstDataitem = dataitems[0];
    let urlFromItem = firstDataitem.item;

    if (urlFromItem === url) {
      firstDataitem.item = `${urlFromItem}_${semanticNode.property}`;
    }
  }

  public static AddMainArticle(wikiArticleTitle: string, mediawikiArticleId: string, semanticNodeList: any) {
    let nameDoslike = mediawikiArticleId.split("#")[0];
    let name = nameDoslike.replace("_", " ");
    let node = new INode(mediawikiArticleId, name, "Internal Link", 10, 0, `./${nameDoslike}`);
    node.fixed = true;
    MyClass.nodeSet.push(node);
    MyClass.focalNodeID = mediawikiArticleId;

    for (const semanticNode of semanticNodeList)
    {
      if (SemanticWikiApi.IsSpecialProperty(semanticNode.property)) continue; // Non fare nulla se la proprietà è una delle proprietà speciali "_SKEY", "_MDAT" o "_ASK"

      MyClass.getNodesAndLinks(semanticNode, mediawikiArticleId);
    }
  }

  public static getNodesAndLinks(semanticNode: SemanticNode, url: string)
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


  static InitNodeAndLinks(backlinks: Article[]) {
    for (let article of backlinks) {
      let node = new INode(article.title, article.title, "Unknown", 0, 0, article.title);
      let link = new Link("Unknown", article.title, MyClass.focalNodeID, null, null, "");

      MyClass.nodeSet.push(node);
      MyClass.linkSet.push(link);
    }
  }

  static resetData() {
    MyClass.nodeSet = [];
    MyClass.linkSet = [];
    MyClass.downloadedArticles = [];
  }

  public static hideElements() {
    $(".node").each(HideEach);

    function HideEach(index: number, element: HTMLElement) {
      let el = element as CustomHTMLElement;
      let node = el.__data__ as NodeType;
      const invIndex = MyClass.invisibleType.indexOf(node.type);
      if (!(invIndex > -1)) {
        return;
      }
      $(el).toggle();
      const invIndexNode = MyClass.invisibleNode.indexOf(node.id);
      if (invIndexNode === -1) {
        MyClass.invisibleNode.push(node.id);
      }
    }

    $(".gLink").each((index, element) => MyClass.SomethingRelatedToNodeVisibility(index, element as CustomHTMLElement));
  }

  private static InitializeNodesAndLinks(sourceNodeUrl: string, arrayElement: DataItem, propertyTypeName: string, nameToParse: string, type: string) {

    let { name, hlink } = NameHelper.parseNodeName(nameToParse, type, sourceNodeUrl);
    let node = new INode(nameToParse, name, "null", 0, 0, hlink);

    let linkName = NameHelper.nicePropertyName(propertyTypeName);
    let targetId = [arrayElement][0].item;
    let link = new Link(linkName, sourceNodeUrl, targetId, null, null, "");

    return { node, link };
  }

  private static SomethingRelatedToNodeVisibility(index: number, el: CustomHTMLElement) {
    //(this: el: CustomHTMLElement)
    //      debugger;
    let link = el.__data__ as LinkType;
    const valSource = link.sourceId;
    const valTarget = link.targetId;
    let indexEdge: number;

    const indexSource = MyClass.invisibleNode.indexOf(valSource);
    const indexTarget = MyClass.invisibleNode.indexOf(valTarget);
    indexEdge = MyClass.invisibleEdge.indexOf(`${valSource}_${valTarget}_${link.linkName}`);

    if (indexEdge > -1) {
      //Einer der beiden Knoten ist unsichtbar, aber Kante noch nicht
      $(this).toggle();
      //    invisibleEdge.push(valSource + "_" + valTarget + "_" + el.__data__.linkName);
    } else if ((indexSource > -1 || indexTarget > -1)) {
      //Knoten sind nicht unsichtbar, aber Kante ist es
      $(this).toggle();
      MyClass.invisibleEdge.push(`${valSource}_${valTarget}_${link.linkName}`);
    }
  };
}

new MyClass();