import React from 'react';

export default function StoragePreview({ type, height }) {
    if (!type || !height || height < 1) return null;

    const items = Array.from({ length: Math.min(Number(height), 12) }); // Limit preview to 12 to avoid screen overflow
    const count = Number(height);
    const overflow = count > 12;

    return (
        <div
            className="fixed top-1/2 left-1/2 ml-[200px] -translate-y-1/2 bg-white rounded-lg shadow-2xl z-[1000] p-2 flex flex-col items-center justify-end animate-modal-enter w-[110px] h-[392px] border border-gray-200"
            style={{ maxHeight: '80vh' }}
        >
            <div className="w-full overflow-y-auto custom-scrollbar flex flex-col items-center">
                <div className='relative'>
                    {/* PREVIA COLUNA (CAIXAS) */}
                    {type === "COLUNA" && (
                        <div className="w-full flex flex-col items-center">
                            {items.map((_, i) => (
                                <div key={i} className="w-[92px] relative rounded-xs shadow-sm flex items-center justify-center group overflow-hidden">
                                    <img src='/imagens/caixa.jpeg' />
                                </div>
                            ))}
                        </div>
                    )}
                </div>


                {/* PREVIA NIVEL (ESTANTE LARANJA + GAVETAS PRETAS) */}
                {type === "NIVEL" && (
                    <div className="w-full bg-stamOrange p-2 rounded-sm border-2 border-orange-700 flex flex-col gap-2 pb-2 shadow-lg">
                        {items.map((_, i) => (
                            <div key={i} className="relative">
                                {/* Gaveta Preta */}
                                <div className="w-full h-[40px] bg-gray-900 rounded-sm border-t border-gray-700 shadow-md flex items-center justify-center relative overflow-hidden">
                                    {/* Brilho plastico */}
                                    <div className="absolute top-0 left-0 w-full h-[10px] bg-gradient-to-b from-gray-700/30 to-transparent"></div>
                                    {/* Etiqueta frontal simulada */}
                                    <div className="w-[40%] h-[8px] bg-gray-600/30 border border-gray-600/50 rounded-[1px]"></div>
                                </div>
                                {/* Prateleira Laranja (separador) abaixo da gaveta */}
                                {i < items.length - 1 && (
                                    <div className="absolute -bottom-[5px] left-0 w-full h-[2px] bg-orange-800/50"></div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {overflow && (
                    <div className="mt-2 text-xs text-gray-500 italic text-center w-full">
                        + {count - 12} outros itens...
                    </div>
                )}
            </div>
        </div>
    );
}
