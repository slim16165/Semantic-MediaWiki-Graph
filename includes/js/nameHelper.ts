export class NameHelper {
  static parseNodeName(nameToParse: string, type: any, url: string) {
    function parseNodeName() {
      return nameToParse.split("#")[0].replace("_", " ");
    }

    let name, hlink = "";

    switch (type) {
      case "URI":
        name = parseNodeName();
        hlink = url;
        break;
      case "Internal Link":
        name = parseNodeName();
        hlink = `./${nameToParse.split("#")[0]}`;
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
    return { name, hlink };
  }

  public static nicePropertyName(name: string): string {
    switch (name) {
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
        return "isA";
      default:
        return name.replace("_", " ");
    }
  }
}