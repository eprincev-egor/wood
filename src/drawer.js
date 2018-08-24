"use strict";

const f = require("./helpers");
const createTree = require("./tree");

class Drawer {
    constructor(canvas) {
        let gl = canvas.getContext("webgl");
        this.gl = gl;
        this.canvas = canvas;

        this.vertexShader = f.createShader(gl, gl.VERTEX_SHADER, `
            attribute vec4 a_position;
            attribute vec4 a_color;
            
            uniform mat4 u_matrix;
            
            varying vec4 v_color;
            
            void main() {
                // Multiply the position by the matrix.
                gl_Position = u_matrix * a_position;
                
                // Pass the color to the fragment shader.
                v_color = a_color;
            }
        `);

        this.fragmentShader = f.createShader(gl, gl.FRAGMENT_SHADER, `
            precision mediump float;

            // Passed in from the vertex shader.
            varying vec4 v_color;
            
            void main() {
                gl_FragColor = v_color;
            }
        `);

        this.program = f.createProgram(gl, this.vertexShader, this.fragmentShader),

        // look up where the vertex data needs to go.
        this.positionLocation = gl.getAttribLocation(this.program, "a_position"),
        this.colorLocation = gl.getAttribLocation(this.program, "a_color"),

        // lookup uniforms
        this.matrixLocation = gl.getUniformLocation(this.program, "u_matrix");
    }

    draw({camera, trees}) {
        let {
            canvas, gl, 
            positionLocation, program,
            colorLocation,
            matrixLocation
        } = this;

        canvas.width = document.body.offsetWidth,
        canvas.height = document.body.offsetHeight;
    
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    
        // Clear the canvas AND the depth buffer.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
        // Turn on culling. By default backfacing triangles
        // will be culled.
        gl.enable(gl.CULL_FACE);
    
        // Enable the depth buffer
        gl.enable(gl.DEPTH_TEST);
    
        // create cylinder points
        let treeInfo = createTree();
    
        // Create a buffer to put positions in
        let positionBuffer = gl.createBuffer();
        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        // Put geometry data into buffer
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(treeInfo.points), gl.STATIC_DRAW);
    
        // Create a buffer to put colors in
        let colorBuffer = gl.createBuffer();
        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = colorBuffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        // Put color data into buffer
        gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(treeInfo.colors), gl.STATIC_DRAW);
    
        // Tell it to use our program (pair of shaders)
        gl.useProgram(program);
    
        // Turn on the position attribute
        gl.enableVertexAttribArray(positionLocation);
    
        // Bind the position buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    
        let size, type, normalize, stride, offset;
    
        // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
        size = 3;          // 3 components per iteration
        type = gl.FLOAT;   // the data is 32bit floats
        normalize = false; // don't normalize the data
        stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            positionLocation, size, type, normalize, stride, offset);
    
        // Turn on the color attribute
        gl.enableVertexAttribArray(colorLocation);
    
        // Bind the color buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    
        // Tell the attribute how to get data out of colorBuffer (ARRAY_BUFFER)
        size = 3;                 // 3 components per iteration
        type = gl.UNSIGNED_BYTE;  // the data is 8bit unsigned values
        normalize = true;         // normalize the data (convert from 0-255 to 0-1)
        stride = 0;               // 0 = move forward size * sizeof(type) each iteration to get the next position
        offset = 0;               // start at the beginning of the buffer
        gl.vertexAttribPointer(
            colorLocation, size, type, normalize, stride, offset);
    
    
        let radius = 200;
    
        // Compute the projection matrix
        let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        let zNear = 1;
        let zFar = 2000;
        let deg60 = 1 / 3 * Math.PI;
        let projectionMatrix = f.perspective(deg60, aspect, zNear, zFar);
    
        // Use matrix math to compute a position on a circle where
        // the camera is
        let cameraMatrix = f.translation(camera.x, -camera.y, radius * 2);
    
        // Make a view matrix from the camera matrix
        let viewMatrix = f.inverse(cameraMatrix);
    
        // Compute a view projection matrix
        let viewProjectionMatrix = f.multiply(projectionMatrix, viewMatrix);
    
        trees.forEach(tree => {
            let matrix = f.translate(viewProjectionMatrix, tree.x, tree.y, 0);
    
            // Set the matrix.
            gl.uniformMatrix4fv(matrixLocation, false, matrix);
    
            // Draw the geometry.
            gl.drawArrays(gl.TRIANGLES, 0, treeInfo.points.length / 3);
        });
    }
}

module.exports = Drawer;