import { MediaMessageOnlyListener } from '../src/listeners/MediaMessageOnlyListener';
import { Listener } from '@sapphire/framework';
import { Message, AttachmentBuilder, Collection, Snowflake } from 'discord.js';

describe('MediaMessageOnlyListener', () => {
  let listener: MediaMessageOnlyListener;
  let mockMessage: Partial<Message<boolean>>;

  beforeEach(() => {
    listener = new MediaMessageOnlyListener({} as Listener.Context, {});
    mockMessage = {
      author: {
        bot: false,
        tag: 'testUser#1234'
      } as any,
      attachments: new Collection<Snowflake, any>(),
      content: '',
      createdTimestamp: Date.now(),
      id: '123456789',
      channel: {} as any,
      guild: {} as any,
      valueOf: () => 'mockMessage'
    };
  });

  test('should ignore bot messages', async () => {
    mockMessage.author!.bot = true;  // Use non-null assertion

    await listener.run(mockMessage as Message);

    expect(console.log).not.toHaveBeenCalled();
  });

  test('should log message if attachment is an image', async () => {
    console.log = jest.fn();

    const imageAttachment = new AttachmentBuilder('https://example.com/image.png');
    // Manually set the contentType for the test
    (imageAttachment as any).contentType = 'image/png';
    mockMessage.attachments!.set('image', imageAttachment as any);  // Use non-null assertion and cast

    await listener.run(mockMessage as Message);

    expect(console.log).toHaveBeenCalledWith('User testUser#1234 sent an image: https://example.com/image.png');
  });

  test('should not log message if no image attachment', async () => {
    console.log = jest.fn();

    await listener.run(mockMessage as Message);

    expect(console.log).not.toHaveBeenCalled();
  });
});
