/**
 * Optimizes the downloaded Sketchfab tooth (CC BY) for the web without changing its shape or texture:
 * dedupe + prune, textures → WebP (max 2048 px), meshopt geometry compression.
 * Simplifies only if the mesh is very heavy, with a tight error bound so the silhouette stays the same.
 *
 * Run: node scripts/optimize-tooth.mjs [input=.raw/tooth.glb] [output=public/models/tooth.glb]
 */
import { mkdirSync, statSync } from "node:fs";
import { dirname } from "node:path";
import sharp from "sharp";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, meshopt, prune, simplify, textureCompress, weld } from "@gltf-transform/functions";
import { MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier } from "meshoptimizer";

const input = process.argv[2] ?? ".raw/tooth.glb";
const output = process.argv[3] ?? "public/models/tooth.glb";
const MAX_TRIANGLES = 150_000;

await MeshoptDecoder.ready;
await MeshoptEncoder.ready;
await MeshoptSimplifier.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.decoder": MeshoptDecoder, "meshopt.encoder": MeshoptEncoder });
const doc = await io.read(input);

// Sketchfab stores the author, license and source link in asset.extras: print them for CREDITS.md.
const asset = doc.getRoot().getAsset();
console.log("asset:", JSON.stringify({ generator: asset.generator, copyright: asset.copyright, extras: asset.extras }, null, 2));

const triangles = () =>
  doc
    .getRoot()
    .listMeshes()
    .flatMap((m) => m.listPrimitives())
    .reduce((n, p) => n + (p.getIndices()?.getCount() ?? p.getAttribute("POSITION").getCount()) / 3, 0);
console.log(`input: ${(statSync(input).size / 1024 / 1024).toFixed(2)} MB, ${Math.round(triangles())} triangles`);

const steps = [dedup(), prune()];
if (triangles() > MAX_TRIANGLES) {
  steps.push(weld(), simplify({ simplifier: MeshoptSimplifier, ratio: MAX_TRIANGLES / triangles(), error: 0.0005 }));
}
steps.push(
  textureCompress({ encoder: sharp, targetFormat: "webp", resize: [2048, 2048], quality: 88 }),
  meshopt({ encoder: MeshoptEncoder, level: "high" }),
);
await doc.transform(...steps);

mkdirSync(dirname(output), { recursive: true });
await io.write(output, doc);
console.log(`output: ${output} ${(statSync(output).size / 1024 / 1024).toFixed(2)} MB, ${Math.round(triangles())} triangles`);
