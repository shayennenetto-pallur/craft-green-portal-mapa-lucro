export async function callClaude(apiKey, userMessage, systemPrompt = null, conversationHistory = null) {
  const messages = conversationHistory
    ? [...conversationHistory, ...(userMessage ? [{ role: 'user', content: userMessage }] : [])]
    : [{ role: 'user', content: userMessage }];

  const body = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages,
  };

  if (systemPrompt) {
    body.system = systemPrompt;
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}
