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
      - SIGNUPS_ALLOWED=false  # 关闭注册功能
      - DOMAIN=https://yourdomain.com  # 替换为你的域名
    volumes:
      - ./data:/data
    ports:
      - "127.0.0.1:8000:80"  # 仅本地访问

  caddy:
    image: caddy:latest
    container_name: caddy
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - ./caddy_data:/data
      - ./caddy_config:/config
    depends_on:
      - vaultwarden
```

`SIGNUPS_ALLOWED=false`先开启即`true`，注册好账号后再false

## 配置Caddyfile

# 创建Caddyfile
```
# 创建Caddyfile
nano Caddyfile
```

在`Caddyfile`中添加以下内容：

```
yourdomain.com {
    reverse_proxy vaultwarden:80
}
```

##  启动服务

```
# 启动Docker Compose
sudo docker-compose up -d
```