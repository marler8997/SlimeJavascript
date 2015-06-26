


// Objects rendered in the slime engine
// need an x and a y parameter

function newBall(radius,color) {
  return {
    radius:radius,
    color:color,
    x:0,
    y:0,
    velocityX:0,
    velocityY:0,
    render: function() {
      var xPix   = this.x * pixelsPerUnit;
      var yPix   = (4 * gameHeight / 5) - (this.y * pixelsPerUnit);

      //yPix /= 2;

      var radiusPix = this.radius * pixelsPerUnit;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(xPix, yPix, radiusPix, 0, 2*Math.PI);
      ctx.fill();
    }
    };
}
function newSlime(radius,color) {
  return {
    radius:radius,
    color:color,
    x:0,
    y:0,
    velocityX:0,
    velocityY:0,
      render: function() {
      var xPix      = this.x * pixelsPerUnit;
      var yPix      = (4 * gameHeight / 5) - (this.y * pixelsPerUnit);

      //yPix /= 2;

      var radiusPix = this.radius * pixelsPerUnit;
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(xPix, yPix, radiusPix, Math.PI, 2*Math.PI);
      ctx.fill();
    }
    };
}
