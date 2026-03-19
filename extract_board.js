import fs from 'fs';

const html = fs.readFileSync('board_feature.html', 'utf8');
const match = html.match(/<style>([\s\S]*?)<\/style>/);
if (!match) process.exit(1);

let css = match[1];
css = css.replace(/\*,\*::before,\*::after\{[\s\S]*?\}/, '');
css = css.replace(/:root\{[\s\S]*?\}/, '.board-root {\n  --bg4:#1f2420;\n  --border3:#424a43;\n  --accent-bg:#0e2318;\n  --red-bg:#2a1212;\n  --sel:#5cdb8f;\n}\n');
css = css.replace(/html,body\{[\s\S]*?\}/, '.board-root {\n  height: 100vh;\n  overflow: hidden;\n  background: var(--bg);\n  color: var(--text);\n  font-family: var(--mono);\n}\n');

fs.writeFileSync('src/components/Board.css', css);
