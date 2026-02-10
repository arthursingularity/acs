"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function PainelTVPage() {
    const [dashboard, setDashboard] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [fullscreen, setFullscreen] = useState(false);

    const fetchDashboard = async () => {
        try {
            const response = await fetch("/api/manutencao/dashboard");
            if (response.ok) {
                const data = await response.json();
                setDashboard(data);
            }
        } catch (error) {
            console.error("Erro ao buscar dashboard:", error);
        }
    };

    useEffect(() => {
        document.title = "Painel TV - Manutenção";
        fetchDashboard();

        // Atualizar dados a cada 5 segundos
        const dataInterval = setInterval(fetchDashboard, 5000);

        // Atualizar relógio a cada segundo
        const clockInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => {
            clearInterval(dataInterval);
            clearInterval(clockInterval);
        };
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setFullscreen(true);
        } else {
            document.exitFullscreen();
            setFullscreen(false);
        }
    };

    const getPrioridadeColor = (prioridade) => {
        switch (prioridade?.toLowerCase()) {
            case "urgente": return "bg-red-500 text-white";
            case "alta": return "bg-orange-500 text-white";
            case "normal": return "bg-blue-500 text-black";
            case "baixa": return "bg-gray-400 text-white";
            default: return "bg-gray-400 text-white";
        }
    };

    const getTempoDecorrido = (dataInicio) => {
        if (!dataInicio) return "-";
        const inicio = new Date(dataInicio);
        const agora = new Date();
        const diff = Math.floor((agora - inicio) / 1000 / 60); // minutos

        if (diff < 60) return `${diff}min`;
        const horas = Math.floor(diff / 60);
        const mins = diff % 60;
        return `${horas}h${mins.toString().padStart(2, '0')}min`;
    };

    const StatusCard = ({ label, value, bgColor, textColor = "text-white" }) => (
        <div className={`${bgColor} ${textColor} rounded-xl p-4 shadow-lg`}>
            <div className="text-4xl font-bold">{value}</div>
            <div className="text-sm opacity-90">{label}</div>
        </div>
    );

    if (!dashboard) {
        return (
            <div className="h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-white text-2xl animate-pulse">Carregando painel...</div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-primary3 to-primary4 h-16 flex items-center justify-between px-6 shadow-lg">
                <div className="flex items-center space-x-4">
                    <img src="/imagens/stamS.png" className="h-10 bg-primary2 border border-primary p-2 rounded" alt="Logo" />
                    <div>
                        <h1 className="text-white font-bold text-xl">Painel de Manutenção</h1>
                        <p className="text-white/70 text-sm">Gestão em Tempo Real</p>
                    </div>
                </div>

                <div className="flex items-center space-x-6">
                    <div className="text-white text-right">
                        <div className="text-3xl font-bold font-mono">
                            {currentTime.toLocaleTimeString("pt-BR")}
                        </div>
                        <div className="text-sm opacity-70">
                            {currentTime.toLocaleDateString("pt-BR", { weekday: 'long', day: '2-digit', month: 'long' })}
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        <button
                            onClick={toggleFullscreen}
                            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            {fullscreen ? "⛶ Sair" : "⛶ Tela Cheia"}
                        </button>
                        <Link href="/manutencao" className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors">
                            ← Voltar
                        </Link>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-4 h-[calc(100vh-64px)] grid grid-cols-12 grid-rows-6 gap-4">

                {/* Status Cards - Top Row */}
                <div className="col-span-2 row-span-1">
                    <StatusCard label="Abertas" value={dashboard.resumo.abertas} bgColor="bg-yellow-500" />
                </div>
                <div className="col-span-2 row-span-1">
                    <StatusCard label="Na Fila" value={dashboard.resumo.emFila} bgColor="bg-blue-600" />
                </div>
                <div className="col-span-2 row-span-1">
                    <StatusCard label="Em Execução" value={dashboard.resumo.emExecucao} bgColor="bg-green-600" />
                </div>
                <div className="col-span-2 row-span-1">
                    <StatusCard label="Pausadas" value={dashboard.resumo.pausadas} bgColor="bg-orange-500" />
                </div>
                <div className="col-span-2 row-span-1">
                    <StatusCard label="Concluídas" value={dashboard.resumo.concluidasTecnica} bgColor="bg-purple-600" />
                </div>
                <div className="col-span-2 row-span-1">
                    <StatusCard label="Encerradas Hoje" value={dashboard.resumo.encerradasHoje} bgColor="bg-gray-600" />
                </div>

                {/* Técnicos - Left Column */}
                <div className="col-span-4 row-span-5 bg-gray-800/50 rounded-xl p-4 overflow-hidden backdrop-blur-sm">
                    <h2 className="text-white font-bold text-lg mb-4 flex items-center">
                        <span className="mr-2">👷</span> Status dos Técnicos
                    </h2>
                    <div className="space-y-3 overflow-auto h-[calc(100%-40px)]">
                        {dashboard.tecnicos.map((tecnico) => (
                            <div
                                key={tecnico.id}
                                className={`rounded-lg p-3 ${tecnico.status === "disponivel"
                                    ? "bg-green-600/30 border border-green-500"
                                    : tecnico.status === "em_execucao"
                                        ? "bg-blue-600/30 border border-blue-500"
                                        : "bg-orange-600/30 border border-orange-500"
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-white font-bold">{tecnico.nome}</div>
                                        <div className="text-gray-300 text-sm">{tecnico.especialidade}</div>
                                    </div>
                                    <div
                                        className={`w-3 h-3 rounded-full ${tecnico.status === "disponivel"
                                            ? "bg-green-400"
                                            : tecnico.status === "em_execucao"
                                                ? "bg-blue-400 animate-pulse"
                                                : "bg-orange-400"
                                            }`}
                                    />
                                </div>
                                {tecnico.osAtual && (
                                    <div className="mt-2 text-sm bg-black/20 rounded p-2">
                                        <div className="text-white/90">OS{String(tecnico.osAtual.numero).padStart(6, '0')}</div>
                                        <div className="text-gray-300 truncate">{tecnico.osAtual.bem}</div>
                                        {tecnico.osAtual.localizacao && (
                                            <div className="text-xs text-cyan-300">
                                                {tecnico.osAtual.localizacao}
                                            </div>
                                        )}
                                        <div className="text-xs text-gray-400">
                                            ⏱️ {getTempoDecorrido(tecnico.osAtual.dataInicio)}
                                        </div>
                                        {tecnico.motivoPausa && (
                                            <div className="text-orange-300 text-xs mt-1">
                                                ⏸️ {tecnico.motivoPausa}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                        {dashboard.tecnicos.length === 0 && (
                            <div className="text-gray-500 text-center py-8">
                                Nenhum técnico cadastrado
                            </div>
                        )}
                    </div>
                </div>

                {/* Fila de OS - Middle Column */}
                <div className="col-span-4 row-span-5 bg-gray-800/50 rounded-xl p-4 overflow-hidden backdrop-blur-sm">
                    <h2 className="text-white font-bold text-lg mb-4 flex items-center">
                        <span className="mr-2">📋</span> Fila de Ordens de Serviço
                    </h2>
                    <div className="space-y-2 overflow-auto h-[calc(100%-40px)]">
                        {dashboard.ordensEmFila.map((ordem, index) => (
                            <div
                                key={ordem.id}
                                className={`rounded-lg p-3 ${index === 0 ? "bg-primary3/40 border-2 border-primary3" : "bg-gray-700/50"
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${getPrioridadeColor(ordem.prioridade)}`}>
                                            {ordem.prioridade?.toUpperCase()}
                                        </span>
                                        <div>
                                            <div className="text-white font-bold">OS{String(ordem.numero).padStart(6, '0')}</div>
                                            <div className="text-white text-sm truncate max-w-[220px]">
                                                {ordem.bem?.descricao}
                                            </div>
                                            <div className="text-cyan-300 text-sm truncate max-w-[200px]">
                                                {ordem.bem?.localizacao}
                                            </div>
                                            <div className="text-gray-300 text-[11px]">
                                                {ordem.tipoManutencao}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right text-lg font-medium text-cyan-300">
                                        <div>{ordem.tecnico?.nome || "Não atribuído"}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {dashboard.ordensEmFila.length === 0 && (
                            <div className="text-gray-500 text-center py-8 flex flex-col items-center">
                                <span className="text-4xl mb-2">✅</span>
                                <span>Fila vazia</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Em Execução / Pausadas - Right Column */}
                <div className="col-span-4 row-span-5 flex flex-col gap-4">
                    {/* Em Execução */}
                    <div className="flex-1 bg-green-900/30 rounded-xl p-4 overflow-hidden backdrop-blur-sm border border-green-600/30">
                        <h2 className="text-green-400 font-bold text-lg mb-3 flex items-center">
                            <span className="mr-2 animate-pulse">🔧</span> Em Execução
                        </h2>
                        <div className="space-y-2 overflow-auto h-[calc(100%-40px)]">
                            {dashboard.ordensEmExecucao.map((ordem) => (
                                <div
                                    key={ordem.id}
                                    className="bg-green-900/50 rounded-lg p-3 border border-green-600/30"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-white font-bold">OS{String(ordem.numero).padStart(6, '0')}</div>
                                            <div className="text-green-200 text-sm truncate max-w-[180px]">
                                                {ordem.bem?.descricao}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-white text-sm">{ordem.tecnico?.nome}</div>
                                            <div className="text-green-300 text-xs">
                                                ⏱️ {getTempoDecorrido(ordem.dataInicio)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {dashboard.ordensEmExecucao.length === 0 && (
                                <div className="text-green-300/50 text-center py-4">
                                    Nenhuma OS em execução
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pausadas */}
                    <div className="flex-1 bg-orange-900/30 rounded-xl p-4 overflow-hidden backdrop-blur-sm border border-orange-600/30">
                        <h2 className="text-orange-400 font-bold text-lg mb-3 flex items-center">
                            <span className="mr-2">⏸️</span> Pausadas
                        </h2>
                        <div className="space-y-2 overflow-auto h-[calc(100%-40px)]">
                            {dashboard.ordensPausadas.map((ordem) => (
                                <div
                                    key={ordem.id}
                                    className="bg-orange-900/50 rounded-lg p-3 border border-orange-600/30"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-white font-bold">OS{String(ordem.numero).padStart(6, '0')}</div>
                                            <div className="text-orange-200 text-sm truncate max-w-[180px]">
                                                {ordem.bem?.descricao}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-white text-sm">{ordem.tecnico?.nome}</div>
                                            <div className="text-orange-300 text-xs">
                                                {ordem.pausas?.[0]?.motivoPausa?.descricao || "Pausa"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {dashboard.ordensPausadas.length === 0 && (
                                <div className="text-orange-300/50 text-center py-4">
                                    Nenhuma OS pausada
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
