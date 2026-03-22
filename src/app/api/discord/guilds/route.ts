import {auth, clerkClient} from '@clerk/nextjs/server';
import {NextResponse} from 'next/server';

export async function GET() {
    const {userId} = await auth();
    if (!userId) return NextResponse.json({error: 'unauthorized'}, {status: 401});

    const client = await clerkClient();
    const tokens = await client.users.getUserOauthAccessToken(userId, 'discord');
    const token = tokens.data?.[0]?.token;

    if (!token) {
        return NextResponse.json({error: 'no_discord_token'}, {status: 200});
    }

    const res = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: {Authorization: `Bearer ${token}`},
    });

    if (!res.ok) {
        const body = await res.text();
        console.error('[guilds] Discord API error', res.status, body);
        return NextResponse.json({error: 'discord_api_error', status: res.status, body}, {status: 200});
    }

    const allGuilds: {id: string; name: string; icon: string | null; owner: boolean; permissions: string}[] =
        await res.json();

    const adminGuilds = allGuilds.filter(
        (guild) => guild.owner || (parseInt(guild.permissions) & 0x20) !== 0,
    );

    return NextResponse.json({guilds: adminGuilds});
}
