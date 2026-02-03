import React from 'react';
import { css } from '@emotion/css';
import { GrafanaTheme2, PanelProps } from '@grafana/data';
import { useTheme2, useStyles2 } from '@grafana/ui';

import { Options as TopologyOptions } from '../../config/panelCfg';

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

    const graphWidth = (width * 5) / 6;

    return (
        <div className={styles.wrapper}>
            <div className={styles.leftContainer}>
                <div className={styles.layerItem} />
                <div className={styles.layerItem} />
                <div className={styles.layerItem} />
                <div className={styles.layerItem} />
                <div className={styles.layerItem} />
                <div className={styles.layerItem} />
                <div className={styles.layerItem} />
                <div className={styles.layerItem} />
                <div className={styles.layerItem} />
                <div className={styles.layerItem} />
            </div>
            {/* Mid */}
            <div className={styles.rightGraphContainer}>

            </div>
            {/* Right */}
            <div className={styles.rightGraphContainer}>

            </div>


        </div>
    );
};

export { TopologyPanel as SimplePanel };
