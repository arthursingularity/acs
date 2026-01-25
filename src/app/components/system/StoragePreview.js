import React from 'react';

export default function StoragePreview({ type, height, tipoCaixa, levels }) {
    if (!type || !height || height < 1) return null;

    const items = Array.from({ length: Math.min(Number(height), 12) }); // Limit preview to 12 to avoid screen overflow
    const count = Number(height);
    const overflow = count > 12;

    return (
        <div
            className={`fixed top-1/2 left-1/2 ml-[200px] -translate-y-1/2 bg-white rounded-lg shadow-2xl z-[1000] p-2 flex flex-col items-center justify-end animate-modal-enter ${tipoCaixa != "COLUNA" ? "h-[382px]" : "h-[392px]"} w-[110px] border border-gray-200`}
            style={{ maxHeight: '80vh' }}
        >
            <div className="w-full overflow-y-auto custom-scrollbar flex flex-col items-center">
                <div className='relative'>
                    {/* PREVIA COLUNA (CAIXAS) */}
                    {tipoCaixa === "COLUNA" && (
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
                {(tipoCaixa === "GAVETA G" ||
                    tipoCaixa === "GAVETA M" ||
                    tipoCaixa === "GAVETA P") && (
                        <div className="w-full bg-stamOrange p-1 rounded-xs border-2 border-stamOrange flex flex-col gap-1.5 shadow-lg">
                            {items.map((_, i) => {
                                // Calculate level index (visual top is highest level)
                                // levels array: index 0 = Level 1
                                const levelIndex = count - 1 - i;
                                const hasDivisoria = levels && levels[levelIndex] ? levels[levelIndex].isDivisoria : false;

                                return (
                                    <div key={i} className="relative">
                                        {hasDivisoria ? (
                                            /* Two Drawers Side-by-Side */
                                            <div className="flex w-full gap-[3px]">
                                                <div className="w-1/2 h-[45px] bg-neutral-900 rounded border-t border-gray-700 shadow-md flex items-center justify-center relative overflow-hidden">
                                                    <div className="mt-[45px] left-0 w-full h-full bg-gray-600/45">
                                                        <div className='w-full bg-gray-600/30 h-[12px] flex justify-center'>
                                                            <div className="w-[55%] h-[8px] mt-[2px] flex justify-end bg-black rounded-[1px]">
                                                                <img src='/imagens/icon.png' />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="w-1/2 h-[45px] bg-neutral-900 rounded border-t border-gray-700 shadow-md flex items-center justify-center relative overflow-hidden">
                                                    <div className="mt-[45px] left-0 w-full h-full bg-gray-600/45">
                                                        <div className='w-full bg-gray-600/30 h-[12px] flex justify-center'>
                                                            <div className="w-[55%] h-[8px] mt-[2px] flex justify-end bg-black rounded-[1px]">
                                                                <img src='/imagens/icon.png' />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Single Drawer */
                                            <div className="w-full h-[45px] bg-black rounded shadow-md flex items-center justify-center relative overflow-hidden">
                                                <div className="mt-[45px] left-0 w-full h-full bg-gray-600/45">
                                                    <div className='w-full bg-gray-600/30 h-[12px] flex justify-center'>
                                                        <div className="w-[40%] h-[8px] mt-[2px] flex justify-end bg-black rounded-[1px]">
                                                            <img src='/imagens/icon.png' />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Prateleira Laranja (separador) abaixo da gaveta */}
                                        {i < items.length - 1 && (
                                            <div className="absolute left-0 w-full h-[7px] bg-stamOrange"></div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
            </div>
        </div>
    );
}
