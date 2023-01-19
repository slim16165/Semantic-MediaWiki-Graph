import { MainEntry } from "../../app";
import { Article } from "../../Model/OtherTypes";
import { INode } from "../../Model/INode";
import { NodeType } from "../../Model/nodeType";
import { Link } from "../../Model/Link";
import { MediaWikiArticle } from "../mediaWikiArticle";

export class SemanticWikiApi {
  static downloadedArticles: string[] = [];

  public static BrowseBySubject(wikiArticleTitle: string, callback: any) {
    this.downloadedArticles = [];
    let wikiArticle: MediaWikiArticle;

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
            wikiArticle = new MediaWikiArticle(data.query.subject, data.query.data);
            callback();
          }
        }
      }
    );
  }

  public static QueryBackLinks(wikiArticle: string, callback: any) {
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
          let { nodeList, linkList } = SemanticWikiApi.ParseBacklinks(data.query.backlinks);
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

  private static ParseBacklinks(backlinks: Article[]) {
    console.log("Method enter: InitNodeAndLinks_Backlinks");
    let nodeList = [];
    let linkList = [];

    for (let article of backlinks) {
      let node = new INode(NodeType.Backlink, article.title, article.title, "Backlink", 0, 0, article.title);
      nodeList.push(node);
    }

    for (let article of backlinks) {
      let link = new Link(NodeType.Backlink, "Backlink", article.title, MainEntry.focalNodeID, "");
      linkList.push(link);
    }

    return { nodeList, linkList };
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