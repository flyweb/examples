
"use strict";

/**
 * Common code between both server and client.
 */

class ScreenArea
{
  constructor({x, y, width, height}) {
    this.x_ = x;
    this.y_ = y;
    this.width_ = width;
    this.height_ = height;
  }

  get x() { return this.x_; }
  get y() { return this.y_; }
  get width() { return this.width_; }
  get height() { return this.height_; }

  asRectArgs() {
    return [this.x_, this.y_, this.width_, this.height_];
  }

  normalizePoint({x, y}) {
    return new Point({x: (x - this.x_) / this.width_,
                      y: (y - this.y_) / this.height_});
  }

  specializePoint({x, y}) {
    return new Point({x: ( x * this.width_) + this.x_,
                      y: ( y * this.width_) + this.y_});
  }

  containsPoint({x, y}) {
    return ((x >= this.x_) && (x < this.x_ + this.width_)) &&
           ((y >= this.y_) && (y < this.y_ + this.height_));
  }
}

class EventHelper
{
  constructor() {
    this.callbacks_ = new Map();
  }

  emit(type, ...args) {
    let callbackList = this.callbacks_.get(type);
    if (!callbackList) {
      return;
    }
    for (let cb of callbackList) {
      cb(...args);
    }
  }

  addEventListener(type, callback) {
    let callbackList = this.callbacks_.get(type);
    if (!callbackList) {
      callbackList = [];
      this.callbacks_.set(type, callbackList);
    }
    callbackList.push(callback);
  }

  removeEventListener(type, callback) {
    let callbackList = this.callbacks_.get(type);
    if (!callbackList) {
      return false;
    }
    let index = callbackList.indexOf(callback);
    if (index < 0) {
      return false;
    }
    callbackList.splice(index, 1);
  }
}

/**
 * A spell identifies a spell and its behaviour.
 */
class Spell
{
  constructor({id, name, manaCost, pattern}) {
    this.id_ = id;
    this.name_ = name;
    this.manaCost_ = manaCost;
    this.pattern_ = pattern;
  }

  get id() { return this.id_; }
  get name() { return this.name_; }
  get manaCost() { return this.manaCost_; }
  get pattern() { return this.pattern_; }
}

class Point
{
  constructor(pt) {
    if (Array.isArray(pt)) {
      this.x_ = pt[0];
      this.y_ = pt[1];
    } else {
      this.x_ = pt.x;
      this.y_ = pt.y;
    }
  }

  get x() { return this.x_; }
  get y() { return this.y_; }

  distanceTo(pt) {
    return VecOps.mag(this.x - pt.x, this.y - pt.y);
  }

  pointAlongLineTo(pt, frac) {
    // ASSERT: 0 <= frac <= 1
    let dx = pt.x - this.x;
    let dy = pt.y - this.y;
    let frac_x = dx * frac;
    let frac_y = dy * frac;
    return new Point({x: this.x + frac_x, y: this.y + frac_y});
  }

  static triangleArea(p1, p2, p3) {
    let d1 = p1.distanceTo(p2);
    let d2 = p2.distanceTo(p3);
    let d3 = p3.distanceTo(p1);
    let s = (d1+d2+d3)/2;
    return Math.sqrt(s * (s-d1) * (s-d2) * (s-d3));
  }

  toString() {
    return "(" + this.x + "," + this.y + ")";
  }
}

/**
 * A spell pattern is a collection of points that identify the pattern that
 * must be drawn to cast the spell.  The pattern points are drawn from
 * a euclidean grid ranging from (0,0) to (1,1).  In this grid, (0,0)
 * is the top-left corner, and (1,1) is the bottom-left corner.
 */
class SpellPattern
{
  constructor(points) {
    let tracePattern = new TracePattern();
    let pointsCopy = [];
    for (let point of points) {
      let pointCopy = new Point(point);
      pointsCopy.push(pointCopy);
      tracePattern.addPoint(pointCopy);
    }
    this.points_ = pointsCopy;
    this.normalizedTrace_ = tracePattern.normalize(SpellPattern.SAMPLE_INTERVAL);
  }

  get normalizedTrace() {
    return this.normalizedTrace_;
  }

  /**
   * Iterate through points in the spell pattern.
   */
  forEachPoint(cb) {
    this.points_.forEach(cb);
  }

  /**
   * Given a trace of the pattern, calculate the score of the
   * trace as compared to the pattern.
   *
   *  The general approach is this:
   *    1. Linearly interpolate the trace-points (line segments only)
   *    2. Resample the linear interpolation at regular intervals of
   *       length I to get a set of normalized trace points.
   *    3. Correlate the first point in the trace (T0) to the closest point
   *       on the pattern that matches it (P0).
   *    4. Sample the pattern points at regular intervals of length I
   *       from P0.
   *    5. TODO
   */
  traceScore(normalizedTracePattern, callback) {
    return this.normalizedTrace_.traceScore(normalizedTracePattern, callback);
  }
}
SpellPattern.SAMPLE_INTERVAL = 0.01;

/**
 * A trace pattern is a collection of points that identify the trace that
 * a user draws to try to match a pattern.  The pattern points are drawn from
 * a euclidean grid ranging from (0,0) to (1,1).  In this grid, (0,0)
 * is the top-left corner, and (1,1) is the bottom-left corner.
 */
class TracePattern
{
  constructor() {
    this.points_ = [];
  }

  addXY(x, y) {
    this.points_.push(new Point({x, y}));
  }

  addPoint(point) {
    this.points_.push(point);
  }

  numPoints() { return this.points_.length; }
  pointAt(idx) { return this.points_[idx]; }

  /**
   * Iterate through points.
   */
  forEachPoint(cb) {
    this.points_.forEach(cb);
  }

  /**
   * Produce a normalized TracePattern from this raw TracePattern.
   */
  normalize(sampleInterval) {
    // ASSERT: this.points_.length >= 2
    if (!sampleInterval)
      sampleInterval = SpellPattern.SAMPLE_INTERVAL;

    let result = new TracePattern();

    // Set up the current and next points.
    let curIdx = 0;
    let curPoint = this.points_[curIdx];
    let nextPoint = this.points_[curIdx+1];

    let walkDistanceLeft = sampleInterval;
    let segmentDistanceLeft = curPoint.distanceTo(nextPoint);

    result.addPoint(curPoint);
    let count = 0;
    for (;;) {
        if (walkDistanceLeft <= segmentDistanceLeft) {
            curPoint = curPoint.pointAlongLineTo(
                        nextPoint, walkDistanceLeft / segmentDistanceLeft);
            walkDistanceLeft = sampleInterval;
            segmentDistanceLeft = curPoint.distanceTo(nextPoint);
            result.addPoint(curPoint);
        } else {
            walkDistanceLeft -= segmentDistanceLeft;
            curPoint = nextPoint;
            curIdx += 1;
            if (curIdx >= this.points_.length - 1) {
              break;
            }
            nextPoint = this.points_[curIdx+1];
            segmentDistanceLeft = curPoint.distanceTo(nextPoint);
        }
    }

    return result;
  }

  /**
   * Treat this trace as the normalized reference trace for a particular
   * spell pattern, and score it against the given normalized trace pattern.
   */
  traceScore(otherPattern, callback) {
    let thisNumPoints = this.numPoints();
    let otherNumPoints = otherPattern.numPoints();

    let thisIdx = 0;
    let otherIdx = 0;

    let areaSum = 0;
    while (thisIdx < thisNumPoints-1 || otherIdx < otherNumPoints-1) {
      let thisPoint = this.pointAt(thisIdx);
      let otherPoint = otherPattern.pointAt(otherIdx);

      // Check end conditions.
      if (thisIdx == thisNumPoints - 1) {
        // ASSERT: otherIdx < otherNumPoints - 1
        let thirdPoint = otherPattern.pointAt(++otherIdx);
        // let areaDelta = Point.triangleArea(thisPoint, otherPoint, thirdPoint);
        let dist = thisPoint.distanceTo(thirdPoint);
        if (callback) {
          // callback([thisPoint, otherPoint, thirdPoint], areaDelta);
          callback([thisPoint, thirdPoint], dist);
        }
        // areaSum += areaDelta dist;
        areaSum += dist;
        continue;
      }

      if (otherIdx == otherNumPoints - 1) {
        // ASSERT: thisIdx < thisNumPoints - 1
        let thirdPoint = this.pointAt(++thisIdx);
        // let areaDelta = Point.triangleArea(thisPoint, otherPoint, thirdPoint);
        let dist = thirdPoint.distanceTo(otherPoint);
        if (callback) {
          // callback([thisPoint, otherPoint, thirdPoint], areaDelta);
          callback([thirdPoint, otherPoint], dist);
        }
        // areaSum += areaDelta;
        areaSum += dist;
        continue;
      }

      let nextThisPoint = this.pointAt(thisIdx + 1);
      let nextOtherPoint = otherPattern.pointAt(otherIdx + 1);

      let advanceOther = thisPoint.distanceTo(nextOtherPoint);
      let advanceThis = otherPoint.distanceTo(nextThisPoint);
      let advanceBoth = nextThisPoint.distanceTo(nextOtherPoint);
      let min = Math.min(advanceOther, advanceThis, advanceBoth);
      if (min === advanceOther) {
        otherIdx++;
        // let areaDelta = Point.triangleArea(thisPoint, otherPoint,
        //                                    nextOtherPoint);
        let dist = thisPoint.distanceTo(nextOtherPoint);
        if (callback) {
          // callback([thisPoint, otherPoint, nextOtherPoint], areaDelta);
          callback([thisPoint, nextOtherPoint], dist);
        }
        // areaSum += areaDelta;
        areaSum += dist;
      } else if (min === advanceThis) {
        thisIdx++;
        // let areaDelta = Point.triangleArea(thisPoint, otherPoint,
        //                                 nextThisPoint);
        let dist = nextThisPoint.distanceTo(otherPoint);
        if (callback) {
          // callback([thisPoint, otherPoint, nextThisPoint], areaDelta);
          callback([nextThisPoint, otherPoint], dist);
        }
        // areaSum += areaDelta;
        areaSum += dist;
      } else {
        // ASSERT: min == advanceBoth
        otherIdx++;
        thisIdx++;
        // let areaDelta1 = Point.triangleArea(thisPoint, otherPoint,
        //                                  nextThisPoint);
        // let areaDelta2 = Point.triangleArea(nextThisPoint, otherPoint,
        //                                  nextOtherPoint);
        let dist = nextThisPoint.distanceTo(nextOtherPoint);
        if (callback) {
          // callback([thisPoint, otherPoint, nextThisPoint], areaDelta1);
          // callback([nextThisPoint, otherPoint, nextOtherPoint], areaDelta2);
          callback([nextThisPoint, nextOtherPoint], dist);
        }
        // areaSum += areaDelta1;
        // areaSum += areaDelta2;
        areaSum += dist;
      }
    }
    return areaSum / thisNumPoints;
  }
}

/**
 * The spell book lists all possible spells.
 * There should be just one of these per browser page instance.
 * (i.e. each player has a single instance of this class, and all of them look the same).
 */
class SpellBook
{
  constructor() {
    this.spells_ = new Map();
  }

  addSpell(spell) {
    if (this.spells_.get(spell.id) !== undefined) {
      throw new Error("Spell with id '" + spell.id + "' already exists.");
    }
    this.spells_.set(spell.id, spell);
  }

  getSpellById(id) {
    return this.spells_.get(id);
  }
}

/**
 * A card is an instance of a spell contained in a deck.  All cards have
 * a unique id.  There may be multiple cards for the same spell in a given deck.
 */
class Card
{
  constructor({spell}) {
    this.id_ = Card.nextId_++;
    this.spell_ = spell;
  }

  get id() { return this.id_; }
  get spell() { return this.spell_; }
}
Card.nextId_ = 1;

/**
 * A deck contains a collection of cards that can be randomly drawn.
 * A card cannot be contained more than once in a deck.
 */
class Deck
{
  constructor() {
    this.cards_ = new Map();
    this.shuffledCards_ = undefined;
  }

  addCard(card) {
    if (this.cards_.has(card.id)) {
      throw new Error("Cannot add duplicate card to deck.");
    }
    this.cards_.set(card.id, card);
  }

  shuffleCards() {
    // Make a list of all the cards.
    let cardList = [];
    this.cards_.forEach(v => {
      cardList.push(v);
    });

    // Randomize the list.
    ArrayOps.randomize(cardList);
    this.shuffledCards_ = cardList;
  }

  drawCard() {
    if (this.shuffledCards_.length == 0) {
      return undefined;
    }

    let card = this.shuffledCards_.pop();
    this.cards_.delete(card.id);
    return card;
  }
}

class Hand
{
  constructor() {
    this.size_ = Hand.DefaultHandSize;
    this.cards_ = new Array(this.size_);
    this.eventHelper_ = new EventHelper();
  }

  get size() { return this.size_; }
  get cards() { return this.cars_; }
  cardAt(idx) {
    // ASSERT: idx < this.size_
    return this.cards_[idx];
  }
  setCardAt(idx, card) {
    // ASSERT: idx < this.size_
    this.cards_[idx] = card;
  }

  /** Draw a full hand from the deck. */
  drawFullHand(deck) {
    for (let i = 0; i < this.size_; i++) {
      this.setCardAt(i, deck.drawCard());
    }
    this._emit('changed', this);
  }

  /* Remove the card at the given index from the hand, return it. */
  removeCard(index) {
    // ASSERT: index < this.size_;
    if (this.cards_[index] === undefined) {
      return;
    }
    let card = this.cards_[index];
    this.cards_[index] = undefined;
    this._emit('changed', this);
    return card;
  }

  /* Get the some card from the hand. */
  findSomeCardIndex() {
    for (let i = 0; i < this.size_; i++) {
      if (this.cards_[i] !== undefined) {
        return i;
      }
    }
    return undefined;
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
};

Hand.DefaultHandSize = 5;
