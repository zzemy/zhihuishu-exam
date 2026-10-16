// 智慧树：读取当前题目信息（题号/题型、题目图片 URL、选项、进度、导航按钮文案）。
// 无参数。拿到 images 后用 screenshot(selector="img[src=\"<图片URL>\"]") 读题。
const code = String.raw`
var txt = document.body.innerText.replace(/\s+/g, ' ');
var imgs = [].slice.call(document.querySelectorAll('img')).filter(function (i) {
  return (i.src || '').indexOf('ai-createknowledge-h5') > -1 && i.getBoundingClientRect().width > 100;
});
var nav = [].slice.call(document.querySelectorAll('#app > div > main > div:nth-of-type(1) > div:nth-of-type(2) > div > button')).map(function (b) {
  return {text: (b.innerText || '').trim(), disabled: !!b.disabled};
});
var opts = [].slice.call(document.querySelectorAll('label')).filter(function (l) {
  return l.getBoundingClientRect().width > 0;
}).map(function (l, i) {
  var badge = l.querySelector('div');
  return {n: i + 1, letter: (l.innerText || '').trim().slice(0, 1), selected: !!badge && /bg-mainBg/.test(badge.className)};
});
var ed = document.querySelector('#QuestionEssay');
return {
  head: (txt.match(/[一二三四]、[问单]选题\s*\d+、/) || [])[0] || null,
  type: /问答题/.test(txt) ? 'essay' : (/单选题/.test(txt) ? 'single' : null),
  images: imgs.map(function (i) { return i.src; }),
  options: opts,
  nav: nav,
  progress: (txt.match(/答题进度：\s*\d+%/) || [])[0] || null,
  editorLen: ed && ed.ckeditorInstance ? ed.ckeditorInstance.getData().length : null
};
`;
const raw = await executeInPage(code);
let out = raw;
try { out = JSON.parse(raw); } catch (e) {}
module.exports = out;
