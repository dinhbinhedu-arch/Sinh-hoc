/* Trợ lý học tập.
   • Chế độ miễn phí: trả lời từ dữ liệu trong config.js (hỏi đáp, mô phỏng, bài tập, tư liệu).
   • Chế độ AI: khi config.js có aiEndpoint, câu hỏi tự do được gửi tới Cloudflare Worker (worker/worker.js).
   Không cần sửa file này. */
(() => {
  'use strict';
  const L = window.LAB;
  if (!L) return;
  const C = L.config, norm = L.norm, esc = L.esc;
  const AI = L.safeUrl(C.aiEndpoint);

  // ---------- UI ----------
  const MOTH = '<svg viewBox="0 0 40 40" aria-hidden="true"><path fill="#ebe7db" d="M20 14C15 11 8 12 3 17c2 4 6 8 11 8 3 0 5-3 6-5zM20 14c5-3 12-2 17 3-2 4-6 8-11 8-3 0-5-3-6-5z"/><path fill="#cfc9b8" d="M20 21c-4 2-8 6-7 10 3 1 6-2 7-5zM20 21c4 2 8 6 7 10-3 1-6-2-7-5z"/><ellipse cx="20" cy="21" rx="1.7" ry="7" fill="#1d1a16"/></svg>';
  const fab = document.createElement('button');
  fab.type = 'button'; fab.className = 'chat-fab'; fab.setAttribute('aria-haspopup', 'dialog');
  fab.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z"/></svg>Hỏi trợ lý';
  const panel = document.createElement('section');
  panel.className = 'chat'; panel.hidden = true;
  panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Trợ lý học tập');
  panel.innerHTML = `
    <div class="chat-head">
      <div class="av">${MOTH}</div>
      <div class="t"><b>Trợ lý học tập ${AI ? '<span class="mode">AI</span>' : ''}</b><small>Hỏi về cách dùng trang, bài tập, tư liệu${AI ? ', kiến thức Sinh học' : ''}</small></div>
      <button type="button" class="icon-btn" data-close aria-label="Đóng trợ lý">×</button>
    </div>
    <div class="chat-log" aria-live="polite"></div>
    <div class="chat-chips"></div>
    <p class="chat-note">${AI ? 'Trợ lý AI có thể nhầm. Hãy đối chiếu với sách giáo khoa và hỏi lại thầy/cô khi cần.' : 'Trợ lý trả lời theo dữ liệu thầy/cô soạn sẵn trên trang.'}</p>
    <form class="chat-form">
      <textarea rows="1" id="chat-input" placeholder="Nhập câu hỏi của em…" aria-label="Câu hỏi" maxlength="1200"></textarea>
      <button type="submit" aria-label="Gửi"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 20.5 21 12 3 3.5 3 10l12 2-12 2z"/></svg></button>
    </form>`;
  document.body.append(fab, panel);
  const log = panel.querySelector('.chat-log'), chips = panel.querySelector('.chat-chips');
  const form = panel.querySelector('form'), input = panel.querySelector('textarea'), sendBtn = form.querySelector('button');

  const SUGGEST = ['Bài tập sắp đến hạn', 'Nộp bài thế nào?', 'Có những mô phỏng nào?', 'Tìm tư liệu về kháng sinh', 'Mô phỏng không chạy', ...(AI ? ['Chọn lọc tự nhiên là gì?'] : [])];
  chips.innerHTML = SUGGEST.map(s => `<button type="button">${esc(s)}</button>`).join('');
  chips.addEventListener('click', e => { const b = e.target.closest('button'); if (b) ask(b.textContent); });

  let greeted = false;
  function open() {
    panel.hidden = false; fab.hidden = true;
    if (!greeted) {
      greeted = true;
      say('bot', `Chào em! Mình là trợ lý của **${C.ten || 'trang học tập'}**. Em có thể hỏi mình về cách dùng các bài mô phỏng, bài tập về nhà và hạn nộp, hoặc nhờ tìm tư liệu.${AI ? ' Mình cũng có thể giải thích kiến thức Sinh học, nhưng sẽ gợi ý để em tự làm bài chứ không làm hộ.' : ''}`);
    }
    setTimeout(() => input.focus(), 30);
  }
  function close() { panel.hidden = true; fab.hidden = false; fab.focus(); }
  fab.addEventListener('click', open);
  panel.querySelector('[data-close]').addEventListener('click', close);
  document.addEventListener('click', e => { if (e.target.closest('[data-open-chat]')) { e.preventDefault(); open(); } });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) close(); });

  // ---------- rendering ----------
  function rich(text) {
    return String(text).trim().split(/\n{2,}/).map(block => {
      const lines = block.split('\n').map(l => l.replace(/^#{1,6}\s+(.*)$/, '**$1**'));
      if (lines.every(l => /^\s*[-•*]\s+/.test(l))) return '<ul>' + lines.map(l => `<li>${L.md(l.replace(/^\s*[-•*]\s+/, ''))}</li>`).join('') + '</ul>';
      if (lines.every(l => /^\s*\d+[.)]\s+/.test(l))) return '<ol>' + lines.map(l => `<li>${L.md(l.replace(/^\s*\d+[.)]\s+/, ''))}</li>`).join('') + '</ol>';
      return `<p>${L.md(lines.join('\n'))}</p>`;
    }).join('');
  }
  function say(who, text, extra) {
    const d = document.createElement('div');
    d.className = 'msg ' + who;
    if (who === 'me') d.textContent = text; else d.innerHTML = rich(text) + (extra ? `<span class="src">${esc(extra)}</span>` : '');
    log.appendChild(d); log.scrollTop = log.scrollHeight;
    // open links from answers in a new tab only when they leave the site
    d.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener('click', () => { if (window.matchMedia('(max-width: 560px)').matches) close(); }));
    return d;
  }

  // ---------- local knowledge ----------
  const STOP = new Set(('la gi sao the nao lam cho em minh toi ban co khong duoc cua va voi de thi nhu nay do a ah o nhe vay bao nhieu cach hay giup can muon mot cac nhung trong tren khi neu ve di roi chua ma nhi ha thay co oi vui long xin hoi cho hoi').split(' '));
  const tokens = s => norm(s).replace(/[^a-z0-9 ]/g, ' ').split(' ').filter(w => w && !STOP.has(w));
  const docs = [];
  L.faq.forEach(f => docs.push({ kind: 'faq', item: f, keys: [f.hoi, ...(f.tuKhoa || [])], words: new Set(tokens(f.hoi + ' ' + (f.tuKhoa || []).join(' '))) }));
  L.sims.forEach(s => docs.push({ kind: 'sim', item: s, keys: [s.ten, s.chuDe, ...(s.tuKhoa || [])].filter(Boolean), words: new Set(tokens([s.ten, s.chuDe, s.moTa, (s.tuKhoa || []).join(' ')].join(' '))) }));
  function score(doc, q) {
    const qn = ' ' + norm(q).replace(/[^a-z0-9 ]/g, ' ') + ' ';
    let s = 0;
    for (const k of doc.keys) { const kn = norm(k).replace(/[^a-z0-9 ]/g, ' ').trim(); if (kn.length > 2 && qn.includes(' ' + kn + ' ')) s += 1 + kn.split(' ').length; }
    for (const w of tokens(q)) if (doc.words.has(w)) s += 1;
    return s;
  }
  // whole-word matching, so short words like "vi" don't match inside "viet"
  const resScore = (r, words) => {
    const hay = new Set(tokens([r.ten, r.moTa, r.loai, (r.tuKhoa || []).join(' ')].join(' ')));
    return words.reduce((n, w) => n + (hay.has(w) ? 1 : 0), 0);
  };
  const linkTo = (label, href) => href ? `[${label}](${href})` : label;

  async function answerHomework(q) {
    await L.ready;
    const qn = norm(q), all = L.homework;
    if (!all.length) return 'Hiện thầy/cô chưa giao bài tập nào trên trang.';
    const classes = [...new Set(all.flatMap(a => a.classes))];
    const asked = classes.find(c => qn.includes(norm(c)));
    const cls = asked || L.classFilter;
    const now = new Date();
    const open = all.filter(a => (!cls || !a.classes.length || a.classes.some(c => norm(c) === norm(cls))) && (!a.due || a.due >= now))
      .sort((a, b) => (a.due || Infinity) - (b.due || Infinity));
    if (!open.length) return `Hiện không có bài tập nào đang mở${cls ? ' cho lớp ' + cls : ''}.`;
    const lines = open.slice(0, 5).map(a => {
      const st = L.dueInfo(a.due);
      return `- **${a.tieuDe}** · ${a.due ? L.fmtDate(a.due) + ' (' + st.label.toLowerCase() + ')' : 'không có hạn'}${a.linkNop ? ' · ' + linkTo('Nộp bài', a.linkNop) : ''}`;
    });
    let out = `Bài tập đang mở${cls ? ' cho lớp **' + cls + '**' : ''}:\n\n${lines.join('\n')}`;
    if (open.length > 5) out += `\n\nCòn ${open.length - 5} bài nữa, xem ở mục [Bài tập](#bai-tap).`;
    if (!cls && classes.length) out += '\n\nMẹo: chọn lớp của em ở mục [Bài tập](#bai-tap) để chỉ xem bài của lớp mình.';
    return out;
  }
  function answerResources(q) {
    const words = tokens(q).filter(w => !['tu', 'lieu', 'tai', 'tim', 'kiem', 'tra', 'cuu', 'doc', 'them', 'link', 'video', 'sach'].includes(w));
    const ranked = L.resources.map(r => ({ r, s: resScore(r, words) })).filter(x => !words.length || x.s > 0).sort((a, b) => b.s - a.s).slice(0, 4);
    if (!L.resources.length) return 'Thầy/cô chưa đưa tư liệu nào lên trang.';
    if (!ranked.length) return `Mình chưa thấy tư liệu nào về chủ đề này. Các tư liệu hiện có nằm ở mục [Tư liệu](#tu-lieu). Em có thể thử từ khoá khác${AI ? ' hoặc hỏi mình giải thích trực tiếp' : ''}.`;
    return `Đây là tư liệu phù hợp:\n\n${ranked.map(({ r }) => `- ${linkTo(r.ten, L.safeUrl(r.link))}${r.moTa ? ': ' + r.moTa : ''}`).join('\n')}`;
  }
  const simAnswer = s => `**${s.ten}**${[s.chuDe, s.lop].filter(Boolean).length ? ' (' + [s.chuDe, s.lop].filter(Boolean).join(', ') + ')' : ''}: ${s.moTa || ''}${s.huongDan ? '\n\n**Cách chơi:** ' + s.huongDan : ''}\n\n${linkTo('Mở mô phỏng', L.safeUrl(s.file))}`;
  const listSims = () => L.sims.length
    ? `Trang hiện có ${L.sims.length} bài mô phỏng:\n\n${L.sims.map(s => `- ${linkTo(s.ten, L.safeUrl(s.file))}${s.chuDe ? ' · ' + s.chuDe : ''}${s.lop ? ' · ' + s.lop : ''}`).join('\n')}`
    : 'Trang chưa có bài mô phỏng nào.';

  // Returns {text, confident}. confident=false lets the AI take over when it is available.
  async function localAnswer(q) {
    const qn = norm(q);
    if (qn.length < 30 && /^(xin )?chao|^hello|^hi\b|^alo/.test(qn)) return { text: 'Chào em! Em cần mình giúp gì nào? Em có thể hỏi về bài tập và hạn nộp, cách dùng mô phỏng, hoặc nhờ mình tìm tư liệu.', confident: true };
    if (/cam on|thank/.test(qn)) return { text: 'Không có gì! Chúc em học tốt. Cần gì cứ hỏi mình nhé.', confident: true };
    const howSubmit = /nop/.test(qn) && /(cach|the nao|o dau|lam sao|nhu nao|bang gi)/.test(qn);
    if (!howSubmit && /(bai tap|btvn|bai ve nha|han nop|deadline|het han|giao bai|phai nop|can nop|lam bai gi)/.test(qn)) return { text: await answerHomework(q), confident: true };
    if (/(tu lieu|tai lieu|doc them|tra cuu|video|link)/.test(qn)) return { text: answerResources(q), confident: true };
    if (/(nhung|danh sach|bao nhieu|cac|co gi).*mo phong|mo phong nao|bai (mo phong|thi nghiem) nao/.test(qn)) return { text: listSims(), confident: true };
    const concept = /(la gi|tai sao|vi sao|giai thich|khac nhau|nghia la|y nghia|nguyen nhan|co che|vi du)/.test(qn);
    if (concept) {
      // Knowledge question: without AI, point to matching reading and the related simulation.
      const words = tokens(q);
      const reads = L.resources.map(r => ({ r, s: resScore(r, words) })).filter(x => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 3);
      const sim = docs.filter(d => d.kind === 'sim').map(d => ({ d, s: score(d, q) })).sort((a, b) => b.s - a.s)[0];
      let t = 'Mình chưa giải thích kiến thức được, nhưng đây là nơi em tìm câu trả lời:';
      if (reads.length) t += '\n\n' + reads.map(({ r }) => `- ${linkTo(r.ten, L.safeUrl(r.link))}`).join('\n');
      if (sim && sim.s >= 2) t += `\n\nEm cũng có thể tự kiểm chứng bằng mô phỏng ${linkTo(sim.d.item.ten, L.safeUrl(sim.d.item.file))}.`;
      if (!reads.length && !(sim && sim.s >= 2)) t = 'Câu hỏi kiến thức này mình chưa có sẵn câu trả lời. Em xem mục [Tư liệu](#tu-lieu), đọc lại sách giáo khoa hoặc hỏi thầy/cô trên lớp nhé.';
      else t += '\n\nNếu vẫn chưa rõ, em hỏi thầy/cô trên lớp nhé.';
      return { text: t, confident: false };
    }
    const ranked = docs.map(d => ({ d, s: score(d, q) })).sort((a, b) => b.s - a.s);
    const best = ranked[0];
    if (best && best.s >= 3) return { text: best.d.kind === 'faq' ? best.d.item.traLoi : simAnswer(best.d.item), confident: true };
    if (best && best.s >= 1) {
      return { text: best.d.kind === 'faq' ? `Có phải em muốn hỏi: *${best.d.item.hoi}*\n\n${best.d.item.traLoi}` : simAnswer(best.d.item), confident: false };
    }
    return {
      text: 'Mình chưa hiểu câu hỏi. Em thử hỏi ngắn gọn hơn, ví dụ: *nộp bài thế nào*, *bài tập sắp đến hạn*, *mô phỏng không chạy*.',
      confident: false
    };
  }

  // ---------- AI ----------
  const history = [];   // [{role, content}] sent to the worker
  function context() {
    const now = new Date();
    return {
      trang: C.ten || '', homNay: L.fmtDate(now), lopDangChon: L.classFilter || '',
      moPhong: L.sims.map(s => ({ ten: s.ten, chuDe: s.chuDe, lop: s.lop, moTa: s.moTa, huongDan: s.huongDan, link: s.file })),
      baiTap: L.homework.filter(a => !a.due || a.due >= now).slice(0, 15).map(a => ({
        tieuDe: a.tieuDe, lop: a.lop, han: a.due ? L.fmtDate(a.due) : 'không có hạn', yeuCau: a.yeuCau,
        moPhong: a.moPhong, coLinkNop: !!a.linkNop
      })),
      tuLieu: L.resources.map(r => ({ ten: r.ten, loai: r.loai, link: r.link, moTa: r.moTa })),
      hoiDap: L.faq.map(f => ({ hoi: f.hoi, traLoi: f.traLoi }))
    };
  }
  async function askAI() {
    await L.ready;
    const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 60000);
    try {
      const res = await fetch(AI, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctl.signal,
        body: JSON.stringify({ messages: history.slice(-10), context: context() })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.text) throw new Error(data.error || 'HTTP ' + res.status);
      return data.text;
    } finally { clearTimeout(t); }
  }

  // ---------- conversation ----------
  let busy = false;
  async function ask(q) {
    q = String(q || '').trim();
    if (!q || busy) return;
    busy = true; sendBtn.disabled = true; chips.hidden = true;
    say('me', q); history.push({ role: 'user', content: q });
    let answer, note = '';
    try {
      const local = await localAnswer(q);
      if (local.confident || !AI) answer = local.text;
      else {
        const typing = say('bot', 'Đang suy nghĩ…'); typing.classList.add('typing');
        try { answer = await askAI(); }
        catch (e) { answer = local.text; note = 'Trợ lý AI đang bận, câu trả lời lấy từ dữ liệu có sẵn.'; }
        typing.remove();
      }
    } catch (e) {
      answer = 'Có lỗi khi trả lời. Em thử lại sau ít phút nhé.';
    }
    say('bot', answer, note); history.push({ role: 'assistant', content: answer });
    busy = false; sendBtn.disabled = false; input.focus();
  }
  form.addEventListener('submit', e => { e.preventDefault(); const q = input.value; input.value = ''; autoGrow(); ask(q); });
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit(); } });
  function autoGrow() { input.style.height = 'auto'; input.style.height = Math.min(120, input.scrollHeight) + 'px'; }
  input.addEventListener('input', autoGrow);
})();
