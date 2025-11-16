'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { SkillMatrixEntry } from '@/lib/types';

interface SkillMatrixHeatmapProps {
  data: SkillMatrixEntry[];
  width?: number;
  height?: number;
  colorScheme?: 'sequential' | 'diverging';
  showConfidence?: boolean;
  onCellClick?: (userId: string, skillId: string) => void;
}

export default function SkillMatrixHeatmap({
  data,
  width = 1000,
  height = 600,
  colorScheme = 'sequential',
  showConfidence = false,
  onCellClick,
}: SkillMatrixHeatmapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [selectedCell, setSelectedCell] = useState<{ userId: string; skillId: string } | null>(null);

  useEffect(() => {
    if (!svgRef.current || !data || data.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    // Extract all unique skills
    const allSkills = new Map<string, string>();
    data.forEach(entry => {
      Object.entries(entry.skills).forEach(([skillId, skill]) => {
        if (!allSkills.has(skillId)) {
          allSkills.set(skillId, skill.name);
        }
      });
    });

    const skillIds = Array.from(allSkills.keys());
    const skillNames = Array.from(allSkills.values());

    // Margins and dimensions
    const margin = { top: 100, right: 50, bottom: 150, left: 200 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleBand()
      .domain(skillIds)
      .range([0, innerWidth])
      .padding(0.05);

    const yScale = d3.scaleBand()
      .domain(data.map(d => d.userId))
      .range([0, innerHeight])
      .padding(0.05);

    // Color scale
    const colorScale = colorScheme === 'sequential'
      ? d3.scaleSequential(d3.interpolateViridis)
          .domain([0, 100])
      : d3.scaleDiverging(d3.interpolateRdYlGn)
          .domain([0, 50, 100]);

    // Add cells
    data.forEach((entry, i) => {
      skillIds.forEach((skillId, j) => {
        const skill = entry.skills[skillId];
        const score = skill?.score ?? null;

        const cell = g.append('rect')
          .attr('x', xScale(skillId)!)
          .attr('y', yScale(entry.userId)!)
          .attr('width', xScale.bandwidth())
          .attr('height', yScale.bandwidth())
          .attr('fill', score !== null ? colorScale(score) : '#e0e0e0')
          .attr('stroke', '#fff')
          .attr('stroke-width', 1)
          .style('cursor', score !== null ? 'pointer' : 'default')
          .on('mouseover', function(event) {
            if (score === null) return;

            d3.select(this)
              .attr('stroke', '#000')
              .attr('stroke-width', 2);

            const tooltip = d3.select(tooltipRef.current);
            tooltip
              .style('display', 'block')
              .style('left', `${event.pageX + 10}px`)
              .style('top', `${event.pageY - 10}px`)
              .html(`
                <strong>${entry.userName}</strong><br/>
                <strong>${skill?.name || 'Unknown Skill'}</strong><br/>
                Score: ${score.toFixed(1)}<br/>
                ${showConfidence && skill?.confidence ? `Confidence: ${skill.confidence.toFixed(1)}%` : ''}
              `);
          })
          .on('mouseout', function() {
            d3.select(this)
              .attr('stroke', '#fff')
              .attr('stroke-width', 1);

            d3.select(tooltipRef.current).style('display', 'none');
          })
          .on('click', function() {
            if (score !== null) {
              setSelectedCell({ userId: entry.userId, skillId });
              onCellClick?.(entry.userId, skillId);
            }
          });

        // Add text for high-contrast scores
        if (score !== null) {
          g.append('text')
            .attr('x', xScale(skillId)! + xScale.bandwidth() / 2)
            .attr('y', yScale(entry.userId)! + yScale.bandwidth() / 2)
            .attr('dy', '0.35em')
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .attr('fill', score > 50 ? '#000' : '#fff')
            .attr('pointer-events', 'none')
            .text(score.toFixed(0));
        }
      });
    });

    // Add X axis
    const xAxis = d3.axisTop(xScale)
      .tickFormat((d, i) => skillNames[i]);

    g.append('g')
      .attr('class', 'x-axis')
      .call(xAxis)
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .attr('dx', '-0.8em')
      .attr('dy', '-0.5em')
      .style('font-size', '12px');

    // Add Y axis
    const yAxis = d3.axisLeft(yScale)
      .tickFormat((d) => {
        const entry = data.find(e => e.userId === d);
        return entry?.userName || d;
      });

    g.append('g')
      .attr('class', 'y-axis')
      .call(yAxis)
      .selectAll('text')
      .style('font-size', '12px');

    // Add color legend
    const legendWidth = 300;
    const legendHeight = 20;
    const legendMargin = 20;

    const legendScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, legendWidth]);

    const legendAxis = d3.axisBottom(legendScale)
      .ticks(5)
      .tickFormat(d => `${d}%`);

    const legend = svg.append('g')
      .attr('transform', `translate(${margin.left},${height - margin.bottom + legendMargin})`);

    // Create gradient
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'heatmap-gradient');

    const numStops = 10;
    for (let i = 0; i <= numStops; i++) {
      gradient.append('stop')
        .attr('offset', `${(i / numStops) * 100}%`)
        .attr('stop-color', colorScale((i / numStops) * 100));
    }

    legend.append('rect')
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#heatmap-gradient)')
      .attr('stroke', '#ccc');

    legend.append('g')
      .attr('transform', `translate(0,${legendHeight})`)
      .call(legendAxis);

    legend.append('text')
      .attr('x', legendWidth / 2)
      .attr('y', legendHeight + 40)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text('Skill Proficiency Level');

  }, [data, width, height, colorScheme, showConfidence, onCellClick]);

  return (
    <div className="relative">
      <svg ref={svgRef} className="w-full h-auto" />
      <div
        ref={tooltipRef}
        className="absolute hidden bg-white border border-gray-300 rounded px-3 py-2 text-sm shadow-lg pointer-events-none z-10"
        style={{ display: 'none' }}
      />
      {selectedCell && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Selected Cell Details</h3>
          <p className="text-sm">
            User ID: {selectedCell.userId}<br />
            Skill ID: {selectedCell.skillId}
          </p>
        </div>
      )}
    </div>
  );
}
