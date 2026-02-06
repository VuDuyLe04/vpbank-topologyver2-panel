import React, { useCallback, useMemo, useState } from 'react';
import { ControlsContainer, FullScreenControl, SigmaContainer, ZoomControl } from '@react-sigma/core';
import '@react-sigma/core/lib/style.css';
import { GraphSearch, GraphSearchOption } from '@react-sigma/graph-search';
import '@react-sigma/graph-search/lib/style.css';
import { MiniMap } from '@react-sigma/minimap';
import { RawNodeData, RawEdgeData } from '../../types';
import { LoadGraph } from './LoadGraph';

interface CanvasProps {
    width: number;
    height: number;
    nodes: RawNodeData[];
    edges: RawEdgeData[];
}

export const Canvas: React.FC<CanvasProps> = ({ width, height, nodes, edges }) => {
    const [selectedNode, setSelectedNode] = useState<string | null>(null);

    // Create a unique key based on node IDs to force GraphSearch remount when nodes change
    // const graphKey = useMemo(() => {
    //     return nodes.map(n => n.id).join('-');
    // }, [nodes]);

    const onFocus = useCallback((value: GraphSearchOption | null) => {
        if (value === null) setSelectedNode(null);
        else if (value.type === 'nodes') setSelectedNode(value.id);
    }, []);

    const onChange = useCallback((value: GraphSearchOption | null) => {
        if (value === null) setSelectedNode(null);
        else if (value.type === 'nodes') setSelectedNode(value.id);
    }, []);

    const postSearchResult = useCallback((options: GraphSearchOption[]): GraphSearchOption[] => {
        return options.length <= 10
            ? options
            : [
                ...options.slice(0, 10),
                {
                    type: 'message',
                    message: <span className="text-center text-muted">And {options.length - 10} others</span>,
                },
            ];
    }, []);

    return (
        <SigmaContainer
            settings={{
                allowInvalidContainer: true,
                labelFont: "Inter, sans-serif",
                labelWeight: "300",
                labelColor: { color: "#ffffff" },
                labelSize: 12,

                labelRenderedSizeThreshold: 6,

                defaultNodeColor: "#3498db",
                defaultEdgeColor: "#ff0000ff",

                labelGridCellSize: 60,
            }}
            style={{ width: `${width}px`, height: `${height}px`, backgroundColor: '#111111' }}
        >
            <LoadGraph nodes={nodes} edges={edges} />

            {/* Search in top-right */}
            <ControlsContainer position={'top-right'}>
                <GraphSearch
                    // key={graphKey}
                    type="nodes"
                    value={selectedNode ? { type: 'nodes', id: selectedNode } : null}
                    onFocus={onFocus}
                    onChange={onChange}
                    postSearchResult={postSearchResult}
                />
            </ControlsContainer>

            {/* Controls in bottom-left */}
            <ControlsContainer position={'bottom-left'}>
                <ZoomControl />
                <FullScreenControl />
            </ControlsContainer>

            {/* Minimap in bottom-right */}
            <ControlsContainer position={'bottom-right'}>
                <MiniMap width="100px" height="100px" />
            </ControlsContainer>
        </SigmaContainer>
    );
};
