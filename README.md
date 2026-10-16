# zhihuishu-exam

给浏览器助手 Cebian 用的 skill：自动完成智慧树（zhihuishu.com / examloop.zhihuishu.com）课程里的课前、课后作业。

> 仅用于个人学习与自测，请遵守所在课程与平台的学术规范。

## 覆盖流程

1. 从课程页拿作业清单（哪些还没完成）；
2. 开卷（拿到 `paperId` 才进得去答题页）；
3. 逐题作答：单选题点选项，问答题写进 CKEditor；
4. 提交作业，并在确认框点「确定」；
5. 回课程页核对每份作业的成绩。

## 安装

整个目录放进 `~/.cebian/skills/zhihuishu-exam/` 即可：

```bash
git clone https://github.com/zzemy/zhihuishu-exam.git ~/.cebian/skills/zhihuishu-exam
```

## 脚本

| 脚本 | 作用 |
| --- | --- |
| `scripts/hook-api.js` | 挂钩接口，抓 `taskList`（作业清单）等响应 |
| `scripts/list-tasks.js` | 列作业：未完成 / 已完成 + 成绩 |
| `scripts/start-exam.js` | 开卷，拿 `paperId` |
| `scripts/open-exam.js` | 打开答题页（必须带 `?examPaperId=`） |
| `scripts/question.js` | 读当前题：题干、题型、图片、选项 |
| `scripts/pick-option.js` | 点单选题选项 |
| `scripts/fill-essay.js` | 把答案写进 CKEditor |
| `scripts/submit.js` | 提交作业 + 确认 |
| `scripts/verify.js` | 核对已提交作业的成绩 |

## 已经替你踩掉的坑

- 答题页 URL 不带 `?examPaperId=` 会是空白页。
- 没开卷的作业，`taskList` 里 `paperId` 是 `null`——要去课程页点「去完成」，从 `start-pull-paper` 的响应里拿。
- 编辑器是 CKEditor 5：`document.querySelector('#QuestionEssay').ckeditorInstance`，用 `setData(html)` 写入；切到下一题（失焦）时进度才会同步。
- 提交后 AI 判分偶尔整份判错或分数异常，刷新页面即可恢复。
- 提交后应用会把标签页跳回之前看过的某个 exam URL，属正常现象；以课程页「未完成」列表为准。
- 已提交的卷子不要重复提交（页面上的「提交」会拿当前编辑器内容重交一遍）。

完整规则（接口、选择器、examState 语义）见 `SKILL.md`。
