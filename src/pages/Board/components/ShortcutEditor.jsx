import React, { useState, useEffect, useCallback } from 'react';
import './ShortcutEditor.css';
import {
    SHORTCUT_GROUPS, ACTION_LABELS,
    loadShortcuts, saveShortcuts, resetShortcuts,
    loadZoomSettings, saveZoomSettings, resetZoomSettings,
    eventToShortcutString,
} from '../shortcutConfig';

export default function ShortcutEditor({ onClose }) {
    const [tab, setTab] = useState('keys');
    const [bindings, setBindings] = useState(() => loadShortcuts());
    const [zoomCfg, setZoomCfg] = useState(() => loadZoomSettings());
    const [recording, setRecording] = useState(null); // action key being recorded

    /* ── Conflict detection ── */
    const conflicts = {};
    const seen = {};
    for (const [action, key] of Object.entries(bindings)) {
        const normalized = key.toLowerCase();
        if (seen[normalized]) {
            conflicts[action] = seen[normalized];
            conflicts[seen[normalized]] = action;
        } else {
            seen[normalized] = action;
        }
    }

    /* ── Key capture ── */
    const handleKeyCapture = useCallback((e) => {
        if (!recording) return;
        e.preventDefault();
        e.stopPropagation();
        const shortcut = eventToShortcutString(e);
        if (!shortcut) return;
        setBindings(prev => ({ ...prev, [recording]: shortcut }));
        setRecording(null);
    }, [recording]);

    useEffect(() => {
        if (recording) {
            window.addEventListener('keydown', handleKeyCapture, true);
            return () => window.removeEventListener('keydown', handleKeyCapture, true);
        }
    }, [recording, handleKeyCapture]);

    /* ── Cancel recording on click outside ── */
    const stopRecording = () => setRecording(null);

    /* ── Save ── */
    const handleSave = () => {
        saveShortcuts(bindings);
        saveZoomSettings(zoomCfg);
        document.dispatchEvent(new CustomEvent('fc:shortcuts-updated', { detail: { bindings } }));
        document.dispatchEvent(new CustomEvent('fc:zoom-settings-updated', { detail: zoomCfg }));
        onClose();
    };

    /* ── Reset ── */
    const handleReset = () => {
        if (!confirm('Reset all shortcuts and zoom settings to defaults?')) return;
        resetShortcuts();
        resetZoomSettings();
        setBindings(loadShortcuts());
        setZoomCfg(loadZoomSettings());
    };

    return (
        <div className="sc-overlay" onClick={stopRecording}>
            <div className="sc-modal" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="sc-header">
                    <div className="sc-title">Flow<span>Craft</span> — Shortcuts</div>
                    <button className="sc-close" onClick={onClose}>✕</button>
                </div>

                {/* Tabs */}
                <div className="sc-tabs">
                    <button className={`sc-tab ${tab === 'keys' ? 'active' : ''}`} onClick={() => setTab('keys')}>Key Bindings</button>
                    <button className={`sc-tab ${tab === 'zoom' ? 'active' : ''}`} onClick={() => setTab('zoom')}>Zoom & Trackpad</button>
                </div>

                {/* Body */}
                <div className="sc-body">
                    {tab === 'keys' && <KeysTab
                        bindings={bindings}
                        conflicts={conflicts}
                        recording={recording}
                        onStartRecord={setRecording}
                    />}
                    {tab === 'zoom' && <ZoomTab cfg={zoomCfg} onChange={setZoomCfg} />}
                </div>

                {/* Footer */}
                <div className="sc-footer">
                    <button className="sc-btn sc-btn-reset" onClick={handleReset}>Reset defaults</button>
                    <div className="sc-footer-spacer" />
                    <button className="sc-btn sc-btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="sc-btn sc-btn-save" onClick={handleSave}>Save</button>
                </div>
            </div>
        </div>
    );
}

/* ─────────────────────── KEY BINDINGS TAB ─────────────────────── */
function KeysTab({ bindings, conflicts, recording, onStartRecord }) {
    return (
        <>
            {SHORTCUT_GROUPS.map(group => (
                <div key={group.label}>
                    <div className="sc-group-label">{group.label}</div>
                    {group.actions.map(action => {
                        const isRecording = recording === action;
                        const hasConflict = !!conflicts[action];
                        return (
                            <div className="sc-row" key={action}>
                                <span className="sc-row-label">{ACTION_LABELS[action]}</span>
                                <span
                                    className={`sc-key ${isRecording ? 'recording' : ''} ${hasConflict ? 'conflict' : ''}`}
                                    onClick={() => onStartRecord(action)}
                                    title={isRecording ? 'Press any key…' : 'Click to remap'}
                                >
                                    {isRecording ? 'recording…' : formatKey(bindings[action])}
                                </span>
                                {hasConflict && (
                                    <span className="sc-conflict-hint">
                                        ⚠ {ACTION_LABELS[conflicts[action]]}
                                    </span>
                                )}
                            </div>
                        );
                    })}
                </div>
            ))}
        </>
    );
}

/* ─────────────────────── ZOOM SETTINGS TAB ─────────────────────── */
function ZoomTab({ cfg, onChange }) {
    const set = (key, val) => onChange(prev => ({ ...prev, [key]: val }));
    return (
        <>
            <div className="sc-zoom-row">
                <div className="sc-zoom-desc">
                    <strong>Pinch-to-zoom</strong>
                    <small>Two-finger pinch on trackpad zooms the canvas</small>
                </div>
                <label className="sc-toggle">
                    <input type="checkbox" checked={cfg.trackpadZoom} onChange={e => set('trackpadZoom', e.target.checked)} />
                    <span className="sc-toggle-track" />
                </label>
            </div>

            <div className="sc-zoom-row">
                <div className="sc-zoom-desc">
                    <strong>Ctrl + scroll to zoom</strong>
                    <small>Hold Ctrl and scroll the mouse wheel to zoom</small>
                </div>
                <label className="sc-toggle">
                    <input type="checkbox" checked={cfg.scrollZoom} onChange={e => set('scrollZoom', e.target.checked)} />
                    <span className="sc-toggle-track" />
                </label>
            </div>

            <div className="sc-zoom-row">
                <div className="sc-zoom-desc">
                    <strong>Zoom sensitivity</strong>
                    <small>How fast zooming responds</small>
                </div>
                <div className="sc-slider-wrap">
                    <input type="range" className="sc-slider"
                        min="0.5" max="2.0" step="0.1"
                        value={cfg.zoomSensitivity}
                        onChange={e => set('zoomSensitivity', parseFloat(e.target.value))}
                    />
                    <span className="sc-slider-val">{cfg.zoomSensitivity.toFixed(1)}×</span>
                </div>
            </div>
        </>
    );
}

/* ── Format shortcut key for display ── */
function formatKey(key) {
    if (!key) return '—';
    return key
        .replace('ctrl', '⌃')
        .replace('shift', '⇧')
        .replace('alt', '⌥')
        .replace(/\+/g, ' ')
        .toUpperCase();
}
