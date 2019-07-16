const canvas = document.getElementById('sky_canvas');
const ctx = canvas.getContext('2d');

ctx.fillStyle = '#DDDDDD';
ctx.strokeStyle = 'black';

ctx.beginPath();
ctx.arc(200, 200, 200, 0, 2 * Math.PI);
ctx.stroke();
ctx.fill();

ctx.fillStyle = 'black';

ctx.beginPath();
ctx.arc(150, 140, 5, 0, 2 * Math.PI);
ctx.fill();

ctx.beginPath();
ctx.arc(260, 160, 2, 0, 2 * Math.PI);
ctx.fill();

ctx.beginPath();
ctx.arc(240, 250, 4, 0, 2 * Math.PI);
ctx.fill();

ctx.fillStyle = 'black';

ctx.textAlign = 'center';
ctx.font = '20px serif';

ctx.fillText('N', 200, 20);
