(function () {
  WebFont.load({
    google: {
      families: ['Bungee Shade'],
    },
    fontactive: stroke.bind(null, false),
    fontinactive: stroke.bind(null, true),
    timeout: 2000,
  });

  function stroke(failed) {
    var banner = document.getElementById('hero');
    if (!banner) return;

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    var text = 'Service Mocker';
    var fontFamily = failed ? 'cursive' : 'Bungee Shade, cursive';
    var charSpace = 2;

    var DPR = window.devicePixelRatio || 1;
    var isSmallDevice = window.innerWidth < 768;
    var width = Math.max(600, Math.min(900, window.innerWidth * 0.8));
    var height = 500;
    var fontSize = height;

    // adjust font size
    ctx.font = fontSize + 'px ' + fontFamily;
    var totalSpace = width - (text.length - 1) * charSpace;
    fontSize = fontSize * (totalSpace / ctx.measureText(isSmallDevice ? text.split(' ')[0] : text).width) | 0;
    height = fontSize * (isSmallDevice ? 2.5 : 1.5);

    canvas.width = width * DPR;
    canvas.height = height * DPR;
    canvas.style.maxWidth = width + 'px';
    canvas.style.maxHeight = height + 'px';

    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.textBaseline = isSmallDevice ? 'top' : 'middle';
    ctx.font = fontSize + 'px ' + fontFamily;
    ctx.strokeStyle = ctx.fillStyle = '#3292ab';
    ctx.scale(DPR, DPR);

    var end = false;
    var chars = text.split('');
    var dashLen = fontSize * 2;
    var dashOffset = dashLen;
    var speed = dashLen / 60;
    var alpha = 0;

    function move(cb) {
      var x = 0;
      var y = isSmallDevice ? 0 : height / 2;

      chars.forEach(function (c, i) {
        if (isSmallDevice && c === ' ') {
          x = 0;
          y = fontSize;
          return;
        }

        cb(c, x, y);
        x += ctx.measureText(chars[i]).width + charSpace;
      });
    }

    function stroke() {
      ctx.save();

      ctx.setLineDash([dashLen - dashOffset, dashOffset - speed]);
      dashOffset -= speed;

      move(function (char, x, y) {
        ctx.strokeText(char, x, y);
      });

      ctx.restore();
    }

    function fade() {
      alpha += (1 - alpha) * 0.05;

      if (Math.abs(1 - alpha) < 0.01) {
        end = true;
        alpha = 1;
      }

      move(function (char, x, y) {
        ctx.globalAlpha = alpha;
        ctx.fillText(char, x, y);

        ctx.globalAlpha = 1;
        ctx.strokeText(char, x, y);
      });
    }

    var animationID = null;

    function loop() {
      ctx.clearRect(0, 0, width, height);

      if (dashOffset > 0) {
        stroke();
      } else {
        fade();
      }

      if (!end) {
        animationID = requestAnimationFrame(loop);
      }
    }

    banner.insertBefore(canvas, banner.firstChild);
    banner.parentElement.className = 'show';
    loop();

    canvas.onclick = function () {
      cancelAnimationFrame(animationID);
      dashOffset = dashLen;
      alpha = 0;
      end = false;
      loop();
    };
  }
})();
