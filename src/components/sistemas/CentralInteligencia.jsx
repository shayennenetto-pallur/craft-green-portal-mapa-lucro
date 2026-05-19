import { useState } from 'react';
import { callClaude } from '../../utils/api';

export default function CentralInteligencia({ apiKey }) {
  const [form, setForm] = useState({ areas: '', processos: '', travamentos: '', time: '' });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!apiKey) return alert('Insira sua API Key no campo do header.');
    setLoading(true);
    setResult('');
    const prompt = `Especialista em processos e operações digitais. Analise a empresa abaixo e gere:
1) INVENTÁRIO POR ÁREA.
2) DIAGNÓSTICO DE GAPS (✅❌⚠).
3) FILA DE 5 MDTs priorizados com responsável e prazo.
4) PRÓXIMO PASSO.
Operacional e direto.

Áreas da empresa: ${form.areas}
Processos existentes: ${form.processos}
Onde a empresa trava: ${form.travamentos}
Tamanho do time: ${form.time}`;

    const res = await callClaude(apiKey, prompt);
    setResult(res);
    setLoading(false);
  };

  return (
    <div>
      <div className="system-header">
        <div className="pilar-badge">U — Uniformidade</div>
        <h1 className="system-title">Central de Inteligência</h1>
        <p className="system-subtitle">Mapeie processos, identifique gaps e priorize MDTs.</p>
      </div>

      {!apiKey && (
        <div className="no-api-warning">
          Insira sua <span>API Key Anthropic</span> no campo superior direito para usar a IA.
        </div>
      )}

      <div className="card" style={{ maxWidth: 640 }}>
        <div className="form-group">
          <label className="form-label">Áreas da empresa</label>
          <textarea className="form-textarea" name="areas" placeholder="Ex: Comercial, Marketing, Operações, Financeiro, RH..." value={form.areas} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Processos existentes</label>
          <textarea className="form-textarea" name="processos" placeholder="Ex: Temos um processo de onboarding de clientes, mas só existe na cabeça do time..." value={form.processos} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Onde a empresa trava</label>
          <textarea className="form-textarea" name="travamentos" placeholder="Ex: Todo mês retrabalho no fechamento financeiro, entregas atrasadas no operacional..." value={form.travamentos} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Tamanho do time</label>
          <input className="form-input" name="time" placeholder="Ex: 8 pessoas, sendo 2 líderes" value={form.time} onChange={handleChange} />
        </div>
        <button className="btn-primary" onClick={handleSubmit} disabled={loading || !form.areas}>
          {loading ? 'Analisando...' : 'Gerar Diagnóstico de Processos'}
        </button>
      </div>

      {loading && (
        <div className="loading-indicator">
          <div className="dot-pulse"><span/><span/><span/></div>
          Mapeando processos...
        </div>
      )}

      {result && <div className="result-box">{result}</div>}
    </div>
  );
}
