---
title: "一些常用命令收集"
date: 2024-06-28T21:42:57+08:00
author: "Yann Howard"
showSummary: true
summary: ""
tags:
  - 命令
weight: 1
lastmod: "2025-02-06"
---

{{< lead >}}

置顶这篇博文，是为了收集一些常用命令，文便自己拿用，这样也不用耗费时间去冲浪找。

{{< /lead >}}

## 安装docker和docker-compose

```
bash <(curl -L https://get.docker.com/)
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

- 启动

```
docker-compose down
docker-compose up -d
```

## **安装caddy**

```
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo tee /etc/apt/trusted.gpg.d/caddy.asc
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

- 验证安装

```
caddy version
```

- Caddy 的默认配置文件路径为 `/etc/caddy/Caddyfile`（Linux）或 `Caddyfile`（当前目录）。创建或编辑该文件，例如：

```
example.com {
    reverse_proxy 127.0.0.1:8080
}

another-example.com {
    reverse_proxy 192.168.1.100:9000
}

```

**`example.com`**：你的域名。

**`127.0.0.1:8080`**：反向代理的目标地址。

- 运行以下命令检查配置是否正确：

```
caddy validate --config /etc/caddy/Caddyfile
```

- 启动或重启 Caddy

```
sudo systemctl restart caddy
```

## DD脚本

- 史上最强dd脚本，自带识别ipv6

```
wget --no-check-certificate -qO InstallNET.sh 'https://raw.githubusercontent.com/leitbogioro/Tools/master/Linux_reinstall/InstallNET.sh' && chmod a+x InstallNET.sh && bash InstallNET.sh -debian 12 -port '端口' -pwd '密码'
```

```
curl -O https://raw.githubusercontent.com/bin456789/reinstall/main/reinstall.sh || wget -O reinstall.sh $_ && chmod +x ./reinstall.sh && ./reinstall.sh debian 12 --password '密码' --ssh-port '端口'
```

## 更新系统&软件源

```
apt update && apt install wget git curl sudo -y
```

## 流媒体检测

```
bash <(curl -L -s https://raw.githubusercontent.com/lmc999/RegionRestrictionCheck/main/check.sh)
```

```
curl -L https://gitlab.com/spiritysdx/za/-/raw/main/ecs.sh -o ecs.sh && chmod +x ecs.sh && bash ecs.sh
```

## 回程检测

```
bash <(curl -Ls https://raw.githubusercontent.com/sjlleo/nexttrace/main/nt_install.sh)
```

```
nexttrace 本地IP
```

## mack-a脚本

```
wget -P /root -N --no-check-certificate "https://raw.githubusercontent.com/mack-a/v2ray-agent/master/install.sh" && chmod 700 /root/install.sh && /root/install.sh
```

## bbr开启

```
echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf
echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf
sysctl -p
```

## ipv6优先

```
bash <(curl -Lso- https://sh.vps.dance/ip46.sh)
```

## 安装rsync

```
sudo apt install rsync
```

## 要改变一切
```
是的，一切都不要着急
```