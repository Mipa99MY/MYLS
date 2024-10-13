function loadLyrics(lyricsFile) {
    console.log("Loading lyrics from:", lyricsFile);  // 追加
    fetch(lyricsFile)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.text();
        })
        .then(data => {
            const lyrics = parseSRT(data);
            syncLyricsWithVideo(lyrics);
        })
        .catch(error => {
            console.error('Error loading lyrics:', error);
        });
}

function parseSRT(data) {
    // SRTファイルの内容を解析して、時間と歌詞を取得する処理
    const lines = data.split('\n');
    const regex = /(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/;
    const lyrics = [];
    
    let currentLine = 0;
    while (currentLine < lines.length) {
        // 空行をスキップ
        if (lines[currentLine].trim() === '') {
            currentLine++;
            continue;
        }

        // 時間の行を解析
        if (regex.test(lines[currentLine + 1])) {
            const timeMatch = regex.exec(lines[currentLine + 1]);
            const startTime = parseFloat(timeMatch[1]) * 3600 + parseFloat(timeMatch[2]) * 60 + parseFloat(timeMatch[3]) + parseFloat(timeMatch[4]) / 1000;
            const endTime = parseFloat(timeMatch[5]) * 3600 + parseFloat(timeMatch[6]) * 60 + parseFloat(timeMatch[7]) + parseFloat(timeMatch[8]) / 1000; // 終了時間も取得
            
            // 歌詞を結合して取得
            let text = '';
            currentLine += 2;
            while (lines[currentLine] && lines[currentLine].trim() !== '') {
                text += lines[currentLine] + ' ';
                currentLine++;
            }
            lyrics.push({ startTime, endTime, text: text.trim() }); // 歌詞オブジェクトに開始時間、終了時間を追加
        }
        currentLine++;
    }
    return lyrics;
}

let player; // プレイヤーオブジェクトをグローバルスコープで定義

function syncLyricsWithVideo(lyrics) {
    player = new YT.Player('youtubeVideo', {
        videoId: videoId, // Jekyllの変数から渡されたYouTube動画ID
        events: {
            'onStateChange': function (event) {
                if (event.data == YT.PlayerState.PLAYING) {
                    setInterval(() => {
                        const currentTime = getCurrentTime(); // 現在の再生時間を取得
                        updateLyricsDisplay(currentTime, lyrics);
                    }, 1000);
                }
            }
        }
    });
}

function getCurrentTime() {
    if (player) {
        return player.getCurrentTime(); // 現在の再生時間を取得
    }
    return 0; // プレイヤーがまだ初期化されていない場合
}

// 歌詞の表示関数
function updateLyricsDisplay(currentTime, lyrics) {
    const lyricsContainer = document.getElementById('lyrics'); // 歌詞を表示するコンテナを取得

    // 現在の時間に対応する歌詞を取得
    const currentLyrics = lyrics.filter(lyric => currentTime >= lyric.startTime && currentTime <= lyric.endTime);

    // コンテナをクリア
    lyricsContainer.innerHTML = '';

    if (currentLyrics.length > 0) {
        // 各歌詞行を処理
        currentLyrics.forEach(lyric => {
            // カスタムタグを処理
            let formattedLyric = lyric.text
                .replace(/<aespa>(.*?)<\/aespa>/g, '<span class="aespa">$1</span>') // aespa タグをクラスに変換
                .replace(/<MY>(.*?)<\/MY>/g, '<span class="my">$1</span>') // MY タグをクラスに変換
                .replace(/<with>(.*?)<\/with>/g, '<span class="with">$1</span>'); // with タグをクラスに変換

            // 歌詞をコンテナに追加
            lyricsContainer.innerHTML += `<div>${formattedLyric}</div>`;
        });
    } else {
        lyricsContainer.innerHTML = '<div>（lyrics not found!）</div>';
    }
}

// SRTファイルを読み込んだ後にデータを確認するためにログを出力
console.log(lyrics);  // SRTのデータが正しくパースされているか確認