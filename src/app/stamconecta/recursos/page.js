"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { CameraIcon, ArrowLeftIcon, PlusIcon } from "@heroicons/react/24/outline";
import Button from "@/app/components/ui/Button";

export default function RecursosPage() {
    const router = useRouter();
    const [bens, setBens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [setor, setSetor] = useState("");
    const [setorCodigo, setSetorCodigo] = useState("");
    const [userName, setUserName] = useState("");

    // Modal Nova OS
    const [modalNovaOS, setModalNovaOS] = useState(false);
    const [novaOS, setNovaOS] = useState({
        bemId: "",
        centroCusto: "",
        tipoManutencao: "AVALIAÇÃO",
        prioridade: "NORMAL",
        observacaoAbertura: "",
        solicitante: ""
    });

    // QR Scanner
    const [modalQRScanner, setModalQRScanner] = useState(false);
    const [scannerError, setScannerError] = useState("");
    const scannerRef = useRef(null);
    const html5QrCodeRef = useRef(null);

    useEffect(() => {
        document.title = "Recursos - Stam Conecta";
        const storedSetor = localStorage.getItem("setorDescricao") || "";
        const storedSetorCodigo = localStorage.getItem("setorCodigo") || "";
        const storedName = localStorage.getItem("nome") || localStorage.getItem("username") || "USUÁRIO";

        setSetor(storedSetor.toUpperCase());
        setSetorCodigo(storedSetorCodigo);
        setUserName(storedName.toUpperCase());

        if (storedSetorCodigo) {
            fetchBens(storedSetorCodigo);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchBens = async (centroCusto) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/manutencao/bens?centroCusto=${centroCusto}`);
            if (response.ok) {
                const data = await response.json();
                setBens(data);
            }
        } catch (error) {
            console.error("Erro ao buscar bens:", error);
        } finally {
            setLoading(false);
        }
    };

    // Effect para gerenciar o scanner QR
    useEffect(() => {
        if (modalQRScanner && scannerRef.current) {
            const startScanner = async () => {
                try {
                    const { Html5Qrcode } = await import("html5-qrcode");
                    const html5QrCode = new Html5Qrcode("qr-reader-recursos");
                    html5QrCodeRef.current = html5QrCode;

                    await html5QrCode.start(
                        { facingMode: "environment" },
                        {
                            fps: 10,
                            qrbox: { width: 250, height: 250 }
                        },
                        (decodedText) => {
                            handleQRCodeScanned(decodedText);
                        },
                        (errorMessage) => { }
                    );
                } catch (err) {
                    console.error("Erro ao iniciar scanner:", err);
                    setScannerError("Erro ao acessar a câmera. Verifique as permissões.");
                }
            };

            startScanner();
        }

        return () => {
            if (html5QrCodeRef.current) {
                html5QrCodeRef.current.stop().catch(err => console.log("Scanner já parado"));
                html5QrCodeRef.current = null;
            }
        };
    }, [modalQRScanner]);

    const handleQRCodeScanned = (codigo) => {
        const bemEncontrado = bens.find(
            b => b.codigo.toUpperCase() === codigo.toUpperCase() ||
                b.qrCode?.toUpperCase() === codigo.toUpperCase()
        );

        if (bemEncontrado) {
            setNovaOS(prev => ({
                ...prev,
                bemId: bemEncontrado.id,
                centroCusto: bemEncontrado.centroCusto
            }));
            setScannerError("");
        } else {
            setScannerError(`Equipamento "${codigo}" não encontrado no sistema.`);
        }

        setModalQRScanner(false);
    };

    const openQRScanner = () => {
        setScannerError("");
        setModalQRScanner(true);
    };

    const closeQRScanner = () => {
        setModalQRScanner(false);
    };

    const handleOpenNovaOS = () => {
        setNovaOS({
            bemId: "",
            centroCusto: setorCodigo,
            tipoManutencao: "AVALIAÇÃO",
            prioridade: "NORMAL",
            observacaoAbertura: "",
            solicitante: userName
        });
        setScannerError("");
        setModalNovaOS(true);
    };

    const handleCriarOS = async () => {
        if (!novaOS.bemId) {
            alert("Selecione um equipamento");
            return;
        }

        try {
            const response = await fetch("/api/manutencao/ordens", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(novaOS)
            });

            if (response.ok) {
                setModalNovaOS(false);
                alert("Ordem de Serviço criada com sucesso!");
                setNovaOS({
                    bemId: "",
                    centroCusto: setorCodigo,
                    tipoManutencao: "AVALIAÇÃO",
                    prioridade: "NORMAL",
                    observacaoAbertura: "",
                    solicitante: userName
                });
            } else {
                const error = await response.json();
                alert(error.error || "Erro ao criar ordem");
            }
        } catch (error) {
            console.error("Erro ao criar OS:", error);
            alert("Erro ao criar ordem de serviço");
        }
    };

    const handleSelectBem = (bem) => {
        setNovaOS(prev => ({
            ...prev,
            bemId: bem.id,
            centroCusto: bem.centroCusto
        }));
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Header */}
            <div className="bg-stamOrange text-white px-4 py-3 flex items-center gap-4 shadow-lg">
                <button
                    onClick={() => router.push("/stamconecta")}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <div className="flex-1">
                    <h1 className="font-bold text-lg">RECURSOS</h1>
                    <p className="text-sm opacity-80">{setor || "Selecione um setor"}</p>
                </div>
                <button
                    onClick={handleOpenNovaOS}
                    className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    Incluir
                </button>
            </div>

            {/* Conteúdo */}
            <div className="flex-1 p-4">
                {!setorCodigo ? (
                    <div className="bg-white rounded-lg p-8 text-center shadow">
                        <p className="text-gray-500 mb-4">Nenhum setor selecionado</p>
                        <button
                            onClick={() => router.push("/stamconecta")}
                            className="bg-stamOrange text-white px-6 py-2 rounded-lg font-bold"
                        >
                            Selecionar Setor
                        </button>
                    </div>
                ) : loading ? (
                    <div className="bg-white rounded-lg p-8 text-center shadow">
                        <p className="text-gray-500">Carregando equipamentos...</p>
                    </div>
                ) : bens.length === 0 ? (
                    <div className="bg-white rounded-lg p-8 text-center shadow">
                        <p className="text-gray-500">Nenhum equipamento encontrado neste setor</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-800 text-white">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-bold">Código</th>
                                    <th className="px-4 py-3 text-left text-sm font-bold">Descrição</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {bens.map((bem) => (
                                    <tr
                                        key={bem.id}
                                        className="hover:bg-gray-50 cursor-pointer"
                                        onClick={() => {
                                            handleOpenNovaOS();
                                            setTimeout(() => handleSelectBem(bem), 100);
                                        }}
                                    >
                                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                            {bem.codigo}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">
                                            {bem.descricao}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Nova OS */}
            {modalNovaOS && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
                        {/* Header */}
                        <div className="bg-blackGradient text-white px-4 py-3 rounded-t-xl flex justify-between items-center">
                            <h3 className="font-bold text-lg">Nova Ordem de Serviço</h3>
                            <button
                                onClick={() => setModalNovaOS(false)}
                                className="text-white text-2xl hover:opacity-80"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Conteúdo */}
                        <div className="p-4 space-y-4">
                            {/* Equipamento */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Equipamento/Bem *
                                </label>
                                <div className="flex gap-2">
                                    <select
                                        value={novaOS.bemId}
                                        onChange={(e) => {
                                            const bemSelecionado = bens.find(b => b.id === e.target.value);
                                            if (bemSelecionado) {
                                                setNovaOS(prev => ({
                                                    ...prev,
                                                    bemId: bemSelecionado.id,
                                                    centroCusto: bemSelecionado.centroCusto
                                                }));
                                            } else {
                                                setNovaOS(prev => ({
                                                    ...prev,
                                                    bemId: "",
                                                    centroCusto: setorCodigo
                                                }));
                                            }
                                        }}
                                        className="flex-1 border rounded px-3 py-2"
                                    >
                                        <option value="">Selecione um equipamento...</option>
                                        {bens.map((bem) => (
                                            <option key={bem.id} value={bem.id}>
                                                {bem.codigo}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={openQRScanner}
                                        className="px-3 py-2 bg-primary3 text-white rounded hover:bg-orange-600 transition-colors flex items-center justify-center"
                                        title="Escanear QR Code"
                                    >
                                        <CameraIcon className="h-5 w-5" />
                                    </button>
                                </div>
                                {scannerError && (
                                    <p className="text-red-500 text-sm mt-1">{scannerError}</p>
                                )}
                            </div>

                            {/* Descrição do equipamento selecionado */}
                            {novaOS.bemId && (
                                <div className="p-2 bg-gray-100 rounded border">
                                    <p className="text-xs text-gray-500 uppercase font-bold">Descrição do Equipamento</p>
                                    <p className="text-sm font-medium">
                                        {bens.find(b => b.id === novaOS.bemId)?.descricao || '-'}
                                    </p>
                                </div>
                            )}

                            {/* Tipo de Solicitação */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipo de Solicitação *
                                </label>
                                <select
                                    value={novaOS.tipoManutencao}
                                    onChange={(e) => setNovaOS({ ...novaOS, tipoManutencao: e.target.value })}
                                    className="w-full border rounded px-3 py-2"
                                >
                                    <option value="AVALIAÇÃO">AVALIAÇÃO</option>
                                    <option value="MANUTENÇÃO ELÉTRICA">MANUTENÇÃO ELÉTRICA</option>
                                    <option value="MANUTENÇÃO MECÂNICA">MANUTENÇÃO MECÂNICA</option>
                                </select>
                            </div>

                            {/* Observação */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Observação
                                </label>
                                <textarea
                                    value={novaOS.observacaoAbertura}
                                    onChange={(e) => setNovaOS({ ...novaOS, observacaoAbertura: e.target.value })}
                                    placeholder="Descreva o problema observado..."
                                    rows={3}
                                    className="w-full border rounded px-3 py-2 resize-none"
                                />
                            </div>

                            {/* Botões */}
                            <div className="flex justify-between pt-2">
                                <Button variant="outline" className="px-3 py-1" onClick={() => setModalNovaOS(false)}>
                                    Cancelar
                                </Button>
                                <Button variant="primary" className="px-3 py-1" onClick={handleCriarOS}>
                                    Criar OS
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal QR Scanner */}
            {modalQRScanner && (
                <div className="fixed inset-0 bg-black/80 z-[9999] flex flex-col">
                    <div className="p-4 flex justify-between items-center">
                        <h3 className="text-white text-lg font-bold">Escanear QR Code</h3>
                        <button
                            onClick={closeQRScanner}
                            className="text-white text-2xl"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="flex-1 flex items-center justify-center p-4">
                        <div
                            id="qr-reader-recursos"
                            ref={scannerRef}
                            className="w-full max-w-md bg-black rounded-lg overflow-hidden"
                        />
                    </div>
                    <div className="p-4 text-center">
                        <p className="text-white/80 text-sm">
                            Aponte a câmera para o QR Code do equipamento
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
