import React, { useEffect } from 'react';
import { pieArcLabelClasses, PieChart } from '@mui/x-charts/PieChart';

interface PieChartProps {
  data: Array<{ id: number; value: number; label: string }>;
  innerRadius?: number;
  outerRadius?: number;
  paddingAngle?: number;
  cornerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  cx?: number;
  cy?: number;
}

const pieData = [
  { id: 0, value: 10, label: 'series A' },
  { id: 1, value: 1, label: 'series B' },
  { id: 2, value: 2, label: 'series C' },
];

const CustomPieChart: React.FC<PieChartProps> = ({
  data = pieData,
  innerRadius = 30,
  outerRadius = 100,
  paddingAngle = 5,
  cornerRadius = 5,
  startAngle = -45,
  endAngle = 225,
  cx = 150,
  cy = 150,
}) => {
  useEffect(() => {
    console.log('CustomPieChart mounted');
    console.log('PieChart data:', data);
  }, [data]);

  return (
    <div>
      <PieChart
        series={[
          {
            data: data,
            innerRadius: innerRadius,
            outerRadius: outerRadius,
            paddingAngle: paddingAngle,
            cornerRadius: cornerRadius,
            startAngle: startAngle,
            endAngle: endAngle,
            cx: cx,
            cy: cy,
            highlightScope: { fade: 'global', highlight: 'item' },
            faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
          },
        ]}
        sx={{
          // Style for arc labels
          [`& .${pieArcLabelClasses.root}`]: {
            fontWeight: 'bold',
            fill: 'green', // Change arc label color to green
            fontSize: '14px',
          },
          '& .MuiChartsLegend-series text': {
            fontSize: "1em !important",
            fill: "white !important",
          },
        }}
        width={520}
        height={300}
      />
    </div>
  );
};

export default CustomPieChart;
