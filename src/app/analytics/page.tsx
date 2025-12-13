"use client";

import {DashboardLayout} from '@/components/layout/DashboardLayout';
import {mockWeightData, mockCalorieData, mockVolumeData} from '@/lib/mockData';
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import {TrendingUp, TrendingDown, Scale, Flame, Dumbbell} from 'lucide-react';

const StatCard = ({
                      title,
                      value,
                      change,
                      changeLabel,
                      icon: Icon,
                      positive = true,
                  }: {
    title: string;
    value: string;
    change: string;
    changeLabel: string;
    icon: React.ComponentType<{ className?: string }>;
    positive?: boolean;
}) => (
    <div className="p-6 rounded-2xl bg-card border border-border">
        <div className="flex items-center justify-between mb-4">
            <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary"/>
            </div>
            <div className={`flex items-center gap-1 text-sm ${positive ? 'text-success' : 'text-destructive'}`}>
                {positive ? <TrendingUp className="h-4 w-4"/> : <TrendingDown className="h-4 w-4"/>}
                {change}
            </div>
        </div>
        <p className="font-display text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground mt-1">{title}</p>
        <p className="text-xs text-muted-foreground">{changeLabel}</p>
    </div>
);

export default function Analytics() {
    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div>
                    <h1 className="font-display text-2xl lg:text-3xl font-bold">
                        Progress Analytics
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Track your fitness journey with detailed insights
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard
                        title="Current Weight"
                        value="78 kg"
                        change="-2 kg"
                        changeLabel="vs. last month"
                        icon={Scale}
                        positive={true}
                    />
                    <StatCard
                        title="Avg. Daily Calories"
                        value="2,490 kcal"
                        change="+2%"
                        changeLabel="vs. target"
                        icon={Flame}
                        positive={true}
                    />
                    <StatCard
                        title="Weekly Volume"
                        value="58,000 kg"
                        change="+15%"
                        changeLabel="vs. last week"
                        icon={Dumbbell}
                        positive={true}
                    />
                </div>

                {/* Weight Progress Chart */}
                <div className="p-6 rounded-2xl bg-card border border-border">
                    <h2 className="font-display text-lg font-semibold mb-6">Weight Progress</h2>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={mockWeightData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                                <XAxis
                                    dataKey="date"
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                />
                                <YAxis
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    domain={['dataMin - 1', 'dataMax + 1']}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '0.5rem',
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="weight"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={3}
                                    dot={{fill: 'hsl(var(--primary))', strokeWidth: 2}}
                                    activeDot={{r: 6}}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Calories Chart */}
                <div className="p-6 rounded-2xl bg-card border border-border">
                    <h2 className="font-display text-lg font-semibold mb-6">Weekly Calorie Intake</h2>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mockCalorieData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                                <XAxis
                                    dataKey="date"
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                />
                                <YAxis
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '0.5rem',
                                    }}
                                />
                                <Legend/>
                                <Bar
                                    dataKey="calories"
                                    name="Actual"
                                    fill="hsl(var(--primary))"
                                    radius={[4, 4, 0, 0]}
                                />
                                <Bar
                                    dataKey="target"
                                    name="Target"
                                    fill="hsl(var(--muted))"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Volume Progress Chart */}
                <div className="p-6 rounded-2xl bg-card border border-border">
                    <h2 className="font-display text-lg font-semibold mb-6">Training Volume Progress</h2>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={mockVolumeData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))"/>
                                <XAxis
                                    dataKey="week"
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                />
                                <YAxis
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={12}
                                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        border: '1px solid hsl(var(--border))',
                                        borderRadius: '0.5rem',
                                    }}
                                    formatter={(value: number) => [`${value.toLocaleString()} kg`, 'Volume']}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="volume"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={3}
                                    dot={{fill: 'hsl(var(--primary))', strokeWidth: 2}}
                                    activeDot={{r: 6}}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-accent/30 text-center">
                        <p className="font-display text-2xl font-bold">28</p>
                        <p className="text-sm text-muted-foreground">Total Workouts</p>
                    </div>
                    <div className="p-4 rounded-xl bg-accent/30 text-center">
                        <p className="font-display text-2xl font-bold">1,890</p>
                        <p className="text-sm text-muted-foreground">Total Sets</p>
                    </div>
                    <div className="p-4 rounded-xl bg-accent/30 text-center">
                        <p className="font-display text-2xl font-bold">458k</p>
                        <p className="text-sm text-muted-foreground">Total Volume (kg)</p>
                    </div>
                    <div className="p-4 rounded-xl bg-accent/30 text-center">
                        <p className="font-display text-2xl font-bold">42h</p>
                        <p className="text-sm text-muted-foreground">Time Training</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
