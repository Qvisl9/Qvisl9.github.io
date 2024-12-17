---
title: "Mastodon搬家迁移教程"
date: 2024-12-17T16:07:22+08:00
author: "Wission"
description: ""
tags:
  - mastodon
series: ["mastodon"]
lastmod: "2024-12-17 16:52:53"
---

{{< lead >}}

本篇就mastodon迁移做个详细的教程，哪怕服务器炸了，再也不怕mastodon数据丢失。

{{< /lead >}}

用的是cloudflare R2作为存储，如果有这个需求，可以参考这个教程：

[**CloudFlare R2图床搭建教程，可能是目前最完美的解决方案！**](https://blog.jeoqm-77.top/articles/2024.9.13/cloudflare-r2%E5%9B%BE%E5%BA%8A%E6%90%AD%E5%BB%BA%E6%95%99%E7%A8%8B%E5%8F%AF%E8%83%BD%E6%98%AF%E7%9B%AE%E5%89%8D%E6%9C%80%E5%AE%8C%E7%BE%8E%E7%9A%84%E8%A7%A3%E5%86%B3%E6%96%B9%E6%A1%88/)

## 压缩目录

在原服务器上压缩目录(以`/home/mastodon/mastodon`)

`cd /home/`

`tar -czvf /home/mastodon.tar.gz -C /home mastodon`

## 安装rsync

用rsync传输文件会快很多，可以节省很多时间。

新服务器上安装rsync（以`Debian/Ubuntu` 为例）

`sudo apt update`

`sudo apt install rsync`

## 传输文件

登录旧服务器，传输之前已经打包好的文件。

`rsync -avz --progress -e "ssh -p 端口" /home/mastodon.tar.gz root@IP:/home/`

如果之前有用过rsync传输，但新服务器重装过系统，那么需要先删除删除旧的 SSH 主机密钥

`ssh-keygen -f "/root/.ssh/known_hosts" -R "[ip]:端口"`

然后再传输

## 解压文件

登录新服务器，进行解压文件操作

`cd /home/`

`sudo tar -xzvf /home/mastodon.tar.gz`

这样就可以看到在home目录下有Mastodon文件

## 清除压缩文件(可选)

`sudo rm /home/mastodon.tar.gz`

这样就已经成功把mastodon迁移到新的服务器上，只需要再安装SWAP、docker和docker-compose以及ngnix就可以正常运行了。

## 创建 SWAP 分区

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

## 安装docker和docker-compose

```
bash <(curl -L https://get.docker.com/)
sudo curl -L "https://github.com/docker/compose/releases/download/1.27.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## 安装并配置nginx

在这一步之前，请记得到您购买域名的网站（如NameCheap），在DNS设置中添加一个**A Record**，Host填写@（如果没有子域名需求），Value填写你服务器的IP地址，将你设定的域名指向你的服务器。

**请注意：此时你的DNS Setting里除了你刚才在邮箱配置和本步骤中亲自设置的内容之外，别的任何由域名商自动生成的内容请都删光。**

#### 安装nginx            

```fallback
sudo apt install nginx -y
```

#### 配置nginx       

```fallback
nano /etc/nginx/sites-available/你的域名
```

网页打开[nginx模板](https://raw.githubusercontent.com/mastodon/mastodon/main/dist/nginx.conf)，将其中的example.com替换成自己域名，将28和56行的`/home/mastodon/live/public`改成`/home/mastodon/mastodon/public`，**更新：**并将`try_files $uri =404;`修改为`try_files $uri @proxy;`，复制到服务器中保存。

随后配置镜像文件

```fallback
ln -s /etc/nginx/sites-available/你的域名 /etc/nginx/sites-enabled/
```

`nginx -t`检查，无误后重启（如果提示ssl证书问题，请在`listen 443 ssl http2;`、`listen [::]:443 ssl http2;`等包含ssl的行前加#号先行注释掉，配置完ssl证书后再改回来）：

```gdscript3
systemctl reload nginx
```

#### 配置SSL证书      

```fallback
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

```gdscript3
systemctl reload nginx
```

检查证书更新

最后，可通过

```fallback
certbot renew --dry-run
```

检查证书是否能自动更新。

## 启动Mastodon

cd `/home/mastodon/mastodon`文件夹，运行

```
docker-compose down
docker-compose up -d
```

重启mastodon。静静等待几分钟后，点开你的域名，你的站点就上线啦