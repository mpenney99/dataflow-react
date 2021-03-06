export function plot(sx: number, sy: number, ex: number, ey: number, portOut: boolean): string {
    const dx = ex - sx;
    const dy = ey - sy;
    const dist = Math.sqrt(dx * dx + dy * dy) / 4;
    const distX = portOut ? dist : -dist;

    const cx1 = sx + distX;
    const cx2 = ex - distX;
    return `M${sx},${sy}C${cx1} ${sy}, ${cx2} ${ey}, ${ex} ${ey}`;
}
