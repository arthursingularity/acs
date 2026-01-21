"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SelectSetorModal({ isOpen, onClose }) {
    const [centroCusto, setCentroCusto] = useState("");
    const router = useRouter();

    if (!isOpen) return null;

    function handleConfirm() {
        if (!centroCusto.trim()) return;
        router.push(`/${centroCusto}`);
        onClose();
    }

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40">
            <div className="bg-white w-[420px] shadow-2xl">
                {/* HEADER */}
                <div className="flex justify-between items-center bg-blackGradient text-white px-3 py-2 text-sm font-semibold">
                    <span>Escolha de Centro de Custo</span>
                    <div onClick={onClose}>
                        <img src="/imagens/close3.svg" className="w-[20px] buttonHover"/>
                    </div>
                </div>

                {/* BODY */}
                <div className="p-4">
                    <label className="block font-bold mb-1">
                        Centro de Custo
                    </label>

                    <div className="flex items-center space-x-1 w-[200px]">
                        <input
                            autoFocus
                            value={centroCusto}
                            onChange={(e) => setCentroCusto(e.target.value)}
                            className="flex-1 border-3 border-border rounded px-1 hover:border-primary"
                        />
                        <div className="px-[3px] flex font-bold items-center bg-white justify-center border-2 rounded border-black buttonHover">
                            ?
                        </div>
                    </div>
                    <button
                        onClick={handleConfirm}
                        className="border-3 font-bold border-primary3 h-full rounded text-primary3 px-2 buttonHover2 mt-5"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    );
}