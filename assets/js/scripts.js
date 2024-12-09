// サイドメニューの開閉を制御する関数
function toggleMenu() {
    var sideMenu = document.querySelector('.sidebar'); // サイドバーを取得
    var menuButton = document.querySelector('.menu-button'); // メニューボタンを取得

    // メニューの開閉をトグル
    sideMenu.classList.toggle('active');

    // メニューボタンが消えないように、常に表示状態を維持
    menuButton.style.display = 'block';
}