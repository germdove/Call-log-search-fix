// ==UserScript==
// @name       Call log search fix
// @namespace  Drake
// @version    0.4.1
// @description  Call log search is no longer too tall. Added in highlighting and hiding.
// @match      http://dintranet*/*og*earch
// @copyright  2012+, WH, LT
// @updateURL    https://github.com/vdeogmer/Call-log-search-fix/raw/master/Call%20log%20search%20fix.tamper.js
// @downloadURL    https://github.com/vdeogmer/Call-log-search-fix/raw/master/Call%20log%20search%20fix.tamper.js
// @grant GM_getValue
// @grant GM_setValue
// @grant GM_deleteValue
// @grant unsafeWindow
// @require http://code.jquery.com/jquery-latest.js
// @run-at document-idle
// ==/UserScript==

var viewportHeight = $(window).height()-190;

jQuery.expr[':'].Contains = function(a,i,m) {
    var text = jQuery(a).text().toUpperCase();          // Cache `jQuery(a).text().toUpperCase()`
    var words = m[3].split(',');                      // Split query by whitespace
    for (var i = 0; i < words.length; i++) {            // Loop over the split query, testing each one
        if (-1 !== text.indexOf(words[i].toUpperCase().trim())) { // If you find a query member that is contained,
            return true;                                   // return true
        }
    }
    return false;                                        // At loop end, return false
};

$("#body").css("padding-bottom","5px");
$(".ui-jqgrid-bdiv").css("height",viewportHeight+"px");
$(".main-content").css("position","relative");
$(".main-content").css("padding-top","0");
$(".content-wrapper").css("width","90%");
$(".content-wrapper").css("max-width","100%");
$(".ui-jqgrid").css("margin","0 auto");
$(".ui-jqgrid-view, .ui-jqgrid-toppager, .ui-jqgrid-hdiv, .ui-jqgrid-pager, .ui-jqgrid-bdiv, .ui-jqgrid-htable, #list, .ui-jqgrid-btable, .ui-jqgrid").css("width","100%");
$("section:first-child div div:nth-child(3) table tbody tr:first-child, header,footer").css("display", "none");
$("#DeptGroup").parent().parent().after('<tr><td><label title="">Reset Default Department:</label></td><td><input id="btnReset" type="button" value="Reset"></td></tr>');
$("#openCalls").parent().parent().after('<tr><td><label title="">Hide 908210:</label></td><td><input id="hide908210" type="checkbox" ></td></tr>');
$("#hide908210").parent().parent().after('<tr><td><label title="">Hide search term<em>(separate words or phrases with commas)</em>:</label> </td><td><input id="hideAny" type="checkbox"> <input id="hideSearch" type="text"></td></tr>');
$("#hideSearch").parent().parent().after('<tr><td><label title="">Hide Subject column:</label> </td><td><input id="hideSubject" type="checkbox"></td></tr>')
$("#hideSubject").prop("checked",GM_getValue("hideSubject"));



document.getElementById("useDateRange").click();
document.getElementById("openCalls").click();

if(GM_getValue("defaultDept") == undefined) {
    resetDefault();
}

document.getElementById("DeptGroup").value = GM_getValue("defaultDept");

setTimeout(function(){document.getElementById("btnSearch").click();},1000);

$(".title h2").text("Call Log Search");
$("#btnReset").on("click", function(){
    resetDefault();
});

function resetDefault(){
    GM_deleteValue("defaultDept");
       unsafeWindow.$("#DeptGroup").clone().dialog({
       title:"Choose Default Department",
        resizable:false,
        modal:true,
       width:400,
        buttons:{
            "Set Default Department": function(){
                GM_setValue("defaultDept",$(this).val());
                document.getElementById("DeptGroup").value = GM_getValue("defaultDept");
                unsafeWindow.$(this).dialog("destroy");
            },
            "Cancel":function(){
                document.getElementById("DeptGroup").value = GM_getValue("defaultDept");
                unsafeWindow.$(this).dialog("destroy");
            }
        }
    });
}
function CreateStyleRule (selector, rule ) {
    var styleTag = document.createElement ("style");
    var head = document.getElementsByTagName ("head")[0];
    head.appendChild (styleTag);

    var sheet = styleTag.sheet ? styleTag.sheet : styleTag.styleSheet;

    // add a new rule to the style sheet
    if (sheet.insertRule) {
        sheet.insertRule (selector + "{"+rule+";}", 0);
    }
    else {
        sheet.addRule (selector, rule, 0);
    }
}
CreateStyleRule(".highlightred", "background:red !important");
CreateStyleRule(".highlightyellow", "background:yellow !important");
CreateStyleRule(".highlightgreen", "background:lime !important");
CreateStyleRule(".hidden", "display:none");

$("#keywords").on("focusout", function(){
    $("#keywords").val($("#keywords").val().replace(/'/g, '"'));
});

$("#btnSearch").on("click", function(){
    setTimeout(function(){
        $("td").removeAttr("title");
        totalRecords = $("#records").text();
        colors();
        hideSubjects()

    },1500);
    $("#hide908210").prop("checked",0);
    $("#hideAny").prop("checked",0);
    //do stuff
    colors();
});

$("#next_t_list_toppager").on("click", function(){
    setTimeout(function(){colors();},1500);
});

$("#prev_t_list_toppager").on("click", function(){
    setTimeout(function(){colors();},1500);
});

function colors (){
    $("tr.jqgrow td:nth-child(2)").on("click", function(){
        $(this).parent().removeClass("highlightyellow");
        $(this).parent().removeClass("highlightgreen");
        $(this).parent().toggleClass('highlightred');
    });
    $("tr.jqgrow td:nth-child(3)").on("click", function(){
        $(this).parent().removeClass("highlightred");
        $(this).parent().removeClass("highlightgreen");
        $(this).parent().toggleClass('highlightyellow');
    });
    $("tr.jqgrow td:nth-child(4)").on("click", function(){
        $(this).parent().removeClass("highlightred");
        $(this).parent().removeClass("highlightyellow");
        $(this).parent().toggleClass("highlightgreen");
    });

    $("tr.jqgrow td:first-child").on("click", function(){
        if ($(this).parent().children(':eq(4)').hasClass('hidden')){
            $("#records").text(parseInt($("#records").text())+1);
        } else {
            $("#records").text(parseInt($("#records").text())-1);
        }
        $(this).parent().children(':eq(4)').toggleClass('hidden');
        $(this).parent().children(':eq(5)').toggleClass('hidden');
    });
}

$("#hide908210").on("click", function(){
    if ($("#hide908210").prop("checked")){
        $('td:nth-child(2) > a:contains("908210")').parent().parent().hide();
        $("#records").text(totalRecords - $('tr[id]').filter(":hidden").length);
    } else {
        $('td:nth-child(2) > a:contains("908210")').parent().parent().show();
        $("#records").text(totalRecords - $('tr[id]').filter(":hidden").length);
    }
});

$("#hideSubject").change(function(){
    GM_setValue("hideSubject",$("#hideSubject").prop("checked"));
    hideSubjects()
});

function hideSubjects(){
    if($("#hideSubject").prop("checked")){
        $('table tr').find('td:eq(4),th:eq(4)').hide();
        $("#list_catsubj").hide()
    } else {
        $('table tr').find('td:eq(4),th:eq(4)').show();
        $("#list_catsubj").show()
    }
}

$("#hideAny").on("click", function(){
    if ($("#hideAny").prop("checked")){
        $('td:nth-child(5):Contains("'+GM_getValue("hideSearch")+'"),td:nth-child(6):Contains("'+GM_getValue("hideSearch")+'")').parent().hide();
        $("#records").text(totalRecords - $('tr[id]').filter(":hidden").length);
    } else {
        $('td:nth-child(5):Contains("'+GM_getValue("hideSearch")+'"),td:nth-child(6):Contains("'+GM_getValue("hideSearch")+'")').parent().show();
        $("#records").text(totalRecords - $('tr[id]').filter(":hidden").length);
    }
});
