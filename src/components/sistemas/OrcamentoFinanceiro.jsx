import { useState } from 'react';
import { callClaude } from '../../utils/api';

export default function OrcamentoFinanceiro({ apiKey }) {
  const [form, setForm] = useState({ faturamento: '', fixos: '', variaveis: '', clareza: '', dor: '' });
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    if (!apiKey) return alert('Insira sua API Key no campo do header.');
    setLoading(true);
    setResult('');
    const prompt = `Especialista em gestão financeira para empresas digitais. Linguagem clara e encorajadora. Com base nos dados abaixo, gere:
1) DIAGNÓSTICO FINANCEIRO da situação atual.
2) DRE SIMPLIFICADA (Receita, Custos, Margem).
3) FLUXO DE CAIXA mensal estimado.
4) MARGEM ESTIMADA com análise.
5) 3 AÇÕES IMEDIATAS para melhorar a saúde financeira.
6) PRÓXIMO PASSO prioritário.
Direto e encorajador.

Faturamento mensal: ${form.faturamento}
Custos fixos: ${form.fixos}
Custos variáveis: ${form.variaveis}
Clareza sobre margem: ${form.clareza}
Maior dor financeira: ${form.dor}`;

    const res = await callClaude(apiKey, prompt);
    setResult(res);
    setLoading(false);
  };

  return (
    <div>
      <div className="system-header">
        <div className="pilar-badge">O — Orçamento</div>
        <h1 className="system-title">Onboarding Financeiro</h1>
        <p className="system-subtitle">Diagnóstico financeiro completo com DRE, fluxo de caixa e ações imediatas.</p>
      </div>

      {!apiKey && (
        <div className="no-api-warning">
          Insira sua <span>API Key Anthropic</span> no campo superior direito para usar a IA.
        </div>
      )}

      <div className="card" style={{ maxWidth: 640 }}>
        <div className="form-group">
          <label className="form-label">Faturamento mensal</label>
          <input className="form-input" name="faturamento" placeholder="Ex: R$ 120.000/mês" value={form.faturamento} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Custos fixos</label>
          <textarea className="form-textarea" name="fixos" placeholder="Ex: Salários R$ 40k, aluguel R$ 5k, ferramentas R$ 3k..." value={form.fixos} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Custos variáveis</label>
          <textarea className="form-textarea" name="variaveis" placeholder="Ex: Mídia paga R$ 15k, freelancers variáveis..." value={form.variaveis} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Clareza sobre margem</label>
          <input className="form-input" name="clareza" placeholder="Ex: Sei que tenho margem mas nunca calculei direito" value={form.clareza} onChange={handleChange} />
        </div>
        <div className="form-group">
          <label className="form-label">Maior dor financeira</label>
          <textarea className="form-textarea" name="dor" placeholder="Ex: O caixa sempre aperta no final do mês, não sei quanto posso retirar..." value={form.dor} onChange={handleChange} />
        </div>
        <button className="btn-primary" onClick={handleSubmit} disabled={loading || !form.faturamento}>
          {loading ? 'Analisando...' : 'Gerar Diagnóstico Financeiro'}
        </button>
      </div>

      {loading && (
        <div className="loading-indicator">
          <div className="dot-pulse"><span/><span/><span/></div>
          Analisando suas finanças...
        </div>
      )}

      {result && <div className="result-box">{result}</div>}
    </div>
  );
}
