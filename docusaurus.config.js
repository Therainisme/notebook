// @ts-nocheck
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');
const math = require('remark-math');
const katex = require('rehype-katex');

/** @type {import('@docusaurus/types').Config} */
const config = {
    title: 'Notebook',
    tagline: '一本可以用来垫桌角的笔记本',
    url: 'https://notebook.therainisme.com',
    baseUrl: '/',
    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',
    favicon: 'img/favicon.ico',
    organizationName: 'Therainisme', // Usually your GitHub org/user name.
    projectName: 'notebook', // Usually your repo name.

    presets: [
        [
            'classic',
            /** @type {import('@docusaurus/preset-classic').Options} */
            ({
                docs: {
                    sidebarPath: require.resolve('./sidebars.js'),
                    // Please change this to your repo.
                    editUrl: 'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
                    remarkPlugins: [math],
                    rehypePlugins: [katex],
                },
                blog: {
                    showReadingTime: true,
                    // Please change this to your repo.
                    editUrl: 'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
                    remarkPlugins: [math],
                    rehypePlugins: [katex],
                    blogSidebarCount: "ALL",
                },
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
            }),
        ],
    ],

    themeConfig:
        /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
        ({
            metadata: [
                { name: 'keywords', content: 'notebook,Therainisme,Algorithm,题解,算法,编程,学习笔记' },
                { name: 'google-site-verification', content: 'lIhR5J6yRQNU2obnE35OxMfrUxOj7VjwjNbVE0gh7sk' }
            ],
            navbar: {
                title: '唤雨考拉的笔记本',
                logo: {
                    alt: 'My Site Logo',
                    src: 'img/logo.svg',
                },
                items: [
                    {
                        to: '/blog',
                        label: 'Blog',
                        position: 'left'
                    },
                    // {
                    //     to: "/docs/golang/GETRequest",
                    //     activeBasePath: '/docs/golang',
                    //     label: "Golang",
                    //     position: "left",
                    // },
                    {
                        to: "/docs/react/hooks",
                        activeBasePath: '/docs/react',
                        label: "React",
                        position: "left"
                    },
                    {
                        to: "/docs/algorithm/杂题记录",
                        activeBasePath: '/docs/algorithm',
                        label: "Algorithm",
                        position: "left"
                    },
                    // {
                    //     to: "/docs/microservices/microservicing-strategy",
                    //     activeBasePath: '/docs/microservices',
                    //     label: "Microservices",
                    //     position: "left"
                    // },
                    {
                        to: "/docs/notype/linux/ubuntu",
                        activeBasePath: '/docs/notype',
                        label: "Notype",
                        position: "left"
                    },
                    {
                        to: "/experiment",
                        activeBasePath: '/experiment',
                        label: "Experiment",
                        position: "right"
                    },
                    {
                        href: 'https://github.com/therainisme',
                        label: 'GitHub',
                        position: 'right',
                    },
                ],
            },
            footer: {
                style: 'light',
                copyright: `© ${new Date().getFullYear()} Therainisme`,
            },
            prism: {
                theme: lightCodeTheme,
                darkTheme: darkCodeTheme,
            },
        }),
    stylesheets: [
        {
            href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
            type: 'text/css',
            integrity:
                'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
            crossorigin: 'anonymous',
        },
    ],
};

module.exports = config;