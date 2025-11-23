document.addEventListener('DOMContentLoaded', () => {
  // 延迟 100ms 删除主题按钮，确保它已生成
  setTimeout(() => {
    document.querySelectorAll('button.copy-button').forEach(btn => btn.remove());
  }, 100);

  // 初始化 Prism Copy 按钮
  Prism.plugins.toolbar.registerButton('copy-to-clipboard', function(env) {
    const btn = document.createElement('button');
    const lang = '{{ .Site.Language.Lang }}';
    btn.textContent = lang === 'zh-cn' ? '复制' : 'copy';
    btn.addEventListener('click', function() {
      navigator.clipboard.writeText(env.code).then(() => {
        btn.textContent = lang === 'zh-cn' ? '已复制!' : 'Copied!';
        setTimeout(() => {
          btn.textContent = lang === 'zh-cn' ? '复制' : 'copy';
        }, 2000);
      }).catch(() => {
        const t = document.createElement('textarea');
        t.value = env.code;
        document.body.appendChild(t);
        t.select();
        document.execCommand('copy');
        document.body.removeChild(t);
      });
    });
    return btn;
  });
});
