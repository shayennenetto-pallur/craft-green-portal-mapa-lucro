export async function callClaude(userMessage, systemPrompt = null, conversationHistory = null) {
  const messages = conversationHistory
    ? [...conversationHistory, ...(userMessage ? [{ role: 'user', content: userMessage }] : [])]
    : [{ role: 'user', content: userMessage }];

  const body = { messages };
  if (systemPrompt) body.system = systemPrompt;

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || `Erro ${response.status}`);
  }

  const data = await response.json();
  return data.text;
}
