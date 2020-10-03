// these need to be accessed inside more than one function so we'll declare them first
let container;
let camera;
let controls;
let renderer;
let scene;
let model;

let idleAni; //kjurr
let runAni; //hlaupandi
let walkAni;//labbandi

let rocket//eldflaug
let sphere;
let smokering;


let actions ;

let keycount = 0;//telur hvað það er búið að íta oft á W eða S

let switcher = false;

const mixers = [];
const clock = new THREE.Clock();



function init() {

  container = document.querySelector( '#scene-container' );

  scene = new THREE.Scene();
  scene.background = new THREE.Color( 0x8FBCD4 );

  const loader = new THREE.CubeTextureLoader();
  const texture = loader.load([
    "red/bkg1_right1.png",
    "red/bkg1_left2.png",
    "red/bkg1_top3.png",
    "red/bkg1_bottom4.png",
    "red/bkg1_front5.png",
    "red/bkg1_back6.png",
  ]);
  scene.background = texture;



  createCamera();
  createControls();
  createLights();
  loadModels();
  createRenderer();
  creatMeshesh();
  MusicPlayer();

  renderer.setAnimationLoop( () => {

    update();
    render();

  } );

}

function createCamera() {

  camera = new THREE.PerspectiveCamera( 35, container.clientWidth / container.clientHeight, 1, 100 );
  camera.position.set( 50, -50, 0 );

}

function createControls() {

  controls = new THREE.OrbitControls( camera, container );

}

function createLights() {

  const ambientLight = new THREE.HemisphereLight( 0xddeeff, 0x0f0e0d, 5 );

  const mainLight = new THREE.DirectionalLight( 0xffffff, 5 );
  mainLight.position.set( 10, 10, 10 );

  scene.add( ambientLight, mainLight );

}

function creatMeshesh(){
  const Geo =  createGeometries();
  const mats = createMaterials();
  sphere = new THREE.Mesh(Geo.mainplanet, mats.earthmat );
  sphere.position.set( 0, -10, 0 );

  rocket = new THREE.Group();
  
  const rocketbody = new THREE.Mesh(Geo.rocketbody, mats.white);

  const rockethead = new THREE.Mesh(Geo.rockethead, mats.red);
  rockethead.position.set(0,6.5,0);

  const rocketbottom = new THREE.Mesh(Geo.rocketbottom, mats.red);
  rocketbottom.position.set(0,-6.5,0);
  rocket.add(rocketbody,rockethead,rocketbottom);
  rocket.position.set(13,0,0);

  smokering = new THREE.Mesh(Geo.smokering, mats.grey);
  smokering.position.set(13,-10,0);
  smokering.rotateX( Math.PI / 2 );

  

 

  scene.add(sphere, rocket);
}


function createGeometries() {

  const mainplanet = new THREE.SphereBufferGeometry(10, 32, 32);
  const rocketbody = new THREE.CylinderBufferGeometry(2,2,10,32);
  const rockethead = new THREE.ConeBufferGeometry(2,3,32);
  const rocketbottom = new THREE.CylinderBufferGeometry(2,3,4,32);
  const smokering = new THREE.TorusBufferGeometry( 2, 0.3, 16, 100 );



  return{
    mainplanet,
    rocketbody,
    rockethead,
    rocketbottom,
    smokering,
  };

}

function createMaterials(){
  const color1 = new THREE.MeshStandardMaterial( {
    color: 0xff3333, // red
    flatShading: true,
  } );
  const red = new THREE.MeshStandardMaterial({
    color:0xc20000,
    flatShading: true,
  })
  const white = new THREE.MeshStandardMaterial({
    color:0xffffff,
    flatShading: true,
  })

  const grey = new THREE.MeshStandardMaterial({
    color:0x6b6767,
    flatShading:true
  })
  const textureLoader = new THREE.TextureLoader()
  const earth = textureLoader.load("earth.jpg");
  earth.encoding =  THREE.sRGBEncoding;
  earth.anisotropy = 16;

  const earthmat = new THREE.MeshStandardMaterial({
    map:earth,
  });


  return{
    color1,
    red,
    white,
    grey,
    earthmat
  };

}


function loadModels() {
  const loader = new THREE.GLTFLoader();
  const onLoad = ( gltf, position ) => {

    model = gltf.scene.children[ 0 ];
    model.position.copy( position );

    runAni = gltf.animations[1]; // hlaupandi 
    idleAni = gltf.animations[0];// standandi kjurr
    walkAni = gltf.animations[3]// labbandi

    actions = [runAni,walkAni,idleAni];


    const mixer = new THREE.AnimationMixer( model );
    mixers.push( mixer );
    let action = mixer.clipAction( runAni );
    action.play();

    scene.add( model );

  };
  const pos = new THREE.Vector3( 0, 0, 0);
  loader.load("Soldier.glb", gltf => onLoad(gltf,pos));


}

function MusicPlayer(){
  var listener = new THREE.AudioListener();
  camera.add( listener );

// create a global audio source
var sound = new THREE.Audio( listener );

// load a sound and set it as the Audio object's buffer
var audioLoader = new THREE.AudioLoader();
audioLoader.load( 'music.mp3', function( buffer ) {
	sound.setBuffer( buffer );
	sound.setLoop( true );
	sound.setVolume( 0.5 );
	sound.play();
});
}

function createRenderer() {

  // create a WebGLRenderer and set its width and height
  renderer = new THREE.WebGLRenderer( { antialias: true } );
  renderer.setSize( container.clientWidth, container.clientHeight );

  renderer.setPixelRatio( window.devicePixelRatio );

  renderer.gammaFactor = 2.2;
  renderer.gammaOutput = true;

  renderer.physicallyCorrectLights = true;

  container.appendChild( renderer.domElement );

}

function update() {

  sphere.rotation.x += 0.02;
  if (switcher == true) {
    smokering.position.y -= 0.1;
    if (smokering.scale.y > 0 && smokering.scale.x > 0) {
      smokering.scale.y -= 0.01;
      smokering.scale.x -= 0.01;
    }
    else{
      smokering.position.y = -10;
      smokering.scale.y = 1;
      smokering.scale.x = 1;
      switcher = false;
      scene.remove(smokering);
    }
  }


  //smokering.scale.x -=0.01;
  //smokering.scale.y -= 0.01;


  const delta = clock.getDelta();

  for ( const mixer of mixers ) {

    mixer.update( delta );

  }
  

}

function render() {

  renderer.render( scene, camera );

}

function onWindowResize() {

  camera.aspect = container.clientWidth / container.clientHeight;

  // update the camera's frustum
  camera.updateProjectionMatrix();

  renderer.setSize( container.clientWidth, container.clientHeight );

}

window.addEventListener( 'resize', onWindowResize );

window.onclick = function(event){
  if (event.key == "w") {
    

  }
  switcher = true;
  scene.add(smokering);
}

  



init();