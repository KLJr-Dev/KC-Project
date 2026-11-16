(function () {
  try {
    var t = localStorage.getItem('kc_theme');
    var d =
      t === 'dark' ||
      (t !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (d) document.documentElement.classList.add('dark');
  } catch (e) {
    /* ignore */
  }
})();
