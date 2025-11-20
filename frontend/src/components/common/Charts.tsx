import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Color palettes
const COLORS = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#34495e'];
const PRIMARY_COLOR = '#3498db';
const SECONDARY_COLOR = '#2ecc71';

interface ChartProps {
  data: any[];
  height?: number;
}

// Registration Trend Line Chart
export const RegistrationTrendChart: React.FC<ChartProps> = ({ data, height = 300 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          stroke="#7f8c8d"
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          stroke="#7f8c8d"
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '10px'
          }}
        />
        <Legend 
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="circle"
        />
        <Line 
          type="monotone" 
          dataKey="farmers" 
          stroke={PRIMARY_COLOR} 
          strokeWidth={2}
          dot={{ fill: PRIMARY_COLOR, r: 4 }}
          activeDot={{ r: 6 }}
          name="Farmers"
        />
        <Line 
          type="monotone" 
          dataKey="buyers" 
          stroke={SECONDARY_COLOR} 
          strokeWidth={2}
          dot={{ fill: SECONDARY_COLOR, r: 4 }}
          activeDot={{ r: 6 }}
          name="Buyers"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Crop Category Bar Chart
export const CropCategoryChart: React.FC<ChartProps> = ({ data, height = 300 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" />
        <XAxis 
          dataKey="_id" 
          tick={{ fontSize: 12 }}
          stroke="#7f8c8d"
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          stroke="#7f8c8d"
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '10px'
          }}
        />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        <Bar 
          dataKey="count" 
          fill={PRIMARY_COLOR} 
          radius={[8, 8, 0, 0]}
          name="Crop Count"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Request Status Pie Chart
export const RequestStatusChart: React.FC<ChartProps> = ({ data, height = 300 }) => {
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={14}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomizedLabel}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '10px'
          }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Transaction Value Trend
export const TransactionTrendChart: React.FC<ChartProps> = ({ data, height = 300 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          stroke="#7f8c8d"
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          stroke="#7f8c8d"
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '10px'
          }}
          formatter={(value: any) => ['₹' + value.toLocaleString('en-IN'), 'Value']}
        />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        <Line 
          type="monotone" 
          dataKey="totalValue" 
          stroke="#27ae60" 
          strokeWidth={2}
          dot={{ fill: '#27ae60', r: 4 }}
          activeDot={{ r: 6 }}
          name="Transaction Value"
        />
        <Line 
          type="monotone" 
          dataKey="count" 
          stroke="#e67e22" 
          strokeWidth={2}
          dot={{ fill: '#e67e22', r: 4 }}
          activeDot={{ r: 6 }}
          name="Request Count"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

// Buyer Type Distribution
export const BuyerTypeChart: React.FC<ChartProps> = ({ data, height = 300 }) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" />
        <XAxis 
          dataKey="_id" 
          tick={{ fontSize: 12 }}
          stroke="#7f8c8d"
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          stroke="#7f8c8d"
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '10px'
          }}
        />
        <Bar 
          dataKey="count" 
          fill={SECONDARY_COLOR} 
          radius={[8, 8, 0, 0]}
          name="Buyer Count"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Top Districts Chart
export const TopDistrictsChart: React.FC<ChartProps> = ({ data, height = 300 }) => {
  // Take top 10 districts
  const topData = data.slice(0, 10);
  
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={topData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#ecf0f1" />
        <XAxis 
          type="number"
          tick={{ fontSize: 12 }}
          stroke="#7f8c8d"
        />
        <YAxis 
          type="category"
          dataKey="_id" 
          tick={{ fontSize: 12 }}
          stroke="#7f8c8d"
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#fff', 
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '10px'
          }}
        />
        <Bar 
          dataKey="count" 
          fill="#9b59b6" 
          radius={[0, 8, 8, 0]}
          name="User Count"
        />
      </BarChart>
    </ResponsiveContainer>
  );
};
