<template>
  <div>
    <div ref="game" style="display: none;"></div>
    <ScoreScreen ref="scoreScreen" />
  </div>
</template>

<script>
    import Phaser from 'phaser';
    import { gameScene } from '@/game/scene.js';
    import { gameOptions } from '@/game/config.js';
    import PhaserMatterCollisionPlugin from "phaser-matter-collision-plugin";

    import ScoreScreen from './ScoreScreen.vue';

    export default {
        components: {
            ScoreScreen
        },
        mounted() {
            const game = new Phaser.Game({
                type: Phaser.AUTO,
                scale: {
                    mode: Phaser.Scale.FIT,
                    autoCenter: Phaser.Scale.CENTER_BOTH,
                    parent: "game",
                    width: 640,
                    height: 960
                },
                physics: {
                    default: "matter",
                    matter: {
                        gravity: {
                            y: gameOptions.gravity
                        }
                    }
                },
                plugins: {
                    scene: [
                        {
                        plugin: PhaserMatterCollisionPlugin,
                        key: "matter",
                        mapping: "matter"
                        }
                    ]
                },

                scene: gameScene,
                parent: this.$refs.game,
            });

            game.events.on('gameOver', (score) => {
                this.$refs.scoreScreen.score = score;
                this.$refs.scoreScreen.highScore = localStorage.getItem('highscore') || 0;
                this.$refs.scoreScreen.visible = true;
            });
        },
        methods: {
            restartGame() {
                this.$refs.scoreScreen.visible = false;
                // Reset game state
                this.score = 0;
                this.timer = 0;
                // Hide the score screen
                this.$refs.scoreScreen.visible = false;
                // Start a new game
                this.$refs.game.emitter.emit('gameRestart');
            }
        }
    };
</script>