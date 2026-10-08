// かんたんなパスワード画面（サンプル用）
// 注意：ページの中身はブラウザに届いているため、本当の意味での保護ではありません。
// 「関係者以外がうっかり見ない」ための目隠しです。
// パスワードを変えるときは、新しいパスワードのSHA-256（16進数）を PASSWORD_HASH に入れます。
(function () {
  const PASSWORD_HASH = '58a3a9aade7a180c8b32f11997e5d622943cf9578a3acaaa1694c658c6095f05';
  const KEY = 'digicare-unlocked';

  function isUnlocked() {
    try { return sessionStorage.getItem(KEY) === PASSWORD_HASH; } catch (e) { return false; }
  }
  if (isUnlocked()) return;

  // 中身が一瞬見えないように、先に隠す
  const hide = document.createElement('style');
  hide.textContent = 'body > *:not(#gate) { display: none !important; }';
  document.head.appendChild(hide);

  async function sha256(text) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  document.addEventListener('DOMContentLoaded', () => {
    const gate = document.createElement('div');
    gate.id = 'gate';
    gate.innerHTML = `
      <form class="gate-box">
        <div class="gate-icon">🔒</div>
        <h1>デジカレ修了生コミュニティ</h1>
        <p>このページは修了生専用です。<br>パスワードを入力してください。</p>
        <input type="password" autocomplete="current-password" placeholder="パスワード" aria-label="パスワード" required>
        <p class="gate-error" hidden>パスワードが違います</p>
        <button class="btn" type="submit">ひらく</button>
      </form>`;
    document.body.appendChild(gate);

    const form = gate.querySelector('form');
    const input = gate.querySelector('input');
    const error = gate.querySelector('.gate-error');
    input.focus();

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (await sha256(input.value) === PASSWORD_HASH) {
        try { sessionStorage.setItem(KEY, PASSWORD_HASH); } catch (err) {}
        gate.remove();
        hide.remove();
      } else {
        error.hidden = false;
        input.select();
      }
    });
  });
})();
