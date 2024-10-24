/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable react-prefer-function-component/react-prefer-function-component */
// Type definitions for react-native-svg-charts 5.0
// Project: https://github.com/JesperLekland/react-native-svg-charts
// Definitions by: Krzysztof Miemiec <https://github.com/krzysztof-miemiec>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.8

/**
 * We have conflict with the types library so we need to declare it here
 */

declare module 'react-native-svg-charts' {
    import { ScaleBand, ScaleLinear, ScaleLogarithmic, ScalePower, ScaleTime } from 'd3-scale';
    import { CurveFactory, Series } from 'd3-shape';
    import * as React from 'react';
    import { StyleProp, ViewStyle } from 'react-native';
    import {
        CommonPathProps,
        LinearGradientProps,
        LineProps,
        PathProps,
        RadialGradientProps,
        TextProps
    } from 'react-native-svg';

    type ScaleType<Range, Output> =
        | ScaleLinear<Range, Output>
        | ScaleLogarithmic<Range, Output>
        | ScalePower<Range, Output>
        | ScaleTime<Range, Output>;

    type ScaleFunction = () => ScaleType<any, any> | ScaleBand<any>;
    type AccessorFunction<T, U> = (props: { item: T, index: number }) => U;
    type SortFunction<T> = (a: T, b: T) => number;
    type OffsetFunction = (series: Series<any, any>, order: number[]) => void;
    type OrderFunction = (series: Series<any, any>) => number[];

    // Chart

    interface ChartProps<T> {
        data: T[];
        style?: StyleProp<ViewStyle>;
        animate?: boolean;
        animationDuration?: number;
        svg?: Partial<PathProps>;
        width?: number;
        height?: number;
        curve?: CurveFactory;
        contentInset?: {
            top?: number,
            left?: number,
            right?: number,
            bottom?: number,
        };
        gridMin?: number;
        gridMax?: number;
        gridProps?: GridProps<any>;
        numberOfTicks?: number;
        xScale?: ScaleFunction;
        yScale?: ScaleFunction;
        xAccessor?: AccessorFunction<T, number>;
        yAccessor?: AccessorFunction<T, number>;
        children?: React.ReactNode
    }

    // Line Chart

    class LineChart<T> extends React.PureComponent<ChartProps<T>> {
    }


    // Pie Chart

    interface PieChartData {
        svg?: Partial<PathProps>;
        key: string | number;
        value?: number;
        arc?: {
            outerRadius?: number | string;
            cornerRadius?: number | string;
        };
    }

    interface PieChartProps<T extends PieChartData> extends ChartProps<T> {
        innerRadius?: number | string;
        outerRadius?: number | string;
        labelRadius?: number | string;
        padAngle?: number;
        sort?: SortFunction<T>;
        valueAccessor?: AccessorFunction<T, number>;
    }

    class PieChart<T extends PieChartData> extends React.PureComponent<PieChartProps<T>> {
    }

    // Area Chart

    interface AreaChartProps<T> extends ChartProps<T> {
        start?: number;
    }

    class AreaChart<T> extends React.PureComponent<AreaChartProps<T>> {
    }

    // Stacked Area Chart

    interface StackedAreaChartProps<T> extends ChartProps<T> {
        keys: ReadonlyArray<keyof T>;
        colors: string[];
        offset?: OffsetFunction;
        order?: OrderFunction;
        renderGradient?: (props: {
            id: string,
            width: number,
            height: number,
            x: number,
            y: number,
            index: number,
            key: keyof T,
            color: string,
        }) => React.Component<LinearGradientProps | RadialGradientProps>;
        showGrid?: boolean;
        extras?: any[];
        renderDecorator?: () => {};
    }

    class StackedAreaChart<T> extends React.PureComponent<StackedAreaChartProps<T>> {
        static extractDataPoints<T>(data: T[], keys: ReadonlyArray<keyof T>, order?: OrderFunction, offset?: OffsetFunction): number[];
    }

    // Stacked Bar Chart

    interface StackedBarChartProps<T> extends ChartProps<T> {
        keys: ReadonlyArray<keyof T>;
        colors: string[];
        offset?: OffsetFunction;
        order?: OrderFunction;
        strokeColor?: string;
        renderGradient: (props: { id: string }) => React.Component<LinearGradientProps | RadialGradientProps>;
        spacingInner?: number;
        spacingOuter?: number;
        showGrid?: boolean;
        extras?: any[];
        extra?: () => {};
    }

    class StackedBarChart<T> extends React.PureComponent<StackedBarChartProps<T>> {
        static extractDataPoints<T>(data: T, keys: ReadonlyArray<keyof T>, order?: OrderFunction, offset?: OffsetFunction): number[];
    }

    // Bar Chart

    interface BarChartProps<T> extends ChartProps<T> {
        spacingInner?: number;
        spacingOuter?: number;
    }

    class BarChart<T> extends React.PureComponent<BarChartProps<T>> {
    }

    // Axis

    interface AxisProps<T> {
        style?: StyleProp<ViewStyle>;
        data: T[];
        spacingInner?: number;
        spacingOuter?: number;
        formatLabel?: (value: any, index: number) => number | string;
        scale?: ScaleFunction;
        numberOfTicks?: number;
        svg?: Partial<TextProps>;
    }

    // XAxis

    interface XAxisProps<T> extends AxisProps<T> {
        contentInset?: {
            left?: number;
            right?: number
        };
        xAccessor?: AccessorFunction<T, any>;
    }

    class XAxis<T> extends React.PureComponent<XAxisProps<T>> {
    }

    // YAxis

    interface YAxisProps<T> extends AxisProps<T> {
        style?: StyleProp<ViewStyle>;
        contentInset?: {
            top?: number;
            bottom?: number;
        };
        min?: number;
        max?: number;
        yAccessor?: AccessorFunction<T, any>;
    }

    class YAxis<T> extends React.PureComponent<YAxisProps<T>> {
    }

    // Progress Circle

    interface ProgressCircleProps {
        progress: number;
        style?: StyleProp<ViewStyle>;
        progressColor?: string;
        backgroundColor?: string;
        strokeWidth?: number;
        startAngle?: number;
        endAngle?: number;
        animate?: boolean;
        animateDuration?: number;
    }

    class ProgressCircle extends React.PureComponent<ProgressCircleProps> {
    }

    // Horizontal Line

    interface HorizontalLineProps {
        stroke: string;
    }

    // Point

    interface PointProps {
        x: (index: number) => number;
        y: (value: number) => number;
        value?: number;
        radius?: number;
        index?: number;
        color: string;
    }

    // Tooltip

    interface TooltipProps {
        x: (index: number) => number;
        y: (value: number) => number;
        value?: number;
        index?: number;
        height?: number;
        stroke?: string;
        text: string;
        pointStroke?: string;
    }

    namespace Decorators {
        class HorizontalLine extends React.Component<HorizontalLineProps> { }
        class Point extends React.Component<PointProps> { }
        class Tooltip extends React.Component<TooltipProps> { }
    }

    type GridDirection = 'VERTICAL' | 'HORIZONTAL' | 'BOTH';

    interface GridProps<T> {
        direction?: GridDirection;
        belowChart?: boolean;
        svg?: Partial<LineProps>;
        ticks?: T[];
        x?: (t: T) => number;
        y?: (t: T) => number;
    }

    //  as Component despite it's SFC.
    class Grid<T> extends React.Component<GridProps<T>> {
        static Direction: {
            VERTICAL: 'VERTICAL',
            HORIZONTAL: 'HORIZONTAL',
            BOTH: 'BOTH',
        };
    }

    interface AnimatedPathProps extends CommonPathProps {
        animated?: boolean;
        animationDuration?: number;
        renderPlaceholder?: () => any;
    }

    class Path extends React.Component<AnimatedPathProps> {
    }
}
