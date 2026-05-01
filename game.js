const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#2a2a2a',
    physics: {
        default: 'arcade', // Turns on real collision and movement physics
        arcade: {
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);
let player;
let cursors;

// 1. PRELOAD: Load your images and sounds here
function preload() {
    // For now, we will generate a green square to act as our goblin sprite
    let graphics = this.make.graphics({x: 0, y: 0, add: false});
    graphics.fillStyle(0x4ade80, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('goblin', 32, 32);
}

// 2. CREATE: Set up the world, spawn the player
function create() {
    // Spawn the goblin and add physics to him
    player = this.physics.add.sprite(400, 300, 'goblin');
    player.setCollideWorldBounds(true); // Stops him from walking off screen
    
    // Set up keyboard inputs
    cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys('W,A,S,D');
}

// 3. UPDATE: Runs 60 times a second (the game loop)
function update() {
    player.setVelocity(0); // Stop moving if no keys are pressed

    const speed = 300;

    // Movement logic
    if (cursors.left.isDown || this.keys.A.isDown) {
        player.setVelocityX(-speed);
    } else if (cursors.right.isDown || this.keys.D.isDown) {
        player.setVelocityX(speed);
    }

    if (cursors.up.isDown || this.keys.W.isDown) {
        player.setVelocityY(-speed);
    } else if (cursors.down.isDown || this.keys.S.isDown) {
        player.setVelocityY(speed);
    }
}
