import { ApplyOptions } from '@sapphire/decorators';
import { Command, CommandOptionsRunTypeEnum } from '@sapphire/framework';
import { CommandInteraction } from 'discord.js';

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

                // Format the reply
                let replyMessage = `**Random Bee Observation Details:**\n`;
                replyMessage += `**Species Guess:** ${randomObservation.species_guess}\n`;
                replyMessage += `**Location:** ${randomObservation.location}\n`;
                replyMessage += `**Observed On:** ${randomObservation.observed_on}\n`;
                if (randomObservation.photos.length > 0) {
                    replyMessage += `**Photo URL:** ${randomObservation.photos[0].url}`;
                } else {
                    replyMessage += 'No photo available.';
                }

                await interaction.editReply(replyMessage);
            } else {
                await interaction.editReply('No observations found.');
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
            await interaction.editReply('Failed to fetch data. Please try again later.');
        }
    }
}
