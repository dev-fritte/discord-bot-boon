/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    env: {
        BOT_TOKEN: process.env.BOT_TOKEN,
        PUBLIC_KEY: process.env.PUBLIC_KEY,
        REGISTER_COMMANDS_KEY: process.env.REGISTER_COMMANDS_KEY,
    },
    experimental: {
        // Fügen Sie das native Modul hier hinzu
        serverComponentsExternalPackages: ['@napi-rs/canvas'],
    },

    // 2. Turbopack-Fehler bei Fehlen von Webpack-Config vermeiden (wenn Sie sie entfernt haben)
    turbopack: {},
}

module.exports = nextConfig
