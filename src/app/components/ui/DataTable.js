"use client";

import React, { useState, useMemo } from "react";

/**
 * DataTable - Componente reutilizável de tabela padronizada
 * 
 * @param {Array} columns - Array de objetos com { key, label, width?, render?, className?, sortable? }
 *   - key: chave do dado no objeto da linha
 *   - label: texto exibido no cabeçalho
 *   - width: classe CSS de largura (opcional, ex: "w-6", "w-14")
 *   - render: função customizada para renderizar a célula (recebe (valor, row, index))
 *   - className: classe CSS extra para a célula (opcional)
 *   - sortable: se false, desabilita ordenação nesta coluna (padrão: true se tiver key e label)
 * @param {Array} data - Array de objetos com os dados das linhas
 * @param {string|null} selectedId - ID do item selecionado (ou null)
 * @param {Function} onSelect - Callback ao clicar em uma linha (recebe o item)
 * @param {Function} onDoubleClick - Callback ao dar duplo clique (recebe o item)
 * @param {boolean} loading - Se true, mostra loading spinner
 * @param {string} emptyIcon - Emoji para exibir quando não há dados
 * @param {string} emptyMessage - Mensagem quando não há dados
 * @param {string} className - Classe CSS extra para o container
 */
export default function DataTable({
    columns = [],
    data = [],
    selectedId = null,
    onSelect,
    onDoubleClick,
    loading = false,
    emptyIcon = "📋",
    emptyMessage = "Nenhum registro encontrado",
    className = "",
}) {
    // Estado de ordenação: { key: string, direction: 'asc' | 'desc' } ou null
    const [sortConfig, setSortConfig] = useState(null);

    // Função para alternar ordenação ao clicar no cabeçalho
    const handleSort = (colKey) => {
        if (!colKey) return;
        setSortConfig((prev) => {
            if (!prev || prev.key !== colKey) {
                // 1º clique: ordem ascendente
                return { key: colKey, direction: "asc" };
            }
            if (prev.direction === "asc") {
                // 2º clique: ordem descendente
                return { key: colKey, direction: "desc" };
            }
            // 3º clique: remove ordenação
            return null;
        });
    };

    // Dados ordenados (memoizado para performance)
    const sortedData = useMemo(() => {
        if (!sortConfig) return data;

        const { key, direction } = sortConfig;

        return [...data].sort((a, b) => {
            // Suporte a chaves aninhadas (ex: "bem.codigo")
            const valA = key.split(".").reduce((obj, k) => obj?.[k], a);
            const valB = key.split(".").reduce((obj, k) => obj?.[k], b);

            // Valores nulos/undefined vão para o final
            if (valA == null && valB == null) return 0;
            if (valA == null) return 1;
            if (valB == null) return -1;

            let comparison = 0;

            // Comparação numérica se ambos forem números
            if (typeof valA === "number" && typeof valB === "number") {
                comparison = valA - valB;
            }
            // Comparação para datas (strings ISO)
            else if (
                typeof valA === "string" && typeof valB === "string" &&
                !isNaN(Date.parse(valA)) && !isNaN(Date.parse(valB)) &&
                valA.includes("-") && valB.includes("-")
            ) {
                comparison = new Date(valA) - new Date(valB);
            }
            // Comparação de strings (case-insensitive)
            else {
                const strA = String(valA).toLowerCase();
                const strB = String(valB).toLowerCase();
                comparison = strA.localeCompare(strB, "pt-BR");
            }

            return direction === "asc" ? comparison : -comparison;
        });
    }, [data, sortConfig]);

    // Ícone de ordenação para o cabeçalho
    const getSortIcon = (colKey) => {
        if (!sortConfig || sortConfig.key !== colKey) return null;
        return sortConfig.direction === "asc" ? " ▲" : " ▼";
    };

    if (loading) {
        return (
            <div className={`flex items-center justify-center h-64 ${className}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary3"></div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className={`text-center text-gray-500 mt-20 ${className}`}>
                <p className="text-4xl mb-4">{emptyIcon}</p>
                <p>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className={`datatable-scroll-container ${className}`}>
            <table
                className="w-full border-collapse text-[12px]"
                style={{ fontFamily: "Segoe UI, Tahoma, sans-serif" }}
            >
                <thead className="datatable-thead">
                    <tr className="bg-[#E5E5E5] border-[#ccc]">
                        {columns.map((col, i) => {
                            const isSortable = col.sortable !== false && col.key && col.label;
                            const isActive = sortConfig?.key === col.key;
                            return (
                                <th
                                    key={i}
                                    className={`px-2 py-1 text-left font-bold text-black whitespace-nowrap select-none ${isSortable ? "cursor-pointer hover:bg-[#D5D5D5] transition-colors" : ""
                                        } ${isActive ? "bg-[#CDCDCD]" : ""}`}
                                    onClick={() => isSortable && handleSort(col.key)}
                                    title={isSortable ? "Clique para ordenar" : ""}
                                >
                                    {col.label}
                                    {isSortable && (
                                        <span className="text-[10px] ml-1 text-gray-500">
                                            {getSortIcon(col.key) || " ⇅"}
                                        </span>
                                    )}
                                </th>
                            );
                        })}
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((row, index) => {
                        const rowId = row.id || index;
                        const isSelected = selectedId && selectedId === rowId;

                        return (
                            <tr
                                key={rowId}
                                className={`border-b font-medium text-[12px] border-[#ddd] cursor-pointer ${isSelected
                                    ? "bg-primary"
                                    : index % 2 === 0
                                        ? "bg-[#FBFBFB]"
                                        : "bg-[#EEEEEE]"
                                    } buttonHover`}
                                onClick={() => onSelect?.(row)}
                                onDoubleClick={() => onDoubleClick?.(row)}
                            >
                                {columns.map((col, colIndex) => {
                                    const value = col.key
                                        ? col.key.split(".").reduce((obj, k) => obj?.[k], row)
                                        : undefined;

                                    return (
                                        <td
                                            key={colIndex}
                                            className={`px-2 border-r border-[#CCCCCC] text-black whitespace-nowrap ${col.width || ""} ${col.className || ""}`}
                                        >
                                            {col.render
                                                ? col.render(value, row, index)
                                                : value ?? "-"}
                                        </td>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
