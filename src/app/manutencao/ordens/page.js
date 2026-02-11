"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ModalWrapper from "../../components/ui/ModalWrapper";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Textarea from "../../components/ui/Textarea";

export default function OrdensPage() {
    const [ordens, setOrdens] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [bens, setBens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroStatus, setFiltroStatus] = useState("todas");
    const [modalNovaOS, setModalNovaOS] = useState(false);
    const [modalDetalhes, setModalDetalhes] = useState(false);
    const [modalAtribuir, setModalAtribuir] = useState(false);
    const [osDetalhes, setOsDetalhes] = useState(null);
    const [searchBem, setSearchBem] = useState("");
    const [novaOS, setNovaOS] = useState({
        bemId: "",
        centroCusto: "",
        estacao: "",
        tipoManutencao: "Avaliação",
        prioridade: "normal",
        observacaoAbertura: "",
        solicitante: ""
    });

    const fetchOrdens = async () => {
        try {
            let url = "/api/manutencao/ordens";
            if (filtroStatus !== "todas") {
                url += `?status=${filtroStatus}`;
            }
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                setOrdens(data);
            }
        } catch (error) {
            console.error("Erro ao buscar ordens:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTecnicos = async () => {
        try {
            const response = await fetch("/api/manutencao/tecnicos?ativo=true");
            if (response.ok) {
                const data = await response.json();
                setTecnicos(data);
            }
        } catch (error) {
            console.error("Erro ao buscar técnicos:", error);
        }
    };

    const fetchBens = async (search = "") => {
        try {
            const response = await fetch(`/api/manutencao/bens?search=${search}`);
            if (response.ok) {
                const data = await response.json();
                setBens(data);
            }
        } catch (error) {
            console.error("Erro ao buscar bens:", error);
        }
    };

    useEffect(() => {
        document.title = "Ordens de Serviço";
        fetchTecnicos();
        fetchBens();

        // Verificar se deve abrir modal de nova OS
        const params = new URLSearchParams(window.location.search);
        if (params.get("nova") === "true") {
            const username = localStorage.getItem("username") || "Sistema";
            setNovaOS(prev => ({ ...prev, solicitante: username }));
            setModalNovaOS(true);
        }
    }, []);

    // Buscar ordens quando filtro muda + auto-refresh a cada 30s
    useEffect(() => {
        fetchOrdens();
        const interval = setInterval(fetchOrdens, 30000);
        return () => clearInterval(interval);
    }, [filtroStatus]);

    const handleCriarOS = async () => {
        if (!novaOS.bemId || !novaOS.centroCusto || !novaOS.tipoManutencao || !novaOS.solicitante) {
            alert("Preencha todos os campos obrigatórios");
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
                setNovaOS({
                    bemId: "",
                    centroCusto: "",
                    estacao: "",
                    tipoManutencao: "Avaliação",
                    prioridade: "normal",
                    observacaoAbertura: "",
                    solicitante: localStorage.getItem("username") || "Sistema"
                });
                fetchOrdens();
            } else {
                const error = await response.json();
                alert(error.error || "Erro ao criar ordem");
            }
        } catch (error) {
            console.error("Erro ao criar OS:", error);
            alert("Erro ao criar ordem de serviço");
        }
    };

    const handleAtribuir = async (ordemId, tecnicoId) => {
        try {
            const response = await fetch("/api/manutencao/ordens", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: ordemId, tecnicoId, acao: "atribuir" })
            });

            if (response.ok) {
                setModalAtribuir(false);
                fetchOrdens();
            }
        } catch (error) {
            console.error("Erro ao atribuir:", error);
        }
    };

    const handleAcaoOS = async (id, acao, dados = {}) => {
        try {
            const response = await fetch("/api/manutencao/ordens", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, acao, ...dados })
            });

            if (response.ok) {
                fetchOrdens();
                if (modalDetalhes) {
                    const ordem = await response.json();
                    setOsDetalhes(ordem);
                }
            }
        } catch (error) {
            console.error("Erro na ação:", error);
        }
    };

    const handleSelecionarBem = (bem) => {
        setNovaOS(prev => ({
            ...prev,
            bemId: bem.id,
            centroCusto: bem.centroCusto,
            estacao: bem.estacao || ""
        }));
        setSearchBem(bem.descricao);
    };

    const getStatusBadge = (status) => {
        const badges = {
            aberta: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Aberta" },
            em_analise: { bg: "bg-blue-100", text: "text-blue-800", label: "Em Análise" },
            em_fila: { bg: "bg-indigo-100", text: "text-indigo-800", label: "Na Fila" },
            em_execucao: { bg: "bg-green-100", text: "text-green-800", label: "Em Execução" },
            pausada: { bg: "bg-orange-100", text: "text-orange-800", label: "Pausada" },
            concluida_tecnica: { bg: "bg-purple-100", text: "text-purple-800", label: "Concluída" },
            encerrada: { bg: "bg-gray-100", text: "text-gray-800", label: "Encerrada" },
            cancelada: { bg: "bg-red-100", text: "text-red-800", label: "Cancelada" }
        };
        const badge = badges[status] || badges.aberta;
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    const getPrioridadeBadge = (prioridade) => {
        const badges = {
            baixa: { bg: "bg-gray-100", text: "text-gray-600", label: "Baixa" },
            normal: { bg: "bg-blue-100", text: "text-blue-600", label: "Normal" },
            alta: { bg: "bg-orange-100", text: "text-orange-600", label: "Alta" },
            urgente: { bg: "bg-red-100", text: "text-red-600", label: "Urgente" }
        };
        const badge = badges[prioridade] || badges.normal;
        return (
            <span className={`px-2 py-1 rounded text-xs font-bold ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    const formatDate = (date) => {
        if (!date) return "-";
        return new Date(date).toLocaleString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <div className="bg-gray-100 h-screen overflow-hidden flex flex-col">
            {/* Header simplificado */}
            <div className="bg-primary2 h-[36px] flex items-center justify-between px-4">
                <div className="flex items-center space-x-4">
                    <Link href="/manutencao">
                        <img src="/imagens/stamS.png" className="w-[35px] bg-white p-1 rounded cursor-pointer hover:opacity-90" />
                    </Link>
                    <h1 className="text-white font-bold">Ordens de Serviço</h1>
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
                            const username = localStorage.getItem("username") || "Sistema";
                            setNovaOS(prev => ({ ...prev, solicitante: username }));
                            setModalNovaOS(true);
                        }}
                    >
                        + Nova OS
                    </Button>

                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Filtrar:</span>
                        <select
                            value={filtroStatus}
                            onChange={(e) => setFiltroStatus(e.target.value)}
                            className="border rounded px-2 py-1 text-sm"
                        >
                            <option value="todas">Todas</option>
                            <option value="aberta">Abertas</option>
                            <option value="em_fila">Na Fila</option>
                            <option value="em_execucao">Em Execução</option>
                            <option value="pausada">Pausadas</option>
                            <option value="concluida_tecnica">Concluídas</option>
                            <option value="encerrada">Encerradas</option>
                        </select>
                    </div>
                </div>

                <div className="text-sm text-gray-500">
                    {ordens.length} ordem(ns) encontrada(s)
                </div>
            </div>

            {/* Lista de Ordens */}
            <div className="flex-1 overflow-auto p-4">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary3"></div>
                    </div>
                ) : ordens.length === 0 ? (
                    <div className="text-center text-gray-500 mt-20">
                        <p className="text-4xl mb-4">📋</p>
                        <p>Nenhuma ordem de serviço encontrada</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Nº</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Bem/Máquina</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">C.C.</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Tipo</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Prioridade</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Técnico</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Abertura</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ordens.map((ordem) => (
                                    <tr key={ordem.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 font-bold text-primary3">OS{String(ordem.numero).padStart(6, '0')}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{ordem.bem?.descricao}</div>
                                            <div className="text-xs text-gray-500">{ordem.bem?.codigo}</div>
                                        </td>
                                        <td className="px-4 py-3">{ordem.centroCusto}</td>
                                        <td className="px-4 py-3">{ordem.tipoManutencao}</td>
                                        <td className="px-4 py-3">{getPrioridadeBadge(ordem.prioridade)}</td>
                                        <td className="px-4 py-3">{getStatusBadge(ordem.status)}</td>
                                        <td className="px-4 py-3">
                                            {ordem.tecnico?.nome || (
                                                <span className="text-gray-400">Não atribuído</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm">{formatDate(ordem.dataAbertura)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setOsDetalhes(ordem);
                                                        setModalDetalhes(true);
                                                    }}
                                                    className="text-primary3 hover:underline text-sm"
                                                >
                                                    Ver
                                                </button>
                                                {ordem.status === "aberta" && !ordem.tecnicoId && (
                                                    <button
                                                        onClick={() => {
                                                            setOsDetalhes(ordem);
                                                            setModalAtribuir(true);
                                                        }}
                                                        className="text-green-600 hover:underline text-sm"
                                                    >
                                                        Atribuir
                                                    </button>
                                                )}
                                                {ordem.status === "concluida_tecnica" && (
                                                    <button
                                                        onClick={() => handleAcaoOS(ordem.id, "encerrar", { encerradoPor: localStorage.getItem("username") })}
                                                        className="text-purple-600 hover:underline text-sm"
                                                    >
                                                        Encerrar
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Nova OS */}
            <ModalWrapper
                isOpen={modalNovaOS}
                onClose={() => setModalNovaOS(false)}
                title="Nova Ordem de Serviço"
                className="w-[500px]"
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Bem/Máquina *
                        </label>
                        <Input
                            value={searchBem}
                            onChange={(e) => {
                                setSearchBem(e.target.value);
                                fetchBens(e.target.value);
                            }}
                            placeholder="Pesquisar por código ou descrição..."
                            className="w-full"
                        />
                        {searchBem && bens.length > 0 && !novaOS.bemId && (
                            <div className="absolute z-10 w-full bg-white border rounded-lg shadow-lg max-h-48 overflow-auto mt-1">
                                {bens.map((bem) => (
                                    <div
                                        key={bem.id}
                                        onClick={() => handleSelecionarBem(bem)}
                                        className="p-2 hover:bg-gray-100 cursor-pointer"
                                    >
                                        <div className="font-medium">{bem.descricao}</div>
                                        <div className="text-xs text-gray-500">{bem.codigo} - {bem.centroCusto}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Centro de Custo *
                            </label>
                            <Input
                                value={novaOS.centroCusto}
                                onChange={(e) => setNovaOS({ ...novaOS, centroCusto: e.target.value })}
                                placeholder="Ex: 314111"
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Estação de Trabalho
                            </label>
                            <Input
                                value={novaOS.estacao}
                                onChange={(e) => setNovaOS({ ...novaOS, estacao: e.target.value })}
                                placeholder="Ex: Linha 1"
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tipo de Manutenção *
                            </label>
                            <select
                                value={novaOS.tipoManutencao}
                                onChange={(e) => setNovaOS({ ...novaOS, tipoManutencao: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                            >
                                <option value="Avaliação">Avaliação</option>
                                <option value="Elétrica">Elétrica</option>
                                <option value="Mecânica">Mecânica</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Prioridade
                            </label>
                            <select
                                value={novaOS.prioridade}
                                onChange={(e) => setNovaOS({ ...novaOS, prioridade: e.target.value })}
                                className="w-full border rounded px-3 py-2"
                            >
                                <option value="baixa">Baixa</option>
                                <option value="normal">Normal</option>
                                <option value="alta">Alta</option>
                                <option value="urgente">Urgente</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Solicitante *
                        </label>
                        <Input
                            value={novaOS.solicitante}
                            onChange={(e) => setNovaOS({ ...novaOS, solicitante: e.target.value })}
                            placeholder="Nome do solicitante"
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Observação
                        </label>
                        <Textarea
                            value={novaOS.observacaoAbertura}
                            onChange={(e) => setNovaOS({ ...novaOS, observacaoAbertura: e.target.value })}
                            placeholder="Descreva o problema observado..."
                            className="h-24"
                        />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button variant="ghost" onClick={() => setModalNovaOS(false)}>
                            Cancelar
                        </Button>
                        <Button variant="primary" onClick={handleCriarOS}>
                            Criar OS
                        </Button>
                    </div>
                </div>
            </ModalWrapper>

            {/* Modal Atribuir Técnico */}
            <ModalWrapper
                isOpen={modalAtribuir}
                onClose={() => setModalAtribuir(false)}
                title={`Atribuir Técnico - OS${osDetalhes?.numero ? String(osDetalhes.numero).padStart(6, '0') : ''}`}
                className="w-[400px]"
            >
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        Selecione o técnico para atribuir a esta ordem de serviço:
                    </p>

                    <div className="space-y-2">
                        {tecnicos.filter(t => t.ativo).map((tecnico) => (
                            <div
                                key={tecnico.id}
                                onClick={() => handleAtribuir(osDetalhes?.id, tecnico.id)}
                                className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                            >
                                <div>
                                    <div className="font-medium">{tecnico.nome}</div>
                                    <div className="text-xs text-gray-500">{tecnico.matricula} - {tecnico.especialidade}</div>
                                </div>
                                <div className="text-xs text-gray-400">
                                    {tecnico._count?.ordensServico || 0} OS ativas
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </ModalWrapper>

            {/* Modal Detalhes */}
            <ModalWrapper
                isOpen={modalDetalhes}
                onClose={() => setModalDetalhes(false)}
                title={`Ordem de Serviço OS${osDetalhes?.numero ? String(osDetalhes.numero).padStart(6, '0') : ''}`}
                className="w-[600px] max-h-[80vh] overflow-auto"
            >
                {osDetalhes && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Status</p>
                                <p>{getStatusBadge(osDetalhes.status)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Prioridade</p>
                                <p>{getPrioridadeBadge(osDetalhes.prioridade)}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Bem/Máquina</p>
                                <p className="font-medium">{osDetalhes.bem?.descricao}</p>
                                <p className="text-xs text-gray-500">{osDetalhes.bem?.codigo}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Centro de Custo</p>
                                <p>{osDetalhes.centroCusto}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Tipo Manutenção</p>
                                <p>{osDetalhes.tipoManutencao}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Solicitante</p>
                                <p>{osDetalhes.solicitante}</p>
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Técnico Responsável</p>
                            <p>{osDetalhes.tecnico?.nome || "Não atribuído"}</p>
                        </div>

                        {osDetalhes.observacaoAbertura && (
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Observação</p>
                                <p className="bg-gray-50 p-2 rounded text-sm">{osDetalhes.observacaoAbertura}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Abertura</p>
                                <p>{formatDate(osDetalhes.dataAbertura)}</p>
                            </div>
                            {osDetalhes.dataInicio && (
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Início</p>
                                    <p>{formatDate(osDetalhes.dataInicio)}</p>
                                </div>
                            )}
                            {osDetalhes.dataFim && (
                                <div>
                                    <p className="text-xs text-gray-500 uppercase font-bold">Fim</p>
                                    <p>{formatDate(osDetalhes.dataFim)}</p>
                                </div>
                            )}
                        </div>

                        {osDetalhes.problema && (
                            <div className="border-t pt-4">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-2">Diagnóstico (PCS)</p>
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                    <div className="bg-red-50 p-2 rounded">
                                        <p className="text-xs font-bold text-red-700">Problema</p>
                                        <p>{osDetalhes.problema?.descricao}</p>
                                    </div>
                                    <div className="bg-yellow-50 p-2 rounded">
                                        <p className="text-xs font-bold text-yellow-700">Causa</p>
                                        <p>{osDetalhes.causa?.descricao}</p>
                                    </div>
                                    <div className="bg-green-50 p-2 rounded">
                                        <p className="text-xs font-bold text-green-700">Solução</p>
                                        <p>{osDetalhes.solucao?.descricao}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {osDetalhes.pausas?.length > 0 && (
                            <div className="border-t pt-4">
                                <p className="text-xs text-gray-500 uppercase font-bold mb-2">Pausas</p>
                                <div className="space-y-2">
                                    {osDetalhes.pausas.map((pausa) => (
                                        <div key={pausa.id} className="bg-orange-50 p-2 rounded text-sm">
                                            <p className="font-medium">{pausa.motivoPausa?.descricao}</p>
                                            <p className="text-xs text-gray-500">
                                                {formatDate(pausa.dataInicio)} - {pausa.dataFim ? formatDate(pausa.dataFim) : "Em andamento"}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </ModalWrapper>
        </div>
    );
}
