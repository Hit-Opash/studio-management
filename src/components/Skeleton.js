import React from 'react';

/* ─── Skeleton Base ─────────────────────────────────────── */
export function Skeleton({ width = '100%', height = '16px', radius = '6px', style = {} }) {
    return (
        <div
            className="skeleton-pulse"
            style={{ width, height, borderRadius: radius, ...style }}
        />
    );
}

/* ─── Stat Card Skeleton ─────────────────────────────────── */
export function StatCardSkeleton() {
    return (
        <div className="stat-card skeleton-card">
            <div className="stat-card-icon skeleton-pulse" style={{ borderRadius: 'var(--radius-md)' }} />
            <div className="stat-card-content">
                <Skeleton width="60%" height="12px" style={{ marginBottom: 8 }} />
                <Skeleton width="80%" height="24px" />
            </div>
        </div>
    );
}

/* ─── Table Row Skeleton ─────────────────────────────────── */
export function TableRowSkeleton({ cols = 5 }) {
    return (
        <tr className="skeleton-row">
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i}>
                    <Skeleton width={i === 0 ? '70%' : i === cols - 1 ? '50%' : '85%'} height="14px" />
                </td>
            ))}
        </tr>
    );
}

/* ─── Chart Skeleton ─────────────────────────────────────── */
export function ChartSkeleton({ height = 280 }) {
    return (
        <div className="skeleton-chart" style={{ height }}>
            {/* Y-axis labels */}
            <div className="skeleton-chart-labels">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} width="36px" height="10px" />
                ))}
            </div>
            {/* Bars */}
            <div className="skeleton-chart-bars">
                {[60, 80, 45, 90, 70, 55, 85, 65, 75, 50, 88, 72].map((h, i) => (
                    <div
                        key={i}
                        className="skeleton-pulse skeleton-bar"
                        style={{ height: `${h}%` }}
                    />
                ))}
            </div>
        </div>
    );
}

/* ─── List Item Skeleton ──────────────────────────────────── */
export function ListItemSkeleton() {
    return (
        <div className="event-list-item skeleton-list-item">
            <Skeleton width="70px" height="14px" />
            <div style={{ flex: 1, padding: '0 8px' }}>
                <Skeleton width="60%" height="14px" style={{ marginBottom: 6 }} />
                <Skeleton width="40%" height="11px" />
            </div>
            <Skeleton width="60px" height="22px" radius="999px" />
        </div>
    );
}

/* ─── Card Skeleton ──────────────────────────────────────── */
export function CardSkeleton() {
    return (
        <div className="card" style={{ padding: 'var(--space-lg)' }}>
            <Skeleton width="40%" height="18px" style={{ marginBottom: 16 }} />
            {[1, 2, 3].map(i => (
                <ListItemSkeleton key={i} />
            ))}
        </div>
    );
}

/* ─── Dashboard Skeleton ─────────────────────────────────── */
export function DashboardSkeleton() {
    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div>
                    <Skeleton width="180px" height="28px" style={{ marginBottom: 8 }} />
                    <Skeleton width="250px" height="14px" />
                </div>
            </div>

            {/* Stat Cards */}
            <div className="stat-cards-grid">
                {[...Array(8)].map((_, i) => <StatCardSkeleton key={i} />)}
            </div>

            {/* Charts */}
            <div className="charts-grid">
                {[1, 2].map(i => (
                    <div className="chart-card" key={i}>
                        <Skeleton width="40%" height="18px" style={{ marginBottom: 16 }} />
                        <ChartSkeleton />
                    </div>
                ))}
            </div>

            {/* Events grid */}
            <div className="charts-grid" style={{ marginTop: 'var(--space-md)' }}>
                <CardSkeleton />
                <CardSkeleton />
            </div>
        </div>
    );
}

/* ─── Page Skeleton (Table pages) ───────────────────────── */
export function PageSkeleton({ cols = 6, rows = 7 }) {
    return (
        <div className="page-container">
            <div className="page-header">
                <Skeleton width="160px" height="28px" />
                <Skeleton width="120px" height="38px" radius="10px" />
            </div>

            {/* Optional stat strip */}
            <div className="stat-cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', marginBottom: 'var(--space-xl)' }}>
                {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
            </div>

            <div className="table-container">
                <div className="table-toolbar">
                    <Skeleton width="240px" height="36px" radius="10px" />
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Skeleton width="110px" height="36px" radius="10px" />
                        <Skeleton width="110px" height="36px" radius="10px" />
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            {[...Array(cols)].map((_, i) => (
                                <th key={i}><Skeleton width={i === 0 ? '70%' : '55%'} height="12px" /></th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(rows)].map((_, i) => <TableRowSkeleton key={i} cols={cols} />)}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
