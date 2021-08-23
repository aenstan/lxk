FROM golang:1.16.7-alpine3.14

LABEL maintainer="gcdd1993 <gcwm99@gmail.com>"

WORKDIR /xdd

RUN set -eux; \
    sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories \
    && apk update \
    && apk add --no-cache --virtual .build-deps git build-base

COPY docker_entrypoint.sh /usr/local/bin/docker_entrypoint.sh

# 初始化生成目录 && fix "permission denied: unknown"
RUN chmod +x /usr/local/bin/docker_entrypoint.sh

# xdd默认端口
EXPOSE 8080

VOLUME /xdd

ENTRYPOINT ["docker_entrypoint.sh"]