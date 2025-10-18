// サイドメニューの開閉を制御する関数
function toggleMenu() {
    var sideMenu = document.querySelector('.sidebar'); // サイドバーを取得
    var menuButton = document.querySelector('.menu-button'); // メニューボタンを取得

    // メニューの開閉をトグル
    sideMenu.classList.toggle('active');

    // メニューボタンのアイコンを切り替え
    if (sideMenu.classList.contains('active')) {
        menuButton.innerHTML = '×'; // ×マーク（閉じるボタン）
        menuButton.setAttribute('aria-label', 'メニューを閉じる');
    } else {
        menuButton.innerHTML = '☰'; // ハンバーガーアイコン
        menuButton.setAttribute('aria-label', 'メニューを開く');
    }
}