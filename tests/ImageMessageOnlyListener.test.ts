import { Events } from '@sapphire/framework';
import { Message, TextChannel, User, Attachment, Collection } from 'discord.js';
import { MediaMessageOnlyListener } from '../src/listeners/MediaMessageOnlyListener';
import { jest } from '@jest/globals';

// Mock the fs module
jest.mock('fs', () => ({
    watch: jest.fn(),
    existsSync: jest.fn().mockReturnValue(true),
    readFileSync: jest.fn().mockReturnValue(JSON.stringify({ imageOnlyChannelIds: ['123'] })),
  }));

describe('MediaMessageOnlyListener', () => {
    let listener: MediaMessageOnlyListener;
    let mockMessage: Partial<Message>;
    let mockChannel: Partial<TextChannel>;
    //let mockUser: Partial<User>;

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
                return this.id!;
            }
        };

        mockChannel = {
            id: '123',
            send: jest.fn().mockResolvedValue({
                startThread: jest.fn().mockResolvedValue({
                    id: 'thread123',
                } as never)
            } as never),
            messages: {
                delete: jest.fn().mockResolvedValue(undefined as never)
            }
        } as unknown as Partial<TextChannel>;

        mockMessage = {
            id: 'message123',
            channel: mockChannel as TextChannel,
            author: mockUser as User,
            attachments: new Collection<string, Attachment>(),
            delete: jest.fn().mockResolvedValue({
                id: '123',
                author: { username: 'testUser' } as User,
                content: 'Mock message content',
                channel: {} as TextChannel,
                toString: () => '<@123>'
            } as never),
            content: ''
        } as unknown as Partial<Message>;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('should delete messages without media', async () => {
        await listener.run(mockMessage as Message);
        expect(mockMessage.delete).toHaveBeenCalled();
        expect(mockChannel.send).toHaveBeenCalledWith(expect.stringContaining('Please weave any discussions into a separate thread or continue in another channel.'));
    });

    test('should not delete messages with image', async () => {
        const imageAttachment = createMockAttachment('https://example.com/image.png', 'image/png');
        mockMessage.attachments = new Collection<string, Attachment>().set('image', imageAttachment);

        await listener.run(mockMessage as Message);
        expect(mockMessage.delete).not.toHaveBeenCalled();
        expect(mockChannel.send).not.toHaveBeenCalled();
    });

    test('should not delete messages with video', async () => {
        const videoAttachment = createMockAttachment('https://example.com/video.mp4', 'video/mp4');
        mockMessage.attachments = new Collection<string, Attachment>().set('video', videoAttachment);

        await listener.run(mockMessage as Message);
        expect(mockMessage.delete).not.toHaveBeenCalled();
        expect(mockChannel.send).not.toHaveBeenCalled();
    });

    test('should ignore messages from bots', async () => {
        mockMessage.author!.bot = true;
        await listener.run(mockMessage as Message);
        expect(mockMessage.delete).not.toHaveBeenCalled();
        expect(mockChannel.send).not.toHaveBeenCalled();
    });
});