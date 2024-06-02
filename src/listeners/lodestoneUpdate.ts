import { Listener } from '@sapphire/framework';
import { fetchLodestoneData } from '../utils/lodestone';
import { TextChannel, EmbedBuilder, ColorResolvable } from 'discord.js';
import { readLastUpdateTime, writeLastUpdateTime } from '../utils/storage';

const CHECK_INTERVAL = 60000; // Check every 60 seconds

const colorMapping: { [key: string]: ColorResolvable } = {
    topics: '#FFD700', // Gold for Topics
    notices: '#FF4500', // OrangeRed for Notices
    maintenance: '#1E90FF', // DodgerBlue for Maintenance
    updates: '#32CD32', // LimeGreen for Updates
    status: '#FF69B4', // HotPink for Status
    developers: '#8A2BE2', // BlueViolet for Developers
};

const sourceInfo: { [key: string]: { iconURL: string, name: string, url: string } } = {
    topics: {
        iconURL: 'https://lds-img.finalfantasyxiv.com/h/W/_v7zlp4yma56rKwd8pIzU8wGFc.png', // Example URL
        name: 'Topics',
        url: 'https://na.finalfantasyxiv.com/lodestone/topics/'
    },
    notices: {
        iconURL: 'https://lds-img.finalfantasyxiv.com/h/c/GK5Y3gQsnlxMRQ_pORu6lKQAJ0.png', // Example URL
        name: 'Notices',
        url: 'https://na.finalfantasyxiv.com/lodestone/news/category/1'
    },
    maintenance: {
        iconURL: 'https://lds-img.finalfantasyxiv.com/h/U/6qzbI-6AwlXAfGhCBZU10jsoLA.png', // Example URL
        name: 'Maintenance',
        url: 'https://na.finalfantasyxiv.com/lodestone/news/category/2'
    },
    updates: {
        iconURL: 'https://lds-img.finalfantasyxiv.com/h/a/dFnS0OBVXIsmB74L65R7VHlpd8.png', // Example URL
        name: 'Updates',
        url: 'https://na.finalfantasyxiv.com/lodestone/news/category/3'
    },
    status: {
        iconURL: 'https://lds-img.finalfantasyxiv.com/h/S/-IC2xIQhTl2ymYW7deE1fOII04.png', // Example URL
        name: 'Status',
        url: 'https://na.finalfantasyxiv.com/lodestone/news/category/4'
    },
    developers: {
        iconURL: 'https://images-ext-1.discordapp.net/external/9l5De1BXmSep-cV4e-8oWMXHx-UP0Ag1SmBtG8m_Xl0/https/lodestonenews.com/images/developers.png', // Example URL
        name: 'Developers',
        url: 'https://na.finalfantasyxiv.com/blog/'
    }
};

export class LodestoneUpdateListener extends Listener {
    public constructor(context: Listener.Context, options: Listener.Options) {
        super(context, {
            ...options,
            name: 'lodestoneUpdate',
            event: 'ready'
        });
    }

    public async run() {

        let lastUpdate = await readLastUpdateTime();

        setInterval(async () => {
            try {
                const data = await fetchLodestoneData();

                const allUpdates = [
                    ...data.topics.map((update: any) => ({ ...update, source: 'topics' })),
                    ...data.notices.map((update: any) => ({ ...update, source: 'notices' })),
                    ...data.maintenance.map((update: any) => ({ ...update, source: 'maintenance' })),
                    ...data.updates.map((update: any) => ({ ...update, source: 'updates' })),
                    ...data.status.map((update: any) => ({ ...update, source: 'status' })),
                    ...data.developers.map((update: any) => ({ ...update, source: 'developers' }))
                ];

                const newUpdates = allUpdates.filter((update: any) => new Date(update.time).getTime() > lastUpdate);

                if (newUpdates.length > 0) {
                    lastUpdate = new Date(newUpdates[0].time).getTime();
                    await writeLastUpdateTime(lastUpdate);

                    const channel = this.container.client.channels.cache.get('1246325766464077834') as TextChannel;
                    if (channel) {
                        newUpdates.forEach((update: any) => {
                            const embed = new EmbedBuilder()
                                .setTitle(update.title || 'No Title')
                                .setDescription(update.description || 'No Description')
                                .setURL(update.url || '')
                                .setTimestamp(new Date(update.time));

                            if (update.image && update.image.length > 0) {
                                embed.setImage(update.image);
                            }

                            // Set the color based on the source
                            const embedColor: ColorResolvable = colorMapping[update.source] || '#FFFFFF';
                            embed.setColor(embedColor);

                            // Add the author field based on the source
                            const source = sourceInfo[update.source];
                            if (source) {
                                embed.setAuthor({ name: source.name, iconURL: source.iconURL, url: source.url });
                            }

                            channel.send({ embeds: [embed] });
                        });
                    }
                }
            } catch (error) {
                console.error('Error checking for Lodestone updates:', error);
            }
        }, CHECK_INTERVAL);
    }
}
