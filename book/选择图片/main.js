// Modules to control application life and create native browser window
const {app, BrowserWindow, dialog} = require('electron')
const path = require('path')

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

  // 添加 dialog 演示
  selectImage()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

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