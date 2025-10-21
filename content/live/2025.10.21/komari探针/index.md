---
title: "Komari探针-哪吒平替的选择"
date: 2025-10-21T18:51:41+08:00
author: "九年"
showSummary: true
summary: ""
tags:
  - komari
  - 探针
lastmod: ""
---

{{< lead >}}
简单易懂永远是最多人的选择！
{{< /lead >}}

[Komari项目地址](https://github.com/komari-monitor/komari)
## 安装主控
```
curl -fsSL https://raw.githubusercontent.com/komari-monitor/komari/main/install-komari.sh -o install-komari.sh
chmod +x install-komari.sh
sudo ./install-komari.sh
```
## acme证书与ngnix配置
安装acme
```
curl https://get.acme.sh | sh
```
添加软链接
```
ln -s /root/.acme.sh/acme.sh /usr/local/bin/acme.sh
```
切换CA机构
```
acme.sh --set-default-ca --server letsencrypt
```
ngnix配置
安装ngnix
```
apt install -y nginx
```
申请证书
```
acme.sh --issue -d 域名 -k ec-256 --webroot /var/www/html
```
安装证书
```
acme.sh --install-cert -d 域名 --ecc \
--key-file /etc/ssl/private/private.key \
--fullchain-file /etc/ssl/private/fullchain.cer
```
打开ngnix配置文件
```
nano /etc/nginx/nginx.conf
```
配置ngnix
```
#user  nobody;
worker_processes  1;

#error_log  logs/error.log;
#error_log  logs/error.log  notice;
#error_log  logs/error.log  info;

#pid        logs/nginx.pid;


events {
    worker_connections  1024;
}


http {
    include       mime.types;
    default_type  application/octet-stream;

    #log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
    #                  '$status $body_bytes_sent "$http_referer" '
    #                  '"$http_user_agent" "$http_x_forwarded_for"';

    #access_log  logs/access.log  main;

    sendfile        on;
    #tcp_nopush     on;

    #keepalive_timeout  0;
    keepalive_timeout  65;

    #gzip  on;

    server
{
    #listen [::]:80;   #监听端口 IPv6
    #listen [::]:443 ssl;    #监听端口 带SSL iPv6
    listen 80; #ipv4
    listen 443 ssl;  #ipv4
    server_name yourdomain.com; #填写监控网站域名
    index index.php index.html index.htm default.php default.htm default.html;
    root /home/web/nezha;
    #index root部分随便写 没用的
    
    #SSL-START SSL相关配置，请勿删除或修改下一行带注释的404规则
    #error_page 404/404.html;
    ssl_certificate    /etc/ssl/private/fullchain.cer;   #SSL证书文件
    ssl_certificate_key    /etc/ssl/private/private.key;  #SSL密钥文件
    ssl_protocols TLSv1.1 TLSv1.2 TLSv1.3;
    ssl_ciphers EECDH+CHACHA20:EECDH+CHACHA20-draft:EECDH+AES128:RSA+AES128:EECDH+AES256:RSA+AES256:EECDH+3DES:RSA+3DES:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    add_header Strict-Transport-Security "max-age=31536000";
    error_page 497  https://$host$request_uri;
 
#以下是反代内容 如果有特别设置端口记得修改 
  location ^~ / {
    proxy_pass http://127.0.0.1:25774;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header REMOTE-HOST $remote_addr;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $http_connection;
    proxy_http_version 1.1;
    proxy_ssl_server_name off;
    proxy_ssl_name $proxy_host;
    # 50M文件上传
    client_max_body_size 50M;
}
}
}
```
检查nginx配置文件
```
nginx -t
```
重启并查看nginx状态
```
systemctl restart nginx && systemctl status nginx
```
这样就可以用域名访问探针了！
