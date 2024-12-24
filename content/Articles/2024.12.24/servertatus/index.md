---


title: "为小鸡搭建云监控"
date: 2024-12-24T14:27:21+08:00
author: "Leeroy Guff"
showSummary: true
summary: ""
tags:
  - 探针
---

{{< lead >}}

探针是有必要的。可以随时查看各个服务器的情况，但哪吒探针在未完善V1版本的情况下仓促发布，出现诸多问题。本着不折腾，养老的心态，用上serverstatus。

{{< /lead >}}

本教程用的是cppla的开源项目：[ServerStatus](https://github.com/cppla/ServerStatus)

## 服务端配置

服务端即为总控，用于监控小鸡、消息推送、可视化web页面等

### 安装docker(以debian系统)

- 更新源

```
apt update -y && apt upgrade -y
```

- 安装docker和docker-compose

```
bash <(curl -L https://get.docker.com/)
sudo curl -L "https://github.com/docker/compose/releases/download/1.27.4/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 修改配置文件

下载两个配置文件 `serverstatus-config.json` `serverstatus-monthtraffic` 

```
wget --no-check-certificate -qO ~/serverstatus-config.json https://raw.githubusercontent.com/cppla/ServerStatus/master/server/config.json && mkdir ~/serverstatus-monthtraffic
```

下载完后选择性修改 `serverstatus-config.json` 文件

> 建议host不填或不要填真实IP，因为host中的内容会暴露在前端json文件

### docker run 启动服务端

docker安装无法修改默认界面，如需修改默认界面请选择手动安装

> `:` 之前是代表vps外部文件地址/端口 `:` 之后是容器内的文件地址/端口
>
> 不用担心多个容器端口冲突问题，docker默认为每个容器分配不同的内网IP段

```
docker run -d --restart=always --name=serverstatus -v ~/serverstatus-config.json:/ServerStatus/server/config.json -v ~/serverstatus-monthtraffic:/usr/share/nginx/html/json -p 80:80 -p 35601:35601 cppla/serverstatus:latest
```

#如果80和35601端口被占用了，就用的8880和45601端口，文件地址不变，例如启动命令为

```
docker run -d --restart=always --name=serverstatus -v ~/serverstatus-config.json:/ServerStatus/server/config.json -v ~/serverstatus-monthtraffic:/usr/share/nginx/html/json -p 8880:80 -p 45601:35601 cppla/serverstatus:latest
```

通过 `http://ip:port` 访问

## 通过反代配置域名访问

### 安装caddy

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

## 客户端配置

### 下载客户端配置文件

此时我在 `/root` 文件夹下

```
wget --no-check-certificate -qO client-linux.py 'https://raw.githubusercontent.com/cppla/ServerStatus/master/clients/client-linux.py'
```

- 选择性编辑客户端配置文件

#以下是我修改的配置文件

```
SERVER = "143.198.119.164"	#客户端服务器IP
USER = "s01"			#填入服务端配置文件中的username

PASSWORD = "USER_DEFAULT_PASSWORD"		#填入服务端配置文件中的password
PORT = 45601							#填入客户端的外部端口，我的是45601
CU = "mall.10010.com"					#tcping的目标地址，建议跟我一样
CT = "www.189.cn"						#tcping的目标地址，建议跟我一样
CM = "www.bj.10086.cn"					#tcping的目标地址，建议跟我一样
PROBEPORT = 80							#
PROBE_PROTOCOL_PREFER = "ipv4"  # ipv4, ipv6	#优先通过 v4/v6 访问 cu ct cm
PING_PACKET_HISTORY_LEN = 100			#显示最近100次丢包率 自行设置
INTERVAL = 1							#不清楚这个，太大可能判定为小鸡离线
```

- 安装python3

```
apt install python3 -y
```

- 为客户端程序配置守护进程systemd

```
nano /etc/systemd/system/tzstatus.service
```

写入：

```
[Unit]
Description=serverstatus
After=network.target
     
[Service]
ExecStart=python3 /root/client-linux.py
Restart=always
    
[Install]
WantedBy=multi-user.target
```

## 相关命令

- Docker重启容器

```
docker restart serverstatus
```

- systemd基础命令

停止tzstatus服务

```
systemctl stop tzstatus
```

启动tzstatus服务

```
systemctl start tzstatus
```

查看tzstatus服务状态

```
systemctl status tzstatus
```

​	使tzstatus服务开机自启

```
systemctl enable tzstatus
```

​	关闭tzstatus开机自启	

```
systemctl disable tzstatus
```

​		

## 报警推送

以`telegram_bot`为例

获取 `bot_token` 和 `chat_id`

在主控修改 `serverstatus-config.json` 的 `callback` 填入 `https://api.telegram.org/bot你自己的密钥/sendMessage?parse_mode=HTML&disable_web_page_preview=true&chat_id=你自己的标识&text=`

例如我的是 `https://api.telegram.org/bot575****292:AAGsqP2m_g2UzSmOZSTaup8mN****svsaYM/sendMessage?parse_mode=HTML&disable_web_page_preview=true&chat_id=191****008&text=`

## 规则设置

		"watchdog": [
			{
				"name": "cpu使用超过80%",
				"rule": "cpu>80",
				"interval": 300,
							"callback": "https://yourSMSurl"
			},
			{
				"name": "重要线路丢包率过高检查",
				"rule": "(ping_10010>10|ping_189>10|ping_10086>10)&(host='GB'|host='DE')",
				"interval": 600,
							"callback": "https://yourSMSurl"
			},
			{
				"name": "内存超过80%",
				"rule": "(memory_used/memory_total)*100>80",
				"interval": 300,
							"callback": "https://yourSMSurl"
			},
			{
				"name": "机器离线",
				"rule": "online4=0&online6=0",
				"interval": 600,
							"callback": "https://yourSMSurl"
			},
			{
				"name": "瞬时出栈速度大于200MB/S",
				"rule": "network_tx/1024/1024>200",
				"interval": 600,
							"callback": "https://yourSMSurl"
			},
			{
				"name": "瞬时入栈速度大于200MB/S",
				"rule": "network_rx/1024/1024>200",
				"interval": 600,
							"callback": "https://yourSMSurl"
			},
			{
				"name": "tcp连接数超过500，疑似被CC攻击",
				"rule": "tcp_count>500",
				"interval": 300,
							"callback": "https://yourSMSurl"
	        },
			{
				"name": "阿里云服务器流量18GB告警,限制username为乌兰察布",
				"rule": "(network_out-last_network_out)/1024/1024/1024>18&(username='wlcb1'|username='wlcb2'|username='wlcb3'|username='wlcb4')",
				"interval": 3600,
							"callback": "https://yourSMSurl"
			},
			{
				"name": "硬盘使用空间超过80%",
				"rule": "(hdd_used/hdd_total)*100>80",
				"interval": 1800,
							"callback": "https://yourSMSurl"
			}
		]
	}       
	
}       



