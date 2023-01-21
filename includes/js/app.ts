import { Link } from "./Model/Link";
import "select2";
import { INode } from "./Model/INode";
import { SemanticWikiApi } from "./SemanticMediaWikiApi/Api/semanticWikiApi";
import { Article } from "./Model/OtherTypes";
import { NodeType } from "./Model/nodeType";
import { NodeStore } from "./nodeStore";
import { Canvas } from "./Ui/Canvas";
import { NodeManager } from "./Ui/nodeManager";
import { LegendManager } from "./Ui/legendManager";
import * as d3 from "d3";
import { LinkAndForcesManager } from "./Ui/LinkAndForcesManager";
import { VisibilityHandler } from "./Ui/visibilityHandler";
import { MediaWikiArticle } from "./SemanticMediaWikiApi/Types/mediaWikiArticle";
import { MediaWiki2NodesExt } from "./Bll/mediaWiki2NodesExt";

export class MainEntry {


  public static centerNodeSize: number = 50;
  public static nodeSize: number = 10;
  public static scale: number = 1;
  /*Primary Node of Context*/
  static focalNodeID: string = ""; // Esempio  di valore reale: 'Abbandono_dei_principi_giornalistici,_nascita_delle_Fuck_News_ed_episodi_vari#0##'

  constructor() {
    MainEntry.InitialPageLoad();
  }

  static InitialPageLoad(): void {
    //Downloads the list of articles from Semantic MediaWiki and calls the provided callback function
    SemanticWikiApi.AllPagesCall(MainEntry.PopulateSelectorWithWikiArticleUi);
  }

  static PopulateSelectorWithWikiArticleUi(articles: Article[]) {
    for (const article of articles) {
      $("#wikiArticle").append(`<option value="${article.title}">${article.title}</option>`);
    }

    $("#visualiseSite")
      .on("click", (event ) => {
        event.preventDefault()
        MainEntry.HandleOnClick();
      });

    // require("select2");
    //
    // $("#wikiArticle").select2({
    //     placeholder: "Select a Wiki Article",
    //     allowClear: true
    // });
  }

  private static HandleOnClick() {
    //Get the select  ed article in the combobox
    let wikiArticleTitle = $("#wikiArticle").val() as string;

    if (wikiArticleTitle === "") {
      // Error Message
      $("#error_msg").show();
    } else {
      $("#error_msg").hide();

      SemanticWikiApi.BrowseBySubject(wikiArticleTitle, MainEntry.BrowseBySubjectCallback);
      SemanticWikiApi.QueryBackLinks(wikiArticleTitle, MainEntry.BacklinksCallback);

      MainEntry.drawCluster("Drawing1", "BrowseBySubject");
      //drawCluster.update();
      // VisibilityHandler.hideElements();
    }
  }

  static BrowseBySubjectCallback(wikiArticle: MediaWikiArticle) {
    // NodeStore.nodeList.push(wikiArticle.node);
    let nodesAndLinks = MediaWiki2NodesExt.getNodesAndLinks(wikiArticle);
    NodeStore.nodeList = NodeStore.nodeList.concat(nodesAndLinks.nodeList);
    NodeStore.linkList = NodeStore.linkList.concat(nodesAndLinks.linkList);
  }

  static BacklinksCallback(nodesAndLinks: {nodeList : INode[]; linkList : Link[];}) {
    NodeStore.nodeList = NodeStore.nodeList.concat(nodesAndLinks.nodeList);
    NodeStore.linkList = NodeStore.linkList.concat(nodesAndLinks.linkList);
  }

  static ParseBacklinks(backlinks: Article[]) {
    console.log("Method enter: ParseBacklinks");
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



  /**
   * Draws a cluster using the provided data.
   *
   * @param {string} drawingName - A unique drawing identifier that has no spaces, no "." and no "#" characters.
   *
   *              0 = No Sort.  Maintain original order.
   *              1 = Sort by arc value size.
   */
  public static drawCluster(drawingName: string, calledBy: string): void {
    new Canvas();
    console.log("Method enter: drawCluster called by " + calledBy);
    console.log("Called drawCluster; N° NodeStore.nodeList: " + NodeStore.nodeList.length);
    if (NodeStore.nodeList.length == 0) return;
    NodeStore.ConnectLinkSourceAndTarget();

    //This part relates to the UI
    NodeManager.DrawNodes();

    LinkAndForcesManager.DrawLinks();

    // Create a force layout and bind Nodes and Links
    LinkAndForcesManager.CreateAForceLayoutAndBindNodesAndLinks()
      .on("tick", () => {
        LinkAndForcesManager.Tick();
      });

    LegendManager.DrawLegend();

    d3.select(window).on("resize.updatesvg", Canvas.updateWindowSize);
  }

  // static resetData() {
  //   NodeStore.nodeList = [];
  //   NodeStore.linkList = [];
  //   SemanticWikiApi.downloadedArticles = [];
  // }
}

new MainEntry();