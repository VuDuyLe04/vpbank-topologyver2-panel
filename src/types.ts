import { DataFrame, Field, IconName } from '@grafana/data';
export type { Options as NodeGraphOptions } from './config/panelCfg';

/**
 * Raw node data parsed from Grafana DataFrame
 */
export interface RawNodeData {
  id: string;
  title: string;
  layerOrder: number;
  subTitle?: string;
  type?: string;
  mainStat?: Field;
  secondaryStat?: Field;
  borderColor?: Field;
  backgroundColor?: Field;
  iconColor?: Field;
  icon?: IconName;
  metadata?: Record<string, unknown>;
  linkURL?: string;
}

/**
 * Raw edge data parsed from Grafana DataFrame
 */
export interface RawEdgeData {
  id: string;
  source: string;
  target: string;
  color?: string;
  mainStat?: Field | string;
  secondaryStat?: Field | string;
  thickness?: number;
}

/**
 * DataFrame structure for node and edge data
 */
export interface GraphFrame {
  nodes: DataFrame[];
  edges: DataFrame[];
}
