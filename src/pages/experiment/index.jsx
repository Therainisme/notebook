import React, { useEffect, useState } from 'react';
import Layout from '@theme/Layout';

import { Layout as TLayout, Menu } from 'tdesign-react';

import {
    DashboardIcon,
    ServerIcon,
    RootListIcon,
    ControlPlatformIcon,
    PreciseMonitorIcon,
    MailIcon,
    UserCircleIcon,
    PlayCircleIcon,
    Edit1Icon,
} from 'tdesign-icons-react';
import Logs from '../../components/logs';
import CppRunner from '../../components/cpprunner';

const { MenuItem } = Menu;

const { Aside } = TLayout;

export default function Experiment() {
    const [site, setSite] = useState(<CppRunner />);
    const [memuActive, setMemuActive] = useState("cpp-runner");

    function switchLogs() {
        setSite(<Logs />);
        setMemuActive("logs");
    }

    function switchCppRunner() {
        setSite(<CppRunner />);
        setMemuActive("cpp-runner");
    }

    return (
        <Layout title="Experiment">
            <link rel="stylesheet" href="/css/tdesign.min.css" />
            <TLayout style={{ background: "white" }}>
                <Aside style={{ borderTop: '1px solid var(--component-border)' }}>
                    <Menu theme="light" value={memuActive} style={{ marginRight: 50, height: 550 }}>
                        <MenuItem
                            value="logs"
                            icon={<DashboardIcon />}
                            onClick={switchLogs}
                        >
                            Logs
                        </MenuItem>
                        <MenuItem
                            value="cpp-runner"
                            icon={<ControlPlatformIcon />}
                            onClick={switchCppRunner}
                        >
                            Cpp Runner
                        </MenuItem>
                    </Menu>
                </Aside>
                {site}
            </TLayout>
        </Layout >
    );
}