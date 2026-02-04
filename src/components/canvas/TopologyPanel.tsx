import React, {useState, useEffect} from 'react';
import { css } from '@emotion/css';
import { GrafanaTheme2, PanelProps } from '@grafana/data';
import { useTheme2, useStyles2 } from '@grafana/ui';

import { Options as TopologyOptions } from '../../config/panelCfg';
import { LayerLeftSide } from './LayerLeftSide';

import {extractTopologyData} from '../../utils/dataFrameTransformer';
import { useHover } from '../../utils/useHover';   
import { RawNodeData, RawEdgeData } from 'types';

const getStyles = (theme: GrafanaTheme2) => ({
    wrapper: css({
        width: '100%',
        height: '100%',
        fontFamily: theme.typography.fontFamily,
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
    }),
    leftContainer: css({
        width: '16.67%', // Bạn có thể chỉnh lại thành 20% tùy ý
        height: '100%',
        display: 'flex',
        flexDirection: 'column', // Chia theo chiều dọc
        borderRight: `1px solid ${theme.colors.border.weak}`,
    }),
    // Các lớp (layers) chia đều
    layerItem: css({
        flex: 1, // Chia đều không gian (1/5 mỗi phần)
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // Đan xen màu: phần lẻ màu đậm hơn, phần chẵn màu nhạt hơn
        '&:nth-child(odd)': {
            background: theme.colors.background.secondary,
        },
        '&:nth-child(even)': {
            background: theme.colors.background.canvas,
        },
        // Hiệu ứng hover cho giống giao diện chuyên nghiệp
        '&:hover': {
            filter: 'brightness(1.1)',
        }
    }),
    rightGraphContainer: css({
        width: '83.33%',
        height: '100%',
        position: 'relative',
        '.react-flow__node': {
            padding: '0',
            background: 'transparent',
            border: 'none',
            borderRadius: '0',
        },
        '.react-flow__edges, .react-flow .react-flow__edges svg': {
            pointerEvents: 'all',
        },
        '.react-flow__edge': {
            strokeWidth: 2,
            pointerEvents: 'all',
        },
        '.react-flow__edge-path, .react-flow__edge-interaction': {
            pointerEvents: 'stroke',
        },
        '.react-flow__controls': {
            button: {
                backgroundColor: theme.components.panel.background,
                border: `1px solid ${theme.colors.border.medium}`,
                color: theme.colors.text.primary,
                '&:hover': {
                    backgroundColor: theme.components.input.background,
                },
            },
        },
        '.react-flow__attribution': {
            display: 'none',
        },
    }),
});

interface Props extends PanelProps<TopologyOptions> { }

export const TopologyPanel: React.FC<Props> = ({
    options,
    data,
    width,
    height,
    fieldConfig,
    id,
}) => {
    const theme = useTheme2();
    const styles = useStyles2(() => getStyles(theme));

    // const graphWidth = (width * 5) / 6;
    const [pick, setPick] = useState<number>(0);

    const [cnt, setCnt] = useState<number[]>([]);
    const [debug, setDebug] = useState<any>("");

    const [mapBackToLayer, setMapBackToLayer] = useState<Map<string, number>>(new Map());
    const [listNodesInGraph, setListNodes] = useState<RawNodeData[]>([]);
    const [listEdgesInGraph, setListEdges] = useState<RawEdgeData[]>([]);
    const [rawNodes, setRawNodes] = useState<RawNodeData[]>([]);
    const [rawEdges, setRawEdges] = useState<RawEdgeData[]>([]);

    useEffect(() => {
        const dataSeries = data?.series ?? [];
        const [nwRawNodes, nwRawEdges] = extractTopologyData(dataSeries, undefined);

        setRawNodes(nwRawNodes);
        setRawEdges(nwRawEdges);

        let mapBack: Map<string, number> = new Map();
        let newCnt: number[] = new Array(options.layers.length).fill(0);
        for (let i = 0; i < nwRawNodes.length; i++) {
            newCnt[nwRawNodes[i].layer] ++;
            mapBack.set(nwRawNodes[i].id, nwRawNodes[i].layer);
        }

        setDebug(<div>
            {nwRawEdges.map((edge, index) => (
                <div>
                    ID: {edge.id}, Source: {edge.source}, Target: {edge.target}
                     pick: {pick}  Map: {mapBack.get(edge.source)} - {mapBack.get(edge.target)}
                </div>
            ))}
        </div>);

        setMapBackToLayer(mapBack);
        setCnt(newCnt);
    }, [options, data, width, height, fieldConfig, id]);

    useEffect(() => {
        let cntNodesInGraph: RawNodeData[] = [];
        let cntEdgesInGraph: RawEdgeData[] = [];
        for (let i = 0; i < rawNodes.length; i++) {
            if (rawNodes[i].layer == pick) {
                cntNodesInGraph.push(rawNodes[i]);
            }
        }

        for (let i = 0; i < rawEdges.length; i++) {
            if (mapBackToLayer.get(rawEdges[i].source.id) == pick && mapBackToLayer.get(rawEdges[i].target.id) == pick) {
                cntEdgesInGraph.push(rawEdges[i]);
            }

            setDebug(<div>
                {mapBackToLayer.get(rawEdges[i].source.id)} - {mapBackToLayer.get(rawEdges[i].target.id)}
                -- {pick}
                -- {mapBackToLayer.get(rawEdges[i].source.id) == pick} -- {mapBackToLayer.get(rawEdges[i].target.id) == pick}
            </div>
            );
        }
        setListNodes(cntNodesInGraph);
        setListEdges(cntEdgesInGraph);

        // setDebug(<div>
        //     {cntNodesInGraph.map((node, index) => (
        //         <div>
        //             ID: {node.id}, Title: {node.title}, Layer: {node.layer}
        //         </div>
        //     ))}
        //     {cntEdgesInGraph.length} {pick}
        //     {cntEdgesInGraph.map((edge, index) => (
        //         <div>
        //             ID: {edge.id}, Source: {edge.source}, Target: {edge.target}
        //             pick: {pick}
        //         </div>
        //     ))}
        // </div>);
    }, [pick]);

    return (
        <div className={styles.wrapper}>
            <LayerLeftSide
                numErrors={[1, 1]}
                numNodes={cnt}
                width={width / 6}
                height={height}
                layers={options.layers}
                pick={pick}
                onPickChange={setPick}
            />

            <div className={styles.rightGraphContainer}>
                {debug}
            </div>

            {/* <
            /> */}
        </div>
    );
};

export { TopologyPanel as SimplePanel };
