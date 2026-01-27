"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import NavBar from "../components/ui/NavBar";

export default function BuscarEnderecoPage() {
    const [centroCusto, setCentroCusto] = useState("");
    const [codigo, setCodigo] = useState("");
    const [descricao, setDescricao] = useState("");
    const [loading, setLoading] = useState(false);
    const [resultados, setResultados] = useState(null);
    const [error, setError] = useState("");

    // Autocomplete
    const [sugestoes, setSugestoes] = useState([]);
    const [showSugestoes, setShowSugestoes] = useState(false);
    const [loadingSugestoes, setLoadingSugestoes] = useState(false);
    const descricaoRef = useRef(null);
    const sugestoesRef = useRef(null);

    // Fechar sugestões ao clicar fora
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                descricaoRef.current &&
                !descricaoRef.current.contains(e.target) &&
                sugestoesRef.current &&
                !sugestoesRef.current.contains(e.target)
            ) {
                setShowSugestoes(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Buscar sugestões quando descrição mudar
    useEffect(() => {
        if (!descricao || descricao.length < 2 || !centroCusto) {
            setSugestoes([]);
            return;
        }

        const timer = setTimeout(async () => {
            setLoadingSugestoes(true);
            try {
                const res = await fetch(
                    `/api/sugerir-produtos?centroCusto=${encodeURIComponent(centroCusto)}&query=${encodeURIComponent(descricao)}`
                );
                const data = await res.json();
                setSugestoes(data.sugestoes || []);
                setShowSugestoes(true);
            } catch (err) {
                console.error("Erro ao buscar sugestões:", err);
            } finally {
                setLoadingSugestoes(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [descricao, centroCusto]);

    const handleSelectSugestao = (sugestao) => {
        setCodigo(sugestao.codigo);
        setDescricao(sugestao.descricao);
        setShowSugestoes(false);
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setError("");
        setResultados(null);

        if (!centroCusto.trim()) {
            setError("Preencha o centro de custo");
            return;
        }

        if (!codigo.trim() && !descricao.trim()) {
            setError("Preencha o código ou a descrição do produto");
            return;
        }

        setLoading(true);
        setShowSugestoes(false);

        try {
            // Usar código se preenchido, senão usar descrição
            const query = codigo.trim() || descricao.trim();

            const res = await fetch(
                `/api/buscar-endereco?centroCusto=${encodeURIComponent(centroCusto)}&query=${encodeURIComponent(query)}`
            );

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || "Erro ao buscar endereços");
                return;
            }

            setResultados(data);
        } catch (err) {
            setError("Erro de conexão com o servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 overflow-y-auto">
            <NavBar />
            {/* Conteúdo Principal */}
            <main className="max-w-6xl mx-auto px-4 py-8 mt-20">
                {/* Formulário de Busca */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4 flex items-center">
                        Pesquisar Produto
                    </h2>

                    <form onSubmit={handleSearch} className="space-y-4">
                        <div className="flex space-x-2 w-full">
                            {/* Centro de Custo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Centro de Custo
                                </label>
                                <input
                                    type="text"
                                    value={centroCusto}
                                    onChange={(e) => setCentroCusto(e.target.value)}
                                    placeholder="Ex: 315111"
                                    className="md:w-48 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary3 focus:border-transparent transition-all outline-none"
                                />
                            </div>
                            {/* Busca por Código */}
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Buscar por Código
                                </label>
                                <input
                                    type="text"
                                    value={codigo}
                                    onChange={(e) => {
                                        setCodigo(e.target.value);
                                        if (e.target.value) setDescricao("");
                                    }}
                                    placeholder="Ex: 11012000001"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary3 focus:border-transparent transition-all outline-none font-mono"
                                />
                            </div>
                        </div>
                        {/* Busca por Descrição com Autocomplete */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-600 mb-1">
                                Buscar por Descrição
                            </label>
                            <div className="relative">
                                <input
                                    ref={descricaoRef}
                                    type="text"
                                    value={descricao}
                                    onChange={(e) => {
                                        setDescricao(e.target.value);
                                        if (e.target.value) setCodigo("");
                                    }}
                                    onFocus={() => sugestoes.length > 0 && setShowSugestoes(true)}
                                    placeholder="Ex: TRINCO 501"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary3 focus:border-transparent transition-all outline-none"
                                />
                                {loadingSugestoes && (
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        <svg className="animate-spin h-5 w-5 text-gray-400" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Popup de Sugestões */}
                            {showSugestoes && sugestoes.length > 0 && (
                                <div
                                    ref={sugestoesRef}
                                    className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto"
                                >
                                    {sugestoes.map((sugestao, index) => (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => handleSelectSugestao(sugestao)}
                                            className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0 transition-colors"
                                        >
                                            <div className="font-medium text-gray-800 text-sm">
                                                {sugestao.descricao}
                                            </div>
                                            <div className="text-xs text-gray-500 font-mono mt-1">
                                                Código: {sugestao.codigo}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full md:w-auto px-8 py-3 cursor-pointer rounded-lg font-bold text-white transition-all ${loading
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-primary hover:bg-primary2 active:scale-95"
                                }`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center space-x-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    <span>Buscando...</span>
                                </span>
                            ) : (
                                "Pesquisar"
                            )}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                            ⚠️ {error}
                        </div>
                    )}
                </div>

                {/* Resultados */}
                {resultados && (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        {/* Header dos resultados */}
                        <div className="bg-primary2 text-white p-6">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2">
                                <h3 className="text-xl font-bold">Resultados da Busca</h3>
                                <p className="text-white text-lg">
                                    {resultados.setor.descricao}
                                </p>
                                <div className="flex items-center space-x-4 mt-1">
                                    <div className="bg-primary px-4 py-2 rounded-lg">
                                        <span className="text-2xl font-bold">{resultados.total}</span>
                                        <span className="text-sm ml-1">endereço(s) encontrado(s).</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabela de resultados */}
                        {resultados.enderecos.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                                Endereço
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                                Código
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                                Descrição
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                                Rua
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                                Coluna
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                                Nível
                                            </th>
                                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                                                Observação
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {resultados.enderecos.map((item, index) => (
                                            <tr
                                                key={index}
                                                className="hover:bg-blue-50 transition-colors"
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex items-center px-3 py-1 rounded text-sm font-bold bg-primary3 text-white">
                                                        {item.endereco}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                                                    {item.produto}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-900 font-medium max-w-xs truncate">
                                                    {item.descricao}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-white text-center">
                                                    <span className="bg-primary2 px-2 py-1 rounded font-bold">
                                                        {item.rua}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                                                    {item.coluna}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 text-center">
                                                    {item.nivel}
                                                    {item.divisoria && (
                                                        <span className="ml-1 text-xs text-primary3">
                                                            ({item.divisoria})
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                                                    {item.observacao || "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <div className="text-6xl mb-4">📦</div>
                                <h4 className="text-xl font-semibold text-gray-700">Nenhum resultado encontrado</h4>
                                <p className="text-gray-500 mt-2">
                                    Não foi encontrado nenhum endereço com o produto "{resultados.query}" no setor {resultados.setor.centroCusto}.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
