"use client";

import React from "react";

/**
 * NavBarButton - Botão padronizado para a barra de ferramentas da NavBar
 * 
 * @param {string} children - Texto do botão
 * @param {Function} onClick - Callback ao clicar
 * @param {string} href - Se fornecido, abre em nova aba (window.open)
 * @param {boolean} hasDropdown - Se true, exibe seta de dropdown
 * @param {string} className - Classes CSS adicionais
 * @param {boolean} disabled - Se true, desabilita o botão
 */
export default function NavBarButton({
    children,
    onClick,
    href,
    hasDropdown = false,
    className = "",
    disabled = false,
}) {
    const handleClick = () => {
        if (disabled) return;
        if (href) {
            window.open(href, "_blank");
        } else if (onClick) {
            onClick();
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={disabled}
            className={`border-2 border-primary3 h-[23px] rounded text-primary3 px-2 buttonHover2 font-bold tracking-wide text-[11px] ${hasDropdown ? "flex items-center gap-1" : ""
                } ${disabled ? "opacity-50 cursor-not-allowed" : ""} ${className}`}
        >
            {children}
            {hasDropdown && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#0000A6">
                    <path d="M7 10l5 5 5-5z" />
                </svg>
            )}
        </button>
    );
}
