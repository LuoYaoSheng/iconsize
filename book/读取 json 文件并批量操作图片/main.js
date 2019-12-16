// Modules to control application life and create native browser window
const {app, BrowserWindow, dialog} = require('electron')
const path = require('path')
const fs = require('fs') //用于图片存储
const nativeImage = require('electron').nativeImage //图片操作相关

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
 
  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', userStart)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

function userStart () {
  // createWindow() //创建窗口
  // selectImage() // 添加 dialog 演示
  // saveImage() // 添加 nativeImage 演示
  batchImages() // 添加 读取 json 文件并批量操作图片
}

// 选择图片
function selectImage () {
  dialog.showOpenDialog({ 
      properties: ['openFile'], // properties：包含对话框应该使用的特征。openFile为允许选择文件。
      filters: [{ name: 'Images', extensions: ['jpg', 'png'] }] }, // filters：指定可以在需要时以限制用户对特定类型被显示或选择的文件类型的数组。这里仅允许jpg和png的图片。
      function (files) {
        if (files.length > 0) { // 文件数存在再进行相关操作
          console.log( JSON.stringify(files) )  // 获得具体返回的文件地址路径

          // 获取该文件的路径，为后期存储图片做准备
          let arr = files[0].split("/")
          let path = '/' + arr.splice(1, arr.length - 2).join("/")
          console.log( path )
        }
  })
}

// 存储图片
function saveImage () {
  let image = nativeImage.createFromPath( "/Users/lys/Desktop/Object/iconSize.png" ) //创建 NativeImage 实例
  let resizeImage = image.resize({ width: 100, height: 100 }) //height 或 width 选填
  let imageData = resizeImage.toPNG()  //返回一个包含图像 PNG 编码数据的 Buffer 

  //指定存储路径进行图片存储
  fs.writeFile("/Users/lys/Desktop/Object/iconSize-100.png", imageData, function (err) {
      if (err)
        return console.log(err)
    }
  )
}

// 读取 json 文件并批量操作图片
function batchImages () {

  // 将 json 文件名拆解，便于名称遍历
  let element = 'template'
  let jsonPath = 'data/' + element + '.json'

  //获取本地json文件的路径
  let newFile_path = path.join(__dirname, jsonPath).replace(/\\/g, "\/")

  // 存储图片的路径
  let dirPath = '/Volumes/MAC-Lys/Project/OpenSource/iconsize-blog/Object/'

  // 创建 NativeImage 实例
  let image = nativeImage.createFromPath( "/Volumes/MAC-Lys/Project/OpenSource/iconsize-blog/Object/iconSize.png" ) 

  // 判断文件是否存在
  fs.exists(newFile_path, function (exists) {
    if (!exists) {
      $(".errorInformation").show();
      $(".errorInformation").text("查找失败，本地文件不存在!");
      return 0
    } else {
      // 读取本地的json文件
      fs.mkdir(dirPath, function (err) {
        if (err)
          return console.log(err)
        }
      )

      // 获取 json 内容并转化成 json 格式，便于读取
      let result = JSON.parse(fs.readFileSync(newFile_path))

      // 遍历 json 中 images 
      let images = result['images']
      for (var i in images) {
        let size = images[i]['size'].split("x")[0]
        let scale = images[i]['scale'].split("x")[0]
        let filename = images[i]['filename']

        // 读取 size 和 scale 最终确定图片的宽
        let w = size * scale
        // 修改图片大小
        let iImage = image.resize({ width: w, height: w })
        // 转化成 png 的 data 流
        let imageData = iImage.toPNG()
        // 考虑动态性，进行检测是否有 filename ， 存在则以 filename 来存储图片，不存在则以 icon_size(@scale)(x).png 命名
        let imageName = filename ? filename : scale == 1 ? 'icon_' + size + 'x' + size + '.png' : 'icon_' + size + 'x' + size + '@' + images[i]['scale'] + '.png'

        // 图片按 imageName 写入存储到 dirPath 中
        fs.writeFile(path.resolve(dirPath + imageName), imageData, function (err) {
          if (err)
            return console.log(err)
        }
        )
      }
    }
  })
}