// api/backtest.js (Vercel Serverless Function)

export default async function handler(req, res) {
    // Security check: Sirf POST requests allow karenge
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { pair, details } = req.body;
    const activeKey = process.env.GEMINI_API_KEY;

    // Agar server par key set nahi hui toh error dikhayega
    if (!activeKey) {
        return res.status(500).json({ error: 'Backend Configuration Error: API Key missing.' });
    }

    const prompt = `You are an elite institutional algorithmic trader. Analyze the following trading strategy for the asset "${pair}". 
    Strategy parameters: "${details}".
    Provide a strict, professional backtesting audit report in clean bullet points. Break it down into:
    1. Strategy Logic Validity Check
    2. Asset Specific Behavior (Focus on volatility/liquidity sweeps for ${pair})
    3. Statistical Matrix Prediction (Provide an estimated Win Rate %, Profit Factor, and Risk Status based on historical quantitative behavior)
    4. Optimization suggestions to improve edge. Keep it practical and direct for traders.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${activeKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            const aiResponseText = data.candidates[0].content.parts[0].text;
            return res.status(200).json({ report: aiResponseText });
        } else {
            return res.status(500).json({ error: 'Failed to parse AI response.' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error connecting to AI core.' });
    }
}

