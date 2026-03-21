import Sidebar from '@@/components/dashboard/sidebar';
import React from 'react';

export default function DashboardLayout({children}: {children: React.ReactNode}) {
    return (
        <div className="flex h-screen bg-[#18181b] text-white">
            <Sidebar/>
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}
