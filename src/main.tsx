import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { calculate, format } from './calculator';
import { example } from './example';
import './style.css';

const storageKey = 'factorio-scratchpad.notes.v1';
function readNotes() {
  try { return localStorage.getItem(storageKey) ?? example; }
  catch { return example; }
}
function App() {
  const [notes, setNotes] = useState(readNotes);
  const [saved, setSaved] = useState(false);
  const rows = calculate(notes);
  const count = rows.filter(row => row.value !== undefined).length;
  useEffect(() => {
    try { localStorage.setItem(storageKey, notes); setSaved(true); }
    catch { setSaved(false); }
  }, [notes]);
  function download() {
    const url = URL.createObjectURL(new Blob([notes], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'factorio-scratchpad.txt';
    link.click();
    URL.revokeObjectURL(url);
  }
  return <main>
    <header>
      <div className="brand"><span className="mark" aria-hidden="true">ƒ</span><div><h1>Factorio <span>Scratchpad</span></h1><p>A little space to work out the ratios.</p></div></div>
      <button onClick={download}>Download notes <span aria-hidden="true">↓</span></button>
    </header>
    <div className="instruction">Write your thinking. End a formula with <code>=</code> to calculate it.<details><summary>Syntax guide</summary><div className="guide"><p><code>90 - 25 =</code> → 65</p><p><code>refineries = 10 =</code> defines a named value. Use it below: <code>refineries * 2 =</code></p><p>Add a reading label: <code>coal [items/s] = 20 =</code> → 20 items/s. Reference it as <code>coal</code> in formulas. Labels do not convert or carry over to other calculations.</p><p>Use <code>+ - * / ^</code>, parentheses, and percentages (<code>20% =</code> → 0.2). Functions: <code>ceil, floor, round, min, max, abs, sqrt</code>.</p><p>Names are case-sensitive, use letters, numbers and underscores, and must be defined above use. Other lines are plain notes. Results display up to 10 significant digits; calculations retain full precision.</p></div></details></div>
    <section className="sheet" aria-label="Calculation scratchpad">
      <div className="column notes"><div className="column-heading"><label htmlFor="notes">01 <strong>Your notes</strong></label><span>EDIT HERE</span></div><textarea id="notes" aria-label="Your notes and formulas" spellCheck={false} autoCapitalize="off" autoCorrect="off" value={notes} onChange={event => setNotes(event.target.value)} style={{ minHeight: `${Math.max(rows.length, 18) * 28 + 48}px` }} /></div>
      <div className="column results"><div className="column-heading"><h2>02 <strong>Live results</strong></h2><span className="live">{count} CALCULATED</span></div><div className="output" aria-label="Calculated notes">{rows.map((row, index) => <div className={`result-line ${row.value !== undefined ? 'calculated' : ''} ${row.error ? 'invalid' : ''}`} key={index}><span className="source">{row.source || '\u00a0'}</span>{row.value !== undefined ? <strong className="answer">{format(row.value)}{row.unit ? <span className="unit"> {row.unit}</span> : null}</strong> : null}{row.error ? <span className="error">{row.error}</span> : null}</div>)}</div></div>
    </section>
    <footer><span role="status"><span className={`dot ${saved ? '' : 'unsaved'}`} />{saved ? 'Saved in this browser' : 'Not saved · download to keep your notes'}</span><span>One line at a time. The factory grows.</span></footer>
  </main>;
}
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
