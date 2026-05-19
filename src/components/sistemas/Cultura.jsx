import { useState } from 'react';
import { callClaude } from '../../utils/api';

const SYSTEM_PROMPT_CHAT = `Você é um consultor de cultura organizacional. Sua missão é extrair a essência cultural de uma empresa por meio de uma conversa. Faça UMA pergunta por vez para descobrir a missão, valores e jeito de ser da empresa. Após 4-5 trocas você terá material suficiente para gerar o Manual de Cultura. Seja conversacional, curto e direto.`;

const SYSTEM_PROMPT_MANUAL = `Você é um especialista em cultura organizacional. Com base na conversa fornecida, gere um Manual de Cultura completo com:
1) MISSÃO
2) VISÃO
3) VALORES (3-5) com definição clara
4) COMPORTAMENTOS OBSERVÁVEIS por valor (3 por valor)
5) GUIA PARA LÍDERES
6) MANIFESTO DA EMPRESA
Seja inspirador, direto e autêntico.`;

export default function Cultura({ apiKey }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [manual, setManual] = useState('');
  const [generatingManual, setGeneratingManual] = useState(false);
  const [started, setStarted] = useState(false);

  const startChat = async () => {
    if (!apiKey) return alert('Insira sua API Key no campo do header.');
    setLoading(true);
    setStarted(true);
    const firstQuestion = await callClaude(
      apiKey,
      'Inicie a conversa com uma pergunta para descobrir a cultura da empresa do usuário.',
      SYSTEM_PROMPT_CHAT,
      []
    );
    setMessages([{ role: 'assistant', content: firstQuestion }]);
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const aiReply = await callClaude(apiKey, '', SYSTEM_PROMPT_CHAT, newMessages);
    setMessages([...newMessages, { role: 'assistant', content: aiReply }]);
    setLoading(false);
  };

  const generateManual = async () => {
    if (!apiKey) return alert('Insira sua API Key no campo do header.');
    setGeneratingManual(true);
    const conversation = messages.map((m) => `${m.role === 'user' ? 'Empresa' : 'Consultor'}: ${m.content}`).join('\n\n');
    const prompt = `Com base nesta conversa:\n\n${conversation}\n\nGere o Manual de Cultura completo.`;
    const result = await callClaude(apiKey, prompt, SYSTEM_PROMPT_MANUAL, []);
    setManual(result);
    setGeneratingManual(false);
  };

  return (
    <div>
      <div className="system-header">
        <div className="pilar-badge">C — Cultura</div>
        <h1 className="system-title">A Única Coisa Incopiável</h1>
        <p className="system-subtitle">Extraia missão, valores e jeito de ser da sua empresa via chat guiado.</p>
      </div>

      {!apiKey && (
        <div className="no-api-warning">
          Insira sua <span>API Key Anthropic</span> no campo superior direito para usar a IA.
        </div>
      )}

      <div className="card" style={{ maxWidth: 680 }}>
        {!started ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p style={{ color: 'var(--text-soft)', marginBottom: 20, fontSize: 13 }}>
              A IA vai conduzir uma conversa para descobrir a essência cultural da sua empresa.<br />
              Responda com autenticidade — sem respostas prontas.
            </p>
            <button className="btn-primary" onClick={startChat} disabled={!apiKey}>
              Iniciar Conversa com o Consultor
            </button>
          </div>
        ) : (
          <>
            <div className="chat-container">
              {messages.map((msg, i) => (
                <div key={i} className={`chat-bubble ${msg.role === 'assistant' ? 'ai' : 'user'}`}>
                  {msg.content}
                </div>
              ))}
              {loading && (
                <div className="loading-indicator">
                  <div className="dot-pulse"><span/><span/><span/></div>
                </div>
              )}
            </div>

            <div className="chat-input-row">
              <textarea
                className="form-textarea"
                placeholder="Sua resposta..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
                }}
              />
              <button className="btn-primary" onClick={sendMessage} disabled={loading || !input.trim()}>
                Enviar
              </button>
            </div>

            {messages.length >= 6 && (
              <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
                <button
                  className="btn-secondary"
                  onClick={generateManual}
                  disabled={generatingManual}
                  style={{ width: '100%' }}
                >
                  {generatingManual ? 'Gerando Manual...' : 'Gerar Manual de Cultura'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {generatingManual && (
        <div className="loading-indicator">
          <div className="dot-pulse"><span/><span/><span/></div>
          Criando seu Manual de Cultura...
        </div>
      )}

      {manual && <div className="result-box">{manual}</div>}
    </div>
  );
}
