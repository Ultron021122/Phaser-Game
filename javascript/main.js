var config = {
    type: Phaser.AUTO,
    width: 1370,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 400},
            debug: false
        }
    },
    scene: {
        key: 'main',
        preload: preload,
        create: create,
        update: update
    }
};
var map;
var player;
var player2;//Jugador dos
var cursors;
var groundLayer, coinLayer, banLayer;
var text;
var mitad = 0, mm = 0;
var gameOver = false;
var score = 0;
var nivel = 1;
var val = false;
var game = new Phaser.Game(config);
//Nivel 1 Archivo main.js
//Creamos clase NivelOne
function preload() {

        //Carga de mapa
        this.load.tilemapTiledJSON('map', 'assets/mapP.json');
        this.load.spritesheet('tiles','assets/tiles.png', {frameWidth: 70, frameHeight: 70});
        //this.load.spritesheet('tiles2', 'assets/tiles2.png', {frameWidth: 70, frameHeight: 70});
    
        this.load.spritesheet('dude', 'assets/dude.png', {frameWidth: 32, frameHeight: 48});
        this.load.spritesheet('cake', 'assets/cake.png', {frameWidth: 32, frameHeight: 32});
        this.load.image('coin', 'assets/coinGold.png');
        this.load.image('bomb', 'assets/bomb.png');

        //Carga de sonido
        this.load.audio('Game Over', 'assets/sound/Sonido Mario Game Over.mp3');
        this.load.audio('NivelOne', 'assets/sound/1-01-main-theme-overworld.mp3');
        this.load.audio('NivelTwo', 'assets/sound/1-02-underworld.mp3');
        this.load.audio('NivelThree', 'assets/sound/1-03-underwater.mp3');
        this.load.audio('Win','assets/sound/Star.mp3');
    }

function create() {
    map = this.make.tilemap({key: 'map'});
    var groundTiles = map.addTilesetImage('tiles');
    groundLayer = map.createDynamicLayer('World', groundTiles, 0, 0);
    groundLayer.setCollisionByExclusion([-1]);

    //mitad
    mitad = groundLayer.width/3;
    mm = mitad/2;

    //Coins
    var coinTiles = map.addTilesetImage('coin');
    coinLayer = map.createDynamicLayer('Coins', coinTiles, 0, 0);

    //End
    var banTiles = map.addTilesetImage('coin');
    banLayer = map.createDynamicLayer('Star', banTiles, 0, 0);

    this.physics.world.bounds.width = groundLayer.width;
    this.physics.world.bounds.height = groundLayer.height;

    //bombas
    bombs = this.physics.add.group();

    //Sound
    this.gameOverSample = this.sound.add('Game Over',{loop: false});
    this.juego = this.sound.add('NivelOne',{loop: true});
    this.juego.play();
    this.juegoD = this.sound.add('NivelTwo',{loop: true});
    this.juegoT = this.sound.add('NivelThree',{loop: true});
    this.winE = this.sound.add('Win', {loop: false});

    //Create player one
    player = this.physics.add.sprite(200,200,'dude');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    //Create player two
    player2 = this.physics.add.sprite(180, 200, 'cake');
    player2.setBounce(0.2);
    player2.setCollideWorldBounds(true);

    player.body.setSize(player.width, player.height-2);
    this.physics.add.collider(groundLayer, player);

    player2.body.setSize(player2.width, player.height-14);
    this.physics.add.collider(groundLayer, player2);

    coinLayer.setTileIndexCallback(17, collectCoin, this);
    banLayer.setTileIndexCallback(17, collectBan, this);

    this.physics.add.collider(groundLayer, bombs);

    this.physics.add.overlap(player, coinLayer);
    this.physics.add.overlap(player2, coinLayer);

    this.physics.add.overlap(player, banLayer);
    this.physics.add.overlap(player2, banLayer);

    this.physics.add.collider(player, bombs, hitBomb, null, this);
    this.physics.add.collider(player2, bombs, hitBomb, null, this);

    //animaciones
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'lefttwo',
        frames: this.anims.generateFrameNumbers('cake', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turntwo',
        frames: [ { key: 'cake', frames: 4}],
        frameRate: 20
    });

    //Teclado
    cursors = this.input.keyboard.createCursorKeys();
    keys = this.input.keyboard.addKeys('A,W,S,D');

    //Camaras
    this.cameras.main.setBounds(0,0, map.widthInPixels, map.heightInPixels);
    this.cameras.main.startFollow(player);

    this.cameras.main.setBackgroundColor('#2874A6');
    scoreText = this.add.text(150, 16, ' Score: 0',{
        fontFamily:'Pacifico' ,
        fontSize: '32px',
        fill: '#D0D3D4'
    });
    nivelText = this.add.text(16, 16, ' Nivel: 1',{
        fontFamily:'Pacifico' ,
        fontSize: '32px',
        fill: '#D0D3D4'
    });
    winText = this.add.text(100, 200, ' GO!!!',{
        fontFamily:'Pacifico' ,
        fontSize: '75px' ,
        fill: '#D0D3D4'
    });
    msText = this.add.text(300, 200, '',{
        fontFamily: 'Arial',
        fontSize: '120px' ,
        fill: '#D0D3D4'
    });
    scoreText.setScrollFactor(0);
    nivelText.setScrollFactor(0);
    msText.setScrollFactor(0);
    }

function update() {
    if(gameOver){
        return;
    }

    if (cursors.left.isDown){
        player.body.setVelocityX(-200);
        player.anims.play('left', true);
        //player.flipX = true; //flip the sprite to the left
    }
    else if (cursors.right.isDown){
        player.body.setVelocityX(200);
        player.anims.play('right', true);
        //player.flipY = false; //Use the original sprite looking
    }
    else{
        player.body.setVelocityX(0);
        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.onFloor()){
        player.body.setVelocityY(-430);
    }

    if (keys.A.isDown) {
        player2.setVelocityX(-200);
        player2.anims.play('lefttwo', true);
        player2.flipX = false;
    }
    else if (keys.D.isDown) {
        player2.setVelocityX(200);
        player2.anims.play('lefttwo', true);
        player2.flipX = true;
    }
    else {
        player2.setVelocityX(0);
        player2.anims.play('turntwo');
        player2.flipX = true;
    }
    if (keys.W.isDown && player2.body.onFloor())  {
        player2.setVelocityY(-430);
    }
}

function collectCoin (sprite, tile) {
    coinLayer.removeTileAt(tile.x, tile.y);
    score += 10;
    scoreText.setText(' Score: ' + score);
    if(score%10 == 0)
    {
        if(nivel == 1){
            var x = (player.x < mm) ? Phaser.Math.Between(mm, mm*2) : Phaser.Math.Between(0,mm);
            var bomb = bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-180,180), 20);
            bomb.allowGravity = false;
        }
        else if(nivel == 2){
            var x = (player.x < mm*3) ? Phaser.Math.Between(mm*3, mm*4) : Phaser.Math.Between(mitad,mm*3);
            var bomb = bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-180,180), 20);
            bomb.allowGravity = false;
        }
        else{
            var x = (player.x < mm*5) ? Phaser.Math.Between(mm*5, mm*6) : Phaser.Math.Between(mitad*2,mm*5);
            var bomb = bombs.create(x, 16, 'bomb');
            bomb.setBounce(1);
            bomb.setCollideWorldBounds(true);
            bomb.setVelocity(Phaser.Math.Between(-180,180), 20);
            bomb.allowGravity = false
        }
    }
}

function collectBan (juga, tile) {
    banLayer.removeTileAt(tile.x, tile.y);
    nivel += 1;
    nivelText.setText(' Nivel: ' + nivel);
    if(nivel == 2){
        this.juego.pause();
        this.juegoD.play();
    }
    else if(nivel == 3){
        this.juegoD.pause();
        this.juegoT.play();
    }else{
        this.juegoT.pause();
        msText.setText('EPIC WIN!!!');
        this.physics.pause();
        player2.setTint(0x000000);
        player2.anims.play('turntwo');
        player.setTint(0x000000);
        player.anims.play('turn');
        this.winE.play();
    }
}

function hitBomb (jug, bomb)
    {
        this.physics.pause();
        this.juego.pause();
        this.juegoD.pause();
        this.juegoT.pause();
        player2.setTint(0xff0000);
        player2.anims.play('turntwo');
        player.setTint(0xff0000);
        player.anims.play('turn');
        gameOver = true;
        this.gameOverSample.play();
}