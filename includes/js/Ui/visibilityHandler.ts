import { CustomHTMLElement } from "../OtherTypes";
import { INode } from "../INode";
import { Link } from "../Link";

export class VisibilityHandler{
  static invisibleNode: any[] = [];
  static invisibleEdge: string[] = [];
  static invisibleType: any[] = [];
  
  public static hideElements() {
    $(".node").each((index, element) => this.HideEach(index, element));

    $(".gLink").each((index, element) => this.SomethingRelatedToNodeVisibility(element as CustomHTMLElement));
  }

  private static HideEach(index: number, element: HTMLElement) {
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
  };
}