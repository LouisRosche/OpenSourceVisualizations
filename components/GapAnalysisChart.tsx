'use client';

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { GapAnalysis } from '@/lib/types';

interface GapAnalysisChartProps {
  data: GapAnalysis[];
  width?: number;
  height?: number;
  onGapClick?: (gap: GapAnalysis) => void;
}

export default function GapAnalysisChart({
  data,
  width = 800,
  height = 500,
  onGapClick,
}: GapAnalysisChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 40, right: 150, bottom: 100, left: 200 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Sort by gap size (descending)
    const sortedData = [...data].sort((a, b) => b.gap - a.gap);

    // Scales
    const yScale = d3.scaleBand()
      .domain(sortedData.map(d => d.skillName))
      .range([0, innerHeight])
      .padding(0.2);

    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, innerWidth]);

    // Color scale for priority
    const priorityColors = {
      high: '#ef4444',
      medium: '#f59e0b',
      low: '#10b981'
    };

    // Add background grid
    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.1)
      .call(
        d3.axisBottom(xScale)
          .tickSize(innerHeight)
          .tickFormat(() => '')
      );

    // Draw current level bars
    g.selectAll('.bar-current')
      .data(sortedData)
      .enter()
      .append('rect')
      .attr('class', 'bar-current')
      .attr('x', 0)
      .attr('y', d => yScale(d.skillName)!)
      .attr('width', d => xScale(d.currentLevel))
      .attr('height', yScale.bandwidth())
      .attr('fill', '#60a5fa')
      .attr('opacity', 0.6);

    // Draw target level bars (outline)
    g.selectAll('.bar-target')
      .data(sortedData)
      .enter()
      .append('rect')
      .attr('class', 'bar-target')
      .attr('x', 0)
      .attr('y', d => yScale(d.skillName)!)
      .attr('width', d => xScale(d.targetLevel))
      .attr('height', yScale.bandwidth())
      .attr('fill', 'none')
      .attr('stroke', '#1e40af')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,4');

    // Draw gap indicators
    g.selectAll('.gap-indicator')
      .data(sortedData)
      .enter()
      .append('rect')
      .attr('class', 'gap-indicator')
      .attr('x', d => xScale(d.currentLevel))
      .attr('y', d => yScale(d.skillName)!)
      .attr('width', d => xScale(d.gap))
      .attr('height', yScale.bandwidth())
      .attr('fill', d => priorityColors[d.priority])
      .attr('opacity', 0.4)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .attr('opacity', 0.7)
          .attr('stroke', '#000')
          .attr('stroke-width', 2);

        const tooltip = d3.select(tooltipRef.current);
        tooltip
          .style('display', 'block')
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 10}px`)
          .html(`
            <strong>${d.skillName}</strong><br/>
            Category: ${d.category}<br/>
            Current: ${d.currentLevel.toFixed(1)}<br/>
            Target: ${d.targetLevel.toFixed(1)}<br/>
            Gap: ${d.gap.toFixed(1)}<br/>
            Priority: <span style="color: ${priorityColors[d.priority]}">${d.priority.toUpperCase()}</span>
          `);
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('opacity', 0.4)
          .attr('stroke', 'none');

        d3.select(tooltipRef.current).style('display', 'none');
      })
      .on('click', function(event, d) {
        onGapClick?.(d);
      });

    // Add value labels
    g.selectAll('.label-current')
      .data(sortedData)
      .enter()
      .append('text')
      .attr('class', 'label-current')
      .attr('x', d => xScale(d.currentLevel) - 5)
      .attr('y', d => yScale(d.skillName)! + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'end')
      .style('font-size', '11px')
      .style('font-weight', 'bold')
      .attr('fill', '#1e40af')
      .text(d => d.currentLevel.toFixed(0));

    // Add axes
    const xAxis = d3.axisBottom(xScale)
      .ticks(10)
      .tickFormat(d => `${d}%`);

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
      .attr('y', innerHeight + 45)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .text('Proficiency Level (%)');

    // Add title
    svg.append('text')
      .attr('x', width / 2)
      .attr('y', 20)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text('Competency Gap Analysis');

    // Add legend
    const legend = svg.append('g')
      .attr('transform', `translate(${width - margin.right + 10},${margin.top})`);

    const legendData = [
      { label: 'Current Level', color: '#60a5fa', type: 'solid' },
      { label: 'Target Level', color: '#1e40af', type: 'dashed' },
      { label: 'High Priority', color: priorityColors.high, type: 'solid' },
      { label: 'Medium Priority', color: priorityColors.medium, type: 'solid' },
      { label: 'Low Priority', color: priorityColors.low, type: 'solid' },
    ];

    legendData.forEach((item, i) => {
      const legendRow = legend.append('g')
        .attr('transform', `translate(0,${i * 25})`);

      if (item.type === 'dashed') {
        legendRow.append('rect')
          .attr('width', 30)
          .attr('height', 4)
          .attr('y', -2)
          .attr('fill', 'none')
          .attr('stroke', item.color)
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', '4,4');
      } else {
        legendRow.append('rect')
          .attr('width', 30)
          .attr('height', 12)
          .attr('y', -6)
          .attr('fill', item.color)
          .attr('opacity', 0.6);
      }

      legendRow.append('text')
        .attr('x', 35)
        .attr('y', 5)
        .style('font-size', '12px')
        .text(item.label);
    });

  }, [data, width, height, onGapClick]);

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
