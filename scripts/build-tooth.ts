/**
 * Bakes the procedural tooth (lib/tooth-sdf.ts) into public/models/tooth.bin so the browser
 * only decodes it instead of meshing on the main thread.
 * Run: node --experimental-strip-types scripts/build-tooth.ts
 *
 * Format (little-endian): "TOOTH1", u16 meshCount, then per mesh:
 *   u8 nameLen, name (ascii), u32 vertCount, u32 indexCount, f32 min[3], f32 max[3],
 *   i16 positions[vertCount*3] (normalized to min..max), i8 normals[vertCount*3],
 *   padding to 2 bytes, u16 indices[indexCount], padding to 4 bytes.
 */
import { writeFileSync } from "node:fs";
import { meshSdf, tooth, TOOTH_BOUNDS, TOOTH_CENTER_Y, type MeshData } from "../lib/tooth-sdf.ts";

const STEP = 0.05;
const meshes: [string, MeshData][] = [["whole", meshSdf(tooth, TOOTH_BOUNDS, STEP, -TOOTH_CENTER_Y)]];

const chunks: Buffer[] = [Buffer.from("TOOTH1", "ascii")];
const u16 = (n: number) => {
  const b = Buffer.alloc(2);
  b.writeUInt16LE(n);
  return b;
};
chunks.push(u16(meshes.length));
let size = 8;
const pad = (to: number) => {
  const p = (to - (size % to)) % to;
  if (p) {
    chunks.push(Buffer.alloc(p));
    size += p;
  }
};

for (const [name, m] of meshes) {
  const n = m.positions.length / 3;
  if (n > 65535) throw new Error(`${name}: too many vertices for u16 indices (${n})`);
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < n * 3; i++) {
    min[i % 3] = Math.min(min[i % 3], m.positions[i]);
    max[i % 3] = Math.max(max[i % 3], m.positions[i]);
  }
  const head = Buffer.alloc(1 + name.length + 8 + 24);
  let o = head.writeUInt8(name.length, 0);
  o += head.write(name, o, "ascii");
  o = head.writeUInt32LE(n, o);
  o = head.writeUInt32LE(m.indices.length, o);
  for (const v of [...min, ...max]) o = head.writeFloatLE(v, o);
  chunks.push(head);
  size += head.length;

  const p = Buffer.alloc(n * 6);
  for (let i = 0; i < n * 3; i++) {
    const a = i % 3;
    p.writeInt16LE(Math.round(((m.positions[i] - min[a]) / (max[a] - min[a] || 1)) * 65534 - 32767), i * 2);
  }
  const nrm = Buffer.alloc(n * 3);
  for (let i = 0; i < n * 3; i++) nrm.writeInt8(Math.round(m.normals[i] * 127), i);
  chunks.push(p, nrm);
  size += p.length + nrm.length;
  pad(2);
  const ix = Buffer.alloc(m.indices.length * 2);
  m.indices.forEach((v, i) => ix.writeUInt16LE(v, i * 2));
  chunks.push(ix);
  size += ix.length;
  pad(4);
  console.log(`${name}: ${n} verts, ${m.indices.length / 3} tris`);
}

const out = Buffer.concat(chunks);
writeFileSync(new URL("../public/models/tooth.bin", import.meta.url), out);
console.log(`tooth.bin ${(out.length / 1024).toFixed(1)} KB`);
