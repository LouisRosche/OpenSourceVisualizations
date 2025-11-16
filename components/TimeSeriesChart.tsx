'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { TimeSeriesPoint } from '@/lib/types';

interface TimeSeriesData {
  id: string;
  label: string;
  data: TimeSeriesPoint[];
  color?: string;
}

interface TimeSeriesChartProps {
  series: TimeSeriesData[];
  width?: number;
  height?: number;
  showConfidence?: boolean;
  showTrendLine?: boolean;
}

export default function TimeSeriesChart({
  series,
  width = 800,
  height = 400,
  showConfidence = true,
  showTrendLine = false,
}: TimeSeriesChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !series || series.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 40, right: 150, bottom: 60, left: 80 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Get all data points for domain calculation
    const allData = series.flatMap(s => s.data);
    const allDates = allData.map(d => d.timestamp);
    const allValues = allData.map(d => d.value);

    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(allDates) as [Date, Date])
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(allValues) || 100])
      .range([innerHeight, 0])
      .nice();

    // Color scale
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
      .domain(series.map(s => s.id));

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(
        d3.axisLeft(yScale)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      );

    // Line generator
    const line = d3.line<TimeSeriesPoint>()
      .x(d => xScale(d.timestamp))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Area generator for confidence intervals
    const area = d3.area<TimeSeriesPoint>()
      .x(d => xScale(d.timestamp))
      .y0(d => yScale(Math.max(0, d.value - (d.confidence || 0))))
      .y1(d => yScale(Math.min(100, d.value + (d.confidence || 0))))
      .curve(d3.curveMonotoneX);

    // Draw each series
    series.forEach((s, i) => {
      const color = s.color || colorScale(s.id);

      // Confidence interval
      if (showConfidence && s.data.some(d => d.confidence)) {
        g.append('path')
          .datum(s.data)
          .attr('fill', color)
          .attr('opacity', 0.2)
          .attr('d', area);
      }

      // Line
      g.append('path')
        .datum(s.data)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2)
        .attr('d', line);

      // Data points
      g.selectAll(`.point-${i}`)
        .data(s.data)
        .enter()
        .append('circle')
        .attr('class', `point-${i}`)
        .attr('cx', d => xScale(d.timestamp))
        .attr('cy', d => yScale(d.value))
        .attr('r', 4)
        .attr('fill', color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
          d3.select(this)
            .attr('r', 6)
            .attr('stroke-width', 2);

          const tooltip = d3.select(tooltipRef.current);
          tooltip
            .style('display', 'block')
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 10}px`)
            .html(`
              <strong>${s.label}</strong><br/>
              Date: ${d.timestamp.toLocaleDateString()}<br/>
              Value: ${d.value.toFixed(2)}<br/>
              ${d.confidence ? `±${d.confidence.toFixed(2)} (95% CI)` : ''}
            `);
        })
        .on('mouseout', function() {
          d3.select(this)
            .attr('r', 4)
            .attr('stroke-width', 1.5);

          d3.select(tooltipRef.current).style('display', 'none');
        });

      // Trend line (simple linear regression)
      if (showTrendLine && s.data.length > 1) {
        const xValues = s.data.map((d, i) => i);
        const yValues = s.data.map(d => d.value);

        const xMean = d3.mean(xValues) || 0;
        const yMean = d3.mean(yValues) || 0;

        let numerator = 0;
        let denominator = 0;

        for (let i = 0; i < xValues.length; i++) {
          numerator += (xValues[i] - xMean) * (yValues[i] - yMean);
          denominator += (xValues[i] - xMean) ** 2;
        }

        const slope = denominator === 0 ? 0 : numerator / denominator;
        const intercept = yMean - slope * xMean;

        const trendData = [
          { x: xScale(s.data[0].timestamp), y: yScale(intercept) },
          { x: xScale(s.data[s.data.length - 1].timestamp),
            y: yScale(intercept + slope * (s.data.length - 1)) }
        ];

        g.append('line')
          .attr('x1', trendData[0].x)
          .attr('y1', trendData[0].y)
          .attr('x2', trendData[1].x)
          .attr('y2', trendData[1].y)
          .attr('stroke', color)
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', '5,5')
          .attr('opacity', 0.6);
      }
    });

    // Add axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .style('font-size', '12px');

    g.append('g')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '12px');

    // Add axis labels
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 50)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Time');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -60)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Value');

    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - margin.right + 10},${margin.top})`);

    series.forEach((s, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0,${i * 25})`);

      legendRow.append('line')
        .attr('x1', 0)
        .attr('x2', 30)
        .attr('y1', 0)
        .attr('y2', 0)
        .attr('stroke', s.color || colorScale(s.id))
        .attr('stroke-width', 2);

      legendRow.append('text')
        .attr('x', 35)
        .attr('y', 5)
        .style('font-size', '12px')
        .text(s.label);
    });

  }, [series, width, height, showConfidence, showTrendLine]);

  return (
    <div className="relative">
      <svg ref={svgRef} className="w-full h-auto" />
      <div
        ref={tooltipRef}
        className="absolute hidden bg-white border border-gray-300 rounded px-3 py-2 text-sm shadow-lg pointer-events-none z-10"
        style={{ display: 'none' }}
      />
    </div>
  );
}
