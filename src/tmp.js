"use strict";

let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");

document.body.appendChild(canvas);

// set canvas size
canvas.width = document.body.offsetWidth,
canvas.height = document.body.offsetHeight;

function drawCircle({
    x = 0, y = 0,
    radius = 1,
    count = 12,
    color = "black"
}) {
    let angleStep = Math.PI * 2 / count;

    ctx.beginPath();
    for (let i = 0, n = Math.PI * 2; i < n; i += angleStep) {
        let nx = x + radius * Math.cos(i),
            ny = y + radius * Math.sin(i);
        
        ctx.lineTo(nx, ny);
    }

    ctx.fillStyle = color;
    ctx.fill();
}

drawCircle({
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: Math.min( canvas.height, canvas.width ) / 2
});