// 智慧树：复现最近一次被捕获的 taskList 请求，返回作业任务列表。
// 无参数。前置：hook-api.js 已装 + 在课程页点过一次「未完成」或「已完成」标签页。
const code = String.raw`
var cap = (window.__zsk && window.__zsk.req) || [];
var last = cap.filter(function (r) { return /task\/taskList/.test(r.u); }).pop();
if (!last) return {captured: false, err: '还没捕获到 taskList 请求：先在课程页点一次「未完成」或「已完成」标签页'};
var rsp = await fetch(last.u, {method: 'POST', credentials: 'include', headers: {'Content-Type': 'application/json'}, body: last.body});
var j = await rsp.json();
var arr = j.data || [];
return {
  captured: true,
  count: arr.length,
  keys: arr[0] ? Object.keys(arr[0]) : [],
  tasks: arr.map(function (d) {
    return {name: d.taskName, taskId: d.taskId, examTestId: d.examTestId, examId: d.examId, examPaperId: d.examPaperId, state: d.examStatus, score: d.score};
  }),
  raw: arr
};
`;
const raw = await executeInPage(code);
let out = raw;
try { out = JSON.parse(raw); } catch (e) {}
module.exports = out;
