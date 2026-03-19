import fs from 'fs';

const html = fs.readFileSync('new_feature.bak', 'utf8');
const match = html.match(/<style>([\s\S]*?)<\/style>/);
if (!match) process.exit(1);

let css = match[1];

css = css.replace(/\*,\s*\*::before,\s*\*::after\s*\{[\s\S]*?\}/, '');
css = css.replace(/:root\s*\{[\s\S]*?\}/, '.workspace-root {\n  --bg4: #1f2420;\n  --border3: #424a43;\n  --accent-bg: #0e2318;\n  --red-bg: #2a1212;\n}\n');
css = css.replace(/html\s*\{[\s\S]*?\}/, '');
css = css.replace(/body\s*\{[\s\S]*?\}/, '.workspace-root {\n  min-height: 100vh;\n  background: var(--bg);\n  color: var(--text);\n  font-family: var(--mono);\n  overflow-x: hidden;\n}\n');
css = css.replace(/body::before\s*\{([\s\S]*?)\}/, '.workspace-bg {$1}');
css = css.replace(/body::after\s*\{([\s\S]*?)\}/, '.workspace-bg::after {$1}');

fs.writeFileSync('src/components/Workspace.css', css);
