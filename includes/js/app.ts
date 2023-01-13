import { Link } from "./Model/Link";
import "select2";
import { INode } from "./Model/INode";
import { SemanticWikiApi } from "./Semantic/semanticWikiApi";
import { Article } from "./Model/OtherTypes";
import { NodeType } from "./Model/nodeType";
import { NodeStore } from "./nodeStore";
import { Canvas } from "./Ui/Canvas";
import { NodeManager } from "./Ui/nodeManager";
import { LegendManager } from "./Ui/legendManager";
import * as d3 from "d3";
import { LinkAndForcesManager } from "./Ui/LinkAndForcesManager";

export class MainEntry {
  static downloadedArticles: any[] = [];

  public static centerNodeSize: number = 50;
  public static nodeSize: number = 10;
  public static scale: number = 1;
  /*Primary Node of Context*/
  static focalNodeID: string = ""; // Esempio  di valore reale: 'Abbandono_dei_principi_giornalistici,_nascita_delle_Fuck_News_ed_episodi_vari#0##'

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

  /**
   * Draws a cluster using the provided data.
   *
   * @param {string} drawingName - A unique drawing identifier that has no spaces, no "." and no "#" characters.
   *
   *              0 = No Sort.  Maintain original order.
   *              1 = Sort by arc value size.
   */
  public static drawCluster(drawingName: string): void {
    new Canvas();

    console.log("Called drawCluster; N° NodeStore.nodeList: " + NodeStore.nodeList.length);
    if (NodeStore.nodeList.length == 0) return;

    NodeManager.DrawNodes();

    LinkAndForcesManager.DrawLinks();

    LegendManager.DrawLegend();

    d3.select(window).on("resize.updatesvg", Canvas.updateWindowSize);
  }

  static InitNodeAndLinks_Backlinks(backlinks: Article[]) {
    for (let article of backlinks) {
      let node = new INode(NodeType.Backlink, article.title, article.title, "Unknown", 0, 0, article.title);
      let link = new Link(NodeType.Backlink, "Backlink", article.title, MainEntry.focalNodeID, null, null, "");

      NodeStore.nodeList.push(node);
      NodeStore.linkList.push(link);
    }
  }

  static resetData() {
    NodeStore.nodeList = [];
    NodeStore.linkList = [];
    MainEntry.downloadedArticles = [];
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
}

new MainEntry();