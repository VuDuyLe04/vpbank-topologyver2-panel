import React, { useEffect, useRef } from 'react';
import Konva from 'konva';

interface CanvasProps {
    width: number;
    height: number;
}

export const Canvas: React.FC<CanvasProps> = ({ width, height }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) {
            return;
        }

        const stage = new Konva.Stage({
            container: containerRef.current,
            width: width,
            height: height,
            draggable: true, // Enable canvas panning
        });

        const layer = new Konva.Layer();
        stage.add(layer);

        // Sample nodes data
        const nodes = [
            { id: 'node1', label: 'Server 1', x: 100, y: 100, color: '#4A90E2' },
            { id: 'node2', label: 'Database', x: 300, y: 100, color: '#50E3C2' },
            { id: 'node3', label: 'API Gateway', x: 200, y: 250, color: '#F5A623' },
            { id: 'node4', label: 'Cache', x: 400, y: 250, color: '#D0021B' },
            { id: 'node5', label: 'Load Balancer', x: 250, y: 400, color: '#7ED321' },
        ];

        // Draw nodes
        nodes.forEach((node) => {
            // Group for node (circle + text)
            const group = new Konva.Group({
                x: node.x,
                y: node.y,
                draggable: true, // Enable node dragging
            });

            // Circle
            const circle = new Konva.Circle({
                x: 0,
                y: 0,
                radius: 40,
                fill: node.color,
                stroke: '#ffffff',
                strokeWidth: 2,
                shadowColor: 'black',
                shadowBlur: 10,
                shadowOpacity: 0.3,
            });

            // Label
            const text = new Konva.Text({
                x: -35,
                y: -8,
                text: node.label,
                fontSize: 12,
                fontStyle: 'bold',
                fill: 'white',
                width: 70,
                align: 'center',
            });

            group.add(circle);
            group.add(text);

            // Hover effects
            group.on('mouseenter', () => {
                stage.container().style.cursor = 'pointer';
                circle.strokeWidth(3);
                circle.shadowBlur(15);
                layer.draw();
            });

            group.on('mouseleave', () => {
                stage.container().style.cursor = 'default';
                circle.strokeWidth(2);
                circle.shadowBlur(10);
                layer.draw();
            });

            // Prevent canvas drag when dragging a node
            group.on('dragstart', () => {
                stage.draggable(false);
            });

            group.on('dragend', () => {
                stage.draggable(true);
            });

            layer.add(group);
        });

        layer.draw();

        // Zoom functionality
        const scaleBy = 1.1;
        const minScale = 0.2;
        const maxScale = 3;

        stage.on('wheel', (e) => {
            e.evt.preventDefault();

            const oldScale = stage.scaleX();
            const pointer = stage.getPointerPosition();

            if (!pointer) return;

            const mousePointTo = {
                x: (pointer.x - stage.x()) / oldScale,
                y: (pointer.y - stage.y()) / oldScale,
            };

            const direction = e.evt.deltaY > 0 ? -1 : 1;
            let newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

            newScale = Math.max(minScale, Math.min(maxScale, newScale));

            stage.scale({ x: newScale, y: newScale });

            const newPos = {
                x: pointer.x - mousePointTo.x * newScale,
                y: pointer.y - mousePointTo.y * newScale,
            };
            stage.position(newPos);
            stage.batchDraw();
        });

        return () => {
            stage.destroy();
        };
    }, [width, height]);

    return <div ref={containerRef} />;
};
