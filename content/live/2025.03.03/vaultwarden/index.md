---
title: "搭建Vaultwarden个人密码管理器"
date: 2025-03-03T22:57:52+08:00
author: "九年"
showSummary: true
summary: ""
tags:
  - Vaultwarden
lastmod: ""

---

{{< lead >}}

用过各种密码管理器，但想来还是用回vaultwarden，哪个吃灰小鸡也好！

{{< /lead >}}

## 准备工作

- 一台VPS（假设使用Ubuntu 20.04/22.04）
- 域名并解析到VPS的IP
- 安装Docker和Docker Compose

## 安装Docker和Docker Compose

```
bash <(curl -L https://get.docker.com/)
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

启动Docker并设置开机自启

```
sudo systemctl start docker
sudo systemctl enable docker
```

## 创建Vaultwarden的Docker Compose文件

```
# 创建项目目录

mkdir /vaultwarden
cd /vaultwarden

# 创建docker-compose.yml文件

nano docker-compose.yml
```

在`docker-compose.yml`文件中添加以下内容：

```
version: '3'

services:
  vaultwarden:
    image: vaultwarden/server:latest
    container_name: vaultwarden
    restart: always
    environment:
      - SIGNUPS_ALLOWED=false   #关闭注册
      - DOMAIN=自定义域名
      - WEB_VAULT_ENABLED=false   #关闭WEB服务
    volumes:
      - ./data:/data
    ports:
      - "127.0.0.1:8000:80"

  watchtower:
    container_name: watchtower
    image: containrrr/watchtower
    restart: always
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    command: --cleanup --interval 86400
```

`SIGNUPS_ALLOWED=false`先开启即`true`，注册好账号后再false

## caddy反代

#### 安装caddy
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
#### 编缉caddyfile

Caddy 的默认配置文件路径为 /etc/caddy/Caddyfile（Linux）或 Caddyfile（当前目录）
```
nano /etc/caddy/Caddyfile
```
创建或编辑该文件，例如：
```
example.com {
    reverse_proxy 127.0.0.1:8080
}

another-example.com {
    reverse_proxy 192.168.1.100:9000
}

```
运行以下命令检查配置是否正确:
```
caddy validate --config /etc/caddy/Caddyfile
```

启动或重启 Caddy
```
sudo systemctl restart caddy
```

## 启动Docker Compose

```
sudo docker-compose up -d
```