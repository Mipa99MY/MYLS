// サイドメニューの開閉を制御する関数
function toggleMenu() {
    var sideMenu = document.querySelector('.sidebar'); // サイドバーを取得
    var menuButton = document.querySelector('.menu-button'); // メニューボタンを取得

    console.log('toggleMenu called');
    console.log('sideMenu:', sideMenu);
    console.log('menuButton:', menuButton);

    // メニューの開閉をトグル
    sideMenu.classList.toggle('active');

    console.log('sideMenu has active class:', sideMenu.classList.contains('active'));

    // メニューボタンのアイコンを切り替え
    if (sideMenu.classList.contains('active')) {
        menuButton.innerHTML = '×'; // ×マーク（閉じるボタン）
        console.log('Changed to close button (×)');
    } else {
        menuButton.innerHTML = '☰'; // ハンバーガーアイコン
        console.log('Changed to hamburger icon (☰)');
    }
}