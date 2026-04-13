import { renderBrandIcon } from '@/lib/seo/marketing-images';
import { ImageResponse } from 'next/og';

export const size = {
  width: 512,
  height: 512
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(renderBrandIcon(size.width), size);
}
