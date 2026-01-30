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
    .setDescription('responds with a random meme with matching tags');

export const execute: executeCommand = async (interaction) => {
    // You have access to do interaction object
    // https://discord.com/developers/docs/interactions/receiving-and-responding#interaction-object

    // const tags: string[] = interaction.
    // const tags: string[] = interaction.options.getString('tags');

    const response: APIInteractionResponse = {
        type: 5,
    }

    console.log('response', response)

    void updateResponseWithImage(interaction)

    return response;
};

async function updateResponseWithImage(interaction: APIInteraction): Promise<void> {

    console.log('start async picture loading ..')

    const tagsAppendix = 'tags=kai'//'tags=' + tags.map(tag => '&tags=' + tag);

    console.log('tagAppendix', tagsAppendix);

    console.log('call endpoint: ', `https://next-picture-storage.vercel.app/memes/find?${tagsAppendix}`)
    
    const memeResponse = await fetch(`https://next-picture-storage.vercel.app/memes/find?${tagsAppendix}`)
        .then(res => res.json() as unknown as MemeResponse)
        .catch(err => console.error('Blob storage error', err));

    if (!memeResponse) {
        console.log('No response from blob, terminate request')
        return
    }

    console.log('picture storage response', memeResponse)

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
