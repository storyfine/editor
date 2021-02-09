<template>
    <div id="sidebar">
        <div v-if="$store.state.selectedId != ''">
            <p>
                <b>{{('ui.sidebar.modulesel').lang($store.state.lang.selected)}}:</b>  {{('types.' + getModule($store.state.selectedId).type + '.name').lang($store.state.lang.selected)}}<br>
                <b>{{('ui.sidebar.moduleinfo').lang($store.state.lang.selected)}}:</b><br>
                {{('types.' + getModule($store.state.selectedId).type + '.description').lang($store.state.lang.selected)}}
            </p>
            <hr>
            <label for="module-id">{{('ui.sidebar.moduleid').lang($store.state.lang.selected)}}</label>
            <input id="module-id" type="text" :value="getModule($store.state.selectedId).id" @input="handleInput">
            <label for="module-descr">{{('ui.sidebar.moduledescr').lang($store.state.lang.selected)}}</label>
            <input id="module-descr" type="text" :value="getModule($store.state.selectedId).descr" @input="handleInput">
            <input type="button" :value="('ui.sidebar.remove').lang($store.state.lang.selected)" @click="removeObj($store.state.selectedId)">
        </div>
        <div v-else>
            <p>
                {{('ui.sidebar.nothingselected').lang($store.state.lang.selected)}}
            </p>
        </div>
    </div>
</template>

<script>
export default {
    methods: {
        getModule(id){
            if(id != ''){
                return window.SF.episode[id];
            }
        },
        handleInput(e){
            switch(e.target.id){
                case "module-id": {
                    window.SF.episode[this.$store.state.selectedId].id = e.target.value;
                    window.SF.updateEpisode();
                    break;
                }
                case "module-descr": {
                    window.SF.episode[this.$store.state.selectedId].descr = e.target.value;
                    window.SF.updateEpisode();
                    break;
                }
            }
        },
        removeObj(id){
            window.SF.removeObj(id);
        }
    }
}
</script>

<style lang="scss" scoped>
    #sidebar{
        width: 280px;
        height: calc(100% - 20px);
        background: lightgray;
        box-shadow: 0 0 5px 0px rgba(0, 0, 0, 0.5);
        z-index: 0;
        position: relative;
        padding: 10px;
        p{
            margin: 0;
        }
        input{
            display: block;
            width: calc(100% - 10px);
            background: #eeeeee;
            border: navajowhite;
            padding: 4px 5px;
            margin-bottom: 5px;
            border-radius: 3px;
        }
        input[type="button"]{
            background: lightcoral;
            padding: 10px;
            width: 100%;
            margin-top: 15px;
        }
    }
</style>