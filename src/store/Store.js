import Navbar from './Navbar';

const store = {
    state: {
        selectedId: '',
        lang: {
            list: [],
            selected: ''
        },
        navbar: {
            episode: [],
            objects: [],
            functions: [],
            help: []
        }
    },
    mutations: {
        selectLanguage: function(state, lang) {
            state.lang.selected = lang;
        },
        selectId: function(state, id) {
            state.selectedId = id;
        }
    }
};
const modules = [
    Navbar
];
modules.forEach(module => {
    for (const [key1] of Object.entries(module)) {
        if(!store[key1]) store[key1] = {};
        for (const [key2] of Object.entries(module[key1])) {
            store[key1][key2] = module[key1][key2];
        }
    }
});
export default (LANGS, SELECTED) => {
    store.state.lang.list = LANGS;
    store.state.lang.selected = SELECTED;
    return store;
}