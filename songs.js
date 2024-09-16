// JSONファイルから曲データを取得する関数
function loadSongsData() {
    return fetch('songs.json')
        .then(response => response.json())
        .then(data => {
            console.log('取得した曲データ:', data); // デバッグ用
            return data.songs;
        });
}

// URLから曲IDを抽出する関数
function getSongIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('songId');
}

// 曲IDに基づいて曲情報をページに表示する関数
function loadSong(songId) {
    loadSongsData().then(songs => {
        const songData = songs.find(song => song.id === songId);
        if (songData) {
            document.getElementById('songTitle').innerText = songData.title;
            loadYouTubeVideo(songData.videoId);
            loadSRTFile(songData.srtFile);
        } else {
            console.error('曲が見つかりません');
        }
    });
}

// YouTube APIを使ってYouTube動画を表示するiframeを作成、ページに埋め込む関数
function loadYouTubeVideo(videoId) {
    const videoContainer = document.getElementById('youtubeVideo');
    videoContainer.innerHTML = ''; // 既存のコンテンツをクリア
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${videoId}`;
    iframe.width = "560";
    iframe.height = "315";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    videoContainer.appendChild(iframe);
}

// SRTファイルを読み込み、歌詞を表示し、動画と同期させる関数
function loadSRTFile(srtFile) {
    fetch(srtFile)
        .then(response => response.text())
        .then(data => {
            console.log('SRTファイルの内容:', data); // デバッグ用
            const lyricsArray = parseSRT(data);
            console.log('解析された歌詞:', lyricsArray); // デバッグ用
            displayLyrics(lyricsArray);
            syncLyricsWithVideo(lyricsArray);
        })
        .catch(error => console.error('SRTファイルの読み込みエラー:', error));
}


// SRTファイルを解析してタイムスタンプと歌詞を分離する関数
function parseSRT(data) {
    const lines = data.split('\n');
    const regex = /(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> (\d{2}):(\d{2}):(\d{2}),(\d{3})/;
    let lyrics = [];
    let currentLyric = {};
    let inLyrics = false;

    lines.forEach(line => {
        if (regex.test(line)) {
            // タイムスタンプを取得
            const timeParts = line.match(regex);
            currentLyric.startTime = parseInt(timeParts[1]) * 3600 + parseInt(timeParts[2]) * 60 + parseInt(timeParts[3]);
            currentLyric.endTime = parseInt(timeParts[5]) * 3600 + parseInt(timeParts[6]) * 60 + parseInt(timeParts[7]);
            inLyrics = true;
        } else if (line.trim() !== '' && inLyrics) {
            // 歌詞を取得
            if (!currentLyric.text) {
                currentLyric.text = line.trim();
            } else {
                currentLyric.text += '<br>' + line.trim(); // 複数行の歌詞対応
            }
        } else if (line.trim() === '' && inLyrics) {
            lyrics.push(currentLyric);
            currentLyric = {};
            inLyrics = false;
        }
    });

    if (currentLyric.text) {
        lyrics.push(currentLyric); // 最後の歌詞を追加
    }

    return lyrics;
}

// タグ付き歌詞のHTML形式に変換する関数
function formatLyricsWithTags(lyrics) {
    return lyrics
        .map(lyric => lyric
            .replace(/<aespa>(.*?)<\/aespa>/g, '<span class="aespa">$1</span>')
            .replace(/<MY>(.*?)<\/MY>/g, '<span class="MY">$1</span>')
            .replace(/<with>(.*?)<\/with>/g, '<span class="with">$1</span>')
        )
        .join('<br>'); // 行を改行で区切る
}

// YouTube APIを利用して歌詞を同期させる関数
function syncLyricsWithVideo(lyricsArray) {
    const videoElement = document.querySelector('iframe');
    const lyricsContainer = document.getElementById('lyricsContainer');

    videoElement.addEventListener('load', () => {
        const player = new YT.Player(videoElement, {
            events: {
                'onStateChange': onPlayerStateChange
            }
        });
        
        function onPlayerStateChange(event) {
            if (event.data === YT.PlayerState.PLAYING) {
                setInterval(() => {
                    player.getCurrentTime().then(currentTime => {
                        const currentLyric = lyricsArray.find(lyric => currentTime >= lyric.startTime && currentTime <= lyric.endTime);
                        if (currentLyric) {
                            const lyricElement = document.getElementById('lyric-' + currentLyric.id);
                            if (lyricElement) {
                                lyricsContainer.scrollTop = lyricElement.offsetTop - lyricsContainer.offsetTop;
                            }
                        }
                    });
                }, 500);
            }
        }
    });
}

// 歌詞を表示する関数
function displayLyrics(lyricsArray) {
    const lyricsContainer = document.getElementById('lyrics');
    lyricsContainer.innerHTML = ''; // 一度クリア

    lyricsArray.forEach((lyric, index) => {
        const lyricElement = document.createElement('div');
        lyricElement.id = 'lyric-' + index;
        lyricElement.innerHTML = formatLyricsWithTags(lyric.text);
        lyricsContainer.appendChild(lyricElement);
    });
}

// ページが読み込まれた際に、曲IDをURLから取得して曲情報をロード
window.onload = function() {
    const songId = getSongIdFromURL();
    if (songId) {
        loadSong(songId);
    } else {
        console.error('曲IDが指定されていません');
    }
};