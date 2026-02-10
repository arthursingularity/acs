
"use client";

import { useState, useEffect } from "react";
import NavBar from "@/app/components/ui/NavBar";
import ModalWrapper from "@/app/components/ui/ModalWrapper";
import DataTable from "@/app/components/ui/DataTable";

export default function TecnicosPage() {
    const [tecnicos, setTecnicos] = useState([]);
    const [tecnicoSelecionado, setTecnicoSelecionado] = useState(null);
    const [ordens, setOrdens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingOrdens, setLoadingOrdens] = useState(false);


    // Função auxiliar para data local YYYY-MM-DD
    const getLocalISOString = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Estados de filtro de data
    const [dataInicio, setDataInicio] = useState(() => {
        const date = new Date();
        date.setDate(1);
        return getLocalISOString(date);
    });
    const [dataFim, setDataFim] = useState(() => {
        return getLocalISOString(new Date());
    });

    // Estados para modal de detalhes
    const [modalDetalhes, setModalDetalhes] = useState(false);
    const [osDetalhes, setOsDetalhes] = useState(null);

    useEffect(() => {
        document.title = "Análise de Técnicos";
        fetchTecnicos();
    }, []);

    useEffect(() => {
        if (tecnicoSelecionado) {
            fetchOrdensTecnico();
        }
    }, [tecnicoSelecionado, dataInicio, dataFim]);

    const fetchTecnicos = async () => {
        try {
            const response = await fetch("/api/manutencao/tecnicos?ativo=true");
            if (response.ok) {
                const data = await response.json();
                setTecnicos(data);
                if (data.length > 0) {
                    setTecnicoSelecionado(data[0]);
                }
            }
        } catch (error) {
            console.error("Erro ao carregar técnicos:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrdensTecnico = async () => {
        setLoadingOrdens(true);
        try {
            // Filtrar ordens concluídas ou encerradas para análise
            let url = `/api/manutencao/ordens?tecnicoId=${tecnicoSelecionado.id}&status=concluida_tecnica,encerrada`;
            const response = await fetch(url);

            if (response.ok) {
                const data = await response.json();

                // Aplicar filtro de período no frontend (simplificado)
                // Aplicar filtro de período no frontend
                const [anoIni, mesIni, diaIni] = dataInicio.split('-').map(Number);
                const inicio = new Date(anoIni, mesIni - 1, diaIni, 0, 0, 0, 0);

                const [anoFim, mesFim, diaFim] = dataFim.split('-').map(Number);
                const fim = new Date(anoFim, mesFim - 1, diaFim, 23, 59, 59, 999);

                const ordensFiltradas = data.filter(os => {
                    const dataOs = new Date(os.dataFim || os.dataAbertura);
                    return dataOs >= inicio && dataOs <= fim;
                });

                setOrdens(ordensFiltradas);
            }
        } catch (error) {
            console.error("Erro ao carregar ordens:", error);
        } finally {
            setLoadingOrdens(false);
        }
    };

    const calcularTempoLiquido = (os) => {
        if (!os.dataInicio || !os.dataFim) return 0;

        const inicio = new Date(os.dataInicio);
        const fim = new Date(os.dataFim);

        let totalPausas = 0;
        if (os.pausas) {
            os.pausas.forEach(p => {
                if (p.dataFim) {
                    totalPausas += new Date(p.dataFim) - new Date(p.dataInicio);
                }
            });
        }

        let diff = Math.floor((fim - inicio - totalPausas) / 1000); // em segundos
        return diff > 0 ? diff : 0;
    };

    const formatarTempo = (totalSegundos) => {
        if (!totalSegundos) return "00:00:00";
        const h = Math.floor(totalSegundos / 3600);
        const m = Math.floor((totalSegundos % 3600) / 60);
        const s = Math.floor(totalSegundos % 60);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const formatarTempoExtenso = (totalSegundos) => {
        if (!totalSegundos) return "0 segundos";

        const dias = Math.floor(totalSegundos / (3600 * 24));
        const horas = Math.floor((totalSegundos % (3600 * 24)) / 3600);
        const minutos = Math.floor((totalSegundos % 3600) / 60);
        const segundos = Math.floor(totalSegundos % 60);

        let partes = [];
        if (dias > 0) partes.push(`${dias} ${dias === 1 ? 'dia' : 'dias'}`);
        if (horas > 0) partes.push(`${horas} ${horas === 1 ? 'hora' : 'horas'}`);
        if (minutos > 0) partes.push(`${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`);
        if (segundos > 0 || partes.length === 0) partes.push(`${segundos} ${segundos === 1 ? 'segundo' : 'segundos'}`);

        if (partes.length === 1) return partes[0];

        const ultimo = partes.pop();
        return `${partes.join(', ')} e ${ultimo}.`;
    };

    // Estatísticas calculadas
    const totalOS = ordens.length;
    const tempoTotalSegundos = ordens.reduce((acc, os) => acc + calcularTempoLiquido(os), 0);
    const mediaTempoSegundos = totalOS > 0 ? Math.floor(tempoTotalSegundos / totalOS) : 0;

    // Agrupar por tipo de manutenção para gráfico/lista
    const porTipo = ordens.reduce((acc, os) => {
        acc[os.tipoManutencao] = (acc[os.tipoManutencao] || 0) + 1;
        return acc;
    }, {});

    const handleVisualizarOS = (os) => {
        console.log("Visualizando OS:", os);
        setOsDetalhes(os);
        setModalDetalhes(true);
        console.log("Modal aberto: true");
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
        if (!prioridade) return null;
        const p = prioridade.toLowerCase();
        const badges = {
            baixa: { bg: "bg-gray-100", text: "text-gray-600", label: "Baixa" },
            normal: { bg: "bg-blue-100", text: "text-blue-600", label: "Normal" },
            alta: { bg: "bg-orange-100", text: "text-orange-600", label: "Alta" },
            urgente: { bg: "bg-red-100", text: "text-red-600", label: "Urgente" }
        };
        const badge = badges[p] || badges.normal;
        return (
            <span className={`px-2 py-1 rounded text-xs font-bold ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    const calcularTempoTotal = (os) => {
        if (!os.dataInicio) return "-";

        let fim = os.dataFim ? new Date(os.dataFim) : new Date();
        const inicio = new Date(os.dataInicio);

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

    return (
        <>
            <NavBar
                titulo="Análise de Técnicos"
                manutencaoButtons={false}
            />
            <div className="flex flex-col h-screen bg-gray-200 overflow-hidden pt-[100px]">
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar - Lista de Técnicos */}
                    <div className="w-80 bg-white border-r border-[#ccc] overflow-y-auto">
                        <div>
                            {loading ? (
                                <div className="p-4 text-center text-gray-500">Carregando...</div>
                            ) : (
                                tecnicos.map(tecnico => (
                                    <div
                                        key={tecnico.id}
                                        onClick={() => setTecnicoSelecionado(tecnico)}
                                        className={`p-2 border-b border-[#ccc] cursor-pointer hover:bg-gray-50 transition-colors ${tecnicoSelecionado?.id === tecnico.id ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                                            }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-xl text-white">
                                                {tecnico.nome.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-800">{tecnico.nome}</div>
                                                <div className="text-xs text-gray-500">{tecnico.especialidade}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Área Principal */}
                    <div className="flex-1 overflow-y-auto p-8">
                        {tecnicoSelecionado ? (
                            <div className="max-w-6xl mx-auto space-y-3">
                                {/* Header do Técnico */}
                                <div className="bg-white rounded-xl shadow-sm p-6 flex justify-between items-start">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-3xl text-blue-600">
                                            {tecnicoSelecionado.nome.charAt(0)}
                                        </div>
                                        <div>
                                            <h1 className="text-2xl font-bold text-gray-800">{tecnicoSelecionado.nome}</h1>
                                            <div className="flex items-center space-x-2 text-gray-500">
                                                <span className="px-2 py-0.5 bg-gray-100 rounded text-sm">{tecnicoSelecionado.matricula}</span>
                                                <span>•</span>
                                                <span>{tecnicoSelecionado.especialidade}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-500 font-bold uppercase">Início</span>
                                            <input
                                                type="date"
                                                value={dataInicio}
                                                onChange={(e) => setDataInicio(e.target.value)}
                                                className="border rounded px-2 py-1 text-sm bg-gray-50 outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-gray-500 font-bold uppercase">Fim</span>
                                            <input
                                                type="date"
                                                value={dataFim}
                                                onChange={(e) => setDataFim(e.target.value)}
                                                className="border rounded px-2 py-1 text-sm bg-gray-50 outline-none focus:ring-1 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Cards de Métricas */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="bg-white rounded-xl shadow-sm p-6">
                                        <div className="text-sm text-gray-500 font-medium uppercase mb-1">OS Concluídas</div>
                                        <div className="text-3xl font-bold text-gray-800">{loadingOrdens ? "-" : totalOS}</div>
                                    </div>
                                    <div className="bg-white rounded-xl shadow-sm p-6">
                                        <div className="text-sm text-gray-500 font-medium uppercase mb-1">Tempo Total Trabalhado</div>
                                        <div className="text-3xl font-bold text-blue-600 font-mono">
                                            {loadingOrdens ? "-" : formatarTempo(tempoTotalSegundos)}
                                        </div>
                                        <div className="text-gray-500 mt-1">
                                            {loadingOrdens ? "-" : formatarTempoExtenso(tempoTotalSegundos)}
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-xl shadow-sm p-6">
                                        <div className="text-sm text-gray-500 font-medium uppercase mb-1">Média por Serviço</div>
                                        <div className="text-3xl font-bold text-gray-800 font-mono">
                                            {loadingOrdens ? "-" : formatarTempo(mediaTempoSegundos)}
                                        </div>
                                        <div className="text-gray-500 mt-1">
                                            {loadingOrdens ? "-" : formatarTempoExtenso(mediaTempoSegundos)}
                                        </div>
                                    </div>
                                </div>

                                {/* Histórico de Serviços */}
                                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                                    <div className="p-6 border-b border-[#ccc] flex justify-between items-center">
                                        <h3 className="font-bold text-gray-800">Histórico de Serviços</h3>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <DataTable
                                            loading={loadingOrdens}
                                            emptyMessage="Nenhum serviço encontrado neste período."
                                            data={ordens}
                                            onSelect={(os) => handleVisualizarOS(os)}
                                            columns={[
                                                {
                                                    key: "dataFim",
                                                    label: "Data",
                                                    render: (val, row) => new Date(val || row.dataAbertura).toLocaleDateString('pt-BR')
                                                },
                                                {
                                                    key: "numero",
                                                    label: "OS",
                                                    render: (val) => `OS${String(val).padStart(6, '0')}`
                                                },
                                                {
                                                    key: "bem.codigo",
                                                    label: "Equipamento",
                                                    render: (val, row) => (
                                                        <div>
                                                            <div className="font-medium">{val || "-"}</div>
                                                            <div className="text-xs text-gray-400 truncate max-w-[200px]">{row.bem?.descricao}</div>
                                                        </div>
                                                    )
                                                },
                                                {
                                                    key: "tipoManutencao",
                                                    label: "Tipo",
                                                    render: (val) => (
                                                        <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">{val}</span>
                                                    )
                                                },
                                                {
                                                    key: "id",
                                                    label: "Tempo",
                                                    render: (val, row) => (
                                                        <span className="font-mono font-medium text-blue-600">{formatarTempo(calcularTempoLiquido(row))}</span>
                                                    )
                                                },
                                                {
                                                    key: "status",
                                                    label: "Status",
                                                    render: (val) => (
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${val === 'concluida_tecnica' ? 'bg-green-100 text-green-700' :
                                                            val === 'encerrada' ? 'bg-gray-100 text-gray-700' :
                                                                'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {val === 'concluida_tecnica' ? 'Concluída' :
                                                                val === 'encerrada' ? 'Encerrada' : val}
                                                        </span>
                                                    )
                                                }
                                            ]}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                <div className="text-6xl mb-4">👷‍♂️</div>
                                <p className="text-lg">Selecione um técnico para ver a análise</p>
                            </div>
                        )}
                    </div>
                </div>
            </div >

            {/* Modal Detalhes (ReadOnly) */}
            < ModalWrapper
                isOpen={modalDetalhes}
                onClose={() => setModalDetalhes(false)
                }
                title={`Ordem de Serviço OS${osDetalhes?.numero ? String(osDetalhes.numero).padStart(6, '0') : ''}`}
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
                                <p className="text-xs text-gray-500 uppercase font-bold">Tipo de Solicitação</p>
                                <p>{osDetalhes.tipoManutencao}</p>
                            </div>
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
                            <p>{osDetalhes.tecnico?.nome || "Não atribuído"}</p>
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
                    </div>
                )}
            </ModalWrapper >
        </>
    );
}
