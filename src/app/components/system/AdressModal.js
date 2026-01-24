"use client";

import { useEffect, useState } from "react";
import { PRODUCTS_DB } from "./Database";
import { QRCodeCanvas } from "qrcode.react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import ModalWrapper from "../ui/ModalWrapper";
import StoragePreview from "./StoragePreview";

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
    existingBlocks = {},
    lastInteraction,
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
        }
    }, [tipo]);

    // 🔹 Auto-incremento inteligente da coluna (Bidirecional)
    useEffect(() => {
        // Só executa se estiver criando um novo (sem initialData) e Rua tiver 2 caracteres
        if (!initialData && rua.length === 2) {
            const cols = [];
            const blocks = existingBlocks || {};

            Object.values(blocks).forEach((item) => {
                if (item.rua === rua && item.coluna) {
                    const v = parseInt(item.coluna, 10);
                    if (!isNaN(v)) cols.push(v);
                }
            });

            if (cols.length === 0) {
                setColuna("01");
                return;
            }

            const min = Math.min(...cols);
            const max = Math.max(...cols);
            let next = max + 1;

            // Se a última ação foi nesta rua e foi <= min atual, sugere decrescente
            if (lastInteraction && lastInteraction.rua === rua) {
                const lastCol = parseInt(lastInteraction.coluna, 10);
                if (lastCol <= min) {
                    next = Math.max(1, min - 1);
                }
            }

            setColuna(String(next).padStart(2, "0"));
        }
    }, [rua, initialData, existingBlocks, lastInteraction]);

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
        "GAVETA G": "w-[106px] text-[8px]",
        "GAVETA M": "w-[87px] text-[7px]",
        "GAVETA P": "w-[68px] text-[7px]",
        "COLUNA": "w-[120px] text-[7px]",
    };

    if (!open) return null;

    return (
        <>
            <StoragePreview type={tipo} height={altura} tipoCaixa={tipoCaixa} levels={gavetaNiveis} />
            <ModalWrapper
                isOpen={open}
                onClose={onClose}
                title="Cadastrar endereço"
                headerContent={
                    mode === "endereco" && !showGavetaPopup && tipo !== "NIVEL" && (
                        <div className="enderecoCode text-white text-[15px] bg-primary2 py-[2px] px-2 rounded font-bold tracking-wide">
                            {almo}{rua}{coluna}N{nivel}
                        </div>
                    )
                }
            >
                {mode === "letter" && (
                    <div>
                        <label className="text-xs font-semibold text-gray-600">
                            Letra da Rua
                        </label>
                        <Input
                            className="w-full"
                            value={coluna}
                            onChange={(e) =>
                                setColuna(onlyLettersUpper(e.target.value))
                            }
                        />
                    </div>
                )}
                <div>
                    {mode === "endereco" && (
                        <div className="flex">
                            <div className="space-y-1">
                                <div className="flex space-x-1">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600">Rua</label>
                                        <Input
                                            className="w-full"
                                            value={rua}
                                            maxLength={3}
                                            onChange={(e) => {
                                                const valor = e.target.value.toUpperCase().slice(0, 2);
                                                setRua(valor);
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs w-full font-semibold text-gray-600">Coluna</label>
                                        <Input
                                            className="w-full"
                                            value={coluna}
                                            onChange={(e) => setColuna(onlyNumbers(e.target.value))}
                                            onBlur={() => setColuna(formatColuna(coluna))}
                                        />
                                    </div>
                                    <div className="hidden">
                                        <label className="text-xs font-semibold text-gray-600">Nível</label>
                                        <Input
                                            className={`w-full ${tipo === "COLUNA" ? "bg-gray-200 cursor-not-allowed" : ""}`}
                                            value={nivel}
                                            disabled={tipo === "COLUNA"}
                                            onChange={(e) => setNivel(onlyNumbers(e.target.value))}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600">Tipo de endereço</label>
                                        <select
                                            className="border w-[120px] px-2 h-[34px] rounded"
                                            value={tipo}
                                            onChange={(e) => setTipo(e.target.value)}
                                        >
                                            <option value="">Selecionar</option>
                                            <option value="COLUNA">COLUNA</option>
                                            <option value="NIVEL">NIVEL</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex space-x-1">
                                    <div>
                                        <label className="tipoEtiquetaPrincipal text-xs font-semibold text-gray-600">Tipo de etiqueta</label>
                                        <select
                                            className={`border ${!showGavetaPopup ? "w-[111px]" : "w-[177px]"} px-2 h-[34px] rounded ${tipo === "COLUNA" ? "bg-gray-200 cursor-not-allowed" : ""
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
                                        <Input
                                            type="number"
                                            className={`w-[120px] ${!showGavetaPopup ? "w-[111px]" : "w-[177px]"}`}
                                            placeholder="Altura máx"
                                            value={altura}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const maxVal = tipo === "COLUNA" ? 6 : 7;
                                                if (val === "" || (Number(val) >= 1 && Number(val) <= maxVal)) {
                                                    setAltura(val);
                                                }
                                            }}
                                            min={1}
                                            max={tipo === "COLUNA" ? 6 : 7}
                                        />
                                    </div>
                                    {!showGavetaPopup && (
                                        <div>
                                            <label className="text-xs font-semibold text-gray-600">Observação</label>
                                            <Input
                                                className="w-full"
                                                placeholder="Observação"
                                                value={observacao}
                                                onChange={(e) => setObservacao(e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                                {!showGavetaPopup && (
                                    <div className="mt-2">
                                        <div className="flex items-center space-x-1">
                                            <div>
                                                <div className="text-xs font-semibold text-gray-600">Código</div>
                                                <Input
                                                    className="w-[116px]"
                                                    placeholder="Código"
                                                    value={produto}
                                                    onChange={(e) => setProduto(e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <div className="text-xs font-semibold text-gray-600">Descrição</div>
                                                <div
                                                    className={`productDescricao cursor-default border flex leading-[1] w-[238px] items-center h-[34px] pl-1 py-2 rounded overflow-hidden bg-gray-200 text-[13px] ${produtoEncontrado ? "text-primary3 font-bold tracking-wide border-black" : "text-gray-600"}`}
                                                >
                                                    {descricao || "Descrição do produto"}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {showGavetaPopup && (
                                    <div className="flex items-center justify-center z-50 pt-4">
                                        <div className="bg-white w-full max-h-[220px] overflow-auto rounded">
                                            <div className="space-y-4">
                                                {gavetaNiveis
                                                    .slice()
                                                    .reverse()
                                                    .map((item) => {
                                                        const realIndex = gavetaNiveis.findIndex(
                                                            (g) => g.nivel === item.nivel
                                                        );
                                                        const isDivisoria = item.isDivisoria;

                                                        const toggleDivisoria = () => {
                                                            const copy = [...gavetaNiveis];
                                                            if (isDivisoria) {
                                                                // Convert back to single
                                                                const kept = item.d1 || {};
                                                                copy[realIndex] = {
                                                                    ...item,
                                                                    isDivisoria: false,
                                                                    produto: kept.produto || "",
                                                                    descricao: kept.descricao || "",
                                                                    observacao: kept.observacao || "",
                                                                    d1: null,
                                                                    d2: null
                                                                };
                                                            } else {
                                                                // Split
                                                                copy[realIndex] = {
                                                                    ...item,
                                                                    isDivisoria: true,
                                                                    d1: {
                                                                        produto: item.produto || "",
                                                                        descricao: item.descricao || "",
                                                                        observacao: item.observacao || ""
                                                                    },
                                                                    d2: {
                                                                        produto: "",
                                                                        descricao: "",
                                                                        observacao: ""
                                                                    }
                                                                };
                                                            }
                                                            setGavetaNiveis(copy);
                                                        };

                                                        const updateItem = (field, value, subObj = null) => {
                                                            const copy = [...gavetaNiveis];
                                                            const current = copy[realIndex];

                                                            if (subObj) {
                                                                const sub = { ...current[subObj], [field]: value };

                                                                // Product Lookup for SubObj
                                                                if (field === 'produto') {
                                                                    const found = PRODUCTS_DB.find(p => p.produto === value);
                                                                    sub.descricao = found ? found.descricao : "";
                                                                }

                                                                let updatedCurrent = { ...current, [subObj]: sub };

                                                                // Sync tipoCaixa: if updating D1, also update D2
                                                                if (field === 'tipoCaixa' && subObj === 'd1' && updatedCurrent.d2) {
                                                                    updatedCurrent.d2 = { ...updatedCurrent.d2, [field]: value };
                                                                }

                                                                copy[realIndex] = updatedCurrent;
                                                            } else {
                                                                copy[realIndex] = { ...current, [field]: value };

                                                                // Product Lookup for Main
                                                                if (field === 'produto') {
                                                                    const found = PRODUCTS_DB.find(p => p.produto === value);
                                                                    copy[realIndex].descricao = found ? found.descricao : "";
                                                                }
                                                            }
                                                            setGavetaNiveis(copy);
                                                        };

                                                        const renderInputs = (data, prefix, subObj = null) => {
                                                            const isFound = Boolean(data.descricao);
                                                            const codeDisplay = subObj ? `${almo}${rua}${coluna}N${item.nivel}${subObj.toUpperCase()}` : `${almo}${rua}${coluna}N${item.nivel}`;

                                                            return (
                                                                <div className="flex flex-col gap-1 w-full relative">
                                                                    {/* Line 1: Code + Desc */}
                                                                    <div className="flex space-x-1">
                                                                        <Input
                                                                            className="w-[118px] mb-1 pl-2"
                                                                            placeholder={`Código`}
                                                                            value={data.produto}
                                                                            onChange={(e) => updateItem('produto', e.target.value, subObj)}
                                                                        />
                                                                        <div
                                                                            className={`text-xs px-2 w-full pl-2 rounded cursor-default border mb-1 bg-gray-200 
                                                                    flex items-center leading-[1.1]
                                                                    ${isFound ? "text-primary3 font-bold tracking-wide border-black overflow-hidden text-[12px]" : "text-gray-600"}`}
                                                                        >
                                                                            <p className="text-left mt-[2px]">
                                                                                {data.descricao || "Descrição do produto"}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    {/* Line 2: Obs + Actions */}
                                                                    <div className="flex space-x-1 items-center">
                                                                        <Input
                                                                            className="w-full"
                                                                            placeholder="Observação"
                                                                            value={data.observacao}
                                                                            onChange={(e) => updateItem('observacao', onlyLettersAndSpacesUpper(e.target.value), subObj)}
                                                                        />

                                                                        {/* Only show Divisória Button on the main block or D1 (to toggle) */}
                                                                        {(!subObj || subObj === 'd1') && (
                                                                            <div className="flex items-center space-x-1">
                                                                                <Button
                                                                                    onClick={toggleDivisoria}
                                                                                    className={`whitespace-nowrap w-[55px] py-0 h-[34px] text-[13px] ${isDivisoria ? 'bg-black text-white' : 'border-2 border-primary3 text-primary3'}`}
                                                                                    title={isDivisoria ? "Remover Divisória" : "Adicionar Divisória"}
                                                                                >
                                                                                    {isDivisoria ? "- Div" : "+ Div"}
                                                                                </Button>
                                                                                {isDivisoria && (
                                                                                    <div>
                                                                                        <select
                                                                                            className={`divEtiqueta border rounded h-[34px] pl-1`}
                                                                                            value={data.tipoCaixa || ""}
                                                                                            onChange={(e) => updateItem('tipoCaixa', e.target.value, subObj)}
                                                                                        >
                                                                                            <option value="">Etiqueta</option>
                                                                                            <option value="GAVETA G">GAVETA G</option>
                                                                                            <option value="GAVETA M">GAVETA M</option>
                                                                                            <option value="GAVETA P">GAVETA P</option>
                                                                                        </select>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>

                                                                    {/* Line 3: Plate + Code Display */}
                                                                    <div className="nivelEtiqueta flex justify-between items-center mt-1">
                                                                        <div>
                                                                            <div className="flex border">
                                                                                <div className={`bg-black ${etiquetaWidth[data.tipoCaixa || tipoCaixa] || "w-[106px] text-[9px]"} px-1 font-bold h-[35px] flex items-center justify-center`}>
                                                                                    <p className="leading-[1.1] text-white text-center">{data.descricao}</p>
                                                                                </div>
                                                                                <div className="qrCode w-[35px] h-[35px] bg-stamOrange">
                                                                                    {codeDisplay && (
                                                                                        <QRCodeCanvas
                                                                                            value={codeDisplay}
                                                                                            size={35}
                                                                                            level="M"
                                                                                            includeMargin={false}
                                                                                        />
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            {tipoCaixa === "COLUNA" && (
                                                                                <div className="flex">
                                                                                    <div className="bg-stamOrange w-full h-[7px] flex items-center justify-center">
                                                                                        <p className="text-white font-bold text-[6px] text-center">{data.produto}</p>
                                                                                    </div>
                                                                                    <div className="bg-stamOrange w-[46px] h-[7px]">
                                                                                        <p className="text-white font-bold text-[6px] text-center">{codeDisplay}</p>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        <div className="text-primary text-[14px] bg-blackGradient text-center flex justify-center items-center px-2 h-[35px] rounded font-bold tracking-tight min-w-[80px]">
                                                                            {codeDisplay}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        }

                                                        return (
                                                            <div key={item.nivel} className={`border-2 ${isDivisoria ? 'border-primary' : 'border-primary3'} p-2 rounded-lg overflow-hidden relative bg-white`}>
                                                                <div className="absolute top-0 right-0 bg-blackGradient text-white text-[10px] w-4 h-4 flex items-center justify-center rounded font-bold z-10">
                                                                    {item.nivel}
                                                                </div>

                                                                {isDivisoria ? (
                                                                    <div className="flex flex-col gap-3 pt-1">
                                                                        {renderInputs(item.d1, 'D1', 'd1')}
                                                                        <div className="border-t border-dashed border-primary relative">
                                                                            <span className="absolute left-1/2 -top-2 -translate-x-1/2 bg-white px-2 text-[10px] text-gray-400">Divisória</span>
                                                                        </div>
                                                                        {renderInputs(item.d2, 'D2', 'd2')}
                                                                    </div>
                                                                ) : (
                                                                    renderInputs(item, '', null)
                                                                )}
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
                    <div className="etiqueta flex justify-between mt-1">
                        {tipo === "COLUNA" && (
                            <div>
                                <label className="text-xs font-semibold text-gray-600">
                                    Placa de identificação
                                </label>
                                <div className="flex border">
                                    <div className="bg-black w-[120px] px-1 font-bold h-[35px] flex items-center justify-center">
                                        <p className="leading-[1.1] text-white text-[9px] text-center">{descricao}</p>
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
                        )}
                        <div>{mode === "endereco" && (
                            <div>
                                <label className="text-xs font-semibold text-gray-600">
                                    Cor do endereço
                                </label>
                                <div className="flex space-x-[4px]">
                                    {Object.keys(BLOCK_COLORS).map((color) => (
                                        <button
                                            key={color}
                                            type="button"
                                            onClick={() => setBlockColor(color)}
                                            className={`
                                w-[25px] h-[25px] rounded border cursor-pointer
                                ${BLOCK_COLORS[color]}
                                ${blockColor === color ? "ring-2 ring-primary" : ""}
                                `}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center gap-2 mt-6">
                    {initialData && (
                        <Button
                            onClick={handleDelete}
                            variant="danger"
                            className="px-5 py-1"
                        >
                            Excluir
                        </Button>
                    )}
                    {!initialData && (
                        <Button
                            onClick={() =>
                                setMode((prev) =>
                                    prev === "endereco" ? "letter" : "endereco"
                                )
                            }
                            variant="outline"
                            className="px-3 py-1"
                        >
                            {mode === "endereco" ? "Definir Letra" : "Definir Endereço"}
                        </Button>
                    )}
                    <Button
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
                                    enderecos: gavetaNiveis.flatMap((g) => {
                                        if (g.isDivisoria) {
                                            return [
                                                {
                                                    rua, coluna, nivel: g.nivel,
                                                    divisoria: 'D1',
                                                    enderecoCode: `${almo}${rua}${coluna}N${g.nivel}D1`,
                                                    produto: g.d1?.produto || "",
                                                    descricao: g.d1?.descricao || "",
                                                    observacao: g.d1?.observacao || ""
                                                },
                                                {
                                                    rua, coluna, nivel: g.nivel,
                                                    divisoria: 'D2',
                                                    enderecoCode: `${almo}${rua}${coluna}N${g.nivel}D2`,
                                                    produto: g.d2?.produto || "",
                                                    descricao: g.d2?.descricao || "",
                                                    observacao: g.d2?.observacao || ""
                                                }
                                            ];
                                        }
                                        return [{
                                            rua, coluna, nivel: g.nivel,
                                            enderecoCode: `${almo}${rua}${coluna}N${g.nivel}`,
                                            produto: g.produto || "",
                                            descricao: g.descricao || "",
                                            observacao: g.observacao || ""
                                        }];
                                    }),
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
                        className="px-6 py-2 text-sm"
                    >
                        Salvar
                    </Button>
                </div>
            </ModalWrapper>
        </>
    );
}