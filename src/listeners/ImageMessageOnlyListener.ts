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

        const hasImage = message.attachments.some(attachment => this.isImageAttachment(attachment.contentType));

        if (!hasImage) {
            try {
                await message.delete();
                const warningMessage = await message.channel.send("Only images are allowed in this channel so everyone's pictures have time to be pollinated by the hive! Please create a thread if you want to discuss them or continue in a different channel. Thank you for your understanding. 🐝");
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
