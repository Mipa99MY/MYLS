【songs.json】
- 曲の情報を格納するJSONファイル。
id: 曲の固有ID（数字など）
title: 曲のタイトル
videoId: YouTube動画のID
srtFile: .srtファイルへのパス

【songs.js】
歌詞や曲データ、YouTube動画の読み込み、SRTファイルの処理など、
曲ページに関するデータの取得や動的表示を担当。

【scripts.js】
主にサイト全体のインターフェース（メニューの表示など）に関するJavaScriptを記述するファイル。
タグを使った歌詞の処理は、曲データに関連する機能の一部なので、songs.jsに記述。