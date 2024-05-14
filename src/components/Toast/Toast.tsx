import React from 'react';
import { useToaster } from 'react-hot-toast';

export default function Toast() {
  const { toasts, handlers } = useToaster();

  const { startPause, endPause, calculateOffset, updateHeight } = handlers;

  return (
    <div>
      {toasts.map((toast) => {
        const offset = calculateOffset(toast, {
          reverseOrder: false,
          gutter: 10
        });
        // const ref = (el) => {
        //   if (el && !toast.height) {
        //     const height = el.getBoundingClientRect().height;
        //     updateHeight(toast.id, height);
        //   }
        // };
        return (
          <div
            key={toast.id}
            // ref={ref}
            style={{
              position: 'absolute',
              width: '13rem',
              padding: '.7rem',
              background: 'rgba(255, 30, 0, 0.1)',
              borderRadius: '3rem',
              transition: 'all 0.2s',
              transform: `translateY(${offset}px)`,
              opacity: toast.visible ? 1 : 0
            }}
          >
            {toast.message?.toString()}
          </div>
        );
      })}
    </div>
  );
}
