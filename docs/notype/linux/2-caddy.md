# Caddy 食用方式

## 基本操作

### 安装

1. 在终端运行以下命令以添加存储库

```shell
echo "deb [trusted=yes] https://apt.fury.io/caddy/ /" | sudo tee -a /etc/apt/sources.list.d/caddy-fury.list
```

2. 更新 apt 缓存

```shell
sudo apt update
```

3. 使用以下命令安装 Caddy

```shell
sudo apt install caddy
```

### 状态控制

1. 查看运行状态

```shell
sudo systemctl status caddy
```

2. 重启

```shell
systemctl reload caddy
```

3. 停止

```shell
systemctl stop caddy
```

4. 启动

```shell
systemctl start caddy
```

### 配置文件

```shell
nano /etc/caddy/Caddyfile
```

## http 跳转 https

下面这个配置，访问 `md.therainisme.com`，如果是 http，将自动跳转到 https。

```
http://md.therainisme.com {
    redir https://{host}{url}
}
```

## 绑定域名的静态页面

静态资源的路径是在 `/space.kexie/hellokexie/`，caddy 会尝试寻找该目录下面的 index.html。

```caddy
https://md.therainisme.com {
    root * /space.kexie/hellokexie/
    file_server
}
```

## 访问域名反代到某端口

访问 `https://kexie.therainisme.com` 是，会请求 `http://127.0.0.1:5201`。

```
https://kexie.therainisme.com {
    reverse_proxy http://127.0.0.1:5201
}
```
