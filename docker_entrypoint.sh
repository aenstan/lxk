#! /bin/bash
set -ex
WORK_DIR=/xdd/

# clone xdd仓库，环境变量 XDD_REPO_URL
cd /tmp
git clone "${XDD_REPO_URL}" xdd
cd xdd
go build
chmod 777 xdd

# 移动并清理
cp /tmp/xdd/xdd "${WORK_DIR}"
cp -R /tmp/xdd/scripts "${WORK_DIR}"
rm -rf /tmp/*

# 启动xdd
cd "${WORK_DIR}" && ./xdd
echo -e "=================== 小滴滴启动完毕 ==================="
