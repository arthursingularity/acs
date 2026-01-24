import React from "react";

export default function Input({
    value,
    onChange,
    placeholder,
    type = "text",
    className = "",
    autoFocus = false,
    maxLength,
    min,
    max,
    disabled = false,
    onBlur
}) {
    return (
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`
        border px-2 py-1 rounded 
        outline-none transition-all duration-200 ease-in-out
        focus:border-primary3 focus:ring-2 focus:ring-primary3/20
        placeholder:text-gray-400
        ${disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200" : "bg-white border-border hover:border-primary3"} 
        ${className}
      `}
            autoFocus={autoFocus}
            maxLength={maxLength}
            min={min}
            max={max}
            disabled={disabled}
            onBlur={onBlur}
        />
    );
}
