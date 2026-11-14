/** Small original synth effects. Audio starts only after a user gesture. */
export class Sound {
 context:AudioContext|undefined; muted=false;
 unlock(){this.context??=new AudioContext();void this.context.resume();}
 play(event:string){if(this.muted||!this.context)return;const ctx=this.context;const osc=ctx.createOscillator(),gain=ctx.createGain();const notes:Record<string,number>={pellet:740,power:1047,hit:130,ghost:880,win:1320};osc.type=event==='hit'?'sawtooth':'sine';osc.frequency.setValueAtTime(notes[event]??440,ctx.currentTime);osc.frequency.exponentialRampToValueAtTime(event==='hit'?50:(notes[event]??440)*1.5,ctx.currentTime+.12);gain.gain.setValueAtTime(.06,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+.18);osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.2);}
}
