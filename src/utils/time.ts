/**
 * Пауза в выполнении кода
 * @param ms - миллисекунды
 */
export const delay = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};