import { Utility } from "./Ui/utility";
import { Article, BacklinksCallbackParams, ExtractedParams, Link, SuccessParams } from "./Link";
import "select2";
import { INode } from "./INode";
import { IForce } from "./IForce";
import { NodeStore } from "./nodeStore";


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
    MyClass.initialize();
  }

  static initialize(): void {
    SemanticWikiApi.loadWikiArticlesAjax();
    // MyClass.loadScript('select2.full.min.js');

    $(() => {
      $("#visualiseSite").click(() => {
        let wikiArticle = MyClass.wikiArticleElement.val();

        if (wikiArticle === "") {
          // Error Message
          $("#error_msg").show();
        } else {
          $("#error_msg").hide();
          SemanticWikiApi.exec(wikiArticle);
        }
      });
    });
  }




  public static getNodesAndLinks(url: string, data: ExtractedParams[]) {
    const nodeSet: any[] = [];
    const linkSet: any[] = [];

    for (const semanticNode of data)
    {
      if (["_SKEY", "_MDAT", "_ASK"].includes(semanticNode.property)) {
        continue;
      }

      let dataitem = semanticNode.dataitem;
      let dataitemElement = dataitem[0];
      let item = dataitemElement.item;

      if (item === url) {
        dataitemElement.item = `${item}_${semanticNode.property}`;
      }
      for (let arrayElement of dataitem)
      {
        let {node, link} = this.InitializeNodesAndLinks(url, semanticNode, dataitemElement, arrayElement);
        nodeSet.push(node);
        linkSet.push(link);
      }
    }
    MyClass.nodeSet = nodeSet;
    MyClass.linkSet = linkSet;
  }

  private static InitializeNodesAndLinks(url: string, semanticNode: ExtractedParams, dataitemElement: { item: any; type: any; }, arrayElement: any)
  {
    let propertyName = semanticNode.property;
    let nameToParse = dataitemElement.item;
    let numerictype = dataitemElement.type;
    const type = INode.getNodeType(propertyName, numerictype);
    let { name, hlink } = this.parseNodeName(nameToParse, type, url);
    let node = new INode(nameToParse, name, "null", 0, 0, hlink);
    let link = new Link(url, NameHelper.nicePropertyName(propertyName), [arrayElement][0].item, null, null, "");

    return {node, link};
  }

  private static parseNodeName(nameToParse: string, type: any, url: string) {
    function parseNodeName() {
      return nameToParse.split("#")[0].replace("_", " ");
    }

    let name, hlink = "";

    switch (type) {
      case "URI":
        name = parseNodeName();
        hlink = url;
        break;
      case "Internal Link":
        name = parseNodeName();
        hlink = `./${nameToParse.split("#")[0]}`;
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
    return { name, hlink };
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

  static InitWikiArticle(wikiArticle: any, data: { edit: { result: string }; error: any; query: { subject: string; data: any } }) {
    MyClass.nodeSet = [];
    MyClass.linkSet = [];
    MyClass.downloadedArticles.push(wikiArticle);

    let id = data.query.subject;
    let name = id.split("#")[0].replace("_", " ");

    let node: INode = new INode(id, name, "Internal Link", 10, 0, `./${id.split("#")[0]}`);
    node.fixed = true;

    MyClass.nodeSet.push(node);

    MyClass.focalNodeID = id;
    MyClass.getNodesAndLinks(id, data.query.data);
    SemanticWikiApi.backlinksAjax(wikiArticle);
    //und Ask wer hierhin zeigt?
    $("#cluster_chart .chart").empty();
    Utility.drawCluster("Drawing1", MyClass.focalNodeID);

    // const elem: JQuery<HTMLElement> = $(`[id=${MyClass.focalNodeID}] a`);
    // // @ts-ignore
    // elem[0].__data__.px = $(".chart")[0].clientWidth / 2;
    // // @ts-ignore
    // elem[0].__data__.py = $(".chart")[0].clientHeight / 2;
  }

  static extracted(wikiArticle: any, data: any) {
    MyClass.downloadedArticles.push(wikiArticle);
    MyClass.focalNodeID = data.query.subject;
    MyClass.nodeSet.forEach((item) => {
      if (item.id === MyClass.focalNodeID) {
        item.fixed = true;
      }
    });
    MyClass.getNodesAndLinks(data.subject, data.data);
    MyClass.force.stop();
    SemanticWikiApi.backlinksAjax(wikiArticle);

    $("#cluster_chart .chart").empty();
    //  var k = cloneNode(nodeSet);
    //  var m = cloneEdge(linkSet);
    Utility.drawCluster("Drawing1", MyClass.focalNodeID);
    //drawCluster.update();
    MyClass.hideElements();
  }

  static CreateWikiArticleUi(articles: Article[]) {
    for (const article of articles) {
      $("#wikiArticle").append(`<option value="${article.title}">${article.title}</option>`);
    }

    require("select2");

    $("#wikiArticle").select2({
        placeholder: "Select a Wiki Article",
        allowClear: true
    });
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

  private static BacklinksCallback({ data }: BacklinksCallbackParams) {
    if (data?.edit && data.edit.result === "Success") {
      // debugger;
    } else if (data?.error) {
      alert((data) as any);
      // debugger;
    } else {
      MyClass.InitNodeAndLinks(data.query.backlinks);
    }

    $("#cluster_chart .chart").empty();
    //  var k = cloneNode(nodeSet);
    //  var m = cloneEdge(linkSet);

    NodeStore.InitialSetup(MyClass.nodeSet, MyClass.linkSet);

    Utility.drawCluster("Drawing1", MyClass.focalNodeID);
    //drawCluster.update();
    MyClass.hideElements();
  }

  private static InitNodeAndLinks(backlinks: Article[]) {
    for (let article of backlinks) {
      let node = new INode(article.title, article.title, "Unknown", 0, 0, article.title);

      MyClass.nodeSet.push(node);

      MyClass.linkSet.push({ sourceId: article.title, linkName: "Unknown", targetId: MyClass.focalNodeID } as Link);
    }
  }
}

new MyClass();

export class SemanticWikiApi{
  public static askNode(wikiArticle: any) {
    $.ajax({
      url: mw.util.wikiScript("api"),
      data: {
        action: "browsebysubject",
        subject: wikiArticle,
        format: "json"
      },
      type: "GET",

      success(data) {
        if (data?.edit && data.edit.result === "Success") {
          // debugger;
        } else if (data?.error) {
          alert(data);
          // debugger;
        } else {
          MyClass.extracted(wikiArticle, data);
        }
      }
    });

  }

  public static backlinksAjax(wikiArticle: string) {
    $.ajax({
      url: mw.util.wikiScript("api"),
      data: {
        action: "query",
        list: "backlinks",
        bltitle: wikiArticle,
        format: "json"
      },
      type: "GET",

      success({ data }: BacklinksCallbackParams) {
        this.BacklinksCallback({ data: data });
      }
    });
  }
  public static exec(wikiArticle: any) {
    MyClass.downloadedArticles = [];
    $.ajax({
      url: mw.util.wikiScript("api"),
      data: {
        action: "browsebysubject",
        subject: wikiArticle,
        format: "json"
      },
      type: "GET",
      success: execSuccessCallback
    });


    function execSuccessCallback(data: { edit: { result: string; }; error: any; query: { subject: string; data: any; }; }) {
      if (data?.edit && data.edit.result === "Success") {
        // debugger;
      } else if (data?.error) {
        alert(data);
        // debugger;
      } else {
        MyClass.InitWikiArticle(wikiArticle, data);
      }
    }

  }

  public static loadWikiArticlesAjax() {
    $.ajax({
      url: mw.util.wikiScript("api") as string,
      data: {
        action: "query",
        list: "allpages",
        aplimit: 1000,
        format: "json"
      },
      type: "GET",
      success(data: SuccessParams) {
        if (!(!(data?.edit && data.edit.result === "Success") && !(data?.error))) {
          return;
        }
        MyClass.CreateWikiArticleUi(data.query.allpages);
      }
    });
  }
}

export class NameHelper{


  public static nicePropertyName(name: string): string {
    switch (name) {
      case "_boo":
        return "Boolean";
      case "_cod":
        return "Code";
      case "_dat":
        return "Date";
      case "_ema":
        return "Email";
      case "_num":
        return "Number"; //oder Email //oder Telefon
      case "_qty":
        return "Quantity";
      case "_rec":
        return "Record";
      case "_tem":
        return "Temperature";
      case "_uri":
        return "URI";
      case "_wpg":
        return "Internal Link";
      case "Monolingual":
        return "Monolingual Text";
      case "Telephone":
        return "Telephone";
      case "_TEXT":
        return "Text";
      case "_INST":
        return "isA";
      default:
        return name.replace("_", " ");
    }
  }
}