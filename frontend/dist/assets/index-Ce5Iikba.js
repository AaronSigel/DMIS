const __vite__mapDeps = (
  i,
  m = __vite__mapDeps,
  d = m.f ||
    (m.f = [
      "assets/WorkspacePage-BrN-9rpd.js",
      "assets/react-vendor-BYKCA02s.js",
      "assets/query-vendor-C0HI_nld.js",
      "assets/markdown-vendor-BoH24OZ1.js",
    ]),
) => i.map((i) => d[i]);
import {
  r as T,
  j as w,
  R as Xt,
  i as Ht,
  k as Qt,
  l as en,
  B as tn,
} from "./react-vendor-BYKCA02s.js";
import { Q as nn, a as lt } from "./query-vendor-C0HI_nld.js";
(function () {
  const t = document.createElement("link").relList;
  if (t && t.supports && t.supports("modulepreload")) return;
  for (const o of document.querySelectorAll('link[rel="modulepreload"]')) r(o);
  new MutationObserver((o) => {
    for (const s of o)
      if (s.type === "childList")
        for (const i of s.addedNodes) i.tagName === "LINK" && i.rel === "modulepreload" && r(i);
  }).observe(document, { childList: !0, subtree: !0 });
  function n(o) {
    const s = {};
    return (
      o.integrity && (s.integrity = o.integrity),
      o.referrerPolicy && (s.referrerPolicy = o.referrerPolicy),
      o.crossOrigin === "use-credentials"
        ? (s.credentials = "include")
        : o.crossOrigin === "anonymous"
          ? (s.credentials = "omit")
          : (s.credentials = "same-origin"),
      s
    );
  }
  function r(o) {
    if (o.ep) return;
    o.ep = !0;
    const s = n(o);
    fetch(o.href, s);
  }
})();
const rn = "modulepreload",
  on = function (e) {
    return "/" + e;
  },
  Re = {},
  sn = function (t, n, r) {
    let o = Promise.resolve();
    if (n && n.length > 0) {
      document.getElementsByTagName("link");
      const i = document.querySelector("meta[property=csp-nonce]"),
        u = (i == null ? void 0 : i.nonce) || (i == null ? void 0 : i.getAttribute("nonce"));
      o = Promise.allSettled(
        n.map((c) => {
          if (((c = on(c)), c in Re)) return;
          Re[c] = !0;
          const a = c.endsWith(".css"),
            l = a ? '[rel="stylesheet"]' : "";
          if (document.querySelector(`link[href="${c}"]${l}`)) return;
          const d = document.createElement("link");
          if (
            ((d.rel = a ? "stylesheet" : rn),
            a || (d.as = "script"),
            (d.crossOrigin = ""),
            (d.href = c),
            u && d.setAttribute("nonce", u),
            document.head.appendChild(d),
            a)
          )
            return new Promise((h, p) => {
              (d.addEventListener("load", h),
                d.addEventListener("error", () => p(new Error(`Unable to preload CSS for ${c}`))));
            });
        }),
      );
    }
    function s(i) {
      const u = new Event("vite:preloadError", { cancelable: !0 });
      if (((u.payload = i), window.dispatchEvent(u), !u.defaultPrevented)) throw i;
    }
    return o.then((i) => {
      for (const u of i || []) u.status === "rejected" && s(u.reason);
      return t().catch(s);
    });
  };
var De;
function f(e, t, n) {
  function r(u, c) {
    if (
      (u._zod ||
        Object.defineProperty(u, "_zod", {
          value: { def: c, constr: i, traits: new Set() },
          enumerable: !1,
        }),
      u._zod.traits.has(e))
    )
      return;
    (u._zod.traits.add(e), t(u, c));
    const a = i.prototype,
      l = Object.keys(a);
    for (let d = 0; d < l.length; d++) {
      const h = l[d];
      h in u || (u[h] = a[h].bind(u));
    }
  }
  const o = (n == null ? void 0 : n.Parent) ?? Object;
  class s extends o {}
  Object.defineProperty(s, "name", { value: e });
  function i(u) {
    var c;
    const a = n != null && n.Parent ? new s() : this;
    (r(a, u), (c = a._zod).deferred ?? (c.deferred = []));
    for (const l of a._zod.deferred) l();
    return a;
  }
  return (
    Object.defineProperty(i, "init", { value: r }),
    Object.defineProperty(i, Symbol.hasInstance, {
      value: (u) => {
        var c, a;
        return n != null && n.Parent && u instanceof n.Parent
          ? !0
          : (a = (c = u == null ? void 0 : u._zod) == null ? void 0 : c.traits) == null
            ? void 0
            : a.has(e);
      },
    }),
    Object.defineProperty(i, "name", { value: e }),
    i
  );
}
class H extends Error {
  constructor() {
    super("Encountered Promise during synchronous parse. Use .parseAsync() instead.");
  }
}
class ft extends Error {
  constructor(t) {
    (super(`Encountered unidirectional transform during encode: ${t}`),
      (this.name = "ZodEncodeError"));
  }
}
(De = globalThis).__zod_globalConfig ?? (De.__zod_globalConfig = {});
const Se = globalThis.__zod_globalConfig;
function M(e) {
  return Se;
}
function dt(e) {
  const t = Object.values(e).filter((r) => typeof r == "number");
  return Object.entries(e)
    .filter(([r, o]) => t.indexOf(+r) === -1)
    .map(([r, o]) => o);
}
function be(e, t) {
  return typeof t == "bigint" ? t.toString() : t;
}
function Ze(e) {
  return {
    get value() {
      {
        const t = e();
        return (Object.defineProperty(this, "value", { value: t }), t);
      }
    },
  };
}
function Ee(e) {
  return e == null;
}
function Oe(e) {
  const t = e.startsWith("^") ? 1 : 0,
    n = e.endsWith("$") ? e.length - 1 : e.length;
  return e.slice(t, n);
}
function un(e, t) {
  const n = e / t,
    r = Math.round(n),
    o = Number.EPSILON * Math.max(Math.abs(n), 1);
  return Math.abs(n - r) < o ? 0 : n - r;
}
const Ue = Symbol("evaluating");
function y(e, t, n) {
  let r;
  Object.defineProperty(e, t, {
    get() {
      if (r !== Ue) return (r === void 0 && ((r = Ue), (r = n())), r);
    },
    set(o) {
      Object.defineProperty(e, t, { value: o });
    },
    configurable: !0,
  });
}
function K(e, t, n) {
  Object.defineProperty(e, t, { value: n, writable: !0, enumerable: !0, configurable: !0 });
}
function W(...e) {
  const t = {};
  for (const n of e) {
    const r = Object.getOwnPropertyDescriptors(n);
    Object.assign(t, r);
  }
  return Object.defineProperties({}, t);
}
function Fe(e) {
  return JSON.stringify(e);
}
function cn(e) {
  return e
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
const ht = "captureStackTrace" in Error ? Error.captureStackTrace : (...e) => {};
function ae(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
const an = Ze(() => {
  var e;
  if (
    Se.jitless ||
    (typeof navigator < "u" &&
      (e = navigator == null ? void 0 : navigator.userAgent) != null &&
      e.includes("Cloudflare"))
  )
    return !1;
  try {
    const t = Function;
    return (new t(""), !0);
  } catch {
    return !1;
  }
});
function Q(e) {
  if (ae(e) === !1) return !1;
  const t = e.constructor;
  if (t === void 0 || typeof t != "function") return !0;
  const n = t.prototype;
  return !(ae(n) === !1 || Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") === !1);
}
function pt(e) {
  return Q(e)
    ? { ...e }
    : Array.isArray(e)
      ? [...e]
      : e instanceof Map
        ? new Map(e)
        : e instanceof Set
          ? new Set(e)
          : e;
}
const ln = new Set(["string", "number", "symbol"]);
function ee(e) {
  return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function B(e, t, n) {
  const r = new e._zod.constr(t ?? e._zod.def);
  return ((!t || (n != null && n.parent)) && (r._zod.parent = e), r);
}
function m(e) {
  const t = e;
  if (!t) return {};
  if (typeof t == "string") return { error: () => t };
  if ((t == null ? void 0 : t.message) !== void 0) {
    if ((t == null ? void 0 : t.error) !== void 0)
      throw new Error("Cannot specify both `message` and `error` params");
    t.error = t.message;
  }
  return (delete t.message, typeof t.error == "string" ? { ...t, error: () => t.error } : t);
}
function fn(e) {
  return Object.keys(e).filter(
    (t) => e[t]._zod.optin === "optional" && e[t]._zod.optout === "optional",
  );
}
const dn = {
  safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
  int32: [-2147483648, 2147483647],
  uint32: [0, 4294967295],
  float32: [-34028234663852886e22, 34028234663852886e22],
  float64: [-Number.MAX_VALUE, Number.MAX_VALUE],
};
function hn(e, t) {
  const n = e._zod.def,
    r = n.checks;
  if (r && r.length > 0)
    throw new Error(".pick() cannot be used on object schemas containing refinements");
  const s = W(e._zod.def, {
    get shape() {
      const i = {};
      for (const u in t) {
        if (!(u in n.shape)) throw new Error(`Unrecognized key: "${u}"`);
        t[u] && (i[u] = n.shape[u]);
      }
      return (K(this, "shape", i), i);
    },
    checks: [],
  });
  return B(e, s);
}
function pn(e, t) {
  const n = e._zod.def,
    r = n.checks;
  if (r && r.length > 0)
    throw new Error(".omit() cannot be used on object schemas containing refinements");
  const s = W(e._zod.def, {
    get shape() {
      const i = { ...e._zod.def.shape };
      for (const u in t) {
        if (!(u in n.shape)) throw new Error(`Unrecognized key: "${u}"`);
        t[u] && delete i[u];
      }
      return (K(this, "shape", i), i);
    },
    checks: [],
  });
  return B(e, s);
}
function mn(e, t) {
  if (!Q(t)) throw new Error("Invalid input to extend: expected a plain object");
  const n = e._zod.def.checks;
  if (n && n.length > 0) {
    const s = e._zod.def.shape;
    for (const i in t)
      if (Object.getOwnPropertyDescriptor(s, i) !== void 0)
        throw new Error(
          "Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.",
        );
  }
  const o = W(e._zod.def, {
    get shape() {
      const s = { ...e._zod.def.shape, ...t };
      return (K(this, "shape", s), s);
    },
  });
  return B(e, o);
}
function gn(e, t) {
  if (!Q(t)) throw new Error("Invalid input to safeExtend: expected a plain object");
  const n = W(e._zod.def, {
    get shape() {
      const r = { ...e._zod.def.shape, ...t };
      return (K(this, "shape", r), r);
    },
  });
  return B(e, n);
}
function _n(e, t) {
  var r;
  if ((r = e._zod.def.checks) != null && r.length)
    throw new Error(
      ".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.",
    );
  const n = W(e._zod.def, {
    get shape() {
      const o = { ...e._zod.def.shape, ...t._zod.def.shape };
      return (K(this, "shape", o), o);
    },
    get catchall() {
      return t._zod.def.catchall;
    },
    checks: t._zod.def.checks ?? [],
  });
  return B(e, n);
}
function vn(e, t, n) {
  const o = t._zod.def.checks;
  if (o && o.length > 0)
    throw new Error(".partial() cannot be used on object schemas containing refinements");
  const i = W(t._zod.def, {
    get shape() {
      const u = t._zod.def.shape,
        c = { ...u };
      if (n)
        for (const a in n) {
          if (!(a in u)) throw new Error(`Unrecognized key: "${a}"`);
          n[a] && (c[a] = e ? new e({ type: "optional", innerType: u[a] }) : u[a]);
        }
      else for (const a in u) c[a] = e ? new e({ type: "optional", innerType: u[a] }) : u[a];
      return (K(this, "shape", c), c);
    },
    checks: [],
  });
  return B(t, i);
}
function yn(e, t, n) {
  const r = W(t._zod.def, {
    get shape() {
      const o = t._zod.def.shape,
        s = { ...o };
      if (n)
        for (const i in n) {
          if (!(i in s)) throw new Error(`Unrecognized key: "${i}"`);
          n[i] && (s[i] = new e({ type: "nonoptional", innerType: o[i] }));
        }
      else for (const i in o) s[i] = new e({ type: "nonoptional", innerType: o[i] });
      return (K(this, "shape", s), s);
    },
  });
  return B(t, r);
}
function Y(e, t = 0) {
  var n;
  if (e.aborted === !0) return !0;
  for (let r = t; r < e.issues.length; r++)
    if (((n = e.issues[r]) == null ? void 0 : n.continue) !== !0) return !0;
  return !1;
}
function wn(e, t = 0) {
  var n;
  if (e.aborted === !0) return !0;
  for (let r = t; r < e.issues.length; r++)
    if (((n = e.issues[r]) == null ? void 0 : n.continue) === !1) return !0;
  return !1;
}
function X(e, t) {
  return t.map((n) => {
    var r;
    return ((r = n).path ?? (r.path = []), n.path.unshift(e), n);
  });
}
function se(e) {
  return typeof e == "string" ? e : e == null ? void 0 : e.message;
}
function V(e, t, n) {
  var c, a, l, d, h, p;
  const r = e.message
      ? e.message
      : (se(
          (l = (a = (c = e.inst) == null ? void 0 : c._zod.def) == null ? void 0 : a.error) == null
            ? void 0
            : l.call(a, e),
        ) ??
        se((d = t == null ? void 0 : t.error) == null ? void 0 : d.call(t, e)) ??
        se((h = n.customError) == null ? void 0 : h.call(n, e)) ??
        se((p = n.localeError) == null ? void 0 : p.call(n, e)) ??
        "Invalid input"),
    { inst: o, continue: s, input: i, ...u } = e;
  return (u.path ?? (u.path = []), (u.message = r), t != null && t.reportInput && (u.input = i), u);
}
function Te(e) {
  return Array.isArray(e) ? "array" : typeof e == "string" ? "string" : "unknown";
}
function re(...e) {
  const [t, n, r] = e;
  return typeof t == "string" ? { message: t, code: "custom", input: n, inst: r } : { ...t };
}
const mt = (e, t) => {
    ((e.name = "$ZodError"),
      Object.defineProperty(e, "_zod", { value: e._zod, enumerable: !1 }),
      Object.defineProperty(e, "issues", { value: t, enumerable: !1 }),
      (e.message = JSON.stringify(t, be, 2)),
      Object.defineProperty(e, "toString", { value: () => e.message, enumerable: !1 }));
  },
  gt = f("$ZodError", mt),
  _t = f("$ZodError", mt, { Parent: Error });
function bn(e, t = (n) => n.message) {
  const n = {},
    r = [];
  for (const o of e.issues)
    o.path.length > 0
      ? ((n[o.path[0]] = n[o.path[0]] || []), n[o.path[0]].push(t(o)))
      : r.push(t(o));
  return { formErrors: r, fieldErrors: n };
}
function zn(e, t = (n) => n.message) {
  const n = { _errors: [] },
    r = (o, s = []) => {
      for (const i of o.issues)
        if (i.code === "invalid_union" && i.errors.length)
          i.errors.map((u) => r({ issues: u }, [...s, ...i.path]));
        else if (i.code === "invalid_key") r({ issues: i.issues }, [...s, ...i.path]);
        else if (i.code === "invalid_element") r({ issues: i.issues }, [...s, ...i.path]);
        else {
          const u = [...s, ...i.path];
          if (u.length === 0) n._errors.push(t(i));
          else {
            let c = n,
              a = 0;
            for (; a < u.length; ) {
              const l = u[a];
              (a === u.length - 1
                ? ((c[l] = c[l] || { _errors: [] }), c[l]._errors.push(t(i)))
                : (c[l] = c[l] || { _errors: [] }),
                (c = c[l]),
                a++);
            }
          }
        }
    };
  return (r(e), n);
}
const Pe = (e) => (t, n, r, o) => {
    const s = r ? { ...r, async: !1 } : { async: !1 },
      i = t._zod.run({ value: n, issues: [] }, s);
    if (i instanceof Promise) throw new H();
    if (i.issues.length) {
      const u = new ((o == null ? void 0 : o.Err) ?? e)(i.issues.map((c) => V(c, s, M())));
      throw (ht(u, o == null ? void 0 : o.callee), u);
    }
    return i.value;
  },
  Ie = (e) => async (t, n, r, o) => {
    const s = r ? { ...r, async: !0 } : { async: !0 };
    let i = t._zod.run({ value: n, issues: [] }, s);
    if ((i instanceof Promise && (i = await i), i.issues.length)) {
      const u = new ((o == null ? void 0 : o.Err) ?? e)(i.issues.map((c) => V(c, s, M())));
      throw (ht(u, o == null ? void 0 : o.callee), u);
    }
    return i.value;
  },
  he = (e) => (t, n, r) => {
    const o = r ? { ...r, async: !1 } : { async: !1 },
      s = t._zod.run({ value: n, issues: [] }, o);
    if (s instanceof Promise) throw new H();
    return s.issues.length
      ? { success: !1, error: new (e ?? gt)(s.issues.map((i) => V(i, o, M()))) }
      : { success: !0, data: s.value };
  },
  $n = he(_t),
  pe = (e) => async (t, n, r) => {
    const o = r ? { ...r, async: !0 } : { async: !0 };
    let s = t._zod.run({ value: n, issues: [] }, o);
    return (
      s instanceof Promise && (s = await s),
      s.issues.length
        ? { success: !1, error: new e(s.issues.map((i) => V(i, o, M()))) }
        : { success: !0, data: s.value }
    );
  },
  kn = pe(_t),
  Sn = (e) => (t, n, r) => {
    const o = r ? { ...r, direction: "backward" } : { direction: "backward" };
    return Pe(e)(t, n, o);
  },
  Zn = (e) => (t, n, r) => Pe(e)(t, n, r),
  En = (e) => async (t, n, r) => {
    const o = r ? { ...r, direction: "backward" } : { direction: "backward" };
    return Ie(e)(t, n, o);
  },
  On = (e) => async (t, n, r) => Ie(e)(t, n, r),
  Tn = (e) => (t, n, r) => {
    const o = r ? { ...r, direction: "backward" } : { direction: "backward" };
    return he(e)(t, n, o);
  },
  Pn = (e) => (t, n, r) => he(e)(t, n, r),
  In = (e) => async (t, n, r) => {
    const o = r ? { ...r, direction: "backward" } : { direction: "backward" };
    return pe(e)(t, n, o);
  },
  Nn = (e) => async (t, n, r) => pe(e)(t, n, r),
  jn = /^[cC][0-9a-z]{6,}$/,
  An = /^[0-9a-z]+$/,
  xn = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/,
  Cn = /^[0-9a-vA-V]{20}$/,
  Rn = /^[A-Za-z0-9]{27}$/,
  Dn = /^[a-zA-Z0-9_-]{21}$/,
  Un =
    /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/,
  Fn = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/,
  Le = (e) =>
    e
      ? new RegExp(
          `^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${e}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`,
        )
      : /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/,
  Ln =
    /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/,
  Jn = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$";
function Mn() {
  return new RegExp(Jn, "u");
}
const Vn =
    /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,
  Wn =
    /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/,
  Bn =
    /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/,
  Gn =
    /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,
  Kn = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/,
  vt = /^[A-Za-z0-9_-]*$/,
  qn = /^https?$/,
  Yn = /^\+[1-9]\d{6,14}$/,
  yt =
    "(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))",
  Xn = new RegExp(`^${yt}$`);
function wt(e) {
  const t = "(?:[01]\\d|2[0-3]):[0-5]\\d";
  return typeof e.precision == "number"
    ? e.precision === -1
      ? `${t}`
      : e.precision === 0
        ? `${t}:[0-5]\\d`
        : `${t}:[0-5]\\d\\.\\d{${e.precision}}`
    : `${t}(?::[0-5]\\d(?:\\.\\d+)?)?`;
}
function Hn(e) {
  return new RegExp(`^${wt(e)}$`);
}
function Qn(e) {
  const t = wt({ precision: e.precision }),
    n = ["Z"];
  (e.local && n.push(""), e.offset && n.push("([+-](?:[01]\\d|2[0-3]):[0-5]\\d)"));
  const r = `${t}(?:${n.join("|")})`;
  return new RegExp(`^${yt}T(?:${r})$`);
}
const er = (e) => {
    const t = e
      ? `[\\s\\S]{${(e == null ? void 0 : e.minimum) ?? 0},${(e == null ? void 0 : e.maximum) ?? ""}}`
      : "[\\s\\S]*";
    return new RegExp(`^${t}$`);
  },
  tr = /^-?\d+$/,
  bt = /^-?\d+(?:\.\d+)?$/,
  nr = /^(?:true|false)$/i,
  rr = /^[^A-Z]*$/,
  or = /^[^a-z]*$/,
  D = f("$ZodCheck", (e, t) => {
    var n;
    (e._zod ?? (e._zod = {}), (e._zod.def = t), (n = e._zod).onattach ?? (n.onattach = []));
  }),
  zt = { number: "number", bigint: "bigint", object: "date" },
  $t = f("$ZodCheckLessThan", (e, t) => {
    D.init(e, t);
    const n = zt[typeof t.value];
    (e._zod.onattach.push((r) => {
      const o = r._zod.bag,
        s = (t.inclusive ? o.maximum : o.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
      t.value < s && (t.inclusive ? (o.maximum = t.value) : (o.exclusiveMaximum = t.value));
    }),
      (e._zod.check = (r) => {
        (t.inclusive ? r.value <= t.value : r.value < t.value) ||
          r.issues.push({
            origin: n,
            code: "too_big",
            maximum: typeof t.value == "object" ? t.value.getTime() : t.value,
            input: r.value,
            inclusive: t.inclusive,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  kt = f("$ZodCheckGreaterThan", (e, t) => {
    D.init(e, t);
    const n = zt[typeof t.value];
    (e._zod.onattach.push((r) => {
      const o = r._zod.bag,
        s = (t.inclusive ? o.minimum : o.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
      t.value > s && (t.inclusive ? (o.minimum = t.value) : (o.exclusiveMinimum = t.value));
    }),
      (e._zod.check = (r) => {
        (t.inclusive ? r.value >= t.value : r.value > t.value) ||
          r.issues.push({
            origin: n,
            code: "too_small",
            minimum: typeof t.value == "object" ? t.value.getTime() : t.value,
            input: r.value,
            inclusive: t.inclusive,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  sr = f("$ZodCheckMultipleOf", (e, t) => {
    (D.init(e, t),
      e._zod.onattach.push((n) => {
        var r;
        (r = n._zod.bag).multipleOf ?? (r.multipleOf = t.value);
      }),
      (e._zod.check = (n) => {
        if (typeof n.value != typeof t.value)
          throw new Error("Cannot mix number and bigint in multiple_of check.");
        (typeof n.value == "bigint"
          ? n.value % t.value === BigInt(0)
          : un(n.value, t.value) === 0) ||
          n.issues.push({
            origin: typeof n.value,
            code: "not_multiple_of",
            divisor: t.value,
            input: n.value,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  ir = f("$ZodCheckNumberFormat", (e, t) => {
    var i;
    (D.init(e, t), (t.format = t.format || "float64"));
    const n = (i = t.format) == null ? void 0 : i.includes("int"),
      r = n ? "int" : "number",
      [o, s] = dn[t.format];
    (e._zod.onattach.push((u) => {
      const c = u._zod.bag;
      ((c.format = t.format), (c.minimum = o), (c.maximum = s), n && (c.pattern = tr));
    }),
      (e._zod.check = (u) => {
        const c = u.value;
        if (n) {
          if (!Number.isInteger(c)) {
            u.issues.push({
              expected: r,
              format: t.format,
              code: "invalid_type",
              continue: !1,
              input: c,
              inst: e,
            });
            return;
          }
          if (!Number.isSafeInteger(c)) {
            c > 0
              ? u.issues.push({
                  input: c,
                  code: "too_big",
                  maximum: Number.MAX_SAFE_INTEGER,
                  note: "Integers must be within the safe integer range.",
                  inst: e,
                  origin: r,
                  inclusive: !0,
                  continue: !t.abort,
                })
              : u.issues.push({
                  input: c,
                  code: "too_small",
                  minimum: Number.MIN_SAFE_INTEGER,
                  note: "Integers must be within the safe integer range.",
                  inst: e,
                  origin: r,
                  inclusive: !0,
                  continue: !t.abort,
                });
            return;
          }
        }
        (c < o &&
          u.issues.push({
            origin: "number",
            input: c,
            code: "too_small",
            minimum: o,
            inclusive: !0,
            inst: e,
            continue: !t.abort,
          }),
          c > s &&
            u.issues.push({
              origin: "number",
              input: c,
              code: "too_big",
              maximum: s,
              inclusive: !0,
              inst: e,
              continue: !t.abort,
            }));
      }));
  }),
  ur = f("$ZodCheckMaxLength", (e, t) => {
    var n;
    (D.init(e, t),
      (n = e._zod.def).when ??
        (n.when = (r) => {
          const o = r.value;
          return !Ee(o) && o.length !== void 0;
        }),
      e._zod.onattach.push((r) => {
        const o = r._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
        t.maximum < o && (r._zod.bag.maximum = t.maximum);
      }),
      (e._zod.check = (r) => {
        const o = r.value;
        if (o.length <= t.maximum) return;
        const i = Te(o);
        r.issues.push({
          origin: i,
          code: "too_big",
          maximum: t.maximum,
          inclusive: !0,
          input: o,
          inst: e,
          continue: !t.abort,
        });
      }));
  }),
  cr = f("$ZodCheckMinLength", (e, t) => {
    var n;
    (D.init(e, t),
      (n = e._zod.def).when ??
        (n.when = (r) => {
          const o = r.value;
          return !Ee(o) && o.length !== void 0;
        }),
      e._zod.onattach.push((r) => {
        const o = r._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
        t.minimum > o && (r._zod.bag.minimum = t.minimum);
      }),
      (e._zod.check = (r) => {
        const o = r.value;
        if (o.length >= t.minimum) return;
        const i = Te(o);
        r.issues.push({
          origin: i,
          code: "too_small",
          minimum: t.minimum,
          inclusive: !0,
          input: o,
          inst: e,
          continue: !t.abort,
        });
      }));
  }),
  ar = f("$ZodCheckLengthEquals", (e, t) => {
    var n;
    (D.init(e, t),
      (n = e._zod.def).when ??
        (n.when = (r) => {
          const o = r.value;
          return !Ee(o) && o.length !== void 0;
        }),
      e._zod.onattach.push((r) => {
        const o = r._zod.bag;
        ((o.minimum = t.length), (o.maximum = t.length), (o.length = t.length));
      }),
      (e._zod.check = (r) => {
        const o = r.value,
          s = o.length;
        if (s === t.length) return;
        const i = Te(o),
          u = s > t.length;
        r.issues.push({
          origin: i,
          ...(u
            ? { code: "too_big", maximum: t.length }
            : { code: "too_small", minimum: t.length }),
          inclusive: !0,
          exact: !0,
          input: r.value,
          inst: e,
          continue: !t.abort,
        });
      }));
  }),
  me = f("$ZodCheckStringFormat", (e, t) => {
    var n, r;
    (D.init(e, t),
      e._zod.onattach.push((o) => {
        const s = o._zod.bag;
        ((s.format = t.format),
          t.pattern && (s.patterns ?? (s.patterns = new Set()), s.patterns.add(t.pattern)));
      }),
      t.pattern
        ? ((n = e._zod).check ??
          (n.check = (o) => {
            ((t.pattern.lastIndex = 0),
              !t.pattern.test(o.value) &&
                o.issues.push({
                  origin: "string",
                  code: "invalid_format",
                  format: t.format,
                  input: o.value,
                  ...(t.pattern ? { pattern: t.pattern.toString() } : {}),
                  inst: e,
                  continue: !t.abort,
                }));
          }))
        : ((r = e._zod).check ?? (r.check = () => {})));
  }),
  lr = f("$ZodCheckRegex", (e, t) => {
    (me.init(e, t),
      (e._zod.check = (n) => {
        ((t.pattern.lastIndex = 0),
          !t.pattern.test(n.value) &&
            n.issues.push({
              origin: "string",
              code: "invalid_format",
              format: "regex",
              input: n.value,
              pattern: t.pattern.toString(),
              inst: e,
              continue: !t.abort,
            }));
      }));
  }),
  fr = f("$ZodCheckLowerCase", (e, t) => {
    (t.pattern ?? (t.pattern = rr), me.init(e, t));
  }),
  dr = f("$ZodCheckUpperCase", (e, t) => {
    (t.pattern ?? (t.pattern = or), me.init(e, t));
  }),
  hr = f("$ZodCheckIncludes", (e, t) => {
    D.init(e, t);
    const n = ee(t.includes),
      r = new RegExp(typeof t.position == "number" ? `^.{${t.position}}${n}` : n);
    ((t.pattern = r),
      e._zod.onattach.push((o) => {
        const s = o._zod.bag;
        (s.patterns ?? (s.patterns = new Set()), s.patterns.add(r));
      }),
      (e._zod.check = (o) => {
        o.value.includes(t.includes, t.position) ||
          o.issues.push({
            origin: "string",
            code: "invalid_format",
            format: "includes",
            includes: t.includes,
            input: o.value,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  pr = f("$ZodCheckStartsWith", (e, t) => {
    D.init(e, t);
    const n = new RegExp(`^${ee(t.prefix)}.*`);
    (t.pattern ?? (t.pattern = n),
      e._zod.onattach.push((r) => {
        const o = r._zod.bag;
        (o.patterns ?? (o.patterns = new Set()), o.patterns.add(n));
      }),
      (e._zod.check = (r) => {
        r.value.startsWith(t.prefix) ||
          r.issues.push({
            origin: "string",
            code: "invalid_format",
            format: "starts_with",
            prefix: t.prefix,
            input: r.value,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  mr = f("$ZodCheckEndsWith", (e, t) => {
    D.init(e, t);
    const n = new RegExp(`.*${ee(t.suffix)}$`);
    (t.pattern ?? (t.pattern = n),
      e._zod.onattach.push((r) => {
        const o = r._zod.bag;
        (o.patterns ?? (o.patterns = new Set()), o.patterns.add(n));
      }),
      (e._zod.check = (r) => {
        r.value.endsWith(t.suffix) ||
          r.issues.push({
            origin: "string",
            code: "invalid_format",
            format: "ends_with",
            suffix: t.suffix,
            input: r.value,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  gr = f("$ZodCheckOverwrite", (e, t) => {
    (D.init(e, t),
      (e._zod.check = (n) => {
        n.value = t.tx(n.value);
      }));
  });
class _r {
  constructor(t = []) {
    ((this.content = []), (this.indent = 0), this && (this.args = t));
  }
  indented(t) {
    ((this.indent += 1), t(this), (this.indent -= 1));
  }
  write(t) {
    if (typeof t == "function") {
      (t(this, { execution: "sync" }), t(this, { execution: "async" }));
      return;
    }
    const r = t
        .split(
          `
`,
        )
        .filter((i) => i),
      o = Math.min(...r.map((i) => i.length - i.trimStart().length)),
      s = r.map((i) => i.slice(o)).map((i) => " ".repeat(this.indent * 2) + i);
    for (const i of s) this.content.push(i);
  }
  compile() {
    const t = Function,
      n = this == null ? void 0 : this.args,
      o = [...((this == null ? void 0 : this.content) ?? [""]).map((s) => `  ${s}`)];
    return new t(
      ...n,
      o.join(`
`),
    );
  }
}
const vr = { major: 4, minor: 4, patch: 3 },
  $ = f("$ZodType", (e, t) => {
    var o;
    var n;
    (e ?? (e = {}), (e._zod.def = t), (e._zod.bag = e._zod.bag || {}), (e._zod.version = vr));
    const r = [...(e._zod.def.checks ?? [])];
    e._zod.traits.has("$ZodCheck") && r.unshift(e);
    for (const s of r) for (const i of s._zod.onattach) i(e);
    if (r.length === 0)
      ((n = e._zod).deferred ?? (n.deferred = []),
        (o = e._zod.deferred) == null ||
          o.push(() => {
            e._zod.run = e._zod.parse;
          }));
    else {
      const s = (u, c, a) => {
          let l = Y(u),
            d;
          for (const h of c) {
            if (h._zod.def.when) {
              if (wn(u) || !h._zod.def.when(u)) continue;
            } else if (l) continue;
            const p = u.issues.length,
              v = h._zod.check(u);
            if (v instanceof Promise && (a == null ? void 0 : a.async) === !1) throw new H();
            if (d || v instanceof Promise)
              d = (d ?? Promise.resolve()).then(async () => {
                (await v, u.issues.length !== p && (l || (l = Y(u, p))));
              });
            else {
              if (u.issues.length === p) continue;
              l || (l = Y(u, p));
            }
          }
          return d ? d.then(() => u) : u;
        },
        i = (u, c, a) => {
          if (Y(u)) return ((u.aborted = !0), u);
          const l = s(c, r, a);
          if (l instanceof Promise) {
            if (a.async === !1) throw new H();
            return l.then((d) => e._zod.parse(d, a));
          }
          return e._zod.parse(l, a);
        };
      e._zod.run = (u, c) => {
        if (c.skipChecks) return e._zod.parse(u, c);
        if (c.direction === "backward") {
          const l = e._zod.parse({ value: u.value, issues: [] }, { ...c, skipChecks: !0 });
          return l instanceof Promise ? l.then((d) => i(d, u, c)) : i(l, u, c);
        }
        const a = e._zod.parse(u, c);
        if (a instanceof Promise) {
          if (c.async === !1) throw new H();
          return a.then((l) => s(l, r, c));
        }
        return s(a, r, c);
      };
    }
    y(e, "~standard", () => ({
      validate: (s) => {
        var i;
        try {
          const u = $n(e, s);
          return u.success
            ? { value: u.data }
            : { issues: (i = u.error) == null ? void 0 : i.issues };
        } catch {
          return kn(e, s).then((c) => {
            var a;
            return c.success
              ? { value: c.data }
              : { issues: (a = c.error) == null ? void 0 : a.issues };
          });
        }
      },
      vendor: "zod",
      version: 1,
    }));
  }),
  Ne = f("$ZodString", (e, t) => {
    var n;
    ($.init(e, t),
      (e._zod.pattern =
        [...(((n = e == null ? void 0 : e._zod.bag) == null ? void 0 : n.patterns) ?? [])].pop() ??
        er(e._zod.bag)),
      (e._zod.parse = (r, o) => {
        if (t.coerce)
          try {
            r.value = String(r.value);
          } catch {}
        return (
          typeof r.value == "string" ||
            r.issues.push({ expected: "string", code: "invalid_type", input: r.value, inst: e }),
          r
        );
      }));
  }),
  z = f("$ZodStringFormat", (e, t) => {
    (me.init(e, t), Ne.init(e, t));
  }),
  yr = f("$ZodGUID", (e, t) => {
    (t.pattern ?? (t.pattern = Fn), z.init(e, t));
  }),
  wr = f("$ZodUUID", (e, t) => {
    if (t.version) {
      const r = { v1: 1, v2: 2, v3: 3, v4: 4, v5: 5, v6: 6, v7: 7, v8: 8 }[t.version];
      if (r === void 0) throw new Error(`Invalid UUID version: "${t.version}"`);
      t.pattern ?? (t.pattern = Le(r));
    } else t.pattern ?? (t.pattern = Le());
    z.init(e, t);
  }),
  br = f("$ZodEmail", (e, t) => {
    (t.pattern ?? (t.pattern = Ln), z.init(e, t));
  }),
  zr = f("$ZodURL", (e, t) => {
    (z.init(e, t),
      (e._zod.check = (n) => {
        var r;
        try {
          const o = n.value.trim();
          if (
            !t.normalize &&
            ((r = t.protocol) == null ? void 0 : r.source) === qn.source &&
            !/^https?:\/\//i.test(o)
          ) {
            n.issues.push({
              code: "invalid_format",
              format: "url",
              note: "Invalid URL format",
              input: n.value,
              inst: e,
              continue: !t.abort,
            });
            return;
          }
          const s = new URL(o);
          (t.hostname &&
            ((t.hostname.lastIndex = 0),
            t.hostname.test(s.hostname) ||
              n.issues.push({
                code: "invalid_format",
                format: "url",
                note: "Invalid hostname",
                pattern: t.hostname.source,
                input: n.value,
                inst: e,
                continue: !t.abort,
              })),
            t.protocol &&
              ((t.protocol.lastIndex = 0),
              t.protocol.test(s.protocol.endsWith(":") ? s.protocol.slice(0, -1) : s.protocol) ||
                n.issues.push({
                  code: "invalid_format",
                  format: "url",
                  note: "Invalid protocol",
                  pattern: t.protocol.source,
                  input: n.value,
                  inst: e,
                  continue: !t.abort,
                })),
            t.normalize ? (n.value = s.href) : (n.value = o));
          return;
        } catch {
          n.issues.push({
            code: "invalid_format",
            format: "url",
            input: n.value,
            inst: e,
            continue: !t.abort,
          });
        }
      }));
  }),
  $r = f("$ZodEmoji", (e, t) => {
    (t.pattern ?? (t.pattern = Mn()), z.init(e, t));
  }),
  kr = f("$ZodNanoID", (e, t) => {
    (t.pattern ?? (t.pattern = Dn), z.init(e, t));
  }),
  Sr = f("$ZodCUID", (e, t) => {
    (t.pattern ?? (t.pattern = jn), z.init(e, t));
  }),
  Zr = f("$ZodCUID2", (e, t) => {
    (t.pattern ?? (t.pattern = An), z.init(e, t));
  }),
  Er = f("$ZodULID", (e, t) => {
    (t.pattern ?? (t.pattern = xn), z.init(e, t));
  }),
  Or = f("$ZodXID", (e, t) => {
    (t.pattern ?? (t.pattern = Cn), z.init(e, t));
  }),
  Tr = f("$ZodKSUID", (e, t) => {
    (t.pattern ?? (t.pattern = Rn), z.init(e, t));
  }),
  Pr = f("$ZodISODateTime", (e, t) => {
    (t.pattern ?? (t.pattern = Qn(t)), z.init(e, t));
  }),
  Ir = f("$ZodISODate", (e, t) => {
    (t.pattern ?? (t.pattern = Xn), z.init(e, t));
  }),
  Nr = f("$ZodISOTime", (e, t) => {
    (t.pattern ?? (t.pattern = Hn(t)), z.init(e, t));
  }),
  jr = f("$ZodISODuration", (e, t) => {
    (t.pattern ?? (t.pattern = Un), z.init(e, t));
  }),
  Ar = f("$ZodIPv4", (e, t) => {
    (t.pattern ?? (t.pattern = Vn), z.init(e, t), (e._zod.bag.format = "ipv4"));
  }),
  xr = f("$ZodIPv6", (e, t) => {
    (t.pattern ?? (t.pattern = Wn),
      z.init(e, t),
      (e._zod.bag.format = "ipv6"),
      (e._zod.check = (n) => {
        try {
          new URL(`http://[${n.value}]`);
        } catch {
          n.issues.push({
            code: "invalid_format",
            format: "ipv6",
            input: n.value,
            inst: e,
            continue: !t.abort,
          });
        }
      }));
  }),
  Cr = f("$ZodCIDRv4", (e, t) => {
    (t.pattern ?? (t.pattern = Bn), z.init(e, t));
  }),
  Rr = f("$ZodCIDRv6", (e, t) => {
    (t.pattern ?? (t.pattern = Gn),
      z.init(e, t),
      (e._zod.check = (n) => {
        const r = n.value.split("/");
        try {
          if (r.length !== 2) throw new Error();
          const [o, s] = r;
          if (!s) throw new Error();
          const i = Number(s);
          if (`${i}` !== s) throw new Error();
          if (i < 0 || i > 128) throw new Error();
          new URL(`http://[${o}]`);
        } catch {
          n.issues.push({
            code: "invalid_format",
            format: "cidrv6",
            input: n.value,
            inst: e,
            continue: !t.abort,
          });
        }
      }));
  });
function St(e) {
  if (e === "") return !0;
  if (/\s/.test(e) || e.length % 4 !== 0) return !1;
  try {
    return (atob(e), !0);
  } catch {
    return !1;
  }
}
const Dr = f("$ZodBase64", (e, t) => {
  (t.pattern ?? (t.pattern = Kn),
    z.init(e, t),
    (e._zod.bag.contentEncoding = "base64"),
    (e._zod.check = (n) => {
      St(n.value) ||
        n.issues.push({
          code: "invalid_format",
          format: "base64",
          input: n.value,
          inst: e,
          continue: !t.abort,
        });
    }));
});
function Ur(e) {
  if (!vt.test(e)) return !1;
  const t = e.replace(/[-_]/g, (r) => (r === "-" ? "+" : "/")),
    n = t.padEnd(Math.ceil(t.length / 4) * 4, "=");
  return St(n);
}
const Fr = f("$ZodBase64URL", (e, t) => {
    (t.pattern ?? (t.pattern = vt),
      z.init(e, t),
      (e._zod.bag.contentEncoding = "base64url"),
      (e._zod.check = (n) => {
        Ur(n.value) ||
          n.issues.push({
            code: "invalid_format",
            format: "base64url",
            input: n.value,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  Lr = f("$ZodE164", (e, t) => {
    (t.pattern ?? (t.pattern = Yn), z.init(e, t));
  });
function Jr(e, t = null) {
  try {
    const n = e.split(".");
    if (n.length !== 3) return !1;
    const [r] = n;
    if (!r) return !1;
    const o = JSON.parse(atob(r));
    return !(
      ("typ" in o && (o == null ? void 0 : o.typ) !== "JWT") ||
      !o.alg ||
      (t && (!("alg" in o) || o.alg !== t))
    );
  } catch {
    return !1;
  }
}
const Mr = f("$ZodJWT", (e, t) => {
    (z.init(e, t),
      (e._zod.check = (n) => {
        Jr(n.value, t.alg) ||
          n.issues.push({
            code: "invalid_format",
            format: "jwt",
            input: n.value,
            inst: e,
            continue: !t.abort,
          });
      }));
  }),
  Zt = f("$ZodNumber", (e, t) => {
    ($.init(e, t),
      (e._zod.pattern = e._zod.bag.pattern ?? bt),
      (e._zod.parse = (n, r) => {
        if (t.coerce)
          try {
            n.value = Number(n.value);
          } catch {}
        const o = n.value;
        if (typeof o == "number" && !Number.isNaN(o) && Number.isFinite(o)) return n;
        const s =
          typeof o == "number"
            ? Number.isNaN(o)
              ? "NaN"
              : Number.isFinite(o)
                ? void 0
                : "Infinity"
            : void 0;
        return (
          n.issues.push({
            expected: "number",
            code: "invalid_type",
            input: o,
            inst: e,
            ...(s ? { received: s } : {}),
          }),
          n
        );
      }));
  }),
  Vr = f("$ZodNumberFormat", (e, t) => {
    (ir.init(e, t), Zt.init(e, t));
  }),
  Wr = f("$ZodBoolean", (e, t) => {
    ($.init(e, t),
      (e._zod.pattern = nr),
      (e._zod.parse = (n, r) => {
        if (t.coerce)
          try {
            n.value = !!n.value;
          } catch {}
        const o = n.value;
        return (
          typeof o == "boolean" ||
            n.issues.push({ expected: "boolean", code: "invalid_type", input: o, inst: e }),
          n
        );
      }));
  }),
  Br = f("$ZodUnknown", (e, t) => {
    ($.init(e, t), (e._zod.parse = (n) => n));
  }),
  Gr = f("$ZodNever", (e, t) => {
    ($.init(e, t),
      (e._zod.parse = (n, r) => (
        n.issues.push({ expected: "never", code: "invalid_type", input: n.value, inst: e }),
        n
      )));
  });
function Je(e, t, n) {
  (e.issues.length && t.issues.push(...X(n, e.issues)), (t.value[n] = e.value));
}
const Kr = f("$ZodArray", (e, t) => {
  ($.init(e, t),
    (e._zod.parse = (n, r) => {
      const o = n.value;
      if (!Array.isArray(o))
        return (n.issues.push({ expected: "array", code: "invalid_type", input: o, inst: e }), n);
      n.value = Array(o.length);
      const s = [];
      for (let i = 0; i < o.length; i++) {
        const u = o[i],
          c = t.element._zod.run({ value: u, issues: [] }, r);
        c instanceof Promise ? s.push(c.then((a) => Je(a, n, i))) : Je(c, n, i);
      }
      return s.length ? Promise.all(s).then(() => n) : n;
    }));
});
function le(e, t, n, r, o, s) {
  const i = n in r;
  if (e.issues.length) {
    if (o && s && !i) return;
    t.issues.push(...X(n, e.issues));
  }
  if (!i && !o) {
    e.issues.length ||
      t.issues.push({ code: "invalid_type", expected: "nonoptional", input: void 0, path: [n] });
    return;
  }
  e.value === void 0 ? i && (t.value[n] = void 0) : (t.value[n] = e.value);
}
function Et(e) {
  var r, o, s, i;
  const t = Object.keys(e.shape);
  for (const u of t)
    if (
      !(
        (i =
          (s = (o = (r = e.shape) == null ? void 0 : r[u]) == null ? void 0 : o._zod) == null
            ? void 0
            : s.traits) != null && i.has("$ZodType")
      )
    )
      throw new Error(`Invalid element at key "${u}": expected a Zod schema`);
  const n = fn(e.shape);
  return { ...e, keys: t, keySet: new Set(t), numKeys: t.length, optionalKeys: new Set(n) };
}
function Ot(e, t, n, r, o, s) {
  const i = [],
    u = o.keySet,
    c = o.catchall._zod,
    a = c.def.type,
    l = c.optin === "optional",
    d = c.optout === "optional";
  for (const h in t) {
    if (h === "__proto__" || u.has(h)) continue;
    if (a === "never") {
      i.push(h);
      continue;
    }
    const p = c.run({ value: t[h], issues: [] }, r);
    p instanceof Promise ? e.push(p.then((v) => le(v, n, h, t, l, d))) : le(p, n, h, t, l, d);
  }
  return (
    i.length && n.issues.push({ code: "unrecognized_keys", keys: i, input: t, inst: s }),
    e.length ? Promise.all(e).then(() => n) : n
  );
}
const qr = f("$ZodObject", (e, t) => {
    $.init(e, t);
    const n = Object.getOwnPropertyDescriptor(t, "shape");
    if (!(n != null && n.get)) {
      const u = t.shape;
      Object.defineProperty(t, "shape", {
        get: () => {
          const c = { ...u };
          return (Object.defineProperty(t, "shape", { value: c }), c);
        },
      });
    }
    const r = Ze(() => Et(t));
    y(e._zod, "propValues", () => {
      const u = t.shape,
        c = {};
      for (const a in u) {
        const l = u[a]._zod;
        if (l.values) {
          c[a] ?? (c[a] = new Set());
          for (const d of l.values) c[a].add(d);
        }
      }
      return c;
    });
    const o = ae,
      s = t.catchall;
    let i;
    e._zod.parse = (u, c) => {
      i ?? (i = r.value);
      const a = u.value;
      if (!o(a))
        return (u.issues.push({ expected: "object", code: "invalid_type", input: a, inst: e }), u);
      u.value = {};
      const l = [],
        d = i.shape;
      for (const h of i.keys) {
        const p = d[h],
          v = p._zod.optin === "optional",
          b = p._zod.optout === "optional",
          j = p._zod.run({ value: a[h], issues: [] }, c);
        j instanceof Promise ? l.push(j.then((Z) => le(Z, u, h, a, v, b))) : le(j, u, h, a, v, b);
      }
      return s ? Ot(l, a, u, c, r.value, e) : l.length ? Promise.all(l).then(() => u) : u;
    };
  }),
  Yr = f("$ZodObjectJIT", (e, t) => {
    qr.init(e, t);
    const n = e._zod.parse,
      r = Ze(() => Et(t)),
      o = (h) => {
        var x, E;
        const p = new _r(["shape", "payload", "ctx"]),
          v = r.value,
          b = (N) => {
            const O = Fe(N);
            return `shape[${O}]._zod.run({ value: input[${O}], issues: [] }, ctx)`;
          };
        p.write("const input = payload.value;");
        const j = Object.create(null);
        let Z = 0;
        for (const N of v.keys) j[N] = `key_${Z++}`;
        p.write("const newResult = {};");
        for (const N of v.keys) {
          const O = j[N],
            A = Fe(N),
            q = h[N],
            Ce = ((x = q == null ? void 0 : q._zod) == null ? void 0 : x.optin) === "optional",
            Yt = ((E = q == null ? void 0 : q._zod) == null ? void 0 : E.optout) === "optional";
          (p.write(`const ${O} = ${b(N)};`),
            Ce && Yt
              ? p.write(`
        if (${O}.issues.length) {
          if (${A} in input) {
            payload.issues = payload.issues.concat(${O}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${A}, ...iss.path] : [${A}]
            })));
          }
        }
        
        if (${O}.value === undefined) {
          if (${A} in input) {
            newResult[${A}] = undefined;
          }
        } else {
          newResult[${A}] = ${O}.value;
        }
        
      `)
              : Ce
                ? p.write(`
        if (${O}.issues.length) {
          payload.issues = payload.issues.concat(${O}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${A}, ...iss.path] : [${A}]
          })));
        }
        
        if (${O}.value === undefined) {
          if (${A} in input) {
            newResult[${A}] = undefined;
          }
        } else {
          newResult[${A}] = ${O}.value;
        }
        
      `)
                : p.write(`
        const ${O}_present = ${A} in input;
        if (${O}.issues.length) {
          payload.issues = payload.issues.concat(${O}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${A}, ...iss.path] : [${A}]
          })));
        }
        if (!${O}_present && !${O}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${A}]
          });
        }

        if (${O}_present) {
          if (${O}.value === undefined) {
            newResult[${A}] = undefined;
          } else {
            newResult[${A}] = ${O}.value;
          }
        }

      `));
        }
        (p.write("payload.value = newResult;"), p.write("return payload;"));
        const _ = p.compile();
        return (N, O) => _(h, N, O);
      };
    let s;
    const i = ae,
      u = !Se.jitless,
      a = u && an.value,
      l = t.catchall;
    let d;
    e._zod.parse = (h, p) => {
      d ?? (d = r.value);
      const v = h.value;
      return i(v)
        ? u && a && (p == null ? void 0 : p.async) === !1 && p.jitless !== !0
          ? (s || (s = o(t.shape)), (h = s(h, p)), l ? Ot([], v, h, p, d, e) : h)
          : n(h, p)
        : (h.issues.push({ expected: "object", code: "invalid_type", input: v, inst: e }), h);
    };
  });
function Me(e, t, n, r) {
  for (const s of e) if (s.issues.length === 0) return ((t.value = s.value), t);
  const o = e.filter((s) => !Y(s));
  return o.length === 1
    ? ((t.value = o[0].value), o[0])
    : (t.issues.push({
        code: "invalid_union",
        input: t.value,
        inst: n,
        errors: e.map((s) => s.issues.map((i) => V(i, r, M()))),
      }),
      t);
}
const Xr = f("$ZodUnion", (e, t) => {
    ($.init(e, t),
      y(e._zod, "optin", () =>
        t.options.some((r) => r._zod.optin === "optional") ? "optional" : void 0,
      ),
      y(e._zod, "optout", () =>
        t.options.some((r) => r._zod.optout === "optional") ? "optional" : void 0,
      ),
      y(e._zod, "values", () => {
        if (t.options.every((r) => r._zod.values))
          return new Set(t.options.flatMap((r) => Array.from(r._zod.values)));
      }),
      y(e._zod, "pattern", () => {
        if (t.options.every((r) => r._zod.pattern)) {
          const r = t.options.map((o) => o._zod.pattern);
          return new RegExp(`^(${r.map((o) => Oe(o.source)).join("|")})$`);
        }
      }));
    const n = t.options.length === 1 ? t.options[0]._zod.run : null;
    e._zod.parse = (r, o) => {
      if (n) return n(r, o);
      let s = !1;
      const i = [];
      for (const u of t.options) {
        const c = u._zod.run({ value: r.value, issues: [] }, o);
        if (c instanceof Promise) (i.push(c), (s = !0));
        else {
          if (c.issues.length === 0) return c;
          i.push(c);
        }
      }
      return s ? Promise.all(i).then((u) => Me(u, r, e, o)) : Me(i, r, e, o);
    };
  }),
  Hr = f("$ZodIntersection", (e, t) => {
    ($.init(e, t),
      (e._zod.parse = (n, r) => {
        const o = n.value,
          s = t.left._zod.run({ value: o, issues: [] }, r),
          i = t.right._zod.run({ value: o, issues: [] }, r);
        return s instanceof Promise || i instanceof Promise
          ? Promise.all([s, i]).then(([c, a]) => Ve(n, c, a))
          : Ve(n, s, i);
      }));
  });
function ze(e, t) {
  if (e === t) return { valid: !0, data: e };
  if (e instanceof Date && t instanceof Date && +e == +t) return { valid: !0, data: e };
  if (Q(e) && Q(t)) {
    const n = Object.keys(t),
      r = Object.keys(e).filter((s) => n.indexOf(s) !== -1),
      o = { ...e, ...t };
    for (const s of r) {
      const i = ze(e[s], t[s]);
      if (!i.valid) return { valid: !1, mergeErrorPath: [s, ...i.mergeErrorPath] };
      o[s] = i.data;
    }
    return { valid: !0, data: o };
  }
  if (Array.isArray(e) && Array.isArray(t)) {
    if (e.length !== t.length) return { valid: !1, mergeErrorPath: [] };
    const n = [];
    for (let r = 0; r < e.length; r++) {
      const o = e[r],
        s = t[r],
        i = ze(o, s);
      if (!i.valid) return { valid: !1, mergeErrorPath: [r, ...i.mergeErrorPath] };
      n.push(i.data);
    }
    return { valid: !0, data: n };
  }
  return { valid: !1, mergeErrorPath: [] };
}
function Ve(e, t, n) {
  const r = new Map();
  let o;
  for (const u of t.issues)
    if (u.code === "unrecognized_keys") {
      o ?? (o = u);
      for (const c of u.keys) (r.has(c) || r.set(c, {}), (r.get(c).l = !0));
    } else e.issues.push(u);
  for (const u of n.issues)
    if (u.code === "unrecognized_keys")
      for (const c of u.keys) (r.has(c) || r.set(c, {}), (r.get(c).r = !0));
    else e.issues.push(u);
  const s = [...r].filter(([, u]) => u.l && u.r).map(([u]) => u);
  if ((s.length && o && e.issues.push({ ...o, keys: s }), Y(e))) return e;
  const i = ze(t.value, n.value);
  if (!i.valid)
    throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(i.mergeErrorPath)}`);
  return ((e.value = i.data), e);
}
const Qr = f("$ZodRecord", (e, t) => {
    ($.init(e, t),
      (e._zod.parse = (n, r) => {
        const o = n.value;
        if (!Q(o))
          return (
            n.issues.push({ expected: "record", code: "invalid_type", input: o, inst: e }),
            n
          );
        const s = [],
          i = t.keyType._zod.values;
        if (i) {
          n.value = {};
          const u = new Set();
          for (const a of i)
            if (typeof a == "string" || typeof a == "number" || typeof a == "symbol") {
              u.add(typeof a == "number" ? a.toString() : a);
              const l = t.keyType._zod.run({ value: a, issues: [] }, r);
              if (l instanceof Promise)
                throw new Error("Async schemas not supported in object keys currently");
              if (l.issues.length) {
                n.issues.push({
                  code: "invalid_key",
                  origin: "record",
                  issues: l.issues.map((p) => V(p, r, M())),
                  input: a,
                  path: [a],
                  inst: e,
                });
                continue;
              }
              const d = l.value,
                h = t.valueType._zod.run({ value: o[a], issues: [] }, r);
              h instanceof Promise
                ? s.push(
                    h.then((p) => {
                      (p.issues.length && n.issues.push(...X(a, p.issues)), (n.value[d] = p.value));
                    }),
                  )
                : (h.issues.length && n.issues.push(...X(a, h.issues)), (n.value[d] = h.value));
            }
          let c;
          for (const a in o) u.has(a) || ((c = c ?? []), c.push(a));
          c &&
            c.length > 0 &&
            n.issues.push({ code: "unrecognized_keys", input: o, inst: e, keys: c });
        } else {
          n.value = {};
          for (const u of Reflect.ownKeys(o)) {
            if (u === "__proto__" || !Object.prototype.propertyIsEnumerable.call(o, u)) continue;
            let c = t.keyType._zod.run({ value: u, issues: [] }, r);
            if (c instanceof Promise)
              throw new Error("Async schemas not supported in object keys currently");
            if (typeof u == "string" && bt.test(u) && c.issues.length) {
              const d = t.keyType._zod.run({ value: Number(u), issues: [] }, r);
              if (d instanceof Promise)
                throw new Error("Async schemas not supported in object keys currently");
              d.issues.length === 0 && (c = d);
            }
            if (c.issues.length) {
              t.mode === "loose"
                ? (n.value[u] = o[u])
                : n.issues.push({
                    code: "invalid_key",
                    origin: "record",
                    issues: c.issues.map((d) => V(d, r, M())),
                    input: u,
                    path: [u],
                    inst: e,
                  });
              continue;
            }
            const l = t.valueType._zod.run({ value: o[u], issues: [] }, r);
            l instanceof Promise
              ? s.push(
                  l.then((d) => {
                    (d.issues.length && n.issues.push(...X(u, d.issues)),
                      (n.value[c.value] = d.value));
                  }),
                )
              : (l.issues.length && n.issues.push(...X(u, l.issues)), (n.value[c.value] = l.value));
          }
        }
        return s.length ? Promise.all(s).then(() => n) : n;
      }));
  }),
  eo = f("$ZodEnum", (e, t) => {
    $.init(e, t);
    const n = dt(t.entries),
      r = new Set(n);
    ((e._zod.values = r),
      (e._zod.pattern = new RegExp(
        `^(${n
          .filter((o) => ln.has(typeof o))
          .map((o) => (typeof o == "string" ? ee(o) : o.toString()))
          .join("|")})$`,
      )),
      (e._zod.parse = (o, s) => {
        const i = o.value;
        return (
          r.has(i) || o.issues.push({ code: "invalid_value", values: n, input: i, inst: e }),
          o
        );
      }));
  }),
  to = f("$ZodLiteral", (e, t) => {
    if (($.init(e, t), t.values.length === 0))
      throw new Error("Cannot create literal schema with no valid values");
    const n = new Set(t.values);
    ((e._zod.values = n),
      (e._zod.pattern = new RegExp(
        `^(${t.values.map((r) => (typeof r == "string" ? ee(r) : r ? ee(r.toString()) : String(r))).join("|")})$`,
      )),
      (e._zod.parse = (r, o) => {
        const s = r.value;
        return (
          n.has(s) || r.issues.push({ code: "invalid_value", values: t.values, input: s, inst: e }),
          r
        );
      }));
  }),
  no = f("$ZodTransform", (e, t) => {
    ($.init(e, t),
      (e._zod.optin = "optional"),
      (e._zod.parse = (n, r) => {
        if (r.direction === "backward") throw new ft(e.constructor.name);
        const o = t.transform(n.value, n);
        if (r.async)
          return (o instanceof Promise ? o : Promise.resolve(o)).then(
            (i) => ((n.value = i), (n.fallback = !0), n),
          );
        if (o instanceof Promise) throw new H();
        return ((n.value = o), (n.fallback = !0), n);
      }));
  });
function We(e, t) {
  return t === void 0 && (e.issues.length || e.fallback) ? { issues: [], value: void 0 } : e;
}
const Tt = f("$ZodOptional", (e, t) => {
    ($.init(e, t),
      (e._zod.optin = "optional"),
      (e._zod.optout = "optional"),
      y(e._zod, "values", () =>
        t.innerType._zod.values ? new Set([...t.innerType._zod.values, void 0]) : void 0,
      ),
      y(e._zod, "pattern", () => {
        const n = t.innerType._zod.pattern;
        return n ? new RegExp(`^(${Oe(n.source)})?$`) : void 0;
      }),
      (e._zod.parse = (n, r) => {
        if (t.innerType._zod.optin === "optional") {
          const o = n.value,
            s = t.innerType._zod.run(n, r);
          return s instanceof Promise ? s.then((i) => We(i, o)) : We(s, o);
        }
        return n.value === void 0 ? n : t.innerType._zod.run(n, r);
      }));
  }),
  ro = f("$ZodExactOptional", (e, t) => {
    (Tt.init(e, t),
      y(e._zod, "values", () => t.innerType._zod.values),
      y(e._zod, "pattern", () => t.innerType._zod.pattern),
      (e._zod.parse = (n, r) => t.innerType._zod.run(n, r)));
  }),
  oo = f("$ZodNullable", (e, t) => {
    ($.init(e, t),
      y(e._zod, "optin", () => t.innerType._zod.optin),
      y(e._zod, "optout", () => t.innerType._zod.optout),
      y(e._zod, "pattern", () => {
        const n = t.innerType._zod.pattern;
        return n ? new RegExp(`^(${Oe(n.source)}|null)$`) : void 0;
      }),
      y(e._zod, "values", () =>
        t.innerType._zod.values ? new Set([...t.innerType._zod.values, null]) : void 0,
      ),
      (e._zod.parse = (n, r) => (n.value === null ? n : t.innerType._zod.run(n, r))));
  }),
  so = f("$ZodDefault", (e, t) => {
    ($.init(e, t),
      (e._zod.optin = "optional"),
      y(e._zod, "values", () => t.innerType._zod.values),
      (e._zod.parse = (n, r) => {
        if (r.direction === "backward") return t.innerType._zod.run(n, r);
        if (n.value === void 0) return ((n.value = t.defaultValue), n);
        const o = t.innerType._zod.run(n, r);
        return o instanceof Promise ? o.then((s) => Be(s, t)) : Be(o, t);
      }));
  });
function Be(e, t) {
  return (e.value === void 0 && (e.value = t.defaultValue), e);
}
const io = f("$ZodPrefault", (e, t) => {
    ($.init(e, t),
      (e._zod.optin = "optional"),
      y(e._zod, "values", () => t.innerType._zod.values),
      (e._zod.parse = (n, r) => (
        r.direction === "backward" || (n.value === void 0 && (n.value = t.defaultValue)),
        t.innerType._zod.run(n, r)
      )));
  }),
  uo = f("$ZodNonOptional", (e, t) => {
    ($.init(e, t),
      y(e._zod, "values", () => {
        const n = t.innerType._zod.values;
        return n ? new Set([...n].filter((r) => r !== void 0)) : void 0;
      }),
      (e._zod.parse = (n, r) => {
        const o = t.innerType._zod.run(n, r);
        return o instanceof Promise ? o.then((s) => Ge(s, e)) : Ge(o, e);
      }));
  });
function Ge(e, t) {
  return (
    !e.issues.length &&
      e.value === void 0 &&
      e.issues.push({ code: "invalid_type", expected: "nonoptional", input: e.value, inst: t }),
    e
  );
}
const co = f("$ZodCatch", (e, t) => {
    ($.init(e, t),
      (e._zod.optin = "optional"),
      y(e._zod, "optout", () => t.innerType._zod.optout),
      y(e._zod, "values", () => t.innerType._zod.values),
      (e._zod.parse = (n, r) => {
        if (r.direction === "backward") return t.innerType._zod.run(n, r);
        const o = t.innerType._zod.run(n, r);
        return o instanceof Promise
          ? o.then(
              (s) => (
                (n.value = s.value),
                s.issues.length &&
                  ((n.value = t.catchValue({
                    ...n,
                    error: { issues: s.issues.map((i) => V(i, r, M())) },
                    input: n.value,
                  })),
                  (n.issues = []),
                  (n.fallback = !0)),
                n
              ),
            )
          : ((n.value = o.value),
            o.issues.length &&
              ((n.value = t.catchValue({
                ...n,
                error: { issues: o.issues.map((s) => V(s, r, M())) },
                input: n.value,
              })),
              (n.issues = []),
              (n.fallback = !0)),
            n);
      }));
  }),
  ao = f("$ZodPipe", (e, t) => {
    ($.init(e, t),
      y(e._zod, "values", () => t.in._zod.values),
      y(e._zod, "optin", () => t.in._zod.optin),
      y(e._zod, "optout", () => t.out._zod.optout),
      y(e._zod, "propValues", () => t.in._zod.propValues),
      (e._zod.parse = (n, r) => {
        if (r.direction === "backward") {
          const s = t.out._zod.run(n, r);
          return s instanceof Promise ? s.then((i) => ie(i, t.in, r)) : ie(s, t.in, r);
        }
        const o = t.in._zod.run(n, r);
        return o instanceof Promise ? o.then((s) => ie(s, t.out, r)) : ie(o, t.out, r);
      }));
  });
function ie(e, t, n) {
  return e.issues.length
    ? ((e.aborted = !0), e)
    : t._zod.run({ value: e.value, issues: e.issues, fallback: e.fallback }, n);
}
const lo = f("$ZodReadonly", (e, t) => {
  ($.init(e, t),
    y(e._zod, "propValues", () => t.innerType._zod.propValues),
    y(e._zod, "values", () => t.innerType._zod.values),
    y(e._zod, "optin", () => {
      var n, r;
      return (r = (n = t.innerType) == null ? void 0 : n._zod) == null ? void 0 : r.optin;
    }),
    y(e._zod, "optout", () => {
      var n, r;
      return (r = (n = t.innerType) == null ? void 0 : n._zod) == null ? void 0 : r.optout;
    }),
    (e._zod.parse = (n, r) => {
      if (r.direction === "backward") return t.innerType._zod.run(n, r);
      const o = t.innerType._zod.run(n, r);
      return o instanceof Promise ? o.then(Ke) : Ke(o);
    }));
});
function Ke(e) {
  return ((e.value = Object.freeze(e.value)), e);
}
const fo = f("$ZodCustom", (e, t) => {
  (D.init(e, t),
    $.init(e, t),
    (e._zod.parse = (n, r) => n),
    (e._zod.check = (n) => {
      const r = n.value,
        o = t.fn(r);
      if (o instanceof Promise) return o.then((s) => qe(s, n, r, e));
      qe(o, n, r, e);
    }));
});
function qe(e, t, n, r) {
  if (!e) {
    const o = {
      code: "custom",
      input: n,
      inst: r,
      path: [...(r._zod.def.path ?? [])],
      continue: !r._zod.def.abort,
    };
    (r._zod.def.params && (o.params = r._zod.def.params), t.issues.push(re(o)));
  }
}
var Ye;
class ho {
  constructor() {
    ((this._map = new WeakMap()), (this._idmap = new Map()));
  }
  add(t, ...n) {
    const r = n[0];
    return (
      this._map.set(t, r),
      r && typeof r == "object" && "id" in r && this._idmap.set(r.id, t),
      this
    );
  }
  clear() {
    return ((this._map = new WeakMap()), (this._idmap = new Map()), this);
  }
  remove(t) {
    const n = this._map.get(t);
    return (
      n && typeof n == "object" && "id" in n && this._idmap.delete(n.id),
      this._map.delete(t),
      this
    );
  }
  get(t) {
    const n = t._zod.parent;
    if (n) {
      const r = { ...(this.get(n) ?? {}) };
      delete r.id;
      const o = { ...r, ...this._map.get(t) };
      return Object.keys(o).length ? o : void 0;
    }
    return this._map.get(t);
  }
  has(t) {
    return this._map.has(t);
  }
}
function po() {
  return new ho();
}
(Ye = globalThis).__zod_globalRegistry ?? (Ye.__zod_globalRegistry = po());
const ne = globalThis.__zod_globalRegistry;
function mo(e, t) {
  return new e({ type: "string", ...m(t) });
}
function go(e, t) {
  return new e({ type: "string", format: "email", check: "string_format", abort: !1, ...m(t) });
}
function Xe(e, t) {
  return new e({ type: "string", format: "guid", check: "string_format", abort: !1, ...m(t) });
}
function _o(e, t) {
  return new e({ type: "string", format: "uuid", check: "string_format", abort: !1, ...m(t) });
}
function vo(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v4",
    ...m(t),
  });
}
function yo(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v6",
    ...m(t),
  });
}
function wo(e, t) {
  return new e({
    type: "string",
    format: "uuid",
    check: "string_format",
    abort: !1,
    version: "v7",
    ...m(t),
  });
}
function bo(e, t) {
  return new e({ type: "string", format: "url", check: "string_format", abort: !1, ...m(t) });
}
function zo(e, t) {
  return new e({ type: "string", format: "emoji", check: "string_format", abort: !1, ...m(t) });
}
function $o(e, t) {
  return new e({ type: "string", format: "nanoid", check: "string_format", abort: !1, ...m(t) });
}
function ko(e, t) {
  return new e({ type: "string", format: "cuid", check: "string_format", abort: !1, ...m(t) });
}
function So(e, t) {
  return new e({ type: "string", format: "cuid2", check: "string_format", abort: !1, ...m(t) });
}
function Zo(e, t) {
  return new e({ type: "string", format: "ulid", check: "string_format", abort: !1, ...m(t) });
}
function Eo(e, t) {
  return new e({ type: "string", format: "xid", check: "string_format", abort: !1, ...m(t) });
}
function Oo(e, t) {
  return new e({ type: "string", format: "ksuid", check: "string_format", abort: !1, ...m(t) });
}
function To(e, t) {
  return new e({ type: "string", format: "ipv4", check: "string_format", abort: !1, ...m(t) });
}
function Po(e, t) {
  return new e({ type: "string", format: "ipv6", check: "string_format", abort: !1, ...m(t) });
}
function Io(e, t) {
  return new e({ type: "string", format: "cidrv4", check: "string_format", abort: !1, ...m(t) });
}
function No(e, t) {
  return new e({ type: "string", format: "cidrv6", check: "string_format", abort: !1, ...m(t) });
}
function jo(e, t) {
  return new e({ type: "string", format: "base64", check: "string_format", abort: !1, ...m(t) });
}
function Ao(e, t) {
  return new e({ type: "string", format: "base64url", check: "string_format", abort: !1, ...m(t) });
}
function xo(e, t) {
  return new e({ type: "string", format: "e164", check: "string_format", abort: !1, ...m(t) });
}
function Co(e, t) {
  return new e({ type: "string", format: "jwt", check: "string_format", abort: !1, ...m(t) });
}
function Ro(e, t) {
  return new e({
    type: "string",
    format: "datetime",
    check: "string_format",
    offset: !1,
    local: !1,
    precision: null,
    ...m(t),
  });
}
function Do(e, t) {
  return new e({ type: "string", format: "date", check: "string_format", ...m(t) });
}
function Uo(e, t) {
  return new e({
    type: "string",
    format: "time",
    check: "string_format",
    precision: null,
    ...m(t),
  });
}
function Fo(e, t) {
  return new e({ type: "string", format: "duration", check: "string_format", ...m(t) });
}
function Lo(e, t) {
  return new e({ type: "number", checks: [], ...m(t) });
}
function Jo(e, t) {
  return new e({ type: "number", check: "number_format", abort: !1, format: "safeint", ...m(t) });
}
function Mo(e, t) {
  return new e({ type: "boolean", ...m(t) });
}
function Vo(e) {
  return new e({ type: "unknown" });
}
function Wo(e, t) {
  return new e({ type: "never", ...m(t) });
}
function He(e, t) {
  return new $t({ check: "less_than", ...m(t), value: e, inclusive: !1 });
}
function ye(e, t) {
  return new $t({ check: "less_than", ...m(t), value: e, inclusive: !0 });
}
function Qe(e, t) {
  return new kt({ check: "greater_than", ...m(t), value: e, inclusive: !1 });
}
function we(e, t) {
  return new kt({ check: "greater_than", ...m(t), value: e, inclusive: !0 });
}
function et(e, t) {
  return new sr({ check: "multiple_of", ...m(t), value: e });
}
function Pt(e, t) {
  return new ur({ check: "max_length", ...m(t), maximum: e });
}
function fe(e, t) {
  return new cr({ check: "min_length", ...m(t), minimum: e });
}
function It(e, t) {
  return new ar({ check: "length_equals", ...m(t), length: e });
}
function Bo(e, t) {
  return new lr({ check: "string_format", format: "regex", ...m(t), pattern: e });
}
function Go(e) {
  return new fr({ check: "string_format", format: "lowercase", ...m(e) });
}
function Ko(e) {
  return new dr({ check: "string_format", format: "uppercase", ...m(e) });
}
function qo(e, t) {
  return new hr({ check: "string_format", format: "includes", ...m(t), includes: e });
}
function Yo(e, t) {
  return new pr({ check: "string_format", format: "starts_with", ...m(t), prefix: e });
}
function Xo(e, t) {
  return new mr({ check: "string_format", format: "ends_with", ...m(t), suffix: e });
}
function te(e) {
  return new gr({ check: "overwrite", tx: e });
}
function Ho(e) {
  return te((t) => t.normalize(e));
}
function Qo() {
  return te((e) => e.trim());
}
function es() {
  return te((e) => e.toLowerCase());
}
function ts() {
  return te((e) => e.toUpperCase());
}
function ns() {
  return te((e) => cn(e));
}
function rs(e, t, n) {
  return new e({ type: "array", element: t, ...m(n) });
}
function os(e, t, n) {
  return new e({ type: "custom", check: "custom", fn: t, ...m(n) });
}
function ss(e, t) {
  const n = is(
    (r) => (
      (r.addIssue = (o) => {
        if (typeof o == "string") r.issues.push(re(o, r.value, n._zod.def));
        else {
          const s = o;
          (s.fatal && (s.continue = !1),
            s.code ?? (s.code = "custom"),
            s.input ?? (s.input = r.value),
            s.inst ?? (s.inst = n),
            s.continue ?? (s.continue = !n._zod.def.abort),
            r.issues.push(re(s)));
        }
      }),
      e(r.value, r)
    ),
    t,
  );
  return n;
}
function is(e, t) {
  const n = new D({ check: "custom", ...m(t) });
  return ((n._zod.check = e), n);
}
function Nt(e) {
  let t = (e == null ? void 0 : e.target) ?? "draft-2020-12";
  return (
    t === "draft-4" && (t = "draft-04"),
    t === "draft-7" && (t = "draft-07"),
    {
      processors: e.processors ?? {},
      metadataRegistry: (e == null ? void 0 : e.metadata) ?? ne,
      target: t,
      unrepresentable: (e == null ? void 0 : e.unrepresentable) ?? "throw",
      override: (e == null ? void 0 : e.override) ?? (() => {}),
      io: (e == null ? void 0 : e.io) ?? "output",
      counter: 0,
      seen: new Map(),
      cycles: (e == null ? void 0 : e.cycles) ?? "ref",
      reused: (e == null ? void 0 : e.reused) ?? "inline",
      external: (e == null ? void 0 : e.external) ?? void 0,
    }
  );
}
function P(e, t, n = { path: [], schemaPath: [] }) {
  var l, d;
  var r;
  const o = e._zod.def,
    s = t.seen.get(e);
  if (s) return (s.count++, n.schemaPath.includes(e) && (s.cycle = n.path), s.schema);
  const i = { schema: {}, count: 1, cycle: void 0, path: n.path };
  t.seen.set(e, i);
  const u = (d = (l = e._zod).toJSONSchema) == null ? void 0 : d.call(l);
  if (u) i.schema = u;
  else {
    const h = { ...n, schemaPath: [...n.schemaPath, e], path: n.path };
    if (e._zod.processJSONSchema) e._zod.processJSONSchema(t, i.schema, h);
    else {
      const v = i.schema,
        b = t.processors[o.type];
      if (!b) throw new Error(`[toJSONSchema]: Non-representable type encountered: ${o.type}`);
      b(e, t, v, h);
    }
    const p = e._zod.parent;
    p && (i.ref || (i.ref = p), P(p, t, h), (t.seen.get(p).isParent = !0));
  }
  const c = t.metadataRegistry.get(e);
  return (
    c && Object.assign(i.schema, c),
    t.io === "input" && C(e) && (delete i.schema.examples, delete i.schema.default),
    t.io === "input" &&
      "_prefault" in i.schema &&
      ((r = i.schema).default ?? (r.default = i.schema._prefault)),
    delete i.schema._prefault,
    t.seen.get(e).schema
  );
}
function jt(e, t) {
  var i, u, c, a;
  const n = e.seen.get(t);
  if (!n) throw new Error("Unprocessed schema. This is a bug in Zod.");
  const r = new Map();
  for (const l of e.seen.entries()) {
    const d = (i = e.metadataRegistry.get(l[0])) == null ? void 0 : i.id;
    if (d) {
      const h = r.get(d);
      if (h && h !== l[0])
        throw new Error(
          `Duplicate schema id "${d}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`,
        );
      r.set(d, l[0]);
    }
  }
  const o = (l) => {
      var b;
      const d = e.target === "draft-2020-12" ? "$defs" : "definitions";
      if (e.external) {
        const j = (b = e.external.registry.get(l[0])) == null ? void 0 : b.id,
          Z = e.external.uri ?? ((x) => x);
        if (j) return { ref: Z(j) };
        const _ = l[1].defId ?? l[1].schema.id ?? `schema${e.counter++}`;
        return ((l[1].defId = _), { defId: _, ref: `${Z("__shared")}#/${d}/${_}` });
      }
      if (l[1] === n) return { ref: "#" };
      const p = `#/${d}/`,
        v = l[1].schema.id ?? `__schema${e.counter++}`;
      return { defId: v, ref: p + v };
    },
    s = (l) => {
      if (l[1].schema.$ref) return;
      const d = l[1],
        { ref: h, defId: p } = o(l);
      ((d.def = { ...d.schema }), p && (d.defId = p));
      const v = d.schema;
      for (const b in v) delete v[b];
      v.$ref = h;
    };
  if (e.cycles === "throw")
    for (const l of e.seen.entries()) {
      const d = l[1];
      if (d.cycle)
        throw new Error(`Cycle detected: #/${(u = d.cycle) == null ? void 0 : u.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
    }
  for (const l of e.seen.entries()) {
    const d = l[1];
    if (t === l[0]) {
      s(l);
      continue;
    }
    if (e.external) {
      const p = (c = e.external.registry.get(l[0])) == null ? void 0 : c.id;
      if (t !== l[0] && p) {
        s(l);
        continue;
      }
    }
    if ((a = e.metadataRegistry.get(l[0])) == null ? void 0 : a.id) {
      s(l);
      continue;
    }
    if (d.cycle) {
      s(l);
      continue;
    }
    if (d.count > 1 && e.reused === "ref") {
      s(l);
      continue;
    }
  }
}
function At(e, t) {
  var u, c, a, l;
  const n = e.seen.get(t);
  if (!n) throw new Error("Unprocessed schema. This is a bug in Zod.");
  const r = (d) => {
    const h = e.seen.get(d);
    if (h.ref === null) return;
    const p = h.def ?? h.schema,
      v = { ...p },
      b = h.ref;
    if (((h.ref = null), b)) {
      r(b);
      const Z = e.seen.get(b),
        _ = Z.schema;
      if (
        (_.$ref &&
        (e.target === "draft-07" || e.target === "draft-04" || e.target === "openapi-3.0")
          ? ((p.allOf = p.allOf ?? []), p.allOf.push(_))
          : Object.assign(p, _),
        Object.assign(p, v),
        d._zod.parent === b)
      )
        for (const E in p) E === "$ref" || E === "allOf" || E in v || delete p[E];
      if (_.$ref && Z.def)
        for (const E in p)
          E === "$ref" ||
            E === "allOf" ||
            (E in Z.def && JSON.stringify(p[E]) === JSON.stringify(Z.def[E]) && delete p[E]);
    }
    const j = d._zod.parent;
    if (j && j !== b) {
      r(j);
      const Z = e.seen.get(j);
      if (Z != null && Z.schema.$ref && ((p.$ref = Z.schema.$ref), Z.def))
        for (const _ in p)
          _ === "$ref" ||
            _ === "allOf" ||
            (_ in Z.def && JSON.stringify(p[_]) === JSON.stringify(Z.def[_]) && delete p[_]);
    }
    e.override({ zodSchema: d, jsonSchema: p, path: h.path ?? [] });
  };
  for (const d of [...e.seen.entries()].reverse()) r(d[0]);
  const o = {};
  if (
    (e.target === "draft-2020-12"
      ? (o.$schema = "https://json-schema.org/draft/2020-12/schema")
      : e.target === "draft-07"
        ? (o.$schema = "http://json-schema.org/draft-07/schema#")
        : e.target === "draft-04"
          ? (o.$schema = "http://json-schema.org/draft-04/schema#")
          : e.target,
    (u = e.external) != null && u.uri)
  ) {
    const d = (c = e.external.registry.get(t)) == null ? void 0 : c.id;
    if (!d) throw new Error("Schema is missing an `id` property");
    o.$id = e.external.uri(d);
  }
  Object.assign(o, n.def ?? n.schema);
  const s = (a = e.metadataRegistry.get(t)) == null ? void 0 : a.id;
  s !== void 0 && o.id === s && delete o.id;
  const i = ((l = e.external) == null ? void 0 : l.defs) ?? {};
  for (const d of e.seen.entries()) {
    const h = d[1];
    h.def && h.defId && (h.def.id === h.defId && delete h.def.id, (i[h.defId] = h.def));
  }
  e.external ||
    (Object.keys(i).length > 0 &&
      (e.target === "draft-2020-12" ? (o.$defs = i) : (o.definitions = i)));
  try {
    const d = JSON.parse(JSON.stringify(o));
    return (
      Object.defineProperty(d, "~standard", {
        value: {
          ...t["~standard"],
          jsonSchema: {
            input: de(t, "input", e.processors),
            output: de(t, "output", e.processors),
          },
        },
        enumerable: !1,
        writable: !1,
      }),
      d
    );
  } catch {
    throw new Error("Error converting schema to JSON.");
  }
}
function C(e, t) {
  const n = t ?? { seen: new Set() };
  if (n.seen.has(e)) return !1;
  n.seen.add(e);
  const r = e._zod.def;
  if (r.type === "transform") return !0;
  if (r.type === "array") return C(r.element, n);
  if (r.type === "set") return C(r.valueType, n);
  if (r.type === "lazy") return C(r.getter(), n);
  if (
    r.type === "promise" ||
    r.type === "optional" ||
    r.type === "nonoptional" ||
    r.type === "nullable" ||
    r.type === "readonly" ||
    r.type === "default" ||
    r.type === "prefault"
  )
    return C(r.innerType, n);
  if (r.type === "intersection") return C(r.left, n) || C(r.right, n);
  if (r.type === "record" || r.type === "map") return C(r.keyType, n) || C(r.valueType, n);
  if (r.type === "pipe") return e._zod.traits.has("$ZodCodec") ? !0 : C(r.in, n) || C(r.out, n);
  if (r.type === "object") {
    for (const o in r.shape) if (C(r.shape[o], n)) return !0;
    return !1;
  }
  if (r.type === "union") {
    for (const o of r.options) if (C(o, n)) return !0;
    return !1;
  }
  if (r.type === "tuple") {
    for (const o of r.items) if (C(o, n)) return !0;
    return !!(r.rest && C(r.rest, n));
  }
  return !1;
}
const us =
    (e, t = {}) =>
    (n) => {
      const r = Nt({ ...n, processors: t });
      return (P(e, r), jt(r, e), At(r, e));
    },
  de =
    (e, t, n = {}) =>
    (r) => {
      const { libraryOptions: o, target: s } = r ?? {},
        i = Nt({ ...(o ?? {}), target: s, io: t, processors: n });
      return (P(e, i), jt(i, e), At(i, e));
    },
  cs = { guid: "uuid", url: "uri", datetime: "date-time", json_string: "json-string", regex: "" },
  as = (e, t, n, r) => {
    const o = n;
    o.type = "string";
    const { minimum: s, maximum: i, format: u, patterns: c, contentEncoding: a } = e._zod.bag;
    if (
      (typeof s == "number" && (o.minLength = s),
      typeof i == "number" && (o.maxLength = i),
      u &&
        ((o.format = cs[u] ?? u),
        o.format === "" && delete o.format,
        u === "time" && delete o.format),
      a && (o.contentEncoding = a),
      c && c.size > 0)
    ) {
      const l = [...c];
      l.length === 1
        ? (o.pattern = l[0].source)
        : l.length > 1 &&
          (o.allOf = [
            ...l.map((d) => ({
              ...(t.target === "draft-07" || t.target === "draft-04" || t.target === "openapi-3.0"
                ? { type: "string" }
                : {}),
              pattern: d.source,
            })),
          ]);
    }
  },
  ls = (e, t, n, r) => {
    const o = n,
      {
        minimum: s,
        maximum: i,
        format: u,
        multipleOf: c,
        exclusiveMaximum: a,
        exclusiveMinimum: l,
      } = e._zod.bag;
    typeof u == "string" && u.includes("int") ? (o.type = "integer") : (o.type = "number");
    const d = typeof l == "number" && l >= (s ?? Number.NEGATIVE_INFINITY),
      h = typeof a == "number" && a <= (i ?? Number.POSITIVE_INFINITY),
      p = t.target === "draft-04" || t.target === "openapi-3.0";
    (d
      ? p
        ? ((o.minimum = l), (o.exclusiveMinimum = !0))
        : (o.exclusiveMinimum = l)
      : typeof s == "number" && (o.minimum = s),
      h
        ? p
          ? ((o.maximum = a), (o.exclusiveMaximum = !0))
          : (o.exclusiveMaximum = a)
        : typeof i == "number" && (o.maximum = i),
      typeof c == "number" && (o.multipleOf = c));
  },
  fs = (e, t, n, r) => {
    n.type = "boolean";
  },
  ds = (e, t, n, r) => {
    n.not = {};
  },
  hs = (e, t, n, r) => {},
  ps = (e, t, n, r) => {
    const o = e._zod.def,
      s = dt(o.entries);
    (s.every((i) => typeof i == "number") && (n.type = "number"),
      s.every((i) => typeof i == "string") && (n.type = "string"),
      (n.enum = s));
  },
  ms = (e, t, n, r) => {
    const o = e._zod.def,
      s = [];
    for (const i of o.values)
      if (i === void 0) {
        if (t.unrepresentable === "throw")
          throw new Error("Literal `undefined` cannot be represented in JSON Schema");
      } else if (typeof i == "bigint") {
        if (t.unrepresentable === "throw")
          throw new Error("BigInt literals cannot be represented in JSON Schema");
        s.push(Number(i));
      } else s.push(i);
    if (s.length !== 0)
      if (s.length === 1) {
        const i = s[0];
        ((n.type = i === null ? "null" : typeof i),
          t.target === "draft-04" || t.target === "openapi-3.0" ? (n.enum = [i]) : (n.const = i));
      } else
        (s.every((i) => typeof i == "number") && (n.type = "number"),
          s.every((i) => typeof i == "string") && (n.type = "string"),
          s.every((i) => typeof i == "boolean") && (n.type = "boolean"),
          s.every((i) => i === null) && (n.type = "null"),
          (n.enum = s));
  },
  gs = (e, t, n, r) => {
    if (t.unrepresentable === "throw")
      throw new Error("Custom types cannot be represented in JSON Schema");
  },
  _s = (e, t, n, r) => {
    if (t.unrepresentable === "throw")
      throw new Error("Transforms cannot be represented in JSON Schema");
  },
  vs = (e, t, n, r) => {
    const o = n,
      s = e._zod.def,
      { minimum: i, maximum: u } = e._zod.bag;
    (typeof i == "number" && (o.minItems = i),
      typeof u == "number" && (o.maxItems = u),
      (o.type = "array"),
      (o.items = P(s.element, t, { ...r, path: [...r.path, "items"] })));
  },
  ys = (e, t, n, r) => {
    var a;
    const o = n,
      s = e._zod.def;
    ((o.type = "object"), (o.properties = {}));
    const i = s.shape;
    for (const l in i) o.properties[l] = P(i[l], t, { ...r, path: [...r.path, "properties", l] });
    const u = new Set(Object.keys(i)),
      c = new Set(
        [...u].filter((l) => {
          const d = s.shape[l]._zod;
          return t.io === "input" ? d.optin === void 0 : d.optout === void 0;
        }),
      );
    (c.size > 0 && (o.required = Array.from(c)),
      ((a = s.catchall) == null ? void 0 : a._zod.def.type) === "never"
        ? (o.additionalProperties = !1)
        : s.catchall
          ? s.catchall &&
            (o.additionalProperties = P(s.catchall, t, {
              ...r,
              path: [...r.path, "additionalProperties"],
            }))
          : t.io === "output" && (o.additionalProperties = !1));
  },
  ws = (e, t, n, r) => {
    const o = e._zod.def,
      s = o.inclusive === !1,
      i = o.options.map((u, c) => P(u, t, { ...r, path: [...r.path, s ? "oneOf" : "anyOf", c] }));
    s ? (n.oneOf = i) : (n.anyOf = i);
  },
  bs = (e, t, n, r) => {
    const o = e._zod.def,
      s = P(o.left, t, { ...r, path: [...r.path, "allOf", 0] }),
      i = P(o.right, t, { ...r, path: [...r.path, "allOf", 1] }),
      u = (a) => "allOf" in a && Object.keys(a).length === 1,
      c = [...(u(s) ? s.allOf : [s]), ...(u(i) ? i.allOf : [i])];
    n.allOf = c;
  },
  zs = (e, t, n, r) => {
    const o = n,
      s = e._zod.def;
    o.type = "object";
    const i = s.keyType,
      u = i._zod.bag,
      c = u == null ? void 0 : u.patterns;
    if (s.mode === "loose" && c && c.size > 0) {
      const l = P(s.valueType, t, { ...r, path: [...r.path, "patternProperties", "*"] });
      o.patternProperties = {};
      for (const d of c) o.patternProperties[d.source] = l;
    } else
      ((t.target === "draft-07" || t.target === "draft-2020-12") &&
        (o.propertyNames = P(s.keyType, t, { ...r, path: [...r.path, "propertyNames"] })),
        (o.additionalProperties = P(s.valueType, t, {
          ...r,
          path: [...r.path, "additionalProperties"],
        })));
    const a = i._zod.values;
    if (a) {
      const l = [...a].filter((d) => typeof d == "string" || typeof d == "number");
      l.length > 0 && (o.required = l);
    }
  },
  $s = (e, t, n, r) => {
    const o = e._zod.def,
      s = P(o.innerType, t, r),
      i = t.seen.get(e);
    t.target === "openapi-3.0"
      ? ((i.ref = o.innerType), (n.nullable = !0))
      : (n.anyOf = [s, { type: "null" }]);
  },
  ks = (e, t, n, r) => {
    const o = e._zod.def;
    P(o.innerType, t, r);
    const s = t.seen.get(e);
    s.ref = o.innerType;
  },
  Ss = (e, t, n, r) => {
    const o = e._zod.def;
    P(o.innerType, t, r);
    const s = t.seen.get(e);
    ((s.ref = o.innerType), (n.default = JSON.parse(JSON.stringify(o.defaultValue))));
  },
  Zs = (e, t, n, r) => {
    const o = e._zod.def;
    P(o.innerType, t, r);
    const s = t.seen.get(e);
    ((s.ref = o.innerType),
      t.io === "input" && (n._prefault = JSON.parse(JSON.stringify(o.defaultValue))));
  },
  Es = (e, t, n, r) => {
    const o = e._zod.def;
    P(o.innerType, t, r);
    const s = t.seen.get(e);
    s.ref = o.innerType;
    let i;
    try {
      i = o.catchValue(void 0);
    } catch {
      throw new Error("Dynamic catch values are not supported in JSON Schema");
    }
    n.default = i;
  },
  Os = (e, t, n, r) => {
    const o = e._zod.def,
      s = o.in._zod.traits.has("$ZodTransform"),
      i = t.io === "input" ? (s ? o.out : o.in) : o.out;
    P(i, t, r);
    const u = t.seen.get(e);
    u.ref = i;
  },
  Ts = (e, t, n, r) => {
    const o = e._zod.def;
    P(o.innerType, t, r);
    const s = t.seen.get(e);
    ((s.ref = o.innerType), (n.readOnly = !0));
  },
  xt = (e, t, n, r) => {
    const o = e._zod.def;
    P(o.innerType, t, r);
    const s = t.seen.get(e);
    s.ref = o.innerType;
  },
  Ps = f("ZodISODateTime", (e, t) => {
    (Pr.init(e, t), S.init(e, t));
  });
function Is(e) {
  return Ro(Ps, e);
}
const Ns = f("ZodISODate", (e, t) => {
  (Ir.init(e, t), S.init(e, t));
});
function js(e) {
  return Do(Ns, e);
}
const As = f("ZodISOTime", (e, t) => {
  (Nr.init(e, t), S.init(e, t));
});
function xs(e) {
  return Uo(As, e);
}
const Cs = f("ZodISODuration", (e, t) => {
  (jr.init(e, t), S.init(e, t));
});
function Rs(e) {
  return Fo(Cs, e);
}
const Ds = (e, t) => {
    (gt.init(e, t),
      (e.name = "ZodError"),
      Object.defineProperties(e, {
        format: { value: (n) => zn(e, n) },
        flatten: { value: (n) => bn(e, n) },
        addIssue: {
          value: (n) => {
            (e.issues.push(n), (e.message = JSON.stringify(e.issues, be, 2)));
          },
        },
        addIssues: {
          value: (n) => {
            (e.issues.push(...n), (e.message = JSON.stringify(e.issues, be, 2)));
          },
        },
        isEmpty: {
          get() {
            return e.issues.length === 0;
          },
        },
      }));
  },
  F = f("ZodError", Ds, { Parent: Error }),
  Us = Pe(F),
  Fs = Ie(F),
  Ls = he(F),
  Js = pe(F),
  Ms = Sn(F),
  Vs = Zn(F),
  Ws = En(F),
  Bs = On(F),
  Gs = Tn(F),
  Ks = Pn(F),
  qs = In(F),
  Ys = Nn(F),
  tt = new WeakMap();
function oe(e, t, n) {
  const r = Object.getPrototypeOf(e);
  let o = tt.get(r);
  if ((o || ((o = new Set()), tt.set(r, o)), !o.has(t))) {
    o.add(t);
    for (const s in n) {
      const i = n[s];
      Object.defineProperty(r, s, {
        configurable: !0,
        enumerable: !1,
        get() {
          const u = i.bind(this);
          return (
            Object.defineProperty(this, s, {
              configurable: !0,
              writable: !0,
              enumerable: !0,
              value: u,
            }),
            u
          );
        },
        set(u) {
          Object.defineProperty(this, s, {
            configurable: !0,
            writable: !0,
            enumerable: !0,
            value: u,
          });
        },
      });
    }
  }
}
const k = f(
    "ZodType",
    (e, t) => (
      $.init(e, t),
      Object.assign(e["~standard"], {
        jsonSchema: { input: de(e, "input"), output: de(e, "output") },
      }),
      (e.toJSONSchema = us(e, {})),
      (e.def = t),
      (e.type = t.type),
      Object.defineProperty(e, "_def", { value: t }),
      (e.parse = (n, r) => Us(e, n, r, { callee: e.parse })),
      (e.safeParse = (n, r) => Ls(e, n, r)),
      (e.parseAsync = async (n, r) => Fs(e, n, r, { callee: e.parseAsync })),
      (e.safeParseAsync = async (n, r) => Js(e, n, r)),
      (e.spa = e.safeParseAsync),
      (e.encode = (n, r) => Ms(e, n, r)),
      (e.decode = (n, r) => Vs(e, n, r)),
      (e.encodeAsync = async (n, r) => Ws(e, n, r)),
      (e.decodeAsync = async (n, r) => Bs(e, n, r)),
      (e.safeEncode = (n, r) => Gs(e, n, r)),
      (e.safeDecode = (n, r) => Ks(e, n, r)),
      (e.safeEncodeAsync = async (n, r) => qs(e, n, r)),
      (e.safeDecodeAsync = async (n, r) => Ys(e, n, r)),
      oe(e, "ZodType", {
        check(...n) {
          const r = this.def;
          return this.clone(
            W(r, {
              checks: [
                ...(r.checks ?? []),
                ...n.map((o) =>
                  typeof o == "function"
                    ? { _zod: { check: o, def: { check: "custom" }, onattach: [] } }
                    : o,
                ),
              ],
            }),
            { parent: !0 },
          );
        },
        with(...n) {
          return this.check(...n);
        },
        clone(n, r) {
          return B(this, n, r);
        },
        brand() {
          return this;
        },
        register(n, r) {
          return (n.add(this, r), this);
        },
        refine(n, r) {
          return this.check(Vi(n, r));
        },
        superRefine(n, r) {
          return this.check(Wi(n, r));
        },
        overwrite(n) {
          return this.check(te(n));
        },
        optional() {
          return st(this);
        },
        exactOptional() {
          return Ii(this);
        },
        nullable() {
          return it(this);
        },
        nullish() {
          return st(it(this));
        },
        nonoptional(n) {
          return Ri(this, n);
        },
        array() {
          return U(this);
        },
        or(n) {
          return Dt([this, n]);
        },
        and(n) {
          return Si(this, n);
        },
        transform(n) {
          return ut(this, Ti(n));
        },
        default(n) {
          return Ai(this, n);
        },
        prefault(n) {
          return Ci(this, n);
        },
        catch(n) {
          return Ui(this, n);
        },
        pipe(n) {
          return ut(this, n);
        },
        readonly() {
          return Ji(this);
        },
        describe(n) {
          const r = this.clone();
          return (ne.add(r, { description: n }), r);
        },
        meta(...n) {
          if (n.length === 0) return ne.get(this);
          const r = this.clone();
          return (ne.add(r, n[0]), r);
        },
        isOptional() {
          return this.safeParse(void 0).success;
        },
        isNullable() {
          return this.safeParse(null).success;
        },
        apply(n) {
          return n(this);
        },
      }),
      Object.defineProperty(e, "description", {
        get() {
          var n;
          return (n = ne.get(e)) == null ? void 0 : n.description;
        },
        configurable: !0,
      }),
      e
    ),
  ),
  Ct = f("_ZodString", (e, t) => {
    (Ne.init(e, t), k.init(e, t), (e._zod.processJSONSchema = (r, o, s) => as(e, r, o)));
    const n = e._zod.bag;
    ((e.format = n.format ?? null),
      (e.minLength = n.minimum ?? null),
      (e.maxLength = n.maximum ?? null),
      oe(e, "_ZodString", {
        regex(...r) {
          return this.check(Bo(...r));
        },
        includes(...r) {
          return this.check(qo(...r));
        },
        startsWith(...r) {
          return this.check(Yo(...r));
        },
        endsWith(...r) {
          return this.check(Xo(...r));
        },
        min(...r) {
          return this.check(fe(...r));
        },
        max(...r) {
          return this.check(Pt(...r));
        },
        length(...r) {
          return this.check(It(...r));
        },
        nonempty(...r) {
          return this.check(fe(1, ...r));
        },
        lowercase(r) {
          return this.check(Go(r));
        },
        uppercase(r) {
          return this.check(Ko(r));
        },
        trim() {
          return this.check(Qo());
        },
        normalize(...r) {
          return this.check(Ho(...r));
        },
        toLowerCase() {
          return this.check(es());
        },
        toUpperCase() {
          return this.check(ts());
        },
        slugify() {
          return this.check(ns());
        },
      }));
  }),
  Xs = f("ZodString", (e, t) => {
    (Ne.init(e, t),
      Ct.init(e, t),
      (e.email = (n) => e.check(go(Hs, n))),
      (e.url = (n) => e.check(bo(Qs, n))),
      (e.jwt = (n) => e.check(Co(pi, n))),
      (e.emoji = (n) => e.check(zo(ei, n))),
      (e.guid = (n) => e.check(Xe(nt, n))),
      (e.uuid = (n) => e.check(_o(ue, n))),
      (e.uuidv4 = (n) => e.check(vo(ue, n))),
      (e.uuidv6 = (n) => e.check(yo(ue, n))),
      (e.uuidv7 = (n) => e.check(wo(ue, n))),
      (e.nanoid = (n) => e.check($o(ti, n))),
      (e.guid = (n) => e.check(Xe(nt, n))),
      (e.cuid = (n) => e.check(ko(ni, n))),
      (e.cuid2 = (n) => e.check(So(ri, n))),
      (e.ulid = (n) => e.check(Zo(oi, n))),
      (e.base64 = (n) => e.check(jo(fi, n))),
      (e.base64url = (n) => e.check(Ao(di, n))),
      (e.xid = (n) => e.check(Eo(si, n))),
      (e.ksuid = (n) => e.check(Oo(ii, n))),
      (e.ipv4 = (n) => e.check(To(ui, n))),
      (e.ipv6 = (n) => e.check(Po(ci, n))),
      (e.cidrv4 = (n) => e.check(Io(ai, n))),
      (e.cidrv6 = (n) => e.check(No(li, n))),
      (e.e164 = (n) => e.check(xo(hi, n))),
      (e.datetime = (n) => e.check(Is(n))),
      (e.date = (n) => e.check(js(n))),
      (e.time = (n) => e.check(xs(n))),
      (e.duration = (n) => e.check(Rs(n))));
  });
function g(e) {
  return mo(Xs, e);
}
const S = f("ZodStringFormat", (e, t) => {
    (z.init(e, t), Ct.init(e, t));
  }),
  Hs = f("ZodEmail", (e, t) => {
    (br.init(e, t), S.init(e, t));
  }),
  nt = f("ZodGUID", (e, t) => {
    (yr.init(e, t), S.init(e, t));
  }),
  ue = f("ZodUUID", (e, t) => {
    (wr.init(e, t), S.init(e, t));
  }),
  Qs = f("ZodURL", (e, t) => {
    (zr.init(e, t), S.init(e, t));
  }),
  ei = f("ZodEmoji", (e, t) => {
    ($r.init(e, t), S.init(e, t));
  }),
  ti = f("ZodNanoID", (e, t) => {
    (kr.init(e, t), S.init(e, t));
  }),
  ni = f("ZodCUID", (e, t) => {
    (Sr.init(e, t), S.init(e, t));
  }),
  ri = f("ZodCUID2", (e, t) => {
    (Zr.init(e, t), S.init(e, t));
  }),
  oi = f("ZodULID", (e, t) => {
    (Er.init(e, t), S.init(e, t));
  }),
  si = f("ZodXID", (e, t) => {
    (Or.init(e, t), S.init(e, t));
  }),
  ii = f("ZodKSUID", (e, t) => {
    (Tr.init(e, t), S.init(e, t));
  }),
  ui = f("ZodIPv4", (e, t) => {
    (Ar.init(e, t), S.init(e, t));
  }),
  ci = f("ZodIPv6", (e, t) => {
    (xr.init(e, t), S.init(e, t));
  }),
  ai = f("ZodCIDRv4", (e, t) => {
    (Cr.init(e, t), S.init(e, t));
  }),
  li = f("ZodCIDRv6", (e, t) => {
    (Rr.init(e, t), S.init(e, t));
  }),
  fi = f("ZodBase64", (e, t) => {
    (Dr.init(e, t), S.init(e, t));
  }),
  di = f("ZodBase64URL", (e, t) => {
    (Fr.init(e, t), S.init(e, t));
  }),
  hi = f("ZodE164", (e, t) => {
    (Lr.init(e, t), S.init(e, t));
  }),
  pi = f("ZodJWT", (e, t) => {
    (Mr.init(e, t), S.init(e, t));
  }),
  Rt = f("ZodNumber", (e, t) => {
    (Zt.init(e, t),
      k.init(e, t),
      (e._zod.processJSONSchema = (r, o, s) => ls(e, r, o)),
      oe(e, "ZodNumber", {
        gt(r, o) {
          return this.check(Qe(r, o));
        },
        gte(r, o) {
          return this.check(we(r, o));
        },
        min(r, o) {
          return this.check(we(r, o));
        },
        lt(r, o) {
          return this.check(He(r, o));
        },
        lte(r, o) {
          return this.check(ye(r, o));
        },
        max(r, o) {
          return this.check(ye(r, o));
        },
        int(r) {
          return this.check(rt(r));
        },
        safe(r) {
          return this.check(rt(r));
        },
        positive(r) {
          return this.check(Qe(0, r));
        },
        nonnegative(r) {
          return this.check(we(0, r));
        },
        negative(r) {
          return this.check(He(0, r));
        },
        nonpositive(r) {
          return this.check(ye(0, r));
        },
        multipleOf(r, o) {
          return this.check(et(r, o));
        },
        step(r, o) {
          return this.check(et(r, o));
        },
        finite() {
          return this;
        },
      }));
    const n = e._zod.bag;
    ((e.minValue =
      Math.max(
        n.minimum ?? Number.NEGATIVE_INFINITY,
        n.exclusiveMinimum ?? Number.NEGATIVE_INFINITY,
      ) ?? null),
      (e.maxValue =
        Math.min(
          n.maximum ?? Number.POSITIVE_INFINITY,
          n.exclusiveMaximum ?? Number.POSITIVE_INFINITY,
        ) ?? null),
      (e.isInt = (n.format ?? "").includes("int") || Number.isSafeInteger(n.multipleOf ?? 0.5)),
      (e.isFinite = !0),
      (e.format = n.format ?? null));
  });
function G(e) {
  return Lo(Rt, e);
}
const mi = f("ZodNumberFormat", (e, t) => {
  (Vr.init(e, t), Rt.init(e, t));
});
function rt(e) {
  return Jo(mi, e);
}
const gi = f("ZodBoolean", (e, t) => {
  (Wr.init(e, t), k.init(e, t), (e._zod.processJSONSchema = (n, r, o) => fs(e, n, r)));
});
function _i(e) {
  return Mo(gi, e);
}
const vi = f("ZodUnknown", (e, t) => {
  (Br.init(e, t), k.init(e, t), (e._zod.processJSONSchema = (n, r, o) => hs()));
});
function $e() {
  return Vo(vi);
}
const yi = f("ZodNever", (e, t) => {
  (Gr.init(e, t), k.init(e, t), (e._zod.processJSONSchema = (n, r, o) => ds(e, n, r)));
});
function wi(e) {
  return Wo(yi, e);
}
const bi = f("ZodArray", (e, t) => {
  (Kr.init(e, t),
    k.init(e, t),
    (e._zod.processJSONSchema = (n, r, o) => vs(e, n, r, o)),
    (e.element = t.element),
    oe(e, "ZodArray", {
      min(n, r) {
        return this.check(fe(n, r));
      },
      nonempty(n) {
        return this.check(fe(1, n));
      },
      max(n, r) {
        return this.check(Pt(n, r));
      },
      length(n, r) {
        return this.check(It(n, r));
      },
      unwrap() {
        return this.element;
      },
    }));
});
function U(e, t) {
  return rs(bi, e, t);
}
const zi = f("ZodObject", (e, t) => {
  (Yr.init(e, t),
    k.init(e, t),
    (e._zod.processJSONSchema = (n, r, o) => ys(e, n, r, o)),
    y(e, "shape", () => t.shape),
    oe(e, "ZodObject", {
      keyof() {
        return Ut(Object.keys(this._zod.def.shape));
      },
      catchall(n) {
        return this.clone({ ...this._zod.def, catchall: n });
      },
      passthrough() {
        return this.clone({ ...this._zod.def, catchall: $e() });
      },
      loose() {
        return this.clone({ ...this._zod.def, catchall: $e() });
      },
      strict() {
        return this.clone({ ...this._zod.def, catchall: wi() });
      },
      strip() {
        return this.clone({ ...this._zod.def, catchall: void 0 });
      },
      extend(n) {
        return mn(this, n);
      },
      safeExtend(n) {
        return gn(this, n);
      },
      merge(n) {
        return _n(this, n);
      },
      pick(n) {
        return hn(this, n);
      },
      omit(n) {
        return pn(this, n);
      },
      partial(...n) {
        return vn(Ft, this, n[0]);
      },
      required(...n) {
        return yn(Lt, this, n[0]);
      },
    }));
});
function L(e, t) {
  const n = { type: "object", shape: e ?? {}, ...m(t) };
  return new zi(n);
}
const $i = f("ZodUnion", (e, t) => {
  (Xr.init(e, t),
    k.init(e, t),
    (e._zod.processJSONSchema = (n, r, o) => ws(e, n, r, o)),
    (e.options = t.options));
});
function Dt(e, t) {
  return new $i({ type: "union", options: e, ...m(t) });
}
const ki = f("ZodIntersection", (e, t) => {
  (Hr.init(e, t), k.init(e, t), (e._zod.processJSONSchema = (n, r, o) => bs(e, n, r, o)));
});
function Si(e, t) {
  return new ki({ type: "intersection", left: e, right: t });
}
const ot = f("ZodRecord", (e, t) => {
  (Qr.init(e, t),
    k.init(e, t),
    (e._zod.processJSONSchema = (n, r, o) => zs(e, n, r, o)),
    (e.keyType = t.keyType),
    (e.valueType = t.valueType));
});
function Zi(e, t, n) {
  return !t || !t._zod
    ? new ot({ type: "record", keyType: g(), valueType: e, ...m(t) })
    : new ot({ type: "record", keyType: e, valueType: t, ...m(n) });
}
const ke = f("ZodEnum", (e, t) => {
  (eo.init(e, t),
    k.init(e, t),
    (e._zod.processJSONSchema = (r, o, s) => ps(e, r, o)),
    (e.enum = t.entries),
    (e.options = Object.values(t.entries)));
  const n = new Set(Object.keys(t.entries));
  ((e.extract = (r, o) => {
    const s = {};
    for (const i of r)
      if (n.has(i)) s[i] = t.entries[i];
      else throw new Error(`Key ${i} not found in enum`);
    return new ke({ ...t, checks: [], ...m(o), entries: s });
  }),
    (e.exclude = (r, o) => {
      const s = { ...t.entries };
      for (const i of r)
        if (n.has(i)) delete s[i];
        else throw new Error(`Key ${i} not found in enum`);
      return new ke({ ...t, checks: [], ...m(o), entries: s });
    }));
});
function Ut(e, t) {
  const n = Array.isArray(e) ? Object.fromEntries(e.map((r) => [r, r])) : e;
  return new ke({ type: "enum", entries: n, ...m(t) });
}
const Ei = f("ZodLiteral", (e, t) => {
  (to.init(e, t),
    k.init(e, t),
    (e._zod.processJSONSchema = (n, r, o) => ms(e, n, r)),
    (e.values = new Set(t.values)),
    Object.defineProperty(e, "value", {
      get() {
        if (t.values.length > 1)
          throw new Error(
            "This schema contains multiple valid literal values. Use `.values` instead.",
          );
        return t.values[0];
      },
    }));
});
function je(e, t) {
  return new Ei({ type: "literal", values: Array.isArray(e) ? e : [e], ...m(t) });
}
const Oi = f("ZodTransform", (e, t) => {
  (no.init(e, t),
    k.init(e, t),
    (e._zod.processJSONSchema = (n, r, o) => _s(e, n)),
    (e._zod.parse = (n, r) => {
      if (r.direction === "backward") throw new ft(e.constructor.name);
      n.addIssue = (s) => {
        if (typeof s == "string") n.issues.push(re(s, n.value, t));
        else {
          const i = s;
          (i.fatal && (i.continue = !1),
            i.code ?? (i.code = "custom"),
            i.input ?? (i.input = n.value),
            i.inst ?? (i.inst = e),
            n.issues.push(re(i)));
        }
      };
      const o = t.transform(n.value, n);
      return o instanceof Promise
        ? o.then((s) => ((n.value = s), (n.fallback = !0), n))
        : ((n.value = o), (n.fallback = !0), n);
    }));
});
function Ti(e) {
  return new Oi({ type: "transform", transform: e });
}
const Ft = f("ZodOptional", (e, t) => {
  (Tt.init(e, t),
    k.init(e, t),
    (e._zod.processJSONSchema = (n, r, o) => xt(e, n, r, o)),
    (e.unwrap = () => e._zod.def.innerType));
});
function st(e) {
  return new Ft({ type: "optional", innerType: e });
}
const Pi = f("ZodExactOptional", (e, t) => {
  (ro.init(e, t),
    k.init(e, t),
    (e._zod.processJSONSchema = (n, r, o) => xt(e, n, r, o)),
    (e.unwrap = () => e._zod.def.innerType));
});
function Ii(e) {
  return new Pi({ type: "optional", innerType: e });
}
const Ni = f("ZodNullable", (e, t) => {
  (oo.init(e, t),
    k.init(e, t),
    (e._zod.processJSONSchema = (n, r, o) => $s(e, n, r, o)),
    (e.unwrap = () => e._zod.def.innerType));
});
function it(e) {
  return new Ni({ type: "nullable", innerType: e });
}
const ji = f("ZodDefault", (e, t) => {
  (so.init(e, t),
    k.init(e, t),
    (e._zod.processJSONSchema = (n, r, o) => Ss(e, n, r, o)),
    (e.unwrap = () => e._zod.def.innerType),
    (e.removeDefault = e.unwrap));
});
function Ai(e, t) {
  return new ji({
    type: "default",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : pt(t);
    },
  });
}
const xi = f("ZodPrefault", (e, t) => {
  (io.init(e, t),
    k.init(e, t),
    (e._zod.processJSONSchema = (n, r, o) => Zs(e, n, r, o)),
    (e.unwrap = () => e._zod.def.innerType));
});
function Ci(e, t) {
  return new xi({
    type: "prefault",
    innerType: e,
    get defaultValue() {
      return typeof t == "function" ? t() : pt(t);
    },
  });
}
const Lt = f("ZodNonOptional", (e, t) => {
  (uo.init(e, t),
    k.init(e, t),
    (e._zod.processJSONSchema = (n, r, o) => ks(e, n, r, o)),
    (e.unwrap = () => e._zod.def.innerType));
});
function Ri(e, t) {
  return new Lt({ type: "nonoptional", innerType: e, ...m(t) });
}
const Di = f("ZodCatch", (e, t) => {
  (co.init(e, t),
    k.init(e, t),
    (e._zod.processJSONSchema = (n, r, o) => Es(e, n, r, o)),
    (e.unwrap = () => e._zod.def.innerType),
    (e.removeCatch = e.unwrap));
});
function Ui(e, t) {
  return new Di({ type: "catch", innerType: e, catchValue: typeof t == "function" ? t : () => t });
}
const Fi = f("ZodPipe", (e, t) => {
  (ao.init(e, t),
    k.init(e, t),
    (e._zod.processJSONSchema = (n, r, o) => Os(e, n, r, o)),
    (e.in = t.in),
    (e.out = t.out));
});
function ut(e, t) {
  return new Fi({ type: "pipe", in: e, out: t });
}
const Li = f("ZodReadonly", (e, t) => {
  (lo.init(e, t),
    k.init(e, t),
    (e._zod.processJSONSchema = (n, r, o) => Ts(e, n, r, o)),
    (e.unwrap = () => e._zod.def.innerType));
});
function Ji(e) {
  return new Li({ type: "readonly", innerType: e });
}
const Mi = f("ZodCustom", (e, t) => {
  (fo.init(e, t), k.init(e, t), (e._zod.processJSONSchema = (n, r, o) => gs(e, n)));
});
function Vi(e, t = {}) {
  return os(Mi, e, t);
}
function Wi(e, t) {
  return ss(e, t);
}
const Ae = L({ id: g(), title: g(), ideologyProfileId: g(), knowledgeSourceIds: U(g()) }),
  Bi = L({ id: g(), role: g(), content: g(), documentIds: U(g()) }),
  Gi = L({ thread: Ae, messages: U(Bi), linkedDocumentIds: U(g()) }),
  Ki = L({ id: g(), title: g() }),
  qi = U(Ki),
  ge = L({
    id: g(),
    title: g(),
    ownerId: g(),
    description: g(),
    tags: U(g()),
    source: g(),
    category: g(),
    status: g(),
    type: g(),
    createdAt: g(),
    updatedAt: g(),
    totalSizeBytes: G(),
    fileName: g(),
    contentType: g(),
    storageRef: g(),
    indexedChunkCount: G(),
    indexedAt: g().nullable(),
    extractedTextPreview: g(),
    extractedTextLength: G(),
    extractedTextTruncated: _i(),
  }),
  Yi = L({ content: U(ge), totalElements: G(), totalPages: G(), page: G(), size: G() }),
  Xi = L({ id: g(), title: g() }),
  Hi = L({
    type: je("send_email").optional(),
    to: g().optional(),
    subject: g().optional(),
    body: g().optional(),
  }),
  Qi = L({
    type: je("create_calendar_event").optional(),
    title: g().optional(),
    attendees: U(g()).optional(),
    startIso: g().optional(),
    endIso: g().optional(),
  }),
  eu = L({
    type: je("update_document_tags").optional(),
    documentId: g().optional(),
    tags: U(g()).optional(),
  }),
  tu = Zi(g(), $e()),
  nu = Dt([Hi, Qi, eu, tu]),
  ru = Ut(["DRAFT", "CONFIRMED", "EXECUTED"]),
  Jt = L({
    id: g(),
    intent: g(),
    entities: nu,
    actorId: g(),
    status: ru,
    confirmedBy: g().nullable(),
  }),
  hu = U(Jt),
  I = "/api",
  xe = "dmis_token";
let ce = null;
function Mt() {
  return localStorage.getItem(xe) ?? "";
}
function Vt(e) {
  localStorage.setItem(xe, e);
}
function Wt() {
  localStorage.removeItem(xe);
}
async function _e(e) {
  if ((e.headers.get("content-type") ?? "").includes("application/json"))
    try {
      const r = await e.json();
      return r.message ?? r.errorCode ?? "Request failed";
    } catch {
      return "Request failed";
    }
  return (await e.text()).trim() || "Request failed";
}
async function Bt(e) {
  if (!(e.headers.get("content-type") ?? "").includes("application/json"))
    return { message: (await e.text()).trim() || "Request failed" };
  try {
    return await e.json();
  } catch {
    return { message: "Request failed" };
  }
}
async function Gt(e) {
  if (!e.ok) throw new Error(await _e(e));
  if (!(e.headers.get("content-type") ?? "").includes("application/json"))
    throw new Error("Expected JSON response");
  return e.json();
}
async function ve(e, t) {
  if (e.status === 401 || e.status === 403) throw (t(), new Error("Unauthorized"));
  if (!e.ok) throw new Error(await _e(e));
  if (!(e.headers.get("content-type") ?? "").includes("application/json"))
    throw new Error("Expected JSON response");
  return e.json();
}
async function J(e, t, n) {
  const r = await ve(e, n);
  return t.parse(r);
}
async function pu(e, t) {
  if (e.status === 401 || e.status === 403) throw (t(), new Error("Unauthorized"));
  if (!e.ok) throw new Error(await _e(e));
  return e.text();
}
async function R(e, t = {}, n) {
  const r = ct(t, Mt()),
    o = await fetch(e, r);
  if (o.status !== 401) return o;
  ce ||
    (ce = ou().finally(() => {
      ce = null;
    }));
  const s = await ce;
  return s ? (Vt(s), n == null || n(s), fetch(e, ct(t, s))) : o;
}
async function ou() {
  const e = await fetch(`${I}/auth/refresh`, { method: "POST", credentials: "include" });
  return e.ok ? (await Gt(e)).token : (Wt(), null);
}
function ct(e, t) {
  const r = { ...(e.headers ? e.headers : {}) };
  return (
    t && (r.Authorization = `Bearer ${t}`),
    { ...e, credentials: e.credentials ?? "include", headers: r }
  );
}
async function mu(e, t) {
  const n = await R(`${I}/assistant/threads`, { method: "GET" }, t);
  return J(n, U(Ae), e);
}
async function gu(e, t, n) {
  const r = await R(
    `${I}/assistant/documents/mentions?q=${encodeURIComponent(e)}&limit=8`,
    { method: "GET" },
    n,
  );
  return J(r, qi, t);
}
async function _u(e, t, n) {
  const r = await R(`${I}/assistant/threads/${e}`, { method: "GET" }, n);
  return J(r, Gi, t);
}
async function vu(e, t, n) {
  const r = await R(
    `${I}/assistant/threads`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: e }),
    },
    n,
  );
  return J(r, Ae, t);
}
async function yu(e, t, n, r, o) {
  var d, h, p, v, b, j, Z;
  let s;
  try {
    s = await R(
      `${I}/rag/answer-with-sources/stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify(e),
        signal: r,
      },
      o,
    );
  } catch (_) {
    const x = _ instanceof Error ? _ : new Error("SSE request failed");
    throw ((d = n.onError) == null || d.call(n, x), x);
  }
  if (s.status === 401 || s.status === 403) {
    t();
    const _ = new Error("Unauthorized");
    throw ((h = n.onError) == null || h.call(n, _), _);
  }
  if (!s.ok) {
    const _ = new Error(await _e(s));
    throw ((p = n.onError) == null || p.call(n, _), _);
  }
  const i = (v = s.body) == null ? void 0 : v.getReader();
  if (!i) {
    const _ = new Error("SSE stream is unavailable");
    throw ((b = n.onError) == null || b.call(n, _), _);
  }
  const u = new TextDecoder();
  let c = "",
    a = !1;
  const l = (_) => {
    var E;
    if (!_.startsWith("data:")) return;
    const x = _.slice(5).trim();
    if (x)
      try {
        const N = JSON.parse(x);
        (typeof N.delta == "string" && N.delta.length > 0 && n.onDelta(N.delta),
          N.done && ((a = !0), (E = n.onDone) == null || E.call(n, N)));
      } catch {}
  };
  try {
    for (;;) {
      const { value: _, done: x } = await i.read();
      if (x) break;
      c += u.decode(_, { stream: !0 });
      let E = c.indexOf(`
`);
      for (; E >= 0; ) {
        const N = c.slice(0, E).trimEnd();
        (l(N),
          (c = c.slice(E + 1)),
          (E = c.indexOf(`
`)));
      }
    }
    (c.trim().length > 0 && l(c.trim()), a || (j = n.onDone) == null || j.call(n, { done: !0 }));
  } catch (_) {
    const x = _ instanceof Error ? _ : new Error("SSE stream read failed");
    throw ((Z = n.onError) == null || Z.call(n, x), x);
  } finally {
    i.releaseLock();
  }
}
async function wu(e, t, n, r) {
  const o = await R(
    `${I}/assistant/threads/${e}/documents`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ documentId: t }),
    },
    r,
  );
  await ve(o, n);
}
async function bu(e, t, n, r) {
  const o = new FormData();
  o.append("file", t);
  const s = await R(`${I}/assistant/threads/${e}/uploads`, { method: "POST", body: o }, r);
  await ve(s, n);
}
async function zu(e, t, n) {
  const r = await R(`${I}/documents/${e}`, { method: "GET" }, n),
    o = await J(r, Xi, t);
  return { id: o.id, title: o.title };
}
async function $u(e, t, n) {
  const r = new URLSearchParams({ page: String(e.page), size: String(e.size) });
  e.tag && r.set("tag", e.tag);
  const o = await R(`${I}/documents?${r}`, { method: "GET" }, n);
  return J(o, Yi, t);
}
async function ku(e, t, n) {
  const r = new FormData();
  r.append("file", e);
  const o = await R(`${I}/documents`, { method: "POST", body: r }, n);
  return J(o, ge, t);
}
async function Su(e, t = () => {}, n) {
  const r = await R(`${I}/documents/${e}`, { method: "GET" }, n);
  return (await J(r, ge, t)).tags;
}
async function Zu(e, t = () => {}, n) {
  const r = await R(`${I}/actions/${e}/confirm`, { method: "POST" }, n);
  return J(r, Jt, t);
}
async function Eu(e, t, n, r) {
  const o = await R(
    `${I}/documents/${e}`,
    { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(t) },
    r,
  );
  return J(o, ge, n);
}
async function Ou(e, t, n) {
  const r = await R(`${I}/documents/${e}`, { method: "DELETE" }, n);
  if (r.status === 401 || r.status === 403) throw (t(), new Error("Unauthorized"));
  if (!r.ok) {
    const o = await Bt(r);
    throw new Error(o.message ?? o.errorCode ?? "Request failed");
  }
}
function at(e, t) {
  return e === 401
    ? "Неверный email или пароль."
    : e === 400
      ? "Проверьте корректность email и пароля."
      : e === 403
        ? "Доступ запрещен для этого аккаунта."
        : t != null && t.includes("Failed to fetch")
          ? "Сервер недоступен. Проверьте настройки API/CORS и запуск backend."
          : t || "Не удалось выполнить вход.";
}
function su({ onLogin: e }) {
  const [t, n] = T.useState(""),
    [r, o] = T.useState(""),
    [s, i] = T.useState(""),
    [u, c] = T.useState(!1);
  async function a(l) {
    (l.preventDefault(), i(""), c(!0));
    try {
      if (!(await fetch(`${I}/health`)).ok) {
        i("Сервер backend недоступен. Проверьте, что API отвечает на /health.");
        return;
      }
      const h = await fetch(`${I}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: t, password: r }),
      });
      if (!h.ok) {
        const v = await Bt(h);
        throw new Error(at(h.status, v.message ?? v.errorCode));
      }
      const p = await Gt(h);
      e(p.token, p.user);
    } catch (d) {
      i(at(void 0, d instanceof Error ? d.message : "Ошибка входа"));
    } finally {
      c(!1);
    }
  }
  return w.jsx("div", {
    className: "flex min-h-screen items-center justify-center bg-surface",
    children: w.jsxs("div", {
      className: "w-[340px] rounded-[14px] border border-border bg-white px-12 py-10",
      children: [
        w.jsx("h1", {
          className: "mb-1 mt-0 font-mono text-[28px] text-primary",
          children: "DMIS",
        }),
        w.jsx("p", {
          className: "mb-6 mt-0 text-sm text-muted",
          children: "Система документооборота и интеллектуального поиска",
        }),
        w.jsxs("p", {
          className: "mb-[14px] mt-0 text-xs text-muted",
          children: ["API: ", w.jsx("code", { children: I })],
        }),
        w.jsxs("form", {
          onSubmit: a,
          className: "flex flex-col gap-2.5",
          children: [
            w.jsx("input", {
              type: "email",
              value: t,
              onChange: (l) => n(l.target.value),
              placeholder: "Электронная почта",
              required: !0,
              autoComplete: "username",
              className:
                "w-full rounded-lg border border-border bg-surface px-3 py-[9px] text-sm outline-none",
            }),
            w.jsx("input", {
              type: "password",
              value: r,
              onChange: (l) => o(l.target.value),
              placeholder: "Пароль",
              required: !0,
              autoComplete: "current-password",
              className:
                "w-full rounded-lg border border-border bg-surface px-3 py-[9px] text-sm outline-none",
            }),
            s && w.jsx("p", { className: "m-0 text-[13px] text-danger", children: s }),
            w.jsx("button", {
              type: "submit",
              disabled: !t || !r || u,
              className:
                "mt-1 rounded-lg border-0 bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60",
              children: u ? "Входим..." : "Войти",
            }),
          ],
        }),
      ],
    }),
  });
}
const Tu = {
    documents: {
      all: ["documents"],
      list: (e) => ["documents", e],
      count: ["documents-count"],
      card: (e) => ["document-card", e],
    },
    assistant: {
      threads: ["assistant-threads"],
      threadDetail: (e) => ["assistant-thread-detail", e],
    },
    dashboard: { metrics: ["dashboard-metrics"] },
  },
  Kt = new nn({
    defaultOptions: { queries: { staleTime: 3e4, retry: 1, refetchOnWindowFocus: !1 } },
  });
function iu({ children: e }) {
  return w.jsx("div", {
    "aria-live": "polite",
    "aria-atomic": "true",
    className:
      "pointer-events-none fixed bottom-4 right-4 z-[60] flex max-w-[320px] flex-col gap-2",
    children: e,
  });
}
const qt = T.createContext(null);
function uu(e) {
  return e === "success"
    ? "border-success/40 bg-successSoft text-text"
    : e === "error"
      ? "border-danger/40 bg-danger/10 text-text"
      : "border-border bg-surface text-text";
}
function cu({ children: e }) {
  const [t, n] = T.useState([]),
    r = T.useRef(0),
    o = T.useCallback((u) => {
      n((c) => c.filter((a) => a.id !== u));
    }, []),
    s = T.useCallback(
      (u, c) => {
        const a = `toast-${Date.now()}-${r.current++}`;
        (n((l) => [...l, { id: a, message: c, tone: u }]), window.setTimeout(() => o(a), 3500));
      },
      [o],
    ),
    i = T.useMemo(
      () => ({
        success: (u) => s("success", u),
        error: (u) => s("error", u),
        info: (u) => s("info", u),
      }),
      [s],
    );
  return w.jsxs(qt.Provider, {
    value: i,
    children: [
      e,
      w.jsx(iu, {
        children: t.map((u) =>
          w.jsx(
            "div",
            {
              role: "status",
              "aria-live": "polite",
              className: `rounded-lg border px-3 py-2 text-sm shadow-menu ${uu(u.tone)}`,
              children: u.message,
            },
            u.id,
          ),
        ),
      }),
    ],
  });
}
function Pu() {
  const e = T.useContext(qt);
  if (!e) throw new Error("useToast must be used inside ToastProvider");
  return e;
}
const au = T.lazy(() =>
  sn(() => import("./WorkspacePage-BrN-9rpd.js"), __vite__mapDeps([0, 1, 2, 3])).then((e) => ({
    default: e.WorkspacePage,
  })),
);
function lu() {
  const [e, t] = T.useState(() => Mt()),
    [n, r] = T.useState(null);
  T.useEffect(() => {}, []);
  const o = T.useCallback((u, c) => {
      (Vt(u), t(u), r(c));
    }, []),
    s = T.useCallback(() => {
      (Wt(), t(""), r(null));
    }, []),
    i = T.useCallback((u) => {
      t(u);
    }, []);
  return (
    T.useEffect(() => {
      if (!e || n) return;
      const u = new AbortController();
      return (
        R(`${I}/auth/me`, { signal: u.signal }, i)
          .then((c) => ve(c, s))
          .then((c) => r(c))
          .catch((c) => {
            (c instanceof DOMException && c.name === "AbortError") || s();
          }),
        () => {
          u.abort();
        }
      );
    }, [e]),
    w.jsx(lt, {
      client: Kt,
      children: w.jsx(cu, {
        children:
          !e || !n
            ? w.jsx(su, { onLogin: o })
            : w.jsx(T.Suspense, {
                fallback: w.jsx("div", {
                  className: "p-4 text-sm text-muted",
                  children: "Загрузка интерфейса…",
                }),
                children: w.jsx(Xt, {
                  children: w.jsx(Ht, {
                    path: "*",
                    element: w.jsx(au, {
                      user: n,
                      token: e,
                      onSessionExpired: s,
                      onTokenRefresh: i,
                    }),
                  }),
                }),
              }),
      }),
    })
  );
}
Qt(document.getElementById("root")).render(
  w.jsx(en.StrictMode, {
    children: w.jsx(lt, {
      client: Kt,
      children: w.jsx(tn, {
        future: { v7_startTransition: !0, v7_relativeSplatPath: !0 },
        children: w.jsx(lu, {}),
      }),
    }),
  }),
);
export {
  hu as A,
  yu as a,
  U as b,
  Su as c,
  Zu as d,
  zu as e,
  R as f,
  vu as g,
  wu as h,
  bu as i,
  I as j,
  mu as k,
  _u as l,
  gu as m,
  G as n,
  L as o,
  ve as p,
  Tu as q,
  Ou as r,
  g as s,
  Eu as t,
  Pu as u,
  ku as v,
  Bt as w,
  $u as x,
  pu as y,
};
