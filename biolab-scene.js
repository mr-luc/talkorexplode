import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';
import {createBioLabAssets} from './assets/biolab-assets.js';

let scene,camera,renderer,raycaster,mouse,caseGroup,fan,assets;
let objects=[],pipes=[],score=0;
let theta=-0.12,phi=0.76,radius=13.2,target=new THREE.Vector3(0,1.35,-0.75);
let down=false,lastX=0,lastY=0,drag=false,pointers=new Map(),pinch=0,lastTap=0;
const $=id=>document.getElementById(id);

init();newGame();animate();

function init(){
  assets=createBioLabAssets(THREE);
  scene=new THREE.Scene();scene.background=new THREE.Color(0x3d3024);scene.fog=new THREE.Fog(0x3d3024,24,68);
  camera=new THREE.PerspectiveCamera(45,innerWidth/innerHeight,.1,100);
  renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;
  $('stage').appendChild(renderer.domElement);
  raycaster=new THREE.Raycaster();mouse=new THREE.Vector2();
  scene.add(new THREE.HemisphereLight(0xffedc9,0x71543a,1.5));
  const key=new THREE.DirectionalLight(0xffe4b5,3.7);key.position.set(6,12,8);key.castShadow=true;scene.add(key);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(70,40),new THREE.MeshStandardMaterial({color:0x5a4430,roughness:.78}));floor.rotation.x=-Math.PI/2;floor.position.y=-.78;floor.receiveShadow=true;scene.add(floor);
  const wall=new THREE.Mesh(new THREE.BoxGeometry(36,12,.3),new THREE.MeshStandardMaterial({color:0x463423,roughness:.9}));wall.position.set(0,5,-22);scene.add(wall);
  if(window.QRCode)new QRCode($('qr'),{text:location.origin+location.pathname.replace('game-3d-biolab.html','index.html')+'?manual=1&room=BIO-9Z7F',width:130,height:130});
  const c=renderer.domElement;c.addEventListener('pointerdown',pd);c.addEventListener('pointermove',pm);c.addEventListener('pointerup',pu);c.addEventListener('pointercancel',pu);c.addEventListener('wheel',wh,{passive:false});
  addEventListener('resize',resize);updateCamera();
}

function build(){
  if(caseGroup)scene.remove(caseGroup);
  caseGroup=new THREE.Group();scene.add(caseGroup);objects=[];pipes=[];
  const base=assets.box(11.8,.82,8.4,0x2c2924,.72,.33);caseGroup.add(base);
  const rim=assets.box(12.25,.25,8.75,0x9a8664,.85,.25);rim.position.y=-.46;caseGroup.add(rim);
  const foam=assets.box(11.1,.16,7.5,0x171615,.45,.58);foam.position.y=.48;caseGroup.add(foam);
  const lid=assets.box(11.8,.35,.42,0x2e2a25,.75,.3);lid.position.set(0,3.1,-4.48);caseGroup.add(lid);
  const lidInside=assets.box(10.95,3.9,.12,0x151515,.35,.68);lidInside.position.set(0,3.1,-4.23);caseGroup.add(lidInside);
  [-4,0,4].forEach(x=>{const h=assets.cyl(.12,.9,0xcab27c);h.rotation.z=Math.PI/2;h.position.set(x,.86,-4.12);caseGroup.add(h)});
  const display=assets.box(3.9,1.15,.16,0x080303,.25,.5,.16);display.position.set(-.5,3.48,-4.05);caseGroup.add(display);
  const time=assets.label('04:37',3.15,.82,'#ff3d32','rgba(20,0,0,.85)',94);time.position.set(-.5,3.5,-3.92);caseGroup.add(time);
  const serial=assets.label('SERIAL\nBIO-5-2025',1.85,.92,'#f0eadc','rgba(10,10,10,.92)',40);serial.position.set(-4.1,3.55,-3.92);caseGroup.add(serial);
  fan=makeFan();fan.position.set(3.55,3.55,-3.92);caseGroup.add(fan);
  place(assets.wateringModule(),'watering',-3.25,-1.82);place(assets.greenhouseModule(),'greenhouse',0,-1.82);place(assets.growthModule(),'growth',3.25,-1.82);
  place(assets.nutrientsModule(),'nutrients',-3.25,1.25);place(assets.tankModule(),'tank',0,1.25);place(assets.animalModule(),'animal',3.25,1.25);
  addPipes();focusMod('watering');
}
function place(mod,name,x,z){mod.position.set(x,.56,z);caseGroup.add(mod);mod.traverse(o=>{if(o.isMesh){o.userData.module=o.userData.module||name;objects.push(o)}})}
function makeFan(){const g=new THREE.Group();const ring=new THREE.Mesh(new THREE.TorusGeometry(.48,.04,14,64),assets.makeMat(0x101010,.6,.4));g.add(ring);for(let i=0;i<6;i++){const b=assets.box(.12,.035,.54,0x1c1c1c,.4,.5);b.position.z=.22;b.rotation.z=i*Math.PI*2/6;g.add(b)}return g}
function addPipes(){const data=[[0xd22d2d,[[-5,.72,3.2],[-3.25,.8,1.25],[0,.8,1.25],[3.25,.8,1.25]]],[0x1e88e5,[[5,.72,3.0],[3.25,.8,-1.82],[0,.8,-1.82],[-3.25,.8,-1.82]]],[0x43a047,[[-4.8,.72,-3.0],[-1.7,.9,-.4],[1.7,.9,-.4],[4.8,.72,-3.0]]]];data.forEach(d=>{const tube=assets.pipeCurve(d[1],d[0],.2);caseGroup.add(tube);pipes.push(tube)})}

function newGame(){score=0;$('score').textContent=0;$('level').textContent=1;build();banner('BioLab bereit')}
function startGame(){banner('Start')}
function hit(e){mouse.x=e.clientX/innerWidth*2-1;mouse.y=-(e.clientY/innerHeight)*2+1;raycaster.setFromCamera(mouse,camera);const h=raycaster.intersectObjects(objects,false)[0];return h&&h.object}
function clickObj(e){const o=hit(e);if(!o)return;score+=10;$('score').textContent=score;banner((o.userData.module||'Modul')+' geprüft');if(score%30===0){const order=['watering','greenhouse','growth','nutrients','tank','animal'];focusMod(order[Math.min(order.length-1,Math.floor(score/30))])}}
function banner(t){const b=$('banner');b.textContent=t;b.style.opacity=1;setTimeout(()=>b.style.opacity=0,850)}
function pd(e){if(e.target!==renderer.domElement)return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});renderer.domElement.setPointerCapture(e.pointerId);down=true;lastX=e.clientX;lastY=e.clientY;drag=false;if(pointers.size===2){const a=[...pointers.values()];pinch=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y)}}
function pm(e){if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pointers.size===2){const a=[...pointers.values()];const d=Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);if(pinch){radius*=pinch/d;updateCamera()}pinch=d;drag=true;return}if(!down)return;const dx=e.clientX-lastX,dy=e.clientY-lastY;if(Math.abs(dx)+Math.abs(dy)>4)drag=true;theta-=dx*.006;phi-=dy*.005;lastX=e.clientX;lastY=e.clientY;updateCamera()}
function pu(e){pointers.delete(e.pointerId);if(pointers.size<2)pinch=0;if(!drag){const now=Date.now();if(now-lastTap<350){const o=hit(e);if(o)focusMod(o.userData.module)}else clickObj(e);lastTap=now}down=pointers.size>0}
function wh(e){e.preventDefault();radius*=e.deltaY>0?1.08:.92;updateCamera()}
function updateCamera(){phi=Math.max(.35,Math.min(1.25,phi));radius=Math.max(6,Math.min(20,radius));camera.position.set(target.x+radius*Math.sin(phi)*Math.sin(theta),target.y+radius*Math.cos(phi),target.z+radius*Math.sin(phi)*Math.cos(theta));camera.lookAt(target)}
function focusMod(m){document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));const map={watering:0,greenhouse:1,growth:2,nutrients:3,tank:4,animal:5};document.querySelectorAll('.tab')[map[m]??0].classList.add('active');const pos={watering:[-3.25,.9,-1.82],greenhouse:[0,.9,-1.82],growth:[3.25,.9,-1.82],nutrients:[-3.25,.9,1.25],tank:[0,.9,1.25],animal:[3.25,.9,1.25]}[m]||[0,1.35,-.75];target.set(...pos);radius=7.2;theta={watering:-.28,greenhouse:0,growth:.28,nutrients:-.38,tank:0,animal:.38}[m]||0;phi=.72;updateCamera()}
function resetView(){target.set(0,1.35,-.75);theta=-.12;phi=.76;radius=13.2;updateCamera()}
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);updateCamera()}
function animate(){requestAnimationFrame(animate);const t=performance.now()/1000;if(fan)fan.rotation.z+=.16;pipes.forEach((p,i)=>p.material.emissiveIntensity=.12+.25*Math.sin(t*3+i));renderer.render(scene,camera)}
window.startGame=startGame;window.newGame=newGame;window.resetView=resetView;window.focusMod=focusMod;
