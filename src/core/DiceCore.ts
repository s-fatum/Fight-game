import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import { toRaw } from 'vue';

// Ассеты
import imgHeart from '@/assets/dice/dice_heart.png';
import imgFist from '@/assets/dice/dice_fist.png';
import imgCrit from '@/assets/dice/dice_crit.png';
import type { StatKey } from '@/types.ts'

interface DiceSprite extends PIXI.Sprite {
    diceType: string;
    shadow: PIXI.Graphics;
}

export class DiceCore {
    private pixiApp: PIXI.Application;
    private diceSprites: DiceSprite[] = [];
    private textures: Record<string, PIXI.Texture> = {};

    constructor(app: PIXI.Application) {
        this.pixiApp = app;
    }

    /**
     * Предзагрузка текстур
     */
    async loadAssets() {
        // Теперь результат загрузки сохраняется в this.textures
        this.textures = await PIXI.Assets.load([
            { alias: 'heart', src: imgHeart },
            { alias: 'fist', src: imgFist },
            { alias: 'crit', src: imgCrit }
        ]);
    }

    /**
     * Метод отрисовки всей сетки кубиков
     * @param values - массив строк (типов кубиков), приходящий из пропсов компонента
     */
    spawnDiceGrid(values: string[]) {
        const columns = 3;
        const total = values.length; // Теперь total берется из переданного аргумента

        values.forEach((type, index) => {
            // Берем текстуру из внутреннего словаря по типу
            const texture = this.textures[type] || this.textures['heart'];

            const dice = new PIXI.Sprite(texture) as DiceSprite;
            dice.anchor.set(0.5);
            dice.scale.set(0.4);
            dice.diceType = type;
            dice.zIndex = 20;

            // Расчет позиции
            const spacingX = dice.width * 1.1;
            const spacingY = dice.height * 0.9;
            const groupW = (Math.min(total, columns) - 1) * spacingX;
            const groupH = (Math.ceil(total / columns) - 1) * spacingY;

            const startX = (this.pixiApp.screen.width / 2) - (groupW / 2);
            const startY = (this.pixiApp.screen.height / 2) - (groupH / 2);

            const finalX = startX + (index % columns * spacingX);
            const finalY = startY + (Math.floor(index / columns) * spacingY);

            // Создание тени
            const shadow = new PIXI.Graphics()
                .ellipse(0, 0, dice.width * 0.6, dice.height * 0.35)
                .fill({ color: 0xFFFFFF, alpha: 0.15 });

            const blur = new PIXI.BlurFilter();
            blur.strength = 8;
            shadow.filters = [blur];

            shadow.x = finalX;
            shadow.y = finalY + 15;
            shadow.alpha = 0;
            shadow.zIndex = 10;

            dice.shadow = shadow;
            dice.x = finalX;
            dice.y = -150;
            dice.rotation = Math.random() * 2;

            this.pixiApp.stage.addChild(shadow);
            this.pixiApp.stage.addChild(dice);
            this.diceSprites.push(dice);

            // Анимация падения
            gsap.to(dice, {
                y: finalY,
                rotation: (Math.random() * 0.4) - 0.2,
                duration: 1.2,
                delay: index * 0.08,
                ease: "bounce.out"
            });
        });
    }

    /**
     * Логика «схлопывания» кубиков
     */
    /**
     * Логика «схлопывания» кубиков с уведомлением о прогрессе
     * @param onGroupCollected - колбэк (тип_кубика, количество), вызывается в момент начала роста статов
     */
    async collectDices(onGroupCollected?: (type: StatKey, count: number) => void) {
        const groups: Record<string, DiceSprite[]> = { heart: [], fist: [], crit: [] };
        const colors: Record<string, number> = { heart: 0xFF3232, fist: 0x3296FF, crit: 0xFFD232 };

        // Группируем кубики
        this.diceSprites.forEach(s => {
            const group = groups[s.diceType]!;
            if (s && !s.destroyed && group) {
                group.push(s);
            }
        });

        let timelineDelay = 0;

        for (const [type, sprites] of Object.entries(groups) as [StatKey, any[]][]) {
            if (sprites.length === 0) continue;

            const rawSprites = sprites.map(s => toRaw(s));
            const rawShadows = sprites.map(s => toRaw(s.shadow));
            const color = colors[type] ?? 0xFFFFFF;

            // Подготовка перед анимацией (выводим на передний план)
            rawSprites.forEach(s => { s.zIndex = 100; });
            this.pixiApp.stage.sortChildren();

            const tl = gsap.timeline({ delay: timelineDelay });

            // Шаг 1: Подготовка теней и легкий взлет
            tl.to(rawShadows, {
                alpha: 0.8,
                tint: color,
                duration: 0.3,
                ease: "power2.out"
            }, 0);

            tl.to(rawShadows.map(sh => sh.scale), {
                x: 1.2,
                y: 1.2,
                duration: 0.3,
                ease: "power2.out"
            }, 0);

            tl.to(rawSprites, {
                y: "-=25",
                duration: 0.4,
                ease: "power2.out",
                stagger: 0.05
            }, 0);

            // Шаг 2: Момент "выстрела" кубиков в панель
            // Именно здесь дергаем колбэк для роста цифр в Vue
            tl.add(() => {
                if (onGroupCollected) {
                    onGroupCollected(type, sprites.length);
                }
            }, "+=0.4");

            // Шаг 3: Улет вверх и исчезновение
            const allInGroup = [...rawSprites, ...rawShadows];

            tl.to(allInGroup, {
                alpha: 0,
                y: (_, target) => (target instanceof PIXI.Sprite) ? "-=150" : "-=100",
                duration: 0.6,
                ease: "power2.in",
                stagger: 0.02
            }, "+=0.1");

            // Схлопывание масштаба (отдельно для обхода ограничений плагина)
            allInGroup.forEach((obj, _) => {
                if (obj && obj.scale) {
                    tl.to(obj.scale, {
                        x: 0.01,
                        y: 0.01,
                        duration: 0.5,
                        ease: "power2.in"
                    }, `-=0.5`); // Начинаем одновременно с улетом
                }
            });

            // Шаг 4: Очистка объектов этой группы
            tl.add(() => {
                sprites.forEach(s => {
                    if (s.shadow && !s.shadow.destroyed) s.shadow.destroy();
                    if (!s.destroyed) s.destroy();
                });
            });

            // Задержка перед следующей группой (сердца -> кулаки -> криты)
            timelineDelay += 1.2;
        }

        // Полная очистка массива после всех анимаций
        setTimeout(() => {
            this.diceSprites = [];
        }, (timelineDelay + 1) * 1000);
    }

    destroy() {
        this.diceSprites.forEach(s => {
            gsap.killTweensOf(s);
            if (s.shadow) {
                gsap.killTweensOf(s.shadow);
                s.shadow.destroy();
            }
            s.destroy();
        });
        this.diceSprites = [];
    }
}