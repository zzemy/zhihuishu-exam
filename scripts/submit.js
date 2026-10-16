// 智慧树：提交当前试卷（「提交作业」→ 弹窗「确定」）。
// args: { force: false } —— 默认要求答题进度 100%，force=true 跳过检查。
const force = !!(args && args.force);
const code = String.raw`
var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
var txt = document.body.innerText.replace(/\s+/g, ' ');
var prog = (txt.match(/答题进度：\s*(\d+)%/) || [])[1] || null;
if (!${JSON.stringify(force)} && prog !== '100') {
  return {ok: false, err: '答题进度不是 100%（当前 ' + (prog || '未知') + '%），先切题同步进度再提交', progress: prog};
}
var sub = [].slice.call(document.querySelectorAll('#app > div > header button')).filter(function (b) {
  return /提交作业/.test(b.innerText || '') && b.getBoundingClientRect().width > 0;
})[0];
if (!sub) return {ok: false, err: '没找到顶部的「提交作业」按钮'};
sub.click();
await sleep(1500);
var conf = [].slice.call(document.querySelectorAll('div,button')).filter(function (e) {
  return (e.innerText || '').trim() === '确定' && e.getBoundingClientRect().width > 0;
});
var target = conf[conf.length - 1];
if (!target) return {ok: false, err: '没出现确认弹窗（确定按钮）'};
target.click();
await sleep(3500);
return {ok: true, url: location.href, preview: document.body.innerText.replace(/\s+/g, ' ').slice(0, 120)};
`;
const raw = await executeInPage(code);
let out = raw;
try { out = JSON.parse(raw); } catch (e) {}
module.exports = out;
