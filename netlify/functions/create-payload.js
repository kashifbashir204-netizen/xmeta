export const handler = async (event, context) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const payload = JSON.parse(event.body);
        const apiKey = process.env.VITE_XAMAN_API_KEY;
        const apiSecret = process.env.VITE_XAMAN_API_SECRET;

        if (!apiKey || !apiSecret) {
            return { statusCode: 500, body: JSON.stringify({ error: "Missing API Key or Secret" }) };
        }

        const response = await fetch('https://xumm.app/api/v1/platform/payload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': apiKey,
                'X-API-Secret': apiSecret,
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        return {
            statusCode: response.status,
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error("Function Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        };
    }
};
