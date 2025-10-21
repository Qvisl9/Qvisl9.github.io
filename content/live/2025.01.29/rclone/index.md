---
title: "通过Rclone挂载google drive"
date: 2025-01-29T16:11:56+08:00
author: "Leeroy Guff"
showSummary: true
summary: ""
tags:
  - rclone
  - google drive

---

{{< lead >}}

自从陆续搭建了Alist、Mastodon后，备份数据也就变得尤其重要，这篇文章也就整理下整体的步骤。

{{< /lead >}}

## 创建Google Drive API

首先进入 [Google API Console](https://console.developers.google.com)

创建一个项目(项目名称随便填写)

![](https://ab712dd.webp.li/2022-10-26_14-09-19.png)

顶部搜索`Google Drive API`

启用它

![](https://ab712dd.webp.li/2022-10-26_14-20-07.png)

点击左侧边OAuth权限请求页面(用户类型选择**外部**; 应用名称随便填写(比如“rclone”就可以); 用户支持电子邮件和开发者联系邮箱都填写您自己的就可以)

然后点击**保存并继续**，剩下的参数都是用默认就可以了。

![](https://ab712dd.webp.li/Snipaste_2025-01-29_16-23-54.png)

创建完成后 点**发布应用**

![](https://ab712dd.webp.li/2022-10-26_14-38-11.png)

点击左侧凭据

屏幕上方点击**创建凭据**>>>选择**OAuth 客户端ID**

![](https://ab712dd.webp.li/2022-10-26_14-40-30.png)

应用类型选择**桌面应用**

![](https://ab712dd.webp.li/2022-10-26_14-42-12.png)

创建成功后，复制客户端 ID 参数和客户端密钥

![](https://ab712dd.webp.li/2022-10-26_14-44-27.png)

## 安装并配置 rclone

首先在 vps 上一键安装 rclone：

```
sudo -v ; curl https://rclone.org/install.sh | sudo bash
```

在 vps 上开始配置，执行：

```
rclone config
```

此时会看到：

```
2022/05/28 08:56:05 NOTICE: Config file "/root/.config/rclone/rclone.conf" not found - using defaults
No remotes found, make a new one?
n) New remote
s) Set configuration password
q) Quit config
```

选择 n，新建配置：

名字随便填写，这里填写的是GoogleDrive

![](https://ab712dd.webp.li/2022-10-26_13-34-15.png)

此时rclone会要你选择要挂载什么网盘，找到google drive并选择(这里18项就是 输入18即可)

![](https://ab712dd.webp.li/2022-10-26_13-45-02.png)

**然后我们粘贴第一步生成的客户端 ID 和客户端密钥**

![](https://ab712dd.webp.li/2022-10-26_14-48-38.png)

![](https://ab712dd.webp.li/2022-10-26_14-49-23.png)

权限选择：完整的访问权限，就**选择1**即可。

scope输入1

![](https://ab712dd.webp.li/2022-10-26_14-52-11.png)

> ser­vice_ac­coun­t_­file 为空
> Edit ad­vanced con­fig **输入 n** (不需要进行额外的高级配置)
> root_­fold­er_id 为空
> Use auto con­fig 因为是要在 vps 上挂载，vps 没有桌面环境，因此必须**选择 n**

之后我们会看到

![](https://ab712dd.webp.li/2022-10-26_14-55-51.png)

接下来在本地电脑上下载命令行操作的 rclone

下载在本地的 rclone 压缩包 然后解压

rclone下载地址：https://rclone.org/downloads

解压好后，`shift+左键`选择打开命令行

![](https://ab712dd.webp.li/Snipaste_2025-01-29_16-32-25.png)

复制红色方框的内容 粘贴到 cmd，前面要加`.\`

![](https://ab712dd.webp.li/2022-10-26_14-55-75.png)

然后浏览器胡弹出登录 Google >>> 登录账号 >>> 最后点继续

![](https://ab712dd.webp.li/2022-10-26_15-07-28.png)

复制 cmd 生成的 con­fig to­ken到vps的config_token

![](https://ab712dd.webp.li/Snipaste_2025-01-29_16-23-54.png)

如果要使用的是个人盘，就输入 n

![](https://ab712dd.webp.li/2022-10-26_15-11-58.png)

## 挂载Goole Drive

```none
mkdir /GoogleDrive
```

开始挂载 (其中 GoogleDrive 是 rclone 配置时输入的配置名称，/GoogleDrive 是挂载目录，–dae­mon 是指后台运行。)

```none
rclone mount GoogleDrive: /GoogleDrive --allow-other --allow-non-empty --vfs-cache-mode writes --daemon
```

此时可能会报错：

> Fa­tal er­ror: failed to mount FUSE fs: fuser­mount: exec: "fuser­mount": ex­e­cutable file not found in $PATH

这是因为缺少依赖，我们选择安装

debian 系使用：

```
apt install -y fuse3
```

centos 系使用：

```
yum install -y fuse3
```

再次执行挂载命令，如果没有报错，就是挂载成功了。

检查挂载：

```
df -h
```

就可以看到挂载的目录了

接下来进入 /GoogleDrive进行一些简单的测试

```
cd /GoogleDrive
ls
mkdir test
rm -rf test
```

如果能够顺利执行，则说明挂载没有问题。

##  创建备份脚本

使用您喜欢的文本编辑器创建一个脚本文件，例如 `backup.sh`：

```
nano /home/backup.sh
```

**在脚本中添加以下内容**：

```
#!/bin/bash

# 设置变量
BACKUP_DIR="/home"  # 要备份的目录
MOUNT_DIR="/GoogleDrive/mastodon"  # 挂载的 Google Drive 目录
TIMESTAMP=$(date +%Y%m%d%H%M)  # 时间戳
BACKUP_FILE="backup-$TIMESTAMP.zip"  # 备份文件名
PASSWORD="密码"  # 设置解压密码

# 创建压缩备份并设置密码
if zip -r -P "$PASSWORD" "/tmp/$BACKUP_FILE" "$BACKUP_DIR"; then
    echo "Backup created: /tmp/$BACKUP_FILE"
else
    echo "Failed to create backup"
    exit 1
fi

# 移动备份到 Google Drive 目录
if mv "/tmp/$BACKUP_FILE" "$MOUNT_DIR"; then
    echo "Backup moved to: $MOUNT_DIR"
else
    echo "Failed to move backup"
    exit 1
fi

# 删除超过三天的备份
find "$MOUNT_DIR" -name "backup-*.zip" -mtime +3 -exec rm {} \;
```

**保存并退出**：

按 `CTRL + X`，然后按 `Y` 以保存更改，最后按 `Enter`。

### 赋予脚本执行权限

```
chmod +x /home/backup.sh
```

### 确保安装 zip 工具

对于 Debian/Ubuntu 系统

```
sudo apt update
sudo apt install zip
```

### 设置定时任务

**打开 crontab 编辑器**：

```
crontab -e
```

**添加以下行以设置每天 12 点执行备份脚本**：

```
0 12 * * * /home/backup.sh
```

按 `CTRL + X`，然后按 `Y` 以保存更改，最后按 `Enter`。