import { Events } from '@sapphire/framework';
import { Message, ThreadChannel, TextChannel, User, Attachment, Collection } from 'discord.js';
import { MediaMessageOnlyListener } from '../src/listeners/MediaMessageOnlyListener';
import { jest } from '@jest/globals';

const mockFs = {
  watch: jest.fn(),
  existsSync: jest.fn().mockReturnValue(true),
  readFileSync: jest.fn().mockReturnValue(JSON.stringify({ imageOnlyChannelIds: ['123'] })),
};

jest.mock('fs', () => mockFs);

describe('MediaMessageOnlyListener', () => {
  let listener: MediaMessageOnlyListener;
    let mockMessage: Partial<Message>;
    let mockChannel: Partial<TextChannel>;
    let mockUser: Partial<User>;

    const createMockAttachment = (url: string, contentType: string): Attachment => ({
        url,
        contentType,
        name: 'mockAttachment',
        size: 1024,
        id: 'attachment123',
        proxyURL: url,
        height: 100,
        width: 100,
    } as unknown as Attachment);

  beforeEach(() => {
        listener = new MediaMessageOnlyListener({} as any, { event: Events.MessageCreate });

        const mockUser: Partial<User> = {
        bot: false,
            id: '123',
            username: 'testUser',
            toString() {
                return `<@${this.id}>`;
            },
            valueOf() {
                return this.id;
            }
        };

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
