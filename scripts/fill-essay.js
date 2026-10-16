// 智慧树：填当前问答题。
// args: { html: "<p>…</p>" } 或 { text: "段落1\n\n段落2" }（后者自动转 <p>）
// 走 CKEditor5 实例的 setData；直接改 DOM 不会同步到答题状态。
const a = args || {};
let payload = a.html;
if (!payload && a.text) {
  payload = String(a.text).split(/\n\s*\n/).map(p => '<p>' + p.replace(/\n/g, '<br>') + '</p>').join('');
}
if (!payload) {
  module.exports = {ok: false, err: '需要 args.html 或 args.text'};
} else {
  const code = String.raw`
var el = document.querySelector('#QuestionEssay');
var ed = el && el.ckeditorInstance;
if (!ed) return {ok: false, err: '没找到 #QuestionEssay 的 CKEditor 实例'};
ed.setData(${JSON.stringify(payload)});
return {ok: true, len: ed.getData().length, preview: ed.getData().slice(0, 80)};
`;
  const raw = await executeInPage(code);
  let out = raw;
  try { out = JSON.parse(raw); } catch (e) {}
  module.exports = out;
}
