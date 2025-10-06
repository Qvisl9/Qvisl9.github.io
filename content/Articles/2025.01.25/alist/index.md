---
title: "Alist简单搭建教程"
date: 2025-01-25T16:02:29+08:00
author: "Leeroy Guff"
showSummary: true
summary: ""
tags:
  - alist
---

{{< lead >}}

我对于观影现在是没有什么需求，所以各大网盘我几乎是处于不了解的情况。至于为什么要搭建alist，主要是vps也有一些空间，也方面来存储些东西。

{{< /lead >}}

## 部署及优化

### 一键安装脚本

```
安装
curl -fsSL "https://alist.nn.ci/v3.sh" | bash -s install
 
更新
curl -fsSL "https://alist.nn.ci/v3.sh" | bash -s update
 
卸载
curl -fsSL "https://alist.nn.ci/v3.sh" | bash -s uninstall
```

{{< lead >}}

最新版好像要直接给你生成随机密码，可以登录alist再后台修改用户名及密码。如果不行，可以用以下方法生成密码。

{{< /lead >}}

安装之后需要关注内容

```
访问地址：http://YOUR_IP:5244/
 
配置文件路径：/opt/alist/data/config.json
---------如何获取密码？--------
先cd到alist所在目录:
cd /opt/alist
随机设置新密码:
./alist admin random
或者手动设置新密码:
./alist admin set NEW_PASSWORD
----------------------------
启动服务中
 
查看状态：systemctl status alist
启动服务：systemctl start alist
重启服务：systemctl restart alist
停止服务：systemctl stop alist
 
温馨提示：如果端口无法正常访问，请检查 服务器安全组、本机防火墙、Alist状态
```

### 设置密码

```
---------如何获取密码？--------
先cd到alist所在目录:
cd /opt/alist
 
或者手动设置新密码:
./alist admin set 你的密码
 
默认用户名：admin 
密码：你的密码
```

### 修改默认访问端口-可选

建议修改默认的端口为其他端口，一定程度上提升安全性，同时方便自己的管理。

```
vi /opt/alist/data/config.json
修改"http_port": 为需要的端口，博主改的是522
systemctl restart alist #修改之后重启服务
```

![1](https://ab712dd.webp.li/Snipaste_2024-03-08_09-34-07.png)

至此就可以用`IP+端口`访问

## 挂载本机存储

```
#在服务器创建需要挂载的目录，不会自定义创建的话，就按照我这个命令，避免后续出错
mkdir -p /ibeg/ibeg_alist/ibegdata
```

![2](https://ab712dd.webp.li/2.png)

至此简单的搭建alist和挂载本机存储就完成了，至于挂载各类网盘可以Google或者Youtube下，目前作者没这个需求，也就没去折腾了。