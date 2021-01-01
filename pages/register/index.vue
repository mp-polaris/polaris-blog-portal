<template>
  <div class="register-box">
    <div class="register-form-container">
      <div class="register-title">
        注册
      </div>
      <div class="form-content">
        <el-form label-width="100px">
          <el-form-item label="人类验证码" required>
            <el-input v-model="captchaCode" placeholder="请输入右侧验证码"
                      @keyup.enter.native="doLogin"></el-input>
            <img
              :src="captchaPath"
              @click="updateVerifyCode" class="captcha-code">
          </el-form-item>
          <el-form-item
            label="邮箱地址" required>
            <el-input v-model="blogUser.email" placeholder="请输入邮箱地址"></el-input>
            <el-button v-if="!isCountDowning" type="primary" @click="getVerifyCode"
                       class="email-get-verify-code-btn">获取验证码
            </el-button>
            <el-button v-else class="get-verify-code-btn" @click.prevent="getVerifyCode" type="primary">
              {{countDownText}}
            </el-button>
          </el-form-item>
          <el-form-item
            label="验证码" required>
            <el-input v-model="emailCode" placeholder="请输入邮箱验证码"></el-input>
          </el-form-item>
          <el-form-item
            label="用户名" required>
            <el-input v-model="blogUser.userName" @blur="checkUserName" placeholder="唯一的昵称"></el-input>
            <span class="el-icon-error" v-if="isUserNameOkay==='1'"> 该用户名已注册</span>
            <span class="el-icon-success" v-if="isUserNameOkay==='0'"> 您的用户名也太棒了</span>
          </el-form-item>
          <el-form-item
            label="密  码" required>
            <el-input v-model="originalPassword" type="password" placeholder="请输入暗号"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="doRegister">注册</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script>
  import * as api from '../../api/api'
  import {hex_md5} from "../../utils/md5";
  /*注册相关的逻辑：
  * 1、当鼠标离开用户名时候，需要校验用户名是否已经存在
  * 2、点击获取验证码，检查格式和邮箱是否已经注册，再获取验证码
  *
  * 输入框：

  * 2、邮箱地址  ---> 获取验证码按钮
  * 3、邮箱验证码
  * 1、用户名
  * 4、密码
  * 5、人类验证码
  * 6、注册按钮
  *
  * 结果处理：
  *
  * 1、用户名已经注册（toast）
  * 2、验证码不正确（toast） ---> 停止倒计时
  * 3、图灵验证码不正确 ---> 重新加载一个新的图灵验证码
  * 4、邮箱格式不正确---> （toast）
  * 5、注册成功结果---->跳转到登录页面
  * */
  export default {
    head() {
      return {
        title: 'Polaris博客-注册',
        meta: [
          {
            hid: 'description',
            name: 'description',
            content: 'Polaris博客-注册'
          },
          {
            hid: 'keywords',
            name: 'keywords',
            content: 'Polaris博客,java开发,博客系统,程序员'
          }
        ]
      }
    },
    mounted() {
      this.$store.commit("setCurrentActivityTab", "index");
    },
    methods: {
      checkUserName() {
        if (this.blogUser.userName === '') {
          this.isUserNameOkay = '';
          return;
        }
        //查询用户名是否可用
        api.checkUserName(this.blogUser.userName).then(result => {
          if (result.code === api.success_code) {
            //不可用，已经存在
            this.isUserNameOkay = '1';
          } else {
            //可用，不存在
            this.isUserNameOkay = '0';
          }
        });
      },
      updateVerifyCode() {
        this.captchaPath = '/user/captcha?random=' + Date.parse(new Date())
        //console.log(this.captchaPath);
      },
      doRegister() {
        //检查内容
        if (this.captchaCode === '') {
          this.$message.error("证明一下你是人类");
          return;
        }
        if (this.blogUser.email === '') {
          this.$message.error("您没写邮箱呢！");
          return;
        }
        if (this.emailCode === '') {
          this.$message.error("您没有收到邮箱验证码？");
          return;
        }
        if (this.blogUser.userName === '') {
          this.$message.error("怎么称呼您呢？");
          return;
        }
        if (this.originalPassword === '') {
          this.$message.error("没有输入暗号");
          return;
        }
        //转换密码
        this.blogUser.password = hex_md5(this.originalPassword);
        //提交数据
        api.registerUser(this.captchaCode, this.emailCode, this.blogUser).then(result => {
          //处理结果
          if (result.code === 2002) {
            //注册成功
            //给出提示
            this.$message.success(result.message);
            //直接跳转到登录页面
            location.href = "/login";
          } else {
            this.$message.error(result.message);
            //给出提示，更新验证码
            this.updateVerifyCode();
          }
        });
      },
      startCountDown() {
        let time = 60;
        this.isCountDowning = true;
        let that = this;
        let interval = setInterval(function () {
          //执行倒计时内容
          time--;
          if (time <= 0) {
            that.isCountDowning = false;
            clearInterval(interval);
          }
          that.countDownText = '重新发送(' + time + ')';
          // console.log('倒计时 == >  ' + time + '  ' + that.countDownText);
        }, 1000);
      },
      getVerifyCode() {
        /*
        * 检查人类验证码是否为空
        * 检查邮箱地址是否为空
        * 校验邮箱格式
        * 请求发送验证码
        * 禁止按钮点击并且倒计时
        * */
        if (this.captchaCode === '') {
          this.$message.error("请输入人类验证码");
          return;
        }

        if (this.blogUser.email === '') {
          this.$message.error("请输入邮箱地址");
          return;
        }

        // 检查邮箱格式，判空
        let reg = /\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}/
        if (!reg.test(this.blogUser.email)) {
          this.$message.error("邮箱地址格式不正确");
          return
        }

        api.sendEmailCode(this.captchaCode, this.blogUser.email, 'register').then(result => {
          if (result.code === api.success_code) {
            //如果发送成功，开始倒计时
            this.startCountDown();
            this.$message.success(result.message);
          } else {
            //否则给出提示
            this.$message.error(result.message);
          }
        })
      }
    },
    data() {
      return {
        isUserNameOkay: '',
        isCountDowning: false,
        countDownText: '重新发送(60)',
        captchaPath: '/user/captcha',
        captchaCode: '',
        emailCode: '',
        originalPassword: '',
        blogUser: {
          userName: '',
          password: '',
          email: ''
        }
      }
    }
  };
</script>
<style>

  .form-content .el-icon-error {
    color: #F56C6C;
  }

  .form-content .el-icon-success {
    color: #67C23A;
  }

  .form-content {
    margin-left: 60px;
  }

  .register-title {
    color: #999;
    position: absolute;
    margin-right: 20px;
    font-size: 20px;
    font-weight: 600;
  }

  .register-form-container {
    position: relative;
  }

  .captcha-code {
    cursor: pointer;
    vertical-align: middle;
    margin-left: 10px;
    border: solid 1px #E6E6E6;
    width: 118px;
    padding-left: 10px;
    padding-right: 10px;
    height: 36px;
  }


  .get-verify-code-btn {
    margin-left: 10px;
  }

  .register-form-container .el-input__inner {
    width: 250px;
  }

  .register-form-container .el-input {
    width: auto;
  }

  .register-box {
    margin-top: 20px;
    margin-bottom: 20px;
    padding: 20px;
    background: #fff;
  }
</style>
