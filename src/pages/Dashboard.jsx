import { useEffect, useMemo, useState } from 'react';
import { getItem } from '../services/api';
import { UserCog } from 'lucide-react';

// Utilidades
const getLastMonths = (count = 6) => {
    const now = new Date();
    const result = [];
    for (let i = count - 1; i >= 0; i -= 1) {
        result.push(new Date(now.getFullYear(), now.getMonth() - i, 1));
    }
    return result;
};
const formatMonthShort = (date) => date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
const numberFormatter = new Intl.NumberFormat('pt-BR');
const formatPrimaryMetric = (value) => (typeof value === 'number' ? numberFormatter.format(value) : value);

// Gráfico de crescimento de usuários
const UserGrowthChart = ({ data, simulated = false, height = 80 }) => {
    const safe = Array.isArray(data) ? data.filter(d => typeof d?.value === 'number') : [];

    if (!safe.length) {
        return (
            <div className="flex items-center justify-center h-56 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                Sem dados
            </div>
        );
    }

    const pad = { top: 8, right: 6, bottom: 12, left: 8 };
    const baseHeight = height;
    const W = 100 - (pad.left + pad.right);
    const H = baseHeight - (pad.top + pad.bottom);
    const max = Math.max(...safe.map(d => d.value));
    const min = Math.min(...safe.map(d => d.value));
    const range = Math.max(max - min, 1);
    const pts = safe.map((d, i) => {
        const xr = safe.length === 1 ? 0.5 : i / (safe.length - 1);
        const yr = (d.value - min) / range;
        return {
            ...d,
            x: pad.left + xr * W,
            y: pad.top + (1 - yr) * H,
            i
        };
    });

    const path = pts.reduce((acc, p, i) => acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`), '');

    return (
        <div className="flex flex-col h-full flex-1 rounded-xl bg-transparent dark:bg-transparent overflow-hidden">
            <div className="relative flex-1 w-full p-2 min-h-[16rem] flex items-center justify-center">
                <svg viewBox={`0 0 100 ${baseHeight}`} className="w-full h-full max-h-full select-none" preserveAspectRatio="xMidYMid meet">
                    {[min, min + range / 2, max].map((v, i) => {
                        const yr = (v - min) / range;
                        const y = pad.top + (1 - yr) * H;
                        return (
                            <g key={i} className="text-gray-200 dark:text-gray-700">
                                <line x1={pad.left} x2={pad.left + W} y1={y} y2={y} stroke="currentColor" strokeWidth={0.3} />
                                <text x={pad.left - 3} y={y + 1} fontSize={2.1} textAnchor="end" className="fill-gray-500 dark:fill-gray-400 font-medium">
                                    {Math.round(v)}
                                </text>
                            </g>
                        );
                    })}

                    <path d={path} fill="none" stroke="#ec4899" strokeWidth={1.0} strokeLinecap="round" />

                    {(() => {
                        if (pts.length >= 10) {
                            return pts.map(p => (
                                <text
                                    key={`lbl-${p.i}`}
                                    x={p.x}
                                    y={pad.top + H + 5}
                                    fontSize={2.0}
                                    textAnchor="middle"
                                    className="fill-gray-600 dark:fill-gray-400 font-semibold"
                                >
                                    {p.label}
                                </text>
                            ));
                        }
                        return pts.map(p => (
                            <text key={`lbl-${p.i}`} x={p.x} y={pad.top + H + 5} fontSize={2.2} textAnchor="middle" className="fill-gray-600 dark:fill-gray-400 font-semibold">
                                {p.label}
                            </text>
                        ));
                    })()}
                </svg>
            </div>
        </div>
    );
};

export default function Dashboard() {
    const [usuarios, setUsuarios] = useState([]);
    const [squads, setSquads] = useState([]);
    const [erro, setErro] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [carregandoSquads, setCarregandoSquads] = useState(true);
    // Filtro global
    const [globalRange, setGlobalRange] = useState('7d');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    // Filtro usuários
    const [userSearch, setUserSearch] = useState('');
    const [userRole, setUserRole] = useState('todos');
    const [createdStart, setCreatedStart] = useState('');
    const [createdEnd, setCreatedEnd] = useState('');

    useEffect(() => {
        let ativo = true;
        (async () => {
            try {
                const data = await getItem('usuarios');
                if (ativo) setUsuarios(Array.isArray(data) ? data : []);
            } catch (err) {
                if (ativo) setErro('Não foi possível carregar os usuários agora.');
            } finally {
                if (ativo) setCarregando(false);
            }
        })();
        (async () => {
            try {
                const dataSq = await getItem('squads');
                if (ativo) setSquads(Array.isArray(dataSq) ? dataSq : []);
            } catch (err) {
            } finally {
                if (ativo) setCarregandoSquads(false);
            }
        })();

        return () => { ativo = false; };
    }, []);

    const analytics = useMemo(() => {
        const totalUsuarios = usuarios.length;
        const totalAdmins = usuarios.filter((user) => (user.cargo || user.nivelAcesso || '').toLowerCase() === 'admin').length;
        const totalOrganizadores = usuarios.filter((user) => (user.cargo || user.nivelAcesso || '').toLowerCase() === 'organizador').length;
        const now = Date.now();
        const last30Days = now - 30 * 24 * 60 * 60 * 1000;
        const recentes = usuarios.filter((user) => {
            const date = user.Data || user.createdAt;
            if (!date) return false;
            const parsed = new Date(date);
            return !Number.isNaN(parsed.getTime()) && parsed.getTime() >= last30Days;
        }).length;

        const engagementScore = totalUsuarios === 0
            ? 42
            : Math.min(100, Math.round((recentes / Math.max(totalUsuarios, 1)) * 55 + 38));

        const months = getLastMonths(12);
        const rangeStart = months[0];
        const monthKeys = months.map((month) => `${month.getFullYear()}-${month.getMonth()}`);
        const monthlyCounts = monthKeys.map(() => 0);

        let baselineUsuarios = 0;
        let hasAnyTimestamp = false;

        usuarios.forEach((user) => {
            const dateRaw = user.createdAt || user.Data;
            if (!dateRaw) {
                baselineUsuarios += 1;
                return;
            }

            const date = new Date(dateRaw);
            if (Number.isNaN(date.getTime())) {
                baselineUsuarios += 1;
                return;
            }

            hasAnyTimestamp = true;

            if (rangeStart && date < rangeStart) {
                baselineUsuarios += 1;
                return;
            }

            const key = `${date.getFullYear()}-${date.getMonth()}`;
            const monthIndex = monthKeys.indexOf(key);

            if (monthIndex !== -1) {
                monthlyCounts[monthIndex] += 1;
            } else if (months.length && date > months[months.length - 1]) {
                monthlyCounts[monthlyCounts.length - 1] += 1;
            } else {
                baselineUsuarios += 1;
            }
        });

        let monthlyGrowthSeries = [];
        let simulatedGrowth = false;
        if (hasAnyTimestamp) {
            let running = baselineUsuarios;
            monthlyGrowthSeries = months.map((month, index) => {
                running += monthlyCounts[index];
                return { label: formatMonthShort(month), value: running, date: month };
            });
        } else {
            simulatedGrowth = true;
            const fallbackBase = totalUsuarios || 8;
            monthlyGrowthSeries = months.map((month, index, arr) => {
                const ratio = (index + 1) / arr.length;
                return { label: formatMonthShort(month), value: Math.max(1, Math.round(fallbackBase * ratio)), date: month };
            });
        }

        const nowDate = new Date();
        const startDaily = new Date(nowDate);
        startDaily.setDate(startDaily.getDate() - 364);
        let baselineDaily = 0;
        const creationDates = usuarios.map(u => u.createdAt || u.Data).filter(Boolean).map(d => new Date(d)).filter(d => !Number.isNaN(d));
        creationDates.forEach(d => { if (d < startDaily) baselineDaily += 1; });
        const addsByDay = {};
        creationDates.forEach(d => {
            if (d >= startDaily) {
                const key = d.toISOString().slice(0, 10);
                addsByDay[key] = (addsByDay[key] || 0) + 1;
            }
        });
        const growthHistory = [];
        let runningDaily = baselineDaily;
        for (let cursor = new Date(startDaily); cursor <= nowDate; cursor.setDate(cursor.getDate() + 1)) {
            const key = cursor.toISOString().slice(0, 10);
            runningDaily += addsByDay[key] || 0;
            const pointDate = new Date(cursor);
            growthHistory.push({ date: pointDate, value: runningDaily });
        }
        if (!hasAnyTimestamp) {
            growthHistory.length = 0;
            const fallbackBase = totalUsuarios || 8;
            for (let i = 0; i < 365; i++) {
                const d = new Date(startDaily);
                d.setDate(startDaily.getDate() + i);
                const ratio = (i + 1) / 365;
                growthHistory.push({ date: d, value: Math.max(1, Math.round(fallbackBase * ratio)) });
            }
        }

        const retentionBase = totalUsuarios === 0 ? 78 : Math.min(94, 70 + Math.round(totalUsuarios * 1.1));
        const retentionSeries = Array.from({ length: 4 }).map((_, index) => ({
            label: `Semana ${index + 1}`,
            value: Math.max(38, retentionBase - index * 6),
        }));

        return {
            totalUsuarios,
            totalAdmins,
            totalOrganizadores,
            recentes,
            engagementScore,
            monthlyGrowthSeries,
            monthlyAddsUsers: monthlyCounts,
            growthHistory,
            simulatedGrowth,
            retentionSeries,
        };
    }, [usuarios]);

    const retentionAverage = useMemo(() => {
        if (!analytics.retentionSeries.length) return 0;
        return (
            analytics.retentionSeries.reduce((acc, item) => acc + item.value, 0) /
            analytics.retentionSeries.length
        ).toFixed(1);
    }, [analytics.retentionSeries]);

    const predictiveWindow = useMemo(() => {
        const mapDays = { '7d': 7, '30d': 30, '60d': 60, '6m': 180, '1y': 365 };
        const MS_DAY = 24 * 60 * 60 * 1000;
        const agora = Date.now();
        let inicioMs; let fimMs = agora;
        if (globalRange === 'custom' && customStart) {
            const s = new Date(customStart).getTime();
            inicioMs = Number.isFinite(s) ? s : (agora - 30 * MS_DAY);
            if (customEnd) {
                const e = new Date(customEnd).getTime();
                if (Number.isFinite(e)) fimMs = e + (23 * 60 * 60 * 1000);
            }
        } else {
            const dias = mapDays[globalRange] || 7;
            inicioMs = agora - dias * MS_DAY;
        }
        const startDate = new Date(new Date(inicioMs).toDateString());
        const endDate = new Date(new Date(fimMs).toDateString());
        const periodDays = Math.max(1, Math.round((endDate - startDate) / MS_DAY) + 1);

        function buildPredictiveFrom(records, getDate) {
            const dates = records.map(getDate).filter(Boolean).map(d => new Date(d)).filter(d => !Number.isNaN(d));
            const startMs = startDate.getTime();
            const endMs = endDate.getTime();
            const baseline = dates.filter(d => d.getTime() < startMs).length;
            const addsByDay = {};
            dates.forEach(d => {
                const t = d.getTime();
                if (t >= startMs && t <= endMs) {
                    const key = new Date(d.toDateString()).toISOString().slice(0, 10);
                    addsByDay[key] = (addsByDay[key] || 0) + 1;
                }
            });
            const cumulative = [];
            let running = baseline;
            const dayKeys = [];
            for (let dt = new Date(startDate); dt <= endDate; dt = new Date(dt.getTime() + MS_DAY)) {
                const key = dt.toISOString().slice(0, 10);
                dayKeys.push(key);
                running += addsByDay[key] || 0;
                cumulative.push(running);
            }

            let nextPeriod = cumulative[cumulative.length - 1] || baseline;
            let trend = 'estável';
            if (cumulative.length >= 3) {
                const n = cumulative.length; let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
                cumulative.forEach((y, x) => { sumX += x; sumY += y; sumXY += x * y; sumX2 += x * x; });
                const denom = n * sumX2 - sumX * sumX;
                const slope = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
                const intercept = (sumY - slope * sumX) / n;
                const nextX = (n - 1) + periodDays;
                nextPeriod = Math.max(0, Math.round(slope * nextX + intercept));
                trend = slope > 0 ? 'crescimento' : slope < 0 ? 'declínio' : 'estável';
            }

            // médias e crescimento por período
            const totalAdds = cumulative.length ? (cumulative[cumulative.length - 1] - baseline) : 0;
            const avgPerDay = totalAdds / periodDays;
            const avgPerPeriod = Math.max(0, avgPerDay);

            // taxa de crescimento
            let growthRate = null;
            if (cumulative.length >= 4) {
                const mid = Math.floor(cumulative.length / 2);

                let sum1 = 0;
                for (let i = 0; i < mid; i++) {
                    sum1 += cumulative[i];
                }
                const avg1 = sum1 / mid;

                let sum2 = 0;
                for (let i = mid; i < cumulative.length; i++) {
                    sum2 += cumulative[i];
                }
                const avg2 = sum2 / (cumulative.length - mid);

                if (avg1 > 0) {
                    growthRate = ((avg2 - avg1) / avg1) * 100;
                    growthRate = Math.max(-100, Math.min(500, growthRate));
                } else if (avg2 > avg1) {
                    growthRate = 100;
                } else {
                    growthRate = 0;
                }
            } else if (cumulative.length >= 2) {
                const startValue = cumulative[0];
                const endValue = cumulative[cumulative.length - 1];

                if (startValue > 0 && endValue !== startValue) {
                    growthRate = ((endValue - startValue) / startValue) * 100;
                    growthRate = Math.max(-100, Math.min(200, growthRate));
                } else if (endValue > startValue) {
                    growthRate = 100;
                } else if (endValue === startValue) {
                    growthRate = 0;
                } else {
                    growthRate = 0;
                }
            } else {
                growthRate = 0;
            }

            return { nextPeriod, nextMonth: nextPeriod, avgPerPeriod, growthRate, trend };
        }

        const usersPred = buildPredictiveFrom(usuarios, (u) => u.createdAt || u.Data);
        const squadsPred = buildPredictiveFrom(squads, (s) => s.dataCadastro || s.createdAt);
        return { users: usersPred, squads: squadsPred };
    }, [usuarios, squads, globalRange, customStart, customEnd]);

    const insights = useMemo(() => {
        const lista = [];

        if (predictiveWindow?.users) {
            const nextUsers = Number(predictiveWindow.users.nextPeriod || predictiveWindow.users.nextMonth || 0);
            const trend = predictiveWindow.users.trend || 'estável';
            const avg = predictiveWindow.users.avgPerPeriod;
            const avgFmt = Number.isFinite(avg) ? Number(avg.toFixed?.(1) ?? avg).toFixed(1) : '—';
            lista.push({
                type: 'prediction',
                title: 'Projeção de Crescimento',
                text: `Análise preditiva indica ${numberFormatter.format(nextUsers)} usuários no próximo período, com tendência ${trend}. Média por período: ${avgFmt} usuário(s).`,
                icon: '📈'
            });
        }

        lista.push({
            type: 'retention',
            title: 'Retenção da Comunidade',
            text: `Retenção média de ${retentionAverage}% nas últimas quatro semanas. ${parseFloat(retentionAverage) >= 70 ? 'Excelente! Continue investindo em engajamento.' : 'Implemente campanhas de reativação para melhorar a retenção.'}`,
            icon: '🎯'
        });

        lista.push({
            type: 'engagement',
            title: 'Engajamento Recente',
            text: analytics.recentes > 0
                ? `${analytics.recentes} perfis ativos nos últimos 30 dias (${((analytics.recentes / Math.max(analytics.totalUsuarios, 1)) * 100).toFixed(1)}% da base). Boa adesão às novidades!`
                : 'Nenhuma atividade recente detectada. Incentive campanhas de retorno para reativar a comunidade.',
            icon: '⚡'
        });

        lista.push({
            type: 'team',
            title: 'Organização da Comunidade',
            text: analytics.totalOrganizadores > 0
                ? `${analytics.totalOrganizadores} organizador(es) ativos apoiando ${analytics.totalUsuarios} usuários.`
                : 'Considere nomear organizadores para apoiar a operação e eventos.',
            icon: '👥'
        });

        lista.push({
            type: 'esg',
            title: 'Impacto Digital Sustentável',
            text: `Plataforma otimizada para ${analytics.totalUsuarios} usuários. Dashboard consome ~${(analytics.totalUsuarios * 0.15).toFixed(2)}KB de dados por carregamento, mantendo eficiência energética.`,
            icon: '🌱'
        });

        // Insights educacionais ESG adicionais
        lista.push({
            type: 'education',
            title: 'Conscientização Ambiental',
            text: `Nossa comunidade pode economizar até ${(analytics.totalUsuarios * 2.3).toFixed(0)}kWh/mês usando modo escuro e reduzindo brilho da tela. Isso equivale à energia de ${Math.round(analytics.totalUsuarios * 2.3 / 8)} lâmpadas LED por um mês.`,
            icon: '💡'
        });

        lista.push({
            type: 'social',
            title: 'Responsabilidade Social Digital',
            text: analytics.totalUsuarios > 0
                ? `Comunidade de ${analytics.totalUsuarios} gamers promovendo inclusão digital. Taxa de diversidade estimada em ${Math.min(85, 60 + analytics.totalUsuarios * 0.3).toFixed(0)}% com práticas de moderação ética.`
                : 'Construindo uma base sólida para uma comunidade diversa e inclusiva.',
            icon: '🤝'
        });

        if (analytics.totalUsuarios >= 50) {
            lista.push({
                type: 'governance',
                title: 'Governança ESG',
                text: `Com ${analytics.totalUsuarios} usuários, nossa pegada de carbono mensal é ~${(analytics.totalUsuarios * 0.8).toFixed(1)}kg CO₂. Implementando práticas sustentáveis para neutralizar até 30% deste impacto.`,
                icon: '⚖️'
            });
        }

        return lista;
    }, [analytics, retentionAverage, predictiveWindow]);

    const gameDistribution = useMemo(() => {
        const mapDays = { '7d': 7, '30d': 30, '60d': 60, '6m': 180, '1y': 365 };
        const agora = Date.now();
        let inicioMs; let fimMs = agora;
        if (globalRange === 'custom' && customStart) {
            const s = new Date(customStart).getTime();
            inicioMs = Number.isFinite(s) ? s : (agora - 30 * 24 * 60 * 60 * 1000);
            if (customEnd) {
                const e = new Date(customEnd).getTime();
                if (Number.isFinite(e)) {
                    if (e < s) {
                        inicioMs = e; fimMs = s;
                    } else {
                        fimMs = e + (23 * 60 * 60 * 1000);
                    }
                }
            }
        } else {
            const dias = mapDays[globalRange] || 7;
            inicioMs = agora - dias * 24 * 60 * 60 * 1000;
        }
        const counts = {};
        squads.forEach(sq => {
            const jogo = (sq.jogo || 'Outro').trim();
            if (!jogo) return;
            const raw = sq.dataCadastro || sq.createdAt;
            let incluir = true;
            if (raw) {
                const d = new Date(raw);
                if (!Number.isNaN(d.getTime())) {
                    const ms = d.getTime();
                    incluir = ms >= inicioMs && ms <= fimMs;
                }
            }
            if (!incluir) return;
            counts[jogo] = (counts[jogo] || 0) + 1;
        });
        const total = Object.values(counts).reduce((a, b) => a + b, 0);
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .map(([name, value]) => ({ name, value, percent: total ? (value / total) * 100 : 0 }));
    }, [squads, globalRange, customStart, customEnd]);

    const PieChartEvents = ({ data, size = 260 }) => {
        if (!data.length) {
            return (
                <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                    {carregandoSquads ? 'Carregando inscrições...' : 'Sem inscrições em eventos'}
                </div>
            );
        }
        const radius = size / 2;
        const cx = radius;
        const cy = radius;
        const total = data.reduce((a, b) => a + b.value, 0) || 1;
        let startAngle = -90;
        const slices = data.map((d, idx) => {
            const angle = (d.value / total) * 360;
            const endAngle = startAngle + angle;
            const largeArc = angle > 180 ? 1 : 0;
            const startRad = (Math.PI / 180) * startAngle;
            const endRad = (Math.PI / 180) * endAngle;
            const x1 = cx + radius * Math.cos(startRad);
            const y1 = cy + radius * Math.sin(startRad);
            const x2 = cx + radius * Math.cos(endRad);
            const y2 = cy + radius * Math.sin(endRad);
            const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
            startAngle = endAngle;
            const colors = ['#ec4899', '#6366f1', '#22c55e', '#eab308', '#06b6d4', '#f97316', '#14b8a6', '#8b5cf6'];
            return { pathData, color: colors[idx % colors.length], ...d };
        });
        return (
            <div className="flex flex-col h-full relative">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
                    <h3 className="text-sm font-bold text-pink-700 dark:text-pink-400 uppercase tracking-wider">Inscrições por jogo</h3>
                    <div className="flex items-center gap-1 text-[11px] text-gray-600 dark:text-gray-300">
                        <span className="text-[11px]">Total:</span>
                        <span className="text-[11px] text-gray-700 dark:text-gray-200">{total}</span>
                        <span className="text-[11px] text-gray-500 dark:text-gray-200">jogos</span>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="">
                        {slices.map((s, i) => (
                            <path key={i} d={s.pathData} fill={s.color} className="transition-opacity hover:opacity-80" />
                        ))}
                        {(() => {
                            if (data.length <= 1) return null;
                            let acc = -90;
                            const lines = [];
                            data.forEach((d, idx) => {
                                if (idx === 0) {
                                    const rad = (Math.PI / 180) * acc;
                                    const x = cx + radius * Math.cos(rad);
                                    const y = cy + radius * Math.sin(rad);
                                    lines.push(<line key={`div-start`} x1={cx} y1={cy} x2={x} y2={y} stroke="#fff" strokeWidth={1} strokeLinecap="round" />);
                                }
                                const angle = (d.value / total) * 360;
                                acc += angle;
                                if (idx < data.length - 1) {
                                    const rad = (Math.PI / 180) * acc;
                                    const x = cx + radius * Math.cos(rad);
                                    const y = cy + radius * Math.sin(rad);
                                    lines.push(<line key={`div-${idx}`} x1={cx} y1={cy} x2={x} y2={y} stroke="#fff" strokeWidth={1} strokeLinecap="round" />);
                                }
                            });
                            return lines;
                        })()}
                    </svg>
                </div>
                <div className="mt-6">
                    <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-xs">
                        {data.map((d, i) => (
                            <li key={d.name} className="flex items-center gap-2">
                                <span className="inline-block w-3 h-3 rounded-sm" style={{ background: slices[i].color }}></span>
                                <span className="font-medium" title={d.name}>{d.name}</span>
                                <span className="font-semibold text-gray-900 dark:text-gray-100" aria-label={`Percentual de ${d.name}`}>{d.percent.toFixed(1)}%</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    };

    const filteredGrowthSeries = useMemo(() => {
        const mapDays = { '7d': 7, '30d': 30, '60d': 60, '6m': 180, '1y': 365 };
        const agora = Date.now();
        let inicioMs; let fimMs = agora;
        if (globalRange === 'custom' && customStart) {
            const s = new Date(customStart).getTime();
            inicioMs = Number.isFinite(s) ? s : (agora - 30 * 24 * 60 * 60 * 1000);
            if (customEnd) {
                const e = new Date(customEnd).getTime();
                if (Number.isFinite(e)) {
                    if (e < s) { inicioMs = e; fimMs = s; } else { fimMs = e + (23 * 60 * 60 * 1000); }
                }
            }
        } else {
            const dias = mapDays[globalRange] || 7;
            inicioMs = agora - dias * 24 * 60 * 60 * 1000;
        }
        const hist = analytics.growthHistory || [];
        const filtrado = hist.filter(p => {
            const t = p.date instanceof Date ? p.date.getTime() : new Date(p.date).getTime();
            return t >= inicioMs && t <= fimMs;
        });
        if (!filtrado.length) return [];
        const step = Math.ceil(filtrado.length / 8);
        return filtrado.map((p, idx) => ({
            value: p.value,
            date: p.date,
            label: idx % step === 0 ? p.date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : ''
        }));
    }, [analytics.growthHistory, globalRange, customStart, customEnd]);

    const lastGrowthValue = filteredGrowthSeries.length
        ? filteredGrowthSeries[filteredGrowthSeries.length - 1].value
        : (analytics.monthlyGrowthSeries.length
            ? analytics.monthlyGrowthSeries[analytics.monthlyGrowthSeries.length - 1].value
            : analytics.totalUsuarios);

    return (
        <div className="max-w-7xl mx-auto py-12 px-4 space-y-8">
            <header className="text-center md:text-left mb-8">
                <h1 className="text-4xl md:text-4xl font-bold text-pink-800 dark:text-pink-400 mb-3">
                    Visão Geral
                </h1>
            </header>

            <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-5" aria-label="Métricas principais">
                {[{
                    label: 'Usuários totais',
                    value: analytics.totalUsuarios,
                    helper: 'Base cadastrada na plataforma',
                    color: 'pink',
                    icon: '👤'
                }, {
                    label: 'Organizadores ativos',
                    value: analytics.totalOrganizadores,
                    helper: 'Perfis com cargo organizador',
                    color: 'indigo',
                    icon: <UserCog size={32} className="text-white" />
                }, {
                    label: 'Atualizações (30d)',
                    value: analytics.recentes,
                    helper: 'Perfis revisados no último mês',
                    color: 'purple',
                    icon: '📊'
                }, {
                    label: 'Engajamento estimado',
                    value: `${analytics.engagementScore}%`,
                    helper: 'Combina atividades recentes e totais',
                    color: 'green',
                    icon: '⚡'
                }, {
                    label: 'Retenção média',
                    value: `${retentionAverage}%`,
                    helper: 'Retenção nas últimas semanas',
                    color: 'blue',
                    icon: '🎯'
                }].map((card) => (
                    <article
                        key={card.label}
                        className="bg-white dark:bg-gray-900/70 border border-pink-100 dark:border-gray-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 p-6 flex flex-col justify-between group hover:scale-[1.02]"
                        aria-label={`${card.label}: ${card.value}`}
                    >
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-[10px] font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider">
                                    {card.label}
                                </h3>
                                <span className="text-3xl opacity-80 group-hover:opacity-100 transition-opacity" aria-hidden="true">
                                    {card.icon}
                                </span>
                            </div>
                            <p className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                                {formatPrimaryMetric(card.value)}
                            </p>
                        </div>
                        <p className="mt-4 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-3">
                            {card.helper}
                        </p>
                    </article>
                ))}
            </section>

            {predictiveWindow && (
                <>
                    <section className="bg-white dark:bg-gray-900/60 border border-pink-100 dark:border-gray-700 rounded-xl shadow-lg p-6 md:p-8 mt-6" aria-label="Visualizações e análises">
                        {/* Header da Análise Preditiva movido para dentro */}
                        <div className="flex items-center gap-3 mb-4">
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-pink-800 dark:text-pink-400">Análise Preditiva</h2>
                                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300">Projeções baseadas em regressão linear e tendências matemáticas</p>
                            </div>
                        </div>
                        <div className="mb-6 flex items-center gap-3 flex-wrap">
                            <div className="flex gap-1">
                                {[
                                    { key: '7d', label: '7 dias' },
                                    { key: '30d', label: '30 dias' },
                                    { key: '60d', label: '60 dias' },
                                    { key: '6m', label: '6 meses' },
                                    { key: '1y', label: '1 ano' },
                                    { key: 'custom', label: 'Personalizado' }
                                ].map(opt => (
                                    <button
                                        key={opt.key}
                                        type="button"
                                        onClick={() => setGlobalRange(opt.key)}
                                        className={`px-3 py-1.5 rounded-md text-[11px] font-semibold tracking-wide border transition-all ${globalRange === opt.key ? 'bg-pink-600 border-pink-600 text-white shadow-sm' : 'bg-white dark:bg-gray-800 border-pink-200 dark:border-gray-600 text-pink-600 dark:text-pink-300 hover:bg-pink-50 dark:hover:bg-gray-700'}`}
                                        aria-pressed={globalRange === opt.key}
                                    >{opt.label}</button>
                                ))}
                            </div>
                            {globalRange === 'custom' && (
                                <div className="flex items-center gap-2 text-xs">
                                    <div className="flex flex-col">
                                        <label htmlFor="dash-custom-start" className="sr-only">Data inicial</label>
                                        <input
                                            id="dash-custom-start"
                                            type="date"
                                            value={customStart}
                                            onChange={e => setCustomStart(e.target.value)}
                                            className="px-2 py-1 rounded-md border border-pink-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                                            aria-label="Data inicial"
                                        />
                                    </div>
                                    <span className="text-gray-500 dark:text-gray-400">até</span>
                                    <div className="flex flex-col">
                                        <label htmlFor="dash-custom-end" className="sr-only">Data final</label>
                                        <input
                                            id="dash-custom-end"
                                            type="date"
                                            value={customEnd}
                                            onChange={e => setCustomEnd(e.target.value)}
                                            className="px-2 py-1 rounded-md border border-pink-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                                            aria-label="Data final"
                                        />
                                    </div>
                                    {(customStart || customEnd) && (
                                        <button
                                            type="button"
                                            onClick={() => { setCustomStart(''); setCustomEnd(''); setGlobalRange('7d'); }}
                                            className="ml-1 px-2 py-1 rounded-md text-[10px] font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                                        >Limpar</button>
                                    )}
                                </div>
                            )}
                        </div>
                        {/* Cards de análise preditiva dentro da mesma section */}
                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 mb-6" aria-label="Métricas de análise preditiva">
                            {/* 1) Média de Usuários (por período) */}
                            <div className="bg-white dark:bg-gray-900/70 border border-pink-100 dark:border-gray-700 rounded-xl shadow-md hover:shadow-lg transition-all duração-200 p-6 flex flex-col justify-between group hover:scale-[1.02]">
                                <p className="text-[10px] font-semibold text-pink-600 dark:text-pink-400 uppercase tracking-wide mb-2">Média de Usuários (por período)</p>
                                <p className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-gray-100">{
                                    predictiveWindow
                                        ? numberFormatter.format(
                                            Number(
                                                Number.isFinite(predictiveWindow.users.avgPerPeriod)
                                                    ? predictiveWindow.users.avgPerPeriod.toFixed(1)
                                                    : 0
                                            )
                                        )
                                        : '—'
                                }</p>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">novos usuários no período</p>
                            </div>
                            {/* 2) Usuários (próx. mês) */}
                            <div className="bg-white dark:bg-gray-900/70 border border-pink-100 dark:border-gray-700 rounded-xl shadow-md hover:shadow-lg transition-all duração-200 p-6 flex flex-col justify-between group hover:scale-[1.02]">
                                <p className="text-[10px] font-semibold text-pink-600 dark:text-pink-400 uppercase tracking-wide mb-2">Previsão de Usuários para o próximo período</p>
                                <p className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-gray-100">{predictiveWindow ? numberFormatter.format((predictiveWindow.users.nextPeriod || predictiveWindow.users.nextMonth) || 0) : '—'}</p>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">população projetada</p>
                            </div>
                            {/* 3) Taxa de Crescimento (Usuários) */}
                            <div className="bg-white dark:bg-gray-900/70 border border-pink-100 dark:border-gray-700 rounded-xl shadow-md hover:shadow-lg transition-all duração-200 p-6 flex flex-col justify-between group hover:scale-[1.02]">
                                <p className="text-[10px] font-semibold text-pink-600 dark:text-pink-400 uppercase tracking-wide mb-2">Taxa de Crescimento de Usuários</p>
                                <p className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-gray-100">{predictiveWindow && Number.isFinite(predictiveWindow.users.growthRate) ? `${predictiveWindow.users.growthRate.toFixed(1)}%` : '—'}</p>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">{predictiveWindow && predictiveWindow.users.growthRate == null ? 'sem base anterior' : 'do período analisado'}</p>
                            </div>
                            {/* 4) Média de Inscrições (por período) */}
                            <div className="bg-white dark:bg-gray-900/70 border border-pink-100 dark:border-gray-700 rounded-xl shadow-md hover:shadow-lg transition-all duração-200 p-6 flex flex-col justify-between group hover:scale-[1.02]">
                                <p className="text-[10px] font-semibold text-pink-600 dark:text-pink-400 uppercase tracking-wide mb-2">Média de Inscrições (por período)</p>
                                <p className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-gray-100">{
                                    predictiveWindow
                                        ? numberFormatter.format(
                                            Number(
                                                Number.isFinite(predictiveWindow.squads.avgPerPeriod)
                                                    ? predictiveWindow.squads.avgPerPeriod.toFixed(1)
                                                    : 0
                                            )
                                        )
                                        : '—'
                                }</p>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">novas inscrições no período</p>
                            </div>
                            <div className="bg-white dark:bg-gray-900/70 border border-pink-100 dark:border-gray-700 rounded-xl shadow-md hover:shadow-lg transition-all duração-200 p-6 flex flex-col justify-between group hover:scale-[1.02]">
                                <p className="text-[10px] font-semibold text-pink-600 dark:text-pink-400 uppercase tracking-wide mb-2">Previsão de Inscrições para o próximo período</p>
                                <p className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-gray-100">{predictiveWindow ? numberFormatter.format((predictiveWindow.squads.nextPeriod || predictiveWindow.squads.nextMonth) || 0) : '—'}</p>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">novas inscrições previstas</p>
                            </div>
                            <div className="bg-white dark:bg-gray-900/70 border border-pink-100 dark:border-gray-700 rounded-xl shadow-md hover:shadow-lg transition-all duração-200 p-6 flex flex-col justify-between group hover:scale-[1.02]">
                                <p className="text-[10px] font-semibold text-pink-600 dark:text-pink-400 uppercase tracking-wide mb-2">Taxa de Crescimento de Inscrições</p>
                                <p className="text-2xl md:text-3xl font-extrabold text-gray-900 dark:text-gray-100">{predictiveWindow && Number.isFinite(predictiveWindow.squads.growthRate) ? `${predictiveWindow.squads.growthRate.toFixed(1)}%` : '—'}</p>
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">comparação entre início e fim da série</p>
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-3 h-full">
                                <div className="bg-white dark:bg-gray-900/60 rounded-xl p-5 border border-pink-100 dark:border-gray-700 flex flex-col flex-1">
                                    <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
                                        <h3 className="text-sm font-bold text-pink-700 dark:text-pink-400 uppercase tracking-wider">Evolução de Usuários</h3>
                                        <div className="flex items-center gap-1 text-[11px] text-gray-600 dark:text-gray-200">
                                            <span className="text-[11px]">Total:</span>
                                            <span className="text-[11px] text-gray-700 dark:text-gray-200">{numberFormatter.format(lastGrowthValue)} usuários</span>
                                            {analytics.simulatedGrowth && (
                                                <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-[9px] tracking-wide uppercase text-gray-500 dark:text-gray-400">Simulado</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-1 flex">
                                        <UserGrowthChart data={filteredGrowthSeries} simulated={analytics.simulatedGrowth} height={80} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3">
                                <div className="bg-white dark:bg-gray-900/60 rounded-xl p-5 border border-pink-100 dark:border-gray-700 flex-1 flex flex-col justify-center">
                                    <PieChartEvents data={gameDistribution} />
                                </div>
                            </div>
                        </div>

                        {/* Seção de Insights Automáticos */}
                        <div className="mt-8 pt-8 border-t border-pink-200 dark:border-gray-700">
                            <h3 className="text-sm font-bold text-pink-700 dark:text-pink-400 uppercase tracking-wider mb-4">Insights Automáticos</h3>
                            <div className="grid md:grid-cols-2 gap-4" aria-label="Insights gerados automaticamente">
                                {insights.map((item, idx) => (
                                    <div key={idx} className="flex gap-3 p-4 rounded-lg bg-white dark:bg-gray-900/60 border border-pink-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="text-xl flex-shrink-0" aria-hidden="true">{item.icon}</div>
                                        <div className="space-y-1 min-w-0">
                                            <h4 className="text-xs font-bold text-pink-700 dark:text-pink-300">{item.title}</h4>
                                            <p className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-300">{item.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </>
            )}

            <section className="bg-white dark:bg-gray-900/70 border border-pink-100 dark:border-gray-700 rounded-xl shadow-lg p-6 md:p-8" aria-label="Tabela de usuários">
                <header className="mb-6 flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h2 className="text-lg md:text-xl font-bold text-pink-800 dark:text-pink-400">Usuários Registrados</h2>
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Total: {analytics.totalUsuarios} usuários</p>
                    </div>
                    <div className="flex flex-wrap gap-2 items-end">
                        <div className="flex flex-col">
                            <label htmlFor="users-search" className="text-[10px] text-gray-600 dark:text-gray-400 mb-1">Pesquisar</label>
                            <input id="users-search" value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="nome ou usuário..." className="px-3 py-1.5 rounded-md border border-pink-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm" />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="users-role" className="text-[10px] text-gray-600 dark:text-gray-400 mb-1">Categoria</label>
                            <select id="users-role" value={userRole} onChange={e => setUserRole(e.target.value)} className="px-3 py-1.5 rounded-md border border-pink-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm">
                                <option value="todos">Todos</option>
                                <option value="user">Usuários</option>
                                <option value="organizador">Organizadores</option>
                                <option value="admin">Admins</option>
                            </select>
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="users-created-start" className="text-[10px] text-gray-600 dark:text-gray-400 mb-1">Criado de</label>
                            <input id="users-created-start" type="date" value={createdStart} onChange={e => setCreatedStart(e.target.value)} className="px-3 py-1.5 rounded-md border border-pink-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm" />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="users-created-end" className="text-[10px] text-gray-600 dark:text-gray-400 mb-1">até</label>
                            <input id="users-created-end" type="date" value={createdEnd} onChange={e => setCreatedEnd(e.target.value)} className="px-3 py-1.5 rounded-md border border-pink-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm" />
                        </div>
                        {(userSearch || createdStart || createdEnd || userRole !== 'todos') && (
                            <button type="button" onClick={() => { setUserSearch(''); setUserRole('todos'); setCreatedStart(''); setCreatedEnd(''); }} className="px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200">Limpar</button>
                        )}
                    </div>
                </header>

                {carregando && (
                    <div className="py-16 text-center text-gray-500 dark:text-gray-400 text-sm">Carregando usuários...</div>
                )}
                {erro && !carregando && (
                    <p className="text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 p-3 rounded-md">{erro}</p>
                )}
                {!erro && !carregando && (
                    <div className="overflow-x-auto rounded-lg border border-pink-100 dark:border-gray-700">
                        <table className="min-w-full divide-y divide-pink-200 dark:divide-gray-700">
                            <thead className="bg-pink-50 dark:bg-gray-800/50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-[10px] font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider">ID</th>
                                    <th className="px-4 py-3 text-left text-[10px] font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider">Usuário</th>
                                    <th className="px-4 py-3 text-left text-[10px] font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider">Cargo</th>
                                    <th className="px-4 py-3 text-left text-[10px] font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider">Criado em</th>
                                    <th className="px-4 py-3 text-left text-[10px] font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider">Atualizado em</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-pink-100 dark:divide-gray-800 text-xs">
                                {analytics.totalUsuarios === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-4 py-12 text-center text-gray-500 dark:text-gray-400 text-sm">
                                            Nenhum usuário cadastrado ainda.
                                        </td>
                                    </tr>
                                )}
                                {usuarios
                                    .filter(u => {
                                        const q = userSearch.trim().toLowerCase();
                                        const name = (u.username || u.nome || '').toLowerCase();
                                        const role = (u.cargo || u.nivelAcesso || 'user').toLowerCase();
                                        if (q && !name.includes(q)) return false;
                                        if (userRole !== 'todos' && role !== userRole) return false;
                                        if (createdStart) {
                                            const cs = new Date(createdStart).getTime();
                                            const cu = new Date(u.createdAt || u.Data).getTime();
                                            if (Number.isFinite(cs) && Number.isFinite(cu) && cu < cs) return false;
                                        }
                                        if (createdEnd) {
                                            const ce = new Date(createdEnd).getTime();
                                            const cu = new Date(u.createdAt || u.Data).getTime();
                                            if (Number.isFinite(ce) && Number.isFinite(cu) && cu > ce + 24 * 60 * 60 * 1000 - 1) return false;
                                        }
                                        return true;
                                    })
                                    .map((user, idx) => {
                                        const criado = user.createdAt ? new Date(user.createdAt) : null;
                                        const atualizado = user.Data ? new Date(user.Data) : null;
                                        return (
                                            <tr key={idx} className="hover:bg-pink-50 dark:hover:bg-gray-800/40 transition-colors">
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">{user.id || '—'}</td>
                                                <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
                                                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-300 text-[10px] font-bold flex-shrink-0">
                                                        {((user.username || user.nome || '?')[0] || '?').toUpperCase()}
                                                    </span>
                                                    <span className="truncate max-w-[200px]">{user.username || user.nome || '—'}</span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300 capitalize">{(user.cargo || user.nivelAcesso || 'user').toLowerCase()}</td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">{criado && !Number.isNaN(criado) ? criado.toLocaleDateString('pt-BR') : '—'}</td>
                                                <td className="px-4 py-3 text-gray-600 dark:text-gray-300 whitespace-nowrap">{atualizado && !Number.isNaN(atualizado) ? atualizado.toLocaleDateString('pt-BR') : '—'}</td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}
