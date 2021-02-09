<template>
    <div id="cframe">
        <canvas id="canavs"></canvas>
        <div id="debug"></div>
    </div>
</template>

<script>
export default {
    mounted() {
        var c = document.getElementById("canavs");
        window.SF.updateCanvas(c, document.getElementById('cframe'));
    }
}
</script>

<style lang="scss" scoped>
    #cframe{
        width: calc(100% - 300px);
        height: 100%;
        position: relative;
    }
</style>