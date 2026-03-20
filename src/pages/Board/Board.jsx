/* eslint-disable */
import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import './Board.css';
import { initBoardLogic } from './boardLogic';

import Topbar from './components/Topbar';
import Toolbar from './components/Toolbar';
import PropertiesPanel from './components/PropertiesPanel';
import Canvas from './components/Canvas';
import StatusBar from './components/StatusBar';
import ShortcutEditor from './components/ShortcutEditor';

export default function Board() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const onBack = () => navigate('/workspace');
  const containerRef = useRef(null);
  const [showShortcuts, setShowShortcuts] = useState(false);

  useEffect(() => {
    if (containerRef.current) {
      const cleanup = initBoardLogic(containerRef.current, boardId, onBack);
      return cleanup;
    }
  }, [boardId]);

  return (
    <div className="board-root" ref={containerRef}>

      <Topbar
        onBack={onBack}
        onOpenShortcuts={() => setShowShortcuts(true)}
      />

      <Toolbar />

      <Canvas />

      <PropertiesPanel />

      {/* Inline text editor */}
      <textarea id="text-editor" rows="1" spellCheck="false"></textarea>

      {/* Color palette popup */}
      <div className="color-palette" id="color-palette"></div>

      <StatusBar />

      {/* Tooltip */}
      <div className="tooltip" id="tooltip"></div>

      {/* Keyboard Shortcut Editor Modal */}
      {showShortcuts && (
        <ShortcutEditor onClose={() => setShowShortcuts(false)} />
      )}

    </div>
  );
}
