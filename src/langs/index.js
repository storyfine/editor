import LANG_EN from './en';

const langs = {
    ru: LANG_EN
}

const fallbacks = [
    'en'
]

const replaceAll = function(text, search, replace){
    return text.split(search).join(replace);
}

export default {
    lang: function(lang) {
        let translated = "[UNTRANSLATED]";
        let value = undefined;
        try{
            value = eval(`langs['${lang}']['` + replaceAll(this, '.', "']['") + "']");
        }
        catch{}
        if(value === undefined){
            for (let index = 0; index < fallbacks.length; index++) {
                const element = fallbacks[index];
                try{
                    value = eval(`langs['${element}']['` + replaceAll(this, '.', "']['") + "']");
                }
                catch{}
                if(value === undefined) continue;
                else break;
            }
        }
        if(value !== undefined) translated = value;
        return translated;
    },
    inject: function(data) {
        let text = this;
        for (const [key, value] of Object.entries(data)) {
            text.replace(`{${key}}`, value);
        }
    },
    list: Object.keys(langs).sort()
}