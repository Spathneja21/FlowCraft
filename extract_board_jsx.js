import fs from 'fs';

const html = fs.readFileSync('board_feature.html', 'utf8');

// Extract body HTML
const bodyMatch = html.match(/<body>([\s\S]*?)<script>/);
let bodyContent = bodyMatch ? bodyMatch[1] : '';

// Convert HTML to JSX
bodyContent = bodyContent
  .replace(/class=/g, 'className=')
  .replace(/for=/g, 'htmlFor=')
  .replace(/stroke-width=/g, 'strokeWidth=')
  .replace(/stroke-opacity=/g, 'strokeOpacity=')
  .replace(/stroke-linecap=/g, 'strokeLinecap=')
  .replace(/stroke-linejoin=/g, 'strokeLinejoin=')
  .replace(/stroke-dasharray=/g, 'strokeDasharray=')
  .replace(/pointer-events=/g, 'pointerEvents=')
  .replace(/patternUnits=/g, 'patternUnits=')
  .replace(/markerWidth=/g, 'markerWidth=')
  .replace(/markerHeight=/g, 'markerHeight=')
  .replace(/refX=/g, 'refX=')
  .replace(/refY=/g, 'refY=')
  .replace(/onclick="[^"]*"/g, '')
  .replace(/oninput="[^"]*"/g, '')
  .replace(/onchange="[^"]*"/g, '')
  .replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}')
  .replace(/style="([^"]*)"/g, (match, p1) => {
    if (p1.includes('display:flex;flex-direction:column;align-items:center;gap:2px;')) {
      return `style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}`;
    }
    if (p1.includes('border-color:var(--accent);')) {
      return `style={{ borderColor: 'var(--accent)' }}`;
    }
    return `{/* CSS inline stripped */}`;
  });

// Remove trailing slashes BEFORE reapplying them
bodyContent = bodyContent.replace(/\s*\/>/g, '>');

// We'll wrap all inputs to suppress uncontrolled warnings or handle later
bodyContent = bodyContent.replace(/<input([^>]*)>/g, '<input$1 />');
bodyContent = bodyContent.replace(/<line([^>]*)>/g, '<line$1 />');
bodyContent = bodyContent.replace(/<rect([^>]*)>/g, '<rect$1 />');
bodyContent = bodyContent.replace(/<path([^>]*)>/g, '<path$1 />');
bodyContent = bodyContent.replace(/<polygon([^>]*)>/g, '<polygon$1 />');
bodyContent = bodyContent.replace(/<ellipse([^>]*)>/g, '<ellipse$1 />');
bodyContent = bodyContent.replace(/<polyline([^>]*)>/g, '<polyline$1 />');

// Extract JS
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
let scriptContent = scriptMatch ? scriptMatch[1] : '';

const jsxOutput = `import React, { useEffect, useRef } from 'react';
import './Board.css';

export default function Board({ boardId, onBack }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const document_getElementById = (id) => container.querySelector(\`#\${id}\`);
    const document_querySelectorAll = (sel) => container.querySelectorAll(sel);

    // Muted globals for safe execution
    ((document) => {
      const getElementById = document_getElementById;
      const querySelectorAll = document_querySelectorAll;

      ${scriptContent.replace(/document\.getElementById/g, 'getElementById')
    .replace(/document\.querySelectorAll/g, 'querySelectorAll')
    .replace(/window\.location\.href='dashboard.html'/g, 'onBack()')
    .replace(/previewL\.innerHTML/g, 'prevL.innerHTML')
    .replace(/const s=shapes\.find\(sh=>sh\.id===id\);/g, 'const s=shapes.find(sh=>sh.id===selectedId);')}
    })();

    return () => {};
  }, [boardId, onBack]);

  return (
    <div className="board-root" ref={containerRef}>
      ${bodyContent}
    </div>
  );
}
`;

fs.writeFileSync('src/components/Board.jsx', jsxOutput);
