"use strict";

const Drawer = require("./drawer");

setTimeout(() => {
    const canvas = document.createElement("canvas");
    canvas.style.position = "fixed";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    
    document.body.appendChild(canvas);

    let drawer = new Drawer(canvas);
    
    let camera = {
            x: 0,
            y: 0
        },
        trees = [
            {
                x: 0,
                y: 0
            },
            {
                x: 100,
                y: 100
            }
        ];

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

        drawer.draw({camera, trees});
    };
    
    drawer.draw({camera, trees});
});
