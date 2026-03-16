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
  updateVisibility();
});

function fitMap() {
  const vp = document.getElementById('mapViewport');
  scale = Math.min(vp.clientWidth / IMG_W, vp.clientHeight / IMG_H) * 0.98;
  panX = (vp.clientWidth  - IMG_W * scale) / 2;
  panY = (vp.clientHeight - IMG_H * scale) / 2;
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

document.getElementById('adminToggle').addEventListener('click', () => {
  adminMode = !adminMode;
  document.getElementById('adminToggle').classList.toggle('on', adminMode);
  document.getElementById('adminSection')?.classList.toggle('visible', adminMode);
});

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
    if (e.key === 'Escape' && selectedId) {
      const prev = BUILDINGS.find(b => b.id === selectedId);
      const el = document.getElementById('btn-' + selectedId);
      if (el && prev) { el.classList.remove('active'); el.style.transform = 'translate(-50%,-50%) scale(1)'; }
      selectedId = null; closePanel();
    }
    if ((e.key==='f'||e.key==='/') && document.activeElement.id !== 'searchInput') {
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