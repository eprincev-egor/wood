"use strict";

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

let width, height;
let state = {
    keyboard: {
        up: false,
        down: false,
        left: false,
        right: false
    },
    aliens: [{
        step: 3,
        x: 0,
        y: 0,
        color: "red",
        size: 10
    }]
};

let draw = {
    alien(alien) {
        ctx.fillStyle = alien.color;
        ctx.fillRect(
            alien.x - alien.size / 2, 
            alien.y - alien.size / 2, 
            alien.size,
            alien.size
        );
    }
};

setInterval(() => {
    width = canvas.width = document.body.offsetWidth,
    height = canvas.height = document.body.offsetHeight;
    
    let firstAlien = state.aliens[0];
    if ( state.keyboard.up ) {
        firstAlien.y -= firstAlien.step;
    }
    if ( state.keyboard.down ) {
        firstAlien.y += firstAlien.step;
    }
    if ( state.keyboard.left ) {
        firstAlien.x -= firstAlien.step;
    }
    if ( state.keyboard.right ) {
        firstAlien.x += firstAlien.step;
    }

    state.aliens.forEach(draw.alien);
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