export class RateLimiter {
    private lastRequestTime: number = 0;
    private requestCount: number = 0;
    private windowStart: number = Date.now();

    constructor(
        private maxRequestsPerSecond: number = 3, // Default: 3/s (no API key)
        private retryAttempts: number = 3
    ) {
        console.log(`RateLimiter initialized: ${maxRequestsPerSecond} req/s, ${retryAttempts} retry attempts`);
    }

    async throttle(): Promise<void> {
        const now = Date.now();
        const elapsed = now - this.windowStart;

        // Reset window every second
        if (elapsed >= 1000) {
            this.requestCount = 0;
            this.windowStart = now;
        }

        // If at limit, wait until next window
        if (this.requestCount >= this.maxRequestsPerSecond) {
            const waitTime = 1000 - elapsed;
            console.log(`Rate limit reached (${this.requestCount}/${this.maxRequestsPerSecond}). Waiting ${waitTime}ms...`);
            await this.sleep(waitTime);
            this.requestCount = 0;
            this.windowStart = Date.now();
        }

        this.requestCount++;
        this.lastRequestTime = Date.now();
    }

    async fetchWithRetry(url: string, attempt: number = 1): Promise<Response> {
        await this.throttle();

        try {
            const response = await fetch(url);

            // Handle rate limit errors
            if (response.status === 429) {
                if (attempt >= this.retryAttempts) {
                    throw new Error(`Rate limit exceeded after ${this.retryAttempts} retries`);
                }

                // Exponential backoff: 2^attempt seconds
                const backoffMs = Math.pow(2, attempt) * 1000;
                console.warn(`⚠️  Rate limited (429). Backing off ${backoffMs}ms (attempt ${attempt}/${this.retryAttempts})`);
                await this.sleep(backoffMs);
                return this.fetchWithRetry(url, attempt + 1);
            }

            // Handle other errors
            if (!response.ok) {
                console.warn(`HTTP ${response.status} received from NCBI`);
            }

            return response;
        } catch (error: any) {
            if (attempt >= this.retryAttempts) {
                throw new Error(`Request failed after ${this.retryAttempts} retries: ${error.message}`);
            }

            const backoffMs = Math.pow(2, attempt) * 1000;
            console.warn(`Request failed: ${error.message}. Retrying in ${backoffMs}ms (attempt ${attempt}/${this.retryAttempts})`);
            await this.sleep(backoffMs);
            return this.fetchWithRetry(url, attempt + 1);
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
