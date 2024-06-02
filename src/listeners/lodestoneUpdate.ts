// src/listeners/lodestoneUpdate.ts
import { Listener } from '@sapphire/framework';
import { fetchLodestoneData } from '../utils/lodestone';
import { TextChannel, EmbedBuilder, ColorResolvable } from 'discord.js';

const CHECK_INTERVAL = 60000; // Check every 60 seconds
let lastUpdate: number = 0;

const colorMapping: { [key: string]: ColorResolvable } = {
    topics: '#FFD700', // Gold for Topics
    notices: '#FF4500', // OrangeRed for Notices
    maintenance: '#1E90FF', // DodgerBlue for Maintenance
    updates: '#32CD32', // LimeGreen for Updates
    status: '#FF69B4', // HotPink for Status
    developers: '#8A2BE2', // BlueViolet for Developers
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
