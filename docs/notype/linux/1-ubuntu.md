# 关于拿到一台阿里云服务器之后应该怎么做？

## 换阿里源

1. 备份 /etc/apt/sources.list

```shell
cp /etc/apt/sources.list /etc/apt/sources.list.bak
```

2. 在 /etc/apt/sources.list **文档前面**追加阿里源地址

```shell
deb http://mirrors.aliyun.com/ubuntu/ bionic main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ bionic-security main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ bionic-updates main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ bionic-proposed main restricted universe multiverse
deb http://mirrors.aliyun.com/ubuntu/ bionic-backports main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-security main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-updates main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-proposed main restricted universe multiverse
deb-src http://mirrors.aliyun.com/ubuntu/ bionic-backports main restricted universe multiverse
```

3. 最后执行命令更新源

```shell
sudo apt-get update
sudo apt-get upgrade
```

## 安装 [git](https://github.com/git/git)

```shell
sudo apt install git -y
```

## nano

它啊，就是一个很好用的文本编辑器罢了。

```shell
sudo apt install nano -y 
```

## 安装可爱的 [fish](https://github.com/fish-shell/fish-shell)

1. 安装命令

```shell
sudo apt install fish -y
```

2. 设置 fish 为默认终端

```shell
chsh -s /usr/bin/fish
```

如果说要配置环境变量，就不能像 bash 那样。fish 有自己的配置文件。

在终端中输入下列语句，使用 nano 打开 fish 的配置文件。

```shell
nano ~/.config/fish/config.fish
```

如果这个配置文件不存在也没关系，nano 会自己创建一个新的。

配置一个环境变量的具体语法就是像下面这样，在该配置文件的末尾追加。[ ] 内的内容可以替换成别的软件

```shell
set PATH [~/miniconda3/bin] $PATH
```

3. 附加的主题包 [oh-my-fish](https://github.com/oh-my-fish/oh-my-fish)

在终端输入这些，就会自动下载并安装了。

```shell
curl -L https://get.oh-my.fish > install
fish install --path=~/.local/share/omf --config=~/.config/omf
```

在[这里](https://github.com/oh-my-fish/oh-my-fish/blob/master/docs/Themes.md)可以预览它的所有主题包，我一般是安装 agnoster。

```shell
omf install agnoster
```

## 前端开发环境——[nvm](https://github.com/creationix/nvm) 与 [node](https://github.com/nodejs/node)

nvm 是一个 node 版本管理器。

1. 在终端执行以下命令，将自动进行 nvm 的安装：

nvm将被安装到 $HOME/.nvm 目录中

```shell
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
```

2. 让 fish 终端也能用上 nvm

[fish-nvm](https://github.com/FabioAntunes/fish-nvm) 帮助残障人士使用上 nvm，下面的命令是 omf 配置 nvm 的命令。

```shell
omf install https://github.com/fabioantunes/fish-nvm
omf install https://github.com/edc/bass
```

这时候在 fish 终端里 `nvm --version` 应该没问题了。

3. 安装 nodejs 12.18.3 （LTS）

虽然现在最新的 LTS 版本是 14.17.3，但是管它呢。

```shell
nvm install 12.18.3
```

## Install Go

进入官方下载页面查看可下载的版本号 [下载页面](https://go.dev/dl)

```shell
sudo sh -c "wget -c https://dl.google.com/go/go1.14.2.linux-amd64.tar.gz -O - | tar -xz -
C /usr/local"
```

通过添加下面的行 `/etc/profile` 文件（系统范围内安装）

```shell
export PATH=$PATH:/usr/local/go/bin
```

保存文件，重新加载 PATH 环境变量

```shell
source /etc/profile
```
