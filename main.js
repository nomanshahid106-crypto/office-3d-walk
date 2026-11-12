import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87bfe8);
scene.fog = new THREE.Fog(0xdbeafe, 30, 80);

const camera = new THREE.PerspectiveCamera(58, innerWidth/innerHeight, 0.1, 200);
camera.position.set(8, 7, 11);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.maxPolarAngle = Math.PI * 0.49;
controls.minDistance = 3;
controls.maxDistance = 28;
controls.target.set(0, 1, 0);

// Lights
scene.add(new THREE.HemisphereLight(0xffffff, 0x334155, 0.9));
const sun = new THREE.DirectionalLight(0xffffff, 1.6);
sun.position.set(10, 14, 6);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -16; sun.shadow.camera.right = 16;
sun.shadow.camera.top = 16; sun.shadow.camera.bottom = -16;
scene.add(sun);
const fill = new THREE.PointLight(0xfff7ed, 35, 30); fill.position.set(0, 4.5, 0); scene.add(fill);

// Materials
const M = {
  floor: new THREE.MeshStandardMaterial({ color: 0xc9a06a, roughness: .8 }),
  carpet: new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 1 }),
  wall: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: .9 }),
  wallAccent: new THREE.MeshStandardMaterial({ color: 0x0ea5e9, roughness: .8 }),
  wood: new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: .6 }),
  woodLight: new THREE.MeshStandardMaterial({ color: 0xd6a15a, roughness: .6 }),
  black: new THREE.MeshStandardMaterial({ color: 0x111827, roughness: .5 }),
  grey: new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: .7 }),
  white: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .5 }),
  glass: new THREE.MeshStandardMaterial({ color: 0x93c5fd, roughness: .1, metalness: .1, transparent: true, opacity: .45 }),
  screen: new THREE.MeshStandardMaterial({ color: 0x0ea5e9, emissive: 0x0369a1, emissiveIntensity: .7 }),
  green: new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: .8 }),
  red: new THREE.MeshStandardMaterial({ color: 0xef4444 }),
  blue: new THREE.MeshStandardMaterial({ color: 0x2563eb }),
  skin: new THREE.MeshStandardMaterial({ color: 0xf2c09a, roughness: .7 }),
  shirt: new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: .8 }),
  pants: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: .8 }),
};

const colliders = []; // {minX,maxX,minZ,maxZ}
function addCollider(x, z, w, d){ colliders.push({ minX: x-w/2, maxX: x+w/2, minZ: z-d/2, maxZ: z+d/2 }); }
function box(w,h,d,mat,x,y,z, opts={}){
  const m = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat);
  m.position.set(x,y,z); m.castShadow = opts.cast!==false; m.receiveShadow = true;
  if(opts.ry) m.rotation.y = opts.ry;
  scene.add(m); return m;
}
function cyl(rt,rb,h,mat,x,y,z){
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,20), mat);
  m.position.set(x,y,z); m.castShadow = true; m.receiveShadow = true; scene.add(m); return m;
}

// Floor & Room 24 x 18
const floor = new THREE.Mesh(new THREE.PlaneGeometry(24,18), M.floor);
floor.rotation.x = -Math.PI/2; floor.receiveShadow = true; scene.add(floor);
const carpet = new THREE.Mesh(new THREE.PlaneGeometry(10,7), M.carpet);
carpet.rotation.x = -Math.PI/2; carpet.position.set(-2,0.01,0); carpet.receiveShadow = true; scene.add(carpet);

// Walls
box(24,4.2,0.25, M.wall, 0,2.1,-9); box(24,4.2,0.25, M.wall, 0,2.1,9);
box(0.25,4.2,18, M.wall, -12,2.1,0); box(0.25,4.2,18, M.wallAccent, 12,2.1,0);
// Windows on back wall
for(let i=-2;i<=2;i++){ box(3.2,2.0,0.1, M.glass, i*4.2,2.3,-8.85,{cast:false}); }
// Ceiling lights panels
for(let x of [-7,0,7]) for(let z of [-5,0,5]){ box(2.2,0.08,1.0, M.white, x,4.05,z,{cast:false}); }

// Desk creator
function createDesk(x,z,ry=0, color=0x2563eb){
  const g = new THREE.Group(); g.position.set(x,0,z); g.rotation.y = ry; scene.add(g);
  const add = (mesh, lx, ly, lz)=>{ mesh.position.set(lx,ly,lz); g.add(mesh); return mesh; };
  add(new THREE.Mesh(new THREE.BoxGeometry(3.2,0.12,1.5), M.woodLight), 0,0.95,0).castShadow=true;
  [[-1.45,-0.6],[1.45,-0.6],[-1.45,0.6],[1.45,0.6]].forEach(([lx,lz])=> add(new THREE.Mesh(new THREE.BoxGeometry(0.1,0.95,0.1), M.black), lx,0.47,lz));
  // monitor
  add(new THREE.Mesh(new THREE.BoxGeometry(1.15,0.7,0.06), M.black), 0,1.55,-0.35);
  const scr = add(new THREE.Mesh(new THREE.PlaneGeometry(1.05,0.6), new THREE.MeshStandardMaterial({color:color, emissive:color, emissiveIntensity:.55})), 0,1.55,-0.31); scr.rotation.y=0;
  add(new THREE.Mesh(new THREE.BoxGeometry(0.12,0.5,0.12), M.black), 0,1.22,-0.35);
  // keyboard + mug + notebook
  add(new THREE.Mesh(new THREE.BoxGeometry(0.9,0.05,0.32), M.white), 0,1.04,0.18);
  add(new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.07,0.16,16), M.red), 0.85,1.09,0.2);
  add(new THREE.Mesh(new THREE.BoxGeometry(0.5,0.03,0.35), M.white), -0.9,1.03,0.22);
  createChair(0, 1.35, Math.PI, g);
  addCollider(x,z,3.4,1.7);
  return g;
}
function createChair(lx,lz,ry=0,parent=scene){
  const g = new THREE.Group(); g.position.set(lx,0,lz); g.rotation.y=ry; parent.add(g);
  const s = new THREE.Mesh(new THREE.BoxGeometry(0.62,0.1,0.6), M.black); s.position.y=0.55; s.castShadow=true; g.add(s);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.62,0.85,0.1), M.black); back.position.set(0,1.05,-0.28); back.castShadow=true; g.add(back);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,0.5,12), M.grey); pole.position.y=0.28; g.add(pole);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.32,0.32,0.06,20), M.grey); base.position.y=0.04; g.add(base);
  return g;
}

createDesk(-5.5,-3.2,0,0x0ea5e9);
createDesk(-1,-3.2,0,0x22c55e);
createDesk(3.5,-3.2,0,0xf59e0b);
createDesk(-5.5,2.2,Math.PI,0x8b5cf6);
createDesk(-1,2.2,Math.PI,0xec4899);
createDesk(3.5,2.2,Math.PI,0x06b6d4);
// Standalone chairs
createChair(7.5,-1, -Math.PI/2); createChair(7.5,1.2, -Math.PI/2);

// Meeting table
box(4.2,0.12,1.9, M.wood, 8,0.95,-4.5); addCollider(8,-4.5,4.4,2.1);
for(let dx of [-1.8,1.8]) for(let dz of [-0.7,0.7]) box(0.1,0.95,0.1, M.black, 8+dx,0.47,-4.5+dz);
createChair(8-1.2, -6.2, 0); createChair(8+1.2, -6.2, 0); createChair(8-1.2, -2.8, Math.PI); createChair(8+1.2, -2.8, Math.PI);

// Whiteboard, plant, shelf, sofa
box(3.6,1.9,0.08, M.white, -8,2,-8.8); box(3.7,0.08,0.1, M.grey, -8,3,-8.8);
function plant(x,z){ cyl(0.32,0.26,0.5, M.red, x,0.25,z); cyl(0.06,0.06,0.7, M.wood, x,0.8,z); const s=new THREE.Mesh(new THREE.SphereGeometry(0.55,16,16), M.green); s.position.set(x,1.45,z); s.castShadow=true; scene.add(s); addCollider(x,z,0.7,0.7); }
plant(-10.5,-7.5); plant(10.5,7.5); plant(-10.5,7.5);
box(0.5,0.45,1.7, new THREE.MeshStandardMaterial({color:0x7c3aed}), 9.5,0.22,4.5); box(0.5,0.45,1.7, new THREE.MeshStandardMaterial({color:0x7c3aed}), 9.5,0.22,6.4); addCollider(9.5,5.4,0.8,3.8);
// Bookshelf
box(2.6,2.4,0.4, M.wood, -11.6,1.2,2); for(let i=0;i<6;i++) box(0.28,0.45,0.25, new THREE.MeshStandardMaterial({color:[0xef4444,0x3b82f6,0x22c55e,0xf59e0b,0xec4899,0x06b6d4][i]}), -11.55,0.7+(i%3)*0.65, 1.2+Math.floor(i/3)*0.7);

// ---- The Man (animated humanoid) ----
const man = new THREE.Group(); scene.add(man);
function part(geo, mat, x,y,z, parent){ const m=new THREE.Mesh(geo,mat); m.position.set(x,y,z); m.castShadow=true; parent.add(m); return m; }
// legs pivot at hip
const legL = new THREE.Group(); legL.position.set(-0.16,0.95,0); man.add(legL);
const legR = new THREE.Group(); legR.position.set(0.16,0.95,0); man.add(legR);
part(new THREE.BoxGeometry(0.24,0.9,0.26), M.pants, 0,-0.45,0, legL);
part(new THREE.BoxGeometry(0.24,0.9,0.26), M.pants, 0,-0.45,0, legR);
part(new THREE.BoxGeometry(0.26,0.14,0.38), M.black, 0,-0.92,0.05, legL);
part(new THREE.BoxGeometry(0.26,0.14,0.38), M.black, 0,-0.92,0.05, legR);
// torso
part(new THREE.BoxGeometry(0.62,0.78,0.34), M.shirt, 0,1.34,0, man);
part(new THREE.BoxGeometry(0.64,0.12,0.36), M.white, 0,1.68,0, man); // collar
// arms pivot at shoulder
const armL = new THREE.Group(); armL.position.set(-0.42,1.62,0); man.add(armL);
const armR = new THREE.Group(); armR.position.set(0.42,1.62,0); man.add(armR);
part(new THREE.BoxGeometry(0.2,0.72,0.22), M.shirt, 0,-0.32,0, armL);
part(new THREE.BoxGeometry(0.2,0.72,0.22), M.shirt, 0,-0.32,0, armR);
part(new THREE.SphereGeometry(0.11,14,14), M.skin, 0,-0.72,0, armL);
part(new THREE.SphereGeometry(0.11,14,14), M.skin, 0,-0.72,0, armR);
// head
const head = part(new THREE.SphereGeometry(0.27,20,20), M.skin, 0,2.02,0, man);
part(new THREE.BoxGeometry(0.56,0.14,0.56), M.black, 0,2.22,0, man); // hair/cap top
part(new THREE.BoxGeometry(0.5,0.08,0.3), M.black, 0,2.16,0.32, man); // cap brim
man.position.set(0,0,5.5);

// Movement state
const keys = {};
let yaw = Math.PI; // facing -Z-ish start
let walkTime = 0, speedSmooth = 0;
let isThirdPerson = true;
addEventListener('keydown', e=>{ keys[e.code]=true; if(e.code==='KeyV') toggleView(); });
addEventListener('keyup', e=>{ keys[e.code]=false; });

function toggleView(){
  isThirdPerson = !isThirdPerson;
  document.getElementById('viewBtn').textContent = isThirdPerson ? '📷 Third Person (V)' : '👀 First Person (V)';
  head.visible = isThirdPerson;
}
document.getElementById('viewBtn').onclick = toggleView;
document.getElementById('resetBtn').onclick = ()=>{ man.position.set(0,0,5.5); yaw=Math.PI; };

// Mobile joystick
let joyX=0, joyY=0, runningMobile=false;
const joy=document.getElementById('joystick'), stick=document.getElementById('stick');
let joyActive=false;
joy.addEventListener('touchstart',e=>{joyActive=true},{passive:true});
addEventListener('touchend',()=>{joyActive=false;joyX=joyY=0;stick.style.left='31px';stick.style.top='31px';});
addEventListener('touchmove',e=>{
  if(!joyActive) return; const t=e.touches[0], r=joy.getBoundingClientRect();
  let dx=t.clientX-(r.left+55), dy=t.clientY-(r.top+55);
  const len=Math.hypot(dx,dy)||1, max=34; if(len>max){dx=dx/len*max;dy=dy/len*max;}
  stick.style.left=(31+dx)+'px'; stick.style.top=(31+dy)+'px'; joyX=dx/max; joyY=dy/max;
},{passive:true});
document.getElementById('runBtn').addEventListener('touchstart',()=>runningMobile=true,{passive:true});
document.getElementById('runBtn').addEventListener('touchend',()=>runningMobile=false);

function collides(x,z){
  const r=0.38;
  if(x < -11.4+r || x > 11.4-r || z < -8.4+r || z > 8.4-r) return true;
  for(const c of colliders){ if(x+r>c.minX && x-r<c.maxX && z+r>c.minZ && z-r<c.maxZ) return true; }
  return false;
}

const clock = new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  // Input direction
  let forward = 0, turn = 0;
  if(keys.KeyW || keys.ArrowUp) forward += 1;
  if(keys.KeyS || keys.ArrowDown) forward -= 1;
  if(keys.KeyA) turn += 1;
  if(keys.KeyD) turn -= 1;
  if(keys.ArrowLeft) turn += 1;
  if(keys.ArrowRight) turn -= 1;
  // joystick: up = forward, left/right = turn
  if(Math.abs(joyY)>0.15) forward += -joyY;
  if(Math.abs(joyX)>0.15) turn += -joyX;

  const running = keys.ShiftLeft || keys.ShiftRight || runningMobile;
  const speed = running ? 5.2 : 2.9;
  yaw += turn * 2.4 * dt;
  man.rotation.y = yaw;

  const moving = Math.abs(forward) > 0.01;
  const targetSpeed = moving ? Math.sign(forward)*speed : 0;
  speedSmooth += (Math.abs(targetSpeed) - speedSmooth) * Math.min(1, dt*10);

  if(moving){
    // Model faces +Z when yaw=0, so forward vector is (sin(yaw), cos(yaw))
    const fx = Math.sin(yaw), fz = Math.cos(yaw);
    const mx = man.position.x + fx * targetSpeed * dt;
    const mz = man.position.z + fz * targetSpeed * dt;
    if(!collides(mx, man.position.z)) man.position.x = mx;
    if(!collides(man.position.x, mz)) man.position.z = mz;
    walkTime += dt * (running ? 11 : 8);
  } else {
    walkTime += dt * 2; // idle breathing still animates slightly below
  }

  // Walk cycle animation
  const swing = moving ? Math.sin(walkTime) * 0.65 : 0;
  const bob = moving ? Math.abs(Math.sin(walkTime)) * 0.07 : Math.sin(clock.elapsedTime*2)*0.015;
  legL.rotation.x = swing; legR.rotation.x = -swing;
  armL.rotation.x = -swing * 0.85; armR.rotation.x = swing * 0.85;
  man.position.y = bob;
  if(!moving){ legL.rotation.x*=0.9; legR.rotation.x*=0.9; armL.rotation.x = Math.sin(clock.elapsedTime*1.6)*0.05; armR.rotation.x = -Math.sin(clock.elapsedTime*1.6)*0.05; }

  // Camera follow
  if(isThirdPerson){
    const back = new THREE.Vector3(Math.sin(yaw)*-5.2, 3.4, Math.cos(yaw)*-5.2);
    // OrbitControls target follows man, camera keeps offset unless user orbits
    const desiredTarget = new THREE.Vector3(man.position.x, 1.3, man.position.z);
    const delta = desiredTarget.clone().sub(controls.target);
    controls.target.copy(desiredTarget);
    camera.position.add(delta.multiplyScalar(0.9));
    // Gentle auto-follow if user isn't interacting: keep camera behind-ish via target only
  } else {
    const eye = new THREE.Vector3(man.position.x, 1.95 + bob, man.position.z);
    camera.position.lerp(eye, 0.6);
    const look = new THREE.Vector3(man.position.x + Math.sin(yaw)*5, 1.7, man.position.z + Math.cos(yaw)*5);
    camera.lookAt(look);
    controls.target.copy(look);
  }

  controls.update();
  renderer.render(scene, camera);
}
animate();

addEventListener('resize', ()=>{
  camera.aspect = innerWidth/innerHeight; camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
