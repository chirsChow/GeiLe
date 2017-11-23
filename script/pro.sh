#!/bin/sh
script/init.sh
echo "生成配置文件"
sed -i 's/isDebug = true/isDebug = false/g' ./js/services.js
echo "关闭debug模式"
gulp imagemin
gulp sass
gulp scripts
echo "编译文件"
cp -rf ./dist/* ../www/c_www_pro/
echo "复制文件"
sed -i 's/http:\/\/testlife.365gl.com\//https:\/\/life.365gl.com\//g' ../www/c_www_pro/js/all.min.js
sed -i 's/170475/172778/g' ../www/c_www_pro/js/all.min.js
sed -i 's/HIF9z3sj78rvtXQVtKl3S1oQ9dU2ZgyD/5c386b41caecdd8f9003871d2660ef2d/g' ../www/c_www_pro/js/all.min.js
echo "正式地址替换"
cd ../www/c_www_pro
git status
git add .
git commit -m "打包"
git push
echo "git上传成功"