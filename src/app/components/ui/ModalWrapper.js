import React from "react";

export default function ModalWrapper({
    isOpen,
    onClose,
    title,
    children,
    className = "w-[390px]",
    headerContent
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px] animate-backdrop-enter transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className={`relative bg-white shadow-2xl rounded-lg overflow-hidden z-10 animate-modal-enter ${className}`}>
                {/* Header */}
                <div className="flex justify-between items-center bg-blackGradient text-white px-4 py-3 text-sm font-semibold select-none">
                    {title ? <span>{title}</span> : <div></div>}

                    <div className="flex items-center space-x-3">
                        {headerContent}
                        <div onClick={onClose} className="cursor-pointer hover:opacity-75 transition-opacity">
                            <img src="/imagens/close3.svg" className="w-[20px]" alt="Fechar" />
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    );
}
