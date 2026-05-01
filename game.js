const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#1e1e1e',
    physics: { default: 'arcade' },
    scene: { preload: preload, create: create, update: update }
};

const game = new Phaser.Game(config);

// Core Systems
const TILE_SIZE = 32;
let player, cursors, keys, buildMarker, uiText, shiftText;
let mapGrid = {}; 
let items = []; 

// Economy & Shift Stats
let money = 50;
let currentSelection = 'conveyor';
let currentDir = 0; // 0: Right, 1: Down, 2: Left, 3: Up
const DIRS = [ {x: 1, y: 0}, {x: 0, y: 1}, {x: -1, y: 0}, {x: 0, y: -1} ];

// Roguelite Stats
let shiftTimer = 60;
let quota = 5;
let metalsSold = 0;
let shiftActive = true;

const BUILDINGS = {
    conveyor: { id: 'conveyor', cost: 2, color: 0x3b82f6, name: 'Conveyor' },
    miner:    { id: 'miner', cost: 15, color: 0x9ca3af, name: 'Auto-Miner' },
    furnace:  { id: 'furnace', cost: 25, color: 0xf97316, name: 'Furnace' },
    sellbox:  { id: 'sellbox', cost: 10, color: 0xeab308, name: 'Sell Box' }
};

function preload() {
    let makeTex = (key, color, size, isItem = false, drawArrow = false) => {
        let g = this.make.graphics({add: false});
        g.fillStyle(color, 1);
        if (isItem) {
            g.fillCircle(size/2, size/2, size/2);
        } else {
            g.fillRect(0, 0, size, size);
            g.lineStyle(2, 0x000000, 1);
            g.strokeRect(0, 0, size, size);
            if (drawArrow) {
                // Draw arrow pointing RIGHT (default rotation)
                g.fillStyle(0xffffff, 1);
                g.fillTriangle(size/4, size/4, size/4, size*0.75, size*0.75, size/2);
            }
        }
        g.generateTexture(key, size, size);
    };

    makeTex('goblin', 0x4ade80, TILE_SIZE);
    makeTex('conveyor', BUILDINGS.conveyor.color, TILE_SIZE, false, true);
    makeTex('miner', BUILDINGS.miner.color, TILE_SIZE, false, true);
    makeTex('furnace', BUILDINGS.furnace.color, TILE_SIZE, false, true);
    makeTex('sellbox', BUILDINGS.sellbox.color, TILE_SIZE);
    
    makeTex('ore', 0xa8a29e, 14, true); 
    makeTex('metal', 0xffffff, 14, true); // Smelted metal

    let markerGen = this.make.graphics({add: false});
    markerGen.lineStyle(2, 0xfacc15, 1);
    markerGen.strokeRect(-TILE_SIZE/2, -TILE_SIZE/2, TILE_SIZE, TILE_SIZE);
    markerGen.generateTexture('marker', TILE_SIZE, TILE_SIZE);
}

function create() {
    this.add.grid(400, 300, 800, 600, TILE_SIZE, TILE_SIZE, 0x1e1e1e, 1, 0x333333, 1);

    player = this.physics.add.sprite(400, 300, 'goblin');
    player.setCollideWorldBounds(true);
    player.setDepth(10);
    
    cursors = this.input.keyboard.createCursorKeys();
    keys = this.input.keyboard.addKeys('W,A,S,D,R,ONE,TWO,THREE,FOUR');

    buildMarker = this.add.sprite(0, 0, 'marker');
    buildMarker.setDepth(15);

    // UI Overlays
    uiText = this.add.text(10, 10, '', { font: '16px Courier', fill: '#fff', backgroundColor: '#000000aa', padding: 5 });
    uiText.setDepth(20);
    
    shiftText = this.add.text(400, 10, '', { font: '20px Courier', fill: '#facc15', backgroundColor: '#000000aa', padding: 5 }).setOrigin(0.5, 0);
    shiftText.setDepth(20);
    
    updateUI();

    // Click to Build
    this.input.on('pointerdown', (pointer) => {
        if (!shiftActive) return;

        let gridX = Math.floor(pointer.x / TILE_SIZE) * TILE_SIZE;
        let gridY = Math.floor(pointer.y / TILE_SIZE) * TILE_SIZE;
        let gridKey = `${gridX},${gridY}`;
        let bData = BUILDINGS[currentSelection];

        if (!mapGrid[gridKey] && money >= bData.cost) {
            money -= bData.cost;
            // Place building in center of tile for clean rotation
            let newBuilding = this.add.sprite(gridX + TILE_SIZE/2, gridY + TILE_SIZE/2, bData.id);
            newBuilding.setAngle(currentDir * 90);
            
            mapGrid[gridKey] = { 
                type: bData.id, 
                sprite: newBuilding, 
                dir: currentDir,
                processing: false // Used for furnaces
            };
            updateUI();
        }
    });

    this.time.addEvent({ delay: 1500, callback: runFactoryTick, callbackScope: this, loop: true });
}

function updateUI() {
    let bData = BUILDINGS[currentSelection];
    uiText.setText(
        `💰 Money: $${money}\n` +
        `🛠️ Tool: ${bData.name} ($${bData.cost})\n` +
        `[1] Conveyor | [2] Miner | [3] Furnace | [4] Sell Box\n` +
        `[R] Rotate (Arrow points Output)`
    );
}

function runFactoryTick() {
    if (!shiftActive) return;

    for (let key in mapGrid) {
        let cell = mapGrid[key];
        let [x, y] = key.split(',').map(Number);
        
        // Miners eject ore into the tile they are facing
        if (cell.type === 'miner') {
            let spawnX = x + (DIRS[cell.dir].x * TILE_SIZE) + TILE_SIZE/2;
            let spawnY = y + (DIRS[cell.dir].y * TILE_SIZE) + TILE_SIZE/2;
            
            let newOre = this.physics.add.sprite(spawnX, spawnY, 'ore');
            newOre.itemType = 'ore';
            items.push(newOre);
        }
        
        // Furnaces turn trapped ore into metal
        if (cell.type === 'furnace' && cell.processing) {
            cell.processing = false; // Smelting done
            
            // Eject metal forward
            let spawnX = x + (DIRS[cell.dir].x * TILE_SIZE) + TILE_SIZE/2;
            let spawnY = y + (DIRS[cell.dir].y * TILE_SIZE) + TILE_SIZE/2;
            
            let newMetal = this.physics.add.sprite(spawnX, spawnY, 'metal');
            newMetal.itemType = 'metal';
            items.push(newMetal);
        }
    }
}

function update(time, delta) {
    if (!shiftActive) return;

    // Shift Timer Logic
    shiftTimer -= delta / 1000;
    shiftText.setText(`SHIFT TIME: ${Math.ceil(shiftTimer)}s | QUOTA: ${metalsSold}/${quota} Metal`);
    
    if (shiftTimer <= 0) {
        shiftActive = false;
        if (metalsSold >= quota) {
            shiftText.setText(`SHIFT COMPLETE! Refresh to start tougher shift.`);
            shiftText.setColor('#4ade80');
        } else {
            shiftText.setText(`FIRED. QUOTA FAILED. Refresh to restart.`);
            shiftText.setColor('#ef4444');
        }
    }

    // Tools & Rotation
    if (Phaser.Input.Keyboard.JustDown(keys.ONE)) { currentSelection = 'conveyor'; updateUI(); }
    if (Phaser.Input.Keyboard.JustDown(keys.TWO)) { currentSelection = 'miner'; updateUI(); }
    if (Phaser.Input.Keyboard.JustDown(keys.THREE)) { currentSelection = 'furnace'; updateUI(); }
    if (Phaser.Input.Keyboard.JustDown(keys.FOUR)) { currentSelection = 'sellbox'; updateUI(); }
    
    if (Phaser.Input.Keyboard.JustDown(keys.R)) {
        currentDir = (currentDir + 1) % 4; // Cycles 0, 1, 2, 3
        buildMarker.setAngle(currentDir * 90);
        updateUI();
    }

    // Player Movement
    player.setVelocity(0);
    const speed = 250;
    if (cursors.left.isDown || keys.A.isDown) player.setVelocityX(-speed);
    else if (cursors.right.isDown || keys.D.isDown) player.setVelocityX(speed);
    if (cursors.up.isDown || keys.W.isDown) player.setVelocityY(-speed);
    else if (cursors.down.isDown || keys.S.isDown) player.setVelocityY(speed);

    // Build Marker Logic
    let pointer = this.input.activePointer;
    let gridX = Math.floor(pointer.x / TILE_SIZE) * TILE_SIZE;
    let gridY = Math.floor(pointer.y / TILE_SIZE) * TILE_SIZE;
    buildMarker.x = gridX + TILE_SIZE/2;
    buildMarker.y = gridY + TILE_SIZE/2;

    // Logistics (Item Movement)
    for (let i = items.length - 1; i >= 0; i--) {
        let item = items[i];
        
        let iGridX = Math.floor(item.x / TILE_SIZE) * TILE_SIZE;
        let iGridY = Math.floor(item.y / TILE_SIZE) * TILE_SIZE;
        let cell = mapGrid[`${iGridX},${iGridY}`];

        item.setVelocity(0); // Stop unless instructed by a building

        if (cell) {
            // Conveyors move items
            if (cell.type === 'conveyor') {
                item.setVelocityX(DIRS[cell.dir].x * 80);
                item.setVelocityY(DIRS[cell.dir].y * 80);
            } 
            // Furnaces catch ORE and destroy it to start processing
            else if (cell.type === 'furnace' && item.itemType === 'ore' && !cell.processing) {
                cell.processing = true;
                item.destroy();
                items.splice(i, 1);
            }
            // Sellbox cashes out METAL (Ore is worthless here now)
            else if (cell.type === 'sellbox' && item.itemType === 'metal') {
                item.destroy();
                items.splice(i, 1);
                money += 15; // Metal is worth a lot!
                metalsSold++;
                updateUI();
            }
        }
    }
}
