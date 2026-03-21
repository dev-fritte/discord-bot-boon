import {currentUser} from '@clerk/nextjs/server';

export default async function Dashboard() {
    const user = await currentUser();
    const name = user?.firstName ?? user?.emailAddresses[0]?.emailAddress ?? 'there';

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Overview</h1>
                <p className="text-zinc-400 mt-1">Welcome back, {name}!</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    {label: 'Registered Commands', value: '—'},
                    {label: 'Bot Status', value: 'Online'},
                    {label: 'Servers', value: '—'},
                ].map(({label, value}) => (
                    <div
                        key={label}
                        className="rounded-sm border border-[#333] bg-[#111113] p-5"
                    >
                        <p className="text-xs text-zinc-500 uppercase tracking-wide">{label}</p>
                        <p className="text-2xl font-bold text-white mt-1">{value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
