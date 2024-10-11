function loadLyrics(lyricsFile) {
    console.log("Loading lyrics from:", lyricsFile);  // 追加
    fetch(`/srt/${lyricsFile}`)
        .then(response => response.text())
        .then(data => {
            const lyrics = parseSRT(data);
            syncLyricsWithVideo(lyrics);
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
            
            // 歌詞を結合して取得
            let text = '';
            currentLine += 2;
            while (lines[currentLine] && lines[currentLine].trim() !== '') {
                text += lines[currentLine] + ' ';
                currentLine++;
            }
            lyrics.push({ time: startTime, text: text.trim() });
        }
        currentLine++;
    }
    return lyrics;
}

function syncLyricsWithVideo(lyrics) {
    const player = new YT.Player('youtubeVideo', {
        videoId: videoId, // Jekyllの変数から渡されたYouTube動画ID
        events: {
            'onStateChange': function (event) {
                if (event.data == YT.PlayerState.PLAYING) {
                    setInterval(() => {
                        const currentTime = player.getCurrentTime();
                        updateLyricsDisplay(currentTime, lyrics);
                    }, 1000);
                }
            }
        }
    });
}

function updateLyricsDisplay(currentTime, lyrics) {
    const lyricsContainer = document.getElementById('lyrics'); // 歌詞を表示するコンテナを取得

    // 現在の時間に対応する歌詞を取得
    const currentLyrics = lyrics.filter(lyric => currentTime >= lyric.startTime && currentTime <= lyric.endTime);

    // コンテナをクリア
    lyricsContainer.innerHTML = '';

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
}
