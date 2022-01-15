import React from 'react';
import clsx from 'clsx';
import styles from './HomepageFeatures.module.css';

const FeatureList = [
    {
        title: '我还不知道写什么',
        Svg: require('../../static/img/undraw_docusaurus_mountain.svg').default,
        description: (
            <>
                这里写着的肯定是一堆废话，如果我这里不写废话的话，那么废话就没有地方可写了。
            </>
        ),
    },
    {
        title: '但这样放着比较和谐',
        Svg: require('../../static/img/undraw_docusaurus_tree.svg').default,
        description: (
            <>
                这三个东西在这里挺正常，还能适应手机的布局。
            </>
        ),
    },
    {
        title: '所以我就懒得改啦',
        Svg: require('../../static/img/undraw_docusaurus_react.svg').default,
        description: (
            <>
                我真的一点话都编不出来了，谁来救救我告诉我这里应该写什么比较好。
            </>
        ),
    },
];

function Feature({ Svg, title, description }) {
    return (
        <div className={clsx('col col--4')}>
            <div className="text--center">
                <Svg className={styles.featureSvg} alt={title} />
            </div>
            <div className="text--center padding-horiz--md">
                <h3>{title}</h3>
                <p>{description}</p>
            </div>
        </div>
    );
}

export default function HomepageFeatures() {
    return (
        <section className={styles.features}>
            <div className="container">
                <div className="row">
                    {FeatureList.map((props, idx) => (
                        <Feature key={idx} {...props} />
                    ))}
                </div>
            </div>
        </section>
    );
}
