'use client';
import {cn} from '@@/lib/utils';
import {Separator} from '@@/components/ui/separator';
import {
    Bot,
    Command,
    LayoutDashboard,
    Settings,
} from 'lucide-react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';

const navItems = [
    {label: 'Overview', href: '/dashboard', icon: LayoutDashboard},
    {label: 'Commands', href: '/dashboard/commands', icon: Command},
    {label: 'Bot', href: '/dashboard/bot', icon: Bot},
    {label: 'Settings', href: '/dashboard/settings', icon: Settings},
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="flex h-screen w-56 flex-col bg-[#111113] border-r border-[#333]">
            <div className="flex items-center gap-2 px-5 py-5">
                <span className="text-white font-bold text-lg">BOON Bot</span>
            </div>

            <Separator className="bg-[#333]"/>

            <nav className="flex flex-col gap-1 p-3 flex-1">
                {navItems.map(({label, href, icon: Icon}) => (
                    <Link
                        key={href}
                        href={href}
                        className={cn(
                            'flex items-center gap-3 rounded-sm px-3 py-2 text-sm font-medium transition-colors',
                            pathname === href
                                ? 'bg-[#5b64f1] text-white'
                                : 'text-zinc-400 hover:bg-[#1c1c21] hover:text-white',
                        )}
                    >
                        <Icon size={16}/>
                        {label}
                    </Link>
                ))}
            </nav>

            <Separator className="bg-[#333]"/>

            <div className="px-5 py-4">
                <Link
                    href="/"
                    className="text-xs text-zinc-500 hover:text-white transition-colors"
                >
                    ← Back to Home
                </Link>
            </div>
        </aside>
    );
}
