import React from "react";

const GRID_SIZE = 200;

const Block = React.memo(function Block({
  index,
  data,
  gridData,
  onClick,
}) {
  if (typeof index !== "number" || Number.isNaN(index)) {
    return null;
  }

  const hasColuna = Boolean(data?.coluna);
  const hasDescricao = Boolean(data?.descricao);

  const topIndex = index - GRID_SIZE;
  const bottomIndex = index + GRID_SIZE;

  const topHas =
    topIndex >= 0 && Boolean(gridData[topIndex]?.coluna);

  const bottomHas =
    bottomIndex < GRID_SIZE * GRID_SIZE &&
    Boolean(gridData[bottomIndex]?.coluna);

  return (
    <div
      onClick={onClick}
      className={`
        relative group w-[50px] h-[50px] cursor-pointer
        border border-gray-400 flex
        ${hasColuna && topHas ? "border-t-0" : ""}
        ${hasColuna && bottomHas ? "border-b-0" : ""}
      `}
    >
      {/* 🔹 BLOCO */}
      {hasColuna && (
        <div
          className={`
            absolute inset-0
            bg-gray-600 text-white
            flex items-center justify-center
            text-2xl font-bold
            hover:bg-sky-500
            ${topHas ? "rounded-t-none" : "rounded-t-md"}
            ${bottomHas ? "rounded-b-none" : "rounded-b-md"}
          `}
        >
          {data.coluna}
        </div>
      )}

      {!hasColuna && (
        <div className="absolute inset-0.5 hover:bg-gray-300 rounded" />
      )}

      {/* 🔹 TOOLTIP */}
      {hasDescricao && (
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
