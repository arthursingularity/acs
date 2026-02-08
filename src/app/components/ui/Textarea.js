import React from "react";

export default function Textarea({
    value,
    onChange,
    placeholder,
    className = "",
    rows = 4,
    disabled = false,
    maxLength,
    uppercase = true // Converter automaticamente para maiúsculas
}) {
    // Handler para converter para maiúsculas automaticamente
    const handleChange = (e) => {
        if (uppercase) {
            const upperValue = e.target.value.toUpperCase();
            const syntheticEvent = {
                ...e,
                target: {
                    ...e.target,
                    value: upperValue
                }
            };
            onChange(syntheticEvent);
        } else {
            onChange(e);
        }
    };

    return (
        <textarea
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            rows={rows}
            maxLength={maxLength}
            disabled={disabled}
            style={uppercase ? { textTransform: 'uppercase' } : {}}
            className={`
                w-full border px-3 py-2 rounded resize-none
                outline-none transition-all duration-200 ease-in-out
                focus:border-primary3 focus:ring-2 focus:ring-primary3/20
                placeholder:text-gray-400
                ${disabled ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200" : "bg-white border-border hover:border-primary3"} 
                ${className}
            `}
        />
    );
}
