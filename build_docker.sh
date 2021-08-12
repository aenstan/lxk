#! /bin/bash
version=v$(date "+%Y%m%d")

set -ex
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
# 清理docker镜像
docker rmi whyour/qinglong:latest || true
# 清理build 缓存
docker builder prune

docker build -f Dockerfile --build-arg QL_VERSION="$QL_VERSION" -t gcdd1993/qinglong-ninja:latest -t gcdd1993/qinglong-ninja:"$version" .
docker push gcdd1993/qinglong-ninja:latest
docker push gcdd1993/qinglong-ninja:"$version"
