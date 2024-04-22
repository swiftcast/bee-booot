import { Events, Listener, ListenerOptions } from '@sapphire/framework';
import { Message } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';
import * as fs from 'fs';
import * as path from 'path';

@ApplyOptions<ListenerOptions>({
    event: Events.MessageCreate,
    once: false
})
export class UserListener extends Listener {
    private configPath = path.join(process.cwd(), 'config.json');
    private targetChannelIds: string[] = this.loadConfig();

    private loadConfig(): string[] {
        if (fs.existsSync(this.configPath)) {
            const config = JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
            return config.imageOnlyChannelIds || [];
        }
        return [];
    }

    public async run(message: Message) {
        if (!this.targetChannelIds.includes(message.channel.id) || message.author.bot) return;

        const hasImage = message.attachments.some(attachment => this.isImageAttachment(attachment.contentType));

        if (!hasImage) {
            try {
                await message.delete();
                const warningMessage = await message.channel.send("Only images are allowed in this channel. Please adhere to the channel rules. Thank you for your understanding. 🐝");
                setTimeout(() => warningMessage.delete().catch(err => this.container.logger.error(`Failed to delete the warning message: ${err}`)), 30000);
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
