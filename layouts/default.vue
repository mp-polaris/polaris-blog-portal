<template>
  <div id="blog-box">
    <div id="blog-header" class="blog-header clear-fix default-border-radius">
      <div class="logo-box float-left">
        <div class="logo">
          <a href="/">
            <h1>Polaris博客</h1>
          </a>
        </div>
      </div>

      <div id="login-tips-text-box" style="display: none;" v-if="userInfo == null" class="login-tips-text-box float-right">
        <span>
          <a :href="'/login'+redirectPath"><i class="sob_blog sobfingermap"></i>登录</a>
        </span>
        <span>
         <a href="/register"><i class="sob_blog sobmembers-add"></i>注册</a>
        </span>
      </div>

      <div id="user-info-box" style="display: none;" class="user-info-box float-right clear-fix">
        <div class="header-user-avatar float-left">
          <img v-if="userInfo!==null" style="object-fit: cover"
               :src="imgUrl + userInfo.avatar">
        </div>
        <div class="header-user-username float-left" v-if="userInfo!==null">
          <el-dropdown @command="handlerCommand">
                      <span class="el-dropdown-link">
                        {{userInfo.userName}} <i class="el-icon-arrow-down el-icon--right"></i>
                      </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="userInfo">用户信息</el-dropdown-item>
              <el-dropdown-item command="adminCenter" v-if="userInfo.roles==='role_admin'">管理中心</el-dropdown-item>
              <el-dropdown-item command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>

      <div class="navigation-box float-right" style="margin-right: 300px">
        <NuxtLink to="/">
          <span :class="$store.state.currentActivityTab==='index'?'header-title-activity':''"><i
            class="sob_blog sobhome"></i> 首页</span>
        </NuxtLink>
        <NuxtLink to="/link">
          <span :class="$store.state.currentActivityTab==='link'?'header-title-activity':''"><i
            class="sob_blog soblink"></i> 友链</span>
        </NuxtLink>
        <a href="/about" target="_blank">
          <span :class="$store.state.currentActivityTab==='about'?'header-title-activity':''"><i
            class="el-icon-goods"></i> 关于</span>
        </a>
        <a href="https://www.cnblogs.com/mpolaris/" target="_blank">
          <span><i class="sob_blog sobabout_line"></i> 技术交流</span>
        </a>
      </div>
    </div>

    <Nuxt/>

    <div class="blog-footer">
      <div class="copy-right-box">
        <p>
          Copyright ©
          <a href="https://www.cnblogs.com/mpolaris/" target="_blank">
            Polaris
          </a>
          (2014-2020） 本网站由程序猿(媛)用爱驱动
        </p>
      </div>
      <div class="bottom-link">
        <span>
          <a href="/about" target="_blank">关于我</a>
        </span>
        |
        <span>
          <a href="/about#contacts" target="_blank">联系我</a>
        </span>
        |
        <span>
         <a href="/link" target="_blank">友情链接</a>
        </span>
      </div>
    </div>

    <div id="g-to-top" style="display: none;" @click="toTop">
      <div class="el-icon-caret-top">
      </div>
      <div>
        回到
        <br>
        顶部
      </div>
    </div>
  </div>
</template>
<script>
  import * as api from '../api/api';

  export default {
    computed: {
      imgUrl() {
        return api.imgBaseUrl;
      }
    },
    methods: {
      toTop() {
        document.documentElement.scrollTo({
          top: 0,
          behavior: 'smooth'
        })
      },
      onWindowScroll() {
        let offTop = document.documentElement.scrollTop;
        let toTopBox = document.getElementById('g-to-top');
        if (offTop > 500) {
          toTopBox.style.display = 'block';
        } else {
          toTopBox.style.display = 'none';
        }
      },
      handlerCommand(command) {
        if (command === 'logout') {
          api.doLogout().then(result => {
            if (result.code === api.success_code) {
              //跳转到登录页面
              location.href = "/login"
            }
          })
        } else if (command === 'adminCenter') {
          location.href = api.PolarisBlogAdminUrl
        } else if (command === 'userInfo') {
          location.href = "/userInfo/" + this.userInfo.id;
        }
      },
      checkToken() {
        api.checkToken().then(result => {
          let loginTips = document.getElementById('login-tips-text-box');
          let userInfoBox = document.getElementById('user-info-box');
          if (result.code === api.success_code) {
            //获取成功
            this.userInfo = result.data;
            //拿到id以后，通过状态树共享，跟其他组件共享
            this.$store.commit("setCurrentUserId", this.userInfo.id);
            //console.log(this.$store.state.currentUserId);
            //console.log(userInfoBox);
            if (userInfoBox) {
              // console.log('show user info box....');
              userInfoBox.style.display = 'block';
            }
          } else {
            if (loginTips) {
              //控制顶部登录提示的显示
              loginTips.style.display = 'block';
            }
          }
        })
      }
    },
    beforeDestroy() {
      window.removeEventListener("scroll", this.onWindowScroll);
    },
    mounted() {
      window.addEventListener("scroll", this.onWindowScroll);
      //console.log(this.$store.state.currentActivityTab);
      //this.$store.commit("setCurrentActivityTab", "about");
      //console.log(this.$store.state.currentActivityTab);
      //console.log(this.$route.path);
      if (this.redirectPath !== '?redirect=' + location.href &&
        this.$route.path !== '/'
        && this.$route.path !== '/login'
        && this.$route.path !== '/register'
        && this.$route.path !== '/forget'
      ) {
        //排除一些特殊的，比如说登录
        //比如说首页
        this.redirectPath = '?redirect=' + location.href;
      }
      this.checkToken()
    },
    data() {
      return {
        redirectPath: '',
        userInfo: null
      }
    }
  };
</script>
<style>

  #g-to-top .el-icon-caret-top {
    font-size: 30px;
  }

  #g-to-top:hover {
    border: 1px solid #A612FF;
    color: #A612FF !important;
  }

  #g-to-top {
    border: 1px solid #7f828b;
    padding: 0 10px 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    position: fixed;
    right: 20px;
    text-align: center;
    bottom: 200px;
  }

  .bottom-link a:hover {
    color: #A612FF;
  }

  .header-title-activity {
    color: #A612FF !important;
  }

  .header-user-username span {
    font-weight: 600;
    cursor: pointer;
    color: #737F90;
  }

  .header-user-avatar {
    margin-right: 10px;
  }

  .header-user-avatar img {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    vertical-align: middle;
  }

  .el-message {
    min-width: 0 !important;
  }

  .el-carousel__button {
    height: 10px;
    width: 10px;
    border-radius: 50%;
  }


  h1 {
    color: #737F90;
    font-size: 24px;
    font-weight: 600;
  }

  .default-border-radius {
    border-radius: 4px;
  }

  .navigation-box span:hover, .login-tips-text-box span:hover {
    color: #A612FF;
  }

  .navigation-box span {
    margin-right: 40px;
    color: #737F90;
    font-size: 18px;
    cursor: pointer;
  }

  .navigation-box i {
    font-size: 20px;
    font-weight: 600;
  }

  .navigation-box {
    position: absolute;
    right: 10px;
  }

  .login-tips-text-box a:hover {
    color: #A612FF;
  }

  .login-tips-text-box a {
    margin-right: 10px;
    color: #737F90;
  }

  .login-tips-text-box {
    font-size: 16px;
  }

  .logo-box {
    margin-left: 10px;
  }

  .logo-box .logo {
    color: #737F90;
    font-size: 24px;
    font-weight: 600;
  }


  a {
    text-decoration: none;
  }

  .copy-right-box {
    margin-bottom: 10px;
  }

  .blog-footer {
    color: #737F90;
    padding-bottom: 30px;
    text-align: center;
  }

  * {
    padding: 0;
    margin: 0;
  }

  .blog-header {
    line-height: 30px;
    position: relative;
    margin-top: 20px;
    background: #Fff;
    padding: 10px;
  }

  body {
    background: #F2F2FA;
  }

  #blog-box {
    width: 1140px;
    margin: 0 auto;
  }

  .float-left {
    float: left;
  }

  .float-right {
    float: right;
  }

  .clear-fix {
    overflow: hidden;
    zoom: 1;
  }
</style>
