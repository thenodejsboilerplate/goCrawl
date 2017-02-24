'use strict';
const fs = require('fs');
const {
    resolve,
    basename,
    extname,
    dirname
} = require('path');

const mkdir = (dirpath) => {
  return new Promise((resolve, reject) => {
    fs.mkdir(dirpath, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

const exists = (dirpath) => {
  return new Promise((resolve) => {
    fs.exists(dirpath, (existence) => {
      resolve(existence);
    });
  });
};


/**
 * 遍历该文件夹，获取所有文件。
 *
 * @param  {String} dirname 文件夹路径
 * @return {[String]}         文件路径的数组
 */
const readdir = (dirname) => {
  return fs.readdirSync(dirname).map(filename => {
    const filePath = resolve(dirname, filename);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory())
      return readdir(filePath);
    else if (stat.isFile())
      return [filePath];
  }).reduce((files, e) => [...files, ...e], []);
};

/**
 * 根据dirpath创建文件夹，如果此文件夹的上级目录不存在，则会递归创建
 *
 * @param {String} dirpath 文件夹路径
 * @return {Promise}
 */
const mkdirRecursion = (dirpath) => {
  return exists(dirpath)
        .then((existence) => {
          if (!existence)
            return mkdirRecursion(dirname(dirpath))
                    .then(() => {
                      return mkdir(dirpath);
                    });
        });
};



module.exports = {
  readdir,
  mkdirRecursion
};
