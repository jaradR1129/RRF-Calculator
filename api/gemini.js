export const config = {
    runtime: 'edge',
};

export default async function handler(req) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const body = await req.json();
        const prompt = body.prompt;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return new Response(JSON.stringify({ error: 'API key is missing in Vercel environment variables.' }), {
                status: 500,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2, topP: 0.8, topK: 40 }
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: response.ok ? 200 : response.status,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error("Edge Server Error:", error);
        return new Response(JSON.stringify({ error: 'Network error connecting to Gemini.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
