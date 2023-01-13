import { Link } from "./Model/Link";
import "select2";
import { INode } from "./Model/INode";
import { IForce } from "./Model/IForce";
import { SemanticWikiApi } from "./Semantic/semanticWikiApi";
import { Article } from "./Model/OtherTypes";
import { NodeType } from "./Model/nodeType";
import { NodeStore } from "./nodeStore";

export class MainEntry {

  static downloadedArticles: any[] = [];

  /*Primary Node of Context*/
  static focalNodeID: string = ""; // Esempio  di valore reale: 'Abbandono_dei_principi_giornalistici,_nascita_delle_Fuck_News_ed_episodi_vari#0##'
  static force: IForce;

  constructor() {
    MainEntry.InitialPageLoad();
  }

  static InitialPageLoad(): void {
    //
    SemanticWikiApi.AllPagesCall();

    $(() => {
      this.HandleOnClick();
    });
  }

  static PopulateSelectorWithWikiArticleUi(articles: Article[]) {
    MainEntry.downloadedArticles = [];
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



  private static HandleOnClick() {
    $("#visualiseSite").on("click", () => {

      //Get the selected article in the combobox
      let wikiArticleTitle = $("#wikiArticle").val() as string;

      if (wikiArticleTitle === "") {
        // Error Message
        $("#error_msg").show();
      } else {
        $("#error_msg").hide();

        SemanticWikiApi.BrowseBySubject(wikiArticleTitle);
      }
    });
  }



    static InitNodeAndLinks_Backlinks(backlinks: Article[])
  {
    for (let article of backlinks) {
      let node = new INode(NodeType.Backlink, article.title, article.title, "Unknown", 0, 0, article.title);
      let link = new Link(NodeType.Backlink,"Unknown", article.title, MainEntry.focalNodeID, null, null, "");

      NodeStore.nodeList.push(node);
      NodeStore.linkList.push(link);
    }
  }

  static resetData() {
    NodeStore.nodeList = [];
    NodeStore.linkList = [];
    MainEntry.downloadedArticles = [];
  }
}

new MainEntry();