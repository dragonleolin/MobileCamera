var takeSnapshotUI = createClickFeedbackUI();

var video;
var takePhotoButton;
var toggleFullScreenButton;
var switchCameraButton;
var amountOfCameras = 0;
var currentFacingMode = "environment";

document.addEventListener("DOMContentLoaded", function(event) {
  // do some WebRTC checks before creating the interface
  DetectRTC.load(function() {
    // do some checks
    if (DetectRTC.isWebRTCSupported == false) {
      alert(
        "Please use Chrome, Firefox, iOS 11, Android 5 or higher, Safari 11 or higher"
      );
    } else {
      if (DetectRTC.hasWebcam == false) {
        alert("Please install an external webcam device.");
      } else {
        amountOfCameras = DetectRTC.videoInputDevices.length;

        initCameraUI();
        initCameraStream();
      }
    }

    console.log(
      "RTC Debug info: " +
        "\n OS:                   " +
        DetectRTC.osName +
        " " +
        DetectRTC.osVersion +
        "\n browser:              " +
        DetectRTC.browser.fullVersion +
        " " +
        DetectRTC.browser.name +
        "\n is Mobile Device:     " +
        DetectRTC.isMobileDevice +
        "\n has webcam:           " +
        DetectRTC.hasWebcam +
        "\n has permission:       " +
        DetectRTC.isWebsiteHasWebcamPermission +
        "\n getUserMedia Support: " +
        DetectRTC.isGetUserMediaSupported +
        "\n isWebRTC Supported:   " +
        DetectRTC.isWebRTCSupported +
        "\n WebAudio Supported:   " +
        DetectRTC.isAudioContextSupported +
        "\n is Mobile Device:     " +
        DetectRTC.isMobileDevice
    );
  });
});

function initCameraUI() {
  video = document.getElementById("video");

  takePhotoButton = document.getElementById("takePhotoButton");
  toggleFullScreenButton = document.getElementById("toggleFullScreenButton");
  switchCameraButton = document.getElementById("switchCameraButton");
  uploadImage = document.getElementById("uploadImage");

  // https://developer.mozilla.org/nl/docs/Web/HTML/Element/button
  // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Techniques/Using_the_button_role

  takePhotoButton.addEventListener("click", function() {
    // takeSnapshotUI();
    takeSnapshot();
  });

  uploadImage.addEventListener("click", function(){
    uploadFile()
  });

    // 下载后的文件名规则filename
    // var filename = (new Date()).getTime() + '.' + type;


  // -- fullscreen part

  function fullScreenChange() {
    if (screenfull.isFullscreen) {
      toggleFullScreenButton.setAttribute("aria-pressed", true);
    } else {
      toggleFullScreenButton.setAttribute("aria-pressed", false);
    }
  }

  if (screenfull.enabled) {
    screenfull.on("change", fullScreenChange);

    toggleFullScreenButton.style.display = "block";

    // set init values
    fullScreenChange();

    toggleFullScreenButton.addEventListener("click", function() {
      screenfull.toggle(document.getElementById("container"));
    });
  } else {
    console.log("iOS doesn't support fullscreen (yet)");
  }

  // -- switch camera part
  if (amountOfCameras > 1) {
    switchCameraButton.style.display = "block";

    switchCameraButton.addEventListener("click", function() {
      if (currentFacingMode === "environment") currentFacingMode = "user";
      else currentFacingMode = "environment";

      initCameraStream();
    });
  }

  // Listen for orientation changes to make sure buttons stay at the side of the
  // physical (and virtual) buttons (opposite of camera) most of the layout change is done by CSS media queries
  // https://www.sitepoint.com/introducing-screen-orientation-api/
  // https://developer.mozilla.org/en-US/docs/Web/API/Screen/orientation
  window.addEventListener(
    "orientationchange",
    function() {
      // iOS doesn't have screen.orientation, so fallback to window.orientation.
      // screen.orientation will
      if (screen.orientation) angle = screen.orientation.angle;
      else angle = window.orientation;

      var guiControls = document.getElementById("gui_controls").classList;
      var vidContainer = document.getElementById("vid_container").classList;

      if (angle == 270 || angle == -90) {
        guiControls.add("left");
        vidContainer.add("left");
      } else {
        if (guiControls.contains("left")) guiControls.remove("left");
        if (vidContainer.contains("left")) vidContainer.remove("left");
      }

      //0   portrait-primary
      //180 portrait-secondary device is down under
      //90  landscape-primary  buttons at the right
      //270 landscape-secondary buttons at the left
    },
    false
  );
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

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then(handleSuccess)
    .catch(handleError);

  function handleSuccess(stream) {
    window.stream = stream; // make stream available to browser console
    video.srcObject = stream;

    if (constraints.video.facingMode) {
      if (constraints.video.facingMode === "environment") {
        switchCameraButton.setAttribute("aria-pressed", true);
      } else {
        switchCameraButton.setAttribute("aria-pressed", false);
      }
    }

    return navigator.mediaDevices.enumerateDevices();
  }

  function handleError(error) {
    console.log(error);

    //https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    if (error === "PermissionDeniedError") {
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

//按下拍照鈕，把相片儲存到canvas內
function takeSnapshot() {
  const video = document.querySelector("#video");
  // const canvas = document.querySelector("#camera--sensor");
  // const canvas = document.createElement('canvas')
  const canvas = document.getElementById("camera--sensor");
  const cameraOutput = document.querySelector("#camera--output");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);
  alert("1" )
  //take a picture
  cameraOutput.src = canvas.toDataURL("image/jpeg");
  cameraOutput.classList.add("taken");
  var base64String;
  base64String = cameraOutput.src.substr(22); //取得base64字串
  alert("2" )
  alert("base64String=" + base64String )
  // uploadImage(cameraOutput.src);

 //取出資料並使用atob將資料轉為base64的字串
 const blobBin = atob(cameraOutput.src.split(',')[1]);
 console.log(blobBin);
 alert('4')
 // 取得 mine
 const mime = cameraOutput.src.split(',')[0].split(':')[1].split(';')[0]
 console.log(mime)   // "image/png"

 //建立一個array容器放charCode
 const array = [];
 for (let i=0; i < blobBin.length; i++) {
     array.push(blobBin.charCodeAt(i));
 }

 // 將基礎arr 轉為 ArrayBuffer (usign integer 8): Uint8Array
   const u8 = new Uint8Array(arr)
   const file = new Blob([u8], { type: mime })
   console.log(file)
   // [object Blob] {
   //   size: 3860,
   //   slice: function slice() { [native code] },
   //   type: "image/png"
   // }

   /*
   * 接著這個 file就可以被 FromData使用
   */

   alert("file: ", file)
   const formData = new FormData()
   formData.append('file', file, 'test.png')
   alert("upload success")
   for(let field of formData) {



   }
       // ["file", [object File] {
       //   lastModified: 1514901149956,
       //   lastModifiedDate: [object Date] { ... },
       //   name: "test.png",
       //   size: 3860,
       //   slice: function slice() { [native code] },
       //   type: "image/png",
       //   webkitRelativePath: ""
       // }]


  //保存canvas標籤裡的圖片並且按規則重新命名
  //     var type = 'png';

  //     var _fixType = function(type) {
  //        type = type.toLowerCase().replace(/jpg/i, 'jpeg');
  //        var r = type.match(/png|jpeg|bmp|gif/)[0];
  //        return 'image/' + r;
  //    };
}

function uploadFile(cameraOutput) {
  alert('uploadFile');
  alert('1111')
  const canvas = document.getElementById("camera--sensor");
  alert('canvas: ' + typeof(canvas));
  alert('1221')
  const cameraImg = document.querySelector("img");
  alert('cameraImg: ' + typeof(cameraImg));
  cameraOutput.src = canvas.toDataURL("image/jpeg");
  alert('22222')
  alert('cameraOutput.src: ' + typeof(cameraOutput.src));
 
  var settings = {
    "async": true,
    "crossDomain": true,
    "url": "https://console.firebase.google.com/project/project-d4e29/database/project-d4e29/data/image",
    "method": "POST",
    "headers": {
      "Authorization": "Client-ID {{clientId}}"
    },
    "processData": false,
    "contentType": false,
    "mimeType": "multipart/form-data",
    "data": form,
  }

  $.ajax(settings).done(function (response) {
    // get respon string type json
    var res = JSON.parse(response);
    console.log(res.data.link);
  });


}


// https://hackernoon.com/how-to-use-javascript-closures-with-confidence-85cd1f841a6b
// closure; store this in a variable and call the variable as function
// eg. var takeSnapshotUI = createClickFeedbackUI();
// takeSnapshotUI();

function createClickFeedbackUI() {
  // in order to give feedback that we actually pressed a button.
  // we trigger a almost black overlay
  var overlay = document.getElementById("video_overlay"); //.style.display;

  // sound feedback
  var sndClick = new Howl({ src: ["snd/click.mp3"] });

  var overlayVisibility = false;
  var timeOut = 80;

  function setFalseAgain() {
    overlayVisibility = false;
    overlay.style.display = "none";
  }

  return function() {
    if (overlayVisibility == false) {
      sndClick.play();
      overlayVisibility = true;
      overlay.style.display = "block";
      setTimeout(setFalseAgain, timeOut);
            }
        };
    }
