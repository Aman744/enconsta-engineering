export const BlueprintPatterns = {
  // SVG strings of engineering symbols
  valve: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2">
    <polygon points="10,25 90,75 90,25 10,75" />
    <line x1="50" y1="50" x2="50" y2="20" />
    <line x1="35" y1="20" x2="65" y2="20" />
  </svg>`,

  pump: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="50" cy="50" r="30" />
    <line x1="20" y1="50" x2="80" y2="50" />
    <polygon points="50,20 65,35 35,35" />
  </svg>`,

  flowArrow: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2">
    <line x1="10" y1="50" x2="90" y2="50" />
    <polygon points="70,35 90,50 70,65" />
  </svg>`,

  instrumentLoop: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="50" cy="50" r="30" />
    <line x1="50" y1="20" x2="50" y2="80" />
    <line x1="20" y1="50" x2="80" y2="50" />
    <text x="50" y="55" font-size="12" font-family="monospace" text-anchor="middle" fill="currentColor">PI</text>
  </svg>`,

  pipelineSegment: `<svg viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-dasharray="4,4" stroke-width="1.5">
    <line x1="0" y1="30" x2="100" y2="30" />
    <line x1="0" y1="70" x2="100" y2="70" />
    <circle cx="20" cy="50" r="6" />
    <circle cx="80" cy="50" r="6" />
  </svg>`
};
