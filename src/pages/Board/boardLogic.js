/* eslint-disable */
// FlowCraft Canvas Engine - Pure JS logic, no React dependencies.
// Called from Board.jsx useEffect after the DOM is mounted.
import { loadShortcuts, loadZoomSettings } from './shortcutConfig';

export function initBoardLogic(container, boardId, onBack) {
    /* ── Load persisted shortcuts & zoom settings ── */
    let shortcuts = loadShortcuts();
    let zoomCfg = loadZoomSettings();
    const getElementById = (id) => container.querySelector(`#${id}`);
    const querySelectorAll = (sel) => container.querySelectorAll(sel);

    /* ════════════════════════════════════════════════════════════
       FLOWCRAFT CANVAS ENGINE
       ════════════════════════════════════════════════════════════ */

    const svg = getElementById('canvas');
    const vpGroup = getElementById('viewport');
    const boardL = getElementById('board-layer');
    const shapesL = getElementById('shapes-layer');
    const selL = getElementById('selection-layer');
    const prevL = getElementById('preview-layer');
    const textEd = getElementById('text-editor');

    /* ── Board dimensions (canvas-space units) ── */
    const BOARD_W = 32000;
    const BOARD_H = 20000;

    /* ── Draw the board boundary rect into board-layer ── */
    (function initBoardRect() {
        const ns = 'http://www.w3.org/2000/svg';
        // Subtle board fill so it stands out from the infinite background
        const fill = document.createElementNS(ns, 'rect');
        fill.setAttribute('x', 0); fill.setAttribute('y', 0);
        fill.setAttribute('width', BOARD_W); fill.setAttribute('height', BOARD_H);
        fill.setAttribute('fill', '#161a17');
        fill.setAttribute('pointer-events', 'none');
        boardL.appendChild(fill);
        // Glowing border
        const border = document.createElementNS(ns, 'rect');
        border.setAttribute('x', 0); border.setAttribute('y', 0);
        border.setAttribute('width', BOARD_W); border.setAttribute('height', BOARD_H);
        border.setAttribute('fill', 'none');
        border.setAttribute('stroke', '#2e4035');
        border.setAttribute('stroke-width', '2');
        border.setAttribute('pointer-events', 'none');
        boardL.appendChild(border);
        // Corner labels
        [['4', '14', 'top-left'], [BOARD_W - 4, '14', 'top-right'],
         ['4', BOARD_H - 4, 'bottom-left'], [BOARD_W - 4, BOARD_H - 4, 'bottom-right']
        ].forEach(([x, y, label]) => {
            const t = document.createElementNS(ns, 'text');
            t.setAttribute('x', x); t.setAttribute('y', y);
            t.setAttribute('font-family', 'DM Mono, monospace');
            t.setAttribute('font-size', '11');
            t.setAttribute('fill', '#2e4035');
            t.setAttribute('pointer-events', 'none');
            t.setAttribute('text-anchor',
                label.includes('right') ? 'end' : 'start');
            t.textContent = label;
            boardL.appendChild(t);
        });
    })();

    /* ── State ── */
    let tool = 'select';
    let strokeColor = '#5cdb8f';
    let fillColor = 'none';
    let textColor = '#e8ede9';
    let strokeWidth = 1;
    let dashArray = 'none';
    let fontSize = 14;
    let fontFamily = 'DM Mono';

    let shapes = [];
    let selectedId = null;
    let editingId = null;

    let isDrawing = false;
    let drawStart = null;

    let isDragging = false;
    let dragOffX = 0, dragOffY = 0;
    let dragShapeId = null;
    let dragMoved = false;
    let dragStartPt = null;
    let dragWasSelected = false;

    let isResizing = false;
    let resizeHandle = null;
    let resizeStart = null;

    let undoStack = [];
    let redoStack = [];
    let idCounter = 0;

    let vpX = 0, vpY = 0, vpScale = 1;
    let isPanning = false, panStart = null, spaceDown = false;

    const HANDLE_R = 5;

    /* ── Colour palette swatches ── */
    const PALETTE = [
        '#e8ede9', '#8a9489', '#4d5a4e', '#2a2e2b',
        '#5cdb8f', '#3db870', '#0e2318',
        '#5b9bd5', '#3a7abf', '#1a3a5c',
        '#e05c5c', '#c03030', '#5c1a1a',
        '#e0c05c', '#c09030', '#5c4010',
        '#c05cdb', '#9030c0', '#40105c',
        '#ffffff', '#000000', 'none',
    ];

    (function buildPalette() {
        const pal = getElementById('color-palette');
        PALETTE.forEach(c => {
            const sw = document.createElement('div');
            sw.className = 'pal-swatch';
            if (c === 'none') {
                sw.style.background = '#1a1d1b';
                sw.style.backgroundImage = 'linear-gradient(135deg,#e05c5c 0%,#e05c5c 45%,#1a1d1b 45%,#1a1d1b 55%,#e05c5c 55%)';
                sw.title = 'No fill';
            } else {
                sw.style.background = c;
            }
            sw.onclick = () => pickColor(c);
            pal.appendChild(sw);
        });
        const custom = document.createElement('div');
        custom.className = 'pal-custom';
        custom.innerHTML = '<label>custom</label><input type="color" id="pal-custom-input" value="#5cdb8f"/>';
        custom.querySelector('input').addEventListener('input', e => pickColor(e.target.value));
        pal.appendChild(custom);
    })();

    let paletteTarget = null;
    function openPalette(target, e) {
        e.stopPropagation();
        paletteTarget = target;
        const pal = getElementById('color-palette');
        pal.classList.toggle('open');
        const rect = e.currentTarget.getBoundingClientRect();
        pal.style.left = (rect.right + 6) + 'px';
        pal.style.top = rect.top + 'px';
    }
    function pickColor(c) {
        if (paletteTarget === 'stroke') {
            strokeColor = c;
            getElementById('stroke-color-bar').setAttribute('fill', c === 'none' ? 'transparent' : c);
            if (selectedId) applyPropStyle('stroke', c);
        } else if (paletteTarget === 'fill') {
            fillColor = c;
            getElementById('fill-color-bar').setAttribute('fill', c === 'none' ? 'transparent' : c);
            if (selectedId) applyPropStyle('fill', c);
        } else if (paletteTarget === 'textcol') {
            textColor = c;
            getElementById('text-color-bar').setAttribute('fill', c === 'none' ? 'transparent' : c);
            if (selectedId) applyPropStyle('textColor', c);
        }
        getElementById('color-palette').classList.remove('open');
    }
    document.addEventListener('click', () => getElementById('color-palette').classList.remove('open'));

    /* ── Tool selector ── */
    function setTool(t) {
        tool = t;
        querySelectorAll('.tool-btn[id^="tool-"]').forEach(b => b.classList.remove('active'));
        const el = getElementById('tool-' + t);
        if (el) el.classList.add('active');
        svg.style.cursor = spaceDown ? 'grab' : (t === 'select' ? 'default' : (t === 'text' ? 'text' : 'crosshair'));
        getElementById('status-tool').textContent = 'tool: ' + t;
        deselect();
    }

    function setStrokeWidth(w) {
        strokeWidth = w;
        [1, 2, 3].forEach(n => {
            getElementById('btn-sw-' + n).classList.toggle('active', n === w);
        });
        if (selectedId) applyPropStyle('strokeWidth', w);
    }

    function setDash(d) {
        dashArray = d;
        getElementById('btn-dash-solid').classList.toggle('active', d === 'none');
        getElementById('btn-dash-dashed').classList.toggle('active', d === '6,3');
        getElementById('btn-dash-dotted').classList.toggle('active', d === '2,3');
        if (selectedId) applyPropStyle('dashArray', d);
    }

    /* ── Coord helpers ── */
    function svgPt(e) {
        const p = svg.createSVGPoint();
        p.x = e.clientX;
        p.y = e.clientY;
        return p.matrixTransform(vpGroup.getScreenCTM().inverse());
    }

    /* ── Shape factory ── */
    function makeId() { return 'sh_' + (++idCounter); }

    function defaultShape(type, x, y, w, h) {
        return {
            id: makeId(), type,
            x, y, w, h,
            stroke: strokeColor,
            fill: fillColor,
            strokeWidth,
            dashArray,
            text: '', textColor, fontSize, fontFamily,
            x1: x, y1: y, x2: x + w, y2: y + h,
            cx: x + w / 2, cy: y,
        };
    }

    /* ── Render a single shape to SVG element ── */
    function renderShape(s) {
        let el, textEl;
        const ns = 'http://www.w3.org/2000/svg';
        const da = s.dashArray && s.dashArray !== 'none' ? s.dashArray : null;
        const isLine = ['line', 'arrow', 'curve'].includes(s.type);

        if (s.type === 'rect') {
            el = document.createElementNS(ns, 'rect');
            el.setAttribute('x', s.x); el.setAttribute('y', s.y);
            el.setAttribute('width', Math.max(1, s.w)); el.setAttribute('height', Math.max(1, s.h));
            el.setAttribute('rx', '3');
        } else if (s.type === 'ellipse') {
            el = document.createElementNS(ns, 'ellipse');
            el.setAttribute('cx', s.x + s.w / 2); el.setAttribute('cy', s.y + s.h / 2);
            el.setAttribute('rx', Math.max(1, s.w / 2)); el.setAttribute('ry', Math.max(1, s.h / 2));
        } else if (s.type === 'diamond') {
            el = document.createElementNS(ns, 'polygon');
            const cx = s.x + s.w / 2, cy = s.y + s.h / 2;
            el.setAttribute('points', `${cx},${s.y} ${s.x + s.w},${cy} ${cx},${s.y + s.h} ${s.x},${cy}`);
        } else if (s.type === 'parallelogram') {
            el = document.createElementNS(ns, 'polygon');
            const off = s.w * 0.2;
            el.setAttribute('points', `${s.x + off},${s.y} ${s.x + s.w},${s.y} ${s.x + s.w - off},${s.y + s.h} ${s.x},${s.y + s.h}`);
        } else if (s.type === 'line') {
            el = document.createElementNS(ns, 'line');
            el.setAttribute('x1', s.x1); el.setAttribute('y1', s.y1);
            el.setAttribute('x2', s.x2); el.setAttribute('y2', s.y2);
        } else if (s.type === 'arrow') {
            el = document.createElementNS(ns, 'line');
            el.setAttribute('x1', s.x1); el.setAttribute('y1', s.y1);
            el.setAttribute('x2', s.x2); el.setAttribute('y2', s.y2);
            el.setAttribute('marker-end', 'url(#arrowhead)');
        } else if (s.type === 'curve') {
            el = document.createElementNS(ns, 'path');
            el.setAttribute('d', `M${s.x1},${s.y1} Q${s.cx},${s.cy} ${s.x2},${s.y2}`);
        } else if (s.type === 'text') {
            el = document.createElementNS(ns, 'rect');
            el.setAttribute('x', s.x); el.setAttribute('y', s.y);
            el.setAttribute('width', Math.max(1, s.w)); el.setAttribute('height', Math.max(1, s.h));
            el.setAttribute('fill', 'transparent'); el.setAttribute('stroke', 'none');
        }

        if (!el) return null;

        if (!isLine) {
            el.setAttribute('fill', s.fill === 'none' ? 'transparent' : s.fill);
        } else {
            el.setAttribute('fill', 'none');
        }
        el.setAttribute('stroke', s.stroke);
        el.setAttribute('stroke-width', s.strokeWidth);
        if (da) el.setAttribute('stroke-dasharray', da);
        el.dataset.id = s.id;
        el.style.cursor = 'pointer';

        const g = document.createElementNS(ns, 'g');
        g.dataset.id = s.id;

        if (isLine) {
            const hitEl = el.cloneNode(true);
            hitEl.setAttribute('stroke', 'transparent');
            hitEl.setAttribute('stroke-width', '24');
            hitEl.setAttribute('fill', 'none');
            hitEl.style.cursor = 'pointer';
            g.appendChild(hitEl);
        }

        g.appendChild(el);

        if (s.text) {
            textEl = document.createElementNS(ns, 'text');
            let cx, cy;
            if (isLine) {
                if (s.type === 'curve') {
                    const mx = (s.x1 + s.x2) / 2, my = (s.y1 + s.y2) / 2;
                    cx = (mx + (s.cx || mx)) / 2;
                    cy = (my + (s.cy || my)) / 2;
                } else {
                    cx = (s.x1 + s.x2) / 2;
                    cy = (s.y1 + s.y2) / 2;
                }
            } else {
                cx = s.x + s.w / 2;
                cy = s.y + s.h / 2;
            }
            textEl.setAttribute('x', cx);
            textEl.setAttribute('y', cy);
            textEl.setAttribute('text-anchor', 'middle');
            textEl.setAttribute('dominant-baseline', 'central');
            textEl.setAttribute('font-family', s.fontFamily || 'DM Mono');
            textEl.setAttribute('font-size', s.fontSize || 14);
            textEl.setAttribute('fill', s.textColor || '#e8ede9');
            textEl.setAttribute('pointer-events', 'none');
            textEl.style.userSelect = 'none';
            const lines = s.text.split('\n');
            if (lines.length === 1) {
                textEl.textContent = s.text;
            } else {
                const lh = (s.fontSize || 14) * 1.4;
                const startY = cy - (lines.length - 1) * lh / 2;
                lines.forEach((ln, i) => {
                    const ts = document.createElementNS(ns, 'tspan');
                    ts.setAttribute('x', cx);
                    ts.setAttribute('y', startY + i * lh);
                    ts.textContent = ln;
                    textEl.appendChild(ts);
                });
            }
            g.appendChild(textEl);
        }

        return g;
    }

    /* ── Full canvas redraw ── */
    function redraw() {
        shapesL.innerHTML = '';
        shapes.forEach(s => {
            const g = renderShape(s);
            if (g) shapesL.appendChild(g);
        });
        if (selectedId) drawHandles(selectedId);
        else selL.innerHTML = '';
        updateStatusBar();
        updatePropsPanel();
    }

    /* ── Selection handles ── */
    const HANDLE_POSITIONS = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

    function getShapeBounds(s) {
        if (['line', 'arrow', 'curve'].includes(s.type)) {
            const minX = Math.min(s.x1, s.x2), maxX = Math.max(s.x1, s.x2);
            const minY = Math.min(s.y1, s.y2), maxY = Math.max(s.y1, s.y2);
            return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
        }
        return { x: s.x, y: s.y, w: s.w, h: s.h };
    }

    function drawHandles(id) {
        selL.innerHTML = '';
        const s = shapes.find(sh => sh.id === selectedId);
        if (!s) return;
        const { x, y, w, h } = getShapeBounds(s);
        const ns = 'http://www.w3.org/2000/svg';
        const sel = document.createElementNS(ns, 'rect');
        sel.setAttribute('x', x - 3); sel.setAttribute('y', y - 3);
        sel.setAttribute('width', w + 6); sel.setAttribute('height', h + 6);
        sel.setAttribute('fill', 'none');
        sel.setAttribute('stroke', '#5cdb8f');
        sel.setAttribute('stroke-width', '1');
        sel.setAttribute('stroke-dasharray', '4 2');
        sel.setAttribute('pointer-events', 'none');
        selL.appendChild(sel);
        const pts = {
            nw: { x, y }, n: { x: x + w / 2, y }, ne: { x: x + w, y },
            e: { x: x + w, y: y + h / 2 },
            se: { x: x + w, y: y + h }, s: { x: x + w / 2, y: y + h }, sw: { x, y: y + h },
            w: { x, y: y + h / 2 },
        };
        HANDLE_POSITIONS.forEach(pos => {
            const pt = pts[pos];
            const h_el = document.createElementNS(ns, 'rect');
            h_el.setAttribute('x', pt.x - HANDLE_R); h_el.setAttribute('y', pt.y - HANDLE_R);
            h_el.setAttribute('width', HANDLE_R * 2); h_el.setAttribute('height', HANDLE_R * 2);
            h_el.setAttribute('rx', '1');
            h_el.setAttribute('fill', '#0d0f0e');
            h_el.setAttribute('stroke', '#5cdb8f');
            h_el.setAttribute('stroke-width', '1');
            h_el.setAttribute('cursor', getCursorForHandle(pos));
            h_el.dataset.handle = pos;
            h_el.dataset.shapeid = id;
            selL.appendChild(h_el);
        });
    }

    function getCursorForHandle(h) {
        const map = { nw: 'nw-resize', n: 'n-resize', ne: 'ne-resize', e: 'e-resize', se: 'se-resize', s: 's-resize', sw: 'sw-resize', w: 'w-resize' };
        return map[h] || 'default';
    }

    function selectShape(id) {
        selectedId = id;
        drawHandles(id);
        updatePropsPanel();
        const p = getElementById('props-panel');
        p.classList.add('open');
        getElementById('canvas-wrap').classList.remove('props-closed');
    }

    function deselect() {
        selectedId = null;
        selL.innerHTML = '';
        getElementById('props-panel').classList.remove('open');
        getElementById('canvas-wrap').classList.add('props-closed');
    }

    /* ── Props panel sync ── */
    function updatePropsPanel() {
        if (!selectedId) return;
        const s = shapes.find(sh => sh.id === selectedId);
        if (!s) return;
        const b = getShapeBounds(s);
        getElementById('prop-x').value = Math.round(b.x);
        getElementById('prop-y').value = Math.round(b.y);
        getElementById('prop-w').value = Math.round(b.w);
        getElementById('prop-h').value = Math.round(b.h);
        getElementById('ps-stroke-input').value = toHexColor(s.stroke);
        getElementById('ps-stroke-preview').style.background = s.stroke;
        getElementById('ps-fill-input').value = s.fill === 'none' ? '#1a1d1b' : toHexColor(s.fill);
        getElementById('ps-fill-preview').style.background = s.fill === 'none' ? 'transparent' : s.fill;
        getElementById('ps-sw').value = s.strokeWidth;
        getElementById('ps-textcol-input').value = toHexColor(s.textColor || '#e8ede9');
        getElementById('ps-textcol-preview').style.background = s.textColor || '#e8ede9';
        getElementById('ps-fontsize').value = s.fontSize || 14;
        getElementById('ps-font').value = s.fontFamily || 'DM Mono';
    }

    function applyPropStyle(prop, val) {
        if (!selectedId) return;
        saveUndo();
        const s = shapes.find(sh => sh.id === selectedId);
        if (!s) return;
        if (prop === 'stroke') s.stroke = val;
        if (prop === 'fill') s.fill = val;
        if (prop === 'strokeWidth') s.strokeWidth = +val || 1;
        if (prop === 'textColor') s.textColor = val;
        if (prop === 'fontSize') s.fontSize = +val || 14;
        if (prop === 'fontFamily') s.fontFamily = val;
        if (prop === 'dashArray') s.dashArray = val;
        redraw();
        autosave();
    }

    function applyPropGeometry() {
        if (!selectedId) return;
        const s = shapes.find(sh => sh.id === selectedId);
        if (!s) return;
        const x = +getElementById('prop-x').value;
        const y = +getElementById('prop-y').value;
        const w = +getElementById('prop-w').value;
        const h = +getElementById('prop-h').value;
        s.x = x; s.y = y; s.w = w; s.h = h;
        redraw(); autosave();
    }

    function toHexColor(c) {
        if (!c || c === 'none') return '#000000';
        if (c.startsWith('#')) return c;
        return '#000000';
    }

    /* ── Undo/redo ── */
    function saveUndo() {
        undoStack.push(JSON.stringify(shapes));
        if (undoStack.length > 80) undoStack.shift();
        redoStack = [];
    }

    function undo() {
        if (!undoStack.length) return;
        redoStack.push(JSON.stringify(shapes));
        shapes = JSON.parse(undoStack.pop());
        deselect(); redraw(); autosave();
    }

    function redo() {
        if (!redoStack.length) return;
        undoStack.push(JSON.stringify(shapes));
        shapes = JSON.parse(redoStack.pop());
        deselect(); redraw(); autosave();
    }

    /* ── Status bar ── */
    function updateStatusBar() {
        getElementById('status-shapes').textContent = 'shapes: ' + shapes.length;
    }

    /* ── Autosave ── */
    let saveTimer = null;
    function autosave() {
        const badge = getElementById('saved-badge');
        badge.textContent = 'saving…'; badge.style.opacity = '1';
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            const title = getElementById('board-title').value;
            try {
                localStorage.setItem('fc_board_' + boardId, JSON.stringify({ title, shapes }));
                const boards = JSON.parse(localStorage.getItem('flowcraft_boards') || '[]');
                const b = boards.find(x => x.id === boardId);
                if (b) { b.nodeCount = shapes.length; b.name = title; b.updatedAt = Date.now(); localStorage.setItem('flowcraft_boards', JSON.stringify(boards)); }
            } catch (e) { }
            badge.textContent = 'saved'; badge.style.opacity = '0.6';
        }, 800);
    }

    function loadBoard() {
        try {
            const raw = localStorage.getItem('fc_board_' + boardId);
            if (raw) {
                const data = JSON.parse(raw);
                if (data.title) getElementById('board-title').value = data.title;
                if (data.shapes) { shapes = data.shapes; idCounter = shapes.reduce((m, s) => Math.max(m, +s.id.split('_')[1] || 0), 0); }
            }
        } catch (e) { }
        redraw();
        fitBoard(); // always open with the board fully in view
    }

    /* ── Delete ── */
    function deleteSelected() {
        if (!selectedId) return;
        saveUndo();
        shapes = shapes.filter(s => s.id !== selectedId);
        deselect(); redraw(); autosave();
    }

    function clearCanvas() {
        if (!shapes.length) return;
        if (!confirm('Clear all shapes?')) return;
        saveUndo(); shapes = []; deselect(); redraw(); autosave();
    }

    /* ── Export SVG ── */
    function exportSVG() {
        const title = getElementById('board-title').value || 'flowcraft';
        const ns = 'http://www.w3.org/2000/svg';
        const ex = document.createElementNS(ns, 'svg');
        ex.setAttribute('xmlns', ns);
        ex.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        shapes.forEach(s => {
            const b = getShapeBounds(s);
            minX = Math.min(minX, b.x); minY = Math.min(minY, b.y);
            maxX = Math.max(maxX, b.x + b.w); maxY = Math.max(maxY, b.y + b.h);
        });
        if (shapes.length === 0) { minX = 0; minY = 0; maxX = 800; maxY = 600; }
        const pad = 40;
        ex.setAttribute('viewBox', `${minX - pad} ${minY - pad} ${maxX - minX + pad * 2} ${maxY - minY + pad * 2}`);
        ex.setAttribute('width', maxX - minX + pad * 2);
        ex.setAttribute('height', maxY - minY + pad * 2);
        const defs = document.createElementNS(ns, 'defs');
        defs.innerHTML = `<marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#8a9489"/></marker>`;
        ex.appendChild(defs);
        shapes.forEach(s => {
            const g = renderShape(s);
            if (g) { g.querySelectorAll('*').forEach(el => el.removeAttribute('style')); ex.appendChild(g); }
        });
        const blob = new Blob([ex.outerHTML], { type: 'image/svg+xml' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = title.replace(/\s+/g, '_') + '.svg';
        a.click();
    }

    /* ═══════════════════ MOUSE EVENTS ═══════════════════ */

    svg.addEventListener('mousedown', onMouseDown);
    svg.addEventListener('mousemove', onMouseMove);
    svg.addEventListener('mouseup', onMouseUp);
    svg.addEventListener('dblclick', onDblClick);
    window.addEventListener('mouseup', () => {
        isDrawing = false; isDragging = false; isResizing = false;
        if (isPanning) { isPanning = false; svg.style.cursor = spaceDown ? 'grab' : (tool === 'select' ? 'default' : 'crosshair'); }
        prevL.innerHTML = '';
    });
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', e => {
        if (e.key === ' ') { spaceDown = false; if (!isPanning) svg.style.cursor = tool === 'select' ? 'default' : 'crosshair'; }
    });

    function onMouseDown(e) {
        if (e.button === 1 || e.button === 2) { e.preventDefault(); startPan(e); return; }
        if (spaceDown) { startPan(e); return; }
        const pt = svgPt(e);
        const handle = e.target.dataset.handle;
        if (handle && e.target.dataset.shapeid) { e.stopPropagation(); startResize(handle, e.target.dataset.shapeid, pt); return; }
        const gEl = e.target.closest('g[data-id]');
        if (tool === 'select') {
            if (gEl && shapesL.contains(gEl)) {
                const id = gEl.dataset.id;
                const wasSelected = (selectedId === id);
                if (!wasSelected) selectShape(id);
                startDrag(id, pt, wasSelected);
            } else { deselect(); startPan(e); }
            return;
        }
        if (tool === 'text') {
            if (gEl && shapesL.contains(gEl)) {
                startTextEdit(gEl.dataset.id);
            } else {
                saveUndo();
                const s = defaultShape('text', pt.x - 60, pt.y - 20, 120, 40);
                s.fill = 'none'; s.stroke = 'none';
                shapes.push(s);
                redraw(); autosave();
                startTextEdit(s.id);
            }
            return;
        }
        isDrawing = true;
        drawStart = pt;
        prevL.innerHTML = '';
    }

    function onMouseMove(e) {
        const pt = svgPt(e);
        getElementById('status-pos').textContent = 'x: ' + Math.round(pt.x) + '  y: ' + Math.round(pt.y);
        if (isPanning) { doPan(e); return; }
        if (isDragging) { doDrag(pt); return; }
        if (isResizing) { doResize(pt); return; }
        if (isDrawing && drawStart) { updatePreview(drawStart, pt); }
    }

    function onMouseUp(e) {
        if (isPanning) { isPanning = false; return; }
        if (isDragging) { 
            isDragging = false; 
            if (dragMoved) {
                autosave(); 
            } else if (dragWasSelected && dragShapeId) {
                // Second click on an already-selected shape → open text editor.
                // Guard: lines/arrows/curves show a floating textarea (handled
                // separately in startTextEdit), but for clarity we only trigger
                // on shapes that have a proper bounding box to anchor the editor.
                const _s = shapes.find(sh => sh.id === dragShapeId);
                if (_s && !['line', 'arrow', 'curve'].includes(_s.type)) {
                    startTextEdit(dragShapeId);
                }
            }
            return; 
        }
        if (isResizing) { isResizing = false; autosave(); return; }
        if (isDrawing && drawStart) {
            const pt = svgPt(e);
            const dx = pt.x - drawStart.x, dy = pt.y - drawStart.y;
            if (Math.abs(dx) < 3 && Math.abs(dy) < 3) { isDrawing = false; drawStart = null; prevL.innerHTML = ''; return; }
            commitShape(drawStart, pt);
        }
        isDrawing = false; drawStart = null; prevL.innerHTML = '';
    }

    function onDblClick(e) {
        if (isPanning) { isPanning = false; svg.style.cursor = 'default'; }
        const gEl = e.target.closest('g[data-id]');
        if (gEl && shapesL.contains(gEl)) { 
            startTextEdit(gEl.dataset.id); 
        } else {
            const pt = svgPt(e);
            saveUndo();
            const activeType = tool === 'select' ? 'rect' : tool;
            
            let s;
            if (activeType === 'text') {
                s = defaultShape('text', pt.x - 60, pt.y - 20, 120, 40);
                s.fill = 'none'; s.stroke = 'none';
            } else {
                s = defaultShape(activeType, pt.x - 50, pt.y - 30, 100, 60);
            }
            
            shapes.push(s);
            redraw(); 
            autosave();
            selectShape(s.id);
            startTextEdit(s.id);
        }
    }

    function startPan(e) { isPanning = true; panStart = { x: e.clientX - vpX, y: e.clientY - vpY }; svg.style.cursor = 'grab'; }
    function doPan(e) {
        if (!isPanning || !panStart) return;
        vpX = e.clientX - panStart.x; vpY = e.clientY - panStart.y;
        applyViewport();
    }

    svg.addEventListener('wheel', e => {
        const isCtrl = e.ctrlKey || e.metaKey;
        e.preventDefault();

        if (isCtrl) {
            /* ── Pinch-to-zoom (trackpad) or Ctrl+scroll (mouse) ── */
            if (!zoomCfg.scrollZoom) return;
            // Use a small fixed sensitivity so pinch doesn't feel rocket-fast.
            // zoomSensitivity slider scales within a gentle range (0.003 – 0.008).
            const baseSens = 0.003;
            const sensitivity = baseSens * (zoomCfg.zoomSensitivity || 1.0);
            const delta = 1 - e.deltaY * sensitivity;

            const pt = svgPt(e); // exact world point using CTM
            const ns = Math.min(4, Math.max(0.08, vpScale * delta));
            const r = svg.getBoundingClientRect();

            vpX = (e.clientX - r.left) - pt.x * ns;
            vpY = (e.clientY - r.top) - pt.y * ns;
            vpScale = ns;
        } else {
            /* ── Two-finger scroll → pan ── */
            if (!zoomCfg.trackpadZoom) return;
            vpX -= e.deltaX;
            vpY -= e.deltaY;
        }

        applyViewport();
    }, { passive: false });

    function startDrag(id, pt, wasSelected) {
        const s = shapes.find(sh => sh.id === id);
        if (!s) return;
        isDragging = true; dragShapeId = id;
        dragMoved = false; dragStartPt = pt; dragWasSelected = !!wasSelected;
        if (['line', 'arrow', 'curve'].includes(s.type)) {
            dragOffX = pt.x - s.x1; dragOffY = pt.y - s.y1;
        } else {
            dragOffX = pt.x - s.x; dragOffY = pt.y - s.y;
        }
    }

    function doDrag(pt) {
        const s = shapes.find(sh => sh.id === dragShapeId);
        if (!s) return;
        
        if (!dragMoved && dragStartPt) {
            if (Math.abs(pt.x - dragStartPt.x) > 3 || Math.abs(pt.y - dragStartPt.y) > 3) {
                dragMoved = true;
                saveUndo();
            } else {
                return;
            }
        }
        
        if (['line', 'arrow', 'curve'].includes(s.type)) {
            const dx = pt.x - dragOffX - s.x1, dy = pt.y - dragOffY - s.y1;
            s.x1 += dx; s.y1 += dy; s.x2 += dx; s.y2 += dy;
            if (s.type === 'curve') { s.cx += dx; s.cy += dy; }
            dragOffX = pt.x - s.x1; dragOffY = pt.y - s.y1;
        } else {
            s.x = pt.x - dragOffX; s.y = pt.y - dragOffY;
        }
        redraw();
    }

    function startResize(handle, id, pt) {
        isResizing = true; resizeHandle = handle;
        const s = shapes.find(sh => sh.id === selectedId);
        if (!s) { isResizing = false; return; }
        saveUndo();
        selectShape(id);
        resizeStart = { mx: pt.x, my: pt.y, x: s.x, y: s.y, w: s.w, h: s.h };
    }

    function doResize(pt) {
        if (!isResizing || !resizeStart) return;
        const s = shapes.find(sh => sh.id === selectedId);
        if (!s) return;
        const dx = pt.x - resizeStart.mx, dy = pt.y - resizeStart.my;
        const { x: ox, y: oy, w: ow, h: oh } = resizeStart;
        let nx = ox, ny = oy, nw = ow, nh = oh;
        if (resizeHandle.includes('e')) nw = Math.max(20, ow + dx);
        if (resizeHandle.includes('s')) nh = Math.max(20, oh + dy);
        if (resizeHandle.includes('w')) { nx = ox + dx; nw = Math.max(20, ow - dx); }
        if (resizeHandle.includes('n')) { ny = oy + dy; nh = Math.max(20, oh - dy); }
        s.x = nx; s.y = ny; s.w = nw; s.h = nh;
        redraw();
    }

    function updatePreview(start, cur) {
        prevL.innerHTML = '';
        const ns = 'http://www.w3.org/2000/svg';
        const x = Math.min(start.x, cur.x), y = Math.min(start.y, cur.y);
        const w = Math.abs(cur.x - start.x), h = Math.abs(cur.y - start.y);
        let el;
        if (tool === 'rect') {
            el = document.createElementNS(ns, 'rect');
            el.setAttribute('x', x); el.setAttribute('y', y);
            el.setAttribute('width', w); el.setAttribute('height', h);
            el.setAttribute('rx', '3');
        } else if (tool === 'ellipse') {
            el = document.createElementNS(ns, 'ellipse');
            el.setAttribute('cx', x + w / 2); el.setAttribute('cy', y + h / 2);
            el.setAttribute('rx', w / 2); el.setAttribute('ry', h / 2);
        } else if (tool === 'diamond') {
            el = document.createElementNS(ns, 'polygon');
            const cx = x + w / 2, cy = y + h / 2;
            el.setAttribute('points', `${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}`);
        } else if (tool === 'parallelogram') {
            el = document.createElementNS(ns, 'polygon');
            const off = w * 0.2;
            el.setAttribute('points', `${x + off},${y} ${x + w},${y} ${x + w - off},${y + h} ${x},${y + h}`);
        } else if (tool === 'line' || tool === 'arrow') {
            el = document.createElementNS(ns, 'line');
            el.setAttribute('x1', start.x); el.setAttribute('y1', start.y);
            el.setAttribute('x2', cur.x); el.setAttribute('y2', cur.y);
            if (tool === 'arrow') el.setAttribute('marker-end', 'url(#arrowhead)');
        } else if (tool === 'curve') {
            el = document.createElementNS(ns, 'path');
            const mx = (start.x + cur.x) / 2, my = (start.y + cur.y) / 2 - Math.abs(cur.x - start.x) * 0.3;
            el.setAttribute('d', `M${start.x},${start.y} Q${mx},${my} ${cur.x},${cur.y}`);
        }
        if (!el) return;
        el.setAttribute('fill', ['line', 'arrow', 'curve'].includes(tool) ? 'none' : (fillColor === 'none' ? 'transparent' : fillColor));
        el.setAttribute('stroke', strokeColor);
        el.setAttribute('stroke-width', strokeWidth);
        el.setAttribute('opacity', '0.6');
        if (dashArray && dashArray !== 'none') el.setAttribute('stroke-dasharray', dashArray);
        prevL.appendChild(el);
    }

    function commitShape(start, end) {
        saveUndo();
        const x = Math.min(start.x, end.x), y = Math.min(start.y, end.y);
        const w = Math.abs(end.x - start.x), h = Math.abs(end.y - start.y);
        const s = defaultShape(tool, x, y, Math.max(20, w), Math.max(20, h));
        if (['line', 'arrow', 'curve'].includes(tool)) {
            s.x1 = start.x; s.y1 = start.y; s.x2 = end.x; s.y2 = end.y;
            if (tool === 'curve') { s.cx = (start.x + end.x) / 2; s.cy = (start.y + end.y) / 2 - Math.abs(end.x - start.x) * 0.3; }
            /* Clamp line endpoints onto the board */
            s.x1 = Math.max(0, Math.min(BOARD_W, s.x1));
            s.y1 = Math.max(0, Math.min(BOARD_H, s.y1));
            s.x2 = Math.max(0, Math.min(BOARD_W, s.x2));
            s.y2 = Math.max(0, Math.min(BOARD_H, s.y2));
        } else {
            /* Clamp box-like shapes so they land fully inside the board */
            s.x = Math.max(0, Math.min(BOARD_W - s.w, s.x));
            s.y = Math.max(0, Math.min(BOARD_H - s.h, s.y));
        }
        shapes.push(s);
        redraw();
        selectShape(s.id);
        autosave();
        setTool('select');
    }

    function startTextEdit(id) {
        const s = shapes.find(sh => sh.id === id);
        if (!s) return;
        // Commit any currently open edit BEFORE touching editingId.
        // Old order was: set editingId → commitTextEdit() → set editingId again.
        // commitTextEdit() reads editingId, so calling it first was saving the
        // NEW shape's (empty) textarea value over the old shape, then blanking
        // the textarea — leaving the editor open but broken.
        commitTextEdit();  // close previous editor safely (editingId is still the old one)
        editingId = id;    // now point to the new shape
        const r = svg.getBoundingClientRect();
        
        let cx, cy, w, h;
        if (['line', 'arrow', 'curve'].includes(s.type)) {
            if (s.type === 'curve') {
                const mx = (s.x1 + s.x2) / 2, my = (s.y1 + s.y2) / 2;
                cx = (mx + (s.cx || mx)) / 2;
                cy = (my + (s.cy || my)) / 2;
            } else {
                cx = (s.x1 + s.x2) / 2;
                cy = (s.y1 + s.y2) / 2;
            }
            w = 240; 
            const numLines = (s.text || '').split('\n').length || 1;
            h = Math.max(34, numLines * (s.fontSize || 14) * 1.5 + 10);
        } else {
            cx = s.x + s.w / 2;
            cy = s.y + s.h / 2;
            w = s.w; h = s.h;
        }
        
        const sx = (cx - w / 2) * vpScale + vpX + r.left;
        const sy = (cy - h / 2) * vpScale + vpY + r.top;
        const sw = w * vpScale;
        const sh = h * vpScale;
        
        textEd.style.display = 'block';
        textEd.style.left = sx + 'px';
        textEd.style.top = sy + 'px';
        textEd.style.width = sw + 'px';
        textEd.style.height = sh + 'px';
        textEd.style.fontSize = (s.fontSize || 14) * vpScale + 'px';
        textEd.style.fontFamily = s.fontFamily || 'DM Mono';
        textEd.style.color = s.textColor || '#e8ede9';
        textEd.value = s.text || '';
        textEd.focus();
        textEd.select();
    }

    // Flag to prevent blur from double-firing commitTextEdit when
    // Enter already committed. Without this flag the sequence is:
    //   Enter → commitTextEdit() → hides textarea → textarea.blur fires
    //   → commitTextEdit() called again → focus returns to canvas
    //   → mousedown fires on canvas → startDrag(wasSelected=true)
    //   → mouseup fires → startTextEdit() called again → editor reopens
    // Setting this flag in the keydown handler lets the blur listener
    // bail out early so the above chain never starts.
    let committingViaKey = false;

    textEd.addEventListener('input', () => {
        if (!editingId) return;
        const s = shapes.find(sh => sh.id === editingId);
        if (s) { s.text = textEd.value; redraw(); autosave(); }
    });

    textEd.addEventListener('blur', () => {
        if (committingViaKey) return;   // Enter/Escape already handled it
        commitTextEdit();
    });

    textEd.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            committingViaKey = true;
            commitTextEdit();
            committingViaKey = false;
        }
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            e.stopPropagation();   // stop canvas mousedown from seeing this event
            committingViaKey = true;
            commitTextEdit();
            committingViaKey = false;
        }
    });

    function commitTextEdit() {
        if (!editingId) return;
        const s = shapes.find(sh => sh.id === editingId);
        if (s && textEd.value !== undefined) { s.text = textEd.value; redraw(); autosave(); }
        editingId = null;
        textEd.style.display = 'none';
        textEd.value = '';
    }

    function buildShortcutString(e) {
        const parts = [];
        if (e.ctrlKey || e.metaKey) parts.push('ctrl');
        if (e.shiftKey) parts.push('shift');
        if (e.altKey) parts.push('alt');
        if (!['Control', 'Meta', 'Shift', 'Alt'].includes(e.key)) parts.push(e.key);
        return parts.join('+');
    }

    function onKeyDown(e) {
        if (e.target === textEd || e.target === getElementById('board-title') || e.target.tagName === 'INPUT') return;
        if (e.key === ' ' && !spaceDown) { e.preventDefault(); spaceDown = true; svg.style.cursor = 'grab'; return; }
        const combo = buildShortcutString(e);
        // Reverse-lookup action from current shortcut map
        const action = Object.entries(shortcuts).find(([, v]) => v.toLowerCase() === combo.toLowerCase())?.[0];
        if (!action) return;
        e.preventDefault();
        const toolActions = ['select', 'rect', 'diamond', 'ellipse', 'parallelogram', 'line', 'arrow', 'curve', 'text'];
        if (toolActions.includes(action)) { setTool(action); return; }
        if (action === 'undo') { undo(); return; }
        if (action === 'redo') { redo(); return; }
        if (action === 'delete' && selectedId) { deleteSelected(); return; }
        if (action === 'escape') { deselect(); commitTextEdit(); return; }
        if (action === 'zoomIn') { applyZoomStep(1.1); return; }
        if (action === 'zoomOut') { applyZoomStep(0.9); return; }
        if (action === 'zoomReset') { vpScale = 1; vpX = 0; vpY = 0; applyViewport(); return; }
    }

    function applyZoomStep(delta) {
        const cx = svg.clientWidth / 2, cy = svg.clientHeight / 2;
        const pt = { x: (cx - vpX) / vpScale, y: (cy - vpY) / vpScale };
        vpScale = Math.min(4, Math.max(0.08, vpScale * delta));
        vpX = cx - pt.x * vpScale;
        vpY = cy - pt.y * vpScale;
        applyViewport();
    }

    function fitBoard() {
        const vw = svg.clientWidth;
        const vh = svg.clientHeight;
        vpScale = Math.min(vw / BOARD_W, vh / BOARD_H) * 0.92;
        vpX = (vw - BOARD_W * vpScale) / 2;
        vpY = (vh - BOARD_H * vpScale) / 2;
        applyViewport();
    }

    function applyViewport() {
        const t = `translate(${vpX},${vpY}) scale(${vpScale})`;
        vpGroup.setAttribute('transform', t);
        const pct = Math.round(vpScale * 100) + '%';
        getElementById('status-zoom').textContent = 'zoom: ' + pct;
        getElementById('zoom-pct').textContent = pct;
    }

    /* ── Attach toolbar button listeners ── */
    const bind = (id, event, fn) => {
        const el = getElementById(id);
        if (el) el.addEventListener(event, fn);
    };
    bind('tool-undo', 'click', undo);
    bind('tool-redo', 'click', redo);
    bind('tool-fit', 'click', fitBoard);
    bind('tool-clear', 'click', clearCanvas);
    bind('tool-export', 'click', exportSVG);
    bind('btn-zoom-in', 'click', () => applyZoomStep(1.25));
    bind('btn-zoom-out', 'click', () => applyZoomStep(0.8));
    bind('zoom-pct', 'click', () => { vpScale = 1; vpX = 0; vpY = 0; applyViewport(); });
    ['select', 'rect', 'diamond', 'ellipse', 'parallelogram', 'line', 'arrow', 'curve', 'text'].forEach(t => {
        bind('tool-' + t, 'click', () => setTool(t));
    });
    bind('btn-stroke-color', 'click', (e) => openPalette('stroke', e));
    bind('btn-fill-color', 'click', (e) => openPalette('fill', e));
    bind('btn-text-color', 'click', (e) => openPalette('textcol', e));
    [1, 2, 3].forEach(w => bind('btn-sw-' + w, 'click', () => setStrokeWidth(w)));
    bind('btn-dash-solid', 'click', () => setDash('none'));
    bind('btn-dash-dashed', 'click', () => setDash('6,3'));
    bind('btn-dash-dotted', 'click', () => setDash('2,3'));
    ['prop-x', 'prop-y', 'prop-w', 'prop-h'].forEach(id => bind(id, 'input', applyPropGeometry));
    bind('ps-stroke-input', 'input', (e) => applyPropStyle('stroke', e.target.value));
    bind('ps-fill-input', 'input', (e) => applyPropStyle('fill', e.target.value));
    bind('ps-sw', 'input', (e) => applyPropStyle('strokeWidth', e.target.value));
    bind('ps-textcol-input', 'input', (e) => applyPropStyle('textColor', e.target.value));
    bind('ps-fontsize', 'input', (e) => applyPropStyle('fontSize', e.target.value));
    bind('ps-font', 'change', (e) => applyPropStyle('fontFamily', e.target.value));
    bind('btn-delete-prop', 'click', deleteSelected);

    getElementById('board-title').addEventListener('input', autosave);

    /* ── Custom event listeners ── */
    const onSetTool = (e) => setTool(e.detail.tool);
    const onShortcutsUpd = (e) => { shortcuts = e.detail.bindings; };
    const onZoomSettingsUpd = (e) => { zoomCfg = e.detail; };

    document.addEventListener('fc:settool', onSetTool);
    document.addEventListener('fc:shortcuts-updated', onShortcutsUpd);
    document.addEventListener('fc:zoom-settings-updated', onZoomSettingsUpd);

    /* ── Init ── */
    loadBoard();
    getElementById('saved-badge').style.opacity = '0.6';

    return () => {
        document.removeEventListener('fc:settool', onSetTool);
        document.removeEventListener('fc:shortcuts-updated', onShortcutsUpd);
        document.removeEventListener('fc:zoom-settings-updated', onZoomSettingsUpd);
    };
}