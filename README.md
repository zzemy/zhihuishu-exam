# zhihuishu-exam

智慧树（zhihuishu.com / examloop.zhihuishu.com）课程中课前、课后作业的自动化作答工具，以 skill 包形式提供：`SKILL.md` 写规则，`scripts/` 放脚本。

## 免责声明

本项目是浏览器自动化方向的个人练习与学习记录，仅适合用于自学、复习自测与前端技术研究。

把它用于任何计入成绩的作业、测验或考试，通常违反所在学校与课程的学术规范，也可能违反平台的服务条款。请在使用前确认自己的行为是否被允许；由此产生的一切后果由使用者自行承担，作者不对任何滥用行为负责。

## 流程

1. 读取课程页的作业清单，确定哪些尚未完成；
2. 开卷：点「去完成」触发 `start-pull-paper` 请求，从响应里取 `paperId`；
3. 逐题作答：单选题点选项，问答题写进 CKEditor；
4. 提交作业，并在确认弹窗点「确定」；
5. 回课程页核对每份作业的成绩。

## 安装

仓库结构本身就是一个完整的 skill 包（顶层 `SKILL.md` + `scripts/`）。把它整个放进宿主运行的 skills 目录，目录名保持 `zhihuishu-exam` 即可：

```bash
git clone https://github.com/zzemy/zhihuishu-exam.git
```

## 脚本

| 脚本 | 参数 | 作用 |
| --- | --- | --- |
| `scripts/hook-api.js` | 无 | 安装 fetch / XHR 拦截器，缓存关键请求体与响应到 `window.__zsk` |
| `scripts/list-tasks.js` | 无 | 复现最近一次被捕获的 `taskList` 请求，返回作业任务列表 |
| `scripts/start-exam.js` | `{ index }` | 点课程页第 index 个任务的「去完成」，取回 `paperId` |
| `scripts/open-exam.js` | `{ examTestId, examId, paperId, courseId }` | 导航到答题页 |
| `scripts/question.js` | 无 | 读取当前题目：题号、题型、题目图片、选项、进度、导航按钮文案 |
| `scripts/pick-option.js` | `{ letter }` | 选中当前单选题的某个选项 |
| `scripts/fill-essay.js` | `{ html }` 或 `{ text }`（后者自动转段落） | 把答案写入 CKEditor |
| `scripts/submit.js` | `{ force }`，默认要求答题进度 100% | 提交作业并确认 |
| `scripts/verify.js` | 无 | 查询该试卷的批阅状态、总分与每题得分 |

## 实现说明

- 答题页 URL 必须带 `?examPaperId=`，否则是空白页。
- 未开卷的作业在任务列表里 `paperId` 为 `null`，需要先在课程页点「去完成」，从 `start-pull-paper` 的响应中获取。
- 编辑器是 CKEditor 5：通过 `document.querySelector('#QuestionEssay').ckeditorInstance` 取实例，用 `setData(html)` 写入；切换到下一题（失焦）时进度才会同步。
- 提交后页面会跳回上一个试卷的 URL，判断是否提交成功应以任务列表为准。
- 评分聚合可能滞后（AI 首轮判分后总分未及时重算），稍候或刷新通常可恢复；重复提交没有意义，提交只作用于当前已加载的题目。
- 题目正文是图片时，需对相应 `<img>` 截图后视觉读题。

更完整的规则（接口、选择器、`examState` 语义）见 `SKILL.md`。
