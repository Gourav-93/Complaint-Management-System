const API_BASE_URL = "http://localhost:5213/api";

/**
 * Core API request wrapper
 * @param {string} endpoint - API endpoint starting with /
 * @param {Object} options - Fetch options
 * @returns {Promise<any>}
 */
async function apiRequest(endpoint, options = {}) {
    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");

        let data = null;
        if (isJson) {
            data = await response.json();
        } else {
            const text = await response.text();
            if (text) {
                // Try to parse just in case
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    data = { message: text };
                }
            }
        }

        if (!response.ok) {
            const errorMessage = data?.message || data || `Error ${response.status}: ${response.statusText}`;
            throw new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
        }

        return data;
    } catch (error) {
        console.error("API Request Failed:", error);
        throw error;
    }
}
