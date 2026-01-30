import {SlashCommandBuilder} from '@discordjs/builders';
import {APIInteraction, APIInteractionResponse, AttachmentBuilder, RESTAPIAttachment} from 'discord.js'
import {createCanvas, loadImage} from '@napi-rs/canvas'
import {executeCommand} from '@/types'
import {updateDiscordMessageMessage} from '@/utils/discord-api'

type MemeResponse = {
    id: number,
    created_at: string,
    blob_url: string,
    tags: string[],
}

// Don't change register and execute variable names
export const register = new SlashCommandBuilder()
    .setName('meme')
    .setDescription('responds with a random meme with matching tags')
    .addStringOption(option =>
        option.setName('tags')
            .setDescription('Tags getrennt durch Komma')
            .setRequired(true)
    );

export const execute: executeCommand = async (interaction) => {
    // You have access to do interaction object
    // https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object

    const response: APIInteractionResponse = {
        type: 5,
    }

    console.log('response', response)

    void updateResponseWithImage(interaction)

    return response;
};

async function updateResponseWithImage(interaction: APIInteraction): Promise<void> {

    console.log('start async picture loading ..')

    const options = (interaction.data as any).options;
    const tagsRaw = options?.find((opt: any) => opt.name === 'tags')?.value as string | undefined;

    // 2. Den String in ein Array umwandeln (Komma-getrennt)
    // "tag1, tag2" -> ["tag1", "tag2"]
    const tagsArray = tagsRaw
        ? tagsRaw.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : [];

    // 3. URL Parameter bauen
    // Wenn dein Backend mehrere Tags erwartet, musst du entscheiden wie (z.B. tags=tag1,tag2)
    const tagsAppendix = tagsArray.length > 0
        ? `tags=${tagsArray.join(',')}`
        : 'tags=boon';

    console.log('Rufe Endpoint auf: ', `https://next-picture-storage.vercel.app/memes/find?${tagsAppendix}`);

    let memeResponse;

    try {
        console.log('Starte Fetch...');
        const res = await fetch(`https://next-picture-storage.vercel.app/memes/find?${tagsAppendix}`, {
            method: 'GET',
            headers: {'Accept': 'application/json'}
        });

        if (!res.ok) {
            console.error(`HTTP Fehler: ${res.status}`);
            return;
        }

        memeResponse = await res.json() as MemeResponse;
        console.log('response from blob storage', memeResponse);
    } catch (e) {
        console.error('Kritischer Fehler beim Fetch:', e);
    }

    if (!memeResponse) return;

    const response: APIInteractionResponse = {
        type: 4,
        data: {
            content: `Hier ist dein Meme ${interaction.member?.user.username}`,
        },
    }

    console.log('response', response)

    void updateDiscordMessageMessage(interaction.token, response);

}
