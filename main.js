const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;
const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

const N = 150;
let cars = generateCars(N);
let bestCar = cars[0];
let amount = 0.1;
if (localStorage.getItem("bestBrain")) {
  for (let i = 0; i < cars.length; i++) {
    cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
    if (i != 0) {
      NeuralNetwork.mutate(cars[i].brain, amount);
    }
  }
}

setInterval(() => {
  amount /= 1.5;
}, 500000);

// const traffic = [
//   new Car(road.getLaneCenter(1), -200, 30, 50, "DUMMY", 2),
//   new Car(road.getLaneCenter(1), -400, 30, 50, "DUMMY", 2),
//   new Car(road.getLaneCenter(2), -400, 30, 50, "DUMMY", 2),
//   new Car(road.getLaneCenter(0), -600, 30, 50, "DUMMY", 2),
//   new Car(road.getLaneCenter(0), -800, 30, 50, "DUMMY", 2),
//   new Car(road.getLaneCenter(1), -800, 30, 50, "DUMMY", 2),
//   new Car(road.getLaneCenter(2), -1000, 30, 50, "DUMMY", 2),
//   new Car(road.getLaneCenter(1), -1000, 30, 50, "DUMMY", 2),
//   new Car(road.getLaneCenter(0), -1200, 30, 50, "DUMMY", 2),
//   new Car(road.getLaneCenter(1), -1200, 30, 50, "DUMMY", 2),
//   new Car(road.getLaneCenter(0), -1400, 30, 50, "DUMMY", 2),
//   new Car(road.getLaneCenter(1), -1400, 30, 50, "DUMMY", 2),
//   new Car(road.getLaneCenter(2), -1600, 30, 50, "DUMMY", 2),
//   new Car(road.getLaneCenter(1), -1600, 30, 50, "DUMMY", 2),
// ];

let traffic = getRandomTraffic(60, 20);

function getRandomTraffic(count, yPointsCount = 10) {
  const maxCarsOnLevel = 2;
  const traffic = [];
  for (let i = 0; i < count; i++) {
    const x = road.getLaneCenter(Math.floor(Math.random() * 3));
    let y = -200 * Math.ceil(Math.random() * yPointsCount);
    if (traffic.length) {
      let carsOnSameYCount = traffic.reduce((acc, cur) => {
        if (cur.y === y) return acc + 1;
        return acc;
      }, 0);
      while (carsOnSameYCount === maxCarsOnLevel) {
        y -= 200;
        carsOnSameYCount = traffic.reduce((acc, cur) => {
          if (cur.y === y) return acc + 1;
          return acc;
        }, 0);
      }
    }
    traffic.push(new Car(x, y, 30, 50, "DUMMY", 0));
  }
  return traffic;
}

animate();

const genCountDiv = document.getElementById("genCount");
let prevY = bestCar.y;
let genCount = 1;
genCountDiv.innerHTML = "Поколение: " + genCount;
setInterval(() => {
  if (bestCar.y == prevY) updateGen();
  prevY = bestCar.y;
}, 1000);

function updateGen() {
  save();
  traffic = getRandomTraffic(60, 40);
  cars = generateCars(N);
  if (localStorage.getItem("bestBrain")) {
    for (let i = 0; i < cars.length; i++) {
      cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
      if (i != 0) {
        NeuralNetwork.mutate(cars[i].brain, amount);
      }
    }
  }
  genCount++;
  genCountDiv.innerHTML = "Поколение: " + genCount;
  // animate();
}

function save() {
  localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function discard() {
  localStorage.removeItem("bestBrain");
}

function generateCars(N) {
  const cars = [];
  for (let i = 1; i <= N; i++) {
    cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"));
  }
  return cars;
}

function animate(time) {
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].update(road.borders, []);
  }
  for (let i = 0; i < cars.length; i++) {
    cars[i].update(road.borders, traffic);
  }
  bestCar = cars.find((c) => c.y == Math.min(...cars.map((c) => c.y)));

  carCanvas.height = window.innerHeight;
  networkCanvas.height = window.innerHeight;

  carCtx.save();
  carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);

  road.draw(carCtx);
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].draw(carCtx, "red");
  }
  carCtx.globalAlpha = 0.2;
  for (let i = 0; i < cars.length; i++) {
    cars[i].draw(carCtx, "blue");
  }
  carCtx.globalAlpha = 1;
  bestCar.draw(carCtx, "blue", true);

  carCtx.restore();
  console.log(bestCar.brain);
  networkCtx.lineDashOffset = -time / 50;
  Visualizer.drawNetwork(networkCtx, bestCar.brain);
  requestAnimationFrame(animate);
}
