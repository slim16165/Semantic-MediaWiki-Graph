import { Utility } from "../Ui/utility";
import { NodeStore } from "../nodeStore";
import { MainEntry } from "../app";
import { VisibilityHandler } from "../Ui/visibilityHandler";
import { MyData, SuccessCallback, SuccessParams } from "./myData";

export class SemanticWikiApi {
  public static BrowseBySubject(wikiArticleTitle: string) {
    MainEntry.downloadedArticles = [];
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

    function execSuccessCallback(data: SuccessCallback) {
      if (data?.edit && data.edit.result === "Success") {
        // debugger;
      } else if (data?.error) {
        alert(data);
        // debugger;
      } else {
        SemanticWikiApi.BrowseBySubjectSuccessCallback_InitWikiArticle(wikiArticleTitle, new MyData(data));
      }
    }
  }


  static BrowseBySubjectSuccessCallback_InitWikiArticle(wikiArticleTitle: string, data : MyData)
  {
    /**
     *  }
     * JSON.stringify(data)
     * https://jsonformatter.org/json-parser/5e9d52
     */

    MainEntry.resetData();
    MainEntry.downloadedArticles.push(wikiArticleTitle);
    data.Parse()

    // MyClass.force.stop();
    SemanticWikiApi.QueryBackLinks(wikiArticleTitle); //tramite questa chiama → MyClass.InitNodeAndLinks(data.query.backlinks);


    $("#cluster_chart .chart").empty();
    //  var k = cloneNode(nodeSet);
    //  var m = cloneEdge(linkSet);
    console.log("BrowseBySubject");
    Utility.drawCluster("Drawing1");
    //drawCluster.update();
    VisibilityHandler.hideElements();
    // const elem: JQuery<HTMLElement> = $(`[id=${MyClass.focalNodeID}] a`);
    // // @ts-ignore
    // elem[0].__data__.px = Canvas.width / 2;
    // // @ts-ignore
    // elem[0].__data__.py = Canvas.height / 2;
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
        MainEntry.InitNodeAndLinks_Backlinks(data.query.backlinks);
      }

      $("#cluster_chart .chart").empty();
      //  var k = cloneNode(nodeSet);
      //  var m = cloneEdge(linkSet);

      NodeStore.UpdateSourceAndTarget2();

      console.log("BacklinksCallback");
      Utility.drawCluster("Drawing1");
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
        MainEntry.PopulateSelectorWithWikiArticleUi(data.query.allpages);
      }
    });
  }

}


class testUnit
{
  static test() {
    const jsonString = "{\"query\":{\"subject\":\"Abbandono_dei_principi_giornalistici,_nascita_delle_Fuck_News_ed_episodi_vari#0##\",\"data\":[{\"property\":\"_INST\",\"dataitem\":[{\"type\":9,\"item\":\"Polarizzazione#14##\"},{\"type\":9,\"item\":\"Social_network#14##\"},{\"type\":9,\"item\":\"Cancel_Culture#14##\"},{\"type\":9,\"item\":\"Episodio#14##\"},{\"type\":9,\"item\":\"Razzismo#14##\"}]},{\"property\":\"_MDAT\",\"dataitem\":[{\"type\":6,\"item\":\"1/2022/12/21/9/38/54/0\"}]},{\"property\":\"_SKEY\",\"dataitem\":[{\"type\":2,\"item\":\"Abbandono dei principi giornalistici, nascita delle Fuck News ed episodi vari\"}]}],\"serializer\":\"SMW\\\\Serializers\\\\SemanticDataSerializer\",\"version\":2}}";
    // const myData = new MyData(jsonString);
  }
}