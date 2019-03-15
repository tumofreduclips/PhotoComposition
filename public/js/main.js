const frameCount = 6;
const _diff = 804.5 / 160;
const _imageWidth = 200;
const _imageHeight = 160;
const _aspectRatio = 4 / 3;
const _aspectRatioWidth = 4;
const _aspectRatioHeight = 3;
const _width = 804.5;
const _height = 600;
const _viewWidth = 300;
const _viewDiff = _width / _viewWidth;
const _imagePositioning = 'absolute';
const _expandStep = 40;
const _shrinkStep = 40;

let frames;  
let currentFrame = 0;

let url = new URL(window.location.href);
if(url.searchParams.get('data')) {frames = JSON.parse(url.searchParams.get('data')); loadFrame()}
else frames = [];

window.onload = (evt) => {

  const imgDiv = document.getElementById('images');
  const backgroundDiv = document.getElementById('backgrounds');
  for(let i in imageList) {
    let imgName = imageList[i];
    let imageContainer = createDraggableImage(imgName, i);
    imgDiv.appendChild(imageContainer); 
  }
  for(let i in backgroundList) {
    let imgName = backgroundList[i];
    let backgroundContainer = createBackground(imgName, i);
    backgroundDiv.appendChild(backgroundContainer);
  }
  currentFrame = 0;
  loadFrame();
}
