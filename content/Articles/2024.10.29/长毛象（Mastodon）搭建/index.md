---
title: "长毛象（Mastodon）搭建"
date: 2024-10-29T14:15:28+08:00
author: "Wission"
description: ""
tags:
  - Mastodon
series: ["Mastodon"]
series_order: 1
lastmod: ""
---

{{< lead >}}

长毛象（Mastodon）是一个去中心化的微博客平台，所以大致使用方式，类似微博或者twitter。区别是，它并不是一个网站，而是成百上千的小站点聚合而成，俗称“联邦宇宙”。这些网站都遵循同一个协议，使用Mastodon系统，每一个网站都叫做一个实例。

本篇文章将介绍如何搭建属于自己的Mastodon实例，在此之前，你需要

- 国外服务器
- 邮箱并且支持SMTP
- 已解析的域名

{{< /lead >}}

## 安装常用命令

```
apt update && apt install wget rsync python git curl vim git ufw sudo -y
```

## 创建 SWAP 分区

{{< lead >}}
如果内存过小，会导致没有样式的问题，我的服务器是2G，需要分配个2G的空间

{{< /lead >}}

#### 检查是否已启用SWAP空间

```ruby
sudo swapon --show   #未启用SWAP分区的话，执行此命令将不会有任何输出
```

#### 创建SWAP文件

```shell
sudo fallocate -l 2G /swapfile      #创建大小依据实际物理内存大小自行调整
#或使用dd命令创建
sudo dd if=/dev/zero of=/swapfile bs=512M count=4
```

创建完成后，给与 SWAP 文件 600 权限

```shell
sudo chmod 600 /swapfile
```

标注 SWAP 区域

```shell
sudo mkswap /swapfile
```

激活 SWAP 分区

```shell
sudo swapon /swapfile
```

查看 SWAP 分区是否工作

```ruby
sudo swapon --show
sudo free -h
```

将创建的 SWAP 分区设置为永久分区,将 SWAP 路径写入到`/etc/fstab`文件中

```bash
/swapfile swap swap defaults 0 0
```



## 配置防火墙

```
sudo ufw allow OpenSSH
sudo ufw enable
```

打开防火墙，随后打开80和443端口：

```
sudo ufw allow http    #sudo ufw allow 端口
sudo ufw allow https
```

然后可以通过`sudo ufw status`检查防火墙状态，你应该会看到80和443端口的显示。

## 安装docker和docker-compose

```
bash <(curl -L https://get.docker.com/)
sudo curl -L "https://github.com/docker/compose/releases/download/1.27.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## 拉取Mastodon镜像

```
mkdir -p /home/mastodon/mastodon
cd /home/mastodon/mastodon
docker pull ghcr.io/mastodon/mastodon:latest     #如果需要升级到某稳定版本，请将latest改成v4.1.4等版本号。
wget https://raw.githubusercontent.com/mastodon/mastodon/main/docker-compose.yml
```

修改`docker-compose.yml`配置文件

```
nano docker-compose.yml
```

依次找到`web`、`streaming`、`sidekiq`分类，在每一类的`image: ghcr.io/mastodon/mastodon`后添加`:latest`或者你刚才拉取的版本号，变成`image: ghcr.io/mastodon/mastodon:latest`或`image: ghcr.io/mastodon/mastodon:v4.1.4`等等。

`ctrl+X`退出保存。

## 初始化PostgreSQL

**（在v3.5.0以后，请注意Postgres文件夹所在位置有所修改，从原本的postgres改为了postgres14。本教程已更新。）**

刚才`docker-compose.yml`文件中，数据库（db）部分的地为`./postgres14:/var/lib/postgresql/data`，因此你的数据库绝对地址为`/home/mastodon/mastodon/postgres14`。
运行：

```
docker run --name postgres14 -v /home/mastodon/mastodon/postgres14:/var/lib/postgresql/data -e   POSTGRES_PASSWORD=设置数据库管理员密码 --rm -d postgres:14-alpine
```

执行完后，检查/home/mastodon/mastodon/postgres14，应该出现postgres相关的多个文件，不是空文件夹。
然后执行：

```
docker exec -it postgres14 psql -U postgres
```

输入：

```
CREATE USER mastodon WITH PASSWORD '数据库密码（最好和数据库管理员密码不一样）' CREATEDB;
```

创建mastodon用户：

```
\q
```

退出数据库。

最后停止docker：

```
docker stop postgres14
```

## 配置Mastodon

配置文件

在`/home/mastodon/mastodon`文件夹中创建空白`.env.production`文件：

```
touch .env.production # 创建.env.production文件
docker-compose run --rm web bundle exec rake mastodon:setup
```

```
Domain name: 域名

Single user mode disables registrations and redirects the landing page to your public profile.
Do you want to enable single user mode? No

Are you using Docker to run Mastodon? Yes

PostgreSQL host: mastodon_db_1
PostgreSQL port: 5432
Name of PostgreSQL database: mastodon
Name of PostgreSQL user: mastodon
Password of PostgreSQL user:（这里写上面你给mastodon设置的数据库密码） 
Database configuration works! 🎆

Redis host: mastodon_redis_1
Redis port: 6379
Redis password: （这里是直接回车，没有密码）
Redis configuration works! 🎆

Do you want to store uploaded files on the cloud? No

Do you want to send e-mails from localhost? No
SMTP server: smtp.gmail.com
SMTP port: 587
SMTP username: 你的谷歌邮箱地址
SMTP password: 谷歌邮箱密码
SMTP authentication: plain
SMTP OpenSSL verify mode: none
Enable STARTTLS: always
E-mail address to send e-mails "from": 你的谷歌邮箱地址
Send a test e-mail with this configuration right now? no

Do you want Mastodon to periodically check for important updates and notify you? (Recommended) Yes

This configuration will be written to .env.production
Save configuration? Yes
```

然后会出现.env.production配置，**请务必复制下来，先存到电脑里，等会儿要用。**

之后会要你建立数据库和编译，都选是。

一切成功之后，记得**立刻马上**：

```
nano .env.production
```

把你刚才复制下来的配置保存进去。

#### 启动Mastodon

```
docker-compose down
docker-compose up -d
```

为相应文件夹赋权

```
chown 991:991 -R ./public
chown -R 70:70 ./postgres14
docker-compose down
docker-compose up -d
```

## 安装并配置nginx

在这一步之前，请记得到您购买域名的网站（如NameCheap），在DNS设置中添加一个**A Record**，Host填写@（如果没有子域名需求），Value填写你服务器的IP地址，将你设定的域名指向你的服务器。

**请注意：此时你的DNS Setting里除了你刚才在邮箱配置和本步骤中亲自设置的内容之外，别的任何由域名商自动生成的内容请都删光。**

#### 安装nginx

```
sudo apt install nginx -y
```

#### 配置nginx

```
nano /etc/nginx/sites-available/你的域名
```

网页打开[nginx模板](https://raw.githubusercontent.com/mastodon/mastodon/main/dist/nginx.conf)，将其中的example.com替换成自己域名，将28和56行的`/home/mastodon/live/public`改成`/home/mastodon/mastodon/public`，**更新：**并将`try_files $uri =404;`修改为`try_files $uri @proxy;`，复制到服务器中保存。

随后配置镜像文件

```
ln -s /etc/nginx/sites-available/你的域名 /etc/nginx/sites-enabled/
```

`nginx -t`检查，无误后重启（如果提示ssl证书问题，请在`listen 443 ssl http2;`、`listen [::]:443 ssl http2;`等包含ssl的行前加#号先行注释掉，配置完ssl证书后再改回来）：

```
systemctl reload nginx
```

#### 配置SSL证书

```
apt install snapd
sudo snap install core; sudo snap refresh core
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
sudo certbot certonly --nginx -d 你的域名
```

在这期间要**输入邮箱**，连续两次选择“**是**”

重启nginx

重新打开nginx配置文件，将`ssl_certificate`和`ssl_certificate_key`两行前的#号（以及你刚才添加的#号）删除。

`nginx -t`检查是否有错误。

如果没有错误，则可重启nginx：

```
systemctl reload nginx
```

检查证书更新

最后，可通过

```
certbot renew --dry-run
```

检查证书是否能自动更新。

如果不放心，可以再至`/home/mastodon/mastodon`文件夹，运行`docker-compose up -d`重启mastodon。静静等待几分钟后，点开你的域名，你的站点就上线啦

## 站点上线之后

在站点上线之后，你可以：

#### 开启全文搜索

Docker的全文搜索开启十分方便，只需要：

```
cd /home/mastodon/mastodon
nano docker-compose.yml
```

编辑`docker-compose.yml`，去掉`es`部分前所有的#号，并且去掉`web`部分中`es`前面的#号。

`nano .env.production`编辑`.env.production`文件，加上

```
ES_ENABLED=true
ES_HOST=es
ES_PORT=9200
```

三行，重启：

```
docker-compose down
docker-compose up -d
```

待文件夹中出现elasticsearch文件夹后，赋权：

```
chown 1000:1000 -R elasticsearch
```

再次重启：

```
docker-compose down
docker-compose up -d
```

全文搜索即搭建完成。

然后

```
docker-compose run --rm web bin/tootctl search deploy
```

建立之前嘟文的搜索索引即可。

## Docker不掉线更新

如：Mastodon 的 Prod 环境的例常升级

- 修改 compose.yml 文件中的镜像标签为最新的，如果是默认的 latest 标签则不用管；

- docker compose pull 拉取新镜像；

- docker compose up -d --force-recreate ，用 forece recreate 则不需要 down 直接重新创建新镜像的容器了。

## 相关命令

查询账户

```
docker exec mastodon_web_1 tootctl accounts
```

查询用户ID

```
docker exec -it mastodon_db_1 psql -U mastodon -d mastodon
SELECT id, username FROM accounts WHERE username = '用户名';
```

强制刷新

```
docker-compose run --rm web tootctl accounts refresh --all --verbose
```

