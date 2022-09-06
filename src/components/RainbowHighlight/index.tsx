import React, { PropsWithChildren } from 'react';
import { RoughNotation } from 'react-rough-notation';

export const RainbowHighlight: React.FC<PropsWithChildren<{ color: string; durationScalar?: number }>> = ({
  color,
  children,
  durationScalar,
}) => {
  // Change the animation duration depending on length of text we're animating (speed = distance / time)
  const animationDuration = Math.floor(30 * (durationScalar ?? (typeof children === 'string' ? children.length : 10)));

  return (
    <RoughNotation type="highlight" multiline={true} padding={[0, 2]} iterations={1} animationDuration={animationDuration} color={color}>
      {children}
    </RoughNotation>
  );
};
