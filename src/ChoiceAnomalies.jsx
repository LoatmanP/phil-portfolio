import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// ─── Trial data from Appendix A & B ──────────────────────────────────────────
// Each trial: [ssDelay, ssReward, llDelay, llReward]
const STATIONARITY_SMALL = [
  [0, 15, 7, 80],    [0, 50, 2, 75],    [0, 20, 10, 45],
  [0, 80, 5, 115],   [0, 40, 1, 105],   [2, 25, 21, 55],
  [2, 15, 14, 75],   [3, 95, 7, 150],   [3, 20, 7, 40],
  [5, 15, 7, 60],    [7, 75, 30, 100],  [10, 25, 30, 100],
];

const STATIONARITY_LARGE = STATIONARITY_SMALL.map(
  ([sd, sr, ld, lr]) => [sd + 60, sr, ld + 60, lr]
);

const MAGNITUDE_SMALL = [
  [0, 15, 7, 80],    [0, 50, 2, 75],    [0, 20, 10, 45],
  [0, 80, 5, 115],   [0, 40, 1, 105],   [2, 25, 21, 55],
  [2, 15, 14, 75],   [3, 95, 7, 150],   [3, 20, 7, 40],
  [5, 15, 7, 60],    [7, 75, 30, 100],  [10, 25, 30, 100],
];

const MAGNITUDE_LARGE = MAGNITUDE_SMALL.map(
  ([sd, sr, ld, lr]) => [sd, sr * 7, ld, lr * 7]
);

// ─── Discount models (same as TimePreferences.jsx) ──────────────────────────
function clip(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function average(a) { return a.reduce((s, x) => s + x, 0) / a.length; }

function buildX(trials) {
  return trials.map((t, i) => [i, t[1], t[0], t[3], t[2]]);
  // [id, ssReward, ssDelay, llReward, llDelay]
}

function expChoice(X, params) {
  const k = Math.exp(params[0]);
  const rho = params[1];
  return X.map(r => {
    const ss = r[1];
    const ll = r[3] * Math.exp(-k * r[4]);
    return 1 / (1 + Math.exp(-rho * (ll - ss)));
  });
}

function expSSE(params, X, y) {
  if (params[0] < -7.3 || params[0] > -0.01 || params[1] <= 0) return 1e20;
  const yhat = expChoice(X, params);
  let sse = 0;
  for (let i = 0; i < y.length; i++) {
    const yh = clip(yhat[i], 1e-8, 1 - 1e-8);
    const a = -y[i] * Math.log(yh);
    const b = (1 - y[i]) * Math.log(1 - yh);
    sse += (a - b) ** 2;
  }
  return sse;
}

function fitExp(X, y) {
  let best = [-5, 0.01], bestV = Infinity;
  for (let dr = -8; dr < 0.01; dr += 0.1) {
    for (let rho = 0; rho < 1.1; rho += 0.1) {
      const v = expSSE([dr, rho], X, y);
      if (v < bestV) { bestV = v; best = [dr, rho]; }
    }
  }
  return best;
}

function hypChoice(X, params) {
  const k = Math.exp(params[0]);
  const rho = params[1];
  return X.map(r => {
    const ss = r[1];
    const ll = r[3] * (1 / (1 + k * r[4]));
    return 1 / (1 + Math.exp(-rho * (ll - ss)));
  });
}

function hypSSE(params, X, y) {
  if (params[0] < -7.3 || params[0] > -0.01 || params[1] < 0 || params[1] > 2) return 1e13;
  const yhat = hypChoice(X, params);
  let sse = 0;
  for (let i = 0; i < y.length; i++) {
    const yh = clip(yhat[i], 1e-8, 1 - 1e-8);
    const a = -y[i] * Math.log(yh);
    const b = (1 - y[i]) * Math.log(1 - yh);
    sse += (a - b) ** 2;
  }
  return sse;
}

function fitHyp(X, y) {
  let best = [-5, 0.01], bestV = Infinity;
  for (let dr = -8; dr < 0.01; dr += 0.1) {
    for (let rho = 0; rho < 2; rho += 0.1) {
      const v = hypSSE([dr, rho], X, y);
      if (v < bestV) { bestV = v; best = [dr, rho]; }
    }
  }
  return best;
}

// ─── Difference model: P(LL) = logistic(b0 + b1*(x2-x1) + b2*(t2-t1)) ─────
function diffChoice(X, params) {
  const [b0, b1, b2] = params;
  return X.map(r => {
    const rewardDiff = r[3] - r[1]; // llReward - ssReward
    const delayDiff = r[4] - r[2];  // llDelay - ssDelay
    const z = b0 + b1 * rewardDiff + b2 * delayDiff;
    return 1 / (1 + Math.exp(-z));
  });
}

function diffSSE(params, X, y) {
  const yhat = diffChoice(X, params);
  let sse = 0;
  for (let i = 0; i < y.length; i++) {
    const yh = clip(yhat[i], 1e-8, 1 - 1e-8);
    const a = -y[i] * Math.log(yh);
    const b = (1 - y[i]) * Math.log(1 - yh);
    sse += (a - b) ** 2;
  }
  return sse;
}

function fitDiff(X, y) {
  let best = [0, 0, 0], bestV = Infinity;
  for (let b0 = -2; b0 <= 2; b0 += 0.5) {
    for (let b1 = -0.1; b1 <= 0.2; b1 += 0.02) {
      for (let b2 = -0.15; b2 <= 0.05; b2 += 0.02) {
        const v = diffSSE([b0, b1, b2], X, y);
        if (v < bestV) { bestV = v; best = [b0, b1, b2]; }
      }
    }
  }
  return best;
}

// ─── Cross-validation ───────────────────────────────────────────────────────
function kFoldSplit(n, k) {
  const foldSize = Math.floor(n / k);
  const folds = [];
  for (let i = 0; i < k; i++) {
    const start = i * foldSize;
    const end = i === k - 1 ? n : (i + 1) * foldSize;
    const test = [], train = [];
    for (let j = 0; j < n; j++) {
      (j >= start && j < end ? test : train).push(j);
    }
    folds.push({ train, test });
  }
  return folds;
}

function subset(arr, idx) { return idx.map(i => arr[i]); }

function crossValidate(fitFn, choiceFn, X, y, nFolds) {
  const folds = kFoldSplit(X.length, nFolds);
  const accs = [];
  for (const fold of folds) {
    const params = fitFn(subset(X, fold.train), subset(y, fold.train));
    const preds = choiceFn(subset(X, fold.test), params).map(p => Math.round(p));
    const yTest = subset(y, fold.test);
    let correct = 0;
    for (let i = 0; i < yTest.length; i++) if (preds[i] === yTest[i]) correct++;
    accs.push(correct / yTest.length);
  }
  return average(accs);
}

function crossValidateAcross(fitFn, choiceFn, trainX, trainY, testX, testY) {
  const params = fitFn(trainX, trainY);
  const preds = choiceFn(testX, params).map(p => Math.round(p));
  let correct = 0;
  for (let i = 0; i < testY.length; i++) if (preds[i] === testY[i]) correct++;
  return correct / testY.length;
}

// ─── Run full analysis ──────────────────────────────────────────────────────
function runAnalysis(experiment, choices1, choices2) {
  const trials1 = experiment === 'stationarity' ? STATIONARITY_SMALL : MAGNITUDE_SMALL;
  const trials2 = experiment === 'stationarity' ? STATIONARITY_LARGE : MAGNITUDE_LARGE;

  const X1 = buildX(trials1);
  const X2 = buildX(trials2);
  const y1 = choices1;
  const y2 = choices2;

  const pLL1 = average(y1);
  const pLL2 = average(y2);

  const nFolds = Math.min(6, choices1.length);

  const models = [
    { name: 'Exponential', fit: fitExp, choice: expChoice },
    { name: 'Hyperbolic', fit: fitHyp, choice: hypChoice },
    { name: 'Difference', fit: fitDiff, choice: diffChoice },
  ];

  const modelResults = models.map(m => {
    const within1 = crossValidate(m.fit, m.choice, X1, y1, nFolds);
    const within2 = crossValidate(m.fit, m.choice, X2, y2, nFolds);
    const across12 = crossValidateAcross(m.fit, m.choice, X1, y1, X2, y2);
    const across21 = crossValidateAcross(m.fit, m.choice, X2, y2, X1, y1);
    return {
      name: m.name,
      within1: (within1 * 100),
      within2: (within2 * 100),
      across12: (across12 * 100),
      across21: (across21 * 100),
    };
  });

  return { pLL1, pLL2, modelResults };
}

// ─── Formatting helpers ─────────────────────────────────────────────────────
function formatChoice(trial, isLL) {
  const [sd, sr, ld, lr] = trial;
  if (isLL) return ld === 0 ? `$${lr} today` : `$${lr} in ${ld} days`;
  return sd === 0 ? `$${sr} today` : `$${sr} in ${sd} days`;
}

// ─── Component ──────────────────────────────────────────────────────────────
const ChoiceAnomalies = ({ onBack }) => {
  const [experiment, setExperiment] = useState('stationarity');
  const [phase, setPhase] = useState('intro'); // intro, condition1, condition2, results
  const [sel1, setSel1] = useState(Array(12).fill(null));
  const [sel2, setSel2] = useState(Array(12).fill(null));
  const [results, setResults] = useState(null);
  const [computing, setComputing] = useState(false);

  const trials1 = experiment === 'stationarity' ? STATIONARITY_SMALL : MAGNITUDE_SMALL;
  const trials2 = experiment === 'stationarity' ? STATIONARITY_LARGE : MAGNITUDE_LARGE;
  const cond1Label = experiment === 'stationarity' ? 'Short Delays' : 'Small Rewards';
  const cond2Label = experiment === 'stationarity' ? 'Long Delays (+60 days)' : 'Large Rewards (x7)';

  const resetExperiment = (exp) => {
    setExperiment(exp);
    setPhase('intro');
    setSel1(Array(12).fill(null));
    setSel2(Array(12).fill(null));
    setResults(null);
  };

  const handleSubmitCondition2 = () => {
    setComputing(true);
    setTimeout(() => {
      const r = runAnalysis(experiment, sel1, sel2);
      setResults(r);
      setPhase('results');
      setComputing(false);
    }, 50);
  };

  const allDone1 = sel1.every(s => s !== null);
  const allDone2 = sel2.every(s => s !== null);

  const cardStyle = {
    padding: '20px',
    borderRadius: '12px',
    backgroundColor: 'rgba(138, 180, 255, 0.03)',
    border: '1px solid rgba(138, 180, 255, 0.08)',
  };

  const radioStyle = (selected) => ({
    display: 'block',
    padding: '10px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: selected ? '600' : '400',
    color: selected ? '#ededef' : '#a1a1aa',
    backgroundColor: selected ? 'rgba(138, 180, 255, 0.15)' : 'rgba(138, 180, 255, 0.03)',
    border: selected ? '1px solid rgba(138, 180, 255, 0.4)' : '1px solid rgba(138, 180, 255, 0.08)',
    transition: 'all 0.2s ease',
    marginBottom: '6px',
  });

  const btnPrimary = (enabled) => ({
    padding: '14px 40px',
    fontSize: '16px',
    fontWeight: '600',
    color: enabled ? '#0a0a0b' : '#6b6b74',
    backgroundColor: enabled ? '#8ab4ff' : 'rgba(138, 180, 255, 0.1)',
    border: 'none',
    borderRadius: '10px',
    cursor: enabled ? 'pointer' : 'not-allowed',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    width: '100%',
  });

  // ─── Render trial grid ────────────────────────────────────────────────
  const renderTrials = (trials, selections, setSelections, condLabel) => (
    <>
      <div style={{
        padding: '12px 20px',
        borderRadius: '8px',
        backgroundColor: 'rgba(138, 180, 255, 0.06)',
        border: '1px solid rgba(138, 180, 255, 0.15)',
        marginBottom: '24px',
      }}>
        <span style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#8ab4ff' }}>
          Condition: {condLabel}
        </span>
        <p style={{ fontSize: '14px', color: '#a1a1aa', margin: '8px 0 0 0' }}>
          Which reward do you prefer? Select one option for each choice.
        </p>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {trials.map((trial, idx) => (
          <div key={idx} style={cardStyle}>
            <div style={{ fontSize: '11px', color: '#6b6b74', marginBottom: '10px', fontWeight: '600', letterSpacing: '1px' }}>
              CHOICE {idx + 1}
            </div>
            <label style={radioStyle(selections[idx] === 0)}>
              <input type="radio" name={`${condLabel}-${idx}`} checked={selections[idx] === 0}
                onChange={() => { const n = [...selections]; n[idx] = 0; setSelections(n); }}
                style={{ display: 'none' }} />
              {formatChoice(trial, false)}
            </label>
            <label style={radioStyle(selections[idx] === 1)}>
              <input type="radio" name={`${condLabel}-${idx}`} checked={selections[idx] === 1}
                onChange={() => { const n = [...selections]; n[idx] = 1; setSelections(n); }}
                style={{ display: 'none' }} />
              {formatChoice(trial, true)}
            </label>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button onClick={onBack} style={{
          background: 'none', border: '1px solid rgba(138, 180, 255, 0.2)',
          borderRadius: '8px', color: '#8ab4ff', padding: '8px 16px',
          cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit',
        }}>
          &larr; Back to Projects
        </button>
      </div>

      <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#ededef', margin: '0 0 8px 0' }}>
        Intertemporal Choice Anomalies
      </h2>
      <p style={{ fontSize: '15px', color: '#a1a1aa', lineHeight: 1.7, marginBottom: '8px' }}>
        Based on <em style={{ color: '#8ab4ff' }}>Loatman & Luhmann</em> — experience two classic decision-making anomalies firsthand and see how well computational models predict your behavior.
      </p>
      <p style={{ fontSize: '14px', color: '#6b6b74', lineHeight: 1.7, marginBottom: '32px' }}>
        The key finding: although these anomalies are statistically significant, they don't translate into general problems with prediction. Models can still accurately predict your choices even when your behavior is "irrational."
      </p>

      {/* Experiment selector */}
      <div style={{ marginBottom: '32px' }}>
        <label style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#6b6b74', display: 'block', marginBottom: '10px' }}>
          Select Experiment
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'stationarity', label: 'Stationarity Violations' },
            { id: 'magnitude', label: 'Magnitude Effect' },
          ].map(e => (
            <button key={e.id} onClick={() => resetExperiment(e.id)} style={{
              padding: '10px 24px', fontSize: '14px', fontWeight: '500',
              color: experiment === e.id ? '#ededef' : '#6b6b74',
              backgroundColor: experiment === e.id ? 'rgba(138, 180, 255, 0.15)' : 'transparent',
              border: experiment === e.id ? '1px solid rgba(138, 180, 255, 0.3)' : '1px solid rgba(138, 180, 255, 0.1)',
              borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s ease',
            }}>
              {e.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Intro ─────────────────────────────────────────────────────── */}
      {phase === 'intro' && (
        <div style={{ ...cardStyle, padding: '32px', marginBottom: '32px' }}>
          {experiment === 'stationarity' ? (
            <>
              <h3 style={{ fontSize: '20px', color: '#ededef', marginTop: 0 }}>What are Stationarity Violations?</h3>
              <p style={{ color: '#a1a1aa', lineHeight: 1.8, fontSize: '15px' }}>
                Rational decision-makers should have <em>stationary</em> preferences: if you prefer $100 in 12 months over $75 in 10 months, you should also prefer $100 in 2 months over $75 today. But research shows people often switch — becoming less patient as rewards get closer.
              </p>
              <p style={{ color: '#a1a1aa', lineHeight: 1.8, fontSize: '15px' }}>
                You'll answer the same 12 choices twice: once with <strong style={{ color: '#8ab4ff' }}>short delays</strong> and once with all delays pushed <strong style={{ color: '#8ab4ff' }}>60 days into the future</strong>. If your preferences change between conditions, you're exhibiting a stationarity violation.
              </p>
              <p style={{ color: '#a1a1aa', lineHeight: 1.8, fontSize: '15px', marginBottom: '4px' }}>
                <strong style={{ color: '#ededef' }}>Real-world example:</strong> Setting your alarm for 6 AM with every intention of waking up, but hitting snooze once the moment arrives. Your "future self" was patient; your "present self" is not.
              </p>
            </>
          ) : (
            <>
              <h3 style={{ fontSize: '20px', color: '#ededef', marginTop: 0 }}>What is the Magnitude Effect?</h3>
              <p style={{ color: '#a1a1aa', lineHeight: 1.8, fontSize: '15px' }}>
                Rational decision-makers should discount at the same rate regardless of reward size. But research shows people become more patient with larger amounts — discounting $15 vs $80 more steeply than $105 vs $560.
              </p>
              <p style={{ color: '#a1a1aa', lineHeight: 1.8, fontSize: '15px' }}>
                You'll answer the same 12 choices twice: once with <strong style={{ color: '#8ab4ff' }}>small rewards</strong> and once with all rewards <strong style={{ color: '#8ab4ff' }}>multiplied by 7</strong>. If you become more patient with larger rewards, you're exhibiting the magnitude effect.
              </p>
              <p style={{ color: '#a1a1aa', lineHeight: 1.8, fontSize: '15px', marginBottom: '4px' }}>
                <strong style={{ color: '#ededef' }}>Real-world example:</strong> A waiter splitting dinner into smaller checks to get a bigger total tip — people discount more steeply with smaller amounts.
              </p>
            </>
          )}
          <button onClick={() => setPhase('condition1')} style={{ ...btnPrimary(true), marginTop: '20px', width: 'auto', padding: '12px 32px' }}>
            Start Experiment &rarr;
          </button>
        </div>
      )}

      {/* ─── Condition 1 ───────────────────────────────────────────────── */}
      {phase === 'condition1' && (
        <>
          {renderTrials(trials1, sel1, setSel1, cond1Label)}
          <button
            onClick={() => setPhase('condition2')}
            disabled={!allDone1}
            style={btnPrimary(allDone1)}
          >
            {allDone1 ? `Continue to ${cond2Label} →` : `Answer all choices (${sel1.filter(s => s !== null).length}/12)`}
          </button>
          <div style={{ height: '48px' }} />
        </>
      )}

      {/* ─── Condition 2 ───────────────────────────────────────────────── */}
      {phase === 'condition2' && (
        <>
          {renderTrials(trials2, sel2, setSel2, cond2Label)}
          <button
            onClick={handleSubmitCondition2}
            disabled={!allDone2 || computing}
            style={btnPrimary(allDone2)}
          >
            {computing ? 'Computing...' : allDone2 ? 'See Results' : `Answer all choices (${sel2.filter(s => s !== null).length}/12)`}
          </button>
          <div style={{ height: '48px' }} />
        </>
      )}

      {/* ─── Results ───────────────────────────────────────────────────── */}
      {phase === 'results' && results && (
        <div>
          {/* Behavioral results */}
          <div style={{ ...cardStyle, padding: '28px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '20px', color: '#ededef', marginTop: 0, marginBottom: '16px' }}>Your Behavioral Results</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={[
                { condition: cond1Label, 'P(LL)': parseFloat((results.pLL1 * 100).toFixed(1)) },
                { condition: cond2Label, 'P(LL)': parseFloat((results.pLL2 * 100).toFixed(1)) },
              ]} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(138, 180, 255, 0.08)" />
                <XAxis dataKey="condition" tick={{ fill: '#a1a1aa', fontSize: 13 }} stroke="rgba(138, 180, 255, 0.2)" />
                <YAxis domain={[0, 100]} tick={{ fill: '#a1a1aa', fontSize: 12 }} stroke="rgba(138, 180, 255, 0.2)"
                  label={{ value: '% chose delayed reward', angle: -90, position: 'insideLeft', fill: '#a1a1aa', fontSize: 13 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0a0a0b', border: '1px solid rgba(138, 180, 255, 0.2)', borderRadius: '8px', color: '#ededef' }}
                  formatter={(v) => [`${v}%`, 'Chose delayed reward']} />
                <Bar dataKey="P(LL)" radius={[6, 6, 0, 0]}>
                  <Cell fill="#8ab4ff" />
                  <Cell fill="#0BC743" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div style={{ marginTop: '16px', padding: '16px', borderRadius: '8px', backgroundColor: results.pLL2 > results.pLL1 ? 'rgba(11, 199, 67, 0.08)' : 'rgba(138, 180, 255, 0.06)', border: results.pLL2 > results.pLL1 ? '1px solid rgba(11, 199, 67, 0.2)' : '1px solid rgba(138, 180, 255, 0.15)' }}>
              {results.pLL2 > results.pLL1 ? (
                <p style={{ color: '#0BC743', margin: 0, fontSize: '15px', fontWeight: '500' }}>
                  {experiment === 'stationarity'
                    ? `You chose the delayed reward ${((results.pLL2 - results.pLL1) * 100).toFixed(0)}% more often with longer delays — a stationarity violation! You became more patient when rewards were pushed into the future.`
                    : `You chose the delayed reward ${((results.pLL2 - results.pLL1) * 100).toFixed(0)}% more often with larger rewards — a magnitude effect! You became more patient with bigger stakes.`}
                </p>
              ) : results.pLL2 < results.pLL1 ? (
                <p style={{ color: '#8ab4ff', margin: 0, fontSize: '15px', fontWeight: '500' }}>
                  Interesting — your preferences shifted in the opposite direction of the typical anomaly. You were actually more impatient in the second condition.
                </p>
              ) : (
                <p style={{ color: '#8ab4ff', margin: 0, fontSize: '15px', fontWeight: '500' }}>
                  Your preferences were perfectly consistent across conditions — no anomaly detected! You have textbook rational preferences.
                </p>
              )}
            </div>
          </div>

          {/* Model predictions */}
          <div style={{ ...cardStyle, padding: '28px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '20px', color: '#ededef', marginTop: 0, marginBottom: '8px' }}>Model Predictive Accuracy</h3>
            <p style={{ fontSize: '14px', color: '#6b6b74', marginBottom: '20px' }}>
              How well do models predict your choices within each condition and across conditions?
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(138, 180, 255, 0.15)' }}>
                    <th style={{ textAlign: 'left', padding: '10px 12px', color: '#8ab4ff', fontWeight: '600' }}>Model</th>
                    <th style={{ textAlign: 'center', padding: '10px 12px', color: '#a1a1aa', fontWeight: '500' }}>Within {cond1Label}</th>
                    <th style={{ textAlign: 'center', padding: '10px 12px', color: '#a1a1aa', fontWeight: '500' }}>Within {cond2Label}</th>
                    <th style={{ textAlign: 'center', padding: '10px 12px', color: '#a1a1aa', fontWeight: '500' }}>Train {cond1Label} → Test {cond2Label}</th>
                    <th style={{ textAlign: 'center', padding: '10px 12px', color: '#a1a1aa', fontWeight: '500' }}>Train {cond2Label} → Test {cond1Label}</th>
                  </tr>
                </thead>
                <tbody>
                  {results.modelResults.map((m, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(138, 180, 255, 0.06)' }}>
                      <td style={{ padding: '10px 12px', color: '#ededef', fontWeight: '500' }}>{m.name}</td>
                      <td style={{ textAlign: 'center', padding: '10px 12px', color: '#a1a1aa' }}>{m.within1.toFixed(1)}%</td>
                      <td style={{ textAlign: 'center', padding: '10px 12px', color: '#a1a1aa' }}>{m.within2.toFixed(1)}%</td>
                      <td style={{ textAlign: 'center', padding: '10px 12px', color: m.across12 >= 60 ? '#0BC743' : '#ef4444' }}>{m.across12.toFixed(1)}%</td>
                      <td style={{ textAlign: 'center', padding: '10px 12px', color: m.across21 >= 60 ? '#0BC743' : '#ef4444' }}>{m.across21.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Key insight */}
          <div style={{ ...cardStyle, padding: '28px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '20px', color: '#8ab4ff', marginTop: 0 }}>The Key Insight</h3>
            <p style={{ color: '#a1a1aa', lineHeight: 1.8, fontSize: '15px' }}>
              Even when your preferences shift across conditions — a behavior labeled "irrational" by traditional significance testing — computational models can still predict your choices reasonably well across conditions. The anomaly is <strong style={{ color: '#ededef' }}>statistically real but predictively inconsequential</strong>.
            </p>
            <p style={{ color: '#a1a1aa', lineHeight: 1.8, fontSize: '15px' }}>
              This illustrates a critical distinction in science: <strong style={{ color: '#ededef' }}>explanatory power ≠ predictive power</strong>. A statistically significant effect doesn't automatically mean a model needs to accommodate it to make good predictions. Simpler models (like Exponential with just 2 parameters) often predict just as well as complex ones designed to capture these anomalies.
            </p>
          </div>

          {/* Models explained */}
          <div style={{ ...cardStyle, padding: '28px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '18px', color: '#8ab4ff', marginTop: 0 }}>Models Used</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <h4 style={{ color: '#ededef', margin: '0 0 4px 0', fontSize: '15px' }}>Exponential (Samuelson, 1937)</h4>
                <p style={{ color: '#a1a1aa', fontSize: '14px', margin: 0, lineHeight: 1.6 }}>
                  <span style={{ fontFamily: 'serif', fontStyle: 'italic', color: '#ededef' }}>PV = V&#8320; &middot; e<sup>-kd</sup></span> — Assumes fixed discount rate. 2 parameters. Cannot explain stationarity violations by design, yet predicts them surprisingly well.
                </p>
              </div>
              <div>
                <h4 style={{ color: '#ededef', margin: '0 0 4px 0', fontSize: '15px' }}>Hyperbolic (Mazur, 1987)</h4>
                <p style={{ color: '#a1a1aa', fontSize: '14px', margin: 0, lineHeight: 1.6 }}>
                  <span style={{ fontFamily: 'serif', fontStyle: 'italic', color: '#ededef' }}>PV = V&#8320; / (1 + kd)</span> — Assumes diminishing sensitivity to delay. 2 parameters. Designed to capture stationarity violations.
                </p>
              </div>
              <div>
                <h4 style={{ color: '#ededef', margin: '0 0 4px 0', fontSize: '15px' }}>Difference Model (Loatman & Luhmann, 2017)</h4>
                <p style={{ color: '#a1a1aa', fontSize: '14px', margin: 0, lineHeight: 1.6 }}>
                  <span style={{ fontFamily: 'serif', fontStyle: 'italic', color: '#ededef' }}>P(LL) = logistic(&#946;&#8320; + &#946;&#8321;&#916;x + &#946;&#8322;&#916;t)</span> — Attribute-based approach using raw reward and delay differences. 3 parameters. The simplest and most parsimonious attribute-based model.
                </p>
              </div>
            </div>
          </div>

          <button onClick={() => resetExperiment(experiment === 'stationarity' ? 'magnitude' : 'stationarity')} style={{ ...btnPrimary(true), marginBottom: '32px', width: 'auto', padding: '12px 32px' }}>
            Try {experiment === 'stationarity' ? 'Magnitude Effect' : 'Stationarity Violations'} Experiment &rarr;
          </button>
        </div>
      )}
    </div>
  );
};

export default ChoiceAnomalies;
