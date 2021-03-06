# Docker 相关

## 安装教程

[Docker 入门指南：如何在 Ubuntu 上安装和使用 Docker](https://kalasearch.cn/community/tutorials/how-to-install-and-use-docker-on-ubuntu/)

## 一个简单的使用流程

### 拉取镜像

```shell
# latest 是标签，默认是 latest，可以不填
docker pull ubuntu:latest
```

### 运行 Docker 容器

```shell
docker run <参数> <镜像名>:<tag> <命令>

docker run -itd -p 6666:22 ubuntu:latest bash
```
下面是一些运行参数

* `-i` 以交互模式运行容器，通常与 -t 同时使用；
* `-t` 为容器重新分配一个伪输入终端，通常与 -i 同时使用；
* `-d` 后台运行容器，并返回容器ID；
* `-p 6666:22` 将容器的 22 端口映射到主机的 6666 端口
* `--name server` 将容器名命名为 server

## Commit

```shell
docker commit -m "<comment>" <container_id> <username>/<image_name>:<tag>
```

* `<comment>`：像 git commit 一样的 comment
* `<container_id>`：容器名
* `<username>`：用户名
* `<image_name>`：镜像名
* `<tag>`：标签


## Push

记得先 `docker login` 登陆

```shell
docker push <username>/<image_name>:<tag>
```

* `<container_id>`：容器名
* `<username>`：用户名
* `<image_name>`：镜像名
* `<tag>`：标签

## 复制文件

```shell
docker cp <container_id>:/<container_path> <system_path>
docker cp <system_path> <container_id>:/<container_path>
```