import {UserButton} from '@clerk/nextjs';
import {currentUser} from '@clerk/nextjs/server';
import Link from 'next/link';

export default async function Dashboard() {
    const user = await currentUser();

    return (
        <main>
            <section id="main-container">
                <div id="auth-bar">
                    <Link href="/" id="dashboard-link">← Home</Link>
                    <UserButton/>
                </div>
                <h1 id="header-text">Dashboard</h1>
                <p id="dashboard-welcome">Welcome, {user?.firstName ?? user?.emailAddresses[0]?.emailAddress}!</p>
            </section>
        </main>
    );
}
