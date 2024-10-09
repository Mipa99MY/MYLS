function loadLyrics(lyricsFile) {
    fetch(`/srt/${lyricsFile}`)
        .then(response => response.text())
        .then(data => {
            const lyrics = parseSRT(data);
            syncLyricsWithVideo(lyrics);
        });
}

function parseSRT(data) {
    // SRTファイルの内容を解析して、時間と歌詞を取得する処理
}

function syncLyricsWithVideo(lyrics) {
    const player = new YT.Player('youtubeVideo', {
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
    // 動画の現在の再生時間に合わせて歌詞を表示する処理
}