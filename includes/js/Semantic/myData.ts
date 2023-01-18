import { MediaWikiArticle } from "./mediaWikiArticle";
import { MainEntry } from "../app";
import { NodeManager } from "../Ui/nodeManager";
import { NodeStore } from "../nodeStore";

export class MyData {

  mediawikiArticle!: MediaWikiArticle;
  private query: { subject: string; data: any };

  constructor(callback: SuccessCallback) {
    this.query = callback.query;
  }

  public Parse() {
    this.mediawikiArticle = new MediaWikiArticle(this.query.subject, this.query.data);
    let wikiArticle = this.mediawikiArticle;

    NodeStore.nodeList.push(wikiArticle.node);

    wikiArticle.HandleProperties();

  }
}

export interface SuccessParams {
  edit: { result: string };
  error: any;
  query: { allpages: any }
}

export interface SuccessCallback {
  edit: { result: string };
  error: any;
  query: { subject: string; data: any }
}