"use strict";

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

let width, height;
let camera = {
    x: 0,
    y: 0,
    step: 10
};
let state = {
    keyboard: {
        up: false,
        down: false,
        left: false,
        right: false
    },
    tree: [{
        x: 0,
        y: 0,
        r: 20
    }]
};

let draw = {
    tree(tree) {
        let {x, y, r} = tree;
        let 
            x0 = x + width / 2,
            y0 = y + height / 2,
            r0 = r,

            x1 = x0 - 30,
            y1 = y0 - 30,
            r1 = r * 2;
        
        ctx.fillStyle = "orange";
        ctx.beginPath();
        ctx.arc(x0, y0, r0, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = "black";
        ctx.beginPath();
        ctx.arc(x1, y1, r1, 0, 2 * Math.PI);
        ctx.fill();
    }
};

setInterval(() => {
    width = canvas.width = document.body.offsetWidth,
    height = canvas.height = document.body.offsetHeight;
    
    if ( state.keyboard.up ) {
        camera.y -= camera.step;
    }
    if ( state.keyboard.down ) {
        camera.y += camera.step;
    }
    if ( state.keyboard.left ) {
        camera.x -= camera.step;
    }
    if ( state.keyboard.right ) {
        camera.x += camera.step;
    }

    state.tree.forEach(draw.tree);
}, 30);

// listen keyboard
document.onkeydown = (e) => {
    if ( e.keyCode == 37 ) {
        state.keyboard.left = true;
    }
    if ( e.keyCode == 38 ) {
        state.keyboard.up = true;
    }
    if ( e.keyCode == 39 ) {
        state.keyboard.right = true;
    }
    if ( e.keyCode == 40 ) {
        state.keyboard.down = true;
    }
};

document.onkeyup = (e) => {
    if ( e.keyCode == 37 ) {
        state.keyboard.left = false;
    }
    if ( e.keyCode == 38 ) {
        state.keyboard.up = false;
    }
    if ( e.keyCode == 39 ) {
        state.keyboard.right = false;
    }
    if ( e.keyCode == 40 ) {
        state.keyboard.down = false;
    }
};