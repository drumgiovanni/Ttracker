# 使い方
本アプリはタスクを２段階の抽象度に分け、管理をします。
ここでは、より抽象度の高いタスクを「チケット」、抽象度の低いタスクを「タスク」と呼び分けます。

## チケット追加
アプリを起動すると以下のような画面が表示されます。

![topPage](https://github.com/drumgiovanni/Ttracker/blob/master/assets/top.png)

右下の＋を押し、チケット情報を入れることでチケットを追加することができます。

![registerTicket](https://github.com/drumgiovanni/Ttracker/blob/master/assets/ticket.png)

このとき、予定工数は時間単位での入力になるので、注意してください。
チケット情報を入力し、Registerを押すと、チケットが作成されます。

## タスク追加
チケットをクリックすると以下のような画面が表示されます。

![task](https://github.com/drumgiovanni/Ttracker/blob/master/assets/task.png)

右下の＋を押し、タスク情報を入れることでタスクを追加することができます。

![registerTask](https://github.com/drumgiovanni/Ttracker/blob/master/assets/Rtask.png)

このとき、予定工数は時間単位での入力になるので、注意してください。

これでタスクを遂行するまでの準備が整いました！

## 時間計測
タスクを遂行する際に時間を計測することで実工数を正確に計測できます。
記録ボタンを押すことで、計測した時間を保存することができます。
※記録ボタンを押す前に、別ページへ移動したり、タスクを追加すると計測時間がリセットされてしますので、注意してください。

![time](https://github.com/drumgiovanni/Ttracker/blob/master/assets/timer.gif)

タスクが完了したら、完了スイッチを押してください。
そうすることで、チケットの進捗率が更新されます。

## 振り返り
タスクを遂行した後は振り返りも大切です。
左上のメニューアイコンをクリックし、振り返りページへのリンクをクリックしましょう。

![nav](https://github.com/drumgiovanni/Ttracker/blob/master/assets/nav.png)

振り返りページでは、チケット単位・タグ単位で予定工数と実工数のグラフを表示することができます。
また、タスク一覧がグラフ下に表示されます。
**どのチケットでどれだけの遅延があり、その遅延がどのタスクの影響によるものなのかが、一目でわかるようになっています。**

![report](https://github.com/drumgiovanni/Ttracker/blob/master/assets/report.gif)

さらに、左上の日次・週次レポート出力ボタンを押すことで簡単に日次・週次のレポートを出力することができます。
出力されるレポートはマークダウン形式で、エディタ等で簡単にプレビューができます

![preview](https://github.com/drumgiovanni/Ttracker/blob/master/assets/Drepo.gif)


## アーカイブ
長期間このアプリを使用していると、すでに終了しているチケットが溜まってきます。
チケットのアーカイブボタンを押すことで、簡単にチケットページからチケットを削除することができます。

アーカイブしたチケットは、アーカイブページから確認することができます。

