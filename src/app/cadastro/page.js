"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserIcon, LockClosedIcon, InformationCircleIcon, QuestionMarkCircleIcon, UserPlusIcon, EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

export default function CadastroPage() {
    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        document.title = "Cadastro - Sistema de Endereçamento";
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess(false);
        setLoading(true);

        try {
            const res = await fetch("/api/auth/register-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, name, password }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess(true);
                setUsername("");
                setName("");
                setPassword("");
            } else {
                setError(data.error || "Erro ao solicitar cadastro");
            }
        } catch (err) {
            setError("Erro de conexão");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] relative flex flex-col font-sans">
            {/* Top Right Support Button */}
            <div className="absolute top-4 right-4">
                <button className="bg-white border rounded shadow-sm px-4 py-2 flex flex-col items-center justify-center text-primary3 hover:bg-gray-50 transition-colors">
                    <QuestionMarkCircleIcon className="h-6 w-6 mb-1" />
                    <span className="text-xs font-bold">Suporte</span>
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center px-4 -mt-20">
                {/* Logo Section */}
                <div className="flex flex-col items-center mb-8 space-y-8">
                    <h1 className="text-3xl text-gray-600 font-normal ">SUPRIMENTOS</h1>
                    <h2 className="text-2xl text-[#0079B8] font-normal">Solicitar Cadastro</h2>
                </div>

                <div className="w-full max-w-[400px]">
                    {success ? (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative text-center mb-4" role="alert">
                            <strong className="font-bold">Sucesso!</strong>
                            <span className="block sm:inline"> Solicitação enviada. Aguarde aprovação do administrador.</span>
                            <button
                                onClick={() => router.push("/login")}
                                className="mt-2 text-green-800 underline font-bold"
                            >
                                Voltar para Login
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                                    <span className="block sm:inline">{error}</span>
                                </div>
                            )}

                            {/* User Input */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">
                                    Usuário desejado
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <UserIcon className="h-5 w-5 text-primary3" />
                                    </div>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value.toUpperCase().replace(/\s/g, ""))}
                                        className="block w-full pl-10 pr-10 py-2.5 border border-gray-400 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary3 focus:border-primary3 sm:text-sm bg-white"
                                        placeholder="Ex: ARTHURM"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Name Input */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">
                                    Nome Completo
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <UserPlusIcon className="h-5 w-5 text-primary3" />
                                    </div>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value.toUpperCase())}
                                        className="block w-full pl-10 pr-10 py-2.5 border border-gray-400 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary3 focus:border-primary3 sm:text-sm bg-white"
                                        placeholder="Ex: ARTHUR ALVES PEREIRA MACÊDO"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Input */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">
                                    Senha
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LockClosedIcon className="h-5 w-5 text-primary3" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value.replace(/\s/g, ""))}
                                        style={{ textTransform: "none" }}
                                        className="block w-full pl-10 pr-10 py-2.5 border border-gray-400 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary3 focus:border-primary3 sm:text-sm bg-white"
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-[#40a9ff] hover:bg-[#1890ff] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                            >
                                {loading ? "Enviando..." : "Solicitar Cadastro"}
                            </button>

                            <div className="text-center mt-4">
                                <button
                                    type="button"
                                    onClick={() => router.push("/login")}
                                    className="text-sm cursor-pointer text-gray-600 hover:text-primary3 underline"
                                >
                                    Voltar para Login
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer Language/Brand */}
                <div className="mt-16 text-center space-y-4">
                    <div className="inline-flex items-center px-3 py-1 bg-white border rounded">
                        <span className="text-xs text-gray-500 mr-2">Português</span>
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                    <div className="text-gray-400 text-sm font-bold tracking-wider">
                        Suprimentos
                    </div>
                </div>
            </div>
        </div>
    );
}
