'use client';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from '@@/components/ui/dialog';
import {useRouter} from 'next/navigation';
import {useEffect, useState} from 'react';

type Guild = {
    id: string;
    name: string;
    icon: string | null;
    owner: boolean;
    permissions: string;
};

export function ServerSelectModal({defaultOpen}: { defaultOpen: boolean }) {
    const router = useRouter();
    const [open, setOpen] = useState(defaultOpen);
    const [guilds, setGuilds] = useState<Guild[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<'no_discord_token' | 'generic' | null>(null);
    const [selecting, setSelecting] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;
        setLoading(true);
        fetch('/api/discord/guilds')
            .then((res) => res.json())
            .then((data) => {
                if (data.error === 'no_discord_token') {
                    setError('no_discord_token');
                } else if (data.error) {
                    console.error('Error fetching guilds', data.error)
                    setError('generic');
                } else {
                    setGuilds(data.guilds);
                }
            })
            .catch((err) => {
                console.error('Could not fetch guilds', err)
                setError('generic')
            })
            .finally(() => setLoading(false));
    }, [open]);

    async function handleSelect(guild: Guild) {
        setSelecting(guild.id);
        try {
            const res = await fetch('/api/discord/select-server', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    guildId: guild.id,
                    guildName: guild.name,
                    guildIcon: guild.icon,
                }),
            });
            if (!res.ok) throw new Error('select failed');
            setOpen(false);
            router.refresh();
        } catch {
            setError('generic');
            setSelecting(null);
        }
    }

    function getIconUrl(guild: Guild) {
        if (!guild.icon) return null;
        return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp?size=64`;
    }

    function getInitials(name: string) {
        return name
            .split(/\s+/)
            .map((w) => w[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
    }

    return (
        <Dialog open={open} onOpenChange={() => {
        }}>
            <DialogContent className="max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle>Select a Discord Server</DialogTitle>
                    <DialogDescription>
                        Choose the server you want to manage with Boon. Only servers where you have
                        admin permissions are shown.
                    </DialogDescription>
                </DialogHeader>

                {loading && <p className="text-zinc-400 text-sm">Loading your servers...</p>}

                {error === 'no_discord_token' && (
                    <p className="text-zinc-400 text-sm">
                        No Discord account connected. Sign in with Discord to continue.
                    </p>
                )}

                {error === 'generic' && (
                    <p className="text-red-400 text-sm">
                        Something went wrong. Please refresh and try again.
                    </p>
                )}

                {!loading && !error && guilds.length === 0 && (
                    <p className="text-zinc-400 text-sm">
                        No servers found where you have admin permissions.
                    </p>
                )}

                {!loading && !error && guilds.length > 0 && (
                    <div className="overflow-y-auto flex flex-col gap-2 mt-2">
                        {guilds.map((guild) => {
                            const iconUrl = getIconUrl(guild);
                            const isSelecting = selecting === guild.id;
                            return (
                                <button
                                    key={guild.id}
                                    onClick={() => handleSelect(guild)}
                                    disabled={selecting !== null}
                                    className="flex items-center gap-3 p-3 rounded-sm border border-[#333] bg-[#1a1a1d] hover:bg-[#222226] disabled:opacity-50 disabled:cursor-not-allowed text-left transition-colors"
                                >
                                    {iconUrl ? (
                                        <img
                                            src={iconUrl}
                                            alt={guild.name}
                                            className="w-10 h-10 rounded-full flex-shrink-0"
                                        />
                                    ) : (
                                        <div
                                            className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center flex-shrink-0 text-sm font-semibold text-zinc-300">
                                            {getInitials(guild.name)}
                                        </div>
                                    )}
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-sm font-medium text-white truncate">
                                            {guild.name}
                                        </span>
                                        {guild.owner && (
                                            <span className="text-xs text-zinc-500">Owner</span>
                                        )}
                                    </div>
                                    {isSelecting && (
                                        <span className="ml-auto text-xs text-zinc-400 flex-shrink-0">
                                            Setting up...
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
