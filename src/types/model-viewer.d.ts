import React from 'react';

export interface ModelViewerPBR {
  baseColorFactor: [number, number, number, number];
  setBaseColorFactor: (color: [number, number, number, number]) => void;
  metallicFactor?: number;
  roughnessFactor?: number;
  metallicRoughnessTexture?: unknown;
  setMetallicFactor?: (metallic: number) => void;
  setRoughnessFactor?: (roughness: number) => void;
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
  animationCrossfadeDuration?: number;
  availableAnimations?: string[];
  currentTime?: number;
  model?: {
    materials: ModelViewerMaterial[];
  };
  materialFromPoint?: (x: number, y: number) => ModelViewerMaterial | null;
  play?: (options?: { repetitions?: number }) => void;
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
        'shadow-softness'?: string | number;
        exposure?: string | number;
        'environment-image'?: string;
        'tone-mapping'?: string;
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
