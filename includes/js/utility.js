let nodeSet = [], linkSet = [], invisibleNode = [], invisibleEdge = [], invisibleType = [], done = [], force,
    focalNodeID = '', color = [];
color['Internal Link'] = '#1f77b4';
color.Category = '#071f55';
color.URI = '#17a8cf';
color.Telephone = '#13d1e3';
color.Email = '#75d3dd';

color.Number = '#2ca02c';
color.Quantity = '#114911';
color.Temperature = '#b6e75a';

color['Monolingual Text'] = '#f2cd0c';
color.Text = '#ff7f0e';
color.Code = '#b37845';


color.Boolean = '#d62728';
color.Date = '#d62790';
color.Record = '#8927d6';


$(document).ready(function () {
    loadWikiArticles();
    // loadScript('select2.full.min.js'); // Already loaded via ResourceLoader

    $('#visualiseSite').click(function (event) {
        event.preventDefault();
        if ($("#wikiArticle").val() === "") {
            //Error Message
            $('#error_msg').show();
        } else {
            $('#error_msg').hide();
            exec($('#wikiArticle').val());
        }
    });
});

// noinspection JSForgottenDebugStatementInspection
// function loadScript(name) {
//     $.getScript('/extensions/SemanticMediaWikiGraph/includes/js/' + name, function (data, textStatus, jqxhr)
//     {
//         console.log(name + " loaded");
//     });
// }

/**
 * Executes the main graph visualization for a given wiki article
 * Fetches semantic data from MediaWiki API and renders the graph
 * 
 * @param {string} wikiArticle - The title of the wiki article to visualize
 * @throws {Error} If API call fails or returns invalid data
 */
function exec(wikiArticle) {
    if (!wikiArticle || typeof wikiArticle !== 'string') {
        console.error('Invalid wikiArticle parameter');
        $('#error_msg').text('Invalid article name').show();
        return;
    }
    
    done = [];
    $.ajax({
        url: mw.util.wikiScript('api'),
        data: {
            action: 'browsebysubject',
            subject: wikiArticle,
            format: 'json'
        },
        type: 'GET',
        success: function (data) {
            if (data && data.edit && data.edit.result === 'Success') {
                // debugger;
            } else if (data && data.error) {
                // Show error message instead of alert
                $('#error_msg').text(data.error.info || 'An error occurred').show();
                console.error('API Error:', data.error);
            } else {
                nodeSet = [];
                linkSet = [];
                done.push(wikiArticle);
                nodeSet.push({
                    id: data.query.subject,
                    name: data.query.subject.split("#")[0].replace("_", " "),
                    type: "Internal Link",
                    fixed: true,
                    x: 10,
                    y: 0,
                    hlink: "./" + data.query.subject.split("#")[0]
                });
                focalNodeID = data.query.subject;
                for (let i = 0; i < data.query.data.length; i++) {

                    const item = data.query.data[i];

                    if (item.property !== "_SKEY" && item.property !== "_MDAT" && item.property !== "_ASK") {
                        if (item.dataitem[0].item === data.query.subject) {
                            item.dataitem[0].item = item.dataitem[0].item + "_" + item.property;
                        }
                        for (let j = 0; j < item.dataitem.length; j++) {
                            const type = getNodeTypeName(item.property, item.dataitem[j].type);
                            if (type === 'Boolean') {
                                if (item.dataitem[j].item === 't') {
                                    item.dataitem[j].item = 'true';
                                } else {
                                    item.dataitem[j].item = 'false';
                                }
                            }
                            if (type === 'URI') {
                                nodeSet.push({
                                    id: item.dataitem[j].item,
                                    name: item.dataitem[j].item.split("#")[0].replace("_", " "),
                                    type: type,
                                    hlink: item.dataitem[0].item
                                });
                            } else if (type === "Internal Link") {
                                nodeSet.push({
                                    id: item.dataitem[j].item,
                                    name: item.dataitem[j].item.split("#")[0].replace("_", " "),
                                    type: type,
                                    hlink: "./" + item.dataitem[j].item.split("#")[0]
                                });
                            } else if (type === "Date") {
                                nodeSet.push({
                                    id: item.dataitem[j].item,
                                    name: item.dataitem[j].item.substring(2),
                                    type: type,
                                });
                            } else {
                                nodeSet.push({
                                    id: item.dataitem[j].item,
                                    name: item.dataitem[j].item.split("#")[0].replace("_", " "),
                                    type: type,
                                    //hlink: "./" + item.dataitem[0].item
                                });
                            }
                            linkSet.push({
                                sourceId: data.query.subject,
                                linkName: nicePropertyName(item.property),
                                targetId: item.dataitem[j].item
                            });
                        }

                    }

                }
                //backlinks(wikiArticle);
                //und Ask wer hierhin zeigt?
                $('#cluster_chart .chart').empty();
                drawCluster('Drawing1', focalNodeID, nodeSet, linkSet, '#cluster_chart .chart', 'colorScale20');
                const elem = $('[id=' + focalNodeID + '] a');
                elem[0].__data__.px = $(".chart")[0].clientWidth / 2;
                elem[0].__data__.py = $(".chart")[0].clientHeight / 2;
            }
        }
    });

}

/**
 * Maps Semantic MediaWiki property names and types to display names
 * 
 * @param {string} name - Property name (e.g., "_wpg", "_uri", "_boo")
 * @param {number} type - Property type code (fallback if name not recognized)
 * @returns {string} Display name for the node type (e.g., "Internal Link", "URI", "Boolean")
 */
function getNodeTypeName(name, type) {
    if (!name) {
        return "Unknown Type";
    }
    
    let result = "";
    switch (name) {
        case "_boo":
            result = "Boolean";
            break;
        case "_cod":
            result = "Code";
            break;
        case "_dat":
            result = "Date";
            break;
        case "_ema":
            result = "Email";
            break;
        case "_num":
            result = "Number"; //oder Email //oder Telefon
            break;
        case "_qty":
            result = "Quantity";
            break;
        case "_rec":
            result = "Record";
            break;
        case "_tem":
            result = "Temperature";
            break;
        case "_uri":
            result = "URI";
            break;
        case "_wpg":
            result = "Internal Link";
            break;
        case "Monolingual":
            result = "Monolingual Text";
            break;
        case "Telephone":
            result = "Telephone";
            break;
        case "_TEXT":
            result = "Text";
            break;
        case "_INST":
            result = "Category";
            break;
        default:
            switch (type) {
                case 1:
                    result = "Number";
                    break;
                case 2:
                    result = "Text";
                    break;
                case 4:
                    result = "Boolean";
                    break;
                case 5:
                    result = "URI"; //oder Email //oder Telefon
                    break;
                case 6:
                    result = "Date";
                    break;
                case 9:
                    result = "Internal Link";
                    break;
                default:
                    result = "Unknown Type";
            }
    }


    return result;
}


/**
 * Converts Semantic MediaWiki property codes to human-readable names
 * 
 * @param {string} name - Property code (e.g., "_wpg", "_uri")
 * @returns {string} Human-readable property name
 */
function nicePropertyName(name) {
    if (!name) {
        return "";
    }
    
    let result = "";
    switch (name) {
        case "_boo":
            result = "Boolean";
            break;
        case "_cod":
            result = "Code";
            break;
        case "_dat":
            result = "Date";
            break;
        case "_ema":
            result = "Email";
            break;
        case "_num":
            result = "Number"; //oder Email //oder Telefon
            break;
        case "_qty":
            result = "Quantity";
            break;
        case "_rec":
            result = "Record";
            break;
        case "_tem":
            result = "Temperature";
            break;
        case "_uri":
            result = "URI";
            break;
        case "_wpg":
            result = "Internal Link";
            break;
        case "Monolingual":
            result = "Monolingual Text";
            break;
        case "Telephone":
            result = "Telephone";
            break;
        case "_TEXT":
            result = "Text";
            break;
        case "_INST":
            result = "isA";
            break;
        default:
            result = name.replace("_", " ");
            break;
    }


    return result;
}


/**
 * Expands the graph by fetching and adding nodes for a clicked article
 * 
 * @param {string} wikiArticle - The title of the article to expand
 */
function askNode(wikiArticle) {
    if (!wikiArticle || typeof wikiArticle !== 'string') {
        console.error('Invalid wikiArticle parameter in askNode');
        return;
    }
    
    $.ajax({
        url: mw.util.wikiScript('api'),
        data: {
            action: 'browsebysubject',
            subject: wikiArticle,
            format: 'json'
        },
        type: 'GET',
        success: function (data) {
            if (data && data.edit && data.edit.result === 'Success') {
                // debugger;
            } else if (data && data.error) {
                // Show error message instead of alert
                $('#error_msg').text(data.error.info || 'An error occurred').show();
                console.error('API Error:', data.error);
            } else {
                done.push(wikiArticle);

                focalNodeID = data.query.subject;
                nodeSet.forEach(function (item) {
                    if (item.id === focalNodeID) {
                        item.fixed = true;
                    }
                });
                for (let i = 0; i < data.query.data.length; i++) {

                    var item = data.query.data[i];

                    if (item.property.indexOf("_") !== 0) {
                        if (item.dataitem[0].item === data.query.subject) {
                            item.dataitem[0].item = item.dataitem[0].item + "_" + item.property;
                        }
                        for (let j = 0; j < item.dataitem.length; j++) {
                            const type = getNodeTypeName(item.property, item.dataitem[j].type);
                            if (type === 'Boolean') {
                                if (item.dataitem[j].item === 't') {
                                    item.dataitem[j].item = 'true';
                                } else {
                                    item.dataitem[j].item = 'false';
                                }
                            }
                            if (type === 'URI') {
                                nodeSet.push({
                                    id: item.dataitem[j].item,
                                    name: item.dataitem[j].item.split("#")[0].replace("_", " "),
                                    type: type,
                                    hlink: item.dataitem[0].item
                                });
                            } else if (type === "Internal Link") {
                                nodeSet.push({
                                    id: item.dataitem[j].item,
                                    name: item.dataitem[j].item.split("#")[0].replace("_", " "),
                                    type: type,
                                    hlink: "./" + item.dataitem[0].item
                                });
                            } else if (type === "Date") {
                                nodeSet.push({
                                    id: item.dataitem[j].item,
                                    name: item.dataitem[j].item.substring(2),
                                    type: type,
                                });
                            } else {
                                nodeSet.push({
                                    id: item.dataitem[j].item,
                                    name: item.dataitem[j].item.split("#")[0].replace("_", " "),
                                    type: type,
                                    //hlink: "./" + item.dataitem[0].item
                                });
                            }
                            linkSet.push({
                                sourceId: data.query.subject,
                                linkName: nicePropertyName(item.property),
                                targetId: item.dataitem[j].item
                            });
                        }

                    }

                }
                force.stop();
                //  backlinks(wikiArticle);

                $('#cluster_chart .chart').empty();
                //  var k = cloneNode(nodeSet);
                //  var m = cloneEdge(linkSet);
                drawCluster('Drawing1', focalNodeID, nodeSet, linkSet, '#cluster_chart .chart', 'colorScale20');
                //drawCluster.update();
                hideElements();
            }
        }
    });

}


function cloneNode(array) {
    const newArr = [];

    array.forEach(function (item) {
        if (item.hlink !== 'undefined') {
            newArr.push({
                id: item.id,
                name: item.name,
                type: item.type,
                hlink: item.hlink
            });
        } else {
            newArr.push({
                id: item.id,
                name: item.name,
                type: item.type
            });
        }

    });

    return newArr;
}


function backlinks(wikiArticle) {
    $.ajax({
        url: mw.util.wikiScript('api'),
        data: {
            action: 'query',
            list: 'backlinks',
            bltitle: wikiArticle,
            format: 'json'
        },
        type: 'GET',
        success: function (data) {
            if (data && data.edit && data.edit.result === 'Success') {
                // debugger;
            } else if (data && data.error) {
                // Show error message instead of alert
                $('#error_msg').text(data.error.info || 'An error occurred').show();
                console.error('API Error:', data.error);
            } else {
                for (let i = 0; i < data.query.backlinks.length; i++) {

                    const item = data.query.backlinks[i];
                    nodeSet.push({
                        id: item.title,
                        name: item.title,
                        type: 'Unknown',
                        hlink: item.title
                    });

                    linkSet.push({
                        sourceId: item.title,
                        linkName: 'Unknown',
                        targetId: focalNodeID
                    });
                }

            }

            $('#cluster_chart .chart').empty();
            //  var k = cloneNode(nodeSet);
            //  var m = cloneEdge(linkSet);
            drawCluster('Drawing1', focalNodeID, nodeSet, linkSet, '#cluster_chart .chart', 'colorScale20');
            //drawCluster.update();
            hideElements();
        }
    });
}

function cloneEdge(array) {
    const newArr = [];
    array.forEach(function (item) {
        newArr.push({
            sourceId: item.sourceId,
            linkName: item.linkName,
            targetId: item.targetId
        });
    });

    return newArr;
}


/**
 * Loads all wiki articles and populates the Select2 dropdown
 * Fetches article list from MediaWiki API
 */
function loadWikiArticles() {
    $.ajax({
        url: mw.util.wikiScript('api'),
        data: {
            action: 'query',
            list: 'allpages',
            aplimit: 1000,
            format: 'json'
        },
        type: 'GET',
        success: function (data) {
            if (data && data.edit && data.edit.result === 'Success') {

            } else if (data && data.error) {


            } else {

                const dataArray = data.query.allpages;
                for (let i = 0; i < dataArray.length; i++) {
                    $('#wikiArticle').append('<option value="' + dataArray[i].title + '">' + dataArray[i].title + "</option>");
                }

                $("#wikiArticle").select2({
                    placeholder: "Select a Wiki Article",
                    allowClear: true
                });

            }
        }
    });
}

/**
 * Returns the color for a given node type
 * 
 * @param {string} type - Node type (e.g., "Internal Link", "URI", "Boolean")
 * @returns {string} Hex color code for the type, or undefined if not found
 */
function colorScaleMW(type) {
    if (!type || !color[type]) {
        console.warn('Color not found for type:', type);
        return '#cccccc'; // Default gray color
    }
    return color[type];
}


function hideElements() {
    const lis = $(".node");
    $(".node").each(function (index, el) {
        const invIndex = invisibleType.indexOf(el.__data__.type);
        if (invIndex > -1) {
            $(this).toggle();
            const invIndexNode = invisibleNode.indexOf(el.__data__.id);
            if (invIndexNode === -1) {
                invisibleNode.push(el.__data__.id);
            }
        }


    });

    $(".gLink").each(function (index, el)
    {
        //      debugger;
        const valSource = el.__data__.sourceId;
        const valTarget = el.__data__.targetId;
        var indexEdge = invisibleEdge.indexOf(valSource + "_" + valTarget + "_" + el.__data__.linkName);

        const indexSource = invisibleNode.indexOf(valSource);
        const indexTarget = invisibleNode.indexOf(valTarget);
        indexEdge = invisibleEdge.indexOf(valSource + "_" + valTarget + "_" + el.__data__.linkName);

        if (indexEdge > -1) {
            //Einer der beiden Knoten ist unsichtbar, aber Kante noch nicht
            $(this).toggle();
            //    invisibleEdge.push(valSource + "_" + valTarget + "_" + el.__data__.linkName);
        } else if ((indexSource > -1 || indexTarget > -1)) {
            //Knoten sind nicht unsichtbar, aber Kante ist es
            $(this).toggle();
            invisibleEdge.push(valSource + "_" + valTarget + "_" + el.__data__.linkName);
        }
    });
}