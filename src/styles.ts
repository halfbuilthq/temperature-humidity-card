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
    min-height: 318px;
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
    min-height: 318px;
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
    min-height: 226px;
    place-items: center;
  }

  .gauge {
    position: absolute;
    top: 2px;
    left: 50%;
    width: 254px;
    height: 205px;
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
    margin-top: 35px;
    flex-direction: column;
    align-items: center;
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
    font-size: clamp(54px, 24cqw, 62px);
    font-weight: 480;
    letter-spacing: -2.6px;
    line-height: 0.98;
  }

  .temperature small {
    margin-top: 4px;
    color: var(--secondary-text-color, #a8b2bd);
    font-size: 15px;
    font-weight: 550;
    letter-spacing: -0.2px;
  }

  .humidity {
    gap: 5px;
    margin-top: 9px;
    color: var(--primary-text-color, #f4f7fb);
  }

  .humidity svg {
    width: 20px;
    height: 20px;
    fill: #58b9ff;
  }

  .humidity strong {
    font-size: 20px;
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
    grid-template-columns: minmax(44px, auto) minmax(70px, 1fr) minmax(44px, auto);
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

  .sparkline-button {
    min-width: 0;
    padding: 0;
    border: 0;
    background: transparent;
    cursor: pointer;
  }

  .sparkline {
    display: block;
    width: 100%;
    height: 34px;
    overflow: visible;
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

    .status {
      max-width: 76px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .gauge {
      width: 238px;
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
      min-height: 232px;
    }

    .gauge {
      width: 270px;
      height: 212px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .gauge-value {
      transition: none;
    }
  }
`;
