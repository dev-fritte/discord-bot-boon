import {APIInteraction, RESTGetAPIApplicationCommandsResult} from 'discord.js';
import {BOT_TOKEN} from '@/config';
import axios, {AxiosResponse} from 'axios';
import {APIInteractionResponse} from 'discord-api-types/v10'

export const discord_api = axios.create({
    baseURL: 'https://discord.com/api/',
    timeout: 3000,
    headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
        'Access-Control-Allow-Headers': 'Authorization',
        Authorization: `Bot ${BOT_TOKEN}`,
    },
});

export const fetchBotCommands = async () => {
    return (await discord_api.get(
        `/applications/${process.env.NEXT_PUBLIC_APPLICATION_ID!}/commands`
    )) as AxiosResponse<RESTGetAPIApplicationCommandsResult>;
};


export const sendAckResponse = async (interaction: APIInteraction) => {
    return (await discord_api.post(`/interactions/${interaction.id}/${interaction.token}/callback`, {
        type: 5
    }))
}

export async function updateDiscordMessage(token: string, data: any) {
    const formData = new FormData();

    // Wenn Files vorhanden sind, müssen sie speziell angehängt werden
    if (data.files) {
        data.files.forEach((f: any, index: number) => {
            formData.append(`files[${index}]`, new Blob([f.attachment]), f.name);
        });
        // Das restliche JSON muss als 'payload_json' dazu
        formData.append('payload_json', JSON.stringify({ content: data.content }));
    } else {
        // ... nur JSON
    }

    return await fetch(`https://discord.com/api/v10/webhooks/${process.env.NEXT_PUBLIC_APPLICATION_ID!}/${token}/messages/@original`, {
        method: 'PATCH',
        body: formData,
    });
}
