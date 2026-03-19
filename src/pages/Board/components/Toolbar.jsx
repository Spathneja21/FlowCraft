import React from 'react';

export default function Toolbar() {
    return (
        <nav className="toolbar" id="toolbar">
            {/* Select */}
            <div className="tool-btn active" id="tool-select" title="Select (V)">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M3 2L3 14L7 10L9.5 16L11.5 15L9 9L14 9L3 2Z" stroke="#8a9489" strokeWidth="1.2" strokeLinejoin="round" fill="none" />
                </svg>
            </div>

            <div className="tool-sep"></div>

            {/* Rectangle */}
            <div className="tool-btn" id="tool-rect" title="Rectangle (R)">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <rect x="2" y="4" width="14" height="10" rx="1" stroke="#8a9489" strokeWidth="1.3" fill="none" />
                </svg>
            </div>

            {/* Diamond */}
            <div className="tool-btn" id="tool-diamond" title="Diamond (D)">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <polygon points="9,2 16,9 9,16 2,9" stroke="#8a9489" strokeWidth="1.3" fill="none" />
                </svg>
            </div>

            {/* Ellipse */}
            <div className="tool-btn" id="tool-ellipse" title="Ellipse (E)">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <ellipse cx="9" cy="9" rx="7" ry="5" stroke="#8a9489" strokeWidth="1.3" fill="none" />
                </svg>
            </div>

            {/* Parallelogram */}
            <div className="tool-btn" id="tool-parallelogram" title="Parallelogram (P)">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <polygon points="4,14 7,4 14,4 11,14" stroke="#8a9489" strokeWidth="1.3" fill="none" />
                </svg>
            </div>

            <div className="tool-sep"></div>

            {/* Line */}
            <div className="tool-btn" id="tool-line" title="Line (L)">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <line x1="3" y1="15" x2="15" y2="3" stroke="#8a9489" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
            </div>

            {/* Arrow */}
            <div className="tool-btn" id="tool-arrow" title="Arrow (A)">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <line x1="3" y1="15" x2="14" y2="4" stroke="#8a9489" strokeWidth="1.3" strokeLinecap="round" />
                    <polyline points="8,4 14,4 14,10" stroke="#8a9489" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
            </div>

            {/* Curved line */}
            <div className="tool-btn" id="tool-curve" title="Curve (C)">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M3 14 Q9 2 15 14" stroke="#8a9489" strokeWidth="1.3" fill="none" strokeLinecap="round" />
                </svg>
            </div>

            <div className="tool-sep"></div>

            {/* Text */}
            <div className="tool-btn" id="tool-text" title="Text (T)">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <line x1="3" y1="4" x2="15" y2="4" stroke="#8a9489" strokeWidth="1.3" strokeLinecap="round" />
                    <line x1="9" y1="4" x2="9" y2="15" stroke="#8a9489" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
            </div>

            <div className="tool-sep"></div>

            {/* Stroke color */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <div className="tool-btn" id="btn-stroke-color" title="Stroke color">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <rect x="2" y="2" width="14" height="11" rx="1" stroke="#8a9489" strokeWidth="1.2" fill="none" />
                        <rect x="2" y="14" width="14" height="3" rx="1" id="stroke-color-bar" fill="#5cdb8f" />
                    </svg>
                </div>
                <div className="tool-label">stroke</div>
            </div>

            {/* Fill color */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <div className="tool-btn" id="btn-fill-color" title="Fill color">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <rect x="2" y="2" width="14" height="14" rx="2" id="fill-color-bar" fill="#1a1d1b" stroke="#8a9489" strokeWidth="1.2" />
                        <path d="M6 9 L9 6 L12 9 L9 12 Z" fill="#8a9489" opacity="0.5" />
                    </svg>
                </div>
                <div className="tool-label">fill</div>
            </div>

            {/* Text color */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <div className="tool-btn" id="btn-text-color" title="Text color">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <text x="4" y="13" fontFamily="Syne" fontSize="12" fontWeight="700" fill="#e8ede9">A</text>
                        <rect x="2" y="14" width="14" height="3" rx="1" id="text-color-bar" fill="#e8ede9" />
                    </svg>
                </div>
                <div className="tool-label">text</div>
            </div>

            <div className="tool-sep"></div>

            {/* Stroke width */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <div className="tool-btn" id="btn-sw-1" title="Thin stroke" style={{ borderColor: 'var(--accent)' }}>
                    <svg width="18" height="18" viewBox="0 0 18 18"><line x1="3" y1="9" x2="15" y2="9" stroke="#8a9489" strokeWidth="1" strokeLinecap="round" /></svg>
                </div>
                <div className="tool-btn" id="btn-sw-2" title="Medium stroke">
                    <svg width="18" height="18" viewBox="0 0 18 18"><line x1="3" y1="9" x2="15" y2="9" stroke="#8a9489" strokeWidth="2" strokeLinecap="round" /></svg>
                </div>
                <div className="tool-btn" id="btn-sw-3" title="Thick stroke">
                    <svg width="18" height="18" viewBox="0 0 18 18"><line x1="3" y1="9" x2="15" y2="9" stroke="#8a9489" strokeWidth="3" strokeLinecap="round" /></svg>
                </div>
                <div className="tool-label">width</div>
            </div>

            {/* Dash style */}
            <div className="tool-sep"></div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                <div className="tool-btn active" id="btn-dash-solid" title="Solid line">
                    <svg width="18" height="18" viewBox="0 0 18 18"><line x1="3" y1="9" x2="15" y2="9" stroke="#8a9489" strokeWidth="1.5" /></svg>
                </div>
                <div className="tool-btn" id="btn-dash-dashed" title="Dashed line">
                    <svg width="18" height="18" viewBox="0 0 18 18"><line x1="3" y1="9" x2="15" y2="9" stroke="#8a9489" strokeWidth="1.5" strokeDasharray="4 2" /></svg>
                </div>
                <div className="tool-btn" id="btn-dash-dotted" title="Dotted line">
                    <svg width="18" height="18" viewBox="0 0 18 18"><line x1="3" y1="9" x2="15" y2="9" stroke="#8a9489" strokeWidth="1.5" strokeDasharray="1 3" /></svg>
                </div>
                <div className="tool-label">dash</div>
            </div>
        </nav>
    );
}
