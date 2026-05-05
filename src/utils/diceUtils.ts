import type { DiceValue } from '@/types';

/**
 * Преобразует объект diceValues вида { heart: 2, fist: 3, crit: 1 } в массив кубиков.
 */
export function expandDiceValues(diceValues: Record<DiceValue, number>): DiceValue[] {
    const result: DiceValue[] = [];
    for (const [type, count] of Object.entries(diceValues) as [DiceValue, number][]) {
        for (let i = 0; i < count; i++) {
            result.push(type);
        }
    }
    return result;
}

/**
 * Перемешивает массив
 */
export function shuffleArray<T>(array: T[]): T[] {
    const shuffled = array.slice(); // создаём копию
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = shuffled[i];
        shuffled[i] = shuffled[j]!;
        shuffled[j] = temp!;
    }
    return shuffled;
}

/**
 * Генерирует перемешанный массив кубиков из diceValues.
 */
export function generateShuffledDiceArray(diceValues: Record<DiceValue, number>): DiceValue[] {
    const expanded = expandDiceValues(diceValues);
    return shuffleArray(expanded);
}