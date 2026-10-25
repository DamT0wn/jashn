/** Quiet, static decoration: no motion, focus targets or screen-reader noise. */
export function CelebrationGarland() {
  return <svg className="celebration-garland" viewBox="0 0 1000 240" fill="none" aria-hidden="true" focusable="false">
    <path d="M-20 20 Q500 320 1020 20" stroke="#efc47e" strokeOpacity=".55" strokeWidth="1.5" />
    {[80, 200, 320, 440, 560, 680, 800, 920].map((x, i) => {
      const y = 20 + 600 * (x / 1000) * (1 - x / 1000);
      return <g key={x} transform={`translate(${x} ${y})`}>
        <path d="M0 0v24" stroke="#efc47e" strokeOpacity=".6" />
        <path d="M0 18C-24 18-24 48 0 57C24 48 24 18 0 18Z" fill={['#efb553', '#df927e', '#a9ba98'][i % 3]} />
        <path d="M0 23v29" stroke="#402a24" strokeOpacity=".25" />
        <circle cy="66" r="3" fill="#f8dfad" />
      </g>;
    })}
  </svg>;
}
