<p>
  <a href="#Travis CI"><img src="https://www.travis-ci.com/gcdd1993/qinglong-ninja.svg?branch=main" alt="Build Status"></a>
</p>

最近很流行京东挂机赚京豆，也看到很多人无法自行完成服务器端的配置！特别是青龙升级到`2.8`之后，更是难以使用。所以，特地提供青龙+`ninja`一键部署的`Docker`镜像。

[一键部署青龙 + xdd请移步这里](https://blog.gcdd.top/p/35018/)

如果想搭建但是还没有购买服务器的，可以点我的链接进行购买，[阿里云轻量级服务器 2核2G 99/年](https://www.aliyun.com/minisite/goods?userCode=ijsckn04&share_source=copy_link)，不仅你可以获得优惠券，我也可以获得邀请人数。购买完成可以添加我的qq 1398371419，备注“青龙”，我将会全程指导你安装，如果实在不会，我也可以代为搭建。

<!-- more -->

# 一键部署Docker

> 基于`Ubuntu`

```bash
sudo apt-get update && sudo apt-get -y install apt-transport-https ca-certificates curl gnupg-agent software-properties-common && curl -fsSL http://mirrors.aliyun.com/docker-ce/linux/ubuntu/gpg | sudo apt-key add - && sudo apt-key fingerprint 0EBFCD88 && sudo add-apt-repository "deb [arch=amd64] http://mirrors.aliyun.com/docker-ce/linux/ubuntu $(lsb_release -cs) stable" && sudo apt-get update && sudo apt-get -y install docker-ce docker-ce-cli containerd.io && sudo docker --version
# 修改/etc/docker/daemon.json，很重要，限制docker使用的磁盘资源
sudo vim /etc/docker/daemon.json
{
    "data-root": "/data/docker", // 之前如果有启动过的容器，或者拉取的镜像，修改这个值，将会时效
    "log-driver":"json-file",
    "log-opts":{
        "max-size":"10m",
        "max-file":"3",
        "labels":"production_status",
        "env":"os,customer"
    },
    "insecure-registries":[
        "registryhost:5000",
        "10.0.0.0/8"
    ],
    "registry-mirrors":[
        "https://mubkcb81.mirror.aliyuncs.com"
    ]
}
sudo systemctl daemon-reload
sudo systemctl restart docker

# 配置docker开机自启动
sudo systemctl enable docker
```

再装上`docker-compose`

```bash
sudo curl -L "https://github.91chifun.workers.dev/https://github.com//docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && sudo chmod +x /usr/local/bin/docker-compose && docker-compose --version
```

# 一键部署青龙+ninja

> 这一步也很简单，直接使用`docker-compose`部署即可

```bash
mkdir -p /data/qinglong-ninja
cd /data/qinglong-ninja
wget https://ghproxy.com/https://raw.githubusercontent.com/gcdd1993/qinglong-ninja/main/docker/docker-compose.yml
# 这里可以自行修改docker-compose.yml，但是注意，不要mount ninja的目录，不然会导致ninja启动失败
docker-compose up -d
```

等待启动完成

## 打开青龙

> http://localhost:5700

![image-20210806204359586](https://raw.githubusercontent.com/gcdd1993/gcdd1993.github.io/feature/imageRepo/img/image-20210806204359586.png)

## 打开ninja

> http://localhost:5701

![image-20210806204416555](https://raw.githubusercontent.com/gcdd1993/gcdd1993.github.io/feature/imageRepo/img/image-20210806204416555.png)

# 多说一句

自从`lxk0306`跑路之后，我个人也维护了一份京东脚本，感兴趣的可以拉取我的镜像，助力码填的是我自己的，可以自行更改。

```bash
ql repo https://github.com/gcdd1993/jd_scripts "jd_|jx_|getJDCookie" "activity|backUp" "^jd[^_]|USER"
```

# 附录

- [青龙面板](https://github.com/whyour/qinglong)
- [ninja京东扫码登录](https://github.com/MoonBegonia/ninja)
- [Docker Hub](https://hub.docker.com/repository/docker/gcdd1993/qinglong-ninja)

- [个人维护京东脚本](https://github.com/gcdd1993/left1)

好了，到这结束了，有问题欢迎留言，知无不言。
