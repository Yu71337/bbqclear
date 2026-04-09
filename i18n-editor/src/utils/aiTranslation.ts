export async function generateAISuggestion(config: {
    sourceText: string;
    targetLang: string;
    apiKey: string;
    baseUrl: string;
    model: string;
    provider?: 'openai' | 'gemini';
    systemPrompt: string;
}) {
    const provider = config.provider || 'openai';
    const cleanBaseUrl = config.baseUrl.replace(/\/$/, '');

    if (provider === 'gemini') {
        const url = `${cleanBaseUrl || 'https://generativelanguage.googleapis.com'}/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`;
        
        const res = await globalThis.fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: config.systemPrompt }] },
                contents: [{ role: "user", parts: [{ text: config.sourceText }] }]
            })
        });

        if (!res.ok) {
            throw new Error(`Gemini API call failed: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }

    // Default to OpenAI behavior
    const res = await globalThis.fetch(`${cleanBaseUrl}/chat/completions`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json", 
            "Authorization": `Bearer ${config.apiKey}` 
        },
        body: JSON.stringify({
            model: config.model,
            messages: [
                { role: "system", content: config.systemPrompt },
                { role: "user", content: config.sourceText }
            ]
        })
    });
    
    if (!res.ok) {
        throw new Error(`OpenAI API call failed: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
}
