import { Events, Listener, ListenerOptions } from '@sapphire/framework';
import { Message } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';

@ApplyOptions<ListenerOptions>({
	event: Events.MessageCreate,
	once: false
})
export class UserListener extends Listener {
	// Specify the channel ID to listen to; configurable as needed
	private readonly TARGET_CHANNEL_ID = "1231015705344868462";

	public async run(message: Message) {
        if (message.channel.id !== this.TARGET_CHANNEL_ID || message.author.bot) return;

        const hasImage = message.attachments.some(attachment => this.isImageAttachment(attachment.contentType));

        if (!hasImage) {
            try {
                await message.delete();
                this.container.logger.info(`Deleted a text-only message from ${message.author.tag}`);
            } catch (error) {
                this.container.logger.error(`Failed to delete message: ${error}`);
            }
        }
    }

    private isImageAttachment(contentType: string | null): boolean {
        return !!contentType && contentType.startsWith('image/');
    }
}
