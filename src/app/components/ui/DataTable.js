"use client";

import React from "react";

/**
 * DataTable - Componente reutilizável de tabela padronizada
 * 
 * @param {Array} columns - Array de objetos com { key, label, width?, render?, className? }
 *   - key: chave do dado no objeto da linha
 *   - label: texto exibido no cabeçalho
 *   - width: classe CSS de largura (opcional, ex: "w-6", "w-14")
 *   - render: função customizada para renderizar a célula (recebe (valor, row, index))
 *   - className: classe CSS extra para a célula (opcional)
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
                        {columns.map((col, i) => (
                            <th
                                key={i}
                                className="px-2 py-1 text-left font-bold text-black whitespace-nowrap"
                            >
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, index) => {
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
