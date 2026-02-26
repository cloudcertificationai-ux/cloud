import { NextRequest, NextResponse } from 'next/server';
import { withCacheHeaders, CACHE_CONFIGS } from '@/lib/cache-utils';

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  id?: string;
  navigationType?: string;
}

interface PerformanceData {
  metrics: PerformanceMetric[];
  userAgent: string;
  url: string;
  timestamp: number;
  sessionId?: string;
  userId?: string;
  connectionType?: string;
  deviceMemory?: number;
  bundleSize?: {
    total: number;
    js: number;
    css: number;
    images: number;
  };
}

// Store performance data (in production, use a proper database)
const performanceStore: PerformanceData[] = [];

export async function POST(request: NextRequest) {
  try {
    // Add timeout to prevent hanging connections
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 5000)
    );
    
    const bodyPromise = request.json();
    const body: PerformanceData = await Promise.race([bodyPromise, timeoutPromise]) as PerformanceData;
    const { metrics, userAgent, url, timestamp, sessionId, connectionType, bundleSize } = body;

    // Validate required fields
    if (!metrics || !Array.isArray(metrics)) {
      return NextResponse.json(
        { error: 'Valid metrics array is required' },
        { status: 400 }
      );
    }

    // Validate Core Web Vitals metrics
    const validMetrics = ['LCP', 'FCP', 'CLS', 'INP', 'TTFB', 'FID'];
    const hasValidMetrics = metrics.some(metric => 
      validMetrics.includes(metric.name.toUpperCase())
    );

    if (!hasValidMetrics) {
      return NextResponse.json(
        { error: 'At least one Core Web Vital metric is required' },
        { status: 400 }
      );
    }

    // Store performance data
    const performanceEntry: PerformanceData = {
      metrics: metrics.map(metric => ({
        ...metric,
        rating: getRating(metric.name, metric.value),
      })),
      userAgent: userAgent || 'unknown',
      url: url || 'unknown',
      timestamp: timestamp || Date.now(),
      sessionId,
      connectionType,
      bundleSize,
    };

    performanceStore.push(performanceEntry);

    // Keep only last 1000 entries to prevent memory issues
    if (performanceStore.length > 1000) {
      performanceStore.splice(0, performanceStore.length - 1000);
    }

    // Log performance metrics with enhanced details
    console.log('Performance Metrics Received:', {
      url,
      metrics: metrics.map(m => `${m.name}: ${m.value}ms (${getRating(m.name, m.value)})`),
      userAgent: userAgent?.substring(0, 100) + '...',
      connectionType,
      bundleSize,
      timestamp: new Date(timestamp || Date.now()).toISOString(),
    });

    // Detect performance issues and log warnings
    const issues = detectPerformanceIssues(metrics);
    if (issues.length > 0) {
      console.warn('Performance Issues Detected:', {
        url,
        issues,
        sessionId,
      });
    }

    return NextResponse.json({ 
      success: true, 
      stored: performanceEntry.metrics.length,
      issues: issues.length > 0 ? issues : undefined,
    }, {
      headers: {
        'Connection': 'close', // Prevent connection reuse issues
      }
    });

  } catch (error) {
    // Handle connection errors gracefully
    if (error instanceof Error && (error.message.includes('aborted') || error.message.includes('timeout'))) {
      // Don't log connection aborts as errors - they're normal when users navigate away
      return new NextResponse(null, { status: 499 }); // Client Closed Request
    }
    
    console.error('Performance API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get performance insights with enhanced analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '24h';
    const page = searchParams.get('page');
    const metric = searchParams.get('metric');

    // Calculate timeframe in milliseconds
    const timeframeMs = getTimeframeMs(timeframe);
    const cutoffTime = Date.now() - timeframeMs;

    // Filter data by timeframe
    let filteredData = performanceStore.filter(entry => entry.timestamp >= cutoffTime);

    // Filter by page if specified
    if (page) {
      filteredData = filteredData.filter(entry => entry.url.includes(page));
    }

    // Calculate aggregated metrics
    const aggregatedMetrics = calculateAggregatedMetrics(filteredData);
    
    // Calculate trends (compare with previous period)
    const previousPeriodData = performanceStore.filter(entry => 
      entry.timestamp >= (cutoffTime - timeframeMs) && entry.timestamp < cutoffTime
    );
    const trends = calculateTrends(aggregatedMetrics, calculateAggregatedMetrics(previousPeriodData));

    // Generate insights and recommendations
    const insights = generateInsights(aggregatedMetrics, filteredData);

    // Get top performing and worst performing pages
    const pagePerformance = getPagePerformance(filteredData);

    // Bundle size analysis
    const bundleAnalysis = getBundleAnalysis(filteredData);

    const response = {
      timeframe,
      dataPoints: filteredData.length,
      averageMetrics: aggregatedMetrics,
      trends,
      insights,
      recommendations: generateRecommendations(aggregatedMetrics, trends),
      topPages: pagePerformance.best.slice(0, 5),
      worstPages: pagePerformance.worst.slice(0, 5),
      bundleAnalysis,
      deviceBreakdown: getDeviceBreakdown(filteredData),
      connectionBreakdown: getConnectionBreakdown(filteredData),
      timestamp: new Date().toISOString(),
    };

    return withCacheHeaders(response, CACHE_CONFIGS.analytics);

  } catch (error) {
    console.error('Performance insights error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper functions
function getRating(metricName: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const thresholds: Record<string, [number, number]> = {
    'LCP': [2500, 4000],
    'FCP': [1800, 3000],
    'CLS': [0.1, 0.25],
    'INP': [200, 500],
    'TTFB': [800, 1800],
    'FID': [100, 300],
  };

  const [good, poor] = thresholds[metricName.toUpperCase()] || [0, Infinity];
  
  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

function detectPerformanceIssues(metrics: PerformanceMetric[]): string[] {
  const issues: string[] = [];

  metrics.forEach(metric => {
    if (metric.rating === 'poor') {
      issues.push(`Poor ${metric.name}: ${metric.value}ms`);
    }
  });

  return issues;
}

function getTimeframeMs(timeframe: string): number {
  const timeframes: Record<string, number> = {
    '1h': 60 * 60 * 1000,
    '24h': 24 * 60 * 60 * 1000,
    '7d': 7 * 24 * 60 * 60 * 1000,
    '30d': 30 * 24 * 60 * 60 * 1000,
  };

  return timeframes[timeframe] || timeframes['24h'];
}

function calculateAggregatedMetrics(data: PerformanceData[]): Record<string, number> {
  if (data.length === 0) return {};

  const metricSums: Record<string, number[]> = {};

  data.forEach(entry => {
    entry.metrics.forEach(metric => {
      if (!metricSums[metric.name]) {
        metricSums[metric.name] = [];
      }
      metricSums[metric.name].push(metric.value);
    });
  });

  const aggregated: Record<string, number> = {};
  Object.entries(metricSums).forEach(([name, values]) => {
    aggregated[name] = Math.round(values.reduce((sum, val) => sum + val, 0) / values.length);
  });

  return aggregated;
}

function calculateTrends(current: Record<string, number>, previous: Record<string, number>): Record<string, { change: number; direction: string }> {
  const trends: Record<string, { change: number; direction: string }> = {};

  Object.entries(current).forEach(([metric, value]) => {
    const previousValue = previous[metric];
    if (previousValue) {
      const change = ((value - previousValue) / previousValue) * 100;
      trends[metric] = {
        change: Math.round(change * 10) / 10,
        direction: change < 0 ? 'improving' : change > 0 ? 'degrading' : 'stable',
      };
    }
  });

  return trends;
}

function generateInsights(metrics: Record<string, number>, data: PerformanceData[]): string[] {
  const insights: string[] = [];

  // LCP insights
  if (metrics.LCP > 4000) {
    insights.push('LCP is poor - consider optimizing images and reducing server response times');
  } else if (metrics.LCP > 2500) {
    insights.push('LCP needs improvement - optimize critical rendering path');
  }

  // CLS insights
  if (metrics.CLS > 0.25) {
    insights.push('CLS is poor - ensure images and ads have dimensions specified');
  }

  // Bundle size insights
  const avgBundleSize = data
    .filter(d => d.bundleSize)
    .reduce((sum, d) => sum + (d.bundleSize?.total || 0), 0) / data.length;
  
  if (avgBundleSize > 500 * 1024) { // > 500KB
    insights.push('Bundle size is large - consider code splitting and tree shaking');
  }

  return insights;
}

function generateRecommendations(metrics: Record<string, number>, trends: Record<string, { change: number; direction: string }>): string[] {
  const recommendations: string[] = [];

  // Core Web Vitals recommendations
  if (metrics.LCP > 2500) {
    recommendations.push('Optimize Largest Contentful Paint by compressing images and using Next.js Image component');
  }

  if (metrics.CLS > 0.1) {
    recommendations.push('Reduce Cumulative Layout Shift by setting explicit dimensions for images and ads');
  }

  if (metrics.INP > 200) {
    recommendations.push('Improve Interaction to Next Paint by optimizing JavaScript execution and reducing main thread blocking');
  }

  // Trend-based recommendations
  Object.entries(trends).forEach(([metric, trend]) => {
    if (trend.direction === 'degrading' && trend.change > 10) {
      recommendations.push(`${metric} is degrading by ${trend.change}% - investigate recent changes`);
    }
  });

  return recommendations;
}

function getPagePerformance(data: PerformanceData[]): { best: any[]; worst: any[] } {
  const pageMetrics: Record<string, { lcp: number[]; visits: number }> = {};

  data.forEach(entry => {
    const url = new URL(entry.url).pathname;
    if (!pageMetrics[url]) {
      pageMetrics[url] = { lcp: [], visits: 0 };
    }
    
    const lcpMetric = entry.metrics.find(m => m.name.toUpperCase() === 'LCP');
    if (lcpMetric) {
      pageMetrics[url].lcp.push(lcpMetric.value);
    }
    pageMetrics[url].visits++;
  });

  const pages = Object.entries(pageMetrics).map(([path, metrics]) => ({
    path,
    lcp: Math.round(metrics.lcp.reduce((sum, val) => sum + val, 0) / metrics.lcp.length),
    visits: metrics.visits,
  })).filter(page => !isNaN(page.lcp));

  return {
    best: pages.sort((a, b) => a.lcp - b.lcp),
    worst: pages.sort((a, b) => b.lcp - a.lcp),
  };
}

function getBundleAnalysis(data: PerformanceData[]): any {
  const bundleData = data.filter(d => d.bundleSize);
  
  if (bundleData.length === 0) {
    return { message: 'No bundle size data available' };
  }

  const avgBundle = {
    total: Math.round(bundleData.reduce((sum, d) => sum + (d.bundleSize?.total || 0), 0) / bundleData.length),
    js: Math.round(bundleData.reduce((sum, d) => sum + (d.bundleSize?.js || 0), 0) / bundleData.length),
    css: Math.round(bundleData.reduce((sum, d) => sum + (d.bundleSize?.css || 0), 0) / bundleData.length),
    images: Math.round(bundleData.reduce((sum, d) => sum + (d.bundleSize?.images || 0), 0) / bundleData.length),
  };

  return {
    average: avgBundle,
    samples: bundleData.length,
    recommendations: avgBundle.total > 500 * 1024 ? ['Consider code splitting', 'Optimize images', 'Remove unused dependencies'] : [],
  };
}

function getDeviceBreakdown(data: PerformanceData[]): Record<string, number> {
  const devices: Record<string, number> = {};
  
  data.forEach(entry => {
    const isMobile = /Mobile|Android|iPhone|iPad/.test(entry.userAgent);
    const deviceType = isMobile ? 'Mobile' : 'Desktop';
    devices[deviceType] = (devices[deviceType] || 0) + 1;
  });

  return devices;
}

function getConnectionBreakdown(data: PerformanceData[]): Record<string, number> {
  const connections: Record<string, number> = {};
  
  data.forEach(entry => {
    const type = entry.connectionType || 'Unknown';
    connections[type] = (connections[type] || 0) + 1;
  });

  return connections;
}