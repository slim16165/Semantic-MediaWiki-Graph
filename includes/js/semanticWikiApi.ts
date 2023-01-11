import { Utility } from "./Ui/utility";
import { NodeStore } from "./nodeStore";
import { MyClass } from "./app";
import { VisibilityHandler } from "./Ui/visibilityHandler";

export class SemanticWikiApi {
  public static BrowseBySubject(wikiArticleTitle: string) {
    MyClass.downloadedArticles = [];
    $.ajax({
      url: mw.util.wikiScript("api"),
      data: {
        action: "browsebysubject",
        subject: wikiArticleTitle,
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
        SemanticWikiApi.BrowseBySubjectSuccessCallback_InitWikiArticle(wikiArticleTitle, data);
      }
    }
  }


  static BrowseBySubjectSuccessCallback_InitWikiArticle(wikiArticleTitle: string, data: { edit: { result: string }; error: any; query: { subject: string; data: any }} )
  {
    /**
     *  }
     * JSON.stringify(data)
     * https://jsonformatter.org/json-parser/5e9d52
     */

    MyClass.resetData();
    MyClass.downloadedArticles.push(wikiArticleTitle);
    let mediawikiArticleId = data.query.subject; //'Abbandono_dei_principi_giornalistici,_nascita_delle_Fuck_News_ed_episodi_vari#0##'

    MyClass.AddMainArticle_BrowseBySubject(wikiArticleTitle, mediawikiArticleId, data.query.data);

    // MyClass.force.stop();
    SemanticWikiApi.QueryBackLinks(wikiArticleTitle); //tramite questa chiama → MyClass.InitNodeAndLinks(data.query.backlinks);


    $("#cluster_chart .chart").empty();
    //  var k = cloneNode(nodeSet);
    //  var m = cloneEdge(linkSet);
    console.log("BrowseBySubject");
    Utility.drawCluster("Drawing1", MyClass.focalNodeID);
    //drawCluster.update();
    VisibilityHandler.hideElements();
    // const elem: JQuery<HTMLElement> = $(`[id=${MyClass.focalNodeID}] a`);
    // // @ts-ignore
    // elem[0].__data__.px = Canvas.width / 2;
    // // @ts-ignore
    // elem[0].__data__.py = Canvas.height / 2;
  }

  /*
      I valori delle property "_SKEY", "_MDAT" e "_ASK" sono proprietà speciali predefinite in Semantic MediaWiki.
      "_SKEY" è una proprietà che viene utilizzata per memorizzare le chiavi di ricerca per ogni oggetto di dati, che vengono utilizzate per velocizzare le query su quell'oggetto.
      "_MDAT" è una proprietà che viene utilizzata per memorizzare la data di modifica di un oggetto di dati.
      "_ASK" è una proprietà che viene utilizzata per memorizzare una query SPARQL o una query di tipo "ask" per un oggetto di dati. Questa proprietà viene utilizzata per eseguire query complesse sui dati semantici.
      * INST
      */
  static IsSpecialProperty(property: any) {
    return ["_SKEY", "_MDAT", "_ASK"].includes(property);
  }

  public static QueryBackLinks(wikiArticle: string) {
    $.ajax({
      url: mw.util.wikiScript("api"),
      data: {
        action: "query",
        list: "backlinks",
        bltitle: wikiArticle,
        format: "json"
      },
      type: "GET",
      success: BacklinksCallback
    });

    function BacklinksCallback(data: any) {
      if (data?.edit && data.edit.result === "Success") {
        // debugger;
      } else if (data?.error) {
        alert((data) as any);
        // debugger;
      } else {
        MyClass.InitNodeAndLinks_Backlinks(data.query.backlinks);
      }

      $("#cluster_chart .chart").empty();
      //  var k = cloneNode(nodeSet);
      //  var m = cloneEdge(linkSet);

      NodeStore.InitialSetup(MyClass.nodeSet, MyClass.linkSet);

      console.log("BacklinksCallback");
      Utility.drawCluster("Drawing1", MyClass.focalNodeID);
      //drawCluster.update();
      VisibilityHandler.hideElements();
    }
  }


  public static AllPagesCall() {
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
        MyClass.PopulateSelectorWithWikiArticleUi(data.query.allpages);
      }
    });
  }

  public static getNodeType(propertyName: string, type: number) {
    switch (propertyName) {
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
        return "Category";
      default:
        return this.getTypeDescr(type);
    }
  }

  /* This type comes from the wiki interface
  * */
  static getTypeDescr(type: number) {
    switch (type) {
      case 1:
        return "Number";
      case 2:
        return "Text";
      case 4:
        return "Boolean";
      case 5:
        return "URI"; //oder Email //oder Telefon
      case 6:
        return "Date";
      case 9:
        return "Internal Link";
      default:
        return "Unknown Type";
    }
  }
}


export interface SuccessParams {
  edit: { result: string };
  error: any;
  query: { allpages: any }
}
export type DataItem = {
  type: number,
  item: string
}

export type SemanticNode = {
  property: string,
  dataitem: DataItem[],
  subject: any
}

export type Data = SemanticNode[]