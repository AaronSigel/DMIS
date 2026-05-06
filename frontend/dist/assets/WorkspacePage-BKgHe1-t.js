import {
  l as je,
  r as a,
  j as t,
  m as Et,
  q as ln,
  t as dn,
  u as un,
  M as mn,
  w as He,
  x as xn,
  y as fn,
  R as pn,
  i as ne,
  N as _e,
} from "./react-vendor-BYKCA02s.js";
import { u as Xe, b as ie, c as re, k as bn } from "./query-vendor-C0HI_nld.js";
import {
  a as hn,
  b as gn,
  o as yn,
  n as vn,
  s as Ne,
  u as ye,
  c as wn,
  d as jn,
  e as Nn,
  q as U,
  f as ee,
  p as pe,
  g as En,
  h as Cn,
  i as Sn,
  j as H,
  k as An,
  l as Dn,
  m as Pn,
  A as kn,
  r as Ct,
  t as St,
  v as In,
  w as At,
  x as Je,
  y as Tn,
} from "./index-CK9AaxYQ.js";
import { p as On, r as Mn } from "./markdown-vendor-BoH24OZ1.js";
const ut = (e) => {
    let n;
    const r = new Set(),
      s = (u, f) => {
        const m = typeof u == "function" ? u(n) : u;
        if (!Object.is(m, n)) {
          const g = n;
          ((n = (f ?? (typeof m != "object" || m === null)) ? m : Object.assign({}, n, m)),
            r.forEach((p) => p(n, g)));
        }
      },
      o = () => n,
      c = {
        setState: s,
        getState: o,
        getInitialState: () => x,
        subscribe: (u) => (r.add(u), () => r.delete(u)),
      },
      x = (n = e(s, o, c));
    return c;
  },
  Rn = (e) => (e ? ut(e) : ut),
  Ln = (e) => e;
function Fn(e, n = Ln) {
  const r = je.useSyncExternalStore(
    e.subscribe,
    je.useCallback(() => n(e.getState()), [e, n]),
    je.useCallback(() => n(e.getInitialState()), [e, n]),
  );
  return (je.useDebugValue(r), r);
}
const mt = (e) => {
    const n = Rn(e),
      r = (s) => Fn(n, s);
    return (Object.assign(r, n), r);
  },
  _n = (e) => (e ? mt(e) : mt),
  Z = _n((e) => ({
    assistantQuery: "",
    mobileAiOpen: !1,
    resizeMode: null,
    setAssistantQuery: (n) => e({ assistantQuery: n }),
    openAiWithQuery: (n) =>
      e((r) => ({ assistantQuery: typeof n == "string" ? n : r.assistantQuery, mobileAiOpen: !0 })),
    closeMobileAi: () => e({ mobileAiOpen: !1 }),
    startResize: (n) => e({ resizeMode: n }),
    stopResize: () => e({ resizeMode: null }),
  })),
  $n = yn({ documentId: Ne(), documentTitle: Ne(), chunkId: Ne(), chunkText: Ne(), score: vn() }),
  Un = gn($n);
function Wn(e) {
  const n = Un.safeParse(e);
  return n.success
    ? n.data.map((r, s) => ({
        index: s + 1,
        documentId: r.documentId,
        documentTitle: r.documentTitle,
        chunkId: r.chunkId,
        chunkText: r.chunkText,
        score: r.score,
      }))
    : [];
}
function zn(e) {
  const [n, r] = a.useState(!1),
    [s, o] = a.useState(""),
    [i, d] = a.useState([]),
    [c, x] = a.useState(null),
    u = a.useRef(null),
    f = a.useCallback(() => {
      var j;
      ((j = u.current) == null || j.abort(), (u.current = null), r(!1));
    }, []),
    m = a.useCallback(() => {
      (o(""), d([]), x(null));
    }, []),
    g = a.useCallback(() => {
      o("");
    }, []),
    p = a.useCallback(
      async ({ payload: j, onDone: h, onError: C }) => {
        (f(), o(""), d([]), x(null), r(!0));
        const w = new AbortController();
        u.current = w;
        try {
          await hn(
            j,
            e.onUnauthorized,
            {
              onDelta: (N) => {
                o((v) => v + N);
              },
              onDone: async (N) => {
                (d(Wn(N.sources)), await (h == null ? void 0 : h()));
              },
              onError: (N) => {
                N.name !== "AbortError" && (x(N.message), C == null || C(N));
              },
            },
            w.signal,
            e.onTokenRefresh,
          );
        } catch (N) {
          if (N instanceof Error && N.name === "AbortError") return;
          const v = N instanceof Error ? N : new Error("Ошибка потокового ответа");
          (x(v.message), C == null || C(v));
        } finally {
          (u.current === w && (u.current = null), r(!1));
        }
      },
      [e.onTokenRefresh, e.onUnauthorized, f],
    );
  return (
    a.useEffect(() => () => f(), [f]),
    {
      isStreaming: n,
      streamText: s,
      streamSources: i,
      streamError: c,
      startStream: p,
      stopStream: f,
      resetStream: m,
      clearStreamText: g,
    }
  );
}
const be = "rounded-md border border-border bg-white px-3 py-1 text-xs text-text";
function Kn(e) {
  const n = Math.floor((Date.now() - new Date(e).getTime()) / 6e4);
  if (n < 1) return "только что";
  if (n < 60) return `${n} мин назад`;
  const r = Math.floor(n / 60);
  if (r < 24) return `${r} ч назад`;
  const s = Math.floor(r / 24);
  return s === 1 ? "вчера" : s < 7 ? `${s} дн назад` : `${Math.floor(s / 7)} нед назад`;
}
function qn(e) {
  var r, s;
  return e.title.toLowerCase().includes("transcript") ||
    ((r = e.type) == null ? void 0 : r.toLowerCase()) === "transcript"
    ? "🎤"
    : (s = e.tags) != null && s.includes("restricted")
      ? "🔒"
      : "📄";
}
function Bn(e) {
  var n, r;
  return (n = e.tags) != null && n.includes("public")
    ? "публичный"
    : (r = e.tags) != null && r.includes("restricted")
      ? "ограниченный"
      : "команда";
}
function Qn(e) {
  return (
    {
      dashboard: "Дашборд",
      documents: "Документы",
      mail: "Почта",
      calendar: "Календарь",
      audit: "Журнал аудита",
      settings: "Настройки",
      all_docs: "Документы",
      recent: "Недавние",
      pinned: "Закрепленные",
      shared: "Доступные мне",
      contracts: "Контракты",
      memos: "Заметки",
      reports: "Отчеты",
      transcripts: "Транскрипты",
      acl: "ACL",
    }[e] ?? e
  );
}
function q(e) {
  const n = e.toLowerCase();
  return n.includes("failed to fetch")
    ? "Сервис временно недоступен. Проверьте соединение и повторите попытку."
    : n.includes("expected json response")
      ? "Сервис вернул неожиданный ответ. Повторите попытку позже."
      : n.includes("unauthorized")
        ? "Сессия истекла. Войдите снова."
        : e || "Произошла ошибка. Попробуйте еще раз.";
}
function Gn(e) {
  return e
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
function Dt({ name: e, size: n = 26 }) {
  return t.jsx("span", {
    className:
      "inline-flex shrink-0 items-center justify-center rounded-full bg-primary font-bold text-white",
    style: { width: n, height: n, fontSize: n * 0.38 },
    children: Gn(e),
  });
}
function Ye({ status: e }) {
  const n = e.toLowerCase(),
    r = {
      final: "финальный",
      indexed: "проиндексирован",
      review: "на проверке",
      pending: "в ожидании",
      failed: "ошибка",
      draft: "черновик",
    },
    o =
      {
        final: "border-none bg-success text-white",
        indexed: "border-none bg-muted text-white",
        review: "border border-warning bg-transparent text-warning",
        pending: "border border-muted bg-transparent text-muted",
        failed: "border-none bg-danger-soft text-danger",
        draft: "border border-text bg-transparent text-text",
      }[n] ?? "border border-border bg-transparent text-text";
  return t.jsx("span", {
    className: `inline-block whitespace-nowrap rounded-[20px] px-[10px] py-[2px] text-xs font-medium ${o}`,
    children: r[n] ?? n,
  });
}
function $e({ children: e }) {
  return t.jsx("p", {
    className:
      "mb-0.5 mt-[10px] px-[10px] text-[10px] font-bold uppercase tracking-[0.08em] text-muted",
    children: e,
  });
}
function Ue({ children: e, onClick: n, title: r }) {
  return t.jsx("button", {
    onClick: n,
    title: r,
    className:
      "rounded-[20px] border border-border bg-transparent px-[14px] py-[5px] text-[13px] text-text",
    children: e,
  });
}
function Pt({ open: e, onClose: n, initialTitle: r, onSave: s }) {
  const [o, i] = a.useState(r),
    [d, c] = a.useState(!1),
    [x, u] = a.useState("");
  if (
    (a.useEffect(() => {
      e && (i(r), u(""), c(!1));
    }, [e, r]),
    !e)
  )
    return null;
  async function f() {
    const m = o.trim();
    if (!m) {
      u("Заполните имя документа.");
      return;
    }
    (c(!0), u(""));
    try {
      (await s(m), n());
    } catch (g) {
      u(g instanceof Error ? q(g.message) : "Не удалось сохранить");
    } finally {
      c(!1);
    }
  }
  return t.jsx("div", {
    role: "presentation",
    className: "fixed inset-0 z-[200] flex items-center justify-center bg-black/35 p-4",
    onMouseDown: (m) => {
      m.target === m.currentTarget && !d && n();
    },
    children: t.jsxs("div", {
      role: "dialog",
      "aria-modal": "true",
      className:
        "w-full max-w-[420px] rounded-xl border border-border bg-white px-5 py-[18px] shadow-modal",
      onMouseDown: (m) => m.stopPropagation(),
      children: [
        t.jsx("p", {
          className: "mb-[14px] mt-0 text-[15px] font-bold text-text",
          children: "Переименовать",
        }),
        t.jsx("label", {
          className: "mb-1 block text-[11px] font-semibold text-muted",
          children: "Имя документа",
        }),
        t.jsx("input", {
          value: o,
          onChange: (m) => i(m.target.value),
          className:
            "mb-2.5 box-border w-full rounded-[7px] border border-border bg-surface px-[10px] py-2 text-[13px] outline-none",
        }),
        x && t.jsx("p", { className: "mb-2 mt-0 text-xs text-danger", children: x }),
        t.jsxs("div", {
          className: "mt-1.5 flex justify-end gap-2",
          children: [
            t.jsx("button", {
              type: "button",
              disabled: d,
              onClick: () => !d && n(),
              className: be,
              children: "Отмена",
            }),
            t.jsx("button", {
              type: "button",
              disabled: d,
              onClick: () => void f(),
              className: "rounded-md border-0 bg-primary px-3 py-1 text-xs text-white",
              children: d ? "Сохранение…" : "Сохранить",
            }),
          ],
        }),
      ],
    }),
  });
}
function ce(e, n, { checkForDefaultPrevented: r = !0 } = {}) {
  return function (o) {
    if ((e == null || e(o), r === !1 || !o.defaultPrevented)) return n == null ? void 0 : n(o);
  };
}
function xt(e, n) {
  if (typeof e == "function") return e(n);
  e != null && (e.current = n);
}
function kt(...e) {
  return (n) => {
    let r = !1;
    const s = e.map((o) => {
      const i = xt(o, n);
      return (!r && typeof i == "function" && (r = !0), i);
    });
    if (r)
      return () => {
        for (let o = 0; o < s.length; o++) {
          const i = s[o];
          typeof i == "function" ? i() : xt(e[o], null);
        }
      };
  };
}
function me(...e) {
  return a.useCallback(kt(...e), e);
}
function Vn(e, n) {
  const r = a.createContext(n),
    s = (i) => {
      const { children: d, ...c } = i,
        x = a.useMemo(() => c, Object.values(c));
      return t.jsx(r.Provider, { value: x, children: d });
    };
  s.displayName = e + "Provider";
  function o(i) {
    const d = a.useContext(r);
    if (d) return d;
    if (n !== void 0) return n;
    throw new Error(`\`${i}\` must be used within \`${e}\``);
  }
  return [s, o];
}
function Hn(e, n = []) {
  let r = [];
  function s(i, d) {
    const c = a.createContext(d),
      x = r.length;
    r = [...r, d];
    const u = (m) => {
      var w;
      const { scope: g, children: p, ...j } = m,
        h = ((w = g == null ? void 0 : g[e]) == null ? void 0 : w[x]) || c,
        C = a.useMemo(() => j, Object.values(j));
      return t.jsx(h.Provider, { value: C, children: p });
    };
    u.displayName = i + "Provider";
    function f(m, g) {
      var h;
      const p = ((h = g == null ? void 0 : g[e]) == null ? void 0 : h[x]) || c,
        j = a.useContext(p);
      if (j) return j;
      if (d !== void 0) return d;
      throw new Error(`\`${m}\` must be used within \`${i}\``);
    }
    return [u, f];
  }
  const o = () => {
    const i = r.map((d) => a.createContext(d));
    return function (c) {
      const x = (c == null ? void 0 : c[e]) || i;
      return a.useMemo(() => ({ [`__scope${e}`]: { ...c, [e]: x } }), [c, x]);
    };
  };
  return ((o.scopeName = e), [s, Xn(o, ...n)]);
}
function Xn(...e) {
  const n = e[0];
  if (e.length === 1) return n;
  const r = () => {
    const s = e.map((o) => ({ useScope: o(), scopeName: o.scopeName }));
    return function (i) {
      const d = s.reduce((c, { useScope: x, scopeName: u }) => {
        const m = x(i)[`__scope${u}`];
        return { ...c, ...m };
      }, {});
      return a.useMemo(() => ({ [`__scope${n.scopeName}`]: d }), [d]);
    };
  };
  return ((r.scopeName = n.scopeName), r);
}
var he = globalThis != null && globalThis.document ? a.useLayoutEffect : () => {},
  Jn = Et[" useId ".trim().toString()] || (() => {}),
  Yn = 0;
function We(e) {
  const [n, r] = a.useState(Jn());
  return (
    he(() => {
      r((s) => s ?? String(Yn++));
    }, [e]),
    e || (n ? `radix-${n}` : "")
  );
}
var Zn = Et[" useInsertionEffect ".trim().toString()] || he;
function er({ prop: e, defaultProp: n, onChange: r = () => {}, caller: s }) {
  const [o, i, d] = tr({ defaultProp: n, onChange: r }),
    c = e !== void 0,
    x = c ? e : o;
  {
    const f = a.useRef(e !== void 0);
    a.useEffect(() => {
      const m = f.current;
      if (m !== c) {
        const g = m ? "controlled" : "uncontrolled",
          p = c ? "controlled" : "uncontrolled";
      }
      f.current = c;
    }, [c, s]);
  }
  const u = a.useCallback(
    (f) => {
      var m;
      if (c) {
        const g = nr(f) ? f(e) : f;
        g !== e && ((m = d.current) == null || m.call(d, g));
      } else i(f);
    },
    [c, e, i, d],
  );
  return [x, u];
}
function tr({ defaultProp: e, onChange: n }) {
  const [r, s] = a.useState(e),
    o = a.useRef(r),
    i = a.useRef(n);
  return (
    Zn(() => {
      i.current = n;
    }, [n]),
    a.useEffect(() => {
      var d;
      o.current !== r && ((d = i.current) == null || d.call(i, r), (o.current = r));
    }, [r, o]),
    [r, s, i]
  );
}
function nr(e) {
  return typeof e == "function";
}
function It(e) {
  const n = rr(e),
    r = a.forwardRef((s, o) => {
      const { children: i, ...d } = s,
        c = a.Children.toArray(i),
        x = c.find(ar);
      if (x) {
        const u = x.props.children,
          f = c.map((m) =>
            m === x
              ? a.Children.count(u) > 1
                ? a.Children.only(null)
                : a.isValidElement(u)
                  ? u.props.children
                  : null
              : m,
          );
        return t.jsx(n, {
          ...d,
          ref: o,
          children: a.isValidElement(u) ? a.cloneElement(u, void 0, f) : null,
        });
      }
      return t.jsx(n, { ...d, ref: o, children: i });
    });
  return ((r.displayName = `${e}.Slot`), r);
}
function rr(e) {
  const n = a.forwardRef((r, s) => {
    const { children: o, ...i } = r;
    if (a.isValidElement(o)) {
      const d = ir(o),
        c = or(i, o.props);
      return (o.type !== a.Fragment && (c.ref = s ? kt(s, d) : d), a.cloneElement(o, c));
    }
    return a.Children.count(o) > 1 ? a.Children.only(null) : null;
  });
  return ((n.displayName = `${e}.SlotClone`), n);
}
var sr = Symbol("radix.slottable");
function ar(e) {
  return (
    a.isValidElement(e) &&
    typeof e.type == "function" &&
    "__radixId" in e.type &&
    e.type.__radixId === sr
  );
}
function or(e, n) {
  const r = { ...n };
  for (const s in n) {
    const o = e[s],
      i = n[s];
    /^on[A-Z]/.test(s)
      ? o && i
        ? (r[s] = (...c) => {
            const x = i(...c);
            return (o(...c), x);
          })
        : o && (r[s] = o)
      : s === "style"
        ? (r[s] = { ...o, ...i })
        : s === "className" && (r[s] = [o, i].filter(Boolean).join(" "));
  }
  return { ...e, ...r };
}
function ir(e) {
  var s, o;
  let n = (s = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : s.get,
    r = n && "isReactWarning" in n && n.isReactWarning;
  return r
    ? e.ref
    : ((n = (o = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : o.get),
      (r = n && "isReactWarning" in n && n.isReactWarning),
      r ? e.props.ref : e.props.ref || e.ref);
}
var cr = [
    "a",
    "button",
    "div",
    "form",
    "h2",
    "h3",
    "img",
    "input",
    "label",
    "li",
    "nav",
    "ol",
    "p",
    "select",
    "span",
    "svg",
    "ul",
  ],
  se = cr.reduce((e, n) => {
    const r = It(`Primitive.${n}`),
      s = a.forwardRef((o, i) => {
        const { asChild: d, ...c } = o,
          x = d ? r : n;
        return (
          typeof window < "u" && (window[Symbol.for("radix-ui")] = !0),
          t.jsx(x, { ...c, ref: i })
        );
      });
    return ((s.displayName = `Primitive.${n}`), { ...e, [n]: s });
  }, {});
function lr(e, n) {
  e && ln.flushSync(() => e.dispatchEvent(n));
}
function ge(e) {
  const n = a.useRef(e);
  return (
    a.useEffect(() => {
      n.current = e;
    }),
    a.useMemo(
      () =>
        (...r) => {
          var s;
          return (s = n.current) == null ? void 0 : s.call(n, ...r);
        },
      [],
    )
  );
}
function dr(e, n = globalThis == null ? void 0 : globalThis.document) {
  const r = ge(e);
  a.useEffect(() => {
    const s = (o) => {
      o.key === "Escape" && r(o);
    };
    return (
      n.addEventListener("keydown", s, { capture: !0 }),
      () => n.removeEventListener("keydown", s, { capture: !0 })
    );
  }, [r, n]);
}
var ur = "DismissableLayer",
  Ve = "dismissableLayer.update",
  mr = "dismissableLayer.pointerDownOutside",
  xr = "dismissableLayer.focusOutside",
  ft,
  Tt = a.createContext({
    layers: new Set(),
    layersWithOutsidePointerEventsDisabled: new Set(),
    branches: new Set(),
  }),
  Ot = a.forwardRef((e, n) => {
    const {
        disableOutsidePointerEvents: r = !1,
        onEscapeKeyDown: s,
        onPointerDownOutside: o,
        onFocusOutside: i,
        onInteractOutside: d,
        onDismiss: c,
        ...x
      } = e,
      u = a.useContext(Tt),
      [f, m] = a.useState(null),
      g =
        (f == null ? void 0 : f.ownerDocument) ??
        (globalThis == null ? void 0 : globalThis.document),
      [, p] = a.useState({}),
      j = me(n, (P) => m(P)),
      h = Array.from(u.layers),
      [C] = [...u.layersWithOutsidePointerEventsDisabled].slice(-1),
      w = h.indexOf(C),
      N = f ? h.indexOf(f) : -1,
      v = u.layersWithOutsidePointerEventsDisabled.size > 0,
      T = N >= w,
      O = br((P) => {
        const L = P.target,
          W = [...u.branches].some((F) => F.contains(L));
        !T || W || (o == null || o(P), d == null || d(P), P.defaultPrevented || c == null || c());
      }, g),
      M = hr((P) => {
        const L = P.target;
        [...u.branches].some((F) => F.contains(L)) ||
          (i == null || i(P), d == null || d(P), P.defaultPrevented || c == null || c());
      }, g);
    return (
      dr((P) => {
        N === u.layers.size - 1 &&
          (s == null || s(P), !P.defaultPrevented && c && (P.preventDefault(), c()));
      }, g),
      a.useEffect(() => {
        if (f)
          return (
            r &&
              (u.layersWithOutsidePointerEventsDisabled.size === 0 &&
                ((ft = g.body.style.pointerEvents), (g.body.style.pointerEvents = "none")),
              u.layersWithOutsidePointerEventsDisabled.add(f)),
            u.layers.add(f),
            pt(),
            () => {
              r &&
                u.layersWithOutsidePointerEventsDisabled.size === 1 &&
                (g.body.style.pointerEvents = ft);
            }
          );
      }, [f, g, r, u]),
      a.useEffect(
        () => () => {
          f && (u.layers.delete(f), u.layersWithOutsidePointerEventsDisabled.delete(f), pt());
        },
        [f, u],
      ),
      a.useEffect(() => {
        const P = () => p({});
        return (document.addEventListener(Ve, P), () => document.removeEventListener(Ve, P));
      }, []),
      t.jsx(se.div, {
        ...x,
        ref: j,
        style: { pointerEvents: v ? (T ? "auto" : "none") : void 0, ...e.style },
        onFocusCapture: ce(e.onFocusCapture, M.onFocusCapture),
        onBlurCapture: ce(e.onBlurCapture, M.onBlurCapture),
        onPointerDownCapture: ce(e.onPointerDownCapture, O.onPointerDownCapture),
      })
    );
  });
Ot.displayName = ur;
var fr = "DismissableLayerBranch",
  pr = a.forwardRef((e, n) => {
    const r = a.useContext(Tt),
      s = a.useRef(null),
      o = me(n, s);
    return (
      a.useEffect(() => {
        const i = s.current;
        if (i)
          return (
            r.branches.add(i),
            () => {
              r.branches.delete(i);
            }
          );
      }, [r.branches]),
      t.jsx(se.div, { ...e, ref: o })
    );
  });
pr.displayName = fr;
function br(e, n = globalThis == null ? void 0 : globalThis.document) {
  const r = ge(e),
    s = a.useRef(!1),
    o = a.useRef(() => {});
  return (
    a.useEffect(() => {
      const i = (c) => {
          if (c.target && !s.current) {
            let x = function () {
              Mt(mr, r, u, { discrete: !0 });
            };
            const u = { originalEvent: c };
            c.pointerType === "touch"
              ? (n.removeEventListener("click", o.current),
                (o.current = x),
                n.addEventListener("click", o.current, { once: !0 }))
              : x();
          } else n.removeEventListener("click", o.current);
          s.current = !1;
        },
        d = window.setTimeout(() => {
          n.addEventListener("pointerdown", i);
        }, 0);
      return () => {
        (window.clearTimeout(d),
          n.removeEventListener("pointerdown", i),
          n.removeEventListener("click", o.current));
      };
    }, [n, r]),
    { onPointerDownCapture: () => (s.current = !0) }
  );
}
function hr(e, n = globalThis == null ? void 0 : globalThis.document) {
  const r = ge(e),
    s = a.useRef(!1);
  return (
    a.useEffect(() => {
      const o = (i) => {
        i.target && !s.current && Mt(xr, r, { originalEvent: i }, { discrete: !1 });
      };
      return (n.addEventListener("focusin", o), () => n.removeEventListener("focusin", o));
    }, [n, r]),
    { onFocusCapture: () => (s.current = !0), onBlurCapture: () => (s.current = !1) }
  );
}
function pt() {
  const e = new CustomEvent(Ve);
  document.dispatchEvent(e);
}
function Mt(e, n, r, { discrete: s }) {
  const o = r.originalEvent.target,
    i = new CustomEvent(e, { bubbles: !1, cancelable: !0, detail: r });
  (n && o.addEventListener(e, n, { once: !0 }), s ? lr(o, i) : o.dispatchEvent(i));
}
var ze = "focusScope.autoFocusOnMount",
  Ke = "focusScope.autoFocusOnUnmount",
  bt = { bubbles: !1, cancelable: !0 },
  gr = "FocusScope",
  Rt = a.forwardRef((e, n) => {
    const { loop: r = !1, trapped: s = !1, onMountAutoFocus: o, onUnmountAutoFocus: i, ...d } = e,
      [c, x] = a.useState(null),
      u = ge(o),
      f = ge(i),
      m = a.useRef(null),
      g = me(n, (h) => x(h)),
      p = a.useRef({
        paused: !1,
        pause() {
          this.paused = !0;
        },
        resume() {
          this.paused = !1;
        },
      }).current;
    (a.useEffect(() => {
      if (s) {
        let h = function (v) {
            if (p.paused || !c) return;
            const T = v.target;
            c.contains(T) ? (m.current = T) : oe(m.current, { select: !0 });
          },
          C = function (v) {
            if (p.paused || !c) return;
            const T = v.relatedTarget;
            T !== null && (c.contains(T) || oe(m.current, { select: !0 }));
          },
          w = function (v) {
            if (document.activeElement === document.body)
              for (const O of v) O.removedNodes.length > 0 && oe(c);
          };
        (document.addEventListener("focusin", h), document.addEventListener("focusout", C));
        const N = new MutationObserver(w);
        return (
          c && N.observe(c, { childList: !0, subtree: !0 }),
          () => {
            (document.removeEventListener("focusin", h),
              document.removeEventListener("focusout", C),
              N.disconnect());
          }
        );
      }
    }, [s, c, p.paused]),
      a.useEffect(() => {
        if (c) {
          gt.add(p);
          const h = document.activeElement;
          if (!c.contains(h)) {
            const w = new CustomEvent(ze, bt);
            (c.addEventListener(ze, u),
              c.dispatchEvent(w),
              w.defaultPrevented ||
                (yr(Er(Lt(c)), { select: !0 }), document.activeElement === h && oe(c)));
          }
          return () => {
            (c.removeEventListener(ze, u),
              setTimeout(() => {
                const w = new CustomEvent(Ke, bt);
                (c.addEventListener(Ke, f),
                  c.dispatchEvent(w),
                  w.defaultPrevented || oe(h ?? document.body, { select: !0 }),
                  c.removeEventListener(Ke, f),
                  gt.remove(p));
              }, 0));
          };
        }
      }, [c, u, f, p]));
    const j = a.useCallback(
      (h) => {
        if ((!r && !s) || p.paused) return;
        const C = h.key === "Tab" && !h.altKey && !h.ctrlKey && !h.metaKey,
          w = document.activeElement;
        if (C && w) {
          const N = h.currentTarget,
            [v, T] = vr(N);
          v && T
            ? !h.shiftKey && w === T
              ? (h.preventDefault(), r && oe(v, { select: !0 }))
              : h.shiftKey && w === v && (h.preventDefault(), r && oe(T, { select: !0 }))
            : w === N && h.preventDefault();
        }
      },
      [r, s, p.paused],
    );
    return t.jsx(se.div, { tabIndex: -1, ...d, ref: g, onKeyDown: j });
  });
Rt.displayName = gr;
function yr(e, { select: n = !1 } = {}) {
  const r = document.activeElement;
  for (const s of e) if ((oe(s, { select: n }), document.activeElement !== r)) return;
}
function vr(e) {
  const n = Lt(e),
    r = ht(n, e),
    s = ht(n.reverse(), e);
  return [r, s];
}
function Lt(e) {
  const n = [],
    r = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT, {
      acceptNode: (s) => {
        const o = s.tagName === "INPUT" && s.type === "hidden";
        return s.disabled || s.hidden || o
          ? NodeFilter.FILTER_SKIP
          : s.tabIndex >= 0
            ? NodeFilter.FILTER_ACCEPT
            : NodeFilter.FILTER_SKIP;
      },
    });
  for (; r.nextNode(); ) n.push(r.currentNode);
  return n;
}
function ht(e, n) {
  for (const r of e) if (!wr(r, { upTo: n })) return r;
}
function wr(e, { upTo: n }) {
  if (getComputedStyle(e).visibility === "hidden") return !0;
  for (; e; ) {
    if (n !== void 0 && e === n) return !1;
    if (getComputedStyle(e).display === "none") return !0;
    e = e.parentElement;
  }
  return !1;
}
function jr(e) {
  return e instanceof HTMLInputElement && "select" in e;
}
function oe(e, { select: n = !1 } = {}) {
  if (e && e.focus) {
    const r = document.activeElement;
    (e.focus({ preventScroll: !0 }), e !== r && jr(e) && n && e.select());
  }
}
var gt = Nr();
function Nr() {
  let e = [];
  return {
    add(n) {
      const r = e[0];
      (n !== r && (r == null || r.pause()), (e = yt(e, n)), e.unshift(n));
    },
    remove(n) {
      var r;
      ((e = yt(e, n)), (r = e[0]) == null || r.resume());
    },
  };
}
function yt(e, n) {
  const r = [...e],
    s = r.indexOf(n);
  return (s !== -1 && r.splice(s, 1), r);
}
function Er(e) {
  return e.filter((n) => n.tagName !== "A");
}
var Cr = "Portal",
  Ft = a.forwardRef((e, n) => {
    var c;
    const { container: r, ...s } = e,
      [o, i] = a.useState(!1);
    he(() => i(!0), []);
    const d =
      r ||
      (o && ((c = globalThis == null ? void 0 : globalThis.document) == null ? void 0 : c.body));
    return d ? dn.createPortal(t.jsx(se.div, { ...s, ref: n }), d) : null;
  });
Ft.displayName = Cr;
function Sr(e, n) {
  return a.useReducer((r, s) => n[r][s] ?? r, e);
}
var Te = (e) => {
  const { present: n, children: r } = e,
    s = Ar(n),
    o = typeof r == "function" ? r({ present: s.isPresent }) : a.Children.only(r),
    i = me(s.ref, Dr(o));
  return typeof r == "function" || s.isPresent ? a.cloneElement(o, { ref: i }) : null;
};
Te.displayName = "Presence";
function Ar(e) {
  const [n, r] = a.useState(),
    s = a.useRef(null),
    o = a.useRef(e),
    i = a.useRef("none"),
    d = e ? "mounted" : "unmounted",
    [c, x] = Sr(d, {
      mounted: { UNMOUNT: "unmounted", ANIMATION_OUT: "unmountSuspended" },
      unmountSuspended: { MOUNT: "mounted", ANIMATION_END: "unmounted" },
      unmounted: { MOUNT: "mounted" },
    });
  return (
    a.useEffect(() => {
      const u = Ee(s.current);
      i.current = c === "mounted" ? u : "none";
    }, [c]),
    he(() => {
      const u = s.current,
        f = o.current;
      if (f !== e) {
        const g = i.current,
          p = Ee(u);
        (e
          ? x("MOUNT")
          : p === "none" || (u == null ? void 0 : u.display) === "none"
            ? x("UNMOUNT")
            : x(f && g !== p ? "ANIMATION_OUT" : "UNMOUNT"),
          (o.current = e));
      }
    }, [e, x]),
    he(() => {
      if (n) {
        let u;
        const f = n.ownerDocument.defaultView ?? window,
          m = (p) => {
            const h = Ee(s.current).includes(CSS.escape(p.animationName));
            if (p.target === n && h && (x("ANIMATION_END"), !o.current)) {
              const C = n.style.animationFillMode;
              ((n.style.animationFillMode = "forwards"),
                (u = f.setTimeout(() => {
                  n.style.animationFillMode === "forwards" && (n.style.animationFillMode = C);
                })));
            }
          },
          g = (p) => {
            p.target === n && (i.current = Ee(s.current));
          };
        return (
          n.addEventListener("animationstart", g),
          n.addEventListener("animationcancel", m),
          n.addEventListener("animationend", m),
          () => {
            (f.clearTimeout(u),
              n.removeEventListener("animationstart", g),
              n.removeEventListener("animationcancel", m),
              n.removeEventListener("animationend", m));
          }
        );
      } else x("ANIMATION_END");
    }, [n, x]),
    {
      isPresent: ["mounted", "unmountSuspended"].includes(c),
      ref: a.useCallback((u) => {
        ((s.current = u ? getComputedStyle(u) : null), r(u));
      }, []),
    }
  );
}
function Ee(e) {
  return (e == null ? void 0 : e.animationName) || "none";
}
function Dr(e) {
  var s, o;
  let n = (s = Object.getOwnPropertyDescriptor(e.props, "ref")) == null ? void 0 : s.get,
    r = n && "isReactWarning" in n && n.isReactWarning;
  return r
    ? e.ref
    : ((n = (o = Object.getOwnPropertyDescriptor(e, "ref")) == null ? void 0 : o.get),
      (r = n && "isReactWarning" in n && n.isReactWarning),
      r ? e.props.ref : e.props.ref || e.ref);
}
var qe = 0;
function Pr() {
  a.useEffect(() => {
    const e = document.querySelectorAll("[data-radix-focus-guard]");
    return (
      document.body.insertAdjacentElement("afterbegin", e[0] ?? vt()),
      document.body.insertAdjacentElement("beforeend", e[1] ?? vt()),
      qe++,
      () => {
        (qe === 1 &&
          document.querySelectorAll("[data-radix-focus-guard]").forEach((n) => n.remove()),
          qe--);
      }
    );
  }, []);
}
function vt() {
  const e = document.createElement("span");
  return (
    e.setAttribute("data-radix-focus-guard", ""),
    (e.tabIndex = 0),
    (e.style.outline = "none"),
    (e.style.opacity = "0"),
    (e.style.position = "fixed"),
    (e.style.pointerEvents = "none"),
    e
  );
}
var kr = function (e) {
    if (typeof document > "u") return null;
    var n = Array.isArray(e) ? e[0] : e;
    return n.ownerDocument.body;
  },
  fe = new WeakMap(),
  Ce = new WeakMap(),
  Se = {},
  Be = 0,
  _t = function (e) {
    return e && (e.host || _t(e.parentNode));
  },
  Ir = function (e, n) {
    return n
      .map(function (r) {
        if (e.contains(r)) return r;
        var s = _t(r);
        return s && e.contains(s) ? s : null;
      })
      .filter(function (r) {
        return !!r;
      });
  },
  Tr = function (e, n, r, s) {
    var o = Ir(n, Array.isArray(e) ? e : [e]);
    Se[r] || (Se[r] = new WeakMap());
    var i = Se[r],
      d = [],
      c = new Set(),
      x = new Set(o),
      u = function (m) {
        !m || c.has(m) || (c.add(m), u(m.parentNode));
      };
    o.forEach(u);
    var f = function (m) {
      !m ||
        x.has(m) ||
        Array.prototype.forEach.call(m.children, function (g) {
          if (c.has(g)) f(g);
          else
            try {
              var p = g.getAttribute(s),
                j = p !== null && p !== "false",
                h = (fe.get(g) || 0) + 1,
                C = (i.get(g) || 0) + 1;
              (fe.set(g, h),
                i.set(g, C),
                d.push(g),
                h === 1 && j && Ce.set(g, !0),
                C === 1 && g.setAttribute(r, "true"),
                j || g.setAttribute(s, "true"));
            } catch {}
        });
    };
    return (
      f(n),
      c.clear(),
      Be++,
      function () {
        (d.forEach(function (m) {
          var g = fe.get(m) - 1,
            p = i.get(m) - 1;
          (fe.set(m, g),
            i.set(m, p),
            g || (Ce.has(m) || m.removeAttribute(s), Ce.delete(m)),
            p || m.removeAttribute(r));
        }),
          Be--,
          Be || ((fe = new WeakMap()), (fe = new WeakMap()), (Ce = new WeakMap()), (Se = {})));
      }
    );
  },
  Or = function (e, n, r) {
    r === void 0 && (r = "data-aria-hidden");
    var s = Array.from(Array.isArray(e) ? e : [e]),
      o = kr(e);
    return o
      ? (s.push.apply(s, Array.from(o.querySelectorAll("[aria-live], script"))),
        Tr(s, o, r, "aria-hidden"))
      : function () {
          return null;
        };
  },
  Oe = "Dialog",
  [$t] = Hn(Oe),
  [Mr, Y] = $t(Oe),
  Ut = (e) => {
    const {
        __scopeDialog: n,
        children: r,
        open: s,
        defaultOpen: o,
        onOpenChange: i,
        modal: d = !0,
      } = e,
      c = a.useRef(null),
      x = a.useRef(null),
      [u, f] = er({ prop: s, defaultProp: o ?? !1, onChange: i, caller: Oe });
    return t.jsx(Mr, {
      scope: n,
      triggerRef: c,
      contentRef: x,
      contentId: We(),
      titleId: We(),
      descriptionId: We(),
      open: u,
      onOpenChange: f,
      onOpenToggle: a.useCallback(() => f((m) => !m), [f]),
      modal: d,
      children: r,
    });
  };
Ut.displayName = Oe;
var Wt = "DialogTrigger",
  Rr = a.forwardRef((e, n) => {
    const { __scopeDialog: r, ...s } = e,
      o = Y(Wt, r),
      i = me(n, o.triggerRef);
    return t.jsx(se.button, {
      type: "button",
      "aria-haspopup": "dialog",
      "aria-expanded": o.open,
      "aria-controls": o.contentId,
      "data-state": tt(o.open),
      ...s,
      ref: i,
      onClick: ce(e.onClick, o.onOpenToggle),
    });
  });
Rr.displayName = Wt;
var Ze = "DialogPortal",
  [Lr, zt] = $t(Ze, { forceMount: void 0 }),
  Kt = (e) => {
    const { __scopeDialog: n, forceMount: r, children: s, container: o } = e,
      i = Y(Ze, n);
    return t.jsx(Lr, {
      scope: n,
      forceMount: r,
      children: a.Children.map(s, (d) =>
        t.jsx(Te, {
          present: r || i.open,
          children: t.jsx(Ft, { asChild: !0, container: o, children: d }),
        }),
      ),
    });
  };
Kt.displayName = Ze;
var ke = "DialogOverlay",
  qt = a.forwardRef((e, n) => {
    const r = zt(ke, e.__scopeDialog),
      { forceMount: s = r.forceMount, ...o } = e,
      i = Y(ke, e.__scopeDialog);
    return i.modal
      ? t.jsx(Te, { present: s || i.open, children: t.jsx(_r, { ...o, ref: n }) })
      : null;
  });
qt.displayName = ke;
var Fr = It("DialogOverlay.RemoveScroll"),
  _r = a.forwardRef((e, n) => {
    const { __scopeDialog: r, ...s } = e,
      o = Y(ke, r);
    return t.jsx(un, {
      as: Fr,
      allowPinchZoom: !0,
      shards: [o.contentRef],
      children: t.jsx(se.div, {
        "data-state": tt(o.open),
        ...s,
        ref: n,
        style: { pointerEvents: "auto", ...s.style },
      }),
    });
  }),
  ue = "DialogContent",
  Bt = a.forwardRef((e, n) => {
    const r = zt(ue, e.__scopeDialog),
      { forceMount: s = r.forceMount, ...o } = e,
      i = Y(ue, e.__scopeDialog);
    return t.jsx(Te, {
      present: s || i.open,
      children: i.modal ? t.jsx($r, { ...o, ref: n }) : t.jsx(Ur, { ...o, ref: n }),
    });
  });
Bt.displayName = ue;
var $r = a.forwardRef((e, n) => {
    const r = Y(ue, e.__scopeDialog),
      s = a.useRef(null),
      o = me(n, r.contentRef, s);
    return (
      a.useEffect(() => {
        const i = s.current;
        if (i) return Or(i);
      }, []),
      t.jsx(Qt, {
        ...e,
        ref: o,
        trapFocus: r.open,
        disableOutsidePointerEvents: !0,
        onCloseAutoFocus: ce(e.onCloseAutoFocus, (i) => {
          var d;
          (i.preventDefault(), (d = r.triggerRef.current) == null || d.focus());
        }),
        onPointerDownOutside: ce(e.onPointerDownOutside, (i) => {
          const d = i.detail.originalEvent,
            c = d.button === 0 && d.ctrlKey === !0;
          (d.button === 2 || c) && i.preventDefault();
        }),
        onFocusOutside: ce(e.onFocusOutside, (i) => i.preventDefault()),
      })
    );
  }),
  Ur = a.forwardRef((e, n) => {
    const r = Y(ue, e.__scopeDialog),
      s = a.useRef(!1),
      o = a.useRef(!1);
    return t.jsx(Qt, {
      ...e,
      ref: n,
      trapFocus: !1,
      disableOutsidePointerEvents: !1,
      onCloseAutoFocus: (i) => {
        var d, c;
        ((d = e.onCloseAutoFocus) == null || d.call(e, i),
          i.defaultPrevented ||
            (s.current || (c = r.triggerRef.current) == null || c.focus(), i.preventDefault()),
          (s.current = !1),
          (o.current = !1));
      },
      onInteractOutside: (i) => {
        var x, u;
        ((x = e.onInteractOutside) == null || x.call(e, i),
          i.defaultPrevented ||
            ((s.current = !0), i.detail.originalEvent.type === "pointerdown" && (o.current = !0)));
        const d = i.target;
        (((u = r.triggerRef.current) == null ? void 0 : u.contains(d)) && i.preventDefault(),
          i.detail.originalEvent.type === "focusin" && o.current && i.preventDefault());
      },
    });
  }),
  Qt = a.forwardRef((e, n) => {
    const { __scopeDialog: r, trapFocus: s, onOpenAutoFocus: o, onCloseAutoFocus: i, ...d } = e,
      c = Y(ue, r),
      x = a.useRef(null),
      u = me(n, x);
    return (
      Pr(),
      t.jsxs(t.Fragment, {
        children: [
          t.jsx(Rt, {
            asChild: !0,
            loop: !0,
            trapped: s,
            onMountAutoFocus: o,
            onUnmountAutoFocus: i,
            children: t.jsx(Ot, {
              role: "dialog",
              id: c.contentId,
              "aria-describedby": c.descriptionId,
              "aria-labelledby": c.titleId,
              "data-state": tt(c.open),
              ...d,
              ref: u,
              onDismiss: () => c.onOpenChange(!1),
            }),
          }),
          t.jsxs(t.Fragment, {
            children: [
              t.jsx(Wr, { titleId: c.titleId }),
              t.jsx(Kr, { contentRef: x, descriptionId: c.descriptionId }),
            ],
          }),
        ],
      })
    );
  }),
  et = "DialogTitle",
  Gt = a.forwardRef((e, n) => {
    const { __scopeDialog: r, ...s } = e,
      o = Y(et, r);
    return t.jsx(se.h2, { id: o.titleId, ...s, ref: n });
  });
Gt.displayName = et;
var Vt = "DialogDescription",
  Ht = a.forwardRef((e, n) => {
    const { __scopeDialog: r, ...s } = e,
      o = Y(Vt, r);
    return t.jsx(se.p, { id: o.descriptionId, ...s, ref: n });
  });
Ht.displayName = Vt;
var Xt = "DialogClose",
  Jt = a.forwardRef((e, n) => {
    const { __scopeDialog: r, ...s } = e,
      o = Y(Xt, r);
    return t.jsx(se.button, {
      type: "button",
      ...s,
      ref: n,
      onClick: ce(e.onClick, () => o.onOpenChange(!1)),
    });
  });
Jt.displayName = Xt;
function tt(e) {
  return e ? "open" : "closed";
}
var Yt = "DialogTitleWarning",
  [bs, Zt] = Vn(Yt, { contentName: ue, titleName: et, docsSlug: "dialog" }),
  Wr = ({ titleId: e }) => {
    const n = Zt(Yt),
      r = `\`${n.contentName}\` requires a \`${n.titleName}\` for the component to be accessible for screen reader users.

If you want to hide the \`${n.titleName}\`, you can wrap it with our VisuallyHidden component.

For more information, see https://radix-ui.com/primitives/docs/components/${n.docsSlug}`;
    return (
      a.useEffect(() => {
        if (e) {
          const s = document.getElementById(e);
        }
      }, [r, e]),
      null
    );
  },
  zr = "DialogDescriptionWarning",
  Kr = ({ contentRef: e, descriptionId: n }) => {
    const s = `Warning: Missing \`Description\` or \`aria-describedby={undefined}\` for {${Zt(zr).contentName}}.`;
    return (
      a.useEffect(() => {
        var i;
        const o = (i = e.current) == null ? void 0 : i.getAttribute("aria-describedby");
        if (n && o) {
          const d = document.getElementById(n);
        }
      }, [s, e, n]),
      null
    );
  },
  qr = Ut,
  Br = Kt,
  Qr = qt,
  Gr = Bt,
  Vr = Gt,
  Hr = Ht,
  Xr = Jt;
function nt({
  open: e,
  onOpenChange: n,
  onConfirm: r,
  title: s,
  description: o,
  confirmText: i = "Подтвердить",
  cancelText: d = "Отмена",
  pending: c = !1,
}) {
  return t.jsx(qr, {
    open: e,
    onOpenChange: n,
    children: t.jsxs(Br, {
      children: [
        t.jsx(Qr, { className: "fixed inset-0 z-40 bg-black/45" }),
        t.jsxs(Gr, {
          className:
            "fixed left-1/2 top-1/2 z-50 w-[min(92vw,460px)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-white p-5 shadow-menu",
          children: [
            t.jsx(Vr, { className: "m-0 text-base font-semibold text-text", children: s }),
            o ? t.jsx(Hr, { className: "mt-2 text-sm text-muted", children: o }) : null,
            t.jsxs("div", {
              className: "mt-5 flex justify-end gap-2",
              children: [
                t.jsx(Xr, {
                  asChild: !0,
                  children: t.jsx("button", {
                    type: "button",
                    disabled: c,
                    className:
                      "rounded-md border border-border bg-white px-3 py-1.5 text-xs text-text disabled:cursor-not-allowed disabled:opacity-60",
                    children: d,
                  }),
                }),
                t.jsx("button", {
                  type: "button",
                  onClick: () => void r(),
                  disabled: c,
                  className:
                    "rounded-md border border-danger/40 bg-danger px-3 py-1.5 text-xs text-white disabled:cursor-not-allowed disabled:opacity-60",
                  children: c ? "Выполняется..." : i,
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  });
}
function Ae(e) {
  return Array.isArray(e)
    ? e.join(", ")
    : e == null
      ? "—"
      : typeof e == "object"
        ? JSON.stringify(e)
        : String(e);
}
function Jr(e, n) {
  if (e === "send_email") {
    const r = n;
    return [
      { label: "Кому", value: r.to },
      { label: "Тема", value: r.subject },
      { label: "Текст", value: r.body },
    ];
  }
  if (e === "create_calendar_event") {
    const r = n;
    return [
      { label: "Событие", value: r.title },
      { label: "Участники", value: r.attendees },
      { label: "Начало", value: r.startIso },
      { label: "Окончание", value: r.endIso },
    ];
  }
  if (e === "update_document_tags") {
    const r = n;
    return [
      { label: "Документ", value: r.documentId },
      { label: "Теги", value: r.tags },
    ];
  }
  return Object.entries(n).map(([r, s]) => ({ label: r, value: s }));
}
function Yr({ id: e, intent: n, status: r, entities: s, onSessionExpired: o, onTokenRefresh: i }) {
  var B;
  const d = ye(),
    [c, x] = a.useState(r),
    [u, f] = a.useState(!1),
    [m, g] = a.useState(!1),
    [p, j] = a.useState(""),
    [h, C] = a.useState(null),
    [w, N] = a.useState(!1),
    [v, T] = a.useState("");
  a.useEffect(() => {
    x(r);
  }, [r]);
  const O = n === "update_document_tags" ? s : null,
    M = ((B = O == null ? void 0 : O.documentId) == null ? void 0 : B.trim()) ?? "",
    P = a.useMemo(
      () => [
        ...new Set(((O == null ? void 0 : O.tags) ?? []).map((k) => k.trim()).filter(Boolean)),
      ],
      [O == null ? void 0 : O.tags],
    );
  a.useEffect(() => {
    n !== "update_document_tags" ||
      !M ||
      (N(!0),
      T(""),
      wn(M, o ?? (() => {}), i)
        .then((k) => C(k))
        .catch((k) => {
          const E = k instanceof Error ? k.message : "Не удалось загрузить текущие теги";
          T(E);
        })
        .finally(() => N(!1)));
  }, [M, n, o, i]);
  const L = a.useMemo(() => {
    if (!h) return null;
    const k = [...new Set(h.map((_) => _.trim()).filter(Boolean))],
      E = new Set(k),
      b = new Set(P),
      D = P.filter((_) => !E.has(_)),
      I = k.filter((_) => !b.has(_)),
      $ = P.filter((_) => E.has(_));
    return { added: D, removed: I, unchanged: $ };
  }, [h, P]);
  async function W() {
    (g(!0), j(""));
    try {
      const k = await jn(e, o ?? (() => {}), i);
      (x(k.status), f(!1), d.success("Действие подтверждено."));
    } catch (k) {
      const E = k instanceof Error ? k.message : "Не удалось подтвердить действие";
      (j(E), d.error(E));
    } finally {
      g(!1);
    }
  }
  const F = Jr(n, s);
  return t.jsxs("div", {
    className: "rounded-lg border border-border bg-white px-[10px] py-2",
    children: [
      t.jsxs("div", {
        className: "mb-2 flex items-center justify-between gap-2",
        children: [
          t.jsxs("p", { className: "m-0 text-[11px] text-muted", children: ["Действие: ", n] }),
          t.jsx(Ye, { status: c }),
        ],
      }),
      t.jsxs("div", {
        className: "grid gap-1.5",
        children: [
          F.map((k) =>
            t.jsxs(
              "div",
              {
                className: "rounded-md bg-surface px-2 py-1.5",
                children: [
                  t.jsx("p", {
                    className: "m-0 text-[10px] uppercase tracking-[0.06em] text-muted",
                    children: k.label,
                  }),
                  t.jsx("p", {
                    className: "m-0 break-words text-[12px] text-text",
                    children: Ae(k.value),
                  }),
                ],
              },
              `${e}-${k.label}`,
            ),
          ),
          n === "update_document_tags" &&
            t.jsxs("div", {
              className: "rounded-md border border-border bg-white px-2 py-1.5",
              children: [
                t.jsx("p", {
                  className: "m-0 text-[10px] uppercase tracking-[0.06em] text-muted",
                  children: "Diff тегов",
                }),
                w &&
                  t.jsx("p", {
                    className: "m-0 text-[12px] text-muted",
                    children: "Загрузка текущих тегов…",
                  }),
                !w && v && t.jsx("p", { className: "m-0 text-[12px] text-danger", children: v }),
                !w &&
                  !v &&
                  L &&
                  t.jsxs("div", {
                    className: "grid gap-1",
                    children: [
                      t.jsxs("p", {
                        className: "m-0 text-[12px] text-text",
                        children: ["Добавить: ", Ae(L.added)],
                      }),
                      t.jsxs("p", {
                        className: "m-0 text-[12px] text-text",
                        children: ["Удалить: ", Ae(L.removed)],
                      }),
                      t.jsxs("p", {
                        className: "m-0 text-[12px] text-text",
                        children: ["Оставить: ", Ae(L.unchanged)],
                      }),
                    ],
                  }),
              ],
            }),
          p && t.jsx("p", { className: "m-0 text-[12px] text-danger", children: p }),
        ],
      }),
      c === "DRAFT" &&
        t.jsx("div", {
          className: "mt-2 flex justify-end",
          children: t.jsx("button", {
            type: "button",
            onClick: () => f(!0),
            className:
              "rounded-md border border-primary/40 bg-primary px-3 py-1.5 text-xs text-white",
            children: "Подтвердить",
          }),
        }),
      t.jsx(nt, {
        open: u,
        onOpenChange: f,
        onConfirm: W,
        title: "Подтвердить действие",
        description: "После подтверждения действие перейдет в статус CONFIRMED.",
        confirmText: "Подтвердить",
        cancelText: "Отмена",
        pending: m,
      }),
    ],
  });
}
const wt = 160;
function Zr(e) {
  const n = e.chunkText.trim();
  if (!n) return e.documentTitle;
  const r = n.length > wt ? `${n.slice(0, wt)}…` : n;
  return `${e.documentTitle} — ${r}`;
}
function es({ citation: e, onClick: n }) {
  return t.jsxs("button", {
    type: "button",
    onClick: () => (n == null ? void 0 : n(e)),
    title: Zr(e),
    "aria-label": `Источник ${e.index}: ${e.documentTitle}`,
    className:
      "inline-flex items-center rounded-md border border-border bg-primary-soft px-1.5 py-[2px] text-[11px] font-medium text-primary hover:bg-primary hover:text-white",
    children: ["[", e.index, "]"],
  });
}
function ts({ citation: e, open: n, onClose: r }) {
  return !n || !e
    ? null
    : t.jsx("div", {
        role: "dialog",
        "aria-modal": "true",
        "aria-label": "Превью источника",
        onMouseDown: (s) => {
          s.target === s.currentTarget && r();
        },
        className: "absolute inset-0 z-[6] flex justify-end bg-overlay",
        children: t.jsxs("div", {
          className:
            "box-border flex h-full w-full max-w-[440px] flex-col gap-3 border-l border-border bg-white p-4",
          onMouseDown: (s) => s.stopPropagation(),
          children: [
            t.jsxs("div", {
              className: "flex items-center justify-between",
              children: [
                t.jsxs("div", {
                  children: [
                    t.jsxs("p", {
                      className: "m-0 text-sm font-bold text-text",
                      children: ["Источник [", e.index, "]"],
                    }),
                    t.jsx("p", { className: "m-0 text-xs text-muted", children: e.documentTitle }),
                  ],
                }),
                t.jsx("button", { type: "button", className: be, onClick: r, children: "Закрыть" }),
              ],
            }),
            t.jsxs("div", {
              className: "rounded-lg border border-border bg-surface px-3 py-2",
              children: [
                t.jsx("p", {
                  className: "m-0 text-[11px] uppercase tracking-[0.06em] text-muted",
                  children: "Метаданные",
                }),
                t.jsxs("p", {
                  className: "mb-0 mt-1 text-xs text-text",
                  children: ["Документ: ", e.documentId],
                }),
                t.jsxs("p", {
                  className: "mb-0 mt-1 text-xs text-text",
                  children: ["Чанк: ", e.chunkId],
                }),
                t.jsxs("p", {
                  className: "mb-0 mt-1 text-xs text-text",
                  children: ["Скор: ", e.score.toFixed(3)],
                }),
              ],
            }),
            t.jsxs("div", {
              className:
                "min-h-0 flex-1 overflow-y-auto rounded-lg border border-primary bg-primary-soft p-3",
              children: [
                t.jsx("p", {
                  className: "mb-1 mt-0 text-[11px] uppercase tracking-[0.06em] text-primary",
                  children: "Подсвеченный фрагмент",
                }),
                t.jsx("p", {
                  className:
                    "m-0 whitespace-pre-wrap break-words text-[13px] leading-[1.55] text-text",
                  children: e.chunkText || "Текст фрагмента отсутствует.",
                }),
              ],
            }),
          ],
        }),
      });
}
const ns = ["суммируй 3 последних контракта", 'найди документы с упоминанием "продление Acme"'];
function jt(e) {
  const n = /<\/?[a-z][\s\S]*>/i.test(e),
    r = n ? On.sanitize(e) : e;
  return t.jsx("div", {
    className: "m-0 break-words text-[13px] leading-[1.5] text-text",
    children: t.jsx(mn, {
      rehypePlugins: n ? [Mn] : void 0,
      components: {
        p: ({ children: s }) => t.jsx("p", { className: "mb-2 mt-0 last:mb-0", children: s }),
        ul: ({ children: s }) => t.jsx("ul", { className: "my-2 list-disc pl-5", children: s }),
        ol: ({ children: s }) => t.jsx("ol", { className: "my-2 list-decimal pl-5", children: s }),
        li: ({ children: s }) => t.jsx("li", { className: "my-0.5", children: s }),
        code: ({ children: s }) =>
          t.jsx("code", { className: "rounded bg-surface px-1 py-0.5 text-[12px]", children: s }),
        pre: ({ children: s }) => t.jsx("pre", { className: "my-2 overflow-x-auto", children: s }),
        a: ({ children: s, href: o }) =>
          t.jsx("a", {
            href: o,
            target: "_blank",
            rel: "noopener noreferrer",
            className: "text-primary underline",
            children: s,
          }),
      },
      children: r,
    }),
  });
}
function Nt({
  token: e,
  width: n,
  height: r = "100vh",
  onSessionExpired: s,
  onTokenRefresh: o,
  onClose: i,
}) {
  const d = Z((l) => l.assistantQuery),
    c = Z((l) => l.setAssistantQuery),
    [x, u] = a.useState(d),
    f = Xe(),
    [m, g] = a.useState(""),
    [p, j] = a.useState([]),
    [h, C] = a.useState([]),
    [w, N] = a.useState(""),
    [v, T] = a.useState({}),
    [O, M] = a.useState(-1),
    [P, L] = a.useState(!1),
    [W, F] = a.useState("balanced"),
    [B, k] = a.useState(["documents"]),
    [E, b] = a.useState(!1),
    [D, I] = a.useState(null),
    [$, _] = a.useState(!1),
    A = ye(),
    Q = a.useRef(null),
    S = a.useRef(null),
    z = a.useRef([]),
    V = a.useRef(x),
    le = a.useRef(new Set()),
    te = ie({ queryKey: U.assistant.threads, queryFn: () => An(s, o), enabled: !!e }),
    G = ie({
      queryKey: U.assistant.threadDetail(m),
      queryFn: () => Dn(m, s, o),
      enabled: !!e && !!m,
    }),
    xe = ie({
      queryKey: ["assistant-mention-documents", w],
      queryFn: () => Pn(w, s, o),
      enabled: !!e && w.length > 0,
    }),
    ve = ie({
      queryKey: ["assistant-actions"],
      queryFn: async () => {
        const l = await ee(`${H}/actions`, { method: "GET" }, o),
          y = await pe(l, s);
        return kn.parse(y);
      },
      enabled: !!e,
    }),
    rt = a.useCallback(
      async (l) => {
        if (!l.length) return;
        const y = l.filter((K) => !v[K]);
        if (!y.length) return;
        const R = await Promise.all(y.map((K) => Nn(K, s, o)));
        T((K) => {
          const ae = { ...K };
          for (const J of R) ae[J.id] = J.title;
          return ae;
        });
      },
      [v, s, o],
    );
  (a.useEffect(() => {
    var y;
    const l = te.data ?? [];
    !l.length || m || g(((y = l[0]) == null ? void 0 : y.id) ?? "");
  }, [te.data, m]),
    a.useEffect(() => {
      var l;
      G.data &&
        (j(G.data.linkedDocumentIds ?? []),
        F(G.data.thread.ideologyProfileId ?? "balanced"),
        k(
          (l = G.data.thread.knowledgeSourceIds) != null && l.length
            ? G.data.thread.knowledgeSourceIds
            : ["documents"],
        ));
    }, [G.data]),
    a.useEffect(() => {
      rt(p).catch(() => {});
    }, [rt, p]),
    a.useEffect(() => {
      u(d);
    }, [d]),
    a.useEffect(() => {
      V.current = x;
    }, [x]),
    a.useEffect(() => {
      if (!w) {
        (C([]), M(-1));
        return;
      }
      if (xe.isError) {
        (C([]), M(-1));
        return;
      }
      const l = xe.data ?? [];
      (C(l),
        T((y) => {
          const R = { ...y };
          for (const K of l) R[K.id] = K.title;
          return R;
        }),
        M(l.length ? 0 : -1));
    }, [xe.data, xe.isError, w]),
    a.useEffect(() => {
      const l = (y) => {
        if (y.key === "Escape") {
          if (P) {
            (y.preventDefault(), y.stopPropagation(), L(!1));
            return;
          }
          if (D) {
            (y.preventDefault(), y.stopPropagation(), I(null));
            return;
          }
          i && (y.preventDefault(), i());
        }
      };
      return (
        window.addEventListener("keydown", l, !0),
        () => window.removeEventListener("keydown", l, !0)
      );
    }, [i, D, P]));
  const st = re({
      mutationFn: () => En("Новый диалог", s, o),
      onSuccess: async (l) => {
        (await f.invalidateQueries({ queryKey: U.assistant.threads }), g(l.id));
      },
    }),
    at = re({
      mutationFn: async ({ threadId: l, documentId: y }) => {
        await Cn(l, y, s, o);
      },
      onSuccess: async (l, y) => {
        await f.invalidateQueries({ queryKey: U.assistant.threadDetail(y.threadId) });
      },
    }),
    ot = re({
      mutationFn: async ({ threadId: l, file: y }) => {
        await Sn(l, y, s, o);
      },
      onSuccess: async (l, y) => {
        await f.invalidateQueries({ queryKey: U.assistant.threadDetail(y.threadId) });
      },
    }),
    Me = re({
      mutationFn: async (l) => {
        const y = await ee(`${H}/assistant/threads/${l}/title`, { method: "POST" }, o);
        await pe(y, s);
      },
      onSuccess: async (l, y) => {
        (await f.invalidateQueries({ queryKey: U.assistant.threads }),
          await f.invalidateQueries({ queryKey: U.assistant.threadDetail(y) }));
      },
    }),
    X = zn({ onUnauthorized: s, onTokenRefresh: o });
  (a.useEffect(() => {
    if (!$ || !G.data) return;
    const l = G.data.messages,
      y = l[l.length - 1];
    !y || y.role !== "ASSISTANT" || !y.content.trim() || (X.clearStreamText(), _(!1));
  }, [X, $, G.data]),
    a.useEffect(() => {
      const l = G.data;
      if (!l) return;
      const y = l.thread.id,
        R = (l.thread.title ?? "").trim();
      if (!(!R || R === "Новый диалог") || le.current.has(y)) return;
      const ae = l.messages.some((de) => de.role === "USER" && !!de.content.trim()),
        J = l.messages.some((de) => de.role === "ASSISTANT" && !!de.content.trim());
      !ae || !J || (le.current.add(y), Me.mutate(y, { onError: () => {} }));
    }, [Me, G.data]));
  const Re = st.isPending || X.isStreaming || at.isPending || ot.isPending || Me.isPending;
  async function it() {
    const l = await st.mutateAsync();
    return (A.info("Создан новый диалог."), l.id);
  }
  async function Le() {
    return m || it();
  }
  async function en(l) {
    if (!(!l.trim() || !e))
      try {
        const y = await Le();
        (await X.startStream({
          payload: {
            question: l,
            threadId: y,
            documentIds: p,
            knowledgeSourceIds: B,
            ideologyProfileId: W,
          },
          onDone: async () => {
            (await f.invalidateQueries({ queryKey: U.assistant.threadDetail(y) }),
              await f.invalidateQueries({ queryKey: U.assistant.threads }),
              _(!0));
          },
          onError: (R) => {
            A.error(q(R.message));
          },
        }),
          u(""),
          c(""),
          C([]),
          M(-1),
          N(""));
      } catch (y) {
        A.error(y instanceof Error ? q(y.message) : "Не удалось получить ответ ассистента");
      }
  }
  function we(l) {
    (u(l), c(l));
    const y = l.lastIndexOf("@");
    if (y < 0) {
      N("");
      return;
    }
    const R = l.slice(y + 1);
    if (R.includes(" ")) {
      N("");
      return;
    }
    N(R.trim());
  }
  function ct() {
    !x.trim() || Re || !e || en(x);
  }
  function tn() {
    X.stopStream();
  }
  function nn(l) {
    I(l);
  }
  async function lt(l) {
    await rn(l.id);
    const y = x.lastIndexOf("@");
    if (y >= 0) {
      const R = `${x.slice(0, y)}@${l.title} `;
      (we(R), C([]), M(-1));
    }
  }
  async function rn(l) {
    if (l.trim())
      try {
        const y = await Le();
        (await at.mutateAsync({ threadId: y, documentId: l }),
          C([]),
          M(-1),
          N(""),
          A.info("Документ добавлен в контекст."));
      } catch (y) {
        A.error(y instanceof Error ? q(y.message) : "Не удалось добавить документ");
      }
  }
  async function sn(l) {
    try {
      const y = await Le();
      (await ot.mutateAsync({ threadId: y, file: l }), A.success("Файл прикреплен."));
    } catch (y) {
      A.error(y instanceof Error ? q(y.message) : "Не удалось прикрепить файл");
    }
  }
  async function an() {
    var l;
    if (E) {
      ((l = S.current) == null || l.stop(), b(!1));
      return;
    }
    try {
      const y = await navigator.mediaDevices.getUserMedia({ audio: !0 }),
        R = new MediaRecorder(y);
      ((z.current = []),
        (R.ondataavailable = (K) => {
          z.current.push(K.data);
        }),
        (R.onstop = async () => {
          y.getTracks().forEach((J) => J.stop());
          const K = new Blob(z.current, { type: "audio/webm" }),
            ae = new FormData();
          (ae.append("audio", K, "recording.webm"), ae.append("language", "ru"));
          try {
            const J = await ee(`${H}/stt/audio`, { method: "POST", body: ae }, o),
              de = await pe(J, s),
              cn = [V.current, de.text].filter(Boolean).join(" ").trim();
            we(cn);
          } catch (J) {
            A.error(J instanceof Error ? q(J.message) : "Ошибка распознавания речи");
          }
        }),
        R.start(),
        (S.current = R),
        b(!0));
    } catch {
      A.error(
        "Доступ к микрофону отклонён. Разрешите запись в настройках браузера для этого сайта и повторите.",
      );
    }
  }
  const Fe = G.data,
    on = te.data ?? [],
    dt = (ve.data ?? []).filter((l) => l.status === "DRAFT");
  return t.jsxs("aside", {
    className: "relative flex shrink-0 flex-col border-l border-border bg-surface",
    style: { width: n, height: r },
    children: [
      t.jsxs("div", {
        className:
          "flex shrink-0 items-center justify-between border-b border-border px-4 pb-3 pt-[14px]",
        children: [
          t.jsxs("div", {
            className: "flex items-center gap-2",
            children: [
              t.jsx("span", {
                className: "text-base font-semibold text-text",
                children: "Ассистент",
              }),
              t.jsx("span", {
                className:
                  "rounded-xl bg-primary-soft px-2 py-[2px] text-[11px] font-medium text-primary",
                children: "с источниками",
              }),
            ],
          }),
          t.jsxs("div", {
            className: "flex items-center gap-2",
            children: [
              i &&
                t.jsx("button", {
                  type: "button",
                  className:
                    "rounded-md border border-border bg-white px-[10px] py-1.5 text-xs text-text",
                  onClick: i,
                  children: "Закрыть",
                }),
              t.jsx("button", {
                className:
                  "rounded-md border border-border bg-white px-[10px] py-1.5 text-xs text-text",
                onClick: () => L(!0),
                children: "Диалоги",
              }),
            ],
          }),
        ],
      }),
      t.jsxs("div", {
        className: "shrink-0 px-4 pb-2 pt-2.5",
        children: [
          t.jsx("p", {
            className: "mb-2 mt-0 text-[10px] font-bold uppercase tracking-[0.07em] text-muted",
            children: "подсказки",
          }),
          t.jsx("div", {
            className: "flex flex-col gap-1.5",
            children: ns.map((l) =>
              t.jsx(
                "button",
                {
                  onClick: () => {
                    we(l);
                  },
                  className:
                    "rounded-lg border border-border bg-white px-3 py-[9px] text-left text-[13px] leading-[1.4] text-text",
                  children: l,
                },
                l,
              ),
            ),
          }),
        ],
      }),
      t.jsxs("div", {
        className: "flex-1 overflow-y-auto px-4 py-2",
        children: [
          Re && t.jsx("p", { className: "text-[13px] text-muted", children: "Думаю…" }),
          te.isError &&
            t.jsx("p", {
              className: "mb-2 mt-0 text-[13px] text-danger",
              children: q(
                te.error instanceof Error ? te.error.message : "Не удалось загрузить диалоги",
              ),
            }),
          ve.isError &&
            t.jsx("p", {
              className: "mb-2 mt-0 text-[13px] text-danger",
              children: q(
                ve.error instanceof Error
                  ? ve.error.message
                  : "Не удалось загрузить черновики действий",
              ),
            }),
          !!dt.length &&
            t.jsxs("div", {
              className: "mb-2",
              children: [
                t.jsx("p", {
                  className: "mb-2 mt-0 text-[11px] text-muted",
                  children: "Черновики действий (требуют подтверждения)",
                }),
                t.jsx("div", {
                  className: "grid gap-2",
                  children: dt.map((l) =>
                    t.jsx(
                      Yr,
                      {
                        id: l.id,
                        intent: l.intent,
                        status: l.status,
                        entities: l.entities,
                        onSessionExpired: s,
                        onTokenRefresh: o,
                      },
                      l.id,
                    ),
                  ),
                }),
              ],
            }),
          Fe &&
            t.jsxs("div", {
              children: [
                t.jsxs("p", {
                  className: "mb-2 mt-0 text-[11px] text-muted",
                  children: ["Профиль: ", W, " · Источники: ", B.join(", ")],
                }),
                t.jsxs("div", {
                  className: "grid gap-2",
                  children: [
                    Fe.messages.map((l, y) => {
                      const R = y === Fe.messages.length - 1 && l.role === "ASSISTANT";
                      return t.jsxs(
                        "div",
                        {
                          className: "rounded-lg border border-border bg-white px-[10px] py-2",
                          children: [
                            t.jsx("p", {
                              className: "mb-1 mt-0 text-[11px] text-muted",
                              children: l.role === "USER" ? "Вы" : "Ассистент",
                            }),
                            jt(l.content),
                            R &&
                              X.streamSources.length > 0 &&
                              t.jsxs("div", {
                                className: "mt-1.5 flex flex-wrap items-center gap-1",
                                "aria-label": "Источники последнего ответа ассистента",
                                children: [
                                  t.jsx("span", {
                                    className:
                                      "mr-1 text-[10px] uppercase tracking-[0.06em] text-muted",
                                    children: "Источники",
                                  }),
                                  X.streamSources.map((K) =>
                                    t.jsx(es, { citation: K, onClick: nn }, K.chunkId),
                                  ),
                                ],
                              }),
                          ],
                        },
                        l.id,
                      );
                    }),
                    (X.isStreaming || X.streamText) &&
                      t.jsxs("div", {
                        className: "rounded-lg border border-border bg-white px-[10px] py-2",
                        children: [
                          t.jsx("p", {
                            className: "mb-1 mt-0 text-[11px] text-muted",
                            children: "Ассистент",
                          }),
                          jt(X.streamText || "…"),
                        ],
                      }),
                  ],
                }),
                p.length > 0 &&
                  t.jsxs("div", {
                    className: "mt-2",
                    children: [
                      t.jsx("p", {
                        className: "mb-1 mt-0 text-[11px] text-muted",
                        children: "Контекст RAG (выбранные документы для ответа)",
                      }),
                      t.jsx("div", {
                        className: "flex flex-wrap gap-1.5",
                        children: p.map((l) =>
                          t.jsxs(
                            "button",
                            {
                              type: "button",
                              title: "Убрать документ из контекста ответа",
                              "aria-label": `Убрать из контекста: ${v[l] ?? l}`,
                              className:
                                "rounded-md border border-border bg-white px-2 py-[2px] text-[11px] text-text",
                              onClick: () => j((y) => y.filter((R) => R !== l)),
                              children: [v[l] ?? l, " ×"],
                            },
                            l,
                          ),
                        ),
                      }),
                    ],
                  }),
              ],
            }),
        ],
      }),
      t.jsxs("div", {
        className: "shrink-0 border-t border-border px-4 py-3",
        children: [
          !!h.length &&
            t.jsx("div", {
              className: "mb-2 grid gap-1 rounded-[10px] border border-border bg-white p-1.5",
              children: h.map((l) => {
                var y;
                return t.jsxs(
                  "button",
                  {
                    onClick: () => void lt(l),
                    className: `rounded-md border-none px-2 py-1.5 text-left text-xs text-text ${((y = h[O]) == null ? void 0 : y.id) === l.id ? "bg-primary-soft" : "bg-transparent"}`,
                    children: [
                      t.jsx("span", { className: "mr-1.5 text-primary", children: "@" }),
                      l.title,
                    ],
                  },
                  l.id,
                );
              }),
            }),
          t.jsxs("div", {
            className: "flex gap-1.5",
            children: [
              t.jsx("input", {
                value: x,
                onChange: (l) => we(l.target.value),
                onKeyDown: (l) => {
                  if (h.length) {
                    if (l.key === "ArrowDown") {
                      (l.preventDefault(), M((y) => (y + 1) % h.length));
                      return;
                    }
                    if (l.key === "ArrowUp") {
                      (l.preventDefault(), M((y) => (y <= 0 ? h.length - 1 : y - 1)));
                      return;
                    }
                    if (l.key === "Enter") {
                      l.preventDefault();
                      const y = h[O] ?? h[0];
                      y && lt(y);
                      return;
                    }
                    if (l.key === "Escape") {
                      (l.preventDefault(), C([]), M(-1));
                      return;
                    }
                  }
                  l.key === "Enter" && (l.preventDefault(), ct());
                },
                placeholder: "Спросите по вашим документам…",
                className:
                  "flex-1 rounded-lg border border-border bg-surface px-[10px] py-2 text-[13px] outline-none",
              }),
              t.jsx("button", {
                type: "button",
                onClick: () => void an(),
                "aria-label": E
                  ? "Остановить запись голоса и распознать текст"
                  : "Голосовой ввод: записать речь и вставить текст в поле",
                className: `rounded-lg border border-border px-[10px] py-2 text-sm ${E ? "bg-danger-soft text-danger" : "bg-white text-text"}`,
                title: E
                  ? "Остановить запись и отправить аудио на распознавание"
                  : "Диктовка: записать с микрофона и вставить текст (нужен доступ к микрофону)",
                children: "🎤",
              }),
              t.jsx("button", {
                type: "button",
                onClick: () => {
                  var l;
                  return (l = Q.current) == null ? void 0 : l.click();
                },
                "aria-label": "Прикрепить файл к текущему диалогу ассистента",
                className:
                  "rounded-lg border border-border bg-white px-[10px] py-2 text-sm text-text",
                title: "Прикрепить файл к диалогу (загрузка во вложения текущего чата)",
                children: "＋",
              }),
              t.jsx("input", {
                ref: Q,
                type: "file",
                className: "hidden",
                onChange: (l) => {
                  var R;
                  const y = (R = l.target.files) == null ? void 0 : R[0];
                  y && (sn(y), (l.target.value = ""));
                },
              }),
              t.jsx("button", {
                type: "button",
                onClick: tn,
                disabled: !X.isStreaming,
                "aria-label": "Остановить потоковый ответ ассистента",
                className:
                  "rounded-lg border border-border bg-white px-[10px] py-2 text-xs text-text disabled:opacity-50",
                title: "Остановить генерацию текущего ответа",
                children: "Stop",
              }),
              t.jsx("button", {
                onClick: ct,
                disabled: !x.trim() || Re || !e,
                "aria-label": "Отправить вопрос ассистенту",
                className:
                  "rounded-lg border-0 bg-primary px-3 py-2 text-base text-white disabled:opacity-50",
                children: "↑",
              }),
            ],
          }),
          t.jsx("p", {
            className: "mb-0 mt-1.5 text-center text-[10px] text-muted",
            children: "AI-ассистент · RAG + действия через сервер",
          }),
        ],
      }),
      P &&
        t.jsx("div", {
          role: "dialog",
          "aria-modal": "true",
          "aria-label": "Диалоги ассистента",
          onMouseDown: (l) => {
            l.target === l.currentTarget && L(!1);
          },
          className: "absolute inset-0 z-[5] flex justify-end bg-overlay",
          children: t.jsxs("div", {
            className:
              "box-border flex h-full flex-col gap-2.5 border-l border-border bg-white p-[14px]",
            style: { width: Math.min(360, n) },
            onMouseDown: (l) => l.stopPropagation(),
            children: [
              t.jsxs("div", {
                className: "flex items-center justify-between",
                children: [
                  t.jsx("p", { className: "m-0 text-sm font-bold text-text", children: "Диалоги" }),
                  t.jsx("button", {
                    type: "button",
                    className: be,
                    onClick: () => L(!1),
                    children: "Закрыть",
                  }),
                ],
              }),
              t.jsx("button", {
                type: "button",
                className: "rounded-md border-0 bg-primary px-3 py-1 text-xs text-white",
                onClick: () => void it(),
                children: "+ Новый чат",
              }),
              t.jsx("div", {
                className: "grid gap-1.5 overflow-y-auto",
                role: "listbox",
                "aria-label": "Список диалогов",
                children: on.map((l) =>
                  t.jsx(
                    "button",
                    {
                      type: "button",
                      role: "option",
                      "aria-selected": m === l.id,
                      onClick: () => {
                        (g(l.id),
                          L(!1),
                          f.invalidateQueries({ queryKey: U.assistant.threadDetail(l.id) }));
                      },
                      className: `rounded-md px-3 py-2.5 text-left text-xs ${m === l.id ? "border border-primary bg-primary-soft text-text" : "border border-border bg-white text-text"}`,
                      children: l.title,
                    },
                    l.id,
                  ),
                ),
              }),
            ],
          }),
        }),
      t.jsx(ts, { citation: D, open: !!D, onClose: () => I(null) }),
    ],
  });
}
function rs(e) {
  if (e === "pinned") return "pinned";
  if (e === "transcripts") return "transcript";
  if (e === "contracts") return "contract";
  if (e === "memos") return "memo";
  if (e === "reports") return "report";
}
function De(e) {
  return !(e instanceof Error) || e.message === "Unauthorized" ? "" : q(e.message);
}
function ss({
  token: e,
  user: n,
  onSessionExpired: r,
  onTokenRefresh: s,
  section: o,
  uploadTrigger: i,
  searchQuery: d,
}) {
  var _, A, Q;
  const c = Xe(),
    [x, u] = a.useState(0),
    [f, m] = a.useState(null),
    [g, p] = a.useState(!1),
    [j, h] = a.useState("newest"),
    C = a.useRef(null),
    w = He(),
    N = ye();
  a.useEffect(() => {
    u(0);
  }, [o]);
  const v = ie({
      queryKey: U.documents.list({ section: o, page: x, size: 20 }),
      queryFn: () => Je({ page: x, size: 20, tag: rs(o) }, r, s),
      enabled: !!e,
      placeholderData: bn,
    }),
    T = re({
      mutationFn: (S) => In(S, r, s),
      onSuccess: async () => {
        (await c.invalidateQueries({ queryKey: U.documents.all }),
          u(0),
          N.success("Документ загружен."));
      },
      onError: (S) => {
        N.error(De(S) || "Не удалось загрузить документ");
      },
    }),
    O = re({
      mutationFn: ({ id: S, title: z }) => St(S, { title: z }, r, s),
      onSuccess: async () => {
        (await c.invalidateQueries({ queryKey: U.documents.all }),
          m(null),
          N.success("Документ переименован."));
      },
      onError: (S) => {
        N.error(De(S) || "Не удалось переименовать документ");
      },
    }),
    M = re({
      mutationFn: (S) => Ct(S, r, s),
      onSuccess: async () => {
        await c.invalidateQueries({ queryKey: U.documents.all });
      },
      onError: (S) => {
        N.error(De(S) || "Не удалось удалить документ");
      },
    });
  a.useEffect(() => {
    var S;
    i > 0 && ((S = C.current) == null || S.click());
  }, [i]);
  function P(S) {
    var V;
    const z = (V = S.target.files) == null ? void 0 : V[0];
    !z || !e || ((S.target.value = ""), T.mutate(z));
  }
  const L = De(v.error),
    W = v.isFetching && !((A = (_ = v.data) == null ? void 0 : _.content) != null && A.length),
    F = v.data ?? null,
    B = (F == null ? void 0 : F.content) ?? [],
    k = (d ?? "").trim().toLowerCase(),
    E = k ? B.filter((S) => S.title.toLowerCase().includes(k)) : B,
    D = [...(g ? E.filter((S) => (S.status ?? "").toLowerCase() === "indexed") : E)].sort(
      (S, z) => {
        const V = S.updatedAt ? new Date(S.updatedAt).getTime() : 0,
          le = z.updatedAt ? new Date(z.updatedAt).getTime() : 0;
        return j === "newest" ? le - V : V - le;
      },
    ),
    I = ((Q = n.roles) == null ? void 0 : Q.includes("ADMIN")) ?? !1,
    $ = "1fr 140px 100px 110px 40px";
  return t.jsxs("div", {
    className: "flex h-full min-h-0 flex-1 flex-col",
    children: [
      t.jsxs("div", {
        className:
          "flex shrink-0 items-center justify-between border-b border-border px-6 pb-[14px] pt-4",
        children: [
          t.jsx("h2", { className: "m-0 text-xl font-bold text-text", children: Qn(o) }),
          t.jsxs("div", {
            className: "flex flex-wrap gap-2",
            children: [
              t.jsx(Ue, {
                onClick: () => p((S) => !S),
                title: g
                  ? "Показываются только проиндексированные документы"
                  : "Показать только проиндексированные документы",
                children: g ? "Фильтр: проиндексированные" : "Фильтр",
              }),
              t.jsx(Ue, {
                onClick: () => h((S) => (S === "newest" ? "oldest" : "newest")),
                children: j === "newest" ? "Сортировка: новые" : "Сортировка: старые",
              }),
              t.jsx(Ue, {
                onClick: () => {
                  var S;
                  return (S = C.current) == null ? void 0 : S.click();
                },
                title: "Загрузить документ в систему",
                children: "Загрузить",
              }),
            ],
          }),
        ],
      }),
      t.jsxs("div", {
        className: "flex-1 overflow-y-auto px-6 pb-4",
        children: [
          t.jsx("input", { ref: C, type: "file", className: "hidden", onChange: P }),
          L && t.jsx("p", { className: "py-2 text-[13px] text-danger", children: L }),
          t.jsx("p", {
            className: "mb-1.5 mt-2 text-xs text-muted",
            children: k
              ? `Поиск по названию: «${(d == null ? void 0 : d.trim()) ?? ""}». Учитываются только документы на текущей странице списка (${D.length} из ${B.length} на странице).`
              : g
                ? "Показаны только проиндексированные документы на текущей странице."
                : "Фильтр выключен. Показаны все документы текущей страницы раздела.",
          }),
          t.jsxs("div", {
            className: "mb-2 flex flex-wrap gap-1.5",
            "aria-label": "Активные фильтры списка",
            children: [
              k
                ? t.jsxs("span", {
                    className: "rounded-full bg-primary/15 px-2 py-1 text-[11px] text-text",
                    children: ["Поиск: «", d == null ? void 0 : d.trim(), "»"],
                  })
                : t.jsx("span", {
                    className: "rounded-full bg-zinc-100 px-2 py-1 text-[11px] text-muted",
                    children: "Поиск не задан",
                  }),
              t.jsx("span", {
                className: `rounded-full px-2 py-1 text-[11px] ${g ? "bg-primary/15 text-text" : "bg-zinc-100 text-text"}`,
                children: g ? "Только INDEXED" : "Все статусы",
              }),
              t.jsxs("span", {
                className: "rounded-full bg-zinc-100 px-2 py-1 text-[11px] text-muted",
                children: ["Сортировка: ", j === "newest" ? "новые сверху" : "старые сверху"],
              }),
            ],
          }),
          t.jsx("div", {
            className: "sticky top-0 z-[1] grid gap-0 bg-surface",
            style: { gridTemplateColumns: $ },
            children: ["название", "владелец / ACL", "обновлено", "статус", ""].map((S) =>
              t.jsx(
                "div",
                {
                  className:
                    "border-b border-border py-[10px] text-[11px] font-semibold uppercase tracking-[0.06em] text-muted",
                  children: S,
                },
                S,
              ),
            ),
          }),
          W &&
            !D.length &&
            t.jsx("p", {
              className: "py-4 text-[13px] text-muted",
              children: "Загрузка документов…",
            }),
          !W &&
            !D.length &&
            t.jsxs("div", {
              className: "grid gap-2 py-4 text-[13px] text-muted",
              children: [
                t.jsx("p", {
                  className: "m-0",
                  children: k ? "Поиск не дал результатов." : "Документы пока не найдены.",
                }),
                t.jsx("p", {
                  className: "m-0",
                  children: "Нажмите «Загрузить» или «+ Новый», чтобы добавить документ в систему.",
                }),
              ],
            }),
          D.map((S, z) =>
            t.jsx(
              as,
              {
                doc: S,
                cols: $,
                last: z === D.length - 1,
                token: e,
                isAdmin: I,
                onSessionExpired: r,
                onTokenRefresh: s,
                onRowNavigate: () => w(`/documents/${S.id}`),
                onOpenRename: m,
                onDeleteDocument: (V) => M.mutateAsync(V),
                onNavigateAudit: () => w("/audit"),
              },
              S.id,
            ),
          ),
          t.jsx(Pt, {
            open: f !== null,
            onClose: () => m(null),
            initialTitle: (f == null ? void 0 : f.title) ?? "",
            onSave: async (S) => {
              if (!(!f || !e))
                try {
                  await O.mutateAsync({ id: f.id, title: S });
                } catch {}
            },
          }),
          F &&
            F.totalPages > 1 &&
            t.jsxs("div", {
              className: "mt-4 flex items-center gap-2",
              children: [
                t.jsx("button", {
                  disabled: x <= 0,
                  onClick: () => u((S) => S - 1),
                  className: be,
                  children: "← Назад",
                }),
                t.jsxs("span", {
                  className: "text-[13px] text-muted",
                  children: [x + 1, " / ", F.totalPages],
                }),
                t.jsx("button", {
                  disabled: x >= F.totalPages - 1,
                  onClick: () => u((S) => S + 1),
                  className: be,
                  children: "Далее →",
                }),
              ],
            }),
        ],
      }),
    ],
  });
}
function as({
  doc: e,
  cols: n,
  last: r,
  token: s,
  isAdmin: o,
  onRowNavigate: i,
  onSessionExpired: d,
  onTokenRefresh: c,
  onOpenRename: x,
  onDeleteDocument: u,
  onNavigateAudit: f,
}) {
  const m = Z((b) => b.openAiWithQuery),
    g = ye(),
    [p, j] = a.useState(!1),
    [h, C] = a.useState(!1),
    [w, N] = a.useState(0),
    v = a.useRef(null),
    T = a.useRef(null),
    O = a.useRef([]);
  (a.useEffect(() => {
    if (!p) return;
    const b = (I) => {
        v.current && !v.current.contains(I.target) && j(!1);
      },
      D = (I) => {
        I.key === "Escape" && j(!1);
      };
    return (
      document.addEventListener("mousedown", b),
      document.addEventListener("keydown", D),
      () => {
        (document.removeEventListener("mousedown", b), document.removeEventListener("keydown", D));
      }
    );
  }, [p]),
    a.useEffect(() => {
      p && N(0);
    }, [p]),
    a.useEffect(() => {
      var b;
      p && ((b = O.current[w]) == null || b.focus());
    }, [p, w]));
  async function M() {
    const b = `${window.location.origin}/documents/${e.id}`;
    try {
      (await navigator.clipboard.writeText(b), g.success("Ссылка скопирована."));
    } catch {
      g.error("Не удалось скопировать ссылку");
    }
    j(!1);
  }
  async function P() {
    if (s) {
      j(!1);
      try {
        const b = await ee(`${H}/documents/${e.id}/binary?disposition=attachment`, {}, c);
        if (b.status === 401 || b.status === 403) {
          d();
          return;
        }
        if (!b.ok) {
          const _ = await At(b);
          throw new Error(_.message ?? _.errorCode ?? "Request failed");
        }
        const D = await b.blob(),
          I = URL.createObjectURL(D),
          $ = document.createElement("a");
        (($.href = I),
          ($.download = e.fileName || e.title || "document"),
          ($.rel = "noopener"),
          $.click(),
          URL.revokeObjectURL(I));
      } catch (b) {
        g.error(b instanceof Error ? q(b.message) : "Не удалось скачать");
      }
    }
  }
  function L() {
    const I = ((e.fileName || e.title || "").trim().split(".")[0] ?? "")
        .trim()
        .replace(/\s+/g, "_")
        .slice(0, 32),
      $ = I ? `@${I} суммируй документ в 5 пунктах` : "Суммируй документ в 5 пунктах";
    (m($), j(!1));
  }
  function W() {
    if ((j(!1), o)) {
      f();
      return;
    }
    g.info(
      "Журнал аудита по документу: в MVP доступен только администраторам (раздел «Журнал аудита»).",
    );
  }
  async function F() {
    j(!1);
    try {
      (await u(e.id), C(!1), g.success("Документ удален."));
    } catch (b) {
      b instanceof Error || g.error("Не удалось удалить");
    }
  }
  const B = `doc-row-menu-${e.id}`,
    k = `doc-row-menu-btn-${e.id}`,
    E = [
      {
        id: "open",
        label: "Открыть",
        action: () => {
          (j(!1), i());
        },
      },
      { id: "copy", label: "Копировать ссылку", action: () => void M() },
      { id: "dl", label: "Скачать файл", action: () => void P() },
      {
        id: "ai",
        label: "Спросить AI…",
        action: () => {
          L();
        },
      },
      {
        id: "audit",
        label: o ? "Журнал аудита…" : "Аудит (недоступно)",
        action: () => {
          W();
        },
      },
      {
        id: "ren",
        label: "Переименовать…",
        action: () => {
          (j(!1), x(e));
        },
      },
      {
        id: "del",
        label: "Удалить…",
        danger: !0,
        action: () => {
          (j(!1), C(!0));
        },
      },
    ];
  return t.jsxs("div", {
    role: "row",
    tabIndex: 0,
    "aria-label": `Документ: ${e.title}. Enter — открыть карточку; Shift+F10 или контекстное меню — действия.`,
    className: "grid cursor-pointer items-center outline-none",
    style: { gridTemplateColumns: n, borderBottom: r ? "none" : "1px dashed var(--color-border)" },
    onClick: () => {
      p || i();
    },
    onContextMenu: (b) => {
      (b.preventDefault(), b.stopPropagation(), j(!0));
    },
    onKeyDown: (b) => {
      var D;
      if (p) {
        b.key === "Escape" && (b.preventDefault(), j(!1), (D = T.current) == null || D.focus());
        return;
      }
      if ((b.shiftKey && b.key === "F10") || b.key === "ContextMenu") {
        (b.preventDefault(), j(!0));
        return;
      }
      (b.key === "Enter" || b.key === " ") && (b.preventDefault(), i());
    },
    children: [
      t.jsxs("div", {
        className: "flex items-center gap-2 overflow-hidden py-[11px]",
        children: [
          t.jsx("span", { className: "shrink-0 text-sm", children: qn(e) }),
          t.jsx("span", { className: "truncate text-sm font-medium text-text", children: e.title }),
        ],
      }),
      t.jsxs("div", {
        className: "flex items-center gap-1.5 py-[11px]",
        children: [
          t.jsx(Dt, { name: e.ownerId.slice(0, 8), size: 22 }),
          t.jsx("span", { className: "text-xs text-muted", children: Bn(e) }),
        ],
      }),
      t.jsx("div", {
        className: "py-[11px] text-xs text-muted",
        children: e.updatedAt ? Kn(e.updatedAt) : "—",
      }),
      t.jsx("div", { className: "py-[11px]", children: t.jsx(Ye, { status: e.status }) }),
      t.jsxs("div", {
        ref: v,
        className: "relative py-[11px] text-center",
        onClick: (b) => b.stopPropagation(),
        children: [
          t.jsx("button", {
            ref: T,
            id: k,
            type: "button",
            "aria-haspopup": "menu",
            "aria-expanded": p,
            "aria-controls": p ? B : void 0,
            title: "Действия с документом",
            onClick: (b) => {
              (b.stopPropagation(), j((D) => !D));
            },
            className:
              "rounded-md border-none bg-transparent px-2 py-1 text-lg leading-none text-muted",
            children: "⋯",
          }),
          p &&
            t.jsx("div", {
              id: B,
              role: "menu",
              "aria-labelledby": k,
              onKeyDown: (b) => {
                const D = E.length;
                D !== 0 &&
                  (b.key === "ArrowDown"
                    ? (b.preventDefault(), b.stopPropagation(), N((I) => (I + 1) % D))
                    : b.key === "ArrowUp"
                      ? (b.preventDefault(), b.stopPropagation(), N((I) => (I - 1 + D) % D))
                      : b.key === "Home"
                        ? (b.preventDefault(), N(0))
                        : b.key === "End" && (b.preventDefault(), N(D - 1)));
              },
              className:
                "absolute right-0 top-full z-20 mt-0.5 min-w-[220px] rounded-lg border border-border bg-white px-0 py-1 text-left shadow-menu",
              children: E.map((b, D) =>
                t.jsx(
                  "button",
                  {
                    ref: (I) => {
                      O.current[D] = I;
                    },
                    type: "button",
                    role: "menuitem",
                    tabIndex: w === D ? 0 : -1,
                    "aria-label": b.label,
                    onMouseEnter: () => N(D),
                    onClick: (I) => {
                      (I.stopPropagation(), b.action());
                    },
                    className: `block w-full border-none px-[14px] py-2 text-left text-[13px] ${w === D ? "bg-primary/10" : "bg-transparent"} ${b.danger ? "text-danger" : "text-text"}`,
                    children: b.label,
                  },
                  b.id,
                ),
              ),
            }),
        ],
      }),
      t.jsx(nt, {
        open: h,
        onOpenChange: C,
        onConfirm: F,
        title: "Удалить документ безвозвратно?",
        description: "Это действие нельзя отменить.",
        confirmText: "Удалить",
        cancelText: "Отмена",
      }),
    ],
  });
}
function Pe({ title: e, value: n, subtitle: r }) {
  return t.jsxs("div", {
    className: "rounded-[10px] border border-border bg-white p-[14px]",
    children: [
      t.jsx("p", { className: "mb-2 mt-0 text-xs text-muted", children: e }),
      t.jsx("p", { className: "m-0 text-2xl font-bold text-text", children: n }),
      r && t.jsx("p", { className: "mb-0 mt-2 text-xs text-muted", children: r }),
    ],
  });
}
function os({ token: e, onSessionExpired: n, onTokenRefresh: r }) {
  var f, m, g, p, j;
  const s = ie({
      queryKey: U.dashboard.metrics,
      enabled: !!e,
      queryFn: async () => {
        const [h, C, w, N] = await Promise.all([
          Je({ page: 0, size: 1 }, n, r),
          ee(`${H}/actions`, {}, r),
          ee(`${H}/audit`, {}, r),
          fetch(`${H}/health`),
        ]);
        let v = [];
        C.ok && (v = await pe(C, n));
        let T = 0;
        return (
          w.ok && (T = (await pe(w, n)).length),
          {
            docCount: h.totalElements,
            actionCount: v.length,
            executedCount: v.filter((O) => O.status === "EXECUTED").length,
            auditCount: T,
            systemHealth: N.ok ? "ok" : "degraded",
          }
        );
      },
    }),
    o = ((f = s.data) == null ? void 0 : f.docCount) ?? 0,
    i = ((m = s.data) == null ? void 0 : m.actionCount) ?? 0,
    d = ((g = s.data) == null ? void 0 : g.executedCount) ?? 0,
    c = ((p = s.data) == null ? void 0 : p.auditCount) ?? 0,
    x = ((j = s.data) == null ? void 0 : j.systemHealth) ?? "unknown",
    u = s.error
      ? q(s.error instanceof Error ? s.error.message : "Не удалось загрузить метрики")
      : "";
  return t.jsxs("div", {
    className: "p-6",
    children: [
      t.jsx("h2", { className: "mb-[14px] mt-0 text-text", children: "Дашборд" }),
      u && t.jsx("p", { className: "mb-3 mt-0 text-danger", children: u }),
      t.jsxs("div", {
        className: "mb-2.5 grid grid-cols-2 gap-2.5",
        children: [
          t.jsx(Pe, {
            title: "Документы",
            value: String(o),
            subtitle: "Всего документов в системе",
          }),
          t.jsx(Pe, { title: "AI-действия", value: String(i), subtitle: `Выполнено: ${d}` }),
          t.jsx(Pe, {
            title: "Аудит-события",
            value: String(c),
            subtitle: "Записи журнала аудита (доступные текущей роли)",
          }),
          t.jsx(Pe, {
            title: "Состояние системы",
            value: x === "ok" ? "OK" : "DEGRADED",
            subtitle: `API: ${H}`,
          }),
        ],
      }),
      t.jsxs("div", {
        className: "rounded-[10px] border border-border bg-white p-[14px]",
        children: [
          t.jsx("p", {
            className: "mb-2 mt-0 text-[13px] font-semibold text-text",
            children: "Операционный срез",
          }),
          t.jsxs("p", {
            className: "mb-1.5 mt-0 text-xs text-muted",
            children: [
              "Исполнение AI-действий:",
              " ",
              i === 0 ? "данные отсутствуют" : `${d} из ${i} в статусе EXECUTED`,
              ".",
            ],
          }),
          t.jsxs("p", {
            className: "m-0 text-xs text-muted",
            children: [
              "Аудит:",
              " ",
              c > 0
                ? "журнал доступен и пополняется"
                : "нет доступных записей или ограничен доступ по роли",
              ".",
            ],
          }),
        ],
      }),
    ],
  });
}
function Qe({ label: e, children: n }) {
  return t.jsxs("div", {
    className: "mb-5",
    children: [
      t.jsx("p", {
        className: "mb-2 mt-0 text-[11px] font-bold uppercase tracking-[0.06em] text-muted",
        children: e,
      }),
      n,
    ],
  });
}
function is({ label: e, value: n }) {
  return t.jsxs("div", {
    className: "rounded-lg border border-border bg-surface px-3 py-2.5",
    children: [
      t.jsx("p", {
        className: "mb-0.5 mt-0 text-[10px] font-bold uppercase tracking-[0.06em] text-muted",
        children: e,
      }),
      t.jsx("p", { className: "m-0 truncate text-[13px] text-text", children: n }),
    ],
  });
}
function cs({ documentId: e, contentType: n, onSessionExpired: r, onTokenRefresh: s }) {
  const [o, i] = a.useState(null),
    [d, c] = a.useState(null),
    [x, u] = a.useState("");
  return (
    a.useEffect(() => {
      let f = !1,
        m = null;
      (u(""), i(null), c(null));
      const g = n.includes("pdf"),
        p = n.includes("text/plain");
      if (!g && !p) return;
      async function j() {
        try {
          const h = await ee(`${H}/documents/${e}/binary?disposition=inline`, {}, s);
          if (h.status === 401 || h.status === 403) {
            r();
            return;
          }
          if (!h.ok) {
            u(await h.text());
            return;
          }
          const C = await h.blob();
          if (f) return;
          if (p) {
            const w = await C.text();
            f || c(w);
          } else ((m = URL.createObjectURL(C)), f || i(m));
        } catch (h) {
          f || u(String(h));
        }
      }
      return (
        j(),
        () => {
          ((f = !0), m && URL.revokeObjectURL(m));
        }
      );
    }, [e, n, r, s]),
    n
      ? !n.includes("pdf") && !n.includes("text/plain")
        ? t.jsxs("p", {
            className: "text-[13px] text-muted",
            children: [
              "Предпросмотр доступен для PDF и обычного текста. Тип текущего файла: ",
              n,
              ".",
            ],
          })
        : x
          ? t.jsx("p", { className: "text-[13px] text-danger", children: x })
          : n.includes("text/plain") && d !== null
            ? t.jsx("pre", {
                className:
                  "max-h-[360px] overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-surface p-2.5 text-xs",
                children: d,
              })
            : n.includes("pdf") && o
              ? t.jsx("iframe", {
                  title: "Предпросмотр документа",
                  src: o,
                  className: "h-[420px] w-full rounded-lg border border-border",
                })
              : t.jsx("p", {
                  className: "text-[13px] text-muted",
                  children: "Загрузка предпросмотра…",
                })
      : t.jsx("p", { className: "text-[13px] text-muted", children: "Нет метаданных файла." })
  );
}
function ls({ token: e, onSessionExpired: n, onTokenRefresh: r }) {
  const { documentId: s } = xn(),
    o = He(),
    i = Xe(),
    [d, c] = a.useState(""),
    [x, u] = a.useState(null),
    [f, m] = a.useState(!1),
    [g, p] = a.useState(!1),
    [j, h] = a.useState(!1),
    C = Z((E) => E.openAiWithQuery),
    w = ye(),
    N = ie({
      queryKey: U.documents.card(s),
      enabled: !!s && !!e,
      queryFn: async () => {
        const E = await ee(`${H}/documents/${s}`, {}, r);
        return pe(E, n);
      },
    }),
    v = N.data ?? null,
    T = re({
      mutationFn: (E) => {
        if (!s) throw new Error("Document id is missing");
        return St(s, E, n, r);
      },
      onSuccess: async (E) => {
        (i.setQueryData(U.documents.card(s), E),
          c(E.tags.join(", ")),
          u(null),
          await i.invalidateQueries({ queryKey: U.documents.all }));
      },
    });
  async function O() {
    if (!s || !e) return;
    const E = d
      .split(",")
      .map((b) => b.trim())
      .filter(Boolean);
    try {
      (await T.mutateAsync({ tags: E }), w.success("Теги обновлены."));
    } catch (b) {
      w.error(b instanceof Error ? q(b.message) : "Не удалось обновить теги");
    }
  }
  async function M() {
    if (!(!s || !e)) {
      m(!0);
      try {
        const E = await ee(`${H}/documents/${s}/extracted-text`, {}, r);
        u(await Tn(E, n));
      } catch (E) {
        E instanceof Error && E.message !== "Unauthorized" && w.error(q(E.message));
      } finally {
        m(!1);
      }
    }
  }
  const P = re({
    mutationFn: () => {
      if (!s) throw new Error("Document id is missing");
      return Ct(s, n, r);
    },
    onSuccess: async () => {
      (await i.invalidateQueries({ queryKey: U.documents.all }),
        w.success("Документ удален."),
        o("/documents"));
    },
  });
  async function L() {
    if (!(!s || !e))
      try {
        (await P.mutateAsync(), p(!1));
      } catch (E) {
        w.error(E instanceof Error ? q(E.message) : "Не удалось удалить");
      }
  }
  async function W(E) {
    if (!(!s || !e))
      try {
        const b = await ee(`${H}/documents/${s}/binary?disposition=attachment`, {}, r);
        if (b.status === 401 || b.status === 403) {
          n();
          return;
        }
        if (!b.ok) {
          const _ = await At(b);
          w.error(q(_.message ?? _.errorCode ?? ""));
          return;
        }
        const D = await b.blob(),
          I = URL.createObjectURL(D),
          $ = document.createElement("a");
        (($.href = I), ($.download = E), ($.rel = "noopener"), $.click(), URL.revokeObjectURL(I));
      } catch (b) {
        w.error(b instanceof Error ? q(b.message) : "Не удалось скачать");
      }
  }
  if (
    (a.useEffect(() => {
      v && (c(v.tags.join(", ")), u(null));
    }, [v]),
    N.isPending && !v)
  )
    return t.jsx("p", { className: "p-6 text-muted", children: "Загрузка…" });
  if (!v)
    return t.jsxs("div", {
      className: "p-6",
      children: [
        t.jsx("p", { className: "text-muted", children: "Документ не загружен." }),
        t.jsx("button", {
          className: "rounded-md border border-border bg-white px-3 py-1 text-xs text-text",
          onClick: () => void N.refetch(),
          children: "Повторить",
        }),
      ],
    });
  const F = v.contentType ?? "",
    B = F.includes("text/plain");
  function k() {
    if (!v) return;
    const D = ((v.fileName || v.title || "").trim().split(".")[0] ?? "")
        .trim()
        .replace(/\s+/g, "_")
        .slice(0, 32),
      I = D ? `@${D} суммируй документ в 5 пунктах` : "Суммируй документ в 5 пунктах";
    C(I);
  }
  return t.jsxs("div", {
    className: "flex h-full min-h-0 flex-1 flex-col",
    children: [
      t.jsxs("div", {
        className: "flex shrink-0 items-center gap-3 border-b border-border px-6 pb-[14px] pt-4",
        children: [
          t.jsx("button", {
            onClick: () => o(-1),
            className:
              "rounded-md border border-border bg-white px-[10px] py-[2px] text-[18px] text-text",
            children: "←",
          }),
          t.jsx("h2", {
            className: "m-0 min-w-0 flex-1 text-[18px] font-bold text-text",
            children: v.title,
          }),
          t.jsxs("div", {
            className: "flex shrink-0 items-center gap-2",
            children: [
              t.jsx("button", {
                type: "button",
                onClick: k,
                className: "rounded-md border border-border bg-white px-3 py-1 text-xs text-text",
                title: "Открыть ассистента и вставить вопрос",
                children: "Спросить AI",
              }),
              t.jsx("button", {
                type: "button",
                onClick: () => h(!0),
                className: "rounded-md border border-border bg-white px-3 py-1 text-xs text-text",
                children: "Переименовать",
              }),
              t.jsx("button", {
                type: "button",
                onClick: () => p(!0),
                className:
                  "rounded-md border border-danger/40 bg-white px-3 py-1 text-xs text-danger",
                children: "Удалить",
              }),
              t.jsx(Ye, { status: v.status }),
            ],
          }),
        ],
      }),
      t.jsxs("div", {
        className: "flex-1 overflow-y-auto px-6 py-5",
        children: [
          t.jsx("div", {
            className: "mb-4 grid grid-cols-[minmax(240px,1fr)] gap-2.5",
            children: t.jsx(is, { label: "Владелец", value: v.ownerId }),
          }),
          t.jsxs("div", {
            className: "mb-4 flex items-center gap-2",
            children: [
              t.jsx("input", {
                value: d,
                onChange: (E) => c(E.target.value),
                placeholder: "теги через запятую",
                className:
                  "max-w-[480px] flex-1 rounded-[7px] border border-border bg-surface px-[10px] py-[7px] text-[13px] outline-none",
              }),
              t.jsx("button", {
                onClick: () => void O(),
                className: "rounded-md border-0 bg-primary px-3 py-1 text-xs text-white",
                children: "Сохранить теги",
              }),
            ],
          }),
          t.jsx(Qe, {
            label: "Предпросмотр",
            children: t.jsx(cs, {
              documentId: v.id,
              contentType: F,
              onSessionExpired: n,
              onTokenRefresh: r,
            }),
          }),
          (!B || v.extractedTextTruncated) &&
            t.jsxs(Qe, {
              label: `Извлеченный текст (${v.extractedTextLength} символов${v.extractedTextTruncated ? ", усечено" : ""})`,
              children: [
                t.jsx("pre", {
                  className: `m-0 overflow-auto whitespace-pre-wrap break-words rounded-lg p-2.5 text-xs ${x ? "max-h-[360px] bg-success-soft" : "max-h-[180px] bg-surface-muted"}`,
                  children:
                    x ||
                    (v.extractedTextTruncated
                      ? `${v.extractedTextPreview}…`
                      : v.extractedTextPreview),
                }),
                !x &&
                  t.jsx("button", {
                    className:
                      "mt-2 rounded-md border border-border bg-white px-3 py-1 text-xs text-text",
                    onClick: () => void M(),
                    disabled: f,
                    children: f ? "Загрузка…" : "Загрузить полный текст",
                  }),
              ],
            }),
          t.jsx(Qe, {
            label: "Файл документа",
            children: t.jsxs("div", {
              className:
                "flex items-center gap-2.5 rounded-lg border border-border bg-white px-3 py-2 text-[13px]",
              children: [
                t.jsx("span", {
                  className: "min-w-0 flex-1 truncate font-medium text-text",
                  children: v.fileName,
                }),
                t.jsx("span", {
                  className: "shrink-0 text-[11px] text-muted",
                  children: v.contentType,
                }),
                t.jsxs("span", {
                  className: "shrink-0 text-[11px] text-muted",
                  children: [(v.totalSizeBytes / 1024).toFixed(1), " KB"],
                }),
                t.jsx("button", {
                  type: "button",
                  title: "Скачать",
                  onClick: () => void W(v.fileName),
                  className:
                    "shrink-0 rounded-md border border-border bg-white px-2 py-[2px] text-xs text-text",
                  children: "⬇",
                }),
              ],
            }),
          }),
        ],
      }),
      t.jsx(Pt, {
        open: j,
        onClose: () => h(!1),
        initialTitle: v.title,
        onSave: async (E) => {
          !s || !e || (await T.mutateAsync({ title: E }), w.success("Документ переименован."));
        },
      }),
      t.jsx(nt, {
        open: g,
        onOpenChange: p,
        onConfirm: L,
        title: "Удалить документ безвозвратно?",
        description: "Это действие нельзя отменить.",
        confirmText: "Удалить",
        cancelText: "Отмена",
        pending: P.isPending,
      }),
    ],
  });
}
function ds({ user: e }) {
  return t.jsxs("div", {
    className: "p-6",
    children: [
      t.jsx("h2", { className: "mb-2.5 mt-0 text-text", children: "Настройки" }),
      t.jsx("p", {
        className: "mb-[14px] mt-0 text-muted",
        children: "Настройки профиля и предпочтений находятся в разработке.",
      }),
      t.jsxs("div", {
        className: "grid max-w-[640px] gap-3 rounded-[10px] border border-border bg-white p-[14px]",
        children: [
          t.jsxs("div", {
            className: "flex items-center justify-between gap-2.5",
            children: [
              t.jsxs("div", {
                children: [
                  t.jsx("p", {
                    className: "m-0 text-sm font-semibold text-text",
                    children: "Тема интерфейса",
                  }),
                  t.jsx("p", {
                    className: "mb-0 mt-1 text-xs text-muted",
                    children: "Переключение между светлой и тёмной темой (скоро).",
                  }),
                ],
              }),
              t.jsx("button", {
                type: "button",
                disabled: !0,
                className: "rounded-md border border-border bg-white px-3 py-1 text-xs text-text",
                children: "Скоро",
              }),
            ],
          }),
          t.jsxs("div", {
            className: "flex items-center justify-between gap-2.5",
            children: [
              t.jsxs("div", {
                children: [
                  t.jsx("p", {
                    className: "m-0 text-sm font-semibold text-text",
                    children: "Email-дайджест",
                  }),
                  t.jsx("p", {
                    className: "mb-0 mt-1 text-xs text-muted",
                    children: "Ежедневная сводка по документам и активности (скоро).",
                  }),
                ],
              }),
              t.jsx("button", {
                type: "button",
                disabled: !0,
                className: "rounded-md border border-border bg-white px-3 py-1 text-xs text-text",
                children: "Скоро",
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
function Ge({ title: e, description: n, hint: r, actionLabel: s }) {
  return t.jsxs("div", {
    className: "p-6",
    children: [
      t.jsx("h2", { className: "mb-2.5 mt-0 text-text", children: e }),
      t.jsx("p", { className: "m-0 leading-[1.6] text-muted", children: n }),
      t.jsxs("div", {
        className:
          "mt-[14px] max-w-[560px] rounded-[10px] border border-dashed border-border bg-white p-[14px]",
        children: [
          t.jsx("p", {
            className: "m-0 text-[13px] text-text",
            children:
              r ??
              "Раздел находится в процессе внедрения. Данные появятся после настройки backend-коннекторов.",
          }),
          s &&
            t.jsx("button", {
              type: "button",
              disabled: !0,
              title: "Функция пока не реализована",
              className:
                "mt-2.5 cursor-not-allowed rounded-md border border-border bg-white px-3 py-1 text-xs text-text opacity-60",
              children: s,
            }),
        ],
      }),
    ],
  });
}
function Ie(e) {
  var n;
  return ((n = e == null ? void 0 : e.roles) == null ? void 0 : n.includes("ADMIN")) ?? !1;
}
function us({
  user: e,
  docCount: n,
  width: r,
  navSearchQuery: s,
  onNavSearchChange: o,
  onNavSearchEnter: i,
  navResults: d,
  onNewDoc: c,
  section: x,
  onSection: u,
  onLogout: f,
  mobile: m = !1,
  mobileOpen: g = !1,
  onCloseMobile: p,
}) {
  function j({ label: h, count: C, k: w, icon: N }) {
    const v = x === w;
    return t.jsxs("button", {
      onClick: () => {
        (u(w), p == null || p());
      },
      className: `flex w-full items-center justify-between rounded-md border-none px-[10px] py-[5px] text-left text-[13px] ${v ? "bg-primary/20 text-primary" : "bg-transparent text-text"}`,
      children: [
        t.jsxs("span", {
          className: "flex items-center gap-[7px]",
          children: [t.jsx("span", { className: "text-xs opacity-70", children: N }), h],
        }),
        C !== void 0 && t.jsx("span", { className: "text-xs text-muted", children: C }),
      ],
    });
  }
  return t.jsxs("aside", {
    className: `flex h-screen shrink-0 flex-col gap-0.5 overflow-y-auto border-r border-border bg-surface-alt px-[10px] py-[14px] ${m ? `fixed left-0 top-0 z-40 transition-transform duration-150 ease-out ${g ? "translate-x-0" : "-translate-x-[105%]"}` : "relative"}`,
    style: { width: r },
    children: [
      t.jsxs("div", {
        className: "flex shrink-0 items-center justify-between px-1 pb-[10px]",
        children: [
          t.jsx("span", {
            className: "font-mono text-[20px] font-bold text-primary",
            children: "DMIS",
          }),
          t.jsxs("div", {
            className: "flex items-center gap-1.5",
            children: [
              t.jsx("span", {
                className:
                  "whitespace-nowrap rounded-xl bg-danger-soft px-1.5 py-[2px] text-[10px] font-semibold text-danger",
                children: "● audit on",
              }),
              m &&
                t.jsx("button", {
                  onClick: p,
                  className: "rounded-md border border-border bg-white px-2 py-1 text-xs text-text",
                  children: "Закрыть",
                }),
              t.jsx("button", {
                onClick: f,
                title: "Выйти",
                className: "cursor-pointer border-none bg-transparent p-0",
                children: t.jsx(Dt, { name: e.fullName }),
              }),
            ],
          }),
        ],
      }),
      t.jsxs("div", {
        className: "relative mb-1.5 shrink-0",
        children: [
          t.jsx("span", {
            className:
              "pointer-events-none absolute left-[9px] top-1/2 -translate-y-1/2 text-sm text-muted",
            children: "⌕",
          }),
          t.jsx("input", {
            id: "dmis-nav-search-input",
            value: s,
            onChange: (h) => o(h.target.value),
            onKeyDown: (h) => {
              h.key === "Enter" && (h.preventDefault(), i());
            },
            "aria-label": "Поиск разделов и команд",
            placeholder: "Разделы и команды…",
            autoComplete: "off",
            className:
              "box-border w-full rounded-[7px] border border-border bg-surface py-[7px] pl-[26px] pr-[10px] text-[13px] outline-none",
          }),
          t.jsx("div", {
            role: "region",
            "aria-label": "Подсказки навигации",
            className: `mt-1.5 max-h-[220px] overflow-y-auto rounded-lg bg-surface ${d.length ? "border border-border px-1 py-1.5" : "border border-dashed border-border px-[10px] py-[10px]"}`,
            children:
              d.length === 0
                ? t.jsx("p", {
                    className: "m-0 text-xs leading-[1.45] text-muted",
                    children: s.trim()
                      ? "Ничего не найдено. Enter — перейти к документам и искать по названию на странице."
                      : "Введите название раздела или команды. Enter — выполнить первый пункт списка.",
                  })
                : t.jsx("ul", {
                    className: "m-0 grid list-none gap-1 px-1 py-0",
                    children: d.map((h, C) =>
                      t.jsx(
                        "li",
                        {
                          children: t.jsxs("button", {
                            type: "button",
                            onClick: () => h.onActivate(),
                            title: h.hint,
                            className: `flex w-full items-start justify-between gap-2 rounded-md border-none px-[10px] py-2 text-left text-[13px] text-text ${C === 0 ? "bg-primary/15" : "bg-transparent"}`,
                            children: [
                              t.jsx("span", { children: h.label }),
                              h.hint &&
                                t.jsx("span", {
                                  className: "shrink-0 text-[11px] text-muted",
                                  children: h.hint,
                                }),
                            ],
                          }),
                        },
                        h.id,
                      ),
                    ),
                  }),
          }),
        ],
      }),
      t.jsx("button", {
        onClick: c,
        className:
          "mb-2.5 flex shrink-0 items-center justify-center gap-1.5 rounded-lg border-0 bg-primary px-4 py-2 text-sm font-semibold text-white",
        children: "+ Новый",
      }),
      t.jsx($e, { children: "рабочее пространство" }),
      t.jsx(j, { label: "Дашборд", k: "dashboard", icon: "◈" }),
      t.jsx(j, { label: "Документы", count: n, k: "documents", icon: "📄" }),
      t.jsx($e, { children: "сервисы" }),
      t.jsx(j, { label: "Почта", k: "mail", icon: "✉" }),
      t.jsx(j, { label: "Календарь", k: "calendar", icon: "📅" }),
      t.jsx($e, { children: "контроль" }),
      Ie(e) && t.jsx(j, { label: "Журнал аудита", k: "audit", icon: "○" }),
      t.jsx(j, { label: "Настройки", k: "settings", icon: "☰" }),
      Ie(e) && t.jsx(j, { label: "ACL (скоро)", k: "acl", icon: "🔒" }),
    ],
  });
}
function hs({ user: e, token: n, onSessionExpired: r, onTokenRefresh: s }) {
  var _;
  const o = fn(),
    [i, d] = a.useState(""),
    [c, x] = a.useState(0),
    [u, f] = a.useState(220),
    [m, g] = a.useState(288),
    [p, j] = a.useState(() => window.innerWidth < 980),
    [h, C] = a.useState(() => window.innerWidth),
    [w, N] = a.useState(!1),
    v = Z((A) => A.mobileAiOpen),
    T = Z((A) => A.openAiWithQuery),
    O = Z((A) => A.closeMobileAi),
    M = Z((A) => A.resizeMode),
    P = Z((A) => A.stopResize),
    L = Z((A) => A.startResize),
    W = He(),
    F = o.pathname.split("/")[1] || "dashboard";
  (a.useEffect(() => {
    const A = () => {
      (j(window.innerWidth < 980), C(window.innerWidth));
    };
    return (window.addEventListener("resize", A), () => window.removeEventListener("resize", A));
  }, []),
    a.useEffect(() => {
      p || (N(!1), O());
    }, [O, p]),
    a.useEffect(() => {
      if (!p) return;
      const A = (Q) => {
        Q.key !== "Escape" || !w || (Q.preventDefault(), N(!1));
      };
      return (
        window.addEventListener("keydown", A),
        () => window.removeEventListener("keydown", A)
      );
    }, [p, w]),
    a.useEffect(() => {
      if (p) return;
      const A = (S) => {
          if (!M) return;
          if (M === "sidebar") {
            const V = Math.min(Math.max(S.clientX, 180), 420);
            f(V);
            return;
          }
          const z = Math.min(Math.max(window.innerWidth - S.clientX, 240), 560);
          g(z);
        },
        Q = () => {
          (P(), (document.body.style.cursor = ""), (document.body.style.userSelect = ""));
        };
      return (
        window.addEventListener("mousemove", A),
        window.addEventListener("mouseup", Q),
        () => {
          (window.removeEventListener("mousemove", A), window.removeEventListener("mouseup", Q));
        }
      );
    }, [p, M, P]));
  const k =
      ((_ = ie({
        queryKey: U.documents.count,
        queryFn: () => Je({ page: 0, size: 1 }, r, s),
        enabled: !!n,
      }).data) == null
        ? void 0
        : _.totalElements) ?? 0,
    E = a.useCallback(
      (A) => {
        const Q = {
          dashboard: "/dashboard",
          documents: "/documents",
          mail: "/mail",
          calendar: "/calendar",
          audit: "/audit",
          settings: "/settings",
          acl: "/settings",
        };
        (A === "documents" && x(0), W(Q[A] ?? "/dashboard"));
      },
      [W],
    ),
    b = a.useCallback(() => N(!1), []),
    D = a.useCallback(() => {
      (W("/documents"), x((A) => A + 1));
    }, [W]),
    I = a.useMemo(() => {
      const A = i.trim().toLowerCase(),
        Q = A
          ? [
              {
                id: "handoff-docs",
                label: `Искать «${i.trim()}» в списке документов`,
                hint: "страница «Документы»",
                onActivate: () => {
                  (E("documents"), b());
                },
              },
            ]
          : [],
        S = [
          {
            id: "sec-dash",
            label: "Дашборд",
            hint: "раздел",
            onActivate: () => {
              (E("dashboard"), b());
            },
          },
          {
            id: "sec-docs",
            label: "Документы",
            hint: `${k} в системе`,
            onActivate: () => {
              (E("documents"), b());
            },
          },
          {
            id: "cmd-new",
            label: "Новый документ",
            hint: "загрузка",
            onActivate: () => {
              (D(), b());
            },
          },
          {
            id: "sec-mail",
            label: "Почта",
            hint: "раздел",
            onActivate: () => {
              (E("mail"), b());
            },
          },
          {
            id: "sec-cal",
            label: "Календарь",
            hint: "раздел",
            onActivate: () => {
              (E("calendar"), b());
            },
          },
          {
            id: "sec-settings",
            label: "Настройки",
            hint: "раздел",
            onActivate: () => {
              (E("settings"), b());
            },
          },
        ];
      Ie(e) &&
        S.push(
          {
            id: "sec-audit",
            label: "Журнал аудита",
            hint: "раздел",
            onActivate: () => {
              (E("audit"), b());
            },
          },
          {
            id: "sec-acl",
            label: "ACL",
            hint: "скоро",
            onActivate: () => {
              (E("acl"), b());
            },
          },
        );
      const z = (te) => {
          const G = `${te.label} ${te.hint ?? ""}`.toLowerCase();
          return A ? G.includes(A) || A.split(/\s+/).every((xe) => G.includes(xe)) : !0;
        },
        V = S.filter(z),
        le = [...Q, ...V];
      return A ? le : [];
    }, [i, k, e, E, D, b]);
  function $() {
    const A = I[0];
    if (A) {
      A.onActivate();
      return;
    }
    i.trim() && (E("documents"), b());
  }
  return t.jsxs("div", {
    className: "flex h-screen overflow-hidden bg-surface text-text",
    children: [
      t.jsx(us, {
        user: e,
        docCount: k,
        width: p ? 220 : u,
        navSearchQuery: i,
        onNavSearchChange: d,
        onNavSearchEnter: $,
        navResults: I,
        onNewDoc: D,
        section: F,
        onSection: E,
        onLogout: r,
        mobile: p,
        mobileOpen: w,
        onCloseMobile: () => N(!1),
      }),
      p &&
        w &&
        t.jsx("div", {
          "aria-hidden": !0,
          onClick: () => N(!1),
          className: "fixed inset-0 z-[34] bg-black/20",
        }),
      p &&
        !w &&
        t.jsx("button", {
          type: "button",
          onClick: () => N(!0),
          className:
            "fixed left-2.5 top-2.5 z-[32] rounded-md border border-border bg-white px-3 py-1 text-xs text-text",
          children: "Меню",
        }),
      p &&
        !v &&
        t.jsx("button", {
          type: "button",
          onClick: () => T(),
          className:
            "fixed right-2.5 top-2.5 z-[32] rounded-md border border-border bg-white px-3 py-1 text-xs text-text",
          children: "Ассистент",
        }),
      !p &&
        t.jsx("div", {
          onMouseDown: () => {
            (L("sidebar"),
              (document.body.style.cursor = "col-resize"),
              (document.body.style.userSelect = "none"));
          },
          className: "w-[6px] shrink-0 cursor-col-resize border-x border-border bg-transparent",
          title: "Изменить ширину левой панели",
        }),
      t.jsx("div", {
        className: `box-border flex min-w-0 flex-1 flex-col overflow-hidden ${p ? "pt-[52px]" : ""}`,
        children: t.jsxs(pn, {
          children: [
            t.jsx(ne, {
              path: "/dashboard",
              element: t.jsx(os, { token: n, onSessionExpired: r, onTokenRefresh: s }),
            }),
            t.jsx(ne, {
              path: "/documents",
              element: t.jsx(ss, {
                token: n,
                user: e,
                onSessionExpired: r,
                onTokenRefresh: s,
                section: "documents",
                uploadTrigger: c,
                searchQuery: i,
              }),
            }),
            t.jsx(ne, {
              path: "/mail",
              element: t.jsx(Ge, {
                title: "Почта",
                description: "Почтовый модуль находится в активной разработке.",
                hint: "Здесь будет полноценный интерфейс писем, черновиков и папок.",
                actionLabel: "Открыть входящие",
              }),
            }),
            t.jsx(ne, {
              path: "/calendar",
              element: t.jsx(Ge, {
                title: "Календарь",
                description: "Календарный модуль находится в активной разработке.",
                hint: "Здесь будет полноценный интерфейс встреч, расписания и занятости.",
                actionLabel: "Открыть календарь",
              }),
            }),
            t.jsx(ne, {
              path: "/audit",
              element: Ie(e)
                ? t.jsx(Ge, {
                    title: "Журнал аудита",
                    description: "Аудит действий и операций доступен в backend.",
                    hint: "После включения потока аудита в backend здесь появится лента операций и фильтры.",
                    actionLabel: "Запросить выгрузку аудита",
                  })
                : t.jsx(_e, { to: "/settings", replace: !0 }),
            }),
            t.jsx(ne, { path: "/settings", element: t.jsx(ds, { user: e }) }),
            t.jsx(ne, {
              path: "/documents/:documentId",
              element: t.jsx(ls, { token: n, onSessionExpired: r, onTokenRefresh: s }),
            }),
            t.jsx(ne, { path: "/", element: t.jsx(_e, { to: "/dashboard", replace: !0 }) }),
            t.jsx(ne, { path: "*", element: t.jsx(_e, { to: "/dashboard", replace: !0 }) }),
          ],
        }),
      }),
      !p &&
        t.jsx("div", {
          onMouseDown: () => {
            (L("ai"),
              (document.body.style.cursor = "col-resize"),
              (document.body.style.userSelect = "none"));
          },
          className: "w-[6px] shrink-0 cursor-col-resize border-x border-border bg-transparent",
          title: "Изменить ширину AI-панели",
        }),
      !p && t.jsx(Nt, { token: n, width: m, onSessionExpired: r, onTokenRefresh: s }),
      p &&
        v &&
        t.jsx("div", {
          role: "presentation",
          onClick: O,
          className: "fixed inset-0 z-[46] flex justify-end bg-black/20",
          children: t.jsx("div", {
            onClick: (A) => A.stopPropagation(),
            className: "h-full border-l border-border bg-surface",
            style: { width: h, maxWidth: 520 },
            children: t.jsx(Nt, {
              token: n,
              width: Math.min(h, 520),
              height: "100%",
              onSessionExpired: r,
              onTokenRefresh: s,
              onClose: O,
            }),
          }),
        }),
    ],
  });
}
export { hs as WorkspacePage };
