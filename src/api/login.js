import fetch from 'utils/fetch';

/**
 * 通过账号登录
 * @param account
 * @param password
 * @constructor
 */
export function LoginByAccount(account, password) {
  const data = {
    account,
    password
  };
  return fetch({
    url: '/Admin/Auth/login.html',
    method: 'post',
    data
  });
}

/**
 * 退出登录
 * @param token
 */
export function logout(token) {
  return fetch({
    url: '/Admin/Auth/logout.html',
    method: 'post',
    params: { token }
  });
}

/**
 * 获取信息
 * @param token
 */
export function getInfo(token) {
  return fetch({
    url: '/Admin/Auth/get_user_info.html',
    method: 'get',
    params: { token }
  });
}

