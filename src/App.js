"use strict";

const Drawer = require("./drawer");

class App {
    constructor() {
        this.camera = {
            x: 0,
            y: 0
        };
        this.trees = [];

        this.width = document.body.offsetWidth;
        this.height = document.body.offsetHeight;

        this.initCanvas();
        this.initDrawer();
        this.initKeyboard();  
        
        this.hasChange = true;
        setInterval(() => {
            this.main();
        }, 30);
    }

    main() {
        if ( !this.hasChange ) {
            return;
        }
        
        this.generateArea();
        this.draw();
        this.hasChange = false;
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
        let {camera} = this;

        document.onkeydown = (e) => {
            if ( e.keyCode == 37 ) {
                camera.x -= 10;
            }
            if ( e.keyCode == 38 ) {
                camera.y -= 10;
            }
            if ( e.keyCode == 39 ) {
                camera.x += 10;
            }
            if ( e.keyCode == 40 ) {
                camera.y += 10;
            }

            this.hasChange = true;
        };
    }

    draw() {
        // camera, trees, width, height
        this.drawer.draw(this);
    }

    generateArea() {
        if ( !this.area ) {
            this.area = {};
        }
        // clear trees before render
        this.trees = [];

        let sectorSize = 150;
        let {camera} = this;

        for (
            let x = camera.x - this.width / 2; 
            x < camera.x + this.width / 2; 
            x += sectorSize
        ) {
            for (
                let y = camera.y - this.height / 2; 
                y < camera.y + this.height / 2; 
                y += sectorSize
            ) {
                let sectorX = x - x % sectorSize;
                let sectorY = y - y % sectorSize;
                let sectorName = sectorX + ":" + sectorY;
                let tree = this.area[ sectorName ];

                if ( !tree ) {
                    let rx = sectorX + Math.random() * sectorSize;
                    let ry = sectorY + Math.random() * sectorSize;
                    
                    tree = {
                        x: rx, 
                        y: ry
                    };

                    this.area[ sectorName ] = tree;
                }

                this.trees.push( tree );
            }
        }
    }
}

module.exports = App;