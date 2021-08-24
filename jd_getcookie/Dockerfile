FROM alpine:3.13
WORKDIR /app
COPY /jd_getcookie/package.json ./
COPY /jd_getcookie/yarn.lock ./
COPY /jd_getcookie/index.js ./
COPY /jd_getcookie/sendNotify.js ./
COPY /jd_getcookie/public ./public
RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories \
    && apk add --no-cache tzdata \
    nodejs-lts \
    yarn \
    && ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone \
    && yarn \
    && rm -rf /tmp/* \
    && rm -rf /var/cache/apk/*
EXPOSE 6789
CMD [ "node", "index.js" ]