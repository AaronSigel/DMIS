import {
  f as $t,
  p as Pu,
  a as Mu,
  n as xu,
  h as mt,
  s as ze,
  o as Qt,
  b as ms,
  c as _s,
  d as he,
  v as bs,
  e as da,
  g as ku,
} from "./react-vendor-BYKCA02s.js";
/*! @license DOMPurify 3.4.2 | (c) Cure53 and other contributors | Released under the Apache license 2.0 and Mozilla Public License 2.0 | github.com/cure53/DOMPurify/blob/3.4.2/LICENSE */ const {
  entries: la,
  setPrototypeOf: Bu,
  isFrozen: As,
  getPrototypeOf: ps,
  getOwnPropertyDescriptor: Ns,
} = Object;
let { freeze: W, seal: j, create: Ie } = Object,
  { apply: Xt, construct: qt } = typeof Reflect < "u" && Reflect;
W ||
  (W = function (t) {
    return t;
  });
j ||
  (j = function (t) {
    return t;
  });
Xt ||
  (Xt = function (t, u) {
    for (var s = arguments.length, c = new Array(s > 2 ? s - 2 : 0), d = 2; d < s; d++)
      c[d - 2] = arguments[d];
    return t.apply(u, c);
  });
qt ||
  (qt = function (t) {
    for (var u = arguments.length, s = new Array(u > 1 ? u - 1 : 0), c = 1; c < u; c++)
      s[c - 1] = arguments[c];
    return new t(...s);
  });
const ye = P(Array.prototype.forEach),
  Is = P(Array.prototype.lastIndexOf),
  yu = P(Array.prototype.pop),
  Fe = P(Array.prototype.push),
  Cs = P(Array.prototype.splice),
  G = Array.isArray,
  Ye = P(String.prototype.toLowerCase),
  Ut = P(String.prototype.toString),
  Fu = P(String.prototype.match),
  Ne = P(String.prototype.replace),
  Uu = P(String.prototype.indexOf),
  gs = P(String.prototype.trim),
  Ss = P(Number.prototype.toString),
  Os = P(Boolean.prototype.toString),
  Hu = typeof BigInt > "u" ? null : P(BigInt.prototype.toString),
  wu = typeof Symbol > "u" ? null : P(Symbol.prototype.toString),
  O = P(Object.prototype.hasOwnProperty),
  Ue = P(Object.prototype.toString),
  U = P(RegExp.prototype.test),
  ct = Ls(TypeError);
function P(e) {
  return function (t) {
    t instanceof RegExp && (t.lastIndex = 0);
    for (var u = arguments.length, s = new Array(u > 1 ? u - 1 : 0), c = 1; c < u; c++)
      s[c - 1] = arguments[c];
    return Xt(e, t, s);
  };
}
function Ls(e) {
  return function () {
    for (var t = arguments.length, u = new Array(t), s = 0; s < t; s++) u[s] = arguments[s];
    return qt(e, u);
  };
}
function N(e, t) {
  let u = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : Ye;
  if ((Bu && Bu(e, null), !G(t))) return e;
  let s = t.length;
  for (; s--; ) {
    let c = t[s];
    if (typeof c == "string") {
      const d = u(c);
      d !== c && (As(t) || (t[s] = d), (c = d));
    }
    e[c] = !0;
  }
  return e;
}
function Rs(e) {
  for (let t = 0; t < e.length; t++) O(e, t) || (e[t] = null);
  return e;
}
function K(e) {
  const t = Ie(null);
  for (const [u, s] of la(e))
    O(e, u) &&
      (G(s)
        ? (t[u] = Rs(s))
        : s && typeof s == "object" && s.constructor === Object
          ? (t[u] = K(s))
          : (t[u] = s));
  return t;
}
function Ds(e) {
  switch (typeof e) {
    case "string":
      return e;
    case "number":
      return Ss(e);
    case "boolean":
      return Os(e);
    case "bigint":
      return Hu ? Hu(e) : "0";
    case "symbol":
      return wu ? wu(e) : "Symbol()";
    case "undefined":
      return Ue(e);
    case "function":
    case "object": {
      if (e === null) return Ue(e);
      const t = e,
        u = Ce(t, "toString");
      if (typeof u == "function") {
        const s = u(t);
        return typeof s == "string" ? s : Ue(s);
      }
      return Ue(e);
    }
    default:
      return Ue(e);
  }
}
function Ce(e, t) {
  for (; e !== null; ) {
    const s = Ns(e, t);
    if (s) {
      if (s.get) return P(s.get);
      if (typeof s.value == "function") return P(s.value);
    }
    e = ps(e);
  }
  function u() {
    return null;
  }
  return u;
}
function Ps(e) {
  try {
    return (U(e, ""), !0);
  } catch {
    return !1;
  }
}
const vu = W([
    "a",
    "abbr",
    "acronym",
    "address",
    "area",
    "article",
    "aside",
    "audio",
    "b",
    "bdi",
    "bdo",
    "big",
    "blink",
    "blockquote",
    "body",
    "br",
    "button",
    "canvas",
    "caption",
    "center",
    "cite",
    "code",
    "col",
    "colgroup",
    "content",
    "data",
    "datalist",
    "dd",
    "decorator",
    "del",
    "details",
    "dfn",
    "dialog",
    "dir",
    "div",
    "dl",
    "dt",
    "element",
    "em",
    "fieldset",
    "figcaption",
    "figure",
    "font",
    "footer",
    "form",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "head",
    "header",
    "hgroup",
    "hr",
    "html",
    "i",
    "img",
    "input",
    "ins",
    "kbd",
    "label",
    "legend",
    "li",
    "main",
    "map",
    "mark",
    "marquee",
    "menu",
    "menuitem",
    "meter",
    "nav",
    "nobr",
    "ol",
    "optgroup",
    "option",
    "output",
    "p",
    "picture",
    "pre",
    "progress",
    "q",
    "rp",
    "rt",
    "ruby",
    "s",
    "samp",
    "search",
    "section",
    "select",
    "shadow",
    "slot",
    "small",
    "source",
    "spacer",
    "span",
    "strike",
    "strong",
    "style",
    "sub",
    "summary",
    "sup",
    "table",
    "tbody",
    "td",
    "template",
    "textarea",
    "tfoot",
    "th",
    "thead",
    "time",
    "tr",
    "track",
    "tt",
    "u",
    "ul",
    "var",
    "video",
    "wbr",
  ]),
  Ht = W([
    "svg",
    "a",
    "altglyph",
    "altglyphdef",
    "altglyphitem",
    "animatecolor",
    "animatemotion",
    "animatetransform",
    "circle",
    "clippath",
    "defs",
    "desc",
    "ellipse",
    "enterkeyhint",
    "exportparts",
    "filter",
    "font",
    "g",
    "glyph",
    "glyphref",
    "hkern",
    "image",
    "inputmode",
    "line",
    "lineargradient",
    "marker",
    "mask",
    "metadata",
    "mpath",
    "part",
    "path",
    "pattern",
    "polygon",
    "polyline",
    "radialgradient",
    "rect",
    "stop",
    "style",
    "switch",
    "symbol",
    "text",
    "textpath",
    "title",
    "tref",
    "tspan",
    "view",
    "vkern",
  ]),
  wt = W([
    "feBlend",
    "feColorMatrix",
    "feComponentTransfer",
    "feComposite",
    "feConvolveMatrix",
    "feDiffuseLighting",
    "feDisplacementMap",
    "feDistantLight",
    "feDropShadow",
    "feFlood",
    "feFuncA",
    "feFuncB",
    "feFuncG",
    "feFuncR",
    "feGaussianBlur",
    "feImage",
    "feMerge",
    "feMergeNode",
    "feMorphology",
    "feOffset",
    "fePointLight",
    "feSpecularLighting",
    "feSpotLight",
    "feTile",
    "feTurbulence",
  ]),
  Ms = W([
    "animate",
    "color-profile",
    "cursor",
    "discard",
    "font-face",
    "font-face-format",
    "font-face-name",
    "font-face-src",
    "font-face-uri",
    "foreignobject",
    "hatch",
    "hatchpath",
    "mesh",
    "meshgradient",
    "meshpatch",
    "meshrow",
    "missing-glyph",
    "script",
    "set",
    "solidcolor",
    "unknown",
    "use",
  ]),
  vt = W([
    "math",
    "menclose",
    "merror",
    "mfenced",
    "mfrac",
    "mglyph",
    "mi",
    "mlabeledtr",
    "mmultiscripts",
    "mn",
    "mo",
    "mover",
    "mpadded",
    "mphantom",
    "mroot",
    "mrow",
    "ms",
    "mspace",
    "msqrt",
    "mstyle",
    "msub",
    "msup",
    "msubsup",
    "mtable",
    "mtd",
    "mtext",
    "mtr",
    "munder",
    "munderover",
    "mprescripts",
  ]),
  xs = W([
    "maction",
    "maligngroup",
    "malignmark",
    "mlongdiv",
    "mscarries",
    "mscarry",
    "msgroup",
    "mstack",
    "msline",
    "msrow",
    "semantics",
    "annotation",
    "annotation-xml",
    "mprescripts",
    "none",
  ]),
  Yu = W(["#text"]),
  Gu = W([
    "accept",
    "action",
    "align",
    "alt",
    "autocapitalize",
    "autocomplete",
    "autopictureinpicture",
    "autoplay",
    "background",
    "bgcolor",
    "border",
    "capture",
    "cellpadding",
    "cellspacing",
    "checked",
    "cite",
    "class",
    "clear",
    "color",
    "cols",
    "colspan",
    "controls",
    "controlslist",
    "coords",
    "crossorigin",
    "datetime",
    "decoding",
    "default",
    "dir",
    "disabled",
    "disablepictureinpicture",
    "disableremoteplayback",
    "download",
    "draggable",
    "enctype",
    "enterkeyhint",
    "exportparts",
    "face",
    "for",
    "headers",
    "height",
    "hidden",
    "high",
    "href",
    "hreflang",
    "id",
    "inert",
    "inputmode",
    "integrity",
    "ismap",
    "kind",
    "label",
    "lang",
    "list",
    "loading",
    "loop",
    "low",
    "max",
    "maxlength",
    "media",
    "method",
    "min",
    "minlength",
    "multiple",
    "muted",
    "name",
    "nonce",
    "noshade",
    "novalidate",
    "nowrap",
    "open",
    "optimum",
    "part",
    "pattern",
    "placeholder",
    "playsinline",
    "popover",
    "popovertarget",
    "popovertargetaction",
    "poster",
    "preload",
    "pubdate",
    "radiogroup",
    "readonly",
    "rel",
    "required",
    "rev",
    "reversed",
    "role",
    "rows",
    "rowspan",
    "spellcheck",
    "scope",
    "selected",
    "shape",
    "size",
    "sizes",
    "slot",
    "span",
    "srclang",
    "start",
    "src",
    "srcset",
    "step",
    "style",
    "summary",
    "tabindex",
    "title",
    "translate",
    "type",
    "usemap",
    "valign",
    "value",
    "width",
    "wrap",
    "xmlns",
  ]),
  Yt = W([
    "accent-height",
    "accumulate",
    "additive",
    "alignment-baseline",
    "amplitude",
    "ascent",
    "attributename",
    "attributetype",
    "azimuth",
    "basefrequency",
    "baseline-shift",
    "begin",
    "bias",
    "by",
    "class",
    "clip",
    "clippathunits",
    "clip-path",
    "clip-rule",
    "color",
    "color-interpolation",
    "color-interpolation-filters",
    "color-profile",
    "color-rendering",
    "cx",
    "cy",
    "d",
    "dx",
    "dy",
    "diffuseconstant",
    "direction",
    "display",
    "divisor",
    "dur",
    "edgemode",
    "elevation",
    "end",
    "exponent",
    "fill",
    "fill-opacity",
    "fill-rule",
    "filter",
    "filterunits",
    "flood-color",
    "flood-opacity",
    "font-family",
    "font-size",
    "font-size-adjust",
    "font-stretch",
    "font-style",
    "font-variant",
    "font-weight",
    "fx",
    "fy",
    "g1",
    "g2",
    "glyph-name",
    "glyphref",
    "gradientunits",
    "gradienttransform",
    "height",
    "href",
    "id",
    "image-rendering",
    "in",
    "in2",
    "intercept",
    "k",
    "k1",
    "k2",
    "k3",
    "k4",
    "kerning",
    "keypoints",
    "keysplines",
    "keytimes",
    "lang",
    "lengthadjust",
    "letter-spacing",
    "kernelmatrix",
    "kernelunitlength",
    "lighting-color",
    "local",
    "marker-end",
    "marker-mid",
    "marker-start",
    "markerheight",
    "markerunits",
    "markerwidth",
    "maskcontentunits",
    "maskunits",
    "max",
    "mask",
    "mask-type",
    "media",
    "method",
    "mode",
    "min",
    "name",
    "numoctaves",
    "offset",
    "operator",
    "opacity",
    "order",
    "orient",
    "orientation",
    "origin",
    "overflow",
    "paint-order",
    "path",
    "pathlength",
    "patterncontentunits",
    "patterntransform",
    "patternunits",
    "points",
    "preservealpha",
    "preserveaspectratio",
    "primitiveunits",
    "r",
    "rx",
    "ry",
    "radius",
    "refx",
    "refy",
    "repeatcount",
    "repeatdur",
    "restart",
    "result",
    "rotate",
    "scale",
    "seed",
    "shape-rendering",
    "slope",
    "specularconstant",
    "specularexponent",
    "spreadmethod",
    "startoffset",
    "stddeviation",
    "stitchtiles",
    "stop-color",
    "stop-opacity",
    "stroke-dasharray",
    "stroke-dashoffset",
    "stroke-linecap",
    "stroke-linejoin",
    "stroke-miterlimit",
    "stroke-opacity",
    "stroke",
    "stroke-width",
    "style",
    "surfacescale",
    "systemlanguage",
    "tabindex",
    "tablevalues",
    "targetx",
    "targety",
    "transform",
    "transform-origin",
    "text-anchor",
    "text-decoration",
    "text-rendering",
    "textlength",
    "type",
    "u1",
    "u2",
    "unicode",
    "values",
    "viewbox",
    "visibility",
    "version",
    "vert-adv-y",
    "vert-origin-x",
    "vert-origin-y",
    "width",
    "word-spacing",
    "wrap",
    "writing-mode",
    "xchannelselector",
    "ychannelselector",
    "x",
    "x1",
    "x2",
    "xmlns",
    "y",
    "y1",
    "y2",
    "z",
    "zoomandpan",
  ]),
  Wu = W([
    "accent",
    "accentunder",
    "align",
    "bevelled",
    "close",
    "columnalign",
    "columnlines",
    "columnspacing",
    "columnspan",
    "denomalign",
    "depth",
    "dir",
    "display",
    "displaystyle",
    "encoding",
    "fence",
    "frame",
    "height",
    "href",
    "id",
    "largeop",
    "length",
    "linethickness",
    "lquote",
    "lspace",
    "mathbackground",
    "mathcolor",
    "mathsize",
    "mathvariant",
    "maxsize",
    "minsize",
    "movablelimits",
    "notation",
    "numalign",
    "open",
    "rowalign",
    "rowlines",
    "rowspacing",
    "rowspan",
    "rspace",
    "rquote",
    "scriptlevel",
    "scriptminsize",
    "scriptsizemultiplier",
    "selection",
    "separator",
    "separators",
    "stretchy",
    "subscriptshift",
    "supscriptshift",
    "symmetric",
    "voffset",
    "width",
    "xmlns",
  ]),
  ot = W(["xlink:href", "xml:id", "xlink:title", "xml:space", "xmlns:xlink"]),
  ks = j(/\{\{[\w\W]*|[\w\W]*\}\}/gm),
  Bs = j(/<%[\w\W]*|[\w\W]*%>/gm),
  ys = j(/\$\{[\w\W]*/gm),
  Fs = j(/^data-[\-\w.\u00B7-\uFFFF]+$/),
  Us = j(/^aria-[\-\w]+$/),
  Ea = j(
    /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|matrix):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  ),
  Hs = j(/^(?:\w+script|data):/i),
  ws = j(/[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g),
  fa = j(/^html$/i),
  vs = j(/^[a-z][.\w]*(-[.\w]+)+$/i);
var Qu = Object.freeze({
  __proto__: null,
  ARIA_ATTR: Us,
  ATTR_WHITESPACE: ws,
  CUSTOM_ELEMENT: vs,
  DATA_ATTR: Fs,
  DOCTYPE_NAME: fa,
  ERB_EXPR: Bs,
  IS_ALLOWED_URI: Ea,
  IS_SCRIPT_OR_DATA: Hs,
  MUSTACHE_EXPR: ks,
  TMPLIT_EXPR: ys,
});
const He = { element: 1, text: 3, progressingInstruction: 7, comment: 8, document: 9 },
  Ys = function () {
    return typeof window > "u" ? null : window;
  },
  Gs = function (t, u) {
    if (typeof t != "object" || typeof t.createPolicy != "function") return null;
    let s = null;
    const c = "data-tt-policy-suffix";
    u && u.hasAttribute(c) && (s = u.getAttribute(c));
    const d = "dompurify" + (s ? "#" + s : "");
    try {
      return t.createPolicy(d, {
        createHTML(f) {
          return f;
        },
        createScriptURL(f) {
          return f;
        },
      });
    } catch {
      return null;
    }
  },
  Xu = function () {
    return {
      afterSanitizeAttributes: [],
      afterSanitizeElements: [],
      afterSanitizeShadowDOM: [],
      beforeSanitizeAttributes: [],
      beforeSanitizeElements: [],
      beforeSanitizeShadowDOM: [],
      uponSanitizeAttribute: [],
      uponSanitizeElement: [],
      uponSanitizeShadowNode: [],
    };
  };
function Ta() {
  let e = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : Ys();
  const t = (p) => Ta(p);
  if (
    ((t.version = "3.4.2"),
    (t.removed = []),
    !e || !e.document || e.document.nodeType !== He.document || !e.Element)
  )
    return ((t.isSupported = !1), t);
  let { document: u } = e;
  const s = u,
    c = s.currentScript,
    {
      DocumentFragment: d,
      HTMLTemplateElement: f,
      Node: b,
      Element: _,
      NodeFilter: C,
      NamedNodeMap: Q = e.NamedNodeMap || e.MozNamedAttrMap,
      HTMLFormElement: re,
      DOMParser: Nt,
      trustedTypes: $e,
    } = e,
    De = _.prototype,
    Ja = Ce(De, "cloneNode"),
    $a = Ce(De, "remove"),
    Za = Ce(De, "nextSibling"),
    es = Ce(De, "childNodes"),
    Ze = Ce(De, "parentNode");
  if (typeof f == "function") {
    const p = u.createElement("template");
    p.content && p.content.ownerDocument && (u = p.content.ownerDocument);
  }
  let v,
    Pe = "";
  const {
      implementation: It,
      createNodeIterator: ts,
      createDocumentFragment: us,
      getElementsByTagName: as,
    } = u,
    { importNode: ss } = s;
  let Y = Xu();
  t.isSupported =
    typeof la == "function" && typeof Ze == "function" && It && It.createHTMLDocument !== void 0;
  const {
    MUSTACHE_EXPR: et,
    ERB_EXPR: tt,
    TMPLIT_EXPR: ut,
    DATA_ATTR: rs,
    ARIA_ATTR: ns,
    IS_SCRIPT_OR_DATA: is,
    ATTR_WHITESPACE: ru,
    CUSTOM_ELEMENT: cs,
  } = Qu;
  let { IS_ALLOWED_URI: nu } = Qu,
    x = null;
  const iu = N({}, [...vu, ...Ht, ...wt, ...vt, ...Yu]);
  let F = null;
  const cu = N({}, [...Gu, ...Yt, ...Wu, ...ot]);
  let L = Object.seal(
      Ie(null, {
        tagNameCheck: { writable: !0, configurable: !1, enumerable: !0, value: null },
        attributeNameCheck: { writable: !0, configurable: !1, enumerable: !0, value: null },
        allowCustomizedBuiltInElements: {
          writable: !0,
          configurable: !1,
          enumerable: !0,
          value: !1,
        },
      }),
    ),
    Me = null,
    at = null;
  const ne = Object.seal(
    Ie(null, {
      tagCheck: { writable: !0, configurable: !1, enumerable: !0, value: null },
      attributeCheck: { writable: !0, configurable: !1, enumerable: !0, value: null },
    }),
  );
  let ou = !0,
    Ct = !0,
    du = !1,
    lu = !0,
    de = !1,
    xe = !0,
    le = !1,
    gt = !1,
    St = !1,
    _e = !1,
    st = !1,
    rt = !1,
    Eu = !0,
    fu = !1;
  const Tu = "user-content-";
  let Ot = !0,
    ke = !1,
    be = {},
    ee = null;
  const Lt = N({}, [
    "annotation-xml",
    "audio",
    "colgroup",
    "desc",
    "foreignobject",
    "head",
    "iframe",
    "math",
    "mi",
    "mn",
    "mo",
    "ms",
    "mtext",
    "noembed",
    "noframes",
    "noscript",
    "plaintext",
    "script",
    "style",
    "svg",
    "template",
    "thead",
    "title",
    "video",
    "xmp",
  ]);
  let hu = null;
  const mu = N({}, ["audio", "video", "img", "source", "image", "track"]);
  let Rt = null;
  const _u = N({}, [
      "alt",
      "class",
      "for",
      "id",
      "label",
      "name",
      "pattern",
      "placeholder",
      "role",
      "summary",
      "title",
      "value",
      "style",
      "xmlns",
    ]),
    nt = "http://www.w3.org/1998/Math/MathML",
    it = "http://www.w3.org/2000/svg",
    te = "http://www.w3.org/1999/xhtml";
  let Ae = te,
    Dt = !1,
    Pt = null;
  const os = N({}, [nt, it, te], Ut);
  let Mt = N({}, ["mi", "mo", "mn", "ms", "mtext"]),
    xt = N({}, ["annotation-xml"]);
  const ds = N({}, ["title", "style", "font", "a", "script"]);
  let Be = null;
  const ls = ["application/xhtml+xml", "text/html"],
    Es = "text/html";
  let M = null,
    pe = null;
  const fs = u.createElement("form"),
    bu = function (o) {
      return o instanceof RegExp || o instanceof Function;
    },
    kt = function () {
      let o = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      if (pe && pe === o) return;
      ((!o || typeof o != "object") && (o = {}),
        (o = K(o)),
        (Be = ls.indexOf(o.PARSER_MEDIA_TYPE) === -1 ? Es : o.PARSER_MEDIA_TYPE),
        (M = Be === "application/xhtml+xml" ? Ut : Ye),
        (x = O(o, "ALLOWED_TAGS") && G(o.ALLOWED_TAGS) ? N({}, o.ALLOWED_TAGS, M) : iu),
        (F = O(o, "ALLOWED_ATTR") && G(o.ALLOWED_ATTR) ? N({}, o.ALLOWED_ATTR, M) : cu),
        (Pt =
          O(o, "ALLOWED_NAMESPACES") && G(o.ALLOWED_NAMESPACES)
            ? N({}, o.ALLOWED_NAMESPACES, Ut)
            : os),
        (Rt =
          O(o, "ADD_URI_SAFE_ATTR") && G(o.ADD_URI_SAFE_ATTR)
            ? N(K(_u), o.ADD_URI_SAFE_ATTR, M)
            : _u),
        (hu =
          O(o, "ADD_DATA_URI_TAGS") && G(o.ADD_DATA_URI_TAGS)
            ? N(K(mu), o.ADD_DATA_URI_TAGS, M)
            : mu),
        (ee = O(o, "FORBID_CONTENTS") && G(o.FORBID_CONTENTS) ? N({}, o.FORBID_CONTENTS, M) : Lt),
        (Me = O(o, "FORBID_TAGS") && G(o.FORBID_TAGS) ? N({}, o.FORBID_TAGS, M) : K({})),
        (at = O(o, "FORBID_ATTR") && G(o.FORBID_ATTR) ? N({}, o.FORBID_ATTR, M) : K({})),
        (be = O(o, "USE_PROFILES")
          ? o.USE_PROFILES && typeof o.USE_PROFILES == "object"
            ? K(o.USE_PROFILES)
            : o.USE_PROFILES
          : !1),
        (ou = o.ALLOW_ARIA_ATTR !== !1),
        (Ct = o.ALLOW_DATA_ATTR !== !1),
        (du = o.ALLOW_UNKNOWN_PROTOCOLS || !1),
        (lu = o.ALLOW_SELF_CLOSE_IN_ATTR !== !1),
        (de = o.SAFE_FOR_TEMPLATES || !1),
        (xe = o.SAFE_FOR_XML !== !1),
        (le = o.WHOLE_DOCUMENT || !1),
        (_e = o.RETURN_DOM || !1),
        (st = o.RETURN_DOM_FRAGMENT || !1),
        (rt = o.RETURN_TRUSTED_TYPE || !1),
        (St = o.FORCE_BODY || !1),
        (Eu = o.SANITIZE_DOM !== !1),
        (fu = o.SANITIZE_NAMED_PROPS || !1),
        (Ot = o.KEEP_CONTENT !== !1),
        (ke = o.IN_PLACE || !1),
        (nu = Ps(o.ALLOWED_URI_REGEXP) ? o.ALLOWED_URI_REGEXP : Ea),
        (Ae = typeof o.NAMESPACE == "string" ? o.NAMESPACE : te),
        (Mt =
          O(o, "MATHML_TEXT_INTEGRATION_POINTS") &&
          o.MATHML_TEXT_INTEGRATION_POINTS &&
          typeof o.MATHML_TEXT_INTEGRATION_POINTS == "object"
            ? K(o.MATHML_TEXT_INTEGRATION_POINTS)
            : N({}, ["mi", "mo", "mn", "ms", "mtext"])),
        (xt =
          O(o, "HTML_INTEGRATION_POINTS") &&
          o.HTML_INTEGRATION_POINTS &&
          typeof o.HTML_INTEGRATION_POINTS == "object"
            ? K(o.HTML_INTEGRATION_POINTS)
            : N({}, ["annotation-xml"])));
      const T =
        O(o, "CUSTOM_ELEMENT_HANDLING") &&
        o.CUSTOM_ELEMENT_HANDLING &&
        typeof o.CUSTOM_ELEMENT_HANDLING == "object"
          ? K(o.CUSTOM_ELEMENT_HANDLING)
          : Ie(null);
      if (
        ((L = Ie(null)),
        O(T, "tagNameCheck") && bu(T.tagNameCheck) && (L.tagNameCheck = T.tagNameCheck),
        O(T, "attributeNameCheck") &&
          bu(T.attributeNameCheck) &&
          (L.attributeNameCheck = T.attributeNameCheck),
        O(T, "allowCustomizedBuiltInElements") &&
          typeof T.allowCustomizedBuiltInElements == "boolean" &&
          (L.allowCustomizedBuiltInElements = T.allowCustomizedBuiltInElements),
        de && (Ct = !1),
        st && (_e = !0),
        be &&
          ((x = N({}, Yu)),
          (F = Ie(null)),
          be.html === !0 && (N(x, vu), N(F, Gu)),
          be.svg === !0 && (N(x, Ht), N(F, Yt), N(F, ot)),
          be.svgFilters === !0 && (N(x, wt), N(F, Yt), N(F, ot)),
          be.mathMl === !0 && (N(x, vt), N(F, Wu), N(F, ot))),
        (ne.tagCheck = null),
        (ne.attributeCheck = null),
        O(o, "ADD_TAGS") &&
          (typeof o.ADD_TAGS == "function"
            ? (ne.tagCheck = o.ADD_TAGS)
            : G(o.ADD_TAGS) && (x === iu && (x = K(x)), N(x, o.ADD_TAGS, M))),
        O(o, "ADD_ATTR") &&
          (typeof o.ADD_ATTR == "function"
            ? (ne.attributeCheck = o.ADD_ATTR)
            : G(o.ADD_ATTR) && (F === cu && (F = K(F)), N(F, o.ADD_ATTR, M))),
        O(o, "ADD_URI_SAFE_ATTR") && G(o.ADD_URI_SAFE_ATTR) && N(Rt, o.ADD_URI_SAFE_ATTR, M),
        O(o, "FORBID_CONTENTS") &&
          G(o.FORBID_CONTENTS) &&
          (ee === Lt && (ee = K(ee)), N(ee, o.FORBID_CONTENTS, M)),
        O(o, "ADD_FORBID_CONTENTS") &&
          G(o.ADD_FORBID_CONTENTS) &&
          (ee === Lt && (ee = K(ee)), N(ee, o.ADD_FORBID_CONTENTS, M)),
        Ot && (x["#text"] = !0),
        le && N(x, ["html", "head", "body"]),
        x.table && (N(x, ["tbody"]), delete Me.tbody),
        o.TRUSTED_TYPES_POLICY)
      ) {
        if (typeof o.TRUSTED_TYPES_POLICY.createHTML != "function")
          throw ct('TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.');
        if (typeof o.TRUSTED_TYPES_POLICY.createScriptURL != "function")
          throw ct(
            'TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.',
          );
        ((v = o.TRUSTED_TYPES_POLICY), (Pe = v.createHTML("")));
      } else
        (v === void 0 && (v = Gs($e, c)),
          v !== null && typeof Pe == "string" && (Pe = v.createHTML("")));
      (W && W(o), (pe = o));
    },
    Au = N({}, [...Ht, ...wt, ...Ms]),
    pu = N({}, [...vt, ...xs]),
    Ts = function (o) {
      let T = Ze(o);
      (!T || !T.tagName) && (T = { namespaceURI: Ae, tagName: "template" });
      const A = Ye(o.tagName),
        g = Ye(T.tagName);
      return Pt[o.namespaceURI]
        ? o.namespaceURI === it
          ? T.namespaceURI === te
            ? A === "svg"
            : T.namespaceURI === nt
              ? A === "svg" && (g === "annotation-xml" || Mt[g])
              : !!Au[A]
          : o.namespaceURI === nt
            ? T.namespaceURI === te
              ? A === "math"
              : T.namespaceURI === it
                ? A === "math" && xt[g]
                : !!pu[A]
            : o.namespaceURI === te
              ? (T.namespaceURI === it && !xt[g]) || (T.namespaceURI === nt && !Mt[g])
                ? !1
                : !pu[A] && (ds[A] || !Au[A])
              : !!(Be === "application/xhtml+xml" && Pt[o.namespaceURI])
        : !1;
    },
    J = function (o) {
      Fe(t.removed, { element: o });
      try {
        Ze(o).removeChild(o);
      } catch {
        $a(o);
      }
    },
    Ee = function (o, T) {
      try {
        Fe(t.removed, { attribute: T.getAttributeNode(o), from: T });
      } catch {
        Fe(t.removed, { attribute: null, from: T });
      }
      if ((T.removeAttribute(o), o === "is"))
        if (_e || st)
          try {
            J(T);
          } catch {}
        else
          try {
            T.setAttribute(o, "");
          } catch {}
    },
    Nu = function (o) {
      let T = null,
        A = null;
      if (St) o = "<remove></remove>" + o;
      else {
        const D = Fu(o, /^[\r\n\t ]+/);
        A = D && D[0];
      }
      Be === "application/xhtml+xml" &&
        Ae === te &&
        (o =
          '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' + o + "</body></html>");
      const g = v ? v.createHTML(o) : o;
      if (Ae === te)
        try {
          T = new Nt().parseFromString(g, Be);
        } catch {}
      if (!T || !T.documentElement) {
        T = It.createDocument(Ae, "template", null);
        try {
          T.documentElement.innerHTML = Dt ? Pe : g;
        } catch {}
      }
      const H = T.body || T.documentElement;
      return (
        o && A && H.insertBefore(u.createTextNode(A), H.childNodes[0] || null),
        Ae === te ? as.call(T, le ? "html" : "body")[0] : le ? T.documentElement : H
      );
    },
    Iu = function (o) {
      return ts.call(
        o.ownerDocument || o,
        o,
        C.SHOW_ELEMENT |
          C.SHOW_COMMENT |
          C.SHOW_TEXT |
          C.SHOW_PROCESSING_INSTRUCTION |
          C.SHOW_CDATA_SECTION,
        null,
      );
    },
    Bt = function (o) {
      return (
        o instanceof re &&
        (typeof o.nodeName != "string" ||
          typeof o.textContent != "string" ||
          typeof o.removeChild != "function" ||
          !(o.attributes instanceof Q) ||
          typeof o.removeAttribute != "function" ||
          typeof o.setAttribute != "function" ||
          typeof o.namespaceURI != "string" ||
          typeof o.insertBefore != "function" ||
          typeof o.hasChildNodes != "function")
      );
    },
    yt = function (o) {
      return typeof b == "function" && o instanceof b;
    };
  function ae(p, o, T) {
    ye(p, (A) => {
      A.call(t, o, T, pe);
    });
  }
  const Cu = function (o) {
      let T = null;
      if ((ae(Y.beforeSanitizeElements, o, null), Bt(o))) return (J(o), !0);
      const A = M(o.nodeName);
      if (
        (ae(Y.uponSanitizeElement, o, { tagName: A, allowedTags: x }),
        (xe &&
          o.hasChildNodes() &&
          !yt(o.firstElementChild) &&
          U(/<[/\w!]/g, o.innerHTML) &&
          U(/<[/\w!]/g, o.textContent)) ||
          (xe && o.namespaceURI === te && A === "style" && yt(o.firstElementChild)) ||
          o.nodeType === He.progressingInstruction ||
          (xe && o.nodeType === He.comment && U(/<[/\w]/g, o.data)))
      )
        return (J(o), !0);
      if (Me[A] || (!(ne.tagCheck instanceof Function && ne.tagCheck(A)) && !x[A])) {
        if (
          !Me[A] &&
          Su(A) &&
          ((L.tagNameCheck instanceof RegExp && U(L.tagNameCheck, A)) ||
            (L.tagNameCheck instanceof Function && L.tagNameCheck(A)))
        )
          return !1;
        if (Ot && !ee[A]) {
          const g = Ze(o) || o.parentNode,
            H = es(o) || o.childNodes;
          if (H && g) {
            const D = H.length;
            for (let X = D - 1; X >= 0; --X) {
              const V = Ja(H[X], !0);
              g.insertBefore(V, Za(o));
            }
          }
        }
        return (J(o), !0);
      }
      return (o instanceof _ && !Ts(o)) ||
        ((A === "noscript" || A === "noembed" || A === "noframes") &&
          U(/<\/no(script|embed|frames)/i, o.innerHTML))
        ? (J(o), !0)
        : (de &&
            o.nodeType === He.text &&
            ((T = o.textContent),
            ye([et, tt, ut], (g) => {
              T = Ne(T, g, " ");
            }),
            o.textContent !== T &&
              (Fe(t.removed, { element: o.cloneNode() }), (o.textContent = T))),
          ae(Y.afterSanitizeElements, o, null),
          !1);
    },
    gu = function (o, T, A) {
      if (at[T] || (Eu && (T === "id" || T === "name") && (A in u || A in fs))) return !1;
      const g = F[T] || (ne.attributeCheck instanceof Function && ne.attributeCheck(T, o));
      if (!(Ct && !at[T] && U(rs, T))) {
        if (!(ou && U(ns, T))) {
          if (!g || at[T]) {
            if (
              !(
                (Su(o) &&
                  ((L.tagNameCheck instanceof RegExp && U(L.tagNameCheck, o)) ||
                    (L.tagNameCheck instanceof Function && L.tagNameCheck(o))) &&
                  ((L.attributeNameCheck instanceof RegExp && U(L.attributeNameCheck, T)) ||
                    (L.attributeNameCheck instanceof Function && L.attributeNameCheck(T, o)))) ||
                (T === "is" &&
                  L.allowCustomizedBuiltInElements &&
                  ((L.tagNameCheck instanceof RegExp && U(L.tagNameCheck, A)) ||
                    (L.tagNameCheck instanceof Function && L.tagNameCheck(A))))
              )
            )
              return !1;
          } else if (!Rt[T]) {
            if (!U(nu, Ne(A, ru, ""))) {
              if (
                !(
                  (T === "src" || T === "xlink:href" || T === "href") &&
                  o !== "script" &&
                  Uu(A, "data:") === 0 &&
                  hu[o]
                )
              ) {
                if (!(du && !U(is, Ne(A, ru, "")))) {
                  if (A) return !1;
                }
              }
            }
          }
        }
      }
      return !0;
    },
    hs = N({}, [
      "annotation-xml",
      "color-profile",
      "font-face",
      "font-face-format",
      "font-face-name",
      "font-face-src",
      "font-face-uri",
      "missing-glyph",
    ]),
    Su = function (o) {
      return !hs[Ye(o)] && U(cs, o);
    },
    Ou = function (o) {
      ae(Y.beforeSanitizeAttributes, o, null);
      const { attributes: T } = o;
      if (!T || Bt(o)) return;
      const A = {
        attrName: "",
        attrValue: "",
        keepAttr: !0,
        allowedAttributes: F,
        forceKeepAttr: void 0,
      };
      let g = T.length;
      for (; g--; ) {
        const H = T[g],
          { name: D, namespaceURI: X, value: V } = H,
          $ = M(D),
          Ft = V;
        let k = D === "value" ? Ft : gs(Ft);
        if (
          ((A.attrName = $),
          (A.attrValue = k),
          (A.keepAttr = !0),
          (A.forceKeepAttr = void 0),
          ae(Y.uponSanitizeAttribute, o, A),
          (k = A.attrValue),
          fu && ($ === "id" || $ === "name") && Uu(k, Tu) !== 0 && (Ee(D, o), (k = Tu + k)),
          xe &&
            U(
              /((--!?|])>)|<\/(style|script|title|xmp|textarea|noscript|iframe|noembed|noframes)/i,
              k,
            ))
        ) {
          Ee(D, o);
          continue;
        }
        if ($ === "attributename" && Fu(k, "href")) {
          Ee(D, o);
          continue;
        }
        if (A.forceKeepAttr) continue;
        if (!A.keepAttr) {
          Ee(D, o);
          continue;
        }
        if (!lu && U(/\/>/i, k)) {
          Ee(D, o);
          continue;
        }
        de &&
          ye([et, tt, ut], (Du) => {
            k = Ne(k, Du, " ");
          });
        const Ru = M(o.nodeName);
        if (!gu(Ru, $, k)) {
          Ee(D, o);
          continue;
        }
        if (v && typeof $e == "object" && typeof $e.getAttributeType == "function" && !X)
          switch ($e.getAttributeType(Ru, $)) {
            case "TrustedHTML": {
              k = v.createHTML(k);
              break;
            }
            case "TrustedScriptURL": {
              k = v.createScriptURL(k);
              break;
            }
          }
        if (k !== Ft)
          try {
            (X ? o.setAttributeNS(X, D, k) : o.setAttribute(D, k), Bt(o) ? J(o) : yu(t.removed));
          } catch {
            Ee(D, o);
          }
      }
      ae(Y.afterSanitizeAttributes, o, null);
    },
    Lu = function (o) {
      let T = null;
      const A = Iu(o);
      for (ae(Y.beforeSanitizeShadowDOM, o, null); (T = A.nextNode()); )
        (ae(Y.uponSanitizeShadowNode, T, null),
          Cu(T),
          Ou(T),
          T.content instanceof d && Lu(T.content));
      ae(Y.afterSanitizeShadowDOM, o, null);
    };
  return (
    (t.sanitize = function (p) {
      let o = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {},
        T = null,
        A = null,
        g = null,
        H = null;
      if (
        ((Dt = !p),
        Dt && (p = "<!-->"),
        typeof p != "string" && !yt(p) && ((p = Ds(p)), typeof p != "string"))
      )
        throw ct("dirty is not a string, aborting");
      if (!t.isSupported) return p;
      if ((gt || kt(o), (t.removed = []), typeof p == "string" && (ke = !1), ke)) {
        const V = p.nodeName;
        if (typeof V == "string") {
          const $ = M(V);
          if (!x[$] || Me[$]) throw ct("root node is forbidden and cannot be sanitized in-place");
        }
      } else if (p instanceof b)
        ((T = Nu("<!---->")),
          (A = T.ownerDocument.importNode(p, !0)),
          (A.nodeType === He.element && A.nodeName === "BODY") || A.nodeName === "HTML"
            ? (T = A)
            : T.appendChild(A));
      else {
        if (!_e && !de && !le && p.indexOf("<") === -1) return v && rt ? v.createHTML(p) : p;
        if (((T = Nu(p)), !T)) return _e ? null : rt ? Pe : "";
      }
      T && St && J(T.firstChild);
      const D = Iu(ke ? p : T);
      for (; (g = D.nextNode()); ) (Cu(g), Ou(g), g.content instanceof d && Lu(g.content));
      if (ke) return p;
      if (_e) {
        if (de) {
          T.normalize();
          let V = T.innerHTML;
          (ye([et, tt, ut], ($) => {
            V = Ne(V, $, " ");
          }),
            (T.innerHTML = V));
        }
        if (st) for (H = us.call(T.ownerDocument); T.firstChild; ) H.appendChild(T.firstChild);
        else H = T;
        return ((F.shadowroot || F.shadowrootmode) && (H = ss.call(s, H, !0)), H);
      }
      let X = le ? T.outerHTML : T.innerHTML;
      return (
        le &&
          x["!doctype"] &&
          T.ownerDocument &&
          T.ownerDocument.doctype &&
          T.ownerDocument.doctype.name &&
          U(fa, T.ownerDocument.doctype.name) &&
          (X =
            "<!DOCTYPE " +
            T.ownerDocument.doctype.name +
            `>
` +
            X),
        de &&
          ye([et, tt, ut], (V) => {
            X = Ne(X, V, " ");
          }),
        v && rt ? v.createHTML(X) : X
      );
    }),
    (t.setConfig = function () {
      let p = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      (kt(p), (gt = !0));
    }),
    (t.clearConfig = function () {
      ((pe = null), (gt = !1));
    }),
    (t.isValidAttribute = function (p, o, T) {
      pe || kt({});
      const A = M(p),
        g = M(o);
      return gu(A, g, T);
    }),
    (t.addHook = function (p, o) {
      typeof o == "function" && Fe(Y[p], o);
    }),
    (t.removeHook = function (p, o) {
      if (o !== void 0) {
        const T = Is(Y[p], o);
        return T === -1 ? void 0 : Cs(Y[p], T, 1)[0];
      }
      return yu(Y[p]);
    }),
    (t.removeHooks = function (p) {
      Y[p] = [];
    }),
    (t.removeAllHooks = function () {
      Y = Xu();
    }),
    t
  );
}
var uc = Ta();
const qu = /[#.]/g;
function Ws(e, t) {
  const u = e || "",
    s = {};
  let c = 0,
    d,
    f;
  for (; c < u.length; ) {
    qu.lastIndex = c;
    const b = qu.exec(u),
      _ = u.slice(c, b ? b.index : u.length);
    (_ &&
      (d
        ? d === "#"
          ? (s.id = _)
          : Array.isArray(s.className)
            ? s.className.push(_)
            : (s.className = [_])
        : (f = _),
      (c += _.length)),
      b && ((d = b[0]), c++));
  }
  return { type: "element", tagName: f || t || "div", properties: s, children: [] };
}
function ha(e, t, u) {
  const s = u ? Ks(u) : void 0;
  function c(d, f, ...b) {
    let _;
    if (d == null) {
      _ = { type: "root", children: [] };
      const C = f;
      b.unshift(C);
    } else {
      _ = Ws(d, t);
      const C = _.tagName.toLowerCase(),
        Q = s ? s.get(C) : void 0;
      if (((_.tagName = Q || C), Qs(f))) b.unshift(f);
      else for (const [re, Nt] of Object.entries(f)) Xs(e, _.properties, re, Nt);
    }
    for (const C of b) Kt(_.children, C);
    return (
      _.type === "element" &&
        _.tagName === "template" &&
        ((_.content = { type: "root", children: _.children }), (_.children = [])),
      _
    );
  }
  return c;
}
function Qs(e) {
  if (e === null || typeof e != "object" || Array.isArray(e)) return !0;
  if (typeof e.type != "string") return !1;
  const t = e,
    u = Object.keys(e);
  for (const s of u) {
    const c = t[s];
    if (c && typeof c == "object") {
      if (!Array.isArray(c)) return !0;
      const d = c;
      for (const f of d) if (typeof f != "number" && typeof f != "string") return !0;
    }
  }
  return !!("children" in e && Array.isArray(e.children));
}
function Xs(e, t, u, s) {
  const c = $t(e, u);
  let d;
  if (s != null) {
    if (typeof s == "number") {
      if (Number.isNaN(s)) return;
      d = s;
    } else
      typeof s == "boolean"
        ? (d = s)
        : typeof s == "string"
          ? c.spaceSeparated
            ? (d = Pu(s))
            : c.commaSeparated
              ? (d = Mu(s))
              : c.commaOrSpaceSeparated
                ? (d = Pu(Mu(s).join(" ")))
                : (d = Ku(c, c.property, s))
          : Array.isArray(s)
            ? (d = [...s])
            : (d = c.property === "style" ? qs(s) : String(s));
    if (Array.isArray(d)) {
      const f = [];
      for (const b of d) f.push(Ku(c, c.property, b));
      d = f;
    }
    (c.property === "className" && Array.isArray(t.className) && (d = t.className.concat(d)),
      (t[c.property] = d));
  }
}
function Kt(e, t) {
  if (t != null)
    if (typeof t == "number" || typeof t == "string") e.push({ type: "text", value: String(t) });
    else if (Array.isArray(t)) for (const u of t) Kt(e, u);
    else if (typeof t == "object" && "type" in t) t.type === "root" ? Kt(e, t.children) : e.push(t);
    else throw new Error("Expected node, nodes, or string, got `" + t + "`");
}
function Ku(e, t, u) {
  if (typeof u == "string") {
    if (e.number && u && !Number.isNaN(Number(u))) return Number(u);
    if ((e.boolean || e.overloadedBoolean) && (u === "" || xu(u) === xu(t))) return !0;
  }
  return u;
}
function qs(e) {
  const t = [];
  for (const [u, s] of Object.entries(e)) t.push([u, s].join(": "));
  return t.join("; ");
}
function Ks(e) {
  const t = new Map();
  for (const u of e) t.set(u.toLowerCase(), u);
  return t;
}
const Vs = [
    "altGlyph",
    "altGlyphDef",
    "altGlyphItem",
    "animateColor",
    "animateMotion",
    "animateTransform",
    "clipPath",
    "feBlend",
    "feColorMatrix",
    "feComponentTransfer",
    "feComposite",
    "feConvolveMatrix",
    "feDiffuseLighting",
    "feDisplacementMap",
    "feDistantLight",
    "feDropShadow",
    "feFlood",
    "feFuncA",
    "feFuncB",
    "feFuncG",
    "feFuncR",
    "feGaussianBlur",
    "feImage",
    "feMerge",
    "feMergeNode",
    "feMorphology",
    "feOffset",
    "fePointLight",
    "feSpecularLighting",
    "feSpotLight",
    "feTile",
    "feTurbulence",
    "foreignObject",
    "glyphRef",
    "linearGradient",
    "radialGradient",
    "solidColor",
    "textArea",
    "textPath",
  ],
  zs = ha(mt, "div"),
  js = ha(ze, "g", Vs);
function Js(e) {
  const t = String(e),
    u = [];
  return { toOffset: c, toPoint: s };
  function s(d) {
    if (typeof d == "number" && d > -1 && d <= t.length) {
      let f = 0;
      for (;;) {
        let b = u[f];
        if (b === void 0) {
          const _ = Vu(t, u[f - 1]);
          ((b = _ === -1 ? t.length + 1 : _ + 1), (u[f] = b));
        }
        if (b > d) return { line: f + 1, column: d - (f > 0 ? u[f - 1] : 0) + 1, offset: d };
        f++;
      }
    }
  }
  function c(d) {
    if (
      d &&
      typeof d.line == "number" &&
      typeof d.column == "number" &&
      !Number.isNaN(d.line) &&
      !Number.isNaN(d.column)
    ) {
      for (; u.length < d.line; ) {
        const b = u[u.length - 1],
          _ = Vu(t, b),
          C = _ === -1 ? t.length + 1 : _ + 1;
        if (b === C) break;
        u.push(C);
      }
      const f = (d.line > 1 ? u[d.line - 2] : 0) + d.column - 1;
      if (f < u[d.line - 1]) return f;
    }
  }
}
function Vu(e, t) {
  const u = e.indexOf("\r", t),
    s = e.indexOf(
      `
`,
      t,
    );
  return s === -1 ? u : u === -1 || u + 1 === s ? s : u < s ? u : s;
}
const fe = {
    html: "http://www.w3.org/1999/xhtml",
    mathml: "http://www.w3.org/1998/Math/MathML",
    svg: "http://www.w3.org/2000/svg",
    xlink: "http://www.w3.org/1999/xlink",
    xml: "http://www.w3.org/XML/1998/namespace",
    xmlns: "http://www.w3.org/2000/xmlns/",
  },
  ma = {}.hasOwnProperty,
  $s = Object.prototype;
function Zs(e, t) {
  const u = t || {};
  return Zt(
    {
      file: u.file || void 0,
      location: !1,
      schema: u.space === "svg" ? ze : mt,
      verbose: u.verbose || !1,
    },
    e,
  );
}
function Zt(e, t) {
  let u;
  switch (t.nodeName) {
    case "#comment": {
      const s = t;
      return ((u = { type: "comment", value: s.data }), lt(e, s, u), u);
    }
    case "#document":
    case "#document-fragment": {
      const s = t,
        c = "mode" in s ? s.mode === "quirks" || s.mode === "limited-quirks" : !1;
      if (
        ((u = { type: "root", children: _a(e, t.childNodes), data: { quirksMode: c } }),
        e.file && e.location)
      ) {
        const d = String(e.file),
          f = Js(d),
          b = f.toPoint(0),
          _ = f.toPoint(d.length);
        u.position = { start: b, end: _ };
      }
      return u;
    }
    case "#documentType": {
      const s = t;
      return ((u = { type: "doctype" }), lt(e, s, u), u);
    }
    case "#text": {
      const s = t;
      return ((u = { type: "text", value: s.value }), lt(e, s, u), u);
    }
    default:
      return ((u = er(e, t)), u);
  }
}
function _a(e, t) {
  let u = -1;
  const s = [];
  for (; ++u < t.length; ) {
    const c = Zt(e, t[u]);
    s.push(c);
  }
  return s;
}
function er(e, t) {
  const u = e.schema;
  e.schema = t.namespaceURI === fe.svg ? ze : mt;
  let s = -1;
  const c = {};
  for (; ++s < t.attrs.length; ) {
    const b = t.attrs[s],
      _ = (b.prefix ? b.prefix + ":" : "") + b.name;
    ma.call($s, _) || (c[_] = b.value);
  }
  const f = (e.schema.space === "svg" ? js : zs)(t.tagName, c, _a(e, t.childNodes));
  if ((lt(e, t, f), f.tagName === "template")) {
    const b = t,
      _ = b.sourceCodeLocation,
      C = _ && _.startTag && ge(_.startTag),
      Q = _ && _.endTag && ge(_.endTag),
      re = Zt(e, b.content);
    (C && Q && e.file && (re.position = { start: C.end, end: Q.start }), (f.content = re));
  }
  return ((e.schema = u), f);
}
function lt(e, t, u) {
  if ("sourceCodeLocation" in t && t.sourceCodeLocation && e.file) {
    const s = tr(e, u, t.sourceCodeLocation);
    s && ((e.location = !0), (u.position = s));
  }
}
function tr(e, t, u) {
  const s = ge(u);
  if (t.type === "element") {
    const c = t.children[t.children.length - 1];
    if (
      (s &&
        !u.endTag &&
        c &&
        c.position &&
        c.position.end &&
        (s.end = Object.assign({}, c.position.end)),
      e.verbose)
    ) {
      const d = {};
      let f;
      if (u.attrs)
        for (f in u.attrs) ma.call(u.attrs, f) && (d[$t(e.schema, f).property] = ge(u.attrs[f]));
      Qt(u.startTag);
      const b = ge(u.startTag),
        _ = u.endTag ? ge(u.endTag) : void 0,
        C = { opening: b };
      (_ && (C.closing = _), (C.properties = d), (t.data = { position: C }));
    }
  }
  return s;
}
function ge(e) {
  const t = zu({ line: e.startLine, column: e.startCol, offset: e.startOffset }),
    u = zu({ line: e.endLine, column: e.endCol, offset: e.endOffset });
  return t || u ? { start: t, end: u } : void 0;
}
function zu(e) {
  return e.line && e.column ? e : void 0;
}
const ju = {}.hasOwnProperty;
function ba(e, t) {
  const u = t || {};
  function s(c, ...d) {
    let f = s.invalid;
    const b = s.handlers;
    if (c && ju.call(c, e)) {
      const _ = String(c[e]);
      f = ju.call(b, _) ? b[_] : s.unknown;
    }
    if (f) return f.call(this, c, ...d);
  }
  return ((s.handlers = u.handlers || {}), (s.invalid = u.invalid), (s.unknown = u.unknown), s);
}
const ur = {},
  ar = {}.hasOwnProperty,
  Aa = ba("type", { handlers: { root: rr, element: dr, text: cr, comment: or, doctype: ir } });
function sr(e, t) {
  const s = (t || ur).space;
  return Aa(e, s === "svg" ? ze : mt);
}
function rr(e, t) {
  const u = {
    nodeName: "#document",
    mode: (e.data || {}).quirksMode ? "quirks" : "no-quirks",
    childNodes: [],
  };
  return ((u.childNodes = eu(e.children, u, t)), Oe(e, u), u);
}
function nr(e, t) {
  const u = { nodeName: "#document-fragment", childNodes: [] };
  return ((u.childNodes = eu(e.children, u, t)), Oe(e, u), u);
}
function ir(e) {
  const t = {
    nodeName: "#documentType",
    name: "html",
    publicId: "",
    systemId: "",
    parentNode: null,
  };
  return (Oe(e, t), t);
}
function cr(e) {
  const t = { nodeName: "#text", value: e.value, parentNode: null };
  return (Oe(e, t), t);
}
function or(e) {
  const t = { nodeName: "#comment", data: e.value, parentNode: null };
  return (Oe(e, t), t);
}
function dr(e, t) {
  const u = t;
  let s = u;
  e.type === "element" && e.tagName.toLowerCase() === "svg" && u.space === "html" && (s = ze);
  const c = [];
  let d;
  if (e.properties) {
    for (d in e.properties)
      if (d !== "children" && ar.call(e.properties, d)) {
        const _ = lr(s, d, e.properties[d]);
        _ && c.push(_);
      }
  }
  const f = s.space,
    b = {
      nodeName: e.tagName,
      tagName: e.tagName,
      attrs: c,
      namespaceURI: fe[f],
      childNodes: [],
      parentNode: null,
    };
  return (
    (b.childNodes = eu(e.children, b, s)),
    Oe(e, b),
    e.tagName === "template" && e.content && (b.content = nr(e.content, s)),
    b
  );
}
function lr(e, t, u) {
  const s = $t(e, t);
  if (
    u === !1 ||
    u === null ||
    u === void 0 ||
    (typeof u == "number" && Number.isNaN(u)) ||
    (!u && s.boolean)
  )
    return;
  Array.isArray(u) && (u = s.commaSeparated ? ms(u) : _s(u));
  const c = { name: s.attribute, value: u === !0 ? "" : String(u) };
  if (s.space && s.space !== "html" && s.space !== "svg") {
    const d = c.name.indexOf(":");
    (d < 0
      ? (c.prefix = "")
      : ((c.name = c.name.slice(d + 1)), (c.prefix = s.attribute.slice(0, d))),
      (c.namespace = fe[s.space]));
  }
  return c;
}
function eu(e, t, u) {
  let s = -1;
  const c = [];
  if (e)
    for (; ++s < e.length; ) {
      const d = Aa(e[s], u);
      ((d.parentNode = t), c.push(d));
    }
  return c;
}
function Oe(e, t) {
  const u = e.position;
  u &&
    u.start &&
    u.end &&
    (Qt(typeof u.start.offset == "number"),
    Qt(typeof u.end.offset == "number"),
    (t.sourceCodeLocation = {
      startLine: u.start.line,
      startCol: u.start.column,
      startOffset: u.start.offset,
      endLine: u.end.line,
      endCol: u.end.column,
      endOffset: u.end.offset,
    }));
}
const Er = [
    "area",
    "base",
    "basefont",
    "bgsound",
    "br",
    "col",
    "command",
    "embed",
    "frame",
    "hr",
    "image",
    "img",
    "input",
    "keygen",
    "link",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
  ],
  fr = new Set([
    65534, 65535, 131070, 131071, 196606, 196607, 262142, 262143, 327678, 327679, 393214, 393215,
    458750, 458751, 524286, 524287, 589822, 589823, 655358, 655359, 720894, 720895, 786430, 786431,
    851966, 851967, 917502, 917503, 983038, 983039, 1048574, 1048575, 1114110, 1114111,
  ]),
  S = "�";
var r;
(function (e) {
  ((e[(e.EOF = -1)] = "EOF"),
    (e[(e.NULL = 0)] = "NULL"),
    (e[(e.TABULATION = 9)] = "TABULATION"),
    (e[(e.CARRIAGE_RETURN = 13)] = "CARRIAGE_RETURN"),
    (e[(e.LINE_FEED = 10)] = "LINE_FEED"),
    (e[(e.FORM_FEED = 12)] = "FORM_FEED"),
    (e[(e.SPACE = 32)] = "SPACE"),
    (e[(e.EXCLAMATION_MARK = 33)] = "EXCLAMATION_MARK"),
    (e[(e.QUOTATION_MARK = 34)] = "QUOTATION_MARK"),
    (e[(e.AMPERSAND = 38)] = "AMPERSAND"),
    (e[(e.APOSTROPHE = 39)] = "APOSTROPHE"),
    (e[(e.HYPHEN_MINUS = 45)] = "HYPHEN_MINUS"),
    (e[(e.SOLIDUS = 47)] = "SOLIDUS"),
    (e[(e.DIGIT_0 = 48)] = "DIGIT_0"),
    (e[(e.DIGIT_9 = 57)] = "DIGIT_9"),
    (e[(e.SEMICOLON = 59)] = "SEMICOLON"),
    (e[(e.LESS_THAN_SIGN = 60)] = "LESS_THAN_SIGN"),
    (e[(e.EQUALS_SIGN = 61)] = "EQUALS_SIGN"),
    (e[(e.GREATER_THAN_SIGN = 62)] = "GREATER_THAN_SIGN"),
    (e[(e.QUESTION_MARK = 63)] = "QUESTION_MARK"),
    (e[(e.LATIN_CAPITAL_A = 65)] = "LATIN_CAPITAL_A"),
    (e[(e.LATIN_CAPITAL_Z = 90)] = "LATIN_CAPITAL_Z"),
    (e[(e.RIGHT_SQUARE_BRACKET = 93)] = "RIGHT_SQUARE_BRACKET"),
    (e[(e.GRAVE_ACCENT = 96)] = "GRAVE_ACCENT"),
    (e[(e.LATIN_SMALL_A = 97)] = "LATIN_SMALL_A"),
    (e[(e.LATIN_SMALL_Z = 122)] = "LATIN_SMALL_Z"));
})(r || (r = {}));
const q = {
  DASH_DASH: "--",
  CDATA_START: "[CDATA[",
  DOCTYPE: "doctype",
  SCRIPT: "script",
  PUBLIC: "public",
  SYSTEM: "system",
};
function pa(e) {
  return e >= 55296 && e <= 57343;
}
function Tr(e) {
  return e >= 56320 && e <= 57343;
}
function hr(e, t) {
  return (e - 55296) * 1024 + 9216 + t;
}
function Na(e) {
  return (
    (e !== 32 && e !== 10 && e !== 13 && e !== 9 && e !== 12 && e >= 1 && e <= 31) ||
    (e >= 127 && e <= 159)
  );
}
function Ia(e) {
  return (e >= 64976 && e <= 65007) || fr.has(e);
}
var E;
(function (e) {
  ((e.controlCharacterInInputStream = "control-character-in-input-stream"),
    (e.noncharacterInInputStream = "noncharacter-in-input-stream"),
    (e.surrogateInInputStream = "surrogate-in-input-stream"),
    (e.nonVoidHtmlElementStartTagWithTrailingSolidus =
      "non-void-html-element-start-tag-with-trailing-solidus"),
    (e.endTagWithAttributes = "end-tag-with-attributes"),
    (e.endTagWithTrailingSolidus = "end-tag-with-trailing-solidus"),
    (e.unexpectedSolidusInTag = "unexpected-solidus-in-tag"),
    (e.unexpectedNullCharacter = "unexpected-null-character"),
    (e.unexpectedQuestionMarkInsteadOfTagName = "unexpected-question-mark-instead-of-tag-name"),
    (e.invalidFirstCharacterOfTagName = "invalid-first-character-of-tag-name"),
    (e.unexpectedEqualsSignBeforeAttributeName = "unexpected-equals-sign-before-attribute-name"),
    (e.missingEndTagName = "missing-end-tag-name"),
    (e.unexpectedCharacterInAttributeName = "unexpected-character-in-attribute-name"),
    (e.unknownNamedCharacterReference = "unknown-named-character-reference"),
    (e.missingSemicolonAfterCharacterReference = "missing-semicolon-after-character-reference"),
    (e.unexpectedCharacterAfterDoctypeSystemIdentifier =
      "unexpected-character-after-doctype-system-identifier"),
    (e.unexpectedCharacterInUnquotedAttributeValue =
      "unexpected-character-in-unquoted-attribute-value"),
    (e.eofBeforeTagName = "eof-before-tag-name"),
    (e.eofInTag = "eof-in-tag"),
    (e.missingAttributeValue = "missing-attribute-value"),
    (e.missingWhitespaceBetweenAttributes = "missing-whitespace-between-attributes"),
    (e.missingWhitespaceAfterDoctypePublicKeyword =
      "missing-whitespace-after-doctype-public-keyword"),
    (e.missingWhitespaceBetweenDoctypePublicAndSystemIdentifiers =
      "missing-whitespace-between-doctype-public-and-system-identifiers"),
    (e.missingWhitespaceAfterDoctypeSystemKeyword =
      "missing-whitespace-after-doctype-system-keyword"),
    (e.missingQuoteBeforeDoctypePublicIdentifier =
      "missing-quote-before-doctype-public-identifier"),
    (e.missingQuoteBeforeDoctypeSystemIdentifier =
      "missing-quote-before-doctype-system-identifier"),
    (e.missingDoctypePublicIdentifier = "missing-doctype-public-identifier"),
    (e.missingDoctypeSystemIdentifier = "missing-doctype-system-identifier"),
    (e.abruptDoctypePublicIdentifier = "abrupt-doctype-public-identifier"),
    (e.abruptDoctypeSystemIdentifier = "abrupt-doctype-system-identifier"),
    (e.cdataInHtmlContent = "cdata-in-html-content"),
    (e.incorrectlyOpenedComment = "incorrectly-opened-comment"),
    (e.eofInScriptHtmlCommentLikeText = "eof-in-script-html-comment-like-text"),
    (e.eofInDoctype = "eof-in-doctype"),
    (e.nestedComment = "nested-comment"),
    (e.abruptClosingOfEmptyComment = "abrupt-closing-of-empty-comment"),
    (e.eofInComment = "eof-in-comment"),
    (e.incorrectlyClosedComment = "incorrectly-closed-comment"),
    (e.eofInCdata = "eof-in-cdata"),
    (e.absenceOfDigitsInNumericCharacterReference =
      "absence-of-digits-in-numeric-character-reference"),
    (e.nullCharacterReference = "null-character-reference"),
    (e.surrogateCharacterReference = "surrogate-character-reference"),
    (e.characterReferenceOutsideUnicodeRange = "character-reference-outside-unicode-range"),
    (e.controlCharacterReference = "control-character-reference"),
    (e.noncharacterCharacterReference = "noncharacter-character-reference"),
    (e.missingWhitespaceBeforeDoctypeName = "missing-whitespace-before-doctype-name"),
    (e.missingDoctypeName = "missing-doctype-name"),
    (e.invalidCharacterSequenceAfterDoctypeName = "invalid-character-sequence-after-doctype-name"),
    (e.duplicateAttribute = "duplicate-attribute"),
    (e.nonConformingDoctype = "non-conforming-doctype"),
    (e.missingDoctype = "missing-doctype"),
    (e.misplacedDoctype = "misplaced-doctype"),
    (e.endTagWithoutMatchingOpenElement = "end-tag-without-matching-open-element"),
    (e.closingOfElementWithOpenChildElements = "closing-of-element-with-open-child-elements"),
    (e.disallowedContentInNoscriptInHead = "disallowed-content-in-noscript-in-head"),
    (e.openElementsLeftAfterEof = "open-elements-left-after-eof"),
    (e.abandonedHeadElementChild = "abandoned-head-element-child"),
    (e.misplacedStartTagForHeadElement = "misplaced-start-tag-for-head-element"),
    (e.nestedNoscriptInHead = "nested-noscript-in-head"),
    (e.eofInElementThatCanContainOnlyText = "eof-in-element-that-can-contain-only-text"));
})(E || (E = {}));
const mr = 65536;
class _r {
  constructor(t) {
    ((this.handler = t),
      (this.html = ""),
      (this.pos = -1),
      (this.lastGapPos = -2),
      (this.gapStack = []),
      (this.skipNextNewLine = !1),
      (this.lastChunkWritten = !1),
      (this.endOfChunkHit = !1),
      (this.bufferWaterline = mr),
      (this.isEol = !1),
      (this.lineStartPos = 0),
      (this.droppedBufferSize = 0),
      (this.line = 1),
      (this.lastErrOffset = -1));
  }
  get col() {
    return this.pos - this.lineStartPos + +(this.lastGapPos !== this.pos);
  }
  get offset() {
    return this.droppedBufferSize + this.pos;
  }
  getError(t, u) {
    const { line: s, col: c, offset: d } = this,
      f = c + u,
      b = d + u;
    return {
      code: t,
      startLine: s,
      endLine: s,
      startCol: f,
      endCol: f,
      startOffset: b,
      endOffset: b,
    };
  }
  _err(t) {
    this.handler.onParseError &&
      this.lastErrOffset !== this.offset &&
      ((this.lastErrOffset = this.offset), this.handler.onParseError(this.getError(t, 0)));
  }
  _addGap() {
    (this.gapStack.push(this.lastGapPos), (this.lastGapPos = this.pos));
  }
  _processSurrogate(t) {
    if (this.pos !== this.html.length - 1) {
      const u = this.html.charCodeAt(this.pos + 1);
      if (Tr(u)) return (this.pos++, this._addGap(), hr(t, u));
    } else if (!this.lastChunkWritten) return ((this.endOfChunkHit = !0), r.EOF);
    return (this._err(E.surrogateInInputStream), t);
  }
  willDropParsedChunk() {
    return this.pos > this.bufferWaterline;
  }
  dropParsedChunk() {
    this.willDropParsedChunk() &&
      ((this.html = this.html.substring(this.pos)),
      (this.lineStartPos -= this.pos),
      (this.droppedBufferSize += this.pos),
      (this.pos = 0),
      (this.lastGapPos = -2),
      (this.gapStack.length = 0));
  }
  write(t, u) {
    (this.html.length > 0 ? (this.html += t) : (this.html = t),
      (this.endOfChunkHit = !1),
      (this.lastChunkWritten = u));
  }
  insertHtmlAtCurrentPos(t) {
    ((this.html = this.html.substring(0, this.pos + 1) + t + this.html.substring(this.pos + 1)),
      (this.endOfChunkHit = !1));
  }
  startsWith(t, u) {
    if (this.pos + t.length > this.html.length)
      return ((this.endOfChunkHit = !this.lastChunkWritten), !1);
    if (u) return this.html.startsWith(t, this.pos);
    for (let s = 0; s < t.length; s++)
      if ((this.html.charCodeAt(this.pos + s) | 32) !== t.charCodeAt(s)) return !1;
    return !0;
  }
  peek(t) {
    const u = this.pos + t;
    if (u >= this.html.length) return ((this.endOfChunkHit = !this.lastChunkWritten), r.EOF);
    const s = this.html.charCodeAt(u);
    return s === r.CARRIAGE_RETURN ? r.LINE_FEED : s;
  }
  advance() {
    if (
      (this.pos++,
      this.isEol && ((this.isEol = !1), this.line++, (this.lineStartPos = this.pos)),
      this.pos >= this.html.length)
    )
      return ((this.endOfChunkHit = !this.lastChunkWritten), r.EOF);
    let t = this.html.charCodeAt(this.pos);
    return t === r.CARRIAGE_RETURN
      ? ((this.isEol = !0), (this.skipNextNewLine = !0), r.LINE_FEED)
      : t === r.LINE_FEED && ((this.isEol = !0), this.skipNextNewLine)
        ? (this.line--, (this.skipNextNewLine = !1), this._addGap(), this.advance())
        : ((this.skipNextNewLine = !1),
          pa(t) && (t = this._processSurrogate(t)),
          this.handler.onParseError === null ||
            (t > 31 && t < 127) ||
            t === r.LINE_FEED ||
            t === r.CARRIAGE_RETURN ||
            (t > 159 && t < 64976) ||
            this._checkForProblematicCharacters(t),
          t);
  }
  _checkForProblematicCharacters(t) {
    Na(t)
      ? this._err(E.controlCharacterInInputStream)
      : Ia(t) && this._err(E.noncharacterInInputStream);
  }
  retreat(t) {
    for (this.pos -= t; this.pos < this.lastGapPos; )
      ((this.lastGapPos = this.gapStack.pop()), this.pos--);
    this.isEol = !1;
  }
}
var I;
(function (e) {
  ((e[(e.CHARACTER = 0)] = "CHARACTER"),
    (e[(e.NULL_CHARACTER = 1)] = "NULL_CHARACTER"),
    (e[(e.WHITESPACE_CHARACTER = 2)] = "WHITESPACE_CHARACTER"),
    (e[(e.START_TAG = 3)] = "START_TAG"),
    (e[(e.END_TAG = 4)] = "END_TAG"),
    (e[(e.COMMENT = 5)] = "COMMENT"),
    (e[(e.DOCTYPE = 6)] = "DOCTYPE"),
    (e[(e.EOF = 7)] = "EOF"),
    (e[(e.HIBERNATION = 8)] = "HIBERNATION"));
})(I || (I = {}));
function Ca(e, t) {
  for (let u = e.attrs.length - 1; u >= 0; u--) if (e.attrs[u].name === t) return e.attrs[u].value;
  return null;
}
const br = new Uint16Array(
    'ᵁ<Õıʊҝջאٵ۞ޢߖࠏ੊ઑඡ๭༉༦჊ረዡᐕᒝᓃᓟᔥ\0\0\0\0\0\0ᕫᛍᦍᰒᷝ὾⁠↰⊍⏀⏻⑂⠤⤒ⴈ⹈⿎〖㊺㘹㞬㣾㨨㩱㫠㬮ࠀEMabcfglmnoprstu\\bfms¦³¹ÈÏlig耻Æ䃆P耻&䀦cute耻Á䃁reve;䄂Āiyx}rc耻Â䃂;䐐r;쀀𝔄rave耻À䃀pha;䎑acr;䄀d;橓Āgp¡on;䄄f;쀀𝔸plyFunction;恡ing耻Å䃅Ācs¾Ãr;쀀𝒜ign;扔ilde耻Ã䃃ml耻Ä䃄ЀaceforsuåûþėĜĢħĪĀcrêòkslash;或Ŷöø;櫧ed;挆y;䐑ƀcrtąċĔause;戵noullis;愬a;䎒r;쀀𝔅pf;쀀𝔹eve;䋘còēmpeq;扎܀HOacdefhilorsuōőŖƀƞƢƵƷƺǜȕɳɸɾcy;䐧PY耻©䂩ƀcpyŝŢźute;䄆Ā;iŧŨ拒talDifferentialD;慅leys;愭ȀaeioƉƎƔƘron;䄌dil耻Ç䃇rc;䄈nint;戰ot;䄊ĀdnƧƭilla;䂸terDot;䂷òſi;䎧rcleȀDMPTǇǋǑǖot;抙inus;抖lus;投imes;抗oĀcsǢǸkwiseContourIntegral;戲eCurlyĀDQȃȏoubleQuote;思uote;怙ȀlnpuȞȨɇɕonĀ;eȥȦ户;橴ƀgitȯȶȺruent;扡nt;戯ourIntegral;戮ĀfrɌɎ;愂oduct;成nterClockwiseContourIntegral;戳oss;樯cr;쀀𝒞pĀ;Cʄʅ拓ap;才րDJSZacefiosʠʬʰʴʸˋ˗ˡ˦̳ҍĀ;oŹʥtrahd;椑cy;䐂cy;䐅cy;䐏ƀgrsʿ˄ˇger;怡r;憡hv;櫤Āayː˕ron;䄎;䐔lĀ;t˝˞戇a;䎔r;쀀𝔇Āaf˫̧Ācm˰̢riticalȀADGT̖̜̀̆cute;䂴oŴ̋̍;䋙bleAcute;䋝rave;䁠ilde;䋜ond;拄ferentialD;慆Ѱ̽\0\0\0͔͂\0Ѕf;쀀𝔻ƀ;DE͈͉͍䂨ot;惜qual;扐blèCDLRUVͣͲ΂ϏϢϸontourIntegraìȹoɴ͹\0\0ͻ»͉nArrow;懓Āeo·ΤftƀARTΐΖΡrrow;懐ightArrow;懔eåˊngĀLRΫτeftĀARγιrrow;柸ightArrow;柺ightArrow;柹ightĀATϘϞrrow;懒ee;抨pɁϩ\0\0ϯrrow;懑ownArrow;懕erticalBar;戥ǹABLRTaВЪаўѿͼrrowƀ;BUНОТ憓ar;椓pArrow;懵reve;䌑eft˒к\0ц\0ѐightVector;楐eeVector;楞ectorĀ;Bљњ憽ar;楖ightǔѧ\0ѱeeVector;楟ectorĀ;BѺѻ懁ar;楗eeĀ;A҆҇护rrow;憧ĀctҒҗr;쀀𝒟rok;䄐ࠀNTacdfglmopqstuxҽӀӄӋӞӢӧӮӵԡԯԶՒ՝ՠեG;䅊H耻Ð䃐cute耻É䃉ƀaiyӒӗӜron;䄚rc耻Ê䃊;䐭ot;䄖r;쀀𝔈rave耻È䃈ement;戈ĀapӺӾcr;䄒tyɓԆ\0\0ԒmallSquare;旻erySmallSquare;斫ĀgpԦԪon;䄘f;쀀𝔼silon;䎕uĀaiԼՉlĀ;TՂՃ橵ilde;扂librium;懌Āci՗՚r;愰m;橳a;䎗ml耻Ë䃋Āipժկsts;戃onentialE;慇ʀcfiosօֈ֍ֲ׌y;䐤r;쀀𝔉lledɓ֗\0\0֣mallSquare;旼erySmallSquare;斪Ͱֺ\0ֿ\0\0ׄf;쀀𝔽All;戀riertrf;愱cò׋؀JTabcdfgorstר׬ׯ׺؀ؒؖ؛؝أ٬ٲcy;䐃耻>䀾mmaĀ;d׷׸䎓;䏜reve;䄞ƀeiy؇،ؐdil;䄢rc;䄜;䐓ot;䄠r;쀀𝔊;拙pf;쀀𝔾eater̀EFGLSTصلَٖٛ٦qualĀ;Lؾؿ扥ess;招ullEqual;执reater;檢ess;扷lantEqual;橾ilde;扳cr;쀀𝒢;扫ЀAacfiosuڅڋږڛڞڪھۊRDcy;䐪Āctڐڔek;䋇;䁞irc;䄤r;愌lbertSpace;愋ǰگ\0ڲf;愍izontalLine;攀Āctۃۅòکrok;䄦mpńېۘownHumðįqual;扏܀EJOacdfgmnostuۺ۾܃܇܎ܚܞܡܨ݄ݸދޏޕcy;䐕lig;䄲cy;䐁cute耻Í䃍Āiyܓܘrc耻Î䃎;䐘ot;䄰r;愑rave耻Ì䃌ƀ;apܠܯܿĀcgܴܷr;䄪inaryI;慈lieóϝǴ݉\0ݢĀ;eݍݎ戬Āgrݓݘral;戫section;拂isibleĀCTݬݲomma;恣imes;恢ƀgptݿރވon;䄮f;쀀𝕀a;䎙cr;愐ilde;䄨ǫޚ\0ޞcy;䐆l耻Ï䃏ʀcfosuެ޷޼߂ߐĀiyޱ޵rc;䄴;䐙r;쀀𝔍pf;쀀𝕁ǣ߇\0ߌr;쀀𝒥rcy;䐈kcy;䐄΀HJacfosߤߨ߽߬߱ࠂࠈcy;䐥cy;䐌ppa;䎚Āey߶߻dil;䄶;䐚r;쀀𝔎pf;쀀𝕂cr;쀀𝒦րJTaceflmostࠥࠩࠬࡐࡣ঳সে্਷ੇcy;䐉耻<䀼ʀcmnpr࠷࠼ࡁࡄࡍute;䄹bda;䎛g;柪lacetrf;愒r;憞ƀaeyࡗ࡜ࡡron;䄽dil;䄻;䐛Āfsࡨ॰tԀACDFRTUVarࡾࢩࢱࣦ࣠ࣼयज़ΐ४Ānrࢃ࢏gleBracket;柨rowƀ;BR࢙࢚࢞憐ar;懤ightArrow;懆eiling;挈oǵࢷ\0ࣃbleBracket;柦nǔࣈ\0࣒eeVector;楡ectorĀ;Bࣛࣜ懃ar;楙loor;挊ightĀAV࣯ࣵrrow;憔ector;楎Āerँगeƀ;AVउऊऐ抣rrow;憤ector;楚iangleƀ;BEतथऩ抲ar;槏qual;抴pƀDTVषूौownVector;楑eeVector;楠ectorĀ;Bॖॗ憿ar;楘ectorĀ;B॥०憼ar;楒ightáΜs̀EFGLSTॾঋকঝঢভqualGreater;拚ullEqual;扦reater;扶ess;檡lantEqual;橽ilde;扲r;쀀𝔏Ā;eঽা拘ftarrow;懚idot;䄿ƀnpw৔ਖਛgȀLRlr৞৷ਂਐeftĀAR০৬rrow;柵ightArrow;柷ightArrow;柶eftĀarγਊightáοightáϊf;쀀𝕃erĀLRਢਬeftArrow;憙ightArrow;憘ƀchtਾੀੂòࡌ;憰rok;䅁;扪Ѐacefiosuਗ਼੝੠੷੼અઋ઎p;椅y;䐜Ādl੥੯iumSpace;恟lintrf;愳r;쀀𝔐nusPlus;戓pf;쀀𝕄cò੶;䎜ҀJacefostuણધભીଔଙඑ඗ඞcy;䐊cute;䅃ƀaey઴હાron;䅇dil;䅅;䐝ƀgswે૰଎ativeƀMTV૓૟૨ediumSpace;怋hiĀcn૦૘ë૙eryThiî૙tedĀGL૸ଆreaterGreateòٳessLesóੈLine;䀊r;쀀𝔑ȀBnptଢନଷ଺reak;恠BreakingSpace;䂠f;愕ڀ;CDEGHLNPRSTV୕ୖ୪୼஡௫ఄ౞಄ದ೘ൡඅ櫬Āou୛୤ngruent;扢pCap;扭oubleVerticalBar;戦ƀlqxஃஊ஛ement;戉ualĀ;Tஒஓ扠ilde;쀀≂̸ists;戄reater΀;EFGLSTஶஷ஽௉௓௘௥扯qual;扱ullEqual;쀀≧̸reater;쀀≫̸ess;批lantEqual;쀀⩾̸ilde;扵umpń௲௽ownHump;쀀≎̸qual;쀀≏̸eĀfsఊధtTriangleƀ;BEచఛడ拪ar;쀀⧏̸qual;括s̀;EGLSTవశ఼ౄోౘ扮qual;扰reater;扸ess;쀀≪̸lantEqual;쀀⩽̸ilde;扴estedĀGL౨౹reaterGreater;쀀⪢̸essLess;쀀⪡̸recedesƀ;ESಒಓಛ技qual;쀀⪯̸lantEqual;拠ĀeiಫಹverseElement;戌ghtTriangleƀ;BEೋೌ೒拫ar;쀀⧐̸qual;拭ĀquೝഌuareSuĀbp೨೹setĀ;E೰ೳ쀀⊏̸qual;拢ersetĀ;Eഃആ쀀⊐̸qual;拣ƀbcpഓതൎsetĀ;Eഛഞ쀀⊂⃒qual;抈ceedsȀ;ESTലള഻െ抁qual;쀀⪰̸lantEqual;拡ilde;쀀≿̸ersetĀ;E൘൛쀀⊃⃒qual;抉ildeȀ;EFT൮൯൵ൿ扁qual;扄ullEqual;扇ilde;扉erticalBar;戤cr;쀀𝒩ilde耻Ñ䃑;䎝܀Eacdfgmoprstuvලෂ෉෕ෛ෠෧෼ขภยา฿ไlig;䅒cute耻Ó䃓Āiy෎ීrc耻Ô䃔;䐞blac;䅐r;쀀𝔒rave耻Ò䃒ƀaei෮ෲ෶cr;䅌ga;䎩cron;䎟pf;쀀𝕆enCurlyĀDQฎบoubleQuote;怜uote;怘;橔Āclวฬr;쀀𝒪ash耻Ø䃘iŬื฼de耻Õ䃕es;樷ml耻Ö䃖erĀBP๋๠Āar๐๓r;怾acĀek๚๜;揞et;掴arenthesis;揜Ҁacfhilors๿ງຊຏຒດຝະ໼rtialD;戂y;䐟r;쀀𝔓i;䎦;䎠usMinus;䂱Āipຢອncareplanåڝf;愙Ȁ;eio຺ູ໠໤檻cedesȀ;EST່້໏໚扺qual;檯lantEqual;扼ilde;找me;怳Ādp໩໮uct;戏ortionĀ;aȥ໹l;戝Āci༁༆r;쀀𝒫;䎨ȀUfos༑༖༛༟OT耻"䀢r;쀀𝔔pf;愚cr;쀀𝒬؀BEacefhiorsu༾གྷཇའཱིྦྷྪྭ႖ႩႴႾarr;椐G耻®䂮ƀcnrཎནབute;䅔g;柫rĀ;tཛྷཝ憠l;椖ƀaeyཧཬཱron;䅘dil;䅖;䐠Ā;vླྀཹ愜erseĀEUྂྙĀlq྇ྎement;戋uilibrium;懋pEquilibrium;楯r»ཹo;䎡ghtЀACDFTUVa࿁࿫࿳ဢဨၛႇϘĀnr࿆࿒gleBracket;柩rowƀ;BL࿜࿝࿡憒ar;懥eftArrow;懄eiling;按oǵ࿹\0စbleBracket;柧nǔည\0နeeVector;楝ectorĀ;Bဝသ懂ar;楕loor;挋Āerိ၃eƀ;AVဵံြ抢rrow;憦ector;楛iangleƀ;BEၐၑၕ抳ar;槐qual;抵pƀDTVၣၮၸownVector;楏eeVector;楜ectorĀ;Bႂႃ憾ar;楔ectorĀ;B႑႒懀ar;楓Āpuႛ႞f;愝ndImplies;楰ightarrow;懛ĀchႹႼr;愛;憱leDelayed;槴ڀHOacfhimoqstuფჱჷჽᄙᄞᅑᅖᅡᅧᆵᆻᆿĀCcჩხHcy;䐩y;䐨FTcy;䐬cute;䅚ʀ;aeiyᄈᄉᄎᄓᄗ檼ron;䅠dil;䅞rc;䅜;䐡r;쀀𝔖ortȀDLRUᄪᄴᄾᅉownArrow»ОeftArrow»࢚ightArrow»࿝pArrow;憑gma;䎣allCircle;战pf;쀀𝕊ɲᅭ\0\0ᅰt;戚areȀ;ISUᅻᅼᆉᆯ斡ntersection;抓uĀbpᆏᆞsetĀ;Eᆗᆘ抏qual;抑ersetĀ;Eᆨᆩ抐qual;抒nion;抔cr;쀀𝒮ar;拆ȀbcmpᇈᇛሉላĀ;sᇍᇎ拐etĀ;Eᇍᇕqual;抆ĀchᇠህeedsȀ;ESTᇭᇮᇴᇿ扻qual;檰lantEqual;扽ilde;承Tháྌ;我ƀ;esሒሓሣ拑rsetĀ;Eሜም抃qual;抇et»ሓրHRSacfhiorsሾቄ቉ቕ቞ቱቶኟዂወዑORN耻Þ䃞ADE;愢ĀHc቎ቒcy;䐋y;䐦Ābuቚቜ;䀉;䎤ƀaeyብቪቯron;䅤dil;䅢;䐢r;쀀𝔗Āeiቻ኉ǲኀ\0ኇefore;戴a;䎘Ācn኎ኘkSpace;쀀  Space;怉ldeȀ;EFTካኬኲኼ戼qual;扃ullEqual;扅ilde;扈pf;쀀𝕋ipleDot;惛Āctዖዛr;쀀𝒯rok;䅦ૡዷጎጚጦ\0ጬጱ\0\0\0\0\0ጸጽ፷ᎅ\0᏿ᐄᐊᐐĀcrዻጁute耻Ú䃚rĀ;oጇገ憟cir;楉rǣጓ\0጖y;䐎ve;䅬Āiyጞጣrc耻Û䃛;䐣blac;䅰r;쀀𝔘rave耻Ù䃙acr;䅪Ādiፁ፩erĀBPፈ፝Āarፍፐr;䁟acĀekፗፙ;揟et;掵arenthesis;揝onĀ;P፰፱拃lus;抎Āgp፻፿on;䅲f;쀀𝕌ЀADETadps᎕ᎮᎸᏄϨᏒᏗᏳrrowƀ;BDᅐᎠᎤar;椒ownArrow;懅ownArrow;憕quilibrium;楮eeĀ;AᏋᏌ报rrow;憥ownáϳerĀLRᏞᏨeftArrow;憖ightArrow;憗iĀ;lᏹᏺ䏒on;䎥ing;䅮cr;쀀𝒰ilde;䅨ml耻Ü䃜ҀDbcdefosvᐧᐬᐰᐳᐾᒅᒊᒐᒖash;披ar;櫫y;䐒ashĀ;lᐻᐼ抩;櫦Āerᑃᑅ;拁ƀbtyᑌᑐᑺar;怖Ā;iᑏᑕcalȀBLSTᑡᑥᑪᑴar;戣ine;䁼eparator;杘ilde;所ThinSpace;怊r;쀀𝔙pf;쀀𝕍cr;쀀𝒱dash;抪ʀcefosᒧᒬᒱᒶᒼirc;䅴dge;拀r;쀀𝔚pf;쀀𝕎cr;쀀𝒲Ȁfiosᓋᓐᓒᓘr;쀀𝔛;䎞pf;쀀𝕏cr;쀀𝒳ҀAIUacfosuᓱᓵᓹᓽᔄᔏᔔᔚᔠcy;䐯cy;䐇cy;䐮cute耻Ý䃝Āiyᔉᔍrc;䅶;䐫r;쀀𝔜pf;쀀𝕐cr;쀀𝒴ml;䅸ЀHacdefosᔵᔹᔿᕋᕏᕝᕠᕤcy;䐖cute;䅹Āayᕄᕉron;䅽;䐗ot;䅻ǲᕔ\0ᕛoWidtè૙a;䎖r;愨pf;愤cr;쀀𝒵௡ᖃᖊᖐ\0ᖰᖶᖿ\0\0\0\0ᗆᗛᗫᙟ᙭\0ᚕ᚛ᚲᚹ\0ᚾcute耻á䃡reve;䄃̀;Ediuyᖜᖝᖡᖣᖨᖭ戾;쀀∾̳;房rc耻â䃢te肻´̆;䐰lig耻æ䃦Ā;r²ᖺ;쀀𝔞rave耻à䃠ĀepᗊᗖĀfpᗏᗔsym;愵èᗓha;䎱ĀapᗟcĀclᗤᗧr;䄁g;樿ɤᗰ\0\0ᘊʀ;adsvᗺᗻᗿᘁᘇ戧nd;橕;橜lope;橘;橚΀;elmrszᘘᘙᘛᘞᘿᙏᙙ戠;榤e»ᘙsdĀ;aᘥᘦ戡ѡᘰᘲᘴᘶᘸᘺᘼᘾ;榨;榩;榪;榫;榬;榭;榮;榯tĀ;vᙅᙆ戟bĀ;dᙌᙍ抾;榝Āptᙔᙗh;戢»¹arr;捼Āgpᙣᙧon;䄅f;쀀𝕒΀;Eaeiop዁ᙻᙽᚂᚄᚇᚊ;橰cir;橯;扊d;手s;䀧roxĀ;e዁ᚒñᚃing耻å䃥ƀctyᚡᚦᚨr;쀀𝒶;䀪mpĀ;e዁ᚯñʈilde耻ã䃣ml耻ä䃤Āciᛂᛈoninôɲnt;樑ࠀNabcdefiklnoprsu᛭ᛱᜰ᜼ᝃᝈ᝸᝽០៦ᠹᡐᜍ᤽᥈ᥰot;櫭Ācrᛶ᜞kȀcepsᜀᜅᜍᜓong;扌psilon;䏶rime;怵imĀ;e᜚᜛戽q;拍Ŷᜢᜦee;抽edĀ;gᜬᜭ挅e»ᜭrkĀ;t፜᜷brk;掶Āoyᜁᝁ;䐱quo;怞ʀcmprtᝓ᝛ᝡᝤᝨausĀ;eĊĉptyv;榰séᜌnoõēƀahwᝯ᝱ᝳ;䎲;愶een;扬r;쀀𝔟g΀costuvwឍឝឳេ៕៛៞ƀaiuបពរðݠrc;旯p»፱ƀdptឤឨឭot;樀lus;樁imes;樂ɱឹ\0\0ើcup;樆ar;昅riangleĀdu៍្own;施p;斳plus;樄eåᑄåᒭarow;植ƀako៭ᠦᠵĀcn៲ᠣkƀlst៺֫᠂ozenge;槫riangleȀ;dlr᠒᠓᠘᠝斴own;斾eft;旂ight;斸k;搣Ʊᠫ\0ᠳƲᠯ\0ᠱ;斒;斑4;斓ck;斈ĀeoᠾᡍĀ;qᡃᡆ쀀=⃥uiv;쀀≡⃥t;挐Ȁptwxᡙᡞᡧᡬf;쀀𝕓Ā;tᏋᡣom»Ꮜtie;拈؀DHUVbdhmptuvᢅᢖᢪᢻᣗᣛᣬ᣿ᤅᤊᤐᤡȀLRlrᢎᢐᢒᢔ;敗;敔;敖;敓ʀ;DUduᢡᢢᢤᢦᢨ敐;敦;敩;敤;敧ȀLRlrᢳᢵᢷᢹ;敝;敚;敜;教΀;HLRhlrᣊᣋᣍᣏᣑᣓᣕ救;敬;散;敠;敫;敢;敟ox;槉ȀLRlrᣤᣦᣨᣪ;敕;敒;攐;攌ʀ;DUduڽ᣷᣹᣻᣽;敥;敨;攬;攴inus;抟lus;択imes;抠ȀLRlrᤙᤛᤝ᤟;敛;敘;攘;攔΀;HLRhlrᤰᤱᤳᤵᤷ᤻᤹攂;敪;敡;敞;攼;攤;攜Āevģ᥂bar耻¦䂦Ȁceioᥑᥖᥚᥠr;쀀𝒷mi;恏mĀ;e᜚᜜lƀ;bhᥨᥩᥫ䁜;槅sub;柈Ŭᥴ᥾lĀ;e᥹᥺怢t»᥺pƀ;Eeįᦅᦇ;檮Ā;qۜۛೡᦧ\0᧨ᨑᨕᨲ\0ᨷᩐ\0\0᪴\0\0᫁\0\0ᬡᬮ᭍᭒\0᯽\0ᰌƀcpr᦭ᦲ᧝ute;䄇̀;abcdsᦿᧀᧄ᧊᧕᧙戩nd;橄rcup;橉Āau᧏᧒p;橋p;橇ot;橀;쀀∩︀Āeo᧢᧥t;恁îړȀaeiu᧰᧻ᨁᨅǰ᧵\0᧸s;橍on;䄍dil耻ç䃧rc;䄉psĀ;sᨌᨍ橌m;橐ot;䄋ƀdmnᨛᨠᨦil肻¸ƭptyv;榲t脀¢;eᨭᨮ䂢räƲr;쀀𝔠ƀceiᨽᩀᩍy;䑇ckĀ;mᩇᩈ朓ark»ᩈ;䏇r΀;Ecefms᩟᩠ᩢᩫ᪤᪪᪮旋;槃ƀ;elᩩᩪᩭ䋆q;扗eɡᩴ\0\0᪈rrowĀlr᩼᪁eft;憺ight;憻ʀRSacd᪒᪔᪖᪚᪟»ཇ;擈st;抛irc;抚ash;抝nint;樐id;櫯cir;槂ubsĀ;u᪻᪼晣it»᪼ˬ᫇᫔᫺\0ᬊonĀ;eᫍᫎ䀺Ā;qÇÆɭ᫙\0\0᫢aĀ;t᫞᫟䀬;䁀ƀ;fl᫨᫩᫫戁îᅠeĀmx᫱᫶ent»᫩eóɍǧ᫾\0ᬇĀ;dኻᬂot;橭nôɆƀfryᬐᬔᬗ;쀀𝕔oäɔ脀©;sŕᬝr;愗Āaoᬥᬩrr;憵ss;朗Ācuᬲᬷr;쀀𝒸Ābpᬼ᭄Ā;eᭁᭂ櫏;櫑Ā;eᭉᭊ櫐;櫒dot;拯΀delprvw᭠᭬᭷ᮂᮬᯔ᯹arrĀlr᭨᭪;椸;椵ɰ᭲\0\0᭵r;拞c;拟arrĀ;p᭿ᮀ憶;椽̀;bcdosᮏᮐᮖᮡᮥᮨ截rcap;橈Āauᮛᮞp;橆p;橊ot;抍r;橅;쀀∪︀Ȁalrv᮵ᮿᯞᯣrrĀ;mᮼᮽ憷;椼yƀevwᯇᯔᯘqɰᯎ\0\0ᯒreã᭳uã᭵ee;拎edge;拏en耻¤䂤earrowĀlrᯮ᯳eft»ᮀight»ᮽeäᯝĀciᰁᰇoninôǷnt;戱lcty;挭ঀAHabcdefhijlorstuwz᰸᰻᰿ᱝᱩᱵᲊᲞᲬᲷ᳻᳿ᴍᵻᶑᶫᶻ᷆᷍rò΁ar;楥Ȁglrs᱈ᱍ᱒᱔ger;怠eth;愸òᄳhĀ;vᱚᱛ怐»ऊūᱡᱧarow;椏aã̕Āayᱮᱳron;䄏;䐴ƀ;ao̲ᱼᲄĀgrʿᲁr;懊tseq;橷ƀglmᲑᲔᲘ耻°䂰ta;䎴ptyv;榱ĀirᲣᲨsht;楿;쀀𝔡arĀlrᲳᲵ»ࣜ»သʀaegsv᳂͸᳖᳜᳠mƀ;oș᳊᳔ndĀ;ș᳑uit;晦amma;䏝in;拲ƀ;io᳧᳨᳸䃷de脀÷;o᳧ᳰntimes;拇nø᳷cy;䑒cɯᴆ\0\0ᴊrn;挞op;挍ʀlptuwᴘᴝᴢᵉᵕlar;䀤f;쀀𝕕ʀ;emps̋ᴭᴷᴽᵂqĀ;d͒ᴳot;扑inus;戸lus;戔quare;抡blebarwedgåúnƀadhᄮᵝᵧownarrowóᲃarpoonĀlrᵲᵶefôᲴighôᲶŢᵿᶅkaro÷གɯᶊ\0\0ᶎrn;挟op;挌ƀcotᶘᶣᶦĀryᶝᶡ;쀀𝒹;䑕l;槶rok;䄑Ādrᶰᶴot;拱iĀ;fᶺ᠖斿Āah᷀᷃ròЩaòྦangle;榦Āci᷒ᷕy;䑟grarr;柿ऀDacdefglmnopqrstuxḁḉḙḸոḼṉṡṾấắẽỡἪἷὄ὎὚ĀDoḆᴴoôᲉĀcsḎḔute耻é䃩ter;橮ȀaioyḢḧḱḶron;䄛rĀ;cḭḮ扖耻ê䃪lon;払;䑍ot;䄗ĀDrṁṅot;扒;쀀𝔢ƀ;rsṐṑṗ檚ave耻è䃨Ā;dṜṝ檖ot;檘Ȁ;ilsṪṫṲṴ檙nters;揧;愓Ā;dṹṺ檕ot;檗ƀapsẅẉẗcr;䄓tyƀ;svẒẓẕ戅et»ẓpĀ1;ẝẤĳạả;怄;怅怃ĀgsẪẬ;䅋p;怂ĀgpẴẸon;䄙f;쀀𝕖ƀalsỄỎỒrĀ;sỊị拕l;槣us;橱iƀ;lvỚớở䎵on»ớ;䏵ȀcsuvỪỳἋἣĀioữḱrc»Ḯɩỹ\0\0ỻíՈantĀglἂἆtr»ṝess»Ṻƀaeiἒ἖Ἒls;䀽st;扟vĀ;DȵἠD;橸parsl;槥ĀDaἯἳot;打rr;楱ƀcdiἾὁỸr;愯oô͒ĀahὉὋ;䎷耻ð䃰Āmrὓὗl耻ë䃫o;悬ƀcipὡὤὧl;䀡sôծĀeoὬὴctatioîՙnentialåչৡᾒ\0ᾞ\0ᾡᾧ\0\0ῆῌ\0ΐ\0ῦῪ \0 ⁚llingdotseñṄy;䑄male;晀ƀilrᾭᾳ῁lig;耀ﬃɩᾹ\0\0᾽g;耀ﬀig;耀ﬄ;쀀𝔣lig;耀ﬁlig;쀀fjƀaltῙ῜ῡt;晭ig;耀ﬂns;斱of;䆒ǰ΅\0ῳf;쀀𝕗ĀakֿῷĀ;vῼ´拔;櫙artint;樍Āao‌⁕Ācs‑⁒α‚‰‸⁅⁈\0⁐β•‥‧‪‬\0‮耻½䂽;慓耻¼䂼;慕;慙;慛Ƴ‴\0‶;慔;慖ʴ‾⁁\0\0⁃耻¾䂾;慗;慜5;慘ƶ⁌\0⁎;慚;慝8;慞l;恄wn;挢cr;쀀𝒻ࢀEabcdefgijlnorstv₂₉₟₥₰₴⃰⃵⃺⃿℃ℒℸ̗ℾ⅒↞Ā;lٍ₇;檌ƀcmpₐₕ₝ute;䇵maĀ;dₜ᳚䎳;檆reve;䄟Āiy₪₮rc;䄝;䐳ot;䄡Ȁ;lqsؾق₽⃉ƀ;qsؾٌ⃄lanô٥Ȁ;cdl٥⃒⃥⃕c;檩otĀ;o⃜⃝檀Ā;l⃢⃣檂;檄Ā;e⃪⃭쀀⋛︀s;檔r;쀀𝔤Ā;gٳ؛mel;愷cy;䑓Ȁ;Eajٚℌℎℐ;檒;檥;檤ȀEaesℛℝ℩ℴ;扩pĀ;p℣ℤ檊rox»ℤĀ;q℮ℯ檈Ā;q℮ℛim;拧pf;쀀𝕘Āci⅃ⅆr;愊mƀ;el٫ⅎ⅐;檎;檐茀>;cdlqr׮ⅠⅪⅮⅳⅹĀciⅥⅧ;檧r;橺ot;拗Par;榕uest;橼ʀadelsↄⅪ←ٖ↛ǰ↉\0↎proø₞r;楸qĀlqؿ↖lesó₈ií٫Āen↣↭rtneqq;쀀≩︀Å↪ԀAabcefkosy⇄⇇⇱⇵⇺∘∝∯≨≽ròΠȀilmr⇐⇔⇗⇛rsðᒄf»․ilôکĀdr⇠⇤cy;䑊ƀ;cwࣴ⇫⇯ir;楈;憭ar;意irc;䄥ƀalr∁∎∓rtsĀ;u∉∊晥it»∊lip;怦con;抹r;쀀𝔥sĀew∣∩arow;椥arow;椦ʀamopr∺∾≃≞≣rr;懿tht;戻kĀlr≉≓eftarrow;憩ightarrow;憪f;쀀𝕙bar;怕ƀclt≯≴≸r;쀀𝒽asè⇴rok;䄧Ābp⊂⊇ull;恃hen»ᱛૡ⊣\0⊪\0⊸⋅⋎\0⋕⋳\0\0⋸⌢⍧⍢⍿\0⎆⎪⎴cute耻í䃭ƀ;iyݱ⊰⊵rc耻î䃮;䐸Ācx⊼⊿y;䐵cl耻¡䂡ĀfrΟ⋉;쀀𝔦rave耻ì䃬Ȁ;inoܾ⋝⋩⋮Āin⋢⋦nt;樌t;戭fin;槜ta;愩lig;䄳ƀaop⋾⌚⌝ƀcgt⌅⌈⌗r;䄫ƀelpܟ⌏⌓inåގarôܠh;䄱f;抷ed;䆵ʀ;cfotӴ⌬⌱⌽⍁are;愅inĀ;t⌸⌹戞ie;槝doô⌙ʀ;celpݗ⍌⍐⍛⍡al;抺Āgr⍕⍙eróᕣã⍍arhk;樗rod;樼Ȁcgpt⍯⍲⍶⍻y;䑑on;䄯f;쀀𝕚a;䎹uest耻¿䂿Āci⎊⎏r;쀀𝒾nʀ;EdsvӴ⎛⎝⎡ӳ;拹ot;拵Ā;v⎦⎧拴;拳Ā;iݷ⎮lde;䄩ǫ⎸\0⎼cy;䑖l耻ï䃯̀cfmosu⏌⏗⏜⏡⏧⏵Āiy⏑⏕rc;䄵;䐹r;쀀𝔧ath;䈷pf;쀀𝕛ǣ⏬\0⏱r;쀀𝒿rcy;䑘kcy;䑔Ѐacfghjos␋␖␢␧␭␱␵␻ppaĀ;v␓␔䎺;䏰Āey␛␠dil;䄷;䐺r;쀀𝔨reen;䄸cy;䑅cy;䑜pf;쀀𝕜cr;쀀𝓀஀ABEHabcdefghjlmnoprstuv⑰⒁⒆⒍⒑┎┽╚▀♎♞♥♹♽⚚⚲⛘❝❨➋⟀⠁⠒ƀart⑷⑺⑼rò৆òΕail;椛arr;椎Ā;gঔ⒋;檋ar;楢ॣ⒥\0⒪\0⒱\0\0\0\0\0⒵Ⓔ\0ⓆⓈⓍ\0⓹ute;䄺mptyv;榴raîࡌbda;䎻gƀ;dlࢎⓁⓃ;榑åࢎ;檅uo耻«䂫rЀ;bfhlpst࢙ⓞⓦⓩ⓫⓮⓱⓵Ā;f࢝ⓣs;椟s;椝ë≒p;憫l;椹im;楳l;憢ƀ;ae⓿─┄檫il;椙Ā;s┉┊檭;쀀⪭︀ƀabr┕┙┝rr;椌rk;杲Āak┢┬cĀek┨┪;䁻;䁛Āes┱┳;榋lĀdu┹┻;榏;榍Ȁaeuy╆╋╖╘ron;䄾Ādi═╔il;䄼ìࢰâ┩;䐻Ȁcqrs╣╦╭╽a;椶uoĀ;rนᝆĀdu╲╷har;楧shar;楋h;憲ʀ;fgqs▋▌উ◳◿扤tʀahlrt▘▤▷◂◨rrowĀ;t࢙□aé⓶arpoonĀdu▯▴own»њp»०eftarrows;懇ightƀahs◍◖◞rrowĀ;sࣴࢧarpoonó྘quigarro÷⇰hreetimes;拋ƀ;qs▋ও◺lanôবʀ;cdgsব☊☍☝☨c;檨otĀ;o☔☕橿Ā;r☚☛檁;檃Ā;e☢☥쀀⋚︀s;檓ʀadegs☳☹☽♉♋pproøⓆot;拖qĀgq♃♅ôউgtò⒌ôছiíলƀilr♕࣡♚sht;楼;쀀𝔩Ā;Eজ♣;檑š♩♶rĀdu▲♮Ā;l॥♳;楪lk;斄cy;䑙ʀ;achtੈ⚈⚋⚑⚖rò◁orneòᴈard;楫ri;旺Āio⚟⚤dot;䅀ustĀ;a⚬⚭掰che»⚭ȀEaes⚻⚽⛉⛔;扨pĀ;p⛃⛄檉rox»⛄Ā;q⛎⛏檇Ā;q⛎⚻im;拦Ѐabnoptwz⛩⛴⛷✚✯❁❇❐Ānr⛮⛱g;柬r;懽rëࣁgƀlmr⛿✍✔eftĀar০✇ightá৲apsto;柼ightá৽parrowĀlr✥✩efô⓭ight;憬ƀafl✶✹✽r;榅;쀀𝕝us;樭imes;樴š❋❏st;戗áፎƀ;ef❗❘᠀旊nge»❘arĀ;l❤❥䀨t;榓ʀachmt❳❶❼➅➇ròࢨorneòᶌarĀ;d྘➃;業;怎ri;抿̀achiqt➘➝ੀ➢➮➻quo;怹r;쀀𝓁mƀ;egল➪➬;檍;檏Ābu┪➳oĀ;rฟ➹;怚rok;䅂萀<;cdhilqrࠫ⟒☹⟜⟠⟥⟪⟰Āci⟗⟙;檦r;橹reå◲mes;拉arr;楶uest;橻ĀPi⟵⟹ar;榖ƀ;ef⠀भ᠛旃rĀdu⠇⠍shar;楊har;楦Āen⠗⠡rtneqq;쀀≨︀Å⠞܀Dacdefhilnopsu⡀⡅⢂⢎⢓⢠⢥⢨⣚⣢⣤ઃ⣳⤂Dot;戺Ȁclpr⡎⡒⡣⡽r耻¯䂯Āet⡗⡙;時Ā;e⡞⡟朠se»⡟Ā;sျ⡨toȀ;dluျ⡳⡷⡻owîҌefôएðᏑker;斮Āoy⢇⢌mma;権;䐼ash;怔asuredangle»ᘦr;쀀𝔪o;愧ƀcdn⢯⢴⣉ro耻µ䂵Ȁ;acdᑤ⢽⣀⣄sôᚧir;櫰ot肻·Ƶusƀ;bd⣒ᤃ⣓戒Ā;uᴼ⣘;横ţ⣞⣡p;櫛ò−ðઁĀdp⣩⣮els;抧f;쀀𝕞Āct⣸⣽r;쀀𝓂pos»ᖝƀ;lm⤉⤊⤍䎼timap;抸ఀGLRVabcdefghijlmoprstuvw⥂⥓⥾⦉⦘⧚⧩⨕⨚⩘⩝⪃⪕⪤⪨⬄⬇⭄⭿⮮ⰴⱧⱼ⳩Āgt⥇⥋;쀀⋙̸Ā;v⥐௏쀀≫⃒ƀelt⥚⥲⥶ftĀar⥡⥧rrow;懍ightarrow;懎;쀀⋘̸Ā;v⥻ే쀀≪⃒ightarrow;懏ĀDd⦎⦓ash;抯ash;抮ʀbcnpt⦣⦧⦬⦱⧌la»˞ute;䅄g;쀀∠⃒ʀ;Eiop඄⦼⧀⧅⧈;쀀⩰̸d;쀀≋̸s;䅉roø඄urĀ;a⧓⧔普lĀ;s⧓ସǳ⧟\0⧣p肻 ଷmpĀ;e௹ఀʀaeouy⧴⧾⨃⨐⨓ǰ⧹\0⧻;橃on;䅈dil;䅆ngĀ;dൾ⨊ot;쀀⩭̸p;橂;䐽ash;怓΀;Aadqsxஒ⨩⨭⨻⩁⩅⩐rr;懗rĀhr⨳⨶k;椤Ā;oᏲᏰot;쀀≐̸uiöୣĀei⩊⩎ar;椨í஘istĀ;s஠டr;쀀𝔫ȀEest௅⩦⩹⩼ƀ;qs஼⩭௡ƀ;qs஼௅⩴lanô௢ií௪Ā;rஶ⪁»ஷƀAap⪊⪍⪑rò⥱rr;憮ar;櫲ƀ;svྍ⪜ྌĀ;d⪡⪢拼;拺cy;䑚΀AEadest⪷⪺⪾⫂⫅⫶⫹rò⥦;쀀≦̸rr;憚r;急Ȁ;fqs఻⫎⫣⫯tĀar⫔⫙rro÷⫁ightarro÷⪐ƀ;qs఻⪺⫪lanôౕĀ;sౕ⫴»శiíౝĀ;rవ⫾iĀ;eచథiäඐĀpt⬌⬑f;쀀𝕟膀¬;in⬙⬚⬶䂬nȀ;Edvஉ⬤⬨⬮;쀀⋹̸ot;쀀⋵̸ǡஉ⬳⬵;拷;拶iĀ;vಸ⬼ǡಸ⭁⭃;拾;拽ƀaor⭋⭣⭩rȀ;ast୻⭕⭚⭟lleì୻l;쀀⫽⃥;쀀∂̸lint;樔ƀ;ceಒ⭰⭳uåಥĀ;cಘ⭸Ā;eಒ⭽ñಘȀAait⮈⮋⮝⮧rò⦈rrƀ;cw⮔⮕⮙憛;쀀⤳̸;쀀↝̸ghtarrow»⮕riĀ;eೋೖ΀chimpqu⮽⯍⯙⬄୸⯤⯯Ȁ;cerല⯆ഷ⯉uå൅;쀀𝓃ortɭ⬅\0\0⯖ará⭖mĀ;e൮⯟Ā;q൴൳suĀbp⯫⯭å೸åഋƀbcp⯶ⰑⰙȀ;Ees⯿ⰀഢⰄ抄;쀀⫅̸etĀ;eഛⰋqĀ;qണⰀcĀ;eലⰗñസȀ;EesⰢⰣൟⰧ抅;쀀⫆̸etĀ;e൘ⰮqĀ;qൠⰣȀgilrⰽⰿⱅⱇìௗlde耻ñ䃱çృiangleĀlrⱒⱜeftĀ;eచⱚñదightĀ;eೋⱥñ೗Ā;mⱬⱭ䎽ƀ;esⱴⱵⱹ䀣ro;愖p;怇ҀDHadgilrsⲏⲔⲙⲞⲣⲰⲶⳓⳣash;抭arr;椄p;쀀≍⃒ash;抬ĀetⲨⲬ;쀀≥⃒;쀀>⃒nfin;槞ƀAetⲽⳁⳅrr;椂;쀀≤⃒Ā;rⳊⳍ쀀<⃒ie;쀀⊴⃒ĀAtⳘⳜrr;椃rie;쀀⊵⃒im;쀀∼⃒ƀAan⳰⳴ⴂrr;懖rĀhr⳺⳽k;椣Ā;oᏧᏥear;椧ቓ᪕\0\0\0\0\0\0\0\0\0\0\0\0\0ⴭ\0ⴸⵈⵠⵥ⵲ⶄᬇ\0\0ⶍⶫ\0ⷈⷎ\0ⷜ⸙⸫⸾⹃Ācsⴱ᪗ute耻ó䃳ĀiyⴼⵅrĀ;c᪞ⵂ耻ô䃴;䐾ʀabios᪠ⵒⵗǈⵚlac;䅑v;樸old;榼lig;䅓Ācr⵩⵭ir;榿;쀀𝔬ͯ⵹\0\0⵼\0ⶂn;䋛ave耻ò䃲;槁Ābmⶈ෴ar;榵Ȁacitⶕ⶘ⶥⶨrò᪀Āir⶝ⶠr;榾oss;榻nå๒;槀ƀaeiⶱⶵⶹcr;䅍ga;䏉ƀcdnⷀⷅǍron;䎿;榶pf;쀀𝕠ƀaelⷔ⷗ǒr;榷rp;榹΀;adiosvⷪⷫⷮ⸈⸍⸐⸖戨rò᪆Ȁ;efmⷷⷸ⸂⸅橝rĀ;oⷾⷿ愴f»ⷿ耻ª䂪耻º䂺gof;抶r;橖lope;橗;橛ƀclo⸟⸡⸧ò⸁ash耻ø䃸l;折iŬⸯ⸴de耻õ䃵esĀ;aǛ⸺s;樶ml耻ö䃶bar;挽ૡ⹞\0⹽\0⺀⺝\0⺢⺹\0\0⻋ຜ\0⼓\0\0⼫⾼\0⿈rȀ;astЃ⹧⹲຅脀¶;l⹭⹮䂶leìЃɩ⹸\0\0⹻m;櫳;櫽y;䐿rʀcimpt⺋⺏⺓ᡥ⺗nt;䀥od;䀮il;怰enk;怱r;쀀𝔭ƀimo⺨⺰⺴Ā;v⺭⺮䏆;䏕maô੶ne;明ƀ;tv⺿⻀⻈䏀chfork»´;䏖Āau⻏⻟nĀck⻕⻝kĀ;h⇴⻛;愎ö⇴sҀ;abcdemst⻳⻴ᤈ⻹⻽⼄⼆⼊⼎䀫cir;樣ir;樢Āouᵀ⼂;樥;橲n肻±ຝim;樦wo;樧ƀipu⼙⼠⼥ntint;樕f;쀀𝕡nd耻£䂣Ԁ;Eaceinosu່⼿⽁⽄⽇⾁⾉⾒⽾⾶;檳p;檷uå໙Ā;c໎⽌̀;acens່⽙⽟⽦⽨⽾pproø⽃urlyeñ໙ñ໎ƀaes⽯⽶⽺pprox;檹qq;檵im;拨iíໟmeĀ;s⾈ຮ怲ƀEas⽸⾐⽺ð⽵ƀdfp໬⾙⾯ƀals⾠⾥⾪lar;挮ine;挒urf;挓Ā;t໻⾴ï໻rel;抰Āci⿀⿅r;쀀𝓅;䏈ncsp;怈̀fiopsu⿚⋢⿟⿥⿫⿱r;쀀𝔮pf;쀀𝕢rime;恗cr;쀀𝓆ƀaeo⿸〉〓tĀei⿾々rnionóڰnt;樖stĀ;e【】䀿ñἙô༔઀ABHabcdefhilmnoprstux぀けさすムㄎㄫㅇㅢㅲㆎ㈆㈕㈤㈩㉘㉮㉲㊐㊰㊷ƀartぇおがròႳòϝail;検aròᱥar;楤΀cdenqrtとふへみわゔヌĀeuねぱ;쀀∽̱te;䅕iãᅮmptyv;榳gȀ;del࿑らるろ;榒;榥å࿑uo耻»䂻rր;abcfhlpstw࿜ガクシスゼゾダッデナp;極Ā;f࿠ゴs;椠;椳s;椞ë≝ð✮l;楅im;楴l;憣;憝Āaiパフil;椚oĀ;nホボ戶aló༞ƀabrョリヮrò៥rk;杳ĀakンヽcĀekヹ・;䁽;䁝Āes㄂㄄;榌lĀduㄊㄌ;榎;榐Ȁaeuyㄗㄜㄧㄩron;䅙Ādiㄡㄥil;䅗ì࿲âヺ;䑀Ȁclqsㄴㄷㄽㅄa;椷dhar;楩uoĀ;rȎȍh;憳ƀacgㅎㅟངlȀ;ipsླྀㅘㅛႜnåႻarôྩt;断ƀilrㅩဣㅮsht;楽;쀀𝔯ĀaoㅷㆆrĀduㅽㅿ»ѻĀ;l႑ㆄ;楬Ā;vㆋㆌ䏁;䏱ƀgns㆕ㇹㇼht̀ahlrstㆤㆰ㇂㇘㇤㇮rrowĀ;t࿜ㆭaéトarpoonĀduㆻㆿowîㅾp»႒eftĀah㇊㇐rrowó࿪arpoonóՑightarrows;應quigarro÷ニhreetimes;拌g;䋚ingdotseñἲƀahm㈍㈐㈓rò࿪aòՑ;怏oustĀ;a㈞㈟掱che»㈟mid;櫮Ȁabpt㈲㈽㉀㉒Ānr㈷㈺g;柭r;懾rëဃƀafl㉇㉊㉎r;榆;쀀𝕣us;樮imes;樵Āap㉝㉧rĀ;g㉣㉤䀩t;榔olint;樒arò㇣Ȁachq㉻㊀Ⴜ㊅quo;怺r;쀀𝓇Ābu・㊊oĀ;rȔȓƀhir㊗㊛㊠reåㇸmes;拊iȀ;efl㊪ၙᠡ㊫方tri;槎luhar;楨;愞ൡ㋕㋛㋟㌬㌸㍱\0㍺㎤\0\0㏬㏰\0㐨㑈㑚㒭㒱㓊㓱\0㘖\0\0㘳cute;䅛quï➺Ԁ;Eaceinpsyᇭ㋳㋵㋿㌂㌋㌏㌟㌦㌩;檴ǰ㋺\0㋼;檸on;䅡uåᇾĀ;dᇳ㌇il;䅟rc;䅝ƀEas㌖㌘㌛;檶p;檺im;择olint;樓iíሄ;䑁otƀ;be㌴ᵇ㌵担;橦΀Aacmstx㍆㍊㍗㍛㍞㍣㍭rr;懘rĀhr㍐㍒ë∨Ā;oਸ਼਴t耻§䂧i;䀻war;椩mĀin㍩ðnuóñt;朶rĀ;o㍶⁕쀀𝔰Ȁacoy㎂㎆㎑㎠rp;景Āhy㎋㎏cy;䑉;䑈rtɭ㎙\0\0㎜iäᑤaraì⹯耻­䂭Āgm㎨㎴maƀ;fv㎱㎲㎲䏃;䏂Ѐ;deglnprካ㏅㏉㏎㏖㏞㏡㏦ot;橪Ā;q኱ኰĀ;E㏓㏔檞;檠Ā;E㏛㏜檝;檟e;扆lus;樤arr;楲aròᄽȀaeit㏸㐈㐏㐗Āls㏽㐄lsetmé㍪hp;樳parsl;槤Ādlᑣ㐔e;挣Ā;e㐜㐝檪Ā;s㐢㐣檬;쀀⪬︀ƀflp㐮㐳㑂tcy;䑌Ā;b㐸㐹䀯Ā;a㐾㐿槄r;挿f;쀀𝕤aĀdr㑍ЂesĀ;u㑔㑕晠it»㑕ƀcsu㑠㑹㒟Āau㑥㑯pĀ;sᆈ㑫;쀀⊓︀pĀ;sᆴ㑵;쀀⊔︀uĀbp㑿㒏ƀ;esᆗᆜ㒆etĀ;eᆗ㒍ñᆝƀ;esᆨᆭ㒖etĀ;eᆨ㒝ñᆮƀ;afᅻ㒦ְrť㒫ֱ»ᅼaròᅈȀcemt㒹㒾㓂㓅r;쀀𝓈tmîñiì㐕aræᆾĀar㓎㓕rĀ;f㓔ឿ昆Āan㓚㓭ightĀep㓣㓪psiloîỠhé⺯s»⡒ʀbcmnp㓻㕞ሉ㖋㖎Ҁ;Edemnprs㔎㔏㔑㔕㔞㔣㔬㔱㔶抂;櫅ot;檽Ā;dᇚ㔚ot;櫃ult;櫁ĀEe㔨㔪;櫋;把lus;檿arr;楹ƀeiu㔽㕒㕕tƀ;en㔎㕅㕋qĀ;qᇚ㔏eqĀ;q㔫㔨m;櫇Ābp㕚㕜;櫕;櫓c̀;acensᇭ㕬㕲㕹㕻㌦pproø㋺urlyeñᇾñᇳƀaes㖂㖈㌛pproø㌚qñ㌗g;晪ڀ123;Edehlmnps㖩㖬㖯ሜ㖲㖴㗀㗉㗕㗚㗟㗨㗭耻¹䂹耻²䂲耻³䂳;櫆Āos㖹㖼t;檾ub;櫘Ā;dሢ㗅ot;櫄sĀou㗏㗒l;柉b;櫗arr;楻ult;櫂ĀEe㗤㗦;櫌;抋lus;櫀ƀeiu㗴㘉㘌tƀ;enሜ㗼㘂qĀ;qሢ㖲eqĀ;q㗧㗤m;櫈Ābp㘑㘓;櫔;櫖ƀAan㘜㘠㘭rr;懙rĀhr㘦㘨ë∮Ā;oਫ਩war;椪lig耻ß䃟௡㙑㙝㙠ዎ㙳㙹\0㙾㛂\0\0\0\0\0㛛㜃\0㜉㝬\0\0\0㞇ɲ㙖\0\0㙛get;挖;䏄rë๟ƀaey㙦㙫㙰ron;䅥dil;䅣;䑂lrec;挕r;쀀𝔱Ȁeiko㚆㚝㚵㚼ǲ㚋\0㚑eĀ4fኄኁaƀ;sv㚘㚙㚛䎸ym;䏑Ācn㚢㚲kĀas㚨㚮pproø዁im»ኬsðኞĀas㚺㚮ð዁rn耻þ䃾Ǭ̟㛆⋧es膀×;bd㛏㛐㛘䃗Ā;aᤏ㛕r;樱;樰ƀeps㛡㛣㜀á⩍Ȁ;bcf҆㛬㛰㛴ot;挶ir;櫱Ā;o㛹㛼쀀𝕥rk;櫚á㍢rime;怴ƀaip㜏㜒㝤dåቈ΀adempst㜡㝍㝀㝑㝗㝜㝟ngleʀ;dlqr㜰㜱㜶㝀㝂斵own»ᶻeftĀ;e⠀㜾ñम;扜ightĀ;e㊪㝋ñၚot;旬inus;樺lus;樹b;槍ime;樻ezium;揢ƀcht㝲㝽㞁Āry㝷㝻;쀀𝓉;䑆cy;䑛rok;䅧Āio㞋㞎xô᝷headĀlr㞗㞠eftarro÷ࡏightarrow»ཝऀAHabcdfghlmoprstuw㟐㟓㟗㟤㟰㟼㠎㠜㠣㠴㡑㡝㡫㢩㣌㣒㣪㣶ròϭar;楣Ācr㟜㟢ute耻ú䃺òᅐrǣ㟪\0㟭y;䑞ve;䅭Āiy㟵㟺rc耻û䃻;䑃ƀabh㠃㠆㠋ròᎭlac;䅱aòᏃĀir㠓㠘sht;楾;쀀𝔲rave耻ù䃹š㠧㠱rĀlr㠬㠮»ॗ»ႃlk;斀Āct㠹㡍ɯ㠿\0\0㡊rnĀ;e㡅㡆挜r»㡆op;挏ri;旸Āal㡖㡚cr;䅫肻¨͉Āgp㡢㡦on;䅳f;쀀𝕦̀adhlsuᅋ㡸㡽፲㢑㢠ownáᎳarpoonĀlr㢈㢌efô㠭ighô㠯iƀ;hl㢙㢚㢜䏅»ᏺon»㢚parrows;懈ƀcit㢰㣄㣈ɯ㢶\0\0㣁rnĀ;e㢼㢽挝r»㢽op;挎ng;䅯ri;旹cr;쀀𝓊ƀdir㣙㣝㣢ot;拰lde;䅩iĀ;f㜰㣨»᠓Āam㣯㣲rò㢨l耻ü䃼angle;榧ހABDacdeflnoprsz㤜㤟㤩㤭㦵㦸㦽㧟㧤㧨㧳㧹㧽㨁㨠ròϷarĀ;v㤦㤧櫨;櫩asèϡĀnr㤲㤷grt;榜΀eknprst㓣㥆㥋㥒㥝㥤㦖appá␕othinçẖƀhir㓫⻈㥙opô⾵Ā;hᎷ㥢ïㆍĀiu㥩㥭gmá㎳Ābp㥲㦄setneqĀ;q㥽㦀쀀⊊︀;쀀⫋︀setneqĀ;q㦏㦒쀀⊋︀;쀀⫌︀Āhr㦛㦟etá㚜iangleĀlr㦪㦯eft»थight»ၑy;䐲ash»ံƀelr㧄㧒㧗ƀ;beⷪ㧋㧏ar;抻q;扚lip;拮Ābt㧜ᑨaòᑩr;쀀𝔳tré㦮suĀbp㧯㧱»ജ»൙pf;쀀𝕧roð໻tré㦴Ācu㨆㨋r;쀀𝓋Ābp㨐㨘nĀEe㦀㨖»㥾nĀEe㦒㨞»㦐igzag;榚΀cefoprs㨶㨻㩖㩛㩔㩡㩪irc;䅵Ādi㩀㩑Ābg㩅㩉ar;機eĀ;qᗺ㩏;扙erp;愘r;쀀𝔴pf;쀀𝕨Ā;eᑹ㩦atèᑹcr;쀀𝓌ૣណ㪇\0㪋\0㪐㪛\0\0㪝㪨㪫㪯\0\0㫃㫎\0㫘ៜ៟tré៑r;쀀𝔵ĀAa㪔㪗ròσrò৶;䎾ĀAa㪡㪤ròθrò৫að✓is;拻ƀdptឤ㪵㪾Āfl㪺ឩ;쀀𝕩imåឲĀAa㫇㫊ròώròਁĀcq㫒ីr;쀀𝓍Āpt៖㫜ré។Ѐacefiosu㫰㫽㬈㬌㬑㬕㬛㬡cĀuy㫶㫻te耻ý䃽;䑏Āiy㬂㬆rc;䅷;䑋n耻¥䂥r;쀀𝔶cy;䑗pf;쀀𝕪cr;쀀𝓎Ācm㬦㬩y;䑎l耻ÿ䃿Ԁacdefhiosw㭂㭈㭔㭘㭤㭩㭭㭴㭺㮀cute;䅺Āay㭍㭒ron;䅾;䐷ot;䅼Āet㭝㭡træᕟa;䎶r;쀀𝔷cy;䐶grarr;懝pf;쀀𝕫cr;쀀𝓏Ājn㮅㮇;怍j;怌'
      .split("")
      .map((e) => e.charCodeAt(0)),
  ),
  Ar = new Map([
    [0, 65533],
    [128, 8364],
    [130, 8218],
    [131, 402],
    [132, 8222],
    [133, 8230],
    [134, 8224],
    [135, 8225],
    [136, 710],
    [137, 8240],
    [138, 352],
    [139, 8249],
    [140, 338],
    [142, 381],
    [145, 8216],
    [146, 8217],
    [147, 8220],
    [148, 8221],
    [149, 8226],
    [150, 8211],
    [151, 8212],
    [152, 732],
    [153, 8482],
    [154, 353],
    [155, 8250],
    [156, 339],
    [158, 382],
    [159, 376],
  ]);
function pr(e) {
  var t;
  return (e >= 55296 && e <= 57343) || e > 1114111
    ? 65533
    : (t = Ar.get(e)) !== null && t !== void 0
      ? t
      : e;
}
var y;
(function (e) {
  ((e[(e.NUM = 35)] = "NUM"),
    (e[(e.SEMI = 59)] = "SEMI"),
    (e[(e.EQUALS = 61)] = "EQUALS"),
    (e[(e.ZERO = 48)] = "ZERO"),
    (e[(e.NINE = 57)] = "NINE"),
    (e[(e.LOWER_A = 97)] = "LOWER_A"),
    (e[(e.LOWER_F = 102)] = "LOWER_F"),
    (e[(e.LOWER_X = 120)] = "LOWER_X"),
    (e[(e.LOWER_Z = 122)] = "LOWER_Z"),
    (e[(e.UPPER_A = 65)] = "UPPER_A"),
    (e[(e.UPPER_F = 70)] = "UPPER_F"),
    (e[(e.UPPER_Z = 90)] = "UPPER_Z"));
})(y || (y = {}));
const Nr = 32;
var oe;
(function (e) {
  ((e[(e.VALUE_LENGTH = 49152)] = "VALUE_LENGTH"),
    (e[(e.BRANCH_LENGTH = 16256)] = "BRANCH_LENGTH"),
    (e[(e.JUMP_TABLE = 127)] = "JUMP_TABLE"));
})(oe || (oe = {}));
function Vt(e) {
  return e >= y.ZERO && e <= y.NINE;
}
function Ir(e) {
  return (e >= y.UPPER_A && e <= y.UPPER_F) || (e >= y.LOWER_A && e <= y.LOWER_F);
}
function Cr(e) {
  return (e >= y.UPPER_A && e <= y.UPPER_Z) || (e >= y.LOWER_A && e <= y.LOWER_Z) || Vt(e);
}
function gr(e) {
  return e === y.EQUALS || Cr(e);
}
var B;
(function (e) {
  ((e[(e.EntityStart = 0)] = "EntityStart"),
    (e[(e.NumericStart = 1)] = "NumericStart"),
    (e[(e.NumericDecimal = 2)] = "NumericDecimal"),
    (e[(e.NumericHex = 3)] = "NumericHex"),
    (e[(e.NamedEntity = 4)] = "NamedEntity"));
})(B || (B = {}));
var se;
(function (e) {
  ((e[(e.Legacy = 0)] = "Legacy"),
    (e[(e.Strict = 1)] = "Strict"),
    (e[(e.Attribute = 2)] = "Attribute"));
})(se || (se = {}));
class Sr {
  constructor(t, u, s) {
    ((this.decodeTree = t),
      (this.emitCodePoint = u),
      (this.errors = s),
      (this.state = B.EntityStart),
      (this.consumed = 1),
      (this.result = 0),
      (this.treeIndex = 0),
      (this.excess = 1),
      (this.decodeMode = se.Strict));
  }
  startEntity(t) {
    ((this.decodeMode = t),
      (this.state = B.EntityStart),
      (this.result = 0),
      (this.treeIndex = 0),
      (this.excess = 1),
      (this.consumed = 1));
  }
  write(t, u) {
    switch (this.state) {
      case B.EntityStart:
        return t.charCodeAt(u) === y.NUM
          ? ((this.state = B.NumericStart), (this.consumed += 1), this.stateNumericStart(t, u + 1))
          : ((this.state = B.NamedEntity), this.stateNamedEntity(t, u));
      case B.NumericStart:
        return this.stateNumericStart(t, u);
      case B.NumericDecimal:
        return this.stateNumericDecimal(t, u);
      case B.NumericHex:
        return this.stateNumericHex(t, u);
      case B.NamedEntity:
        return this.stateNamedEntity(t, u);
    }
  }
  stateNumericStart(t, u) {
    return u >= t.length
      ? -1
      : (t.charCodeAt(u) | Nr) === y.LOWER_X
        ? ((this.state = B.NumericHex), (this.consumed += 1), this.stateNumericHex(t, u + 1))
        : ((this.state = B.NumericDecimal), this.stateNumericDecimal(t, u));
  }
  addToNumericResult(t, u, s, c) {
    if (u !== s) {
      const d = s - u;
      ((this.result = this.result * Math.pow(c, d) + Number.parseInt(t.substr(u, d), c)),
        (this.consumed += d));
    }
  }
  stateNumericHex(t, u) {
    const s = u;
    for (; u < t.length; ) {
      const c = t.charCodeAt(u);
      if (Vt(c) || Ir(c)) u += 1;
      else return (this.addToNumericResult(t, s, u, 16), this.emitNumericEntity(c, 3));
    }
    return (this.addToNumericResult(t, s, u, 16), -1);
  }
  stateNumericDecimal(t, u) {
    const s = u;
    for (; u < t.length; ) {
      const c = t.charCodeAt(u);
      if (Vt(c)) u += 1;
      else return (this.addToNumericResult(t, s, u, 10), this.emitNumericEntity(c, 2));
    }
    return (this.addToNumericResult(t, s, u, 10), -1);
  }
  emitNumericEntity(t, u) {
    var s;
    if (this.consumed <= u)
      return (
        (s = this.errors) === null ||
          s === void 0 ||
          s.absenceOfDigitsInNumericCharacterReference(this.consumed),
        0
      );
    if (t === y.SEMI) this.consumed += 1;
    else if (this.decodeMode === se.Strict) return 0;
    return (
      this.emitCodePoint(pr(this.result), this.consumed),
      this.errors &&
        (t !== y.SEMI && this.errors.missingSemicolonAfterCharacterReference(),
        this.errors.validateNumericCharacterReference(this.result)),
      this.consumed
    );
  }
  stateNamedEntity(t, u) {
    const { decodeTree: s } = this;
    let c = s[this.treeIndex],
      d = (c & oe.VALUE_LENGTH) >> 14;
    for (; u < t.length; u++, this.excess++) {
      const f = t.charCodeAt(u);
      if (((this.treeIndex = Or(s, c, this.treeIndex + Math.max(1, d), f)), this.treeIndex < 0))
        return this.result === 0 || (this.decodeMode === se.Attribute && (d === 0 || gr(f)))
          ? 0
          : this.emitNotTerminatedNamedEntity();
      if (((c = s[this.treeIndex]), (d = (c & oe.VALUE_LENGTH) >> 14), d !== 0)) {
        if (f === y.SEMI)
          return this.emitNamedEntityData(this.treeIndex, d, this.consumed + this.excess);
        this.decodeMode !== se.Strict &&
          ((this.result = this.treeIndex), (this.consumed += this.excess), (this.excess = 0));
      }
    }
    return -1;
  }
  emitNotTerminatedNamedEntity() {
    var t;
    const { result: u, decodeTree: s } = this,
      c = (s[u] & oe.VALUE_LENGTH) >> 14;
    return (
      this.emitNamedEntityData(u, c, this.consumed),
      (t = this.errors) === null || t === void 0 || t.missingSemicolonAfterCharacterReference(),
      this.consumed
    );
  }
  emitNamedEntityData(t, u, s) {
    const { decodeTree: c } = this;
    return (
      this.emitCodePoint(u === 1 ? c[t] & ~oe.VALUE_LENGTH : c[t + 1], s),
      u === 3 && this.emitCodePoint(c[t + 2], s),
      s
    );
  }
  end() {
    var t;
    switch (this.state) {
      case B.NamedEntity:
        return this.result !== 0 &&
          (this.decodeMode !== se.Attribute || this.result === this.treeIndex)
          ? this.emitNotTerminatedNamedEntity()
          : 0;
      case B.NumericDecimal:
        return this.emitNumericEntity(0, 2);
      case B.NumericHex:
        return this.emitNumericEntity(0, 3);
      case B.NumericStart:
        return (
          (t = this.errors) === null ||
            t === void 0 ||
            t.absenceOfDigitsInNumericCharacterReference(this.consumed),
          0
        );
      case B.EntityStart:
        return 0;
    }
  }
}
function Or(e, t, u, s) {
  const c = (t & oe.BRANCH_LENGTH) >> 7,
    d = t & oe.JUMP_TABLE;
  if (c === 0) return d !== 0 && s === d ? u : -1;
  if (d) {
    const _ = s - d;
    return _ < 0 || _ >= c ? -1 : e[u + _] - 1;
  }
  let f = u,
    b = f + c - 1;
  for (; f <= b; ) {
    const _ = (f + b) >>> 1,
      C = e[_];
    if (C < s) f = _ + 1;
    else if (C > s) b = _ - 1;
    else return e[_ + c];
  }
  return -1;
}
var h;
(function (e) {
  ((e.HTML = "http://www.w3.org/1999/xhtml"),
    (e.MATHML = "http://www.w3.org/1998/Math/MathML"),
    (e.SVG = "http://www.w3.org/2000/svg"),
    (e.XLINK = "http://www.w3.org/1999/xlink"),
    (e.XML = "http://www.w3.org/XML/1998/namespace"),
    (e.XMLNS = "http://www.w3.org/2000/xmlns/"));
})(h || (h = {}));
var Te;
(function (e) {
  ((e.TYPE = "type"),
    (e.ACTION = "action"),
    (e.ENCODING = "encoding"),
    (e.PROMPT = "prompt"),
    (e.NAME = "name"),
    (e.COLOR = "color"),
    (e.FACE = "face"),
    (e.SIZE = "size"));
})(Te || (Te = {}));
var z;
(function (e) {
  ((e.NO_QUIRKS = "no-quirks"), (e.QUIRKS = "quirks"), (e.LIMITED_QUIRKS = "limited-quirks"));
})(z || (z = {}));
var l;
(function (e) {
  ((e.A = "a"),
    (e.ADDRESS = "address"),
    (e.ANNOTATION_XML = "annotation-xml"),
    (e.APPLET = "applet"),
    (e.AREA = "area"),
    (e.ARTICLE = "article"),
    (e.ASIDE = "aside"),
    (e.B = "b"),
    (e.BASE = "base"),
    (e.BASEFONT = "basefont"),
    (e.BGSOUND = "bgsound"),
    (e.BIG = "big"),
    (e.BLOCKQUOTE = "blockquote"),
    (e.BODY = "body"),
    (e.BR = "br"),
    (e.BUTTON = "button"),
    (e.CAPTION = "caption"),
    (e.CENTER = "center"),
    (e.CODE = "code"),
    (e.COL = "col"),
    (e.COLGROUP = "colgroup"),
    (e.DD = "dd"),
    (e.DESC = "desc"),
    (e.DETAILS = "details"),
    (e.DIALOG = "dialog"),
    (e.DIR = "dir"),
    (e.DIV = "div"),
    (e.DL = "dl"),
    (e.DT = "dt"),
    (e.EM = "em"),
    (e.EMBED = "embed"),
    (e.FIELDSET = "fieldset"),
    (e.FIGCAPTION = "figcaption"),
    (e.FIGURE = "figure"),
    (e.FONT = "font"),
    (e.FOOTER = "footer"),
    (e.FOREIGN_OBJECT = "foreignObject"),
    (e.FORM = "form"),
    (e.FRAME = "frame"),
    (e.FRAMESET = "frameset"),
    (e.H1 = "h1"),
    (e.H2 = "h2"),
    (e.H3 = "h3"),
    (e.H4 = "h4"),
    (e.H5 = "h5"),
    (e.H6 = "h6"),
    (e.HEAD = "head"),
    (e.HEADER = "header"),
    (e.HGROUP = "hgroup"),
    (e.HR = "hr"),
    (e.HTML = "html"),
    (e.I = "i"),
    (e.IMG = "img"),
    (e.IMAGE = "image"),
    (e.INPUT = "input"),
    (e.IFRAME = "iframe"),
    (e.KEYGEN = "keygen"),
    (e.LABEL = "label"),
    (e.LI = "li"),
    (e.LINK = "link"),
    (e.LISTING = "listing"),
    (e.MAIN = "main"),
    (e.MALIGNMARK = "malignmark"),
    (e.MARQUEE = "marquee"),
    (e.MATH = "math"),
    (e.MENU = "menu"),
    (e.META = "meta"),
    (e.MGLYPH = "mglyph"),
    (e.MI = "mi"),
    (e.MO = "mo"),
    (e.MN = "mn"),
    (e.MS = "ms"),
    (e.MTEXT = "mtext"),
    (e.NAV = "nav"),
    (e.NOBR = "nobr"),
    (e.NOFRAMES = "noframes"),
    (e.NOEMBED = "noembed"),
    (e.NOSCRIPT = "noscript"),
    (e.OBJECT = "object"),
    (e.OL = "ol"),
    (e.OPTGROUP = "optgroup"),
    (e.OPTION = "option"),
    (e.P = "p"),
    (e.PARAM = "param"),
    (e.PLAINTEXT = "plaintext"),
    (e.PRE = "pre"),
    (e.RB = "rb"),
    (e.RP = "rp"),
    (e.RT = "rt"),
    (e.RTC = "rtc"),
    (e.RUBY = "ruby"),
    (e.S = "s"),
    (e.SCRIPT = "script"),
    (e.SEARCH = "search"),
    (e.SECTION = "section"),
    (e.SELECT = "select"),
    (e.SOURCE = "source"),
    (e.SMALL = "small"),
    (e.SPAN = "span"),
    (e.STRIKE = "strike"),
    (e.STRONG = "strong"),
    (e.STYLE = "style"),
    (e.SUB = "sub"),
    (e.SUMMARY = "summary"),
    (e.SUP = "sup"),
    (e.TABLE = "table"),
    (e.TBODY = "tbody"),
    (e.TEMPLATE = "template"),
    (e.TEXTAREA = "textarea"),
    (e.TFOOT = "tfoot"),
    (e.TD = "td"),
    (e.TH = "th"),
    (e.THEAD = "thead"),
    (e.TITLE = "title"),
    (e.TR = "tr"),
    (e.TRACK = "track"),
    (e.TT = "tt"),
    (e.U = "u"),
    (e.UL = "ul"),
    (e.SVG = "svg"),
    (e.VAR = "var"),
    (e.WBR = "wbr"),
    (e.XMP = "xmp"));
})(l || (l = {}));
var a;
(function (e) {
  ((e[(e.UNKNOWN = 0)] = "UNKNOWN"),
    (e[(e.A = 1)] = "A"),
    (e[(e.ADDRESS = 2)] = "ADDRESS"),
    (e[(e.ANNOTATION_XML = 3)] = "ANNOTATION_XML"),
    (e[(e.APPLET = 4)] = "APPLET"),
    (e[(e.AREA = 5)] = "AREA"),
    (e[(e.ARTICLE = 6)] = "ARTICLE"),
    (e[(e.ASIDE = 7)] = "ASIDE"),
    (e[(e.B = 8)] = "B"),
    (e[(e.BASE = 9)] = "BASE"),
    (e[(e.BASEFONT = 10)] = "BASEFONT"),
    (e[(e.BGSOUND = 11)] = "BGSOUND"),
    (e[(e.BIG = 12)] = "BIG"),
    (e[(e.BLOCKQUOTE = 13)] = "BLOCKQUOTE"),
    (e[(e.BODY = 14)] = "BODY"),
    (e[(e.BR = 15)] = "BR"),
    (e[(e.BUTTON = 16)] = "BUTTON"),
    (e[(e.CAPTION = 17)] = "CAPTION"),
    (e[(e.CENTER = 18)] = "CENTER"),
    (e[(e.CODE = 19)] = "CODE"),
    (e[(e.COL = 20)] = "COL"),
    (e[(e.COLGROUP = 21)] = "COLGROUP"),
    (e[(e.DD = 22)] = "DD"),
    (e[(e.DESC = 23)] = "DESC"),
    (e[(e.DETAILS = 24)] = "DETAILS"),
    (e[(e.DIALOG = 25)] = "DIALOG"),
    (e[(e.DIR = 26)] = "DIR"),
    (e[(e.DIV = 27)] = "DIV"),
    (e[(e.DL = 28)] = "DL"),
    (e[(e.DT = 29)] = "DT"),
    (e[(e.EM = 30)] = "EM"),
    (e[(e.EMBED = 31)] = "EMBED"),
    (e[(e.FIELDSET = 32)] = "FIELDSET"),
    (e[(e.FIGCAPTION = 33)] = "FIGCAPTION"),
    (e[(e.FIGURE = 34)] = "FIGURE"),
    (e[(e.FONT = 35)] = "FONT"),
    (e[(e.FOOTER = 36)] = "FOOTER"),
    (e[(e.FOREIGN_OBJECT = 37)] = "FOREIGN_OBJECT"),
    (e[(e.FORM = 38)] = "FORM"),
    (e[(e.FRAME = 39)] = "FRAME"),
    (e[(e.FRAMESET = 40)] = "FRAMESET"),
    (e[(e.H1 = 41)] = "H1"),
    (e[(e.H2 = 42)] = "H2"),
    (e[(e.H3 = 43)] = "H3"),
    (e[(e.H4 = 44)] = "H4"),
    (e[(e.H5 = 45)] = "H5"),
    (e[(e.H6 = 46)] = "H6"),
    (e[(e.HEAD = 47)] = "HEAD"),
    (e[(e.HEADER = 48)] = "HEADER"),
    (e[(e.HGROUP = 49)] = "HGROUP"),
    (e[(e.HR = 50)] = "HR"),
    (e[(e.HTML = 51)] = "HTML"),
    (e[(e.I = 52)] = "I"),
    (e[(e.IMG = 53)] = "IMG"),
    (e[(e.IMAGE = 54)] = "IMAGE"),
    (e[(e.INPUT = 55)] = "INPUT"),
    (e[(e.IFRAME = 56)] = "IFRAME"),
    (e[(e.KEYGEN = 57)] = "KEYGEN"),
    (e[(e.LABEL = 58)] = "LABEL"),
    (e[(e.LI = 59)] = "LI"),
    (e[(e.LINK = 60)] = "LINK"),
    (e[(e.LISTING = 61)] = "LISTING"),
    (e[(e.MAIN = 62)] = "MAIN"),
    (e[(e.MALIGNMARK = 63)] = "MALIGNMARK"),
    (e[(e.MARQUEE = 64)] = "MARQUEE"),
    (e[(e.MATH = 65)] = "MATH"),
    (e[(e.MENU = 66)] = "MENU"),
    (e[(e.META = 67)] = "META"),
    (e[(e.MGLYPH = 68)] = "MGLYPH"),
    (e[(e.MI = 69)] = "MI"),
    (e[(e.MO = 70)] = "MO"),
    (e[(e.MN = 71)] = "MN"),
    (e[(e.MS = 72)] = "MS"),
    (e[(e.MTEXT = 73)] = "MTEXT"),
    (e[(e.NAV = 74)] = "NAV"),
    (e[(e.NOBR = 75)] = "NOBR"),
    (e[(e.NOFRAMES = 76)] = "NOFRAMES"),
    (e[(e.NOEMBED = 77)] = "NOEMBED"),
    (e[(e.NOSCRIPT = 78)] = "NOSCRIPT"),
    (e[(e.OBJECT = 79)] = "OBJECT"),
    (e[(e.OL = 80)] = "OL"),
    (e[(e.OPTGROUP = 81)] = "OPTGROUP"),
    (e[(e.OPTION = 82)] = "OPTION"),
    (e[(e.P = 83)] = "P"),
    (e[(e.PARAM = 84)] = "PARAM"),
    (e[(e.PLAINTEXT = 85)] = "PLAINTEXT"),
    (e[(e.PRE = 86)] = "PRE"),
    (e[(e.RB = 87)] = "RB"),
    (e[(e.RP = 88)] = "RP"),
    (e[(e.RT = 89)] = "RT"),
    (e[(e.RTC = 90)] = "RTC"),
    (e[(e.RUBY = 91)] = "RUBY"),
    (e[(e.S = 92)] = "S"),
    (e[(e.SCRIPT = 93)] = "SCRIPT"),
    (e[(e.SEARCH = 94)] = "SEARCH"),
    (e[(e.SECTION = 95)] = "SECTION"),
    (e[(e.SELECT = 96)] = "SELECT"),
    (e[(e.SOURCE = 97)] = "SOURCE"),
    (e[(e.SMALL = 98)] = "SMALL"),
    (e[(e.SPAN = 99)] = "SPAN"),
    (e[(e.STRIKE = 100)] = "STRIKE"),
    (e[(e.STRONG = 101)] = "STRONG"),
    (e[(e.STYLE = 102)] = "STYLE"),
    (e[(e.SUB = 103)] = "SUB"),
    (e[(e.SUMMARY = 104)] = "SUMMARY"),
    (e[(e.SUP = 105)] = "SUP"),
    (e[(e.TABLE = 106)] = "TABLE"),
    (e[(e.TBODY = 107)] = "TBODY"),
    (e[(e.TEMPLATE = 108)] = "TEMPLATE"),
    (e[(e.TEXTAREA = 109)] = "TEXTAREA"),
    (e[(e.TFOOT = 110)] = "TFOOT"),
    (e[(e.TD = 111)] = "TD"),
    (e[(e.TH = 112)] = "TH"),
    (e[(e.THEAD = 113)] = "THEAD"),
    (e[(e.TITLE = 114)] = "TITLE"),
    (e[(e.TR = 115)] = "TR"),
    (e[(e.TRACK = 116)] = "TRACK"),
    (e[(e.TT = 117)] = "TT"),
    (e[(e.U = 118)] = "U"),
    (e[(e.UL = 119)] = "UL"),
    (e[(e.SVG = 120)] = "SVG"),
    (e[(e.VAR = 121)] = "VAR"),
    (e[(e.WBR = 122)] = "WBR"),
    (e[(e.XMP = 123)] = "XMP"));
})(a || (a = {}));
const Lr = new Map([
  [l.A, a.A],
  [l.ADDRESS, a.ADDRESS],
  [l.ANNOTATION_XML, a.ANNOTATION_XML],
  [l.APPLET, a.APPLET],
  [l.AREA, a.AREA],
  [l.ARTICLE, a.ARTICLE],
  [l.ASIDE, a.ASIDE],
  [l.B, a.B],
  [l.BASE, a.BASE],
  [l.BASEFONT, a.BASEFONT],
  [l.BGSOUND, a.BGSOUND],
  [l.BIG, a.BIG],
  [l.BLOCKQUOTE, a.BLOCKQUOTE],
  [l.BODY, a.BODY],
  [l.BR, a.BR],
  [l.BUTTON, a.BUTTON],
  [l.CAPTION, a.CAPTION],
  [l.CENTER, a.CENTER],
  [l.CODE, a.CODE],
  [l.COL, a.COL],
  [l.COLGROUP, a.COLGROUP],
  [l.DD, a.DD],
  [l.DESC, a.DESC],
  [l.DETAILS, a.DETAILS],
  [l.DIALOG, a.DIALOG],
  [l.DIR, a.DIR],
  [l.DIV, a.DIV],
  [l.DL, a.DL],
  [l.DT, a.DT],
  [l.EM, a.EM],
  [l.EMBED, a.EMBED],
  [l.FIELDSET, a.FIELDSET],
  [l.FIGCAPTION, a.FIGCAPTION],
  [l.FIGURE, a.FIGURE],
  [l.FONT, a.FONT],
  [l.FOOTER, a.FOOTER],
  [l.FOREIGN_OBJECT, a.FOREIGN_OBJECT],
  [l.FORM, a.FORM],
  [l.FRAME, a.FRAME],
  [l.FRAMESET, a.FRAMESET],
  [l.H1, a.H1],
  [l.H2, a.H2],
  [l.H3, a.H3],
  [l.H4, a.H4],
  [l.H5, a.H5],
  [l.H6, a.H6],
  [l.HEAD, a.HEAD],
  [l.HEADER, a.HEADER],
  [l.HGROUP, a.HGROUP],
  [l.HR, a.HR],
  [l.HTML, a.HTML],
  [l.I, a.I],
  [l.IMG, a.IMG],
  [l.IMAGE, a.IMAGE],
  [l.INPUT, a.INPUT],
  [l.IFRAME, a.IFRAME],
  [l.KEYGEN, a.KEYGEN],
  [l.LABEL, a.LABEL],
  [l.LI, a.LI],
  [l.LINK, a.LINK],
  [l.LISTING, a.LISTING],
  [l.MAIN, a.MAIN],
  [l.MALIGNMARK, a.MALIGNMARK],
  [l.MARQUEE, a.MARQUEE],
  [l.MATH, a.MATH],
  [l.MENU, a.MENU],
  [l.META, a.META],
  [l.MGLYPH, a.MGLYPH],
  [l.MI, a.MI],
  [l.MO, a.MO],
  [l.MN, a.MN],
  [l.MS, a.MS],
  [l.MTEXT, a.MTEXT],
  [l.NAV, a.NAV],
  [l.NOBR, a.NOBR],
  [l.NOFRAMES, a.NOFRAMES],
  [l.NOEMBED, a.NOEMBED],
  [l.NOSCRIPT, a.NOSCRIPT],
  [l.OBJECT, a.OBJECT],
  [l.OL, a.OL],
  [l.OPTGROUP, a.OPTGROUP],
  [l.OPTION, a.OPTION],
  [l.P, a.P],
  [l.PARAM, a.PARAM],
  [l.PLAINTEXT, a.PLAINTEXT],
  [l.PRE, a.PRE],
  [l.RB, a.RB],
  [l.RP, a.RP],
  [l.RT, a.RT],
  [l.RTC, a.RTC],
  [l.RUBY, a.RUBY],
  [l.S, a.S],
  [l.SCRIPT, a.SCRIPT],
  [l.SEARCH, a.SEARCH],
  [l.SECTION, a.SECTION],
  [l.SELECT, a.SELECT],
  [l.SOURCE, a.SOURCE],
  [l.SMALL, a.SMALL],
  [l.SPAN, a.SPAN],
  [l.STRIKE, a.STRIKE],
  [l.STRONG, a.STRONG],
  [l.STYLE, a.STYLE],
  [l.SUB, a.SUB],
  [l.SUMMARY, a.SUMMARY],
  [l.SUP, a.SUP],
  [l.TABLE, a.TABLE],
  [l.TBODY, a.TBODY],
  [l.TEMPLATE, a.TEMPLATE],
  [l.TEXTAREA, a.TEXTAREA],
  [l.TFOOT, a.TFOOT],
  [l.TD, a.TD],
  [l.TH, a.TH],
  [l.THEAD, a.THEAD],
  [l.TITLE, a.TITLE],
  [l.TR, a.TR],
  [l.TRACK, a.TRACK],
  [l.TT, a.TT],
  [l.U, a.U],
  [l.UL, a.UL],
  [l.SVG, a.SVG],
  [l.VAR, a.VAR],
  [l.WBR, a.WBR],
  [l.XMP, a.XMP],
]);
function Le(e) {
  var t;
  return (t = Lr.get(e)) !== null && t !== void 0 ? t : a.UNKNOWN;
}
const m = a,
  Rr = {
    [h.HTML]: new Set([
      m.ADDRESS,
      m.APPLET,
      m.AREA,
      m.ARTICLE,
      m.ASIDE,
      m.BASE,
      m.BASEFONT,
      m.BGSOUND,
      m.BLOCKQUOTE,
      m.BODY,
      m.BR,
      m.BUTTON,
      m.CAPTION,
      m.CENTER,
      m.COL,
      m.COLGROUP,
      m.DD,
      m.DETAILS,
      m.DIR,
      m.DIV,
      m.DL,
      m.DT,
      m.EMBED,
      m.FIELDSET,
      m.FIGCAPTION,
      m.FIGURE,
      m.FOOTER,
      m.FORM,
      m.FRAME,
      m.FRAMESET,
      m.H1,
      m.H2,
      m.H3,
      m.H4,
      m.H5,
      m.H6,
      m.HEAD,
      m.HEADER,
      m.HGROUP,
      m.HR,
      m.HTML,
      m.IFRAME,
      m.IMG,
      m.INPUT,
      m.LI,
      m.LINK,
      m.LISTING,
      m.MAIN,
      m.MARQUEE,
      m.MENU,
      m.META,
      m.NAV,
      m.NOEMBED,
      m.NOFRAMES,
      m.NOSCRIPT,
      m.OBJECT,
      m.OL,
      m.P,
      m.PARAM,
      m.PLAINTEXT,
      m.PRE,
      m.SCRIPT,
      m.SECTION,
      m.SELECT,
      m.SOURCE,
      m.STYLE,
      m.SUMMARY,
      m.TABLE,
      m.TBODY,
      m.TD,
      m.TEMPLATE,
      m.TEXTAREA,
      m.TFOOT,
      m.TH,
      m.THEAD,
      m.TITLE,
      m.TR,
      m.TRACK,
      m.UL,
      m.WBR,
      m.XMP,
    ]),
    [h.MATHML]: new Set([m.MI, m.MO, m.MN, m.MS, m.MTEXT, m.ANNOTATION_XML]),
    [h.SVG]: new Set([m.TITLE, m.FOREIGN_OBJECT, m.DESC]),
    [h.XLINK]: new Set(),
    [h.XML]: new Set(),
    [h.XMLNS]: new Set(),
  },
  zt = new Set([m.H1, m.H2, m.H3, m.H4, m.H5, m.H6]);
(l.STYLE, l.SCRIPT, l.XMP, l.IFRAME, l.NOEMBED, l.NOFRAMES, l.PLAINTEXT);
var n;
(function (e) {
  ((e[(e.DATA = 0)] = "DATA"),
    (e[(e.RCDATA = 1)] = "RCDATA"),
    (e[(e.RAWTEXT = 2)] = "RAWTEXT"),
    (e[(e.SCRIPT_DATA = 3)] = "SCRIPT_DATA"),
    (e[(e.PLAINTEXT = 4)] = "PLAINTEXT"),
    (e[(e.TAG_OPEN = 5)] = "TAG_OPEN"),
    (e[(e.END_TAG_OPEN = 6)] = "END_TAG_OPEN"),
    (e[(e.TAG_NAME = 7)] = "TAG_NAME"),
    (e[(e.RCDATA_LESS_THAN_SIGN = 8)] = "RCDATA_LESS_THAN_SIGN"),
    (e[(e.RCDATA_END_TAG_OPEN = 9)] = "RCDATA_END_TAG_OPEN"),
    (e[(e.RCDATA_END_TAG_NAME = 10)] = "RCDATA_END_TAG_NAME"),
    (e[(e.RAWTEXT_LESS_THAN_SIGN = 11)] = "RAWTEXT_LESS_THAN_SIGN"),
    (e[(e.RAWTEXT_END_TAG_OPEN = 12)] = "RAWTEXT_END_TAG_OPEN"),
    (e[(e.RAWTEXT_END_TAG_NAME = 13)] = "RAWTEXT_END_TAG_NAME"),
    (e[(e.SCRIPT_DATA_LESS_THAN_SIGN = 14)] = "SCRIPT_DATA_LESS_THAN_SIGN"),
    (e[(e.SCRIPT_DATA_END_TAG_OPEN = 15)] = "SCRIPT_DATA_END_TAG_OPEN"),
    (e[(e.SCRIPT_DATA_END_TAG_NAME = 16)] = "SCRIPT_DATA_END_TAG_NAME"),
    (e[(e.SCRIPT_DATA_ESCAPE_START = 17)] = "SCRIPT_DATA_ESCAPE_START"),
    (e[(e.SCRIPT_DATA_ESCAPE_START_DASH = 18)] = "SCRIPT_DATA_ESCAPE_START_DASH"),
    (e[(e.SCRIPT_DATA_ESCAPED = 19)] = "SCRIPT_DATA_ESCAPED"),
    (e[(e.SCRIPT_DATA_ESCAPED_DASH = 20)] = "SCRIPT_DATA_ESCAPED_DASH"),
    (e[(e.SCRIPT_DATA_ESCAPED_DASH_DASH = 21)] = "SCRIPT_DATA_ESCAPED_DASH_DASH"),
    (e[(e.SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN = 22)] = "SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN"),
    (e[(e.SCRIPT_DATA_ESCAPED_END_TAG_OPEN = 23)] = "SCRIPT_DATA_ESCAPED_END_TAG_OPEN"),
    (e[(e.SCRIPT_DATA_ESCAPED_END_TAG_NAME = 24)] = "SCRIPT_DATA_ESCAPED_END_TAG_NAME"),
    (e[(e.SCRIPT_DATA_DOUBLE_ESCAPE_START = 25)] = "SCRIPT_DATA_DOUBLE_ESCAPE_START"),
    (e[(e.SCRIPT_DATA_DOUBLE_ESCAPED = 26)] = "SCRIPT_DATA_DOUBLE_ESCAPED"),
    (e[(e.SCRIPT_DATA_DOUBLE_ESCAPED_DASH = 27)] = "SCRIPT_DATA_DOUBLE_ESCAPED_DASH"),
    (e[(e.SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH = 28)] = "SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH"),
    (e[(e.SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN = 29)] =
      "SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN"),
    (e[(e.SCRIPT_DATA_DOUBLE_ESCAPE_END = 30)] = "SCRIPT_DATA_DOUBLE_ESCAPE_END"),
    (e[(e.BEFORE_ATTRIBUTE_NAME = 31)] = "BEFORE_ATTRIBUTE_NAME"),
    (e[(e.ATTRIBUTE_NAME = 32)] = "ATTRIBUTE_NAME"),
    (e[(e.AFTER_ATTRIBUTE_NAME = 33)] = "AFTER_ATTRIBUTE_NAME"),
    (e[(e.BEFORE_ATTRIBUTE_VALUE = 34)] = "BEFORE_ATTRIBUTE_VALUE"),
    (e[(e.ATTRIBUTE_VALUE_DOUBLE_QUOTED = 35)] = "ATTRIBUTE_VALUE_DOUBLE_QUOTED"),
    (e[(e.ATTRIBUTE_VALUE_SINGLE_QUOTED = 36)] = "ATTRIBUTE_VALUE_SINGLE_QUOTED"),
    (e[(e.ATTRIBUTE_VALUE_UNQUOTED = 37)] = "ATTRIBUTE_VALUE_UNQUOTED"),
    (e[(e.AFTER_ATTRIBUTE_VALUE_QUOTED = 38)] = "AFTER_ATTRIBUTE_VALUE_QUOTED"),
    (e[(e.SELF_CLOSING_START_TAG = 39)] = "SELF_CLOSING_START_TAG"),
    (e[(e.BOGUS_COMMENT = 40)] = "BOGUS_COMMENT"),
    (e[(e.MARKUP_DECLARATION_OPEN = 41)] = "MARKUP_DECLARATION_OPEN"),
    (e[(e.COMMENT_START = 42)] = "COMMENT_START"),
    (e[(e.COMMENT_START_DASH = 43)] = "COMMENT_START_DASH"),
    (e[(e.COMMENT = 44)] = "COMMENT"),
    (e[(e.COMMENT_LESS_THAN_SIGN = 45)] = "COMMENT_LESS_THAN_SIGN"),
    (e[(e.COMMENT_LESS_THAN_SIGN_BANG = 46)] = "COMMENT_LESS_THAN_SIGN_BANG"),
    (e[(e.COMMENT_LESS_THAN_SIGN_BANG_DASH = 47)] = "COMMENT_LESS_THAN_SIGN_BANG_DASH"),
    (e[(e.COMMENT_LESS_THAN_SIGN_BANG_DASH_DASH = 48)] = "COMMENT_LESS_THAN_SIGN_BANG_DASH_DASH"),
    (e[(e.COMMENT_END_DASH = 49)] = "COMMENT_END_DASH"),
    (e[(e.COMMENT_END = 50)] = "COMMENT_END"),
    (e[(e.COMMENT_END_BANG = 51)] = "COMMENT_END_BANG"),
    (e[(e.DOCTYPE = 52)] = "DOCTYPE"),
    (e[(e.BEFORE_DOCTYPE_NAME = 53)] = "BEFORE_DOCTYPE_NAME"),
    (e[(e.DOCTYPE_NAME = 54)] = "DOCTYPE_NAME"),
    (e[(e.AFTER_DOCTYPE_NAME = 55)] = "AFTER_DOCTYPE_NAME"),
    (e[(e.AFTER_DOCTYPE_PUBLIC_KEYWORD = 56)] = "AFTER_DOCTYPE_PUBLIC_KEYWORD"),
    (e[(e.BEFORE_DOCTYPE_PUBLIC_IDENTIFIER = 57)] = "BEFORE_DOCTYPE_PUBLIC_IDENTIFIER"),
    (e[(e.DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED = 58)] =
      "DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED"),
    (e[(e.DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED = 59)] =
      "DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED"),
    (e[(e.AFTER_DOCTYPE_PUBLIC_IDENTIFIER = 60)] = "AFTER_DOCTYPE_PUBLIC_IDENTIFIER"),
    (e[(e.BETWEEN_DOCTYPE_PUBLIC_AND_SYSTEM_IDENTIFIERS = 61)] =
      "BETWEEN_DOCTYPE_PUBLIC_AND_SYSTEM_IDENTIFIERS"),
    (e[(e.AFTER_DOCTYPE_SYSTEM_KEYWORD = 62)] = "AFTER_DOCTYPE_SYSTEM_KEYWORD"),
    (e[(e.BEFORE_DOCTYPE_SYSTEM_IDENTIFIER = 63)] = "BEFORE_DOCTYPE_SYSTEM_IDENTIFIER"),
    (e[(e.DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED = 64)] =
      "DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED"),
    (e[(e.DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED = 65)] =
      "DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED"),
    (e[(e.AFTER_DOCTYPE_SYSTEM_IDENTIFIER = 66)] = "AFTER_DOCTYPE_SYSTEM_IDENTIFIER"),
    (e[(e.BOGUS_DOCTYPE = 67)] = "BOGUS_DOCTYPE"),
    (e[(e.CDATA_SECTION = 68)] = "CDATA_SECTION"),
    (e[(e.CDATA_SECTION_BRACKET = 69)] = "CDATA_SECTION_BRACKET"),
    (e[(e.CDATA_SECTION_END = 70)] = "CDATA_SECTION_END"),
    (e[(e.CHARACTER_REFERENCE = 71)] = "CHARACTER_REFERENCE"),
    (e[(e.AMBIGUOUS_AMPERSAND = 72)] = "AMBIGUOUS_AMPERSAND"));
})(n || (n = {}));
const R = {
  DATA: n.DATA,
  RCDATA: n.RCDATA,
  RAWTEXT: n.RAWTEXT,
  SCRIPT_DATA: n.SCRIPT_DATA,
  PLAINTEXT: n.PLAINTEXT,
  CDATA_SECTION: n.CDATA_SECTION,
};
function Dr(e) {
  return e >= r.DIGIT_0 && e <= r.DIGIT_9;
}
function Ge(e) {
  return e >= r.LATIN_CAPITAL_A && e <= r.LATIN_CAPITAL_Z;
}
function Pr(e) {
  return e >= r.LATIN_SMALL_A && e <= r.LATIN_SMALL_Z;
}
function ie(e) {
  return Pr(e) || Ge(e);
}
function Ju(e) {
  return ie(e) || Dr(e);
}
function dt(e) {
  return e + 32;
}
function ga(e) {
  return e === r.SPACE || e === r.LINE_FEED || e === r.TABULATION || e === r.FORM_FEED;
}
function $u(e) {
  return ga(e) || e === r.SOLIDUS || e === r.GREATER_THAN_SIGN;
}
function Mr(e) {
  return e === r.NULL
    ? E.nullCharacterReference
    : e > 1114111
      ? E.characterReferenceOutsideUnicodeRange
      : pa(e)
        ? E.surrogateCharacterReference
        : Ia(e)
          ? E.noncharacterCharacterReference
          : Na(e) || e === r.CARRIAGE_RETURN
            ? E.controlCharacterReference
            : null;
}
class xr {
  constructor(t, u) {
    ((this.options = t),
      (this.handler = u),
      (this.paused = !1),
      (this.inLoop = !1),
      (this.inForeignNode = !1),
      (this.lastStartTagName = ""),
      (this.active = !1),
      (this.state = n.DATA),
      (this.returnState = n.DATA),
      (this.entityStartPos = 0),
      (this.consumedAfterSnapshot = -1),
      (this.currentCharacterToken = null),
      (this.currentToken = null),
      (this.currentAttr = { name: "", value: "" }),
      (this.preprocessor = new _r(u)),
      (this.currentLocation = this.getCurrentLocation(-1)),
      (this.entityDecoder = new Sr(
        br,
        (s, c) => {
          ((this.preprocessor.pos = this.entityStartPos + c - 1),
            this._flushCodePointConsumedAsCharacterReference(s));
        },
        u.onParseError
          ? {
              missingSemicolonAfterCharacterReference: () => {
                this._err(E.missingSemicolonAfterCharacterReference, 1);
              },
              absenceOfDigitsInNumericCharacterReference: (s) => {
                this._err(
                  E.absenceOfDigitsInNumericCharacterReference,
                  this.entityStartPos - this.preprocessor.pos + s,
                );
              },
              validateNumericCharacterReference: (s) => {
                const c = Mr(s);
                c && this._err(c, 1);
              },
            }
          : void 0,
      )));
  }
  _err(t, u = 0) {
    var s, c;
    (c = (s = this.handler).onParseError) === null ||
      c === void 0 ||
      c.call(s, this.preprocessor.getError(t, u));
  }
  getCurrentLocation(t) {
    return this.options.sourceCodeLocationInfo
      ? {
          startLine: this.preprocessor.line,
          startCol: this.preprocessor.col - t,
          startOffset: this.preprocessor.offset - t,
          endLine: -1,
          endCol: -1,
          endOffset: -1,
        }
      : null;
  }
  _runParsingLoop() {
    if (!this.inLoop) {
      for (this.inLoop = !0; this.active && !this.paused; ) {
        this.consumedAfterSnapshot = 0;
        const t = this._consume();
        this._ensureHibernation() || this._callState(t);
      }
      this.inLoop = !1;
    }
  }
  pause() {
    this.paused = !0;
  }
  resume(t) {
    if (!this.paused) throw new Error("Parser was already resumed");
    ((this.paused = !1), !this.inLoop && (this._runParsingLoop(), this.paused || t == null || t()));
  }
  write(t, u, s) {
    ((this.active = !0),
      this.preprocessor.write(t, u),
      this._runParsingLoop(),
      this.paused || s == null || s());
  }
  insertHtmlAtCurrentPos(t) {
    ((this.active = !0), this.preprocessor.insertHtmlAtCurrentPos(t), this._runParsingLoop());
  }
  _ensureHibernation() {
    return this.preprocessor.endOfChunkHit
      ? (this.preprocessor.retreat(this.consumedAfterSnapshot),
        (this.consumedAfterSnapshot = 0),
        (this.active = !1),
        !0)
      : !1;
  }
  _consume() {
    return (this.consumedAfterSnapshot++, this.preprocessor.advance());
  }
  _advanceBy(t) {
    this.consumedAfterSnapshot += t;
    for (let u = 0; u < t; u++) this.preprocessor.advance();
  }
  _consumeSequenceIfMatch(t, u) {
    return this.preprocessor.startsWith(t, u) ? (this._advanceBy(t.length - 1), !0) : !1;
  }
  _createStartTagToken() {
    this.currentToken = {
      type: I.START_TAG,
      tagName: "",
      tagID: a.UNKNOWN,
      selfClosing: !1,
      ackSelfClosing: !1,
      attrs: [],
      location: this.getCurrentLocation(1),
    };
  }
  _createEndTagToken() {
    this.currentToken = {
      type: I.END_TAG,
      tagName: "",
      tagID: a.UNKNOWN,
      selfClosing: !1,
      ackSelfClosing: !1,
      attrs: [],
      location: this.getCurrentLocation(2),
    };
  }
  _createCommentToken(t) {
    this.currentToken = { type: I.COMMENT, data: "", location: this.getCurrentLocation(t) };
  }
  _createDoctypeToken(t) {
    this.currentToken = {
      type: I.DOCTYPE,
      name: t,
      forceQuirks: !1,
      publicId: null,
      systemId: null,
      location: this.currentLocation,
    };
  }
  _createCharacterToken(t, u) {
    this.currentCharacterToken = { type: t, chars: u, location: this.currentLocation };
  }
  _createAttr(t) {
    ((this.currentAttr = { name: t, value: "" }),
      (this.currentLocation = this.getCurrentLocation(0)));
  }
  _leaveAttrName() {
    var t, u;
    const s = this.currentToken;
    if (Ca(s, this.currentAttr.name) === null) {
      if ((s.attrs.push(this.currentAttr), s.location && this.currentLocation)) {
        const c =
          (t = (u = s.location).attrs) !== null && t !== void 0
            ? t
            : (u.attrs = Object.create(null));
        ((c[this.currentAttr.name] = this.currentLocation), this._leaveAttrValue());
      }
    } else this._err(E.duplicateAttribute);
  }
  _leaveAttrValue() {
    this.currentLocation &&
      ((this.currentLocation.endLine = this.preprocessor.line),
      (this.currentLocation.endCol = this.preprocessor.col),
      (this.currentLocation.endOffset = this.preprocessor.offset));
  }
  prepareToken(t) {
    (this._emitCurrentCharacterToken(t.location),
      (this.currentToken = null),
      t.location &&
        ((t.location.endLine = this.preprocessor.line),
        (t.location.endCol = this.preprocessor.col + 1),
        (t.location.endOffset = this.preprocessor.offset + 1)),
      (this.currentLocation = this.getCurrentLocation(-1)));
  }
  emitCurrentTagToken() {
    const t = this.currentToken;
    (this.prepareToken(t),
      (t.tagID = Le(t.tagName)),
      t.type === I.START_TAG
        ? ((this.lastStartTagName = t.tagName), this.handler.onStartTag(t))
        : (t.attrs.length > 0 && this._err(E.endTagWithAttributes),
          t.selfClosing && this._err(E.endTagWithTrailingSolidus),
          this.handler.onEndTag(t)),
      this.preprocessor.dropParsedChunk());
  }
  emitCurrentComment(t) {
    (this.prepareToken(t), this.handler.onComment(t), this.preprocessor.dropParsedChunk());
  }
  emitCurrentDoctype(t) {
    (this.prepareToken(t), this.handler.onDoctype(t), this.preprocessor.dropParsedChunk());
  }
  _emitCurrentCharacterToken(t) {
    if (this.currentCharacterToken) {
      switch (
        (t &&
          this.currentCharacterToken.location &&
          ((this.currentCharacterToken.location.endLine = t.startLine),
          (this.currentCharacterToken.location.endCol = t.startCol),
          (this.currentCharacterToken.location.endOffset = t.startOffset)),
        this.currentCharacterToken.type)
      ) {
        case I.CHARACTER: {
          this.handler.onCharacter(this.currentCharacterToken);
          break;
        }
        case I.NULL_CHARACTER: {
          this.handler.onNullCharacter(this.currentCharacterToken);
          break;
        }
        case I.WHITESPACE_CHARACTER: {
          this.handler.onWhitespaceCharacter(this.currentCharacterToken);
          break;
        }
      }
      this.currentCharacterToken = null;
    }
  }
  _emitEOFToken() {
    const t = this.getCurrentLocation(0);
    (t && ((t.endLine = t.startLine), (t.endCol = t.startCol), (t.endOffset = t.startOffset)),
      this._emitCurrentCharacterToken(t),
      this.handler.onEof({ type: I.EOF, location: t }),
      (this.active = !1));
  }
  _appendCharToCurrentCharacterToken(t, u) {
    if (this.currentCharacterToken)
      if (this.currentCharacterToken.type === t) {
        this.currentCharacterToken.chars += u;
        return;
      } else
        ((this.currentLocation = this.getCurrentLocation(0)),
          this._emitCurrentCharacterToken(this.currentLocation),
          this.preprocessor.dropParsedChunk());
    this._createCharacterToken(t, u);
  }
  _emitCodePoint(t) {
    const u = ga(t) ? I.WHITESPACE_CHARACTER : t === r.NULL ? I.NULL_CHARACTER : I.CHARACTER;
    this._appendCharToCurrentCharacterToken(u, String.fromCodePoint(t));
  }
  _emitChars(t) {
    this._appendCharToCurrentCharacterToken(I.CHARACTER, t);
  }
  _startCharacterReference() {
    ((this.returnState = this.state),
      (this.state = n.CHARACTER_REFERENCE),
      (this.entityStartPos = this.preprocessor.pos),
      this.entityDecoder.startEntity(
        this._isCharacterReferenceInAttribute() ? se.Attribute : se.Legacy,
      ));
  }
  _isCharacterReferenceInAttribute() {
    return (
      this.returnState === n.ATTRIBUTE_VALUE_DOUBLE_QUOTED ||
      this.returnState === n.ATTRIBUTE_VALUE_SINGLE_QUOTED ||
      this.returnState === n.ATTRIBUTE_VALUE_UNQUOTED
    );
  }
  _flushCodePointConsumedAsCharacterReference(t) {
    this._isCharacterReferenceInAttribute()
      ? (this.currentAttr.value += String.fromCodePoint(t))
      : this._emitCodePoint(t);
  }
  _callState(t) {
    switch (this.state) {
      case n.DATA: {
        this._stateData(t);
        break;
      }
      case n.RCDATA: {
        this._stateRcdata(t);
        break;
      }
      case n.RAWTEXT: {
        this._stateRawtext(t);
        break;
      }
      case n.SCRIPT_DATA: {
        this._stateScriptData(t);
        break;
      }
      case n.PLAINTEXT: {
        this._statePlaintext(t);
        break;
      }
      case n.TAG_OPEN: {
        this._stateTagOpen(t);
        break;
      }
      case n.END_TAG_OPEN: {
        this._stateEndTagOpen(t);
        break;
      }
      case n.TAG_NAME: {
        this._stateTagName(t);
        break;
      }
      case n.RCDATA_LESS_THAN_SIGN: {
        this._stateRcdataLessThanSign(t);
        break;
      }
      case n.RCDATA_END_TAG_OPEN: {
        this._stateRcdataEndTagOpen(t);
        break;
      }
      case n.RCDATA_END_TAG_NAME: {
        this._stateRcdataEndTagName(t);
        break;
      }
      case n.RAWTEXT_LESS_THAN_SIGN: {
        this._stateRawtextLessThanSign(t);
        break;
      }
      case n.RAWTEXT_END_TAG_OPEN: {
        this._stateRawtextEndTagOpen(t);
        break;
      }
      case n.RAWTEXT_END_TAG_NAME: {
        this._stateRawtextEndTagName(t);
        break;
      }
      case n.SCRIPT_DATA_LESS_THAN_SIGN: {
        this._stateScriptDataLessThanSign(t);
        break;
      }
      case n.SCRIPT_DATA_END_TAG_OPEN: {
        this._stateScriptDataEndTagOpen(t);
        break;
      }
      case n.SCRIPT_DATA_END_TAG_NAME: {
        this._stateScriptDataEndTagName(t);
        break;
      }
      case n.SCRIPT_DATA_ESCAPE_START: {
        this._stateScriptDataEscapeStart(t);
        break;
      }
      case n.SCRIPT_DATA_ESCAPE_START_DASH: {
        this._stateScriptDataEscapeStartDash(t);
        break;
      }
      case n.SCRIPT_DATA_ESCAPED: {
        this._stateScriptDataEscaped(t);
        break;
      }
      case n.SCRIPT_DATA_ESCAPED_DASH: {
        this._stateScriptDataEscapedDash(t);
        break;
      }
      case n.SCRIPT_DATA_ESCAPED_DASH_DASH: {
        this._stateScriptDataEscapedDashDash(t);
        break;
      }
      case n.SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN: {
        this._stateScriptDataEscapedLessThanSign(t);
        break;
      }
      case n.SCRIPT_DATA_ESCAPED_END_TAG_OPEN: {
        this._stateScriptDataEscapedEndTagOpen(t);
        break;
      }
      case n.SCRIPT_DATA_ESCAPED_END_TAG_NAME: {
        this._stateScriptDataEscapedEndTagName(t);
        break;
      }
      case n.SCRIPT_DATA_DOUBLE_ESCAPE_START: {
        this._stateScriptDataDoubleEscapeStart(t);
        break;
      }
      case n.SCRIPT_DATA_DOUBLE_ESCAPED: {
        this._stateScriptDataDoubleEscaped(t);
        break;
      }
      case n.SCRIPT_DATA_DOUBLE_ESCAPED_DASH: {
        this._stateScriptDataDoubleEscapedDash(t);
        break;
      }
      case n.SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH: {
        this._stateScriptDataDoubleEscapedDashDash(t);
        break;
      }
      case n.SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN: {
        this._stateScriptDataDoubleEscapedLessThanSign(t);
        break;
      }
      case n.SCRIPT_DATA_DOUBLE_ESCAPE_END: {
        this._stateScriptDataDoubleEscapeEnd(t);
        break;
      }
      case n.BEFORE_ATTRIBUTE_NAME: {
        this._stateBeforeAttributeName(t);
        break;
      }
      case n.ATTRIBUTE_NAME: {
        this._stateAttributeName(t);
        break;
      }
      case n.AFTER_ATTRIBUTE_NAME: {
        this._stateAfterAttributeName(t);
        break;
      }
      case n.BEFORE_ATTRIBUTE_VALUE: {
        this._stateBeforeAttributeValue(t);
        break;
      }
      case n.ATTRIBUTE_VALUE_DOUBLE_QUOTED: {
        this._stateAttributeValueDoubleQuoted(t);
        break;
      }
      case n.ATTRIBUTE_VALUE_SINGLE_QUOTED: {
        this._stateAttributeValueSingleQuoted(t);
        break;
      }
      case n.ATTRIBUTE_VALUE_UNQUOTED: {
        this._stateAttributeValueUnquoted(t);
        break;
      }
      case n.AFTER_ATTRIBUTE_VALUE_QUOTED: {
        this._stateAfterAttributeValueQuoted(t);
        break;
      }
      case n.SELF_CLOSING_START_TAG: {
        this._stateSelfClosingStartTag(t);
        break;
      }
      case n.BOGUS_COMMENT: {
        this._stateBogusComment(t);
        break;
      }
      case n.MARKUP_DECLARATION_OPEN: {
        this._stateMarkupDeclarationOpen(t);
        break;
      }
      case n.COMMENT_START: {
        this._stateCommentStart(t);
        break;
      }
      case n.COMMENT_START_DASH: {
        this._stateCommentStartDash(t);
        break;
      }
      case n.COMMENT: {
        this._stateComment(t);
        break;
      }
      case n.COMMENT_LESS_THAN_SIGN: {
        this._stateCommentLessThanSign(t);
        break;
      }
      case n.COMMENT_LESS_THAN_SIGN_BANG: {
        this._stateCommentLessThanSignBang(t);
        break;
      }
      case n.COMMENT_LESS_THAN_SIGN_BANG_DASH: {
        this._stateCommentLessThanSignBangDash(t);
        break;
      }
      case n.COMMENT_LESS_THAN_SIGN_BANG_DASH_DASH: {
        this._stateCommentLessThanSignBangDashDash(t);
        break;
      }
      case n.COMMENT_END_DASH: {
        this._stateCommentEndDash(t);
        break;
      }
      case n.COMMENT_END: {
        this._stateCommentEnd(t);
        break;
      }
      case n.COMMENT_END_BANG: {
        this._stateCommentEndBang(t);
        break;
      }
      case n.DOCTYPE: {
        this._stateDoctype(t);
        break;
      }
      case n.BEFORE_DOCTYPE_NAME: {
        this._stateBeforeDoctypeName(t);
        break;
      }
      case n.DOCTYPE_NAME: {
        this._stateDoctypeName(t);
        break;
      }
      case n.AFTER_DOCTYPE_NAME: {
        this._stateAfterDoctypeName(t);
        break;
      }
      case n.AFTER_DOCTYPE_PUBLIC_KEYWORD: {
        this._stateAfterDoctypePublicKeyword(t);
        break;
      }
      case n.BEFORE_DOCTYPE_PUBLIC_IDENTIFIER: {
        this._stateBeforeDoctypePublicIdentifier(t);
        break;
      }
      case n.DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED: {
        this._stateDoctypePublicIdentifierDoubleQuoted(t);
        break;
      }
      case n.DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED: {
        this._stateDoctypePublicIdentifierSingleQuoted(t);
        break;
      }
      case n.AFTER_DOCTYPE_PUBLIC_IDENTIFIER: {
        this._stateAfterDoctypePublicIdentifier(t);
        break;
      }
      case n.BETWEEN_DOCTYPE_PUBLIC_AND_SYSTEM_IDENTIFIERS: {
        this._stateBetweenDoctypePublicAndSystemIdentifiers(t);
        break;
      }
      case n.AFTER_DOCTYPE_SYSTEM_KEYWORD: {
        this._stateAfterDoctypeSystemKeyword(t);
        break;
      }
      case n.BEFORE_DOCTYPE_SYSTEM_IDENTIFIER: {
        this._stateBeforeDoctypeSystemIdentifier(t);
        break;
      }
      case n.DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED: {
        this._stateDoctypeSystemIdentifierDoubleQuoted(t);
        break;
      }
      case n.DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED: {
        this._stateDoctypeSystemIdentifierSingleQuoted(t);
        break;
      }
      case n.AFTER_DOCTYPE_SYSTEM_IDENTIFIER: {
        this._stateAfterDoctypeSystemIdentifier(t);
        break;
      }
      case n.BOGUS_DOCTYPE: {
        this._stateBogusDoctype(t);
        break;
      }
      case n.CDATA_SECTION: {
        this._stateCdataSection(t);
        break;
      }
      case n.CDATA_SECTION_BRACKET: {
        this._stateCdataSectionBracket(t);
        break;
      }
      case n.CDATA_SECTION_END: {
        this._stateCdataSectionEnd(t);
        break;
      }
      case n.CHARACTER_REFERENCE: {
        this._stateCharacterReference();
        break;
      }
      case n.AMBIGUOUS_AMPERSAND: {
        this._stateAmbiguousAmpersand(t);
        break;
      }
      default:
        throw new Error("Unknown state");
    }
  }
  _stateData(t) {
    switch (t) {
      case r.LESS_THAN_SIGN: {
        this.state = n.TAG_OPEN;
        break;
      }
      case r.AMPERSAND: {
        this._startCharacterReference();
        break;
      }
      case r.NULL: {
        (this._err(E.unexpectedNullCharacter), this._emitCodePoint(t));
        break;
      }
      case r.EOF: {
        this._emitEOFToken();
        break;
      }
      default:
        this._emitCodePoint(t);
    }
  }
  _stateRcdata(t) {
    switch (t) {
      case r.AMPERSAND: {
        this._startCharacterReference();
        break;
      }
      case r.LESS_THAN_SIGN: {
        this.state = n.RCDATA_LESS_THAN_SIGN;
        break;
      }
      case r.NULL: {
        (this._err(E.unexpectedNullCharacter), this._emitChars(S));
        break;
      }
      case r.EOF: {
        this._emitEOFToken();
        break;
      }
      default:
        this._emitCodePoint(t);
    }
  }
  _stateRawtext(t) {
    switch (t) {
      case r.LESS_THAN_SIGN: {
        this.state = n.RAWTEXT_LESS_THAN_SIGN;
        break;
      }
      case r.NULL: {
        (this._err(E.unexpectedNullCharacter), this._emitChars(S));
        break;
      }
      case r.EOF: {
        this._emitEOFToken();
        break;
      }
      default:
        this._emitCodePoint(t);
    }
  }
  _stateScriptData(t) {
    switch (t) {
      case r.LESS_THAN_SIGN: {
        this.state = n.SCRIPT_DATA_LESS_THAN_SIGN;
        break;
      }
      case r.NULL: {
        (this._err(E.unexpectedNullCharacter), this._emitChars(S));
        break;
      }
      case r.EOF: {
        this._emitEOFToken();
        break;
      }
      default:
        this._emitCodePoint(t);
    }
  }
  _statePlaintext(t) {
    switch (t) {
      case r.NULL: {
        (this._err(E.unexpectedNullCharacter), this._emitChars(S));
        break;
      }
      case r.EOF: {
        this._emitEOFToken();
        break;
      }
      default:
        this._emitCodePoint(t);
    }
  }
  _stateTagOpen(t) {
    if (ie(t)) (this._createStartTagToken(), (this.state = n.TAG_NAME), this._stateTagName(t));
    else
      switch (t) {
        case r.EXCLAMATION_MARK: {
          this.state = n.MARKUP_DECLARATION_OPEN;
          break;
        }
        case r.SOLIDUS: {
          this.state = n.END_TAG_OPEN;
          break;
        }
        case r.QUESTION_MARK: {
          (this._err(E.unexpectedQuestionMarkInsteadOfTagName),
            this._createCommentToken(1),
            (this.state = n.BOGUS_COMMENT),
            this._stateBogusComment(t));
          break;
        }
        case r.EOF: {
          (this._err(E.eofBeforeTagName), this._emitChars("<"), this._emitEOFToken());
          break;
        }
        default:
          (this._err(E.invalidFirstCharacterOfTagName),
            this._emitChars("<"),
            (this.state = n.DATA),
            this._stateData(t));
      }
  }
  _stateEndTagOpen(t) {
    if (ie(t)) (this._createEndTagToken(), (this.state = n.TAG_NAME), this._stateTagName(t));
    else
      switch (t) {
        case r.GREATER_THAN_SIGN: {
          (this._err(E.missingEndTagName), (this.state = n.DATA));
          break;
        }
        case r.EOF: {
          (this._err(E.eofBeforeTagName), this._emitChars("</"), this._emitEOFToken());
          break;
        }
        default:
          (this._err(E.invalidFirstCharacterOfTagName),
            this._createCommentToken(2),
            (this.state = n.BOGUS_COMMENT),
            this._stateBogusComment(t));
      }
  }
  _stateTagName(t) {
    const u = this.currentToken;
    switch (t) {
      case r.SPACE:
      case r.LINE_FEED:
      case r.TABULATION:
      case r.FORM_FEED: {
        this.state = n.BEFORE_ATTRIBUTE_NAME;
        break;
      }
      case r.SOLIDUS: {
        this.state = n.SELF_CLOSING_START_TAG;
        break;
      }
      case r.GREATER_THAN_SIGN: {
        ((this.state = n.DATA), this.emitCurrentTagToken());
        break;
      }
      case r.NULL: {
        (this._err(E.unexpectedNullCharacter), (u.tagName += S));
        break;
      }
      case r.EOF: {
        (this._err(E.eofInTag), this._emitEOFToken());
        break;
      }
      default:
        u.tagName += String.fromCodePoint(Ge(t) ? dt(t) : t);
    }
  }
  _stateRcdataLessThanSign(t) {
    t === r.SOLIDUS
      ? (this.state = n.RCDATA_END_TAG_OPEN)
      : (this._emitChars("<"), (this.state = n.RCDATA), this._stateRcdata(t));
  }
  _stateRcdataEndTagOpen(t) {
    ie(t)
      ? ((this.state = n.RCDATA_END_TAG_NAME), this._stateRcdataEndTagName(t))
      : (this._emitChars("</"), (this.state = n.RCDATA), this._stateRcdata(t));
  }
  handleSpecialEndTag(t) {
    if (!this.preprocessor.startsWith(this.lastStartTagName, !1)) return !this._ensureHibernation();
    this._createEndTagToken();
    const u = this.currentToken;
    switch (
      ((u.tagName = this.lastStartTagName), this.preprocessor.peek(this.lastStartTagName.length))
    ) {
      case r.SPACE:
      case r.LINE_FEED:
      case r.TABULATION:
      case r.FORM_FEED:
        return (
          this._advanceBy(this.lastStartTagName.length),
          (this.state = n.BEFORE_ATTRIBUTE_NAME),
          !1
        );
      case r.SOLIDUS:
        return (
          this._advanceBy(this.lastStartTagName.length),
          (this.state = n.SELF_CLOSING_START_TAG),
          !1
        );
      case r.GREATER_THAN_SIGN:
        return (
          this._advanceBy(this.lastStartTagName.length),
          this.emitCurrentTagToken(),
          (this.state = n.DATA),
          !1
        );
      default:
        return !this._ensureHibernation();
    }
  }
  _stateRcdataEndTagName(t) {
    this.handleSpecialEndTag(t) &&
      (this._emitChars("</"), (this.state = n.RCDATA), this._stateRcdata(t));
  }
  _stateRawtextLessThanSign(t) {
    t === r.SOLIDUS
      ? (this.state = n.RAWTEXT_END_TAG_OPEN)
      : (this._emitChars("<"), (this.state = n.RAWTEXT), this._stateRawtext(t));
  }
  _stateRawtextEndTagOpen(t) {
    ie(t)
      ? ((this.state = n.RAWTEXT_END_TAG_NAME), this._stateRawtextEndTagName(t))
      : (this._emitChars("</"), (this.state = n.RAWTEXT), this._stateRawtext(t));
  }
  _stateRawtextEndTagName(t) {
    this.handleSpecialEndTag(t) &&
      (this._emitChars("</"), (this.state = n.RAWTEXT), this._stateRawtext(t));
  }
  _stateScriptDataLessThanSign(t) {
    switch (t) {
      case r.SOLIDUS: {
        this.state = n.SCRIPT_DATA_END_TAG_OPEN;
        break;
      }
      case r.EXCLAMATION_MARK: {
        ((this.state = n.SCRIPT_DATA_ESCAPE_START), this._emitChars("<!"));
        break;
      }
      default:
        (this._emitChars("<"), (this.state = n.SCRIPT_DATA), this._stateScriptData(t));
    }
  }
  _stateScriptDataEndTagOpen(t) {
    ie(t)
      ? ((this.state = n.SCRIPT_DATA_END_TAG_NAME), this._stateScriptDataEndTagName(t))
      : (this._emitChars("</"), (this.state = n.SCRIPT_DATA), this._stateScriptData(t));
  }
  _stateScriptDataEndTagName(t) {
    this.handleSpecialEndTag(t) &&
      (this._emitChars("</"), (this.state = n.SCRIPT_DATA), this._stateScriptData(t));
  }
  _stateScriptDataEscapeStart(t) {
    t === r.HYPHEN_MINUS
      ? ((this.state = n.SCRIPT_DATA_ESCAPE_START_DASH), this._emitChars("-"))
      : ((this.state = n.SCRIPT_DATA), this._stateScriptData(t));
  }
  _stateScriptDataEscapeStartDash(t) {
    t === r.HYPHEN_MINUS
      ? ((this.state = n.SCRIPT_DATA_ESCAPED_DASH_DASH), this._emitChars("-"))
      : ((this.state = n.SCRIPT_DATA), this._stateScriptData(t));
  }
  _stateScriptDataEscaped(t) {
    switch (t) {
      case r.HYPHEN_MINUS: {
        ((this.state = n.SCRIPT_DATA_ESCAPED_DASH), this._emitChars("-"));
        break;
      }
      case r.LESS_THAN_SIGN: {
        this.state = n.SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN;
        break;
      }
      case r.NULL: {
        (this._err(E.unexpectedNullCharacter), this._emitChars(S));
        break;
      }
      case r.EOF: {
        (this._err(E.eofInScriptHtmlCommentLikeText), this._emitEOFToken());
        break;
      }
      default:
        this._emitCodePoint(t);
    }
  }
  _stateScriptDataEscapedDash(t) {
    switch (t) {
      case r.HYPHEN_MINUS: {
        ((this.state = n.SCRIPT_DATA_ESCAPED_DASH_DASH), this._emitChars("-"));
        break;
      }
      case r.LESS_THAN_SIGN: {
        this.state = n.SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN;
        break;
      }
      case r.NULL: {
        (this._err(E.unexpectedNullCharacter),
          (this.state = n.SCRIPT_DATA_ESCAPED),
          this._emitChars(S));
        break;
      }
      case r.EOF: {
        (this._err(E.eofInScriptHtmlCommentLikeText), this._emitEOFToken());
        break;
      }
      default:
        ((this.state = n.SCRIPT_DATA_ESCAPED), this._emitCodePoint(t));
    }
  }
  _stateScriptDataEscapedDashDash(t) {
    switch (t) {
      case r.HYPHEN_MINUS: {
        this._emitChars("-");
        break;
      }
      case r.LESS_THAN_SIGN: {
        this.state = n.SCRIPT_DATA_ESCAPED_LESS_THAN_SIGN;
        break;
      }
      case r.GREATER_THAN_SIGN: {
        ((this.state = n.SCRIPT_DATA), this._emitChars(">"));
        break;
      }
      case r.NULL: {
        (this._err(E.unexpectedNullCharacter),
          (this.state = n.SCRIPT_DATA_ESCAPED),
          this._emitChars(S));
        break;
      }
      case r.EOF: {
        (this._err(E.eofInScriptHtmlCommentLikeText), this._emitEOFToken());
        break;
      }
      default:
        ((this.state = n.SCRIPT_DATA_ESCAPED), this._emitCodePoint(t));
    }
  }
  _stateScriptDataEscapedLessThanSign(t) {
    t === r.SOLIDUS
      ? (this.state = n.SCRIPT_DATA_ESCAPED_END_TAG_OPEN)
      : ie(t)
        ? (this._emitChars("<"),
          (this.state = n.SCRIPT_DATA_DOUBLE_ESCAPE_START),
          this._stateScriptDataDoubleEscapeStart(t))
        : (this._emitChars("<"),
          (this.state = n.SCRIPT_DATA_ESCAPED),
          this._stateScriptDataEscaped(t));
  }
  _stateScriptDataEscapedEndTagOpen(t) {
    ie(t)
      ? ((this.state = n.SCRIPT_DATA_ESCAPED_END_TAG_NAME),
        this._stateScriptDataEscapedEndTagName(t))
      : (this._emitChars("</"),
        (this.state = n.SCRIPT_DATA_ESCAPED),
        this._stateScriptDataEscaped(t));
  }
  _stateScriptDataEscapedEndTagName(t) {
    this.handleSpecialEndTag(t) &&
      (this._emitChars("</"),
      (this.state = n.SCRIPT_DATA_ESCAPED),
      this._stateScriptDataEscaped(t));
  }
  _stateScriptDataDoubleEscapeStart(t) {
    if (this.preprocessor.startsWith(q.SCRIPT, !1) && $u(this.preprocessor.peek(q.SCRIPT.length))) {
      this._emitCodePoint(t);
      for (let u = 0; u < q.SCRIPT.length; u++) this._emitCodePoint(this._consume());
      this.state = n.SCRIPT_DATA_DOUBLE_ESCAPED;
    } else
      this._ensureHibernation() ||
        ((this.state = n.SCRIPT_DATA_ESCAPED), this._stateScriptDataEscaped(t));
  }
  _stateScriptDataDoubleEscaped(t) {
    switch (t) {
      case r.HYPHEN_MINUS: {
        ((this.state = n.SCRIPT_DATA_DOUBLE_ESCAPED_DASH), this._emitChars("-"));
        break;
      }
      case r.LESS_THAN_SIGN: {
        ((this.state = n.SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN), this._emitChars("<"));
        break;
      }
      case r.NULL: {
        (this._err(E.unexpectedNullCharacter), this._emitChars(S));
        break;
      }
      case r.EOF: {
        (this._err(E.eofInScriptHtmlCommentLikeText), this._emitEOFToken());
        break;
      }
      default:
        this._emitCodePoint(t);
    }
  }
  _stateScriptDataDoubleEscapedDash(t) {
    switch (t) {
      case r.HYPHEN_MINUS: {
        ((this.state = n.SCRIPT_DATA_DOUBLE_ESCAPED_DASH_DASH), this._emitChars("-"));
        break;
      }
      case r.LESS_THAN_SIGN: {
        ((this.state = n.SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN), this._emitChars("<"));
        break;
      }
      case r.NULL: {
        (this._err(E.unexpectedNullCharacter),
          (this.state = n.SCRIPT_DATA_DOUBLE_ESCAPED),
          this._emitChars(S));
        break;
      }
      case r.EOF: {
        (this._err(E.eofInScriptHtmlCommentLikeText), this._emitEOFToken());
        break;
      }
      default:
        ((this.state = n.SCRIPT_DATA_DOUBLE_ESCAPED), this._emitCodePoint(t));
    }
  }
  _stateScriptDataDoubleEscapedDashDash(t) {
    switch (t) {
      case r.HYPHEN_MINUS: {
        this._emitChars("-");
        break;
      }
      case r.LESS_THAN_SIGN: {
        ((this.state = n.SCRIPT_DATA_DOUBLE_ESCAPED_LESS_THAN_SIGN), this._emitChars("<"));
        break;
      }
      case r.GREATER_THAN_SIGN: {
        ((this.state = n.SCRIPT_DATA), this._emitChars(">"));
        break;
      }
      case r.NULL: {
        (this._err(E.unexpectedNullCharacter),
          (this.state = n.SCRIPT_DATA_DOUBLE_ESCAPED),
          this._emitChars(S));
        break;
      }
      case r.EOF: {
        (this._err(E.eofInScriptHtmlCommentLikeText), this._emitEOFToken());
        break;
      }
      default:
        ((this.state = n.SCRIPT_DATA_DOUBLE_ESCAPED), this._emitCodePoint(t));
    }
  }
  _stateScriptDataDoubleEscapedLessThanSign(t) {
    t === r.SOLIDUS
      ? ((this.state = n.SCRIPT_DATA_DOUBLE_ESCAPE_END), this._emitChars("/"))
      : ((this.state = n.SCRIPT_DATA_DOUBLE_ESCAPED), this._stateScriptDataDoubleEscaped(t));
  }
  _stateScriptDataDoubleEscapeEnd(t) {
    if (this.preprocessor.startsWith(q.SCRIPT, !1) && $u(this.preprocessor.peek(q.SCRIPT.length))) {
      this._emitCodePoint(t);
      for (let u = 0; u < q.SCRIPT.length; u++) this._emitCodePoint(this._consume());
      this.state = n.SCRIPT_DATA_ESCAPED;
    } else
      this._ensureHibernation() ||
        ((this.state = n.SCRIPT_DATA_DOUBLE_ESCAPED), this._stateScriptDataDoubleEscaped(t));
  }
  _stateBeforeAttributeName(t) {
    switch (t) {
      case r.SPACE:
      case r.LINE_FEED:
      case r.TABULATION:
      case r.FORM_FEED:
        break;
      case r.SOLIDUS:
      case r.GREATER_THAN_SIGN:
      case r.EOF: {
        ((this.state = n.AFTER_ATTRIBUTE_NAME), this._stateAfterAttributeName(t));
        break;
      }
      case r.EQUALS_SIGN: {
        (this._err(E.unexpectedEqualsSignBeforeAttributeName),
          this._createAttr("="),
          (this.state = n.ATTRIBUTE_NAME));
        break;
      }
      default:
        (this._createAttr(""), (this.state = n.ATTRIBUTE_NAME), this._stateAttributeName(t));
    }
  }
  _stateAttributeName(t) {
    switch (t) {
      case r.SPACE:
      case r.LINE_FEED:
      case r.TABULATION:
      case r.FORM_FEED:
      case r.SOLIDUS:
      case r.GREATER_THAN_SIGN:
      case r.EOF: {
        (this._leaveAttrName(),
          (this.state = n.AFTER_ATTRIBUTE_NAME),
          this._stateAfterAttributeName(t));
        break;
      }
      case r.EQUALS_SIGN: {
        (this._leaveAttrName(), (this.state = n.BEFORE_ATTRIBUTE_VALUE));
        break;
      }
      case r.QUOTATION_MARK:
      case r.APOSTROPHE:
      case r.LESS_THAN_SIGN: {
        (this._err(E.unexpectedCharacterInAttributeName),
          (this.currentAttr.name += String.fromCodePoint(t)));
        break;
      }
      case r.NULL: {
        (this._err(E.unexpectedNullCharacter), (this.currentAttr.name += S));
        break;
      }
      default:
        this.currentAttr.name += String.fromCodePoint(Ge(t) ? dt(t) : t);
    }
  }
  _stateAfterAttributeName(t) {
    switch (t) {
      case r.SPACE:
      case r.LINE_FEED:
      case r.TABULATION:
      case r.FORM_FEED:
        break;
      case r.SOLIDUS: {
        this.state = n.SELF_CLOSING_START_TAG;
        break;
      }
      case r.EQUALS_SIGN: {
        this.state = n.BEFORE_ATTRIBUTE_VALUE;
        break;
      }
      case r.GREATER_THAN_SIGN: {
        ((this.state = n.DATA), this.emitCurrentTagToken());
        break;
      }
      case r.EOF: {
        (this._err(E.eofInTag), this._emitEOFToken());
        break;
      }
      default:
        (this._createAttr(""), (this.state = n.ATTRIBUTE_NAME), this._stateAttributeName(t));
    }
  }
  _stateBeforeAttributeValue(t) {
    switch (t) {
      case r.SPACE:
      case r.LINE_FEED:
      case r.TABULATION:
      case r.FORM_FEED:
        break;
      case r.QUOTATION_MARK: {
        this.state = n.ATTRIBUTE_VALUE_DOUBLE_QUOTED;
        break;
      }
      case r.APOSTROPHE: {
        this.state = n.ATTRIBUTE_VALUE_SINGLE_QUOTED;
        break;
      }
      case r.GREATER_THAN_SIGN: {
        (this._err(E.missingAttributeValue), (this.state = n.DATA), this.emitCurrentTagToken());
        break;
      }
      default:
        ((this.state = n.ATTRIBUTE_VALUE_UNQUOTED), this._stateAttributeValueUnquoted(t));
    }
  }
  _stateAttributeValueDoubleQuoted(t) {
    switch (t) {
      case r.QUOTATION_MARK: {
        this.state = n.AFTER_ATTRIBUTE_VALUE_QUOTED;
        break;
      }
      case r.AMPERSAND: {
        this._startCharacterReference();
        break;
      }
      case r.NULL: {
        (this._err(E.unexpectedNullCharacter), (this.currentAttr.value += S));
        break;
      }
      case r.EOF: {
        (this._err(E.eofInTag), this._emitEOFToken());
        break;
      }
      default:
        this.currentAttr.value += String.fromCodePoint(t);
    }
  }
  _stateAttributeValueSingleQuoted(t) {
    switch (t) {
      case r.APOSTROPHE: {
        this.state = n.AFTER_ATTRIBUTE_VALUE_QUOTED;
        break;
      }
      case r.AMPERSAND: {
        this._startCharacterReference();
        break;
      }
      case r.NULL: {
        (this._err(E.unexpectedNullCharacter), (this.currentAttr.value += S));
        break;
      }
      case r.EOF: {
        (this._err(E.eofInTag), this._emitEOFToken());
        break;
      }
      default:
        this.currentAttr.value += String.fromCodePoint(t);
    }
  }
  _stateAttributeValueUnquoted(t) {
    switch (t) {
      case r.SPACE:
      case r.LINE_FEED:
      case r.TABULATION:
      case r.FORM_FEED: {
        (this._leaveAttrValue(), (this.state = n.BEFORE_ATTRIBUTE_NAME));
        break;
      }
      case r.AMPERSAND: {
        this._startCharacterReference();
        break;
      }
      case r.GREATER_THAN_SIGN: {
        (this._leaveAttrValue(), (this.state = n.DATA), this.emitCurrentTagToken());
        break;
      }
      case r.NULL: {
        (this._err(E.unexpectedNullCharacter), (this.currentAttr.value += S));
        break;
      }
      case r.QUOTATION_MARK:
      case r.APOSTROPHE:
      case r.LESS_THAN_SIGN:
      case r.EQUALS_SIGN:
      case r.GRAVE_ACCENT: {
        (this._err(E.unexpectedCharacterInUnquotedAttributeValue),
          (this.currentAttr.value += String.fromCodePoint(t)));
        break;
      }
      case r.EOF: {
        (this._err(E.eofInTag), this._emitEOFToken());
        break;
      }
      default:
        this.currentAttr.value += String.fromCodePoint(t);
    }
  }
  _stateAfterAttributeValueQuoted(t) {
    switch (t) {
      case r.SPACE:
      case r.LINE_FEED:
      case r.TABULATION:
      case r.FORM_FEED: {
        (this._leaveAttrValue(), (this.state = n.BEFORE_ATTRIBUTE_NAME));
        break;
      }
      case r.SOLIDUS: {
        (this._leaveAttrValue(), (this.state = n.SELF_CLOSING_START_TAG));
        break;
      }
      case r.GREATER_THAN_SIGN: {
        (this._leaveAttrValue(), (this.state = n.DATA), this.emitCurrentTagToken());
        break;
      }
      case r.EOF: {
        (this._err(E.eofInTag), this._emitEOFToken());
        break;
      }
      default:
        (this._err(E.missingWhitespaceBetweenAttributes),
          (this.state = n.BEFORE_ATTRIBUTE_NAME),
          this._stateBeforeAttributeName(t));
    }
  }
  _stateSelfClosingStartTag(t) {
    switch (t) {
      case r.GREATER_THAN_SIGN: {
        const u = this.currentToken;
        ((u.selfClosing = !0), (this.state = n.DATA), this.emitCurrentTagToken());
        break;
      }
      case r.EOF: {
        (this._err(E.eofInTag), this._emitEOFToken());
        break;
      }
      default:
        (this._err(E.unexpectedSolidusInTag),
          (this.state = n.BEFORE_ATTRIBUTE_NAME),
          this._stateBeforeAttributeName(t));
    }
  }
  _stateBogusComment(t) {
    const u = this.currentToken;
    switch (t) {
      case r.GREATER_THAN_SIGN: {
        ((this.state = n.DATA), this.emitCurrentComment(u));
        break;
      }
      case r.EOF: {
        (this.emitCurrentComment(u), this._emitEOFToken());
        break;
      }
      case r.NULL: {
        (this._err(E.unexpectedNullCharacter), (u.data += S));
        break;
      }
      default:
        u.data += String.fromCodePoint(t);
    }
  }
  _stateMarkupDeclarationOpen(t) {
    this._consumeSequenceIfMatch(q.DASH_DASH, !0)
      ? (this._createCommentToken(q.DASH_DASH.length + 1), (this.state = n.COMMENT_START))
      : this._consumeSequenceIfMatch(q.DOCTYPE, !1)
        ? ((this.currentLocation = this.getCurrentLocation(q.DOCTYPE.length + 1)),
          (this.state = n.DOCTYPE))
        : this._consumeSequenceIfMatch(q.CDATA_START, !0)
          ? this.inForeignNode
            ? (this.state = n.CDATA_SECTION)
            : (this._err(E.cdataInHtmlContent),
              this._createCommentToken(q.CDATA_START.length + 1),
              (this.currentToken.data = "[CDATA["),
              (this.state = n.BOGUS_COMMENT))
          : this._ensureHibernation() ||
            (this._err(E.incorrectlyOpenedComment),
            this._createCommentToken(2),
            (this.state = n.BOGUS_COMMENT),
            this._stateBogusComment(t));
  }
  _stateCommentStart(t) {
    switch (t) {
      case r.HYPHEN_MINUS: {
        this.state = n.COMMENT_START_DASH;
        break;
      }
      case r.GREATER_THAN_SIGN: {
        (this._err(E.abruptClosingOfEmptyComment), (this.state = n.DATA));
        const u = this.currentToken;
        this.emitCurrentComment(u);
        break;
      }
      default:
        ((this.state = n.COMMENT), this._stateComment(t));
    }
  }
  _stateCommentStartDash(t) {
    const u = this.currentToken;
    switch (t) {
      case r.HYPHEN_MINUS: {
        this.state = n.COMMENT_END;
        break;
      }
      case r.GREATER_THAN_SIGN: {
        (this._err(E.abruptClosingOfEmptyComment),
          (this.state = n.DATA),
          this.emitCurrentComment(u));
        break;
      }
      case r.EOF: {
        (this._err(E.eofInComment), this.emitCurrentComment(u), this._emitEOFToken());
        break;
      }
      default:
        ((u.data += "-"), (this.state = n.COMMENT), this._stateComment(t));
    }
  }
  _stateComment(t) {
    const u = this.currentToken;
    switch (t) {
      case r.HYPHEN_MINUS: {
        this.state = n.COMMENT_END_DASH;
        break;
      }
      case r.LESS_THAN_SIGN: {
        ((u.data += "<"), (this.state = n.COMMENT_LESS_THAN_SIGN));
        break;
      }
      case r.NULL: {
        (this._err(E.unexpectedNullCharacter), (u.data += S));
        break;
      }
      case r.EOF: {
        (this._err(E.eofInComment), this.emitCurrentComment(u), this._emitEOFToken());
        break;
      }
      default:
        u.data += String.fromCodePoint(t);
    }
  }
  _stateCommentLessThanSign(t) {
    const u = this.currentToken;
    switch (t) {
      case r.EXCLAMATION_MARK: {
        ((u.data += "!"), (this.state = n.COMMENT_LESS_THAN_SIGN_BANG));
        break;
      }
      case r.LESS_THAN_SIGN: {
        u.data += "<";
        break;
      }
      default:
        ((this.state = n.COMMENT), this._stateComment(t));
    }
  }
  _stateCommentLessThanSignBang(t) {
    t === r.HYPHEN_MINUS
      ? (this.state = n.COMMENT_LESS_THAN_SIGN_BANG_DASH)
      : ((this.state = n.COMMENT), this._stateComment(t));
  }
  _stateCommentLessThanSignBangDash(t) {
    t === r.HYPHEN_MINUS
      ? (this.state = n.COMMENT_LESS_THAN_SIGN_BANG_DASH_DASH)
      : ((this.state = n.COMMENT_END_DASH), this._stateCommentEndDash(t));
  }
  _stateCommentLessThanSignBangDashDash(t) {
    (t !== r.GREATER_THAN_SIGN && t !== r.EOF && this._err(E.nestedComment),
      (this.state = n.COMMENT_END),
      this._stateCommentEnd(t));
  }
  _stateCommentEndDash(t) {
    const u = this.currentToken;
    switch (t) {
      case r.HYPHEN_MINUS: {
        this.state = n.COMMENT_END;
        break;
      }
      case r.EOF: {
        (this._err(E.eofInComment), this.emitCurrentComment(u), this._emitEOFToken());
        break;
      }
      default:
        ((u.data += "-"), (this.state = n.COMMENT), this._stateComment(t));
    }
  }
  _stateCommentEnd(t) {
    const u = this.currentToken;
    switch (t) {
      case r.GREATER_THAN_SIGN: {
        ((this.state = n.DATA), this.emitCurrentComment(u));
        break;
      }
      case r.EXCLAMATION_MARK: {
        this.state = n.COMMENT_END_BANG;
        break;
      }
      case r.HYPHEN_MINUS: {
        u.data += "-";
        break;
      }
      case r.EOF: {
        (this._err(E.eofInComment), this.emitCurrentComment(u), this._emitEOFToken());
        break;
      }
      default:
        ((u.data += "--"), (this.state = n.COMMENT), this._stateComment(t));
    }
  }
  _stateCommentEndBang(t) {
    const u = this.currentToken;
    switch (t) {
      case r.HYPHEN_MINUS: {
        ((u.data += "--!"), (this.state = n.COMMENT_END_DASH));
        break;
      }
      case r.GREATER_THAN_SIGN: {
        (this._err(E.incorrectlyClosedComment), (this.state = n.DATA), this.emitCurrentComment(u));
        break;
      }
      case r.EOF: {
        (this._err(E.eofInComment), this.emitCurrentComment(u), this._emitEOFToken());
        break;
      }
      default:
        ((u.data += "--!"), (this.state = n.COMMENT), this._stateComment(t));
    }
  }
  _stateDoctype(t) {
    switch (t) {
      case r.SPACE:
      case r.LINE_FEED:
      case r.TABULATION:
      case r.FORM_FEED: {
        this.state = n.BEFORE_DOCTYPE_NAME;
        break;
      }
      case r.GREATER_THAN_SIGN: {
        ((this.state = n.BEFORE_DOCTYPE_NAME), this._stateBeforeDoctypeName(t));
        break;
      }
      case r.EOF: {
        (this._err(E.eofInDoctype), this._createDoctypeToken(null));
        const u = this.currentToken;
        ((u.forceQuirks = !0), this.emitCurrentDoctype(u), this._emitEOFToken());
        break;
      }
      default:
        (this._err(E.missingWhitespaceBeforeDoctypeName),
          (this.state = n.BEFORE_DOCTYPE_NAME),
          this._stateBeforeDoctypeName(t));
    }
  }
  _stateBeforeDoctypeName(t) {
    if (Ge(t))
      (this._createDoctypeToken(String.fromCharCode(dt(t))), (this.state = n.DOCTYPE_NAME));
    else
      switch (t) {
        case r.SPACE:
        case r.LINE_FEED:
        case r.TABULATION:
        case r.FORM_FEED:
          break;
        case r.NULL: {
          (this._err(E.unexpectedNullCharacter),
            this._createDoctypeToken(S),
            (this.state = n.DOCTYPE_NAME));
          break;
        }
        case r.GREATER_THAN_SIGN: {
          (this._err(E.missingDoctypeName), this._createDoctypeToken(null));
          const u = this.currentToken;
          ((u.forceQuirks = !0), this.emitCurrentDoctype(u), (this.state = n.DATA));
          break;
        }
        case r.EOF: {
          (this._err(E.eofInDoctype), this._createDoctypeToken(null));
          const u = this.currentToken;
          ((u.forceQuirks = !0), this.emitCurrentDoctype(u), this._emitEOFToken());
          break;
        }
        default:
          (this._createDoctypeToken(String.fromCodePoint(t)), (this.state = n.DOCTYPE_NAME));
      }
  }
  _stateDoctypeName(t) {
    const u = this.currentToken;
    switch (t) {
      case r.SPACE:
      case r.LINE_FEED:
      case r.TABULATION:
      case r.FORM_FEED: {
        this.state = n.AFTER_DOCTYPE_NAME;
        break;
      }
      case r.GREATER_THAN_SIGN: {
        ((this.state = n.DATA), this.emitCurrentDoctype(u));
        break;
      }
      case r.NULL: {
        (this._err(E.unexpectedNullCharacter), (u.name += S));
        break;
      }
      case r.EOF: {
        (this._err(E.eofInDoctype),
          (u.forceQuirks = !0),
          this.emitCurrentDoctype(u),
          this._emitEOFToken());
        break;
      }
      default:
        u.name += String.fromCodePoint(Ge(t) ? dt(t) : t);
    }
  }
  _stateAfterDoctypeName(t) {
    const u = this.currentToken;
    switch (t) {
      case r.SPACE:
      case r.LINE_FEED:
      case r.TABULATION:
      case r.FORM_FEED:
        break;
      case r.GREATER_THAN_SIGN: {
        ((this.state = n.DATA), this.emitCurrentDoctype(u));
        break;
      }
      case r.EOF: {
        (this._err(E.eofInDoctype),
          (u.forceQuirks = !0),
          this.emitCurrentDoctype(u),
          this._emitEOFToken());
        break;
      }
      default:
        this._consumeSequenceIfMatch(q.PUBLIC, !1)
          ? (this.state = n.AFTER_DOCTYPE_PUBLIC_KEYWORD)
          : this._consumeSequenceIfMatch(q.SYSTEM, !1)
            ? (this.state = n.AFTER_DOCTYPE_SYSTEM_KEYWORD)
            : this._ensureHibernation() ||
              (this._err(E.invalidCharacterSequenceAfterDoctypeName),
              (u.forceQuirks = !0),
              (this.state = n.BOGUS_DOCTYPE),
              this._stateBogusDoctype(t));
    }
  }
  _stateAfterDoctypePublicKeyword(t) {
    const u = this.currentToken;
    switch (t) {
      case r.SPACE:
      case r.LINE_FEED:
      case r.TABULATION:
      case r.FORM_FEED: {
        this.state = n.BEFORE_DOCTYPE_PUBLIC_IDENTIFIER;
        break;
      }
      case r.QUOTATION_MARK: {
        (this._err(E.missingWhitespaceAfterDoctypePublicKeyword),
          (u.publicId = ""),
          (this.state = n.DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED));
        break;
      }
      case r.APOSTROPHE: {
        (this._err(E.missingWhitespaceAfterDoctypePublicKeyword),
          (u.publicId = ""),
          (this.state = n.DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED));
        break;
      }
      case r.GREATER_THAN_SIGN: {
        (this._err(E.missingDoctypePublicIdentifier),
          (u.forceQuirks = !0),
          (this.state = n.DATA),
          this.emitCurrentDoctype(u));
        break;
      }
      case r.EOF: {
        (this._err(E.eofInDoctype),
          (u.forceQuirks = !0),
          this.emitCurrentDoctype(u),
          this._emitEOFToken());
        break;
      }
      default:
        (this._err(E.missingQuoteBeforeDoctypePublicIdentifier),
          (u.forceQuirks = !0),
          (this.state = n.BOGUS_DOCTYPE),
          this._stateBogusDoctype(t));
    }
  }
  _stateBeforeDoctypePublicIdentifier(t) {
    const u = this.currentToken;
    switch (t) {
      case r.SPACE:
      case r.LINE_FEED:
      case r.TABULATION:
      case r.FORM_FEED:
        break;
      case r.QUOTATION_MARK: {
        ((u.publicId = ""), (this.state = n.DOCTYPE_PUBLIC_IDENTIFIER_DOUBLE_QUOTED));
        break;
      }
      case r.APOSTROPHE: {
        ((u.publicId = ""), (this.state = n.DOCTYPE_PUBLIC_IDENTIFIER_SINGLE_QUOTED));
        break;
      }
      case r.GREATER_THAN_SIGN: {
        (this._err(E.missingDoctypePublicIdentifier),
          (u.forceQuirks = !0),
          (this.state = n.DATA),
          this.emitCurrentDoctype(u));
        break;
      }
      case r.EOF: {
        (this._err(E.eofInDoctype),
          (u.forceQuirks = !0),
          this.emitCurrentDoctype(u),
          this._emitEOFToken());
        break;
      }
      default:
        (this._err(E.missingQuoteBeforeDoctypePublicIdentifier),
          (u.forceQuirks = !0),
          (this.state = n.BOGUS_DOCTYPE),
          this._stateBogusDoctype(t));
    }
  }
  _stateDoctypePublicIdentifierDoubleQuoted(t) {
    const u = this.currentToken;
    switch (t) {
      case r.QUOTATION_MARK: {
        this.state = n.AFTER_DOCTYPE_PUBLIC_IDENTIFIER;
        break;
      }
      case r.NULL: {
        (this._err(E.unexpectedNullCharacter), (u.publicId += S));
        break;
      }
      case r.GREATER_THAN_SIGN: {
        (this._err(E.abruptDoctypePublicIdentifier),
          (u.forceQuirks = !0),
          this.emitCurrentDoctype(u),
          (this.state = n.DATA));
        break;
      }
      case r.EOF: {
        (this._err(E.eofInDoctype),
          (u.forceQuirks = !0),
          this.emitCurrentDoctype(u),
          this._emitEOFToken());
        break;
      }
      default:
        u.publicId += String.fromCodePoint(t);
    }
  }
  _stateDoctypePublicIdentifierSingleQuoted(t) {
    const u = this.currentToken;
    switch (t) {
      case r.APOSTROPHE: {
        this.state = n.AFTER_DOCTYPE_PUBLIC_IDENTIFIER;
        break;
      }
      case r.NULL: {
        (this._err(E.unexpectedNullCharacter), (u.publicId += S));
        break;
      }
      case r.GREATER_THAN_SIGN: {
        (this._err(E.abruptDoctypePublicIdentifier),
          (u.forceQuirks = !0),
          this.emitCurrentDoctype(u),
          (this.state = n.DATA));
        break;
      }
      case r.EOF: {
        (this._err(E.eofInDoctype),
          (u.forceQuirks = !0),
          this.emitCurrentDoctype(u),
          this._emitEOFToken());
        break;
      }
      default:
        u.publicId += String.fromCodePoint(t);
    }
  }
  _stateAfterDoctypePublicIdentifier(t) {
    const u = this.currentToken;
    switch (t) {
      case r.SPACE:
      case r.LINE_FEED:
      case r.TABULATION:
      case r.FORM_FEED: {
        this.state = n.BETWEEN_DOCTYPE_PUBLIC_AND_SYSTEM_IDENTIFIERS;
        break;
      }
      case r.GREATER_THAN_SIGN: {
        ((this.state = n.DATA), this.emitCurrentDoctype(u));
        break;
      }
      case r.QUOTATION_MARK: {
        (this._err(E.missingWhitespaceBetweenDoctypePublicAndSystemIdentifiers),
          (u.systemId = ""),
          (this.state = n.DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED));
        break;
      }
      case r.APOSTROPHE: {
        (this._err(E.missingWhitespaceBetweenDoctypePublicAndSystemIdentifiers),
          (u.systemId = ""),
          (this.state = n.DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED));
        break;
      }
      case r.EOF: {
        (this._err(E.eofInDoctype),
          (u.forceQuirks = !0),
          this.emitCurrentDoctype(u),
          this._emitEOFToken());
        break;
      }
      default:
        (this._err(E.missingQuoteBeforeDoctypeSystemIdentifier),
          (u.forceQuirks = !0),
          (this.state = n.BOGUS_DOCTYPE),
          this._stateBogusDoctype(t));
    }
  }
  _stateBetweenDoctypePublicAndSystemIdentifiers(t) {
    const u = this.currentToken;
    switch (t) {
      case r.SPACE:
      case r.LINE_FEED:
      case r.TABULATION:
      case r.FORM_FEED:
        break;
      case r.GREATER_THAN_SIGN: {
        (this.emitCurrentDoctype(u), (this.state = n.DATA));
        break;
      }
      case r.QUOTATION_MARK: {
        ((u.systemId = ""), (this.state = n.DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED));
        break;
      }
      case r.APOSTROPHE: {
        ((u.systemId = ""), (this.state = n.DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED));
        break;
      }
      case r.EOF: {
        (this._err(E.eofInDoctype),
          (u.forceQuirks = !0),
          this.emitCurrentDoctype(u),
          this._emitEOFToken());
        break;
      }
      default:
        (this._err(E.missingQuoteBeforeDoctypeSystemIdentifier),
          (u.forceQuirks = !0),
          (this.state = n.BOGUS_DOCTYPE),
          this._stateBogusDoctype(t));
    }
  }
  _stateAfterDoctypeSystemKeyword(t) {
    const u = this.currentToken;
    switch (t) {
      case r.SPACE:
      case r.LINE_FEED:
      case r.TABULATION:
      case r.FORM_FEED: {
        this.state = n.BEFORE_DOCTYPE_SYSTEM_IDENTIFIER;
        break;
      }
      case r.QUOTATION_MARK: {
        (this._err(E.missingWhitespaceAfterDoctypeSystemKeyword),
          (u.systemId = ""),
          (this.state = n.DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED));
        break;
      }
      case r.APOSTROPHE: {
        (this._err(E.missingWhitespaceAfterDoctypeSystemKeyword),
          (u.systemId = ""),
          (this.state = n.DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED));
        break;
      }
      case r.GREATER_THAN_SIGN: {
        (this._err(E.missingDoctypeSystemIdentifier),
          (u.forceQuirks = !0),
          (this.state = n.DATA),
          this.emitCurrentDoctype(u));
        break;
      }
      case r.EOF: {
        (this._err(E.eofInDoctype),
          (u.forceQuirks = !0),
          this.emitCurrentDoctype(u),
          this._emitEOFToken());
        break;
      }
      default:
        (this._err(E.missingQuoteBeforeDoctypeSystemIdentifier),
          (u.forceQuirks = !0),
          (this.state = n.BOGUS_DOCTYPE),
          this._stateBogusDoctype(t));
    }
  }
  _stateBeforeDoctypeSystemIdentifier(t) {
    const u = this.currentToken;
    switch (t) {
      case r.SPACE:
      case r.LINE_FEED:
      case r.TABULATION:
      case r.FORM_FEED:
        break;
      case r.QUOTATION_MARK: {
        ((u.systemId = ""), (this.state = n.DOCTYPE_SYSTEM_IDENTIFIER_DOUBLE_QUOTED));
        break;
      }
      case r.APOSTROPHE: {
        ((u.systemId = ""), (this.state = n.DOCTYPE_SYSTEM_IDENTIFIER_SINGLE_QUOTED));
        break;
      }
      case r.GREATER_THAN_SIGN: {
        (this._err(E.missingDoctypeSystemIdentifier),
          (u.forceQuirks = !0),
          (this.state = n.DATA),
          this.emitCurrentDoctype(u));
        break;
      }
      case r.EOF: {
        (this._err(E.eofInDoctype),
          (u.forceQuirks = !0),
          this.emitCurrentDoctype(u),
          this._emitEOFToken());
        break;
      }
      default:
        (this._err(E.missingQuoteBeforeDoctypeSystemIdentifier),
          (u.forceQuirks = !0),
          (this.state = n.BOGUS_DOCTYPE),
          this._stateBogusDoctype(t));
    }
  }
  _stateDoctypeSystemIdentifierDoubleQuoted(t) {
    const u = this.currentToken;
    switch (t) {
      case r.QUOTATION_MARK: {
        this.state = n.AFTER_DOCTYPE_SYSTEM_IDENTIFIER;
        break;
      }
      case r.NULL: {
        (this._err(E.unexpectedNullCharacter), (u.systemId += S));
        break;
      }
      case r.GREATER_THAN_SIGN: {
        (this._err(E.abruptDoctypeSystemIdentifier),
          (u.forceQuirks = !0),
          this.emitCurrentDoctype(u),
          (this.state = n.DATA));
        break;
      }
      case r.EOF: {
        (this._err(E.eofInDoctype),
          (u.forceQuirks = !0),
          this.emitCurrentDoctype(u),
          this._emitEOFToken());
        break;
      }
      default:
        u.systemId += String.fromCodePoint(t);
    }
  }
  _stateDoctypeSystemIdentifierSingleQuoted(t) {
    const u = this.currentToken;
    switch (t) {
      case r.APOSTROPHE: {
        this.state = n.AFTER_DOCTYPE_SYSTEM_IDENTIFIER;
        break;
      }
      case r.NULL: {
        (this._err(E.unexpectedNullCharacter), (u.systemId += S));
        break;
      }
      case r.GREATER_THAN_SIGN: {
        (this._err(E.abruptDoctypeSystemIdentifier),
          (u.forceQuirks = !0),
          this.emitCurrentDoctype(u),
          (this.state = n.DATA));
        break;
      }
      case r.EOF: {
        (this._err(E.eofInDoctype),
          (u.forceQuirks = !0),
          this.emitCurrentDoctype(u),
          this._emitEOFToken());
        break;
      }
      default:
        u.systemId += String.fromCodePoint(t);
    }
  }
  _stateAfterDoctypeSystemIdentifier(t) {
    const u = this.currentToken;
    switch (t) {
      case r.SPACE:
      case r.LINE_FEED:
      case r.TABULATION:
      case r.FORM_FEED:
        break;
      case r.GREATER_THAN_SIGN: {
        (this.emitCurrentDoctype(u), (this.state = n.DATA));
        break;
      }
      case r.EOF: {
        (this._err(E.eofInDoctype),
          (u.forceQuirks = !0),
          this.emitCurrentDoctype(u),
          this._emitEOFToken());
        break;
      }
      default:
        (this._err(E.unexpectedCharacterAfterDoctypeSystemIdentifier),
          (this.state = n.BOGUS_DOCTYPE),
          this._stateBogusDoctype(t));
    }
  }
  _stateBogusDoctype(t) {
    const u = this.currentToken;
    switch (t) {
      case r.GREATER_THAN_SIGN: {
        (this.emitCurrentDoctype(u), (this.state = n.DATA));
        break;
      }
      case r.NULL: {
        this._err(E.unexpectedNullCharacter);
        break;
      }
      case r.EOF: {
        (this.emitCurrentDoctype(u), this._emitEOFToken());
        break;
      }
    }
  }
  _stateCdataSection(t) {
    switch (t) {
      case r.RIGHT_SQUARE_BRACKET: {
        this.state = n.CDATA_SECTION_BRACKET;
        break;
      }
      case r.EOF: {
        (this._err(E.eofInCdata), this._emitEOFToken());
        break;
      }
      default:
        this._emitCodePoint(t);
    }
  }
  _stateCdataSectionBracket(t) {
    t === r.RIGHT_SQUARE_BRACKET
      ? (this.state = n.CDATA_SECTION_END)
      : (this._emitChars("]"), (this.state = n.CDATA_SECTION), this._stateCdataSection(t));
  }
  _stateCdataSectionEnd(t) {
    switch (t) {
      case r.GREATER_THAN_SIGN: {
        this.state = n.DATA;
        break;
      }
      case r.RIGHT_SQUARE_BRACKET: {
        this._emitChars("]");
        break;
      }
      default:
        (this._emitChars("]]"), (this.state = n.CDATA_SECTION), this._stateCdataSection(t));
    }
  }
  _stateCharacterReference() {
    let t = this.entityDecoder.write(this.preprocessor.html, this.preprocessor.pos);
    if (t < 0)
      if (this.preprocessor.lastChunkWritten) t = this.entityDecoder.end();
      else {
        ((this.active = !1),
          (this.preprocessor.pos = this.preprocessor.html.length - 1),
          (this.consumedAfterSnapshot = 0),
          (this.preprocessor.endOfChunkHit = !0));
        return;
      }
    t === 0
      ? ((this.preprocessor.pos = this.entityStartPos),
        this._flushCodePointConsumedAsCharacterReference(r.AMPERSAND),
        (this.state =
          !this._isCharacterReferenceInAttribute() && Ju(this.preprocessor.peek(1))
            ? n.AMBIGUOUS_AMPERSAND
            : this.returnState))
      : (this.state = this.returnState);
  }
  _stateAmbiguousAmpersand(t) {
    Ju(t)
      ? this._flushCodePointConsumedAsCharacterReference(t)
      : (t === r.SEMICOLON && this._err(E.unknownNamedCharacterReference),
        (this.state = this.returnState),
        this._callState(t));
  }
}
const Sa = new Set([a.DD, a.DT, a.LI, a.OPTGROUP, a.OPTION, a.P, a.RB, a.RP, a.RT, a.RTC]),
  Zu = new Set([...Sa, a.CAPTION, a.COLGROUP, a.TBODY, a.TD, a.TFOOT, a.TH, a.THEAD, a.TR]),
  ft = new Set([a.APPLET, a.CAPTION, a.HTML, a.MARQUEE, a.OBJECT, a.TABLE, a.TD, a.TEMPLATE, a.TH]),
  kr = new Set([...ft, a.OL, a.UL]),
  Br = new Set([...ft, a.BUTTON]),
  ea = new Set([a.ANNOTATION_XML, a.MI, a.MN, a.MO, a.MS, a.MTEXT]),
  ta = new Set([a.DESC, a.FOREIGN_OBJECT, a.TITLE]),
  yr = new Set([a.TR, a.TEMPLATE, a.HTML]),
  Fr = new Set([a.TBODY, a.TFOOT, a.THEAD, a.TEMPLATE, a.HTML]),
  Ur = new Set([a.TABLE, a.TEMPLATE, a.HTML]),
  Hr = new Set([a.TD, a.TH]);
class wr {
  get currentTmplContentOrNode() {
    return this._isInTemplate() ? this.treeAdapter.getTemplateContent(this.current) : this.current;
  }
  constructor(t, u, s) {
    ((this.treeAdapter = u),
      (this.handler = s),
      (this.items = []),
      (this.tagIDs = []),
      (this.stackTop = -1),
      (this.tmplCount = 0),
      (this.currentTagId = a.UNKNOWN),
      (this.current = t));
  }
  _indexOf(t) {
    return this.items.lastIndexOf(t, this.stackTop);
  }
  _isInTemplate() {
    return (
      this.currentTagId === a.TEMPLATE && this.treeAdapter.getNamespaceURI(this.current) === h.HTML
    );
  }
  _updateCurrentElement() {
    ((this.current = this.items[this.stackTop]), (this.currentTagId = this.tagIDs[this.stackTop]));
  }
  push(t, u) {
    (this.stackTop++,
      (this.items[this.stackTop] = t),
      (this.current = t),
      (this.tagIDs[this.stackTop] = u),
      (this.currentTagId = u),
      this._isInTemplate() && this.tmplCount++,
      this.handler.onItemPush(t, u, !0));
  }
  pop() {
    const t = this.current;
    (this.tmplCount > 0 && this._isInTemplate() && this.tmplCount--,
      this.stackTop--,
      this._updateCurrentElement(),
      this.handler.onItemPop(t, !0));
  }
  replace(t, u) {
    const s = this._indexOf(t);
    ((this.items[s] = u), s === this.stackTop && (this.current = u));
  }
  insertAfter(t, u, s) {
    const c = this._indexOf(t) + 1;
    (this.items.splice(c, 0, u),
      this.tagIDs.splice(c, 0, s),
      this.stackTop++,
      c === this.stackTop && this._updateCurrentElement(),
      this.current &&
        this.currentTagId !== void 0 &&
        this.handler.onItemPush(this.current, this.currentTagId, c === this.stackTop));
  }
  popUntilTagNamePopped(t) {
    let u = this.stackTop + 1;
    do u = this.tagIDs.lastIndexOf(t, u - 1);
    while (u > 0 && this.treeAdapter.getNamespaceURI(this.items[u]) !== h.HTML);
    this.shortenToLength(Math.max(u, 0));
  }
  shortenToLength(t) {
    for (; this.stackTop >= t; ) {
      const u = this.current;
      (this.tmplCount > 0 && this._isInTemplate() && (this.tmplCount -= 1),
        this.stackTop--,
        this._updateCurrentElement(),
        this.handler.onItemPop(u, this.stackTop < t));
    }
  }
  popUntilElementPopped(t) {
    const u = this._indexOf(t);
    this.shortenToLength(Math.max(u, 0));
  }
  popUntilPopped(t, u) {
    const s = this._indexOfTagNames(t, u);
    this.shortenToLength(Math.max(s, 0));
  }
  popUntilNumberedHeaderPopped() {
    this.popUntilPopped(zt, h.HTML);
  }
  popUntilTableCellPopped() {
    this.popUntilPopped(Hr, h.HTML);
  }
  popAllUpToHtmlElement() {
    ((this.tmplCount = 0), this.shortenToLength(1));
  }
  _indexOfTagNames(t, u) {
    for (let s = this.stackTop; s >= 0; s--)
      if (t.has(this.tagIDs[s]) && this.treeAdapter.getNamespaceURI(this.items[s]) === u) return s;
    return -1;
  }
  clearBackTo(t, u) {
    const s = this._indexOfTagNames(t, u);
    this.shortenToLength(s + 1);
  }
  clearBackToTableContext() {
    this.clearBackTo(Ur, h.HTML);
  }
  clearBackToTableBodyContext() {
    this.clearBackTo(Fr, h.HTML);
  }
  clearBackToTableRowContext() {
    this.clearBackTo(yr, h.HTML);
  }
  remove(t) {
    const u = this._indexOf(t);
    u >= 0 &&
      (u === this.stackTop
        ? this.pop()
        : (this.items.splice(u, 1),
          this.tagIDs.splice(u, 1),
          this.stackTop--,
          this._updateCurrentElement(),
          this.handler.onItemPop(t, !1)));
  }
  tryPeekProperlyNestedBodyElement() {
    return this.stackTop >= 1 && this.tagIDs[1] === a.BODY ? this.items[1] : null;
  }
  contains(t) {
    return this._indexOf(t) > -1;
  }
  getCommonAncestor(t) {
    const u = this._indexOf(t) - 1;
    return u >= 0 ? this.items[u] : null;
  }
  isRootHtmlElementCurrent() {
    return this.stackTop === 0 && this.tagIDs[0] === a.HTML;
  }
  hasInDynamicScope(t, u) {
    for (let s = this.stackTop; s >= 0; s--) {
      const c = this.tagIDs[s];
      switch (this.treeAdapter.getNamespaceURI(this.items[s])) {
        case h.HTML: {
          if (c === t) return !0;
          if (u.has(c)) return !1;
          break;
        }
        case h.SVG: {
          if (ta.has(c)) return !1;
          break;
        }
        case h.MATHML: {
          if (ea.has(c)) return !1;
          break;
        }
      }
    }
    return !0;
  }
  hasInScope(t) {
    return this.hasInDynamicScope(t, ft);
  }
  hasInListItemScope(t) {
    return this.hasInDynamicScope(t, kr);
  }
  hasInButtonScope(t) {
    return this.hasInDynamicScope(t, Br);
  }
  hasNumberedHeaderInScope() {
    for (let t = this.stackTop; t >= 0; t--) {
      const u = this.tagIDs[t];
      switch (this.treeAdapter.getNamespaceURI(this.items[t])) {
        case h.HTML: {
          if (zt.has(u)) return !0;
          if (ft.has(u)) return !1;
          break;
        }
        case h.SVG: {
          if (ta.has(u)) return !1;
          break;
        }
        case h.MATHML: {
          if (ea.has(u)) return !1;
          break;
        }
      }
    }
    return !0;
  }
  hasInTableScope(t) {
    for (let u = this.stackTop; u >= 0; u--)
      if (this.treeAdapter.getNamespaceURI(this.items[u]) === h.HTML)
        switch (this.tagIDs[u]) {
          case t:
            return !0;
          case a.TABLE:
          case a.HTML:
            return !1;
        }
    return !0;
  }
  hasTableBodyContextInTableScope() {
    for (let t = this.stackTop; t >= 0; t--)
      if (this.treeAdapter.getNamespaceURI(this.items[t]) === h.HTML)
        switch (this.tagIDs[t]) {
          case a.TBODY:
          case a.THEAD:
          case a.TFOOT:
            return !0;
          case a.TABLE:
          case a.HTML:
            return !1;
        }
    return !0;
  }
  hasInSelectScope(t) {
    for (let u = this.stackTop; u >= 0; u--)
      if (this.treeAdapter.getNamespaceURI(this.items[u]) === h.HTML)
        switch (this.tagIDs[u]) {
          case t:
            return !0;
          case a.OPTION:
          case a.OPTGROUP:
            break;
          default:
            return !1;
        }
    return !0;
  }
  generateImpliedEndTags() {
    for (; this.currentTagId !== void 0 && Sa.has(this.currentTagId); ) this.pop();
  }
  generateImpliedEndTagsThoroughly() {
    for (; this.currentTagId !== void 0 && Zu.has(this.currentTagId); ) this.pop();
  }
  generateImpliedEndTagsWithExclusion(t) {
    for (; this.currentTagId !== void 0 && this.currentTagId !== t && Zu.has(this.currentTagId); )
      this.pop();
  }
}
const Gt = 3;
var ue;
(function (e) {
  ((e[(e.Marker = 0)] = "Marker"), (e[(e.Element = 1)] = "Element"));
})(ue || (ue = {}));
const ua = { type: ue.Marker };
class vr {
  constructor(t) {
    ((this.treeAdapter = t), (this.entries = []), (this.bookmark = null));
  }
  _getNoahArkConditionCandidates(t, u) {
    const s = [],
      c = u.length,
      d = this.treeAdapter.getTagName(t),
      f = this.treeAdapter.getNamespaceURI(t);
    for (let b = 0; b < this.entries.length; b++) {
      const _ = this.entries[b];
      if (_.type === ue.Marker) break;
      const { element: C } = _;
      if (this.treeAdapter.getTagName(C) === d && this.treeAdapter.getNamespaceURI(C) === f) {
        const Q = this.treeAdapter.getAttrList(C);
        Q.length === c && s.push({ idx: b, attrs: Q });
      }
    }
    return s;
  }
  _ensureNoahArkCondition(t) {
    if (this.entries.length < Gt) return;
    const u = this.treeAdapter.getAttrList(t),
      s = this._getNoahArkConditionCandidates(t, u);
    if (s.length < Gt) return;
    const c = new Map(u.map((f) => [f.name, f.value]));
    let d = 0;
    for (let f = 0; f < s.length; f++) {
      const b = s[f];
      b.attrs.every((_) => c.get(_.name) === _.value) &&
        ((d += 1), d >= Gt && this.entries.splice(b.idx, 1));
    }
  }
  insertMarker() {
    this.entries.unshift(ua);
  }
  pushElement(t, u) {
    (this._ensureNoahArkCondition(t),
      this.entries.unshift({ type: ue.Element, element: t, token: u }));
  }
  insertElementAfterBookmark(t, u) {
    const s = this.entries.indexOf(this.bookmark);
    this.entries.splice(s, 0, { type: ue.Element, element: t, token: u });
  }
  removeEntry(t) {
    const u = this.entries.indexOf(t);
    u !== -1 && this.entries.splice(u, 1);
  }
  clearToLastMarker() {
    const t = this.entries.indexOf(ua);
    t === -1 ? (this.entries.length = 0) : this.entries.splice(0, t + 1);
  }
  getElementEntryInScopeWithTagName(t) {
    const u = this.entries.find(
      (s) => s.type === ue.Marker || this.treeAdapter.getTagName(s.element) === t,
    );
    return u && u.type === ue.Element ? u : null;
  }
  getElementEntry(t) {
    return this.entries.find((u) => u.type === ue.Element && u.element === t);
  }
}
const ce = {
    createDocument() {
      return { nodeName: "#document", mode: z.NO_QUIRKS, childNodes: [] };
    },
    createDocumentFragment() {
      return { nodeName: "#document-fragment", childNodes: [] };
    },
    createElement(e, t, u) {
      return {
        nodeName: e,
        tagName: e,
        attrs: u,
        namespaceURI: t,
        childNodes: [],
        parentNode: null,
      };
    },
    createCommentNode(e) {
      return { nodeName: "#comment", data: e, parentNode: null };
    },
    createTextNode(e) {
      return { nodeName: "#text", value: e, parentNode: null };
    },
    appendChild(e, t) {
      (e.childNodes.push(t), (t.parentNode = e));
    },
    insertBefore(e, t, u) {
      const s = e.childNodes.indexOf(u);
      (e.childNodes.splice(s, 0, t), (t.parentNode = e));
    },
    setTemplateContent(e, t) {
      e.content = t;
    },
    getTemplateContent(e) {
      return e.content;
    },
    setDocumentType(e, t, u, s) {
      const c = e.childNodes.find((d) => d.nodeName === "#documentType");
      if (c) ((c.name = t), (c.publicId = u), (c.systemId = s));
      else {
        const d = {
          nodeName: "#documentType",
          name: t,
          publicId: u,
          systemId: s,
          parentNode: null,
        };
        ce.appendChild(e, d);
      }
    },
    setDocumentMode(e, t) {
      e.mode = t;
    },
    getDocumentMode(e) {
      return e.mode;
    },
    detachNode(e) {
      if (e.parentNode) {
        const t = e.parentNode.childNodes.indexOf(e);
        (e.parentNode.childNodes.splice(t, 1), (e.parentNode = null));
      }
    },
    insertText(e, t) {
      if (e.childNodes.length > 0) {
        const u = e.childNodes[e.childNodes.length - 1];
        if (ce.isTextNode(u)) {
          u.value += t;
          return;
        }
      }
      ce.appendChild(e, ce.createTextNode(t));
    },
    insertTextBefore(e, t, u) {
      const s = e.childNodes[e.childNodes.indexOf(u) - 1];
      s && ce.isTextNode(s) ? (s.value += t) : ce.insertBefore(e, ce.createTextNode(t), u);
    },
    adoptAttributes(e, t) {
      const u = new Set(e.attrs.map((s) => s.name));
      for (let s = 0; s < t.length; s++) u.has(t[s].name) || e.attrs.push(t[s]);
    },
    getFirstChild(e) {
      return e.childNodes[0];
    },
    getChildNodes(e) {
      return e.childNodes;
    },
    getParentNode(e) {
      return e.parentNode;
    },
    getAttrList(e) {
      return e.attrs;
    },
    getTagName(e) {
      return e.tagName;
    },
    getNamespaceURI(e) {
      return e.namespaceURI;
    },
    getTextNodeContent(e) {
      return e.value;
    },
    getCommentNodeContent(e) {
      return e.data;
    },
    getDocumentTypeNodeName(e) {
      return e.name;
    },
    getDocumentTypeNodePublicId(e) {
      return e.publicId;
    },
    getDocumentTypeNodeSystemId(e) {
      return e.systemId;
    },
    isTextNode(e) {
      return e.nodeName === "#text";
    },
    isCommentNode(e) {
      return e.nodeName === "#comment";
    },
    isDocumentTypeNode(e) {
      return e.nodeName === "#documentType";
    },
    isElementNode(e) {
      return Object.prototype.hasOwnProperty.call(e, "tagName");
    },
    setNodeSourceCodeLocation(e, t) {
      e.sourceCodeLocation = t;
    },
    getNodeSourceCodeLocation(e) {
      return e.sourceCodeLocation;
    },
    updateNodeSourceCodeLocation(e, t) {
      e.sourceCodeLocation = { ...e.sourceCodeLocation, ...t };
    },
  },
  Oa = "html",
  Yr = "about:legacy-compat",
  Gr = "http://www.ibm.com/data/dtd/v11/ibmxhtml1-transitional.dtd",
  La = [
    "+//silmaril//dtd html pro v0r11 19970101//",
    "-//as//dtd html 3.0 aswedit + extensions//",
    "-//advasoft ltd//dtd html 3.0 aswedit + extensions//",
    "-//ietf//dtd html 2.0 level 1//",
    "-//ietf//dtd html 2.0 level 2//",
    "-//ietf//dtd html 2.0 strict level 1//",
    "-//ietf//dtd html 2.0 strict level 2//",
    "-//ietf//dtd html 2.0 strict//",
    "-//ietf//dtd html 2.0//",
    "-//ietf//dtd html 2.1e//",
    "-//ietf//dtd html 3.0//",
    "-//ietf//dtd html 3.2 final//",
    "-//ietf//dtd html 3.2//",
    "-//ietf//dtd html 3//",
    "-//ietf//dtd html level 0//",
    "-//ietf//dtd html level 1//",
    "-//ietf//dtd html level 2//",
    "-//ietf//dtd html level 3//",
    "-//ietf//dtd html strict level 0//",
    "-//ietf//dtd html strict level 1//",
    "-//ietf//dtd html strict level 2//",
    "-//ietf//dtd html strict level 3//",
    "-//ietf//dtd html strict//",
    "-//ietf//dtd html//",
    "-//metrius//dtd metrius presentational//",
    "-//microsoft//dtd internet explorer 2.0 html strict//",
    "-//microsoft//dtd internet explorer 2.0 html//",
    "-//microsoft//dtd internet explorer 2.0 tables//",
    "-//microsoft//dtd internet explorer 3.0 html strict//",
    "-//microsoft//dtd internet explorer 3.0 html//",
    "-//microsoft//dtd internet explorer 3.0 tables//",
    "-//netscape comm. corp.//dtd html//",
    "-//netscape comm. corp.//dtd strict html//",
    "-//o'reilly and associates//dtd html 2.0//",
    "-//o'reilly and associates//dtd html extended 1.0//",
    "-//o'reilly and associates//dtd html extended relaxed 1.0//",
    "-//sq//dtd html 2.0 hotmetal + extensions//",
    "-//softquad software//dtd hotmetal pro 6.0::19990601::extensions to html 4.0//",
    "-//softquad//dtd hotmetal pro 4.0::19971010::extensions to html 4.0//",
    "-//spyglass//dtd html 2.0 extended//",
    "-//sun microsystems corp.//dtd hotjava html//",
    "-//sun microsystems corp.//dtd hotjava strict html//",
    "-//w3c//dtd html 3 1995-03-24//",
    "-//w3c//dtd html 3.2 draft//",
    "-//w3c//dtd html 3.2 final//",
    "-//w3c//dtd html 3.2//",
    "-//w3c//dtd html 3.2s draft//",
    "-//w3c//dtd html 4.0 frameset//",
    "-//w3c//dtd html 4.0 transitional//",
    "-//w3c//dtd html experimental 19960712//",
    "-//w3c//dtd html experimental 970421//",
    "-//w3c//dtd w3 html//",
    "-//w3o//dtd w3 html 3.0//",
    "-//webtechs//dtd mozilla html 2.0//",
    "-//webtechs//dtd mozilla html//",
  ],
  Wr = [...La, "-//w3c//dtd html 4.01 frameset//", "-//w3c//dtd html 4.01 transitional//"],
  Qr = new Set([
    "-//w3o//dtd w3 html strict 3.0//en//",
    "-/w3c/dtd html 4.0 transitional/en",
    "html",
  ]),
  Ra = ["-//w3c//dtd xhtml 1.0 frameset//", "-//w3c//dtd xhtml 1.0 transitional//"],
  Xr = [...Ra, "-//w3c//dtd html 4.01 frameset//", "-//w3c//dtd html 4.01 transitional//"];
function aa(e, t) {
  return t.some((u) => e.startsWith(u));
}
function qr(e) {
  return e.name === Oa && e.publicId === null && (e.systemId === null || e.systemId === Yr);
}
function Kr(e) {
  if (e.name !== Oa) return z.QUIRKS;
  const { systemId: t } = e;
  if (t && t.toLowerCase() === Gr) return z.QUIRKS;
  let { publicId: u } = e;
  if (u !== null) {
    if (((u = u.toLowerCase()), Qr.has(u))) return z.QUIRKS;
    let s = t === null ? Wr : La;
    if (aa(u, s)) return z.QUIRKS;
    if (((s = t === null ? Ra : Xr), aa(u, s))) return z.LIMITED_QUIRKS;
  }
  return z.NO_QUIRKS;
}
const sa = { TEXT_HTML: "text/html", APPLICATION_XML: "application/xhtml+xml" },
  Vr = "definitionurl",
  zr = "definitionURL",
  jr = new Map(
    [
      "attributeName",
      "attributeType",
      "baseFrequency",
      "baseProfile",
      "calcMode",
      "clipPathUnits",
      "diffuseConstant",
      "edgeMode",
      "filterUnits",
      "glyphRef",
      "gradientTransform",
      "gradientUnits",
      "kernelMatrix",
      "kernelUnitLength",
      "keyPoints",
      "keySplines",
      "keyTimes",
      "lengthAdjust",
      "limitingConeAngle",
      "markerHeight",
      "markerUnits",
      "markerWidth",
      "maskContentUnits",
      "maskUnits",
      "numOctaves",
      "pathLength",
      "patternContentUnits",
      "patternTransform",
      "patternUnits",
      "pointsAtX",
      "pointsAtY",
      "pointsAtZ",
      "preserveAlpha",
      "preserveAspectRatio",
      "primitiveUnits",
      "refX",
      "refY",
      "repeatCount",
      "repeatDur",
      "requiredExtensions",
      "requiredFeatures",
      "specularConstant",
      "specularExponent",
      "spreadMethod",
      "startOffset",
      "stdDeviation",
      "stitchTiles",
      "surfaceScale",
      "systemLanguage",
      "tableValues",
      "targetX",
      "targetY",
      "textLength",
      "viewBox",
      "viewTarget",
      "xChannelSelector",
      "yChannelSelector",
      "zoomAndPan",
    ].map((e) => [e.toLowerCase(), e]),
  ),
  Jr = new Map([
    ["xlink:actuate", { prefix: "xlink", name: "actuate", namespace: h.XLINK }],
    ["xlink:arcrole", { prefix: "xlink", name: "arcrole", namespace: h.XLINK }],
    ["xlink:href", { prefix: "xlink", name: "href", namespace: h.XLINK }],
    ["xlink:role", { prefix: "xlink", name: "role", namespace: h.XLINK }],
    ["xlink:show", { prefix: "xlink", name: "show", namespace: h.XLINK }],
    ["xlink:title", { prefix: "xlink", name: "title", namespace: h.XLINK }],
    ["xlink:type", { prefix: "xlink", name: "type", namespace: h.XLINK }],
    ["xml:lang", { prefix: "xml", name: "lang", namespace: h.XML }],
    ["xml:space", { prefix: "xml", name: "space", namespace: h.XML }],
    ["xmlns", { prefix: "", name: "xmlns", namespace: h.XMLNS }],
    ["xmlns:xlink", { prefix: "xmlns", name: "xlink", namespace: h.XMLNS }],
  ]),
  $r = new Map(
    [
      "altGlyph",
      "altGlyphDef",
      "altGlyphItem",
      "animateColor",
      "animateMotion",
      "animateTransform",
      "clipPath",
      "feBlend",
      "feColorMatrix",
      "feComponentTransfer",
      "feComposite",
      "feConvolveMatrix",
      "feDiffuseLighting",
      "feDisplacementMap",
      "feDistantLight",
      "feFlood",
      "feFuncA",
      "feFuncB",
      "feFuncG",
      "feFuncR",
      "feGaussianBlur",
      "feImage",
      "feMerge",
      "feMergeNode",
      "feMorphology",
      "feOffset",
      "fePointLight",
      "feSpecularLighting",
      "feSpotLight",
      "feTile",
      "feTurbulence",
      "foreignObject",
      "glyphRef",
      "linearGradient",
      "radialGradient",
      "textPath",
    ].map((e) => [e.toLowerCase(), e]),
  ),
  Zr = new Set([
    a.B,
    a.BIG,
    a.BLOCKQUOTE,
    a.BODY,
    a.BR,
    a.CENTER,
    a.CODE,
    a.DD,
    a.DIV,
    a.DL,
    a.DT,
    a.EM,
    a.EMBED,
    a.H1,
    a.H2,
    a.H3,
    a.H4,
    a.H5,
    a.H6,
    a.HEAD,
    a.HR,
    a.I,
    a.IMG,
    a.LI,
    a.LISTING,
    a.MENU,
    a.META,
    a.NOBR,
    a.OL,
    a.P,
    a.PRE,
    a.RUBY,
    a.S,
    a.SMALL,
    a.SPAN,
    a.STRONG,
    a.STRIKE,
    a.SUB,
    a.SUP,
    a.TABLE,
    a.TT,
    a.U,
    a.UL,
    a.VAR,
  ]);
function en(e) {
  const t = e.tagID;
  return (
    (t === a.FONT &&
      e.attrs.some(({ name: s }) => s === Te.COLOR || s === Te.SIZE || s === Te.FACE)) ||
    Zr.has(t)
  );
}
function Da(e) {
  for (let t = 0; t < e.attrs.length; t++)
    if (e.attrs[t].name === Vr) {
      e.attrs[t].name = zr;
      break;
    }
}
function Pa(e) {
  for (let t = 0; t < e.attrs.length; t++) {
    const u = jr.get(e.attrs[t].name);
    u != null && (e.attrs[t].name = u);
  }
}
function tu(e) {
  for (let t = 0; t < e.attrs.length; t++) {
    const u = Jr.get(e.attrs[t].name);
    u &&
      ((e.attrs[t].prefix = u.prefix),
      (e.attrs[t].name = u.name),
      (e.attrs[t].namespace = u.namespace));
  }
}
function tn(e) {
  const t = $r.get(e.tagName);
  t != null && ((e.tagName = t), (e.tagID = Le(e.tagName)));
}
function un(e, t) {
  return t === h.MATHML && (e === a.MI || e === a.MO || e === a.MN || e === a.MS || e === a.MTEXT);
}
function an(e, t, u) {
  if (t === h.MATHML && e === a.ANNOTATION_XML) {
    for (let s = 0; s < u.length; s++)
      if (u[s].name === Te.ENCODING) {
        const c = u[s].value.toLowerCase();
        return c === sa.TEXT_HTML || c === sa.APPLICATION_XML;
      }
  }
  return t === h.SVG && (e === a.FOREIGN_OBJECT || e === a.DESC || e === a.TITLE);
}
function sn(e, t, u, s) {
  return ((!s || s === h.HTML) && an(e, t, u)) || ((!s || s === h.MATHML) && un(e, t));
}
const rn = "hidden",
  nn = 8,
  cn = 3;
var i;
(function (e) {
  ((e[(e.INITIAL = 0)] = "INITIAL"),
    (e[(e.BEFORE_HTML = 1)] = "BEFORE_HTML"),
    (e[(e.BEFORE_HEAD = 2)] = "BEFORE_HEAD"),
    (e[(e.IN_HEAD = 3)] = "IN_HEAD"),
    (e[(e.IN_HEAD_NO_SCRIPT = 4)] = "IN_HEAD_NO_SCRIPT"),
    (e[(e.AFTER_HEAD = 5)] = "AFTER_HEAD"),
    (e[(e.IN_BODY = 6)] = "IN_BODY"),
    (e[(e.TEXT = 7)] = "TEXT"),
    (e[(e.IN_TABLE = 8)] = "IN_TABLE"),
    (e[(e.IN_TABLE_TEXT = 9)] = "IN_TABLE_TEXT"),
    (e[(e.IN_CAPTION = 10)] = "IN_CAPTION"),
    (e[(e.IN_COLUMN_GROUP = 11)] = "IN_COLUMN_GROUP"),
    (e[(e.IN_TABLE_BODY = 12)] = "IN_TABLE_BODY"),
    (e[(e.IN_ROW = 13)] = "IN_ROW"),
    (e[(e.IN_CELL = 14)] = "IN_CELL"),
    (e[(e.IN_SELECT = 15)] = "IN_SELECT"),
    (e[(e.IN_SELECT_IN_TABLE = 16)] = "IN_SELECT_IN_TABLE"),
    (e[(e.IN_TEMPLATE = 17)] = "IN_TEMPLATE"),
    (e[(e.AFTER_BODY = 18)] = "AFTER_BODY"),
    (e[(e.IN_FRAMESET = 19)] = "IN_FRAMESET"),
    (e[(e.AFTER_FRAMESET = 20)] = "AFTER_FRAMESET"),
    (e[(e.AFTER_AFTER_BODY = 21)] = "AFTER_AFTER_BODY"),
    (e[(e.AFTER_AFTER_FRAMESET = 22)] = "AFTER_AFTER_FRAMESET"));
})(i || (i = {}));
const on = { startLine: -1, startCol: -1, startOffset: -1, endLine: -1, endCol: -1, endOffset: -1 },
  Ma = new Set([a.TABLE, a.TBODY, a.TFOOT, a.THEAD, a.TR]),
  ra = { scriptingEnabled: !0, sourceCodeLocationInfo: !1, treeAdapter: ce, onParseError: null };
class na {
  constructor(t, u, s = null, c = null) {
    ((this.fragmentContext = s),
      (this.scriptHandler = c),
      (this.currentToken = null),
      (this.stopped = !1),
      (this.insertionMode = i.INITIAL),
      (this.originalInsertionMode = i.INITIAL),
      (this.headElement = null),
      (this.formElement = null),
      (this.currentNotInHTML = !1),
      (this.tmplInsertionModeStack = []),
      (this.pendingCharacterTokens = []),
      (this.hasNonWhitespacePendingCharacterToken = !1),
      (this.framesetOk = !0),
      (this.skipNextNewLine = !1),
      (this.fosterParentingEnabled = !1),
      (this.options = { ...ra, ...t }),
      (this.treeAdapter = this.options.treeAdapter),
      (this.onParseError = this.options.onParseError),
      this.onParseError && (this.options.sourceCodeLocationInfo = !0),
      (this.document = u ?? this.treeAdapter.createDocument()),
      (this.tokenizer = new xr(this.options, this)),
      (this.activeFormattingElements = new vr(this.treeAdapter)),
      (this.fragmentContextID = s ? Le(this.treeAdapter.getTagName(s)) : a.UNKNOWN),
      this._setContextModes(s ?? this.document, this.fragmentContextID),
      (this.openElements = new wr(this.document, this.treeAdapter, this)));
  }
  static parse(t, u) {
    const s = new this(u);
    return (s.tokenizer.write(t, !0), s.document);
  }
  static getFragmentParser(t, u) {
    const s = { ...ra, ...u };
    t ?? (t = s.treeAdapter.createElement(l.TEMPLATE, h.HTML, []));
    const c = s.treeAdapter.createElement("documentmock", h.HTML, []),
      d = new this(s, c, t);
    return (
      d.fragmentContextID === a.TEMPLATE && d.tmplInsertionModeStack.unshift(i.IN_TEMPLATE),
      d._initTokenizerForFragmentParsing(),
      d._insertFakeRootElement(),
      d._resetInsertionMode(),
      d._findFormInFragmentContext(),
      d
    );
  }
  getFragment() {
    const t = this.treeAdapter.getFirstChild(this.document),
      u = this.treeAdapter.createDocumentFragment();
    return (this._adoptNodes(t, u), u);
  }
  _err(t, u, s) {
    var c;
    if (!this.onParseError) return;
    const d = (c = t.location) !== null && c !== void 0 ? c : on,
      f = {
        code: u,
        startLine: d.startLine,
        startCol: d.startCol,
        startOffset: d.startOffset,
        endLine: s ? d.startLine : d.endLine,
        endCol: s ? d.startCol : d.endCol,
        endOffset: s ? d.startOffset : d.endOffset,
      };
    this.onParseError(f);
  }
  onItemPush(t, u, s) {
    var c, d;
    ((d = (c = this.treeAdapter).onItemPush) === null || d === void 0 || d.call(c, t),
      s && this.openElements.stackTop > 0 && this._setContextModes(t, u));
  }
  onItemPop(t, u) {
    var s, c;
    if (
      (this.options.sourceCodeLocationInfo && this._setEndLocation(t, this.currentToken),
      (c = (s = this.treeAdapter).onItemPop) === null ||
        c === void 0 ||
        c.call(s, t, this.openElements.current),
      u)
    ) {
      let d, f;
      (this.openElements.stackTop === 0 && this.fragmentContext
        ? ((d = this.fragmentContext), (f = this.fragmentContextID))
        : ({ current: d, currentTagId: f } = this.openElements),
        this._setContextModes(d, f));
    }
  }
  _setContextModes(t, u) {
    const s = t === this.document || (t && this.treeAdapter.getNamespaceURI(t) === h.HTML);
    ((this.currentNotInHTML = !s),
      (this.tokenizer.inForeignNode =
        !s && t !== void 0 && u !== void 0 && !this._isIntegrationPoint(u, t)));
  }
  _switchToTextParsing(t, u) {
    (this._insertElement(t, h.HTML),
      (this.tokenizer.state = u),
      (this.originalInsertionMode = this.insertionMode),
      (this.insertionMode = i.TEXT));
  }
  switchToPlaintextParsing() {
    ((this.insertionMode = i.TEXT),
      (this.originalInsertionMode = i.IN_BODY),
      (this.tokenizer.state = R.PLAINTEXT));
  }
  _getAdjustedCurrentElement() {
    return this.openElements.stackTop === 0 && this.fragmentContext
      ? this.fragmentContext
      : this.openElements.current;
  }
  _findFormInFragmentContext() {
    let t = this.fragmentContext;
    for (; t; ) {
      if (this.treeAdapter.getTagName(t) === l.FORM) {
        this.formElement = t;
        break;
      }
      t = this.treeAdapter.getParentNode(t);
    }
  }
  _initTokenizerForFragmentParsing() {
    if (
      !(!this.fragmentContext || this.treeAdapter.getNamespaceURI(this.fragmentContext) !== h.HTML)
    )
      switch (this.fragmentContextID) {
        case a.TITLE:
        case a.TEXTAREA: {
          this.tokenizer.state = R.RCDATA;
          break;
        }
        case a.STYLE:
        case a.XMP:
        case a.IFRAME:
        case a.NOEMBED:
        case a.NOFRAMES:
        case a.NOSCRIPT: {
          this.tokenizer.state = R.RAWTEXT;
          break;
        }
        case a.SCRIPT: {
          this.tokenizer.state = R.SCRIPT_DATA;
          break;
        }
        case a.PLAINTEXT: {
          this.tokenizer.state = R.PLAINTEXT;
          break;
        }
      }
  }
  _setDocumentType(t) {
    const u = t.name || "",
      s = t.publicId || "",
      c = t.systemId || "";
    if ((this.treeAdapter.setDocumentType(this.document, u, s, c), t.location)) {
      const f = this.treeAdapter
        .getChildNodes(this.document)
        .find((b) => this.treeAdapter.isDocumentTypeNode(b));
      f && this.treeAdapter.setNodeSourceCodeLocation(f, t.location);
    }
  }
  _attachElementToTree(t, u) {
    if (this.options.sourceCodeLocationInfo) {
      const s = u && { ...u, startTag: u };
      this.treeAdapter.setNodeSourceCodeLocation(t, s);
    }
    if (this._shouldFosterParentOnInsertion()) this._fosterParentElement(t);
    else {
      const s = this.openElements.currentTmplContentOrNode;
      this.treeAdapter.appendChild(s ?? this.document, t);
    }
  }
  _appendElement(t, u) {
    const s = this.treeAdapter.createElement(t.tagName, u, t.attrs);
    this._attachElementToTree(s, t.location);
  }
  _insertElement(t, u) {
    const s = this.treeAdapter.createElement(t.tagName, u, t.attrs);
    (this._attachElementToTree(s, t.location), this.openElements.push(s, t.tagID));
  }
  _insertFakeElement(t, u) {
    const s = this.treeAdapter.createElement(t, h.HTML, []);
    (this._attachElementToTree(s, null), this.openElements.push(s, u));
  }
  _insertTemplate(t) {
    const u = this.treeAdapter.createElement(t.tagName, h.HTML, t.attrs),
      s = this.treeAdapter.createDocumentFragment();
    (this.treeAdapter.setTemplateContent(u, s),
      this._attachElementToTree(u, t.location),
      this.openElements.push(u, t.tagID),
      this.options.sourceCodeLocationInfo && this.treeAdapter.setNodeSourceCodeLocation(s, null));
  }
  _insertFakeRootElement() {
    const t = this.treeAdapter.createElement(l.HTML, h.HTML, []);
    (this.options.sourceCodeLocationInfo && this.treeAdapter.setNodeSourceCodeLocation(t, null),
      this.treeAdapter.appendChild(this.openElements.current, t),
      this.openElements.push(t, a.HTML));
  }
  _appendCommentNode(t, u) {
    const s = this.treeAdapter.createCommentNode(t.data);
    (this.treeAdapter.appendChild(u, s),
      this.options.sourceCodeLocationInfo &&
        this.treeAdapter.setNodeSourceCodeLocation(s, t.location));
  }
  _insertCharacters(t) {
    let u, s;
    if (
      (this._shouldFosterParentOnInsertion()
        ? (({ parent: u, beforeElement: s } = this._findFosterParentingLocation()),
          s
            ? this.treeAdapter.insertTextBefore(u, t.chars, s)
            : this.treeAdapter.insertText(u, t.chars))
        : ((u = this.openElements.currentTmplContentOrNode),
          this.treeAdapter.insertText(u, t.chars)),
      !t.location)
    )
      return;
    const c = this.treeAdapter.getChildNodes(u),
      d = s ? c.lastIndexOf(s) : c.length,
      f = c[d - 1];
    if (this.treeAdapter.getNodeSourceCodeLocation(f)) {
      const { endLine: _, endCol: C, endOffset: Q } = t.location;
      this.treeAdapter.updateNodeSourceCodeLocation(f, { endLine: _, endCol: C, endOffset: Q });
    } else
      this.options.sourceCodeLocationInfo &&
        this.treeAdapter.setNodeSourceCodeLocation(f, t.location);
  }
  _adoptNodes(t, u) {
    for (let s = this.treeAdapter.getFirstChild(t); s; s = this.treeAdapter.getFirstChild(t))
      (this.treeAdapter.detachNode(s), this.treeAdapter.appendChild(u, s));
  }
  _setEndLocation(t, u) {
    if (this.treeAdapter.getNodeSourceCodeLocation(t) && u.location) {
      const s = u.location,
        c = this.treeAdapter.getTagName(t),
        d =
          u.type === I.END_TAG && c === u.tagName
            ? { endTag: { ...s }, endLine: s.endLine, endCol: s.endCol, endOffset: s.endOffset }
            : { endLine: s.startLine, endCol: s.startCol, endOffset: s.startOffset };
      this.treeAdapter.updateNodeSourceCodeLocation(t, d);
    }
  }
  shouldProcessStartTagTokenInForeignContent(t) {
    if (!this.currentNotInHTML) return !1;
    let u, s;
    return (
      this.openElements.stackTop === 0 && this.fragmentContext
        ? ((u = this.fragmentContext), (s = this.fragmentContextID))
        : ({ current: u, currentTagId: s } = this.openElements),
      t.tagID === a.SVG &&
      this.treeAdapter.getTagName(u) === l.ANNOTATION_XML &&
      this.treeAdapter.getNamespaceURI(u) === h.MATHML
        ? !1
        : this.tokenizer.inForeignNode ||
          ((t.tagID === a.MGLYPH || t.tagID === a.MALIGNMARK) &&
            s !== void 0 &&
            !this._isIntegrationPoint(s, u, h.HTML))
    );
  }
  _processToken(t) {
    switch (t.type) {
      case I.CHARACTER: {
        this.onCharacter(t);
        break;
      }
      case I.NULL_CHARACTER: {
        this.onNullCharacter(t);
        break;
      }
      case I.COMMENT: {
        this.onComment(t);
        break;
      }
      case I.DOCTYPE: {
        this.onDoctype(t);
        break;
      }
      case I.START_TAG: {
        this._processStartTag(t);
        break;
      }
      case I.END_TAG: {
        this.onEndTag(t);
        break;
      }
      case I.EOF: {
        this.onEof(t);
        break;
      }
      case I.WHITESPACE_CHARACTER: {
        this.onWhitespaceCharacter(t);
        break;
      }
    }
  }
  _isIntegrationPoint(t, u, s) {
    const c = this.treeAdapter.getNamespaceURI(u),
      d = this.treeAdapter.getAttrList(u);
    return sn(t, c, d, s);
  }
  _reconstructActiveFormattingElements() {
    const t = this.activeFormattingElements.entries.length;
    if (t) {
      const u = this.activeFormattingElements.entries.findIndex(
          (c) => c.type === ue.Marker || this.openElements.contains(c.element),
        ),
        s = u === -1 ? t - 1 : u - 1;
      for (let c = s; c >= 0; c--) {
        const d = this.activeFormattingElements.entries[c];
        (this._insertElement(d.token, this.treeAdapter.getNamespaceURI(d.element)),
          (d.element = this.openElements.current));
      }
    }
  }
  _closeTableCell() {
    (this.openElements.generateImpliedEndTags(),
      this.openElements.popUntilTableCellPopped(),
      this.activeFormattingElements.clearToLastMarker(),
      (this.insertionMode = i.IN_ROW));
  }
  _closePElement() {
    (this.openElements.generateImpliedEndTagsWithExclusion(a.P),
      this.openElements.popUntilTagNamePopped(a.P));
  }
  _resetInsertionMode() {
    for (let t = this.openElements.stackTop; t >= 0; t--)
      switch (
        t === 0 && this.fragmentContext ? this.fragmentContextID : this.openElements.tagIDs[t]
      ) {
        case a.TR: {
          this.insertionMode = i.IN_ROW;
          return;
        }
        case a.TBODY:
        case a.THEAD:
        case a.TFOOT: {
          this.insertionMode = i.IN_TABLE_BODY;
          return;
        }
        case a.CAPTION: {
          this.insertionMode = i.IN_CAPTION;
          return;
        }
        case a.COLGROUP: {
          this.insertionMode = i.IN_COLUMN_GROUP;
          return;
        }
        case a.TABLE: {
          this.insertionMode = i.IN_TABLE;
          return;
        }
        case a.BODY: {
          this.insertionMode = i.IN_BODY;
          return;
        }
        case a.FRAMESET: {
          this.insertionMode = i.IN_FRAMESET;
          return;
        }
        case a.SELECT: {
          this._resetInsertionModeForSelect(t);
          return;
        }
        case a.TEMPLATE: {
          this.insertionMode = this.tmplInsertionModeStack[0];
          return;
        }
        case a.HTML: {
          this.insertionMode = this.headElement ? i.AFTER_HEAD : i.BEFORE_HEAD;
          return;
        }
        case a.TD:
        case a.TH: {
          if (t > 0) {
            this.insertionMode = i.IN_CELL;
            return;
          }
          break;
        }
        case a.HEAD: {
          if (t > 0) {
            this.insertionMode = i.IN_HEAD;
            return;
          }
          break;
        }
      }
    this.insertionMode = i.IN_BODY;
  }
  _resetInsertionModeForSelect(t) {
    if (t > 0)
      for (let u = t - 1; u > 0; u--) {
        const s = this.openElements.tagIDs[u];
        if (s === a.TEMPLATE) break;
        if (s === a.TABLE) {
          this.insertionMode = i.IN_SELECT_IN_TABLE;
          return;
        }
      }
    this.insertionMode = i.IN_SELECT;
  }
  _isElementCausesFosterParenting(t) {
    return Ma.has(t);
  }
  _shouldFosterParentOnInsertion() {
    return (
      this.fosterParentingEnabled &&
      this.openElements.currentTagId !== void 0 &&
      this._isElementCausesFosterParenting(this.openElements.currentTagId)
    );
  }
  _findFosterParentingLocation() {
    for (let t = this.openElements.stackTop; t >= 0; t--) {
      const u = this.openElements.items[t];
      switch (this.openElements.tagIDs[t]) {
        case a.TEMPLATE: {
          if (this.treeAdapter.getNamespaceURI(u) === h.HTML)
            return { parent: this.treeAdapter.getTemplateContent(u), beforeElement: null };
          break;
        }
        case a.TABLE: {
          const s = this.treeAdapter.getParentNode(u);
          return s
            ? { parent: s, beforeElement: u }
            : { parent: this.openElements.items[t - 1], beforeElement: null };
        }
      }
    }
    return { parent: this.openElements.items[0], beforeElement: null };
  }
  _fosterParentElement(t) {
    const u = this._findFosterParentingLocation();
    u.beforeElement
      ? this.treeAdapter.insertBefore(u.parent, t, u.beforeElement)
      : this.treeAdapter.appendChild(u.parent, t);
  }
  _isSpecialElement(t, u) {
    const s = this.treeAdapter.getNamespaceURI(t);
    return Rr[s].has(u);
  }
  onCharacter(t) {
    if (((this.skipNextNewLine = !1), this.tokenizer.inForeignNode)) {
      wi(this, t);
      return;
    }
    switch (this.insertionMode) {
      case i.INITIAL: {
        we(this, t);
        break;
      }
      case i.BEFORE_HTML: {
        We(this, t);
        break;
      }
      case i.BEFORE_HEAD: {
        Qe(this, t);
        break;
      }
      case i.IN_HEAD: {
        Xe(this, t);
        break;
      }
      case i.IN_HEAD_NO_SCRIPT: {
        qe(this, t);
        break;
      }
      case i.AFTER_HEAD: {
        Ke(this, t);
        break;
      }
      case i.IN_BODY:
      case i.IN_CAPTION:
      case i.IN_CELL:
      case i.IN_TEMPLATE: {
        ka(this, t);
        break;
      }
      case i.TEXT:
      case i.IN_SELECT:
      case i.IN_SELECT_IN_TABLE: {
        this._insertCharacters(t);
        break;
      }
      case i.IN_TABLE:
      case i.IN_TABLE_BODY:
      case i.IN_ROW: {
        Wt(this, t);
        break;
      }
      case i.IN_TABLE_TEXT: {
        wa(this, t);
        break;
      }
      case i.IN_COLUMN_GROUP: {
        Tt(this, t);
        break;
      }
      case i.AFTER_BODY: {
        ht(this, t);
        break;
      }
      case i.AFTER_AFTER_BODY: {
        Et(this, t);
        break;
      }
    }
  }
  onNullCharacter(t) {
    if (((this.skipNextNewLine = !1), this.tokenizer.inForeignNode)) {
      Hi(this, t);
      return;
    }
    switch (this.insertionMode) {
      case i.INITIAL: {
        we(this, t);
        break;
      }
      case i.BEFORE_HTML: {
        We(this, t);
        break;
      }
      case i.BEFORE_HEAD: {
        Qe(this, t);
        break;
      }
      case i.IN_HEAD: {
        Xe(this, t);
        break;
      }
      case i.IN_HEAD_NO_SCRIPT: {
        qe(this, t);
        break;
      }
      case i.AFTER_HEAD: {
        Ke(this, t);
        break;
      }
      case i.TEXT: {
        this._insertCharacters(t);
        break;
      }
      case i.IN_TABLE:
      case i.IN_TABLE_BODY:
      case i.IN_ROW: {
        Wt(this, t);
        break;
      }
      case i.IN_COLUMN_GROUP: {
        Tt(this, t);
        break;
      }
      case i.AFTER_BODY: {
        ht(this, t);
        break;
      }
      case i.AFTER_AFTER_BODY: {
        Et(this, t);
        break;
      }
    }
  }
  onComment(t) {
    if (((this.skipNextNewLine = !1), this.currentNotInHTML)) {
      jt(this, t);
      return;
    }
    switch (this.insertionMode) {
      case i.INITIAL:
      case i.BEFORE_HTML:
      case i.BEFORE_HEAD:
      case i.IN_HEAD:
      case i.IN_HEAD_NO_SCRIPT:
      case i.AFTER_HEAD:
      case i.IN_BODY:
      case i.IN_TABLE:
      case i.IN_CAPTION:
      case i.IN_COLUMN_GROUP:
      case i.IN_TABLE_BODY:
      case i.IN_ROW:
      case i.IN_CELL:
      case i.IN_SELECT:
      case i.IN_SELECT_IN_TABLE:
      case i.IN_TEMPLATE:
      case i.IN_FRAMESET:
      case i.AFTER_FRAMESET: {
        jt(this, t);
        break;
      }
      case i.IN_TABLE_TEXT: {
        ve(this, t);
        break;
      }
      case i.AFTER_BODY: {
        mn(this, t);
        break;
      }
      case i.AFTER_AFTER_BODY:
      case i.AFTER_AFTER_FRAMESET: {
        _n(this, t);
        break;
      }
    }
  }
  onDoctype(t) {
    switch (((this.skipNextNewLine = !1), this.insertionMode)) {
      case i.INITIAL: {
        bn(this, t);
        break;
      }
      case i.BEFORE_HEAD:
      case i.IN_HEAD:
      case i.IN_HEAD_NO_SCRIPT:
      case i.AFTER_HEAD: {
        this._err(t, E.misplacedDoctype);
        break;
      }
      case i.IN_TABLE_TEXT: {
        ve(this, t);
        break;
      }
    }
  }
  onStartTag(t) {
    ((this.skipNextNewLine = !1),
      (this.currentToken = t),
      this._processStartTag(t),
      t.selfClosing &&
        !t.ackSelfClosing &&
        this._err(t, E.nonVoidHtmlElementStartTagWithTrailingSolidus));
  }
  _processStartTag(t) {
    this.shouldProcessStartTagTokenInForeignContent(t)
      ? vi(this, t)
      : this._startTagOutsideForeignContent(t);
  }
  _startTagOutsideForeignContent(t) {
    switch (this.insertionMode) {
      case i.INITIAL: {
        we(this, t);
        break;
      }
      case i.BEFORE_HTML: {
        An(this, t);
        break;
      }
      case i.BEFORE_HEAD: {
        Nn(this, t);
        break;
      }
      case i.IN_HEAD: {
        Z(this, t);
        break;
      }
      case i.IN_HEAD_NO_SCRIPT: {
        gn(this, t);
        break;
      }
      case i.AFTER_HEAD: {
        On(this, t);
        break;
      }
      case i.IN_BODY: {
        w(this, t);
        break;
      }
      case i.IN_TABLE: {
        Se(this, t);
        break;
      }
      case i.IN_TABLE_TEXT: {
        ve(this, t);
        break;
      }
      case i.IN_CAPTION: {
        Ii(this, t);
        break;
      }
      case i.IN_COLUMN_GROUP: {
        su(this, t);
        break;
      }
      case i.IN_TABLE_BODY: {
        At(this, t);
        break;
      }
      case i.IN_ROW: {
        pt(this, t);
        break;
      }
      case i.IN_CELL: {
        Si(this, t);
        break;
      }
      case i.IN_SELECT: {
        Ga(this, t);
        break;
      }
      case i.IN_SELECT_IN_TABLE: {
        Li(this, t);
        break;
      }
      case i.IN_TEMPLATE: {
        Di(this, t);
        break;
      }
      case i.AFTER_BODY: {
        Mi(this, t);
        break;
      }
      case i.IN_FRAMESET: {
        xi(this, t);
        break;
      }
      case i.AFTER_FRAMESET: {
        Bi(this, t);
        break;
      }
      case i.AFTER_AFTER_BODY: {
        Fi(this, t);
        break;
      }
      case i.AFTER_AFTER_FRAMESET: {
        Ui(this, t);
        break;
      }
    }
  }
  onEndTag(t) {
    ((this.skipNextNewLine = !1),
      (this.currentToken = t),
      this.currentNotInHTML ? Yi(this, t) : this._endTagOutsideForeignContent(t));
  }
  _endTagOutsideForeignContent(t) {
    switch (this.insertionMode) {
      case i.INITIAL: {
        we(this, t);
        break;
      }
      case i.BEFORE_HTML: {
        pn(this, t);
        break;
      }
      case i.BEFORE_HEAD: {
        In(this, t);
        break;
      }
      case i.IN_HEAD: {
        Cn(this, t);
        break;
      }
      case i.IN_HEAD_NO_SCRIPT: {
        Sn(this, t);
        break;
      }
      case i.AFTER_HEAD: {
        Ln(this, t);
        break;
      }
      case i.IN_BODY: {
        bt(this, t);
        break;
      }
      case i.TEXT: {
        Ei(this, t);
        break;
      }
      case i.IN_TABLE: {
        Ve(this, t);
        break;
      }
      case i.IN_TABLE_TEXT: {
        ve(this, t);
        break;
      }
      case i.IN_CAPTION: {
        Ci(this, t);
        break;
      }
      case i.IN_COLUMN_GROUP: {
        gi(this, t);
        break;
      }
      case i.IN_TABLE_BODY: {
        Jt(this, t);
        break;
      }
      case i.IN_ROW: {
        Ya(this, t);
        break;
      }
      case i.IN_CELL: {
        Oi(this, t);
        break;
      }
      case i.IN_SELECT: {
        Wa(this, t);
        break;
      }
      case i.IN_SELECT_IN_TABLE: {
        Ri(this, t);
        break;
      }
      case i.IN_TEMPLATE: {
        Pi(this, t);
        break;
      }
      case i.AFTER_BODY: {
        Xa(this, t);
        break;
      }
      case i.IN_FRAMESET: {
        ki(this, t);
        break;
      }
      case i.AFTER_FRAMESET: {
        yi(this, t);
        break;
      }
      case i.AFTER_AFTER_BODY: {
        Et(this, t);
        break;
      }
    }
  }
  onEof(t) {
    switch (this.insertionMode) {
      case i.INITIAL: {
        we(this, t);
        break;
      }
      case i.BEFORE_HTML: {
        We(this, t);
        break;
      }
      case i.BEFORE_HEAD: {
        Qe(this, t);
        break;
      }
      case i.IN_HEAD: {
        Xe(this, t);
        break;
      }
      case i.IN_HEAD_NO_SCRIPT: {
        qe(this, t);
        break;
      }
      case i.AFTER_HEAD: {
        Ke(this, t);
        break;
      }
      case i.IN_BODY:
      case i.IN_TABLE:
      case i.IN_CAPTION:
      case i.IN_COLUMN_GROUP:
      case i.IN_TABLE_BODY:
      case i.IN_ROW:
      case i.IN_CELL:
      case i.IN_SELECT:
      case i.IN_SELECT_IN_TABLE: {
        Ua(this, t);
        break;
      }
      case i.TEXT: {
        fi(this, t);
        break;
      }
      case i.IN_TABLE_TEXT: {
        ve(this, t);
        break;
      }
      case i.IN_TEMPLATE: {
        Qa(this, t);
        break;
      }
      case i.AFTER_BODY:
      case i.IN_FRAMESET:
      case i.AFTER_FRAMESET:
      case i.AFTER_AFTER_BODY:
      case i.AFTER_AFTER_FRAMESET: {
        au(this, t);
        break;
      }
    }
  }
  onWhitespaceCharacter(t) {
    if (
      this.skipNextNewLine &&
      ((this.skipNextNewLine = !1), t.chars.charCodeAt(0) === r.LINE_FEED)
    ) {
      if (t.chars.length === 1) return;
      t.chars = t.chars.substr(1);
    }
    if (this.tokenizer.inForeignNode) {
      this._insertCharacters(t);
      return;
    }
    switch (this.insertionMode) {
      case i.IN_HEAD:
      case i.IN_HEAD_NO_SCRIPT:
      case i.AFTER_HEAD:
      case i.TEXT:
      case i.IN_COLUMN_GROUP:
      case i.IN_SELECT:
      case i.IN_SELECT_IN_TABLE:
      case i.IN_FRAMESET:
      case i.AFTER_FRAMESET: {
        this._insertCharacters(t);
        break;
      }
      case i.IN_BODY:
      case i.IN_CAPTION:
      case i.IN_CELL:
      case i.IN_TEMPLATE:
      case i.AFTER_BODY:
      case i.AFTER_AFTER_BODY:
      case i.AFTER_AFTER_FRAMESET: {
        xa(this, t);
        break;
      }
      case i.IN_TABLE:
      case i.IN_TABLE_BODY:
      case i.IN_ROW: {
        Wt(this, t);
        break;
      }
      case i.IN_TABLE_TEXT: {
        Ha(this, t);
        break;
      }
    }
  }
}
function dn(e, t) {
  let u = e.activeFormattingElements.getElementEntryInScopeWithTagName(t.tagName);
  return (
    u
      ? e.openElements.contains(u.element)
        ? e.openElements.hasInScope(t.tagID) || (u = null)
        : (e.activeFormattingElements.removeEntry(u), (u = null))
      : Fa(e, t),
    u
  );
}
function ln(e, t) {
  let u = null,
    s = e.openElements.stackTop;
  for (; s >= 0; s--) {
    const c = e.openElements.items[s];
    if (c === t.element) break;
    e._isSpecialElement(c, e.openElements.tagIDs[s]) && (u = c);
  }
  return (
    u ||
      (e.openElements.shortenToLength(Math.max(s, 0)), e.activeFormattingElements.removeEntry(t)),
    u
  );
}
function En(e, t, u) {
  let s = t,
    c = e.openElements.getCommonAncestor(t);
  for (let d = 0, f = c; f !== u; d++, f = c) {
    c = e.openElements.getCommonAncestor(f);
    const b = e.activeFormattingElements.getElementEntry(f),
      _ = b && d >= cn;
    !b || _
      ? (_ && e.activeFormattingElements.removeEntry(b), e.openElements.remove(f))
      : ((f = fn(e, b)),
        s === t && (e.activeFormattingElements.bookmark = b),
        e.treeAdapter.detachNode(s),
        e.treeAdapter.appendChild(f, s),
        (s = f));
  }
  return s;
}
function fn(e, t) {
  const u = e.treeAdapter.getNamespaceURI(t.element),
    s = e.treeAdapter.createElement(t.token.tagName, u, t.token.attrs);
  return (e.openElements.replace(t.element, s), (t.element = s), s);
}
function Tn(e, t, u) {
  const s = e.treeAdapter.getTagName(t),
    c = Le(s);
  if (e._isElementCausesFosterParenting(c)) e._fosterParentElement(u);
  else {
    const d = e.treeAdapter.getNamespaceURI(t);
    (c === a.TEMPLATE && d === h.HTML && (t = e.treeAdapter.getTemplateContent(t)),
      e.treeAdapter.appendChild(t, u));
  }
}
function hn(e, t, u) {
  const s = e.treeAdapter.getNamespaceURI(u.element),
    { token: c } = u,
    d = e.treeAdapter.createElement(c.tagName, s, c.attrs);
  (e._adoptNodes(t, d),
    e.treeAdapter.appendChild(t, d),
    e.activeFormattingElements.insertElementAfterBookmark(d, c),
    e.activeFormattingElements.removeEntry(u),
    e.openElements.remove(u.element),
    e.openElements.insertAfter(t, d, c.tagID));
}
function uu(e, t) {
  for (let u = 0; u < nn; u++) {
    const s = dn(e, t);
    if (!s) break;
    const c = ln(e, s);
    if (!c) break;
    e.activeFormattingElements.bookmark = s;
    const d = En(e, c, s.element),
      f = e.openElements.getCommonAncestor(s.element);
    (e.treeAdapter.detachNode(d), f && Tn(e, f, d), hn(e, c, s));
  }
}
function jt(e, t) {
  e._appendCommentNode(t, e.openElements.currentTmplContentOrNode);
}
function mn(e, t) {
  e._appendCommentNode(t, e.openElements.items[0]);
}
function _n(e, t) {
  e._appendCommentNode(t, e.document);
}
function au(e, t) {
  if (((e.stopped = !0), t.location)) {
    const u = e.fragmentContext ? 0 : 2;
    for (let s = e.openElements.stackTop; s >= u; s--)
      e._setEndLocation(e.openElements.items[s], t);
    if (!e.fragmentContext && e.openElements.stackTop >= 0) {
      const s = e.openElements.items[0],
        c = e.treeAdapter.getNodeSourceCodeLocation(s);
      if (c && !c.endTag && (e._setEndLocation(s, t), e.openElements.stackTop >= 1)) {
        const d = e.openElements.items[1],
          f = e.treeAdapter.getNodeSourceCodeLocation(d);
        f && !f.endTag && e._setEndLocation(d, t);
      }
    }
  }
}
function bn(e, t) {
  e._setDocumentType(t);
  const u = t.forceQuirks ? z.QUIRKS : Kr(t);
  (qr(t) || e._err(t, E.nonConformingDoctype),
    e.treeAdapter.setDocumentMode(e.document, u),
    (e.insertionMode = i.BEFORE_HTML));
}
function we(e, t) {
  (e._err(t, E.missingDoctype, !0),
    e.treeAdapter.setDocumentMode(e.document, z.QUIRKS),
    (e.insertionMode = i.BEFORE_HTML),
    e._processToken(t));
}
function An(e, t) {
  t.tagID === a.HTML ? (e._insertElement(t, h.HTML), (e.insertionMode = i.BEFORE_HEAD)) : We(e, t);
}
function pn(e, t) {
  const u = t.tagID;
  (u === a.HTML || u === a.HEAD || u === a.BODY || u === a.BR) && We(e, t);
}
function We(e, t) {
  (e._insertFakeRootElement(), (e.insertionMode = i.BEFORE_HEAD), e._processToken(t));
}
function Nn(e, t) {
  switch (t.tagID) {
    case a.HTML: {
      w(e, t);
      break;
    }
    case a.HEAD: {
      (e._insertElement(t, h.HTML),
        (e.headElement = e.openElements.current),
        (e.insertionMode = i.IN_HEAD));
      break;
    }
    default:
      Qe(e, t);
  }
}
function In(e, t) {
  const u = t.tagID;
  u === a.HEAD || u === a.BODY || u === a.HTML || u === a.BR
    ? Qe(e, t)
    : e._err(t, E.endTagWithoutMatchingOpenElement);
}
function Qe(e, t) {
  (e._insertFakeElement(l.HEAD, a.HEAD),
    (e.headElement = e.openElements.current),
    (e.insertionMode = i.IN_HEAD),
    e._processToken(t));
}
function Z(e, t) {
  switch (t.tagID) {
    case a.HTML: {
      w(e, t);
      break;
    }
    case a.BASE:
    case a.BASEFONT:
    case a.BGSOUND:
    case a.LINK:
    case a.META: {
      (e._appendElement(t, h.HTML), (t.ackSelfClosing = !0));
      break;
    }
    case a.TITLE: {
      e._switchToTextParsing(t, R.RCDATA);
      break;
    }
    case a.NOSCRIPT: {
      e.options.scriptingEnabled
        ? e._switchToTextParsing(t, R.RAWTEXT)
        : (e._insertElement(t, h.HTML), (e.insertionMode = i.IN_HEAD_NO_SCRIPT));
      break;
    }
    case a.NOFRAMES:
    case a.STYLE: {
      e._switchToTextParsing(t, R.RAWTEXT);
      break;
    }
    case a.SCRIPT: {
      e._switchToTextParsing(t, R.SCRIPT_DATA);
      break;
    }
    case a.TEMPLATE: {
      (e._insertTemplate(t),
        e.activeFormattingElements.insertMarker(),
        (e.framesetOk = !1),
        (e.insertionMode = i.IN_TEMPLATE),
        e.tmplInsertionModeStack.unshift(i.IN_TEMPLATE));
      break;
    }
    case a.HEAD: {
      e._err(t, E.misplacedStartTagForHeadElement);
      break;
    }
    default:
      Xe(e, t);
  }
}
function Cn(e, t) {
  switch (t.tagID) {
    case a.HEAD: {
      (e.openElements.pop(), (e.insertionMode = i.AFTER_HEAD));
      break;
    }
    case a.BODY:
    case a.BR:
    case a.HTML: {
      Xe(e, t);
      break;
    }
    case a.TEMPLATE: {
      me(e, t);
      break;
    }
    default:
      e._err(t, E.endTagWithoutMatchingOpenElement);
  }
}
function me(e, t) {
  e.openElements.tmplCount > 0
    ? (e.openElements.generateImpliedEndTagsThoroughly(),
      e.openElements.currentTagId !== a.TEMPLATE &&
        e._err(t, E.closingOfElementWithOpenChildElements),
      e.openElements.popUntilTagNamePopped(a.TEMPLATE),
      e.activeFormattingElements.clearToLastMarker(),
      e.tmplInsertionModeStack.shift(),
      e._resetInsertionMode())
    : e._err(t, E.endTagWithoutMatchingOpenElement);
}
function Xe(e, t) {
  (e.openElements.pop(), (e.insertionMode = i.AFTER_HEAD), e._processToken(t));
}
function gn(e, t) {
  switch (t.tagID) {
    case a.HTML: {
      w(e, t);
      break;
    }
    case a.BASEFONT:
    case a.BGSOUND:
    case a.HEAD:
    case a.LINK:
    case a.META:
    case a.NOFRAMES:
    case a.STYLE: {
      Z(e, t);
      break;
    }
    case a.NOSCRIPT: {
      e._err(t, E.nestedNoscriptInHead);
      break;
    }
    default:
      qe(e, t);
  }
}
function Sn(e, t) {
  switch (t.tagID) {
    case a.NOSCRIPT: {
      (e.openElements.pop(), (e.insertionMode = i.IN_HEAD));
      break;
    }
    case a.BR: {
      qe(e, t);
      break;
    }
    default:
      e._err(t, E.endTagWithoutMatchingOpenElement);
  }
}
function qe(e, t) {
  const u = t.type === I.EOF ? E.openElementsLeftAfterEof : E.disallowedContentInNoscriptInHead;
  (e._err(t, u), e.openElements.pop(), (e.insertionMode = i.IN_HEAD), e._processToken(t));
}
function On(e, t) {
  switch (t.tagID) {
    case a.HTML: {
      w(e, t);
      break;
    }
    case a.BODY: {
      (e._insertElement(t, h.HTML), (e.framesetOk = !1), (e.insertionMode = i.IN_BODY));
      break;
    }
    case a.FRAMESET: {
      (e._insertElement(t, h.HTML), (e.insertionMode = i.IN_FRAMESET));
      break;
    }
    case a.BASE:
    case a.BASEFONT:
    case a.BGSOUND:
    case a.LINK:
    case a.META:
    case a.NOFRAMES:
    case a.SCRIPT:
    case a.STYLE:
    case a.TEMPLATE:
    case a.TITLE: {
      (e._err(t, E.abandonedHeadElementChild),
        e.openElements.push(e.headElement, a.HEAD),
        Z(e, t),
        e.openElements.remove(e.headElement));
      break;
    }
    case a.HEAD: {
      e._err(t, E.misplacedStartTagForHeadElement);
      break;
    }
    default:
      Ke(e, t);
  }
}
function Ln(e, t) {
  switch (t.tagID) {
    case a.BODY:
    case a.HTML:
    case a.BR: {
      Ke(e, t);
      break;
    }
    case a.TEMPLATE: {
      me(e, t);
      break;
    }
    default:
      e._err(t, E.endTagWithoutMatchingOpenElement);
  }
}
function Ke(e, t) {
  (e._insertFakeElement(l.BODY, a.BODY), (e.insertionMode = i.IN_BODY), _t(e, t));
}
function _t(e, t) {
  switch (t.type) {
    case I.CHARACTER: {
      ka(e, t);
      break;
    }
    case I.WHITESPACE_CHARACTER: {
      xa(e, t);
      break;
    }
    case I.COMMENT: {
      jt(e, t);
      break;
    }
    case I.START_TAG: {
      w(e, t);
      break;
    }
    case I.END_TAG: {
      bt(e, t);
      break;
    }
    case I.EOF: {
      Ua(e, t);
      break;
    }
  }
}
function xa(e, t) {
  (e._reconstructActiveFormattingElements(), e._insertCharacters(t));
}
function ka(e, t) {
  (e._reconstructActiveFormattingElements(), e._insertCharacters(t), (e.framesetOk = !1));
}
function Rn(e, t) {
  e.openElements.tmplCount === 0 && e.treeAdapter.adoptAttributes(e.openElements.items[0], t.attrs);
}
function Dn(e, t) {
  const u = e.openElements.tryPeekProperlyNestedBodyElement();
  u &&
    e.openElements.tmplCount === 0 &&
    ((e.framesetOk = !1), e.treeAdapter.adoptAttributes(u, t.attrs));
}
function Pn(e, t) {
  const u = e.openElements.tryPeekProperlyNestedBodyElement();
  e.framesetOk &&
    u &&
    (e.treeAdapter.detachNode(u),
    e.openElements.popAllUpToHtmlElement(),
    e._insertElement(t, h.HTML),
    (e.insertionMode = i.IN_FRAMESET));
}
function Mn(e, t) {
  (e.openElements.hasInButtonScope(a.P) && e._closePElement(), e._insertElement(t, h.HTML));
}
function xn(e, t) {
  (e.openElements.hasInButtonScope(a.P) && e._closePElement(),
    e.openElements.currentTagId !== void 0 &&
      zt.has(e.openElements.currentTagId) &&
      e.openElements.pop(),
    e._insertElement(t, h.HTML));
}
function kn(e, t) {
  (e.openElements.hasInButtonScope(a.P) && e._closePElement(),
    e._insertElement(t, h.HTML),
    (e.skipNextNewLine = !0),
    (e.framesetOk = !1));
}
function Bn(e, t) {
  const u = e.openElements.tmplCount > 0;
  (!e.formElement || u) &&
    (e.openElements.hasInButtonScope(a.P) && e._closePElement(),
    e._insertElement(t, h.HTML),
    u || (e.formElement = e.openElements.current));
}
function yn(e, t) {
  e.framesetOk = !1;
  const u = t.tagID;
  for (let s = e.openElements.stackTop; s >= 0; s--) {
    const c = e.openElements.tagIDs[s];
    if ((u === a.LI && c === a.LI) || ((u === a.DD || u === a.DT) && (c === a.DD || c === a.DT))) {
      (e.openElements.generateImpliedEndTagsWithExclusion(c),
        e.openElements.popUntilTagNamePopped(c));
      break;
    }
    if (
      c !== a.ADDRESS &&
      c !== a.DIV &&
      c !== a.P &&
      e._isSpecialElement(e.openElements.items[s], c)
    )
      break;
  }
  (e.openElements.hasInButtonScope(a.P) && e._closePElement(), e._insertElement(t, h.HTML));
}
function Fn(e, t) {
  (e.openElements.hasInButtonScope(a.P) && e._closePElement(),
    e._insertElement(t, h.HTML),
    (e.tokenizer.state = R.PLAINTEXT));
}
function Un(e, t) {
  (e.openElements.hasInScope(a.BUTTON) &&
    (e.openElements.generateImpliedEndTags(), e.openElements.popUntilTagNamePopped(a.BUTTON)),
    e._reconstructActiveFormattingElements(),
    e._insertElement(t, h.HTML),
    (e.framesetOk = !1));
}
function Hn(e, t) {
  const u = e.activeFormattingElements.getElementEntryInScopeWithTagName(l.A);
  (u && (uu(e, t), e.openElements.remove(u.element), e.activeFormattingElements.removeEntry(u)),
    e._reconstructActiveFormattingElements(),
    e._insertElement(t, h.HTML),
    e.activeFormattingElements.pushElement(e.openElements.current, t));
}
function wn(e, t) {
  (e._reconstructActiveFormattingElements(),
    e._insertElement(t, h.HTML),
    e.activeFormattingElements.pushElement(e.openElements.current, t));
}
function vn(e, t) {
  (e._reconstructActiveFormattingElements(),
    e.openElements.hasInScope(a.NOBR) && (uu(e, t), e._reconstructActiveFormattingElements()),
    e._insertElement(t, h.HTML),
    e.activeFormattingElements.pushElement(e.openElements.current, t));
}
function Yn(e, t) {
  (e._reconstructActiveFormattingElements(),
    e._insertElement(t, h.HTML),
    e.activeFormattingElements.insertMarker(),
    (e.framesetOk = !1));
}
function Gn(e, t) {
  (e.treeAdapter.getDocumentMode(e.document) !== z.QUIRKS &&
    e.openElements.hasInButtonScope(a.P) &&
    e._closePElement(),
    e._insertElement(t, h.HTML),
    (e.framesetOk = !1),
    (e.insertionMode = i.IN_TABLE));
}
function Ba(e, t) {
  (e._reconstructActiveFormattingElements(),
    e._appendElement(t, h.HTML),
    (e.framesetOk = !1),
    (t.ackSelfClosing = !0));
}
function ya(e) {
  const t = Ca(e, Te.TYPE);
  return t != null && t.toLowerCase() === rn;
}
function Wn(e, t) {
  (e._reconstructActiveFormattingElements(),
    e._appendElement(t, h.HTML),
    ya(t) || (e.framesetOk = !1),
    (t.ackSelfClosing = !0));
}
function Qn(e, t) {
  (e._appendElement(t, h.HTML), (t.ackSelfClosing = !0));
}
function Xn(e, t) {
  (e.openElements.hasInButtonScope(a.P) && e._closePElement(),
    e._appendElement(t, h.HTML),
    (e.framesetOk = !1),
    (t.ackSelfClosing = !0));
}
function qn(e, t) {
  ((t.tagName = l.IMG), (t.tagID = a.IMG), Ba(e, t));
}
function Kn(e, t) {
  (e._insertElement(t, h.HTML),
    (e.skipNextNewLine = !0),
    (e.tokenizer.state = R.RCDATA),
    (e.originalInsertionMode = e.insertionMode),
    (e.framesetOk = !1),
    (e.insertionMode = i.TEXT));
}
function Vn(e, t) {
  (e.openElements.hasInButtonScope(a.P) && e._closePElement(),
    e._reconstructActiveFormattingElements(),
    (e.framesetOk = !1),
    e._switchToTextParsing(t, R.RAWTEXT));
}
function zn(e, t) {
  ((e.framesetOk = !1), e._switchToTextParsing(t, R.RAWTEXT));
}
function ia(e, t) {
  e._switchToTextParsing(t, R.RAWTEXT);
}
function jn(e, t) {
  (e._reconstructActiveFormattingElements(),
    e._insertElement(t, h.HTML),
    (e.framesetOk = !1),
    (e.insertionMode =
      e.insertionMode === i.IN_TABLE ||
      e.insertionMode === i.IN_CAPTION ||
      e.insertionMode === i.IN_TABLE_BODY ||
      e.insertionMode === i.IN_ROW ||
      e.insertionMode === i.IN_CELL
        ? i.IN_SELECT_IN_TABLE
        : i.IN_SELECT));
}
function Jn(e, t) {
  (e.openElements.currentTagId === a.OPTION && e.openElements.pop(),
    e._reconstructActiveFormattingElements(),
    e._insertElement(t, h.HTML));
}
function $n(e, t) {
  (e.openElements.hasInScope(a.RUBY) && e.openElements.generateImpliedEndTags(),
    e._insertElement(t, h.HTML));
}
function Zn(e, t) {
  (e.openElements.hasInScope(a.RUBY) && e.openElements.generateImpliedEndTagsWithExclusion(a.RTC),
    e._insertElement(t, h.HTML));
}
function ei(e, t) {
  (e._reconstructActiveFormattingElements(),
    Da(t),
    tu(t),
    t.selfClosing ? e._appendElement(t, h.MATHML) : e._insertElement(t, h.MATHML),
    (t.ackSelfClosing = !0));
}
function ti(e, t) {
  (e._reconstructActiveFormattingElements(),
    Pa(t),
    tu(t),
    t.selfClosing ? e._appendElement(t, h.SVG) : e._insertElement(t, h.SVG),
    (t.ackSelfClosing = !0));
}
function ca(e, t) {
  (e._reconstructActiveFormattingElements(), e._insertElement(t, h.HTML));
}
function w(e, t) {
  switch (t.tagID) {
    case a.I:
    case a.S:
    case a.B:
    case a.U:
    case a.EM:
    case a.TT:
    case a.BIG:
    case a.CODE:
    case a.FONT:
    case a.SMALL:
    case a.STRIKE:
    case a.STRONG: {
      wn(e, t);
      break;
    }
    case a.A: {
      Hn(e, t);
      break;
    }
    case a.H1:
    case a.H2:
    case a.H3:
    case a.H4:
    case a.H5:
    case a.H6: {
      xn(e, t);
      break;
    }
    case a.P:
    case a.DL:
    case a.OL:
    case a.UL:
    case a.DIV:
    case a.DIR:
    case a.NAV:
    case a.MAIN:
    case a.MENU:
    case a.ASIDE:
    case a.CENTER:
    case a.FIGURE:
    case a.FOOTER:
    case a.HEADER:
    case a.HGROUP:
    case a.DIALOG:
    case a.DETAILS:
    case a.ADDRESS:
    case a.ARTICLE:
    case a.SEARCH:
    case a.SECTION:
    case a.SUMMARY:
    case a.FIELDSET:
    case a.BLOCKQUOTE:
    case a.FIGCAPTION: {
      Mn(e, t);
      break;
    }
    case a.LI:
    case a.DD:
    case a.DT: {
      yn(e, t);
      break;
    }
    case a.BR:
    case a.IMG:
    case a.WBR:
    case a.AREA:
    case a.EMBED:
    case a.KEYGEN: {
      Ba(e, t);
      break;
    }
    case a.HR: {
      Xn(e, t);
      break;
    }
    case a.RB:
    case a.RTC: {
      $n(e, t);
      break;
    }
    case a.RT:
    case a.RP: {
      Zn(e, t);
      break;
    }
    case a.PRE:
    case a.LISTING: {
      kn(e, t);
      break;
    }
    case a.XMP: {
      Vn(e, t);
      break;
    }
    case a.SVG: {
      ti(e, t);
      break;
    }
    case a.HTML: {
      Rn(e, t);
      break;
    }
    case a.BASE:
    case a.LINK:
    case a.META:
    case a.STYLE:
    case a.TITLE:
    case a.SCRIPT:
    case a.BGSOUND:
    case a.BASEFONT:
    case a.TEMPLATE: {
      Z(e, t);
      break;
    }
    case a.BODY: {
      Dn(e, t);
      break;
    }
    case a.FORM: {
      Bn(e, t);
      break;
    }
    case a.NOBR: {
      vn(e, t);
      break;
    }
    case a.MATH: {
      ei(e, t);
      break;
    }
    case a.TABLE: {
      Gn(e, t);
      break;
    }
    case a.INPUT: {
      Wn(e, t);
      break;
    }
    case a.PARAM:
    case a.TRACK:
    case a.SOURCE: {
      Qn(e, t);
      break;
    }
    case a.IMAGE: {
      qn(e, t);
      break;
    }
    case a.BUTTON: {
      Un(e, t);
      break;
    }
    case a.APPLET:
    case a.OBJECT:
    case a.MARQUEE: {
      Yn(e, t);
      break;
    }
    case a.IFRAME: {
      zn(e, t);
      break;
    }
    case a.SELECT: {
      jn(e, t);
      break;
    }
    case a.OPTION:
    case a.OPTGROUP: {
      Jn(e, t);
      break;
    }
    case a.NOEMBED:
    case a.NOFRAMES: {
      ia(e, t);
      break;
    }
    case a.FRAMESET: {
      Pn(e, t);
      break;
    }
    case a.TEXTAREA: {
      Kn(e, t);
      break;
    }
    case a.NOSCRIPT: {
      e.options.scriptingEnabled ? ia(e, t) : ca(e, t);
      break;
    }
    case a.PLAINTEXT: {
      Fn(e, t);
      break;
    }
    case a.COL:
    case a.TH:
    case a.TD:
    case a.TR:
    case a.HEAD:
    case a.FRAME:
    case a.TBODY:
    case a.TFOOT:
    case a.THEAD:
    case a.CAPTION:
    case a.COLGROUP:
      break;
    default:
      ca(e, t);
  }
}
function ui(e, t) {
  if (
    e.openElements.hasInScope(a.BODY) &&
    ((e.insertionMode = i.AFTER_BODY), e.options.sourceCodeLocationInfo)
  ) {
    const u = e.openElements.tryPeekProperlyNestedBodyElement();
    u && e._setEndLocation(u, t);
  }
}
function ai(e, t) {
  e.openElements.hasInScope(a.BODY) && ((e.insertionMode = i.AFTER_BODY), Xa(e, t));
}
function si(e, t) {
  const u = t.tagID;
  e.openElements.hasInScope(u) &&
    (e.openElements.generateImpliedEndTags(), e.openElements.popUntilTagNamePopped(u));
}
function ri(e) {
  const t = e.openElements.tmplCount > 0,
    { formElement: u } = e;
  (t || (e.formElement = null),
    (u || t) &&
      e.openElements.hasInScope(a.FORM) &&
      (e.openElements.generateImpliedEndTags(),
      t ? e.openElements.popUntilTagNamePopped(a.FORM) : u && e.openElements.remove(u)));
}
function ni(e) {
  (e.openElements.hasInButtonScope(a.P) || e._insertFakeElement(l.P, a.P), e._closePElement());
}
function ii(e) {
  e.openElements.hasInListItemScope(a.LI) &&
    (e.openElements.generateImpliedEndTagsWithExclusion(a.LI),
    e.openElements.popUntilTagNamePopped(a.LI));
}
function ci(e, t) {
  const u = t.tagID;
  e.openElements.hasInScope(u) &&
    (e.openElements.generateImpliedEndTagsWithExclusion(u),
    e.openElements.popUntilTagNamePopped(u));
}
function oi(e) {
  e.openElements.hasNumberedHeaderInScope() &&
    (e.openElements.generateImpliedEndTags(), e.openElements.popUntilNumberedHeaderPopped());
}
function di(e, t) {
  const u = t.tagID;
  e.openElements.hasInScope(u) &&
    (e.openElements.generateImpliedEndTags(),
    e.openElements.popUntilTagNamePopped(u),
    e.activeFormattingElements.clearToLastMarker());
}
function li(e) {
  (e._reconstructActiveFormattingElements(),
    e._insertFakeElement(l.BR, a.BR),
    e.openElements.pop(),
    (e.framesetOk = !1));
}
function Fa(e, t) {
  const u = t.tagName,
    s = t.tagID;
  for (let c = e.openElements.stackTop; c > 0; c--) {
    const d = e.openElements.items[c],
      f = e.openElements.tagIDs[c];
    if (s === f && (s !== a.UNKNOWN || e.treeAdapter.getTagName(d) === u)) {
      (e.openElements.generateImpliedEndTagsWithExclusion(s),
        e.openElements.stackTop >= c && e.openElements.shortenToLength(c));
      break;
    }
    if (e._isSpecialElement(d, f)) break;
  }
}
function bt(e, t) {
  switch (t.tagID) {
    case a.A:
    case a.B:
    case a.I:
    case a.S:
    case a.U:
    case a.EM:
    case a.TT:
    case a.BIG:
    case a.CODE:
    case a.FONT:
    case a.NOBR:
    case a.SMALL:
    case a.STRIKE:
    case a.STRONG: {
      uu(e, t);
      break;
    }
    case a.P: {
      ni(e);
      break;
    }
    case a.DL:
    case a.UL:
    case a.OL:
    case a.DIR:
    case a.DIV:
    case a.NAV:
    case a.PRE:
    case a.MAIN:
    case a.MENU:
    case a.ASIDE:
    case a.BUTTON:
    case a.CENTER:
    case a.FIGURE:
    case a.FOOTER:
    case a.HEADER:
    case a.HGROUP:
    case a.DIALOG:
    case a.ADDRESS:
    case a.ARTICLE:
    case a.DETAILS:
    case a.SEARCH:
    case a.SECTION:
    case a.SUMMARY:
    case a.LISTING:
    case a.FIELDSET:
    case a.BLOCKQUOTE:
    case a.FIGCAPTION: {
      si(e, t);
      break;
    }
    case a.LI: {
      ii(e);
      break;
    }
    case a.DD:
    case a.DT: {
      ci(e, t);
      break;
    }
    case a.H1:
    case a.H2:
    case a.H3:
    case a.H4:
    case a.H5:
    case a.H6: {
      oi(e);
      break;
    }
    case a.BR: {
      li(e);
      break;
    }
    case a.BODY: {
      ui(e, t);
      break;
    }
    case a.HTML: {
      ai(e, t);
      break;
    }
    case a.FORM: {
      ri(e);
      break;
    }
    case a.APPLET:
    case a.OBJECT:
    case a.MARQUEE: {
      di(e, t);
      break;
    }
    case a.TEMPLATE: {
      me(e, t);
      break;
    }
    default:
      Fa(e, t);
  }
}
function Ua(e, t) {
  e.tmplInsertionModeStack.length > 0 ? Qa(e, t) : au(e, t);
}
function Ei(e, t) {
  var u;
  (t.tagID === a.SCRIPT &&
    ((u = e.scriptHandler) === null || u === void 0 || u.call(e, e.openElements.current)),
    e.openElements.pop(),
    (e.insertionMode = e.originalInsertionMode));
}
function fi(e, t) {
  (e._err(t, E.eofInElementThatCanContainOnlyText),
    e.openElements.pop(),
    (e.insertionMode = e.originalInsertionMode),
    e.onEof(t));
}
function Wt(e, t) {
  if (e.openElements.currentTagId !== void 0 && Ma.has(e.openElements.currentTagId))
    switch (
      ((e.pendingCharacterTokens.length = 0),
      (e.hasNonWhitespacePendingCharacterToken = !1),
      (e.originalInsertionMode = e.insertionMode),
      (e.insertionMode = i.IN_TABLE_TEXT),
      t.type)
    ) {
      case I.CHARACTER: {
        wa(e, t);
        break;
      }
      case I.WHITESPACE_CHARACTER: {
        Ha(e, t);
        break;
      }
    }
  else je(e, t);
}
function Ti(e, t) {
  (e.openElements.clearBackToTableContext(),
    e.activeFormattingElements.insertMarker(),
    e._insertElement(t, h.HTML),
    (e.insertionMode = i.IN_CAPTION));
}
function hi(e, t) {
  (e.openElements.clearBackToTableContext(),
    e._insertElement(t, h.HTML),
    (e.insertionMode = i.IN_COLUMN_GROUP));
}
function mi(e, t) {
  (e.openElements.clearBackToTableContext(),
    e._insertFakeElement(l.COLGROUP, a.COLGROUP),
    (e.insertionMode = i.IN_COLUMN_GROUP),
    su(e, t));
}
function _i(e, t) {
  (e.openElements.clearBackToTableContext(),
    e._insertElement(t, h.HTML),
    (e.insertionMode = i.IN_TABLE_BODY));
}
function bi(e, t) {
  (e.openElements.clearBackToTableContext(),
    e._insertFakeElement(l.TBODY, a.TBODY),
    (e.insertionMode = i.IN_TABLE_BODY),
    At(e, t));
}
function Ai(e, t) {
  e.openElements.hasInTableScope(a.TABLE) &&
    (e.openElements.popUntilTagNamePopped(a.TABLE), e._resetInsertionMode(), e._processStartTag(t));
}
function pi(e, t) {
  (ya(t) ? e._appendElement(t, h.HTML) : je(e, t), (t.ackSelfClosing = !0));
}
function Ni(e, t) {
  !e.formElement &&
    e.openElements.tmplCount === 0 &&
    (e._insertElement(t, h.HTML), (e.formElement = e.openElements.current), e.openElements.pop());
}
function Se(e, t) {
  switch (t.tagID) {
    case a.TD:
    case a.TH:
    case a.TR: {
      bi(e, t);
      break;
    }
    case a.STYLE:
    case a.SCRIPT:
    case a.TEMPLATE: {
      Z(e, t);
      break;
    }
    case a.COL: {
      mi(e, t);
      break;
    }
    case a.FORM: {
      Ni(e, t);
      break;
    }
    case a.TABLE: {
      Ai(e, t);
      break;
    }
    case a.TBODY:
    case a.TFOOT:
    case a.THEAD: {
      _i(e, t);
      break;
    }
    case a.INPUT: {
      pi(e, t);
      break;
    }
    case a.CAPTION: {
      Ti(e, t);
      break;
    }
    case a.COLGROUP: {
      hi(e, t);
      break;
    }
    default:
      je(e, t);
  }
}
function Ve(e, t) {
  switch (t.tagID) {
    case a.TABLE: {
      e.openElements.hasInTableScope(a.TABLE) &&
        (e.openElements.popUntilTagNamePopped(a.TABLE), e._resetInsertionMode());
      break;
    }
    case a.TEMPLATE: {
      me(e, t);
      break;
    }
    case a.BODY:
    case a.CAPTION:
    case a.COL:
    case a.COLGROUP:
    case a.HTML:
    case a.TBODY:
    case a.TD:
    case a.TFOOT:
    case a.TH:
    case a.THEAD:
    case a.TR:
      break;
    default:
      je(e, t);
  }
}
function je(e, t) {
  const u = e.fosterParentingEnabled;
  ((e.fosterParentingEnabled = !0), _t(e, t), (e.fosterParentingEnabled = u));
}
function Ha(e, t) {
  e.pendingCharacterTokens.push(t);
}
function wa(e, t) {
  (e.pendingCharacterTokens.push(t), (e.hasNonWhitespacePendingCharacterToken = !0));
}
function ve(e, t) {
  let u = 0;
  if (e.hasNonWhitespacePendingCharacterToken)
    for (; u < e.pendingCharacterTokens.length; u++) je(e, e.pendingCharacterTokens[u]);
  else
    for (; u < e.pendingCharacterTokens.length; u++)
      e._insertCharacters(e.pendingCharacterTokens[u]);
  ((e.insertionMode = e.originalInsertionMode), e._processToken(t));
}
const va = new Set([a.CAPTION, a.COL, a.COLGROUP, a.TBODY, a.TD, a.TFOOT, a.TH, a.THEAD, a.TR]);
function Ii(e, t) {
  const u = t.tagID;
  va.has(u)
    ? e.openElements.hasInTableScope(a.CAPTION) &&
      (e.openElements.generateImpliedEndTags(),
      e.openElements.popUntilTagNamePopped(a.CAPTION),
      e.activeFormattingElements.clearToLastMarker(),
      (e.insertionMode = i.IN_TABLE),
      Se(e, t))
    : w(e, t);
}
function Ci(e, t) {
  const u = t.tagID;
  switch (u) {
    case a.CAPTION:
    case a.TABLE: {
      e.openElements.hasInTableScope(a.CAPTION) &&
        (e.openElements.generateImpliedEndTags(),
        e.openElements.popUntilTagNamePopped(a.CAPTION),
        e.activeFormattingElements.clearToLastMarker(),
        (e.insertionMode = i.IN_TABLE),
        u === a.TABLE && Ve(e, t));
      break;
    }
    case a.BODY:
    case a.COL:
    case a.COLGROUP:
    case a.HTML:
    case a.TBODY:
    case a.TD:
    case a.TFOOT:
    case a.TH:
    case a.THEAD:
    case a.TR:
      break;
    default:
      bt(e, t);
  }
}
function su(e, t) {
  switch (t.tagID) {
    case a.HTML: {
      w(e, t);
      break;
    }
    case a.COL: {
      (e._appendElement(t, h.HTML), (t.ackSelfClosing = !0));
      break;
    }
    case a.TEMPLATE: {
      Z(e, t);
      break;
    }
    default:
      Tt(e, t);
  }
}
function gi(e, t) {
  switch (t.tagID) {
    case a.COLGROUP: {
      e.openElements.currentTagId === a.COLGROUP &&
        (e.openElements.pop(), (e.insertionMode = i.IN_TABLE));
      break;
    }
    case a.TEMPLATE: {
      me(e, t);
      break;
    }
    case a.COL:
      break;
    default:
      Tt(e, t);
  }
}
function Tt(e, t) {
  e.openElements.currentTagId === a.COLGROUP &&
    (e.openElements.pop(), (e.insertionMode = i.IN_TABLE), e._processToken(t));
}
function At(e, t) {
  switch (t.tagID) {
    case a.TR: {
      (e.openElements.clearBackToTableBodyContext(),
        e._insertElement(t, h.HTML),
        (e.insertionMode = i.IN_ROW));
      break;
    }
    case a.TH:
    case a.TD: {
      (e.openElements.clearBackToTableBodyContext(),
        e._insertFakeElement(l.TR, a.TR),
        (e.insertionMode = i.IN_ROW),
        pt(e, t));
      break;
    }
    case a.CAPTION:
    case a.COL:
    case a.COLGROUP:
    case a.TBODY:
    case a.TFOOT:
    case a.THEAD: {
      e.openElements.hasTableBodyContextInTableScope() &&
        (e.openElements.clearBackToTableBodyContext(),
        e.openElements.pop(),
        (e.insertionMode = i.IN_TABLE),
        Se(e, t));
      break;
    }
    default:
      Se(e, t);
  }
}
function Jt(e, t) {
  const u = t.tagID;
  switch (t.tagID) {
    case a.TBODY:
    case a.TFOOT:
    case a.THEAD: {
      e.openElements.hasInTableScope(u) &&
        (e.openElements.clearBackToTableBodyContext(),
        e.openElements.pop(),
        (e.insertionMode = i.IN_TABLE));
      break;
    }
    case a.TABLE: {
      e.openElements.hasTableBodyContextInTableScope() &&
        (e.openElements.clearBackToTableBodyContext(),
        e.openElements.pop(),
        (e.insertionMode = i.IN_TABLE),
        Ve(e, t));
      break;
    }
    case a.BODY:
    case a.CAPTION:
    case a.COL:
    case a.COLGROUP:
    case a.HTML:
    case a.TD:
    case a.TH:
    case a.TR:
      break;
    default:
      Ve(e, t);
  }
}
function pt(e, t) {
  switch (t.tagID) {
    case a.TH:
    case a.TD: {
      (e.openElements.clearBackToTableRowContext(),
        e._insertElement(t, h.HTML),
        (e.insertionMode = i.IN_CELL),
        e.activeFormattingElements.insertMarker());
      break;
    }
    case a.CAPTION:
    case a.COL:
    case a.COLGROUP:
    case a.TBODY:
    case a.TFOOT:
    case a.THEAD:
    case a.TR: {
      e.openElements.hasInTableScope(a.TR) &&
        (e.openElements.clearBackToTableRowContext(),
        e.openElements.pop(),
        (e.insertionMode = i.IN_TABLE_BODY),
        At(e, t));
      break;
    }
    default:
      Se(e, t);
  }
}
function Ya(e, t) {
  switch (t.tagID) {
    case a.TR: {
      e.openElements.hasInTableScope(a.TR) &&
        (e.openElements.clearBackToTableRowContext(),
        e.openElements.pop(),
        (e.insertionMode = i.IN_TABLE_BODY));
      break;
    }
    case a.TABLE: {
      e.openElements.hasInTableScope(a.TR) &&
        (e.openElements.clearBackToTableRowContext(),
        e.openElements.pop(),
        (e.insertionMode = i.IN_TABLE_BODY),
        Jt(e, t));
      break;
    }
    case a.TBODY:
    case a.TFOOT:
    case a.THEAD: {
      (e.openElements.hasInTableScope(t.tagID) || e.openElements.hasInTableScope(a.TR)) &&
        (e.openElements.clearBackToTableRowContext(),
        e.openElements.pop(),
        (e.insertionMode = i.IN_TABLE_BODY),
        Jt(e, t));
      break;
    }
    case a.BODY:
    case a.CAPTION:
    case a.COL:
    case a.COLGROUP:
    case a.HTML:
    case a.TD:
    case a.TH:
      break;
    default:
      Ve(e, t);
  }
}
function Si(e, t) {
  const u = t.tagID;
  va.has(u)
    ? (e.openElements.hasInTableScope(a.TD) || e.openElements.hasInTableScope(a.TH)) &&
      (e._closeTableCell(), pt(e, t))
    : w(e, t);
}
function Oi(e, t) {
  const u = t.tagID;
  switch (u) {
    case a.TD:
    case a.TH: {
      e.openElements.hasInTableScope(u) &&
        (e.openElements.generateImpliedEndTags(),
        e.openElements.popUntilTagNamePopped(u),
        e.activeFormattingElements.clearToLastMarker(),
        (e.insertionMode = i.IN_ROW));
      break;
    }
    case a.TABLE:
    case a.TBODY:
    case a.TFOOT:
    case a.THEAD:
    case a.TR: {
      e.openElements.hasInTableScope(u) && (e._closeTableCell(), Ya(e, t));
      break;
    }
    case a.BODY:
    case a.CAPTION:
    case a.COL:
    case a.COLGROUP:
    case a.HTML:
      break;
    default:
      bt(e, t);
  }
}
function Ga(e, t) {
  switch (t.tagID) {
    case a.HTML: {
      w(e, t);
      break;
    }
    case a.OPTION: {
      (e.openElements.currentTagId === a.OPTION && e.openElements.pop(),
        e._insertElement(t, h.HTML));
      break;
    }
    case a.OPTGROUP: {
      (e.openElements.currentTagId === a.OPTION && e.openElements.pop(),
        e.openElements.currentTagId === a.OPTGROUP && e.openElements.pop(),
        e._insertElement(t, h.HTML));
      break;
    }
    case a.HR: {
      (e.openElements.currentTagId === a.OPTION && e.openElements.pop(),
        e.openElements.currentTagId === a.OPTGROUP && e.openElements.pop(),
        e._appendElement(t, h.HTML),
        (t.ackSelfClosing = !0));
      break;
    }
    case a.INPUT:
    case a.KEYGEN:
    case a.TEXTAREA:
    case a.SELECT: {
      e.openElements.hasInSelectScope(a.SELECT) &&
        (e.openElements.popUntilTagNamePopped(a.SELECT),
        e._resetInsertionMode(),
        t.tagID !== a.SELECT && e._processStartTag(t));
      break;
    }
    case a.SCRIPT:
    case a.TEMPLATE: {
      Z(e, t);
      break;
    }
  }
}
function Wa(e, t) {
  switch (t.tagID) {
    case a.OPTGROUP: {
      (e.openElements.stackTop > 0 &&
        e.openElements.currentTagId === a.OPTION &&
        e.openElements.tagIDs[e.openElements.stackTop - 1] === a.OPTGROUP &&
        e.openElements.pop(),
        e.openElements.currentTagId === a.OPTGROUP && e.openElements.pop());
      break;
    }
    case a.OPTION: {
      e.openElements.currentTagId === a.OPTION && e.openElements.pop();
      break;
    }
    case a.SELECT: {
      e.openElements.hasInSelectScope(a.SELECT) &&
        (e.openElements.popUntilTagNamePopped(a.SELECT), e._resetInsertionMode());
      break;
    }
    case a.TEMPLATE: {
      me(e, t);
      break;
    }
  }
}
function Li(e, t) {
  const u = t.tagID;
  u === a.CAPTION ||
  u === a.TABLE ||
  u === a.TBODY ||
  u === a.TFOOT ||
  u === a.THEAD ||
  u === a.TR ||
  u === a.TD ||
  u === a.TH
    ? (e.openElements.popUntilTagNamePopped(a.SELECT),
      e._resetInsertionMode(),
      e._processStartTag(t))
    : Ga(e, t);
}
function Ri(e, t) {
  const u = t.tagID;
  u === a.CAPTION ||
  u === a.TABLE ||
  u === a.TBODY ||
  u === a.TFOOT ||
  u === a.THEAD ||
  u === a.TR ||
  u === a.TD ||
  u === a.TH
    ? e.openElements.hasInTableScope(u) &&
      (e.openElements.popUntilTagNamePopped(a.SELECT), e._resetInsertionMode(), e.onEndTag(t))
    : Wa(e, t);
}
function Di(e, t) {
  switch (t.tagID) {
    case a.BASE:
    case a.BASEFONT:
    case a.BGSOUND:
    case a.LINK:
    case a.META:
    case a.NOFRAMES:
    case a.SCRIPT:
    case a.STYLE:
    case a.TEMPLATE:
    case a.TITLE: {
      Z(e, t);
      break;
    }
    case a.CAPTION:
    case a.COLGROUP:
    case a.TBODY:
    case a.TFOOT:
    case a.THEAD: {
      ((e.tmplInsertionModeStack[0] = i.IN_TABLE), (e.insertionMode = i.IN_TABLE), Se(e, t));
      break;
    }
    case a.COL: {
      ((e.tmplInsertionModeStack[0] = i.IN_COLUMN_GROUP),
        (e.insertionMode = i.IN_COLUMN_GROUP),
        su(e, t));
      break;
    }
    case a.TR: {
      ((e.tmplInsertionModeStack[0] = i.IN_TABLE_BODY),
        (e.insertionMode = i.IN_TABLE_BODY),
        At(e, t));
      break;
    }
    case a.TD:
    case a.TH: {
      ((e.tmplInsertionModeStack[0] = i.IN_ROW), (e.insertionMode = i.IN_ROW), pt(e, t));
      break;
    }
    default:
      ((e.tmplInsertionModeStack[0] = i.IN_BODY), (e.insertionMode = i.IN_BODY), w(e, t));
  }
}
function Pi(e, t) {
  t.tagID === a.TEMPLATE && me(e, t);
}
function Qa(e, t) {
  e.openElements.tmplCount > 0
    ? (e.openElements.popUntilTagNamePopped(a.TEMPLATE),
      e.activeFormattingElements.clearToLastMarker(),
      e.tmplInsertionModeStack.shift(),
      e._resetInsertionMode(),
      e.onEof(t))
    : au(e, t);
}
function Mi(e, t) {
  t.tagID === a.HTML ? w(e, t) : ht(e, t);
}
function Xa(e, t) {
  var u;
  if (t.tagID === a.HTML) {
    if (
      (e.fragmentContext || (e.insertionMode = i.AFTER_AFTER_BODY),
      e.options.sourceCodeLocationInfo && e.openElements.tagIDs[0] === a.HTML)
    ) {
      e._setEndLocation(e.openElements.items[0], t);
      const s = e.openElements.items[1];
      s &&
        !(
          !((u = e.treeAdapter.getNodeSourceCodeLocation(s)) === null || u === void 0) && u.endTag
        ) &&
        e._setEndLocation(s, t);
    }
  } else ht(e, t);
}
function ht(e, t) {
  ((e.insertionMode = i.IN_BODY), _t(e, t));
}
function xi(e, t) {
  switch (t.tagID) {
    case a.HTML: {
      w(e, t);
      break;
    }
    case a.FRAMESET: {
      e._insertElement(t, h.HTML);
      break;
    }
    case a.FRAME: {
      (e._appendElement(t, h.HTML), (t.ackSelfClosing = !0));
      break;
    }
    case a.NOFRAMES: {
      Z(e, t);
      break;
    }
  }
}
function ki(e, t) {
  t.tagID === a.FRAMESET &&
    !e.openElements.isRootHtmlElementCurrent() &&
    (e.openElements.pop(),
    !e.fragmentContext &&
      e.openElements.currentTagId !== a.FRAMESET &&
      (e.insertionMode = i.AFTER_FRAMESET));
}
function Bi(e, t) {
  switch (t.tagID) {
    case a.HTML: {
      w(e, t);
      break;
    }
    case a.NOFRAMES: {
      Z(e, t);
      break;
    }
  }
}
function yi(e, t) {
  t.tagID === a.HTML && (e.insertionMode = i.AFTER_AFTER_FRAMESET);
}
function Fi(e, t) {
  t.tagID === a.HTML ? w(e, t) : Et(e, t);
}
function Et(e, t) {
  ((e.insertionMode = i.IN_BODY), _t(e, t));
}
function Ui(e, t) {
  switch (t.tagID) {
    case a.HTML: {
      w(e, t);
      break;
    }
    case a.NOFRAMES: {
      Z(e, t);
      break;
    }
  }
}
function Hi(e, t) {
  ((t.chars = S), e._insertCharacters(t));
}
function wi(e, t) {
  (e._insertCharacters(t), (e.framesetOk = !1));
}
function qa(e) {
  for (
    ;
    e.treeAdapter.getNamespaceURI(e.openElements.current) !== h.HTML &&
    e.openElements.currentTagId !== void 0 &&
    !e._isIntegrationPoint(e.openElements.currentTagId, e.openElements.current);
  )
    e.openElements.pop();
}
function vi(e, t) {
  if (en(t)) (qa(e), e._startTagOutsideForeignContent(t));
  else {
    const u = e._getAdjustedCurrentElement(),
      s = e.treeAdapter.getNamespaceURI(u);
    (s === h.MATHML ? Da(t) : s === h.SVG && (tn(t), Pa(t)),
      tu(t),
      t.selfClosing ? e._appendElement(t, s) : e._insertElement(t, s),
      (t.ackSelfClosing = !0));
  }
}
function Yi(e, t) {
  if (t.tagID === a.P || t.tagID === a.BR) {
    (qa(e), e._endTagOutsideForeignContent(t));
    return;
  }
  for (let u = e.openElements.stackTop; u > 0; u--) {
    const s = e.openElements.items[u];
    if (e.treeAdapter.getNamespaceURI(s) === h.HTML) {
      e._endTagOutsideForeignContent(t);
      break;
    }
    const c = e.treeAdapter.getTagName(s);
    if (c.toLowerCase() === t.tagName) {
      ((t.tagName = c), e.openElements.shortenToLength(u));
      break;
    }
  }
}
(l.AREA,
  l.BASE,
  l.BASEFONT,
  l.BGSOUND,
  l.BR,
  l.COL,
  l.EMBED,
  l.FRAME,
  l.HR,
  l.IMG,
  l.INPUT,
  l.KEYGEN,
  l.LINK,
  l.META,
  l.PARAM,
  l.SOURCE,
  l.TRACK,
  l.WBR);
const Gi =
    /<(\/?)(iframe|noembed|noframes|plaintext|script|style|textarea|title|xmp)(?=[\t\n\f\r />])/gi,
  Wi = new Set([
    "mdxFlowExpression",
    "mdxJsxFlowElement",
    "mdxJsxTextElement",
    "mdxTextExpression",
    "mdxjsEsm",
  ]),
  oa = { sourceCodeLocationInfo: !0, scriptingEnabled: !1 };
function Ka(e, t) {
  const u = Zi(e),
    s = ba("type", {
      handlers: { root: Qi, element: Xi, text: qi, comment: za, doctype: Ki, raw: zi },
      unknown: ji,
    }),
    c = {
      parser: u ? new na(oa) : na.getFragmentParser(void 0, oa),
      handle(b) {
        s(b, c);
      },
      stitches: !1,
      options: t || {},
    };
  (s(e, c), Re(c, he()));
  const d = u ? c.parser.document : c.parser.getFragment(),
    f = Zs(d, { file: c.options.file });
  return (
    c.stitches &&
      bs(f, "comment", function (b, _, C) {
        const Q = b;
        if (Q.value.stitch && C && _ !== void 0) {
          const re = C.children;
          return ((re[_] = Q.value.stitch), _);
        }
      }),
    f.type === "root" && f.children.length === 1 && f.children[0].type === e.type
      ? f.children[0]
      : f
  );
}
function Va(e, t) {
  let u = -1;
  if (e) for (; ++u < e.length; ) t.handle(e[u]);
}
function Qi(e, t) {
  Va(e.children, t);
}
function Xi(e, t) {
  (Ji(e, t), Va(e.children, t), $i(e, t));
}
function qi(e, t) {
  t.parser.tokenizer.state > 4 && (t.parser.tokenizer.state = 0);
  const u = { type: I.CHARACTER, chars: e.value, location: Je(e) };
  (Re(t, he(e)), (t.parser.currentToken = u), t.parser._processToken(t.parser.currentToken));
}
function Ki(e, t) {
  const u = {
    type: I.DOCTYPE,
    name: "html",
    forceQuirks: !1,
    publicId: "",
    systemId: "",
    location: Je(e),
  };
  (Re(t, he(e)), (t.parser.currentToken = u), t.parser._processToken(t.parser.currentToken));
}
function Vi(e, t) {
  t.stitches = !0;
  const u = ec(e);
  if ("children" in e && "children" in u) {
    const s = Ka({ type: "root", children: e.children }, t.options);
    u.children = s.children;
  }
  za({ type: "comment", value: { stitch: u } }, t);
}
function za(e, t) {
  const u = e.value,
    s = { type: I.COMMENT, data: u, location: Je(e) };
  (Re(t, he(e)), (t.parser.currentToken = s), t.parser._processToken(t.parser.currentToken));
}
function zi(e, t) {
  if (
    ((t.parser.tokenizer.preprocessor.html = ""),
    (t.parser.tokenizer.preprocessor.pos = -1),
    (t.parser.tokenizer.preprocessor.lastGapPos = -2),
    (t.parser.tokenizer.preprocessor.gapStack = []),
    (t.parser.tokenizer.preprocessor.skipNextNewLine = !1),
    (t.parser.tokenizer.preprocessor.lastChunkWritten = !1),
    (t.parser.tokenizer.preprocessor.endOfChunkHit = !1),
    (t.parser.tokenizer.preprocessor.isEol = !1),
    ja(t, he(e)),
    t.parser.tokenizer.write(t.options.tagfilter ? e.value.replace(Gi, "&lt;$1$2") : e.value, !1),
    t.parser.tokenizer._runParsingLoop(),
    t.parser.tokenizer.state === 72 || t.parser.tokenizer.state === 78)
  ) {
    t.parser.tokenizer.preprocessor.lastChunkWritten = !0;
    const u = t.parser.tokenizer._consume();
    t.parser.tokenizer._callState(u);
  }
}
function ji(e, t) {
  const u = e;
  if (t.options.passThrough && t.options.passThrough.includes(u.type)) Vi(u, t);
  else {
    let s = "";
    throw (
      Wi.has(u.type) &&
        (s =
          ". It looks like you are using MDX nodes with `hast-util-raw` (or `rehype-raw`). If you use this because you are using remark or rehype plugins that inject `'html'` nodes, then please raise an issue with that plugin, as its a bad and slow idea. If you use this because you are using markdown syntax, then you have to configure this utility (or plugin) to pass through these nodes (see `passThrough` in docs), but you can also migrate to use the MDX syntax"),
      new Error("Cannot compile `" + u.type + "` node" + s)
    );
  }
}
function Re(e, t) {
  ja(e, t);
  const u = e.parser.tokenizer.currentCharacterToken;
  (u &&
    u.location &&
    ((u.location.endLine = e.parser.tokenizer.preprocessor.line),
    (u.location.endCol = e.parser.tokenizer.preprocessor.col + 1),
    (u.location.endOffset = e.parser.tokenizer.preprocessor.offset + 1),
    (e.parser.currentToken = u),
    e.parser._processToken(e.parser.currentToken)),
    (e.parser.tokenizer.paused = !1),
    (e.parser.tokenizer.inLoop = !1),
    (e.parser.tokenizer.active = !1),
    (e.parser.tokenizer.returnState = R.DATA),
    (e.parser.tokenizer.charRefCode = -1),
    (e.parser.tokenizer.consumedAfterSnapshot = -1),
    (e.parser.tokenizer.currentLocation = null),
    (e.parser.tokenizer.currentCharacterToken = null),
    (e.parser.tokenizer.currentToken = null),
    (e.parser.tokenizer.currentAttr = { name: "", value: "" }));
}
function ja(e, t) {
  if (t && t.offset !== void 0) {
    const u = {
      startLine: t.line,
      startCol: t.column,
      startOffset: t.offset,
      endLine: -1,
      endCol: -1,
      endOffset: -1,
    };
    ((e.parser.tokenizer.preprocessor.lineStartPos = -t.column + 1),
      (e.parser.tokenizer.preprocessor.droppedBufferSize = t.offset),
      (e.parser.tokenizer.preprocessor.line = t.line),
      (e.parser.tokenizer.currentLocation = u));
  }
}
function Ji(e, t) {
  const u = e.tagName.toLowerCase();
  if (t.parser.tokenizer.state === R.PLAINTEXT) return;
  Re(t, he(e));
  const s = t.parser.openElements.current;
  let c = "namespaceURI" in s ? s.namespaceURI : fe.html;
  c === fe.html && u === "svg" && (c = fe.svg);
  const d = sr({ ...e, children: [] }, { space: c === fe.svg ? "svg" : "html" }),
    f = {
      type: I.START_TAG,
      tagName: u,
      tagID: Le(u),
      selfClosing: !1,
      ackSelfClosing: !1,
      attrs: "attrs" in d ? d.attrs : [],
      location: Je(e),
    };
  ((t.parser.currentToken = f),
    t.parser._processToken(t.parser.currentToken),
    (t.parser.tokenizer.lastStartTagName = u));
}
function $i(e, t) {
  const u = e.tagName.toLowerCase();
  if (
    (!t.parser.tokenizer.inForeignNode && Er.includes(u)) ||
    t.parser.tokenizer.state === R.PLAINTEXT
  )
    return;
  Re(t, da(e));
  const s = {
    type: I.END_TAG,
    tagName: u,
    tagID: Le(u),
    selfClosing: !1,
    ackSelfClosing: !1,
    attrs: [],
    location: Je(e),
  };
  ((t.parser.currentToken = s),
    t.parser._processToken(t.parser.currentToken),
    u === t.parser.tokenizer.lastStartTagName &&
      (t.parser.tokenizer.state === R.RCDATA ||
        t.parser.tokenizer.state === R.RAWTEXT ||
        t.parser.tokenizer.state === R.SCRIPT_DATA) &&
      (t.parser.tokenizer.state = R.DATA));
}
function Zi(e) {
  const t = e.type === "root" ? e.children[0] : e;
  return !!(
    t &&
    (t.type === "doctype" || (t.type === "element" && t.tagName.toLowerCase() === "html"))
  );
}
function Je(e) {
  const t = he(e) || { line: void 0, column: void 0, offset: void 0 },
    u = da(e) || { line: void 0, column: void 0, offset: void 0 };
  return {
    startLine: t.line,
    startCol: t.column,
    startOffset: t.offset,
    endLine: u.line,
    endCol: u.column,
    endOffset: u.offset,
  };
}
function ec(e) {
  return "children" in e ? ku({ ...e, children: [] }) : ku(e);
}
function ac(e) {
  return function (t, u) {
    return Ka(t, { ...e, file: u });
  };
}
export { uc as p, ac as r };
