import { BufferAttribute, BufferGeometry } from "three";

/** Decodes public/models/tooth.bin (see scripts/build-tooth.ts) into geometries by name. */
export async function loadToothMeshes(url = "/models/tooth.bin") {
  const buf = await (await fetch(url)).arrayBuffer();
  const view = new DataView(buf);
  const magic = new TextDecoder().decode(new Uint8Array(buf, 0, 6));
  if (magic !== "TOOTH1") throw new Error("Unexpected tooth.bin format");
  const count = view.getUint16(6, true);
  let o = 8;
  const out = new Map<string, BufferGeometry>();

  for (let m = 0; m < count; m++) {
    const nameLen = view.getUint8(o);
    const name = new TextDecoder().decode(new Uint8Array(buf, o + 1, nameLen));
    o += 1 + nameLen;
    const verts = view.getUint32(o, true);
    const indexCount = view.getUint32(o + 4, true);
    o += 8;
    const min = [0, 1, 2].map((i) => view.getFloat32(o + i * 4, true));
    const max = [0, 1, 2].map((i) => view.getFloat32(o + 12 + i * 4, true));
    o += 24;

    const positions = new Float32Array(verts * 3);
    for (let i = 0; i < verts * 3; i++) {
      const a = i % 3;
      positions[i] = min[a] + ((view.getInt16(o + i * 2, true) + 32767) / 65534) * (max[a] - min[a]);
    }
    o += verts * 6;
    const normals = new Float32Array(verts * 3);
    for (let i = 0; i < verts * 3; i++) normals[i] = view.getInt8(o + i) / 127;
    o += verts * 3;
    o += o % 2;
    const indices = new Uint16Array(buf.slice(o, o + indexCount * 2));
    o += indexCount * 2;
    o += (4 - (o % 4)) % 4;

    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(positions, 3));
    g.setAttribute("normal", new BufferAttribute(normals, 3));
    g.setIndex(new BufferAttribute(indices, 1));
    g.computeBoundingSphere();
    out.set(name, g);
  }
  return out;
}
