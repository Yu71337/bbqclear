import { describe, it, expect, vi } from 'vitest';
import { generateAISuggestion } from './aiTranslation';

globalThis.fetch = vi.fn();

describe('aiTranslation', () => {
    it('constructs correct prompt and parameters', async () => {
        (globalThis.fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ choices: [{ message: { content: "Test output" } }] })
        });
        
        const result = await generateAISuggestion({
            sourceText: "Hello {name}",
            targetLang: "zh-CN",
            apiKey: "test",
            baseUrl: "https://api.openai.com/v1",
            model: "gpt-4"
        });
        
        expect(result).toBe("Test output");
        expect(globalThis.fetch).toHaveBeenCalled();
        
        const callArgs = (globalThis.fetch as any).mock.calls[0];
        expect(callArgs[0]).toBe("https://api.openai.com/v1/chat/completions");
        
        const body = JSON.parse(callArgs[1].body);
        expect(body.model).toBe("gpt-4");
        expect(body.messages[0].content).toContain("zh-CN");
    });
});
