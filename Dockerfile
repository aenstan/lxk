FROM golang:1.16.7-alpine3.14

LABEL maintainer="gcdd1993 <gcwm99@gmail.com>"
LABEL qinglong_version="${QL_VERSION}"

WORKDIR /xdd

RUN set -eux; \
    sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories \
    && apk update \
    && apk add --no-cache --virtual .build-deps git build-base

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh

# 初始化生成目录 && fix "permission denied: unknown"
RUN chmod 755 /usr/local/bin/docker-entrypoint.sh

# xdd默认端口
EXPOSE 8080

VOLUME /xdd

ENTRYPOINT ["docker-entrypoint.sh"]