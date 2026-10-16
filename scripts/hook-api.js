// 智慧树：安装 fetch / XHR 拦截器，缓存关键请求体与响应到 window.__zsk。
// 无参数。返回 'hooked'（本次安装）或 'already'。
const code = String.raw`
window.__zsk = window.__zsk || {req: [], res: []};
if (window.__zskHooked) return 'already';
window.__zskHooked = true;
var KEYS = /taskList|start-pull-paper|openExam|getExamTestUserInfo|getAnswerSheetInformation|getExamQuestionInfo|saveBatchAnswer/;
var of = window.fetch;
window.fetch = function (input, init) {
  try {
    var u = typeof input === 'string' ? input : (input && input.url) || '';
    if (KEYS.test(u)) window.__zsk.req.push({u: String(u), m: (init && init.method) || 'GET', body: (init && typeof init.body === 'string') ? init.body : null, t: Date.now()});
  } catch (e) {}
  var p = of.apply(this, arguments);
  try {
    p.then(function (r) {
      try {
        if (KEYS.test((r && r.url) || '')) r.clone().text().then(function (t) {
          window.__zsk.res.push({u: r.url, s: r.status, t: String(t).slice(0, 4000), ts: Date.now()});
        });
      } catch (e) {}
    });
  } catch (e) {}
  return p;
};
var ox = XMLHttpRequest.prototype.open, os = XMLHttpRequest.prototype.send;
XMLHttpRequest.prototype.open = function (m, u) { this.__u = u; this.__m = m; return ox.apply(this, arguments); };
XMLHttpRequest.prototype.send = function (b) {
  var self = this;
  try { if (KEYS.test(String(self.__u))) window.__zsk.req.push({u: String(self.__u), m: self.__m, body: typeof b === 'string' ? b : null, t: Date.now()}); } catch (e) {}
  self.addEventListener('load', function () {
    try { if (KEYS.test(String(self.__u))) window.__zsk.res.push({u: String(self.__u), s: self.status, t: String(self.responseText).slice(0, 4000), ts: Date.now()}); } catch (e) {}
  });
  return os.apply(this, arguments);
};
return 'hooked';
`;
const raw = await executeInPage(code);
module.exports = {result: raw, ok: raw === 'hooked' || raw === 'already'};
