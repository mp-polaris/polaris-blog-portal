<template>
  <div class="word-cloud">
    <client-only>
      <wordcloud
        :fontSize="fontSize"
        :rotate="rotate"
        :margin="margin"
        :data="defaultWords"
        nameKey="name"
        valueKey="count"
        :showTooltip="false"
        :wordClick="wordClickHandler">
      </wordcloud>
    </client-only>
  </div>
</template>
<script>
  import * as api from '../api/api'

  export default {
    mounted() {
      //去获取标签
      this.listLabels();
    },
    data() {
      return {
        fontSize: [16, 30],
        margin: {top: 0, right: 0, bottom: 0, left: 0},
        rotate: {from: -10, to: 10, numOfOrientation: 20},
        defaultWords: [],
      }
    },
    methods: {
      wordClickHandler(name, value, vm) {
        //拿到这个关键字，跳转到搜索页面
        location.href = "/search?keyword=" + encodeURIComponent(name);
      },
      listLabels() {
        api.getLabels(20).then(result => {
          if (result.code === api.success_code) {
            this.defaultWords = result.data.list;
          }
        })
      },
    }
  }
</script>
<style>

</style>
