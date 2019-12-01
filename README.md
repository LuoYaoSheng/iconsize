# iconsize
Generate icons of different sizes

Fast running projects:
#Clone the warehouse for the sample project
$ git clone https://github.com/LuoYaoSheng/iconsize.git

#Enter this warehouse
$ cd iconsize

#Install dependency and run
$ npm install && npm start

# iconsize
快速制作指定大小的图片工具

快速运行项目：
# 克隆示例项目的仓库
$ git clone https://github.com/LuoYaoSheng/iconsize.git

# 进入这个仓库
$ cd iconsize

# 安装依赖并运行
$ npm install && npm start

如何将图片转成icns
# 安装icoutils
$ brew install icoutils
# 进入生成文件夹
$ cd objectDir
# 文件夹重命名
$ mv MacOS MacOS.iconset
# 通过iconutil生成
$ iconutil -c icns MacOS.iconset -o mac.icns

如何打包
# 安装electron-builder
$ npm install electron-builder --save-dev
# 执行
$ npm run dist
