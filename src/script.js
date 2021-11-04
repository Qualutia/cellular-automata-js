import { OrbitControls } from './three/examples/jsm/controls/OrbitControls.js';
import * as THREE from './three/build/three.module.js';
import { BufferGeometryUtils } from './three/examples/jsm/utils/BufferGeometryUtils.js'

const customTitlebar = require('custom-electron-titlebar');


new customTitlebar.Titlebar({
  backgroundColor: customTitlebar.Color.fromHex('#212121'),
  overflow: "hidden",
  titleHorizontalAlignment: "left",
  enableMnemonics: true,
  // menu: null,
  icon: "./icons/app_icon.png"
});


let scene, camera, renderer;

let width = window.innerWidth;
let height = window.innerHeight;
let unit = 10;


//Controls : Simulation Type//
let simulationType = '3D';

const button2D = document.getElementById('button-2d')
const button3D = document.getElementById('button-3d')
const iterationsContainer = document.getElementById('iteration-container');

if (simulationType == '2D') {
  button2D.style.backgroundColor = 'rgba(140,80,80, 0.6)';
} else if (simulationType == '3D') {
  button3D.style.backgroundColor = 'rgba(140,80,80, 0.6)';
  iterationsContainer.style.opacity = '1.0';
}

button2D.addEventListener('click', function () {
  simulationType = '2D';
  button2D.style.backgroundColor = 'rgba(140,80,80, 0.6)';
  button3D.style.backgroundColor = 'var(--color-contrast-lowest)';
  iterationsContainer.style.opacity = '0.3';
  // createArrays();
  pauseModel();
  resetModel();
})

button3D.addEventListener('click', function () {
  simulationType = '3D';
  button3D.style.backgroundColor = 'rgba(140,80,80, 0.6)';
  button2D.style.backgroundColor = 'var(--color-contrast-lowest)';

  iterationsContainer.style.opacity = '0.8';
  pauseModel();
  resetModel();
  // createArrays()
})


//Controls : Clear / Trash//

const buttonTrash = document.getElementById('trash-button')
buttonTrash.addEventListener('click', function () {
  resetModel()
});




let spaceX, spaceY, spaceZ;
let sizeX, sizeY, sizeZ;
let version = getRandomInt(0, 9999)

sizeX = 60;
sizeY = 60;
sizeZ = 60;

spaceX = sizeX * unit;
spaceY = sizeY * unit;
spaceZ = sizeZ * unit;

let countIterations = 20;


// Iteration Counter //

const iterationsField = document.getElementById('iteration-field');
const iterationsPlus = document.getElementById('iteration+');
const iterationsMinus = document.getElementById('iteration-');

iterationsField.innerHTML = countIterations;

iterationsPlus.addEventListener('click', function () {
  countIterations += 5;
  iterationsField.innerHTML = countIterations;
  resetModel()
});
iterationsMinus.addEventListener('click', function () {
  countIterations -= 5;
  iterationsField.innerHTML = countIterations;
  resetModel()
});


//THREE//

scene = new THREE.Scene();
scene.background = new THREE.Color('rgb(20,20,20)');


//CAMERA SET-UP//
camera = new THREE.PerspectiveCamera(30, width / height, 1, 20000);

var aspect = window.innerWidth / window.innerHeight;
// camera = new THREE.OrthographicCamera( - d * aspect, d * aspect, d, - d, 1, 20000 );

renderer = new THREE.WebGLRenderer({
  antialias: true,
  precision: "highp",
  powerPreference: "high-performance",
  preserveDrawingBuffer: true
});
renderer.setSize(window.innerWidth, window.innerHeight);

renderer.setPixelRatio(window.devicePixelRatio);


document.getElementById('canvas').appendChild(renderer.domElement);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;



//CONTROLS//
let controls = new OrbitControls(camera, renderer.domElement);
// controls.autoRotate = true
controls.minDistance = 500
controls.maxDistance = 20000

camera.position.set(1000, 2000, 1000);
camera.lookAt(new THREE.Vector3(1000, 2000, 1000));
controls.update();



function globalLight() {

  let spotLight = new THREE.SpotLight(0xffffff, 1);

  spotLight.position.set(500, 3500, 500);
  spotLight.intensity = 2;

  // spotLight.angle = 0.4;
  // spotLight.penumbra = 0.1;
  spotLight.decay = 1;
  spotLight.distance = 10000;
  spotLight.shadow.mapSize.width = 4096;
  spotLight.shadow.mapSize.height = 4096;
  spotLight.shadow.camera.near = 40;
  spotLight.shadow.camera.far = spaceY * 2.5;
  spotLight.shadow.camera.fov = 60;
  spotLight.castShadow = true;
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  // scene.add( new THREE.CameraHelper( spotLight.shadow.camera ) );
  scene.add(ambientLight);
  scene.add(spotLight);

}
globalLight()


//Create A Voxel
function makeVoxel(iteration, x, y, z) {

  const geometry = new THREE.BoxBufferGeometry(unit * 0.9, unit * 0.9, unit * 0.9);

  let value_x = unit * x + (unit * 0.5)
  let value_y = unit * y + (unit * 0.5)
  let value_z = unit * z + (unit * 0.5)

  // geometry.translate(unit * 0.5.floor().multiplyScalar(unit).addScalar(unit/2), unit * 0.5, unit * 0.5);
  geometry.translate(value_x, value_y, value_z)

  return geometry
}



//Handels Window Resize
function handleWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
}

window.addEventListener('resize', handleWindowResize);

let helper = voxelsHelper(spaceX, spaceY, spaceZ)
scene.add(helper)


// X Values Counter //
const xPlus = document.getElementById('x+');
const xMinus = document.getElementById('x-');

let fieldX = document.getElementById('x-field');
fieldX.innerHTML = sizeX;

xMinus.addEventListener('click', function () {
  if (sizeX > 10) {
    sizeX -= 5;
    spaceX = sizeX * unit;
    fieldX.innerHTML = sizeX;

    scene.remove(helper);
    helper = voxelsHelper(spaceX, spaceY, spaceZ);
    scene.add(helper)
    resetModel();
    pauseModel();
  }
})

xPlus.addEventListener('click', function () {
  sizeX += 5;
  spaceX = sizeX * unit;
  fieldX.innerHTML = sizeX;

  scene.remove(helper);
  helper = voxelsHelper(spaceX, spaceY, spaceZ);
  scene.add(helper)
  resetModel();
  pauseModel();
});



// Y Values Counter //
const yPlus = document.getElementById('y+');
const yMinus = document.getElementById('y-');

let fieldY = document.getElementById('y-field');
fieldY.innerHTML = sizeY;

yMinus.addEventListener('click', function () {
  if (sizeY > 10) {
    sizeY -= 5;
    spaceY = sizeY * unit;
    fieldY.innerHTML = sizeY;

    scene.remove(helper);
    helper = voxelsHelper(spaceX, spaceY, spaceZ);
    scene.add(helper)
    resetModel();
    pauseModel();
  }
})

yPlus.addEventListener('click', function () {
  sizeY += 5;
  spaceY = sizeY * unit;
  fieldY.innerHTML = sizeY;

  scene.remove(helper);
  helper = voxelsHelper(spaceX, spaceY, spaceZ);
  scene.add(helper)
  resetModel();
  pauseModel();
})


// Z Values Counter //
const zPlus = document.getElementById('z+');
const zMinus = document.getElementById('z-');

let fieldZ = document.getElementById('z-field');
fieldZ.innerHTML = sizeZ;

zMinus.addEventListener('click', function () {
  if (sizeZ > 10) {
    sizeZ -= 5;
    spaceZ = sizeZ * unit;
    fieldZ.innerHTML = sizeZ;

    scene.remove(helper);
    helper = voxelsHelper(spaceX, spaceY, spaceZ);
    scene.add(helper)
    resetModel();
    pauseModel();
  }
})

zPlus.addEventListener('click', function () {
  sizeZ += 5;
  spaceZ = sizeZ * unit;
  fieldZ.innerHTML = sizeZ;

  scene.remove(helper);
  helper = voxelsHelper(spaceX, spaceY, spaceZ);
  scene.add(helper)
  resetModel();
  pauseModel();
})

//////////////
/// Arrays ///

function make2DArray(cols, rows) {
  let array = new Array(cols);
  for (let i = 0; i < cols; i++) {
    array[i] = new Array(rows);
  }
  return array
}

function make3DArray(cols, rows, depth) {
  let array = make2DArray(cols, rows)

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      array[i][j] = new Array(depth).fill(0);
    }
  }
  return array
}

//Looop

let iteration = 0;
let current;


function createArrays(size) {

  if (simulationType === '2D') {

    current = make2DArray(sizeX, sizeZ)

    for (let x = 1; x < sizeX - 1; x++) {
      for (let y = 1; y < sizeZ - 1; y++) {
        current[x][y] = Math.floor(Math.random(2) * 2)
      }
    }
  } else

  {
    current = make3DArray(sizeX, sizeZ, sizeY);


    let comp = size;

    for (let x = 1; x < sizeX - 1; x++) {
      for (let y = 1; y < sizeZ - 1; y++) {
        for (let z = 1; z < sizeY - 1; z++) {


          if ((x <= sizeX / 2 + comp && x >= sizeX / 2 - comp) &&
            (y <= sizeZ / 2 + comp && y >= sizeZ / 2 - comp) &&
            (z <= sizeY / 2 + comp && z >= sizeY / 2 - comp)
          ) {
            current[x][y][z] = 1
          } else {
            current[x][y][z] = 0
          }




        }
      }
    }
  }
}

createArrays(5);

let imgList = []

let voxelArray = [];
let current_mesh_3D;
let current_mesh_2D = [];
let current_mesh_section;

function init() {

  imgList = [];


  if (simulationType === '2D' && iteration < sizeY) {

    scene.remove(current_mesh_section)
    voxelArray = []
    let next = make2DArray(sizeX, sizeZ);


    for (let x = 1; x < sizeX - 1; x++) {
      for (let y = 1; y < sizeZ - 1; y++) {

        let neighbours = 0;

        for (let i = -1; i <= 1; i++) {
          for (let j = -1; j <= 1; j++) {
            if (current[x + i][y + j] == 1) {
              neighbours += current[x + i][y + j]
            }
          }
        }

        neighbours -= current[x][y];

        if ((current[x][y] == 1) && (neighbours < 2)) next[x][y] = 0;       //Death - Loneliness
        else if ((current[x][y] == 1) && (neighbours > 3)) next[x][y] = 0;  //Death - Overpopulation
        else if ((current[x][y] == 0) && (neighbours == 3)) next[x][y] = 1; //Reporduced
        else next[x][y] = current[x][y];
      }
    }

    current = next;


    //REPLACE TABLE WITH VOXELS//
    for (let i = 0; i < sizeX; i++) {
      for (let j = 0; j < sizeZ; j++) {
        if (current[i][j] === 1) {

          let voxel = makeVoxel(iteration, i - sizeX / 2, iteration, j - sizeZ / 2)

          voxelArray.push(voxel);
        }
      }
    }



    let color;

    let color_value = Math.floor(255 / countIterations)
    color = ['rgb(' + color_value * iteration, iteration, iteration + ')'].join()

    let geometry = BufferGeometryUtils.mergeBufferGeometries(voxelArray, false);

    let mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
      color: color
    }));
    const mesh_section = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
      color: 'rgb(20,20,20)'
    }));

    mesh_section.position.y += 10;

    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
      color: 0x141414
    }));

    const group = new THREE.Group();

    group.add(mesh);
    group.add(line)

    mesh.castShadow = true
    mesh.receiveShadow = true


    scene.add(mesh_section);
    current_mesh_section = mesh_section;
    current_mesh_2D.push(group)
    scene.add(group)
    iteration++

  }


  /// IF 3D //
  else if (simulationType === '3D' && iteration < countIterations) {

    scene.remove(current_mesh_3D)
    voxelArray = [];

    let next = make3DArray(sizeX, sizeZ, sizeY);


    for (let x = 1; x < sizeX - 1; x++) {
      for (let y = 1; y < sizeZ - 1; y++) {
        for (let z = 1; z < sizeY - 1; z++) {


          let neighbours = 0;

          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              for (let k = -1; k <= 1; k++) {
                if (current[x + i][y + j][z + k] == 1) {
                  neighbours += current[x + i][y + j][z + k]
                }
              }
            }
          }

          neighbours -= current[x][y][z];

          if ((current[x][y][z] == 0) && ((neighbours >= 1) && (neighbours <= 4))) next[x][y][z] = 1;
          else if ((current[x][y][z] == 1) && ((neighbours <= 3) || (neighbours == 6) || (neighbours == 8) || (neighbours == 10) || (neighbours >= 5) || (neighbours == 16))) next[x][y][z] = 0; // born
          // else if   ((current[x][y][z] == 1) && (neighbours == 3))                                 next[x][y][z]  = 0;  // die 
          else next[x][y][z] = current[x][y][z];
        }
      }
    }


    current = next;


    //REPLACE TABLE WITH VOXELS//
    for (let i = 0; i < sizeX; i++) {
      for (let j = 0; j < sizeZ; j++) {
        for (let k = 0; k < sizeY; k++) {
          if (current[i][j][k] == 1) {

            let voxel = makeVoxel(iteration, i - sizeX / 2, k, j - sizeZ / 2);
            voxelArray.push(voxel);

          }
        }
      }
    }


    let color;

    let color_value = Math.floor(255 / countIterations)
    color = ['rgb(' + color_value * iteration, 65, 73 + ')'].join()

    let geometry = BufferGeometryUtils.mergeBufferGeometries(voxelArray, false);

    let material = new THREE.MeshPhongMaterial({
      color: color
    });
    let mesh = new THREE.Mesh(geometry, material);

    const edges = new THREE.EdgesGeometry(geometry);
    const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({
      color: 0x141414
    }));

    const group = new THREE.Group();

    group.add(mesh);
    group.add(line)

    mesh.castShadow = true
    mesh.receiveShadow = true


    current_mesh_3D = group;
    scene.add(group)

    iteration++

    imgList.push(imgData)
  } else pauseModel()



}


let timer;
let isPaused = true;

document.getElementById('pauseModel-button').addEventListener('click', function () {

  const pause = document.getElementById('pause');
  const play = document.getElementById('play');

  if (isPaused === true) {
    timer = window.setInterval(init, 100);
    pause.style.display = 'unset';
    play.style.display = 'none';
    isPaused = false;
  } else if (isPaused === false) {
    window.clearInterval(timer);
    pause.style.display = 'none';
    play.style.display = 'unset';
    isPaused = true;
  }
})

function resetModel() {
  for (let i = 0; i < current_mesh_2D.length; i++) {
    scene.remove(current_mesh_2D[i])
  }

  scene.remove(current_mesh_section)
  current_mesh_section = null;
  scene.remove(current_mesh_3D);
  voxelArray = [];
  iteration = 0;

  createArrays();
  render()
}

function pauseModel() {
  const pause = document.getElementById('pause');
  const play = document.getElementById('play');

  window.clearInterval(timer);
  pause.style.display = 'none';
  play.style.display = 'unset';
  isPaused = true;
}

/// Make Voxel Space ///
function voxelsHelper(x, y, z) {

  const lineColor = 0xffffff;
  let width = x * 0.5;
  let height = y;
  let depth = z * 0.5;

  const geometry = new THREE.BufferGeometry();
  const position = [];

  position.push(
    -width, 0, -depth,
    -width, height, -depth,

    -width, height, -depth,
    width, height, -depth,

    width, height, -depth,
    width, 0, -depth,

    -width, 0, depth,
    -width, height, depth,

    -width, height, depth,
    width, height, depth,

    width, height, depth,
    width, 0, depth,

    -width, height, -depth,
    -width, height, depth,

    width, height, -depth,
    width, height, depth,

  );

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(position, 3));

  const lineSegments = new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({
    color: lineColor,
    transparent: true,
    opacity: 0.1
  }));
  // lineSegments.computeLineDistances();

  const currentSpace = createcurrent({
    height: width,
    width: depth,
    linesHeight: x / unit,
    linesWidth: z / unit,
    color: 0x3C3C3C
  })


  function createcurrent(opts) {
    let config = opts || {
      height: 500,
      width: 500,
      linesHeight: 10,
      linesWidth: 10,
      color: 0x3C3C3C
    };

    let material = new THREE.LineBasicMaterial({
      color: config.color,
      opacity: 0.2
    });

    let currentObject = new THREE.Object3D(),
      currentGeo = new THREE.Geometry(),
      stepw = 2 * config.width / config.linesWidth,
      steph = 2 * config.height / config.linesHeight;

    //width
    for (let i = -config.width; i <= config.width; i += stepw) {
      currentGeo.vertices.push(new THREE.Vector3(-config.height, i, 0));
      currentGeo.vertices.push(new THREE.Vector3(config.height, i, 0));

    }
    //height
    for (let i = -config.height; i <= config.height; i += steph) {
      currentGeo.vertices.push(new THREE.Vector3(i, -config.width, 0));
      currentGeo.vertices.push(new THREE.Vector3(i, config.width, 0));
    }

    let line = new THREE.LineSegments(currentGeo, material);
    currentObject.add(line);
    currentObject.rotateX(Math.PI / 2);

    return currentObject;
  }

  let group = new THREE.Group();

  group.add(currentSpace);
  group.add(lineSegments)

  return group;
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function render() {
  renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  render()
}
animate();