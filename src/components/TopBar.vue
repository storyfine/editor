<template>
    <nav>
        <div class="logo">StoryFine</div>
        <div class="buttons">
            <div class="btn" v-for="item in Object.keys($store.state.navbar)" :key="item">
                {{('nav.buttons.' + item).lang($store.state.lang.selected)}}
                <div class="nav-menu-helper"></div>
                <div class="list">
                    <div @click="button.click" v-for="(button, ind) in $store.state.navbar[item]" :key="ind"><i class="fas" :class="button.class"></i> {{
                            item == 'objects' ? 
                            ('types.' + button.lang + '.name').lang($store.state.lang.selected) :
                            ('nav.buttons.items.' + item + '.' + button.lang).lang($store.state.lang.selected)
                        }}</div>
                </div>
            </div>
        </div>
    </nav>
</template>

<script>
export default {

}
</script>

<style lang="scss" scoped>
    nav{
        height: 30px;
        background: lightgray;
        box-shadow: 0 0 5px 0px rgba(0, 0, 0, 0.5);
        z-index: 1;
        position: relative;
        .buttons{
            display: flex;
            position: relative;
            height: 100%;
            .btn{
                transition: 0.1s;
                font-size: 16px;
                padding: 7px 10px;
                cursor: pointer;
                &:hover{
                    background: white;
                    color: darkslategrey;
                    .list{
                        display: block;
                    }
                }
                .nav-menu-helper{
                    display: none;
                    position: absolute;
                    z-index: 1;
                    margin-top: 0px;
                    width: 100%;
                    height: 22px;
                    left: 0;
                }
                .list{
                    display: none;
                    position: absolute;
                    z-index: 1;
                    background: lightgray;
                    padding: 10px 100px 10px 10px;
                    margin-left: -10px;
                    margin-top: 5px;
                    box-shadow: 0px 3px 2px -2px rgba(0, 0, 0, 0.5);
                    color: #000;
                    cursor: default;
                    div{
                        margin-top: 5px;
                        transition: 0.25s;
                        color: black;
                        cursor: pointer;
                        &:hover{
                            color: darkgreen;
                        }
                        svg{
                            width: 20px;
                            color: gray;
                        }
                    }
                }
            }
        }
        .logo{
            width: calc(100% - 16px);
            text-align: right;
            position: absolute;
            padding: 7px 8px;
            color: darkgreen;
            font-size: 16px;
        }
    }
</style>