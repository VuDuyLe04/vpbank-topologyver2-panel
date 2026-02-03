import { t as grafanaT } from '@grafana/i18n';

/**
 * Safe translation wrapper.
 *
 * Grafana may call a panel plugin's option builder very early (while i18n isn't ready yet).
 * If grafanaT() throws "t() was called before i18n was initialized", we fall back to defaultValue.
 */
export function t(key: string, defaultValue?: string): string {
    try {
        return grafanaT(key, defaultValue ?? key);
    } catch {
        return defaultValue ?? key;
    }
}
