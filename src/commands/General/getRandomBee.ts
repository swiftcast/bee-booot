import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { CommandInteraction, EmbedBuilder } from 'discord.js';

interface Observation {
    id: number;
    species_guess: string;
    location: string;
    observed_on: string;
    photos: { url: string }[];
    description: string;
}

interface ObservationApiResponse {
    results: Observation[];
}

@ApplyOptions<Command.Options>({
    name: 'random-bee-observation',
    description: 'Returns info about a random bee observation',
    preconditions: ['GuildOnly']
})

export class RandomBeeObservationCommand extends Command {
    public constructor(context: Command.Context, options: Command.Options) {
        super(context, {
            ...options,
            name: 'randombeeobservation',
            description: 'Fetches information about a random bee observation.',
            runIn: CommandOptionsRunTypeEnum.GuildAny
        });
    }

    public override registerApplicationCommands(registry: Command.Registry): void {
        registry.registerChatInputCommand((builder) =>
            builder
                .setName('random-bee-observation')
                .setDescription(this.description)
                .setDMPermission(false)  // Disallow use in DMs
        );
    }

    public override async chatInputRun(interaction: CommandInteraction) {
        await interaction.deferReply();
        try {
            // Fetch random observations of bees
            const response = await fetch(`https://api.inaturalist.org/v1/observations?taxon_id=630955&order=desc&order_by=created_at&per_page=100`);
            const jsonData = await response.json() as ObservationApiResponse;
            const observations = jsonData.results;

            // Select a random observation from the list
            if (observations.length > 0) {
                const randomObservation = observations[Math.floor(Math.random() * observations.length)];

                // Create an embed message
                const embed = new EmbedBuilder()
                    .setTitle('Random Bee Observation')
                    .setColor(0xF1C40F) // Gold color
                    .addFields(
                        { name: 'Species Guess', value: randomObservation.species_guess, inline: true },
                        { name: 'Location', value: randomObservation.location || 'Unknown', inline: true },
                        { name: 'Observed On', value: randomObservation.observed_on, inline: true }
                    );


                // Add photo if available
                if (randomObservation.photos.length > 0) {
                    embed.setImage(randomObservation.photos[1].url);
                    embed.setURL(randomObservation.photos[0].url);
                }

                // Send the embed message
                await interaction.editReply({ embeds: [embed] });
            } else {
                await interaction.editReply('No observations found.');
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            await interaction.editReply('Failed to fetch data. Please try again later.');
        }
    }
}
