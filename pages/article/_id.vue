<template>
  <div class="article-box" id="article-box">
    <div class="content-box clear-fix">

      <div class="article-left-part default-border-radius float-left">
        <div class="article-content-box">
          <div class="article-detail-title">
            <h1 v-text="articleRes.title"></h1>
          </div>
          <div class="article-info">
            <img :src="articleRes.blogUser.avatar" size="small">
            <span class="user-name">
            {{articleRes.blogUser.userName}}
            </span>
            <span class="el-icon-date"> 发表于</span>
            <span>
              {{articleRes.createTime | formatDate("yyyy-MM-dd hh:mm")}}
            </span>
            <span class="el-icon-view"> {{articleRes.viewCount}}</span>
          </div>
          <div class="article-labels">
            <el-tag type="info" size="mini" v-for="(item,index) in articleRes.labels.split('-')" :key="index">
              {{item}}
            </el-tag>
          </div>
          <div class="article-loading-part" v-if="isArticleProcessing">
            <div class="content-loading">
              <div class="loading-title clear-fix"></div>
              <div class="loading-content">
                <div class="loading-text"></div>
                <div class="loading-text animation-delay"></div>
              </div>
            </div>
          </div>
          <div class="catalog-box" id="article-content-category-box" v-show="!isArticleProcessing">

          </div>
          <div id="article-content" class="article-content" v-html="articleRes.content" v-show="!isArticleProcessing">

          </div>
        </div>

        <div class="article-comment-box">
          <div class="article-comment-input">
            <div class="comment-input-header">
              评论
            </div>
            <el-input
              @focus="checkLogin"
              rows="4"
              type="textarea"
              placeholder="请文明评论"
              v-model="comment.commentContent"
              maxlength="256"
              show-word-limit>
            </el-input>
            <div class="comment-submit-btn">
              <el-button type="primary" size="medium" @click="doComment">评论</el-button>
            </div>
          </div>
          <div class="article-comment-list" id="article-comment-list">
            <div class="comment-list-header">
              文章评论
            </div>

            <div class="comment-item-list">
              <div class="article-comment-item" v-for="(item,index) in commentList" :key="index">
                <div class="article-comment-user-info">
                  <a :href="'/userInfo/'+ item.userId" target="_blank">
                    <img :src="item.userAvatar">
                    <span class="user-name">{{item.userName}}</span>
                  </a>
                  <el-tag size="mini" type="danger" v-if="item.state==='3'">置顶</el-tag>
                </div>
                <div class="article-comment-reply" v-if="item.parentContent!==null&&item.parentContent!==''">
                  <span>回复：{{item.parentContent}}</span>
                </div>
                <div class="article-comment-content">
                  {{item.commentContent}}
                </div>
                <div class="article-comment-action">
                  <span class="el-icon-date">
                    {{item.createTime | formatDate("yyyy-MM-dd hh:mm")}}
                  </span>
                  ·
                  <span class="item-reply-btn" @click="onReplyClick(index,item.userName)">
                    回复
                  </span>
                </div>
                <div class="article-sub-comment-box clear-fix" style="display: none;" :id="'sub_input_'+index">
                  <div class="sub-comment-input float-left">
                    <el-input
                      @focus="checkLogin"
                      rows="2"
                      type="textarea"
                      :placeholder="subCommentPlaceholder"
                      v-model="subComment"
                      maxlength="256"
                      show-word-limit>
                    </el-input>
                  </div>
                  <div class="sub-comment-btn float-left">
                    <el-button size="mini" type="primary" @click="doSubComment(item.commentContent)">回复</el-button>
                  </div>
                </div>
              </div>
            </div>
            <div class="no-comment-content" v-if="commentList.length===0">
              暂时没有评论，赶快来评论吧~
            </div>
            <div class="loader-more-comment" v-if="!isLastPage" @click="doLoadMore">
              加载更多评论>>
            </div>
          </div>
        </div>

        <div class="article-recommend-box">
          <div class="recommend-header-title">
            推荐文章
          </div>
          <div class="recommend-item" v-for="(item,index) in recommendArticles" :key="index">

            <div class="recommend-title">
              <a :href="'/article/'+item.id">
                {{item.title}}
              </a>
            </div>
            <div class="recommend-summary">
              {{item.summary}}
            </div>
            <div class="recommend-info">
              <span class="el-icon-date">
                {{item.createTime | formatDate("yyyy-MM-dd hh:mm")}}
              </span>
              <span class="el-icon-view">
                {{' '+item.viewCount}}
              </span>
              <el-tag type="info" size="mini" v-for="(tag,tagIndex) in item.labels.split('-')" :key="tagIndex">
                <a :href="'/search?keyword='+tag" target="_blank">{{tag}}</a>
              </el-tag>
            </div>
          </div>
        </div>
      </div>

      <div class="article-right-part default-border-radius float-left">

        <div class="article-right-card article-detail-hot-label">
          <div class="right-card-title" style="overflow: hidden">
            <div style="margin: 10px 0 0 15px;font-weight: bolder">热门标签</div>
          </div>
          <div class="right-card-content">
            <WordCloud></WordCloud>
          </div>
        </div>

        <div class="article-right-card" id="article-right-subscription-box">
          <div class="right-card-title" style="overflow: hidden">
            <div style="margin: 10px 0 0 15px;font-weight: bolder">公众号</div>
          </div>
          <div class="right-card-content">
            <img src="http://mpolaris.top/portal/image/1609504488518_794664951162601472.jpg">
          </div>
        </div>

        <div class="article-right-card" id="catalog-box">
          <div class="right-card-title">
            <div style="margin: 10px 0 0 15px;font-weight: bolder">文章目录</div>
          </div>
          <div class="right-card-content" id="article-catalog-container">

          </div>
        </div>

      </div>
    </div>


    <div class="article-detail-part">
      <el-dialog
        :visible.sync="isImageDialogShow">
        <img :src="targetImagePath"/>
      </el-dialog>
    </div>

  </div>
</template>

<script>
  //代码高亮
  import hljs from 'highlight.js';
  import 'highlight.js/styles/github.css'

  import * as api from '../../api/api'
  import Catelog from '../../utils/headerLineHandler';

  let lastInputBox = null;
  export default {
    head() {
      return {
        title: 'Polaris博客-' + this.articleRes.title,
        meta: [
          {
            hid: 'description',
            name: 'description',
            content: 'Polaris博客-' + this.articleRes.summary
          },
          {
            hid: 'keywords',
            name: 'keywords',
            content: this.labelsStr
          }
        ]
      }
    },
    data() {
      return {
        isArticleProcessing: true,
        subComment: '',
        comment: {
          commentContent: '',
          articleId: '',
          parentContent: ''
        },
        isImageDialogShow: false,
        targetImagePath: '',
        pageNum: 1,
        pageSize: 5,
        subCommentPlaceholder: '请文明回复'
      };
    },
    /*加载文章详情,需要把文章的ID传过来*/
    async asyncData({params}) {
      let articleResult = await api.getArticleDetailById(params.id);
      console.log(articleResult.data)
      let recommendArticleRes = await api.getRecommendArticle(articleResult.data.id, 5);
      //加载第一页评论数据
      let commentRes = await api.getCommentsByArticleId(articleResult.data.id, 1, 5);
      let labels = '';
      let labelsList = articleResult.data.labels.split('-');
      labelsList.forEach((label, index) => {
        labels += label;
        if (index < labelsList.length - 1) {
          labels += ',';
        }
      });
      return {
        articleRes: articleResult.data,
        recommendArticles: recommendArticleRes.data.list,
        commentList: commentRes.data.list,
        isLastPage: commentRes.data.isLastPage,
        labelsStr: labels
      }
    },
    methods: {
      doLoadMore() {
        this.pageNum++;
        api.getCommentsByArticleId(this.articleRes.id, this.pageNum, this.pageSize).then(result => {
          if (result.code === api.success_code) {
            //处理成功的结果
            this.commentList = this.commentList.concat(result.data.list);
            console.log(result.data)
            //处理是否有更多
            this.isLastPage = result.data.isLastPage
            console.log(this.isLastPage)
          }
        }).catch(error => {
          console.log(error);
        });
      },
      onReplyClick(index, userName) {
        //console.log(index);
        let subInputBox = document.getElementById('sub_input_' + index);
        this.subComment = '';
        this.subCommentPlaceholder = '回复@' + userName;
        if (subInputBox) {
          if (lastInputBox) {
            lastInputBox.style.display = 'none';
          }
          lastInputBox = subInputBox;
          subInputBox.style.display = 'block';
        }
      },
      doSubComment(parentContent) {
        //检查数据是否为空
        if (this.subComment === '') {
          this.$message.error("您没有写评论内容哦！");
          return;
        }
        //处理数据
        this.comment.commentContent = this.subComment;
        this.comment.articleId = this.articleRes.id;
        this.comment.parentContent = parentContent;
        api.postComment(this.comment).then(result => {
          if (result.code === api.success_code) {
            //刷新评论列表
            this.getArticleCommentByPage(1);
            this.resetComment();
            this.$message.success(result.message);
            let commentList = document.getElementById('article-comment-list');
            if (commentList) {
              commentList.scrollIntoView({
                block: 'start',
                behavior: 'smooth'
              })
            }
          } else {
            this.$message.error(result.message);
          }
        })
      },
      checkLogin() {
        //检查是否有效
        api.checkToken().then(result => {
          //console.log(result);
          if (result.code === 40000) {
            //跳转登录界面
            location.href = "/login?redirect=" + location.href;
          }
        });
      },
      doComment() {
        //检查是否有登录,只检查token
        let blogTokenIndex = document.cookie.indexOf('polaris_blog_token');
        if (blogTokenIndex === -1) {
          location.href = "/login?redirect=" + location.href;
          return;
        }
        //检查内容
        if (this.comment.commentContent === '') {
          this.$message.error("您没有填写评论内容呢！");
          return;
        }
        //补全内容
        this.comment.articleId = this.articleRes.id;
        //提交内容
        //console.log(this.comment);
        api.postComment(this.comment).then(result => {
          if (result.code === api.success_code) {
            //刷新评论列表
            this.getArticleCommentByPage(1);
            this.resetComment();
            this.$message.success(result.message);
          } else {
            this.$message.error(result.message);
          }
        })
      },
      resetComment() {
        this.subComment = '';
        this.comment.commentContent = '';
        this.comment.parentContent = '';
        if (lastInputBox) {
          lastInputBox.style.display = 'none';
        }
      },
      getArticleCommentByPage(page) {
        api.getCommentsByArticleId(this.articleRes.id, page, this.pageSize).then(result => {
          this.commentList = result.data.list;
          this.pageNum = page;
          this.isLastPage = result.data.isLastPage;
        })
      },
      onWindowScroll() {
        let catalogBox = document.getElementById('catalog-box');
        let weixinBox = document.getElementById('article-right-subscription-box');
        let parentPart = document.getElementById('article-box');
        if (catalogBox) {
          //console.log(weixinBox.offsetHeight);
          let bottomOfWC = weixinBox.offsetTop + weixinBox.offsetHeight;
          let scrolledTop = document.documentElement.scrollTop;
          let scrolledLeft = document.documentElement.scrollLeft;
          if (scrolledTop >= bottomOfWC) {
            // console.log('显示悬浮内容...');
            catalogBox.style.position = 'fixed';
            catalogBox.style.top = '20px';
            catalogBox.style.width = '210px';
            //显示我们的悬浮内容
          } else {
            catalogBox.style.position = 'fixed';
            catalogBox.style.top = (bottomOfWC - scrolledTop + 20) + 'px';
            // console.log('隐藏悬浮内容...')
          }

          //处理左右滑动
          if (scrolledLeft > 0) {
            catalogBox.style.left = parentPart.offsetLeft + parentPart.offsetWidth
              - catalogBox.offsetWidth - scrolledLeft + 'px';
          } else {
            //正常状态的，左边应该它老爸的左边
            catalogBox.style.left = parentPart.offsetLeft + parentPart.offsetWidth
              - catalogBox.offsetWidth + 'px';
          }
        }
      },
      showImage(event) {
        this.isImageDialogShow = true;
        //显示dialog
        this.targetImagePath = event.target.src;
      },
      handleContentImages() {
        //遍历图片
        let contentBox = document.getElementById('article-content');
        let images = contentBox.querySelectorAll('img');
        images.forEach(item => {
          //console.log(item);
          item.addEventListener('click', this.showImage);
        })
      }
    },
    mounted() {

      new Catelog({
        contentEl: 'article-content',
        catalogEl: 'article-catalog-container',
        selector: ['h1', 'h2', 'h3','h4','h5']
      });
      hljs.initHighlighting();
      this.handleContentImages();
      //添加滚动监听
      this.onWindowScroll();
      window.addEventListener('scroll', this.onWindowScroll);
      let that = this;
      let timer = setInterval(function () {
        that.isArticleProcessing = false;
        clearInterval(timer)
      }, 1000);
    },
    beforeDestroy() {
      window.removeEventListener('scroll', this.onWindowScroll);
    },
  };
</script>


<style>

  .article-loading-part .content-loading {
    padding: 10px;
    background: #f3f3f3;
    margin-top: 5px;
  }

  .article-loading-part .loading-title {
    width: 200px;
    height: 24px;
    background-color: #eaeaea;
  }

  .article-loading-part .loading-content {
    margin-left: 10px;
    margin-top: 10px;
    width: 600px;
  }

  .article-loading-part .loading-text {
    width: 100%;
    height: 16px;
    margin: 0 0 10px;
    background-color: #eaeaea;
    -webkit-animation: loading 1s ease-in-out infinite;
    animation: loading 1s ease-in-out infinite;
  }

  .article-loading-part {
    margin-top: 20px;
  }

  .article-loading-part .animation-delay {
    -webkit-animation: loading 1s ease-in-out -.5s infinite;
    animation: loading 1s ease-in-out -.5s infinite;
  }

  @keyframes loading {
    0% {
      width: 20%;
    }
    50% {
      width: 100%;
    }
    100% {
      width: 20%;
    }
  }

  .sub-comment-btn {
    line-height: 54px;
    margin-left: 10px;
  }


  .article-sub-comment-box {
    margin-top: 10px;
  }

  .sub-comment-input {
    width: 640px;
    margin-left: 40px;
  }

  .loader-more-comment, .no-comment-content {
    text-align: center;
    padding: 10px;
    cursor: pointer;
    margin-top: 20px;
  }

  .item-reply-btn:hover, .loader-more-comment:hover {
    color: #A612FF;
  }

  .item-reply-btn {
    cursor: pointer;
  }

  .article-comment-reply {
    padding: 10px;
    background: #F5F5F5;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
    margin-left: 30px;

  }

  .article-comment-content {
    padding: 10px;
    margin-left: 30px;
  }

  .article-comment-action {
    color: #7f828b;
    margin-right: 30px;
    text-align: right;
  }

  .article-comment-user-info .user-name {
    font-weight: 600;
    color: #7f828b;
    margin-left: 5px;
    display: inline-block;
    line-height: 30px;
    font-size: 14px;
  }

  .article-comment-user-info .user-name:hover {
    color: #A612FF;
  }

  .article-comment-user-info {
    margin-bottom: 10px;
  }

  .article-comment-item {
    padding: 10px 0;
    border-bottom: #F5F5F5 solid 1px;
  }

  .article-comment-user-info img {
    width: 30px;
    height: 30px;
    display: inline-block;
    border-radius: 50%;
    vertical-align: middle;
  }

  #article-catalog-container {
    max-height: 300px;
    overflow: hidden;
  }

  .cl-link > span {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
  }

  .cl-link > span:hover {
    color: #A612FF;
  }

  .cl-link-active > span {
    display: block;
    padding-left: 5px;
    color: #A612FF !important;
    background: #F2F2F2;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
  }

  #article-catalog-container ul {
    margin-left: 10px;
    line-height: 30px;
    list-style: none;
  }

  #article-catalog-container {
    padding: 10px;
  }

  #article-content-category-box {
    margin-top: 20px;
  }

  .content-category-title {
    padding: 10px 0;
    font-size: 20px;
    font-weight: 600;
  }

  #article-content-category-box li > span, #article-catalog-container li > span {
    padding-left: 5px;
  }

  #article-content-category-box li, #article-catalog-container li {
    cursor: pointer;
    color: #7f828b;
  }

  #article-content-category-box ul {
    margin-left: 35px;
    list-style: none;
    line-height: 30px;
  }

  .recommend-info span {
    margin-right: 10px;
  }


  .recommend-info a {
    color: #7f828b;
  }

  .recommend-info {
    font-size: 14px;
    color: #7f828b;
  }


  .recommend-summary {
    font-size: 16px;
    color: #7f828b;
    margin: 10px 0;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
  }

  .recommend-title a:hover, .recommend-info a:hover {
    color: #A612FF;
  }

  .recommend-title a {
    color: #47494e;
  }

  .recommend-title {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
    font-size: 22px;
    line-height: 30px;
    font-weight: 600;
  }

  .recommend-item {
    border-bottom: #F5F5F5 solid 1px;
    padding-bottom: 20px;
    padding-top: 20px;
  }

  .comment-submit-btn {
    margin-top: 10px;
    text-align: right;
  }

  .article-comment-input {
    padding: 20px;
    background: #fff;
    margin-bottom: 20px;
  }

  .article-comment-list {
    background: #fff;
    margin-bottom: 20px;
    padding: 20px;
  }

  .comment-item-list {
    margin-top: 10px;
  }

  .comment-input-header {
    padding: 10px 0 20px;
  }

  .recommend-header-title,
  .comment-input-header,
  .comment-list-header {
    font-size: 18px;
    font-weight: 600;
    color: #A612FF;
  }

  .article-recommend-box {
    background: #fff;
    padding: 20px;
  }


  .right-card-content img {
    width: 300px;
    height: 300px;
  }

  #article-right-subscription-box {
    height: 345px;
  }

  .article-detail-hot-label {
    height: 345px;
  }

  .article-right-card {
    width: 300px !important;
    margin-bottom: 20px;
    background: #fff;
  }

  .right-card-content .wordCloud {
    height: 300px;
  }

  .article-detail-part .el-dialog {
    width: fit-content;
  }

  .article-detail-part .el-dialog__body {
    padding: 10px;
  }

  .article-detail-part .el-dialog__header {
    padding: 0;
  }

  .hljs {
    background: #e9ecef !important;
  }

  .article-content h2 {
    padding-top: 10px;
    padding-bottom: 10px;
  }

  .article-content img {
    padding: 10px 0;
    max-width: 780px;
    cursor: zoom-in;
  }

  .article-content pre {
    max-height: 750px;
    padding: 10px 0;
    overflow: auto;
  }

  .article-content pre code {
    font-size: 15px;
    padding: 10px;
    line-height: 24px;
    font-family: "JetBrains Mono";
  }

  .article-content ul, .article-content ol {
    margin-left: 20px;
  }

  .article-detail-title h1 {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    overflow: hidden;
    color: #000;
  }

  .article-content p, .article-content ul {
    line-height: 24px;
    color: #7f828b;
    font-size: 16px;
    padding: 5px 0;
  }

  .article-content h1 {
    color: #000;
    line-height: 40px;

  }


  .article-content {
    margin-top: 20px;
  }

  .article-labels .el-tag {
    margin-right: 10px;
    cursor: pointer;
  }

  .article-labels {
    margin-left: 34px;
    margin-top: 10px;
  }

  .article-info .user-name {
    font-weight: 600;
  }

  .article-info {
    margin-top: 20px;
  }

  .article-info span {
    line-height: 32px;
    font-size: 16px;
    color: #737F90;
  }

  .article-info img {
    width: 24px;
    margin-right: 5px;
    height: 24px;
    border-radius: 50%;
    vertical-align: middle;
  }

  .article-content-box {
    background: #fff;
    margin-bottom: 20px;
    padding: 20px;
  }

  .article-left-part {
    margin-right: 20px;
    width: 820px;
  }

  .article-right-part {
    width: 300px;
  }

  .article-box {
    margin-top: 20px;
    margin-bottom: 20px;
  }

</style>
