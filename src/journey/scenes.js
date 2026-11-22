// Particle targets for each scene of the homepage journey.
// Every scene places the same N particles; the hero blends between consecutive scenes.
// World units: diagrams fit roughly inside x ∈ [-2.6, 2.6], y ∈ [-1.7, 1.7].

const ACCENT = [0.54, 0.71, 1.0];
const WARM = [1.0, 0.64, 0.4];
const VIOLET = [0.72, 0.58, 1.0];
const CYAN = [0.45, 0.88, 0.95];
const DIM = [0.32, 0.4, 0.58];
const WHITE = [0.92, 0.95, 1.0];

// Facets of who Phil is, not a timeline: a field, a broad headline, one plain sentence.
export const SCENES = [
  { id: 'photo' },
  { id: 'dive' },
  { id: 'brain', chapter: 'Cognitive science', title: 'How minds work', caption: 'How the brain turns information into choices.' },
  { id: 'loss', chapter: 'Behavioral economics', title: 'Why people choose', caption: 'The predictable quirks that make decisions human.' },
  { id: 'bayes', chapter: 'Statistics', title: 'Reasoning under uncertainty', caption: 'Changing your mind as the evidence comes in.' },
  { id: 'ml', chapter: 'Machine learning', title: 'Learning from data', caption: 'Finding the patterns that predict what comes next.' },
  { id: 'llm', chapter: 'Generative AI', title: 'Language, at scale', caption: 'Models that read, write, and reason.' },
  { id: 'agents', chapter: 'Agentic AI', title: 'Systems that act' },
];

// Where the camera dives into the portrait (between the eyes, in world units).
const HEAD = [0, 0.42];

export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

function gauss(r) {
  let u = 0;
  while (u === 0) u = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r());
}

function unitVec(r) {
  let x = gauss(r), y = gauss(r), z = gauss(r);
  const l = Math.hypot(x, y, z) || 1;
  return [x / l, y / l, z / l];
}

// Faint deep-space field for particles a scene doesn't use. Same spot per particle in
// every scene, so idle particles stay still instead of flying around.
export function makeDust(n, r) {
  const pos = new Float32Array(n * 3);
  const col = new Float32Array(n * 3);
  for (let k = 0; k < n; k++) {
    pos[k * 3] = (r() - 0.5) * 16;
    pos[k * 3 + 1] = (r() - 0.5) * 9;
    pos[k * 3 + 2] = -1.5 - r() * 8;
    const b = 0.05 + r() * 0.09;
    col[k * 3] = 0.55 * b; col[k * 3 + 1] = 0.7 * b; col[k * 3 + 2] = 1.0 * b;
  }
  return { pos, col };
}

class Builder {
  constructor(n, r, dust) {
    this.n = n; this.r = r; this.dust = dust; this.i = 0;
    this.pos = new Float32Array(n * 3);
    this.col = new Float32Array(n * 3);
    this.glow = new Float32Array(n);
    this.size = new Float32Array(n);
  }
  budget(frac) { return Math.floor(this.n * frac); }
  add(x, y, z, c, bright = 1, glow = 0, size = 1) {
    if (this.i >= this.n) return;
    const k = this.i++, k3 = k * 3;
    this.pos[k3] = x; this.pos[k3 + 1] = y; this.pos[k3 + 2] = z;
    this.col[k3] = c[0] * bright; this.col[k3 + 1] = c[1] * bright; this.col[k3 + 2] = c[2] * bright;
    this.glow[k] = glow; this.size[k] = size;
  }
  done() {
    for (let k = this.i; k < this.n; k++) {
      for (let j = 0; j < 3; j++) {
        this.pos[k * 3 + j] = this.dust.pos[k * 3 + j];
        this.col[k * 3 + j] = this.dust.col[k * 3 + j];
      }
      this.glow[k] = 0; this.size[k] = 0.7;
    }
    return { pos: this.pos, col: this.col, glow: this.glow, size: this.size };
  }
}

// Arc-length sampler over a polyline, so steep curves get as many particles as flat ones.
function sampler(pts) {
  const L = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = L[L.length - 1] || 1;
  return (u) => {
    const d = u * total;
    let lo = 0, hi = L.length - 1;
    while (hi - lo > 1) { const m = (lo + hi) >> 1; if (L[m] < d) lo = m; else hi = m; }
    const seg = L[hi] - L[lo] || 1, t = (d - L[lo]) / seg;
    return [pts[lo][0] + (pts[hi][0] - pts[lo][0]) * t, pts[lo][1] + (pts[hi][1] - pts[lo][1]) * t, u];
  };
}

function curve(b, count, pts, color, { jit = 0.012, bright = 1, glow = 0, size = 1, colorAt } = {}) {
  const at = sampler(pts), r = b.r;
  for (let k = 0; k < count; k++) {
    const [x, y, u] = at(r());
    const c = colorAt ? colorAt(u, x, y) : color;
    b.add(x + gauss(r) * jit, y + gauss(r) * jit, gauss(r) * jit * 2, c, bright, glow, size);
  }
}

const line = (b, count, x0, y0, x1, y1, color, opts) => curve(b, count, [[x0, y0], [x1, y1]], color, opts);

function fnPts(f, x0, x1, steps = 500) {
  const pts = [];
  for (let i = 0; i <= steps; i++) { const x = x0 + ((x1 - x0) * i) / steps; pts.push([x, f(x)]); }
  return pts;
}

function fillUnder(b, count, f, x0, x1, base, color, bright = 0.22, brightAt) {
  const r = b.r;
  for (let k = 0; k < count; k++) {
    const x = x0 + r() * (x1 - x0);
    const y = base + r() * (f(x) - base);
    b.add(x, y, (r() - 0.5) * 0.06, color, brightAt ? brightAt(x) : bright, 0, 0.8);
  }
}

function bezier(p0, p1, p2, steps = 80) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps, u = 1 - t;
    pts.push([u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]]);
  }
  return pts;
}

/* ---------------- scenes ---------------- */

// pts: { xy: Float32Array, rgb: Float32Array, count } sampled from the portrait.
function photo(b, pts) {
  const r = b.r, c = b.budget(0.96);
  if (!pts || !pts.count) {
    // Placeholder until the photo loads: a soft glowing orb.
    for (let k = 0; k < c * 0.5; k++) {
      const [x, y, z] = unitVec(r), s = Math.cbrt(r()) * 1.3;
      b.add(x * s, y * s + 0.2, z * s * 0.4, ACCENT, 0.35);
    }
    return b.done();
  }
  // One particle per sampled pixel (shuffled so the morph isn't scan-ordered); any spare
  // particles stay as background dust.
  const order = Array.from({ length: pts.count }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  const px = pts.cell * 0.5;
  for (let k = 0; k < Math.min(c, pts.count); k++) {
    const j = order[k];
    const x = pts.xy[j * 2] + (r() - 0.5) * px;
    const y = pts.xy[j * 2 + 1] + (r() - 0.5) * px;
    // Contrast curve: deepens eyes, brows and beard against skin so the face reads.
    const rgb = [pts.rgb[j * 3], pts.rgb[j * 3 + 1], pts.rgb[j * 3 + 2]].map((v) => Math.pow(v, 1.8) * 1.45);
    const lum = 0.3 * rgb[0] + 0.59 * rgb[1] + 0.11 * rgb[2];
    b.add(x, y, (lum - 0.5) * 0.25, rgb, 1.0, 0, 1.0);
  }
  return b.done();
}

// The portrait blown apart around the head and pulled toward the camera: the "dive".
function dive(b, from) {
  const r = b.r;
  for (let k = 0; k < b.n; k++) {
    const k3 = k * 3;
    const dx = from.pos[k3] - HEAD[0], dy = from.pos[k3 + 1] - HEAD[1];
    const s = 4 + r() * 4;
    const c = mix([from.col[k3], from.col[k3 + 1], from.col[k3 + 2]], ACCENT, 0.6);
    b.add(HEAD[0] + dx * s, HEAD[1] + dy * s, 1.5 + r() * 3.6, c, 0.6, 0, 1);
  }
  return b.done();
}

function brain(b) {
  const r = b.r, oy = 0.2;
  const vm = [1.62, -0.38, 0];

  // Cerebrum: a wrinkled ellipsoid shell, flatter underneath.
  for (let k = 0, c = b.budget(0.58); k < c; k++) {
    const [ux, uy, uz] = unitVec(r);
    const shell = 0.8 + 0.2 * Math.pow(r(), 0.35);
    const w = 1 + 0.06 * Math.sin(13 * ux + 7 * uy) * Math.cos(11 * uz + 5 * ux) + 0.035 * Math.sin(23 * uy + 17 * uz);
    const x = 2.05 * ux * shell * w;
    let y = 1.28 * uy * shell * w;
    const z = 1.2 * uz * shell * w;
    if (y < 0) y *= 0.7;
    const d = Math.hypot(x - vm[0], y - vm[1], z - vm[2]);
    if (d < 0.62) b.add(x, y + oy, z, WARM, 1.0, 1, 1.15);
    else b.add(x, y + oy, z, ACCENT, 0.32 + 0.3 * shell, 0, 1);
  }
  // Cerebellum, with striped folia.
  for (let k = 0, c = b.budget(0.1); k < c; k++) {
    const [ux, uy, uz] = unitVec(r);
    const s = 0.75 + 0.25 * r();
    const x = -1.3 + ux * 0.62 * s, y = -0.78 + uy * 0.36 * s, z = uz * 0.55 * s;
    b.add(x, y + oy, z, VIOLET, 0.35 + 0.3 * (0.5 + 0.5 * Math.sin(y * 48)), 0, 0.9);
  }
  // Brainstem.
  for (let k = 0, c = b.budget(0.04); k < c; k++) {
    const t = r();
    b.add(-0.5 + t * 0.12 + gauss(r) * 0.08, -0.62 - t * 1.0, gauss(r) * 0.08, DIM, 0.6, 0, 0.9);
  }
  // Striatum: the brain's valuation hub, glowing.
  for (let k = 0, c = b.budget(0.05); k < c; k++) {
    b.add(0.15 + gauss(r) * 0.26, 0.05 + gauss(r) * 0.14 + oy, gauss(r) * 0.2, WARM, 1.1, 1, 1.2);
  }
  // Dopamine pathways from the midbrain to the striatum and prefrontal cortex.
  const vta = [-0.45, -0.55 + oy];
  const paths = [
    bezier(vta, [-0.2, -0.1 + oy], [0.15, 0.05 + oy]),
    bezier(vta, [0.6, -0.65 + oy], [vm[0] - 0.1, vm[1] + oy]),
    bezier(vta, [0.3, 0.9 + oy], [1.2, 0.5 + oy]),
  ];
  for (const p of paths) curve(b, b.budget(0.022), p, CYAN, { jit: 0.018, bright: 0.9, glow: 0.7 });
  return b.done();
}

function loss(b) {
  const lambda = 2.25, alpha = 0.55, oy = 0.55; // curvature exaggerated so the kink reads at a glance
  const v = (x) => (x >= 0 ? Math.pow(x, alpha) : -lambda * Math.pow(-x, alpha));
  const f = (X) => oy + v(X / 2.4) * 0.95;
  line(b, b.budget(0.07), -2.6, oy, 2.6, oy, DIM, { bright: 0.55, jit: 0.006 });
  line(b, b.budget(0.06), 0, -1.7, 0, 1.6, DIM, { bright: 0.55, jit: 0.006 });
  curve(b, b.budget(0.2), fnPts(f, 0, 2.4), ACCENT, { bright: 1.1, glow: 0.2 });
  curve(b, b.budget(0.26), fnPts(f, -2.4, 0), WARM, { bright: 1.1, glow: 0.5 });
  fillUnder(b, b.budget(0.08), f, 0, 2.4, oy, ACCENT, 0.16);
  fillUnder(b, b.budget(0.14), f, -2.4, 0, oy, WARM, 0.16);
  return b.done();
}

function bayes(b) {
  const base = -1.4, K = 3.2;
  const pdf = (m, s) => (x) => Math.exp(-((x - m) ** 2) / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI));
  const toW = (th) => th * (2.5 / 3), fromW = (x) => x * (3 / 2.5);
  const curveOf = (p) => (x) => base + p(fromW(x)) * K;
  const m1 = -0.9, s1 = 0.8, m2 = 1.0, s2 = 0.6;
  const p1 = 1 / (s1 * s1), p2 = 1 / (s2 * s2);
  const mp = (m1 * p1 + m2 * p2) / (p1 + p2), sp = Math.sqrt(1 / (p1 + p2));
  const prior = curveOf(pdf(m1, s1)), like = curveOf(pdf(m2, s2)), post = curveOf(pdf(mp, sp));
  line(b, b.budget(0.07), -2.6, base, 2.6, base, DIM, { bright: 0.55, jit: 0.006 });
  curve(b, b.budget(0.13), fnPts(prior, -2.5, 2.5), VIOLET, { bright: 0.75 });
  curve(b, b.budget(0.13), fnPts(like, -2.5, 2.5), CYAN, { bright: 0.75 });
  curve(b, b.budget(0.22), fnPts(post, -2.5, 2.5), WHITE, { bright: 1.1, glow: 0.5 });
  fillUnder(b, b.budget(0.2), post, toW(mp - 3 * sp), toW(mp + 3 * sp), base, ACCENT, 0.22);
  return b.done();
}

// Classification: two classes, the regions a model assigns them, and the boundary it learned.
function ml(b) {
  const r = b.r;
  const edge = (x) => 0.45 * Math.sin(1.25 * x + 0.4) + 0.12 * x - 0.05;
  // Decision surface: a faint lattice tinted by predicted class.
  for (let gx = -2.5; gx <= 2.51; gx += 0.17) {
    for (let gy = -1.6; gy <= 1.61; gy += 0.17) {
      const above = gy > edge(gx);
      for (let k = 0; k < 3; k++) b.add(gx + gauss(r) * 0.004, gy + gauss(r) * 0.004, 0, above ? ACCENT : WARM, 0.16, 0, 0.8);
    }
  }
  // Labelled data, mostly on its own side, with a little noise near the boundary.
  for (let k = 0, c = b.budget(0.03); k < c; k++) {
    for (let tries = 0; tries < 8; tries++) {
      const x = -2.4 + r() * 4.8, y = -1.5 + r() * 3.0, d = y - edge(x);
      if (Math.abs(d) < 0.12) continue;
      const above = r() < 0.06 && Math.abs(d) < 0.5 ? d < 0 : d > 0;
      const col = above ? ACCENT : WARM;
      for (let j = 0, n = 18; j < n; j++) b.add(x + gauss(r) * 0.025, y + gauss(r) * 0.025, gauss(r) * 0.02, col, 1.0, 0, 1);
      break;
    }
  }
  curve(b, b.budget(0.16), fnPts(edge, -2.6, 2.6), WHITE, { bright: 1.15, glow: 0.6, jit: 0.012 });
  return b.done();
}

function llm(b) {
  const r = b.r, tilt = 0.5, ct = Math.cos(tilt), st = Math.sin(tilt);
  const put = (x, y, z, c, br, g, s) => b.add(x, y * ct - z * st, y * st + z * ct, c, br, g, s);
  // A dense, spiralling cloud: a model's latent space.
  for (let k = 0, c = b.budget(0.72); k < c; k++) {
    const arm = Math.floor(r() * 4);
    const rad = 0.08 + 3.0 * Math.pow(r(), 1.35);
    const ang = (arm * Math.PI) / 2 + rad * 1.5 + gauss(r) * 0.22 * (0.6 + rad * 0.25);
    const x = Math.cos(ang) * rad, z = Math.sin(ang) * rad, y0 = gauss(r) * 0.07 * (1 + rad * 0.4);
    const t = clamp01(rad / 3);
    const col = t < 0.35 ? mix(WHITE, ACCENT, t / 0.35) : mix(ACCENT, VIOLET, (t - 0.35) / 0.65);
    put(x, y0, z, col, 1.15 - t * 0.6, rad < 0.6 ? 0.6 : 0, 1);
  }
  for (let k = 0, c = b.budget(0.18); k < c; k++) {
    const [ux, uy, uz] = unitVec(r), s = Math.abs(gauss(r)) * 1.4;
    put(ux * s, uy * s * 0.6, uz * s, CYAN, 0.3, 0, 0.8);
  }
  return b.done();
}

// Agentic AI: a model at the core, agents around it that coordinate, each reaching out to tools.
function agents(b) {
  const r = b.r, tilt = 0.42, ct = Math.cos(tilt), st = Math.sin(tilt);
  const P = (x, y, z) => [x, y * ct - z * st, y * st + z * ct];
  const put = (p, c, br, g, s) => b.add(p[0], p[1], p[2], c, br, g, s);
  const link = (a, z, count, c, br, g) => {
    for (let k = 0; k < count; k++) {
      const t = r(), j = 0.012;
      put([a[0] + (z[0] - a[0]) * t + gauss(r) * j, a[1] + (z[1] - a[1]) * t + gauss(r) * j, a[2] + (z[2] - a[2]) * t + gauss(r) * j], c, br, g, 0.9);
    }
  };
  const blob = (p, sd, count, c, br, g, s = 1.1) => {
    for (let k = 0; k < count; k++) put([p[0] + gauss(r) * sd, p[1] + gauss(r) * sd, p[2] + gauss(r) * sd], c, br, g, s);
  };
  const core = [0, 0, 0];
  blob(core, 0.17, b.budget(0.12), WHITE, 1.1, 0.8, 1.2);
  blob(core, 0.42, b.budget(0.06), ACCENT, 0.35, 0, 1);
  const A = 6, R = 1.2, agentsAt = [];
  for (let i = 0; i < A; i++) {
    const a = (i / A) * Math.PI * 2;
    agentsAt.push(P(Math.cos(a) * R * 1.2, Math.sin(a) * 0.12, Math.sin(a) * R));
  }
  agentsAt.forEach((p, i) => {
    blob(p, 0.075, b.budget(0.025), CYAN, 1.05, 0.7);
    link(core, p, b.budget(0.03), ACCENT, 0.55, 0.5);
    // Agents hand work to one another around the ring.
    link(p, agentsAt[(i + 1) % A], b.budget(0.02), VIOLET, 0.4, 0);
    // Tools each agent can call.
    const a = (i / A) * Math.PI * 2;
    for (const da of [-0.32, 0, 0.32]) {
      const t = P(Math.cos(a + da) * 1.85 * 1.15, Math.sin(a) * 0.12 + (da === 0 ? 0.35 : -0.15), Math.sin(a + da) * 1.85);
      const box = 0.06;
      for (let k = 0, n = b.budget(0.004); k < n; k++) {
        const f = Math.floor(r() * 3), u = (r() - 0.5) * 2 * box, v = (r() - 0.5) * 2 * box, s = r() < 0.5 ? -box : box;
        const o = f === 0 ? [s, u, v] : f === 1 ? [u, s, v] : [u, v, s];
        put([t[0] + o[0], t[1] + o[1], t[2] + o[2]], WARM, 0.95, 0.5, 0.9);
      }
      link(p, t, b.budget(0.006), WARM, 0.35, 0);
    }
  });
  return b.done();
}

const BUILDERS = { brain, loss, bayes, ml, llm, agents };

export function buildTargets(n, dust, photoPts) {
  const out = [];
  SCENES.forEach((sc, i) => {
    const b = new Builder(n, rng(1000 + i * 17), dust);
    if (sc.id === 'photo') out.push(photo(b, photoPts));
    else if (sc.id === 'dive') out.push(dive(b, out[0]));
    else out.push(BUILDERS[sc.id](b));
  });
  return out;
}

// Rebuild just the portrait and the dive once the photo has loaded.
export function rebuildPhoto(targets, n, dust, photoPts) {
  targets[0] = photo(new Builder(n, rng(1000), dust), photoPts);
  targets[1] = dive(new Builder(n, rng(1017), dust), targets[0]);
}

// Turn the portrait into colored points, keeping the person and dropping the gray backdrop.
// The resolution is chosen so there is roughly one pixel per particle.
export function samplePhoto(img, target) {
  const first = sampleAt(img, 200);
  if (!target || !first.count) return first;
  return sampleAt(img, Math.round(200 * Math.sqrt(target / first.count)));
}

function sampleAt(img, rows) {
  const crop = { x: 250, y: 30, w: 720, h: 714 };
  const scale = rows / crop.h;
  const cw = Math.round(crop.w * scale), ch = Math.round(crop.h * scale);
  const cv = document.createElement('canvas');
  cv.width = cw; cv.height = ch;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, cw, ch);
  const data = ctx.getImageData(0, 0, cw, ch).data;
  const px = (x, y) => { const i = (y * cw + x) * 4; return [data[i], data[i + 1], data[i + 2]]; };
  const avg = (x0, y0) => {
    const a = [0, 0, 0];
    for (let y = y0; y < y0 + 6; y++) for (let x = x0; x < x0 + 6; x++) { const p = px(x, y); a[0] += p[0]; a[1] += p[1]; a[2] += p[2]; }
    return a.map((v) => v / 36);
  };
  const bgL = avg(1, 1), bgR = avg(cw - 7, 1);
  const keep = [];
  const H = 3.4; // portrait height in world units
  const r = rng(5);
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const p = px(x, y), t = x / cw;
      const bg = [bgL[0] + (bgR[0] - bgL[0]) * t, bgL[1] + (bgR[1] - bgL[1]) * t, bgL[2] + (bgR[2] - bgL[2]) * t];
      const d = Math.hypot(p[0] - bg[0], p[1] - bg[1], p[2] - bg[2]);
      if (d < 34) continue;
      // Fade the hard bottom edge of the crop.
      const yn = y / ch;
      if (yn > 0.8 && r() > (1 - yn) / 0.2) continue;
      keep.push([((x - cw / 2) / ch) * H, ((ch / 2 - y) / ch) * H, p[0] / 255, p[1] / 255, p[2] / 255]);
    }
  }
  const xy = new Float32Array(keep.length * 2), rgb = new Float32Array(keep.length * 3);
  keep.forEach((k, i) => { xy[i * 2] = k[0]; xy[i * 2 + 1] = k[1]; rgb[i * 3] = k[2]; rgb[i * 3 + 1] = k[3]; rgb[i * 3 + 2] = k[4]; });
  return { xy, rgb, count: keep.length, cell: H / ch };
}
