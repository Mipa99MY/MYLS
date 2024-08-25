// JSONファイルから曲データを取得する関数
function loadSongsData() {
    return fetch('songs.json')
        .then(response => response.json())
        .then(data => data.songs);
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
    iframe.frameBorder = "0";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    videoContainer.appendChild(iframe);
}

// .srtファイルを読み込み、歌詞をページに表示する関数
// srtFileはsongs.jsonで設定したパス
function loadSRTFile(srtFile) {
    fetch(srtFile)
        .then(response => response.text())
        .then(data => {
            // SRTファイルの内容を解析して歌詞を表示する処理をここに記述
            // 例としては、表示要素に歌詞テキストを挿入する処理を行います
            document.getElementById('lyrics').innerText = data;
        })
        .catch(error => console.error('SRTファイルの読み込みエラー:', error));
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