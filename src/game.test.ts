import { describe, expect, it } from 'vitest';
import { Game } from './game';
import { LEVELS, key, neighbors, nextStep, walkable } from './levels';

describe('maze layout and routing', () => {
  for (const level of LEVELS) it(`${level.name}: all pellets and enemies are reachable`, () => {
    const start = { x: 1, z: 1 };
    const queue = [start], seen = new Set([key(start)]);
    for (let i = 0; i < queue.length; i++) {
      for (const p of neighbors(level.map, queue[i])) if (!seen.has(key(p))) {
        seen.add(key(p)); queue.push(p);
      }
    }
    expect(level.map.every(row => row.length === 15)).toBe(true);
    level.map.forEach((row, z) => [...row].forEach((c, x) => {
      if (c !== '#') expect(seen.has(key({x,z})), `${x},${z}`).toBe(true);
    }));
    expect(walkable(level.map, {x:-1,z:1})).toBe(false);
    expect(nextStep(level.map, start, {x:3,z:1})).toEqual({x:2,z:1});
  });
});

describe('game rules', () => {
  it('blocks walls and awards a pellet only once', () => {
    const game = new Game(); game.start(); game.ghosts=[];
    game.player.direction={x:-1,z:0}; game.desired={x:-1,z:0}; game.tick();
    expect(game.player.position).toEqual({x:1,z:1});
    game.desired={x:1,z:0}; game.tick(); expect(game.score).toBe(10);
    game.collect(); expect(game.score).toBe(10);
  });
  it('awards power orbs and lets the player catch enemies', () => {
    const game = new Game(); game.start();
    game.player.position={x:13,z:1}; game.collect();
    expect(game.score).toBe(50); expect(game.power).toBe(40);
    game.player.direction={x:0,z:0}; game.ghosts[0].position={x:13,z:1};
    game.tick(); expect(game.score).toBe(250); expect(game.lives).toBe(3);
  });
  it('loses one life per collision and grants respawn immunity', () => {
    const game = new Game(); game.start(); game.immunity=0;
    game.player.direction={x:0,z:0};
    game.ghosts.forEach(g=>g.position={...game.player.position}); game.tick();
    expect(game.lives).toBe(2); expect(game.immunity).toBe(12);
    game.ghosts.forEach(g=>g.position={...game.player.position}); game.tick();
    expect(game.lives).toBe(2);
  });
  it('detects a crossing collision', () => {
    const game=new Game(); game.start(); game.immunity=0; game.ticks=1;
    game.ghosts=game.ghosts.slice(0,1); game.ghosts[0].position={x:2,z:1};
    // Player enters the ghost tile on this step; collision must not be skipped.
    game.tick(); expect(game.lives).toBe(2);
  });
  it('ends the run at zero lives and restarts cleanly', () => {
    const game=new Game(); game.start(); game.lives=1; game.immunity=0;
    game.player.direction={x:0,z:0}; game.ghosts[0].position={...game.player.position};
    game.tick(); expect(game.status).toBe('lost');
    game.start(); expect(game.lives).toBe(3); expect(game.score).toBe(0); expect(game.level).toBe(0);
  });
  it('progresses through all worlds, preserves score, and wins', () => {
    const game=new Game(); game.start(); game.ghosts=[];
    for(let level=0;level<3;level++) {
      game.ghosts=[]; game.player.direction={x:0,z:0};game.pellets.clear();game.tick();
      expect(game.score).toBe((level+1)*500);
      expect(game.status).toBe(level===2?'won':'level-complete');
      if(level<2)game.advance();
    }
  });
  it('does not move or score while paused', () => {
    const game=new Game(); game.start(); game.status='paused';game.tick();
    expect(game.player.position).toEqual({x:1,z:1});expect(game.score).toBe(0);
  });
});
