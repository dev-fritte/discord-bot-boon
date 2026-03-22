'use client';
import {cn} from '@@/lib/utils';
import {Check, ChevronDown} from 'lucide-react';
import {useRouter} from 'next/navigation';
import {useEffect, useRef, useState} from 'react';

type Guild = {
    id: string;
    name: string;
    icon: string | null;
    owner: boolean;
    permissions: string;
};

export type CurrentServer = {
    guild_id: string;
    guild_name: string;
    guild_icon: string | null;
} | null;

function getIconUrl(id: string, icon: string | null) {
    if (!icon) return null;
    return `https://cdn.discordapp.com/icons/${id}/${icon}.webp?size=64`;
}

function getInitials(name: string) {
    return name
        .split(/\s+/)
        .map((w) => w[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
}

function GuildIcon({id, icon, name, size}: {id: string; icon: string | null; name: string; size: 'sm' | 'md'}) {
    const url = getIconUrl(id, icon);
    const cls = size === 'md' ? 'w-7 h-7 text-xs' : 'w-6 h-6 text-xs';
    if (url) return <img src={url} alt={name} className={cn(cls, 'rounded-full flex-shrink-0')} />;
    return (
        <div className={cn(cls, 'rounded-full bg-[#5b64f1] flex items-center justify-center font-bold text-white flex-shrink-0')}>
            {getInitials(name)}
        </div>
    );
}

export function ServerSwitcher({currentServer}: {currentServer: CurrentServer}) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [guilds, setGuilds] = useState<Guild[]>([]);
    const [loading, setLoading] = useState(false);
    const [selecting, setSelecting] = useState<string | null>(null);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function onMouseDown(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', onMouseDown);
        return () => document.removeEventListener('mousedown', onMouseDown);
    }, []);

    function handleToggle() {
        if (!open && guilds.length === 0) {
            setLoading(true);
            fetch('/api/discord/guilds')
                .then((r) => r.json())
                .then((data) => { if (data.guilds) setGuilds(data.guilds); })
                .finally(() => setLoading(false));
        }
        setOpen((o) => !o);
    }

    async function handleSelect(guild: Guild) {
        if (selecting) return;
        setSelecting(guild.id);
        try {
            await fetch('/api/discord/select-server', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({guildId: guild.id, guildName: guild.name, guildIcon: guild.icon}),
            });
            setOpen(false);
            router.refresh();
        } finally {
            setSelecting(null);
        }
    }

    return (
        <div ref={ref} className="relative px-3 py-2">
            <button
                onClick={handleToggle}
                className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-sm hover:bg-[#1c1c21] transition-colors"
            >
                {currentServer ? (
                    <>
                        <GuildIcon id={currentServer.guild_id} icon={currentServer.guild_icon} name={currentServer.guild_name} size="md" />
                        <span className="flex-1 truncate text-white font-medium text-left">
                            {currentServer.guild_name}
                        </span>
                    </>
                ) : (
                    <span className="flex-1 text-zinc-400 text-left">Select a server</span>
                )}
                <ChevronDown
                    size={14}
                    className={cn('text-zinc-400 flex-shrink-0 transition-transform duration-200', open && 'rotate-180')}
                />
            </button>

            {open && (
                <div className="absolute left-3 right-3 top-full z-50 mt-1 overflow-hidden rounded-sm border border-[#333] bg-[#18181b] shadow-lg">
                    {loading && (
                        <p className="px-3 py-2 text-xs text-zinc-500">Loading servers...</p>
                    )}
                    {!loading && guilds.length === 0 && (
                        <p className="px-3 py-2 text-xs text-zinc-500">No admin servers found.</p>
                    )}
                    {guilds.map((guild) => {
                        const isActive = currentServer?.guild_id === guild.id;
                        return (
                            <button
                                key={guild.id}
                                onClick={() => handleSelect(guild)}
                                disabled={!!selecting}
                                className="flex w-full items-center gap-2 px-3 py-2 hover:bg-[#1c1c21] disabled:opacity-50 transition-colors"
                            >
                                <GuildIcon id={guild.id} icon={guild.icon} name={guild.name} size="sm" />
                                <span className="flex-1 truncate text-left text-sm text-white">
                                    {selecting === guild.id ? 'Switching...' : guild.name}
                                </span>
                                {isActive && <Check size={12} className="flex-shrink-0 text-[#5b64f1]" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
