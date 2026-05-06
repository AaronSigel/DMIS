function Wh(e, t) {
  for (var n = 0; n < t.length; n++) {
    const r = t[n];
    if (typeof r != "string" && !Array.isArray(r)) {
      for (const l in r)
        if (l !== "default" && !(l in e)) {
          const i = Object.getOwnPropertyDescriptor(r, l);
          i && Object.defineProperty(e, l, i.get ? i : { enumerable: !0, get: () => r[l] });
        }
    }
  }
  return Object.freeze(Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }));
}
var Zl =
  typeof globalThis < "u"
    ? globalThis
    : typeof window < "u"
      ? window
      : typeof global < "u"
        ? global
        : typeof self < "u"
          ? self
          : {};
function _i(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, "default") ? e.default : e;
}
var xf = { exports: {} },
  Ti = {},
  Sf = { exports: {} },
  H = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var il = Symbol.for("react.element"),
  bh = Symbol.for("react.portal"),
  Qh = Symbol.for("react.fragment"),
  Yh = Symbol.for("react.strict_mode"),
  Xh = Symbol.for("react.profiler"),
  Kh = Symbol.for("react.provider"),
  Gh = Symbol.for("react.context"),
  qh = Symbol.for("react.forward_ref"),
  Jh = Symbol.for("react.suspense"),
  Zh = Symbol.for("react.memo"),
  em = Symbol.for("react.lazy"),
  us = Symbol.iterator;
function tm(e) {
  return e === null || typeof e != "object"
    ? null
    : ((e = (us && e[us]) || e["@@iterator"]), typeof e == "function" ? e : null);
}
var Ef = {
    isMounted: function () {
      return !1;
    },
    enqueueForceUpdate: function () {},
    enqueueReplaceState: function () {},
    enqueueSetState: function () {},
  },
  Cf = Object.assign,
  Pf = {};
function ir(e, t, n) {
  ((this.props = e), (this.context = t), (this.refs = Pf), (this.updater = n || Ef));
}
ir.prototype.isReactComponent = {};
ir.prototype.setState = function (e, t) {
  if (typeof e != "object" && typeof e != "function" && e != null)
    throw Error(
      "setState(...): takes an object of state variables to update or a function which returns an object of state variables.",
    );
  this.updater.enqueueSetState(this, e, t, "setState");
};
ir.prototype.forceUpdate = function (e) {
  this.updater.enqueueForceUpdate(this, e, "forceUpdate");
};
function _f() {}
_f.prototype = ir.prototype;
function Wu(e, t, n) {
  ((this.props = e), (this.context = t), (this.refs = Pf), (this.updater = n || Ef));
}
var bu = (Wu.prototype = new _f());
bu.constructor = Wu;
Cf(bu, ir.prototype);
bu.isPureReactComponent = !0;
var as = Array.isArray,
  Tf = Object.prototype.hasOwnProperty,
  Qu = { current: null },
  If = { key: !0, ref: !0, __self: !0, __source: !0 };
function Nf(e, t, n) {
  var r,
    l = {},
    i = null,
    o = null;
  if (t != null)
    for (r in (t.ref !== void 0 && (o = t.ref), t.key !== void 0 && (i = "" + t.key), t))
      Tf.call(t, r) && !If.hasOwnProperty(r) && (l[r] = t[r]);
  var u = arguments.length - 2;
  if (u === 1) l.children = n;
  else if (1 < u) {
    for (var a = Array(u), s = 0; s < u; s++) a[s] = arguments[s + 2];
    l.children = a;
  }
  if (e && e.defaultProps) for (r in ((u = e.defaultProps), u)) l[r] === void 0 && (l[r] = u[r]);
  return { $$typeof: il, type: e, key: i, ref: o, props: l, _owner: Qu.current };
}
function nm(e, t) {
  return { $$typeof: il, type: e.type, key: t, ref: e.ref, props: e.props, _owner: e._owner };
}
function Yu(e) {
  return typeof e == "object" && e !== null && e.$$typeof === il;
}
function rm(e) {
  var t = { "=": "=0", ":": "=2" };
  return (
    "$" +
    e.replace(/[=:]/g, function (n) {
      return t[n];
    })
  );
}
var ss = /\/+/g;
function Ki(e, t) {
  return typeof e == "object" && e !== null && e.key != null ? rm("" + e.key) : t.toString(36);
}
function Fl(e, t, n, r, l) {
  var i = typeof e;
  (i === "undefined" || i === "boolean") && (e = null);
  var o = !1;
  if (e === null) o = !0;
  else
    switch (i) {
      case "string":
      case "number":
        o = !0;
        break;
      case "object":
        switch (e.$$typeof) {
          case il:
          case bh:
            o = !0;
        }
    }
  if (o)
    return (
      (o = e),
      (l = l(o)),
      (e = r === "" ? "." + Ki(o, 0) : r),
      as(l)
        ? ((n = ""),
          e != null && (n = e.replace(ss, "$&/") + "/"),
          Fl(l, t, n, "", function (s) {
            return s;
          }))
        : l != null &&
          (Yu(l) &&
            (l = nm(
              l,
              n +
                (!l.key || (o && o.key === l.key) ? "" : ("" + l.key).replace(ss, "$&/") + "/") +
                e,
            )),
          t.push(l)),
      1
    );
  if (((o = 0), (r = r === "" ? "." : r + ":"), as(e)))
    for (var u = 0; u < e.length; u++) {
      i = e[u];
      var a = r + Ki(i, u);
      o += Fl(i, t, n, a, l);
    }
  else if (((a = tm(e)), typeof a == "function"))
    for (e = a.call(e), u = 0; !(i = e.next()).done; )
      ((i = i.value), (a = r + Ki(i, u++)), (o += Fl(i, t, n, a, l)));
  else if (i === "object")
    throw (
      (t = String(e)),
      Error(
        "Objects are not valid as a React child (found: " +
          (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) +
          "). If you meant to render a collection of children, use an array instead.",
      )
    );
  return o;
}
function ml(e, t, n) {
  if (e == null) return e;
  var r = [],
    l = 0;
  return (
    Fl(e, r, "", "", function (i) {
      return t.call(n, i, l++);
    }),
    r
  );
}
function lm(e) {
  if (e._status === -1) {
    var t = e._result;
    ((t = t()),
      t.then(
        function (n) {
          (e._status === 0 || e._status === -1) && ((e._status = 1), (e._result = n));
        },
        function (n) {
          (e._status === 0 || e._status === -1) && ((e._status = 2), (e._result = n));
        },
      ),
      e._status === -1 && ((e._status = 0), (e._result = t)));
  }
  if (e._status === 1) return e._result.default;
  throw e._result;
}
var Le = { current: null },
  Bl = { transition: null },
  im = { ReactCurrentDispatcher: Le, ReactCurrentBatchConfig: Bl, ReactCurrentOwner: Qu };
function zf() {
  throw Error("act(...) is not supported in production builds of React.");
}
H.Children = {
  map: ml,
  forEach: function (e, t, n) {
    ml(
      e,
      function () {
        t.apply(this, arguments);
      },
      n,
    );
  },
  count: function (e) {
    var t = 0;
    return (
      ml(e, function () {
        t++;
      }),
      t
    );
  },
  toArray: function (e) {
    return (
      ml(e, function (t) {
        return t;
      }) || []
    );
  },
  only: function (e) {
    if (!Yu(e))
      throw Error("React.Children.only expected to receive a single React element child.");
    return e;
  },
};
H.Component = ir;
H.Fragment = Qh;
H.Profiler = Xh;
H.PureComponent = Wu;
H.StrictMode = Yh;
H.Suspense = Jh;
H.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = im;
H.act = zf;
H.cloneElement = function (e, t, n) {
  if (e == null)
    throw Error(
      "React.cloneElement(...): The argument must be a React element, but you passed " + e + ".",
    );
  var r = Cf({}, e.props),
    l = e.key,
    i = e.ref,
    o = e._owner;
  if (t != null) {
    if (
      (t.ref !== void 0 && ((i = t.ref), (o = Qu.current)),
      t.key !== void 0 && (l = "" + t.key),
      e.type && e.type.defaultProps)
    )
      var u = e.type.defaultProps;
    for (a in t)
      Tf.call(t, a) &&
        !If.hasOwnProperty(a) &&
        (r[a] = t[a] === void 0 && u !== void 0 ? u[a] : t[a]);
  }
  var a = arguments.length - 2;
  if (a === 1) r.children = n;
  else if (1 < a) {
    u = Array(a);
    for (var s = 0; s < a; s++) u[s] = arguments[s + 2];
    r.children = u;
  }
  return { $$typeof: il, type: e.type, key: l, ref: i, props: r, _owner: o };
};
H.createContext = function (e) {
  return (
    (e = {
      $$typeof: Gh,
      _currentValue: e,
      _currentValue2: e,
      _threadCount: 0,
      Provider: null,
      Consumer: null,
      _defaultValue: null,
      _globalName: null,
    }),
    (e.Provider = { $$typeof: Kh, _context: e }),
    (e.Consumer = e)
  );
};
H.createElement = Nf;
H.createFactory = function (e) {
  var t = Nf.bind(null, e);
  return ((t.type = e), t);
};
H.createRef = function () {
  return { current: null };
};
H.forwardRef = function (e) {
  return { $$typeof: qh, render: e };
};
H.isValidElement = Yu;
H.lazy = function (e) {
  return { $$typeof: em, _payload: { _status: -1, _result: e }, _init: lm };
};
H.memo = function (e, t) {
  return { $$typeof: Zh, type: e, compare: t === void 0 ? null : t };
};
H.startTransition = function (e) {
  var t = Bl.transition;
  Bl.transition = {};
  try {
    e();
  } finally {
    Bl.transition = t;
  }
};
H.unstable_act = zf;
H.useCallback = function (e, t) {
  return Le.current.useCallback(e, t);
};
H.useContext = function (e) {
  return Le.current.useContext(e);
};
H.useDebugValue = function () {};
H.useDeferredValue = function (e) {
  return Le.current.useDeferredValue(e);
};
H.useEffect = function (e, t) {
  return Le.current.useEffect(e, t);
};
H.useId = function () {
  return Le.current.useId();
};
H.useImperativeHandle = function (e, t, n) {
  return Le.current.useImperativeHandle(e, t, n);
};
H.useInsertionEffect = function (e, t) {
  return Le.current.useInsertionEffect(e, t);
};
H.useLayoutEffect = function (e, t) {
  return Le.current.useLayoutEffect(e, t);
};
H.useMemo = function (e, t) {
  return Le.current.useMemo(e, t);
};
H.useReducer = function (e, t, n) {
  return Le.current.useReducer(e, t, n);
};
H.useRef = function (e) {
  return Le.current.useRef(e);
};
H.useState = function (e) {
  return Le.current.useState(e);
};
H.useSyncExternalStore = function (e, t, n) {
  return Le.current.useSyncExternalStore(e, t, n);
};
H.useTransition = function () {
  return Le.current.useTransition();
};
H.version = "18.3.1";
Sf.exports = H;
var _ = Sf.exports;
const om = _i(_),
  um = Wh({ __proto__: null, default: om }, [_]);
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var am = _,
  sm = Symbol.for("react.element"),
  cm = Symbol.for("react.fragment"),
  fm = Object.prototype.hasOwnProperty,
  pm = am.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,
  dm = { key: !0, ref: !0, __self: !0, __source: !0 };
function Lf(e, t, n) {
  var r,
    l = {},
    i = null,
    o = null;
  (n !== void 0 && (i = "" + n),
    t.key !== void 0 && (i = "" + t.key),
    t.ref !== void 0 && (o = t.ref));
  for (r in t) fm.call(t, r) && !dm.hasOwnProperty(r) && (l[r] = t[r]);
  if (e && e.defaultProps) for (r in ((t = e.defaultProps), t)) l[r] === void 0 && (l[r] = t[r]);
  return { $$typeof: sm, type: e, key: i, ref: o, props: l, _owner: pm.current };
}
Ti.Fragment = cm;
Ti.jsx = Lf;
Ti.jsxs = Lf;
xf.exports = Ti;
var Gi = xf.exports,
  Rf = { exports: {} },
  Xe = {},
  Of = { exports: {} },
  Df = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ (function (e) {
  function t(R, B) {
    var g = R.length;
    R.push(B);
    e: for (; 0 < g; ) {
      var b = (g - 1) >>> 1,
        G = R[b];
      if (0 < l(G, B)) ((R[b] = B), (R[g] = G), (g = b));
      else break e;
    }
  }
  function n(R) {
    return R.length === 0 ? null : R[0];
  }
  function r(R) {
    if (R.length === 0) return null;
    var B = R[0],
      g = R.pop();
    if (g !== B) {
      R[0] = g;
      e: for (var b = 0, G = R.length, k = G >>> 1; b < k; ) {
        var ge = 2 * (b + 1) - 1,
          rt = R[ge],
          te = ge + 1,
          pt = R[te];
        if (0 > l(rt, g))
          te < G && 0 > l(pt, rt)
            ? ((R[b] = pt), (R[te] = g), (b = te))
            : ((R[b] = rt), (R[ge] = g), (b = ge));
        else if (te < G && 0 > l(pt, g)) ((R[b] = pt), (R[te] = g), (b = te));
        else break e;
      }
    }
    return B;
  }
  function l(R, B) {
    var g = R.sortIndex - B.sortIndex;
    return g !== 0 ? g : R.id - B.id;
  }
  if (typeof performance == "object" && typeof performance.now == "function") {
    var i = performance;
    e.unstable_now = function () {
      return i.now();
    };
  } else {
    var o = Date,
      u = o.now();
    e.unstable_now = function () {
      return o.now() - u;
    };
  }
  var a = [],
    s = [],
    c = 1,
    f = null,
    d = 3,
    p = !1,
    w = !1,
    v = !1,
    S = typeof setTimeout == "function" ? setTimeout : null,
    h = typeof clearTimeout == "function" ? clearTimeout : null,
    m = typeof setImmediate < "u" ? setImmediate : null;
  typeof navigator < "u" &&
    navigator.scheduling !== void 0 &&
    navigator.scheduling.isInputPending !== void 0 &&
    navigator.scheduling.isInputPending.bind(navigator.scheduling);
  function y(R) {
    for (var B = n(s); B !== null; ) {
      if (B.callback === null) r(s);
      else if (B.startTime <= R) (r(s), (B.sortIndex = B.expirationTime), t(a, B));
      else break;
      B = n(s);
    }
  }
  function E(R) {
    if (((v = !1), y(R), !w))
      if (n(a) !== null) ((w = !0), pe(P));
      else {
        var B = n(s);
        B !== null && ce(E, B.startTime - R);
      }
  }
  function P(R, B) {
    ((w = !1), v && ((v = !1), h(L), (L = -1)), (p = !0));
    var g = d;
    try {
      for (y(B), f = n(a); f !== null && (!(f.expirationTime > B) || (R && !O())); ) {
        var b = f.callback;
        if (typeof b == "function") {
          ((f.callback = null), (d = f.priorityLevel));
          var G = b(f.expirationTime <= B);
          ((B = e.unstable_now()),
            typeof G == "function" ? (f.callback = G) : f === n(a) && r(a),
            y(B));
        } else r(a);
        f = n(a);
      }
      if (f !== null) var k = !0;
      else {
        var ge = n(s);
        (ge !== null && ce(E, ge.startTime - B), (k = !1));
      }
      return k;
    } finally {
      ((f = null), (d = g), (p = !1));
    }
  }
  var x = !1,
    T = null,
    L = -1,
    F = 5,
    M = -1;
  function O() {
    return !(e.unstable_now() - M < F);
  }
  function A() {
    if (T !== null) {
      var R = e.unstable_now();
      M = R;
      var B = !0;
      try {
        B = T(!0, R);
      } finally {
        B ? X() : ((x = !1), (T = null));
      }
    } else x = !1;
  }
  var X;
  if (typeof m == "function")
    X = function () {
      m(A);
    };
  else if (typeof MessageChannel < "u") {
    var ie = new MessageChannel(),
      $ = ie.port2;
    ((ie.port1.onmessage = A),
      (X = function () {
        $.postMessage(null);
      }));
  } else
    X = function () {
      S(A, 0);
    };
  function pe(R) {
    ((T = R), x || ((x = !0), X()));
  }
  function ce(R, B) {
    L = S(function () {
      R(e.unstable_now());
    }, B);
  }
  ((e.unstable_IdlePriority = 5),
    (e.unstable_ImmediatePriority = 1),
    (e.unstable_LowPriority = 4),
    (e.unstable_NormalPriority = 3),
    (e.unstable_Profiling = null),
    (e.unstable_UserBlockingPriority = 2),
    (e.unstable_cancelCallback = function (R) {
      R.callback = null;
    }),
    (e.unstable_continueExecution = function () {
      w || p || ((w = !0), pe(P));
    }),
    (e.unstable_forceFrameRate = function (R) {
      0 > R || 125 < R || (F = 0 < R ? Math.floor(1e3 / R) : 5);
    }),
    (e.unstable_getCurrentPriorityLevel = function () {
      return d;
    }),
    (e.unstable_getFirstCallbackNode = function () {
      return n(a);
    }),
    (e.unstable_next = function (R) {
      switch (d) {
        case 1:
        case 2:
        case 3:
          var B = 3;
          break;
        default:
          B = d;
      }
      var g = d;
      d = B;
      try {
        return R();
      } finally {
        d = g;
      }
    }),
    (e.unstable_pauseExecution = function () {}),
    (e.unstable_requestPaint = function () {}),
    (e.unstable_runWithPriority = function (R, B) {
      switch (R) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          R = 3;
      }
      var g = d;
      d = R;
      try {
        return B();
      } finally {
        d = g;
      }
    }),
    (e.unstable_scheduleCallback = function (R, B, g) {
      var b = e.unstable_now();
      switch (
        (typeof g == "object" && g !== null
          ? ((g = g.delay), (g = typeof g == "number" && 0 < g ? b + g : b))
          : (g = b),
        R)
      ) {
        case 1:
          var G = -1;
          break;
        case 2:
          G = 250;
          break;
        case 5:
          G = 1073741823;
          break;
        case 4:
          G = 1e4;
          break;
        default:
          G = 5e3;
      }
      return (
        (G = g + G),
        (R = {
          id: c++,
          callback: B,
          priorityLevel: R,
          startTime: g,
          expirationTime: G,
          sortIndex: -1,
        }),
        g > b
          ? ((R.sortIndex = g),
            t(s, R),
            n(a) === null && R === n(s) && (v ? (h(L), (L = -1)) : (v = !0), ce(E, g - b)))
          : ((R.sortIndex = G), t(a, R), w || p || ((w = !0), pe(P))),
        R
      );
    }),
    (e.unstable_shouldYield = O),
    (e.unstable_wrapCallback = function (R) {
      var B = d;
      return function () {
        var g = d;
        d = B;
        try {
          return R.apply(this, arguments);
        } finally {
          d = g;
        }
      };
    }));
})(Df);
Of.exports = Df;
var hm = Of.exports;
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var mm = _,
  Ye = hm;
function I(e) {
  for (
    var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, n = 1;
    n < arguments.length;
    n++
  )
    t += "&args[]=" + encodeURIComponent(arguments[n]);
  return (
    "Minified React error #" +
    e +
    "; visit " +
    t +
    " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
  );
}
var Mf = new Set(),
  jr = {};
function xn(e, t) {
  (Jn(e, t), Jn(e + "Capture", t));
}
function Jn(e, t) {
  for (jr[e] = t, e = 0; e < t.length; e++) Mf.add(t[e]);
}
var Nt = !(
    typeof window > "u" ||
    typeof window.document > "u" ||
    typeof window.document.createElement > "u"
  ),
  Bo = Object.prototype.hasOwnProperty,
  gm =
    /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,
  cs = {},
  fs = {};
function ym(e) {
  return Bo.call(fs, e) ? !0 : Bo.call(cs, e) ? !1 : gm.test(e) ? (fs[e] = !0) : ((cs[e] = !0), !1);
}
function vm(e, t, n, r) {
  if (n !== null && n.type === 0) return !1;
  switch (typeof t) {
    case "function":
    case "symbol":
      return !0;
    case "boolean":
      return r
        ? !1
        : n !== null
          ? !n.acceptsBooleans
          : ((e = e.toLowerCase().slice(0, 5)), e !== "data-" && e !== "aria-");
    default:
      return !1;
  }
}
function km(e, t, n, r) {
  if (t === null || typeof t > "u" || vm(e, t, n, r)) return !0;
  if (r) return !1;
  if (n !== null)
    switch (n.type) {
      case 3:
        return !t;
      case 4:
        return t === !1;
      case 5:
        return isNaN(t);
      case 6:
        return isNaN(t) || 1 > t;
    }
  return !1;
}
function Re(e, t, n, r, l, i, o) {
  ((this.acceptsBooleans = t === 2 || t === 3 || t === 4),
    (this.attributeName = r),
    (this.attributeNamespace = l),
    (this.mustUseProperty = n),
    (this.propertyName = e),
    (this.type = t),
    (this.sanitizeURL = i),
    (this.removeEmptyString = o));
}
var Ee = {};
"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style"
  .split(" ")
  .forEach(function (e) {
    Ee[e] = new Re(e, 0, !1, e, null, !1, !1);
  });
[
  ["acceptCharset", "accept-charset"],
  ["className", "class"],
  ["htmlFor", "for"],
  ["httpEquiv", "http-equiv"],
].forEach(function (e) {
  var t = e[0];
  Ee[t] = new Re(t, 1, !1, e[1], null, !1, !1);
});
["contentEditable", "draggable", "spellCheck", "value"].forEach(function (e) {
  Ee[e] = new Re(e, 2, !1, e.toLowerCase(), null, !1, !1);
});
["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function (e) {
  Ee[e] = new Re(e, 2, !1, e, null, !1, !1);
});
"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope"
  .split(" ")
  .forEach(function (e) {
    Ee[e] = new Re(e, 3, !1, e.toLowerCase(), null, !1, !1);
  });
["checked", "multiple", "muted", "selected"].forEach(function (e) {
  Ee[e] = new Re(e, 3, !0, e, null, !1, !1);
});
["capture", "download"].forEach(function (e) {
  Ee[e] = new Re(e, 4, !1, e, null, !1, !1);
});
["cols", "rows", "size", "span"].forEach(function (e) {
  Ee[e] = new Re(e, 6, !1, e, null, !1, !1);
});
["rowSpan", "start"].forEach(function (e) {
  Ee[e] = new Re(e, 5, !1, e.toLowerCase(), null, !1, !1);
});
var Xu = /[\-:]([a-z])/g;
function Ku(e) {
  return e[1].toUpperCase();
}
"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height"
  .split(" ")
  .forEach(function (e) {
    var t = e.replace(Xu, Ku);
    Ee[t] = new Re(t, 1, !1, e, null, !1, !1);
  });
"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type"
  .split(" ")
  .forEach(function (e) {
    var t = e.replace(Xu, Ku);
    Ee[t] = new Re(t, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
  });
["xml:base", "xml:lang", "xml:space"].forEach(function (e) {
  var t = e.replace(Xu, Ku);
  Ee[t] = new Re(t, 1, !1, e, "http://www.w3.org/XML/1998/namespace", !1, !1);
});
["tabIndex", "crossOrigin"].forEach(function (e) {
  Ee[e] = new Re(e, 1, !1, e.toLowerCase(), null, !1, !1);
});
Ee.xlinkHref = new Re("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1);
["src", "href", "action", "formAction"].forEach(function (e) {
  Ee[e] = new Re(e, 1, !1, e.toLowerCase(), null, !0, !0);
});
function Gu(e, t, n, r) {
  var l = Ee.hasOwnProperty(t) ? Ee[t] : null;
  (l !== null
    ? l.type !== 0
    : r || !(2 < t.length) || (t[0] !== "o" && t[0] !== "O") || (t[1] !== "n" && t[1] !== "N")) &&
    (km(t, n, l, r) && (n = null),
    r || l === null
      ? ym(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, "" + n))
      : l.mustUseProperty
        ? (e[l.propertyName] = n === null ? (l.type === 3 ? !1 : "") : n)
        : ((t = l.attributeName),
          (r = l.attributeNamespace),
          n === null
            ? e.removeAttribute(t)
            : ((l = l.type),
              (n = l === 3 || (l === 4 && n === !0) ? "" : "" + n),
              r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n))));
}
var Ot = mm.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  gl = Symbol.for("react.element"),
  Ln = Symbol.for("react.portal"),
  Rn = Symbol.for("react.fragment"),
  qu = Symbol.for("react.strict_mode"),
  jo = Symbol.for("react.profiler"),
  Af = Symbol.for("react.provider"),
  Ff = Symbol.for("react.context"),
  Ju = Symbol.for("react.forward_ref"),
  Uo = Symbol.for("react.suspense"),
  Vo = Symbol.for("react.suspense_list"),
  Zu = Symbol.for("react.memo"),
  Ft = Symbol.for("react.lazy"),
  Bf = Symbol.for("react.offscreen"),
  ps = Symbol.iterator;
function dr(e) {
  return e === null || typeof e != "object"
    ? null
    : ((e = (ps && e[ps]) || e["@@iterator"]), typeof e == "function" ? e : null);
}
var ae = Object.assign,
  qi;
function Er(e) {
  if (qi === void 0)
    try {
      throw Error();
    } catch (n) {
      var t = n.stack.trim().match(/\n( *(at )?)/);
      qi = (t && t[1]) || "";
    }
  return (
    `
` +
    qi +
    e
  );
}
var Ji = !1;
function Zi(e, t) {
  if (!e || Ji) return "";
  Ji = !0;
  var n = Error.prepareStackTrace;
  Error.prepareStackTrace = void 0;
  try {
    if (t)
      if (
        ((t = function () {
          throw Error();
        }),
        Object.defineProperty(t.prototype, "props", {
          set: function () {
            throw Error();
          },
        }),
        typeof Reflect == "object" && Reflect.construct)
      ) {
        try {
          Reflect.construct(t, []);
        } catch (s) {
          var r = s;
        }
        Reflect.construct(e, [], t);
      } else {
        try {
          t.call();
        } catch (s) {
          r = s;
        }
        e.call(t.prototype);
      }
    else {
      try {
        throw Error();
      } catch (s) {
        r = s;
      }
      e();
    }
  } catch (s) {
    if (s && r && typeof s.stack == "string") {
      for (
        var l = s.stack.split(`
`),
          i = r.stack.split(`
`),
          o = l.length - 1,
          u = i.length - 1;
        1 <= o && 0 <= u && l[o] !== i[u];
      )
        u--;
      for (; 1 <= o && 0 <= u; o--, u--)
        if (l[o] !== i[u]) {
          if (o !== 1 || u !== 1)
            do
              if ((o--, u--, 0 > u || l[o] !== i[u])) {
                var a =
                  `
` + l[o].replace(" at new ", " at ");
                return (
                  e.displayName &&
                    a.includes("<anonymous>") &&
                    (a = a.replace("<anonymous>", e.displayName)),
                  a
                );
              }
            while (1 <= o && 0 <= u);
          break;
        }
    }
  } finally {
    ((Ji = !1), (Error.prepareStackTrace = n));
  }
  return (e = e ? e.displayName || e.name : "") ? Er(e) : "";
}
function wm(e) {
  switch (e.tag) {
    case 5:
      return Er(e.type);
    case 16:
      return Er("Lazy");
    case 13:
      return Er("Suspense");
    case 19:
      return Er("SuspenseList");
    case 0:
    case 2:
    case 15:
      return ((e = Zi(e.type, !1)), e);
    case 11:
      return ((e = Zi(e.type.render, !1)), e);
    case 1:
      return ((e = Zi(e.type, !0)), e);
    default:
      return "";
  }
}
function Ho(e) {
  if (e == null) return null;
  if (typeof e == "function") return e.displayName || e.name || null;
  if (typeof e == "string") return e;
  switch (e) {
    case Rn:
      return "Fragment";
    case Ln:
      return "Portal";
    case jo:
      return "Profiler";
    case qu:
      return "StrictMode";
    case Uo:
      return "Suspense";
    case Vo:
      return "SuspenseList";
  }
  if (typeof e == "object")
    switch (e.$$typeof) {
      case Ff:
        return (e.displayName || "Context") + ".Consumer";
      case Af:
        return (e._context.displayName || "Context") + ".Provider";
      case Ju:
        var t = e.render;
        return (
          (e = e.displayName),
          e ||
            ((e = t.displayName || t.name || ""),
            (e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef")),
          e
        );
      case Zu:
        return ((t = e.displayName || null), t !== null ? t : Ho(e.type) || "Memo");
      case Ft:
        ((t = e._payload), (e = e._init));
        try {
          return Ho(e(t));
        } catch {}
    }
  return null;
}
function xm(e) {
  var t = e.type;
  switch (e.tag) {
    case 24:
      return "Cache";
    case 9:
      return (t.displayName || "Context") + ".Consumer";
    case 10:
      return (t._context.displayName || "Context") + ".Provider";
    case 18:
      return "DehydratedFragment";
    case 11:
      return (
        (e = t.render),
        (e = e.displayName || e.name || ""),
        t.displayName || (e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef")
      );
    case 7:
      return "Fragment";
    case 5:
      return t;
    case 4:
      return "Portal";
    case 3:
      return "Root";
    case 6:
      return "Text";
    case 16:
      return Ho(t);
    case 8:
      return t === qu ? "StrictMode" : "Mode";
    case 22:
      return "Offscreen";
    case 12:
      return "Profiler";
    case 21:
      return "Scope";
    case 13:
      return "Suspense";
    case 19:
      return "SuspenseList";
    case 25:
      return "TracingMarker";
    case 1:
    case 0:
    case 17:
    case 2:
    case 14:
    case 15:
      if (typeof t == "function") return t.displayName || t.name || null;
      if (typeof t == "string") return t;
  }
  return null;
}
function Jt(e) {
  switch (typeof e) {
    case "boolean":
    case "number":
    case "string":
    case "undefined":
      return e;
    case "object":
      return e;
    default:
      return "";
  }
}
function jf(e) {
  var t = e.type;
  return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
}
function Sm(e) {
  var t = jf(e) ? "checked" : "value",
    n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t),
    r = "" + e[t];
  if (
    !e.hasOwnProperty(t) &&
    typeof n < "u" &&
    typeof n.get == "function" &&
    typeof n.set == "function"
  ) {
    var l = n.get,
      i = n.set;
    return (
      Object.defineProperty(e, t, {
        configurable: !0,
        get: function () {
          return l.call(this);
        },
        set: function (o) {
          ((r = "" + o), i.call(this, o));
        },
      }),
      Object.defineProperty(e, t, { enumerable: n.enumerable }),
      {
        getValue: function () {
          return r;
        },
        setValue: function (o) {
          r = "" + o;
        },
        stopTracking: function () {
          ((e._valueTracker = null), delete e[t]);
        },
      }
    );
  }
}
function yl(e) {
  e._valueTracker || (e._valueTracker = Sm(e));
}
function Uf(e) {
  if (!e) return !1;
  var t = e._valueTracker;
  if (!t) return !0;
  var n = t.getValue(),
    r = "";
  return (
    e && (r = jf(e) ? (e.checked ? "true" : "false") : e.value),
    (e = r),
    e !== n ? (t.setValue(e), !0) : !1
  );
}
function ei(e) {
  if (((e = e || (typeof document < "u" ? document : void 0)), typeof e > "u")) return null;
  try {
    return e.activeElement || e.body;
  } catch {
    return e.body;
  }
}
function $o(e, t) {
  var n = t.checked;
  return ae({}, t, {
    defaultChecked: void 0,
    defaultValue: void 0,
    value: void 0,
    checked: n ?? e._wrapperState.initialChecked,
  });
}
function ds(e, t) {
  var n = t.defaultValue == null ? "" : t.defaultValue,
    r = t.checked != null ? t.checked : t.defaultChecked;
  ((n = Jt(t.value != null ? t.value : n)),
    (e._wrapperState = {
      initialChecked: r,
      initialValue: n,
      controlled: t.type === "checkbox" || t.type === "radio" ? t.checked != null : t.value != null,
    }));
}
function Vf(e, t) {
  ((t = t.checked), t != null && Gu(e, "checked", t, !1));
}
function Wo(e, t) {
  Vf(e, t);
  var n = Jt(t.value),
    r = t.type;
  if (n != null)
    r === "number"
      ? ((n === 0 && e.value === "") || e.value != n) && (e.value = "" + n)
      : e.value !== "" + n && (e.value = "" + n);
  else if (r === "submit" || r === "reset") {
    e.removeAttribute("value");
    return;
  }
  (t.hasOwnProperty("value")
    ? bo(e, t.type, n)
    : t.hasOwnProperty("defaultValue") && bo(e, t.type, Jt(t.defaultValue)),
    t.checked == null && t.defaultChecked != null && (e.defaultChecked = !!t.defaultChecked));
}
function hs(e, t, n) {
  if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
    var r = t.type;
    if (!((r !== "submit" && r !== "reset") || (t.value !== void 0 && t.value !== null))) return;
    ((t = "" + e._wrapperState.initialValue),
      n || t === e.value || (e.value = t),
      (e.defaultValue = t));
  }
  ((n = e.name),
    n !== "" && (e.name = ""),
    (e.defaultChecked = !!e._wrapperState.initialChecked),
    n !== "" && (e.name = n));
}
function bo(e, t, n) {
  (t !== "number" || ei(e.ownerDocument) !== e) &&
    (n == null
      ? (e.defaultValue = "" + e._wrapperState.initialValue)
      : e.defaultValue !== "" + n && (e.defaultValue = "" + n));
}
var Cr = Array.isArray;
function $n(e, t, n, r) {
  if (((e = e.options), t)) {
    t = {};
    for (var l = 0; l < n.length; l++) t["$" + n[l]] = !0;
    for (n = 0; n < e.length; n++)
      ((l = t.hasOwnProperty("$" + e[n].value)),
        e[n].selected !== l && (e[n].selected = l),
        l && r && (e[n].defaultSelected = !0));
  } else {
    for (n = "" + Jt(n), t = null, l = 0; l < e.length; l++) {
      if (e[l].value === n) {
        ((e[l].selected = !0), r && (e[l].defaultSelected = !0));
        return;
      }
      t !== null || e[l].disabled || (t = e[l]);
    }
    t !== null && (t.selected = !0);
  }
}
function Qo(e, t) {
  if (t.dangerouslySetInnerHTML != null) throw Error(I(91));
  return ae({}, t, {
    value: void 0,
    defaultValue: void 0,
    children: "" + e._wrapperState.initialValue,
  });
}
function ms(e, t) {
  var n = t.value;
  if (n == null) {
    if (((n = t.children), (t = t.defaultValue), n != null)) {
      if (t != null) throw Error(I(92));
      if (Cr(n)) {
        if (1 < n.length) throw Error(I(93));
        n = n[0];
      }
      t = n;
    }
    (t == null && (t = ""), (n = t));
  }
  e._wrapperState = { initialValue: Jt(n) };
}
function Hf(e, t) {
  var n = Jt(t.value),
    r = Jt(t.defaultValue);
  (n != null &&
    ((n = "" + n),
    n !== e.value && (e.value = n),
    t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)),
    r != null && (e.defaultValue = "" + r));
}
function gs(e) {
  var t = e.textContent;
  t === e._wrapperState.initialValue && t !== "" && t !== null && (e.value = t);
}
function $f(e) {
  switch (e) {
    case "svg":
      return "http://www.w3.org/2000/svg";
    case "math":
      return "http://www.w3.org/1998/Math/MathML";
    default:
      return "http://www.w3.org/1999/xhtml";
  }
}
function Yo(e, t) {
  return e == null || e === "http://www.w3.org/1999/xhtml"
    ? $f(t)
    : e === "http://www.w3.org/2000/svg" && t === "foreignObject"
      ? "http://www.w3.org/1999/xhtml"
      : e;
}
var vl,
  Wf = (function (e) {
    return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction
      ? function (t, n, r, l) {
          MSApp.execUnsafeLocalFunction(function () {
            return e(t, n, r, l);
          });
        }
      : e;
  })(function (e, t) {
    if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in e) e.innerHTML = t;
    else {
      for (
        vl = vl || document.createElement("div"),
          vl.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>",
          t = vl.firstChild;
        e.firstChild;
      )
        e.removeChild(e.firstChild);
      for (; t.firstChild; ) e.appendChild(t.firstChild);
    }
  });
function Ur(e, t) {
  if (t) {
    var n = e.firstChild;
    if (n && n === e.lastChild && n.nodeType === 3) {
      n.nodeValue = t;
      return;
    }
  }
  e.textContent = t;
}
var Tr = {
    animationIterationCount: !0,
    aspectRatio: !0,
    borderImageOutset: !0,
    borderImageSlice: !0,
    borderImageWidth: !0,
    boxFlex: !0,
    boxFlexGroup: !0,
    boxOrdinalGroup: !0,
    columnCount: !0,
    columns: !0,
    flex: !0,
    flexGrow: !0,
    flexPositive: !0,
    flexShrink: !0,
    flexNegative: !0,
    flexOrder: !0,
    gridArea: !0,
    gridRow: !0,
    gridRowEnd: !0,
    gridRowSpan: !0,
    gridRowStart: !0,
    gridColumn: !0,
    gridColumnEnd: !0,
    gridColumnSpan: !0,
    gridColumnStart: !0,
    fontWeight: !0,
    lineClamp: !0,
    lineHeight: !0,
    opacity: !0,
    order: !0,
    orphans: !0,
    tabSize: !0,
    widows: !0,
    zIndex: !0,
    zoom: !0,
    fillOpacity: !0,
    floodOpacity: !0,
    stopOpacity: !0,
    strokeDasharray: !0,
    strokeDashoffset: !0,
    strokeMiterlimit: !0,
    strokeOpacity: !0,
    strokeWidth: !0,
  },
  Em = ["Webkit", "ms", "Moz", "O"];
Object.keys(Tr).forEach(function (e) {
  Em.forEach(function (t) {
    ((t = t + e.charAt(0).toUpperCase() + e.substring(1)), (Tr[t] = Tr[e]));
  });
});
function bf(e, t, n) {
  return t == null || typeof t == "boolean" || t === ""
    ? ""
    : n || typeof t != "number" || t === 0 || (Tr.hasOwnProperty(e) && Tr[e])
      ? ("" + t).trim()
      : t + "px";
}
function Qf(e, t) {
  e = e.style;
  for (var n in t)
    if (t.hasOwnProperty(n)) {
      var r = n.indexOf("--") === 0,
        l = bf(n, t[n], r);
      (n === "float" && (n = "cssFloat"), r ? e.setProperty(n, l) : (e[n] = l));
    }
}
var Cm = ae(
  { menuitem: !0 },
  {
    area: !0,
    base: !0,
    br: !0,
    col: !0,
    embed: !0,
    hr: !0,
    img: !0,
    input: !0,
    keygen: !0,
    link: !0,
    meta: !0,
    param: !0,
    source: !0,
    track: !0,
    wbr: !0,
  },
);
function Xo(e, t) {
  if (t) {
    if (Cm[e] && (t.children != null || t.dangerouslySetInnerHTML != null)) throw Error(I(137, e));
    if (t.dangerouslySetInnerHTML != null) {
      if (t.children != null) throw Error(I(60));
      if (typeof t.dangerouslySetInnerHTML != "object" || !("__html" in t.dangerouslySetInnerHTML))
        throw Error(I(61));
    }
    if (t.style != null && typeof t.style != "object") throw Error(I(62));
  }
}
function Ko(e, t) {
  if (e.indexOf("-") === -1) return typeof t.is == "string";
  switch (e) {
    case "annotation-xml":
    case "color-profile":
    case "font-face":
    case "font-face-src":
    case "font-face-uri":
    case "font-face-format":
    case "font-face-name":
    case "missing-glyph":
      return !1;
    default:
      return !0;
  }
}
var Go = null;
function ea(e) {
  return (
    (e = e.target || e.srcElement || window),
    e.correspondingUseElement && (e = e.correspondingUseElement),
    e.nodeType === 3 ? e.parentNode : e
  );
}
var qo = null,
  Wn = null,
  bn = null;
function ys(e) {
  if ((e = al(e))) {
    if (typeof qo != "function") throw Error(I(280));
    var t = e.stateNode;
    t && ((t = Ri(t)), qo(e.stateNode, e.type, t));
  }
}
function Yf(e) {
  Wn ? (bn ? bn.push(e) : (bn = [e])) : (Wn = e);
}
function Xf() {
  if (Wn) {
    var e = Wn,
      t = bn;
    if (((bn = Wn = null), ys(e), t)) for (e = 0; e < t.length; e++) ys(t[e]);
  }
}
function Kf(e, t) {
  return e(t);
}
function Gf() {}
var eo = !1;
function qf(e, t, n) {
  if (eo) return e(t, n);
  eo = !0;
  try {
    return Kf(e, t, n);
  } finally {
    ((eo = !1), (Wn !== null || bn !== null) && (Gf(), Xf()));
  }
}
function Vr(e, t) {
  var n = e.stateNode;
  if (n === null) return null;
  var r = Ri(n);
  if (r === null) return null;
  n = r[t];
  e: switch (t) {
    case "onClick":
    case "onClickCapture":
    case "onDoubleClick":
    case "onDoubleClickCapture":
    case "onMouseDown":
    case "onMouseDownCapture":
    case "onMouseMove":
    case "onMouseMoveCapture":
    case "onMouseUp":
    case "onMouseUpCapture":
    case "onMouseEnter":
      ((r = !r.disabled) ||
        ((e = e.type),
        (r = !(e === "button" || e === "input" || e === "select" || e === "textarea"))),
        (e = !r));
      break e;
    default:
      e = !1;
  }
  if (e) return null;
  if (n && typeof n != "function") throw Error(I(231, t, typeof n));
  return n;
}
var Jo = !1;
if (Nt)
  try {
    var hr = {};
    (Object.defineProperty(hr, "passive", {
      get: function () {
        Jo = !0;
      },
    }),
      window.addEventListener("test", hr, hr),
      window.removeEventListener("test", hr, hr));
  } catch {
    Jo = !1;
  }
function Pm(e, t, n, r, l, i, o, u, a) {
  var s = Array.prototype.slice.call(arguments, 3);
  try {
    t.apply(n, s);
  } catch (c) {
    this.onError(c);
  }
}
var Ir = !1,
  ti = null,
  ni = !1,
  Zo = null,
  _m = {
    onError: function (e) {
      ((Ir = !0), (ti = e));
    },
  };
function Tm(e, t, n, r, l, i, o, u, a) {
  ((Ir = !1), (ti = null), Pm.apply(_m, arguments));
}
function Im(e, t, n, r, l, i, o, u, a) {
  if ((Tm.apply(this, arguments), Ir)) {
    if (Ir) {
      var s = ti;
      ((Ir = !1), (ti = null));
    } else throw Error(I(198));
    ni || ((ni = !0), (Zo = s));
  }
}
function Sn(e) {
  var t = e,
    n = e;
  if (e.alternate) for (; t.return; ) t = t.return;
  else {
    e = t;
    do ((t = e), t.flags & 4098 && (n = t.return), (e = t.return));
    while (e);
  }
  return t.tag === 3 ? n : null;
}
function Jf(e) {
  if (e.tag === 13) {
    var t = e.memoizedState;
    if ((t === null && ((e = e.alternate), e !== null && (t = e.memoizedState)), t !== null))
      return t.dehydrated;
  }
  return null;
}
function vs(e) {
  if (Sn(e) !== e) throw Error(I(188));
}
function Nm(e) {
  var t = e.alternate;
  if (!t) {
    if (((t = Sn(e)), t === null)) throw Error(I(188));
    return t !== e ? null : e;
  }
  for (var n = e, r = t; ; ) {
    var l = n.return;
    if (l === null) break;
    var i = l.alternate;
    if (i === null) {
      if (((r = l.return), r !== null)) {
        n = r;
        continue;
      }
      break;
    }
    if (l.child === i.child) {
      for (i = l.child; i; ) {
        if (i === n) return (vs(l), e);
        if (i === r) return (vs(l), t);
        i = i.sibling;
      }
      throw Error(I(188));
    }
    if (n.return !== r.return) ((n = l), (r = i));
    else {
      for (var o = !1, u = l.child; u; ) {
        if (u === n) {
          ((o = !0), (n = l), (r = i));
          break;
        }
        if (u === r) {
          ((o = !0), (r = l), (n = i));
          break;
        }
        u = u.sibling;
      }
      if (!o) {
        for (u = i.child; u; ) {
          if (u === n) {
            ((o = !0), (n = i), (r = l));
            break;
          }
          if (u === r) {
            ((o = !0), (r = i), (n = l));
            break;
          }
          u = u.sibling;
        }
        if (!o) throw Error(I(189));
      }
    }
    if (n.alternate !== r) throw Error(I(190));
  }
  if (n.tag !== 3) throw Error(I(188));
  return n.stateNode.current === n ? e : t;
}
function Zf(e) {
  return ((e = Nm(e)), e !== null ? ep(e) : null);
}
function ep(e) {
  if (e.tag === 5 || e.tag === 6) return e;
  for (e = e.child; e !== null; ) {
    var t = ep(e);
    if (t !== null) return t;
    e = e.sibling;
  }
  return null;
}
var tp = Ye.unstable_scheduleCallback,
  ks = Ye.unstable_cancelCallback,
  zm = Ye.unstable_shouldYield,
  Lm = Ye.unstable_requestPaint,
  fe = Ye.unstable_now,
  Rm = Ye.unstable_getCurrentPriorityLevel,
  ta = Ye.unstable_ImmediatePriority,
  np = Ye.unstable_UserBlockingPriority,
  ri = Ye.unstable_NormalPriority,
  Om = Ye.unstable_LowPriority,
  rp = Ye.unstable_IdlePriority,
  Ii = null,
  kt = null;
function Dm(e) {
  if (kt && typeof kt.onCommitFiberRoot == "function")
    try {
      kt.onCommitFiberRoot(Ii, e, void 0, (e.current.flags & 128) === 128);
    } catch {}
}
var st = Math.clz32 ? Math.clz32 : Fm,
  Mm = Math.log,
  Am = Math.LN2;
function Fm(e) {
  return ((e >>>= 0), e === 0 ? 32 : (31 - ((Mm(e) / Am) | 0)) | 0);
}
var kl = 64,
  wl = 4194304;
function Pr(e) {
  switch (e & -e) {
    case 1:
      return 1;
    case 2:
      return 2;
    case 4:
      return 4;
    case 8:
      return 8;
    case 16:
      return 16;
    case 32:
      return 32;
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return e & 4194240;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return e & 130023424;
    case 134217728:
      return 134217728;
    case 268435456:
      return 268435456;
    case 536870912:
      return 536870912;
    case 1073741824:
      return 1073741824;
    default:
      return e;
  }
}
function li(e, t) {
  var n = e.pendingLanes;
  if (n === 0) return 0;
  var r = 0,
    l = e.suspendedLanes,
    i = e.pingedLanes,
    o = n & 268435455;
  if (o !== 0) {
    var u = o & ~l;
    u !== 0 ? (r = Pr(u)) : ((i &= o), i !== 0 && (r = Pr(i)));
  } else ((o = n & ~l), o !== 0 ? (r = Pr(o)) : i !== 0 && (r = Pr(i)));
  if (r === 0) return 0;
  if (
    t !== 0 &&
    t !== r &&
    !(t & l) &&
    ((l = r & -r), (i = t & -t), l >= i || (l === 16 && (i & 4194240) !== 0))
  )
    return t;
  if ((r & 4 && (r |= n & 16), (t = e.entangledLanes), t !== 0))
    for (e = e.entanglements, t &= r; 0 < t; )
      ((n = 31 - st(t)), (l = 1 << n), (r |= e[n]), (t &= ~l));
  return r;
}
function Bm(e, t) {
  switch (e) {
    case 1:
    case 2:
    case 4:
      return t + 250;
    case 8:
    case 16:
    case 32:
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return t + 5e3;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return -1;
    case 134217728:
    case 268435456:
    case 536870912:
    case 1073741824:
      return -1;
    default:
      return -1;
  }
}
function jm(e, t) {
  for (
    var n = e.suspendedLanes, r = e.pingedLanes, l = e.expirationTimes, i = e.pendingLanes;
    0 < i;
  ) {
    var o = 31 - st(i),
      u = 1 << o,
      a = l[o];
    (a === -1 ? (!(u & n) || u & r) && (l[o] = Bm(u, t)) : a <= t && (e.expiredLanes |= u),
      (i &= ~u));
  }
}
function eu(e) {
  return ((e = e.pendingLanes & -1073741825), e !== 0 ? e : e & 1073741824 ? 1073741824 : 0);
}
function lp() {
  var e = kl;
  return ((kl <<= 1), !(kl & 4194240) && (kl = 64), e);
}
function to(e) {
  for (var t = [], n = 0; 31 > n; n++) t.push(e);
  return t;
}
function ol(e, t, n) {
  ((e.pendingLanes |= t),
    t !== 536870912 && ((e.suspendedLanes = 0), (e.pingedLanes = 0)),
    (e = e.eventTimes),
    (t = 31 - st(t)),
    (e[t] = n));
}
function Um(e, t) {
  var n = e.pendingLanes & ~t;
  ((e.pendingLanes = t),
    (e.suspendedLanes = 0),
    (e.pingedLanes = 0),
    (e.expiredLanes &= t),
    (e.mutableReadLanes &= t),
    (e.entangledLanes &= t),
    (t = e.entanglements));
  var r = e.eventTimes;
  for (e = e.expirationTimes; 0 < n; ) {
    var l = 31 - st(n),
      i = 1 << l;
    ((t[l] = 0), (r[l] = -1), (e[l] = -1), (n &= ~i));
  }
}
function na(e, t) {
  var n = (e.entangledLanes |= t);
  for (e = e.entanglements; n; ) {
    var r = 31 - st(n),
      l = 1 << r;
    ((l & t) | (e[r] & t) && (e[r] |= t), (n &= ~l));
  }
}
var K = 0;
function ip(e) {
  return ((e &= -e), 1 < e ? (4 < e ? (e & 268435455 ? 16 : 536870912) : 4) : 1);
}
var op,
  ra,
  up,
  ap,
  sp,
  tu = !1,
  xl = [],
  Wt = null,
  bt = null,
  Qt = null,
  Hr = new Map(),
  $r = new Map(),
  jt = [],
  Vm =
    "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(
      " ",
    );
function ws(e, t) {
  switch (e) {
    case "focusin":
    case "focusout":
      Wt = null;
      break;
    case "dragenter":
    case "dragleave":
      bt = null;
      break;
    case "mouseover":
    case "mouseout":
      Qt = null;
      break;
    case "pointerover":
    case "pointerout":
      Hr.delete(t.pointerId);
      break;
    case "gotpointercapture":
    case "lostpointercapture":
      $r.delete(t.pointerId);
  }
}
function mr(e, t, n, r, l, i) {
  return e === null || e.nativeEvent !== i
    ? ((e = {
        blockedOn: t,
        domEventName: n,
        eventSystemFlags: r,
        nativeEvent: i,
        targetContainers: [l],
      }),
      t !== null && ((t = al(t)), t !== null && ra(t)),
      e)
    : ((e.eventSystemFlags |= r),
      (t = e.targetContainers),
      l !== null && t.indexOf(l) === -1 && t.push(l),
      e);
}
function Hm(e, t, n, r, l) {
  switch (t) {
    case "focusin":
      return ((Wt = mr(Wt, e, t, n, r, l)), !0);
    case "dragenter":
      return ((bt = mr(bt, e, t, n, r, l)), !0);
    case "mouseover":
      return ((Qt = mr(Qt, e, t, n, r, l)), !0);
    case "pointerover":
      var i = l.pointerId;
      return (Hr.set(i, mr(Hr.get(i) || null, e, t, n, r, l)), !0);
    case "gotpointercapture":
      return ((i = l.pointerId), $r.set(i, mr($r.get(i) || null, e, t, n, r, l)), !0);
  }
  return !1;
}
function cp(e) {
  var t = cn(e.target);
  if (t !== null) {
    var n = Sn(t);
    if (n !== null) {
      if (((t = n.tag), t === 13)) {
        if (((t = Jf(n)), t !== null)) {
          ((e.blockedOn = t),
            sp(e.priority, function () {
              up(n);
            }));
          return;
        }
      } else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
        e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
        return;
      }
    }
  }
  e.blockedOn = null;
}
function jl(e) {
  if (e.blockedOn !== null) return !1;
  for (var t = e.targetContainers; 0 < t.length; ) {
    var n = nu(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
    if (n === null) {
      n = e.nativeEvent;
      var r = new n.constructor(n.type, n);
      ((Go = r), n.target.dispatchEvent(r), (Go = null));
    } else return ((t = al(n)), t !== null && ra(t), (e.blockedOn = n), !1);
    t.shift();
  }
  return !0;
}
function xs(e, t, n) {
  jl(e) && n.delete(t);
}
function $m() {
  ((tu = !1),
    Wt !== null && jl(Wt) && (Wt = null),
    bt !== null && jl(bt) && (bt = null),
    Qt !== null && jl(Qt) && (Qt = null),
    Hr.forEach(xs),
    $r.forEach(xs));
}
function gr(e, t) {
  e.blockedOn === t &&
    ((e.blockedOn = null),
    tu || ((tu = !0), Ye.unstable_scheduleCallback(Ye.unstable_NormalPriority, $m)));
}
function Wr(e) {
  function t(l) {
    return gr(l, e);
  }
  if (0 < xl.length) {
    gr(xl[0], e);
    for (var n = 1; n < xl.length; n++) {
      var r = xl[n];
      r.blockedOn === e && (r.blockedOn = null);
    }
  }
  for (
    Wt !== null && gr(Wt, e),
      bt !== null && gr(bt, e),
      Qt !== null && gr(Qt, e),
      Hr.forEach(t),
      $r.forEach(t),
      n = 0;
    n < jt.length;
    n++
  )
    ((r = jt[n]), r.blockedOn === e && (r.blockedOn = null));
  for (; 0 < jt.length && ((n = jt[0]), n.blockedOn === null); )
    (cp(n), n.blockedOn === null && jt.shift());
}
var Qn = Ot.ReactCurrentBatchConfig,
  ii = !0;
function Wm(e, t, n, r) {
  var l = K,
    i = Qn.transition;
  Qn.transition = null;
  try {
    ((K = 1), la(e, t, n, r));
  } finally {
    ((K = l), (Qn.transition = i));
  }
}
function bm(e, t, n, r) {
  var l = K,
    i = Qn.transition;
  Qn.transition = null;
  try {
    ((K = 4), la(e, t, n, r));
  } finally {
    ((K = l), (Qn.transition = i));
  }
}
function la(e, t, n, r) {
  if (ii) {
    var l = nu(e, t, n, r);
    if (l === null) (fo(e, t, r, oi, n), ws(e, r));
    else if (Hm(l, e, t, n, r)) r.stopPropagation();
    else if ((ws(e, r), t & 4 && -1 < Vm.indexOf(e))) {
      for (; l !== null; ) {
        var i = al(l);
        if ((i !== null && op(i), (i = nu(e, t, n, r)), i === null && fo(e, t, r, oi, n), i === l))
          break;
        l = i;
      }
      l !== null && r.stopPropagation();
    } else fo(e, t, r, null, n);
  }
}
var oi = null;
function nu(e, t, n, r) {
  if (((oi = null), (e = ea(r)), (e = cn(e)), e !== null))
    if (((t = Sn(e)), t === null)) e = null;
    else if (((n = t.tag), n === 13)) {
      if (((e = Jf(t)), e !== null)) return e;
      e = null;
    } else if (n === 3) {
      if (t.stateNode.current.memoizedState.isDehydrated)
        return t.tag === 3 ? t.stateNode.containerInfo : null;
      e = null;
    } else t !== e && (e = null);
  return ((oi = e), null);
}
function fp(e) {
  switch (e) {
    case "cancel":
    case "click":
    case "close":
    case "contextmenu":
    case "copy":
    case "cut":
    case "auxclick":
    case "dblclick":
    case "dragend":
    case "dragstart":
    case "drop":
    case "focusin":
    case "focusout":
    case "input":
    case "invalid":
    case "keydown":
    case "keypress":
    case "keyup":
    case "mousedown":
    case "mouseup":
    case "paste":
    case "pause":
    case "play":
    case "pointercancel":
    case "pointerdown":
    case "pointerup":
    case "ratechange":
    case "reset":
    case "resize":
    case "seeked":
    case "submit":
    case "touchcancel":
    case "touchend":
    case "touchstart":
    case "volumechange":
    case "change":
    case "selectionchange":
    case "textInput":
    case "compositionstart":
    case "compositionend":
    case "compositionupdate":
    case "beforeblur":
    case "afterblur":
    case "beforeinput":
    case "blur":
    case "fullscreenchange":
    case "focus":
    case "hashchange":
    case "popstate":
    case "select":
    case "selectstart":
      return 1;
    case "drag":
    case "dragenter":
    case "dragexit":
    case "dragleave":
    case "dragover":
    case "mousemove":
    case "mouseout":
    case "mouseover":
    case "pointermove":
    case "pointerout":
    case "pointerover":
    case "scroll":
    case "toggle":
    case "touchmove":
    case "wheel":
    case "mouseenter":
    case "mouseleave":
    case "pointerenter":
    case "pointerleave":
      return 4;
    case "message":
      switch (Rm()) {
        case ta:
          return 1;
        case np:
          return 4;
        case ri:
        case Om:
          return 16;
        case rp:
          return 536870912;
        default:
          return 16;
      }
    default:
      return 16;
  }
}
var Vt = null,
  ia = null,
  Ul = null;
function pp() {
  if (Ul) return Ul;
  var e,
    t = ia,
    n = t.length,
    r,
    l = "value" in Vt ? Vt.value : Vt.textContent,
    i = l.length;
  for (e = 0; e < n && t[e] === l[e]; e++);
  var o = n - e;
  for (r = 1; r <= o && t[n - r] === l[i - r]; r++);
  return (Ul = l.slice(e, 1 < r ? 1 - r : void 0));
}
function Vl(e) {
  var t = e.keyCode;
  return (
    "charCode" in e ? ((e = e.charCode), e === 0 && t === 13 && (e = 13)) : (e = t),
    e === 10 && (e = 13),
    32 <= e || e === 13 ? e : 0
  );
}
function Sl() {
  return !0;
}
function Ss() {
  return !1;
}
function Ke(e) {
  function t(n, r, l, i, o) {
    ((this._reactName = n),
      (this._targetInst = l),
      (this.type = r),
      (this.nativeEvent = i),
      (this.target = o),
      (this.currentTarget = null));
    for (var u in e) e.hasOwnProperty(u) && ((n = e[u]), (this[u] = n ? n(i) : i[u]));
    return (
      (this.isDefaultPrevented = (
        i.defaultPrevented != null ? i.defaultPrevented : i.returnValue === !1
      )
        ? Sl
        : Ss),
      (this.isPropagationStopped = Ss),
      this
    );
  }
  return (
    ae(t.prototype, {
      preventDefault: function () {
        this.defaultPrevented = !0;
        var n = this.nativeEvent;
        n &&
          (n.preventDefault
            ? n.preventDefault()
            : typeof n.returnValue != "unknown" && (n.returnValue = !1),
          (this.isDefaultPrevented = Sl));
      },
      stopPropagation: function () {
        var n = this.nativeEvent;
        n &&
          (n.stopPropagation
            ? n.stopPropagation()
            : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0),
          (this.isPropagationStopped = Sl));
      },
      persist: function () {},
      isPersistent: Sl,
    }),
    t
  );
}
var or = {
    eventPhase: 0,
    bubbles: 0,
    cancelable: 0,
    timeStamp: function (e) {
      return e.timeStamp || Date.now();
    },
    defaultPrevented: 0,
    isTrusted: 0,
  },
  oa = Ke(or),
  ul = ae({}, or, { view: 0, detail: 0 }),
  Qm = Ke(ul),
  no,
  ro,
  yr,
  Ni = ae({}, ul, {
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    getModifierState: ua,
    button: 0,
    buttons: 0,
    relatedTarget: function (e) {
      return e.relatedTarget === void 0
        ? e.fromElement === e.srcElement
          ? e.toElement
          : e.fromElement
        : e.relatedTarget;
    },
    movementX: function (e) {
      return "movementX" in e
        ? e.movementX
        : (e !== yr &&
            (yr && e.type === "mousemove"
              ? ((no = e.screenX - yr.screenX), (ro = e.screenY - yr.screenY))
              : (ro = no = 0),
            (yr = e)),
          no);
    },
    movementY: function (e) {
      return "movementY" in e ? e.movementY : ro;
    },
  }),
  Es = Ke(Ni),
  Ym = ae({}, Ni, { dataTransfer: 0 }),
  Xm = Ke(Ym),
  Km = ae({}, ul, { relatedTarget: 0 }),
  lo = Ke(Km),
  Gm = ae({}, or, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }),
  qm = Ke(Gm),
  Jm = ae({}, or, {
    clipboardData: function (e) {
      return "clipboardData" in e ? e.clipboardData : window.clipboardData;
    },
  }),
  Zm = Ke(Jm),
  eg = ae({}, or, { data: 0 }),
  Cs = Ke(eg),
  tg = {
    Esc: "Escape",
    Spacebar: " ",
    Left: "ArrowLeft",
    Up: "ArrowUp",
    Right: "ArrowRight",
    Down: "ArrowDown",
    Del: "Delete",
    Win: "OS",
    Menu: "ContextMenu",
    Apps: "ContextMenu",
    Scroll: "ScrollLock",
    MozPrintableKey: "Unidentified",
  },
  ng = {
    8: "Backspace",
    9: "Tab",
    12: "Clear",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    45: "Insert",
    46: "Delete",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrollLock",
    224: "Meta",
  },
  rg = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
function lg(e) {
  var t = this.nativeEvent;
  return t.getModifierState ? t.getModifierState(e) : (e = rg[e]) ? !!t[e] : !1;
}
function ua() {
  return lg;
}
var ig = ae({}, ul, {
    key: function (e) {
      if (e.key) {
        var t = tg[e.key] || e.key;
        if (t !== "Unidentified") return t;
      }
      return e.type === "keypress"
        ? ((e = Vl(e)), e === 13 ? "Enter" : String.fromCharCode(e))
        : e.type === "keydown" || e.type === "keyup"
          ? ng[e.keyCode] || "Unidentified"
          : "";
    },
    code: 0,
    location: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    repeat: 0,
    locale: 0,
    getModifierState: ua,
    charCode: function (e) {
      return e.type === "keypress" ? Vl(e) : 0;
    },
    keyCode: function (e) {
      return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
    },
    which: function (e) {
      return e.type === "keypress"
        ? Vl(e)
        : e.type === "keydown" || e.type === "keyup"
          ? e.keyCode
          : 0;
    },
  }),
  og = Ke(ig),
  ug = ae({}, Ni, {
    pointerId: 0,
    width: 0,
    height: 0,
    pressure: 0,
    tangentialPressure: 0,
    tiltX: 0,
    tiltY: 0,
    twist: 0,
    pointerType: 0,
    isPrimary: 0,
  }),
  Ps = Ke(ug),
  ag = ae({}, ul, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: ua,
  }),
  sg = Ke(ag),
  cg = ae({}, or, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }),
  fg = Ke(cg),
  pg = ae({}, Ni, {
    deltaX: function (e) {
      return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
    },
    deltaY: function (e) {
      return "deltaY" in e
        ? e.deltaY
        : "wheelDeltaY" in e
          ? -e.wheelDeltaY
          : "wheelDelta" in e
            ? -e.wheelDelta
            : 0;
    },
    deltaZ: 0,
    deltaMode: 0,
  }),
  dg = Ke(pg),
  hg = [9, 13, 27, 32],
  aa = Nt && "CompositionEvent" in window,
  Nr = null;
Nt && "documentMode" in document && (Nr = document.documentMode);
var mg = Nt && "TextEvent" in window && !Nr,
  dp = Nt && (!aa || (Nr && 8 < Nr && 11 >= Nr)),
  _s = " ",
  Ts = !1;
function hp(e, t) {
  switch (e) {
    case "keyup":
      return hg.indexOf(t.keyCode) !== -1;
    case "keydown":
      return t.keyCode !== 229;
    case "keypress":
    case "mousedown":
    case "focusout":
      return !0;
    default:
      return !1;
  }
}
function mp(e) {
  return ((e = e.detail), typeof e == "object" && "data" in e ? e.data : null);
}
var On = !1;
function gg(e, t) {
  switch (e) {
    case "compositionend":
      return mp(t);
    case "keypress":
      return t.which !== 32 ? null : ((Ts = !0), _s);
    case "textInput":
      return ((e = t.data), e === _s && Ts ? null : e);
    default:
      return null;
  }
}
function yg(e, t) {
  if (On)
    return e === "compositionend" || (!aa && hp(e, t))
      ? ((e = pp()), (Ul = ia = Vt = null), (On = !1), e)
      : null;
  switch (e) {
    case "paste":
      return null;
    case "keypress":
      if (!(t.ctrlKey || t.altKey || t.metaKey) || (t.ctrlKey && t.altKey)) {
        if (t.char && 1 < t.char.length) return t.char;
        if (t.which) return String.fromCharCode(t.which);
      }
      return null;
    case "compositionend":
      return dp && t.locale !== "ko" ? null : t.data;
    default:
      return null;
  }
}
var vg = {
  color: !0,
  date: !0,
  datetime: !0,
  "datetime-local": !0,
  email: !0,
  month: !0,
  number: !0,
  password: !0,
  range: !0,
  search: !0,
  tel: !0,
  text: !0,
  time: !0,
  url: !0,
  week: !0,
};
function Is(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t === "input" ? !!vg[e.type] : t === "textarea";
}
function gp(e, t, n, r) {
  (Yf(r),
    (t = ui(t, "onChange")),
    0 < t.length &&
      ((n = new oa("onChange", "change", null, n, r)), e.push({ event: n, listeners: t })));
}
var zr = null,
  br = null;
function kg(e) {
  Tp(e, 0);
}
function zi(e) {
  var t = An(e);
  if (Uf(t)) return e;
}
function wg(e, t) {
  if (e === "change") return t;
}
var yp = !1;
if (Nt) {
  var io;
  if (Nt) {
    var oo = "oninput" in document;
    if (!oo) {
      var Ns = document.createElement("div");
      (Ns.setAttribute("oninput", "return;"), (oo = typeof Ns.oninput == "function"));
    }
    io = oo;
  } else io = !1;
  yp = io && (!document.documentMode || 9 < document.documentMode);
}
function zs() {
  zr && (zr.detachEvent("onpropertychange", vp), (br = zr = null));
}
function vp(e) {
  if (e.propertyName === "value" && zi(br)) {
    var t = [];
    (gp(t, br, e, ea(e)), qf(kg, t));
  }
}
function xg(e, t, n) {
  e === "focusin"
    ? (zs(), (zr = t), (br = n), zr.attachEvent("onpropertychange", vp))
    : e === "focusout" && zs();
}
function Sg(e) {
  if (e === "selectionchange" || e === "keyup" || e === "keydown") return zi(br);
}
function Eg(e, t) {
  if (e === "click") return zi(t);
}
function Cg(e, t) {
  if (e === "input" || e === "change") return zi(t);
}
function Pg(e, t) {
  return (e === t && (e !== 0 || 1 / e === 1 / t)) || (e !== e && t !== t);
}
var ft = typeof Object.is == "function" ? Object.is : Pg;
function Qr(e, t) {
  if (ft(e, t)) return !0;
  if (typeof e != "object" || e === null || typeof t != "object" || t === null) return !1;
  var n = Object.keys(e),
    r = Object.keys(t);
  if (n.length !== r.length) return !1;
  for (r = 0; r < n.length; r++) {
    var l = n[r];
    if (!Bo.call(t, l) || !ft(e[l], t[l])) return !1;
  }
  return !0;
}
function Ls(e) {
  for (; e && e.firstChild; ) e = e.firstChild;
  return e;
}
function Rs(e, t) {
  var n = Ls(e);
  e = 0;
  for (var r; n; ) {
    if (n.nodeType === 3) {
      if (((r = e + n.textContent.length), e <= t && r >= t)) return { node: n, offset: t - e };
      e = r;
    }
    e: {
      for (; n; ) {
        if (n.nextSibling) {
          n = n.nextSibling;
          break e;
        }
        n = n.parentNode;
      }
      n = void 0;
    }
    n = Ls(n);
  }
}
function kp(e, t) {
  return e && t
    ? e === t
      ? !0
      : e && e.nodeType === 3
        ? !1
        : t && t.nodeType === 3
          ? kp(e, t.parentNode)
          : "contains" in e
            ? e.contains(t)
            : e.compareDocumentPosition
              ? !!(e.compareDocumentPosition(t) & 16)
              : !1
    : !1;
}
function wp() {
  for (var e = window, t = ei(); t instanceof e.HTMLIFrameElement; ) {
    try {
      var n = typeof t.contentWindow.location.href == "string";
    } catch {
      n = !1;
    }
    if (n) e = t.contentWindow;
    else break;
    t = ei(e.document);
  }
  return t;
}
function sa(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return (
    t &&
    ((t === "input" &&
      (e.type === "text" ||
        e.type === "search" ||
        e.type === "tel" ||
        e.type === "url" ||
        e.type === "password")) ||
      t === "textarea" ||
      e.contentEditable === "true")
  );
}
function _g(e) {
  var t = wp(),
    n = e.focusedElem,
    r = e.selectionRange;
  if (t !== n && n && n.ownerDocument && kp(n.ownerDocument.documentElement, n)) {
    if (r !== null && sa(n)) {
      if (((t = r.start), (e = r.end), e === void 0 && (e = t), "selectionStart" in n))
        ((n.selectionStart = t), (n.selectionEnd = Math.min(e, n.value.length)));
      else if (
        ((e = ((t = n.ownerDocument || document) && t.defaultView) || window), e.getSelection)
      ) {
        e = e.getSelection();
        var l = n.textContent.length,
          i = Math.min(r.start, l);
        ((r = r.end === void 0 ? i : Math.min(r.end, l)),
          !e.extend && i > r && ((l = r), (r = i), (i = l)),
          (l = Rs(n, i)));
        var o = Rs(n, r);
        l &&
          o &&
          (e.rangeCount !== 1 ||
            e.anchorNode !== l.node ||
            e.anchorOffset !== l.offset ||
            e.focusNode !== o.node ||
            e.focusOffset !== o.offset) &&
          ((t = t.createRange()),
          t.setStart(l.node, l.offset),
          e.removeAllRanges(),
          i > r
            ? (e.addRange(t), e.extend(o.node, o.offset))
            : (t.setEnd(o.node, o.offset), e.addRange(t)));
      }
    }
    for (t = [], e = n; (e = e.parentNode); )
      e.nodeType === 1 && t.push({ element: e, left: e.scrollLeft, top: e.scrollTop });
    for (typeof n.focus == "function" && n.focus(), n = 0; n < t.length; n++)
      ((e = t[n]), (e.element.scrollLeft = e.left), (e.element.scrollTop = e.top));
  }
}
var Tg = Nt && "documentMode" in document && 11 >= document.documentMode,
  Dn = null,
  ru = null,
  Lr = null,
  lu = !1;
function Os(e, t, n) {
  var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
  lu ||
    Dn == null ||
    Dn !== ei(r) ||
    ((r = Dn),
    "selectionStart" in r && sa(r)
      ? (r = { start: r.selectionStart, end: r.selectionEnd })
      : ((r = ((r.ownerDocument && r.ownerDocument.defaultView) || window).getSelection()),
        (r = {
          anchorNode: r.anchorNode,
          anchorOffset: r.anchorOffset,
          focusNode: r.focusNode,
          focusOffset: r.focusOffset,
        })),
    (Lr && Qr(Lr, r)) ||
      ((Lr = r),
      (r = ui(ru, "onSelect")),
      0 < r.length &&
        ((t = new oa("onSelect", "select", null, t, n)),
        e.push({ event: t, listeners: r }),
        (t.target = Dn))));
}
function El(e, t) {
  var n = {};
  return (
    (n[e.toLowerCase()] = t.toLowerCase()),
    (n["Webkit" + e] = "webkit" + t),
    (n["Moz" + e] = "moz" + t),
    n
  );
}
var Mn = {
    animationend: El("Animation", "AnimationEnd"),
    animationiteration: El("Animation", "AnimationIteration"),
    animationstart: El("Animation", "AnimationStart"),
    transitionend: El("Transition", "TransitionEnd"),
  },
  uo = {},
  xp = {};
Nt &&
  ((xp = document.createElement("div").style),
  "AnimationEvent" in window ||
    (delete Mn.animationend.animation,
    delete Mn.animationiteration.animation,
    delete Mn.animationstart.animation),
  "TransitionEvent" in window || delete Mn.transitionend.transition);
function Li(e) {
  if (uo[e]) return uo[e];
  if (!Mn[e]) return e;
  var t = Mn[e],
    n;
  for (n in t) if (t.hasOwnProperty(n) && n in xp) return (uo[e] = t[n]);
  return e;
}
var Sp = Li("animationend"),
  Ep = Li("animationiteration"),
  Cp = Li("animationstart"),
  Pp = Li("transitionend"),
  _p = new Map(),
  Ds =
    "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(
      " ",
    );
function en(e, t) {
  (_p.set(e, t), xn(t, [e]));
}
for (var ao = 0; ao < Ds.length; ao++) {
  var so = Ds[ao],
    Ig = so.toLowerCase(),
    Ng = so[0].toUpperCase() + so.slice(1);
  en(Ig, "on" + Ng);
}
en(Sp, "onAnimationEnd");
en(Ep, "onAnimationIteration");
en(Cp, "onAnimationStart");
en("dblclick", "onDoubleClick");
en("focusin", "onFocus");
en("focusout", "onBlur");
en(Pp, "onTransitionEnd");
Jn("onMouseEnter", ["mouseout", "mouseover"]);
Jn("onMouseLeave", ["mouseout", "mouseover"]);
Jn("onPointerEnter", ["pointerout", "pointerover"]);
Jn("onPointerLeave", ["pointerout", "pointerover"]);
xn("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
xn(
  "onSelect",
  "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "),
);
xn("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
xn("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
xn("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
xn("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
var _r =
    "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(
      " ",
    ),
  zg = new Set("cancel close invalid load scroll toggle".split(" ").concat(_r));
function Ms(e, t, n) {
  var r = e.type || "unknown-event";
  ((e.currentTarget = n), Im(r, t, void 0, e), (e.currentTarget = null));
}
function Tp(e, t) {
  t = (t & 4) !== 0;
  for (var n = 0; n < e.length; n++) {
    var r = e[n],
      l = r.event;
    r = r.listeners;
    e: {
      var i = void 0;
      if (t)
        for (var o = r.length - 1; 0 <= o; o--) {
          var u = r[o],
            a = u.instance,
            s = u.currentTarget;
          if (((u = u.listener), a !== i && l.isPropagationStopped())) break e;
          (Ms(l, u, s), (i = a));
        }
      else
        for (o = 0; o < r.length; o++) {
          if (
            ((u = r[o]),
            (a = u.instance),
            (s = u.currentTarget),
            (u = u.listener),
            a !== i && l.isPropagationStopped())
          )
            break e;
          (Ms(l, u, s), (i = a));
        }
    }
  }
  if (ni) throw ((e = Zo), (ni = !1), (Zo = null), e);
}
function ne(e, t) {
  var n = t[su];
  n === void 0 && (n = t[su] = new Set());
  var r = e + "__bubble";
  n.has(r) || (Ip(t, e, 2, !1), n.add(r));
}
function co(e, t, n) {
  var r = 0;
  (t && (r |= 4), Ip(n, e, r, t));
}
var Cl = "_reactListening" + Math.random().toString(36).slice(2);
function Yr(e) {
  if (!e[Cl]) {
    ((e[Cl] = !0),
      Mf.forEach(function (n) {
        n !== "selectionchange" && (zg.has(n) || co(n, !1, e), co(n, !0, e));
      }));
    var t = e.nodeType === 9 ? e : e.ownerDocument;
    t === null || t[Cl] || ((t[Cl] = !0), co("selectionchange", !1, t));
  }
}
function Ip(e, t, n, r) {
  switch (fp(t)) {
    case 1:
      var l = Wm;
      break;
    case 4:
      l = bm;
      break;
    default:
      l = la;
  }
  ((n = l.bind(null, t, n, e)),
    (l = void 0),
    !Jo || (t !== "touchstart" && t !== "touchmove" && t !== "wheel") || (l = !0),
    r
      ? l !== void 0
        ? e.addEventListener(t, n, { capture: !0, passive: l })
        : e.addEventListener(t, n, !0)
      : l !== void 0
        ? e.addEventListener(t, n, { passive: l })
        : e.addEventListener(t, n, !1));
}
function fo(e, t, n, r, l) {
  var i = r;
  if (!(t & 1) && !(t & 2) && r !== null)
    e: for (;;) {
      if (r === null) return;
      var o = r.tag;
      if (o === 3 || o === 4) {
        var u = r.stateNode.containerInfo;
        if (u === l || (u.nodeType === 8 && u.parentNode === l)) break;
        if (o === 4)
          for (o = r.return; o !== null; ) {
            var a = o.tag;
            if (
              (a === 3 || a === 4) &&
              ((a = o.stateNode.containerInfo), a === l || (a.nodeType === 8 && a.parentNode === l))
            )
              return;
            o = o.return;
          }
        for (; u !== null; ) {
          if (((o = cn(u)), o === null)) return;
          if (((a = o.tag), a === 5 || a === 6)) {
            r = i = o;
            continue e;
          }
          u = u.parentNode;
        }
      }
      r = r.return;
    }
  qf(function () {
    var s = i,
      c = ea(n),
      f = [];
    e: {
      var d = _p.get(e);
      if (d !== void 0) {
        var p = oa,
          w = e;
        switch (e) {
          case "keypress":
            if (Vl(n) === 0) break e;
          case "keydown":
          case "keyup":
            p = og;
            break;
          case "focusin":
            ((w = "focus"), (p = lo));
            break;
          case "focusout":
            ((w = "blur"), (p = lo));
            break;
          case "beforeblur":
          case "afterblur":
            p = lo;
            break;
          case "click":
            if (n.button === 2) break e;
          case "auxclick":
          case "dblclick":
          case "mousedown":
          case "mousemove":
          case "mouseup":
          case "mouseout":
          case "mouseover":
          case "contextmenu":
            p = Es;
            break;
          case "drag":
          case "dragend":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "dragstart":
          case "drop":
            p = Xm;
            break;
          case "touchcancel":
          case "touchend":
          case "touchmove":
          case "touchstart":
            p = sg;
            break;
          case Sp:
          case Ep:
          case Cp:
            p = qm;
            break;
          case Pp:
            p = fg;
            break;
          case "scroll":
            p = Qm;
            break;
          case "wheel":
            p = dg;
            break;
          case "copy":
          case "cut":
          case "paste":
            p = Zm;
            break;
          case "gotpointercapture":
          case "lostpointercapture":
          case "pointercancel":
          case "pointerdown":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "pointerup":
            p = Ps;
        }
        var v = (t & 4) !== 0,
          S = !v && e === "scroll",
          h = v ? (d !== null ? d + "Capture" : null) : d;
        v = [];
        for (var m = s, y; m !== null; ) {
          y = m;
          var E = y.stateNode;
          if (
            (y.tag === 5 &&
              E !== null &&
              ((y = E), h !== null && ((E = Vr(m, h)), E != null && v.push(Xr(m, E, y)))),
            S)
          )
            break;
          m = m.return;
        }
        0 < v.length && ((d = new p(d, w, null, n, c)), f.push({ event: d, listeners: v }));
      }
    }
    if (!(t & 7)) {
      e: {
        if (
          ((d = e === "mouseover" || e === "pointerover"),
          (p = e === "mouseout" || e === "pointerout"),
          d && n !== Go && (w = n.relatedTarget || n.fromElement) && (cn(w) || w[zt]))
        )
          break e;
        if (
          (p || d) &&
          ((d =
            c.window === c ? c : (d = c.ownerDocument) ? d.defaultView || d.parentWindow : window),
          p
            ? ((w = n.relatedTarget || n.toElement),
              (p = s),
              (w = w ? cn(w) : null),
              w !== null && ((S = Sn(w)), w !== S || (w.tag !== 5 && w.tag !== 6)) && (w = null))
            : ((p = null), (w = s)),
          p !== w)
        ) {
          if (
            ((v = Es),
            (E = "onMouseLeave"),
            (h = "onMouseEnter"),
            (m = "mouse"),
            (e === "pointerout" || e === "pointerover") &&
              ((v = Ps), (E = "onPointerLeave"), (h = "onPointerEnter"), (m = "pointer")),
            (S = p == null ? d : An(p)),
            (y = w == null ? d : An(w)),
            (d = new v(E, m + "leave", p, n, c)),
            (d.target = S),
            (d.relatedTarget = y),
            (E = null),
            cn(c) === s &&
              ((v = new v(h, m + "enter", w, n, c)),
              (v.target = y),
              (v.relatedTarget = S),
              (E = v)),
            (S = E),
            p && w)
          )
            t: {
              for (v = p, h = w, m = 0, y = v; y; y = Tn(y)) m++;
              for (y = 0, E = h; E; E = Tn(E)) y++;
              for (; 0 < m - y; ) ((v = Tn(v)), m--);
              for (; 0 < y - m; ) ((h = Tn(h)), y--);
              for (; m--; ) {
                if (v === h || (h !== null && v === h.alternate)) break t;
                ((v = Tn(v)), (h = Tn(h)));
              }
              v = null;
            }
          else v = null;
          (p !== null && As(f, d, p, v, !1), w !== null && S !== null && As(f, S, w, v, !0));
        }
      }
      e: {
        if (
          ((d = s ? An(s) : window),
          (p = d.nodeName && d.nodeName.toLowerCase()),
          p === "select" || (p === "input" && d.type === "file"))
        )
          var P = wg;
        else if (Is(d))
          if (yp) P = Cg;
          else {
            P = Sg;
            var x = xg;
          }
        else
          (p = d.nodeName) &&
            p.toLowerCase() === "input" &&
            (d.type === "checkbox" || d.type === "radio") &&
            (P = Eg);
        if (P && (P = P(e, s))) {
          gp(f, P, n, c);
          break e;
        }
        (x && x(e, d, s),
          e === "focusout" &&
            (x = d._wrapperState) &&
            x.controlled &&
            d.type === "number" &&
            bo(d, "number", d.value));
      }
      switch (((x = s ? An(s) : window), e)) {
        case "focusin":
          (Is(x) || x.contentEditable === "true") && ((Dn = x), (ru = s), (Lr = null));
          break;
        case "focusout":
          Lr = ru = Dn = null;
          break;
        case "mousedown":
          lu = !0;
          break;
        case "contextmenu":
        case "mouseup":
        case "dragend":
          ((lu = !1), Os(f, n, c));
          break;
        case "selectionchange":
          if (Tg) break;
        case "keydown":
        case "keyup":
          Os(f, n, c);
      }
      var T;
      if (aa)
        e: {
          switch (e) {
            case "compositionstart":
              var L = "onCompositionStart";
              break e;
            case "compositionend":
              L = "onCompositionEnd";
              break e;
            case "compositionupdate":
              L = "onCompositionUpdate";
              break e;
          }
          L = void 0;
        }
      else
        On
          ? hp(e, n) && (L = "onCompositionEnd")
          : e === "keydown" && n.keyCode === 229 && (L = "onCompositionStart");
      (L &&
        (dp &&
          n.locale !== "ko" &&
          (On || L !== "onCompositionStart"
            ? L === "onCompositionEnd" && On && (T = pp())
            : ((Vt = c), (ia = "value" in Vt ? Vt.value : Vt.textContent), (On = !0))),
        (x = ui(s, L)),
        0 < x.length &&
          ((L = new Cs(L, e, null, n, c)),
          f.push({ event: L, listeners: x }),
          T ? (L.data = T) : ((T = mp(n)), T !== null && (L.data = T)))),
        (T = mg ? gg(e, n) : yg(e, n)) &&
          ((s = ui(s, "onBeforeInput")),
          0 < s.length &&
            ((c = new Cs("onBeforeInput", "beforeinput", null, n, c)),
            f.push({ event: c, listeners: s }),
            (c.data = T))));
    }
    Tp(f, t);
  });
}
function Xr(e, t, n) {
  return { instance: e, listener: t, currentTarget: n };
}
function ui(e, t) {
  for (var n = t + "Capture", r = []; e !== null; ) {
    var l = e,
      i = l.stateNode;
    (l.tag === 5 &&
      i !== null &&
      ((l = i),
      (i = Vr(e, n)),
      i != null && r.unshift(Xr(e, i, l)),
      (i = Vr(e, t)),
      i != null && r.push(Xr(e, i, l))),
      (e = e.return));
  }
  return r;
}
function Tn(e) {
  if (e === null) return null;
  do e = e.return;
  while (e && e.tag !== 5);
  return e || null;
}
function As(e, t, n, r, l) {
  for (var i = t._reactName, o = []; n !== null && n !== r; ) {
    var u = n,
      a = u.alternate,
      s = u.stateNode;
    if (a !== null && a === r) break;
    (u.tag === 5 &&
      s !== null &&
      ((u = s),
      l
        ? ((a = Vr(n, i)), a != null && o.unshift(Xr(n, a, u)))
        : l || ((a = Vr(n, i)), a != null && o.push(Xr(n, a, u)))),
      (n = n.return));
  }
  o.length !== 0 && e.push({ event: t, listeners: o });
}
var Lg = /\r\n?/g,
  Rg = /\u0000|\uFFFD/g;
function Fs(e) {
  return (typeof e == "string" ? e : "" + e)
    .replace(
      Lg,
      `
`,
    )
    .replace(Rg, "");
}
function Pl(e, t, n) {
  if (((t = Fs(t)), Fs(e) !== t && n)) throw Error(I(425));
}
function ai() {}
var iu = null,
  ou = null;
function uu(e, t) {
  return (
    e === "textarea" ||
    e === "noscript" ||
    typeof t.children == "string" ||
    typeof t.children == "number" ||
    (typeof t.dangerouslySetInnerHTML == "object" &&
      t.dangerouslySetInnerHTML !== null &&
      t.dangerouslySetInnerHTML.__html != null)
  );
}
var au = typeof setTimeout == "function" ? setTimeout : void 0,
  Og = typeof clearTimeout == "function" ? clearTimeout : void 0,
  Bs = typeof Promise == "function" ? Promise : void 0,
  Dg =
    typeof queueMicrotask == "function"
      ? queueMicrotask
      : typeof Bs < "u"
        ? function (e) {
            return Bs.resolve(null).then(e).catch(Mg);
          }
        : au;
function Mg(e) {
  setTimeout(function () {
    throw e;
  });
}
function po(e, t) {
  var n = t,
    r = 0;
  do {
    var l = n.nextSibling;
    if ((e.removeChild(n), l && l.nodeType === 8))
      if (((n = l.data), n === "/$")) {
        if (r === 0) {
          (e.removeChild(l), Wr(t));
          return;
        }
        r--;
      } else (n !== "$" && n !== "$?" && n !== "$!") || r++;
    n = l;
  } while (n);
  Wr(t);
}
function Yt(e) {
  for (; e != null; e = e.nextSibling) {
    var t = e.nodeType;
    if (t === 1 || t === 3) break;
    if (t === 8) {
      if (((t = e.data), t === "$" || t === "$!" || t === "$?")) break;
      if (t === "/$") return null;
    }
  }
  return e;
}
function js(e) {
  e = e.previousSibling;
  for (var t = 0; e; ) {
    if (e.nodeType === 8) {
      var n = e.data;
      if (n === "$" || n === "$!" || n === "$?") {
        if (t === 0) return e;
        t--;
      } else n === "/$" && t++;
    }
    e = e.previousSibling;
  }
  return null;
}
var ur = Math.random().toString(36).slice(2),
  gt = "__reactFiber$" + ur,
  Kr = "__reactProps$" + ur,
  zt = "__reactContainer$" + ur,
  su = "__reactEvents$" + ur,
  Ag = "__reactListeners$" + ur,
  Fg = "__reactHandles$" + ur;
function cn(e) {
  var t = e[gt];
  if (t) return t;
  for (var n = e.parentNode; n; ) {
    if ((t = n[zt] || n[gt])) {
      if (((n = t.alternate), t.child !== null || (n !== null && n.child !== null)))
        for (e = js(e); e !== null; ) {
          if ((n = e[gt])) return n;
          e = js(e);
        }
      return t;
    }
    ((e = n), (n = e.parentNode));
  }
  return null;
}
function al(e) {
  return (
    (e = e[gt] || e[zt]),
    !e || (e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3) ? null : e
  );
}
function An(e) {
  if (e.tag === 5 || e.tag === 6) return e.stateNode;
  throw Error(I(33));
}
function Ri(e) {
  return e[Kr] || null;
}
var cu = [],
  Fn = -1;
function tn(e) {
  return { current: e };
}
function re(e) {
  0 > Fn || ((e.current = cu[Fn]), (cu[Fn] = null), Fn--);
}
function Z(e, t) {
  (Fn++, (cu[Fn] = e.current), (e.current = t));
}
var Zt = {},
  Te = tn(Zt),
  Ae = tn(!1),
  gn = Zt;
function Zn(e, t) {
  var n = e.type.contextTypes;
  if (!n) return Zt;
  var r = e.stateNode;
  if (r && r.__reactInternalMemoizedUnmaskedChildContext === t)
    return r.__reactInternalMemoizedMaskedChildContext;
  var l = {},
    i;
  for (i in n) l[i] = t[i];
  return (
    r &&
      ((e = e.stateNode),
      (e.__reactInternalMemoizedUnmaskedChildContext = t),
      (e.__reactInternalMemoizedMaskedChildContext = l)),
    l
  );
}
function Fe(e) {
  return ((e = e.childContextTypes), e != null);
}
function si() {
  (re(Ae), re(Te));
}
function Us(e, t, n) {
  if (Te.current !== Zt) throw Error(I(168));
  (Z(Te, t), Z(Ae, n));
}
function Np(e, t, n) {
  var r = e.stateNode;
  if (((t = t.childContextTypes), typeof r.getChildContext != "function")) return n;
  r = r.getChildContext();
  for (var l in r) if (!(l in t)) throw Error(I(108, xm(e) || "Unknown", l));
  return ae({}, n, r);
}
function ci(e) {
  return (
    (e = ((e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext) || Zt),
    (gn = Te.current),
    Z(Te, e),
    Z(Ae, Ae.current),
    !0
  );
}
function Vs(e, t, n) {
  var r = e.stateNode;
  if (!r) throw Error(I(169));
  (n
    ? ((e = Np(e, t, gn)),
      (r.__reactInternalMemoizedMergedChildContext = e),
      re(Ae),
      re(Te),
      Z(Te, e))
    : re(Ae),
    Z(Ae, n));
}
var Pt = null,
  Oi = !1,
  ho = !1;
function zp(e) {
  Pt === null ? (Pt = [e]) : Pt.push(e);
}
function Bg(e) {
  ((Oi = !0), zp(e));
}
function nn() {
  if (!ho && Pt !== null) {
    ho = !0;
    var e = 0,
      t = K;
    try {
      var n = Pt;
      for (K = 1; e < n.length; e++) {
        var r = n[e];
        do r = r(!0);
        while (r !== null);
      }
      ((Pt = null), (Oi = !1));
    } catch (l) {
      throw (Pt !== null && (Pt = Pt.slice(e + 1)), tp(ta, nn), l);
    } finally {
      ((K = t), (ho = !1));
    }
  }
  return null;
}
var Bn = [],
  jn = 0,
  fi = null,
  pi = 0,
  Ge = [],
  qe = 0,
  yn = null,
  _t = 1,
  Tt = "";
function un(e, t) {
  ((Bn[jn++] = pi), (Bn[jn++] = fi), (fi = e), (pi = t));
}
function Lp(e, t, n) {
  ((Ge[qe++] = _t), (Ge[qe++] = Tt), (Ge[qe++] = yn), (yn = e));
  var r = _t;
  e = Tt;
  var l = 32 - st(r) - 1;
  ((r &= ~(1 << l)), (n += 1));
  var i = 32 - st(t) + l;
  if (30 < i) {
    var o = l - (l % 5);
    ((i = (r & ((1 << o) - 1)).toString(32)),
      (r >>= o),
      (l -= o),
      (_t = (1 << (32 - st(t) + l)) | (n << l) | r),
      (Tt = i + e));
  } else ((_t = (1 << i) | (n << l) | r), (Tt = e));
}
function ca(e) {
  e.return !== null && (un(e, 1), Lp(e, 1, 0));
}
function fa(e) {
  for (; e === fi; ) ((fi = Bn[--jn]), (Bn[jn] = null), (pi = Bn[--jn]), (Bn[jn] = null));
  for (; e === yn; )
    ((yn = Ge[--qe]),
      (Ge[qe] = null),
      (Tt = Ge[--qe]),
      (Ge[qe] = null),
      (_t = Ge[--qe]),
      (Ge[qe] = null));
}
var Qe = null,
  We = null,
  le = !1,
  at = null;
function Rp(e, t) {
  var n = Ze(5, null, null, 0);
  ((n.elementType = "DELETED"),
    (n.stateNode = t),
    (n.return = e),
    (t = e.deletions),
    t === null ? ((e.deletions = [n]), (e.flags |= 16)) : t.push(n));
}
function Hs(e, t) {
  switch (e.tag) {
    case 5:
      var n = e.type;
      return (
        (t = t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase() ? null : t),
        t !== null ? ((e.stateNode = t), (Qe = e), (We = Yt(t.firstChild)), !0) : !1
      );
    case 6:
      return (
        (t = e.pendingProps === "" || t.nodeType !== 3 ? null : t),
        t !== null ? ((e.stateNode = t), (Qe = e), (We = null), !0) : !1
      );
    case 13:
      return (
        (t = t.nodeType !== 8 ? null : t),
        t !== null
          ? ((n = yn !== null ? { id: _t, overflow: Tt } : null),
            (e.memoizedState = { dehydrated: t, treeContext: n, retryLane: 1073741824 }),
            (n = Ze(18, null, null, 0)),
            (n.stateNode = t),
            (n.return = e),
            (e.child = n),
            (Qe = e),
            (We = null),
            !0)
          : !1
      );
    default:
      return !1;
  }
}
function fu(e) {
  return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
}
function pu(e) {
  if (le) {
    var t = We;
    if (t) {
      var n = t;
      if (!Hs(e, t)) {
        if (fu(e)) throw Error(I(418));
        t = Yt(n.nextSibling);
        var r = Qe;
        t && Hs(e, t) ? Rp(r, n) : ((e.flags = (e.flags & -4097) | 2), (le = !1), (Qe = e));
      }
    } else {
      if (fu(e)) throw Error(I(418));
      ((e.flags = (e.flags & -4097) | 2), (le = !1), (Qe = e));
    }
  }
}
function $s(e) {
  for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; ) e = e.return;
  Qe = e;
}
function _l(e) {
  if (e !== Qe) return !1;
  if (!le) return ($s(e), (le = !0), !1);
  var t;
  if (
    ((t = e.tag !== 3) &&
      !(t = e.tag !== 5) &&
      ((t = e.type), (t = t !== "head" && t !== "body" && !uu(e.type, e.memoizedProps))),
    t && (t = We))
  ) {
    if (fu(e)) throw (Op(), Error(I(418)));
    for (; t; ) (Rp(e, t), (t = Yt(t.nextSibling)));
  }
  if (($s(e), e.tag === 13)) {
    if (((e = e.memoizedState), (e = e !== null ? e.dehydrated : null), !e)) throw Error(I(317));
    e: {
      for (e = e.nextSibling, t = 0; e; ) {
        if (e.nodeType === 8) {
          var n = e.data;
          if (n === "/$") {
            if (t === 0) {
              We = Yt(e.nextSibling);
              break e;
            }
            t--;
          } else (n !== "$" && n !== "$!" && n !== "$?") || t++;
        }
        e = e.nextSibling;
      }
      We = null;
    }
  } else We = Qe ? Yt(e.stateNode.nextSibling) : null;
  return !0;
}
function Op() {
  for (var e = We; e; ) e = Yt(e.nextSibling);
}
function er() {
  ((We = Qe = null), (le = !1));
}
function pa(e) {
  at === null ? (at = [e]) : at.push(e);
}
var jg = Ot.ReactCurrentBatchConfig;
function vr(e, t, n) {
  if (((e = n.ref), e !== null && typeof e != "function" && typeof e != "object")) {
    if (n._owner) {
      if (((n = n._owner), n)) {
        if (n.tag !== 1) throw Error(I(309));
        var r = n.stateNode;
      }
      if (!r) throw Error(I(147, e));
      var l = r,
        i = "" + e;
      return t !== null && t.ref !== null && typeof t.ref == "function" && t.ref._stringRef === i
        ? t.ref
        : ((t = function (o) {
            var u = l.refs;
            o === null ? delete u[i] : (u[i] = o);
          }),
          (t._stringRef = i),
          t);
    }
    if (typeof e != "string") throw Error(I(284));
    if (!n._owner) throw Error(I(290, e));
  }
  return e;
}
function Tl(e, t) {
  throw (
    (e = Object.prototype.toString.call(t)),
    Error(
      I(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e),
    )
  );
}
function Ws(e) {
  var t = e._init;
  return t(e._payload);
}
function Dp(e) {
  function t(h, m) {
    if (e) {
      var y = h.deletions;
      y === null ? ((h.deletions = [m]), (h.flags |= 16)) : y.push(m);
    }
  }
  function n(h, m) {
    if (!e) return null;
    for (; m !== null; ) (t(h, m), (m = m.sibling));
    return null;
  }
  function r(h, m) {
    for (h = new Map(); m !== null; )
      (m.key !== null ? h.set(m.key, m) : h.set(m.index, m), (m = m.sibling));
    return h;
  }
  function l(h, m) {
    return ((h = qt(h, m)), (h.index = 0), (h.sibling = null), h);
  }
  function i(h, m, y) {
    return (
      (h.index = y),
      e
        ? ((y = h.alternate),
          y !== null ? ((y = y.index), y < m ? ((h.flags |= 2), m) : y) : ((h.flags |= 2), m))
        : ((h.flags |= 1048576), m)
    );
  }
  function o(h) {
    return (e && h.alternate === null && (h.flags |= 2), h);
  }
  function u(h, m, y, E) {
    return m === null || m.tag !== 6
      ? ((m = xo(y, h.mode, E)), (m.return = h), m)
      : ((m = l(m, y)), (m.return = h), m);
  }
  function a(h, m, y, E) {
    var P = y.type;
    return P === Rn
      ? c(h, m, y.props.children, E, y.key)
      : m !== null &&
          (m.elementType === P ||
            (typeof P == "object" && P !== null && P.$$typeof === Ft && Ws(P) === m.type))
        ? ((E = l(m, y.props)), (E.ref = vr(h, m, y)), (E.return = h), E)
        : ((E = Xl(y.type, y.key, y.props, null, h.mode, E)),
          (E.ref = vr(h, m, y)),
          (E.return = h),
          E);
  }
  function s(h, m, y, E) {
    return m === null ||
      m.tag !== 4 ||
      m.stateNode.containerInfo !== y.containerInfo ||
      m.stateNode.implementation !== y.implementation
      ? ((m = So(y, h.mode, E)), (m.return = h), m)
      : ((m = l(m, y.children || [])), (m.return = h), m);
  }
  function c(h, m, y, E, P) {
    return m === null || m.tag !== 7
      ? ((m = hn(y, h.mode, E, P)), (m.return = h), m)
      : ((m = l(m, y)), (m.return = h), m);
  }
  function f(h, m, y) {
    if ((typeof m == "string" && m !== "") || typeof m == "number")
      return ((m = xo("" + m, h.mode, y)), (m.return = h), m);
    if (typeof m == "object" && m !== null) {
      switch (m.$$typeof) {
        case gl:
          return (
            (y = Xl(m.type, m.key, m.props, null, h.mode, y)),
            (y.ref = vr(h, null, m)),
            (y.return = h),
            y
          );
        case Ln:
          return ((m = So(m, h.mode, y)), (m.return = h), m);
        case Ft:
          var E = m._init;
          return f(h, E(m._payload), y);
      }
      if (Cr(m) || dr(m)) return ((m = hn(m, h.mode, y, null)), (m.return = h), m);
      Tl(h, m);
    }
    return null;
  }
  function d(h, m, y, E) {
    var P = m !== null ? m.key : null;
    if ((typeof y == "string" && y !== "") || typeof y == "number")
      return P !== null ? null : u(h, m, "" + y, E);
    if (typeof y == "object" && y !== null) {
      switch (y.$$typeof) {
        case gl:
          return y.key === P ? a(h, m, y, E) : null;
        case Ln:
          return y.key === P ? s(h, m, y, E) : null;
        case Ft:
          return ((P = y._init), d(h, m, P(y._payload), E));
      }
      if (Cr(y) || dr(y)) return P !== null ? null : c(h, m, y, E, null);
      Tl(h, y);
    }
    return null;
  }
  function p(h, m, y, E, P) {
    if ((typeof E == "string" && E !== "") || typeof E == "number")
      return ((h = h.get(y) || null), u(m, h, "" + E, P));
    if (typeof E == "object" && E !== null) {
      switch (E.$$typeof) {
        case gl:
          return ((h = h.get(E.key === null ? y : E.key) || null), a(m, h, E, P));
        case Ln:
          return ((h = h.get(E.key === null ? y : E.key) || null), s(m, h, E, P));
        case Ft:
          var x = E._init;
          return p(h, m, y, x(E._payload), P);
      }
      if (Cr(E) || dr(E)) return ((h = h.get(y) || null), c(m, h, E, P, null));
      Tl(m, E);
    }
    return null;
  }
  function w(h, m, y, E) {
    for (var P = null, x = null, T = m, L = (m = 0), F = null; T !== null && L < y.length; L++) {
      T.index > L ? ((F = T), (T = null)) : (F = T.sibling);
      var M = d(h, T, y[L], E);
      if (M === null) {
        T === null && (T = F);
        break;
      }
      (e && T && M.alternate === null && t(h, T),
        (m = i(M, m, L)),
        x === null ? (P = M) : (x.sibling = M),
        (x = M),
        (T = F));
    }
    if (L === y.length) return (n(h, T), le && un(h, L), P);
    if (T === null) {
      for (; L < y.length; L++)
        ((T = f(h, y[L], E)),
          T !== null && ((m = i(T, m, L)), x === null ? (P = T) : (x.sibling = T), (x = T)));
      return (le && un(h, L), P);
    }
    for (T = r(h, T); L < y.length; L++)
      ((F = p(T, h, L, y[L], E)),
        F !== null &&
          (e && F.alternate !== null && T.delete(F.key === null ? L : F.key),
          (m = i(F, m, L)),
          x === null ? (P = F) : (x.sibling = F),
          (x = F)));
    return (
      e &&
        T.forEach(function (O) {
          return t(h, O);
        }),
      le && un(h, L),
      P
    );
  }
  function v(h, m, y, E) {
    var P = dr(y);
    if (typeof P != "function") throw Error(I(150));
    if (((y = P.call(y)), y == null)) throw Error(I(151));
    for (
      var x = (P = null), T = m, L = (m = 0), F = null, M = y.next();
      T !== null && !M.done;
      L++, M = y.next()
    ) {
      T.index > L ? ((F = T), (T = null)) : (F = T.sibling);
      var O = d(h, T, M.value, E);
      if (O === null) {
        T === null && (T = F);
        break;
      }
      (e && T && O.alternate === null && t(h, T),
        (m = i(O, m, L)),
        x === null ? (P = O) : (x.sibling = O),
        (x = O),
        (T = F));
    }
    if (M.done) return (n(h, T), le && un(h, L), P);
    if (T === null) {
      for (; !M.done; L++, M = y.next())
        ((M = f(h, M.value, E)),
          M !== null && ((m = i(M, m, L)), x === null ? (P = M) : (x.sibling = M), (x = M)));
      return (le && un(h, L), P);
    }
    for (T = r(h, T); !M.done; L++, M = y.next())
      ((M = p(T, h, L, M.value, E)),
        M !== null &&
          (e && M.alternate !== null && T.delete(M.key === null ? L : M.key),
          (m = i(M, m, L)),
          x === null ? (P = M) : (x.sibling = M),
          (x = M)));
    return (
      e &&
        T.forEach(function (A) {
          return t(h, A);
        }),
      le && un(h, L),
      P
    );
  }
  function S(h, m, y, E) {
    if (
      (typeof y == "object" &&
        y !== null &&
        y.type === Rn &&
        y.key === null &&
        (y = y.props.children),
      typeof y == "object" && y !== null)
    ) {
      switch (y.$$typeof) {
        case gl:
          e: {
            for (var P = y.key, x = m; x !== null; ) {
              if (x.key === P) {
                if (((P = y.type), P === Rn)) {
                  if (x.tag === 7) {
                    (n(h, x.sibling), (m = l(x, y.props.children)), (m.return = h), (h = m));
                    break e;
                  }
                } else if (
                  x.elementType === P ||
                  (typeof P == "object" && P !== null && P.$$typeof === Ft && Ws(P) === x.type)
                ) {
                  (n(h, x.sibling),
                    (m = l(x, y.props)),
                    (m.ref = vr(h, x, y)),
                    (m.return = h),
                    (h = m));
                  break e;
                }
                n(h, x);
                break;
              } else t(h, x);
              x = x.sibling;
            }
            y.type === Rn
              ? ((m = hn(y.props.children, h.mode, E, y.key)), (m.return = h), (h = m))
              : ((E = Xl(y.type, y.key, y.props, null, h.mode, E)),
                (E.ref = vr(h, m, y)),
                (E.return = h),
                (h = E));
          }
          return o(h);
        case Ln:
          e: {
            for (x = y.key; m !== null; ) {
              if (m.key === x)
                if (
                  m.tag === 4 &&
                  m.stateNode.containerInfo === y.containerInfo &&
                  m.stateNode.implementation === y.implementation
                ) {
                  (n(h, m.sibling), (m = l(m, y.children || [])), (m.return = h), (h = m));
                  break e;
                } else {
                  n(h, m);
                  break;
                }
              else t(h, m);
              m = m.sibling;
            }
            ((m = So(y, h.mode, E)), (m.return = h), (h = m));
          }
          return o(h);
        case Ft:
          return ((x = y._init), S(h, m, x(y._payload), E));
      }
      if (Cr(y)) return w(h, m, y, E);
      if (dr(y)) return v(h, m, y, E);
      Tl(h, y);
    }
    return (typeof y == "string" && y !== "") || typeof y == "number"
      ? ((y = "" + y),
        m !== null && m.tag === 6
          ? (n(h, m.sibling), (m = l(m, y)), (m.return = h), (h = m))
          : (n(h, m), (m = xo(y, h.mode, E)), (m.return = h), (h = m)),
        o(h))
      : n(h, m);
  }
  return S;
}
var tr = Dp(!0),
  Mp = Dp(!1),
  di = tn(null),
  hi = null,
  Un = null,
  da = null;
function ha() {
  da = Un = hi = null;
}
function ma(e) {
  var t = di.current;
  (re(di), (e._currentValue = t));
}
function du(e, t, n) {
  for (; e !== null; ) {
    var r = e.alternate;
    if (
      ((e.childLanes & t) !== t
        ? ((e.childLanes |= t), r !== null && (r.childLanes |= t))
        : r !== null && (r.childLanes & t) !== t && (r.childLanes |= t),
      e === n)
    )
      break;
    e = e.return;
  }
}
function Yn(e, t) {
  ((hi = e),
    (da = Un = null),
    (e = e.dependencies),
    e !== null && e.firstContext !== null && (e.lanes & t && (Me = !0), (e.firstContext = null)));
}
function tt(e) {
  var t = e._currentValue;
  if (da !== e)
    if (((e = { context: e, memoizedValue: t, next: null }), Un === null)) {
      if (hi === null) throw Error(I(308));
      ((Un = e), (hi.dependencies = { lanes: 0, firstContext: e }));
    } else Un = Un.next = e;
  return t;
}
var fn = null;
function ga(e) {
  fn === null ? (fn = [e]) : fn.push(e);
}
function Ap(e, t, n, r) {
  var l = t.interleaved;
  return (
    l === null ? ((n.next = n), ga(t)) : ((n.next = l.next), (l.next = n)),
    (t.interleaved = n),
    Lt(e, r)
  );
}
function Lt(e, t) {
  e.lanes |= t;
  var n = e.alternate;
  for (n !== null && (n.lanes |= t), n = e, e = e.return; e !== null; )
    ((e.childLanes |= t),
      (n = e.alternate),
      n !== null && (n.childLanes |= t),
      (n = e),
      (e = e.return));
  return n.tag === 3 ? n.stateNode : null;
}
var Bt = !1;
function ya(e) {
  e.updateQueue = {
    baseState: e.memoizedState,
    firstBaseUpdate: null,
    lastBaseUpdate: null,
    shared: { pending: null, interleaved: null, lanes: 0 },
    effects: null,
  };
}
function Fp(e, t) {
  ((e = e.updateQueue),
    t.updateQueue === e &&
      (t.updateQueue = {
        baseState: e.baseState,
        firstBaseUpdate: e.firstBaseUpdate,
        lastBaseUpdate: e.lastBaseUpdate,
        shared: e.shared,
        effects: e.effects,
      }));
}
function It(e, t) {
  return { eventTime: e, lane: t, tag: 0, payload: null, callback: null, next: null };
}
function Xt(e, t, n) {
  var r = e.updateQueue;
  if (r === null) return null;
  if (((r = r.shared), Q & 2)) {
    var l = r.pending;
    return (
      l === null ? (t.next = t) : ((t.next = l.next), (l.next = t)),
      (r.pending = t),
      Lt(e, n)
    );
  }
  return (
    (l = r.interleaved),
    l === null ? ((t.next = t), ga(r)) : ((t.next = l.next), (l.next = t)),
    (r.interleaved = t),
    Lt(e, n)
  );
}
function Hl(e, t, n) {
  if (((t = t.updateQueue), t !== null && ((t = t.shared), (n & 4194240) !== 0))) {
    var r = t.lanes;
    ((r &= e.pendingLanes), (n |= r), (t.lanes = n), na(e, n));
  }
}
function bs(e, t) {
  var n = e.updateQueue,
    r = e.alternate;
  if (r !== null && ((r = r.updateQueue), n === r)) {
    var l = null,
      i = null;
    if (((n = n.firstBaseUpdate), n !== null)) {
      do {
        var o = {
          eventTime: n.eventTime,
          lane: n.lane,
          tag: n.tag,
          payload: n.payload,
          callback: n.callback,
          next: null,
        };
        (i === null ? (l = i = o) : (i = i.next = o), (n = n.next));
      } while (n !== null);
      i === null ? (l = i = t) : (i = i.next = t);
    } else l = i = t;
    ((n = {
      baseState: r.baseState,
      firstBaseUpdate: l,
      lastBaseUpdate: i,
      shared: r.shared,
      effects: r.effects,
    }),
      (e.updateQueue = n));
    return;
  }
  ((e = n.lastBaseUpdate),
    e === null ? (n.firstBaseUpdate = t) : (e.next = t),
    (n.lastBaseUpdate = t));
}
function mi(e, t, n, r) {
  var l = e.updateQueue;
  Bt = !1;
  var i = l.firstBaseUpdate,
    o = l.lastBaseUpdate,
    u = l.shared.pending;
  if (u !== null) {
    l.shared.pending = null;
    var a = u,
      s = a.next;
    ((a.next = null), o === null ? (i = s) : (o.next = s), (o = a));
    var c = e.alternate;
    c !== null &&
      ((c = c.updateQueue),
      (u = c.lastBaseUpdate),
      u !== o && (u === null ? (c.firstBaseUpdate = s) : (u.next = s), (c.lastBaseUpdate = a)));
  }
  if (i !== null) {
    var f = l.baseState;
    ((o = 0), (c = s = a = null), (u = i));
    do {
      var d = u.lane,
        p = u.eventTime;
      if ((r & d) === d) {
        c !== null &&
          (c = c.next =
            {
              eventTime: p,
              lane: 0,
              tag: u.tag,
              payload: u.payload,
              callback: u.callback,
              next: null,
            });
        e: {
          var w = e,
            v = u;
          switch (((d = t), (p = n), v.tag)) {
            case 1:
              if (((w = v.payload), typeof w == "function")) {
                f = w.call(p, f, d);
                break e;
              }
              f = w;
              break e;
            case 3:
              w.flags = (w.flags & -65537) | 128;
            case 0:
              if (((w = v.payload), (d = typeof w == "function" ? w.call(p, f, d) : w), d == null))
                break e;
              f = ae({}, f, d);
              break e;
            case 2:
              Bt = !0;
          }
        }
        u.callback !== null &&
          u.lane !== 0 &&
          ((e.flags |= 64), (d = l.effects), d === null ? (l.effects = [u]) : d.push(u));
      } else
        ((p = {
          eventTime: p,
          lane: d,
          tag: u.tag,
          payload: u.payload,
          callback: u.callback,
          next: null,
        }),
          c === null ? ((s = c = p), (a = f)) : (c = c.next = p),
          (o |= d));
      if (((u = u.next), u === null)) {
        if (((u = l.shared.pending), u === null)) break;
        ((d = u), (u = d.next), (d.next = null), (l.lastBaseUpdate = d), (l.shared.pending = null));
      }
    } while (!0);
    if (
      (c === null && (a = f),
      (l.baseState = a),
      (l.firstBaseUpdate = s),
      (l.lastBaseUpdate = c),
      (t = l.shared.interleaved),
      t !== null)
    ) {
      l = t;
      do ((o |= l.lane), (l = l.next));
      while (l !== t);
    } else i === null && (l.shared.lanes = 0);
    ((kn |= o), (e.lanes = o), (e.memoizedState = f));
  }
}
function Qs(e, t, n) {
  if (((e = t.effects), (t.effects = null), e !== null))
    for (t = 0; t < e.length; t++) {
      var r = e[t],
        l = r.callback;
      if (l !== null) {
        if (((r.callback = null), (r = n), typeof l != "function")) throw Error(I(191, l));
        l.call(r);
      }
    }
}
var sl = {},
  wt = tn(sl),
  Gr = tn(sl),
  qr = tn(sl);
function pn(e) {
  if (e === sl) throw Error(I(174));
  return e;
}
function va(e, t) {
  switch ((Z(qr, t), Z(Gr, e), Z(wt, sl), (e = t.nodeType), e)) {
    case 9:
    case 11:
      t = (t = t.documentElement) ? t.namespaceURI : Yo(null, "");
      break;
    default:
      ((e = e === 8 ? t.parentNode : t),
        (t = e.namespaceURI || null),
        (e = e.tagName),
        (t = Yo(t, e)));
  }
  (re(wt), Z(wt, t));
}
function nr() {
  (re(wt), re(Gr), re(qr));
}
function Bp(e) {
  pn(qr.current);
  var t = pn(wt.current),
    n = Yo(t, e.type);
  t !== n && (Z(Gr, e), Z(wt, n));
}
function ka(e) {
  Gr.current === e && (re(wt), re(Gr));
}
var oe = tn(0);
function gi(e) {
  for (var t = e; t !== null; ) {
    if (t.tag === 13) {
      var n = t.memoizedState;
      if (n !== null && ((n = n.dehydrated), n === null || n.data === "$?" || n.data === "$!"))
        return t;
    } else if (t.tag === 19 && t.memoizedProps.revealOrder !== void 0) {
      if (t.flags & 128) return t;
    } else if (t.child !== null) {
      ((t.child.return = t), (t = t.child));
      continue;
    }
    if (t === e) break;
    for (; t.sibling === null; ) {
      if (t.return === null || t.return === e) return null;
      t = t.return;
    }
    ((t.sibling.return = t.return), (t = t.sibling));
  }
  return null;
}
var mo = [];
function wa() {
  for (var e = 0; e < mo.length; e++) mo[e]._workInProgressVersionPrimary = null;
  mo.length = 0;
}
var $l = Ot.ReactCurrentDispatcher,
  go = Ot.ReactCurrentBatchConfig,
  vn = 0,
  ue = null,
  ye = null,
  ke = null,
  yi = !1,
  Rr = !1,
  Jr = 0,
  Ug = 0;
function Ce() {
  throw Error(I(321));
}
function xa(e, t) {
  if (t === null) return !1;
  for (var n = 0; n < t.length && n < e.length; n++) if (!ft(e[n], t[n])) return !1;
  return !0;
}
function Sa(e, t, n, r, l, i) {
  if (
    ((vn = i),
    (ue = t),
    (t.memoizedState = null),
    (t.updateQueue = null),
    (t.lanes = 0),
    ($l.current = e === null || e.memoizedState === null ? Wg : bg),
    (e = n(r, l)),
    Rr)
  ) {
    i = 0;
    do {
      if (((Rr = !1), (Jr = 0), 25 <= i)) throw Error(I(301));
      ((i += 1), (ke = ye = null), (t.updateQueue = null), ($l.current = Qg), (e = n(r, l)));
    } while (Rr);
  }
  if (
    (($l.current = vi),
    (t = ye !== null && ye.next !== null),
    (vn = 0),
    (ke = ye = ue = null),
    (yi = !1),
    t)
  )
    throw Error(I(300));
  return e;
}
function Ea() {
  var e = Jr !== 0;
  return ((Jr = 0), e);
}
function ht() {
  var e = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
  return (ke === null ? (ue.memoizedState = ke = e) : (ke = ke.next = e), ke);
}
function nt() {
  if (ye === null) {
    var e = ue.alternate;
    e = e !== null ? e.memoizedState : null;
  } else e = ye.next;
  var t = ke === null ? ue.memoizedState : ke.next;
  if (t !== null) ((ke = t), (ye = e));
  else {
    if (e === null) throw Error(I(310));
    ((ye = e),
      (e = {
        memoizedState: ye.memoizedState,
        baseState: ye.baseState,
        baseQueue: ye.baseQueue,
        queue: ye.queue,
        next: null,
      }),
      ke === null ? (ue.memoizedState = ke = e) : (ke = ke.next = e));
  }
  return ke;
}
function Zr(e, t) {
  return typeof t == "function" ? t(e) : t;
}
function yo(e) {
  var t = nt(),
    n = t.queue;
  if (n === null) throw Error(I(311));
  n.lastRenderedReducer = e;
  var r = ye,
    l = r.baseQueue,
    i = n.pending;
  if (i !== null) {
    if (l !== null) {
      var o = l.next;
      ((l.next = i.next), (i.next = o));
    }
    ((r.baseQueue = l = i), (n.pending = null));
  }
  if (l !== null) {
    ((i = l.next), (r = r.baseState));
    var u = (o = null),
      a = null,
      s = i;
    do {
      var c = s.lane;
      if ((vn & c) === c)
        (a !== null &&
          (a = a.next =
            {
              lane: 0,
              action: s.action,
              hasEagerState: s.hasEagerState,
              eagerState: s.eagerState,
              next: null,
            }),
          (r = s.hasEagerState ? s.eagerState : e(r, s.action)));
      else {
        var f = {
          lane: c,
          action: s.action,
          hasEagerState: s.hasEagerState,
          eagerState: s.eagerState,
          next: null,
        };
        (a === null ? ((u = a = f), (o = r)) : (a = a.next = f), (ue.lanes |= c), (kn |= c));
      }
      s = s.next;
    } while (s !== null && s !== i);
    (a === null ? (o = r) : (a.next = u),
      ft(r, t.memoizedState) || (Me = !0),
      (t.memoizedState = r),
      (t.baseState = o),
      (t.baseQueue = a),
      (n.lastRenderedState = r));
  }
  if (((e = n.interleaved), e !== null)) {
    l = e;
    do ((i = l.lane), (ue.lanes |= i), (kn |= i), (l = l.next));
    while (l !== e);
  } else l === null && (n.lanes = 0);
  return [t.memoizedState, n.dispatch];
}
function vo(e) {
  var t = nt(),
    n = t.queue;
  if (n === null) throw Error(I(311));
  n.lastRenderedReducer = e;
  var r = n.dispatch,
    l = n.pending,
    i = t.memoizedState;
  if (l !== null) {
    n.pending = null;
    var o = (l = l.next);
    do ((i = e(i, o.action)), (o = o.next));
    while (o !== l);
    (ft(i, t.memoizedState) || (Me = !0),
      (t.memoizedState = i),
      t.baseQueue === null && (t.baseState = i),
      (n.lastRenderedState = i));
  }
  return [i, r];
}
function jp() {}
function Up(e, t) {
  var n = ue,
    r = nt(),
    l = t(),
    i = !ft(r.memoizedState, l);
  if (
    (i && ((r.memoizedState = l), (Me = !0)),
    (r = r.queue),
    Ca($p.bind(null, n, r, e), [e]),
    r.getSnapshot !== t || i || (ke !== null && ke.memoizedState.tag & 1))
  ) {
    if (((n.flags |= 2048), el(9, Hp.bind(null, n, r, l, t), void 0, null), we === null))
      throw Error(I(349));
    vn & 30 || Vp(n, t, l);
  }
  return l;
}
function Vp(e, t, n) {
  ((e.flags |= 16384),
    (e = { getSnapshot: t, value: n }),
    (t = ue.updateQueue),
    t === null
      ? ((t = { lastEffect: null, stores: null }), (ue.updateQueue = t), (t.stores = [e]))
      : ((n = t.stores), n === null ? (t.stores = [e]) : n.push(e)));
}
function Hp(e, t, n, r) {
  ((t.value = n), (t.getSnapshot = r), Wp(t) && bp(e));
}
function $p(e, t, n) {
  return n(function () {
    Wp(t) && bp(e);
  });
}
function Wp(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !ft(e, n);
  } catch {
    return !0;
  }
}
function bp(e) {
  var t = Lt(e, 1);
  t !== null && ct(t, e, 1, -1);
}
function Ys(e) {
  var t = ht();
  return (
    typeof e == "function" && (e = e()),
    (t.memoizedState = t.baseState = e),
    (e = {
      pending: null,
      interleaved: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: Zr,
      lastRenderedState: e,
    }),
    (t.queue = e),
    (e = e.dispatch = $g.bind(null, ue, e)),
    [t.memoizedState, e]
  );
}
function el(e, t, n, r) {
  return (
    (e = { tag: e, create: t, destroy: n, deps: r, next: null }),
    (t = ue.updateQueue),
    t === null
      ? ((t = { lastEffect: null, stores: null }),
        (ue.updateQueue = t),
        (t.lastEffect = e.next = e))
      : ((n = t.lastEffect),
        n === null
          ? (t.lastEffect = e.next = e)
          : ((r = n.next), (n.next = e), (e.next = r), (t.lastEffect = e))),
    e
  );
}
function Qp() {
  return nt().memoizedState;
}
function Wl(e, t, n, r) {
  var l = ht();
  ((ue.flags |= e), (l.memoizedState = el(1 | t, n, void 0, r === void 0 ? null : r)));
}
function Di(e, t, n, r) {
  var l = nt();
  r = r === void 0 ? null : r;
  var i = void 0;
  if (ye !== null) {
    var o = ye.memoizedState;
    if (((i = o.destroy), r !== null && xa(r, o.deps))) {
      l.memoizedState = el(t, n, i, r);
      return;
    }
  }
  ((ue.flags |= e), (l.memoizedState = el(1 | t, n, i, r)));
}
function Xs(e, t) {
  return Wl(8390656, 8, e, t);
}
function Ca(e, t) {
  return Di(2048, 8, e, t);
}
function Yp(e, t) {
  return Di(4, 2, e, t);
}
function Xp(e, t) {
  return Di(4, 4, e, t);
}
function Kp(e, t) {
  if (typeof t == "function")
    return (
      (e = e()),
      t(e),
      function () {
        t(null);
      }
    );
  if (t != null)
    return (
      (e = e()),
      (t.current = e),
      function () {
        t.current = null;
      }
    );
}
function Gp(e, t, n) {
  return ((n = n != null ? n.concat([e]) : null), Di(4, 4, Kp.bind(null, t, e), n));
}
function Pa() {}
function qp(e, t) {
  var n = nt();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && xa(t, r[1]) ? r[0] : ((n.memoizedState = [e, t]), e);
}
function Jp(e, t) {
  var n = nt();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && xa(t, r[1])
    ? r[0]
    : ((e = e()), (n.memoizedState = [e, t]), e);
}
function Zp(e, t, n) {
  return vn & 21
    ? (ft(n, t) || ((n = lp()), (ue.lanes |= n), (kn |= n), (e.baseState = !0)), t)
    : (e.baseState && ((e.baseState = !1), (Me = !0)), (e.memoizedState = n));
}
function Vg(e, t) {
  var n = K;
  ((K = n !== 0 && 4 > n ? n : 4), e(!0));
  var r = go.transition;
  go.transition = {};
  try {
    (e(!1), t());
  } finally {
    ((K = n), (go.transition = r));
  }
}
function ed() {
  return nt().memoizedState;
}
function Hg(e, t, n) {
  var r = Gt(e);
  if (((n = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null }), td(e)))
    nd(t, n);
  else if (((n = Ap(e, t, n, r)), n !== null)) {
    var l = ze();
    (ct(n, e, r, l), rd(n, t, r));
  }
}
function $g(e, t, n) {
  var r = Gt(e),
    l = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null };
  if (td(e)) nd(t, l);
  else {
    var i = e.alternate;
    if (e.lanes === 0 && (i === null || i.lanes === 0) && ((i = t.lastRenderedReducer), i !== null))
      try {
        var o = t.lastRenderedState,
          u = i(o, n);
        if (((l.hasEagerState = !0), (l.eagerState = u), ft(u, o))) {
          var a = t.interleaved;
          (a === null ? ((l.next = l), ga(t)) : ((l.next = a.next), (a.next = l)),
            (t.interleaved = l));
          return;
        }
      } catch {
      } finally {
      }
    ((n = Ap(e, t, l, r)), n !== null && ((l = ze()), ct(n, e, r, l), rd(n, t, r)));
  }
}
function td(e) {
  var t = e.alternate;
  return e === ue || (t !== null && t === ue);
}
function nd(e, t) {
  Rr = yi = !0;
  var n = e.pending;
  (n === null ? (t.next = t) : ((t.next = n.next), (n.next = t)), (e.pending = t));
}
function rd(e, t, n) {
  if (n & 4194240) {
    var r = t.lanes;
    ((r &= e.pendingLanes), (n |= r), (t.lanes = n), na(e, n));
  }
}
var vi = {
    readContext: tt,
    useCallback: Ce,
    useContext: Ce,
    useEffect: Ce,
    useImperativeHandle: Ce,
    useInsertionEffect: Ce,
    useLayoutEffect: Ce,
    useMemo: Ce,
    useReducer: Ce,
    useRef: Ce,
    useState: Ce,
    useDebugValue: Ce,
    useDeferredValue: Ce,
    useTransition: Ce,
    useMutableSource: Ce,
    useSyncExternalStore: Ce,
    useId: Ce,
    unstable_isNewReconciler: !1,
  },
  Wg = {
    readContext: tt,
    useCallback: function (e, t) {
      return ((ht().memoizedState = [e, t === void 0 ? null : t]), e);
    },
    useContext: tt,
    useEffect: Xs,
    useImperativeHandle: function (e, t, n) {
      return ((n = n != null ? n.concat([e]) : null), Wl(4194308, 4, Kp.bind(null, t, e), n));
    },
    useLayoutEffect: function (e, t) {
      return Wl(4194308, 4, e, t);
    },
    useInsertionEffect: function (e, t) {
      return Wl(4, 2, e, t);
    },
    useMemo: function (e, t) {
      var n = ht();
      return ((t = t === void 0 ? null : t), (e = e()), (n.memoizedState = [e, t]), e);
    },
    useReducer: function (e, t, n) {
      var r = ht();
      return (
        (t = n !== void 0 ? n(t) : t),
        (r.memoizedState = r.baseState = t),
        (e = {
          pending: null,
          interleaved: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: e,
          lastRenderedState: t,
        }),
        (r.queue = e),
        (e = e.dispatch = Hg.bind(null, ue, e)),
        [r.memoizedState, e]
      );
    },
    useRef: function (e) {
      var t = ht();
      return ((e = { current: e }), (t.memoizedState = e));
    },
    useState: Ys,
    useDebugValue: Pa,
    useDeferredValue: function (e) {
      return (ht().memoizedState = e);
    },
    useTransition: function () {
      var e = Ys(!1),
        t = e[0];
      return ((e = Vg.bind(null, e[1])), (ht().memoizedState = e), [t, e]);
    },
    useMutableSource: function () {},
    useSyncExternalStore: function (e, t, n) {
      var r = ue,
        l = ht();
      if (le) {
        if (n === void 0) throw Error(I(407));
        n = n();
      } else {
        if (((n = t()), we === null)) throw Error(I(349));
        vn & 30 || Vp(r, t, n);
      }
      l.memoizedState = n;
      var i = { value: n, getSnapshot: t };
      return (
        (l.queue = i),
        Xs($p.bind(null, r, i, e), [e]),
        (r.flags |= 2048),
        el(9, Hp.bind(null, r, i, n, t), void 0, null),
        n
      );
    },
    useId: function () {
      var e = ht(),
        t = we.identifierPrefix;
      if (le) {
        var n = Tt,
          r = _t;
        ((n = (r & ~(1 << (32 - st(r) - 1))).toString(32) + n),
          (t = ":" + t + "R" + n),
          (n = Jr++),
          0 < n && (t += "H" + n.toString(32)),
          (t += ":"));
      } else ((n = Ug++), (t = ":" + t + "r" + n.toString(32) + ":"));
      return (e.memoizedState = t);
    },
    unstable_isNewReconciler: !1,
  },
  bg = {
    readContext: tt,
    useCallback: qp,
    useContext: tt,
    useEffect: Ca,
    useImperativeHandle: Gp,
    useInsertionEffect: Yp,
    useLayoutEffect: Xp,
    useMemo: Jp,
    useReducer: yo,
    useRef: Qp,
    useState: function () {
      return yo(Zr);
    },
    useDebugValue: Pa,
    useDeferredValue: function (e) {
      var t = nt();
      return Zp(t, ye.memoizedState, e);
    },
    useTransition: function () {
      var e = yo(Zr)[0],
        t = nt().memoizedState;
      return [e, t];
    },
    useMutableSource: jp,
    useSyncExternalStore: Up,
    useId: ed,
    unstable_isNewReconciler: !1,
  },
  Qg = {
    readContext: tt,
    useCallback: qp,
    useContext: tt,
    useEffect: Ca,
    useImperativeHandle: Gp,
    useInsertionEffect: Yp,
    useLayoutEffect: Xp,
    useMemo: Jp,
    useReducer: vo,
    useRef: Qp,
    useState: function () {
      return vo(Zr);
    },
    useDebugValue: Pa,
    useDeferredValue: function (e) {
      var t = nt();
      return ye === null ? (t.memoizedState = e) : Zp(t, ye.memoizedState, e);
    },
    useTransition: function () {
      var e = vo(Zr)[0],
        t = nt().memoizedState;
      return [e, t];
    },
    useMutableSource: jp,
    useSyncExternalStore: Up,
    useId: ed,
    unstable_isNewReconciler: !1,
  };
function ot(e, t) {
  if (e && e.defaultProps) {
    ((t = ae({}, t)), (e = e.defaultProps));
    for (var n in e) t[n] === void 0 && (t[n] = e[n]);
    return t;
  }
  return t;
}
function hu(e, t, n, r) {
  ((t = e.memoizedState),
    (n = n(r, t)),
    (n = n == null ? t : ae({}, t, n)),
    (e.memoizedState = n),
    e.lanes === 0 && (e.updateQueue.baseState = n));
}
var Mi = {
  isMounted: function (e) {
    return (e = e._reactInternals) ? Sn(e) === e : !1;
  },
  enqueueSetState: function (e, t, n) {
    e = e._reactInternals;
    var r = ze(),
      l = Gt(e),
      i = It(r, l);
    ((i.payload = t),
      n != null && (i.callback = n),
      (t = Xt(e, i, l)),
      t !== null && (ct(t, e, l, r), Hl(t, e, l)));
  },
  enqueueReplaceState: function (e, t, n) {
    e = e._reactInternals;
    var r = ze(),
      l = Gt(e),
      i = It(r, l);
    ((i.tag = 1),
      (i.payload = t),
      n != null && (i.callback = n),
      (t = Xt(e, i, l)),
      t !== null && (ct(t, e, l, r), Hl(t, e, l)));
  },
  enqueueForceUpdate: function (e, t) {
    e = e._reactInternals;
    var n = ze(),
      r = Gt(e),
      l = It(n, r);
    ((l.tag = 2),
      t != null && (l.callback = t),
      (t = Xt(e, l, r)),
      t !== null && (ct(t, e, r, n), Hl(t, e, r)));
  },
};
function Ks(e, t, n, r, l, i, o) {
  return (
    (e = e.stateNode),
    typeof e.shouldComponentUpdate == "function"
      ? e.shouldComponentUpdate(r, i, o)
      : t.prototype && t.prototype.isPureReactComponent
        ? !Qr(n, r) || !Qr(l, i)
        : !0
  );
}
function ld(e, t, n) {
  var r = !1,
    l = Zt,
    i = t.contextType;
  return (
    typeof i == "object" && i !== null
      ? (i = tt(i))
      : ((l = Fe(t) ? gn : Te.current),
        (r = t.contextTypes),
        (i = (r = r != null) ? Zn(e, l) : Zt)),
    (t = new t(n, i)),
    (e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null),
    (t.updater = Mi),
    (e.stateNode = t),
    (t._reactInternals = e),
    r &&
      ((e = e.stateNode),
      (e.__reactInternalMemoizedUnmaskedChildContext = l),
      (e.__reactInternalMemoizedMaskedChildContext = i)),
    t
  );
}
function Gs(e, t, n, r) {
  ((e = t.state),
    typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r),
    typeof t.UNSAFE_componentWillReceiveProps == "function" &&
      t.UNSAFE_componentWillReceiveProps(n, r),
    t.state !== e && Mi.enqueueReplaceState(t, t.state, null));
}
function mu(e, t, n, r) {
  var l = e.stateNode;
  ((l.props = n), (l.state = e.memoizedState), (l.refs = {}), ya(e));
  var i = t.contextType;
  (typeof i == "object" && i !== null
    ? (l.context = tt(i))
    : ((i = Fe(t) ? gn : Te.current), (l.context = Zn(e, i))),
    (l.state = e.memoizedState),
    (i = t.getDerivedStateFromProps),
    typeof i == "function" && (hu(e, t, i, n), (l.state = e.memoizedState)),
    typeof t.getDerivedStateFromProps == "function" ||
      typeof l.getSnapshotBeforeUpdate == "function" ||
      (typeof l.UNSAFE_componentWillMount != "function" &&
        typeof l.componentWillMount != "function") ||
      ((t = l.state),
      typeof l.componentWillMount == "function" && l.componentWillMount(),
      typeof l.UNSAFE_componentWillMount == "function" && l.UNSAFE_componentWillMount(),
      t !== l.state && Mi.enqueueReplaceState(l, l.state, null),
      mi(e, n, l, r),
      (l.state = e.memoizedState)),
    typeof l.componentDidMount == "function" && (e.flags |= 4194308));
}
function rr(e, t) {
  try {
    var n = "",
      r = t;
    do ((n += wm(r)), (r = r.return));
    while (r);
    var l = n;
  } catch (i) {
    l =
      `
Error generating stack: ` +
      i.message +
      `
` +
      i.stack;
  }
  return { value: e, source: t, stack: l, digest: null };
}
function ko(e, t, n) {
  return { value: e, source: null, stack: n ?? null, digest: t ?? null };
}
function gu(e, t) {
  try {
  } catch (n) {
    setTimeout(function () {
      throw n;
    });
  }
}
var Yg = typeof WeakMap == "function" ? WeakMap : Map;
function id(e, t, n) {
  ((n = It(-1, n)), (n.tag = 3), (n.payload = { element: null }));
  var r = t.value;
  return (
    (n.callback = function () {
      (wi || ((wi = !0), (_u = r)), gu(e, t));
    }),
    n
  );
}
function od(e, t, n) {
  ((n = It(-1, n)), (n.tag = 3));
  var r = e.type.getDerivedStateFromError;
  if (typeof r == "function") {
    var l = t.value;
    ((n.payload = function () {
      return r(l);
    }),
      (n.callback = function () {
        gu(e, t);
      }));
  }
  var i = e.stateNode;
  return (
    i !== null &&
      typeof i.componentDidCatch == "function" &&
      (n.callback = function () {
        (gu(e, t), typeof r != "function" && (Kt === null ? (Kt = new Set([this])) : Kt.add(this)));
        var o = t.stack;
        this.componentDidCatch(t.value, { componentStack: o !== null ? o : "" });
      }),
    n
  );
}
function qs(e, t, n) {
  var r = e.pingCache;
  if (r === null) {
    r = e.pingCache = new Yg();
    var l = new Set();
    r.set(t, l);
  } else ((l = r.get(t)), l === void 0 && ((l = new Set()), r.set(t, l)));
  l.has(n) || (l.add(n), (e = uy.bind(null, e, t, n)), t.then(e, e));
}
function Js(e) {
  do {
    var t;
    if (
      ((t = e.tag === 13) && ((t = e.memoizedState), (t = t !== null ? t.dehydrated !== null : !0)),
      t)
    )
      return e;
    e = e.return;
  } while (e !== null);
  return null;
}
function Zs(e, t, n, r, l) {
  return e.mode & 1
    ? ((e.flags |= 65536), (e.lanes = l), e)
    : (e === t
        ? (e.flags |= 65536)
        : ((e.flags |= 128),
          (n.flags |= 131072),
          (n.flags &= -52805),
          n.tag === 1 &&
            (n.alternate === null ? (n.tag = 17) : ((t = It(-1, 1)), (t.tag = 2), Xt(n, t, 1))),
          (n.lanes |= 1)),
      e);
}
var Xg = Ot.ReactCurrentOwner,
  Me = !1;
function Ne(e, t, n, r) {
  t.child = e === null ? Mp(t, null, n, r) : tr(t, e.child, n, r);
}
function ec(e, t, n, r, l) {
  n = n.render;
  var i = t.ref;
  return (
    Yn(t, l),
    (r = Sa(e, t, n, r, i, l)),
    (n = Ea()),
    e !== null && !Me
      ? ((t.updateQueue = e.updateQueue), (t.flags &= -2053), (e.lanes &= ~l), Rt(e, t, l))
      : (le && n && ca(t), (t.flags |= 1), Ne(e, t, r, l), t.child)
  );
}
function tc(e, t, n, r, l) {
  if (e === null) {
    var i = n.type;
    return typeof i == "function" &&
      !Oa(i) &&
      i.defaultProps === void 0 &&
      n.compare === null &&
      n.defaultProps === void 0
      ? ((t.tag = 15), (t.type = i), ud(e, t, i, r, l))
      : ((e = Xl(n.type, null, r, t, t.mode, l)), (e.ref = t.ref), (e.return = t), (t.child = e));
  }
  if (((i = e.child), !(e.lanes & l))) {
    var o = i.memoizedProps;
    if (((n = n.compare), (n = n !== null ? n : Qr), n(o, r) && e.ref === t.ref))
      return Rt(e, t, l);
  }
  return ((t.flags |= 1), (e = qt(i, r)), (e.ref = t.ref), (e.return = t), (t.child = e));
}
function ud(e, t, n, r, l) {
  if (e !== null) {
    var i = e.memoizedProps;
    if (Qr(i, r) && e.ref === t.ref)
      if (((Me = !1), (t.pendingProps = r = i), (e.lanes & l) !== 0)) e.flags & 131072 && (Me = !0);
      else return ((t.lanes = e.lanes), Rt(e, t, l));
  }
  return yu(e, t, n, r, l);
}
function ad(e, t, n) {
  var r = t.pendingProps,
    l = r.children,
    i = e !== null ? e.memoizedState : null;
  if (r.mode === "hidden")
    if (!(t.mode & 1))
      ((t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }),
        Z(Hn, $e),
        ($e |= n));
    else {
      if (!(n & 1073741824))
        return (
          (e = i !== null ? i.baseLanes | n : n),
          (t.lanes = t.childLanes = 1073741824),
          (t.memoizedState = { baseLanes: e, cachePool: null, transitions: null }),
          (t.updateQueue = null),
          Z(Hn, $e),
          ($e |= e),
          null
        );
      ((t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }),
        (r = i !== null ? i.baseLanes : n),
        Z(Hn, $e),
        ($e |= r));
    }
  else
    (i !== null ? ((r = i.baseLanes | n), (t.memoizedState = null)) : (r = n),
      Z(Hn, $e),
      ($e |= r));
  return (Ne(e, t, l, n), t.child);
}
function sd(e, t) {
  var n = t.ref;
  ((e === null && n !== null) || (e !== null && e.ref !== n)) &&
    ((t.flags |= 512), (t.flags |= 2097152));
}
function yu(e, t, n, r, l) {
  var i = Fe(n) ? gn : Te.current;
  return (
    (i = Zn(t, i)),
    Yn(t, l),
    (n = Sa(e, t, n, r, i, l)),
    (r = Ea()),
    e !== null && !Me
      ? ((t.updateQueue = e.updateQueue), (t.flags &= -2053), (e.lanes &= ~l), Rt(e, t, l))
      : (le && r && ca(t), (t.flags |= 1), Ne(e, t, n, l), t.child)
  );
}
function nc(e, t, n, r, l) {
  if (Fe(n)) {
    var i = !0;
    ci(t);
  } else i = !1;
  if ((Yn(t, l), t.stateNode === null)) (bl(e, t), ld(t, n, r), mu(t, n, r, l), (r = !0));
  else if (e === null) {
    var o = t.stateNode,
      u = t.memoizedProps;
    o.props = u;
    var a = o.context,
      s = n.contextType;
    typeof s == "object" && s !== null
      ? (s = tt(s))
      : ((s = Fe(n) ? gn : Te.current), (s = Zn(t, s)));
    var c = n.getDerivedStateFromProps,
      f = typeof c == "function" || typeof o.getSnapshotBeforeUpdate == "function";
    (f ||
      (typeof o.UNSAFE_componentWillReceiveProps != "function" &&
        typeof o.componentWillReceiveProps != "function") ||
      ((u !== r || a !== s) && Gs(t, o, r, s)),
      (Bt = !1));
    var d = t.memoizedState;
    ((o.state = d),
      mi(t, r, o, l),
      (a = t.memoizedState),
      u !== r || d !== a || Ae.current || Bt
        ? (typeof c == "function" && (hu(t, n, c, r), (a = t.memoizedState)),
          (u = Bt || Ks(t, n, u, r, d, a, s))
            ? (f ||
                (typeof o.UNSAFE_componentWillMount != "function" &&
                  typeof o.componentWillMount != "function") ||
                (typeof o.componentWillMount == "function" && o.componentWillMount(),
                typeof o.UNSAFE_componentWillMount == "function" && o.UNSAFE_componentWillMount()),
              typeof o.componentDidMount == "function" && (t.flags |= 4194308))
            : (typeof o.componentDidMount == "function" && (t.flags |= 4194308),
              (t.memoizedProps = r),
              (t.memoizedState = a)),
          (o.props = r),
          (o.state = a),
          (o.context = s),
          (r = u))
        : (typeof o.componentDidMount == "function" && (t.flags |= 4194308), (r = !1)));
  } else {
    ((o = t.stateNode),
      Fp(e, t),
      (u = t.memoizedProps),
      (s = t.type === t.elementType ? u : ot(t.type, u)),
      (o.props = s),
      (f = t.pendingProps),
      (d = o.context),
      (a = n.contextType),
      typeof a == "object" && a !== null
        ? (a = tt(a))
        : ((a = Fe(n) ? gn : Te.current), (a = Zn(t, a))));
    var p = n.getDerivedStateFromProps;
    ((c = typeof p == "function" || typeof o.getSnapshotBeforeUpdate == "function") ||
      (typeof o.UNSAFE_componentWillReceiveProps != "function" &&
        typeof o.componentWillReceiveProps != "function") ||
      ((u !== f || d !== a) && Gs(t, o, r, a)),
      (Bt = !1),
      (d = t.memoizedState),
      (o.state = d),
      mi(t, r, o, l));
    var w = t.memoizedState;
    u !== f || d !== w || Ae.current || Bt
      ? (typeof p == "function" && (hu(t, n, p, r), (w = t.memoizedState)),
        (s = Bt || Ks(t, n, s, r, d, w, a) || !1)
          ? (c ||
              (typeof o.UNSAFE_componentWillUpdate != "function" &&
                typeof o.componentWillUpdate != "function") ||
              (typeof o.componentWillUpdate == "function" && o.componentWillUpdate(r, w, a),
              typeof o.UNSAFE_componentWillUpdate == "function" &&
                o.UNSAFE_componentWillUpdate(r, w, a)),
            typeof o.componentDidUpdate == "function" && (t.flags |= 4),
            typeof o.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024))
          : (typeof o.componentDidUpdate != "function" ||
              (u === e.memoizedProps && d === e.memoizedState) ||
              (t.flags |= 4),
            typeof o.getSnapshotBeforeUpdate != "function" ||
              (u === e.memoizedProps && d === e.memoizedState) ||
              (t.flags |= 1024),
            (t.memoizedProps = r),
            (t.memoizedState = w)),
        (o.props = r),
        (o.state = w),
        (o.context = a),
        (r = s))
      : (typeof o.componentDidUpdate != "function" ||
          (u === e.memoizedProps && d === e.memoizedState) ||
          (t.flags |= 4),
        typeof o.getSnapshotBeforeUpdate != "function" ||
          (u === e.memoizedProps && d === e.memoizedState) ||
          (t.flags |= 1024),
        (r = !1));
  }
  return vu(e, t, n, r, i, l);
}
function vu(e, t, n, r, l, i) {
  sd(e, t);
  var o = (t.flags & 128) !== 0;
  if (!r && !o) return (l && Vs(t, n, !1), Rt(e, t, i));
  ((r = t.stateNode), (Xg.current = t));
  var u = o && typeof n.getDerivedStateFromError != "function" ? null : r.render();
  return (
    (t.flags |= 1),
    e !== null && o
      ? ((t.child = tr(t, e.child, null, i)), (t.child = tr(t, null, u, i)))
      : Ne(e, t, u, i),
    (t.memoizedState = r.state),
    l && Vs(t, n, !0),
    t.child
  );
}
function cd(e) {
  var t = e.stateNode;
  (t.pendingContext
    ? Us(e, t.pendingContext, t.pendingContext !== t.context)
    : t.context && Us(e, t.context, !1),
    va(e, t.containerInfo));
}
function rc(e, t, n, r, l) {
  return (er(), pa(l), (t.flags |= 256), Ne(e, t, n, r), t.child);
}
var ku = { dehydrated: null, treeContext: null, retryLane: 0 };
function wu(e) {
  return { baseLanes: e, cachePool: null, transitions: null };
}
function fd(e, t, n) {
  var r = t.pendingProps,
    l = oe.current,
    i = !1,
    o = (t.flags & 128) !== 0,
    u;
  if (
    ((u = o) || (u = e !== null && e.memoizedState === null ? !1 : (l & 2) !== 0),
    u ? ((i = !0), (t.flags &= -129)) : (e === null || e.memoizedState !== null) && (l |= 1),
    Z(oe, l & 1),
    e === null)
  )
    return (
      pu(t),
      (e = t.memoizedState),
      e !== null && ((e = e.dehydrated), e !== null)
        ? (t.mode & 1 ? (e.data === "$!" ? (t.lanes = 8) : (t.lanes = 1073741824)) : (t.lanes = 1),
          null)
        : ((o = r.children),
          (e = r.fallback),
          i
            ? ((r = t.mode),
              (i = t.child),
              (o = { mode: "hidden", children: o }),
              !(r & 1) && i !== null
                ? ((i.childLanes = 0), (i.pendingProps = o))
                : (i = Bi(o, r, 0, null)),
              (e = hn(e, r, n, null)),
              (i.return = t),
              (e.return = t),
              (i.sibling = e),
              (t.child = i),
              (t.child.memoizedState = wu(n)),
              (t.memoizedState = ku),
              e)
            : _a(t, o))
    );
  if (((l = e.memoizedState), l !== null && ((u = l.dehydrated), u !== null)))
    return Kg(e, t, o, r, u, l, n);
  if (i) {
    ((i = r.fallback), (o = t.mode), (l = e.child), (u = l.sibling));
    var a = { mode: "hidden", children: r.children };
    return (
      !(o & 1) && t.child !== l
        ? ((r = t.child), (r.childLanes = 0), (r.pendingProps = a), (t.deletions = null))
        : ((r = qt(l, a)), (r.subtreeFlags = l.subtreeFlags & 14680064)),
      u !== null ? (i = qt(u, i)) : ((i = hn(i, o, n, null)), (i.flags |= 2)),
      (i.return = t),
      (r.return = t),
      (r.sibling = i),
      (t.child = r),
      (r = i),
      (i = t.child),
      (o = e.child.memoizedState),
      (o =
        o === null
          ? wu(n)
          : { baseLanes: o.baseLanes | n, cachePool: null, transitions: o.transitions }),
      (i.memoizedState = o),
      (i.childLanes = e.childLanes & ~n),
      (t.memoizedState = ku),
      r
    );
  }
  return (
    (i = e.child),
    (e = i.sibling),
    (r = qt(i, { mode: "visible", children: r.children })),
    !(t.mode & 1) && (r.lanes = n),
    (r.return = t),
    (r.sibling = null),
    e !== null &&
      ((n = t.deletions), n === null ? ((t.deletions = [e]), (t.flags |= 16)) : n.push(e)),
    (t.child = r),
    (t.memoizedState = null),
    r
  );
}
function _a(e, t) {
  return (
    (t = Bi({ mode: "visible", children: t }, e.mode, 0, null)),
    (t.return = e),
    (e.child = t)
  );
}
function Il(e, t, n, r) {
  return (
    r !== null && pa(r),
    tr(t, e.child, null, n),
    (e = _a(t, t.pendingProps.children)),
    (e.flags |= 2),
    (t.memoizedState = null),
    e
  );
}
function Kg(e, t, n, r, l, i, o) {
  if (n)
    return t.flags & 256
      ? ((t.flags &= -257), (r = ko(Error(I(422)))), Il(e, t, o, r))
      : t.memoizedState !== null
        ? ((t.child = e.child), (t.flags |= 128), null)
        : ((i = r.fallback),
          (l = t.mode),
          (r = Bi({ mode: "visible", children: r.children }, l, 0, null)),
          (i = hn(i, l, o, null)),
          (i.flags |= 2),
          (r.return = t),
          (i.return = t),
          (r.sibling = i),
          (t.child = r),
          t.mode & 1 && tr(t, e.child, null, o),
          (t.child.memoizedState = wu(o)),
          (t.memoizedState = ku),
          i);
  if (!(t.mode & 1)) return Il(e, t, o, null);
  if (l.data === "$!") {
    if (((r = l.nextSibling && l.nextSibling.dataset), r)) var u = r.dgst;
    return ((r = u), (i = Error(I(419))), (r = ko(i, r, void 0)), Il(e, t, o, r));
  }
  if (((u = (o & e.childLanes) !== 0), Me || u)) {
    if (((r = we), r !== null)) {
      switch (o & -o) {
        case 4:
          l = 2;
          break;
        case 16:
          l = 8;
          break;
        case 64:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
        case 67108864:
          l = 32;
          break;
        case 536870912:
          l = 268435456;
          break;
        default:
          l = 0;
      }
      ((l = l & (r.suspendedLanes | o) ? 0 : l),
        l !== 0 && l !== i.retryLane && ((i.retryLane = l), Lt(e, l), ct(r, e, l, -1)));
    }
    return (Ra(), (r = ko(Error(I(421)))), Il(e, t, o, r));
  }
  return l.data === "$?"
    ? ((t.flags |= 128), (t.child = e.child), (t = ay.bind(null, e)), (l._reactRetry = t), null)
    : ((e = i.treeContext),
      (We = Yt(l.nextSibling)),
      (Qe = t),
      (le = !0),
      (at = null),
      e !== null &&
        ((Ge[qe++] = _t),
        (Ge[qe++] = Tt),
        (Ge[qe++] = yn),
        (_t = e.id),
        (Tt = e.overflow),
        (yn = t)),
      (t = _a(t, r.children)),
      (t.flags |= 4096),
      t);
}
function lc(e, t, n) {
  e.lanes |= t;
  var r = e.alternate;
  (r !== null && (r.lanes |= t), du(e.return, t, n));
}
function wo(e, t, n, r, l) {
  var i = e.memoizedState;
  i === null
    ? (e.memoizedState = {
        isBackwards: t,
        rendering: null,
        renderingStartTime: 0,
        last: r,
        tail: n,
        tailMode: l,
      })
    : ((i.isBackwards = t),
      (i.rendering = null),
      (i.renderingStartTime = 0),
      (i.last = r),
      (i.tail = n),
      (i.tailMode = l));
}
function pd(e, t, n) {
  var r = t.pendingProps,
    l = r.revealOrder,
    i = r.tail;
  if ((Ne(e, t, r.children, n), (r = oe.current), r & 2)) ((r = (r & 1) | 2), (t.flags |= 128));
  else {
    if (e !== null && e.flags & 128)
      e: for (e = t.child; e !== null; ) {
        if (e.tag === 13) e.memoizedState !== null && lc(e, n, t);
        else if (e.tag === 19) lc(e, n, t);
        else if (e.child !== null) {
          ((e.child.return = e), (e = e.child));
          continue;
        }
        if (e === t) break e;
        for (; e.sibling === null; ) {
          if (e.return === null || e.return === t) break e;
          e = e.return;
        }
        ((e.sibling.return = e.return), (e = e.sibling));
      }
    r &= 1;
  }
  if ((Z(oe, r), !(t.mode & 1))) t.memoizedState = null;
  else
    switch (l) {
      case "forwards":
        for (n = t.child, l = null; n !== null; )
          ((e = n.alternate), e !== null && gi(e) === null && (l = n), (n = n.sibling));
        ((n = l),
          n === null ? ((l = t.child), (t.child = null)) : ((l = n.sibling), (n.sibling = null)),
          wo(t, !1, l, n, i));
        break;
      case "backwards":
        for (n = null, l = t.child, t.child = null; l !== null; ) {
          if (((e = l.alternate), e !== null && gi(e) === null)) {
            t.child = l;
            break;
          }
          ((e = l.sibling), (l.sibling = n), (n = l), (l = e));
        }
        wo(t, !0, n, null, i);
        break;
      case "together":
        wo(t, !1, null, null, void 0);
        break;
      default:
        t.memoizedState = null;
    }
  return t.child;
}
function bl(e, t) {
  !(t.mode & 1) && e !== null && ((e.alternate = null), (t.alternate = null), (t.flags |= 2));
}
function Rt(e, t, n) {
  if ((e !== null && (t.dependencies = e.dependencies), (kn |= t.lanes), !(n & t.childLanes)))
    return null;
  if (e !== null && t.child !== e.child) throw Error(I(153));
  if (t.child !== null) {
    for (e = t.child, n = qt(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null; )
      ((e = e.sibling), (n = n.sibling = qt(e, e.pendingProps)), (n.return = t));
    n.sibling = null;
  }
  return t.child;
}
function Gg(e, t, n) {
  switch (t.tag) {
    case 3:
      (cd(t), er());
      break;
    case 5:
      Bp(t);
      break;
    case 1:
      Fe(t.type) && ci(t);
      break;
    case 4:
      va(t, t.stateNode.containerInfo);
      break;
    case 10:
      var r = t.type._context,
        l = t.memoizedProps.value;
      (Z(di, r._currentValue), (r._currentValue = l));
      break;
    case 13:
      if (((r = t.memoizedState), r !== null))
        return r.dehydrated !== null
          ? (Z(oe, oe.current & 1), (t.flags |= 128), null)
          : n & t.child.childLanes
            ? fd(e, t, n)
            : (Z(oe, oe.current & 1), (e = Rt(e, t, n)), e !== null ? e.sibling : null);
      Z(oe, oe.current & 1);
      break;
    case 19:
      if (((r = (n & t.childLanes) !== 0), e.flags & 128)) {
        if (r) return pd(e, t, n);
        t.flags |= 128;
      }
      if (
        ((l = t.memoizedState),
        l !== null && ((l.rendering = null), (l.tail = null), (l.lastEffect = null)),
        Z(oe, oe.current),
        r)
      )
        break;
      return null;
    case 22:
    case 23:
      return ((t.lanes = 0), ad(e, t, n));
  }
  return Rt(e, t, n);
}
var dd, xu, hd, md;
dd = function (e, t) {
  for (var n = t.child; n !== null; ) {
    if (n.tag === 5 || n.tag === 6) e.appendChild(n.stateNode);
    else if (n.tag !== 4 && n.child !== null) {
      ((n.child.return = n), (n = n.child));
      continue;
    }
    if (n === t) break;
    for (; n.sibling === null; ) {
      if (n.return === null || n.return === t) return;
      n = n.return;
    }
    ((n.sibling.return = n.return), (n = n.sibling));
  }
};
xu = function () {};
hd = function (e, t, n, r) {
  var l = e.memoizedProps;
  if (l !== r) {
    ((e = t.stateNode), pn(wt.current));
    var i = null;
    switch (n) {
      case "input":
        ((l = $o(e, l)), (r = $o(e, r)), (i = []));
        break;
      case "select":
        ((l = ae({}, l, { value: void 0 })), (r = ae({}, r, { value: void 0 })), (i = []));
        break;
      case "textarea":
        ((l = Qo(e, l)), (r = Qo(e, r)), (i = []));
        break;
      default:
        typeof l.onClick != "function" && typeof r.onClick == "function" && (e.onclick = ai);
    }
    Xo(n, r);
    var o;
    n = null;
    for (s in l)
      if (!r.hasOwnProperty(s) && l.hasOwnProperty(s) && l[s] != null)
        if (s === "style") {
          var u = l[s];
          for (o in u) u.hasOwnProperty(o) && (n || (n = {}), (n[o] = ""));
        } else
          s !== "dangerouslySetInnerHTML" &&
            s !== "children" &&
            s !== "suppressContentEditableWarning" &&
            s !== "suppressHydrationWarning" &&
            s !== "autoFocus" &&
            (jr.hasOwnProperty(s) ? i || (i = []) : (i = i || []).push(s, null));
    for (s in r) {
      var a = r[s];
      if (
        ((u = l != null ? l[s] : void 0),
        r.hasOwnProperty(s) && a !== u && (a != null || u != null))
      )
        if (s === "style")
          if (u) {
            for (o in u)
              !u.hasOwnProperty(o) || (a && a.hasOwnProperty(o)) || (n || (n = {}), (n[o] = ""));
            for (o in a) a.hasOwnProperty(o) && u[o] !== a[o] && (n || (n = {}), (n[o] = a[o]));
          } else (n || (i || (i = []), i.push(s, n)), (n = a));
        else
          s === "dangerouslySetInnerHTML"
            ? ((a = a ? a.__html : void 0),
              (u = u ? u.__html : void 0),
              a != null && u !== a && (i = i || []).push(s, a))
            : s === "children"
              ? (typeof a != "string" && typeof a != "number") || (i = i || []).push(s, "" + a)
              : s !== "suppressContentEditableWarning" &&
                s !== "suppressHydrationWarning" &&
                (jr.hasOwnProperty(s)
                  ? (a != null && s === "onScroll" && ne("scroll", e), i || u === a || (i = []))
                  : (i = i || []).push(s, a));
    }
    n && (i = i || []).push("style", n);
    var s = i;
    (t.updateQueue = s) && (t.flags |= 4);
  }
};
md = function (e, t, n, r) {
  n !== r && (t.flags |= 4);
};
function kr(e, t) {
  if (!le)
    switch (e.tailMode) {
      case "hidden":
        t = e.tail;
        for (var n = null; t !== null; ) (t.alternate !== null && (n = t), (t = t.sibling));
        n === null ? (e.tail = null) : (n.sibling = null);
        break;
      case "collapsed":
        n = e.tail;
        for (var r = null; n !== null; ) (n.alternate !== null && (r = n), (n = n.sibling));
        r === null
          ? t || e.tail === null
            ? (e.tail = null)
            : (e.tail.sibling = null)
          : (r.sibling = null);
    }
}
function Pe(e) {
  var t = e.alternate !== null && e.alternate.child === e.child,
    n = 0,
    r = 0;
  if (t)
    for (var l = e.child; l !== null; )
      ((n |= l.lanes | l.childLanes),
        (r |= l.subtreeFlags & 14680064),
        (r |= l.flags & 14680064),
        (l.return = e),
        (l = l.sibling));
  else
    for (l = e.child; l !== null; )
      ((n |= l.lanes | l.childLanes),
        (r |= l.subtreeFlags),
        (r |= l.flags),
        (l.return = e),
        (l = l.sibling));
  return ((e.subtreeFlags |= r), (e.childLanes = n), t);
}
function qg(e, t, n) {
  var r = t.pendingProps;
  switch ((fa(t), t.tag)) {
    case 2:
    case 16:
    case 15:
    case 0:
    case 11:
    case 7:
    case 8:
    case 12:
    case 9:
    case 14:
      return (Pe(t), null);
    case 1:
      return (Fe(t.type) && si(), Pe(t), null);
    case 3:
      return (
        (r = t.stateNode),
        nr(),
        re(Ae),
        re(Te),
        wa(),
        r.pendingContext && ((r.context = r.pendingContext), (r.pendingContext = null)),
        (e === null || e.child === null) &&
          (_l(t)
            ? (t.flags |= 4)
            : e === null ||
              (e.memoizedState.isDehydrated && !(t.flags & 256)) ||
              ((t.flags |= 1024), at !== null && (Nu(at), (at = null)))),
        xu(e, t),
        Pe(t),
        null
      );
    case 5:
      ka(t);
      var l = pn(qr.current);
      if (((n = t.type), e !== null && t.stateNode != null))
        (hd(e, t, n, r, l), e.ref !== t.ref && ((t.flags |= 512), (t.flags |= 2097152)));
      else {
        if (!r) {
          if (t.stateNode === null) throw Error(I(166));
          return (Pe(t), null);
        }
        if (((e = pn(wt.current)), _l(t))) {
          ((r = t.stateNode), (n = t.type));
          var i = t.memoizedProps;
          switch (((r[gt] = t), (r[Kr] = i), (e = (t.mode & 1) !== 0), n)) {
            case "dialog":
              (ne("cancel", r), ne("close", r));
              break;
            case "iframe":
            case "object":
            case "embed":
              ne("load", r);
              break;
            case "video":
            case "audio":
              for (l = 0; l < _r.length; l++) ne(_r[l], r);
              break;
            case "source":
              ne("error", r);
              break;
            case "img":
            case "image":
            case "link":
              (ne("error", r), ne("load", r));
              break;
            case "details":
              ne("toggle", r);
              break;
            case "input":
              (ds(r, i), ne("invalid", r));
              break;
            case "select":
              ((r._wrapperState = { wasMultiple: !!i.multiple }), ne("invalid", r));
              break;
            case "textarea":
              (ms(r, i), ne("invalid", r));
          }
          (Xo(n, i), (l = null));
          for (var o in i)
            if (i.hasOwnProperty(o)) {
              var u = i[o];
              o === "children"
                ? typeof u == "string"
                  ? r.textContent !== u &&
                    (i.suppressHydrationWarning !== !0 && Pl(r.textContent, u, e),
                    (l = ["children", u]))
                  : typeof u == "number" &&
                    r.textContent !== "" + u &&
                    (i.suppressHydrationWarning !== !0 && Pl(r.textContent, u, e),
                    (l = ["children", "" + u]))
                : jr.hasOwnProperty(o) && u != null && o === "onScroll" && ne("scroll", r);
            }
          switch (n) {
            case "input":
              (yl(r), hs(r, i, !0));
              break;
            case "textarea":
              (yl(r), gs(r));
              break;
            case "select":
            case "option":
              break;
            default:
              typeof i.onClick == "function" && (r.onclick = ai);
          }
          ((r = l), (t.updateQueue = r), r !== null && (t.flags |= 4));
        } else {
          ((o = l.nodeType === 9 ? l : l.ownerDocument),
            e === "http://www.w3.org/1999/xhtml" && (e = $f(n)),
            e === "http://www.w3.org/1999/xhtml"
              ? n === "script"
                ? ((e = o.createElement("div")),
                  (e.innerHTML = "<script><\/script>"),
                  (e = e.removeChild(e.firstChild)))
                : typeof r.is == "string"
                  ? (e = o.createElement(n, { is: r.is }))
                  : ((e = o.createElement(n)),
                    n === "select" &&
                      ((o = e), r.multiple ? (o.multiple = !0) : r.size && (o.size = r.size)))
              : (e = o.createElementNS(e, n)),
            (e[gt] = t),
            (e[Kr] = r),
            dd(e, t, !1, !1),
            (t.stateNode = e));
          e: {
            switch (((o = Ko(n, r)), n)) {
              case "dialog":
                (ne("cancel", e), ne("close", e), (l = r));
                break;
              case "iframe":
              case "object":
              case "embed":
                (ne("load", e), (l = r));
                break;
              case "video":
              case "audio":
                for (l = 0; l < _r.length; l++) ne(_r[l], e);
                l = r;
                break;
              case "source":
                (ne("error", e), (l = r));
                break;
              case "img":
              case "image":
              case "link":
                (ne("error", e), ne("load", e), (l = r));
                break;
              case "details":
                (ne("toggle", e), (l = r));
                break;
              case "input":
                (ds(e, r), (l = $o(e, r)), ne("invalid", e));
                break;
              case "option":
                l = r;
                break;
              case "select":
                ((e._wrapperState = { wasMultiple: !!r.multiple }),
                  (l = ae({}, r, { value: void 0 })),
                  ne("invalid", e));
                break;
              case "textarea":
                (ms(e, r), (l = Qo(e, r)), ne("invalid", e));
                break;
              default:
                l = r;
            }
            (Xo(n, l), (u = l));
            for (i in u)
              if (u.hasOwnProperty(i)) {
                var a = u[i];
                i === "style"
                  ? Qf(e, a)
                  : i === "dangerouslySetInnerHTML"
                    ? ((a = a ? a.__html : void 0), a != null && Wf(e, a))
                    : i === "children"
                      ? typeof a == "string"
                        ? (n !== "textarea" || a !== "") && Ur(e, a)
                        : typeof a == "number" && Ur(e, "" + a)
                      : i !== "suppressContentEditableWarning" &&
                        i !== "suppressHydrationWarning" &&
                        i !== "autoFocus" &&
                        (jr.hasOwnProperty(i)
                          ? a != null && i === "onScroll" && ne("scroll", e)
                          : a != null && Gu(e, i, a, o));
              }
            switch (n) {
              case "input":
                (yl(e), hs(e, r, !1));
                break;
              case "textarea":
                (yl(e), gs(e));
                break;
              case "option":
                r.value != null && e.setAttribute("value", "" + Jt(r.value));
                break;
              case "select":
                ((e.multiple = !!r.multiple),
                  (i = r.value),
                  i != null
                    ? $n(e, !!r.multiple, i, !1)
                    : r.defaultValue != null && $n(e, !!r.multiple, r.defaultValue, !0));
                break;
              default:
                typeof l.onClick == "function" && (e.onclick = ai);
            }
            switch (n) {
              case "button":
              case "input":
              case "select":
              case "textarea":
                r = !!r.autoFocus;
                break e;
              case "img":
                r = !0;
                break e;
              default:
                r = !1;
            }
          }
          r && (t.flags |= 4);
        }
        t.ref !== null && ((t.flags |= 512), (t.flags |= 2097152));
      }
      return (Pe(t), null);
    case 6:
      if (e && t.stateNode != null) md(e, t, e.memoizedProps, r);
      else {
        if (typeof r != "string" && t.stateNode === null) throw Error(I(166));
        if (((n = pn(qr.current)), pn(wt.current), _l(t))) {
          if (
            ((r = t.stateNode),
            (n = t.memoizedProps),
            (r[gt] = t),
            (i = r.nodeValue !== n) && ((e = Qe), e !== null))
          )
            switch (e.tag) {
              case 3:
                Pl(r.nodeValue, n, (e.mode & 1) !== 0);
                break;
              case 5:
                e.memoizedProps.suppressHydrationWarning !== !0 &&
                  Pl(r.nodeValue, n, (e.mode & 1) !== 0);
            }
          i && (t.flags |= 4);
        } else
          ((r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r)),
            (r[gt] = t),
            (t.stateNode = r));
      }
      return (Pe(t), null);
    case 13:
      if (
        (re(oe),
        (r = t.memoizedState),
        e === null || (e.memoizedState !== null && e.memoizedState.dehydrated !== null))
      ) {
        if (le && We !== null && t.mode & 1 && !(t.flags & 128))
          (Op(), er(), (t.flags |= 98560), (i = !1));
        else if (((i = _l(t)), r !== null && r.dehydrated !== null)) {
          if (e === null) {
            if (!i) throw Error(I(318));
            if (((i = t.memoizedState), (i = i !== null ? i.dehydrated : null), !i))
              throw Error(I(317));
            i[gt] = t;
          } else (er(), !(t.flags & 128) && (t.memoizedState = null), (t.flags |= 4));
          (Pe(t), (i = !1));
        } else (at !== null && (Nu(at), (at = null)), (i = !0));
        if (!i) return t.flags & 65536 ? t : null;
      }
      return t.flags & 128
        ? ((t.lanes = n), t)
        : ((r = r !== null),
          r !== (e !== null && e.memoizedState !== null) &&
            r &&
            ((t.child.flags |= 8192),
            t.mode & 1 && (e === null || oe.current & 1 ? ve === 0 && (ve = 3) : Ra())),
          t.updateQueue !== null && (t.flags |= 4),
          Pe(t),
          null);
    case 4:
      return (nr(), xu(e, t), e === null && Yr(t.stateNode.containerInfo), Pe(t), null);
    case 10:
      return (ma(t.type._context), Pe(t), null);
    case 17:
      return (Fe(t.type) && si(), Pe(t), null);
    case 19:
      if ((re(oe), (i = t.memoizedState), i === null)) return (Pe(t), null);
      if (((r = (t.flags & 128) !== 0), (o = i.rendering), o === null))
        if (r) kr(i, !1);
        else {
          if (ve !== 0 || (e !== null && e.flags & 128))
            for (e = t.child; e !== null; ) {
              if (((o = gi(e)), o !== null)) {
                for (
                  t.flags |= 128,
                    kr(i, !1),
                    r = o.updateQueue,
                    r !== null && ((t.updateQueue = r), (t.flags |= 4)),
                    t.subtreeFlags = 0,
                    r = n,
                    n = t.child;
                  n !== null;
                )
                  ((i = n),
                    (e = r),
                    (i.flags &= 14680066),
                    (o = i.alternate),
                    o === null
                      ? ((i.childLanes = 0),
                        (i.lanes = e),
                        (i.child = null),
                        (i.subtreeFlags = 0),
                        (i.memoizedProps = null),
                        (i.memoizedState = null),
                        (i.updateQueue = null),
                        (i.dependencies = null),
                        (i.stateNode = null))
                      : ((i.childLanes = o.childLanes),
                        (i.lanes = o.lanes),
                        (i.child = o.child),
                        (i.subtreeFlags = 0),
                        (i.deletions = null),
                        (i.memoizedProps = o.memoizedProps),
                        (i.memoizedState = o.memoizedState),
                        (i.updateQueue = o.updateQueue),
                        (i.type = o.type),
                        (e = o.dependencies),
                        (i.dependencies =
                          e === null ? null : { lanes: e.lanes, firstContext: e.firstContext })),
                    (n = n.sibling));
                return (Z(oe, (oe.current & 1) | 2), t.child);
              }
              e = e.sibling;
            }
          i.tail !== null &&
            fe() > lr &&
            ((t.flags |= 128), (r = !0), kr(i, !1), (t.lanes = 4194304));
        }
      else {
        if (!r)
          if (((e = gi(o)), e !== null)) {
            if (
              ((t.flags |= 128),
              (r = !0),
              (n = e.updateQueue),
              n !== null && ((t.updateQueue = n), (t.flags |= 4)),
              kr(i, !0),
              i.tail === null && i.tailMode === "hidden" && !o.alternate && !le)
            )
              return (Pe(t), null);
          } else
            2 * fe() - i.renderingStartTime > lr &&
              n !== 1073741824 &&
              ((t.flags |= 128), (r = !0), kr(i, !1), (t.lanes = 4194304));
        i.isBackwards
          ? ((o.sibling = t.child), (t.child = o))
          : ((n = i.last), n !== null ? (n.sibling = o) : (t.child = o), (i.last = o));
      }
      return i.tail !== null
        ? ((t = i.tail),
          (i.rendering = t),
          (i.tail = t.sibling),
          (i.renderingStartTime = fe()),
          (t.sibling = null),
          (n = oe.current),
          Z(oe, r ? (n & 1) | 2 : n & 1),
          t)
        : (Pe(t), null);
    case 22:
    case 23:
      return (
        La(),
        (r = t.memoizedState !== null),
        e !== null && (e.memoizedState !== null) !== r && (t.flags |= 8192),
        r && t.mode & 1
          ? $e & 1073741824 && (Pe(t), t.subtreeFlags & 6 && (t.flags |= 8192))
          : Pe(t),
        null
      );
    case 24:
      return null;
    case 25:
      return null;
  }
  throw Error(I(156, t.tag));
}
function Jg(e, t) {
  switch ((fa(t), t.tag)) {
    case 1:
      return (
        Fe(t.type) && si(),
        (e = t.flags),
        e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
      );
    case 3:
      return (
        nr(),
        re(Ae),
        re(Te),
        wa(),
        (e = t.flags),
        e & 65536 && !(e & 128) ? ((t.flags = (e & -65537) | 128), t) : null
      );
    case 5:
      return (ka(t), null);
    case 13:
      if ((re(oe), (e = t.memoizedState), e !== null && e.dehydrated !== null)) {
        if (t.alternate === null) throw Error(I(340));
        er();
      }
      return ((e = t.flags), e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null);
    case 19:
      return (re(oe), null);
    case 4:
      return (nr(), null);
    case 10:
      return (ma(t.type._context), null);
    case 22:
    case 23:
      return (La(), null);
    case 24:
      return null;
    default:
      return null;
  }
}
var Nl = !1,
  _e = !1,
  Zg = typeof WeakSet == "function" ? WeakSet : Set,
  D = null;
function Vn(e, t) {
  var n = e.ref;
  if (n !== null)
    if (typeof n == "function")
      try {
        n(null);
      } catch (r) {
        se(e, t, r);
      }
    else n.current = null;
}
function Su(e, t, n) {
  try {
    n();
  } catch (r) {
    se(e, t, r);
  }
}
var ic = !1;
function ey(e, t) {
  if (((iu = ii), (e = wp()), sa(e))) {
    if ("selectionStart" in e) var n = { start: e.selectionStart, end: e.selectionEnd };
    else
      e: {
        n = ((n = e.ownerDocument) && n.defaultView) || window;
        var r = n.getSelection && n.getSelection();
        if (r && r.rangeCount !== 0) {
          n = r.anchorNode;
          var l = r.anchorOffset,
            i = r.focusNode;
          r = r.focusOffset;
          try {
            (n.nodeType, i.nodeType);
          } catch {
            n = null;
            break e;
          }
          var o = 0,
            u = -1,
            a = -1,
            s = 0,
            c = 0,
            f = e,
            d = null;
          t: for (;;) {
            for (
              var p;
              f !== n || (l !== 0 && f.nodeType !== 3) || (u = o + l),
                f !== i || (r !== 0 && f.nodeType !== 3) || (a = o + r),
                f.nodeType === 3 && (o += f.nodeValue.length),
                (p = f.firstChild) !== null;
            )
              ((d = f), (f = p));
            for (;;) {
              if (f === e) break t;
              if (
                (d === n && ++s === l && (u = o),
                d === i && ++c === r && (a = o),
                (p = f.nextSibling) !== null)
              )
                break;
              ((f = d), (d = f.parentNode));
            }
            f = p;
          }
          n = u === -1 || a === -1 ? null : { start: u, end: a };
        } else n = null;
      }
    n = n || { start: 0, end: 0 };
  } else n = null;
  for (ou = { focusedElem: e, selectionRange: n }, ii = !1, D = t; D !== null; )
    if (((t = D), (e = t.child), (t.subtreeFlags & 1028) !== 0 && e !== null))
      ((e.return = t), (D = e));
    else
      for (; D !== null; ) {
        t = D;
        try {
          var w = t.alternate;
          if (t.flags & 1024)
            switch (t.tag) {
              case 0:
              case 11:
              case 15:
                break;
              case 1:
                if (w !== null) {
                  var v = w.memoizedProps,
                    S = w.memoizedState,
                    h = t.stateNode,
                    m = h.getSnapshotBeforeUpdate(t.elementType === t.type ? v : ot(t.type, v), S);
                  h.__reactInternalSnapshotBeforeUpdate = m;
                }
                break;
              case 3:
                var y = t.stateNode.containerInfo;
                y.nodeType === 1
                  ? (y.textContent = "")
                  : y.nodeType === 9 && y.documentElement && y.removeChild(y.documentElement);
                break;
              case 5:
              case 6:
              case 4:
              case 17:
                break;
              default:
                throw Error(I(163));
            }
        } catch (E) {
          se(t, t.return, E);
        }
        if (((e = t.sibling), e !== null)) {
          ((e.return = t.return), (D = e));
          break;
        }
        D = t.return;
      }
  return ((w = ic), (ic = !1), w);
}
function Or(e, t, n) {
  var r = t.updateQueue;
  if (((r = r !== null ? r.lastEffect : null), r !== null)) {
    var l = (r = r.next);
    do {
      if ((l.tag & e) === e) {
        var i = l.destroy;
        ((l.destroy = void 0), i !== void 0 && Su(t, n, i));
      }
      l = l.next;
    } while (l !== r);
  }
}
function Ai(e, t) {
  if (((t = t.updateQueue), (t = t !== null ? t.lastEffect : null), t !== null)) {
    var n = (t = t.next);
    do {
      if ((n.tag & e) === e) {
        var r = n.create;
        n.destroy = r();
      }
      n = n.next;
    } while (n !== t);
  }
}
function Eu(e) {
  var t = e.ref;
  if (t !== null) {
    var n = e.stateNode;
    switch (e.tag) {
      case 5:
        e = n;
        break;
      default:
        e = n;
    }
    typeof t == "function" ? t(e) : (t.current = e);
  }
}
function gd(e) {
  var t = e.alternate;
  (t !== null && ((e.alternate = null), gd(t)),
    (e.child = null),
    (e.deletions = null),
    (e.sibling = null),
    e.tag === 5 &&
      ((t = e.stateNode),
      t !== null && (delete t[gt], delete t[Kr], delete t[su], delete t[Ag], delete t[Fg])),
    (e.stateNode = null),
    (e.return = null),
    (e.dependencies = null),
    (e.memoizedProps = null),
    (e.memoizedState = null),
    (e.pendingProps = null),
    (e.stateNode = null),
    (e.updateQueue = null));
}
function yd(e) {
  return e.tag === 5 || e.tag === 3 || e.tag === 4;
}
function oc(e) {
  e: for (;;) {
    for (; e.sibling === null; ) {
      if (e.return === null || yd(e.return)) return null;
      e = e.return;
    }
    for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
      if (e.flags & 2 || e.child === null || e.tag === 4) continue e;
      ((e.child.return = e), (e = e.child));
    }
    if (!(e.flags & 2)) return e.stateNode;
  }
}
function Cu(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6)
    ((e = e.stateNode),
      t
        ? n.nodeType === 8
          ? n.parentNode.insertBefore(e, t)
          : n.insertBefore(e, t)
        : (n.nodeType === 8
            ? ((t = n.parentNode), t.insertBefore(e, n))
            : ((t = n), t.appendChild(e)),
          (n = n._reactRootContainer),
          n != null || t.onclick !== null || (t.onclick = ai)));
  else if (r !== 4 && ((e = e.child), e !== null))
    for (Cu(e, t, n), e = e.sibling; e !== null; ) (Cu(e, t, n), (e = e.sibling));
}
function Pu(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6) ((e = e.stateNode), t ? n.insertBefore(e, t) : n.appendChild(e));
  else if (r !== 4 && ((e = e.child), e !== null))
    for (Pu(e, t, n), e = e.sibling; e !== null; ) (Pu(e, t, n), (e = e.sibling));
}
var xe = null,
  ut = !1;
function Mt(e, t, n) {
  for (n = n.child; n !== null; ) (vd(e, t, n), (n = n.sibling));
}
function vd(e, t, n) {
  if (kt && typeof kt.onCommitFiberUnmount == "function")
    try {
      kt.onCommitFiberUnmount(Ii, n);
    } catch {}
  switch (n.tag) {
    case 5:
      _e || Vn(n, t);
    case 6:
      var r = xe,
        l = ut;
      ((xe = null),
        Mt(e, t, n),
        (xe = r),
        (ut = l),
        xe !== null &&
          (ut
            ? ((e = xe),
              (n = n.stateNode),
              e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n))
            : xe.removeChild(n.stateNode)));
      break;
    case 18:
      xe !== null &&
        (ut
          ? ((e = xe),
            (n = n.stateNode),
            e.nodeType === 8 ? po(e.parentNode, n) : e.nodeType === 1 && po(e, n),
            Wr(e))
          : po(xe, n.stateNode));
      break;
    case 4:
      ((r = xe),
        (l = ut),
        (xe = n.stateNode.containerInfo),
        (ut = !0),
        Mt(e, t, n),
        (xe = r),
        (ut = l));
      break;
    case 0:
    case 11:
    case 14:
    case 15:
      if (!_e && ((r = n.updateQueue), r !== null && ((r = r.lastEffect), r !== null))) {
        l = r = r.next;
        do {
          var i = l,
            o = i.destroy;
          ((i = i.tag), o !== void 0 && (i & 2 || i & 4) && Su(n, t, o), (l = l.next));
        } while (l !== r);
      }
      Mt(e, t, n);
      break;
    case 1:
      if (!_e && (Vn(n, t), (r = n.stateNode), typeof r.componentWillUnmount == "function"))
        try {
          ((r.props = n.memoizedProps), (r.state = n.memoizedState), r.componentWillUnmount());
        } catch (u) {
          se(n, t, u);
        }
      Mt(e, t, n);
      break;
    case 21:
      Mt(e, t, n);
      break;
    case 22:
      n.mode & 1
        ? ((_e = (r = _e) || n.memoizedState !== null), Mt(e, t, n), (_e = r))
        : Mt(e, t, n);
      break;
    default:
      Mt(e, t, n);
  }
}
function uc(e) {
  var t = e.updateQueue;
  if (t !== null) {
    e.updateQueue = null;
    var n = e.stateNode;
    (n === null && (n = e.stateNode = new Zg()),
      t.forEach(function (r) {
        var l = sy.bind(null, e, r);
        n.has(r) || (n.add(r), r.then(l, l));
      }));
  }
}
function it(e, t) {
  var n = t.deletions;
  if (n !== null)
    for (var r = 0; r < n.length; r++) {
      var l = n[r];
      try {
        var i = e,
          o = t,
          u = o;
        e: for (; u !== null; ) {
          switch (u.tag) {
            case 5:
              ((xe = u.stateNode), (ut = !1));
              break e;
            case 3:
              ((xe = u.stateNode.containerInfo), (ut = !0));
              break e;
            case 4:
              ((xe = u.stateNode.containerInfo), (ut = !0));
              break e;
          }
          u = u.return;
        }
        if (xe === null) throw Error(I(160));
        (vd(i, o, l), (xe = null), (ut = !1));
        var a = l.alternate;
        (a !== null && (a.return = null), (l.return = null));
      } catch (s) {
        se(l, t, s);
      }
    }
  if (t.subtreeFlags & 12854) for (t = t.child; t !== null; ) (kd(t, e), (t = t.sibling));
}
function kd(e, t) {
  var n = e.alternate,
    r = e.flags;
  switch (e.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
      if ((it(t, e), dt(e), r & 4)) {
        try {
          (Or(3, e, e.return), Ai(3, e));
        } catch (v) {
          se(e, e.return, v);
        }
        try {
          Or(5, e, e.return);
        } catch (v) {
          se(e, e.return, v);
        }
      }
      break;
    case 1:
      (it(t, e), dt(e), r & 512 && n !== null && Vn(n, n.return));
      break;
    case 5:
      if ((it(t, e), dt(e), r & 512 && n !== null && Vn(n, n.return), e.flags & 32)) {
        var l = e.stateNode;
        try {
          Ur(l, "");
        } catch (v) {
          se(e, e.return, v);
        }
      }
      if (r & 4 && ((l = e.stateNode), l != null)) {
        var i = e.memoizedProps,
          o = n !== null ? n.memoizedProps : i,
          u = e.type,
          a = e.updateQueue;
        if (((e.updateQueue = null), a !== null))
          try {
            (u === "input" && i.type === "radio" && i.name != null && Vf(l, i), Ko(u, o));
            var s = Ko(u, i);
            for (o = 0; o < a.length; o += 2) {
              var c = a[o],
                f = a[o + 1];
              c === "style"
                ? Qf(l, f)
                : c === "dangerouslySetInnerHTML"
                  ? Wf(l, f)
                  : c === "children"
                    ? Ur(l, f)
                    : Gu(l, c, f, s);
            }
            switch (u) {
              case "input":
                Wo(l, i);
                break;
              case "textarea":
                Hf(l, i);
                break;
              case "select":
                var d = l._wrapperState.wasMultiple;
                l._wrapperState.wasMultiple = !!i.multiple;
                var p = i.value;
                p != null
                  ? $n(l, !!i.multiple, p, !1)
                  : d !== !!i.multiple &&
                    (i.defaultValue != null
                      ? $n(l, !!i.multiple, i.defaultValue, !0)
                      : $n(l, !!i.multiple, i.multiple ? [] : "", !1));
            }
            l[Kr] = i;
          } catch (v) {
            se(e, e.return, v);
          }
      }
      break;
    case 6:
      if ((it(t, e), dt(e), r & 4)) {
        if (e.stateNode === null) throw Error(I(162));
        ((l = e.stateNode), (i = e.memoizedProps));
        try {
          l.nodeValue = i;
        } catch (v) {
          se(e, e.return, v);
        }
      }
      break;
    case 3:
      if ((it(t, e), dt(e), r & 4 && n !== null && n.memoizedState.isDehydrated))
        try {
          Wr(t.containerInfo);
        } catch (v) {
          se(e, e.return, v);
        }
      break;
    case 4:
      (it(t, e), dt(e));
      break;
    case 13:
      (it(t, e),
        dt(e),
        (l = e.child),
        l.flags & 8192 &&
          ((i = l.memoizedState !== null),
          (l.stateNode.isHidden = i),
          !i || (l.alternate !== null && l.alternate.memoizedState !== null) || (Na = fe())),
        r & 4 && uc(e));
      break;
    case 22:
      if (
        ((c = n !== null && n.memoizedState !== null),
        e.mode & 1 ? ((_e = (s = _e) || c), it(t, e), (_e = s)) : it(t, e),
        dt(e),
        r & 8192)
      ) {
        if (((s = e.memoizedState !== null), (e.stateNode.isHidden = s) && !c && e.mode & 1))
          for (D = e, c = e.child; c !== null; ) {
            for (f = D = c; D !== null; ) {
              switch (((d = D), (p = d.child), d.tag)) {
                case 0:
                case 11:
                case 14:
                case 15:
                  Or(4, d, d.return);
                  break;
                case 1:
                  Vn(d, d.return);
                  var w = d.stateNode;
                  if (typeof w.componentWillUnmount == "function") {
                    ((r = d), (n = d.return));
                    try {
                      ((t = r),
                        (w.props = t.memoizedProps),
                        (w.state = t.memoizedState),
                        w.componentWillUnmount());
                    } catch (v) {
                      se(r, n, v);
                    }
                  }
                  break;
                case 5:
                  Vn(d, d.return);
                  break;
                case 22:
                  if (d.memoizedState !== null) {
                    sc(f);
                    continue;
                  }
              }
              p !== null ? ((p.return = d), (D = p)) : sc(f);
            }
            c = c.sibling;
          }
        e: for (c = null, f = e; ; ) {
          if (f.tag === 5) {
            if (c === null) {
              c = f;
              try {
                ((l = f.stateNode),
                  s
                    ? ((i = l.style),
                      typeof i.setProperty == "function"
                        ? i.setProperty("display", "none", "important")
                        : (i.display = "none"))
                    : ((u = f.stateNode),
                      (a = f.memoizedProps.style),
                      (o = a != null && a.hasOwnProperty("display") ? a.display : null),
                      (u.style.display = bf("display", o))));
              } catch (v) {
                se(e, e.return, v);
              }
            }
          } else if (f.tag === 6) {
            if (c === null)
              try {
                f.stateNode.nodeValue = s ? "" : f.memoizedProps;
              } catch (v) {
                se(e, e.return, v);
              }
          } else if (
            ((f.tag !== 22 && f.tag !== 23) || f.memoizedState === null || f === e) &&
            f.child !== null
          ) {
            ((f.child.return = f), (f = f.child));
            continue;
          }
          if (f === e) break e;
          for (; f.sibling === null; ) {
            if (f.return === null || f.return === e) break e;
            (c === f && (c = null), (f = f.return));
          }
          (c === f && (c = null), (f.sibling.return = f.return), (f = f.sibling));
        }
      }
      break;
    case 19:
      (it(t, e), dt(e), r & 4 && uc(e));
      break;
    case 21:
      break;
    default:
      (it(t, e), dt(e));
  }
}
function dt(e) {
  var t = e.flags;
  if (t & 2) {
    try {
      e: {
        for (var n = e.return; n !== null; ) {
          if (yd(n)) {
            var r = n;
            break e;
          }
          n = n.return;
        }
        throw Error(I(160));
      }
      switch (r.tag) {
        case 5:
          var l = r.stateNode;
          r.flags & 32 && (Ur(l, ""), (r.flags &= -33));
          var i = oc(e);
          Pu(e, i, l);
          break;
        case 3:
        case 4:
          var o = r.stateNode.containerInfo,
            u = oc(e);
          Cu(e, u, o);
          break;
        default:
          throw Error(I(161));
      }
    } catch (a) {
      se(e, e.return, a);
    }
    e.flags &= -3;
  }
  t & 4096 && (e.flags &= -4097);
}
function ty(e, t, n) {
  ((D = e), wd(e));
}
function wd(e, t, n) {
  for (var r = (e.mode & 1) !== 0; D !== null; ) {
    var l = D,
      i = l.child;
    if (l.tag === 22 && r) {
      var o = l.memoizedState !== null || Nl;
      if (!o) {
        var u = l.alternate,
          a = (u !== null && u.memoizedState !== null) || _e;
        u = Nl;
        var s = _e;
        if (((Nl = o), (_e = a) && !s))
          for (D = l; D !== null; )
            ((o = D),
              (a = o.child),
              o.tag === 22 && o.memoizedState !== null
                ? cc(l)
                : a !== null
                  ? ((a.return = o), (D = a))
                  : cc(l));
        for (; i !== null; ) ((D = i), wd(i), (i = i.sibling));
        ((D = l), (Nl = u), (_e = s));
      }
      ac(e);
    } else l.subtreeFlags & 8772 && i !== null ? ((i.return = l), (D = i)) : ac(e);
  }
}
function ac(e) {
  for (; D !== null; ) {
    var t = D;
    if (t.flags & 8772) {
      var n = t.alternate;
      try {
        if (t.flags & 8772)
          switch (t.tag) {
            case 0:
            case 11:
            case 15:
              _e || Ai(5, t);
              break;
            case 1:
              var r = t.stateNode;
              if (t.flags & 4 && !_e)
                if (n === null) r.componentDidMount();
                else {
                  var l = t.elementType === t.type ? n.memoizedProps : ot(t.type, n.memoizedProps);
                  r.componentDidUpdate(l, n.memoizedState, r.__reactInternalSnapshotBeforeUpdate);
                }
              var i = t.updateQueue;
              i !== null && Qs(t, i, r);
              break;
            case 3:
              var o = t.updateQueue;
              if (o !== null) {
                if (((n = null), t.child !== null))
                  switch (t.child.tag) {
                    case 5:
                      n = t.child.stateNode;
                      break;
                    case 1:
                      n = t.child.stateNode;
                  }
                Qs(t, o, n);
              }
              break;
            case 5:
              var u = t.stateNode;
              if (n === null && t.flags & 4) {
                n = u;
                var a = t.memoizedProps;
                switch (t.type) {
                  case "button":
                  case "input":
                  case "select":
                  case "textarea":
                    a.autoFocus && n.focus();
                    break;
                  case "img":
                    a.src && (n.src = a.src);
                }
              }
              break;
            case 6:
              break;
            case 4:
              break;
            case 12:
              break;
            case 13:
              if (t.memoizedState === null) {
                var s = t.alternate;
                if (s !== null) {
                  var c = s.memoizedState;
                  if (c !== null) {
                    var f = c.dehydrated;
                    f !== null && Wr(f);
                  }
                }
              }
              break;
            case 19:
            case 17:
            case 21:
            case 22:
            case 23:
            case 25:
              break;
            default:
              throw Error(I(163));
          }
        _e || (t.flags & 512 && Eu(t));
      } catch (d) {
        se(t, t.return, d);
      }
    }
    if (t === e) {
      D = null;
      break;
    }
    if (((n = t.sibling), n !== null)) {
      ((n.return = t.return), (D = n));
      break;
    }
    D = t.return;
  }
}
function sc(e) {
  for (; D !== null; ) {
    var t = D;
    if (t === e) {
      D = null;
      break;
    }
    var n = t.sibling;
    if (n !== null) {
      ((n.return = t.return), (D = n));
      break;
    }
    D = t.return;
  }
}
function cc(e) {
  for (; D !== null; ) {
    var t = D;
    try {
      switch (t.tag) {
        case 0:
        case 11:
        case 15:
          var n = t.return;
          try {
            Ai(4, t);
          } catch (a) {
            se(t, n, a);
          }
          break;
        case 1:
          var r = t.stateNode;
          if (typeof r.componentDidMount == "function") {
            var l = t.return;
            try {
              r.componentDidMount();
            } catch (a) {
              se(t, l, a);
            }
          }
          var i = t.return;
          try {
            Eu(t);
          } catch (a) {
            se(t, i, a);
          }
          break;
        case 5:
          var o = t.return;
          try {
            Eu(t);
          } catch (a) {
            se(t, o, a);
          }
      }
    } catch (a) {
      se(t, t.return, a);
    }
    if (t === e) {
      D = null;
      break;
    }
    var u = t.sibling;
    if (u !== null) {
      ((u.return = t.return), (D = u));
      break;
    }
    D = t.return;
  }
}
var ny = Math.ceil,
  ki = Ot.ReactCurrentDispatcher,
  Ta = Ot.ReactCurrentOwner,
  et = Ot.ReactCurrentBatchConfig,
  Q = 0,
  we = null,
  he = null,
  Se = 0,
  $e = 0,
  Hn = tn(0),
  ve = 0,
  tl = null,
  kn = 0,
  Fi = 0,
  Ia = 0,
  Dr = null,
  De = null,
  Na = 0,
  lr = 1 / 0,
  Ct = null,
  wi = !1,
  _u = null,
  Kt = null,
  zl = !1,
  Ht = null,
  xi = 0,
  Mr = 0,
  Tu = null,
  Ql = -1,
  Yl = 0;
function ze() {
  return Q & 6 ? fe() : Ql !== -1 ? Ql : (Ql = fe());
}
function Gt(e) {
  return e.mode & 1
    ? Q & 2 && Se !== 0
      ? Se & -Se
      : jg.transition !== null
        ? (Yl === 0 && (Yl = lp()), Yl)
        : ((e = K), e !== 0 || ((e = window.event), (e = e === void 0 ? 16 : fp(e.type))), e)
    : 1;
}
function ct(e, t, n, r) {
  if (50 < Mr) throw ((Mr = 0), (Tu = null), Error(I(185)));
  (ol(e, n, r),
    (!(Q & 2) || e !== we) &&
      (e === we && (!(Q & 2) && (Fi |= n), ve === 4 && Ut(e, Se)),
      Be(e, r),
      n === 1 && Q === 0 && !(t.mode & 1) && ((lr = fe() + 500), Oi && nn())));
}
function Be(e, t) {
  var n = e.callbackNode;
  jm(e, t);
  var r = li(e, e === we ? Se : 0);
  if (r === 0) (n !== null && ks(n), (e.callbackNode = null), (e.callbackPriority = 0));
  else if (((t = r & -r), e.callbackPriority !== t)) {
    if ((n != null && ks(n), t === 1))
      (e.tag === 0 ? Bg(fc.bind(null, e)) : zp(fc.bind(null, e)),
        Dg(function () {
          !(Q & 6) && nn();
        }),
        (n = null));
    else {
      switch (ip(r)) {
        case 1:
          n = ta;
          break;
        case 4:
          n = np;
          break;
        case 16:
          n = ri;
          break;
        case 536870912:
          n = rp;
          break;
        default:
          n = ri;
      }
      n = Id(n, xd.bind(null, e));
    }
    ((e.callbackPriority = t), (e.callbackNode = n));
  }
}
function xd(e, t) {
  if (((Ql = -1), (Yl = 0), Q & 6)) throw Error(I(327));
  var n = e.callbackNode;
  if (Xn() && e.callbackNode !== n) return null;
  var r = li(e, e === we ? Se : 0);
  if (r === 0) return null;
  if (r & 30 || r & e.expiredLanes || t) t = Si(e, r);
  else {
    t = r;
    var l = Q;
    Q |= 2;
    var i = Ed();
    (we !== e || Se !== t) && ((Ct = null), (lr = fe() + 500), dn(e, t));
    do
      try {
        iy();
        break;
      } catch (u) {
        Sd(e, u);
      }
    while (!0);
    (ha(), (ki.current = i), (Q = l), he !== null ? (t = 0) : ((we = null), (Se = 0), (t = ve)));
  }
  if (t !== 0) {
    if ((t === 2 && ((l = eu(e)), l !== 0 && ((r = l), (t = Iu(e, l)))), t === 1))
      throw ((n = tl), dn(e, 0), Ut(e, r), Be(e, fe()), n);
    if (t === 6) Ut(e, r);
    else {
      if (
        ((l = e.current.alternate),
        !(r & 30) &&
          !ry(l) &&
          ((t = Si(e, r)), t === 2 && ((i = eu(e)), i !== 0 && ((r = i), (t = Iu(e, i)))), t === 1))
      )
        throw ((n = tl), dn(e, 0), Ut(e, r), Be(e, fe()), n);
      switch (((e.finishedWork = l), (e.finishedLanes = r), t)) {
        case 0:
        case 1:
          throw Error(I(345));
        case 2:
          an(e, De, Ct);
          break;
        case 3:
          if ((Ut(e, r), (r & 130023424) === r && ((t = Na + 500 - fe()), 10 < t))) {
            if (li(e, 0) !== 0) break;
            if (((l = e.suspendedLanes), (l & r) !== r)) {
              (ze(), (e.pingedLanes |= e.suspendedLanes & l));
              break;
            }
            e.timeoutHandle = au(an.bind(null, e, De, Ct), t);
            break;
          }
          an(e, De, Ct);
          break;
        case 4:
          if ((Ut(e, r), (r & 4194240) === r)) break;
          for (t = e.eventTimes, l = -1; 0 < r; ) {
            var o = 31 - st(r);
            ((i = 1 << o), (o = t[o]), o > l && (l = o), (r &= ~i));
          }
          if (
            ((r = l),
            (r = fe() - r),
            (r =
              (120 > r
                ? 120
                : 480 > r
                  ? 480
                  : 1080 > r
                    ? 1080
                    : 1920 > r
                      ? 1920
                      : 3e3 > r
                        ? 3e3
                        : 4320 > r
                          ? 4320
                          : 1960 * ny(r / 1960)) - r),
            10 < r)
          ) {
            e.timeoutHandle = au(an.bind(null, e, De, Ct), r);
            break;
          }
          an(e, De, Ct);
          break;
        case 5:
          an(e, De, Ct);
          break;
        default:
          throw Error(I(329));
      }
    }
  }
  return (Be(e, fe()), e.callbackNode === n ? xd.bind(null, e) : null);
}
function Iu(e, t) {
  var n = Dr;
  return (
    e.current.memoizedState.isDehydrated && (dn(e, t).flags |= 256),
    (e = Si(e, t)),
    e !== 2 && ((t = De), (De = n), t !== null && Nu(t)),
    e
  );
}
function Nu(e) {
  De === null ? (De = e) : De.push.apply(De, e);
}
function ry(e) {
  for (var t = e; ; ) {
    if (t.flags & 16384) {
      var n = t.updateQueue;
      if (n !== null && ((n = n.stores), n !== null))
        for (var r = 0; r < n.length; r++) {
          var l = n[r],
            i = l.getSnapshot;
          l = l.value;
          try {
            if (!ft(i(), l)) return !1;
          } catch {
            return !1;
          }
        }
    }
    if (((n = t.child), t.subtreeFlags & 16384 && n !== null)) ((n.return = t), (t = n));
    else {
      if (t === e) break;
      for (; t.sibling === null; ) {
        if (t.return === null || t.return === e) return !0;
        t = t.return;
      }
      ((t.sibling.return = t.return), (t = t.sibling));
    }
  }
  return !0;
}
function Ut(e, t) {
  for (
    t &= ~Ia, t &= ~Fi, e.suspendedLanes |= t, e.pingedLanes &= ~t, e = e.expirationTimes;
    0 < t;
  ) {
    var n = 31 - st(t),
      r = 1 << n;
    ((e[n] = -1), (t &= ~r));
  }
}
function fc(e) {
  if (Q & 6) throw Error(I(327));
  Xn();
  var t = li(e, 0);
  if (!(t & 1)) return (Be(e, fe()), null);
  var n = Si(e, t);
  if (e.tag !== 0 && n === 2) {
    var r = eu(e);
    r !== 0 && ((t = r), (n = Iu(e, r)));
  }
  if (n === 1) throw ((n = tl), dn(e, 0), Ut(e, t), Be(e, fe()), n);
  if (n === 6) throw Error(I(345));
  return (
    (e.finishedWork = e.current.alternate),
    (e.finishedLanes = t),
    an(e, De, Ct),
    Be(e, fe()),
    null
  );
}
function za(e, t) {
  var n = Q;
  Q |= 1;
  try {
    return e(t);
  } finally {
    ((Q = n), Q === 0 && ((lr = fe() + 500), Oi && nn()));
  }
}
function wn(e) {
  Ht !== null && Ht.tag === 0 && !(Q & 6) && Xn();
  var t = Q;
  Q |= 1;
  var n = et.transition,
    r = K;
  try {
    if (((et.transition = null), (K = 1), e)) return e();
  } finally {
    ((K = r), (et.transition = n), (Q = t), !(Q & 6) && nn());
  }
}
function La() {
  (($e = Hn.current), re(Hn));
}
function dn(e, t) {
  ((e.finishedWork = null), (e.finishedLanes = 0));
  var n = e.timeoutHandle;
  if ((n !== -1 && ((e.timeoutHandle = -1), Og(n)), he !== null))
    for (n = he.return; n !== null; ) {
      var r = n;
      switch ((fa(r), r.tag)) {
        case 1:
          ((r = r.type.childContextTypes), r != null && si());
          break;
        case 3:
          (nr(), re(Ae), re(Te), wa());
          break;
        case 5:
          ka(r);
          break;
        case 4:
          nr();
          break;
        case 13:
          re(oe);
          break;
        case 19:
          re(oe);
          break;
        case 10:
          ma(r.type._context);
          break;
        case 22:
        case 23:
          La();
      }
      n = n.return;
    }
  if (
    ((we = e),
    (he = e = qt(e.current, null)),
    (Se = $e = t),
    (ve = 0),
    (tl = null),
    (Ia = Fi = kn = 0),
    (De = Dr = null),
    fn !== null)
  ) {
    for (t = 0; t < fn.length; t++)
      if (((n = fn[t]), (r = n.interleaved), r !== null)) {
        n.interleaved = null;
        var l = r.next,
          i = n.pending;
        if (i !== null) {
          var o = i.next;
          ((i.next = l), (r.next = o));
        }
        n.pending = r;
      }
    fn = null;
  }
  return e;
}
function Sd(e, t) {
  do {
    var n = he;
    try {
      if ((ha(), ($l.current = vi), yi)) {
        for (var r = ue.memoizedState; r !== null; ) {
          var l = r.queue;
          (l !== null && (l.pending = null), (r = r.next));
        }
        yi = !1;
      }
      if (
        ((vn = 0),
        (ke = ye = ue = null),
        (Rr = !1),
        (Jr = 0),
        (Ta.current = null),
        n === null || n.return === null)
      ) {
        ((ve = 1), (tl = t), (he = null));
        break;
      }
      e: {
        var i = e,
          o = n.return,
          u = n,
          a = t;
        if (
          ((t = Se),
          (u.flags |= 32768),
          a !== null && typeof a == "object" && typeof a.then == "function")
        ) {
          var s = a,
            c = u,
            f = c.tag;
          if (!(c.mode & 1) && (f === 0 || f === 11 || f === 15)) {
            var d = c.alternate;
            d
              ? ((c.updateQueue = d.updateQueue),
                (c.memoizedState = d.memoizedState),
                (c.lanes = d.lanes))
              : ((c.updateQueue = null), (c.memoizedState = null));
          }
          var p = Js(o);
          if (p !== null) {
            ((p.flags &= -257), Zs(p, o, u, i, t), p.mode & 1 && qs(i, s, t), (t = p), (a = s));
            var w = t.updateQueue;
            if (w === null) {
              var v = new Set();
              (v.add(a), (t.updateQueue = v));
            } else w.add(a);
            break e;
          } else {
            if (!(t & 1)) {
              (qs(i, s, t), Ra());
              break e;
            }
            a = Error(I(426));
          }
        } else if (le && u.mode & 1) {
          var S = Js(o);
          if (S !== null) {
            (!(S.flags & 65536) && (S.flags |= 256), Zs(S, o, u, i, t), pa(rr(a, u)));
            break e;
          }
        }
        ((i = a = rr(a, u)), ve !== 4 && (ve = 2), Dr === null ? (Dr = [i]) : Dr.push(i), (i = o));
        do {
          switch (i.tag) {
            case 3:
              ((i.flags |= 65536), (t &= -t), (i.lanes |= t));
              var h = id(i, a, t);
              bs(i, h);
              break e;
            case 1:
              u = a;
              var m = i.type,
                y = i.stateNode;
              if (
                !(i.flags & 128) &&
                (typeof m.getDerivedStateFromError == "function" ||
                  (y !== null &&
                    typeof y.componentDidCatch == "function" &&
                    (Kt === null || !Kt.has(y))))
              ) {
                ((i.flags |= 65536), (t &= -t), (i.lanes |= t));
                var E = od(i, u, t);
                bs(i, E);
                break e;
              }
          }
          i = i.return;
        } while (i !== null);
      }
      Pd(n);
    } catch (P) {
      ((t = P), he === n && n !== null && (he = n = n.return));
      continue;
    }
    break;
  } while (!0);
}
function Ed() {
  var e = ki.current;
  return ((ki.current = vi), e === null ? vi : e);
}
function Ra() {
  ((ve === 0 || ve === 3 || ve === 2) && (ve = 4),
    we === null || (!(kn & 268435455) && !(Fi & 268435455)) || Ut(we, Se));
}
function Si(e, t) {
  var n = Q;
  Q |= 2;
  var r = Ed();
  (we !== e || Se !== t) && ((Ct = null), dn(e, t));
  do
    try {
      ly();
      break;
    } catch (l) {
      Sd(e, l);
    }
  while (!0);
  if ((ha(), (Q = n), (ki.current = r), he !== null)) throw Error(I(261));
  return ((we = null), (Se = 0), ve);
}
function ly() {
  for (; he !== null; ) Cd(he);
}
function iy() {
  for (; he !== null && !zm(); ) Cd(he);
}
function Cd(e) {
  var t = Td(e.alternate, e, $e);
  ((e.memoizedProps = e.pendingProps), t === null ? Pd(e) : (he = t), (Ta.current = null));
}
function Pd(e) {
  var t = e;
  do {
    var n = t.alternate;
    if (((e = t.return), t.flags & 32768)) {
      if (((n = Jg(n, t)), n !== null)) {
        ((n.flags &= 32767), (he = n));
        return;
      }
      if (e !== null) ((e.flags |= 32768), (e.subtreeFlags = 0), (e.deletions = null));
      else {
        ((ve = 6), (he = null));
        return;
      }
    } else if (((n = qg(n, t, $e)), n !== null)) {
      he = n;
      return;
    }
    if (((t = t.sibling), t !== null)) {
      he = t;
      return;
    }
    he = t = e;
  } while (t !== null);
  ve === 0 && (ve = 5);
}
function an(e, t, n) {
  var r = K,
    l = et.transition;
  try {
    ((et.transition = null), (K = 1), oy(e, t, n, r));
  } finally {
    ((et.transition = l), (K = r));
  }
  return null;
}
function oy(e, t, n, r) {
  do Xn();
  while (Ht !== null);
  if (Q & 6) throw Error(I(327));
  n = e.finishedWork;
  var l = e.finishedLanes;
  if (n === null) return null;
  if (((e.finishedWork = null), (e.finishedLanes = 0), n === e.current)) throw Error(I(177));
  ((e.callbackNode = null), (e.callbackPriority = 0));
  var i = n.lanes | n.childLanes;
  if (
    (Um(e, i),
    e === we && ((he = we = null), (Se = 0)),
    (!(n.subtreeFlags & 2064) && !(n.flags & 2064)) ||
      zl ||
      ((zl = !0),
      Id(ri, function () {
        return (Xn(), null);
      })),
    (i = (n.flags & 15990) !== 0),
    n.subtreeFlags & 15990 || i)
  ) {
    ((i = et.transition), (et.transition = null));
    var o = K;
    K = 1;
    var u = Q;
    ((Q |= 4),
      (Ta.current = null),
      ey(e, n),
      kd(n, e),
      _g(ou),
      (ii = !!iu),
      (ou = iu = null),
      (e.current = n),
      ty(n),
      Lm(),
      (Q = u),
      (K = o),
      (et.transition = i));
  } else e.current = n;
  if (
    (zl && ((zl = !1), (Ht = e), (xi = l)),
    (i = e.pendingLanes),
    i === 0 && (Kt = null),
    Dm(n.stateNode),
    Be(e, fe()),
    t !== null)
  )
    for (r = e.onRecoverableError, n = 0; n < t.length; n++)
      ((l = t[n]), r(l.value, { componentStack: l.stack, digest: l.digest }));
  if (wi) throw ((wi = !1), (e = _u), (_u = null), e);
  return (
    xi & 1 && e.tag !== 0 && Xn(),
    (i = e.pendingLanes),
    i & 1 ? (e === Tu ? Mr++ : ((Mr = 0), (Tu = e))) : (Mr = 0),
    nn(),
    null
  );
}
function Xn() {
  if (Ht !== null) {
    var e = ip(xi),
      t = et.transition,
      n = K;
    try {
      if (((et.transition = null), (K = 16 > e ? 16 : e), Ht === null)) var r = !1;
      else {
        if (((e = Ht), (Ht = null), (xi = 0), Q & 6)) throw Error(I(331));
        var l = Q;
        for (Q |= 4, D = e.current; D !== null; ) {
          var i = D,
            o = i.child;
          if (D.flags & 16) {
            var u = i.deletions;
            if (u !== null) {
              for (var a = 0; a < u.length; a++) {
                var s = u[a];
                for (D = s; D !== null; ) {
                  var c = D;
                  switch (c.tag) {
                    case 0:
                    case 11:
                    case 15:
                      Or(8, c, i);
                  }
                  var f = c.child;
                  if (f !== null) ((f.return = c), (D = f));
                  else
                    for (; D !== null; ) {
                      c = D;
                      var d = c.sibling,
                        p = c.return;
                      if ((gd(c), c === s)) {
                        D = null;
                        break;
                      }
                      if (d !== null) {
                        ((d.return = p), (D = d));
                        break;
                      }
                      D = p;
                    }
                }
              }
              var w = i.alternate;
              if (w !== null) {
                var v = w.child;
                if (v !== null) {
                  w.child = null;
                  do {
                    var S = v.sibling;
                    ((v.sibling = null), (v = S));
                  } while (v !== null);
                }
              }
              D = i;
            }
          }
          if (i.subtreeFlags & 2064 && o !== null) ((o.return = i), (D = o));
          else
            e: for (; D !== null; ) {
              if (((i = D), i.flags & 2048))
                switch (i.tag) {
                  case 0:
                  case 11:
                  case 15:
                    Or(9, i, i.return);
                }
              var h = i.sibling;
              if (h !== null) {
                ((h.return = i.return), (D = h));
                break e;
              }
              D = i.return;
            }
        }
        var m = e.current;
        for (D = m; D !== null; ) {
          o = D;
          var y = o.child;
          if (o.subtreeFlags & 2064 && y !== null) ((y.return = o), (D = y));
          else
            e: for (o = m; D !== null; ) {
              if (((u = D), u.flags & 2048))
                try {
                  switch (u.tag) {
                    case 0:
                    case 11:
                    case 15:
                      Ai(9, u);
                  }
                } catch (P) {
                  se(u, u.return, P);
                }
              if (u === o) {
                D = null;
                break e;
              }
              var E = u.sibling;
              if (E !== null) {
                ((E.return = u.return), (D = E));
                break e;
              }
              D = u.return;
            }
        }
        if (((Q = l), nn(), kt && typeof kt.onPostCommitFiberRoot == "function"))
          try {
            kt.onPostCommitFiberRoot(Ii, e);
          } catch {}
        r = !0;
      }
      return r;
    } finally {
      ((K = n), (et.transition = t));
    }
  }
  return !1;
}
function pc(e, t, n) {
  ((t = rr(n, t)),
    (t = id(e, t, 1)),
    (e = Xt(e, t, 1)),
    (t = ze()),
    e !== null && (ol(e, 1, t), Be(e, t)));
}
function se(e, t, n) {
  if (e.tag === 3) pc(e, e, n);
  else
    for (; t !== null; ) {
      if (t.tag === 3) {
        pc(t, e, n);
        break;
      } else if (t.tag === 1) {
        var r = t.stateNode;
        if (
          typeof t.type.getDerivedStateFromError == "function" ||
          (typeof r.componentDidCatch == "function" && (Kt === null || !Kt.has(r)))
        ) {
          ((e = rr(n, e)),
            (e = od(t, e, 1)),
            (t = Xt(t, e, 1)),
            (e = ze()),
            t !== null && (ol(t, 1, e), Be(t, e)));
          break;
        }
      }
      t = t.return;
    }
}
function uy(e, t, n) {
  var r = e.pingCache;
  (r !== null && r.delete(t),
    (t = ze()),
    (e.pingedLanes |= e.suspendedLanes & n),
    we === e &&
      (Se & n) === n &&
      (ve === 4 || (ve === 3 && (Se & 130023424) === Se && 500 > fe() - Na) ? dn(e, 0) : (Ia |= n)),
    Be(e, t));
}
function _d(e, t) {
  t === 0 && (e.mode & 1 ? ((t = wl), (wl <<= 1), !(wl & 130023424) && (wl = 4194304)) : (t = 1));
  var n = ze();
  ((e = Lt(e, t)), e !== null && (ol(e, t, n), Be(e, n)));
}
function ay(e) {
  var t = e.memoizedState,
    n = 0;
  (t !== null && (n = t.retryLane), _d(e, n));
}
function sy(e, t) {
  var n = 0;
  switch (e.tag) {
    case 13:
      var r = e.stateNode,
        l = e.memoizedState;
      l !== null && (n = l.retryLane);
      break;
    case 19:
      r = e.stateNode;
      break;
    default:
      throw Error(I(314));
  }
  (r !== null && r.delete(t), _d(e, n));
}
var Td;
Td = function (e, t, n) {
  if (e !== null)
    if (e.memoizedProps !== t.pendingProps || Ae.current) Me = !0;
    else {
      if (!(e.lanes & n) && !(t.flags & 128)) return ((Me = !1), Gg(e, t, n));
      Me = !!(e.flags & 131072);
    }
  else ((Me = !1), le && t.flags & 1048576 && Lp(t, pi, t.index));
  switch (((t.lanes = 0), t.tag)) {
    case 2:
      var r = t.type;
      (bl(e, t), (e = t.pendingProps));
      var l = Zn(t, Te.current);
      (Yn(t, n), (l = Sa(null, t, r, e, l, n)));
      var i = Ea();
      return (
        (t.flags |= 1),
        typeof l == "object" && l !== null && typeof l.render == "function" && l.$$typeof === void 0
          ? ((t.tag = 1),
            (t.memoizedState = null),
            (t.updateQueue = null),
            Fe(r) ? ((i = !0), ci(t)) : (i = !1),
            (t.memoizedState = l.state !== null && l.state !== void 0 ? l.state : null),
            ya(t),
            (l.updater = Mi),
            (t.stateNode = l),
            (l._reactInternals = t),
            mu(t, r, e, n),
            (t = vu(null, t, r, !0, i, n)))
          : ((t.tag = 0), le && i && ca(t), Ne(null, t, l, n), (t = t.child)),
        t
      );
    case 16:
      r = t.elementType;
      e: {
        switch (
          (bl(e, t),
          (e = t.pendingProps),
          (l = r._init),
          (r = l(r._payload)),
          (t.type = r),
          (l = t.tag = fy(r)),
          (e = ot(r, e)),
          l)
        ) {
          case 0:
            t = yu(null, t, r, e, n);
            break e;
          case 1:
            t = nc(null, t, r, e, n);
            break e;
          case 11:
            t = ec(null, t, r, e, n);
            break e;
          case 14:
            t = tc(null, t, r, ot(r.type, e), n);
            break e;
        }
        throw Error(I(306, r, ""));
      }
      return t;
    case 0:
      return (
        (r = t.type),
        (l = t.pendingProps),
        (l = t.elementType === r ? l : ot(r, l)),
        yu(e, t, r, l, n)
      );
    case 1:
      return (
        (r = t.type),
        (l = t.pendingProps),
        (l = t.elementType === r ? l : ot(r, l)),
        nc(e, t, r, l, n)
      );
    case 3:
      e: {
        if ((cd(t), e === null)) throw Error(I(387));
        ((r = t.pendingProps), (i = t.memoizedState), (l = i.element), Fp(e, t), mi(t, r, null, n));
        var o = t.memoizedState;
        if (((r = o.element), i.isDehydrated))
          if (
            ((i = {
              element: r,
              isDehydrated: !1,
              cache: o.cache,
              pendingSuspenseBoundaries: o.pendingSuspenseBoundaries,
              transitions: o.transitions,
            }),
            (t.updateQueue.baseState = i),
            (t.memoizedState = i),
            t.flags & 256)
          ) {
            ((l = rr(Error(I(423)), t)), (t = rc(e, t, r, n, l)));
            break e;
          } else if (r !== l) {
            ((l = rr(Error(I(424)), t)), (t = rc(e, t, r, n, l)));
            break e;
          } else
            for (
              We = Yt(t.stateNode.containerInfo.firstChild),
                Qe = t,
                le = !0,
                at = null,
                n = Mp(t, null, r, n),
                t.child = n;
              n;
            )
              ((n.flags = (n.flags & -3) | 4096), (n = n.sibling));
        else {
          if ((er(), r === l)) {
            t = Rt(e, t, n);
            break e;
          }
          Ne(e, t, r, n);
        }
        t = t.child;
      }
      return t;
    case 5:
      return (
        Bp(t),
        e === null && pu(t),
        (r = t.type),
        (l = t.pendingProps),
        (i = e !== null ? e.memoizedProps : null),
        (o = l.children),
        uu(r, l) ? (o = null) : i !== null && uu(r, i) && (t.flags |= 32),
        sd(e, t),
        Ne(e, t, o, n),
        t.child
      );
    case 6:
      return (e === null && pu(t), null);
    case 13:
      return fd(e, t, n);
    case 4:
      return (
        va(t, t.stateNode.containerInfo),
        (r = t.pendingProps),
        e === null ? (t.child = tr(t, null, r, n)) : Ne(e, t, r, n),
        t.child
      );
    case 11:
      return (
        (r = t.type),
        (l = t.pendingProps),
        (l = t.elementType === r ? l : ot(r, l)),
        ec(e, t, r, l, n)
      );
    case 7:
      return (Ne(e, t, t.pendingProps, n), t.child);
    case 8:
      return (Ne(e, t, t.pendingProps.children, n), t.child);
    case 12:
      return (Ne(e, t, t.pendingProps.children, n), t.child);
    case 10:
      e: {
        if (
          ((r = t.type._context),
          (l = t.pendingProps),
          (i = t.memoizedProps),
          (o = l.value),
          Z(di, r._currentValue),
          (r._currentValue = o),
          i !== null)
        )
          if (ft(i.value, o)) {
            if (i.children === l.children && !Ae.current) {
              t = Rt(e, t, n);
              break e;
            }
          } else
            for (i = t.child, i !== null && (i.return = t); i !== null; ) {
              var u = i.dependencies;
              if (u !== null) {
                o = i.child;
                for (var a = u.firstContext; a !== null; ) {
                  if (a.context === r) {
                    if (i.tag === 1) {
                      ((a = It(-1, n & -n)), (a.tag = 2));
                      var s = i.updateQueue;
                      if (s !== null) {
                        s = s.shared;
                        var c = s.pending;
                        (c === null ? (a.next = a) : ((a.next = c.next), (c.next = a)),
                          (s.pending = a));
                      }
                    }
                    ((i.lanes |= n),
                      (a = i.alternate),
                      a !== null && (a.lanes |= n),
                      du(i.return, n, t),
                      (u.lanes |= n));
                    break;
                  }
                  a = a.next;
                }
              } else if (i.tag === 10) o = i.type === t.type ? null : i.child;
              else if (i.tag === 18) {
                if (((o = i.return), o === null)) throw Error(I(341));
                ((o.lanes |= n),
                  (u = o.alternate),
                  u !== null && (u.lanes |= n),
                  du(o, n, t),
                  (o = i.sibling));
              } else o = i.child;
              if (o !== null) o.return = i;
              else
                for (o = i; o !== null; ) {
                  if (o === t) {
                    o = null;
                    break;
                  }
                  if (((i = o.sibling), i !== null)) {
                    ((i.return = o.return), (o = i));
                    break;
                  }
                  o = o.return;
                }
              i = o;
            }
        (Ne(e, t, l.children, n), (t = t.child));
      }
      return t;
    case 9:
      return (
        (l = t.type),
        (r = t.pendingProps.children),
        Yn(t, n),
        (l = tt(l)),
        (r = r(l)),
        (t.flags |= 1),
        Ne(e, t, r, n),
        t.child
      );
    case 14:
      return ((r = t.type), (l = ot(r, t.pendingProps)), (l = ot(r.type, l)), tc(e, t, r, l, n));
    case 15:
      return ud(e, t, t.type, t.pendingProps, n);
    case 17:
      return (
        (r = t.type),
        (l = t.pendingProps),
        (l = t.elementType === r ? l : ot(r, l)),
        bl(e, t),
        (t.tag = 1),
        Fe(r) ? ((e = !0), ci(t)) : (e = !1),
        Yn(t, n),
        ld(t, r, l),
        mu(t, r, l, n),
        vu(null, t, r, !0, e, n)
      );
    case 19:
      return pd(e, t, n);
    case 22:
      return ad(e, t, n);
  }
  throw Error(I(156, t.tag));
};
function Id(e, t) {
  return tp(e, t);
}
function cy(e, t, n, r) {
  ((this.tag = e),
    (this.key = n),
    (this.sibling =
      this.child =
      this.return =
      this.stateNode =
      this.type =
      this.elementType =
        null),
    (this.index = 0),
    (this.ref = null),
    (this.pendingProps = t),
    (this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null),
    (this.mode = r),
    (this.subtreeFlags = this.flags = 0),
    (this.deletions = null),
    (this.childLanes = this.lanes = 0),
    (this.alternate = null));
}
function Ze(e, t, n, r) {
  return new cy(e, t, n, r);
}
function Oa(e) {
  return ((e = e.prototype), !(!e || !e.isReactComponent));
}
function fy(e) {
  if (typeof e == "function") return Oa(e) ? 1 : 0;
  if (e != null) {
    if (((e = e.$$typeof), e === Ju)) return 11;
    if (e === Zu) return 14;
  }
  return 2;
}
function qt(e, t) {
  var n = e.alternate;
  return (
    n === null
      ? ((n = Ze(e.tag, t, e.key, e.mode)),
        (n.elementType = e.elementType),
        (n.type = e.type),
        (n.stateNode = e.stateNode),
        (n.alternate = e),
        (e.alternate = n))
      : ((n.pendingProps = t),
        (n.type = e.type),
        (n.flags = 0),
        (n.subtreeFlags = 0),
        (n.deletions = null)),
    (n.flags = e.flags & 14680064),
    (n.childLanes = e.childLanes),
    (n.lanes = e.lanes),
    (n.child = e.child),
    (n.memoizedProps = e.memoizedProps),
    (n.memoizedState = e.memoizedState),
    (n.updateQueue = e.updateQueue),
    (t = e.dependencies),
    (n.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }),
    (n.sibling = e.sibling),
    (n.index = e.index),
    (n.ref = e.ref),
    n
  );
}
function Xl(e, t, n, r, l, i) {
  var o = 2;
  if (((r = e), typeof e == "function")) Oa(e) && (o = 1);
  else if (typeof e == "string") o = 5;
  else
    e: switch (e) {
      case Rn:
        return hn(n.children, l, i, t);
      case qu:
        ((o = 8), (l |= 8));
        break;
      case jo:
        return ((e = Ze(12, n, t, l | 2)), (e.elementType = jo), (e.lanes = i), e);
      case Uo:
        return ((e = Ze(13, n, t, l)), (e.elementType = Uo), (e.lanes = i), e);
      case Vo:
        return ((e = Ze(19, n, t, l)), (e.elementType = Vo), (e.lanes = i), e);
      case Bf:
        return Bi(n, l, i, t);
      default:
        if (typeof e == "object" && e !== null)
          switch (e.$$typeof) {
            case Af:
              o = 10;
              break e;
            case Ff:
              o = 9;
              break e;
            case Ju:
              o = 11;
              break e;
            case Zu:
              o = 14;
              break e;
            case Ft:
              ((o = 16), (r = null));
              break e;
          }
        throw Error(I(130, e == null ? e : typeof e, ""));
    }
  return ((t = Ze(o, n, t, l)), (t.elementType = e), (t.type = r), (t.lanes = i), t);
}
function hn(e, t, n, r) {
  return ((e = Ze(7, e, r, t)), (e.lanes = n), e);
}
function Bi(e, t, n, r) {
  return (
    (e = Ze(22, e, r, t)),
    (e.elementType = Bf),
    (e.lanes = n),
    (e.stateNode = { isHidden: !1 }),
    e
  );
}
function xo(e, t, n) {
  return ((e = Ze(6, e, null, t)), (e.lanes = n), e);
}
function So(e, t, n) {
  return (
    (t = Ze(4, e.children !== null ? e.children : [], e.key, t)),
    (t.lanes = n),
    (t.stateNode = {
      containerInfo: e.containerInfo,
      pendingChildren: null,
      implementation: e.implementation,
    }),
    t
  );
}
function py(e, t, n, r, l) {
  ((this.tag = t),
    (this.containerInfo = e),
    (this.finishedWork = this.pingCache = this.current = this.pendingChildren = null),
    (this.timeoutHandle = -1),
    (this.callbackNode = this.pendingContext = this.context = null),
    (this.callbackPriority = 0),
    (this.eventTimes = to(0)),
    (this.expirationTimes = to(-1)),
    (this.entangledLanes =
      this.finishedLanes =
      this.mutableReadLanes =
      this.expiredLanes =
      this.pingedLanes =
      this.suspendedLanes =
      this.pendingLanes =
        0),
    (this.entanglements = to(0)),
    (this.identifierPrefix = r),
    (this.onRecoverableError = l),
    (this.mutableSourceEagerHydrationData = null));
}
function Da(e, t, n, r, l, i, o, u, a) {
  return (
    (e = new py(e, t, n, u, a)),
    t === 1 ? ((t = 1), i === !0 && (t |= 8)) : (t = 0),
    (i = Ze(3, null, null, t)),
    (e.current = i),
    (i.stateNode = e),
    (i.memoizedState = {
      element: r,
      isDehydrated: n,
      cache: null,
      transitions: null,
      pendingSuspenseBoundaries: null,
    }),
    ya(i),
    e
  );
}
function dy(e, t, n) {
  var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
  return {
    $$typeof: Ln,
    key: r == null ? null : "" + r,
    children: e,
    containerInfo: t,
    implementation: n,
  };
}
function Nd(e) {
  if (!e) return Zt;
  e = e._reactInternals;
  e: {
    if (Sn(e) !== e || e.tag !== 1) throw Error(I(170));
    var t = e;
    do {
      switch (t.tag) {
        case 3:
          t = t.stateNode.context;
          break e;
        case 1:
          if (Fe(t.type)) {
            t = t.stateNode.__reactInternalMemoizedMergedChildContext;
            break e;
          }
      }
      t = t.return;
    } while (t !== null);
    throw Error(I(171));
  }
  if (e.tag === 1) {
    var n = e.type;
    if (Fe(n)) return Np(e, n, t);
  }
  return t;
}
function zd(e, t, n, r, l, i, o, u, a) {
  return (
    (e = Da(n, r, !0, e, l, i, o, u, a)),
    (e.context = Nd(null)),
    (n = e.current),
    (r = ze()),
    (l = Gt(n)),
    (i = It(r, l)),
    (i.callback = t ?? null),
    Xt(n, i, l),
    (e.current.lanes = l),
    ol(e, l, r),
    Be(e, r),
    e
  );
}
function ji(e, t, n, r) {
  var l = t.current,
    i = ze(),
    o = Gt(l);
  return (
    (n = Nd(n)),
    t.context === null ? (t.context = n) : (t.pendingContext = n),
    (t = It(i, o)),
    (t.payload = { element: e }),
    (r = r === void 0 ? null : r),
    r !== null && (t.callback = r),
    (e = Xt(l, t, o)),
    e !== null && (ct(e, l, o, i), Hl(e, l, o)),
    o
  );
}
function Ei(e) {
  if (((e = e.current), !e.child)) return null;
  switch (e.child.tag) {
    case 5:
      return e.child.stateNode;
    default:
      return e.child.stateNode;
  }
}
function dc(e, t) {
  if (((e = e.memoizedState), e !== null && e.dehydrated !== null)) {
    var n = e.retryLane;
    e.retryLane = n !== 0 && n < t ? n : t;
  }
}
function Ma(e, t) {
  (dc(e, t), (e = e.alternate) && dc(e, t));
}
function hy() {
  return null;
}
var Ld = typeof reportError == "function" ? reportError : function (e) {};
function Aa(e) {
  this._internalRoot = e;
}
Ui.prototype.render = Aa.prototype.render = function (e) {
  var t = this._internalRoot;
  if (t === null) throw Error(I(409));
  ji(e, t, null, null);
};
Ui.prototype.unmount = Aa.prototype.unmount = function () {
  var e = this._internalRoot;
  if (e !== null) {
    this._internalRoot = null;
    var t = e.containerInfo;
    (wn(function () {
      ji(null, e, null, null);
    }),
      (t[zt] = null));
  }
};
function Ui(e) {
  this._internalRoot = e;
}
Ui.prototype.unstable_scheduleHydration = function (e) {
  if (e) {
    var t = ap();
    e = { blockedOn: null, target: e, priority: t };
    for (var n = 0; n < jt.length && t !== 0 && t < jt[n].priority; n++);
    (jt.splice(n, 0, e), n === 0 && cp(e));
  }
};
function Fa(e) {
  return !(!e || (e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11));
}
function Vi(e) {
  return !(
    !e ||
    (e.nodeType !== 1 &&
      e.nodeType !== 9 &&
      e.nodeType !== 11 &&
      (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "))
  );
}
function hc() {}
function my(e, t, n, r, l) {
  if (l) {
    if (typeof r == "function") {
      var i = r;
      r = function () {
        var s = Ei(o);
        i.call(s);
      };
    }
    var o = zd(t, r, e, 0, null, !1, !1, "", hc);
    return (
      (e._reactRootContainer = o),
      (e[zt] = o.current),
      Yr(e.nodeType === 8 ? e.parentNode : e),
      wn(),
      o
    );
  }
  for (; (l = e.lastChild); ) e.removeChild(l);
  if (typeof r == "function") {
    var u = r;
    r = function () {
      var s = Ei(a);
      u.call(s);
    };
  }
  var a = Da(e, 0, !1, null, null, !1, !1, "", hc);
  return (
    (e._reactRootContainer = a),
    (e[zt] = a.current),
    Yr(e.nodeType === 8 ? e.parentNode : e),
    wn(function () {
      ji(t, a, n, r);
    }),
    a
  );
}
function Hi(e, t, n, r, l) {
  var i = n._reactRootContainer;
  if (i) {
    var o = i;
    if (typeof l == "function") {
      var u = l;
      l = function () {
        var a = Ei(o);
        u.call(a);
      };
    }
    ji(t, o, e, l);
  } else o = my(n, t, e, l, r);
  return Ei(o);
}
op = function (e) {
  switch (e.tag) {
    case 3:
      var t = e.stateNode;
      if (t.current.memoizedState.isDehydrated) {
        var n = Pr(t.pendingLanes);
        n !== 0 && (na(t, n | 1), Be(t, fe()), !(Q & 6) && ((lr = fe() + 500), nn()));
      }
      break;
    case 13:
      (wn(function () {
        var r = Lt(e, 1);
        if (r !== null) {
          var l = ze();
          ct(r, e, 1, l);
        }
      }),
        Ma(e, 1));
  }
};
ra = function (e) {
  if (e.tag === 13) {
    var t = Lt(e, 134217728);
    if (t !== null) {
      var n = ze();
      ct(t, e, 134217728, n);
    }
    Ma(e, 134217728);
  }
};
up = function (e) {
  if (e.tag === 13) {
    var t = Gt(e),
      n = Lt(e, t);
    if (n !== null) {
      var r = ze();
      ct(n, e, t, r);
    }
    Ma(e, t);
  }
};
ap = function () {
  return K;
};
sp = function (e, t) {
  var n = K;
  try {
    return ((K = e), t());
  } finally {
    K = n;
  }
};
qo = function (e, t, n) {
  switch (t) {
    case "input":
      if ((Wo(e, n), (t = n.name), n.type === "radio" && t != null)) {
        for (n = e; n.parentNode; ) n = n.parentNode;
        for (
          n = n.querySelectorAll("input[name=" + JSON.stringify("" + t) + '][type="radio"]'), t = 0;
          t < n.length;
          t++
        ) {
          var r = n[t];
          if (r !== e && r.form === e.form) {
            var l = Ri(r);
            if (!l) throw Error(I(90));
            (Uf(r), Wo(r, l));
          }
        }
      }
      break;
    case "textarea":
      Hf(e, n);
      break;
    case "select":
      ((t = n.value), t != null && $n(e, !!n.multiple, t, !1));
  }
};
Kf = za;
Gf = wn;
var gy = { usingClientEntryPoint: !1, Events: [al, An, Ri, Yf, Xf, za] },
  wr = {
    findFiberByHostInstance: cn,
    bundleType: 0,
    version: "18.3.1",
    rendererPackageName: "react-dom",
  },
  yy = {
    bundleType: wr.bundleType,
    version: wr.version,
    rendererPackageName: wr.rendererPackageName,
    rendererConfig: wr.rendererConfig,
    overrideHookState: null,
    overrideHookStateDeletePath: null,
    overrideHookStateRenamePath: null,
    overrideProps: null,
    overridePropsDeletePath: null,
    overridePropsRenamePath: null,
    setErrorHandler: null,
    setSuspenseHandler: null,
    scheduleUpdate: null,
    currentDispatcherRef: Ot.ReactCurrentDispatcher,
    findHostInstanceByFiber: function (e) {
      return ((e = Zf(e)), e === null ? null : e.stateNode);
    },
    findFiberByHostInstance: wr.findFiberByHostInstance || hy,
    findHostInstancesForRefresh: null,
    scheduleRefresh: null,
    scheduleRoot: null,
    setRefreshHandler: null,
    getCurrentFiber: null,
    reconcilerVersion: "18.3.1-next-f1338f8080-20240426",
  };
if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
  var Ll = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!Ll.isDisabled && Ll.supportsFiber)
    try {
      ((Ii = Ll.inject(yy)), (kt = Ll));
    } catch {}
}
Xe.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = gy;
Xe.createPortal = function (e, t) {
  var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
  if (!Fa(t)) throw Error(I(200));
  return dy(e, t, null, n);
};
Xe.createRoot = function (e, t) {
  if (!Fa(e)) throw Error(I(299));
  var n = !1,
    r = "",
    l = Ld;
  return (
    t != null &&
      (t.unstable_strictMode === !0 && (n = !0),
      t.identifierPrefix !== void 0 && (r = t.identifierPrefix),
      t.onRecoverableError !== void 0 && (l = t.onRecoverableError)),
    (t = Da(e, 1, !1, null, null, n, !1, r, l)),
    (e[zt] = t.current),
    Yr(e.nodeType === 8 ? e.parentNode : e),
    new Aa(t)
  );
};
Xe.findDOMNode = function (e) {
  if (e == null) return null;
  if (e.nodeType === 1) return e;
  var t = e._reactInternals;
  if (t === void 0)
    throw typeof e.render == "function"
      ? Error(I(188))
      : ((e = Object.keys(e).join(",")), Error(I(268, e)));
  return ((e = Zf(t)), (e = e === null ? null : e.stateNode), e);
};
Xe.flushSync = function (e) {
  return wn(e);
};
Xe.hydrate = function (e, t, n) {
  if (!Vi(t)) throw Error(I(200));
  return Hi(null, e, t, !0, n);
};
Xe.hydrateRoot = function (e, t, n) {
  if (!Fa(e)) throw Error(I(405));
  var r = (n != null && n.hydratedSources) || null,
    l = !1,
    i = "",
    o = Ld;
  if (
    (n != null &&
      (n.unstable_strictMode === !0 && (l = !0),
      n.identifierPrefix !== void 0 && (i = n.identifierPrefix),
      n.onRecoverableError !== void 0 && (o = n.onRecoverableError)),
    (t = zd(t, null, e, 1, n ?? null, l, !1, i, o)),
    (e[zt] = t.current),
    Yr(e),
    r)
  )
    for (e = 0; e < r.length; e++)
      ((n = r[e]),
        (l = n._getVersion),
        (l = l(n._source)),
        t.mutableSourceEagerHydrationData == null
          ? (t.mutableSourceEagerHydrationData = [n, l])
          : t.mutableSourceEagerHydrationData.push(n, l));
  return new Ui(t);
};
Xe.render = function (e, t, n) {
  if (!Vi(t)) throw Error(I(200));
  return Hi(null, e, t, !1, n);
};
Xe.unmountComponentAtNode = function (e) {
  if (!Vi(e)) throw Error(I(40));
  return e._reactRootContainer
    ? (wn(function () {
        Hi(null, null, e, !1, function () {
          ((e._reactRootContainer = null), (e[zt] = null));
        });
      }),
      !0)
    : !1;
};
Xe.unstable_batchedUpdates = za;
Xe.unstable_renderSubtreeIntoContainer = function (e, t, n, r) {
  if (!Vi(n)) throw Error(I(200));
  if (e == null || e._reactInternals === void 0) throw Error(I(38));
  return Hi(e, t, n, !1, r);
};
Xe.version = "18.3.1-next-f1338f8080-20240426";
function Rd() {
  if (
    !(
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" ||
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"
    )
  )
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Rd);
    } catch {}
}
(Rd(), (Rf.exports = Xe));
var Od = Rf.exports;
const Fx = _i(Od);
var vy,
  mc = Od;
((vy = mc.createRoot), mc.hydrateRoot);
/**
 * @remix-run/router v1.23.2
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */ function nl() {
  return (
    (nl = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n) Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
          }
          return e;
        }),
    nl.apply(this, arguments)
  );
}
var $t;
(function (e) {
  ((e.Pop = "POP"), (e.Push = "PUSH"), (e.Replace = "REPLACE"));
})($t || ($t = {}));
const gc = "popstate";
function ky(e) {
  e === void 0 && (e = {});
  function t(r, l) {
    let { pathname: i, search: o, hash: u } = r.location;
    return zu(
      "",
      { pathname: i, search: o, hash: u },
      (l.state && l.state.usr) || null,
      (l.state && l.state.key) || "default",
    );
  }
  function n(r, l) {
    return typeof l == "string" ? l : Dd(l);
  }
  return xy(t, n, null, e);
}
function me(e, t) {
  if (e === !1 || e === null || typeof e > "u") throw new Error(t);
}
function Ba(e, t) {
  if (!e)
    try {
      throw new Error(t);
    } catch {}
}
function wy() {
  return Math.random().toString(36).substr(2, 8);
}
function yc(e, t) {
  return { usr: e.state, key: e.key, idx: t };
}
function zu(e, t, n, r) {
  return (
    n === void 0 && (n = null),
    nl(
      { pathname: typeof e == "string" ? e : e.pathname, search: "", hash: "" },
      typeof t == "string" ? ar(t) : t,
      { state: n, key: (t && t.key) || r || wy() },
    )
  );
}
function Dd(e) {
  let { pathname: t = "/", search: n = "", hash: r = "" } = e;
  return (
    n && n !== "?" && (t += n.charAt(0) === "?" ? n : "?" + n),
    r && r !== "#" && (t += r.charAt(0) === "#" ? r : "#" + r),
    t
  );
}
function ar(e) {
  let t = {};
  if (e) {
    let n = e.indexOf("#");
    n >= 0 && ((t.hash = e.substr(n)), (e = e.substr(0, n)));
    let r = e.indexOf("?");
    (r >= 0 && ((t.search = e.substr(r)), (e = e.substr(0, r))), e && (t.pathname = e));
  }
  return t;
}
function xy(e, t, n, r) {
  r === void 0 && (r = {});
  let { window: l = document.defaultView, v5Compat: i = !1 } = r,
    o = l.history,
    u = $t.Pop,
    a = null,
    s = c();
  s == null && ((s = 0), o.replaceState(nl({}, o.state, { idx: s }), ""));
  function c() {
    return (o.state || { idx: null }).idx;
  }
  function f() {
    u = $t.Pop;
    let S = c(),
      h = S == null ? null : S - s;
    ((s = S), a && a({ action: u, location: v.location, delta: h }));
  }
  function d(S, h) {
    u = $t.Push;
    let m = zu(v.location, S, h);
    s = c() + 1;
    let y = yc(m, s),
      E = v.createHref(m);
    try {
      o.pushState(y, "", E);
    } catch (P) {
      if (P instanceof DOMException && P.name === "DataCloneError") throw P;
      l.location.assign(E);
    }
    i && a && a({ action: u, location: v.location, delta: 1 });
  }
  function p(S, h) {
    u = $t.Replace;
    let m = zu(v.location, S, h);
    s = c();
    let y = yc(m, s),
      E = v.createHref(m);
    (o.replaceState(y, "", E), i && a && a({ action: u, location: v.location, delta: 0 }));
  }
  function w(S) {
    let h = l.location.origin !== "null" ? l.location.origin : l.location.href,
      m = typeof S == "string" ? S : Dd(S);
    return (
      (m = m.replace(/ $/, "%20")),
      me(h, "No window.location.(origin|href) available to create URL for href: " + m),
      new URL(m, h)
    );
  }
  let v = {
    get action() {
      return u;
    },
    get location() {
      return e(l, o);
    },
    listen(S) {
      if (a) throw new Error("A history only accepts one active listener");
      return (
        l.addEventListener(gc, f),
        (a = S),
        () => {
          (l.removeEventListener(gc, f), (a = null));
        }
      );
    },
    createHref(S) {
      return t(l, S);
    },
    createURL: w,
    encodeLocation(S) {
      let h = w(S);
      return { pathname: h.pathname, search: h.search, hash: h.hash };
    },
    push: d,
    replace: p,
    go(S) {
      return o.go(S);
    },
  };
  return v;
}
var vc;
(function (e) {
  ((e.data = "data"), (e.deferred = "deferred"), (e.redirect = "redirect"), (e.error = "error"));
})(vc || (vc = {}));
function Sy(e, t, n) {
  return (n === void 0 && (n = "/"), Ey(e, t, n));
}
function Ey(e, t, n, r) {
  let l = typeof t == "string" ? ar(t) : t,
    i = Fd(l.pathname || "/", n);
  if (i == null) return null;
  let o = Md(e);
  Cy(o);
  let u = null;
  for (let a = 0; u == null && a < o.length; ++a) {
    let s = Ay(i);
    u = Oy(o[a], s);
  }
  return u;
}
function Md(e, t, n, r) {
  (t === void 0 && (t = []), n === void 0 && (n = []), r === void 0 && (r = ""));
  let l = (i, o, u) => {
    let a = {
      relativePath: u === void 0 ? i.path || "" : u,
      caseSensitive: i.caseSensitive === !0,
      childrenIndex: o,
      route: i,
    };
    a.relativePath.startsWith("/") &&
      (me(
        a.relativePath.startsWith(r),
        'Absolute route path "' +
          a.relativePath +
          '" nested under path ' +
          ('"' + r + '" is not valid. An absolute child route path ') +
          "must start with the combined path of all its parent routes.",
      ),
      (a.relativePath = a.relativePath.slice(r.length)));
    let s = mn([r, a.relativePath]),
      c = n.concat(a);
    (i.children &&
      i.children.length > 0 &&
      (me(
        i.index !== !0,
        "Index routes must not have child routes. Please remove " +
          ('all child routes from route path "' + s + '".'),
      ),
      Md(i.children, t, c, s)),
      !(i.path == null && !i.index) && t.push({ path: s, score: Ly(s, i.index), routesMeta: c }));
  };
  return (
    e.forEach((i, o) => {
      var u;
      if (i.path === "" || !((u = i.path) != null && u.includes("?"))) l(i, o);
      else for (let a of Ad(i.path)) l(i, o, a);
    }),
    t
  );
}
function Ad(e) {
  let t = e.split("/");
  if (t.length === 0) return [];
  let [n, ...r] = t,
    l = n.endsWith("?"),
    i = n.replace(/\?$/, "");
  if (r.length === 0) return l ? [i, ""] : [i];
  let o = Ad(r.join("/")),
    u = [];
  return (
    u.push(...o.map((a) => (a === "" ? i : [i, a].join("/")))),
    l && u.push(...o),
    u.map((a) => (e.startsWith("/") && a === "" ? "/" : a))
  );
}
function Cy(e) {
  e.sort((t, n) =>
    t.score !== n.score
      ? n.score - t.score
      : Ry(
          t.routesMeta.map((r) => r.childrenIndex),
          n.routesMeta.map((r) => r.childrenIndex),
        ),
  );
}
const Py = /^:[\w-]+$/,
  _y = 3,
  Ty = 2,
  Iy = 1,
  Ny = 10,
  zy = -2,
  kc = (e) => e === "*";
function Ly(e, t) {
  let n = e.split("/"),
    r = n.length;
  return (
    n.some(kc) && (r += zy),
    t && (r += Ty),
    n.filter((l) => !kc(l)).reduce((l, i) => l + (Py.test(i) ? _y : i === "" ? Iy : Ny), r)
  );
}
function Ry(e, t) {
  return e.length === t.length && e.slice(0, -1).every((r, l) => r === t[l])
    ? e[e.length - 1] - t[t.length - 1]
    : 0;
}
function Oy(e, t, n) {
  let { routesMeta: r } = e,
    l = {},
    i = "/",
    o = [];
  for (let u = 0; u < r.length; ++u) {
    let a = r[u],
      s = u === r.length - 1,
      c = i === "/" ? t : t.slice(i.length) || "/",
      f = Dy({ path: a.relativePath, caseSensitive: a.caseSensitive, end: s }, c),
      d = a.route;
    if (!f) return null;
    (Object.assign(l, f.params),
      o.push({
        params: l,
        pathname: mn([i, f.pathname]),
        pathnameBase: Vy(mn([i, f.pathnameBase])),
        route: d,
      }),
      f.pathnameBase !== "/" && (i = mn([i, f.pathnameBase])));
  }
  return o;
}
function Dy(e, t) {
  typeof e == "string" && (e = { path: e, caseSensitive: !1, end: !0 });
  let [n, r] = My(e.path, e.caseSensitive, e.end),
    l = t.match(n);
  if (!l) return null;
  let i = l[0],
    o = i.replace(/(.)\/+$/, "$1"),
    u = l.slice(1);
  return {
    params: r.reduce((s, c, f) => {
      let { paramName: d, isOptional: p } = c;
      if (d === "*") {
        let v = u[f] || "";
        o = i.slice(0, i.length - v.length).replace(/(.)\/+$/, "$1");
      }
      const w = u[f];
      return (p && !w ? (s[d] = void 0) : (s[d] = (w || "").replace(/%2F/g, "/")), s);
    }, {}),
    pathname: i,
    pathnameBase: o,
    pattern: e,
  };
}
function My(e, t, n) {
  (t === void 0 && (t = !1),
    n === void 0 && (n = !0),
    Ba(
      e === "*" || !e.endsWith("*") || e.endsWith("/*"),
      'Route path "' +
        e +
        '" will be treated as if it were ' +
        ('"' + e.replace(/\*$/, "/*") + '" because the `*` character must ') +
        "always follow a `/` in the pattern. To get rid of this warning, " +
        ('please change the route path to "' + e.replace(/\*$/, "/*") + '".'),
    ));
  let r = [],
    l =
      "^" +
      e
        .replace(/\/*\*?$/, "")
        .replace(/^\/*/, "/")
        .replace(/[\\.*+^${}|()[\]]/g, "\\$&")
        .replace(
          /\/:([\w-]+)(\?)?/g,
          (o, u, a) => (
            r.push({ paramName: u, isOptional: a != null }),
            a ? "/?([^\\/]+)?" : "/([^\\/]+)"
          ),
        );
  return (
    e.endsWith("*")
      ? (r.push({ paramName: "*" }), (l += e === "*" || e === "/*" ? "(.*)$" : "(?:\\/(.+)|\\/*)$"))
      : n
        ? (l += "\\/*$")
        : e !== "" && e !== "/" && (l += "(?:(?=\\/|$))"),
    [new RegExp(l, t ? void 0 : "i"), r]
  );
}
function Ay(e) {
  try {
    return e
      .split("/")
      .map((t) => decodeURIComponent(t).replace(/\//g, "%2F"))
      .join("/");
  } catch (t) {
    return (
      Ba(
        !1,
        'The URL path "' +
          e +
          '" could not be decoded because it is is a malformed URL segment. This is probably due to a bad percent ' +
          ("encoding (" + t + ")."),
      ),
      e
    );
  }
}
function Fd(e, t) {
  if (t === "/") return e;
  if (!e.toLowerCase().startsWith(t.toLowerCase())) return null;
  let n = t.endsWith("/") ? t.length - 1 : t.length,
    r = e.charAt(n);
  return r && r !== "/" ? null : e.slice(n) || "/";
}
const Fy = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,
  By = (e) => Fy.test(e);
function jy(e, t) {
  t === void 0 && (t = "/");
  let { pathname: n, search: r = "", hash: l = "" } = typeof e == "string" ? ar(e) : e,
    i;
  if (n)
    if (By(n)) i = n;
    else {
      if (n.includes("//")) {
        let o = n;
        ((n = n.replace(/\/\/+/g, "/")),
          Ba(
            !1,
            "Pathnames cannot have embedded double slashes - normalizing " + (o + " -> " + n),
          ));
      }
      n.startsWith("/") ? (i = wc(n.substring(1), "/")) : (i = wc(n, t));
    }
  else i = t;
  return { pathname: i, search: Hy(r), hash: $y(l) };
}
function wc(e, t) {
  let n = t.replace(/\/+$/, "").split("/");
  return (
    e.split("/").forEach((l) => {
      l === ".." ? n.length > 1 && n.pop() : l !== "." && n.push(l);
    }),
    n.length > 1 ? n.join("/") : "/"
  );
}
function Eo(e, t, n, r) {
  return (
    "Cannot include a '" +
    e +
    "' character in a manually specified " +
    ("`to." + t + "` field [" + JSON.stringify(r) + "].  Please separate it out to the ") +
    ("`to." + n + "` field. Alternatively you may provide the full path as ") +
    'a string in <Link to="..."> and the router will parse it for you.'
  );
}
function Uy(e) {
  return e.filter((t, n) => n === 0 || (t.route.path && t.route.path.length > 0));
}
function Bd(e, t) {
  let n = Uy(e);
  return t
    ? n.map((r, l) => (l === n.length - 1 ? r.pathname : r.pathnameBase))
    : n.map((r) => r.pathnameBase);
}
function jd(e, t, n, r) {
  r === void 0 && (r = !1);
  let l;
  typeof e == "string"
    ? (l = ar(e))
    : ((l = nl({}, e)),
      me(!l.pathname || !l.pathname.includes("?"), Eo("?", "pathname", "search", l)),
      me(!l.pathname || !l.pathname.includes("#"), Eo("#", "pathname", "hash", l)),
      me(!l.search || !l.search.includes("#"), Eo("#", "search", "hash", l)));
  let i = e === "" || l.pathname === "",
    o = i ? "/" : l.pathname,
    u;
  if (o == null) u = n;
  else {
    let f = t.length - 1;
    if (!r && o.startsWith("..")) {
      let d = o.split("/");
      for (; d[0] === ".."; ) (d.shift(), (f -= 1));
      l.pathname = d.join("/");
    }
    u = f >= 0 ? t[f] : "/";
  }
  let a = jy(l, u),
    s = o && o !== "/" && o.endsWith("/"),
    c = (i || o === ".") && n.endsWith("/");
  return (!a.pathname.endsWith("/") && (s || c) && (a.pathname += "/"), a);
}
const mn = (e) => e.join("/").replace(/\/\/+/g, "/"),
  Vy = (e) => e.replace(/\/+$/, "").replace(/^\/*/, "/"),
  Hy = (e) => (!e || e === "?" ? "" : e.startsWith("?") ? e : "?" + e),
  $y = (e) => (!e || e === "#" ? "" : e.startsWith("#") ? e : "#" + e);
function Wy(e) {
  return (
    e != null &&
    typeof e.status == "number" &&
    typeof e.statusText == "string" &&
    typeof e.internal == "boolean" &&
    "data" in e
  );
}
const Ud = ["post", "put", "patch", "delete"];
new Set(Ud);
const by = ["get", ...Ud];
new Set(by);
/**
 * React Router v6.30.3
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */ function rl() {
  return (
    (rl = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n) Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
          }
          return e;
        }),
    rl.apply(this, arguments)
  );
}
const ja = _.createContext(null),
  Qy = _.createContext(null),
  cl = _.createContext(null),
  $i = _.createContext(null),
  rn = _.createContext({ outlet: null, matches: [], isDataRoute: !1 }),
  Vd = _.createContext(null);
function fl() {
  return _.useContext($i) != null;
}
function Ua() {
  return (fl() || me(!1), _.useContext($i).location);
}
function Hd(e) {
  _.useContext(cl).static || _.useLayoutEffect(e);
}
function Yy() {
  let { isDataRoute: e } = _.useContext(rn);
  return e ? ov() : Xy();
}
function Xy() {
  fl() || me(!1);
  let e = _.useContext(ja),
    { basename: t, future: n, navigator: r } = _.useContext(cl),
    { matches: l } = _.useContext(rn),
    { pathname: i } = Ua(),
    o = JSON.stringify(Bd(l, n.v7_relativeSplatPath)),
    u = _.useRef(!1);
  return (
    Hd(() => {
      u.current = !0;
    }),
    _.useCallback(
      function (s, c) {
        if ((c === void 0 && (c = {}), !u.current)) return;
        if (typeof s == "number") {
          r.go(s);
          return;
        }
        let f = jd(s, JSON.parse(o), i, c.relative === "path");
        (e == null && t !== "/" && (f.pathname = f.pathname === "/" ? t : mn([t, f.pathname])),
          (c.replace ? r.replace : r.push)(f, c.state, c));
      },
      [t, r, o, i, e],
    )
  );
}
function Bx() {
  let { matches: e } = _.useContext(rn),
    t = e[e.length - 1];
  return t ? t.params : {};
}
function Ky(e, t) {
  return Gy(e, t);
}
function Gy(e, t, n, r) {
  fl() || me(!1);
  let { navigator: l } = _.useContext(cl),
    { matches: i } = _.useContext(rn),
    o = i[i.length - 1],
    u = o ? o.params : {};
  o && o.pathname;
  let a = o ? o.pathnameBase : "/";
  o && o.route;
  let s = Ua(),
    c;
  if (t) {
    var f;
    let S = typeof t == "string" ? ar(t) : t;
    (a === "/" || ((f = S.pathname) != null && f.startsWith(a)) || me(!1), (c = S));
  } else c = s;
  let d = c.pathname || "/",
    p = d;
  if (a !== "/") {
    let S = a.replace(/^\//, "").split("/");
    p = "/" + d.replace(/^\//, "").split("/").slice(S.length).join("/");
  }
  let w = Sy(e, { pathname: p }),
    v = tv(
      w &&
        w.map((S) =>
          Object.assign({}, S, {
            params: Object.assign({}, u, S.params),
            pathname: mn([
              a,
              l.encodeLocation ? l.encodeLocation(S.pathname).pathname : S.pathname,
            ]),
            pathnameBase:
              S.pathnameBase === "/"
                ? a
                : mn([
                    a,
                    l.encodeLocation ? l.encodeLocation(S.pathnameBase).pathname : S.pathnameBase,
                  ]),
          }),
        ),
      i,
      n,
      r,
    );
  return t && v
    ? _.createElement(
        $i.Provider,
        {
          value: {
            location: rl({ pathname: "/", search: "", hash: "", state: null, key: "default" }, c),
            navigationType: $t.Pop,
          },
        },
        v,
      )
    : v;
}
function qy() {
  let e = iv(),
    t = Wy(e) ? e.status + " " + e.statusText : e instanceof Error ? e.message : JSON.stringify(e),
    n = e instanceof Error ? e.stack : null,
    l = { padding: "0.5rem", backgroundColor: "rgba(200,200,200, 0.5)" };
  return _.createElement(
    _.Fragment,
    null,
    _.createElement("h2", null, "Unexpected Application Error!"),
    _.createElement("h3", { style: { fontStyle: "italic" } }, t),
    n ? _.createElement("pre", { style: l }, n) : null,
    null,
  );
}
const Jy = _.createElement(qy, null);
class Zy extends _.Component {
  constructor(t) {
    (super(t),
      (this.state = { location: t.location, revalidation: t.revalidation, error: t.error }));
  }
  static getDerivedStateFromError(t) {
    return { error: t };
  }
  static getDerivedStateFromProps(t, n) {
    return n.location !== t.location || (n.revalidation !== "idle" && t.revalidation === "idle")
      ? { error: t.error, location: t.location, revalidation: t.revalidation }
      : {
          error: t.error !== void 0 ? t.error : n.error,
          location: n.location,
          revalidation: t.revalidation || n.revalidation,
        };
  }
  componentDidCatch(t, n) {}
  render() {
    return this.state.error !== void 0
      ? _.createElement(
          rn.Provider,
          { value: this.props.routeContext },
          _.createElement(Vd.Provider, { value: this.state.error, children: this.props.component }),
        )
      : this.props.children;
  }
}
function ev(e) {
  let { routeContext: t, match: n, children: r } = e,
    l = _.useContext(ja);
  return (
    l &&
      l.static &&
      l.staticContext &&
      (n.route.errorElement || n.route.ErrorBoundary) &&
      (l.staticContext._deepestRenderedBoundaryId = n.route.id),
    _.createElement(rn.Provider, { value: t }, r)
  );
}
function tv(e, t, n, r) {
  var l;
  if (
    (t === void 0 && (t = []), n === void 0 && (n = null), r === void 0 && (r = null), e == null)
  ) {
    var i;
    if (!n) return null;
    if (n.errors) e = n.matches;
    else if (
      (i = r) != null &&
      i.v7_partialHydration &&
      t.length === 0 &&
      !n.initialized &&
      n.matches.length > 0
    )
      e = n.matches;
    else return null;
  }
  let o = e,
    u = (l = n) == null ? void 0 : l.errors;
  if (u != null) {
    let c = o.findIndex((f) => f.route.id && (u == null ? void 0 : u[f.route.id]) !== void 0);
    (c >= 0 || me(!1), (o = o.slice(0, Math.min(o.length, c + 1))));
  }
  let a = !1,
    s = -1;
  if (n && r && r.v7_partialHydration)
    for (let c = 0; c < o.length; c++) {
      let f = o[c];
      if (((f.route.HydrateFallback || f.route.hydrateFallbackElement) && (s = c), f.route.id)) {
        let { loaderData: d, errors: p } = n,
          w = f.route.loader && d[f.route.id] === void 0 && (!p || p[f.route.id] === void 0);
        if (f.route.lazy || w) {
          ((a = !0), s >= 0 ? (o = o.slice(0, s + 1)) : (o = [o[0]]));
          break;
        }
      }
    }
  return o.reduceRight((c, f, d) => {
    let p,
      w = !1,
      v = null,
      S = null;
    n &&
      ((p = u && f.route.id ? u[f.route.id] : void 0),
      (v = f.route.errorElement || Jy),
      a &&
        (s < 0 && d === 0
          ? (uv("route-fallback"), (w = !0), (S = null))
          : s === d && ((w = !0), (S = f.route.hydrateFallbackElement || null))));
    let h = t.concat(o.slice(0, d + 1)),
      m = () => {
        let y;
        return (
          p
            ? (y = v)
            : w
              ? (y = S)
              : f.route.Component
                ? (y = _.createElement(f.route.Component, null))
                : f.route.element
                  ? (y = f.route.element)
                  : (y = c),
          _.createElement(ev, {
            match: f,
            routeContext: { outlet: c, matches: h, isDataRoute: n != null },
            children: y,
          })
        );
      };
    return n && (f.route.ErrorBoundary || f.route.errorElement || d === 0)
      ? _.createElement(Zy, {
          location: n.location,
          revalidation: n.revalidation,
          component: v,
          error: p,
          children: m(),
          routeContext: { outlet: null, matches: h, isDataRoute: !0 },
        })
      : m();
  }, null);
}
var $d = (function (e) {
    return (
      (e.UseBlocker = "useBlocker"),
      (e.UseRevalidator = "useRevalidator"),
      (e.UseNavigateStable = "useNavigate"),
      e
    );
  })($d || {}),
  Wd = (function (e) {
    return (
      (e.UseBlocker = "useBlocker"),
      (e.UseLoaderData = "useLoaderData"),
      (e.UseActionData = "useActionData"),
      (e.UseRouteError = "useRouteError"),
      (e.UseNavigation = "useNavigation"),
      (e.UseRouteLoaderData = "useRouteLoaderData"),
      (e.UseMatches = "useMatches"),
      (e.UseRevalidator = "useRevalidator"),
      (e.UseNavigateStable = "useNavigate"),
      (e.UseRouteId = "useRouteId"),
      e
    );
  })(Wd || {});
function nv(e) {
  let t = _.useContext(ja);
  return (t || me(!1), t);
}
function rv(e) {
  let t = _.useContext(Qy);
  return (t || me(!1), t);
}
function lv(e) {
  let t = _.useContext(rn);
  return (t || me(!1), t);
}
function bd(e) {
  let t = lv(),
    n = t.matches[t.matches.length - 1];
  return (n.route.id || me(!1), n.route.id);
}
function iv() {
  var e;
  let t = _.useContext(Vd),
    n = rv(),
    r = bd();
  return t !== void 0 ? t : (e = n.errors) == null ? void 0 : e[r];
}
function ov() {
  let { router: e } = nv($d.UseNavigateStable),
    t = bd(Wd.UseNavigateStable),
    n = _.useRef(!1);
  return (
    Hd(() => {
      n.current = !0;
    }),
    _.useCallback(
      function (l, i) {
        (i === void 0 && (i = {}),
          n.current &&
            (typeof l == "number" ? e.navigate(l) : e.navigate(l, rl({ fromRouteId: t }, i))));
      },
      [e, t],
    )
  );
}
const xc = {};
function uv(e, t, n) {
  xc[e] || (xc[e] = !0);
}
function av(e, t) {
  (e == null || e.v7_startTransition, e == null || e.v7_relativeSplatPath);
}
function jx(e) {
  let { to: t, replace: n, state: r, relative: l } = e;
  fl() || me(!1);
  let { future: i, static: o } = _.useContext(cl),
    { matches: u } = _.useContext(rn),
    { pathname: a } = Ua(),
    s = Yy(),
    c = jd(t, Bd(u, i.v7_relativeSplatPath), a, l === "path"),
    f = JSON.stringify(c);
  return (
    _.useEffect(() => s(JSON.parse(f), { replace: n, state: r, relative: l }), [s, f, l, n, r]),
    null
  );
}
function sv(e) {
  me(!1);
}
function cv(e) {
  let {
    basename: t = "/",
    children: n = null,
    location: r,
    navigationType: l = $t.Pop,
    navigator: i,
    static: o = !1,
    future: u,
  } = e;
  fl() && me(!1);
  let a = t.replace(/^\/*/, "/"),
    s = _.useMemo(
      () => ({ basename: a, navigator: i, static: o, future: rl({ v7_relativeSplatPath: !1 }, u) }),
      [a, u, i, o],
    );
  typeof r == "string" && (r = ar(r));
  let { pathname: c = "/", search: f = "", hash: d = "", state: p = null, key: w = "default" } = r,
    v = _.useMemo(() => {
      let S = Fd(c, a);
      return S == null
        ? null
        : { location: { pathname: S, search: f, hash: d, state: p, key: w }, navigationType: l };
    }, [a, c, f, d, p, w, l]);
  return v == null
    ? null
    : _.createElement(
        cl.Provider,
        { value: s },
        _.createElement($i.Provider, { children: n, value: v }),
      );
}
function Ux(e) {
  let { children: t, location: n } = e;
  return Ky(Lu(t), n);
}
new Promise(() => {});
function Lu(e, t) {
  t === void 0 && (t = []);
  let n = [];
  return (
    _.Children.forEach(e, (r, l) => {
      if (!_.isValidElement(r)) return;
      let i = [...t, l];
      if (r.type === _.Fragment) {
        n.push.apply(n, Lu(r.props.children, i));
        return;
      }
      (r.type !== sv && me(!1), !r.props.index || !r.props.children || me(!1));
      let o = {
        id: r.props.id || i.join("-"),
        caseSensitive: r.props.caseSensitive,
        element: r.props.element,
        Component: r.props.Component,
        index: r.props.index,
        path: r.props.path,
        loader: r.props.loader,
        action: r.props.action,
        errorElement: r.props.errorElement,
        ErrorBoundary: r.props.ErrorBoundary,
        hasErrorBoundary: r.props.ErrorBoundary != null || r.props.errorElement != null,
        shouldRevalidate: r.props.shouldRevalidate,
        handle: r.props.handle,
        lazy: r.props.lazy,
      };
      (r.props.children && (o.children = Lu(r.props.children, i)), n.push(o));
    }),
    n
  );
}
/**
 * React Router DOM v6.30.3
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */ const fv = "6";
try {
  window.__reactRouterVersion = fv;
} catch {}
const pv = "startTransition",
  Sc = um[pv];
function Vx(e) {
  let { basename: t, children: n, future: r, window: l } = e,
    i = _.useRef();
  i.current == null && (i.current = ky({ window: l, v5Compat: !0 }));
  let o = i.current,
    [u, a] = _.useState({ action: o.action, location: o.location }),
    { v7_startTransition: s } = r || {},
    c = _.useCallback(
      (f) => {
        s && Sc ? Sc(() => a(f)) : a(f);
      },
      [a, s],
    );
  return (
    _.useLayoutEffect(() => o.listen(c), [o, c]),
    _.useEffect(() => av(r), [r]),
    _.createElement(cv, {
      basename: t,
      children: n,
      location: u.location,
      navigationType: u.action,
      navigator: o,
      future: r,
    })
  );
}
var Ec;
(function (e) {
  ((e.UseScrollRestoration = "useScrollRestoration"),
    (e.UseSubmit = "useSubmit"),
    (e.UseSubmitFetcher = "useSubmitFetcher"),
    (e.UseFetcher = "useFetcher"),
    (e.useViewTransitionState = "useViewTransitionState"));
})(Ec || (Ec = {}));
var Cc;
(function (e) {
  ((e.UseFetcher = "useFetcher"),
    (e.UseFetchers = "useFetchers"),
    (e.UseScrollRestoration = "useScrollRestoration"));
})(Cc || (Cc = {}));
function Hx() {}
function $x(e) {
  const t = [],
    n = String(e || "");
  let r = n.indexOf(","),
    l = 0,
    i = !1;
  for (; !i; ) {
    r === -1 && ((r = n.length), (i = !0));
    const o = n.slice(l, r).trim();
    ((o || !i) && t.push(o), (l = r + 1), (r = n.indexOf(",", l)));
  }
  return t;
}
function dv(e, t) {
  const n = {};
  return (e[e.length - 1] === "" ? [...e, ""] : e)
    .join((n.padRight ? " " : "") + "," + (n.padLeft === !1 ? "" : " "))
    .trim();
}
const hv = /^[$_\p{ID_Start}][$_\u{200C}\u{200D}\p{ID_Continue}]*$/u,
  mv = /^[$_\p{ID_Start}][-$_\u{200C}\u{200D}\p{ID_Continue}]*$/u,
  gv = {};
function Pc(e, t) {
  return (gv.jsx ? mv : hv).test(e);
}
const yv = /[ \t\n\f\r]/g;
function vv(e) {
  return typeof e == "object" ? (e.type === "text" ? _c(e.value) : !1) : _c(e);
}
function _c(e) {
  return e.replace(yv, "") === "";
}
class pl {
  constructor(t, n, r) {
    ((this.normal = n), (this.property = t), r && (this.space = r));
  }
}
pl.prototype.normal = {};
pl.prototype.property = {};
pl.prototype.space = void 0;
function Qd(e, t) {
  const n = {},
    r = {};
  for (const l of e) (Object.assign(n, l.property), Object.assign(r, l.normal));
  return new pl(n, r, t);
}
function Ru(e) {
  return e.toLowerCase();
}
class Ue {
  constructor(t, n) {
    ((this.attribute = n), (this.property = t));
  }
}
Ue.prototype.attribute = "";
Ue.prototype.booleanish = !1;
Ue.prototype.boolean = !1;
Ue.prototype.commaOrSpaceSeparated = !1;
Ue.prototype.commaSeparated = !1;
Ue.prototype.defined = !1;
Ue.prototype.mustUseProperty = !1;
Ue.prototype.number = !1;
Ue.prototype.overloadedBoolean = !1;
Ue.prototype.property = "";
Ue.prototype.spaceSeparated = !1;
Ue.prototype.space = void 0;
let kv = 0;
const V = En(),
  de = En(),
  Ou = En(),
  N = En(),
  J = En(),
  Kn = En(),
  He = En();
function En() {
  return 2 ** ++kv;
}
const Du = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        boolean: V,
        booleanish: de,
        commaOrSpaceSeparated: He,
        commaSeparated: Kn,
        number: N,
        overloadedBoolean: Ou,
        spaceSeparated: J,
      },
      Symbol.toStringTag,
      { value: "Module" },
    ),
  ),
  Co = Object.keys(Du);
class Va extends Ue {
  constructor(t, n, r, l) {
    let i = -1;
    if ((super(t, n), Tc(this, "space", l), typeof r == "number"))
      for (; ++i < Co.length; ) {
        const o = Co[i];
        Tc(this, Co[i], (r & Du[o]) === Du[o]);
      }
  }
}
Va.prototype.defined = !0;
function Tc(e, t, n) {
  n && (e[t] = n);
}
function sr(e) {
  const t = {},
    n = {};
  for (const [r, l] of Object.entries(e.properties)) {
    const i = new Va(r, e.transform(e.attributes || {}, r), l, e.space);
    (e.mustUseProperty && e.mustUseProperty.includes(r) && (i.mustUseProperty = !0),
      (t[r] = i),
      (n[Ru(r)] = r),
      (n[Ru(i.attribute)] = r));
  }
  return new pl(t, n, e.space);
}
const Yd = sr({
  properties: {
    ariaActiveDescendant: null,
    ariaAtomic: de,
    ariaAutoComplete: null,
    ariaBusy: de,
    ariaChecked: de,
    ariaColCount: N,
    ariaColIndex: N,
    ariaColSpan: N,
    ariaControls: J,
    ariaCurrent: null,
    ariaDescribedBy: J,
    ariaDetails: null,
    ariaDisabled: de,
    ariaDropEffect: J,
    ariaErrorMessage: null,
    ariaExpanded: de,
    ariaFlowTo: J,
    ariaGrabbed: de,
    ariaHasPopup: null,
    ariaHidden: de,
    ariaInvalid: null,
    ariaKeyShortcuts: null,
    ariaLabel: null,
    ariaLabelledBy: J,
    ariaLevel: N,
    ariaLive: null,
    ariaModal: de,
    ariaMultiLine: de,
    ariaMultiSelectable: de,
    ariaOrientation: null,
    ariaOwns: J,
    ariaPlaceholder: null,
    ariaPosInSet: N,
    ariaPressed: de,
    ariaReadOnly: de,
    ariaRelevant: null,
    ariaRequired: de,
    ariaRoleDescription: J,
    ariaRowCount: N,
    ariaRowIndex: N,
    ariaRowSpan: N,
    ariaSelected: de,
    ariaSetSize: N,
    ariaSort: null,
    ariaValueMax: N,
    ariaValueMin: N,
    ariaValueNow: N,
    ariaValueText: null,
    role: null,
  },
  transform(e, t) {
    return t === "role" ? t : "aria-" + t.slice(4).toLowerCase();
  },
});
function Xd(e, t) {
  return t in e ? e[t] : t;
}
function Kd(e, t) {
  return Xd(e, t.toLowerCase());
}
const wv = sr({
    attributes: {
      acceptcharset: "accept-charset",
      classname: "class",
      htmlfor: "for",
      httpequiv: "http-equiv",
    },
    mustUseProperty: ["checked", "multiple", "muted", "selected"],
    properties: {
      abbr: null,
      accept: Kn,
      acceptCharset: J,
      accessKey: J,
      action: null,
      allow: null,
      allowFullScreen: V,
      allowPaymentRequest: V,
      allowUserMedia: V,
      alt: null,
      as: null,
      async: V,
      autoCapitalize: null,
      autoComplete: J,
      autoFocus: V,
      autoPlay: V,
      blocking: J,
      capture: null,
      charSet: null,
      checked: V,
      cite: null,
      className: J,
      cols: N,
      colSpan: null,
      content: null,
      contentEditable: de,
      controls: V,
      controlsList: J,
      coords: N | Kn,
      crossOrigin: null,
      data: null,
      dateTime: null,
      decoding: null,
      default: V,
      defer: V,
      dir: null,
      dirName: null,
      disabled: V,
      download: Ou,
      draggable: de,
      encType: null,
      enterKeyHint: null,
      fetchPriority: null,
      form: null,
      formAction: null,
      formEncType: null,
      formMethod: null,
      formNoValidate: V,
      formTarget: null,
      headers: J,
      height: N,
      hidden: Ou,
      high: N,
      href: null,
      hrefLang: null,
      htmlFor: J,
      httpEquiv: J,
      id: null,
      imageSizes: null,
      imageSrcSet: null,
      inert: V,
      inputMode: null,
      integrity: null,
      is: null,
      isMap: V,
      itemId: null,
      itemProp: J,
      itemRef: J,
      itemScope: V,
      itemType: J,
      kind: null,
      label: null,
      lang: null,
      language: null,
      list: null,
      loading: null,
      loop: V,
      low: N,
      manifest: null,
      max: null,
      maxLength: N,
      media: null,
      method: null,
      min: null,
      minLength: N,
      multiple: V,
      muted: V,
      name: null,
      nonce: null,
      noModule: V,
      noValidate: V,
      onAbort: null,
      onAfterPrint: null,
      onAuxClick: null,
      onBeforeMatch: null,
      onBeforePrint: null,
      onBeforeToggle: null,
      onBeforeUnload: null,
      onBlur: null,
      onCancel: null,
      onCanPlay: null,
      onCanPlayThrough: null,
      onChange: null,
      onClick: null,
      onClose: null,
      onContextLost: null,
      onContextMenu: null,
      onContextRestored: null,
      onCopy: null,
      onCueChange: null,
      onCut: null,
      onDblClick: null,
      onDrag: null,
      onDragEnd: null,
      onDragEnter: null,
      onDragExit: null,
      onDragLeave: null,
      onDragOver: null,
      onDragStart: null,
      onDrop: null,
      onDurationChange: null,
      onEmptied: null,
      onEnded: null,
      onError: null,
      onFocus: null,
      onFormData: null,
      onHashChange: null,
      onInput: null,
      onInvalid: null,
      onKeyDown: null,
      onKeyPress: null,
      onKeyUp: null,
      onLanguageChange: null,
      onLoad: null,
      onLoadedData: null,
      onLoadedMetadata: null,
      onLoadEnd: null,
      onLoadStart: null,
      onMessage: null,
      onMessageError: null,
      onMouseDown: null,
      onMouseEnter: null,
      onMouseLeave: null,
      onMouseMove: null,
      onMouseOut: null,
      onMouseOver: null,
      onMouseUp: null,
      onOffline: null,
      onOnline: null,
      onPageHide: null,
      onPageShow: null,
      onPaste: null,
      onPause: null,
      onPlay: null,
      onPlaying: null,
      onPopState: null,
      onProgress: null,
      onRateChange: null,
      onRejectionHandled: null,
      onReset: null,
      onResize: null,
      onScroll: null,
      onScrollEnd: null,
      onSecurityPolicyViolation: null,
      onSeeked: null,
      onSeeking: null,
      onSelect: null,
      onSlotChange: null,
      onStalled: null,
      onStorage: null,
      onSubmit: null,
      onSuspend: null,
      onTimeUpdate: null,
      onToggle: null,
      onUnhandledRejection: null,
      onUnload: null,
      onVolumeChange: null,
      onWaiting: null,
      onWheel: null,
      open: V,
      optimum: N,
      pattern: null,
      ping: J,
      placeholder: null,
      playsInline: V,
      popover: null,
      popoverTarget: null,
      popoverTargetAction: null,
      poster: null,
      preload: null,
      readOnly: V,
      referrerPolicy: null,
      rel: J,
      required: V,
      reversed: V,
      rows: N,
      rowSpan: N,
      sandbox: J,
      scope: null,
      scoped: V,
      seamless: V,
      selected: V,
      shadowRootClonable: V,
      shadowRootDelegatesFocus: V,
      shadowRootMode: null,
      shape: null,
      size: N,
      sizes: null,
      slot: null,
      span: N,
      spellCheck: de,
      src: null,
      srcDoc: null,
      srcLang: null,
      srcSet: null,
      start: N,
      step: null,
      style: null,
      tabIndex: N,
      target: null,
      title: null,
      translate: null,
      type: null,
      typeMustMatch: V,
      useMap: null,
      value: de,
      width: N,
      wrap: null,
      writingSuggestions: null,
      align: null,
      aLink: null,
      archive: J,
      axis: null,
      background: null,
      bgColor: null,
      border: N,
      borderColor: null,
      bottomMargin: N,
      cellPadding: null,
      cellSpacing: null,
      char: null,
      charOff: null,
      classId: null,
      clear: null,
      code: null,
      codeBase: null,
      codeType: null,
      color: null,
      compact: V,
      declare: V,
      event: null,
      face: null,
      frame: null,
      frameBorder: null,
      hSpace: N,
      leftMargin: N,
      link: null,
      longDesc: null,
      lowSrc: null,
      marginHeight: N,
      marginWidth: N,
      noResize: V,
      noHref: V,
      noShade: V,
      noWrap: V,
      object: null,
      profile: null,
      prompt: null,
      rev: null,
      rightMargin: N,
      rules: null,
      scheme: null,
      scrolling: de,
      standby: null,
      summary: null,
      text: null,
      topMargin: N,
      valueType: null,
      version: null,
      vAlign: null,
      vLink: null,
      vSpace: N,
      allowTransparency: null,
      autoCorrect: null,
      autoSave: null,
      disablePictureInPicture: V,
      disableRemotePlayback: V,
      prefix: null,
      property: null,
      results: N,
      security: null,
      unselectable: null,
    },
    space: "html",
    transform: Kd,
  }),
  xv = sr({
    attributes: {
      accentHeight: "accent-height",
      alignmentBaseline: "alignment-baseline",
      arabicForm: "arabic-form",
      baselineShift: "baseline-shift",
      capHeight: "cap-height",
      className: "class",
      clipPath: "clip-path",
      clipRule: "clip-rule",
      colorInterpolation: "color-interpolation",
      colorInterpolationFilters: "color-interpolation-filters",
      colorProfile: "color-profile",
      colorRendering: "color-rendering",
      crossOrigin: "crossorigin",
      dataType: "datatype",
      dominantBaseline: "dominant-baseline",
      enableBackground: "enable-background",
      fillOpacity: "fill-opacity",
      fillRule: "fill-rule",
      floodColor: "flood-color",
      floodOpacity: "flood-opacity",
      fontFamily: "font-family",
      fontSize: "font-size",
      fontSizeAdjust: "font-size-adjust",
      fontStretch: "font-stretch",
      fontStyle: "font-style",
      fontVariant: "font-variant",
      fontWeight: "font-weight",
      glyphName: "glyph-name",
      glyphOrientationHorizontal: "glyph-orientation-horizontal",
      glyphOrientationVertical: "glyph-orientation-vertical",
      hrefLang: "hreflang",
      horizAdvX: "horiz-adv-x",
      horizOriginX: "horiz-origin-x",
      horizOriginY: "horiz-origin-y",
      imageRendering: "image-rendering",
      letterSpacing: "letter-spacing",
      lightingColor: "lighting-color",
      markerEnd: "marker-end",
      markerMid: "marker-mid",
      markerStart: "marker-start",
      navDown: "nav-down",
      navDownLeft: "nav-down-left",
      navDownRight: "nav-down-right",
      navLeft: "nav-left",
      navNext: "nav-next",
      navPrev: "nav-prev",
      navRight: "nav-right",
      navUp: "nav-up",
      navUpLeft: "nav-up-left",
      navUpRight: "nav-up-right",
      onAbort: "onabort",
      onActivate: "onactivate",
      onAfterPrint: "onafterprint",
      onBeforePrint: "onbeforeprint",
      onBegin: "onbegin",
      onCancel: "oncancel",
      onCanPlay: "oncanplay",
      onCanPlayThrough: "oncanplaythrough",
      onChange: "onchange",
      onClick: "onclick",
      onClose: "onclose",
      onCopy: "oncopy",
      onCueChange: "oncuechange",
      onCut: "oncut",
      onDblClick: "ondblclick",
      onDrag: "ondrag",
      onDragEnd: "ondragend",
      onDragEnter: "ondragenter",
      onDragExit: "ondragexit",
      onDragLeave: "ondragleave",
      onDragOver: "ondragover",
      onDragStart: "ondragstart",
      onDrop: "ondrop",
      onDurationChange: "ondurationchange",
      onEmptied: "onemptied",
      onEnd: "onend",
      onEnded: "onended",
      onError: "onerror",
      onFocus: "onfocus",
      onFocusIn: "onfocusin",
      onFocusOut: "onfocusout",
      onHashChange: "onhashchange",
      onInput: "oninput",
      onInvalid: "oninvalid",
      onKeyDown: "onkeydown",
      onKeyPress: "onkeypress",
      onKeyUp: "onkeyup",
      onLoad: "onload",
      onLoadedData: "onloadeddata",
      onLoadedMetadata: "onloadedmetadata",
      onLoadStart: "onloadstart",
      onMessage: "onmessage",
      onMouseDown: "onmousedown",
      onMouseEnter: "onmouseenter",
      onMouseLeave: "onmouseleave",
      onMouseMove: "onmousemove",
      onMouseOut: "onmouseout",
      onMouseOver: "onmouseover",
      onMouseUp: "onmouseup",
      onMouseWheel: "onmousewheel",
      onOffline: "onoffline",
      onOnline: "ononline",
      onPageHide: "onpagehide",
      onPageShow: "onpageshow",
      onPaste: "onpaste",
      onPause: "onpause",
      onPlay: "onplay",
      onPlaying: "onplaying",
      onPopState: "onpopstate",
      onProgress: "onprogress",
      onRateChange: "onratechange",
      onRepeat: "onrepeat",
      onReset: "onreset",
      onResize: "onresize",
      onScroll: "onscroll",
      onSeeked: "onseeked",
      onSeeking: "onseeking",
      onSelect: "onselect",
      onShow: "onshow",
      onStalled: "onstalled",
      onStorage: "onstorage",
      onSubmit: "onsubmit",
      onSuspend: "onsuspend",
      onTimeUpdate: "ontimeupdate",
      onToggle: "ontoggle",
      onUnload: "onunload",
      onVolumeChange: "onvolumechange",
      onWaiting: "onwaiting",
      onZoom: "onzoom",
      overlinePosition: "overline-position",
      overlineThickness: "overline-thickness",
      paintOrder: "paint-order",
      panose1: "panose-1",
      pointerEvents: "pointer-events",
      referrerPolicy: "referrerpolicy",
      renderingIntent: "rendering-intent",
      shapeRendering: "shape-rendering",
      stopColor: "stop-color",
      stopOpacity: "stop-opacity",
      strikethroughPosition: "strikethrough-position",
      strikethroughThickness: "strikethrough-thickness",
      strokeDashArray: "stroke-dasharray",
      strokeDashOffset: "stroke-dashoffset",
      strokeLineCap: "stroke-linecap",
      strokeLineJoin: "stroke-linejoin",
      strokeMiterLimit: "stroke-miterlimit",
      strokeOpacity: "stroke-opacity",
      strokeWidth: "stroke-width",
      tabIndex: "tabindex",
      textAnchor: "text-anchor",
      textDecoration: "text-decoration",
      textRendering: "text-rendering",
      transformOrigin: "transform-origin",
      typeOf: "typeof",
      underlinePosition: "underline-position",
      underlineThickness: "underline-thickness",
      unicodeBidi: "unicode-bidi",
      unicodeRange: "unicode-range",
      unitsPerEm: "units-per-em",
      vAlphabetic: "v-alphabetic",
      vHanging: "v-hanging",
      vIdeographic: "v-ideographic",
      vMathematical: "v-mathematical",
      vectorEffect: "vector-effect",
      vertAdvY: "vert-adv-y",
      vertOriginX: "vert-origin-x",
      vertOriginY: "vert-origin-y",
      wordSpacing: "word-spacing",
      writingMode: "writing-mode",
      xHeight: "x-height",
      playbackOrder: "playbackorder",
      timelineBegin: "timelinebegin",
    },
    properties: {
      about: He,
      accentHeight: N,
      accumulate: null,
      additive: null,
      alignmentBaseline: null,
      alphabetic: N,
      amplitude: N,
      arabicForm: null,
      ascent: N,
      attributeName: null,
      attributeType: null,
      azimuth: N,
      bandwidth: null,
      baselineShift: null,
      baseFrequency: null,
      baseProfile: null,
      bbox: null,
      begin: null,
      bias: N,
      by: null,
      calcMode: null,
      capHeight: N,
      className: J,
      clip: null,
      clipPath: null,
      clipPathUnits: null,
      clipRule: null,
      color: null,
      colorInterpolation: null,
      colorInterpolationFilters: null,
      colorProfile: null,
      colorRendering: null,
      content: null,
      contentScriptType: null,
      contentStyleType: null,
      crossOrigin: null,
      cursor: null,
      cx: null,
      cy: null,
      d: null,
      dataType: null,
      defaultAction: null,
      descent: N,
      diffuseConstant: N,
      direction: null,
      display: null,
      dur: null,
      divisor: N,
      dominantBaseline: null,
      download: V,
      dx: null,
      dy: null,
      edgeMode: null,
      editable: null,
      elevation: N,
      enableBackground: null,
      end: null,
      event: null,
      exponent: N,
      externalResourcesRequired: null,
      fill: null,
      fillOpacity: N,
      fillRule: null,
      filter: null,
      filterRes: null,
      filterUnits: null,
      floodColor: null,
      floodOpacity: null,
      focusable: null,
      focusHighlight: null,
      fontFamily: null,
      fontSize: null,
      fontSizeAdjust: null,
      fontStretch: null,
      fontStyle: null,
      fontVariant: null,
      fontWeight: null,
      format: null,
      fr: null,
      from: null,
      fx: null,
      fy: null,
      g1: Kn,
      g2: Kn,
      glyphName: Kn,
      glyphOrientationHorizontal: null,
      glyphOrientationVertical: null,
      glyphRef: null,
      gradientTransform: null,
      gradientUnits: null,
      handler: null,
      hanging: N,
      hatchContentUnits: null,
      hatchUnits: null,
      height: null,
      href: null,
      hrefLang: null,
      horizAdvX: N,
      horizOriginX: N,
      horizOriginY: N,
      id: null,
      ideographic: N,
      imageRendering: null,
      initialVisibility: null,
      in: null,
      in2: null,
      intercept: N,
      k: N,
      k1: N,
      k2: N,
      k3: N,
      k4: N,
      kernelMatrix: He,
      kernelUnitLength: null,
      keyPoints: null,
      keySplines: null,
      keyTimes: null,
      kerning: null,
      lang: null,
      lengthAdjust: null,
      letterSpacing: null,
      lightingColor: null,
      limitingConeAngle: N,
      local: null,
      markerEnd: null,
      markerMid: null,
      markerStart: null,
      markerHeight: null,
      markerUnits: null,
      markerWidth: null,
      mask: null,
      maskContentUnits: null,
      maskUnits: null,
      mathematical: null,
      max: null,
      media: null,
      mediaCharacterEncoding: null,
      mediaContentEncodings: null,
      mediaSize: N,
      mediaTime: null,
      method: null,
      min: null,
      mode: null,
      name: null,
      navDown: null,
      navDownLeft: null,
      navDownRight: null,
      navLeft: null,
      navNext: null,
      navPrev: null,
      navRight: null,
      navUp: null,
      navUpLeft: null,
      navUpRight: null,
      numOctaves: null,
      observer: null,
      offset: null,
      onAbort: null,
      onActivate: null,
      onAfterPrint: null,
      onBeforePrint: null,
      onBegin: null,
      onCancel: null,
      onCanPlay: null,
      onCanPlayThrough: null,
      onChange: null,
      onClick: null,
      onClose: null,
      onCopy: null,
      onCueChange: null,
      onCut: null,
      onDblClick: null,
      onDrag: null,
      onDragEnd: null,
      onDragEnter: null,
      onDragExit: null,
      onDragLeave: null,
      onDragOver: null,
      onDragStart: null,
      onDrop: null,
      onDurationChange: null,
      onEmptied: null,
      onEnd: null,
      onEnded: null,
      onError: null,
      onFocus: null,
      onFocusIn: null,
      onFocusOut: null,
      onHashChange: null,
      onInput: null,
      onInvalid: null,
      onKeyDown: null,
      onKeyPress: null,
      onKeyUp: null,
      onLoad: null,
      onLoadedData: null,
      onLoadedMetadata: null,
      onLoadStart: null,
      onMessage: null,
      onMouseDown: null,
      onMouseEnter: null,
      onMouseLeave: null,
      onMouseMove: null,
      onMouseOut: null,
      onMouseOver: null,
      onMouseUp: null,
      onMouseWheel: null,
      onOffline: null,
      onOnline: null,
      onPageHide: null,
      onPageShow: null,
      onPaste: null,
      onPause: null,
      onPlay: null,
      onPlaying: null,
      onPopState: null,
      onProgress: null,
      onRateChange: null,
      onRepeat: null,
      onReset: null,
      onResize: null,
      onScroll: null,
      onSeeked: null,
      onSeeking: null,
      onSelect: null,
      onShow: null,
      onStalled: null,
      onStorage: null,
      onSubmit: null,
      onSuspend: null,
      onTimeUpdate: null,
      onToggle: null,
      onUnload: null,
      onVolumeChange: null,
      onWaiting: null,
      onZoom: null,
      opacity: null,
      operator: null,
      order: null,
      orient: null,
      orientation: null,
      origin: null,
      overflow: null,
      overlay: null,
      overlinePosition: N,
      overlineThickness: N,
      paintOrder: null,
      panose1: null,
      path: null,
      pathLength: N,
      patternContentUnits: null,
      patternTransform: null,
      patternUnits: null,
      phase: null,
      ping: J,
      pitch: null,
      playbackOrder: null,
      pointerEvents: null,
      points: null,
      pointsAtX: N,
      pointsAtY: N,
      pointsAtZ: N,
      preserveAlpha: null,
      preserveAspectRatio: null,
      primitiveUnits: null,
      propagate: null,
      property: He,
      r: null,
      radius: null,
      referrerPolicy: null,
      refX: null,
      refY: null,
      rel: He,
      rev: He,
      renderingIntent: null,
      repeatCount: null,
      repeatDur: null,
      requiredExtensions: He,
      requiredFeatures: He,
      requiredFonts: He,
      requiredFormats: He,
      resource: null,
      restart: null,
      result: null,
      rotate: null,
      rx: null,
      ry: null,
      scale: null,
      seed: null,
      shapeRendering: null,
      side: null,
      slope: null,
      snapshotTime: null,
      specularConstant: N,
      specularExponent: N,
      spreadMethod: null,
      spacing: null,
      startOffset: null,
      stdDeviation: null,
      stemh: null,
      stemv: null,
      stitchTiles: null,
      stopColor: null,
      stopOpacity: null,
      strikethroughPosition: N,
      strikethroughThickness: N,
      string: null,
      stroke: null,
      strokeDashArray: He,
      strokeDashOffset: null,
      strokeLineCap: null,
      strokeLineJoin: null,
      strokeMiterLimit: N,
      strokeOpacity: N,
      strokeWidth: null,
      style: null,
      surfaceScale: N,
      syncBehavior: null,
      syncBehaviorDefault: null,
      syncMaster: null,
      syncTolerance: null,
      syncToleranceDefault: null,
      systemLanguage: He,
      tabIndex: N,
      tableValues: null,
      target: null,
      targetX: N,
      targetY: N,
      textAnchor: null,
      textDecoration: null,
      textRendering: null,
      textLength: null,
      timelineBegin: null,
      title: null,
      transformBehavior: null,
      type: null,
      typeOf: He,
      to: null,
      transform: null,
      transformOrigin: null,
      u1: null,
      u2: null,
      underlinePosition: N,
      underlineThickness: N,
      unicode: null,
      unicodeBidi: null,
      unicodeRange: null,
      unitsPerEm: N,
      values: null,
      vAlphabetic: N,
      vMathematical: N,
      vectorEffect: null,
      vHanging: N,
      vIdeographic: N,
      version: null,
      vertAdvY: N,
      vertOriginX: N,
      vertOriginY: N,
      viewBox: null,
      viewTarget: null,
      visibility: null,
      width: null,
      widths: null,
      wordSpacing: null,
      writingMode: null,
      x: null,
      x1: null,
      x2: null,
      xChannelSelector: null,
      xHeight: N,
      y: null,
      y1: null,
      y2: null,
      yChannelSelector: null,
      z: null,
      zoomAndPan: null,
    },
    space: "svg",
    transform: Xd,
  }),
  Gd = sr({
    properties: {
      xLinkActuate: null,
      xLinkArcRole: null,
      xLinkHref: null,
      xLinkRole: null,
      xLinkShow: null,
      xLinkTitle: null,
      xLinkType: null,
    },
    space: "xlink",
    transform(e, t) {
      return "xlink:" + t.slice(5).toLowerCase();
    },
  }),
  qd = sr({
    attributes: { xmlnsxlink: "xmlns:xlink" },
    properties: { xmlnsXLink: null, xmlns: null },
    space: "xmlns",
    transform: Kd,
  }),
  Jd = sr({
    properties: { xmlBase: null, xmlLang: null, xmlSpace: null },
    space: "xml",
    transform(e, t) {
      return "xml:" + t.slice(3).toLowerCase();
    },
  }),
  Sv = {
    classId: "classID",
    dataType: "datatype",
    itemId: "itemID",
    strokeDashArray: "strokeDasharray",
    strokeDashOffset: "strokeDashoffset",
    strokeLineCap: "strokeLinecap",
    strokeLineJoin: "strokeLinejoin",
    strokeMiterLimit: "strokeMiterlimit",
    typeOf: "typeof",
    xLinkActuate: "xlinkActuate",
    xLinkArcRole: "xlinkArcrole",
    xLinkHref: "xlinkHref",
    xLinkRole: "xlinkRole",
    xLinkShow: "xlinkShow",
    xLinkTitle: "xlinkTitle",
    xLinkType: "xlinkType",
    xmlnsXLink: "xmlnsXlink",
  },
  Ev = /[A-Z]/g,
  Ic = /-[a-z]/g,
  Cv = /^data[-\w.:]+$/i;
function Pv(e, t) {
  const n = Ru(t);
  let r = t,
    l = Ue;
  if (n in e.normal) return e.property[e.normal[n]];
  if (n.length > 4 && n.slice(0, 4) === "data" && Cv.test(t)) {
    if (t.charAt(4) === "-") {
      const i = t.slice(5).replace(Ic, Tv);
      r = "data" + i.charAt(0).toUpperCase() + i.slice(1);
    } else {
      const i = t.slice(4);
      if (!Ic.test(i)) {
        let o = i.replace(Ev, _v);
        (o.charAt(0) !== "-" && (o = "-" + o), (t = "data" + o));
      }
    }
    l = Va;
  }
  return new l(r, t);
}
function _v(e) {
  return "-" + e.toLowerCase();
}
function Tv(e) {
  return e.charAt(1).toUpperCase();
}
const Iv = Qd([Yd, wv, Gd, qd, Jd], "html"),
  Ha = Qd([Yd, xv, Gd, qd, Jd], "svg");
function Wx(e) {
  const t = String(e || "").trim();
  return t ? t.split(/[ \t\n\r\f]+/g) : [];
}
function Nv(e) {
  return e.join(" ").trim();
}
var $a = {},
  Nc = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g,
  zv = /\n/g,
  Lv = /^\s*/,
  Rv = /^(\*?[-#/*\\\w]+(\[[0-9a-z_-]+\])?)\s*/,
  Ov = /^:\s*/,
  Dv = /^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};])+)/,
  Mv = /^[;\s]*/,
  Av = /^\s+|\s+$/g,
  Fv = `
`,
  zc = "/",
  Lc = "*",
  sn = "",
  Bv = "comment",
  jv = "declaration";
function Uv(e, t) {
  if (typeof e != "string") throw new TypeError("First argument must be a string");
  if (!e) return [];
  t = t || {};
  var n = 1,
    r = 1;
  function l(w) {
    var v = w.match(zv);
    v && (n += v.length);
    var S = w.lastIndexOf(Fv);
    r = ~S ? w.length - S : r + w.length;
  }
  function i() {
    var w = { line: n, column: r };
    return function (v) {
      return ((v.position = new o(w)), s(), v);
    };
  }
  function o(w) {
    ((this.start = w), (this.end = { line: n, column: r }), (this.source = t.source));
  }
  o.prototype.content = e;
  function u(w) {
    var v = new Error(t.source + ":" + n + ":" + r + ": " + w);
    if (
      ((v.reason = w),
      (v.filename = t.source),
      (v.line = n),
      (v.column = r),
      (v.source = e),
      !t.silent)
    )
      throw v;
  }
  function a(w) {
    var v = w.exec(e);
    if (v) {
      var S = v[0];
      return (l(S), (e = e.slice(S.length)), v);
    }
  }
  function s() {
    a(Lv);
  }
  function c(w) {
    var v;
    for (w = w || []; (v = f()); ) v !== !1 && w.push(v);
    return w;
  }
  function f() {
    var w = i();
    if (!(zc != e.charAt(0) || Lc != e.charAt(1))) {
      for (var v = 2; sn != e.charAt(v) && (Lc != e.charAt(v) || zc != e.charAt(v + 1)); ) ++v;
      if (((v += 2), sn === e.charAt(v - 1))) return u("End of comment missing");
      var S = e.slice(2, v - 2);
      return ((r += 2), l(S), (e = e.slice(v)), (r += 2), w({ type: Bv, comment: S }));
    }
  }
  function d() {
    var w = i(),
      v = a(Rv);
    if (v) {
      if ((f(), !a(Ov))) return u("property missing ':'");
      var S = a(Dv),
        h = w({
          type: jv,
          property: Rc(v[0].replace(Nc, sn)),
          value: S ? Rc(S[0].replace(Nc, sn)) : sn,
        });
      return (a(Mv), h);
    }
  }
  function p() {
    var w = [];
    c(w);
    for (var v; (v = d()); ) v !== !1 && (w.push(v), c(w));
    return w;
  }
  return (s(), p());
}
function Rc(e) {
  return e ? e.replace(Av, sn) : sn;
}
var Vv = Uv,
  Hv =
    (Zl && Zl.__importDefault) ||
    function (e) {
      return e && e.__esModule ? e : { default: e };
    };
Object.defineProperty($a, "__esModule", { value: !0 });
$a.default = Wv;
const $v = Hv(Vv);
function Wv(e, t) {
  let n = null;
  if (!e || typeof e != "string") return n;
  const r = (0, $v.default)(e),
    l = typeof t == "function";
  return (
    r.forEach((i) => {
      if (i.type !== "declaration") return;
      const { property: o, value: u } = i;
      l ? t(o, u, i) : u && ((n = n || {}), (n[o] = u));
    }),
    n
  );
}
var Wi = {};
Object.defineProperty(Wi, "__esModule", { value: !0 });
Wi.camelCase = void 0;
var bv = /^--[a-zA-Z0-9_-]+$/,
  Qv = /-([a-z])/g,
  Yv = /^[^-]+$/,
  Xv = /^-(webkit|moz|ms|o|khtml)-/,
  Kv = /^-(ms)-/,
  Gv = function (e) {
    return !e || Yv.test(e) || bv.test(e);
  },
  qv = function (e, t) {
    return t.toUpperCase();
  },
  Oc = function (e, t) {
    return "".concat(t, "-");
  },
  Jv = function (e, t) {
    return (
      t === void 0 && (t = {}),
      Gv(e)
        ? e
        : ((e = e.toLowerCase()),
          t.reactCompat ? (e = e.replace(Kv, Oc)) : (e = e.replace(Xv, Oc)),
          e.replace(Qv, qv))
    );
  };
Wi.camelCase = Jv;
var Zv =
    (Zl && Zl.__importDefault) ||
    function (e) {
      return e && e.__esModule ? e : { default: e };
    },
  e1 = Zv($a),
  t1 = Wi;
function Mu(e, t) {
  var n = {};
  return (
    !e ||
      typeof e != "string" ||
      (0, e1.default)(e, function (r, l) {
        r && l && (n[(0, t1.camelCase)(r, t)] = l);
      }),
    n
  );
}
Mu.default = Mu;
var n1 = Mu;
const r1 = _i(n1),
  Zd = eh("end"),
  Wa = eh("start");
function eh(e) {
  return t;
  function t(n) {
    const r = (n && n.position && n.position[e]) || {};
    if (typeof r.line == "number" && r.line > 0 && typeof r.column == "number" && r.column > 0)
      return {
        line: r.line,
        column: r.column,
        offset: typeof r.offset == "number" && r.offset > -1 ? r.offset : void 0,
      };
  }
}
function l1(e) {
  const t = Wa(e),
    n = Zd(e);
  if (t && n) return { start: t, end: n };
}
function Ar(e) {
  return !e || typeof e != "object"
    ? ""
    : "position" in e || "type" in e
      ? Dc(e.position)
      : "start" in e || "end" in e
        ? Dc(e)
        : "line" in e || "column" in e
          ? Au(e)
          : "";
}
function Au(e) {
  return Mc(e && e.line) + ":" + Mc(e && e.column);
}
function Dc(e) {
  return Au(e && e.start) + "-" + Au(e && e.end);
}
function Mc(e) {
  return e && typeof e == "number" ? e : 1;
}
class Ie extends Error {
  constructor(t, n, r) {
    (super(), typeof n == "string" && ((r = n), (n = void 0)));
    let l = "",
      i = {},
      o = !1;
    if (
      (n &&
        ("line" in n && "column" in n
          ? (i = { place: n })
          : "start" in n && "end" in n
            ? (i = { place: n })
            : "type" in n
              ? (i = { ancestors: [n], place: n.position })
              : (i = { ...n })),
      typeof t == "string" ? (l = t) : !i.cause && t && ((o = !0), (l = t.message), (i.cause = t)),
      !i.ruleId && !i.source && typeof r == "string")
    ) {
      const a = r.indexOf(":");
      a === -1 ? (i.ruleId = r) : ((i.source = r.slice(0, a)), (i.ruleId = r.slice(a + 1)));
    }
    if (!i.place && i.ancestors && i.ancestors) {
      const a = i.ancestors[i.ancestors.length - 1];
      a && (i.place = a.position);
    }
    const u = i.place && "start" in i.place ? i.place.start : i.place;
    ((this.ancestors = i.ancestors || void 0),
      (this.cause = i.cause || void 0),
      (this.column = u ? u.column : void 0),
      (this.fatal = void 0),
      (this.file = ""),
      (this.message = l),
      (this.line = u ? u.line : void 0),
      (this.name = Ar(i.place) || "1:1"),
      (this.place = i.place || void 0),
      (this.reason = this.message),
      (this.ruleId = i.ruleId || void 0),
      (this.source = i.source || void 0),
      (this.stack = o && i.cause && typeof i.cause.stack == "string" ? i.cause.stack : ""),
      (this.actual = void 0),
      (this.expected = void 0),
      (this.note = void 0),
      (this.url = void 0));
  }
}
Ie.prototype.file = "";
Ie.prototype.name = "";
Ie.prototype.reason = "";
Ie.prototype.message = "";
Ie.prototype.stack = "";
Ie.prototype.column = void 0;
Ie.prototype.line = void 0;
Ie.prototype.ancestors = void 0;
Ie.prototype.cause = void 0;
Ie.prototype.fatal = void 0;
Ie.prototype.place = void 0;
Ie.prototype.ruleId = void 0;
Ie.prototype.source = void 0;
const ba = {}.hasOwnProperty,
  i1 = new Map(),
  o1 = /[A-Z]/g,
  u1 = new Set(["table", "tbody", "thead", "tfoot", "tr"]),
  a1 = new Set(["td", "th"]),
  th = "https://github.com/syntax-tree/hast-util-to-jsx-runtime";
function s1(e, t) {
  if (!t || t.Fragment === void 0) throw new TypeError("Expected `Fragment` in options");
  const n = t.filePath || void 0;
  let r;
  if (t.development) {
    if (typeof t.jsxDEV != "function")
      throw new TypeError("Expected `jsxDEV` in options when `development: true`");
    r = y1(n, t.jsxDEV);
  } else {
    if (typeof t.jsx != "function") throw new TypeError("Expected `jsx` in production options");
    if (typeof t.jsxs != "function") throw new TypeError("Expected `jsxs` in production options");
    r = g1(n, t.jsx, t.jsxs);
  }
  const l = {
      Fragment: t.Fragment,
      ancestors: [],
      components: t.components || {},
      create: r,
      elementAttributeNameCase: t.elementAttributeNameCase || "react",
      evaluater: t.createEvaluater ? t.createEvaluater() : void 0,
      filePath: n,
      ignoreInvalidStyle: t.ignoreInvalidStyle || !1,
      passKeys: t.passKeys !== !1,
      passNode: t.passNode || !1,
      schema: t.space === "svg" ? Ha : Iv,
      stylePropertyNameCase: t.stylePropertyNameCase || "dom",
      tableCellAlignToStyle: t.tableCellAlignToStyle !== !1,
    },
    i = nh(l, e, void 0);
  return i && typeof i != "string" ? i : l.create(e, l.Fragment, { children: i || void 0 }, void 0);
}
function nh(e, t, n) {
  if (t.type === "element") return c1(e, t, n);
  if (t.type === "mdxFlowExpression" || t.type === "mdxTextExpression") return f1(e, t);
  if (t.type === "mdxJsxFlowElement" || t.type === "mdxJsxTextElement") return d1(e, t, n);
  if (t.type === "mdxjsEsm") return p1(e, t);
  if (t.type === "root") return h1(e, t, n);
  if (t.type === "text") return m1(e, t);
}
function c1(e, t, n) {
  const r = e.schema;
  let l = r;
  (t.tagName.toLowerCase() === "svg" && r.space === "html" && ((l = Ha), (e.schema = l)),
    e.ancestors.push(t));
  const i = lh(e, t.tagName, !1),
    o = v1(e, t);
  let u = Ya(e, t);
  return (
    u1.has(t.tagName) &&
      (u = u.filter(function (a) {
        return typeof a == "string" ? !vv(a) : !0;
      })),
    rh(e, o, i, t),
    Qa(o, u),
    e.ancestors.pop(),
    (e.schema = r),
    e.create(t, i, o, n)
  );
}
function f1(e, t) {
  if (t.data && t.data.estree && e.evaluater) {
    const r = t.data.estree.body[0];
    return (r.type, e.evaluater.evaluateExpression(r.expression));
  }
  ll(e, t.position);
}
function p1(e, t) {
  if (t.data && t.data.estree && e.evaluater) return e.evaluater.evaluateProgram(t.data.estree);
  ll(e, t.position);
}
function d1(e, t, n) {
  const r = e.schema;
  let l = r;
  (t.name === "svg" && r.space === "html" && ((l = Ha), (e.schema = l)), e.ancestors.push(t));
  const i = t.name === null ? e.Fragment : lh(e, t.name, !0),
    o = k1(e, t),
    u = Ya(e, t);
  return (rh(e, o, i, t), Qa(o, u), e.ancestors.pop(), (e.schema = r), e.create(t, i, o, n));
}
function h1(e, t, n) {
  const r = {};
  return (Qa(r, Ya(e, t)), e.create(t, e.Fragment, r, n));
}
function m1(e, t) {
  return t.value;
}
function rh(e, t, n, r) {
  typeof n != "string" && n !== e.Fragment && e.passNode && (t.node = r);
}
function Qa(e, t) {
  if (t.length > 0) {
    const n = t.length > 1 ? t : t[0];
    n && (e.children = n);
  }
}
function g1(e, t, n) {
  return r;
  function r(l, i, o, u) {
    const s = Array.isArray(o.children) ? n : t;
    return u ? s(i, o, u) : s(i, o);
  }
}
function y1(e, t) {
  return n;
  function n(r, l, i, o) {
    const u = Array.isArray(i.children),
      a = Wa(r);
    return t(
      l,
      i,
      o,
      u,
      { columnNumber: a ? a.column - 1 : void 0, fileName: e, lineNumber: a ? a.line : void 0 },
      void 0,
    );
  }
}
function v1(e, t) {
  const n = {};
  let r, l;
  for (l in t.properties)
    if (l !== "children" && ba.call(t.properties, l)) {
      const i = w1(e, l, t.properties[l]);
      if (i) {
        const [o, u] = i;
        e.tableCellAlignToStyle && o === "align" && typeof u == "string" && a1.has(t.tagName)
          ? (r = u)
          : (n[o] = u);
      }
    }
  if (r) {
    const i = n.style || (n.style = {});
    i[e.stylePropertyNameCase === "css" ? "text-align" : "textAlign"] = r;
  }
  return n;
}
function k1(e, t) {
  const n = {};
  for (const r of t.attributes)
    if (r.type === "mdxJsxExpressionAttribute")
      if (r.data && r.data.estree && e.evaluater) {
        const i = r.data.estree.body[0];
        i.type;
        const o = i.expression;
        o.type;
        const u = o.properties[0];
        (u.type, Object.assign(n, e.evaluater.evaluateExpression(u.argument)));
      } else ll(e, t.position);
    else {
      const l = r.name;
      let i;
      if (r.value && typeof r.value == "object")
        if (r.value.data && r.value.data.estree && e.evaluater) {
          const u = r.value.data.estree.body[0];
          (u.type, (i = e.evaluater.evaluateExpression(u.expression)));
        } else ll(e, t.position);
      else i = r.value === null ? !0 : r.value;
      n[l] = i;
    }
  return n;
}
function Ya(e, t) {
  const n = [];
  let r = -1;
  const l = e.passKeys ? new Map() : i1;
  for (; ++r < t.children.length; ) {
    const i = t.children[r];
    let o;
    if (e.passKeys) {
      const a =
        i.type === "element"
          ? i.tagName
          : i.type === "mdxJsxFlowElement" || i.type === "mdxJsxTextElement"
            ? i.name
            : void 0;
      if (a) {
        const s = l.get(a) || 0;
        ((o = a + "-" + s), l.set(a, s + 1));
      }
    }
    const u = nh(e, i, o);
    u !== void 0 && n.push(u);
  }
  return n;
}
function w1(e, t, n) {
  const r = Pv(e.schema, t);
  if (!(n == null || (typeof n == "number" && Number.isNaN(n)))) {
    if ((Array.isArray(n) && (n = r.commaSeparated ? dv(n) : Nv(n)), r.property === "style")) {
      let l = typeof n == "object" ? n : x1(e, String(n));
      return (e.stylePropertyNameCase === "css" && (l = S1(l)), ["style", l]);
    }
    return [
      e.elementAttributeNameCase === "react" && r.space
        ? Sv[r.property] || r.property
        : r.attribute,
      n,
    ];
  }
}
function x1(e, t) {
  try {
    return r1(t, { reactCompat: !0 });
  } catch (n) {
    if (e.ignoreInvalidStyle) return {};
    const r = n,
      l = new Ie("Cannot parse `style` attribute", {
        ancestors: e.ancestors,
        cause: r,
        ruleId: "style",
        source: "hast-util-to-jsx-runtime",
      });
    throw ((l.file = e.filePath || void 0), (l.url = th + "#cannot-parse-style-attribute"), l);
  }
}
function lh(e, t, n) {
  let r;
  if (!n) r = { type: "Literal", value: t };
  else if (t.includes(".")) {
    const l = t.split(".");
    let i = -1,
      o;
    for (; ++i < l.length; ) {
      const u = Pc(l[i]) ? { type: "Identifier", name: l[i] } : { type: "Literal", value: l[i] };
      o = o
        ? {
            type: "MemberExpression",
            object: o,
            property: u,
            computed: !!(i && u.type === "Literal"),
            optional: !1,
          }
        : u;
    }
    r = o;
  } else
    r =
      Pc(t) && !/^[a-z]/.test(t) ? { type: "Identifier", name: t } : { type: "Literal", value: t };
  if (r.type === "Literal") {
    const l = r.value;
    return ba.call(e.components, l) ? e.components[l] : l;
  }
  if (e.evaluater) return e.evaluater.evaluateExpression(r);
  ll(e);
}
function ll(e, t) {
  const n = new Ie("Cannot handle MDX estrees without `createEvaluater`", {
    ancestors: e.ancestors,
    place: t,
    ruleId: "mdx-estree",
    source: "hast-util-to-jsx-runtime",
  });
  throw (
    (n.file = e.filePath || void 0),
    (n.url = th + "#cannot-handle-mdx-estrees-without-createevaluater"),
    n
  );
}
function S1(e) {
  const t = {};
  let n;
  for (n in e) ba.call(e, n) && (t[E1(n)] = e[n]);
  return t;
}
function E1(e) {
  let t = e.replace(o1, C1);
  return (t.slice(0, 3) === "ms-" && (t = "-" + t), t);
}
function C1(e) {
  return "-" + e.toLowerCase();
}
const Po = {
    action: ["form"],
    cite: ["blockquote", "del", "ins", "q"],
    data: ["object"],
    formAction: ["button", "input"],
    href: ["a", "area", "base", "link"],
    icon: ["menuitem"],
    itemId: null,
    manifest: ["html"],
    ping: ["a", "area"],
    poster: ["video"],
    src: ["audio", "embed", "iframe", "img", "input", "script", "source", "track", "video"],
  },
  P1 = {};
function _1(e, t) {
  const n = P1,
    r = typeof n.includeImageAlt == "boolean" ? n.includeImageAlt : !0,
    l = typeof n.includeHtml == "boolean" ? n.includeHtml : !0;
  return ih(e, r, l);
}
function ih(e, t, n) {
  if (T1(e)) {
    if ("value" in e) return e.type === "html" && !n ? "" : e.value;
    if (t && "alt" in e && e.alt) return e.alt;
    if ("children" in e) return Ac(e.children, t, n);
  }
  return Array.isArray(e) ? Ac(e, t, n) : "";
}
function Ac(e, t, n) {
  const r = [];
  let l = -1;
  for (; ++l < e.length; ) r[l] = ih(e[l], t, n);
  return r.join("");
}
function T1(e) {
  return !!(e && typeof e == "object");
}
const Fc = document.createElement("i");
function Xa(e) {
  const t = "&" + e + ";";
  Fc.innerHTML = t;
  const n = Fc.textContent;
  return (n.charCodeAt(n.length - 1) === 59 && e !== "semi") || n === t ? !1 : n;
}
function xt(e, t, n, r) {
  const l = e.length;
  let i = 0,
    o;
  if ((t < 0 ? (t = -t > l ? 0 : l + t) : (t = t > l ? l : t), (n = n > 0 ? n : 0), r.length < 1e4))
    ((o = Array.from(r)), o.unshift(t, n), e.splice(...o));
  else
    for (n && e.splice(t, n); i < r.length; )
      ((o = r.slice(i, i + 1e4)), o.unshift(t, 0), e.splice(...o), (i += 1e4), (t += 1e4));
}
function Je(e, t) {
  return e.length > 0 ? (xt(e, e.length, 0, t), e) : t;
}
const Bc = {}.hasOwnProperty;
function I1(e) {
  const t = {};
  let n = -1;
  for (; ++n < e.length; ) N1(t, e[n]);
  return t;
}
function N1(e, t) {
  let n;
  for (n in t) {
    const l = (Bc.call(e, n) ? e[n] : void 0) || (e[n] = {}),
      i = t[n];
    let o;
    if (i)
      for (o in i) {
        Bc.call(l, o) || (l[o] = []);
        const u = i[o];
        z1(l[o], Array.isArray(u) ? u : u ? [u] : []);
      }
  }
}
function z1(e, t) {
  let n = -1;
  const r = [];
  for (; ++n < t.length; ) (t[n].add === "after" ? e : r).push(t[n]);
  xt(e, 0, 0, r);
}
function oh(e, t) {
  const n = Number.parseInt(e, t);
  return n < 9 ||
    n === 11 ||
    (n > 13 && n < 32) ||
    (n > 126 && n < 160) ||
    (n > 55295 && n < 57344) ||
    (n > 64975 && n < 65008) ||
    (n & 65535) === 65535 ||
    (n & 65535) === 65534 ||
    n > 1114111
    ? "�"
    : String.fromCodePoint(n);
}
function Gn(e) {
  return e
    .replace(/[\t\n\r ]+/g, " ")
    .replace(/^ | $/g, "")
    .toLowerCase()
    .toUpperCase();
}
const yt = ln(/[A-Za-z]/),
  be = ln(/[\dA-Za-z]/),
  L1 = ln(/[#-'*+\--9=?A-Z^-~]/);
function Fu(e) {
  return e !== null && (e < 32 || e === 127);
}
const Bu = ln(/\d/),
  R1 = ln(/[\dA-Fa-f]/),
  O1 = ln(/[!-/:-@[-`{-~]/);
function j(e) {
  return e !== null && e < -2;
}
function je(e) {
  return e !== null && (e < 0 || e === 32);
}
function Y(e) {
  return e === -2 || e === -1 || e === 32;
}
const D1 = ln(new RegExp("\\p{P}|\\p{S}", "u")),
  M1 = ln(/\s/);
function ln(e) {
  return t;
  function t(n) {
    return n !== null && n > -1 && e.test(String.fromCharCode(n));
  }
}
function cr(e) {
  const t = [];
  let n = -1,
    r = 0,
    l = 0;
  for (; ++n < e.length; ) {
    const i = e.charCodeAt(n);
    let o = "";
    if (i === 37 && be(e.charCodeAt(n + 1)) && be(e.charCodeAt(n + 2))) l = 2;
    else if (i < 128)
      /[!#$&-;=?-Z_a-z~]/.test(String.fromCharCode(i)) || (o = String.fromCharCode(i));
    else if (i > 55295 && i < 57344) {
      const u = e.charCodeAt(n + 1);
      i < 56320 && u > 56319 && u < 57344 ? ((o = String.fromCharCode(i, u)), (l = 1)) : (o = "�");
    } else o = String.fromCharCode(i);
    (o && (t.push(e.slice(r, n), encodeURIComponent(o)), (r = n + l + 1), (o = "")),
      l && ((n += l), (l = 0)));
  }
  return t.join("") + e.slice(r);
}
function ee(e, t, n, r) {
  const l = r ? r - 1 : Number.POSITIVE_INFINITY;
  let i = 0;
  return o;
  function o(a) {
    return Y(a) ? (e.enter(n), u(a)) : t(a);
  }
  function u(a) {
    return Y(a) && i++ < l ? (e.consume(a), u) : (e.exit(n), t(a));
  }
}
const A1 = { tokenize: F1 };
function F1(e) {
  const t = e.attempt(this.parser.constructs.contentInitial, r, l);
  let n;
  return t;
  function r(u) {
    if (u === null) {
      e.consume(u);
      return;
    }
    return (e.enter("lineEnding"), e.consume(u), e.exit("lineEnding"), ee(e, t, "linePrefix"));
  }
  function l(u) {
    return (e.enter("paragraph"), i(u));
  }
  function i(u) {
    const a = e.enter("chunkText", { contentType: "text", previous: n });
    return (n && (n.next = a), (n = a), o(u));
  }
  function o(u) {
    if (u === null) {
      (e.exit("chunkText"), e.exit("paragraph"), e.consume(u));
      return;
    }
    return j(u) ? (e.consume(u), e.exit("chunkText"), i) : (e.consume(u), o);
  }
}
const B1 = { tokenize: j1 },
  jc = { tokenize: U1 };
function j1(e) {
  const t = this,
    n = [];
  let r = 0,
    l,
    i,
    o;
  return u;
  function u(y) {
    if (r < n.length) {
      const E = n[r];
      return ((t.containerState = E[1]), e.attempt(E[0].continuation, a, s)(y));
    }
    return s(y);
  }
  function a(y) {
    if ((r++, t.containerState._closeFlow)) {
      ((t.containerState._closeFlow = void 0), l && m());
      const E = t.events.length;
      let P = E,
        x;
      for (; P--; )
        if (t.events[P][0] === "exit" && t.events[P][1].type === "chunkFlow") {
          x = t.events[P][1].end;
          break;
        }
      h(r);
      let T = E;
      for (; T < t.events.length; ) ((t.events[T][1].end = { ...x }), T++);
      return (xt(t.events, P + 1, 0, t.events.slice(E)), (t.events.length = T), s(y));
    }
    return u(y);
  }
  function s(y) {
    if (r === n.length) {
      if (!l) return d(y);
      if (l.currentConstruct && l.currentConstruct.concrete) return w(y);
      t.interrupt = !!(l.currentConstruct && !l._gfmTableDynamicInterruptHack);
    }
    return ((t.containerState = {}), e.check(jc, c, f)(y));
  }
  function c(y) {
    return (l && m(), h(r), d(y));
  }
  function f(y) {
    return ((t.parser.lazy[t.now().line] = r !== n.length), (o = t.now().offset), w(y));
  }
  function d(y) {
    return ((t.containerState = {}), e.attempt(jc, p, w)(y));
  }
  function p(y) {
    return (r++, n.push([t.currentConstruct, t.containerState]), d(y));
  }
  function w(y) {
    if (y === null) {
      (l && m(), h(0), e.consume(y));
      return;
    }
    return (
      (l = l || t.parser.flow(t.now())),
      e.enter("chunkFlow", { _tokenizer: l, contentType: "flow", previous: i }),
      v(y)
    );
  }
  function v(y) {
    if (y === null) {
      (S(e.exit("chunkFlow"), !0), h(0), e.consume(y));
      return;
    }
    return j(y)
      ? (e.consume(y), S(e.exit("chunkFlow")), (r = 0), (t.interrupt = void 0), u)
      : (e.consume(y), v);
  }
  function S(y, E) {
    const P = t.sliceStream(y);
    if (
      (E && P.push(null),
      (y.previous = i),
      i && (i.next = y),
      (i = y),
      l.defineSkip(y.start),
      l.write(P),
      t.parser.lazy[y.start.line])
    ) {
      let x = l.events.length;
      for (; x--; )
        if (
          l.events[x][1].start.offset < o &&
          (!l.events[x][1].end || l.events[x][1].end.offset > o)
        )
          return;
      const T = t.events.length;
      let L = T,
        F,
        M;
      for (; L--; )
        if (t.events[L][0] === "exit" && t.events[L][1].type === "chunkFlow") {
          if (F) {
            M = t.events[L][1].end;
            break;
          }
          F = !0;
        }
      for (h(r), x = T; x < t.events.length; ) ((t.events[x][1].end = { ...M }), x++);
      (xt(t.events, L + 1, 0, t.events.slice(T)), (t.events.length = x));
    }
  }
  function h(y) {
    let E = n.length;
    for (; E-- > y; ) {
      const P = n[E];
      ((t.containerState = P[1]), P[0].exit.call(t, e));
    }
    n.length = y;
  }
  function m() {
    (l.write([null]), (i = void 0), (l = void 0), (t.containerState._closeFlow = void 0));
  }
}
function U1(e, t, n) {
  return ee(
    e,
    e.attempt(this.parser.constructs.document, t, n),
    "linePrefix",
    this.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4,
  );
}
function Uc(e) {
  if (e === null || je(e) || M1(e)) return 1;
  if (D1(e)) return 2;
}
function Ka(e, t, n) {
  const r = [];
  let l = -1;
  for (; ++l < e.length; ) {
    const i = e[l].resolveAll;
    i && !r.includes(i) && ((t = i(t, n)), r.push(i));
  }
  return t;
}
const ju = { name: "attention", resolveAll: V1, tokenize: H1 };
function V1(e, t) {
  let n = -1,
    r,
    l,
    i,
    o,
    u,
    a,
    s,
    c;
  for (; ++n < e.length; )
    if (e[n][0] === "enter" && e[n][1].type === "attentionSequence" && e[n][1]._close) {
      for (r = n; r--; )
        if (
          e[r][0] === "exit" &&
          e[r][1].type === "attentionSequence" &&
          e[r][1]._open &&
          t.sliceSerialize(e[r][1]).charCodeAt(0) === t.sliceSerialize(e[n][1]).charCodeAt(0)
        ) {
          if (
            (e[r][1]._close || e[n][1]._open) &&
            (e[n][1].end.offset - e[n][1].start.offset) % 3 &&
            !(
              (e[r][1].end.offset -
                e[r][1].start.offset +
                e[n][1].end.offset -
                e[n][1].start.offset) %
              3
            )
          )
            continue;
          a =
            e[r][1].end.offset - e[r][1].start.offset > 1 &&
            e[n][1].end.offset - e[n][1].start.offset > 1
              ? 2
              : 1;
          const f = { ...e[r][1].end },
            d = { ...e[n][1].start };
          (Vc(f, -a),
            Vc(d, a),
            (o = {
              type: a > 1 ? "strongSequence" : "emphasisSequence",
              start: f,
              end: { ...e[r][1].end },
            }),
            (u = {
              type: a > 1 ? "strongSequence" : "emphasisSequence",
              start: { ...e[n][1].start },
              end: d,
            }),
            (i = {
              type: a > 1 ? "strongText" : "emphasisText",
              start: { ...e[r][1].end },
              end: { ...e[n][1].start },
            }),
            (l = { type: a > 1 ? "strong" : "emphasis", start: { ...o.start }, end: { ...u.end } }),
            (e[r][1].end = { ...o.start }),
            (e[n][1].start = { ...u.end }),
            (s = []),
            e[r][1].end.offset - e[r][1].start.offset &&
              (s = Je(s, [
                ["enter", e[r][1], t],
                ["exit", e[r][1], t],
              ])),
            (s = Je(s, [
              ["enter", l, t],
              ["enter", o, t],
              ["exit", o, t],
              ["enter", i, t],
            ])),
            (s = Je(s, Ka(t.parser.constructs.insideSpan.null, e.slice(r + 1, n), t))),
            (s = Je(s, [
              ["exit", i, t],
              ["enter", u, t],
              ["exit", u, t],
              ["exit", l, t],
            ])),
            e[n][1].end.offset - e[n][1].start.offset
              ? ((c = 2),
                (s = Je(s, [
                  ["enter", e[n][1], t],
                  ["exit", e[n][1], t],
                ])))
              : (c = 0),
            xt(e, r - 1, n - r + 3, s),
            (n = r + s.length - c - 2));
          break;
        }
    }
  for (n = -1; ++n < e.length; ) e[n][1].type === "attentionSequence" && (e[n][1].type = "data");
  return e;
}
function H1(e, t) {
  const n = this.parser.constructs.attentionMarkers.null,
    r = this.previous,
    l = Uc(r);
  let i;
  return o;
  function o(a) {
    return ((i = a), e.enter("attentionSequence"), u(a));
  }
  function u(a) {
    if (a === i) return (e.consume(a), u);
    const s = e.exit("attentionSequence"),
      c = Uc(a),
      f = !c || (c === 2 && l) || n.includes(a),
      d = !l || (l === 2 && c) || n.includes(r);
    return (
      (s._open = !!(i === 42 ? f : f && (l || !d))),
      (s._close = !!(i === 42 ? d : d && (c || !f))),
      t(a)
    );
  }
}
function Vc(e, t) {
  ((e.column += t), (e.offset += t), (e._bufferIndex += t));
}
const $1 = { name: "autolink", tokenize: W1 };
function W1(e, t, n) {
  let r = 0;
  return l;
  function l(p) {
    return (
      e.enter("autolink"),
      e.enter("autolinkMarker"),
      e.consume(p),
      e.exit("autolinkMarker"),
      e.enter("autolinkProtocol"),
      i
    );
  }
  function i(p) {
    return yt(p) ? (e.consume(p), o) : p === 64 ? n(p) : s(p);
  }
  function o(p) {
    return p === 43 || p === 45 || p === 46 || be(p) ? ((r = 1), u(p)) : s(p);
  }
  function u(p) {
    return p === 58
      ? (e.consume(p), (r = 0), a)
      : (p === 43 || p === 45 || p === 46 || be(p)) && r++ < 32
        ? (e.consume(p), u)
        : ((r = 0), s(p));
  }
  function a(p) {
    return p === 62
      ? (e.exit("autolinkProtocol"),
        e.enter("autolinkMarker"),
        e.consume(p),
        e.exit("autolinkMarker"),
        e.exit("autolink"),
        t)
      : p === null || p === 32 || p === 60 || Fu(p)
        ? n(p)
        : (e.consume(p), a);
  }
  function s(p) {
    return p === 64 ? (e.consume(p), c) : L1(p) ? (e.consume(p), s) : n(p);
  }
  function c(p) {
    return be(p) ? f(p) : n(p);
  }
  function f(p) {
    return p === 46
      ? (e.consume(p), (r = 0), c)
      : p === 62
        ? ((e.exit("autolinkProtocol").type = "autolinkEmail"),
          e.enter("autolinkMarker"),
          e.consume(p),
          e.exit("autolinkMarker"),
          e.exit("autolink"),
          t)
        : d(p);
  }
  function d(p) {
    if ((p === 45 || be(p)) && r++ < 63) {
      const w = p === 45 ? d : f;
      return (e.consume(p), w);
    }
    return n(p);
  }
}
const bi = { partial: !0, tokenize: b1 };
function b1(e, t, n) {
  return r;
  function r(i) {
    return Y(i) ? ee(e, l, "linePrefix")(i) : l(i);
  }
  function l(i) {
    return i === null || j(i) ? t(i) : n(i);
  }
}
const uh = { continuation: { tokenize: Y1 }, exit: X1, name: "blockQuote", tokenize: Q1 };
function Q1(e, t, n) {
  const r = this;
  return l;
  function l(o) {
    if (o === 62) {
      const u = r.containerState;
      return (
        u.open || (e.enter("blockQuote", { _container: !0 }), (u.open = !0)),
        e.enter("blockQuotePrefix"),
        e.enter("blockQuoteMarker"),
        e.consume(o),
        e.exit("blockQuoteMarker"),
        i
      );
    }
    return n(o);
  }
  function i(o) {
    return Y(o)
      ? (e.enter("blockQuotePrefixWhitespace"),
        e.consume(o),
        e.exit("blockQuotePrefixWhitespace"),
        e.exit("blockQuotePrefix"),
        t)
      : (e.exit("blockQuotePrefix"), t(o));
  }
}
function Y1(e, t, n) {
  const r = this;
  return l;
  function l(o) {
    return Y(o)
      ? ee(
          e,
          i,
          "linePrefix",
          r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4,
        )(o)
      : i(o);
  }
  function i(o) {
    return e.attempt(uh, t, n)(o);
  }
}
function X1(e) {
  e.exit("blockQuote");
}
const ah = { name: "characterEscape", tokenize: K1 };
function K1(e, t, n) {
  return r;
  function r(i) {
    return (
      e.enter("characterEscape"),
      e.enter("escapeMarker"),
      e.consume(i),
      e.exit("escapeMarker"),
      l
    );
  }
  function l(i) {
    return O1(i)
      ? (e.enter("characterEscapeValue"),
        e.consume(i),
        e.exit("characterEscapeValue"),
        e.exit("characterEscape"),
        t)
      : n(i);
  }
}
const sh = { name: "characterReference", tokenize: G1 };
function G1(e, t, n) {
  const r = this;
  let l = 0,
    i,
    o;
  return u;
  function u(f) {
    return (
      e.enter("characterReference"),
      e.enter("characterReferenceMarker"),
      e.consume(f),
      e.exit("characterReferenceMarker"),
      a
    );
  }
  function a(f) {
    return f === 35
      ? (e.enter("characterReferenceMarkerNumeric"),
        e.consume(f),
        e.exit("characterReferenceMarkerNumeric"),
        s)
      : (e.enter("characterReferenceValue"), (i = 31), (o = be), c(f));
  }
  function s(f) {
    return f === 88 || f === 120
      ? (e.enter("characterReferenceMarkerHexadecimal"),
        e.consume(f),
        e.exit("characterReferenceMarkerHexadecimal"),
        e.enter("characterReferenceValue"),
        (i = 6),
        (o = R1),
        c)
      : (e.enter("characterReferenceValue"), (i = 7), (o = Bu), c(f));
  }
  function c(f) {
    if (f === 59 && l) {
      const d = e.exit("characterReferenceValue");
      return o === be && !Xa(r.sliceSerialize(d))
        ? n(f)
        : (e.enter("characterReferenceMarker"),
          e.consume(f),
          e.exit("characterReferenceMarker"),
          e.exit("characterReference"),
          t);
    }
    return o(f) && l++ < i ? (e.consume(f), c) : n(f);
  }
}
const Hc = { partial: !0, tokenize: J1 },
  $c = { concrete: !0, name: "codeFenced", tokenize: q1 };
function q1(e, t, n) {
  const r = this,
    l = { partial: !0, tokenize: P };
  let i = 0,
    o = 0,
    u;
  return a;
  function a(x) {
    return s(x);
  }
  function s(x) {
    const T = r.events[r.events.length - 1];
    return (
      (i = T && T[1].type === "linePrefix" ? T[2].sliceSerialize(T[1], !0).length : 0),
      (u = x),
      e.enter("codeFenced"),
      e.enter("codeFencedFence"),
      e.enter("codeFencedFenceSequence"),
      c(x)
    );
  }
  function c(x) {
    return x === u
      ? (o++, e.consume(x), c)
      : o < 3
        ? n(x)
        : (e.exit("codeFencedFenceSequence"), Y(x) ? ee(e, f, "whitespace")(x) : f(x));
  }
  function f(x) {
    return x === null || j(x)
      ? (e.exit("codeFencedFence"), r.interrupt ? t(x) : e.check(Hc, v, E)(x))
      : (e.enter("codeFencedFenceInfo"), e.enter("chunkString", { contentType: "string" }), d(x));
  }
  function d(x) {
    return x === null || j(x)
      ? (e.exit("chunkString"), e.exit("codeFencedFenceInfo"), f(x))
      : Y(x)
        ? (e.exit("chunkString"), e.exit("codeFencedFenceInfo"), ee(e, p, "whitespace")(x))
        : x === 96 && x === u
          ? n(x)
          : (e.consume(x), d);
  }
  function p(x) {
    return x === null || j(x)
      ? f(x)
      : (e.enter("codeFencedFenceMeta"), e.enter("chunkString", { contentType: "string" }), w(x));
  }
  function w(x) {
    return x === null || j(x)
      ? (e.exit("chunkString"), e.exit("codeFencedFenceMeta"), f(x))
      : x === 96 && x === u
        ? n(x)
        : (e.consume(x), w);
  }
  function v(x) {
    return e.attempt(l, E, S)(x);
  }
  function S(x) {
    return (e.enter("lineEnding"), e.consume(x), e.exit("lineEnding"), h);
  }
  function h(x) {
    return i > 0 && Y(x) ? ee(e, m, "linePrefix", i + 1)(x) : m(x);
  }
  function m(x) {
    return x === null || j(x) ? e.check(Hc, v, E)(x) : (e.enter("codeFlowValue"), y(x));
  }
  function y(x) {
    return x === null || j(x) ? (e.exit("codeFlowValue"), m(x)) : (e.consume(x), y);
  }
  function E(x) {
    return (e.exit("codeFenced"), t(x));
  }
  function P(x, T, L) {
    let F = 0;
    return M;
    function M($) {
      return (x.enter("lineEnding"), x.consume($), x.exit("lineEnding"), O);
    }
    function O($) {
      return (
        x.enter("codeFencedFence"),
        Y($)
          ? ee(
              x,
              A,
              "linePrefix",
              r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4,
            )($)
          : A($)
      );
    }
    function A($) {
      return $ === u ? (x.enter("codeFencedFenceSequence"), X($)) : L($);
    }
    function X($) {
      return $ === u
        ? (F++, x.consume($), X)
        : F >= o
          ? (x.exit("codeFencedFenceSequence"), Y($) ? ee(x, ie, "whitespace")($) : ie($))
          : L($);
    }
    function ie($) {
      return $ === null || j($) ? (x.exit("codeFencedFence"), T($)) : L($);
    }
  }
}
function J1(e, t, n) {
  const r = this;
  return l;
  function l(o) {
    return o === null ? n(o) : (e.enter("lineEnding"), e.consume(o), e.exit("lineEnding"), i);
  }
  function i(o) {
    return r.parser.lazy[r.now().line] ? n(o) : t(o);
  }
}
const _o = { name: "codeIndented", tokenize: e0 },
  Z1 = { partial: !0, tokenize: t0 };
function e0(e, t, n) {
  const r = this;
  return l;
  function l(s) {
    return (e.enter("codeIndented"), ee(e, i, "linePrefix", 5)(s));
  }
  function i(s) {
    const c = r.events[r.events.length - 1];
    return c && c[1].type === "linePrefix" && c[2].sliceSerialize(c[1], !0).length >= 4
      ? o(s)
      : n(s);
  }
  function o(s) {
    return s === null ? a(s) : j(s) ? e.attempt(Z1, o, a)(s) : (e.enter("codeFlowValue"), u(s));
  }
  function u(s) {
    return s === null || j(s) ? (e.exit("codeFlowValue"), o(s)) : (e.consume(s), u);
  }
  function a(s) {
    return (e.exit("codeIndented"), t(s));
  }
}
function t0(e, t, n) {
  const r = this;
  return l;
  function l(o) {
    return r.parser.lazy[r.now().line]
      ? n(o)
      : j(o)
        ? (e.enter("lineEnding"), e.consume(o), e.exit("lineEnding"), l)
        : ee(e, i, "linePrefix", 5)(o);
  }
  function i(o) {
    const u = r.events[r.events.length - 1];
    return u && u[1].type === "linePrefix" && u[2].sliceSerialize(u[1], !0).length >= 4
      ? t(o)
      : j(o)
        ? l(o)
        : n(o);
  }
}
const n0 = { name: "codeText", previous: l0, resolve: r0, tokenize: i0 };
function r0(e) {
  let t = e.length - 4,
    n = 3,
    r,
    l;
  if (
    (e[n][1].type === "lineEnding" || e[n][1].type === "space") &&
    (e[t][1].type === "lineEnding" || e[t][1].type === "space")
  ) {
    for (r = n; ++r < t; )
      if (e[r][1].type === "codeTextData") {
        ((e[n][1].type = "codeTextPadding"),
          (e[t][1].type = "codeTextPadding"),
          (n += 2),
          (t -= 2));
        break;
      }
  }
  for (r = n - 1, t++; ++r <= t; )
    l === void 0
      ? r !== t && e[r][1].type !== "lineEnding" && (l = r)
      : (r === t || e[r][1].type === "lineEnding") &&
        ((e[l][1].type = "codeTextData"),
        r !== l + 2 &&
          ((e[l][1].end = e[r - 1][1].end),
          e.splice(l + 2, r - l - 2),
          (t -= r - l - 2),
          (r = l + 2)),
        (l = void 0));
  return e;
}
function l0(e) {
  return e !== 96 || this.events[this.events.length - 1][1].type === "characterEscape";
}
function i0(e, t, n) {
  let r = 0,
    l,
    i;
  return o;
  function o(f) {
    return (e.enter("codeText"), e.enter("codeTextSequence"), u(f));
  }
  function u(f) {
    return f === 96 ? (e.consume(f), r++, u) : (e.exit("codeTextSequence"), a(f));
  }
  function a(f) {
    return f === null
      ? n(f)
      : f === 32
        ? (e.enter("space"), e.consume(f), e.exit("space"), a)
        : f === 96
          ? ((i = e.enter("codeTextSequence")), (l = 0), c(f))
          : j(f)
            ? (e.enter("lineEnding"), e.consume(f), e.exit("lineEnding"), a)
            : (e.enter("codeTextData"), s(f));
  }
  function s(f) {
    return f === null || f === 32 || f === 96 || j(f)
      ? (e.exit("codeTextData"), a(f))
      : (e.consume(f), s);
  }
  function c(f) {
    return f === 96
      ? (e.consume(f), l++, c)
      : l === r
        ? (e.exit("codeTextSequence"), e.exit("codeText"), t(f))
        : ((i.type = "codeTextData"), s(f));
  }
}
class o0 {
  constructor(t) {
    ((this.left = t ? [...t] : []), (this.right = []));
  }
  get(t) {
    if (t < 0 || t >= this.left.length + this.right.length)
      throw new RangeError(
        "Cannot access index `" +
          t +
          "` in a splice buffer of size `" +
          (this.left.length + this.right.length) +
          "`",
      );
    return t < this.left.length
      ? this.left[t]
      : this.right[this.right.length - t + this.left.length - 1];
  }
  get length() {
    return this.left.length + this.right.length;
  }
  shift() {
    return (this.setCursor(0), this.right.pop());
  }
  slice(t, n) {
    const r = n ?? Number.POSITIVE_INFINITY;
    return r < this.left.length
      ? this.left.slice(t, r)
      : t > this.left.length
        ? this.right
            .slice(
              this.right.length - r + this.left.length,
              this.right.length - t + this.left.length,
            )
            .reverse()
        : this.left
            .slice(t)
            .concat(this.right.slice(this.right.length - r + this.left.length).reverse());
  }
  splice(t, n, r) {
    const l = n || 0;
    this.setCursor(Math.trunc(t));
    const i = this.right.splice(this.right.length - l, Number.POSITIVE_INFINITY);
    return (r && xr(this.left, r), i.reverse());
  }
  pop() {
    return (this.setCursor(Number.POSITIVE_INFINITY), this.left.pop());
  }
  push(t) {
    (this.setCursor(Number.POSITIVE_INFINITY), this.left.push(t));
  }
  pushMany(t) {
    (this.setCursor(Number.POSITIVE_INFINITY), xr(this.left, t));
  }
  unshift(t) {
    (this.setCursor(0), this.right.push(t));
  }
  unshiftMany(t) {
    (this.setCursor(0), xr(this.right, t.reverse()));
  }
  setCursor(t) {
    if (
      !(
        t === this.left.length ||
        (t > this.left.length && this.right.length === 0) ||
        (t < 0 && this.left.length === 0)
      )
    )
      if (t < this.left.length) {
        const n = this.left.splice(t, Number.POSITIVE_INFINITY);
        xr(this.right, n.reverse());
      } else {
        const n = this.right.splice(
          this.left.length + this.right.length - t,
          Number.POSITIVE_INFINITY,
        );
        xr(this.left, n.reverse());
      }
  }
}
function xr(e, t) {
  let n = 0;
  if (t.length < 1e4) e.push(...t);
  else for (; n < t.length; ) (e.push(...t.slice(n, n + 1e4)), (n += 1e4));
}
function ch(e) {
  const t = {};
  let n = -1,
    r,
    l,
    i,
    o,
    u,
    a,
    s;
  const c = new o0(e);
  for (; ++n < c.length; ) {
    for (; n in t; ) n = t[n];
    if (
      ((r = c.get(n)),
      n &&
        r[1].type === "chunkFlow" &&
        c.get(n - 1)[1].type === "listItemPrefix" &&
        ((a = r[1]._tokenizer.events),
        (i = 0),
        i < a.length && a[i][1].type === "lineEndingBlank" && (i += 2),
        i < a.length && a[i][1].type === "content"))
    )
      for (; ++i < a.length && a[i][1].type !== "content"; )
        a[i][1].type === "chunkText" && ((a[i][1]._isInFirstContentOfListItem = !0), i++);
    if (r[0] === "enter") r[1].contentType && (Object.assign(t, u0(c, n)), (n = t[n]), (s = !0));
    else if (r[1]._container) {
      for (i = n, l = void 0; i--; )
        if (((o = c.get(i)), o[1].type === "lineEnding" || o[1].type === "lineEndingBlank"))
          o[0] === "enter" &&
            (l && (c.get(l)[1].type = "lineEndingBlank"), (o[1].type = "lineEnding"), (l = i));
        else if (!(o[1].type === "linePrefix" || o[1].type === "listItemIndent")) break;
      l &&
        ((r[1].end = { ...c.get(l)[1].start }),
        (u = c.slice(l, n)),
        u.unshift(r),
        c.splice(l, n - l + 1, u));
    }
  }
  return (xt(e, 0, Number.POSITIVE_INFINITY, c.slice(0)), !s);
}
function u0(e, t) {
  const n = e.get(t)[1],
    r = e.get(t)[2];
  let l = t - 1;
  const i = [];
  let o = n._tokenizer;
  o ||
    ((o = r.parser[n.contentType](n.start)),
    n._contentTypeTextTrailing && (o._contentTypeTextTrailing = !0));
  const u = o.events,
    a = [],
    s = {};
  let c,
    f,
    d = -1,
    p = n,
    w = 0,
    v = 0;
  const S = [v];
  for (; p; ) {
    for (; e.get(++l)[1] !== p; );
    (i.push(l),
      p._tokenizer ||
        ((c = r.sliceStream(p)),
        p.next || c.push(null),
        f && o.defineSkip(p.start),
        p._isInFirstContentOfListItem && (o._gfmTasklistFirstContentOfListItem = !0),
        o.write(c),
        p._isInFirstContentOfListItem && (o._gfmTasklistFirstContentOfListItem = void 0)),
      (f = p),
      (p = p.next));
  }
  for (p = n; ++d < u.length; )
    u[d][0] === "exit" &&
      u[d - 1][0] === "enter" &&
      u[d][1].type === u[d - 1][1].type &&
      u[d][1].start.line !== u[d][1].end.line &&
      ((v = d + 1), S.push(v), (p._tokenizer = void 0), (p.previous = void 0), (p = p.next));
  for (
    o.events = [], p ? ((p._tokenizer = void 0), (p.previous = void 0)) : S.pop(), d = S.length;
    d--;
  ) {
    const h = u.slice(S[d], S[d + 1]),
      m = i.pop();
    (a.push([m, m + h.length - 1]), e.splice(m, 2, h));
  }
  for (a.reverse(), d = -1; ++d < a.length; )
    ((s[w + a[d][0]] = w + a[d][1]), (w += a[d][1] - a[d][0] - 1));
  return s;
}
const a0 = { resolve: c0, tokenize: f0 },
  s0 = { partial: !0, tokenize: p0 };
function c0(e) {
  return (ch(e), e);
}
function f0(e, t) {
  let n;
  return r;
  function r(u) {
    return (e.enter("content"), (n = e.enter("chunkContent", { contentType: "content" })), l(u));
  }
  function l(u) {
    return u === null ? i(u) : j(u) ? e.check(s0, o, i)(u) : (e.consume(u), l);
  }
  function i(u) {
    return (e.exit("chunkContent"), e.exit("content"), t(u));
  }
  function o(u) {
    return (
      e.consume(u),
      e.exit("chunkContent"),
      (n.next = e.enter("chunkContent", { contentType: "content", previous: n })),
      (n = n.next),
      l
    );
  }
}
function p0(e, t, n) {
  const r = this;
  return l;
  function l(o) {
    return (
      e.exit("chunkContent"),
      e.enter("lineEnding"),
      e.consume(o),
      e.exit("lineEnding"),
      ee(e, i, "linePrefix")
    );
  }
  function i(o) {
    if (o === null || j(o)) return n(o);
    const u = r.events[r.events.length - 1];
    return !r.parser.constructs.disable.null.includes("codeIndented") &&
      u &&
      u[1].type === "linePrefix" &&
      u[2].sliceSerialize(u[1], !0).length >= 4
      ? t(o)
      : e.interrupt(r.parser.constructs.flow, n, t)(o);
  }
}
function fh(e, t, n, r, l, i, o, u, a) {
  const s = a || Number.POSITIVE_INFINITY;
  let c = 0;
  return f;
  function f(h) {
    return h === 60
      ? (e.enter(r), e.enter(l), e.enter(i), e.consume(h), e.exit(i), d)
      : h === null || h === 32 || h === 41 || Fu(h)
        ? n(h)
        : (e.enter(r),
          e.enter(o),
          e.enter(u),
          e.enter("chunkString", { contentType: "string" }),
          v(h));
  }
  function d(h) {
    return h === 62
      ? (e.enter(i), e.consume(h), e.exit(i), e.exit(l), e.exit(r), t)
      : (e.enter(u), e.enter("chunkString", { contentType: "string" }), p(h));
  }
  function p(h) {
    return h === 62
      ? (e.exit("chunkString"), e.exit(u), d(h))
      : h === null || h === 60 || j(h)
        ? n(h)
        : (e.consume(h), h === 92 ? w : p);
  }
  function w(h) {
    return h === 60 || h === 62 || h === 92 ? (e.consume(h), p) : p(h);
  }
  function v(h) {
    return !c && (h === null || h === 41 || je(h))
      ? (e.exit("chunkString"), e.exit(u), e.exit(o), e.exit(r), t(h))
      : c < s && h === 40
        ? (e.consume(h), c++, v)
        : h === 41
          ? (e.consume(h), c--, v)
          : h === null || h === 32 || h === 40 || Fu(h)
            ? n(h)
            : (e.consume(h), h === 92 ? S : v);
  }
  function S(h) {
    return h === 40 || h === 41 || h === 92 ? (e.consume(h), v) : v(h);
  }
}
function ph(e, t, n, r, l, i) {
  const o = this;
  let u = 0,
    a;
  return s;
  function s(p) {
    return (e.enter(r), e.enter(l), e.consume(p), e.exit(l), e.enter(i), c);
  }
  function c(p) {
    return u > 999 ||
      p === null ||
      p === 91 ||
      (p === 93 && !a) ||
      (p === 94 && !u && "_hiddenFootnoteSupport" in o.parser.constructs)
      ? n(p)
      : p === 93
        ? (e.exit(i), e.enter(l), e.consume(p), e.exit(l), e.exit(r), t)
        : j(p)
          ? (e.enter("lineEnding"), e.consume(p), e.exit("lineEnding"), c)
          : (e.enter("chunkString", { contentType: "string" }), f(p));
  }
  function f(p) {
    return p === null || p === 91 || p === 93 || j(p) || u++ > 999
      ? (e.exit("chunkString"), c(p))
      : (e.consume(p), a || (a = !Y(p)), p === 92 ? d : f);
  }
  function d(p) {
    return p === 91 || p === 92 || p === 93 ? (e.consume(p), u++, f) : f(p);
  }
}
function dh(e, t, n, r, l, i) {
  let o;
  return u;
  function u(d) {
    return d === 34 || d === 39 || d === 40
      ? (e.enter(r), e.enter(l), e.consume(d), e.exit(l), (o = d === 40 ? 41 : d), a)
      : n(d);
  }
  function a(d) {
    return d === o ? (e.enter(l), e.consume(d), e.exit(l), e.exit(r), t) : (e.enter(i), s(d));
  }
  function s(d) {
    return d === o
      ? (e.exit(i), a(o))
      : d === null
        ? n(d)
        : j(d)
          ? (e.enter("lineEnding"), e.consume(d), e.exit("lineEnding"), ee(e, s, "linePrefix"))
          : (e.enter("chunkString", { contentType: "string" }), c(d));
  }
  function c(d) {
    return d === o || d === null || j(d)
      ? (e.exit("chunkString"), s(d))
      : (e.consume(d), d === 92 ? f : c);
  }
  function f(d) {
    return d === o || d === 92 ? (e.consume(d), c) : c(d);
  }
}
function Fr(e, t) {
  let n;
  return r;
  function r(l) {
    return j(l)
      ? (e.enter("lineEnding"), e.consume(l), e.exit("lineEnding"), (n = !0), r)
      : Y(l)
        ? ee(e, r, n ? "linePrefix" : "lineSuffix")(l)
        : t(l);
  }
}
const d0 = { name: "definition", tokenize: m0 },
  h0 = { partial: !0, tokenize: g0 };
function m0(e, t, n) {
  const r = this;
  let l;
  return i;
  function i(p) {
    return (e.enter("definition"), o(p));
  }
  function o(p) {
    return ph.call(
      r,
      e,
      u,
      n,
      "definitionLabel",
      "definitionLabelMarker",
      "definitionLabelString",
    )(p);
  }
  function u(p) {
    return (
      (l = Gn(r.sliceSerialize(r.events[r.events.length - 1][1]).slice(1, -1))),
      p === 58 ? (e.enter("definitionMarker"), e.consume(p), e.exit("definitionMarker"), a) : n(p)
    );
  }
  function a(p) {
    return je(p) ? Fr(e, s)(p) : s(p);
  }
  function s(p) {
    return fh(
      e,
      c,
      n,
      "definitionDestination",
      "definitionDestinationLiteral",
      "definitionDestinationLiteralMarker",
      "definitionDestinationRaw",
      "definitionDestinationString",
    )(p);
  }
  function c(p) {
    return e.attempt(h0, f, f)(p);
  }
  function f(p) {
    return Y(p) ? ee(e, d, "whitespace")(p) : d(p);
  }
  function d(p) {
    return p === null || j(p) ? (e.exit("definition"), r.parser.defined.push(l), t(p)) : n(p);
  }
}
function g0(e, t, n) {
  return r;
  function r(u) {
    return je(u) ? Fr(e, l)(u) : n(u);
  }
  function l(u) {
    return dh(e, i, n, "definitionTitle", "definitionTitleMarker", "definitionTitleString")(u);
  }
  function i(u) {
    return Y(u) ? ee(e, o, "whitespace")(u) : o(u);
  }
  function o(u) {
    return u === null || j(u) ? t(u) : n(u);
  }
}
const y0 = { name: "hardBreakEscape", tokenize: v0 };
function v0(e, t, n) {
  return r;
  function r(i) {
    return (e.enter("hardBreakEscape"), e.consume(i), l);
  }
  function l(i) {
    return j(i) ? (e.exit("hardBreakEscape"), t(i)) : n(i);
  }
}
const k0 = { name: "headingAtx", resolve: w0, tokenize: x0 };
function w0(e, t) {
  let n = e.length - 2,
    r = 3,
    l,
    i;
  return (
    e[r][1].type === "whitespace" && (r += 2),
    n - 2 > r && e[n][1].type === "whitespace" && (n -= 2),
    e[n][1].type === "atxHeadingSequence" &&
      (r === n - 1 || (n - 4 > r && e[n - 2][1].type === "whitespace")) &&
      (n -= r + 1 === n ? 2 : 4),
    n > r &&
      ((l = { type: "atxHeadingText", start: e[r][1].start, end: e[n][1].end }),
      (i = { type: "chunkText", start: e[r][1].start, end: e[n][1].end, contentType: "text" }),
      xt(e, r, n - r + 1, [
        ["enter", l, t],
        ["enter", i, t],
        ["exit", i, t],
        ["exit", l, t],
      ])),
    e
  );
}
function x0(e, t, n) {
  let r = 0;
  return l;
  function l(c) {
    return (e.enter("atxHeading"), i(c));
  }
  function i(c) {
    return (e.enter("atxHeadingSequence"), o(c));
  }
  function o(c) {
    return c === 35 && r++ < 6
      ? (e.consume(c), o)
      : c === null || je(c)
        ? (e.exit("atxHeadingSequence"), u(c))
        : n(c);
  }
  function u(c) {
    return c === 35
      ? (e.enter("atxHeadingSequence"), a(c))
      : c === null || j(c)
        ? (e.exit("atxHeading"), t(c))
        : Y(c)
          ? ee(e, u, "whitespace")(c)
          : (e.enter("atxHeadingText"), s(c));
  }
  function a(c) {
    return c === 35 ? (e.consume(c), a) : (e.exit("atxHeadingSequence"), u(c));
  }
  function s(c) {
    return c === null || c === 35 || je(c) ? (e.exit("atxHeadingText"), u(c)) : (e.consume(c), s);
  }
}
const S0 = [
    "address",
    "article",
    "aside",
    "base",
    "basefont",
    "blockquote",
    "body",
    "caption",
    "center",
    "col",
    "colgroup",
    "dd",
    "details",
    "dialog",
    "dir",
    "div",
    "dl",
    "dt",
    "fieldset",
    "figcaption",
    "figure",
    "footer",
    "form",
    "frame",
    "frameset",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "head",
    "header",
    "hr",
    "html",
    "iframe",
    "legend",
    "li",
    "link",
    "main",
    "menu",
    "menuitem",
    "nav",
    "noframes",
    "ol",
    "optgroup",
    "option",
    "p",
    "param",
    "search",
    "section",
    "summary",
    "table",
    "tbody",
    "td",
    "tfoot",
    "th",
    "thead",
    "title",
    "tr",
    "track",
    "ul",
  ],
  Wc = ["pre", "script", "style", "textarea"],
  E0 = { concrete: !0, name: "htmlFlow", resolveTo: _0, tokenize: T0 },
  C0 = { partial: !0, tokenize: N0 },
  P0 = { partial: !0, tokenize: I0 };
function _0(e) {
  let t = e.length;
  for (; t-- && !(e[t][0] === "enter" && e[t][1].type === "htmlFlow"); );
  return (
    t > 1 &&
      e[t - 2][1].type === "linePrefix" &&
      ((e[t][1].start = e[t - 2][1].start),
      (e[t + 1][1].start = e[t - 2][1].start),
      e.splice(t - 2, 2)),
    e
  );
}
function T0(e, t, n) {
  const r = this;
  let l, i, o, u, a;
  return s;
  function s(k) {
    return c(k);
  }
  function c(k) {
    return (e.enter("htmlFlow"), e.enter("htmlFlowData"), e.consume(k), f);
  }
  function f(k) {
    return k === 33
      ? (e.consume(k), d)
      : k === 47
        ? (e.consume(k), (i = !0), v)
        : k === 63
          ? (e.consume(k), (l = 3), r.interrupt ? t : g)
          : yt(k)
            ? (e.consume(k), (o = String.fromCharCode(k)), S)
            : n(k);
  }
  function d(k) {
    return k === 45
      ? (e.consume(k), (l = 2), p)
      : k === 91
        ? (e.consume(k), (l = 5), (u = 0), w)
        : yt(k)
          ? (e.consume(k), (l = 4), r.interrupt ? t : g)
          : n(k);
  }
  function p(k) {
    return k === 45 ? (e.consume(k), r.interrupt ? t : g) : n(k);
  }
  function w(k) {
    const ge = "CDATA[";
    return k === ge.charCodeAt(u++)
      ? (e.consume(k), u === ge.length ? (r.interrupt ? t : A) : w)
      : n(k);
  }
  function v(k) {
    return yt(k) ? (e.consume(k), (o = String.fromCharCode(k)), S) : n(k);
  }
  function S(k) {
    if (k === null || k === 47 || k === 62 || je(k)) {
      const ge = k === 47,
        rt = o.toLowerCase();
      return !ge && !i && Wc.includes(rt)
        ? ((l = 1), r.interrupt ? t(k) : A(k))
        : S0.includes(o.toLowerCase())
          ? ((l = 6), ge ? (e.consume(k), h) : r.interrupt ? t(k) : A(k))
          : ((l = 7), r.interrupt && !r.parser.lazy[r.now().line] ? n(k) : i ? m(k) : y(k));
    }
    return k === 45 || be(k) ? (e.consume(k), (o += String.fromCharCode(k)), S) : n(k);
  }
  function h(k) {
    return k === 62 ? (e.consume(k), r.interrupt ? t : A) : n(k);
  }
  function m(k) {
    return Y(k) ? (e.consume(k), m) : M(k);
  }
  function y(k) {
    return k === 47
      ? (e.consume(k), M)
      : k === 58 || k === 95 || yt(k)
        ? (e.consume(k), E)
        : Y(k)
          ? (e.consume(k), y)
          : M(k);
  }
  function E(k) {
    return k === 45 || k === 46 || k === 58 || k === 95 || be(k) ? (e.consume(k), E) : P(k);
  }
  function P(k) {
    return k === 61 ? (e.consume(k), x) : Y(k) ? (e.consume(k), P) : y(k);
  }
  function x(k) {
    return k === null || k === 60 || k === 61 || k === 62 || k === 96
      ? n(k)
      : k === 34 || k === 39
        ? (e.consume(k), (a = k), T)
        : Y(k)
          ? (e.consume(k), x)
          : L(k);
  }
  function T(k) {
    return k === a ? (e.consume(k), (a = null), F) : k === null || j(k) ? n(k) : (e.consume(k), T);
  }
  function L(k) {
    return k === null ||
      k === 34 ||
      k === 39 ||
      k === 47 ||
      k === 60 ||
      k === 61 ||
      k === 62 ||
      k === 96 ||
      je(k)
      ? P(k)
      : (e.consume(k), L);
  }
  function F(k) {
    return k === 47 || k === 62 || Y(k) ? y(k) : n(k);
  }
  function M(k) {
    return k === 62 ? (e.consume(k), O) : n(k);
  }
  function O(k) {
    return k === null || j(k) ? A(k) : Y(k) ? (e.consume(k), O) : n(k);
  }
  function A(k) {
    return k === 45 && l === 2
      ? (e.consume(k), pe)
      : k === 60 && l === 1
        ? (e.consume(k), ce)
        : k === 62 && l === 4
          ? (e.consume(k), b)
          : k === 63 && l === 3
            ? (e.consume(k), g)
            : k === 93 && l === 5
              ? (e.consume(k), B)
              : j(k) && (l === 6 || l === 7)
                ? (e.exit("htmlFlowData"), e.check(C0, G, X)(k))
                : k === null || j(k)
                  ? (e.exit("htmlFlowData"), X(k))
                  : (e.consume(k), A);
  }
  function X(k) {
    return e.check(P0, ie, G)(k);
  }
  function ie(k) {
    return (e.enter("lineEnding"), e.consume(k), e.exit("lineEnding"), $);
  }
  function $(k) {
    return k === null || j(k) ? X(k) : (e.enter("htmlFlowData"), A(k));
  }
  function pe(k) {
    return k === 45 ? (e.consume(k), g) : A(k);
  }
  function ce(k) {
    return k === 47 ? (e.consume(k), (o = ""), R) : A(k);
  }
  function R(k) {
    if (k === 62) {
      const ge = o.toLowerCase();
      return Wc.includes(ge) ? (e.consume(k), b) : A(k);
    }
    return yt(k) && o.length < 8 ? (e.consume(k), (o += String.fromCharCode(k)), R) : A(k);
  }
  function B(k) {
    return k === 93 ? (e.consume(k), g) : A(k);
  }
  function g(k) {
    return k === 62 ? (e.consume(k), b) : k === 45 && l === 2 ? (e.consume(k), g) : A(k);
  }
  function b(k) {
    return k === null || j(k) ? (e.exit("htmlFlowData"), G(k)) : (e.consume(k), b);
  }
  function G(k) {
    return (e.exit("htmlFlow"), t(k));
  }
}
function I0(e, t, n) {
  const r = this;
  return l;
  function l(o) {
    return j(o) ? (e.enter("lineEnding"), e.consume(o), e.exit("lineEnding"), i) : n(o);
  }
  function i(o) {
    return r.parser.lazy[r.now().line] ? n(o) : t(o);
  }
}
function N0(e, t, n) {
  return r;
  function r(l) {
    return (e.enter("lineEnding"), e.consume(l), e.exit("lineEnding"), e.attempt(bi, t, n));
  }
}
const z0 = { name: "htmlText", tokenize: L0 };
function L0(e, t, n) {
  const r = this;
  let l, i, o;
  return u;
  function u(g) {
    return (e.enter("htmlText"), e.enter("htmlTextData"), e.consume(g), a);
  }
  function a(g) {
    return g === 33
      ? (e.consume(g), s)
      : g === 47
        ? (e.consume(g), P)
        : g === 63
          ? (e.consume(g), y)
          : yt(g)
            ? (e.consume(g), L)
            : n(g);
  }
  function s(g) {
    return g === 45
      ? (e.consume(g), c)
      : g === 91
        ? (e.consume(g), (i = 0), w)
        : yt(g)
          ? (e.consume(g), m)
          : n(g);
  }
  function c(g) {
    return g === 45 ? (e.consume(g), p) : n(g);
  }
  function f(g) {
    return g === null
      ? n(g)
      : g === 45
        ? (e.consume(g), d)
        : j(g)
          ? ((o = f), ce(g))
          : (e.consume(g), f);
  }
  function d(g) {
    return g === 45 ? (e.consume(g), p) : f(g);
  }
  function p(g) {
    return g === 62 ? pe(g) : g === 45 ? d(g) : f(g);
  }
  function w(g) {
    const b = "CDATA[";
    return g === b.charCodeAt(i++) ? (e.consume(g), i === b.length ? v : w) : n(g);
  }
  function v(g) {
    return g === null
      ? n(g)
      : g === 93
        ? (e.consume(g), S)
        : j(g)
          ? ((o = v), ce(g))
          : (e.consume(g), v);
  }
  function S(g) {
    return g === 93 ? (e.consume(g), h) : v(g);
  }
  function h(g) {
    return g === 62 ? pe(g) : g === 93 ? (e.consume(g), h) : v(g);
  }
  function m(g) {
    return g === null || g === 62 ? pe(g) : j(g) ? ((o = m), ce(g)) : (e.consume(g), m);
  }
  function y(g) {
    return g === null
      ? n(g)
      : g === 63
        ? (e.consume(g), E)
        : j(g)
          ? ((o = y), ce(g))
          : (e.consume(g), y);
  }
  function E(g) {
    return g === 62 ? pe(g) : y(g);
  }
  function P(g) {
    return yt(g) ? (e.consume(g), x) : n(g);
  }
  function x(g) {
    return g === 45 || be(g) ? (e.consume(g), x) : T(g);
  }
  function T(g) {
    return j(g) ? ((o = T), ce(g)) : Y(g) ? (e.consume(g), T) : pe(g);
  }
  function L(g) {
    return g === 45 || be(g) ? (e.consume(g), L) : g === 47 || g === 62 || je(g) ? F(g) : n(g);
  }
  function F(g) {
    return g === 47
      ? (e.consume(g), pe)
      : g === 58 || g === 95 || yt(g)
        ? (e.consume(g), M)
        : j(g)
          ? ((o = F), ce(g))
          : Y(g)
            ? (e.consume(g), F)
            : pe(g);
  }
  function M(g) {
    return g === 45 || g === 46 || g === 58 || g === 95 || be(g) ? (e.consume(g), M) : O(g);
  }
  function O(g) {
    return g === 61 ? (e.consume(g), A) : j(g) ? ((o = O), ce(g)) : Y(g) ? (e.consume(g), O) : F(g);
  }
  function A(g) {
    return g === null || g === 60 || g === 61 || g === 62 || g === 96
      ? n(g)
      : g === 34 || g === 39
        ? (e.consume(g), (l = g), X)
        : j(g)
          ? ((o = A), ce(g))
          : Y(g)
            ? (e.consume(g), A)
            : (e.consume(g), ie);
  }
  function X(g) {
    return g === l
      ? (e.consume(g), (l = void 0), $)
      : g === null
        ? n(g)
        : j(g)
          ? ((o = X), ce(g))
          : (e.consume(g), X);
  }
  function ie(g) {
    return g === null || g === 34 || g === 39 || g === 60 || g === 61 || g === 96
      ? n(g)
      : g === 47 || g === 62 || je(g)
        ? F(g)
        : (e.consume(g), ie);
  }
  function $(g) {
    return g === 47 || g === 62 || je(g) ? F(g) : n(g);
  }
  function pe(g) {
    return g === 62 ? (e.consume(g), e.exit("htmlTextData"), e.exit("htmlText"), t) : n(g);
  }
  function ce(g) {
    return (e.exit("htmlTextData"), e.enter("lineEnding"), e.consume(g), e.exit("lineEnding"), R);
  }
  function R(g) {
    return Y(g)
      ? ee(
          e,
          B,
          "linePrefix",
          r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4,
        )(g)
      : B(g);
  }
  function B(g) {
    return (e.enter("htmlTextData"), o(g));
  }
}
const Ga = { name: "labelEnd", resolveAll: M0, resolveTo: A0, tokenize: F0 },
  R0 = { tokenize: B0 },
  O0 = { tokenize: j0 },
  D0 = { tokenize: U0 };
function M0(e) {
  let t = -1;
  const n = [];
  for (; ++t < e.length; ) {
    const r = e[t][1];
    if (
      (n.push(e[t]), r.type === "labelImage" || r.type === "labelLink" || r.type === "labelEnd")
    ) {
      const l = r.type === "labelImage" ? 4 : 2;
      ((r.type = "data"), (t += l));
    }
  }
  return (e.length !== n.length && xt(e, 0, e.length, n), e);
}
function A0(e, t) {
  let n = e.length,
    r = 0,
    l,
    i,
    o,
    u;
  for (; n--; )
    if (((l = e[n][1]), i)) {
      if (l.type === "link" || (l.type === "labelLink" && l._inactive)) break;
      e[n][0] === "enter" && l.type === "labelLink" && (l._inactive = !0);
    } else if (o) {
      if (
        e[n][0] === "enter" &&
        (l.type === "labelImage" || l.type === "labelLink") &&
        !l._balanced &&
        ((i = n), l.type !== "labelLink")
      ) {
        r = 2;
        break;
      }
    } else l.type === "labelEnd" && (o = n);
  const a = {
      type: e[i][1].type === "labelLink" ? "link" : "image",
      start: { ...e[i][1].start },
      end: { ...e[e.length - 1][1].end },
    },
    s = { type: "label", start: { ...e[i][1].start }, end: { ...e[o][1].end } },
    c = { type: "labelText", start: { ...e[i + r + 2][1].end }, end: { ...e[o - 2][1].start } };
  return (
    (u = [
      ["enter", a, t],
      ["enter", s, t],
    ]),
    (u = Je(u, e.slice(i + 1, i + r + 3))),
    (u = Je(u, [["enter", c, t]])),
    (u = Je(u, Ka(t.parser.constructs.insideSpan.null, e.slice(i + r + 4, o - 3), t))),
    (u = Je(u, [["exit", c, t], e[o - 2], e[o - 1], ["exit", s, t]])),
    (u = Je(u, e.slice(o + 1))),
    (u = Je(u, [["exit", a, t]])),
    xt(e, i, e.length, u),
    e
  );
}
function F0(e, t, n) {
  const r = this;
  let l = r.events.length,
    i,
    o;
  for (; l--; )
    if (
      (r.events[l][1].type === "labelImage" || r.events[l][1].type === "labelLink") &&
      !r.events[l][1]._balanced
    ) {
      i = r.events[l][1];
      break;
    }
  return u;
  function u(d) {
    return i
      ? i._inactive
        ? f(d)
        : ((o = r.parser.defined.includes(Gn(r.sliceSerialize({ start: i.end, end: r.now() })))),
          e.enter("labelEnd"),
          e.enter("labelMarker"),
          e.consume(d),
          e.exit("labelMarker"),
          e.exit("labelEnd"),
          a)
      : n(d);
  }
  function a(d) {
    return d === 40
      ? e.attempt(R0, c, o ? c : f)(d)
      : d === 91
        ? e.attempt(O0, c, o ? s : f)(d)
        : o
          ? c(d)
          : f(d);
  }
  function s(d) {
    return e.attempt(D0, c, f)(d);
  }
  function c(d) {
    return t(d);
  }
  function f(d) {
    return ((i._balanced = !0), n(d));
  }
}
function B0(e, t, n) {
  return r;
  function r(f) {
    return (
      e.enter("resource"),
      e.enter("resourceMarker"),
      e.consume(f),
      e.exit("resourceMarker"),
      l
    );
  }
  function l(f) {
    return je(f) ? Fr(e, i)(f) : i(f);
  }
  function i(f) {
    return f === 41
      ? c(f)
      : fh(
          e,
          o,
          u,
          "resourceDestination",
          "resourceDestinationLiteral",
          "resourceDestinationLiteralMarker",
          "resourceDestinationRaw",
          "resourceDestinationString",
          32,
        )(f);
  }
  function o(f) {
    return je(f) ? Fr(e, a)(f) : c(f);
  }
  function u(f) {
    return n(f);
  }
  function a(f) {
    return f === 34 || f === 39 || f === 40
      ? dh(e, s, n, "resourceTitle", "resourceTitleMarker", "resourceTitleString")(f)
      : c(f);
  }
  function s(f) {
    return je(f) ? Fr(e, c)(f) : c(f);
  }
  function c(f) {
    return f === 41
      ? (e.enter("resourceMarker"), e.consume(f), e.exit("resourceMarker"), e.exit("resource"), t)
      : n(f);
  }
}
function j0(e, t, n) {
  const r = this;
  return l;
  function l(u) {
    return ph.call(r, e, i, o, "reference", "referenceMarker", "referenceString")(u);
  }
  function i(u) {
    return r.parser.defined.includes(
      Gn(r.sliceSerialize(r.events[r.events.length - 1][1]).slice(1, -1)),
    )
      ? t(u)
      : n(u);
  }
  function o(u) {
    return n(u);
  }
}
function U0(e, t, n) {
  return r;
  function r(i) {
    return (
      e.enter("reference"),
      e.enter("referenceMarker"),
      e.consume(i),
      e.exit("referenceMarker"),
      l
    );
  }
  function l(i) {
    return i === 93
      ? (e.enter("referenceMarker"),
        e.consume(i),
        e.exit("referenceMarker"),
        e.exit("reference"),
        t)
      : n(i);
  }
}
const V0 = { name: "labelStartImage", resolveAll: Ga.resolveAll, tokenize: H0 };
function H0(e, t, n) {
  const r = this;
  return l;
  function l(u) {
    return (
      e.enter("labelImage"),
      e.enter("labelImageMarker"),
      e.consume(u),
      e.exit("labelImageMarker"),
      i
    );
  }
  function i(u) {
    return u === 91
      ? (e.enter("labelMarker"), e.consume(u), e.exit("labelMarker"), e.exit("labelImage"), o)
      : n(u);
  }
  function o(u) {
    return u === 94 && "_hiddenFootnoteSupport" in r.parser.constructs ? n(u) : t(u);
  }
}
const $0 = { name: "labelStartLink", resolveAll: Ga.resolveAll, tokenize: W0 };
function W0(e, t, n) {
  const r = this;
  return l;
  function l(o) {
    return (
      e.enter("labelLink"),
      e.enter("labelMarker"),
      e.consume(o),
      e.exit("labelMarker"),
      e.exit("labelLink"),
      i
    );
  }
  function i(o) {
    return o === 94 && "_hiddenFootnoteSupport" in r.parser.constructs ? n(o) : t(o);
  }
}
const To = { name: "lineEnding", tokenize: b0 };
function b0(e, t) {
  return n;
  function n(r) {
    return (e.enter("lineEnding"), e.consume(r), e.exit("lineEnding"), ee(e, t, "linePrefix"));
  }
}
const Kl = { name: "thematicBreak", tokenize: Q0 };
function Q0(e, t, n) {
  let r = 0,
    l;
  return i;
  function i(s) {
    return (e.enter("thematicBreak"), o(s));
  }
  function o(s) {
    return ((l = s), u(s));
  }
  function u(s) {
    return s === l
      ? (e.enter("thematicBreakSequence"), a(s))
      : r >= 3 && (s === null || j(s))
        ? (e.exit("thematicBreak"), t(s))
        : n(s);
  }
  function a(s) {
    return s === l
      ? (e.consume(s), r++, a)
      : (e.exit("thematicBreakSequence"), Y(s) ? ee(e, u, "whitespace")(s) : u(s));
  }
}
const Oe = { continuation: { tokenize: G0 }, exit: J0, name: "list", tokenize: K0 },
  Y0 = { partial: !0, tokenize: Z0 },
  X0 = { partial: !0, tokenize: q0 };
function K0(e, t, n) {
  const r = this,
    l = r.events[r.events.length - 1];
  let i = l && l[1].type === "linePrefix" ? l[2].sliceSerialize(l[1], !0).length : 0,
    o = 0;
  return u;
  function u(p) {
    const w =
      r.containerState.type || (p === 42 || p === 43 || p === 45 ? "listUnordered" : "listOrdered");
    if (w === "listUnordered" ? !r.containerState.marker || p === r.containerState.marker : Bu(p)) {
      if (
        (r.containerState.type || ((r.containerState.type = w), e.enter(w, { _container: !0 })),
        w === "listUnordered")
      )
        return (e.enter("listItemPrefix"), p === 42 || p === 45 ? e.check(Kl, n, s)(p) : s(p));
      if (!r.interrupt || p === 49)
        return (e.enter("listItemPrefix"), e.enter("listItemValue"), a(p));
    }
    return n(p);
  }
  function a(p) {
    return Bu(p) && ++o < 10
      ? (e.consume(p), a)
      : (!r.interrupt || o < 2) &&
          (r.containerState.marker ? p === r.containerState.marker : p === 41 || p === 46)
        ? (e.exit("listItemValue"), s(p))
        : n(p);
  }
  function s(p) {
    return (
      e.enter("listItemMarker"),
      e.consume(p),
      e.exit("listItemMarker"),
      (r.containerState.marker = r.containerState.marker || p),
      e.check(bi, r.interrupt ? n : c, e.attempt(Y0, d, f))
    );
  }
  function c(p) {
    return ((r.containerState.initialBlankLine = !0), i++, d(p));
  }
  function f(p) {
    return Y(p)
      ? (e.enter("listItemPrefixWhitespace"), e.consume(p), e.exit("listItemPrefixWhitespace"), d)
      : n(p);
  }
  function d(p) {
    return (
      (r.containerState.size = i + r.sliceSerialize(e.exit("listItemPrefix"), !0).length),
      t(p)
    );
  }
}
function G0(e, t, n) {
  const r = this;
  return ((r.containerState._closeFlow = void 0), e.check(bi, l, i));
  function l(u) {
    return (
      (r.containerState.furtherBlankLines =
        r.containerState.furtherBlankLines || r.containerState.initialBlankLine),
      ee(e, t, "listItemIndent", r.containerState.size + 1)(u)
    );
  }
  function i(u) {
    return r.containerState.furtherBlankLines || !Y(u)
      ? ((r.containerState.furtherBlankLines = void 0),
        (r.containerState.initialBlankLine = void 0),
        o(u))
      : ((r.containerState.furtherBlankLines = void 0),
        (r.containerState.initialBlankLine = void 0),
        e.attempt(X0, t, o)(u));
  }
  function o(u) {
    return (
      (r.containerState._closeFlow = !0),
      (r.interrupt = void 0),
      ee(
        e,
        e.attempt(Oe, t, n),
        "linePrefix",
        r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4,
      )(u)
    );
  }
}
function q0(e, t, n) {
  const r = this;
  return ee(e, l, "listItemIndent", r.containerState.size + 1);
  function l(i) {
    const o = r.events[r.events.length - 1];
    return o &&
      o[1].type === "listItemIndent" &&
      o[2].sliceSerialize(o[1], !0).length === r.containerState.size
      ? t(i)
      : n(i);
  }
}
function J0(e) {
  e.exit(this.containerState.type);
}
function Z0(e, t, n) {
  const r = this;
  return ee(
    e,
    l,
    "listItemPrefixWhitespace",
    r.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 5,
  );
  function l(i) {
    const o = r.events[r.events.length - 1];
    return !Y(i) && o && o[1].type === "listItemPrefixWhitespace" ? t(i) : n(i);
  }
}
const bc = { name: "setextUnderline", resolveTo: ek, tokenize: tk };
function ek(e, t) {
  let n = e.length,
    r,
    l,
    i;
  for (; n--; )
    if (e[n][0] === "enter") {
      if (e[n][1].type === "content") {
        r = n;
        break;
      }
      e[n][1].type === "paragraph" && (l = n);
    } else
      (e[n][1].type === "content" && e.splice(n, 1),
        !i && e[n][1].type === "definition" && (i = n));
  const o = {
    type: "setextHeading",
    start: { ...e[r][1].start },
    end: { ...e[e.length - 1][1].end },
  };
  return (
    (e[l][1].type = "setextHeadingText"),
    i
      ? (e.splice(l, 0, ["enter", o, t]),
        e.splice(i + 1, 0, ["exit", e[r][1], t]),
        (e[r][1].end = { ...e[i][1].end }))
      : (e[r][1] = o),
    e.push(["exit", o, t]),
    e
  );
}
function tk(e, t, n) {
  const r = this;
  let l;
  return i;
  function i(s) {
    let c = r.events.length,
      f;
    for (; c--; )
      if (
        r.events[c][1].type !== "lineEnding" &&
        r.events[c][1].type !== "linePrefix" &&
        r.events[c][1].type !== "content"
      ) {
        f = r.events[c][1].type === "paragraph";
        break;
      }
    return !r.parser.lazy[r.now().line] && (r.interrupt || f)
      ? (e.enter("setextHeadingLine"), (l = s), o(s))
      : n(s);
  }
  function o(s) {
    return (e.enter("setextHeadingLineSequence"), u(s));
  }
  function u(s) {
    return s === l
      ? (e.consume(s), u)
      : (e.exit("setextHeadingLineSequence"), Y(s) ? ee(e, a, "lineSuffix")(s) : a(s));
  }
  function a(s) {
    return s === null || j(s) ? (e.exit("setextHeadingLine"), t(s)) : n(s);
  }
}
const nk = { tokenize: rk };
function rk(e) {
  const t = this,
    n = e.attempt(
      bi,
      r,
      e.attempt(
        this.parser.constructs.flowInitial,
        l,
        ee(e, e.attempt(this.parser.constructs.flow, l, e.attempt(a0, l)), "linePrefix"),
      ),
    );
  return n;
  function r(i) {
    if (i === null) {
      e.consume(i);
      return;
    }
    return (
      e.enter("lineEndingBlank"),
      e.consume(i),
      e.exit("lineEndingBlank"),
      (t.currentConstruct = void 0),
      n
    );
  }
  function l(i) {
    if (i === null) {
      e.consume(i);
      return;
    }
    return (
      e.enter("lineEnding"),
      e.consume(i),
      e.exit("lineEnding"),
      (t.currentConstruct = void 0),
      n
    );
  }
}
const lk = { resolveAll: mh() },
  ik = hh("string"),
  ok = hh("text");
function hh(e) {
  return { resolveAll: mh(e === "text" ? uk : void 0), tokenize: t };
  function t(n) {
    const r = this,
      l = this.parser.constructs[e],
      i = n.attempt(l, o, u);
    return o;
    function o(c) {
      return s(c) ? i(c) : u(c);
    }
    function u(c) {
      if (c === null) {
        n.consume(c);
        return;
      }
      return (n.enter("data"), n.consume(c), a);
    }
    function a(c) {
      return s(c) ? (n.exit("data"), i(c)) : (n.consume(c), a);
    }
    function s(c) {
      if (c === null) return !0;
      const f = l[c];
      let d = -1;
      if (f)
        for (; ++d < f.length; ) {
          const p = f[d];
          if (!p.previous || p.previous.call(r, r.previous)) return !0;
        }
      return !1;
    }
  }
}
function mh(e) {
  return t;
  function t(n, r) {
    let l = -1,
      i;
    for (; ++l <= n.length; )
      i === void 0
        ? n[l] && n[l][1].type === "data" && ((i = l), l++)
        : (!n[l] || n[l][1].type !== "data") &&
          (l !== i + 2 &&
            ((n[i][1].end = n[l - 1][1].end), n.splice(i + 2, l - i - 2), (l = i + 2)),
          (i = void 0));
    return e ? e(n, r) : n;
  }
}
function uk(e, t) {
  let n = 0;
  for (; ++n <= e.length; )
    if ((n === e.length || e[n][1].type === "lineEnding") && e[n - 1][1].type === "data") {
      const r = e[n - 1][1],
        l = t.sliceStream(r);
      let i = l.length,
        o = -1,
        u = 0,
        a;
      for (; i--; ) {
        const s = l[i];
        if (typeof s == "string") {
          for (o = s.length; s.charCodeAt(o - 1) === 32; ) (u++, o--);
          if (o) break;
          o = -1;
        } else if (s === -2) ((a = !0), u++);
        else if (s !== -1) {
          i++;
          break;
        }
      }
      if ((t._contentTypeTextTrailing && n === e.length && (u = 0), u)) {
        const s = {
          type: n === e.length || a || u < 2 ? "lineSuffix" : "hardBreakTrailing",
          start: {
            _bufferIndex: i ? o : r.start._bufferIndex + o,
            _index: r.start._index + i,
            line: r.end.line,
            column: r.end.column - u,
            offset: r.end.offset - u,
          },
          end: { ...r.end },
        };
        ((r.end = { ...s.start }),
          r.start.offset === r.end.offset
            ? Object.assign(r, s)
            : (e.splice(n, 0, ["enter", s, t], ["exit", s, t]), (n += 2)));
      }
      n++;
    }
  return e;
}
const ak = {
    42: Oe,
    43: Oe,
    45: Oe,
    48: Oe,
    49: Oe,
    50: Oe,
    51: Oe,
    52: Oe,
    53: Oe,
    54: Oe,
    55: Oe,
    56: Oe,
    57: Oe,
    62: uh,
  },
  sk = { 91: d0 },
  ck = { [-2]: _o, [-1]: _o, 32: _o },
  fk = { 35: k0, 42: Kl, 45: [bc, Kl], 60: E0, 61: bc, 95: Kl, 96: $c, 126: $c },
  pk = { 38: sh, 92: ah },
  dk = {
    [-5]: To,
    [-4]: To,
    [-3]: To,
    33: V0,
    38: sh,
    42: ju,
    60: [$1, z0],
    91: $0,
    92: [y0, ah],
    93: Ga,
    95: ju,
    96: n0,
  },
  hk = { null: [ju, lk] },
  mk = { null: [42, 95] },
  gk = { null: [] },
  yk = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        attentionMarkers: mk,
        contentInitial: sk,
        disable: gk,
        document: ak,
        flow: fk,
        flowInitial: ck,
        insideSpan: hk,
        string: pk,
        text: dk,
      },
      Symbol.toStringTag,
      { value: "Module" },
    ),
  );
function vk(e, t, n) {
  let r = {
    _bufferIndex: -1,
    _index: 0,
    line: (n && n.line) || 1,
    column: (n && n.column) || 1,
    offset: (n && n.offset) || 0,
  };
  const l = {},
    i = [];
  let o = [],
    u = [];
  const a = {
      attempt: T(P),
      check: T(x),
      consume: m,
      enter: y,
      exit: E,
      interrupt: T(x, { interrupt: !0 }),
    },
    s = {
      code: null,
      containerState: {},
      defineSkip: v,
      events: [],
      now: w,
      parser: e,
      previous: null,
      sliceSerialize: d,
      sliceStream: p,
      write: f,
    };
  let c = t.tokenize.call(s, a);
  return (t.resolveAll && i.push(t), s);
  function f(O) {
    return (
      (o = Je(o, O)),
      S(),
      o[o.length - 1] !== null ? [] : (L(t, 0), (s.events = Ka(i, s.events, s)), s.events)
    );
  }
  function d(O, A) {
    return wk(p(O), A);
  }
  function p(O) {
    return kk(o, O);
  }
  function w() {
    const { _bufferIndex: O, _index: A, line: X, column: ie, offset: $ } = r;
    return { _bufferIndex: O, _index: A, line: X, column: ie, offset: $ };
  }
  function v(O) {
    ((l[O.line] = O.column), M());
  }
  function S() {
    let O;
    for (; r._index < o.length; ) {
      const A = o[r._index];
      if (typeof A == "string")
        for (
          O = r._index, r._bufferIndex < 0 && (r._bufferIndex = 0);
          r._index === O && r._bufferIndex < A.length;
        )
          h(A.charCodeAt(r._bufferIndex));
      else h(A);
    }
  }
  function h(O) {
    c = c(O);
  }
  function m(O) {
    (j(O)
      ? (r.line++, (r.column = 1), (r.offset += O === -3 ? 2 : 1), M())
      : O !== -1 && (r.column++, r.offset++),
      r._bufferIndex < 0
        ? r._index++
        : (r._bufferIndex++,
          r._bufferIndex === o[r._index].length && ((r._bufferIndex = -1), r._index++)),
      (s.previous = O));
  }
  function y(O, A) {
    const X = A || {};
    return ((X.type = O), (X.start = w()), s.events.push(["enter", X, s]), u.push(X), X);
  }
  function E(O) {
    const A = u.pop();
    return ((A.end = w()), s.events.push(["exit", A, s]), A);
  }
  function P(O, A) {
    L(O, A.from);
  }
  function x(O, A) {
    A.restore();
  }
  function T(O, A) {
    return X;
    function X(ie, $, pe) {
      let ce, R, B, g;
      return Array.isArray(ie) ? G(ie) : "tokenize" in ie ? G([ie]) : b(ie);
      function b(te) {
        return pt;
        function pt(Dt) {
          const Cn = Dt !== null && te[Dt],
            Pn = Dt !== null && te.null,
            hl = [
              ...(Array.isArray(Cn) ? Cn : Cn ? [Cn] : []),
              ...(Array.isArray(Pn) ? Pn : Pn ? [Pn] : []),
            ];
          return G(hl)(Dt);
        }
      }
      function G(te) {
        return ((ce = te), (R = 0), te.length === 0 ? pe : k(te[R]));
      }
      function k(te) {
        return pt;
        function pt(Dt) {
          return (
            (g = F()),
            (B = te),
            te.partial || (s.currentConstruct = te),
            te.name && s.parser.constructs.disable.null.includes(te.name)
              ? rt()
              : te.tokenize.call(A ? Object.assign(Object.create(s), A) : s, a, ge, rt)(Dt)
          );
        }
      }
      function ge(te) {
        return (O(B, g), $);
      }
      function rt(te) {
        return (g.restore(), ++R < ce.length ? k(ce[R]) : pe);
      }
    }
  }
  function L(O, A) {
    (O.resolveAll && !i.includes(O) && i.push(O),
      O.resolve && xt(s.events, A, s.events.length - A, O.resolve(s.events.slice(A), s)),
      O.resolveTo && (s.events = O.resolveTo(s.events, s)));
  }
  function F() {
    const O = w(),
      A = s.previous,
      X = s.currentConstruct,
      ie = s.events.length,
      $ = Array.from(u);
    return { from: ie, restore: pe };
    function pe() {
      ((r = O), (s.previous = A), (s.currentConstruct = X), (s.events.length = ie), (u = $), M());
    }
  }
  function M() {
    r.line in l && r.column < 2 && ((r.column = l[r.line]), (r.offset += l[r.line] - 1));
  }
}
function kk(e, t) {
  const n = t.start._index,
    r = t.start._bufferIndex,
    l = t.end._index,
    i = t.end._bufferIndex;
  let o;
  if (n === l) o = [e[n].slice(r, i)];
  else {
    if (((o = e.slice(n, l)), r > -1)) {
      const u = o[0];
      typeof u == "string" ? (o[0] = u.slice(r)) : o.shift();
    }
    i > 0 && o.push(e[l].slice(0, i));
  }
  return o;
}
function wk(e, t) {
  let n = -1;
  const r = [];
  let l;
  for (; ++n < e.length; ) {
    const i = e[n];
    let o;
    if (typeof i == "string") o = i;
    else
      switch (i) {
        case -5: {
          o = "\r";
          break;
        }
        case -4: {
          o = `
`;
          break;
        }
        case -3: {
          o = `\r
`;
          break;
        }
        case -2: {
          o = t ? " " : "	";
          break;
        }
        case -1: {
          if (!t && l) continue;
          o = " ";
          break;
        }
        default:
          o = String.fromCharCode(i);
      }
    ((l = i === -2), r.push(o));
  }
  return r.join("");
}
function xk(e) {
  const r = {
    constructs: I1([yk, ...((e || {}).extensions || [])]),
    content: l(A1),
    defined: [],
    document: l(B1),
    flow: l(nk),
    lazy: {},
    string: l(ik),
    text: l(ok),
  };
  return r;
  function l(i) {
    return o;
    function o(u) {
      return vk(r, i, u);
    }
  }
}
function Sk(e) {
  for (; !ch(e); );
  return e;
}
const Qc = /[\0\t\n\r]/g;
function Ek() {
  let e = 1,
    t = "",
    n = !0,
    r;
  return l;
  function l(i, o, u) {
    const a = [];
    let s, c, f, d, p;
    for (
      i = t + (typeof i == "string" ? i.toString() : new TextDecoder(o || void 0).decode(i)),
        f = 0,
        t = "",
        n && (i.charCodeAt(0) === 65279 && f++, (n = void 0));
      f < i.length;
    ) {
      if (
        ((Qc.lastIndex = f),
        (s = Qc.exec(i)),
        (d = s && s.index !== void 0 ? s.index : i.length),
        (p = i.charCodeAt(d)),
        !s)
      ) {
        t = i.slice(f);
        break;
      }
      if (p === 10 && f === d && r) (a.push(-3), (r = void 0));
      else
        switch (
          (r && (a.push(-5), (r = void 0)), f < d && (a.push(i.slice(f, d)), (e += d - f)), p)
        ) {
          case 0: {
            (a.push(65533), e++);
            break;
          }
          case 9: {
            for (c = Math.ceil(e / 4) * 4, a.push(-2); e++ < c; ) a.push(-1);
            break;
          }
          case 10: {
            (a.push(-4), (e = 1));
            break;
          }
          default:
            ((r = !0), (e = 1));
        }
      f = d + 1;
    }
    return (u && (r && a.push(-5), t && a.push(t), a.push(null)), a);
  }
}
const Ck = /\\([!-/:-@[-`{-~])|&(#(?:\d{1,7}|x[\da-f]{1,6})|[\da-z]{1,31});/gi;
function Pk(e) {
  return e.replace(Ck, _k);
}
function _k(e, t, n) {
  if (t) return t;
  if (n.charCodeAt(0) === 35) {
    const l = n.charCodeAt(1),
      i = l === 120 || l === 88;
    return oh(n.slice(i ? 2 : 1), i ? 16 : 10);
  }
  return Xa(n) || e;
}
const gh = {}.hasOwnProperty;
function Tk(e, t, n) {
  return (
    t && typeof t == "object" && ((n = t), (t = void 0)),
    Ik(n)(
      Sk(
        xk(n)
          .document()
          .write(Ek()(e, t, !0)),
      ),
    )
  );
}
function Ik(e) {
  const t = {
    transforms: [],
    canContainEols: ["emphasis", "fragment", "heading", "paragraph", "strong"],
    enter: {
      autolink: i(is),
      autolinkProtocol: F,
      autolinkEmail: F,
      atxHeading: i(ns),
      blockQuote: i(Pn),
      characterEscape: F,
      characterReference: F,
      codeFenced: i(hl),
      codeFencedFenceInfo: o,
      codeFencedFenceMeta: o,
      codeIndented: i(hl, o),
      codeText: i(Mh, o),
      codeTextData: F,
      data: F,
      codeFlowValue: F,
      definition: i(Ah),
      definitionDestinationString: o,
      definitionLabelString: o,
      definitionTitleString: o,
      emphasis: i(Fh),
      hardBreakEscape: i(rs),
      hardBreakTrailing: i(rs),
      htmlFlow: i(ls, o),
      htmlFlowData: F,
      htmlText: i(ls, o),
      htmlTextData: F,
      image: i(Bh),
      label: o,
      link: i(is),
      listItem: i(jh),
      listItemValue: d,
      listOrdered: i(os, f),
      listUnordered: i(os),
      paragraph: i(Uh),
      reference: k,
      referenceString: o,
      resourceDestinationString: o,
      resourceTitleString: o,
      setextHeading: i(ns),
      strong: i(Vh),
      thematicBreak: i($h),
    },
    exit: {
      atxHeading: a(),
      atxHeadingSequence: P,
      autolink: a(),
      autolinkEmail: Cn,
      autolinkProtocol: Dt,
      blockQuote: a(),
      characterEscapeValue: M,
      characterReferenceMarkerHexadecimal: rt,
      characterReferenceMarkerNumeric: rt,
      characterReferenceValue: te,
      characterReference: pt,
      codeFenced: a(S),
      codeFencedFence: v,
      codeFencedFenceInfo: p,
      codeFencedFenceMeta: w,
      codeFlowValue: M,
      codeIndented: a(h),
      codeText: a($),
      codeTextData: M,
      data: M,
      definition: a(),
      definitionDestinationString: E,
      definitionLabelString: m,
      definitionTitleString: y,
      emphasis: a(),
      hardBreakEscape: a(A),
      hardBreakTrailing: a(A),
      htmlFlow: a(X),
      htmlFlowData: M,
      htmlText: a(ie),
      htmlTextData: M,
      image: a(ce),
      label: B,
      labelText: R,
      lineEnding: O,
      link: a(pe),
      listItem: a(),
      listOrdered: a(),
      listUnordered: a(),
      paragraph: a(),
      referenceString: ge,
      resourceDestinationString: g,
      resourceTitleString: b,
      resource: G,
      setextHeading: a(L),
      setextHeadingLineSequence: T,
      setextHeadingText: x,
      strong: a(),
      thematicBreak: a(),
    },
  };
  yh(t, (e || {}).mdastExtensions || []);
  const n = {};
  return r;
  function r(C) {
    let z = { type: "root", children: [] };
    const U = {
        stack: [z],
        tokenStack: [],
        config: t,
        enter: u,
        exit: s,
        buffer: o,
        resume: c,
        data: n,
      },
      W = [];
    let q = -1;
    for (; ++q < C.length; )
      if (C[q][1].type === "listOrdered" || C[q][1].type === "listUnordered")
        if (C[q][0] === "enter") W.push(q);
        else {
          const lt = W.pop();
          q = l(C, lt, q);
        }
    for (q = -1; ++q < C.length; ) {
      const lt = t[C[q][0]];
      gh.call(lt, C[q][1].type) &&
        lt[C[q][1].type].call(
          Object.assign({ sliceSerialize: C[q][2].sliceSerialize }, U),
          C[q][1],
        );
    }
    if (U.tokenStack.length > 0) {
      const lt = U.tokenStack[U.tokenStack.length - 1];
      (lt[1] || Yc).call(U, void 0, lt[0]);
    }
    for (
      z.position = {
        start: At(C.length > 0 ? C[0][1].start : { line: 1, column: 1, offset: 0 }),
        end: At(C.length > 0 ? C[C.length - 2][1].end : { line: 1, column: 1, offset: 0 }),
      },
        q = -1;
      ++q < t.transforms.length;
    )
      z = t.transforms[q](z) || z;
    return z;
  }
  function l(C, z, U) {
    let W = z - 1,
      q = -1,
      lt = !1,
      on,
      St,
      fr,
      pr;
    for (; ++W <= U; ) {
      const Ve = C[W];
      switch (Ve[1].type) {
        case "listUnordered":
        case "listOrdered":
        case "blockQuote": {
          (Ve[0] === "enter" ? q++ : q--, (pr = void 0));
          break;
        }
        case "lineEndingBlank": {
          Ve[0] === "enter" && (on && !pr && !q && !fr && (fr = W), (pr = void 0));
          break;
        }
        case "linePrefix":
        case "listItemValue":
        case "listItemMarker":
        case "listItemPrefix":
        case "listItemPrefixWhitespace":
          break;
        default:
          pr = void 0;
      }
      if (
        (!q && Ve[0] === "enter" && Ve[1].type === "listItemPrefix") ||
        (q === -1 &&
          Ve[0] === "exit" &&
          (Ve[1].type === "listUnordered" || Ve[1].type === "listOrdered"))
      ) {
        if (on) {
          let _n = W;
          for (St = void 0; _n--; ) {
            const Et = C[_n];
            if (Et[1].type === "lineEnding" || Et[1].type === "lineEndingBlank") {
              if (Et[0] === "exit") continue;
              (St && ((C[St][1].type = "lineEndingBlank"), (lt = !0)),
                (Et[1].type = "lineEnding"),
                (St = _n));
            } else if (
              !(
                Et[1].type === "linePrefix" ||
                Et[1].type === "blockQuotePrefix" ||
                Et[1].type === "blockQuotePrefixWhitespace" ||
                Et[1].type === "blockQuoteMarker" ||
                Et[1].type === "listItemIndent"
              )
            )
              break;
          }
          (fr && (!St || fr < St) && (on._spread = !0),
            (on.end = Object.assign({}, St ? C[St][1].start : Ve[1].end)),
            C.splice(St || W, 0, ["exit", on, Ve[2]]),
            W++,
            U++);
        }
        if (Ve[1].type === "listItemPrefix") {
          const _n = {
            type: "listItem",
            _spread: !1,
            start: Object.assign({}, Ve[1].start),
            end: void 0,
          };
          ((on = _n), C.splice(W, 0, ["enter", _n, Ve[2]]), W++, U++, (fr = void 0), (pr = !0));
        }
      }
    }
    return ((C[z][1]._spread = lt), U);
  }
  function i(C, z) {
    return U;
    function U(W) {
      (u.call(this, C(W), W), z && z.call(this, W));
    }
  }
  function o() {
    this.stack.push({ type: "fragment", children: [] });
  }
  function u(C, z, U) {
    (this.stack[this.stack.length - 1].children.push(C),
      this.stack.push(C),
      this.tokenStack.push([z, U || void 0]),
      (C.position = { start: At(z.start), end: void 0 }));
  }
  function a(C) {
    return z;
    function z(U) {
      (C && C.call(this, U), s.call(this, U));
    }
  }
  function s(C, z) {
    const U = this.stack.pop(),
      W = this.tokenStack.pop();
    if (W) W[0].type !== C.type && (z ? z.call(this, C, W[0]) : (W[1] || Yc).call(this, C, W[0]));
    else
      throw new Error(
        "Cannot close `" + C.type + "` (" + Ar({ start: C.start, end: C.end }) + "): it’s not open",
      );
    U.position.end = At(C.end);
  }
  function c() {
    return _1(this.stack.pop());
  }
  function f() {
    this.data.expectingFirstListItemValue = !0;
  }
  function d(C) {
    if (this.data.expectingFirstListItemValue) {
      const z = this.stack[this.stack.length - 2];
      ((z.start = Number.parseInt(this.sliceSerialize(C), 10)),
        (this.data.expectingFirstListItemValue = void 0));
    }
  }
  function p() {
    const C = this.resume(),
      z = this.stack[this.stack.length - 1];
    z.lang = C;
  }
  function w() {
    const C = this.resume(),
      z = this.stack[this.stack.length - 1];
    z.meta = C;
  }
  function v() {
    this.data.flowCodeInside || (this.buffer(), (this.data.flowCodeInside = !0));
  }
  function S() {
    const C = this.resume(),
      z = this.stack[this.stack.length - 1];
    ((z.value = C.replace(/^(\r?\n|\r)|(\r?\n|\r)$/g, "")), (this.data.flowCodeInside = void 0));
  }
  function h() {
    const C = this.resume(),
      z = this.stack[this.stack.length - 1];
    z.value = C.replace(/(\r?\n|\r)$/g, "");
  }
  function m(C) {
    const z = this.resume(),
      U = this.stack[this.stack.length - 1];
    ((U.label = z), (U.identifier = Gn(this.sliceSerialize(C)).toLowerCase()));
  }
  function y() {
    const C = this.resume(),
      z = this.stack[this.stack.length - 1];
    z.title = C;
  }
  function E() {
    const C = this.resume(),
      z = this.stack[this.stack.length - 1];
    z.url = C;
  }
  function P(C) {
    const z = this.stack[this.stack.length - 1];
    if (!z.depth) {
      const U = this.sliceSerialize(C).length;
      z.depth = U;
    }
  }
  function x() {
    this.data.setextHeadingSlurpLineEnding = !0;
  }
  function T(C) {
    const z = this.stack[this.stack.length - 1];
    z.depth = this.sliceSerialize(C).codePointAt(0) === 61 ? 1 : 2;
  }
  function L() {
    this.data.setextHeadingSlurpLineEnding = void 0;
  }
  function F(C) {
    const U = this.stack[this.stack.length - 1].children;
    let W = U[U.length - 1];
    ((!W || W.type !== "text") &&
      ((W = Hh()), (W.position = { start: At(C.start), end: void 0 }), U.push(W)),
      this.stack.push(W));
  }
  function M(C) {
    const z = this.stack.pop();
    ((z.value += this.sliceSerialize(C)), (z.position.end = At(C.end)));
  }
  function O(C) {
    const z = this.stack[this.stack.length - 1];
    if (this.data.atHardBreak) {
      const U = z.children[z.children.length - 1];
      ((U.position.end = At(C.end)), (this.data.atHardBreak = void 0));
      return;
    }
    !this.data.setextHeadingSlurpLineEnding &&
      t.canContainEols.includes(z.type) &&
      (F.call(this, C), M.call(this, C));
  }
  function A() {
    this.data.atHardBreak = !0;
  }
  function X() {
    const C = this.resume(),
      z = this.stack[this.stack.length - 1];
    z.value = C;
  }
  function ie() {
    const C = this.resume(),
      z = this.stack[this.stack.length - 1];
    z.value = C;
  }
  function $() {
    const C = this.resume(),
      z = this.stack[this.stack.length - 1];
    z.value = C;
  }
  function pe() {
    const C = this.stack[this.stack.length - 1];
    if (this.data.inReference) {
      const z = this.data.referenceType || "shortcut";
      ((C.type += "Reference"), (C.referenceType = z), delete C.url, delete C.title);
    } else (delete C.identifier, delete C.label);
    this.data.referenceType = void 0;
  }
  function ce() {
    const C = this.stack[this.stack.length - 1];
    if (this.data.inReference) {
      const z = this.data.referenceType || "shortcut";
      ((C.type += "Reference"), (C.referenceType = z), delete C.url, delete C.title);
    } else (delete C.identifier, delete C.label);
    this.data.referenceType = void 0;
  }
  function R(C) {
    const z = this.sliceSerialize(C),
      U = this.stack[this.stack.length - 2];
    ((U.label = Pk(z)), (U.identifier = Gn(z).toLowerCase()));
  }
  function B() {
    const C = this.stack[this.stack.length - 1],
      z = this.resume(),
      U = this.stack[this.stack.length - 1];
    if (((this.data.inReference = !0), U.type === "link")) {
      const W = C.children;
      U.children = W;
    } else U.alt = z;
  }
  function g() {
    const C = this.resume(),
      z = this.stack[this.stack.length - 1];
    z.url = C;
  }
  function b() {
    const C = this.resume(),
      z = this.stack[this.stack.length - 1];
    z.title = C;
  }
  function G() {
    this.data.inReference = void 0;
  }
  function k() {
    this.data.referenceType = "collapsed";
  }
  function ge(C) {
    const z = this.resume(),
      U = this.stack[this.stack.length - 1];
    ((U.label = z),
      (U.identifier = Gn(this.sliceSerialize(C)).toLowerCase()),
      (this.data.referenceType = "full"));
  }
  function rt(C) {
    this.data.characterReferenceType = C.type;
  }
  function te(C) {
    const z = this.sliceSerialize(C),
      U = this.data.characterReferenceType;
    let W;
    U
      ? ((W = oh(z, U === "characterReferenceMarkerNumeric" ? 10 : 16)),
        (this.data.characterReferenceType = void 0))
      : (W = Xa(z));
    const q = this.stack[this.stack.length - 1];
    q.value += W;
  }
  function pt(C) {
    const z = this.stack.pop();
    z.position.end = At(C.end);
  }
  function Dt(C) {
    M.call(this, C);
    const z = this.stack[this.stack.length - 1];
    z.url = this.sliceSerialize(C);
  }
  function Cn(C) {
    M.call(this, C);
    const z = this.stack[this.stack.length - 1];
    z.url = "mailto:" + this.sliceSerialize(C);
  }
  function Pn() {
    return { type: "blockquote", children: [] };
  }
  function hl() {
    return { type: "code", lang: null, meta: null, value: "" };
  }
  function Mh() {
    return { type: "inlineCode", value: "" };
  }
  function Ah() {
    return { type: "definition", identifier: "", label: null, title: null, url: "" };
  }
  function Fh() {
    return { type: "emphasis", children: [] };
  }
  function ns() {
    return { type: "heading", depth: 0, children: [] };
  }
  function rs() {
    return { type: "break" };
  }
  function ls() {
    return { type: "html", value: "" };
  }
  function Bh() {
    return { type: "image", title: null, url: "", alt: null };
  }
  function is() {
    return { type: "link", title: null, url: "", children: [] };
  }
  function os(C) {
    return {
      type: "list",
      ordered: C.type === "listOrdered",
      start: null,
      spread: C._spread,
      children: [],
    };
  }
  function jh(C) {
    return { type: "listItem", spread: C._spread, checked: null, children: [] };
  }
  function Uh() {
    return { type: "paragraph", children: [] };
  }
  function Vh() {
    return { type: "strong", children: [] };
  }
  function Hh() {
    return { type: "text", value: "" };
  }
  function $h() {
    return { type: "thematicBreak" };
  }
}
function At(e) {
  return { line: e.line, column: e.column, offset: e.offset };
}
function yh(e, t) {
  let n = -1;
  for (; ++n < t.length; ) {
    const r = t[n];
    Array.isArray(r) ? yh(e, r) : Nk(e, r);
  }
}
function Nk(e, t) {
  let n;
  for (n in t)
    if (gh.call(t, n))
      switch (n) {
        case "canContainEols": {
          const r = t[n];
          r && e[n].push(...r);
          break;
        }
        case "transforms": {
          const r = t[n];
          r && e[n].push(...r);
          break;
        }
        case "enter":
        case "exit": {
          const r = t[n];
          r && Object.assign(e[n], r);
          break;
        }
      }
}
function Yc(e, t) {
  throw e
    ? new Error(
        "Cannot close `" +
          e.type +
          "` (" +
          Ar({ start: e.start, end: e.end }) +
          "): a different token (`" +
          t.type +
          "`, " +
          Ar({ start: t.start, end: t.end }) +
          ") is open",
      )
    : new Error(
        "Cannot close document, a token (`" +
          t.type +
          "`, " +
          Ar({ start: t.start, end: t.end }) +
          ") is still open",
      );
}
function zk(e) {
  const t = this;
  t.parser = n;
  function n(r) {
    return Tk(r, {
      ...t.data("settings"),
      ...e,
      extensions: t.data("micromarkExtensions") || [],
      mdastExtensions: t.data("fromMarkdownExtensions") || [],
    });
  }
}
function Lk(e, t) {
  const n = {
    type: "element",
    tagName: "blockquote",
    properties: {},
    children: e.wrap(e.all(t), !0),
  };
  return (e.patch(t, n), e.applyData(t, n));
}
function Rk(e, t) {
  const n = { type: "element", tagName: "br", properties: {}, children: [] };
  return (
    e.patch(t, n),
    [
      e.applyData(t, n),
      {
        type: "text",
        value: `
`,
      },
    ]
  );
}
function Ok(e, t) {
  const n = t.value
      ? t.value +
        `
`
      : "",
    r = {},
    l = t.lang ? t.lang.split(/\s+/) : [];
  l.length > 0 && (r.className = ["language-" + l[0]]);
  let i = {
    type: "element",
    tagName: "code",
    properties: r,
    children: [{ type: "text", value: n }],
  };
  return (
    t.meta && (i.data = { meta: t.meta }),
    e.patch(t, i),
    (i = e.applyData(t, i)),
    (i = { type: "element", tagName: "pre", properties: {}, children: [i] }),
    e.patch(t, i),
    i
  );
}
function Dk(e, t) {
  const n = { type: "element", tagName: "del", properties: {}, children: e.all(t) };
  return (e.patch(t, n), e.applyData(t, n));
}
function Mk(e, t) {
  const n = { type: "element", tagName: "em", properties: {}, children: e.all(t) };
  return (e.patch(t, n), e.applyData(t, n));
}
function Ak(e, t) {
  const n = typeof e.options.clobberPrefix == "string" ? e.options.clobberPrefix : "user-content-",
    r = String(t.identifier).toUpperCase(),
    l = cr(r.toLowerCase()),
    i = e.footnoteOrder.indexOf(r);
  let o,
    u = e.footnoteCounts.get(r);
  (u === void 0 ? ((u = 0), e.footnoteOrder.push(r), (o = e.footnoteOrder.length)) : (o = i + 1),
    (u += 1),
    e.footnoteCounts.set(r, u));
  const a = {
    type: "element",
    tagName: "a",
    properties: {
      href: "#" + n + "fn-" + l,
      id: n + "fnref-" + l + (u > 1 ? "-" + u : ""),
      dataFootnoteRef: !0,
      ariaDescribedBy: ["footnote-label"],
    },
    children: [{ type: "text", value: String(o) }],
  };
  e.patch(t, a);
  const s = { type: "element", tagName: "sup", properties: {}, children: [a] };
  return (e.patch(t, s), e.applyData(t, s));
}
function Fk(e, t) {
  const n = { type: "element", tagName: "h" + t.depth, properties: {}, children: e.all(t) };
  return (e.patch(t, n), e.applyData(t, n));
}
function Bk(e, t) {
  if (e.options.allowDangerousHtml) {
    const n = { type: "raw", value: t.value };
    return (e.patch(t, n), e.applyData(t, n));
  }
}
function vh(e, t) {
  const n = t.referenceType;
  let r = "]";
  if (
    (n === "collapsed" ? (r += "[]") : n === "full" && (r += "[" + (t.label || t.identifier) + "]"),
    t.type === "imageReference")
  )
    return [{ type: "text", value: "![" + t.alt + r }];
  const l = e.all(t),
    i = l[0];
  i && i.type === "text" ? (i.value = "[" + i.value) : l.unshift({ type: "text", value: "[" });
  const o = l[l.length - 1];
  return (o && o.type === "text" ? (o.value += r) : l.push({ type: "text", value: r }), l);
}
function jk(e, t) {
  const n = String(t.identifier).toUpperCase(),
    r = e.definitionById.get(n);
  if (!r) return vh(e, t);
  const l = { src: cr(r.url || ""), alt: t.alt };
  r.title !== null && r.title !== void 0 && (l.title = r.title);
  const i = { type: "element", tagName: "img", properties: l, children: [] };
  return (e.patch(t, i), e.applyData(t, i));
}
function Uk(e, t) {
  const n = { src: cr(t.url) };
  (t.alt !== null && t.alt !== void 0 && (n.alt = t.alt),
    t.title !== null && t.title !== void 0 && (n.title = t.title));
  const r = { type: "element", tagName: "img", properties: n, children: [] };
  return (e.patch(t, r), e.applyData(t, r));
}
function Vk(e, t) {
  const n = { type: "text", value: t.value.replace(/\r?\n|\r/g, " ") };
  e.patch(t, n);
  const r = { type: "element", tagName: "code", properties: {}, children: [n] };
  return (e.patch(t, r), e.applyData(t, r));
}
function Hk(e, t) {
  const n = String(t.identifier).toUpperCase(),
    r = e.definitionById.get(n);
  if (!r) return vh(e, t);
  const l = { href: cr(r.url || "") };
  r.title !== null && r.title !== void 0 && (l.title = r.title);
  const i = { type: "element", tagName: "a", properties: l, children: e.all(t) };
  return (e.patch(t, i), e.applyData(t, i));
}
function $k(e, t) {
  const n = { href: cr(t.url) };
  t.title !== null && t.title !== void 0 && (n.title = t.title);
  const r = { type: "element", tagName: "a", properties: n, children: e.all(t) };
  return (e.patch(t, r), e.applyData(t, r));
}
function Wk(e, t, n) {
  const r = e.all(t),
    l = n ? bk(n) : kh(t),
    i = {},
    o = [];
  if (typeof t.checked == "boolean") {
    const c = r[0];
    let f;
    (c && c.type === "element" && c.tagName === "p"
      ? (f = c)
      : ((f = { type: "element", tagName: "p", properties: {}, children: [] }), r.unshift(f)),
      f.children.length > 0 && f.children.unshift({ type: "text", value: " " }),
      f.children.unshift({
        type: "element",
        tagName: "input",
        properties: { type: "checkbox", checked: t.checked, disabled: !0 },
        children: [],
      }),
      (i.className = ["task-list-item"]));
  }
  let u = -1;
  for (; ++u < r.length; ) {
    const c = r[u];
    ((l || u !== 0 || c.type !== "element" || c.tagName !== "p") &&
      o.push({
        type: "text",
        value: `
`,
      }),
      c.type === "element" && c.tagName === "p" && !l ? o.push(...c.children) : o.push(c));
  }
  const a = r[r.length - 1];
  a &&
    (l || a.type !== "element" || a.tagName !== "p") &&
    o.push({
      type: "text",
      value: `
`,
    });
  const s = { type: "element", tagName: "li", properties: i, children: o };
  return (e.patch(t, s), e.applyData(t, s));
}
function bk(e) {
  let t = !1;
  if (e.type === "list") {
    t = e.spread || !1;
    const n = e.children;
    let r = -1;
    for (; !t && ++r < n.length; ) t = kh(n[r]);
  }
  return t;
}
function kh(e) {
  const t = e.spread;
  return t ?? e.children.length > 1;
}
function Qk(e, t) {
  const n = {},
    r = e.all(t);
  let l = -1;
  for (typeof t.start == "number" && t.start !== 1 && (n.start = t.start); ++l < r.length; ) {
    const o = r[l];
    if (
      o.type === "element" &&
      o.tagName === "li" &&
      o.properties &&
      Array.isArray(o.properties.className) &&
      o.properties.className.includes("task-list-item")
    ) {
      n.className = ["contains-task-list"];
      break;
    }
  }
  const i = {
    type: "element",
    tagName: t.ordered ? "ol" : "ul",
    properties: n,
    children: e.wrap(r, !0),
  };
  return (e.patch(t, i), e.applyData(t, i));
}
function Yk(e, t) {
  const n = { type: "element", tagName: "p", properties: {}, children: e.all(t) };
  return (e.patch(t, n), e.applyData(t, n));
}
function Xk(e, t) {
  const n = { type: "root", children: e.wrap(e.all(t)) };
  return (e.patch(t, n), e.applyData(t, n));
}
function Kk(e, t) {
  const n = { type: "element", tagName: "strong", properties: {}, children: e.all(t) };
  return (e.patch(t, n), e.applyData(t, n));
}
function Gk(e, t) {
  const n = e.all(t),
    r = n.shift(),
    l = [];
  if (r) {
    const o = { type: "element", tagName: "thead", properties: {}, children: e.wrap([r], !0) };
    (e.patch(t.children[0], o), l.push(o));
  }
  if (n.length > 0) {
    const o = { type: "element", tagName: "tbody", properties: {}, children: e.wrap(n, !0) },
      u = Wa(t.children[1]),
      a = Zd(t.children[t.children.length - 1]);
    (u && a && (o.position = { start: u, end: a }), l.push(o));
  }
  const i = { type: "element", tagName: "table", properties: {}, children: e.wrap(l, !0) };
  return (e.patch(t, i), e.applyData(t, i));
}
function qk(e, t, n) {
  const r = n ? n.children : void 0,
    i = (r ? r.indexOf(t) : 1) === 0 ? "th" : "td",
    o = n && n.type === "table" ? n.align : void 0,
    u = o ? o.length : t.children.length;
  let a = -1;
  const s = [];
  for (; ++a < u; ) {
    const f = t.children[a],
      d = {},
      p = o ? o[a] : void 0;
    p && (d.align = p);
    let w = { type: "element", tagName: i, properties: d, children: [] };
    (f && ((w.children = e.all(f)), e.patch(f, w), (w = e.applyData(f, w))), s.push(w));
  }
  const c = { type: "element", tagName: "tr", properties: {}, children: e.wrap(s, !0) };
  return (e.patch(t, c), e.applyData(t, c));
}
function Jk(e, t) {
  const n = { type: "element", tagName: "td", properties: {}, children: e.all(t) };
  return (e.patch(t, n), e.applyData(t, n));
}
const Xc = 9,
  Kc = 32;
function Zk(e) {
  const t = String(e),
    n = /\r?\n|\r/g;
  let r = n.exec(t),
    l = 0;
  const i = [];
  for (; r; )
    (i.push(Gc(t.slice(l, r.index), l > 0, !0), r[0]),
      (l = r.index + r[0].length),
      (r = n.exec(t)));
  return (i.push(Gc(t.slice(l), l > 0, !1)), i.join(""));
}
function Gc(e, t, n) {
  let r = 0,
    l = e.length;
  if (t) {
    let i = e.codePointAt(r);
    for (; i === Xc || i === Kc; ) (r++, (i = e.codePointAt(r)));
  }
  if (n) {
    let i = e.codePointAt(l - 1);
    for (; i === Xc || i === Kc; ) (l--, (i = e.codePointAt(l - 1)));
  }
  return l > r ? e.slice(r, l) : "";
}
function ew(e, t) {
  const n = { type: "text", value: Zk(String(t.value)) };
  return (e.patch(t, n), e.applyData(t, n));
}
function tw(e, t) {
  const n = { type: "element", tagName: "hr", properties: {}, children: [] };
  return (e.patch(t, n), e.applyData(t, n));
}
const nw = {
  blockquote: Lk,
  break: Rk,
  code: Ok,
  delete: Dk,
  emphasis: Mk,
  footnoteReference: Ak,
  heading: Fk,
  html: Bk,
  imageReference: jk,
  image: Uk,
  inlineCode: Vk,
  linkReference: Hk,
  link: $k,
  listItem: Wk,
  list: Qk,
  paragraph: Yk,
  root: Xk,
  strong: Kk,
  table: Gk,
  tableCell: Jk,
  tableRow: qk,
  text: ew,
  thematicBreak: tw,
  toml: Rl,
  yaml: Rl,
  definition: Rl,
  footnoteDefinition: Rl,
};
function Rl() {}
const wh = -1,
  Qi = 0,
  Br = 1,
  Ci = 2,
  qa = 3,
  Ja = 4,
  Za = 5,
  es = 6,
  xh = 7,
  Sh = 8,
  rw = typeof self == "object" ? self : globalThis,
  qc = (e, t) => {
    switch (e) {
      case "Function":
      case "SharedWorker":
      case "Worker":
      case "eval":
      case "setInterval":
      case "setTimeout":
        throw new TypeError("unable to deserialize " + e);
    }
    return new rw[e](t);
  },
  lw = (e, t) => {
    const n = (l, i) => (e.set(i, l), l),
      r = (l) => {
        if (e.has(l)) return e.get(l);
        const [i, o] = t[l];
        switch (i) {
          case Qi:
          case wh:
            return n(o, l);
          case Br: {
            const u = n([], l);
            for (const a of o) u.push(r(a));
            return u;
          }
          case Ci: {
            const u = n({}, l);
            for (const [a, s] of o) u[r(a)] = r(s);
            return u;
          }
          case qa:
            return n(new Date(o), l);
          case Ja: {
            const { source: u, flags: a } = o;
            return n(new RegExp(u, a), l);
          }
          case Za: {
            const u = n(new Map(), l);
            for (const [a, s] of o) u.set(r(a), r(s));
            return u;
          }
          case es: {
            const u = n(new Set(), l);
            for (const a of o) u.add(r(a));
            return u;
          }
          case xh: {
            const { name: u, message: a } = o;
            return n(qc(u, a), l);
          }
          case Sh:
            return n(BigInt(o), l);
          case "BigInt":
            return n(Object(BigInt(o)), l);
          case "ArrayBuffer":
            return n(new Uint8Array(o).buffer, o);
          case "DataView": {
            const { buffer: u } = new Uint8Array(o);
            return n(new DataView(u), o);
          }
        }
        return n(qc(i, o), l);
      };
    return r;
  },
  Jc = (e) => lw(new Map(), e)(0),
  In = "",
  { toString: iw } = {},
  { keys: ow } = Object,
  Sr = (e) => {
    const t = typeof e;
    if (t !== "object" || !e) return [Qi, t];
    const n = iw.call(e).slice(8, -1);
    switch (n) {
      case "Array":
        return [Br, In];
      case "Object":
        return [Ci, In];
      case "Date":
        return [qa, In];
      case "RegExp":
        return [Ja, In];
      case "Map":
        return [Za, In];
      case "Set":
        return [es, In];
      case "DataView":
        return [Br, n];
    }
    return n.includes("Array") ? [Br, n] : n.includes("Error") ? [xh, n] : [Ci, n];
  },
  Ol = ([e, t]) => e === Qi && (t === "function" || t === "symbol"),
  uw = (e, t, n, r) => {
    const l = (o, u) => {
        const a = r.push(o) - 1;
        return (n.set(u, a), a);
      },
      i = (o) => {
        if (n.has(o)) return n.get(o);
        let [u, a] = Sr(o);
        switch (u) {
          case Qi: {
            let c = o;
            switch (a) {
              case "bigint":
                ((u = Sh), (c = o.toString()));
                break;
              case "function":
              case "symbol":
                if (e) throw new TypeError("unable to serialize " + a);
                c = null;
                break;
              case "undefined":
                return l([wh], o);
            }
            return l([u, c], o);
          }
          case Br: {
            if (a) {
              let d = o;
              return (
                a === "DataView"
                  ? (d = new Uint8Array(o.buffer))
                  : a === "ArrayBuffer" && (d = new Uint8Array(o)),
                l([a, [...d]], o)
              );
            }
            const c = [],
              f = l([u, c], o);
            for (const d of o) c.push(i(d));
            return f;
          }
          case Ci: {
            if (a)
              switch (a) {
                case "BigInt":
                  return l([a, o.toString()], o);
                case "Boolean":
                case "Number":
                case "String":
                  return l([a, o.valueOf()], o);
              }
            if (t && "toJSON" in o) return i(o.toJSON());
            const c = [],
              f = l([u, c], o);
            for (const d of ow(o)) (e || !Ol(Sr(o[d]))) && c.push([i(d), i(o[d])]);
            return f;
          }
          case qa:
            return l([u, o.toISOString()], o);
          case Ja: {
            const { source: c, flags: f } = o;
            return l([u, { source: c, flags: f }], o);
          }
          case Za: {
            const c = [],
              f = l([u, c], o);
            for (const [d, p] of o) (e || !(Ol(Sr(d)) || Ol(Sr(p)))) && c.push([i(d), i(p)]);
            return f;
          }
          case es: {
            const c = [],
              f = l([u, c], o);
            for (const d of o) (e || !Ol(Sr(d))) && c.push(i(d));
            return f;
          }
        }
        const { message: s } = o;
        return l([u, { name: a, message: s }], o);
      };
    return i;
  },
  Zc = (e, { json: t, lossy: n } = {}) => {
    const r = [];
    return (uw(!(t || n), !!t, new Map(), r)(e), r);
  },
  Pi =
    typeof structuredClone == "function"
      ? (e, t) => (t && ("json" in t || "lossy" in t) ? Jc(Zc(e, t)) : structuredClone(e))
      : (e, t) => Jc(Zc(e, t));
function aw(e, t) {
  const n = [{ type: "text", value: "↩" }];
  return (
    t > 1 &&
      n.push({
        type: "element",
        tagName: "sup",
        properties: {},
        children: [{ type: "text", value: String(t) }],
      }),
    n
  );
}
function sw(e, t) {
  return "Back to reference " + (e + 1) + (t > 1 ? "-" + t : "");
}
function cw(e) {
  const t = typeof e.options.clobberPrefix == "string" ? e.options.clobberPrefix : "user-content-",
    n = e.options.footnoteBackContent || aw,
    r = e.options.footnoteBackLabel || sw,
    l = e.options.footnoteLabel || "Footnotes",
    i = e.options.footnoteLabelTagName || "h2",
    o = e.options.footnoteLabelProperties || { className: ["sr-only"] },
    u = [];
  let a = -1;
  for (; ++a < e.footnoteOrder.length; ) {
    const s = e.footnoteById.get(e.footnoteOrder[a]);
    if (!s) continue;
    const c = e.all(s),
      f = String(s.identifier).toUpperCase(),
      d = cr(f.toLowerCase());
    let p = 0;
    const w = [],
      v = e.footnoteCounts.get(f);
    for (; v !== void 0 && ++p <= v; ) {
      w.length > 0 && w.push({ type: "text", value: " " });
      let m = typeof n == "string" ? n : n(a, p);
      (typeof m == "string" && (m = { type: "text", value: m }),
        w.push({
          type: "element",
          tagName: "a",
          properties: {
            href: "#" + t + "fnref-" + d + (p > 1 ? "-" + p : ""),
            dataFootnoteBackref: "",
            ariaLabel: typeof r == "string" ? r : r(a, p),
            className: ["data-footnote-backref"],
          },
          children: Array.isArray(m) ? m : [m],
        }));
    }
    const S = c[c.length - 1];
    if (S && S.type === "element" && S.tagName === "p") {
      const m = S.children[S.children.length - 1];
      (m && m.type === "text" ? (m.value += " ") : S.children.push({ type: "text", value: " " }),
        S.children.push(...w));
    } else c.push(...w);
    const h = {
      type: "element",
      tagName: "li",
      properties: { id: t + "fn-" + d },
      children: e.wrap(c, !0),
    };
    (e.patch(s, h), u.push(h));
  }
  if (u.length !== 0)
    return {
      type: "element",
      tagName: "section",
      properties: { dataFootnotes: !0, className: ["footnotes"] },
      children: [
        {
          type: "element",
          tagName: i,
          properties: { ...Pi(o), id: "footnote-label" },
          children: [{ type: "text", value: l }],
        },
        {
          type: "text",
          value: `
`,
        },
        { type: "element", tagName: "ol", properties: {}, children: e.wrap(u, !0) },
        {
          type: "text",
          value: `
`,
        },
      ],
    };
}
const Eh = function (e) {
  if (e == null) return hw;
  if (typeof e == "function") return Yi(e);
  if (typeof e == "object") return Array.isArray(e) ? fw(e) : pw(e);
  if (typeof e == "string") return dw(e);
  throw new Error("Expected function, string, or object as test");
};
function fw(e) {
  const t = [];
  let n = -1;
  for (; ++n < e.length; ) t[n] = Eh(e[n]);
  return Yi(r);
  function r(...l) {
    let i = -1;
    for (; ++i < t.length; ) if (t[i].apply(this, l)) return !0;
    return !1;
  }
}
function pw(e) {
  const t = e;
  return Yi(n);
  function n(r) {
    const l = r;
    let i;
    for (i in e) if (l[i] !== t[i]) return !1;
    return !0;
  }
}
function dw(e) {
  return Yi(t);
  function t(n) {
    return n && n.type === e;
  }
}
function Yi(e) {
  return t;
  function t(n, r, l) {
    return !!(mw(n) && e.call(this, n, typeof r == "number" ? r : void 0, l || void 0));
  }
}
function hw() {
  return !0;
}
function mw(e) {
  return e !== null && typeof e == "object" && "type" in e;
}
const Ch = [],
  gw = !0,
  ef = !1,
  yw = "skip";
function vw(e, t, n, r) {
  let l;
  typeof t == "function" && typeof n != "function" ? ((r = n), (n = t)) : (l = t);
  const i = Eh(l),
    o = r ? -1 : 1;
  u(e, void 0, [])();
  function u(a, s, c) {
    const f = a && typeof a == "object" ? a : {};
    if (typeof f.type == "string") {
      const p =
        typeof f.tagName == "string" ? f.tagName : typeof f.name == "string" ? f.name : void 0;
      Object.defineProperty(d, "name", {
        value: "node (" + (a.type + (p ? "<" + p + ">" : "")) + ")",
      });
    }
    return d;
    function d() {
      let p = Ch,
        w,
        v,
        S;
      if ((!t || i(a, s, c[c.length - 1] || void 0)) && ((p = kw(n(a, c))), p[0] === ef)) return p;
      if ("children" in a && a.children) {
        const h = a;
        if (h.children && p[0] !== yw)
          for (
            v = (r ? h.children.length : -1) + o, S = c.concat(h);
            v > -1 && v < h.children.length;
          ) {
            const m = h.children[v];
            if (((w = u(m, v, S)()), w[0] === ef)) return w;
            v = typeof w[1] == "number" ? w[1] : v + o;
          }
      }
      return p;
    }
  }
}
function kw(e) {
  return Array.isArray(e) ? e : typeof e == "number" ? [gw, e] : e == null ? Ch : [e];
}
function Ph(e, t, n, r) {
  let l, i, o;
  (typeof t == "function" && typeof n != "function"
    ? ((i = void 0), (o = t), (l = n))
    : ((i = t), (o = n), (l = r)),
    vw(e, i, u, l));
  function u(a, s) {
    const c = s[s.length - 1],
      f = c ? c.children.indexOf(a) : void 0;
    return o(a, f, c);
  }
}
const Uu = {}.hasOwnProperty,
  ww = {};
function xw(e, t) {
  const n = t || ww,
    r = new Map(),
    l = new Map(),
    i = new Map(),
    o = { ...nw, ...n.handlers },
    u = {
      all: s,
      applyData: Ew,
      definitionById: r,
      footnoteById: l,
      footnoteCounts: i,
      footnoteOrder: [],
      handlers: o,
      one: a,
      options: n,
      patch: Sw,
      wrap: Pw,
    };
  return (
    Ph(e, function (c) {
      if (c.type === "definition" || c.type === "footnoteDefinition") {
        const f = c.type === "definition" ? r : l,
          d = String(c.identifier).toUpperCase();
        f.has(d) || f.set(d, c);
      }
    }),
    u
  );
  function a(c, f) {
    const d = c.type,
      p = u.handlers[d];
    if (Uu.call(u.handlers, d) && p) return p(u, c, f);
    if (u.options.passThrough && u.options.passThrough.includes(d)) {
      if ("children" in c) {
        const { children: v, ...S } = c,
          h = Pi(S);
        return ((h.children = u.all(c)), h);
      }
      return Pi(c);
    }
    return (u.options.unknownHandler || Cw)(u, c, f);
  }
  function s(c) {
    const f = [];
    if ("children" in c) {
      const d = c.children;
      let p = -1;
      for (; ++p < d.length; ) {
        const w = u.one(d[p], c);
        if (w) {
          if (
            p &&
            d[p - 1].type === "break" &&
            (!Array.isArray(w) && w.type === "text" && (w.value = tf(w.value)),
            !Array.isArray(w) && w.type === "element")
          ) {
            const v = w.children[0];
            v && v.type === "text" && (v.value = tf(v.value));
          }
          Array.isArray(w) ? f.push(...w) : f.push(w);
        }
      }
    }
    return f;
  }
}
function Sw(e, t) {
  e.position && (t.position = l1(e));
}
function Ew(e, t) {
  let n = t;
  if (e && e.data) {
    const r = e.data.hName,
      l = e.data.hChildren,
      i = e.data.hProperties;
    if (typeof r == "string")
      if (n.type === "element") n.tagName = r;
      else {
        const o = "children" in n ? n.children : [n];
        n = { type: "element", tagName: r, properties: {}, children: o };
      }
    (n.type === "element" && i && Object.assign(n.properties, Pi(i)),
      "children" in n && n.children && l !== null && l !== void 0 && (n.children = l));
  }
  return n;
}
function Cw(e, t) {
  const n = t.data || {},
    r =
      "value" in t && !(Uu.call(n, "hProperties") || Uu.call(n, "hChildren"))
        ? { type: "text", value: t.value }
        : { type: "element", tagName: "div", properties: {}, children: e.all(t) };
  return (e.patch(t, r), e.applyData(t, r));
}
function Pw(e, t) {
  const n = [];
  let r = -1;
  for (
    t &&
    n.push({
      type: "text",
      value: `
`,
    });
    ++r < e.length;
  )
    (r &&
      n.push({
        type: "text",
        value: `
`,
      }),
      n.push(e[r]));
  return (
    t &&
      e.length > 0 &&
      n.push({
        type: "text",
        value: `
`,
      }),
    n
  );
}
function tf(e) {
  let t = 0,
    n = e.charCodeAt(t);
  for (; n === 9 || n === 32; ) (t++, (n = e.charCodeAt(t)));
  return e.slice(t);
}
function nf(e, t) {
  const n = xw(e, t),
    r = n.one(e, void 0),
    l = cw(n),
    i = Array.isArray(r) ? { type: "root", children: r } : r || { type: "root", children: [] };
  return (
    l &&
      i.children.push(
        {
          type: "text",
          value: `
`,
        },
        l,
      ),
    i
  );
}
function _w(e, t) {
  return e && "run" in e
    ? async function (n, r) {
        const l = nf(n, { file: r, ...t });
        await e.run(l, r);
      }
    : function (n, r) {
        return nf(n, { file: r, ...(e || t) });
      };
}
function rf(e) {
  if (e) throw e;
}
var Gl = Object.prototype.hasOwnProperty,
  _h = Object.prototype.toString,
  lf = Object.defineProperty,
  of = Object.getOwnPropertyDescriptor,
  uf = function (t) {
    return typeof Array.isArray == "function" ? Array.isArray(t) : _h.call(t) === "[object Array]";
  },
  af = function (t) {
    if (!t || _h.call(t) !== "[object Object]") return !1;
    var n = Gl.call(t, "constructor"),
      r =
        t.constructor &&
        t.constructor.prototype &&
        Gl.call(t.constructor.prototype, "isPrototypeOf");
    if (t.constructor && !n && !r) return !1;
    var l;
    for (l in t);
    return typeof l > "u" || Gl.call(t, l);
  },
  sf = function (t, n) {
    lf && n.name === "__proto__"
      ? lf(t, n.name, { enumerable: !0, configurable: !0, value: n.newValue, writable: !0 })
      : (t[n.name] = n.newValue);
  },
  cf = function (t, n) {
    if (n === "__proto__")
      if (Gl.call(t, n)) {
        if (of) return of(t, n).value;
      } else return;
    return t[n];
  },
  Tw = function e() {
    var t,
      n,
      r,
      l,
      i,
      o,
      u = arguments[0],
      a = 1,
      s = arguments.length,
      c = !1;
    for (
      typeof u == "boolean" && ((c = u), (u = arguments[1] || {}), (a = 2)),
        (u == null || (typeof u != "object" && typeof u != "function")) && (u = {});
      a < s;
      ++a
    )
      if (((t = arguments[a]), t != null))
        for (n in t)
          ((r = cf(u, n)),
            (l = cf(t, n)),
            u !== l &&
              (c && l && (af(l) || (i = uf(l)))
                ? (i ? ((i = !1), (o = r && uf(r) ? r : [])) : (o = r && af(r) ? r : {}),
                  sf(u, { name: n, newValue: e(c, o, l) }))
                : typeof l < "u" && sf(u, { name: n, newValue: l })));
    return u;
  };
const Io = _i(Tw);
function Vu(e) {
  if (typeof e != "object" || e === null) return !1;
  const t = Object.getPrototypeOf(e);
  return (
    (t === null || t === Object.prototype || Object.getPrototypeOf(t) === null) &&
    !(Symbol.toStringTag in e) &&
    !(Symbol.iterator in e)
  );
}
function Iw() {
  const e = [],
    t = { run: n, use: r };
  return t;
  function n(...l) {
    let i = -1;
    const o = l.pop();
    if (typeof o != "function") throw new TypeError("Expected function as last argument, not " + o);
    u(null, ...l);
    function u(a, ...s) {
      const c = e[++i];
      let f = -1;
      if (a) {
        o(a);
        return;
      }
      for (; ++f < l.length; ) (s[f] === null || s[f] === void 0) && (s[f] = l[f]);
      ((l = s), c ? Nw(c, u)(...s) : o(null, ...s));
    }
  }
  function r(l) {
    if (typeof l != "function")
      throw new TypeError("Expected `middelware` to be a function, not " + l);
    return (e.push(l), t);
  }
}
function Nw(e, t) {
  let n;
  return r;
  function r(...o) {
    const u = e.length > o.length;
    let a;
    u && o.push(l);
    try {
      a = e.apply(this, o);
    } catch (s) {
      const c = s;
      if (u && n) throw c;
      return l(c);
    }
    u ||
      (a && a.then && typeof a.then == "function"
        ? a.then(i, l)
        : a instanceof Error
          ? l(a)
          : i(a));
  }
  function l(o, ...u) {
    n || ((n = !0), t(o, ...u));
  }
  function i(o) {
    l(null, o);
  }
}
const mt = { basename: zw, dirname: Lw, extname: Rw, join: Ow, sep: "/" };
function zw(e, t) {
  if (t !== void 0 && typeof t != "string") throw new TypeError('"ext" argument must be a string');
  dl(e);
  let n = 0,
    r = -1,
    l = e.length,
    i;
  if (t === void 0 || t.length === 0 || t.length > e.length) {
    for (; l--; )
      if (e.codePointAt(l) === 47) {
        if (i) {
          n = l + 1;
          break;
        }
      } else r < 0 && ((i = !0), (r = l + 1));
    return r < 0 ? "" : e.slice(n, r);
  }
  if (t === e) return "";
  let o = -1,
    u = t.length - 1;
  for (; l--; )
    if (e.codePointAt(l) === 47) {
      if (i) {
        n = l + 1;
        break;
      }
    } else
      (o < 0 && ((i = !0), (o = l + 1)),
        u > -1 &&
          (e.codePointAt(l) === t.codePointAt(u--) ? u < 0 && (r = l) : ((u = -1), (r = o))));
  return (n === r ? (r = o) : r < 0 && (r = e.length), e.slice(n, r));
}
function Lw(e) {
  if ((dl(e), e.length === 0)) return ".";
  let t = -1,
    n = e.length,
    r;
  for (; --n; )
    if (e.codePointAt(n) === 47) {
      if (r) {
        t = n;
        break;
      }
    } else r || (r = !0);
  return t < 0
    ? e.codePointAt(0) === 47
      ? "/"
      : "."
    : t === 1 && e.codePointAt(0) === 47
      ? "//"
      : e.slice(0, t);
}
function Rw(e) {
  dl(e);
  let t = e.length,
    n = -1,
    r = 0,
    l = -1,
    i = 0,
    o;
  for (; t--; ) {
    const u = e.codePointAt(t);
    if (u === 47) {
      if (o) {
        r = t + 1;
        break;
      }
      continue;
    }
    (n < 0 && ((o = !0), (n = t + 1)),
      u === 46 ? (l < 0 ? (l = t) : i !== 1 && (i = 1)) : l > -1 && (i = -1));
  }
  return l < 0 || n < 0 || i === 0 || (i === 1 && l === n - 1 && l === r + 1) ? "" : e.slice(l, n);
}
function Ow(...e) {
  let t = -1,
    n;
  for (; ++t < e.length; ) (dl(e[t]), e[t] && (n = n === void 0 ? e[t] : n + "/" + e[t]));
  return n === void 0 ? "." : Dw(n);
}
function Dw(e) {
  dl(e);
  const t = e.codePointAt(0) === 47;
  let n = Mw(e, !t);
  return (
    n.length === 0 && !t && (n = "."),
    n.length > 0 && e.codePointAt(e.length - 1) === 47 && (n += "/"),
    t ? "/" + n : n
  );
}
function Mw(e, t) {
  let n = "",
    r = 0,
    l = -1,
    i = 0,
    o = -1,
    u,
    a;
  for (; ++o <= e.length; ) {
    if (o < e.length) u = e.codePointAt(o);
    else {
      if (u === 47) break;
      u = 47;
    }
    if (u === 47) {
      if (!(l === o - 1 || i === 1))
        if (l !== o - 1 && i === 2) {
          if (
            n.length < 2 ||
            r !== 2 ||
            n.codePointAt(n.length - 1) !== 46 ||
            n.codePointAt(n.length - 2) !== 46
          ) {
            if (n.length > 2) {
              if (((a = n.lastIndexOf("/")), a !== n.length - 1)) {
                (a < 0
                  ? ((n = ""), (r = 0))
                  : ((n = n.slice(0, a)), (r = n.length - 1 - n.lastIndexOf("/"))),
                  (l = o),
                  (i = 0));
                continue;
              }
            } else if (n.length > 0) {
              ((n = ""), (r = 0), (l = o), (i = 0));
              continue;
            }
          }
          t && ((n = n.length > 0 ? n + "/.." : ".."), (r = 2));
        } else
          (n.length > 0 ? (n += "/" + e.slice(l + 1, o)) : (n = e.slice(l + 1, o)),
            (r = o - l - 1));
      ((l = o), (i = 0));
    } else u === 46 && i > -1 ? i++ : (i = -1);
  }
  return n;
}
function dl(e) {
  if (typeof e != "string")
    throw new TypeError("Path must be a string. Received " + JSON.stringify(e));
}
const Aw = { cwd: Fw };
function Fw() {
  return "/";
}
function Hu(e) {
  return !!(
    e !== null &&
    typeof e == "object" &&
    "href" in e &&
    e.href &&
    "protocol" in e &&
    e.protocol &&
    e.auth === void 0
  );
}
function Bw(e) {
  if (typeof e == "string") e = new URL(e);
  else if (!Hu(e)) {
    const t = new TypeError(
      'The "path" argument must be of type string or an instance of URL. Received `' + e + "`",
    );
    throw ((t.code = "ERR_INVALID_ARG_TYPE"), t);
  }
  if (e.protocol !== "file:") {
    const t = new TypeError("The URL must be of scheme file");
    throw ((t.code = "ERR_INVALID_URL_SCHEME"), t);
  }
  return jw(e);
}
function jw(e) {
  if (e.hostname !== "") {
    const r = new TypeError('File URL host must be "localhost" or empty on darwin');
    throw ((r.code = "ERR_INVALID_FILE_URL_HOST"), r);
  }
  const t = e.pathname;
  let n = -1;
  for (; ++n < t.length; )
    if (t.codePointAt(n) === 37 && t.codePointAt(n + 1) === 50) {
      const r = t.codePointAt(n + 2);
      if (r === 70 || r === 102) {
        const l = new TypeError("File URL path must not include encoded / characters");
        throw ((l.code = "ERR_INVALID_FILE_URL_PATH"), l);
      }
    }
  return decodeURIComponent(t);
}
const No = ["history", "path", "basename", "stem", "extname", "dirname"];
class Th {
  constructor(t) {
    let n;
    (t
      ? Hu(t)
        ? (n = { path: t })
        : typeof t == "string" || Uw(t)
          ? (n = { value: t })
          : (n = t)
      : (n = {}),
      (this.cwd = "cwd" in n ? "" : Aw.cwd()),
      (this.data = {}),
      (this.history = []),
      (this.messages = []),
      this.value,
      this.map,
      this.result,
      this.stored);
    let r = -1;
    for (; ++r < No.length; ) {
      const i = No[r];
      i in n && n[i] !== void 0 && n[i] !== null && (this[i] = i === "history" ? [...n[i]] : n[i]);
    }
    let l;
    for (l in n) No.includes(l) || (this[l] = n[l]);
  }
  get basename() {
    return typeof this.path == "string" ? mt.basename(this.path) : void 0;
  }
  set basename(t) {
    (Lo(t, "basename"), zo(t, "basename"), (this.path = mt.join(this.dirname || "", t)));
  }
  get dirname() {
    return typeof this.path == "string" ? mt.dirname(this.path) : void 0;
  }
  set dirname(t) {
    (ff(this.basename, "dirname"), (this.path = mt.join(t || "", this.basename)));
  }
  get extname() {
    return typeof this.path == "string" ? mt.extname(this.path) : void 0;
  }
  set extname(t) {
    if ((zo(t, "extname"), ff(this.dirname, "extname"), t)) {
      if (t.codePointAt(0) !== 46) throw new Error("`extname` must start with `.`");
      if (t.includes(".", 1)) throw new Error("`extname` cannot contain multiple dots");
    }
    this.path = mt.join(this.dirname, this.stem + (t || ""));
  }
  get path() {
    return this.history[this.history.length - 1];
  }
  set path(t) {
    (Hu(t) && (t = Bw(t)), Lo(t, "path"), this.path !== t && this.history.push(t));
  }
  get stem() {
    return typeof this.path == "string" ? mt.basename(this.path, this.extname) : void 0;
  }
  set stem(t) {
    (Lo(t, "stem"),
      zo(t, "stem"),
      (this.path = mt.join(this.dirname || "", t + (this.extname || ""))));
  }
  fail(t, n, r) {
    const l = this.message(t, n, r);
    throw ((l.fatal = !0), l);
  }
  info(t, n, r) {
    const l = this.message(t, n, r);
    return ((l.fatal = void 0), l);
  }
  message(t, n, r) {
    const l = new Ie(t, n, r);
    return (
      this.path && ((l.name = this.path + ":" + l.name), (l.file = this.path)),
      (l.fatal = !1),
      this.messages.push(l),
      l
    );
  }
  toString(t) {
    return this.value === void 0
      ? ""
      : typeof this.value == "string"
        ? this.value
        : new TextDecoder(t || void 0).decode(this.value);
  }
}
function zo(e, t) {
  if (e && e.includes(mt.sep))
    throw new Error("`" + t + "` cannot be a path: did not expect `" + mt.sep + "`");
}
function Lo(e, t) {
  if (!e) throw new Error("`" + t + "` cannot be empty");
}
function ff(e, t) {
  if (!e) throw new Error("Setting `" + t + "` requires `path` to be set too");
}
function Uw(e) {
  return !!(e && typeof e == "object" && "byteLength" in e && "byteOffset" in e);
}
const Vw = function (e) {
    const r = this.constructor.prototype,
      l = r[e],
      i = function () {
        return l.apply(i, arguments);
      };
    return (Object.setPrototypeOf(i, r), i);
  },
  Hw = {}.hasOwnProperty;
class ts extends Vw {
  constructor() {
    (super("copy"),
      (this.Compiler = void 0),
      (this.Parser = void 0),
      (this.attachers = []),
      (this.compiler = void 0),
      (this.freezeIndex = -1),
      (this.frozen = void 0),
      (this.namespace = {}),
      (this.parser = void 0),
      (this.transformers = Iw()));
  }
  copy() {
    const t = new ts();
    let n = -1;
    for (; ++n < this.attachers.length; ) {
      const r = this.attachers[n];
      t.use(...r);
    }
    return (t.data(Io(!0, {}, this.namespace)), t);
  }
  data(t, n) {
    return typeof t == "string"
      ? arguments.length === 2
        ? (Do("data", this.frozen), (this.namespace[t] = n), this)
        : (Hw.call(this.namespace, t) && this.namespace[t]) || void 0
      : t
        ? (Do("data", this.frozen), (this.namespace = t), this)
        : this.namespace;
  }
  freeze() {
    if (this.frozen) return this;
    const t = this;
    for (; ++this.freezeIndex < this.attachers.length; ) {
      const [n, ...r] = this.attachers[this.freezeIndex];
      if (r[0] === !1) continue;
      r[0] === !0 && (r[0] = void 0);
      const l = n.call(t, ...r);
      typeof l == "function" && this.transformers.use(l);
    }
    return ((this.frozen = !0), (this.freezeIndex = Number.POSITIVE_INFINITY), this);
  }
  parse(t) {
    this.freeze();
    const n = Dl(t),
      r = this.parser || this.Parser;
    return (Ro("parse", r), r(String(n), n));
  }
  process(t, n) {
    const r = this;
    return (
      this.freeze(),
      Ro("process", this.parser || this.Parser),
      Oo("process", this.compiler || this.Compiler),
      n ? l(void 0, n) : new Promise(l)
    );
    function l(i, o) {
      const u = Dl(t),
        a = r.parse(u);
      r.run(a, u, function (c, f, d) {
        if (c || !f || !d) return s(c);
        const p = f,
          w = r.stringify(p, d);
        (bw(w) ? (d.value = w) : (d.result = w), s(c, d));
      });
      function s(c, f) {
        c || !f ? o(c) : i ? i(f) : n(void 0, f);
      }
    }
  }
  processSync(t) {
    let n = !1,
      r;
    return (
      this.freeze(),
      Ro("processSync", this.parser || this.Parser),
      Oo("processSync", this.compiler || this.Compiler),
      this.process(t, l),
      df("processSync", "process", n),
      r
    );
    function l(i, o) {
      ((n = !0), rf(i), (r = o));
    }
  }
  run(t, n, r) {
    (pf(t), this.freeze());
    const l = this.transformers;
    return (
      !r && typeof n == "function" && ((r = n), (n = void 0)),
      r ? i(void 0, r) : new Promise(i)
    );
    function i(o, u) {
      const a = Dl(n);
      l.run(t, a, s);
      function s(c, f, d) {
        const p = f || t;
        c ? u(c) : o ? o(p) : r(void 0, p, d);
      }
    }
  }
  runSync(t, n) {
    let r = !1,
      l;
    return (this.run(t, n, i), df("runSync", "run", r), l);
    function i(o, u) {
      (rf(o), (l = u), (r = !0));
    }
  }
  stringify(t, n) {
    this.freeze();
    const r = Dl(n),
      l = this.compiler || this.Compiler;
    return (Oo("stringify", l), pf(t), l(t, r));
  }
  use(t, ...n) {
    const r = this.attachers,
      l = this.namespace;
    if ((Do("use", this.frozen), t != null))
      if (typeof t == "function") a(t, n);
      else if (typeof t == "object") Array.isArray(t) ? u(t) : o(t);
      else throw new TypeError("Expected usable value, not `" + t + "`");
    return this;
    function i(s) {
      if (typeof s == "function") a(s, []);
      else if (typeof s == "object")
        if (Array.isArray(s)) {
          const [c, ...f] = s;
          a(c, f);
        } else o(s);
      else throw new TypeError("Expected usable value, not `" + s + "`");
    }
    function o(s) {
      if (!("plugins" in s) && !("settings" in s))
        throw new Error(
          "Expected usable value but received an empty preset, which is probably a mistake: presets typically come with `plugins` and sometimes with `settings`, but this has neither",
        );
      (u(s.plugins), s.settings && (l.settings = Io(!0, l.settings, s.settings)));
    }
    function u(s) {
      let c = -1;
      if (s != null)
        if (Array.isArray(s))
          for (; ++c < s.length; ) {
            const f = s[c];
            i(f);
          }
        else throw new TypeError("Expected a list of plugins, not `" + s + "`");
    }
    function a(s, c) {
      let f = -1,
        d = -1;
      for (; ++f < r.length; )
        if (r[f][0] === s) {
          d = f;
          break;
        }
      if (d === -1) r.push([s, ...c]);
      else if (c.length > 0) {
        let [p, ...w] = c;
        const v = r[d][1];
        (Vu(v) && Vu(p) && (p = Io(!0, v, p)), (r[d] = [s, p, ...w]));
      }
    }
  }
}
const $w = new ts().freeze();
function Ro(e, t) {
  if (typeof t != "function") throw new TypeError("Cannot `" + e + "` without `parser`");
}
function Oo(e, t) {
  if (typeof t != "function") throw new TypeError("Cannot `" + e + "` without `compiler`");
}
function Do(e, t) {
  if (t)
    throw new Error(
      "Cannot call `" +
        e +
        "` on a frozen processor.\nCreate a new processor first, by calling it: use `processor()` instead of `processor`.",
    );
}
function pf(e) {
  if (!Vu(e) || typeof e.type != "string") throw new TypeError("Expected node, got `" + e + "`");
}
function df(e, t, n) {
  if (!n) throw new Error("`" + e + "` finished async. Use `" + t + "` instead");
}
function Dl(e) {
  return Ww(e) ? e : new Th(e);
}
function Ww(e) {
  return !!(e && typeof e == "object" && "message" in e && "messages" in e);
}
function bw(e) {
  return typeof e == "string" || Qw(e);
}
function Qw(e) {
  return !!(e && typeof e == "object" && "byteLength" in e && "byteOffset" in e);
}
const Yw = "https://github.com/remarkjs/react-markdown/blob/main/changelog.md",
  hf = [],
  mf = { allowDangerousHtml: !0 },
  Xw = /^(https?|ircs?|mailto|xmpp)$/i,
  Kw = [
    { from: "astPlugins", id: "remove-buggy-html-in-markdown-parser" },
    { from: "allowDangerousHtml", id: "remove-buggy-html-in-markdown-parser" },
    {
      from: "allowNode",
      id: "replace-allownode-allowedtypes-and-disallowedtypes",
      to: "allowElement",
    },
    {
      from: "allowedTypes",
      id: "replace-allownode-allowedtypes-and-disallowedtypes",
      to: "allowedElements",
    },
    { from: "className", id: "remove-classname" },
    {
      from: "disallowedTypes",
      id: "replace-allownode-allowedtypes-and-disallowedtypes",
      to: "disallowedElements",
    },
    { from: "escapeHtml", id: "remove-buggy-html-in-markdown-parser" },
    { from: "includeElementIndex", id: "#remove-includeelementindex" },
    { from: "includeNodeIndex", id: "change-includenodeindex-to-includeelementindex" },
    { from: "linkTarget", id: "remove-linktarget" },
    { from: "plugins", id: "change-plugins-to-remarkplugins", to: "remarkPlugins" },
    { from: "rawSourcePos", id: "#remove-rawsourcepos" },
    { from: "renderers", id: "change-renderers-to-components", to: "components" },
    { from: "source", id: "change-source-to-children", to: "children" },
    { from: "sourcePos", id: "#remove-sourcepos" },
    { from: "transformImageUri", id: "#add-urltransform", to: "urlTransform" },
    { from: "transformLinkUri", id: "#add-urltransform", to: "urlTransform" },
  ];
function bx(e) {
  const t = Gw(e),
    n = qw(e);
  return Jw(t.runSync(t.parse(n), n), e);
}
function Gw(e) {
  const t = e.rehypePlugins || hf,
    n = e.remarkPlugins || hf,
    r = e.remarkRehypeOptions ? { ...e.remarkRehypeOptions, ...mf } : mf;
  return $w().use(zk).use(n).use(_w, r).use(t);
}
function qw(e) {
  const t = e.children || "",
    n = new Th();
  return (typeof t == "string" && (n.value = t), n);
}
function Jw(e, t) {
  const n = t.allowedElements,
    r = t.allowElement,
    l = t.components,
    i = t.disallowedElements,
    o = t.skipHtml,
    u = t.unwrapDisallowed,
    a = t.urlTransform || Zw;
  for (const c of Kw)
    Object.hasOwn(t, c.from) &&
      ("" + c.from + (c.to ? "use `" + c.to + "` instead" : "remove it") + Yw + c.id, void 0);
  return (
    Ph(e, s),
    s1(e, {
      Fragment: Gi.Fragment,
      components: l,
      ignoreInvalidStyle: !0,
      jsx: Gi.jsx,
      jsxs: Gi.jsxs,
      passKeys: !0,
      passNode: !0,
    })
  );
  function s(c, f, d) {
    if (c.type === "raw" && d && typeof f == "number")
      return (o ? d.children.splice(f, 1) : (d.children[f] = { type: "text", value: c.value }), f);
    if (c.type === "element") {
      let p;
      for (p in Po)
        if (Object.hasOwn(Po, p) && Object.hasOwn(c.properties, p)) {
          const w = c.properties[p],
            v = Po[p];
          (v === null || v.includes(c.tagName)) && (c.properties[p] = a(String(w || ""), p, c));
        }
    }
    if (c.type === "element") {
      let p = n ? !n.includes(c.tagName) : i ? i.includes(c.tagName) : !1;
      if ((!p && r && typeof f == "number" && (p = !r(c, f, d)), p && d && typeof f == "number"))
        return (
          u && c.children ? d.children.splice(f, 1, ...c.children) : d.children.splice(f, 1),
          f
        );
    }
  }
}
function Zw(e) {
  const t = e.indexOf(":"),
    n = e.indexOf("?"),
    r = e.indexOf("#"),
    l = e.indexOf("/");
  return t === -1 ||
    (l !== -1 && t > l) ||
    (n !== -1 && t > n) ||
    (r !== -1 && t > r) ||
    Xw.test(e.slice(0, t))
    ? e
    : "";
}
var vt = function () {
  return (
    (vt =
      Object.assign ||
      function (t) {
        for (var n, r = 1, l = arguments.length; r < l; r++) {
          n = arguments[r];
          for (var i in n) Object.prototype.hasOwnProperty.call(n, i) && (t[i] = n[i]);
        }
        return t;
      }),
    vt.apply(this, arguments)
  );
};
function Ih(e, t) {
  var n = {};
  for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.indexOf(r) < 0 && (n[r] = e[r]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var l = 0, r = Object.getOwnPropertySymbols(e); l < r.length; l++)
      t.indexOf(r[l]) < 0 &&
        Object.prototype.propertyIsEnumerable.call(e, r[l]) &&
        (n[r[l]] = e[r[l]]);
  return n;
}
function ex(e, t, n) {
  if (n || arguments.length === 2)
    for (var r = 0, l = t.length, i; r < l; r++)
      (i || !(r in t)) && (i || (i = Array.prototype.slice.call(t, 0, r)), (i[r] = t[r]));
  return e.concat(i || Array.prototype.slice.call(t));
}
var ql = "right-scroll-bar-position",
  Jl = "width-before-scroll-bar",
  tx = "with-scroll-bars-hidden",
  nx = "--removed-body-scroll-bar-size";
function Mo(e, t) {
  return (typeof e == "function" ? e(t) : e && (e.current = t), e);
}
function rx(e, t) {
  var n = _.useState(function () {
    return {
      value: e,
      callback: t,
      facade: {
        get current() {
          return n.value;
        },
        set current(r) {
          var l = n.value;
          l !== r && ((n.value = r), n.callback(r, l));
        },
      },
    };
  })[0];
  return ((n.callback = t), n.facade);
}
var lx = typeof window < "u" ? _.useLayoutEffect : _.useEffect,
  gf = new WeakMap();
function ix(e, t) {
  var n = rx(null, function (r) {
    return e.forEach(function (l) {
      return Mo(l, r);
    });
  });
  return (
    lx(
      function () {
        var r = gf.get(n);
        if (r) {
          var l = new Set(r),
            i = new Set(e),
            o = n.current;
          (l.forEach(function (u) {
            i.has(u) || Mo(u, null);
          }),
            i.forEach(function (u) {
              l.has(u) || Mo(u, o);
            }));
        }
        gf.set(n, e);
      },
      [e],
    ),
    n
  );
}
function ox(e) {
  return e;
}
function ux(e, t) {
  t === void 0 && (t = ox);
  var n = [],
    r = !1,
    l = {
      read: function () {
        if (r)
          throw new Error(
            "Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.",
          );
        return n.length ? n[n.length - 1] : e;
      },
      useMedium: function (i) {
        var o = t(i, r);
        return (
          n.push(o),
          function () {
            n = n.filter(function (u) {
              return u !== o;
            });
          }
        );
      },
      assignSyncMedium: function (i) {
        for (r = !0; n.length; ) {
          var o = n;
          ((n = []), o.forEach(i));
        }
        n = {
          push: function (u) {
            return i(u);
          },
          filter: function () {
            return n;
          },
        };
      },
      assignMedium: function (i) {
        r = !0;
        var o = [];
        if (n.length) {
          var u = n;
          ((n = []), u.forEach(i), (o = n));
        }
        var a = function () {
            var c = o;
            ((o = []), c.forEach(i));
          },
          s = function () {
            return Promise.resolve().then(a);
          };
        (s(),
          (n = {
            push: function (c) {
              (o.push(c), s());
            },
            filter: function (c) {
              return ((o = o.filter(c)), n);
            },
          }));
      },
    };
  return l;
}
function ax(e) {
  e === void 0 && (e = {});
  var t = ux(null);
  return ((t.options = vt({ async: !0, ssr: !1 }, e)), t);
}
var Nh = function (e) {
  var t = e.sideCar,
    n = Ih(e, ["sideCar"]);
  if (!t) throw new Error("Sidecar: please provide `sideCar` property to import the right car");
  var r = t.read();
  if (!r) throw new Error("Sidecar medium not found");
  return _.createElement(r, vt({}, n));
};
Nh.isSideCarExport = !0;
function sx(e, t) {
  return (e.useMedium(t), Nh);
}
var zh = ax(),
  Ao = function () {},
  Xi = _.forwardRef(function (e, t) {
    var n = _.useRef(null),
      r = _.useState({ onScrollCapture: Ao, onWheelCapture: Ao, onTouchMoveCapture: Ao }),
      l = r[0],
      i = r[1],
      o = e.forwardProps,
      u = e.children,
      a = e.className,
      s = e.removeScrollBar,
      c = e.enabled,
      f = e.shards,
      d = e.sideCar,
      p = e.noRelative,
      w = e.noIsolation,
      v = e.inert,
      S = e.allowPinchZoom,
      h = e.as,
      m = h === void 0 ? "div" : h,
      y = e.gapMode,
      E = Ih(e, [
        "forwardProps",
        "children",
        "className",
        "removeScrollBar",
        "enabled",
        "shards",
        "sideCar",
        "noRelative",
        "noIsolation",
        "inert",
        "allowPinchZoom",
        "as",
        "gapMode",
      ]),
      P = d,
      x = ix([n, t]),
      T = vt(vt({}, E), l);
    return _.createElement(
      _.Fragment,
      null,
      c &&
        _.createElement(P, {
          sideCar: zh,
          removeScrollBar: s,
          shards: f,
          noRelative: p,
          noIsolation: w,
          inert: v,
          setCallbacks: i,
          allowPinchZoom: !!S,
          lockRef: n,
          gapMode: y,
        }),
      o
        ? _.cloneElement(_.Children.only(u), vt(vt({}, T), { ref: x }))
        : _.createElement(m, vt({}, T, { className: a, ref: x }), u),
    );
  });
Xi.defaultProps = { enabled: !0, removeScrollBar: !0, inert: !1 };
Xi.classNames = { fullWidth: Jl, zeroRight: ql };
var cx = function () {
  if (typeof __webpack_nonce__ < "u") return __webpack_nonce__;
};
function fx() {
  if (!document) return null;
  var e = document.createElement("style");
  e.type = "text/css";
  var t = cx();
  return (t && e.setAttribute("nonce", t), e);
}
function px(e, t) {
  e.styleSheet ? (e.styleSheet.cssText = t) : e.appendChild(document.createTextNode(t));
}
function dx(e) {
  var t = document.head || document.getElementsByTagName("head")[0];
  t.appendChild(e);
}
var hx = function () {
    var e = 0,
      t = null;
    return {
      add: function (n) {
        (e == 0 && (t = fx()) && (px(t, n), dx(t)), e++);
      },
      remove: function () {
        (e--, !e && t && (t.parentNode && t.parentNode.removeChild(t), (t = null)));
      },
    };
  },
  mx = function () {
    var e = hx();
    return function (t, n) {
      _.useEffect(
        function () {
          return (
            e.add(t),
            function () {
              e.remove();
            }
          );
        },
        [t && n],
      );
    };
  },
  Lh = function () {
    var e = mx(),
      t = function (n) {
        var r = n.styles,
          l = n.dynamic;
        return (e(r, l), null);
      };
    return t;
  },
  gx = { left: 0, top: 0, right: 0, gap: 0 },
  Fo = function (e) {
    return parseInt(e || "", 10) || 0;
  },
  yx = function (e) {
    var t = window.getComputedStyle(document.body),
      n = t[e === "padding" ? "paddingLeft" : "marginLeft"],
      r = t[e === "padding" ? "paddingTop" : "marginTop"],
      l = t[e === "padding" ? "paddingRight" : "marginRight"];
    return [Fo(n), Fo(r), Fo(l)];
  },
  vx = function (e) {
    if ((e === void 0 && (e = "margin"), typeof window > "u")) return gx;
    var t = yx(e),
      n = document.documentElement.clientWidth,
      r = window.innerWidth;
    return { left: t[0], top: t[1], right: t[2], gap: Math.max(0, r - n + t[2] - t[0]) };
  },
  kx = Lh(),
  qn = "data-scroll-locked",
  wx = function (e, t, n, r) {
    var l = e.left,
      i = e.top,
      o = e.right,
      u = e.gap;
    return (
      n === void 0 && (n = "margin"),
      `
  .`
        .concat(
          tx,
          ` {
   overflow: hidden `,
        )
        .concat(
          r,
          `;
   padding-right: `,
        )
        .concat(u, "px ")
        .concat(
          r,
          `;
  }
  body[`,
        )
        .concat(
          qn,
          `] {
    overflow: hidden `,
        )
        .concat(
          r,
          `;
    overscroll-behavior: contain;
    `,
        )
        .concat(
          [
            t && "position: relative ".concat(r, ";"),
            n === "margin" &&
              `
    padding-left: `
                .concat(
                  l,
                  `px;
    padding-top: `,
                )
                .concat(
                  i,
                  `px;
    padding-right: `,
                )
                .concat(
                  o,
                  `px;
    margin-left:0;
    margin-top:0;
    margin-right: `,
                )
                .concat(u, "px ")
                .concat(
                  r,
                  `;
    `,
                ),
            n === "padding" && "padding-right: ".concat(u, "px ").concat(r, ";"),
          ]
            .filter(Boolean)
            .join(""),
          `
  }
  
  .`,
        )
        .concat(
          ql,
          ` {
    right: `,
        )
        .concat(u, "px ")
        .concat(
          r,
          `;
  }
  
  .`,
        )
        .concat(
          Jl,
          ` {
    margin-right: `,
        )
        .concat(u, "px ")
        .concat(
          r,
          `;
  }
  
  .`,
        )
        .concat(ql, " .")
        .concat(
          ql,
          ` {
    right: 0 `,
        )
        .concat(
          r,
          `;
  }
  
  .`,
        )
        .concat(Jl, " .")
        .concat(
          Jl,
          ` {
    margin-right: 0 `,
        )
        .concat(
          r,
          `;
  }
  
  body[`,
        )
        .concat(
          qn,
          `] {
    `,
        )
        .concat(nx, ": ")
        .concat(
          u,
          `px;
  }
`,
        )
    );
  },
  yf = function () {
    var e = parseInt(document.body.getAttribute(qn) || "0", 10);
    return isFinite(e) ? e : 0;
  },
  xx = function () {
    _.useEffect(function () {
      return (
        document.body.setAttribute(qn, (yf() + 1).toString()),
        function () {
          var e = yf() - 1;
          e <= 0 ? document.body.removeAttribute(qn) : document.body.setAttribute(qn, e.toString());
        }
      );
    }, []);
  },
  Sx = function (e) {
    var t = e.noRelative,
      n = e.noImportant,
      r = e.gapMode,
      l = r === void 0 ? "margin" : r;
    xx();
    var i = _.useMemo(
      function () {
        return vx(l);
      },
      [l],
    );
    return _.createElement(kx, { styles: wx(i, !t, l, n ? "" : "!important") });
  },
  $u = !1;
if (typeof window < "u")
  try {
    var Ml = Object.defineProperty({}, "passive", {
      get: function () {
        return (($u = !0), !0);
      },
    });
    (window.addEventListener("test", Ml, Ml), window.removeEventListener("test", Ml, Ml));
  } catch {
    $u = !1;
  }
var Nn = $u ? { passive: !1 } : !1,
  Ex = function (e) {
    return e.tagName === "TEXTAREA";
  },
  Rh = function (e, t) {
    if (!(e instanceof Element)) return !1;
    var n = window.getComputedStyle(e);
    return n[t] !== "hidden" && !(n.overflowY === n.overflowX && !Ex(e) && n[t] === "visible");
  },
  Cx = function (e) {
    return Rh(e, "overflowY");
  },
  Px = function (e) {
    return Rh(e, "overflowX");
  },
  vf = function (e, t) {
    var n = t.ownerDocument,
      r = t;
    do {
      typeof ShadowRoot < "u" && r instanceof ShadowRoot && (r = r.host);
      var l = Oh(e, r);
      if (l) {
        var i = Dh(e, r),
          o = i[1],
          u = i[2];
        if (o > u) return !0;
      }
      r = r.parentNode;
    } while (r && r !== n.body);
    return !1;
  },
  _x = function (e) {
    var t = e.scrollTop,
      n = e.scrollHeight,
      r = e.clientHeight;
    return [t, n, r];
  },
  Tx = function (e) {
    var t = e.scrollLeft,
      n = e.scrollWidth,
      r = e.clientWidth;
    return [t, n, r];
  },
  Oh = function (e, t) {
    return e === "v" ? Cx(t) : Px(t);
  },
  Dh = function (e, t) {
    return e === "v" ? _x(t) : Tx(t);
  },
  Ix = function (e, t) {
    return e === "h" && t === "rtl" ? -1 : 1;
  },
  Nx = function (e, t, n, r, l) {
    var i = Ix(e, window.getComputedStyle(t).direction),
      o = i * r,
      u = n.target,
      a = t.contains(u),
      s = !1,
      c = o > 0,
      f = 0,
      d = 0;
    do {
      if (!u) break;
      var p = Dh(e, u),
        w = p[0],
        v = p[1],
        S = p[2],
        h = v - S - i * w;
      (w || h) && Oh(e, u) && ((f += h), (d += w));
      var m = u.parentNode;
      u = m && m.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? m.host : m;
    } while ((!a && u !== document.body) || (a && (t.contains(u) || t === u)));
    return (((c && Math.abs(f) < 1) || (!c && Math.abs(d) < 1)) && (s = !0), s);
  },
  Al = function (e) {
    return "changedTouches" in e
      ? [e.changedTouches[0].clientX, e.changedTouches[0].clientY]
      : [0, 0];
  },
  kf = function (e) {
    return [e.deltaX, e.deltaY];
  },
  wf = function (e) {
    return e && "current" in e ? e.current : e;
  },
  zx = function (e, t) {
    return e[0] === t[0] && e[1] === t[1];
  },
  Lx = function (e) {
    return `
  .block-interactivity-`
      .concat(
        e,
        ` {pointer-events: none;}
  .allow-interactivity-`,
      )
      .concat(
        e,
        ` {pointer-events: all;}
`,
      );
  },
  Rx = 0,
  zn = [];
function Ox(e) {
  var t = _.useRef([]),
    n = _.useRef([0, 0]),
    r = _.useRef(),
    l = _.useState(Rx++)[0],
    i = _.useState(Lh)[0],
    o = _.useRef(e);
  (_.useEffect(
    function () {
      o.current = e;
    },
    [e],
  ),
    _.useEffect(
      function () {
        if (e.inert) {
          document.body.classList.add("block-interactivity-".concat(l));
          var v = ex([e.lockRef.current], (e.shards || []).map(wf), !0).filter(Boolean);
          return (
            v.forEach(function (S) {
              return S.classList.add("allow-interactivity-".concat(l));
            }),
            function () {
              (document.body.classList.remove("block-interactivity-".concat(l)),
                v.forEach(function (S) {
                  return S.classList.remove("allow-interactivity-".concat(l));
                }));
            }
          );
        }
      },
      [e.inert, e.lockRef.current, e.shards],
    ));
  var u = _.useCallback(function (v, S) {
      if (("touches" in v && v.touches.length === 2) || (v.type === "wheel" && v.ctrlKey))
        return !o.current.allowPinchZoom;
      var h = Al(v),
        m = n.current,
        y = "deltaX" in v ? v.deltaX : m[0] - h[0],
        E = "deltaY" in v ? v.deltaY : m[1] - h[1],
        P,
        x = v.target,
        T = Math.abs(y) > Math.abs(E) ? "h" : "v";
      if ("touches" in v && T === "h" && x.type === "range") return !1;
      var L = window.getSelection(),
        F = L && L.anchorNode,
        M = F ? F === x || F.contains(x) : !1;
      if (M) return !1;
      var O = vf(T, x);
      if (!O) return !0;
      if ((O ? (P = T) : ((P = T === "v" ? "h" : "v"), (O = vf(T, x))), !O)) return !1;
      if ((!r.current && "changedTouches" in v && (y || E) && (r.current = P), !P)) return !0;
      var A = r.current || P;
      return Nx(A, S, v, A === "h" ? y : E);
    }, []),
    a = _.useCallback(function (v) {
      var S = v;
      if (!(!zn.length || zn[zn.length - 1] !== i)) {
        var h = "deltaY" in S ? kf(S) : Al(S),
          m = t.current.filter(function (P) {
            return (
              P.name === S.type &&
              (P.target === S.target || S.target === P.shadowParent) &&
              zx(P.delta, h)
            );
          })[0];
        if (m && m.should) {
          S.cancelable && S.preventDefault();
          return;
        }
        if (!m) {
          var y = (o.current.shards || [])
              .map(wf)
              .filter(Boolean)
              .filter(function (P) {
                return P.contains(S.target);
              }),
            E = y.length > 0 ? u(S, y[0]) : !o.current.noIsolation;
          E && S.cancelable && S.preventDefault();
        }
      }
    }, []),
    s = _.useCallback(function (v, S, h, m) {
      var y = { name: v, delta: S, target: h, should: m, shadowParent: Dx(h) };
      (t.current.push(y),
        setTimeout(function () {
          t.current = t.current.filter(function (E) {
            return E !== y;
          });
        }, 1));
    }, []),
    c = _.useCallback(function (v) {
      ((n.current = Al(v)), (r.current = void 0));
    }, []),
    f = _.useCallback(function (v) {
      s(v.type, kf(v), v.target, u(v, e.lockRef.current));
    }, []),
    d = _.useCallback(function (v) {
      s(v.type, Al(v), v.target, u(v, e.lockRef.current));
    }, []);
  _.useEffect(function () {
    return (
      zn.push(i),
      e.setCallbacks({ onScrollCapture: f, onWheelCapture: f, onTouchMoveCapture: d }),
      document.addEventListener("wheel", a, Nn),
      document.addEventListener("touchmove", a, Nn),
      document.addEventListener("touchstart", c, Nn),
      function () {
        ((zn = zn.filter(function (v) {
          return v !== i;
        })),
          document.removeEventListener("wheel", a, Nn),
          document.removeEventListener("touchmove", a, Nn),
          document.removeEventListener("touchstart", c, Nn));
      }
    );
  }, []);
  var p = e.removeScrollBar,
    w = e.inert;
  return _.createElement(
    _.Fragment,
    null,
    w ? _.createElement(i, { styles: Lx(l) }) : null,
    p ? _.createElement(Sx, { noRelative: e.noRelative, gapMode: e.gapMode }) : null,
  );
}
function Dx(e) {
  for (var t = null; e !== null; )
    (e instanceof ShadowRoot && ((t = e.host), (e = e.host)), (e = e.parentNode));
  return t;
}
const Mx = sx(zh, Ox);
var Ax = _.forwardRef(function (e, t) {
  return _.createElement(Xi, vt({}, e, { ref: t, sideCar: Mx }));
});
Ax.classNames = Xi.classNames;
export {
  Vx as B,
  bx as M,
  jx as N,
  Ux as R,
  $x as a,
  dv as b,
  Nv as c,
  Wa as d,
  Zd as e,
  Pv as f,
  Pi as g,
  Iv as h,
  sv as i,
  Gi as j,
  vy as k,
  om as l,
  um as m,
  Ru as n,
  Hx as o,
  Wx as p,
  Od as q,
  _ as r,
  Ha as s,
  Fx as t,
  Ax as u,
  Ph as v,
  Yy as w,
  Bx as x,
  Ua as y,
};
