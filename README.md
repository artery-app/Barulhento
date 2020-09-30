# Telewire 🛩 🌉

# Telewireの使い方ガイド

## はじめに
これは、TelegramとGitHubを連携して、GitHubからActionsを介してTelegramへと通知を送信する機能を使った、バックエンド？サービスです。

### 留意事項

1. `index.js`にある`require("dotenv").config`から`const bot=new Bot(tgtoken)`までは、理解できない限りは触らないでください。**正常動作をしなくなる可能性があります。**
2. 同様に、`actions.yml`にも理解できない限りは触らないようにお願いします。こちらも、**間違った状態にすると、正常動作をしなくなる恐れがあります。**

## ToC
[Issue/PRの見分け方](#how-to-determine-issue-and-pr)
[イベントについて](#event)
[.github/telegram.ymlについて](#telegram-yml)
[Issue / PRイベント判定後の処理](#event-driven)
[参考](#references)

<h2 name="how-to-determine-issue-and-pr">Issue/PRの見分け方</h2>

一番最初の、`const evresp = (gevent) =>`は、引数gevent(GitHubのtrigger event)を引数として取っており、その引数の中になにが入っているかで分かります。

JSでは、switch/case文が使えるので、今回はそちらを使った例を表示していきます。

```javascript
const evresp = () => {
    switch (gevent) {
        case 'issues':
            return `
                テスト！
                これはTelewireから送られたIssueの通知です。
            `
    }
}
```
このように、`gevent`が`'issues'`である場合に分岐します。returnのあとにある小さい斜めの点は、JSで文字列リテラルと呼ばれる文字を扱うための句です。

<h2 name="event">イベント</h2>

一応[**公式のイベントリスト**](https://docs.github.com/en/free-pro-team@latest/actions/reference/events-that-trigger-workflows#webhook-events)を貼っておきますが、ここのすべてを紹介するのは大変なので、主要なものだけを紹介していきます。

また、これらのイベントは、

- `GITHUB_SHA`もとい`commitId`に**コミットID**(例: `ffac537e6cbbf934b08745a378932722df287a53`)
- `GITHUB_REF`もとい`ref`に**ブランチやタグのRef**(例: `refs/heads/feature-branch-1`)

を共通の値として受け取っています。

---

### イベントリスト

- [issue_comment](https://docs.github.com/en/free-pro-team@latest/actions/reference/events-that-trigger-workflows#issue_comment)
  このイベントは、Issueにコメントが付いた時に呼び出されます。
- [issues](https://docs.github.com/en/free-pro-team@latest/actions/reference/events-that-trigger-workflows#issues)
  このイベントは、Issueが作成された時、編集された時、削除されたとき等に呼び出されます。
- [pull_request](https://docs.github.com/en/free-pro-team@latest/actions/reference/events-that-trigger-workflows#pull_request)
  このイベントは、PRが作成された時、編集された時、削除されたとき等に呼び出されます。
- [pull_request_review_comment](https://docs.github.com/en/free-pro-team@latest/actions/reference/events-that-trigger-workflows#pull_request_review_comment)
  このイベントは、PRにコメントがついた時に呼び出されます。
- [push](https://docs.github.com/en/free-pro-team@latest/actions/reference/events-that-trigger-workflows#push)
  このイベントは、ブランチに関わらず、リポジトリにコードがpushされた際に呼び出されます。


<h2 name="telegram-yml">.github/telegram.ymlについて</h2>

基本的に、`telegram.yml`は各リポジトリで設定します。
例えば、適当なリポジトリ内で、masterブランチのpushイベントを取りたい場合は、

```yml
on:
  push:
    branches:
      - master
```

のように記述することができます。

また、

```yml
on:
  issues:
    types: [opened, reopened]
```

のように、issuesイベントの中でも、作成/再オープンされたときのみ通知するようにすることもできます。

---

他のイベントにも使える値がありますので、そちらは[**イベントタイプリスト**](https://docs.github.com/en/free-pro-team@latest/actions/reference/workflow-syntax-for-github-actions#onevent_nametypes)にてご確認ください。


<h2 name="event-driven">Issue / PRイベント判定後の処理</h2>

この章では、イベント判定後について解説していきます。
例として、今回はissuesイベントを受け取った後を想定して解説します。

ここで前提として、Telegramに

```
Issueが新しくオープンしました！

Issueタイトル: xxxについて
Issue内容: xxxをoooして、nnnしたい場合の処理の実装

Issueを開く
リポジトリを開く
```

のような通知をしたいと思います。
この場合には、

```javascript
case 'issues':
    return `
        Issueが新しくオープンしました！
        
        Issueタイトル: ${issueTitle}
        Issue内容: ${issueBody}

        [Issueを開く](https://github.com/${repo}/issues/${issueNum})
        [リポジトリを開く](https://github.com/${repo}/)
    `
```

このようなコードを書くことができます。
ここで、`index.js`の最初を見てみましょう。

```
    INPUT_STATUS: ipStatus, 
    INPUT_TOKEN: tgToken, // Telegram API Token
    ...
    GITHUB_WORKFLOW: workflowName // Workflowの名前
```

のような記述があります。これらは、通知内容を決める際に非常に有用です。
これらはGitHubから`process.env`を経由して送られ、それをJSで変数として定義し、使えるようにしてくれます。

例えば、上記にあげた例では`issueTitle`を使用していますが、これは`process.env.INPUT_IU_TITLE`を新しい変数に代入した結果、このような短いコードで使えるようになっています。

`index.js`の最初の方に、これらを定義した構文があるので、こちらを参考に通知内容を作ってみてください。また、[**GitHub Actionsでの環境変数**](https://docs.github.com/en/free-pro-team@latest/actions/reference/environment-variables)が公式にまとめられているので、詳しくはこちらをお読みください。


<h2 name="references">参考</h2>

- [GitHub Actionsでの環境変数](https://docs.github.com/en/free-pro-team@latest/actions/reference/environment-variables)
- [Workflow内での、トリガーされるイベントの書き方](https://docs.github.com/en/free-pro-team@latest/actions/reference/events-that-trigger-workflows)
- [Workflowでの構文の書き方](https://docs.github.com/en/free-pro-team@latest/actions/reference/workflow-syntax-for-github-actions)
- [Telewire作成者の記事](https://dev.to/gh-campus-experts/connecting-github-to-telegram-with-github-actions-1pbe)
