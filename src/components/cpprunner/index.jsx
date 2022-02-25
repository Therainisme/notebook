import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Row, Col, Textarea, Button, Alert, Loading } from 'tdesign-react';
import styles from "./index.module.css";

import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import './neo.css';


export default function CppRunner() {
    const [text, setText] = useState(cppinit);
    const [stdin, setStdin] = useState("");
    const [stdout, setStdout] = useState("You haven't submitted.");
    const [alertTheme, setAlertTheme] = useState("info");
    const [buttonText, setButtonText] = useState("SUBMIT");
    const [titleInfo, setTitleInfo] = useState("");

    const client = useMemo(() => {
        const ws = new WebSocket("ws://172.23.9.192:7777/sandbox");
        ws.onopen = function () {
            console.log("connect server");
        }
        ws.onmessage = function (e) {
            const response = JSON.parse(e.data)
            console.log(response);
            setButtonText("SUBMIT");
            if (!!response.execResult.output) {
                setStdout(response.execResult.output);
                setAlertTheme("info");
                setTitleInfo(`memory: ${getMB(response.execResult.memory)} time: ${getTime(response.execResult.time)}ms`);
            } else if (!!response.execResult.error) {
                setStdout(response.execResult.error);
                setAlertTheme("error");
            } else if (!!response.compileResult.msg) {
                setStdout(response.compileResult.msg);
                setAlertTheme("error");
            } else if (!!response.compileResult.error) {
                setStdout(response.compileResult.error);
                setAlertTheme("error");
            } else {
                setStdout("unknown error");
                setAlertTheme("error");
            }
        }
        ws.onclose = function (e) {
            console.log("close");
        }
        ws.onerror = function (e) {
            console.log(error);
        }
        return ws;
    }, [])

    function handleSubmit() {
        client.send(text);
        setButtonText(
            <Loading text="Running" style={{ color: "white" }}></Loading>
        );
        setTitleInfo("");
    }

    return (
        <div style={{ width: "100%", height: "100%" }}>
            <Row>
                <Col span={4} push={8}>
                    <div>
                        <Textarea
                            placeholder="Stdin"
                            value={stdin}
                            autosize={{ minRows: 5, maxRows: 10 }}
                            onChange={(value) => {
                                setStdin(value);
                            }}
                        />
                    </div>
                    <Button disabled={buttonText === "SUBMIT" ? false : true} block variant="base" className={styles.button} onClick={handleSubmit}>
                        {buttonText}
                    </Button>
                    <div className={styles.alert}>
                        <Alert
                            theme={alertTheme}
                            title={"OUTPUT " + titleInfo}
                            message={
                                <div>
                                    {
                                        Array.from(stdout).map(((x, idx) => {
                                            if (x === "\n") return <br key={idx}/>;
                                            else return x;
                                        }))
                                    }
                                </div>
                            }
                        />
                    </div>
                </Col>
                <Col span={8} pull={4}>
                    <div className={styles.codeinputCard}>
                        <CodeMirror
                            height="calc(100vh - 180px)"
                            width={"calc(57vw)"}
                            className={styles.codeinput}
                            value={text}
                            extensions={[cpp()]}
                            onChange={(value, viewUpdate) => {
                                setText(value);
                            }}
                        />
                    </div>
                </Col>
            </Row>
        </div>
    );
}

const cppinit = `#include <bits/stdc++.h>

using namespace std;

int main() {
    for (int i = 1; i <= 5; ++ i) {
        cout << "hello world!" << endl;
    }

    return 0;
}`

function getMB(target) {
    let res = Math.floor(target / 1024 * 100) / 100;
    if (res <= 0.01) return 0.01;
    return res;
}

function getTime(target) {
    let res = Math.floor(target / 1000 / 1000 * 100) / 100;
    if (res <= 0.01) return 0.01;
    return res;
}