import * as util from 'types-mediawiki/mw/'
import {Utility} from "./utility";
import {Article, BacklinksCallbackParams, ExtractedParams, IForce, ILink, INode, SuccessParams} from "./OtherTypes";

export class MyClass {
    static invisibleNode: any[] = [];
    static invisibleEdge: string[] = [];
    static invisibleType: any[] = [];
    static done: any[] = [];
    static focalNodeID = '';
    static nodeSet: INode[] = [];
    static linkSet: ILink[] = [];
    static force: IForce;

    private static wikiArticleElement: JQuery = $('#wikiArticle');

    constructor() {
        MyClass.initialize();
    }

    static initialize(): void {
        MyClass.loadWikiArticlesAjax();
        // MyClass.loadScript('select2.full.min.js');

        $(() => {
            $('#visualiseSite').click(() => {
                let wikiArticle = MyClass.wikiArticleElement.val();

                if (wikiArticle === '') {
                    // Error Message
                    $('#error_msg').show();
                } else {
                    $('#error_msg').hide();
                    MyClass.exec(wikiArticle);
                }
            });
        });
    }


    public static loadScript(name: string) {
        $.getScript(`/extensions/SemanticMediaWikiGraph/includes/js/${name}`, (data: any, textStatus: any, jqxhr: any) => { });
    }


    public static exec(wikiArticle: any) {
        MyClass.done = [];
        $.ajax({
            url: mw.util.wikiScript('api'),
            data: {
                action: 'browsebysubject',
                subject: wikiArticle,
                format: 'json'
            },
            type: 'GET',
            success: execSuccessCallback
        });


        function execSuccessCallback(data: { edit: { result: string; }; error: any; query: { subject: string; data: any; }; }) {
            if (data?.edit && data.edit.result === 'Success') {
                // debugger;
            } else if (data?.error) {
                alert(data);
                // debugger;
            }
            else
            {
                MyClass.nodeSet = [];
                MyClass.linkSet = [];
                MyClass.done.push(wikiArticle);
                let node : INode = ({
                    id: data.query.subject,
                    name: data.query.subject.split("#")[0].replace("_", " "),
                    type: "Internal Link",
                    fixed: true,
                    x: 10,
                    y: 0,
                    hlink: `./${data.query.subject.split("#")[0]}`
                }) as INode;
                MyClass.nodeSet.push(node);
                MyClass.focalNodeID = data.query.subject;
                this.processData(data);
                //backlinks(wikiArticle);
                //und Ask wer hierhin zeigt?
                $('#cluster_chart .chart').empty();
                Utility.drawCluster('Drawing1', MyClass.focalNodeID, MyClass.nodeSet, MyClass.linkSet, '#cluster_chart .chart', 'colorScale20');
                const elem: JQuery<HTMLElement> = $(`[id=${MyClass.focalNodeID}] a`);
                // @ts-ignore
                elem[0].__data__.px = $(".chart")[0].clientWidth / 2;
                // @ts-ignore
                elem[0].__data__.py = $(".chart")[0].clientHeight / 2;
            }
        }

    }


    public static getNodeTypeName(name: string, type: number) {
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
                return "Category";
            default:
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


    public static askNode(wikiArticle: any) {
        $.ajax({
            url: mw.util.wikiScript('api'),
            data: {
                action: 'browsebysubject',
                subject: wikiArticle,
                format: 'json'
            },
            type: 'GET',

            success(data) {
                if (data?.edit && data.edit.result === 'Success') {
                    // debugger;
                } else if (data?.error) {
                    alert(data);
                    // debugger;
                } else {
                    MyClass.done.push(wikiArticle);
                    MyClass.focalNodeID = data.query.subject;
                    MyClass.nodeSet.forEach((item) => {
                        if (item.id === MyClass.focalNodeID) {
                            item.fixed = true;
                        }
                    });
                    this.getNodesAndLinks(data.subject, data.data);
                    MyClass.force.stop();
                    //  backlinks(wikiArticle);

                    $('#cluster_chart .chart').empty();
                    //  var k = cloneNode(nodeSet);
                    //  var m = cloneEdge(linkSet);
                    Utility.drawCluster('Drawing1', MyClass.focalNodeID, MyClass.nodeSet, MyClass.linkSet, '#cluster_chart .chart', 'colorScale20');
                    //drawCluster.update();
                    MyClass.hideElements();
                }
            }
        });

    }

    public static getNodesAndLinks(subject: string, data: ExtractedParams[] ) {
        const nodeSet = [];
        const linkSet = [];

        for (const {item} of data)
        {
            if (!["_SKEY", "_MDAT", "_ASK"].includes(item.property)) {
                let dataitem = item.dataitem;

                if (dataitem[0].item === subject) {
                    dataitem[0].item = `${dataitem[0].item}_${item.property}`;
                }
                for (let arrayElement of dataitem) {
                    nodeSet.push(this.extractNodeData(subject, item.property, [arrayElement]));
                    linkSet.push(this.extractLinkData(subject, item.property, [arrayElement]));
                }
            }
        }
        MyClass.nodeSet = nodeSet;
        MyClass.linkSet = linkSet;
    }

    public static extractNodeData(subject: string, property: string, dataitem: { item: string, type: string }[]) : INode
    {
        const type = MyClass.getNodeTypeName(property, Number(dataitem[0].type));

        let name, hlink;
        let item = dataitem[0].item;
        if (type === 'URI') {
            name = item.split("#")[0].replace("_", " ");
            hlink = subject;
        } else if (type === "Internal Link") {
            name = item.split("#")[0].replace("_", " ");
            hlink = `./${item.split("#")[0]}`;
        } else if (type === "Date") {
            name = item.substring(2);
        } else if (type === 'Boolean') {
            name = item === 't' ? 'true' : 'false';
        } else {
            name = item.split("#")[0].replace("_", " ");
        }
        return {
            id: item,
            name,
            type: null,
            hlink,
        } as INode;
    }

    public static extractLinkData(subject: string, property: string, dataitem: { item: string, type: string }[]):
        ILink {
        return <ILink>{
            sourceId: subject,
            linkName: MyClass.nicePropertyName(property),
            targetId: dataitem[0].item,
        };
    }



    public static backlinksAjax(wikiArticle: string) {
        $.ajax({
            url: mw.util.wikiScript('api'),
            data: {
                action: 'query',
                list: 'backlinks',
                bltitle: wikiArticle,
                format: 'json'
            },
            type: 'GET',

            success({data}: BacklinksCallbackParams)
            {
                this.BacklinksCallback({data : data});
            }
        });
    }


    private BacklinksCallback({data}: BacklinksCallbackParams) {
        if (data?.edit && data.edit.result === 'Success') {
            // debugger;
        } else if (data?.error) {
            alert((data) as any);
            // debugger;
        } else {
            this.InitNodeAndLinks(data.query.backlinks);
        }

        $('#cluster_chart .chart').empty();
        //  var k = cloneNode(nodeSet);
        //  var m = cloneEdge(linkSet);
        Utility.drawCluster('Drawing1', MyClass.focalNodeID, MyClass.nodeSet, MyClass.linkSet, '#cluster_chart .chart', 'colorScale20');
        //drawCluster.update();
        MyClass.hideElements();
    }

    private InitNodeAndLinks(backlinks: Article[])
    {
        for (let article of backlinks) {
            MyClass.nodeSet.push({
                id: article.title,
                name: article.title,
                type: 'Unknown',
                hlink: article.title
            });

            MyClass.linkSet.push(<ILink>{
                sourceId: article.title,
                linkName: 'Unknown',
                targetId: MyClass.focalNodeID
            });
        }
    }

    public static cloneNode(array: INode[]) {
        const newArr: INode[] = [];

        array.forEach((node: INode) => {
            if (node.hlink !== 'undefined') {
                newArr.push({
                    id: node.id,
                    name: node.name,
                    type: node.type,
                    hlink: node.hlink
                });
            } else {
                newArr.push({
                    id: node.id,
                    name: node.name,
                    type: node.type
                });
            }

        });

        return newArr;
    }
    public static cloneEdge(array: ILink[]) {

        const newArr: ILink[] = [];
        array.forEach((item: ILink) => {
            newArr.push(new ILink(item.sourceId, item.linkName, item.targetId));
        });

        return newArr;
    }


    public static loadWikiArticlesAjax()
    {
        $.ajax({
            url: mw.util.wikiScript('api') as string,
            data: {
                action: 'query',
                list: 'allpages',
                aplimit: 1000,
                format: 'json'
            },
            type: 'GET',
            success({data}: SuccessParams)
            {
                if (!(!(data?.edit && data.edit.result === 'Success') && !(data?.error))) {
                    return;
                }
                this.CreateWikiArticleUi(data.query.allpages);
            }
        });
    }

    private CreateWikiArticleUi(articles: Article[])
    {
        for (const article of articles) {
            $('#wikiArticle').append(`<option value="${article.title}">${article.title}</option>`);
        }

        $("#wikiArticle").select2({
            placeholder: "Select a Wiki Article",
            allowClear: true
        });
    }

    public static hideElements() {
        $(".node").each(function (index, el: CustomHTMLElement) {
            const invIndex = MyClass.invisibleType.indexOf(el.__data__.type);
            if (!(invIndex > -1)) {
                return;
            }
            $(this).toggle();
            const invIndexNode = MyClass.invisibleNode.indexOf(el.__data__.id);
            if (invIndexNode === -1) {
                MyClass.invisibleNode.push(el.__data__.id);
            }
        });

        $(".gLink").each(function (index, el: CustomHTMLElement) {
            //      debugger;
            const valSource = el.__data__.sourceId;
            const valTarget = el.__data__.targetId;
            let indexEdge: number;

            const indexSource = MyClass.invisibleNode.indexOf(valSource);
            const indexTarget = MyClass.invisibleNode.indexOf(valTarget);
            indexEdge = MyClass.invisibleEdge.indexOf(`${valSource}_${valTarget}_${el.__data__.linkName}`);

            if (indexEdge > -1) {
                //Einer der beiden Knoten ist unsichtbar, aber Kante noch nicht
                $(this).toggle();
                //    invisibleEdge.push(valSource + "_" + valTarget + "_" + el.__data__.linkName);
            } else if ((indexSource > -1 || indexTarget > -1)) {
                //Knoten sind nicht unsichtbar, aber Kante ist es
                $(this).toggle();
                MyClass.invisibleEdge.push(`${valSource}_${valTarget}_${el.__data__.linkName}`);
            }
        });
    }

}

new MyClass();

