/* eslint-disable */
// shortcutConfig.js — Default shortcut map + zoom settings + localStorage helpers

const LS_SHORTCUTS_KEY = 'fc_shortcuts';
const LS_ZOOM_KEY = 'fc_zoom_settings';

/* ── Default keyboard bindings ── */
export const DEFAULT_SHORTCUTS = {
    // Tools
    select: 'v',
    rect: 'r',
    diamond: 'd',
    ellipse: 'e',
    parallelogram: 'p',
    line: 'l',
    arrow: 'a',
    curve: 'c',
    text: 't',
    // History
    undo: 'ctrl+z',
    redo: 'ctrl+y',
    // Canvas
    delete: 'Delete',
    escape: 'Escape',
    zoomIn: 'ctrl+=',
    zoomOut: 'ctrl+-',
    zoomReset: 'ctrl+0',
};

/* ── Default trackpad / zoom settings ── */
export const DEFAULT_ZOOM_SETTINGS = {
    trackpadZoom: true,   // pinch-to-zoom on trackpad (wheel without ctrl)
    scrollZoom: true,   // Ctrl + scroll wheel zooms
    zoomSensitivity: 1.0,    // multiplier 0.5 – 2.0
};

/* ── Human-readable labels for the editor UI ── */
export const ACTION_LABELS = {
    select: 'Select',
    rect: 'Rectangle',
    diamond: 'Diamond',
    ellipse: 'Ellipse',
    parallelogram: 'Parallelogram',
    line: 'Line',
    arrow: 'Arrow',
    curve: 'Curve',
    text: 'Text',
    undo: 'Undo',
    redo: 'Redo',
    delete: 'Delete shape',
    escape: 'Deselect / Cancel',
    zoomIn: 'Zoom In',
    zoomOut: 'Zoom Out',
    zoomReset: 'Reset Zoom',
};

/* ── Groups for display in the editor ── */
export const SHORTCUT_GROUPS = [
    { label: 'Tools', actions: ['select', 'rect', 'diamond', 'ellipse', 'parallelogram', 'line', 'arrow', 'curve', 'text'] },
    { label: 'History', actions: ['undo', 'redo'] },
    { label: 'Canvas', actions: ['delete', 'escape', 'zoomIn', 'zoomOut', 'zoomReset'] },
];

/* ── Load / save helpers ── */
export function loadShortcuts() {
    try {
        const saved = JSON.parse(localStorage.getItem(LS_SHORTCUTS_KEY) || '{}');
        return { ...DEFAULT_SHORTCUTS, ...saved };
    } catch { return { ...DEFAULT_SHORTCUTS }; }
}

export function saveShortcuts(map) {
    // Only persist overrides (diff from defaults)
    const overrides = {};
    for (const [k, v] of Object.entries(map)) {
        if (v !== DEFAULT_SHORTCUTS[k]) overrides[k] = v;
    }
    localStorage.setItem(LS_SHORTCUTS_KEY, JSON.stringify(overrides));
}

export function resetShortcuts() {
    localStorage.removeItem(LS_SHORTCUTS_KEY);
}

export function loadZoomSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem(LS_ZOOM_KEY) || '{}');
        return { ...DEFAULT_ZOOM_SETTINGS, ...saved };
    } catch { return { ...DEFAULT_ZOOM_SETTINGS }; }
}

export function saveZoomSettings(cfg) {
    const overrides = {};
    for (const [k, v] of Object.entries(cfg)) {
        if (v !== DEFAULT_ZOOM_SETTINGS[k]) overrides[k] = v;
    }
    localStorage.setItem(LS_ZOOM_KEY, JSON.stringify(overrides));
}

export function resetZoomSettings() {
    localStorage.removeItem(LS_ZOOM_KEY);
}

/* ── Parse a key event into a shortcut string ── */
export function eventToShortcutString(e) {
    const parts = [];
    if (e.ctrlKey || e.metaKey) parts.push('ctrl');
    if (e.shiftKey) parts.push('shift');
    if (e.altKey) parts.push('alt');
    const key = e.key;
    // Avoid bare modifier keys
    if (['Control', 'Meta', 'Shift', 'Alt'].includes(key)) return null;
    parts.push(key);
    return parts.join('+');
}
