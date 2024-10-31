// JekyllからvideoIdを取得
const videoId = "{{ page.videoId }}"; // フロントマターから取得するYouTubeの動画ID

function loadLyrics(lyricsFile) {
    console.log("loadLyrics function called with file:", lyricsFile);  // 追加
    fetch(lyricsFile)
    .then(response => {
        console.log("Fetch response:", response);  // ファイル取得のレスポンスを確認
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        return response.text();
    })
    .then(data => {
        const lyrics = parseSRT(data);
        console.log("Lyrics loaded:", lyrics);  // ここで正しくパースされた歌詞を確認
        syncLyricsWithVideo(lyrics, videoId); // videoIdをsyncLyricsWithVideoに渡す
    })
    .catch(error => {
        console.error('Error loading lyrics:', error);
    });
}

function parseSRT(data) {
    const lines = data.split('\n');
    const regex = /(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/;
    const lyrics = [];
    
    let currentLine = 0;
    while (currentLine < lines.length) {
        if (lines[currentLine].trim() === '') {
            currentLine++;
            continue;
        }

        if (regex.test(lines[currentLine + 1])) {
            const timeMatch = regex.exec(lines[currentLine + 1]);
            const startTime = parseFloat(timeMatch[1]) * 3600 + parseFloat(timeMatch[2]) * 60 + parseFloat(timeMatch[3]) + parseFloat(timeMatch[4]) / 1000;
            const endTime = parseFloat(timeMatch[5]) * 3600 + parseFloat(timeMatch[6]) * 60 + parseFloat(timeMatch[7]) + parseFloat(timeMatch[8]) / 1000; // 終了時間も取得
            
            let text = '';
            currentLine += 2;
            while (lines[currentLine] && lines[currentLine].trim() !== '') {
                text += lines[currentLine] + ' ';
                currentLine++;
            }
            lyrics.push({ startTime, endTime, text: text.trim() });
        }
        currentLine++;
    }
    return lyrics;
}

let player; // プレイヤーオブジェクトをグローバルスコープで定義

function syncLyricsWithVideo(lyrics, videoId) { // videoIdを受け取るように変更
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
        currentLyrics.forEach(lyric => {
            let formattedLyric = lyric.text
                .replace(/<aespa>(.*?)<\/aespa>/g, '<span class="aespa">$1</span>') // aespa タグをクラスに変換
                .replace(/<MY>(.*?)<\/MY>/g, '<span class="my">$1</span>') // MY タグをクラスに変換
                .replace(/<with>(.*?)<\/with>/g, '<span class="with">$1</span>'); // with タグをクラスに変換

            lyricsContainer.innerHTML += `<div>${formattedLyric}</div>`;
        });
    } else {
        lyricsContainer.innerHTML = '<div>（lyrics not found!）</div>';
    }
}