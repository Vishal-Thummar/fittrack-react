import { useEffect, useState } from 'react';
import { fetchPhoto } from '../lib/drive.js';

export default function DriveImage({ id }) {
  const [src, setSrc] = useState(null);
  useEffect(() => { let live = true; fetchPhoto(id).then((s) => live && setSrc(s)).catch(() => {}); return () => { live = false; }; }, [id]);
  return src
    ? <img src={src} alt="Progress" loading="lazy" className="aspect-[3/4] w-full rounded-xl bg-line object-cover" />
    : <div className="aspect-[3/4] w-full animate-pulse rounded-xl bg-line" />;
}
