"use strict";

function createTree() {
    let points = [];
    let colors = [];
    let normals = [];
    let count = 12;
    let angleStep = Math.PI * 2 / count;
    let radius = 10;
    let height = 500;
    let halfHeight = height / 2;
    // brown
    let r = 51, g = 19, b = 3;

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
            halfHeight,

            x1,
            y1,
            halfHeight,
            
            0,
            0,
            halfHeight
        );

        normals.push(
            0, 1, 0,
            0, 1, 0,
            0, 1, 0
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
            -halfHeight,
            
            x1,
            y1,
            -halfHeight,

            x0,
            y0,
            halfHeight,



            x1,
            y1,
            halfHeight,

            x0,
            y0,
            halfHeight,

            x1,
            y1,
            -halfHeight
        );

        normals.push(
            nx0, ny0, 0,
            nx1, ny1, 0,
            nx0, ny0, 0,

            nx1, ny1, 0,
            nx0, ny0, 0,
            nx1, ny1, 0
        );

        colors.push(
            r, g, b,
            r, g, b,
            r, g, b,
            
            r, g, b,
            r, g, b,
            r, g, b
        );
    

        a0 = a1;
        a1 += angleStep;
    }

    return {points, colors, normals};
}

module.exports = createTree;