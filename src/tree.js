"use strict";

function createTree() {
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

module.exports = createTree;