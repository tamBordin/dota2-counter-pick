import axios from 'axios';
import { NextResponse } from 'next/server';

type PatchInfo = {
  patches: { patch_number: string; patch_name: string; patch_timestamp: number; }[]
  success: number
};

export async function GET() {
  try {
    const { data } = await axios.get<PatchInfo>('https://www.dota2.com/datafeed/patchnoteslist?language=english');

    if (data && data.success && data.patches) {
      const latestPatch = data.patches[data.patches.length - 1];
      return NextResponse.json({
        version: latestPatch.patch_name,
        timestamp: latestPatch.patch_timestamp
      });
    }

    throw new Error('Invalid response from Valve');
  } catch (error) {
    console.error('Failed to fetch patch from Valve:', error);
    return NextResponse.json({ version: '7.40c' }, { status: 500 });
  }
}