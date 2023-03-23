<template>
  <div v-if="visible">
    <h2>Your score: {{ score }}</h2>
    <h2>High score: {{ highScore }}</h2>
    <button @click="$emit('restartGame')">Restart game</button>
  </div>
</template>

<script>
  export default {
    name: 'ScoreScreen',
    data() {
      return {
        highScore: 0,
      };
    },
    mounted() {
      const game = this.$parent.$refs.game.__vue__;
      this.highScore = localStorage.getItem('highscore') || 0;
    },
    methods: {
      restartGame() {
        this.$emit('restartGame');
      },
    },
  };
</script>