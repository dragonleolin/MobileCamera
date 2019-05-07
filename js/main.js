var takeSnapshotUI = createClickFeedbackUI();

var video;
var takePhotoButton;
var toggleFullScreenButton;
var switchCameraButton;
var amountOfCameras = 0;
var currentFacingMode = 'environment';


document.addEventListener("DOMContentLoaded", function(event) {

    // do some WebRTC checks before creating the interface
    DetectRTC.load(function() {

        // do some checks
        if (DetectRTC.isWebRTCSupported == false) {
            alert('Please use Chrome, Firefox, iOS 11, Android 5 or higher, Safari 11 or higher');
        }
        else {
            if (DetectRTC.hasWebcam == false) {
                alert('Please install an external webcam device.');
            }
            else {

                amountOfCameras = DetectRTC.videoInputDevices.length;
                       
                initCameraUI();
                initCameraStream();
            } 
        }
        
        console.log("RTC Debug info: " + 
            "\n OS:                   " + DetectRTC.osName + " " + DetectRTC.osVersion + 
            "\n browser:              " + DetectRTC.browser.fullVersion + " " + DetectRTC.browser.name +
            "\n is Mobile Device:     " + DetectRTC.isMobileDevice +
            "\n has webcam:           " + DetectRTC.hasWebcam + 
            "\n has permission:       " + DetectRTC.isWebsiteHasWebcamPermission +       
            "\n getUserMedia Support: " + DetectRTC.isGetUserMediaSupported + 
            "\n isWebRTC Supported:   " + DetectRTC.isWebRTCSupported + 
            "\n WebAudio Supported:   " + DetectRTC.isAudioContextSupported +
            "\n is Mobile Device:     " + DetectRTC.isMobileDevice
        );

    });

});

function initCameraUI() {
    
    video = document.getElementById('video');

    takePhotoButton = document.getElementById('takePhotoButton');
    toggleFullScreenButton = document.getElementById('toggleFullScreenButton');
    switchCameraButton = document.getElementById('switchCameraButton');
    uploadImage = document.getElementById('uploadImage');
    
    // https://developer.mozilla.org/nl/docs/Web/HTML/Element/button
    // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_button_role

    takePhotoButton.addEventListener("click", function() {
        // takeSnapshotUI();
        takeSnapshot();        
    });

    uploadImage.addEventListener("click", function() {
        uploadFile();

        // 下载后的文件名规则filename
        // var filename = (new Date()).getTime() + '.' + type;
    });

    // -- fullscreen part

    function fullScreenChange() {
        if(screenfull.isFullscreen) {
            toggleFullScreenButton.setAttribute("aria-pressed", true);
        }
        else {
            toggleFullScreenButton.setAttribute("aria-pressed", false);
        }
    }

    if (screenfull.enabled) {
        screenfull.on('change', fullScreenChange);

        toggleFullScreenButton.style.display = 'block';  

        // set init values
        fullScreenChange();

        toggleFullScreenButton.addEventListener("click", function() {
            screenfull.toggle(document.getElementById('container'));
        });
    }
    else {
        console.log("iOS doesn't support fullscreen (yet)");   
    }
        
    // -- switch camera part
    if(amountOfCameras > 1) {
        
        switchCameraButton.style.display = 'block';
        
        switchCameraButton.addEventListener("click", function() {

            if(currentFacingMode === 'environment') currentFacingMode = 'user';
            else                                    currentFacingMode = 'environment';

            initCameraStream();

        });  
    }

    // Listen for orientation changes to make sure buttons stay at the side of the 
    // physical (and virtual) buttons (opposite of camera) most of the layout change is done by CSS media queries
    // https://www.sitepoint.com/introducing-screen-orientation-api/
    // https://developer.mozilla.org/en-US/docs/Web/API/Screen/orientation
    window.addEventListener("orientationchange", function() {
        
        // iOS doesn't have screen.orientation, so fallback to window.orientation.
        // screen.orientation will 
        if(screen.orientation) angle = screen.orientation.angle;
        else                   angle = window.orientation;

        var guiControls = document.getElementById("gui_controls").classList;
        var vidContainer = document.getElementById("vid_container").classList;

        if(angle == 270 || angle == -90) {
            guiControls.add('left');
            vidContainer.add('left');
        }
        else {
            if ( guiControls.contains('left') ) guiControls.remove('left');
            if ( vidContainer.contains('left') ) vidContainer.remove('left');
        }

        //0   portrait-primary   
        //180 portrait-secondary device is down under
        //90  landscape-primary  buttons at the right
        //270 landscape-secondary buttons at the left
    }, false);
    
}

// https://github.com/webrtc/samples/blob/gh-pages/src/content/devices/input-output/js/main.js
function initCameraStream() {

    // stop any active streams in the window
    if (window.stream) {
        window.stream.getTracks().forEach(function(track) {
            track.stop();
        });
    }

    var constraints = { 
        audio: false, 
        video: {
            //width: { min: 1024, ideal: window.innerWidth, max: 1920 },
            //height: { min: 776, ideal: window.innerHeight, max: 1080 },
            facingMode: currentFacingMode
        }
    };

    navigator.mediaDevices.getUserMedia(constraints).
    then(handleSuccess).catch(handleError);   

    function handleSuccess(stream) {

        window.stream = stream; // make stream available to browser console
        video.srcObject = stream;

        if(constraints.video.facingMode) {

            if(constraints.video.facingMode === 'environment') {
                switchCameraButton.setAttribute("aria-pressed", true);
            }
            else {
                switchCameraButton.setAttribute("aria-pressed", false);
            }
        }

        return navigator.mediaDevices.enumerateDevices();
    }

    function handleError(error) {

        console.log(error);

        //https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
        if(error === 'PermissionDeniedError') {
            alert("Permission denied. Please refresh and give permission.");
        }
        
    }

}

// function takeSnapshot() {
//     // if you'd like to show the canvas add it to the DOM
//     var canvas = document.createElement('canvas');

//     var width = video.videoWidth;
//     var height = video.videoHeight;
//     canvas.width = width;
//     canvas.height = height;

//     context = canvas.getContext('2d');
//     context.drawImage(video, 0, 0, width, height);

//     canvas.getContext("2d").drawImage(video, 0, 0);
//     document.body.appendChild(canvas)
    
//     // https://developers.google.com/web/fundamentals/primers/promises
//     // https://stackoverflow.com/questions/42458849/access-blob-value-outside-of-canvas-toblob-async-function
//     function getCanvasBlob(canvas) {
//         return new Promise(function(resolve, reject) {
//             canvas.toBlob(function(blob) { resolve(blob) }, 'image/jpeg');
//         })
//     }

//     // some API's (like Azure Custom Vision) need a blob with image data
//     getCanvasBlob(canvas).then(function(blob) {

//         // do something with the image blob

//     });

// }

function takeSnapshot() {
    const video = document.querySelector("#video")
    // const canvas = document.querySelector("#camera--sensor");
    // const canvas = document.createElement('canvas')
    const canvas = document.getElementById('camera--sensor')
    const cameraOutput = document.querySelector("#camera--output");

    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);

    //take a picture 
    cameraOutput = canvas.toDataURL("image/jpeg");
    // cameraOutput.classList.add("taken");
    

    //保存canvas標籤裡的圖片並且按規則重新命名
    var type = 'png';
   
    var _fixType = function(type) {
       type = type.toLowerCase().replace(/jpg/i, 'jpeg');
       var r = type.match(/png|jpeg|bmp|gif/)[0];
       return 'image/' + r;
   };
}

function uploadFile() {
        // var reader = new FileReader();
        // var fileSize = Math.round( this.files[0].size/1024/1024) ; //以M為單位
        // var res = reader.readAsDataURL(this.files[0]);
        // //this.files[0] 該資訊包含：圖片的大小，以byte計算 獲取size的方法如下：this.files[0].size;
        // console.log(this.files[0]);
        // reader.onload = function (e) {
        // // 呼叫圖片壓縮方法：
        // compress(res, fileSize);
        // };
        var uploadImage = document.querySelector('#uploadImage');


    
}
    // function compress(res,fileSize) { //res代表上傳的圖片，fileSize大小圖片的大小
    //     // const video = document.querySelector("#video")
    //     // const canvas = document.querySelector("#camera--sensor");
    //     // const cameraOutput = document.querySelector("#camera--output");
    
        
    //     // canvas.width = video.videoWidth;
    //     // canvas.height = video.videoHeight;
    //     // canvas.getContext("2d").drawImage(video, 0, 0);
    
    //     // //take a picture 
    //     // cameraOutput.src = canvas.toDataURL("image/jpeg");

    //     var img = new Image(),
    //     maxW = 640; //設定最大寬度
    //     img.onload = function () {
    //     var cvs = document.querySelector('canvas'),
    //     ctx = cvs.getContext( '2d');
    //     if(img.width > maxW) {
    //     img.height *= maxW / img.width;
    //     img.width = maxW;
    //     }
    //     cvs.width = img.width;
    //     cvs.height = img.height;
    //     ctx.clearRect(0, 0, cvs.width, cvs.height);
    //     ctx.drawImage(img, 0, 0, img.width, img.height);
    //     var compressRate = getCompressRate(1,fileSize);
    //     var dataUrl = cvs.toDataURL( 'image/jpeg', compressRate);
    //     document.body.appendChild(cvs);
    //     console.log(dataUrl);
    //     }
    //     img.src = res;
    //     }
    //     function getCompressRate(allowMaxSize,fileSize){ //計算壓縮比率，size單位為MB
    //     var compressRate = 1;
    //     if(fileSize/allowMaxSize > 4){
    //     compressRate = 0.5;
    //     } else if(fileSize/allowMaxSize >3){
    //     compressRate = 0.6;
    //     } else if(fileSize/allowMaxSize >2){
    //     compressRate = 0.7;
    //     } else if(fileSize > allowMaxSize){
    //     compressRate = 0.8;
    //     } else{
    //     compressRate = 0.9;
    //     }
    //     return compressRate;
    //     }


// https://hackernoon.com/how-to-use-javascript-closures-with-confidence-85cd1f841a6b
// closure; store this in a variable and call the variable as function
// eg. var takeSnapshotUI = createClickFeedbackUI();
// takeSnapshotUI();

function createClickFeedbackUI() {

    // in order to give feedback that we actually pressed a button. 
    // we trigger a almost black overlay
    var overlay = document.getElementById("video_overlay");//.style.display;

    // sound feedback
    var sndClick = new Howl({ src: ['snd/click.mp3'] });

    var overlayVisibility = false;
    var timeOut = 80;

    function setFalseAgain() {
        overlayVisibility = false;	
        overlay.style.display = 'none';
    }

    return function() {

        if(overlayVisibility == false) {
            sndClick.play();
            overlayVisibility = true;
            overlay.style.display = 'block';
            setTimeout(setFalseAgain, timeOut);
        }   

    }
}