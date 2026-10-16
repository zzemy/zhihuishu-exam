---
name: zhihuishu-exam
description: 智慧树（zhihuishu.com / examloop.zhihuishu.com）课前·课后作业的自动作答与提交。当用户在智慧树课程页要求「完成/提交作业」「把未完成的做完」时使用。
version: 1.0.0
metadata:
  permissions:
    - page.executeJs
---

# 智慧树作业自动作答与提交

> 免责声明：本项目仅供个人学习、复习与技术研究使用；用于计入成绩的作业或考试通常违反学术规范，由此产生的一切后果由使用者自负。

把「课程页拿任务 → 开试卷 → 逐题作答 → 提交 → 核对成绩」这条链路固化下来。题目正文是**图片**，所以读题必须走 `screenshot`（视觉），脚本只负责机械动作。

## 0. 前提

- 需要一个**已登录**的智慧树课程页标签页（URL 形如 `https://h5.zhihuishu.com/...` 或课程「学习」页），页面上有作业列表（`.homework-test-content-item`）。
- 另一个标签页专门用来跑试卷（`examloop.zhihuishu.com`）：脚本用 `location.href` 直接导航，不依赖「去完成」按钮打开新页签。
- 所有脚本都通过 `run_skill` 调用，需要 `tabId`。

## 1. 安装拦截器（一次即可）

```
run_skill skill=zhihuishu-exam script=scripts/hook-api.js tabId=<课程页tab>
```

拦截 fetch/XHR，缓存 `taskList` / `start-pull-paper` / `openExam` / 试卷相关接口的请求体与响应到 `window.__zsk`。

然后**手动点一次「未完成」或「已完成」标签页**（或用 `interact` 点），让 `taskList` 请求被捕获——请求体里的 `secretStr` 决定是哪个过滤条件。

## 2. 取任务列表

```
run_skill skill=zhihuishu-exam script=scripts/list-tasks.js tabId=<课程页tab>
```

返回最近一次 `taskList` 的原始 `data` 数组（含 `taskName`、`examStatus`、`score`、试卷 id 等）。`examStatus`：`4`=已提交待批、`6`=已批阅。

## 3. 打开试卷

两种方式，任选：

- `scripts/start-exam.js`（`args={index:0}`）：点课程页第 N 个任务的「去完成」，并从被拦截的 `start-pull-paper` 响应里取出 **`paperId`**——`taskList` 里未开始的考试 `paperId` 是 `null`，只有这一步能拿到。
- `scripts/open-exam.js`（`args={examTestId, examId, paperId, courseId}`）：直接导航。

URL 格式（**`examPaperId` 查询参数必须带上，否则页面空白无题**）：

```
https://examloop.zhihuishu.com/exam/{examTestId}/{courseId}/1/{examId}?examPaperId={paperId}
```

## 4. 逐题作答循环

1. `scripts/question.js` → 当前题的题号/题型/**题目图片 URL**/选项/进度/导航按钮文案。
2. 用 `screenshot(selector="img[src=\"<题目图URL>\"]")` 读题（过滤条件：`src` 含 `ai-createknowledge-h5` 且宽度 > 100）。
3. 问答题：`scripts/fill-essay.js`，`args={html:"<p>…</p>"}`（内部走 CKEditor `setData`）。
4. 单选题：`scripts/pick-option.js`，`args={letter:"B"}`。
5. 用真按钮切题（`interact` 点 `…button:nth-of-type(2)` = 下一题）：**进度只在切题时同步**，所以填完必须切走再切回，`question.js` 里确认「答题进度：100%」。

⚠️ **最后一题时 `button:nth-of-type(2)` 会变成「提交」**——点之前一定先用 `question.js` 看按钮文案。

## 5. 提交

```
run_skill skill=zhihuishu-exam script=scripts/submit.js tabId=<试卷tab>
```

点「提交作业」→ 等弹窗 → 点「确定」。返回 `{ok:true}` 即已提交。

## 6. 核对

```
run_skill skill=zhihuishu-exam script=scripts/verify.js tabId=<试卷tab或课程页tab>
```

返回 `examState`、总分、以及答题卡的**每题得分**。`examState`: `4`=待批、`6`=已批阅。
最后再回课程页点一次「未完成」标签页，用 `list-tasks.js` 确认该作业已从列表消失。

## 关键接口速查

| 接口 | 说明 |
|---|---|
| `POST https://kg-run-student.zhihuishu.com/student/gateway/t/task/taskList` | body `{"secretStr":"…","date":<ts>}`，JSON，带 cookie |
| `POST https://kg-ai-run.zhihuishu.com/run/gateway/t/task/exam/start-pull-paper` | 返回 `data.paperId` |
| `POST https://studentexamtest.zhihuishu.com/gateway/t/v1/exam/user/openExam` | 表单编码，返回 `data:true` |
| `…/v1/exam/user/getExamTestUserInfo` | `examState` / `score` / `totalScore` |
| `…/v1/exam/user/getAnswerSheetInformation` | `partSheetVos[].questionSheetVos[].{correct,score}` 每题得分 |
| `…/v1/question/getExamQuestionInfo` | 试题内容、`userAnswerVo`、`analysisVo` |

## 页面选择器速查

课程页：

- 已完成标签：`#app > div:nth-of-type(2) > div:nth-of-type(5) > div > div > div:nth-of-type(3) > div:nth-of-type(1) > div:nth-of-type(2) > div:nth-of-type(2)`
- 未完成标签：同上，末尾 `div:nth-of-type(1)`
- 任务项文本：`.homework-test-content-item`

试卷页：

- 作答框（CKEditor5）：`#QuestionEssay`，实例 `document.querySelector('#QuestionEssay').ckeditorInstance`
- 上一题/下一题（末题会变「提交」）：`#app > div > main > div:nth-of-type(1) > div:nth-of-type(2) > div > button:nth-of-type(1|2)`
- 提交作业（顶部）：`#app > div > header > div:nth-of-type(2) > button:nth-of-type(2)`
- 单选题选项：`#app > div > main > div:nth-of-type(1) > div:nth-of-type(1) > div:nth-of-type(3) > div:nth-of-type(4) > label:nth-of-type(N)`，选中态 = 子 `div` 的 class 含 `bg-mainBg`
- 确认弹窗「确定」：文案为「确定」且可见的最后一个 `div/button`

选择器会随版本变，优先用 `inspect` 重新发现，不要硬套。

## 实现要点

- **题目正文是图片**：`read_page` 取不到文字，需对相应 `<img>` 截图后视觉读题。
- **进度条不同步实时状态**：仅在切换题目时更新，填写过程中可能一直停在 0% / 50%。
- **提交后页面会跳回上一个试卷的 URL**：不要以 URL 判断提交是否成功，应以任务列表为准。
- **评分聚合可能滞后**：出现过答题卡三题均为 `score=5.00`、而作业总分只记 10.25 的情况（AI 首轮判分后总分未重算）。稍候或刷新通常可恢复；重复提交没有意义（提交只作用于当前已加载的题目）。
- **「去完成」按钮通常不会打开新标签页**：但点击会触发 `start-pull-paper` 请求，从响应中取 `paperId` 即可。
- **作答风格**：以学生的口吻写成连贯段落，不使用小标题、编号列表、加粗或「解法一 / 解法二 / 注：」这类模板化结构；数学式用 `e<sup>x2</sup>` 这样的简单上标即可。

## 维护说明

- 脚本用 `module.exports = <值>` 返回结果，内部可以使用顶层 `await`。
- `executeInPage(code)` 会把 `code` 包进 **async 函数体**执行：注入代码必须用**顶层 `return`** 返回值；写成 `(() => { return x })()` 这类 IIFE 只会得到 `(no return value)`。
- `executeInPage` 的返回值是**字符串**（对象被 JSON 序列化），脚本内统一 `let out = raw; try { out = JSON.parse(raw); } catch (e) {}`。
- 注入代码中的反斜杠用 `String.raw` 模板字符串书写，避免被模板字面量转义。
- 权限需写在 SKILL.md front matter 的 `metadata.permissions` 下（`page.executeJs` 才会提供 `executeInPage`）；写在外层 `permissions:` 不生效。
- 脚本保持幂等：重复执行 `hook-api.js` 返回 `already` 属正常现象。
