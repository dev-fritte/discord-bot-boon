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

    const memeResponse = await fetch(`https://next-picture-storage.vercel.app/memes/find?${tagsAppendix}`)
        .then(res => res.json() as Promise<MemeResponse>)
        .catch(err => {
            console.error('Blob storage error', err);
            return null;
        });

    if (!memeResponse) return;

    const canvas = createCanvas(200, 200)
    const context = canvas.getContext('2d');
    const background = await loadImage(memeResponse.blob_url);
    // This uses the canvas dimensions to stretch the image onto the entire canvas
    context.drawImage(background, 0, 0, canvas.width, canvas.height);
    // Use the helpful Attachment class structure to process the file for you
    const meme = new AttachmentBuilder(await canvas.encode('png'), {name: 'random-meme.png'});

    console.log('create json attachement');
    const memeAttachment = meme.toJSON() as RESTAPIAttachment;

    console.log('attachment', memeAttachment);

    const response: APIInteractionResponse = {
        type: 4,
        data: {
            attachments: [memeAttachment],
            content: `Hier ist dein Meme ${interaction.member?.user.username}`,
        },
    }

    console.log('response', response)

    void updateDiscordMessageMessage(interaction.token, response);

}
