import '@@/styles/globals.css';
import {ClerkProvider} from '@clerk/nextjs';
import type {Metadata} from 'next';
import {Open_Sans} from 'next/font/google';
import React from 'react'

const openSansFont = Open_Sans({subsets: ['latin']});

export const metadata: Metadata = {
    title: 'Nextjs Discord Bot | Budapester Boonorchester [BOON]',
    description: 'Custom discord bot to manage the knowledge database and more fun commands',

    keywords: [
        'nextjs',
        'discord',
        'bot',
        'boilerplate',
        'react',
        'typescript',
        'discord bot development',
        'nextjs discord bot',
        'discord bot framework',
    ],
    authors: [
        {
            name: 'Patrick Schmidt',
            url: 'https://github.com/dev-fritte',
        },
    ],
    creator: 'Patrick Schmidt',
    publisher: 'https://github.com/dev-fritte',
    openGraph: {
        title: 'Nextjs Discord Bot | Budapester Boonorchester [BOON]',
        description: 'Custom discord bot to manage the knowledge database and more fun commands',
        url: 'https://discord-bot-boon.vercel.app/',
        type: 'website',
    },
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html lang="en">
            <head>
                <title>BOON Discord Bot</title>
                <meta name="description" content="Custom discord bot with fun commands"/>
                <meta name="viewport" content="width=device-width, initial-scale=1"/>
                <link rel="icon" href="/favicon.ico"/>
                <meta
                    name="google-site-verification"
                    content="9L9yVl1B38S_ABkJE_s2iQbhCLNYOgPMi_C8kKrWFAg"
                />
            </head>
            <body className={`${openSansFont.className}`}>{children}</body>
            </html>
        </ClerkProvider>
    );
}
