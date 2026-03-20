import React, { useState, useEffect, useRef } from 'react';

/* ─────────────────────────────────────────────────────────────────
   SHAPE DEFINITIONS
   Each entry: id (matches boardLogic tool name), label, SVG icon
───────────────────────────────────────────────────────────────── */
export const SHAPES = [
    {
        id: 'rect',
        label: 'Rectangle',
        key: 'R',
        icon: (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="4" width="14" height="10" rx="1" stroke="#8a9489" strokeWidth="1.3" fill="none" />
            </svg>
        ),
    },
    {
        id: 'ellipse',
        label: 'Ellipse',
        key: 'E',
        icon: (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <ellipse cx="9" cy="9" rx="7" ry="5" stroke="#8a9489" strokeWidth="1.3" fill="none" />
            </svg>
        ),
    },
    {
        id: 'diamond',
        label: 'Diamond',
        key: 'D',
        icon: (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <polygon points="9,2 16,9 9,16 2,9" stroke="#8a9489" strokeWidth="1.3" fill="none" />
            </svg>
        ),
    },
    {
        id: 'parallelogram',
        label: 'Parallelogram',
        key: 'P',
        icon: (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <polygon points="4,14 7,4 14,4 11,14" stroke="#8a9489" strokeWidth="1.3" fill="none" />
            </svg>
        ),
    },
    {
        id: 'line',
        label: 'Line',
        key: 'L',
        icon: (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <line x1="3" y1="15" x2="15" y2="3" stroke="#8a9489" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        id: 'arrow',
        label: 'Arrow',
        key: 'A',
        icon: (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <line x1="3" y1="15" x2="14" y2="4" stroke="#8a9489" strokeWidth="1.3" strokeLinecap="round" />
                <polyline points="8,4 14,4 14,10" stroke="#8a9489" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
        ),
    },
    {
        id: 'curve',
        label: 'Curve',
        key: 'C',
        icon: (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M3 14 Q9 2 15 14" stroke="#8a9489" strokeWidth="1.3" fill="none" strokeLinecap="round" />
            </svg>
        ),
    },
];

/* ─────────────────────────────────────────────────────────────────
   SHAPE PICKER COMPONENT
   - Left-click the box  → activate current shape tool
   - Right-click the box → open the shape flyout menu
───────────────────────────────────────────────────────────────── */
export default function ShapePicker() {
    const [activeShape, setActiveShape] = useState('rect');
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const currentShape = SHAPES.find(s => s.id === activeShape) || SHAPES[0];

    // Dispatch a custom event so boardLogic can listen and change tool
    const dispatchToolChange = (toolId) => {
        const event = new CustomEvent('fc:settool', { detail: { tool: toolId }, bubbles: true });
        document.dispatchEvent(event);
    };

    // Left-click: activate the current shape
    const handleClick = (e) => {
        e.preventDefault();
        dispatchToolChange(activeShape);
        // Visually mark as active (boardLogic also does this, but let's keep it snappy)
        document.querySelectorAll('.tool-btn[id^="tool-"]').forEach(b => b.classList.remove('active'));
    };

    // Right-click: open shape picker menu
    const handleContextMenu = (e) => {
        e.preventDefault();
        setMenuOpen(prev => !prev);
    };

    // Clicking a menu item selects that shape AND activates it
    const selectShape = (shapeId) => {
        setActiveShape(shapeId);
        setMenuOpen(false);
        dispatchToolChange(shapeId);
    };

    // Close menu on outside click
    useEffect(() => {
        const handler = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Sync from keyboard shortcuts in boardLogic
    useEffect(() => {
        const handler = (e) => {
            const shape = SHAPES.find(s => s.key.toLowerCase() === e.key.toLowerCase());
            if (shape) setActiveShape(shape.id);
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    return (
        <div className="shape-picker-wrap" ref={menuRef}>
            {/* Current shape button */}
            <div
                className="tool-btn shape-picker-btn active"
                id="tool-shape-picker"
                title="Shape — left click to draw, right click to change"
                onClick={handleClick}
                onContextMenu={handleContextMenu}
            >
                {currentShape.icon}
                {/* Small indicator arrow */}
                <span className="shape-picker-arrow">▾</span>
            </div>
            <div className="tool-label">{currentShape.label.slice(0, 4)}</div>

            {/* Flyout menu */}
            {menuOpen && (
                <div className="shape-flyout">
                    <div className="shape-flyout-title">shapes</div>
                    {SHAPES.map(shape => (
                        <button
                            key={shape.id}
                            className={`shape-flyout-item ${activeShape === shape.id ? 'active' : ''}`}
                            onClick={() => selectShape(shape.id)}
                        >
                            <span className="flyout-icon">{shape.icon}</span>
                            <span className="flyout-label">{shape.label}</span>
                            <span className="flyout-key">{shape.key}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
