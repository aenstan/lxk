FROM golang:1.16.7 AS builder

ENV XDD_GIT_URL https://github.com/cdle/xdd.git

# 编译xdd
# 安装xdd 目录为 /ql/xdd
RUN set -eux; \
    apt-get update -y \
    && apt-get install -y git \
    && mkdir /builder \
    && cd /builder \
    && git clone ${XDD_GIT_URL} \
    && cd xdd \
    && go build \
    && chmod 777 xdd

# fix arguments too long
FROM node:slim

ARG QL_VERSION

LABEL maintainer="gcdd1993 <gcwm99@gmail.com>"
LABEL qinglong_version="${QL_VERSION}"

ENV QL_URL=https://github.com/whyour/qinglong.git
ENV QL_BRANCH=master
ENV TZ="Asia/Shanghai"
ENV PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin \
    LANG=zh_CN.UTF-8 \
    SHELL=/bin/bash \
    PS1="\u@\h:\w \$ " \
    QL_DIR=/ql

WORKDIR ${QL_DIR}
RUN set -eux; \
    apt-get update -y \
    && apt-get install -y bash \
                     coreutils \
                     moreutils \
                     git \
                     curl \
                     wget \
                     tzdata \
                     perl-base \
                     openssl \
                     nginx \
                     python3 \
                     python3-pip \
                     jq \
                     openssh-server \
                     cron \
    && ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "$TZ" > /etc/timezone \
    && touch ~/.bashrc \
    && mkdir /run/nginx \
    && git clone -b ${QL_BRANCH} "https://ghproxy.com/${QL_URL}" ${QL_DIR} \
    && git config --global user.email "qinglong@@users.noreply.github.com" \
    && git config --global user.name "qinglong" \
    && git config --global pull.rebase true \
    && cd ${QL_DIR} \
    && cp -f .env.example .env \
    && chmod 777 ${QL_DIR}/shell/*.sh \
    && chmod 777 ${QL_DIR}/docker/*.sh \
    && npm install -g pnpm \
    && pnpm install -g pm2 \
    && pnpm install -g ts-node typescript tslib \
    && rm -rf /root/.npm \
    && pnpm install --prod \
    && rm -rf /root/.pnpm-store \
    && git clone -b ${QL_BRANCH} https://ghproxy.com/https://github.com/whyour/qinglong-static.git /static \
    && cp -rf /static/* ${QL_DIR} \
    && rm -rf /static

RUN mkdir -p /ql/xdd

COPY docker-entrypoint.sh /ql/docker/docker-entrypoint.sh
COPY --from=builder /builder/xdd/xdd /ql/xdd/xdd

# 初始化生成目录 && fix "permission denied: unknown"
RUN set -eux; \
    mkdir -p /ql/xdd/conf \
    && chmod 777 /ql/xdd/xdd \
    && chmod +x /ql/docker/docker-entrypoint.sh

# fix /ql/shell/share.sh: line 311: /ql/log/task_error.log: No such file or directory
RUN mkdir -p /ql/log \
    && echo "" > /ql/log/task_error.log

# 青龙默认端口
EXPOSE 5701
# xdd默认端口
EXPOSE 8080

VOLUME /ql/xdd/conf

ENTRYPOINT ["./docker/docker-entrypoint.sh"]