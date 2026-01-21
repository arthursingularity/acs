"use client";

import { useEffect, useState } from "react";
import { PRODUCTS_DB } from "./Database";

export default function AddressModal({
    open,
    onClose,
    onSave,
    initialData,
    onDelete,
    almo,
}) {
    const [produto, setProduto] = useState("");
    const [descricao, setDescricao] = useState("");
    const [rua, setRua] = useState("");
    const [coluna, setColuna] = useState("");
    const [nivel, setNivel] = useState("");
    const [tipo, setTipo] = useState("");
    const [altura, setAltura] = useState("");
    const [observacao, setObservacao] = useState("");
    const [tipoCaixa, setTipoCaixa] = useState("");
    const produtoEncontrado = Boolean(descricao);

    useEffect(() => {
        if (initialData) {
            setProduto(initialData.produto || "");
            setTipo(initialData.tipo || "");
            setRua(initialData.rua || "");
            setColuna(initialData.coluna || "");
            setNivel(initialData.nivel || "");
            setAltura(initialData.altura || "");
            setDescricao(initialData.descricao || "");
            setObservacao(initialData.observacao || "");
            setTipoCaixa(initialData.tipoCaixa || "");
        } else {
            setProduto("");
            setTipo("");
            setRua("");
            setColuna("");
            setNivel("");
            setAltura("");
            setDescricao("")
            setObservacao("");
            setTipoCaixa("");
        }
    }, [initialData, open]);

    useEffect(() => {
        if (!produto) {
            setDescricao("");
            return;
        }

        const foundProduct = PRODUCTS_DB.find(
            (item) => item.produto === produto
        );

        if (foundProduct) {
            setDescricao(foundProduct.descricao);
        } else {
            setDescricao("");
        }
    }, [produto]);

    useEffect(() => {
        if (tipo === "COLUNA") {
            setNivel("1");
        }
    }, [tipo]);

    const onlyLettersUpper = (value) =>
        value.replace(/[^a-zA-Z]/g, "").toUpperCase();

    const onlyNumbers = (value) =>
        value.replace(/\D/g, "");

    const formatColuna = (value) => {
        if (!value) return "";
        return value.padStart(2, "0");
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* backdrop */}
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />

            {/* modal */}
            <div className="relative bg-white w-[420px] rounded shadow-lg p-4 z-10">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="font-bold text-xl">Endereçar</h2>
                    <div className="enderecoCode text-cyan-500 bg-neutral-900 p-1 px-3 rounded-lg font-bold tracking-wide">
                        {almo}{rua}{coluna}N{nivel}
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex space-x-1">
                        <div>
                            <label className="text-xs font-semibold text-gray-600">Rua</label>
                            <input
                                className="border px-2 py-1 rounded w-full"
                                value={rua}
                                onChange={(e) => setRua(onlyLettersUpper(e.target.value))}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-600">Coluna</label>
                            <input
                                className="border px-2 py-1 rounded w-full"
                                value={coluna}
                                onChange={(e) => setColuna(onlyNumbers(e.target.value))}
                                onBlur={() => setColuna(formatColuna(coluna))}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-600">Nível</label>
                            <input
                                className={`border px-2 py-1 rounded w-full ${tipo === "COLUNA" ? "bg-gray-200 cursor-not-allowed" : ""}`}
                                value={nivel}
                                disabled={tipo === "COLUNA"}
                                onChange={(e) => setNivel(onlyNumbers(e.target.value))}
                            />
                        </div>
                    </div>
                    <div className="flex space-x-1">
                        <div>
                            <label className="text-xs font-semibold text-gray-600">Tipo endereço</label>
                            <select
                                className="border w-[123px] px-2 h-[34px] rounded"
                                value={tipo}
                                onChange={(e) => setTipo(e.target.value)}
                            >
                                <option value="">Selecionar</option>
                                <option value="COLUNA">COLUNA</option>
                                <option value="GAVETA">GAVETA</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-600">Tipo caixa</label>
                            <input
                                className="border w-[132px] px-2 py-1 rounded"
                                placeholder="Tipo de caixa"
                                value={tipoCaixa}
                                onChange={(e) => setTipoCaixa(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-600">Altura máx</label>
                            <input
                                className="border w-[125px] px-2 py-1 rounded"
                                placeholder="Altura máx"
                                value={altura}
                                onChange={(e) => setAltura(onlyNumbers(e.target.value))}
                            />
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <div>
                            <label className="text-xs font-semibold text-gray-600">Código</label>
                            <input
                                className="border w-full px-2 py-1 rounded"
                                placeholder="Código"
                                value={produto}
                                onChange={(e) => setProduto(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-gray-600">Observação</label>
                            <input
                                className="border w-full px-2 py-1 rounded"
                                placeholder="Observação"
                                value={observacao}
                                onChange={(e) => setObservacao(e.target.value)}
                            />
                        </div>

                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-600">Descrição</label>
                        <div
                            className={`
                            productDescricao cursor-default flex items-center
                            w-full px-3 py-2 rounded overflow-hidden text-sm
                            ${produtoEncontrado ? "bg-neutral-800 text-cyan-500 font-bold tracking-wide" : "bg-gray-200 text-gray-600"}
                        `}
                        >
                            {descricao || "Descrição do produto"}
                        </div>
                    </div>
                </div>
                <div className="flex justify-between gap-2 mt-4">
                    <button onClick={onClose} className="buttonHover px-3 py-1 rounded bg-gray-300">Cancelar</button>
                    {initialData && (
                        <button
                            onClick={onDelete}
                            className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                        >
                            Excluir
                        </button>
                    )}
                    <button
                        onClick={() => onSave({ rua, coluna, nivel, almo, produto, tipo, tipoCaixa, altura, descricao, observacao })}
                        className="bg-green-600 text-white px-3 py-1 rounded buttonHover"
                    >
                        Salvar
                    </button>
                </div>
            </div>
        </div>
    );
}