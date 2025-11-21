import React, {useState, useEffect} from 'react';

export default function App(){
  const [form, setForm] = useState({Age:30, Sex:"F", Hemoglobin:12.5, Hematocrit:36, RBC:4.2, MCV:90, MCH:27, MCHC:30, WBC:7.0, Platelets:250});
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const handleChange = (e)=> setForm({...form, [e.target.name]: e.target.value});

  const submit = async()=>{
    const res = await fetch('http://localhost:8000/api/check-anemia', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(form)});
    const data = await res.json();
    setResult(data);
    fetchHistory();
  };

  const fetchHistory = async ()=> {
    const res = await fetch('http://localhost:8000/api/history');
    const h = await res.json();
    setHistory(h);
  };

  useEffect(()=>{ fetchHistory(); }, []);

  return (<div style={{padding:20}}>
    <h2>Anemia Checker (CBC)</h2>
    <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
      {Object.keys(form).map(k=>(
        <div key={k}>
          <label>{k}</label>
          <input name={k} value={form[k]} onChange={handleChange} />
        </div>
      ))}
    </div>
    <button onClick={submit}>Check</button>
    {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    <h3>History</h3>
    <pre>{JSON.stringify(history, null, 2)}</pre>
  </div>);
}
