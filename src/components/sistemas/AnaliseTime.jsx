import { useState, useRef } from 'react';
import FeedbackPDI from './FeedbackPDI';

const PERF_QUESTIONS = [
  'Entrega tarefas no prazo combinado?',
  'A qualidade do trabalho é alta, sem necessidade de muita revisão?',
  'Bate as metas definidas para ela?',
  'Clientes ou colegas elogiam o trabalho dela?',
  'Em projetos importantes, você confia que ela vai entregar?',
];

const POT_QUESTIONS = [
  'Quando aprende algo novo, aplica rápido?',
  'Quando o contexto muda, ela se adapta bem?',
  'Ela resolve problemas sozinha, com autonomia?',
  'Enxerga o impacto do trabalho dela no negócio como um todo?',
  'Você imagina ela assumindo mais responsabilidade em 12 meses?',
];

const RATING_COLORS = {
  1: { bg: '#7f1d1d', text: '#fecaca' },
  2: { bg: '#fde8e8', text: '#991b1b' },
  3: { bg: '#fef9c3', text: '#854d0e' },
  4: { bg: '#dcfce7', text: '#166534' },
  5: { bg: '#14532d', text: '#bbf7d0' },
};

const NINEBOX_MATRIX = {
  Alto:  { Baixo: 'Enigma',  Médio: 'Alto Potencial', Alto: 'Estrela'      },
  Médio: { Baixo: 'Dilema',  Médio: 'Consistente',    Alto: 'Alto Impacto' },
  Baixo: { Baixo: 'Risco',   Médio: 'Efetivo',        Alto: 'Sólido'       },
};

const NINEBOX_META = {
  'Estrela':          { abc: 'A — Rockstar',              foco: 'Preparar para promoções e desafios estratégicos', bg: '#2e4a2e' },
  'Alto Impacto':     { abc: 'Potencial A — Rockstar',    foco: 'Manter motivado, desenvolvimento técnico',        bg: '#5e7a3e' },
  'Alto Potencial':   { abc: 'Potencial A — Rockstar',    foco: 'PDI para crescimento em resultados',              bg: '#6e8a52' },
  'Consistente':      { abc: 'B — Consistente',           foco: 'Feedback regular, acompanhamento',                bg: '#8a7a52' },
  'Sólido':           { abc: 'B — Consistente',           foco: 'Reconhecimento e especialização',                 bg: '#8a7a52' },
  'Efetivo':          { abc: 'B — Consistente',           foco: 'Reforçar pontos fortes, foco técnico',            bg: '#7a5a36' },
  'Enigma':           { abc: 'Potencial B — Consistente', foco: 'Diagnosticar barreiras de entrega',               bg: '#8a7a52' },
  'Dilema':           { abc: 'C — Atrapalha',             foco: 'Feedback direto, definir metas claras',           bg: '#8a5e36' },
  'Risco':            { abc: 'C — Atrapalha',             foco: 'Considerar readequação ou desligamento',          bg: '#7a3636' },
};

const ABC_BADGE = {
  'A — Rockstar':              { bg: '#dcfce7', text: '#166534', border: '#86efac' },
  'Potencial A — Rockstar':    { bg: '#d1fae5', text: '#166534', border: '#6ee7b7' },
  'B — Consistente':           { bg: '#fef9c3', text: '#854d0e', border: '#facc15' },
  'Potencial B — Consistente': { bg: '#fef3c7', text: '#92400e', border: '#fcd34d' },
  'C — Atrapalha':             { bg: '#fde8e8', text: '#991b1b', border: '#f5a5a5' },
};

const GRID_ROWS = [
  { potLabel: 'Alto',  cells: ['Enigma', 'Alto Potencial', 'Estrela']      },
  { potLabel: 'Médio', cells: ['Dilema', 'Consistente',    'Alto Impacto'] },
  { potLabel: 'Baixo', cells: ['Risco',  'Efetivo',        'Sólido']       },
];

function calcLevel(avg) {
  if (avg <= 2.5) return 'Baixo';
  if (avg <= 3.5) return 'Médio';
  return 'Alto';
}

function RatingButton({ value, selected, onClick }) {
  const c = RATING_COLORS[value];
  return (
    <button
      onClick={() => onClick(value)}
      style={{
        background: c.bg,
        color: c.text,
        opacity: selected ? 1 : 0.6,
        transform: selected ? 'scale(1.15)' : 'scale(1)',
        border: selected ? `2px solid ${c.text}` : '2px solid transparent',
        borderRadius: 6,
        width: 38,
        height: 38,
        fontWeight: 700,
        fontSize: 13,
        cursor: 'pointer',
        transition: 'opacity 0.15s, transform 0.15s, border 0.15s',
        fontFamily: 'Inter, sans-serif',
        flexShrink: 0,
        boxShadow: selected ? `0 0 8px ${c.bg}99` : 'none',
      }}
    >
      {value}
    </button>
  );
}

function AbcBadge({ abc }) {
  const s = ABC_BADGE[abc] || {};
  return (
    <span style={{
      background: s.bg,
      color: s.text,
      border: `1px solid ${s.border}`,
      borderRadius: 20,
      padding: '3px 10px',
      fontSize: 11,
      fontWeight: 600,
      whiteSpace: 'nowrap',
      display: 'inline-block',
    }}>
      {abc}
    </span>
  );
}

export default function AnaliseTime({ apiKey }) {
  const [nome, setNome] = useState('');
  const [funcao, setFuncao] = useState('');
  const [remuneracao, setRemuneracao] = useState('');
  const [ratings, setRatings] = useState(Array(10).fill(0));
  const [team, setTeam] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const blocoRef = useRef(null);
  const bloco4Ref = useRef(null);

  const perfRatings = ratings.slice(0, 5);
  const potRatings = ratings.slice(5, 10);
  const perfAnswered = perfRatings.filter(r => r > 0).length;
  const potAnswered = potRatings.filter(r => r > 0).length;
  const perfAvg = perfAnswered === 5 ? perfRatings.reduce((a, b) => a + b, 0) / 5 : null;
  const potAvg = potAnswered === 5 ? potRatings.reduce((a, b) => a + b, 0) / 5 : null;

  const setRating = (idx, val) => {
    const n = [...ratings];
    n[idx] = val;
    setRatings(n);
  };

  const handleAdd = () => {
    if (!nome.trim()) return alert('Preencha o nome do colaborador.');
    if (perfAnswered < 5 || potAnswered < 5) return alert('Responda todas as 10 perguntas antes de adicionar.');

    const perfLevel = calcLevel(perfAvg);
    const potLevel = calcLevel(potAvg);
    const nineBox = NINEBOX_MATRIX[potLevel][perfLevel];
    const meta = NINEBOX_META[nineBox];

    const colaborador = {
      id: Date.now(),
      nome: nome.trim(),
      funcao: funcao.trim(),
      remuneracao: remuneracao.trim(),
      perfAvg: perfAvg.toFixed(1),
      potAvg: potAvg.toFixed(1),
      perfLevel,
      potLevel,
      nineBox,
      abc: meta.abc,
      foco: meta.foco,
    };

    setTeam(prev => [...prev, colaborador]);
    setNome('');
    setFuncao('');
    setRemuneracao('');
    setRatings(Array(10).fill(0));

    setTimeout(() => blocoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const handleSelectColaborador = (c) => {
    setSelected(c);
    setShowFeedback(false);
    setTimeout(() => bloco4Ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const getOccupants = (cellLabel) => team.filter(c => c.nineBox === cellLabel);

  return (
    <div>
      <div className="system-header">
        <div className="pilar-badge">L — Liderança</div>
        <h1 className="system-title">Análise de Time</h1>
        <p className="system-subtitle">Avalie sua equipe com Nine Box e gere Feedback 1:1 + PDI com IA.</p>
      </div>

      {!apiKey && (
        <div className="no-api-warning">
          Insira sua <span>API Key Anthropic</span> no campo superior direito para usar a IA.
        </div>
      )}

      {/* BLOCO 1 — FORMULÁRIO */}
      <div className="card" style={{ marginBottom: 24, borderColor: 'rgba(44,194,149,0.3)', background: '#0f3a36' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Nome</label>
            <input className="form-input" placeholder="Ex: Maria Silva" value={nome} onChange={e => setNome(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Função</label>
            <input className="form-input" placeholder="Ex: Gerente de Marketing" value={funcao} onChange={e => setFuncao(e.target.value)} />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Remuneração mensal</label>
            <input className="form-input" placeholder="Ex: R$ 5.000" value={remuneracao} onChange={e => setRemuneracao(e.target.value)} />
          </div>
        </div>

        <p style={{ fontSize: 11, color: 'var(--green-light)', marginBottom: 18, letterSpacing: '0.02em', opacity: 0.75 }}>
          Escala: 1 = muito ruim · 5 = muito bom
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Performance */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--mint)' }}>Performance</span>
              {perfAvg !== null && (
                <span style={{ fontSize: 11, color: 'var(--green-light)', fontWeight: 500 }}>
                  Média: {perfAvg.toFixed(1)} — {calcLevel(perfAvg)}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {PERF_QUESTIONS.map((q, i) => (
                <div key={i}>
                  <p style={{ fontSize: 12, color: '#c8ead8', marginBottom: 7, lineHeight: 1.45 }}>
                    {i + 1}. {q}
                  </p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[1,2,3,4,5].map(v => (
                      <RatingButton key={v} value={v} selected={ratings[i] === v} onClick={val => setRating(i, val)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Potencial */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--mint)' }}>Potencial</span>
              {potAvg !== null && (
                <span style={{ fontSize: 11, color: 'var(--green-light)', fontWeight: 500 }}>
                  Média: {potAvg.toFixed(1)} — {calcLevel(potAvg)}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {POT_QUESTIONS.map((q, i) => (
                <div key={i}>
                  <p style={{ fontSize: 12, color: '#c8ead8', marginBottom: 7, lineHeight: 1.45 }}>
                    {i + 6}. {q}
                  </p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[1,2,3,4,5].map(v => (
                      <RatingButton key={v} value={v} selected={ratings[i + 5] === v} onClick={val => setRating(i + 5, val)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
          <button className="btn-primary" onClick={handleAdd}>
            Adicionar à análise do time
          </button>
        </div>
      </div>

      {/* BLOCO 2 — TABELA */}
      {team.length > 0 && (
        <div ref={blocoRef} style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>
            Resultado — Análise de Time
          </h2>
          <p style={{ fontSize: 12, color: 'var(--text-soft)', marginBottom: 14 }}>
            Clique no nome para ver o Feedback 1:1 + PDI completo.
          </p>
          <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid var(--border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ background: 'rgba(10,41,36,0.6)' }}>
                  {['Nome', 'Função', 'Remuneração', 'Classificação ABC', 'Nine Box', 'Foco no PDI'].map(h => (
                    <th key={h} style={{
                      padding: '10px 14px',
                      textAlign: 'left',
                      color: 'var(--text-soft)',
                      fontWeight: 500,
                      fontSize: 11,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      whiteSpace: 'nowrap',
                      borderBottom: '1px solid var(--border)',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {team.map((c, idx) => (
                  <tr
                    key={c.id}
                    style={{
                      borderBottom: idx < team.length - 1 ? '1px solid rgba(44,194,149,0.08)' : 'none',
                      background: selected?.id === c.id ? 'rgba(44,194,149,0.05)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '11px 14px' }}>
                      <button
                        onClick={() => handleSelectColaborador(c)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--mint)',
                          textDecoration: 'underline',
                          cursor: 'pointer',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: 12,
                          fontWeight: 600,
                          padding: 0,
                        }}
                      >
                        {c.nome}
                      </button>
                    </td>
                    <td style={{ padding: '11px 14px', color: 'var(--text-soft)' }}>{c.funcao || '—'}</td>
                    <td style={{ padding: '11px 14px', color: 'var(--text-soft)' }}>{c.remuneracao || '—'}</td>
                    <td style={{ padding: '11px 14px' }}><AbcBadge abc={c.abc} /></td>
                    <td style={{ padding: '11px 14px', color: 'var(--text)', fontWeight: 500 }}>{c.nineBox}</td>
                    <td style={{ padding: '11px 14px', color: 'var(--text-soft)', maxWidth: 220 }}>{c.foco}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BLOCO 3 — NINE BOX */}
      {team.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>
            Mapa do Time — Nine Box
          </h2>
          <div style={{ display: 'flex', gap: 8 }}>
            {/* Eixo Y */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, width: 20 }}>
              <span style={{
                fontSize: 10,
                color: 'var(--text-soft)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
                marginTop: 24,
              }}>
                Potencial ↑
              </span>
            </div>

            <div style={{ flex: 1 }}>
              {/* Labels de linha (Alto/Médio/Baixo) + Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr', gap: 0 }}>
                {/* Labels potencial */}
                <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr 1fr', gap: 3 }}>
                  {['Alto', 'Médio', 'Baixo'].map(l => (
                    <div key={l} style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8 }}>
                      <span style={{ fontSize: 10, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{l}</span>
                    </div>
                  ))}
                </div>

                {/* Grid 3x3 */}
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: '1fr 1fr 1fr', gap: 3 }}>
                    {GRID_ROWS.map(row =>
                      row.cells.map(cellLabel => {
                        const meta = NINEBOX_META[cellLabel];
                        const occupants = getOccupants(cellLabel);
                        return (
                          <div key={cellLabel} style={{
                            background: meta.bg,
                            borderRadius: 6,
                            padding: '10px 12px',
                            minHeight: 80,
                          }}>
                            <div style={{
                              fontSize: 10,
                              fontWeight: 600,
                              color: '#f5f0e8',
                              marginBottom: 8,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              opacity: 0.75,
                            }}>
                              {cellLabel}
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                              {occupants.length === 0
                                ? <span style={{ fontSize: 11, color: 'rgba(245,240,232,0.3)' }}>—</span>
                                : occupants.map(p => (
                                  <span key={p.id} style={{
                                    background: 'rgba(0,0,0,0.28)',
                                    color: '#f5f0e8',
                                    borderRadius: 10,
                                    padding: '2px 8px',
                                    fontSize: 11,
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                  }} onClick={() => handleSelectColaborador(p)}>
                                    {p.nome}
                                  </span>
                                ))
                              }
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Labels de performance (X) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 3, marginTop: 4 }}>
                    {['Baixa', 'Média', 'Alta'].map(l => (
                      <div key={l} style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.04em', padding: '4px 0' }}>
                        {l}
                      </div>
                    ))}
                  </div>
                  <div style={{ textAlign: 'center', fontSize: 10, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>
                    Performance →
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BLOCO 4 — PDI PANEL */}
      {selected && (
        <div ref={bloco4Ref} className="card" style={{ marginBottom: 20, borderColor: 'rgba(44,194,149,0.35)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 3 }}>{selected.nome}</h2>
              <p style={{ fontSize: 12, color: 'var(--text-soft)' }}>{selected.funcao || 'Função não informada'}</p>
            </div>
            <button
              onClick={() => { setSelected(null); setShowFeedback(false); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-soft)', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 0 }}
            >
              ×
            </button>
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
            <AbcBadge abc={selected.abc} />
            <span style={{ fontSize: 12, color: 'var(--text-soft)' }}>
              Nine Box: <strong style={{ color: 'var(--text)' }}>{selected.nineBox}</strong>
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-soft)' }}>
              Performance: <strong style={{ color: 'var(--text)' }}>{selected.perfAvg}</strong>
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-soft)' }}>
              Potencial: <strong style={{ color: 'var(--text)' }}>{selected.potAvg}</strong>
            </span>
          </div>

          <p style={{ fontSize: 12, color: 'var(--text-soft)', marginBottom: 18 }}>
            <strong style={{ color: 'var(--green-light)' }}>Foco do PDI:</strong> {selected.foco}
          </p>

          {!showFeedback && (
            <button
              className="btn-primary"
              onClick={() => setShowFeedback(true)}
              disabled={!apiKey}
            >
              Iniciar Feedback 1:1 + PDI
            </button>
          )}
          {!apiKey && (
            <p style={{ fontSize: 11, color: 'var(--text-soft)', marginTop: 8 }}>
              Insira a API Key para usar este recurso.
            </p>
          )}
        </div>
      )}

      {selected && showFeedback && (
        <FeedbackPDI colaborador={selected} apiKey={apiKey} />
      )}
    </div>
  );
}
