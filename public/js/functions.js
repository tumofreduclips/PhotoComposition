// To fix the transormation
let oldX = 0;
let oldY = 0;

// Is viewer on or off
let isViewed = false;

// The selected (active) image
let activeImage = null;

// The image that is in dragging process
let draggingImage = null;

function HandleDragging(evt) { // This = dragged element
    let currentX = evt.pageX,
        currentY = evt.pageY,
        tranformX = currentX - oldX,
        tranformY = currentY - oldY;

    let {x: imageX, y: imageY} = getCoordinates(draggingImage);
    draggingImage.style.left = (imageX + tranformX) + 'px';
    draggingImage.style.top  = (imageY + tranformY) + 'px';

    oldX = evt.pageX;
    oldY = evt.pageY;
}

// Adds an image to the mainPanel and the small representation of the panels
function addImage(evt, x, y, appendSmall = true, size = _imageHeight, flipped=false) {
    const mainPanel = document.getElementsByClassName('mainPanel')[0];
    
    // The big image
    const newElement          = evt.target.cloneNode(true);

    newElement.style.position = _imagePositioning;
    newElement.style.top      = y || '0px'; newElement.style.left = x || '0px';
    newElement.style.height   = size + 'px';
    newElement.onmousedown    = e => e.target.draggable = true;
    newElement.ondragstart    = StartDragging;
    newElement.ondragover     = HandleDragging;
    newElement.ondragend      = EndDragging;
    newElement.onclick        = ActivateImage;

    if(flipped) newElement.classList.add('flipped');

    mainPanel.appendChild(newElement);
    saveFrame();
    
    // Stroing the image's index
    newElement.dataset.index = frames[currentFrame] && frames[currentFrame].data ? frames[currentFrame].data.length - 1 : 0;
    
    // The small image
    const newSmallElement = evt.target.cloneNode(true);
    newSmallElement.style.position = _imagePositioning;
    newSmallElement.style.top = y ? (parseFloat(y) / _diff) + 'px' : '0px';
    newSmallElement.style.left = x ? (parseFloat(x) / _diff) + 'px' : '0px';
    newSmallElement.style.width = 'auto';
    newSmallElement.style.height = (size / _diff) + 'px';
    newSmallElement.onclick = () => { };
    document.getElementById('panel' + currentFrame).appendChild(newSmallElement);

    if(flipped) newSmallElement.classList.add('flipped');

    return newElement;
}

function createDraggableImage(src, index) { // Create a draggable image
    // Container div
    let container = document.createElement('div');
    container.classList.add('image-container');

    // The image
    let img = new Image();
    img.src = `public/images/characters/${src}`;
    img.id = `image${index}`;
    img.classList.add('dragImage');

    container.onclick = () => addImage({target: img});

    // Append image to the container and return the container
    container.appendChild(img);
    return container;
}

function createBackground(src, index) { // Create the background
    // Container div
    let container = document.createElement('div');
    container.classList.add('image-container');

    // The image
    let img = new Image();
    img.src = `public/images/backgrounds/${src}`;
    img.onclick = () => setBackground(src);
    img.id = `background${index}`;
    img.classList.add('dragImage');

    // Append image to the container and return the container
    container.appendChild(img);
    return container;
}

function setBackground(src) { // Set the background
    // Editor panel
    const main = document.getElementsByClassName('mainPanel')[0];

    // Set the background
    main.style.background = `url("images/backgrounds/${src}")`;

    // Save the backgrund 
    frames[currentFrame] = frames[currentFrame] ? frames[currentFrame] : {};
    frames[currentFrame].data = frames[currentFrame].data ? frames[currentFrame].data : [];
    frames[currentFrame].background = src;
}

function saveFrame(index) {
    // Get the index of the frame to save
    index = index ? index : currentFrame;

    // Editor frame
    const frame = document.getElementsByClassName('mainPanel')[0];

    // Frame description (text)
    const desc = document.getElementById('frame-description');

    // Frame to save
    const _frame = { data: [], background: frames[index] && frames[index].background, text: desc.value };
    for (let child of frame.children) {
        _frame.data.push({
            x: child.style.left,
            y: child.style.top,
            size: parseFloat(child.style.height) || _imageHeight,
            id: child.id,
            flipped: child.classList.contains('flipped')
        });
    }
    frames[index] = _frame;
}

function loadFrame(evt, isImport) {
    // If an image was active, store it's index, to restore the state later
    let activeImageIndex;
    if(activeImage) {
        activeImageIndex = activeImage.dataset.index;
    }

    // If called from Import(), no need for save
    if (!isImport) saveFrame();

    // If evt is the panel
    if (evt) if (evt.id.startsWith('panel')) {
        // Get the frame we clicked on
        currentFrame = evt.id.replace('panel', '') * 1;
    }
    // Get the panel which was clicked
    const panel = document.getElementById('panel' + currentFrame);
    // Get the main panel
    const main = document.getElementsByClassName('mainPanel')[0];

    // Clear the background
    main.style.background = '';

    // Clear switch panel
    while (panel.firstChild) {
        panel.removeChild(panel.firstChild);
    }

    // Clear main panel
    while (main.firstChild) {
        main.removeChild(main.firstChild);
    }

    if(panel) panel.style.border = "4px solid #6a9c78";

    const panels = document.getElementsByClassName('panel');
    for(let i in panels) if(panels[i] != panel) if(panels[i] && panels[i].style)panels[i].style.border = "2px solid black";


    // Update the text
    document.getElementById('frame-description').value = frames[currentFrame] && frames[currentFrame].text || '';

    // If no frame under the currentFrame, create a blank frame
    if (!frames[currentFrame]) return frames[currentFrame] = { data: [], background: '', text: frames[currentFrame] && frames[currentFrame].text || '' };

    // If no data in the frame, create the data
    if (!frames[currentFrame].data) return frames[currentFrame].data = [];

    // If frame exists and has data {
    // Set the background
    main.style.background = frames[currentFrame].background ? `url("public/images/backgrounds/${frames[currentFrame].background}")` : 'white';

    // Add the images
    for (let img of frames[currentFrame].data) {
        let newElement = addImage({ target: document.getElementById(img.id) }, img.x, img.y, true, img.size, img.flipped);
    }

    // If an image was active before loadFrame(), activate it
    if (activeImageIndex) activateImage(main.children[activeImageIndex]);
    
    // }
}

function copyToClipboard(str) { // Copy a string to the clipboard
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
};

function Save() { // Save frames to clipboard
    saveFrame();
    copyToClipboard(JSON.stringify(frames));
    if (confirm("Copy frames to clipboard ?")) {
    }
}

function Import() { // Import data via a prompt
    const res = prompt("Insère tes données ici");
    try {
        // Save frames before import
        saveFrame();
        if (!res) throw new Error('This error will be catched, baby.')
        frames = JSON.parse(res); // Parse the data
        for (let i = 1; i < 6; i++) {
            loadFrame(document.getElementsByClassName('panel')[i], true);
        }
        currentFrame = 0;
        loadFrame(document.getElementsByClassName('panel')[currentFrame], true);
    }
    catch (e) { // Wrong data was inserted
        alert("Une erreur s’est produite");
    }
}

function Delete() { // Delete current frame's data
    if(activeImage) { // Delete selected image
        activeImage.parentElement.removeChild(activeImage);
    }
    else { // Delete all
        frames[currentFrame].data = [];
    
        const main = document.getElementsByClassName('mainPanel')[0];
        while(main.firstChild) {
            main.removeChild(main.firstChild);
        }
    }
    
    saveFrame();
    loadFrame();
}

function View() { // Called when the "View" button is clicked
    saveFrame(); // To the the latest changes

    if (isViewed) { // If viewer is on, open editor
        Edit();
    }
    else { // If editor is on, open viewer
        ViewResult();
    }
    return isViewed = !isViewed;
}

function characters() { // Display characters
    document.getElementById('backgrounds').classList.remove('active');
    document.getElementById('images').classList.add('active');
}

function backgrounds() { // Display backgrounds
    document.getElementById('images').classList.remove('active');
    document.getElementById('backgrounds').classList.add('active');
}


function Edit() { // Display the editor
    document.getElementById('app').style.display = 'block';
    document.getElementById('viewer').style.display = 'none';
}



function ViewResult() { // Display the viewer

    // Editor, and viewer
    const editor = document.getElementById('app');
    const viewer = document.getElementById('viewer');

    // Hiding editor, displaying viewer
    editor.style.display = 'none';
    viewer.style.display = 'block';

    // View Panels
    const viewPanels = document.getElementsByClassName('view-panel');
    // View paragraphs
    const viewPs = document.getElementsByClassName('frame_desc');

    for (let i in viewPanels) {
        // Clear old images
        while (viewPanels[i].firstChild) {
            viewPanels[i].removeChild(viewPanels[i].firstChild);
        }

        // Display new images
        if (frames[i] && frames[i].data) {
            for (let img of frames[i].data) {
                const newImage = document.getElementById(img.id).cloneNode(true);
                newImage.style.left = (parseFloat(img.x) / _viewDiff) + 'px';
                newImage.style.top = (parseFloat(img.y) / _viewDiff) + 'px';
                newImage.style.width = 'auto';
                newImage.style.height = (img.size / _viewDiff) + 'px';
                viewPanels[i].appendChild(newImage);
            }
        }

        // Set the background
        viewPanels[i].style && (viewPanels[i].style.background = frames[i] && frames[i].background ? `url("images/backgrounds/${frames[i].background}")` : "white");
        viewPanels[i].style && (viewPanels[i].style.backgroundSize = `${804.5 / _viewDiff}px auto`);

        // Update the description
        viewPs[i].innerText = frames[i] && frames[i].text || '';
    }
}

// Actvate the image controls. Works when an image becomes active
function activateImageControls() {
    const [expand, shrink, flip] = 
    [document.getElementById('expand'), document.getElementById('shrink'), document.getElementById('flip')];
    expand.style.display = 
    shrink.style.display = 
    flip.style.display   = 
    "inline-block";
}

// Disactvate the image controls. Works when all images become inactive
function disactivateImageControls() {
    const [expand, shrink, flip] = 
    [document.getElementById('expand'), document.getElementById('shrink'), document.getElementById('flip')];
    expand.style.display = 
    shrink.style.display = 
    flip.style.display   = 
    "inline-block";
}

// Disactivates all the images. Works when clicked on mainPanel, when an image is selected
// If clicked on mainPanel, disactivates the image controles
function disactivateAllImages(disactivate = true) {
    const allImages = document.getElementsByClassName('mainPanel')[0].children;
    for(let i = 0; i < allImages.length; i++) {
        allImages[i].classList.remove('resize-image');
    }
    activeImage = null;
    disactivate && disactivateImageControls();
}

// Activates an image and the image resize controls
function ActivateImage(evt) {
    // This = image clicked on
    activateImage (this);
    evt.stopImmediatePropagation();
}

function StartDragging (evt) {
    // This = image clicked on
    this.style.draggable = true;
    var dragImage = document.createElement('div');
    dragImage.setAttribute('style', 'position: absolute; left: 0px; top: 0px; width: 40px; height: 40px; background: transparent; z-index: -1');
    document.body.appendChild(dragImage);
    evt.dataTransfer.setDragImage(dragImage, 0, 0); // Void
    oldX = evt.pageX;
    oldY = evt.pageY;
    draggingImage = this;
}

function EndDragging  (evt) {
    this.draggable = false;
    draggingImage = null;
}

function activateImage(imgElement) {
    disactivateAllImages(false);
    imgElement.classList.add('resize-image');
    activeImage = imgElement;
    activateImageControls();
}

function Flip() {
    if(activeImage) {
        if(activeImage.classList.contains('flipped')) {
            activeImage.classList.remove('flipped');   
        } else activeImage.classList.add('flipped');
        saveFrame();
        loadFrame();
    }
}

// Expands the image height by _expandStep pixels
function Expand() {
    if(activeImage) {
        let currentHeight = parseFloat(activeImage.style.height) || _imageHeight;
        let newHeight = currentHeight + _expandStep;
        activeImage.style.height = newHeight + 'px';
        saveFrame();
        loadFrame();
    }
}

// Shrinks the image height by _shrinkStep pixels
function Shrink() {
    if(activeImage) {
        let currentHeight = parseFloat(activeImage.style.height) || _imageHeight;
        let newHeight = currentHeight - _shrinkStep;
        activeImage.style.height = newHeight + 'px';
        saveFrame();
        loadFrame();
    }
}

function getCoordinates(element) {
    return {x: element.style.left.replace('px', '') * 1, y: element.style.top.replace('px', '') * 1,}
}