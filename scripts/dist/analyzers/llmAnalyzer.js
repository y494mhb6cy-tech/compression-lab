export class LLMAnalyzer {
    constructor(apiKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY) {
        this.apiKey = apiKey;
    }
    async analyze(input) {
        if (!this.apiKey) {
            return {
                title: "LLM analysis disabled",
                body: 'No API key provided. Add OPENAI_API_KEY or ANTHROPIC_API_KEY and wire this analyzer into scripts/buildInsights.ts.',
                bullets: ['Mock analyzer is active by default.']
            };
        }
        // Placeholder: connect to your preferred LLM client here.
        // Keep the prompt conservative and avoid predictive or political claims.
        return {
            title: 'LLM analyzer placeholder',
            body: `Received category ${input.category} for week ${input.current.week}. Connect an LLM client here.`,
            bullets: ['Replace this with a real model call.']
        };
    }
}
