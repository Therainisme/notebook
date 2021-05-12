const { getSidebar } = require('../../js/utils');

module.exports = {
    markdown: {
        lineNumbers: false
    },
    title: '唤雨考拉的笔记本',
    description: '对于唤雨考拉来说，这是一个百宝箱，但对于其他人来说，可能是一本用处不大的笔记本。',
    head: [
        ['link', {
            rel: 'icon',
            href: '/logo.png'
        }],
        ['meta', { name: 'keywords', content: 'notebook,Therainisme,Algorithm,题解,算法,编程,学习笔记' }],
        ['meta', { name: 'google-site-verification', content: 'lIhR5J6yRQNU2obnE35OxMfrUxOj7VjwjNbVE0gh7sk' }]
    ],
    themeConfig: {
        // 添加导航栏
        nav: [{
                text: '理论技术',
                items: [
                    { text: '代码片段', link: '/code-snippets/index' },
                    { text: '数据库系统概论', link: '/database/1.绪论' },
                ]
            },
            {
                text: '划水技术',
                items: [
                    { text: '算法', link: '/algorithm/99.竞赛中常用的C++黑魔法' },
                ]
            },
            {
                text: '废纸篓',
                items: [
                    { text: 'Java', link: '/waste-paper/1.java' },
                ]
            },
        ],
        // 为以下路由添加侧边栏
        sidebar: {
            '/database/': getSidebar('database'),
            '/algorithm/': getSidebar('algorithm'),
            '/waste-paper/': getSidebar('waste-paper'),
            '/code-snippets/': [{
                title: 'Java',
                collapsable: false,
                children: getSidebar('code-snippets/java')
            }]
        },
        sidebarDepth: 3, // 目录深度
        lastUpdated: '上次更新时间', // 上次更新
        smoothScroll: true, // 页面滚动,
        // 编辑页面链接
        editLinks: true,
        editLinkText: '在 GitHub 上编辑此页 ！',
        docsBranch: 'main',
        docsDir: 'docs',
        editLinkPattern: ':repo/-/edit/:branch/:path',
        repo: 'Therainisme/Notebook', //GitHub仓库
    },
    plugins: [
        [
            "md-enhance",
            {
                // 启用 TeX 支持
                tex: true,
            },
        ],
    ],
    locales: {
        '/': {
            lang: 'zh-CN'
        },
    }
}