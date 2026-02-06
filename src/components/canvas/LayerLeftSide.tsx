import React from 'react';
import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';
import { useTheme2, useStyles2, Icon } from '@grafana/ui';
import { LayerConfig } from '../../config/panelCfg';

// import { useHover } from '../../utils/useHover';
// import { Options as TopologyOptions } from '../../config/panelCfg';

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
        padding: '0 12px',
        gap: '8px',
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
    layerContent: css({
        flex: 1,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '14px',
    }),
    layerLabel: css({
        margin: 0,
        fontWeight: 500,
        color: theme.colors.secondary.text,
    }),
    layerLabelOnPick: css({
        margin: 0,
        fontWeight: 500,
        color: theme.colors.primary.text,
    }),
    layerCount: css({
        fontSize: '12px',
        opacity: 0.7,
        whiteSpace: 'nowrap',
    }),
    layerCountError: css({
        fontSize: '12px',
        opacity: 0.7,
        whiteSpace: 'nowrap',
        color: theme.colors.error.text,
    }),
});

interface LayerLeftSideProps {
    numErrors: number[];
    numNodes: number[];
    width: number;
    height: number;
    layers: LayerConfig[];
    pick: number;
    onPickChange: (pick: number) => void;
};

export const LayerLeftSide: React.FC<LayerLeftSideProps> = ({
    numErrors,
    numNodes,
    width,
    height,
    layers,
    pick,
    onPickChange,
}) => {
    const theme = useTheme2();
    const styles = useStyles2(getStyles);

    const layerItems = [];
    //  layers.map((layer, i) => (
    //   <LayerRow
    //     key={i}
    //     idx={i}
    //     layer={layer}
    //     pick={pick}
    //     numErrors={numErrors}
    //     numNodes={numNodes}
    //     onPickChange={onPickChange}
    //   />
    // ))

    for (let i = layers.length - 1; i >= 0; --i) {
        //   const { isHovered, ref } = useHover();
        layerItems.push(
            <div
                className={styles.layerItem}
                onClick={() => onPickChange(i)}>
                <Icon
                    name={layers[i].icon}
                    size="lg"
                    color={i === pick ? theme.colors.primary.text : theme.colors.text.secondary}
                />
                <div className={styles.layerContent}>
                    <p className={i === pick ? styles.layerLabelOnPick : styles.layerLabel}>{layers[i].label}</p>
                    {numErrors[i] > 0 ?
                        <span className={styles.layerCount}>{<span style={{ color: theme.colors.error.text }}>{numErrors[i]}</span>} / {numNodes[i]}</span>
                        : <span className={styles.layerCount}>{numNodes[i]}</span>}
                </div>
            </div>
        );
    }

    return (
        <div className={styles.leftContainer}>
            {layerItems}
        </div>
    );
}