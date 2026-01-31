export interface AspectRatio {
    name: string;
    width: number;
    height: number;
    label: string;
}

export const ASPECT_RATIOS: Record<string, AspectRatio> = {
    '1:1': { name: '1:1', width: 1080, height: 1080, label: 'Square (1:1)' },
    '9:16': { name: '9:16', width: 1080, height: 1920, label: 'Story (9:16)' },
    '16:9': { name: '16:9', width: 1920, height: 1080, label: 'Landscape (16:9)' },
};

export const DEFAULT_ASPECT_RATIO = '1:1';
