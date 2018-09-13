"use strict";

// https://webglfundamentals.org/webgl/resources/m4.js

// helpers
let f = {
    createShader(gl, type, source) {
        let shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
    },

    createProgram(gl, vertexShader, fragmentShader) {
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

    subtractVectors(a, b, dst) {
        dst = dst || new Float32Array(3);
        dst[0] = a[0] - b[0];
        dst[1] = a[1] - b[1];
        dst[2] = a[2] - b[2];
        return dst;
    },

    xRotation(angleInRadians, dst) {
        dst = dst || new Float32Array(16);
        let c = Math.cos(angleInRadians);
        let s = Math.sin(angleInRadians);
  
        dst[ 0] = 1;
        dst[ 1] = 0;
        dst[ 2] = 0;
        dst[ 3] = 0;
        dst[ 4] = 0;
        dst[ 5] = c;
        dst[ 6] = s;
        dst[ 7] = 0;
        dst[ 8] = 0;
        dst[ 9] = -s;
        dst[10] = c;
        dst[11] = 0;
        dst[12] = 0;
        dst[13] = 0;
        dst[14] = 0;
        dst[15] = 1;
  
        return dst;
    },

    yRotation(angleInRadians, dst) {
        dst = dst || new Float32Array(16);
        let c = Math.cos(angleInRadians);
        let s = Math.sin(angleInRadians);
  
        dst[ 0] = c;
        dst[ 1] = 0;
        dst[ 2] = -s;
        dst[ 3] = 0;
        dst[ 4] = 0;
        dst[ 5] = 1;
        dst[ 6] = 0;
        dst[ 7] = 0;
        dst[ 8] = s;
        dst[ 9] = 0;
        dst[10] = c;
        dst[11] = 0;
        dst[12] = 0;
        dst[13] = 0;
        dst[14] = 0;
        dst[15] = 1;
  
        return dst;
    },

    transpose(m, dst) {
        dst = dst || new Float32Array(16);
  
        dst[ 0] = m[0];
        dst[ 1] = m[4];
        dst[ 2] = m[8];
        dst[ 3] = m[12];
        dst[ 4] = m[1];
        dst[ 5] = m[5];
        dst[ 6] = m[9];
        dst[ 7] = m[13];
        dst[ 8] = m[2];
        dst[ 9] = m[6];
        dst[10] = m[10];
        dst[11] = m[14];
        dst[12] = m[3];
        dst[13] = m[7];
        dst[14] = m[11];
        dst[15] = m[15];
  
        return dst;
    },

    lookAt(cameraPosition, target, up, dst) {
        dst = dst || new Float32Array(16);
        let zAxis = f.normalize(
            f.subtractVectors(cameraPosition, target));
        let xAxis = f.normalize(f.cross(up, zAxis));
        let yAxis = f.normalize(f.cross(zAxis, xAxis));
  
        dst[ 0] = xAxis[0];
        dst[ 1] = xAxis[1];
        dst[ 2] = xAxis[2];
        dst[ 3] = 0;
        dst[ 4] = yAxis[0];
        dst[ 5] = yAxis[1];
        dst[ 6] = yAxis[2];
        dst[ 7] = 0;
        dst[ 8] = zAxis[0];
        dst[ 9] = zAxis[1];
        dst[10] = zAxis[2];
        dst[11] = 0;
        dst[12] = cameraPosition[0];
        dst[13] = cameraPosition[1];
        dst[14] = cameraPosition[2];
        dst[15] = 1;
  
        return dst;
    },

    cross(a, b, dst) {
        dst = dst || new Float32Array(3);
        dst[0] = a[1] * b[2] - a[2] * b[1];
        dst[1] = a[2] * b[0] - a[0] * b[2];
        dst[2] = a[0] * b[1] - a[1] * b[0];
        return dst;
    },

    normalize(v, dst) {
        dst = dst || new Float32Array(3);
        let length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
        // make sure we don't divide by 0.
        if (length > 0.00001) {
            dst[0] = v[0] / length;
            dst[1] = v[1] / length;
            dst[2] = v[2] / length;
        }
        return dst;
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

    translate(m, tx, ty, tz) {
        return f.multiply(m, f.translation(tx, ty, tz));
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
    },

    cylinder({
        length = 500,
        radius = 10
    }) {
        let count = 12;
        let points = [];
        let normals = [];
        let angleStep = Math.PI * 2 / count;
        let halfLength = length / 2;

        let a0 = 0, a1 = angleStep;
        for (let i = 0; i < count; i++) {
            let 
                // normal
                nx0 = Math.cos(a0),
                ny0 = Math.sin(a0), 
                // point
                x0 = radius * nx0,
                y0 = radius * ny0,
                // normal
                nx1 = Math.cos(a1),
                ny1 = Math.sin(a1),
                // point
                x1 = radius * nx1,
                y1 = radius * ny1;
    
            // face
            points.push(
                x0,
                y0,
                halfLength,

                x1,
                y1,
                halfLength,
            
                0,
                0,
                halfLength
            );

            normals.push(
                0, 1, 0,
                0, 1, 0,
                0, 1, 0
            );

            // wall
            points.push(
                x0,
                y0,
                -halfLength,
            
                x1,
                y1,
                -halfLength,

                x0,
                y0,
                halfLength,



                x1,
                y1,
                halfLength,

                x0,
                y0,
                halfLength,

                x1,
                y1,
                -halfLength
            );

            normals.push(
                nx0, ny0, 0,
                nx1, ny1, 0,
                nx0, ny0, 0,

                nx1, ny1, 0,
                nx0, ny0, 0,
                nx1, ny1, 0
            );

            a0 = a1;
            a1 += angleStep;
        }

        return {points, normals};
    },

    cableSegment({
        fromX,
        fromY,
        toX,
        toY
    }) {
        let points = [];
        let normals = [];
        let z = -240;
        let radius = 5;
        let count = 12;
        let angleStep = Math.PI * 2 / count;


        let dx = toX - fromX;
        let dy = toY - fromY;
        let length = Math.sqrt( dx * dx + dy * dy );
        let circlesCount = Math.ceil( length / radius );
        let vx = dx / circlesCount;
        let vy = dy / circlesCount;
        let cx = fromX;
        let cy = fromY;

        for (let j = 0; j < circlesCount; j++) {
            
            let a0 = 0, a1 = angleStep;
            for (let i = 0; i < count; i++) {
                let 
                    // normal
                    nx0 = Math.cos(a0),
                    ny0 = Math.sin(a0), 
                    // point
                    x0 = radius * nx0,
                    y0 = radius * ny0,
                    // normal
                    nx1 = Math.cos(a1),
                    ny1 = Math.sin(a1),
                    // point
                    x1 = radius * nx1,
                    y1 = radius * ny1;

                points.push(
                    cx + x0,
                    cy + y0,
                    z,

                    cx + x1,
                    cy + y1,
                    z,
                
                    cx,
                    cy,
                    z
                );

                normals.push(
                    1, 1, 0,
                    1, 1, 0,
                    1, 1, 0
                );

                a0 = a1;
                a1 += angleStep;
            }

            cx += vx;
            cy += vy;
        }

        return {points, normals};
    }
};

module.exports = f;