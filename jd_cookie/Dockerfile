FROM node:lts-alpine3.10
WORKDIR /app
COPY /jd_cookie/package.json ./
COPY /jd_cookie/yarn.lock ./
RUN yarn
COPY /jd_cookie/index.js ./
COPY /jd_cookie/sendNotify.js ./
COPY /jd_cookie/public ./public
EXPOSE 6789
CMD [ "node", "index.js" ]
