"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MobileOSPage() {
    const router = useRouter();
    const [ordens, setOrdens] = useState([]);
    const [tecnicos, setTecnicos] = useState([]);
    const [tecnicoSelecionado, setTecnicoSelecionado] = useState(null);
    const [loading, setLoading] = useState(true);
    const [osAtiva, setOsAtiva] = useState(null);
    const [viewMode, setViewMode] = useState("lista"); // lista, execucao, finalizar

    // Estados para execução
    const [modalPausa, setModalPausa] = useState(false);
    const [modalFinalizar, setModalFinalizar] = useState(false);
    const [motivosPausa, setMotivosPausa] = useState([]);
    const [pcsData, setPcsData] = useState({ problemas: [], causas: [], solucoes: [] });

    const [formFinalizar, setFormFinalizar] = useState({
        problemaId: "",
        causaId: "",
        solucaoId: "",
        observacaoTecnica: "",
        horaExtra: false,
        statusFinalBem: "operacional"
    });

    const [tempoAtual, setTempoAtual] = useState(new Date());
    const [timeOffset, setTimeOffset] = useState(0);

    // Sincronizar tempo com o servidor
    useEffect(() => {
        const syncTime = async () => {
            try {
                const response = await fetch("/", { method: "HEAD" });
                const dateHeader = response.headers.get("Date");
                if (dateHeader) {
                    const serverTime = new Date(dateHeader).getTime();
                    const localTime = Date.now();
                    setTimeOffset(serverTime - localTime);
                }
            } catch (e) {
                console.error("Erro ao sincronizar tempo:", e);
            }
        };
        syncTime();
    }, []);

    useEffect(() => {
        if (viewMode === "execucao" && osAtiva) {
            const updateTime = () => setTempoAtual(new Date(Date.now() + timeOffset));
            updateTime();
            const interval = setInterval(updateTime, 1000);
            return () => clearInterval(interval);
        }
    }, [viewMode, osAtiva, timeOffset]);

    const fetchTecnicos = async () => {
        try {
            const response = await fetch("/api/manutencao/tecnicos?ativo=true");
            if (response.ok) {
                const data = await response.json();
                setTecnicos(data);
            }
        } catch (error) {
            console.error("Erro:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchOrdens = async () => {
        if (!tecnicoSelecionado) return;
        try {
            const response = await fetch(`/api/manutencao/ordens?tecnicoId=${tecnicoSelecionado.id}&status=em_fila,em_execucao,pausada`);
            if (response.ok) {
                const data = await response.json();
                setOrdens(data);

                // Verificar se tem OS em execução ou pausada
                const osEmAndamento = data.find(os => os.status === "em_execucao" || os.status === "pausada");
                if (osEmAndamento) {
                    setOsAtiva(osEmAndamento);
                    setViewMode("execucao");
                }
            }
        } catch (error) {
            console.error("Erro:", error);
        }
    };

    const fetchMotivosPausa = async () => {
        try {
            const response = await fetch("/api/manutencao/motivos-pausa?ativo=true");
            if (response.ok) {
                const data = await response.json();
                setMotivosPausa(data);
            }
        } catch (error) {
            console.error("Erro:", error);
        }
    };

    const fetchPCS = async () => {
        try {
            const response = await fetch("/api/manutencao/pcs?ativo=true");
            if (response.ok) {
                const data = await response.json();
                setPcsData({
                    problemas: data.filter(p => p.tipo === "problema"),
                    causas: data.filter(p => p.tipo === "causa"),
                    solucoes: data.filter(p => p.tipo === "solucao")
                });
            }
        } catch (error) {
            console.error("Erro:", error);
        }
    };

    useEffect(() => {
        document.title = "Execução Mobile";
        fetchTecnicos();
        fetchMotivosPausa();
        fetchPCS();

        // Verificar se tem técnico no localStorage
        const tecnicoId = localStorage.getItem("tecnicoMobileId");
        if (tecnicoId) {
            fetchTecnicos().then(() => {
                const tecnico = tecnicos.find(t => t.id === tecnicoId);
                if (tecnico) {
                    setTecnicoSelecionado(tecnico);
                }
            });
        }
    }, []);

    useEffect(() => {
        if (tecnicoSelecionado) {
            fetchOrdens();
            localStorage.setItem("tecnicoMobileId", tecnicoSelecionado.id);

            const interval = setInterval(fetchOrdens, 15000);
            return () => clearInterval(interval);
        }
    }, [tecnicoSelecionado]);

    const handleSelecionarTecnico = (tecnico) => {
        setTecnicoSelecionado(tecnico);
        setLoading(true);
        setTimeout(() => setLoading(false), 500);
    };

    const handleIniciarOS = async (ordem) => {
        try {
            const response = await fetch("/api/manutencao/ordens", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: ordem.id, acao: "iniciar" })
            });

            if (response.ok) {
                const osAtualizada = await response.json();
                setOsAtiva(osAtualizada);
                setViewMode("execucao");
                fetchOrdens();
            }
        } catch (error) {
            console.error("Erro ao iniciar:", error);
        }
    };

    const handlePausarOS = async (motivoPausaId, observacao = "") => {
        try {
            await fetch("/api/manutencao/pausas", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ordemServicoId: osAtiva.id,
                    tecnicoId: tecnicoSelecionado.id,
                    motivoPausaId,
                    observacao
                })
            });

            setModalPausa(false);
            fetchOrdens();
        } catch (error) {
            console.error("Erro ao pausar:", error);
        }
    };

    const handleRetomarOS = async () => {
        try {
            // Finalizar pausa ativa
            const pausaAtiva = osAtiva.pausas?.find(p => !p.dataFim);
            if (pausaAtiva) {
                await fetch("/api/manutencao/pausas", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        id: pausaAtiva.id,
                        ordemServicoId: osAtiva.id
                    })
                });
            }

            // Retomar OS
            await fetch("/api/manutencao/ordens", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: osAtiva.id, acao: "retomar" })
            });

            fetchOrdens();
        } catch (error) {
            console.error("Erro ao retomar:", error);
        }
    };

    const handleFinalizarOS = async () => {
        if (!formFinalizar.problemaId || !formFinalizar.causaId || !formFinalizar.solucaoId) {
            alert("Preencha Problema, Causa e Solução");
            return;
        }

        try {
            await fetch("/api/manutencao/ordens", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: osAtiva.id,
                    acao: "finalizar",
                    ...formFinalizar
                })
            });

            // Encerrar automaticamente (integração com Protheus simulada)
            await fetch("/api/manutencao/ordens", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: osAtiva.id,
                    acao: "encerrar",
                    encerradoPor: tecnicoSelecionado.nome
                })
            });

            setModalFinalizar(false);
            setOsAtiva(null);
            setViewMode("lista");
            setFormFinalizar({
                problemaId: "",
                causaId: "",
                solucaoId: "",
                observacaoTecnica: "",
                horaExtra: false,
                statusFinalBem: "operacional"
            });
            fetchOrdens();
        } catch (error) {
            console.error("Erro ao finalizar:", error);
        }
    };

    const getTempoDecorrido = (dataInicio) => {
        if (!dataInicio) return "00:00:00";

        const inicio = new Date(dataInicio);
        let agora = tempoAtual;

        // Se estiver pausada, o contador deve parar no início da pausa atual
        const pausaAtiva = osAtiva?.pausas?.find(p => !p.dataFim);
        if (pausaAtiva) {
            agora = new Date(pausaAtiva.dataInicio);
        }

        // Calcular tempo total de pausas finalizadas
        let totalPausas = 0;
        if (osAtiva?.pausas) {
            osAtiva.pausas.forEach(p => {
                if (p.dataFim) {
                    totalPausas += new Date(p.dataFim) - new Date(p.dataInicio);
                }
            });
        }

        // Tempo líquido = (Agora - Início) - TotalPausas
        let diff = Math.floor((agora - inicio - totalPausas) / 1000);

        if (diff < 0) diff = 0;

        const horas = Math.floor(diff / 3600);
        const minutos = Math.floor((diff % 3600) / 60);
        const segundos = diff % 60;

        return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
    };

    const getPrioridadeColor = (prioridade) => {
        switch (prioridade) {
            case "urgente": return "bg-red-500";
            case "alta": return "bg-orange-500";
            case "normal": return "bg-blue-500";
            default: return "bg-gray-500";
        }
    };

    // Tela de seleção de técnico
    if (!tecnicoSelecionado) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-primary3 to-primary4">
                <div className="p-4 text-white text-center">
                    <h1 className="text-xl font-bold mb-2">Sistema de Manutenção</h1>
                    <p className="text-white/80">Selecione seu perfil</p>
                </div>

                <div className="p-4 space-y-3">
                    {tecnicos.map((tecnico) => (
                        <button
                            key={tecnico.id}
                            onClick={() => handleSelecionarTecnico(tecnico)}
                            className="w-full bg-white rounded-xl p-4 shadow-lg text-left active:scale-98 transition-transform"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-primary3/20 rounded-full flex items-center justify-center text-2xl">
                                    👷
                                </div>
                                <div>
                                    <div className="font-bold text-gray-800">{tecnico.nome}</div>
                                    <div className="text-sm text-gray-500">{tecnico.matricula} • {tecnico.especialidade}</div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // Tela de execução de OS
    if (viewMode === "execucao" && osAtiva) {
        const isPausada = osAtiva.status === "pausada";
        const pausaAtiva = osAtiva.pausas?.find(p => !p.dataFim);

        return (
            <div className="min-h-screen bg-gray-100 flex flex-col">
                {/* Header */}
                <div className={`${isPausada ? "bg-orange-500" : "bg-green-600"} p-4 text-white`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm opacity-80">OS em {isPausada ? "Pausa" : "Execução"}</div>
                            <div className="text-2xl font-bold">OS{String(osAtiva.numero).padStart(6, '0')}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-mono font-bold">{getTempoDecorrido(osAtiva.dataInicio)}</div>
                            <div className="text-sm opacity-80">tempo decorrido</div>
                        </div>
                    </div>
                </div>

                {/* Conteúdo */}
                <div className="flex-1 overflow-auto p-4 pb-48 space-y-4">
                    {/* Info do Bem */}
                    <div className="bg-white rounded-xl p-4 shadow">
                        <div className="text-xs text-gray-500 uppercase font-bold">Bem / Máquina</div>
                        <div className="text-lg font-bold text-gray-800">{osAtiva.bem?.descricao}</div>
                        <div className="text-sm text-gray-500">{osAtiva.bem?.codigo}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-xl p-4 shadow">
                            <div className="text-xs text-gray-500 uppercase font-bold">Centro Custo</div>
                            <div className="font-bold">{osAtiva.centroCusto}</div>
                        </div>
                        <div className="bg-white rounded-xl p-4 shadow">
                            <div className="text-xs text-gray-500 uppercase font-bold">Tipo</div>
                            <div className="font-bold">{osAtiva.tipoManutencao}</div>
                        </div>
                    </div>

                    {osAtiva.observacaoAbertura && (
                        <div className="bg-white rounded-xl p-4 shadow">
                            <div className="text-xs text-gray-500 uppercase font-bold">Observação</div>
                            <div className="text-gray-700">{osAtiva.observacaoAbertura}</div>
                        </div>
                    )}

                    {isPausada && pausaAtiva && (
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                            <div className="text-xs text-orange-600 uppercase font-bold">Motivo da Pausa</div>
                            <div className="text-orange-800 font-bold">{pausaAtiva.motivoPausa?.descricao}</div>
                            {pausaAtiva.observacao && (
                                <div className="text-sm text-orange-700 mt-1">{pausaAtiva.observacao}</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Ações */}
                <div className="fixed bottom-0 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-white border-t space-y-3 z-40">
                    {isPausada ? (
                        <button
                            onClick={handleRetomarOS}
                            className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg active:scale-98 transition-transform"
                        >
                            Retomar Execução
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={() => setModalPausa(true)}
                                className="w-full bg-orange-500 text-white py-4 rounded-xl font-bold text-lg active:scale-98 transition-transform"
                            >
                                Pausar
                            </button>
                            <button
                                onClick={() => setModalFinalizar(true)}
                                className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg active:scale-98 transition-transform"
                            >
                                Finalizar
                            </button>
                        </>
                    )}
                </div>

                {/* Modal Pausa */}
                {modalPausa && (
                    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
                        <div className="bg-white w-full rounded-t-3xl p-6 animate-slide-up">
                            <h3 className="text-lg font-bold mb-4">Selecione o motivo da pausa</h3>
                            <div className="space-y-2 max-h-64 overflow-auto">
                                {motivosPausa.map((motivo) => (
                                    <button
                                        key={motivo.id}
                                        onClick={() => handlePausarOS(motivo.id)}
                                        className="w-full text-left p-4 bg-gray-50 rounded-xl active:bg-gray-100"
                                    >
                                        {motivo.descricao}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => setModalPausa(false)}
                                className="w-full mt-4 py-3 text-gray-600 font-medium"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {/* Modal Finalizar */}
                {modalFinalizar && (
                    <div className="fixed inset-0 bg-black/50 z-50">
                        <div className="bg-white w-full h-full pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] flex flex-col">
                            <div className="p-4 border-b">
                                <h3 className="text-lg font-bold">Finalizar OS{String(osAtiva.numero).padStart(6, '0')}</h3>
                            </div>

                            <div className="flex-1 overflow-auto p-4">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Problema *
                                        </label>
                                        <select
                                            value={formFinalizar.problemaId}
                                            onChange={(e) => setFormFinalizar({ ...formFinalizar, problemaId: e.target.value })}
                                            className="w-full border rounded-xl px-4 py-3"
                                        >
                                            <option value="">Selecione...</option>
                                            {pcsData.problemas.map((p) => (
                                                <option key={p.id} value={p.id}>{p.descricao}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Causa *
                                        </label>
                                        <select
                                            value={formFinalizar.causaId}
                                            onChange={(e) => setFormFinalizar({ ...formFinalizar, causaId: e.target.value })}
                                            className="w-full border rounded-xl px-4 py-3"
                                        >
                                            <option value="">Selecione...</option>
                                            {pcsData.causas.map((c) => (
                                                <option key={c.id} value={c.id}>{c.descricao}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Solução *
                                        </label>
                                        <select
                                            value={formFinalizar.solucaoId}
                                            onChange={(e) => setFormFinalizar({ ...formFinalizar, solucaoId: e.target.value })}
                                            className="w-full border rounded-xl px-4 py-3"
                                        >
                                            <option value="">Selecione...</option>
                                            {pcsData.solucoes.map((s) => (
                                                <option key={s.id} value={s.id}>{s.descricao}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Observação
                                        </label>
                                        <textarea
                                            value={formFinalizar.observacaoTecnica}
                                            onChange={(e) => setFormFinalizar({ ...formFinalizar, observacaoTecnica: e.target.value.toUpperCase() })}
                                            placeholder="Detalhes adicionais..."
                                            className="w-full border rounded-xl px-4 py-3 h-24"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                        <span className="font-medium">Hora Extra?</span>
                                        <button
                                            onClick={() => setFormFinalizar({ ...formFinalizar, horaExtra: !formFinalizar.horaExtra })}
                                            className={`w-12 h-6 rounded-full transition-colors ${formFinalizar.horaExtra ? "bg-green-500" : "bg-gray-300"
                                                }`}
                                        >
                                            <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${formFinalizar.horaExtra ? "translate-x-6" : "translate-x-0.5"
                                                }`} />
                                        </button>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Status Final do Bem
                                        </label>
                                        <div className="flex space-x-3">
                                            <button
                                                onClick={() => setFormFinalizar({ ...formFinalizar, statusFinalBem: "operacional" })}
                                                className={`flex-1 py-3 rounded-xl font-medium ${formFinalizar.statusFinalBem === "operacional"
                                                    ? "bg-green-500 text-white"
                                                    : "bg-gray-100 text-gray-700"
                                                    }`}
                                            >
                                                ✅ Operacional
                                            </button>
                                            <button
                                                onClick={() => setFormFinalizar({ ...formFinalizar, statusFinalBem: "restricao" })}
                                                className={`flex-1 py-3 rounded-xl font-medium ${formFinalizar.statusFinalBem === "restricao"
                                                    ? "bg-yellow-500 text-white"
                                                    : "bg-gray-100 text-gray-700"
                                                    }`}
                                            >
                                                ⚠️ Com Restrição
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t space-y-3">
                                <button
                                    onClick={handleFinalizarOS}
                                    className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg"
                                >
                                    Confirmar Finalização
                                </button>
                                <button
                                    onClick={() => setModalFinalizar(false)}
                                    className="w-full py-3 text-gray-600 font-medium"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Tela de lista de OS
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-primary3 p-4 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div>
                            <div className="font-bold">{tecnicoSelecionado.nome}</div>
                            <div className="text-sm opacity-80">{tecnicoSelecionado.especialidade}</div>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setTecnicoSelecionado(null);
                            localStorage.removeItem("tecnicoMobileId");
                        }}
                        className="text-sm opacity-80 hover:opacity-100"
                    >
                        Trocar
                    </button>
                </div>
            </div>

            {/* Lista de OS */}
            <div className="p-4">
                <h2 className="text-lg font-bold text-gray-800 mb-3">Suas Ordens de Serviço</h2>

                {ordens.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-4xl mb-3">✅</div>
                        <div className="text-gray-500">Nenhuma OS na sua fila</div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {ordens.map((ordem) => (
                            <div
                                key={ordem.id}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
                            >
                                <div className="p-4">
                                    {/* Header: OS e Status */}
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <span className="text-lg font-bold text-blue-600 block">
                                                OS{String(ordem.numero).padStart(6, '0')}
                                            </span>
                                            <div className="text-sm font-medium text-gray-700 mt-1">
                                                {ordem.bem?.codigo || "Sem Código"}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide ${ordem.status === "em_fila" ? "bg-blue-100 text-blue-700" :
                                                ordem.status === "em_execucao" ? "bg-green-100 text-green-700" :
                                                    "bg-orange-100 text-orange-700"
                                                }`}>
                                                {ordem.status === "em_fila" ? "Na Fila" :
                                                    ordem.status === "em_execucao" ? "Em Execução" : "Pausada"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Info Principal */}
                                    <div className="space-y-3 mb-4">
                                        <div>
                                            <p className="text-gray-900 font-bold leading-tight text-base">
                                                {ordem.bem?.descricao || "Equipamento não identificado"}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-medium">
                                                {ordem.tipoManutencao}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-gray-500 uppercase">Prioridade:</span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] text-white font-bold uppercase ${getPrioridadeColor(ordem.prioridade)}`}>
                                                {ordem.prioridade || "NORMAL"}
                                            </span>
                                        </div>

                                        {ordem.observacaoAbertura && (
                                            <div className="bg-gray-50 rounded p-3 border border-gray-100 mt-2">
                                                <p className="text-[10px] font-bold text-gray-400 mb-1 uppercase tracking-wide">Observação</p>
                                                <p className="text-sm text-gray-700 leading-snug">
                                                    {ordem.observacaoAbertura}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Botões */}
                                    {ordem.status === "em_fila" && (
                                        <button
                                            onClick={() => handleIniciarOS(ordem)}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-lg font-bold text-sm uppercase tracking-wide active:scale-[0.98] transition-all shadow-sm hover:shadow"
                                        >
                                            Iniciar Serviço
                                        </button>
                                    )}

                                    {(ordem.status === "em_execucao" || ordem.status === "pausada") && (
                                        <button
                                            onClick={() => {
                                                setOsAtiva(ordem);
                                                setViewMode("execucao");
                                            }}
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-lg font-bold text-sm uppercase tracking-wide active:scale-[0.98] transition-all shadow-sm hover:shadow"
                                        >
                                            Continuar / Detalhes
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Refresh */}
            <div className="fixed bottom-4 right-4">
                <button
                    onClick={fetchOrdens}
                    className="w-14 h-14 bg-primary3 text-white rounded-full shadow-lg flex items-center justify-center text-2xl active:scale-95 transition-transform"
                >
                    🔄
                </button>
            </div>
        </div>
    );
}
