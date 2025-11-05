import { useRef } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type ArtifactProps = {
    isOpen: boolean;
    onClose?: () => void;
    type: 'chart' | 'table';
    data: any;
    title?: string;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];
const compoSize = "w-96 h-full";

export default function Artifact({ isOpen, onClose, type, data, title }: ArtifactProps) {
    const menuRef = useRef<HTMLDivElement | null>(null);

    if (!isOpen) return null;

    const renderChart = () => {
        if (!data || !data.chartType || !data.data) return <div>No chart data available</div>;

        const { chartType, data: chartData, options } = data;
        const chartTitle = title || options?.title || 'Chart';

        switch (chartType.toLowerCase()) {
            case 'bar':
                return (
                    <div className="w-full h-96">
                        <h3 className="text-lg font-semibold mb-4 text-center">{chartTitle}</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey={options?.xAxisKey || Object.keys(chartData[0])[0]}
                                    angle={-45}
                                    textAnchor="end"
                                    height={80}
                                    interval={0} // Show all labels
                                    tick={{ fontSize: 12 }} // Smaller font size
                                    tickMargin={10}
                                />
                                <YAxis />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                                />
                                <Legend />
                                {options?.dataKeys?.map((key: string, index: number) => (
                                    <Bar
                                        key={key}
                                        dataKey={key}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                )) || <Bar dataKey={Object.keys(chartData[0])[1]} fill={COLORS[0]} />}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                );

            case 'horizontalbar':
                return (
                    <div className="w-full h-96">
                        <h3 className="text-lg font-semibold mb-4 text-center">{chartTitle}</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={chartData}
                                layout={chartType.toLowerCase() === 'horizontalbar' ? 'horizontal' : 'vertical'}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                {chartType.toLowerCase() === 'horizontalbar' ? (
                                    <>
                                        <XAxis type="number" />
                                        <YAxis
                                            type="category"
                                            dataKey={options?.yAxisKey || Object.keys(chartData[0])[0]}
                                            width={150}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <XAxis dataKey={options?.xAxisKey || Object.keys(chartData[0])[0]} />
                                        <YAxis />
                                    </>
                                )}
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                                <Legend />
                                {options?.dataKeys?.map((key: string, index: number) => (
                                    <Bar
                                        key={key}
                                        dataKey={key}
                                        fill={COLORS[index % COLORS.length]}
                                    />
                                )) || <Bar dataKey={Object.keys(chartData[0])[1]} fill={COLORS[0]} />}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                );

            case 'line':
                return (
                    <div className="w-full h-96">
                        <h3 className="text-lg font-semibold mb-4 text-center">{chartTitle}</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                                data={chartData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey={options?.xAxisKey || Object.keys(chartData[0])[0]} />
                                <YAxis />
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                                <Legend />
                                {options?.dataKeys?.map((key: string, index: number) => (
                                    <Line
                                        key={key}
                                        type="monotone"
                                        dataKey={key}
                                        stroke={COLORS[index % COLORS.length]}
                                        strokeWidth={2}
                                    />
                                )) || <Line type="monotone" dataKey={Object.keys(chartData[0])[1]} stroke={COLORS[0]} strokeWidth={2} />}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                );

            case 'pie':
                return (
                    <div className="w-full h-96">
                        <h3 className="text-lg font-semibold mb-4 text-center">{chartTitle}</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry) => {
                                        const labelKey = options?.labelKey || options?.angleKey || Object.keys(chartData[0])[0];
                                        const percent = (entry.percent * 100).toFixed(0);

                                        // Only show label if slice is large enough (>3%)
                                        if (entry.percent < 0.03) {
                                            return '';
                                        }

                                        // Show short label for small slices (3-8%)
                                        if (entry.percent < 0.08) {
                                            return `${percent}%`;
                                        }

                                        // Full label for larger slices
                                        return `${entry[labelKey]} ${percent}%`;
                                    }}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey={options?.labelKey || options?.calloutLabelKey || Object.keys(chartData[0])[1]}
                                >
                                    {chartData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#111827',
                                        border: '1px solid #374151',
                                        borderRadius: '8px',
                                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)',
                                        color: '#f9fafb',
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        padding: '12px'
                                    }}
                                    labelStyle={{
                                        color: '#e5e7eb',
                                        fontWeight: '600',
                                        marginBottom: '6px'
                                    }}
                                    itemStyle={{
                                        color: '#f9fafb',
                                        padding: '2px 0'
                                    }}
                                    cursor={{
                                        fill: 'rgba(55, 65, 81, 0.1)'
                                    }}
                                    formatter={(value: any, name: any, props: any) => {
                                        const angleKey = Object.keys(chartData[0])[0];
                                        return [`${value}`, `${props.payload[angleKey]}`];
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                );

            default:
                return <div>Unsupported chart type: {chartType}</div>;
        }
    };

    const renderTable = () => {
        if (typeof data === 'string') {
            // Parse markdown table
            const lines = data.split('\n').filter(line => line.trim());
            if (lines.length < 2) return <div>Invalid table data</div>;

            // Find header and separator lines
            const headerLine = lines.find(line => line.includes('|') && !line.includes('---') && !line.includes(':--'));
            const separatorIndex = lines.findIndex(line => line.includes('---') || line.includes(':--'));

            if (!headerLine || separatorIndex === -1) return <div>Invalid table format</div>;

            const headers = headerLine.split('|').map(h => h.trim()).filter(h => h);
            const dataLines = lines.slice(separatorIndex + 1).filter(line => line.includes('|'));

            const tableData = dataLines.map(line => {
                const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
                const row: { [key: string]: string } = {};
                headers.forEach((header, index) => {
                    row[header] = cells[index] || '';
                });
                return row;
            });

            return (
                <div className="w-full">
                    <h3 className="text-lg font-semibold mb-4 text-center">{title || 'Data Table'}</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse border border-neutral-700">
                            <thead>
                                <tr className="bg-neutral-800">
                                    {headers.map((header, index) => (
                                        <th key={index} className="border border-neutral-600 px-3 py-2 text-left text-sm font-medium">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {tableData.map((row, rowIndex) => (
                                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-neutral-850' : 'bg-neutral-900'}>
                                        {headers.map((header, colIndex) => (
                                            <td key={colIndex} className="border border-neutral-600 px-3 py-2 text-sm">
                                                {row[header]}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            );
        }
        return <div>Unable to render table</div>;
    };

    return (
        <aside
            className={[
                "fixed right-0 top-0 z-40 h-screen flex flex-col bg-neutral-900 text-white transition-all duration-300 ease-in-out",
                "border-l border-neutral-800 w-96",
                isOpen ? "translate-x-0" : "translate-x-full"
            ].join(" ")}
            ref={menuRef}
        >
            {/* Header section */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 flex-shrink-0">
                <span className="p-2 text-sm font-semibold">
                    {type === 'chart' ? '📊 Chart Viewer' : '📋 Table Viewer'}
                </span>
                <button
                    onClick={onClose}
                    className="p-2 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded"
                >
                    ✕ Close
                </button>
            </div>

            {/* Content section */}
            <div className="flex-1 p-4 overflow-y-auto">
                {type === 'chart' ? renderChart() : renderTable()}
            </div>
        </aside>
    );
}