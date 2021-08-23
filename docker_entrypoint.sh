#!/bin/bash
set -ex
WORK_DIR=/xdd/

# clone xdd仓库，环境变量 XDD_REPO_URL
echo -e "=================== 开始编译小滴滴 ==================="
cd /tmp
git clone "${XDD_REPO_URL}" xdd
cd xdd
go build
chmod 777 xdd
echo -e "=================== 小滴滴编译完毕 ==================="

# 移动并清理
cp /tmp/xdd/xdd "${WORK_DIR}"
cp -R /tmp/xdd/scripts "${WORK_DIR}"
rm -rf /tmp/*

# 启动xdd
echo -e "=================== 启动小滴滴（第一次可能启动较慢） ==================="
cd "${WORK_DIR}" && ./xdd
