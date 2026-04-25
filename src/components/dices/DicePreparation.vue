<template>
    <div class="dice-preparation-screen" :style="backgroundStyle">
        <div class="hud-frame dice-layout">

            <div class="dice-canvas-section">
                <div ref="pixiContainer" class="pixi-wrapper"></div>
                <div class="scanner-line"></div>
                <div class="corner-label">MODIFICATION_ZONE</div>
            </div>

            <div class="boosts-section">
                <div class="section-header">УСИЛЕНИЯ</div>
                <div class="boosts-list">
                    <div v-for="(stat, key) in displayBoosts" :key="key"
                         class="boost-row" :class="{ 'has-value': stat > 0 }">
                        <div class="stat-name">{{ key.toUpperCase() }}</div>
                        <div class="stat-value">+{{ Math.round(stat) }}{{ key === 'crit' ? '%' : '%' }}</div>
                    </div>
                </div>
            </div>

            <div class="player-profile">
                <div class="hero-showcase">
                    <div class="hero-name-tag">{{ selectedFighter.name }}</div>
                    <div class="big-avatar-frame">
                        <img :src="heroAvatar" class="hero-img">
                        <div class="frame-glare"></div>
                    </div>
                </div>

                <div class="player-stats">
                    <div v-for="(val, key) in playerStats" :key="key" class="stat-bar-container">
                        <div class="stat-info">
                            <span>{{ key.toUpperCase() }}</span>
                            <span class="current-val">{{ Math.round(val.current) }}</span>
                        </div>
                        <div class="bar-bg">
                            <div class="bar-fill"
                                 :style="{ width: (val.current / val.max * 100) + '%', backgroundColor: val.color }">
                                <div class="bar-glow"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, markRaw } from 'vue';
import { pixiManager } from '@/core/pixiApp';
import { DiceCore } from '@/core/DiceCore';
import gsap from 'gsap';

export default defineComponent({
    props: {
        selectedFighter: { type: Object, default: () => ({ name: 'ФЛЕШКА', avatar_hero: 'flash_h.jpg' }) },
        values: { type: Array as () => string[], default: () => ['heart', 'fist', 'crit', 'fist', 'heart'] }
    },
    data() {
        return {
            diceCore: null as DiceCore | null,
            // Для анимации цифр в центральной панели
            displayBoosts: { heart: 0, fist: 0, crit: 0 },
            // Для анимации полосок игрока
            playerStats: {
                hp:   { current: 100, max: 200, color: '#42ff78' },
                atk:  { current: 15,  max: 100, color: '#ffb342' },
                crit: { current: 10,  max: 100, color: '#c442ff' }
            }
        };
    },
    computed: {
        heroAvatar() {
            return new URL(`/src/assets/characters/avatars/${this.selectedFighter.avatar_hero}`, import.meta.url).href;
        },
        backgroundStyle() {
            return { background: `url(${new URL('@/assets/locations/hangar_bg.jpg', import.meta.url).href}) center/cover no-repeat` };
        }
    },
    async mounted() {
        const container = this.$refs.pixiContainer as HTMLElement;
        const app = markRaw(await pixiManager.init({ resizeTo: container, manageStyles: false }));

        if (container && app.canvas) {
            container.appendChild(app.canvas);
            pixiManager.forceResize(container.clientWidth, container.clientHeight);
        }

        this.diceCore = new DiceCore(app);
        await this.diceCore.loadAssets();
        this.diceCore.spawnDiceGrid(this.values);

        setTimeout(() => {
            this.diceCore?.collectDices((type, count) => {
                this.animateStatGrowth(type, count);
            });
        }, 2000);
    },
    methods: {
        animateStatGrowth(type: string, count: number) {
            const increments: any = { heart: 10, fist: 15, crit: 2 };
            const statMap: any = { heart: 'hp', fist: 'atk', crit: 'crit' };

            // 1. Анимация цифр в центральной колонке
            gsap.to(this.displayBoosts, {
                [type]: this.displayBoosts[type as keyof typeof this.displayBoosts] + (count * increments[type]),
                duration: 1,
                ease: "power1.out"
            });

            // 2. Анимация полосок здоровья/атаки игрока
            const targetStat = statMap[type];
            if (targetStat) {
                gsap.to(this.playerStats[targetStat as keyof typeof this.playerStats], {
                    current: this.playerStats[targetStat as keyof typeof this.playerStats].current + (count * increments[type]),
                    duration: 1.2,
                    ease: "back.out(1.7)"
                });
            }
        }
    },
    beforeUnmount() {
        this.diceCore?.destroy();
        pixiManager.purge();
    }
});
</script>

<style scoped lang="scss">
.dice-preparation-screen {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #050505; // Фоллбэк
}

.dice-layout {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr 1fr;
    width: 90%;
    max-width: 1400px;
    height: 700px;
    position: relative;

    padding: 40px;
    background: rgba(0, 178, 255, 0.02);
    backdrop-filter: blur(2px) saturate(150%);
    -webkit-backdrop-filter: blur(2px);
    border-radius: 12px;
    border: 2px solid rgba(76, 201, 255, 0.75);
    overflow: hidden;;
    box-shadow:
        0 0 10px rgba(17, 61, 85, 0.4),
        0 0 20px 2px rgba(45, 77, 96, 0.61),
        0 0 1px 1px #405765;
}

.dice-canvas-section {
    position: relative;
    border-right: 1px solid rgba(76, 201, 255, 0.3);
    background: rgba(0, 0, 0, 0.5);

    .pixi-wrapper { width: 100%; height: 100%; }
}

.boosts-section {
    padding: 40px;
    background: rgba(76, 201, 255, 0.03);
    display: flex;
    flex-direction: column;
    justify-content: center;

    .section-header {
        font-size: 2rem;
        color: #4cc9ff;
        text-shadow: 0 0 10px #4cc9ff;
        margin-bottom: 50px;
        text-align: center;
    }

    .boost-row {
        margin-bottom: 30px;
        transition: all 0.3s;
        &.has-value { transform: scale(1.1); color: #ffb700; }
    }

    .stat-name { font-size: 1.2rem; color: #888; }
    .stat-value { font-size: 2.5rem; font-weight: 800; }
}

.player-profile {
    padding: 40px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.big-avatar-frame {
    width: 320px;
    height: 320px;
    margin: 0 auto;
    position: relative;
    border: 3px solid #ff00ff; // Неоновый пурпур
    box-shadow: 0 0 20px rgba(255, 0, 255, 0.4);

    .hero-img { width: 100%; height: 100%; object-fit: cover; }
}

.hero-name-tag {
    font-size: 2rem;
    color: #fff;
    text-align: center;
    margin-bottom: 20px;
    letter-spacing: 5px;
}

.stat-bar-container {
    margin-top: 20px;

    .stat-info {
        display: flex;
        justify-content: space-between;
        color: #fff;
        font-size: 0.9rem;
        margin-bottom: 5px;
    }

    .bar-bg {
        height: 15px;
        background: rgba(255,255,255,0.1);
        border-radius: 10px;
        overflow: hidden;
    }

    .bar-fill {
        height: 100%;
        transition: width 0.1s ease-out;
        position: relative;
    }

    .bar-glow {
        position: absolute;
        right: 0; top: 0; bottom: 0; width: 10px;
        background: #fff; filter: blur(5px);
    }
}
</style>