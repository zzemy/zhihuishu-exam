// 智慧树：直接导航到试卷页（examPaperId 必须带上，否则页面空白无题）。
// args: { examTestId, examId, paperId, courseId }
const a = args || {};
if (!a.examTestId || !a.examId || !a.paperId || !a.courseId) {
  module.exports = {ok: false, err: '需要 examTestId / examId / paperId / courseId'};
} else {
  const url = 'https://examloop.zhihuishu.com/exam/' + a.examTestId + '/' + a.courseId + '/1/' + a.examId + '?examPaperId=' + a.paperId;
  const code = String.raw`
location.href = ${JSON.stringify(url)};
await new Promise(function (r) { setTimeout(r, 4500); });
var t = document.body.innerText.replace(/\s+/g, ' ');
return {url: location.href, hasQuestions: /答题卡|问答题|单选题/.test(t), head: t.slice(0, 200)};
`;
  const raw = await executeInPage(code);
  let out = raw;
  try { out = JSON.parse(raw); } catch (e) {}
  module.exports = out;
}
