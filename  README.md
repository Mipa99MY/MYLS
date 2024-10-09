
JekyllのHTMLファイル（各曲のhtml）
曲ごとにHTMLファイルを作成し、フロントマターで必要な情報を設定する。
---
layout: song
title: Song Title
videoId: ABC12345XYZ  # YouTube動画のIDを入力
lyricsFile: song_lyrics.srt  # 歌詞のSRTファイル名を入力
---
このように書くことで、Jekyllのテンプレート機能を使って、曲ごとに異なるデータ（title、videoId、lyricsFileなど）を簡単に管理できる。

【songs.js】
歌詞や曲データ、YouTube動画の読み込み、SRTファイルの処理など、
曲ページに関するデータの取得や動的表示を担当。

【scripts.js】
主にサイト全体のインターフェース（メニューの表示など）に関するJavaScriptを記述するファイル。
タグを使った歌詞の処理は、曲データに関連する機能の一部なので、songs.jsに記述。
