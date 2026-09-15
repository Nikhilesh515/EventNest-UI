import type { ReactNode } from 'react';

interface PostcardSpreadProps {
  postcard: ReactNode;
  reply: ReactNode;
}

export function PostcardSpread({ postcard, reply }: PostcardSpreadProps) {
  return (
    <div className="spread" id="spread-root">
      {postcard}
      <div className="spread__seam" id="spread-seam" aria-hidden="true" />
      {reply}
    </div>
  );
}
