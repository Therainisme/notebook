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
                text: '天书',
                items: [
                    { text: 'React', link: '/react/-1.hooks' },
                    { text: '代码片段', link: '/code-snippets/index' },
                    { text: '算法', link: '/algorithm/1.每日一题' },
                ]
            },
            {
                text: '划水技术',
                items: [
                    { text: '杂题记录', link: '/question/1.先导' },
                    { text: '环境保护大使', link: '/linux/1.ubuntu' },
                    { text: 'Interview', link: '/interview/2.css' },
                    { text: '便民工程', link: '/utils/1.pandoc' }
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
            '/react/': getSidebar('react'),
            '/utils/': getSidebar('utils'),
            '/linux/': getSidebar('linux'),
            '/interview/': getSidebar('interview'),
            '/question/': getSidebar('question'),
            '/algorithm/': getSidebar('algorithm'),
            '/waste-paper/': getSidebar('waste-paper'),
            '/code-snippets/': [{
                    title: 'JavaScript',
                    collapsable: false,
                    children: getSidebar('code-snippets/javascript')
                },
                {
                    title: 'TypeScript',
                    collapsable: false,
                    children: getSidebar('code-snippets/typescript')
                }, {
                    title: 'Java',
                    children: getSidebar('code-snippets/java')
                },
                {
                    title: 'Docker',
                    children: getSidebar('code-snippets/docker')
                }, {
                    title: '未分类',
                    children: getSidebar('code-snippets/other')
                }
            ]
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
            '@vuepress/last-updated',
            {
                transformer: (timestamp, lang) => {
                    // 不要忘了安装 moment
                    const moment = require('moment')
                    moment.locale(lang)
                    return moment(timestamp).fromNow()
                }
            }
        ],
    ],
    locales: {
        '/': {
            lang: 'zh-CN'
        },
    }
}