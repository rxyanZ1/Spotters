const IMG_W = 2000, IMG_H = 1595;

let selectedId   = null;
let adminMode    = false;
let searchQuery  = '';
let activeFilter = 'all';
let isPanning    = false;
let scale, panX, panY;
let dragStartX, dragStartY, dragPanX, dragPanY;

const CAT_LABELS = { all:'All', lecture:'Lecture', research:'Research', admin:'Admin', services:'Services', recreation:'Recreation' };
const uniqueCats = ['all', ...new Set(BUILDINGS.map(b => b.category))];

window.addEventListener('DOMContentLoaded', () => {
  fitMap();
  buildFilters();
  buildLegend();
  buildButtons();
  bindEvents();
  bindAdminAuth();
  updateAdminUI();
  updateVisibility();
  refreshBadges();
});

function fitMap() {
  const vp = document.getElementById('mapViewport');
  const vw = vp.clientWidth;
  const vh = vp.clientHeight;
  scale = Math.min(vw / IMG_W, vh / IMG_H) * 0.98;
  panX = Math.round((vw - IMG_W * scale) / 2);
  panY = Math.round((vh - IMG_H * scale) / 2);
  applyXform();
}

function applyXform() {
  document.getElementById('mapCanvas').style.transform =
    `translate(${panX}px,${panY}px) scale(${scale})`;
}

// ── Filter buttons ────────────────────────────────────────────────────────
function buildFilters() {
  const bar = document.getElementById('filterBar');
  uniqueCats.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (cat === 'all' ? ' active' : '');
    btn.dataset.cat = cat;
    btn.textContent = CAT_LABELS[cat] || cat;
    btn.onclick = () => {
      activeFilter = cat;
      bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updateVisibility();
    };
    bar.appendChild(btn);
  });
}

// ── Legend ────────────────────────────────────────────────────────────────
function buildLegend() {
  const el = document.getElementById('legendItems');
  const seen = new Set();
  BUILDINGS.forEach(b => {
    if (seen.has(b.category)) return;
    seen.add(b.category);
    el.insertAdjacentHTML('beforeend',
      `<div class="legend-item">
         <div class="legend-dot" style="background:${b.color}"></div>
         <div class="legend-label">${CAT_LABELS[b.category] || b.category}</div>
       </div>`);
  });
}

// ── Building buttons ──────────────────────────────────────────────────────
function buildButtons() {
  const layer = document.getElementById('btnLayer');
  BUILDINGS.forEach(b => {
    const btn = document.createElement('button');
    btn.id = 'btn-' + b.id;
    btn.className = 'building-btn';
    btn.dataset.id  = b.id;
    btn.dataset.cat = b.category;
    btn.style.left  = b.labelX + 'px';
    btn.style.top   = b.labelY + 'px';
    btn.style.background = b.color;
    btn.style.boxShadow  = `0 2px 8px ${b.color}88`;
    btn.textContent = b.id;
    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (!isPanning) toggleSelect(b.id);
    });
    layer.appendChild(btn);
  });
}

// ── Select ────────────────────────────────────────────────────────────────
function toggleSelect(id) {
  // deselect previous
  if (selectedId) {
    const prev = BUILDINGS.find(b => b.id === selectedId);
    const el = document.getElementById('btn-' + selectedId);
    if (el && prev) {
      el.classList.remove('active');
      el.style.background  = prev.color;
      el.style.transform   = 'translate(-50%,-50%) scale(1)';
    }
  }
  if (selectedId === id) {
    selectedId = null;
    closePanel();
  } else {
    selectedId = id;
    const b  = BUILDINGS.find(b => b.id === id);
    const el = document.getElementById('btn-' + id);
    if (el) {
      el.classList.add('active');
      el.style.transform = 'translate(-50%,-50%) scale(1.2)';
    }
    openPanel(b);
  }
}

// ── Panel ─────────────────────────────────────────────────────────────────
function openPanel(b) {
  document.getElementById('sidePanel').classList.remove('collapsed');
  document.getElementById('panelContent').innerHTML = `
    <div class="panel-header">
      <div class="panel-meta">
        <span class="cat-badge" style="background:${b.color}">${b.category}</span>
        <span class="building-code">${b.id}</span>
        ${b.accessibility ? '<span class="accessibility-badge">♿ Accessible</span>' : ''}
      </div>
      <div class="panel-title">${b.name}</div>
    </div>
    <div class="panel-body">
      ${renderUpdatesSection(b)}
      <div class="info-section">
        <div class="info-row">
          <div class="info-icon">📋</div>
          <div class="info-content">
            <div class="info-label">Description</div>
            <div class="info-value">${b.description}</div>
          </div>
        </div>
        <div class="info-row">
          <div class="info-icon">🕐</div>
          <div class="info-content">
            <div class="info-label">Hours</div>
            <div class="info-value">${b.hours}</div>
          </div>
        </div>
        <div class="info-row">
          <div class="info-icon">🏛</div>
          <div class="info-content">
            <div class="info-label">Departments</div>
            <div class="dept-tags">${b.departments.map(d => `<span class="dept-tag">${d}</span>`).join('')}</div>
          </div>
        </div>
        <div class="info-row">
          <div class="info-icon">👥</div>
          <div class="info-content">
            <div class="info-label">Capacity</div>
            <div class="info-value">${b.capacity} people</div>
            <div class="capacity-bar">
              <div class="capacity-fill" style="width:${Math.min(100,b.capacity/12)}%;background:${b.color}"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="admin-section${adminMode ? ' visible' : ''}" id="adminSection">
        <div class="admin-section-title">Admin Notes</div>
        <div class="admin-note">${b.adminNotes}</div>
      </div>
    </div>`;
}

function closePanel() {
  document.getElementById('sidePanel').classList.add('collapsed');
  document.getElementById('panelContent').innerHTML = '';
}

// ── Visibility ────────────────────────────────────────────────────────────
function getVisible() {
  return BUILDINGS.filter(b => {
    const catOk  = activeFilter === 'all' || b.category === activeFilter;
    const srchOk = !searchQuery
      || b.name.toLowerCase().includes(searchQuery)
      || b.id.toLowerCase().includes(searchQuery)
      || b.departments.some(d => d.toLowerCase().includes(searchQuery));
    return catOk && srchOk;
  }).map(b => b.id);
}

function updateVisibility() {
  const visible = getVisible();
  BUILDINGS.forEach(b => {
    const el = document.getElementById('btn-' + b.id);
    if (!el) return;
    const show = visible.includes(b.id);
    el.style.opacity       = show ? '1' : '0.12';
    el.style.pointerEvents = show ? 'all' : 'none';
    if (!show && selectedId === b.id) { selectedId = null; closePanel(); }
  });
  document.getElementById('resultCount').textContent =
    visible.length + ' building' + (visible.length !== 1 ? 's' : '');
}

document.getElementById('searchInput').addEventListener('input', e => {
  searchQuery = e.target.value.toLowerCase().trim();
  updateVisibility();
});

function bindAdminAuth() {
  const loginBtn = document.getElementById('adminLoginBtn');
  const modal = document.getElementById('loginModalBackdrop');
  const closeBtn = document.getElementById('loginCloseBtn');
  const form = document.getElementById('loginForm');
  const usernameInput = document.getElementById('loginUsername');
  const passwordInput = document.getElementById('loginPassword');

  loginBtn.addEventListener('click', () => {
    if (adminMode) {
      adminMode = false;
      updateAdminUI();
      rerenderSelectedPanel();
      return;
    }
    openLoginModal();
  });

  closeBtn.addEventListener('click', closeLoginModal);

  modal.addEventListener('click', e => {
    if (e.target === modal) closeLoginModal();
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    if (username === 'admin' && password === 'admin') {
      adminMode = true;
      clearLoginError();
      closeLoginModal();
      updateAdminUI();
      rerenderSelectedPanel();
      return;
    }

    showLoginError('Invalid username or password.');
    passwordInput.value = '';
    passwordInput.focus();
  });
}

function openLoginModal() {
  document.getElementById('loginModalBackdrop').classList.remove('hidden');
  clearLoginError();
  document.getElementById('loginForm').reset();
  document.getElementById('loginUsername').focus();
}

function closeLoginModal() {
  document.getElementById('loginModalBackdrop').classList.add('hidden');
}

function showLoginError(message) {
  document.getElementById('loginError').textContent = message;
}

function clearLoginError() {
  document.getElementById('loginError').textContent = '';
}

function updateAdminUI() {
  const loginBtn = document.getElementById('adminLoginBtn');
  loginBtn.textContent = adminMode ? 'Admin Logout' : 'Admin Login';
  loginBtn.classList.toggle('logged-in', adminMode);
}

function rerenderSelectedPanel() {
  if (!selectedId) return;
  const b = BUILDINGS.find(x => x.id === selectedId);
  if (b) openPanel(b);
}

// ── Events ────────────────────────────────────────────────────────────────
function bindEvents() {
  const vp = document.getElementById('mapViewport');

  vp.addEventListener('click', () => {
    if (!isPanning && selectedId) {
      const prev = BUILDINGS.find(b => b.id === selectedId);
      const el = document.getElementById('btn-' + selectedId);
      if (el && prev) { el.classList.remove('active'); el.style.transform = 'translate(-50%,-50%) scale(1)'; }
      selectedId = null; closePanel();
    }
  });

  vp.addEventListener('mousedown', e => {
    isPanning = false;
    dragStartX = e.clientX; dragStartY = e.clientY;
    dragPanX = panX; dragPanY = panY;
    const move = ev => {
      const dx = ev.clientX - dragStartX, dy = ev.clientY - dragStartY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) isPanning = true;
      panX = dragPanX + dx; panY = dragPanY + dy;
      applyXform();
    };
    const up = () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
      setTimeout(() => { isPanning = false; }, 50);
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  });

  vp.addEventListener('wheel', e => {
    e.preventDefault();
    const rect = vp.getBoundingClientRect();
    const mx = e.clientX - rect.left, my = e.clientY - rect.top;
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    const ns = Math.min(6, Math.max(0.2, scale * factor));
    panX = mx - (mx - panX) * (ns / scale);
    panY = my - (my - panY) * (ns / scale);
    scale = ns;
    applyXform();
  }, { passive: false });

  document.getElementById('zoomIn').onclick  = () => zoomBy(1.25);
  document.getElementById('zoomOut').onclick = () => zoomBy(0.8);
  document.getElementById('zoomReset').onclick = fitMap;

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const loginModal = document.getElementById('loginModalBackdrop');
      if (loginModal && !loginModal.classList.contains('hidden')) {
        closeLoginModal();
        return;
      }
      if (selectedId) {
        const prev = BUILDINGS.find(b => b.id === selectedId);
        const el = document.getElementById('btn-' + selectedId);
        if (el && prev) { el.classList.remove('active'); el.style.transform = 'translate(-50%,-50%) scale(1)'; }
        selectedId = null; closePanel();
      }
    }
    const tag = document.activeElement.tagName;
    if ((e.key==='f'||e.key==='/') && tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
      e.preventDefault(); document.getElementById('searchInput').focus();
    }
  });
}

function zoomBy(factor) {
  const vp = document.getElementById('mapViewport');
  const cx = vp.clientWidth/2, cy = vp.clientHeight/2;
  const ns = Math.min(6, Math.max(0.2, scale * factor));
  panX = cx - (cx - panX) * (ns/scale);
  panY = cy - (cy - panY) * (ns/scale);
  scale = ns;
  applyXform();
}

// ── UPDATES SYSTEM ────────────────────────────────────────────────────────

function loadUpdates() {
  try { return JSON.parse(localStorage.getItem('campusUpdates') || '{}'); }
  catch { return {}; }
}

function saveUpdates(updates) {
  localStorage.setItem('campusUpdates', JSON.stringify(updates));
}

function getUpdatesForBuilding(id) {
  const all = loadUpdates();
  return (all[id] || []).sort((a, b) => b.ts - a.ts);
}

function addUpdate(buildingId, title, message, type) {
  const all = loadUpdates();
  if (!all[buildingId]) all[buildingId] = [];
  all[buildingId].push({
    id: Date.now() + Math.random().toString(36).slice(2),
    title, message, type,
    ts: Date.now()
  });
  saveUpdates(all);
}

function deleteUpdate(buildingId, updateId) {
  const all = loadUpdates();
  if (all[buildingId]) {
    all[buildingId] = all[buildingId].filter(u => u.id !== updateId);
    saveUpdates(all);
  }
}

function getUpdateCount(id) {
  return getUpdatesForBuilding(id).length;
}

// Refresh all button badges
function refreshBadges() {
  BUILDINGS.forEach(b => {
    const btn = document.getElementById('btn-' + b.id);
    if (!btn) return;
    const existing = btn.querySelector('.update-badge');
    if (existing) existing.remove();
    const count = getUpdateCount(b.id);
    if (count > 0) {
      const badge = document.createElement('span');
      badge.className = 'update-badge';
      badge.textContent = count;
      btn.appendChild(badge);
    }
  });
}

// ── Updates HTML renderers ─────────────────────────────────────────────────

function renderUpdatesSection(b) {
  const updates = getUpdatesForBuilding(b.id);

  const studentView = updates.length === 0 ? '' : `
    <div class="updates-section">
      <div class="updates-header">
        <span class="updates-icon">📢</span>
        <span class="updates-title">Building Updates</span>
        <span class="updates-count">${updates.length}</span>
      </div>
      ${updates.map(u => `
        <div class="update-card update-${u.type}">
          <div class="update-card-header">
            <span class="update-type-icon">${typeIcon(u.type)}</span>
            <span class="update-card-title">${escHtml(u.title)}</span>
            <span class="update-card-time">${timeAgo(u.ts)}</span>
          </div>
          <div class="update-card-msg">${escHtml(u.message)}</div>
        </div>
      `).join('')}
    </div>`;

  const adminForm = !adminMode ? '' : `
    <div class="admin-updates-section" id="adminUpdates-${b.id}">
      <div class="admin-updates-header">
        <span>⚙ Manage Updates</span>
      </div>

      ${updates.length > 0 ? `
        <div class="admin-update-list">
          ${updates.map(u => `
            <div class="admin-update-item">
              <div class="admin-update-item-info">
                <span class="update-type-icon">${typeIcon(u.type)}</span>
                <span class="admin-update-item-title">${escHtml(u.title)}</span>
                <span class="update-card-time">${timeAgo(u.ts)}</span>
              </div>
              <button class="delete-update-btn" onclick="handleDeleteUpdate('${b.id}','${u.id}')">✕</button>
            </div>
          `).join('')}
        </div>` : ''}

      <div class="add-update-form">
        <div class="form-row">
          <input id="upd-title-${b.id}" class="upd-input" type="text" placeholder="Update title…" maxlength="80" />
        </div>
        <div class="form-row">
          <textarea id="upd-msg-${b.id}" class="upd-textarea" placeholder="Details…" rows="3" maxlength="300"></textarea>
        </div>
        <div class="form-row form-row-split">
          <select id="upd-type-${b.id}" class="upd-select">
            <option value="info">ℹ Info</option>
            <option value="warning">⚠ Warning</option>
            <option value="closure">🚫 Closure</option>
          </select>
          <button class="upd-submit-btn" onclick="handleAddUpdate('${b.id}')">Post Update</button>
        </div>
      </div>
    </div>`;

  return studentView + adminForm;
}

function handleAddUpdate(buildingId) {
  const title = document.getElementById(`upd-title-${buildingId}`)?.value.trim();
  const message = document.getElementById(`upd-msg-${buildingId}`)?.value.trim();
  const type = document.getElementById(`upd-type-${buildingId}`)?.value;
  if (!title || !message) {
    alert('Please enter both a title and message.');
    return;
  }
  addUpdate(buildingId, title, message, type);
  refreshBadges();
  // Reopen panel to reflect new update
  const b = BUILDINGS.find(x => x.id === buildingId);
  openPanel(b);
}

function handleDeleteUpdate(buildingId, updateId) {
  deleteUpdate(buildingId, updateId);
  refreshBadges();
  const b = BUILDINGS.find(x => x.id === buildingId);
  openPanel(b);
}

function typeIcon(type) {
  return { info: 'ℹ️', warning: '⚠️', closure: '🚫' }[type] || 'ℹ️';
}

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return 'just now';
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}