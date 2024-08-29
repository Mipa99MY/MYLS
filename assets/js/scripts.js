// ハンバーガーメニューのクリックイベント
// クリック時に sideMenu 要素の active クラスをトグルして、サイドメニューの表示を切り替え。
document.getElementById('hamburgerMenu').addEventListener('click', function() {
    const sideMenu = document.getElementById('sideMenu');
    sideMenu.classList.toggle('active');
});

// メニューの表示・非表示を切り替える関数
// toggleMenu() 関数はメニューのクラスをトグルする別の方法として提供されています。
// html側で、ハンバーガーメニューのidが hamburgerMenu で、
// サイドメニューのidが sideMenu であることを確認してください。
// また、 nav-menu というクラスもhtmlファイルで正しく適用されていることを確認してください。
function toggleMenu() {
    const menu = document.querySelector('.nav-menu');
    menu.classList.toggle('active');
}