const ctx = canvas.getContext('2d');
const updateSize = ()=>{
    canvas.height = cframe.offsetHeight;
    canvas.width = cframe.offsetWidth;
};
window.onresize = updateSize;
var lastFrameTime = performance.now();
var fps = 0;
updateSize();
const loop = ()=>{
    fps = Math.round(1000/(performance.now() - lastFrameTime));
    lastFrameTime = performance.now();
    draw();
    window.requestAnimationFrame(loop);
};
window.requestAnimationFrame(loop);
const updateDebug = (data)=>{
    let html = "<div><b>Debug info:</b></div>";
    for (const [key, value] of Object.entries(data)) {
        html += "<div><b>" + key + "</b>: " + value + "</div>";
    }
    debug.innerHTML = html;
};
setInterval(()=>{
    let obj = {};
    obj["FPS"] = fps;
    obj["Camera"] = "[" + Math.round(camera[0] * 100) / 100 + ", " + Math.round(camera[1] * 100) / 100 + "]";
    obj["Scale"] = scale;
    let mousePos = getMousePos();
    if(mousePos != null) obj["Mouse"] = "[" + Math.round(mousePos[0] * 100) / 100 + ", " + Math.round(mousePos[1]) / 100 + "]";
    let scaledMousePos = getScaledMousePos();
    if(scaledMousePos != null) obj["Scaled mouse"] = "[" + Math.round(scaledMousePos[0] * 100) / 100 + ", " + Math.round(scaledMousePos[1] * 100) / 100 + "]";
    if(selectedId != "") {
        obj["Selected id"] = selectedId;
        obj["Selected coords"] = "[" + episode[selectedId].position.x + ", " + episode[selectedId].position.y + "]";
    }
    updateDebug(obj);
}, 50);
var scale = 20;
var camera = [3 * scale - canvas.width / 2, 3 * scale - canvas.height / 2];
const isInView = (x, y) => {
    let left = camera[0] / scale;
    let right = left + (canvas.width / scale);
    let top = camera[1] / scale;
    let bottom = top + (canvas.height / scale);
    return (x >= left && x <= right && y >= top && y <= bottom);
};
const toCanvasCoords = (x, y) => {
    return [
        x * scale - camera[0],
        y * scale - camera[1]
    ];
};
var movingCamera = [];
var movingObject = [];
canvas.addEventListener("mousedown", (evt) => {
    let click = getScaledMousePos();
    let clickObj = getClickedObjectId(click[0], click[1]);
    if(click != null && clickObj != null){
        select(clickObj);
        if(!types[episode[clickObj].type].default){
            let coords = getMousePos();
            let coordsOnCanvas = toCanvasCoords(episode[clickObj].position.x, episode[clickObj].position.y);
            if(coords != null) movingObject = [clickObj, camera[0] + coordsOnCanvas[0] - coords[0], camera[1] + coordsOnCanvas[1] - coords[1]];
        }
    }
    else{
        select();
        let coords = getMousePos();
        if(coords != null) movingCamera = [camera[0] + coords[0], camera[1] + coords[1]];
    }
})
canvas.addEventListener("mousemove", (evt) => {
    if(movingCamera.length != 0){
        let rect = canvas.getBoundingClientRect();
        camera[0] = movingCamera[0] - evt.clientX - rect.left;
        camera[1] = movingCamera[1] - evt.clientY + rect.top;
    }
    else if(movingObject.length != 0){
        let rect = canvas.getBoundingClientRect();
        episode[movingObject[0]].position.x = Math.round((movingObject[1] + evt.clientX - rect.left) / scale);
        episode[movingObject[0]].position.y = Math.round((movingObject[2] + evt.clientY - rect.top) / scale);
        updateEpisode();
    }
});
canvas.addEventListener("mouseup", (evt) => {
    movingCamera = [];
    movingObject = [];
})
canvas.addEventListener("mouseleave", (evt) => {
    movingCamera = [];
    movingObject = [];
})
canvas.addEventListener("wheel", (evt) => {
    let mousePos = getMousePos();
    if(movingCamera.length == 0 && movingObject.length == 0 && mousePos != null){
        if(evt.deltaY > 0)
            if(scale > 5){
                scale -= 5;
                camera[0] -= (((camera[0] + mousePos[0]) * (scale + 5)) - ((camera[0] + mousePos[0]) * scale)) / (scale + 5);
                camera[1] -= (((camera[1] + mousePos[1]) * (scale + 5)) - ((camera[1] + mousePos[1]) * scale)) / (scale + 5);
            }
        if(evt.deltaY < 0)
            if(scale < 40){
                scale += 5;
                camera[0] += (((camera[0] + mousePos[0]) * scale) - ((camera[0] + mousePos[0]) * (scale - 5))) / (scale - 5);
                camera[1] += (((camera[1] + mousePos[1]) * scale) - ((camera[1] + mousePos[1]) * (scale - 5))) / (scale - 5);
            }
    }
})
const drawGrid = ()=>{
    ctx.fillStyle = '#eeeeee';
    let startX = - ((camera[0] / scale) % 1);
    let startY = - ((camera[1] / scale) % 1);
    for (let position = startX * scale; position < canvas.width; position += scale) {
        ctx.fillRect(position, 0, 1, canvas.height);
    }
    for (let position = startY * scale; position < canvas.height; position += scale) {
        ctx.fillRect(0, position, canvas.width, 1);
    }
};
const drawBlocks = ()=>{
    for (const [key, value] of Object.entries(episode)) {
        if(isInView(value.position.x, value.position.y) || isInView(value.position.x + types[value.type].width, value.position.y + types[value.type].height)){
            let a = toCanvasCoords(value.position.x, value.position.y);
            let b = toCanvasCoords(value.position.x + types[value.type].width, value.position.y + types[value.type].height);
            ctx.drawImage(types[value.type].texture, a[0], a[1], b[0] - a[0], b[1] - a[1]);
            if(selectedId == key){
                ctx.strokeStyle = "rgb(0, 0, 255)";
                ctx.lineWidth = 2;
                ctx.strokeRect(a[0] - 1, a[1] - 1, b[0] - a[0] + 2, b[1] - a[1] + 2);
            }
            types[value.type].points.forEach(element => {
                let c = toCanvasCoords(value.position.x + element.position.x, value.position.y + element.position.y);
                if(element.type == "main-out"){
                    ctx.fillStyle = 'rgb(255, 255, 255)';
                    ctx.beginPath();
                    ctx.arc(c[0], c[1], scale / 2 + 1, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.fillStyle = 'rgb(100, 100, 255)';
                    ctx.beginPath();
                    ctx.arc(c[0], c[1], scale / 2, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.fillStyle = 'rgb(50, 50, 150)';
                    ctx.beginPath();
                    ctx.moveTo(c[0] + scale / 4 + scale / 10, c[1]);
                    ctx.lineTo(c[0] - scale / 4, c[1] - scale / 4);
                    ctx.lineTo(c[0] - scale / 4, c[1] + scale / 4);
                    ctx.fill();
                }
                if(element.type == "main-in"){
                    ctx.fillStyle = 'rgb(255, 255, 255)';
                    ctx.beginPath();
                    ctx.arc(c[0], c[1], scale / 2 + 1, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.fillStyle = 'rgb(100, 100, 255)';
                    ctx.beginPath();
                    ctx.arc(c[0], c[1], scale / 2, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.fillStyle = 'rgb(50, 50, 150)';
                    ctx.beginPath();
                    ctx.moveTo(c[0] + scale / 4 + scale / 10, c[1]);
                    ctx.lineTo(c[0] - scale / 4, c[1] - scale / 4);
                    ctx.lineTo(c[0] - scale / 8, c[1]);
                    ctx.lineTo(c[0] - scale / 4, c[1] + scale / 4);
                    ctx.fill();
                }
                if(element.type == "logical-out"){
                    ctx.fillStyle = 'rgb(255, 255, 255)';
                    ctx.beginPath();
                    ctx.arc(c[0], c[1], scale / 2 + 1, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.fillStyle = 'rgb(175, 175, 175)';
                    ctx.beginPath();
                    ctx.arc(c[0], c[1], scale / 2, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.fillStyle = 'rgb(100, 100, 100)';
                    ctx.beginPath();
                    ctx.lineTo(c[0] + scale / 10, c[1] + scale / 4);
                    ctx.lineTo(c[0] + scale / 4, c[1]);
                    ctx.lineTo(c[0] + scale / 10, c[1] - scale / 4);
                    ctx.lineTo(c[0] - scale / 4, c[1] - scale / 4);
                    ctx.lineTo(c[0] - scale / 4, c[1] + scale / 4);
                    ctx.fill();
                }
                if(element.type == "logical-in"){
                    ctx.fillStyle = 'rgb(255, 255, 255)';
                    ctx.beginPath();
                    ctx.arc(c[0], c[1], scale / 2 + 1, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.fillStyle = 'rgb(175, 175, 175)';
                    ctx.beginPath();
                    ctx.arc(c[0], c[1], scale / 2, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.fillStyle = 'rgb(100, 100, 100)';
                    ctx.beginPath();
                    ctx.lineTo(c[0] + scale / 4, c[1] + scale / 4);
                    ctx.lineTo(c[0] + scale / 4, c[1] - scale / 4);
                    ctx.lineTo(c[0] - scale / 4, c[1] - scale / 4);
                    ctx.lineTo(c[0] - scale / 8, c[1]);
                    ctx.lineTo(c[0] - scale / 4, c[1] + scale / 4);
                    ctx.fill();
                }
            });
        }
    }
};
//const coords 
const draw = ()=>{
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawBlocks();
    /*ctx.fillStyle = '#000';
    ctx.fillText(fps, 10, 10)*/
};