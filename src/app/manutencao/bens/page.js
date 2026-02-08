"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ModalWrapper from "../../components/ui/ModalWrapper";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";

export default function BensPage() {
    const [bens, setBens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalAberto, setModalAberto] = useState(false);
    const [modalHistorico, setModalHistorico] = useState(false);
    const [editando, setEditando] = useState(null);
    const [bemSelecionado, setBemSelecionado] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [historico, setHistorico] = useState([]);
    const [form, setForm] = useState({
        codigo: "",
        descricao: "",
        centroCusto: "",
        estacao: "",
        localizacao: "",
        qrCode: "",
        status: "operacional"
    });

    const fetchBens = async () => {
        try {
            const response = await fetch(`/api/manutencao/bens?search=${searchTerm}`);
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

    const fetchHistorico = async (bemId) => {
        try {
            const response = await fetch(`/api/manutencao/ordens?bemId=${bemId}`);
            if (response.ok) {
                const data = await response.json();
                setHistorico(data);
            }
        } catch (error) {
            console.error("Erro ao buscar histórico:", error);
        }
    };

    useEffect(() => {
        document.title = "Bens/Máquinas - Manutenção";
        fetchBens();
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            fetchBens();
        }, 300);
        return () => clearTimeout(timeout);
    }, [searchTerm]);

    const handleSalvar = async () => {
        if (!form.codigo || !form.descricao || !form.centroCusto) {
            alert("Preencha todos os campos obrigatórios");
            return;
        }

        try {
            const url = "/api/manutencao/bens";
            const method = editando ? "PUT" : "POST";
            const body = editando ? { id: editando.id, ...form } : form;

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (response.ok) {
                setModalAberto(false);
                setEditando(null);
                setForm({
                    codigo: "",
                    descricao: "",
                    centroCusto: "",
                    estacao: "",
                    localizacao: "",
                    qrCode: "",
                    status: "operacional"
                });
                fetchBens();
            } else {
                const error = await response.json();
                alert(error.error || "Erro ao salvar");
            }
        } catch (error) {
            console.error("Erro ao salvar:", error);
            alert("Erro ao salvar bem");
        }
    };

    const handleEditar = (bem) => {
        setEditando(bem);
        setForm({
            codigo: bem.codigo,
            descricao: bem.descricao,
            centroCusto: bem.centroCusto,
            estacao: bem.estacao || "",
            localizacao: bem.localizacao || "",
            qrCode: bem.qrCode || "",
            status: bem.status
        });
        setModalAberto(true);
    };

    const handleVerHistorico = (bem) => {
        setBemSelecionado(bem);
        fetchHistorico(bem.id);
        setModalHistorico(true);
    };

    const handleDeletar = async (id) => {
        if (!confirm("Deseja realmente excluir este bem? Esta ação não pode ser desfeita.")) return;

        try {
            const response = await fetch(`/api/manutencao/bens?id=${id}`, {
                method: "DELETE"
            });

            if (response.ok) {
                fetchBens();
            } else {
                alert("Não é possível excluir um bem com ordens de serviço associadas");
            }
        } catch (error) {
            console.error("Erro ao deletar:", error);
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            operacional: { bg: "bg-green-100", text: "text-green-800", label: "Operacional" },
            em_manutencao: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Em Manutenção" },
            inativo: { bg: "bg-gray-100", text: "text-gray-800", label: "Inativo" }
        };
        const badge = badges[status] || badges.operacional;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    const formatDate = (date) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("pt-BR");
    };

    return (
        <div className="bg-gray-100 h-screen overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-primary2 h-[36px] flex items-center justify-between px-4">
                <div className="flex items-center space-x-4">
                    <Link href="/manutencao">
                        <img src="/imagens/logo.png" className="w-[35px] bg-white p-1 rounded cursor-pointer hover:opacity-90" />
                    </Link>
                    <h1 className="text-white font-bold">Bens / Máquinas</h1>
                </div>
                <Link href="/manutencao" className="text-white text-sm hover:underline">
                    ← Voltar
                </Link>
            </div>

            {/* Toolbar */}
            <div className="bg-white border-b p-3 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button
                        variant="primary"
                        className="px-4 py-2"
                        onClick={() => {
                            setEditando(null);
                            setForm({
                                codigo: "",
                                descricao: "",
                                centroCusto: "",
                                estacao: "",
                                localizacao: "",
                                qrCode: "",
                                status: "operacional"
                            });
                            setModalAberto(true);
                        }}
                    >
                        + Novo Bem
                    </Button>

                    <div className="relative">
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Pesquisar código ou descrição..."
                            className="w-64"
                        />
                    </div>
                </div>
                <div className="text-sm text-gray-500">
                    {bens.length} bem(ns) encontrado(s)
                </div>
            </div>

            {/* Lista */}
            <div className="flex-1 overflow-auto p-4">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary3"></div>
                    </div>
                ) : bens.length === 0 ? (
                    <div className="text-center text-gray-500 mt-20">
                        <p className="text-4xl mb-4">🏭</p>
                        <p>Nenhum bem cadastrado</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Código</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Descrição</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">C.C.</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Estação</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Localização</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bens.map((bem) => (
                                    <tr key={bem.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 font-mono font-bold text-primary3">{bem.codigo}</td>
                                        <td className="px-4 py-3">{bem.descricao}</td>
                                        <td className="px-4 py-3">{bem.centroCusto}</td>
                                        <td className="px-4 py-3">{bem.estacao || "-"}</td>
                                        <td className="px-4 py-3">{bem.localizacao || "-"}</td>
                                        <td className="px-4 py-3">{getStatusBadge(bem.status)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button
                                                    onClick={() => handleVerHistorico(bem)}
                                                    className="text-blue-600 hover:underline text-sm"
                                                >
                                                    Histórico
                                                </button>
                                                <button
                                                    onClick={() => handleEditar(bem)}
                                                    className="text-primary3 hover:underline text-sm"
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => handleDeletar(bem.id)}
                                                    className="text-red-500 hover:underline text-sm"
                                                >
                                                    Excluir
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Cadastro/Edição */}
            <ModalWrapper
                isOpen={modalAberto}
                onClose={() => setModalAberto(false)}
                title={editando ? "Editar Bem" : "Novo Bem"}
                className="w-[500px]"
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Código *
                            </label>
                            <Input
                                value={form.codigo}
                                onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                                placeholder="Ex: MAQ-001"
                                className="w-full"
                                disabled={editando}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                QR Code
                            </label>
                            <Input
                                value={form.qrCode}
                                onChange={(e) => setForm({ ...form, qrCode: e.target.value })}
                                placeholder="Código para QR"
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descrição *
                        </label>
                        <Input
                            value={form.descricao}
                            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                            placeholder="Nome/descrição do equipamento"
                            className="w-full"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Centro de Custo *
                            </label>
                            <Input
                                value={form.centroCusto}
                                onChange={(e) => setForm({ ...form, centroCusto: e.target.value })}
                                placeholder="Ex: 314111"
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Estação de Trabalho
                            </label>
                            <Input
                                value={form.estacao}
                                onChange={(e) => setForm({ ...form, estacao: e.target.value })}
                                placeholder="Ex: Linha 1"
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Localização
                        </label>
                        <Input
                            value={form.localizacao}
                            onChange={(e) => setForm({ ...form, localizacao: e.target.value })}
                            placeholder="Localização física do equipamento"
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <select
                            value={form.status}
                            onChange={(e) => setForm({ ...form, status: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="operacional">Operacional</option>
                            <option value="em_manutencao">Em Manutenção</option>
                            <option value="inativo">Inativo</option>
                        </select>
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

            {/* Modal Histórico */}
            <ModalWrapper
                isOpen={modalHistorico}
                onClose={() => setModalHistorico(false)}
                title={`Histórico - ${bemSelecionado?.descricao}`}
                className="w-[700px] max-h-[80vh]"
            >
                <div className="space-y-4 max-h-[60vh] overflow-auto">
                    {historico.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            <p className="text-4xl mb-2">📋</p>
                            <p>Nenhuma ordem de serviço para este bem</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {historico.map((ordem) => (
                                <div
                                    key={ordem.id}
                                    className="border rounded-lg p-4 hover:bg-gray-50"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <span className="font-bold text-primary3">OS{String(ordem.numero).padStart(6, '0')}</span>
                                            <span className={`px-2 py-1 rounded-full text-xs ${ordem.status === "encerrada" ? "bg-gray-100 text-gray-600" :
                                                ordem.status === "concluida_tecnica" ? "bg-purple-100 text-purple-600" :
                                                    ordem.status === "em_execucao" ? "bg-green-100 text-green-600" :
                                                        "bg-yellow-100 text-yellow-600"
                                                }`}>
                                                {ordem.status}
                                            </span>
                                        </div>
                                        <span className="text-sm text-gray-500">{formatDate(ordem.dataAbertura)}</span>
                                    </div>

                                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600">
                                        <div>
                                            <span className="font-medium">Tipo:</span> {ordem.tipoManutencao}
                                        </div>
                                        <div>
                                            <span className="font-medium">Técnico:</span> {ordem.tecnico?.nome || "-"}
                                        </div>
                                    </div>

                                    {ordem.problema && (
                                        <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                                            <div className="bg-red-50 p-2 rounded">
                                                <span className="font-bold text-red-700">P:</span> {ordem.problema?.descricao}
                                            </div>
                                            <div className="bg-yellow-50 p-2 rounded">
                                                <span className="font-bold text-yellow-700">C:</span> {ordem.causa?.descricao}
                                            </div>
                                            <div className="bg-green-50 p-2 rounded">
                                                <span className="font-bold text-green-700">S:</span> {ordem.solucao?.descricao}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </ModalWrapper>
        </div>
    );
}
