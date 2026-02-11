"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SolicitacoesMobileContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tecnicoId = searchParams.get("tecnicoId");

    const [solicitacoes, setSolicitacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editingQtd, setEditingQtd] = useState(1);

    useEffect(() => {
        document.title = "Minhas Solicitações";
        if (tecnicoId) {
            fetchSolicitacoes();
        }
    }, [tecnicoId]);

    const fetchSolicitacoes = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/almoxarifado/solicitacoes?tecnicoId=${tecnicoId}&status=pendente,parcial,atendida`);
            if (res.ok) {
                const data = await res.json();
                setSolicitacoes(data);
            }
        } catch (error) {
            console.error("Erro:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleEditar = async (id) => {
        try {
            const res = await fetch("/api/almoxarifado/solicitacoes", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, acao: "editar", quantidade: editingQtd }),
            });
            if (res.ok) {
                setEditingId(null);
                fetchSolicitacoes();
            } else {
                alert("Erro ao editar solicitação.");
            }
        } catch (error) {
            console.error("Erro:", error);
        }
    };

    const handleExcluir = async (id) => {
        if (!confirm("Deseja excluir esta solicitação?")) return;
        try {
            const res = await fetch(`/api/almoxarifado/solicitacoes?id=${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchSolicitacoes();
            }
        } catch (error) {
            console.error("Erro:", error);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "pendente":
                return { bg: "bg-yellow-100 text-yellow-800", label: "Pendente" };
            case "parcial":
                return { bg: "bg-blue-100 text-blue-800", label: "Parcial" };
            case "atendida":
                return { bg: "bg-green-100 text-green-800", label: "Atendida" };
            default:
                return { bg: "bg-gray-100 text-gray-800", label: status };
        }
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("pt-BR") + " " + d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-primary3 p-4 text-white">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.back()}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 active:bg-white/30 transition-colors"
                    >
                        <span className="text-xl font-bold">←</span>
                    </button>
                    <div>
                        <div className="text-lg font-bold">Minhas Solicitações</div>
                        <div className="text-sm opacity-80">Solicitações ao Almoxarifado</div>
                    </div>
                </div>
            </div>

            {/* Conteúdo */}
            <div className="p-4 pb-24 space-y-3">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="text-2xl mb-2">⏳</div>
                        <div className="text-gray-500">Carregando...</div>
                    </div>
                ) : solicitacoes.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-4xl mb-3">📦</div>
                        <div className="text-gray-500">Nenhuma solicitação encontrada</div>
                    </div>
                ) : (
                    solicitacoes.map((sol) => {
                        const badge = getStatusBadge(sol.status);
                        const isEditing = editingId === sol.id;

                        return (
                            <div
                                key={sol.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                            >
                                <div className="p-4">
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="font-bold text-gray-800">
                                                {sol.produto?.descricao}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Cód: {sol.produto?.codigo}
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded text-xs font-bold ${badge.bg}`}>
                                            {badge.label}
                                        </span>
                                    </div>

                                    {/* Quantidades */}
                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <div className="bg-gray-50 rounded-lg p-2 border">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase">Solicitado</div>
                                            {isEditing ? (
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={editingQtd}
                                                    onChange={(e) => setEditingQtd(parseInt(e.target.value) || 1)}
                                                    className="w-full border rounded px-2 py-1 text-lg font-bold text-center mt-1"
                                                    autoFocus
                                                />
                                            ) : (
                                                <div className="text-lg font-bold text-gray-800">{sol.quantidade}</div>
                                            )}
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-2 border">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase">Atendido</div>
                                            <div className="text-lg font-bold text-green-600">{sol.quantidadeAtendida}</div>
                                        </div>
                                    </div>

                                    {/* Info OS */}
                                    {sol.bemDescricao && (
                                        <div className="bg-gray-50 rounded-lg p-2 border mb-3">
                                            <div className="text-[10px] font-bold text-gray-400 uppercase">Equipamento</div>
                                            <div className="text-sm text-gray-700 font-medium">{sol.bemDescricao}</div>
                                            {sol.bemLocalizacao && (
                                                <div className="text-xs text-gray-500">{sol.bemLocalizacao}</div>
                                            )}
                                        </div>
                                    )}

                                    {/* Data */}
                                    <div className="text-xs text-gray-400 mb-3">
                                        {formatDate(sol.criadoEm)}
                                    </div>

                                    {/* Ações - só para pendentes */}
                                    {sol.status === "pendente" && (
                                        <div className="flex gap-2">
                                            {isEditing ? (
                                                <>
                                                    <button
                                                        onClick={() => handleEditar(sol.id)}
                                                        className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-medium"
                                                    >
                                                        ✅ Salvar
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium"
                                                    >
                                                        Cancelar
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => {
                                                            setEditingId(sol.id);
                                                            setEditingQtd(sol.quantidade);
                                                        }}
                                                        className="flex-1 bg-blue-100 text-blue-700 py-2 rounded-lg text-sm font-bold"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleExcluir(sol.id)}
                                                        className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg text-sm font-bold"
                                                    >
                                                        Excluir
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Botão Refresh */}
            <div className="fixed bottom-4 right-4">
                <button
                    onClick={fetchSolicitacoes}
                    className="w-14 h-14 bg-primary3 text-white rounded-full shadow-lg flex items-center justify-center text-2xl active:scale-95 transition-transform"
                >
                    🔄
                </button>
            </div>
        </div>
    );
}

export default function SolicitacoesMobilePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-100"><div className="text-2xl">⏳</div></div>}>
            <SolicitacoesMobileContent />
        </Suspense>
    );
}
