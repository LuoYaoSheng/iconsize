var EVENT_MAIN_TO_RENDERER = 'event_main_to_renderer';//主 - 子
var EVENT_RENDERER_TO_MAIN = 'event_renderer_to_main';//子 - 主

var EVENT_LOG_TO_MAIN = 'event_log_to_main';//日志打印

function palyAudioDrag(){
    let audio = new Audio()
    audio.src = "./static/music/drag_out.mp3"
    audio.play()
}

function playAudioAccepted(){
    let audio = new Audio()
    audio.src = "./static/music/drop_accepted.mp3"
    audio.play()
}

function playAudioInitiate(){
    let audio = new Audio()
    audio.src = "./static/music/initiate.mp3"
    audio.play()
}

function playAudioCompleted(){
    let audio = new Audio()
    audio.src = "./static/music/compression_completed.mp3"
    audio.play()
}
