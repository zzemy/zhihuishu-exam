// 智慧树：点课程页第 N 个任务的「去完成」，从被拦截的 start-pull-paper 响应里取出 paperId。
// args: { index: 0 }
const index = Number((args && args.index) || 0);
const code = String.raw`
var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
window.__zsk = window.__zsk || {req: [], res: []};
var n0 = window.__zsk.res.length;
var items = [].slice.call(document.querySelectorAll('.homework-test-content-item'));
var it = items[${index}];
if (!it) return {ok: false, err: '任务项不存在，当前共 ' + items.length + ' 项'};
var name = (it.innerText || '').replace(/\s+/g, ' ').slice(0, 50);
var cands = [].slice.call(it.querySelectorAll('*')).filter(function (e) {
  return /^(去完成|继续|重做|开始|去作答)$/.test((e.innerText || '').trim()) && e.getBoundingClientRect().width > 0;
});
var btn = cands[cands.length - 1];
if (!btn) return {ok: false, err: '没找到「去完成」按钮', name: name};
btn.click();
await sleep(3500);
var fresh = window.__zsk.res.slice(n0);
var paper = fresh.filter(function (r) { return /start-pull-paper/.test(r.u); }).pop();
var data = null;
try { data = JSON.parse(paper.t).data; } catch (e) {}
return {
  ok: !!data,
  name: name,
  paperId: data && data.paperId,
  examTestId: data && data.examTestId,
  paper: data,
  seen: fresh.map(function (r) { return r.u.split('/gateway/').pop().slice(0, 70); })
};
`;
const raw = await executeInPage(code);
let out = raw;
try { out = JSON.parse(raw); } catch (e) {}
module.exports = out;
