var CETEI = function() {
    "use strict";
    var e = {
        namespaces: {
            tei: "http://www.tei-c.org/ns/1.0",
            teieg: "http://www.tei-c.org/ns/Examples",
            rng: "http://relaxng.org/ns/structure/1.0"
        },
        tei: {
            eg: ["<pre>", "</pre>"],
            ptr: ['<a href="$rw@target">$@target</a>'],
            ref: ['<a href="$rw@target">', "</a>"],
            graphic: function(e) {
                let t = new Image;
                return t.src = this.rw(e.getAttribute("url")), e.hasAttribute("width") && t.setAttribute("width", e.getAttribute("width")), e.hasAttribute("height") && t.setAttribute("height", e.getAttribute("height")), t
            },
            list: [
                ["[type=gloss]", function(e) {
                    let t = document.createElement("dl");
                    for (let a of Array.from(e.children))
                        if (a.nodeType == Node.ELEMENT_NODE) {
                            if ("tei-label" == a.localName) {
                                let e = document.createElement("dt");
                                e.innerHTML = a.innerHTML, t.appendChild(e)
                            }
                            if ("tei-item" == a.localName) {
                                let e = document.createElement("dd");
                                e.innerHTML = a.innerHTML, t.appendChild(e)
                            }
                        } return t
                }]
            ],
            note: [
                ["[place=end]", function(e) {
                    this.noteIndex ? this.noteIndex++ : this.noteIndex = 1;
                    let t = "_note_" + this.noteIndex,
                        a = document.createElement("a");
                    a.setAttribute("id", "src" + t), a.setAttribute("href", "#" + t), a.innerHTML = this.noteIndex;
                    let r = document.createElement("sup");
                    r.appendChild(a);
                    let i = this.dom.querySelector("ol.notes");
                    i || ((i = document.createElement("ol")).setAttribute("class", "notes"), this.dom.appendChild(i));
                    let s = document.createElement("li");
                    return s.id = t, s.innerHTML = e.innerHTML, i.appendChild(s), r
                }],
                ["_", ["(", ")"]]
            ],
            table: function(e) {
                let t = document.createElement("table");
                if (t.innerHTML = e.innerHTML, "tei-head" == t.firstElementChild.localName) {
                    let e = t.firstElementChild;
                    e.remove();
                    let a = document.createElement("caption");
                    a.innerHTML = e.innerHTML, t.appendChild(a)
                }
                for (let e of Array.from(t.querySelectorAll("tei-row"))) {
                    let t = document.createElement("tr");
                    t.innerHTML = e.innerHTML;
                    for (let a of Array.from(e.attributes)) t.setAttribute(a.name, a.value);
                    e.parentElement.replaceChild(t, e)
                }
                for (let e of Array.from(t.querySelectorAll("tei-cell"))) {
                    let t = document.createElement("td");
                    e.hasAttribute("cols") && t.setAttribute("colspan", e.getAttribute("cols")), t.innerHTML = e.innerHTML;
                    for (let a of Array.from(e.attributes)) t.setAttribute(a.name, a.value);
                    e.parentElement.replaceChild(t, e)
                }
                return t
            },
            teiHeader: function(e) {
                this.hideContent(e)
            },
            title: [
                ["tei-titlestmt>tei-title", function(e) {
                    let t = document.createElement("title");
                    t.innerHTML = e.innerText, document.querySelector("head").appendChild(t)
                }]
            ]
        },
        teieg: {
            egXML: function(e) {
                let t = document.createElement("pre");
                return t.innerHTML = this.serialize(e, !0), t
            }
        }
    };
    class t {
        constructor(t) {
            if (this.els = [], this.namespaces = new Map, this.behaviors = {}, this.hasStyle = !1, this.prefixDefs = [], t) this.base = t;
            else try {
                window && (this.base = window.location.href.replace(/\/[^\/]*$/, "/"))
            } catch (e) {
                this.base = ""
            }
            this.addBehaviors(e), this.shadowCSS, this.supportsShadowDom = document.head.createShadowRoot || document.head.attachShadow
        }
        getHTML5(e, t, a) {
            return window.location.href.startsWith(this.base) && e.indexOf("/") >= 0 && (this.base = e.replace(/\/[^\/]*$/, "/")), new Promise(function(t, a) {
                let r = new XMLHttpRequest;
                r.open("GET", e), r.send(), r.onload = function() {
                    this.status >= 200 && this.status < 300 ? t(this.response) : a(this.statusText)
                }, r.onerror = function() {
                    a(this.statusText)
                }
            }).catch(function(e) {
                console.log(e)
            }).then(e => this.makeHTML5(e, t, a))
        }
        makeHTML5(e, t, a) {
            let r = (new DOMParser).parseFromString(e, "text/xml");
            return this.domToHTML5(r, t, a)
        }
        domToHTML5(e, t, r) {
            this._learnElementNames(e);
            let i = e => {
                let t;
                if (this.namespaces.has(e.namespaceURI)) {
                    let a = this.namespaces.get(e.namespaceURI);
                    t = document.createElement(a + "-" + e.localName)
                } else t = document.importNode(e, !1);
                for (let a of Array.from(e.attributes)) "xmlns" == a.name ? t.setAttribute("data-xmlns", a.value) : t.setAttribute(a.name, a.value), "xml:id" == a.name && t.setAttribute("id", a.value), "xml:lang" == a.name && t.setAttribute("lang", a.value), "rendition" == a.name && t.setAttribute("class", a.value.replace(/#/g, ""));
                if (t.setAttribute("data-origname", e.localName), 0 == e.childNodes.length && t.setAttribute("data-empty", ""), "tagsDecl" == e.localName) {
                    let a = document.createElement("style");
                    for (let t of Array.from(e.childNodes))
                        if (t.nodeType == Node.ELEMENT_NODE && "rendition" == t.localName && "css" == t.getAttribute("scheme")) {
                            let e = "";
                            t.hasAttribute("selector") ? (e += t.getAttribute("selector").replace(/([^#, >]+\w*)/g, "tei-$1").replace(/#tei-/g, "#") + "{\n", e += t.textContent) : (e += "." + t.getAttribute("xml:id") + "{\n", e += t.textContent), e += "\n}\n", a.appendChild(document.createTextNode(e))
                        } a.childNodes.length > 0 && (t.appendChild(a), this.hasStyle = !0)
                }
                "prefixDef" == e.localName && (this.prefixDefs.push(e.getAttribute("ident")), this.prefixDefs[e.getAttribute("ident")] = {
                    matchPattern: e.getAttribute("matchPattern"),
                    replacementPattern: e.getAttribute("replacementPattern")
                });
                for (let a of Array.from(e.childNodes)) a.nodeType == Node.ELEMENT_NODE ? t.appendChild(i(a)) : t.appendChild(a.cloneNode());
                return r && r(t), t
            };
            if (this.dom = i(e.documentElement), this.applyBehaviors(), this.done = !0, !t) return window.dispatchEvent(a), this.dom;
            t(this.dom, this), window.dispatchEvent(a)
        }
        applyBehaviors() {
            window.customElements ? this.define(this.els) : this.fallback(this.els)
        }
        addStyle(e, t) {
            this.hasStyle && e.getElementsByTagName("head").item(0).appendChild(t.getElementsByTagName("style").item(0).cloneNode(!0))
        }
        addShadowStyle(e) {
            this.shadowCSS && (e.innerHTML = '<style>@import url("' + this.shadowCSS + '");</style>' + e.innerHTML)
        }
        addBehaviors(e) {
            if (e.namespaces)
                for (let t of Object.keys(e.namespaces)) this.namespaces.has(e.namespaces[t]) || Array.from(this.namespaces.values()).includes(t) || this.namespaces.set(e.namespaces[t], t);
            for (let t of this.namespaces.values())
                if (e[t])
                    for (let a of Object.keys(e[t])) this.behaviors[t + ":" + a] = e[t][a];
            if (e.handlers)
                for (let t of Object.keys(e.handlers)) "egXML" !== t ? this.behaviors["tei:" + t] = e.handlers[t] : this.behaviors["teieg:egXML"] = e.handlers[t];
            e.fallbacks && console.log("Fallback behaviors are no longer used.")
        }
        addBehavior(e, t, a) {
            let r;
            if (e === Object(e))
                for (let t of Object.keys(e)) this.namespaces.has(e[t]) || (this.namespaces.set(e[t], t), r = t);
            else r = e;
            this.behaviors[r + ":" + t] = a
        }
        setBaseUrl(e) {
            this.base = e
        }
        _learnElementNames(e) {
            let t = e.documentElement;
            this.els = new Set(Array.from(t.querySelectorAll("*"), e => (this.namespaces.has(e.namespaceURI) ? this.namespaces.get(e.namespaceURI) + ":" : "") + e.localName)), this.els.add((this.namespaces.has(t.namespaceURI) ? this.namespaces.get(t.namespaceURI) + ":" : "") + t.localName)
        }
        _insert(e, t) {
            let a = document.createElement("span");
            for (let t of Array.from(e.childNodes)) t.nodeType !== Node.ELEMENT_NODE || t.hasAttribute("data-processed") || this._processElement(t);
            return t.length > 1 ? a.innerHTML = t[0] + e.innerHTML + t[1] : a.innerHTML = t[0] + e.innerHTML, a
        }
        _processElement(e) {
            if (e.hasAttribute("data-origname") && !e.hasAttribute("data-processed")) {
                let t = this.getFallback(this._bName(e));
                t && (this.append(t, e), e.setAttribute("data-processed", ""))
            }
            for (let t of Array.from(e.childNodes)) t.nodeType === Node.ELEMENT_NODE && this._processElement(t)
        }
        _template(e, t) {
            let a = e;
            if (e.search(/\$(\w*)(@([a-zA-Z:]+))/)) {
                let r, i = /\$(\w*)@([a-zA-Z:]+)/g;
                for (; r = i.exec(e);) t.hasAttribute(r[2]) && (a = r[1] && this[r[1]] ? a.replace(r[0], this[r[1]].call(this, t.getAttribute(r[2]))) : a.replace(r[0], t.getAttribute(r[2])))
            }
            return a
        }
        _tagName(e) {
            return e.includes(":"), e.replace(/:/, "-").toLowerCase()
        }
        _bName(e) {
            return e.tagName.substring(0, e.tagName.indexOf("-")).toLowerCase() + ":" + e.getAttribute("data-origname")
        }
        decorator(e) {
            if (Array.isArray(e) && !Array.isArray(e[0])) return this._decorator(e);
            let t = this;
            return function(a) {
                for (let r of e)
                    if (a.matches(r[0]) || "_" === r[0]) return Array.isArray(r[1]) ? t._decorator(r[1]).call(t, a) : r[1].call(t, a)
            }
        }
        _decorator(e) {
            let t = this;
            return function(a) {
                let r = [];
                for (let i = 0; i < e.length; i++) r.push(t._template(e[i], a));
                return t._insert(a, r)
            }
        }
        getHandler(e) {
            if (this.behaviors[e]) return "[object Function]" === {}.toString.call(this.behaviors[e]) ? this.append(this.behaviors[e]) : this.append(this.decorator(this.behaviors[e]))
        }
        getFallback(e) {
            if (this.behaviors[e]) return "[object Function]" === {}.toString.call(this.behaviors[e]) ? this.behaviors[e] : this.decorator(this.behaviors[e])
        }
        append(e, t) {
            if (!t) {
                let t = this;
                return function() {
                    let a = e.call(t, this);
                    a && !t._childExists(this.firstElementChild, a.nodeName) && t._appendBasic(this, a)
                }
            } {
                let a = e.call(this, t);
                a && !this._childExists(t.firstElementChild, a.nodeName) && this._appendBasic(t, a)
            }
        }
        attach(e, t, a) {
            if (e[t].call(e, a), a.nodeType === Node.ELEMENT_NODE)
                for (let e of Array.from(a.childNodes)) this._processElement(e)
        }
        _childExists(e, t) {
            return !(!e || e.nodeName != t) || e && e.nextElementSibling && this._childExists(e.nextElementSibling, t)
        }
        _appendShadow(e, t) {
            var a = e.attachShadow({
                mode: "open"
            });
            this.addShadowStyle(a), a.appendChild(t)
        }
        _appendBasic(e, t) {
            this.hideContent(e), e.appendChild(t)
        }
        registerAll(e) {
            this.define(e)
        }
        define(e) {
            for (let t of e) try {
                let e = this.getHandler(t);
                window.customElements.define(this._tagName(t), class extends HTMLElement {
                    constructor() {
                        super(), this.matches(":defined") || (e && e.call(this), this.setAttribute("data-processed", ""))
                    }
                    connectedCallback() {
                        this.hasAttribute("data-processed") || (e && e.call(this), this.setAttribute("data-processed", ""))
                    }
                })
            } catch (e) {
                console.log(this._tagName(t) + " couldn't be registered or is already registered."), console.log(e)
            }
        }
        fallback(e) {
            for (let t of e) {
                let e = this.getFallback(t);
                if (e)
                    for (let a of Array.from((this.dom && !this.done ? this.dom : document).getElementsByTagName(this._tagName(t)))) a.hasAttribute("data-processed") || this.append(e, a)
            }
        }
        rw(e) {
            return e.match(/^(?:http|mailto|file|\/|#).*$/) ? e : this.base + e
        }
        first(e) {
            return e.replace(/ .*$/, "")
        }
        normalizeURI(e) {
            return this.rw(this.first(e))
        }
        repeat(e, t) {
            let a = "";
            for (let r = 0; r < t; r++) a += e;
            return a
        }
        copyAndReset(e) {
            let t = e => {
                let a = e.nodeType === Node.ELEMENT_NODE ? document.createElement(e.nodeName) : e.cloneNode(!0);
                if (e.attributes)
                    for (let t of Array.from(e.attributes)) "data-processed" !== t.name && a.setAttribute(t.name, t.value);
                for (let r of Array.from(e.childNodes))
                    if (r.nodeType == Node.ELEMENT_NODE) {
                        if (!e.hasAttribute("data-empty")) {
                            if (r.hasAttribute("data-original")) {
                                for (let e of Array.from(r.childNodes)) a.appendChild(t(e));
                                return a
                            }
                            a.appendChild(t(r))
                        }
                    } else a.appendChild(r.cloneNode());
                return a
            };
            return t(e)
        }
        serialize(e, t) {
            let a = "";
            if (!t) {
                a += "&lt;" + e.getAttribute("data-origname");
                for (let t of Array.from(e.attributes)) t.name.startsWith("data-") || ["id", "lang", "class"].includes(t.name) || (a += " " + t.name + '="' + t.value + '"'), "data-xmlns" == t.name && (a += ' xmlns="' + t.value + '"');
                e.childNodes.length > 0 ? a += ">" : a += "/>"
            }
            for (let t of Array.from(e.childNodes)) switch (t.nodeType) {
                case Node.ELEMENT_NODE:
                    a += this.serialize(t);
                    break;
                case Node.PROCESSING_INSTRUCTION_NODE:
                    a += "&lt;?" + t.nodeValue + "?>";
                    break;
                case Node.COMMENT_NODE:
                    a += "&lt;!--" + t.nodeValue + "--\x3e";
                    break;
                default:
                    a += t.nodeValue.replace(/</g, "&lt;")
            }
            return !t && e.childNodes.length > 0 && (a += "&lt;/" + e.getAttribute("data-origname") + ">"), a
        }
        hideContent(e) {
            if (e.childNodes.length > 0) {
                let t = document.createElement("span");
                e.appendChild(t), t.setAttribute("hidden", ""), t.setAttribute("data-original", "");
                for (let a of Array.from(e.childNodes)) a !== t && t.appendChild(e.removeChild(a))
            }
        }
        unEscapeEntities(e) {
            return e.replace(/&gt;/, ">").replace(/&quot;/, '"').replace(/&apos;/, "'").replace(/&amp;/, "&")
        }
        static savePosition() {
            window.localStorage.setItem("scroll", window.scrollY)
        }
        static restorePosition() {
            window.location.hash ? setTimeout(function() {
                document.querySelector(window.location.hash).scrollIntoView()
            }, 100) : window.localStorage.getItem("scroll") && setTimeout(function() {
                window.scrollTo(0, localStorage.getItem("scroll"))
            }, 100)
        }
        fromODD() {}
    }
    try {
        if (window) {
            window.CETEI = t, window.addEventListener("beforeunload", t.savePosition);
            var a = new Event("ceteiceanload");
            window.addEventListener("ceteiceanload", t.restorePosition)
        }
    } catch (e) {}
    return t
}();
