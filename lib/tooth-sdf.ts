/**
 * Procedural stylized molar, built from signed distance functions and meshed with
 * surface nets in the browser. No downloaded model, so there's no license to track,
 * and the same SDF can be cut into anatomical layers (enamel, dentin, pulp, root).
 * Units: the tooth is about 3 units tall, crown up (+y).
 */

type V3 = [number, number, number];
export type Sdf = (x: number, y: number, z: number) => number;

/* ---------- SDF primitives (after Inigo Quilez) ---------- */

const smin = (a: number, b: number, k: number) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
};
const smax = (a: number, b: number, k: number) => -smin(-a, -b, k);

function ellipsoid(x: number, y: number, z: number, rx: number, ry: number, rz: number) {
  const k0 = Math.hypot(x / rx, y / ry, z / rz);
  const k1 = Math.hypot(x / (rx * rx), y / (ry * ry), z / (rz * rz));
  return k1 === 0 ? -Math.min(rx, ry, rz) : (k0 * (k0 - 1)) / k1;
}

const sphere = (x: number, y: number, z: number, r: number) => Math.hypot(x, y, z) - r;

function capsule(px: number, py: number, pz: number, a: V3, b: V3, r: number) {
  const pax = px - a[0], pay = py - a[1], paz = pz - a[2];
  const bax = b[0] - a[0], bay = b[1] - a[1], baz = b[2] - a[2];
  const h = Math.min(1, Math.max(0, (pax * bax + pay * bay + paz * baz) / (bax * bax + bay * bay + baz * baz)));
  return Math.hypot(pax - bax * h, pay - bay * h, paz - baz * h) - r;
}

/** Cone with rounded ends between a (radius r1) and b (radius r2). */
function roundCone(px: number, py: number, pz: number, a: V3, b: V3, r1: number, r2: number) {
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

/* ---------- The tooth ---------- */

const ROOTS: [V3, V3, number, number][] = [
  [[-0.36, 0.05, 0.14], [-0.56, -1.42, 0.22], 0.33, 0.085],
  [[0.36, 0.05, 0.14], [0.52, -1.38, 0.26], 0.33, 0.085],
  [[0, 0.02, -0.26], [0.02, -1.28, -0.5], 0.3, 0.08],
];
const CUSPS: V3[] = [
  [-0.36, 0.86, 0.32],
  [0.36, 0.86, 0.32],
  [-0.36, 0.86, -0.3],
  [0.36, 0.86, -0.3],
];

/** Whole molar: crown with four cusps and fissures, a waisted neck, three splayed roots. */
export const tooth: Sdf = (x, y, z) => {
  let d = ellipsoid(x, y - 0.55, z, 0.92, 0.55, 0.82);
  for (const c of CUSPS) d = smin(d, sphere(x - c[0], y - c[1], z - c[2], 0.36), 0.3);
  d = smin(d, ellipsoid(x, y - 0.05, z, 0.74, 0.45, 0.64), 0.3);
  for (const [a, b, r1, r2] of ROOTS) d = smin(d, roundCone(x, y, z, a, b, r1, r2), 0.22);
  // Fissures between the cusps and a central pit.
  const g = Math.min(capsule(x, y, z, [-0.5, 1.17, 0], [0.5, 1.17, 0], 0.065), capsule(x, y, z, [0, 1.17, -0.42], [0, 1.17, 0.42], 0.065));
  d = smax(d, -g, 0.08);
  d = smax(d, -sphere(x, y - 1.13, z, 0.15), 0.08);
  return d;
};

export const TOOTH_BOUNDS: [V3, V3] = [
  [-1.15, -1.7, -1.05],
  [1.15, 1.45, 1.05],
];
/** Vertical center of the tooth, so the mesh can be centered on its group origin. */
export const TOOTH_CENTER_Y = -0.12;

/* ---------- Surface nets mesher ---------- */

export type MeshData = { positions: Float32Array; normals: Float32Array; indices: Uint32Array };

const CORNERS: V3[] = [
  [0, 0, 0], [1, 0, 0], [0, 1, 0], [1, 1, 0],
  [0, 0, 1], [1, 0, 1], [0, 1, 1], [1, 1, 1],
];
const EDGES: [number, number][] = [
  [0, 1], [2, 3], [4, 5], [6, 7],
  [0, 2], [1, 3], [4, 6], [5, 7],
  [0, 4], [1, 5], [2, 6], [3, 7],
];

/**
 * Meshes the zero level set of `sdf` inside [min, max] with cell size `step`.
 * Normals come from the SDF gradient, so shading is smooth even at modest resolution.
 */
export function meshSdf(sdf: Sdf, [min, max]: [V3, V3], step: number, offsetY = 0): MeshData {
  const nx = Math.ceil((max[0] - min[0]) / step) + 1;
  const ny = Math.ceil((max[1] - min[1]) / step) + 1;
  const nz = Math.ceil((max[2] - min[2]) / step) + 1;
  const field = new Float32Array(nx * ny * nz);
  const at = (i: number, j: number, k: number) => i + nx * (j + ny * k);

  for (let k = 0; k < nz; k++)
    for (let j = 0; j < ny; j++)
      for (let i = 0; i < nx; i++) field[at(i, j, k)] = sdf(min[0] + i * step, min[1] + j * step, min[2] + k * step);

  const cx = nx - 1, cy = ny - 1;
  const cellVert = new Int32Array(cx * cy * (nz - 1)).fill(-1);
  const cellAt = (i: number, j: number, k: number) => i + cx * (j + cy * k);
  const pos: number[] = [];
  const v = new Float32Array(8);

  for (let k = 0; k < nz - 1; k++)
    for (let j = 0; j < ny - 1; j++)
      for (let i = 0; i < nx - 1; i++) {
        let mask = 0;
        for (let c = 0; c < 8; c++) {
          const [di, dj, dk] = CORNERS[c];
          v[c] = field[at(i + di, j + dj, k + dk)];
          if (v[c] < 0) mask |= 1 << c;
        }
        if (mask === 0 || mask === 255) continue;
        let sx = 0, sy = 0, sz = 0, n = 0;
        for (const [a, b] of EDGES) {
          if (v[a] < 0 === v[b] < 0) continue;
          const t = v[a] / (v[a] - v[b]);
          const A = CORNERS[a], B = CORNERS[b];
          sx += A[0] + t * (B[0] - A[0]);
          sy += A[1] + t * (B[1] - A[1]);
          sz += A[2] + t * (B[2] - A[2]);
          n++;
        }
        cellVert[cellAt(i, j, k)] = pos.length / 3;
        pos.push(min[0] + (i + sx / n) * step, min[1] + (j + sy / n) * step + offsetY, min[2] + (k + sz / n) * step);
      }

  // Normals from the SDF gradient (central differences).
  const count = pos.length / 3;
  const normals = new Float32Array(count * 3);
  const e = step * 0.5;
  for (let p = 0; p < count; p++) {
    const x = pos[p * 3], y = pos[p * 3 + 1] - offsetY, z = pos[p * 3 + 2];
    const gx = sdf(x + e, y, z) - sdf(x - e, y, z);
    const gy = sdf(x, y + e, z) - sdf(x, y - e, z);
    const gz = sdf(x, y, z + e) - sdf(x, y, z - e);
    const l = Math.hypot(gx, gy, gz) || 1;
    normals[p * 3] = gx / l;
    normals[p * 3 + 1] = gy / l;
    normals[p * 3 + 2] = gz / l;
  }

  // One quad per sign-changing grid edge, joining the four cells around it.
  const idx: number[] = [];
  const quad = (a: number, b: number, c: number, d: number) => {
    if (a < 0 || b < 0 || c < 0 || d < 0) return;
    // Orient so the face normal agrees with the SDF gradient.
    const ax = pos[b * 3] - pos[a * 3], ay = pos[b * 3 + 1] - pos[a * 3 + 1], az = pos[b * 3 + 2] - pos[a * 3 + 2];
    const bx = pos[c * 3] - pos[a * 3], by = pos[c * 3 + 1] - pos[a * 3 + 1], bz = pos[c * 3 + 2] - pos[a * 3 + 2];
    const fx = ay * bz - az * by, fy = az * bx - ax * bz, fz = ax * by - ay * bx;
    const dot = fx * normals[a * 3] + fy * normals[a * 3 + 1] + fz * normals[a * 3 + 2];
    if (dot >= 0) idx.push(a, b, c, a, c, d);
    else idx.push(a, c, b, a, d, c);
  };
  for (let k = 1; k < nz - 1; k++)
    for (let j = 1; j < ny - 1; j++)
      for (let i = 1; i < nx - 1; i++) {
        const inside = field[at(i, j, k)] < 0;
        if (inside !== field[at(i + 1, j, k)] < 0)
          quad(cellVert[cellAt(i, j - 1, k - 1)], cellVert[cellAt(i, j, k - 1)], cellVert[cellAt(i, j, k)], cellVert[cellAt(i, j - 1, k)]);
        if (inside !== field[at(i, j + 1, k)] < 0)
          quad(cellVert[cellAt(i - 1, j, k - 1)], cellVert[cellAt(i, j, k - 1)], cellVert[cellAt(i, j, k)], cellVert[cellAt(i - 1, j, k)]);
        if (inside !== field[at(i, j, k + 1)] < 0)
          quad(cellVert[cellAt(i - 1, j - 1, k)], cellVert[cellAt(i, j - 1, k)], cellVert[cellAt(i, j, k)], cellVert[cellAt(i - 1, j, k)]);
      }

  return { positions: new Float32Array(pos), normals, indices: new Uint32Array(idx) };
}
