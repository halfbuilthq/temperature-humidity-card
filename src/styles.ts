import { css } from "lit";

export const cardStyles = css`
  :host {
    --comfort-accent: #55d5df;
    --comfort-accent-soft: color-mix(in srgb, var(--comfort-accent) 16%, transparent);
    --comfort-surface: color-mix(
      in srgb,
      var(--ha-card-background, var(--card-background-color, #141a21)) 94%,
      var(--comfort-accent) 6%
    );
    display: block;
    min-width: 0;
    height: 100%;
    container-type: inline-size;
  }

  :host([hidden]) {
    display: none;
  }

  * {
    box-sizing: border-box;
  }

  button {
    color: inherit;
    font: inherit;
  }

  ha-card {
    display: block;
    height: 100%;
    min-height: 0;
    overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--divider-color, #66717c) 44%, transparent);
    border-radius: var(--ha-card-border-radius, 22px);
    color: var(--primary-text-color, #f4f7fb);
    background:
      radial-gradient(
        circle at 78% 18%,
        color-mix(in srgb, var(--comfort-accent) 7%, transparent),
        transparent 48%
      ),
      linear-gradient(145deg, rgba(255, 255, 255, 0.025), transparent 36%),
      var(--comfort-surface);
    box-shadow:
      0 16px 36px rgba(0, 0, 0, 0.22),
      inset 0 1px 0 rgba(255, 255, 255, 0.035);
  }

  ha-card.cold {
    --comfort-accent: #60a9ff;
  }

  ha-card.warm {
    --comfort-accent: #f7a55f;
  }

  ha-card.dry {
    --comfort-accent: #aab9c7;
  }

  ha-card.humid,
  ha-card.mixed {
    --comfort-accent: #4fb9ff;
  }

  ha-card.unavailable {
    --comfort-accent: var(--error-color, #db5959);
  }

  .card {
    position: relative;
    display: grid;
    min-width: 0;
    min-height: clamp(240px, calc(100cqw + 64px), 318px);
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto minmax(0, 1fr) auto;
    padding: 16px 16px 13px;
  }

  .header,
  .room,
  .status,
  .battery-warning,
  .humidity,
  .range {
    display: flex;
    align-items: center;
  }

  .header {
    min-width: 0;
    justify-content: space-between;
    gap: 10px;
  }

  .room {
    min-width: 0;
    gap: 9px;
    padding: 4px 2px;
    border: 0;
    text-align: left;
    background: transparent;
    cursor: pointer;
  }

  .room ha-icon {
    width: 23px;
    height: 23px;
    flex: 0 0 auto;
    color: color-mix(in srgb, var(--primary-text-color, #f4f7fb) 72%, transparent);
  }

  h1 {
    min-width: 0;
    margin: 0;
    overflow: hidden;
    font-size: 16px;
    font-weight: 650;
    letter-spacing: -0.2px;
    line-height: 1.2;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .status {
    flex: 0 0 auto;
    gap: 5px;
    min-height: 28px;
    padding: 0 9px;
    border: 1px solid color-mix(in srgb, var(--comfort-accent) 34%, transparent);
    border-radius: 999px;
    color: var(--comfort-accent);
    background: var(--comfort-accent-soft);
    font-size: 11px;
    font-weight: 700;
  }

  .status svg {
    width: 14px;
    height: 14px;
    flex: 0 0 auto;
    fill: currentColor;
  }

  .battery-warning {
    position: absolute;
    top: 50px;
    right: 16px;
    z-index: 2;
    gap: 5px;
    padding: 0;
    border: 0;
    color: var(--warning-color, #ff9f2f);
    background: transparent;
    font-size: 10px;
    font-weight: 700;
    cursor: pointer;
  }

  .battery-warning svg {
    width: 16px;
    height: 16px;
    fill: currentColor;
  }

  .dial {
    position: relative;
    display: grid;
    width: min(100%, 254px);
    min-width: 0;
    aspect-ratio: 254 / 226;
    place-self: center;
    place-items: center;
    container-type: inline-size;
  }

  .gauge {
    position: absolute;
    top: 2px;
    left: 50%;
    width: 100%;
    height: auto;
    overflow: visible;
    transform: translateX(-50%);
  }

  .gauge-track,
  .gauge-value {
    fill: none;
    stroke-width: 5.5;
    vector-effect: non-scaling-stroke;
  }

  .gauge-track {
    stroke: color-mix(in srgb, var(--secondary-text-color, #a8b2bd) 46%, transparent);
  }

  .gauge-value {
    stroke: var(--comfort-accent);
    stroke-dasharray: var(--gauge-progress, 0) 100;
    stroke-linecap: round;
    transition: stroke-dasharray 500ms ease;
  }

  .gauge-tick {
    stroke: color-mix(in srgb, var(--secondary-text-color, #a8b2bd) 50%, transparent);
    stroke-width: 1.2;
    vector-effect: non-scaling-stroke;
  }

  .gauge-marker {
    fill: var(--primary-text-color, #f4f7fb);
    stroke: color-mix(in srgb, var(--primary-text-color, #f4f7fb) 24%, transparent);
    stroke-width: 5;
  }

  .metrics {
    position: relative;
    z-index: 1;
    display: flex;
    margin-top: 14cqw;
    flex-direction: column;
    align-items: center;
  }

  .metrics.temperature-only {
    margin-top: 0;
  }

  .temperature,
  .humidity {
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
  }

  .temperature {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--primary-text-color, #f4f7fb);
    font-size: clamp(24px, 24cqw, 62px);
    font-weight: 480;
    letter-spacing: -2.6px;
    line-height: 0.98;
  }

  .temperature small {
    margin-top: 1.6cqw;
    color: var(--secondary-text-color, #a8b2bd);
    font-size: clamp(10px, 6cqw, 15px);
    font-weight: 550;
    letter-spacing: -0.2px;
  }

  .humidity {
    gap: 5px;
    margin-top: 3.5cqw;
    color: var(--primary-text-color, #f4f7fb);
  }

  .humidity svg {
    width: clamp(14px, 8cqw, 20px);
    height: clamp(14px, 8cqw, 20px);
    fill: #58b9ff;
  }

  .humidity strong {
    font-size: clamp(14px, 8cqw, 20px);
    font-weight: 580;
    letter-spacing: -0.5px;
  }

  .humidity-label {
    margin-top: 3px;
    color: var(--secondary-text-color, #a8b2bd);
    font-size: 11px;
    line-height: 1;
  }

  .history {
    display: grid;
    min-width: 0;
    grid-template-columns: minmax(44px, auto) minmax(0, 1fr) minmax(44px, auto);
    gap: 8px;
    align-items: end;
    min-height: 50px;
    margin-top: 2px;
  }

  .range {
    flex-direction: column;
    align-items: flex-start;
    color: var(--secondary-text-color, #a8b2bd);
    font-size: 10px;
    line-height: 1.18;
  }

  .range.max {
    align-items: flex-end;
    text-align: right;
  }

  .range strong {
    margin-top: 2px;
    color: var(--primary-text-color, #f4f7fb);
    font-size: 13px;
    font-weight: 560;
  }

  .sparkline-wrap {
    position: relative;
    min-width: 0;
    height: 34px;
    border-radius: 6px;
    outline: none;
    touch-action: pan-y;
    user-select: none;
  }

  .sparkline-wrap:focus-visible {
    outline: 2px solid var(--comfort-accent);
    outline-offset: 3px;
  }

  .sparkline {
    display: block;
    width: 100%;
    height: 34px;
    overflow: visible;
    pointer-events: none;
  }

  .sparkline-baseline {
    stroke: color-mix(in srgb, var(--secondary-text-color, #a8b2bd) 16%, transparent);
    stroke-width: 1;
    vector-effect: non-scaling-stroke;
  }

  .sparkline-path {
    fill: none;
    stroke: var(--comfort-accent);
    stroke-linecap: round;
    stroke-linejoin: round;
    stroke-width: 1.8;
    vector-effect: non-scaling-stroke;
  }

  .inspection-line {
    stroke: var(--primary-text-color, #f4f7fb);
    stroke-dasharray: 2 3;
    stroke-opacity: 0.44;
    stroke-width: 1;
    vector-effect: non-scaling-stroke;
  }

  .inspection-dot {
    fill: var(--comfort-accent);
    stroke: var(--ha-card-background, var(--card-background-color, #141a21));
    stroke-width: 1.8;
    vector-effect: non-scaling-stroke;
  }

  .chart-tooltip {
    position: absolute;
    bottom: calc(100% + 9px);
    z-index: 4;
    width: 174px;
    padding: 9px 10px;
    border: 1px solid
      color-mix(in srgb, var(--primary-text-color, #f4f7fb) 14%, transparent);
    border-radius: 10px;
    color: var(--primary-text-color, #f4f7fb);
    background: color-mix(
      in srgb,
      var(--ha-card-background, var(--card-background-color, #141a21)) 95%,
      transparent
    );
    box-shadow: 0 7px 22px rgba(0, 0, 0, 0.25);
    pointer-events: none;
    backdrop-filter: blur(8px);
  }

  .chart-tooltip.place-right {
    margin-left: 10px;
  }

  .chart-tooltip.place-left {
    margin-left: -10px;
    transform: translateX(-100%);
  }

  .chart-tooltip time {
    display: block;
    margin-bottom: 5px;
    color: var(--secondary-text-color, #a8b2bd);
    font-size: 10px;
    font-weight: 700;
  }

  .tooltip-item {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 9px;
    font-size: 11px;
  }

  .tooltip-item + .tooltip-item {
    margin-top: 4px;
  }

  .tooltip-item span {
    display: flex;
    align-items: center;
    gap: 6px;
    font-weight: 700;
  }

  .tooltip-item i {
    width: 7px;
    height: 7px;
    flex: 0 0 auto;
    border-radius: 50%;
    background: currentColor;
  }

  .tooltip-item.temperature-series {
    color: var(--comfort-accent);
  }

  .tooltip-item.humidity-series {
    color: #58b9ff;
  }

  .tooltip-item strong {
    color: var(--primary-text-color, #f4f7fb);
    font-size: 11px;
    white-space: nowrap;
  }

  .history-placeholder {
    grid-column: 1 / -1;
    align-self: center;
    color: var(--secondary-text-color, #a8b2bd);
    font-size: 11px;
    text-align: center;
  }

  button:focus-visible {
    border-radius: 8px;
    outline: 2px solid var(--comfort-accent);
    outline-offset: 3px;
  }

  @container (max-width: 230px) {
    .card {
      padding-inline: 13px;
    }

    .header {
      flex-wrap: wrap;
      gap: 4px;
    }

    .room {
      max-width: 100%;
    }

    .history {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6px;
    }

    .sparkline-wrap {
      grid-column: 1 / -1;
      grid-row: 1;
    }

    .range {
      grid-row: 2;
    }

    .battery-warning {
      position: static;
      justify-self: end;
      margin-top: 4px;
    }
  }

  @container (max-width: 419px) {
    .chart-tooltip.place-left,
    .chart-tooltip.place-right {
      left: 50% !important;
      width: min(174px, calc(100cqw - 28px));
      margin-left: 0;
      transform: translateX(-50%);
    }
  }

  @container (min-width: 420px) {
    ha-card,
    .card {
      min-height: 344px;
    }

    .card {
      padding: 20px 22px 16px;
    }

    h1 {
      font-size: 18px;
    }

    .dial {
      width: min(100%, 270px);
      aspect-ratio: 270 / 232;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .gauge-value {
      transition: none;
    }
  }
`;
