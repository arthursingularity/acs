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

  return (
    <div
      onClick={onClick}
      className={`
    relative group w-[50px] h-[50px]
    border border-gray-400 flex
    ${isCtrlPressed ? "cursor-move" : "cursor-pointer"}
  `}
    >
      {/* 🔹 BLOCO */}
      {hasColuna && (
        <div
          className={`
            absolute inset-0
            flex items-center justify-center
            font-bold
            rounded-md
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
