const fs = require("fs");
const path = require("path");
const readLine = require("readline")

/**
 * 扫描dir下面的.md文件
 * @param {string} dir
 */
function getPages(dir) {
    return fs.readdirSync(dir).filter((self) => {
        return !fs.statSync(path.join(dir, self)).isDirectory()
    });
}

/**
 * 获取侧边栏
 * @param {string} folder 目录文件名
 * @param {string} title 标题
 */
function getSidebar(folder) {
    let pages = getPages(`docs/${folder}`);
    const sidebar = [];
    pages.sort(function(a, b) {
        //todo 等学了正则再回来改吧....
        return a.substr(0, a.indexOf('.')) * 1 - b.substr(0, b.indexOf('.')) * 1
    });
    pages.forEach((md) => {
        const title = readMDFileTitle(`docs/${folder}/${md}`);
        sidebar.push({
            title,
            path: `/${folder}/${md}`,
            collapsable: false,
        });
    });
    return sidebar;
}

function readMDFileTitle(path) {
    return fs.readFileSync(path, 'utf8').split('\n')[0].replace('# ', '')
}

module.exports = {
    getSidebar,
};