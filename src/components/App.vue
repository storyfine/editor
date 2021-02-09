<template>
    <div class="main">
        <top-bar/>
        <main>
            <c-frame/>
            <side-bar/>
        </main>
    </div>
</template>

<script>
import CFrame from './CFrame';
import SideBar from './SideBar';
import TopBar from './TopBar';

export default {
  components: { TopBar, CFrame, SideBar },

}
</script>

<style lang="scss" scoped>
    main{
        overflow: hidden;
        height: calc(100vh - 30px);
        display: flex;
    }
</style>