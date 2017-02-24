'use strict';

const cookiesToString = (cookies) => {
  return Object.keys(cookies).map((key)  => `${key}=${cookies[key]};`).join('');
};

const parseSetCookie = (cookies) => {
  return cookies.map(cookie => {
    return cookie.split(';')[0].split('=');
  });
};

const addResCookieToCookies = (res, cookies) => {
  parseSetCookie(res.headers['set-cookie'] || []).forEach(cookie => {
    cookies[cookie[0]] = cookie[1];
  });
};

module.exports = {
  cookiesToString,
  addResCookieToCookies
};
