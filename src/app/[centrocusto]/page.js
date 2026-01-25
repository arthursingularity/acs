"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Block from "../components/system/Block";
import NavBar from "../components/ui/NavBar";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import AddressModal from "../components/system/AdressModal";
import { useParams } from "next/navigation";

const DEFAULT_COLS = 50;
const DEFAULT_ROWS = 50;
const CELL_SIZE = 50;
const BUFFER = 3;

/* 🔹 Helper para calcular próxima coluna (inteligente) */
function getNextColumn(rua, gridData, lastInteraction) {
  const cols = [];
  Object.values(gridData).forEach((item) => {
    if (item.rua === rua && item.coluna) {
      const v = parseInt(item.coluna, 10);
      if (!isNaN(v)) cols.push(v);
    }
  });

  if (cols.length === 0) return "01";

  const min = Math.min(...cols);
  const max = Math.max(...cols);

  if (lastInteraction && lastInteraction.rua === rua) {
    const lastCol = parseInt(lastInteraction.coluna, 10);
    if (lastCol <= min) {
      return String(Math.max(1, min - 1)).padStart(2, "0");
    }
  }

  return String(max + 1).padStart(2, "0");
}

export default function Home() {
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [scroll, setScroll] = useState({ x: 0, y: 0 });
  const [gridData, setGridData] = useState({});
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [gridCols, setGridCols] = useState(DEFAULT_COLS);
  const [gridRows, setGridRows] = useState(DEFAULT_ROWS);
  const [viewport, setViewport] = useState({ width: 0, height: 0 });
  const [lastInteraction, setLastInteraction] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [setor, setSetor] = useState(null);

  const { centrocusto } = useParams();
  const almo = setor?.almoxarifado || "";
  const descricaoSetor = setor?.descricao || "";
  const setorId = setor?.id || null;

  // Debounce ref para salvar no banco
  const saveTimeoutRef = useRef(null);

  // 🔹 Carregar setor da API
  useEffect(() => {
    if (!centrocusto) return;

    const fetchSetor = async () => {
      try {
        const res = await fetch(`/api/setores/${centrocusto}`);
        if (res.ok) {
          const data = await res.json();
          setSetor(data);
        } else {
          console.error("Setor não encontrado");
        }
      } catch (err) {
        console.error("Erro ao buscar setor:", err);
      }
    };

    fetchSetor();
  }, [centrocusto]);

  // 🔹 Carregar dados do grid da API
  useEffect(() => {
    if (!setorId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Carregar blocos
        const blocksRes = await fetch(`/api/blocks/${setorId}`);
        if (blocksRes.ok) {
          const blocks = await blocksRes.json();
          setGridData(blocks);
        }

        // Carregar configuração do grid
        const configRes = await fetch(`/api/grid-config/${setorId}`);
        if (configRes.ok) {
          const config = await configRes.json();
          setGridCols(config.cols || DEFAULT_COLS);
          setGridRows(config.rows || DEFAULT_ROWS);
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [setorId]);

  // 🔹 Salvar dados no banco (debounced)
  useEffect(() => {
    if (!setorId || isLoading) return;

    // Debounce de 1 segundo
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await fetch(`/api/blocks/${setorId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(gridData),
        });
      } catch (err) {
        console.error("Erro ao salvar blocos:", err);
      }
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [gridData, setorId, isLoading]);

  // 🔹 Salvar configuração do grid
  useEffect(() => {
    if (!setorId || isLoading) return;

    const saveConfig = async () => {
      try {
        await fetch(`/api/grid-config/${setorId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cols: gridCols, rows: gridRows }),
        });
      } catch (err) {
        console.error("Erro ao salvar config:", err);
      }
    };

    saveConfig();
  }, [gridCols, gridRows, setorId, isLoading]);

  const handleDeleteAddress = useCallback(() => {
    if (selectedIndex === null) return;

    setGridData((prev) => {
      const newData = { ...prev };
      delete newData[selectedIndex];
      return newData;
    });

    setModalOpen(false);
    setSelectedIndex(null);
  }, [selectedIndex]);

  const isPanning = useRef(false);
  const panStart = useRef({
    mouseX: 0,
    mouseY: 0,
    scrollX: 0,
    scrollY: 0,
  });

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.ctrlKey) setIsCtrlPressed(true);
    };

    const onKeyUp = () => {
      setIsCtrlPressed(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  /* ---------------- SCROLL + ZOOM ---------------- */

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      setScroll({
        x: el.scrollLeft,
        y: el.scrollTop,
      });
    };

    const onWheel = (e) => {
      if (!e.altKey) return;
      e.preventDefault();

      setZoom((z) => Math.min(Math.max(z + (e.deltaY > 0 ? -0.1 : 0.1), 0.3), 3));
    };

    el.addEventListener("scroll", onScroll);
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("wheel", onWheel);
    };
  }, []);

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateViewport();
    window.addEventListener("resize", updateViewport);

    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onMouseDown = (e) => {
      if (e.button !== 0 || !e.ctrlKey) return;

      e.preventDefault();

      isPanning.current = true;
      panStart.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        scrollX: el.scrollLeft,
        scrollY: el.scrollTop,
      };

      el.style.cursor = "grabbing";
    };

    const onMouseMove = (e) => {
      if (!isPanning.current) return;

      const dx = e.clientX - panStart.current.mouseX;
      const dy = e.clientY - panStart.current.mouseY;

      el.scrollLeft = panStart.current.scrollX - dx;
      el.scrollTop = panStart.current.scrollY - dy;
    };

    const onMouseUp = () => {
      if (!isPanning.current) return;

      isPanning.current = false;
      el.style.cursor = "default";
    };

    el.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      el.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  /* ---------------- VIRTUALIZAÇÃO ---------------- */

  const visibleCells = useMemo(() => {
    const viewportWidth = viewport.width;
    const viewportHeight = viewport.height;

    const startCol = Math.max(
      0,
      Math.floor(scroll.x / (CELL_SIZE * zoom)) - BUFFER
    );

    const endCol = Math.min(
      gridCols,
      Math.ceil((scroll.x + viewportWidth) / (CELL_SIZE * zoom)) + BUFFER
    );

    const startRow = Math.max(
      0,
      Math.floor(scroll.y / (CELL_SIZE * zoom)) - BUFFER
    );

    const endRow = Math.min(
      gridRows,
      Math.ceil((scroll.y + viewportHeight) / (CELL_SIZE * zoom)) + BUFFER
    );

    const cells = [];
    for (let row = startRow; row < endRow; row++) {
      for (let col = startCol; col < endCol; col++) {
        const key = `${row}-${col}`;
        cells.push({ row, col, key });
      }
    }
    return cells;
  }, [scroll.x, scroll.y, viewport.width, viewport.height, zoom, gridCols, gridRows]);

  const handleAdjustGrid = useCallback((deltaRows, deltaCols) => {
    setGridRows(prev => Math.max(5, Math.min(500, prev + deltaRows)));
    setGridCols(prev => Math.max(5, Math.min(500, prev + deltaCols)));
  }, []);

  const handleOpenModal = useCallback((index) => {
    setSelectedIndex(index);
    setModalOpen(true);
  }, []);

  const handleSaveAddress = (data) => {
    if (data.rua && data.coluna) {
      setLastInteraction({ rua: data.rua, coluna: data.coluna });
    }

    setGridData((prev) => {
      const next = { ...prev };

      if (!data?.coluna) {
        delete next[selectedIndex];
      } else {
        next[selectedIndex] = data;
      }

      return next;
    });

    setModalOpen(false);
    setSelectedIndex(null);
  };

  /* ---------------- EXCEL EXPORT ---------------- */
  const exportToExcel = async () => {
    const rows = [];

    Object.values(gridData).forEach((item) => {
      if (!item) return;

      if (item.type === "endereco" && item.tipo !== "NIVEL") {
        if (!item.produto) return;

        rows.push({
          produto: item.produto,
          descricao: item.descricao,
          rua: item.rua,
          coluna: item.coluna,
          nivel: item.nivel,
          codigo: `${almo}${item.rua}${item.coluna}N${item.nivel}`,
          tipoCaixa: item.tipoCaixa || "",
          observacao: item.observacao || "",
        });
      }

      if (item.tipo === "NIVEL" && Array.isArray(item.enderecos)) {
        item.enderecos.forEach((g) => {
          if (!g.produto) return;

          rows.push({
            produto: g.produto,
            descricao: g.descricao,
            rua: g.rua,
            coluna: g.coluna,
            nivel: g.nivel,
            codigo: g.enderecoCode,
            tipoCaixa: item.tipoCaixa || "",
            observacao: g.observacao || "",
          });
        });
      }
    });

    if (rows.length === 0) {
      alert("Nenhum endereço para exportar.");
      return;
    }

    const byRua = rows.reduce((acc, row) => {
      if (!acc[row.rua]) acc[row.rua] = [];
      acc[row.rua].push(row);
      return acc;
    }, {});

    const workbook = new ExcelJS.Workbook();

    const createSheet = (rua, rows) => {
      const sheet = workbook.addWorksheet(`RUA ${rua}`);

      sheet.columns = [
        { header: "PRODUTO", key: "produto", width: 15 },
        { header: "DESCRICAO", key: "descricao", width: 45 },
        { header: "RUA", key: "rua", width: 7 },
        { header: "COLUNA", key: "coluna", width: 10 },
        { header: "NIVEL", key: "nivel", width: 8 },
        { header: "CODIGO", key: "codigo", width: 13 },
        { header: "TIPO DE ETIQUETA", key: "tipoCaixa", width: 18 },
        { header: "OBSERVACAO", key: "observacao", width: 18 },
      ];

      sheet.getRow(1).eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF1F4E78" },
        };
        cell.font = {
          bold: true,
          color: { argb: "FFFFFFFF" },
        };
        cell.alignment = {
          horizontal: "center",
          vertical: "middle",
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      rows.forEach((row) => sheet.addRow(row));

      ["C", "D", "E", "F", "G", "H"].forEach((col) => {
        sheet.getColumn(col).alignment = { horizontal: "center" };
      });

      sheet.views = [{ state: "frozen", ySplit: 1 }];
    };

    Object.entries(byRua).forEach(([rua, rRows]) => {
      createSheet(rua, rRows);
    });

    const buffer = await workbook.xlsx.writeBuffer();

    saveAs(
      new Blob([buffer], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `enderecamento_${almo || "sem-almoxarifado"}.xlsx`
    );
  };


  /* ---------------- CLIPBOARD + CONTEXT MENU ---------------- */
  const [clipboard, setClipboard] = useState(null);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    index: null,
  });

  useEffect(() => {
    const handleClick = () => {
      if (contextMenu.visible)
        setContextMenu((prev) => ({ ...prev, visible: false }));
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [contextMenu.visible]);

  const handleContextMenu = useCallback((e, index) => {
    e.preventDefault();
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      index,
    });
  }, []);

  const handleCopy = () => {
    const data = gridData[contextMenu.index];
    if (data) {
      setClipboard(data);
    }
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  const handlePaste = () => {
    if (!clipboard || contextMenu.index === null) return;

    if (clipboard.type === "street" && Array.isArray(clipboard.items)) {
      const [tRow, tCol] = contextMenu.index.split("-").map(Number);

      setGridData((prev) => {
        const nextGrid = { ...prev };
        clipboard.items.forEach((item) => {
          const nr = tRow + item.dr;
          const nc = tCol + item.dc;
          if (nr >= 0 && nr < gridRows && nc >= 0 && nc < gridCols) {
            const newKey = `${nr}-${nc}`;
            nextGrid[newKey] = JSON.parse(JSON.stringify(item.data));
          }
        });
        return nextGrid;
      });
      setContextMenu((prev) => ({ ...prev, visible: false }));
      return;
    }

    let newItem = { ...clipboard };

    if (newItem.rua) {
      const nextCol = getNextColumn(newItem.rua, gridData, lastInteraction);
      newItem.coluna = nextCol;

      setLastInteraction({ rua: newItem.rua, coluna: nextCol });

      if (newItem.tipo === "NIVEL" && Array.isArray(newItem.enderecos)) {
        newItem.enderecos = newItem.enderecos.map((addr) => {
          const oldColPart = `${newItem.rua}${clipboard.coluna}`;
          const newColPart = `${newItem.rua}${nextCol}`;

          return {
            ...addr,
            coluna: nextCol,
            enderecoCode: addr.enderecoCode.replace(oldColPart, newColPart)
          };
        });
      }
    }

    setGridData((prev) => ({
      ...prev,
      [contextMenu.index]: newItem,
    }));
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  /* ---------------- CENTER GRID ---------------- */
  const centerGrid = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const gridW = gridCols * CELL_SIZE * zoom;
    const viewportW = el.clientWidth;

    const scrollX = (gridW - viewportW) / 2;
    const scrollY = 0;

    el.scrollTo({
      left: Math.max(0, scrollX),
      top: scrollY,
      behavior: "auto",
    });
  }, [gridCols, zoom]);

  useEffect(() => {
    const t = setTimeout(() => {
      centerGrid();
    }, 100);
    return () => clearTimeout(t);
  }, [centerGrid]);

  /* ---------------- RENDER ---------------- */

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold text-gray-600">Carregando...</div>
      </div>
    );
  }

  return (
    <>
      <NavBar
        almo={almo}
        setor={descricaoSetor}
        centroCusto={centrocusto}
        onExportExcel={exportToExcel}
        gridRows={gridRows}
        gridCols={gridCols}
        onAdjustGrid={handleAdjustGrid}
      />

      <div
        ref={containerRef}
        className="w-full h-[calc(100vh-128px)] overflow-auto relative select-none mt-[128px] p-[2px] flex"
        onMouseMove={(e) => {
          if (e.ctrlKey && !isPanning.current) {
            e.currentTarget.style.cursor = "move";
          } else if (!isPanning.current) {
            e.currentTarget.style.cursor = "default";
          }
        }}
      >
        {/* GRID TOTAL */}
        <div
          className="border border-primary m-auto flex-none"
          style={{
            width: gridCols * CELL_SIZE,
            height: gridRows * CELL_SIZE,
            position: "relative",
            transform: `scale(${zoom})`,
            transformOrigin: "0 0",
          }}
        >
          {visibleCells.map(({ row, col, key }) => (
            <div
              key={key}
              style={{
                position: "absolute",
                top: row * CELL_SIZE,
                left: col * CELL_SIZE,
              }}
              onContextMenu={(e) => handleContextMenu(e, key)}
            >
              <Block
                index={key}
                data={gridData[key]}
                gridData={gridData}
                onClick={() => handleOpenModal(key)}
                isCtrlPressed={isCtrlPressed}
              />
            </div>
          ))}
        </div>
      </div>

      <AddressModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveAddress}
        onDelete={handleDeleteAddress}
        initialData={gridData[selectedIndex]}
        almo={almo}
        existingBlocks={gridData}
        lastInteraction={lastInteraction}
      />

      {/* CONTEXT MENU */}
      {contextMenu.visible && (
        <div
          className="fixed z-[9999] bg-white border border-gray-200 shadow-xl rounded-md p-1 min-w-[150px] flex flex-col animate-in fade-in zoom-in-95 duration-100"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleCopy}
            disabled={!gridData[contextMenu.index]}
            className="text-left px-3 py-2 hover:bg-blue-50 text-sm rounded-sm transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed flex items-center justify-between group"
          >
            <span>Copiar</span>
            <span className="text-xs text-gray-400 group-hover:text-blue-500">
              Ctrl+C
            </span>
          </button>

          <button
            onClick={() => {
              const sourceKey = contextMenu.index;
              const sourceItem = gridData[sourceKey];
              if (!sourceItem || !sourceItem.rua) return;

              const [sRow, sCol] = sourceKey.split('-').map(Number);
              const streetItems = [];

              Object.entries(gridData).forEach(([k, item]) => {
                if (item.rua === sourceItem.rua) {
                  const [r, c] = k.split('-').map(Number);
                  streetItems.push({
                    data: item,
                    dr: r - sRow,
                    dc: c - sCol
                  });
                }
              });

              setClipboard({ type: 'street', items: streetItems });
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
            disabled={!gridData[contextMenu.index] || !gridData[contextMenu.index].rua}
            className="text-left px-3 py-2 hover:bg-blue-50 text-sm rounded-sm transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed flex items-center justify-between group"
          >
            <span>Copiar Rua Inteira</span>
          </button>

          <button
            onClick={() => {
              const sourceItem = gridData[contextMenu.index];
              if (!sourceItem || !sourceItem.rua) return;

              if (confirm(`Tem certeza que deseja excluir essa rua?`)) {
                setGridData(prev => {
                  const next = { ...prev };

                  const queue = [contextMenu.index];
                  const visited = new Set([contextMenu.index]);
                  const toDelete = [contextMenu.index];
                  const targetRua = sourceItem.rua;

                  while (queue.length > 0) {
                    const currentKey = queue.shift();
                    const [r, c] = currentKey.split('-').map(Number);

                    const neighbors = [
                      `${r - 1}-${c}`,
                      `${r + 1}-${c}`,
                      `${r}-${c - 1}`,
                      `${r}-${c + 1}`
                    ];

                    neighbors.forEach(nKey => {
                      if (!visited.has(nKey) && next[nKey] && next[nKey].rua === targetRua) {
                        visited.add(nKey);
                        queue.push(nKey);
                        toDelete.push(nKey);
                      }
                    });
                  }

                  toDelete.forEach(key => delete next[key]);

                  return next;
                });
              }
              setContextMenu((prev) => ({ ...prev, visible: false }));
            }}
            disabled={!gridData[contextMenu.index] || !gridData[contextMenu.index].rua}
            className="text-left px-3 py-2 hover:bg-red-50 text-red-600 text-sm rounded-sm transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed flex items-center justify-between group"
          >
            <span>Excluir Rua</span>
          </button>

          <button
            onClick={handlePaste}
            disabled={!clipboard}
            className="text-left px-3 py-2 hover:bg-blue-50 text-sm rounded-sm transition-colors disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed flex items-center justify-between group"
          >
            <span>Colar</span>
            <span className="text-xs text-gray-400 group-hover:text-blue-500">
              Ctrl+V
            </span>
          </button>
        </div>
      )}
    </>
  );
}