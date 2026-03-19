import React, { useState, useEffect, useRef } from 'react';
import './Workspace.css';

import { useNavigate } from 'react-router-dom';

const STORAGE_KEY = 'flowcraft_boards';

const PREVIEW_PATTERNS = [
    `<rect x="20" y="28" width="72" height="32" rx="3" fill="none" stroke="#363c37" stroke-width="1"/>
   <text x="56" y="49" text-anchor="middle" font-family="DM Mono" font-size="8" fill="#4d5a4e">start</text>
   <line x1="92" y1="44" x2="116" y2="44" stroke="#363c37" stroke-width="1" marker-end="url(#arr)"/>
   <rect x="116" y="28" width="80" height="32" rx="3" fill="none" stroke="#5cdb8f" stroke-width="1" stroke-opacity="0.5"/>
   <text x="156" y="49" text-anchor="middle" font-family="DM Mono" font-size="8" fill="#4d5a4e">process</text>
   <line x1="156" y1="60" x2="156" y2="80" stroke="#363c37" stroke-width="1" marker-end="url(#arr)"/>
   <polygon points="156,80 136,104 176,104" fill="none" stroke="#363c37" stroke-width="1"/>
   <text x="156" y="97" text-anchor="middle" font-family="DM Mono" font-size="7" fill="#4d5a4e">decision</text>
   <line x1="176" y1="92" x2="210" y2="92" stroke="#363c37" stroke-width="1" marker-end="url(#arr)"/>
   <rect x="210" y="76" width="60" height="32" rx="3" fill="none" stroke="#363c37" stroke-width="1"/>
   <text x="240" y="97" text-anchor="middle" font-family="DM Mono" font-size="8" fill="#4d5a4e">end</text>`,

    `<ellipse cx="80" cy="44" rx="48" ry="22" fill="none" stroke="#363c37" stroke-width="1"/>
   <text x="80" y="49" text-anchor="middle" font-family="DM Mono" font-size="8" fill="#4d5a4e">init</text>
   <line x1="80" y1="66" x2="80" y2="80" stroke="#363c37" stroke-width="1" marker-end="url(#arr)"/>
   <rect x="32" y="80" width="96" height="30" rx="3" fill="none" stroke="#5cdb8f" stroke-width="1" stroke-opacity="0.4"/>
   <text x="80" y="100" text-anchor="middle" font-family="DM Mono" font-size="7" fill="#4d5a4e">validate input</text>
   <path d="M128 95 Q190 95 190 55 Q190 20 140 20 L120 20" fill="none" stroke="#363c37" stroke-width="1" stroke-dasharray="3 2" marker-end="url(#arr)"/>`,

    `<rect x="16" y="20" width="64" height="28" rx="3" fill="none" stroke="#363c37" stroke-width="1"/>
   <text x="48" y="39" text-anchor="middle" font-family="DM Mono" font-size="7" fill="#4d5a4e">frontend</text>
   <line x1="80" y1="34" x2="108" y2="34" stroke="#5cdb8f" stroke-width="1" stroke-opacity="0.5" marker-end="url(#arr)"/>
   <rect x="108" y="20" width="64" height="28" rx="3" fill="none" stroke="#5cdb8f" stroke-width="1" stroke-opacity="0.5"/>
   <text x="140" y="39" text-anchor="middle" font-family="DM Mono" font-size="7" fill="#4d5a4e">API layer</text>
   <line x1="172" y1="34" x2="200" y2="34" stroke="#363c37" stroke-width="1" marker-end="url(#arr)"/>
   <rect x="200" y="20" width="64" height="28" rx="3" fill="none" stroke="#363c37" stroke-width="1"/>
   <text x="232" y="39" text-anchor="middle" font-family="DM Mono" font-size="7" fill="#4d5a4e">database</text>
   <line x1="80" y1="76" x2="240" y2="76" stroke="#363c37" stroke-width="0.5" stroke-dasharray="2 2"/>
   <rect x="100" y="64" width="80" height="24" rx="3" fill="none" stroke="#363c37" stroke-width="1"/>
   <text x="140" y="80" text-anchor="middle" font-family="DM Mono" font-size="7" fill="#4d5a4e">middleware</text>`,

    `<rect x="30" y="16" width="76" height="28" rx="14" fill="none" stroke="#363c37" stroke-width="1"/>
   <text x="68" y="35" text-anchor="middle" font-family="DM Mono" font-size="7" fill="#4d5a4e">user login</text>
   <line x1="68" y1="44" x2="68" y2="60" stroke="#363c37" stroke-width="1" marker-end="url(#arr)"/>
   <polygon points="68,60 48,88 88,88" fill="none" stroke="#5cdb8f" stroke-width="1" stroke-opacity="0.6"/>
   <text x="68" y="79" text-anchor="middle" font-family="DM Mono" font-size="6" fill="#4d5a4e">valid?</text>
   <line x1="48" y1="74" x2="16" y2="74" stroke="#363c37" stroke-width="1" marker-end="url(#arr)"/>
   <rect x="16" y="88" width="56" height="24" rx="3" fill="none" stroke="#e05c5c" stroke-width="1" stroke-opacity="0.5"/>
   <text x="44" y="105" text-anchor="middle" font-family="DM Mono" font-size="6" fill="#4d5a4e">error</text>
   <line x1="88" y1="74" x2="210" y2="74" stroke="#363c37" stroke-width="1" marker-end="url(#arr)"/>
   <rect x="176" y="60" width="64" height="28" rx="3" fill="none" stroke="#363c37" stroke-width="1"/>
   <text x="208" y="79" text-anchor="middle" font-family="DM Mono" font-size="7" fill="#4d5a4e">dashboard</text>`,
];

function getPreviewSVG(index) {
    const pattern = PREVIEW_PATTERNS[index % PREVIEW_PATTERNS.length];
    return `<svg viewBox="0 0 280 130" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M2 2L8 5L2 8" fill="none" stroke="#363c37" stroke-width="1.5"/>
      </marker>
    </defs>
    ${pattern}
  </svg>`;
}

function formatDate(ts) {
    const d = new Date(ts);
    const now = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function generateId() {
    return 'board_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7);
}

export default function Workspace() {
    const navigate = useNavigate();
    const [boards, setBoards] = useState([]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newBoardName, setNewBoardName] = useState('');
    const modalInputRef = useRef(null);

    // Rename state
    const [renamingId, setRenamingId] = useState(null);
    const [renameValue, setRenameValue] = useState('');
    const renameInputRef = useRef(null);

    // Delete state
    const [deletingId, setDeletingId] = useState(null);
    const [removingId, setRemovingId] = useState(null); // CSS animation tracker

    // Flash UI state for opening
    const [openingId, setOpeningId] = useState(null);

    useEffect(() => {
        try {
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
            setBoards(stored);
        } catch {
            setBoards([]);
        }

        const handleEsc = (e) => {
            if (e.key === 'Escape') setIsModalOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    useEffect(() => {
        if (isModalOpen && modalInputRef.current) {
            setTimeout(() => modalInputRef.current.focus(), 250);
        }
    }, [isModalOpen]);

    useEffect(() => {
        if (renamingId && renameInputRef.current) {
            renameInputRef.current.focus();
            renameInputRef.current.select();
        }
    }, [renamingId]);

    const saveToStorage = (newBoards) => {
        setBoards(newBoards);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newBoards));
    };

    const createBoard = () => {
        const name = newBoardName.trim() || 'Untitled board';
        const newBoard = {
            id: generateId(),
            name,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            nodeCount: 0,
            previewIndex: boards.length,
        };
        const newBoards = [newBoard, ...boards];
        saveToStorage(newBoards);
        setIsModalOpen(false);
        setNewBoardName('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCreateKeyDown = (e) => {
        if (e.key === 'Enter') createBoard();
    };

    const openBoard = (id) => {
        setOpeningId(id);
        setTimeout(() => {
            setOpeningId(null);
            navigate('/board/' + id);
        }, 600);
    };

    const commitRename = (id) => {
        if (!renamingId) return;
        const name = renameValue.trim() || 'Untitled board';
        const newBoards = boards.map(b => b.id === id ? { ...b, name, updatedAt: Date.now() } : b);
        saveToStorage(newBoards);
        setRenamingId(null);
    };

    const confirmDelete = (id, e) => {
        e.stopPropagation();
        setDeletingId(null);
        setRemovingId(id);
        // Anim out then remove
        setTimeout(() => {
            const newBoards = boards.filter(b => b.id !== id);
            saveToStorage(newBoards);
            setRemovingId(null);
        }, 250);
    };

    return (
        <div className="workspace-root">
            <div className="workspace-bg" />

            {/* Topbar */}
            <header className="topbar">
                <div className="topbar-left">
                    <div className="logo-mark">
                        <svg viewBox="0 0 20 20" fill="none">
                            <rect x="1" y="1" width="7" height="7" rx="1" stroke="#5cdb8f" strokeWidth="1.2" />
                            <rect x="12" y="1" width="7" height="7" rx="1" stroke="#5cdb8f" strokeWidth="1.2" />
                            <rect x="6.5" y="12" width="7" height="7" rx="1" stroke="#5cdb8f" strokeWidth="1.2" />
                            <line x1="4.5" y1="8" x2="4.5" y2="15.5" stroke="#5cdb8f" strokeWidth="1" strokeOpacity="0.5" />
                            <line x1="15.5" y1="8" x2="15.5" y2="15.5" stroke="#5cdb8f" strokeWidth="1" strokeOpacity="0.5" />
                            <line x1="4.5" y1="15.5" x2="10" y2="15.5" stroke="#5cdb8f" strokeWidth="1" strokeOpacity="0.5" />
                            <line x1="15.5" y1="15.5" x2="10" y2="15.5" stroke="#5cdb8f" strokeWidth="1" strokeOpacity="0.5" />
                        </svg>
                    </div>
                    <div className="logo-name">Flow<span>Craft</span></div>
                    <div className="topbar-sep"></div>
                    <div className="topbar-route">workspace</div>
                </div>
                <div className="topbar-right">
                    <div className="user-chip">
                        <span className="user-dot"></span>
                        s_pathneja21
                    </div>
                    <button className="btn-signout" onClick={() => navigate('/login')}>sign out</button>
                </div>
            </header>

            {/* Main page */}
            <main className="page">
                <div className="section-head">
                    <div className="section-title-group">
                        <div className="section-eyebrow">// my workspace</div>
                        <div className="section-title">
                            Boards
                            <span className="board-count" id="board-count">{boards.length}</span>
                        </div>
                    </div>
                    <button className="btn-new" onClick={() => setIsModalOpen(true)}>
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <line x1="7" y1="1" x2="7" y2="13" stroke="#050e08" strokeWidth="1.8" strokeLinecap="round" />
                            <line x1="1" y1="7" x2="13" y2="7" stroke="#050e08" strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                        New board
                    </button>
                </div>

                <div className="boards-grid">
                    {boards.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-icon">
                                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                                    <rect x="1" y="1" width="8" height="8" rx="1.5" stroke="#4d5a4e" strokeWidth="1.2" />
                                    <rect x="13" y="1" width="8" height="8" rx="1.5" stroke="#4d5a4e" strokeWidth="1.2" />
                                    <rect x="7" y="13" width="8" height="8" rx="1.5" stroke="#4d5a4e" strokeWidth="1.2" />
                                    <line x1="5" y1="9" x2="5" y2="17" stroke="#4d5a4e" strokeWidth="1" strokeOpacity="0.5" />
                                    <line x1="17" y1="9" x2="17" y2="17" stroke="#4d5a4e" strokeWidth="1" strokeOpacity="0.5" />
                                    <line x1="5" y1="17" x2="11" y2="17" stroke="#4d5a4e" strokeWidth="1" strokeOpacity="0.5" />
                                    <line x1="17" y1="17" x2="11" y2="17" stroke="#4d5a4e" strokeWidth="1" strokeOpacity="0.5" />
                                </svg>
                            </div>
                            <div className="empty-label">No boards yet</div>
                            <div className="empty-sub">Create your first board to start<br />building flowcharts.</div>
                            <button className="btn-empty-new" onClick={() => setIsModalOpen(true)}>
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                    <line x1="6" y1="1" x2="6" y2="11" stroke="#5cdb8f" strokeWidth="1.6" strokeLinecap="round" />
                                    <line x1="1" y1="6" x2="11" y2="6" stroke="#5cdb8f" strokeWidth="1.6" strokeLinecap="round" />
                                </svg>
                                Create first board
                            </button>
                        </div>
                    ) : (
                        boards.map((board, i) => (
                            <div
                                key={board.id}
                                className={`board-card ${removingId === board.id ? 'removing' : ''}`}
                                style={{ animationDelay: `${i * 0.05}s`, borderColor: openingId === board.id ? 'var(--accent)' : '' }}
                                onClick={() => openBoard(board.id)}
                            >
                                <div className="card-preview">
                                    <div dangerouslySetInnerHTML={{ __html: getPreviewSVG(board.previewIndex ?? i) }} />
                                    <div className="card-open-hint">Open board →</div>
                                </div>

                                <div className="card-body">
                                    <div className="card-name-row">
                                        <div className={`card-name ${renamingId === board.id ? 'hidden' : ''}`}>
                                            {board.name}
                                        </div>
                                        {renamingId === board.id && (
                                            <input
                                                ref={renameInputRef}
                                                className="card-name-input active"
                                                value={renameValue}
                                                onChange={e => setRenameValue(e.target.value)}
                                                onBlur={() => commitRename(board.id)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') commitRename(board.id);
                                                    if (e.key === 'Escape') setRenamingId(null);
                                                }}
                                                maxLength="48"
                                                onClick={e => e.stopPropagation()}
                                            />
                                        )}

                                        <div className="card-actions">
                                            <div className="action-btn" title="Rename" onClick={(e) => {
                                                e.stopPropagation();
                                                setRenameValue(board.name);
                                                setRenamingId(board.id);
                                            }}>
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                    <path d="M1 9.5L3.5 10L10 3.5L8.5 2L2 8.5L1 9.5Z" stroke="#8a9489" strokeWidth="1" fill="none" />
                                                    <line x1="7.5" y1="2.5" x2="9.5" y2="4.5" stroke="#8a9489" strokeWidth="1" />
                                                </svg>
                                            </div>
                                            <div className="action-btn del" title="Delete" onClick={(e) => {
                                                e.stopPropagation();
                                                setDeletingId(board.id);
                                            }}>
                                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                    <path d="M2 3H10M4.5 3V2H7.5V3M4 5V9M8 5V9M3 3L3.5 10H8.5L9 3" stroke="#8a9489" strokeWidth="1" strokeLinecap="round" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-meta">
                                        <span>edited {formatDate(board.updatedAt)}</span>
                                        <span className="meta-sep">·</span>
                                        <span>{board.nodeCount ?? 0} nodes</span>
                                    </div>
                                </div>

                                <div className={`delete-confirm ${deletingId === board.id ? 'show' : ''}`} onClick={e => e.stopPropagation()}>
                                    <span>Delete "{board.name}"?</span>
                                    <button className="confirm-no" onClick={(e) => { e.stopPropagation(); setDeletingId(null); }}>no</button>
                                    <button className="confirm-yes" onClick={(e) => confirmDelete(board.id, e)}>yes, delete</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {/* Modal */}
            <div
                className={`modal-backdrop ${isModalOpen ? 'open' : ''}`}
                onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}
            >
                <div className="modal">
                    <div className="modal-header">
                        <div className="modal-title">New board</div>
                    </div>
                    <div className="modal-body">
                        <label className="modal-label" htmlFor="board-name-input">Board name</label>
                        <input
                            ref={modalInputRef}
                            className="modal-input"
                            id="board-name-input"
                            type="text"
                            placeholder="e.g. User flow, System design…"
                            maxLength="48"
                            autoComplete="off"
                            value={newBoardName}
                            onChange={e => setNewBoardName(e.target.value)}
                            onKeyDown={handleCreateKeyDown}
                        />
                    </div>
                    <div className="modal-footer">
                        <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        <button className="btn-create" onClick={createBoard}>Create board</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
