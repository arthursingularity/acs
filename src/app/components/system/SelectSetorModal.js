"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ModalWrapper from "../ui/ModalWrapper";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { SETORES_DB } from "./Database";

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
        <ModalWrapper
            isOpen={isOpen}
            onClose={onClose}
            title="Escolha de Centro de Custo"
            className="w-[420px]"
        >
            <div className="flex flex-col">
                <label className="block font-bold mb-1">
                    Centro de Custo
                </label>

                <div className="flex items-center space-x-1 w-[200px]">
                    <Input
                        autoFocus
                        value={centroCusto}
                        onChange={(e) => setCentroCusto(e.target.value)}
                        className="flex-1 border-3 border-border hover:border-primary"
                    />
                    <div className="px-[3px] flex font-bold items-center bg-white justify-center border-2 rounded border-black buttonHover py-0 h-[34px] cursor-pointer">
                        ?
                    </div>
                </div>
                <Button
                    onClick={handleConfirm}
                    variant="outline"
                    className="border-3 font-bold h-10 mt-5 w-full justify-center"
                >
                    Confirmar
                </Button>

                <div className="mt-4 border-t pt-2">
                    <p className="text-sm font-bold text-gray-500 mb-2">Disponíveis:</p>
                    <div className="overflow-y-auto max-h-[200px] border rounded bg-gray-50">
                        {SETORES_DB.map((s) => (
                            <div
                                key={s.centroCusto}
                                onClick={() => {
                                    setCentroCusto(s.centroCusto);
                                    // Optional: auto-navigate on click
                                    // router.push(`/${s.centroCusto}`);
                                    // onClose();
                                }}
                                className="p-2 text-sm border-b cursor-pointer hover:bg-blue-100 flex justify-between"
                            >
                                <span>{s.centroCusto}</span>
                                <span className="text-gray-600">{s.descricao}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </ModalWrapper>
    );
}