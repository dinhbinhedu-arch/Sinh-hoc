/* Trang chủ: đọc cấu hình trong config.js (và Google Sheet nếu có) rồi dựng các mục.
   Không cần sửa file này. Mọi nội dung nằm trong config.js. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const C = window.SITE;
  if (!C || typeof C !== 'object') { $('config-error').hidden = false; return; }

  // ---------- helpers ----------
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private mode */ } }
  };
  const norm = s => String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'd').toLowerCase().replace(/\s+/g, ' ').trim();
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  // Only web links or links inside this site; never javascript: and the like.
  const safeUrl = u => {
    u = String(u || '').trim();
    if (!u) return '';
    if (/^[a-z][a-z0-9+.-]*:/i.test(u) && !/^https?:/i.test(u)) return '';
    return u;
  };
  const isExternal = u => /^https?:/i.test(u);
  // Tiny, safe markdown: **bold**, *italic*, `code`, [text](url), line breaks.
  const md = s => esc(s)
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, '$1<i>$2</i>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, u) => {
      const url = safeUrl(u.replace(/&amp;/g, '&'));
      if (!url) return t;
      return `<a href="${esc(url)}"${isExternal(url) ? ' target="_blank" rel="noopener"' : ''}>${t}</a>`;
    })
    .replace(/\n/g, '<br>');
  const list = v => Array.isArray(v) ? v : [];

  const sims = list(C.moPhong).filter(s => s && s.ten);
  const resources = list(C.tuLieu).filter(r => r && r.ten);
  const faq = list(C.hoiDap).filter(f => f && f.hoi);
  const simById = id => sims.find(s => norm(s.id) === norm(id));

  // ---------- text ----------
  const siteName = C.ten || 'Phòng thí nghiệm ảo';
  document.title = siteName;
  $('brand').textContent = $('foot-brand').textContent = C.thuongHieu || '';
  $('site-name').textContent = $('hero-title').textContent = $('foot-name').textContent = siteName;
  if (C.moTa) { $('hero-desc').textContent = C.moTa; document.querySelector('meta[name="description"]').content = C.moTa; }
  $('foot-contact').textContent = C.lienHe || '';

  // ---------- dates ----------
  const WD = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const pad = n => String(n).padStart(2, '0');
  function parseDate(s) {
    s = String(s || '').trim();
    let m, y, mo, d, hh = 23, mm = 59;
    const t = s.match(/(\d{1,2}):(\d{2})/);
    if (t) { hh = +t[1]; mm = +t[2]; }
    if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/))) { y = +m[1]; mo = +m[2]; d = +m[3]; }
    else if ((m = s.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})/))) { d = +m[1]; mo = +m[2]; y = +m[3]; }   // dd/mm/yyyy (Việt Nam)
    else return null;
    const dt = new Date(y, mo - 1, d, hh, mm, 59);
    return isNaN(dt) || dt.getMonth() !== mo - 1 ? null : dt;
  }
  const fmtDate = d => `${WD[d.getDay()]}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  function dueInfo(due) {
    if (!due) return { cls: '', label: 'Không có hạn', days: Infinity };
    const now = new Date();
    if (due < now) return { cls: 'late', label: 'Đã hết hạn', days: -1 };
    const a = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const b = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const days = Math.round((b - a) / 86400000);
    const label = days === 0 ? 'Hạn hôm nay' : days === 1 ? 'Hạn ngày mai' : `Còn ${days} ngày`;
    return { cls: days <= 2 ? 'soon' : '', label, days };
  }
  const tile = (due, st) => due
    ? `<div class="date-tile ${st.cls}" aria-hidden="true"><b>${pad(due.getDate())}</b><span>Th ${due.getMonth() + 1}</span></div>`
    : `<div class="date-tile" aria-hidden="true"><b>–</b><span>Hạn</span></div>`;

  // ---------- CSV (Google Sheet) ----------
  function parseCSV(text) {
    text = text.replace(/^﻿/, '');
    const rows = []; let row = [], cell = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) {
        if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; }
        else cell += c;
      } else if (c === '"') q = true;
      else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(cell); rows.push(row); row = []; cell = '';
      } else cell += c;
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    return rows.filter(r => r.some(x => x.trim() !== ''));
  }
  const COLS = {
    tieuDe: ['tieu de', 'ten bai', 'ten', 'bai'],
    lop: ['lop'],
    hanNop: ['han nop', 'han', 'deadline'],
    moPhong: ['mo phong', 'bai mo phong'],
    yeuCau: ['yeu cau', 'noi dung', 'mo ta', 'huong dan'],
    linkNop: ['link nop', 'link nop bai', 'google form', 'form', 'nop bai']
  };
  function rowsToHomework(rows) {
    if (rows.length < 2) return [];
    const head = rows[0].map(h => norm(h).replace(/[_-]+/g, ' '));
    const idx = {};
    for (const [k, names] of Object.entries(COLS)) idx[k] = head.findIndex(h => names.includes(h));
    return rows.slice(1).map(r => {
      const o = {};
      for (const k of Object.keys(COLS)) o[k] = idx[k] >= 0 ? (r[idx[k]] || '').trim() : '';
      return o;
    }).filter(o => o.tieuDe);
  }
  function prepHomework(a) {
    const classes = String(a.lop || '').split(/[,;/]/).map(s => s.trim()).filter(Boolean);
    const forAll = !classes.length || classes.some(c => norm(c) === 'tat ca');
    return {
      tieuDe: a.tieuDe, lop: forAll ? 'Tất cả các lớp' : classes.join(', '), classes: forAll ? [] : classes,
      due: parseDate(a.hanNop), moPhong: a.moPhong || '', yeuCau: a.yeuCau || '', linkNop: safeUrl(a.linkNop)
    };
  }

  // ---------- homework ----------
  let homework = [];
  let classFilter = store.get('lab-class') || '';
  const forClass = a => !classFilter || !a.classes.length || a.classes.some(c => norm(c) === norm(classFilter));
  function simLinkFor(ref) {
    if (!ref) return null;
    const s = simById(ref);
    if (s) return { href: safeUrl(s.file), name: s.ten };
    const u = safeUrl(ref);
    return u && (isExternal(u) || /\.html?($|[?#])/i.test(u)) ? { href: u, name: 'Mô phỏng' } : null;
  }
  function hwCard(a) {
    const st = dueInfo(a.due), sim = simLinkFor(a.moPhong);
    return `<article class="hw-card">
      ${tile(a.due, st)}
      <div class="hw-main">
        <div class="hw-top">
          <h3>${esc(a.tieuDe)}</h3>
          <span class="status ${st.cls}">${esc(st.label)}</span>
          <span class="tag">${esc(a.lop)}</span>
          ${a.due ? `<span class="tag">Hạn: ${esc(fmtDate(a.due))}, ${pad(a.due.getHours())}:${pad(a.due.getMinutes())}</span>` : ''}
        </div>
        ${a.yeuCau ? `<p class="hw-req">${md(a.yeuCau)}</p>` : ''}
        <div class="hw-actions">
          ${sim ? `<a class="btn ghost small" href="${esc(sim.href)}">Mở mô phỏng: ${esc(sim.name)}</a>` : ''}
          ${a.linkNop
            ? `<a class="btn primary small" href="${esc(a.linkNop)}" target="_blank" rel="noopener">Nộp bài</a>`
            : `<span class="btn primary small" aria-disabled="true">Chưa có link nộp bài</span>`}
        </div>
      </div>
    </article>`;
  }
  function renderHomework() {
    const classes = [...new Set(homework.flatMap(a => a.classes))].sort((a, b) => a.localeCompare(b, 'vi', { numeric: true }));
    if (classFilter && !classes.some(c => norm(c) === norm(classFilter))) classFilter = '';
    const f = $('hw-filters');
    f.hidden = !classes.length;
    f.innerHTML = ['', ...classes].map(c =>
      `<button type="button" class="chip" data-class="${esc(c)}" aria-pressed="${norm(c) === norm(classFilter)}">${c ? 'Lớp ' + esc(c.replace(/^l[ớo]p\s*/i, '')) : 'Tất cả lớp'}</button>`).join('');
    const now = new Date(), mine = homework.filter(forClass);
    const open = mine.filter(a => !a.due || a.due >= now).sort((a, b) => (a.due || Infinity) - (b.due || Infinity));
    const past = mine.filter(a => a.due && a.due < now).sort((a, b) => b.due - a.due);
    $('hw-list').innerHTML = open.length ? open.map(hwCard).join('')
      : `<div class="hw-empty">${homework.length ? 'Không có bài tập nào đang mở' + (classFilter ? ' cho lớp ' + esc(classFilter) : '') + '. Em đã làm xong hết rồi!' : 'Thầy/cô chưa giao bài tập nào.'}</div>`;
    $('hw-past').hidden = !past.length;
    $('hw-past-n').textContent = past.length;
    $('hw-past-list').innerHTML = past.map(hwCard).join('');
    $('stat-hw').textContent = open.length;
    // hero summary
    $('due-class').textContent = classFilter ? 'Lớp ' + classFilter.replace(/^l[ớo]p\s*/i, '') : '';
    $('due-list').innerHTML = open.length ? open.slice(0, 3).map(a => {
      const st = dueInfo(a.due);
      return `<li>${tile(a.due, st)}<div><a href="#bai-tap">${esc(a.tieuDe)}</a><small>${esc(st.label)} · ${esc(a.lop)}</small></div></li>`;
    }).join('') : '<li class="muted">Không có bài tập nào sắp đến hạn.</li>';
  }
  $('hw-filters').addEventListener('click', e => {
    const b = e.target.closest('[data-class]'); if (!b) return;
    classFilter = b.dataset.class; store.set('lab-class', classFilter); renderHomework();
  });

  async function loadHomework() {
    const fallback = list(C.baiTap).filter(a => a && a.tieuDe).map(prepHomework);
    const url = safeUrl(C.baiTapSheetCsv);
    if (!url) { homework = fallback; return; }
    try {
      const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 9000);
      const res = await fetch(url, { signal: ctl.signal, cache: 'no-store' });
      clearTimeout(t);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const text = await res.text();
      if (/^\s*</.test(text)) throw new Error('not csv');   // an HTML page means the sheet isn't published as CSV
      homework = rowsToHomework(parseCSV(text)).map(prepHomework);
      $('hw-note').textContent = 'Danh sách được cập nhật từ bảng bài tập của thầy/cô. Chọn lớp của em để lọc.';
    } catch (e) {
      homework = fallback;
      $('hw-note').textContent = 'Chưa tải được bảng bài tập mới nhất (kiểm tra mạng rồi tải lại trang). Đang hiện danh sách lưu sẵn.';
    }
  }

  // ---------- simulations ----------
  let topic = '';
  function renderSims() {
    const topics = [...new Set(sims.map(s => s.chuDe).filter(Boolean))];
    const f = $('sim-filters');
    f.hidden = topics.length < 2;
    f.innerHTML = ['', ...topics].map(t => `<button type="button" class="chip" data-topic="${esc(t)}" aria-pressed="${t === topic}">${t ? esc(t) : 'Tất cả chủ đề'}</button>`).join('');
    const shown = sims.filter(s => !topic || s.chuDe === topic);
    $('sim-grid').innerHTML = shown.map(s => {
      const href = safeUrl(s.file), img = safeUrl(s.anh), id = 'sim-' + esc(norm(s.id || s.ten).replace(/[^a-z0-9]+/g, '-'));
      return `<article class="sim-card" id="${id}">
        <a class="sim-cover${img ? '' : ' gen'}" href="${esc(href)}" tabindex="-1" aria-hidden="true">${img ? `<img src="${esc(img)}" alt="" loading="lazy">` : esc((s.ten || '?').trim()[0])}</a>
        <div class="sim-body">
          <div class="sim-meta">${[s.chuDe, s.lop, s.thoiLuong].filter(Boolean).map(x => `<span class="tag">${esc(x)}</span>`).join('')}</div>
          <h3>${esc(s.ten)}</h3>
          ${s.moTa ? `<p>${esc(s.moTa)}</p>` : ''}
          ${s.huongDan ? `<div class="sim-how" id="${id}-how" hidden>${md(s.huongDan)}</div>` : ''}
          <div class="sim-actions">
            <a class="btn primary small" href="${esc(href)}">Mở mô phỏng</a>
            ${s.huongDan ? `<button type="button" class="btn ghost small" data-how="${id}-how" aria-expanded="false" aria-controls="${id}-how">Cách chơi</button>` : ''}
          </div>
        </div>
      </article>`;
    }).join('') || '<div class="hw-empty">Chưa có bài mô phỏng nào.</div>';
    $('stat-sims').textContent = sims.length;
  }
  $('sim-filters').addEventListener('click', e => { const b = e.target.closest('[data-topic]'); if (b) { topic = b.dataset.topic; renderSims(); } });
  $('sim-grid').addEventListener('click', e => {
    const b = e.target.closest('[data-how]'); if (!b) return;
    const box = $(b.dataset.how), open = box.hidden;
    box.hidden = !open; b.setAttribute('aria-expanded', String(open)); b.textContent = open ? 'Ẩn hướng dẫn' : 'Cách chơi';
  });

  // ---------- resources ----------
  let resType = '';
  function renderResources() {
    const types = [...new Set(resources.map(r => r.loai).filter(Boolean))];
    const f = $('res-filters');
    f.hidden = types.length < 2;
    f.innerHTML = ['', ...types].map(t => `<button type="button" class="chip" data-type="${esc(t)}" aria-pressed="${t === resType}">${t ? esc(t) : 'Tất cả'}</button>`).join('');
    const words = norm($('res-q').value).split(' ').filter(Boolean);
    const shown = resources.filter(r => {
      if (resType && r.loai !== resType) return false;
      const hay = norm([r.ten, r.moTa, r.loai, list(r.tuKhoa).join(' ')].join(' '));
      return words.every(w => hay.includes(w));
    });
    $('res-list').innerHTML = shown.map(r => {
      const u = safeUrl(r.link);
      return `<li><a class="res-item" href="${esc(u)}"${isExternal(u) ? ' target="_blank" rel="noopener"' : ''}>
        <span class="tag">${esc(r.loai || 'Tư liệu')}</span>
        <span><b>${esc(r.ten)}</b>${r.moTa ? `<small>${esc(r.moTa)}</small>` : ''}</span>
        <span class="arrow" aria-hidden="true">${isExternal(u) ? '↗' : '→'}</span></a></li>`;
    }).join('') || `<li class="res-none">Không tìm thấy tư liệu phù hợp. Thử từ khoá khác hoặc <button type="button" class="linklike" data-open-chat>hỏi trợ lý</button>.</li>`;
    $('stat-res').textContent = resources.length;
  }
  $('res-q').addEventListener('input', renderResources);
  $('res-filters').addEventListener('click', e => { const b = e.target.closest('[data-type]'); if (b) { resType = b.dataset.type; renderResources(); } });

  // ---------- FAQ ----------
  $('faq-list').innerHTML = faq.map(f => `<details><summary>${esc(f.hoi)}</summary><div class="ans"><p>${md(f.traLoi)}</p></div></details>`).join('')
    || '<p class="muted">Chưa có câu hỏi nào.</p>';

  // ---------- boot ----------
  renderSims();
  renderResources();
  const ready = loadHomework().then(renderHomework);

  // Shared with the chat assistant (chat.js)
  window.LAB = {
    config: C, sims, resources, faq, norm, esc, md, safeUrl, isExternal, dueInfo, fmtDate, simById, ready,
    get homework() { return homework; },
    get classFilter() { return classFilter; },
    forClass
  };
})();
