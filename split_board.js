import fs from 'fs';
import path from 'path';

const boardJsxPath = path.join('src', 'pages', 'Board', 'Board.jsx');
const code = fs.readFileSync(boardJsxPath, 'utf8');

const logicStart = code.indexOf('    const document_getElementById');
const logicEnd = code.lastIndexOf('    })();');

if (logicStart === -1 || logicEnd === -1) {
    console.log("Could not find logic block");
    process.exit(1);
}

const logicBody = code.substring(logicStart, logicEnd);
const boardLogicText = `/* eslint-disable */
export function initBoardLogic(container, boardId, onBack) {
${logicBody}
  })();
}
`;

fs.writeFileSync(path.join('src', 'pages', 'Board', 'boardLogic.js'), boardLogicText);

// Match the HTML parts so we can extract them.
const topbarMatch = code.match(/(<header className="topbar">[\s\S]*?<\/header>)/);
const toolbarMatch = code.match(/(<nav className="toolbar" id="toolbar">[\s\S]*?<\/nav>)/);
const propsMatch = code.match(/(<aside className="props" id="props-panel">[\s\S]*?<\/aside>)/);

fs.writeFileSync(path.join('src', 'pages', 'Board', 'components', 'Topbar.jsx'), `import React from 'react';\n\nexport default function Topbar({ onBack }) {\n  return (\n    ${topbarMatch[1].replace(/onClick=\{onBack\}/g, 'onClick={onBack}')}\n  );\n}\n`);
fs.writeFileSync(path.join('src', 'pages', 'Board', 'components', 'Toolbar.jsx'), `import React from 'react';\n\nexport default function Toolbar() {\n  return (\n    ${toolbarMatch[1]}\n  );\n}\n`);
fs.writeFileSync(path.join('src', 'pages', 'Board', 'components', 'PropertiesPanel.jsx'), `import React from 'react';\n\nexport default function PropertiesPanel() {\n  return (\n    ${propsMatch[1]}\n  );\n}\n`);

// Rewrite Board.jsx
let newBoardJsx = code;
newBoardJsx = newBoardJsx.replace(/import \{.*?\} from 'react-router-dom';/, `$&
import { initBoardLogic } from './boardLogic';

import Topbar from './components/Topbar';
import Toolbar from './components/Toolbar';
import PropertiesPanel from './components/PropertiesPanel';`);

newBoardJsx = newBoardJsx.replace(/useEffect\(\(\) => \{[\s\S]*?\}, \[boardId, onBack\]\);/,
    `useEffect(() => {
    if (containerRef.current) {
      initBoardLogic(containerRef.current, boardId, onBack);
    }
  }, [boardId, onBack]);`);

newBoardJsx = newBoardJsx.replace(/<header className="topbar">[\s\S]*?<\/header>/, '<Topbar onBack={onBack} />');
newBoardJsx = newBoardJsx.replace(/<nav className="toolbar" id="toolbar">[\s\S]*?<\/nav>/, '<Toolbar />');
newBoardJsx = newBoardJsx.replace(/<aside className="props" id="props-panel">[\s\S]*?<\/aside>/, '<PropertiesPanel />');

fs.writeFileSync(boardJsxPath, newBoardJsx);
console.log("Successfully broke down Board.jsx into subcomponents and pure logic script!");
