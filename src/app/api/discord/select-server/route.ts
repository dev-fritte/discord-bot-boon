import {getDb} from '@@/lib/db';
import {auth, clerkClient} from '@clerk/nextjs/server';
import {NextRequest, NextResponse} from 'next/server';

export async function POST(req: NextRequest) {
    const {userId} = await auth();
    if (!userId) return NextResponse.json({error: 'unauthorized'}, {status: 401});

    const {guildId, guildName, guildIcon}: {guildId: string; guildName: string; guildIcon: string | null} =
        await req.json();

    // Verify the user actually has admin access to this guild
    const client = await clerkClient();
    const tokens = await client.users.getUserOauthAccessToken(userId, 'discord');
    const token = tokens.data?.[0]?.token;

    if (!token) return NextResponse.json({error: 'no_discord_token'}, {status: 403});

    const guildsRes = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: {Authorization: `Bearer ${token}`},
    });
    if (!guildsRes.ok) return NextResponse.json({error: 'discord_api_error'}, {status: 403});

    const allGuilds: {id: string; owner: boolean; permissions: string}[] = await guildsRes.json();
    const guild = allGuilds.find((g) => g.id === guildId);
    const isAdmin = guild && (guild.owner || (parseInt(guild.permissions) & 0x20) !== 0);

    if (!isAdmin) return NextResponse.json({error: 'forbidden'}, {status: 403});

    // Upsert server into SQLite
    const db = getDb();
    db.prepare(`
        INSERT INTO servers (guild_id, guild_name, guild_icon)
        VALUES (?, ?, ?)
        ON CONFLICT (guild_id) DO UPDATE SET
            guild_name = excluded.guild_name,
            guild_icon = excluded.guild_icon
    `).run(guildId, guildName, guildIcon ?? null);

    const res = NextResponse.json({ok: true});
    res.cookies.set('selectedGuildId', guildId, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 365,
    });
    return res;
}
