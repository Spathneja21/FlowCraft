import React from 'react';

export default function PropertiesPanel() {
    return (
        <aside className="props" id="props-panel">
            <div className="props-header">properties</div>

            <div className="props-section" id="props-geometry">
                <div className="props-label">geometry</div>
                <div className="props-row"><label>x</label><input className="props-input" id="prop-x" type="number" /></div>
                <div className="props-row"><label>y</label><input className="props-input" id="prop-y" type="number" /></div>
                <div className="props-row"><label>w</label><input className="props-input" id="prop-w" type="number" /></div>
                <div className="props-row"><label>h</label><input className="props-input" id="prop-h" type="number" /></div>
            </div>

            <div className="props-section">
                <div className="props-label">appearance</div>
                <div className="props-row">
                    <label>stroke</label>
                    <div className="color-swatch" id="ps-stroke">
                        <input type="color" id="ps-stroke-input" />
                        <div className="color-preview" id="ps-stroke-preview"></div>
                    </div>
                </div>
                <div className="props-row">
                    <label>fill</label>
                    <div className="color-swatch" id="ps-fill">
                        <input type="color" id="ps-fill-input" />
                        <div className="color-preview" id="ps-fill-preview"></div>
                    </div>
                </div>
                <div className="props-row">
                    <label>stroke w</label>
                    <input className="props-input" id="ps-sw" type="number" min="1" max="20" />
                </div>
            </div>

            <div className="props-section" id="props-text-section">
                <div className="props-label">text</div>
                <div className="props-row">
                    <label>color</label>
                    <div className="color-swatch">
                        <input type="color" id="ps-textcol-input" />
                        <div className="color-preview" id="ps-textcol-preview"></div>
                    </div>
                </div>
                <div className="props-row">
                    <label>size</label>
                    <input className="props-input" id="ps-fontsize" type="number" min="8" max="72" />
                </div>
                <div className="props-row">
                    <label>font</label>
                    <select className="props-select" id="ps-font">
                        <option value="DM Mono">DM Mono</option>
                        <option value="Syne">Syne</option>
                        <option value="serif">Serif</option>
                        <option value="sans-serif">Sans</option>
                    </select>
                </div>
            </div>

            <div className="props-section">
                <button className="btn-delete-shape" id="btn-delete-prop">delete shape</button>
            </div>
        </aside>
    );
}
