"use strict";

class GameScreen
{
  constructor(canvas) {
    this.canvas_ = canvas;

    canvas.addEventListener('mousemove', this._onMouseMove.bind(this));
    canvas.addEventListener('mousedown', this._onMouseDown.bind(this));
    canvas.addEventListener('mouseup', this._onMouseUp.bind(this));

    canvas.addEventListener('touchstart', this._onTouchStart.bind(this));
    canvas.addEventListener('touchend', this._onTouchEnd.bind(this));
    canvas.addEventListener('touchmove', this._onTouchMove.bind(this));
    canvas.addEventListener('touchcancel', this._onTouchCancel.bind(this));

    this.mousePath_ = null;
    this.touchPath_ = null;

    this.callbacks_ = new Map();

    this.eventHelper_ = new EventHelper();

    // Figure out the width/height of the draw area within the canvas, along
    // with the offsets.
    this.aspectRatio_ = 9.0 / 16.0

    let castAreaX = 0;
    let castAreaY = 0;
    let castAreaWidth = 0;
    let castAreaHeight = 0;
    if (this.canvas_.height * this.aspectRatio_ > this.canvas_.width) {
        // Canvas is taller than it needs to be.
        // Cast area is full area at top of screen.
        castAreaX = 0;
        castAreaY = 0;
        castAreaWidth = this.canvas_.width;
        castAreaHeight = castAreaWidth;
    } else {
        // Canvas is wider than it needs to be.
        castAreaWidth = this.canvas_.height * this.aspectRatio_;
        castAreaHeight = castAreaWidth;
        castAreaX = (this.canvas_.width / 2) - (castAreaWidth / 2);
        castAreaY = 0;
    }
    this.castArea_ = new ScreenArea({
        x: castAreaX, y: castAreaY,
        width: castAreaWidth, height: castAreaHeight
    });

    this.boardArea_ = new ScreenArea({
        x: this.castArea_.x,
        y: this.castArea_.y + this.castArea_.height,
        width: this.castArea_.width,
        height: this.canvas_.height - this.castArea_.height
    });
  }

  get width() { return this.canvas_.width; }
  get height() { return this.canvas_.height; }

  getContext() {
    return this.canvas_.getContext("2d");
  }

  normalizePoint({x,y}) {
    // ASSERT: 0 <= x <= 1, 0 <= y <= 1
    let px = (x - this.castArea_.x) / this.castArea_.width;
    let py = (y - this.castArea_.y) / this.castArea_.height;
    return new Point({x: px, y: py});
  }

  specializePoint({x, y}) {
    let px = (x * this.castArea_.width) + this.castArea_.x;
    let py = (y * this.castArea_.height) + this.castArea_.y;
    return new Point({x: px, y: py});
  }

  redrawCastArea(game) {
    this.drawCastAreaOutline(game);
  }
  drawCastAreaOutline(game) {
    let ctx = this.getContext();
    ctx.save();
    ctx.lineWidth = 2;

    ctx.strokeStyle = "rgb(0,0,200)";
    ctx.beginPath();
    ctx.rect(...this.castArea_.asRectArgs());
    ctx.stroke();

    ctx.restore();
  }

  redrawBoardArea(game) {
    this.drawBoardAreaOutline(game);
  }
  drawBoardAreaOutline(game) {
    let ctx = this.getContext();
    ctx.save();
    ctx.lineWidth = 2;

    ctx.strokeStyle = "rgb(0,200,0)";
    ctx.beginPath();
    ctx.rect(...this.boardArea_.asRectArgs());
    ctx.stroke();

    let player = game.thisPlayer;
    let hand = player.hand;
    for (let i = 0; i < hand.size; i++) {
      let ca = this.calculateCardArea(i, hand.size);
      let csa = this.calculateCardSymbolArea(i, hand.size);
      let card = hand.cardAt(i);
      if (!card) {
        ctx.strokeStyle = "rgb(200,180,50)";
        ctx.beginPath();
        ctx.rect(...ca.asRectArgs());
        ctx.stroke();
      } else {
        ctx.fillStyle = "rgb(200,180,50)";
        ctx.beginPath();
        ctx.rect(...ca.asRectArgs());
        ctx.fill();
        ctx.fillStyle = "rgb(200,255,90)";
        ctx.beginPath();
        ctx.rect(...csa.asRectArgs());
        ctx.fill();
        // Draw its pattern.
        ctx.fillStyle = "rgb(200,0,0)";
        ctx.beginPath();
        let prevPoint = null;
        card.spell.pattern.forEachPoint(pt => {
          let specPoint = csa.specializePoint(pt);
          if (!prevPoint) {
            ctx.moveTo(specPoint.x, specPoint.y);
          } else {
            ctx.lineTo(specPoint.x, specPoint.y);
          }
          prevPoint = specPoint;
        });
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  clearScreen(game) {
    let ctx = this.getContext();
    ctx.save();
    ctx.lineWidth = 2;

    ctx.fillStyle = "rgb(200,200,200)";
    ctx.beginPath();
    ctx.rect(0, 0, this.canvas_.width, this.canvas_.height);
    ctx.fill();

    ctx.restore();
  }

  redrawScreen(game) {
    this.clearScreen(game);
    this.redrawCastArea(game);
    this.redrawBoardArea(game);
  }

  // Assuming the player's hand contains |total| cards,
  // return the pixel coordinates for where that card
  // would be rendered.
  calculateCardArea(idx, total) {
    // Max height of card is half the height of the board area.
    let cardHeight = this.boardArea_.height;
    let cardWidth = cardHeight * this.aspectRatio_;

    // We need to fit |total| cards, with space between them and
    // at the edges.  We want at least half-a-card-width between
    // the cards (and half-a-card at the edges).
    let totalWidth = (cardWidth * total) + (cardWidth/2 * (total+1));
    if (totalWidth > this.boardArea_.width) {
        // Restrict the width down.
        cardWidth = (this.boardArea_.width * 2) / (3*total + 1);
        cardHeight = cardWidth / this.aspectRatio_
    }

    let leftover = this.boardArea_.width - (cardWidth * total);
    let betweenSpace = leftover / total;
    let edgeSpace = betweenSpace/2;
    
    // Card i x offset is at:
    //      edgeSpace + (cardWidth + betweenSpace)*i
    let x = edgeSpace + (cardWidth + betweenSpace)*idx;
    let y = (this.boardArea_.height / 2) - (cardHeight / 2);

    x += this.boardArea_.x;
    y += this.boardArea_.y;
    return new ScreenArea({x:x, y:y, width:cardWidth, height:cardHeight});
  }

  calculateCardSymbolArea(idx, total) {
    let cardArea = this.calculateCardArea(idx, total);
    return new ScreenArea({
      x: cardArea.x, y: cardArea.y,
      width: cardArea.width, height: cardArea.width
    });
  }

  _onMouseDown(event) {
    this.mousePath_ = new TracePattern();
    this.mousePath_.addXY(event.offsetX, event.offsetY);
      this._handleTraceStart(this.mousePath_);
  }
  _onMouseMove(event) {
    if (this.mousePath_) {
      this.mousePath_.addXY(event.offsetX, event.offsetY);
      this._handleTraceAddPoint(this.mousePath_);
    }
  }
  _onMouseUp(event) {
    if (this.mousePath_) {
      this.mousePath_.addXY(event.offsetX, event.offsetY);
      this._handleTraceEnd(this.mousePath_);
      this.mousePath_ = null;
    }
  }

  _onTouchStart(event) {
    this.touchPath_ = new TracePattern();
    this.touchPath_.addXY(event.touches[0].clientX, event.touches[0].clientY);
    this._handleTraceStart(this.touchPath_);
  }
  _onTouchMove(event) {
    if (this.touchPath_) {
      this.touchPath_.addXY(event.touches[0].clientX, event.touches[0].clientY);
      this._handleTraceAddPoint(this.touchPath_);
    }
  }
  _onTouchEnd(event) {
    if (this.touchPath_) {
      this._handleTraceEnd(this.touchPath_);
      this.touchPath_ = null;
    }
  }
  _onTouchCancel(event) {
    this.touchPath_ = null;
  }

  _handleTraceStart(tracePattern) {
    this._emit('trace-start', tracePattern);
  }
  _handleTraceAddPoint(tracePattern) {
    this._emit('trace-add-point', tracePattern);
  }
  _handleTraceEnd(tracePattern) {
    this._emit('trace-end', tracePattern);
  }

  _emit(type, ...args) {
    this.eventHelper_.emit(type, ...args);
  }

  addEventListener(type, callback) {
    this.eventHelper_.addEventListener(type, callback);
  }
  removeEventListener(type, callback) {
    this.eventHelper_.removeEventListener(type, callback);
  }

  computeScore(points, callback) {
    let tp = new TracePattern();
    for (let point of points) {
      let np = normalizePoint(point);
      tp.addXY(np.x, np.y);
    }
    return MainCard.spell.pattern.traceScore(tp.normalize(), callback);
  }
}
