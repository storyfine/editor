import Vue from 'vue';
import Vuex from 'vuex';
import Store from './store/Store';
import Langs from './langs/index';
import App from './components/App';
import '@fortawesome/fontawesome-free/js/fontawesome';
import '@fortawesome/fontawesome-free/js/solid';
import '@fortawesome/fontawesome-free/js/regular';
import '@fortawesome/fontawesome-free/js/brands';
import 'normalize.css'
import './Style'

import Logic from './Logic';

String.prototype.lang = Langs.lang;
String.prototype.inject = Langs.inject;

String.prototype.replaceAll = function(search, replace){
    return this.split(search).join(replace);
}

const LANGS = Langs.list;
Vue.use(Vuex);
const store = new Vuex.Store(Store(LANGS, LANGS[0]));

window.SF = {
    debug: {
        enabled: false,
        data: []
    },
    selectedId: '',
    episode: {},
    camera: [0, 0],
    mouse: [0, 0],
    scale: 20
}
const {updateCanvas} = Logic({store});
window.SF.updateCanvas = updateCanvas;

new Vue({
    store,
    render: h => h(App)
}).$mount('#app');