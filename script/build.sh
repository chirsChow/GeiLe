#!/bin/sh
script/init.sh
echo "生成配置文件"
gulp sass-debug
gulp scripts-debug
echo "编译文件"
cp -rf ./component/ css/ data/ img/ js/ lib/ ./config.js ./index.html ../www/c_www/
cp -rf ./component/ css/ data/ img/ js/ lib/ ./config.js ./index.html ../andriod/glmember/platforms/android/assets/www/
echo "复制文件"
sed -i 's/isDebug = true/isDebug = false/g' ../www/c_www/js/all.min.js
sed -i 's/isDebug = true/isDebug = false/g' ../andriod/glmember/platforms/android/assets/www/js/all.min.js
sed -i 's/https:\/\/life.365gl.com\//http:\/\/testlife.365gl.com\//g' ../www/c_www/js/all.min.js
sed -i 's/https:\/\/life.365gl.com\//http:\/\/testlife.365gl.com\//g' ../andriod/glmember/platforms/android/assets/www/js/all.min.js
sed -i 's/172778/170475/g' ../www/c_www/js/all.min.js
sed -i 's/5c386b41caecdd8f9003871d2660ef2d/HIF9z3sj78rvtXQVtKl3S1oQ9dU2ZgyD/g' ../www/c_www/js/all.min.js
sed -i 's/172778/170475/g' ../andriod/glmember/platforms/android/assets/www/js/all.min.js
sed -i 's/5c386b41caecdd8f9003871d2660ef2d/HIF9z3sj78rvtXQVtKl3S1oQ9dU2ZgyD/g' ../andriod/glmember/platforms/android/assets/www/js/all.min.js
echo "关闭debug模式"
cd ../www/c_www
git status
git add .
git commit -m "打包"
git push
echo "git上传成功"