// src/utils/lodestone.ts
import axios from 'axios';

export async function fetchLodestoneData(): Promise<any> {
    try {
        const response = await axios.get('https://na.lodestonenews.com/news/all?limit=2');
        return response.data;
    } catch (error) {
        console.error('Error fetching Lodestone data:', error);
        throw error;
    }
}
