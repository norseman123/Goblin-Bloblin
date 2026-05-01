const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#1e1e1e',
    physics: {
        default: 'arcade',
        arcade: { debug: false }
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
let keys;

// Building System Variables
const TILE_SIZE = 32;
let buildMarker;
let mapGrid = {}; // Stores what is built at each X,Y coordinate

function preload() {
    // 1. Generate Goblin Texture
    let gobGen = this.make.graphics({add: false});
    gobGen.fillStyle(0x4ade80, 1);
    gobGen.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    gobGen.generateTexture('goblin', TILE_SIZE, TILE_SIZE);

    // 2. Generate Conveyor Texture (Blue square)
    let convGen = this.make.graphics({add: false});
    convGen.fillStyle(0x3b82f6, 1);
    convGen.lineStyle(2, 0x000000, 1);
    convGen.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);
    convGen.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
    // Draw a little arrow to show direction
    convGen.fillStyle(0xffffff, 1);
    convGen.fillTriangle(10, 10, 10, 22, 24, 16); 
    convGen.generateTexture('conveyor', TILE_SIZE, TILE_SIZE);

    // 3. Generate the Build Marker (Yellow outline)
    let markerGen = this.make.graphics({add: false});
    markerGen.lineStyle(2, 0xfacc15, 1);
    markerGen.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);
    markerGen.generateTexture('marker', TILE_SIZE, TILE_SIZE);
}

function create() {
    // Draw a subtle grid background for the factory floor
    this.add.grid(400, 300, 800, 600, TILE_SIZE, TILE_SIZE, 0x1e1e1e, 1, 0x333333, 1);

    // Player Setup
    player = this.physics.add.sprite(400, 300, 'goblin');
    player.setCollideWorldBounds(true);
    
    // Inputs
    cursors = this.input.keyboard.createCursorKeys();
    keys = this.input.keyboard.addKeys('W,A,S,D');

    // Build Marker Setup (Follows the mouse)
    buildMarker = this.add.sprite(0, 0, 'marker');
    buildMarker.setOrigin(0, 0); // Align to top-left for easier grid snapping

    // Click to Build
    this.input.on('pointerdown', (pointer) => {
        // Snap pointer coordinates to the grid
        let snapX = Math.floor(pointer.x / TILE_SIZE) * TILE_SIZE;
        let snapY = Math.floor(pointer.y / TILE_SIZE) * TILE_SIZE;
        let gridKey = `${snapX},${snapY}`;

        // If the space is empty, place a conveyor!
        if (!mapGrid[gridKey]) {
            let newBuilding = this.add.sprite(snapX, snapY, 'conveyor');
            newBuilding.setOrigin(0, 0);
            
            // Save it in our dictionary so we know it's there
            mapGrid[gridKey] = {
                type: 'conveyor',
                sprite: newBuilding,
                direction: 'right' 
            };
            
            console.log("Built conveyor at:", gridKey);
        }
    });
}

function update() {
    // --- Player Movement ---
    player.setVelocity(0);
    const speed = 250;

    if (cursors.left.isDown || keys.A.isDown) player.setVelocityX(-speed);
    else if (cursors.right.isDown || keys.D.isDown) player.setVelocityX(speed);

    if (cursors.up.isDown || keys.W.isDown) player.setVelocityY(-speed);
    else if (cursors.down.isDown || keys.S.isDown) player.setVelocityY(speed);

    // --- Build Marker Logic ---
    // Make the yellow box snap to the grid where the mouse is
    let pointer = this.input.activePointer;
    buildMarker.x = Math.floor(pointer.x / TILE_SIZE) * TILE_SIZE;
    buildMarker.y = Math.floor(pointer.y / TILE_SIZE) * TILE_SIZE;
}
