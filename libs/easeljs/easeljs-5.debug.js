/*
 * EaselJS
 * Visit http://createjs.com/ for documentation, updates and examples.
 *
 * Copyright (c) 2011 gskinner.com, inc.
 * 
 * Distributed under the terms of the MIT license.
 * http://www.opensource.org/licenses/mit-license.html
 *
 * This notice shall be included in all copies or substantial portions of the Software.
 */
(function (window) {
    var UID = function () {
        throw"UID cannot be instantiated";
    };
    UID._nextID = 0;
    UID.get = function () {
        return UID._nextID++
    };
    window.UID = UID
})(window);
(function (window) {
    var Ticker = function () {
        throw"Ticker cannot be instantiated.";
    };
    Ticker.useRAF = null;
    Ticker.animationTarget = null;
    Ticker._listeners = null;
    Ticker._pauseable = null;
    Ticker._paused = false;
    Ticker._inited = false;
    Ticker._startTime = 0;
    Ticker._pausedTime = 0;
    Ticker._ticks = 0;
    Ticker._pausedTickers = 0;
    Ticker._interval = 50;
    Ticker._lastTime = 0;
    Ticker._times = null;
    Ticker._tickTimes = null;
    Ticker._rafActive = false;
    Ticker._timeoutID = null;
    Ticker.addListener = function (o, pauseable) {
        if (o == null)return;
        if (!Ticker._inited)Ticker.init();
        Ticker.removeListener(o);
        Ticker._pauseable[Ticker._listeners.length] = pauseable == null ? true : pauseable;
        Ticker._listeners.push(o)
    };
    Ticker.init = function () {
        Ticker._inited = true;
        Ticker._times = [];
        Ticker._tickTimes = [];
        Ticker._pauseable = [];
        Ticker._listeners = [];
        Ticker._times.push(Ticker._lastTime = Ticker._startTime = Ticker._getTime());
        Ticker.setInterval(Ticker._interval)
    };
    Ticker.removeListener = function (o) {
        if (Ticker._listeners == null)return;
        var index = Ticker._listeners.indexOf(o);
        if (index != -1) {
            Ticker._listeners.splice(index,
                1);
            Ticker._pauseable.splice(index, 1)
        }
    };
    Ticker.removeAllListeners = function () {
        Ticker._listeners = [];
        Ticker._pauseable = []
    };
    Ticker.setInterval = function (interval) {
        Ticker._interval = interval;
        if (!Ticker._inited)return;
        Ticker._setupTick()
    };
    Ticker.getInterval = function () {
        return Ticker._interval
    };
    Ticker.setFPS = function (value) {
        Ticker.setInterval(1E3 / value)
    };
    Ticker.getFPS = function () {
        return 1E3 / Ticker._interval
    };
    Ticker.getMeasuredFPS = function (ticks) {
        if (Ticker._times.length < 2)return-1;
        if (ticks == null)ticks = Ticker.getFPS() |
            0;
        ticks = Math.min(Ticker._times.length - 1, ticks);
        return 1E3 / ((Ticker._times[0] - Ticker._times[ticks]) / ticks)
    };
    Ticker.setPaused = function (value) {
        Ticker._paused = value
    };
    Ticker.getPaused = function () {
        return Ticker._paused
    };
    Ticker.getTime = function (pauseable) {
        return Ticker._getTime() - Ticker._startTime - (pauseable ? Ticker._pausedTime : 0)
    };
    Ticker.getTicks = function (pauseable) {
        return Ticker._ticks - (pauseable ? Ticker._pausedTickers : 0)
    };
    Ticker._handleAF = function (timeStamp) {
        Ticker._rafActive = false;
        Ticker._setupTick();
        if (timeStamp -
            Ticker._lastTime >= Ticker._interval - 1)Ticker._tick()
    };
    Ticker._handleTimeout = function () {
        Ticker.timeoutID = null;
        Ticker._setupTick();
        Ticker._tick()
    };
    Ticker._setupTick = function () {
        if (Ticker._rafActive || Ticker.timeoutID != null)return;
        if (Ticker.useRAF) {
            var f = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame;
            if (f) {
                f(Ticker._handleAF, Ticker.animationTarget);
                Ticker._rafActive = true;
                return
            }
        }
        Ticker.timeoutID =
            setTimeout(Ticker._handleTimeout, Ticker._interval)
    };
    Ticker._tick = function () {
        Ticker._ticks++;
        var time = Ticker._getTime();
        var elapsedTime = time - Ticker._lastTime;
        var paused = Ticker._paused;
        if (paused) {
            Ticker._pausedTickers++;
            Ticker._pausedTime += elapsedTime
        }
        Ticker._lastTime = time;
        var pauseable = Ticker._pauseable;
        var listeners = Ticker._listeners.slice();
        var l = listeners ? listeners.length : 0;
        for (var i = 0; i < l; i++) {
            var listener = listeners[i];
            if (listener == null || paused && pauseable[i])continue;
            if (listener.tick)listener.tick(elapsedTime,
                paused); else if (listener instanceof Function)listener(elapsedTime, paused)
        }
        Ticker._tickTimes.unshift(Ticker._getTime() - time);
        while (Ticker._tickTimes.length > 100)Ticker._tickTimes.pop();
        Ticker._times.unshift(time);
        while (Ticker._times.length > 100)Ticker._times.pop()
    };
    Ticker._getTime = function () {
        return(new Date).getTime()
    };
    window.Ticker = Ticker
})(window);
(function (window) {
    var MouseEvent = function (type, stageX, stageY, target, nativeEvent) {
        this.initialize(type, stageX, stageY, target, nativeEvent)
    };
    var p = MouseEvent.prototype;
    p.stageX = 0;
    p.stageY = 0;
    p.type = null;
    p.nativeEvent = null;
    p.onMouseMove = null;
    p.onMouseUp = null;
    p.target = null;
    p.initialize = function (type, stageX, stageY, target, nativeEvent) {
        this.type = type;
        this.stageX = stageX;
        this.stageY = stageY;
        this.target = target;
        this.nativeEvent = nativeEvent
    };
    p.clone = function () {
        return new MouseEvent(this.type, this.stageX, this.stageY,
            this.target, this.nativeEvent)
    };
    p.toString = function () {
        return"[MouseEvent (type=" + this.type + " stageX=" + this.stageX + " stageY=" + this.stageY + ")]"
    };
    window.MouseEvent = MouseEvent
})(window);
(function (window) {
    var Matrix2D = function (a, b, c, d, tx, ty) {
        this.initialize(a, b, c, d, tx, ty)
    };
    var p = Matrix2D.prototype;
    Matrix2D.identity = null;
    Matrix2D.DEG_TO_RAD = Math.PI / 180;
    p.a = 1;
    p.b = 0;
    p.c = 0;
    p.d = 1;
    p.tx = 0;
    p.ty = 0;
    p.alpha = 1;
    p.shadow = null;
    p.compositeOperation = null;
    p.initialize = function (a, b, c, d, tx, ty) {
        if (a != null)this.a = a;
        this.b = b || 0;
        this.c = c || 0;
        if (d != null)this.d = d;
        this.tx = tx || 0;
        this.ty = ty || 0
    };
    p.prepend = function (a, b, c, d, tx, ty) {
        var tx1 = this.tx;
        if (a != 1 || b != 0 || c != 0 || d != 1) {
            var a1 = this.a;
            var c1 = this.c;
            this.a = a1 * a +
                this.b * c;
            this.b = a1 * b + this.b * d;
            this.c = c1 * a + this.d * c;
            this.d = c1 * b + this.d * d
        }
        this.tx = tx1 * a + this.ty * c + tx;
        this.ty = tx1 * b + this.ty * d + ty
    };
    p.append = function (a, b, c, d, tx, ty) {
        var a1 = this.a;
        var b1 = this.b;
        var c1 = this.c;
        var d1 = this.d;
        this.a = a * a1 + b * c1;
        this.b = a * b1 + b * d1;
        this.c = c * a1 + d * c1;
        this.d = c * b1 + d * d1;
        this.tx = tx * a1 + ty * c1 + this.tx;
        this.ty = tx * b1 + ty * d1 + this.ty
    };
    p.prependMatrix = function (matrix) {
        this.prepend(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
        this.prependProperties(matrix.alpha, matrix.shadow, matrix.compositeOperation)
    };
    p.appendMatrix = function (matrix) {
        this.append(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
        this.appendProperties(matrix.alpha, matrix.shadow, matrix.compositeOperation)
    };
    p.prependTransform = function (x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY) {
        if (rotation % 360) {
            var r = rotation * Matrix2D.DEG_TO_RAD;
            var cos = Math.cos(r);
            var sin = Math.sin(r)
        } else {
            cos = 1;
            sin = 0
        }
        if (regX || regY) {
            this.tx -= regX;
            this.ty -= regY
        }
        if (skewX || skewY) {
            skewX *= Matrix2D.DEG_TO_RAD;
            skewY *= Matrix2D.DEG_TO_RAD;
            this.prepend(cos * scaleX,
                sin * scaleX, -sin * scaleY, cos * scaleY, 0, 0);
            this.prepend(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), x, y)
        } else this.prepend(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, x, y)
    };
    p.appendTransform = function (x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY) {
        if (rotation % 360) {
            var r = rotation * Matrix2D.DEG_TO_RAD;
            var cos = Math.cos(r);
            var sin = Math.sin(r)
        } else {
            cos = 1;
            sin = 0
        }
        if (skewX || skewY) {
            skewX *= Matrix2D.DEG_TO_RAD;
            skewY *= Matrix2D.DEG_TO_RAD;
            this.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX),
                Math.cos(skewX), x, y);
            this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, 0, 0)
        } else this.append(cos * scaleX, sin * scaleX, -sin * scaleY, cos * scaleY, x, y);
        if (regX || regY) {
            this.tx -= regX * this.a + regY * this.c;
            this.ty -= regX * this.b + regY * this.d
        }
    };
    p.rotate = function (angle) {
        var cos = Math.cos(angle);
        var sin = Math.sin(angle);
        var a1 = this.a;
        var c1 = this.c;
        var tx1 = this.tx;
        this.a = a1 * cos - this.b * sin;
        this.b = a1 * sin + this.b * cos;
        this.c = c1 * cos - this.d * sin;
        this.d = c1 * sin + this.d * cos;
        this.tx = tx1 * cos - this.ty * sin;
        this.ty = tx1 * sin + this.ty *
            cos
    };
    p.skew = function (skewX, skewY) {
        skewX = skewX * Matrix2D.DEG_TO_RAD;
        skewY = skewY * Matrix2D.DEG_TO_RAD;
        this.append(Math.cos(skewY), Math.sin(skewY), -Math.sin(skewX), Math.cos(skewX), 0, 0)
    };
    p.scale = function (x, y) {
        this.a *= x;
        this.d *= y;
        this.tx *= x;
        this.ty *= y
    };
    p.translate = function (x, y) {
        this.tx += x;
        this.ty += y
    };
    p.identity = function () {
        this.alpha = this.a = this.d = 1;
        this.b = this.c = this.tx = this.ty = 0;
        this.shadow = this.compositeOperation = null
    };
    p.invert = function () {
        var a1 = this.a;
        var b1 = this.b;
        var c1 = this.c;
        var d1 = this.d;
        var tx1 =
            this.tx;
        var n = a1 * d1 - b1 * c1;
        this.a = d1 / n;
        this.b = -b1 / n;
        this.c = -c1 / n;
        this.d = a1 / n;
        this.tx = (c1 * this.ty - d1 * tx1) / n;
        this.ty = -(a1 * this.ty - b1 * tx1) / n
    };
    p.isIdentity = function () {
        return this.tx == 0 && this.ty == 0 && this.a == 1 && this.b == 0 && this.c == 0 && this.d == 1
    };
    p.decompose = function (target) {
        if (target == null)target = {};
        target.x = this.tx;
        target.y = this.ty;
        target.scaleX = Math.sqrt(this.a * this.a + this.b * this.b);
        target.scaleY = Math.sqrt(this.c * this.c + this.d * this.d);
        var skewX = Math.atan2(-this.c, this.d);
        var skewY = Math.atan2(this.b, this.a);
        if (skewX == skewY) {
            target.rotation = skewY / Matrix2D.DEG_TO_RAD;
            if (this.a < 0 && this.d >= 0)target.rotation += target.rotation <= 0 ? 180 : -180;
            target.skewX = target.skewY = 0
        } else {
            target.skewX = skewX / Matrix2D.DEG_TO_RAD;
            target.skewY = skewY / Matrix2D.DEG_TO_RAD
        }
        return target
    };
    p.reinitialize = function (a, b, c, d, tx, ty, alpha, shadow, compositeOperation) {
        this.initialize(a, b, c, d, tx, ty);
        this.alpha = alpha || 1;
        this.shadow = shadow;
        this.compositeOperation = compositeOperation;
        return this
    };
    p.appendProperties = function (alpha, shadow, compositeOperation) {
        this.alpha *=
            alpha;
        this.shadow = shadow || this.shadow;
        this.compositeOperation = compositeOperation || this.compositeOperation
    };
    p.prependProperties = function (alpha, shadow, compositeOperation) {
        this.alpha *= alpha;
        this.shadow = this.shadow || shadow;
        this.compositeOperation = this.compositeOperation || compositeOperation
    };
    p.clone = function () {
        var mtx = new Matrix2D(this.a, this.b, this.c, this.d, this.tx, this.ty);
        mtx.shadow = this.shadow;
        mtx.alpha = this.alpha;
        mtx.compositeOperation = this.compositeOperation;
        return mtx
    };
    p.toString = function () {
        return"[Matrix2D (a=" +
            this.a + " b=" + this.b + " c=" + this.c + " d=" + this.d + " tx=" + this.tx + " ty=" + this.ty + ")]"
    };
    Matrix2D.identity = new Matrix2D(1, 0, 0, 1, 0, 0);
    window.Matrix2D = Matrix2D
})(window);
(function (window) {
    var Point = function (x, y) {
        this.initialize(x, y)
    };
    var p = Point.prototype;
    p.x = 0;
    p.y = 0;
    p.initialize = function (x, y) {
        this.x = x == null ? 0 : x;
        this.y = y == null ? 0 : y
    };
    p.clone = function () {
        return new Point(this.x, this.y)
    };
    p.toString = function () {
        return"[Point (x=" + this.x + " y=" + this.y + ")]"
    };
    window.Point = Point
})(window);
(function (window) {
    var Rectangle = function (x, y, width, height) {
        this.initialize(x, y, width, height)
    };
    var p = Rectangle.prototype;
    p.x = 0;
    p.y = 0;
    p.width = 0;
    p.height = 0;
    p.initialize = function (x, y, width, height) {
        this.x = x == null ? 0 : x;
        this.y = y == null ? 0 : y;
        this.width = width == null ? 0 : width;
        this.height = height == null ? 0 : height
    };
    p.clone = function () {
        return new Rectangle(this.x, this.y, this.width, this.height)
    };
    p.toString = function () {
        return"[Rectangle (x=" + this.x + " y=" + this.y + " width=" + this.width + " height=" + this.height + ")]"
    };
    window.Rectangle =
        Rectangle
})(window);
(function (window) {
    var Shadow = function (color, offsetX, offsetY, blur) {
        this.initialize(color, offsetX, offsetY, blur)
    };
    var p = Shadow.prototype;
    Shadow.identity = null;
    p.color = null;
    p.offsetX = 0;
    p.offsetY = 0;
    p.blur = 0;
    p.initialize = function (color, offsetX, offsetY, blur) {
        this.color = color;
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        this.blur = blur
    };
    p.toString = function () {
        return"[Shadow]"
    };
    p.clone = function () {
        return new Shadow(this.color, this.offsetX, this.offsetY, this.blur)
    };
    Shadow.identity = new Shadow("transparent", 0, 0, 0);
    window.Shadow =
        Shadow
})(window);
(function (window) {
    var SpriteSheet = function (data) {
        this.initialize(data)
    };
    var p = SpriteSheet.prototype;
    p.complete = true;
    p.onComplete = null;
    p._animations = null;
    p._frames = null;
    p._images = null;
    p._data = null;
    p._loadCount = 0;
    p._frameHeight = 0;
    p._frameWidth = 0;
    p._numFrames = 0;
    p._regX = 0;
    p._regY = 0;
    p.initialize = function (data) {
        var i, l, o, a;
        if (data == null)return;
        if (data.images && (l = data.images.length) > 0) {
            a = this._images = [];
            for (i = 0; i < l; i++) {
                var img = data.images[i];
                if (!(img instanceof Image)) {
                    var src = img;
                    img = new Image;
                    img.src =
                        src
                }
                a.push(img);
                if (!img.getContext && !img.complete) {
                    this._loadCount++;
                    this.complete = false;
                    (function (o) {
                        img.onload = function () {
                            o._handleImageLoad()
                        }
                    })(this)
                }
            }
        }
        if (data.frames == null); else if (data.frames instanceof Array) {
            this._frames = [];
            a = data.frames;
            for (i = 0, l = a.length; i < l; i++) {
                var arr = a[i];
                this._frames.push({image:this._images[arr[4] ? arr[4] : 0], rect:new Rectangle(arr[0], arr[1], arr[2], arr[3]), regX:arr[5] || 0, regY:arr[6] || 0})
            }
        } else {
            o = data.frames;
            this._frameWidth = o.width;
            this._frameHeight = o.height;
            this._regX =
                o.regX || 0;
            this._regY = o.regY || 0;
            this._numFrames = o.count;
            if (this._loadCount == 0)this._calculateFrames()
        }
        if ((o = data.animations) != null) {
            this._animations = [];
            this._data = {};
            var name;
            for (name in o) {
                var anim = {name:name};
                var obj = o[name];
                if (!isNaN(obj))a = anim.frames = [obj]; else if (obj instanceof Array) {
                    anim.frequency = obj[3];
                    anim.next = obj[2];
                    a = anim.frames = [];
                    for (i = obj[0]; i <= obj[1]; i++)a.push(i)
                } else {
                    anim.frequency = obj.frequency;
                    anim.next = obj.next;
                    a = anim.frames = obj.frames.slice(0)
                }
                anim.next = a.length < 2 || anim.next ==
                    false ? null : anim.next == null || anim.next == true ? name : anim.next;
                if (!anim.frequency)anim.frequency = 1;
                this._animations.push(name);
                this._data[name] = anim
            }
        }
    };
    p.getNumFrames = function (animation) {
        if (animation == null)return this._frames ? this._frames.length : this._numFrames; else {
            var data = this._data[animation];
            if (data == null)return 0; else return data.frames.length
        }
    };
    p.getAnimations = function () {
        return this._animations.slice(0)
    };
    p.getAnimation = function (name) {
        return this._data[name]
    };
    p.getFrame = function (frameIndex) {
        if (this.complete &&
            this._frames && (frame = this._frames[frameIndex]))return frame;
        return null
    };
    p.toString = function () {
        return"[SpriteSheet]"
    };
    p.clone = function () {
        var o = new SpriteSheet;
        o.complete = this.complete;
        o._animations = this._animations;
        o._frames = this._frames;
        o._images = this._images;
        o._data = this._data;
        o._frameHeight = this._frameHeight;
        o._frameWidth = this._frameWidth;
        o._numFrames = this._numFrames;
        o._loadCount = this._loadCount;
        return o
    };
    p._handleImageLoad = function () {
        if (--this._loadCount == 0) {
            this._calculateFrames();
            this.complete =
                true;
            this.onComplete && this.onComplete()
        }
    };
    p._calculateFrames = function () {
        if (this._frames || this._frameWidth == 0)return;
        this._frames = [];
        var ttlFrames = 0;
        var fw = this._frameWidth;
        var fh = this._frameHeight;
        for (var i = 0, imgs = this._images; i < imgs.length; i++) {
            var img = imgs[i];
            var cols = (img.width + 1) / fw | 0;
            var rows = (img.height + 1) / fh | 0;
            var ttl = this._numFrames > 0 ? Math.min(this._numFrames - ttlFrames, cols * rows) : cols * rows;
            for (var j = 0; j < ttl; j++)this._frames.push({image:img, rect:new Rectangle(j % cols * fw, (j / cols | 0) * fh, fw, fh),
                regX:this._regX, regY:this._regY});
            ttlFrames += ttl
        }
        this._numFrames = ttlFrames
    };
    window.SpriteSheet = SpriteSheet
})(window);
(function (window) {
    function Command(f, params) {
        this.f = f;
        this.params = params
    }

    Command.prototype.exec = function (scope) {
        this.f.apply(scope, this.params)
    };
    var Graphics = function () {
        this.initialize()
    };
    var p = Graphics.prototype;
    Graphics.getRGB = function (r, g, b, alpha) {
        if (r != null && b == null) {
            alpha = g;
            b = r & 255;
            g = r >> 8 & 255;
            r = r >> 16 & 255
        }
        if (alpha == null)return"rgb(" + r + "," + g + "," + b + ")"; else return"rgba(" + r + "," + g + "," + b + "," + alpha + ")"
    };
    Graphics.getHSL = function (hue, saturation, lightness, alpha) {
        if (alpha == null)return"hsl(" + hue % 360 + "," +
            saturation + "%," + lightness + "%)"; else return"hsla(" + hue % 360 + "," + saturation + "%," + lightness + "%," + alpha + ")"
    };
    Graphics.BASE_64 = {"A":0, "B":1, "C":2, "D":3, "E":4, "F":5, "G":6, "H":7, "I":8, "J":9, "K":10, "L":11, "M":12, "N":13, "O":14, "P":15, "Q":16, "R":17, "S":18, "T":19, "U":20, "V":21, "W":22, "X":23, "Y":24, "Z":25, "a":26, "b":27, "c":28, "d":29, "e":30, "f":31, "g":32, "h":33, "i":34, "j":35, "k":36, "l":37, "m":38, "n":39, "o":40, "p":41, "q":42, "r":43, "s":44, "t":45, "u":46, "v":47, "w":48, "x":49, "y":50, "z":51, 0:52, 1:53, 2:54, 3:55, 4:56,
        5:57, 6:58, 7:59, 8:60, 9:61, "+":62, "/":63};
    Graphics.STROKE_CAPS_MAP = ["butt", "round", "square"];
    Graphics.STROKE_JOINTS_MAP = ["miter", "round", "bevel"];
    Graphics._ctx = document.createElement("canvas").getContext("2d");
    Graphics.beginCmd = new Command(Graphics._ctx.beginPath, []);
    Graphics.fillCmd = new Command(Graphics._ctx.fill, []);
    Graphics.strokeCmd = new Command(Graphics._ctx.stroke, []);
    p._strokeInstructions = null;
    p._strokeStyleInstructions = null;
    p._fillInstructions = null;
    p._instructions = null;
    p._oldInstructions = null;
    p._activeInstructions = null;
    p._active = false;
    p._dirty = false;
    p.initialize = function () {
        this.clear();
        this._ctx = Graphics._ctx
    };
    p.draw = function (ctx) {
        if (this._dirty)this._updateInstructions();
        var instr = this._instructions;
        for (var i = 0, l = instr.length; i < l; i++)instr[i].exec(ctx)
    };
    p.moveTo = function (x, y) {
        this._activeInstructions.push(new Command(this._ctx.moveTo, [x, y]));
        return this
    };
    p.lineTo = function (x, y) {
        this._dirty = this._active = true;
        this._activeInstructions.push(new Command(this._ctx.lineTo, [x, y]));
        return this
    };
    p.arcTo = function (x1, y1, x2, y2, radius) {
        this._dirty = this._active = true;
        this._activeInstructions.push(new Command(this._ctx.arcTo, [x1, y1, x2, y2, radius]));
        return this
    };
    p.arc = function (x, y, radius, startAngle, endAngle, anticlockwise) {
        this._dirty = this._active = true;
        if (anticlockwise == null)anticlockwise = false;
        this._activeInstructions.push(new Command(this._ctx.arc, [x, y, radius, startAngle, endAngle, anticlockwise]));
        return this
    };
    p.quadraticCurveTo = function (cpx, cpy, x, y) {
        this._dirty = this._active = true;
        this._activeInstructions.push(new Command(this._ctx.quadraticCurveTo,
            [cpx, cpy, x, y]));
        return this
    };
    p.bezierCurveTo = function (cp1x, cp1y, cp2x, cp2y, x, y) {
        this._dirty = this._active = true;
        this._activeInstructions.push(new Command(this._ctx.bezierCurveTo, [cp1x, cp1y, cp2x, cp2y, x, y]));
        return this
    };
    p.rect = function (x, y, w, h) {
        this._dirty = this._active = true;
        this._activeInstructions.push(new Command(this._ctx.rect, [x, y, w, h]));
        return this
    };
    p.closePath = function () {
        if (this._active) {
            this._dirty = true;
            this._activeInstructions.push(new Command(this._ctx.closePath, []))
        }
        return this
    };
    p.clear = function () {
        this._instructions =
            [];
        this._oldInstructions = [];
        this._activeInstructions = [];
        this._strokeStyleInstructions = this._strokeInstructions = this._fillInstructions = null;
        this._active = this._dirty = false;
        return this
    };
    p.beginFill = function (color) {
        if (this._active)this._newPath();
        this._fillInstructions = color ? [new Command(this._setProp, ["fillStyle", color])] : null;
        return this
    };
    p.beginLinearGradientFill = function (colors, ratios, x0, y0, x1, y1) {
        if (this._active)this._newPath();
        var o = this._ctx.createLinearGradient(x0, y0, x1, y1);
        for (var i = 0, l = colors.length; i <
            l; i++)o.addColorStop(ratios[i], colors[i]);
        this._fillInstructions = [new Command(this._setProp, ["fillStyle", o])];
        return this
    };
    p.beginRadialGradientFill = function (colors, ratios, x0, y0, r0, x1, y1, r1) {
        if (this._active)this._newPath();
        var o = this._ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
        for (var i = 0, l = colors.length; i < l; i++)o.addColorStop(ratios[i], colors[i]);
        this._fillInstructions = [new Command(this._setProp, ["fillStyle", o])];
        return this
    };
    p.beginBitmapFill = function (image, repetition) {
        if (this._active)this._newPath();
        repetition = repetition || "";
        var o = this._ctx.createPattern(image, repetition);
        this._fillInstructions = [new Command(this._setProp, ["fillStyle", o])];
        return this
    };
    p.endFill = function () {
        this.beginFill();
        return this
    };
    p.setStrokeStyle = function (thickness, caps, joints, miterLimit) {
        if (this._active)this._newPath();
        this._strokeStyleInstructions = [new Command(this._setProp, ["lineWidth", thickness == null ? "1" : thickness]), new Command(this._setProp, ["lineCap", caps == null ? "butt" : isNaN(caps) ? caps : Graphics.STROKE_CAPS_MAP[caps]]),
            new Command(this._setProp, ["lineJoin", joints == null ? "miter" : isNaN(joints) ? joints : Graphics.STROKE_JOINTS_MAP[joints]]), new Command(this._setProp, ["miterLimit", miterLimit == null ? "10" : miterLimit])];
        return this
    };
    p.beginStroke = function (color) {
        if (this._active)this._newPath();
        this._strokeInstructions = color ? [new Command(this._setProp, ["strokeStyle", color])] : null;
        return this
    };
    p.beginLinearGradientStroke = function (colors, ratios, x0, y0, x1, y1) {
        if (this._active)this._newPath();
        var o = this._ctx.createLinearGradient(x0,
            y0, x1, y1);
        for (var i = 0, l = colors.length; i < l; i++)o.addColorStop(ratios[i], colors[i]);
        this._strokeInstructions = [new Command(this._setProp, ["strokeStyle", o])];
        return this
    };
    p.beginRadialGradientStroke = function (colors, ratios, x0, y0, r0, x1, y1, r1) {
        if (this._active)this._newPath();
        var o = this._ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
        for (var i = 0, l = colors.length; i < l; i++)o.addColorStop(ratios[i], colors[i]);
        this._strokeInstructions = [new Command(this._setProp, ["strokeStyle", o])];
        return this
    };
    p.beginBitmapStroke =
        function (image, repetition) {
            if (this._active)this._newPath();
            repetition = repetition || "";
            var o = this._ctx.createPattern(image, repetition);
            this._strokeInstructions = [new Command(this._setProp, ["strokeStyle", o])];
            return this
        };
    p.endStroke = function () {
        this.beginStroke();
        return this
    };
    p.curveTo = p.quadraticCurveTo;
    p.drawRect = p.rect;
    p.drawRoundRect = function (x, y, w, h, radius) {
        this.drawRoundRectComplex(x, y, w, h, radius, radius, radius, radius);
        return this
    };
    p.drawRoundRectComplex = function (x, y, w, h, radiusTL, radiusTR, radiusBR, radiusBL) {
        this._dirty = this._active = true;
        var pi = Math.PI, arc = this._ctx.arc, lineTo = this._ctx.lineTo;
        this._activeInstructions.push(new Command(this._ctx.moveTo, [x + radiusTL, y]), new Command(lineTo, [x + w - radiusTR, y]), radiusTR >= 0 ? new Command(arc, [x + w - radiusTR, y + radiusTR, radiusTR, -pi / 2, 0]) : new Command(arc, [x + w, y, -radiusTR, pi, pi / 2, true]), new Command(lineTo, [x + w, y + h - radiusBR]), radiusBL >= 0 ? new Command(arc, [x + w - radiusBR, y + h - radiusBR, radiusBR, 0, pi / 2]) : new Command(arc, [x + w, y + h, -radiusBR, -pi / 2, pi, true]), new Command(lineTo,
            [x + radiusBL, y + h]), radiusBL >= 0 ? new Command(arc, [x + radiusBL, y + h - radiusBL, radiusBL, pi / 2, pi]) : new Command(arc, [x, y + h, -radiusBL, 0, -pi / 2, true]), new Command(lineTo, [x, y + radiusTL]), radiusTL >= 0 ? new Command(arc, [x + radiusTL, y + radiusTL, radiusTL, pi, -pi / 2]) : new Command(arc, [x, y, -radiusTL, pi / 2, 0, true]));
        return this
    };
    p.drawCircle = function (x, y, radius) {
        this.arc(x, y, radius, 0, Math.PI * 2);
        return this
    };
    p.drawEllipse = function (x, y, w, h) {
        this._dirty = this._active = true;
        var k = 0.5522848;
        var ox = w / 2 * k;
        var oy = h / 2 * k;
        var xe = x + w;
        var ye =
            y + h;
        var xm = x + w / 2;
        var ym = y + h / 2;
        this._activeInstructions.push(new Command(this._ctx.moveTo, [x, ym]), new Command(this._ctx.bezierCurveTo, [x, ym - oy, xm - ox, y, xm, y]), new Command(this._ctx.bezierCurveTo, [xm + ox, y, xe, ym - oy, xe, ym]), new Command(this._ctx.bezierCurveTo, [xe, ym + oy, xm + ox, ye, xm, ye]), new Command(this._ctx.bezierCurveTo, [xm - ox, ye, x, ym + oy, x, ym]));
        return this
    };
    p.drawPolyStar = function (x, y, radius, sides, pointSize, angle) {
        this._dirty = this._active = true;
        if (pointSize == null)pointSize = 0;
        pointSize = 1 - pointSize;
        if (angle ==
            null)angle = 0; else angle /= 180 / Math.PI;
        var a = Math.PI / sides;
        this._activeInstructions.push(new Command(this._ctx.moveTo, [x + Math.cos(angle) * radius, y + Math.sin(angle) * radius]));
        for (var i = 0; i < sides; i++) {
            angle += a;
            if (pointSize != 1)this._activeInstructions.push(new Command(this._ctx.lineTo, [x + Math.cos(angle) * radius * pointSize, y + Math.sin(angle) * radius * pointSize]));
            angle += a;
            this._activeInstructions.push(new Command(this._ctx.lineTo, [x + Math.cos(angle) * radius, y + Math.sin(angle) * radius]))
        }
        return this
    };
    p.p = p.decodePath =
        function (str) {
            var instructions = [this.moveTo, this.lineTo, this.quadraticCurveTo, this.bezierCurveTo];
            var paramCount = [2, 2, 4, 6];
            var i = 0, l = str.length;
            var params = [];
            var x = 0, y = 0;
            var base64 = Graphics.BASE_64;
            while (i < l) {
                var n = base64[str.charAt(i)];
                var fi = n >> 3;
                var f = instructions[fi];
                if (!f || n & 3)throw"bad path data";
                var pl = paramCount[fi];
                if (!fi)x = y = 0;
                params.length = 0;
                i++;
                var charCount = (n >> 2 & 1) + 2;
                for (var p = 0; p < pl; p++) {
                    var num = base64[str.charAt(i)];
                    var sign = num >> 5 ? -1 : 1;
                    num = (num & 31) << 6 | base64[str.charAt(i + 1)];
                    if (charCount ==
                        3)num = num << 6 | base64[str.charAt(i + 2)];
                    num = sign * num / 10;
                    if (p % 2)x = num += x; else y = num += y;
                    params[p] = num;
                    i += charCount
                }
                f.apply(this, params)
            }
            return this
        };
    p.clone = function () {
        var o = new Graphics;
        o._instructions = this._instructions.slice();
        o._activeInstructions = this._activeInstructions.slice();
        o._oldInstructions = this._oldInstructions.slice();
        if (this._fillInstructions)o._fillInstructions = this._fillInstructions.slice();
        if (this._strokeInstructions)o._strokeInstructions = this._strokeInstructions.slice();
        if (this._strokeStyleInstructions)o._strokeStyleInstructions =
            this._strokeStyleInstructions.slice();
        o._active = this._active;
        o._dirty = this._dirty;
        return o
    };
    p.toString = function () {
        return"[Graphics]"
    };
    p.mt = p.moveTo;
    p.lt = p.lineTo;
    p.at = p.arcTo;
    p.bt = p.bezierCurveTo;
    p.qt = p.quadraticCurveTo;
    p.a = p.arc;
    p.r = p.rect;
    p.cp = p.closePath;
    p.c = p.clear;
    p.f = p.beginFill;
    p.lf = p.beginLinearGradientFill;
    p.rf = p.beginRadialGradientFill;
    p.bf = p.beginBitmapFill;
    p.ef = p.endFill;
    p.ss = p.setStrokeStyle;
    p.s = p.beginStroke;
    p.ls = p.beginLinearGradientStroke;
    p.rs = p.beginRadialGradientStroke;
    p.bs = p.beginBitmapStroke;
    p.es = p.endStroke;
    p.dr = p.drawRect;
    p.rr = p.drawRoundRect;
    p.rc = p.drawRoundRectComplex;
    p.dc = p.drawCircle;
    p.de = p.drawEllipse;
    p.dp = p.drawPolyStar;
    p.p;
    p._updateInstructions = function () {
        this._instructions = this._oldInstructions.slice();
        this._instructions.push(Graphics.beginCmd);
        if (this._fillInstructions)this._instructions.push.apply(this._instructions, this._fillInstructions);
        if (this._strokeInstructions) {
            this._instructions.push.apply(this._instructions, this._strokeInstructions);
            if (this._strokeStyleInstructions)this._instructions.push.apply(this._instructions,
                this._strokeStyleInstructions)
        }
        this._instructions.push.apply(this._instructions, this._activeInstructions);
        if (this._fillInstructions)this._instructions.push(Graphics.fillCmd);
        if (this._strokeInstructions)this._instructions.push(Graphics.strokeCmd)
    };
    p._newPath = function () {
        if (this._dirty)this._updateInstructions();
        this._oldInstructions = this._instructions;
        this._activeInstructions = [];
        this._active = this._dirty = false
    };
    p._setProp = function (name, value) {
        this[name] = value
    };
    window.Graphics = Graphics
})(window);
(function (window) {
    var DisplayObject = function () {
        this.initialize()
    };
    var p = DisplayObject.prototype;
    DisplayObject.suppressCrossDomainErrors = false;
    DisplayObject._hitTestCanvas = document.createElement("canvas");
    DisplayObject._hitTestCanvas.width = DisplayObject._hitTestCanvas.height = 1;
    DisplayObject._hitTestContext = DisplayObject._hitTestCanvas.getContext("2d");
    DisplayObject._nextCacheID = 1;
    p.alpha = 1;
    p.cacheCanvas = null;
    p.id = -1;
    p.mouseEnabled = true;
    p.name = null;
    p.parent = null;
    p.regX = 0;
    p.regY = 0;
    p.rotation = 0;
    p.scaleX =
        1;
    p.scaleY = 1;
    p.skewX = 0;
    p.skewY = 0;
    p.shadow = null;
    p.visible = true;
    p.x = 0;
    p.y = 0;
    p.compositeOperation = null;
    p.snapToPixel = false;
    p.onPress = null;
    p.onClick = null;
    p.onDoubleClick = null;
    p.onMouseOver = null;
    p.onMouseOut = null;
    p.onTick = null;
    p.filters = null;
    p.cacheID = 0;
    p._cacheOffsetX = 0;
    p._cacheOffsetY = 0;
    p._cacheDataURLID = 0;
    p._cacheDataURL = null;
    p._matrix = null;
    p.initialize = function () {
        this.id = UID.get();
        this._matrix = new Matrix2D
    };
    p.isVisible = function () {
        return this.visible && this.alpha > 0 && this.scaleX != 0 && this.scaleY != 0
    };
    p.draw =
        function (ctx, ignoreCache) {
            if (ignoreCache || !this.cacheCanvas)return false;
            ctx.drawImage(this.cacheCanvas, this._cacheOffsetX, this._cacheOffsetY);
            return true
        };
    p.cache = function (x, y, width, height) {
        var cacheCanvas = this.cacheCanvas;
        if (cacheCanvas == null)cacheCanvas = this.cacheCanvas = document.createElement("canvas");
        var ctx = cacheCanvas.getContext("2d");
        cacheCanvas.width = width;
        cacheCanvas.height = height;
        ctx.setTransform(1, 0, 0, 1, -x, -y);
        ctx.clearRect(x, y, cacheCanvas.width, cacheCanvas.height);
        this.draw(ctx, true,
            this._matrix.reinitialize(1, 0, 0, 1, -x, -y));
        this._cacheOffsetX = x;
        this._cacheOffsetY = y;
        this._applyFilters();
        this.cacheID = DisplayObject._nextCacheID++
    };
    p.updateCache = function (compositeOperation) {
        var cacheCanvas = this.cacheCanvas, offX = this._cacheOffsetX, offY = this._cacheOffsetY;
        if (cacheCanvas == null)throw"cache() must be called before updateCache()";
        var ctx = cacheCanvas.getContext("2d");
        ctx.setTransform(1, 0, 0, 1, -offX, -offY);
        if (!compositeOperation)ctx.clearRect(offX, offY, cacheCanvas.width, cacheCanvas.height);
        else ctx.globalCompositeOperation = compositeOperation;
        this.draw(ctx, true);
        if (compositeOperation)ctx.globalCompositeOperation = "source-over";
        this._applyFilters();
        this.cacheID = DisplayObject._nextCacheID++
    };
    p.uncache = function () {
        this._cacheDataURL = this.cacheCanvas = null;
        this.cacheID = this._cacheOffsetX = this._cacheOffsetY = 0
    };
    p.getCacheDataURL = function () {
        if (!this.cacheCanvas)return null;
        if (this.cacheID != this._cacheDataURLID)this._cacheDataURL = this.cacheCanvas.toDataURL();
        return this._cacheDataURL
    };
    p.getStage =
        function () {
            var o = this;
            while (o.parent)o = o.parent;
            if (o instanceof Stage)return o;
            return null
        };
    p.localToGlobal = function (x, y) {
        var mtx = this.getConcatenatedMatrix(this._matrix);
        if (mtx == null)return null;
        mtx.append(1, 0, 0, 1, x, y);
        return new Point(mtx.tx, mtx.ty)
    };
    p.globalToLocal = function (x, y) {
        var mtx = this.getConcatenatedMatrix(this._matrix);
        if (mtx == null)return null;
        mtx.invert();
        mtx.append(1, 0, 0, 1, x, y);
        return new Point(mtx.tx, mtx.ty)
    };
    p.localToLocal = function (x, y, target) {
        var pt = this.localToGlobal(x, y);
        return target.globalToLocal(pt.x,
            pt.y)
    };
    p.setTransform = function (x, y, scaleX, scaleY, rotation, skewX, skewY, regX, regY) {
        this.x = x || 0;
        this.y = y || 0;
        this.scaleX = scaleX == null ? 1 : scaleX;
        this.scaleY = scaleY == null ? 1 : scaleY;
        this.rotation = rotation || 0;
        this.skewX = skewX || 0;
        this.skewY = skewY || 0;
        this.regX = regX || 0;
        this.regY = regY || 0
    };
    p.getConcatenatedMatrix = function (mtx) {
        if (mtx)mtx.identity(); else mtx = new Matrix2D;
        var target = this;
        while (target != null) {
            mtx.prependTransform(target.x, target.y, target.scaleX, target.scaleY, target.rotation, target.skewX, target.skewY,
                target.regX, target.regY);
            mtx.prependProperties(target.alpha, target.shadow, target.compositeOperation);
            target = target.parent
        }
        return mtx
    };
    p.hitTest = function (x, y) {
        var ctx = DisplayObject._hitTestContext;
        var canvas = DisplayObject._hitTestCanvas;
        ctx.setTransform(1, 0, 0, 1, -x, -y);
        this.draw(ctx);
        var hit = this._testHit(ctx);
        canvas.width = 0;
        canvas.width = 1;
        return hit
    };
    p.clone = function () {
        var o = new DisplayObject;
        this.cloneProps(o);
        return o
    };
    p.toString = function () {
        return"[DisplayObject (name=" + this.name + ")]"
    };
    p.cloneProps =
        function (o) {
            o.alpha = this.alpha;
            o.name = this.name;
            o.regX = this.regX;
            o.regY = this.regY;
            o.rotation = this.rotation;
            o.scaleX = this.scaleX;
            o.scaleY = this.scaleY;
            o.shadow = this.shadow;
            o.skewX = this.skewX;
            o.skewY = this.skewY;
            o.visible = this.visible;
            o.x = this.x;
            o.y = this.y;
            o.mouseEnabled = this.mouseEnabled;
            o.compositeOperation = this.compositeOperation;
            if (this.cacheCanvas) {
                o.cacheCanvas = this.cacheCanvas.cloneNode(true);
                o.cacheCanvas.getContext("2d").putImageData(this.cacheCanvas.getContext("2d").getImageData(0, 0, this.cacheCanvas.width,
                    this.cacheCanvas.height), 0, 0)
            }
        };
    p.applyShadow = function (ctx, shadow) {
        shadow = shadow || Shadow.identity;
        ctx.shadowColor = shadow.color;
        ctx.shadowOffsetX = shadow.offsetX;
        ctx.shadowOffsetY = shadow.offsetY;
        ctx.shadowBlur = shadow.blur
    };
    p._tick = function (data) {
        if (this.onTick)this.onTick(data)
    };
    p._testHit = function (ctx) {
        try {
            var hit = ctx.getImageData(0, 0, 1, 1).data[3] > 1
        } catch (e) {
            if (!DisplayObject.suppressCrossDomainErrors)throw"An error has occured. This is most likely due to security restrictions on reading canvas pixel " +
                "data with local or cross-domain images.";
        }
        return hit
    };
    p._applyFilters = function () {
        if (!this.filters || this.filters.length == 0 || !this.cacheCanvas)return;
        var l = this.filters.length;
        var ctx = this.cacheCanvas.getContext("2d");
        var w = this.cacheCanvas.width;
        var h = this.cacheCanvas.height;
        for (var i = 0; i < l; i++)this.filters[i].applyFilter(ctx, 0, 0, w, h)
    };
    window.DisplayObject = DisplayObject
})(window);
(function (window) {
    var Container = function () {
        this.initialize()
    };
    var p = Container.prototype = new DisplayObject;
    p.children = null;
    p.DisplayObject_initialize = p.initialize;
    p.initialize = function () {
        this.DisplayObject_initialize();
        this.children = []
    };
    p.isVisible = function () {
        return this.visible && this.alpha > 0 && this.children.length && this.scaleX != 0 && this.scaleY != 0
    };
    p.DisplayObject_draw = p.draw;
    p.draw = function (ctx, ignoreCache, _mtx) {
        var snap = Stage._snapToPixelEnabled;
        if (this.DisplayObject_draw(ctx, ignoreCache))return true;
        _mtx = _mtx || this._matrix.reinitialize(1, 0, 0, 1, 0, 0, this.alpha, this.shadow, this.compositeOperation);
        var l = this.children.length;
        var list = this.children.slice(0);
        for (var i = 0; i < l; i++) {
            var child = list[i];
            if (!child.isVisible())continue;
            var shadow = false;
            var mtx = child._matrix.reinitialize(_mtx.a, _mtx.b, _mtx.c, _mtx.d, _mtx.tx, _mtx.ty, _mtx.alpha, _mtx.shadow, _mtx.compositeOperation);
            mtx.appendTransform(child.x, child.y, child.scaleX, child.scaleY, child.rotation, child.skewX, child.skewY, child.regX, child.regY);
            mtx.appendProperties(child.alpha,
                child.shadow, child.compositeOperation);
            if (!(child instanceof Container && child.cacheCanvas == null)) {
                if (snap && child.snapToPixel && mtx.a == 1 && mtx.b == 0 && mtx.c == 0 && mtx.d == 1)ctx.setTransform(mtx.a, mtx.b, mtx.c, mtx.d, mtx.tx + 0.5 | 0, mtx.ty + 0.5 | 0); else ctx.setTransform(mtx.a, mtx.b, mtx.c, mtx.d, mtx.tx, mtx.ty);
                ctx.globalAlpha = mtx.alpha;
                ctx.globalCompositeOperation = mtx.compositeOperation || "source-over";
                if (shadow = mtx.shadow)this.applyShadow(ctx, shadow)
            }
            child.draw(ctx, false, mtx);
            if (shadow)this.applyShadow(ctx)
        }
        return true
    };
    p.addChild = function (child) {
        if (child == null)return child;
        var l = arguments.length;
        if (l > 1) {
            for (var i = 0; i < l; i++)this.addChild(arguments[i]);
            return arguments[l - 1]
        }
        if (child.parent)child.parent.removeChild(child);
        child.parent = this;
        this.children.push(child);
        return child
    };
    p.addChildAt = function (child, index) {
        var l = arguments.length;
        if (l > 2) {
            index = arguments[i - 1];
            for (var i = 0; i < l - 1; i++)this.addChildAt(arguments[i], index + i);
            return arguments[l - 2]
        }
        if (child.parent)child.parent.removeChild(child);
        child.parent = this;
        this.children.splice(index,
            0, child);
        return child
    };
    p.removeChild = function (child) {
        var l = arguments.length;
        if (l > 1) {
            var good = true;
            for (var i = 0; i < l; i++)good = good && this.removeChild(arguments[i]);
            return good
        }
        return this.removeChildAt(this.children.indexOf(child))
    };
    p.removeChildAt = function (index) {
        var l = arguments.length;
        if (l > 1) {
            var a = [];
            for (var i = 0; i < l; i++)a[i] = arguments[i];
            a.sort(function (a, b) {
                return b - a
            });
            var good = true;
            for (var i = 0; i < l; i++)good = good && this.removeChildAt(a[i]);
            return good
        }
        if (index < 0 || index > this.children.length - 1)return false;
        var child = this.children[index];
        if (child != null)child.parent = null;
        this.children.splice(index, 1);
        return true
    };
    p.removeAllChildren = function () {
        var kids = this.children;
        while (kids.length)kids.pop().parent = null
    };
    p.getChildAt = function (index) {
        return this.children[index]
    };
    p.sortChildren = function (sortFunction) {
        this.children.sort(sortFunction)
    };
    p.getChildIndex = function (child) {
        return this.children.indexOf(child)
    };
    p.getNumChildren = function () {
        return this.children.length
    };
    p.swapChildrenAt = function (index1, index2) {
        var kids =
            this.children;
        var o1 = kids[index1];
        var o2 = kids[index2];
        if (!o1 || !o2)return;
        kids[index1] = o2;
        kids[index2] = o1
    };
    p.swapChildren = function (child1, child2) {
        var kids = this.children;
        var index1, index2;
        for (var i = 0, l = kids.length; i < l; i++) {
            if (kids[i] == child1)index1 = i;
            if (kids[i] == child2)index2 = i;
            if (index1 != null && index2 != null)break
        }
        if (i == l)return;
        kids[index1] = child2;
        kids[index2] = child1
    };
    p.setChildIndex = function (child, index) {
        var kids = this.children;
        for (var i = 0, l = kids.length; i < l; i++)if (kids[i] == child)break;
        if (i == l || index <
            0 || index > l || i == index)return;
        kids.splice(index, 1);
        if (index < i)i--;
        kids.splice(child, i, 0)
    };
    p.contains = function (child) {
        while (child) {
            if (child == this)return true;
            child = child.parent
        }
        return false
    };
    p.hitTest = function (x, y) {
        return this.getObjectUnderPoint(x, y) != null
    };
    p.getObjectsUnderPoint = function (x, y) {
        var arr = [];
        var pt = this.localToGlobal(x, y);
        this._getObjectsUnderPoint(pt.x, pt.y, arr);
        return arr
    };
    p.getObjectUnderPoint = function (x, y) {
        var pt = this.localToGlobal(x, y);
        return this._getObjectsUnderPoint(pt.x, pt.y)
    };
    p.clone = function (recursive) {
        var o = new Container;
        this.cloneProps(o);
        if (recursive) {
            var arr = o.children = [];
            for (var i = 0, l = this.children.length; i < l; i++) {
                var clone = this.children[i].clone(recursive);
                clone.parent = o;
                arr.push(clone)
            }
        }
        return o
    };
    p.toString = function () {
        return"[Container (name=" + this.name + ")]"
    };
    p._tick = function (data) {
        for (var i = this.children.length - 1; i >= 0; i--) {
            var child = this.children[i];
            if (child._tick)child._tick(data)
        }
        if (this.onTick)this.onTick(data)
    };
    p._getObjectsUnderPoint = function (x, y, arr, mouseEvents) {
        var ctx =
            DisplayObject._hitTestContext;
        var canvas = DisplayObject._hitTestCanvas;
        var mtx = this._matrix;
        var hasHandler = mouseEvents & 1 && (this.onPress || this.onClick || this.onDoubleClick) || mouseEvents & 2 && (this.onMouseOver || this.onMouseOut);
        if (this.cacheCanvas) {
            this.getConcatenatedMatrix(mtx);
            ctx.setTransform(mtx.a, mtx.b, mtx.c, mtx.d, mtx.tx - x, mtx.ty - y);
            ctx.globalAlpha = mtx.alpha;
            this.draw(ctx);
            if (this._testHit(ctx)) {
                canvas.width = 0;
                canvas.width = 1;
                if (hasHandler)return this
            } else return null
        }
        var l = this.children.length;
        for (var i =
            l - 1; i >= 0; i--) {
            var child = this.children[i];
            if (!child.isVisible() || !child.mouseEnabled)continue;
            if (child instanceof Container) {
                var result;
                if (hasHandler) {
                    result = child._getObjectsUnderPoint(x, y);
                    if (result)return this
                } else {
                    result = child._getObjectsUnderPoint(x, y, arr, mouseEvents);
                    if (!arr && result)return result
                }
            } else if (!mouseEvents || hasHandler || mouseEvents & 1 && (child.onPress || child.onClick || child.onDoubleClick) || mouseEvents & 2 && (child.onMouseOver || child.onMouseOut)) {
                child.getConcatenatedMatrix(mtx);
                ctx.setTransform(mtx.a,
                    mtx.b, mtx.c, mtx.d, mtx.tx - x, mtx.ty - y);
                ctx.globalAlpha = mtx.alpha;
                child.draw(ctx);
                if (!this._testHit(ctx))continue;
                canvas.width = 0;
                canvas.width = 1;
                if (hasHandler)return this; else if (arr)arr.push(child); else return child
            }
        }
        return null
    };
    window.Container = Container
})(window);
(function (window) {
    var Stage = function (canvas) {
        this.initialize(canvas)
    };
    var p = Stage.prototype = new Container;
    Stage._snapToPixelEnabled = false;
    p.autoClear = true;
    p.canvas = null;
    p.mouseX = null;
    p.mouseY = null;
    p.onMouseMove = null;
    p.onMouseUp = null;
    p.onMouseDown = null;
    p.snapToPixelEnabled = false;
    p.mouseInBounds = false;
    p.tickOnUpdate = true;
    p._activeMouseEvent = null;
    p._activeMouseTarget = null;
    p._mouseOverIntervalID = null;
    p._mouseOverX = 0;
    p._mouseOverY = 0;
    p._mouseOverTarget = null;
    p.Container_initialize = p.initialize;
    p.initialize =
        function (canvas) {
            this.Container_initialize();
            this.canvas = canvas instanceof HTMLCanvasElement ? canvas : document.getElementById(canvas);
            this._enableMouseEvents(true)
        };
    p.update = function (data) {
        if (!this.canvas)return;
        if (this.autoClear)this.clear();
        Stage._snapToPixelEnabled = this.snapToPixelEnabled;
        if (this.tickOnUpdate)this._tick(data);
        this.draw(this.canvas.getContext("2d"), false, this.getConcatenatedMatrix(this._matrix))
    };
    p.tick = p.update;
    p.clear = function () {
        if (!this.canvas)return;
        var ctx = this.canvas.getContext("2d");
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    };
    p.toDataURL = function (backgroundColor, mimeType) {
        if (!mimeType)mimeType = "image/png";
        var ctx = this.canvas.getContext("2d");
        var w = this.canvas.width;
        var h = this.canvas.height;
        var data;
        if (backgroundColor) {
            data = ctx.getImageData(0, 0, w, h);
            var compositeOperation = ctx.globalCompositeOperation;
            ctx.globalCompositeOperation = "destination-over";
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, w, h)
        }
        var dataURL = this.canvas.toDataURL(mimeType);
        if (backgroundColor) {
            ctx.clearRect(0, 0, w, h);
            ctx.putImageData(data, 0, 0);
            ctx.globalCompositeOperation = compositeOperation
        }
        return dataURL
    };
    p.enableMouseOver = function (frequency) {
        if (this._mouseOverIntervalID) {
            clearInterval(this._mouseOverIntervalID);
            this._mouseOverIntervalID = null
        }
        if (frequency == null)frequency = 20; else if (frequency <= 0)return;
        var o = this;
        this._mouseOverIntervalID = setInterval(function () {
            o._testMouseOver()
        }, 1E3 / Math.min(50, frequency));
        this._mouseOverX = NaN;
        this._mouseOverTarget = null
    };
    p.clone = function () {
        var o =
            new Stage(null);
        this.cloneProps(o);
        return o
    };
    p.toString = function () {
        return"[Stage (name=" + this.name + ")]"
    };
    p._enableMouseEvents = function () {
        var o = this;
        var evtTarget = window.addEventListener ? window : document;
        evtTarget.addEventListener("mouseup", function (e) {
            o._handleMouseUp(e)
        }, false);
        evtTarget.addEventListener("mousemove", function (e) {
            o._handleMouseMove(e)
        }, false);
        evtTarget.addEventListener("dblclick", function (e) {
            o._handleDoubleClick(e)
        }, false);
        if (this.canvas)this.canvas.addEventListener("mousedown", function (e) {
                o._handleMouseDown(e)
            },
            false)
    };
    p._handleMouseMove = function (e) {
        if (!this.canvas) {
            this.mouseX = this.mouseY = null;
            return
        }
        if (!e)e = window.event;
        var inBounds = this.mouseInBounds;
        this._updateMousePosition(e.pageX, e.pageY);
        if (!inBounds && !this.mouseInBounds)return;
        var evt = new MouseEvent("onMouseMove", this.mouseX, this.mouseY, this, e);
        if (this.onMouseMove)this.onMouseMove(evt);
        if (this._activeMouseEvent && this._activeMouseEvent.onMouseMove)this._activeMouseEvent.onMouseMove(evt)
    };
    p._updateMousePosition = function (pageX, pageY) {
        var o = this.canvas;
        do {
            pageX -= o.offsetLeft;
            pageY -= o.offsetTop
        } while (o = o.offsetParent);
        this.mouseInBounds = pageX >= 0 && pageY >= 0 && pageX < this.canvas.width && pageY < this.canvas.height;
        if (this.mouseInBounds) {
            this.mouseX = pageX;
            this.mouseY = pageY
        }
    };
    p._handleMouseUp = function (e) {
        var evt = new MouseEvent("onMouseUp", this.mouseX, this.mouseY, this, e);
        if (this.onMouseUp)this.onMouseUp(evt);
        if (this._activeMouseEvent && this._activeMouseEvent.onMouseUp)this._activeMouseEvent.onMouseUp(evt);
        if (this._activeMouseTarget && this._activeMouseTarget.onClick &&
            this._getObjectsUnderPoint(this.mouseX, this.mouseY, null, true, this._mouseOverIntervalID ? 3 : 1) == this._activeMouseTarget)this._activeMouseTarget.onClick(new MouseEvent("onClick", this.mouseX, this.mouseY, this._activeMouseTarget, e));
        this._activeMouseEvent = this._activeMouseTarget = null
    };
    p._handleMouseDown = function (e) {
        if (this.onMouseDown)this.onMouseDown(new MouseEvent("onMouseDown", this.mouseX, this.mouseY, this, e));
        var target = this._getObjectsUnderPoint(this.mouseX, this.mouseY, null, this._mouseOverIntervalID ?
            3 : 1);
        if (target) {
            if (target.onPress instanceof Function) {
                var evt = new MouseEvent("onPress", this.mouseX, this.mouseY, target, e);
                target.onPress(evt);
                if (evt.onMouseMove || evt.onMouseUp)this._activeMouseEvent = evt
            }
            this._activeMouseTarget = target
        }
    };
    p._testMouseOver = function () {
        if (this.mouseX == this._mouseOverX && this.mouseY == this._mouseOverY && this.mouseInBounds)return;
        var target = null;
        if (this.mouseInBounds) {
            target = this._getObjectsUnderPoint(this.mouseX, this.mouseY, null, 3);
            this._mouseOverX = this.mouseX;
            this._mouseOverY =
                this.mouseY
        }
        if (this._mouseOverTarget != target) {
            if (this._mouseOverTarget && this._mouseOverTarget.onMouseOut)this._mouseOverTarget.onMouseOut(new MouseEvent("onMouseOut", this.mouseX, this.mouseY, this._mouseOverTarget));
            if (target && target.onMouseOver)target.onMouseOver(new MouseEvent("onMouseOver", this.mouseX, this.mouseY, target));
            this._mouseOverTarget = target
        }
    };
    p._handleDoubleClick = function (e) {
        if (this.onDoubleClick)this.onDoubleClick(new MouseEvent("onDoubleClick", this.mouseX, this.mouseY, this, e));
        var target =
            this._getObjectsUnderPoint(this.mouseX, this.mouseY, null, this._mouseOverIntervalID ? 3 : 1);
        if (target)if (target.onDoubleClick instanceof Function)target.onDoubleClick(new MouseEvent("onPress", this.mouseX, this.mouseY, target, e))
    };
    window.Stage = Stage
})(window);
(function (window) {
    var Bitmap = function (imageOrUri) {
        this.initialize(imageOrUri)
    };
    var p = Bitmap.prototype = new DisplayObject;
    p.image = null;
    p.snapToPixel = true;
    p.sourceRect = null;
    p.DisplayObject_initialize = p.initialize;
    p.initialize = function (imageOrUri) {
        this.DisplayObject_initialize();
        if (typeof imageOrUri == "string") {
            this.image = new Image;
            this.image.src = imageOrUri
        } else this.image = imageOrUri
    };
    p.isVisible = function () {
        return this.visible && this.alpha > 0 && this.scaleX != 0 && this.scaleY != 0 && this.image && (this.image.complete ||
            this.image.getContext || this.image.readyState >= 2)
    };
    p.DisplayObject_draw = p.draw;
    p.draw = function (ctx, ignoreCache) {
        if (this.DisplayObject_draw(ctx, ignoreCache))return true;
        var rect = this.sourceRect;
        if (rect)ctx.drawImage(this.image, rect.x, rect.y, rect.width, rect.height, 0, 0, rect.width, rect.height); else ctx.drawImage(this.image, 0, 0);
        return true
    };
    p.clone = function () {
        var o = new Bitmap(this.image);
        this.cloneProps(o);
        return o
    };
    p.toString = function () {
        return"[Bitmap (name=" + this.name + ")]"
    };
    window.Bitmap = Bitmap
})(window);
(function (window) {
    var BitmapAnimation = function (spriteSheet) {
        this.initialize(spriteSheet)
    };
    var p = BitmapAnimation.prototype = new DisplayObject;
    p.onAnimationEnd = null;
    p.currentFrame = -1;
    p.currentAnimation = null;
    p.paused = true;
    p.spriteSheet = null;
    p.snapToPixel = true;
    p.offset = 0;
    p.currentAnimationFrame = 0;
    p._advanceCount = 0;
    p._animation = null;
    p.DisplayObject_initialize = p.initialize;
    p.initialize = function (spriteSheet) {
        this.DisplayObject_initialize();
        this.spriteSheet = spriteSheet
    };
    p.isVisible = function () {
        return this.visible &&
            this.alpha > 0 && this.scaleX != 0 && this.scaleY != 0 && this.spriteSheet.complete && this.currentFrame >= 0
    };
    p.DisplayObject_draw = p.draw;
    p.draw = function (ctx, ignoreCache) {
        if (this.DisplayObject_draw(ctx, ignoreCache))return true;
        this._normalizeFrame();
        var o = this.spriteSheet.getFrame(this.currentFrame);
        if (o == null)return;
        var rect = o.rect;
        ctx.drawImage(o.image, rect.x, rect.y, rect.width, rect.height, -o.regX, -o.regY, rect.width, rect.height);
        return true
    };
    p.play = function () {
        this.paused = false
    };
    p.stop = function () {
        this.paused = true
    };
    p.gotoAndPlay = function (frameOrAnimation) {
        this.paused = false;
        this._goto(frameOrAnimation)
    };
    p.gotoAndStop = function (frameOrAnimation) {
        this.paused = true;
        this._goto(frameOrAnimation)
    };
    p.advance = function () {
        if (this._animation)this.currentAnimationFrame++; else this.currentFrame++;
        this._normalizeFrame()
    };
    p.clone = function () {
        var o = new BitmapAnimation(this.spriteSheet);
        this.cloneProps(o);
        return o
    };
    p.toString = function () {
        return"[BitmapAnimation (name=" + this.name + ")]"
    };
    p._tick = function (data) {
        var f = this._animation ?
            this._animation.frequency : 1;
        if (!this.paused && (++this._advanceCount + this.offset) % f == 0)this.advance();
        if (this.onTick)this.onTick(data)
    };
    p._normalizeFrame = function () {
        var a = this._animation;
        if (a)if (this.currentAnimationFrame >= a.frames.length) {
            if (a.next)this._goto(a.next); else {
                this.paused = true;
                this.currentAnimationFrame = a.frames.length - 1;
                this.currentFrame = a.frames[this.currentAnimationFrame]
            }
            if (this.onAnimationEnd)this.onAnimationEnd(this, a.name)
        } else this.currentFrame = a.frames[this.currentAnimationFrame];
        else if (this.currentFrame >= this.spriteSheet.getNumFrames()) {
            this.currentFrame = 0;
            if (this.onAnimationEnd)this.onAnimationEnd(this, null)
        }
    };
    p.DisplayObject_cloneProps = p.cloneProps;
    p.cloneProps = function (o) {
        this.DisplayObject_cloneProps(o);
        o.onAnimationEnd = this.onAnimationEnd;
        o.currentFrame = this.currentFrame;
        o.currentAnimation = this.currentAnimation;
        o.paused = this.paused;
        o.offset = this.offset;
        o._animation = this._animation;
        o.currentAnimationFrame = this.currentAnimationFrame
    };
    p._goto = function (frameOrAnimation) {
        if (isNaN(frameOrAnimation)) {
            var data =
                this.spriteSheet.getAnimation(frameOrAnimation);
            if (data) {
                this.currentAnimationFrame = 0;
                this._animation = data;
                this.currentAnimation = frameOrAnimation;
                this._normalizeFrame()
            }
        } else {
            this.currentAnimation = this._animation = null;
            this.currentFrame = frameOrAnimation
        }
    };
    window.BitmapAnimation = BitmapAnimation
})(window);
(function (window) {
    var Shape = function (graphics) {
        this.initialize(graphics)
    };
    var p = Shape.prototype = new DisplayObject;
    p.graphics = null;
    p.DisplayObject_initialize = p.initialize;
    p.initialize = function (graphics) {
        this.DisplayObject_initialize();
        this.graphics = graphics ? graphics : new Graphics
    };
    p.isVisible = function () {
        return this.visible && this.alpha > 0 && this.scaleX != 0 && this.scaleY != 0 && this.graphics
    };
    p.DisplayObject_draw = p.draw;
    p.draw = function (ctx, ignoreCache) {
        if (this.DisplayObject_draw(ctx, ignoreCache))return true;
        this.graphics.draw(ctx);
        return true
    };
    p.clone = function (recursive) {
        var o = new Shape(recursive && this.graphics ? this.graphics.clone() : this.graphics);
        this.cloneProps(o);
        return o
    };
    p.toString = function () {
        return"[Shape (name=" + this.name + ")]"
    };
    window.Shape = Shape
})(window);
(function (window) {
    var Text = function (text, font, color) {
        this.initialize(text, font, color)
    };
    var p = Text.prototype = new DisplayObject;
    Text._workingContext = document.createElement("canvas").getContext("2d");
    p.text = "";
    p.font = null;
    p.color = null;
    p.textAlign = null;
    p.textBaseline = null;
    p.maxWidth = null;
    p.outline = false;
    p.lineHeight = null;
    p.lineWidth = null;
    p.DisplayObject_initialize = p.initialize;
    p.initialize = function (text, font, color) {
        this.DisplayObject_initialize();
        this.text = text;
        this.font = font;
        this.color = color ? color : "#000"
    };
    p.isVisible = function () {
        return Boolean(this.visible && this.alpha > 0 && this.scaleX != 0 && this.scaleY != 0 && this.text != null && this.text != "")
    };
    p.DisplayObject_draw = p.draw;
    p.draw = function (ctx, ignoreCache) {
        if (this.DisplayObject_draw(ctx, ignoreCache))return true;
        if (this.outline)ctx.strokeStyle = this.color; else ctx.fillStyle = this.color;
        ctx.font = this.font;
        ctx.textAlign = this.textAlign ? this.textAlign : "start";
        ctx.textBaseline = this.textBaseline ? this.textBaseline : "alphabetic";
        var lines = String(this.text).split(/(?:\r\n|\r|\n)/);
        var lineHeight = this.lineHeight == null ? this.getMeasuredLineHeight() : this.lineHeight;
        var y = 0;
        for (var i = 0, l = lines.length; i < l; i++) {
            var w = ctx.measureText(lines[i]).width;
            if (this.lineWidth == null || w < this.lineWidth) {
                this._drawTextLine(ctx, lines[i], y);
                y += lineHeight;
                continue
            }
            var words = lines[i].split(/(\s)/);
            var str = words[0];
            for (var j = 1, jl = words.length; j < jl; j += 2)if (ctx.measureText(str + words[j] + words[j + 1]).width > this.lineWidth) {
                this._drawTextLine(ctx, str, y);
                y += lineHeight;
                str = words[j + 1]
            } else str += words[j] + words[j +
                1];
            this._drawTextLine(ctx, str, y);
            y += lineHeight
        }
        return true
    };
    p.getMeasuredWidth = function () {
        return this._getWorkingContext().measureText(this.text).width
    };
    p.getMeasuredLineHeight = function () {
        return this._getWorkingContext().measureText("M").width * 1.2
    };
    p.clone = function () {
        var o = new Text(this.text, this.font, this.color);
        this.cloneProps(o);
        return o
    };
    p.toString = function () {
        return"[Text (text=" + (this.text.length > 20 ? this.text.substr(0, 17) + "..." : this.text) + ")]"
    };
    p.DisplayObject_cloneProps = p.cloneProps;
    p.cloneProps =
        function (o) {
            this.DisplayObject_cloneProps(o);
            o.textAlign = this.textAlign;
            o.textBaseline = this.textBaseline;
            o.maxWidth = this.maxWidth;
            o.outline = this.outline;
            o.lineHeight = this.lineHeight;
            o.lineWidth = this.lineWidth
        };
    p._getWorkingContext = function () {
        var ctx = Text._workingContext;
        ctx.font = this.font;
        ctx.textAlign = this.textAlign ? this.textAlign : "start";
        ctx.textBaseline = this.textBaseline ? this.textBaseline : "alphabetic";
        return ctx
    };
    p._drawTextLine = function (ctx, text, y) {
        if (this.outline)ctx.strokeText(text, 0, y, this.maxWidth) ||
        65535; else ctx.fillText(text, 0, y, this.maxWidth || 65535)
    };
    window.Text = Text
})(window);
(function (window) {
    var SpriteSheetUtils = function () {
        throw"SpriteSheetUtils cannot be instantiated";
    };
    SpriteSheetUtils._workingCanvas = document.createElement("canvas");
    SpriteSheetUtils._workingContext = SpriteSheetUtils._workingCanvas.getContext("2d");
    SpriteSheetUtils.addFlippedFrames = function (spriteSheet, horizontal, vertical, both) {
        if (!horizontal && !vertical && !both)return;
        var count = 0;
        if (horizontal)SpriteSheetUtils._flip(spriteSheet, ++count, true, false);
        if (vertical)SpriteSheetUtils._flip(spriteSheet, ++count,
            false, true);
        if (both)SpriteSheetUtils._flip(spriteSheet, ++count, true, true)
    };
    SpriteSheetUtils.extractFrame = function (spriteSheet, frame) {
        if (isNaN(frame))frame = spriteSheet.getAnimation(frame).frames[0];
        var data = spriteSheet.getFrame(frame);
        if (!data)return null;
        var r = data.rect;
        var canvas = SpriteSheetUtils._workingCanvas;
        canvas.width = r.width;
        canvas.height = r.height;
        SpriteSheetUtils._workingContext.drawImage(data.image, r.x, r.y, r.width, r.height, 0, 0, r.width, r.height);
        var img = new Image;
        img.src = canvas.toDataURL("image/png");
        return img
    };
    SpriteSheetUtils._flip = function (spriteSheet, count, h, v) {
        var imgs = spriteSheet._images;
        var canvas = SpriteSheetUtils._workingCanvas;
        var ctx = SpriteSheetUtils._workingContext;
        var il = imgs.length / count;
        for (var i = 0; i < il; i++) {
            var src = imgs[i];
            src.__tmp = i;
            canvas.width = src.width;
            canvas.height = src.height;
            ctx.setTransform(h ? -1 : 1, 0, 0, v ? -1 : 1, h ? src.width : 0, v ? src.height : 0);
            ctx.drawImage(src, 0, 0);
            var img = new Image;
            img.src = canvas.toDataURL("image/png");
            img.width = src.width;
            img.height = src.height;
            imgs.push(img)
        }
        var frames =
            spriteSheet._frames;
        var fl = frames.length / count;
        for (i = 0; i < fl; i++) {
            src = frames[i];
            var rect = src.rect.clone();
            img = imgs[src.image.__tmp + il * count];
            var frame = {image:img, rect:rect, regX:src.regX, regY:src.regY};
            if (h) {
                rect.x = img.width - rect.x - rect.width;
                frame.regX = rect.width - src.regX
            }
            if (v) {
                rect.y = img.height - rect.y - rect.height;
                frame.regY = rect.height - src.regY
            }
            frames.push(frame)
        }
        var sfx = "_" + (h ? "h" : "") + (v ? "v" : "");
        var names = spriteSheet._animations;
        var data = spriteSheet._data;
        var al = names.length / count;
        for (i = 0; i < al; i++) {
            var name =
                names[i];
            src = data[name];
            var anim = {name:name + sfx, frequency:src.frequency, next:src.next, frames:[]};
            if (src.next)anim.next += sfx;
            frames = src.frames;
            for (var j = 0, l = frames.length; j < l; j++)anim.frames.push(frames[j] + fl * count);
            data[anim.name] = anim;
            names.push(anim.name)
        }
    };
    window.SpriteSheetUtils = SpriteSheetUtils
})(window);
(function (window) {
    var DOMElement = function (htmlElement) {
        this.initialize(htmlElement)
    };
    var p = DOMElement.prototype = new DisplayObject;
    p.htmlElement = null;
    p._style = null;
    p.DisplayObject_initialize = p.initialize;
    p.initialize = function (htmlElement) {
        if (typeof htmlElement == "string")htmlElement = document.getElementById(htmlElement);
        this.DisplayObject_initialize();
        this.mouseEnabled = false;
        this.htmlElement = htmlElement;
        if (htmlElement) {
            this._style = htmlElement.style;
            this._style.position = "absolute";
            this._style.transformOrigin =
                this._style.webkitTransformOrigin = this._style.msTransformOrigin = this._style.MozTransformOrigin = "0% 0%"
        }
    };
    p.isVisible = function () {
        return this.htmlElement != null
    };
    p.draw = function (ctx, ignoreCache) {
        if (this.htmlElement == null)return;
        var mtx = this._matrix;
        var o = this.htmlElement;
        o.style.opacity = "" + mtx.alpha;
        o.style.visibility = this.visible ? "visible" : "hidden";
        o.style.transform = o.style.webkitTransform = o.style.oTransform = o.style.msTransform = ["matrix(" + mtx.a, mtx.b, mtx.c, mtx.d, mtx.tx, mtx.ty + ")"].join(",");
        o.style.MozTransform =
            ["matrix(" + mtx.a, mtx.b, mtx.c, mtx.d, mtx.tx + "px", mtx.ty + "px)"].join(",");
        return true
    };
    p.cache = function () {
    };
    p.uncache = function () {
    };
    p.updateCache = function () {
    };
    p.hitTest = function () {
    };
    p.localToGlobal = function () {
    };
    p.globalToLocal = function () {
    };
    p.localToLocal = function () {
    };
    p.clone = function () {
        var o = new DOMElement;
        this.cloneProps(o);
        return o
    };
    p.toString = function () {
        return"[DOMElement (name=" + this.name + ")]"
    };
    p._tick = function (data) {
        if (this.htmlElement == null)return;
        this.htmlElement.style.visibility = "hidden";
        if (this.onTick)this.onTick(data)
    };
    window.DOMElement = DOMElement
})(window);
(function (window) {
    var Filter = function () {
        this.initialize()
    };
    var p = Filter.prototype;
    p.initialize = function () {
    };
    p.getBounds = function () {
        return new Rectangle(0, 0, 0, 0)
    };
    p.applyFilter = function (ctx, x, y, width, height, targetCtx, targetX, targetY) {
    };
    p.toString = function () {
        return"[Filter]"
    };
    p.clone = function () {
        return new Filter
    };
    window.Filter = Filter
})(window);
(function (window) {
    var Touch = function () {
        throw"Touch cannot be instantiated";
    };
    Touch.isSupported = function () {
        return"ontouchstart"in window
    };
    Touch.enable = function (stage) {
        if (stage == null || !Touch.isSupported())return;
        var o = stage;
        o._primaryTouchId = -1;
        o._handleTouchMoveListener = null;
        o.canvas.addEventListener("touchstart", function (e) {
            Touch._handleTouchStart(o, e)
        }, false);
        document.addEventListener("touchend", function (e) {
            Touch._handleTouchEnd(o, e)
        }, false)
    };
    Touch._handleTouchStart = function (stage, e) {
        e.preventDefault();
        if (stage._primaryTouchId != -1)return;
        stage._handleTouchMoveListener = stage._handleTouchMoveListener || function (e) {
            Touch._handleTouchMove(stage, e)
        };
        document.addEventListener("touchmove", stage._handleTouchMoveListener, false);
        var touch = e.changedTouches[0];
        stage._primaryTouchId = touch.identifier;
        stage._updateMousePosition(touch.pageX, touch.pageY);
        stage._handleMouseDown(touch)
    };
    Touch._handleTouchMove = function (stage, e) {
        var touch = Touch._findPrimaryTouch(stage, e.changedTouches);
        if (touch)stage._handleMouseMove(touch)
    };
    Touch._handleTouchEnd = function (stage, e) {
        var touch = Touch._findPrimaryTouch(stage, e.changedTouches);
        if (touch) {
            stage._primaryTouchId = -1;
            stage._handleMouseUp(touch);
            document.removeEventListener("touchmove", stage._handleTouchMoveListener);
            stage._handleTouchMoveListener = null
        }
    };
    Touch._findPrimaryTouch = function (stage, touches) {
        var l = touches.length;
        for (var i = 0; i < l; i++) {
            var touch = touches[i];
            if (touch.identifier == stage._primaryTouchId)return touch
        }
        return null
    };
    window.Touch = Touch
})(window);
