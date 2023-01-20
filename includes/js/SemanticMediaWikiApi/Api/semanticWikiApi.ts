import { MainEntry } from "../../app";
import { Article } from "../../Model/OtherTypes";
import { NodeType } from "../../Model/nodeType";
import { MediaWikiArticle } from "../Types/mediaWikiArticle";
import { INode } from "../../Model/INode";
import { Link } from "../../Model/Link";

export class SemanticWikiApi {
  static downloadedArticles: string[] = [];

  public static BrowseBySubject(wikiArticleTitle: string, callback: (wikiArticle: MediaWikiArticle) => void) {
    this.downloadedArticles = [];

    $.ajax({
        url: mw.util.wikiScript("api"),
        data: {
          action: "browsebysubject",
          subject: wikiArticleTitle,
          format: "json"
        },
        type: "GET",
        async: false,
        success: function(data: SuccessCallback) {
          if (data?.edit && data.edit.result === "Success") {
            // debugger;
          } else if (data?.error) {
            alert(data);
            // debugger;
          } else {
            /**
             *  }
             * JSON.stringify(data)
             * https://jsonformatter.org/json-parser/5e9d52
             */

            SemanticWikiApi.downloadedArticles.push(wikiArticleTitle);
            let wikiArticle = new MediaWikiArticle(data.query.subject, data.query.data);
            callback(wikiArticle);
          }
        }
      }
    );
  }

  public static QueryBackLinks(wikiArticle: string, callback: (nodesAndLinks: { nodeList: INode[]; linkList: Link[] }) => void) {
    $.ajax({
      url: mw.util.wikiScript("api"),
      data: {
        action: "query",
        list: "backlinks",
        bltitle: wikiArticle,
        format: "json"
      },
      type: "GET",
      async: false,
      success: function(data: any) {
        if (data?.edit && data.edit.result === "Success") {
          // debugger;
        } else if (data?.error) {
          alert((data) as any);
          // debugger;
        } else {
          console.log("Callback data ParseBacklinks");
          let { nodeList, linkList } = MainEntry.ParseBacklinks(data.query.backlinks);
          callback({ nodeList, linkList });
        }
      }
    });
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
      async: false,
      success(data: SuccessParams) {
        if (!(!(data?.edit && data.edit.result === "Success") && !(data?.error))) {
          return;
        }
        MainEntry.PopulateSelectorWithWikiArticleUi(data.query.allpages);
      }
    });
  }

}

export interface SuccessParams {
  edit: { result: string };
  error: any;
  query: { allpages: any };
}

export interface SuccessCallback {
  edit: { result: string };
  error: any;
  query: { subject: string; data: any };
}