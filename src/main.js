"use strict";

const canvas = document.createElement("canvas");
canvas.style.position = "fixed";
canvas.style.width = "100%";
canvas.style.height = "100%";

const gl = canvas.getContext("webgl");

let width, height;
let state = {
    keyboard: {
        up: false,
        down: false,
        left: false,
        right: false
    }
};


function createShader(type, source) {
    let shader = gl.createShader(type);
    gl.shaderSource(type, source);
    gl.compileShader(shader);
    return shader;
}

function createProgramm(vertexShader, fragmentShader) {
    let programm = gl.createProgram();
    
    gl.attachShader(programm, vertexShader);
    gl.attachShader(programm, fragmentShader);

    gl.linkProgram(programm);

    return programm;
}


setTimeout(() => {
    document.body.appendChild(canvas);
    width = canvas.width = document.body.offsetWidth,
    height = canvas.height = document.body.offsetHeight;


    let vertexShader = createShader(gl.VERTEX_SHADER, `
        attribute vec4 a_position;

        void main() {
            gl_Position = a_position;
        }
    `);
    let fragmentShader = createShader(gl.FRAGMENT_SHADER, `
        precision mediump float;

        void main() {
            gl_FragColor = vec4(1, 0, 0.5, 1);
        }
    `);

    let programm = createProgramm(vertexShader, fragmentShader);

    let positionAttr = gl.getAttribLocation(programm, "a_posiiton");
    let positionBuffer = gl.createBuffer();
    let positions = [
        0, 0,
        0, 0.5,
        0.7, 0
    ];
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    gl.viewport(0, 0, width, height);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(programm);

    gl.enableVertexAttribArray(positionAttr);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    gl.vertexAttribPointer(
        positionAttr,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.drawArrays(
        gl.TRIANGLES,
        0,
        3
    );
});




// ===
// setInterval(() => {
//     width = canvas.width = document.body.offsetWidth,
//     height = canvas.height = document.body.offsetHeight;
    
// }, 30);

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