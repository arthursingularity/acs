"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function StamConecta() {
    const router = useRouter();
    const [userName, setUserName] = useState("");
    const [setor, setSetor] = useState("");
    const [setorCodigo, setSetorCodigo] = useState("");
    const [setores, setSetores] = useState([]);
    const [modalSetor, setModalSetor] = useState(false);
    const [loadingSetores, setLoadingSetores] = useState(false);

    useEffect(() => {
        document.title = "Stam Conecta";
        // Buscar dados do usuário logado
        const storedName = localStorage.getItem("nome") || localStorage.getItem("username") || "USUÁRIO";
        const storedSetor = localStorage.getItem("setorDescricao") || "";
        const storedSetorCodigo = localStorage.getItem("setorCodigo") || "";
        setUserName(storedName.toUpperCase());
        setSetor(storedSetor.toUpperCase());
        setSetorCodigo(storedSetorCodigo);
    }, []);

    const fetchSetores = async () => {
        setLoadingSetores(true);
        try {
            const response = await fetch("/api/setores");
            if (response.ok) {
                const data = await response.json();
                setSetores(data);
            }
        } catch (error) {
            console.error("Erro ao buscar setores:", error);
        } finally {
            setLoadingSetores(false);
        }
    };

    const handleOpenSetorModal = () => {
        fetchSetores();
        setModalSetor(true);
    };

    const handleSelectSetor = (setorSelecionado) => {
        setSetor(setorSelecionado.descricao.toUpperCase());
        setSetorCodigo(setorSelecionado.centroCusto);
        // Salvar no localStorage
        localStorage.setItem("setorDescricao", setorSelecionado.descricao.toUpperCase());
        localStorage.setItem("setorCodigo", setorSelecionado.centroCusto);
        setModalSetor(false);
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("nome");
        localStorage.removeItem("setorDescricao");
        localStorage.removeItem("setorCodigo");
        router.push("/login");
    };

    return (
        <div className="min-h-screen bg-stamOrange flex flex-col">
            {/* Logo */}
            <div className="flex justify-center pt-8 pb-6">
                <img
                    src="/imagens/logostamconectafundolaranja.png"
                    alt="Stam Conecta"
                    className="w-[180px]"
                />
            </div>

            {/* Setor Banner - Clicável para selecionar setor */}
            <div className="mx-6 mb-6">
                <button
                    onClick={handleOpenSetorModal}
                    className="w-full bg-white border-l-4 border-green-500 py-3 px-4 shadow-md hover:bg-gray-50 transition-colors cursor-pointer"
                >
                    <p className="text-center font-bold text-gray-800 text-sm tracking-wide">
                        {setor || "CLIQUE PARA SELECIONAR O SETOR"}
                    </p>
                </button>
            </div>

            {/* Nome do Usuário */}
            <div className="text-center mb-8">
                <p className="text-gray-800 font-bold text-lg tracking-wide">
                    {userName}
                </p>
            </div>

            {/* Botões */}
            <div className="flex flex-col gap-4 px-8">
                <button
                    className="buttonHover bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-all active:scale-95"
                >
                    APONTAMENTO DE PRODUÇÃO
                </button>

                <button
                    className="buttonHover bg-gray-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-all active:scale-95"
                >
                    COLABORADORES
                </button>

                <button
                    onClick={() => router.push("/stamconecta/recursos")}
                    className="buttonHover bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-all active:scale-95"
                >
                    RECURSOS
                </button>

                <button
                    onClick={handleLogout}
                    className="buttonHover bg-rose-600 hover:bg-rose-600 text-white font-bold py-4 px-6 rounded-lg shadow-lg transition-all active:scale-95"
                >
                    SAIR
                </button>
            </div>

            {/* Modal de Seleção de Setor */}
            {modalSetor && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl">
                        {/* Header */}
                        <div className="bg-stamOrange text-white px-4 py-3 rounded-t-xl flex justify-between items-center">
                            <h3 className="font-bold text-lg">Selecionar Setor</h3>
                            <button
                                onClick={() => setModalSetor(false)}
                                className="text-white text-2xl hover:opacity-80"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Lista de Setores */}
                        <div className="flex-1 overflow-auto">
                            {loadingSetores ? (
                                <div className="p-8 text-center text-gray-500">
                                    Carregando setores...
                                </div>
                            ) : setores.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    Nenhum setor encontrado
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {setores.map((s) => (
                                        <button
                                            key={s.centroCusto}
                                            onClick={() => handleSelectSetor(s)}
                                            className={`w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors ${setorCodigo === s.centroCusto ? 'bg-orange-100 border-l-4 border-stamOrange' : ''
                                                }`}
                                        >
                                            <p className="font-bold text-gray-800">{s.descricao}</p>
                                            <p className="text-sm text-gray-500">{s.centroCusto}</p>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}