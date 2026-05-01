const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#1e1e1e',
    physics: { default: 'arcade', arcade: { debug: false } },
    scene: { preload: preload, create: create, update: update }
};

const game = new Phaser.Game(config);

// Core Systems
const TILE_SIZE = 32;
let player, cursors, keys, buildMarker, uiText;
let mapGrid = {}; 
let items = []; // Array to track all moving ores

// Economy & Building Stats
let money = 50;
let currentSelection = 'conveyor';
const BUILDINGS = {
    conveyor: { id: 'conveyor', cost: 2, color: 0x3b82f6, name: 'Conveyor' },
    miner:    { id: 'miner', cost: 15, color: 0x9ca3af, name: 'Auto-Miner' },
    sellbox:  { id: 'sellbox', cost: 10, color: 0xeab308, name: 'Sell Box' }
};

function preload() {
    // Generate Textures dynamically so we don't need image files yet
    let makeTex = (key, color, size, isItem = false) => {
        let g = this.make.graphics({add: false});
        g.fillStyle(color, 1);
        if (isItem) {
            g.fillCircle(size/2, size/2, size/2); // Items are little circles
        } else {
            g.fillRect(0, 0, size, size); // Buildings are squares
            g.lineStyle(2, 0x000000, 1);
            g.strokeRect(0, 0, size, size);
        }
        g.generateTexture(key, size, size);
    };

    makeTex('goblin', 0x4ade80, TILE_SIZE);
    makeTex('conveyor', BUILDINGS.conveyor.color, TILE_SIZE);
    makeTex('miner', BUILDINGS.miner.color, TILE_SIZE);
    makeTex('sellbox', BUILDINGS.sellbox.color, TILE_SIZE);
    makeTex('ore', 0xa8a29e, 12, true); // Little grey rock

    // Build Marker
    let markerGen = this.make.graphics({add: false});
    markerGen.lineStyle(2, 0xfacc15, 1);
    markerGen.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);
    markerGen.generateTexture('marker', TILE_SIZE, TILE_SIZE);
}

function create() {
    this.add.grid(400, 300, 800, 600, TILE_SIZE, TILE_SIZE, 0x1e1e1e, 1, 0x333333, 1);

    // Player
    player = this.physics.add.sprite(400, 300, 'goblin');
    player.setCollideWorldBounds(true);
    player.setDepth(10); // Keep goblin on top of buildings
    
    // Inputs
    cursors = this.input.keyboard.createCursorKeys();
    keys = this.input.keyboard.addKeys('W,A,S,D,ONE,TWO,THREE');

    buildMarker = this.add.sprite(0, 0, 'marker');
    buildMarker.setOrigin(0, 0);

    // UI Overlay
    uiText = this.add.text(10, 10, '', { font: '16px Courier', fill: '#fff', backgroundColor: '#000000aa', padding: 10 });
    uiText.setDepth(20);
    updateUI();

    // Click to Build
    this.input.on('pointerdown', (pointer) => {
        let snapX = Math.floor(pointer.x / TILE_SIZE) * TILE_SIZE;
        let snapY = Math.floor(pointer.y / TILE_SIZE) * TILE_SIZE;
        let gridKey = `${snapX},${snapY}`;
        let bData = BUILDINGS[currentSelection];

        // Check if tile is empty AND we have enough money
        if (!mapGrid[gridKey] && money >= bData.cost) {
            money -= bData.cost;
            let newBuilding = this.add.sprite(snapX, snapY, bData.id);
            newBuilding.setOrigin(0, 0);
            
            mapGrid[gridKey] = { type: bData.id, sprite: newBuilding };
            updateUI();
        }
    });

    // The Factory Clock (Runs every 1.5 seconds)
    this.time.addEvent({ delay: 1500, callback: runFactoryTick, callbackScope: this, loop: true });
}

function updateUI() {
    let bData = BUILDINGS[currentSelection];
    uiText.setText(
        `💰 Money: $${money}\n` +
        `🛠️ Selected: ${bData.name} ($${bData.cost})\n` +
        `[1] Conveyor | [2] Miner | [3] Sell Box`
    );
}

function runFactoryTick() {
    // 1. Miners generate ore
    for (let key in mapGrid) {
        if (mapGrid[key].type === 'miner') {
            let [x, y] = key.split(',').map(Number);
            let newOre = this.physics.add.sprite(x + 16, y + 16, 'ore');
            items.push(newOre);
        }
    }
}

function update() {
    // --- Building Selection ---
    if (Phaser.Input.Keyboard.JustDown(keys.ONE)) { currentSelection = 'conveyor'; updateUI(); }
    if (Phaser.Input.Keyboard.JustDown(keys.TWO)) { currentSelection = 'miner'; updateUI(); }
    if (Phaser.Input.Keyboard.JustDown(keys.THREE)) { currentSelection = 'sellbox'; updateUI(); }

    // --- Player Movement ---
    player.setVelocity(0);
    const speed = 250;
    if (cursors.left.isDown || keys.A.isDown) player.setVelocityX(-speed);
    else if (cursors.right.isDown || keys.D.isDown) player.setVelocityX(speed);
    if (cursors.up.isDown || keys.W.isDown) player.setVelocityY(-speed);
    else if (cursors.down.isDown || keys.S.isDown) player.setVelocityY(speed);

    // --- Build Marker Snap ---
    let pointer = this.input.activePointer;
    buildMarker.x = Math.floor(pointer.x / TILE_SIZE) * TILE_SIZE;
    buildMarker.y = Math.floor(pointer.y / TILE_SIZE) * TILE_SIZE;

    // --- Item Logistics (The Factory Belt Magic) ---
    for (let i = items.length - 1; i >= 0; i--) {
        let item = items[i];
        
        // Find which grid tile the item is currently on
        let gridX = Math.floor(item.x / TILE_SIZE) * TILE_SIZE;
        let gridY = Math.floor(item.y / TILE_SIZE) * TILE_SIZE;
        let cell = mapGrid[`${gridX},${gridY}`];

        item.setVelocity(0); // Stop unless on a belt

        if (cell) {
            if (cell.type === 'conveyor') {
                // Move items strictly to the Right (for now)
                item.setVelocityX(60);
            } 
            else if (cell.type === 'sellbox') {
                // Cash out!
                item.destroy();
                items.splice(i, 1); // Remove from array
                money += 5; // Profit!
                updateUI();
            }
        }
    }
}
