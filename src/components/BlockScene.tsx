function Cube({ x, y, size = 48, top = '#92cb67', left = '#9a6848', right = '#785039', height = 45 }: { x: number; y: number; size?: number; top?: string; left?: string; right?: string; height?: number }) {
  return <g><path d={`M${x},${y} l${size},${-size / 2} l${size},${size / 2} l${-size},${size / 2}Z`} fill={top} /><path d={`M${x},${y} l${size},${size / 2} v${height} l${-size},${-size / 2}Z`} fill={left} /><path d={`M${x + size},${y + size / 2} l${size},${-size / 2} v${height} l${-size},${size / 2}Z`} fill={right} /></g>
}

export default function BlockScene({ small = false }: { small?: boolean }) {
  return <svg className={`block-scene ${small ? 'block-scene-small' : ''}`} viewBox="0 0 640 430" aria-hidden="true">
    <g fill="#fff" opacity=".9"><path d="M58 104h38V89h53v15h40v19H58z"/><path d="M420 57h27V43h48v14h54v20H420z"/><path d="M489 152h32v-14h49v14h33v17H489z"/></g>
    <circle cx="528" cy="98" r="29" fill="#ffda7d" />
    <ellipse cx="316" cy="362" rx="213" ry="37" fill="#a9c4d9" opacity=".35" />
    <Cube x={113} y={245} size={102} height={57} />
    <Cube x={317} y={245} size={102} height={57} top="#9bd772" />
    <Cube x={215} y={296} size={102} height={57} top="#a5db7b" />
    <Cube x={215} y={194} size={102} height={57} top="#8bca60" />
    <g fill="#bd8c60"><path d="m132 268 21 10v17l-21-10zM174 296l22 10v15l-22-10zM236 329l23 11v17l-23-11z"/></g>
    <g fill="#5e9f43"><path d="m119 243 29 14v12l-12-6v6l-18-9zM220 296l29 14v13l-14-7v6l-15-7zM320 246l28 14v11l-28-14z"/></g>
    <Cube x={149} y={203} size={18} height={54} top="#ac8359" left="#90633f" right="#735133" />
    <Cube x={110} y={154} size={57} height={54} top="#74b65a" left="#4c963e" right="#3a7c35" />
    <Cube x={128} y={120} size={39} height={34} top="#8bc76a" left="#65a749" right="#4b923e" />
    <Cube x={368} y={208} size={20} height={38} top="#ddbd8c" left="#b58b5b" right="#8b683f" />
    <Cube x={368} y={170} size={20} height={38} top="#e5c99d" left="#c39b6c" right="#997447" />
    <Cube x={368} y={132} size={20} height={38} top="#eddbb4" left="#d0aa79" right="#ad8657" />
    <g transform="translate(275 155)">
      <path d="M-25 67h21v34h-21zM8 67h21v34H8z" fill="#7a8c99"/><path d="M-28 95H-2v13h-26zM6 95h26v13H6z" fill="#566c7d"/>
      <path d="M-30 16h62v57h-62z" fill="#c5d6de"/><path d="M19 16h13v57H19z" fill="#92abb9"/><path d="M-47 20h15v45h-15zM34 20h15v45H34z" fill="#97afbb"/>
      <rect x="-37" y="-35" width="76" height="57" rx="3" fill="#d8e5eb"/><path d="M27-35h12v57H27z" fill="#acbec9"/>
      <path d="M-28-22h57v24h-57z" fill="#364c62"/><path d="M-20-16h14v12h-14zM8-16h14v12H8z" fill="#72e1e7"/>
      <path d="M-5-48h10v14H-5z" fill="#90a9b6"/><rect x="-9" y="-55" width="18" height="11" fill="#ffcc67"/>
      <path d="M-17 34h35v22h-35z" fill="#819aa9"/><path d="M-7 38h15v13H-7z" fill="#ffce68"/>
    </g>
    <g fill="#fff6cf"><path d="m113 172 4 9 10 4-10 4-4 10-4-10-10-4 10-4zM428 224l4 8 8 4-8 4-4 8-4-8-8-4 8-4z"/></g>
    <g transform="translate(420 280) rotate(-9)"><rect width="126" height="39" rx="10" fill="#fff"/><path d="m17 12-8 7 8 7m21-14 8 7-8 7m-9-17-4 20" fill="none" stroke="#3268db" strokeWidth="3" strokeLinecap="round"/><path d="M62 15h45M62 24h30" stroke="#a9c4ed" strokeWidth="5" strokeLinecap="round"/></g>
  </svg>
}
