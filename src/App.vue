<template>
  <div>
    <div v-if="!showGame">
      <registration-form v-on:formSubmitted="startGame"></registration-form>
    </div>
    <div v-else>
      <Game ref="game" v-on:gameOver="showScoreScreen($event)" />
      <ScoreScreen v-if="showScore" v-bind:score="score" v-on:restartGame="restartGame" />
    </div>
  </div>
</template>

<script>
  import RegistrationForm from './components/RegistrationForm.vue'
  import Game from './components/Game.vue';
  import ScoreScreen from './components/ScoreScreen.vue';

  export default {
    name: 'App',
    components: {
      RegistrationForm,
      Game,
      ScoreScreen,
    },
    data() {
      return {
        showGame: false,
        showScore: false,
        score: 0,
      };
    },
    methods: {
      startGame() {
        this.showGame = true;
      },
      showScoreScreen(score) {
        // Show the score screen when the game ends
        this.showScore = true;
        this.score = score;
      },
      restartGame() {
        // Restart the game by hiding the score screen and resetting the game
        this.showScore = false;
        this.showGame = false;
        this.$nextTick(() => {
          this.showGame = true;
        });
      },
    },
  };
</script>