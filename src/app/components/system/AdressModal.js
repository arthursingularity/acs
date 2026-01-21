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
        } else {
            setProduto("");
            setTipo("");
            setRua("");
            setColuna("");
            setNivel("");
            setAltura("");
            setDescricao("")
            setObservacao("")
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
            <div className="relative bg-white w-[400px] rounded shadow-lg p-4 z-10">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="font-bold text-xl">Endereçar</h2>
                    <div className="enderecoCode text-cyan-500 bg-neutral-900 p-1 px-3 rounded-lg font-bold tracking-wide">
                        {almo}{rua}{coluna}N{nivel}
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex space-x-2">
                        <input
                            className="border w-full px-2 py-1 rounded"
                            placeholder="Rua"
                            value={rua}
                            onChange={(e) => setRua(onlyLettersUpper(e.target.value))}
                        />
                        <input
                            className="border w-full px-2 py-1 rounded"
                            placeholder="Coluna"
                            value={coluna}
                            onChange={(e) => setColuna(onlyNumbers(e.target.value))}
                            onBlur={() => setColuna(formatColuna(coluna))}
                        />
                        <input
                            className="border w-full px-2 py-1 rounded"
                            placeholder="Nível"
                            value={nivel}
                            onChange={(e) => setNivel(onlyNumbers(e.target.value))}
                        />
                    </div>
                    <div className="flex space-x-2">
                        <input
                            className="border w-full px-2 py-1 rounded"
                            placeholder="Tipo de endereço"
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value)}
                        />
                        <input
                            className="border w-full px-2 py-1 rounded"
                            placeholder="Altura máxima"
                            value={altura}
                            onChange={(e) => setAltura(onlyNumbers(e.target.value))}
                        />
                    </div>
                    <div className="flex space-x-2">
                        <input
                            className="border w-full px-2 py-1 rounded"
                            placeholder="Código"
                            value={produto}
                            onChange={(e) => setProduto(e.target.value)}
                        />
                        <input
                            className="border w-full px-2 py-1 rounded"
                            placeholder="Observação"
                            value={observacao}
                            onChange={(e) => setObservacao(e.target.value)}
                        />
                    </div>
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
                        onClick={() => onSave({ rua, coluna, nivel, almo, produto, tipo, altura, descricao, observacao })}
                        className="bg-green-600 text-white px-3 py-1 rounded buttonHover"
                    >
                        Salvar
                    </button>
                </div>
            </div>
        </div>
    );
}
