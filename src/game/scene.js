import { gameOptions } from '@/game/config.js';

export class gameScene extends Phaser.Scene {
    constructor() {
        super('PlayGame');
    }

    preload(){
        this.load.image("ground", "ground@3x.png");
        this.load.image("background", "background@3x.png");
        this.load.atlas("items", "sprite_stacking@3x.png", "sprite_stacking_atlas@3x.json");
        this.load.image('stackHeightTexture', 'tilesprite_highscore@3x.png');
        this.load.bitmapFont("font", "fonts/font.png", "fonts/font.fnt");

        this.load.json('itemShapes', 'physics_json@3x.json');
        this.load.json('groundShape', 'ground_physics_json@3x.json');
    }
    
    create(){
        this.emitter = new Phaser.Events.EventEmitter();

        this.itemShapes = this.cache.json.get('itemShapes');
        this.groundShape = this.cache.json.get('groundShape');

        this.score = 0;
        this.highScore = 0;
        this.stackHeightLine = null;

        this.matter.world.update30Hz();
        this.canDrop = true;
        this.timer = 0;
        this.timerEvent = null;
        this.addBackground();
        this.addGround();
        this.addMovingItem();
        this.timeText = this.add.bitmapText(10, 10, "font", gameOptions.timeLimit.toString(), 72);
        this.itemGroup = this.add.group();

        this.matter.world.on("collisionstart", this.checkCollision, this);
        this.setCameras();
        this.input.on("pointerdown", this.dropItem, this);

        this.scoreText = this.add.bitmapText(this.sys.game.config.width - 10, 10, "font", "Score: " + this.score.toString(), 72);
        this.scoreText.setOrigin(1, 0);
        this.canScore = true;
        
        this.previousStackHeight = 0;
        this.stackHeightLine = this.add.tileSprite(0, 0, this.sys.game.config.width, this.textures.get('stackHeightTexture').getSourceImage().height / 2, 'stackHeightTexture');
        this.stackHeightLine.setOrigin(0, 0);
        this.stackHeightLine.setScrollFactor(0);
        this.stackHeightLine.visible = false;

        this.emitter.on('gameRestart', () => {
            this.scene.restart();
        });
    }

    addBackground(){
        this.background = this.add.sprite(0, 0, "background");
        this.background.displayWidth = this.sys.game.config.width;
        this.background.displayHeight = this.sys.game.config.height;
        this.background.setOrigin(0, 0);
    }

    addGround(){
        this.ground = this.matter.add.sprite(0, 0, "ground", null); //, {shape: this.groundShape.ground}
        this.ground.setTrapezoid(this.ground.displayWidth, this.ground.displayHeight + 120, 0.45);
        this.ground.setOrigin(0.5, 1);
        this.ground.setScale(0.5, 0.5);
        this.ground.setPosition(this.sys.game.config.width / 2, this.sys.game.config.height);
        this.ground.setStatic(true);
    }

    addMovingItem(){
        var spriteFrame = 'stack-' + Phaser.Math.Between(1, 5);

        this.movingItem = this.add.image(this.sys.game.config.width / 2 - gameOptions.itemRange[0], this.ground.getBounds().top - gameOptions.itemHeight, 'items', spriteFrame);
        this.movingItem.setScale(.5);
        
        this.tweens.add({
            targets: this.movingItem,
            x: this.sys.game.config.width / 2 - gameOptions.itemRange[1],
            duration: gameOptions.itemSpeed,
            yoyo: true,
            repeat: -1
        })
    }

    checkCollision(e, b1, b2){
        if(b1.parent.isItem && !b1.parent.hit){
            b1.parent.hit = true;

            if(this.timer < gameOptions.timeLimit){
                this.nextItem();
            }
        }
        if(b2.parent.isItem && !b2.parent.hit){
            b2.parent.hit = true;
            this.stackHeightLine.visible = true;

            if(this.timer < gameOptions.timeLimit){
                this.nextItem();
            }
        }
    }
    
    updateScore(diff) {
        if (!this.canScore) {
            return;
        }

        if (diff > 0) {
            this.score += diff * gameOptions.scoreIncrement;
        } else if (diff < 0) {
            this.score += diff * gameOptions.scoreIncrement;
        }
        this.scoreText.text = "Score: " + this.score.toString();
    }

    setCameras(){
        this.actionCamera = this.cameras.add(0, 0, this.sys.game.config.width, this.sys.game.config.height);
        this.actionCamera.ignore([this.background, this.timeText]);
        this.cameras.main.ignore([this.ground, this.movingItem]);
    }

    dropItem(){
        if(this.canDrop && this.timer < gameOptions.timeLimit){
            this.addTimer();
            this.canDrop = false;
            this.movingItem.visible = false;
            this.addFallingItem();
        }
    }

    update(){
        this.itemGroup.getChildren().forEach(function(item){
            if(item.y > this.sys.game.config.height + item.displayHeight){
                if(!item.body.hit && this.timer < gameOptions.timeLimit){
                    this.nextItem();
                }
                item.destroy();
            }
        }, this);

        if (this.timer >= gameOptions.timeLimit) {
            this.canScore = false;
            return;
        }

        let highestItem = this.getHighestItem();
        if (highestItem) {
            let stackHeightY = highestItem.getBounds().top - this.stackHeightLine.displayHeight;
            this.stackHeightLine.setPosition(0, stackHeightY);
        }

        if (highestItem) {
            let stackHeight = this.ground.getBounds().top - highestItem.getBounds().top;

            let stackHeightInPoints = Math.floor(stackHeight / 10);
            if (stackHeightInPoints !== this.previousStackHeight) {
                let diff = stackHeightInPoints - this.previousStackHeight;
                this.updateScore(diff);
                this.previousStackHeight = stackHeightInPoints;
            }
        }
    }

    getHighestItem() {
        let highestItem = null;
        this.itemGroup.getChildren().forEach(function(item){
            if(item.body.hit){
                if (!highestItem || item.getBounds().top < highestItem.getBounds().top) {
                    highestItem = item;
                }
            }
        }, this);
        return highestItem;
    }

    addTimer(){
        if(this.timerEvent == null){
            this.timerEvent = this.time.addEvent({
                delay: 1000,
                callback: this.tick,
                callbackScope: this,
                loop: true
            });
        }
    }

    addFallingItem(){
        var itemShape = this.itemShapes[this.movingItem.frame.name];
        let fallingItem = this.matter.add.sprite(this.movingItem.x, this.movingItem.y, "items", this.movingItem.frame.name, {shape: itemShape});
        fallingItem.setScale(.5);
        fallingItem.body.isItem = true;
        fallingItem.body.hit = false;
        this.itemGroup.add(fallingItem);
        this.cameras.main.ignore(fallingItem)
    }

    nextItem(){
        // Change the texture of the sprite
        var newSpriteFrame = 'stack-' + Phaser.Math.Between(1, 5);
        this.movingItem.setTexture('items', newSpriteFrame);

        this.canDrop = true;
        this.movingItem.visible = true;
        if(this.timer >= gameOptions.timeLimit){
            this.score = 0;
            this.scoreText.text = "Score: " + this.score.toString();
            this.timeText.text = "Time's up!";
            this.input.off("pointerdown", this.dropItem, this);
            this.canDrop = false;
        }
    }

    tick(){
        this.timer++;
        this.timeText.text = (gameOptions.timeLimit - this.timer).toString()
        if(this.timer >= gameOptions.timeLimit){
            this.timerEvent.remove();
            this.movingItem.destroy();
            this.time.addEvent({
                delay: 2000,
                callback: function(){
                    this.removeEvent = this.time.addEvent({
                        delay: 100,
                        callback: this.removeItem,
                        callbackScope: this,
                        loop: true
                    })
                },
                callbackScope: this
            });

            if(this.score > localStorage.getItem('highscore')){
                localStorage.setItem('highscore', this.score);
            }
            
            this.events.emit('gameOver', this.score);
        }
    }

    removeItem(){
        if(this.itemGroup.getChildren().length > 0){
            this.itemGroup.getFirstAlive().destroy();
        }
        else{
            window.alert("Score: " + this.score +"\n" + "Highscore: " + localStorage.getItem('highscore'));

            this.removeEvent.remove();
            this.scene.start("PlayGame");
        }
    } 
}

