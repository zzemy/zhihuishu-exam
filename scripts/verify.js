// 智慧树：查该试卷的批阅状态、总分与每题得分。
// 无参数。需在试卷页（或刚访问过该试卷）的标签页执行。
const code = String.raw`
function urlOf(name) {
  var perf = performance.getEntriesByType('resource').map(function (e) { return e.name; }).filter(function (n) { return n.indexOf(name) > -1; });
  if (perf.length) return perf[perf.length - 1];
  var cap = ((window.__zsk && window.__zsk.res) || []).filter(function (r) { return r.u.indexOf(name) > -1; });
  return cap.length ? cap[cap.length - 1].u : null;
}
var out = {url: location.href, exam: null, perQuestion: null};
var u1 = urlOf('getExamTestUserInfo');
if (u1) {
  try {
    var r1 = await fetch(u1, {credentials: 'include'});
    var j = await r1.json();
    out.exam = {examTestId: j.data.examTestId, state: j.data.examState, score: j.data.score, total: j.data.totalScore, submitTime: j.data.submitTime};
  } catch (e) { out.examErr = String(e); }
}
var u2 = urlOf('getAnswerSheetInformation');
if (u2) {
  try {
    var r2 = await fetch(u2, {credentials: 'include'});
    var k = await r2.json();
    var flat = [];
    (k.data.partSheetVos || []).forEach(function (p) {
      (p.questionSheetVos || []).forEach(function (q) { flat.push({id: q.questionId, correct: q.correct, score: q.score}); });
    });
    out.perQuestion = flat;
    out.sum = flat.reduce(function (s, q) { return s + (Number(q.score) || 0); }, 0);
  } catch (e) { out.sheetErr = String(e); }
}
if (!u1 && !u2) out.hint = '本页还没请求过试卷接口：先用 open-exam.js 打开该试卷';
return out;
`;
const raw = await executeInPage(code);
let out = raw;
try { out = JSON.parse(raw); } catch (e) {}
module.exports = out;
