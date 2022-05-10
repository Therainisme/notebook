---
title: 解决 WSL2 每次启动 IP 地址都会变的蛋疼问题
authors: [Therainisme]
tags: [WSL]
date: 2022-5-10
---

WSL2 好是好啊，跑在 Hyper-V 的大病就是 IP 一直变一直变。

<!--truncate-->

其中一种思路：WSL 启动后更新 Windows 系统中的 hosts 文件。[解决 Win10 WSL2 IP 变化问题](https://blog.csdn.net/qq_44797987/article/details/113781646?msclkid=6c29c5f6d02d11ecb0e26fc089ad188c)


稍微看了一下，配置太繁琐，侵入 Windows 太严重。~~（其实就是太多乱七八糟的操作不想干）~~

今天早上拍了拍自己的脑袋，既然想要一个固定的内网 IP，zerotier 内网穿透不是更好？

我迅速打开 zerotier 官网，点击 download 跳到 linux。CV 安装！

```shell
curl -s https://install.zerotier.com | sudo bash
```

启动服务

```shell
sudo zerotier-one -d
```

加入与 Windows 主机相同的一个网络

```
sudo zerotier-cli join <network id>
```

最后在 zerotier 里授权一下这台设备，结束了。