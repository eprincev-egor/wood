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
            attribute vec3 a_normal;
            
            uniform vec3 u_lightWorldPosition;
            uniform vec3 u_viewWorldPosition;
            
            uniform mat4 u_world;
            uniform mat4 u_worldViewProjection;
            uniform mat4 u_worldInverseTranspose;
            
            varying vec3 v_normal;
            
            varying vec3 v_surfaceToLight;
            varying vec3 v_surfaceToView;
            
            void main() {
            // Multiply the position by the matrix.
            gl_Position = u_worldViewProjection * a_position;
            
            // orient the normals and pass to the fragment shader
            v_normal = mat3(u_worldInverseTranspose) * a_normal;
            
            // compute the world position of the surface
            vec3 surfaceWorldPosition = (u_world * a_position).xyz;
            
            // compute the vector of the surface to the light
            // and pass it to the fragment shader
            v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;
            
            // compute the vector of the surface to the view/camera
            // and pass it to the fragment shader
            v_surfaceToView = u_viewWorldPosition - surfaceWorldPosition;
            }
        `);

        this.fragmentShader = f.createShader(gl, gl.FRAGMENT_SHADER, `
            precision mediump float;

            // Passed in from the vertex shader.
            varying vec3 v_normal;
            varying vec3 v_surfaceToLight;
            varying vec3 v_surfaceToView;
            
            uniform vec4 u_color;
            uniform float u_shininess;
            uniform vec3 u_lightDirection;
            uniform float u_innerLimit;          // in dot space
            uniform float u_outerLimit;          // in dot space
            
            void main() {
            // because v_normal is a varying it's interpolated
            // we it will not be a uint vector. Normalizing it
            // will make it a unit vector again
            vec3 normal = normalize(v_normal);
            
            vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
            vec3 surfaceToViewDirection = normalize(v_surfaceToView);
            vec3 halfVector = normalize(surfaceToLightDirection + surfaceToViewDirection);
            
            float dotFromDirection = dot(surfaceToLightDirection,
                                        -u_lightDirection);
            float inLight = smoothstep(u_outerLimit, u_innerLimit, dotFromDirection);
            float light = inLight * dot(normal, surfaceToLightDirection);
            float specular = inLight * pow(dot(normal, halfVector), u_shininess);
            
            gl_FragColor = u_color;
            
            // Lets multiply just the color portion (not the alpha)
            // by the light
            gl_FragColor.rgb *= light;
            
            // Just add in the specular
            gl_FragColor.rgb += specular;
            }
        `);

        let program = f.createProgram(gl, this.vertexShader, this.fragmentShader);
        this.program = program;

        // look up where the vertex data needs to go.
        this.positionLocation = gl.getAttribLocation(program, "a_position");
        this.normalLocation = gl.getAttribLocation(program, "a_normal");
        
        
        // lookup uniforms
        this.colorLocation = gl.getUniformLocation(program, "u_color");
        this.worldViewProjectionLocation = gl.getUniformLocation(program, "u_worldViewProjection");
        this.worldInverseTransposeLocation = gl.getUniformLocation(program, "u_worldInverseTranspose");
        this.shininessLocation = gl.getUniformLocation(program, "u_shininess");
        this.lightDirectionLocation = gl.getUniformLocation(program, "u_lightDirection");
        this.innerLimitLocation = gl.getUniformLocation(program, "u_innerLimit");
        this.outerLimitLocation = gl.getUniformLocation(program, "u_outerLimit");
        this.lightWorldPositionLocation = gl.getUniformLocation(program, "u_lightWorldPosition");
        this.viewWorldPositionLocation = gl.getUniformLocation(program, "u_viewWorldPosition");
        this.worldLocation = gl.getUniformLocation(program, "u_world");

        
        // create cylinder points
        let treeInfo = createTree();
        this.treeInfo = treeInfo;
    
        // Create a buffer to put positions in
        let positionBuffer = gl.createBuffer();
        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        // Put geometry data into buffer
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(treeInfo.points), gl.STATIC_DRAW);

        this.positionBuffer = positionBuffer;


        let normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(treeInfo.normals), gl.STATIC_DRAW);

        this.normalBuffer = normalBuffer;
    }

    draw({
        camera, trees, width, height
    }) {
        let {
            canvas, gl, 
            positionLocation, program,
            colorLocation,
            normalLocation,
            worldViewProjectionLocation,
            worldInverseTransposeLocation,
            shininessLocation,
            lightDirectionLocation,
            innerLimitLocation,
            outerLimitLocation,
            lightWorldPositionLocation,
            viewWorldPositionLocation,
            worldLocation,
            positionBuffer,
            normalBuffer,
            treeInfo
        } = this;

        canvas.width = width;
        canvas.height = height;
    
        // Tell WebGL how to convert from clip space to pixels
        gl.viewport(0, 0, width, height);
    
        // Clear the canvas AND the depth buffer.
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
        // Turn on culling. By default backfacing triangles
        // will be culled.
        gl.enable(gl.CULL_FACE);
    
        // Enable the depth buffer
        gl.enable(gl.DEPTH_TEST);
    
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
        
        // Turn on the normal attribute
        gl.enableVertexAttribArray(normalLocation);

        // Bind the normal buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    
        // Tell the attribute how to get data out of normalBuffer (ARRAY_BUFFER)
        size = 3;          // 3 components per iteration
        type = gl.FLOAT;   // the data is 32bit floating point values
        normalize = false; // normalize the data (convert from 0-255 to 0-1)
        stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
        offset = 0;        // start at the beginning of the buffer
        gl.vertexAttribPointer(
            normalLocation, size, type, normalize, stride, offset);
    
        
        // Compute the projection matrix
        let aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        let zNear = 1;
        let zFar = 2000;
        let projectionMatrix = f.perspective(60 * Math.PI / 180, aspect, zNear, zFar);

        // target for light
        let target = [0, 35, 0];
        let up = [0, 1, 0];

        // Compute the camera's matrix
        let radius = 200;
        let cameraMatrix = f.translation(camera.x, -camera.y, radius * 2);

        // Make a view matrix from the camera matrix.
        let viewMatrix = f.inverse(cameraMatrix);

        // Compute a view projection matrix
        let viewProjectionMatrix = f.multiply(projectionMatrix, viewMatrix);

        // Set the color to use
        gl.uniform4fv(colorLocation, [
            // dark-gray-blue
            // 81 / 256, 
            // 107 / 256, 
            // 130 / 256, 
            
            // white
            1,
            1,
            1,

            // alpha
            1
        ]);

        // set the light position
        const lightPosition = [40, 60, 120];
        gl.uniform3fv(lightWorldPositionLocation, lightPosition);

        // set the camera/view position
        gl.uniform3fv(viewWorldPositionLocation, [camera.x, camera.y, 0]);

        // set the shininess
        gl.uniform1f(shininessLocation, 150);

        // set the spotlight uniforms

        // since we don't have a plane like most spotlight examples
        // let's point the spot light at the F
        let lmat = f.lookAt(lightPosition, target, up);
        lmat = f.multiply(f.xRotation(0), lmat);
        lmat = f.multiply(f.yRotation(0), lmat);
        // get the zAxis from the matrix
        // negate it because lookAt looks down the -Z axis
        let lightDirection = [-lmat[8], -lmat[9],-lmat[10]];

        gl.uniform3fv(lightDirectionLocation, lightDirection);
        gl.uniform1f(innerLimitLocation, Math.cos(0));
        gl.uniform1f(outerLimitLocation, Math.cos(25 * Math.PI / 180));

        // Draw the geometry.
        trees.forEach(tree => {
            
            // Draw a F at the origin
            let worldMatrix = f.yRotation(0);
            worldMatrix = f.translate(worldMatrix, tree.x, tree.y, 0);

            // Multiply the matrices.
            let worldViewProjectionMatrix = f.multiply(viewProjectionMatrix, worldMatrix);
            let worldInverseMatrix = f.inverse(worldMatrix);
            let worldInverseTransposeMatrix = f.transpose(worldInverseMatrix);

            // Set the matrices
            gl.uniformMatrix4fv(worldViewProjectionLocation, false, worldViewProjectionMatrix);
            gl.uniformMatrix4fv(worldInverseTransposeLocation, false, worldInverseTransposeMatrix);
            gl.uniformMatrix4fv(worldLocation, false, worldMatrix);

            gl.drawArrays(gl.TRIANGLES, 0, treeInfo.points.length / 3);
        });

    }
}

module.exports = Drawer;