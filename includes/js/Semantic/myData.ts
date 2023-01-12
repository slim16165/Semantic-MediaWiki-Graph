import { MediaWikiArticle } from "./mediaWikiArticle";
import { MainEntry } from "../app";

export class MyData {

  mediawikiArticle!: MediaWikiArticle;
  private query: { subject: string; data: any };

  constructor(callback: SuccessCallback) {
    this.query = callback.query;
  }

  public Parse() {
    this.mediawikiArticle = new MediaWikiArticle(this.query.subject, this.query.data);
    let wikiArticle = this.mediawikiArticle;

    wikiArticle.HandleProperties();
    MainEntry.nodeSet.push(wikiArticle.node);
    MainEntry.focalNodeID = wikiArticle.Id;
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