"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import {
  Box3,
  Color,
  Euler,
  Group,
  MathUtils,
  Matrix4,
  Mesh,
  MeshPhysicalMaterial,
  NeutralToneMapping,
  NormalBlending,
  Vector3,
  type Material,
  type MeshStandardMaterial,
  type Object3D,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { toothModel } from "@/content";

/**
 * Fixed, full-viewport canvas behind the page content (z-index -1). The tooth follows DOM anchors:
 * #tooth-anchor in the hero, then glides and shrinks to #tooth-anchor-services as the page scrolls.
 * Layout stays in CSS; rendering pauses when neither anchor is near the screen.
 */

/** Normalized size of the model after loading (its tallest side), in scene units. */
const TOOTH_HEIGHT = 3;
const INITIAL_ROT = { x: 0.12, y: -0.5 };
/** Vertical tilt is limited so the (untidy) underside of the roots never faces the viewer. */
const MAX_TILT = MathUtils.degToRad(20);

type Opts = { mobile: boolean; snapshot: boolean; still: boolean; onReady: () => void };

/* ---------- Model ---------- */

/**
 * Loads the tooth and bakes every mesh into one model space: crown up, centered on the origin and
 * scaled to TOOTH_HEIGHT. Proportions are kept (uniform scale only).
 */
async function loadTooth() {
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(toothModel.src);
  const root = gltf.scene;
  root.updateMatrixWorld(true);
  const fix = new Matrix4().makeRotationFromEuler(new Euler(...toothModel.uprightRotation));
  const out = new Group();
  root.traverse((o) => {
    if (!(o instanceof Mesh)) return;
    const g = o.geometry.clone();
    g.applyMatrix4(new Matrix4().multiplyMatrices(fix, o.matrixWorld));
    out.add(new Mesh(g, o.material));
  });
  const box = new Box3().setFromObject(out);
  const size = box.getSize(new Vector3());
  const center = box.getCenter(new Vector3());
  const k = TOOTH_HEIGHT / Math.max(size.x, size.y, size.z);
  out.children.forEach((m) => {
    (m as Mesh).geometry.translate(-center.x, -center.y, -center.z);
    (m as Mesh).geometry.scale(k, k, k);
    (m as Mesh).geometry.computeBoundingSphere();
  });
  return { model: out, halfHeight: (size.y * k) / 2 };
}

type Uniforms = { uGlow: { value: number } };

/**
 * Keeps the model's own color and textures, and adds enamel-like gloss: clearcoat and soft highlights,
 * slightly warmer (ivory) roots, a thin teal rim so the light tooth reads on a light page, and an
 * optional inner glow + translucency (uGlow) used when the tooth arrives in Services.
 */
function enamelize(src: Material, halfHeight: number, uniforms: Uniforms) {
  const s = src as MeshStandardMaterial;
  const m = new MeshPhysicalMaterial({
    color: s.color?.clone() ?? new Color("#ffffff"),
    map: s.map ?? null,
    normalMap: s.normalMap ?? null,
    normalScale: s.normalScale?.clone(),
    aoMap: s.aoMap ?? null,
    aoMapIntensity: s.aoMapIntensity ?? 1,
    roughnessMap: s.roughnessMap ?? null,
    roughness: s.roughnessMap ? 0.6 : Math.min(s.roughness ?? 0.5, 0.35),
    metalness: 0,
    vertexColors: s.vertexColors ?? false,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    sheen: 0.2,
    sheenColor: new Color("#ffffff"),
    transparent: true,
    side: s.side,
  });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uRim = { value: new Color("#14a8a0") };
    sh.uniforms.uGlow = uniforms.uGlow;
    sh.uniforms.uHalf = { value: halfHeight };
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nvarying float vModelY;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvModelY = position.y;");
    sh.fragmentShader = sh.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nuniform vec3 uRim;\nuniform float uGlow;\nuniform float uHalf;\nvarying float vModelY;",
      )
      // Roots (lower ~55% of the height) shift a little toward ivory.
      .replace(
        "#include <color_fragment>",
        "#include <color_fragment>\nfloat rootK = smoothstep(0.05, -0.35, vModelY / uHalf);\ndiffuseColor.rgb *= mix(vec3(1.0), vec3(1.0, 0.95, 0.86), rootK);",
      )
      .replace(
        "#include <opaque_fragment>",
        [
          "float facing = saturate(dot(normal, normalize(vViewPosition)));",
          "float rimF = pow(1.0 - facing, 3.0);",
          "outgoingLight += uRim * rimF * 0.4;",
          // Inner light, brightest where the surface faces the viewer, as if seen through the enamel.
          "outgoingLight += vec3(0.35, 0.85, 0.8) * pow(facing, 2.0) * uGlow * 0.45;",
          "diffuseColor.a *= 1.0 - 0.32 * uGlow * (1.0 - rimF);",
          "#include <opaque_fragment>",
        ].join("\n"),
      );
  };
  return m;
}

/* ---------- Inputs ---------- */

/** Pointer (and phone tilt) as -1..1, shared by the tooth and the particles. */
function usePointer(mobile: boolean) {
  const p = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      p.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      p.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      p.current.x = MathUtils.clamp(e.gamma / 30, -1, 1);
      p.current.y = MathUtils.clamp((45 - e.beta) / 30, -1, 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    if (mobile) {
      window.addEventListener("deviceorientation", onTilt);
      // iOS asks for permission, and only from a user gesture.
      const D = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
      if (D.requestPermission) window.addEventListener("touchend", () => D.requestPermission?.().catch(() => {}), { once: true });
    }
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("deviceorientation", onTilt);
    };
  }, [mobile]);
  return p;
}

type Rect = { top: number; left: number; width: number; height: number; ok: boolean };

/** Document-space rects of the anchors, kept fresh on resize; read every frame without layout reads. */
function useAnchors(ids: string[]) {
  const rects = useRef<Rect[]>(ids.map(() => ({ top: 0, left: 0, width: 0, height: 0, ok: false })));
  useEffect(() => {
    const measure = () => {
      rects.current = ids.map((id) => {
        const el = document.getElementById(id);
        const r = el?.getBoundingClientRect();
        // Hidden anchors (display: none) measure 0×0 and are skipped.
        return r && r.height > 0
          ? { top: r.top + window.scrollY, left: r.left + window.scrollX, width: r.width, height: r.height, ok: true }
          : { top: 0, left: 0, width: 0, height: 0, ok: false };
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) ro.observe(el);
    });
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("load", measure);
    };
  }, [ids]);
  return rects;
}

/* ---------- Scene pieces ---------- */

function Particles({ count, pointer }: { count: number; pointer: React.RefObject<{ x: number; y: number }> }) {
  const geo = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // A loose shell around the tooth, flattened toward the camera plane.
      const a = Math.random() * Math.PI * 2;
      const r = 1.35 + Math.pow(Math.random(), 1.8) * 1.15;
      pos[i * 3] = Math.cos(a) * r * 1.15;
      pos[i * 3 + 1] = Math.sin(a) * r * 0.95;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 1.6;
      seed[i] = Math.random();
    }
    return { pos, seed };
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: [99, 99] },
      uPixelRatio: { value: 1 },
      uColor: { value: new Color("#5cc9c1") },
      uFade: { value: 1 },
    }),
    [],
  );
  const { viewport, gl } = useThree();

  useFrame((state, dt) => {
    uniforms.uTime.value += dt;
    uniforms.uPixelRatio.value = gl.getPixelRatio();
    // Pointer on the z=0 plane, in the particle group's local space (the parent follows the tooth).
    const parent = state.scene.getObjectByName("tooth-rig");
    if (!parent) return;
    const wx = (pointer.current.x * viewport.width) / 2;
    const wy = (pointer.current.y * viewport.height) / 2;
    const s = parent.scale.x || 1;
    uniforms.uMouse.value = [(wx - parent.position.x) / s, (wy - parent.position.y) / s];
    uniforms.uFade.value = (parent.userData.particles as number) ?? 1;
  });

  return (
    <points frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[geo.pos, 3]} />
        <bufferAttribute attach="attributes-aSeed" args={[geo.seed, 1]} />
      </bufferGeometry>
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={NormalBlending}
        uniforms={uniforms}
        vertexShader={`
          attribute float aSeed;
          uniform float uTime;
          uniform vec2 uMouse;
          uniform float uPixelRatio;
          uniform float uFade;
          varying float vAlpha;
          void main() {
            vec3 p = position;
            p.x += sin(uTime * 0.35 + aSeed * 6.283) * 0.14;
            p.y += cos(uTime * 0.28 + aSeed * 11.0) * 0.14;
            vec2 d = p.xy - uMouse;
            float l = length(d);
            p.xy += (d / max(l, 0.001)) * smoothstep(1.5, 0.0, l) * 0.7;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = (34.0 + aSeed * 60.0) * uPixelRatio / -mv.z;
            vAlpha = (0.12 + aSeed * 0.33) * uFade;
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          varying float vAlpha;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float a = smoothstep(0.5, 0.0, d);
            a *= a;
            gl_FragColor = vec4(uColor, a * vAlpha);
          }
        `}
      />
    </points>
  );
}

/** Soft contact shadow under the tooth; fades and widens as the tooth floats up. */
function Shadow({ lift, y }: { lift: React.RefObject<number>; y: number }) {
  const ref = useRef<Mesh>(null);
  const uniforms = useMemo(() => ({ uOpacity: { value: 0.22 } }), []);
  useFrame(() => {
    const k = lift.current ?? 0;
    uniforms.uOpacity.value = 0.22 - k * 0.6;
    ref.current?.scale.set(2.3 + k * 2, 0.55 + k * 0.4, 1);
  });
  return (
    <mesh ref={ref} position={[0, y - 0.3, -0.4]} renderOrder={-1}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={`varying vec2 vUv;
          void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`}
        fragmentShader={`uniform float uOpacity;
          varying vec2 vUv;
          void main() {
            float d = length(vUv - 0.5) * 2.0;
            float a = smoothstep(1.0, 0.0, d);
            gl_FragColor = vec4(0.06, 0.16, 0.24, a * a * uOpacity);
          }`}
      />
    </mesh>
  );
}

const ANCHORS = ["tooth-anchor", "tooth-anchor-services"];
const ease = (t: number) => t * t * (3 - 2 * t);

function Tooth({ model, halfHeight, mobile, snapshot, still, onReady }: Opts & { model: Group; halfHeight: number }) {
  const rig = useRef<Group>(null);
  const spin = useRef<Group>(null);
  const lift = useRef(0);
  const uniforms = useMemo<Uniforms>(() => ({ uGlow: { value: 0 } }), []);
  const pointer = usePointer(mobile);
  const anchors = useAnchors(ANCHORS);
  const { viewport, size, camera } = useThree();
  const ready = useRef(false);
  const t0 = useRef<number | null>(null);
  // Snapshot mode can be posed from the URL (?tooth-snapshot&ry=0.5) to inspect the model from any side.
  const pose = useMemo(() => {
    const q = new URLSearchParams(location.search);
    return { x: Number(q.get("rx") ?? INITIAL_ROT.x), y: Number(q.get("ry") ?? INITIAL_ROT.y) };
  }, []);

  useEffect(() => {
    model.children.forEach((c) => {
      const mesh = c as Mesh;
      const src = mesh.material;
      mesh.material = Array.isArray(src)
        ? src.map((m) => enamelize(m, halfHeight, uniforms))
        : enamelize(src, halfHeight, uniforms);
    });
  }, [model, halfHeight, uniforms]);

  useFrame((state, dt) => {
    const g = rig.current,
      s = spin.current;
    if (!g || !s) return;
    const vp = viewport.getCurrentViewport(camera, [0, 0, 0]);
    const k = vp.height / size.height;
    const [hero, svc] = anchors.current;

    // Where the tooth sits on screen: the hero anchor, gliding to the Services anchor while scrolling.
    const vh = window.innerHeight;
    const toScreen = (a: Rect) => ({
      x: a.left - window.scrollX + a.width / 2,
      y: a.top - window.scrollY + a.height / 2,
      h: a.height,
    });
    let cur = toScreen(hero);
    let p = 0;
    if (svc.ok && !snapshot) {
      const start = hero.top + hero.height * 0.35 - vh * 0.5;
      const end = svc.top + svc.height / 2 - vh * 0.42;
      p = ease(MathUtils.clamp((window.scrollY - start) / Math.max(end - start, 1), 0, 1));
      const b = toScreen(svc);
      cur = { x: MathUtils.lerp(cur.x, b.x, p), y: MathUtils.lerp(cur.y, b.y, p), h: MathUtils.lerp(cur.h, b.h, p) };
    }
    g.position.x = (cur.x - size.width / 2) * k;
    g.position.y = -(cur.y - size.height / 2) * k;
    g.scale.setScalar((cur.h * k * 0.78) / TOOTH_HEIGHT);
    g.userData.particles = 1 - p;
    uniforms.uGlow.value = MathUtils.smoothstep(p, 0.55, 1);

    if (t0.current === null) t0.current = state.clock.elapsedTime;
    const t = snapshot || still ? 0 : state.clock.elapsedTime - t0.current;
    if (snapshot || still) {
      // Snapshot and reduced motion: a fixed pose, no turning.
      s.rotation.set(pose.x, pose.y, 0);
    } else {
      // Gentle float and a slow turntable; the pointer / phone tilt leans it, vertical tilt capped at ±20°.
      s.position.y = Math.sin(t * 1.1) * 0.08;
      const targetY = INITIAL_ROT.y + t * 0.3 + pointer.current.x * 0.55 + p * 0.6;
      const targetX = MathUtils.clamp(INITIAL_ROT.x - pointer.current.y * 0.3, -MAX_TILT, MAX_TILT);
      s.rotation.y = MathUtils.damp(s.rotation.y, targetY, 4, dt);
      s.rotation.x = MathUtils.damp(s.rotation.x, targetX, 4, dt);
      s.rotation.z = Math.sin(t * 0.7) * 0.04;
    }
    lift.current = ((s.position.y + 0.08) / 0.16) * 0.12;

    if (!ready.current) {
      ready.current = true;
      requestAnimationFrame(onReady);
    }
  });

  return (
    <group ref={rig} name="tooth-rig">
      <group ref={spin} rotation={[INITIAL_ROT.x, INITIAL_ROT.y, 0]}>
        <primitive object={model} />
      </group>
      <Shadow lift={lift} y={-halfHeight} />
      {!snapshot && !still && <Particles count={mobile ? 60 : 140} pointer={pointer} />}
    </group>
  );
}

export default function ToothScene({ mobile, snapshot, still, onReady }: Opts) {
  const [loaded, setLoaded] = useState<{ model: Group; halfHeight: number } | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let alive = true;
    loadTooth()
      .then((m) => alive && setLoaded(m))
      .catch((e) => console.warn("3D tooth unavailable:", e));
    return () => {
      alive = false;
    };
  }, []);

  // Render only while the hero or Services anchor is near the screen (covers the glide between them).
  useEffect(() => {
    const seen = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
        setVisible(seen.size > 0);
      },
      { rootMargin: "50% 0px" },
    );
    ANCHORS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <Canvas
      style={{ pointerEvents: "none" }}
      frameloop={visible ? "always" : "never"}
      dpr={mobile ? [1, 1.5] : [1, 2]}
      camera={{ fov: 30, position: [0, 0, 9], near: 0.1, far: 50 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", preserveDrawingBuffer: snapshot }}
      onCreated={({ gl }) => {
        // Neutral tone mapping keeps whites white instead of the greyish ACES default.
        gl.toneMapping = NeutralToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 4, 8]} intensity={1.7} />
      {/* Soft studio environment; phones get a smaller, simpler one. */}
      <Environment resolution={mobile ? 64 : 256} frames={1}>
        <Lightformer form="rect" intensity={2.2} position={[0, 4, 3]} scale={[8, 2, 1]} />
        <Lightformer form="ring" intensity={2} position={[0, 0, 6]} scale={3.5} />
        {!mobile && (
          <>
            <Lightformer
              form="rect"
              intensity={1.2}
              color="#eef8f7"
              position={[-5, 0, 1]}
              rotation-y={Math.PI / 2}
              scale={[6, 4, 1]}
            />
            <Lightformer
              form="rect"
              intensity={1.1}
              color="#e8f4f9"
              position={[5, 1, 0]}
              rotation-y={-Math.PI / 2}
              scale={[6, 4, 1]}
            />
            <Lightformer form="rect" intensity={1.4} position={[0, -4, 2]} rotation-x={-Math.PI / 2} scale={[6, 3, 1]} />
          </>
        )}
      </Environment>
      {loaded && (
        <Tooth
          model={loaded.model}
          halfHeight={loaded.halfHeight}
          mobile={mobile}
          snapshot={snapshot}
          still={still}
          onReady={onReady}
        />
      )}
    </Canvas>
  );
}
