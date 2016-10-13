"use strict";

let MainGame;
let MainSpellBook;
let MainDeck;
let MainCard;

let Recording = null;

function playPoints(points, callback, options)
{
  let interval = options.interval || 0.01;
  let intervalms = (interval * 1000)|0;

  function helper(points, idx, callback) {
    if (idx < points.length) {
      callback(points[idx], idx, points);
    }

    setTimeout(() => { helper(points, idx+1, callback) }, intervalms);
  }
  setTimeout(() => { helper(points, 0, callback) }, 0);
}


function drawTrace(trace) {
  if (trace.numPoints() < 2)
    return;

  let p0 = trace.pointAt(trace.numPoints() - 2);
  let p1 = trace.pointAt(trace.numPoints() - 1);

  let color = "rgb(0,0,0)";
  let ctx = MainGame.screen.getContext();
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.lineTo(p1.x, p1.y);
  ctx.stroke();
  ctx.restore();
}

function drawSlow(pattern, color, verbose) {
  let points = [];
  pattern.forEachPoint(pt => {
    points.push(MainGame.screen.specializePoint(pt));
  });
  playPoints(points, (pt, idx, pts) => {
    if (idx == 0) {
      return;
    }
    let pt0 = pts[idx-1];
    let ctx = MainGame.screen.getContext();
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(pt0.x, pt0.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
    ctx.restore();
  }, {interval:0.05});
}

function init() {
  // Initialize the canvas.
  let canvas = document.createElement("canvas");
  canvas.setAttribute("id", "main-surface");
  console.log({clientWidth:document.body.clientWidth,
               clientHeight: document.body.clientHeight});
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  let gameScreen = new GameScreen(canvas);
  MainGame = new Game({screen: gameScreen});
  MainGame.addEventListener('player-initialized', (player, game) => {
    console.log("PLAYER: " + player.id + " INITIALIZED. (isThis=" +
                player.isThisPlayer() + ")");
  });
  MainGame.addEventListener('player-hand-changed', (hand, player, game) => {
    console.log("PLAYER: " + player.id + " HAND CHANGED.");
  });
  MainGame.addEventListener('player-current-spell-changed',
    (card, player, game) => {
      console.log("PLAYER: " + player.id + " CURRENT SPELL CHANGED TO: "
            + card.spell.name);
    });
  MainGame.addEventListener('trace-start', (trace, player, game) => {
    console.log("KVKVKV TRACE START!");
  });
  MainGame.addEventListener('trace-add-point', (trace, player, game) => {
    console.log("KVKVKV TRACE ADD POINT!");
    drawTrace(trace);
  });
  MainGame.addEventListener('trace-end', (trace, player, game) => {
    drawTrace(trace);
    computeScore(trace.points_);
    console.log("KVKVKV TRACE END!");
  });

  // Create a new spell book.
  MainSpellBook = makeSpellBook();

  // Create a deck and use it to initialize a player.
  MainDeck = makeDeck(MainSpellBook);
  MainDeck.shuffleCards();
  let thisPlayer = new Player({deck: MainDeck});

  // Add player to game as first player.
  MainGame.addPlayer(thisPlayer, {isThisPlayer: true});

  // Initialize the player's hand.
  thisPlayer.drawFullHand();

  let cardIdx = thisPlayer.hand.findSomeCardIndex();
  let card;
  if (cardIdx !== undefined) {
    card = thisPlayer.hand.removeCard(cardIdx);
    thisPlayer.setCurrentCard(card);
    // Draw its pattern.
    // drawSlow(MainCard.spell.pattern, "rgb(0,0,0)");
    MainGame.screen.redrawScreen(MainGame);
    drawSlow(card.spell.pattern.normalizedTrace, "rgb(200, 0, 0)", true);
  }
}

function computeScore(points)
{
  let tp = new TracePattern();
  for (let point of points) {
    let np = MainGame.screen.normalizePoint(point);
    tp.addXY(np.x, np.y);
  }
  console.log("TRACE PATTERN", tp.numPoints());

  tp = tp.normalize(undefined, /* verbose = */ true);
  console.log("NORMALIZED TRACE PATTERN", tp.numPoints());

  // Compare trace pattern with spell pattern.
  let lines = [];
  let score = MainGame.thisPlayer.currentCard.spell.pattern.traceScore(tp, (pts, area) => {
    lines.push(pts.map(pt => MainGame.screen.specializePoint(pt)));
  });
  console.log("SCORE: " + score);

  function drawLinesSlow(idx) {
    let drawLine = (p1, p2) => {
      let ctx = MainGame.screen.getContext();
      ctx.save();
      ctx.strokeStyle = "rgb(0,200,0)";
      ctx.fillStyle = "rgb(0,200,0)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
      ctx.restore();
    };

    if (idx < lines.length) {
      drawLine(...lines[idx]);
      setTimeout(() => { drawLinesSlow(idx+1); }, 20);
    }
  };
  drawLinesSlow(0);
}

window.onload = () => {
    init();
};
