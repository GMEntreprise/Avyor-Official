import { useId } from 'react';

/**
 * Three dimensional icons for the three verbs of the product.
 *
 * They share one material and one light, coming from the top left, so they
 * read as a family: a lit face, a darker extruded side for thickness, a
 * specular sheen, and a soft floor shadow. Shadows are gradients rather than
 * blur filters, which keeps them crisp at any size and cheap to paint.
 *
 * Gradient ids go through useId, so the icons stay correct if one of them is
 * ever rendered twice on a page.
 */
const useIds = () => {
  const base = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  return (name: string) => `${base}-${name}`;
};

export function DiscoverIcon({ size = 96 }: { size?: number }) {
  const id = useIds();
  const at = (angle: number, radius: number) => {
    const a = ((angle - 90) * Math.PI) / 180;
    return [60 + Math.cos(a) * radius, 56 + Math.sin(a) * radius] as const;
  };
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={id('floor')} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#010208" stopOpacity="0.9" />
          <stop offset="0.55" stopColor="#010208" stopOpacity="0.35" />
          <stop offset="1" stopColor="#010208" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('ring')} x1="0.15" y1="0.1" x2="0.85" y2="0.95">
          <stop offset="0" stopColor="#d7cbff" />
          <stop offset="0.42" stopColor="#8f72ff" />
          <stop offset="1" stopColor="#4a2fcf" />
        </linearGradient>
        <linearGradient id={id('side')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a26a3" />
          <stop offset="1" stopColor="#1c1463" />
        </linearGradient>
        <radialGradient id={id('face')} cx="40%" cy="34%" r="72%">
          <stop offset="0" stopColor="#2f3563" />
          <stop offset="0.6" stopColor="#161b38" />
          <stop offset="1" stopColor="#0a0e22" />
        </radialGradient>
        <linearGradient id={id('rim')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id('northLit')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#b9a8ff" />
        </linearGradient>
        <linearGradient id={id('northShade')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a893ff" />
          <stop offset="1" stopColor="#5b3ee6" />
        </linearGradient>
        <linearGradient id={id('southLit')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#86a6ff" />
          <stop offset="1" stopColor="#3f58d8" />
        </linearGradient>
        <linearGradient id={id('southShade')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4d6bf0" />
          <stop offset="1" stopColor="#23308f" />
        </linearGradient>
        <radialGradient id={id('pin')} cx="35%" cy="30%" r="70%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.45" stopColor="#cdbfff" />
          <stop offset="1" stopColor="#5a3be0" />
        </radialGradient>
        <linearGradient id={id('gloss')} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.32" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id('wall')} x1="0.2" y1="0.1" x2="0.8" y2="0.9">
          <stop offset="0" stopColor="#05041a" />
          <stop offset="0.55" stopColor="#2a1f7a" />
          <stop offset="1" stopColor="#c8baff" />
        </linearGradient>
        <clipPath id={id('faceClip')}>
          <circle cx="60" cy="56" r="29" />
        </clipPath>
      </defs>

      <ellipse cx="60" cy="104" rx="36" ry="7.5" fill={`url(#${id('floor')})`} />
      {/* Bezel: the darker copy below is its thickness. */}
      <circle cx="60" cy="61" r="40" fill={`url(#${id('side')})`} />
      <circle cx="60" cy="56" r="40" fill={`url(#${id('ring')})`} />
      <circle
        cx="60"
        cy="56"
        r="39.3"
        fill="none"
        stroke={`url(#${id('rim')})`}
        strokeWidth="1.4"
      />
      {/* Dial, sunk into the bezel. */}
      <circle cx="60" cy="56" r="31.6" fill={`url(#${id('wall')})`} />
      <circle cx="60" cy="56" r="29" fill={`url(#${id('face')})`} />
      <circle
        cx="60"
        cy="56"
        r="29"
        fill="none"
        stroke="#04061a"
        strokeOpacity="0.7"
        strokeWidth="2.4"
      />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const major = angle % 90 === 0;
        const [x1, y1] = at(angle, major ? 22 : 24);
        const [x2, y2] = at(angle, 26.5);
        return (
          <line
            key={angle}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#c4b5fd"
            strokeOpacity={major ? 0.85 : 0.35}
            strokeWidth={major ? 2.2 : 1.3}
            strokeLinecap="round"
          />
        );
      })}
      {/* Needle: each half split into a lit and a shaded facet. */}
      <g transform="rotate(38 60 56)">
        <polygon points="60,33 60,56 54.5,56" fill={`url(#${id('northLit')})`} />
        <polygon points="60,33 65.5,56 60,56" fill={`url(#${id('northShade')})`} />
        <polygon points="60,79 54.5,56 60,56" fill={`url(#${id('southLit')})`} />
        <polygon points="60,79 60,56 65.5,56" fill={`url(#${id('southShade')})`} />
      </g>
      <circle cx="60" cy="57.4" r="5" fill="#0b0826" opacity="0.55" />
      <circle cx="60" cy="56" r="4.6" fill={`url(#${id('pin')})`} />
      <circle cx="58.4" cy="54.4" r="1.3" fill="#ffffff" opacity="0.9" />
      {/* Glass over the dial. */}
      <g clipPath={`url(#${id('faceClip')})`}>
        <ellipse
          cx="50"
          cy="40"
          rx="30"
          ry="15"
          transform="rotate(-32 50 40)"
          fill={`url(#${id('gloss')})`}
        />
      </g>
    </svg>
  );
}

export function CreateIcon({ size = 96 }: { size?: number }) {
  const id = useIds();
  const stripes = [0, 1, 2, 3, 4, 5, 6, 7];
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={id('floor')} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#010208" stopOpacity="0.9" />
          <stop offset="0.55" stopColor="#010208" stopOpacity="0.35" />
          <stop offset="1" stopColor="#010208" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('body')} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#353b70" />
          <stop offset="0.55" stopColor="#1d2247" />
          <stop offset="1" stopColor="#11152f" />
        </linearGradient>
        <linearGradient id={id('side')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0f1330" />
          <stop offset="1" stopColor="#070918" />
        </linearGradient>
        <linearGradient id={id('rim')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="0.35" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id('violet')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#b3a0ff" />
          <stop offset="1" stopColor="#5f3fe6" />
        </linearGradient>
        <linearGradient id={id('pale')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#cdc2ff" />
        </linearGradient>
        <linearGradient id={id('armSide')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a1c86" />
          <stop offset="1" stopColor="#170f55" />
        </linearGradient>
        <linearGradient id={id('play')} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#e4dcff" />
          <stop offset="0.5" stopColor="#9a80ff" />
          <stop offset="1" stopColor="#5a3be0" />
        </linearGradient>
        <radialGradient id={id('hinge')} cx="35%" cy="30%" r="70%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#b3a0ff" />
          <stop offset="1" stopColor="#3a26a3" />
        </radialGradient>
        <clipPath id={id('bodyFace')}>
          <rect x="18" y="59" width="84" height="38" rx="9" />
        </clipPath>
        <linearGradient id={id('sheen')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.11" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={id('band')}>
          <rect x="18" y="47" width="84" height="12" rx="3" />
        </clipPath>
        <clipPath id={id('arm')}>
          <rect x="18" y="30" width="86" height="12" rx="3" />
        </clipPath>
      </defs>

      <ellipse cx="60" cy="106" rx="40" ry="7.5" fill={`url(#${id('floor')})`} />
      {/* Body and its thickness. */}
      <rect x="18" y="51" width="84" height="50" rx="10" fill={`url(#${id('side')})`} />
      <rect x="18" y="47" width="84" height="50" rx="10" fill={`url(#${id('body')})`} />
      <rect
        x="18.6"
        y="47.6"
        width="82.8"
        height="48.8"
        rx="9.5"
        fill="none"
        stroke={`url(#${id('rim')})`}
        strokeWidth="1.2"
      />
      {/* Striped band fixed to the body. */}
      <g clipPath={`url(#${id('band')})`}>
        <rect x="18" y="47" width="84" height="12" fill={`url(#${id('pale')})`} />
        {stripes.map((i) => (
          <polygon
            key={i}
            points={`${14 + i * 14},59 ${21 + i * 14},47 ${28 + i * 14},47 ${21 + i * 14},59`}
            fill={`url(#${id('violet')})`}
          />
        ))}
      </g>
      {/* Clapper arm, open: the same stripes, lifted from the hinge. */}
      <g transform="rotate(-17 22 44)">
        <rect x="18" y="33" width="86" height="12" rx="3" fill={`url(#${id('armSide')})`} />
        <g clipPath={`url(#${id('arm')})`}>
          <rect x="18" y="30" width="86" height="12" fill={`url(#${id('pale')})`} />
          {stripes.map((i) => (
            <polygon
              key={i}
              points={`${14 + i * 14},42 ${21 + i * 14},30 ${28 + i * 14},30 ${21 + i * 14},42`}
              fill={`url(#${id('violet')})`}
            />
          ))}
        </g>
        <rect x="18" y="30" width="86" height="4" rx="2" fill="#ffffff" opacity="0.28" />
      </g>
      <circle cx="22" cy="45" r="4.2" fill={`url(#${id('hinge')})`} />
      <g clipPath={`url(#${id('bodyFace')})`}>
        <polygon points="14,59 44,59 26,99 -4,99" fill={`url(#${id('sheen')})`} />
      </g>
      {/* Play button, raised off the board. */}
      <path
        d="M52 67 Q52 63.5 55.2 65.2 L72.5 74.6 Q75.5 76.2 72.5 77.8 L55.2 87.2 Q52 88.9 52 85.4 Z"
        fill="#070918"
        opacity="0.6"
        transform="translate(0 2.6)"
      />
      <path
        d="M52 67 Q52 63.5 55.2 65.2 L72.5 74.6 Q75.5 76.2 72.5 77.8 L55.2 87.2 Q52 88.9 52 85.4 Z"
        fill={`url(#${id('play')})`}
      />
      <path
        d="M54 68.4 Q54 66.4 55.8 67.4 L63 71.3"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.7"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function CollaborateIcon({ size = 96 }: { size?: number }) {
  const id = useIds();
  // A bubble is a rounded body and a tail; the side copy gives it thickness.
  const back =
    'M28 20 H66 Q78 20 78 32 V52 Q78 64 66 64 H34 L24 74 L25.5 64 Q16 62.5 16 52 V32 Q16 20 28 20 Z';
  const front =
    'M56 42 H96 Q108 42 108 54 V74 Q108 85.5 97 86 L99.5 96 L88 86 H56 Q44 86 44 74 V54 Q44 42 56 42 Z';
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={id('floor')} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#010208" stopOpacity="0.9" />
          <stop offset="0.55" stopColor="#010208" stopOpacity="0.35" />
          <stop offset="1" stopColor="#010208" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('blue')} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#9bb3ff" />
          <stop offset="0.5" stopColor="#5a7cf5" />
          <stop offset="1" stopColor="#2f40c4" />
        </linearGradient>
        <linearGradient id={id('blueSide')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#23308f" />
          <stop offset="1" stopColor="#141c5c" />
        </linearGradient>
        <linearGradient id={id('violet')} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#d6caff" />
          <stop offset="0.45" stopColor="#9277ff" />
          <stop offset="1" stopColor="#5634dd" />
        </linearGradient>
        <linearGradient id={id('violetSide')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a24a8" />
          <stop offset="1" stopColor="#1d1266" />
        </linearGradient>
        <linearGradient id={id('rim')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="0.3" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={id('dot')} cx="35%" cy="30%" r="70%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dcd3ff" />
        </radialGradient>
        <linearGradient id={id('gloss')} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.38" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <ellipse cx="62" cy="106" rx="42" ry="7.5" fill={`url(#${id('floor')})`} />
      {/* Back bubble: the other side of the conversation. */}
      <path d={back} fill={`url(#${id('blueSide')})`} transform="translate(0 4.5)" />
      <path d={back} fill={`url(#${id('blue')})`} />
      <path d={back} fill="none" stroke={`url(#${id('rim')})`} strokeWidth="1.3" />
      <rect x="26" y="33" width="30" height="5" rx="2.5" fill="#ffffff" opacity="0.62" />
      <rect x="26" y="43" width="20" height="5" rx="2.5" fill="#ffffff" opacity="0.38" />
      {/* Front bubble, casting a little shadow on the back one. */}
      <path d={front} fill="#0a0620" opacity="0.35" transform="translate(-3 3)" />
      <path d={front} fill={`url(#${id('violetSide')})`} transform="translate(0 4.5)" />
      <path d={front} fill={`url(#${id('violet')})`} />
      <path d={front} fill="none" stroke={`url(#${id('rim')})`} strokeWidth="1.3" />
      <path
        d="M56 44.5 H94 Q104 44.5 105 52 H47 Q48 44.5 56 44.5 Z"
        fill={`url(#${id('gloss')})`}
      />
      {/* Typing indicator: three raised dots. */}
      {[62, 76, 90].map((x) => (
        <g key={x}>
          <circle cx={x} cy={66.6} r={4.6} fill="#1d1266" opacity="0.5" />
          <circle cx={x} cy={65} r={4.6} fill={`url(#${id('dot')})`} />
        </g>
      ))}
    </svg>
  );
}

/** Messages and collaboration steps, kept together: a project sheet with its timeline. */
export function ContextIcon({ size = 96 }: { size?: number }) {
  const id = useIds();
  const steps = [
    { y: 44, done: true, lines: [20, 16] },
    { y: 65, done: true, lines: [26, 20] },
    { y: 86, done: false, lines: [22, 14] },
  ];
  const bubble =
    'M78 12 H100 Q108 12 108 20 V32 Q108 40 100 40 H86 L78 47 L79.5 40 Q70 39 70 31 V20 Q70 12 78 12 Z';
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={id('floor')} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#010208" stopOpacity="0.9" />
          <stop offset="0.55" stopColor="#010208" stopOpacity="0.35" />
          <stop offset="1" stopColor="#010208" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('body')} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#353b70" />
          <stop offset="0.55" stopColor="#1d2247" />
          <stop offset="1" stopColor="#11152f" />
        </linearGradient>
        <linearGradient id={id('side')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0f1330" />
          <stop offset="1" stopColor="#070918" />
        </linearGradient>
        <linearGradient id={id('rim')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="0.25" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={id('done')} cx="35%" cy="30%" r="70%">
          <stop offset="0" stopColor="#e4dcff" />
          <stop offset="0.5" stopColor="#9277ff" />
          <stop offset="1" stopColor="#4a2fcf" />
        </radialGradient>
        <linearGradient id={id('blue')} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#9bb3ff" />
          <stop offset="0.5" stopColor="#5a7cf5" />
          <stop offset="1" stopColor="#2f40c4" />
        </linearGradient>
        <linearGradient id={id('blueSide')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#23308f" />
          <stop offset="1" stopColor="#141c5c" />
        </linearGradient>
        <linearGradient id={id('sheen')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={id('sheet')}>
          <rect x="20" y="24" width="72" height="80" rx="12" />
        </clipPath>
      </defs>

      <ellipse cx="60" cy="108" rx="40" ry="7.5" fill={`url(#${id('floor')})`} />
      {/* The project sheet and its thickness. */}
      <rect x="20" y="28.5" width="72" height="80" rx="12" fill={`url(#${id('side')})`} />
      <rect x="20" y="24" width="72" height="80" rx="12" fill={`url(#${id('body')})`} />
      <rect
        x="20.6"
        y="24.6"
        width="70.8"
        height="78.8"
        rx="11.5"
        fill="none"
        stroke={`url(#${id('rim')})`}
        strokeWidth="1.2"
      />
      <g clipPath={`url(#${id('sheet')})`}>
        <polygon points="16,24 44,24 24,104 -4,104" fill={`url(#${id('sheen')})`} />
      </g>
      {/* Timeline: the steps of the collaboration. */}
      <line
        x1="36"
        y1="44"
        x2="36"
        y2="86"
        stroke="#6d5fd0"
        strokeOpacity="0.55"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {steps.map(({ y, done, lines }) => (
        <g key={y}>
          {done ? (
            <>
              <circle cx="36" cy={y + 1.6} r="6.4" fill="#05041a" opacity="0.55" />
              <circle cx="36" cy={y} r="6.4" fill={`url(#${id('done')})`} />
              <path
                d={`M32.6 ${y} L35.2 ${y + 2.6} L39.6 ${y - 2.4}`}
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          ) : (
            <circle cx="36" cy={y} r="5.6" fill="#161a38" stroke="#8f7cff" strokeWidth="2" />
          )}
          <rect
            x="48"
            y={y - 4.5}
            width={lines[0]}
            height="4.2"
            rx="2.1"
            fill="#ffffff"
            opacity={done ? 0.6 : 0.4}
          />
          <rect
            x="48"
            y={y + 2}
            width={lines[1]}
            height="3.4"
            rx="1.7"
            fill="#ffffff"
            opacity={done ? 0.28 : 0.18}
          />
        </g>
      ))}
      {/* The conversation, attached to the sheet. */}
      <path d={bubble} fill="#010208" opacity="0.4" transform="translate(-2.5 3)" />
      <path d={bubble} fill={`url(#${id('blueSide')})`} transform="translate(0 4)" />
      <path d={bubble} fill={`url(#${id('blue')})`} />
      <path d={bubble} fill="none" stroke={`url(#${id('rim')})`} strokeWidth="1.2" />
      {[81, 89, 97].map((x) => (
        <circle key={x} cx={x} cy={26} r="2.9" fill="#ffffff" opacity="0.92" />
      ))}
    </svg>
  );
}

/** The brand funds, the Creator is paid: a wallet with the card that pays. */
export function PaymentIcon({ size = 96 }: { size?: number }) {
  const id = useIds();
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={id('floor')} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#010208" stopOpacity="0.9" />
          <stop offset="0.55" stopColor="#010208" stopOpacity="0.35" />
          <stop offset="1" stopColor="#010208" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('card')} x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#a9bdff" />
          <stop offset="0.5" stopColor="#5a7cf5" />
          <stop offset="1" stopColor="#2f40c4" />
        </linearGradient>
        <linearGradient id={id('chip')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#bfb0ff" />
        </linearGradient>
        <linearGradient id={id('wallet')} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor="#c9baff" />
          <stop offset="0.45" stopColor="#8467ff" />
          <stop offset="1" stopColor="#4a2fcf" />
        </linearGradient>
        <linearGradient id={id('side')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2e1f93" />
          <stop offset="1" stopColor="#170f55" />
        </linearGradient>
        <linearGradient id={id('strap')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7457f2" />
          <stop offset="1" stopColor="#3a24a8" />
        </linearGradient>
        <radialGradient id={id('clasp')} cx="35%" cy="30%" r="70%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.5" stopColor="#d6caff" />
          <stop offset="1" stopColor="#6a4de8" />
        </radialGradient>
        <linearGradient id={id('rim')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="0.3" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id('gloss')} x1="0" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      <ellipse cx="60" cy="106" rx="42" ry="7.5" fill={`url(#${id('floor')})`} />
      {/* The card, slipped into the wallet. */}
      <g transform="rotate(-9 60 40)">
        <rect x="30" y="22.5" width="60" height="38" rx="6" fill="#141c5c" />
        <rect x="30" y="19" width="60" height="38" rx="6" fill={`url(#${id('card')})`} />
        <rect
          x="30.5"
          y="19.5"
          width="59"
          height="37"
          rx="5.6"
          fill="none"
          stroke={`url(#${id('rim')})`}
          strokeWidth="1.1"
        />
        <rect x="38" y="27" width="12" height="9" rx="2.2" fill={`url(#${id('chip')})`} />
        <path d="M42 27 V36 M38 31.5 H50" stroke="#6a4de8" strokeOpacity="0.45" strokeWidth="0.9" />
        <rect x="56" y="29" width="24" height="3.2" rx="1.6" fill="#ffffff" opacity="0.5" />
      </g>
      {/* Wallet body and its thickness. */}
      <rect x="14" y="46" width="92" height="54" rx="13" fill={`url(#${id('side')})`} />
      <rect x="14" y="41" width="92" height="54" rx="13" fill={`url(#${id('wallet')})`} />
      <rect
        x="14.6"
        y="41.6"
        width="90.8"
        height="52.8"
        rx="12.5"
        fill="none"
        stroke={`url(#${id('rim')})`}
        strokeWidth="1.3"
      />
      <rect
        x="20"
        y="47"
        width="80"
        height="42"
        rx="9"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.32"
        strokeWidth="1"
        strokeDasharray="3 2.6"
      />
      <path
        d="M20 45 Q60 39 100 45"
        fill="none"
        stroke={`url(#${id('gloss')})`}
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Strap and clasp. */}
      <path d="M106 60.5 H84 Q75 60.5 75 69.5 V75.5 Q75 84.5 84 84.5 H106 Z" fill="#170f55" />
      <path d="M106 57 H84 Q75 57 75 66 V72 Q75 81 84 81 H106 Z" fill={`url(#${id('strap')})`} />
      <path
        d="M106 57.5 H84 Q75.5 57.5 75.5 66"
        fill="none"
        stroke={`url(#${id('rim')})`}
        strokeWidth="1"
      />
      <circle cx="90" cy="70.8" r="5.4" fill="#0b0826" opacity="0.5" />
      <circle cx="90" cy="69" r="5.2" fill={`url(#${id('clasp')})`} />
      <circle cx="88.4" cy="67.4" r="1.4" fill="#ffffff" opacity="0.9" />
    </svg>
  );
}

/** Settings, reporting, blocking and support stay in reach: a shield. */
export function ControlIcon({ size = 96 }: { size?: number }) {
  const id = useIds();
  const shield =
    'M60 14 C72 20 86 22 97 22 V54 C97 77 81 93 60 102 C39 93 23 77 23 54 V22 C34 22 48 20 60 14 Z';
  const panel =
    'M60 27 C69 31.5 79 33.5 86 33.5 V55 C86 71 75 83 60 89.5 C45 83 34 71 34 55 V33.5 C41 33.5 51 31.5 60 27 Z';
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id={id('floor')} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#010208" stopOpacity="0.9" />
          <stop offset="0.55" stopColor="#010208" stopOpacity="0.35" />
          <stop offset="1" stopColor="#010208" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id('shield')} x1="0.15" y1="0.05" x2="0.85" y2="0.95">
          <stop offset="0" stopColor="#d7cbff" />
          <stop offset="0.42" stopColor="#8f72ff" />
          <stop offset="1" stopColor="#4a2fcf" />
        </linearGradient>
        <linearGradient id={id('side')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a26a3" />
          <stop offset="1" stopColor="#1c1463" />
        </linearGradient>
        <linearGradient id={id('rim')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.75" />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id('wall')} x1="0.2" y1="0.1" x2="0.8" y2="0.9">
          <stop offset="0" stopColor="#05041a" />
          <stop offset="0.55" stopColor="#2a1f7a" />
          <stop offset="1" stopColor="#c8baff" />
        </linearGradient>
        <radialGradient id={id('face')} cx="40%" cy="30%" r="75%">
          <stop offset="0" stopColor="#2f3563" />
          <stop offset="0.6" stopColor="#161b38" />
          <stop offset="1" stopColor="#0a0e22" />
        </radialGradient>
        <linearGradient id={id('check')} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#b9a8ff" />
        </linearGradient>
        <linearGradient id={id('gloss')} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={id('panelClip')}>
          <path d={panel} transform="translate(60 58) scale(0.93) translate(-60 -58)" />
        </clipPath>
      </defs>

      <ellipse cx="60" cy="108" rx="34" ry="7" fill={`url(#${id('floor')})`} />
      {/* Shield and its thickness. */}
      <path d={shield} fill={`url(#${id('side')})`} transform="translate(0 5)" />
      <path d={shield} fill={`url(#${id('shield')})`} />
      <path d={shield} fill="none" stroke={`url(#${id('rim')})`} strokeWidth="1.4" />
      {/* Recessed panel: an inner wall, then the dark face. */}
      <path d={panel} fill={`url(#${id('wall')})`} />
      <path
        d={panel}
        fill={`url(#${id('face')})`}
        transform="translate(60 58) scale(0.93) translate(-60 -58)"
      />
      {/* The check stands out of the panel. */}
      <path
        d="M46.5 58.5 L56 68 L74.5 47.5"
        fill="none"
        stroke="#05041a"
        strokeOpacity="0.6"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(0 2.4)"
      />
      <path
        d="M46.5 58.5 L56 68 L74.5 47.5"
        fill="none"
        stroke={`url(#${id('check')})`}
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M47.8 57.4 L55.6 65.2"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.85"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <g clipPath={`url(#${id('panelClip')})`}>
        <ellipse
          cx="46"
          cy="36"
          rx="26"
          ry="11"
          transform="rotate(-28 46 36)"
          fill={`url(#${id('gloss')})`}
        />
      </g>
    </svg>
  );
}
