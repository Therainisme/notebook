/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
    // By default, Docusaurus generates a sidebar from the docs folder structure
    // tutorialSidebar: [{ type: 'autogenerated', dirName: '.' }],

    // But you can create a sidebar manually

    // tutorialSidebar: [{
    //     type: 'category',
    //     label: 'React',
    //     items: ['react'],
    // }, ],
    reactSideBar: [
        {
            type: 'autogenerated',
            dirName: 'react',
        },
    ],
    golang: [
        {
            type: 'autogenerated',
            dirName: 'golang',
        },
    ],
    algorithm: [
        {
            type: 'autogenerated',
            dirName: 'algorithm',
        },
    ],
    notype: [
        {
            type: 'category',
            label: '环境保护大使',
            items: [
                {
                    type: 'autogenerated',
                    dirName: 'notype/linux'
                },
            ],
        },
        {
            type: 'category',
            label: '前端杂记',
            items: [
                {
                    type: 'autogenerated',
                    dirName: 'notype/frontend'
                },
            ],
        },
        {
            type: 'category',
            label: '未分类',
            items: [
                {
                    type: 'autogenerated',
                    dirName: 'notype/other'
                },
            ],
        }
    ]
};

module.exports = sidebars;