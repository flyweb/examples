"use strict";

/**
 * The game object is the organizational top-level of
 * a game.
 *
 * Whenever a player performs an action, or a game
 * event occurs, the action is raised as an event
 * on this object.
 */
class Game
{
  constructor({screen}) {
    this.screen_ = screen;
    this.players_ = new Map();
    this.thisPlayer_ = null;
    this.eventHelper_ = new EventHelper();
  }

  get screen() { return this.screen_; }

  get playerIds() {
    return this.players_.keys();
  }

  get thisPlayer() {
    // ASSERT: this.thisPlayer_ !== undefined
    return this.thisPlayer_;
  }

  addPlayer(player, {isThisPlayer}) {
    // ASSERT: !this.players_.has(player.id);
    this.players_.set(player.id, player);
    if (isThisPlayer) {
      // ASSERT: !this.thisPlayer_
      this.thisPlayer_ = player;
    }
    player._initialize(this);
    player.addEventListener('trace-start',
      this._forwardEmit('trace-start'));
    player.addEventListener('trace-add-point',
      this._forwardEmit('trace-add-point'));
    player.addEventListener('trace-end',
      this._forwardEmit('trace-end'));
    player.addEventListener('hand-changed',
      this._forwardEmit('player-hand-changed'));
    player.addEventListener('current-spell-changed',
      this._forwardEmit('player-current-spell-changed'));
    this._emit('player-initialized', player, this);
  }

  _forwardEmit(type) {
    return (...args) => {
      args.push(this);
      this._emit(type, ...args);
    };
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

/**
 * Wraps the concept of a player.  All pages have
 * a single Player object for every player.
 */
class Player
{
  constructor({deck}) {
    this.id_ = Player.GenerateId();
    this.deck_ = deck;
    this.hand_ = new Hand();
    this.game_ = null;

    this.currentCard_ = null;
    this.eventHelper_ = new EventHelper();

    this.hp_ = 0;
    this.mp_ = 0;
  }

  get id() { return this.id_; }
  get deck() { return this.deck_; }
  get hand() { return this.hand_; }
  get game() { return this.game_; }

  get currentCard() { return this.currentCard_; }

  isThisPlayer() {
    // ASSERT: this.game_ !== undefined
    return this === this.game_.thisPlayer;
  }

  drawFullHand() {
    this.hand_.drawFullHand(this.deck_);
  }

  setCurrentCard(card) {
    this.currentCard_ = card;
    this._emit('current-spell-changed', card, this);
  }

  _initialize(game) {
    this.game_ = game;
    this.hand_.addEventListener('changed', this._forwardEmit('hand-changed'));
    if (this.isThisPlayer()) {
      this._initHandleScreenEvents();
    }
  }

  _initHandleScreenEvents() {
    // Attach handlers to screen trace callbacks.
    this.game_.screen.addEventListener('trace-start',
      this._forwardTraceEmit('trace-start'));
    this.game_.screen.addEventListener('trace-add-point',
      this._forwardTraceEmit('trace-add-point'));
    this.game_.screen.addEventListener('trace-end',
      this._forwardTraceEmit('trace-end'));
  }
  _forwardTraceEmit(type) {
    return (...args) => {
      if (!this.currentCard_) { return; }
      args.push(this);
      this._emit(type, ...args);
    }
  }
  _forwardEmit(type) {
    return (...args) => {
      args.push(this);
      this._emit(type, ...args);
    }
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

  static GenerateId() {
    return Player.NEXT_ID++;
  }
};
Player.NEXT_ID = 1;
