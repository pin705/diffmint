import { siteConfig } from '@/lib/site';

const BRAND = {
  background: '#09111f',
  panel: '#0f172a',
  border: 'rgba(148, 163, 184, 0.16)',
  foreground: '#f8fafc',
  muted: '#94a3b8',
  accent: '#5eead4'
} as const;

function TerminalMark({ size = 120 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox='0 0 120 120'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <rect x='8' y='8' width='104' height='104' rx='28' fill={BRAND.background} />
      <rect
        x='8'
        y='8'
        width='104'
        height='104'
        rx='28'
        stroke='rgba(148, 163, 184, 0.18)'
        strokeWidth='2'
      />
      <path
        d='M38 42L55 60L38 78'
        stroke={BRAND.foreground}
        strokeWidth='10'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <path
        d='M82 42L65 60L82 78'
        stroke={BRAND.muted}
        strokeWidth='10'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
      <rect x='50' y='82' width='28' height='10' rx='5' fill={BRAND.accent} />
    </svg>
  );
}

function BrowserDots() {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {[BRAND.foreground, '#f59e0b', BRAND.accent].map((color) => (
        <span
          key={color}
          style={{
            display: 'flex',
            width: 12,
            height: 12,
            borderRadius: 999,
            background: color,
            opacity: 0.9
          }}
        />
      ))}
    </div>
  );
}

export function renderBrandIcon(size: number) {
  return (
    <div
      style={{
        display: 'flex',
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent'
      }}
    >
      <TerminalMark size={size} />
    </div>
  );
}

export function renderMarketingImage(options?: { compact?: boolean }) {
  const compact = options?.compact ?? false;
  const headingSize = compact ? 76 : 88;
  const bodySize = compact ? 26 : 28;

  return (
    <div
      style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        padding: compact ? '52px 56px' : '52px',
        background:
          'radial-gradient(circle at top left, rgba(94, 234, 212, 0.16), transparent 34%), radial-gradient(circle at bottom right, rgba(148, 163, 184, 0.16), transparent 30%), linear-gradient(180deg, #020617 0%, #09111f 100%)',
        color: BRAND.foreground,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
      }}
    >
      <div
        style={{
          display: 'flex',
          width: '100%',
          border: `1px solid ${BRAND.border}`,
          borderRadius: 40,
          overflow: 'hidden',
          background: 'rgba(9, 17, 31, 0.72)',
          boxShadow: '0 24px 80px rgba(2, 6, 23, 0.52)'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            flex: 1.05,
            padding: '48px 44px'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
            <div
              style={{
                display: 'flex',
                alignSelf: 'flex-start',
                alignItems: 'center',
                gap: 16,
                padding: '10px 18px',
                borderRadius: 999,
                border: `1px solid ${BRAND.border}`,
                background: 'rgba(15, 23, 42, 0.88)',
                fontSize: 20
              }}
            >
              <TerminalMark size={40} />
              <span>CLI + VS Code are the primary experience</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  fontSize: headingSize,
                  lineHeight: 1.04,
                  letterSpacing: '-0.06em',
                  fontWeight: 700
                }}
              >
                Catch risky diffs before the PR.
              </div>
              <div
                style={{
                  display: 'flex',
                  maxWidth: 720,
                  fontSize: bodySize,
                  lineHeight: 1.45,
                  color: BRAND.muted
                }}
              >
                {siteConfig.name} keeps review close to git, then layers in policy versions,
                provider controls, synced history, billing, and audit from the web control plane.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap' }}>
            {['Local-first by default', 'Policy-driven review', 'History + audit ready'].map(
              (item) => (
                <div
                  key={item}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 18px',
                    borderRadius: 999,
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: `1px solid ${BRAND.border}`,
                    fontSize: 20
                  }}
                >
                  <span
                    style={{
                      display: 'flex',
                      width: 10,
                      height: 10,
                      borderRadius: 999,
                      background: BRAND.accent
                    }}
                  />
                  <span>{item}</span>
                </div>
              )
            )}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            flex: compact ? 0.88 : 0.95,
            padding: '28px 28px 28px 0',
            alignItems: 'center'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              height: '100%',
              borderRadius: 32,
              overflow: 'hidden',
              background: BRAND.panel,
              border: `1px solid ${BRAND.border}`
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '18px 22px',
                borderBottom: `1px solid ${BRAND.border}`,
                fontSize: 18
              }}
            >
              <BrowserDots />
              <div
                style={{
                  display: 'flex',
                  color: BRAND.muted,
                  fontFamily: 'ui-monospace, SFMono-Regular, monospace'
                }}
              >
                dm review --base origin/main
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
                padding: '24px 24px 28px',
                fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                fontSize: 20,
                color: BRAND.foreground
              }}
            >
              {[
                '$ dm auth login',
                '$ dm review --base origin/main',
                'Summary  •  3 findings  •  1 policy note  •  1 missing test'
              ].map((line) => (
                <div
                  key={line}
                  style={{ display: 'flex', opacity: line.startsWith('Summary') ? 1 : 0.94 }}
                >
                  {line}
                </div>
              ))}

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  marginTop: 8
                }}
              >
                {[
                  [
                    'src/auth/session.ts',
                    'High',
                    'Device session TTL never refreshes on active clients'
                  ],
                  ['src/api/reviews.ts', 'Medium', 'Redaction runs after sync payload assembly'],
                  [
                    'src/app/page.tsx',
                    'Policy',
                    'Changelog entry required for user-facing copy update'
                  ]
                ].map(([file, level, message], index) => (
                  <div
                    key={file}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                      padding: '16px 18px',
                      borderRadius: 22,
                      border: `1px solid ${BRAND.border}`,
                      background: index === 0 ? 'rgba(94, 234, 212, 0.08)' : 'rgba(15, 23, 42, 0.8)'
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span>{file}</span>
                      <span
                        style={{
                          color:
                            level === 'High'
                              ? '#fca5a5'
                              : level === 'Medium'
                                ? '#fcd34d'
                                : BRAND.accent
                        }}
                      >
                        {level}
                      </span>
                    </div>
                    <span style={{ color: BRAND.muted, lineHeight: 1.4 }}>{message}</span>
                  </div>
                ))}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 'auto',
                  color: BRAND.muted,
                  fontSize: 18
                }}
              >
                <span>policy: secure-web-v12</span>
                <span>sync: workspace/diffmint-prod</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
