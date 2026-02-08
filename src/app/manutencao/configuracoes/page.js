"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ModalWrapper from "../../components/ui/ModalWrapper";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function ConfiguracoesPage() {
    const [activeTab, setActiveTab] = useState("motivos");
    const [loading, setLoading] = useState(true);

    // Estados para dados
    const [motivosPausa, setMotivosPausa] = useState([]);
    const [pcsData, setPcsData] = useState([]);

    // Estados para modais
    const [modalAberto, setModalAberto] = useState(false);
    const [tipoModal, setTipoModal] = useState(""); // motivo, problema, causa, solucao
    const [editando, setEditando] = useState(null);
    const [form, setForm] = useState({ codigo: "", descricao: "" });

    const fetchMotivosPausa = async () => {
        try {
            const response = await fetch("/api/manutencao/motivos-pausa");
            if (response.ok) {
                const data = await response.json();
                setMotivosPausa(data);
            }
        } catch (error) {
            console.error("Erro ao buscar motivos:", error);
        }
    };

    const fetchPCS = async (tipo = null) => {
        try {
            const url = tipo ? `/api/manutencao/pcs?tipo=${tipo}` : "/api/manutencao/pcs";
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setPcsData(data);
            }
        } catch (error) {
            console.error("Erro ao buscar PCS:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        document.title = "Configurações - Manutenção";
        fetchMotivosPausa();
        fetchPCS();
    }, []);

    const handleSalvar = async () => {
        if (!form.codigo || !form.descricao) {
            alert("Preencha todos os campos");
            return;
        }

        try {
            let url, body;
            const method = editando ? "PUT" : "POST";

            if (tipoModal === "motivo") {
                url = "/api/manutencao/motivos-pausa";
                body = editando ? { id: editando.id, ...form } : form;
            } else {
                url = "/api/manutencao/pcs";
                body = editando
                    ? { id: editando.id, tipo: tipoModal, ...form }
                    : { tipo: tipoModal, ...form };
            }

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                setModalAberto(false);
                setEditando(null);
                setForm({ codigo: "", descricao: "" });
                fetchMotivosPausa();
                fetchPCS();
            } else {
                const error = await response.json();
                alert(error.error || "Erro ao salvar");
            }
        } catch (error) {
            console.error("Erro ao salvar:", error);
        }
    };

    const handleNovo = (tipo) => {
        setTipoModal(tipo);
        setEditando(null);
        setForm({ codigo: "", descricao: "" });
        setModalAberto(true);
    };

    const handleEditar = (item, tipo) => {
        setTipoModal(tipo);
        setEditando(item);
        setForm({ codigo: item.codigo, descricao: item.descricao });
        setModalAberto(true);
    };

    const handleToggleAtivo = async (item, tipo) => {
        try {
            let url;
            if (tipo === "motivo") {
                url = "/api/manutencao/motivos-pausa";
            } else {
                url = "/api/manutencao/pcs";
            }

            await fetch(url, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: item.id,
                    tipo: tipo !== "motivo" ? tipo : undefined,
                    ativo: !item.ativo
                })
            });

            fetchMotivosPausa();
            fetchPCS();
        } catch (error) {
            console.error("Erro ao atualizar:", error);
        }
    };

    const getModalTitle = () => {
        const titles = {
            motivo: "Motivo de Pausa",
            problema: "Problema",
            causa: "Causa",
            solucao: "Solução"
        };
        return `${editando ? "Editar" : "Novo"} ${titles[tipoModal]}`;
    };

    const ListaItens = ({ items, tipo, titulo, icone }) => (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gray-50 border-b px-4 py-3 flex items-center justify-between">
                <h3 className="font-bold text-gray-700 flex items-center">
                    <span className="mr-2">{icone}</span>
                    {titulo}
                </h3>
                <Button
                    variant="outline"
                    className="px-3 py-1 text-sm"
                    onClick={() => handleNovo(tipo)}
                >
                    + Adicionar
                </Button>
            </div>
            <div className="divide-y max-h-[300px] overflow-auto">
                {items.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                        Nenhum item cadastrado
                    </div>
                ) : (
                    items.map((item) => (
                        <div
                            key={item.id}
                            className={`flex items-center justify-between p-3 hover:bg-gray-50 ${!item.ativo ? "opacity-50 bg-gray-100" : ""
                                }`}
                        >
                            <div>
                                <span className="font-mono text-sm text-primary3 mr-2">{item.codigo}</span>
                                <span>{item.descricao}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handleEditar(item, tipo)}
                                    className="text-primary3 hover:underline text-sm"
                                >
                                    Editar
                                </button>
                                <button
                                    onClick={() => handleToggleAtivo(item, tipo)}
                                    className={`text-sm ${item.ativo ? "text-red-500" : "text-green-500"} hover:underline`}
                                >
                                    {item.ativo ? "Desativar" : "Ativar"}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    return (
        <div className="bg-gray-100 h-screen overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-primary2 h-[36px] flex items-center justify-between px-4">
                <div className="flex items-center space-x-4">
                    <Link href="/manutencao">
                        <img src="/imagens/logo.png" className="w-[35px] bg-white p-1 rounded cursor-pointer hover:opacity-90" />
                    </Link>
                    <h1 className="text-white font-bold">Configurações de Manutenção</h1>
                </div>
                <Link href="/manutencao" className="text-white text-sm hover:underline">
                    ← Voltar
                </Link>
            </div>

            {/* Tabs */}
            <div className="bg-white border-b flex">
                <button
                    onClick={() => setActiveTab("motivos")}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === "motivos"
                            ? "border-primary3 text-primary3"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Motivos de Pausa
                </button>
                <button
                    onClick={() => setActiveTab("pcs")}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === "pcs"
                            ? "border-primary3 text-primary3"
                            : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Problema / Causa / Solução
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary3"></div>
                    </div>
                ) : activeTab === "motivos" ? (
                    <div className="max-w-2xl">
                        <div className="mb-4">
                            <h2 className="text-lg font-bold text-gray-800">Motivos de Pausa</h2>
                            <p className="text-gray-500 text-sm">
                                Configure os motivos de pausa disponíveis para os técnicos durante a execução das OS.
                            </p>
                        </div>
                        <ListaItens
                            items={motivosPausa}
                            tipo="motivo"
                            titulo="Motivos Cadastrados"
                            icone="⏸️"
                        />

                        {/* Sugestões */}
                        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <p className="text-sm text-blue-800 font-medium mb-2">💡 Sugestões de motivos:</p>
                            <div className="flex flex-wrap gap-2">
                                {["Aguardando Peça", "Aguardando Janela", "Aguardando Terceiro", "Segurança", "Ferramenta", "Outro"]
                                    .filter(m => !motivosPausa.some(mp => mp.descricao === m))
                                    .map((sugestao, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                setTipoModal("motivo");
                                                setEditando(null);
                                                setForm({ codigo: `MP${String(motivosPausa.length + 1).padStart(2, '0')}`, descricao: sugestao });
                                                setModalAberto(true);
                                            }}
                                            className="px-3 py-1 bg-white border border-blue-300 rounded-full text-sm text-blue-700 hover:bg-blue-100"
                                        >
                                            + {sugestao}
                                        </button>
                                    ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <ListaItens
                            items={pcsData.filter(p => p.tipo === "problema")}
                            tipo="problema"
                            titulo="Problemas"
                            icone="❌"
                        />
                        <ListaItens
                            items={pcsData.filter(p => p.tipo === "causa")}
                            tipo="causa"
                            titulo="Causas"
                            icone="🔍"
                        />
                        <ListaItens
                            items={pcsData.filter(p => p.tipo === "solucao")}
                            tipo="solucao"
                            titulo="Soluções"
                            icone="✅"
                        />
                    </div>
                )}
            </div>

            {/* Modal */}
            <ModalWrapper
                isOpen={modalAberto}
                onClose={() => setModalAberto(false)}
                title={getModalTitle()}
                className="w-[400px]"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Código *
                        </label>
                        <Input
                            value={form.codigo}
                            onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                            placeholder="Ex: 001"
                            className="w-full"
                            disabled={editando}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descrição *
                        </label>
                        <Input
                            value={form.descricao}
                            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                            placeholder="Descrição do item"
                            className="w-full"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button variant="ghost" onClick={() => setModalAberto(false)}>
                            Cancelar
                        </Button>
                        <Button variant="primary" onClick={handleSalvar}>
                            {editando ? "Salvar" : "Cadastrar"}
                        </Button>
                    </div>
                </div>
            </ModalWrapper>
        </div>
    );
}
