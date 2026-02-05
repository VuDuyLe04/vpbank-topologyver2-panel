import { IconName } from '@grafana/ui';

export interface Options {
    // Layout customization
    nodeSpacing?: number;
    layerHeight?: number;

    // Node rendering
    enableDrag?: boolean;

    nodes?: {
        mainStatUnit?: string;
        secondaryStatUnit?: string;
    };

    edges?: {
        mainStatUnit?: string;
        secondaryStatUnit?: string;
    };

    layers: LayerConfig[];
}

export interface LayerConfig {
    label: string;
    icon: IconName;
    description: string;
}
