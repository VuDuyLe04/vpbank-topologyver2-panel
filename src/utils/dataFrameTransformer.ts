import { DataFrame, Field } from '@grafana/data';
import { RawNodeData, RawEdgeData } from '../types';

/**
 * Configuration for parsing node and edge data from Grafana DataFrames
 */
export interface DataFrameParseConfig {
    nodeIdField?: string;
    nodeTitleField?: string;
    nodeLayerField?: string;
    nodeTypeField?: string;
    nodeSubTitleField?: string;
    nodeMainStatField?: string;
    nodeSecondaryStatField?: string;
    nodeColorField?: string;
    nodeBorderColorField?: string;
    nodeBackgroundColorField?: string;
    nodeIconColorField?: string;
    nodeIconField?: string;
    nodeLinkUrlField?: string;

    edgeIdField?: string;
    edgeSourceField?: string;
    edgeTargetField?: string;
    edgeMainStatField?: string;
    edgeSecondaryStatField?: string;
    edgeColorField?: string;
    edgeThicknessField?: string;
    edgeStrokeDasharrayField?: string;
}

/**
 * Default field names to look for in DataFrames
 */
const DEFAULT_PARSE_CONFIG: DataFrameParseConfig = {
    nodeIdField: 'id',
    nodeTitleField: 'title',
    nodeLayerField: 'layer',
    nodeTypeField: 'type',
    nodeSubTitleField: 'subtitle',
    nodeMainStatField: 'main_stat',
    nodeSecondaryStatField: 'secondary_stat',
    nodeColorField: 'color',
    nodeBorderColorField: 'borderColor',
    nodeBackgroundColorField: 'backgroundColor',
    nodeIconColorField: 'iconColor',
    nodeIconField: 'icon',
    nodeLinkUrlField: 'linkURL',

    edgeIdField: 'id',
    edgeSourceField: 'source',
    edgeTargetField: 'target',
    edgeMainStatField: 'main_stat',
    edgeSecondaryStatField: 'secondary_stat',
    edgeColorField: 'color',
    edgeThicknessField: 'thickness',
    edgeStrokeDasharrayField: 'strokeDasharray',
};

/**
 * Transformer to convert Grafana DataFrames to topology node and edge data
 */
export class DataFrameTransformer {
    private config: DataFrameParseConfig;

    constructor(config: Partial<DataFrameParseConfig> = {}) {
        this.config = { ...DEFAULT_PARSE_CONFIG, ...config };
    }

    /**
     * Transforms node DataFrame into RawNodeData array
     * 
     * @param dataFrame - Node DataFrame from Grafana
     * @returns Array of raw node data
     */
    public transformNodes(dataFrame: DataFrame): RawNodeData[] {
        const nodes: RawNodeData[] = [];

        // Find required fields - try exact match first, then fallback to first available fields
        let idField = this.findField(dataFrame, this.config.nodeIdField);
        let titleField = this.findField(dataFrame, this.config.nodeTitleField);
        let layerField = this.findField(dataFrame, this.config.nodeLayerField?.toString());

        // Fallback: if no explicit fields found, use first two string fields
        if (!idField || !titleField) {
            const stringFields = dataFrame.fields.filter(f => f.type === 'string' || f.type === 'number');
            if (stringFields.length === 0) {
                console.warn('Node DataFrame has no string/number fields');
                return nodes;
            }
            idField = idField || stringFields[0];
            titleField = titleField || (stringFields.length > 1 ? stringFields[1] : stringFields[0]);
        }

        if (!idField || !titleField) {
            console.warn('Node DataFrame missing required id or title fields');
            console.warn('Available fields:', dataFrame.fields.map(f => f.name).join(', '));
            return nodes;
        }

        const subtitleField = this.findField(dataFrame, this.config.nodeSubTitleField);
        const typeField = this.findField(dataFrame, this.config.nodeTypeField);
        const mainStatField = this.findField(dataFrame, this.config.nodeMainStatField);
        const secondaryStatField = this.findField(dataFrame, this.config.nodeSecondaryStatField);
        const colorField = this.findField(dataFrame, this.config.nodeColorField);
        const borderColorField = this.findField(dataFrame, this.config.nodeBorderColorField);
        const backgroundColorField = this.findField(dataFrame, this.config.nodeBackgroundColorField);
        const iconColorField = this.findField(dataFrame, this.config.nodeIconColorField);
        const iconField = this.findField(dataFrame, this.config.nodeIconField);
        const linkUrlField = this.findField(dataFrame, this.config.nodeLinkUrlField);

        const rowCount = idField.values.length;

        for (let i = 0; i < rowCount; i++) {
            const nodeId = String(idField.values[i]);
            const title = String(titleField.values[i]);

            if (!nodeId || !title) {
                continue;
            }

            const getStrValue = (field: Field | undefined, i: number) => {
                if (!field) return undefined;
                const val = field.values[i];
                return val != null ? String(val) : undefined;
            };

            const node: RawNodeData = {
                id: nodeId,
                title,
                layer: layerField ? Number(layerField.values[i]) : 0,
                // dataFrameRowIndex: i,
                type: getStrValue(typeField, i),
                subTitle: getStrValue(subtitleField, i),
                mainStat: mainStatField,
                secondaryStat: secondaryStatField,
                color: colorField,
                borderColor: borderColorField ? {
                    ...borderColorField,
                    values: [borderColorField.values[i]]
                } : undefined,
                backgroundColor: backgroundColorField ? {
                    ...backgroundColorField,
                    values: [backgroundColorField.values[i]]
                } : undefined,
                iconColor: iconColorField ? {
                    ...iconColorField,
                    values: [iconColorField.values[i]]
                } : undefined,
                icon: iconField ? (String(iconField.values[i]) as any) : undefined,
                linkURL: getStrValue(linkUrlField, i),
            };

            // Extract metadata from extra fields
            const metadata: Record<string, unknown> = {};

            // Helper to check if a field is one of the mapped core fields
            const isMappedField = (fieldName: string) => {
                const normalize = (s: string) => s.toLowerCase().replace(/[_\-\s]/g, '');
                const target = normalize(fieldName);

                const mappedFields = [
                    this.config.nodeIdField,
                    this.config.nodeTitleField,
                    this.config.nodeTypeField,
                    this.config.nodeSubTitleField,
                    this.config.nodeMainStatField,
                    this.config.nodeSecondaryStatField,
                    this.config.nodeColorField,
                    this.config.nodeBorderColorField,
                    this.config.nodeBackgroundColorField,
                    this.config.nodeIconColorField,
                    this.config.nodeIconField,
                    this.config.nodeLinkUrlField
                ];

                return mappedFields.some(mapped => mapped && normalize(mapped) === target);
            };

            dataFrame.fields.forEach(field => {
                // Skip mapped fields
                const isMapped = isMappedField(field.name);
                if (field.name === 'linkURL') {
                    // console.log('[Transformer] Checking field linkURL. IsMapped:', isMapped, 'Config:', this.config.nodeLinkUrlField);
                }
                if (isMapped) {
                    return;
                }

                // Add to metadata
                const value = field.values[i];
                if (value !== null && value !== undefined) {
                    metadata[field.name] = value;
                }
            });

            if (Object.keys(metadata).length > 0) {
                node.metadata = metadata;
            }

            nodes.push(node);
        }

        return nodes;
    }

    /**
     * Transforms edge DataFrame into RawEdgeData array
     * 
     * @param dataFrame - Edge DataFrame from Grafana
     * @returns Array of raw edge data
     */
    public transformEdges(dataFrame: DataFrame): RawEdgeData[] {
        const edges: RawEdgeData[] = [];

        // Find required fields - try exact match first, then fallback to first two string fields
        let sourceField = this.findField(dataFrame, this.config.edgeSourceField);
        let targetField = this.findField(dataFrame, this.config.edgeTargetField);

        // Fallback: if no explicit fields found, use first two string fields
        if (!sourceField || !targetField) {
            const stringFields = dataFrame.fields.filter(f => f.type === 'string' || f.type === 'number');
            if (stringFields.length === 0) {
                console.warn('Edge DataFrame has no string/number fields');
                return edges;
            }
            sourceField = sourceField || stringFields[0];
            targetField = targetField || (stringFields.length > 1 ? stringFields[1] : stringFields[0]);
        }

        if (!sourceField || !targetField) {
            console.warn('Edge DataFrame missing required source or target fields');
            console.warn('Available fields:', dataFrame.fields.map(f => f.name).join(', '));
            return edges;
        }

        const idField = this.findField(dataFrame, this.config.edgeIdField);
        const mainStatField = this.findField(dataFrame, this.config.edgeMainStatField);
        const secondaryStatField = this.findField(dataFrame, this.config.edgeSecondaryStatField);
        const colorField = this.findField(dataFrame, this.config.edgeColorField);
        const thicknessField = this.findField(dataFrame, this.config.edgeThicknessField);
        const dashField = this.findField(dataFrame, this.config.edgeStrokeDasharrayField);

        const rowCount = sourceField.values.length;

        for (let i = 0; i < rowCount; i++) {
            const source = String(sourceField.values[i]);
            const target = String(targetField.values[i]);

            if (!source || !target) {
                continue;
            }

            const edgeId = idField ? String(idField.values[i]) : `${source}-${target}-${i}`;

            const edge: RawEdgeData = {
                id: edgeId,
                source,
                target,
                // dataFrameRowIndex: i,
                mainStat: mainStatField,
                secondaryStat: secondaryStatField,
                color: colorField ? String(colorField.values[i]) : undefined,
                thickness: thicknessField ? Number(thicknessField.values[i]) : undefined,
                strokeDasharray: dashField ? String(dashField.values[i]) : undefined,
            };

            edges.push(edge);
        }

        return edges;
    }

    /**
     * Finds a field in DataFrame by name (case-insensitive and ignores underscores)
     */
    private findField(dataFrame: DataFrame, fieldName?: string): Field | undefined {
        if (!fieldName) {
            return undefined;
        }

        // 1. Exact match
        let field = dataFrame.fields.find(f => f.name === fieldName);
        if (field) {
            return field;
        }

        // 2. Case-insensitive match
        field = dataFrame.fields.find(f => f.name.toLowerCase() === fieldName.toLowerCase());
        if (field) {
            return field;
        }

        // 3. Normalized match (ignore underscores and dashes, lowercase)
        // This handles mapping "main_stat" <-> "mainStat" <-> "Main Stat"
        const normalize = (s: string) => s.toLowerCase().replace(/[_\-\s]/g, '');
        const normalizedTarget = normalize(fieldName);

        field = dataFrame.fields.find(f => normalize(f.name) === normalizedTarget);
        if (field) {
            return field;
        }

        return undefined;
    }
}

/**
 * Creates a new transformer with optional configuration
 */
export function createDataFrameTransformer(config?: Partial<DataFrameParseConfig>): DataFrameTransformer {
    return new DataFrameTransformer(config);
}

/**
 * Helper function to extract nodes and edges from Grafana data series
 * 
 * @param dataSeries - Array of DataFrames
 * @param config - Optional parse configuration
 * @returns Tuple of [nodes, edges]
 */
export function extractTopologyData(
    dataSeries: DataFrame[],
    config?: Partial<DataFrameParseConfig>
): [RawNodeData[], RawEdgeData[]] {
    const transformer = createDataFrameTransformer(config);

    // Assuming first series is nodes, second is edges (standard pattern)
    let nodes: RawNodeData[] = [];
    let edges: RawEdgeData[] = [];

    if (dataSeries.length > 0) {
        // Try to identify node and edge DataFrames
        const nodesFrame = dataSeries.find(df =>
            df.name?.toLowerCase().includes('node') || df.refId === 'A'
        ) || dataSeries[0];

        const edgesFrame = dataSeries.find(df =>
            df.name?.toLowerCase().includes('edge') || df.refId === 'B'
        ) || dataSeries[1];

        nodes = transformer.transformNodes(nodesFrame);

        if (edgesFrame) {
            edges = transformer.transformEdges(edgesFrame);
        }
    }

    return [nodes, edges];
}
