import { DataFrame, Field, IconName } from '@grafana/data';
export type { Options as NodeGraphOptions } from './config/panelCfg';

/**
 * Raw node data parsed from Grafana DataFrame
 */
export interface RawNodeData {
  id: string;
  title: string;
  layer: number;
  subTitle?: string;
  type?: string;
  mainStat?: Field;
  color?: Field;
  secondaryStat?: Field;
  borderColor?: Field;
  backgroundColor?: Field;
  iconColor?: Field;
  icon?: IconName;
  metadata?: Record<string, unknown>;
  tags?: string[];
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
  strokeDasharray?: string;
}

/**
 * DataFrame structure for node and edge data
 */
export interface GraphFrame {
  nodes: DataFrame[];
  edges: DataFrame[];
}
