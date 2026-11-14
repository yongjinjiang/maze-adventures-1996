import {LEVELS, Point, key, same, walkable, nextStep} from './levels';
export type Status = 'ready' | 'playing' | 'paused' | 'level-complete' | 'won' | 'lost';
export type Actor = { position: Point; previous: Point; spawn: Point; direction: Point };
const actor = (p:Point):Actor => ({position:{...p},previous:{...p},spawn:{...p},direction:{x:1,z:0}});
export class Game {
 level=0; score=0; lives=3; status:Status='ready'; pellets=new Map<string,boolean>(); player!:Actor; ghosts:Actor[]=[];
 desired:Point={x:0,z:0}; power=0; immunity=0; ticks=0; events:string[]=[];
 get map(){return LEVELS[this.level].map;}
 constructor(){this.loadLevel();}
 loadLevel(){this.pellets.clear();this.ghosts=[];this.power=0;this.immunity=12;this.ticks=0;this.desired={x:0,z:0};
 this.map.forEach((row,z)=>[...row].forEach((c,x)=>{const p={x,z};if(c==='P')this.player=actor(p);if(c==='G')this.ghosts.push(actor(p));if(c==='.'||c==='o')this.pellets.set(key(p),c==='o');}));}
 start(){this.level=0;this.score=0;this.lives=3;this.loadLevel();this.status='playing';}
 advance(){if(this.status!=='level-complete')return;this.level++;this.loadLevel();this.status='playing';}
 collect(){const k=key(this.player.position);if(!this.pellets.has(k))return;const power=this.pellets.get(k);this.pellets.delete(k);this.score+=power?50:10;if(power)this.power=40;this.events.push(power?'power':'pellet');}
 resetActors(){for(const a of [this.player,...this.ghosts]){a.position={...a.spawn};a.previous={...a.spawn};}this.desired={x:0,z:0};this.player.direction={x:0,z:0};this.immunity=12;this.power=0;}
 tick(){if(this.status!=='playing')return;this.events=[];this.ticks++;this.power=Math.max(0,this.power-1);this.immunity=Math.max(0,this.immunity-1);
 const p=this.player;p.previous={...p.position};const move=(d:Point)=>({x:p.position.x+d.x,z:p.position.z+d.z});
 if((this.desired.x||this.desired.z)&&walkable(this.map,move(this.desired)))p.direction={...this.desired};
 if(walkable(this.map,move(p.direction)))p.position=move(p.direction);this.collect();
 this.ghosts.forEach((g,i)=>{g.previous={...g.position};if(this.ticks% (this.power?3:2)!==0)return;
 const patrol=[{x:13,z:1},{x:13,z:9},{x:1,z:9},{x:1,z:1}];
 const target=this.power?g.spawn:(this.ticks%60<40?p.position:patrol[(Math.floor(this.ticks/12)+i)%4]);
 g.position=nextStep(this.map,g.position,target);g.direction={x:g.position.x-g.previous.x,z:g.position.z-g.previous.z};});
 for(const g of this.ghosts){if(same(p.position,g.position)||(same(p.previous,g.position)&&same(p.position,g.previous))){
 if(this.power){this.score+=200;g.position={...g.spawn};g.previous={...g.spawn};this.events.push('ghost');}
 else if(!this.immunity){this.lives--;this.events.push('hit');if(this.lives===0)this.status='lost';else this.resetActors();break;}}}
 if(this.status==='playing'&&this.pellets.size===0){this.score+=500;this.status=this.level===LEVELS.length-1?'won':'level-complete';this.events.push('win');}
 }
}
