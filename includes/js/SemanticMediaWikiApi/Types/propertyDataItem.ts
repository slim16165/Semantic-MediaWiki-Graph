import { SemanticPropertyAndItems } from "./semanticPropertyAndItems";

export class PropertyDataItem {
  type: number;
  typeStr: string;
  item: string;
  private parentSemantProp: SemanticPropertyAndItems;
  private NiceTypeName: string;

  constructor(item: string, type: number, parentSemantProp: SemanticPropertyAndItems) {
    this.type = type;
    this.item = item;
    this.parentSemantProp = parentSemantProp;
    this.typeStr = this.getTypeDescr(this.type); 
    this.NiceTypeName = this.getNodeType();
  }
  private getNodeType() {
    let p = this.parentSemantProp.getPropertyNiceName(this.parentSemantProp.propertyName);
    if (!p || p ==="")
      return this.typeStr;
    else return p;

  }
  private getTypeDescr(type: number) {
    switch (type) {
      case 1:
        return "Number";
      case 2:
        return "Text";
      case 4:
        return "Boolean";
      case 5:
        return "URI"; //oder Email //oder Telefon
      case 6:
        return "Date";
      case 9:
        return "Internal Link";
      default:
        return "Unknown Type";
    }
  }
}