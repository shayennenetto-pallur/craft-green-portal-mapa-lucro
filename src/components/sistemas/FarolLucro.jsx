import { useState } from 'react';
import { callClaude } from '../../utils/api';

const PILARES = [
  { letter: 'L', title: 'Liderança', sub: 'Gestão de pessoas e time' },
  { letter: 'U', title: 'Uniformidade', sub: 'Processos e operações' },
  { letter: 'C', title: 'Cultura', sub: 'Identidade e valores' },
  { letter: 'R', title: 'Rituais', sub: 'Reuniões e rotinas' },
  { letter: 'O', title: 'Orçamento', sub: 'Gestão financeira' },
];

export default function FarolLucro({ apiKey }) {
  const [inputs, setInputs] = useState({ L: '', U: '', C: '', R: '', O: '' });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (letter, val) => setInputs({ ...inputs, [letter]: val });

  const handleSubmit = async () => {
    if (!apiKey) return alert('Insira sua API Key no campo do header.');
    setLoading(true);
    setResult('');
    const prompt = `Especialista no framework L.U.C.R.O. Para cada pilar abaixo, gere: STATUS (🔴🟡🟢), DIAGNÓSTICO em 2 linhas, META SMART 30 dias, AÇÃO IMEDIATA. Finalize com PRIORIDADE GERAL. Direto e estratégico.

L — Liderança: ${inputs.L}
U — Uniformidade: ${inputs.U}
C — Cultura: ${inputs.C}
R — Rituais: ${inputs.R}
O — Orçamento: ${inputs.O}`;

    const res = await callClaude(apiKey, prompt);
    setResult(res);
    setLoading(false);
  };

  return (
    <div>
      <div className="system-header">
        <div className="pilar-badge">L — Liderança</div>
        <h1 className="system-title">Farol do L.U.C.R.O.</h1>
        <p className="system-subtitle">Diagnóstico estratégico de todos os 5 pilares da sua empresa.</p>
      </div>

      {!apiKey && (
        <div className="no-api-warning">
          Insira sua <span>API Key Anthropic</span> no campo superior direito para usar a IA.
        </div>
      )}

      <div className="farol-grid">
        {PILARES.map((p) => (
          <div key={p.letter} className="farol-card">
            <div className="farol-card-header">
              <div className="farol-letter">{p.letter}</div>
              <div>
                <div className="farol-title">{p.title}</div>
                <div className="farol-sub">{p.sub}</div>
              </div>
            </div>
            <textarea
              className="form-textarea"
              style={{ width: '100%', minHeight: 90 }}
              placeholder={`Descreva a situação atual de ${p.title}...`}
              value={inputs[p.letter]}
              onChange={(e) => handleChange(p.letter, e.target.value)}
            />
          </div>
        ))}
      </div>

      <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
        {loading ? 'Gerando Farol...' : 'Gerar Diagnóstico Completo'}
      </button>

      {loading && (
        <div className="loading-indicator">
          <div className="dot-pulse"><span/><span/><span/></div>
          Analisando os 5 pilares...
        </div>
      )}

      {result && <div className="result-box">{result}</div>}
    </div>
  );
}
