// js/loadHeadIcons.js
(function () {
  // head-icons.html を読み込んで <head> の末尾に差し込む
  fetch('head-icons.html')
    .then(function (res) {
      if (!res.ok) throw new Error('head-icons.html の読み込みに失敗しました');
      return res.text();
    })
    .then(function (html) {
      var temp = document.createElement('div');
      temp.innerHTML = html;

      // head-icons.html 内の直下要素をすべて <head> に移植
      Array.prototype.forEach.call(temp.children, function (node) {
        document.head.appendChild(node);
      });
    })
    .catch(function (err) {
      console.error(err);
    });
})();
