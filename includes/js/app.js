"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyClass = exports.ILink = void 0;
// @ts-ignore
var _1 = require("types-mediawiki/*");
var utility_1 = require("./utility");
var ILink = /** @class */ (function () {
    function ILink(sourceId, linkName, targetId) {
        this.sourceId = sourceId;
        this.linkName = linkName;
        this.targetId = targetId;
    }
    return ILink;
}());
exports.ILink = ILink;
var MyClass = /** @class */ (function () {
    function MyClass() {
        MyClass.initialize();
    }
    MyClass.initialize = function () {
        MyClass.loadWikiArticlesAjax();
        MyClass.loadScript('select2.full.min.js');
        $(function () {
            $('#visualiseSite').click(function () {
                var wikiArticle = MyClass.wikiArticleElement.val();
                if (wikiArticle === '') {
                    // Error Message
                    $('#error_msg').show();
                }
                else {
                    $('#error_msg').hide();
                    MyClass.exec(wikiArticle);
                }
            });
        });
    };
    MyClass.loadScript = function (name) {
        $.getScript("/extensions/SemanticMediaWikiGraph/includes/js/".concat(name), function (data, textStatus, jqxhr) { });
    };
    MyClass.exec = function (wikiArticle) {
        MyClass.done = [];
        $.ajax({
            url: _1.default.util.wikiScript('api'),
            data: {
                action: 'browsebysubject',
                subject: wikiArticle,
                format: 'json'
            },
            type: 'GET',
            success: execSuccessCallback
        });
        function execSuccessCallback(data) {
            if ((data === null || data === void 0 ? void 0 : data.edit) && data.edit.result === 'Success') {
                // debugger;
            }
            else if (data === null || data === void 0 ? void 0 : data.error) {
                alert(data);
                // debugger;
            }
            else {
                MyClass.nodeSet = [];
                MyClass.linkSet = [];
                MyClass.done.push(wikiArticle);
                var node = ({
                    id: data.query.subject,
                    name: data.query.subject.split("#")[0].replace("_", " "),
                    type: "Internal Link",
                    fixed: true,
                    x: 10,
                    y: 0,
                    hlink: "./".concat(data.query.subject.split("#")[0])
                });
                MyClass.nodeSet.push(node);
                MyClass.focalNodeID = data.query.subject;
                this.processData(data);
                //backlinks(wikiArticle);
                //und Ask wer hierhin zeigt?
                $('#cluster_chart .chart').empty();
                utility_1.Utility.drawCluster('Drawing1', MyClass.focalNodeID, MyClass.nodeSet, MyClass.linkSet, '#cluster_chart .chart', 'colorScale20');
                var elem = $("[id=".concat(MyClass.focalNodeID, "] a"));
                // @ts-ignore
                elem[0].__data__.px = $(".chart")[0].clientWidth / 2;
                // @ts-ignore
                elem[0].__data__.py = $(".chart")[0].clientHeight / 2;
            }
        }
    };
    MyClass.getNodeTypeName = function (name, type) {
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
    };
    MyClass.nicePropertyName = function (name) {
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
    };
    MyClass.askNode = function (wikiArticle) {
        $.ajax({
            url: _1.default.util.wikiScript('api'),
            data: {
                action: 'browsebysubject',
                subject: wikiArticle,
                format: 'json'
            },
            type: 'GET',
            success: function (data) {
                if ((data === null || data === void 0 ? void 0 : data.edit) && data.edit.result === 'Success') {
                    // debugger;
                }
                else if (data === null || data === void 0 ? void 0 : data.error) {
                    alert(data);
                    // debugger;
                }
                else {
                    MyClass.done.push(wikiArticle);
                    MyClass.focalNodeID = data.query.subject;
                    MyClass.nodeSet.forEach(function (item) {
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
                    utility_1.Utility.drawCluster('Drawing1', MyClass.focalNodeID, MyClass.nodeSet, MyClass.linkSet, '#cluster_chart .chart', 'colorScale20');
                    //drawCluster.update();
                    MyClass.hideElements();
                }
            }
        });
    };
    MyClass.getNodesAndLinks = function (subject, data) {
        var nodeSet = [];
        var linkSet = [];
        for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
            var item = data_1[_i].item;
            if (!["_SKEY", "_MDAT", "_ASK"].includes(item.property)) {
                var dataitem = item.dataitem;
                if (dataitem[0].item === subject) {
                    dataitem[0].item = "".concat(dataitem[0].item, "_").concat(item.property);
                }
                for (var _a = 0, dataitem_1 = dataitem; _a < dataitem_1.length; _a++) {
                    var arrayElement = dataitem_1[_a];
                    nodeSet.push(this.extractNodeData(subject, item.property, [arrayElement]));
                    linkSet.push(this.extractLinkData(subject, item.property, [arrayElement]));
                }
            }
        }
        MyClass.nodeSet = nodeSet;
        MyClass.linkSet = linkSet;
    };
    MyClass.extractNodeData = function (subject, property, dataitem) {
        var type = MyClass.getNodeTypeName(property, Number(dataitem[0].type));
        var name, hlink;
        var item = dataitem[0].item;
        if (type === 'URI') {
            name = item.split("#")[0].replace("_", " ");
            hlink = subject;
        }
        else if (type === "Internal Link") {
            name = item.split("#")[0].replace("_", " ");
            hlink = "./".concat(item.split("#")[0]);
        }
        else if (type === "Date") {
            name = item.substring(2);
        }
        else if (type === 'Boolean') {
            name = item === 't' ? 'true' : 'false';
        }
        else {
            name = item.split("#")[0].replace("_", " ");
        }
        return {
            id: item,
            name: name,
            type: null,
            hlink: hlink,
        };
    };
    MyClass.extractLinkData = function (subject, property, dataitem) {
        return {
            sourceId: subject,
            linkName: MyClass.nicePropertyName(property),
            targetId: dataitem[0].item,
        };
    };
    MyClass.backlinksAjax = function (wikiArticle) {
        $.ajax({
            url: _1.default.util.wikiScript('api'),
            data: {
                action: 'query',
                list: 'backlinks',
                bltitle: wikiArticle,
                format: 'json'
            },
            type: 'GET',
            success: function (_a) {
                var data = _a.data;
                this.BacklinksCallback({ data: data });
            }
        });
    };
    MyClass.prototype.BacklinksCallback = function (_a) {
        var data = _a.data;
        if ((data === null || data === void 0 ? void 0 : data.edit) && data.edit.result === 'Success') {
            // debugger;
        }
        else if (data === null || data === void 0 ? void 0 : data.error) {
            alert((data));
            // debugger;
        }
        else {
            this.InitNodeAndLinks(data.query.backlinks);
        }
        $('#cluster_chart .chart').empty();
        //  var k = cloneNode(nodeSet);
        //  var m = cloneEdge(linkSet);
        utility_1.Utility.drawCluster('Drawing1', MyClass.focalNodeID, MyClass.nodeSet, MyClass.linkSet, '#cluster_chart .chart', 'colorScale20');
        //drawCluster.update();
        MyClass.hideElements();
    };
    MyClass.prototype.InitNodeAndLinks = function (backlinks) {
        for (var _i = 0, backlinks_1 = backlinks; _i < backlinks_1.length; _i++) {
            var article = backlinks_1[_i];
            MyClass.nodeSet.push({
                id: article.title,
                name: article.title,
                type: 'Unknown',
                hlink: article.title
            });
            MyClass.linkSet.push({
                sourceId: article.title,
                linkName: 'Unknown',
                targetId: MyClass.focalNodeID
            });
        }
    };
    MyClass.cloneNode = function (array) {
        var newArr = [];
        array.forEach(function (node) {
            if (node.hlink !== 'undefined') {
                newArr.push({
                    id: node.id,
                    name: node.name,
                    type: node.type,
                    hlink: node.hlink
                });
            }
            else {
                newArr.push({
                    id: node.id,
                    name: node.name,
                    type: node.type
                });
            }
        });
        return newArr;
    };
    MyClass.cloneEdge = function (array) {
        var newArr = [];
        array.forEach(function (item) {
            newArr.push(new ILink(item.sourceId, item.linkName, item.targetId));
        });
        return newArr;
    };
    MyClass.loadWikiArticlesAjax = function () {
        $.ajax({
            url: _1.default.util.wikiScript('api'),
            data: {
                action: 'query',
                list: 'allpages',
                aplimit: 1000,
                format: 'json'
            },
            type: 'GET',
            success: function (_a) {
                var data = _a.data;
                if (!(!((data === null || data === void 0 ? void 0 : data.edit) && data.edit.result === 'Success') && !(data === null || data === void 0 ? void 0 : data.error))) {
                    return;
                }
                this.CreateWikiArticleUi(data.query.allpages);
            }
        });
    };
    MyClass.prototype.CreateWikiArticleUi = function (articles) {
        for (var _i = 0, articles_1 = articles; _i < articles_1.length; _i++) {
            var article = articles_1[_i];
            $('#wikiArticle').append("<option value=\"".concat(article.title, "\">").concat(article.title, "</option>"));
        }
        $("#wikiArticle").select2({
            placeholder: "Select a Wiki Article",
            allowClear: true
        });
    };
    MyClass.hideElements = function () {
        $(".node").each(function (index, el) {
            var invIndex = MyClass.invisibleType.indexOf(el.__data__.type);
            if (!(invIndex > -1)) {
                return;
            }
            $(this).toggle();
            var invIndexNode = MyClass.invisibleNode.indexOf(el.__data__.id);
            if (invIndexNode === -1) {
                MyClass.invisibleNode.push(el.__data__.id);
            }
        });
        $(".gLink").each(function (index, el) {
            //      debugger;
            var valSource = el.__data__.sourceId;
            var valTarget = el.__data__.targetId;
            var indexEdge;
            var indexSource = MyClass.invisibleNode.indexOf(valSource);
            var indexTarget = MyClass.invisibleNode.indexOf(valTarget);
            indexEdge = MyClass.invisibleEdge.indexOf("".concat(valSource, "_").concat(valTarget, "_").concat(el.__data__.linkName));
            if (indexEdge > -1) {
                //Einer der beiden Knoten ist unsichtbar, aber Kante noch nicht
                $(this).toggle();
                //    invisibleEdge.push(valSource + "_" + valTarget + "_" + el.__data__.linkName);
            }
            else if ((indexSource > -1 || indexTarget > -1)) {
                //Knoten sind nicht unsichtbar, aber Kante ist es
                $(this).toggle();
                MyClass.invisibleEdge.push("".concat(valSource, "_").concat(valTarget, "_").concat(el.__data__.linkName));
            }
        });
    };
    MyClass.invisibleNode = [];
    MyClass.invisibleEdge = [];
    MyClass.invisibleType = [];
    MyClass.done = [];
    MyClass.focalNodeID = '';
    MyClass.nodeSet = [];
    MyClass.linkSet = [];
    MyClass.wikiArticleElement = $('#wikiArticle');
    return MyClass;
}());
exports.MyClass = MyClass;
