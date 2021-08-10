# 青龙面板与ninja扫码登录结合

## 更新日志

- v20210810

> 青龙版本`v2.8.1-004`

- v20210804

> 第一个版本，青龙版本`v2.8.1-003`

## 使用

```bash
mkdir -p /data/qinglong-ninja
cd /data/qinglong-ninja
wget https://ghproxy.com/https://raw.githubusercontent.com/gcdd1993/qinglong-ninja/main/docker/docker-compose.yml
docker-compose up -d
```

## 修改`docker-compose.yml`中的映射路径

```yaml
volumes:
  - ./config:/ql/config
  - ./log:/ql/log
  - ./db:/ql/db
  - ./repo:/ql/repo
  - ./raw:/ql/raw
  - ./scripts:/ql/scripts
  - ./jbot:/ql/jbot
```
