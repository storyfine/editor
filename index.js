const debug = document.getElementsByTagName("debug")[0];
const cframe = document.getElementsByTagName("cframe")[0];
const canvas = document.getElementsByTagName("canvas")[0];
const getImage = (src) => {
    let image = new Image();
    image.src = src;
    return image;
};
const types = {
    "entry": {
        default: [0, 0],
        menu: {
            name: "Entry point",
            description: "Start of the episode"
        },
        width: 6,
        height: 6,
        texture: getImage("data:image/png;base64,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"),
        points:[
            {
                type: "main-out",
                position: {
                    x: 6,
                    y: 3
                }
            }
        ]
    },
    "checkpoint":{
        menu: {
            icon: "fas fa-flag-checkered",
            name: "Checkpoint",
            description: "Linear checkpoint"
        },
        width: 8,
        height: 4,
        texture: getImage("data:image/png;base64,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URGhcgICLZEicurUKW8nlRkYHR2d9XIDUJQ1EABKERAAShEQAEoREABKERAAShEQAEoREABKERAAShEQAEpZlfdKL774oleY0l566SUvXgWeeeaZGB4ebv3zZGnl/bxaA4GWOHDggHhQKQGBFkjxOHjwoLeSSuXehAXUz+DgYBw6dCiGhoa8O1ROQKCB1q5dGyMjI7Fv375YuXKlt5BlISDQIMJBnQgINIBwUEcCAjUmHNSZgEANCQdNICBQI8JBkwgI1IBw0EQCAstIOGgyAYFlIBy0gYBAhYSDNhEQqIBw0EYCAktIOGgzAYElIBx0gYBAHwkHXSIg0AfCQRcJCCxCCsdjjz0W+/fvFw46R0CgBOEAAYFChAP+j4BADsIB3yQgcAfCAbcnIHALwgF3JyAwj3BAfgICwgGlCAidtmbNmrkDAIUDihMQOkk4YPEEhE4RDugfAaEThAP6T0CoRBq0r1+/XvmLLRywdASESqSBfGpqqrIXWzhg6QkIldi8eXMlAemFI32t+qpVFm9YSj5hVGJoaCjGx8eX7K6EA6rnk0YlhoeHY3BwMKanp/t6d8IBy8cnjkqkeYiDBw/G22+/3Ze7Ew5Yfj55VGb37t3x6KOPxvHjx0vfpXBAffgEUqlDhw7FwMBAHDt2rNDdCgfUj08ilUrxSBHZtm1bjI2N3XVORDigvnwiWRZpc9auXbvi5MmTcerUqTh37lzMzMzE7OzsXDTSbr9pz600+e44DqgnAWHZpDDs2bNn7gdonhXeMwDKEBAAShEQAEoREABKERAAShEQAEoREABKERAAShEQAEoREABKERAAShEQAEoREABKERAAShEQAEoREABKERAAShEQAEoREABKERAAShEQAEoREABKERAAShEQAEoREABKERAAShEQAEoREABKyR2Qq1eveoUBWq7IWJ8CMpvngpcuXbLcALRcgbF+NgXkWp5LTkxMWG4AWq7AWH8tBWQqzyU/++wzyw1Ay505cybvE5xKAcmVm8nJScsNQMsVCMhECshHeS55+fLl+PLLLy07AC2Vxvg01ud0NAXkH/Je+r333rPcALTU4cOHizyxf04B+WVEXMlz6TS5cvHiRcsOQMuksb3A5qu0r+/7veNAPsx7rTfeeMNyA9AyBcf2tOJx80DCH+W9VtpH+J133rHsALREGtMLHuv3w5gXkLGIOJv3muPj4zE2NmbZAWi4NJanMb2A1IoPYsFXmfygyC0cPXo03n33XcsOQEOlMTyN5QX9Ze/iA6Ojo/Ov+mlEPFzktgYHB+PZZ5+NjRs3WoYAGiBNmL/55psxPT1d9MH+JiJ29f5l1YL/+HxEHElhyXtr6QG8/vrrsX379njiiSdi/fr1lh+AGkrHeaRddQvsbTXfbNaImxYGJK3L/DQiXix6y+kBvfbaa3H//ffH1q1bY+fOnXO/161bF6tWLbwbAJbStWvXYmpqKj7//PM4ffr03O+ZmZnF3ONPs0bctHATVs+vI2KvdxeAiPgkIvYtfCFudz6Qx9PajlcNoPO+zJrwDbcLSNoheE+a4uj6KwfQYdNZC255kMidzkh4ISIeSRP2lh6AzrmYNeDC7Z743U5pey7brfcTyw5AZ3ySjf3n7vSE85wT/VI2efJ3eU9/C0AjpTH+J9mYf9fvNskTkJ6/iIj9EXHScgHQOiezMf77eZ9YkYBEtlqzOyK+mw79sPwANN6ZbEzfXXS6omhAen4WEb8VEb8bEf+W93wiANTC19nY/e1sLP9ZmQe12EPEfxERf5T987ci4k+y/YW3RcS67PZzfy0KAH2V5jSuRcRURExm5/H4x2zsXpyI+B8QrRZjdkmsWQAAAABJRU5ErkJggg=="),
        points:[
            {
                type: "main-out",
                position: {
                    x: 8,
                    y: 2
                }
            },
            {
                type: "main-in",
                position: {
                    x: 0,
                    y: 2
                }
            },
            {
                type: "logical-out",
                position: {
                    x: 8,
                    y: 0
                }
            }
        ]
    },
    "condition":{
        menu: {
            icon: "fas fa-code-branch",
            name: "Сondition",
            description: "Simple condition"
        },
        width: 8,
        height: 6,
        texture: getImage("data:image/png;base64,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"),
        points:[
            {
                type: "logical-in",
                position: {
                    x: 0,
                    y: 1
                }
            },
            {
                type: "main-in",
                position: {
                    x: 0,
                    y: 3
                }
            },
            {
                type: "logical-out",
                position: {
                    x: 8,
                    y: 2
                }
            },
            {
                type: "logical-out",
                position: {
                    x: 8,
                    y: 4
                }
            }
        ]
    }
};
var episode = {};
var objectshtml = "";
for (const [key, value] of Object.entries(types)) {
    if(value.default) episode[key] = {type: key, position: {x: value.default[0], y: value.default[1]}}
    else{
        objectshtml += '<div onclick="nav.objects.add(\'' + key + '\')"><i class="' + value.menu.icon + '"></i> ' + value.menu.name + '</div>';
    }
}
$("#objects-menu").html(objectshtml);
$("#episode-menu").html('<div onclick="nav.episode.new()"><i class="fas fa-file"></i> New episode</div><div onclick="nav.episode.open()"><i class="fas fa-folder-open"></i> Open</div><div onclick="nav.episode.saveas()"><i class="fas fa-save"></i> Save as</div><div><i class="fas fa-file-export"></i> Export</div>');
$("#functions-menu").html('<div onclick="nav.functions.toggleDebug()"><i class="fas fa-bug"></i> Toggle debug</div>');

const isvalid = (ep) => {
    try{
        let obj = JSON.parse(ep);
        if(typeof episode == "object"){
            for (const [key, value] of Object.entries(obj)) {
                if(typeof key != "string") return false;
                if(value.type == undefined) return false;
                if(types[value.type] == undefined) return false;
                if(value.position == undefined) return false;
                if(value.position.x == undefined) return false;
                if(value.position.y == undefined) return false;
            }
            return true;
        }
        else return false;
    }
    catch{
        return false;
    }
};
var selectedId = "";
const updateEpisode = () => {
    localStorage.setItem("episode", JSON.stringify(episode));
};
let saved = localStorage.getItem("episode");
if(saved != undefined)
    if(isvalid(saved)) episode = JSON.parse(saved);
    else updateEpisode();
if(localStorage.getItem("debug") == "true") $("debug").addClass("shown");
const moveToEnd = (id) => {
    let newep = {};
    for (const [key, value] of Object.entries(episode)) {
        if(key != id) newep[key] = value;
    }
    for (const [key, value] of Object.entries(episode)) {
        if(key == id) newep[key] = value;
    }
    episode = newep;
    updateEpisode();
}
var mouse = [];
canvas.addEventListener("mousemove", (evt) => {
    mouse = [evt.clientX, evt.clientY];
});
canvas.addEventListener("mouseleave", () => {
    mouse = [];
});
const getMousePos = () => {
    if(mouse.length != 0){
        let rect = canvas.getBoundingClientRect();
        return [
            mouse[0] - rect.left,
            mouse[1] - rect.top
        ];
    }
    else return null;
};
const getScaledMousePos = () => {
    let mousePos = getMousePos();
    if(mousePos != null){
        return [
            mousePos[0] / scale + camera[0] / scale,
            mousePos[1] / scale + camera[1] / scale
        ];
    }
    else return null;
}
const getClickedObjectId = (x, y) => {
    for (const [key, value] of Object.entries(episode)) {
        if(x >= value.position.x && x <= value.position.x + types[value.type].width && y >= value.position.y && y <= value.position.y + types[value.type].height) return key;
    }
    return null;
}
const select = (id) => {
    if(id != undefined && episode[id] != undefined){
        selectedId = id;
        moveToEnd(selectedId);
        let html = "<p><b>Selected:</b> " + types[episode[selectedId].type].menu.name + "<br><b>Description:</b><br>" + types[episode[selectedId].type].menu.description + "</p>";
        if(!types[episode[selectedId].type].default) html += '<btn class="remove-btn" onclick="nav.objects.remove(\'' + id + '\')">Remove</btn>';
        $("controls").html(html);
    }
    else{
        selectedId = "";
        $("controls").html("<b>Nothing is selected<b/>");
    }
}
select();



const nav = {
    functions:{
        toggleDebug: () => {
            if(localStorage.getItem("debug") == undefined || localStorage.getItem("debug") == "false"){
                $("debug").addClass("shown");
                localStorage.setItem("debug", "true");
            }
            else{
                $("debug").removeClass("shown");
                localStorage.setItem("debug", "false");
            }
        }
    },
    objects: {
        add: (type) => {
            if(types[type] != undefined){
                episode[makeUniqueId()] = {type: type, position: {x: Math.round((camera[0] + canvas.width / 2) / scale), y: Math.round((camera[1] + canvas.height / 2) / scale)}}
            }
        },
        remove: (id) => {
            if(episode[id] != undefined){
                select();
                delete episode[id];
            }  
        }
    },
    episode:{
        new: () => {
            episode = {};
            for (const [key, value] of Object.entries(types)) {
                if(value.default) episode[key] = {type: key, position: {x: value.default[0], y: value.default[1]}}
            }
            updateEpisode();
        },
        open: () => {
            $("#openfile").click();
        },
        saveas: () =>{
            let blobData = new Blob([JSON.stringify(episode)], {type: "text/plain"});
            let url = window.URL.createObjectURL(blobData);
            let a = document.createElement("a");
            a.style = "display: none";
            document.body.appendChild(a);
            a.href = url;
            a.download = "episode.sfep";
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        }
    }
}
$("#openfile").change(function(){
    var reader = new FileReader();
    reader.readAsText(document.getElementById('openfile').files[0], "UTF-8");
    reader.onload = (text) => {
        if(isvalid(text)) episode = JSON.parse(text);
        updateEpisode();
    };
});
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
        for (const [key, value] of Object.entries(episode)) {
            if(key == result) isUnique = false;
        }
        if(isUnique == true) break;
    }
    return result;
}