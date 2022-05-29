import * as THREE from 'three';

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, .1, 1000);
let renderer = new THREE.WebGLRenderer();

import { VRButton } from '../assets/vrbutton.js';
document.body.appendChild( VRButton.createButton( renderer ) );
renderer.xr.enabled = true;

let controls = {};
let player = {
  height: .5,
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
  moveToPlayer();
  // ixLightcubeAnimation();
}

function render() {
	renderer.render(scene, camera);
}

renderer.setAnimationLoop( function () {

	update();
	render();

} );

import { VOXLoader, VOXMesh } from '../node_modules/three/examples/jsm/loaders/VOXLoader.js';
const loader1 = new VOXLoader();
loadVox('../assets/models/knight.vox');
loadVox('../assets/models/monu10.vox');
function loadVox(path) {
  loader1.load( path, function ( chunks ) {
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

let light2 = new THREE.AmbientLight("white", 0.35);
light2.position.set(10, 200, 0);
scene.add(light2);

let BoxGeometry1 = new THREE.BoxGeometry(1, 1, 1);
let BoxMaterial1 = new THREE.MeshBasicMaterial({ color: "yellow", wireframe: false });
let Box1 = new THREE.Mesh(BoxGeometry1, BoxMaterial1);
Box1.scale.x = Box1.scale.y = Box1.scale.z = .25;
function moveToPlayer() {
  Box1.position.x = camera.position.x;
  Box1.position.y = camera.position.y;
  Box1.position.z = camera.position.z;
}
scene.add(Box1);