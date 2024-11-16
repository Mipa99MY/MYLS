// サイドメニューの開閉を制御する関数
function toggleMenu() {
    var sideMenu = document.querySelector('.side-menu');  // サイドメニューを取得
    sideMenu.classList.toggle('active');  // 'active' クラスをトグル（開閉）
}