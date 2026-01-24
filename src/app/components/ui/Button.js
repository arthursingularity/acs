import React from "react";

export default function Button({
    children,
    variant = "primary",
    className = "",
    onClick,
    title,
    type = "button"
}) {
    const baseStyles = "rounded font-medium transition-all duration-200 active:scale-95 flex items-center justify-center select-none cursor-pointer";

    const variants = {
        primary: "bg-primary3 text-white hover:brightness-110 shadow-sm",
        outline: "border-2 border-primary3 text-primary3 hover:bg-primary3/10",
        danger: "border-2 border-primary3 text-primary3 hover:border-red-500 hover:bg-red-50 hover:text-red-600",
        ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
        icon: "p-2 border border-primary rounded hover:bg-gray-50 active:bg-gray-100"
    };

    const selectedVariant = variants[variant] || variants.primary;

    return (
        <button
            type={type}
            className={`${baseStyles} ${selectedVariant} ${className}`}
            onClick={onClick}
            title={title}
        >
            {children}
        </button>
    );
}
