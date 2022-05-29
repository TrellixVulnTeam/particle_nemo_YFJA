import * as THREE from 'three';

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, .1, 1000);
let renderer = new THREE.WebGLRenderer();

import { VRButton } from '../assets/vrbutton.js';
document.body.appendChild( VRButton.createButton( renderer ) );
renderer.xr.enabled = true;

let controls = {};
let player = {
  height: 2,
  turnSpeed: .05,
  speed: .1,
  jumpHeight: .2,
  gravity: .01,
  velocity: 0,
  
  playerJumps: false
};

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

camera.position.set(0, player.height, -5);
camera.lookAt(new THREE.Vector3(0, player.height, 0));

const loader = new THREE.TextureLoader();
const texture = loader.load(
  '../assets/img/skybox.jpg',
  () => {
    const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
    rt.fromEquirectangularTexture(renderer, texture);
    scene.background = rt.texture;
  });

document.addEventListener('keydown', ({ keyCode }) => { controls[keyCode] = true });
document.addEventListener('keyup', ({ keyCode }) => { controls[keyCode] = false });

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

import * as PointerLockControls from 'PointerLockControls';
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

let gravity = true;

// ...
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
  if(controls[13]){ // enter
    if(gravity==true) {
      player.gravity = 0;
      gravity = false;
    }
    else {
      player.gravity = .01;
      gravity = true;
    }
  }
  if(controls[32]) { // space
    if(player.jumps) return false;
    player.jumps = true;
    if(player.gravity==0) player.jumps=false;
    player.velocity = -player.jumpHeight;
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

function update() {
  control();
  ixMovementUpdate();
  cameraLockToPlayerLoop();
}

function render() {
	renderer.render(scene, camera);
}

import { VOXLoader, VOXMesh } from '../node_modules/three/examples/jsm/loaders/VOXLoader.js';
const VoxLoader = new VOXLoader();
loadVox('../assets/models/knight.vox');
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

let light2 = new THREE.AmbientLight("white", .69);
light2.position.set(0, 50, 0);
scene.add(light2);

import { FBXLoader } from '../node_modules/three/examples/jsm/loaders/FBXLoader.js';
const FbxLoader = new FBXLoader();
const FbxLoader2 = new FBXLoader();
let AnimationMixer;

let PlayerObject = null;
loadFBX('../assets/models/player.fbx');

function loadFBX(path) {
  
  FbxLoader.load(path, function ( object ) {
    object.traverse( function ( child ) {
      if ( child.isMesh ) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    } );
    object.scale.multiplyScalar(0.01); 
    PlayerObject = object;

    FbxLoader2.load(('../assets/animations/idle.fbx'), (anim) => {
      AnimationMixer = new THREE.AnimationMixer(PlayerObject);
      const idle = AnimationMixer.clipAction(FbxLoader2.animations[0]);
      idle.play();
    });

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

function cameraLockToPlayerLoop() {
  if(PlayerObject==null) return;
  PlayerObject.position.set(camera.position.x, camera.position.y-(player.height-0.3), camera.position.z);
}

renderer.setAnimationLoop( function () {
	update();
	render();
} );