// src/listeners/lodestoneUpdate.ts
import { Listener } from '@sapphire/framework';
import { fetchLodestoneData } from '../utils/lodestone';
import { TextChannel, EmbedBuilder } from 'discord.js';

const CHECK_INTERVAL = 60000; // Check every 60 seconds
let lastUpdate: number = 0;

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
                    ...data.topics,
                    ...data.notices,
                    ...data.maintenance,
                    ...data.updates,
                    ...data.status,
                    ...data.developers
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

                            // Optional: set a color for the embed
                            embed.setColor('#FFD700');

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
