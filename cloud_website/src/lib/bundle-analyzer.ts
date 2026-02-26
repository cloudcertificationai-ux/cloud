// Bundle analysis utilities for performance monitoring

export interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  chunks: ChunkInfo[];
  assets: AssetInfo[];
  recommendations: string[];
  score: 'good' | 'needs-improvement' | 'poor';
}

export interface ChunkInfo {
  name: string;
  size: number;
  gzippedSize: number;
  modules: string[];
  isInitial: boolean;
  isAsync: boolean;
}

export interface AssetInfo {
  name: string;
  size: number;
  type: 'js' | 'css' | 'image' | 'font' | 'other';
  cached: boolean;
  compressed: boolean;
}

// Analyze bundle from webpack stats
export function analyzeBundleStats(stats: any): BundleAnalysis {
  const assets = stats.assets || [];
  const chunks = stats.chunks || [];
  
  let totalSize = 0;
  let gzippedSize = 0;
  
  const assetInfos: AssetInfo[] = assets.map((asset: any) => {
    totalSize += asset.size;
    
    return {
      name: asset.name,
      size: asset.size,
      type: getAssetType(asset.name),
      cached: asset.cached || false,
      compressed: asset.name.includes('.gz') || asset.name.includes('.br'),
    };
  });

  const chunkInfos: ChunkInfo[] = chunks.map((chunk: any) => ({
    name: chunk.name || chunk.id,
    size: chunk.size,
    gzippedSize: estimateGzippedSize(chunk.size),
    modules: chunk.modules?.map((m: any) => m.name) || [],
    isInitial: chunk.initial || false,
    isAsync: !chunk.initial,
  }));

  gzippedSize = chunkInfos.reduce((sum, chunk) => sum + chunk.gzippedSize, 0);

  const recommendations = generateBundleRecommendations(totalSize, assetInfos, chunkInfos);
  const score = getBundleScore(totalSize);

  return {
    totalSize,
    gzippedSize,
    chunks: chunkInfos,
    assets: assetInfos,
    recommendations,
    score,
  };
}

// Analyze runtime bundle performance
export function analyzeRuntimeBundle(): BundleAnalysis | null {
  if (typeof window === 'undefined' || !('performance' in window)) {
    return null;
  }

  try {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    const assets: AssetInfo[] = [];
    let totalSize = 0;

    resources.forEach(resource => {
      const size = resource.transferSize || 0;
      if (size > 0) {
        totalSize += size;
        assets.push({
          name: resource.name,
          size,
          type: getAssetType(resource.name),
          cached: resource.transferSize === 0 && resource.decodedBodySize > 0,
          compressed: (resource.encodedBodySize || 0) < (resource.decodedBodySize || 0),
        });
      }
    });

    const gzippedSize = estimateGzippedSize(totalSize);
    const recommendations = generateBundleRecommendations(totalSize, assets, []);
    const score = getBundleScore(totalSize);

    return {
      totalSize,
      gzippedSize,
      chunks: [], // Not available at runtime
      assets,
      recommendations,
      score,
    };
  } catch (error) {
    console.warn('Failed to analyze runtime bundle:', error);
    return null;
  }
}

// Get asset type from filename
function getAssetType(filename: string): AssetInfo['type'] {
  if (filename.includes('.js')) return 'js';
  if (filename.includes('.css')) return 'css';
  if (filename.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i)) return 'image';
  if (filename.match(/\.(woff|woff2|ttf|eot)$/i)) return 'font';
  return 'other';
}

// Estimate gzipped size (rough approximation)
function estimateGzippedSize(originalSize: number): number {
  // Typical gzip compression ratio for web assets is around 70%
  return Math.round(originalSize * 0.3);
}

// Generate bundle optimization recommendations
function generateBundleRecommendations(
  totalSize: number,
  assets: AssetInfo[],
  chunks: ChunkInfo[]
): string[] {
  const recommendations: string[] = [];

  // Size-based recommendations
  if (totalSize > 1024 * 1024) { // > 1MB
    recommendations.push('Bundle size is large (>1MB) - consider aggressive code splitting');
  } else if (totalSize > 512 * 1024) { // > 512KB
    recommendations.push('Bundle size is moderate (>512KB) - consider code splitting for non-critical code');
  }

  // JavaScript-specific recommendations
  const jsAssets = assets.filter(a => a.type === 'js');
  const totalJsSize = jsAssets.reduce((sum, asset) => sum + asset.size, 0);
  
  if (totalJsSize > 512 * 1024) {
    recommendations.push('JavaScript bundle is large - implement dynamic imports for route-based code splitting');
  }

  // Large individual assets
  const largeAssets = assets.filter(a => a.size > 100 * 1024); // > 100KB
  if (largeAssets.length > 0) {
    recommendations.push(`Found ${largeAssets.length} large assets - consider optimization or lazy loading`);
  }

  // Uncompressed assets
  const uncompressedAssets = assets.filter(a => !a.compressed && a.size > 10 * 1024);
  if (uncompressedAssets.length > 0) {
    recommendations.push('Enable compression (gzip/brotli) for better performance');
  }

  // Chunk-specific recommendations
  const largeInitialChunks = chunks.filter(c => c.isInitial && c.size > 200 * 1024);
  if (largeInitialChunks.length > 0) {
    recommendations.push('Large initial chunks detected - move non-critical code to async chunks');
  }

  // Image optimization
  const imageAssets = assets.filter(a => a.type === 'image');
  const totalImageSize = imageAssets.reduce((sum, asset) => sum + asset.size, 0);
  
  if (totalImageSize > 500 * 1024) {
    recommendations.push('Large image assets detected - use Next.js Image component with optimization');
  }

  // Caching recommendations
  const uncachedAssets = assets.filter(a => !a.cached && a.type !== 'other');
  if (uncachedAssets.length > 0) {
    recommendations.push('Improve caching strategy for better repeat visit performance');
  }

  return recommendations;
}

// Get bundle performance score
function getBundleScore(totalSize: number): 'good' | 'needs-improvement' | 'poor' {
  if (totalSize <= 250 * 1024) return 'good'; // <= 250KB
  if (totalSize <= 500 * 1024) return 'needs-improvement'; // <= 500KB
  return 'poor'; // > 500KB
}

// Format file size for display
export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

// Get bundle optimization suggestions based on analysis
export function getBundleOptimizationSuggestions(analysis: BundleAnalysis): {
  priority: 'high' | 'medium' | 'low';
  suggestions: string[];
}[] {
  const suggestions: { priority: 'high' | 'medium' | 'low'; suggestions: string[] }[] = [];

  if (analysis.score === 'poor') {
    suggestions.push({
      priority: 'high',
      suggestions: [
        'Implement aggressive code splitting',
        'Remove unused dependencies',
        'Use dynamic imports for non-critical code',
        'Enable tree shaking',
      ],
    });
  }

  if (analysis.score === 'needs-improvement') {
    suggestions.push({
      priority: 'medium',
      suggestions: [
        'Implement route-based code splitting',
        'Optimize large dependencies',
        'Use compression for static assets',
        'Implement lazy loading for images',
      ],
    });
  }

  // Asset-specific suggestions
  const largeJsAssets = analysis.assets.filter(a => a.type === 'js' && a.size > 200 * 1024);
  if (largeJsAssets.length > 0) {
    suggestions.push({
      priority: 'high',
      suggestions: [
        'Split large JavaScript bundles',
        'Use dynamic imports for vendor libraries',
        'Implement module federation if applicable',
      ],
    });
  }

  const largeImageAssets = analysis.assets.filter(a => a.type === 'image' && a.size > 100 * 1024);
  if (largeImageAssets.length > 0) {
    suggestions.push({
      priority: 'medium',
      suggestions: [
        'Optimize image formats (WebP, AVIF)',
        'Implement responsive images',
        'Use Next.js Image component',
        'Consider image CDN',
      ],
    });
  }

  return suggestions;
}

// Monitor bundle size changes over time
export class BundleSizeMonitor {
  private history: { timestamp: number; size: number; analysis: BundleAnalysis }[] = [];
  private maxHistorySize = 100;

  addMeasurement(analysis: BundleAnalysis) {
    this.history.push({
      timestamp: Date.now(),
      size: analysis.totalSize,
      analysis,
    });

    // Keep only recent measurements
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
    }
  }

  getTrend(timeframeMs: number = 24 * 60 * 60 * 1000): {
    change: number;
    direction: 'increasing' | 'decreasing' | 'stable';
    measurements: number;
  } {
    const cutoff = Date.now() - timeframeMs;
    const recentMeasurements = this.history.filter(m => m.timestamp >= cutoff);

    if (recentMeasurements.length < 2) {
      return { change: 0, direction: 'stable', measurements: recentMeasurements.length };
    }

    const oldest = recentMeasurements[0];
    const newest = recentMeasurements[recentMeasurements.length - 1];
    
    const change = ((newest.size - oldest.size) / oldest.size) * 100;
    
    let direction: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (Math.abs(change) > 5) { // > 5% change
      direction = change > 0 ? 'increasing' : 'decreasing';
    }

    return {
      change: Math.round(change * 10) / 10,
      direction,
      measurements: recentMeasurements.length,
    };
  }

  getAverageSize(timeframeMs: number = 24 * 60 * 60 * 1000): number {
    const cutoff = Date.now() - timeframeMs;
    const recentMeasurements = this.history.filter(m => m.timestamp >= cutoff);

    if (recentMeasurements.length === 0) return 0;

    const totalSize = recentMeasurements.reduce((sum, m) => sum + m.size, 0);
    return Math.round(totalSize / recentMeasurements.length);
  }
}

// Global bundle size monitor instance
export const bundleSizeMonitor = new BundleSizeMonitor();