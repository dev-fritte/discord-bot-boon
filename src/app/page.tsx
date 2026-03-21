'use client';
import {CLIENT_APPLICATION_ID} from '@/config';
import {Button} from '@@/components/ui/button';
import {Separator} from '@@/components/ui/separator';
import Logo from '@@/components/Hero';
import {Show, SignInButton, UserButton} from '@clerk/nextjs';
import axios from 'axios';
import Link from 'next/link';
import {FormEvent, useState} from 'react';

export default function Home() {
    const [registerCommandsKey, setRegisterCommandsKey] = useState<string>('');
    const [status, setStatus] = useState<string>('');

    const handleRegisterCommand = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const requestLink = '/api/discord-bot/register-commands?REGISTER_COMMANDS_KEY=' + registerCommandsKey;
        try {
            setStatus('Loading...');
            if (registerCommandsKey.length > 0) {
                await axios.post(requestLink);
            }
            setStatus('Commands registered!');
        } catch (error: any) {
            console.log(error.message);
            setStatus('Something went wrong. Check the console for errors');
        }
    };

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-[hsl(262,66%,33%)]">
            <section className="flex flex-col items-center rounded-sm bg-[#18181b] px-16 py-8 shadow-[0_0_60px_rgba(0,0,0,0.2)]">

                {/* Auth bar */}
                <div className="flex items-center gap-3 self-end mb-2">
                    <Show when="signed-out">
                        <SignInButton mode="modal">
                            <Button>Login</Button>
                        </SignInButton>
                    </Show>
                    <Show when="signed-in">
                        <Button asChild variant="ghost">
                            <Link href="/dashboard">Dashboard</Link>
                        </Button>
                        <UserButton/>
                    </Show>
                </div>

                {/* Header */}
                <h1 className="flex items-center gap-2 px-4 py-2 font-bold text-xl text-white">
                    <Logo/>
                    [BOON] Discord Bot
                </h1>

                {status && <p className="text-sm text-zinc-400 mt-1">{status}</p>}

                {/* Register commands form */}
                <form className="flex flex-col gap-1 p-4 w-full" onSubmit={handleRegisterCommand}>
                    <input
                        className="px-4 py-3 bg-[#333] text-white rounded-sm outline-none border-none placeholder:text-zinc-500"
                        type="text"
                        placeholder="Register Commands Key"
                        value={registerCommandsKey}
                        onChange={(e) => setRegisterCommandsKey(e.target.value)}
                    />
                    <Button
                        type="submit"
                        disabled={registerCommandsKey.length < 1}
                        className="mt-1 mb-5 w-full"
                    >
                        Register Commands
                    </Button>
                </form>

                {/* Invite link */}
                <Link
                    href={`https://discord.com/api/oauth2/authorize?client_id=${CLIENT_APPLICATION_ID}&permissions=2147483648&scope=bot`}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="w-[226px] text-center px-6 py-4 font-bold text-white rounded-sm bg-gradient-to-r from-[#5a64f1] to-[#df47d2] hover:from-[#6871ed] hover:to-[#ea5cde] transition-all"
                >
                    Invite Discord Bot
                </Link>

                <Separator className="my-4 w-[70%] bg-[#333]"/>

                {/* GitHub link */}
                <Link
                    href="https://github.com/dev-fritte/discord-bot-boon"
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex items-center gap-2 px-4 py-2 font-bold text-white bg-[#29292e] rounded-sm hover:bg-[#333] transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 64 64">
                        <path fill="#fff" d="M32 6C17.641 6 6 17.641 6 32c0 12.277 8.512 22.56 19.955 25.286-.592-.141-1.179-.299-1.755-.479V50.85c0 0-.975.325-2.275.325-3.637 0-5.148-3.245-5.525-4.875-.229-.993-.827-1.934-1.469-2.509-.767-.684-1.126-.686-1.131-.92-.01-.491.658-.471.975-.471 1.625 0 2.857 1.729 3.429 2.623 1.417 2.207 2.938 2.577 3.721 2.577.975 0 1.817-.146 2.397-.426.268-1.888 1.108-3.57 2.478-4.774-6.097-1.219-10.4-4.716-10.4-10.4 0-2.928 1.175-5.619 3.133-7.792C19.333 23.641 19 22.494 19 20.625c0-1.235.086-2.751.65-4.225 0 0 3.708.026 7.205 3.338C28.469 19.268 30.196 19 32 19s3.531.268 5.145.738c3.497-3.312 7.205-3.338 7.205-3.338.567 1.474.65 2.99.65 4.225 0 2.015-.268 3.19-.432 3.697C46.466 26.475 47.6 29.124 47.6 32c0 5.684-4.303 9.181-10.4 10.4 1.628 1.43 2.6 3.513 2.6 5.85v8.557c-.576.181-1.162.338-1.755.479C49.488 54.56 58 44.277 58 32 58 17.641 46.359 6 32 6z"/>
                    </svg>
                    Github Repository
                </Link>

            </section>
        </main>
    );
}
