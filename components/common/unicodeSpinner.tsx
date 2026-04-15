import { useEffect, useState } from 'react';
import spinners, { BrailleSpinnerName } from 'unicode-animations';

export default function Spinner({
  name = 'braille',
  children,
}: {
  name: BrailleSpinnerName;
  children: React.ReactNode;
}) {
  const [frame, setFrame] = useState(0);
  const s = spinners[name];

  useEffect(() => {
    if (!s) return;
    const timer = setInterval(
      () => setFrame((f) => (f + 1) % s.frames.length),
      s.interval,
    );
    return () => clearInterval(timer);
  }, [name, s]);

  if (!s) return null;

  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-block min-w-8 text-center font-mono">
        {s.frames[frame]}
      </span>
      {children}
    </span>
  );
}
