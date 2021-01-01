<template>
  <div class="login-box">
    <div class="login-tips-text">
      <span class="tips-login">登录</span>
      <span class="login-type" @click="toAccountLogin">账号登录</span>
      ·
      <span class="login-type" @click="toScanLogin">扫码登录</span>
    </div>

    <div class="login-center-scan-box" v-if="loginType==='1'">
      <div class="login-qr-code" id="login-qr-code">
        <el-image ref="loginQrCode" :src="qrCodeLoginImagePath"
                  @error="onQrCodeLoadError">
        </el-image>
      </div>
      <div id="login-qr-code-refresh" @click="refreshQrCode" style="display: none;">
        <span>
          <i class="el-icon-refresh"></i>点击刷新二维码
        </span>
      </div>
      <div class="login-scan-tips">
        请打开客户端App进行扫码登录
      </div>
    </div>

    <div class="login-center-box" v-if="loginType==='0'">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form label-position="right" label-width="100px">
            <el-form-item label="账号" required>
              <el-input v-model="blogUser.userName" placeholder="用户名/邮箱地址"></el-input>
            </el-form-item>
            <el-form-item label="密码" required>
              <el-input type="password" v-model="originalPassword" placeholder="请输入密码"></el-input>
            </el-form-item>
            <el-form-item label="人类验证码" required>
              <el-input v-model="loginInfo.verifyCode" placeholder="请输入右侧验证码"
                        @keyup.enter.native="doLogin"></el-input>
              <img :src="captchaPath" @click="updateVerifyCode" class="captcha-code">
            </el-form-item>
            <el-form-item class="login-button">
              <el-button type="primary" @click="doLogin" size="medium"> 登 录
              </el-button>
              <span class="forget-tips-text">
                <a href="/forget">忘记密码?</a>
              </span>
            </el-form-item>
          </el-form>
        </el-col>
      </el-row>
    </div>

  </div>
</template>
<script>
  import {hex_md5} from "../../utils/md5";
  import * as api from '../../api/api';

  export default {
    head() {
      return {
        title: 'Polaris博客-登录',
        meta: [
          {
            hid: 'description',
            name: 'description',
            content: 'Polaris博客-登录'
          },
          {
            hid: 'keywords',
            name: 'keywords',
            content: 'Polaris,java开发,博客系统,程序员'
          }
        ]
      }
    },
    mounted() {
      this.$store.commit("setCurrentActivityTab", "index");
    },
    created() {
      this.updateVerifyCode();
    },
    asyncData() {
      return {
        loginInfo: {
          verifyCode: ''
        },
        captchaPath: ''
      }
    },
    methods: {
      checkLoginState() {
        if (this.isScanStateChecking || this.loginType !== '1' || this.qrCodeLoginKey === '') {
          return;
        }
        this.isScanStateChecking = true;
        //查询登录状态
        //什么时候去查询
        //图片回来就去查询
        //如果正查询则不需要查询
        api.checkScanLoginState(this.qrCodeLoginKey).then(result => {
          this.isScanStateChecking = false;
          //处理结果
          //有三种结果
          let code = result.code;
          if (code === 2001) {
            //第一种登录成功
            this.handleLoginSuccess(result);
          } else if (code === 4010) {
            //第二种二维码超时
            this.onQrCodeLoadError();
          } else if (code === 4009) {
            //第三种是等待扫码
            this.checkLoginState();
          }
        });
      },
      refreshQrCode() {
        this.getLoginQrCode();
      },
      onQrCodeLoadError() {
        this.qrCodeLoginKey = '';
        this.qrCodeLoginImagePath = '';
        //二维码加载失败
        //显示刷新
        let qrCodeBox = document.getElementById('login-qr-code');
        if (qrCodeBox) {
          qrCodeBox.style.display = 'none';
        }
        let refreshBox = document.getElementById('login-qr-code-refresh');
        if (refreshBox) {
          refreshBox.style.display = 'block';
        }
      },
      toScanLogin() {
        if (this.qrCodeLoginKey === '') {
          this.getLoginQrCode();
        }
        this.loginType = '1'
      },
      toAccountLogin() {
        //清空图片和code数据，下次再切换扫码的话，会重新拉取新的二维码
        this.qrCodeLoginImagePath = '';
        this.qrCodeLoginKey = '';
        this.loginType = '0'
      },
      getLoginQrCode() {
        api.getLoginQrCode().then(result => {
          console.log(result);
          let qrCodeBox = document.getElementById('login-qr-code');
          let refreshBox = document.getElementById('login-qr-code-refresh');
          if (result.code === api.success_code) {
            this.qrCodeLoginKey = result.data.code;
            this.qrCodeLoginImagePath = result.data.url;
            console.log(result.data)
            //控制显示和隐藏
            if (qrCodeBox) {
              //让控件重新加载图片
              this.$refs.loginQrCode.error = false;
              qrCodeBox.style.display = 'block';
              this.checkLoginState();
            }
            if (refreshBox) {
              refreshBox.style.display = 'none';
            }
          }
        }).catch(error => {
          console.log(error);
        });
      },
      updateVerifyCode() {
        this.captchaPath = '/user/captcha?random=' + Date.parse(new Date());
        //console.log(this.captchaPath);
      },
      doLogin() {
        //检查数据
        if (this.blogUser.userName === '') {
          //console.log('do login...');
          this.$message.warning("账号不可以为空！");
          return;
        }
        if (this.originalPassword === '') {
          this.$message.warning("密码不可以为空！");
          return;
        }

        if (this.loginInfo.verifyCode === '') {
          this.$message.warning("人类验证码不可以为空！");
          return;
        }
        //防止重复提交
        if (this.isCommitting) {
          return;
        }
        this.isCommitting = true;
        this.blogUser.password = hex_md5(this.originalPassword);
        //提交数据
        api.doLogin(this.loginInfo.verifyCode, this.blogUser).then(result => {
          this.isCommitting = false;
          //处理登录结果
          //判断状态
          if (result.code === api.success_code) {
            this.handleLoginSuccess(result);
          } else {
            //更新一下人类验证码
            this.updateVerifyCode();
            this.$message.error(result.message);
          }
        });
      },
      handleLoginSuccess(result) {
        //处理结果
        this.$message({
          message: result.message,
          center: true,
          type: 'success'
        });
        //如果是成功
        //this.$router.push({path: '/index'})
        //从地址中获取到redirect
        let redirect = this.$route.query.redirect;
        // console.log("redirect == " + redirect);
        if (redirect) {
          location.href = redirect;
        } else {
          //如果没有就跳转到首页
          location.href = "/";
        }
      }
    },
    data() {
      return {
        isScanStateChecking: false,
        isCommitting: false,
        qrCodeLoginKey: '',
        qrCodeLoginImagePath: '',
        loginType: '0',
        originalPassword: '',
        blogUser: {
          userName: '',
          password: '',
        },
      }
    },
  }
</script>
<style>

  #login-qr-code-refresh span, .login-qr-code .el-image__error {
    line-height: 164px;
    width: 160px;
    cursor: pointer;
    height: 160px;
    display: inline-block;
    background: #F7F7F7;
  }

  #login-qr-code-refresh {
    width: 250px;
    height: 164px;
    text-align: center;
  }

  .login-center-scan-box {
    width: 250px;
    height: 194px;
    margin-left: 20px;
    text-align: center;
  }

  .login-scan-tips {
    margin-top: 10px;
    color: #999;
  }

  .login-qr-code img {
    width: 160px;
    height: 160px;
  }

  .forget-tips-text a:hover, .login-type:hover {
    color: #A612FF;
  }

  .forget-tips-text a {
    color: #999;
  }

  .forget-tips-text {
    margin-left: 10px;
  }

  .login-type {
    cursor: pointer;
    font-size: 14px;
  }

  .tips-login {
    margin-right: 20px;
    font-size: 20px;
    font-weight: 600;
  }

  .login-tips-text {
    display: inline-block;
    margin-bottom: 20px;
    color: #999;
  }

  .captcha-code {
    cursor: pointer;
    vertical-align: middle;
    margin-left: 10px;
    border: solid 1px #E6E6E6;
    width: 120px;
    padding-left: 10px;
    padding-right: 10px;
    height: 40px;
  }

  .login-button {
    margin-bottom: 0;
  }

  .login-center-box {
    margin-left: 65px;
  }

  .login-center-box .el-input {
    width: 200px;
  }


  .login-box {
    border-radius: 4px;
    margin-top: 20px;
    padding: 20px;
    margin-bottom: 20px;
    background: #fff;
  }


  .login-center-box .el-input__inner {
    border: solid 1px #E6E6E6;
    height: 42px;
    border-radius: 0;
  }

  .login-center-box .el-form-item__label {
    background: #FBFBFB;
    border-left: solid 1px #E6E6E6;
    border-top: solid 1px #E6E6E6;
    border-bottom: solid 1px #E6E6E6;
    text-align: center;
  }

</style>
