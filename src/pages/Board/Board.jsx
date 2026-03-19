/* eslint-disable */
import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import './Board.css';
import { initBoardLogic } from './boardLogic';

import Topbar from './components/Topbar';
import Toolbar from './components/Toolbar';
import PropertiesPanel from './components/PropertiesPanel';
import Canvas from './components/Canvas';
import StatusBar from './components/StatusBar';

export default function Board() {
  const { boardId } = useParams();
  const navigate = useNavigate();
  const onBack = () => navigate('/workspace');
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      initBoardLogic(containerRef.current, boardId, onBack);
    }
    // Note: cleanup not needed — engine only adds listeners scoped to this container
  }, [boardId]);

  return (
    <div className="board-root" ref={containerRef}>

      <Topbar onBack={onBack} />

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

    </div>
  );
}
