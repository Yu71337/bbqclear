export async function generateAISuggestion(config: {
    sourceText: string;
    targetLang: string;
    apiKey: string;
    baseUrl: string;
    model: string;
}) {
    const sysPrompt = `Translate the following to ${config.targetLang}. Rules:\n1. Keep standard localized button phrases unchanged if conventional.\n2. Length must closely match or be smaller than source.\n3. Do not translate variables wrapped in {}; keep them exactly as formatted. Output ONLY the translated text, without any quotes or explanations.`;

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
