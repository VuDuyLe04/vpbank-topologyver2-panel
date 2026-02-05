import React, { useEffect, useRef } from 'react';
import Konva from 'konva';

interface CanvasProps {
  width: number;
  height: number;
}

export const Canvas: React.FC<CanvasProps> = ({ width, height }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const minimapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Main stage
    const stage = new Konva.Stage({
      container: containerRef.current,
      width,
      height,
      draggable: true,
    });

    const layer = new Konva.Layer();
    stage.add(layer);

    const nodes = [
      { id: 'node1', label: 'Server 1', x: 100, y: 100, color: '#4A90E2' },
      { id: 'node2', label: 'Database', x: 300, y: 100, color: '#50E3C2' },
      { id: 'node3', label: 'API Gateway', x: 200, y: 250, color: '#F5A623' },
      { id: 'node4', label: 'Cache', x: 400, y: 250, color: '#D0021B' },
      { id: 'node5', label: 'Load Balancer', x: 250, y: 400, color: '#7ED321' },
    ];

    // create groups/circles/texts for nodes (same as before)
    nodes.forEach((node) => {
      const group = new Konva.Group({
        x: node.x,
        y: node.y,
        draggable: true,
      });

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

      group.on('mouseenter', () => {
        stage.container().style.cursor = 'pointer';
        circle.strokeWidth(3);
        circle.shadowBlur(15);
        layer.batchDraw();
      });

      group.on('mouseleave', () => {
        stage.container().style.cursor = 'default';
        circle.strokeWidth(2);
        circle.shadowBlur(10);
        layer.batchDraw();
      });

      group.on('dragstart', () => stage.draggable(false));
      group.on('dragend', () => stage.draggable(true));

      layer.add(group);
    });

    layer.draw();

    // Zoom behavior (wheel)
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

      updateMinimapVisibleRect();
    });

    // --- Minimap setup (pure Konva, DOM overlay) ---
    const minimapOptions = {
      size: 0.2, // 20% of container size
      position: { x: 20, y: 20 },
      containerStyle: {
        backgroundColor: '#0007',
        borderRadius: 5,
      },
      visibleRectStyle: {
        backgroundColor: '#7772',
        borderRadius: 5,
      },
    };

    // create minimap container element
    const minimapContainer = document.createElement('div');
    minimapContainer.style.position = 'absolute';
    minimapContainer.style.left = `${minimapOptions.position.x}px`;
    minimapContainer.style.top = `${minimapOptions.position.y}px`;
    minimapContainer.style.pointerEvents = 'auto';
    minimapContainer.style.background = minimapOptions.containerStyle.backgroundColor;
    minimapContainer.style.borderRadius = `${minimapOptions.containerStyle.borderRadius}px`;
    // size based on main stage dimensions
    const miniW = Math.max(100, Math.round(width * minimapOptions.size));
    const miniH = Math.max(100, Math.round(height * minimapOptions.size));
    minimapContainer.style.width = `${miniW}px`;
    minimapContainer.style.height = `${miniH}px`;
    minimapContainerRef.current = minimapContainer;
    containerRef.current.appendChild(minimapContainer);

    const minimapStage = new Konva.Stage({
      container: minimapContainer,
      width: miniW,
      height: miniH,
    });
    const minimapLayer = new Konva.Layer();
    minimapStage.add(minimapLayer);

    const minimapScale = miniW / width;

    // draw simplified nodes on minimap
    nodes.forEach((node) => {
      minimapLayer.add(
        new Konva.Circle({
          x: node.x * minimapScale,
          y: node.y * minimapScale,
          radius: Math.max(4, 40 * minimapScale),
          fill: node.color,
          stroke: '#fff',
          strokeWidth: 0.5,
        })
      );
    });

    // visible rect shows current viewport
    const visibleRect = new Konva.Rect({
      x: 0,
      y: 0,
      width: Math.max(10, width * minimapScale / stage.scaleX()),
      height: Math.max(10, height * minimapScale / stage.scaleY()),
      fill: minimapOptions.visibleRectStyle.backgroundColor,
      cornerRadius: minimapOptions.visibleRectStyle.borderRadius,
      stroke: '#ffffff',
      strokeWidth: 1,
      opacity: 0.6,
      draggable: true,
    });
    minimapLayer.add(visibleRect);
    minimapLayer.draw();

    // update visible rect position/size based on main stage state
    function updateMinimapVisibleRect() {
      const sScale = stage.scaleX();
      const pos = stage.position();
      const x = -pos.x * minimapScale / sScale;
      const y = -pos.y * minimapScale / sScale;
      const w = width * minimapScale / sScale;
      const h = height * minimapScale / sScale;
      visibleRect.position({ x, y });
      visibleRect.size({ width: Math.max(8, w), height: Math.max(8, h) });
      minimapLayer.batchDraw();
    }

    updateMinimapVisibleRect();

    // clicking minimap recenters main stage to clicked point
    minimapStage.on('click', (e) => {
      const p = minimapStage.getPointerPosition();
      if (!p) return;
      const centerX = p.x / minimapScale;
      const centerY = p.y / minimapScale;
      const newPos = {
        x: width / 2 - centerX * stage.scaleX(),
        y: height / 2 - centerY * stage.scaleY(),
      };
      stage.to({ x: newPos.x, y: newPos.y, duration: 0.15 });
      stage.batchDraw();
      updateMinimapVisibleRect();
    });

    // dragging the visibleRect pans the main stage
    visibleRect.on('dragmove', () => {
      const vPos = visibleRect.position();
      const centerX = (vPos.x + visibleRect.width() / 2) / minimapScale;
      const centerY = (vPos.y + visibleRect.height() / 2) / minimapScale;
      const newPos = {
        x: width / 2 - centerX * stage.scaleX(),
        y: height / 2 - centerY * stage.scaleY(),
      };
      stage.position(newPos);
      stage.batchDraw();
      updateMinimapVisibleRect();
    });

    // update minimap when main stage moves or scales
    stage.on('dragmove', updateMinimapVisibleRect);
    stage.on('dragend', updateMinimapVisibleRect);
    stage.on('scaleX change', updateMinimapVisibleRect);
    stage.on('scaleY change', updateMinimapVisibleRect);
    stage.on('transform', updateMinimapVisibleRect);

    // cleanup
    return () => {
      minimapStage.destroy();
      if (minimapContainerRef.current && minimapContainerRef.current.parentElement) {
        minimapContainerRef.current.parentElement.removeChild(minimapContainerRef.current);
      }
      stage.destroy();
    };
  }, [width, height]);

  return (
    <div style={{ position: 'relative', width, height }}>
      <div ref={containerRef} />
    </div>
  );
};