import { FieldConfigProperty, PanelPlugin } from '@grafana/data';
import { t as i18nT } from '@grafana/i18n';
import { SimplePanel } from './components/canvas/TopologyPanel';
import { Options as TopologyOptions } from './config/panelCfg';
import { LayerEditor } from 'config/LayerEditor';

function t(key: string, defaultValue?: string): string {
  try {
    return i18nT(key, defaultValue ?? key);
  } catch {
    return defaultValue ?? key;
  }
}

export const plugin = new PanelPlugin<TopologyOptions>(SimplePanel)
  .useFieldConfig({
    disableStandardOptions: Object.values(FieldConfigProperty).filter((v) => v !== FieldConfigProperty.Links),
  })
  .setPanelOptions((builder, context) => {
    const category = [t('topology-graph.category-node-graph', 'Topology Graph')];
    builder.addBooleanSwitch({
      name: 'Enable Drag',
      category,
      path: 'enableDrag',
      defaultValue: true,
    });
    builder.addNumberInput({
      name: 'Node spacing',
      category,
      path: 'nodeSpacing',
      defaultValue: 250,
    });
    builder.addNumberInput({
      name: 'Layer height',
      category,
      path: 'layerHeight',
      defaultValue: 200,
    });
    builder.addCustomEditor({
      id: 'layers',
      path: 'layers',
      name: 'Layers',
      description: 'Add and configure layers',
      editor: LayerEditor,
      defaultValue: [],
    });
    builder.addNestedOptions({
      category: [t('topology-graph.category-nodes', 'Nodes')],
      path: 'nodes',
      build: (builder) => {
        builder.addUnitPicker({
          name: 'Main stat unit',
          path: 'mainStatUnit',
        });
        builder.addUnitPicker({
          name: 'Secondary stat unit',
          path: 'secondaryStatUnit',
        });
      },
    });
    builder.addNestedOptions({
      category: [t('topology-graph.category-edges', 'Edges')],
      path: 'edges',
      build: (builder) => {
        builder.addUnitPicker({
          name: 'Main stat unit',
          path: 'mainStatUnit',
        });
        builder.addUnitPicker({
          name: 'Secondary stat unit',
          path: 'secondaryStatUnit',
        });
      },
    });
  });
