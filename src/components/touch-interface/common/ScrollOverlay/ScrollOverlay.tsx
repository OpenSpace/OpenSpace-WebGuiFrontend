import React, { useRef, useState, useEffect } from 'react';
import styles from './ScrollOverlay.scss';
import { defer } from '../../../../utils/helpers';

interface ScrollOverlayProps {
  className?: string;
  children: React.ReactNode;
}

interface ScrollOverlayComponent extends React.FC<ScrollOverlayProps> {
  elementId: () => string;
}

const ScrollOverlay: ScrollOverlayComponent = ({ className, children }) => {
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);
  const id = useRef(ScrollOverlay.elementId());
  const nodeRef = useRef<HTMLDivElement | null>(null);

  function updateScrollIndicators(target: HTMLDivElement) {
    if (!document.body.contains(target)) {
      return;
    }

    const bottomHeight = target.scrollTop + target.clientHeight;
    const heightAtBottom = Math.abs(bottomHeight - target.scrollHeight) < 1;
    const heightAtTop = target.scrollTop === 0;

    setAtTop(heightAtTop);
    setAtBottom(heightAtBottom);
  }

  function setDomNode(node: HTMLDivElement | null) {
    if (node) {
      nodeRef.current = node;
      nodeRef.current.addEventListener('scroll', ({ target }) =>
        updateScrollIndicators(target as HTMLDivElement)
      );
      defer(updateScrollIndicators, nodeRef.current);
    }
  }

  useEffect(() => {
    return () => {
      if (nodeRef.current) {
        nodeRef.current.removeEventListener('scroll', ({ target }) =>
          updateScrollIndicators(target as HTMLDivElement)
        );
      }
    };
  }, []);

  return (
    <div
      className={`scroll-content ${className} ${styles.ScrollOverlay}`}
      id={id.current}
      ref={setDomNode}
    >
      {/* {!atTop && <div className={styles.topShadow} />} */}
      {children}
      {/* {!atBottom && <div className={styles.bottomShadow} />} */}
    </div>
  );
};

let elementCount = 0;

ScrollOverlay.elementId = () => `scroll-overlay-${elementCount++}`;

export default ScrollOverlay;
