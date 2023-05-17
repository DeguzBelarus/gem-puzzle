const GAME_MATRIX_AREA = document.querySelector(".game-matrix");
const MENU_BUTTONS_WRAPPER = document.querySelector(".menu-buttons-wrapper");
const GAME_MENU_BUTTON = document.querySelector(".game-menu-button");
const TURNS_SPAN = document.querySelector("#turns");
const HOURS_SPAN = document.querySelector("#hours");
const MINUTES_SPAN = document.querySelector("#minutes");
const SECONDS_SPAN = document.querySelector("#seconds");
const START_BUTTON = document.querySelector(".start-button");
const STOP_BUTTON = document.querySelector(".stop-button");
const SAVE_BUTTON = document.querySelector(".save-button");
const TOP_BUTTON = document.querySelector(".top-button");
const SOUND_ON_OFF_ICON = document.querySelector(".sound-icon");
const AUDIO_PLAYER = document.querySelector("#audio-player");
const TOP_SCORE_WRAPPER = document.querySelector(".top-score-wrapper");
const VICTORY_WRAPPER = document.querySelector(".victory-wrapper");
const RESOLUTION_INFO_TEXT = document.querySelector(".resolution-text");
const CONTROLS_SPAN_DRAG = document.querySelector(".controls-span-drag");
const CONTROLS_SPAN_CLICK = document.querySelector(".controls-span-click");
const CONTROLS_SWITCHER = document.querySelector(".controls-switcher");
const POINTER_TYPE_TEXT = document.querySelector(".pointer-type-text");
// node variables

// main variables
let blockSize = 0;
let turns = 0;
let gameDuration = 0;
const victoriousArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 0];
let isGameStarted = false;
let isMenuOpened = false;
let isWonScreenShown = false;
let isTopResultsShown = false;
let isGameWon = false;
let isSoundsOn = true;
let topResultsArray = [
  { turns: null, gameDuration: Number.MAX_SAFE_INTEGER, date: null },
  { turns: null, gameDuration: Number.MAX_SAFE_INTEGER, date: null },
  { turns: null, gameDuration: Number.MAX_SAFE_INTEGER, date: null },
  { turns: null, gameDuration: Number.MAX_SAFE_INTEGER, date: null },
  { turns: null, gameDuration: Number.MAX_SAFE_INTEGER, date: null },
  { turns: null, gameDuration: Number.MAX_SAFE_INTEGER, date: null },
  { turns: null, gameDuration: Number.MAX_SAFE_INTEGER, date: null },
  { turns: null, gameDuration: Number.MAX_SAFE_INTEGER, date: null },
  { turns: null, gameDuration: Number.MAX_SAFE_INTEGER, date: null },
  { turns: null, gameDuration: Number.MAX_SAFE_INTEGER, date: null },
];
let gameMatrix = [
  [-1, -1, -1, -1],
  [-1, -1, -1, -1],
  [-1, -1, -1, -1],
  [-1, -1, -1, -1],
];
const victoriousGameMatrix = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [13, 14, 15, 0],
];
let emptyBlockCoords = {
  row: 0,
  col: 0,
};
let targetBlockCoords = {
  row: 0,
  col: 0,
};
let gameTimer;

let saveObject = {
  turns,
  gameDuration,
  isGameStarted,
  topResultsArray,
  gameMatrix,
  emptyBlockCoords,
  gameTimer,
};
let movingBlock;
let canMoveUp = false;
let canMoveDown = false;
let canMoveLeft = false;
let canMoveRight = false;
let controlsMode = "drag";
let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;
let pointerType = "mouse";
// main variables

if (navigator.maxTouchPoints > 0) {
  pointerType = "touch";
  POINTER_TYPE_TEXT.innerText = "touch mode";
}

if (localStorage.getItem("deguz-gem-puzzle")) {
  const save = JSON.parse(localStorage.getItem("deguz-gem-puzzle"));
  turns = save.turns;
  TURNS_SPAN.innerText = `${turns}`;
  gameDuration = save.gameDuration;
  gameClockUpdater();
  topResultsArray = save.topResultsArray;
  emptyBlockCoords = save.emptyBlockCoords;
  gameTimer = save.gameTimer;
  gameMatrix = save.gameMatrix;
  isGameStarted = save.isGameStarted;

  if (isGameStarted) {
    matrixRendering(gameMatrix);
    START_BUTTON.disabled = true;
    STOP_BUTTON.disabled = false;
    gameTimer = setInterval(() => {
      gameDuration += 1;
      gameClockUpdater();
    }, 1000);
  }
}

function controlsModeHandler() {
  if (controlsMode === "drag") {
    controlsMode = "click";
    CONTROLS_SPAN_DRAG.classList.remove("controls-active");
    CONTROLS_SPAN_CLICK.classList.add("controls-active");
  } else {
    controlsMode = "drag";
    CONTROLS_SPAN_DRAG.classList.add("controls-active");
    CONTROLS_SPAN_CLICK.classList.remove("controls-active");
  }
  if (isGameStarted) {
    matrixRendering(gameMatrix);
    gameBlocksListenersAdder();
  }
}

function gameBlocksListenersAdder() {
  let gameBlocks = document.querySelectorAll(".game-block");

  // removing listeners
  gameBlocks.forEach((block) => {
    block.removeEventListener("click", blockClickHandler);
    block.removeEventListener("touchstart", (event) => {
      event.preventDefault();

      if (!blockMovingAbilityChecking(event.target, true)) {
        return blockClickHandler(event);
      } else {
        event.target.style.zIndex = 1;
        event.target.style.transitionDuration = "0s";

        let gameMatrixPositionData = GAME_MATRIX_AREA.getBoundingClientRect();
        let blockPositionData = event.target.getBoundingClientRect();
        let shiftX = event.changedTouches[0].pageX - blockPositionData.left;
        let shiftY = event.changedTouches[0].pageY - blockPositionData.top;
        let blockCurrentPositionData;

        function moveAt(pageX, pageY) {
          blockCurrentPositionData = event.target.getBoundingClientRect();

          if (canMoveUp || canMoveDown) {
            if (
              canMoveUp &&
              blockCurrentPositionData.top > blockPositionData.top
            ) {
              document.removeEventListener("touchmove", onMouseMove);
              event.target.style.transitionDuration = "0.4s";
              event.target.ontouchend = null;
              blockClickHandler(event);
              canMoveUp = false;
              canMoveDown = false;
              canMoveLeft = false;
              canMoveRight = false;
            } else if (
              canMoveUp &&
              blockCurrentPositionData.top <= blockPositionData.top - blockSize
            ) {
              document.removeEventListener("touchmove", onMouseMove);
              event.target.style.transitionDuration = "0.4s";
              event.target.ontouchend = null;
              blockClickHandler(event);
              canMoveUp = false;
              canMoveDown = false;
              canMoveLeft = false;
              canMoveRight = false;
            } else if (
              canMoveDown &&
              blockCurrentPositionData.top < blockPositionData.top
            ) {
              document.removeEventListener("touchmove", onMouseMove);
              event.target.style.transitionDuration = "0.4s";
              event.target.ontouchend = null;
              blockClickHandler(event);
              canMoveUp = false;
              canMoveDown = false;
              canMoveLeft = false;
              canMoveRight = false;
            } else if (
              canMoveDown &&
              blockCurrentPositionData.top >= blockPositionData.top + blockSize
            ) {
              document.removeEventListener("touchmove", onMouseMove);
              event.target.style.transitionDuration = "0.4s";
              event.target.ontouchend = null;
              blockClickHandler(event);
              canMoveUp = false;
              canMoveDown = false;
              canMoveLeft = false;
              canMoveRight = false;
            } else {
              event.target.style.transform = `translateY(${
                pageY - shiftY - gameMatrixPositionData.top
              }px) translateX(${targetBlockCoords.col * blockSize}px)`;
            }
          }

          if (canMoveLeft || canMoveRight) {
            if (
              canMoveLeft &&
              blockCurrentPositionData.left > blockPositionData.left
            ) {
              document.removeEventListener("touchmove", onMouseMove);
              event.target.style.transitionDuration = "0.4s";
              event.target.ontouchend = null;
              blockClickHandler(event);
              canMoveUp = false;
              canMoveDown = false;
              canMoveLeft = false;
              canMoveRight = false;
            } else if (
              canMoveLeft &&
              blockCurrentPositionData.left <=
                blockPositionData.left - blockSize
            ) {
              document.removeEventListener("touchmove", onMouseMove);
              event.target.style.transitionDuration = "0.4s";
              event.target.ontouchend = null;
              blockClickHandler(event);
              canMoveUp = false;
              canMoveDown = false;
              canMoveLeft = false;
              canMoveRight = false;
            } else if (
              canMoveRight &&
              blockCurrentPositionData.left < blockPositionData.left
            ) {
              document.removeEventListener("touchmove", onMouseMove);
              event.target.style.transitionDuration = "0.4s";
              event.target.ontouchend = null;
              blockClickHandler(event);
              canMoveUp = false;
              canMoveDown = false;
              canMoveLeft = false;
              canMoveRight = false;
            } else if (
              canMoveRight &&
              blockCurrentPositionData.left >=
                blockPositionData.left + blockSize
            ) {
              document.removeEventListener("touchmove", onMouseMove);
              event.target.style.transitionDuration = "0.4s";
              event.target.ontouchend = null;
              blockClickHandler(event);
              canMoveUp = false;
              canMoveDown = false;
              canMoveLeft = false;
              canMoveRight = false;
            } else {
              event.target.style.transform = `translateY(${
                targetBlockCoords.row * blockSize
              }px) translateX(${
                pageX - shiftX - gameMatrixPositionData.left
              }px)`;
            }
          }
        }

        function onMouseMove(event) {
          moveAt(
            event.changedTouches[0].clientX,
            event.changedTouches[0].clientY
          );
        }

        document.addEventListener("touchmove", onMouseMove);
        event.preventDefault();
        event.target.ontouchend = function () {
          document.removeEventListener("touchmove", onMouseMove);
          blockCurrentPositionData = event.target.getBoundingClientRect();

          if (
            (canMoveUp || canMoveDown) &&
            blockPositionData.y !== blockCurrentPositionData.y
          ) {
            event.target.style.transitionDuration = "0.4s";
            blockClickHandler(event);
          }

          if (
            (canMoveLeft || canMoveRight) &&
            blockPositionData.x !== blockCurrentPositionData.x
          ) {
            event.target.style.transitionDuration = "0.4s";
            blockClickHandler(event);
          }

          event.target.ontouchend = null;
        };
      }
    });
    block.removeEventListener("mousedown", (event) => {
      if (!blockMovingAbilityChecking(event.target, true)) {
        return blockClickHandler(event);
      } else {
        event.target.style.zIndex = 1;
        event.target.style.transitionDuration = "0s";

        let shiftX = event.offsetX + 1;
        let shiftY = event.offsetY + 1;
        let blockPositionData = event.target.getBoundingClientRect();
        let gameMatrixPositionData = GAME_MATRIX_AREA.getBoundingClientRect();
        let blockCurrentPositionData;

        function moveAt(pageX, pageY) {
          blockCurrentPositionData = event.target.getBoundingClientRect();
          if (canMoveUp || canMoveDown) {
            if (
              canMoveUp &&
              blockCurrentPositionData.top > blockPositionData.top
            ) {
              document.removeEventListener("mousemove", onMouseMove);
              event.target.style.transitionDuration = "0.4s";
              event.target.onmouseup = null;
              blockClickHandler(event);
              canMoveUp = false;
              canMoveDown = false;
              canMoveLeft = false;
              canMoveRight = false;
            } else if (
              canMoveUp &&
              blockCurrentPositionData.top <= blockPositionData.top - blockSize
            ) {
              document.removeEventListener("mousemove", onMouseMove);
              event.target.style.transitionDuration = "0.4s";
              event.target.onmouseup = null;
              blockClickHandler(event);
              canMoveUp = false;
              canMoveDown = false;
              canMoveLeft = false;
              canMoveRight = false;
            } else if (
              canMoveDown &&
              blockCurrentPositionData.top < blockPositionData.top
            ) {
              document.removeEventListener("mousemove", onMouseMove);
              event.target.style.transitionDuration = "0.4s";
              event.target.onmouseup = null;
              blockClickHandler(event);
              canMoveUp = false;
              canMoveDown = false;
              canMoveLeft = false;
              canMoveRight = false;
            } else if (
              canMoveDown &&
              blockCurrentPositionData.top >= blockPositionData.top + blockSize
            ) {
              document.removeEventListener("mousemove", onMouseMove);
              event.target.style.transitionDuration = "0.4s";
              event.target.onmouseup = null;
              blockClickHandler(event);
              canMoveUp = false;
              canMoveDown = false;
              canMoveLeft = false;
              canMoveRight = false;
            } else {
              event.target.style.transform = `translateY(${
                pageY - shiftY - gameMatrixPositionData.top
              }px) translateX(${targetBlockCoords.col * blockSize}px)`;
            }
          }

          if (canMoveLeft || canMoveRight) {
            if (
              canMoveLeft &&
              blockCurrentPositionData.left > blockPositionData.left
            ) {
              document.removeEventListener("mousemove", onMouseMove);
              event.target.style.transitionDuration = "0.4s";
              event.target.onmouseup = null;
              blockClickHandler(event);
              canMoveUp = false;
              canMoveDown = false;
              canMoveLeft = false;
              canMoveRight = false;
            } else if (
              canMoveLeft &&
              blockCurrentPositionData.left <=
                blockPositionData.left - blockSize
            ) {
              document.removeEventListener("mousemove", onMouseMove);
              event.target.style.transitionDuration = "0.4s";
              event.target.onmouseup = null;
              blockClickHandler(event);
              canMoveUp = false;
              canMoveDown = false;
              canMoveLeft = false;
              canMoveRight = false;
            } else if (
              canMoveRight &&
              blockCurrentPositionData.left < blockPositionData.left
            ) {
              document.removeEventListener("mousemove", onMouseMove);
              event.target.style.transitionDuration = "0.4s";
              event.target.onmouseup = null;
              blockClickHandler(event);
              canMoveUp = false;
              canMoveDown = false;
              canMoveLeft = false;
              canMoveRight = false;
            } else if (
              canMoveRight &&
              blockCurrentPositionData.left >=
                blockPositionData.left + blockSize
            ) {
              document.removeEventListener("mousemove", onMouseMove);
              event.target.style.transitionDuration = "0.4s";
              event.target.onmouseup = null;
              blockClickHandler(event);
              canMoveUp = false;
              canMoveDown = false;
              canMoveLeft = false;
              canMoveRight = false;
            } else {
              event.target.style.transform = `translateY(${
                targetBlockCoords.row * blockSize
              }px) translateX(${
                pageX - shiftX - gameMatrixPositionData.left
              }px)`;
            }
          }
        }

        function onMouseMove(event) {
          moveAt(event.pageX, event.pageY);
        }

        document.addEventListener("mousemove", onMouseMove);
        event.target.onmouseup = function () {
          document.removeEventListener("mousemove", onMouseMove);
          blockCurrentPositionData = event.target.getBoundingClientRect();

          if (
            (canMoveUp || canMoveDown) &&
            blockPositionData.y !== blockCurrentPositionData.y
          ) {
            event.target.style.transitionDuration = "0.4s";
            blockClickHandler(event);
          }

          if (
            (canMoveLeft || canMoveRight) &&
            blockPositionData.x !== blockCurrentPositionData.x
          ) {
            event.target.style.transitionDuration = "0.4s";
            blockClickHandler(event);
          }

          event.target.onmouseup = null;
        };
      }
    });
  });
  // removing listeners

  // adding listeners
  // PC listeners
  if (navigator.maxTouchPoints < 1) {
    if (controlsMode === "drag") {
      gameBlocks.forEach((block) => {
        block.addEventListener("mousedown", (event) => {
          if (!blockMovingAbilityChecking(event.target, true)) {
            return blockClickHandler(event);
          } else {
            event.target.style.zIndex = 1;
            event.target.style.transitionDuration = "0s";

            let shiftX = event.offsetX + 1;
            let shiftY = event.offsetY + 1;
            let blockPositionData = event.target.getBoundingClientRect();
            let gameMatrixPositionData =
              GAME_MATRIX_AREA.getBoundingClientRect();
            let blockCurrentPositionData;

            function moveAt(pageX, pageY) {
              blockCurrentPositionData = event.target.getBoundingClientRect();
              if (canMoveUp || canMoveDown) {
                if (
                  canMoveUp &&
                  blockCurrentPositionData.top > blockPositionData.top
                ) {
                  document.removeEventListener("mousemove", onMouseMove);
                  event.target.style.transitionDuration = "0.4s";
                  event.target.onmouseup = null;
                  blockClickHandler(event);
                  canMoveUp = false;
                  canMoveDown = false;
                  canMoveLeft = false;
                  canMoveRight = false;
                } else if (
                  canMoveUp &&
                  blockCurrentPositionData.top <=
                    blockPositionData.top - blockSize
                ) {
                  document.removeEventListener("mousemove", onMouseMove);
                  event.target.style.transitionDuration = "0.4s";
                  event.target.onmouseup = null;
                  blockClickHandler(event);
                  canMoveUp = false;
                  canMoveDown = false;
                  canMoveLeft = false;
                  canMoveRight = false;
                } else if (
                  canMoveDown &&
                  blockCurrentPositionData.top < blockPositionData.top
                ) {
                  document.removeEventListener("mousemove", onMouseMove);
                  event.target.style.transitionDuration = "0.4s";
                  event.target.onmouseup = null;
                  blockClickHandler(event);
                  canMoveUp = false;
                  canMoveDown = false;
                  canMoveLeft = false;
                  canMoveRight = false;
                } else if (
                  canMoveDown &&
                  blockCurrentPositionData.top >=
                    blockPositionData.top + blockSize
                ) {
                  document.removeEventListener("mousemove", onMouseMove);
                  event.target.style.transitionDuration = "0.4s";
                  event.target.onmouseup = null;
                  blockClickHandler(event);
                  canMoveUp = false;
                  canMoveDown = false;
                  canMoveLeft = false;
                  canMoveRight = false;
                } else {
                  event.target.style.transform = `translateY(${
                    pageY - shiftY - gameMatrixPositionData.top
                  }px) translateX(${targetBlockCoords.col * blockSize}px)`;
                }
              }

              if (canMoveLeft || canMoveRight) {
                if (
                  canMoveLeft &&
                  blockCurrentPositionData.left > blockPositionData.left
                ) {
                  document.removeEventListener("mousemove", onMouseMove);
                  event.target.style.transitionDuration = "0.4s";
                  event.target.onmouseup = null;
                  blockClickHandler(event);
                  canMoveUp = false;
                  canMoveDown = false;
                  canMoveLeft = false;
                  canMoveRight = false;
                } else if (
                  canMoveLeft &&
                  blockCurrentPositionData.left <=
                    blockPositionData.left - blockSize
                ) {
                  document.removeEventListener("mousemove", onMouseMove);
                  event.target.style.transitionDuration = "0.4s";
                  event.target.onmouseup = null;
                  blockClickHandler(event);
                  canMoveUp = false;
                  canMoveDown = false;
                  canMoveLeft = false;
                  canMoveRight = false;
                } else if (
                  canMoveRight &&
                  blockCurrentPositionData.left < blockPositionData.left
                ) {
                  document.removeEventListener("mousemove", onMouseMove);
                  event.target.style.transitionDuration = "0.4s";
                  event.target.onmouseup = null;
                  blockClickHandler(event);
                  canMoveUp = false;
                  canMoveDown = false;
                  canMoveLeft = false;
                  canMoveRight = false;
                } else if (
                  canMoveRight &&
                  blockCurrentPositionData.left >=
                    blockPositionData.left + blockSize
                ) {
                  document.removeEventListener("mousemove", onMouseMove);
                  event.target.style.transitionDuration = "0.4s";
                  event.target.onmouseup = null;
                  blockClickHandler(event);
                  canMoveUp = false;
                  canMoveDown = false;
                  canMoveLeft = false;
                  canMoveRight = false;
                } else {
                  event.target.style.transform = `translateY(${
                    targetBlockCoords.row * blockSize
                  }px) translateX(${
                    pageX - shiftX - gameMatrixPositionData.left
                  }px)`;
                }
              }
            }

            function onMouseMove(event) {
              moveAt(event.pageX, event.pageY);
            }

            document.addEventListener("mousemove", onMouseMove);
            event.target.onmouseup = function () {
              document.removeEventListener("mousemove", onMouseMove);
              blockCurrentPositionData = event.target.getBoundingClientRect();

              if (
                (canMoveUp || canMoveDown) &&
                blockPositionData.y !== blockCurrentPositionData.y
              ) {
                event.target.style.transitionDuration = "0.4s";
                blockClickHandler(event);
              }

              if (
                (canMoveLeft || canMoveRight) &&
                blockPositionData.x !== blockCurrentPositionData.x
              ) {
                event.target.style.transitionDuration = "0.4s";
                blockClickHandler(event);
              }

              event.target.onmouseup = null;
            };
          }
        });
      });
    }
    if (controlsMode === "click") {
      gameBlocks.forEach((block) => {
        block.addEventListener("click", blockClickHandler);
      });
    }
  }
  // mobile listeners
  else {
    if (controlsMode === "drag") {
      gameBlocks.forEach((block) => {
        block.addEventListener("touchstart", (event) => {
          event.preventDefault();

          if (!blockMovingAbilityChecking(event.target, true)) {
            return blockClickHandler(event);
          } else {
            event.target.style.zIndex = 1;
            event.target.style.transitionDuration = "0s";

            let gameMatrixPositionData =
              GAME_MATRIX_AREA.getBoundingClientRect();
            let blockPositionData = event.target.getBoundingClientRect();
            let shiftX = event.changedTouches[0].pageX - blockPositionData.left;
            let shiftY = event.changedTouches[0].pageY - blockPositionData.top;
            let blockCurrentPositionData;

            function moveAt(pageX, pageY) {
              blockCurrentPositionData = event.target.getBoundingClientRect();

              if (canMoveUp || canMoveDown) {
                if (
                  canMoveUp &&
                  blockCurrentPositionData.top > blockPositionData.top
                ) {
                  document.removeEventListener("touchmove", onMouseMove);
                  event.target.style.transitionDuration = "0.4s";
                  event.target.ontouchend = null;
                  blockClickHandler(event);
                  canMoveUp = false;
                  canMoveDown = false;
                  canMoveLeft = false;
                  canMoveRight = false;
                } else if (
                  canMoveUp &&
                  blockCurrentPositionData.top <=
                    blockPositionData.top - blockSize
                ) {
                  document.removeEventListener("touchmove", onMouseMove);
                  event.target.style.transitionDuration = "0.4s";
                  event.target.ontouchend = null;
                  blockClickHandler(event);
                  canMoveUp = false;
                  canMoveDown = false;
                  canMoveLeft = false;
                  canMoveRight = false;
                } else if (
                  canMoveDown &&
                  blockCurrentPositionData.top < blockPositionData.top
                ) {
                  document.removeEventListener("touchmove", onMouseMove);
                  event.target.style.transitionDuration = "0.4s";
                  event.target.ontouchend = null;
                  blockClickHandler(event);
                  canMoveUp = false;
                  canMoveDown = false;
                  canMoveLeft = false;
                  canMoveRight = false;
                } else if (
                  canMoveDown &&
                  blockCurrentPositionData.top >=
                    blockPositionData.top + blockSize
                ) {
                  document.removeEventListener("touchmove", onMouseMove);
                  event.target.style.transitionDuration = "0.4s";
                  event.target.ontouchend = null;
                  blockClickHandler(event);
                  canMoveUp = false;
                  canMoveDown = false;
                  canMoveLeft = false;
                  canMoveRight = false;
                } else {
                  event.target.style.transform = `translateY(${
                    pageY - shiftY - gameMatrixPositionData.top
                  }px) translateX(${targetBlockCoords.col * blockSize}px)`;
                }
              }

              if (canMoveLeft || canMoveRight) {
                if (
                  canMoveLeft &&
                  blockCurrentPositionData.left > blockPositionData.left
                ) {
                  document.removeEventListener("touchmove", onMouseMove);
                  event.target.style.transitionDuration = "0.4s";
                  event.target.ontouchend = null;
                  blockClickHandler(event);
                  canMoveUp = false;
                  canMoveDown = false;
                  canMoveLeft = false;
                  canMoveRight = false;
                } else if (
                  canMoveLeft &&
                  blockCurrentPositionData.left <=
                    blockPositionData.left - blockSize
                ) {
                  document.removeEventListener("touchmove", onMouseMove);
                  event.target.style.transitionDuration = "0.4s";
                  event.target.ontouchend = null;
                  blockClickHandler(event);
                  canMoveUp = false;
                  canMoveDown = false;
                  canMoveLeft = false;
                  canMoveRight = false;
                } else if (
                  canMoveRight &&
                  blockCurrentPositionData.left < blockPositionData.left
                ) {
                  document.removeEventListener("touchmove", onMouseMove);
                  event.target.style.transitionDuration = "0.4s";
                  event.target.ontouchend = null;
                  blockClickHandler(event);
                  canMoveUp = false;
                  canMoveDown = false;
                  canMoveLeft = false;
                  canMoveRight = false;
                } else if (
                  canMoveRight &&
                  blockCurrentPositionData.left >=
                    blockPositionData.left + blockSize
                ) {
                  document.removeEventListener("touchmove", onMouseMove);
                  event.target.style.transitionDuration = "0.4s";
                  event.target.ontouchend = null;
                  blockClickHandler(event);
                  canMoveUp = false;
                  canMoveDown = false;
                  canMoveLeft = false;
                  canMoveRight = false;
                } else {
                  event.target.style.transform = `translateY(${
                    targetBlockCoords.row * blockSize
                  }px) translateX(${
                    pageX - shiftX - gameMatrixPositionData.left
                  }px)`;
                }
              }
            }

            function onMouseMove(event) {
              moveAt(
                event.changedTouches[0].clientX,
                event.changedTouches[0].clientY
              );
            }

            document.addEventListener("touchmove", onMouseMove);
            event.preventDefault();
            event.target.ontouchend = function () {
              document.removeEventListener("touchmove", onMouseMove);
              blockCurrentPositionData = event.target.getBoundingClientRect();

              if (
                (canMoveUp || canMoveDown) &&
                blockPositionData.y !== blockCurrentPositionData.y
              ) {
                event.target.style.transitionDuration = "0.4s";
                blockClickHandler(event);
              }

              if (
                (canMoveLeft || canMoveRight) &&
                blockPositionData.x !== blockCurrentPositionData.x
              ) {
                event.target.style.transitionDuration = "0.4s";
                blockClickHandler(event);
              }

              event.target.ontouchend = null;
            };
          }
        });
      });
    }
    if (controlsMode === "click") {
      gameBlocks.forEach((block) => {
        block.addEventListener("click", blockClickHandler);
      });
    }
  }
  // adding listeners
}

function topResultShowHandler() {
  if (!isTopResultsShown) {
    TOP_SCORE_WRAPPER.innerHTML = "";

    topResultsArray.forEach((result, index) => {
      let topDate = new Date(result.date);

      let topHours = Math.floor(result.gameDuration / 60 / 60);
      let topMinutes = Math.floor(result.gameDuration / 60);
      let topSeconds =
        result.gameDuration - topHours * 60 * 60 - topMinutes * 60;

      if (topHours > 9) {
        topHours = `${topHours}`;
      } else {
        topHours = `0${topHours}`;
      }
      if (topMinutes > 9) {
        topMinutes = `${topMinutes}`;
      } else {
        topMinutes = `0${topMinutes}`;
      }
      if (topSeconds > 9) {
        topSeconds = `${topSeconds}`;
      } else {
        topSeconds = `0${topSeconds}`;
      }

      let dateOfMonth;
      let month;
      let year;

      if (result?.date) {
        dateOfMonth = topDate.getDate();
        month = topDate.getMonth();
        year = topDate.getFullYear();
      }

      let scoreItem = document.createElement("div");
      scoreItem.classList.add("score-item");
      let numberSpan = document.createElement("span");
      numberSpan.innerText = `${index + 1}`;
      let dateSpan = document.createElement("span");
      let durationSpan = document.createElement("span");
      let turnsSpan = document.createElement("span");

      if (!result?.date) {
        dateSpan.innerText = "--.--.----";
        durationSpan.innerText = `duration: -`;
        turnsSpan.innerText = `turns: -`;
      } else {
        dateSpan.innerText = `${dateOfMonth}.${month + 1}.${year}`;
        durationSpan.innerText = `duration: ${topHours}:${topMinutes}:${topSeconds}`;
        turnsSpan.innerText = `turns: ${result.turns}`;
      }

      scoreItem.appendChild(numberSpan);
      scoreItem.appendChild(dateSpan);
      scoreItem.appendChild(durationSpan);
      scoreItem.appendChild(turnsSpan);
      TOP_SCORE_WRAPPER.appendChild(scoreItem);
    });

    isTopResultsShown = true;
    TOP_SCORE_WRAPPER.classList.add("top-score-wrapper-is-shown");
  } else {
    isTopResultsShown = false;
    TOP_SCORE_WRAPPER.classList.remove("top-score-wrapper-is-shown");
  }
}

function wonScreenShowHandler() {
  if (!isWonScreenShown) {
    if (isGameWon) {
      isWonScreenShown = true;
      VICTORY_WRAPPER.innerHTML = "";

      let winHours = Math.floor(gameDuration / 60 / 60);
      let winMinutes = Math.floor(gameDuration / 60);
      let winSeconds = gameDuration - winHours * 60 * 60 - winMinutes * 60;

      if (winHours > 9) {
        winHours = `${winHours}`;
      } else {
        winHours = `0${winHours}`;
      }
      if (winMinutes > 9) {
        winMinutes = `${winMinutes}`;
      } else {
        winMinutes = `0${winMinutes}`;
      }
      if (winSeconds > 9) {
        winSeconds = `${winSeconds}`;
      } else {
        winSeconds = `0${winSeconds}`;
      }

      let victoryParagraph = document.createElement("p");
      victoryParagraph.innerHTML = `Hooray! You have solved the puzzle in <span>${winHours}:${winMinutes}:${winSeconds}</span> and <span>${turns}</span> moves!`;
      VICTORY_WRAPPER.appendChild(victoryParagraph);

      VICTORY_WRAPPER.classList.add("victory-wrapper-is-shown");
    }
  } else {
    isWonScreenShown = false;
    VICTORY_WRAPPER.classList.remove("victory-wrapper-is-shown");
  }
}

function topResultSave() {
  const winningInformationObject = {
    turns: turns,
    gameDuration: gameDuration,
    date: Date.now(),
  };

  if (topResultsArray[9].gameDuration > winningInformationObject.gameDuration) {
    topResultsArray.pop();
    topResultsArray.push(winningInformationObject);
    topResultsArray = topResultsArray.sort((prevTopResult, nextTopResult) => {
      if (prevTopResult.gameDuration < nextTopResult.gameDuration) {
        return -1;
      }
      if (prevTopResult.gameDuration > nextTopResult.gameDuration) {
        return 1;
      }
      return 0;
    });
  }
}

function saveGameState() {
  saveObject.emptyBlockCoords = emptyBlockCoords;
  saveObject.gameDuration = gameDuration;
  saveObject.gameMatrix = gameMatrix;
  saveObject.gameTimer = gameTimer;
  saveObject.isGameStarted = isGameStarted;
  saveObject.topResultsArray = topResultsArray;
  saveObject.turns = turns;

  const save = saveObject;
  localStorage.setItem("deguz-gem-puzzle", JSON.stringify(save));
}

function soundOnOffHandler() {
  if (!isSoundsOn) {
    isSoundsOn = true;
    SOUND_ON_OFF_ICON.src = "./assets/bgmon.png";
  } else {
    isSoundsOn = false;
    SOUND_ON_OFF_ICON.src = "./assets/bgmoff.png";
  }
}

function gameClockUpdater() {
  const hours = Math.floor(gameDuration / 60 / 60);
  const minutes = Math.floor(gameDuration / 60);
  const seconds = gameDuration - hours * 60 * 60 - minutes * 60;

  if (hours > 9) {
    HOURS_SPAN.innerText = `${hours}`;
  } else {
    HOURS_SPAN.innerText = `0${hours}`;
  }
  if (minutes > 9) {
    MINUTES_SPAN.innerText = `${minutes}`;
  } else {
    MINUTES_SPAN.innerText = `0${minutes}`;
  }
  if (seconds > 9) {
    SECONDS_SPAN.innerText = `${seconds}`;
  } else {
    SECONDS_SPAN.innerText = `0${seconds}`;
  }
}

function gameStart() {
  wonScreenShowHandler();
  winningInformationObject = { turns: 0, gameDuration: 0, date: 0 };
  isGameWon = false;
  isWonScreenShown = false;
  START_BUTTON.disabled = true;
  STOP_BUTTON.disabled = false;
  menuOpeningHandler();

  gameDuration = 0;
  gameTimer = setInterval(() => {
    gameDuration += 1;
    gameClockUpdater();
  }, 1000);
  turns = 0;
  TURNS_SPAN.innerText = `${turns}`;

  isGameStarted = true;
  matrixGeneration();
  matrixRendering(gameMatrix);
  gameBlocksListenersAdder();
}

function gameStop() {
  START_BUTTON.disabled = false;
  STOP_BUTTON.disabled = true;

  clearInterval(gameTimer);
  gameClockUpdater();
  isGameStarted = false;
  matrixRendering(victoriousArray);

  if (isGameWon) {
    wonScreenShowHandler();
    topResultSave();
  }

  saveGameState();
}

function menuOpeningHandler() {
  if (isMenuOpened) {
    MENU_BUTTONS_WRAPPER.classList.remove("menu-buttons-opened");
    isMenuOpened = false;
    if (isTopResultsShown) {
      isTopResultsShown = false;
      TOP_SCORE_WRAPPER.classList.remove("top-score-wrapper-is-shown");
    }
  } else {
    MENU_BUTTONS_WRAPPER.classList.add("menu-buttons-opened");
    isMenuOpened = true;
  }
}
menuOpeningHandler();

function matrixGeneration() {
  let usedNumbers = [];
  let blockValue = Math.round(Math.random() * 15);

  for (let count = 0; count < 16; count++) {
    while (usedNumbers.some((usedValue) => usedValue === blockValue)) {
      blockValue = Math.round(Math.random() * 15);
    }

    if (count <= 3) {
      usedNumbers.push(blockValue);
      gameMatrix[0][count] = blockValue;
    }

    if (count > 3 && count <= 7) {
      usedNumbers.push(blockValue);
      gameMatrix[1][count - 4] = blockValue;
    }

    if (count > 7 && count <= 11) {
      usedNumbers.push(blockValue);
      gameMatrix[2][count - 8] = blockValue;
    }

    if (count > 11 && count <= 15) {
      usedNumbers.push(blockValue);
      gameMatrix[3][count - 12] = blockValue;
    }
  }

  if (JSON.stringify(victoriousGameMatrix) === JSON.stringify(gameMatrix)) {
    matrixGeneration();
  }

  if (gameMatrix[0].some((gameMatrixValue) => gameMatrixValue === 0)) {
    emptyBlockCoords.row = 0;
  } else if (gameMatrix[1].some((gameMatrixValue) => gameMatrixValue === 0)) {
    emptyBlockCoords.row = 1;
  } else if (gameMatrix[2].some((gameMatrixValue) => gameMatrixValue === 0)) {
    emptyBlockCoords.row = 2;
  } else {
    emptyBlockCoords.row = 3;
  }

  emptyBlockCoords.col = gameMatrix[emptyBlockCoords.row].findIndex(
    (value) => value === 0
  );
}

function blockSizeCorrection() {
  windowWidth = window.innerWidth;
  windowHeight = window.innerHeight;
  RESOLUTION_INFO_TEXT.innerHTML = `width: <span>${windowWidth}px</span> height: <span>${windowHeight}px</span>`;
  // window resolution info update

  if (window.innerWidth < 320) {
    blockSize = 60;
    document.documentElement.style.setProperty(
      "--block-size",
      blockSize + "px"
    );
  } else if (window.innerWidth >= 320 && window.innerWidth < 768) {
    blockSize = 75;
    document.documentElement.style.setProperty(
      "--block-size",
      blockSize + "px"
    );
  } else if (window.innerWidth >= 768 && window.innerWidth < 1280) {
    blockSize = 130;
    document.documentElement.style.setProperty(
      "--block-size",
      blockSize + "px"
    );
  } else {
    blockSize = 150;
    document.documentElement.style.setProperty(
      "--block-size",
      blockSize + "px"
    );
  }

  if (!isGameStarted) {
    matrixRendering(victoriousArray);
  } else {
    matrixRendering(gameMatrix);
    gameBlocksListenersAdder();
  }
}
blockSizeCorrection();

function matrixRendering(matrix) {
  GAME_MATRIX_AREA.innerHTML = "";

  if (!isGameStarted) {
    for (let i = 0; i < matrix.length; i++) {
      let gameBlock = document.createElement("div");
      gameBlock.classList.add("game-block");
      gameBlock.classList.add("demo-block");

      if (matrix[i] === 0) continue;

      switch (true) {
        case i === 0:
          gameBlock.style.transform = `translateY(${0}px) translateX(${0}px)`;
          gameBlock.innerText = matrix[i];
          break;
        case i === 1:
          gameBlock.style.transform = `translateY(${
            blockSize * 0
          }px) translateX(${blockSize * 1}px)`;
          gameBlock.innerText = matrix[i];
          break;
        case i === 2:
          gameBlock.style.transform = `translateY(${
            blockSize * 0
          }px) translateX(${blockSize * 2}px)`;
          gameBlock.innerText = matrix[i];
          gameBlock.innerText = matrix[i];
          break;
        case i === 3:
          gameBlock.style.transform = `translateY(${
            blockSize * 0
          }px) translateX(${blockSize * 3}px)`;
          gameBlock.innerText = matrix[i];
          break;
        case i === 4:
          gameBlock.style.transform = `translateY(${
            blockSize * 1
          }px) translateX(${blockSize * 0}px)`;
          gameBlock.innerText = matrix[i];
          break;
        case i === 5:
          gameBlock.style.transform = `translateY(${
            blockSize * 1
          }px) translateX(${blockSize * 1}px)`;
          gameBlock.innerText = matrix[i];
          break;
        case i === 6:
          gameBlock.style.transform = `translateY(${
            blockSize * 1
          }px) translateX(${blockSize * 2}px)`;
          gameBlock.innerText = matrix[i];
          break;
        case i === 7:
          gameBlock.style.transform = `translateY(${
            blockSize * 1
          }px) translateX(${blockSize * 3}px)`;
          gameBlock.innerText = matrix[i];
          break;
        case i === 8:
          gameBlock.style.transform = `translateY(${
            blockSize * 2
          }px) translateX(${blockSize * 0}px)`;
          gameBlock.innerText = matrix[i];
          break;
        case i === 9:
          gameBlock.style.transform = `translateY(${
            blockSize * 2
          }px) translateX(${blockSize * 1}px)`;
          gameBlock.innerText = matrix[i];
          break;
        case i === 10:
          gameBlock.style.transform = `translateY(${
            blockSize * 2
          }px) translateX(${blockSize * 2}px)`;
          gameBlock.innerText = matrix[i];
          break;
        case i === 11:
          gameBlock.style.transform = `translateY(${
            blockSize * 2
          }px) translateX(${blockSize * 3}px)`;
          gameBlock.innerText = matrix[i];
          break;
        case i === 12:
          gameBlock.style.transform = `translateY(${
            blockSize * 3
          }px) translateX(${blockSize * 0}px)`;
          gameBlock.innerText = matrix[i];
          break;
        case i === 13:
          gameBlock.style.transform = `translateY(${
            blockSize * 3
          }px) translateX(${blockSize * 1}px)`;
          gameBlock.innerText = matrix[i];
          break;
        case i === 14:
          gameBlock.style.transform = `translateY(${
            blockSize * 3
          }px) translateX(${blockSize * 2}px)`;
          gameBlock.innerText = matrix[i];
          break;
        case i === 15:
          gameBlock.style.transform = `translateY(${
            blockSize * 3
          }px) translateX(${blockSize * 3}px)`;
          gameBlock.innerText = matrix[i];
      }

      gameBlock.style.cursor = "default";
      gameBlock.addEventListener("click", blockClickHandler);
      gameBlock.addEventListener("animationend", animationCancel);
      GAME_MATRIX_AREA.appendChild(gameBlock);
    }
  } else {
    for (let i = 0; i < 4; i++) {
      if (matrix[0][i] !== 0) {
        let gameBlock = document.createElement("div");
        gameBlock.classList.add("game-block");

        gameBlock.style.transform = `translateY(${
          blockSize * 0
        }px) translateX(${blockSize * i}px)`;
        gameBlock.innerText = matrix[0][i];

        gameBlock.addEventListener("animationend", animationCancel);
        GAME_MATRIX_AREA.appendChild(gameBlock);
      }

      if (matrix[1][i] !== 0) {
        let gameBlock = document.createElement("div");
        gameBlock.classList.add("game-block");

        gameBlock.style.transform = `translateY(${
          blockSize * 1
        }px) translateX(${blockSize * i}px)`;
        gameBlock.innerText = matrix[1][i];

        gameBlock.addEventListener("animationend", animationCancel);
        GAME_MATRIX_AREA.appendChild(gameBlock);
      }

      if (matrix[2][i] !== 0) {
        let gameBlock = document.createElement("div");
        gameBlock.classList.add("game-block");

        gameBlock.style.transform = `translateY(${
          blockSize * 2
        }px) translateX(${blockSize * i}px)`;
        gameBlock.innerText = matrix[2][i];

        gameBlock.addEventListener("animationend", animationCancel);
        GAME_MATRIX_AREA.appendChild(gameBlock);
      }

      if (matrix[3][i] !== 0) {
        let gameBlock = document.createElement("div");
        gameBlock.classList.add("game-block");

        gameBlock.style.transform = `translateY(${
          blockSize * 3
        }px) translateX(${blockSize * i}px)`;
        gameBlock.innerText = matrix[3][i];

        gameBlock.addEventListener("animationend", animationCancel);
        GAME_MATRIX_AREA.appendChild(gameBlock);
      }
    }
  }
}

const blockMovingAbilityChecking = (targetBlock, checking = false) => {
  if (isGameStarted && checking) {
    if (
      gameMatrix[0].some(
        (gameMatrixValue) => gameMatrixValue === Number(event.target.innerText)
      )
    ) {
      targetBlockCoords.row = 0;
    } else if (
      gameMatrix[1].some(
        (gameMatrixValue) => gameMatrixValue === Number(event.target.innerText)
      )
    ) {
      targetBlockCoords.row = 1;
    } else if (
      gameMatrix[2].some(
        (gameMatrixValue) => gameMatrixValue === Number(event.target.innerText)
      )
    ) {
      targetBlockCoords.row = 2;
    } else {
      targetBlockCoords.row = 3;
    }

    targetBlockCoords.col = gameMatrix[targetBlockCoords.row].findIndex(
      (value) => value === Number(event.target.innerText)
    );
  }

  if (
    targetBlockCoords.row > 0 &&
    targetBlockCoords.row - 1 === emptyBlockCoords.row &&
    targetBlockCoords.col === emptyBlockCoords.col
  ) {
    if (checking) {
      canMoveUp = false;
      canMoveDown = false;
      canMoveLeft = false;
      canMoveRight = false;

      canMoveUp = true;
      return true;
    }

    targetBlock.style.transform = `translateY(${
      emptyBlockCoords.row * blockSize
    }px) translateX(${emptyBlockCoords.col * blockSize}px)`;
    targetBlock.classList.add("sliding-block");

    gameMatrix[emptyBlockCoords.row][emptyBlockCoords.col] = Number(
      targetBlock.innerText
    );
    emptyBlockCoords.row = targetBlockCoords.row;
    emptyBlockCoords.col = targetBlockCoords.col;
    gameMatrix[emptyBlockCoords.row][emptyBlockCoords.col] = 0;
    turns++;
    TURNS_SPAN.innerText = `${turns}`;

    if (isSoundsOn) {
      AUDIO_PLAYER.src = "./assets/slide.wav";
      AUDIO_PLAYER.play().catch((error) => {
        console.log(error);
      });
    }

    if (JSON.stringify(victoriousGameMatrix) === JSON.stringify(gameMatrix)) {
      isGameWon = true;
      gameStop();

      if (isSoundsOn) {
        AUDIO_PLAYER.src = "./assets/victory.mp3";
        AUDIO_PLAYER.play().catch((error) => {
          console.log(error);
        });
      }
    }
  } else if (
    targetBlockCoords.row < 3 &&
    targetBlockCoords.row + 1 === emptyBlockCoords.row &&
    targetBlockCoords.col === emptyBlockCoords.col
  ) {
    if (checking) {
      canMoveUp = false;
      canMoveDown = false;
      canMoveLeft = false;
      canMoveRight = false;

      canMoveDown = true;
      return true;
    }

    targetBlock.style.transform = `translateY(${
      emptyBlockCoords.row * blockSize
    }px) translateX(${emptyBlockCoords.col * blockSize}px)`;
    targetBlock.classList.add("sliding-block");

    gameMatrix[emptyBlockCoords.row][emptyBlockCoords.col] = Number(
      targetBlock.innerText
    );
    emptyBlockCoords.row = targetBlockCoords.row;
    emptyBlockCoords.col = targetBlockCoords.col;
    gameMatrix[emptyBlockCoords.row][emptyBlockCoords.col] = 0;
    turns++;
    TURNS_SPAN.innerText = `${turns}`;

    if (isSoundsOn) {
      AUDIO_PLAYER.src = "./assets/slide.wav";
      AUDIO_PLAYER.play().catch((error) => {
        console.log(error);
      });
    }

    if (JSON.stringify(victoriousGameMatrix) === JSON.stringify(gameMatrix)) {
      isGameWon = true;
      gameStop();

      if (isSoundsOn) {
        AUDIO_PLAYER.src = "./assets/victory.mp3";
        AUDIO_PLAYER.play().catch((error) => {
          console.log(error);
        });
      }
    }
  } else if (
    targetBlockCoords.col > 0 &&
    targetBlockCoords.col - 1 === emptyBlockCoords.col &&
    targetBlockCoords.row === emptyBlockCoords.row
  ) {
    if (checking) {
      canMoveUp = false;
      canMoveDown = false;
      canMoveLeft = false;
      canMoveRight = false;

      canMoveLeft = true;
      return true;
    }

    targetBlock.style.transform = `translateY(${
      emptyBlockCoords.row * blockSize
    }px) translateX(${emptyBlockCoords.col * blockSize}px)`;
    targetBlock.classList.add("sliding-block");

    gameMatrix[emptyBlockCoords.row][emptyBlockCoords.col] = Number(
      targetBlock.innerText
    );
    emptyBlockCoords.row = targetBlockCoords.row;
    emptyBlockCoords.col = targetBlockCoords.col;
    gameMatrix[emptyBlockCoords.row][emptyBlockCoords.col] = 0;
    turns++;
    TURNS_SPAN.innerText = `${turns}`;

    if (isSoundsOn) {
      AUDIO_PLAYER.src = "./assets/slide.wav";
      AUDIO_PLAYER.play().catch((error) => {
        console.log(error);
      });
    }

    if (JSON.stringify(victoriousGameMatrix) === JSON.stringify(gameMatrix)) {
      isGameWon = true;
      gameStop();

      if (isSoundsOn) {
        AUDIO_PLAYER.src = "./assets/victory.mp3";
        AUDIO_PLAYER.play().catch((error) => {
          console.log(error);
        });
      }
    }
  } else if (
    targetBlockCoords.col < 3 &&
    targetBlockCoords.col + 1 === emptyBlockCoords.col &&
    targetBlockCoords.row === emptyBlockCoords.row
  ) {
    if (checking) {
      canMoveUp = false;
      canMoveDown = false;
      canMoveLeft = false;
      canMoveRight = false;

      canMoveRight = true;
      return true;
    }

    targetBlock.style.transform = `translateY(${
      emptyBlockCoords.row * blockSize
    }px) translateX(${emptyBlockCoords.col * blockSize}px)`;
    targetBlock.classList.add("sliding-block");

    gameMatrix[emptyBlockCoords.row][emptyBlockCoords.col] = Number(
      targetBlock.innerText
    );
    emptyBlockCoords.row = targetBlockCoords.row;
    emptyBlockCoords.col = targetBlockCoords.col;
    gameMatrix[emptyBlockCoords.row][emptyBlockCoords.col] = 0;
    turns++;
    TURNS_SPAN.innerText = `${turns}`;

    if (isSoundsOn) {
      AUDIO_PLAYER.src = "./assets/slide.wav";
      AUDIO_PLAYER.play().catch((error) => {
        console.log(error);
      });
    }

    if (JSON.stringify(victoriousGameMatrix) === JSON.stringify(gameMatrix)) {
      isGameWon = true;
      gameStop();

      if (isSoundsOn) {
        AUDIO_PLAYER.src = "./assets/victory.mp3";
        AUDIO_PLAYER.play().catch((error) => {
          console.log(error);
        });
      }
    }
  } else {
    targetBlock.classList.add("error-block");

    if (isSoundsOn) {
      AUDIO_PLAYER.src = "./assets/wrong.mp3";
      AUDIO_PLAYER.play().catch((error) => {
        console.log(error);
      });
    }
  }

  targetBlockCoords.row = 0;
  targetBlockCoords.col = 0;
};

function blockClickHandler(event) {
  if (isGameStarted) {
    if (
      gameMatrix[0].some(
        (gameMatrixValue) => gameMatrixValue === Number(event.target.innerText)
      )
    ) {
      targetBlockCoords.row = 0;
    } else if (
      gameMatrix[1].some(
        (gameMatrixValue) => gameMatrixValue === Number(event.target.innerText)
      )
    ) {
      targetBlockCoords.row = 1;
    } else if (
      gameMatrix[2].some(
        (gameMatrixValue) => gameMatrixValue === Number(event.target.innerText)
      )
    ) {
      targetBlockCoords.row = 2;
    } else {
      targetBlockCoords.row = 3;
    }

    targetBlockCoords.col = gameMatrix[targetBlockCoords.row].findIndex(
      (value) => value === Number(event.target.innerText)
    );

    blockMovingAbilityChecking(event.target);
  }
}

function animationCancel(event) {
  if ((event.animationName = "error-block")) {
    event.target.classList.remove("error-block");
  }

  if ((event.animationName = "sliding-block")) {
    event.target.classList.remove("sliding-block");
    event.target.style.zIndex = 0;
  }
}

// listeners
window.addEventListener("load", blockSizeCorrection);
window.addEventListener("resize", blockSizeCorrection);
GAME_MENU_BUTTON.addEventListener("click", menuOpeningHandler);
START_BUTTON.addEventListener("click", gameStart);
STOP_BUTTON.addEventListener("click", gameStop);
SOUND_ON_OFF_ICON.addEventListener("click", soundOnOffHandler);
SAVE_BUTTON.addEventListener("click", saveGameState);
TOP_BUTTON.addEventListener("click", topResultShowHandler);
CONTROLS_SWITCHER.addEventListener("click", controlsModeHandler);
