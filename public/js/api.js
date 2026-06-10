const API = {
  token() { return localStorage.getItem('token'); },
  headers(json = true) {
    const h = {};
    if (json) h['Content-Type'] = 'application/json';
    if (this.token()) h.Authorization = `Bearer ${this.token()}`;
    return h;
  },
  async request(url, options = {}) {
    const res = await fetch(url, options);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  }
};
function requireAuth() { if (!API.token()) location.href = '/login.html'; }
function logout() { localStorage.removeItem('token'); location.href = '/login.html'; }
function escapeHtml(str) { return String(str).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function renderMarkdown(text) {
  let safe = escapeHtml(text);
  safe = safe.replace(/```([\s\S]*?)```/g, (_, code) => `<pre><button onclick="navigator.clipboard.writeText(this.nextElementSibling.innerText)">Copy</button><code>${code}</code></pre>`);
  safe = safe.replace(/`([^`]+)`/g, '<code>$1</code>');
  safe = safe.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  safe = safe.replace(/\n/g, '<br>');
  return safe;
}
