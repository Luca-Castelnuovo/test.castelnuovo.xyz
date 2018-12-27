!(function(Tea) {
  var Vea,
    Uea = (function() {
      var define, module, exports;
      return (function t(e, n, r) {
        var i = "function" == typeof require && require;
        function s(o, a) {
          if (!n[o]) {
            if (!e[o]) {
              var c = "function" == typeof require && require;
              if (!a && c) return c(o, !0);
              if (i) return i(o, !0);
              var u = new Error("Cannot find module '" + o + "'");
              throw ((u.code = "MODULE_NOT_FOUND"), u);
            }
            var l = (n[o] = { exports: {} });
            e[o][0].call(
              l.exports,
              function(t) {
                var n = e[o][1][t];
                return s(n || t);
              },
              l,
              l.exports,
              t,
              e,
              n,
              r
            );
          }
          return n[o].exports;
        }
        for (var o = 0; o < r.length; o++) s(r[o]);
        return s;
      })(
        {
          "./bundles/snippets.js": [
            function(t, e, n) {
              var r = t("../lib/assets/resources"),
                i = t("../lib/snippets.json");
              r.setVocabulary(i, "system");
            },
            {
              "../lib/assets/resources": "assets\\resources.js",
              "../lib/snippets.json": "snippets.json"
            }
          ],
          "./lib/emmet.js": [
            function(require, module, exports) {
              if ("object" == typeof module && "function" != typeof define)
                var define = function(t) {
                  module.exports = t(require, exports, module);
                };
              define(function(require, exports, module) {
                var global = "undefined" != typeof self ? self : this,
                  utils = require("./utils/common"),
                  actions = require("./action/main"),
                  parser = require("./parser/abbreviation"),
                  file = require("./plugin/file"),
                  preferences = require("./assets/preferences"),
                  resources = require("./assets/resources"),
                  profile = require("./assets/profile"),
                  ciu = require("./assets/caniuse"),
                  logger = require("./assets/logger"),
                  sliceFn = Array.prototype.slice;
                function getFileName(t) {
                  var e = /([\w\.\-]+)$/i.exec(t);
                  return e ? e[1] : "";
                }
                function normalizeProfile(t) {
                  return (
                    "object" == typeof t &&
                      ("indent" in t && (t.indent = !!t.indent),
                      "self_closing_tag" in t &&
                        "number" == typeof t.self_closing_tag &&
                        (t.self_closing_tag = !!t.self_closing_tag)),
                    t
                  );
                }
                return {
                  expandAbbreviation: function(t, e, n, r) {
                    return parser.expand(t, {
                      syntax: e,
                      profile: n,
                      contextNode: r
                    });
                  },
                  run: function(t) {
                    return actions.run.apply(
                      actions,
                      sliceFn.call(arguments, 0)
                    );
                  },
                  loadExtensions: function(fileList) {
                    var payload = {},
                      userSnippets = null,
                      that = this;
                    fileList = fileList.filter(function(t) {
                      var e = file.getExt(t);
                      return "json" === e || "js" === e;
                    });
                    var reader = (file.readText || file.read).bind(file),
                      next = function() {
                        if (fileList.length) {
                          var f = fileList.shift();
                          reader(f, function(err, content) {
                            if (err)
                              return (
                                logger.log(
                                  'Unable to read "' + f + '" file: ' + err
                                ),
                                next()
                              );
                            switch (file.getExt(f)) {
                              case "js":
                                try {
                                  eval(content);
                                } catch (t) {
                                  logger.log(
                                    'Unable to eval "' + f + '" file: ' + t
                                  );
                                }
                                break;
                              case "json":
                                var fileName = getFileName(f)
                                  .toLowerCase()
                                  .replace(/\.json$/, "");
                                (content = utils.parseJSON(content)),
                                  /^snippets/.test(fileName)
                                    ? "snippets" === fileName
                                      ? (userSnippets = content)
                                      : (payload.snippets = utils.deepMerge(
                                          payload.snippets || {},
                                          content
                                        ))
                                    : (payload[fileName] = content);
                            }
                            next();
                          });
                        } else
                          userSnippets &&
                            (payload.snippets = utils.deepMerge(
                              payload.snippets || {},
                              userSnippets
                            )),
                            that.loadUserData(payload);
                      };
                    next();
                  },
                  loadPreferences: function(t) {
                    preferences.load(utils.parseJSON(t));
                  },
                  loadSnippets: function(t) {
                    t = utils.parseJSON(t);
                    var e = resources.getVocabulary("user") || {};
                    resources.setVocabulary(utils.deepMerge(e, t), "user");
                  },
                  loadSystemSnippets: function(t) {
                    resources.setVocabulary(utils.parseJSON(t), "system");
                  },
                  loadCIU: function(t) {
                    ciu.load(utils.parseJSON(t));
                  },
                  resetSnippets: function() {
                    resources.setVocabulary({}, "user");
                  },
                  loadUserData: function(t) {
                    (t = utils.parseJSON(t)).snippets &&
                      this.loadSnippets(t.snippets),
                      t.preferences && this.loadPreferences(t.preferences),
                      t.profiles && this.loadProfiles(t.profiles),
                      t.caniuse && this.loadCIU(t.caniuse);
                    var e = t.syntaxProfiles || t.syntaxprofiles;
                    e && this.loadSyntaxProfiles(e);
                  },
                  resetUserData: function() {
                    this.resetSnippets(), preferences.reset(), profile.reset();
                  },
                  loadSyntaxProfiles: function(t) {
                    t = utils.parseJSON(t);
                    var e = {};
                    Object.keys(t).forEach(function(n) {
                      var r = t[n];
                      n in e || (e[n] = {}),
                        (e[n].profile = normalizeProfile(r));
                    }),
                      this.loadSnippets(e);
                  },
                  loadProfiles: function(t) {
                    (t = utils.parseJSON(t)),
                      Object.keys(t).forEach(function(e) {
                        profile.create(e, normalizeProfile(t[e]));
                      });
                  },
                  actions: actions,
                  parser: parser,
                  file: file,
                  preferences: preferences,
                  resources: resources,
                  profile: profile,
                  tabStops: require("./assets/tabStops"),
                  htmlMatcher: require("./assets/htmlMatcher"),
                  utils: {
                    common: utils,
                    action: require("./utils/action"),
                    editor: require("./utils/editor")
                  }
                };
              });
            },
            {
              "./action/main": "action\\main.js",
              "./assets/caniuse": "assets\\caniuse.js",
              "./assets/htmlMatcher": "assets\\htmlMatcher.js",
              "./assets/logger": "assets\\logger.js",
              "./assets/preferences": "assets\\preferences.js",
              "./assets/profile": "assets\\profile.js",
              "./assets/resources": "assets\\resources.js",
              "./assets/tabStops": "assets\\tabStops.js",
              "./parser/abbreviation": "parser\\abbreviation.js",
              "./plugin/file": "plugin\\file.js",
              "./utils/action": "utils\\action.js",
              "./utils/common": "utils\\common.js",
              "./utils/editor": "utils\\editor.js"
            }
          ],
          "action\\balance.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../assets/htmlMatcher"),
                  i = t("../utils/common"),
                  s = t("../utils/editor"),
                  o = t("../utils/action"),
                  a = t("../assets/range"),
                  c = t("../editTree/css"),
                  u = t("../utils/cssSections"),
                  l = null;
                function f(t) {
                  return t[t.length - 1];
                }
                function p(t, e) {
                  var n;
                  if ("string" == typeof t) {
                    var r = u.matchEnclosingRule(t, e);
                    r && (n = c.parse(r.substring(t), { offset: r.start }));
                  } else n = t;
                  if (!n) return null;
                  var s = (function(t, e) {
                    var n = [t.range(!0)];
                    n.push(t.valueRange(!0));
                    var r = u.nestedSectionsInRule(t),
                      i = t.list();
                    if (i.length || r.length) {
                      var s = Number.POSITIVE_INFINITY,
                        o = -1;
                      i.length &&
                        ((s = i[0].namePosition(!0)), (o = f(i).range(!0).end)),
                        r.length &&
                          (r[0].start < s && (s = r[0].start),
                          f(r).end > o && (o = f(r).end)),
                        n.push(a.create2(s, o));
                    }
                    n = n.concat(r);
                    var l = c.propertyFromPosition(t, e) || i[0];
                    if (l) {
                      n.push(l.range(!0));
                      var p = l.valueRange(!0);
                      l.end() || (p._unterminated = !0), n.push(p);
                    }
                    return n;
                  })(n, e);
                  return (
                    (s = s.filter(function(t) {
                      return !!t.length;
                    })),
                    i.unique(s, function(t) {
                      return t.valueOf();
                    })
                  );
                }
                return {
                  balance: function(t, e) {
                    e = String((e || "out").toLowerCase());
                    var n = s.outputInfo(t);
                    return o.isSupportedCSS(n.syntax)
                      ? (function(t, e) {
                          var n = s.outputInfo(t),
                            r = n.content,
                            o = a(t.getSelectionRange()),
                            u = p(n.content, o.start);
                          if (!u && o.length())
                            try {
                              var l = c.parse(o.substring(n.content), {
                                offset: o.start
                              });
                              u = p(l, o.start);
                            } catch (t) {}
                          if (!u) return !1;
                          u = a.sort(u, !0);
                          var d = i.find(u, function(t) {
                            return t.equal(o);
                          });
                          d ||
                            (d = i.find(u, function(t) {
                              return t._unterminated
                                ? t.include(o.start)
                                : t.inside(o.start);
                            }));
                          if (!d) return !1;
                          var h = u.indexOf(d);
                          d.equal(o) && (h += "out" == e ? 1 : -1);
                          if (h < 0 || h >= u.length)
                            if (h >= u.length && "out" == e) {
                              pos = d.start - 1;
                              var m = p(r, pos);
                              m &&
                                (d = f(
                                  m.filter(function(t) {
                                    return t.inside(pos);
                                  })
                                ));
                            } else d = null;
                          else d = u[h];
                          if (d) return t.createSelection(d.start, d.end), !0;
                          return !1;
                        })(t, e)
                      : (function(t, e) {
                          var n = s.outputInfo(t).content,
                            o = a(t.getSelectionRange());
                          l && !l.range.equal(o) && (l = null);
                          if (l && o.length())
                            if ("in" == e) {
                              if ("tag" == l.type && !l.close) return !1;
                              if (l.range.equal(l.outerRange))
                                l.range = l.innerRange;
                              else {
                                var c = i.narrowToNonSpace(n, l.innerRange);
                                (l = r.find(n, c.start + 1)) &&
                                  l.range.equal(o) &&
                                  l.outerRange.equal(o) &&
                                  (l.range = l.innerRange);
                              }
                            } else
                              !l.innerRange.equal(l.outerRange) &&
                              l.range.equal(l.innerRange) &&
                              o.equal(l.range)
                                ? (l.range = l.outerRange)
                                : (l = r.find(n, o.start)) &&
                                  l.range.equal(o) &&
                                  l.innerRange.equal(o) &&
                                  (l.range = l.outerRange);
                          else l = r.find(n, o.start);
                          if (
                            l &&
                            (l.innerRange.equal(o) && (l.range = l.outerRange),
                            !l.range.equal(o))
                          )
                            return (
                              t.createSelection(l.range.start, l.range.end), !0
                            );
                          return (l = null), !1;
                        })(t, e);
                  },
                  balanceInwardAction: function(t) {
                    return this.balance(t, "in");
                  },
                  balanceOutwardAction: function(t) {
                    return this.balance(t, "out");
                  },
                  goToMatchingPairAction: function(t) {
                    var e = String(t.getContent()),
                      n = t.getCaretPos();
                    "<" == e.charAt(n) && n++;
                    var i = r.tag(e, n);
                    return (
                      !(!i || !i.close) &&
                      (i.open.range.inside(n)
                        ? t.setCaretPos(i.close.range.start)
                        : t.setCaretPos(i.open.range.start),
                      !0)
                    );
                  }
                };
              });
            },
            {
              "../assets/htmlMatcher": "assets\\htmlMatcher.js",
              "../assets/range": "assets\\range.js",
              "../editTree/css": "editTree\\css.js",
              "../utils/action": "utils\\action.js",
              "../utils/common": "utils\\common.js",
              "../utils/cssSections": "utils\\cssSections.js",
              "../utils/editor": "utils\\editor.js"
            }
          ],
          "action\\base64.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../plugin/file"),
                  i = t("../utils/base64"),
                  s = t("../utils/action"),
                  o = t("../utils/editor");
                function a(t, e, n) {
                  return (
                    (n = n || 0),
                    e.charAt(n) == t.charAt(0) && e.substr(n, t.length) == t
                  );
                }
                return {
                  encodeDecodeDataUrlAction: function(t, e) {
                    var n = String(t.getSelection()),
                      c = t.getCaretPos(),
                      u = o.outputInfo(t);
                    if (!n)
                      for (var l, f = u.content; c-- >= 0; ) {
                        if (a("src=", f, c)) {
                          (l = f
                            .substr(c)
                            .match(/^(src=(["'])?)([^'"<>\s]+)\1?/)) &&
                            ((n = l[3]), (c += l[1].length));
                          break;
                        }
                        if (a("url(", f, c)) {
                          (l = f
                            .substr(c)
                            .match(/^(url\((['"])?)([^'"\)\s]+)\1?/)) &&
                            ((n = l[3]), (c += l[1].length));
                          break;
                        }
                      }
                    return (
                      !!n &&
                      (a("data:", n)
                        ? (function(t, e, n, s) {
                            if (
                              !(e =
                                e ||
                                String(
                                  t.prompt(
                                    "Enter path to file (absolute or relative)"
                                  )
                                ))
                            )
                              return !1;
                            var o = t.getFilePath();
                            return (
                              r.createPath(o, e, function(o, a) {
                                if (o || !a) throw "Can't save file";
                                var c = n.replace(/^data\:.+?;.+?,/, "");
                                r.save(a, i.decode(c), function(r) {
                                  if (r) throw "Unable to save " + a + ": " + r;
                                  t.replaceContent("$0" + e, s, s + n.length);
                                });
                              }),
                              !0
                            );
                          })(t, e, n, c)
                        : (function(t, e, n) {
                            var o = t.getFilePath();
                            if (null === o)
                              throw "You should save your file before using this action";
                            return (
                              r.locateFile(o, e, function(o) {
                                if (null === o)
                                  throw "Can't find " + e + " file";
                                r.read(o, function(a, c) {
                                  if (a) throw "Unable to read " + o + ": " + a;
                                  var u = i.encode(String(c));
                                  if (!u)
                                    throw "Can't encode file content to base64";
                                  (u =
                                    "data:" +
                                    (s.mimeTypes[String(r.getExt(o))] ||
                                      "application/octet-stream") +
                                    ";base64," +
                                    u),
                                    t.replaceContent("$0" + u, n, n + e.length);
                                });
                              }),
                              !0
                            );
                          })(t, n, c))
                    );
                  }
                };
              });
            },
            {
              "../plugin/file": "plugin\\file.js",
              "../utils/action": "utils\\action.js",
              "../utils/base64": "utils\\base64.js",
              "../utils/editor": "utils\\editor.js"
            }
          ],
          "action\\editPoints.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                function r(t, e, n) {
                  (e = e || 1), (n = n || 0);
                  var r = t.getCaretPos() + n,
                    i = String(t.getContent()),
                    s = i.length,
                    o = -1,
                    a = /^\s+$/;
                  function c(t) {
                    for (var e = t; e >= 0; ) {
                      var n = i.charAt(e);
                      if ("\n" == n || "\r" == n) break;
                      e--;
                    }
                    return i.substring(e, t);
                  }
                  for (; r <= s && r >= 0; ) {
                    r += e;
                    var u = i.charAt(r),
                      l = i.charAt(r + 1),
                      f = i.charAt(r - 1);
                    switch (u) {
                      case '"':
                      case "'":
                        l == u && "=" == f && (o = r + 1);
                        break;
                      case ">":
                        "<" == l && (o = r + 1);
                        break;
                      case "\n":
                      case "\r":
                        a.test(c(r - 1)) && (o = r);
                    }
                    if (-1 != o) break;
                  }
                  return o;
                }
                return {
                  previousEditPointAction: function(t, e, n) {
                    var i = t.getCaretPos(),
                      s = r(t, -1);
                    return (
                      s == i && (s = r(t, -1, -2)),
                      -1 != s && (t.setCaretPos(s), !0)
                    );
                  },
                  nextEditPointAction: function(t, e, n) {
                    var i = r(t, 1);
                    return -1 != i && (t.setCaretPos(i), !0);
                  }
                };
              });
            },
            {}
          ],
          "action\\evaluateMath.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../utils/action"),
                  i = t("../utils/common"),
                  s = t("../utils/math"),
                  o = t("../assets/range");
                return {
                  evaluateMathAction: function(t) {
                    var e = t.getContent(),
                      n = o(t.getSelectionRange());
                    if (
                      (n.length() ||
                        (n = r.findExpressionBounds(t, function(t) {
                          return i.isNumeric(t) || -1 != ".+-*/\\".indexOf(t);
                        })),
                      n && n.length())
                    ) {
                      var a = n.substring(e);
                      a = a.replace(
                        /([\d\.\-]+)\\([\d\.\-]+)/g,
                        "round($1/$2)"
                      );
                      try {
                        var c = i.prettifyNumber(s.evaluate(a));
                        return (
                          t.replaceContent(c, n.start, n.end),
                          t.setCaretPos(n.start + c.length),
                          !0
                        );
                      } catch (t) {}
                    }
                    return !1;
                  }
                };
              });
            },
            {
              "../assets/range": "assets\\range.js",
              "../utils/action": "utils\\action.js",
              "../utils/common": "utils\\common.js",
              "../utils/math": "utils\\math.js"
            }
          ],
          "action\\expandAbbreviation.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../assets/handlerList"),
                  i = t("../assets/range"),
                  s = t("../assets/preferences"),
                  o = t("../utils/common"),
                  a = t("../utils/editor"),
                  c = t("../utils/action"),
                  u = t("../resolver/cssGradient"),
                  l = t("../parser/abbreviation");
                function f(t) {
                  var e = i(t.getSelectionRange()),
                    n = String(t.getContent());
                  if (e.length()) return e.substring(n);
                  var r = t.getCurrentLineRange();
                  return c.extractAbbreviation(n.substring(r.start, e.start));
                }
                var p = r.create();
                return (
                  p.add(
                    function(t, e, n) {
                      var r = t.getSelectionRange().end,
                        i = f(t);
                      if (i) {
                        var o = l.expand(i, {
                          syntax: e,
                          profile: n,
                          contextNode: c.captureContext(t)
                        });
                        if (o) {
                          var a = r - i.length,
                            u = r,
                            p = s.getArray("css.syntaxes");
                          if (p && ~p.indexOf(e)) {
                            var d = t.getContent();
                            ";" == d.charAt(r) &&
                              ";" == o.charAt(o.length - 1) &&
                              u++;
                          }
                          return t.replaceContent(o, a, u), !0;
                        }
                      }
                      return !1;
                    },
                    { order: -1 }
                  ),
                  p.add(u.expandAbbreviationHandler.bind(u)),
                  {
                    expandAbbreviationAction: function(t, e, n) {
                      var r = o.toArray(arguments),
                        i = a.outputInfo(t, e, n);
                      return (
                        (r[1] = i.syntax), (r[2] = i.profile), p.exec(!1, r)
                      );
                    },
                    expandAbbreviationWithTabAction: function(t, e, n) {
                      var r = t.getSelection();
                      if (r) {
                        var s = i(t.getSelectionRange()),
                          a = o.padString(r, "\t");
                        t.replaceContent("\t${0}", t.getCaretPos());
                        var c = i(t.getCaretPos(), s.length());
                        return (
                          t.replaceContent(a, c.start, c.end, !0),
                          t.createSelection(c.start, c.start + a.length),
                          !0
                        );
                      }
                      return (
                        this.expandAbbreviationAction(t, e, n) ||
                          t.replaceContent("\t", t.getCaretPos()),
                        !0
                      );
                    },
                    _defaultHandler: function(t, e, n) {
                      var r = t.getSelectionRange().end,
                        i = this.findAbbreviation(t);
                      if (i) {
                        var s = c.captureContext(t),
                          o = l.expand(i, e, n, s);
                        if (o) return t.replaceContent(o, r - i.length, r), !0;
                      }
                      return !1;
                    },
                    addHandler: function(t, e) {
                      p.add(t, e);
                    },
                    removeHandler: function(t) {
                      p.remove(t);
                    },
                    findAbbreviation: f
                  }
                );
              });
            },
            {
              "../assets/handlerList": "assets\\handlerList.js",
              "../assets/preferences": "assets\\preferences.js",
              "../assets/range": "assets\\range.js",
              "../parser/abbreviation": "parser\\abbreviation.js",
              "../resolver/cssGradient": "resolver\\cssGradient.js",
              "../utils/action": "utils\\action.js",
              "../utils/common": "utils\\common.js",
              "../utils/editor": "utils\\editor.js"
            }
          ],
          "action\\incrementDecrement.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../utils/common"),
                  i = t("../utils/action");
                return {
                  increment01Action: function(t) {
                    return this.incrementNumber(t, 0.1);
                  },
                  increment1Action: function(t) {
                    return this.incrementNumber(t, 1);
                  },
                  increment10Action: function(t) {
                    return this.incrementNumber(t, 10);
                  },
                  decrement01Action: function(t) {
                    return this.incrementNumber(t, -0.1);
                  },
                  decrement1Action: function(t) {
                    return this.incrementNumber(t, -1);
                  },
                  decrement10Action: function(t) {
                    return this.incrementNumber(t, -10);
                  },
                  incrementNumber: function(t, e) {
                    var n = !1,
                      s = !1,
                      o = i.findExpressionBounds(t, function(t, e, i) {
                        return (
                          !!r.isNumeric(t) ||
                          ("." == t
                            ? !!r.isNumeric(i.charAt(e + 1)) && (!s && (s = !0))
                            : "-" == t && (!n && (n = !0)))
                        );
                      });
                    if (o && o.length()) {
                      var a = o.substring(String(t.getContent())),
                        c = parseFloat(a);
                      if (!isNaN(c)) {
                        if (
                          ((c = r.prettifyNumber(c + e)),
                          /^(\-?)0+[1-9]/.test(a))
                        ) {
                          var u = "";
                          RegExp.$1 && ((u = "-"), (c = c.substring(1)));
                          var l = c.split(".");
                          (l[0] = r.zeroPadString(
                            l[0],
                            (function(t) {
                              if (~(t = t.replace(/^\-/, "")).indexOf("."))
                                return t.split(".")[0].length;
                              return t.length;
                            })(a)
                          )),
                            (c = u + l.join("."));
                        }
                        return (
                          t.replaceContent(c, o.start, o.end),
                          t.createSelection(o.start, o.start + c.length),
                          !0
                        );
                      }
                    }
                    return !1;
                  }
                };
              });
            },
            {
              "../utils/action": "utils\\action.js",
              "../utils/common": "utils\\common.js"
            }
          ],
          "action\\lineBreaks.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../assets/preferences"),
                  i = t("../utils/common"),
                  s = (t("../assets/resources"), t("../assets/htmlMatcher")),
                  o = t("../utils/editor"),
                  a = ["html", "xml", "xsl"];
                return (
                  r.define(
                    "css.closeBraceIndentation",
                    "\n",
                    "Indentation before closing brace of CSS rule. Some users prefere indented closing brace of CSS rule for better readability. This preference’s value will be automatically inserted before closing brace when user adds newline in newly created CSS rule (e.g. when “Insert formatted linebreak” action will be performed in CSS file). If you’re such user, you may want to write put a value like <code>\\n\\t</code> in this preference."
                  ),
                  {
                    insertLineBreakAction: function(t) {
                      if (!this.insertLineBreakOnlyAction(t)) {
                        for (
                          var e,
                            n = o.getCurrentLinePadding(t),
                            r = String(t.getContent()),
                            i = t.getCaretPos(),
                            s = r.length,
                            a = t.getCurrentLineRange(),
                            c = "",
                            u = a.end;
                          u < s && (" " == (e = r.charAt(u)) || "\t" == e);
                          u++
                        )
                          c += e;
                        c.length > n.length
                          ? t.replaceContent("\n" + c, i, i, !0)
                          : t.replaceContent("\n", i);
                      }
                      return !0;
                    },
                    insertLineBreakOnlyAction: function(t) {
                      var e = o.outputInfo(t),
                        n = t.getCaretPos();
                      if (~a.indexOf(e.syntax)) {
                        var c = s.tag(e.content, n);
                        if (c && !c.innerRange.length())
                          return (
                            t.replaceContent(
                              "\n\t" + i.getCaretPlaceholder() + "\n",
                              n
                            ),
                            !0
                          );
                      } else if ("css" == e.syntax) {
                        var u = e.content;
                        if (n && "{" == u.charAt(n - 1)) {
                          var l = r.get("css.closeBraceIndentation"),
                            f = "}" == u.charAt(n);
                          if (!f)
                            for (
                              var p, d = n, h = u.length;
                              d < h && "{" != (p = u.charAt(d));
                              d++
                            )
                              if ("}" == p) {
                                (l = ""), (f = !0);
                                break;
                              }
                          f || (l += "}");
                          var m = "\n\t" + i.getCaretPlaceholder() + l;
                          return t.replaceContent(m, n), !0;
                        }
                      }
                      return !1;
                    }
                  }
                );
              });
            },
            {
              "../assets/htmlMatcher": "assets\\htmlMatcher.js",
              "../assets/preferences": "assets\\preferences.js",
              "../assets/resources": "assets\\resources.js",
              "../utils/common": "utils\\common.js",
              "../utils/editor": "utils\\editor.js"
            }
          ],
          "action\\main.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../utils/common"),
                  i = {},
                  s = {
                    base64: t("./base64"),
                    editPoints: t("./editPoints"),
                    evaluateMath: t("./evaluateMath"),
                    expandAbbreviation: t("./expandAbbreviation"),
                    incrementDecrement: t("./incrementDecrement"),
                    lineBreaks: t("./lineBreaks"),
                    balance: t("./balance"),
                    mergeLines: t("./mergeLines"),
                    reflectCSSValue: t("./reflectCSSValue"),
                    removeTag: t("./removeTag"),
                    selectItem: t("./selectItem"),
                    selectLine: t("./selectLine"),
                    splitJoinTag: t("./splitJoinTag"),
                    toggleComment: t("./toggleComment"),
                    updateImageSize: t("./updateImageSize"),
                    wrapWithAbbreviation: t("./wrapWithAbbreviation"),
                    updateTag: t("./updateTag")
                  };
                function o(t, e, n) {
                  (t = t.toLowerCase()),
                    "string" == typeof (n = n || {}) && (n = { label: n }),
                    n.label || (n.label = a(t)),
                    (i[t] = { name: t, fn: e, options: n });
                }
                function a(t) {
                  return r.trim(
                    t.charAt(0).toUpperCase() +
                      t.substring(1).replace(/_[a-z]/g, function(t) {
                        return " " + t.charAt(1).toUpperCase();
                      })
                  );
                }
                var c = function(t, e) {
                  var n = s[t];
                  return n[e].bind(n);
                };
                return (
                  o(
                    "encode_decode_data_url",
                    c("base64", "encodeDecodeDataUrlAction"),
                    "Encode\\Decode data:URL image"
                  ),
                  o(
                    "prev_edit_point",
                    c("editPoints", "previousEditPointAction"),
                    "Previous Edit Point"
                  ),
                  o(
                    "next_edit_point",
                    c("editPoints", "nextEditPointAction"),
                    "Next Edit Point"
                  ),
                  o(
                    "evaluate_math_expression",
                    c("evaluateMath", "evaluateMathAction"),
                    "Numbers/Evaluate Math Expression"
                  ),
                  o(
                    "expand_abbreviation_with_tab",
                    c("expandAbbreviation", "expandAbbreviationWithTabAction"),
                    { hidden: !0 }
                  ),
                  o(
                    "expand_abbreviation",
                    c("expandAbbreviation", "expandAbbreviationAction"),
                    "Expand Abbreviation"
                  ),
                  o(
                    "insert_formatted_line_break_only",
                    c("lineBreaks", "insertLineBreakOnlyAction"),
                    { hidden: !0 }
                  ),
                  o(
                    "insert_formatted_line_break",
                    c("lineBreaks", "insertLineBreakAction"),
                    { hidden: !0 }
                  ),
                  o(
                    "balance_inward",
                    c("balance", "balanceInwardAction"),
                    "Balance (inward)"
                  ),
                  o(
                    "balance_outward",
                    c("balance", "balanceOutwardAction"),
                    "Balance (outward)"
                  ),
                  o(
                    "matching_pair",
                    c("balance", "goToMatchingPairAction"),
                    "HTML/Go To Matching Tag Pair"
                  ),
                  o(
                    "merge_lines",
                    c("mergeLines", "mergeLinesAction"),
                    "Merge Lines"
                  ),
                  o(
                    "reflect_css_value",
                    c("reflectCSSValue", "reflectCSSValueAction"),
                    "CSS/Reflect Value"
                  ),
                  o(
                    "remove_tag",
                    c("removeTag", "removeTagAction"),
                    "HTML/Remove Tag"
                  ),
                  o(
                    "select_next_item",
                    c("selectItem", "selectNextItemAction"),
                    "Select Next Item"
                  ),
                  o(
                    "select_previous_item",
                    c("selectItem", "selectPreviousItemAction"),
                    "Select Previous Item"
                  ),
                  o(
                    "split_join_tag",
                    c("splitJoinTag", "splitJoinTagAction"),
                    "HTML/Split\\Join Tag Declaration"
                  ),
                  o(
                    "toggle_comment",
                    c("toggleComment", "toggleCommentAction"),
                    "Toggle Comment"
                  ),
                  o(
                    "update_image_size",
                    c("updateImageSize", "updateImageSizeAction"),
                    "Update Image Size"
                  ),
                  o(
                    "wrap_with_abbreviation",
                    c("wrapWithAbbreviation", "wrapWithAbbreviationAction"),
                    "Wrap With Abbreviation"
                  ),
                  o(
                    "update_tag",
                    c("updateTag", "updateTagAction"),
                    "HTML/Update Tag"
                  ),
                  [1, -1, 10, -10, 0.1, -0.1].forEach(function(t) {
                    var e = t > 0 ? "increment" : "decrement",
                      n = String(Math.abs(t))
                        .replace(".", "")
                        .substring(0, 2),
                      r = e + "_number_by_" + n,
                      i = e + n + "Action",
                      s =
                        "Numbers/" +
                        e.charAt(0).toUpperCase() +
                        e.substring(1) +
                        " number by " +
                        Math.abs(t);
                    o(r, c("incrementDecrement", i), s);
                  }),
                  {
                    add: o,
                    get: function(t) {
                      return i[t.toLowerCase()];
                    },
                    run: function(t, e) {
                      Array.isArray(e) || (e = r.toArray(arguments, 1));
                      var n = this.get(t);
                      if (!n)
                        throw new Error('Action "' + t + '" is not defined');
                      return n.fn.apply(n, e);
                    },
                    getAll: function() {
                      return i;
                    },
                    getList: function() {
                      var t = this.getAll();
                      return Object.keys(t).map(function(e) {
                        return t[e];
                      });
                    },
                    getMenu: function(t) {
                      var e = [];
                      return (
                        (t = t || []),
                        this.getList().forEach(function(n) {
                          if (!n.options.hidden && !~t.indexOf(n.name)) {
                            var i = a(n.name),
                              s = e;
                            if (n.options.label) {
                              var o,
                                c,
                                u = n.options.label.split("/");
                              for (i = u.pop(); (o = u.shift()); )
                                (c = r.find(s, function(t) {
                                  return "submenu" == t.type && t.name == o;
                                })) ||
                                  ((c = {
                                    name: o,
                                    type: "submenu",
                                    items: []
                                  }),
                                  s.push(c)),
                                  (s = c.items);
                            }
                            s.push({ type: "action", name: n.name, label: i });
                          }
                        }),
                        e
                      );
                    },
                    getActionNameForMenuTitle: function(t, e) {
                      return r.find(
                        e || this.getMenu(),
                        function(e) {
                          return "action" != e.type
                            ? this.getActionNameForMenuTitle(t, e.items)
                            : e.label == t || e.name == t
                            ? e.name
                            : void 0;
                        },
                        this
                      );
                    }
                  }
                );
              });
            },
            {
              "../utils/common": "utils\\common.js",
              "./balance": "action\\balance.js",
              "./base64": "action\\base64.js",
              "./editPoints": "action\\editPoints.js",
              "./evaluateMath": "action\\evaluateMath.js",
              "./expandAbbreviation": "action\\expandAbbreviation.js",
              "./incrementDecrement": "action\\incrementDecrement.js",
              "./lineBreaks": "action\\lineBreaks.js",
              "./mergeLines": "action\\mergeLines.js",
              "./reflectCSSValue": "action\\reflectCSSValue.js",
              "./removeTag": "action\\removeTag.js",
              "./selectItem": "action\\selectItem.js",
              "./selectLine": "action\\selectLine.js",
              "./splitJoinTag": "action\\splitJoinTag.js",
              "./toggleComment": "action\\toggleComment.js",
              "./updateImageSize": "action\\updateImageSize.js",
              "./updateTag": "action\\updateTag.js",
              "./wrapWithAbbreviation": "action\\wrapWithAbbreviation.js"
            }
          ],
          "action\\mergeLines.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../assets/htmlMatcher"),
                  i = t("../utils/common"),
                  s = t("../utils/editor"),
                  o = t("../assets/range");
                return {
                  mergeLinesAction: function(t) {
                    var e = s.outputInfo(t),
                      n = o(t.getSelectionRange());
                    if (!n.length()) {
                      var a = r.find(e.content, t.getCaretPos());
                      a && (n = a.outerRange);
                    }
                    if (n.length()) {
                      for (
                        var c = n.substring(e.content),
                          u = i.splitByLines(c),
                          l = 1;
                        l < u.length;
                        l++
                      )
                        u[l] = u[l].replace(/^\s+/, "");
                      var f = (c = u.join("").replace(/\s{2,}/, " ")).length;
                      return (
                        (c = i.escapeText(c)),
                        t.replaceContent(c, n.start, n.end),
                        t.createSelection(n.start, n.start + f),
                        !0
                      );
                    }
                    return !1;
                  }
                };
              });
            },
            {
              "../assets/htmlMatcher": "assets\\htmlMatcher.js",
              "../assets/range": "assets\\range.js",
              "../utils/common": "utils\\common.js",
              "../utils/editor": "utils\\editor.js"
            }
          ],
          "action\\reflectCSSValue.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../assets/handlerList"),
                  i = t("../assets/preferences"),
                  s = t("../resolver/css"),
                  o = t("../editTree/css"),
                  a = t("../utils/common"),
                  c = t("../utils/action"),
                  u = t("../utils/editor"),
                  l = t("../resolver/cssGradient");
                i.define(
                  "css.reflect.oldIEOpacity",
                  !1,
                  "Support IE6/7/8 opacity notation, e.g. <code>filter:alpha(opacity=...)</code>.\t\tNote that CSS3 and SVG also provides <code>filter</code> property so this option is disabled by default."
                );
                var f = r.create();
                function p(t, e) {
                  var n,
                    r,
                    i,
                    c,
                    u,
                    l = (function(t, e, n, r) {
                      {
                        if (
                          ((t = o.baseName(t)),
                          (n = o.baseName(n)),
                          "opacity" == t && "filter" == n)
                        )
                          return r.replace(
                            /opacity=[^)]*/i,
                            "opacity=" + Math.floor(100 * parseFloat(e))
                          );
                        if ("filter" == t && "opacity" == n) {
                          var i = e.match(/opacity=([^)]*)/i);
                          return i
                            ? a.prettifyNumber(parseInt(i[1], 10) / 100)
                            : r;
                        }
                      }
                      return e;
                    })(t.name(), t.value(), e.name(), e.value());
                  (n = e.name()),
                    (r = l),
                    (c = (i = /^\-(\w+)\-/).test(n)
                      ? RegExp.$1.toLowerCase()
                      : ""),
                    (u = o.findParts(r)).reverse(),
                    u.forEach(function(t) {
                      var e = t.substring(r).replace(i, ""),
                        n = s.vendorPrefixes(e);
                      n &&
                        (c && ~n.indexOf(c) && (e = "-" + c + "-" + e),
                        (r = a.replaceSubstring(r, e, t)));
                    }),
                    (l = r),
                    e.value(l);
                }
                return (
                  ((n = n || {}).exports = {
                    reflectCSSValueAction: function(t) {
                      return (
                        "css" == t.getSyntax() &&
                        c.compoundUpdate(
                          t,
                          (function(t) {
                            var e = u.outputInfo(t),
                              n = t.getCaretPos(),
                              r = o.parseFromPosition(e.content, n);
                            if (!r) return;
                            var i = r.itemFromPosition(n, !0);
                            if (!i) return;
                            var s = r.source,
                              a = r.options.offset,
                              c = n - a - i.range().start;
                            if ((f.exec(!1, [i]), s !== r.source))
                              return {
                                data: r.source,
                                start: a,
                                end: a + s.length,
                                caret: a + i.range().start + c
                              };
                          })(t)
                        )
                      );
                    },
                    _defaultHandler: function(t) {
                      var e = (function(t) {
                        var e,
                          n = "^(?:\\-\\w+\\-)?";
                        {
                          if (
                            ("opacity" == (t = o.baseName(t)) ||
                              "filter" == t) &&
                            i.get("css.reflect.oldIEOpacity")
                          )
                            return new RegExp(n + "(?:opacity|filter)$");
                          if (
                            (e = t.match(
                              /^border-radius-(top|bottom)(left|right)/
                            ))
                          )
                            return new RegExp(
                              n +
                                "(?:" +
                                t +
                                "|border-" +
                                e[1] +
                                "-" +
                                e[2] +
                                "-radius)$"
                            );
                          if (
                            (e = t.match(
                              /^border-(top|bottom)-(left|right)-radius/
                            ))
                          )
                            return new RegExp(
                              n +
                                "(?:" +
                                t +
                                "|border-radius-" +
                                e[1] +
                                e[2] +
                                ")$"
                            );
                        }
                        return new RegExp(n + t + "$");
                      })(t.name());
                      t.parent.list().forEach(function(n) {
                        e.test(n.name()) && p(t, n);
                      });
                    },
                    addHandler: function(t, e) {
                      f.add(t, e);
                    },
                    removeHandler: function(t) {
                      f.remove(t);
                    }
                  }),
                  f.add(n.exports._defaultHandler.bind(n.exports), {
                    order: -1
                  }),
                  f.add(l.reflectValueHandler.bind(l)),
                  n.exports
                );
              });
            },
            {
              "../assets/handlerList": "assets\\handlerList.js",
              "../assets/preferences": "assets\\preferences.js",
              "../editTree/css": "editTree\\css.js",
              "../resolver/css": "resolver\\css.js",
              "../resolver/cssGradient": "resolver\\cssGradient.js",
              "../utils/action": "utils\\action.js",
              "../utils/common": "utils\\common.js",
              "../utils/editor": "utils\\editor.js"
            }
          ],
          "action\\removeTag.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../utils/common"),
                  i = t("../utils/editor"),
                  s = t("../assets/htmlMatcher");
                return {
                  removeTagAction: function(t) {
                    var e = i.outputInfo(t),
                      n = s.tag(e.content, t.getCaretPos());
                    if (n) {
                      if (n.close) {
                        var o = r.narrowToNonSpace(e.content, n.innerRange),
                          a = r.findNewlineBounds(e.content, o.start),
                          c = r.getLinePadding(a.substring(e.content)),
                          u = o.substring(e.content);
                        (u = r.unindentString(u, c)),
                          t.replaceContent(
                            r.getCaretPlaceholder() + r.escapeText(u),
                            n.outerRange.start,
                            n.outerRange.end
                          );
                      } else
                        t.replaceContent(
                          r.getCaretPlaceholder(),
                          n.range.start,
                          n.range.end
                        );
                      return !0;
                    }
                    return !1;
                  }
                };
              });
            },
            {
              "../assets/htmlMatcher": "assets\\htmlMatcher.js",
              "../utils/common": "utils\\common.js",
              "../utils/editor": "utils\\editor.js"
            }
          ],
          "action\\selectItem.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../assets/range"),
                  i = t("../utils/common"),
                  s = t("../utils/editor"),
                  o = t("../utils/action"),
                  a = t("../assets/stringStream"),
                  c = t("../parser/xml"),
                  u = t("../editTree/css"),
                  l = t("../utils/cssSections"),
                  f = /^<([\w\:\-]+)((?:\s+[\w\-:]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/;
                function p(t, e, n, i) {
                  for (
                    var o,
                      a,
                      c = s.outputInfo(t).content,
                      u = c.length,
                      l = r(-1, 0),
                      f = r(t.getSelectionRange()),
                      p = f.start,
                      d = 1e5;
                    p >= 0 && p < u && --d > 0;

                  ) {
                    if ((o = n(c, p, e))) {
                      if (l.equal(o)) break;
                      if (
                        ((l = o.clone()),
                        (a = i(o.substring(c), o.start, f.clone())))
                      )
                        return t.createSelection(a.start, a.end), !0;
                      p = e ? o.start : o.end - 1;
                    }
                    p += e ? -1 : 1;
                  }
                  return !1;
                }
                function d(t) {
                  var e = !0;
                  return p(
                    t,
                    !1,
                    function(t, n) {
                      return e
                        ? ((e = !1),
                          (function(t, e) {
                            var n;
                            for (; e >= 0; ) {
                              if ((n = g(t, e))) return n;
                              e--;
                            }
                            return null;
                          })(t, n))
                        : g(t, n);
                    },
                    function(t, e, n) {
                      return m(t, e, n, !1);
                    }
                  );
                }
                function h(t, e, n) {
                  n = n || 0;
                  var s,
                    o,
                    c = [],
                    u = -1,
                    l = "",
                    f = "";
                  return (
                    e.forEach(function(e) {
                      switch (e.type) {
                        case "tag":
                          (o = t.substring(e.start, e.end)),
                            /^<[\w\:\-]/.test(o) &&
                              c.push(r({ start: e.start + 1, end: e.end }));
                          break;
                        case "attribute":
                          (u = e.start), (l = t.substring(e.start, e.end));
                          break;
                        case "string":
                          c.push(r(u, e.end - u)),
                            (s = r(e)),
                            b((f = s.substring(t)).charAt(0)) && s.start++,
                            b(f.charAt(f.length - 1)) && s.end--,
                            c.push(s),
                            "class" == l &&
                              (c = c.concat(
                                (function(t, e) {
                                  e = e || 0;
                                  var n,
                                    i = [],
                                    s = a.create(t);
                                  s.eatSpace(), (s.start = s.pos);
                                  for (; (n = s.next()); )
                                    /[\s\u00a0]/.test(n) &&
                                      (i.push(
                                        r(s.start + e, s.pos - s.start - 1)
                                      ),
                                      s.eatSpace(),
                                      (s.start = s.pos));
                                  return (
                                    i.push(r(s.start + e, s.pos - s.start)), i
                                  );
                                })(s.substring(t), s.start)
                              ));
                      }
                    }),
                    (c = c.filter(function(t) {
                      if (t.length()) return t.shift(n), !0;
                    })),
                    i.unique(c, function(t) {
                      return t.toString();
                    })
                  );
                }
                function m(t, e, n, r) {
                  var s = h(t, c.parse(t), e);
                  r && s.reverse();
                  var o = i.find(s, function(t) {
                    return t.equal(n);
                  });
                  if (o) {
                    var a = s.indexOf(o);
                    return a < s.length - 1 ? s[a + 1] : null;
                  }
                  if (r)
                    return i.find(s, function(t) {
                      return t.start < n.start;
                    });
                  if (!o) {
                    var u = s.filter(function(t) {
                      return t.inside(n.end);
                    });
                    if (u.length > 1) return u[1];
                  }
                  return i.find(s, function(t) {
                    return t.end > n.end;
                  });
                }
                function g(t, e) {
                  var n;
                  if (
                    "<" == t.charAt(e) &&
                    (n = t.substring(e, t.length).match(f))
                  )
                    return r(e, n[0]);
                }
                function b(t) {
                  return '"' == t || "'" == t;
                }
                function v(t) {
                  var e = [t.nameRange(!0)],
                    n = l.nestedSectionsInRule(t);
                  return (
                    n.forEach(function(t) {
                      e.push(r.create2(t.start, t._selectorEnd));
                    }),
                    t.list().forEach(function(t) {
                      var n, i, s, o;
                      e = e.concat(
                        ((i = (n = t).valueRange(!0)),
                        (s = [n.range(!0), i]),
                        (o = n.value()),
                        n.valueParts().forEach(function(t) {
                          var e = t.clone();
                          s.push(e.shift(i.start));
                          var n = a.create(t.substring(o));
                          if (n.match(/^[\w\-]+\(/, !0)) {
                            (n.start = n.pos),
                              n.backUp(1),
                              n.skipToPair("(", ")"),
                              n.backUp(1);
                            var c = n.current();
                            s.push(r(e.start + n.start, c)),
                              u.findParts(c).forEach(function(t) {
                                s.push(
                                  r(e.start + n.start + t.start, t.substring(c))
                                );
                              });
                          }
                        }),
                        s)
                      );
                    }),
                    (e = (e = r.sort(e)).filter(function(t) {
                      return !!t.length();
                    })),
                    i.unique(e, function(t) {
                      return t.toString();
                    })
                  );
                }
                function x(t, e, n) {
                  var r = v(t);
                  n && r.reverse();
                  var s = i.find(r, function(t) {
                    return t.equal(e);
                  });
                  if (s) return r[r.indexOf(s) + 1];
                  var o = r.filter(function(t) {
                    return t.inside(e.end);
                  });
                  if (o.length)
                    return o.sort(function(t, e) {
                      return t.length() - e.length();
                    })[0];
                  s = i.find(
                    r,
                    n
                      ? function(t) {
                          return t.end < e.start;
                        }
                      : function(t) {
                          return t.end > e.start;
                        }
                  );
                  return s || (s = r[0]), s;
                }
                function y(t, e, n) {
                  var r = u.parse(t, { offset: e });
                  return x(r, n, !1);
                }
                function w(t, e, n) {
                  var r = u.parse(t, { offset: e });
                  return x(r, n, !0);
                }
                return {
                  selectNextItemAction: function(t) {
                    return o.isSupportedCSS(t.getSyntax())
                      ? p(t, !1, l.locateRule.bind(l), y)
                      : d(t);
                  },
                  selectPreviousItemAction: function(t) {
                    return o.isSupportedCSS(t.getSyntax())
                      ? p(t, !0, l.locateRule.bind(l), w)
                      : p(t, !0, g, function(t, e, n) {
                          return m(t, e, n, !0);
                        });
                  }
                };
              });
            },
            {
              "../assets/range": "assets\\range.js",
              "../assets/stringStream": "assets\\stringStream.js",
              "../editTree/css": "editTree\\css.js",
              "../parser/xml": "parser\\xml.js",
              "../utils/action": "utils\\action.js",
              "../utils/common": "utils\\common.js",
              "../utils/cssSections": "utils\\cssSections.js",
              "../utils/editor": "utils\\editor.js"
            }
          ],
          "action\\selectLine.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                return {
                  selectLineAction: function(t) {
                    var e = t.getCurrentLineRange();
                    return t.createSelection(e.start, e.end), !0;
                  }
                };
              });
            },
            {}
          ],
          "action\\splitJoinTag.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../utils/common"),
                  i = (t("../assets/resources"), t("../assets/htmlMatcher")),
                  s = t("../utils/editor"),
                  o = t("../assets/profile");
                return {
                  splitJoinTagAction: function(t, e) {
                    var n,
                      a,
                      c,
                      u,
                      l,
                      f,
                      p = s.outputInfo(t, null, e),
                      d = o.get(p.profile),
                      h = i.tag(p.content, t.getCaretPos());
                    return (
                      !!h &&
                      (h.close
                        ? (function(t, e, n) {
                            var i = e.selfClosing() || " /",
                              s = n.open.range
                                .substring(n.source)
                                .replace(/\s*>$/, i + ">"),
                              o = t.getCaretPos();
                            s.length + n.outerRange.start < o &&
                              (o = s.length + n.outerRange.start);
                            return (
                              (s = r.escapeText(s)),
                              t.replaceContent(
                                s,
                                n.outerRange.start,
                                n.outerRange.end
                              ),
                              t.setCaretPos(o),
                              !0
                            );
                          })(t, d, h)
                        : ((a = d),
                          (c = h),
                          (u = (n = t).getCaretPos()),
                          (l = !0 === a.tag_nl ? "\n\t\n" : ""),
                          (f = c.outerContent().replace(/\s*\/>$/, ">")),
                          (u = c.outerRange.start + f.length),
                          (f += l + "</" + c.open.name + ">"),
                          (f = r.escapeText(f)),
                          n.replaceContent(
                            f,
                            c.outerRange.start,
                            c.outerRange.end
                          ),
                          n.setCaretPos(u),
                          !0))
                    );
                  }
                };
              });
            },
            {
              "../assets/htmlMatcher": "assets\\htmlMatcher.js",
              "../assets/profile": "assets\\profile.js",
              "../assets/resources": "assets\\resources.js",
              "../utils/common": "utils\\common.js",
              "../utils/editor": "utils\\editor.js"
            }
          ],
          "action\\toggleComment.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../assets/preferences"),
                  i = t("../assets/range"),
                  s = t("../utils/common"),
                  o = t("../utils/action"),
                  a = t("../utils/editor"),
                  c = t("../assets/htmlMatcher"),
                  u = t("../editTree/css");
                function l(t) {
                  var e,
                    n,
                    r,
                    o,
                    c = i(t.getSelectionRange()),
                    l = a.outputInfo(t);
                  if (!c.length()) {
                    var p = u.parseFromPosition(l.content, t.getCaretPos());
                    if (p) {
                      var d = ((e = p),
                      (n = t.getCaretPos()),
                      (r = n - (e.options.offset || 0)),
                      (o = /^[\s\n\r]/),
                      s.find(e.list(), function(t) {
                        return t.range().end === r
                          ? o.test(e.source.charAt(r))
                          : t.range().inside(r);
                      }));
                      c = d ? d.range(!0) : i(p.nameRange(!0).start, p.source);
                    }
                  }
                  return (
                    c.length() ||
                      ((c = i(t.getCurrentLineRange())),
                      s.narrowToNonSpace(l.content, c)),
                    f(t, "/*", "*/", c)
                  );
                }
                function f(t, e, n, r) {
                  var o = a.outputInfo(t).content,
                    c = t.getCaretPos(),
                    u = null;
                  var l,
                    f = (function(t, e, n, r) {
                      var s = -1,
                        o = -1,
                        a = function(e, n) {
                          return t.substr(n, e.length) == e;
                        };
                      for (; e--; )
                        if (a(n, e)) {
                          s = e;
                          break;
                        }
                      if (-1 != s) {
                        e = s;
                        for (var c = t.length; c >= e++; )
                          if (a(r, e)) {
                            o = e + r.length;
                            break;
                          }
                      }
                      return -1 != s && -1 != o ? i(s, o - s) : null;
                    })(o, c, e, n);
                  return (
                    f && f.overlap(r)
                      ? ((l = (r = f).substring(o)),
                        (u = l
                          .replace(
                            new RegExp("^" + s.escapeForRegexp(e) + "\\s*"),
                            function(t) {
                              return (c -= t.length), "";
                            }
                          )
                          .replace(
                            new RegExp("\\s*" + s.escapeForRegexp(n) + "$"),
                            ""
                          )))
                      : ((u =
                          e +
                          " " +
                          r
                            .substring(o)
                            .replace(
                              new RegExp(
                                s.escapeForRegexp(e) +
                                  "\\s*|\\s*" +
                                  s.escapeForRegexp(n),
                                "g"
                              ),
                              ""
                            ) +
                          " " +
                          n),
                        (c += e.length + 1)),
                    null !== u &&
                      ((u = s.escapeText(u)),
                      t.setCaretPos(r.start),
                      t.replaceContent(a.unindent(t, u), r.start, r.end),
                      t.setCaretPos(c),
                      !0)
                  );
                }
                return {
                  toggleCommentAction: function(t) {
                    var e = a.outputInfo(t);
                    if (o.isSupportedCSS(e.syntax)) {
                      var n = t.getCaretPos(),
                        s = c.tag(e.content, n);
                      s && s.open.range.inside(n) && (e.syntax = "html");
                    }
                    var u = r.getArray("css.syntaxes");
                    return ~u.indexOf(e.syntax)
                      ? l(t)
                      : (function(t) {
                          var e = i(t.getSelectionRange()),
                            n = a.outputInfo(t);
                          if (!e.length()) {
                            var r = c.tag(n.content, t.getCaretPos());
                            r && (e = r.outerRange);
                          }
                          return f(t, "\x3c!--", "--\x3e", e);
                        })(t);
                  }
                };
              });
            },
            {
              "../assets/htmlMatcher": "assets\\htmlMatcher.js",
              "../assets/preferences": "assets\\preferences.js",
              "../assets/range": "assets\\range.js",
              "../editTree/css": "editTree\\css.js",
              "../utils/action": "utils\\action.js",
              "../utils/common": "utils\\common.js",
              "../utils/editor": "utils\\editor.js"
            }
          ],
          "action\\updateImageSize.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../utils/common"),
                  i = t("../utils/editor"),
                  s = t("../utils/action"),
                  o = t("../editTree/xml"),
                  a = t("../editTree/css"),
                  c = t("../utils/base64"),
                  u = t("../plugin/file");
                function l(t, e, n) {
                  var r;
                  if (e) {
                    if (/^data:/.test(e))
                      return (
                        (r = c.decode(e.replace(/^data\:.+?;.+?,/, ""))),
                        n(s.getImageSize(r))
                      );
                    var i = t.getFilePath();
                    u.locateFile(i, e, function(t) {
                      if (null === t) throw "Can't find " + e + " file";
                      u.read(t, function(e, r) {
                        if (e) throw "Unable to read " + t + ": " + e;
                        (r = String(r)), n(s.getImageSize(r));
                      });
                    });
                  }
                }
                return {
                  updateImageSizeAction: function(t) {
                    var e, n, c, u;
                    return (
                      s.isSupportedCSS(t.getSyntax())
                        ? (function(t) {
                            var e = t.getCaretPos(),
                              n = i.outputInfo(t),
                              o = a.parseFromPosition(n.content, e, !0);
                            if (o) {
                              var c,
                                u = o.itemFromPosition(e, !0);
                              u &&
                                (c = /url\((["']?)(.+?)\1\)/i.exec(
                                  u.value() || ""
                                )) &&
                                l(t, c[2], function(n) {
                                  if (n) {
                                    var i = o.range(!0);
                                    o.value("width", n.width + "px"),
                                      o.value(
                                        "height",
                                        n.height + "px",
                                        o.indexOf("width") + 1
                                      ),
                                      s.compoundUpdate(
                                        t,
                                        r.extend(i, {
                                          data: o.toString(),
                                          caret: e
                                        })
                                      );
                                  }
                                });
                            }
                          })(t)
                        : ((n = (e = t).getCaretPos()),
                          (c = i.outputInfo(e)),
                          (u = o.parseFromPosition(c.content, n, !0)) &&
                            "img" == (u.name() || "").toLowerCase() &&
                            l(e, u.value("src"), function(t) {
                              if (t) {
                                var i = u.range(!0);
                                u.value("width", t.width),
                                  u.value(
                                    "height",
                                    t.height,
                                    u.indexOf("width") + 1
                                  ),
                                  s.compoundUpdate(
                                    e,
                                    r.extend(i, {
                                      data: u.toString(),
                                      caret: n
                                    })
                                  );
                              }
                            })),
                      !0
                    );
                  }
                };
              });
            },
            {
              "../editTree/css": "editTree\\css.js",
              "../editTree/xml": "editTree\\xml.js",
              "../plugin/file": "plugin\\file.js",
              "../utils/action": "utils\\action.js",
              "../utils/base64": "utils\\base64.js",
              "../utils/common": "utils\\common.js",
              "../utils/editor": "utils\\editor.js"
            }
          ],
          "action\\updateTag.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../editTree/xml"),
                  i = (t("../utils/editor"), t("../utils/action")),
                  s = t("../utils/common"),
                  o = t("../parser/abbreviation");
                return {
                  updateTagAction: function(t, e) {
                    if (!(e = e || t.prompt("Enter abbreviation"))) return !1;
                    var n = t.getContent(),
                      r = i.captureContext(t),
                      s = this.getUpdatedTag(e, r, n);
                    return (
                      !!s &&
                      (s.name() != r.name &&
                        r.match.close &&
                        t.replaceContent(
                          "</" + s.name() + ">",
                          r.match.close.range.start,
                          r.match.close.range.end,
                          !0
                        ),
                      t.replaceContent(
                        s.source,
                        r.match.open.range.start,
                        r.match.open.range.end,
                        !0
                      ),
                      !0)
                    );
                  },
                  getUpdatedTag: function(t, e, n, i) {
                    if (!e) return null;
                    var a = o.parse(t, i || {}),
                      c = r.parse(e.match.open.range.substring(n), {
                        offset: e.match.outerRange.start
                      });
                    a.children.forEach(function(t, e) {
                      !(function(t, e, n) {
                        var r = (e.attribute("class") || "").split(/\s+/g);
                        n && r.push("+" + e.name());
                        var i = function(t) {
                          return s.replaceCounter(t, e.counter);
                        };
                        r.forEach(function(e) {
                          if (e) {
                            var n = (e = i(e)).charAt(0);
                            "+" == n
                              ? t.addClass(e.substr(1))
                              : "-" == n
                              ? t.removeClass(e.substr(1))
                              : t.value("class", e);
                          }
                        }),
                          e.attributeList().forEach(function(e) {
                            if ("class" != e.name.toLowerCase()) {
                              var n = e.name.charAt(0);
                              if ("+" == n) {
                                var r = e.name.substr(1),
                                  s = t.get(r);
                                s
                                  ? s.value(s.value() + i(e.value))
                                  : t.value(r, i(e.value));
                              } else
                                "-" == n
                                  ? t.remove(e.name.substr(1))
                                  : t.value(e.name, i(e.value));
                            }
                          });
                      })(c, t, e);
                    });
                    var u = a.children[0];
                    return u.data("nameResolved") || c.name(u.name()), c;
                  }
                };
              });
            },
            {
              "../editTree/xml": "editTree\\xml.js",
              "../parser/abbreviation": "parser\\abbreviation.js",
              "../utils/action": "utils\\action.js",
              "../utils/common": "utils\\common.js",
              "../utils/editor": "utils\\editor.js"
            }
          ],
          "action\\wrapWithAbbreviation.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../assets/range"),
                  i = t("../assets/htmlMatcher"),
                  s = t("../utils/common"),
                  o = t("../utils/editor"),
                  a = t("../utils/action"),
                  c = t("../parser/abbreviation");
                return {
                  wrapWithAbbreviationAction: function(t, e, n, u) {
                    var l = o.outputInfo(t, n, u);
                    if (!(e = e || t.prompt("Enter abbreviation"))) return null;
                    e = String(e);
                    var f = r(t.getSelectionRange());
                    if (!f.length()) {
                      var p = i.tag(l.content, f.start);
                      if (!p) return !1;
                      f = s.narrowToNonSpace(l.content, p.range);
                    }
                    var d = s.escapeText(f.substring(l.content)),
                      h = c.expand(e, {
                        pastedContent: o.unindent(t, d),
                        syntax: l.syntax,
                        profile: l.profile,
                        contextNode: a.captureContext(t)
                      });
                    return !!h && (t.replaceContent(h, f.start, f.end), !0);
                  }
                };
              });
            },
            {
              "../assets/htmlMatcher": "assets\\htmlMatcher.js",
              "../assets/range": "assets\\range.js",
              "../parser/abbreviation": "parser\\abbreviation.js",
              "../utils/action": "utils\\action.js",
              "../utils/common": "utils\\common.js",
              "../utils/editor": "utils\\editor.js"
            }
          ],
          "assets\\caniuse.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var i = t("./preferences"),
                  s = t("../utils/common");
                i.define(
                  "caniuse.enabled",
                  !0,
                  "Enable support of Can I Use database. When enabled,\t\tCSS abbreviation resolver will look at Can I Use database first before detecting\t\tCSS properties that should be resolved"
                ),
                  i.define(
                    "caniuse.vendors",
                    "all",
                    "A comma-separated list vendor identifiers\t\t(as described in Can I Use database) that should be supported\t\twhen resolving vendor-prefixed properties. Set value to <code>all</code>\t\tto support all available properties"
                  ),
                  i.define(
                    "caniuse.era",
                    "e-2",
                    "Browser era, as defined in Can I Use database.\t\tExamples: <code>e0</code> (current version), <code>e1</code> (near future)\t\t<code>e-2</code> (2 versions back) and so on."
                  );
                var o = {
                    "border-image": ["border-image"],
                    "css-boxshadow": ["box-shadow"],
                    "css3-boxsizing": ["box-sizing"],
                    multicolumn: [
                      "column-width",
                      "column-count",
                      "columns",
                      "column-gap",
                      "column-rule-color",
                      "column-rule-style",
                      "column-rule-width",
                      "column-rule",
                      "column-span",
                      "column-fill"
                    ],
                    "border-radius": [
                      "border-radius",
                      "border-top-left-radius",
                      "border-top-right-radius",
                      "border-bottom-right-radius",
                      "border-bottom-left-radius"
                    ],
                    transforms2d: ["transform"],
                    "css-hyphens": ["hyphens"],
                    "css-transitions": [
                      "transition",
                      "transition-property",
                      "transition-duration",
                      "transition-timing-function",
                      "transition-delay"
                    ],
                    "font-feature": ["font-feature-settings"],
                    "css-animation": [
                      "animation",
                      "animation-name",
                      "animation-duration",
                      "animation-timing-function",
                      "animation-iteration-count",
                      "animation-direction",
                      "animation-play-state",
                      "animation-delay",
                      "animation-fill-mode",
                      "@keyframes"
                    ],
                    "css-gradients": ["linear-gradient"],
                    "css-masks": [
                      "mask-image",
                      "mask-source-type",
                      "mask-repeat",
                      "mask-position",
                      "mask-clip",
                      "mask-origin",
                      "mask-size",
                      "mask",
                      "mask-type",
                      "mask-box-image-source",
                      "mask-box-image-slice",
                      "mask-box-image-width",
                      "mask-box-image-outset",
                      "mask-box-image-repeat",
                      "mask-box-image",
                      "clip-path",
                      "clip-rule"
                    ],
                    "css-featurequeries": ["@supports"],
                    flexbox: [
                      "flex",
                      "inline-flex",
                      "flex-direction",
                      "flex-wrap",
                      "flex-flow",
                      "order",
                      "flex"
                    ],
                    calc: ["calc"],
                    "object-fit": ["object-fit", "object-position"],
                    "css-grid": [
                      "grid",
                      "inline-grid",
                      "grid-template-rows",
                      "grid-template-columns",
                      "grid-template-areas",
                      "grid-template",
                      "grid-auto-rows",
                      "grid-auto-columns",
                      " grid-auto-flow",
                      "grid-auto-position",
                      "grid",
                      " grid-row-start",
                      "grid-column-start",
                      "grid-row-end",
                      "grid-column-end",
                      "grid-column",
                      "grid-row",
                      "grid-area",
                      "justify-self",
                      "justify-items",
                      "align-self",
                      "align-items"
                    ],
                    "css-repeating-gradients": ["repeating-linear-gradient"],
                    "css-filters": ["filter"],
                    "user-select-none": ["user-select"],
                    "intrinsic-width": [
                      "min-content",
                      "max-content",
                      "fit-content",
                      "fill-available"
                    ],
                    "css3-tabsize": ["tab-size"]
                  },
                  a = null,
                  c = null,
                  u = null;
                function l(t, e) {
                  "string" == typeof t && (t = JSON.parse(t)),
                    e || (t = f(t)),
                    (c = t.vendors),
                    (a = t.css),
                    (u = t.era);
                }
                function f(t) {
                  return (
                    "string" == typeof t && (t = JSON.parse(t)),
                    {
                      vendors: ((n = t),
                      (r = {}),
                      Object.keys(n.agents).forEach(function(t) {
                        var e = n.agents[t];
                        r[t] = { prefix: e.prefix, versions: e.versions };
                      }),
                      r),
                      css: (function(t) {
                        var e = {};
                        t.cats.CSS;
                        return (
                          Object.keys(t.data).forEach(function(n) {
                            var r = t.data[n];
                            n in o &&
                              o[n].forEach(function(t) {
                                e[t] = r.stats;
                              });
                          }),
                          e
                        );
                      })(t),
                      era: ((e = t),
                      Object.keys(e.eras).sort(function(t, e) {
                        return parseInt(t.substr(1)) - parseInt(e.substr(1));
                      }))
                    }
                  );
                  var e, n, r;
                }
                var p = null;
                return (
                  (function(t) {
                    if (void 0 === r || !r.amd)
                      try {
                        p = t("caniuse-db/data.json");
                      } catch (t) {}
                  })(t),
                  p && l(p),
                  {
                    load: l,
                    optimize: f,
                    resolvePrefixes: function(t) {
                      if (!(i.get("caniuse.enabled") && a && t in a))
                        return null;
                      var e = [],
                        n = a[t],
                        r = (function() {
                          var t = i.get("caniuse.era"),
                            e = u.indexOf(t);
                          ~e || (e = u.indexOf("e-2"));
                          return e;
                        })();
                      return (
                        (function() {
                          var t = Object.keys(c),
                            e = i.getArray("caniuse.vendors");
                          if (!e || "all" == e[0]) return t;
                          return (function(t, e) {
                            var n = [],
                              r = t,
                              i = e;
                            r.length > i.length && ((r = e), (i = t));
                            return (
                              i.forEach(function(t) {
                                ~r.indexOf(t) && n.push(t);
                              }),
                              n
                            );
                          })(t, e);
                        })().forEach(function(t) {
                          for (
                            var i, s = c[t].versions.slice(r), o = 0;
                            o < s.length;
                            o++
                          )
                            if ((i = s[o]) && ~n[t][i].indexOf("x")) {
                              e.push(c[t].prefix);
                              break;
                            }
                        }),
                        s.unique(e).sort(function(t, e) {
                          return e.length - t.length;
                        })
                      );
                    }
                  }
                );
              });
            },
            {
              "../utils/common": "utils\\common.js",
              "./preferences": "assets\\preferences.js"
            }
          ],
          "assets\\elements.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = {},
                  i = /([@\!]?)([\w\-:]+)\s*=\s*(['"])(.*?)\3/g;
                function s(t) {
                  return { data: t };
                }
                return (
                  ((n = n || {}).exports = {
                    add: function(t, e) {
                      var n = this;
                      r[t] = function() {
                        var r = e.apply(n, arguments);
                        return r && (r.type = t), r;
                      };
                    },
                    get: function(t) {
                      return r[t];
                    },
                    create: function(t) {
                      var e = [].slice.call(arguments, 1),
                        n = this.get(t);
                      return n ? n.apply(this, e) : null;
                    },
                    is: function(t, e) {
                      return this.type(t) === e;
                    },
                    type: function(t) {
                      return t && t.type;
                    }
                  }),
                  n.exports.add("element", function(t, e, n) {
                    var r = { name: t, is_empty: !!n };
                    if (e)
                      if (((r.attributes = []), Array.isArray(e)))
                        r.attributes = e;
                      else if ("string" == typeof e)
                        for (var s; (s = i.exec(e)); )
                          r.attributes.push({
                            name: s[2],
                            value: s[4],
                            isDefault: "@" == s[1],
                            isImplied: "!" == s[1]
                          });
                      else
                        r.attributes = Object.keys(e).map(function(t) {
                          return { name: t, value: e[t] };
                        });
                    return r;
                  }),
                  n.exports.add("snippet", s),
                  n.exports.add("reference", s),
                  n.exports.add("empty", function() {
                    return {};
                  }),
                  n.exports
                );
              });
            },
            {}
          ],
          "assets\\handlerList.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../utils/common");
                function i() {
                  this._list = [];
                }
                return (
                  (i.prototype = {
                    add: function(t, e) {
                      var n = this._list.length;
                      e && "order" in e && (n = 1e4 * e.order),
                        this._list.push(r.extend({}, e, { order: n, fn: t }));
                    },
                    remove: function(t) {
                      var e = r.find(this._list, function(e) {
                        return e.fn === t;
                      });
                      e && this._list.splice(this._list.indexOf(e), 1);
                    },
                    list: function() {
                      return this._list.sort(function(t, e) {
                        return e.order - t.order;
                      });
                    },
                    listFn: function() {
                      return this.list().map(function(t) {
                        return t.fn;
                      });
                    },
                    exec: function(t, e) {
                      e = e || [];
                      var n = null;
                      return (
                        r.find(this.list(), function(r) {
                          if ((n = r.fn.apply(r, e)) !== t) return !0;
                        }),
                        n
                      );
                    }
                  }),
                  {
                    create: function() {
                      return new i();
                    }
                  }
                );
              });
            },
            { "../utils/common": "utils\\common.js" }
          ],
          "assets\\htmlMatcher.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("./range"),
                  i = /^<([\w\:\-]+)((?:\s+[\w\-:]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/,
                  s = /^<\/([\w\:\-]+)[^>]*>/;
                function o(t) {
                  var e,
                    n = {};
                  return {
                    open: function(t) {
                      var e = this.matches(t);
                      return e && "open" == e.type ? e : null;
                    },
                    close: function(t) {
                      var e = this.matches(t);
                      return e && "close" == e.type ? e : null;
                    },
                    matches: function(o) {
                      var a,
                        c,
                        u,
                        l,
                        f = "p" + o;
                      if (!(f in n) && ((n[f] = !1), "<" == t.charAt(o))) {
                        var p = t.slice(o);
                        (e = p.match(i))
                          ? (n[f] = ((u = o),
                            {
                              name: (l = e)[1],
                              selfClose: !!l[3],
                              range: r(u, l[0]),
                              type: "open"
                            }))
                          : (e = p.match(s)) &&
                            (n[f] = ((a = o),
                            {
                              name: (c = e)[1],
                              range: r(a, c[0]),
                              type: "close"
                            }));
                      }
                      return n[f];
                    },
                    text: function() {
                      return t;
                    },
                    clean: function() {
                      n = t = e = null;
                    }
                  };
                }
                function a(t, e, n) {
                  return t.substring(e, e + n.length) == n;
                }
                function c(t, e) {
                  for (
                    var n = [],
                      r = null,
                      i = e.text(),
                      s = t.range.end,
                      o = i.length;
                    s < o;
                    s++
                  ) {
                    if (a(i, s, "\x3c!--"))
                      for (var c = s; c < o; c++)
                        if (a(i, c, "--\x3e")) {
                          s = c + 3;
                          break;
                        }
                    if ((r = e.matches(s))) {
                      if ("open" != r.type || r.selfClose) {
                        if ("close" == r.type) {
                          if (!n.length) return r.name == t.name ? r : null;
                          if (n[n.length - 1] == r.name) n.pop();
                          else {
                            for (var u = !1; n.length && !u; ) {
                              var l = n.pop();
                              l == r.name && (u = !0);
                            }
                            if (!n.length && !u)
                              return r.name == t.name ? r : null;
                          }
                        }
                      } else n.push(r.name);
                      s = r.range.end - 1;
                    }
                  }
                }
                return {
                  find: function(t, e) {
                    for (
                      var n, i, s, u, l = o(t), f = null, p = null, d = e;
                      d >= 0;
                      d--
                    )
                      if ((f = l.open(d))) {
                        if (f.selfClose) {
                          if (f.range.cmp(e, "lt", "gt")) break;
                          continue;
                        }
                        if ((p = c(f, l))) {
                          var h = r.create2(f.range.start, p.range.end);
                          if (h.contains(e)) break;
                        } else if (f.range.contains(e)) break;
                        f = null;
                      } else if (a(t, d, "--\x3e")) {
                        for (n = d - 1; n >= 0 && !a(t, n, "--\x3e"); n--)
                          if (a(t, n, "\x3c!--")) {
                            d = n;
                            break;
                          }
                      } else if (a(t, d, "\x3c!--")) {
                        for (n = d + 4, i = t.length; n < i; n++)
                          if (a(t, n, "--\x3e")) {
                            n += 3;
                            break;
                          }
                        f = {
                          range: r(
                            (s = d),
                            "number" == typeof (u = n) ? u - s : u[0]
                          ),
                          type: "comment"
                        };
                        break;
                      }
                    if ((l.clean(), f)) {
                      var m = null,
                        g = null;
                      if (
                        (p
                          ? ((m = r.create2(f.range.start, p.range.end)),
                            (g = r.create2(f.range.end, p.range.start)))
                          : (m = g = r.create2(f.range.start, f.range.end)),
                        "comment" == f.type)
                      ) {
                        var b = m.substring(t);
                        (g.start +=
                          b.length - b.replace(/^<\!--\s*/, "").length),
                          (g.end -= b.length - b.replace(/\s*-->$/, "").length);
                      }
                      return {
                        open: f,
                        close: p,
                        type: "comment" == f.type ? "comment" : "tag",
                        innerRange: g,
                        innerContent: function() {
                          return this.innerRange.substring(t);
                        },
                        outerRange: m,
                        outerContent: function() {
                          return this.outerRange.substring(t);
                        },
                        range: g.length() && g.cmp(e, "lte", "gte") ? g : m,
                        content: function() {
                          return this.range.substring(t);
                        },
                        source: t
                      };
                    }
                  },
                  tag: function(t, e) {
                    var n = this.find(t, e);
                    if (n && "tag" == n.type) return n;
                  }
                };
              });
            },
            { "./range": "assets\\range.js" }
          ],
          "assets\\logger.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                return {
                  log: function() {
                    "undefined" != typeof console &&
                      console.log &&
                      console.log.apply(console, arguments);
                  }
                };
              });
            },
            {}
          ],
          "assets\\preferences.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../utils/common"),
                  i = {},
                  s = {},
                  o = null,
                  a = null;
                return {
                  define: function(t, e, n) {
                    var r = t;
                    "string" == typeof t &&
                      ((r = {})[t] = { value: e, description: n }),
                      Object.keys(r).forEach(function(t) {
                        var e,
                          n = r[t];
                        s[t] =
                          "object" == typeof (e = n) &&
                          !Array.isArray(e) &&
                          "value" in e &&
                          Object.keys(e).length < 3
                            ? n
                            : { value: n };
                      });
                  },
                  set: function(t, e) {
                    var n = t;
                    "string" == typeof t && ((n = {})[t] = e),
                      Object.keys(n).forEach(function(t) {
                        var e = n[t];
                        if (!(t in s))
                          throw new Error(
                            'Property "' +
                              t +
                              '" is not defined. You should define it first with `define` method of current module'
                          );
                        if (e !== s[t].value) {
                          switch (typeof s[t].value) {
                            case "boolean":
                              e = (function(t) {
                                if ("string" == typeof t)
                                  return (
                                    "yes" == (t = t.toLowerCase()) ||
                                    "true" == t ||
                                    "1" == t
                                  );
                                return !!t;
                              })(e);
                              break;
                            case "number":
                              e = parseInt(e + "", 10) || 0;
                              break;
                            default:
                              null !== e && (e += "");
                          }
                          i[t] = e;
                        } else t in i && delete i[t];
                      });
                  },
                  get: function(t) {
                    return t in i ? i[t] : t in s ? s[t].value : void 0;
                  },
                  getArray: function(t) {
                    var e = this.get(t);
                    return void 0 === e || null === e || "" === e
                      ? null
                      : (e = e.split(",").map(r.trim)).length
                      ? e
                      : null;
                  },
                  getDict: function(t) {
                    var e = {};
                    return (
                      this.getArray(t).forEach(function(t) {
                        var n = t.split(":");
                        e[n[0]] = n[1];
                      }),
                      e
                    );
                  },
                  description: function(t) {
                    return t in s ? s[t].description : void 0;
                  },
                  remove: function(t) {
                    Array.isArray(t) || (t = [t]),
                      t.forEach(function(t) {
                        t in i && delete i[t], t in s && delete s[t];
                      });
                  },
                  list: function() {
                    return Object.keys(s)
                      .sort()
                      .map(function(t) {
                        return {
                          name: t,
                          value: this.get(t),
                          type: typeof s[t].value,
                          description: s[t].description
                        };
                      }, this);
                  },
                  load: function(t) {
                    Object.keys(t).forEach(function(e) {
                      this.set(e, t[e]);
                    }, this);
                  },
                  exportModified: function() {
                    return r.extend({}, i);
                  },
                  reset: function() {
                    i = {};
                  },
                  _startTest: function() {
                    (o = s), (a = i), (s = {}), (i = {});
                  },
                  _stopTest: function() {
                    (s = o), (i = a);
                  }
                };
              });
            },
            { "../utils/common": "utils\\common.js" }
          ],
          "assets\\profile.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../utils/common"),
                  i = t("./resources"),
                  s = t("./preferences");
                s.define(
                  "profile.allowCompactBoolean",
                  !0,
                  'This option can be used to globally disable compact form of boolean attribues (attributes where name and value are equal). With compactform enabled, HTML tags can be outputted as <code>&lt;div contenteditable&gt;</code> instead of <code>&lt;div contenteditable="contenteditable"&gt;</code>'
                ),
                  s.define(
                    "profile.booleanAttributes",
                    "^contenteditable|seamless|async|autofocus|autoplay|checked|controls|defer|disabled|formnovalidate|hidden|ismap|loop|multiple|muted|novalidate|readonly|required|reversed|selected|typemustmatch$",
                    "A regular expression for attributes that should be boolean by default.If attribute name matches this expression, you don’t have to write dot after attribute name in Emmet abbreviation to mark it as boolean."
                  );
                var o = {},
                  a = {
                    tag_case: "asis",
                    attr_case: "asis",
                    attr_quotes: "double",
                    tag_nl: "decide",
                    tag_nl_leaf: !1,
                    place_cursor: !0,
                    indent: !0,
                    inline_break: 3,
                    compact_bool: !1,
                    self_closing_tag: "xhtml",
                    filters: "",
                    extraFilters: ""
                  };
                function c(t) {
                  r.extend(this, a, t);
                }
                function u(t, e) {
                  switch (String(e || "").toLowerCase()) {
                    case "lower":
                      return t.toLowerCase();
                    case "upper":
                      return t.toUpperCase();
                  }
                  return t;
                }
                function l(t, e) {
                  return (o[t.toLowerCase()] = new c(e));
                }
                function f() {
                  l("xhtml"),
                    l("html", { self_closing_tag: !1, compact_bool: !0 }),
                    l("xml", { self_closing_tag: !0, tag_nl: !0 }),
                    l("plain", { tag_nl: !1, indent: !1, place_cursor: !1 }),
                    l("line", { tag_nl: !1, indent: !1, extraFilters: "s" }),
                    l("css", { tag_nl: !0 }),
                    l("css_line", { tag_nl: !1 });
                }
                return (
                  (c.prototype = {
                    tagName: function(t) {
                      return u(t, this.tag_case);
                    },
                    attributeName: function(t) {
                      return u(t, this.attr_case);
                    },
                    attributeQuote: function() {
                      return "single" == this.attr_quotes ? "'" : '"';
                    },
                    selfClosing: function() {
                      return "xhtml" == this.self_closing_tag
                        ? " /"
                        : !0 === this.self_closing_tag
                        ? "/"
                        : "";
                    },
                    cursor: function() {
                      return this.place_cursor ? r.getCaretPlaceholder() : "";
                    },
                    isBoolean: function(t, e) {
                      if (t == e) return !0;
                      var n = s.get("profile.booleanAttributes");
                      return !(e || !n) && (n = new RegExp(n, "i")).test(t);
                    },
                    allowCompactBoolean: function() {
                      return (
                        this.compact_bool &&
                        s.get("profile.allowCompactBoolean")
                      );
                    }
                  }),
                  f(),
                  {
                    create: function(t, e) {
                      return 2 == arguments.length
                        ? l(t, e)
                        : new c(r.defaults(t || {}, a));
                    },
                    get: function(t, e) {
                      if (!t && e) {
                        var n = i.findItem(e, "profile");
                        n && (t = n);
                      }
                      return t
                        ? t instanceof c
                          ? t
                          : "string" == typeof t && t.toLowerCase() in o
                          ? o[t.toLowerCase()]
                          : this.create(t)
                        : o.plain;
                    },
                    remove: function(t) {
                      (t = (t || "").toLowerCase()) in o && delete o[t];
                    },
                    reset: function() {
                      (o = {}), f();
                    },
                    stringCase: u
                  }
                );
              });
            },
            {
              "../utils/common": "utils\\common.js",
              "./preferences": "assets\\preferences.js",
              "./resources": "assets\\resources.js"
            }
          ],
          "assets\\range.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                function r(t, e, n) {
                  switch (n) {
                    case "eq":
                    case "==":
                      return t === e;
                    case "lt":
                    case "<":
                      return t < e;
                    case "lte":
                    case "<=":
                      return t <= e;
                    case "gt":
                    case ">":
                      return t > e;
                    case "gte":
                    case ">=":
                      return t >= e;
                  }
                }
                function i(t, e) {
                  "object" == typeof t && "start" in t
                    ? ((this.start = Math.min(t.start, t.end)),
                      (this.end = Math.max(t.start, t.end)))
                    : Array.isArray(t)
                    ? ((this.start = t[0]), (this.end = t[1]))
                    : ((e = "string" == typeof e ? e.length : +e),
                      (this.start = t),
                      (this.end = t + e));
                }
                return (
                  (i.prototype = {
                    length: function() {
                      return Math.abs(this.end - this.start);
                    },
                    equal: function(t) {
                      return this.cmp(t, "eq", "eq");
                    },
                    shift: function(t) {
                      return (this.start += t), (this.end += t), this;
                    },
                    overlap: function(t) {
                      return t.start <= this.end && t.end >= this.start;
                    },
                    intersection: function(t) {
                      if (this.overlap(t)) {
                        var e = Math.max(t.start, this.start),
                          n = Math.min(t.end, this.end);
                        return new i(e, n - e);
                      }
                      return null;
                    },
                    union: function(t) {
                      if (this.overlap(t)) {
                        var e = Math.min(t.start, this.start),
                          n = Math.max(t.end, this.end);
                        return new i(e, n - e);
                      }
                      return null;
                    },
                    inside: function(t) {
                      return this.cmp(t, "lte", "gt");
                    },
                    contains: function(t) {
                      return this.cmp(t, "lt", "gt");
                    },
                    include: function(t) {
                      return this.cmp(t, "lte", "gte");
                    },
                    cmp: function(t, e, n) {
                      var s, o;
                      return (
                        t instanceof i
                          ? ((s = t.start), (o = t.end))
                          : (s = o = t),
                        r(this.start, s, e || "<=") && r(this.end, o, n || ">")
                      );
                    },
                    substring: function(t) {
                      return this.length() > 0
                        ? t.substring(this.start, this.end)
                        : "";
                    },
                    clone: function() {
                      return new i(this.start, this.length());
                    },
                    toArray: function() {
                      return [this.start, this.end];
                    },
                    toString: function() {
                      return this.valueOf();
                    },
                    valueOf: function() {
                      return "{" + this.start + ", " + this.length() + "}";
                    }
                  }),
                  (n.exports = function(t, e) {
                    return void 0 === t || null === t
                      ? null
                      : t instanceof i
                      ? t
                      : ("object" == typeof t &&
                          "start" in t &&
                          "end" in t &&
                          ((e = t.end - t.start), (t = t.start)),
                        new i(t, e));
                  }),
                  (n.exports.create = n.exports),
                  (n.exports.isRange = function(t) {
                    return t instanceof i;
                  }),
                  (n.exports.create2 = function(t, e) {
                    return (
                      "number" == typeof t && "number" == typeof e && (e -= t),
                      this.create(t, e)
                    );
                  }),
                  (n.exports.sort = function(t, e) {
                    return (
                      (t = t.sort(function(t, e) {
                        return t.start === e.start
                          ? e.end - t.end
                          : t.start - e.start;
                      })),
                      e && t.reverse(),
                      t
                    );
                  }),
                  n.exports
                );
              });
            },
            {}
          ],
          "assets\\resources.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var i = t("./handlerList"),
                  s = t("../utils/common"),
                  o = t("./elements"),
                  a = (t("../assets/logger"), t("../vendor/stringScore")),
                  c = t("../resolver/css"),
                  u = "system",
                  l = {},
                  f = /^<(\w+\:?[\w\-]*)((?:\s+[@\!]?[\w\:\-]+\s*=\s*(['"]).*?\3)*)\s*(\/?)>/,
                  p = {},
                  d = {},
                  h = i.create();
                function m(t, e) {
                  t &&
                    Object.keys(t).forEach(function(n) {
                      e(t[n], n);
                    });
                }
                function g(t, e, n) {
                  var r, i, a, c;
                  return (
                    (r = e),
                    (e = s.replaceUnescapedSymbol(
                      r,
                      "|",
                      s.getCaretPlaceholder()
                    )),
                    "snippets" == n
                      ? o.create("snippet", e)
                      : "abbreviations" == n
                      ? ((i = t),
                        (a = e),
                        (i = s.trim(i)),
                        (c = f.exec(a))
                          ? o.create("element", c[1], c[2], "/" == c[4])
                          : o.create("reference", a))
                      : void 0
                  );
                }
                function b(t) {
                  return t.replace(/:$/, "").replace(/:/g, "-");
                }
                return (
                  s.extend(e, {
                    setVocabulary: function(t, e) {
                      l = {};
                      var n = {};
                      m(t, function(t, e) {
                        var r = {};
                        m(t, function(t, e) {
                          var n;
                          ("abbreviations" != e && "snippets" != e) ||
                            ((n = {}),
                            m(t, function(t, e) {
                              for (
                                var r = e.split("|"), i = r.length - 1;
                                i >= 0;
                                i--
                              )
                                n[r[i]] = t;
                            }),
                            (t = n)),
                            (r[e] = t);
                        }),
                          (n[e] = r);
                      }),
                        e == u ? (p = n) : (d = n);
                    },
                    getVocabulary: function(t) {
                      return t == u ? p : d;
                    },
                    getMatchedResource: function(t, e) {
                      return (
                        h.exec(null, s.toArray(arguments)) ||
                        this.findSnippet(e, t.name())
                      );
                    },
                    getVariable: function(t) {
                      return (this.getSection("variables") || {})[t];
                    },
                    setVariable: function(t, e) {
                      var n = this.getVocabulary("user") || {};
                      "variables" in n || (n.variables = {}),
                        (n.variables[t] = e),
                        this.setVocabulary(n, "user");
                    },
                    hasSyntax: function(t) {
                      return (
                        t in this.getVocabulary("user") ||
                        t in this.getVocabulary(u)
                      );
                    },
                    addResolver: function(t, e) {
                      h.add(t, e);
                    },
                    removeResolver: function(t) {
                      h.remove(t);
                    },
                    getSection: function(t) {
                      if (!t) return null;
                      t in l || (l[t] = s.deepMerge({}, p[t], d[t]));
                      for (
                        var e, n = l[t], r = s.toArray(arguments, 1);
                        n && (e = r.shift());

                      ) {
                        if (!(e in n)) return null;
                        n = n[e];
                      }
                      return n;
                    },
                    findItem: function(t, e) {
                      for (var n = this.getSection(t); n; ) {
                        if (e in n) return n[e];
                        n = this.getSection(n.extends);
                      }
                    },
                    findSnippet: function(t, e, n) {
                      if (!t || !e) return null;
                      n = n || [];
                      var r = [e];
                      ~e.indexOf("-") && r.push(e.replace(/\-/g, ":"));
                      var i = this.getSection(t),
                        s = null;
                      return (
                        ["snippets", "abbreviations"].some(function(e) {
                          var n = this.getSection(t, e);
                          if (n)
                            return r.some(function(t) {
                              if (n[t]) return (s = g(t, n[t], e));
                            });
                        }, this),
                        n.push(t),
                        s || !i.extends || ~n.indexOf(i.extends)
                          ? s
                          : this.findSnippet(i.extends, e, n)
                      );
                    },
                    fuzzyFindSnippet: function(t, e, n) {
                      var r = this.fuzzyFindMatches(t, e, n)[0];
                      if (r) return r.value.parsedValue;
                    },
                    fuzzyFindMatches: function(t, e, n) {
                      (n = n || 0.3), (e = b(e));
                      var r = this.getAllSnippets(t);
                      return Object.keys(r)
                        .map(function(t) {
                          var n = r[t];
                          return {
                            key: t,
                            score: a.score(n.nk, e, 0.1),
                            value: n
                          };
                        })
                        .filter(function(t) {
                          return t.score >= n;
                        })
                        .sort(function(t, e) {
                          return t.score - e.score;
                        })
                        .reverse();
                    },
                    getAllSnippets: function(t) {
                      var e = "all-" + t;
                      if (!l[e]) {
                        var n = [],
                          r = t,
                          i = [];
                        do {
                          var o = this.getSection(r);
                          if (!o) break;
                          ["snippets", "abbreviations"].forEach(function(t) {
                            var e = {};
                            m(o[t] || null, function(n, r) {
                              e[r] = {
                                nk: b(r),
                                value: n,
                                parsedValue: g(r, n, t),
                                type: t
                              };
                            }),
                              n.push(e);
                          }),
                            i.push(r),
                            (r = o.extends);
                        } while (r && !~i.indexOf(r));
                        l[e] = s.extend.apply(s, n.reverse());
                      }
                      return l[e];
                    },
                    getNewline: function() {
                      var t = this.getVariable("newline");
                      return "string" == typeof t ? t : "\n";
                    },
                    setNewline: function(t) {
                      this.setVariable("newline", t), this.setVariable("nl", t);
                    }
                  }),
                  e.addResolver(c.resolve.bind(c)),
                  (function(t) {
                    if (void 0 === r || !r.amd)
                      try {
                        e.setVocabulary(t("../snippets.json"), u);
                      } catch (t) {}
                  })(t),
                  e
                );
              });
            },
            {
              "../assets/logger": "assets\\logger.js",
              "../resolver/css": "resolver\\css.js",
              "../utils/common": "utils\\common.js",
              "../vendor/stringScore": "vendor\\stringScore.js",
              "./elements": "assets\\elements.js",
              "./handlerList": "assets\\handlerList.js"
            }
          ],
          "assets\\stringStream.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                function r(t) {
                  (this.pos = this.start = 0),
                    (this.string = t),
                    (this._length = t.length);
                }
                return (
                  (r.prototype = {
                    eol: function() {
                      return this.pos >= this._length;
                    },
                    sol: function() {
                      return 0 === this.pos;
                    },
                    peek: function() {
                      return this.string.charAt(this.pos);
                    },
                    next: function() {
                      if (this.pos < this._length)
                        return this.string.charAt(this.pos++);
                    },
                    eat: function(t) {
                      var e = this.string.charAt(this.pos);
                      if (
                        "string" == typeof t
                          ? e == t
                          : e && (t.test ? t.test(e) : t(e))
                      )
                        return ++this.pos, e;
                    },
                    eatWhile: function(t) {
                      for (var e = this.pos; this.eat(t); );
                      return this.pos > e;
                    },
                    eatSpace: function() {
                      for (
                        var t = this.pos;
                        /[\s\u00a0]/.test(this.string.charAt(this.pos));

                      )
                        ++this.pos;
                      return this.pos > t;
                    },
                    skipToEnd: function() {
                      this.pos = this._length;
                    },
                    skipTo: function(t) {
                      var e = this.string.indexOf(t, this.pos);
                      if (e > -1) return (this.pos = e), !0;
                    },
                    skipToPair: function(t, e, n) {
                      for (
                        var r, i = 0, s = this.pos, o = this._length;
                        s < o;

                      )
                        if ((r = this.string.charAt(s++)) == t) i++;
                        else if (r == e) {
                          if (--i < 1) return (this.pos = s), !0;
                        } else
                          !n || ('"' != r && "'" != r) || this.skipString(r);
                      return !1;
                    },
                    skipQuoted: function(t) {
                      var e = this.string.charAt(t ? this.pos : this.pos - 1);
                      if ('"' === e || "'" === e)
                        return t && this.pos++, this.skipString(e);
                    },
                    skipString: function(t) {
                      for (var e, n = this.pos, r = this._length; n < r; )
                        if ("\\" != (e = this.string.charAt(n++)) && e == t)
                          return (this.pos = n), !0;
                      return !1;
                    },
                    backUp: function(t) {
                      this.pos -= t;
                    },
                    match: function(t, e, n) {
                      if ("string" != typeof t) {
                        var r = this.string.slice(this.pos).match(t);
                        return r && !1 !== e && (this.pos += r[0].length), r;
                      }
                      var i = n
                        ? function(t) {
                            return t.toLowerCase();
                          }
                        : function(t) {
                            return t;
                          };
                      if (i(this.string).indexOf(i(t), this.pos) == this.pos)
                        return !1 !== e && (this.pos += t.length), !0;
                    },
                    current: function(t) {
                      return this.string.slice(
                        this.start,
                        this.pos - (t ? 1 : 0)
                      );
                    }
                  }),
                  (n.exports = function(t) {
                    return new r(t);
                  }),
                  (n.exports.create = n.exports),
                  n.exports
                );
              });
            },
            {}
          ],
          "assets\\tabStops.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../utils/common"),
                  i = t("./stringStream"),
                  s = t("./resources"),
                  o = 100,
                  a = 0,
                  c = {
                    replaceCarets: !1,
                    escape: function(t) {
                      return "\\" + t;
                    },
                    tabstop: function(t) {
                      return t.token;
                    },
                    variable: function(t) {
                      return t.token;
                    }
                  };
                return {
                  extract: function(t, e) {
                    var n = { carets: "" },
                      i = [];
                    (e = r.extend({}, c, e, {
                      tabstop: function(t) {
                        var e = t.token,
                          r = "";
                        return (
                          "cursor" == t.placeholder
                            ? i.push({
                                start: t.start,
                                end: t.start + e.length,
                                group: "carets",
                                value: ""
                              })
                            : ("placeholder" in t &&
                                (n[t.group] = t.placeholder),
                              t.group in n && (r = n[t.group]),
                              i.push({
                                start: t.start,
                                end: t.start + e.length,
                                group: t.group,
                                value: r
                              })),
                          e
                        );
                      }
                    })).replaceCarets &&
                      (t = t.replace(
                        new RegExp(
                          r.escapeForRegexp(r.getCaretPlaceholder()),
                          "g"
                        ),
                        "${0:cursor}"
                      )),
                      (t = this.processText(t, e));
                    var s = "",
                      o = 0,
                      a = i.map(function(e) {
                        var r = (s += t.substring(o, e.start)).length,
                          i = n[e.group] || "";
                        return (
                          (s += i),
                          (o = e.end),
                          { group: e.group, start: r, end: r + i.length }
                        );
                      });
                    return {
                      text: (s += t.substring(o)),
                      tabstops: a.sort(function(t, e) {
                        return t.start - e.start;
                      })
                    };
                  },
                  processText: function(t, e) {
                    e = r.extend({}, c, e);
                    for (var n, s, o, a = "", u = i.create(t); (n = u.next()); )
                      if ("\\" != n || u.eol()) {
                        if (((o = n), "$" == n))
                          if (((u.start = u.pos - 1), (s = u.match(/^[0-9]+/))))
                            o = e.tabstop({
                              start: a.length,
                              group: u.current().substr(1),
                              token: u.current()
                            });
                          else if ((s = u.match(/^\{([a-z_\-][\w\-]*)\}/)))
                            o = e.variable({
                              start: a.length,
                              name: s[1],
                              token: u.current()
                            });
                          else if ((s = u.match(/^\{([0-9]+)(:.+?)?\}/, !1))) {
                            u.skipToPair("{", "}");
                            var l = {
                                start: a.length,
                                group: s[1],
                                token: u.current()
                              },
                              f = l.token.substring(
                                l.group.length + 2,
                                l.token.length - 1
                              );
                            f && (l.placeholder = f.substr(1)),
                              (o = e.tabstop(l));
                          }
                        a += o;
                      } else a += e.escape(u.next());
                    return a;
                  },
                  upgrade: function(t, e) {
                    var n = 0,
                      r = {
                        tabstop: function(t) {
                          var r = parseInt(t.group, 10);
                          return (
                            r > n && (n = r),
                            t.placeholder
                              ? "${" + (r + e) + ":" + t.placeholder + "}"
                              : "${" + (r + e) + "}"
                          );
                        }
                      };
                    return (
                      ["start", "end", "content"].forEach(function(e) {
                        t[e] = this.processText(t[e], r);
                      }, this),
                      n
                    );
                  },
                  variablesResolver: function(t) {
                    var e = {};
                    return function(n, i) {
                      if ("child" == i) return n;
                      if ("cursor" == i) return r.getCaretPlaceholder();
                      var a = t.attribute(i);
                      if (void 0 !== a && a !== n) return a;
                      var c = s.getVariable(i);
                      return (
                        c || (e[i] || (e[i] = o++), "${" + e[i] + ":" + i + "}")
                      );
                    };
                  },
                  replaceVariables: function(t, e) {
                    var n =
                      "function" == typeof (e = e || {})
                        ? e
                        : function(t, n) {
                            return n in e ? e[n] : null;
                          };
                    return this.processText(t, {
                      variable: function(t) {
                        var e = n(t.token, t.name, t);
                        return (
                          null === e && (e = s.getVariable(t.name)),
                          (null !== e && void 0 !== e) || (e = t.token),
                          e
                        );
                      }
                    });
                  },
                  resetTabstopIndex: function() {
                    (a = 0), (o = 100);
                  },
                  abbrOutputProcessor: function(t, e, n) {
                    var r = 0,
                      i = this,
                      s = {
                        tabstop: function(t) {
                          var e = parseInt(t.group, 10);
                          if (0 === e) return "${0}";
                          if ((e > r && (r = e), t.placeholder)) {
                            var n = e + a,
                              o = i.processText(t.placeholder, s);
                            return "${" + n + ":" + o + "}";
                          }
                          return "${" + (e + a) + "}";
                        }
                      };
                    return (
                      (t = this.processText(t, s)),
                      (t = this.replaceVariables(t, this.variablesResolver(e))),
                      (a += r + 1),
                      t
                    );
                  }
                };
              });
            },
            {
              "../utils/common": "utils\\common.js",
              "./resources": "assets\\resources.js",
              "./stringStream": "assets\\stringStream.js"
            }
          ],
          "assets\\tokenIterator.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                function r(t) {
                  (this.tokens = t), (this._position = 0), this.reset();
                }
                return (
                  (r.prototype = {
                    next: function() {
                      if (this.hasNext()) {
                        var t = this.tokens[++this._i];
                        return (this._position = t.start), t;
                      }
                      return (this._i = this._il), null;
                    },
                    current: function() {
                      return this.tokens[this._i];
                    },
                    peek: function() {
                      return this.tokens[this._i + i];
                    },
                    position: function() {
                      return this._position;
                    },
                    hasNext: function() {
                      return this._i < this._il - 1;
                    },
                    reset: function() {
                      (this._i = 0), (this._il = this.tokens.length);
                    },
                    item: function() {
                      return this.tokens[this._i];
                    },
                    itemNext: function() {
                      return this.tokens[this._i + 1];
                    },
                    itemPrev: function() {
                      return this.tokens[this._i - 1];
                    },
                    nextUntil: function(t, e) {
                      for (
                        var n,
                          r =
                            "string" == typeof t
                              ? function(e) {
                                  return e.type == t;
                                }
                              : t;
                        (n = this.next()) &&
                        (e && e.call(this, n), !r.call(this, n));

                      );
                    }
                  }),
                  {
                    create: function(t) {
                      return new r(t);
                    }
                  }
                );
              });
            },
            {}
          ],
          "editTree\\base.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../assets/range"),
                  i = t("../utils/common"),
                  s = t("../vendor/klass");
                function o(t, e) {
                  (this.options = i.extend({ offset: 0 }, e)),
                    (this.source = t),
                    (this._children = []),
                    (this._positions = { name: 0 }),
                    this.initialize.apply(this, arguments);
                }
                function a(t, e, n) {
                  (this.parent = t),
                    (this._name = e.value),
                    (this._value = n ? n.value : ""),
                    (this._positions = {
                      name: e.start,
                      value: n ? n.start : -1
                    }),
                    this.initialize.apply(this, arguments);
                }
                return (
                  (o.extend = s.extend),
                  (o.prototype = {
                    type: "container",
                    initialize: function() {},
                    _pos: function(t, e) {
                      return t + (e ? this.options.offset : 0);
                    },
                    _updateSource: function(t, e, n) {
                      var s = r.create(e, void 0 === n ? 0 : n - e),
                        o = t.length - s.length(),
                        a = function(t) {
                          Object.keys(t).forEach(function(e) {
                            t[e] >= s.end && (t[e] += o);
                          });
                        };
                      a(this._positions);
                      var c = function(t) {
                        t.forEach(function(t) {
                          a(t._positions), "container" == t.type && c(t.list());
                        });
                      };
                      c(this.list()),
                        (this.source = i.replaceSubstring(this.source, t, s));
                    },
                    add: function(t, e, n) {
                      var r = new a(t, e);
                      return this._children.push(r), r;
                    },
                    get: function(t) {
                      return "number" == typeof t
                        ? this.list()[t]
                        : "string" == typeof t
                        ? i.find(this.list(), function(e) {
                            return e.name() === t;
                          })
                        : t;
                    },
                    getAll: function(t) {
                      Array.isArray(t) || (t = [t]);
                      var e = [],
                        n = [];
                      return (
                        t.forEach(function(t) {
                          "string" == typeof t
                            ? e.push(t)
                            : "number" == typeof t && n.push(t);
                        }),
                        this.list().filter(function(t, r) {
                          return ~n.indexOf(r) || ~e.indexOf(t.name());
                        })
                      );
                    },
                    list: function() {
                      return this._children;
                    },
                    remove: function(t) {
                      var e = this.get(t);
                      if (e) {
                        this._updateSource("", e.fullRange());
                        var n = this._children.indexOf(e);
                        ~n && this._children.splice(n, 1);
                      }
                    },
                    indexOf: function(t) {
                      return this.list().indexOf(this.get(t));
                    },
                    value: function(t, e, n) {
                      var r = this.get(t);
                      return r
                        ? r.value(e)
                        : void 0 !== e
                        ? this.add(t, e, n)
                        : void 0;
                    },
                    values: function(t) {
                      return this.getAll(t).map(function(t) {
                        return t.value();
                      });
                    },
                    name: function(t) {
                      return (
                        void 0 !== t &&
                          this._name !== (t = String(t)) &&
                          (this._updateSource(
                            t,
                            this._positions.name,
                            this._positions.name + this._name.length
                          ),
                          (this._name = t)),
                        this._name
                      );
                    },
                    nameRange: function(t) {
                      return r.create(
                        this._positions.name + (t ? this.options.offset : 0),
                        this.name()
                      );
                    },
                    range: function(t) {
                      return r.create(
                        t ? this.options.offset : 0,
                        this.valueOf()
                      );
                    },
                    itemFromPosition: function(t, e) {
                      return i.find(this.list(), function(n) {
                        return n.range(e).inside(t);
                      });
                    },
                    toString: function() {
                      return this.valueOf();
                    },
                    valueOf: function() {
                      return this.source;
                    }
                  }),
                  (a.extend = s.extend),
                  (a.prototype = {
                    type: "element",
                    initialize: function() {},
                    _pos: function(t, e) {
                      return t + (e ? this.parent.options.offset : 0);
                    },
                    value: function(t) {
                      return (
                        void 0 !== t &&
                          this._value !== (t = String(t)) &&
                          (this.parent._updateSource(t, this.valueRange()),
                          (this._value = t)),
                        this._value
                      );
                    },
                    name: function(t) {
                      return (
                        void 0 !== t &&
                          this._name !== (t = String(t)) &&
                          (this.parent._updateSource(t, this.nameRange()),
                          (this._name = t)),
                        this._name
                      );
                    },
                    namePosition: function(t) {
                      return this._pos(this._positions.name, t);
                    },
                    valuePosition: function(t) {
                      return this._pos(this._positions.value, t);
                    },
                    range: function(t) {
                      return r.create(this.namePosition(t), this.valueOf());
                    },
                    fullRange: function(t) {
                      return this.range(t);
                    },
                    nameRange: function(t) {
                      return r.create(this.namePosition(t), this.name());
                    },
                    valueRange: function(t) {
                      return r.create(this.valuePosition(t), this.value());
                    },
                    toString: function() {
                      return this.valueOf();
                    },
                    valueOf: function() {
                      return this.name() + this.value();
                    }
                  }),
                  {
                    EditContainer: o,
                    EditElement: a,
                    createToken: function(t, e, n) {
                      var r = { start: t || 0, value: e || "", type: n };
                      return (r.end = r.start + r.value.length), r;
                    }
                  }
                );
              });
            },
            {
              "../assets/range": "assets\\range.js",
              "../utils/common": "utils\\common.js",
              "../vendor/klass": "vendor\\klass.js"
            }
          ],
          "editTree\\css.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../utils/common"),
                  i = t("./base"),
                  s = t("../parser/css"),
                  o = t("../utils/cssSections"),
                  a = t("../assets/range"),
                  c = t("../assets/stringStream"),
                  u = t("../assets/tokenIterator"),
                  l = { styleBefore: "\n\t", styleSeparator: ": ", offset: 0 },
                  f = /^\s+/,
                  p = /\s+$/,
                  d = 1,
                  h = 2;
                function m(t, e, n) {
                  var r;
                  return (
                    (n = n || d | h),
                    (e = t.substring(e)),
                    n & d && (r = e.match(f)) && (t.start += r[0].length),
                    n & h && (r = e.match(p)) && (t.end -= r[0].length),
                    t.end < t.start && (t.end = t.start),
                    t
                  );
                }
                function g(t, e) {
                  var n,
                    r,
                    i,
                    s = t.current();
                  if (!s) return null;
                  for (
                    var o = { white: 1, line: 1, comment: 1 };
                    (s = t.current()) && s.type in o;

                  )
                    t.next();
                  if (!t.hasNext()) return null;
                  (s = t.current()), (n = a(s.start, s.value));
                  for (var c, u = "@" == s.value.charAt(0); (s = t.next()); )
                    if (((n.end = s.end), ":" == s.type || "white" == s.type)) {
                      if (((n.end = s.start), t.next(), ":" == s.type || u))
                        break;
                    } else if (";" == s.type || "line" == s.type) {
                      (n.end = s.start), (r = a(s.start, 0)), t.next();
                      break;
                    }
                  if (((s = t.current()), !r && s))
                    for (
                      "line" == s.type && (c = s), r = a(s.start, s.value);
                      (s = t.next());

                    )
                      if (((r.end = s.end), "line" == s.type)) c = s;
                      else {
                        if ("}" == s.type || ";" == s.type) {
                          (r.end = s.start),
                            ";" == s.type && (i = a(s.start, s.value)),
                            t.next();
                          break;
                        }
                        if (":" == s.type && c) {
                          (r.end = c.start), (t._i = t.tokens.indexOf(c));
                          break;
                        }
                      }
                  return (
                    r || (r = a(n.end, 0)),
                    {
                      name: m(n, e),
                      value: m(r, e, d | (i ? h : 0)),
                      end: i || a(r.end, 0)
                    }
                  );
                }
                function b(t) {
                  var e,
                    n = c.create(t),
                    i = [],
                    s = /[\s\u00a0,;]/,
                    o = function() {
                      n.next(),
                        i.push(a(n.start, n.current())),
                        (n.start = n.pos);
                    };
                  for (n.eatSpace(), n.start = n.pos; (e = n.next()); )
                    if ('"' == e || "'" == e) {
                      if ((n.next(), !n.skipTo(e))) break;
                      o();
                    } else if ("(" == e) {
                      if ((n.backUp(1), !n.skipToPair("(", ")"))) break;
                      n.backUp(1), o();
                    } else
                      s.test(e) &&
                        (i.push(a(n.start, n.current().length - 1)),
                        n.eatWhile(s),
                        (n.start = n.pos));
                  return (
                    o(),
                    r.unique(
                      i.filter(function(t) {
                        return !!t.length();
                      })
                    )
                  );
                }
                function v(t, e, n) {
                  var r = x(e, n);
                  r.forEach(function(e) {
                    t._children.push(
                      new w(
                        t,
                        i.createToken(e.name.start, e.nameText),
                        i.createToken(e.value.start, e.valueText),
                        i.createToken(e.end.start, e.endText)
                      )
                    );
                  });
                }
                function x(t, e) {
                  e = e || 0;
                  var n = [];
                  if (!(t = t.replace(p, ""))) return n;
                  for (var r, i = s.parse(t), o = u.create(i); (r = g(o, t)); )
                    n.push({
                      nameText: r.name.substring(t),
                      name: r.name.shift(e),
                      valueText: r.value.substring(t),
                      value: r.value.shift(e),
                      endText: r.end.substring(t),
                      end: r.end.shift(e)
                    });
                  return n;
                }
                var y = i.EditContainer.extend({
                    initialize: function(t, e) {
                      r.extend(this.options, l, e),
                        Array.isArray(t) && (t = s.toSource(t));
                      var n = o.findAllRules(t),
                        i = n.shift(),
                        c = [];
                      n.forEach(function(t) {
                        var e = !r.find(c, function(e) {
                          return e.contains(t);
                        });
                        e && c.push(t);
                      });
                      var u = a.create2(i.start, i._selectorEnd);
                      (this._name = u.substring(t)),
                        (this._positions.name = u.start),
                        (this._positions.contentStart = i._contentStart + 1);
                      var f = i._contentStart + 1,
                        p = (i.end, this);
                      c.forEach(function(e) {
                        v(p, t.substring(f, e.start), f);
                        r.extend({}, p.options, {
                          offset: e.start + p.options.offset
                        });
                        f = e.end;
                      }),
                        v(this, t.substring(f, i.end - 1), f),
                        this._saveStyle();
                    },
                    _saveStyle: function() {
                      var t = this._positions.contentStart,
                        e = this.source;
                      this.list().forEach(function(n) {
                        if ("container" !== n.type) {
                          n.styleBefore = e.substring(t, n.namePosition());
                          var i = r.splitByLines(n.styleBefore);
                          i.length > 1 &&
                            (n.styleBefore = "\n" + i[i.length - 1]),
                            (n.styleSeparator = e.substring(
                              n.nameRange().end,
                              n.valuePosition()
                            ));
                          var s = n.styleBefore.split("*/");
                          (n.styleBefore = s[s.length - 1]),
                            (n.styleSeparator = n.styleSeparator.replace(
                              /\/\*.*?\*\//g,
                              ""
                            )),
                            (t = n.range().end);
                        }
                      });
                    },
                    namePosition: function(t) {
                      return this._pos(this._positions.name, t);
                    },
                    valuePosition: function(t) {
                      return this._pos(this._positions.contentStart, t);
                    },
                    valueRange: function(t) {
                      return a.create2(
                        this.valuePosition(t),
                        this._pos(this.valueOf().length, t) - 1
                      );
                    },
                    add: function(t, e, n) {
                      var s = this.list(),
                        o = this._positions.contentStart,
                        a = r.pick(
                          this.options,
                          "styleBefore",
                          "styleSeparator"
                        );
                      void 0 === n && (n = s.length);
                      var c = s[n];
                      c
                        ? (o = c.fullRange().start)
                        : (c = s[n - 1]) && (c.end(";"), (o = c.range().end)),
                        c && (a = r.pick(c, "styleBefore", "styleSeparator"));
                      var u = i.createToken(o + a.styleBefore.length, t),
                        l = i.createToken(u.end + a.styleSeparator.length, e),
                        f = new w(this, u, l, i.createToken(l.end, ";"));
                      return (
                        r.extend(f, a),
                        this._updateSource(f.styleBefore + f.toString(), o),
                        this._children.splice(n, 0, f),
                        f
                      );
                    }
                  }),
                  w = i.EditElement.extend({
                    initialize: function(t, e, n, r) {
                      (this.styleBefore = t.options.styleBefore),
                        (this.styleSeparator = t.options.styleSeparator),
                        (this._end = r.value),
                        (this._positions.end = r.start);
                    },
                    valueParts: function(t) {
                      var e = b(this.value());
                      if (t) {
                        var n = this.valuePosition(!0);
                        e.forEach(function(t) {
                          t.shift(n);
                        });
                      }
                      return e;
                    },
                    value: function(t) {
                      var e = void 0 !== t,
                        n = this.parent.list();
                      if (e && this.isIncomplete()) {
                        var i = this,
                          s = r.find(n, function(t) {
                            return t !== i && !t.isIncomplete();
                          });
                        (this.styleSeparator = s
                          ? s.styleSeparator
                          : this.parent.options.styleSeparator),
                          this.parent._updateSource(
                            this.styleSeparator,
                            a(this.valueRange().start, 0)
                          );
                      }
                      var o = this.constructor.__super__.value.apply(
                        this,
                        arguments
                      );
                      if (e) {
                        var c = n.indexOf(this);
                        c === n.length - 1 || this.end() || this.end(";");
                      }
                      return o;
                    },
                    isIncomplete: function() {
                      return this.nameRange().end === this.valueRange().start;
                    },
                    end: function(t) {
                      return (
                        void 0 !== t &&
                          this._end !== t &&
                          (this.parent._updateSource(
                            t,
                            this._positions.end,
                            this._positions.end + this._end.length
                          ),
                          (this._end = t)),
                        this._end
                      );
                    },
                    fullRange: function(t) {
                      var e = this.range(t);
                      return (e.start -= this.styleBefore.length), e;
                    },
                    valueOf: function() {
                      return (
                        this.name() +
                        this.styleSeparator +
                        this.value() +
                        this.end()
                      );
                    }
                  });
                return {
                  parse: function(t, e) {
                    return new y(t, e);
                  },
                  parseFromPosition: function(t, e, n) {
                    var r = o.locateRule(t, e, n);
                    return r && r.inside(e)
                      ? this.parse(r.substring(t), { offset: r.start })
                      : null;
                  },
                  propertyFromPosition: function(t, e) {
                    var n = null,
                      i =
                        "string" == typeof t
                          ? this.parseFromPosition(t, e, !0)
                          : t;
                    return (
                      i &&
                        ((n = i.itemFromPosition(e, !0)) ||
                          (n = r.find(i.list(), function(t) {
                            return t.range(!0).end == e;
                          }))),
                      n
                    );
                  },
                  baseName: function(t) {
                    return t.replace(/^\s*\-\w+\-/, "");
                  },
                  findParts: b,
                  extractPropertiesFromSource: x
                };
              });
            },
            {
              "../assets/range": "assets\\range.js",
              "../assets/stringStream": "assets\\stringStream.js",
              "../assets/tokenIterator": "assets\\tokenIterator.js",
              "../parser/css": "parser\\css.js",
              "../utils/common": "utils\\common.js",
              "../utils/cssSections": "utils\\cssSections.js",
              "./base": "editTree\\base.js"
            }
          ],
          "editTree\\xml.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("./base"),
                  i = t("../parser/xml"),
                  s = t("../assets/range"),
                  o = t("../utils/common"),
                  a = {
                    styleBefore: " ",
                    styleSeparator: "=",
                    styleQuote: '"',
                    offset: 0
                  },
                  c = /^<([\w\:\-]+)((?:\s+[\w\-:]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)>/m,
                  u = r.EditContainer.extend({
                    initialize: function(t, e) {
                      o.defaults(this.options, a), (this._positions.name = 1);
                      var n = null,
                        r = i.parse(t);
                      r.forEach(function(e) {
                        switch (
                          ((e.value = s.create(e).substring(t)), e.type)
                        ) {
                          case "tag":
                            /^<[^\/]+/.test(e.value) &&
                              (this._name = e.value.substring(1));
                            break;
                          case "attribute":
                            n && this._children.push(new l(this, n)), (n = e);
                            break;
                          case "string":
                            this._children.push(new l(this, n, e)), (n = null);
                        }
                      }, this),
                        n && this._children.push(new l(this, n)),
                        this._saveStyle();
                    },
                    _saveStyle: function() {
                      var t = this.nameRange().end,
                        e = this.source;
                      this.list().forEach(function(n) {
                        (n.styleBefore = e.substring(t, n.namePosition())),
                          -1 !== n.valuePosition() &&
                            (n.styleSeparator = e.substring(
                              n.namePosition() + n.name().length,
                              n.valuePosition() - n.styleQuote.length
                            )),
                          (t = n.range().end);
                      });
                    },
                    add: function(t, e, n) {
                      var i = this.list(),
                        s = this.nameRange().end,
                        a = o.pick(
                          this.options,
                          "styleBefore",
                          "styleSeparator",
                          "styleQuote"
                        );
                      void 0 === n && (n = i.length);
                      var c = i[n];
                      c
                        ? (s = c.fullRange().start)
                        : (c = i[n - 1]) && (s = c.range().end),
                        c &&
                          (a = o.pick(
                            c,
                            "styleBefore",
                            "styleSeparator",
                            "styleQuote"
                          )),
                        (e = a.styleQuote + e + a.styleQuote);
                      var u = new l(
                        this,
                        r.createToken(s + a.styleBefore.length, t),
                        r.createToken(
                          s +
                            a.styleBefore.length +
                            t.length +
                            a.styleSeparator.length,
                          e
                        )
                      );
                      return (
                        o.extend(u, a),
                        this._updateSource(u.styleBefore + u.toString(), s),
                        this._children.splice(n, 0, u),
                        u
                      );
                    },
                    addClass: function(t) {
                      var e = this.get("class");
                      if (((t = o.trim(t)), !e)) return this.add("class", t);
                      var n = e.value(),
                        r = " " + n.replace(/\n/g, " ") + " ";
                      ~r.indexOf(" " + t + " ") || e.value(n + " " + t);
                    },
                    removeClass: function(t) {
                      var e = this.get("class");
                      if (((t = o.trim(t)), e)) {
                        var n = new RegExp("(^|\\s+)" + o.escapeForRegexp(t)),
                          r = e.value().replace(n, "");
                        o.trim(r) ? e.value(r) : this.remove("class");
                      }
                    }
                  }),
                  l = r.EditElement.extend({
                    initialize: function(t, e, n) {
                      (this.styleBefore = t.options.styleBefore),
                        (this.styleSeparator = t.options.styleSeparator);
                      var r = "",
                        i = t.options.styleQuote;
                      n &&
                        ((r = n.value),
                        '"' == (i = r.charAt(0)) || "'" == i
                          ? (r = r.substring(1))
                          : (i = ""),
                        i &&
                          r.charAt(r.length - 1) == i &&
                          (r = r.substring(0, r.length - 1))),
                        (this.styleQuote = i),
                        (this._value = r),
                        (this._positions.value = n ? n.start + i.length : -1);
                    },
                    fullRange: function(t) {
                      var e = this.range(t);
                      return (e.start -= this.styleBefore.length), e;
                    },
                    valueOf: function() {
                      return (
                        this.name() +
                        this.styleSeparator +
                        this.styleQuote +
                        this.value() +
                        this.styleQuote
                      );
                    }
                  });
                return {
                  parse: function(t, e) {
                    return new u(t, e);
                  },
                  parseFromPosition: function(t, e, n) {
                    var r = this.extractTag(t, e, n);
                    return r && r.inside(e)
                      ? this.parse(r.substring(t), { offset: r.start })
                      : null;
                  },
                  extractTag: function(t, e, n) {
                    var r,
                      i = t.length,
                      o = Math.min(2e3, i),
                      a = null,
                      u = function(e) {
                        var n;
                        if ("<" == t.charAt(e) && (n = t.substr(e, o).match(c)))
                          return s.create(e, n[0]);
                      };
                    for (r = e; r >= 0 && !(a = u(r)); r--);
                    if (a && (a.inside(e) || n)) return a;
                    if (!a && n) return null;
                    for (r = e; r < i; r++) if ((a = u(r))) return a;
                  }
                };
              });
            },
            {
              "../assets/range": "assets\\range.js",
              "../parser/xml": "parser\\xml.js",
              "../utils/common": "utils\\common.js",
              "./base": "editTree\\base.js"
            }
          ],
          "filter\\bem.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("./html"),
                  i = t("../assets/preferences"),
                  s = t("../utils/abbreviation"),
                  o = t("../utils/common");
                i.define(
                  "bem.elementSeparator",
                  "__",
                  "Class name’s element separator."
                ),
                  i.define(
                    "bem.modifierSeparator",
                    "_",
                    "Class name’s modifier separator."
                  ),
                  i.define(
                    "bem.shortElementPrefix",
                    "-",
                    "Symbol for describing short “block-element” notation. Class names prefixed with this symbol will be treated as element name for parent‘s block name. Each symbol instance traverses one level up in parsed tree for block name lookup. Empty value will disable short notation."
                  );
                var a = !1;
                function c() {
                  return {
                    element: i.get("bem.elementSeparator"),
                    modifier: i.get("bem.modifierSeparator")
                  };
                }
                function u(t) {
                  if (s.isSnippet(t)) return t;
                  t.__bem = { block: "", element: "", modifier: "" };
                  var e = (function(t) {
                      t = (" " + (t || "") + " ").replace(/\s+/g, " ");
                      var e = i.get("bem.shortElementPrefix");
                      if (e) {
                        var n = new RegExp(
                          "\\s(" + o.escapeForRegexp(e) + "+)",
                          "g"
                        );
                        t = t.replace(n, function(t, e) {
                          return " " + o.repeatString(c().element, e.length);
                        });
                      }
                      return o.trim(t);
                    })(t.attribute("class")).split(" "),
                    n = /^[a-z]\-/i;
                  return (
                    (t.__bem.block = o.find(e, function(t) {
                      return n.test(t);
                    })),
                    t.__bem.block ||
                      ((n = /^[a-z]/i),
                      (t.__bem.block =
                        o.find(e, function(t) {
                          return n.test(t);
                        }) || "")),
                    (e = e.map(function(e) {
                      return (function(t, e) {
                        t = l((t = l(t, e, "element")), e, "modifier");
                        var n = "",
                          r = "",
                          i = "",
                          s = c();
                        if (~t.indexOf(s.element)) {
                          var o = t.split(s.element);
                          n = o.shift();
                          var a = o.pop().split(s.modifier);
                          o.push(a.shift()),
                            (r = o.join(s.element)),
                            (i = a.join(s.modifier));
                        } else if (~t.indexOf(s.modifier)) {
                          var u = t.split(s.modifier);
                          (n = u.shift()), (i = u.join(s.modifier));
                        }
                        if (n || r || i) {
                          n || (n = e.__bem.block);
                          var f = n,
                            p = [];
                          return (
                            r ? ((f += s.element + r), p.push(f)) : p.push(f),
                            i && p.push(f + s.modifier + i),
                            (e.__bem.block && !i) || (e.__bem.block = n),
                            (e.__bem.element = r),
                            (e.__bem.modifier = i),
                            p
                          );
                        }
                        return t;
                      })(e, t);
                    })),
                    (e = o.unique(o.flatten(e)).join(" ")) &&
                      t.attribute("class", e),
                    t
                  );
                }
                function l(t, e, n) {
                  var r = c(),
                    i = new RegExp("^(" + r[n] + ")+", "g");
                  if (i.test(t)) {
                    for (
                      var s = 0,
                        o = t.replace(i, function(t) {
                          return (s = t.length / r[n].length), "";
                        }),
                        a = e;
                      a.parent && s--;

                    )
                      a = a.parent;
                    if (((a && a.__bem) || (a = e), a && a.__bem)) {
                      var u = a.__bem.block;
                      return (
                        "modifier" == n &&
                          a.__bem.element &&
                          (u += r.element + a.__bem.element),
                        u + r[n] + o
                      );
                    }
                  }
                  return t;
                }
                return function(t, e) {
                  return (
                    (a = !1),
                    (t = (function t(e, n) {
                      e.name && u(e);
                      e.children.forEach(function(e) {
                        t(e, n), !s.isSnippet(e) && e.start && (a = !0);
                      });
                      return e;
                    })(t, e)),
                    a && (t = r(t, e)),
                    t
                  );
                };
              });
            },
            {
              "../assets/preferences": "assets\\preferences.js",
              "../utils/abbreviation": "utils\\abbreviation.js",
              "../utils/common": "utils\\common.js",
              "./html": "filter\\html.js"
            }
          ],
          "filter\\comment.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../assets/preferences"),
                  i = t("../utils/common"),
                  s = t("../utils/template"),
                  o = t("../utils/abbreviation");
                t("./main");
                function a(t, e, n) {
                  return (
                    t.children.forEach(function(t) {
                      o.isBlock(t) &&
                        (function(t, e, n) {
                          var s = r.get("filter.commentTrigger");
                          if ("*" != s) {
                            var o = i.find(s.split(","), function(e) {
                              return !!t.attribute(i.trim(e));
                            });
                            if (!o) return;
                          }
                          var a = {
                              node: t,
                              name: t.name(),
                              padding: t.parent ? t.parent.padding : "",
                              attr: function(e, n, r) {
                                var i = t.attribute(e);
                                return i ? (n || "") + i + (r || "") : "";
                              }
                            },
                            c = e ? e(a) : "",
                            u = n ? n(a) : "";
                          (t.start = t.start.replace(/</, c + "<")),
                            (t.end = t.end.replace(/>/, ">" + u));
                        })(t, e, n),
                        a(t, e, n);
                    }),
                    t
                  );
                }
                return (
                  r.define(
                    "filter.commentAfter",
                    '\n\x3c!-- /<%= attr("id", "#") %><%= attr("class", ".") %> --\x3e',
                    "A definition of comment that should be placed <i>after</i> matched element when <code>comment</code> filter is applied. This definition is an ERB-style template passed to <code>_.template()</code> function (see Underscore.js docs for details). In template context, the following properties and functions are availabe:\n<ul><li><code>attr(name, before, after)</code> – a function that outputsspecified attribute value concatenated with <code>before</code> and <code>after</code> strings. If attribute doesn't exists, the empty string will be returned.</li><li><code>node</code> – current node (instance of <code>AbbreviationNode</code>)</li><li><code>name</code> – name of current tag</li><li><code>padding</code> – current string padding, can be used for formatting</li></ul>"
                  ),
                  r.define(
                    "filter.commentBefore",
                    "",
                    "A definition of comment that should be placed <i>before</i> matched element when <code>comment</code> filter is applied. For more info, read description of <code>filter.commentAfter</code> property"
                  ),
                  r.define(
                    "filter.commentTrigger",
                    "id, class",
                    "A comma-separated list of attribute names that should exist in abbreviatoin where comment should be added. If you wish to add comment for every element, set this option to <code>*</code>"
                  ),
                  function(t) {
                    var e = s(r.get("filter.commentBefore")),
                      n = s(r.get("filter.commentAfter"));
                    return a(t, e, n);
                  }
                );
              });
            },
            {
              "../assets/preferences": "assets\\preferences.js",
              "../utils/abbreviation": "utils\\abbreviation.js",
              "../utils/common": "utils\\common.js",
              "../utils/template": "utils\\template.js",
              "./main": "filter\\main.js"
            }
          ],
          "filter\\css.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                return function t(e, n, r) {
                  return (
                    (r = r || 0),
                    e.children.forEach(function(e) {
                      var i;
                      ((i = e).parent && !i.parent.parent && !i.index()) ||
                        !1 === n.tag_nl ||
                        (e.start = "\n" + e.start),
                        t(e, n, r + 1);
                    }),
                    e
                  );
                };
              });
            },
            {}
          ],
          "filter\\escape.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = { "<": "&lt;", ">": "&gt;", "&": "&amp;" };
                function i(t) {
                  return t.replace(/([<>&])/g, function(t, e) {
                    return r[e];
                  });
                }
                return function t(e) {
                  return (
                    e.children.forEach(function(e) {
                      (e.start = i(e.start)),
                        (e.end = i(e.end)),
                        (e.content = i(e.content)),
                        t(e);
                    }),
                    e
                  );
                };
              });
            },
            {}
          ],
          "filter\\format.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../utils/common"),
                  i = t("../utils/abbreviation"),
                  s = t("../assets/preferences");
                t("../assets/resources");
                s.define(
                  "format.noIndentTags",
                  "html",
                  "A comma-separated list of tag names that should not get inner indentation."
                ),
                  s.define(
                    "format.forceIndentationForTags",
                    "body",
                    "A comma-separated list of tag names that should <em>always</em> get inner indentation."
                  );
                var o = "%s";
                function a(t) {
                  return t.parent && !t.parent.parent && !t.index();
                }
                function c(t, e) {
                  return (
                    !(!0 !== e.tag_nl && !i.isBlock(t)) ||
                    (!(!t.parent || !e.inline_break) && u(t.parent, e))
                  );
                }
                function u(t, e) {
                  var n = 0;
                  return !!r.find(t.children, function(t) {
                    if (
                      (t.isTextNode() || !i.isInline(t)
                        ? (n = 0)
                        : i.isInline(t) && n++,
                      n >= e.inline_break)
                    )
                      return !0;
                  });
                }
                function l(t, e) {
                  t.start = t.end = o;
                  var n,
                    r,
                    l,
                    f = i.isUnary(t),
                    p = "\n",
                    d = (function(t) {
                      if (
                        ~(s.getArray("format.noIndentTags") || []).indexOf(
                          t.name()
                        )
                      )
                        return "";
                      return "\t";
                    })(t);
                  if (!1 !== e.tag_nl) {
                    var h =
                      !0 === e.tag_nl && (e.tag_nl_leaf || t.children.length);
                    if (!h) {
                      var m =
                        s.getArray("format.forceIndentationForTags") || [];
                      h = ~m.indexOf(t.name());
                    }
                    t.isTextNode() ||
                      (c(t, e)
                        ? (a(t) ||
                            (i.isSnippet(t.parent) && !t.index()) ||
                            (t.start = p + t.start),
                          (i.hasBlockChildren(t) ||
                            ((l = e),
                            (r = t).children.length && c(r.children[0], l)) ||
                            (h && !f)) &&
                            (t.end = p + t.end),
                          (i.hasTagsInContent(t) ||
                            (h && !t.children.length && !f)) &&
                            (t.start += p + d))
                        : i.isInline(t) &&
                          ((n = t).parent && i.hasBlockChildren(n.parent)) &&
                          !a(t)
                        ? (t.start = p + t.start)
                        : i.isInline(t) &&
                          (function(t, e) {
                            if (
                              !t.children.some(function(t) {
                                return !i.isSnippet(t) && !i.isInline(t);
                              })
                            )
                              return u(t, e);
                            return !0;
                          })(t, e) &&
                          (t.end = p + t.end),
                      (t.padding = d));
                  }
                  return t;
                }
                return function t(e, n, r) {
                  return (
                    (r = r || 0),
                    e.children.forEach(function(e) {
                      i.isSnippet(e)
                        ? (function(t, e) {
                            (t.start = t.end = ""),
                              !a(t) &&
                                !1 !== e.tag_nl &&
                                c(t, e) &&
                                ((!(function(t) {
                                  return !t.parent;
                                })(t.parent) &&
                                  i.isInline(t.parent)) ||
                                  (t.start = "\n" + t.start));
                          })(e, n)
                        : l(e, n),
                        t(e, n, r + 1);
                    }),
                    e
                  );
                };
              });
            },
            {
              "../assets/preferences": "assets\\preferences.js",
              "../assets/resources": "assets\\resources.js",
              "../utils/abbreviation": "utils\\abbreviation.js",
              "../utils/common": "utils\\common.js"
            }
          ],
          "filter\\haml.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../utils/common"),
                  i = t("../utils/abbreviation"),
                  s = t("./format");
                function o(t, e) {
                  var n,
                    i,
                    s,
                    o = "",
                    a = [],
                    c = (e.attributeQuote(), e.cursor());
                  return (
                    t.attributeList().forEach(function(t) {
                      var n,
                        i = e.attributeName(t.name);
                      switch (i.toLowerCase()) {
                        case "id":
                          o += "#" + (t.value || c);
                          break;
                        case "class":
                          o +=
                            "." +
                            ((n = t.value || c),
                            r.trim(n).replace(/\s+/g, "."));
                          break;
                        default:
                          a.push({
                            name: i,
                            value: t.value || c,
                            isBoolean: e.isBoolean(t.name, t.value)
                          });
                      }
                    }),
                    a.length &&
                      (o += (function t(e, n) {
                        var r = n.attributeQuote();
                        return (
                          "{" +
                          e
                            .map(function(e) {
                              var i = r + e.value + r;
                              return (
                                Array.isArray(e.value)
                                  ? (i = t(e.value, n))
                                  : e.isBoolean && (i = "true"),
                                ":" + e.name + " => " + i
                              );
                            })
                            .join(", ") +
                          "}"
                        );
                      })(
                        ((n = []),
                        (i = null),
                        (s = /^data-/i),
                        a.forEach(function(t) {
                          s.test(t.name)
                            ? (i ||
                                ((i = []), n.push({ name: "data", value: i })),
                              i.push(
                                r.extend({}, t, { name: t.name.replace(s, "") })
                              ))
                            : n.push(t);
                        }),
                        n),
                        e
                      )),
                    o
                  );
                }
                return function t(e, n, a) {
                  return (
                    (a = a || 0) || (e = s(e, "_format", n)),
                    e.children.forEach(function(e) {
                      i.isSnippet(e) ||
                        (function(t, e) {
                          if (!t.parent) return t;
                          var n = o(t, e),
                            s = e.cursor(),
                            a = i.isUnary(t),
                            c = e.self_closing_tag && a ? "/" : "",
                            u = "",
                            l = "%" + e.tagName(t.name());
                          "%div" == l.toLowerCase() &&
                            n &&
                            -1 == n.indexOf("{") &&
                            (l = "");
                          (t.end = ""),
                            (u = l + n + c),
                            t.content &&
                              !/^\s/.test(t.content) &&
                              (t.content = " " + t.content);
                          (t.start = r.replaceSubstring(
                            t.start,
                            u,
                            t.start.indexOf("%s"),
                            "%s"
                          )),
                            t.children.length || a || (t.start += s);
                        })(e, n),
                        t(e, n, a + 1);
                    }),
                    e
                  );
                };
              });
            },
            {
              "../utils/abbreviation": "utils\\abbreviation.js",
              "../utils/common": "utils\\common.js",
              "./format": "filter\\format.js"
            }
          ],
          "filter\\html.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../utils/abbreviation"),
                  i = t("../utils/common"),
                  s = t("../assets/tabStops"),
                  o = t("./format");
                return function t(e, n, a) {
                  return (
                    (a = a || 0) || (e = o(e, n, a)),
                    e.children.forEach(function(e) {
                      r.isSnippet(e) ||
                        (function(t, e) {
                          if (!t.parent) return t;
                          var n = (function(t, e) {
                              var n = e.attributeQuote(),
                                r = e.cursor();
                              return t
                                .attributeList()
                                .map(function(t) {
                                  var i = e.isBoolean(t.name, t.value),
                                    s = e.attributeName(t.name),
                                    o = i ? s : t.value;
                                  return i && e.allowCompactBoolean()
                                    ? " " + s
                                    : " " + s + "=" + n + (o || r) + n;
                                })
                                .join("");
                            })(t, e),
                            o = e.cursor(),
                            a = r.isUnary(t),
                            c = "",
                            u = "";
                          if (!t.isTextNode()) {
                            var l = e.tagName(t.name());
                            a
                              ? ((c = "<" + l + n + e.selfClosing() + ">"),
                                (t.end = ""))
                              : ((c = "<" + l + n + ">"), (u = "</" + l + ">"));
                          }
                          (t.start = i.replaceSubstring(
                            t.start,
                            c,
                            t.start.indexOf("%s"),
                            "%s"
                          )),
                            (t.end = i.replaceSubstring(
                              t.end,
                              u,
                              t.end.indexOf("%s"),
                              "%s"
                            )),
                            t.children.length ||
                              a ||
                              ~t.content.indexOf(o) ||
                              s.extract(t.content).tabstops.length ||
                              (t.start += o);
                        })(e, n),
                        t(e, n, a + 1);
                    }),
                    e
                  );
                };
              });
            },
            {
              "../assets/tabStops": "assets\\tabStops.js",
              "../utils/abbreviation": "utils\\abbreviation.js",
              "../utils/common": "utils\\common.js",
              "./format": "filter\\format.js"
            }
          ],
          "filter\\jade.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../utils/common"),
                  i = t("../utils/abbreviation"),
                  s = t("./format"),
                  o = t("../assets/tabStops"),
                  a = t("../assets/profile"),
                  c = /[\n\r]/,
                  u = /^\s*\|/,
                  l = /^\s/;
                function f(t, e) {
                  var n,
                    i,
                    s = "",
                    o = [],
                    a = (e.attributeQuote(), e.cursor());
                  return (
                    t.attributeList().forEach(function(t) {
                      var n,
                        i = e.attributeName(t.name);
                      switch (i.toLowerCase()) {
                        case "id":
                          s += "#" + (t.value || a);
                          break;
                        case "class":
                          s +=
                            "." +
                            ((n = t.value || a),
                            r.trim(n).replace(/\s+/g, "."));
                          break;
                        default:
                          o.push({
                            name: i,
                            value: t.value || a,
                            isBoolean: e.isBoolean(t.name, t.value)
                          });
                      }
                    }),
                    o.length &&
                      (s += ((n = o),
                      (i = e.attributeQuote()),
                      "(" +
                        n
                          .map(function(t) {
                            return t.isBoolean
                              ? t.name
                              : t.name + "=" + i + t.value + i;
                          })
                          .join(", ") +
                        ")")),
                    s
                  );
                }
                function p(t, e) {
                  if (!t.parent) return t;
                  var n = f(t, e),
                    s = e.cursor(),
                    a = i.isUnary(t),
                    p = e.tagName(t.name());
                  "div" == p.toLowerCase() &&
                    n &&
                    "(" != n.charAt(0) &&
                    (p = ""),
                    (t.end = "");
                  var d = p + n;
                  !(function(t) {
                    if (!t.content) return;
                    var e = o.replaceVariables(t.content, function(t, e) {
                      return "nl" === e || "newline" === e ? "\n" : t;
                    });
                    if (c.test(e) && !u.test(e)) {
                      t.content = "\n| " + r.padString(e, "| ");
                    } else l.test(e) || (t.content = " " + e);
                  })(t);
                  return (
                    (t.start = r.replaceSubstring(
                      t.start,
                      d,
                      t.start.indexOf("%s"),
                      "%s"
                    )),
                    t.children.length || a || (t.start += s),
                    t
                  );
                }
                return function t(e, n, r) {
                  return (
                    (r = r || 0) || (e = s(e, a.get("xml"))),
                    e.children.forEach(function(e) {
                      i.isSnippet(e) || p(e, n), t(e, n, r + 1);
                    }),
                    e
                  );
                };
              });
            },
            {
              "../assets/profile": "assets\\profile.js",
              "../assets/tabStops": "assets\\tabStops.js",
              "../utils/abbreviation": "utils\\abbreviation.js",
              "../utils/common": "utils\\common.js",
              "./format": "filter\\format.js"
            }
          ],
          "filter\\jsx.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = { class: "className", for: "htmlFor" };
                return function t(e) {
                  return (
                    e.children.forEach(function(e) {
                      e._attributes.forEach(function(t) {
                        t.name in r && (t.name = r[t.name]);
                      }),
                        t(e);
                    }),
                    e
                  );
                };
              });
            },
            {}
          ],
          "filter\\main.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../utils/common"),
                  i = t("../assets/profile"),
                  s = t("../assets/resources"),
                  o = {
                    html: t("./html"),
                    haml: t("./haml"),
                    jade: t("./jade"),
                    jsx: t("./jsx"),
                    slim: t("./slim"),
                    xsl: t("./xsl"),
                    css: t("./css"),
                    bem: t("./bem"),
                    c: t("./comment"),
                    e: t("./escape"),
                    s: t("./singleLine"),
                    t: t("./trim")
                  };
                function a(t) {
                  return t
                    ? "string" == typeof t
                      ? t.split(/[\|,]/g)
                      : t
                    : [];
                }
                return {
                  add: function(t, e) {
                    o[t] = e;
                  },
                  apply: function(t, e, n) {
                    return (
                      (n = i.get(n)),
                      a(e).forEach(function(e) {
                        var i = r.trim(e.toLowerCase());
                        i && i in o && (t = o[i](t, n));
                      }),
                      t
                    );
                  },
                  composeList: function(t, e, n) {
                    var r = a(
                      (e = i.get(e)).filters ||
                        s.findItem(t, "filters") ||
                        "html"
                    );
                    return (
                      e.extraFilters && (r = r.concat(a(e.extraFilters))),
                      n && (r = r.concat(a(n))),
                      (r && r.length) || (r = a("html")),
                      r
                    );
                  },
                  extract: function(t) {
                    var e = "";
                    return [
                      (t = t.replace(/\|([\w\|\-]+)$/, function(t, n) {
                        return (e = n), "";
                      })),
                      a(e)
                    ];
                  }
                };
              });
            },
            {
              "../assets/profile": "assets\\profile.js",
              "../assets/resources": "assets\\resources.js",
              "../utils/common": "utils\\common.js",
              "./bem": "filter\\bem.js",
              "./comment": "filter\\comment.js",
              "./css": "filter\\css.js",
              "./escape": "filter\\escape.js",
              "./haml": "filter\\haml.js",
              "./html": "filter\\html.js",
              "./jade": "filter\\jade.js",
              "./jsx": "filter\\jsx.js",
              "./singleLine": "filter\\singleLine.js",
              "./slim": "filter\\slim.js",
              "./trim": "filter\\trim.js",
              "./xsl": "filter\\xsl.js"
            }
          ],
          "filter\\singleLine.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../utils/abbreviation"),
                  i = /^\s+/,
                  s = /[\n\r]/g;
                return function t(e) {
                  return (
                    e.children.forEach(function(e) {
                      r.isSnippet(e) ||
                        ((e.start = e.start.replace(i, "")),
                        (e.end = e.end.replace(i, ""))),
                        (e.start = e.start.replace(s, "")),
                        (e.end = e.end.replace(s, "")),
                        (e.content = e.content.replace(s, "")),
                        t(e);
                    }),
                    e
                  );
                };
              });
            },
            { "../utils/abbreviation": "utils\\abbreviation.js" }
          ],
          "filter\\slim.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../utils/common"),
                  i = t("../utils/abbreviation"),
                  s = t("./format"),
                  o = t("../assets/tabStops"),
                  a = t("../assets/preferences"),
                  c = t("../assets/profile"),
                  u = /[\n\r]/,
                  l = /^\s*\|/,
                  f = /^\s/;
                function p(t, e) {
                  var n = e.attributeQuote(),
                    r = (function() {
                      var t = " ",
                        e = "";
                      switch (a.get("slim.attributesWrapper")) {
                        case "round":
                          (t = "("), (e = ")");
                          break;
                        case "square":
                          (t = "["), (e = "]");
                          break;
                        case "curly":
                          (t = "{"), (e = "}");
                      }
                      return { start: t, end: e };
                    })();
                  return (
                    r.start +
                    t
                      .map(function(t) {
                        var e = n + t.value + n;
                        if (t.isBoolean) {
                          if (r.end) return t.name;
                          e = "true";
                        }
                        return t.name + "=" + e;
                      })
                      .join(" ") +
                    r.end
                  );
                }
                function d(t, e) {
                  var n = "",
                    i = [],
                    s = (e.attributeQuote(), e.cursor());
                  return (
                    t.attributeList().forEach(function(t) {
                      var o,
                        a = e.attributeName(t.name);
                      switch (a.toLowerCase()) {
                        case "id":
                          n += "#" + (t.value || s);
                          break;
                        case "class":
                          n +=
                            "." +
                            ((o = t.value || s),
                            r.trim(o).replace(/\s+/g, "."));
                          break;
                        default:
                          i.push({
                            name: a,
                            value: t.value || s,
                            isBoolean: e.isBoolean(t.name, t.value)
                          });
                      }
                    }),
                    i.length && (n += p(i, e)),
                    n
                  );
                }
                function h(t, e) {
                  if (!t.parent) return t;
                  var n = d(t, e),
                    s = e.cursor(),
                    a = i.isUnary(t),
                    c = e.self_closing_tag && a ? "/" : "",
                    p = e.tagName(t.name());
                  "div" == p.toLowerCase() &&
                    n &&
                    -1 == "([{".indexOf(n.charAt(0)) &&
                    (p = ""),
                    (t.end = "");
                  var h = p + n + c;
                  !(function(t) {
                    if (!t.content) return;
                    var e = o.replaceVariables(t.content, function(t, e) {
                      return "nl" === e || "newline" === e ? "\n" : t;
                    });
                    if (u.test(e) && !l.test(e)) {
                      t.content = "\n| " + r.padString(e, "  ");
                    } else f.test(e) || (t.content = " " + e);
                  })(t);
                  return (
                    (t.start = r.replaceSubstring(
                      t.start,
                      h,
                      t.start.indexOf("%s"),
                      "%s"
                    )),
                    t.children.length || a || (t.start += s),
                    t
                  );
                }
                return (
                  a.define(
                    "slim.attributesWrapper",
                    "none",
                    "Defines how attributes will be wrapped:<ul><li><code>none</code> – no wrapping;</li><li><code>round</code> — wrap attributes with round braces;</li><li><code>square</code> — wrap attributes with round braces;</li><li><code>curly</code> — wrap attributes with curly braces.</li></ul>"
                  ),
                  function t(e, n, r) {
                    return (
                      (r = r || 0) || (e = s(e, c.get("xml"))),
                      e.children.forEach(function(e) {
                        i.isSnippet(e) || h(e, n), t(e, n, r + 1);
                      }),
                      e
                    );
                  }
                );
              });
            },
            {
              "../assets/preferences": "assets\\preferences.js",
              "../assets/profile": "assets\\profile.js",
              "../assets/tabStops": "assets\\tabStops.js",
              "../utils/abbreviation": "utils\\abbreviation.js",
              "../utils/common": "utils\\common.js",
              "./format": "filter\\format.js"
            }
          ],
          "filter\\trim.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../assets/preferences");
                return (
                  r.define(
                    "filter.trimRegexp",
                    "[\\s|\\u00a0]*[\\d|#|\\-|*|\\u2022]+\\.?\\s*",
                    "Regular expression used to remove list markers (numbers, dashes, bullets, etc.) in <code>t</code> (trim) filter. The trim filter is useful for wrapping with abbreviation lists, pased from other documents (for example, Word documents)."
                  ),
                  function(t) {
                    var e = new RegExp(r.get("filter.trimRegexp"));
                    return (function t(e, n) {
                      e.children.forEach(function(e) {
                        e.content && (e.content = e.content.replace(n, "")),
                          t(e, n);
                      });
                      return e;
                    })(t, e);
                  }
                );
              });
            },
            { "../assets/preferences": "assets\\preferences.js" }
          ],
          "filter\\xsl.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../utils/abbreviation"),
                  i = { "xsl:variable": 1, "xsl:with-param": 1 };
                return function t(e) {
                  return (
                    e.children.forEach(function(e) {
                      var n;
                      !r.isSnippet(e) &&
                        (e.name() || "").toLowerCase() in i &&
                        e.children.length &&
                        ((n = e).start = n.start.replace(
                          /\s+select\s*=\s*(['"]).*?\1/,
                          ""
                        )),
                        t(e);
                    }),
                    e
                  );
                };
              });
            },
            { "../utils/abbreviation": "utils\\abbreviation.js" }
          ],
          "generator\\lorem.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../assets/preferences"),
                  i = {
                    en: {
                      common: [
                        "lorem",
                        "ipsum",
                        "dolor",
                        "sit",
                        "amet",
                        "consectetur",
                        "adipisicing",
                        "elit"
                      ],
                      words: [
                        "exercitationem",
                        "perferendis",
                        "perspiciatis",
                        "laborum",
                        "eveniet",
                        "sunt",
                        "iure",
                        "nam",
                        "nobis",
                        "eum",
                        "cum",
                        "officiis",
                        "excepturi",
                        "odio",
                        "consectetur",
                        "quasi",
                        "aut",
                        "quisquam",
                        "vel",
                        "eligendi",
                        "itaque",
                        "non",
                        "odit",
                        "tempore",
                        "quaerat",
                        "dignissimos",
                        "facilis",
                        "neque",
                        "nihil",
                        "expedita",
                        "vitae",
                        "vero",
                        "ipsum",
                        "nisi",
                        "animi",
                        "cumque",
                        "pariatur",
                        "velit",
                        "modi",
                        "natus",
                        "iusto",
                        "eaque",
                        "sequi",
                        "illo",
                        "sed",
                        "ex",
                        "et",
                        "voluptatibus",
                        "tempora",
                        "veritatis",
                        "ratione",
                        "assumenda",
                        "incidunt",
                        "nostrum",
                        "placeat",
                        "aliquid",
                        "fuga",
                        "provident",
                        "praesentium",
                        "rem",
                        "necessitatibus",
                        "suscipit",
                        "adipisci",
                        "quidem",
                        "possimus",
                        "voluptas",
                        "debitis",
                        "sint",
                        "accusantium",
                        "unde",
                        "sapiente",
                        "voluptate",
                        "qui",
                        "aspernatur",
                        "laudantium",
                        "soluta",
                        "amet",
                        "quo",
                        "aliquam",
                        "saepe",
                        "culpa",
                        "libero",
                        "ipsa",
                        "dicta",
                        "reiciendis",
                        "nesciunt",
                        "doloribus",
                        "autem",
                        "impedit",
                        "minima",
                        "maiores",
                        "repudiandae",
                        "ipsam",
                        "obcaecati",
                        "ullam",
                        "enim",
                        "totam",
                        "delectus",
                        "ducimus",
                        "quis",
                        "voluptates",
                        "dolores",
                        "molestiae",
                        "harum",
                        "dolorem",
                        "quia",
                        "voluptatem",
                        "molestias",
                        "magni",
                        "distinctio",
                        "omnis",
                        "illum",
                        "dolorum",
                        "voluptatum",
                        "ea",
                        "quas",
                        "quam",
                        "corporis",
                        "quae",
                        "blanditiis",
                        "atque",
                        "deserunt",
                        "laboriosam",
                        "earum",
                        "consequuntur",
                        "hic",
                        "cupiditate",
                        "quibusdam",
                        "accusamus",
                        "ut",
                        "rerum",
                        "error",
                        "minus",
                        "eius",
                        "ab",
                        "ad",
                        "nemo",
                        "fugit",
                        "officia",
                        "at",
                        "in",
                        "id",
                        "quos",
                        "reprehenderit",
                        "numquam",
                        "iste",
                        "fugiat",
                        "sit",
                        "inventore",
                        "beatae",
                        "repellendus",
                        "magnam",
                        "recusandae",
                        "quod",
                        "explicabo",
                        "doloremque",
                        "aperiam",
                        "consequatur",
                        "asperiores",
                        "commodi",
                        "optio",
                        "dolor",
                        "labore",
                        "temporibus",
                        "repellat",
                        "veniam",
                        "architecto",
                        "est",
                        "esse",
                        "mollitia",
                        "nulla",
                        "a",
                        "similique",
                        "eos",
                        "alias",
                        "dolore",
                        "tenetur",
                        "deleniti",
                        "porro",
                        "facere",
                        "maxime",
                        "corrupti"
                      ]
                    },
                    sp: {
                      common: [
                        "mujer",
                        "uno",
                        "dolor",
                        "más",
                        "de",
                        "poder",
                        "mismo",
                        "si"
                      ],
                      words: [
                        "ejercicio",
                        "preferencia",
                        "perspicacia",
                        "laboral",
                        "paño",
                        "suntuoso",
                        "molde",
                        "namibia",
                        "planeador",
                        "mirar",
                        "demás",
                        "oficinista",
                        "excepción",
                        "odio",
                        "consecuencia",
                        "casi",
                        "auto",
                        "chicharra",
                        "velo",
                        "elixir",
                        "ataque",
                        "no",
                        "odio",
                        "temporal",
                        "cuórum",
                        "dignísimo",
                        "facilismo",
                        "letra",
                        "nihilista",
                        "expedición",
                        "alma",
                        "alveolar",
                        "aparte",
                        "león",
                        "animal",
                        "como",
                        "paria",
                        "belleza",
                        "modo",
                        "natividad",
                        "justo",
                        "ataque",
                        "séquito",
                        "pillo",
                        "sed",
                        "ex",
                        "y",
                        "voluminoso",
                        "temporalidad",
                        "verdades",
                        "racional",
                        "asunción",
                        "incidente",
                        "marejada",
                        "placenta",
                        "amanecer",
                        "fuga",
                        "previsor",
                        "presentación",
                        "lejos",
                        "necesariamente",
                        "sospechoso",
                        "adiposidad",
                        "quindío",
                        "pócima",
                        "voluble",
                        "débito",
                        "sintió",
                        "accesorio",
                        "falda",
                        "sapiencia",
                        "volutas",
                        "queso",
                        "permacultura",
                        "laudo",
                        "soluciones",
                        "entero",
                        "pan",
                        "litro",
                        "tonelada",
                        "culpa",
                        "libertario",
                        "mosca",
                        "dictado",
                        "reincidente",
                        "nascimiento",
                        "dolor",
                        "escolar",
                        "impedimento",
                        "mínima",
                        "mayores",
                        "repugnante",
                        "dulce",
                        "obcecado",
                        "montaña",
                        "enigma",
                        "total",
                        "deletéreo",
                        "décima",
                        "cábala",
                        "fotografía",
                        "dolores",
                        "molesto",
                        "olvido",
                        "paciencia",
                        "resiliencia",
                        "voluntad",
                        "molestias",
                        "magnífico",
                        "distinción",
                        "ovni",
                        "marejada",
                        "cerro",
                        "torre",
                        "y",
                        "abogada",
                        "manantial",
                        "corporal",
                        "agua",
                        "crepúsculo",
                        "ataque",
                        "desierto",
                        "laboriosamente",
                        "angustia",
                        "afortunado",
                        "alma",
                        "encefalograma",
                        "materialidad",
                        "cosas",
                        "o",
                        "renuncia",
                        "error",
                        "menos",
                        "conejo",
                        "abadía",
                        "analfabeto",
                        "remo",
                        "fugacidad",
                        "oficio",
                        "en",
                        "almácigo",
                        "vos",
                        "pan",
                        "represión",
                        "números",
                        "triste",
                        "refugiado",
                        "trote",
                        "inventor",
                        "corchea",
                        "repelente",
                        "magma",
                        "recusado",
                        "patrón",
                        "explícito",
                        "paloma",
                        "síndrome",
                        "inmune",
                        "autoinmune",
                        "comodidad",
                        "ley",
                        "vietnamita",
                        "demonio",
                        "tasmania",
                        "repeler",
                        "apéndice",
                        "arquitecto",
                        "columna",
                        "yugo",
                        "computador",
                        "mula",
                        "a",
                        "propósito",
                        "fantasía",
                        "alias",
                        "rayo",
                        "tenedor",
                        "deleznable",
                        "ventana",
                        "cara",
                        "anemia",
                        "corrupto"
                      ]
                    },
                    ru: {
                      common: [
                        "далеко-далеко",
                        "за",
                        "словесными",
                        "горами",
                        "в стране",
                        "гласных",
                        "и согласных",
                        "живут",
                        "рыбные",
                        "тексты"
                      ],
                      words: [
                        "вдали",
                        "от всех",
                        "они",
                        "буквенных",
                        "домах",
                        "на берегу",
                        "семантика",
                        "большого",
                        "языкового",
                        "океана",
                        "маленький",
                        "ручеек",
                        "даль",
                        "журчит",
                        "по всей",
                        "обеспечивает",
                        "ее",
                        "всеми",
                        "необходимыми",
                        "правилами",
                        "эта",
                        "парадигматическая",
                        "страна",
                        "которой",
                        "жаренные",
                        "предложения",
                        "залетают",
                        "прямо",
                        "рот",
                        "даже",
                        "всемогущая",
                        "пунктуация",
                        "не",
                        "имеет",
                        "власти",
                        "над",
                        "рыбными",
                        "текстами",
                        "ведущими",
                        "безорфографичный",
                        "образ",
                        "жизни",
                        "однажды",
                        "одна",
                        "маленькая",
                        "строчка",
                        "рыбного",
                        "текста",
                        "имени",
                        "lorem",
                        "ipsum",
                        "решила",
                        "выйти",
                        "большой",
                        "мир",
                        "грамматики",
                        "великий",
                        "оксмокс",
                        "предупреждал",
                        "о",
                        "злых",
                        "запятых",
                        "диких",
                        "знаках",
                        "вопроса",
                        "коварных",
                        "точках",
                        "запятой",
                        "но",
                        "текст",
                        "дал",
                        "сбить",
                        "себя",
                        "толку",
                        "он",
                        "собрал",
                        "семь",
                        "своих",
                        "заглавных",
                        "букв",
                        "подпоясал",
                        "инициал",
                        "за",
                        "пояс",
                        "пустился",
                        "дорогу",
                        "взобравшись",
                        "первую",
                        "вершину",
                        "курсивных",
                        "гор",
                        "бросил",
                        "последний",
                        "взгляд",
                        "назад",
                        "силуэт",
                        "своего",
                        "родного",
                        "города",
                        "буквоград",
                        "заголовок",
                        "деревни",
                        "алфавит",
                        "подзаголовок",
                        "своего",
                        "переулка",
                        "грустный",
                        "реторический",
                        "вопрос",
                        "скатился",
                        "его",
                        "щеке",
                        "продолжил",
                        "свой",
                        "путь",
                        "дороге",
                        "встретил",
                        "рукопись",
                        "она",
                        "предупредила",
                        "моей",
                        "все",
                        "переписывается",
                        "несколько",
                        "раз",
                        "единственное",
                        "что",
                        "меня",
                        "осталось",
                        "это",
                        "приставка",
                        "возвращайся",
                        "ты",
                        "лучше",
                        "свою",
                        "безопасную",
                        "страну",
                        "послушавшись",
                        "рукописи",
                        "наш",
                        "продолжил",
                        "свой",
                        "путь",
                        "вскоре",
                        "ему",
                        "повстречался",
                        "коварный",
                        "составитель",
                        "рекламных",
                        "текстов",
                        "напоивший",
                        "языком",
                        "речью",
                        "заманивший",
                        "свое",
                        "агентство",
                        "которое",
                        "использовало",
                        "снова",
                        "снова",
                        "своих",
                        "проектах",
                        "если",
                        "переписали",
                        "то",
                        "живет",
                        "там",
                        "до",
                        "сих",
                        "пор"
                      ]
                    }
                  };
                function s(t, e) {
                  return Math.round(Math.random() * (e - t) + t);
                }
                function o(t, e) {
                  for (
                    var n = t.length, r = Math.min(n, e), i = [];
                    i.length < r;

                  ) {
                    var o = s(0, n - 1);
                    ~i.indexOf(o) || i.push(o);
                  }
                  return i.map(function(e) {
                    return t[e];
                  });
                }
                function a(t, e) {
                  return (
                    t.length &&
                      (t[0] = t[0].charAt(0).toUpperCase() + t[0].substring(1)),
                    t.join(" ") +
                      (e ||
                        ("string" == typeof (n = "?!...")
                          ? n.charAt(s(0, n.length - 1))
                          : n[s(0, n.length - 1)]))
                  );
                  var n;
                }
                function c(t) {
                  var e = t.length;
                  if (!(e < 2)) {
                    var n = 0;
                    n =
                      e > 3 && e <= 6
                        ? s(0, 1)
                        : e > 6 && e <= 12
                        ? s(0, 2)
                        : s(1, 4);
                    for (var r, i, o = 0; o < n; o++)
                      (r = s(0, t.length - 2)),
                        "," !== (i = t[r]).charAt(i.length - 1) &&
                          (t[r] += ",");
                  }
                }
                return (
                  r.define(
                    "lorem.defaultLang",
                    "en",
                    'Default language of generated dummy text. Currently, <code>en</code>\t\tand <code>ru</code> are supported, but users can add their own syntaxes\t\tsee <a href="http://docs.emmet.io/abbreviations/lorem-ipsum/">docs</a>.'
                  ),
                  r.define(
                    "lorem.omitCommonPart",
                    !1,
                    "Omit commonly used part (e.g. “Lorem ipsum dolor sit amet“) from generated text."
                  ),
                  {
                    addLang: function(t, e) {
                      "string" == typeof e
                        ? (e = {
                            words: e.split(" ").filter(function(t) {
                              return !!t;
                            })
                          })
                        : Array.isArray(e) && (e = { words: e }),
                        (i[t] = e);
                    },
                    preprocessor: function(t) {
                      var e,
                        n = /^(?:lorem|lipsum)([a-z]{2})?(\d*)$/i,
                        u = !r.get("lorem.omitCommonPart");
                      t.findAll(function(t) {
                        if (t._name && (e = t._name.match(n))) {
                          var l = e[2] || 30,
                            f = e[1] || r.get("lorem.defaultLang") || "en";
                          (t._name = ""),
                            t.data(
                              "forceNameResolving",
                              t.isRepeating() || t.attributeList().length
                            ),
                            t.data("pasteOverwrites", !0),
                            t.data("paste", function(t) {
                              return (function(t, e, n) {
                                var r = i[t];
                                if (!r) return "";
                                var u,
                                  l = [],
                                  f = 0;
                                (e = parseInt(e, 10)),
                                  n &&
                                    r.common &&
                                    ((u = r.common.slice(0, e)).length > 5 &&
                                      (u[4] += ","),
                                    (f += u.length),
                                    l.push(a(u, ".")));
                                for (; f < e; )
                                  (u = o(r.words, Math.min(s(2, 30), e - f))),
                                    (f += u.length),
                                    c(u),
                                    l.push(a(u));
                                return l.join(" ");
                              })(f, l, !t && u);
                            });
                        }
                      });
                    }
                  }
                );
              });
            },
            { "../assets/preferences": "assets\\preferences.js" }
          ],
          "parser\\abbreviation.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../assets/tabStops"),
                  i = t("../assets/profile"),
                  s = t("../filter/main"),
                  o = t("../utils/common"),
                  a = t("../utils/abbreviation"),
                  c = t("../assets/stringStream"),
                  u = t("../generator/lorem"),
                  l = t("./processor/pastedContent"),
                  f = t("./processor/tagName"),
                  p = t("./processor/resourceMatcher"),
                  d = t("./processor/attributes"),
                  h = t("./processor/href"),
                  m = /^[\w\-\$\:@\!%]+\+?$/i,
                  g = /[\w\-:\$@]/,
                  b = "%default",
                  v = { "[": "]", "(": ")", "{": "}" },
                  x = Array.prototype.splice,
                  y = [],
                  w = [],
                  j = [];
                function k(t) {
                  (this.parent = null),
                    (this.children = []),
                    (this._attributes = []),
                    (this.abbreviation = ""),
                    (this.counter = 1),
                    (this._name = null),
                    (this._text = ""),
                    (this.repeatCount = 1),
                    (this.hasImplicitRepeat = !1),
                    (this._data = {}),
                    (this.start = ""),
                    (this.end = ""),
                    (this.content = ""),
                    (this.padding = "");
                }
                function S(t) {
                  return t.substring(1, t.length - 1);
                }
                function C(t) {
                  var e = t.charAt(0);
                  if ('"' == e || "'" == e) {
                    var n = (t = t.substr(1)).charAt(t.length - 1);
                    n === e && (t = t.substr(0, t.length - 1));
                  }
                  return t;
                }
                function _(t) {
                  var e = /^[\w\-:\$@]+\.?$/;
                  return (function(t) {
                    t = o.trim(t);
                    var e,
                      n = [],
                      r = c(t);
                    for (; (e = r.next()); )
                      if (" " == e) {
                        for (n.push(o.trim(r.current())); " " == r.peek(); )
                          r.next();
                        r.start = r.pos;
                      } else if (('"' == e || "'" == e) && !r.skipString(e))
                        throw new Error("Invalid attribute set");
                    return n.push(o.trim(r.current())), n;
                  })(t).map(function(t) {
                    if (e.test(t)) {
                      var n = "";
                      return (
                        "." == t.charAt(t.length - 1) &&
                          ((t = t.substr(0, t.length - 1)), (n = t)),
                        { name: t, value: n }
                      );
                    }
                    if (~t.indexOf("=")) {
                      var r = t.split("=");
                      return { name: r.shift(), value: C(r.join("=")) };
                    }
                    return { name: b, value: C(t) };
                  });
                }
                function A(t) {
                  var e = {};
                  return (t = t.map(function(t) {
                    return o.clone(t);
                  })).filter(function(t) {
                    if (!(t.name in e)) return (e[t.name] = t);
                    var n = e[t.name];
                    return (
                      "class" == t.name.toLowerCase()
                        ? (n.value += (n.value.length ? " " : "") + t.value)
                        : ((n.value = t.value), (n.isImplied = !!t.isImplied)),
                      !1
                    );
                  });
                }
                function $(t) {
                  for (var e, n, r, i = t.children.length - 1; i >= 0; i--)
                    if ((n = t.children[i]).isRepeating())
                      for (
                        r = e = n.repeatCount,
                          n.repeatCount = 1,
                          n.updateProperty("counter", 1),
                          n.updateProperty("maxCount", r);
                        --e > 0;

                      )
                        n.parent
                          .addChild(n.clone(), i + 1)
                          .updateProperty("counter", e + 1)
                          .updateProperty("maxCount", r);
                  return t.children.forEach($), t;
                }
                function T(t) {
                  for (var e = t.children.length - 1; e >= 0; e--) {
                    var n = t.children[e];
                    n.isGroup()
                      ? n.replace(T(n).children)
                      : n.isEmpty() && n.remove();
                  }
                  return t.children.forEach(T), t;
                }
                function E(t) {
                  var e = t.charCodeAt(0);
                  return (
                    (e > 64 && e < 91) ||
                    (e > 96 && e < 123) ||
                    (e > 47 && e < 58) ||
                    -1 != "#.*:$-_!@|%".indexOf(t)
                  );
                }
                return (
                  (k.prototype = {
                    addChild: function(t, e) {
                      return (
                        ((t = t || new k()).parent = this),
                        void 0 === e
                          ? this.children.push(t)
                          : this.children.splice(e, 0, t),
                        t
                      );
                    },
                    clone: function() {
                      var t = new k();
                      return (
                        [
                          "abbreviation",
                          "counter",
                          "_name",
                          "_text",
                          "repeatCount",
                          "hasImplicitRepeat",
                          "start",
                          "end",
                          "content",
                          "padding"
                        ].forEach(function(e) {
                          t[e] = this[e];
                        }, this),
                        (t._attributes = this._attributes.map(function(t) {
                          return o.extend({}, t);
                        })),
                        (t._data = o.extend({}, this._data)),
                        (t.children = this.children.map(function(e) {
                          return ((e = e.clone()).parent = t), e;
                        })),
                        t
                      );
                    },
                    remove: function() {
                      if (this.parent) {
                        var t = this.parent.children.indexOf(this);
                        ~t && this.parent.children.splice(t, 1);
                      }
                      return this;
                    },
                    replace: function() {
                      var t = this.parent,
                        e = t.children.indexOf(this),
                        n = o.flatten(arguments);
                      x.apply(t.children, [e, 1].concat(n)),
                        n.forEach(function(e) {
                          e.parent = t;
                        });
                    },
                    updateProperty: function(t, e) {
                      return (
                        (this[t] = e),
                        this.children.forEach(function(n) {
                          n.updateProperty(t, e);
                        }),
                        this
                      );
                    },
                    find: function(t) {
                      return this.findAll(t, { amount: 1 })[0];
                    },
                    findAll: function(t, e) {
                      if (
                        ((e = o.extend({ amount: 0, found: 0 }, e || {})),
                        "function" != typeof t)
                      ) {
                        var n = t.toLowerCase();
                        t = function(t) {
                          return t.name().toLowerCase() == n;
                        };
                      }
                      var r = [];
                      return (
                        this.children.forEach(function(n) {
                          (t(n) &&
                            (r.push(n),
                            e.found++,
                            e.amount && e.found >= e.amount)) ||
                            (r = r.concat(n.findAll(t)));
                        }),
                        r.filter(function(t) {
                          return !!t;
                        })
                      );
                    },
                    data: function(t, e) {
                      return (
                        2 == arguments.length && (this._data[t] = e),
                        this._data[t]
                      );
                    },
                    name: function() {
                      return this._name;
                    },
                    attributeList: function() {
                      return A(this._attributes.slice(0));
                    },
                    attribute: function(t, e) {
                      if (2 == arguments.length) {
                        if (null === e) {
                          var n = this._attributes.filter(function(e) {
                              return e.name === t;
                            }),
                            r = this;
                          return void n.forEach(function(t) {
                            var e = r._attributes.indexOf(t);
                            ~e && r._attributes.splice(e, 1);
                          });
                        }
                        var i = this._attributes.map(function(t) {
                            return t.name;
                          }),
                          s = i.indexOf(t.toLowerCase());
                        ~s
                          ? (this._attributes[s].value = e)
                          : this._attributes.push({ name: t, value: e });
                      }
                      return (
                        o.find(this.attributeList(), function(e) {
                          return e.name == t;
                        }) || {}
                      ).value;
                    },
                    index: function() {
                      return this.parent
                        ? this.parent.children.indexOf(this)
                        : -1;
                    },
                    _setRepeat: function(t) {
                      t
                        ? (this.repeatCount = parseInt(t, 10) || 1)
                        : (this.hasImplicitRepeat = !0);
                    },
                    setAbbreviation: function(t) {
                      var e = this;
                      (t = (t = t || "").replace(/\*(\d+)?$/, function(t, n) {
                        return e._setRepeat(n), "";
                      })),
                        (this.abbreviation = t);
                      var n = (function(t) {
                        if (!~t.indexOf("{")) return null;
                        var e = c.create(t);
                        for (; !e.eol(); )
                          switch (e.peek()) {
                            case "[":
                            case "(":
                              e.skipToPair(e.peek(), v[e.peek()]);
                              break;
                            case "{":
                              return (
                                (e.start = e.pos),
                                e.skipToPair("{", "}"),
                                {
                                  element: t.substring(0, e.start),
                                  text: S(e.current())
                                }
                              );
                            default:
                              e.next();
                          }
                      })(t);
                      n &&
                        ((t = n.element), (this.content = this._text = n.text));
                      var r = (function(t) {
                        var e = [],
                          n = { "#": "id", ".": "class" },
                          r = null,
                          i = c.create(t);
                        for (; !i.eol(); )
                          switch (i.peek()) {
                            case "#":
                            case ".":
                              null === r && (r = i.pos);
                              var s = n[i.peek()];
                              i.next(),
                                (i.start = i.pos),
                                i.eatWhile(g),
                                e.push({ name: s, value: i.current() });
                              break;
                            case "[":
                              if (
                                (null === r && (r = i.pos),
                                (i.start = i.pos),
                                !i.skipToPair("[", "]"))
                              )
                                throw new Error(
                                  "Invalid attribute set definition"
                                );
                              e = e.concat(_(S(i.current())));
                              break;
                            default:
                              i.next();
                          }
                        return e.length
                          ? { element: t.substring(0, r), attributes: A(e) }
                          : null;
                      })(t);
                      if (
                        (r &&
                          ((t = r.element), (this._attributes = r.attributes)),
                        (this._name = t),
                        this._name && !m.test(this._name))
                      )
                        throw new Error("Invalid abbreviation");
                    },
                    valueOf: function() {
                      var t = this.start,
                        e = this.end,
                        n = this.content,
                        r = this;
                      j.forEach(function(i) {
                        (t = i(t, r, "start")),
                          (n = i(n, r, "content")),
                          (e = i(e, r, "end"));
                      });
                      var i = this.children
                        .map(function(t) {
                          return t.valueOf();
                        })
                        .join("");
                      return (
                        (n = a.insertChildContent(n, i, { keepVariable: !1 })),
                        t + o.padString(n, this.padding) + e
                      );
                    },
                    toString: function() {
                      return this.valueOf();
                    },
                    hasEmptyChildren: function() {
                      return !!o.find(this.children, function(t) {
                        return t.isEmpty();
                      });
                    },
                    hasImplicitName: function() {
                      return !this._name && !this.isTextNode();
                    },
                    isGroup: function() {
                      return !this.abbreviation;
                    },
                    isEmpty: function() {
                      return !this.abbreviation && !this.children.length;
                    },
                    isRepeating: function() {
                      return this.repeatCount > 1 || this.hasImplicitRepeat;
                    },
                    isTextNode: function() {
                      return !this.name() && !this.attributeList().length;
                    },
                    isElement: function() {
                      return !this.isEmpty() && !this.isTextNode();
                    },
                    deepestChild: function() {
                      if (!this.children.length) return null;
                      for (var t = this; t.children.length; )
                        t = t.children[t.children.length - 1];
                      return t;
                    }
                  }),
                  j.push(function(t, e) {
                    return o.replaceCounter(t, e.counter, e.maxCount);
                  }),
                  j.push(r.abbrOutputProcessor.bind(r)),
                  [u, p, d, l, f, h].forEach(function(t) {
                    t.preprocessor && y.push(t.preprocessor.bind(t)),
                      t.postprocessor && w.push(t.postprocessor.bind(t));
                  }),
                  {
                    DEFAULT_ATTR_NAME: b,
                    parse: function(t, e) {
                      e = e || {};
                      var n = (function t(e) {
                          e = o.trim(e);
                          var n = new k();
                          var r = n.addChild();
                          var i = c.create(e);
                          var s,
                            a = 1e3;
                          var u = function(t) {
                            r.addChild(t);
                          };
                          var l = function() {
                            (i.start = i.pos),
                              i.eatWhile(function(t) {
                                if ("[" == t || "{" == t) {
                                  if (i.skipToPair(t, v[t]))
                                    return i.backUp(1), !0;
                                  throw new Error(
                                    'Invalid abbreviation: mo matching "' +
                                      v[t] +
                                      '" found for character at ' +
                                      i.pos
                                  );
                                }
                                if ("+" == t) {
                                  i.next();
                                  var e = i.eol() || ~"+>^*".indexOf(i.peek());
                                  return i.backUp(1), e;
                                }
                                return "(" != t && E(t);
                              });
                          };
                          for (; !i.eol() && --a > 0; )
                            switch (i.peek()) {
                              case "(":
                                if (
                                  ((i.start = i.pos), !i.skipToPair("(", ")"))
                                )
                                  throw new Error(
                                    'Invalid abbreviation: mo matching ")" found for character at ' +
                                      i.pos
                                  );
                                var f = t(S(i.current()));
                                (s = i.match(/^\*(\d+)?/, !0)) &&
                                  r._setRepeat(s[1]),
                                  f.children.forEach(u);
                                break;
                              case ">":
                                (r = r.addChild()), i.next();
                                break;
                              case "+":
                                (r = r.parent.addChild()), i.next();
                                break;
                              case "^":
                                var p = r.parent || r;
                                (r = (p.parent || p).addChild()), i.next();
                                break;
                              default:
                                l(),
                                  r.setAbbreviation(i.current()),
                                  (i.start = i.pos);
                            }
                          if (a < 1) throw new Error("Endless loop detected");
                          return n;
                        })(t),
                        r = this;
                      if (e.contextNode) {
                        n._name = e.contextNode.name;
                        var i = {};
                        n._attributes.forEach(function(t) {
                          i[t.name] = t;
                        }),
                          e.contextNode.attributes.forEach(function(t) {
                            t.name in i
                              ? (i[t.name].value = t.value)
                              : ((t = o.clone(t)),
                                n._attributes.push(t),
                                (i[t.name] = t));
                          });
                      }
                      return (
                        y.forEach(function(t) {
                          t(n, e, r);
                        }),
                        "counter" in e &&
                          n.updateProperty("counter", e.counter),
                        (n = T($(n))),
                        w.forEach(function(t) {
                          t(n, e, r);
                        }),
                        n
                      );
                    },
                    expand: function(t, e) {
                      if (!t) return "";
                      if ("string" == typeof e)
                        throw new Error(
                          "Deprecated use of `expand` method: `options` must be object"
                        );
                      (e = e || {}).syntax || (e.syntax = o.defaultSyntax());
                      var n = i.get(e.profile, e.syntax);
                      r.resetTabstopIndex();
                      var a = s.extract(t),
                        c = this.parse(a[0], e),
                        u = s.composeList(e.syntax, n, a[1]);
                      return s.apply(c, u, n), c.valueOf();
                    },
                    AbbreviationNode: k,
                    addPreprocessor: function(t) {
                      ~y.indexOf(t) || y.push(t);
                    },
                    removeFilter: function(t) {
                      var e = y.indexOf(t);
                      ~e && y.splice(e, 1);
                    },
                    addPostprocessor: function(t) {
                      ~w.indexOf(t) || w.push(t);
                    },
                    removePostprocessor: function(t) {
                      var e = w.indexOf(t);
                      ~e && w.splice(e, 1);
                    },
                    addOutputProcessor: function(t) {
                      ~j.indexOf(t) || j.push(t);
                    },
                    removeOutputProcessor: function(t) {
                      var e = j.indexOf(t);
                      ~e && j.splice(e, 1);
                    },
                    isAllowedChar: function(t) {
                      return E((t = String(t))) || ~">+^[](){}".indexOf(t);
                    }
                  }
                );
              });
            },
            {
              "../assets/profile": "assets\\profile.js",
              "../assets/stringStream": "assets\\stringStream.js",
              "../assets/tabStops": "assets\\tabStops.js",
              "../filter/main": "filter\\main.js",
              "../generator/lorem": "generator\\lorem.js",
              "../utils/abbreviation": "utils\\abbreviation.js",
              "../utils/common": "utils\\common.js",
              "./processor/attributes": "parser\\processor\\attributes.js",
              "./processor/href": "parser\\processor\\href.js",
              "./processor/pastedContent":
                "parser\\processor\\pastedContent.js",
              "./processor/resourceMatcher":
                "parser\\processor\\resourceMatcher.js",
              "./processor/tagName": "parser\\processor\\tagName.js"
            }
          ],
          "parser\\css.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = { tokens: null },
                  i = {
                    init: function(t) {
                      (this.source = t),
                        (this.ch = ""),
                        (this.chnum = -1),
                        this.nextChar();
                    },
                    nextChar: function() {
                      return (this.ch = this.source.charAt(++this.chnum));
                    },
                    peek: function() {
                      return this.source.charAt(this.chnum + 1);
                    }
                  };
                function s(t, e) {
                  return (
                    ((e = e || t.charCodeAt(0)) >= 97 && e <= 122) ||
                    (e >= 65 && e <= 90) ||
                    (e >= 1024 && e <= 1279) ||
                    "&" === t ||
                    "_" === t ||
                    "<" === t ||
                    ">" === t ||
                    "=" === t ||
                    "-" === t
                  );
                }
                function o(t, e) {
                  return (e = e || t.charCodeAt(0)) >= 48 && e <= 57;
                }
                var a = (function() {
                  for (
                    var t = "{}[]()+*=.,;:>~|\\%$#@^!".split(""),
                      e = "*^|$~".split(""),
                      n = {},
                      r = {},
                      i = 0;
                    i < t.length;
                    i += 1
                  )
                    n[t[i]] = !0;
                  for (i = 0; i < e.length; i += 1) r[e[i]] = !0;
                  return function(t, e) {
                    return e ? t in r : t in n;
                  };
                })();
                function c(t, e) {
                  r.tokens.push({
                    value: t,
                    type: e || t,
                    start: null,
                    end: null
                  });
                }
                function u(t) {
                  var e = (function(t) {
                      var e = (function(t) {
                        for (
                          var e = t.chnum,
                            n = t.source.replace(/\r\n?/g, "\n"),
                            r = t.source
                              .substring(0, e + 1)
                              .replace(/\r\n?/g, "\n")
                              .split("\n"),
                            i = (r[r.length - 1] || "").length,
                            s = n.split("\n")[r.length - 1] || "",
                            o = Math.max(0, i - 100),
                            a = s.substr(o, 200) + "\n",
                            c = 0;
                          c < i - o - 1;
                          c++
                        )
                          a += "-";
                        return (
                          (a += "^"),
                          { line: r.length, ch: i, text: s, hint: a }
                        );
                      })(i);
                      r.tokens;
                      r.tokens = null;
                      var n =
                        "CSS parsing error at line " +
                        e.line +
                        ", char " +
                        e.ch +
                        ": " +
                        t;
                      return {
                        name: "ParseError",
                        message: (n += "\n" + e.hint),
                        hint: e.hint,
                        line: e.line,
                        ch: e.ch
                      };
                    })(t),
                    n = new Error(e.message, "", e.line);
                  throw ((n.line = e.line),
                  (n.ch = e.ch),
                  (n.name = e.name),
                  (n.hint = e.hint),
                  n);
                }
                function l() {
                  var t,
                    e = i,
                    n = e.ch,
                    r = n,
                    s = n;
                  for (n = e.nextChar(); n !== r; )
                    "\n" === n
                      ? "\\" === (t = e.nextChar())
                        ? (s += n + t)
                        : u("Unterminated string")
                      : "" === n
                      ? u("Unterminated string")
                      : (s += "\\" === n ? n + e.nextChar() : n),
                      (n = e.nextChar());
                  return (s += n);
                }
                function f(t) {
                  for (
                    var e = i.ch,
                      n = t ? t + e : e,
                      r = (e = i.nextChar()).charCodeAt(0);
                    s(e, r) || o(e, r);

                  )
                    (n += e), (e = i.nextChar()), (r = e.charCodeAt(0));
                  c(n, "identifier");
                }
                function p() {
                  var t,
                    e = i.ch;
                  return " " === e || "\t" === e
                    ? (function() {
                        var t = i.ch,
                          e = "";
                        for (; " " === t || "\t" === t; )
                          (e += t), (t = i.nextChar());
                        c(e, "white");
                      })()
                    : "/" === e
                    ? (function() {
                        var t,
                          e = i,
                          n = e.ch,
                          r = n;
                        if ("/" === (t = e.nextChar()))
                          for (; n && "\n" !== t && "\r" !== t; )
                            (r += t), (n = t), (t = e.nextChar());
                        else {
                          if ("*" !== t) return c(r, r);
                          for (; n && ("*" !== n || "/" !== t); )
                            (r += t), (n = t), (t = e.nextChar());
                        }
                        (r += t), e.nextChar(), c(r, "comment");
                      })()
                    : '"' === e || "'" === e
                    ? ((t = l()), i.nextChar(), void c(t, "string"))
                    : "(" === e
                    ? (function() {
                        var t = i,
                          e = t.ch,
                          n = 1,
                          r = e,
                          s = !1;
                        e = t.nextChar();
                        for (; e && !s; )
                          "(" === e
                            ? n++
                            : ")" === e
                            ? --n || (s = !0)
                            : '"' === e || "'" === e
                            ? (e = l())
                            : "" === e && u("Unterminated brace"),
                            (r += e),
                            (e = t.nextChar());
                        c(r, "brace");
                      })()
                    : "-" === e || "." === e || o(e)
                    ? (function() {
                        var t,
                          e = i,
                          n = e.ch,
                          r = n,
                          s = "." === r;
                        if (((n = e.nextChar()), (t = !o(n)), s && t))
                          return c(r, ".");
                        if ("-" === r && t) return f("-");
                        for (; "" !== n && (o(n) || (!s && "." === n)); )
                          "." === n && (s = !0), (r += n), (n = e.nextChar());
                        c(r, "number");
                      })()
                    : s(e)
                    ? f()
                    : a(e)
                    ? (function() {
                        var t = i,
                          e = t.ch,
                          n = t.nextChar();
                        if ("=" === n && a(e, !0))
                          return c((e += n), "match"), void t.nextChar();
                        c(e, e);
                      })()
                    : "\r" === e
                    ? ("\n" === i.peek() && (e += i.nextChar()),
                      c(e, "line"),
                      void i.nextChar())
                    : "\n" === e
                    ? (c(e, "line"), void i.nextChar())
                    : void u("Unrecognized character '" + e + "'");
                }
                return {
                  lex: function(t) {
                    if ((i.init(t), (r.tokens = []), t))
                      for (; "" !== i.ch; ) p();
                    else r.tokens.push(this.white());
                    var e = r.tokens;
                    return (r.tokens = null), e;
                  },
                  parse: function(t) {
                    for (
                      var e, n = this.lex(t), r = 0, i = 0, s = n.length;
                      i < s;
                      i++
                    )
                      ((e = n[i]).start = r), (e.end = r += e.value.length);
                    return n;
                  },
                  white: function() {
                    return { value: "", type: "white", start: 0, end: 0 };
                  },
                  toSource: function(t) {
                    for (var e = 0, n = t.length, r = ""; e < n; e++)
                      r += t[e].value;
                    return r;
                  }
                };
              });
            },
            {}
          ],
          "parser\\processor\\attributes.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../../utils/common"),
                  i = function(t) {
                    return t.isDefault;
                  },
                  s = function(t) {
                    return t.isImplied;
                  },
                  o = function(t) {
                    return !t.value;
                  };
                return {
                  preprocessor: function(t, e, n) {
                    !(function t(e, n) {
                      e.children.forEach(function(e) {
                        var a = e.attributeList(),
                          c = e.attribute(n.DEFAULT_ATTR_NAME);
                        if (void 0 !== c) {
                          if (
                            (e.attribute(n.DEFAULT_ATTR_NAME, null), a.length)
                          ) {
                            var u =
                              r.find(a, i) || r.find(a, s) || r.find(a, o);
                            if (u) {
                              var l = e.attribute(u.name),
                                f = r.replaceUnescapedSymbol(l, "|", c);
                              l == f && (f = c), e.attribute(u.name, f);
                            }
                          }
                        } else
                          a.forEach(function(t) {
                            t.isImplied && e.attribute(t.name, null);
                          });
                        t(e, n);
                      });
                    })(t, n);
                  }
                };
              });
            },
            { "../../utils/common": "utils\\common.js" }
          ],
          "parser\\processor\\href.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../../assets/preferences"),
                  i = t("../../utils/common"),
                  s = t("./pastedContent");
                return (
                  r.define(
                    "href.autodetect",
                    !0,
                    "Enables or disables automatic URL recognition when wrapping\t\ttext with <code>&lt;a&gt;</code> tag. With this option enabled,\t\tif wrapped text matches URL or e-mail pattern it will be automatically\t\tinserted into <code>href</code> attribute."
                  ),
                  r.define(
                    "href.urlPattern",
                    "^(?:(?:https?|ftp|file)://|www\\.|ftp\\.)(?:\\([-A-Z0-9+&@#/%=~_|$?!:,.]*\\)|[-A-Z0-9+&@#/%=~_|$?!:,.])*(?:\\([-A-Z0-9+&@#/%=~_|$?!:,.]*\\)|[A-Z0-9+&@#/%=~_|$])",
                    "RegExp pattern to match wrapped URLs. Matched content will be inserts\t\tas-is into <code>href</code> attribute, only whitespace will be trimmed."
                  ),
                  r.define(
                    "href.emailPattern",
                    "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,5}$",
                    "RegExp pattern to match wrapped e-mails. Unlike <code>href.urlPattern</code>,\t\twrapped content will be prefixed with <code>mailto:</code> in <code>href</code>\t\tattribute"
                  ),
                  {
                    postprocessor: function(t, e) {
                      if (r.get("href.autodetect")) {
                        var n = new RegExp(r.get("href.urlPattern"), "i"),
                          o = new RegExp(r.get("href.emailPattern"), "i"),
                          a = /^([a-z]+:)?\/\//i;
                        t.findAll(function(t) {
                          if (
                            "a" == t.name().toLowerCase() &&
                            !t.attribute("href")
                          ) {
                            var r = i.trim(
                              s.pastedContent(t) || e.pastedContent
                            );
                            r &&
                              (n.test(r)
                                ? (a.test(r) || (r = "http://" + r),
                                  t.attribute("href", r))
                                : o.test(r) &&
                                  t.attribute("href", "mailto:" + r));
                          }
                        });
                      }
                    }
                  }
                );
              });
            },
            {
              "../../assets/preferences": "assets\\preferences.js",
              "../../utils/common": "utils\\common.js",
              "./pastedContent": "parser\\processor\\pastedContent.js"
            }
          ],
          "parser\\processor\\pastedContent.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../../utils/common"),
                  i = t("../../utils/abbreviation"),
                  s = t("../../assets/stringStream"),
                  o = t("../../assets/range"),
                  a = "$#";
                function c(t) {
                  for (var e = [], n = s.create(t); !n.eol(); ) {
                    if ("\\" == n.peek()) n.next();
                    else if (((n.start = n.pos), n.match(a, !0))) {
                      e.push(o.create(n.start, a));
                      continue;
                    }
                    n.next();
                  }
                  return e;
                }
                function u(t, e) {
                  var n = c(t);
                  return (
                    n.reverse().forEach(function(n) {
                      t = r.replaceSubstring(t, e, n);
                    }),
                    t
                  );
                }
                function l(t) {
                  return (
                    !!c(t.content).length ||
                    !!r.find(t.attributeList(), function(t) {
                      return !!c(t.value).length;
                    })
                  );
                }
                function f(t, e, n) {
                  var r = t.findAll(function(t) {
                    return l(t);
                  });
                  if ((l(t) && r.unshift(t), r.length))
                    r.forEach(function(t) {
                      (t.content = u(t.content, e)),
                        t._attributes.forEach(function(t) {
                          t.value = u(t.value, e);
                        });
                    });
                  else {
                    var s = t.deepestChild() || t;
                    s.content = n ? e : i.insertChildContent(s.content, e);
                  }
                }
                return {
                  pastedContent: function(t) {
                    var e = t.data("paste");
                    return Array.isArray(e)
                      ? e[t.counter - 1]
                      : "function" == typeof e
                      ? e(t.counter - 1, t.content)
                      : e || void 0;
                  },
                  preprocessor: function(t, e) {
                    if (e.pastedContent) {
                      var n = r.splitByLines(e.pastedContent, !0).map(r.trim);
                      t.findAll(function(t) {
                        if (t.hasImplicitRepeat)
                          return t.data("paste", n), (t.repeatCount = n.length);
                      });
                    }
                  },
                  postprocessor: function(t, e) {
                    var n = this,
                      r = t.findAll(function(t) {
                        var e = n.pastedContent(t);
                        return e && f(t, e, !!t.data("pasteOverwrites")), !!e;
                      });
                    !r.length && e.pastedContent && f(t, e.pastedContent);
                  }
                };
              });
            },
            {
              "../../assets/range": "assets\\range.js",
              "../../assets/stringStream": "assets\\stringStream.js",
              "../../utils/abbreviation": "utils\\abbreviation.js",
              "../../utils/common": "utils\\common.js"
            }
          ],
          "parser\\processor\\resourceMatcher.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../../assets/resources"),
                  i = t("../../assets/elements"),
                  s = t("../../utils/common"),
                  o = t("../../utils/abbreviation");
                return {
                  preprocessor: function(t, e, n) {
                    var a = e.syntax || s.defaultSyntax();
                    !(function t(e, n, s) {
                      e.children.slice(0).forEach(function(e) {
                        var a = r.getMatchedResource(e, n);
                        "string" == typeof a && (a = i.create("snippet", a)),
                          e.data("resource", a);
                        var c = i.type(a);
                        if ("snippet" == c) {
                          var u = a.data,
                            l = e._text || e.content;
                          l && (u = o.insertChildContent(u, l)),
                            (e.content = u);
                        } else if ("element" == c)
                          (e._name = a.name),
                            Array.isArray(a.attributes) &&
                              (e._attributes = [].concat(
                                a.attributes,
                                e._attributes
                              ));
                        else if ("reference" == c) {
                          var f = s.parse(a.data, { syntax: n });
                          if (e.repeatCount > 1) {
                            var p = f.findAll(function(t) {
                              return t.hasImplicitRepeat;
                            });
                            p.length || (p = f.children),
                              p.forEach(function(t) {
                                (t.repeatCount = e.repeatCount),
                                  (t.hasImplicitRepeat = !1);
                              });
                          }
                          var d = f.deepestChild();
                          d &&
                            (e.children.forEach(function(t) {
                              d.addChild(t);
                            }),
                            (d.content = e.content)),
                            f.children.forEach(function(t) {
                              e.attributeList().forEach(function(e) {
                                t.attribute(e.name, e.value);
                              });
                            }),
                            e.replace(f.children);
                        }
                        t(e, n, s);
                      });
                    })(t, a, n);
                  }
                };
              });
            },
            {
              "../../assets/elements": "assets\\elements.js",
              "../../assets/resources": "assets\\resources.js",
              "../../utils/abbreviation": "utils\\abbreviation.js",
              "../../utils/common": "utils\\common.js"
            }
          ],
          "parser\\processor\\tagName.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../../resolver/tagName");
                return {
                  postprocessor: function t(e) {
                    e.children.forEach(function(e) {
                      (e.hasImplicitName() || e.data("forceNameResolving")) &&
                        ((e._name = r.resolve(e.parent.name())),
                        e.data("nameResolved", !0)),
                        t(e);
                    });
                    return e;
                  }
                };
              });
            },
            { "../../resolver/tagName": "resolver\\tagName.js" }
          ],
          "parser\\xml.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../assets/stringStream"),
                  i = {
                    autoSelfClosers: {},
                    implicitlyClosed: {},
                    contextGrabbers: {},
                    doNotIndent: {},
                    allowUnquoted: !0,
                    allowMissing: !0
                  },
                  s = null,
                  o = null;
                function a(t, e) {
                  function n(n) {
                    return (e.tokenize = n), n(t, e);
                  }
                  var r = t.next();
                  if ("<" == r) {
                    if (t.eat("!"))
                      return t.eat("[")
                        ? t.match("CDATA[")
                          ? n(u("atom", "]]>"))
                          : null
                        : t.match("--")
                        ? n(u("comment", "--\x3e"))
                        : t.match("DOCTYPE", !0, !0)
                        ? (t.eatWhile(/[\w\._\-]/),
                          n(
                            (function t(e) {
                              return function(n, r) {
                                for (var i; null !== (i = n.next()); ) {
                                  if ("<" == i)
                                    return (
                                      (r.tokenize = t(e + 1)), r.tokenize(n, r)
                                    );
                                  if (">" == i) {
                                    if (1 == e) {
                                      r.tokenize = a;
                                      break;
                                    }
                                    return (
                                      (r.tokenize = t(e - 1)), r.tokenize(n, r)
                                    );
                                  }
                                }
                                return "meta";
                              };
                            })(1)
                          ))
                        : null;
                    if (t.eat("?"))
                      return (
                        t.eatWhile(/[\w\._\-]/),
                        (e.tokenize = u("meta", "?>")),
                        "meta"
                      );
                    var i;
                    for (
                      o = t.eat("/") ? "closeTag" : "openTag",
                        t.eatSpace(),
                        s = "";
                      (i = t.eat(/[^\s\u00a0=<>\"\'\/?]/));

                    )
                      s += i;
                    return (e.tokenize = c), "tag";
                  }
                  return "&" == r
                    ? (t.eat("#")
                      ? t.eat("x")
                        ? t.eatWhile(/[a-fA-F\d]/) && t.eat(";")
                        : t.eatWhile(/[\d]/) && t.eat(";")
                      : t.eatWhile(/[\w\.\-:]/) && t.eat(";"))
                      ? "atom"
                      : "error"
                    : (t.eatWhile(/[^&<]/), "text");
                }
                function c(t, e) {
                  var n,
                    r = t.next();
                  return ">" == r || ("/" == r && t.eat(">"))
                    ? ((e.tokenize = a),
                      (o = ">" == r ? "endTag" : "selfcloseTag"),
                      "tag")
                    : "=" == r
                    ? ((o = "equals"), null)
                    : /[\'\"]/.test(r)
                    ? ((e.tokenize = ((n = r),
                      function(t, e) {
                        for (; !t.eol(); )
                          if (t.next() == n) {
                            e.tokenize = c;
                            break;
                          }
                        return "string";
                      })),
                      e.tokenize(t, e))
                    : (t.eatWhile(/[^\s\u00a0=<>\"\'\/?]/), "word");
                }
                function u(t, e) {
                  return function(n, r) {
                    for (; !n.eol(); ) {
                      if (n.match(e)) {
                        r.tokenize = a;
                        break;
                      }
                      n.next();
                    }
                    return t;
                  };
                }
                var l,
                  f = null;
                function p() {
                  for (var t = arguments.length - 1; t >= 0; t--)
                    f.cc.push(arguments[t]);
                }
                function d() {
                  return p.apply(null, arguments), !0;
                }
                function h() {
                  f.context && (f.context = f.context.prev);
                }
                function m(t) {
                  if ("openTag" == t)
                    return (
                      (f.tagName = s),
                      d(
                        b,
                        ((r = f.startOfLine),
                        function(t) {
                          return "selfcloseTag" == t ||
                            ("endTag" == t &&
                              i.autoSelfClosers.hasOwnProperty(
                                f.tagName.toLowerCase()
                              ))
                            ? (g(f.tagName.toLowerCase()), d())
                            : "endTag" == t
                            ? (g(f.tagName.toLowerCase()),
                              (e = f.tagName),
                              (n = r),
                              (s =
                                i.doNotIndent.hasOwnProperty(e) ||
                                (f.context && f.context.noIndent)),
                              (f.context = {
                                prev: f.context,
                                tagName: e,
                                indent: f.indented,
                                startOfLine: n,
                                noIndent: s
                              }),
                              d())
                            : d();
                          var e, n, s;
                        })
                      )
                    );
                  if ("closeTag" == t) {
                    var e = !1;
                    return (
                      f.context
                        ? f.context.tagName != s &&
                          (i.implicitlyClosed.hasOwnProperty(
                            f.context.tagName.toLowerCase()
                          ) && h(),
                          (e = !f.context || f.context.tagName != s))
                        : (e = !0),
                      e && (l = "error"),
                      d(
                        ((n = e),
                        function(t) {
                          return (
                            n && (l = "error"),
                            "endTag" == t
                              ? (h(), d())
                              : ((l = "error"), d(arguments.callee))
                          );
                        })
                      )
                    );
                  }
                  var n, r;
                  return d();
                }
                function g(t) {
                  for (var e; ; ) {
                    if (!f.context) return;
                    if (
                      ((e = f.context.tagName.toLowerCase()),
                      !i.contextGrabbers.hasOwnProperty(e) ||
                        !i.contextGrabbers[e].hasOwnProperty(t))
                    )
                      return;
                    h();
                  }
                }
                function b(t) {
                  return "word" == t
                    ? ((l = "attribute"), d(v, b))
                    : "endTag" == t || "selfcloseTag" == t
                    ? p()
                    : ((l = "error"), d(b));
                }
                function v(t) {
                  return "equals" == t
                    ? d(x, b)
                    : (i.allowMissing || (l = "error"),
                      "endTag" == t || "selfcloseTag" == t ? p() : d());
                }
                function x(t) {
                  return "string" == t
                    ? d(y)
                    : "word" == t && i.allowUnquoted
                    ? ((l = "string"), d())
                    : ((l = "error"),
                      "endTag" == t || "selfCloseTag" == t ? p() : d());
                }
                function y(t) {
                  return "string" == t ? d(y) : p();
                }
                function w(t, e) {
                  if (
                    (t.sol() && ((e.startOfLine = !0), (e.indented = 0)),
                    t.eatSpace())
                  )
                    return null;
                  l = o = s = null;
                  var n = e.tokenize(t, e);
                  if (((e.type = o), (n || o) && "comment" != n))
                    for (f = e; ; ) {
                      var r = e.cc.pop() || m;
                      if (r(o || n)) break;
                    }
                  return (e.startOfLine = !1), l || n;
                }
                return {
                  parse: function(t, e) {
                    e = e || 0;
                    for (
                      var n = {
                          tokenize: a,
                          cc: [],
                          indented: 0,
                          startOfLine: !0,
                          tagName: null,
                          context: null
                        },
                        i = r.create(t),
                        s = [];
                      !i.eol();

                    )
                      s.push({
                        type: w(i, n),
                        start: i.start + e,
                        end: i.pos + e
                      }),
                        (i.start = i.pos);
                    return s;
                  }
                };
              });
            },
            { "../assets/stringStream": "assets\\stringStream.js" }
          ],
          "plugin\\file.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var i = t("../utils/common"),
                  s = {};
                function o(t) {
                  return /^https?:\/\//.test(t);
                }
                return (
                  (function(t) {
                    if (void 0 === r || !r.amd)
                      try {
                        (fs = t("fs")),
                          (path = t("path")),
                          (s.http = t("http")),
                          (s.https = t("https"));
                      } catch (t) {}
                  })(t),
                  (n.exports = function(t) {
                    t && i.extend(n.exports, t);
                  }),
                  i.extend(n.exports, {
                    _parseParams: function(t) {
                      var e = { path: t[0], size: 0 };
                      return (
                        (t = i.toArray(t, 1)),
                        (e.callback = t[t.length - 1]),
                        (t = t.slice(0, t.length - 1)).length &&
                          (e.size = t[0]),
                        e
                      );
                    },
                    _read: function(t, e) {
                      if (o(t.path))
                        var n = s[/^https:/.test(t.path) ? "https" : "http"]
                          .get(t.path, function(r) {
                            var i = [],
                              s = 0,
                              o = !1;
                            r.on("data", function(r) {
                              (s += r.length),
                                i.push(r),
                                t.size &&
                                  s >= t.size &&
                                  ((o = !0),
                                  e(null, Buffer.concat(i)),
                                  n.abort());
                            }).on("end", function() {
                              o || ((o = !0), e(null, Buffer.concat(i)));
                            });
                          })
                          .on("error", e);
                      else if (t.size) {
                        var r = fs.openSync(t.path, "r"),
                          i = new Buffer(t.size);
                        fs.read(r, i, 0, t.size, null, function(t, n) {
                          e(t, i);
                        });
                      } else e(null, fs.readFileSync(t.path));
                    },
                    read: function(t, e, n) {
                      var r = this._parseParams(arguments);
                      this._read(r, function(t, e) {
                        r.callback(
                          t,
                          t
                            ? ""
                            : (function(t) {
                                for (
                                  var e = [], n = 0, r = t.length;
                                  n < r;
                                  n++
                                )
                                  e.push(String.fromCharCode(t[n]));
                                return e.join("");
                              })(e)
                        );
                      });
                    },
                    readText: function(t, e, n) {
                      var r = this._parseParams(arguments);
                      this._read(r, function(t, e) {
                        r.callback(t, t ? "" : e.toString());
                      });
                    },
                    locateFile: function(t, e, n) {
                      if (o(e)) return n(e);
                      var r,
                        i = t;
                      for (
                        e = e.replace(/^\/+/, "");
                        i && i !== path.dirname(i);

                      )
                        if (
                          ((i = path.dirname(i)),
                          (r = path.join(i, e)),
                          fs.existsSync(r))
                        )
                          return n(r);
                      n(null);
                    },
                    createPath: function(t, e, n) {
                      fs.stat(t, function(r, i) {
                        if (r) return n(r);
                        i.isFile() && (t = path.dirname(t));
                        var s = path.resolve(t, e);
                        n(null, s);
                      });
                    },
                    save: function(t, e, n) {
                      fs.writeFile(t, e, "ascii", function(t) {
                        n(t || null);
                      });
                    },
                    getExt: function(t) {
                      var e = (t || "").match(/\.([\w\-]+)$/);
                      return e ? e[1].toLowerCase() : "";
                    }
                  })
                );
              });
            },
            { "../utils/common": "utils\\common.js" }
          ],
          "resolver\\css.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../assets/preferences"),
                  i = t("../assets/resources"),
                  s = t("../assets/stringStream"),
                  o = t("../assets/caniuse"),
                  a = t("../utils/common"),
                  c = t("../utils/template"),
                  u = t("../editTree/css"),
                  l = {
                    prefix: "emmet",
                    obsolete: !1,
                    transformName: function(t) {
                      return "-" + this.prefix + "-" + t;
                    },
                    properties: function() {
                      return (
                        (function(t) {
                          var e = r.getArray(t),
                            n = r.getArray(t + "Addon");
                          n &&
                            n.forEach(function(t) {
                              "-" == t.charAt(0)
                                ? (e = a.without(e, t.substr(1)))
                                : ("+" == t.charAt(0) && (t = t.substr(1)),
                                  e.push(t));
                            });
                          return e;
                        })("css." + this.prefix + "Properties") || []
                      );
                    },
                    supports: function(t) {
                      return ~this.properties().indexOf(t);
                    }
                  },
                  f = {};
                r.define(
                  "css.valueSeparator",
                  ": ",
                  "Defines a symbol that should be placed between CSS property and value when expanding CSS abbreviations."
                ),
                  r.define(
                    "css.propertyEnd",
                    ";",
                    "Defines a symbol that should be placed at the end of CSS property  when expanding CSS abbreviations."
                  ),
                  r.define(
                    "stylus.valueSeparator",
                    " ",
                    "Defines a symbol that should be placed between CSS property and value when expanding CSS abbreviations in Stylus dialect."
                  ),
                  r.define(
                    "stylus.propertyEnd",
                    "",
                    "Defines a symbol that should be placed at the end of CSS property  when expanding CSS abbreviations in Stylus dialect."
                  ),
                  r.define(
                    "sass.propertyEnd",
                    "",
                    "Defines a symbol that should be placed at the end of CSS property  when expanding CSS abbreviations in SASS dialect."
                  ),
                  r.define(
                    "css.syntaxes",
                    "css, less, sass, scss, stylus, styl",
                    "List of syntaxes that should be treated as CSS dialects."
                  ),
                  r.define(
                    "css.autoInsertVendorPrefixes",
                    !0,
                    "Automatically generate vendor-prefixed copies of expanded CSS property. By default, Emmet will generate vendor-prefixed properties only when you put dash before abbreviation (e.g. <code>-bxsh</code>). With this option enabled, you don’t need dashes before abbreviations: Emmet will produce vendor-prefixed properties for you."
                  ),
                  r.define(
                    "less.autoInsertVendorPrefixes",
                    !1,
                    "Same as <code>css.autoInsertVendorPrefixes</code> but for LESS syntax"
                  ),
                  r.define(
                    "scss.autoInsertVendorPrefixes",
                    !1,
                    "Same as <code>css.autoInsertVendorPrefixes</code> but for SCSS syntax"
                  ),
                  r.define(
                    "sass.autoInsertVendorPrefixes",
                    !1,
                    "Same as <code>css.autoInsertVendorPrefixes</code> but for SASS syntax"
                  ),
                  r.define(
                    "stylus.autoInsertVendorPrefixes",
                    !1,
                    "Same as <code>css.autoInsertVendorPrefixes</code> but for Stylus syntax"
                  );
                var p = c(
                    "A comma-separated list of CSS properties that may have <code><%= vendor %></code> vendor prefix. This list is used to generate a list of prefixed properties when expanding <code>-property</code> abbreviations. Empty list means that all possible CSS values may have <code><%= vendor %></code> prefix."
                  ),
                  d = c(
                    "A comma-separated list of <em>additional</em> CSS properties for <code>css.<%= vendor %>Preperties</code> preference. You should use this list if you want to add or remove a few CSS properties to original set. To add a new property, simply write its name, to remove it, precede property with hyphen.<br>For example, to add <em>foo</em> property and remove <em>border-radius</em> one, the preference value will look like this: <code>foo, -border-radius</code>."
                  ),
                  h = {
                    webkit:
                      "animation, animation-delay, animation-direction, animation-duration, animation-fill-mode, animation-iteration-count, animation-name, animation-play-state, animation-timing-function, appearance, backface-visibility, background-clip, background-composite, background-origin, background-size, border-fit, border-horizontal-spacing, border-image, border-vertical-spacing, box-align, box-direction, box-flex, box-flex-group, box-lines, box-ordinal-group, box-orient, box-pack, box-reflect, box-shadow, color-correction, column-break-after, column-break-before, column-break-inside, column-count, column-gap, column-rule-color, column-rule-style, column-rule-width, column-span, column-width, dashboard-region, font-smoothing, highlight, hyphenate-character, hyphenate-limit-after, hyphenate-limit-before, hyphens, line-box-contain, line-break, line-clamp, locale, margin-before-collapse, margin-after-collapse, marquee-direction, marquee-increment, marquee-repetition, marquee-style, mask-attachment, mask-box-image, mask-box-image-outset, mask-box-image-repeat, mask-box-image-slice, mask-box-image-source, mask-box-image-width, mask-clip, mask-composite, mask-image, mask-origin, mask-position, mask-repeat, mask-size, nbsp-mode, perspective, perspective-origin, rtl-ordering, text-combine, text-decorations-in-effect, text-emphasis-color, text-emphasis-position, text-emphasis-style, text-fill-color, text-orientation, text-security, text-stroke-color, text-stroke-width, transform, transition, transform-origin, transform-style, transition-delay, transition-duration, transition-property, transition-timing-function, user-drag, user-modify, user-select, writing-mode, svg-shadow, box-sizing, border-radius",
                    moz:
                      "animation-delay, animation-direction, animation-duration, animation-fill-mode, animation-iteration-count, animation-name, animation-play-state, animation-timing-function, appearance, backface-visibility, background-inline-policy, binding, border-bottom-colors, border-image, border-left-colors, border-right-colors, border-top-colors, box-align, box-direction, box-flex, box-ordinal-group, box-orient, box-pack, box-shadow, box-sizing, column-count, column-gap, column-rule-color, column-rule-style, column-rule-width, column-width, float-edge, font-feature-settings, font-language-override, force-broken-image-icon, hyphens, image-region, orient, outline-radius-bottomleft, outline-radius-bottomright, outline-radius-topleft, outline-radius-topright, perspective, perspective-origin, stack-sizing, tab-size, text-blink, text-decoration-color, text-decoration-line, text-decoration-style, text-size-adjust, transform, transform-origin, transform-style, transition, transition-delay, transition-duration, transition-property, transition-timing-function, user-focus, user-input, user-modify, user-select, window-shadow, background-clip, border-radius",
                    ms:
                      "accelerator, backface-visibility, background-position-x, background-position-y, behavior, block-progression, box-align, box-direction, box-flex, box-line-progression, box-lines, box-ordinal-group, box-orient, box-pack, content-zoom-boundary, content-zoom-boundary-max, content-zoom-boundary-min, content-zoom-chaining, content-zoom-snap, content-zoom-snap-points, content-zoom-snap-type, content-zooming, filter, flow-from, flow-into, font-feature-settings, grid-column, grid-column-align, grid-column-span, grid-columns, grid-layer, grid-row, grid-row-align, grid-row-span, grid-rows, high-contrast-adjust, hyphenate-limit-chars, hyphenate-limit-lines, hyphenate-limit-zone, hyphens, ime-mode, interpolation-mode, layout-flow, layout-grid, layout-grid-char, layout-grid-line, layout-grid-mode, layout-grid-type, line-break, overflow-style, perspective, perspective-origin, perspective-origin-x, perspective-origin-y, scroll-boundary, scroll-boundary-bottom, scroll-boundary-left, scroll-boundary-right, scroll-boundary-top, scroll-chaining, scroll-rails, scroll-snap-points-x, scroll-snap-points-y, scroll-snap-type, scroll-snap-x, scroll-snap-y, scrollbar-arrow-color, scrollbar-base-color, scrollbar-darkshadow-color, scrollbar-face-color, scrollbar-highlight-color, scrollbar-shadow-color, scrollbar-track-color, text-align-last, text-autospace, text-justify, text-kashida-space, text-overflow, text-size-adjust, text-underline-position, touch-action, transform, transform-origin, transform-origin-x, transform-origin-y, transform-origin-z, transform-style, transition, transition-delay, transition-duration, transition-property, transition-timing-function, user-select, word-break, wrap-flow, wrap-margin, wrap-through, writing-mode",
                    o:
                      "dashboard-region, animation, animation-delay, animation-direction, animation-duration, animation-fill-mode, animation-iteration-count, animation-name, animation-play-state, animation-timing-function, border-image, link, link-source, object-fit, object-position, tab-size, table-baseline, transform, transform-origin, transition, transition-delay, transition-duration, transition-property, transition-timing-function, accesskey, input-format, input-required, marquee-dir, marquee-loop, marquee-speed, marquee-style"
                  };
                function m(t) {
                  var e = t && t.charCodeAt(0);
                  return (t && "." == t) || (e > 47 && e < 58);
                }
                function g(t) {
                  return (
                    (t = a.trim(t)),
                    !/\/\*|\n|\r/.test(t) &&
                      (!!/^[a-z0-9\-]+\s*\:/i.test(t) &&
                        2 == t.replace(/\$\{.+?\}/g, "").split(":").length)
                  );
                }
                function b(t) {
                  "-" != t.charAt(0) ||
                    /^\-[\.\d]/.test(t) ||
                    (t = t.replace(/^\-+/, ""));
                  var e = t.charAt(0);
                  return "#" == e
                    ? (function(t) {
                        var e = t.replace(/^#+/, "") || "0";
                        if ("t" == e.toLowerCase()) return "transparent";
                        var n = "";
                        e = e.replace(/\.(\d+)$/, function(t) {
                          return (n = "0" + t), "";
                        });
                        var i = a.repeatString,
                          s = null;
                        switch (e.length) {
                          case 1:
                            s = i(e, 6);
                            break;
                          case 2:
                            s = i(e, 3);
                            break;
                          case 3:
                            s =
                              e.charAt(0) +
                              e.charAt(0) +
                              e.charAt(1) +
                              e.charAt(1) +
                              e.charAt(2) +
                              e.charAt(2);
                            break;
                          case 4:
                            s = e + e.substr(0, 2);
                            break;
                          case 5:
                            s = e + e.charAt(0);
                            break;
                          default:
                            s = e.substr(0, 6);
                        }
                        if (n)
                          return (
                            (o = s),
                            (c = n),
                            (u = parseInt(o.substr(0, 2), 16)),
                            (l = parseInt(o.substr(2, 2), 16)),
                            (f = parseInt(o.substr(4, 2), 16)),
                            "rgba(" + [u, l, f, c].join(", ") + ")"
                          );
                        var o, c, u, l, f;
                        if (r.get("css.color.short")) {
                          var p = s.split("");
                          p[0] == p[1] &&
                            p[2] == p[3] &&
                            p[4] == p[5] &&
                            (s = p[0] + p[2] + p[4]);
                        }
                        switch (r.get("css.color.case")) {
                          case "upper":
                            s = s.toUpperCase();
                            break;
                          case "lower":
                            s = s.toLowerCase();
                        }
                        return "#" + s;
                      })(t)
                    : "$" == e
                    ? a.escapeText(t)
                    : v(t);
                }
                function v(t) {
                  var e = r.getDict("css.keywordAliases");
                  return t in e ? e[t] : t;
                }
                function x(t) {
                  return ~r.getArray("css.keywords").indexOf(v(t));
                }
                function y(t, e) {
                  var n = f[e];
                  return (
                    n ||
                      (n = a.find(f, function(t) {
                        return t.prefix == e;
                      })),
                    n && n.supports(t)
                  );
                }
                function w(t) {
                  var e = o.resolvePrefixes(t);
                  return (
                    e ||
                      ((e = []),
                      Object.keys(f).forEach(function(n) {
                        y(t, n) && e.push(f[n].prefix);
                      }),
                      e.length || (e = null)),
                    e
                  );
                }
                function j(t, e) {
                  "string" == typeof e && (e = { prefix: e }),
                    (f[t] = a.extend({}, l, e));
                }
                function k(t, e) {
                  if (e) {
                    "styl" == e && (e = "stylus");
                    var n = r.get(e + "." + t);
                    if (void 0 !== n) return n;
                  }
                  return r.get("css." + t);
                }
                function S(t, e, n) {
                  return (
                    "string" != typeof t && (t = t.data),
                    g(t)
                      ? (e &&
                          (~t.indexOf(";")
                            ? (t = t.split(";").join(" !important;"))
                            : (t += " !important")),
                        (i = n),
                        (s = (r = t).indexOf(":")),
                        (r =
                          r.substring(0, s).replace(/\s+$/, "") +
                          k("valueSeparator", i) +
                          a.trim(r.substring(s + 1))).replace(
                          /\s*;\s*$/,
                          k("propertyEnd", i)
                        ))
                      : t
                  );
                  var r, i, s;
                }
                return (
                  Object.keys(h).forEach(function(t) {
                    r.define("css." + t + "Properties", h[t], p({ vendor: t })),
                      r.define(
                        "css." + t + "PropertiesAddon",
                        "",
                        d({ vendor: t })
                      );
                  }),
                  r.define(
                    "css.unitlessProperties",
                    "z-index, line-height, opacity, font-weight, zoom",
                    "The list of properties whose values ​​must not contain units."
                  ),
                  r.define(
                    "css.intUnit",
                    "px",
                    "Default unit for integer values"
                  ),
                  r.define(
                    "css.floatUnit",
                    "em",
                    "Default unit for float values"
                  ),
                  r.define(
                    "css.keywords",
                    "auto, inherit, all",
                    "A comma-separated list of valid keywords that can be used in CSS abbreviations."
                  ),
                  r.define(
                    "css.keywordAliases",
                    "a:auto, i:inherit, s:solid, da:dashed, do:dotted, t:transparent",
                    "A comma-separated list of keyword aliases, used in CSS abbreviation. Each alias should be defined as <code>alias:keyword_name</code>."
                  ),
                  r.define(
                    "css.unitAliases",
                    "e:em, p:%, x:ex, r:rem",
                    "A comma-separated list of unit aliases, used in CSS abbreviation. Each alias should be defined as <code>alias:unit_value</code>."
                  ),
                  r.define(
                    "css.color.short",
                    !0,
                    "Should color values like <code>#ffffff</code> be shortened to <code>#fff</code> after abbreviation with color was expanded."
                  ),
                  r.define(
                    "css.color.case",
                    "keep",
                    "Letter case of color values generated by abbreviations with color (like <code>c#0</code>). Possible values are <code>upper</code>, <code>lower</code> and <code>keep</code>."
                  ),
                  r.define(
                    "css.fuzzySearch",
                    !0,
                    "Enable fuzzy search among CSS snippet names. When enabled, every <em>unknown</em> snippet will be scored against available snippet names (not values or CSS properties!). The match with best score will be used to resolve snippet value. For example, with this preference enabled, the following abbreviations are equal: <code>ov:h</code> == <code>ov-h</code> == <code>o-h</code> == <code>oh</code>"
                  ),
                  r.define(
                    "css.fuzzySearchMinScore",
                    0.3,
                    "The minium score (from 0 to 1) that fuzzy-matched abbreviation should achive. Lower values may produce many false-positive matches, higher values may reduce possible matches."
                  ),
                  r.define(
                    "css.alignVendor",
                    !1,
                    "If set to <code>true</code>, all generated vendor-prefixed properties will be aligned by real property name."
                  ),
                  j("w", { prefix: "webkit" }),
                  j("m", { prefix: "moz" }),
                  j("s", { prefix: "ms" }),
                  j("o", { prefix: "o" }),
                  ((n = n || {}).exports = {
                    addPrefix: j,
                    supportsPrefix: y,
                    resolve: function(t, e) {
                      var n = r.getArray("css.syntaxes");
                      return n && ~n.indexOf(e) && t.isElement()
                        ? this.expandToSnippet(t.abbreviation, e)
                        : null;
                    },
                    prefixed: function(t, e) {
                      return y(t, e) ? "-" + e + "-" + t : t;
                    },
                    listPrefixes: function() {
                      return f.map(function(t) {
                        return t.prefix;
                      });
                    },
                    getPrefix: function(t) {
                      return f[t];
                    },
                    removePrefix: function(t) {
                      t in f && delete f[t];
                    },
                    extractPrefixes: function(t) {
                      if ("-" != t.charAt(0))
                        return { property: t, prefixes: null };
                      for (var e, n = 1, r = t.length, i = []; n < r; ) {
                        if ("-" == (e = t.charAt(n))) {
                          n++;
                          break;
                        }
                        if (!(e in f)) {
                          (i.length = 0), (n = 1);
                          break;
                        }
                        i.push(e), n++;
                      }
                      return (
                        n == r - 1 && ((n = 1), (i.length = 1)),
                        {
                          property: t.substring(n),
                          prefixes: i.length ? i : "all"
                        }
                      );
                    },
                    findValuesInAbbreviation: function(t, e) {
                      e = e || "css";
                      for (var n, r = 0, s = t.length, o = ""; r < s; ) {
                        if (
                          m((n = t.charAt(r))) ||
                          "#" == n ||
                          "$" == n ||
                          ("-" == n && m(t.charAt(r + 1)))
                        ) {
                          o = t.substring(r);
                          break;
                        }
                        r++;
                      }
                      for (
                        var a = t.substring(0, t.length - o.length), c = [];
                        ~a.indexOf("-") && !i.findSnippet(e, a);

                      ) {
                        var u = a.split("-"),
                          l = u.pop();
                        if (!x(l)) break;
                        c.unshift(l), (a = u.join("-"));
                      }
                      return c.join("-") + o;
                    },
                    parseValues: function(t) {
                      for (
                        var e = s.create(t), n = [], r = null;
                        (r = e.next());

                      )
                        "$" == r
                          ? (e.match(/^[^\$]+/, !0), n.push(e.current()))
                          : "#" == r
                          ? (e.match(/^t|[0-9a-f]+(\.\d+)?/i, !0),
                            n.push(e.current()))
                          : "-" == r
                          ? ((x(a.last(n)) ||
                              (e.start && m(t.charAt(e.start - 1)))) &&
                              (e.start = e.pos),
                            e.match(/^\-?[0-9]*(\.[0-9]+)?[a-z%\.]*/, !0),
                            n.push(e.current()))
                          : (e.match(/^[0-9]*(\.[0-9]*)?[a-z%]*/, !0),
                            n.push(e.current())),
                          (e.start = e.pos);
                      return n
                        .filter(function(t) {
                          return !!t;
                        })
                        .map(b);
                    },
                    extractValues: function(t) {
                      var e = this.findValuesInAbbreviation(t);
                      return e
                        ? {
                            property: t
                              .substring(0, t.length - e.length)
                              .replace(/-$/, ""),
                            values: this.parseValues(e)
                          }
                        : { property: t, values: null };
                    },
                    normalizeValue: function(t, e) {
                      e = (e || "").toLowerCase();
                      var n = r.getArray("css.unitlessProperties");
                      return t.replace(/^(\-?[0-9\.]+)([a-z]*)$/, function(
                        t,
                        i,
                        s
                      ) {
                        return s || ("0" != i && !~n.indexOf(e))
                          ? s
                            ? i +
                              ((o = s),
                              (a = r.getDict("css.unitAliases")),
                              o in a ? a[o] : o)
                            : i.replace(/\.$/, "") +
                              r.get(
                                ~i.indexOf(".")
                                  ? "css.floatUnit"
                                  : "css.intUnit"
                              )
                          : i;
                        var o, a;
                      });
                    },
                    expand: function(t, e, n) {
                      n = n || "css";
                      var s = r.get(n + ".autoInsertVendorPrefixes"),
                        o = /^(.+)\!$/.test(t);
                      o && (t = RegExp.$1);
                      var c = i.findSnippet(n, t);
                      if (c && !s) return S(c, o, n);
                      var l = this.extractPrefixes(t),
                        p = this.extractValues(l.property),
                        d = a.extend(l, p);
                      if (
                        (c
                          ? (d.values = null)
                          : (c = i.findSnippet(n, d.property)),
                        !c &&
                          r.get("css.fuzzySearch") &&
                          (c = i.fuzzyFindSnippet(
                            n,
                            d.property,
                            parseFloat(r.get("css.fuzzySearchMinScore"))
                          )),
                        c)
                      )
                        "string" != typeof c && (c = c.data);
                      else {
                        if (!d.property || d.property.endsWith(":"))
                          return null;
                        c = d.property + ":${1};";
                      }
                      if (!g(c)) return c;
                      var h = this.splitSnippet(c),
                        m = [];
                      !e &&
                        d.values &&
                        (e =
                          d.values
                            .map(function(t) {
                              return this.normalizeValue(t, h.name);
                            }, this)
                            .join(" ") + ";"),
                        (h.value = e || h.value);
                      var b,
                        v,
                        x,
                        y,
                        j,
                        k,
                        C,
                        _ =
                          "all" == d.prefixes || (!d.prefixes && s)
                            ? (function(t, e) {
                                var n = [],
                                  r = w(t);
                                if (r) {
                                  var i = {};
                                  Object.keys(f).forEach(function(t) {
                                    i[f[t].prefix] = t;
                                  }),
                                    (n = r.map(function(t) {
                                      return i[t];
                                    }));
                                }
                                n.length ||
                                  e ||
                                  Object.keys(f).forEach(function(t) {
                                    f[t].obsolete || n.push(t);
                                  });
                                return n;
                              })(h.name, s && "all" != d.prefixes)
                            : d.prefixes,
                        A = [];
                      if (
                        ((_ || []).forEach(function(t) {
                          t in f &&
                            ((b = f[t].transformName(h.name)),
                            A.push(b),
                            m.push(S(b + ":" + h.value, o, n)));
                        }),
                        m.push(S(h.name + ":" + h.value, o, n)),
                        A.push(h.name),
                        (m = ((v = h),
                        (x = o),
                        (y = n),
                        (j = []),
                        (k = {}),
                        (C = u.findParts(v.value)),
                        C.reverse(),
                        C.forEach(function(t) {
                          var e = t.substring(v.value);
                          (w(e) || []).forEach(function(n) {
                            k[n] || ((k[n] = v.value), j.push(n)),
                              (k[n] = a.replaceSubstring(
                                k[n],
                                "-" + n + "-" + e,
                                t
                              ));
                          });
                        }),
                        j.map(function(t) {
                          return S(v.name + ":" + k[t], x, y);
                        })).concat(m)),
                        r.get("css.alignVendor"))
                      ) {
                        var $ = a.getStringsPads(A);
                        m = m.map(function(t, e) {
                          return $[e] + t;
                        });
                      }
                      return m;
                    },
                    expandToSnippet: function(t, e) {
                      var n = this.expand(t, null, e);
                      return null === n
                        ? null
                        : Array.isArray(n)
                        ? n.join("\n")
                        : "string" != typeof n
                        ? n.data
                        : n + "";
                    },
                    splitSnippet: function(t) {
                      if (-1 == (t = a.trim(t)).indexOf(":"))
                        return { name: t, value: "${1};" };
                      var e = t.split(":");
                      return {
                        name: a.trim(e.shift()),
                        value: a
                          .trim(e.join(":"))
                          .replace(/^(\$\{0\}|\$0)(\s*;?)$/, "${1}$2")
                      };
                    },
                    getSyntaxPreference: k,
                    transformSnippet: S,
                    vendorPrefixes: w
                  }),
                  n.exports
                );
              });
            },
            {
              "../assets/caniuse": "assets\\caniuse.js",
              "../assets/preferences": "assets\\preferences.js",
              "../assets/resources": "assets\\resources.js",
              "../assets/stringStream": "assets\\stringStream.js",
              "../editTree/css": "editTree\\css.js",
              "../utils/common": "utils\\common.js",
              "../utils/template": "utils\\template.js"
            }
          ],
          "resolver\\cssGradient.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../assets/preferences"),
                  i = t("../assets/resources"),
                  s = t("../utils/common"),
                  o = (t("../assets/stringStream"), t("./css")),
                  a = t("../assets/range"),
                  c = t("../editTree/css"),
                  u = t("../utils/editor"),
                  l = t("./gradient/linear"),
                  f = ["css", "less", "sass", "scss", "stylus", "styl"];
                function p(t) {
                  var e = o.vendorPrefixes(t);
                  return (
                    e || (e = r.getArray("css.gradient.prefixes")), e || []
                  );
                }
                function d(t, e) {
                  var n = [],
                    i = e.name(),
                    s = r.get("css.gradient.omitDefaultDirection");
                  r.get("css.gradient.fallback") &&
                    ~i.toLowerCase().indexOf("background") &&
                    n.push({
                      name: "background-color",
                      value: "${1:" + t[0].gradient.colorStops[0].color + "}"
                    });
                  var a = e.value();
                  return (
                    p("linear-gradient").forEach(function(e) {
                      var c = o.prefixed(i, e);
                      if ("webkit" == e && r.get("css.gradient.oldWebkit"))
                        try {
                          n.push({
                            name: c,
                            value: h(t, a, {
                              prefix: e,
                              oldWebkit: !0,
                              omitDefaultDirection: s
                            })
                          });
                        } catch (t) {}
                      n.push({
                        name: c,
                        value: h(t, a, { prefix: e, omitDefaultDirection: s })
                      });
                    }),
                    n.sort(function(t, e) {
                      return e.name.length - t.name.length;
                    })
                  );
                }
                function h(t, e, n) {
                  return (
                    (n = n || {}),
                    (t = s.clone(t)).reverse().forEach(function(t, r) {
                      var i = !r && n.placeholder ? n.placeholder : "",
                        o = n.oldWebkit
                          ? t.gradient.stringifyOldWebkit(n)
                          : t.gradient.stringify(n);
                      e = s.replaceSubstring(e, o + i, t.matchedPart);
                    }),
                    e
                  );
                }
                function m(t) {
                  "string" != typeof t && (t = t.name());
                  var e = (o.vendorPrefixes(t) || []).map(function(e) {
                    return "-" + e + "-" + t;
                  });
                  return e.push(t), e;
                }
                return (
                  r.define(
                    "css.gradient.prefixes",
                    "webkit, moz, o",
                    "A comma-separated list of vendor-prefixes for which values should be generated."
                  ),
                  r.define(
                    "css.gradient.oldWebkit",
                    !1,
                    "Generate gradient definition for old Webkit implementations"
                  ),
                  r.define(
                    "css.gradient.omitDefaultDirection",
                    !0,
                    "Do not output default direction definition in generated gradients."
                  ),
                  r.define(
                    "css.gradient.defaultProperty",
                    "background-image",
                    "When gradient expanded outside CSS value context, it will produce properties with this name."
                  ),
                  r.define(
                    "css.gradient.fallback",
                    !1,
                    "With this option enabled, CSS gradient generator will produce <code>background-color</code> property with gradient first color as fallback for old browsers."
                  ),
                  ((n = n || {}).exports = {
                    findGradients: function(t) {
                      var e = t.value(),
                        n = [];
                      return (
                        t.valueParts().forEach(function(t) {
                          var r = t.substring(e);
                          if (l.isLinearGradient(r)) {
                            var i = l.parse(r);
                            i && n.push({ gradient: i, matchedPart: t });
                          }
                        }),
                        n.length ? n : null
                      );
                    },
                    gradientsFromCSSProperty: function(t, e) {
                      var n = c.propertyFromPosition(t, e);
                      if (n) {
                        var r = this.findGradients(n);
                        if (r) return { property: n, gradients: r };
                      }
                      return null;
                    },
                    expandAbbreviationHandler: function(t, e, n) {
                      var a = u.outputInfo(t, e, n);
                      if (!~f.indexOf(a.syntax)) return !1;
                      var c = t.getCaretPos(),
                        l = a.content,
                        p = this.gradientsFromCSSProperty(l, c);
                      if (p) {
                        if (
                          !(function(t, e, n) {
                            if (
                              "css" == (n = n || "css") ||
                              "less" == n ||
                              "scss" == n
                            )
                              return !0;
                            for (
                              var r = t.property.valueRange(!0).start,
                                i = t.gradients,
                                s = i.length - 1;
                              s >= 0;
                              s--
                            )
                              if (i[s].matchedPart.start + r >= e) return !1;
                            return !0;
                          })(p, c, a.syntax)
                        )
                          return !1;
                        var g = p.property,
                          b = g.parent,
                          v = b.options.offset || 0,
                          x = v + b.toString().length;
                        if (/[\n\r]/.test(g.value())) {
                          var y =
                            g.valueRange(!0).start +
                            s.last(p.gradients).matchedPart.end;
                          l = s.replaceSubstring(l, ";", y);
                          var w = this.gradientsFromCSSProperty(l, c);
                          w && ((g = (p = w).property), (b = g.parent));
                        }
                        g.end(";");
                        var j = (function(t, e) {
                          var n = i.findSnippet(e, t);
                          if (!n && r.get("css.fuzzySearch")) {
                            var s = parseFloat(
                              r.get("css.fuzzySearchMinScore")
                            );
                            n = i.fuzzyFindSnippet(e, t, s);
                          }
                          if (n)
                            return (
                              "string" != typeof n && (n = n.data),
                              o.splitSnippet(n).name
                            );
                        })(g.name(), e);
                        return (
                          j && g.name(j),
                          (function(t, e) {
                            var n = t.parent,
                              i = r.get("css.alignVendor"),
                              o = r.get("css.gradient.omitDefaultDirection"),
                              a = t.styleSeparator,
                              c = t.styleBefore;
                            if (
                              (n.getAll(m(t)).forEach(function(e) {
                                e != t &&
                                  /gradient/i.test(e.value()) &&
                                  (e.styleSeparator.length < a.length &&
                                    (a = e.styleSeparator),
                                  e.styleBefore.length < c.length &&
                                    (c = e.styleBefore),
                                  n.remove(e));
                              }),
                              i)
                            ) {
                              if (c != t.styleBefore) {
                                var u = t.fullRange();
                                n._updateSource(
                                  c,
                                  u.start,
                                  u.start + t.styleBefore.length
                                ),
                                  (t.styleBefore = c);
                              }
                              a != t.styleSeparator &&
                                (n._updateSource(
                                  a,
                                  t.nameRange().end,
                                  t.valueRange().start
                                ),
                                (t.styleSeparator = a));
                            }
                            var l = t.value(),
                              f = d(e, t);
                            if (i) {
                              var p = [],
                                g = [];
                              f.forEach(function(t) {
                                p.push(t.name), g.push(t.value);
                              }),
                                g.push(t.value()),
                                p.push(t.name());
                              var b = s.getStringsPads(
                                  g.map(function(t) {
                                    return t.substring(0, t.indexOf("("));
                                  })
                                ),
                                v = s.getStringsPads(p);
                              t.name(v[v.length - 1] + t.name()),
                                f.forEach(function(t, e) {
                                  (t.name = v[e] + t.name),
                                    (t.value = b[e] + t.value);
                                }),
                                t.value(b[b.length - 1] + t.value());
                            }
                            f.forEach(function(e) {
                              n.add(e.name, e.value, n.indexOf(t));
                            }),
                              t.value(
                                h(e, l, {
                                  placeholder: "${2}",
                                  omitDefaultDirection: o
                                })
                              );
                          })(g, p.gradients),
                          t.replaceContent(b.toString(), v, x, !0),
                          !0
                        );
                      }
                      return this.expandGradientOutsideValue(t, e);
                    },
                    expandGradientOutsideValue: function(t, e) {
                      var n = r.get("css.gradient.defaultProperty"),
                        i = r.get("css.gradient.omitDefaultDirection");
                      if (!n) return !1;
                      var c = String(t.getContent()),
                        u = a.create(t.getCurrentLineRange()),
                        l = u
                          .substring(c)
                          .replace(/^\s+/, function(t) {
                            return (u.start += t.length), "";
                          })
                          .replace(/\s+$/, function(t) {
                            return (u.end -= t.length), "";
                          }),
                        f = "a{" + n + ": " + l + ";}",
                        p = this.gradientsFromCSSProperty(f, f.length - 2);
                      if (p) {
                        var m = d(p.gradients, p.property);
                        m.push({
                          name: p.property.name(),
                          value: h(p.gradients, p.property.value(), {
                            placeholder: "${2}",
                            omitDefaultDirection: i
                          })
                        });
                        var g = o.getSyntaxPreference("valueSeparator", e),
                          b = o.getSyntaxPreference("propertyEnd", e);
                        if (r.get("css.alignVendor")) {
                          var v = s.getStringsPads(
                            m.map(function(t) {
                              return t.value.substring(0, t.value.indexOf("("));
                            })
                          );
                          m.forEach(function(t, e) {
                            t.value = v[e] + t.value;
                          });
                        }
                        return (
                          (m = m.map(function(t) {
                            return t.name + g + t.value + b;
                          })),
                          t.replaceContent(m.join("\n"), u.start, u.end),
                          !0
                        );
                      }
                      return !1;
                    },
                    reflectValueHandler: function(t) {
                      var e = r.get("css.gradient.omitDefaultDirection"),
                        n = this.findGradients(t);
                      if (!n) return !1;
                      var i = this,
                        s = t.value();
                      return (
                        t.parent.getAll(m(t)).forEach(function(r) {
                          if (r !== t) {
                            var o = i.findGradients(r);
                            if (o) {
                              var a = r.value(),
                                c = o[0].matchedPart.substring(a),
                                u = "";
                              /^\s*\-([a-z]+)\-/.test(c) && (u = RegExp.$1),
                                r.value(
                                  h(n, s, {
                                    prefix: u,
                                    omitDefaultDirection: e
                                  })
                                );
                            }
                          }
                        }),
                        !0
                      );
                    }
                  })
                );
              });
            },
            {
              "../assets/preferences": "assets\\preferences.js",
              "../assets/range": "assets\\range.js",
              "../assets/resources": "assets\\resources.js",
              "../assets/stringStream": "assets\\stringStream.js",
              "../editTree/css": "editTree\\css.js",
              "../utils/common": "utils\\common.js",
              "../utils/editor": "utils\\editor.js",
              "./css": "resolver\\css.js",
              "./gradient/linear": "resolver\\gradient\\linear.js"
            }
          ],
          "resolver\\gradient\\linear.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../../assets/stringStream"),
                  i = t("../../utils/common"),
                  s = {
                    bottom: 0,
                    "bottom left": 45,
                    left: 90,
                    "top left": 135,
                    top: 180,
                    "top right": 225,
                    right: 270,
                    "bottom right": 315,
                    "to top": 0,
                    "to top right": 45,
                    "to right": 90,
                    "to bottom right": 135,
                    "to bottom": 180,
                    "to bottom left": 225,
                    "to left": 270,
                    "to top left": 315
                  },
                  o = ["top", "to bottom", "0deg"],
                  a = /^\s*(\-[a-z]+\-)?(lg|linear\-gradient)\s*\(/i,
                  c = /(\d+)deg/i,
                  u = /top|bottom|left|right/i;
                function l(t) {
                  (this.colorStops = []), (this.direction = 180);
                  for (var e, n, s = r.create(i.trim(t)); (e = s.next()); )
                    "," == s.peek()
                      ? ((n = s.current()),
                        this.colorStops.length || (!c.test(n) && !u.test(n))
                          ? this.addColorStop(n)
                          : (this.direction = p(n)),
                        s.next(),
                        s.eatSpace(),
                        (s.start = s.pos))
                      : "(" == e && s.skipTo(")");
                  this.addColorStop(s.current());
                }
                function f(t) {
                  return i.trim(t).replace(/\s+/g, " ");
                }
                function p(t) {
                  if ("number" == typeof t) return t;
                  if (((t = f(t).toLowerCase()), c.test(t))) return +RegExp.$1;
                  var e = /^to\s/.test(t) ? "to " : "",
                    n = ~t.indexOf("left") && "left",
                    r = ~t.indexOf("right") && "right",
                    i = ~t.indexOf("top") && "top",
                    o = ~t.indexOf("bottom") && "bottom",
                    a = f(e + (i || o || "") + " " + (n || r || ""));
                  return s[a] || 0;
                }
                function d(t, e) {
                  for (
                    var n = /^to\s/,
                      r = Object.keys(s).filter(function(t) {
                        var r = n.test(t);
                        return e ? !r : r;
                      }),
                      i = 0;
                    i < r.length;
                    i++
                  )
                    if (s[r[i]] == t) return r[i];
                  return e && (t = (t + 270) % 360), t + "deg";
                }
                return (
                  (l.prototype = {
                    type: "linear-gradient",
                    addColorStop: function(t, e) {
                      (t = f(t || "")) &&
                        ((t = this.parseColorStop(t)),
                        void 0 === e
                          ? this.colorStops.push(t)
                          : this.colorStops.splice(e, 0, t));
                    },
                    parseColorStop: function(t) {
                      var e = null;
                      if (
                        ((t = (t = f(t)).replace(/^(\w+\(.+?\))\s*/, function(
                          t,
                          n
                        ) {
                          return (e = n), "";
                        })),
                        !e)
                      ) {
                        var n = t.split(" ");
                        (e = n[0]), (t = n[1] || "");
                      }
                      var r = { color: e };
                      return (
                        t &&
                          t.replace(/^(\-?[\d\.]+)([a-z%]+)?$/, function(
                            t,
                            e,
                            n
                          ) {
                            (r.position = e),
                              ~e.indexOf(".") ? (n = "") : n || (n = "%"),
                              n && (r.unit = n);
                          }),
                        r
                      );
                    },
                    stringify: function(t) {
                      var e = "linear-gradient";
                      (t = t || {}).prefix && (e = "-" + t.prefix + "-" + e);
                      var n = this.colorStops.map(function(t) {
                          var e = t.position
                            ? " " + t.position + (t.unit || "")
                            : "";
                          return t.color + e;
                        }),
                        r = d(this.direction, !!t.prefix);
                      return (
                        (t.omitDefaultDirection && ~o.indexOf(r)) ||
                          n.unshift(r),
                        e + "(" + n.join(", ") + ")"
                      );
                    },
                    stringifyOldWebkit: function() {
                      var t = this.colorStops.map(function(t) {
                        return i.clone(t);
                      });
                      return (
                        t.forEach(function(t) {
                          if ("position" in t) {
                            if (!~t.position.indexOf(".") && "%" != t.unit)
                              throw "Can't convert color stop '" +
                                (t.position + (t.unit || "")) +
                                "'";
                            t.position =
                              parseFloat(t.position) /
                              ("%" == t.unit ? 100 : 1);
                          }
                        }),
                        this._fillImpliedPositions(t),
                        (t = t.map(function(e, n) {
                          return e.position || n
                            ? 1 == e.position && n == t.length - 1
                              ? "to(" + e.color + ")"
                              : "color-stop(" +
                                e.position.toFixed(2).replace(/\.?0+$/, "") +
                                ", " +
                                e.color +
                                ")"
                            : "from(" + e.color + ")";
                        })),
                        "-webkit-gradient(linear, " +
                          (function(t) {
                            if (((t = d(t, !0)), c.test(t)))
                              throw "The direction is an angle that can’t be converted.";
                            var e = function(e) {
                              return ~t.indexOf(e) ? "100%" : "0";
                            };
                            return (
                              e("left") +
                              " " +
                              e("top") +
                              ", " +
                              e("right") +
                              " " +
                              e("bottom")
                            );
                          })((this.direction + 180) % 360) +
                          ", " +
                          t.join(", ") +
                          ")"
                      );
                    },
                    _fillImpliedPositions: function(t) {
                      var e = 0;
                      t.forEach(function(n, r) {
                        if (!r) return (n.position = n.position || 0);
                        if (
                          (r != t.length - 1 ||
                            "position" in n ||
                            (n.position = 1),
                          "position" in n)
                        ) {
                          var i = t[e].position || 0,
                            s = (n.position - i) / (r - e);
                          t.slice(e, r).forEach(function(t, e) {
                            t.position = i + s * e;
                          }),
                            (e = r);
                        }
                      });
                    },
                    valueOf: function() {
                      return this.stringify();
                    }
                  }),
                  {
                    parse: function(t) {
                      if (!this.isLinearGradient(t))
                        throw "Invalid linear gradient definition:\n" + t;
                      return new l(
                        (t = t.replace(/^\s*[\-a-z]+\s*\(|\)\s*$/gi, ""))
                      );
                    },
                    isLinearGradient: function(t) {
                      return a.test(t);
                    },
                    resolveDirection: p,
                    stringifyDirection: d
                  }
                );
              });
            },
            {
              "../../assets/stringStream": "assets\\stringStream.js",
              "../../utils/common": "utils\\common.js"
            }
          ],
          "resolver\\tagName.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../utils/common"),
                  i = {
                    empty: [],
                    blockLevel: "address,applet,blockquote,button,center,dd,del,dir,div,dl,dt,fieldset,form,frameset,hr,iframe,ins,isindex,li,link,map,menu,noframes,noscript,object,ol,p,pre,script,table,tbody,td,tfoot,th,thead,tr,ul,h1,h2,h3,h4,h5,h6".split(
                      ","
                    ),
                    inlineLevel: "a,abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,select,small,span,strike,strong,sub,sup,textarea,tt,u,var".split(
                      ","
                    )
                  },
                  s = {
                    p: "span",
                    ul: "li",
                    ol: "li",
                    table: "tr",
                    tr: "td",
                    tbody: "tr",
                    thead: "tr",
                    tfoot: "tr",
                    colgroup: "col",
                    select: "option",
                    optgroup: "option",
                    audio: "source",
                    video: "source",
                    object: "param",
                    map: "area"
                  };
                return {
                  resolve: function(t) {
                    return (t = (t || "").toLowerCase()) in s
                      ? this.getMapping(t)
                      : this.isInlineLevel(t)
                      ? "span"
                      : "div";
                  },
                  getMapping: function(t) {
                    return s[t.toLowerCase()];
                  },
                  isInlineLevel: function(t) {
                    return this.isTypeOf(t, "inlineLevel");
                  },
                  isBlockLevel: function(t) {
                    return this.isTypeOf(t, "blockLevel");
                  },
                  isEmptyElement: function(t) {
                    return this.isTypeOf(t, "empty");
                  },
                  isTypeOf: function(t, e) {
                    return ~i[e].indexOf(t);
                  },
                  addMapping: function(t, e) {
                    s[t] = e;
                  },
                  removeMapping: function(t) {
                    t in s && delete s[t];
                  },
                  addElementToCollection: function(t, e) {
                    i[e] || (i[e] = []);
                    var n = this.getCollection(e);
                    ~n.indexOf(t) || n.push(t);
                  },
                  removeElementFromCollection: function(t, e) {
                    e in i && (i[e] = r.without(this.getCollection(e), t));
                  },
                  getCollection: function(t) {
                    return i[t];
                  }
                };
              });
            },
            { "../utils/common": "utils\\common.js" }
          ],
          "snippets.json": [
            function(t, e, n) {
              e.exports = {
                variables: {
                  lang: "en",
                  locale: "en-US",
                  charset: "UTF-8",
                  indentation: "\t",
                  newline: "\n"
                },
                css: {
                  filters: "css",
                  profile: "css",
                  snippets: {
                    "@i": "@import url(|);",
                    "@import": "@import url(|);",
                    "@m": "@media ${1:screen} {\n\t|\n}",
                    "@media": "@media ${1:screen} {\n\t|\n}",
                    "@f": "@font-face {\n\tfont-family:|;\n\tsrc:url(|);\n}",
                    "@f+":
                      "@font-face {\n\tfont-family: '${1:FontName}';\n\tsrc: url('${2:FileName}.eot');\n\tsrc: url('${2:FileName}.eot?#iefix') format('embedded-opentype'),\n\t\t url('${2:FileName}.woff') format('woff'),\n\t\t url('${2:FileName}.ttf') format('truetype'),\n\t\t url('${2:FileName}.svg#${1:FontName}') format('svg');\n\tfont-style: ${3:normal};\n\tfont-weight: ${4:normal};\n}",
                    "@kf":
                      "@-webkit-keyframes ${1:identifier} {\n\t${2:from} { ${3} }${6}\n\t${4:to} { ${5} }\n}\n@-o-keyframes ${1:identifier} {\n\t${2:from} { ${3} }${6}\n\t${4:to} { ${5} }\n}\n@-moz-keyframes ${1:identifier} {\n\t${2:from} { ${3} }${6}\n\t${4:to} { ${5} }\n}\n@keyframes ${1:identifier} {\n\t${2:from} { ${3} }${6}\n\t${4:to} { ${5} }\n}",
                    anim: "animation:|;",
                    "anim-":
                      "animation:${1:name} ${2:duration} ${3:timing-function} ${4:delay} ${5:iteration-count} ${6:direction} ${7:fill-mode};",
                    animdel: "animation-delay:${1:time};",
                    animdir: "animation-direction:${1:normal};",
                    "animdir:n": "animation-direction:normal;",
                    "animdir:r": "animation-direction:reverse;",
                    "animdir:a": "animation-direction:alternate;",
                    "animdir:ar": "animation-direction:alternate-reverse;",
                    animdur: "animation-duration:${1:0}s;",
                    animfm: "animation-fill-mode:${1:both};",
                    "animfm:f": "animation-fill-mode:forwards;",
                    "animfm:b": "animation-fill-mode:backwards;",
                    "animfm:bt": "animation-fill-mode:both;",
                    "animfm:bh": "animation-fill-mode:both;",
                    animic: "animation-iteration-count:${1:1};",
                    "animic:i": "animation-iteration-count:infinite;",
                    animn: "animation-name:${1:none};",
                    animps: "animation-play-state:${1:running};",
                    "animps:p": "animation-play-state:paused;",
                    "animps:r": "animation-play-state:running;",
                    animtf: "animation-timing-function:${1:linear};",
                    "animtf:e": "animation-timing-function:ease;",
                    "animtf:ei": "animation-timing-function:ease-in;",
                    "animtf:eo": "animation-timing-function:ease-out;",
                    "animtf:eio": "animation-timing-function:ease-in-out;",
                    "animtf:l": "animation-timing-function:linear;",
                    "animtf:cb":
                      "animation-timing-function:cubic-bezier(${1:0.1}, ${2:0.7}, ${3:1.0}, ${3:0.1});",
                    ap: "appearance:${none};",
                    "!": "!important",
                    pos: "position:${1:relative};",
                    "pos:s": "position:static;",
                    "pos:a": "position:absolute;",
                    "pos:r": "position:relative;",
                    "pos:f": "position:fixed;",
                    t: "top:|;",
                    "t:a": "top:auto;",
                    r: "right:|;",
                    "r:a": "right:auto;",
                    b: "bottom:|;",
                    "b:a": "bottom:auto;",
                    l: "left:|;",
                    "l:a": "left:auto;",
                    z: "z-index:|;",
                    "z:a": "z-index:auto;",
                    fl: "float:${1:left};",
                    "fl:n": "float:none;",
                    "fl:l": "float:left;",
                    "fl:r": "float:right;",
                    cl: "clear:${1:both};",
                    "cl:n": "clear:none;",
                    "cl:l": "clear:left;",
                    "cl:r": "clear:right;",
                    "cl:b": "clear:both;",
                    colm: "columns:|;",
                    colmc: "column-count:|;",
                    colmf: "column-fill:|;",
                    colmg: "column-gap:|;",
                    colmr: "column-rule:|;",
                    colmrc: "column-rule-color:|;",
                    colmrs: "column-rule-style:|;",
                    colmrw: "column-rule-width:|;",
                    colms: "column-span:|;",
                    colmw: "column-width:|;",
                    d: "display:${1:block};",
                    "d:n": "display:none;",
                    "d:b": "display:block;",
                    "d:f": "display:flex;",
                    "d:if": "display:inline-flex;",
                    "d:i": "display:inline;",
                    "d:ib": "display:inline-block;",
                    "d:ib+":
                      "display: inline-block;\n*display: inline;\n*zoom: 1;",
                    "d:li": "display:list-item;",
                    "d:ri": "display:run-in;",
                    "d:cp": "display:compact;",
                    "d:tb": "display:table;",
                    "d:itb": "display:inline-table;",
                    "d:tbcp": "display:table-caption;",
                    "d:tbcl": "display:table-column;",
                    "d:tbclg": "display:table-column-group;",
                    "d:tbhg": "display:table-header-group;",
                    "d:tbfg": "display:table-footer-group;",
                    "d:tbr": "display:table-row;",
                    "d:tbrg": "display:table-row-group;",
                    "d:tbc": "display:table-cell;",
                    "d:rb": "display:ruby;",
                    "d:rbb": "display:ruby-base;",
                    "d:rbbg": "display:ruby-base-group;",
                    "d:rbt": "display:ruby-text;",
                    "d:rbtg": "display:ruby-text-group;",
                    v: "visibility:${1:hidden};",
                    "v:v": "visibility:visible;",
                    "v:h": "visibility:hidden;",
                    "v:c": "visibility:collapse;",
                    ov: "overflow:${1:hidden};",
                    "ov:v": "overflow:visible;",
                    "ov:h": "overflow:hidden;",
                    "ov:s": "overflow:scroll;",
                    "ov:a": "overflow:auto;",
                    ovx: "overflow-x:${1:hidden};",
                    "ovx:v": "overflow-x:visible;",
                    "ovx:h": "overflow-x:hidden;",
                    "ovx:s": "overflow-x:scroll;",
                    "ovx:a": "overflow-x:auto;",
                    ovy: "overflow-y:${1:hidden};",
                    "ovy:v": "overflow-y:visible;",
                    "ovy:h": "overflow-y:hidden;",
                    "ovy:s": "overflow-y:scroll;",
                    "ovy:a": "overflow-y:auto;",
                    ovs: "overflow-style:${1:scrollbar};",
                    "ovs:a": "overflow-style:auto;",
                    "ovs:s": "overflow-style:scrollbar;",
                    "ovs:p": "overflow-style:panner;",
                    "ovs:m": "overflow-style:move;",
                    "ovs:mq": "overflow-style:marquee;",
                    zoo: "zoom:1;",
                    zm: "zoom:1;",
                    cp: "clip:|;",
                    "cp:a": "clip:auto;",
                    "cp:r":
                      "clip:rect(${1:top} ${2:right} ${3:bottom} ${4:left});",
                    bxz: "box-sizing:${1:border-box};",
                    "bxz:cb": "box-sizing:content-box;",
                    "bxz:bb": "box-sizing:border-box;",
                    bxsh:
                      "box-shadow:${1:inset }${2:hoff} ${3:voff} ${4:blur} ${5:color};",
                    "bxsh:r":
                      "box-shadow:${1:inset }${2:hoff} ${3:voff} ${4:blur} ${5:spread }rgb(${6:0}, ${7:0}, ${8:0});",
                    "bxsh:ra":
                      "box-shadow:${1:inset }${2:h} ${3:v} ${4:blur} ${5:spread }rgba(${6:0}, ${7:0}, ${8:0}, .${9:5});",
                    "bxsh:n": "box-shadow:none;",
                    m: "margin:|;",
                    "m:a": "margin:auto;",
                    mt: "margin-top:|;",
                    "mt:a": "margin-top:auto;",
                    mr: "margin-right:|;",
                    "mr:a": "margin-right:auto;",
                    mb: "margin-bottom:|;",
                    "mb:a": "margin-bottom:auto;",
                    ml: "margin-left:|;",
                    "ml:a": "margin-left:auto;",
                    p: "padding:|;",
                    pt: "padding-top:|;",
                    pr: "padding-right:|;",
                    pb: "padding-bottom:|;",
                    pl: "padding-left:|;",
                    w: "width:|;",
                    "w:a": "width:auto;",
                    h: "height:|;",
                    "h:a": "height:auto;",
                    maw: "max-width:|;",
                    "maw:n": "max-width:none;",
                    mah: "max-height:|;",
                    "mah:n": "max-height:none;",
                    miw: "min-width:|;",
                    mih: "min-height:|;",
                    mar: "max-resolution:${1:res};",
                    mir: "min-resolution:${1:res};",
                    ori: "orientation:|;",
                    "ori:l": "orientation:landscape;",
                    "ori:p": "orientation:portrait;",
                    ol: "outline:|;",
                    "ol:n": "outline:none;",
                    olo: "outline-offset:|;",
                    olw: "outline-width:|;",
                    "olw:tn": "outline-width:thin;",
                    "olw:m": "outline-width:medium;",
                    "olw:tc": "outline-width:thick;",
                    ols: "outline-style:|;",
                    "ols:n": "outline-style:none;",
                    "ols:dt": "outline-style:dotted;",
                    "ols:ds": "outline-style:dashed;",
                    "ols:s": "outline-style:solid;",
                    "ols:db": "outline-style:double;",
                    "ols:g": "outline-style:groove;",
                    "ols:r": "outline-style:ridge;",
                    "ols:i": "outline-style:inset;",
                    "ols:o": "outline-style:outset;",
                    olc: "outline-color:#${1:000};",
                    "olc:i": "outline-color:invert;",
                    bfv: "backface-visibility:|;",
                    "bfv:h": "backface-visibility:hidden;",
                    "bfv:v": "backface-visibility:visible;",
                    bd: "border:|;",
                    "bd+": "border:${1:1px} ${2:solid} ${3:#000};",
                    "bd:n": "border:none;",
                    bdbk: "border-break:${1:close};",
                    "bdbk:c": "border-break:close;",
                    bdcl: "border-collapse:|;",
                    "bdcl:c": "border-collapse:collapse;",
                    "bdcl:s": "border-collapse:separate;",
                    bdc: "border-color:#${1:000};",
                    "bdc:t": "border-color:transparent;",
                    bdi: "border-image:url(|);",
                    "bdi:n": "border-image:none;",
                    bdti: "border-top-image:url(|);",
                    "bdti:n": "border-top-image:none;",
                    bdri: "border-right-image:url(|);",
                    "bdri:n": "border-right-image:none;",
                    bdbi: "border-bottom-image:url(|);",
                    "bdbi:n": "border-bottom-image:none;",
                    bdli: "border-left-image:url(|);",
                    "bdli:n": "border-left-image:none;",
                    bdci: "border-corner-image:url(|);",
                    "bdci:n": "border-corner-image:none;",
                    "bdci:c": "border-corner-image:continue;",
                    bdtli: "border-top-left-image:url(|);",
                    "bdtli:n": "border-top-left-image:none;",
                    "bdtli:c": "border-top-left-image:continue;",
                    bdtri: "border-top-right-image:url(|);",
                    "bdtri:n": "border-top-right-image:none;",
                    "bdtri:c": "border-top-right-image:continue;",
                    bdbri: "border-bottom-right-image:url(|);",
                    "bdbri:n": "border-bottom-right-image:none;",
                    "bdbri:c": "border-bottom-right-image:continue;",
                    bdbli: "border-bottom-left-image:url(|);",
                    "bdbli:n": "border-bottom-left-image:none;",
                    "bdbli:c": "border-bottom-left-image:continue;",
                    bdf: "border-fit:${1:repeat};",
                    "bdf:c": "border-fit:clip;",
                    "bdf:r": "border-fit:repeat;",
                    "bdf:sc": "border-fit:scale;",
                    "bdf:st": "border-fit:stretch;",
                    "bdf:ow": "border-fit:overwrite;",
                    "bdf:of": "border-fit:overflow;",
                    "bdf:sp": "border-fit:space;",
                    bdlen: "border-length:|;",
                    "bdlen:a": "border-length:auto;",
                    bdsp: "border-spacing:|;",
                    bds: "border-style:|;",
                    "bds:n": "border-style:none;",
                    "bds:h": "border-style:hidden;",
                    "bds:dt": "border-style:dotted;",
                    "bds:ds": "border-style:dashed;",
                    "bds:s": "border-style:solid;",
                    "bds:db": "border-style:double;",
                    "bds:dtds": "border-style:dot-dash;",
                    "bds:dtdtds": "border-style:dot-dot-dash;",
                    "bds:w": "border-style:wave;",
                    "bds:g": "border-style:groove;",
                    "bds:r": "border-style:ridge;",
                    "bds:i": "border-style:inset;",
                    "bds:o": "border-style:outset;",
                    bdw: "border-width:|;",
                    bdtw: "border-top-width:|;",
                    bdrw: "border-right-width:|;",
                    bdbw: "border-bottom-width:|;",
                    bdlw: "border-left-width:|;",
                    bdt: "border-top:|;",
                    bt: "border-top:|;",
                    "bdt+": "border-top:${1:1px} ${2:solid} ${3:#000};",
                    "bdt:n": "border-top:none;",
                    bdts: "border-top-style:|;",
                    "bdts:n": "border-top-style:none;",
                    bdtc: "border-top-color:#${1:000};",
                    "bdtc:t": "border-top-color:transparent;",
                    bdr: "border-right:|;",
                    br: "border-right:|;",
                    "bdr+": "border-right:${1:1px} ${2:solid} ${3:#000};",
                    "bdr:n": "border-right:none;",
                    bdrst: "border-right-style:|;",
                    "bdrst:n": "border-right-style:none;",
                    bdrc: "border-right-color:#${1:000};",
                    "bdrc:t": "border-right-color:transparent;",
                    bdb: "border-bottom:|;",
                    bb: "border-bottom:|;",
                    "bdb+": "border-bottom:${1:1px} ${2:solid} ${3:#000};",
                    "bdb:n": "border-bottom:none;",
                    bdbs: "border-bottom-style:|;",
                    "bdbs:n": "border-bottom-style:none;",
                    bdbc: "border-bottom-color:#${1:000};",
                    "bdbc:t": "border-bottom-color:transparent;",
                    bdl: "border-left:|;",
                    bl: "border-left:|;",
                    "bdl+": "border-left:${1:1px} ${2:solid} ${3:#000};",
                    "bdl:n": "border-left:none;",
                    bdls: "border-left-style:|;",
                    "bdls:n": "border-left-style:none;",
                    bdlc: "border-left-color:#${1:000};",
                    "bdlc:t": "border-left-color:transparent;",
                    bdrs: "border-radius:|;",
                    bdtrrs: "border-top-right-radius:|;",
                    bdtlrs: "border-top-left-radius:|;",
                    bdbrrs: "border-bottom-right-radius:|;",
                    bdblrs: "border-bottom-left-radius:|;",
                    bg: "background:#${1:000};",
                    "bg+":
                      "background:${1:#fff} url(${2}) ${3:0} ${4:0} ${5:no-repeat};",
                    "bg:n": "background:none;",
                    "bg:ie":
                      "filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='${1:x}.png',sizingMethod='${2:crop}');",
                    bgc: "background-color:#${1:fff};",
                    "bgc:t": "background-color:transparent;",
                    bgi: "background-image:url(|);",
                    "bgi:n": "background-image:none;",
                    bgr: "background-repeat:|;",
                    "bgr:n": "background-repeat:no-repeat;",
                    "bgr:x": "background-repeat:repeat-x;",
                    "bgr:y": "background-repeat:repeat-y;",
                    "bgr:sp": "background-repeat:space;",
                    "bgr:rd": "background-repeat:round;",
                    bga: "background-attachment:|;",
                    "bga:f": "background-attachment:fixed;",
                    "bga:s": "background-attachment:scroll;",
                    bgp: "background-position:${1:0} ${2:0};",
                    bgpx: "background-position-x:|;",
                    bgpy: "background-position-y:|;",
                    bgbk: "background-break:|;",
                    "bgbk:bb": "background-break:bounding-box;",
                    "bgbk:eb": "background-break:each-box;",
                    "bgbk:c": "background-break:continuous;",
                    bgcp: "background-clip:${1:padding-box};",
                    "bgcp:bb": "background-clip:border-box;",
                    "bgcp:pb": "background-clip:padding-box;",
                    "bgcp:cb": "background-clip:content-box;",
                    "bgcp:nc": "background-clip:no-clip;",
                    bgo: "background-origin:|;",
                    "bgo:pb": "background-origin:padding-box;",
                    "bgo:bb": "background-origin:border-box;",
                    "bgo:cb": "background-origin:content-box;",
                    bgsz: "background-size:|;",
                    "bgsz:a": "background-size:auto;",
                    "bgsz:ct": "background-size:contain;",
                    "bgsz:cv": "background-size:cover;",
                    c: "color:#${1:000};",
                    "c:r": "color:rgb(${1:0}, ${2:0}, ${3:0});",
                    "c:ra": "color:rgba(${1:0}, ${2:0}, ${3:0}, .${4:5});",
                    cm: "/* |${child} */",
                    cnt: "content:'|';",
                    "cnt:n": "content:normal;",
                    "cnt:oq": "content:open-quote;",
                    "cnt:noq": "content:no-open-quote;",
                    "cnt:cq": "content:close-quote;",
                    "cnt:ncq": "content:no-close-quote;",
                    "cnt:a": "content:attr(|);",
                    "cnt:c": "content:counter(|);",
                    "cnt:cs": "content:counters(|);",
                    tbl: "table-layout:|;",
                    "tbl:a": "table-layout:auto;",
                    "tbl:f": "table-layout:fixed;",
                    cps: "caption-side:|;",
                    "cps:t": "caption-side:top;",
                    "cps:b": "caption-side:bottom;",
                    ec: "empty-cells:|;",
                    "ec:s": "empty-cells:show;",
                    "ec:h": "empty-cells:hide;",
                    lis: "list-style:|;",
                    "lis:n": "list-style:none;",
                    lisp: "list-style-position:|;",
                    "lisp:i": "list-style-position:inside;",
                    "lisp:o": "list-style-position:outside;",
                    list: "list-style-type:|;",
                    "list:n": "list-style-type:none;",
                    "list:d": "list-style-type:disc;",
                    "list:c": "list-style-type:circle;",
                    "list:s": "list-style-type:square;",
                    "list:dc": "list-style-type:decimal;",
                    "list:dclz": "list-style-type:decimal-leading-zero;",
                    "list:lr": "list-style-type:lower-roman;",
                    "list:ur": "list-style-type:upper-roman;",
                    lisi: "list-style-image:|;",
                    "lisi:n": "list-style-image:none;",
                    q: "quotes:|;",
                    "q:n": "quotes:none;",
                    "q:ru": "quotes:'\\00AB' '\\00BB' '\\201E' '\\201C';",
                    "q:en": "quotes:'\\201C' '\\201D' '\\2018' '\\2019';",
                    ct: "content:|;",
                    "ct:n": "content:normal;",
                    "ct:oq": "content:open-quote;",
                    "ct:noq": "content:no-open-quote;",
                    "ct:cq": "content:close-quote;",
                    "ct:ncq": "content:no-close-quote;",
                    "ct:a": "content:attr(|);",
                    "ct:c": "content:counter(|);",
                    "ct:cs": "content:counters(|);",
                    coi: "counter-increment:|;",
                    cor: "counter-reset:|;",
                    va: "vertical-align:${1:top};",
                    "va:sup": "vertical-align:super;",
                    "va:t": "vertical-align:top;",
                    "va:tt": "vertical-align:text-top;",
                    "va:m": "vertical-align:middle;",
                    "va:bl": "vertical-align:baseline;",
                    "va:b": "vertical-align:bottom;",
                    "va:tb": "vertical-align:text-bottom;",
                    "va:sub": "vertical-align:sub;",
                    ta: "text-align:${1:left};",
                    "ta:l": "text-align:left;",
                    "ta:c": "text-align:center;",
                    "ta:r": "text-align:right;",
                    "ta:j": "text-align:justify;",
                    "ta-lst": "text-align-last:|;",
                    "tal:a": "text-align-last:auto;",
                    "tal:l": "text-align-last:left;",
                    "tal:c": "text-align-last:center;",
                    "tal:r": "text-align-last:right;",
                    td: "text-decoration:${1:none};",
                    "td:n": "text-decoration:none;",
                    "td:u": "text-decoration:underline;",
                    "td:o": "text-decoration:overline;",
                    "td:l": "text-decoration:line-through;",
                    te: "text-emphasis:|;",
                    "te:n": "text-emphasis:none;",
                    "te:ac": "text-emphasis:accent;",
                    "te:dt": "text-emphasis:dot;",
                    "te:c": "text-emphasis:circle;",
                    "te:ds": "text-emphasis:disc;",
                    "te:b": "text-emphasis:before;",
                    "te:a": "text-emphasis:after;",
                    th: "text-height:|;",
                    "th:a": "text-height:auto;",
                    "th:f": "text-height:font-size;",
                    "th:t": "text-height:text-size;",
                    "th:m": "text-height:max-size;",
                    ti: "text-indent:|;",
                    "ti:-": "text-indent:-9999px;",
                    tj: "text-justify:|;",
                    "tj:a": "text-justify:auto;",
                    "tj:iw": "text-justify:inter-word;",
                    "tj:ii": "text-justify:inter-ideograph;",
                    "tj:ic": "text-justify:inter-cluster;",
                    "tj:d": "text-justify:distribute;",
                    "tj:k": "text-justify:kashida;",
                    "tj:t": "text-justify:tibetan;",
                    tov: "text-overflow:${ellipsis};",
                    "tov:e": "text-overflow:ellipsis;",
                    "tov:c": "text-overflow:clip;",
                    to: "text-outline:|;",
                    "to+": "text-outline:${1:0} ${2:0} ${3:#000};",
                    "to:n": "text-outline:none;",
                    tr: "text-replace:|;",
                    "tr:n": "text-replace:none;",
                    tt: "text-transform:${1:uppercase};",
                    "tt:n": "text-transform:none;",
                    "tt:c": "text-transform:capitalize;",
                    "tt:u": "text-transform:uppercase;",
                    "tt:l": "text-transform:lowercase;",
                    tw: "text-wrap:|;",
                    "tw:n": "text-wrap:normal;",
                    "tw:no": "text-wrap:none;",
                    "tw:u": "text-wrap:unrestricted;",
                    "tw:s": "text-wrap:suppress;",
                    tsh: "text-shadow:${1:hoff} ${2:voff} ${3:blur} ${4:#000};",
                    "tsh:r":
                      "text-shadow:${1:h} ${2:v} ${3:blur} rgb(${4:0}, ${5:0}, ${6:0});",
                    "tsh:ra":
                      "text-shadow:${1:h} ${2:v} ${3:blur} rgba(${4:0}, ${5:0}, ${6:0}, .${7:5});",
                    "tsh+": "text-shadow:${1:0} ${2:0} ${3:0} ${4:#000};",
                    "tsh:n": "text-shadow:none;",
                    trf: "transform:|;",
                    "trf:skx": "transform: skewX(${1:angle});",
                    "trf:sky": "transform: skewY(${1:angle});",
                    "trf:sc": "transform: scale(${1:x}, ${2:y});",
                    "trf:scx": "transform: scaleX(${1:x});",
                    "trf:scy": "transform: scaleY(${1:y});",
                    "trf:scz": "transform: scaleZ(${1:z});",
                    "trf:sc3": "transform: scale3d(${1:x}, ${2:y}, ${3:z});",
                    "trf:r": "transform: rotate(${1:angle});",
                    "trf:rx": "transform: rotateX(${1:angle});",
                    "trf:ry": "transform: rotateY(${1:angle});",
                    "trf:rz": "transform: rotateZ(${1:angle});",
                    "trf:t": "transform: translate(${1:x}, ${2:y});",
                    "trf:tx": "transform: translateX(${1:x});",
                    "trf:ty": "transform: translateY(${1:y});",
                    "trf:tz": "transform: translateZ(${1:z});",
                    "trf:t3":
                      "transform: translate3d(${1:tx}, ${2:ty}, ${3:tz});",
                    trfo: "transform-origin:|;",
                    trfs: "transform-style:${1:preserve-3d};",
                    trs: "transition:${1:prop} ${2:time};",
                    trsde: "transition-delay:${1:time};",
                    trsdu: "transition-duration:${1:time};",
                    trsp: "transition-property:${1:prop};",
                    trstf: "transition-timing-function:${1:tfunc};",
                    lh: "line-height:|;",
                    whs: "white-space:|;",
                    "whs:n": "white-space:normal;",
                    "whs:p": "white-space:pre;",
                    "whs:nw": "white-space:nowrap;",
                    "whs:pw": "white-space:pre-wrap;",
                    "whs:pl": "white-space:pre-line;",
                    whsc: "white-space-collapse:|;",
                    "whsc:n": "white-space-collapse:normal;",
                    "whsc:k": "white-space-collapse:keep-all;",
                    "whsc:l": "white-space-collapse:loose;",
                    "whsc:bs": "white-space-collapse:break-strict;",
                    "whsc:ba": "white-space-collapse:break-all;",
                    wob: "word-break:|;",
                    "wob:n": "word-break:normal;",
                    "wob:k": "word-break:keep-all;",
                    "wob:ba": "word-break:break-all;",
                    wos: "word-spacing:|;",
                    wow: "word-wrap:|;",
                    "wow:nm": "word-wrap:normal;",
                    "wow:n": "word-wrap:none;",
                    "wow:u": "word-wrap:unrestricted;",
                    "wow:s": "word-wrap:suppress;",
                    "wow:b": "word-wrap:break-word;",
                    wm: "writing-mode:${1:lr-tb};",
                    "wm:lrt": "writing-mode:lr-tb;",
                    "wm:lrb": "writing-mode:lr-bt;",
                    "wm:rlt": "writing-mode:rl-tb;",
                    "wm:rlb": "writing-mode:rl-bt;",
                    "wm:tbr": "writing-mode:tb-rl;",
                    "wm:tbl": "writing-mode:tb-lr;",
                    "wm:btl": "writing-mode:bt-lr;",
                    "wm:btr": "writing-mode:bt-rl;",
                    lts: "letter-spacing:|;",
                    "lts-n": "letter-spacing:normal;",
                    f: "font:|;",
                    "f+": "font:${1:1em} ${2:Arial,sans-serif};",
                    fw: "font-weight:|;",
                    "fw:n": "font-weight:normal;",
                    "fw:b": "font-weight:bold;",
                    "fw:br": "font-weight:bolder;",
                    "fw:lr": "font-weight:lighter;",
                    fs: "font-style:${italic};",
                    "fs:n": "font-style:normal;",
                    "fs:i": "font-style:italic;",
                    "fs:o": "font-style:oblique;",
                    fv: "font-variant:|;",
                    "fv:n": "font-variant:normal;",
                    "fv:sc": "font-variant:small-caps;",
                    fz: "font-size:|;",
                    fza: "font-size-adjust:|;",
                    "fza:n": "font-size-adjust:none;",
                    ff: "font-family:|;",
                    "ff:s": "font-family:serif;",
                    "ff:ss": "font-family:sans-serif;",
                    "ff:c": "font-family:cursive;",
                    "ff:f": "font-family:fantasy;",
                    "ff:m": "font-family:monospace;",
                    "ff:a":
                      'font-family: Arial, "Helvetica Neue", Helvetica, sans-serif;',
                    "ff:t":
                      'font-family: "Times New Roman", Times, Baskerville, Georgia, serif;',
                    "ff:v": "font-family: Verdana, Geneva, sans-serif;",
                    fef: "font-effect:|;",
                    "fef:n": "font-effect:none;",
                    "fef:eg": "font-effect:engrave;",
                    "fef:eb": "font-effect:emboss;",
                    "fef:o": "font-effect:outline;",
                    fem: "font-emphasize:|;",
                    femp: "font-emphasize-position:|;",
                    "femp:b": "font-emphasize-position:before;",
                    "femp:a": "font-emphasize-position:after;",
                    fems: "font-emphasize-style:|;",
                    "fems:n": "font-emphasize-style:none;",
                    "fems:ac": "font-emphasize-style:accent;",
                    "fems:dt": "font-emphasize-style:dot;",
                    "fems:c": "font-emphasize-style:circle;",
                    "fems:ds": "font-emphasize-style:disc;",
                    fsm: "font-smooth:|;",
                    "fsm:a": "font-smooth:auto;",
                    "fsm:n": "font-smooth:never;",
                    "fsm:aw": "font-smooth:always;",
                    fst: "font-stretch:|;",
                    "fst:n": "font-stretch:normal;",
                    "fst:uc": "font-stretch:ultra-condensed;",
                    "fst:ec": "font-stretch:extra-condensed;",
                    "fst:c": "font-stretch:condensed;",
                    "fst:sc": "font-stretch:semi-condensed;",
                    "fst:se": "font-stretch:semi-expanded;",
                    "fst:e": "font-stretch:expanded;",
                    "fst:ee": "font-stretch:extra-expanded;",
                    "fst:ue": "font-stretch:ultra-expanded;",
                    op: "opacity:|;",
                    "op+": "opacity: $1;\nfilter: alpha(opacity=$2);",
                    "op:ie":
                      "filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=100);",
                    "op:ms":
                      "-ms-filter:'progid:DXImageTransform.Microsoft.Alpha(Opacity=100)';",
                    rsz: "resize:|;",
                    "rsz:n": "resize:none;",
                    "rsz:b": "resize:both;",
                    "rsz:h": "resize:horizontal;",
                    "rsz:v": "resize:vertical;",
                    cur: "cursor:${pointer};",
                    "cur:a": "cursor:auto;",
                    "cur:d": "cursor:default;",
                    "cur:c": "cursor:crosshair;",
                    "cur:ha": "cursor:hand;",
                    "cur:he": "cursor:help;",
                    "cur:m": "cursor:move;",
                    "cur:p": "cursor:pointer;",
                    "cur:t": "cursor:text;",
                    fxd: "flex-direction:|;",
                    "fxd:r": "flex-direction:row;",
                    "fxd:rr": "flex-direction:row-reverse;",
                    "fxd:c": "flex-direction:column;",
                    "fxd:cr": "flex-direction:column-reverse;",
                    fxw: "flex-wrap: |;",
                    "fxw:n": "flex-wrap:nowrap;",
                    "fxw:w": "flex-wrap:wrap;",
                    "fxw:wr": "flex-wrap:wrap-reverse;",
                    fxf: "flex-flow:|;",
                    jc: "justify-content:|;",
                    "jc:fs": "justify-content:flex-start;",
                    "jc:fe": "justify-content:flex-end;",
                    "jc:c": "justify-content:center;",
                    "jc:sb": "justify-content:space-between;",
                    "jc:sa": "justify-content:space-around;",
                    ai: "align-items:|;",
                    "ai:fs": "align-items:flex-start;",
                    "ai:fe": "align-items:flex-end;",
                    "ai:c": "align-items:center;",
                    "ai:b": "align-items:baseline;",
                    "ai:s": "align-items:stretch;",
                    ac: "align-content:|;",
                    "ac:fs": "align-content:flex-start;",
                    "ac:fe": "align-content:flex-end;",
                    "ac:c": "align-content:center;",
                    "ac:sb": "align-content:space-between;",
                    "ac:sa": "align-content:space-around;",
                    "ac:s": "align-content:stretch;",
                    ord: "order:|;",
                    fxg: "flex-grow:|;",
                    fxsh: "flex-shrink:|;",
                    fxb: "flex-basis:|;",
                    fx: "flex:|;",
                    as: "align-self:|;",
                    "as:a": "align-self:auto;",
                    "as:fs": "align-self:flex-start;",
                    "as:fe": "align-self:flex-end;",
                    "as:c": "align-self:center;",
                    "as:b": "align-self:baseline;",
                    "as:s": "align-self:stretch;",
                    pgbb: "page-break-before:|;",
                    "pgbb:au": "page-break-before:auto;",
                    "pgbb:al": "page-break-before:always;",
                    "pgbb:l": "page-break-before:left;",
                    "pgbb:r": "page-break-before:right;",
                    pgbi: "page-break-inside:|;",
                    "pgbi:au": "page-break-inside:auto;",
                    "pgbi:av": "page-break-inside:avoid;",
                    pgba: "page-break-after:|;",
                    "pgba:au": "page-break-after:auto;",
                    "pgba:al": "page-break-after:always;",
                    "pgba:l": "page-break-after:left;",
                    "pgba:r": "page-break-after:right;",
                    orp: "orphans:|;",
                    us: "user-select:${none};",
                    wid: "widows:|;",
                    wfsm: "-webkit-font-smoothing:${antialiased};",
                    "wfsm:a": "-webkit-font-smoothing:antialiased;",
                    "wfsm:s": "-webkit-font-smoothing:subpixel-antialiased;",
                    "wfsm:sa": "-webkit-font-smoothing:subpixel-antialiased;",
                    "wfsm:n": "-webkit-font-smoothing:none;"
                  }
                },
                html: {
                  filters: "html",
                  profile: "html",
                  snippets: {
                    "!!!": "<!DOCTYPE html>",
                    "!!!4t":
                      '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">',
                    "!!!4s":
                      '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">',
                    "!!!xt":
                      '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
                    "!!!xs":
                      '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">',
                    "!!!xxs":
                      '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">',
                    c: "\x3c!-- |${child} --\x3e",
                    "cc:ie6":
                      "\x3c!--[if lte IE 6]>\n\t${child}|\n<![endif]--\x3e",
                    "cc:ie": "\x3c!--[if IE]>\n\t${child}|\n<![endif]--\x3e",
                    "cc:noie":
                      "\x3c!--[if !IE]>\x3c!--\x3e\n\t${child}|\n\x3c!--<![endif]--\x3e"
                  },
                  abbreviations: {
                    "!": "html:5",
                    a: '<a href="">',
                    "a:link": '<a href="http://|">',
                    "a:mail": '<a href="mailto:|">',
                    abbr: '<abbr title="">',
                    "acr|acronym": '<acronym title="">',
                    base: '<base href="" />',
                    basefont: "<basefont/>",
                    br: "<br/>",
                    frame: "<frame/>",
                    hr: "<hr/>",
                    bdo: '<bdo dir="">',
                    "bdo:r": '<bdo dir="rtl">',
                    "bdo:l": '<bdo dir="ltr">',
                    col: "<col/>",
                    link: '<link rel="stylesheet" href="" />',
                    "link:css":
                      '<link rel="stylesheet" href="${1:style}.css" />',
                    "link:print":
                      '<link rel="stylesheet" href="${1:print}.css" media="print" />',
                    "link:favicon":
                      '<link rel="shortcut icon" type="image/x-icon" href="${1:favicon.ico}" />',
                    "link:touch":
                      '<link rel="apple-touch-icon" href="${1:favicon.png}" />',
                    "link:rss":
                      '<link rel="alternate" type="application/rss+xml" title="RSS" href="${1:rss.xml}" />',
                    "link:atom":
                      '<link rel="alternate" type="application/atom+xml" title="Atom" href="${1:atom.xml}" />',
                    "link:im|link:import":
                      '<link rel="import" href="${1:component}.html" />',
                    meta: "<meta/>",
                    "meta:utf":
                      '<meta http-equiv="Content-Type" content="text/html;charset=UTF-8" />',
                    "meta:win":
                      '<meta http-equiv="Content-Type" content="text/html;charset=windows-1251" />',
                    "meta:edge":
                      '<meta http-equiv="X-UA-Compatible" content="${1:ie=edge}" />',
                    "meta:vp":
                      '<meta name="viewport" content="width=${1:device-width}, initial-scale=${3:1.0}" />',
                    "meta:compat":
                      '<meta http-equiv="X-UA-Compatible" content="${1:IE=7}" />',
                    "meta:redirect":
                      '<meta http-equiv="refresh" content="0; url=${1:http://example.com}" />',
                    style: "<style>",
                    script: '<script !src="">',
                    "script:src": '<script src="">',
                    img: '<img src="" alt="" />',
                    "img:s|img:srcset": '<img srcset="" src="" alt="" />',
                    "img:z|img:sizes":
                      '<img sizes="" srcset="" src="" alt="" />',
                    picture: "<picture>",
                    "src|source": "<source/>",
                    "src:sc|source:src": '<source src="" type=""/>',
                    "src:s|source:srcset": '<source srcset=""/>',
                    "src:m|source:media":
                      '<source media="(${1:min-width: })" srcset=""/>',
                    "src:t|source:type":
                      '<source srcset="|" type="${1:image/}"/>',
                    "src:z|source:sizes": '<source sizes="" srcset=""/>',
                    "src:mt|source:media:type":
                      '<source media="(${1:min-width: })" srcset="" type="${2:image/}"/>',
                    "src:mz|source:media:sizes":
                      '<source media="(${1:min-width: })" sizes="" srcset=""/>',
                    "src:zt|source:sizes:type":
                      '<source sizes="" srcset="" type="${1:image/}"/>',
                    iframe: '<iframe src="" frameborder="0">',
                    embed: '<embed src="" type="" />',
                    object: '<object data="" type="">',
                    param: '<param name="" value="" />',
                    map: '<map name="">',
                    area: '<area shape="" coords="" href="" alt="" />',
                    "area:d": '<area shape="default" href="" alt="" />',
                    "area:c":
                      '<area shape="circle" coords="" href="" alt="" />',
                    "area:r": '<area shape="rect" coords="" href="" alt="" />',
                    "area:p": '<area shape="poly" coords="" href="" alt="" />',
                    form: '<form action="">',
                    "form:get": '<form action="" method="get">',
                    "form:post": '<form action="" method="post">',
                    label: '<label for="">',
                    input: '<input type="${1:text}" />',
                    inp: '<input type="${1:text}" name="" id="" />',
                    "input:h|input:hidden": "input[type=hidden name]",
                    "input:t|input:text": "inp",
                    "input:search": "inp[type=search]",
                    "input:email": "inp[type=email]",
                    "input:url": "inp[type=url]",
                    "input:p|input:password": "inp[type=password]",
                    "input:datetime": "inp[type=datetime]",
                    "input:date": "inp[type=date]",
                    "input:datetime-local": "inp[type=datetime-local]",
                    "input:month": "inp[type=month]",
                    "input:week": "inp[type=week]",
                    "input:time": "inp[type=time]",
                    "input:tel": "inp[type=tel]",
                    "input:number": "inp[type=number]",
                    "input:color": "inp[type=color]",
                    "input:c|input:checkbox": "inp[type=checkbox]",
                    "input:r|input:radio": "inp[type=radio]",
                    "input:range": "inp[type=range]",
                    "input:f|input:file": "inp[type=file]",
                    "input:s|input:submit": '<input type="submit" value="" />',
                    "input:i|input:image":
                      '<input type="image" src="" alt="" />',
                    "input:b|input:button": '<input type="button" value="" />',
                    isindex: "<isindex/>",
                    "input:reset": "input:button[type=reset]",
                    select: '<select name="" id="">',
                    "select:d|select:disabled": "select[disabled.]",
                    "opt|option": '<option value="">',
                    textarea:
                      '<textarea name="" id="" cols="${1:30}" rows="${2:10}">',
                    marquee: '<marquee behavior="" direction="">',
                    "menu:c|menu:context": "menu[type=context]>",
                    "menu:t|menu:toolbar": "menu[type=toolbar]>",
                    video: '<video src="">',
                    audio: '<audio src="">',
                    "html:xml": '<html xmlns="http://www.w3.org/1999/xhtml">',
                    keygen: "<keygen/>",
                    command: "<command/>",
                    "btn:s|button:s|button:submit": "button[type=submit]",
                    "btn:r|button:r|button:reset": "button[type=reset]",
                    "btn:d|button:d|button:disabled": "button[disabled.]",
                    "fst:d|fset:d|fieldset:d|fieldset:disabled":
                      "fieldset[disabled.]",
                    bq: "blockquote",
                    fig: "figure",
                    figc: "figcaption",
                    pic: "picture",
                    ifr: "iframe",
                    emb: "embed",
                    obj: "object",
                    cap: "caption",
                    colg: "colgroup",
                    fst: "fieldset",
                    btn: "button",
                    optg: "optgroup",
                    tarea: "textarea",
                    leg: "legend",
                    sect: "section",
                    art: "article",
                    hdr: "header",
                    ftr: "footer",
                    adr: "address",
                    dlg: "dialog",
                    str: "strong",
                    prog: "progress",
                    mn: "main",
                    tem: "template",
                    fset: "fieldset",
                    datag: "datagrid",
                    datal: "datalist",
                    kg: "keygen",
                    out: "output",
                    det: "details",
                    cmd: "command",
                    doc:
                      "html>(head>meta[charset=${charset}]+meta:vp+meta:edge+title{${1:Document}})+body",
                    doc4:
                      'html>(head>meta[http-equiv="Content-Type" content="text/html;charset=${charset}"]+title{${1:Document}})+body',
                    "ri:d|ri:dpr": "img:s",
                    "ri:v|ri:viewport": "img:z",
                    "ri:a|ri:art": "pic>src:m+img",
                    "ri:t|ri:type": "pic>src:t+img",
                    "html:4t": "!!!4t+doc4[lang=${lang}]",
                    "html:4s": "!!!4s+doc4[lang=${lang}]",
                    "html:xt":
                      "!!!xt+doc4[xmlns=http://www.w3.org/1999/xhtml xml:lang=${lang}]",
                    "html:xs":
                      "!!!xs+doc4[xmlns=http://www.w3.org/1999/xhtml xml:lang=${lang}]",
                    "html:xxs":
                      "!!!xxs+doc4[xmlns=http://www.w3.org/1999/xhtml xml:lang=${lang}]",
                    "html:5": "!!!+doc[lang=${lang}]",
                    "ol+": "ol>li",
                    "ul+": "ul>li",
                    "dl+": "dl>dt+dd",
                    "map+": "map>area",
                    "table+": "table>tr>td",
                    "colgroup+": "colgroup>col",
                    "colg+": "colgroup>col",
                    "tr+": "tr>td",
                    "select+": "select>option",
                    "optgroup+": "optgroup>option",
                    "optg+": "optgroup>option",
                    "pic+": "picture>source:srcset+img"
                  }
                },
                xml: { extends: "html", profile: "xml", filters: "html" },
                svg: {
                  filters: "html",
                  profile: "xml",
                  snippets: {
                    "!!!":
                      '<?xml version="1.0" encoding="UTF-8" standalone="no"?>',
                    svgdoc:
                      '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">'
                  },
                  abbreviations: {
                    "!svg": "!!!+svgdoc+svg",
                    svg:
                      '<svg version="1.1" xmlns="http://www.w3.org/2000/svg">',
                    a: '<a xlink:href="">',
                    ag: "altGliph",
                    agd: "altGliphDef",
                    agi: "altGliphItem",
                    "anim|animate":
                      '<animate attributeType="" attributeName="" from="" to="" dur="" repeatCount="indefinite">',
                    ac: "<animateColor>",
                    am: "<animateMotion>",
                    at: "<animateTransform>",
                    c: "circle",
                    cp: "colorPath",
                    "c-p": "color-profile",
                    cur: "cursor",
                    df: "defs",
                    "e|ellipse": '<ellipse  cx="" cy="" rx="" ry=""/>',
                    ff: "<font-face>",
                    fff: "<font-face-format>",
                    ffn: "<font-face-name>",
                    ffs: "<font-face-src>",
                    ffu: "<font-face-uri>",
                    fo: "<foreignObject>",
                    g: "<g>",
                    gl: "<glyph>",
                    glr: "<glyphRef>",
                    hk: "<hkern>",
                    "i|image":
                      '<image xlink:href="" x="" y="" width="" height=""/>',
                    l: "<line>",
                    lg: "<linearGradient>",
                    marker: "<marker>",
                    mask: "<mask>",
                    md: "<metadata>",
                    mg: "<missing-glyph>",
                    mp: "<mpath>",
                    path: '<path d="">',
                    patt: "<pattern>",
                    pg: '<polygon points="">',
                    pl: '<polyline points="">',
                    rg: "<radialGradient>",
                    r: '<rect x="" y="" width="" height=""/>',
                    scr: "<script>",
                    sb: "<symbol>",
                    txt: "<text>",
                    tp: "<textPath>",
                    ts: "<tspan>",
                    "u|use": '<use xlink:href=""/>',
                    v: "<view>",
                    vk: "<vkern>"
                  }
                },
                xsl: {
                  extends: "html",
                  profile: "xml",
                  filters: "html, xsl",
                  abbreviations: {
                    "tm|tmatch": '<xsl:template match="" mode="">',
                    "tn|tname": '<xsl:template name="">',
                    call: '<xsl:call-template name=""/>',
                    ap: '<xsl:apply-templates select="" mode=""/>',
                    api: "<xsl:apply-imports/>",
                    imp: '<xsl:import href=""/>',
                    inc: '<xsl:include href=""/>',
                    ch: "<xsl:choose>",
                    "wh|xsl:when": '<xsl:when test="">',
                    ot: "<xsl:otherwise>",
                    if: '<xsl:if test="">',
                    par: '<xsl:param name="">',
                    pare: '<xsl:param name="" select=""/>',
                    var: '<xsl:variable name="">',
                    vare: '<xsl:variable name="" select=""/>',
                    wp: '<xsl:with-param name="" select=""/>',
                    key: '<xsl:key name="" match="" use=""/>',
                    elem: '<xsl:element name="">',
                    attr: '<xsl:attribute name="">',
                    attrs: '<xsl:attribute-set name="">',
                    cp: '<xsl:copy select=""/>',
                    co: '<xsl:copy-of select=""/>',
                    val: '<xsl:value-of select=""/>',
                    "for|each": '<xsl:for-each select="">',
                    tex: "<xsl:text></xsl:text>",
                    com: "<xsl:comment>",
                    msg: '<xsl:message terminate="no">',
                    fall: "<xsl:fallback>",
                    num: '<xsl:number value=""/>',
                    nam:
                      '<namespace-alias stylesheet-prefix="" result-prefix=""/>',
                    pres: '<xsl:preserve-space elements=""/>',
                    strip: '<xsl:strip-space elements=""/>',
                    proc: '<xsl:processing-instruction name="">',
                    sort: '<xsl:sort select="" order=""/>',
                    "choose+": "xsl:choose>xsl:when+xsl:otherwise",
                    xsl:
                      "!!!+xsl:stylesheet[version=1.0 xmlns:xsl=http://www.w3.org/1999/XSL/Transform]>{\n|}"
                  },
                  snippets: { "!!!": '<?xml version="1.0" encoding="UTF-8"?>' }
                },
                haml: { filters: "haml", extends: "html", profile: "xml" },
                jade: { filters: "jade", extends: "html", profile: "xml" },
                jsx: { filters: "jsx, html", extends: "html", profile: "xml" },
                slim: { filters: "slim", extends: "html", profile: "xml" },
                scss: { extends: "css" },
                sass: { extends: "css" },
                less: { extends: "css" },
                stylus: { extends: "css" },
                styl: { extends: "stylus" }
              };
            },
            {}
          ],
          "utils\\abbreviation.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../assets/elements"),
                  i = t("../assets/tabStops"),
                  s = t("../utils/common"),
                  o = t("../resolver/tagName");
                return {
                  isUnary: function(t) {
                    if (t.children.length || t._text || this.isSnippet(t))
                      return !1;
                    var e = t.data("resource");
                    return e && e.is_empty;
                  },
                  isInline: function(t) {
                    return (
                      t.isTextNode() || !t.name() || o.isInlineLevel(t.name())
                    );
                  },
                  isBlock: function(t) {
                    return this.isSnippet(t) || !this.isInline(t);
                  },
                  isSnippet: function(t) {
                    return r.is(t.data("resource"), "snippet");
                  },
                  hasTagsInContent: function(t) {
                    return s.matchesTag(t.content);
                  },
                  hasBlockChildren: function(t) {
                    return (
                      (this.hasTagsInContent(t) && this.isBlock(t)) ||
                      t.children.some(function(t) {
                        return this.isBlock(t);
                      }, this)
                    );
                  },
                  insertChildContent: function(t, e, n) {
                    n = s.extend(
                      { keepVariable: !0, appendIfNoChild: !0 },
                      n || {}
                    );
                    var r = !1;
                    return (
                      (t = i.replaceVariables(t, function(i, o, a) {
                        var c = i;
                        return (
                          "child" == o &&
                            ((c = s.padString(
                              e,
                              s.getLinePaddingFromPosition(t, a.start)
                            )),
                            (r = !0),
                            n.keepVariable && (c += i)),
                          c
                        );
                      })),
                      !r && n.appendIfNoChild && (t += e),
                      t
                    );
                  }
                };
              });
            },
            {
              "../assets/elements": "assets\\elements.js",
              "../assets/tabStops": "assets\\tabStops.js",
              "../resolver/tagName": "resolver\\tagName.js",
              "../utils/common": "utils\\common.js"
            }
          ],
          "utils\\action.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("./common"),
                  i = t("./cssSections"),
                  s = t("../parser/abbreviation"),
                  o = t("../assets/htmlMatcher"),
                  a = t("../editTree/xml"),
                  c = t("../assets/range"),
                  u = t("../assets/resources");
                return {
                  mimeTypes: {
                    gif: "image/gif",
                    png: "image/png",
                    jpg: "image/jpeg",
                    jpeg: "image/jpeg",
                    svg: "image/svg+xml",
                    html: "text/html",
                    htm: "text/html"
                  },
                  extractAbbreviation: function(t) {
                    for (var e = t.length, n = -1, i = 0, o = 0, a = 0; ; ) {
                      if (--e < 0) {
                        n = 0;
                        break;
                      }
                      var c = t.charAt(e);
                      if ("]" == c) o++;
                      else if ("[" == c) {
                        if (!o) {
                          n = e + 1;
                          break;
                        }
                        o--;
                      } else if ("}" == c) a++;
                      else if ("{" == c) {
                        if (!a) {
                          n = e + 1;
                          break;
                        }
                        a--;
                      } else if (")" == c) i++;
                      else if ("(" == c) {
                        if (!i) {
                          n = e + 1;
                          break;
                        }
                        i--;
                      } else {
                        if (o || a) continue;
                        if (
                          !s.isAllowedChar(c) ||
                          (">" == c && r.endsWithTag(t.substring(0, e + 1)))
                        ) {
                          n = e + 1;
                          break;
                        }
                      }
                    }
                    return -1 == n || a || o || i
                      ? ""
                      : t.substring(n).replace(/^[\*\+\>\^]+/, "");
                  },
                  getImageSize: function(t) {
                    var e = 0,
                      n = function() {
                        return t.charCodeAt(e++);
                      };
                    if ("PNG\r\n\n" === t.substr(0, 8))
                      return (
                        (e = t.indexOf("IHDR") + 4),
                        {
                          width: (n() << 24) | (n() << 16) | (n() << 8) | n(),
                          height: (n() << 24) | (n() << 16) | (n() << 8) | n()
                        }
                      );
                    if ("GIF8" === t.substr(0, 4))
                      return (
                        (e = 6),
                        { width: n() | (n() << 8), height: n() | (n() << 8) }
                      );
                    if ("ÿØ" === t.substr(0, 2)) {
                      e = 2;
                      for (var r = t.length; e < r; ) {
                        if (255 != n()) return;
                        var i = n();
                        if (218 == i) break;
                        var s = (n() << 8) | n();
                        if (!(!(i >= 192 && i <= 207) || 4 & i || 8 & i))
                          return (
                            (e += 1),
                            {
                              height: (n() << 8) | n(),
                              width: (n() << 8) | n()
                            }
                          );
                        e += s - 2;
                      }
                    }
                  },
                  captureContext: function(t, e) {
                    var n = t.getSyntax();
                    if (n in { html: 1, xml: 1, xsl: 1, jsx: 1 }) {
                      var r = t.getContent();
                      void 0 === e && (e = t.getCaretPos());
                      var i = o.find(r, e);
                      if (i && "tag" == i.type) {
                        var s = i.open,
                          c = { name: s.name, attributes: [], match: i },
                          u = a.parse(s.range.substring(r));
                        return (
                          u &&
                            (c.attributes = u.getAll().map(function(t) {
                              return { name: t.name(), value: t.value() };
                            })),
                          c
                        );
                      }
                    }
                    return null;
                  },
                  findExpressionBounds: function(t, e) {
                    for (
                      var n = String(t.getContent()),
                        r = n.length,
                        i = t.getCaretPos() - 1,
                        s = i + 1;
                      i >= 0 && e(n.charAt(i), i, n);

                    )
                      i--;
                    for (; s < r && e(n.charAt(s), s, n); ) s++;
                    if (s > i) return c([++i, s]);
                  },
                  compoundUpdate: function(t, e) {
                    if (e) {
                      var n = t.getSelectionRange();
                      return (
                        t.replaceContent(e.data, e.start, e.end, !0),
                        t.createSelection(e.caret, e.caret + n.end - n.start),
                        !0
                      );
                    }
                    return !1;
                  },
                  detectSyntax: function(t, e) {
                    var n = e || "html";
                    return (
                      u.hasSyntax(n) || (n = "html"),
                      "html" == n &&
                        (this.isStyle(t) || this.isInlineCSS(t)) &&
                        (n = "css"),
                      "styl" == n && (n = "stylus"),
                      n
                    );
                  },
                  detectProfile: function(t) {
                    var e = t.getSyntax(),
                      n = u.findItem(e, "profile");
                    if (n) return n;
                    switch (e) {
                      case "xml":
                      case "xsl":
                        return "xml";
                      case "css":
                        if (this.isInlineCSS(t)) return "line";
                        break;
                      case "html":
                        return (
                          (n = u.getVariable("profile")) ||
                            (n = this.isXHTML(t) ? "xhtml" : "html"),
                          n
                        );
                    }
                    return "xhtml";
                  },
                  isXHTML: function(t) {
                    return -1 != t.getContent().search(/<!DOCTYPE[^>]+XHTML/i);
                  },
                  isStyle: function(t) {
                    return !!i.styleTagRange(t.getContent(), t.getCaretPos());
                  },
                  isSupportedCSS: function(t) {
                    return "css" == t || "less" == t || "scss" == t;
                  },
                  isInlineCSS: function(t) {
                    return !!i.styleAttrRange(t.getContent(), t.getCaretPos());
                  }
                };
              });
            },
            {
              "../assets/htmlMatcher": "assets\\htmlMatcher.js",
              "../assets/range": "assets\\range.js",
              "../assets/resources": "assets\\resources.js",
              "../editTree/xml": "editTree\\xml.js",
              "../parser/abbreviation": "parser\\abbreviation.js",
              "./common": "utils\\common.js",
              "./cssSections": "utils\\cssSections.js"
            }
          ],
          "utils\\base64.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r =
                  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
                return {
                  encode: function(t) {
                    for (
                      var e,
                        n,
                        i,
                        s,
                        o,
                        a,
                        c,
                        u,
                        l,
                        f,
                        p = [],
                        d = 0,
                        h = t.length,
                        m = r;
                      d < h;

                    )
                      (u = t.charCodeAt(d++)),
                        (l = t.charCodeAt(d++)),
                        (f = t.charCodeAt(d++)),
                        (s = (e = 255 & u) >> 2),
                        (o = ((3 & e) << 4) | ((n = 255 & l) >> 4)),
                        (a = ((15 & n) << 2) | ((i = 255 & f) >> 6)),
                        (c = 63 & i),
                        isNaN(l) ? (a = c = 64) : isNaN(f) && (c = 64),
                        p.push(
                          m.charAt(s) + m.charAt(o) + m.charAt(a) + m.charAt(c)
                        );
                    return p.join("");
                  },
                  decode: function(t) {
                    var e,
                      n,
                      i,
                      s,
                      o,
                      a,
                      c,
                      u,
                      l = 0,
                      f = 0,
                      p = [],
                      d = r,
                      h = t.length;
                    if (!t) return t;
                    t += "";
                    do {
                      (s = d.indexOf(t.charAt(l++))),
                        (o = d.indexOf(t.charAt(l++))),
                        (a = d.indexOf(t.charAt(l++))),
                        (c = d.indexOf(t.charAt(l++))),
                        (e =
                          ((u = (s << 18) | (o << 12) | (a << 6) | c) >> 16) &
                          255),
                        (n = (u >> 8) & 255),
                        (i = 255 & u),
                        (p[f++] =
                          64 == a
                            ? String.fromCharCode(e)
                            : 64 == c
                            ? String.fromCharCode(e, n)
                            : String.fromCharCode(e, n, i));
                    } while (l < h);
                    return p.join("");
                  }
                };
              });
            },
            {}
          ],
          "utils\\comments.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("./common"),
                  i = (t("../assets/range"), t("../assets/stringStream")),
                  s = /\/\*|\/\//;
                return {
                  strip: function(t) {
                    if (!s.test(t)) return t;
                    for (var e, n, o = i(t), a = []; (e = o.next()); )
                      if ("/" === e) {
                        if ("*" === (n = o.peek()))
                          (o.start = o.pos - 1),
                            o.skipTo("*/") ? (o.pos += 2) : o.skipToEnd(),
                            a.push([o.start, o.pos]);
                        else if ("/" === n) {
                          for (
                            o.start = o.pos - 1;
                            (n = o.next()) && "\n" !== n && "\r" != n;

                          );
                          a.push([o.start, o.pos]);
                        }
                      } else o.skipQuoted();
                    return r.replaceWith(t, a, " ");
                  }
                };
              });
            },
            {
              "../assets/range": "assets\\range.js",
              "../assets/stringStream": "assets\\stringStream.js",
              "./common": "utils\\common.js"
            }
          ],
          "utils\\common.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../assets/range"),
                  i = "${0}";
                return {
                  reTag: /<\/?[\w:\-]+(?:\s+[\w\-:]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*\s*(\/?)>$/,
                  defaultSyntax: function() {
                    return "html";
                  },
                  defaultProfile: function() {
                    return "plain";
                  },
                  endsWithTag: function(t) {
                    return this.reTag.test(t);
                  },
                  isNumeric: function(t) {
                    return (
                      "string" == typeof t && (t = t.charCodeAt(0)),
                      t && t > 47 && t < 58
                    );
                  },
                  trim: String.prototype.trim
                    ? function(t) {
                        return t ? t.trim() : "";
                      }
                    : function(t) {
                        return (t || "").replace(/^\s+|\s+$/g, "");
                      },
                  splitByLines: function(t, e) {
                    var n = (t || "")
                      .replace(/\r\n/g, "\n")
                      .replace(/\n\r/g, "\n")
                      .replace(/\r/g, "\n")
                      .replace(/\n/g, "\n")
                      .split("\n");
                    return (
                      e &&
                        (n = n.filter(function(t) {
                          return t.length && !!this.trim(t);
                        }, this)),
                      n
                    );
                  },
                  repeatString: function(t, e) {
                    for (var n = ""; e--; ) n += t;
                    return n;
                  },
                  getStringsPads: function(t) {
                    var e = t.map(function(t) {
                        return "string" == typeof t ? t.length : +t;
                      }),
                      n = e.reduce(function(t, e) {
                        return void 0 === t ? e : Math.max(t, e);
                      });
                    return e.map(function(t) {
                      var e = n - t;
                      return e ? this.repeatString(" ", e) : "";
                    }, this);
                  },
                  padString: function(t, e) {
                    var n = [],
                      r = this.splitByLines(t);
                    n.push(r[0]);
                    for (var i = 1; i < r.length; i++) n.push("\n" + e + r[i]);
                    return n.join("");
                  },
                  zeroPadString: function(t, e) {
                    for (var n = "", r = t.length; e > r++; ) n += "0";
                    return n + t;
                  },
                  unindentString: function(t, e) {
                    for (
                      var n,
                        r = this.splitByLines(t),
                        i = e.length,
                        s = 0,
                        o = r.length;
                      s < o;
                      s++
                    )
                      (n = r[s]).substr(0, i) === e && (r[s] = n.substr(i));
                    return r.join("\n");
                  },
                  replaceUnescapedSymbol: function(t, e, n) {
                    for (var r = 0, i = t.length, s = e.length, o = 0; r < i; )
                      if ("\\" == t.charAt(r)) r += s + 1;
                      else if (t.substr(r, s) == e) {
                        var a = s,
                          c = n;
                        if ("function" == typeof n) {
                          var u = n(t, e, r, ++o);
                          u ? ((a = u[0].length), (c = u[1])) : (c = !1);
                        }
                        if (!1 === c) {
                          r++;
                          continue;
                        }
                        (t = t.substring(0, r) + c + t.substring(r + a)),
                          (i = t.length),
                          (r += c.length);
                      } else r++;
                    return t;
                  },
                  replaceCounter: function(t, e, n) {
                    (t = String(t)),
                      (e = String(e)),
                      /^\-?\d+$/.test(e) && (e = +e);
                    var r = this;
                    return this.replaceUnescapedSymbol(t, "$", function(
                      t,
                      i,
                      s,
                      o
                    ) {
                      if (
                        "{" == t.charAt(s + 1) ||
                        r.isNumeric(t.charAt(s + 1))
                      )
                        return !1;
                      for (
                        var a = s + 1;
                        "$" == t.charAt(a) && "{" != t.charAt(a + 1);

                      )
                        a++;
                      var c,
                        u = a - s,
                        l = 0,
                        f = !1;
                      return (
                        (c = t.substr(a).match(/^@(\-?)(\d*)/)) &&
                          ((a += c[0].length),
                          c[1] && (f = !0),
                          (l = parseInt(c[2] || 1, 10) - 1)),
                        f && n && "number" == typeof e && (e = n - e + 1),
                        (e += l),
                        [t.substring(s, a), r.zeroPadString(e + "", u)]
                      );
                    });
                  },
                  matchesTag: function(t) {
                    return this.reTag.test(t || "");
                  },
                  escapeText: function(t) {
                    return t.replace(/([\$\\])/g, "\\$1");
                  },
                  unescapeText: function(t) {
                    return t.replace(/\\(.)/g, "$1");
                  },
                  getCaretPlaceholder: function() {
                    return "function" == typeof i
                      ? i.apply(this, arguments)
                      : i;
                  },
                  setCaretPlaceholder: function(t) {
                    i = t;
                  },
                  getLinePadding: function(t) {
                    return (t.match(/^(\s+)/) || [""])[0];
                  },
                  getLinePaddingFromPosition: function(t, e) {
                    var n = this.findNewlineBounds(t, e);
                    return this.getLinePadding(n.substring(t));
                  },
                  escapeForRegexp: function(t) {
                    var e = new RegExp("[.*+?|()\\[\\]{}\\\\]", "g");
                    return t.replace(e, "\\$&");
                  },
                  prettifyNumber: function(t, e) {
                    return t
                      .toFixed(void 0 === e ? 2 : e)
                      .replace(/\.?0+$/, "");
                  },
                  replaceSubstring: function(t, e, n, r) {
                    return (
                      "object" == typeof n &&
                        "end" in n &&
                        ((r = n.end), (n = n.start)),
                      "string" == typeof r && (r = n + r.length),
                      void 0 === r && (r = n),
                      n < 0 || n > t.length
                        ? t
                        : t.substring(0, n) + e + t.substring(r)
                    );
                  },
                  replaceWith: function(t, e, n, r) {
                    if (e.length) {
                      var i = 0,
                        s = [];
                      e.forEach(function(e) {
                        var o = r ? n : this.repeatString(n, e[1] - e[0]);
                        s.push(t.substring(i, e[0]), o), (i = e[1]);
                      }, this),
                        (t = s.join("") + t.substring(i));
                    }
                    return t;
                  },
                  narrowToNonSpace: function(t, e, n) {
                    for (
                      var i = r.create(e, n), s = /[\s\n\r\u00a0]/;
                      i.start < i.end && s.test(t.charAt(i.start));

                    )
                      i.start++;
                    for (; i.end > i.start; )
                      if ((i.end--, !s.test(t.charAt(i.end)))) {
                        i.end++;
                        break;
                      }
                    return i;
                  },
                  findNewlineBounds: function(t, e) {
                    for (
                      var n, i = t.length, s = 0, o = i - 1, a = e - 1;
                      a > 0;
                      a--
                    )
                      if ("\n" == (n = t.charAt(a)) || "\r" == n) {
                        s = a + 1;
                        break;
                      }
                    for (var c = e; c < i; c++)
                      if ("\n" == (n = t.charAt(c)) || "\r" == n) {
                        o = c;
                        break;
                      }
                    return r.create(s, o - s);
                  },
                  deepMerge: function() {
                    var t,
                      e,
                      n,
                      r,
                      i,
                      s,
                      o = arguments[0] || {},
                      a = 1,
                      c = arguments.length;
                    for (
                      "object" != typeof o &&
                      "function" != typeof o &&
                      (o = {});
                      a < c;
                      a++
                    )
                      if (null !== (t = arguments[a]))
                        for (e in t)
                          (n = o[e]),
                            (r = t[e]),
                            o !== r &&
                              (r &&
                              ("object" == typeof r || (i = Array.isArray(r)))
                                ? (i
                                    ? ((i = !1),
                                      (s = n && Array.isArray(n) ? n : []))
                                    : (s = n && "object" == typeof n ? n : {}),
                                  (o[e] = this.deepMerge(s, r)))
                                : void 0 !== r && (o[e] = r));
                    return o;
                  },
                  parseJSON: function(t) {
                    if ("object" == typeof t) return t;
                    try {
                      return JSON.parse(t);
                    } catch (t) {
                      return {};
                    }
                  },
                  unique: function(t, e) {
                    var n = [];
                    return t.filter(function(t) {
                      var r = e ? e(t) : t;
                      if (n.indexOf(r) < 0) return n.push(r), !0;
                    });
                  },
                  pick: function(t) {
                    var e = {},
                      n = this.toArray(arguments, 1);
                    return (
                      Object.keys(t).forEach(function(r) {
                        ~n.indexOf(r) && (e[r] = t[r]);
                      }),
                      e
                    );
                  },
                  find: function(t, e, n) {
                    var r;
                    return (
                      n && (e = e.bind(n)),
                      Array.isArray(t)
                        ? t.some(function(t, n) {
                            if (e(t, n)) return (r = t);
                          })
                        : Object.keys(t).some(function(n, i) {
                            if (e(t[n], i)) return (r = t[n]);
                          }),
                      r
                    );
                  },
                  toArray: function(t, e) {
                    return Array.isArray(t) && !e
                      ? t
                      : Array.prototype.slice.call(t, e || 0);
                  },
                  extend: function(t) {
                    for (var e, n = 1, r = arguments.length; n < r; n++)
                      (e = arguments[n]) &&
                        Object.keys(e).forEach(function(n) {
                          t[n] = e[n];
                        });
                    return t;
                  },
                  defaults: function(t) {
                    for (var e, n = 1, r = arguments.length; n < r; n++)
                      (e = arguments[n]) &&
                        Object.keys(e).forEach(function(n) {
                          n in t || (t[n] = e[n]);
                        });
                    return t;
                  },
                  flatten: function(t, e) {
                    e = e || [];
                    var n = this;
                    return (
                      n.toArray(t).forEach(function(t) {
                        Array.isArray(t) ? n.flatten(t, e) : e.push(t);
                      }),
                      e
                    );
                  },
                  clone: function(t) {
                    return Array.isArray(t) ? t.slice(0) : this.extend({}, t);
                  },
                  without: function(t) {
                    return (
                      this.toArray(arguments, 1).forEach(function(e) {
                        for (var n; ~(n = t.indexOf(e)); ) t.splice(n, 1);
                      }),
                      t
                    );
                  },
                  last: function(t) {
                    return t[t.length - 1];
                  }
                };
              });
            },
            { "../assets/range": "assets\\range.js" }
          ],
          "utils\\cssSections.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("./common"),
                  i = t("./comments"),
                  s = t("../assets/range"),
                  o = t("../assets/stringStream"),
                  a = (t("../parser/css"), t("../assets/htmlMatcher")),
                  c = t("../editTree/xml"),
                  u = 1,
                  l = 1e6,
                  f = /^(\s*).+?(\s*)$/,
                  p = /\s/g;
                function d(t) {
                  return '"' == t || "'" == t;
                }
                function h(t, e) {
                  (this.id = "s" + (u = (u + 1) % l)),
                    (this.parent = null),
                    (this.nextSibling = null),
                    (this.previousSibling = null),
                    (this._source = e),
                    (this._name = null),
                    (this._content = null),
                    (this._data = {}),
                    !t && e && (t = s(0, e)),
                    (this.range = t),
                    (this.children = []);
                }
                return (
                  (h.prototype = {
                    addChild: function(t) {
                      t instanceof h || (t = new h(t));
                      var e = r.last(this.children);
                      return (
                        e && ((e.nextSibling = t), (t.previousSibling = e)),
                        (t.parent = this),
                        this.children.push(t),
                        t
                      );
                    },
                    root: function() {
                      var t = this;
                      do {
                        if (!t.parent) return t;
                      } while ((t = t.parent));
                      return t;
                    },
                    source: function() {
                      return this._source || this.root()._source;
                    },
                    name: function() {
                      if (null === this._name) {
                        var t = this.nameRange();
                        t && (this._name = t.substring(this.source()));
                      }
                      return this._name;
                    },
                    nameRange: function() {
                      if (this.range && "_selectorEnd" in this.range)
                        return s.create2(
                          this.range.start,
                          this.range._selectorEnd
                        );
                    },
                    matchDeep: function(t) {
                      if (!this.range.inside(t)) return null;
                      for (var e, n = 0, r = this.children.length; n < r; n++)
                        if ((e = this.children[n].matchDeep(t))) return e;
                      return this.parent ? this : null;
                    },
                    allRanges: function() {
                      var t = [];
                      return (
                        this.parent && t.push(this.range),
                        this.children.forEach(function(e) {
                          t = t.concat(e.allRanges());
                        }),
                        t
                      );
                    },
                    data: function(t, e) {
                      return void 0 !== e && (this._data[t] = e), this._data[t];
                    },
                    stringify: function(t) {
                      t = t || "";
                      var e = "";
                      return (
                        this.children.forEach(function(n) {
                          (e += t + n.name().replace(/\n/g, "\\n") + "\n"),
                            (e += n.stringify(t + "--"));
                        }),
                        e
                      );
                    },
                    content: function() {
                      if (null !== this._content) return this._content;
                      if (!(this.range && "_contentStart" in this.range))
                        return "";
                      var t = s.create2(
                          this.range._contentStart + 1,
                          this.range.end - 1
                        ),
                        e = this.source(),
                        n = t.start,
                        i = "";
                      return (
                        this.children.forEach(function(t) {
                          (i += e.substring(n, t.range.start)),
                            (n = t.range.end);
                        }),
                        (i += e.substring(n, t.end)),
                        (this._content = r.trim(i))
                      );
                    }
                  }),
                  {
                    findAllRules: function(t) {
                      t = this.sanitize(t);
                      for (
                        var e,
                          n,
                          i = o(t),
                          a = [],
                          c = this,
                          u = function(e) {
                            var n = c.extractSelector(t, e.start),
                              r = s.create2(n.start, e.end);
                            (r._selectorEnd = n.end),
                              (r._contentStart = e.start),
                              a.push(r);
                          };
                        (n = i.next());

                      )
                        if (d(n)) {
                          if (!i.skipString(n)) break;
                        } else
                          "{" == n &&
                            ((e = this.matchBracesRanges(t, i.pos - 1)).forEach(
                              u
                            ),
                            e.length) &&
                            (i.pos = r.last(e).end);
                      return a.sort(function(t, e) {
                        return t.start - e.start;
                      });
                    },
                    matchBracesRanges: function(t, e, n) {
                      n && (t = this.sanitize(t));
                      var r = o(t);
                      r.start = r.pos = e;
                      for (var i, a = [], c = []; (i = r.next()); )
                        if ("{" == i) a.push(r.pos - 1);
                        else if ("}" == i) {
                          if (!a.length)
                            throw "Invalid source structure (check for curly braces)";
                          if ((c.push(s.create2(a.pop(), r.pos)), !a.length))
                            return c;
                        } else r.skipQuoted();
                      return c;
                    },
                    extractSelector: function(t, e, n) {
                      n && (t = this.sanitize(t));
                      for (
                        var r,
                          i = function() {
                            var n = t.charAt(e);
                            if ('"' == n || "'" == n) {
                              for (
                                ;
                                --e >= 0 &&
                                (t.charAt(e) != n || "\\" == t.charAt(e - 1));

                              );
                              return !0;
                            }
                            return !1;
                          },
                          o = e;
                        --e >= 0;

                      )
                        if (!i())
                          if (")" != (r = t.charAt(e))) {
                            if ("{" == r || "}" == r || ";" == r) {
                              e++;
                              break;
                            }
                          } else
                            for (; --e >= 0 && (i() || "(" != t.charAt(e)); );
                      e < 0 && (e = 0);
                      var a = t.substring(e, o),
                        c = a.replace(p, " ").match(f);
                      return (
                        c && ((e += c[1].length), (o -= c[2].length)),
                        s.create2(e, o)
                      );
                    },
                    matchEnclosingRule: function(t, e) {
                      "string" == typeof t && (t = this.findAllRules(t));
                      var n = t.filter(function(t) {
                        return t.inside(e);
                      });
                      return r.last(n);
                    },
                    locateRule: function(t, e, n) {
                      var r = 0,
                        i = this.styleTagRange(t, e);
                      i &&
                        ((r = i.start), (e -= i.start), (t = i.substring(t)));
                      var s = this.findAllRules(t),
                        o = this.matchEnclosingRule(s, e);
                      if (o) return o.shift(r);
                      for (var a = 0, c = s.length; a < c; a++)
                        if (s[a].start > e)
                          return s[n && a > 0 ? a - 1 : a].shift(r);
                    },
                    sanitize: function(t) {
                      t = i.strip(t);
                      for (var e, n = o(t), s = []; (e = n.next()); )
                        if (d(e)) n.skipString(e);
                        else if (("#" === e || "@" === e) && "{" === n.peek()) {
                          if (((n.start = n.pos - 1), !n.skipTo("}")))
                            throw "Invalid string interpolation at " + n.start;
                          (n.pos += 1), s.push([n.start, n.pos]);
                        }
                      return r.replaceWith(t, s, "a");
                    },
                    sectionTree: function(t) {
                      var e = new h(null, t),
                        n = this.findAllRules(t),
                        r = e;
                      return (
                        n.forEach(function(t) {
                          r = (function(t, n) {
                            for (; n && n.range; ) {
                              if (n.range.contains(t)) return n.addChild(t);
                              n = n.parent;
                            }
                            return e.addChild(t);
                          })(t, r);
                        }),
                        e
                      );
                    },
                    nestedSectionsInRule: function(t) {
                      var e = t.valueRange(!0).start,
                        n = this.findAllRules(
                          t.valueRange().substring(t.source)
                        );
                      return (
                        n.forEach(function(t) {
                          (t.start += e),
                            (t.end += e),
                            (t._selectorEnd += e),
                            (t._contentStart += e);
                        }),
                        n
                      );
                    },
                    styleTagRange: function(t, e) {
                      var n = a.tag(t, e);
                      return (
                        n &&
                        "style" == n.open.name.toLowerCase() &&
                        n.innerRange.cmp(e, "lte", "gte") &&
                        n.innerRange
                      );
                    },
                    styleAttrRange: function(t, e) {
                      var n = c.parseFromPosition(t, e, !0);
                      if (n) {
                        var r = n.itemFromPosition(e, !0);
                        return (
                          r &&
                          "style" == r.name().toLowerCase() &&
                          r.valueRange(!0).cmp(e, "lte", "gte") &&
                          r.valueRange(!0)
                        );
                      }
                    },
                    CSSSection: h
                  }
                );
              });
            },
            {
              "../assets/htmlMatcher": "assets\\htmlMatcher.js",
              "../assets/range": "assets\\range.js",
              "../assets/stringStream": "assets\\stringStream.js",
              "../editTree/xml": "editTree\\xml.js",
              "../parser/css": "parser\\css.js",
              "./comments": "utils\\comments.js",
              "./common": "utils\\common.js"
            }
          ],
          "utils\\editor.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("./common"),
                  i = t("../assets/resources");
                return {
                  isInsideTag: function(t, e) {
                    for (var n = e; n > -1 && "<" != t.charAt(n); ) n--;
                    if (-1 != n) {
                      var r = /^<\/?\w[\w\:\-]*.*?>/.exec(t.substring(n));
                      if (r && e > n && e < n + r[0].length) return !0;
                    }
                    return !1;
                  },
                  outputInfo: function(t, e, n) {
                    return (
                      (n = n || t.getProfileName()),
                      {
                        syntax: String(e || t.getSyntax()),
                        profile: n || null,
                        content: String(t.getContent())
                      }
                    );
                  },
                  unindent: function(t, e) {
                    return r.unindentString(e, this.getCurrentLinePadding(t));
                  },
                  getCurrentLinePadding: function(t) {
                    return r.getLinePadding(t.getCurrentLine());
                  },
                  normalize: function(t, e) {
                    e = r.extend(
                      {
                        newline: i.getNewline(),
                        indentation: i.getVariable("indentation")
                      },
                      e
                    );
                    var n = function(t) {
                        return r.repeatString(e.indentation, t.length);
                      },
                      s = r.splitByLines(t);
                    return (
                      "\t" !== e.indentation &&
                        (s = s.map(function(t) {
                          return t.replace(/^\s+/, function(t) {
                            return t.replace(/\t/g, n);
                          });
                        })),
                      s.join(e.newline)
                    );
                  }
                };
              });
            },
            {
              "../assets/resources": "assets\\resources.js",
              "./common": "utils\\common.js"
            }
          ],
          "utils\\math.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                function r(t) {
                  function e() {}
                  return (e.prototype = t), new e();
                }
                var i = 0,
                  s = 1,
                  o = 2,
                  a = 3,
                  c = 4;
                function u(t, e, n, r) {
                  (this.type_ = t),
                    (this.index_ = e || 0),
                    (this.prio_ = n || 0),
                    (this.number_ = void 0 !== r && null !== r ? r : 0),
                    (this.toString = function() {
                      switch (this.type_) {
                        case i:
                          return this.number_;
                        case s:
                        case o:
                        case a:
                          return this.index_;
                        case c:
                          return "CALL";
                        default:
                          return "Invalid Token";
                      }
                    });
                }
                function l(t, e, n, r) {
                  (this.tokens = t),
                    (this.ops1 = e),
                    (this.ops2 = n),
                    (this.functions = r);
                }
                var f = /[\\\'\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
                  p = {
                    "\b": "\\b",
                    "\t": "\\t",
                    "\n": "\\n",
                    "\f": "\\f",
                    "\r": "\\r",
                    "'": "\\'",
                    "\\": "\\\\"
                  };
                function d(t) {
                  return "string" == typeof t
                    ? ((f.lastIndex = 0),
                      f.test(t)
                        ? "'" +
                          t.replace(f, function(t) {
                            var e = p[t];
                            return "string" == typeof e
                              ? e
                              : "\\u" +
                                  ("0000" + t.charCodeAt(0).toString(16)).slice(
                                    -4
                                  );
                          }) +
                          "'"
                        : "'" + t + "'")
                    : t;
                }
                function h(t, e) {
                  return Number(t) + Number(e);
                }
                function m(t, e) {
                  return t - e;
                }
                function g(t, e) {
                  return t * e;
                }
                function b(t, e) {
                  return t / e;
                }
                function v(t, e) {
                  return t % e;
                }
                function x(t, e) {
                  return "" + t + e;
                }
                function y(t) {
                  return -t;
                }
                function w(t) {
                  return Math.random() * (t || 1);
                }
                function j(t) {
                  for (var e = (t = Math.floor(t)); t > 1; ) e *= --t;
                  return e;
                }
                function k(t, e) {
                  return Math.sqrt(t * t + e * e);
                }
                function S(t, e) {
                  return "[object Array]" != Object.prototype.toString.call(t)
                    ? [t, e]
                    : ((t = t.slice()).push(e), t);
                }
                function C() {
                  (this.success = !1),
                    (this.errormsg = ""),
                    (this.expression = ""),
                    (this.pos = 0),
                    (this.tokennumber = 0),
                    (this.tokenprio = 0),
                    (this.tokenindex = 0),
                    (this.tmpprio = 0),
                    (this.ops1 = {
                      sin: Math.sin,
                      cos: Math.cos,
                      tan: Math.tan,
                      asin: Math.asin,
                      acos: Math.acos,
                      atan: Math.atan,
                      sqrt: Math.sqrt,
                      log: Math.log,
                      abs: Math.abs,
                      ceil: Math.ceil,
                      floor: Math.floor,
                      round: Math.round,
                      "-": y,
                      exp: Math.exp
                    }),
                    (this.ops2 = {
                      "+": h,
                      "-": m,
                      "*": g,
                      "/": b,
                      "%": v,
                      "^": Math.pow,
                      ",": S,
                      "||": x
                    }),
                    (this.functions = {
                      random: w,
                      fac: j,
                      min: Math.min,
                      max: Math.max,
                      pyt: k,
                      pow: Math.pow,
                      atan2: Math.atan2
                    }),
                    (this.consts = { E: Math.E, PI: Math.PI });
                }
                (l.prototype = {
                  simplify: function(t) {
                    t = t || {};
                    var e,
                      n,
                      c,
                      f,
                      p = [],
                      d = [],
                      h = this.tokens.length,
                      m = 0;
                    for (m = 0; m < h; m++) {
                      var g = (f = this.tokens[m]).type_;
                      if (g === i) p.push(f);
                      else if (g === a && f.index_ in t)
                        (f = new u(i, 0, 0, t[f.index_])), p.push(f);
                      else if (g === o && p.length > 1)
                        (n = p.pop()),
                          (e = p.pop()),
                          (c = this.ops2[f.index_]),
                          (f = new u(i, 0, 0, c(e.number_, n.number_))),
                          p.push(f);
                      else if (g === s && p.length > 0)
                        (e = p.pop()),
                          (c = this.ops1[f.index_]),
                          (f = new u(i, 0, 0, c(e.number_))),
                          p.push(f);
                      else {
                        for (; p.length > 0; ) d.push(p.shift());
                        d.push(f);
                      }
                    }
                    for (; p.length > 0; ) d.push(p.shift());
                    return new l(
                      d,
                      r(this.ops1),
                      r(this.ops2),
                      r(this.functions)
                    );
                  },
                  substitute: function(t, e) {
                    e instanceof l || (e = new C().parse(String(e)));
                    var n,
                      i = [],
                      s = this.tokens.length,
                      o = 0;
                    for (o = 0; o < s; o++) {
                      var c = (n = this.tokens[o]).type_;
                      if (c === a && n.index_ === t)
                        for (var f = 0; f < e.tokens.length; f++) {
                          var p = e.tokens[f],
                            d = new u(p.type_, p.index_, p.prio_, p.number_);
                          i.push(d);
                        }
                      else i.push(n);
                    }
                    var h = new l(
                      i,
                      r(this.ops1),
                      r(this.ops2),
                      r(this.functions)
                    );
                    return h;
                  },
                  evaluate: function(t) {
                    t = t || {};
                    var e,
                      n,
                      r,
                      u,
                      l = [],
                      f = this.tokens.length,
                      p = 0;
                    for (p = 0; p < f; p++) {
                      var d = (u = this.tokens[p]).type_;
                      if (d === i) l.push(u.number_);
                      else if (d === o)
                        (n = l.pop()),
                          (e = l.pop()),
                          (r = this.ops2[u.index_]),
                          l.push(r(e, n));
                      else if (d === a)
                        if (u.index_ in t) l.push(t[u.index_]);
                        else {
                          if (!(u.index_ in this.functions))
                            throw new Error("undefined variable: " + u.index_);
                          l.push(this.functions[u.index_]);
                        }
                      else if (d === s)
                        (e = l.pop()), (r = this.ops1[u.index_]), l.push(r(e));
                      else {
                        if (d !== c) throw new Error("invalid Expression");
                        if (((e = l.pop()), !(r = l.pop()).apply || !r.call))
                          throw new Error(r + " is not a function");
                        "[object Array]" == Object.prototype.toString.call(e)
                          ? l.push(r.apply(void 0, e))
                          : l.push(r.call(void 0, e));
                      }
                    }
                    if (l.length > 1)
                      throw new Error("invalid Expression (parity)");
                    return l[0];
                  },
                  toString: function(t) {
                    var e,
                      n,
                      r,
                      u,
                      l = [],
                      f = this.tokens.length,
                      p = 0;
                    for (p = 0; p < f; p++) {
                      var h = (u = this.tokens[p]).type_;
                      if (h === i) l.push(d(u.number_));
                      else if (h === o)
                        (n = l.pop()),
                          (e = l.pop()),
                          (r = u.index_),
                          t && "^" == r
                            ? l.push("Math.pow(" + e + "," + n + ")")
                            : l.push("(" + e + r + n + ")");
                      else if (h === a) l.push(u.index_);
                      else if (h === s)
                        (e = l.pop()),
                          "-" === (r = u.index_)
                            ? l.push("(" + r + e + ")")
                            : l.push(r + "(" + e + ")");
                      else {
                        if (h !== c) throw new Error("invalid Expression");
                        (e = l.pop()), (r = l.pop()), l.push(r + "(" + e + ")");
                      }
                    }
                    if (l.length > 1)
                      throw new Error("invalid Expression (parity)");
                    return l[0];
                  },
                  variables: function() {
                    for (
                      var t = this.tokens.length, e = [], n = 0;
                      n < t;
                      n++
                    ) {
                      var r = this.tokens[n];
                      r.type_ === a &&
                        -1 == e.indexOf(r.index_) &&
                        e.push(r.index_);
                    }
                    return e;
                  },
                  toJSFunction: function(t, e) {
                    var n = new Function(
                      t,
                      "with(Parser.values) { return " +
                        this.simplify(e).toString(!0) +
                        "; }"
                    );
                    return n;
                  }
                }),
                  (C.parse = function(t) {
                    return new C().parse(t);
                  }),
                  (C.evaluate = function(t, e) {
                    return C.parse(t).evaluate(e);
                  }),
                  (C.Expression = l),
                  (C.values = {
                    sin: Math.sin,
                    cos: Math.cos,
                    tan: Math.tan,
                    asin: Math.asin,
                    acos: Math.acos,
                    atan: Math.atan,
                    sqrt: Math.sqrt,
                    log: Math.log,
                    abs: Math.abs,
                    ceil: Math.ceil,
                    floor: Math.floor,
                    round: Math.round,
                    random: w,
                    fac: j,
                    exp: Math.exp,
                    min: Math.min,
                    max: Math.max,
                    pyt: k,
                    pow: Math.pow,
                    atan2: Math.atan2,
                    E: Math.E,
                    PI: Math.PI
                  });
                return (
                  (C.prototype = {
                    parse: function(t) {
                      (this.errormsg = ""), (this.success = !0);
                      var e = [],
                        n = [];
                      this.tmpprio = 0;
                      var f = 77,
                        p = 0;
                      for (
                        this.expression = t, this.pos = 0;
                        this.pos < this.expression.length;

                      )
                        if (this.isOperator())
                          this.isSign() && 64 & f
                            ? (this.isNegativeSign() &&
                                ((this.tokenprio = 2),
                                (this.tokenindex = "-"),
                                p++,
                                this.addfunc(n, e, s)),
                              (f = 77))
                            : this.isComment() ||
                              (0 == (2 & f) &&
                                this.error_parsing(
                                  this.pos,
                                  "unexpected operator"
                                ),
                              (p += 2),
                              this.addfunc(n, e, o),
                              (f = 77));
                        else if (this.isNumber()) {
                          0 == (1 & f) &&
                            this.error_parsing(this.pos, "unexpected number");
                          var d = new u(i, 0, 0, this.tokennumber);
                          n.push(d), (f = 50);
                        } else if (this.isString()) {
                          0 == (1 & f) &&
                            this.error_parsing(this.pos, "unexpected string");
                          var d = new u(i, 0, 0, this.tokennumber);
                          n.push(d), (f = 50);
                        } else if (this.isLeftParenth())
                          0 == (8 & f) &&
                            this.error_parsing(this.pos, 'unexpected "("'),
                            128 & f &&
                              ((p += 2),
                              (this.tokenprio = -2),
                              (this.tokenindex = -1),
                              this.addfunc(n, e, c)),
                            (f = 333);
                        else if (this.isRightParenth()) {
                          if (256 & f) {
                            var d = new u(i, 0, 0, []);
                            n.push(d);
                          } else
                            0 == (16 & f) &&
                              this.error_parsing(this.pos, 'unexpected ")"');
                          f = 186;
                        } else if (this.isComma())
                          0 == (32 & f) &&
                            this.error_parsing(this.pos, 'unexpected ","'),
                            this.addfunc(n, e, o),
                            (p += 2),
                            (f = 77);
                        else if (this.isConst()) {
                          0 == (1 & f) &&
                            this.error_parsing(this.pos, "unexpected constant");
                          var h = new u(i, 0, 0, this.tokennumber);
                          n.push(h), (f = 50);
                        } else if (this.isOp2())
                          0 == (4 & f) &&
                            this.error_parsing(this.pos, "unexpected function"),
                            this.addfunc(n, e, o),
                            (p += 2),
                            (f = 8);
                        else if (this.isOp1())
                          0 == (4 & f) &&
                            this.error_parsing(this.pos, "unexpected function"),
                            this.addfunc(n, e, s),
                            p++,
                            (f = 8);
                        else if (this.isVar()) {
                          0 == (1 & f) &&
                            this.error_parsing(this.pos, "unexpected variable");
                          var m = new u(a, this.tokenindex, 0, 0);
                          n.push(m), (f = 186);
                        } else
                          this.isWhite() ||
                            ("" === this.errormsg
                              ? this.error_parsing(
                                  this.pos,
                                  "unknown character"
                                )
                              : this.error_parsing(this.pos, this.errormsg));
                      for (
                        (this.tmpprio < 0 || this.tmpprio >= 10) &&
                        this.error_parsing(this.pos, 'unmatched "()"');
                        e.length > 0;

                      ) {
                        var g = e.pop();
                        n.push(g);
                      }
                      return (
                        p + 1 !== n.length &&
                          this.error_parsing(this.pos, "parity"),
                        new l(n, r(this.ops1), r(this.ops2), r(this.functions))
                      );
                    },
                    evaluate: function(t, e) {
                      return this.parse(t).evaluate(e);
                    },
                    error_parsing: function(t, e) {
                      throw ((this.success = !1),
                      (this.errormsg = "parse error [column " + t + "]: " + e),
                      new Error(this.errormsg));
                    },
                    addfunc: function(t, e, n) {
                      for (
                        var r = new u(
                          n,
                          this.tokenindex,
                          this.tokenprio + this.tmpprio,
                          0
                        );
                        e.length > 0 && r.prio_ <= e[e.length - 1].prio_;

                      )
                        t.push(e.pop());
                      e.push(r);
                    },
                    isNumber: function() {
                      for (
                        var t = !1, e = "";
                        this.pos < this.expression.length;

                      ) {
                        var n = this.expression.charCodeAt(this.pos);
                        if (!((n >= 48 && n <= 57) || 46 === n)) break;
                        (e += this.expression.charAt(this.pos)),
                          this.pos++,
                          (this.tokennumber = parseFloat(e)),
                          (t = !0);
                      }
                      return t;
                    },
                    unescape: function(t, e) {
                      for (var n = [], r = !1, i = 0; i < t.length; i++) {
                        var s = t.charAt(i);
                        if (r) {
                          switch (s) {
                            case "'":
                              n.push("'");
                              break;
                            case "\\":
                              n.push("\\");
                              break;
                            case "/":
                              n.push("/");
                              break;
                            case "b":
                              n.push("\b");
                              break;
                            case "f":
                              n.push("\f");
                              break;
                            case "n":
                              n.push("\n");
                              break;
                            case "r":
                              n.push("\r");
                              break;
                            case "t":
                              n.push("\t");
                              break;
                            case "u":
                              var o = parseInt(t.substring(i + 1, i + 5), 16);
                              n.push(String.fromCharCode(o)), (i += 4);
                              break;
                            default:
                              throw this.error_parsing(
                                e + i,
                                "Illegal escape sequence: '\\" + s + "'"
                              );
                          }
                          r = !1;
                        } else "\\" == s ? (r = !0) : n.push(s);
                      }
                      return n.join("");
                    },
                    isString: function() {
                      var t = !1,
                        e = "",
                        n = this.pos;
                      if (
                        this.pos < this.expression.length &&
                        "'" == this.expression.charAt(this.pos)
                      )
                        for (this.pos++; this.pos < this.expression.length; ) {
                          var r = this.expression.charAt(this.pos);
                          if ("'" == r && "\\" != e.slice(-1)) {
                            this.pos++,
                              (this.tokennumber = this.unescape(e, n)),
                              (t = !0);
                            break;
                          }
                          (e += this.expression.charAt(this.pos)), this.pos++;
                        }
                      return t;
                    },
                    isConst: function() {
                      var t;
                      for (var e in this.consts) {
                        var n = e.length;
                        if (
                          ((t = this.expression.substr(this.pos, n)), e === t)
                        )
                          return (
                            (this.tokennumber = this.consts[e]),
                            (this.pos += n),
                            !0
                          );
                      }
                      return !1;
                    },
                    isOperator: function() {
                      var t = this.expression.charCodeAt(this.pos);
                      if (43 === t)
                        (this.tokenprio = 0), (this.tokenindex = "+");
                      else if (45 === t)
                        (this.tokenprio = 0), (this.tokenindex = "-");
                      else if (124 === t) {
                        if (124 !== this.expression.charCodeAt(this.pos + 1))
                          return !1;
                        this.pos++,
                          (this.tokenprio = 0),
                          (this.tokenindex = "||");
                      } else if (42 === t)
                        (this.tokenprio = 1), (this.tokenindex = "*");
                      else if (47 === t)
                        (this.tokenprio = 2), (this.tokenindex = "/");
                      else if (37 === t)
                        (this.tokenprio = 2), (this.tokenindex = "%");
                      else {
                        if (94 !== t) return !1;
                        (this.tokenprio = 3), (this.tokenindex = "^");
                      }
                      return this.pos++, !0;
                    },
                    isSign: function() {
                      var t = this.expression.charCodeAt(this.pos - 1);
                      return 45 === t || 43 === t;
                    },
                    isPositiveSign: function() {
                      var t = this.expression.charCodeAt(this.pos - 1);
                      return 43 === t;
                    },
                    isNegativeSign: function() {
                      var t = this.expression.charCodeAt(this.pos - 1);
                      return 45 === t;
                    },
                    isLeftParenth: function() {
                      var t = this.expression.charCodeAt(this.pos);
                      return 40 === t && (this.pos++, (this.tmpprio += 10), !0);
                    },
                    isRightParenth: function() {
                      var t = this.expression.charCodeAt(this.pos);
                      return 41 === t && (this.pos++, (this.tmpprio -= 10), !0);
                    },
                    isComma: function() {
                      var t = this.expression.charCodeAt(this.pos);
                      return (
                        44 === t &&
                        (this.pos++,
                        (this.tokenprio = -1),
                        (this.tokenindex = ","),
                        !0)
                      );
                    },
                    isWhite: function() {
                      var t = this.expression.charCodeAt(this.pos);
                      return (
                        (32 === t || 9 === t || 10 === t || 13 === t) &&
                        (this.pos++, !0)
                      );
                    },
                    isOp1: function() {
                      for (
                        var t = "", e = this.pos;
                        e < this.expression.length;
                        e++
                      ) {
                        var n = this.expression.charAt(e);
                        if (
                          n.toUpperCase() === n.toLowerCase() &&
                          (e === this.pos || ("_" != n && (n < "0" || n > "9")))
                        )
                          break;
                        t += n;
                      }
                      return (
                        t.length > 0 &&
                        t in this.ops1 &&
                        ((this.tokenindex = t),
                        (this.tokenprio = 5),
                        (this.pos += t.length),
                        !0)
                      );
                    },
                    isOp2: function() {
                      for (
                        var t = "", e = this.pos;
                        e < this.expression.length;
                        e++
                      ) {
                        var n = this.expression.charAt(e);
                        if (
                          n.toUpperCase() === n.toLowerCase() &&
                          (e === this.pos || ("_" != n && (n < "0" || n > "9")))
                        )
                          break;
                        t += n;
                      }
                      return (
                        t.length > 0 &&
                        t in this.ops2 &&
                        ((this.tokenindex = t),
                        (this.tokenprio = 5),
                        (this.pos += t.length),
                        !0)
                      );
                    },
                    isVar: function() {
                      for (
                        var t = "", e = this.pos;
                        e < this.expression.length;
                        e++
                      ) {
                        var n = this.expression.charAt(e);
                        if (
                          n.toUpperCase() === n.toLowerCase() &&
                          (e === this.pos || ("_" != n && (n < "0" || n > "9")))
                        )
                          break;
                        t += n;
                      }
                      return (
                        t.length > 0 &&
                        ((this.tokenindex = t),
                        (this.tokenprio = 4),
                        (this.pos += t.length),
                        !0)
                      );
                    },
                    isComment: function() {
                      var t = this.expression.charCodeAt(this.pos - 1);
                      return (
                        47 === t &&
                        42 === this.expression.charCodeAt(this.pos) &&
                        ((this.pos =
                          this.expression.indexOf("*/", this.pos) + 2),
                        1 === this.pos && (this.pos = this.expression.length),
                        !0)
                      );
                    }
                  }),
                  C
                );
              });
            },
            {}
          ],
          "utils\\template.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../assets/stringStream"),
                  i = t("./common");
                function s(t) {
                  for (var e = [], n = r(t); !n.eol(); )
                    "," == n.peek() &&
                      (e.push(i.trim(n.current())),
                      n.next(),
                      (n.start = n.pos)),
                      n.next();
                  return (
                    e.push(i.trim(n.current())),
                    e.filter(function(t) {
                      return !!t;
                    })
                  );
                }
                function o(t, e) {
                  if (/^['"]/.test(t))
                    return t.replace(/^(['"])(.+?)\1$/, "$2");
                  if (!isNaN(+t)) return +t;
                  if (t) {
                    for (var n = t.split("."), r = e; n.length; )
                      r = r[n.shift()];
                    return r;
                  }
                }
                function a(t, e) {
                  return t.replace(/<%[=\-](.+?)%>/g, function(t, n) {
                    var a = (function(t) {
                      var e,
                        n = null,
                        i = r(t);
                      for (; !i.eol(); ) {
                        if ("(" == i.peek()) {
                          (n = i.current()),
                            (i.start = i.pos),
                            i.skipToPair("(", ")", !0),
                            (e = s(
                              (e = i.current()).substring(1, e.length - 1)
                            ));
                          break;
                        }
                        i.next();
                      }
                      return n && { name: n, args: e };
                    })((n = i.trim(n)));
                    if (a) {
                      var c = a.args.map(function(t) {
                        return o(t, e);
                      });
                      return e[a.name].apply(e, c);
                    }
                    return o(n, e);
                  });
                }
                return function(t, e) {
                  return e
                    ? a(t, e)
                    : function(e) {
                        return a(t, e);
                      };
                };
              });
            },
            {
              "../assets/stringStream": "assets\\stringStream.js",
              "./common": "utils\\common.js"
            }
          ],
          "vendor\\klass.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                var r = t("../utils/common"),
                  i = function() {};
                return {
                  extend: function(t, e) {
                    var n = (function(t, e, n) {
                      var s;
                      s =
                        e && e.hasOwnProperty("constructor")
                          ? e.constructor
                          : function() {
                              t.apply(this, arguments);
                            };
                      r.extend(s, t),
                        (i.prototype = t.prototype),
                        (s.prototype = new i()),
                        e && r.extend(s.prototype, e);
                      n && r.extend(s, n);
                      return (
                        (s.prototype.constructor = s),
                        (s.__super__ = t.prototype),
                        s
                      );
                    })(this, t, e);
                    return (
                      (n.extend = this.extend),
                      t.hasOwnProperty("toString") &&
                        (n.prototype.toString = t.toString),
                      n
                    );
                  }
                };
              });
            },
            { "../utils/common": "utils\\common.js" }
          ],
          "vendor\\stringScore.js": [
            function(t, e, n) {
              if ("object" == typeof e && "function" != typeof r)
                var r = function(r) {
                  e.exports = r(t, n, e);
                };
              r(function(t, e, n) {
                return {
                  score: function(t, e, n) {
                    if (t == e) return 1;
                    if ("" == e) return 0;
                    for (
                      var r,
                        i,
                        s,
                        o,
                        a,
                        c,
                        u,
                        l,
                        f,
                        p = 0,
                        d = e.length,
                        h = t.length,
                        m = 1,
                        g = 0;
                      g < d;
                      ++g
                    ) {
                      if (
                        ((c = e.charAt(g)),
                        (u = t.indexOf(c.toLowerCase())),
                        (l = t.indexOf(c.toUpperCase())),
                        (f = Math.min(u, l)),
                        -1 === (a = f > -1 ? f : Math.max(u, l)))
                      ) {
                        if (n) {
                          m += 1 - n;
                          continue;
                        }
                        return 0;
                      }
                      (o = 0.1),
                        t[a] === c && (o += 0.1),
                        0 === a
                          ? ((o += 0.6), 0 === g && (r = 1))
                          : " " === t.charAt(a - 1) && (o += 0.8),
                        (t = t.substring(a + 1, h)),
                        (p += o);
                    }
                    return (
                      (s = ((i = p / d) * (d / h) + i) / 2),
                      (s /= m),
                      r && s + 0.15 < 1 && (s += 0.15),
                      s
                    );
                  }
                };
              });
            },
            {}
          ]
        },
        {},
        ["./lib/emmet.js", "./bundles/snippets.js"]
      )("./lib/emmet.js");
    })();
  "object" == typeof exports &&
    "undefined" != typeof module &&
    (module.exports = Uea),
    "function" == typeof define && define.amd && define("emmet", [], Uea),
    "undefined" != typeof window
      ? (Vea = window)
      : "undefined" != typeof global
      ? (Vea = global)
      : "undefined" != typeof self && (Vea = self),
    (Vea.emmet = Uea);
})();
