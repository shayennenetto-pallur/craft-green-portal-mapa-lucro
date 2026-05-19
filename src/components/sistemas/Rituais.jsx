import { useState } from 'react';
import { callClaude } from '../../utils/api';

export default function Rituais({ apiKey }) {
  const [tab, setTab] = useState('calendario');
  const [form1, setForm1] = useState({ reunioes: '', estrutura: '' });
  const [form2, setForm2] = useState({ transcricao: '' });
  const [result1, setResult1] = useState('');
  const [result2, setResult2] = useState('');
  const [loading1, setLoading1] = useState(false);
  const [loading2, setLoading2] = useState(false);

  const handleSubmit1 = async () => {
    if (!apiKey) return alert('Insira sua API Key no campo do header.');
    setLoading1(true);
    setResult1('');
    const prompt = `Especialista em rituais e gestão de times. Com base nas informações abaixo, gere:
1) CALENDÁRIO SEMANAL/MENSAL DE RITUAIS com frequência e duração.
2) PAUTA MODELO para cada reunião.
3) GUIA DO FACILITADOR: como conduzir cada reunião.
Prático e direto.

Reuniões atuais: ${form1.reunioes}
Estrutura do time: ${form1.estrutura}`;
    const res = await callClaude(apiKey, prompt);
    setResult1(res);
    setLoading1(false);
  };

  const handleSubmit2 = async () => {
    if (!apiKey) return alert('Insira sua API Key no campo do header.');
    setLoading2(true);
    setResult2('');
    const prompt = `Especialista em gestão de reuniões. Com base na transcrição abaixo, gere:
1) ATA ESTRUTURADA: decisões, responsáveis, prazos.
2) LISTA DE TAREFAS com dono e data.
3) SUGESTÃO DE PAUTA para a próxima reunião.
Organizado e objetivo.

Transcrição: ${form2.transcricao}`;
    const res = await callClaude(apiKey, prompt);
    setResult2(res);
    setLoading2(false);
  };

  return (
    <div>
      <div className="system-header">
        <div className="pilar-badge">R — Rituais</div>
        <h1 className="system-title">Calendário de Rituais</h1>
        <p className="system-subtitle">Estruture reuniões, gere atas automáticas e pautas para a próxima semana.</p>
      </div>

      {!apiKey && (
        <div className="no-api-warning">
          Insira sua <span>API Key Anthropic</span> no campo superior direito para usar a IA.
        </div>
      )}

      <div className="tabs">
        <button className={`tab-btn${tab === 'calendario' ? ' active' : ''}`} onClick={() => setTab('calendario')}>
          Calendário de Rituais
        </button>
        <button className={`tab-btn${tab === 'ata' ? ' active' : ''}`} onClick={() => setTab('ata')}>
          Ata de Reunião
        </button>
      </div>

      {tab === 'calendario' && (
        <div className="card" style={{ maxWidth: 640 }}>
          <div className="form-group">
            <label className="form-label">Reuniões atuais</label>
            <textarea className="form-textarea" placeholder="Ex: Daily de 15 min toda manhã, reunião de resultados às sextas, 1:1 quinzenal..." value={form1.reunioes} onChange={(e) => setForm1({ ...form1, reunioes: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Estrutura do time</label>
            <textarea className="form-textarea" placeholder="Ex: Time de 10 pessoas, 3 líderes de área, trabalho híbrido..." value={form1.estrutura} onChange={(e) => setForm1({ ...form1, estrutura: e.target.value })} />
          </div>
          <button className="btn-primary" onClick={handleSubmit1} disabled={loading1 || !form1.reunioes}>
            {loading1 ? 'Gerando...' : 'Gerar Calendário e Pautas'}
          </button>
          {loading1 && <div className="loading-indicator"><div className="dot-pulse"><span/><span/><span/></div>Estruturando rituais...</div>}
          {result1 && <div className="result-box" style={{ marginTop: 20 }}>{result1}</div>}
        </div>
      )}

      {tab === 'ata' && (
        <div className="card" style={{ maxWidth: 640 }}>
          <div className="form-group">
            <label className="form-label">Transcrição da reunião</label>
            <textarea className="form-textarea" style={{ minHeight: 160 }} placeholder="Cole aqui a transcrição ou as notas da reunião..." value={form2.transcricao} onChange={(e) => setForm2({ ...form2, transcricao: e.target.value })} />
          </div>
          <button className="btn-primary" onClick={handleSubmit2} disabled={loading2 || !form2.transcricao}>
            {loading2 ? 'Processando...' : 'Gerar Ata + Próxima Pauta'}
          </button>
          {loading2 && <div className="loading-indicator"><div className="dot-pulse"><span/><span/><span/></div>Processando reunião...</div>}
          {result2 && <div className="result-box" style={{ marginTop: 20 }}>{result2}</div>}
        </div>
      )}
    </div>
  );
}
