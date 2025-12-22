+++
title = 'Hysteria2官方脚本手动搭建+端口跳跃'
date = 2024-08-31T14:30:32+08:00
tags = ["Hysteria2"]
showSummary = true
summary = "手搓Hysteria2+端口跳跃"
featured_image = "/images/hysteria2.jpg"

+++
{{< lead >}}
本文采用的cloudflare dns api进行域名证书申请。
{{< /lead >}}
## 获取 Cloudflare API Token
打开此[链接](https://dash.cloudflare.com/profile/api-tokens)，Create Token ->Edit zone DNS->Use template

`创建令牌`
![cf-1](https://images.ninenian.com/%E6%88%AA%E5%B1%8F2025-12-23%2004.01.02.png)

`编缉区域DNS`
![cf-2](https://images.ninenian.com/%E6%88%AA%E5%B1%8F2025-12-23%2004.01.50.png)

选择域名
![cf-3](https://images.ninenian.com/Snipaste_2025-12-23_04-07-22.png)
配置完成后，选择`继续`，到这里API Token就生成完毕。

## 安装 acme.sh 并申请证书
### 安装 acme.sh
```
curl https://get.acme.sh | sh -s email=my@example.com
```
(请将 my@example.com 替换为你的真实邮箱，用于接收证书过期提醒)
### 加载环境变量
```
source ~/.bashrc
```
### 导入 Cloudflare API Token
将刚才获取的 Token 填入下方命令并执行：
```
export CF_Token="你的Cloudflare_API_Token"
export CF_Account_ID="你的Cloudflare_Account_ID"
```
注意：新版 acme.sh 推荐使用 CF_Token。如果你只有 Global API Key，则使用 CF_Key 和 CF_Email。CF_Account_ID 可以在 Cloudflare 域名概览页面的右下角找到（Account ID），虽然不是必须的，但建议加上。
### 申请证书 (ECC 证书)
假设你的域名是 hysteria.yourdomain.com (请替换为你实际解析的二级域名)：
```
~/.acme.sh/acme.sh --issue --dns dns_cf -d hysteria.yourdomain.com --keylength ec-256
```
如果成功，你会看到绿色的 Success 信息，证书文件会保存在 ~/.acme.sh/hysteria.yourdomain.com_ecc/ 目录下。
### 安装证书到指定目录
```
# 1. 确保目录存在 (Hysteria 安装后通常已存在，但为了保险起见)
mkdir -p /etc/hysteria

# 2. 重新执行安装证书命令，将路径指向 /etc/hysteria
~/.acme.sh/acme.sh --install-cert -d hysteria.yourdomain.com --ecc \
--key-file       /etc/hysteria/private.key  \
--fullchain-file /etc/hysteria/cert.crt \
--reloadcmd     "chown root:root /etc/hysteria/private.key /etc/hysteria/cert.crt && chmod 644 /etc/hysteria/private.key /etc/hysteria/cert.crt && systemctl restart hysteria-server.service"
```

## 安装hysteria

```
bash <(curl -fsSL https://get.hy2.sh/)
```

## 设置hysteria2开机自启

```
systemctl enable hysteria-server.service
```

## 修改/etc/hysteria/config.yaml配置文件

```
nano /etc/hysteria/config.yaml
```

清空文件内容，将下列命令粘贴进去保存

```yaml
listen: :端口

tls:
  cert: /etc/hysteria/cert.crt
  key: /etc/hysteria/private.key

auth:
  type: password
  password: "密码"

masquerade:
  type: proxy
  proxy:
    url: https://www.bing.com/
    rewriteHost: true

ignoreClientBandwidth: false

quic:
  initStreamReceiveWindow: 8388608
  maxStreamReceiveWindow: 8388608
  initConnReceiveWindow: 20971520
  maxConnReceiveWindow: 20971520
  maxIdleTimeout: 30s
  maxIncomingStreams: 1024
  disablePathMTUDiscovery: false

bandwidth:
  up: 1 gbps
  down: 1 gbps

outbounds:
  - name: direct
    type: direct
    direct:
      mode: 46

```

## 设置端口跳跃

注意：网卡名称eth0要根据vps具体情况更改，可用命令`ip a`查看网卡名称！

```
apt install iptables-persistent
iptables -t nat -A PREROUTING -i eth0 -p udp --dport 20000:40000 -j DNAT --to-destination :监听端口
ip6tables -t nat -A PREROUTING -i eth0 -p udp --dport 20000:40000 -j DNAT --to-destination :监听端口
netfilter-persistent save
```

## 启动Hysteria2

```
systemctl start hysteria-server.service
```

重启Hysteria2

```bash
systemctl restart hysteria-server.service
```

查看Hysteria2状态

```bash
systemctl status hysteria-server.service
```

## iptables开机自启

```
sudo nano /etc/rc.local
```

清除内容，将下列命令粘贴进去保存

```bash
#!/bin/sh -e
#rc.local
sudo netfilter-persistent reload
echo "开机启动iptables" >> /usr/local/rc.log
exit 0
```