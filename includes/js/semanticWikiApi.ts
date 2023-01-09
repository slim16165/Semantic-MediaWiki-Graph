import { Utility } from "./Ui/utility";
import { NodeStore } from "./nodeStore";
import { MyClass } from "./app";

export class SemanticWikiApi {
  public static async BrowseBySubject(wikiArticleTitle: string): Promise<void> {
    const api = new mw.Api();

    try {
      const response = await api.get({
        action: 'browsebysubject',
        subject: wikiArticleTitle,
        format: 'json'
      });

      await response;

      if (response.data.edit?.result === 'Success') {
        // debugger;
      } else {
        SemanticWikiApi.BrowseBySubjectSuccessCallback_InitWikiArticle(wikiArticleTitle, response.data);
      }
    } catch (error) {
      debugger;
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
    let mw_article_id = data.query.subject; //'Abbandono_dei_principi_giornalistici,_nascita_delle_Fuck_News_ed_episodi_vari#0##'
    MyClass.addArticleDownloaded(wikiArticleTitle, mw_article_id);


    for (const semanticNode of data.query.data) {
      MyClass.getNodesAndLinks(semanticNode, mw_article_id);
    }



    // MyClass.force.stop();
    SemanticWikiApi.QueryBackLinks(wikiArticleTitle);

    $("#cluster_chart .chart").empty();
    //  var k = cloneNode(nodeSet);
    //  var m = cloneEdge(linkSet);
    Utility.drawCluster("Drawing1", MyClass.focalNodeID);
    //drawCluster.update();
    MyClass.hideElements();
    // const elem: JQuery<HTMLElement> = $(`[id=${MyClass.focalNodeID}] a`);
    // // @ts-ignore
    // elem[0].__data__.px = $(".chart")[0].clientWidth / 2;
    // // @ts-ignore
    // elem[0].__data__.py = $(".chart")[0].clientHeight / 2;
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
}


export interface SuccessParams {
  edit: { result: string };
  error: any;
  query: { allpages: any }
}

export interface BacklinksCallbackParams {
  data:
    {
      edit: { result: string };
      error: any;
      query: { backlinks: any }
    };
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