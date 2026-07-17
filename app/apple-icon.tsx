import { ImageResponse } from 'next/og';
import Logo from '@/components/common/logo';

export const runtime = 'edge';

export const size = {
  width: 180,
  height: 180,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'white', // Solid white background for iOS
      }}
    >
      <Logo style={{ width: '80%', height: '80%', color: '#34d399' }} />
    </div>,
    {
      ...size,
    },
  );
}
