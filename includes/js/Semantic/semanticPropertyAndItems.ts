import { MediaWikiArticle } from "./mediaWikiArticle";
import { INode } from "../Model/INode";
import { Link } from "../Model/Link";
import { PropertyDataItem } from "./propertyDataItem";
import { NodeType } from "../Model/nodeType";
import { NodeStore } from "../nodeStore";

// noinspection UnnecessaryLocalVariableJS
export class SemanticPropertyAndItems {
  public propertyName: string;
  private readonly nicePropertyName: string;

  private subject: string | undefined;
  dataitems: PropertyDataItem[];
  private parentArticle!: MediaWikiArticle;
  private firstItem!: PropertyDataItem;
  private readonly sourceNodeUrl: string;

  constructor(property: string, dataitems: PropertyDataItem[], subject: string | undefined, parentArticle: MediaWikiArticle) {
    this.propertyName = property;
    this.nicePropertyName = this.NicePropertyName();
    //Solo per alcune proprietà sono presenti dataitems e subject

    this.dataitems = [];
    for (const data of dataitems) {
      let item = new PropertyDataItem(data.item, data.type, this);
      this.dataitems.push(item);
    }


    this.subject = subject;
    this.parentArticle = parentArticle;
    this.sourceNodeUrl = parentArticle.Id;
  }

  IsSpecialProperty() {
    /*
          I valori delle property "_SKEY", "_MDAT" e "_ASK" sono proprietà speciali predefinite in Semantic MediaWiki.
          "_SKEY" è una proprietà che viene utilizzata per memorizzare le chiavi di ricerca per ogni oggetto di dati, che vengono utilizzate per velocizzare le query su quell'oggetto.
          "_MDAT" è una proprietà che viene utilizzata per memorizzare la data di modifica di un oggetto di dati.
          "_ASK" è una proprietà che viene utilizzata per memorizzare una query SPARQL o una query di tipo "ask" per un oggetto di dati. Questa proprietà viene utilizzata per eseguire query complesse sui dati semantici.
          * INST
          */
    return ["_SKEY", "_MDAT", "_ASK"].includes(this.propertyName);
  }

  SetUri() {
    if (!this.dataitems || this.dataitems.length == 0)
      return;

    this.firstItem = this.dataitems[0];

    if (this.firstItem.item === this.sourceNodeUrl)
      this.firstItem.item = `${this.firstItem.item}_${(this.propertyName)}`;
  }

  ParsePropertyNode(dataitem: PropertyDataItem) {
    //In the original version it was using the firstElement for the last 2 parameters
    let name = this.parseNodeName(dataitem.item, dataitem.typeStr);
    let hlink = this.parseHlink(dataitem.item, dataitem.typeStr, this.sourceNodeUrl);
    let node = new INode(NodeType.Property, dataitem.item, name, "null", 0, 0, hlink);
    return node;
  }

  ParsePropertyLink(dataitem: PropertyDataItem) {
    return new Link(NodeType.Property, this.nicePropertyName, this.sourceNodeUrl, dataitem.item /*targetId*/, "");
  }

  private NicePropertyName(): string {
    let p = this.getPropertyNiceName(this.propertyName);

    return p == "" ? this.propertyName.replace("_", " ") : p;
  }

  public getPropertyNiceName(propertyName: string): string {
    switch (propertyName) {
      case "_boo":
        return "Boolean";
      case "_cod":
        return "Code";
      case "_dat":
        return "Date";
      case "_ema":
        return "Email";
      case "_num":
        return "Number"; //oder Email //oder Telefon
      case "_qty":
        return "Quantity";
      case "_rec":
        return "Record";
      case "_tem":
        return "Temperature";
      case "_uri":
        return "URI";
      case "_wpg":
        return "Internal Link";
      case "Monolingual":
        return "Monolingual Text";
      case "Telephone":
        return "Telephone";
      case "_TEXT":
        return "Text";
      case "_INST":
        return "Category" /*isA*/;
      default:
        return "";
    }
  }
  private parseNodeName(nameToParse: string, type: string) {
    function parseNodeName() {
      return nameToParse.split("#")[0].replace("_", " ");
    }

    let name;

    switch (type) {
      case "URI":
        name = parseNodeName();
        break;
      case "Internal Link":
        name = parseNodeName();
        break;
      case "Date":
        name = nameToParse.substring(2);
        break;
      case "Boolean":
        name = nameToParse === "t" ? "true" : "false";
        break;
      default:
        name = parseNodeName();
        break;
    }
    return name;
  }

  private parseHlink(nameToParse: string, type: string, url: string) {
    return type === "URI" ? url : type === "Internal Link" ? `./${nameToParse.split("#")[0]}` : "";
  }

}

