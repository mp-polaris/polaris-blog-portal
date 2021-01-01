<template>
  <div class="link-page-box">
    <div class="link-title">
      友情链接
    </div>
    <div class="link-list-box clear-fix">
      <div :title="item.name" class="link-item float-left" v-for="(item,index) in linksList" :key="index">
        <a :href="item.url" target="_blank">
          <img :src="imgBaseUrl + '/portal/image/'+item.logo">
        </a>
      </div>
    </div>
  </div>
</template>

<script>
  import * as api from '../../api/api';


  export default {
    computed: {
      imgBaseUrl() {
        return api.imgBaseUrl;
      }
    },
    head() {
      return {
        title: 'Polaris博客-友情链接',
        meta: [
          {
            hid: 'description',
            name: 'description',
            content: 'Polaris博客-友情链接'
          },
          {
            hid: 'keywords',
            name: 'keywords',
            content: 'java开发,博客系统,程序员'
          }
        ]
      }
    },
    mounted() {
      this.$store.commit("setCurrentActivityTab", "link");
    },
    asyncData() {
      return api.getLinkList().then(result => {
        //console.log(result.data);
        return {
          linksList: result.data
        }
      });
    }
  }
</script>

<style>
  .link-title {
    text-align: center;
    font-size: 30px;
    color: #7f828b;
    margin-top: 20px;
    margin-bottom: 20px;
  }

  .link-page-box {
    background: #fff;
    margin-top: 20px;
    margin-bottom: 20px;
    padding: 20px;
  }

  .link-item img {
    width: 150px;
    height: 57px;
    vertical-align: middle;
  }

  .link-item:hover {
    border: #A612FF 1px solid;
  }

  .link-item {
    padding: 10px;
    margin: 10px;
    width: 233px;
    text-align: center;
    border: #dfdfdf 1px solid;
    cursor: pointer;
  }
</style>
