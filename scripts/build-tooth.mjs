/**
 * Builds the 3D tooth used in the hero: a lower molar modeled with signed distance functions
 * (smooth unions of ellipsoids and tapered capsules), meshed with marching cubes, snapped onto the
 * exact surface, given gradient normals and an enamel → root color gradient, simplified and written to
 * public/models/tooth.glb with meshopt compression. Nothing is downloaded: the shape is defined here.
 *
 * Run: node scripts/build-tooth.mjs
 */
import { writeFileSync } from "node:fs";
import isosurface from "isosurface";
import { Document, NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { meshopt, reorder, simplify, weld } from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptSimplifier } from "meshoptimizer";

/* ---------- SDF primitives (after Inigo Quilez) ---------- */

const smin = (a, b, k) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
};
const smax = (a, b, k) => -smin(-a, -b, k);

function ellipsoid(x, y, z, rx, ry, rz) {
  const k0 = Math.hypot(x / rx, y / ry, z / rz);
  const k1 = Math.hypot(x / (rx * rx), y / (ry * ry), z / (rz * rz));
  return k1 === 0 ? -Math.min(rx, ry, rz) : (k0 * (k0 - 1)) / k1;
}

/** Cone with rounded ends: radius r1 at a, r2 at b. */
function roundCone(px, py, pz, a, b, r1, r2) {
  const bax = b[0] - a[0], bay = b[1] - a[1], baz = b[2] - a[2];
  const l2 = bax * bax + bay * bay + baz * baz;
  const rr = r1 - r2;
  const a2 = l2 - rr * rr;
  const il2 = 1 / l2;
  const pax = px - a[0], pay = py - a[1], paz = pz - a[2];
  const y = pax * bax + pay * bay + paz * baz;
  const z = y - l2;
  const xx = pax * l2 - bax * y, xy = pay * l2 - bay * y, xz = paz * l2 - baz * y;
  const x2 = xx * xx + xy * xy + xz * xz;
  const y2 = y * y * l2;
  const z2 = z * z * l2;
  const k = Math.sign(rr) * rr * rr * x2;
  if (Math.sign(z) * a2 * z2 > k) return Math.sqrt(x2 + z2) * il2 - r2;
  if (Math.sign(y) * a2 * y2 < k) return Math.sqrt(x2 + y2) * il2 - r1;
  return (Math.sqrt(x2 * a2 * il2) + y * rr) * il2 - r1;
}

/**
 * A root that tapers from a to the tip and bends smoothly outward: the space is sheared sideways
 * by a quadratic of depth, so the curve has no joints.
 */
function root(x, y, z, top, tip, r1, r2, bend) {
  const u = Math.min(1, Math.max(0, (top[1] - y) / (top[1] - tip[1])));
  return roundCone(x + bend * u * u, y, z, top, tip, r1, r2);
}

/* ---------- Lower molar, y up. Crown ≈ top 40%, roots ≈ bottom 60%. ---------- */

const CERVICAL_Y = 0.3; // enamel ends here (cemento-enamel junction)
const CUSPS = [
  [-0.4, 1.15, 0.3],
  [0.4, 1.15, 0.3],
  [-0.4, 1.15, -0.29],
  [0.4, 1.15, -0.29],
];

export function tooth(x, y, z) {
  // Crown: plump and wider than tall, convex sides narrowing toward the neck…
  let d = ellipsoid(x, y - 0.88, z, 0.86, 0.52, 0.7);
  // …four soft, rounded cusps…
  for (const c of CUSPS) d = smin(d, ellipsoid(x - c[0], y - c[1], z - c[2], 0.42, 0.33, 0.38), 0.38);
  // …and gentle grooves between them: soft-ended ellipsoids carved with a wide blend, no pits or sharp edges.
  const g = Math.min(ellipsoid(x, y - 1.52, z, 0.52, 0.1, 0.09), ellipsoid(x, y - 1.52, z, 0.09, 0.1, 0.44));
  d = smax(d, -g, 0.2);
  // Neck: the crown overhangs a narrower waist that flows into a short shared trunk.
  d = smin(d, ellipsoid(x, y - 0.3, z, 0.6, 0.28, 0.5), 0.3);
  d = smin(d, ellipsoid(x, y - 0.02, z, 0.52, 0.32, 0.43), 0.24);
  // Roots: mesial and distal, thick at the base, tapering to rounded tips and curving outward…
  const zr = z * 0.8; // roots are wider front-to-back than side-to-side
  d = smin(d, root(x, y, zr, [-0.28, -0.02, 0], [-0.34, -1.4, 0], 0.31, 0.15, 0.14), 0.22);
  d = smin(d, root(x, y, zr, [0.28, -0.02, 0], [0.34, -1.38, 0], 0.31, 0.15, -0.14), 0.22);
  // …and a thinner third root behind them.
  d = smin(d, root(x, y, z, [0, -0.08, -0.2], [0.02, -1.15, -0.34], 0.2, 0.11, 0), 0.2);
  return d;
}

const BOUNDS = [
  [-1.05, -1.75, -0.95],
  [1.05, 1.72, 0.95],
];
const STEP = 0.013;

/* ---------- Mesh ---------- */

console.time("field");
const dims = [0, 1, 2].map((i) => Math.round((BOUNDS[1][i] - BOUNDS[0][i]) / STEP) + 1);
const field = new Float32Array(dims[0] * dims[1] * dims[2]);
for (let k = 0; k < dims[2]; k++)
  for (let j = 0; j < dims[1]; j++)
    for (let i = 0; i < dims[0]; i++)
      field[i + dims[0] * (j + dims[1] * k)] = tooth(BOUNDS[0][0] + i * STEP, BOUNDS[0][1] + j * STEP, BOUNDS[0][2] + k * STEP);
console.timeEnd("field");

console.time("marching cubes");
// isosurface samples potential(x,y,z) at grid corners; read back from the precomputed field.
const mcBounds = [BOUNDS[0], BOUNDS[0].map((b, i) => b + STEP * dims[i])];
const mc = isosurface.marchingCubes(
  dims,
  (x, y, z) => {
    const i = Math.round((x - BOUNDS[0][0]) / STEP), j = Math.round((y - BOUNDS[0][1]) / STEP), k = Math.round((z - BOUNDS[0][2]) / STEP);
    return -field[i + dims[0] * (j + dims[1] * k)]; // isosurface treats > 0 as inside
  },
  mcBounds,
);
console.timeEnd("marching cubes");

// Weld duplicate edge vertices.
const key = (p) => `${Math.round(p[0] * 1e5)},${Math.round(p[1] * 1e5)},${Math.round(p[2] * 1e5)}`;
const map = new Map();
const pos = [];
const remap = mc.positions.map((p) => {
  const kk = key(p);
  let idx = map.get(kk);
  if (idx === undefined) {
    idx = pos.length / 3;
    map.set(kk, idx);
    pos.push(p[0], p[1], p[2]);
  }
  return idx;
});
const tris = [];
for (const c of mc.cells) {
  const a = remap[c[0]], b = remap[c[1]], cc = remap[c[2]];
  if (a !== b && b !== cc && a !== cc) tris.push(a, b, cc);
}

const n = pos.length / 3;
const grad = (x, y, z, e = 1e-4) => {
  const gx = tooth(x + e, y, z) - tooth(x - e, y, z);
  const gy = tooth(x, y + e, z) - tooth(x, y - e, z);
  const gz = tooth(x, y, z + e) - tooth(x, y, z - e);
  const l = Math.hypot(gx, gy, gz) || 1;
  return [gx / l, gy / l, gz / l];
};

// Snap every vertex onto the exact zero surface (removes the faceted "ripple"), then take normals from the gradient.
const normals = new Float32Array(n * 3);
for (let v = 0; v < n; v++) {
  let x = pos[v * 3], y = pos[v * 3 + 1], z = pos[v * 3 + 2];
  for (let it = 0; it < 3; it++) {
    const d = tooth(x, y, z);
    const [gx, gy, gz] = grad(x, y, z);
    x -= d * gx;
    y -= d * gy;
    z -= d * gz;
  }
  pos[v * 3] = x;
  pos[v * 3 + 1] = y;
  pos[v * 3 + 2] = z;
  const [nx, ny, nz] = grad(x, y, z);
  normals[v * 3] = nx;
  normals[v * 3 + 1] = ny;
  normals[v * 3 + 2] = nz;
}

// Wind triangles so their face normal agrees with the gradient.
for (let t = 0; t < tris.length; t += 3) {
  const [a, b, c] = [tris[t], tris[t + 1], tris[t + 2]];
  const ux = pos[b * 3] - pos[a * 3], uy = pos[b * 3 + 1] - pos[a * 3 + 1], uz = pos[b * 3 + 2] - pos[a * 3 + 2];
  const vx = pos[c * 3] - pos[a * 3], vy = pos[c * 3 + 1] - pos[a * 3 + 1], vz = pos[c * 3 + 2] - pos[a * 3 + 2];
  const fx = uy * vz - uz * vy, fy = uz * vx - ux * vz, fz = ux * vy - uy * vx;
  if (fx * (normals[a * 3] + normals[b * 3] + normals[c * 3]) + fy * (normals[a * 3 + 1] + normals[b * 3 + 1] + normals[c * 3 + 1]) + fz * (normals[a * 3 + 2] + normals[b * 3 + 2] + normals[c * 3 + 2]) < 0) {
    tris[t + 1] = c;
    tris[t + 2] = b;
  }
}

// Center vertically; color pearl enamel → warm ivory root with a soft blend at the neck.
let minY = Infinity, maxY = -Infinity;
for (let v = 0; v < n; v++) {
  minY = Math.min(minY, pos[v * 3 + 1]);
  maxY = Math.max(maxY, pos[v * 3 + 1]);
}
const cy = (minY + maxY) / 2;
const enamel = [0.985, 0.98, 0.965], ivory = [0.93, 0.86, 0.74];
const colors = new Float32Array(n * 3);
const rootness = new Float32Array(n);
const smooth = (e0, e1, x) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};
for (let v = 0; v < n; v++) {
  const y = pos[v * 3 + 1];
  const r = smooth(CERVICAL_Y + 0.22, CERVICAL_Y - 0.32, y);
  rootness[v] = r;
  for (let c = 0; c < 3; c++) colors[v * 3 + c] = enamel[c] + (ivory[c] - enamel[c]) * r;
  pos[v * 3 + 1] = y - cy;
}

console.log(`raw mesh: ${n} verts, ${tris.length / 3} tris, height ${(maxY - minY).toFixed(3)}, cervical at ${(CERVICAL_Y - cy).toFixed(3)}`);

/* ---------- glTF ---------- */

await MeshoptEncoder.ready;
await MeshoptSimplifier.ready;
const doc = new Document();
const buffer = doc.createBuffer();
const prim = doc
  .createPrimitive()
  .setAttribute("POSITION", doc.createAccessor().setType("VEC3").setArray(new Float32Array(pos)).setBuffer(buffer))
  .setAttribute("NORMAL", doc.createAccessor().setType("VEC3").setArray(normals).setBuffer(buffer))
  .setAttribute("COLOR_0", doc.createAccessor().setType("VEC3").setArray(colors).setBuffer(buffer))
  .setAttribute("_ROOTNESS", doc.createAccessor().setType("SCALAR").setArray(rootness).setBuffer(buffer))
  .setIndices(doc.createAccessor().setType("SCALAR").setArray(new Uint32Array(tris)).setBuffer(buffer));
const mesh = doc.createMesh("tooth").addPrimitive(prim);
doc.createScene().addChild(doc.createNode("tooth").setMesh(mesh));

await doc.transform(
  weld(),
  simplify({ simplifier: MeshoptSimplifier, ratio: 0.45, error: 0.0004 }),
  reorder({ encoder: MeshoptEncoder }),
  meshopt({ encoder: MeshoptEncoder, level: "high", quantizePosition: 16, quantizeNormal: 10, quantizeColor: 8, quantizeGeneric: 8 }),
);

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.encoder": MeshoptEncoder });
const glb = await io.writeBinary(doc);
writeFileSync(new URL("../public/models/tooth.glb", import.meta.url), glb);
const out = doc.getRoot().listMeshes()[0].listPrimitives()[0];
console.log(`tooth.glb ${(glb.byteLength / 1024).toFixed(0)} KB, ${out.getAttribute("POSITION").getCount()} verts, ${out.getIndices().getCount() / 3} tris`);
