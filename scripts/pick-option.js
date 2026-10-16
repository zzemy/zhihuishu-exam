// 智慧树：选当前单选题。args: { letter: "B" }
const letter = String((args && args.letter) || '').trim().toUpperCase();
if (!letter) {
  module.exports = {ok: false, err: '需要 args.letter'};
} else {
  const code = String.raw`
var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
var labels = [].slice.call(document.querySelectorAll('label')).filter(function (l) { return l.getBoundingClientRect().width > 0; });
var target = labels.filter(function (l) { return (l.innerText || '').trim().charAt(0).toUpperCase() === ${JSON.stringify(letter)}; })[0];
if (!target) return {ok: false, err: '没找到选项 ' + ${JSON.stringify(letter)} + '，共 ' + labels.length + ' 个选项'};
target.click();
await sleep(600);
return {
  ok: true,
  picked: (target.innerText || '').trim().charAt(0),
  options: labels.map(function (l) {
    var b = l.querySelector('div');
    return (l.innerText || '').trim().charAt(0) + (b && /bg-mainBg/.test(b.className) ? '(选中)' : '');
  })
};
`;
  const raw = await executeInPage(code);
  let out = raw;
  try { out = JSON.parse(raw); } catch (e) {}
  module.exports = out;
}
