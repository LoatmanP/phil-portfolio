import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SCENES, buildTargets, rebuildPhoto, makeDust, samplePhoto, rng } from './scenes';
import './journey.css';

const S = SCENES.length;
const HOLD = 0.8; // extra scroll after the last scene so the generated text can finish
const UNITS = S - 1 + HOLD;
const VH_PER_UNIT = 65;

// The ending: the "model" writes the intro, word by word.
const FINAL = [
  { cls: 'gen-name', text: 'Phil Loatman' },
  { cls: 'gen-role', text: 'AI leader and cognitive scientist.' },
  { cls: 'gen-body', text: 'I design the platforms, evaluation frameworks, and agentic systems that turn frontier models into dependable enterprise capabilities.' },
];
const FINAL_WORDS = FINAL.flatMap((l, li) => l.text.split(' ').map((w) => ({ w, li })));

const clamp01 = (x) => Math.min(1, Math.max(0, x));

const VERT = /* glsl */ `
  attribute vec3 color;
  attribute float aGlow;
  attribute float aSize;
  attribute float aRand;
  uniform float uTime;
  uniform float uSize;
  varying vec3 vColor;
  void main() {
    vec3 p = position;
    p += 0.012 * vec3(sin(uTime * 0.8 + aRand * 40.0), cos(uTime * 0.7 + aRand * 25.0), sin(uTime * 0.6 + aRand * 13.0));
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float pulse = 1.0 + aGlow * 0.55 * sin(uTime * 2.6 + aRand * 6.2832);
    gl_PointSize = min(uSize * aSize * (1.0 + aGlow * 0.4) * (6.0 / -mv.z), 42.0);
    vColor = color * pulse;
  }
`;

const FRAG = /* glsl */ `
  varying vec3 vColor;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor * a, a);
  }
`;

function webglAvailable() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

export default function Journey({ onSkip }) {
  const sectionRef = useRef(null);
  const canvasRef = useRef(null);
  const introRef = useRef(null);
  const capRefs = useRef([]);
  const finalRef = useRef(null);
  const wordRefs = useRef([]);
  const skipRef = useRef(null);
  const progRef = useRef(null);
  const [enabled] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    return webglAvailable();
  });

  useEffect(() => {
    if (!enabled) return;
    const section = sectionRef.current, canvas = canvasRef.current;
    const small = window.innerWidth < 700;
    const N = small ? 9000 : 20000;
    const r = rng(42);
    const dust = makeDust(N, r);
    const targets = buildTargets(N, dust, null);

    // Dev aid: ?scene=4.5 freezes the journey at that point (for screenshots).
    const forced = import.meta.env.DEV ? parseFloat(new URLSearchParams(location.search).get('scene')) : NaN;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 0, 6);
    const group = new THREE.Group();
    scene.add(group);

    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), glow = new Float32Array(N), size = new Float32Array(N);
    const rand = new Float32Array(N), rand2 = new Float32Array(N);
    for (let k = 0; k < N; k++) { rand[k] = r(); rand2[k] = r(); }
    const posAttr = new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage);
    const colAttr = new THREE.BufferAttribute(col, 3).setUsage(THREE.DynamicDrawUsage);
    const glowAttr = new THREE.BufferAttribute(glow, 1).setUsage(THREE.DynamicDrawUsage);
    const sizeAttr = new THREE.BufferAttribute(size, 1).setUsage(THREE.DynamicDrawUsage);
    geo.setAttribute('position', posAttr);
    geo.setAttribute('color', colAttr);
    geo.setAttribute('aGlow', glowAttr);
    geo.setAttribute('aSize', sizeAttr);
    geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 50);

    const uniforms = { uTime: { value: 0 }, uSize: { value: 3 } };
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, uniforms,
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    const points = new THREE.Points(geo, mat);
    group.add(points);

    // Blend scene i into scene i+1. Particles leave at staggered times and bow out in depth,
    // so the morph reads as a swarm rather than a cross-fade.
    let lastS = -1;
    const apply = (s) => {
      let i = Math.floor(s), f = s - i;
      if (i >= S - 1) { i = S - 2; f = 1; }
      const A = targets[i], B = targets[i + 1];
      const ff = clamp01((f - 0.1) / 0.8);
      for (let k = 0; k < N; k++) {
        let t = clamp01(ff * 1.3 - rand[k] * 0.3);
        t = t * t * (3 - 2 * t);
        const k3 = k * 3;
        for (let j = 0; j < 3; j++) {
          pos[k3 + j] = A.pos[k3 + j] + (B.pos[k3 + j] - A.pos[k3 + j]) * t;
          col[k3 + j] = A.col[k3 + j] + (B.col[k3 + j] - A.col[k3 + j]) * t;
        }
        pos[k3 + 2] += Math.sin(Math.PI * t) * (rand2[k] - 0.5) * 1.6;
        glow[k] = A.glow[k] + (B.glow[k] - A.glow[k]) * t;
        size[k] = A.size[k] + (B.size[k] - A.size[k]) * t;
      }
      posAttr.needsUpdate = colAttr.needsUpdate = glowAttr.needsUpdate = sizeAttr.needsUpdate = true;
    };

    const img = new Image();
    img.onload = () => {
      try {
        rebuildPhoto(targets, N, dust, samplePhoto(img, Math.floor(N * 0.96)));
        lastS = -1;
      } catch { /* keep the placeholder orb */ }
    };
    img.src = '/profile.png';

    // Layout: on wide screens the diagram sits right of the captions; on phones it sits above them.
    let wide = true;
    const resize = () => {
      section.style.setProperty('--header-h', `${document.querySelector('.site-header')?.offsetHeight || 0}px`);
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const halfH = Math.tan((25 * Math.PI) / 180) * 6, halfW = halfH * camera.aspect;
      wide = camera.aspect > 1.15;
      if (wide) {
        const off = Math.max(0, Math.min(1.3, halfW - 2.9));
        group.position.set(off, 0, 0);
        group.scale.setScalar(Math.min(1, (halfW - off) / 2.9));
      } else {
        group.position.set(0, 0.45, 0);
        group.scale.setScalar(Math.min(1, halfW / 2.75));
      }
      uniforms.uSize.value = 2.6 * renderer.getPixelRatio() * (h / 900) * (small ? 1.25 : 1);
    };
    resize();
    window.addEventListener('resize', resize);

    const mouse = { x: 0, y: 0 };
    const onMove = (e) => { mouse.x = e.clientX / window.innerWidth - 0.5; mouse.y = e.clientY / window.innerHeight - 0.5; };
    window.addEventListener('pointermove', onMove, { passive: true });

    const progress = () => {
      if (!isNaN(forced)) return forced / UNITS;
      const rect = section.getBoundingClientRect();
      const total = section.offsetHeight - window.innerHeight;
      return clamp01(-rect.top / total);
    };

    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; });
    io.observe(section);

    let raf = 0, prev = performance.now(), spin = 0, lastWords = -1;
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const dt = Math.min(0.05, (now - prev) / 1000);
      prev = now;
      uniforms.uTime.value += dt;

      const v = progress() * UNITS;
      const s = Math.min(v, S - 1);
      if (Math.abs(s - lastS) > 1e-4) { apply(s); lastS = s; }

      // Gentle parallax toward the cursor; the 3D scenes at the end (LLM cloud, agents) also turn slowly.
      const llmW = clamp01(s - (S - 3));
      spin += dt * 0.06;
      group.rotation.y += (mouse.x * 0.25 + llmW * spin - group.rotation.y) * 0.06;
      group.rotation.x += (mouse.y * 0.12 - group.rotation.x) * 0.06;
      renderer.render(scene, camera);

      // Captions.
      if (introRef.current) {
        const o = clamp01(1 - s * 3.2);
        introRef.current.style.opacity = o;
        introRef.current.style.transform = `translateY(${-s * 40}px)`;
        introRef.current.style.visibility = o > 0 ? 'visible' : 'hidden';
      }
      capRefs.current.forEach((el, j) => {
        if (!el) return;
        const d = s - j, o = clamp01(1 - Math.abs(d) * 2.6);
        el.style.opacity = o;
        el.style.transform = `translateY(${-d * 24}px)`;
        el.style.visibility = o > 0 ? 'visible' : 'hidden';
      });
      if (finalRef.current) {
        const o = clamp01(1 - (S - 1 - s) * 2.6);
        finalRef.current.style.opacity = o;
        finalRef.current.style.visibility = o > 0 ? 'visible' : 'hidden';
      }
      const typed = Math.round(clamp01((v - (S - 1.4)) / 1.1) * FINAL_WORDS.length);
      if (typed !== lastWords) {
        wordRefs.current.forEach((el, k) => {
          if (!el) return;
          el.style.opacity = k < typed ? 1 : 0;
          el.classList.toggle('last', k === typed - 1 || (typed === 0 && k === 0));
        });
        lastWords = typed;
      }
      if (skipRef.current) skipRef.current.style.opacity = clamp01((UNITS - 0.3 - v) * 2);
      if (progRef.current) progRef.current.style.transform = `scaleX(${v / UNITS})`;
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
      img.onload = null;
      geo.dispose();
      mat.dispose();
      renderer.dispose();
    };
  }, [enabled]);

  if (!enabled) return null;

  const skip = () => {
    const el = sectionRef.current;
    const top = el.getBoundingClientRect().bottom + window.scrollY - 64;
    window.scrollTo({ top, behavior: 'instant' });
    onSkip?.();
  };

  let wi = 0;
  return (
    <section className="journey" ref={sectionRef} style={{ height: `calc(${UNITS * VH_PER_UNIT}vh + 100vh)` }} aria-label="Who I am: from how minds work to AI that acts">
      <div className="journey-stage">
        <canvas ref={canvasRef} className="journey-canvas" aria-hidden="true" />

        <div className="journey-text journey-intro" ref={introRef}>
          <p className="journey-chapter">Managing Director of AI · Plymouth Rock Assurance</p>
          <h1>Phil Loatman</h1>
          <p className="journey-caption">AI leader and cognitive scientist.</p>
          <p className="journey-hint">Scroll to go inside <span aria-hidden="true">↓</span></p>
        </div>

        {SCENES.map((sc, j) => (sc.caption ? (
          <div key={sc.id} className="journey-text" ref={(el) => { capRefs.current[j] = el; }}>
            <p className="journey-chapter">{sc.chapter}</p>
            <h2>{sc.title}</h2>
            <p className="journey-caption">{sc.caption}</p>
          </div>
        ) : null))}

        <div className="journey-text journey-final" ref={finalRef}>
          <p className="journey-chapter">Agentic AI</p>
          <div className="journey-gen">
            {FINAL.map((l, li) => (
              <p key={li} className={l.cls}>
                {l.text.split(' ').map((w) => {
                  const k = wi++;
                  return <span key={k} className="w" ref={(el) => { wordRefs.current[k] = el; }}>{w} </span>;
                })}
              </p>
            ))}
          </div>
        </div>

        <button className="journey-skip" ref={skipRef} onClick={skip}>Skip intro ↓</button>
        <div className="journey-progress" aria-hidden="true"><span ref={progRef} /></div>
      </div>
    </section>
  );
}
