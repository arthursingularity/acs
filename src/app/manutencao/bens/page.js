"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ModalWrapper from "../../components/ui/ModalWrapper";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import DataTable from "../../components/ui/DataTable";
import NavBar from "@/app/components/ui/NavBar";
import NavBarButton from "@/app/components/ui/NavBarButton";

export default function BensPage() {
    const [bens, setBens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalAberto, setModalAberto] = useState(false);
    const [modalHistorico, setModalHistorico] = useState(false);
    const [editando, setEditando] = useState(null);
    const [bemSelecionado, setBemSelecionado] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [historico, setHistorico] = useState([]);
    const [modalFiltro, setModalFiltro] = useState(false);
    const [filtroStatus, setFiltroStatus] = useState("todos");
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

    // Fechar dropdown de filtro ao clicar fora
    const filtroDropdownRef = useRef(null);
    useEffect(() => {
        if (!modalFiltro) return;
        const handleClickOutside = (e) => {
            if (filtroDropdownRef.current && !filtroDropdownRef.current.contains(e.target)) {
                setModalFiltro(false);
            }
        };
        const timer = setTimeout(() => {
            document.addEventListener("mousedown", handleClickOutside);
        }, 0);
        return () => {
            clearTimeout(timer);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [modalFiltro]);

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

    const handleEditar = () => {
        if (!bemSelecionado) {
            alert("Selecione um equipamento para alterar");
            return;
        }
        setEditando(bemSelecionado);
        setForm({
            codigo: bemSelecionado.codigo,
            descricao: bemSelecionado.descricao,
            centroCusto: bemSelecionado.centroCusto,
            estacao: bemSelecionado.estacao || "",
            localizacao: bemSelecionado.localizacao || "",
            qrCode: bemSelecionado.qrCode || "",
            status: bemSelecionado.status
        });
        setModalAberto(true);
    };

    const handleIncluir = () => {
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
    };

    const handleVerHistorico = () => {
        if (!bemSelecionado) {
            alert("Selecione um equipamento para ver o histórico");
            return;
        }
        fetchHistorico(bemSelecionado.id);
        setModalHistorico(true);
    };

    const handleDeletar = async () => {
        if (!bemSelecionado) {
            alert("Selecione um equipamento para excluir");
            return;
        }
        if (!confirm("Deseja realmente excluir este bem? Esta ação não pode ser desfeita.")) return;

        try {
            const response = await fetch(`/api/manutencao/bens?id=${bemSelecionado.id}`, {
                method: "DELETE"
            });

            if (response.ok) {
                setBemSelecionado(null);
                fetchBens();
            } else {
                alert("Não é possível excluir um bem com ordens de serviço associadas");
            }
        } catch (error) {
            console.error("Erro ao deletar:", error);
        }
    };

    const handleSelectBem = (bem) => {
        if (bemSelecionado?.id === bem.id) {
            setBemSelecionado(null);
        } else {
            setBemSelecionado(bem);
        }
    };

    const handleFiltro = () => {
        setModalFiltro(prev => !prev);
    };

    const getStatusBadge = (status) => {
        const badges = {
            operacional: { color: "bg-green-500", text: "text-green-600", label: "Operacional" },
            em_manutencao: { color: "bg-yellow-500", text: "text-yellow-600", label: "Em Manutenção" },
            inativo: { color: "bg-gray-500", text: "text-gray-600", label: "Inativo" }
        };
        const badge = badges[status] || badges.operacional;
        return (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    const getStatusDot = (status) => {
        const colors = {
            operacional: "bg-green-500",
            em_manutencao: "bg-yellow-500",
            inativo: "bg-gray-400"
        };
        return colors[status] || colors.operacional;
    };

    const formatDate = (date) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("pt-BR");
    };

    // Filtrar dados
    const dadosFiltrados = filtroStatus === "todos"
        ? bens
        : bens.filter(b => b.status === filtroStatus);

    return (
        <div className="bg-gray-100 h-screen overflow-hidden flex flex-col">
            <NavBar titulo="Equipamentos / Bens" />

            {/* Barra de Ferramentas - estilo ERP */}
            <div className="bg-white h-[24px] font-bold tracking-wide flex items-center justify-between text-[11px] border-b border-gray-300 mt-[101px]">
                <div className="flex items-center">
                    <NavBarButton onClick={handleIncluir}>Incluir</NavBarButton>
                    <NavBarButton onClick={handleEditar}>Alterar</NavBarButton>
                    <NavBarButton onClick={handleDeletar}>Excluir</NavBarButton>
                    <NavBarButton onClick={handleVerHistorico}>Histórico</NavBarButton>
                    <NavBarButton onClick={handleFiltro} hasDropdown>Filtro</NavBarButton>
                    <NavBarButton onClick={() => window.location.reload()}>Atualizar</NavBarButton>

                    {/* Separador */}
                    <div className="w-[1px] h-[16px] bg-gray-300 mx-2"></div>

                    {/* Campo de pesquisa inline - estilo ERP */}
                    <div className="flex items-center">
                        <span className="text-[11px] text-gray-500 font-bold mr-1">Pesquisar:</span>
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
                            placeholder="CÓDIGO OU DESCRIÇÃO..."
                            className="border border-gray-300 rounded h-[18px] px-2 text-[11px] w-[220px] outline-none focus:border-primary3 uppercase"
                        />
                    </div>
                </div>

                <div className="flex items-center pr-3">
                    <span className="text-[11px] text-gray-500 font-medium">{dadosFiltrados.length} registro(s)</span>
                </div>
            </div>

            {/* Dropdown de Filtro - estilo ERP */}
            {modalFiltro && (
                <div
                    ref={filtroDropdownRef}
                    className="fixed z-[999] bg-white border border-gray-400 shadow-lg"
                    style={{ top: '126px', left: '280px', minWidth: '180px', maxWidth: '180px' }}
                >
                    <div className="bg-blackGradient px-3 py-1 text-[11px] font-bold text-white border-b border-gray-300">
                        STATUS DO EQUIPAMENTO
                    </div>
                    {[
                        { value: "todos", label: "Todos" },
                        { value: "operacional", label: "Operacional" },
                        { value: "em_manutencao", label: "Em Manutenção" },
                        { value: "inativo", label: "Inativo" }
                    ].map(option => (
                        <button
                            key={option.value}
                            onClick={() => {
                                setFiltroStatus(option.value);
                                setModalFiltro(false);
                            }}
                            className={`w-full text-left cursor-pointer font-bold px-3 py-[5px] text-[12px] border-b border-gray-100 transition-colors ${filtroStatus === option.value
                                ? 'bg-primarySoft'
                                : 'hover:bg-primarySoft'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Tabela de Dados - estilo ERP */}
            <div className="tabelaNova flex-1 overflow-hidden mt-[3px]">
                <DataTable
                    loading={loading}
                    emptyIcon="🏭"
                    emptyMessage="Nenhum equipamento/bem cadastrado"
                    data={dadosFiltrados}
                    selectedId={bemSelecionado?.id}
                    onSelect={handleSelectBem}
                    onDoubleClick={(bem) => {
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
                    }}
                    columns={[
                        {
                            key: "status",
                            label: "",
                            width: "w-6",
                            sortable: false,
                            render: (val) => (
                                <span className={`w-[14px] h-[14px] rounded-full border block ${getStatusDot(val)}`} title={val}></span>
                            )
                        },
                        {
                            key: "codigo",
                            label: "Código",
                            render: (val) => <span className="font-mono font-bold text-primary3">{val}</span>
                        },
                        { key: "descricao", label: "Descrição" },
                        { key: "centroCusto", label: "C.Custo" },
                        { key: "localizacao", label: "Localização" },
                        {
                            key: "status",
                            label: "Status",
                            render: (val) => getStatusBadge(val)
                        },
                        {
                            key: "createdAt",
                            label: "Cadastro",
                            render: (val) => formatDate(val)
                        }
                    ]}
                />
            </div>

            {/* Modal Cadastro/Edição - estilo ERP */}
            <ModalWrapper
                isOpen={modalAberto}
                onClose={() => { setModalAberto(false); setEditando(null); }}
                title={editando ? "Alterar Equipamento/Bem" : "Incluir Equipamento/Bem"}
                className="w-[520px]"
            >
                <div className="space-y-3">
                    {/* Linha 1: Código + QR Code */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-600 mb-0.5">
                                Código *
                            </label>
                            <Input
                                value={form.codigo}
                                onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                                placeholder="EX: MAQ-001"
                                className="w-full h-[28px] text-[12px]"
                                disabled={editando}
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold text-gray-600 mb-0.5">
                                Descrição *
                            </label>
                            <Input
                                value={form.descricao}
                                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                                placeholder="NOME/DESCRIÇÃO DO EQUIPAMENTO"
                                className="w-full h-[28px] text-[12px]"
                            />
                        </div>
                    </div>

                    {/* Linha 3: Centro de Custo + Estação */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[11px] font-bold text-gray-600 mb-0.5">
                                Centro de Custo *
                            </label>
                            <Input
                                value={form.centroCusto}
                                onChange={(e) => setForm({ ...form, centroCusto: e.target.value })}
                                placeholder="EX: 314111"
                                className="w-full h-[28px] text-[12px]"
                            />
                        </div>
                        {/* Linha 5: Status */}
                        <div>
                            <label className="block text-[11px] font-bold text-gray-600 mb-0.5">
                                Status
                            </label>
                            <select
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                                className="w-full border border-gray-300 rounded h-[28px] px-2 text-[12px] outline-none focus:border-primary3 bg-white uppercase"
                            >
                                <option value="operacional">OPERACIONAL</option>
                                <option value="em_manutencao">EM MANUTENÇÃO</option>
                                <option value="inativo">INATIVO</option>
                            </select>
                        </div>
                    </div>
                    {/* Botões de ação - estilo ERP */}
                    <div className="flex justify-between space-x-2 pt-3 border-t border-gray-200">
                        <button
                            onClick={() => { setModalAberto(false); setEditando(null); }}
                            className="border-2 border-gray-400 h-[28px] rounded text-gray-600 px-4 font-bold text-[11px] hover:bg-gray-100 cursor-pointer transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSalvar}
                            className="border-2 border-primary3 h-[28px] rounded bg-primary3 text-white px-4 font-bold text-[11px] hover:brightness-110 cursor-pointer transition-all"
                        >
                            {editando ? "Salvar" : "Cadastrar"}
                        </button>
                    </div>
                </div>
            </ModalWrapper>

            {/* Modal Histórico - estilo ERP */}
            <ModalWrapper
                isOpen={modalHistorico}
                onClose={() => setModalHistorico(false)}
                title={`Histórico - ${bemSelecionado?.descricao}`}
                className="w-[700px] max-h-[80vh]"
            >
                <div className="space-y-2 max-h-[60vh] overflow-auto">
                    {historico.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            <p className="text-4xl mb-2">📋</p>
                            <p className="text-[12px]">Nenhuma ordem de serviço para este equipamento</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {historico.map((ordem) => (
                                <div
                                    key={ordem.id}
                                    className="border border-gray-300 rounded p-3 hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <span className="font-mono font-bold text-primary3 text-[12px]">OS{String(ordem.numero).padStart(6, '0')}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ordem.status === "encerrada" ? "bg-gray-100 text-gray-600" :
                                                ordem.status === "concluida_tecnica" ? "bg-purple-100 text-purple-600" :
                                                    ordem.status === "em_execucao" ? "bg-green-100 text-green-600" :
                                                        "bg-yellow-100 text-yellow-600"
                                                }`}>
                                                {ordem.status?.toUpperCase().replace("_", " ")}
                                            </span>
                                        </div>
                                        <span className="text-[11px] text-gray-500 font-medium">{formatDate(ordem.dataAbertura)}</span>
                                    </div>

                                    <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-gray-600">
                                        <div>
                                            <span className="font-bold">Tipo:</span> {ordem.tipoManutencao}
                                        </div>
                                        <div>
                                            <span className="font-bold">Técnico:</span> {ordem.tecnico?.nome || "-"}
                                        </div>
                                    </div>

                                    {ordem.problema && (
                                        <div className="mt-2 grid grid-cols-3 gap-2 text-[10px]">
                                            <div className="bg-red-50 p-2 rounded border border-red-200">
                                                <span className="font-bold text-red-700">P:</span> {ordem.problema?.descricao}
                                            </div>
                                            <div className="bg-yellow-50 p-2 rounded border border-yellow-200">
                                                <span className="font-bold text-yellow-700">C:</span> {ordem.causa?.descricao}
                                            </div>
                                            <div className="bg-green-50 p-2 rounded border border-green-200">
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
