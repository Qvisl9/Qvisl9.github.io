document.addEventListener('DOMContentLoaded', () => {
  // 删除主题自带的 copy 按钮
  document.querySelectorAll('button.copy-button').forEach(btn => btn.remove());

  // 初始化 Prism Copy 插件
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
        // Fallback
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
