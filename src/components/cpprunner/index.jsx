import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Row, Col, Textarea, Button, Alert, Loading } from 'tdesign-react';
import styles from "./index.module.css";

import CodeMirror from '@uiw/react-codemirror';
import { Prec, EditorState, Compartment } from "@codemirror/state";
import { keymap } from "@codemirror/view";
import { insertNewlineAndIndent, indentWithTab  } from "@codemirror/commands";
import { indentUnit } from "@codemirror/language"

import { cpp } from '@codemirror/lang-cpp';
import './neo.css';

export default function CppRunner() {
    const [text, setText] = useState();
    const [stdin, setStdin] = useState();
    const [stdout, setStdout] = useState("You haven't submitted.");
    const [alertTheme, setAlertTheme] = useState("info");
    const [buttonText, setButtonText] = useState("SUBMIT");
    const [titleInfo, setTitleInfo] = useState("");

    useEffect(() => {
        text && localStorage.setItem("cpptext", text);
    }, [text]);

    useEffect(() => {
        stdin && localStorage.setItem("stdin", stdin);
    }, [stdin]);

    useEffect(() => {
        const cpptext = localStorage.getItem("cpptext");
        if (cpptext) {
            setText(cpptext);
        } else {
            setText(cppinit);
        }
        const stdin = localStorage.getItem("stdin");
        if (stdin) {
            setStdin(stdin);
        } else {
            setStdin("Hello,World!");
        }
    }, []);

    const [client, setClient] = useState(undefined)
    useEffect(() => {
        const ws = new WebSocket("wss://sandbox-server.therainisme.com");
        ws.onopen = function () {
            console.log("connect server");
        }
        ws.onmessage = function (e) {
            const response = JSON.parse(e.data)
            console.log(response);
            const {memory, time, output, error, errorType} = response
            setButtonText("SUBMIT");
            if (!errorType) {
                setStdout(output);
                setAlertTheme("info");
                setTitleInfo(`memory: ${getMB(memory)} time: ${getTime(time)}ms`);
            } else if (!!error) {
                setStdout(error);
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
        setClient(ws);
    }, [])

    function handleSubmit() {
        client.send(JSON.stringify({
            code: text,
            stdin: stdin
        }));
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
                                            if (x === "\n") return <br key={idx} />;
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
                            extensions={[
                                cpp(),
                                indentUnit.of('    '),
                            ]}
                            onChange={(value, viewUpdate) => {
                                setText(value);
                            }}
                            onKeyUp={(e) => {
                                if (e.ctrlKey && e.altKey && e.key === "n") {
                                    if (buttonText === "SUBMIT") {
                                        handleSubmit();
                                    }
                                }
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
    string s;
    for (int i = 1; i <= 1; ++ i) {
        cin >> s;
        cout << s << endl;
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