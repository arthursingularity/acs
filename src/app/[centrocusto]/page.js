"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Block from "../components/system/Block";
import NavBar from "../components/ui/NavBar";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import AddressModal from "../components/system/AdressModal";
import { useParams } from "next/navigation";
import { SETORES_DB } from "../components/system/Database";

const GRID_SIZE = 200;
const CELL_SIZE = 50;
const BUFFER = 4; // render extra (anti flicker)
const STORAGE_KEY = "enderecamento-grid-data";
const ALMO_STORAGE_KEY = "almoxarifado";

export default function Home() {
  const containerRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [scroll, setScroll] = useState({ x: 0, y: 0 });
  const [gridData, setGridData] = useState({});
  const [isCtrlPressed, setIsCtrlPressed] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
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

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setGridData(JSON.parse(saved));
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

  /* ---------------- VIRTUALIZAÇÃO ---------------- */

  const viewportWidth = viewport.width;
  const viewportHeight = viewport.height;

  const scaledCell = CELL_SIZE * zoom;

  const startCol = Math.max(
    0,
    Math.floor(scroll.x / (CELL_SIZE * zoom)) - BUFFER
  );

  const endCol = Math.min(
    GRID_SIZE,
    Math.ceil((scroll.x + viewportWidth) / (CELL_SIZE * zoom)) + BUFFER
  );

  const startRow = Math.max(
    0,
    Math.floor(scroll.y / (CELL_SIZE * zoom)) - BUFFER
  );

  const endRow = Math.min(
    GRID_SIZE,
    Math.ceil((scroll.y + viewportHeight) / (CELL_SIZE * zoom)) + BUFFER
  );


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
      if (item.type === "endereco" && item.tipo !== "GAVETA") {
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
      if (item.tipo === "GAVETA" && Array.isArray(item.enderecos)) {
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
        { header: "RUA", key: "rua", width: 8 },
        { header: "COLUNA", key: "coluna", width: 10 },
        { header: "NIVEL", key: "nivel", width: 8 },
        { header: "CODIGO", key: "codigo", width: 18 },
        { header: "TIPO", key: "tipoCaixa", width: 18 },
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


  /* ---------------- RENDER ---------------- */

  return (
    <>
      <NavBar
        almo={almo}
        setor={descricaoSetor}
        centroCusto={centrocusto}
        onExportExcel={exportToExcel}
      />

      <div
        ref={containerRef}
        className="w-screen h-screen overflow-auto relative select-none mt-[150px] p-[2px]"
        onMouseMove={(e) => {
          if (e.ctrlKey && !isPanning.current) {
            e.currentTarget.style.cursor = "move";
          } else if (!isPanning.current) {
            e.currentTarget.style.cursor = "default";
          }
        }}
      >
        {/* GRID TOTAL (FAKE, só tamanho) */}
        <div
          className="border border-primary"
          style={{
            width: GRID_SIZE * CELL_SIZE,
            height: GRID_SIZE * CELL_SIZE,
            position: "relative",
            transform: `scale(${zoom})`,
            transformOrigin: "0 0",
          }}
        >
          {/* GRID VISÍVEL */}
          {Array.from({ length: endRow - startRow }).map((_, rowOffset) => {
            const row = startRow + rowOffset;

            return Array.from({ length: endCol - startCol }).map(
              (_, colOffset) => {
                const col = startCol + colOffset;
                const index = row * GRID_SIZE + col;

                return (
                  <div
                    key={index}
                    style={{
                      position: "absolute",
                      top: row * CELL_SIZE,
                      left: col * CELL_SIZE,
                    }}
                  >
                    <Block
                      index={index}
                      data={gridData[index]}
                      gridData={gridData}
                      onClick={() => handleOpenModal(index)}
                      isCtrlPressed={isCtrlPressed}
                    />
                  </div>
                );
              }
            );
          })}
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
    </>
  );
}