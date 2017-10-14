class XkcdImage {    
    constructor(imageIndex, width, height, speed, direction) {
        this.xdir = 0;
        this.ydir = 0;
        this.ready = false;
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.y = 10;
        this.speed = speed;
        this.image = new Image();
        var my = this;
        this.image.onload = function() {
            my.ready = true;
            
            my.setDirection(direction);
            if(direction === 1) { // from right
                my.y = randBetween(0, Math.max(0, my.canvasHeight - this.height));
                my.x = my.canvasWidth;
            } else if(direction === 2) { // from left
                my.y = randBetween(0, Math.max(0, my.canvasHeight - this.height));
                my.x = -this.width;
            } else if(direction === 3) { // from top
                my.x = randBetween(0, Math.max(0, my.canvasWidth - this.width));
                my.y = -this.height;
            } else if(direction === 4) { // from bottom
                my.x = randBetween(0, Math.max(0, my.canvasWidth - this.width));
                my.y = my.canvasHeight;
            }
        }
        this.image.src = 'img/original/xkcd-comic-' + imageIndex + '.png';
    }
    
    hit(x, y) {
        return x > this.left() && x < this.right() && y > this.top() && y < this.bottom();
    }
    
    setDirection(direction) {
        if(direction === 1) { // from right
            this.xdir = -1;
            this.ydir = 0;
        } else if(direction === 2) { // from left
            this.xdir = 1;
            this.ydir = 0;
        } else if(direction === 3) { // from top
            this.xdir = 0;
            this.ydir = 1;
        } else if(direction === 4) { // from bottom
            this.xdir = 0;
            this.ydir = -1;
        }
    }
    
    update(delta) {
        this.x = this.x + this.xdir * this.speed * delta;
        this.y = this.y + this.ydir * this.speed * delta;        
    }
    
    left() {
        return this.x;
    }
    
    right() {
        return this.x + this.image.width;
    }
    
    top() {
        return this.y;
    }
    
    bottom() {
        return this.y + this.image.height;
    }
    
    isVisible() {
        return this.right() > 0 
        && this.left() < this.canvasWidth 
        && this.bottom() > 0 
        && this.top() < this.canvasHeight;
    }
        
    draw(ctx, x, y) {
        if(this.ready) {
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.filter = 'blur(5px)';
            ctx.fillRect(this.x-5, this.y-5, this.image.width+5, this.image.height+5);
            
            ctx.filter = 'none';
            ctx.drawImage(this.image, this.x, this.y);
        }
    }
}