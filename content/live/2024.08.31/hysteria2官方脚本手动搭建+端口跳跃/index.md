+++
title = 'Hysteria2官方脚本手动搭建+端口跳跃'
date = 2024-08-31T14:30:32+08:00
tags = ["Hysteria2"]
showSummary = true
summary = "手搓Hysteria2+端口跳跃"
featured_image = "/images/hysteria2.jpg"

+++

## 1、安装hysteria

```
bash <(curl -fsSL https://get.hy2.sh/)
```

## 2、设置hysteria2开机自启

```
systemctl enable hysteria-server.service
```

## 3、修改/etc/hysteria/config.yaml配置文件

```
nano /etc/hysteria/config.yaml
```

清空文件内容，将下列命令粘贴进去保存

```yaml
listen: :端口

acme:
  domains:
    - your.domain.com     # ← 换成你的真实解析域名
  email: you@example.com   # ← 换成你的邮箱

auth:
  type: password
  password: "你的密码"       # ← 自己设置

masquerade:
  type: proxy
  proxy:
    url: https://www.apple.com/   # ← 超稳定，不会触发验证
    rewriteHost: false           # ← 强烈建议 false，避免 CF bot 检测

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
      mode: 46    # auto，46-IPV4，64——IPV6

```

## 4、设置端口跳跃

注意：网卡名称eth0要根据vps具体情况更改，可用命令`ip a`查看网卡名称！

```
apt install iptables-persistent
iptables -t nat -A PREROUTING -i eth0 -p udp --dport 20000:40000 -j DNAT --to-destination :监听端口
ip6tables -t nat -A PREROUTING -i eth0 -p udp --dport 20000:40000 -j DNAT --to-destination :监听端口
netfilter-persistent save
```

## 5、启动Hysteria2

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

## 6、iptables开机自启

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