export type Point = { x: number; z: number };
export const LEVELS = [
  { name: 'Land', subtitle: 'The emerald gardens', color: 0x53b895, floor: 0x244f48, sky: 0x102b2b, accent: '#aee6b1', map: [
    '###############','#P....#......o#','#.##.#.#.###..#','#....#.#......#','###..#...#.##.#','#....###.#....#','#.##.....##.#.#','#....#G#......#','#.##.#.#.###..#','#o...#....G...#','###############'] },
  { name: 'Underwater', subtitle: 'The sunken passage', color: 0x429dbd, floor: 0x164460, sky: 0x081f36, accent: '#8bdcf8', map: [
    '###############','#P...#.......o#','#.##.#.##.##..#','#....#....#...#','#.##...##...#.#','#....#G...#...#','##.#.###.##.#.#','#..#.....G....#','#.###.#.###.#.#','#o....#.......#','###############'] },
  { name: 'Space', subtitle: 'The orbital labyrinth', color: 0x8b73ce, floor: 0x2c254e, sky: 0x100f28, accent: '#d5b9ff', map: [
    '###############','#P....#......o#','#.###.#.###.#.#','#...#...#.....#','##..#.G.#.##..#','#.......#.....#','#.##.##...##..#','#..#...#G.....#','#..###.#.###..#','#o.....G......#','###############'] },
];
export const key = (p: Point) => p.x + ',' + p.z;
export const same = (a: Point, b: Point) => a.x === b.x && a.z === b.z;
export const DIRECTIONS: Point[] = [{x:0,z:-1},{x:1,z:0},{x:0,z:1},{x:-1,z:0}];
export function walkable(map: string[], p: Point) { return !!map[p.z]?.[p.x] && map[p.z][p.x] !== '#'; }
export function neighbors(map: string[], p: Point) { return DIRECTIONS.map(d=>({x:p.x+d.x,z:p.z+d.z})).filter(n=>walkable(map,n)); }
/** Breadth-first search: the first tile on a shortest legal path. */
export function nextStep(map: string[], from: Point, target: Point): Point {
 const queue = [{p:from,first:from}]; const seen = new Set([key(from)]);
 for (let i=0;i<queue.length;i++) { const {p,first}=queue[i]; if(same(p,target)) return first;
  for(const n of neighbors(map,p)) if(!seen.has(key(n))) {seen.add(key(n));queue.push({p:n,first:i===0?n:first});}
 } return from;
}
