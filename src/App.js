"use strict";

const Drawer = require("./drawer");

class App {
    constructor() {
        this.camera = {
            x: 0,
            y: 0
        };
        this.trees = [];
        this.area = {};

        this.width = document.body.offsetWidth;
        this.height = document.body.offsetHeight;

        this.initKeyboard();  
        this.initCanvas();
        this.initDrawer();
        
        this.hasChange = true;
        setInterval(() => {
            this.main();
        }, 30);
    }

    main() {
        let {camera, keyCodes} = this;
        let step = 10;

        if ( keyCodes.up ) {
            camera.y += step;
        }
        if ( keyCodes.down ) {
            camera.y -= step;
        }
        if ( keyCodes.left ) {
            camera.x -= step;
        }
        if ( keyCodes.right ) {
            camera.x += step;
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
    }

    generateArea() {
        // clear trees before render
        this.trees = [];

        let sectorSize = 150;
        let {camera, width, height, area} = this;

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

                if ( sectorX == 0 && sectorY == 0 ) {
                    continue;
                }

                if ( !tree ) {
                    let rx = sectorX + Math.random() * sectorSize;
                    let ry = sectorY + Math.random() * sectorSize;
                    
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
}

module.exports = App;