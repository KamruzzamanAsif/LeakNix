import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from 'recharts';
import prettyBytes from 'pretty-bytes';

export default function MemoryUsageBarChart({ jsonData }: { jsonData: any }) {
  // Transform jsonData into the format required by the BarChart
  const data = jsonData.map((entry: any, index: number) => {
    const before = entry.result.before.statistics;
    const after = entry.result.after.statistics;

    // Convert bytes to kilobytes (divide by 1024)
    const toKB = (bytes: number) => bytes / 1024;

    return {
      name: `Interaction ${index + 1}`, // Test label
      // Before statistics (in kB)
      totalBefore: toKB(before.total),
      v8heapBefore: toKB(before.v8heap),
      nativeBefore: toKB(before.native),
      codeBefore: toKB(before.code),
      jsArraysBefore: toKB(before.jsArrays),
      stringsBefore: toKB(before.strings),
      systemBefore: toKB(before.system),
      // After statistics (in kB)
      totalAfter: toKB(after.total),
      v8heapAfter: toKB(after.v8heap),
      nativeAfter: toKB(after.native),
      codeAfter: toKB(after.code),
      jsArraysAfter: toKB(after.jsArrays),
      stringsAfter: toKB(after.strings),
      systemAfter: toKB(after.system),
    };
  });

  // Custom tooltip formatter to display values in a human-readable format
  const renderTooltipContent = (props: any) => {
    const { active, payload } = props;
    if (active && payload && payload.length) {
      // Group payload into "Before" and "After" categories
      const beforeStats = payload.filter((entry: any) => entry.dataKey.includes('Before'));
      const afterStats = payload.filter((entry: any) => entry.dataKey.includes('After'));

      return (
        <div style={{ backgroundColor: '#333', color: 'white', padding: '8px', borderRadius: '4px' }}>
          {/* Before Statistics */}
          <div>
            <strong>Before</strong>
            {beforeStats.map((entry: any, index: number) => (
              <p key={index} style={{ margin: 0 }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '10px',
                    height: '10px',
                    backgroundColor: entry.fill,
                    marginRight: '5px',
                  }}
                />
                {`${entry.name}: ${prettyBytes(entry.value * 1024)}`}
              </p>
            ))}
          </div>
          {/* Separator Line */}
          <hr style={{ borderColor: 'rgba(255, 255, 255, 0.2)', margin: '8px 0' }} />
          {/* After Statistics */}
          <div>
            <strong>After</strong>
            {afterStats.map((entry: any, index: number) => (
              <p key={index} style={{ margin: 0 }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '10px',
                    height: '10px',
                    backgroundColor: entry.fill,
                    marginRight: '5px',
                  }}
                />
                {`${entry.name}: ${prettyBytes(entry.value * 1024)}`}
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={500}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 50, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          stroke="white"
          // label={{ value: 'Test Labels', position: 'insideBottom', offset: -10, fill: 'white' }} // X-axis label
        />
        <YAxis
          stroke="white"
          label={{
            value: 'Memory Usage (in kB)',
            angle: -90,
            position: 'insideLeft',
            offset: -10, // Increased offset to move the label further away
            fill: 'white',
          }} // Y-axis label
        />
        <Tooltip
          content={renderTooltipContent} // Custom tooltip content
        />
        <Legend
          wrapperStyle={{
            color: 'white', // White text for legend
          }}
        />
        {/* Before Statistics Bars */}
        <Bar dataKey="totalBefore" fill="#4CAF50" name="Total Before" />
        <Bar dataKey="v8heapBefore" fill="#2196F3" name="V8 Heap Before" />
        <Bar dataKey="nativeBefore" fill="#FF9800" name="Native Before" />
        <Bar dataKey="codeBefore" fill="#9C27B0" name="Code Before" />
        <Bar dataKey="jsArraysBefore" fill="#00BCD4" name="JS Arrays Before" />
        <Bar dataKey="stringsBefore" fill="#8BC34A" name="Strings Before" />
        <Bar dataKey="systemBefore" fill="#FF5722" name="System Before" />
        {/* After Statistics Bars */}
        <Bar dataKey="totalAfter" fill="#4CAF50" name="Total After" />
        <Bar dataKey="v8heapAfter" fill="#2196F3" name="V8 Heap After" />
        <Bar dataKey="nativeAfter" fill="#FF9800" name="Native After" />
        <Bar dataKey="codeAfter" fill="#9C27B0" name="Code After" />
        <Bar dataKey="jsArraysAfter" fill="#00BCD4" name="JS Arrays After" />
        <Bar dataKey="stringsAfter" fill="#8BC34A" name="Strings After" />
        <Bar dataKey="systemAfter" fill="#FF5722" name="System After" />
      </BarChart>
    </ResponsiveContainer>
  );
}