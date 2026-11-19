import React from 'react';

export interface ModelViewerPBR {
  baseColorFactor: [number, number, number, number];
  setBaseColorFactor: (color: [number, number, number, number]) => void;
}

export interface ModelViewerMaterial {
  name?: string;
  pbrMetallicRoughness?: ModelViewerPBR;
}

export interface ModelViewerElement extends HTMLElement {
  src: string;
  alt: string;
  autoplay: boolean;
  animationName?: string;
  availableAnimations?: string[];
  model?: {
    materials: ModelViewerMaterial[];
  };
  play?: () => void;
  pause?: () => void;
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<
        React.HTMLAttributes<ModelViewerElement>,
        ModelViewerElement
      > & {
        src?: string;
        alt?: string;
        autoplay?: boolean;
        'camera-controls'?: boolean;
        'shadow-intensity'?: string | number;
        exposure?: string | number;
        'animation-name'?: string;
        'interaction-prompt'?: string;
        'touch-action'?: string;
        'disable-zoom'?: boolean;
        ar?: boolean;
      };
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'model-viewer': ModelViewerElement;
  }
}
