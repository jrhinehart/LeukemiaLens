export default {
    async fetch(request, env) {
        // This is just a fallback if assets routing fails, but mostly unused for static sites
        return new Response("Not Found", { status: 404 });
    }
}
