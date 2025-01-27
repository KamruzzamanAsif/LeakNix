import * as React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import prettyBytes from 'pretty-bytes';

interface MemoryData {
  name: string;
  code: number;
  jsArrays: number;
  strings: number;
  native: number;
  system: number;
  v8heap: number;
  codeAfter: number;
  jsArraysAfter: number;
  stringsAfter: number;
  nativeAfter: number;
  systemAfter: number;
  v8heapAfter: number;
}

interface AverageGrowthData {
  type: string;
  growth: number;
  growthPercentage: number; // Percentage growth
}

interface JsonDataEntry {
  result: {
    before: {
      statistics: {
        total: number; // Total memory before
        code: number;
        jsArrays: number;
        strings: number;
        native: number;
        system: number;
        v8heap: number;
      };
    };
    after: {
      statistics: {
        total: number; // Total memory after
        code: number;
        jsArrays: number;
        strings: number;
        native: number;
        system: number;
        v8heap: number;
      };
    };
  };
}

interface MemoryUsageRadarChartProps {
  jsonData: JsonDataEntry[];
}

export default function AverageMemoryGrowthRadarChart({ jsonData }: MemoryUsageRadarChartProps) {
  // Transform jsonData into the format required for calculations
  const data: MemoryData[] = jsonData.map((entry, index) => {
    const before = entry.result.before.statistics;
    const after = entry.result.after.statistics;

    // Validate that all fields are numbers
    const validateFields = (obj: any) => {
      for (const key in obj) {
        if (typeof obj[key] !== 'number' || isNaN(obj[key])) {
          console.warn(`Invalid data for ${key} in entry ${index}:`, obj[key]);
          return false;
        }
      }
      return true;
    };

    if (!validateFields(before) || !validateFields(after)) {
      // Skip this entry if data is invalid
      return null;
    }

    // Convert bytes to kilobytes (divide by 1024)
    const toKB = (bytes: number) => bytes / 1024;

    return {
      name: `Test ${index + 1}`,
      code: toKB(before.code),
      jsArrays: toKB(before.jsArrays),
      strings: toKB(before.strings),
      native: toKB(before.native),
      system: toKB(before.system),
      v8heap: toKB(before.v8heap),
      codeAfter: toKB(after.code),
      jsArraysAfter: toKB(after.jsArrays),
      stringsAfter: toKB(after.strings),
      nativeAfter: toKB(after.native),
      systemAfter: toKB(after.system),
      v8heapAfter: toKB(after.v8heap),
    };
  }).filter(entry => entry !== null); // Filter out invalid entries

  // Calculate average growth and percentage growth for each memory type
  const calculateAverages = (data: MemoryData[]): AverageGrowthData[] => {
    const memoryTypes = ['code', 'jsArrays', 'strings', 'native', 'system', 'v8heap'];

    return memoryTypes.map((type) => {
      const beforeSum = data.reduce((sum, entry) => sum + entry[type], 0);
      const afterSum = data.reduce((sum, entry) => sum + entry[`${type}After`], 0);

      const beforeAvg = beforeSum / data.length;
      const afterAvg = afterSum / data.length;

      const growth = afterAvg - beforeAvg; // Average growth in KB
      const growthPercentage = beforeAvg === 0 ? 0 : ((growth / beforeAvg) * 100).toFixed(2); // Handle division by zero

      return {
        type,
        growth,
        growthPercentage: parseFloat(growthPercentage), // Convert back to number
      };
    });
  };

  const averages = calculateAverages(data);

  // Calculate total average growth from result.before.statistics.total and result.after.statistics.total
  const totalBefore = jsonData.reduce((sum, entry) => sum + entry.result.before.statistics.total, 0) / jsonData.length;
  const totalAfter = jsonData.reduce((sum, entry) => sum + entry.result.after.statistics.total, 0) / jsonData.length;
  const totalAverageGrowth = (totalAfter - totalBefore) / 1024; // Convert to KB
  const totalAverageGrowthPercentage = ((totalAverageGrowth / (totalBefore / 1024)) * 100).toFixed(2);

  const totalAfterSum = jsonData.reduce((sum, entry) => sum + entry.result.after.statistics.total, 0) / 1024;

  // Custom tooltip formatter to display values in a human-readable format
  const renderTooltipContent = (props: any) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: '#333', color: 'white', padding: '12px', borderRadius: '8px' }}>
          {payload.map((entry: any, index: number) => (
            <div key={index} style={{ margin: '8px 0' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  backgroundColor: entry.color,
                  marginRight: '8px',
                  borderRadius: '50%',
                }}
              />
              <strong style={{ fontSize: '14px' }}>{entry.name}</strong>: {prettyBytes(entry.value * 1024)} <br />
              <span style={{ fontSize: '14px', color: '#ffa500', fontWeight: 'bold' }}>
                ({entry.payload.growthPercentage}% growth)
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Define colors for each memory type
  const memoryTypeColors = {
    code: '#8884d8',
    jsArrays: '#82ca9d',
    strings: '#ffc658',
    native: '#ff8042',
    system: '#00bcd4',
    v8heap: '#9c27b0',
  };

  return (
    <div style={{ backgroundColor: '#242525', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' }}>
      {/* Total Average Growth Box */}
      <div
        style={{
          backgroundColor: '#333',
          padding: '16px',
          borderRadius: '8px',
          marginBottom: '20px',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        <h4 style={{ color: 'white', margin: '0', fontSize: '18px', fontWeight: 'bold' }}>
          Total Memory Across all Tests
        </h4>
        <p style={{ color: '#ffa500', fontSize: '24px', fontWeight: 'bold', margin: '8px 0 0' }}>
          {prettyBytes(totalAfterSum * 1024)} 
        </p>
      </div>

      <ResponsiveContainer width="100%" height={500}>
        <RadarChart
          outerRadius="80%"
          data={averages}
          margin={{ top: 20, right: 30, left: 30, bottom: 5 }}
        >
          <PolarGrid stroke="#555" />
          <PolarAngleAxis dataKey="type" stroke="white" />
          <PolarRadiusAxis angle={30} domain={['auto', 'auto']} stroke="white" />
          <Tooltip content={renderTooltipContent} />
          <Legend
            wrapperStyle={{ color: 'white', paddingTop: '10px' }}
            formatter={(value) => <span style={{ color: 'white' }}>{value}</span>}
          />
          {/* Colorful Radars */}
          <Radar
            name="Average Growth"
            dataKey="growth"
            stroke={memoryTypeColors.code}
            fill={memoryTypeColors.code}
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}