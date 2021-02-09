import types from '../Types';

export default (ep, namespace, classname) => {
    /*namespace StoryFine
{
    class Test : ISFEpisode
    {
        public SFSearcher LSEARCH;

        public SFEntry entry;
        public SFCheckpoint FIRST_CHECKPOINT;
        public SFCheckpoint SECOND_CHECKPOINT;
        public SFCondition COND;
        public SFCheckpoint A;
        public SFCheckpoint B;
        public SFChoice CHOICE;
        public SFCheckpoint C;
        public SFCheckpoint D;

        public Test(SFSearcher.LogicSearcher _ls)
        {
            LSEARCH = new SFSearcher("LSEARCH", _ls);

            entry = new SFEntry("entry");
            FIRST_CHECKPOINT = new SFCheckpoint("FIRST_CHECKPOINT", entry, false);
            entry.Next = FIRST_CHECKPOINT;
            SECOND_CHECKPOINT = new SFCheckpoint("SECOND_CHECKPOINT", FIRST_CHECKPOINT, false);
            FIRST_CHECKPOINT.Next = SECOND_CHECKPOINT;
            COND = new SFCondition("COND", SECOND_CHECKPOINT, LSEARCH);
            A = new SFCheckpoint("A", COND, true);
            COND.Then = A;
            B = new SFCheckpoint("B", COND, false);
            COND.Else = B;
            CHOICE = new SFChoice("CHOICE", B);
            C = new SFCheckpoint("C", CHOICE, true);
            CHOICE.A = C;
            D = new SFCheckpoint("D", CHOICE, true);
            CHOICE.B = D;
        }
    }
}*/
    const pairs = {
        entry: "SFEntry",
        checkpoint: "SFCheckpoint",
        condition: "SFCondition",
        choice: "SFChoice",
        searcher: "SFSearcher"
    };
    const getPointType = (mtype, index) => {
        return types[mtype].points[index].type;
    }
    const i = (m) => {
        return m.id || m.k;
    }
    let usings = ['StoryFine'];
    let containsLS = false;
    let entry = null;
    
    for (const [key, value] of Object.entries(ep)) {
        ep[key].k = key;
        if(value.type == 'searcher'){
            containsLS = true;
        }
        if(value.type == 'entry'){
            entry = value;
        }
    }
    
    let searchers = [];
    let fields = [];
    let operations = [];
    const work = (m, p) => {
        let id = i(m);
        if(m.type == 'searcher'){
            searchers.push(id);
        }
        if(m.type == 'entry'){
            fields.push({type: m.type, id});
            operations.push({act: 'init', obj: id, type: m.type, args: []});
            for (const [key, value] of Object.entries(m.points)) {
                if(getPointType(m.type, key) == 'main-out'){
                    work(ep[value.id], m);
                    operations.push({act: 'setProp', obj: id, prop: 'Next', value: i(ep[value.id])});
                }
            }
        }
        if(m.type == 'checkpoint'){
            fields.push({type: m.type, id});
            operations.push({act: 'init', obj: id, type: m.type, args: [i(p), Object.keys(m.points).map((key) => {return getPointType(m.type, key) == 'logical-out'}).length == 0]});
            for (const [key, value] of Object.entries(m.points)) {
                if(getPointType(m.type, key) == 'logical-out'){
                    ep[value.id].points[value.index] = {id: m.k, index: key};
                }
                if(getPointType(m.type, key) == 'main-out'){
                    work(ep[value.id], m);
                    operations.push({act: 'setProp', obj: id, prop: 'Next', value: i(ep[value.id])});
                }
            }
        }
        if(m.type == 'condition'){
            fields.push({type: m.type, id});
            let logical = null;
            for (const [key, value] of Object.entries(ep)) {
                for (const [, value2] of Object.entries(value.points)) {
                    if(value2.id == m.k && getPointType(m.type, value2.index) == 'logical-in') 
                    {
                        logical = ep[key];
                    }
                }
            }
            if(!logical) throw `Condition "${id}" has no logical input module!`;
            if(logical.type == 'searcher'){
                work(logical, m);
            }
            operations.push({act: 'init', obj: id, type: m.type, args: [i(p), i(logical)]});
            for (const [key, value] of Object.entries(m.points)) {
                if(getPointType(m.type, key) == 'main-out'){
                    work(ep[value.id], m);
                    if(key == 2) operations.push({act: 'setProp', obj: id, prop: 'Then', value: i(ep[value.id])});
                    if(key == 3) operations.push({act: 'setProp', obj: id, prop: 'Else', value: i(ep[value.id])});
                }
            }
        }
        if(m.type == 'choice'){
            fields.push({type: m.type, id});
            operations.push({act: 'init', obj: id, type: m.type, args: [i(p)]});
            for (const [key, value] of Object.entries(m.points)) {
                if(getPointType(m.type, key) == 'main-out'){
                    work(ep[value.id], m);
                    if(key == 1) operations.push({act: 'setProp', obj: id, prop: 'A', value: i(ep[value.id])});
                    if(key == 2) operations.push({act: 'setProp', obj: id, prop: 'B', value: i(ep[value.id])});
                }
            }
        }
    }
    work(entry, null);
    
    let text = '';
    let shift = 0;
    let gen = (n) => {
        let r = '';
        for (let index = 0; index < n; index++) {
            r += '    ';
        }
        return r;
    }
    let p = (t) => {
        let firstline = text == '';
        text += (firstline ? '' : '\n') + gen(shift) + t;
    }
    usings.forEach(using => {
        p(`using ${using};`);
    });
    p(``);
    p(`namespace ${namespace}`);
    p(`{`);
    shift += 1;
    p(`class ${classname} : ISFEpisode`);
    p(`{`);
    shift += 1;
    searchers.forEach(searcher => {
        p(`public ${pairs['searcher']} ${searcher};`);
    });
    p(``);
    fields.forEach(field => {
        p(`public ${pairs[field.type]} ${field.id};`);
    });
    p(``);
    p(`public ${classname}(${containsLS == true ? 'SFSearcher.LogicSearcher _ls' : ''})`);
    p(`{`);
    shift += 1;
    searchers.forEach(searcher => {
        p(`${searcher} = new ${pairs['searcher']}("${searcher}", _ls);`);
    });
    p(``);
    operations.forEach(o => {
        switch(o.act){
            case 'init': {
                p(`${o.obj} = new ${pairs[o.type]}("${o.obj}"${(o.args.length != 0 ? ',' : '') + o.args.join(',')});`);
                break;
            }
            case 'setProp': {
                p(`${o.obj}.${o.prop} = ${o.value};`);
                break;
            }
        }
    });
    shift -= 1;
    p(`}`);
    shift -= 1;
    p(`}`);
    shift -= 1;
    p(`}`);
    return text;
}