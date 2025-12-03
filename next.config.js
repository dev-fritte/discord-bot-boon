/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    env: {
        BOT_TOKEN: process.env.BOT_TOKEN,
        PUBLIC_KEY: process.env.PUBLIC_KEY,
        REGISTER_COMMANDS_KEY: process.env.REGISTER_COMMANDS_KEY,
    },
    serverExternalPackages: [
        '@napi-rs/canvas', // Das vorherige native Modul
        'zlib-sync',      // Das aktuelle native Modul
        'bufferutil',     // Häufig benötigte ws-Dependencies
        'utf-8-validate'  // Häufig benötigte ws-Dependencies
    ],

    // 2. Turbopack-Fehler bei Fehlen von Webpack-Config vermeiden (wenn Sie sie entfernt haben)
    turbopack: {},
}

module.exports = nextConfig
