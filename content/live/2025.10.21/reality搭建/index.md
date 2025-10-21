---
title: "Reality手动搭建"
date: 2025-10-21T15:59:52+08:00
author: "九年"
showSummary: true
summary: ""
tags:
  - Reality
lastmod: ""
---

{{< lead >}}
之前一直都是用脚本，现在想着能手搓就手搓，也让自己多懂点！
{{< /lead >}}

## 更新系统和软件源
```
apt update && apt install wget git curl sudo -y
```
## 安装Xray
```
bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ install
```
装完更新下geoip
```
bash -c "$(curl -L https://github.com/XTLS/Xray-install/raw/main/install-release.sh)" @ install-geodata
```
## 设置配置文件
搭建的是VLESS-TCP-XTLS-Vision-REALITY，模板如下：
用Termius，打开/usr/local/etc/xray 下的config.json ，清空
```
{
  "log": {
    "loglevel": "warning"
  },
  "inbounds": [
    {
      "listen": "0.0.0.0",
      "port": ***,           //端口
      "protocol": "vless",
      "settings": {
        "clients": [
          {
            "id": "***",    //用“xray uuid”生成
            "flow": "xtls-rprx-vision"
          }
        ],
        "decryption": "none"
      },
      "streamSettings": {
        "network": "tcp",
        "security": "reality",
        "realitySettings": {
          "show": false,
          "dest": "***:443",
          "serverNames": ["***"],   //“TLSv1.3、X25519 与 H2网站”
          "privateKey": "***",         //“xray x25519”生成
          "shortIds": ["***"],        //“openssl rand -hex 8”生成
		  "fingerprint": "firefox"
        }
      },
      "sniffing": {
        "enabled": true,
        "destOverride": [
          "http",
          "tls"
        ]
      }
    }
  ],
  "outbounds": [
    {
      "protocol": "freedom",
      "tag": "direct"
    },
    {
      "protocol": "blackhole",
      "tag": "block"
    }
  ],
  "dns": {
    "servers": [
      "8.8.8.8",
      "1.1.1.1",
      "2001:4860:4860::8888",
      "2606:4700:4700::1111",
      "localhost"
    ]
  },
  "routing": {
    "domainStrategy": "IPIfNonMatch",
    "rules": [
      {
        "type": "field",
        "ip": ["geoip:private"],
        "outboundTag": "block"
      }
    ]
  }
}
{}
```
## 启动服务
重启服务
```
systemctl restart xray
```
查看xray状态,active (running)就是好了
```
systemctl status xray 
```
xray开机自启
```
systemctl enable xray 
```