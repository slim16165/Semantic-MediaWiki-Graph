import { Link } from "./Model/Link";
import "select2";
import { INode } from "./Model/INode";
import { IForce } from "./Model/IForce";
import { SemanticWikiApi } from "./Semantic/semanticWikiApi";
import { Article } from "./Model/OtherTypes";
import { NodeType } from "./Model/nodeType";


export class MainEntry {

  static downloadedArticles: any[] = [];
  static focalNodeID: string = ""; // Esempio  di valore reale: 'Abbandono_dei_principi_giornalistici,_nascita_delle_Fuck_News_ed_episodi_vari#0##'
  static nodeSet: INode[] = [];
  static linkSet: Link[] = [];
  static force: IForce;

  private static wikiArticleElement: JQuery = $("#wikiArticle");

  constructor() {
    MainEntry.InitialPageLoad();
  }

  static InitialPageLoad(): void {
    SemanticWikiApi.AllPagesCall();
    // MyClass.loadScript('select2.full.min.js');

    $(() => {
      $("#visualiseSite").click(() => {
        let wikiArticleTitle = MainEntry.wikiArticleElement.val() as string;

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

    static InitNodeAndLinks_Backlinks(backlinks: Article[])
  {
    for (let article of backlinks) {
      let node = new INode(NodeType.Backlink, article.title, article.title, "Unknown", 0, 0, article.title);
      let link = new Link(NodeType.Backlink,"Unknown", article.title, MainEntry.focalNodeID, null, null, "");

      MainEntry.nodeSet.push(node);
      MainEntry.linkSet.push(link);
    }
  }

  static resetData() {
    MainEntry.nodeSet = [];
    MainEntry.linkSet = [];
    MainEntry.downloadedArticles = [];
  }
}

new MainEntry();