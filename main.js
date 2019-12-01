// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const fs = require('fs')
const nativeImage = require('electron').nativeImage

const storage = require('electron-localstorage')

let image = null//nativeImage.createFromPath('/Users/lys/Desktop/imageSize/icon.jpg')
let MainWindow = null
let SetWindow = null

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
  if (MainWindow === null) createMainWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

//子 - 主
ipcMain.on('event_renderer_to_main', (event, arg) => {
  switch (arg.action) {
    case 'OPEN_SET':
      createSetWindow()
      break;
    case 'SELECT_IMG':
      dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: 'Images', extensions: ['jpg', 'png'] }] }, function (files) {
        if (files.length > 0) {
          arg.dir = files[0]
          let arr = files[0].split("/")
          let path = '/' + arr.splice(1, arr.length - 2).join("/")
          global.sharedObject.originalLocation = path
          storage.setItem('originalLocation', path)
          image = nativeImage.createFromPath(files[0])
          event.sender.send('event_main_to_renderer', arg)
        }
      })
      break;
    case 'SAVE_IMAGES':
      {
        let autoFiles = global.sharedObject.autoFiles
        switch (autoFiles) {
          case 1:
            {
              dialog.showOpenDialog({ properties: ['openDirectory', 'createDirectory'] }, (files) => {
                if (files.length > 0) {
                  let dir = files[0]
                  createAllIcons(dir)
                }
              })
            }
            break;
          case 2:
            {
              let dir = global.sharedObject.originalLocation//storage.getItem(`originalLocation`)
              createAllIcons(dir)
            }
            break;
          default:
            {
              let dir = global.sharedObject.autoFilesPath //storage.getItem(`originalLocation`)
              createAllIcons(dir)
            }
        }
        event.sender.send('event_main_to_renderer', arg)
      }
      break;
    case 'EXPORT_TEMPLATE':
      dialog.showOpenDialog({ properties: ['openDirectory', 'createDirectory'] }, (files) => {
        if (files.length > 0) {
          let dir = files[0]
          const newFile_path = path.join(__dirname, 'data/template.json').replace(/\\/g, "\/")
          let data = fs.readFileSync(newFile_path)

          fs.writeFile(path.resolve(dir) + '/template.json', data, function (err) {
            if (err)
              return console.log(err)
          }
          )
        }
      })
      break;
    case 'SELECT_TEMPLATE':
      dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: 'Custom File Type', extensions: ['json'] }] }, function (files) {
        if (files.length > 0) {
          arg.dir = files[0]
          // image = nativeImage.createFromPath(files[0])
          event.sender.send('event_main_to_renderer', arg)
        }
      })
      break;
    case 'GLOBAL_VALUE':
      {
        global.sharedObject = arg.param
      }
      break;
    case 'GLOBAL_VALUE_OGR':
      {
        image = nativeImage.createFromPath( arg.path )

        let arr = arg.path.split("/")
        let path = '/' + arr.splice(1, arr.length - 2).join("/")
        global.sharedObject.originalLocation = path
        storage.setItem('originalLocation', path)
        console.log('path: ' + path)
      }
      break;
    case 'SELECT_DIR':
      {
        dialog.showOpenDialog({ properties: ['openDirectory', 'createDirectory'] }, (files) => {
          if (files.length > 0) {
            arg.dir = files[0]
            event.sender.send('event_main_to_renderer', arg)
          }
        })
      }
      break;
    default:
      console.log('子-主：' + arg.action)
  }
})

//日志打印
ipcMain.on('event_log_to_main', (event, arg) => {
  console.log('log:  ' + JSON.stringify(arg))
})

function userStart() {
  checkConfig()
  createMainWindow()
}

function createMainWindow() {

  if (MainWindow == null) {
    // Create the browser window.
    MainWindow = new BrowserWindow({
      width: 600,
      height: 370,
      resizable: false,
      fullscreenable: false,
      backgroundColor: '#313131',
      titleBarStyle: 'hidden',
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        nodeIntegration: true
      }
    })
  }

  // and load the index.html of the app.
  MainWindow.loadFile('./app/main.html')
  // MainWindow.loadFile('./index.html')

  // Open the DevTools.
  // MainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  MainWindow.on('closed', function () {
    MainWindow = null
  })
}

function createSetWindow() {
  if (SetWindow == null) {
    SetWindow = new BrowserWindow({
      width: 480,
      height: 364,
      resizable: false,
      fullscreenable: false,
      backgroundColor: '#ECECEC',
      titleBarStyle: 'hidden',
      webPreferences: {
        nodeIntegration: true
      },
      show: false,
      parent: MainWindow
    })
  }

  SetWindow.once('ready-to-show', () => {
    SetWindow.show()
  })

  SetWindow.loadFile('./app/set.html')

  SetWindow.on('closed', function () {
    SetWindow = null
    let sharedObject = global.sharedObject
    for (var key in sharedObject) {
      storage.setItem(key, sharedObject[key])
    }
  })
}

function createAllIcons(dir) {

  let checkList = global.sharedObject.checkList //storage.getItem(`checkList`)
  let csFiles = global.sharedObject.csFiles //storage.getItem(`csFiles`)
  // let autoFiles = storage.getItem(`autoFiles`)
  // let autoFilesPath = storage.getItem(`autoFilesPath`)
  let quality = global.sharedObject.quality //storage.getItem(`quality`)
  let scaleFactor = quality / 100.0
  for (const key in checkList) {
    if (checkList.hasOwnProperty(key)) {
      const element = checkList[key]
      let jsonPath = 'data/' + element + '.json'
      let newFile_path = path.join(__dirname, jsonPath).replace(/\\/g, "\/")
      if (!createIcons(newFile_path, dir + '/' + element + '/', scaleFactor)) return
    }
  }
  //自定义的两个文件
  if (csFiles[0].length > 0) createIcons(csFiles[0], dir + '/cs0/', scaleFactor)
  if (csFiles[1].length > 0) createIcons(csFiles[1], dir + '/cs1/', scaleFactor)
}

function createIcons(newFile_path, dirPath, scaleFactor) {

  //获取本地json文件的路径
  // const newFile_path = path.join(__dirname, 'data/iOS.json').replace(/\\/g, "\/")
  // let newFile_path = path.join(__dirname, jsonPath).replace(/\\/g, "\/")
  // fs.exists(newFile_path, function (exists) {
  fs.exists(newFile_path, function (exists) {
    if (!exists) {
      $(".errorInformation").show();
      $(".errorInformation").text("查找失败，本地文件不存在!");
      return 0
    } else {
      //读取本地的json文件
      // let dir = '/Users/lys/Desktop/imageSize/iOS/'
      fs.mkdir(dirPath, function (err) {
        if (err)
          return console.log(err)
      }
      )
      let result = JSON.parse(fs.readFileSync(newFile_path))
      let images = result['images']
      for (var i in images) {
        let size = images[i]['size'].split("x")[0]
        let scale = images[i]['scale'].split("x")[0]
        let w = size * scale

        let iImage = image.resize({ width: w, height: w })
        let imageData = iImage.toPNG([scaleFactor])
        let imageName = scale == 1 ? 'Icon-' + size + '.png' : 'Icon-' + size + '@' + images[i]['scale'] + '.png'
        images[i]["filename"] = imageName
        fs.writeFile(path.resolve(dirPath + imageName), imageData, function (err) {
          if (err)
            return console.log(err)
        }
        )
      }

      fs.writeFile(path.resolve(dirPath + 'Contents.json'), JSON.stringify(result), function (err) {
        if (err)
          return console.log(err)
      }
      )
    }
  })
  return 1
}

function checkConfig() {
  // storage.setItem('init', '')
  let init = storage.getItem(`init`)
  if (!init) {
    let newFile_path = path.join(__dirname, 'data/config.json').replace(/\\/g, "\/");
    let result = JSON.parse(fs.readFileSync(newFile_path))
    for (var key in result) {
      storage.setItem(key, result[key])
    }
    storage.setItem('init', '1')
  }
  global.sharedObject = storage.getAll() //放置全局变量
}