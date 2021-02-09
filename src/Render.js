export default ({cframe, canvas, types, getMousePos, getScaledMousePos, getClickedObjectId, getClickedPoint, updateEpisode, select, clearPoint}) => {
    let ctx = canvas.getContext('2d');
    const updateCanvas = (c, cf) => {
        cframe = cf;
        canvas = c;
        ctx = c.getContext('2d');
    }
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
        let d = ["Debug info:"];
        for (const [key, value] of Object.entries(data)) {
            d.push(`${key}: ${value}`);
        }
        window.SF.debug.data = d;
    };
    window.SF.camera = [3 * window.SF.scale - canvas.width / 2, 3 * window.SF.scale - canvas.height / 2];
    const isInView = (x, y) => {
        let left = window.SF.camera[0] / window.SF.scale;
        let right = left + (canvas.width / window.SF.scale);
        let top = window.SF.camera[1] / window.SF.scale;
        let bottom = top + (canvas.height / window.SF.scale);
        return (x >= left && x <= right && y >= top && y <= bottom);
    };
    const toCanvasCoords = (x, y) => {
        return [
            x * window.SF.scale - window.SF.camera[0],
            y * window.SF.scale - window.SF.camera[1]
        ];
    };
    var movingCamera = [];
    var movingObject = [];
    var movingPoint = [];
    const getPair = (pointType) => {
        if(pointType == 'main-out') return 'main-in';
        if(pointType == 'main-in') return 'main-out';
        if(pointType == 'logical-out') return 'logical-in';
        if(pointType == 'logical-in') return 'logical-out';
    }
    const handleMovePointEnd = (mp) => {
        if(mp.length != 0){
            let click = getScaledMousePos();
            let point = getClickedPoint(click[0], click[1]);
            if(point){
                if(mp[0].module.id != point.module.id){
                    if(point){
                        if(getPair(mp[0].point.data.type) == point.point.data.type){
                            clearPoint(mp[0].module.id, mp[0].point.index);
                            clearPoint(point.module.id, point.point.index);
                            let elfrom = window.SF.episode[mp[0].module.id];
                            let elto = window.SF.episode[point.module.id];
                            if(mp[0].point.data.type.endsWith('-out')){
                                elfrom.points[mp[0].point.index] = {id: point.module.id, index: point.point.index}
                            }
                            else{
                                elto.points[point.point.index] = {id: mp[0].module.id, index: mp[0].point.index}
                            }
                            updateEpisode();
                        }
                    }
                }
            }
        }
    };
    canvas.addEventListener("mousedown", () => {
        let click = getScaledMousePos();
        let clickPoint = getClickedPoint(click[0], click[1]);
        if(!clickPoint){
            let clickObj = getClickedObjectId(click[0], click[1]);
            if(click != null && clickObj != null){
                select(clickObj);
                if(!types[window.SF.episode[clickObj].type].default){
                    let coords = getMousePos();
                    let coordsOnCanvas = toCanvasCoords(window.SF.episode[clickObj].position.x, window.SF.episode[clickObj].position.y);
                    if(coords != null) movingObject = [clickObj, window.SF.camera[0] + coordsOnCanvas[0] - coords[0], window.SF.camera[1] + coordsOnCanvas[1] - coords[1]];
                }
            }
            else{
                select();
                let coords = getMousePos();
                if(coords != null) movingCamera = [window.SF.camera[0] + coords[0], window.SF.camera[1] + coords[1]];
            }
        }
        else{
            let coords = getMousePos();
            if(coords){
                let coordsOnCanvas = toCanvasCoords(window.SF.episode[clickPoint.module.id].position.x + types[clickPoint.module.type].points[clickPoint.point.index].position.x, window.SF.episode[clickPoint.module.id].position.y + types[clickPoint.module.type].points[clickPoint.point.index].position.y);
                movingPoint = [clickPoint, coordsOnCanvas[0], coordsOnCanvas[1], coords[0], coords[1]];
                movingPoint[5] = ((movingPoint[1] + (coords[0] - movingPoint[3]) + window.SF.camera[0]) / window.SF.scale);
                movingPoint[6] = ((movingPoint[2] + (coords[1] - movingPoint[4]) + window.SF.camera[1]) / window.SF.scale);
            }
        }
    })
    canvas.addEventListener("mousemove", (evt) => {
        if(movingCamera.length != 0){
            let rect = canvas.getBoundingClientRect();
            window.SF.camera[0] = movingCamera[0] - evt.clientX - rect.left;
            window.SF.camera[1] = movingCamera[1] - evt.clientY + rect.top;
        }
        else if(movingObject.length != 0){
            let rect = canvas.getBoundingClientRect();
            window.SF.episode[movingObject[0]].position.x = Math.round((movingObject[1] + evt.clientX - rect.left) / window.SF.scale);
            window.SF.episode[movingObject[0]].position.y = Math.round((movingObject[2] + evt.clientY - rect.top) / window.SF.scale);
            updateEpisode();
        }
        else if(movingPoint.length != 0){
            let coords = getMousePos();
            movingPoint[5] = ((movingPoint[1] + (coords[0] - movingPoint[3]) + window.SF.camera[0]) / window.SF.scale);
            movingPoint[6] = ((movingPoint[2] + (coords[1] - movingPoint[4]) + window.SF.camera[1]) / window.SF.scale);
        }
    });
    canvas.addEventListener("mouseup", () => {
        movingCamera = [];
        movingObject = [];
        handleMovePointEnd(movingPoint);
        movingPoint = [];
    })
    canvas.addEventListener("mouseleave", () => {
        movingCamera = [];
        movingObject = [];
        handleMovePointEnd(movingPoint);
        movingPoint = [];
    })
    canvas.addEventListener("wheel", (evt) => {
        let mousePos = getMousePos();
        if(movingCamera.length == 0 && movingObject.length == 0 && mousePos != null){
            if(evt.deltaY > 0)
                if(window.SF.scale > 5){
                    window.SF.scale -= 5;
                    window.SF.camera[0] -= (((window.SF.camera[0] + mousePos[0]) * (window.SF.scale + 5)) - ((window.SF.camera[0] + mousePos[0]) * window.SF.scale)) / (window.SF.scale + 5);
                    window.SF.camera[1] -= (((window.SF.camera[1] + mousePos[1]) * (window.SF.scale + 5)) - ((window.SF.camera[1] + mousePos[1]) * window.SF.scale)) / (window.SF.scale + 5);
                }
            if(evt.deltaY < 0)
                if(window.SF.scale < 40){
                    window.SF.scale += 5;
                    window.SF.camera[0] += (((window.SF.camera[0] + mousePos[0]) * window.SF.scale) - ((window.SF.camera[0] + mousePos[0]) * (window.SF.scale - 5))) / (window.SF.scale - 5);
                    window.SF.camera[1] += (((window.SF.camera[1] + mousePos[1]) * window.SF.scale) - ((window.SF.camera[1] + mousePos[1]) * (window.SF.scale - 5))) / (window.SF.scale - 5);
                }
        }
    })
    setInterval(()=>{
        let obj = {};
        obj["FPS"] = fps;
        obj["Camera"] = "[" + Math.round(window.SF.camera[0] * 100) / 100 + ", " + Math.round(window.SF.camera[1] * 100) / 100 + "]";
        obj["Scale"] = window.SF.scale;
        let mousePos = getMousePos();
        if(mousePos != null) obj["Mouse"] = "[" + Math.round(mousePos[0] * 100) / 100 + ", " + Math.round(mousePos[1]) / 100 + "]";
        let scaledMousePos = getScaledMousePos();
        if(scaledMousePos != null) obj["Scaled mouse"] = "[" + Math.round(scaledMousePos[0] * 100) / 100 + ", " + Math.round(scaledMousePos[1] * 100) / 100 + "]";
        if(window.SF.selectedId != "") {
            obj["Selected id"] = window.SF.selectedId;
            obj["Selected coords"] = "[" + window.SF.episode[window.SF.selectedId].position.x + ", " + window.SF.episode[window.SF.selectedId].position.y + "]";
        }
        if(movingPoint.length != 0) {
            obj["Point"] = JSON.stringify(movingPoint[0]);
            obj["Point coords"] = JSON.stringify(movingPoint.slice(1));
        }
        updateDebug(obj);
    }, 50);
    const drawGrid = ()=>{
        ctx.fillStyle = '#eeeeee';
        let startX = - ((window.SF.camera[0] / window.SF.scale) % 1);
        let startY = - ((window.SF.camera[1] / window.SF.scale) % 1);
        for (let position = startX * window.SF.scale; position < canvas.width; position += window.SF.scale) {
            ctx.fillRect(position, 0, 1, canvas.height);
        }
        for (let position = startY * window.SF.scale; position < canvas.height; position += window.SF.scale) {
            ctx.fillRect(0, position, canvas.width, 1);
        }
    };
    const drawPoint = (c, type) => {
        if(type == "main-out"){
            ctx.fillStyle = 'rgb(255, 255, 255)';
            ctx.beginPath();
            ctx.arc(c[0], c[1], window.SF.scale / 2 + 1, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = 'rgb(100, 100, 255)';
            ctx.beginPath();
            ctx.arc(c[0], c[1], window.SF.scale / 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = 'rgb(50, 50, 150)';
            ctx.beginPath();
            ctx.moveTo(c[0] + window.SF.scale / 4 + window.SF.scale / 10, c[1]);
            ctx.lineTo(c[0] - window.SF.scale / 4, c[1] - window.SF.scale / 4);
            ctx.lineTo(c[0] - window.SF.scale / 4, c[1] + window.SF.scale / 4);
            ctx.fill();
        }
        if(type == "main-in"){
            ctx.fillStyle = 'rgb(255, 255, 255)';
            ctx.beginPath();
            ctx.arc(c[0], c[1], window.SF.scale / 2 + 1, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = 'rgb(100, 100, 255)';
            ctx.beginPath();
            ctx.arc(c[0], c[1], window.SF.scale / 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = 'rgb(50, 50, 150)';
            ctx.beginPath();
            ctx.moveTo(c[0] + window.SF.scale / 4 + window.SF.scale / 10, c[1]);
            ctx.lineTo(c[0] - window.SF.scale / 4, c[1] - window.SF.scale / 4);
            ctx.lineTo(c[0] - window.SF.scale / 8, c[1]);
            ctx.lineTo(c[0] - window.SF.scale / 4, c[1] + window.SF.scale / 4);
            ctx.fill();
        }
        if(type == "logical-out"){
            ctx.fillStyle = 'rgb(255, 255, 255)';
            ctx.beginPath();
            ctx.arc(c[0], c[1], window.SF.scale / 2 + 1, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = 'rgb(175, 175, 175)';
            ctx.beginPath();
            ctx.arc(c[0], c[1], window.SF.scale / 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = 'rgb(100, 100, 100)';
            ctx.beginPath();
            ctx.lineTo(c[0] + window.SF.scale / 10, c[1] + window.SF.scale / 4);
            ctx.lineTo(c[0] + window.SF.scale / 4, c[1]);
            ctx.lineTo(c[0] + window.SF.scale / 10, c[1] - window.SF.scale / 4);
            ctx.lineTo(c[0] - window.SF.scale / 4, c[1] - window.SF.scale / 4);
            ctx.lineTo(c[0] - window.SF.scale / 4, c[1] + window.SF.scale / 4);
            ctx.fill();
        }
        if(type == "logical-in"){
            ctx.fillStyle = 'rgb(255, 255, 255)';
            ctx.beginPath();
            ctx.arc(c[0], c[1], window.SF.scale / 2 + 1, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = 'rgb(175, 175, 175)';
            ctx.beginPath();
            ctx.arc(c[0], c[1], window.SF.scale / 2, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = 'rgb(100, 100, 100)';
            ctx.beginPath();
            ctx.lineTo(c[0] + window.SF.scale / 4, c[1] + window.SF.scale / 4);
            ctx.lineTo(c[0] + window.SF.scale / 4, c[1] - window.SF.scale / 4);
            ctx.lineTo(c[0] - window.SF.scale / 4, c[1] - window.SF.scale / 4);
            ctx.lineTo(c[0] - window.SF.scale / 8, c[1]);
            ctx.lineTo(c[0] - window.SF.scale / 4, c[1] + window.SF.scale / 4);
            ctx.fill();
        }
    }
    const drawBlocks = ()=>{
        for (const [key, value] of Object.entries(window.SF.episode)) {
            types[value.type].points.forEach((element, index) => {
                let c = toCanvasCoords(value.position.x + element.position.x, value.position.y + element.position.y);
                let pointData = value.points[index];
                if(pointData){
                    let coords = toCanvasCoords(window.SF.episode[pointData.id].position.x + types[window.SF.episode[pointData.id].type].points[pointData.index].position.x, window.SF.episode[pointData.id].position.y + types[window.SF.episode[pointData.id].type].points[pointData.index].position.y);
                    ctx.beginPath();
                    ctx.moveTo(c[0], c[1]);
                    ctx.lineTo(coords[0], coords[1]);
                    ctx.strokeStyle = "rgb(0, 0, 0)";
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            });
            if(isInView(value.position.x, value.position.y) || isInView(value.position.x + types[value.type].width, value.position.y + types[value.type].height)){
                let a = toCanvasCoords(value.position.x, value.position.y);
                let b = toCanvasCoords(value.position.x + types[value.type].width, value.position.y + types[value.type].height);
                ctx.drawImage(types[value.type].texture, a[0], a[1], b[0] - a[0], b[1] - a[1]);
                if(window.SF.selectedId == key){
                    ctx.strokeStyle = "rgb(0, 0, 255)";
                    ctx.lineWidth = 2;
                    ctx.strokeRect(a[0] - 1, a[1] - 1, b[0] - a[0] + 2, b[1] - a[1] + 2);
                }
                types[value.type].points.forEach((element, index) => {
                    let c = toCanvasCoords(value.position.x + element.position.x, value.position.y + element.position.y);
                    let pointData = value.points[index];
                    if(pointData){
                        let coords = toCanvasCoords(window.SF.episode[pointData.id].position.x + types[window.SF.episode[pointData.id].type].points[pointData.index].position.x, window.SF.episode[pointData.id].position.y + types[window.SF.episode[pointData.id].type].points[pointData.index].position.y);
                        ctx.beginPath();
                        ctx.moveTo(c[0], c[1]);
                        ctx.lineTo(coords[0], coords[1]);
                        ctx.strokeStyle = "rgb(0, 0, 0)";
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                    if(movingPoint.length == 0 || element.type == getPair(movingPoint[0].point.data.type))
                        drawPoint(c, element.type);
                });
                let data = [];
                data.push(value.id || key);
                if(value.descr) data.push(value.descr);
                let shift = 0;
                data.forEach(line => {
                    ctx.fillStyle = 'rgb(0, 0, 0)';
                    ctx.font = `${Math.round(16 * window.SF.scale / 20)}px Calibri`;
                    ctx.fillText(line, a[0], a[1] - Math.round(6 * window.SF.scale / 20) - shift);
                    shift += Math.round(16 * window.SF.scale / 20);
                });
            }
        }
        if(movingPoint.length != 0){
            let c2 = toCanvasCoords(movingPoint[5], movingPoint[6]);
            drawPoint([movingPoint[1], movingPoint[2]], movingPoint[0].point.data.type);
            ctx.beginPath();
            ctx.moveTo(movingPoint[1], movingPoint[2]);
            ctx.lineTo(c2[0], c2[1]);
            ctx.strokeStyle = "rgb(0, 0, 0)";
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    };
    const drawDebug = () => {
        if(window.SF.debug.enabled){
            /*ctx.rect(10, 10, 100, 100);
            ctx.fill();*/
            
            ctx.fillStyle = 'rgb(0, 0, 0)';
            ctx.font = "16px Consolas";
            let shift = 0;
            window.SF.debug.data.forEach(line => {
                ctx.fillText(line, 5, 20 + shift);
                shift += 18;
            });
        }
    }
    //const coords 
    const draw = ()=>{
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid();
        drawBlocks();
        drawDebug();
        /*ctx.fillStyle = '#000';
        ctx.fillText(fps, 10, 10)*/
    };
    return {updateCanvas};
}