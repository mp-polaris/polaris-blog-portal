import http from './http';

// export const imgBaseUrl =  ''; //走Nginx代理，不需要
export const imgBaseUrl =  'http://mpolaris.top';

export const PolarisBlogAdminUrl =  'http://mp.mpolaris.top';

const baseUrl =  'http://localhost:8085';
// const baseUrl =  'http://mpolaris.top:8080';
// const baseUrl =  'http://172.20.147.156:8080'; //部署服务器私网地址

export const success_code = 2000;

export const getAdminInfo = () => {
  if (process.client) {
    return http.requestGet('/user/user_info/794586816966557696');
  } else {
    return http.requestGet(baseUrl + '/user/user_info/794586816966557696');
  }
};

export const getCategories = () => {
  if (process.client) {
    return http.requestGet('/portal/article/categories');
  } else {
    return http.requestGet(baseUrl + '/portal/article/categories');
  }
};
export const getLoop = () => {
  if (process.client) {
    return http.requestGet('/portal/web_size_info/loops');
  } else {
    return http.requestGet(baseUrl + '/portal/web_size_info/loops');
  }
};
export const getTopArticle = () => {
  if (process.client) {
    return http.requestGet('/portal/article/top');
  } else {
    return http.requestGet(baseUrl + '/portal/article/top');
  }
};
export const getLabels = (count) => {
  return http.requestGet('/portal/article/label/' + count);
};
export const getArticles = (categoryId, page, size) => {
  if (categoryId !== '') {
    return http.requestGet('/portal/article/list/' + categoryId + '/' + page + '/' + size);
  }
  if (process.client) {
    //客户端
    return http.requestGet('/portal/article/list/' + page + '/' + size);
  } else {
    //服务端
    return http.requestGet(baseUrl + '/portal/article/list/' + page + '/' + size);
  }
};

export const getSearchContent = (categoryId, keyword,page,size,sort) => {
  return http.requestGet(baseUrl + "/portal/search?keyword=" + encodeURIComponent(keyword)
    + "&page=" + page + "&size="
    + size + "&categoryId=" + categoryId
    + "&sort=" + sort);
};

export const getLinkList = () => {
  if (process.client) {
    return http.requestGet("/portal/web_size_info/friend_links");
  } else {
    return http.requestGet(baseUrl + "/portal/web_size_info/friend_links");
  }
};

export const getLoginQrCode = () => {
  return http.requestGet("/user/pc-login-qr-code");
};


export const doLogin = (verifyCode, blogUser) => {
  return http.requestPost('/user/login/' + verifyCode + '?from=_p', blogUser);
};

export const checkToken = () => {
  return http.requestGet('/user/check-token');
};

export const doLogout = () => {
  return http.requestGet('/user/logout');
};


export const checkScanLoginState = (loginId) => {
  return http.requestGet('/user/qr-code-state/' + loginId);
};

export const checkUserName = (userName) => {
  return http.requestGet('/user/user_name?userName=' + userName);
};

export const updateUserInfo = (blogUser, userId) => {
  return http.requestPut('/user/user_info/' + userId, blogUser);
};


export const sendEmailCode = (captchaCode, email, type) => {
  return http.requestGet('/user/verify_code?captchaCode=' + captchaCode
    + '&email=' + email
    + '&type=' + type);
};

export const registerUser = (captcha_code, email_code, blogUser) => {
  return http.requestPost('/user/register/?captcha_code=' + captcha_code
    + '&email_code=' + email_code, blogUser);
};

export const checkVerifyCode = (captchaCode, email, emailCode) => {
  return http.requestGet('/user/check-email-code?captchaCode=' + captchaCode
    + '&email=' +
    email
    + '&emailCode='
    + emailCode);
};
export const updatePassword = (verifyCode, blogUser) => {
  return http.requestPut('/user/password/' + verifyCode, blogUser);
};
export const getArticleDetailById = (articleId) => {
  return http.requestGet(baseUrl + '/portal/article/' + articleId);
};
export const getRecommendArticle = (articleId, size) => {
  return http.requestGet(baseUrl + '/portal/article/recommend/' + articleId + '/' + size);
};

export const postComment = (articleComment) => {
  return http.requestPost('/portal/comment', articleComment);
};
export const getFile = (url, params) => {
  return http.requestGet(url, params);
};

export const getCommentsByArticleId = (articleId, page, size) => {
  if (process.client) {
    return http.requestGet("/portal/comment/list/" + articleId + "/" + page + "/" + size);
  } else {
    return http.requestGet(baseUrl + "/portal/comment/list/" + articleId + "/" + page + "/" + size);
  }
};

export const getUserInfo = (userId) => {
  if (process.client) {
    return http.requestGet("/user/user_info/" + userId);
  } else {
    return http.requestGet(baseUrl + "/user/user_info/" + userId);
  }
};



