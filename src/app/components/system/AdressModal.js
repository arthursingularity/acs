"use client";

import { useEffect, useState } from "react";
import { PRODUCTS_DB } from "./Database";
import { QRCodeCanvas } from "qrcode.react";

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
        if (tipo === "NIVEL" && altura) {
            const max = Number(altura);

            const saved = localStorage.getItem(gavetaStorageKey);

            if (saved) {
                const parsed = JSON.parse(saved);

                const niveis = Array.from({ length: max }, (_, i) => {
                    if (parsed[i]) return parsed[i]; // pega do array salvo
                    return {
                        nivel: String(i + 1),
                        produto: "",
                        descricao: "",
                        observacao: "",
                    };
                });

                setGavetaNiveis(niveis);
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
        if (tipo !== "NIVEL") return;

        if (!gavetaNiveis.length) return;

        localStorage.setItem(
            gavetaStorageKey,
            JSON.stringify(gavetaNiveis)
        );
    }, [gavetaNiveis, tipo, gavetaStorageKey]);

    useEffect(() => {
        if (tipo === "COLUNA") {
            setTipoCaixa("COLUNA");
            setAltura("5");
        }
    }, [tipo]);

    const onlyLettersUpper = (value) =>
        value.replace(/[^a-zA-Z]/g, "").toUpperCase();

    const onlyLettersAndSpacesUpper = (value) =>
        value.replace(/[^a-zA-Z ]/g, "").toUpperCase();

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

    const enderecoCode =
        mode === "endereco" && rua && coluna && nivel
            ? `${almo}${rua}${coluna}N${nivel}`
            : "";

    const etiquetaWidth = {
        "GAVETA G": "w-[106px]",
        "GAVETA M": "w-[87px]",
        "GAVETA P": "w-[68px]",
        "COLUNA": "w-[120px]",
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
            <div className="relative bg-white w-[390px] shadow-lg z-10">
                <div className="flex justify-between items-center bg-blackGradient text-white px-3 py-2 text-sm font-semibold">
                    <span>Cadastrar endereço</span>
                    <div className="flex items-center space-x-3">
                        {mode === "endereco" && !showGavetaPopup && tipo !== "NIVEL" && (
                            <div className="enderecoCode text-white text-[15px] bg-primary2 py-[2px] px-2 rounded font-bold tracking-wide">
                                {almo}{rua}{coluna}N{nivel}
                            </div>
                        )}
                        <div onClick={onClose}>
                            <img src="/imagens/close3.svg" className="w-[20px] buttonHover" />
                        </div>
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
                                            className="border px-2 w-full py-1 rounded w-full"
                                            value={rua}
                                            onChange={(e) => setRua(onlyLettersUpper(e.target.value))}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs w-full font-semibold text-gray-600">Coluna</label>
                                        <input
                                            className="border px-2 py-1 rounded w-full"
                                            value={coluna}
                                            onChange={(e) => setColuna(onlyNumbers(e.target.value))}
                                            onBlur={() => setColuna(formatColuna(coluna))}
                                        />
                                    </div>
                                    {tipo != "NIVEL" && (
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
                                        <label className="text-xs font-semibold text-gray-600">Tipo de endereço</label>
                                        <select
                                            className="border w-full px-2 h-[34px] rounded"
                                            value={tipo}
                                            onChange={(e) => setTipo(e.target.value)}
                                        >
                                            <option value="">Selecionar</option>
                                            <option value="COLUNA">COLUNA</option>
                                            <option value="NIVEL">NIVEL</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600">Tipo de etiqueta</label>
                                        <select
                                            className={`border w-full px-2 h-[34px] rounded ${tipo === "COLUNA" ? "bg-gray-200 cursor-not-allowed" : ""
                                                }`}
                                            value={tipoCaixa}
                                            disabled={tipo === "COLUNA"}
                                            onChange={(e) => setTipoCaixa(e.target.value)}
                                        >
                                            <option value="">Selecionar</option>
                                            <option value="COLUNA">COLUNA</option>
                                            <option value="GAVETA G">GAVETA G</option>
                                            <option value="GAVETA M">GAVETA M</option>
                                            <option value="GAVETA P">GAVETA P</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-gray-600">Altura máxima</label>
                                        <input
                                            type="number"
                                            className="border w-[112px] px-2 py-1 rounded"
                                            placeholder="Altura máx"
                                            value={altura}
                                            onChange={(e) => setAltura(e.target.value)}
                                            min={1}
                                            max={30}
                                            step={1}
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
                                                className={`productDescricao cursor-default border flex items-centerw-full px-3 py-2 rounded overflow-hidden bg-gray-200 text-sm ${produtoEncontrado ? "text-primary3 font-bold tracking-wide border-black" : "text-gray-600"}`}
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
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <label className="text-xs font-semibold text-gray-600">
                                                                        Código do produto
                                                                    </label>
                                                                </div>
                                                                <div className="flex space-x-1">
                                                                    {/* Código do produto */}
                                                                    <input
                                                                        className="border w-[60%] px-2 py-1 rounded mb-1"
                                                                        placeholder="Código"
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
                                                                        className={`text-xs px-2 w-full py-2 rounded cursor-default border mb-1 bg-gray-200 ${produtoEncontrado
                                                                            ? "text-primary3 font-bold tracking-wide border-black overflow-hidden text-[12px]"
                                                                            : "text-gray-600"
                                                                            }`}
                                                                    >
                                                                        {item.descricao || "Descrição do produto"}
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <div className="flex space-x-1">
                                                                        {/* Observação */}
                                                                        <input
                                                                            className="border w-full px-2 py-1 rounded"
                                                                            placeholder="Observação"
                                                                            value={item.observacao}
                                                                            onChange={(e) => {
                                                                                const copy = [...gavetaNiveis];
                                                                                copy[realIndex] = {
                                                                                    ...copy[realIndex],
                                                                                    observacao: onlyLettersAndSpacesUpper(e.target.value),
                                                                                };
                                                                                setGavetaNiveis(copy);
                                                                            }}
                                                                        />
                                                                        <button className="border-2 border-primary3 rounded bg-primary3 text-white px-3 pr-5 buttonHover text-sm flex items-center justify-center">
                                                                            <img src="/imagens/add.svg" className="w-[20px]" />Divisória
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <div className="flex justify-between mt-1">
                                                                    <div className="border">
                                                                        <div className="flex">
                                                                            <div
                                                                                className={`bg-black ${etiquetaWidth[tipoCaixa] || "w-[120px]"
                                                                                    } px-1 font-bold h-[35px] flex items-center justify-center`}
                                                                            >
                                                                                <p className="leading-[1.1] text-white text-[9px] text-center mt-[3px]">{item.descricao}</p>
                                                                            </div>
                                                                            <div className="qrCode w-[35px] h-[35px] bg-stamOrange">
                                                                                <QRCodeCanvas
                                                                                    value={`${almo}${rua}${coluna}N${item.nivel}`}
                                                                                    size={35}
                                                                                    level="M"
                                                                                    includeMargin={false}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                        {(tipo === "COLUNA" || tipoCaixa === "COLUNA") && (
                                                                            <div className="flex">
                                                                                <div className="bg-stamOrange w-full h-[7px] flex items-center justify-center">
                                                                                    <p className="text-white font-bold text-[6px] text-center">
                                                                                        {item.produto}
                                                                                    </p>
                                                                                </div>
                                                                                <div className="bg-stamOrange w-[46px] h-[7px]">
                                                                                    <p className="text-white font-bold text-[6px] text-center">
                                                                                        {almo}{rua}{coluna}N{item.nivel}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="text-primary2 text-[15px] cursor-default bg-gray-200 border border-black text-center flex items-center px-[11px] rounded font-bold tracking-wide">
                                                                        {almo}{rua}{coluna}N{item.nivel}
                                                                    </div>
                                                                </div>
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
                    {tipo === "COLUNA" && (
                        <div className="etiqueta flex justify-between mt-1">
                            <div>
                                <label className="text-xs font-semibold text-gray-600">
                                    Placa de identificação
                                </label>
                                <div className="flex">
                                    <div className="bg-black w-[120px] px-1 font-bold h-[35px] flex items-center justify-center">
                                        <p className="leading-[1.1] text-white text-[9px] text-center mt-[3px]">{descricao}</p>
                                    </div>
                                    <div className="qrCode w-[35px] h-[35px] bg-stamOrange">
                                        {enderecoCode && (
                                            <QRCodeCanvas
                                                value={enderecoCode}
                                                size={35}
                                                level="M"
                                                includeMargin={false}
                                            />
                                        )}
                                    </div>
                                </div>
                                {tipo === "COLUNA" && (
                                    <div className="flex">
                                        <div className="bg-stamOrange w-full h-[7px] flex items-center justify-center">
                                            <p className="text-white font-bold text-[6px] text-center">{produto}</p>
                                        </div>
                                        <div className="bg-stamOrange w-[46px] h-[7px]">
                                            <p className="text-white font-bold text-[6px] text-center">{enderecoCode}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-600">
                                    Cor do endereço
                                </label>
                                {mode === "endereco" && (
                                    <div className="flex space-x-[4px]">
                                        {Object.keys(BLOCK_COLORS).map((color) => (
                                            <button
                                                key={color}
                                                type="button"
                                                onClick={() => setBlockColor(color)}
                                                className={`
                                w-[25px] h-[25px] rounded border cursor-pointer
                                ${BLOCK_COLORS[color]}
                                ${blockColor === color ? "ring-1 ring-black" : ""}
                                `}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    <div className="flex justify-between items-center gap-2 mt-6">
                        {initialData && (
                            <button
                                onClick={handleDelete}
                                className="border-2 border-primary3 rounded text-primary3 px-5 py-1 cursor-pointer hover:border-black hover:bg-red-200 hover:text-black"
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
                                if (tipo === "NIVEL") {
                                    onSave({
                                        type: "endereco",
                                        tipo: "NIVEL",
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