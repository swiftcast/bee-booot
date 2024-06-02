import { promises as fs } from 'fs';
import * as path from 'path';

const storagePath = path.join(__dirname, '../../data/storage.json');

export async function readLastUpdateTime(): Promise<number> {
    try {
        const data = await fs.readFile(storagePath, 'utf-8');
        const json = JSON.parse(data);
        return json.lastUpdate || 0;
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
            // File does not exist, create it
            await writeLastUpdateTime(0);
            return 0;
        } else {
            console.error('Error reading last update time:', error);
            throw error;
        }
    }
}

export async function writeLastUpdateTime(time: number): Promise<void> {
    try {
        const data = JSON.stringify({ lastUpdate: time }, null, 2);
        await fs.writeFile(storagePath, data, 'utf-8');
    } catch (error) {
        console.error('Error writing last update time:', error);
    }
}
