import { CustomHTMLElement } from "../Model/OtherTypes";
import { INode } from "../Model/INode";
import { Link } from "../Model/Link";

export class VisibilityHandler{
  static invisibleNode: any[] = [];
  static invisibleEdge: string[] = [];
  static invisibleType: any[] = [];
  
  public static hideElements() {
    $(".node").each((index, element) => this.HideEach(element));

    $(".gLink").each((index, element) => this.SomethingRelatedToNodeVisibility(element as CustomHTMLElement));
  }

  private static HideEach(element: HTMLElement) {
    let el = element as CustomHTMLElement;
    let node = el.__data__ as INode;
    const invIndex = this.invisibleType.indexOf(node.type);
    if (!(invIndex > -1)) {
      return;
    }
    $(el).toggle();
    const invIndexNode = this.invisibleNode.indexOf(node.id);
    if (invIndexNode === -1) {
      this.invisibleNode.push(node.id);
    }
  }

  private static SomethingRelatedToNodeVisibility(el: CustomHTMLElement) {
    let link = el.__data__ as Link;
    const valSource = link.sourceId;
    const valTarget = link.targetId;
    let indexEdge: number;

    const indexSource = this.invisibleNode.indexOf(valSource);
    const indexTarget = this.invisibleNode.indexOf(valTarget);
    indexEdge = this.invisibleEdge.indexOf(`${valSource}_${valTarget}_${link.linkName}`);

    if (indexEdge > -1) {
      //Einer der beiden Knoten ist unsichtbar, aber Kante noch nicht
      $(this).toggle();
      //    invisibleEdge.push(valSource + "_" + valTarget + "_" + el.__data__.linkName);
    } else if ((indexSource > -1 || indexTarget > -1)) {
      //Knoten sind nicht unsichtbar, aber Kante ist es
      $(this).toggle();
      this.invisibleEdge.push(`${valSource}_${valTarget}_${link.linkName}`);
    }
  }

  static MakeInvisible(el: CustomHTMLElement, typeValue: string) {
    let node = el.__data__ as INode;
    if (node.type !== typeValue) {
      return;
    }
    const invIndex = VisibilityHandler.invisibleNode.indexOf(node.id);
    if (invIndex > -1) {
      VisibilityHandler.invisibleNode.splice(invIndex, 1);
    } else {
      VisibilityHandler.invisibleNode.push(node.id);
    }
    $(this).toggle();
  }

  static MakeInvisible2(el: CustomHTMLElement) {
    //      debugger;
    let data = el.__data__ as Link;
    const valSource = data.sourceId;
    const valTarget = data.targetId;
    //if beide
    const indexSource = VisibilityHandler.invisibleNode.indexOf(valSource);
    const indexTarget = VisibilityHandler.invisibleNode.indexOf(valTarget);
    const indexEdge = VisibilityHandler.invisibleEdge.indexOf(`${valSource}_${valTarget}_${data.linkName}`);

    if ((indexSource > -1 || indexTarget > -1) && indexEdge === -1) {
      //Einer der beiden Knoten ist unsichtbar, aber Kante noch nicht
      $(this).toggle();
      VisibilityHandler.invisibleEdge.push(`${valSource}_${valTarget}_${data.linkName}`);
    } else if (indexSource === -1 && indexTarget === -1 && indexEdge === -1) {
      //Beide Knoten sind nicht unsichtbar und Kante ist nicht unsichtbar
    } else if (indexSource === -1 && indexTarget === -1 && indexEdge > -1) {
      //Knoten sind nicht unsichtbar, aber Kante ist es
      $(this).toggle();
      VisibilityHandler.invisibleEdge.splice(indexEdge, 1);
    }
  }


}