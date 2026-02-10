"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import NavBar from "../components/ui/NavBar";
import ModalWrapper from "../components/ui/ModalWrapper";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Textarea from "../components/ui/Textarea";
import DataTable from "../components/ui/DataTable";
import { CameraIcon } from "@heroicons/react/24/outline";

export default function ManutencaoPage() {
    const router = useRouter();

    // Estados para ordens de serviço
    const [ordens, setOrdens] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [bens, setBens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroStatus, setFiltroStatus] = useState("todas");
    const [filtroTipo, setFiltroTipo] = useState("todas");
    const [modalFiltro, setModalFiltro] = useState(false);
    const [modalNovaOS, setModalNovaOS] = useState(false);
    const [modalDetalhes, setModalDetalhes] = useState(false);
    const [modalAtribuir, setModalAtribuir] = useState(false);
    const [osDetalhes, setOsDetalhes] = useState(null);
    const [osSelecionada, setOsSelecionada] = useState(null);
    const [searchBem, setSearchBem] = useState("");
    const [searchBemDetalhes, setSearchBemDetalhes] = useState("");
    const [editandoOS, setEditandoOS] = useState(false);
    const [dadosEdicao, setDadosEdicao] = useState({
        bemId: "",
        prioridade: "",
        tipoManutencao: "",
        tipoManutencaoCategoria: "",
        tecnicoId: ""
    });
    const [novaOS, setNovaOS] = useState({
        bemId: "",
        centroCusto: "",
        tipoManutencao: "AVALIAÇÃO",
        tipoManutencaoCategoria: "CORRETIVA",
        prioridade: "NORMAL",
        observacaoAbertura: "",
        solicitante: ""
    });
    const [modalQRScanner, setModalQRScanner] = useState(false);
    const [scannerError, setScannerError] = useState("");
    const scannerRef = useRef(null);
    const html5QrCodeRef = useRef(null);

    const [atribuirPrioridade, setAtribuirPrioridade] = useState("NORMAL");
    const [atribuirTecnicoId, setAtribuirTecnicoId] = useState("");

    const fetchOrdens = async () => {
        try {
            let url = "/api/manutencao/ordens";
            const params = [];
            if (filtroStatus !== "todas") {
                params.push(`status=${filtroStatus}`);
            }
            if (filtroTipo !== "todas") {
                params.push(`tipo=${filtroTipo}`);
            }
            if (params.length > 0) {
                url += `?${params.join('&')}`;
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
        document.title = "Gerenciamento O.S.";
        fetchOrdens();
        fetchTecnicos();
        fetchBens();

        const interval = setInterval(fetchOrdens, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        fetchOrdens();
    }, [filtroStatus, filtroTipo]);

    // Effect para gerenciar o scanner QR
    useEffect(() => {
        if (modalQRScanner && scannerRef.current) {
            const startScanner = async () => {
                try {
                    const { Html5Qrcode } = await import("html5-qrcode");
                    const html5QrCode = new Html5Qrcode("qr-reader");
                    html5QrCodeRef.current = html5QrCode;

                    await html5QrCode.start(
                        { facingMode: "environment" },
                        {
                            fps: 10,
                            qrbox: { width: 250, height: 250 }
                        },
                        (decodedText) => {
                            // QR Code lido com sucesso
                            handleQRCodeScanned(decodedText);
                        },
                        (errorMessage) => {
                            // Erro de leitura (normal, continua tentando)
                        }
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
        // Buscar bem pelo código ou qrCode
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

        // Fechar o modal do scanner
        setModalQRScanner(false);
    };

    const openQRScanner = () => {
        setScannerError("");
        setModalQRScanner(true);
    };

    const closeQRScanner = () => {
        setModalQRScanner(false);
    };

    // Handlers para NavBar
    const handleIncluirOS = () => {
        const username = localStorage.getItem("username") || "Sistema";
        setNovaOS(prev => ({ ...prev, solicitante: username }));
        setSearchBem("");
        setModalNovaOS(true);
    };

    const handleAlterarOS = () => {
        if (osSelecionada) {
            setOsDetalhes(osSelecionada);
            setModalDetalhes(true);
        } else {
            alert("Selecione uma OS para alterar");
        }
    };

    const handleWebMobile = () => {
        router.push("/manutencao/mobile");
    };

    const handleFiltro = () => {
        setModalFiltro(true);
    };

    const handleAtribuirOS = () => {
        if (osSelecionada) {
            if (osSelecionada.status === "aberta" && !osSelecionada.tecnicoId) {
                setOsDetalhes(osSelecionada);
                setAtribuirPrioridade(osSelecionada.prioridade || "NORMAL");
                setAtribuirTecnicoId("");
                setModalAtribuir(true);
            } else if (osSelecionada.tecnicoId) {
                alert("Esta OS já possui um técnico atribuído");
            } else {
                alert("Apenas SSs/OSs abertas podem ser atribuídas");
            }
        } else {
            alert("Selecione uma SS/OS para atribuir");
        }
    };

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
                    tipoManutencaoCategoria: "CORRETIVA",
                    prioridade: "normal",
                    observacaoAbertura: "",
                    solicitante: localStorage.getItem("username") || "Sistema"
                });
                setSearchBem("");
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

    const handleAtribuir = async (ordemId, tecnicoId, prioridade) => {
        try {
            const response = await fetch("/api/manutencao/ordens", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: ordemId, tecnicoId, prioridade, acao: "atribuir" })
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

    const handleSelecionarBemDetalhes = (bem) => {
        setDadosEdicao(prev => ({
            ...prev,
            bemId: bem.id
        }));
        setSearchBemDetalhes(bem.descricao);
        // Atualiza centro de custo visualmente (será salvo ao confirmar)
        setOsDetalhes(prev => ({
            ...prev,
            centroCusto: bem.centroCusto
        }));
    };

    const calcularTempoTotal = (os) => {
        if (!os.dataInicio) return "-";

        let fim = os.dataFim ? new Date(os.dataFim) : new Date();
        const inicio = new Date(os.dataInicio);

        // Se estiver pausada atualmente, o tempo para de contar no início da pausa
        if (os.status === 'pausada') {
            const pausaAtiva = os.pausas?.find(p => !p.dataFim);
            if (pausaAtiva) {
                fim = new Date(pausaAtiva.dataInicio);
            }
        }

        let totalPausas = 0;
        if (os.pausas) {
            os.pausas.forEach(p => {
                if (p.dataFim) {
                    totalPausas += new Date(p.dataFim) - new Date(p.dataInicio);
                }
            });
        }

        let diff = Math.floor((fim - inicio - totalPausas) / 1000);
        if (diff < 0) diff = 0;

        const horas = Math.floor(diff / 3600);
        const minutos = Math.floor((diff % 3600) / 60);
        const segundos = diff % 60;

        return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
    };

    const iniciarEdicaoOS = () => {
        if (osDetalhes) {
            setDadosEdicao({
                bemId: osDetalhes.bemId || "",
                prioridade: osDetalhes.prioridade || "normal",
                tipoManutencao: osDetalhes.tipoManutencao || "AVALIAÇÃO",
                tipoManutencaoCategoria: osDetalhes.tipoManutencaoCategoria || "CORRETIVA",
                tecnicoId: osDetalhes.tecnicoId || ""
            });
            setSearchBemDetalhes(osDetalhes.bem?.descricao || "");
            setEditandoOS(true);
        }
    };

    const cancelarEdicaoOS = () => {
        setEditandoOS(false);
        setDadosEdicao({
            bemId: "",
            prioridade: "",
            tipoManutencao: "",
            tipoManutencaoCategoria: "",
            tecnicoId: ""
        });
        setSearchBemDetalhes("");
    };

    const salvarEdicaoOS = async () => {
        if (!osDetalhes?.id) return;

        try {
            const updateData = {
                id: osDetalhes.id,
                acao: "editar"
            };

            // Só envia campos que foram alterados
            if (dadosEdicao.bemId && dadosEdicao.bemId !== osDetalhes.bemId) {
                updateData.bemId = dadosEdicao.bemId;
                // Buscar dados do novo bem para atualizar centro de custo
                const bemSelecionado = bens.find(b => b.id === dadosEdicao.bemId);
                if (bemSelecionado) {
                    updateData.centroCusto = bemSelecionado.centroCusto;
                    updateData.estacao = bemSelecionado.estacao || "";
                }
            }
            if (dadosEdicao.prioridade && dadosEdicao.prioridade !== osDetalhes.prioridade) {
                updateData.prioridade = dadosEdicao.prioridade;
            }
            if (dadosEdicao.tipoManutencao && dadosEdicao.tipoManutencao !== osDetalhes.tipoManutencao) {
                updateData.tipoManutencao = dadosEdicao.tipoManutencao;
            }
            if (dadosEdicao.tipoManutencaoCategoria && dadosEdicao.tipoManutencaoCategoria !== osDetalhes.tipoManutencaoCategoria) {
                updateData.tipoManutencaoCategoria = dadosEdicao.tipoManutencaoCategoria;
            }
            if (dadosEdicao.tecnicoId !== osDetalhes.tecnicoId) {
                updateData.tecnicoId = dadosEdicao.tecnicoId || null;
                // Se estiver atribuindo técnico e OS está aberta, muda status para em_fila
                if (dadosEdicao.tecnicoId && osDetalhes.status === "aberta") {
                    updateData.status = "em_fila";
                    updateData.dataAtribuicao = new Date().toISOString();
                }
            }

            const response = await fetch("/api/manutencao/ordens", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updateData)
            });

            if (response.ok) {
                const ordemAtualizada = await response.json();
                setOsDetalhes(ordemAtualizada);
                setEditandoOS(false);
                fetchOrdens();
            } else {
                const error = await response.json();
                alert(error.error || "Erro ao salvar alterações");
            }
        } catch (error) {
            console.error("Erro ao salvar edição:", error);
            alert("Erro ao salvar alterações");
        }
    };

    const excluirOS = async () => {
        if (!osDetalhes?.id) return;

        const confirmacao = window.confirm(
            `Tem certeza que deseja EXCLUIR a ${osDetalhes.tipo || 'OS'} ${osDetalhes.tipo || 'OS'}${String(osDetalhes.numero).padStart(6, '0')}?\n\nEsta ação não pode ser desfeita.`
        );

        if (!confirmacao) return;

        try {
            const response = await fetch(`/api/manutencao/ordens?id=${osDetalhes.id}`, {
                method: "DELETE"
            });

            if (response.ok) {
                setModalDetalhes(false);
                setOsDetalhes(null);
                fetchOrdens();
                alert("OS excluída com sucesso!");
            } else {
                const error = await response.json();
                alert(error.error || "Erro ao excluir OS");
            }
        } catch (error) {
            console.error("Erro ao excluir OS:", error);
            alert("Erro ao excluir OS");
        }
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

    const getStatusColor = (status) => {
        const colors = {
            aberta: "bg-gray-400",
            em_analise: "bg-cyan-500",
            em_fila: "bg-indigo-500",
            em_execucao: "bg-blue-500",
            pausada: "bg-orange-500",
            concluida_tecnica: "bg-purple-500",
            encerrada: "bg-green-500",
            cancelada: "bg-red-500"
        };
        return colors[status] || colors.aberta;
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

    const handleSelectOS = (ordem) => {
        if (osSelecionada?.id === ordem.id) {
            setOsSelecionada(null);
        } else {
            setOsSelecionada(ordem);
        }
    };

    return (
        <div className="bg-gray-100 h-screen overflow-hidden flex flex-col">
            <NavBar
                almos=""
                setor=""
                centroCusto=""
                titulo="Gerenciamento O.S."
                manutencaoButtons={true}
                onIncluirOS={handleIncluirOS}
                onAlterarOS={handleAlterarOS}
                onWebMobile={handleWebMobile}
                onAtribuirOS={handleAtribuirOS}
                onFiltro={handleFiltro}
            />

            {/* Tabela de Ordens de Serviço */}
            <div className="tabelaNova flex-1 overflow-auto mt-[128px]">
                <DataTable
                    loading={loading}
                    emptyMessage="Nenhuma ordem de serviço encontrada"
                    selectedId={osSelecionada?.id}
                    onSelect={handleSelectOS}
                    onDoubleClick={(ordem) => {
                        setOsDetalhes(ordem);
                        setModalDetalhes(true);
                    }}
                    data={ordens}
                    columns={[
                        {
                            key: "status",
                            label: "",
                            width: "w-6",
                            render: (val) => (
                                <span className={`w-4 h-4 rounded-full border block ${getStatusColor(val)}`} title={val}></span>
                            )
                        },
                        {
                            key: "numero",
                            label: "Nº",
                            width: "w-6",
                            render: (val, row) => `${row?.tipo || 'OS'}${String(val).padStart(6, '0')}`
                        },
                        { key: "bem.codigo", label: "Equipamento/Bem" },
                        { key: "bem.descricao", label: "Descrição do Bem" },
                        { key: "bem.localizacao", label: "Localização" },
                        { key: "centroCusto", label: "C.C.", width: "w-14" },
                        { key: "tipoManutencao", label: "Tipo de Solicitação" },
                        {
                            key: "tipoManutencaoCategoria",
                            label: "Manutenção",
                            render: (val) => {
                                const color = val === 'PREVENTIVA' ? 'text-blue-600' : 'text-orange-600';
                                return <span className={`font-bold text-xs ${color}`}>{val || 'CORRETIVA'}</span>;
                            }
                        },
                        { key: "observacaoAbertura", label: "Observação" },
                        {
                            key: "prioridade",
                            label: "Prioridade",
                            render: (val) => {
                                const color = val === 'URGENTE' ? 'text-red-500' :
                                    val === 'ALTA' ? 'text-orange-400' :
                                        val === 'BAIXA' ? 'text-green-400' : 'text-black';
                                return <span className={`font-medium ${color}`}>{val}</span>;
                            }
                        },
                        {
                            key: "status",
                            label: "Status",
                            render: (val) => {
                                const labels = {
                                    aberta: "Aberta", em_fila: "Na Fila", em_execucao: "Em Execução",
                                    pausada: "Pausada", concluida_tecnica: "Concluída",
                                    encerrada: "Encerrada", cancelada: "Cancelada"
                                };
                                return labels[val] || val;
                            }
                        },
                        { key: "tecnico.nome", label: "Técnico Responsável" },
                        {
                            key: "dataAbertura",
                            label: "Abertura",
                            render: (val) => formatDate(val)
                        },
                        { key: "solicitante", label: "Solicitante" }
                    ]}
                />
            </div>

            {/* Modal de Filtro */}
            <ModalWrapper
                isOpen={modalFiltro}
                onClose={() => setModalFiltro(false)}
                title="Filtrar Ordens de Serviço"
                className="w-[400px]"
            >
                <div className="space-y-4">
                    {/* Filtro por Tipo (SS/OS) */}
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold mb-2">Tipo</p>
                        <div className="flex gap-2">
                            {[
                                { value: "todas", label: "Todas" },
                                { value: "SS", label: "SS - Solicitações" },
                                { value: "OS", label: "OS - Ordens" }
                            ].map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => setFiltroTipo(option.value)}
                                    className={`flex-1 text-center p-2 rounded-lg border transition-colors text-sm ${filtroTipo === option.value
                                        ? 'bg-primary3 text-white border-primary3'
                                        : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Filtro por Status */}
                    <div>
                        <p className="text-xs text-gray-500 uppercase font-bold mb-2">Status</p>
                        <div className="space-y-2">
                            {[
                                { value: "todas", label: "Todas" },
                                { value: "aberta", label: "Abertas" },
                                { value: "em_fila", label: "Na Fila" },
                                { value: "em_execucao", label: "Em Execução" },
                                { value: "pausada", label: "Pausadas" },
                                { value: "concluida_tecnica", label: "Concluídas" },
                                { value: "encerrada", label: "Encerradas" }
                            ].map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => {
                                        setFiltroStatus(option.value);
                                        setModalFiltro(false);
                                    }}
                                    className={`w-full text-left p-3 rounded-lg border transition-colors ${filtroStatus === option.value
                                        ? 'bg-primary3 text-white border-primary3'
                                        : 'bg-gray-50 hover:bg-gray-100 border-gray-200'
                                        }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </ModalWrapper>

            {/* Modal Nova OS */}
            <ModalWrapper
                isOpen={modalNovaOS}
                onClose={() => setModalNovaOS(false)}
                title="Nova Ordem de Serviço"
                className="w-[500px]"
            >
                <div className="space-y-2">
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
                                            centroCusto: ""
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
                                className="px-3 py-2 bg-primary3 text-white rounded hover:bg-primary4 transition-colors flex items-center justify-center"
                                title="Escanear QR Code"
                            >
                                <CameraIcon className="h-5 w-5" />
                            </button>
                        </div>
                        {scannerError && (
                            <p className="text-red-500 text-sm mt-1">{scannerError}</p>
                        )}
                        {novaOS.bemId && (
                            <div className="mt-2 p-2 bg-gray-100 rounded border">
                                <p className="text-xs text-gray-500 uppercase font-bold">Descrição do Equipamento</p>
                                <p className="text-sm font-medium">
                                    {bens.find(b => b.id === novaOS.bemId)?.descricao || '-'}
                                </p>
                            </div>
                        )}
                    </div>

                    {novaOS.bemId && (
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 bg-gray-100 rounded border">
                                <p className="text-xs text-gray-500 uppercase font-bold">Centro de Custo</p>
                                <p className="text-sm font-medium">
                                    {novaOS.centroCusto || '-'}
                                </p>
                            </div>
                            <div className="p-2 bg-gray-100 rounded border">
                                <p className="text-xs text-gray-500 uppercase font-bold">Localização</p>
                                <p className="text-sm font-medium">
                                    {bens.find(b => b.id === novaOS.bemId)?.localizacao || '-'}
                                </p>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo de Solicitação *
                        </label>
                        <select
                            value={novaOS.tipoManutencao}
                            onChange={(e) => setNovaOS({ ...novaOS, tipoManutencao: e.target.value })}
                            className="w-full border rounded px-2 py-2"
                        >
                            <option value="AVALIAÇÃO">AVALIAÇÃO</option>
                            <option value="MANUTENÇÃO ELÉTRICA">MANUTENÇÃO ELÉTRICA</option>
                            <option value="MANUTENÇÃO MECÂNICA">MANUTENÇÃO MECÂNICA</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo de Manutenção *
                        </label>
                        <select
                            value={novaOS.tipoManutencaoCategoria}
                            onChange={(e) => setNovaOS({ ...novaOS, tipoManutencaoCategoria: e.target.value })}
                            className="w-full border rounded px-2 py-2"
                        >
                            <option value="CORRETIVA">CORRETIVA</option>
                            <option value="PREVENTIVA">PREVENTIVA</option>
                        </select>
                    </div>

                    <div className="hidden">
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

                    <div className="flex justify-between">
                        <Button variant="outline" className="px-3 py-1" onClick={() => setModalNovaOS(false)}>
                            Cancelar
                        </Button>
                        <Button variant="primary" className="px-3 py-1" onClick={handleCriarOS}>
                            Criar OS
                        </Button>
                    </div>
                </div>
            </ModalWrapper>

            {/* Modal Atribuir Técnico */}
            <ModalWrapper
                isOpen={modalAtribuir}
                onClose={() => setModalAtribuir(false)}
                title={`Atribuir Técnico - ${osDetalhes?.tipo || 'OS'}${osDetalhes?.numero ? String(osDetalhes.numero).padStart(6, '0') : ''}`}
                className="w-[450px]"
            >
                <div className="space-y-4">
                    {osDetalhes?.tipo === 'SS' && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm text-blue-800 font-medium">
                                ⚠️ Ao atribuir um técnico, esta SS será convertida em OS automaticamente.
                            </p>
                        </div>
                    )}

                    {/* Prioridade */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Prioridade *
                        </label>
                        <select
                            value={atribuirPrioridade}
                            onChange={(e) => setAtribuirPrioridade(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="BAIXA">BAIXA</option>
                            <option value="NORMAL">NORMAL</option>
                            <option value="ALTA">ALTA</option>
                            <option value="URGENTE">URGENTE</option>
                        </select>
                    </div>

                    {/* Técnico */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Técnico Responsável *
                        </label>
                        <select
                            value={atribuirTecnicoId}
                            onChange={(e) => setAtribuirTecnicoId(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="">Selecione um técnico...</option>
                            {tecnicos.filter(t => t.ativo).map((tecnico) => (
                                <option key={tecnico.id} value={tecnico.id}>
                                    {tecnico.nome} - {tecnico.especialidade}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Botões */}
                    <div className="flex justify-between pt-2">
                        <Button variant="outline" className="px-4 py-2" onClick={() => setModalAtribuir(false)}>
                            Cancelar
                        </Button>
                        <Button
                            variant="primary"
                            className="px-4 py-2"
                            onClick={() => {
                                if (!atribuirTecnicoId) {
                                    alert("Selecione um técnico");
                                    return;
                                }
                                handleAtribuir(osDetalhes?.id, atribuirTecnicoId, atribuirPrioridade);
                            }}
                        >
                            {osDetalhes?.tipo === 'SS' ? 'Converter em OS e Atribuir' : 'Atribuir Técnico'}
                        </Button>
                    </div>
                </div>
            </ModalWrapper>

            {/* Modal Detalhes */}
            <ModalWrapper
                isOpen={modalDetalhes}
                onClose={() => {
                    setModalDetalhes(false);
                    cancelarEdicaoOS();
                }}
                title={`${osDetalhes?.tipo === 'SS' ? 'Solicitação de Serviço' : 'Ordem de Serviço'} ${osDetalhes?.tipo || 'OS'}${osDetalhes?.numero ? String(osDetalhes.numero).padStart(6, '0') : ''}`}
                className="w-[700px]"
            >
                {osDetalhes && (
                    <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Status</p>
                                <p>{getStatusBadge(osDetalhes.status)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Prioridade</p>
                                {editandoOS ? (
                                    <select
                                        value={dadosEdicao.prioridade}
                                        onChange={(e) => setDadosEdicao({ ...dadosEdicao, prioridade: e.target.value })}
                                        className="w-full border rounded px-2 py-1 text-sm"
                                    >
                                        <option value="BAIXA">BAIXA</option>
                                        <option value="NORMAL">NORMAL</option>
                                        <option value="ALTA">ALTA</option>
                                        <option value="URGENTE">URGENTE</option>
                                    </select>
                                ) : (
                                    <p>{getPrioridadeBadge(osDetalhes.prioridade)}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Bem/Máquina</p>
                                {editandoOS ? (
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            value={searchBemDetalhes}
                                            onChange={(e) => setSearchBemDetalhes(e.target.value)}
                                            placeholder="Buscar bem..."
                                            className="w-full text-sm"
                                        />
                                        {searchBemDetalhes && searchBemDetalhes !== osDetalhes.bem?.descricao && bens.filter(b =>
                                            b.descricao.toLowerCase().includes(searchBemDetalhes.toLowerCase()) ||
                                            b.codigo.toLowerCase().includes(searchBemDetalhes.toLowerCase())
                                        ).length > 0 && (
                                                <div className="absolute z-10 w-full mt-1 bg-white border rounded shadow-lg max-h-40 overflow-auto">
                                                    {bens.filter(b =>
                                                        b.descricao.toLowerCase().includes(searchBemDetalhes.toLowerCase()) ||
                                                        b.codigo.toLowerCase().includes(searchBemDetalhes.toLowerCase())
                                                    ).slice(0, 5).map(bem => (
                                                        <div
                                                            key={bem.id}
                                                            className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                                                            onClick={() => handleSelecionarBemDetalhes(bem)}
                                                        >
                                                            <div className="font-medium">{bem.descricao}</div>
                                                            <div className="text-xs text-gray-500">{bem.codigo} - {bem.centroCusto}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                    </div>
                                ) : (
                                    <>
                                        <p className="font-medium">{osDetalhes.bem?.descricao}</p>
                                        <p className="text-xs text-gray-500">{osDetalhes.bem?.codigo}</p>
                                    </>
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Centro de Custo</p>
                                <p>{osDetalhes.centroCusto}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Localização</p>
                                <p>{osDetalhes.bem?.localizacao || '-'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Tipo de Solicitação</p>
                                {editandoOS ? (
                                    <select
                                        value={dadosEdicao.tipoManutencao}
                                        onChange={(e) => setDadosEdicao({ ...dadosEdicao, tipoManutencao: e.target.value })}
                                        className="w-full border rounded px-2 py-1 text-sm"
                                    >
                                        <option value="AVALIAÇÃO">AVALIAÇÃO</option>
                                        <option value="MANUTENÇÃO ELÉTRICA">MANUTENÇÃO ELÉTRICA</option>
                                        <option value="MANUTENÇÃO MECÂNICA">MANUTENÇÃO MECÂNICA</option>
                                    </select>
                                ) : (
                                    <p>{osDetalhes.tipoManutencao}</p>
                                )}
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Tipo Manutenção</p>
                                {editandoOS ? (
                                    <select
                                        value={dadosEdicao.tipoManutencaoCategoria}
                                        onChange={(e) => setDadosEdicao({ ...dadosEdicao, tipoManutencaoCategoria: e.target.value })}
                                        className="w-full border rounded px-2 py-1 text-sm"
                                    >
                                        <option value="CORRETIVA">CORRETIVA</option>
                                        <option value="PREVENTIVA">PREVENTIVA</option>
                                    </select>
                                ) : (
                                    <p>
                                        <span className={`font-bold text-xs ${osDetalhes.tipoManutencaoCategoria === 'PREVENTIVA' ? 'text-blue-600' : 'text-orange-600'}`}>
                                            {osDetalhes.tipoManutencaoCategoria || 'CORRETIVA'}
                                        </span>
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Solicitante</p>
                                <p>{osDetalhes.solicitante}</p>
                            </div>
                        </div>

                        {osDetalhes.dataInicio && (
                            <div className="bg-gray-50 p-3 rounded border">
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold">Início</p>
                                        <p className="font-mono text-sm">{formatDate(osDetalhes.dataInicio)}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold">Fim</p>
                                        <p className="font-mono text-sm">{osDetalhes.dataFim ? formatDate(osDetalhes.dataFim) : "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase font-bold">Tempo Total</p>
                                        <p className="font-bold font-mono text-blue-600">
                                            {calcularTempoTotal(osDetalhes)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <p className="text-xs text-gray-500 uppercase font-bold">Técnico Responsável</p>
                            {editandoOS ? (
                                <select
                                    value={dadosEdicao.tecnicoId}
                                    onChange={(e) => setDadosEdicao({ ...dadosEdicao, tecnicoId: e.target.value })}
                                    className="w-full border rounded px-2 py-1 text-sm"
                                >
                                    <option value="">Não atribuído</option>
                                    {tecnicos.map(tec => (
                                        <option key={tec.id} value={tec.id}>
                                            {tec.nome} - {tec.especialidade}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <p>{osDetalhes.tecnico?.nome || "Não atribuído"}</p>
                            )}
                        </div>

                        {osDetalhes.observacaoAbertura && (
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Observação</p>
                                <p className="bg-gray-50 p-2 rounded text-sm">{osDetalhes.observacaoAbertura}</p>
                            </div>
                        )}

                        {osDetalhes.problema && (
                            <div className="pt-2">
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
                            <div className="pt-2">
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
                        {/* Botão de Editar/Cancelar */}
                        <div className="flex justify-between">
                            <Button
                                variant="ghost"
                                className="text-sm px-3 py-1 text-red-600 hover:bg-red-50 border-2 border-red-600"
                                onClick={excluirOS}
                            >
                                Excluir
                            </Button>
                            {!editandoOS ? (
                                <Button variant="outline" className="text-sm px-3 py-1" onClick={iniciarEdicaoOS}>
                                    Editar OS
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button variant="outline" className="text-sm px-3 py-1" onClick={cancelarEdicaoOS}>
                                        Cancelar
                                    </Button>
                                    <Button variant="primary" className="text-sm px-3 py-1" onClick={salvarEdicaoOS}>
                                        Salvar
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </ModalWrapper>

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
                            id="qr-reader"
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
