export function draw_circle(context, position, size) {
    let hsize = size/2;

    context.beginPath();
    context.arc(position[0], position[1], hsize, 0, 2 * Math.PI);
    context.closePath();

    context.stroke();
    context.fill();
}

export function draw_cross(context, position, size) {
    let hsize = size/2;

    context.beginPath();
    context.moveTo(position[0] - hsize, position[1] - hsize);
    context.lineTo(position[0] + hsize, position[1] + hsize);
    context.closePath();

    context.stroke();

    context.beginPath();
    context.moveTo(position[0] - hsize, position[1] + hsize);
    context.lineTo(position[0] + hsize, position[1] - hsize);
    context.closePath();

    context.stroke();
}

export function draw_square(context, position, size) {
    let hsize = size/2;

    context.beginPath();
    context.moveTo(position[0] - hsize, position[1] - hsize);
    context.lineTo(position[0] - hsize, position[1] + hsize);
    context.lineTo(position[0] + hsize, position[1] + hsize);
    context.lineTo(position[0] + hsize, position[1] - hsize);
    context.lineTo(position[0] - hsize, position[1] - hsize);
    context.closePath();

    context.stroke();
    context.fill();
}

export function draw_dot(context, position, size) {
    draw_circle(context, position, size/5);
}
