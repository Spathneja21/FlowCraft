import React from 'react';

export default function Topbar({ onBack, onOpenShortcuts }) {
    return (
        <header className="topbar">
            <div className="topbar-left">
                <div className="logo-mark" onClick={onBack} style={{ cursor: 'pointer' }} title="Back to workspace">
                    <svg viewBox="0 0 20 20" fill="none">
                        <rect x="1" y="1" width="7" height="7" rx="1" stroke="#5cdb8f" strokeWidth="1.2" />
                        <rect x="12" y="1" width="7" height="7" rx="1" stroke="#5cdb8f" strokeWidth="1.2" />
                        <rect x="6.5" y="12" width="7" height="7" rx="1" stroke="#5cdb8f" strokeWidth="1.2" />
                        <line x1="4.5" y1="8" x2="4.5" y2="15.5" stroke="#5cdb8f" strokeWidth="1" strokeOpacity="0.5" />
                        <line x1="15.5" y1="8" x2="15.5" y2="15.5" stroke="#5cdb8f" strokeWidth="1" strokeOpacity="0.5" />
                        <line x1="4.5" y1="15.5" x2="10" y2="15.5" stroke="#5cdb8f" strokeWidth="1" strokeOpacity="0.5" />
                        <line x1="15.5" y1="15.5" x2="10" y2="15.5" stroke="#5cdb8f" strokeWidth="1" strokeOpacity="0.5" />
                    </svg>
                </div>
                <div className="logo-name">Flow<span>Craft</span></div>
                <div className="sep"></div>
                <input className="board-title-input" id="board-title" defaultValue="Untitled board" spellCheck="false" />
            </div>
            <div className="topbar-center">
                <span className="saved-badge" id="saved-badge">saved</span>
            </div>
            <div className="topbar-right">
                <button className="btn-top" id="tool-undo" title="Undo (Ctrl+Z)">↩ undo</button>
                <button className="btn-top" id="tool-redo" title="Redo (Ctrl+Y)">↪ redo</button>
                <button className="btn-top" id="tool-fit" title="Fit board in view (Home)">⊡ fit</button>
                <button className="btn-top" id="tool-clear" title="Clear all">clear</button>
                <button className="btn-top primary" id="tool-export">export svg</button>
                <button className="btn-top" onClick={onOpenShortcuts} title="Customize keyboard shortcuts">⌨ keys</button>
            </div>
        </header>
    );
}
