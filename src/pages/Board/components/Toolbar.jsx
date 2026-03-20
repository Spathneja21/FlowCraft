import React from 'react';
import ShapePicker from './ShapePicker';

export default function Toolbar() {
    return (
        <nav className="toolbar" id="toolbar">

            {/* ── Select ── */}
            <div className="tool-btn active" id="tool-select" title="Select (V)">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M3 2L3 14L7 10L9.5 16L11.5 15L9 9L14 9L3 2Z" stroke="#8a9489" strokeWidth="1.2" strokeLinejoin="round" fill="none" />
                </svg>
            </div>

            <div className="tool-sep" />

            {/* ── Shape Picker (replaces individual shape buttons) ── */}
            <ShapePicker />

            <div className="tool-sep" />

            {/* ── Text ── */}
            <div className="tool-btn" id="tool-text" title="Text (T)">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <line x1="3" y1="4" x2="15" y2="4" stroke="#8a9489" strokeWidth="1.3" strokeLinecap="round" />
                    <line x1="9" y1="4" x2="9" y2="15" stroke="#8a9489" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
            </div>

            <div className="tool-sep" />

            {/* ── Stroke color ── */}
            <div className="tool-group">
                <div className="tool-btn" id="btn-stroke-color" title="Stroke color">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <rect x="2" y="2" width="14" height="11" rx="1" stroke="#8a9489" strokeWidth="1.2" fill="none" />
                        <rect x="2" y="14" width="14" height="3" rx="1" id="stroke-color-bar" fill="#5cdb8f" />
                    </svg>
                </div>
                <div className="tool-label">stroke</div>
            </div>

            {/* ── Fill color ── */}
            <div className="tool-group">
                <div className="tool-btn" id="btn-fill-color" title="Fill color">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <rect x="2" y="2" width="14" height="14" rx="2" id="fill-color-bar" fill="#1a1d1b" stroke="#8a9489" strokeWidth="1.2" />
                        <path d="M6 9 L9 6 L12 9 L9 12 Z" fill="#8a9489" opacity="0.5" />
                    </svg>
                </div>
                <div className="tool-label">fill</div>
            </div>

            {/* ── Text color ── */}
            <div className="tool-group">
                <div className="tool-btn" id="btn-text-color" title="Text color">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <text x="4" y="13" fontFamily="Syne" fontSize="12" fontWeight="700" fill="#e8ede9">A</text>
                        <rect x="2" y="14" width="14" height="3" rx="1" id="text-color-bar" fill="#e8ede9" />
                    </svg>
                </div>
                <div className="tool-label">text</div>
            </div>

            <div className="tool-sep" />

            {/* ── Stroke width ── */}
            <div className="tool-group">
                <div className="tool-btn" id="btn-sw-1" title="Thin (1px)" style={{ borderColor: 'var(--accent)' }}>
                    <svg width="18" height="18" viewBox="0 0 18 18"><line x1="3" y1="9" x2="15" y2="9" stroke="#8a9489" strokeWidth="1" strokeLinecap="round" /></svg>
                </div>
                <div className="tool-btn" id="btn-sw-2" title="Medium (2px)">
                    <svg width="18" height="18" viewBox="0 0 18 18"><line x1="3" y1="9" x2="15" y2="9" stroke="#8a9489" strokeWidth="2" strokeLinecap="round" /></svg>
                </div>
                <div className="tool-btn" id="btn-sw-3" title="Thick (3px)">
                    <svg width="18" height="18" viewBox="0 0 18 18"><line x1="3" y1="9" x2="15" y2="9" stroke="#8a9489" strokeWidth="3" strokeLinecap="round" /></svg>
                </div>
                <div className="tool-label">width</div>
            </div>

            <div className="tool-sep" />

            {/* ── Dash style ── */}
            <div className="tool-group">
                <div className="tool-btn active" id="btn-dash-solid" title="Solid">
                    <svg width="18" height="18" viewBox="0 0 18 18"><line x1="3" y1="9" x2="15" y2="9" stroke="#8a9489" strokeWidth="1.5" /></svg>
                </div>
                <div className="tool-btn" id="btn-dash-dashed" title="Dashed">
                    <svg width="18" height="18" viewBox="0 0 18 18"><line x1="3" y1="9" x2="15" y2="9" stroke="#8a9489" strokeWidth="1.5" strokeDasharray="4 2" /></svg>
                </div>
                <div className="tool-btn" id="btn-dash-dotted" title="Dotted">
                    <svg width="18" height="18" viewBox="0 0 18 18"><line x1="3" y1="9" x2="15" y2="9" stroke="#8a9489" strokeWidth="1.5" strokeDasharray="1 3" /></svg>
                </div>
                <div className="tool-label">dash</div>
            </div>

        </nav>
    );
}
