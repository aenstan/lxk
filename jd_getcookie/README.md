账号自助更新工具（副容器，扩展功能选择使用）：
它可以更新现存账号、填加新账号，此工具在公网使用才有意义，此工具源码禁止所有人搬运否则后果自负。
此工具与主容器相互独立不存在隐私泄露的风险，并且接口已做二次验证，此工具占用资源极低可以忽略。
此工具可通过容器日志查询使用记录和账号信息，请确认你是否信任此工具的提供者，否则你的账号信息将被此工具拥有者一览无遗。

获取主容器更新接口用于验证的 Token 值:

cat config/auth.json | awk -F ',' '{print $NF}' | awk -F '\"' '{print $4}'
注意：默认为 88888888 ，请先在主容器重置控制面板的用户名和密码，每次重置后都会随机生成新的 Token 值。

通用方法启动容器：

docker run -d --name jd_cookie --restart always \
--network bridge `# 旁路由需换成 host` \
-p 6789:6789 `# 主机端口号可自定义` \
-e UPDATE_API=http://$(docker inspect --format='{{.NetworkSettings.IPAddress}}' jd):5678/updateCookie `# 配置主容器更新账号的 API 接口地址，看注释` \
-e API_TOKEN="abcdefghijklmnopqrstuvwxyz" `# 配置主容器更新账号的 API 接口地址的验证 Token 值，即上一条命令获取到的值` \
tonglin138/jd_getcookie
Docker Compose 示例：

version: "2.0"
services:
jd:
  image: supermanito/helloworld
  ...
  .....
  ........
jd_cookie:
  image: tonglin138/jd_getcookie
  container_name: jd_cookie
  restart: always
  network_mode: bridge
  ports:
    - 6789:6789
  environment: 
    - UPDATE_API=http://www.example.com:5678/updateCookie  # 建议使用固定的 IP 地址或域名
    - API_TOKEN=abcdefghijklmnopqrstuvwxyz                 # 主容器更新接口的验证 Token 值
    
    
注意事项：

1. `UPDATE_API` 变量需填入正确的地址才可以更新账号或添加新账号，最终指向的是控制面板的 `updateCookie` 接口；
   请优先使用此副容器部署环境能访问到主容器该更新接口的的局域网或公网地址代替，IP、域名、DDNS 域名都是可以的；
   如果没有局域网或公网的固定地址那么只能使用默认变量参数，即主容器的容器内部通信 IP 地址，详见第二条注释内容。

2. `UPDATE_API` 变量默认参数 $(docker inspect xxx jd) 是一个 Linux 命令不能用于 docker-compose 启动；
   其含义是获取主容器的容器内部通信 IP 地址并非主机的局域网地址，每次重启容器内部通信 IP 地址都会变更；
   当用此默认参数作为该变量启动容器后若发现不能更新说明主容器重启过，重启副容器即可解决此问题。

3. 如果是旁路由容器网络类型需换成 `host` 即 `--network host`；
   并且 `UPDATE_API` 变量需把参数中的命令替换成填写主机 `docker0网卡` 的网关 IP 地址或者局域网 IP 地址；
   例：http://172.17.0.1:5678/updateCookie , http://192.168.1.3:5678/updateCookie。

4. 支持主容器中的所有推送通知方式且环境变量相同，如有需要自行添加相关变量。

5. 支持多个服务器推送，UPDATE_API 和 API_TOKEN 按顺序用 "|" 隔开。

查看使用记录：
 docker logs jd_cookie  
