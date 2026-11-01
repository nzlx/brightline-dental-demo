"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { Color, MathUtils, Mesh, MeshPhysicalMaterial, NeutralToneMapping, NormalBlending, type Group, type Object3D } from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

/**
 * Fixed, full-viewport canvas behind the page content (z-index -1). The tooth follows the
 * position and size of a DOM anchor (#tooth-anchor), so layout stays in CSS while the
 * 3D sits exactly where the placeholder image was. Rendering pauses when the anchor is off screen.
 */

const TOOTH_HEIGHT = 3.06; // model units, see scripts/build-tooth.mjs
const INITIAL_ROT = { x: 0.14, y: -0.42 };

/** Loads public/models/tooth.glb (meshopt-compressed) and returns its root object. */
async function loadTooth() {
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync("/models/tooth.glb");
  return gltf.scene;
}

type Opts = { mobile: boolean; snapshot: boolean; onReady: () => void };

/** Pointer (and phone tilt) as -1..1, shared by the tooth and the particles. */
function usePointer(mobile: boolean) {
  const p = useRef({ x: 0, y: 0, active: false });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      p.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      p.current.y = -((e.clientY / window.innerHeight) * 2 - 1);
      p.current.active = true;
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
      const ask = () => {
        D.requestPermission?.().catch(() => {});
        window.removeEventListener("touchend", ask);
      };
      if (D.requestPermission) window.addEventListener("touchend", ask, { once: true });
    }
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("deviceorientation", onTilt);
    };
  }, [mobile]);
  return p;
}

/** Document-space rect of the anchor, kept fresh on resize; read every frame without layout reads. */
function useAnchor(id: string) {
  const rect = useRef({ top: 0, left: 0, width: 0, height: 0 });
  useEffect(() => {
    const el = document.getElementById(id);
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      rect.current = { top: r.top + window.scrollY, left: r.left + window.scrollX, width: r.width, height: r.height };
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    ro.observe(document.body);
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("load", measure);
    };
  }, [id]);
  return rect;
}

/**
 * One material for the whole tooth: pearly, clear-coated enamel on the crown that blends
 * (via the baked _rootness attribute) into warmer, satin ivory roots. Vertex colors carry the hue;
 * a soft teal fresnel rim keeps the white silhouette readable on a white page.
 */
function makeToothMaterial() {
  const m = new MeshPhysicalMaterial({
    vertexColors: true,
    roughness: 0.14,
    metalness: 0,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    sheen: 0.25,
    sheenColor: new Color("#ffffff"),
    sheenRoughness: 0.45,
  });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uRim = { value: new Color("#14a8a0") };
    sh.uniforms.uRimStrength = { value: 0.45 };
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nattribute float _rootness;\nvarying float vRoot;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvRoot = _rootness;");
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform vec3 uRim;\nuniform float uRimStrength;\nvarying float vRoot;")
      .replace("#include <roughnessmap_fragment>", "#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.42, vRoot);")
      .replace(
        "#include <lights_physical_fragment>",
        "#include <lights_physical_fragment>\nmaterial.clearcoat *= 1.0 - 0.8 * vRoot;\nmaterial.sheenColor *= 1.0 - vRoot;",
      )
      .replace(
        "#include <opaque_fragment>",
        "float rimF = pow(1.0 - saturate(dot(normal, normalize(vViewPosition))), 3.0);\noutgoingLight += uRim * rimF * uRimStrength;\n#include <opaque_fragment>",
      );
  };
  return m;
}

/** Soft contact shadow under the tooth; fades and widens as the tooth floats up. */
function Shadow({ lift }: { lift: React.RefObject<number> }) {
  const ref = useRef<Mesh>(null);
  const uniforms = useMemo(() => ({ uOpacity: { value: 0.22 } }), []);
  useFrame(() => {
    const k = lift.current ?? 0;
    uniforms.uOpacity.value = 0.22 - k * 0.6;
    ref.current?.scale.set(2.3 + k * 2, 0.55 + k * 0.4, 1);
  });
  return (
    <mesh ref={ref} position={[0, -TOOTH_HEIGHT / 2 - 0.28, -0.4]} renderOrder={-1}>
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
    }),
    [],
  );
  const { viewport, gl } = useThree();

  useFrame((state, dt) => {
    uniforms.uTime.value += dt;
    uniforms.uPixelRatio.value = gl.getPixelRatio();
    // Pointer on the z=0 plane, in the particle group's local space (parent of this group follows the tooth).
    const parent = state.scene.getObjectByName("tooth-rig");
    if (!parent) return;
    const wx = (pointer.current.x * viewport.width) / 2;
    const wy = (pointer.current.y * viewport.height) / 2;
    const s = parent.scale.x || 1;
    uniforms.uMouse.value = [(wx - parent.position.x) / s, (wy - parent.position.y) / s];
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
            vAlpha = 0.12 + aSeed * 0.33;
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

function Tooth({ model, mobile, snapshot, onReady }: Opts & { model: Object3D }) {
  const rig = useRef<Group>(null);
  const spin = useRef<Group>(null);
  const material = useMemo(makeToothMaterial, []);
  const lift = useRef(0);
  // Snapshot mode can be posed from the URL (?tooth-snapshot&ry=0.5) to inspect the model from any side.
  const pose = useMemo(() => {
    const q = new URLSearchParams(location.search);
    return { x: Number(q.get("rx") ?? INITIAL_ROT.x), y: Number(q.get("ry") ?? INITIAL_ROT.y) };
  }, []);
  useEffect(() => {
    model.traverse((o) => {
      if (o instanceof Mesh) o.material = material;
    });
  }, [model, material]);
  const pointer = usePointer(mobile);
  const anchor = useAnchor("tooth-anchor");
  const { viewport, size, camera } = useThree();
  const ready = useRef(false);
  const t0 = useRef<number | null>(null);

  useFrame((state, dt) => {
    const g = rig.current, s = spin.current;
    if (!g || !s) return;
    const vp = viewport.getCurrentViewport(camera, [0, 0, 0]);
    const a = anchor.current;
    // Anchor center in viewport pixels → world units on the z=0 plane.
    const cx = a.left - window.scrollX + a.width / 2;
    const cy = a.top - window.scrollY + a.height / 2;
    const k = vp.height / size.height;
    g.position.x = (cx - size.width / 2) * k;
    g.position.y = -(cy - size.height / 2) * k;
    g.scale.setScalar((a.height * k * 0.74) / TOOTH_HEIGHT);

    if (t0.current === null) t0.current = state.clock.elapsedTime;
    const t = snapshot ? 0 : state.clock.elapsedTime - t0.current;
    // Gentle float, slow turntable, and a lean toward the pointer / phone tilt.
    s.position.y = Math.sin(t * 1.1) * 0.08;
    lift.current = (s.position.y + 0.08) / 0.16 * 0.12;
    const targetY = INITIAL_ROT.y + t * 0.32 + pointer.current.x * 0.55;
    const targetX = INITIAL_ROT.x - pointer.current.y * 0.3;
    s.rotation.y = snapshot ? pose.y : MathUtils.damp(s.rotation.y, targetY, 4, dt);
    s.rotation.x = snapshot ? pose.x : MathUtils.damp(s.rotation.x, targetX, 4, dt);
    s.rotation.z = Math.sin(t * 0.7) * 0.04;

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
      <Shadow lift={lift} />
      {!snapshot && <Particles count={mobile ? 70 : 140} pointer={pointer} />}
    </group>
  );
}

export default function ToothScene({ mobile, snapshot, onReady }: Opts) {
  const [model, setModel] = useState<Object3D | null>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let alive = true;
    loadTooth().then((m) => alive && setModel(m));
    return () => {
      alive = false;
    };
  }, []);

  // Pause rendering while the anchor is off screen.
  useEffect(() => {
    const el = document.getElementById("tooth-anchor");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
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
        // Neutral tone mapping keeps the enamel white instead of the greyish ACES default.
        gl.toneMapping = NeutralToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[2, 4, 8]} intensity={1.9} />
      <directionalLight position={[-5, -2, 2]} intensity={0.45} color="#e8f2f6" />
      <Environment resolution={mobile ? 128 : 256} frames={1}>
        <Lightformer form="rect" intensity={2.4} position={[0, 4, 3]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={1.3} color="#eef8f7" position={[-5, 0, 1]} rotation-y={Math.PI / 2} scale={[6, 4, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#e8f4f9" position={[5, 1, 0]} rotation-y={-Math.PI / 2} scale={[6, 4, 1]} />
        <Lightformer form="ring" intensity={2.2} position={[0, 0, 6]} scale={3.5} />
        <Lightformer form="rect" intensity={1.6} position={[0, -4, 2]} rotation-x={-Math.PI / 2} scale={[6, 3, 1]} />
      </Environment>
      {model && <Tooth model={model} mobile={mobile} snapshot={snapshot} onReady={onReady} />}
    </Canvas>
  );
}

