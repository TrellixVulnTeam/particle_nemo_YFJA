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
  '../resources/skybox.jpg',
  () => {
    const rt = new THREE.WebGLCubeRenderTarget(texture.image.height);
    rt.fromEquirectangularTexture(renderer, texture);
    scene.background = rt.texture;
  });

document.addEventListener('keydown', ({ keyCode }) => { controls[keyCode] = true });
document.addEventListener('keyup', ({ keyCode }) => { controls[keyCode] = false });

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
  // if(controls[37]){ // la
  //   camera.rotation.y -= player.turnSpeed;
  // }
  // if(controls[39]){ // ra
  //   camera.rotation.y += player.turnSpeed;
  // }
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
loadVox('../resources/knight.vox');
loadVox('../resources/monu10.vox');
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

// let BoxGeometry1 = new THREE.BoxGeometry(1, 1, 1);
// let BoxMaterial1 = new THREE.MeshBasicMaterial({ color: "yellow", wireframe: false });
// let Box1 = new THREE.Mesh(BoxGeometry1, BoxMaterial1);

// Box1.position.y = 3;
// Box1.scale.x = Box1.scale.y = Box1.scale.z = .25;
// scene.add(Box1);

// let BoxGeometry2 = new THREE.BoxGeometry(1, 1, 1);
// let BoxMaterial2 = new THREE.MeshPhongMaterial({ color: "white", wireframe: false });
// let Box2 = new THREE.Mesh(BoxGeometry2, BoxMaterial2);

// Box2.position.y = .75;
// Box2.position.x = 0;
// Box2.receiveShadow = true;
// Box2.castShadow = true;

// scene.add(Box2);

// let PlaneGeometry1 = new THREE.PlaneGeometry(10, 10);
// let PlaneMaterial1 = new THREE.MeshPhongMaterial({ color: "white", wireframe: false });
// let Plane1 = new THREE.Mesh(PlaneGeometry1, PlaneMaterial1);

// Plane1.rotation.x -= Math.PI / 2;
// Plane1.scale.x = 3;
// Plane1.scale.y = 3;
// Plane1.receiveShadow = true;
// scene.add(Plane1);

// let light1 = new THREE.PointLight("white", .8);
// light1.position.set(0, 3, 0);
// light1.castShadow = true;
// light1.shadow.camera.near = 2.5;
// scene.add(light1);

// function ixLightcubeAnimation() {
//   let a = .01;
//   Box1.rotation.x += a;
//   Box1.rotation.y += a;
// }