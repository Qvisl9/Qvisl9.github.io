---
title: "使用AWS CLI删除CloudFlare存储桶"
date: 2024-12-22T20:52:49+08:00
author: "Yann Howard"
showSummary: true
summary: ""
tags:
  - CLI
  - cf
lastmod: ""
---

{{< lead >}}

由于mastodon用cloudflare R2作为存储，也就免不了要对存储桶进行增删改查，但存储桶又不能直接删除，这篇教程也就应运而生

{{< /lead >}}

## AWS CLI

- **下载AWS CLI**
  [AED CLI下载链接](https://aws.amazon.com/cn/cli/) 选择对应的版本下载

- **运行以下命令**：

```
aws --version
```

- **检查输出**：

如果 AWS CLI 已安装，你会看到类似于以下的输出：

```
aws-cli/2.x.x Python/3.x.x Windows/10 botocore/2.x.x
```

如果没有安装，会显示“`aws: command not found`”或类似的错误消息。

## 获取 Cloudflare R2 的访问密钥

- 登录到 Cloudflare 控制面板。
- 选择你的账户，然后进入 **"API Tokens"**。
- 创建一个新的 API 令牌，确保给予适当的权限（例如：`Account.R2.Buckets.Read` 和 `Account.R2.Buckets.Write`）。
- 记下你的 **Access Key** 和 **Secret Key**。

## 配置AWS CLI

- 打开命令行或终端

- 运行以下命令：

```
aws configure
```

输入以下信息：

- **AWS Access Key ID**: 输入你的 Cloudflare R2 的 Access Key。
- **AWS Secret Access Key**: 输入你的 Cloudflare R2 的 Secret Key。
- **Default region name**: 输入 `auto`（Cloudflare R2 不需要具体区域）。
- **Default output format**: 你可以选择 `json`、`text` 或 `table`，根据你的需求。

## 指定 Cloudflare R2 端点

在你的 `~/.aws/config` 文件中添加 R2 的端点信息。打开该文件并添加以下内容（如果文件不存在，则创建一个）：

```
[default]
region = auto
output = json

[profile r2]
region = auto
output = json
s3 =
    endpoint_url = https://<your-account-id>.r2.cloudflarestorage.com
```

## 使用 AWS CLI 访问 Cloudflare R2

现在你可以使用 AWS CLI 访问 Cloudflare R2，例如列出存储桶：

```
aws --endpoint-url=https://<your-account-id>.r2.cloudflarestorage.com s3 ls
```

确保将 `<your-account-id>` 替换为你的 Cloudflare 账户 ID。

- 删除整个存储桶中的所有对象

```
aws --endpoint-url=https://your-account-id.r2.cloudflarestorage.com s3 rm s3://your-bucket-name --recursive
```

将 `your-account-id` 替换为你的 Cloudflare 账户 ID。

将 `your-bucket-name` 替换为你要删除的存储桶名称。

### 删除存储桶本身

```
aws --endpoint-url=https://your-account-id.r2.cloudflarestorage.com s3api delete-bucket --bucket your-bucket-name
```

要删除存储桶，你需要先确保它是空的。