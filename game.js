function spawnEnemy() {
    // Pick a random column
    let randomCol = Phaser.Math.Between(0, columns - 1);
    let startX = randomCol * gridSize + 50;
    
    // Create a red circle for the enemy at the top of the screen
    let enemy = this.add.circle(startX, -20, 30, 0xff0000);
    enemiesGroup.add(enemy);
    
    // Give it a physics body and make it move down
    this.physics.add.existing(enemy);
    enemy.body.setVelocityY(100); // 100 pixels per second downwards
}

function towersShoot() {
    // Loop through every placed tower and fire a bullet
    towersGroup.getChildren().forEach((tower) => {
        // Create a small yellow bullet
        let bullet = this.add.circle(tower.x, tower.y - 40, 10, 0xffff00);
        projectilesGroup.add(bullet);
        
        // Give it physics and shoot it upwards
        this.physics.add.existing(bullet);
        bullet.body.setVelocityY(-300); // Negative velocity moves UP
    });
}

function hitEnemy(projectile, enemy) {
    // Destroy both sprites when they touch
    projectile.destroy();
    enemy.destroy();
}

function update() {
    // We can add logic here later to destroy bullets/enemies that go off-screen
    // to prevent memory leaks!
}
