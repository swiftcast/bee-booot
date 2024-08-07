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
    private targetChannelIds: string[] = [];

    constructor(context: Listener.Context, options?: Partial<ListenerOptions>) {
        super(context, {
            ...options,
            event: Events.MessageCreate
        });
        this.loadConfig();
        this.watchConfig();
    }

    private loadConfig(): void {
        if (fs.existsSync(this.configPath)) {
            const config = JSON.parse(fs.readFileSync(this.configPath, 'utf-8'));
            this.targetChannelIds = config.imageOnlyChannelIds || [];
        } else {
            this.targetChannelIds = [];
        }
    }

    private watchConfig(): void {
        fs.watch(this.configPath, (eventType, filename) => {
            if (filename && eventType === 'change') {
                this.container.logger.info(`Config file ${filename} has been changed, reloading config.`);
                this.loadConfig();
            }
        });
    }

    public async run(message: Message) {
        if (!this.targetChannelIds.includes(message.channel.id) || message.author.bot) return;

        const hasMedia = message.attachments.some(attachment => this.isMediaAttachment(attachment.contentType));

        if (!hasMedia) {
            try {
                await message.delete();
                const warningMessage = await message.channel.send("In this channel, let your images float like pollen, allowing the hive to tenderly pollinate each visual blossom with attention and admiration. 🐝 Please weave any discussions into a separate thread or continue in another channel, ensuring our garden thrives in harmony and beauty. Thank you for your sweetness and understanding. 🌼");
                setTimeout(() => warningMessage.delete().catch(err => this.container.logger.error(`Failed to delete the warning message: ${err}`)), 30000);
                this.container.logger.info(`Deleted a text-only message from ${message.author.tag}`);
            } catch (error) {
                this.container.logger.error(`Failed to delete message: ${error}`);
            }
        } else {
            // Use nickname if available, otherwise use username
            const displayName = message.member?.nickname || message.author.displayName;
            const currentDate = new Date().toLocaleDateString();
            const threadTitle = message.content.trim() !== '' ? message.content : `Media by ${displayName} on ${currentDate}`;
            try {
                const thread = await message.startThread({
                    name: threadTitle,
                    autoArchiveDuration: 60 * 24, // Archive after 24 hour of inactivity
                    reason: 'Media message thread'
                });
                this.container.logger.info(`Created a thread for the media message: ${thread.id}`);
            } catch (error) {
                this.container.logger.error(`Failed to create thread: ${error}`);
            }
        }
    }

    private isMediaAttachment(contentType: string | null): boolean {
        return !!contentType && (contentType.startsWith('image/') || contentType.startsWith('video/'));
    }
}
