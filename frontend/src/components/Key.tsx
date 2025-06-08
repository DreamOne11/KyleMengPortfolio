// src/components/Key.tsx
import React from "react";

interface Props {
  letter: string;
  idx: number;
}

const Key: React.FC<Props> = ({ letter, idx }) => (
  <img
    src={`/img/keys/key-${letter.toLowerCase()}.png`}
    alt={letter}
    className={`key key-${idx}`}
    draggable={false}
  />
);

export default Key;
