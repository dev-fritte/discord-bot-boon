import Sidebar from '@@/components/dashboard/sidebar';
import {type CurrentServer} from '@@/components/dashboard/server-switcher';
import {getDb, type ServerRow} from '@@/lib/db';
import {cookies} from 'next/headers';
import React from 'react';

export default async function DashboardLayout({children}: {children: React.ReactNode}) {
    const cookieStore = await cookies();
    const selectedGuildId = cookieStore.get('selectedGuildId')?.value ?? null;

    let currentServer: CurrentServer = null;
    if (selectedGuildId) {
        const db = getDb();
        const row = db.prepare('SELECT * FROM servers WHERE guild_id = ?').get(selectedGuildId) as ServerRow | null;
        if (row) {
            currentServer = {guild_id: row.guild_id, guild_name: row.guild_name, guild_icon: row.guild_icon};
        }
    }

    return (
        <div className="flex h-screen bg-[#18181b] text-white">
            <Sidebar currentServer={currentServer} />
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}
