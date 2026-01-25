"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserIcon, LockClosedIcon, InformationCircleIcon, EyeIcon, EyeSlashIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password }),
            });

            if (res.ok) {
                // Save user info to localStorage
                localStorage.setItem("username", username);
                router.push("/");
            } else {
                const data = await res.json();
                setError(data.error || "Erro ao fazer login");
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
                <div className="flex flex-col items-center mb-8">
                    <div className="flex items-center gap-2 mb-6">
                        {/* TOTVS Logo placeholder - using text to emulate the look if image not perfect match, 
                            but using existing logo if available. The image shows a specific TOTVS logo. 
                            We will try to use the existing one but styled properly. */}
                        <img src="/imagens/logo.png" alt="TOTVS" className="h-[40px]" />
                        <span className="text-3xl font-bold text-gray-700 tracking-tight hidden">TOTVS</span>
                    </div>

                    <h1 className="text-3xl text-gray-600 font-normal mb-2">Linha Protheus</h1>
                    <h2 className="text-xl text-[#0079B8] font-normal">Boas-vindas</h2>
                </div>

                <div className="w-full max-w-[400px]">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* User Input */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">
                                Insira seu usuário
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <UserIcon className="h-5 w-5 text-primary3" />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-400 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary3 focus:border-primary3 sm:text-sm bg-white"
                                    placeholder="" // Image has no placeholder text inside, just the label above and icon
                                    required
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                    <InformationCircleIcon className="h-5 w-5 text-primary3" />
                                </div>
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">
                                Insira sua senha
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LockClosedIcon className="h-5 w-5 text-primary3" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-400 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary3 focus:border-primary3 sm:text-sm bg-white"
                                    required
                                />
                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600">
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <EyeSlashIcon className="h-5 w-5" />
                                        ) : (
                                            <EyeIcon className="h-5 w-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded border border-red-200">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className={`
                                    w-full flex justify-center py-2.5 px-4 border border-transparent rounded
                                    font-bold text-black/80 transition-colors hover:bg-primary2 hover:text-white cursor-pointer
                                    ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#A0A0A0]"}
                                `}
                            // Note: Image shows a gray button, likely meaning "disabled" until input or just style. 
                            // I'll use a darker gray or the brand blue on hover to give feedback.
                            // For accuracy to the image (which looks gray), I'll start with gray.
                            >
                                {loading ? "Entrando..." : "Entrar"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Footer */}
            <div className="py-6 flex flex-col items-center gap-4 text-gray-500">
                <div className="border border-gray-300 rounded px-3 py-1 bg-white text-sm flex items-center gap-2 cursor-pointer hover:bg-gray-50">
                    <span>Português</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
                <div className="flex items-center gap-2 mt-4 opacity-50">
                    <span className="font-bold tracking-widest text-lg">TOTVS</span>
                </div>
            </div>
        </div>
    );
}
