import { useEffect } from 'react';
import { useSigma } from '@react-sigma/core';
import { RawNodeData, RawEdgeData } from '../../types';

interface LoadGraphProps {
    nodes: RawNodeData[];
    edges: RawEdgeData[];
}

export const LoadGraph: React.FC<LoadGraphProps> = ({ nodes, edges }) => {
    const sigma = useSigma();
    const graph = sigma.getGraph();

    useEffect(() => {
        // Clear existing graph
        graph.clear();

        if (!nodes || nodes.length === 0) {
            return;
        }

        // Calculate circular layout
        const radius = 200;
        const centerX = 0;
        const centerY = 0;

        // Add nodes with circular layout
        nodes.forEach((node, index) => {
            const angle = (2 * Math.PI * index) / nodes.length;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);

            graph.addNode(node.id, {
                label: node.title,
                x,
                y,
                size: 15,
                color: node.backgroundColor?.values?.[0] || '#4A90E2',
            });
        });

        // Add edges
        if (edges && edges.length > 0) {
            edges.forEach((edge) => {
                // Only add edge if both source and target nodes exist
                if (graph.hasNode(edge.source) && graph.hasNode(edge.target)) {
                    graph.addEdge(edge.source, edge.target, {
                        size: edge.thickness || 2,
                        color: edge.color || '#999',
                    });
                }
            });
        }

        // Refresh the sigma instance
        sigma.refresh();
    }, [nodes, edges, graph, sigma]);

    return null;
};
