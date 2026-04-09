export async function generateAISuggestion(config: {
    sourceText: string;
    targetLang: string;
    apiKey: string;
    baseUrl: string;
    model: string;
}) {
    const sysPrompt = `You are a translation engine. Translate the following text to exactly: ${config.targetLang}.
CRITICAL INSTRUCTIONS:
1. Output ONLY the raw translated text.
2. DO NOT include greetings, thinking steps, explanations, or quotes.
3. DO NOT use markdown code blocks.
4. Keep standard localized button phrases unchanged if conventional.
5. Do not translate variables wrapped in {}; keep them exactly as formatted.`;

    const res = await fetch(`${config.baseUrl}/chat/completions`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json", 
            "Authorization": `Bearer ${config.apiKey}` 
        },
        body: JSON.stringify({
            model: config.model,
            messages: [
                { role: "system", content: sysPrompt },
                { role: "user", content: config.sourceText }
            ]
        })
    });
    
    if (!res.ok) {
        throw new Error(`API call failed: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
}
