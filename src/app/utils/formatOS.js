/**
 * Formata o número da OS no padrão OS + 6 dígitos
 * Ex: 1 -> OS000001, 818996 -> OS818996
 */
export function formatarNumeroOS(numero) {
    if (!numero) return '';
    return `OS${String(numero).padStart(6, '0')}`;
}

/**
 * Extrai o número da OS de uma string formatada
 * Ex: OS000001 -> 1, OS818996 -> 818996
 */
export function extrairNumeroOS(osFormatada) {
    if (!osFormatada) return null;
    const match = osFormatada.match(/OS(\d+)/);
    return match ? parseInt(match[1], 10) : null;
}
