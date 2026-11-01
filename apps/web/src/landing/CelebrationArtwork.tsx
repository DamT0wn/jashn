type CelebrationArtworkProps = { scene: 'budget' | 'timeline' | 'ideas' };

/** Small, locally rendered event illustrations for the landing page feature cards. */
export function CelebrationArtwork({ scene }: CelebrationArtworkProps) {
  if (scene === 'budget') {
    return <svg className="celebration-artwork" viewBox="0 0 320 150" aria-hidden="true" focusable="false">
      <path d="M72 136V64a88 88 0 0 1 176 0v72" fill="#efb553" fillOpacity=".08" stroke="#efc47e" strokeOpacity=".45" />
      <path d="M84 136V67a76 76 0 0 1 152 0v69" fill="#30251e" stroke="#df927e" strokeOpacity=".35" />
      <path d="M39 105q38-22 76 0t76 0q38-22 76 0" stroke="#a9ba98" strokeWidth="2" fill="none" />
      <path d="M48 130h224M69 130l-8 17m190-17 8 17" stroke="#efc47e" strokeWidth="2" strokeLinecap="round" />
      <path d="M105 126v-31m110 31V95" stroke="#efc47e" strokeWidth="2" />
      <path d="M100 96h10l-2-17h-6zm110 0h10l-2-17h-6z" fill="#efb553" fillOpacity=".8" />
      <path d="M157 128V94m0 0c-17-5-21-17-13-22 8-5 13 9 13 22Zm0-8c0-19 12-26 18-18 5 7-6 16-18 18Z" fill="#a9ba98" stroke="#d6ba82" strokeWidth="1.5" />
      <circle cx="145" cy="72" r="3" fill="#df927e" /><circle cx="176" cy="79" r="3" fill="#efb553" />
      <path d="M123 113h74" stroke="#fff0d7" strokeOpacity=".6" strokeWidth="1" />
      <circle cx="91" cy="119" r="2" fill="#efb553" /><circle cx="229" cy="118" r="2" fill="#df927e" />
    </svg>;
  }

  if (scene === 'timeline') {
    return <svg className="celebration-artwork" viewBox="0 0 320 150" aria-hidden="true" focusable="false">
      <path d="M27 37q67 29 133 0t133 0" fill="none" stroke="#efc47e" strokeOpacity=".65" strokeWidth="1.5" />
      {[50, 94, 138, 182, 226, 270].map((x, index) => <g key={x} transform={`translate(${x} ${47 + Math.sin(index * .65) * 9})`}>
        <path d="M0-8v13" stroke="#efc47e" strokeOpacity=".8" />
        <path d="M-7 4h14l-2 16h-10z" fill={index % 2 ? '#df927e' : '#efb553'} fillOpacity=".82" />
        <path d="M-4 7h8" stroke="#fff0d7" strokeOpacity=".7" />
      </g>)}
      <path d="M67 137V91a93 93 0 0 1 186 0v46" fill="#a9ba98" fillOpacity=".12" stroke="#a9ba98" strokeOpacity=".5" />
      <path d="M91 137V94a69 69 0 0 1 138 0v43" fill="#30251e" stroke="#efc47e" strokeOpacity=".3" />
      <path d="M95 137h132" stroke="#efc47e" strokeWidth="2" />
      <path d="M112 114h96" stroke="#fff0d7" strokeOpacity=".5" strokeWidth="1.5" />
      <circle cx="129" cy="114" r="5" fill="#efb553" /><circle cx="160" cy="114" r="5" fill="#df927e" /><circle cx="191" cy="114" r="5" fill="#a9ba98" />
      <path d="M129 124v13m31-13v13m31-13v13" stroke="#efc47e" strokeWidth="1.5" />
      <path d="m126 96 3 3 6-7m22 4 3 3 6-7m22 4 3 3 6-7" fill="none" stroke="#fff0d7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>;
  }

  return <svg className="celebration-artwork" viewBox="0 0 320 150" aria-hidden="true" focusable="false">
    <path d="M66 136V73a94 94 0 0 1 188 0v63" fill="#df927e" fillOpacity=".08" stroke="#df927e" strokeOpacity=".45" />
    <path d="M84 136V76a76 76 0 0 1 152 0v60" fill="#30251e" stroke="#efc47e" strokeOpacity=".35" />
    <path d="M160 34c-12 12-14 26-3 36 8-11 10-23 3-36Zm-7 29c-17-10-30-7-33 5 12 8 24 7 33-5Zm10 2c12-15 26-16 32-5-8 13-20 16-32 5Z" fill="#a9ba98" stroke="#c5b779" strokeWidth="1.5" />
    <circle cx="157" cy="61" r="5" fill="#df927e" /><circle cx="128" cy="66" r="4" fill="#efb553" /><circle cx="190" cy="63" r="4" fill="#fff0d7" />
    <path d="M153 77c-18 9-26 22-20 36 14-2 23-13 20-36Zm13 0c18 9 26 22 20 36-14-2-23-13-20-36Z" fill="#a9ba98" fillOpacity=".78" />
    <path d="M160 78v54" stroke="#efc47e" strokeWidth="2" />
    <path d="M145 128q15 8 30 0" fill="none" stroke="#df927e" strokeWidth="2" />
    <path d="M92 107c-12-20-5-35 9-34 13 1 14 18-9 34Zm136 0c12-20 5-35-9-34-13 1-14 18 9 34Z" fill="#efb553" fillOpacity=".8" stroke="#fff0d7" strokeOpacity=".6" />
    <path d="M92 107v21m136-21v21" stroke="#efc47e" strokeWidth="1.5" />
    <path d="M48 126h224" stroke="#efc47e" strokeOpacity=".45" />
    <path d="m107 51 2 5 5 1-5 2-2 5-2-5-5-2 5-1zm108-12 2 5 5 1-5 2-2 5-2-5-5-2 5-1z" fill="#efb553" />
  </svg>;
}
