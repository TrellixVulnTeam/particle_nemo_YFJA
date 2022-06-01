import * as THREE from 'three';

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, .1, 1000);
let renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
scene.background = new THREE.Color("black");
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', () => {
  let w = window.innerWidth,
      h = window.innerHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
});

const listener = new THREE.AudioListener();
camera.add( listener );
const sound = new THREE.Audio( listener );
const audioLoader = new THREE.AudioLoader();
audioLoader.load( '../assets/sounds/tree-city.mp3', function( buffer ) {
	sound.setBuffer( buffer );
	sound.setLoop( true );
	sound.setVolume( 0.5 );
	sound.play();
});

import { VRButton } from '../assets/vrbutton.js';
document.body.appendChild( VRButton.createButton( renderer ) );
renderer.xr.enabled = true;





let controls = {};
let player = {
  height: 2,
  turnSpeed: .1,
  speed: .1,
  jumpHeight: .2,
  gravity: .01,
  velocity: 0,
  playerJumps: false
};

document.addEventListener('keydown', ({ keyCode }) => { controls[keyCode] = true });
document.addEventListener('keyup', ({ keyCode }) => { controls[keyCode] = false });

camera.position.set(0, player.height, -5);
camera.lookAt(new THREE.Vector3(0, player.height, 0));

import * as PointerLockControls from 'pointerlockcontrols';

const mouseControls = new PointerLockControls.PointerLockControls( camera, document.body );
const menuPanel = document.getElementById('menuPanel')

mouseControls.addEventListener( 'lock', function () {
	menuPanel.style.display = 'none';
} );

mouseControls.addEventListener( 'unlock', function () {
	menuPanel.style.display = 'block';
} );

const startButton = document.getElementById('startButton')
startButton.addEventListener(
    'click',
    function () {
      mouseControls.lock()
    },
    false
)

function control() {
  if(controls[87]){ // w
    mouseControls.moveForward(player.speed);
  }
  if(controls[83]){ // s
    mouseControls.moveForward(-player.speed);
  }
  if(controls[65]){ // a
    mouseControls.moveRight(-player.speed);
  }
  if(controls[68]){ // d
    mouseControls.moveRight(player.speed);
  }
  if(controls[32]) { // space
    if(player.jumps) return false;
    player.jumps = true;
    if(player.gravity==0) player.jumps=false;
    player.velocity = -player.jumpHeight;
  }
  if(controls[16]) { //shift
    player.speed = 0.2;
  }
  else {
    player.speed = 0.1;
  }
  if(controls[17]) { //ctrl
    player.height = 0.5
  }
  else {
    player.height = 2;
  }
}

function ixMovementUpdate() {
  player.velocity += player.gravity;
  camera.position.y -= player.velocity;
  if(camera.position.y < player.height) {
    camera.position.y = player.height;
    player.jumps = false;
  }
}





const loader = new THREE.TextureLoader();
const texture = loader.load(
  '../assets/img/skybox.jpg',
  () => {
    const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
    rt.fromEquirectangularTexture(renderer, texture);
    scene.background = rt.texture;
  });

import { VOXLoader, VOXMesh } from '../node_modules/three/examples/jsm/loaders/VOXLoader.js';
const VoxLoader = new VOXLoader();
//loadVox('../assets/models/knight.vox');
//loadVox('../assets/models/monu10.vox');
function loadVox(path) {
  VoxLoader.load( path, function ( chunks ) {
    for ( let i = 0; i < chunks.length; i ++ ) {
      const chunk = chunks[ i ];
      const mesh = new VOXMesh( chunk );
      mesh.scale.setScalar( 1 );
      let boundingBox = new THREE.Box3().setFromObject(mesh);
      let height = boundingBox.max.y-boundingBox.min.y;
      mesh.position.y=height/2;
      scene.add( mesh );
    }
  } );
}

import { FBXLoader } from '../node_modules/three/examples/jsm/loaders/FBXLoader.js';
const FbxLoader = new FBXLoader();
// loadFBX('../assets/models/player.fbx');
function loadFBX(path) {
  
  FbxLoader.load(path, function ( object ) {
    object.traverse( function ( child ) {
      if ( child.isMesh ) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    } );
    object.scale.multiplyScalar(0.01); 

    // const anim = new FBXLoader();
    // anim.load('../assets/animations/idle.fbx', (anim) => {
    //   const m = new THREE.AnimationMixer(object);
    //   const idle = m.clipAction(anim.animations[0]);
    //   idle.play();
    // });
    scene.add(object);
  } );

}

let PlaneGeometry1 = new THREE.PlaneGeometry(10, 10);
let PlaneMaterial1 = new THREE.MeshPhongMaterial({ color: "white", wireframe: false });
let Plane1 = new THREE.Mesh(PlaneGeometry1, PlaneMaterial1);
Plane1.rotation.x -= Math.PI / 2;
Plane1.scale.x = 3;
Plane1.scale.y = 3;
Plane1.receiveShadow = true;
scene.add(Plane1);
let light2 = new THREE.AmbientLight("white", .69);
light2.position.set(0, 50, 0);
scene.add(light2);





renderer.setAnimationLoop( function () {
	render();
  update();
} );

function render() {
	renderer.render(scene, camera);
}

function update() {
  control();
  ixMovementUpdate();
}

import { Server } from '../assets/server.js';
console.log(Server);
let tps = 60;
let mtps = 1000/tps;
serverClientSync();
async function serverClientSync() {
  let time1 = getTime();
  let time2 = getTime();
  let millisecondsElapsed = time2-time1;
  await sleep(mtps-millisecondsElapsed);
  serverClientSync();
}

function getTime() {
  let d = new Date();
  return d.getTime();
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}