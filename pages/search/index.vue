<template>
  <div class="search-box ">
    <div class="default-border-radius search-input-parent">

      <div class="search-input-box">
        <div class="search-input-container clear-fix">

          <div class="search-logo float-left">
            <span class="logo">Polaris</span>
            <span>|</span>
            <span>搜索</span>
          </div>

          <div class="search-input float-left">
            <el-input @keyup.enter.native="toSearchPage" v-model="keyword" placeholder="您有什么想搜索的吗？"></el-input>
          </div>

          <div class="search-btn float-left">
            <el-button type="primary" icon="el-icon-search" @click="toSearchPage">搜索</el-button>
          </div>
        </div>
      </div>

      <div class="search-condition-box">
        <div class="select-item">
          <span :class="sort===''?'sort-active':''" @click="doSearchBySort('')">综合排序</span><span
          @click="doSearchBySort('2')" :class="sort==='2'||sort==='1'?'sort-active':''">时间</span><span
          @click="doSearchBySort('4')" :class="sort==='3'||sort==='4'?'sort-active':''">浏览量</span>
        </div>
        <div class="select-item">
          <span :class="categoryId===''?'category-active':''" @click="doSearchByCategory('')">全部分类</span><span
          @click="doSearchByCategory(item.id)" :class="categoryId===item.id?'category-active':''"
          v-for="item in categories" :key="item.id">{{item.name}}</span>
        </div>
      </div>

    </div>

    <div class="search-result-box default-border-radius clear-fix">

      <div class="search-left-part float-left">

        <div class="search-result-list">
          <!--1140-20 = 1120 == > 1120-300 == > 820px-->
          <div class="search-result-count-info">
            找到约 <span v-text="searchResult.totalCount"></span> 条结果
          </div>

          <div class="search-result-list-box" v-if="searchResult.contents.length !== 0">

            <div class="search-result-item" v-for="(item,index) in searchResult.contents" :key="index">

              <a :href="'/article/'+item.id">
                <div class="result-item-title" v-html="item.blogTitle"></div>
              </a>

              <div class="result-item-content" v-html="item.blogContent"></div>

              <div class="search-info-box">
                <span class="sob_blog sobicon">
                  {{item.blogCreateTime | formatDate("yyyy-MM-dd hh:mm")}}
                </span>
                <span class="sob_blog sobview">
                  {{item.blogViewCount}}
                </span>
                <span>
                  <el-tag
                    size="mini"
                    v-for="(tag,tagIndex) in item.blogLabels"
                    :key="tagIndex"
                    type="info">
                    {{ tag }}
                  </el-tag>
                </span>
              </div>
            </div>
          </div>

          <div class="search-result-empty-box" v-else>
            <div class="empty-box">
              <div class="sob_blog sobemptybox"></div>
              <div class="empty-text">没有找到相关内容</div>
            </div>
          </div>

        </div>

        <div class="search-result-page-navigation-box clear-fix">
          <div class="search-pre float-left" disabled="false">
            <el-link disabled v-if="isFirst">&lt;&lt;上一页</el-link>
            <el-link v-else
                     :href="'/search?keyword='+keyword +'&page='+(page-1)+'&sort='+sort+'&categoryId='+categoryId">&lt;&lt;上一页
            </el-link>
          </div>

          <div class="search-next float-right">
            <el-link disabled v-if="isLast">下一页
              &gt;&gt;
            </el-link>
            <el-link v-else
                     :href="'/search?keyword='+keyword +'&page='+(page+1)+'&sort='+sort+'&categoryId='+categoryId">下一页
              &gt;&gt;
            </el-link>
            <a></a>
          </div>

        </div>

      </div>

      <div class="search-right-part float-left">
        <div class="search-hot-word default-border-radius">
          <div class="card-header">
            热门标签
          </div>
          <WordCloud></WordCloud>
        </div>
      </div>
    </div>

  </div>
</template>
<script>
  import * as api from '../../api/api';

  export default {
    head() {
      return {
        title: 'Polaris-搜索',
        meta: [
          {
            hid: 'description',
            name: 'description',
            content: 'Polaris-搜索页面'
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
      this.$store.commit("setCurrentActivityTab", "index");
    },
    async asyncData({query}) {
      let categoryId = query.categoryId ? query.categoryId : '';
      let keyword = query.keyword ? query.keyword : '';
      let page = query.page ? query.page : 1;
      let size = query.size ? query.size : 5;
      let sort = query.sort ? query.sort : '';

      //发起请求，获取搜索内容
      let result = await api.getSearchContent(categoryId, keyword,page,size,sort);

      //console.log(result.data);
      //处理一下标签再返回
      let temResult = result.data;
      let contents = temResult.contents;
      console.log(temResult)
      contents.forEach(item => {
        item.blogLabels = item.blogLabels.split("-");
        //console.log(item.blogLabels);
      });

      //获取分类内容
      let categoriesRes = await api.getCategories();
      // console.log(categoriesRes.data);
      return {
        categories: categoriesRes.data,
        categoryId: categoryId,
        keyword: keyword,
        page: parseInt(page),
        size: parseInt(size),
        sort: sort,
        isFirst: temResult.first,
        isLast: temResult.last,
        searchResult: temResult
      }
    },
    methods: {
      doSearchByCategory(categoryId) {
        location.href = "/search?keyword=" + encodeURIComponent(this.keyword) + '&sort=' + this.sort + '&categoryId=' + categoryId;
      },
      doSearchBySort(sort) {
        //console.log(sort);
        //首先，进来的不是空，是2，表示按时间排序
        //如果跟当前的sort一样，那变换成1
        if (sort === '2' && this.sort === '2') {
          sort = '1';
        }

        //如果是4，表是按浏览量降序DESC
        if (sort === '4' && this.sort === '4') {
          sort = '3';
        }
        // console.log(sort);
        location.href = "/search?keyword=" + encodeURIComponent(this.keyword) + '&sort=' + sort + '&categoryId=' + this.categoryId;
      },
      toSearchPage() {
        location.href = "/search?keyword=" + encodeURIComponent(this.keyword);
      }
    }
  }
</script>
<style>
  .search-input-parent {
    background: #fff;
  }

  .search-hot-word, .search-taobao-ad {
    margin-bottom: 20px;
    background: #fff;
    padding: 20px;
  }

  .search-taobao-ad-box .el-carousel__container {
    height: 260px;
  }

  .search-taobao-ad-box {
    width: 260px;
  }

  .card-header {
    font-weight: 600;
    padding-top: 5px;
    padding-bottom: 15px;
    border-bottom: solid 1px #DCDFE6;
  }

  .search-result-empty-box .sobemptybox {
    font-size: 70px;

  }

  .search-result-empty-box .empty-text {
    font-size: 20px;
    line-height: 40px;
  }

  .search-result-empty-box {
    height: 380px;
    color: #50A7FC;
    margin-top: 120px;
    text-align: center;
  }

  .category-active, .sort-active {
    background: dodgerblue;
    border-radius: 4px;
    color: #fff !important;
  }

  .select-item span:hover {
    color: dodgerblue;
  }

  .select-item span {
    color: #7f828b;
    margin-left: 8px;
    font-size: 13px;
    cursor: pointer;
    margin-right: 8px;
    padding: 5px 15px;
  }

  .select-item {
    margin-top: 10px;
    line-height: 24px;
  }

  .search-logo .logo {
    font-size: 30px;
  }

  .search-logo {
    color: dodgerblue;
    margin-right: 20px;
    font-size: 20px;
  }

  .search-input-container {
    line-height: 40px;
    display: inline-block;
  }

  .search-input .el-input__inner {
    border-width: 2px;
  }

  .search-input {
    width: 250px;
    margin-right: 20px;
  }

  .search-pre:hover, .search-next:hover {
    color: dodgerblue;
  }

  .search-pre-disable, .search-next-disable {
    cursor: not-allowed;
  }

  .search-pre, .search-next {
    cursor: pointer;
  }

  .search-result-list {
    padding-top: 20px;
    background: #fff;
  }

  .search-result-page-navigation-box {
    background: #fff;
    margin-top: 20px;
    padding: 20px;
  }

  .search-info-box span {
    margin-right: 10px;
  }

  .search-info-box {
    color: #999;
    font-size: 14px;
  }

  .result-item-content {
    margin-top: 10px;
    margin-bottom: 10px;
    color: #4d5156;
    font-size: 16px;
    line-height: 20px;
    height: 40px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    overflow: hidden;
  }

  .search-result-item {
    margin-bottom: 20px;
  }

  .result-item-title {
    color: dodgerblue;
    margin-top: 10px;
    margin-bottom: 10px;
    line-height: 26px;
    cursor: pointer;
    height: 26px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
    font-size: 20px;
  }

  .search-result-list-box {
    padding: 20px;
  }

  .search-result-count-info {
    color: #70757a;
    line-height: 20px;
    font-size: 16px;
    margin-left: 20px;
  }

  .search-condition-box {
    border-top: solid 1px #DCDFE6;
    margin-bottom: 20px;
    padding: 20px 20px 30px;
  }

  .search-input-box {
    text-align: center;
    padding: 20px;
  }

  .search-box {
    margin-top: 20px;
    margin-bottom: 20px;
  }

  .search-left-part {
    width: 820px;
    margin-right: 20px;
  }

  .search-hot-word .wordCloud {
    width: 260px;
    height: 260px;
  }

  .search-right-part {
    width: 300px;
  }

</style>
