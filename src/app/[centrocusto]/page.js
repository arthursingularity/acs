"use client";

import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Block from "../components/system/Block";
import NavBar from "../components/ui/NavBar";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import AddressModal from "../components/system/AdressModal";
import { useParams } from "next/navigation";
import { SETORES_DB } from "../components/system/Database";

const DEFAULT_COLS = 50;
const DEFAULT_ROWS = 50;
const CELL_SIZE = 50;
const BUFFER = 3; // render extra (anti flicker)
const STORAGE_KEY = "enderecamento-grid-data";
const ALMO_STORAGE_KEY = "almoxarifado";
const GRID_SIZE_KEY = "enderecamento-grid-size";

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
  const [viewport, setViewport] = useState({
    width: 0,
    height: 0,
  });
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
  const { centrocusto } = useParams();
  const setor = SETORES_DB.find(
    (s) => s.centroCusto === centrocusto
  );
  const almo = setor?.almoxarifado || "";
  const descricaoSetor = setor?.descricao || "";

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


  useEffect(() => {
    if (typeof window === "undefined") return;

    localStorage.setItem(ALMO_STORAGE_KEY, almo);
  }, [almo]);

  // Carregar tamanho do grid do localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const savedSize = localStorage.getItem(GRID_SIZE_KEY);
      if (savedSize) {
        const { cols, rows } = JSON.parse(savedSize);
        if (cols) setGridCols(cols);
        if (rows) setGridRows(rows);
      }
    } catch (err) {
      console.error("Erro ao carregar tamanho do grid:", err);
    }
  }, []);

  // Salvar tamanho do grid no localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(GRID_SIZE_KEY, JSON.stringify({ cols: gridCols, rows: gridRows }));
    } catch (err) {
      console.error("Erro ao salvar tamanho do grid:", err);
    }
  }, [gridCols, gridRows]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);

        // 🔹 MIGRATION: Convert linear index to "row-col" keys if valid
        const keys = Object.keys(parsed);
        const hasLegacyKeys = keys.some(k => !k.includes("-") && !isNaN(parseInt(k)));

        if (hasLegacyKeys) {
          console.log("Migrating grid data from linear indices to coordinates...");
          const savedSize = localStorage.getItem(GRID_SIZE_KEY);
          let cols = DEFAULT_COLS;
          if (savedSize) {
            const s = JSON.parse(savedSize);
            if (s.cols) cols = s.cols;
          }

          const migrated = {};
          keys.forEach(k => {
            const idx = parseInt(k, 10);
            if (!isNaN(idx)) {
              const r = Math.floor(idx / cols);
              const c = idx % cols;
              migrated[`${r}-${c}`] = parsed[k];
            } else {
              migrated[k] = parsed[k]; // keep if already weird
            }
          });
          setGridData(migrated);
        } else {
          setGridData(parsed);
        }
      }
    } catch (err) {
      console.error("Erro ao carregar gridData:", err);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gridData));
    } catch (err) {
      console.error("Erro ao salvar gridData:", err);
    }
  }, [gridData]);

  /* ---------------- SCROLL + ZOOM ---------------- */

  useEffect(() => {
    const el = containerRef.current;

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

    updateViewport(); // inicial
    window.addEventListener("resize", updateViewport);

    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onMouseDown = (e) => {
      // CTRL + botão esquerdo
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

  /* ---------------- VIRTUALIZAÇÃO (OTIMIZADO COM MEMO) ---------------- */

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
        // Use coordinate key instead of linear index to preserve positions on resize
        const key = `${row}-${col}`;
        cells.push({ row, col, key });
      }
    }
    return cells;
  }, [scroll.x, scroll.y, viewport.width, viewport.height, zoom, gridCols, gridRows]);

  // Funções para ajustar tamanho do grid
  const handleAdjustGrid = useCallback((deltaRows, deltaCols) => {
    setGridRows(prev => Math.max(5, Math.min(500, prev + deltaRows)));
    setGridCols(prev => Math.max(5, Math.min(500, prev + deltaCols)));
  }, []);

  const handleOpenModal = useCallback((index) => {
    setSelectedIndex(index);
    setModalOpen(true);
  }, []);

  const handleSaveAddress = (data) => {
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

  const exportToExcel = async () => {
    const rows = [];

    // 🔹 Coletar dados do grid
    Object.values(gridData).forEach((item) => {
      if (!item) return;

      // 🔹 ENDEREÇO NORMAL
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

      // 🔹 GAVETA (múltiplos níveis)
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

    // 🔹 Agrupar por RUA
    const byRua = rows.reduce((acc, row) => {
      if (!acc[row.rua]) acc[row.rua] = [];
      acc[row.rua].push(row);
      return acc;
    }, {});

    const workbook = new ExcelJS.Workbook();

    /* ===================================================== */
    /* 🔹 FUNÇÃO REUTILIZÁVEL DE CRIAÇÃO DE ABA               */
    /* ===================================================== */
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

      // 🔹 Header estilizado
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

      // 🔹 Linhas
      rows.forEach((row) => sheet.addRow(row));

      // 🔹 Alinhamento
      ["C", "D", "E", "F", "G", "H"].forEach((col) => {
        sheet.getColumn(col).alignment = { horizontal: "center" };
      });

      // 🔹 Freeze header
      sheet.views = [{ state: "frozen", ySplit: 1 }];
    };

    // 🔹 Criar abas por RUA
    Object.entries(byRua).forEach(([rua, rows]) => {
      createSheet(rua, rows);
    });

    // 🔹 Exportar arquivo
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
    setGridData((prev) => ({
      ...prev,
      [contextMenu.index]: { ...clipboard },
    }));
    setContextMenu((prev) => ({ ...prev, visible: false }));
  };

  /* ---------------- CENTER GRID ---------------- */
  const centerGrid = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    // Grid logical dimensions
    const gridW = gridCols * CELL_SIZE * zoom;
    // Viewport dimensions
    const viewportW = el.clientWidth;

    // Calculate center scroll
    const scrollX = (gridW - viewportW) / 2;
    // Always top!
    const scrollY = 0;

    el.scrollTo({
      left: Math.max(0, scrollX),
      top: scrollY,
      behavior: "auto",
    });
  }, [gridCols, gridRows, zoom]);

  useEffect(() => {
    // Tenta centralizar assim que carregar (aguarda render inicial/localStorage)
    const t = setTimeout(() => {
      centerGrid();
    }, 100);
    return () => clearTimeout(t);
  }, []); // Executa uma vez

  /* ---------------- RENDER ---------------- */

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
        {/* GRID TOTAL (tamanho dinâmico) */}
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
          {/* GRID VISÍVEL (otimizado) */}
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