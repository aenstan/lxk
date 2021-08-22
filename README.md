<p>
  <a href="#Travis CI"><img src="https://www.travis-ci.com/gcdd1993/qinglong-xdd.svg?branch=master" alt="Build Status"></a>
</p>
`XDD`的热度🔥越来越高了，目前它的功能确实很多花样，非常有意思。但是很多人都无法自己完成编译，更不用说部署了。所以我特地编译了青龙面板+xdd一键部署镜像。

[一键部署青龙 + ninja请移步这里](https://blog.gcdd.top/p/56460/)

如果想搭建但是还没有购买服务器的，可以点我的链接进行购买，[阿里云轻量级服务器 2核2G 99/年](https://www.aliyun.com/minisite/goods?userCode=ijsckn04&share_source=copy_link)，不仅你可以获得优惠券，我也可以获得邀请人数。购买完成可以添加我的qq 1398371419，备注“青龙”，我将会全程指导你安装，如果实在不会，我也可以代为搭建。

<!-- more -->

# 部署

部署可以说是非常简单了，只需要安装好docker和docker-compose，接下来就交给机器吧。

```bash
mkdir -p /data/qinglong-xdd
cd /data/qinglong-xdd
wget https://ghproxy.com/https://raw.githubusercontent.com/gcdd1993/qinglong-xdd/master/docker-compose.yml
docker-compose up -d
# 然后修改xddconf目录下的配置文件
# app.conf #启动端口
# config.yaml #xdd配置
# 修改完毕重启容器
docker-compose restart
```

以下是`docker-compose.yml`文件，如果下载不下来的，可以自行创建文件`docker-compose.yml`，写入以下内容即可

```yaml
version: "3"
services:
  qinglong-xdd:
    image: gcdd1993/qinglong-xdd:latest # tag（即版本）可以自己修改
    container_name: qinglong-xdd
    restart: unless-stopped
    tty: true
    ports:
      - 5700:5700
      - 8080:8080
    environment:
      - ENABLE_HANGUP=true
      - ENABLE_WEB_PANEL=true
    volumes:
      - ./config:/ql/config
      - ./db:/ql/db
      - ./xddconf:/ql/xdd/conf
```

然后执行以下命令

```bash
docker-compose down && docker-compose up -d
```

等待容器启动完毕

## 访问青龙面板

地址：http://localhost:5700

![image-20210820232624916](https://cdn.jsdelivr.net/gh/gcdd1993/image-repo/img/image-20210820232624916.png)

第一次打开输入账号`admin`，密码`admin`，会自动生成密码，密码在运行目录的`config/auth.json`里面可以看见

![image-20210820232806149](https://cdn.jsdelivr.net/gh/gcdd1993/image-repo/img/image-20210820232806149.png)

## 修改xdd配置

打开运行目录下的`xddconf/config.yaml`，修改青龙配置，有人扫码扫不上，很可能是因为这个没改

```yaml
containers:
  - address: http://localhost:5700 # 青龙IP地址
    username: admin
    password: Ids2i7w#Swtwp-cDSV # 青龙登录密码
    weigth:  
    mode: parallel
    limit: 9999
```

改完后重启容器

```bash
# 确保目录在docker-compose.yml文件所在目录
docker-compose restart
```

## 访问 XDD面板

地址是http://localhost:8080

![image-20210820232858439](https://cdn.jsdelivr.net/gh/gcdd1993/image-repo/img/image-20210820232858439.png)

直接扫码登录即可（这些配置干啥的，我也不是很懂）

![image-20210820232956642](https://cdn.jsdelivr.net/gh/gcdd1993/image-repo/img/image-20210820232956642.png)

然后回到青龙，看是否已经添加Cookie成功

![image-20210820235440214](https://cdn.jsdelivr.net/gh/gcdd1993/image-repo/img/image-20210820235440214.png)

# XDD配置介绍

> 以下内容摘自[群晖Docker青龙面板XDD扫码部署指南8.16更新新版编译 – 科技玩家 (kejiwanjia.com)](https://www.kejiwanjia.com/zheteng/9392.html)

```yaml
mode: balance #模式 balance(均衡模式)、parallel(平行模式)
containers: #容器，可配置多个
  - address: http://192.168.31.233:5700 #青龙2.2、青龙2.8、v1v2v3v4v5访问地址（根据自己ip填）
    username: admin #用户名（青龙config文件夹-auth.json文件找）
    password: admin #密码（青龙config文件夹-auth.json文件找）
    weigth:  #权重 balance模式下权重越高分得的ck越多，默认1（看你自己，我单容器默认）
    mode: parallel #单独对容器进行模式设置（自己选）
    limit:  #限制容器ck数目 （我没限制）
  #- address: http://192.168.31.233:5525 ##（单容器注释，多容器保留）
  #  username: admin
  #  password: admin
  #- path: /Users/cdle/Desktop/jd_study/jdc/config.sh #本地配置文件路径 v1v2v3v4v5和不知名容器的配置
  #- path: /Users/cdle/Desktop/jd_study/jdc/list.sh
theme: https://ghproxy.com/https://raw.githubusercontent.com/cdle/jd_study/main/xdd/theme/noodin.html #自定义主题，支持本地、网络路径（我喜欢吃面）
static: ./static #静态文件 便于自定义二维码页面时，引入css、js等文件（不用动）
master: jd_xxxxx #管理员账户pin，有多个用'&'拼接
database: /ql/db/xdd.db  #数据库位置，默认./.jdc.db #（强迫症的我还是给它找了个家，路径按自己的来改）
qywx_key:  #企业微信推送key（这个就是企业微信机器人的key）
daily_push: #定时任务（这个我暂时没有配置）
resident: #均衡模式下所有容器共同的账号pin，有多个用'&'拼接。不建议填写，后续实现指定账号助力功能。（这个我也没配置，多容器自己试试）
#自定义ua
user_agent:
telegram_bot_token:  #telegram bot token（这个应该不用再说了吧）
telegram_user_id:  #telegrame user id（这个应该不用再说了吧）
qquid:  #接收通知的qq号（这个填你的群主qq号码，和扫码配置的qq机器人分开，需要2个qq号）
qqgid:  #监听的群（把你的羊毛群号填上去）
default_priority: #新用户默认优先级（默认就行，默认是1）
no_ghproxy: true #更新资源是否不使用代理 默认false（看你自己的运行环境填）
qbot_public_mode: true  #qq机器人群聊模式，默认私聊模式（我用了群测试，所以改了true，默认false）
daily_asset_push_cron: 0 9 * * * #日常资产推送时间（这个应该也不用再说了吧）
```

# 更新版本

> 由于xdd是需要进行编译的，且作者并未给出编译后的二进制版本，所以暂时不支持容器内更新xdd

```bash
# 更新青龙
docker exec -it qinglong ql update
```

# 回退版本

> 有时候部署完毕之后，因为这样那样的原因，导致xdd扫码青龙无法识别，这时候可能需要进行回退

## 修改`docker-compose.yml`的镜像tag

![image-20210820235049051](https://cdn.jsdelivr.net/gh/gcdd1993/image-repo/img/image-20210820235049051.png)

## 重启

```bash
docker-compose down && docker-compose up -d
```

# 交流

- [TG群](https://t.me/jd_wool)

- 联系微信 gclovewm123

 <img src="https://raw.githubusercontent.com/gcdd1993/gcdd1993.github.io/feature/imageRepo/img/微信二维码.jpg" width = "200" height = "200" alt="扫码加我好友，一起薅羊毛" align=center />

# 常见问题

## 为什么http://localhost:8080访问不了？

一般是xdd启动失败了，可以通过以下命令检查xdd是否启动成功

```bash
cd /data/qinglong-xdddocker-compose logs -f
```

![image-20210821214835916](https://cdn.jsdelivr.net/gh/gcdd1993/image-repo/img/image-20210821214835916.png)

`yaml`文件配置错误

`yaml`是标准的配置文件格式，建议使用专业的编辑器进行修改，例如`Notepad++`，其他的可能导致编辑后格式错误

而且配置键值之间，需要有一个空格

![image-20210821215121432](https://cdn.jsdelivr.net/gh/gcdd1993/image-repo/img/image-20210821215121432.png)

## xdd怎么配置QQ机器人？

由于配置机器人，需要用到数据库，以及必须以前台模式运行才能进行配置，所以需要进行以下操作

### 修改db配置

> 由于数据存储在sqllite，所以必须修改下db目录，并创建db文件

```bash
cd /data/qinglong-xdd/xddconfvi config.yaml# 修改以下配置database: /ql/db/xdd.db# 创建xdd.dbcd /data/qinglong-xdd/dbtouch xdd.db
```

### 进入容器xdd目录

```bash
cd /data/qinglong-xdddocker exec -it qinglong-xdd sh # 或者bash# 以下命令在容器内执行cd /ql/xdd
```

### 杀掉xdd进程并以前台模式运行

```bash
# 以下命令在容器内执行ps -ajx | grep xdd ## 查看原程序PIDkill -9 ${PID}cd /ql/xdd./xdd
```

前台启动后，应该会出现初始化数据库，然后QQ机器人二维码，然后扫码即可

![image-20210821213902640](https://cdn.jsdelivr.net/gh/gcdd1993/image-repo/img/image-20210821213902640.png)

扫码完成

![image-20210821213946662](https://cdn.jsdelivr.net/gh/gcdd1993/image-repo/img/image-20210821213946662.png)

### 以后台模式重启xdd

```bash
# Ctrl + C退出./xdd -d# 退出容器exit
```

![image-20210821214358868](https://cdn.jsdelivr.net/gh/gcdd1993/image-repo/img/image-20210821214358868.png)

至此，祝贺你，QQ机器人已经配置完毕！

