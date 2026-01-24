import React from "react";
import { BLOCK_COLORS } from "./AdressModal";

const GRID_SIZE = 200;

const Block = React.memo(function Block({
  index,
  data,
  gridData,
  onClick,
  isCtrlPressed,
}) {
  if (index === undefined || index === null) {
    return null;
  }

  const type = data?.type || "endereco";
  const hasColuna = Boolean(data?.coluna);
  const hasDescricao = Boolean(data?.descricao);

  const colorClass = BLOCK_COLORS[data?.blockColor] || BLOCK_COLORS.gray;

  // 🔹 Check connectivity (only for "endereco")
  let isLeftConnected = false;
  let isRightConnected = false;
  let isTopConnected = false;
  let isBottomConnected = false;

  if (type === "endereco") {
    // index is expected to be "row-col" string
    const parts = String(index).split("-");
    if (parts.length === 2) {
      const r = parseInt(parts[0], 10);
      const c = parseInt(parts[1], 10);

      const leftKey = `${r}-${c - 1}`;
      const rightKey = `${r}-${c + 1}`;
      const topKey = `${r - 1}-${c}`;
      const bottomKey = `${r + 1}-${c}`;

      const leftNeighbor = gridData[leftKey];
      const rightNeighbor = gridData[rightKey];
      const topNeighbor = gridData[topKey];
      const bottomNeighbor = gridData[bottomKey];

      const isEndereco = (d) => (d?.type || "endereco") === "endereco";

      if (leftNeighbor && isEndereco(leftNeighbor)) isLeftConnected = true;
      if (rightNeighbor && isEndereco(rightNeighbor)) isRightConnected = true;
      if (topNeighbor && isEndereco(topNeighbor)) isTopConnected = true;
      if (bottomNeighbor && isEndereco(bottomNeighbor)) isBottomConnected = true;
    }
  }

  // Determine corner rounding
  // If a side is connected, its adjacent corners become sharp.
  const tl = isTopConnected || isLeftConnected ? "rounded-tl-none" : "rounded-tl-lg";
  const tr = isTopConnected || isRightConnected ? "rounded-tr-none" : "rounded-tr-lg";
  const bl = isBottomConnected || isLeftConnected ? "rounded-bl-none" : "rounded-bl-lg";
  const br = isBottomConnected || isRightConnected ? "rounded-br-none" : "rounded-br-lg";

  // Determine borders (outer div handles borders)
  // We start with full border, then remove sides that are connected.
  // Tailwind `border` adds 1px to all sides.
  const borderClass = `
    border
    ${isLeftConnected ? "border-l-0" : ""}
    ${isRightConnected ? "border-r-0" : ""}
    ${isTopConnected ? "border-t-0" : ""}
    ${isBottomConnected ? "border-b-0" : ""}
  `;

  return (
    <div
      onClick={onClick}
      className={`
    relative group w-[50px] h-[50px]
    border-gray-400 flex
    ${isCtrlPressed ? "cursor-move" : "cursor-pointer"}
    ${borderClass}
  `}
    >
      {/* 🔹 BLOCO */}
      {hasColuna && (
        <div
          className={`
            absolute inset-0
            flex items-center justify-center
            font-bold
            ${tl} ${tr} ${bl} ${br}
            ${type === "letter"
              ? "text-primary text-[58px] pt-[1px] hover:bg-primary hover:text-white"
              : `${colorClass} text-[30px] text-white`
            }
          `}
        >
          {data.coluna}
        </div>
      )}

      {!hasColuna && (
        <div className="absolute inset-0.5 hover:bg-gray-300 rounded" />
      )}

      {/* 🔹 TOOLTIP */}
      {type === "endereco" && hasDescricao && (
        <div
          className="
            pointer-events-none
            absolute z-50
            left-1/2 bottom-full mb-2
            -translate-x-1/2
            hidden group-hover:flex
            bg-neutral-900 text-cyan-500 font-semibold text-[15px]
            px-3 py-2 rounded shadow-xl
            whitespace-nowrap
          "
        >
          {data.descricao}
        </div>
      )}
    </div>
  );
});

export default Block;
