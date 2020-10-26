// ==UserScript==
// @name         E-hentai AutoComplete
// @namespace    http://rikis.noname
// @version      0.2
// @description  autocomple for tags
// @author       You
// @include        https://e-hentai.org/*
// @include        https://exhentai.org/*
// @grant        none
// ==/UserScript==


if (typeof tagcompleter !== 'undefined') return;


(()=>{

var style = document.createElement('style');
style.innerHTML =
    '.tagcomplete{position:relative;display:inline-block}.tagcomplete-items{position:absolute;border:1px solid '+
    '#B5A4A4;border-top:none;border-bottom:none;z-index:99;margin-left:60px;width:323px}.tagcomplete-items div{padding:10px;'+
    'cursor:pointer;background-color:#EDEBDF;text-align:left}.tagcomplete-items div:not(:last-child){border-bottom:1px solid '+
    '#D4D4D4}.tagcomplete-items div:last-child{border-bottom:1px solid #B5A4A4}.tagcomplete-items div:hover{'+
    'background-color:#F3F0E0}.tagcomplete-active{background-color:#5C0D12!important;color:#EDEBDF};';
document.head.appendChild(style);

var api_url = "https://api.e-hentai.org/api.php";

function api_call(b, a, c) {
    b.open("POST", api_url);
    b.setRequestHeader("Content-Type", "application/json");
    b.withCredentials = true;
    b.onreadystatechange = c;
    b.send(JSON.stringify(a));
}
function api_response(b) {
    if (b.readyState == 4) {
        if (b.status == 200) {
            var a = JSON.parse(b.responseText);
            if (a.login != undefined) {
                top.location.href = 'https://e-hentai.org/home.php';
            } else {
                return a;
            }
        } else {
            console.error("Server communication failed: " + b.status + " (" + b.responseText + ")");
        }
    }
    return false;
}


var tagcomplete_focus = -1;
function tagcompleter(j) {
    var l = undefined;
    var g = undefined,
        f = undefined;
    var e = undefined;
    function d(m) {
        if (e === m) {
            return;
        }
        e = m;
        if (g != undefined) {
            if (f != undefined) {
                return;
            } else {
                clearTimeout(g);
                g = undefined;
            }
        }
        setTimeout(function () {
            f = new XMLHttpRequest();
            var n = { method: "tagsuggest", text: m };
            api_call(f, n, h);
        }, 200);
    }
    function h() {
        var m = api_response(f);
        if (m != false) {
            if (m.error != undefined) {
                console.error(m.error);
            } else {
                if (tagcomplete_focus < 0) {
                    a();
                    l = m.tags;
                }
            }
            f = undefined;
            k();
        }
    }
    function k() {
        a();
        var n = j.value.replace(/["\']/g, "");
        if (n.match(/^(x|mi).*:/)) {
            n = n.replace(/^(x|mi).*:/, "misc:");
        } else {
            n = n
                .replace(/^f.*:/, "female:")
                .replace(/^m.*:/, "male:")
                .replace(/^r.*:/, "reclass:")
                .replace(/^l.*:/, "language:")
                .replace(/^p.*:/, "parody:")
                .replace(/^c.*:/, "character:")
                .replace(/^g.*:/, "group:")
                .replace(/^a.*:/, "artist:");
        }
        if (n.replace(/^.*:/, "").length < 2) {
            return false;
        } else {
            d(n);
        }
        if (l == undefined) {
            return false;
        }
        tagcomplete_focus = -1;
        var t = document.createElement("DIV");
        t.setAttribute("id", j.id + "tagcomplete-list");
        t.setAttribute("class", "tagcomplete-items");
        j.parentNode.appendChild(t);
        var o = 0;
        var p = new RegExp("(^| |:)" + n, "ig");
        for (var tagid in l) {
            var q = l[tagid].ns + ':' + l[tagid].tn + '';
            var m = l[tagid].ns + ':"' + l[tagid].tn + '$"';
            if (q.match(p)) {
                var u = l[tagid].mid != undefined ? l[tagid].mns + ":" + l[tagid].mtn : undefined;
                var r = u == undefined ? q : q + " <strong>=&gt;</strong> " + u;
               // var m = u == undefined ? q : u;
                var s = document.createElement("DIV");
                s.innerHTML = r.replace(p, "<strong>$&</strong>");
                s.setAttribute("data-value", m);
                s.addEventListener("click", function (v) {
                    j.value = this.getAttribute("data-value");
                    a();
                    var elem=document.getElementById("f_search");
                    elem.focus();
                });
                t.appendChild(s);
                ++o;
            }
        }
        if (o > 0) {
            j.style.borderRadius = "3px 3px 0 0";
        }
    }
    j.addEventListener("input", function (m) {
        k();
    });
    j.addEventListener("keydown", function (n) {
        if (l == undefined) {
            return;
        }
        var m = document.getElementById(this.id + "tagcomplete-list");
        if (m) {
            m = m.getElementsByTagName("div");
        }
        if (n.keyCode == 40) {
            ++tagcomplete_focus;
            b(m);
        } else {
            if (n.keyCode == 38) {
                --tagcomplete_focus;
                b(m);
            } else {
                if (n.keyCode == 13) {
                   // n.preventDefault();
                    if (m && tagcomplete_focus > -1) {
                        m[tagcomplete_focus].click();
                    }
                }
            }
        }
    });
    function b(m) {
        if (!m) {
            return false;
        }
        c(m);
        if (tagcomplete_focus >= m.length) {
            tagcomplete_focus = 0;
        }
        if (tagcomplete_focus < 0) {
            tagcomplete_focus = m.length - 1;
        }
        m[tagcomplete_focus].classList.add("tagcomplete-active");
    }
    function c(m) {
        for (var n = 0; n < m.length; n++) {
            m[n].classList.remove("tagcomplete-active");
        }
    }
    function a(o) {
        j.style.borderRadius = "";
        var m = document.getElementsByClassName("tagcomplete-items");
        for (var n = 0; n < m.length; n++) {
            if (o != m[n] && o != j) {
                m[n].parentNode.removeChild(m[n]);
            }
        }
    }
    document.addEventListener("click", function (m) {
        a(m.target);
    });
}

var elem=document.getElementById("f_search");
elem.autocomplete = "off"
tagcompleter(elem)

})();
