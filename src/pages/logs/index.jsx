import React, { useEffect } from 'react';
import Layout from '@theme/Layout';

import { List, MessagePlugin } from 'tdesign-react';
import { useState } from 'react';

const { ListItem } = List;

export default function Logs() {
    const [listData, setListData] = useState([]);
    useEffect(() => {
        (async () => {
            const response = await fetch('https://avatar.therainisme.com/logs');
            const { data } = await response.json();
            setListData(data)
        })();
    }, []);

    useEffect(() => {
        if (window.innerWidth <= 540) {
            MessagePlugin.warning({
                content: "你正在进入奇怪的页面",
                placement: "bottom",
                offset: [0, -60],
            });
        } else {
            MessagePlugin.warning({
                content: "你正在进入奇怪的页面",
                placement: "top-right",
                offset: [0, 50],
            });
        }
    }, []);

    return (
        <Layout title="Logs">
            <link rel="stylesheet" href="https://unpkg.com/tdesign-react/dist/tdesign.min.css" />

            <div style={{ padding: "20px" }}>
                <h4>Avatar</h4>
                <List size={'small'}>
                    {listData.map((content, idx) => (
                        <ListItem key={idx}>{content}</ListItem>
                    ))}
                </List>
            </div>
        </Layout>
    );
}