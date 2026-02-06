import React from 'react';
import { StandardEditorProps, availableIconsIndex, IconName } from '@grafana/data';
import { Button, Input, Select, IconButton, Field, TextArea } from '@grafana/ui';
import { css } from '@emotion/css';
import { LayerConfig } from './panelCfg';

interface Props extends StandardEditorProps<LayerConfig[]> { }

export const LayerEditor: React.FC<Props> = ({ value, onChange }) => {
    const layers = value || [];

    React.useEffect(() => {
        if (!value || value.length === 0) {
            onChange([
                { label: 'Layer 1', icon: 'circle', description: '' },
                { label: 'Layer 2', icon: 'circle', description: '' },
            ]);
        }
    }, []);

    const onAddLayer = () => {
        if (layers.length >= 10) {
            return;
        }
        const newLayer: LayerConfig = {
            label: `Layer ${layers.length + 1}`,
            icon: 'circle',
            description: '',
        };
        onChange([...layers, newLayer]);
    };

    const onRemoveLayer = (index: number) => {
        if (layers.length <= 2) {
            return;
        }
        const newLayers = [...layers];
        newLayers.splice(index, 1);
        onChange(newLayers);
    };

    const onLayerChange = (index: number, newConfig: LayerConfig) => {
        const newLayers = [...layers];
        newLayers[index] = newConfig;
        onChange(newLayers);
    };

    // Generate icon options from all available Grafana icons
    const iconOptions = Object.keys(availableIconsIndex).map((iconName) => ({
        value: iconName,
        label: iconName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
    }));

    return (
        <div>
            {layers.map((layer, index) => (
                <div
                    key={index}
                    className={css`
            margin-bottom: 16px;
            padding: 8px;
            border: 1px solid rgba(204, 204, 220, 0.15);
            border-radius: 4px;
          `}
                >
                    <div
                        className={css`
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;
            `}
                    >
                        <h6 style={{ margin: 0 }}>Layer {index + 1}</h6>
                        {layers.length > 2 && (
                            <IconButton name="trash-alt" tooltip="Remove Layer" onClick={() => onRemoveLayer(index)} />
                        )}
                    </div>

                    <Field label="Label">
                        <Input
                            value={layer.label}
                            onChange={(e) => onLayerChange(index, { ...layer, label: e.currentTarget.value })}
                        />
                    </Field>

                    <Field label="Icon">
                        <Select
                            options={iconOptions}
                            value={layer.icon}
                            onChange={(v) => onLayerChange(index, { ...layer, icon: (v.value as IconName) || ('circle' as IconName) })}
                        />
                    </Field>

                    <Field label="Description">
                        <TextArea
                            value={layer.description}
                            onChange={(d) => onLayerChange(index, { ...layer, description: d.currentTarget.value })}
                        />
                    </Field>
                </div>
            ))}
            <Button variant="secondary" onClick={onAddLayer} icon="plus" disabled={layers.length >= 10}>
                Add Layer
            </Button>
        </div>
    );
};
