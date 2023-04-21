var canvas;
var c;
var scoreEl;
var stopwatchEl;
var lifeBar;
var player;
var projectiles;
var grids;
var InvaderProjectiles;
var particles;

// LETS
let frames = 0
let randomIntervalGrid = 99999999999999999999999999999
let game = {
    over: false,
    active:true,
    lives: 3,
    pause : false
}
let score = 0
let lastShotTime = 0;
let startTime = Date.now();
// let timerCount = 50000
let isStopwatch = false

//let startTime = null;
let relateTime = null;
let velocityChangeRate = 2
let velocityIncreaseCountProj = 0;
let velocityIncreaseCountGrid = 0;
let projectileSpeed = 5; // adjust this value to change the speed of the projectiles
const velocityIncreaseInterval = 5000; // increase velocity every 5 seconds

let gridSpeedIncreaseCount = 0;
let lastVelocityIncreaseTime = 0;


const keys = {
    arrowDown: {
        pressed: false
    },
    arrowUp: {
        pressed: false
    },
    arrowLeft: {
        pressed: false
    },
    arrowRight: {
        pressed: false
    },
    space: {
        pressed: false
    }
}



function setupGame(){
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const canvasWidth = screenWidth * 0.8;
    const canvasHeight = screenHeight*0.8;

    canvas = document.querySelector('canvas');
    c = canvas.getContext('2d');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.top = `${screenHeight / 2 - canvasHeight / 2}px`;
    canvas.style.left = `${screenWidth / 2 - canvasWidth / 2}px`;

    player = new Player();
    projectiles = [];
    grids = [];
    InvaderProjectiles = [];
    particles = [];


    scoreEl = document.querySelector('#scoreEl');
    stopwatchEl = document.getElementById('stopwatchEl');
    lifeBar = document.querySelector('#life-bar img');
    addGameListeners();
    backgroundAnimation();
    animate();



}




class Player{
    constructor(){
        this.velocity = {
           x: 0,
           y: 0 
        }

        this.rotation = 0
        this.opacity = 1


        const image = new Image()
        image.src = './Resource/images/space-ship-removebg-preview.png'
        image.onload = () =>{
            const scale = 0.12
            this.image= image
            this.width = image.width * scale
            this.height = image.height * scale
            this.position = {
                x: canvas.width / 2 - this.width / 2,
                y: canvas.height - this.height - 20
            }
        }

    }
    
    draw(){
        c.save()
        c.globalAlpha = this.opacity
        c.translate(
            player.position.x + player.width / 2, 
            player.position.y + player.height / 2
            )

        c.rotate(this.rotation)

        c.translate(
            -player.position.x - player.width / 2, 
            -player.position.y - player.height / 2
            )

        c.drawImage(
            this.image,
            this.position.x, 
            this.position.y, 
            this.width, 
            this.height
            ) 
            
            c.restore()
        }

        

    update(){
        if(this.image){
            this.draw()
            this.position.x += this.velocity.x
            this.position.y += this.velocity.y
        }
    }
}


class Projectile{
    constructor({position, velocity}){
        this.position = position
        this.velocity = velocity
        
        this.radius = 5
    }

    draw(){
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = 'red'
        c.fill()
        c.closePath()
    }

    update(){
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
    }
}

class Particle{
    constructor({position, velocity, radius, color, fades}){
        this.position = position
        this.velocity = velocity
        
        this.radius = radius
        this.color = color
        this.opacity = 1
        this.fades =  fades
    }

    draw(){
        c.save()
        c.globalAlpha = this.opacity
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fillStyle = this.color
        c.fill()
        c.closePath()
        c.restore()
    }

    update(){
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        if(this.fades){
            this.opacity -= 0.01
        } 
    }
}


class InvaderProjectile{
    constructor({position, velocity}){
        this.position = position
        this.velocity = velocity
        
        this.width = 3
        this.height = 10
    }

    draw(){
        c.fillStyle = 'yellow'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)

    }

    update(){
        this.draw()
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        
    }
}

class Invader{
    constructor({position, prize, line}){
        this.velocity = {
           x: 0,
           y: 0 
        }
        //this.line = line

        const image = new Image()
        let stringImage = "./Resource/images/enemy"+String(line + 1)+".png"
        image.src = stringImage
        image.onload = () =>{
            const scale = 0.15
            this.image= image
            this.width = image.width * scale
            this.height = image.height * scale
            this.position = {
                x: position.x,
                y: position.y
            }
        }
        this.prize = prize
    }
    
    draw(){

        c.drawImage(
            this.image,
            this.position.x, 
            this.position.y, 
            this.width, 
            this.height
            ) 
        }

        

    update({velocity}){
        if(this.image){
            this.draw()
            this.position.x += velocity.x
            this.position.y += velocity.y
        }
    }


    shoot(InvaderProjectiles, projectileSpeed) {
        // check if there are no projectiles or if the last projectile has passed 75% of the screen
        const lastProjectile = InvaderProjectiles[InvaderProjectiles.length - 1];
        //let projectileSpeed = 5; // adjust this value to change the speed of the projectiles
        const screenHeight = canvas.height;
        const shootThreshold = screenHeight * 0.75;
      
        if (!lastProjectile || lastProjectile.position.y > shootThreshold) {
          InvaderProjectiles.push(
            new InvaderProjectile({
              position: {
                x: this.position.x + this.width / 2,
                y: this.position.y + this.height,
              },
              velocity: {
                x: 0,
                y: projectileSpeed,
              },
            })
          );
        }
      }
}


class Grid{
    constructor() {
        this.position = {
            x: 0,
            y: 0
        }
        
        this.velocity = {
            x: 4,
            y: 0
        }

        this.invaders = []


        //for random number of invaders
        //const cols = Math.floor(Math.random() * 13)+ 1
        //const rows = Math.floor(Math.random() * 5)+ 1
   
        const cols = 5
        const rows = 4

        this.width = cols * 80
        

        for(let x =0; x < cols ; x++ ){
            for(let y = 0; y < rows; y++){
                this.invaders.push(new Invader(
                    {position: {
                        x: x * 80,
                        y: y * 70},
                    prize: 25 - y * 5,
                    line: y
                    }))}}
    }

    update(){

        //console.log(velocityIncreaseCountGrid)

        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        this.velocity.y = 0

        if (this.position.x +this.width >= canvas.width || this.position.x <= 0){
            this.velocity.x = -(this.velocity.x)
            //to make them go one line down
            //this.velocity.y = 30
        } 



        // if(now - relateTime >= velocityIncreaseInterval && velocityIncreaseCountGrid < 4){
        // //if(Date.now() - relateTime >= velocityIncreaseInterval && velocityIncreaseCountGrid < 4){
        //     console.log("increase speed Gird: ")
        //     if(this.velocity.x >= 0){this.velocity.x += velocityChangeRate}
        //     else if(this.velocity.x < 0){this.velocity.x -= velocityChangeRate}
            
        //     relateTime = Date.now()
        //     velocityIncreaseCountGrid ++
        //     console.log(this.velocity.x)
        // }
    }
}







//to make grid appear randomized
//let randomIntervalGrid = Math.floor((Math.random() * 500) + 500)


function backgroundAnimation(){
for(let i = 0; i < 100 ; i++){
    particles.push(new Particle({
        position: {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height
        },
        velocity: {
           x: 0,
           y: 0.7
        },
        radius: Math.random() * 4,
        color: 'white'
    }))
}
}


function createParticles({object, color, fades}){
    for(let i = 0; i < 10 ; i++){
        particles.push(new Particle({
            position: {
                x: object.position.x + object.width / 2,
                y: object.position.y + object.height / 2,
            },
            velocity: {
               x: (Math.random() -0.5) * 2 ,
               y: (Math.random() -0.5) * 2
            },
            radius: Math.random() * 3,
            color: color,
            fades: fades
        }))
    }
}





function updateTime(countTime, isStopwatch) {
    if (startTime !== null && game.active) {
        let elapsedTime = 0;
        if (isStopwatch) {
            elapsedTime = Date.now() - startTime;
        } else {
            elapsedTime = countTime - (Date.now() - startTime - 1000);
        }
        const minutes = Math.floor(elapsedTime / 60000);
        const seconds = Math.floor((elapsedTime % 60000) / 1000);
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        stopwatchEl.innerHTML = timeString;

        if (!isStopwatch && elapsedTime <= 0) {
            console.log('Time is up!');
            game.active = false;
            //text
            if(score < 100){
                // Add a message at the center of the screen
                const message = document.createElement('div');
                message.innerText = 'You can do better!';
                message.style.position = 'absolute';
                message.style.top = '30%';
                message.style.left = '50%';
                message.style.transform = 'translate(-50%, -50%)';
                message.style.fontSize = '55px';
                message.style.color = '#CD7F32';
                message.style.fontWeight = 'bold';
                message.style.fontFamily = "Berlin Sans FB";
                document.body.appendChild(message);
            }
            else{
                // Add a message at the center of the screen
                const message = document.createElement('div');
                message.innerText = 'Winner!';
                message.style.position = 'absolute';
                message.style.top = '30%';
                message.style.left = '50%';
                message.style.transform = 'translate(-50%, -50%)';
                message.style.fontSize = '55px';
                message.style.color = 'silver';
                document.body.appendChild(message);

            }

        }

        if (seconds % 5 === 0 && seconds !== 0 && gridSpeedIncreaseCount < 4 && Date.now() - lastVelocityIncreaseTime >= 5000) {
            grids.forEach(grid => {
                if (grid.velocity.x >= 0) {
                    grid.velocity.x += velocityChangeRate;  
                } else if (grid.velocity.x < 0) {
                    grid.velocity.x -= velocityChangeRate;
                }
                console.log("grid velo:" + grid.velocity.x)
            });
            gridSpeedIncreaseCount++;
            lastVelocityIncreaseTime = Date.now();
        }
    }
}





function animate(){
    const maxHightPlayer = canvas.height * 0.6 
    if(!game.active) return

    if(startTime == null){
        startTime = Date.now();
        relateTime = startTime
    }

    if(Date.now() - relateTime >= velocityIncreaseInterval && velocityIncreaseCountProj < 4){
        projectileSpeed += velocityChangeRate
        relateTime = Date.now()
        velocityIncreaseCountProj ++
    }

    
    if (game.pause){
       console.log("game paused") 
    }
    requestAnimationFrame(animate)  
    c.fillStyle = 'black'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.update()
    particles.forEach((particle, i) => {

        if(particle.position.y - particle.radius >= canvas.height){
            particle.position.x = Math.random() * canvas.width
            particle.position.y = -particle.radius 
        }

        if(particle.opacity <= 0){
            setTimeout(() => {
                particles.splice(i, 1)
            }, 0)
        }else{
            particle.update() 
        }
    })
    InvaderProjectiles.forEach((InvaderProjectile, index) => {
        if(InvaderProjectile.position.y + InvaderProjectile.height >= canvas.height){
            setTimeout(() => {
                InvaderProjectiles.splice(index, 1)
            }, 0)
        }else InvaderProjectile.update()





        // projectile hits player
        if((InvaderProjectile.position.y <= player.position.y + player.height &&
            InvaderProjectile.position.y + InvaderProjectile.height >= player.position.y &&
            InvaderProjectile.position.x <= player.position.x + player.width &&
            InvaderProjectile.position.x + InvaderProjectile.width >= player.position.x &&
            player.opacity > 0.9)){
                

                game.lives --
                    // Update life bar image
                let liveBar_StringImage = "./Resource/images/heart"+String(game.lives)+".png"
                console.log(liveBar_StringImage)
                lifeBar.src = liveBar_StringImage

                setTimeout(() => {
                    InvaderProjectiles.splice(index, 1)
                    if(game.lives > 0){
                        player.opacity = 0.3
                        console.log('you lost one live')
                        console.log(game.lives)
                        setTimeout(() => {
                            player.opacity = 1
                            player.position.x = canvas.width / 2 - player.width / 2
                            player.position.y = canvas.height - player.height - 20
                            },1000)
                    }

                    //to make the game freeze after ending
                    if(game.lives <= 0){
                        console.log('you lose')
                        console.log(game.lives)
                        player.opacity = 0.00

                        setTimeout(() => { 
                            game.active = false
                            // Add a message at the center of the screen
                            const message = document.createElement('div');
                            message.innerText = 'You Lost';
                            message.style.position = 'absolute';
                            message.style.top = '30%';
                            message.style.left = '50%';
                            message.style.transform = 'translate(-50%, -50%)';
                            message.style.fontSize = '80px';
                            message.style.color = 'white';
                            document.body.appendChild(message);
                            },1500) 
                    }
                }, 0)

                
                createParticles({
                    object: player, 
                    color: 'red',
                    fades: true
                })
            }
    })




    projectiles.forEach((projectile, index) => {
        if(projectile.position.y + projectile.radius <= 0 ){
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0)
            
        } else{
            projectile.update()
        }
    })

    grids.forEach((grid, gridIndex) => {
        now = Date.now()
        grid.update()

            //spawn projectiles
        if(frames % 10 === 0 && grid.invaders.length > 0){
            grid.invaders[Math.floor(Math.random() * grid.invaders.length)].shoot(InvaderProjectiles, projectileSpeed)
        }

        grid.invaders.forEach((invader, i) => {
            invader.update({velocity:grid.velocity})

            // projectiles hit enemy

            projectiles.forEach((projectile, j) => {
                if(projectile.position.y - projectile.radius <=
                     invader.position.y + invader.height && 
                     projectile.position.x + projectile.radius >=
                     invader.position.x && projectile.position.x - projectile.radius <=
                     invader.position.x + invader.width && projectile.position.y + projectile.radius >=
                     invader.position.y){

                        setTimeout(() => {
                            const invaderFound = grid.invaders.find((invader2) =>
                                invader2 === invader
                                )
                            const projectileFound = projectiles.find(projectile2 =>
                                projectile2 === projectile
                                )

                                //remove invader & projectile
                            if(invaderFound && projectileFound){
                                score += invader.prize
                                scoreEl.innerHTML = score
                                createParticles({
                                    object: invader, 
                                    color: 'green',
                                    fades: true
                                })

                                grid.invaders.splice(i, 1)
                                projectiles.splice(j, 1)

                                if(grid.invaders.length > 0){
                                    const firstInvader = grid.invaders[0]
                                    const lastInvader = grid.invaders[grid.invaders.length-1]

                                    grid.width = 
                                    lastInvader.position.x - firstInvader.position.x +lastInvader.width
                                    grid.position.x = firstInvader.position.x
                                }
                                // all invaders in grid dead
                                else{
                                    //stop the game and champion message
                                    grids.splice (gridIndex, 1)
                                    setTimeout(() => { 
                                        game.active = false;
                                        //text
                                        // Add a message at the center of the screen
                                        const message = document.createElement('div');
                                        message.innerText = 'Champion!';
                                        message.style.position = 'absolute';
                                        message.style.top = '30%';
                                        message.style.left = '50%';
                                        message.style.transform = 'translate(-50%, -50%)';
                                        message.style.fontSize = '60px';
                                        message.style.color = 'gold';
                                        document.body.appendChild(message);
                                    },1000)   
                                }
                            }
                        }, 0)
                     }
            })
        })
    })

    


    
    //----NEW ---------
    //player moving
    if(player.opacity > 0.9){

        if(keys.arrowDown.pressed && player.position.y <= canvas.height - player.height) {
            player.velocity.y = 3;
            // console.log("moving down");
        } else if(keys.arrowUp.pressed && player.position.y >= maxHightPlayer) {
            player.velocity.y = -3;
            // console.log("moving up");
        } else {
            player.velocity.y = 0;
        }
    
        if(keys.arrowLeft.pressed && player.position.x >= 0) {
            player.velocity.x = -5;
            player.rotation = -0.15;
            // console.log("moving left");
        } else if(keys.arrowRight.pressed && player.position.x <= canvas.width - player.width) {
            player.velocity.x = 5;
            player.rotation = 0.15;
            // console.log("moving right");
        } else {
            player.velocity.x = 0;
            player.rotation = 0;
        }
    }



    //player shoots

    if (keys.space.pressed && Date.now() - lastShotTime > 300 && game.lives > 0 && player.opacity > 0.9){
        projectiles.push(new Projectile({
            position:{
                x: player.position.x + player.width / 2,
                y: player.position.y - 10
            },
            velocity: {
                x: 0,
                y: -4
            }
        }) )
        lastShotTime = Date.now();
    }

    // spawn grids
    const maxNumGrid = 1
    if (frames % randomIntervalGrid  === 0 && grids.length < maxNumGrid){
        grids.push(new Grid())
        randomIntervalGrid = Math.floor((Math.random() * 500) + 500)
        frames = 0
    }
    frames++
    //setInterval(updateStopwatch, 1000);
    setInterval(updateTime(timerCount,isStopwatch), 1000);

}





function addGameListeners(){
addEventListener('keydown', ({key}) => {
    //(when dead)
    if(game.over) return

    switch(key){
        case 'ArrowDown':
            console.log('down')
            keys.arrowDown.pressed = true
            break
        case 'ArrowUp':
            //console.log('up')
            keys.arrowUp.pressed = true
            break
        case 'ArrowLeft':
            //console.log('left')
            keys.arrowLeft.pressed = true
            break
        case 'ArrowRight':
            // console.log('right')
            keys.arrowRight.pressed = true
            break
        case shotKey:
            keys.space.pressed = true
            break
        case 'p':
            console.log('p in')
            game.pause = (!game.pause)
            console.log(game.pause)
            break
    }   
})

addEventListener('keyup', ({key}) => {
    switch(key){
        case 'ArrowDown':
            //console.log('down')
            keys.arrowDown.pressed = false
            break
        case 'ArrowUp':
            //console.log('up')
            keys.arrowUp.pressed = false
            break
        case 'ArrowLeft':
            //console.log('left')
            keys.arrowLeft.pressed = false
            break
        case 'ArrowRight':
            //console.log('right')
            keys.arrowRight.pressed = false
            break
        case shotKey:
            //console.log('space')
            keys.space.pressed = false
            break
        case 'p':
            console.log('p out')
            break
    }   
})
}
