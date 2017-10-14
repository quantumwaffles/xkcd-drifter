var index = 1;
var max = 1896;
var canvas = null;
var ctx = null;
var images = [];
var last = 0;
var lastFrame = 0;
var accumulatedDelta = 0;
var scrollSpeed = 0.3;
var fps = 0.0;
var currentFrameRate = 0;
var showFps = false;
var spawnRate = 2;
var schemeColor = [0, 0, 0];
var msg = "";
var fade = 20;
var direction = 4;
var pinnedImage = null;
var trippy = 0;

function init() {
    canvas = document.getElementById("wp");
    canvas.addEventListener("click", onClick, false);

    $("#wp").attr({
        width: $(document).width(),
        height: $(document).height()
    });

    ctx = canvas.getContext("2d");
    spawnImage();

    window.requestAnimationFrame(run);
}

function onClick(e) {
    var x = e.clientX;
    var y = e.clientY;
    if(pinnedImage) {
        images.push(pinnedImage);
        pinnedImage.setDirection(direction);
        var hit = pinnedImage.hit(x, y);
        pinnedImage = null;
        if(hit) {
            return;
        }
    }
    
    for(var i = images.length-1; i >= 0; i--) {
        var image = images[i];        
        if(image.hit(x, y)) {
            images.splice(i, 1);
            image.xdir = 0;
            image.ydir = 0;
            pinnedImage = image;
            break;
        }
    }
}


function update(delta) {                
    images.forEach(function(img) {
        img.update(delta);                                        
    });  

    images = images.filter(function(img) {
        return img.isVisible();
    });
}


function draw() {    
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgb('+schemeColor+')';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    images.forEach(function(img) {
        img.draw(ctx);
        
        // Trippy Colors
        if(trippy) {
            if(!img.hue) {
                img.hue = 0;
            }        
            ctx.fillStyle = 'hsla('+img.hue+', 100%, 50%, '+ trippy / 10.0 +')';
            img.hue = (img.hue + trippy) % 360;
            ctx.fillRect(img.x, img.y, img.image.width, img.image.height);
        }
    });       
    
    // Dimmer
    ctx.fillStyle = 'rgba('+schemeColor+', '+fade/100.0+')';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Fuzzy edges
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.filter = 'blur(3px)';
    var s = 4;
    ctx.fillRect(canvas.width - s, -s, s*2, canvas.height + s*2); // right
    ctx.fillRect(-s, -s, s*2, canvas.height + s*2); // left
    ctx.fillRect(-s, -s, canvas.width + s*2, s*2); // top
    ctx.fillRect(-s, canvas.height - s, canvas.width + s*2, s*2); // bottom
    ctx.filter = 'none';
    
    // Pinned Image
    if(pinnedImage) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.40)';
        ctx.filter = 'blur(5px)';
        ctx.fillRect(pinnedImage.x - 5, pinnedImage.y - 5, pinnedImage.image.width + 15, pinnedImage.image.height + 20);
        ctx.filter = 'none';
        pinnedImage.draw(ctx);
    }

    // Show FPS box
    if(showFps) {
        var fpsBoxWidth = 100;
        var fpsBoxHeight = 30;
        var fpsBoxPad = 10;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';                
        ctx.fillRect(canvas.width - fpsBoxWidth, 0, fpsBoxWidth, fpsBoxHeight);
        ctx.font = '22px Consolas';
        ctx.fillStyle = 'rgb(255, 255, 255)';                
        ctx.fillText(currentFrameRate + " fps", canvas.width - fpsBoxWidth + fpsBoxPad, fpsBoxHeight - fpsBoxPad, fpsBoxWidth - fpsBoxPad);
    }
    
    if(msg) {
        ctx.fillStyle = 'rgb(255, 0, 0)';
        ctx.font = '44px Consolas';
        ctx.fillText(msg, 10, canvas.height / 2.0, canvas.width - 20);
    }
    
}


function randBetween(min, max) {
    return (Math.random() * (max - min) + min);
}


function run() {
    window.requestAnimationFrame(run);                

    var now = performance.now() / 1000.0;

    if(fps > 0) {
        var dt = now - last;
        last = now;

        accumulatedDelta += dt;
        if(accumulatedDelta < (1.0 / fps)) {
            return;
        }
        accumulatedDelta -= (1.0 / fps);
    }    

    var delta = now - lastFrame;
    lastFrame = now;

    currentFrameRate = (1.0 / delta).toFixed(1);
    //currentFrameRate = images.length;

    update(delta);
    draw();  
}


function spawnImage() {
    images.push(new XkcdImage(
        Math.floor(randBetween(1, max+1)), 
        canvas.width, 
        canvas.height,
        randBetween(20 * scrollSpeed, 160 * scrollSpeed),
        direction));
    window.setTimeout(spawnImage, spawnRate*randBetween(800, 1200));
}



window.wallpaperPropertyListener = {
    applyUserProperties: function(properties) {
        if(properties.schemecolor) {            
            schemeColor = properties.schemecolor.value
                .split(' ')
                .map(function(c) { return Math.ceil(c * 255); });
        }
        
        if(properties.scrollSpeed) {
            scrollSpeed = properties.scrollSpeed.value;
            images.forEach(function(image) {
                image.speed = randBetween(20 * scrollSpeed, 160 * scrollSpeed);
            });
        }
        
        if(properties.fpsLimit) {
            fps = properties.fpsLimit.value;
        }
        
        if(properties.showFps) {
            showFps = properties.showFps.value;
        }
        
        if(properties.spawnRate) {
            spawnRate = properties.spawnRate.value;
        }
        
        if(properties.fade) {
            fade = properties.fade.value;
        }
        
        if(properties.direction) {
            direction = properties.direction.value;
            images.forEach(function(image) {
                image.setDirection(direction);
            });            
        }
        
        if(properties.trippy) {
            trippy = properties.trippy.value;
        }
    }
};