import React from 'react';

export default function Canvas() {
    return (
        <div className="canvas-wrap props-closed" id="canvas-wrap">
            <svg id="canvas" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="smallgrid" width="16" height="16" patternUnits="userSpaceOnUse">
                        <path d="M 16 0 L 0 0 0 16" fill="none" stroke="#2a2e2b" strokeWidth="0.4" />
                    </pattern>
                    <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
                        <rect width="80" height="80" fill="url(#smallgrid)" />
                        <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#2a2e2b" strokeWidth="0.8" />
                    </pattern>
                    <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L8,3 z" fill="#8a9489" />
                    </marker>
                    <marker id="arrowhead-sel" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                        <path d="M0,0 L0,6 L8,3 z" fill="#5cdb8f" />
                    </marker>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" id="canvas-grid" />
                <g id="viewport">
                    <g id="board-layer"></g>
                    <g id="shapes-layer"></g>
                    <g id="selection-layer"></g>
                    <g id="preview-layer"></g>
                </g>
            </svg>
            <div className="zoom-controls">
                <div className="zoom-btn" id="btn-zoom-in" title="Zoom in (+)">+</div>
                <div className="zoom-btn" id="zoom-pct" title="Reset zoom (Ctrl+0)">100%</div>
                <div className="zoom-btn" id="btn-zoom-out" title="Zoom out (−)">−</div>
            </div>
        </div>
    );
}
