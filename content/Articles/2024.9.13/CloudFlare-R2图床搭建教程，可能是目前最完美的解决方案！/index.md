---
title: "CloudFlare R2图床搭建教程，可能是目前最完美的解决方案！"
date: 2024-09-13T19:18:39+08:00
author: "何物"
description: ""
tags: ["图床"]
---

{{< lead >}}

自从Telegraph不能用后，也尝试过兰空，但由于开源版要用服务器，自己又怕哪一天把服务器搞炸了，思来想去，决定就用R2，大厂稳定，又足够用。

{{< /lead >}}

## 注册cf账号并获取R2

1、[注册链接](https://dash.cloudflare.com/sign-up)

2、左侧菜单选择`R2`，用信用卡或者是PayPal认证，建议是用PayPal，中国区也可以，没有的可以先去注册个Paypal

3、创建存储桶，名称：img，地区选择`美西`

![Snipaste_2024-09-13_17-14-58](https://ab712dd.webp.li/Snipaste_2024-09-13_17-14-58.png)

选择中间的`setting`

![Snipaste_2024-09-13_19-31-20](https://ab712dd.webp.li/Snipaste_2024-09-13_19-31-20.png)

打开子域并设置自定义域名(自定义域名要已经解析到cf上)

![Snipaste_2024-09-13_17-18-02](https://ab712dd.webp.li/Snipaste_2024-09-13_17-18-02.png)

4、由天300M以上要用s3 API，所以现在去申请API

选择`管理R2 API令牌`

![Snipaste_2024-09-13_17-19-33](https://ab712dd.webp.li/Snipaste_2024-09-13_17-19-33.png)

令牌名称随意，权限设置`对象读和写`，指定存储桶为刚才创建的，也就是``img`

![Snipaste_2024-09-13_17-20-05](https://ab712dd.webp.li/Snipaste_2024-09-13_17-20-05.png)

这样我们R2图床就已经搭建好了。现在用PIcGo搭建上传。

## PicGo设置

打开PIcGO，选择插件管理安装`s3`

![Snipaste_2024-09-13_17-28-23](https://ab712dd.webp.li/Snipaste_2024-09-13_17-28-23.png)

安装好后，打开图床设置，选择`Amazon s3`

应用密钥ID：访问密钥 ID

应用密钥：机密访问密钥

自定义节点：终结点

![Snipaste_2024-09-13_17-34-51](https://ab712dd.webp.li/Snipaste_2024-09-13_17-34-51.png)

## 使用WebP加速图片缓存

[WebP Cloud注册地址](https://dashboard.webp.se/login)

右下角`创建代理`

![Snipaste_2024-09-13_19-51-11](https://ab712dd.webp.li/Snipaste_2024-09-13_19-51-11.png)

代理名称随意，源站地址为R2的自定义域名，开头要加`https`确认即可

![Snipaste_2024-09-13_19-52-32](https://ab712dd.webp.li/Snipaste_2024-09-13_19-52-32.png)

之后再找开PicGo，在`Amazon S3`设置中，把自定义域名改为WeBP的代理地址即可。