---
title: "Uptime Kuma: 一个漂亮又实用的专属网站监控"
date: 2024-12-17T19:31:26+08:00
author: "Yann Howard"
description: ""
tags:
  - Uptime Kuma
lastmod: ""
---

{{< lead >}}

很多小伙伴拥有了一个自己的博客，但是又不能时时刻刻自己监控博客的运行状态，一个在线监控工具就必不可少。

Uptime-Kuma是一款开源监控工具，界面非常简洁美观，支持 TCP / PING / HTTP 监控等，还支持多语言其中包括中文。

项目地址：[https://github.com/louislam/uptime-kuma](https://github.com/louislam/uptime-kuma)

演示地址：[https://uptime.geektech.top/](https://uptime.geektech.top/)

{{< /lead >}}

## 环境准备

- VPS一台

- 域名一个，并做好解析，解析 IP 地址为 VPS 的 IP地址

## 搭建步骤

### 安装 Docker 及 Docker-compose

```
bash <(curl -L https://get.docker.com/)
sudo curl -L "https://github.com/docker/compose/releases/download/1.27.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 安装 Uptime-Kuma

- 创建目录

```bash
mkdir -p data/docker_data/uptime
cd data/docker_data/uptime
```

- 创建 docker-compose.yml 文件

```bash
nano docker-compose.yml
```

- 在文件中填入以下内容，然后 Ctrl+O 回车保存，按 Ctrl+X 退出

```bash
version: '3.3'

services:
  uptime-kuma:
    image: louislam/uptime-kuma
    container_name: uptime-kuma
    volumes:
      - ./uptime-kuma:/app/data
    ports:
      - 3001:3001
```

创建完成后，运行

```bash
docker-compose up -d
```

然后就可以通过 IP:3001 来访问 Uptime-Kuma

## 用caddy反代

- **安装caddy**

```
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo tee /etc/apt/trusted.gpg.d/caddy.asc
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

验证安装

```
caddy version
```

- **配置反向代理**

创建配置文件

Caddy 的默认配置文件路径为 `/etc/caddy/Caddyfile`（Linux）或 `Caddyfile`（当前目录）。创建或编辑该文件，例如：

```
example.com {
    reverse_proxy 127.0.0.1:3001
}
```

**`example.com`**：你的域名。

**`127.0.0.1:8080`**：反向代理的目标地址。

- **多站点支持**

Caddy 支持多个站点，可以同时配置多个域名：

```
example.com {
    reverse_proxy 127.0.0.1:8080
}

another-example.com {
    reverse_proxy 192.168.1.100:9000
}
```

- **启用配置**

**测试配置**

运行以下命令检查配置是否正确：

```
caddy validate --config /etc/caddy/Caddyfile
```

**启动 Caddy**

启用或重启 Caddy 服务：

```
sudo systemctl restart caddy
```

