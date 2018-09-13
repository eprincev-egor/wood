"use strict";

const Drawer = require("./drawer");
let recordScore = +localStorage.getItem("recordScore") || 0;

class App {
    constructor() {
        this.camera = {};
        this.cable = [];

        let styleEl = document.createElement("style");
        styleEl.innerHTML = "* {margin: 0; padding: 0; overflow: hidden;}";
        document.body.appendChild(styleEl);

        this.width = document.body.offsetWidth;
        this.height = document.body.offsetHeight;
        
        this.clearState();

        this.initKeyboard();  
        this.initCanvas();
        this.initDrawer();
        this.initScore();
        this.initCenterEl();
        
        this.start();
    }

    clearState() {
        this.camera.x = 0;
        this.camera.y = 0;
        this.trees = [];
        this.area = {};
        this.score = 0;

        // clear array
        this.cable.length = 0;
        // fill from cable from screen bottom to center
        this.cable.push({
            x: 0,
            y: - this.height / 2
        });
        this.cable.push({
            x: 0,
            y: 0
        });
    }

    initScore() {
        let el = document.createElement("div"),
            style = el.style;
        
        style.top = "10px";
        style.left = "10px";
        style.fontSize = "18px";
        style.fontFamily = "Arial";
        style.fontWeight = "bold";
        style.position = "absolute";
        style.color = "white";

        document.body.appendChild(el);
        this.scoreEl = el;
    }

    start() {
        this.interval = setInterval(() => {
            this.main();
        }, 30);
    }

    stop() {
        clearInterval(this.interval);
    }

    restart() {
        this.stop();
        this.clearState();
        this.start();
    }

    main() {
        let {camera, keyCodes} = this;
        let step = 10;
        let vx = 0;
        let vy = 1;

        if ( keyCodes.up ) {
            vy = 1;
            step = 30;
        }
        if ( keyCodes.down ) {
            vy = -1;
        }
        if ( keyCodes.left ) {
            vx = -1;
        }
        if ( keyCodes.right ) {
            vx = 1;
        }

        if ( vx != 0 || vy != 0 ) {
            let length = Math.sqrt( vx * vx + vy * vy );
            let nx = camera.x + step * vx / length;
            let ny = camera.y + step * vy / length;

            let hasCollision = this.trees.some(tree => {
                let dx = nx - tree.x;
                let dy = ny - tree.y;

                return Math.sqrt( dx * dx + dy * dy ) < 25;
            });

            if ( hasCollision ) {
                this.stop();

                if ( this.score > recordScore ) {
                    recordScore = this.score;
                    localStorage.setItem("recordScore", recordScore);
                    
                    this.showRecord(() => {
                        this.clearState();
                        this.start();
                    });
                } else {
                    this.showGameOver(() => {
                        this.clearState();
                        this.start();
                    });
                }
                return;
            }

            camera.x = nx;
            camera.y = ny;

            let lastSegment = this.cable.slice(-1)[0];

            if ( lastSegment.x == nx || lastSegment.y == ny ) {
                lastSegment.x = nx;
                lastSegment.y = ny;
            } else {
                this.cable.push({
                    x: nx,
                    y: ny
                });
            }

            this.score += length;
        }
        
        this.generateArea();
        this.draw();
    }

    initCanvas() {
        const canvas = document.createElement("canvas");
        canvas.style.position = "fixed";
        canvas.style.width = "100%";
        canvas.style.height = "100%";
        
        document.body.appendChild(canvas);

        this.canvas = canvas;
    }

    initDrawer() {
        this.drawer = new Drawer( this.canvas );
    }

    initKeyboard() {
        let keyCodes = {
            up: false,
            down: false,
            left: false,
            right: false
        };
        this.keyCodes = keyCodes;

        document.onkeyup = (e) => {
            if ( e.keyCode == 37 ) {
                keyCodes.left = false;
            }
            if ( e.keyCode == 38 ) {
                keyCodes.up = false;
            }
            if ( e.keyCode == 39 ) {
                keyCodes.right = false;
            }
            if ( e.keyCode == 40 ) {
                keyCodes.down = false;
            }
        };

        document.onkeydown = (e) => {
            if ( e.keyCode == 37 ) {
                keyCodes.left = true;
            }
            if ( e.keyCode == 38 ) {
                keyCodes.up = true;
            }
            if ( e.keyCode == 39 ) {
                keyCodes.right = true;
            }
            if ( e.keyCode == 40 ) {
                keyCodes.down = true;
            }
        };
    }

    draw() {
        // camera, trees, width, height
        this.drawer.draw(this);
        this.drawScore();
    }

    drawScore() {
        this.scoreEl.innerHTML = Math.floor( this.score );
    }

    generateArea() {
        // clear trees before render
        this.trees = [];

        let sectorSize = 175;
        let {camera, width, height, area} = this;
        let treeRadius = 10;

        for (
            let x = camera.x - width / 2; 
            x < camera.x + width / 2; 
            x += sectorSize
        ) {
            for (
                let y = camera.y - height / 2; 
                y < camera.y + height / 2; 
                y += sectorSize
            ) {
                let sectorX = x - x % sectorSize;
                let sectorY = y - y % sectorSize;
                let sectorName = sectorX + ":" + sectorY;
                let tree = area[ sectorName ];

                // first cable segment
                if ( sectorX >= -sectorSize && sectorX <= sectorSize ) {
                    if ( sectorY <= height / 4 && sectorY >= -height / 2 ) {
                        continue;
                    }
                }


                if ( !tree ) {
                    let rx = sectorX + treeRadius + Math.random() * (sectorSize - treeRadius);
                    let ry = sectorY + treeRadius + Math.random() * (sectorSize - treeRadius);
                    
                    tree = {
                        x: rx, 
                        y: ry
                    };

                    area[ sectorName ] = tree;
                }

                this.trees.push( tree );
            }
        }
    }

    initCenterEl() {
        let el = document.createElement("div"),
            style = el.style;
        
        style.top = "calc( 50% - 10px )";
        style.left = "10px";
        style.width = "100%";
        style.fontSize = "36px";
        style.fontFamily = "Arial";
        style.fontWeight = "bold";
        style.position = "absolute";
        style.color = "white";
        style.opacity = "1";
        style.textAlign = "center";
        style.transition = "all .5s";

        document.body.appendChild(el);
        this.centerEl = el;
    }

    showRecord(callback) {
        clearTimeout( this.timer );
        
        this.centerEl.innerHTML = "RECORD: " + Math.floor( recordScore );
        this.centerEl.style.opacity = 1;

        this.timer = setTimeout(() => {
            this.centerEl.style.opacity = 0;

            this.timer = setTimeout(() => {
                this.centerEl.innerHTML = "";

                callback && callback();
            }, 2000);
        }, 2000);
    }

    showGameOver(callback) {
        clearTimeout( this.timer );

        this.centerEl.innerHTML = "OFFLINE";
        this.centerEl.style.opacity = 1;

        this.timer = setTimeout(() => {
            this.centerEl.style.opacity = 0;

            this.timer = setTimeout(() => {
                this.centerEl.innerHTML = "";

                callback && callback();
            }, 1000);
        }, 1000);
    }
}

module.exports = App;