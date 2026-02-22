"use client";

import { useState, useCallback, useRef, useEffect } from "react";

// ============================================
// CATALOG
// ============================================
const ITEM_TYPES = {
    caixaBranca: {
        id: "caixaBranca",
        name: "Caixa Branca",
        icon: "📦",
        w: 1, h: 1,
    },
    prateleira: {
        id: "prateleira",
        name: "Prateleira",
        icon: "🗄️",
        w: 1, h: 1,
    },
};

// ============================================
// ISO MATH HELPERS
// ============================================
const TILE_W = 64;
const TILE_H = 32;

function gridToIso(gx, gy, rotation = 0) {
    let rx, ry;
    switch (rotation) {
        case 1: rx = gy; ry = -gx; break;
        case 2: rx = -gx; ry = -gy; break;
        case 3: rx = -gy; ry = gx; break;
        default: rx = gx; ry = gy; break;
    }
    return {
        x: (rx - ry) * (TILE_W / 2),
        y: (rx + ry) * (TILE_H / 2),
    };
}

// ============================================
// ISOMETRIC TILE COMPONENT
// ============================================
function IsoTile({ gx, gy, rotation, highlight, highlightColor, onClick, onMouseEnter }) {
    const { x, y } = gridToIso(gx, gy, rotation);
    const isEven = (gx + gy) % 2 === 0;

    return (
        <g
            transform={`translate(${x}, ${y})`}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            style={{ cursor: "pointer" }}
        >
            <polygon
                points={`0,0 ${TILE_W / 2},${TILE_H / 2} 0,${TILE_H} ${-TILE_W / 2},${TILE_H / 2}`}
                fill={highlight ? highlightColor : (isEven ? "#e8dcc8" : "#ddd0b8")}
                stroke="#c4b8a4"
                strokeWidth="0.5"
                opacity={highlight ? 0.8 : 1}
            />
            <polygon
                points={`0,1 ${TILE_W / 2 - 2},${TILE_H / 2} 0,${TILE_H - 1} ${-TILE_W / 2 + 2},${TILE_H / 2}`}
                fill="white"
                opacity="0.05"
            />
        </g>
    );
}

// ============================================
// SHARED CONSTANTS
// ============================================
const STACK_COUNT = 6;
const CRATE_H = 20;
const TOTAL_STACK_H = STACK_COUNT * CRATE_H; // 54px total

// ============================================
// ISOMETRIC CRATE COMPONENT (bloco branco simples)
// ============================================
function IsoCrate({ furniture, gx, gy, rotation, onClick, isSelected }) {
    const { x, y } = gridToIso(gx, gy, rotation);

    const fw = 1;
    const fh = 1;
    const height = TOTAL_STACK_H;

    const topLeft = { x: 0, y: 0 };
    const topRight = { x: fw * (TILE_W / 2), y: fw * (TILE_H / 2) };
    const bottomRight = { x: (fw - fh) * (TILE_W / 2), y: (fw + fh) * (TILE_H / 2) };
    const bottomLeft = { x: -fh * (TILE_W / 2), y: fh * (TILE_H / 2) };

    const borderColor = isSelected ? "#FFD700" : "#c5c0b8";
    const borderWidth = isSelected ? 2 : 0.5;

    return (
        <g
            transform={`translate(${x}, ${y})`}
            onClick={(e) => { e.stopPropagation(); onClick && onClick(furniture); }}
            style={{ cursor: "pointer" }}
        >
            {/* Left face */}
            <polygon
                points={`
                    ${bottomLeft.x},${bottomLeft.y}
                    ${bottomRight.x},${bottomRight.y}
                    ${bottomRight.x},${bottomRight.y - height}
                    ${bottomLeft.x},${bottomLeft.y - height}
                `}
                fill="#e0ddd5"
                stroke={borderColor}
                strokeWidth={borderWidth}
            />

            {/* Right face */}
            <polygon
                points={`
                    ${topRight.x},${topRight.y}
                    ${bottomRight.x},${bottomRight.y}
                    ${bottomRight.x},${bottomRight.y - height}
                    ${topRight.x},${topRight.y - height}
                `}
                fill="#d3d0c8"
                stroke={borderColor}
                strokeWidth={borderWidth}
            />

            {/* Top face */}
            <polygon
                points={`
                    ${topLeft.x},${topLeft.y - height}
                    ${topRight.x},${topRight.y - height}
                    ${bottomRight.x},${bottomRight.y - height}
                    ${bottomLeft.x},${bottomLeft.y - height}
                `}
                fill="#eceae2"
                stroke={borderColor}
                strokeWidth={borderWidth}
            />

            {/* Top highlights */}
            <line
                x1={topLeft.x} y1={topLeft.y - height}
                x2={topRight.x} y2={topRight.y - height}
                stroke="white" strokeWidth="0.6" opacity="0.3"
            />
            <line
                x1={topLeft.x} y1={topLeft.y - height}
                x2={bottomLeft.x} y2={bottomLeft.y - height}
                stroke="white" strokeWidth="0.6" opacity="0.2"
            />

            {/* Selection glow */}
            {isSelected && (
                <polygon
                    points={`
                        ${topLeft.x},${topLeft.y - height}
                        ${topRight.x},${topRight.y - height}
                        ${bottomRight.x},${bottomRight.y - height}
                        ${bottomLeft.x},${bottomLeft.y - height}
                    `}
                    fill="rgba(255,215,0,0.15)" stroke="#FFD700" strokeWidth="2"
                />
            )}
        </g>
    );
}

// ============================================
// ISOMETRIC SHELF COLUMN COMPONENT
// ============================================
function IsoShelf({ furniture, gx, gy, rotation, onClick, isSelected }) {
    const { x, y } = gridToIso(gx, gy, rotation);

    const fw = 1;
    const fh = 1;
    const height = TOTAL_STACK_H; // same height as stacked crates
    const shelfCount = 5; // number of shelf levels

    const topLeft = { x: 0, y: 0 };
    const topRight = { x: fw * (TILE_W / 2), y: fw * (TILE_H / 2) };
    const bottomRight = { x: (fw - fh) * (TILE_W / 2), y: (fw + fh) * (TILE_H / 2) };
    const bottomLeft = { x: -fh * (TILE_W / 2), y: fh * (TILE_H / 2) };

    // Rusty brown/orange metal colors
    const frameColor = "#FF6600";
    const frameDark = "#6B4226";
    const frameRight = "#5A3520";
    const shelfColor = "#FF6600";
    const binColor = "#2a2218";
    const binHighlight = "#3d3028";
    const borderColor = isSelected ? "#FFD700" : "#FF6600";
    const borderWidth = isSelected ? 2 : 0.5;

    // Vertical post width (in pixels relative to face)
    const postW = 2;

    return (
        <g
            transform={`translate(${x}, ${y})`}
            onClick={(e) => { e.stopPropagation(); onClick && onClick(furniture); }}
            style={{ cursor: "pointer" }}
        >
            {/* ====== LEFT FACE ====== */}
            {/* Full left face background */}
            <polygon
                points={`${bottomLeft.x},${bottomLeft.y} ${bottomRight.x},${bottomRight.y} ${bottomRight.x},${bottomRight.y - height} ${bottomLeft.x},${bottomLeft.y - height}`}
                fill={frameDark}
                stroke={borderColor}
                strokeWidth={borderWidth}
            />

            {/* Left face - vertical posts (edges) */}
            {/* Left post */}
            <polygon
                points={`
                    ${bottomLeft.x},${bottomLeft.y}
                    ${bottomLeft.x + postW * 0.7},${bottomLeft.y + postW * 0.35}
                    ${bottomLeft.x + postW * 0.7},${bottomLeft.y + postW * 0.35 - height}
                    ${bottomLeft.x},${bottomLeft.y - height}
                `}
                fill="#FF6600"
            />
            {/* Right post */}
            <polygon
                points={`
                    ${bottomRight.x - postW * 0.7},${bottomRight.y - postW * 0.35}
                    ${bottomRight.x},${bottomRight.y}
                    ${bottomRight.x},${bottomRight.y - height}
                    ${bottomRight.x - postW * 0.7},${bottomRight.y - postW * 0.35 - height}
                `}
                fill="#FF6600"
            />

            {/* Left face - shelf compartments */}
            {Array.from({ length: shelfCount }, (_, i) => {
                const shelfH = height / shelfCount;
                const yTop = -i * shelfH;
                const yBot = -(i + 1) * shelfH;

                // Shelf divider line (horizontal metal shelf)
                const shelfThick = 1.5;

                return (
                    <g key={`ls${i}`}>
                        {/* Dark bin interior */}
                        <polygon
                            points={`
                                ${bottomLeft.x + postW},${bottomLeft.y + postW * 0.5 + yBot + shelfThick}
                                ${bottomRight.x - postW},${bottomRight.y - postW * 0.5 + yBot + shelfThick}
                                ${bottomRight.x - postW},${bottomRight.y - postW * 0.5 + yTop - shelfThick}
                                ${bottomLeft.x + postW},${bottomLeft.y + postW * 0.5 + yTop - shelfThick}
                            `}
                            fill={i % 2 === 0 ? binColor : binHighlight}
                        />
                        {/* Small items inside bins (tiny lines to suggest contents) */}
                        {[0.3, 0.5, 0.7].map((r, j) => (
                            <line
                                key={`lc${i}${j}`}
                                x1={bottomLeft.x + postW + (bottomRight.x - bottomLeft.x - postW * 2) * (r - 0.05)}
                                y1={bottomLeft.y + postW * 0.5 + (yBot + yTop) / 2 + (bottomRight.y - bottomLeft.y) * (r - 0.05) * 0.3 - 1}
                                x2={bottomLeft.x + postW + (bottomRight.x - bottomLeft.x - postW * 2) * (r + 0.05)}
                                y2={bottomLeft.y + postW * 0.5 + (yBot + yTop) / 2 + (bottomRight.y - bottomLeft.y) * (r + 0.05) * 0.3 + 1}
                                stroke="#444"
                                strokeWidth="0.8"
                                opacity="0.5"
                            />
                        ))}
                        {/* Shelf divider */}
                        <line
                            x1={bottomLeft.x}
                            y1={bottomLeft.y + yTop}
                            x2={bottomRight.x}
                            y2={bottomRight.y + yTop}
                            stroke={shelfColor}
                            strokeWidth={shelfThick}
                        />
                    </g>
                );
            })}

            {/* ====== RIGHT FACE ====== */}
            <polygon
                points={`${topRight.x},${topRight.y} ${bottomRight.x},${bottomRight.y} ${bottomRight.x},${bottomRight.y - height} ${topRight.x},${topRight.y - height}`}
                fill={frameRight}
                stroke={borderColor}
                strokeWidth={borderWidth}
            />

            {/* Right face - vertical posts */}
            <polygon
                points={`
                    ${topRight.x},${topRight.y}
                    ${topRight.x - postW * 0.7},${topRight.y + postW * 0.35}
                    ${topRight.x - postW * 0.7},${topRight.y + postW * 0.35 - height}
                    ${topRight.x},${topRight.y - height}
                `}
                fill="#FF6600"
            />
            <polygon
                points={`
                    ${bottomRight.x + postW * 0.7},${bottomRight.y - postW * 0.35}
                    ${bottomRight.x},${bottomRight.y}
                    ${bottomRight.x},${bottomRight.y - height}
                    ${bottomRight.x + postW * 0.7},${bottomRight.y - postW * 0.35 - height}
                `}
                fill="#FF6600"
            />

            {/* Right face - shelf compartments */}
            {Array.from({ length: shelfCount }, (_, i) => {
                const shelfH = height / shelfCount;
                const yTop = -i * shelfH;
                const yBot = -(i + 1) * shelfH;
                const shelfThick = 1.5;

                return (
                    <g key={`rs${i}`}>
                        {/* Dark bin interior */}
                        <polygon
                            points={`
                                ${topRight.x - postW},${topRight.y + postW * 0.5 + yBot + shelfThick}
                                ${bottomRight.x + postW},${bottomRight.y - postW * 0.5 + yBot + shelfThick}
                                ${bottomRight.x + postW},${bottomRight.y - postW * 0.5 + yTop - shelfThick}
                                ${topRight.x - postW},${topRight.y + postW * 0.5 + yTop - shelfThick}
                            `}
                            fill={i % 2 === 0 ? binHighlight : binColor}
                        />
                        {/* Shelf divider */}
                        <line
                            x1={topRight.x}
                            y1={topRight.y + yTop}
                            x2={bottomRight.x}
                            y2={bottomRight.y + yTop}
                            stroke={shelfColor}
                            strokeWidth={shelfThick}
                        />
                    </g>
                );
            })}

            {/* ====== TOP FACE ====== */}
            <polygon
                points={`${topLeft.x},${topLeft.y - height} ${topRight.x},${topRight.y - height} ${bottomRight.x},${bottomRight.y - height} ${bottomLeft.x},${bottomLeft.y - height}`}
                fill={frameColor}
                stroke={borderColor}
                strokeWidth={borderWidth}
            />

            {/* Top edge highlights */}
            <line
                x1={topLeft.x} y1={topLeft.y - height}
                x2={topRight.x} y2={topRight.y - height}
                stroke="black" strokeWidth="0.8" opacity="0.5"
            />
            <line
                x1={topLeft.x} y1={topLeft.y - height}
                x2={bottomLeft.x} y2={bottomLeft.y - height}
                stroke="black" strokeWidth="0.8" opacity="0.3"
            />

            {/* Selection glow */}
            {isSelected && (
                <polygon
                    points={`${topLeft.x},${topLeft.y - height} ${topRight.x},${topRight.y - height} ${bottomRight.x},${bottomRight.y - height} ${bottomLeft.x},${bottomLeft.y - height}`}
                    fill="rgba(255,215,0,0.15)" stroke="#FFD700" strokeWidth="2"
                />
            )}
        </g>
    );
}

// ============================================
// ITEM RENDERER - routes to correct component
// ============================================
function IsoItem({ item, rotation, onClick, isSelected }) {
    const props = {
        furniture: item,
        gx: item.gx,
        gy: item.gy,
        rotation,
        onClick,
        isSelected,
    };

    switch (item.type) {
        case "prateleira":
            return <IsoShelf {...props} />;
        case "caixaBranca":
        default:
            return <IsoCrate {...props} />;
    }
}

// ============================================
// ROTATION LABELS
// ============================================
const ROTATION_LABELS = ["Norte", "Leste", "Sul", "Oeste"];

// ============================================
// MAIN PROTOTYPE PAGE
// ============================================
export default function PrototipoPage() {
    const [gridW, setGridW] = useState(8);
    const [gridH, setGridH] = useState(8);
    const [placedItems, setPlacedItems] = useState([]);
    const [placingType, setPlacingType] = useState(null); // null, "caixaBranca", "prateleira"
    const [selectedPlaced, setSelectedPlaced] = useState(null);
    const [hoverCell, setHoverCell] = useState(null);
    const [rotation, setRotation] = useState(0);
    const svgRef = useRef(null);
    const nextId = useRef(1);

    useEffect(() => {
        document.title = "Protótipo - Layout";
    }, []);

    const rotateLeft = useCallback(() => {
        setRotation(prev => (prev + 3) % 4);
    }, []);

    const rotateRight = useCallback(() => {
        setRotation(prev => (prev + 1) % 4);
    }, []);

    const canPlace = useCallback((gx, gy) => {
        if (gx < 0 || gy < 0 || gx >= gridW || gy >= gridH) return false;
        for (const item of placedItems) {
            if (item.gx === gx && item.gy === gy) return false;
        }
        return true;
    }, [placedItems, gridW, gridH]);

    const handleTileClick = useCallback((gx, gy) => {
        if (placingType) {
            if (canPlace(gx, gy)) {
                setPlacedItems(prev => [...prev, {
                    placedId: nextId.current++,
                    type: placingType,
                    gx, gy,
                }]);
            }
        }
        setSelectedPlaced(null);
    }, [placingType, canPlace]);

    const handleItemClick = useCallback((item) => {
        if (placingType) return;
        setSelectedPlaced(prev => prev === item.placedId ? null : item.placedId);
    }, [placingType]);

    const handleDeleteSelected = useCallback(() => {
        if (selectedPlaced) {
            setPlacedItems(prev => prev.filter(f => f.placedId !== selectedPlaced));
            setSelectedPlaced(null);
        }
    }, [selectedPlaced]);

    const handleClearAll = useCallback(() => {
        if (placedItems.length === 0) return;
        if (confirm("Limpar tudo?")) {
            setPlacedItems([]);
            setSelectedPlaced(null);
        }
    }, [placedItems]);

    const togglePlacing = (type) => {
        setPlacingType(prev => prev === type ? null : type);
        setSelectedPlaced(null);
    };

    // Dynamic viewBox
    const corners = [
        gridToIso(0, 0, rotation),
        gridToIso(gridW, 0, rotation),
        gridToIso(gridW, gridH, rotation),
        gridToIso(0, gridH, rotation),
    ];
    const minX = Math.min(...corners.map(c => c.x));
    const maxX = Math.max(...corners.map(c => c.x));
    const minY = Math.min(...corners.map(c => c.y));
    const maxY = Math.max(...corners.map(c => c.y));

    // Extra top padding for tall shelves
    const padTop = 80;
    const padSide = 60;
    const padBottom = 30;
    const vbX = minX - padSide;
    const vbY = minY - padTop;
    const vbW = (maxX - minX) + padSide * 2;
    const vbH = (maxY - minY) + padTop + padBottom;

    const getHighlightColor = (gx, gy) => {
        if (!placingType || !hoverCell) return null;
        if (gx !== hoverCell.gx || gy !== hoverCell.gy) return null;
        return canPlace(gx, gy)
            ? "rgba(100,200,100,0.5)"
            : "rgba(200,100,100,0.5)";
    };

    const sortedItems = [...placedItems].sort((a, b) => {
        const aIso = gridToIso(a.gx, a.gy, rotation);
        const bIso = gridToIso(b.gx, b.gy, rotation);
        return aIso.y - bIso.y;
    });

    // Floor depth
    const floorCorners = [
        { pos: gridToIso(0, 0, rotation) },
        { pos: gridToIso(gridW, 0, rotation) },
        { pos: gridToIso(gridW, gridH, rotation) },
        { pos: gridToIso(0, gridH, rotation) },
    ];
    let bottomIdx = 0;
    for (let i = 1; i < 4; i++) {
        if (floorCorners[i].pos.y > floorCorners[bottomIdx].pos.y) bottomIdx = i;
    }
    const prevIdx = (bottomIdx + 3) % 4;
    const nextIdx = (bottomIdx + 1) % 4;
    const depth = 8;

    // Selected item info
    const selectedItemData = selectedPlaced ? placedItems.find(p => p.placedId === selectedPlaced) : null;
    const selectedItemType = selectedItemData ? ITEM_TYPES[selectedItemData.type] : null;

    // Active placing type info
    const placingTypeInfo = placingType ? ITEM_TYPES[placingType] : null;

    return (
        <div className="h-screen w-screen bg-[#1a1a2e] flex flex-col overflow-hidden select-none">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#16213e] to-[#0f3460] h-[48px] flex items-center justify-between px-4 border-b border-[#2a2a4a] shrink-0">
                <div className="flex items-center space-x-3">
                    <h1 className="text-white font-bold text-lg tracking-wide">Layout</h1>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 bg-[#0a0a1a] rounded px-3 py-1 border border-[#333]">
                        <label className="text-gray-400 text-xs font-bold">Largura:</label>
                        <input
                            type="number" min="3" max="100" value={gridW}
                            onChange={(e) => { setGridW(Math.max(3, Math.min(100, parseInt(e.target.value) || 3))); setPlacedItems([]); }}
                            className="bg-transparent text-white text-center w-10 outline-none text-sm font-bold border-b border-[#555]"
                        />
                    </div>
                    <span className="text-gray-500 font-bold">×</span>
                    <div className="flex items-center space-x-2 bg-[#0a0a1a] rounded px-3 py-1 border border-[#333]">
                        <label className="text-gray-400 text-xs font-bold">Altura:</label>
                        <input
                            type="number" min="3" max="100" value={gridH}
                            onChange={(e) => { setGridH(Math.max(3, Math.min(100, parseInt(e.target.value) || 3))); setPlacedItems([]); }}
                            className="bg-transparent text-white text-center w-10 outline-none text-sm font-bold border-b border-[#555]"
                        />
                    </div>

                    <div className="w-[1px] h-[24px] bg-[#333]"></div>

                    {/* Rotation controls */}
                    <div className="flex items-center space-x-1">
                        <button
                            onClick={rotateLeft}
                            className="bg-[#0a0a1a] text-gray-300 border border-[#333] rounded px-2 py-1 text-xs font-bold hover:bg-[#1a1a3a] hover:text-white transition-colors cursor-pointer"
                            title="Girar para esquerda (Q)"
                        >
                            ↺
                        </button>
                        <span className="text-gray-400 text-[10px] font-bold min-w-[40px] text-center">
                            {ROTATION_LABELS[rotation]}
                        </span>
                        <button
                            onClick={rotateRight}
                            className="bg-[#0a0a1a] text-gray-300 border border-[#333] rounded px-2 py-1 text-xs font-bold hover:bg-[#1a1a3a] hover:text-white transition-colors cursor-pointer"
                            title="Girar para direita (E)"
                        >
                            ↻
                        </button>
                    </div>

                    <div className="w-[1px] h-[24px] bg-[#333]"></div>

                    {/* Place crate button */}
                    <button
                        onClick={() => togglePlacing("caixaBranca")}
                        className={`rounded px-3 py-1 text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${placingType === "caixaBranca"
                            ? "bg-[#e94560] text-white border border-[#e94560]"
                            : "bg-[#0a0a1a] text-gray-300 border border-[#333] hover:bg-[#1a1a3a] hover:text-white"
                            }`}
                    >
                        <span>📦</span>
                        <span>Caixa</span>
                    </button>

                    {/* Place shelf button */}
                    <button
                        onClick={() => togglePlacing("prateleira")}
                        className={`rounded px-3 py-1 text-xs font-bold transition-all cursor-pointer flex items-center space-x-1 ${placingType === "prateleira"
                            ? "bg-[#e94560] text-white border border-[#e94560]"
                            : "bg-[#0a0a1a] text-gray-300 border border-[#333] hover:bg-[#1a1a3a] hover:text-white"
                            }`}
                    >
                        <span>🗄️</span>
                        <span>Prateleira</span>
                    </button>

                    <div className="w-[1px] h-[24px] bg-[#333]"></div>

                    <button
                        onClick={handleDeleteSelected}
                        disabled={!selectedPlaced}
                        className={`rounded px-3 py-1 text-xs font-bold transition-all cursor-pointer ${selectedPlaced
                            ? "bg-red-600/20 text-red-400 border border-red-600/30 hover:bg-red-600/40"
                            : "bg-[#0a0a1a] text-gray-600 border border-[#222] cursor-not-allowed"
                            }`}
                    >
                        🗑️ Remover
                    </button>

                    <button
                        onClick={handleClearAll}
                        className="bg-[#0a0a1a] text-gray-400 border border-[#333] rounded px-3 py-1 text-xs font-bold hover:bg-red-600/20 hover:text-red-400 hover:border-red-600/30 transition-colors cursor-pointer"
                    >
                        Limpar Tudo
                    </button>

                    <div className="w-[1px] h-[24px] bg-[#333]"></div>

                    <span className="text-gray-500 text-xs font-medium">
                        {placedItems.filter(i => i.type === "caixaBranca").length} 📦
                        {" · "}
                        {placedItems.filter(i => i.type === "prateleira").length} 🗄️
                    </span>
                </div>
            </div>

            {/* Main Canvas */}
            <div className="flex-1 overflow-hidden flex items-center justify-center bg-[#1a1a2e] relative">
                <div className="absolute inset-0 opacity-5"
                    style={{
                        backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
                        backgroundSize: "20px 20px"
                    }}
                />

                <svg
                    ref={svgRef}
                    viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
                    preserveAspectRatio="xMidYMid meet"
                    className="drop-shadow-2xl w-full h-full"
                >
                    <g>
                        <defs>
                            <filter id="floorShadow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="8" />
                            </filter>
                        </defs>

                        <polygon
                            points={corners.map(c => `${c.x},${c.y + 10}`).join(" ")}
                            fill="rgba(0,0,0,0.3)"
                            filter="url(#floorShadow)"
                        />

                        <polygon
                            points={`
                                ${floorCorners[prevIdx].pos.x},${floorCorners[prevIdx].pos.y}
                                ${floorCorners[bottomIdx].pos.x},${floorCorners[bottomIdx].pos.y}
                                ${floorCorners[bottomIdx].pos.x},${floorCorners[bottomIdx].pos.y + depth}
                                ${floorCorners[prevIdx].pos.x},${floorCorners[prevIdx].pos.y + depth}
                            `}
                            fill="#8a7e68"
                        />
                        <polygon
                            points={`
                                ${floorCorners[bottomIdx].pos.x},${floorCorners[bottomIdx].pos.y}
                                ${floorCorners[nextIdx].pos.x},${floorCorners[nextIdx].pos.y}
                                ${floorCorners[nextIdx].pos.x},${floorCorners[nextIdx].pos.y + depth}
                                ${floorCorners[bottomIdx].pos.x},${floorCorners[bottomIdx].pos.y + depth}
                            `}
                            fill="#6e6352"
                        />

                        {Array.from({ length: gridH }, (_, gy) =>
                            Array.from({ length: gridW }, (_, gx) => {
                                const highlightColor = getHighlightColor(gx, gy);
                                return (
                                    <IsoTile
                                        key={`${gx}-${gy}`}
                                        gx={gx} gy={gy}
                                        rotation={rotation}
                                        highlight={!!highlightColor}
                                        highlightColor={highlightColor || "transparent"}
                                        onClick={() => handleTileClick(gx, gy)}
                                        onMouseEnter={() => setHoverCell({ gx, gy })}
                                    />
                                );
                            })
                        )}

                        {sortedItems.map((item) => (
                            <IsoItem
                                key={item.placedId}
                                item={item}
                                rotation={rotation}
                                onClick={handleItemClick}
                                isSelected={selectedPlaced === item.placedId}
                            />
                        ))}
                    </g>
                </svg>

                {/* Floating tool indicator */}
                {placingType && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#e94560] text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2 animate-bounce-slow">
                        <span className="text-lg">{placingTypeInfo?.icon}</span>
                        <span className="text-sm font-bold">Colocando: {placingTypeInfo?.name}</span>
                        <button
                            onClick={() => setPlacingType(null)}
                            className="ml-2 bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-white/40 transition-colors cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Selected item action bar */}
                {selectedPlaced && selectedItemType && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#16213e] border border-[#333] text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-3">
                        <span className="text-sm font-bold text-gray-300">
                            {selectedItemType.icon} {selectedItemType.name}
                        </span>
                        <button
                            onClick={handleDeleteSelected}
                            className="bg-red-600/30 text-red-400 border border-red-600/40 rounded px-3 py-1 text-xs font-bold hover:bg-red-600/50 transition-colors cursor-pointer"
                        >
                            🗑️ Remover
                        </button>
                    </div>
                )}

                {/* Instructions overlay */}
                {placedItems.length === 0 && !placingType && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#16213e]/90 border border-[#333] text-gray-400 px-6 py-3 rounded-lg text-center">
                        <p className="text-sm font-bold text-gray-300 mb-1">Simulador de Layout</p>
                        <p className="text-xs">Selecione <strong className="text-[#e94560]">📦 Caixa</strong> ou <strong className="text-[#e94560]">🗄️ Prateleira</strong> e clique no grid</p>
                    </div>
                )}

                {/* Rotation compass */}
                <div className="absolute bottom-4 right-4 bg-[#16213e]/80 border border-[#333] rounded-lg px-3 py-2 flex items-center space-x-2">
                    <button onClick={rotateLeft} className="text-gray-400 hover:text-white transition-colors cursor-pointer text-sm" title="Q">↺</button>
                    <div className="flex flex-col items-center">
                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Perspectiva</span>
                        <span className="text-xs text-white font-bold">{ROTATION_LABELS[rotation]}</span>
                    </div>
                    <button onClick={rotateRight} className="text-gray-400 hover:text-white transition-colors cursor-pointer text-sm" title="E">↻</button>
                </div>
            </div>

            <KeyboardHandler
                onDelete={handleDeleteSelected}
                onEscape={() => { setPlacingType(null); setSelectedPlaced(null); }}
                onRotateLeft={rotateLeft}
                onRotateRight={rotateRight}
            />

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes bounce-slow {
                    0%, 100% { transform: translateX(-50%) translateY(0); }
                    50% { transform: translateX(-50%) translateY(-4px); }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 2s ease-in-out infinite;
                }
            ` }} />
        </div>
    );
}

// ============================================
// KEYBOARD HANDLER
// ============================================
function KeyboardHandler({ onDelete, onEscape, onRotateLeft, onRotateRight }) {
    useEffect(() => {
        const handler = (e) => {
            if (e.key === "Delete" || e.key === "Backspace") {
                e.preventDefault();
                onDelete();
            }
            if (e.key === "Escape") onEscape();
            if (e.key === "q" || e.key === "Q") onRotateLeft();
            if (e.key === "e" || e.key === "E") onRotateRight();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onDelete, onEscape, onRotateLeft, onRotateRight]);
    return null;
}