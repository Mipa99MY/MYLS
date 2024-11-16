// JekyllからvideoIdを取得
// 注意: Jekyll変数が正しくページに埋め込まれているか確認すること
const videoId = "{{ page.videoId }}"; // フロントマターから取得するYouTubeの動画ID

function loadLyrics(lyricsFile) {
    console.log("loadLyrics function called with file:", lyricsFile);
    fetch(lyricsFile)
        .then(response => {
            console.log("Fetch response:", response); // ファイル取得のレスポンスを確認
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.text();
        })
        .then(data => {
            const lyrics = parseSRT(data);
            console.log("Lyrics loaded:", lyrics); // ここで正しくパースされた歌詞を確認
            displayAllLyrics(lyrics); // 初期表示で全歌詞を表示
            syncLyricsWithVideo(lyrics, videoId); // videoIdをsyncLyricsWithVideoに渡す
        })
        .catch(error => {
            console.error('Error loading lyrics:', error);
        });
}

// SRTファイルのデータを解析し、歌詞のタイムスタンプを取得する関数
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
            const startTime =
                parseFloat(timeMatch[1]) * 3600 +
                parseFloat(timeMatch[2]) * 60 +
                parseFloat(timeMatch[3]) +
                parseFloat(timeMatch[4]) / 1000;
            const endTime =
                parseFloat(timeMatch[5]) * 3600 +
                parseFloat(timeMatch[6]) * 60 +
                parseFloat(timeMatch[7]) +
                parseFloat(timeMatch[8]) / 1000;

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

// 初期表示で全歌詞を画面に表示する関数
function displayAllLyrics(lyrics) {
    const lyricsContainer = document.getElementById('lyrics');
    if (!lyricsContainer) {
        console.error("Lyrics container not found");
        return;
    }

    lyricsContainer.innerHTML = ''; // 一旦クリア

    lyrics.forEach(lyric => {
        let formattedLyric = lyric.text
            .replace(/<aespa>(.*?)<\/aespa>/g, '<span class="aespa">$1</span>')
            .replace(/<MY>(.*?)<\/MY>/g, '<span class="MY">$1</span>')
            .replace(/<with>(.*?)<\/with>/g, '<span class="with">$1</span>')
            .replace(/<jp>(.*?)<\/jp>/g, '<span class="jp">$1</span>')
            .replace(/<en>(.*?)<\/en>/g, '<span class="en">$1</span>')
            .replace(/<kr>(.*?)<\/kr>/g, '<span class="kr">$1</span>');
        lyricsContainer.innerHTML += `<div data-start="${lyric.startTime}" class="lyric-line">${formattedLyric}</div>`;
    });
}

// 動画再生に合わせて歌詞を自動スクロールする関数
function syncLyricsWithVideo(lyrics, videoId) {
    if (!window.YT || !YT.Player) {
        console.error("YouTube API not loaded");
        return;
    }

    player = new YT.Player('youtubeVideo', {
        videoId: videoId,
        width: '300',
        height: '170',
        events: {
            'onStateChange': function (event) {
                if (event.data === YT.PlayerState.PLAYING) {
                    if (window.lyricsInterval) clearInterval(window.lyricsInterval);

                    window.lyricsInterval = setInterval(() => {
                        const currentTime = getCurrentTime();
                        updateLyricsDisplay(currentTime, lyrics);
                    }, 1000);
                } else {
                    clearInterval(window.lyricsInterval);
                }
            }
        }
    });
}

// 現在の再生位置に合わせて歌詞のハイライトとスクロールを行う関数
function updateLyricsDisplay(currentTime, lyrics) {
    const lyricsContainer = document.getElementById('lyrics');
    if (!lyricsContainer) {
        console.error("Lyrics container not found");
        return;
    }

    const lyricLines = lyricsContainer.getElementsByClassName('lyric-line');

    for (let i = 0; i < lyricLines.length; i++) {
        const start = parseFloat(lyricLines[i].getAttribute('data-start'));
        const nextLineStart = lyricLines[i + 1]
            ? parseFloat(lyricLines[i + 1].getAttribute('data-start'))
            : Infinity;

        if (currentTime >= start && currentTime < nextLineStart) {
            lyricLines[i].classList.add('highlight');
            lyricLines[i].scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            lyricLines[i].classList.remove('highlight');
        }
    }
}

// プレイヤーから現在の再生時間を取得する関数
function getCurrentTime() {
    if (player && typeof player.getCurrentTime === 'function') {
        return player.getCurrentTime();
    }
    console.error("Player not ready or getCurrentTime not available");
    return 0;
}

// チェックボックスに対応するテキストの表示/非表示を切り替える関数
function toggleTranslation(checkbox, textElements) {
    console.log(`Checkbox checked: ${checkbox.checked}`);
    console.log(textElements);  // textElementsが正しく取得できているか確認
    textElements.forEach(element => {
        console.log(element);  // 各テキスト要素を確認
        element.style.display = checkbox.checked ? 'block' : 'none';
    });
}

window.onload = function () {
    // チェックボックスと対応するテキスト要素を取得
    const japaneseCheckbox = document.getElementById('showJapanese');
    const englishCheckbox = document.getElementById('showEnglish');
    const koreanCheckbox = document.getElementById('showKorean');

    // 対応するテキスト要素を取得（srtファイル内のタグをspanでラップしたもの）
    const japaneseText = document.querySelectorAll('.jp');
    const englishText = document.querySelectorAll('.en');
    const koreanText = document.querySelectorAll('.kr');

    // ページロード時にチェックボックスとテキストの初期状態を設定
    initializeCheckboxes();

    // チェックボックスにイベントリスナーを追加
    if (japaneseCheckbox) {
        japaneseCheckbox.addEventListener('change', () => {
            console.log('Japanese checkbox changed');
            toggleTranslation(japaneseCheckbox, japaneseText);
        });
    }
    if (englishCheckbox) {
        englishCheckbox.addEventListener('change', () => {
            console.log('English checkbox changed');
            toggleTranslation(englishCheckbox, englishText);
        });
    }
    if (koreanCheckbox) {
        koreanCheckbox.addEventListener('change', () => {
            console.log('Korean checkbox changed');
            toggleTranslation(koreanCheckbox, koreanText);
        });
    }

    // 初期化関数：ページ読み込み時に全てのチェックボックスを外す
    function initializeCheckboxes() {
        if (japaneseCheckbox) {
            japaneseCheckbox.checked = false;  // 初期状態でチェックを外す
            toggleTranslation(japaneseCheckbox, japaneseText);  // 対応するテキストを非表示
        }
        if (englishCheckbox) {
            englishCheckbox.checked = false;
            toggleTranslation(englishCheckbox, englishText);
        }
        if (koreanCheckbox) {
            koreanCheckbox.checked = false;
            toggleTranslation(koreanCheckbox, koreanText);
        }
    }
};