export type PostItNote = {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  folded: boolean;
  /** 접기 직전 높이 (펼칠 때 복원) */
  expandedHeight?: number;
  z: number;
};
