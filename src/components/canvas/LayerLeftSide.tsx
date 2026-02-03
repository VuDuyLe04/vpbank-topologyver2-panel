import React from 'react';
import { css } from '@emotion/css';
import { GrafanaTheme2, PanelProps } from '@grafana/data';
import { useTheme2, useStyles2, Icon } from '@grafana/ui';
import {LayerConfig} from '../../config/panelCfg';

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
});

interface LayerLeftSideProps{
  numErrors: number[];
  numNodes: number[];
  width: number;
  height: number;
  layers: LayerConfig[];
}

export const LayerLeftSide: LayerLeftSideProps = ({
  numErrors,
  numNodes,
  width,
  height,
  layers,
  pick,
}) => {
    const theme = useTheme2();
    const styles = useStyles2(getStyles);

    const layerItems = [];
    for (let i = layers.length - 1; i >= 0; --i) {
      layerItems.push(
        <div className={styles.layerItem}>
          <Icon name={layers[i].icon} color={i === pick ? theme.colors.primary.text : theme.colors.text.secondary} />
          <p>{layers[i].label}</p>
        </div>
      );
    }

    return (
        <div className={styles.leftContainer}>
            {layerItems}
        </div>
    );
}