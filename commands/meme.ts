import {SlashCommandBuilder} from '@discordjs/builders';
import {executeCommand} from '@/types';
import {AttachmentBuilder} from 'discord.js'
import {createCanvas, loadImage} from '@napi-rs/canvas'

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

    const tagsAppendix =  'tags=kai'//'tags=' + tags.map(tag => '&tags=' + tag);

    console.log('tagAppendix', tagsAppendix);

    const response = await fetch(`https://next-picture-storage.vercel.app/memes/find?${tagsAppendix}`)
        .then(res => res.json() as unknown as MemeResponse);

    console.log('picture storage response', response)

    const canvas = createCanvas(200, 200)
    const context = canvas.getContext('2d');
    const background = await loadImage(response.blob_url);
    // This uses the canvas dimensions to stretch the image onto the entire canvas
    context.drawImage(background, 0, 0, canvas.width, canvas.height);
    // Use the helpful Attachment class structure to process the file for you
    const attachment = new AttachmentBuilder(await canvas.encode('png'), {name: 'random-meme.png'});

    // you should return a APIInteractionResponse
    // https://discord-api-types.dev/api/discord-api-types-v10#APIApplicationCommandInteraction
    return {
        type: 4,
        data: {
            attachment: attachment,
            content: `Hier ist dein Meme ${interaction.member?.user.username}`,
        },
    };
};
