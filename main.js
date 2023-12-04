import { Bodies, Body, Engine, Events, Render, Runner, World } from "matter-js";
import { FRUITS_BASE, FRUITS_HLW } from "./fruits";
import "./dark.css";

let THEME = "basea"; // { base, halloween }
let FRUITS = FRUITS_BASE;
let backVolumn = 0.8;
let backMusic = 'Holly Dazed - RKVC.mp3';
let backLoop = true;
let bsound = null;
let watermelon = '';

switch (THEME) {
  case "halloween":
    FRUITS = FRUITS_HLW;
    break;
  default:
    FRUITS = FRUITS_BASE;
}

const engine = Engine.create();
const render = Render.create({
  engine,
  element: document.body,
  options: {
    wireframes: false,
    background: "#F7F4C8",
    width: 620,
    height: 850,
  }
});

const world = engine.world;

const leftWall = Bodies.rectangle(15, 395, 30, 790, {
  isStatic: true,
  render: { fillStyle: "#E6B143" }
});

const rightWall = Bodies.rectangle(605, 395, 30, 790, {
  isStatic: true,
  render: { fillStyle: "#E6B143" }
});

const ground = Bodies.rectangle(310, 820, 620, 60, {
  isStatic: true,
  render: { fillStyle: "#E6B143" }
});

const topLine = Bodies.rectangle(310, 150, 620, 2, {
  name: "topLine",
  isStatic: true,
  isSensor: true,
  render: { fillStyle: "#E6B143" }
})


//todo::
function playBackMusinc() {
  // 선택된 mp3 파일 재생
  bsound = new Audio(backMusic);
  bsound.loop = backLoop; // 음악이 끝나면 다시 시작하도록 설정
  bsound.volume = backVolumn; // 볼륨을 70%로 설정
  // bsound.play();

  // 사용자의 상호작용에 응답하여 오디오를 재생합니다.
  document.body.addEventListener('click', function () {
    bsound.play();
  });
}


World.add(world, [leftWall, rightWall, ground, topLine]);
playBackMusinc();

Render.run(render);
Runner.run(engine);

let currentBody = null;
let currentFruit = null;
let disableAction = false;
let interval = null;
function addFruit() {
  const index = Math.floor(Math.random() * 5);
  const fruit = FRUITS[index];

  const body = Bodies.circle(300, 50, fruit.radius, {
    index: index,
    isSleeping: true,
    render: {
      sprite: { texture: `${fruit.name}.png` }
    },
    restitution: 0.2,
  });

  currentBody = body;
  currentFruit = fruit;

  World.add(world, body);

  disableAction = false;
  canvas.addEventListener('click', handleClick); // click 이벤트 핸들러 추가\
}

window.onkeydown = (event) => {
  if (disableAction) {
    return;
  }

  switch (event.key) {
    // switch (event.code) {
    case "ArrowLeft":
      if (interval)
        return;

      interval = setInterval(() => {
        if (currentBody.position.x - currentFruit.radius > 30)
          Body.setPosition(currentBody, {
            x: currentBody.position.x - 1,
            y: currentBody.position.y,
          });
      }, 5);
      break;

    case "ArrowRight":
      if (interval)
        return;

      interval = setInterval(() => {
        if (currentBody.position.x + currentFruit.radius < 590)
        Body.setPosition(currentBody, {
          x: currentBody.position.x + 1,
          y: currentBody.position.y,
        });
      }, 5);
      break;

    // case "KeyS":
    case "ArrowDown":
      stackFruit();
      break;
  }

  switch (event.code) {
    case "Space":
      stackFruit();
      break;
  }
}

function stackFruit(){
  currentBody.isSleeping = false;
  disableAction = true;
  canvas.removeEventListener('click', handleClick); // click 이벤트 핸들러 제거

  setTimeout(() => {
    addFruit();
    disableAction = false;
  }, 1000);
}



window.onkeyup = (event) => {
  bsound.play();
  switch (event.key) {
    case "ArrowLeft":
    case "ArrowRight":
      clearInterval(interval);
      interval = null;
  }
}

let canvas = document.getElementsByTagName('canvas')[0];
let context = canvas.getContext('2d');

// click 이벤트 핸들러를 별도의 함수로 분리합니다.
function handleClick(e) {
  if (disableAction) {
    return;
  }

  let rect = canvas.getBoundingClientRect();
  let x = e.clientX - rect.left - 30 + currentFruit.radius;
  if(x > 0) {
    Body.setPosition(currentBody, {
      x: x + (30 - currentFruit.radius),
      y: currentBody.position.y,
    });
    stackFruit();
  }
}

canvas.addEventListener('click', handleClick);


Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    if (collision.bodyA.index === collision.bodyB.index) {
      const index = collision.bodyA.index;

      if (index === FRUITS.length - 1) {
        return;
      }

      World.remove(world, [collision.bodyA, collision.bodyB]);

      const newFruit = FRUITS[index + 1];

      const newBody = Bodies.circle(
        collision.collision.supports[0].x,
        collision.collision.supports[0].y,
        newFruit.radius,
        {
          render: {
            sprite: { texture: `${newFruit.name}.png` }
          },
          index: index + 1,
        }
      );


      // let sounds = ['Glass Drop and Roll.mp3', 'Metallic Clank.mp3'];
      let sounds = ['39.mp3'];
      // 무작위 index 선택
      let randomIndex = Math.floor(Math.random() * sounds.length);

      // 선택된 mp3 파일 재생
      let sound = new Audio(sounds[randomIndex]);
      sound.play();

      World.add(world, newBody);

      if(newFruit.name === 'base/10_watermelon') {
        watermelon = newFruit.name;
      }

    }

    if (
      !disableAction &&
      (collision.bodyA.name === "topLine" || collision.bodyB.name === "topLine")) {
      // (collision.bodyA.name === "topLine" )) {

      if(confirm("Retry?")){
        return;
      }

      endGame();
    }
  });


});

Events.on(engine, "collisionEnd", (event) => {
  // 'watermelon'이라는 이름이 존재하면 알림을 보냅니다.
  if(watermelon === 'base/10_watermelon') {

    watermelon = '';
    disableAction = true;
    canvas.removeEventListener('click', handleClick); // click 이벤트 핸들러 제거

    setTimeout(() => {
      alert('You win!!!');
      // endGame();
      return;
    }, 500);

  }

});


addFruit();

function endGame(){
  // 선택된 음악 재생 멈추기
  bsound.pause();

// 재생 위치를 초기 위치로 설정
  bsound.currentTime = 0;

  currentBody = null;
  currentFruit = null;

  // 현재의 world를 비웁니다.
  World.clear(world, false);

  // 게임 시작 시 초기에 생성했던 객체들을 다시 생성합니다.
  World.add(world, [leftWall, rightWall, ground, topLine]);
  // playBackMusinc();
  //
  // // 새로운 과일을 추가합니다.
  addFruit();

}

window.endGame = endGame;