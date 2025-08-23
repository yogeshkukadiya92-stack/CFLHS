'use client';

import * as React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { KRA } from '@/lib/types';
import { ChartConfig, ChartContainer, ChartTooltipContent } from '@/components/ui/chart';

interface KraProgressChartProps {
  kras: KRA[];
}

const statusColors: { [key: string]: string } = {
  'On Track': 'hsl(var(--chart-2))',
  'At Risk': 'hsl(var(--chart-4))',
  'Completed': 'hsl(var(--chart-1))',
  'Pending': 'hsl(var(--muted))',
};

const chartConfig = {
    kras: {
      label: "KRAs",
    },
    'On Track': {
        label: 'On Track',
        color: statusColors['On Track'],
    },
    'At Risk': {
        label: 'At Risk',
        color: statusColors['At Risk'],
    },
    'Completed': {
        label: 'Completed',
        color: statusColors['Completed'],
    },
    'Pending': {
        label: 'Pending',
        color: statusColors['Pending'],
    },
} satisfies ChartConfig

export function KraProgressChart({ kras }: KraProgressChartProps) {
  const data = React.useMemo(() => {
    const statusCounts: { [key: string]: number } = {
      'On Track': 0,
      'At Risk': 0,
      'Completed': 0,
      'Pending': 0,
    };

    kras.forEach((kra) => {
      if (statusCounts[kra.status] !== undefined) {
        statusCounts[kra.status]++;
      }
    });

    return Object.keys(statusCounts)
      .map((status) => ({
        name: status,
        value: statusCounts[status],
        fill: statusColors[status],
      }))
      .filter((entry) => entry.value > 0);
  }, [kras]);

  const totalKras = data.reduce((acc, curr) => acc + curr.value, 0);

  if (data.length === 0) {
    return (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle>KRA Status Overview</CardTitle>
                <CardDescription>No KRAs assigned to this employee yet.</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-[250px] text-muted-foreground">
                <p>No data to display.</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>KRA Status Overview</CardTitle>
        <CardDescription>A distribution of the employee's {totalKras} KRAs.</CardDescription>
      </CardHeader>
      <CardContent>
         <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
             <Tooltip
                cursor={{fill: 'hsl(var(--muted))'}}
                content={<ChartTooltipContent 
                    nameKey="name"
                    label="KRAs"
                />}
             />
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={50}
                labelLine={false}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                    const radius = innerRadius + (outerRadius - innerRadius) * 1.3;
                    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                    if (percent < 0.05) return null;
                    return (
                        <text x={x} y={y} fill="hsl(var(--foreground))" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs">
                          {`${data[index].name} (${(percent * 100).toFixed(0)}%)`}
                        </text>
                    );
                 }}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} stroke={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
