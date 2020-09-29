require("dotenv").config
const Bot=require('node-telegram-bot-api');
const {
    INPUT_STATUS: ipStatus, 
    INPUT_TOKEN: tgToken, // Telegram API Token
    INPUT_CHAT: chatid,// Telegram Chat ID
    INPUT_IU_TITLE: issueTitle, // Issueタイトル
    INPUT_IU_NUM: issueNum,// Issueの番号
    INPUT_IU_ACTOR: issueActor, // Issueが誰に作られたか
    INPUT_IU_BODY: issueBody, // Issue本文
    INPUT_PR_NUM: prNum, // PRの番号
    INPUT_PR_STATE: prState, // PRのオープン/再オープン/クローズ状態
    INPUT_PR_TITLE: prTitle, // PRタイトル
    INPUT_PR_BODY: prBody, // PR本文
    GITHUB_EVENT_NAME: ghEvent, // トリガーイベントの名前
    GITHUB_REPOSITORY: repo, // トリガーイベントが作成されたリポジトリ
    GITHUB_ACTOR: ghActor, // 誰がこのアクションをトリガーしたか
    GITHUB_SHA: commitId, // コミットID
    GITHUB_REF: ref, // ブランチ/タグのRef
    GITHUB_WORKFLOW: workflowName // Workflowの名前
} = process.env;

const bot = new Bot(tgToken)

const evresp = (gevent) => {
    switch (gevent) {

        case "issues":
            return `
❗️❗️❗️❗️❗️❗️
        
Issue ${prState}

Issue Title and Number  : ${issueTitle} | #${issueNum}

Commented or Created By : \`${issueActor}\`

Issue Body : *${issueBody}*

[Link to Issue](https://github.com/${repo}/issues/${issueNum})
[Link to Repo ](https://github.com/${repo}/)
[Build log here](https://github.com/${repo}/commit/${commitId}/checks)`


        case "issue_comment":
            return `
🗣🗣🗣Issueにコメントが付きました🗣🗣🗣

Issue : ${issueTitle} | #${issueNum}

コメント内容: \`${process.env.INPUT_IU_COM}\`

\`${issueActor}\` がコメントしました
[Issueを開く](https://github.com/${repo}/issues/${issueNum})
[Repositoryを開く](https://github.com/${repo}/)
[Build logを開く](https://github.com/${repo}/commit/${commitId}/checks)
            `
        case "pull_request":
            return `
🔃🔀🔃🔀🔃🔀
PR ${prState} 
        
PR Number:      ${prNum}
        
PR Title:       ${prTitle}
        
PR Body:        *${prBody}*
        
PR By:          ${ghActor}
        
[Link to Issue](https://github.com/${repo}/pull/${prNum})
[Link to Repo ](https://github.com/${repo}/)
[Build log here](https://github.com/${repo}/commit/${commitId}/checks)`


        case "watch":
            return `
⭐️⭐️⭐️

By:            *${ghActor}* 
        
\`Repository:  ${repo}\` 
        
Star Count      ${process.env.INPUT_STARGAZERS}
        
Fork Count      ${process.env.INPUT_FORKERS}
        
[Link to Repo ](https://github.com/${repo}/)`


        case "schedule":
            return `
⏱⏰⏱⏰⏱⏰
        
ID: ${workflowName}
        
Run *${ipStatus}!*
        
*Action was Run on Schedule*
        
\`Repository:  ${repo}\` 
        
[Link to Repo ](https://github.com/${repo}/)
            `
        default:
            return `
⬆️⇅⬆️⇅
            
ID: ${ghwrkflw}
        
Action was a *${ipStatus}!*
        
\`Repository:  ${repo}\` 
        
On:          *${ghEvent}*
        
By:            *${ghActor}* 
        
Tag:        ${process.env.GITHUB_REF}
        
[Link to Repo ](https://github.com/${repo}/)`
    }
}

const output = evresp(ghevent)
bot.sendMessage(chatid, output, { parse_mode : "Markdown" })
