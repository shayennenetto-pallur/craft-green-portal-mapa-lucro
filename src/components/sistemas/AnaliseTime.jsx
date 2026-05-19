import { useState } from 'react';
import { callClaude } from '../../utils/api';

export default function AnaliseTime({ apiKey }) {
  const [form, setForm] = useState({ nome: '', cargo: '', performance: '', potencial: '', comportamentos: '' });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!apiKey) return alert('Insira sua API Key no campo do header.');
    setLoading(true);
    setResult('');
    const prompt = `Especialista em desenvolvimento de pessoas. Analise o colaborador abaixo e gere:
1) CLASSIFICAÇÃO NINE BOX com justificativa.
2) DIAGNÓSTICO: 3 pontos fortes e 2 de desenvolvimento.
3) PDI com 3 ações (o que fazer, como, prazo).
4) PRÓXIMO PASSO IMEDIATO.
Direto e prático.

Nome: ${form.nome}
Cargo: ${form.cargo}
Performance atual: ${form.performance}
Potencial: ${form.potencial}
Comportamentos observados: ${form.comportamentos}`;

    const res = await callClaude(apiKey, prompt);
    setResult(res);
    setLoading(false);
  };

  return (
    <div>
      <div className="system-header">
        <div className="pilar-badge">L — Liderança</div>
        <h1 className="system-title">Análise de Time</h1>
        <p className="system-subtitle">Mapeie seu time com Nine Box e gere PDIs personalizados.</p>
      </div>

      {!apiKey && (
        <div className="no-api-warning">
          Insira sua <span>API Key Anthropic</span> no campo superior direito para usar a IA.
        </div>
      )}

      <div className="card" style={{ maxWidth: 640 }}>
        <div className="form-group">
          <label className="form-label">Nome do colaborador</label>
          <input className="form-input" name="nome" placeholder="Ex: Maria Silva" value={form.nome} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Cargo</label>
          <input className="form-input" name="cargo" placeholder="Ex: Gerente de Marketing" value={form.cargo} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Performance atual</label>
          <input className="form-input" name="performance" placeholder="Ex: Entrega resultados acima da meta em 80% dos projetos" value={form.performance} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Potencial percebido</label>
          <input className="form-input" name="potencial" placeholder="Ex: Alta capacidade de liderança, absorve novos desafios rapidamente" value={form.potencial} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Comportamentos observados</label>
          <textarea className="form-textarea" name="comportamentos" placeholder="Ex: Proativa, comunica bem, às vezes sobrecarrega a equipe por não delegar..." value={form.comportamentos} onChange={handleChange} />
        </div>
        <button className="btn-primary" onClick={handleSubmit} disabled={loading || !form.nome}>
          {loading ? 'Analisando...' : 'Gerar Análise com IA'}
        </button>
      </div>

      {loading && (
        <div className="loading-indicator">
          <div className="dot-pulse"><span/><span/><span/></div>
          Gerando análise...
        </div>
      )}

      {result && <div className="result-box">{result}</div>}
    </div>
  );
}
