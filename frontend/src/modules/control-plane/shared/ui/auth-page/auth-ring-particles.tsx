import React from 'react';

import css from './auth-page.module.scss';

type RingSpec = {
  count: number;
  radiusVmin: number;
  durationSec: number;
  reverse?: boolean;
  particlePx: number;
  orbitOpacity?: number;
};

const RINGS: RingSpec[] = [
  {
    count: 40,
    radiusVmin: 46,
    durationSec: 100,
    particlePx: 3,
    orbitOpacity: 0.14,
  },
  {
    count: 28,
    radiusVmin: 34,
    durationSec: 72,
    reverse: true,
    particlePx: 4,
    orbitOpacity: 0.18,
  },
  {
    count: 56,
    radiusVmin: 58,
    durationSec: 140,
    particlePx: 2,
    orbitOpacity: 0.1,
  },
];

export const AuthRingParticles = () => (
  <div className={css.ringBackdrop} aria-hidden>
    <div className={css.ringGlow} />
    {RINGS.map((ring, ri) => (
      <div
        key={ri}
        className={`${css.ringTrack} ${ring.reverse ? css.ringTrackReverse : ''}`}
        style={
          {
            '--ring-r': `${ring.radiusVmin}vmin`,
            '--ring-duration': `${ring.durationSec}s`,
            '--particle-size': `${ring.particlePx}px`,
            '--orbit-opacity': String(ring.orbitOpacity ?? 0.12),
          } as React.CSSProperties
        }
      >
        <div className={css.ringOrbit} />
        {Array.from({ length: ring.count }).map((_, i) => (
          <span
            key={i}
            className={css.ringParticle}
            style={
              {
                '--a': `${(360 / ring.count) * i}deg`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    ))}
  </div>
);
