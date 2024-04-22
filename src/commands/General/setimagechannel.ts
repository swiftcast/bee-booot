import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { ChannelType, ChatInputCommandInteraction, PermissionsBitField } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';

@ApplyOptions<Command.Options>({
    name: 'set-image-channel',
    description: 'Sets channels where only images are allowed',
    requiredUserPermissions: [PermissionsBitField.Flags.ManageGuild],
    preconditions: ['GuildOnly']
})
export class UserCommand extends Command {

    private configPath = path.join(process.cwd(), 'config.json');
    
    public override registerApplicationCommands(registry: Command.Registry): void {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName('set-image-channel')
                .setDescription(this.description)
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel to set as image-only')
                        .setRequired(true)
                        .addChannelTypes(ChannelType.GuildText) // Limit to text channels only
                )
        );
    }

    public override async chatInputRun(interaction: ChatInputCommandInteraction) {
        const channelOption = interaction.options.getChannel('channel', true);

        if (!channelOption || channelOption.type !== ChannelType.GuildText) {
            return interaction.reply({ content: 'Please select a valid text channel.', ephemeral: true });
        }

        // Read existing config or create a new one if it doesn't exist
        let config;
        try {
            config = JSON.parse(fs.readFileSync(this.configPath, 'utf8'));
        } catch (error) {
            config = { imageOnlyChannelIds: [] };
        }

        // Add the new channel ID to the array if it's not already included
        if (!config.imageOnlyChannelIds.includes(channelOption.id)) {
            config.imageOnlyChannelIds.push(channelOption.id);
        } else {
            return interaction.reply({
                content: `Channel <#${channelOption.id}> is already set as an image-only channel.`,
                ephemeral: true
            });
        }

        // Save the updated config
        fs.writeFileSync(this.configPath, JSON.stringify(config, null, 4));
        
        return interaction.reply({
            content: `Added <#${channelOption.id}> to image-only channels.`,
            ephemeral: true
        });
    }
}
