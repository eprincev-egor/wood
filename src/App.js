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
            
            this.draw();
        };
    }

    draw() {
        // camera, trees, width, height
        this.drawer.draw(this);
    }

    generateArea() {
        let sectorSize = 200;
        for (let x = -this.width / 2; x < this.width; x += sectorSize) {
            for (let y = -this.height / 2; y < this.height; y += sectorSize) {
                let rx = x + Math.random() * sectorSize;
                let ry = y + Math.random() * sectorSize;

                this.trees.push({
                    x: rx, 
                    y: ry
                });
            }
        }
    }
}

module.exports = App;