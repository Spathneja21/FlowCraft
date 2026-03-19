import React from 'react';

export default function StatusBar() {
    return (
        <div className="statusbar">
            <span className="status-item" id="status-tool">tool: select</span>
            <div className="status-sep"></div>
            <span className="status-item" id="status-shapes">shapes: 0</span>
            <div className="status-sep"></div>
            <span className="status-item" id="status-pos">x: 0  y: 0</span>
            <div className="status-sep"></div>
            <span className="status-item" id="status-zoom">zoom: 100%</span>
        </div>
    );
}
