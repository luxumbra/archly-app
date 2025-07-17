import { useState, useEffect, useMemo } from "react";

const useYoreAssetProgress = (assetConfig = {}) => {
  const [progress, setProgress] = useState(0);
  const [loadedAssets, setLoadedAssets] = useState(new Set());

  // Default assets for Yore
  const defaultAssets = {
    // Critical scripts
    'google-maps': () => window.google?.maps,
    'react-dom': () => window.React,

    // API calls
    // 'initial-places': () => fetch('/api/places/initial').catch(() => Promise.resolve()),

    // Images (only ones you care about)
    'hero-image': () => new Promise(resolve => {
      const img = new Image();
      img.onload = resolve;
      img.onerror = resolve; // Count errors as loaded
      img.src = '/asets/yore.png';
    }),

    // Stylesheets
    'main-css': () => document.querySelector('link[href*="global.css"]')?.sheet,
    'google-fonts': () => document.fonts.ready,

    // Custom resources
    'map-tiles': () => new Promise(resolve => setTimeout(resolve, 1000)), // Simulate map loading
  };

  const assets = { ...defaultAssets, ...assetConfig };
  const assetKeys = Object.keys(assets);
  const totalAssets = assetKeys.length;

  useEffect(() => {
    const loadAsset = async (key, loader) => {
      try {
        if (typeof loader === 'function') {
          await loader();
        }
        setLoadedAssets(prev => new Set([...prev, key]));
      } catch (error) {
        console.warn(`Asset ${key} failed to load:`, error);
        // Still count as loaded to prevent hanging
        setLoadedAssets(prev => new Set([...prev, key]));
      }
    };

    // Load all assets
    assetKeys.forEach(key => {
      loadAsset(key, assets[key]);
    });
  }, []);

  useEffect(() => {
    const percentage = (loadedAssets.size / totalAssets) * 100;
    setProgress(Math.round(percentage));
  }, [loadedAssets, totalAssets]);

  // Memoize the array to prevent unnecessary re-renders
  const loadedAssetsArray = useMemo(() => Array.from(loadedAssets), [loadedAssets]);
  const isComplete = useMemo(() => loadedAssets.size === totalAssets, [loadedAssets.size, totalAssets]);

  return {
    progress,
    loadedAssets: loadedAssetsArray,
    totalAssets,
    isComplete
  };
};

export { useYoreAssetProgress };