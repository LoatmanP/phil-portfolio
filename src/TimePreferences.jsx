import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// ─── Trial data ───────────────────────────────────────────────────────────────
const TRIALS = [
  { id: 1,  ssr: 15, ssd: 0, llr: 64,  lld: 40  },
  { id: 2,  ssr: 40, ssd: 0, llr: 67,  lld: 55  },
  { id: 3,  ssr: 12, ssd: 0, llr: 28,  lld: 60  },
  { id: 4,  ssr: 10, ssd: 0, llr: 95,  lld: 35  },
  { id: 5,  ssr: 30, ssd: 0, llr: 75,  lld: 92  },
  { id: 6,  ssr: 32, ssd: 0, llr: 47,  lld: 75  },
  { id: 7,  ssr: 25, ssd: 0, llr: 58,  lld: 55  },
  { id: 8,  ssr: 47, ssd: 0, llr: 58,  lld: 80  },
  { id: 9,  ssr: 34, ssd: 0, llr: 35,  lld: 73  },
  { id: 10, ssr: 15, ssd: 0, llr: 43,  lld: 44  },
  { id: 11, ssr: 22, ssd: 0, llr: 120, lld: 38  },
  { id: 12, ssr: 20, ssd: 0, llr: 26,  lld: 45  },
  { id: 13, ssr: 27, ssd: 0, llr: 29,  lld: 65  },
  { id: 14, ssr: 35, ssd: 0, llr: 55,  lld: 70  },
  { id: 15, ssr: 20, ssd: 0, llr: 62,  lld: 55  },
  { id: 16, ssr: 50, ssd: 0, llr: 98,  lld: 100 },
  { id: 17, ssr: 25, ssd: 0, llr: 30,  lld: 65  },
  { id: 18, ssr: 67, ssd: 0, llr: 88,  lld: 65  },
  { id: 19, ssr: 10, ssd: 0, llr: 89,  lld: 37  },
  { id: 20, ssr: 40, ssd: 0, llr: 48,  lld: 58  },
  { id: 21, ssr: 20, ssd: 0, llr: 65,  lld: 78  },
  { id: 22, ssr: 32, ssd: 0, llr: 93,  lld: 50  },
  { id: 23, ssr: 24, ssd: 0, llr: 68,  lld: 45  },
  { id: 24, ssr: 83, ssd: 0, llr: 86,  lld: 65  },
];

// ─── Utility math ─────────────────────────────────────────────────────────────
function buildX(trials) {
  return trials.map(t => [t.id, t.ssr, t.ssd, t.llr, t.lld]);
}

function clip(val, lo, hi) {
  return Math.max(lo, Math.min(hi, val));
}

function average(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// ─── Exponential discount model ───────────────────────────────────────────────
function exponentialChoice(X, params) {
  const discRate = Math.exp(params[0]);
  const rho = params[1];
  return X.map(row => {
    const ssVal = row[1];
    const llVal = row[3] * Math.exp(-discRate * row[4]);
    return 1.0 / (1.0 + Math.exp(-rho * (llVal - ssVal)));
  });
}

function exponentialSSE(params, X, y) {
  if (params[0] < -7.3 || params[0] > -0.01 || params[1] <= 0) return 1e20;
  const yhat = exponentialChoice(X, params);
  const boundary = 1e-8;
  let sse = 0;
  for (let i = 0; i < y.length; i++) {
    const yh = clip(yhat[i], boundary, 1 - boundary);
    const a = -y[i] * Math.log(yh);
    const b = (1 - y[i]) * Math.log(1 - yh);
    sse += Math.pow(a - b, 2);
  }
  return sse;
}

function fitExponential(X, y) {
  let bestParams = [-5, 0.01];
  let bestSSE = Infinity;
  for (let dr = -8; dr < 0.01; dr += 0.1) {
    for (let rho = 0; rho < 1.1; rho += 0.1) {
      const sse = exponentialSSE([dr, rho], X, y);
      if (sse < bestSSE) { bestSSE = sse; bestParams = [dr, rho]; }
    }
  }
  return bestParams;
}

// ─── Hyperbolic discount model ────────────────────────────────────────────────
function hyperbolicChoice(X, params) {
  const discRate = Math.exp(params[0]);
  const rho = params[1];
  return X.map(row => {
    const ssVal = row[1];
    const llVal = row[3] * (1 / (1 + discRate * row[4]));
    return 1.0 / (1.0 + Math.exp(-rho * (llVal - ssVal)));
  });
}

function hyperbolicSSE(params, X, y) {
  if (params[0] < -7.3 || params[0] > -0.01 || params[1] < 0 || params[1] > 2) return 1e13;
  const yhat = hyperbolicChoice(X, params);
  const boundary = 1e-8;
  let sse = 0;
  for (let i = 0; i < y.length; i++) {
    const yh = clip(yhat[i], boundary, 1 - boundary);
    const a = -y[i] * Math.log(yh);
    const b = (1 - y[i]) * Math.log(1 - yh);
    sse += Math.pow(a - b, 2);
  }
  return sse;
}

function fitHyperbolic(X, y) {
  let bestParams = [-5, 0.01];
  let bestSSE = Infinity;
  for (let dr = -8; dr < 0.01; dr += 0.1) {
    for (let rho = 0; rho < 2; rho += 0.1) {
      const sse = hyperbolicSSE([dr, rho], X, y);
      if (sse < bestSSE) { bestSSE = sse; bestParams = [dr, rho]; }
    }
  }
  return bestParams;
}

// ─── K-Fold cross-validation ──────────────────────────────────────────────────
function kFoldSplit(n, k) {
  const foldSize = Math.floor(n / k);
  const folds = [];
  for (let i = 0; i < k; i++) {
    const testStart = i * foldSize;
    const testEnd = i === k - 1 ? n : (i + 1) * foldSize;
    const testIdx = [];
    const trainIdx = [];
    for (let j = 0; j < n; j++) {
      if (j >= testStart && j < testEnd) testIdx.push(j);
      else trainIdx.push(j);
    }
    folds.push({ train: trainIdx, test: testIdx });
  }
  return folds;
}

function subset(arr, indices) {
  return indices.map(i => arr[i]);
}

function runModel(modelType, choices) {
  const X = buildX(TRIALS);
  const y = choices; // 0 = SS (today), 1 = LL (delayed)

  const folds = kFoldSplit(24, 10);
  const accuracyList = [];
  const discList = [];
  let lastParams = null;

  const fitFn = modelType === 'Exponential' ? fitExponential : fitHyperbolic;
  const choiceFn = modelType === 'Exponential' ? exponentialChoice : hyperbolicChoice;

  for (const fold of folds) {
    const XTrain = subset(X, fold.train);
    const yTrain = subset(y, fold.train);
    const XTest = subset(X, fold.test);
    const yTest = subset(y, fold.test);

    const params = fitFn(XTrain, yTrain);
    lastParams = params;
    discList.push(params[0]);

    const preds = choiceFn(XTest, params).map(p => Math.round(p));
    let correct = 0;
    for (let i = 0; i < yTest.length; i++) {
      if (preds[i] === yTest[i]) correct++;
    }
    accuracyList.push(correct / yTest.length);
  }

  const avgDisc = average(discList);
  const discountRate = Math.exp(avgDisc);
  const avgAccuracy = average(accuracyList);

  // Build present-value curve for $100 over 100 days
  const pvData = [];
  for (let d = 0; d <= 100; d++) {
    let pv;
    if (modelType === 'Exponential') {
      pv = 100 * Math.exp(-discountRate * d);
    } else {
      pv = 100 * (1 / (1 + discountRate * d));
    }
    pvData.push({ days: d, presentValue: parseFloat(pv.toFixed(2)) });
  }

  // Indifference point: how many days until $200 delayed = $100 today
  let indifferentDays;
  if (modelType === 'Exponential') {
    indifferentDays = Math.round(Math.log(100 / 200) / discountRate * -1);
  } else {
    indifferentDays = Math.round((200 - 100) / (discountRate * 200));
  }
  if (indifferentDays < 1) indifferentDays = 1;

  // Build indifference curve: PV of $200 offered at indifferentDays, shown from future to present
  const indiffData = [];
  for (let d = 0; d < indifferentDays; d++) {
    let pv;
    if (modelType === 'Exponential') {
      pv = 200 * Math.exp(-discountRate * d);
    } else {
      pv = 200 * (1 / (1 + discountRate * d));
    }
    indiffData.push({ futureDays: indifferentDays - d, presentValue: parseFloat(pv.toFixed(2)) });
  }

  return { discountRate, avgAccuracy, pvData, indiffData, indifferentDays };
}

// ─── Component ────────────────────────────────────────────────────────────────
const TimePreferences = ({ onBack }) => {
  const [modelType, setModelType] = useState('Exponential');
  const [selections, setSelections] = useState(Array(24).fill(null));
  const [results, setResults] = useState(null);
  const [computing, setComputing] = useState(false);

  const handleSelect = (trialIndex, value) => {
    const next = [...selections];
    next[trialIndex] = value;
    setSelections(next);
  };

  const allAnswered = selections.every(s => s !== null);

  const handleSubmit = () => {
    if (!allAnswered) return;
    setComputing(true);
    // Use setTimeout so the UI can show "Computing..." before the blocking loop runs
    setTimeout(() => {
      const result = runModel(modelType, selections);
      setResults(result);
      setComputing(false);
    }, 50);
  };

  const accuracyDescription = (acc) => {
    const pct = acc * 100;
    if (pct > 80) return `Your intertemporal preferences are well-described by the ${modelType} Discounting model`;
    if (pct > 60) return `Your intertemporal preferences are moderately described by the ${modelType} Discounting model`;
    return `Your intertemporal preferences are poorly described by the ${modelType} Discounting model`;
  };

  const cardStyle = {
    padding: '20px',
    borderRadius: '12px',
    backgroundColor: 'rgba(212, 165, 116, 0.03)',
    border: '1px solid rgba(212, 165, 116, 0.08)',
  };

  const radioLabelStyle = (selected) => ({
    display: 'block',
    padding: '10px 14px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: selected ? '600' : '400',
    color: selected ? '#e8e6e3' : '#9ca3af',
    backgroundColor: selected ? 'rgba(212, 165, 116, 0.15)' : 'rgba(212, 165, 116, 0.03)',
    border: selected ? '1px solid rgba(212, 165, 116, 0.4)' : '1px solid rgba(212, 165, 116, 0.08)',
    transition: 'all 0.2s ease',
    marginBottom: '6px',
  });

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: '1px solid rgba(212, 165, 116, 0.2)',
            borderRadius: '8px',
            color: '#d4a574',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontFamily: 'inherit',
          }}
        >
          &larr; Back to Projects
        </button>
      </div>

      <h2 style={{ fontSize: '28px', fontWeight: '700', color: '#e8e6e3', margin: '0 0 8px 0' }}>
        Time Preferences: Discount Rate Estimator
      </h2>
      <p style={{ fontSize: '15px', color: '#9ca3af', lineHeight: 1.7, marginBottom: '32px' }}>
        Select intertemporal choices below and each model will estimate your discounting rate and predict your choices.
      </p>

      {/* Model selector */}
      <div style={{ marginBottom: '32px' }}>
        <label style={{ fontSize: '13px', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', color: '#6b7280', display: 'block', marginBottom: '10px' }}>
          Select Intertemporal Choice Model
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['Exponential', 'Hyperbolic'].map(m => (
            <button
              key={m}
              onClick={() => { setModelType(m); setResults(null); }}
              style={{
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: '500',
                color: modelType === m ? '#e8e6e3' : '#6b7280',
                backgroundColor: modelType === m ? 'rgba(212, 165, 116, 0.15)' : 'transparent',
                border: modelType === m ? '1px solid rgba(212, 165, 116, 0.3)' : '1px solid rgba(212, 165, 116, 0.1)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.2s ease',
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Choices heading */}
      <div style={{
        padding: '12px 20px',
        borderRadius: '8px',
        backgroundColor: 'rgba(11, 199, 67, 0.08)',
        border: '1px solid rgba(11, 199, 67, 0.2)',
        marginBottom: '24px',
        fontSize: '15px',
        color: '#0BC743',
        fontWeight: '500',
      }}>
        Which reward do you prefer?
      </div>

      {/* Trial grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '32px',
      }}>
        {TRIALS.map((trial, idx) => (
          <div key={trial.id} style={cardStyle}>
            <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '10px', fontWeight: '600', letterSpacing: '1px' }}>
              CHOICE {trial.id}
            </div>
            <label style={radioLabelStyle(selections[idx] === 0)}>
              <input
                type="radio"
                name={`trial-${trial.id}`}
                checked={selections[idx] === 0}
                onChange={() => handleSelect(idx, 0)}
                style={{ display: 'none' }}
              />
              ${trial.ssr} today
            </label>
            <label style={radioLabelStyle(selections[idx] === 1)}>
              <input
                type="radio"
                name={`trial-${trial.id}`}
                checked={selections[idx] === 1}
                onChange={() => handleSelect(idx, 1)}
                style={{ display: 'none' }}
              />
              ${trial.llr} in {trial.lld} days
            </label>
          </div>
        ))}
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!allAnswered || computing}
        style={{
          padding: '14px 40px',
          fontSize: '16px',
          fontWeight: '600',
          color: allAnswered ? '#1a2f2d' : '#6b7280',
          backgroundColor: allAnswered ? '#d4a574' : 'rgba(212, 165, 116, 0.1)',
          border: 'none',
          borderRadius: '10px',
          cursor: allAnswered ? 'pointer' : 'not-allowed',
          fontFamily: 'inherit',
          transition: 'all 0.2s ease',
          marginBottom: '48px',
          width: '100%',
        }}
      >
        {computing ? 'Computing...' : allAnswered ? 'Submit Your Choices' : `Answer all 24 choices (${selections.filter(s => s !== null).length}/24)`}
      </button>

      {/* ─── Results ─────────────────────────────────────────────────────── */}
      {results && (
        <div>
          {/* Discount rate */}
          <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#e8e6e3', marginBottom: '8px' }}>
            {modelType} Discount Rate: {results.discountRate.toFixed(4)}
          </h3>
          <p style={{ fontSize: '16px', color: '#9ca3af', lineHeight: 1.7, marginBottom: '40px' }}>
            According to your intertemporal preferences, cash loses <span style={{ color: '#d4a574', fontWeight: '600' }}>{(results.discountRate * 100).toFixed(4)}%</span> of its value every additional day into the future.
          </p>

          {/* PV chart */}
          <div style={{ ...cardStyle, marginBottom: '32px', padding: '28px' }}>
            <h4 style={{ fontSize: '18px', color: '#e8e6e3', marginTop: 0, marginBottom: '20px' }}>
              {modelType} Discounted Value of $100
            </h4>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={results.pvData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 165, 116, 0.08)" />
                <XAxis
                  dataKey="days"
                  label={{ value: 'Days', position: 'insideBottomRight', offset: -5, fill: '#9ca3af' }}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  stroke="rgba(212, 165, 116, 0.2)"
                />
                <YAxis
                  label={{ value: 'Present Value ($)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  stroke="rgba(212, 165, 116, 0.2)"
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a2f2d', border: '1px solid rgba(212, 165, 116, 0.2)', borderRadius: '8px', color: '#e8e6e3' }}
                  formatter={(value) => [`$${value}`, 'Present Value']}
                  labelFormatter={(label) => `Day ${label}`}
                />
                <Line type="monotone" dataKey="presentValue" stroke="#0BC743" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Model description */}
          <div style={{ ...cardStyle, marginBottom: '32px', padding: '28px' }}>
            {modelType === 'Exponential' ? (
              <>
                <h4 style={{ fontSize: '18px', color: '#d4a574', marginTop: 0 }}>Exponential Discounting Model</h4>
                <p style={{ color: '#9ca3af', lineHeight: 1.7, fontSize: '15px', marginBottom: '12px' }}>
                  <span style={{ fontFamily: 'serif', fontStyle: 'italic', color: '#e8e6e3', fontSize: '17px' }}>
                    PV = V&#8320; &middot; e<sup>-kd</sup>
                  </span>
                </p>
                <p style={{ color: '#9ca3af', lineHeight: 1.7, fontSize: '15px', margin: 0 }}>
                  First introduced by Paul Samuelson in the 1930s, the exponential discounting model represents a decision-maker who has dynamically consistent intertemporal preferences, indicating that preferences do not change as they move through time, which prevents the decision-maker from being arbitraged.
                </p>
              </>
            ) : (
              <>
                <h4 style={{ fontSize: '18px', color: '#d4a574', marginTop: 0 }}>Hyperbolic Discounting Model</h4>
                <p style={{ color: '#9ca3af', lineHeight: 1.7, fontSize: '15px', marginBottom: '12px' }}>
                  <span style={{ fontFamily: 'serif', fontStyle: 'italic', color: '#e8e6e3', fontSize: '17px' }}>
                    PV = V&#8320; &middot; 1 / (1 + kd)
                  </span>
                </p>
                <p style={{ color: '#9ca3af', lineHeight: 1.7, fontSize: '15px', margin: 0 }}>
                  Unlike the exponential discounting model, the Hyperbolic Discounting Model represents a decision-maker whose preferences can be dynamically inconsistent, in which rewards become disproportionately more valuable as they become closer to present time.
                </p>
              </>
            )}
          </div>

          {/* Indifference */}
          <div style={{ ...cardStyle, marginBottom: '32px', padding: '28px' }}>
            <p style={{ fontSize: '16px', color: '#e8e6e3', lineHeight: 1.7, margin: '0 0 20px 0' }}>
              With your {modelType} discount rate of <span style={{ color: '#d4a574', fontWeight: '600' }}>{results.discountRate.toFixed(4)}</span>, you would be indifferent to receiving $100 today and $200 in <span style={{ color: '#d4a574', fontWeight: '600' }}>{results.indifferentDays} days</span>.
            </p>
            <h4 style={{ fontSize: '16px', color: '#e8e6e3', marginTop: 0, marginBottom: '20px' }}>
              The Present Value of $200 Offered in {results.indifferentDays} Days is $100
            </h4>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={results.indiffData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(212, 165, 116, 0.08)" />
                <XAxis
                  dataKey="futureDays"
                  label={{ value: 'Future Days', position: 'insideBottomRight', offset: -5, fill: '#9ca3af' }}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  stroke="rgba(212, 165, 116, 0.2)"
                />
                <YAxis
                  label={{ value: 'Present Value ($)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  stroke="rgba(212, 165, 116, 0.2)"
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a2f2d', border: '1px solid rgba(212, 165, 116, 0.2)', borderRadius: '8px', color: '#e8e6e3' }}
                  formatter={(value) => [`$${value}`, 'Present Value']}
                  labelFormatter={(label) => `${label} days away`}
                />
                <Line type="monotone" dataKey="presentValue" stroke="#0BC743" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Accuracy */}
          <div style={{
            padding: '28px',
            borderRadius: '12px',
            backgroundColor: 'rgba(11, 199, 67, 0.05)',
            border: '1px solid rgba(11, 199, 67, 0.15)',
            marginBottom: '32px',
            textAlign: 'center',
          }}>
            <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#e8e6e3', margin: '0 0 8px 0' }}>
              Percentage of choices predicted correctly: {(results.avgAccuracy * 100).toFixed(2)}%
            </h3>
            <p style={{ fontSize: '16px', color: '#9ca3af', margin: 0 }}>
              {accuracyDescription(results.avgAccuracy)}
            </p>
          </div>

          {modelType === 'Exponential' && (
            <p style={{ fontSize: '15px', color: '#9ca3af', lineHeight: 1.7 }}>
              Exponential decision makers have <em>dynamically consistent</em> preferences, meaning preferences for choices will not change as those choice items move through time.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default TimePreferences;
