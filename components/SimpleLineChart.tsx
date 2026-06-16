import React, { useState } from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

interface DataPoint {
    label: string;
    value: number;
}

interface WebChartProps {
    data: DataPoint[];
    color?: string;
    height?: number;
    valueUnit?: string; // Optional unit to display (e.g., "kg", "min")
    width?: number; // Custom width
}

import { COLORS } from '../lib/theme';

export const SimpleLineChart = ({ data, color, height = 200, valueUnit = '', width: customWidth }: WebChartProps) => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const primaryColor = COLORS.primary;
    const borderColor = COLORS.border;
    const backgroundColor = COLORS.background;

    // Default color to primary if not provided
    const chartColor = color || primaryColor;

    const { width: screenWidth } = Dimensions.get('window');
    // Default to screen width - 72 (standard padding from ScrollView 20x2 and Card 16x2)
    // We add extra internal padding to prevent points from clipping at the edges
    const totalWidth = customWidth || (screenWidth - 72);
    const horizontalPadding = 24;
    const effectiveWidth = totalWidth - (horizontalPadding * 2);
    const paddingVertical = 20;

    // Calculate scales
    const maxValue = data.length > 0 ? Math.max(...data.map(d => d.value)) : 100;
    const minValue = data.length > 0 ? Math.min(...data.map(d => d.value)) : 0;
    const range = maxValue - minValue || 1; // Avoid division by zero

    // Safety check for data length
    const stepX = data.length > 1 ? effectiveWidth / (data.length - 1) : effectiveWidth / 2;
    const stepY = (height - paddingVertical * 2) / range;

    // Helper to get X coordinate
    const getX = (index: number) => {
        if (data.length <= 1) return totalWidth / 2;
        return horizontalPadding + (index * stepX);
    };

    const points = data.length > 0 ? data.map((d, i) => {
        const x = getX(i);
        const y = height - paddingVertical - (d.value - minValue) * stepY;
        return `${x},${y}`;
    }).join(' ') : "";

    return (
        <View>
            <Svg height={height} width={totalWidth}>
                {/* Grid Lines (Simple) */}
                <Line x1="0" y1={height - paddingVertical} x2={totalWidth} y2={height - paddingVertical} stroke={borderColor} strokeWidth="1" />

                {/* Chart Line */}
                <Path
                    d={`M ${points}`}
                    fill="none"
                    stroke={chartColor}
                    strokeWidth="3"
                />

                {/* Data Points */}
                {data.map((d, i) => {
                    const x = getX(i);
                    const y = height - paddingVertical - (d.value - minValue) * stepY;
                    const isSelected = selectedIndex === i;
                    return (
                        <React.Fragment key={i}>
                            <Circle
                                cx={x}
                                cy={y}
                                r={isSelected ? "6" : "4"}
                                fill={isSelected ? chartColor : backgroundColor}
                                stroke={chartColor}
                                strokeWidth="2"
                                onPress={() => setSelectedIndex(i === selectedIndex ? null : i)}
                            />
                        </React.Fragment>
                    )
                })}
            </Svg>

            {/* Tooltip - shows when a point is selected */}
            {selectedIndex !== null && selectedIndex >= 0 && selectedIndex < data.length && (
                <View className="absolute top-2 left-0 right-0 items-center">
                    <View className="bg-card px-3 py-2 rounded-lg border border-border">
                        <Text className="text-white text-sm font-bold">
                            {data[selectedIndex].label}: {data[selectedIndex].value}{valueUnit}
                        </Text>
                    </View>
                </View>
            )}

            <View className="flex-row justify-between mt-2" style={{ paddingHorizontal: horizontalPadding - 10 }}>
                {data.map((d, i) => (
                    <TouchableOpacity
                        key={i}
                        onPress={() => setSelectedIndex(i === selectedIndex ? null : i)}
                        className="w-8 items-center"
                    >
                        <Text className={`text-[10px] text-center ${selectedIndex === i ? 'text-primary font-bold' : 'text-muted'}`} numberOfLines={1}>
                            {d.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};
