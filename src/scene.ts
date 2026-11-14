import * as THREE from 'three';
import {Game, Actor} from './game';
import {LEVELS} from './levels';
export class World {
 renderer=new THREE.WebGLRenderer({antialias:true,alpha:true}); scene=new THREE.Scene(); camera=new THREE.OrthographicCamera(); board=new THREE.Group();
 player=new THREE.Group(); ghosts:THREE.Group[]=[]; pellets=new Map<string,THREE.Mesh>(); particles=new THREE.Group();
 mouths=Array.from({length:9},(_,i)=>new THREE.SphereGeometry(.39,24,16,.03+i*.065,Math.PI*2-.06-i*.13)); body:THREE.Mesh;
 constructor(private host:HTMLElement){
 this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;host.append(this.renderer.domElement);
 this.scene.add(new THREE.HemisphereLight(0xe8ffff,0x344258,2.8));const sun=new THREE.DirectionalLight(0xfff1c7,3);sun.position.set(-5,16,9);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-15,right:15,top:15,bottom:-15});this.scene.add(sun);
 this.scene.add(this.board,this.player,this.particles);this.body=new THREE.Mesh(this.mouths[0],new THREE.MeshStandardMaterial({color:0xffd94a,roughness:.3}));this.body.castShadow=true;this.player.add(this.body);
 const inside=new THREE.Mesh(new THREE.SphereGeometry(.32,20,12),new THREE.MeshBasicMaterial({color:0x39291b}));this.player.add(inside);
 for(const z of [-.20,.20]){const eye=new THREE.Mesh(new THREE.SphereGeometry(.055,8,8),new THREE.MeshBasicMaterial({color:0x17232a}));eye.position.set(-.13,.30,z);this.player.add(eye);}
 this.camera.position.set(18,23,25);this.camera.lookAt(0,0,0);new ResizeObserver(()=>this.resize()).observe(host);this.resize();
 }
 resize(){const w=this.host.clientWidth,h=this.host.clientHeight;this.renderer.setSize(w,h);const aspect=w/h;const extent=Math.max(10,12/aspect);Object.assign(this.camera,{left:-extent*aspect,right:extent*aspect,top:extent,bottom:-extent,near:.1,far:100});this.camera.updateProjectionMatrix();}
 clear(group:THREE.Group){group.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose());}});group.clear();}
 load(game:Game){this.clear(this.board);this.clear(this.particles);this.ghosts=[];this.pellets.clear();const theme=LEVELS[game.level];
 const box=(w:number,h:number,d:number,color:number,x:number,y:number,z:number)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:.65}));mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;this.board.add(mesh);return mesh;};
 box(15.6,.6,11.6,theme.floor,0,-.5,0);box(15.8,.12,11.8,theme.color,0,-.82,0);
 game.map.forEach((row,z)=>[...row].forEach((c,x)=>{if(c==='#'){box(.96,.66,.96,theme.color,x-7,.1,z-5);box(.85,.045,.85,theme.color,x-7,.455,z-5);}}));
 for(const [k,power] of game.pellets){const [x,z]=k.split(',').map(Number);const mesh=new THREE.Mesh(new THREE.SphereGeometry(power?.19:.075,10,8),new THREE.MeshStandardMaterial({color:power?0xffffff:0xffe8a6,emissive:power?0x8fefff:0xffbf55,emissiveIntensity:power?.9:.3}));mesh.position.set(x-7,.18,z-5);this.board.add(mesh);this.pellets.set(k,mesh);}
 game.ghosts.forEach((_,i)=>{const group=new THREE.Group();const material=new THREE.MeshStandardMaterial({color:[0xff7e91,0xb69aff,0xffb56b][i],roughness:.4});const dome=new THREE.Mesh(new THREE.SphereGeometry(.34,20,12,0,Math.PI*2,0,Math.PI/2),material);dome.position.y=.12;group.add(dome);const skirt=new THREE.Mesh(new THREE.CylinderGeometry(.34,.39,.35,20),material);skirt.position.y=-.05;group.add(skirt);for(const x of [-.13,.13]){const eye=new THREE.Mesh(new THREE.SphereGeometry(.10,10,8),new THREE.MeshBasicMaterial({color:0xffffff}));eye.position.set(x,.17,.29);group.add(eye);const pupil=new THREE.Mesh(new THREE.SphereGeometry(.048,8,8),new THREE.MeshBasicMaterial({color:0x1c2844}));pupil.position.set(x,.17,.37);group.add(pupil);}this.board.add(group);this.ghosts.push(group);});
 for(let i=0;i<55;i++){const mesh=new THREE.Mesh(new THREE.SphereGeometry(game.level===2?.025:.045,6,4),new THREE.MeshBasicMaterial({color:theme.color,transparent:true,opacity:.45}));mesh.position.set(Math.sin(i*45)*13,1+(i%9)*.5,Math.cos(i*37)*10);this.particles.add(mesh);}
 }
 render(game:Game,alpha:number,time:number){const position=(object:THREE.Object3D,a:Actor)=>{object.position.set(THREE.MathUtils.lerp(a.previous.x,a.position.x,alpha)-7,.43,THREE.MathUtils.lerp(a.previous.z,a.position.z,alpha)-5);};position(this.player,game.player);
 const d=game.player.direction;if(d.x||d.z)this.player.rotation.y=Math.PI-Math.atan2(d.z,d.x);
 this.body.geometry=this.mouths[Math.floor((Math.sin(time*18)+1)*4)];this.player.visible=!game.immunity||Math.floor(time*9)%2===0||game.status!=='playing';
 game.ghosts.forEach((g,i)=>{position(this.ghosts[i],g);this.ghosts[i].position.y+=Math.sin(time*4+i)*.06;for(const child of this.ghosts[i].children.slice(0,2))(child as THREE.Mesh<THREE.BufferGeometry,THREE.MeshStandardMaterial>).material.color.set(game.power?0x619fff:[0xff7e91,0xb69aff,0xffb56b][i]);});
 for(const [k,mesh] of this.pellets){mesh.visible=game.pellets.has(k);if(game.pellets.get(k))mesh.scale.setScalar(1+Math.sin(time*5)*.15);}
 this.particles.rotation.y=time*.015;this.renderer.render(this.scene,this.camera);
 }
}
