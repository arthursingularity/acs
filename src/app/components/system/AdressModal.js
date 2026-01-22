"use client";

import { useEffect, useState } from "react";
import { PRODUCTS_DB } from "./Database";

export const BLOCK_COLORS = {
    gray: "bg-gray-600 hover:bg-gray-500",
    blue: "bg-sky-600 hover:bg-sky-500",
    green: "bg-green-600 hover:bg-green-500",
    red: "bg-red-600 hover:bg-red-500",
    orange: "bg-stamOrange hover:bg-orange-400",
};

export default function AddressModal({
    open,
    onClose,
    onSave,
    initialData,
    onDelete,
    almo,
}) {
    const [blockColor, setBlockColor] = useState("gray");
    const [mode, setMode] = useState("endereco");
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
    const [showGavetaPopup, setShowGavetaPopup] = useState(false);
    const [gavetaNiveis, setGavetaNiveis] = useState([]);
    const gavetaStorageKey = `gavetas_${almo}_${rua}_${coluna}`;

    useEffect(() => {
        if (mode === "letter") {
            setTipo("");
            setNivel("");
            setAltura("");
            setShowGavetaPopup(false);
            setGavetaNiveis([]);
        }
    }, [mode]);

    useEffect(() => {
        if (tipo === "GAVETA" && altura) {
            const max = Number(altura);

            const saved = localStorage.getItem(gavetaStorageKey);

            if (saved) {
                const parsed = JSON.parse(saved);

                setGavetaNiveis(
                    parsed.slice(0, max) // respeita altura atual
                );
            } else {
                const niveis = Array.from({ length: max }, (_, i) => ({
                    nivel: String(i + 1),
                    produto: "",
                    descricao: "",
                    observacao: "",
                }));

                setGavetaNiveis(niveis);
            }

            setNivel("1");
            setShowGavetaPopup(true);
        } else {
            setShowGavetaPopup(false);
            setGavetaNiveis([]);
        }
    }, [tipo, altura, gavetaStorageKey]);

    useEffect(() => {
        if (initialData) {
            setBlockColor(initialData.blockColor || "gray");
        } else {
            setBlockColor("gray");
        }
    }, [initialData, open]);

    useEffect(() => {
        if (initialData) {
            setMode(initialData.type || "endereco");
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
            setMode("endereco");
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

    useEffect(() => {
        if (tipo !== "GAVETA") return;

        if (!gavetaNiveis.length) return;

        localStorage.setItem(
            gavetaStorageKey,
            JSON.stringify(gavetaNiveis)
        );
    }, [gavetaNiveis, tipo, gavetaStorageKey]);


    const onlyLettersUpper = (value) =>
        value.replace(/[^a-zA-Z]/g, "").toUpperCase();

    const onlyNumbers = (value) =>
        value.replace(/\D/g, "");

    const formatColuna = (value) => {
        if (!value) return "";
        return value.padStart(2, "0");
    };

    const handleDelete = () => {
        localStorage.removeItem(gavetaStorageKey);
        onDelete();
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
            <div className="relative bg-white w-[420px] shadow-lg z-10">
                <div className="flex justify-between items-center bg-blackGradient text-white px-3 py-2 text-sm font-semibold">
                    <div className="flex items-center space-x-3">
                        <span>Cadastrar endereço</span>
                        {mode === "endereco" && !showGavetaPopup && tipo !== "GAVETA" && (
                            <div className="enderecoCode text-primary2 text-[15px] bg-white py-[2px] px-3 rounded font-bold tracking-wide">
                                {almo}{rua}{coluna}N{nivel}
                            </div>
                        )}
                    </div>
                    <div onClick={onClose}>
                        <img src="/imagens/close3.svg" className="w-[20px] buttonHover" />
                    </div>
                </div>
                <div className="p-4">
                    {mode === "letter" && (
                        <div>
                            <label className="text-xs font-semibold text-gray-600">
                                Letra da Rua
                            </label>
                            <input
                                className="border px-2 py-1 rounded w-full"
                                value={coluna}
                                onChange={(e) =>
                                    setColuna(onlyLettersUpper(e.target.value))
                                }
                            />
                        </div>
                    )}
                    {mode === "endereco" && (
                        <div className="flex">
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
                                    {!showGavetaPopup && (
                                        <div>
                                            <label className="text-xs font-semibold text-gray-600">Nível</label>
                                            <input
                                                className={`border px-2 py-1 rounded w-full ${tipo === "COLUNA" ? "bg-gray-200 cursor-not-allowed" : ""}`}
                                                value={nivel}
                                                disabled={tipo === "COLUNA"}
                                                onChange={(e) => setNivel(onlyNumbers(e.target.value))}
                                            />
                                        </div>
                                    )}
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
                                            onChange={(e) => setTipoCaixa(onlyLettersUpper(e.target.value))}
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
                                {!showGavetaPopup && (
                                    <div>
                                        <div className="flex space-x-1">
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
                                                className={`productDescricao cursor-default border flex items-centerw-full px-3 py-2 rounded overflow-hidden text-sm ${produtoEncontrado ? "bg-neutral-800 text-cyan-500 font-bold tracking-wide border-none" : "bg-gray-200 text-gray-600"}`}
                                            >
                                                {descricao || "Descrição do produto"}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {showGavetaPopup && (
                                    <div className="flex items-center justify-center z-50 pt-4">
                                        <div className="bg-white w-full max-h-[220px] overflow-auto rounded shadow-lg">
                                            <div className="space-y-2">
                                                {gavetaNiveis
                                                    .slice()
                                                    .reverse()
                                                    .map((item) => {
                                                        const produtoEncontrado = Boolean(item.descricao);
                                                        const realIndex = gavetaNiveis.findIndex(
                                                            (g) => g.nivel === item.nivel
                                                        );

                                                        return (
                                                            <div key={item.nivel} className="border-2 border-primary3 p-2 rounded">
                                                                <div className="flex justify-between items-center">
                                                                    <label className="text-xs font-semibold text-gray-600">
                                                                        Código do produto
                                                                    </label>
                                                                    <div className="text-cyan-500 text-[15px] bg-blackGradient text-center mb-1 py-[2px] px-2 rounded font-bold tracking-wide">
                                                                        {almo}{rua}{coluna}N{item.nivel}
                                                                    </div>
                                                                </div>

                                                                {/* Código do produto */}
                                                                <input
                                                                    className="border w-full px-2 py-1 rounded mb-1"
                                                                    placeholder="Código do produto"
                                                                    value={item.produto}
                                                                    onChange={(e) => {
                                                                        const codigo = e.target.value;

                                                                        const foundProduct = PRODUCTS_DB.find(
                                                                            (p) => p.produto === codigo
                                                                        );

                                                                        const copy = [...gavetaNiveis];
                                                                        copy[realIndex] = {
                                                                            ...copy[realIndex],
                                                                            produto: codigo,
                                                                            descricao: foundProduct
                                                                                ? foundProduct.descricao
                                                                                : "",
                                                                        };

                                                                        setGavetaNiveis(copy);
                                                                    }}
                                                                />

                                                                {/* Descrição automática */}
                                                                <div
                                                                    className={`text-xs px-2 py-2 rounded cursor-default mb-1 ${produtoEncontrado
                                                                        ? "bg-neutral-800 text-cyan-500 font-bold tracking-wide"
                                                                        : "bg-gray-200 text-gray-600"
                                                                        }`}
                                                                >
                                                                    {item.descricao || "Descrição do produto"}
                                                                </div>

                                                                {/* Observação */}
                                                                <input
                                                                    className="border w-full px-2 py-1 rounded"
                                                                    placeholder="Observação"
                                                                    value={item.observacao}
                                                                    onChange={(e) => {
                                                                        const copy = [...gavetaNiveis];
                                                                        copy[realIndex] = {
                                                                            ...copy[realIndex],
                                                                            observacao: e.target.value,
                                                                        };
                                                                        setGavetaNiveis(copy);
                                                                    }}
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                            </div>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    )}
                    <div className="flex justify-between items-center gap-2 mt-10">
                        {initialData && (
                            <button
                                onClick={handleDelete}
                                className="px-5 py-2 rounded text-sm bg-red-500 text-white buttonHover"
                            >
                                Excluir
                            </button>
                        )}
                        {!initialData && (
                            <button
                                onClick={() =>
                                    setMode((prev) =>
                                        prev === "endereco" ? "letter" : "endereco"
                                    )
                                }
                                className="border-2 border-primary3 text-primary3 px-3 py-1 rounded buttonHover2"
                            >
                                {mode === "endereco" ? "Definir Letra" : "Definir Endereço"}
                            </button>
                        )}
                        {mode === "endereco" && (
                            <div className="flex space-x-[4px]">
                                {Object.keys(BLOCK_COLORS).map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setBlockColor(color)}
                                        className={`
                                                    w-[25px] h-[25px] rounded-full border cursor-pointer
                                                    ${BLOCK_COLORS[color]}
                                                    ${blockColor === color ? "ring-1 ring-black" : ""}
                                                    `}
                                    />
                                ))}
                            </div>
                        )}
                        <button
                            onClick={() => {
                                if (mode === "letter") {
                                  onSave({
                                    type: "letter",          // ✅ ISSO É O PONTO-CHAVE
                                    coluna,                  // letra
                                    almo,
                                  });
                                  return;
                                }
                              
                                // 🔹 GAVETA
                                if (tipo === "GAVETA") {
                                  onSave({
                                    type: "endereco",
                                    tipo: "GAVETA",
                                    rua,
                                    coluna,
                                    almo,
                                    tipoCaixa,
                                    altura,
                                    blockColor,
                                    enderecos: gavetaNiveis.map((g) => ({
                                      rua,
                                      coluna,
                                      nivel: g.nivel,
                                      enderecoCode: `${almo}${rua}${coluna}N${g.nivel}`,
                                      produto: g.produto,
                                      descricao: g.descricao,
                                      observacao: g.observacao,
                                    })),
                                  });
                                  return;
                                }
                              
                                // 🔹 ENDEREÇO NORMAL
                                onSave({
                                  type: "endereco",
                                  rua,
                                  coluna,
                                  nivel,
                                  almo,
                                  produto,
                                  tipo,
                                  tipoCaixa,
                                  altura,
                                  descricao,
                                  observacao,
                                  blockColor,
                                });
                              }}                              
                            className="bg-primary3 text-white px-6 py-2 rounded buttonHover text-sm"
                        >
                            Salvar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}