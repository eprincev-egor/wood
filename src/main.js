"use strict";

const canvas = document.createElement("canvas");
const gl = canvas.getContext("webgl");

canvas.style.position = "fixed";
canvas.style.width = "100%";
canvas.style.height = "100%";

setTimeout(() => {
    document.body.appendChild(canvas);
    
    let camera = {
            x: 0,
            y: 0
        },

        vertexShader = f.createShader(gl.VERTEX_SHADER, `
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
        `),

        fragmentShader = f.createShader(gl.FRAGMENT_SHADER, `
            precision mediump float;

            // Passed in from the vertex shader.
            varying vec4 v_color;
            
            void main() {
                gl_FragColor = v_color;
            }
        `),

        program = f.createProgram(vertexShader, fragmentShader),

        // look up where the vertex data needs to go.
        positionLocation = gl.getAttribLocation(program, "a_position"),
        colorLocation = gl.getAttribLocation(program, "a_color"),

        // lookup uniforms
        matrixLocation = gl.getUniformLocation(program, "u_matrix"),

        positionBuffer, 
        colorBuffer,

        // Draw the scene.
        drawScene = () => {
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
            let cylinder = getCylinder();

            // Create a buffer to put positions in
            positionBuffer = gl.createBuffer();
            // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
            // Put geometry data into buffer
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cylinder.points), gl.STATIC_DRAW);

            // Create a buffer to put colors in
            colorBuffer = gl.createBuffer();
            // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = colorBuffer)
            gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
            // Put color data into buffer
            gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array(cylinder.colors), gl.STATIC_DRAW);

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
            let matrix = f.multiply(projectionMatrix, viewMatrix);

            // Set the matrix.
            gl.uniformMatrix4fv(matrixLocation, false, matrix);

            // Draw the geometry.
            gl.drawArrays(gl.TRIANGLES, 0, cylinder.points.length / 3);
        };

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
        drawScene();
    };
    
    drawScene();
});

// helpers
let f = {
    createShader(type, source) {
        let shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
    },

    createProgram(vertexShader, fragmentShader) {
        let program = gl.createProgram();
        
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);

        gl.linkProgram(program);

        return program;
    },

    perspective(fieldOfViewInRadians, aspect, near, far) {
        let f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
        let rangeInv = 1.0 / (near - far);
  
        return [
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * rangeInv, -1,
            0, 0, near * far * rangeInv * 2, 0
        ];
    },

    multiply(a, b) {
        let a00 = a[0 * 4 + 0];
        let a01 = a[0 * 4 + 1];
        let a02 = a[0 * 4 + 2];
        let a03 = a[0 * 4 + 3];
        let a10 = a[1 * 4 + 0];
        let a11 = a[1 * 4 + 1];
        let a12 = a[1 * 4 + 2];
        let a13 = a[1 * 4 + 3];
        let a20 = a[2 * 4 + 0];
        let a21 = a[2 * 4 + 1];
        let a22 = a[2 * 4 + 2];
        let a23 = a[2 * 4 + 3];
        let a30 = a[3 * 4 + 0];
        let a31 = a[3 * 4 + 1];
        let a32 = a[3 * 4 + 2];
        let a33 = a[3 * 4 + 3];
        let b00 = b[0 * 4 + 0];
        let b01 = b[0 * 4 + 1];
        let b02 = b[0 * 4 + 2];
        let b03 = b[0 * 4 + 3];
        let b10 = b[1 * 4 + 0];
        let b11 = b[1 * 4 + 1];
        let b12 = b[1 * 4 + 2];
        let b13 = b[1 * 4 + 3];
        let b20 = b[2 * 4 + 0];
        let b21 = b[2 * 4 + 1];
        let b22 = b[2 * 4 + 2];
        let b23 = b[2 * 4 + 3];
        let b30 = b[3 * 4 + 0];
        let b31 = b[3 * 4 + 1];
        let b32 = b[3 * 4 + 2];
        let b33 = b[3 * 4 + 3];
        return [
            b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
            b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
            b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
            b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
            b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
            b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
            b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
            b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
            b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
            b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
            b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
            b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
            b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
            b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
            b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
            b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33
        ];
    },
  
    translation(tx, ty, tz) {
        return [
            1,  0,  0,  0,
            0,  1,  0,  0,
            0,  0,  1,  0,
            tx, ty, tz, 1
        ];
    },
  
    inverse(m) {
        let m00 = m[0 * 4 + 0];
        let m01 = m[0 * 4 + 1];
        let m02 = m[0 * 4 + 2];
        let m03 = m[0 * 4 + 3];
        let m10 = m[1 * 4 + 0];
        let m11 = m[1 * 4 + 1];
        let m12 = m[1 * 4 + 2];
        let m13 = m[1 * 4 + 3];
        let m20 = m[2 * 4 + 0];
        let m21 = m[2 * 4 + 1];
        let m22 = m[2 * 4 + 2];
        let m23 = m[2 * 4 + 3];
        let m30 = m[3 * 4 + 0];
        let m31 = m[3 * 4 + 1];
        let m32 = m[3 * 4 + 2];
        let m33 = m[3 * 4 + 3];
        let tmp_0  = m22 * m33;
        let tmp_1  = m32 * m23;
        let tmp_2  = m12 * m33;
        let tmp_3  = m32 * m13;
        let tmp_4  = m12 * m23;
        let tmp_5  = m22 * m13;
        let tmp_6  = m02 * m33;
        let tmp_7  = m32 * m03;
        let tmp_8  = m02 * m23;
        let tmp_9  = m22 * m03;
        let tmp_10 = m02 * m13;
        let tmp_11 = m12 * m03;
        let tmp_12 = m20 * m31;
        let tmp_13 = m30 * m21;
        let tmp_14 = m10 * m31;
        let tmp_15 = m30 * m11;
        let tmp_16 = m10 * m21;
        let tmp_17 = m20 * m11;
        let tmp_18 = m00 * m31;
        let tmp_19 = m30 * m01;
        let tmp_20 = m00 * m21;
        let tmp_21 = m20 * m01;
        let tmp_22 = m00 * m11;
        let tmp_23 = m10 * m01;
  
        let t0 = (tmp_0 * m11 + tmp_3 * m21 + tmp_4 * m31) -
          (tmp_1 * m11 + tmp_2 * m21 + tmp_5 * m31);
        let t1 = (tmp_1 * m01 + tmp_6 * m21 + tmp_9 * m31) -
          (tmp_0 * m01 + tmp_7 * m21 + tmp_8 * m31);
        let t2 = (tmp_2 * m01 + tmp_7 * m11 + tmp_10 * m31) -
          (tmp_3 * m01 + tmp_6 * m11 + tmp_11 * m31);
        let t3 = (tmp_5 * m01 + tmp_8 * m11 + tmp_11 * m21) -
          (tmp_4 * m01 + tmp_9 * m11 + tmp_10 * m21);
  
        let d = 1.0 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);
  
        return [
            d * t0,
            d * t1,
            d * t2,
            d * t3,
            d * ((tmp_1 * m10 + tmp_2 * m20 + tmp_5 * m30) -
              (tmp_0 * m10 + tmp_3 * m20 + tmp_4 * m30)),
            d * ((tmp_0 * m00 + tmp_7 * m20 + tmp_8 * m30) -
              (tmp_1 * m00 + tmp_6 * m20 + tmp_9 * m30)),
            d * ((tmp_3 * m00 + tmp_6 * m10 + tmp_11 * m30) -
              (tmp_2 * m00 + tmp_7 * m10 + tmp_10 * m30)),
            d * ((tmp_4 * m00 + tmp_9 * m10 + tmp_10 * m20) -
              (tmp_5 * m00 + tmp_8 * m10 + tmp_11 * m20)),
            d * ((tmp_12 * m13 + tmp_15 * m23 + tmp_16 * m33) -
              (tmp_13 * m13 + tmp_14 * m23 + tmp_17 * m33)),
            d * ((tmp_13 * m03 + tmp_18 * m23 + tmp_21 * m33) -
              (tmp_12 * m03 + tmp_19 * m23 + tmp_20 * m33)),
            d * ((tmp_14 * m03 + tmp_19 * m13 + tmp_22 * m33) -
              (tmp_15 * m03 + tmp_18 * m13 + tmp_23 * m33)),
            d * ((tmp_17 * m03 + tmp_20 * m13 + tmp_23 * m23) -
              (tmp_16 * m03 + tmp_21 * m13 + tmp_22 * m23)),
            d * ((tmp_14 * m22 + tmp_17 * m32 + tmp_13 * m12) -
              (tmp_16 * m32 + tmp_12 * m12 + tmp_15 * m22)),
            d * ((tmp_20 * m32 + tmp_12 * m02 + tmp_19 * m22) -
              (tmp_18 * m22 + tmp_21 * m32 + tmp_13 * m02)),
            d * ((tmp_18 * m12 + tmp_23 * m32 + tmp_15 * m02) -
              (tmp_22 * m32 + tmp_14 * m02 + tmp_19 * m12)),
            d * ((tmp_22 * m22 + tmp_16 * m02 + tmp_21 * m12) -
              (tmp_20 * m12 + tmp_23 * m22 + tmp_17 * m02))
        ];
    }
};

function getCylinder() {
    let points = [];
    let colors = [];
    let count = 12;
    let angleStep = Math.PI * 2 / count;
    let radius = 10;
    let height = 500;
    let halfHeight = height / 2;
    // brown
    let r = 51, g = 19, b = 3;

    let a0 = 0, a1 = angleStep;
    for (let i = 0; i < count; i++) {
        let x0 = radius * Math.cos(a0),
            y0 = radius * Math.sin(a0),
            x1 = radius * Math.cos(a1),
            y1 = radius * Math.sin(a1);
        
        // face
        points.push(
            x0,
            y0,
            -halfHeight
        );
        points.push(
            x1,
            y1,
            -halfHeight
        );
        points.push(
            0,
            0,
            -halfHeight
        );

        colors.push(
            r, g, b,
            r, g, b,
            r, g, b
        );

        // bottom
        points.push(
            x0,
            y0,
            halfHeight
        );
        points.push(
            x1,
            y1,
            halfHeight
        );
        points.push(
            0,
            0,
            halfHeight
        );

        colors.push(
            r, g, b,
            r, g, b,
            r, g, b
        );

        // wall
        points.push(
            x0,
            y0,
            -halfHeight
        );
        points.push(
            x1,
            y1,
            -halfHeight
        );
        points.push(
            x0,
            y0,
            halfHeight
        );

        colors.push(
            r, g, b,
            r, g, b,
            r, g, b
        );


        points.push(
            x1,
            y1,
            halfHeight
        );
        points.push(
            x0,
            y0,
            halfHeight
        );
        points.push(
            x1,
            y1,
            -halfHeight
        );

        colors.push(
            r, g, b,
            r, g, b,
            r, g, b
        );
        

        a0 = a1;
        a1 += angleStep;
    }

    return {points, colors};
}