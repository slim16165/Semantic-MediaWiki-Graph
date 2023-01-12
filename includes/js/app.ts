import { Link } from "./Link";
import "select2";
import { INode } from "./INode";
import { IForce } from "./IForce";
import { SemanticWikiApi } from "./semanticWikiApi";
import { Article } from "./OtherTypes";


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




  static resetData() {
    MyClass.nodeSet = [];
    MyClass.linkSet = [];
    MyClass.downloadedArticles = [];
  }
}

new MyClass();