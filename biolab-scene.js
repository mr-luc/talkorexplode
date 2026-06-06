import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import {createBioLabAssets} from './assets/biolab-assets.js';

let scene,camera,renderer,raycaster,mouse,caseGroup,fan,assets;
let objects=[],pipes=[],score=0;
let theta=-0.12,phi=0.78,radius=14.2,target=new THREE.Vector3(0,1.35,-0.35);
let down=false,lastX=0,lastY=0,drag=false,pointers=new Map(),pinch=0,lastTap=0;
const $=id=>document.getElementById(id);

init();newGame();animate();

function init(){
  assets=createBioLabAssets(THREE);
  scene=new THREE.Scene();
  scene.background=new THREE.Color(0x3d3024);
  scene.fog=new THREE.Fog(0x3d3024,24,72);
  camera=new THREE.PerspectiveCamera(45,innerWidth/innerHeight,.1,100);
  renderer=new THREE.WebGLRenderer({antialias:true});
  renderer.setSize(innerWidth,innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.shadowMap.enabled=true;
  $('stage').appendChild(renderer.domElement);
  raycaster=new THREE.Raycaster();mouse=new THREE.Vector2();
  scene.add(new THREE.HemisphereLight(0xffedc9,0x71543a,1.55));
  const key=new THREE.DirectionalLight(0xffe4b5,3.8);key.position.set(6,12,8);key.castShadow=true;scene.add(key);
  const rim=new THREE.DirectionalLight(0xffb86b,1.2);rim.position.set(-8,6,-4);scene.add(rim);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(70,40),new THREE.MeshStandardMaterial({color:0x5a4430,roughness:.78}));floor.rotation.x=-Math.PI/2;floor.position.y=-.78;floor.receiveShadow=true;scene.add(floor);
  const wall=new THREE.Mesh(new THREE.BoxGeometry(36,12,.3),new THREE.MeshStandardMaterial({color:0x463423,roughness:.9}));wall.position.set(0,5,-22);scene.add(wall);
  if(window.QRCode)new QRCode($('qr'),{text:location.origin+location.pathname.replace('game-3d-biolab.html','index.html')+'?manual=1&room=BIO-9Z7F',width:130,height:130});
  const c=renderer.domElement;c.addEventListener('pointerdown',pd);c.addEventListener('pointermove',pm);c.addEventListener('pointerup',pu);c.addEventListener('pointercancel',pu);c.addEventListener('wheel',wh,{passive:false});
  addEventListener('resize',resize);updateCamera();
}

function build(){
  if(caseGroup)scene.remove(caseGroup);
  caseGroup=new THREE.Group();scene.add(caseGroup);objects=[];pipes=[];
  addBottomShell();
  addLidShell();
  addFoamAndWells();
  addModules();
  addPipes();
  focusMod('watering');
}

function addBottomShell(){
  const outerW=12.2, outerD=8.9, wallH=.9, wallT=.22;
  const basePlate=assets.box(outerW,.22,outerD,0x26211c,.78,.32);basePlate.position.y=-.20;caseGroup.add(basePlate);
  const left=assets.box(wallT,wallH,outerD,0x2d2822,.76,.32);left.position.set(-outerW/2+wallT/2,.24,0);caseGroup.add(left);
  const right=left.clone();right.position.x=outerW/2-wallT/2;caseGroup.add(right);
  const front=assets.box(outerW-2*wallT,wallH,wallT,0x2d2822,.76,.32);front.position.set(0,.24,outerD/2-wallT/2);caseGroup.add(front);
  const back=front.clone();back.position.z=-outerD/2+wallT/2;caseGroup.add(back);
  const innerLip=assets.box(11.4,.08,8.1,0xa18454,.86,.24);innerLip.position.y=.70;caseGroup.add(innerLip);
  const handle=assets.cyl(.085,2.65,0xd0b77b);handle.rotation.z=Math.PI/2;handle.position.set(0,.22,outerD/2+.32);caseGroup.add(handle);
  [-1.28,1.28].forEach(x=>{const p=assets.cyl(.07,.38,0xd0b77b);p.rotation.x=Math.PI/2;p.position.set(x,.22,outerD/2+.06);caseGroup.add(p)});
  [-4.2,4.2].forEach(x=>{const latch=assets.box(.46,.5,.20,0xbaa979,.9,.22);latch.position.set(x,.22,outerD/2-.05);caseGroup.add(latch)});
  [-5.8,5.8].forEach(x=>[-4.1,4.1].forEach(z=>{const foot=assets.box(.34,.08,.34,0x161412,.15,.85);foot.position.set(x,-.34,z);caseGroup.add(foot)}));
  const badge=assets.label('BIOCORE',1.4,.32,'#ffe7a0','rgba(50,30,10,.92)',44);badge.position.set(0,.74,3.3);caseGroup.add(badge);
}

function addLidShell(){
  const outerW=12.2, lidH=4.5, lidD=.95, wallT=.18;
  const back=assets.box(outerW,lidH,lidD,0x2d2822,.76,.32);back.position.set(0,2.95,-4.45);caseGroup.add(back);
  const innerInset=assets.box(11.35,3.7,.16,0x141311,.35,.7);innerInset.position.set(0,3.02,-3.98);caseGroup.add(innerInset);
  const left=assets.box(wallT,lidH,.78,0x25211d,.78,.32);left.position.set(-outerW/2+wallT/2,2.95,-4.37);caseGroup.add(left);
  const right=left.clone();right.position.x=outerW/2-wallT/2;caseGroup.add(right);
  const top=assets.box(outerW,.18,.78,0x25211d,.78,.32);top.position.set(0,5.11,-4.37);caseGroup.add(top);
  const lowerFrame=assets.box(11.55,.12,.34,0xa18454,.86,.22);lowerFrame.position.set(0,1.12,-3.93);caseGroup.add(lowerFrame);
  [-4,0,4].forEach(x=>{const h=assets.cyl(.12,.9,0xcab27c);h.rotation.z=Math.PI/2;h.position.set(x,.86,-4.02);caseGroup.add(h)});
  const displayFrame=assets.box(4.15,1.35,.22,0x121010,.4,.55);displayFrame.position.set(-.55,3.55,-3.88);caseGroup.add(displayFrame);
  const time=assets.label('04:37',3.25,.88,'#ff4b3b','rgba(20,0,0,.9)',100);time.position.set(-.55,3.57,-3.75);caseGroup.add(time);
  const serial=assets.label('SERIAL\nBIO-5-2025',1.95,.92,'#f0eadc','rgba(10,10,10,.92)',42);serial.position.set(-4.18,3.66,-3.75);caseGroup.add(serial);
  const status=assets.label('STATUS\nSYS  MOD  CORE',2.35,.58,'#f0d15f','rgba(10,10,10,.86)',34);status.position.set(.35,2.52,-3.75);caseGroup.add(status);
  fan=makeFan();fan.position.set(3.65,3.62,-3.75);caseGroup.add(fan);
  [-.25,.25,.75].forEach((x,i)=>{const led=new THREE.Mesh(new THREE.SphereGeometry(.08,16,16),assets.makeMat([0x62ff70,0xffc347,0xff6b6b][i],.2,.25,1.4));led.position.set(x,2.35,-3.69);caseGroup.add(led)});
}

function addFoamAndWells(){
  const foam=assets.box(11.1,.36,7.5,0x121111,.25,.96);foam.position.y=.36;caseGroup.add(foam);
  const positions=[[-3.25,-1.82],[0,-1.82],[3.25,-1.82],[-3.25,1.25],[0,1.25],[3.25,1.25]];
  positions.forEach(([x,z])=>addWell(x,z));
  const divider1=assets.box(.18,.36,7.1,0x0d0c0c,.2,.95);divider1.position.set(-1.62,.38,-.28);caseGroup.add(divider1);
  const divider2=divider1.clone();divider2.position.x=1.62;caseGroup.add(divider2);
  const divider3=assets.box(10.6,.36,.18,0x0d0c0c,.2,.95);divider3.position.set(0,.38,-.28);caseGroup.add(divider3);
}

function addWell(x,z){
  const well=assets.box(2.98,.22,2.58,0x080808,.15,.98);well.position.set(x,.26,z);caseGroup.add(well);
  const rim=assets.box(3.08,.06,2.68,0x38312b,.4,.62);rim.position.set(x,.51,z);caseGroup.add(rim);
}

function addModules(){
  place(assets.wateringModule(),'watering',-3.25,-1.82);
  place(assets.greenhouseModule(),'greenhouse',0,-1.82);
  place(assets.growthModule(),'growth',3.25,-1.82);
  place(assets.nutrientsModule(),'nutrients',-3.25,1.25);
  place(assets.tankModule(),'tank',0,1.25);
  place(assets.animalModule(),'animal',3.25,1.25);
}

function place(mod,name,x,z){
  mod.position.set(x,.24,z);
  caseGroup.add(mod);
  mod.traverse(o=>{if(o.isMesh){o.userData.module=o.userData.module||name;objects.push(o)}});
}

function makeFan(){
  const g=new THREE.Group();
  const frame=new THREE.Mesh(new THREE.TorusGeometry(.58,.05,14,64),assets.makeMat(0x101010,.7,.4));g.add(frame);
  const guard=new THREE.Mesh(new THREE.RingGeometry(.18,.54,24,1),assets.makeMat(0x858585,.6,.35));guard.rotation.x=Math.PI;g.add(guard);
  for(let i=0;i<6;i++){const b=assets.box(.12,.035,.62,0x1c1c1c,.4,.5);b.position.z=.24;b.rotation.z=i*Math.PI*2/6;g.add(b)}
  return g;
}

function addPipes(){
  const data=[
    [0xd22d2d,[[-5.2,.86,3.2],[-3.25,.76,1.25],[0,.76,1.25],[3.25,.76,1.25]]],
    [0x1e88e5,[[5.2,.86,3.0],[3.25,.76,-1.82],[0,.76,-1.82],[-3.25,.76,-1.82]]],
    [0x43a047,[[-4.8,.86,-3.2],[-1.7,.95,-.35],[1.7,.95,-.35],[4.8,.86,-3.2]]]
  ];
  data.forEach(d=>{const tube=assets.pipeCurve(d[1],d[0],.2);caseGroup.add(tube);pipes.push(tube)});
}

function newGame(){score=0;$('score').textContent=0;$('level').textContent=1;build();banner('BioLab bereit')}
function startGame(){banner('Start')}
function hit(e){mouse.x=e.clientX/innerWidth*2-1;mouse.y=-(e.clientY/innerHeight)*2+1;raycaster.setFromCamera(mouse,camera);const h=raycaster.intersectObjects(objects,false)[0];return h&&h.object}
function clickObj(e){const o=hit(e);if(!o)return;score+=10;$('score').textContent=score;banner((o.userData.module||'Modul')+' geprüft');if(score%30===0){const order=['watering','greenhouse','growth','nutrients','tank','animal'];focusMod(order[Math.min(order.length-1,Math.floor(score/30))])}}
function banner(t){const b=$('banner');b.textContent=t;b.style.opacity=1;setTimeout(()=>b.style.opacity=0,850)}
function pd(e){if(e.target!==renderer.domElement)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});renderer.domElement.setPointerCapture(e.pointerId);down=true;lastX=e.clientX;lastY=e.clientY;drag=false;if(pointers.size===2){const a=[...pointers.values()];pinch=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)}}
function pm(e){if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const a=[...pointers.values()];const d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(pinch){radius*=pinch/d;updateCamera()}pinch=d;drag=true;return}if(!down)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;if(Math.abs(dx)+Math.abs(dy)>4)drag=true;theta-=dx*.006;phi-=dy*.005;lastX=e.clientX;lastY=e.clientY;updateCamera()}
function pu(e){pointers.delete(e.pointerId);if(pointers.size<2)pinch=0;if(!drag){const now=Date.now();if(now-lastTap<350){const o=hit(e);if(o)focusMod(o.userData.module)}else clickObj(e);lastTap=now}down=pointers.size>0}
function wh(e){e.preventDefault();radius*=e.deltaY>0?1.08:.92;updateCamera()}
function updateCamera(){phi=Math.max(.38,Math.min(1.25,phi));radius=Math.max(6,Math.min(20,radius));camera.position.set(target.x+radius*Math.sin(phi)*Math.sin(theta),target.y+radius*Math.cos(phi),target.z+radius*Math.sin(phi)*Math.cos(theta));camera.lookAt(target)}
function focusMod(m){document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));const map={watering:0,greenhouse:1,growth:2,nutrients:3,tank:4,animal:5};document.querySelectorAll('.tab')[map[m]??0].classList.add('active');const pos={watering:[-3.25,.85,-1.82],greenhouse:[0,.85,-1.82],growth:[3.25,.85,-1.82],nutrients:[-3.25,.85,1.25],tank:[0,.85,1.25],animal:[3.25,.85,1.25]}[m]||[0,1.35,-.35];target.set(...pos);radius=7.4;theta={watering:-.28,greenhouse:0,growth:.28,nutrients:-.38,tank:0,animal:.38}[m]||0;phi=.74;updateCamera()}
function resetView(){target.set(0,1.35,-.35);theta=-.12;phi=.78;radius=14.2;updateCamera()}
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);updateCamera()}
function animate(){requestAnimationFrame(animate);const t=performance.now()/1000;if(fan)fan.rotation.z+=.16;pipes.forEach((p,i)=>p.material.emissiveIntensity=.12+.22*Math.sin(t*3+i));renderer.render(scene,camera)}
window.startGame=startGame;window.newGame=newGame;window.resetView=resetView;window.focusMod=focusMod;
