FROM whyour/qinglong:latest

ARG QL_VERSION

LABEL maintainer="gcdd1993 <gcwm99@gmail.com>"
LABEL qinglong_version="${QL_VERSION}"

RUN mkdir -p /ql/xdd

COPY docker-entrypoint.sh /ql/docker/docker-entrypoint.sh

# 初始化生成目录 && fix "permission denied: unknown"
RUN chmod 755 /ql/docker/docker-entrypoint.sh

# fix /ql/shell/share.sh: line 311: /ql/log/task_error.log: No such file or directory
RUN mkdir -p /ql/log \
    && echo "" > /ql/log/task_error.log

# 青龙默认端口
EXPOSE 5701
# xdd默认端口
EXPOSE 8080

VOLUME /ql/xdd

ENTRYPOINT ["./docker/docker-entrypoint.sh"]