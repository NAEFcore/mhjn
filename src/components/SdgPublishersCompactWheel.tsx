import React from 'react';

interface SdgPublishersCompactWheelProps {
  className?: string;
  size?: number;
}

export const SdgPublishersCompactWheel: React.FC<SdgPublishersCompactWheelProps> = ({
  className = '',
  size = 110,
}) => {
  // 17 SDG Colors
  const colors = [
    '#E5243B', // 1. No Poverty
    '#DDA63A', // 2. Zero Hunger
    '#4C9F38', // 3. Good Health
    '#C5192D', // 4. Quality Education
    '#FF3A21', // 5. Gender Equality
    '#26BDE2', // 6. Clean Water
    '#FCC30B', // 7. Affordable Energy
    '#A21942', // 8. Decent Work
    '#FD6925', // 9. Industry & Innovation
    '#DD1367', // 10. Reduced Inequalities
    '#FD9D24', // 11. Sustainable Cities
    '#BF8B2E', // 12. Responsible Consumption
    '#3F7E44', // 13. Climate Action
    '#0A97D9', // 14. Life Below Water
    '#56C02B', // 15. Life on Land
    '#00689D', // 16. Peace & Justice
    '#19486A', // 17. Partnerships
  ];

  const total = 17;
  const radius = 95;
  const innerRadius = 56;
  const cx = 100;
  const cy = 100;

  // Generate SVG arcs for the 17 segments
  const segments = colors.map((color, i) => {
    const angleStep = (2 * Math.PI) / total;
    const startAngle = i * angleStep - Math.PI / 2;
    const endAngle = (i + 1) * angleStep - Math.PI / 2 - 0.035; // gap between slices

    const x1 = cx + radius * Math.cos(startAngle);
    const y1 = cy + radius * Math.sin(startAngle);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);

    const x3 = cx + innerRadius * Math.cos(endAngle);
    const y3 = cy + innerRadius * Math.sin(endAngle);
    const x4 = cx + innerRadius * Math.cos(startAngle);
    const y4 = cy + innerRadius * Math.sin(startAngle);

    const pathData = `M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 0 0 ${x4} ${y4} Z`;

    return <path key={i} d={pathData} fill={color} />;
  });

  return (
    <div 
      className={`relative rounded-full overflow-hidden flex items-center justify-center select-none shrink-0 bg-transparent ${className}`}
      style={{ width: size, height: size }}
      title="UN SDG Publishers Compact - 대한민국 한국문화저널 협약"
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}
      >
        {/* Slices */}
        {segments}

        {/* Center White Circle */}
        <circle cx={cx} cy={cy} r={innerRadius - 1} fill="#ffffff" />

        {/* Typography in center */}
        <text
          x={cx}
          y={cy - 16}
          textAnchor="middle"
          fill="#111827"
          fontSize="17"
          fontWeight="900"
          fontFamily="sans-serif"
          letterSpacing="0.5"
        >
          SDG
        </text>
        <text
          x={cx}
          y={cy + 3}
          textAnchor="middle"
          fill="#111827"
          fontSize="11"
          fontWeight="900"
          fontFamily="sans-serif"
          letterSpacing="0.8"
        >
          PUBLISHERS
        </text>
        <text
          x={cx}
          y={cy + 20}
          textAnchor="middle"
          fill="#111827"
          fontSize="11"
          fontWeight="900"
          fontFamily="sans-serif"
          letterSpacing="0.8"
        >
          COMPACT
        </text>
      </svg>
    </div>
  );
};
