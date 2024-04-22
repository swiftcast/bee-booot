import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import { ChannelType, ChatInputCommandInteraction, PermissionsBitField } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';


@ApplyOptions<Command.Options>({
    name: 'set-image-channel',
    description: 'Sets a channel where only images are allowed',
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

        const config = { imageOnlyChannelId: channelOption.id };
        fs.writeFileSync(this.configPath, JSON.stringify(config));
        
        return interaction.reply({
            content: `Set <#${channelOption.id}> as the image-only channel.`,
            ephemeral: true
        });
    }
}
