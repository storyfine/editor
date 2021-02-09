import types from './Types';
import Render from './Render';

import ExportCSHARP from './export/csharp';

const version = "1.0.0";
const defaults = [];

export default ({store}) => {
    const openfile = document.createElement('input');
    openfile.type = 'file';
    openfile.accept = '.sfep';
    openfile.style = 'display:none';
    document.body.appendChild(openfile);
    let canvas = null;
    let render = null;
    const getMousePos = () => {
        if(window.SF.mouse.length != 0){
            let rect = canvas.getBoundingClientRect();
            return [
                window.SF.mouse[0] - rect.left,
                window.SF.mouse[1] - rect.top
            ];
        }
        else return null;
    };
    const getScaledMousePos = () => {
        let mousePos = getMousePos();
        if(mousePos != null){
            return [
                mousePos[0] / window.SF.scale + window.SF.camera[0] / window.SF.scale,
                mousePos[1] / window.SF.scale + window.SF.camera[1] / window.SF.scale
            ];
        }
        else return null;
    }
    const getClickedObjectId = (x, y) => {
        for (const [key, value] of Object.entries(window.SF.episode).reverse()) {
            if(x >= value.position.x && x <= value.position.x + types[value.type].width && y >= value.position.y && y <= value.position.y + types[value.type].height) return key;
        }
        return null;
    }
    const getClickedPoint = (x, y) => {
        for (const [key, value] of Object.entries(window.SF.episode).reverse()) {
            const array = types[value.type].points;
            for (let index = 0; index < array.length; index++) {
                const point = array[index];
                if(x >= value.position.x + (point.position.x - 0.5) && x <= value.position.x + (point.position.x + 0.5) && y >= value.position.y + (point.position.y - 0.5) && y <= value.position.y + (point.position.y + 0.5)) return { module: {id: key, type: value.type}, point: {index, data: point}};
            }
        }
        return null;
    }
    const isvalid = (obj) => {
        try{
            if(typeof obj == "object"){
                for (const [key, value] of Object.entries(obj)) {
                    if(typeof key != "string") return false;
                    if(value.type == undefined) return false;
                    if(types[value.type] == undefined) return false;
                    if(value.position == undefined) return false;
                    if(value.position.x == undefined) return false;
                    if(value.position.y == undefined) return false;
                    if(value.points == undefined || typeof value.points != 'object') return false;
                }
                return true;
            }
            else return false;
        }
        catch{
            return false;
        }
    };
    const updateEpisode = () => {
        localStorage.setItem("episode", JSON.stringify(window.SF.episode));
    };
    let saved = localStorage.getItem("episode");
    const moveToEnd = (id) => {
        let newep = {};
        for (const [key, value] of Object.entries(window.SF.episode)) {
            if(key != id) newep[key] = value;
        }
        for (const [key, value] of Object.entries(window.SF.episode)) {
            if(key == id) newep[key] = value;
        }
        window.SF.episode = newep;
        updateEpisode();
    }
    const clearPoint = (id, index) => {
        delete window.SF.episode[id].points[index];
        for (const [key, value] of Object.entries(window.SF.episode)) {
            for (const [key2, value2] of Object.entries(value.points)) {
                if(value2.id == id && value2.index == index) 
                    delete window.SF.episode[key].points[key2];
            }
        }
    }
    const select = (id) => {
        if(id != undefined && window.SF.episode[id] != undefined){
            window.SF.selectedId = id;
            moveToEnd(window.SF.selectedId);
            store.commit('selectId', window.SF.selectedId);

            /*let html = "<p><b>Selected:</b> " + types[episode[selectedId].type].menu.name + "<br><b>Description:</b><br>" + types[episode[selectedId].type].menu.description + "</p>";
            if(!types[episode[selectedId].type].default) html += '<btn class="remove-btn" onclick="nav.objects.remove(\'' + id + '\')">Remove</btn>';
            $("controls").html(html);*/
        }
        else{
            window.SF.selectedId = "";
            store.commit('selectId', window.SF.selectedId);
            //$("controls").html("<b>Nothing is selected<b/>");
        }
    }
    select();
    const updateCanvas = (c, cf) => {
        if(!render) render = Render({cframe: cf, canvas: c, types, getMousePos, getScaledMousePos, getClickedObjectId, getClickedPoint, updateEpisode, clearPoint, select});
        canvas = c;
        canvas.addEventListener("mousemove", (evt) => {
            window.SF.mouse = [evt.clientX, evt.clientY];
        });
        canvas.addEventListener("mouseleave", () => {
            window.SF.mouse = [];
        });
        render.updateCanvas(c, cf);
    };
    const makeNewEpisode = () => {
        window.SF.episode = {};
        defaults.forEach(el => {
            window.SF.episode[el.type] = el;
        });
        updateEpisode();
    }
    const makeId = (length) => {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
    const makeUniqueId = () => {
        let result = "";
        while(true){
            result = makeId(8);
            let isUnique = true;
            for (const [key] of Object.entries(window.SF.episode)) {
                if(key == result) isUnique = false;
            }
            if(isUnique == true) break;
        }
        return result;
    }
    const addObj = (type) => {
        if(types[type] != undefined){
            window.SF.episode[makeUniqueId()] = {type: type, position: {x: Math.round((window.SF.camera[0] + canvas.width / 2) / window.SF.scale), y: Math.round((window.SF.camera[1] + canvas.height / 2) / window.SF.scale)}, points: {}}
        }
    }
    const removeObj = (id) => {
        if(window.SF.episode[id] != undefined){
            for (const [key, value] of Object.entries(window.SF.episode)) {
                for (const [key2, value2] of Object.entries(value.points)) {
                    if(value2.id == id) 
                        delete window.SF.episode[key].points[key2];
                }
            }
            select();
            delete window.SF.episode[id];
        }  
    }
    window.SF.removeObj = removeObj;
    window.SF.updateEpisode = updateEpisode;
    
    store.state.navbar.episode.push({
        click: () => {makeNewEpisode()},
        lang: "newep",
        class: {"fa-file": true}
    });
    store.state.navbar.episode.push({
        click: () => {openfile.click()},
        lang: "open",
        class: {"fa-folder-open": true}
    });
    openfile.addEventListener('change', () => {
        var reader = new FileReader();
        reader.readAsText(openfile.files[0], "UTF-8");
        reader.onload = (e) => {
            try{
                if(isvalid(JSON.parse(e.currentTarget.result).content)) window.SF.episode = JSON.parse(e.currentTarget.result).content;
                updateEpisode();
            }
            catch{}
        };
    });
    store.state.navbar.episode.push({
        click: () => {
            let blobData = new Blob([JSON.stringify({meta: {version}, content: window.SF.episode})], {type: "text/plain"});
            let url = window.URL.createObjectURL(blobData);
            let a = document.createElement("a");
            a.style = "display: none";
            document.body.appendChild(a);
            a.href = url;
            a.download = "episode.sfep";
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        },
        lang: "saveas",
        class: {"fa-save": true}
    });
    store.state.navbar.episode.push({
        click: () => {
            try{
                let namespace = prompt("Please enter namespace", "StoryFineExported");
                if(!namespace) return;
                let classname = prompt("Please enter class name", "Exported");
                if(!classname) return;
                let exported = ExportCSHARP(window.SF.episode, namespace, classname);
                let blobData = new Blob([exported], {type: "text/plain"});
                let url = window.URL.createObjectURL(blobData);
                let a = document.createElement("a");
                a.style = "display: none";
                document.body.appendChild(a);
                a.href = url;
                a.download = classname + ".cs";
                a.click();
                window.URL.revokeObjectURL(url);
                a.remove();
            }
            catch (e) {
                alert('Error during export process: \n' + e);
            }
        },
        lang: "export",
        class: {"fa-file-export": true}
    });
    for (const [key, value] of Object.entries(types)) {
        if(value.default) defaults.push({type: key, position: {x: value.default[0], y: value.default[1]}, points: {}})
        else{
            let c = {};
            if(value.icon){
                value.icon.split(' ').forEach(element => {
                    c[element] = true;
                });
            }
            value.icon
            store.state.navbar.objects.push({
                click: () => {addObj(key)},
                lang: key,
                class: c
            });
        }
    }
    store.state.navbar.functions.push({
        click: () => {
            if(localStorage.getItem("debug") == undefined || localStorage.getItem("debug") == "false"){
                window.SF.debug.enabled = true;
                localStorage.setItem("debug", "true");
            }
            else{
                window.SF.debug.enabled = false;
                localStorage.setItem("debug", "false");
            }
        },
        lang: "debug",
        class: {"fa-bug": true}
    });
    store.state.navbar.help.push({
        click: () => {
            let win = window.open('https://telegra.ph/StoryFine-Editor---Basic-guide-02-09', '_blank');
            win.focus();
        },
        lang: "basic-guide",
        class: {"fa-external-link-alt": true}
    });
    try{
        if(saved != undefined)
            if(isvalid(JSON.parse(saved))) window.SF.episode = JSON.parse(saved);
            else makeNewEpisode();
    }
    catch{}
    if(localStorage.getItem("debug") == "true") window.SF.debug.enabled = true;
    return {updateCanvas};
}