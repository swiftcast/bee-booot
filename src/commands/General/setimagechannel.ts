import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { ChannelType, ChatInputCommandInteraction, PermissionsBitField } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';

@ApplyOptions<Command.Options>({
    name: 'toggle-image-channel',
    description: 'Toggles a channel as image-only on or off',
    requiredUserPermissions: [PermissionsBitField.Flags.ManageGuild],
    preconditions: ['GuildOnly']
})
export class UserCommand extends Command {

    private configPath = path.join(process.cwd(), 'config.json');
    
    public override registerApplicationCommands(registry: Command.Registry): void {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName('toggle-image-channel')
                .setDescription(this.description)
                .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)  // Set default permissions required to see and use the command
                .setDMPermission(false)  // Disallow use in DMs
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('The channel to toggle as image-only')
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
            if (!config.imageOnlyChannelIds) {
                config.imageOnlyChannelIds = [];
            }
        } catch (error) {
            config = { imageOnlyChannelIds: [] };
        }

        const index = config.imageOnlyChannelIds.indexOf(channelOption.id);

        let replyMessage;
        // Toggle the channel ID in the array
        if (index === -1) {
            config.imageOnlyChannelIds.push(channelOption.id);
            replyMessage = `Added <#${channelOption.id}> to image-only channels.`;
        } else {
            config.imageOnlyChannelIds.splice(index, 1);
            replyMessage = `Removed <#${channelOption.id}> from image-only channels.`;
        }

        // Save the updated config
        fs.writeFileSync(this.configPath, JSON.stringify(config, null, 4));
        
        return interaction.reply({
            content: replyMessage,
            ephemeral: true
        });
    }
}
