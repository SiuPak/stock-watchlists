// src/components/StockChart.jsx
import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts';
import { Loader2, AlertCircle } from 'lucide-react';

function formatTooltipTime(timestamp, range) {
  if (!timestamp) return '';
  const date = new Date(typeof timestamp === 'number' ? timestamp * 1000 : timestamp);
  if (range === '1d' || range === '5d') {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatVolume(val) {
  if (!val) return '0';
  if (val >= 1e9) return (val / 1e9).toFixed(2) + 'B';
  if (val >= 1e6) return (val / 1e6).toFixed(2) + 'M';
  if (val >= 1e3) return (val / 1e3).toFixed(1) + 'K';
  return val.toLocaleString();
}

export default function StockChart({
  chartData,
  timeRange = '1d',
  chartType = 'candlestick',
  showVolume = true,
  isLoading = false,
  error = null,
}) {
  const chartContainerRef = useRef(null);
  const chartRef = useRef(null);
  const mainSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);

  const [hoverData, setHoverData] = useState(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Initialize Chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#090d16' },
        textColor: '#9ca3af',
        fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace",
      },
      grid: {
        vertLines: { color: 'rgba(55, 65, 81, 0.25)' },
        horzLines: { color: 'rgba(55, 65, 81, 0.25)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#10b981',
          width: 1,
          style: 3,
          labelBackgroundColor: '#1f2937',
        },
        horzLine: {
          color: '#10b981',
          width: 1,
          style: 3,
          labelBackgroundColor: '#1f2937',
        },
      },
      rightPriceScale: {
        borderColor: '#1f2937',
        scaleMargins: {
          top: 0.1,
          bottom: showVolume ? 0.25 : 0.1,
        },
      },
      timeScale: {
        borderColor: '#1f2937',
        timeVisible: timeRange === '1d' || timeRange === '5d',
        secondsVisible: false,
      },
      handleScroll: true,
      handleScale: true,
    });

    chartRef.current = chart;

    // Resize Observer for dynamic responsive layout
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        chart.applyOptions({ width, height });
      }
    });

    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      mainSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, []);

  // Update Series data when chartData, chartType, or showVolume changes
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    const candles = chartData?.candles || [];
    if (candles.length === 0) return;

    // Remove old main series
    if (mainSeriesRef.current) {
      chart.removeSeries(mainSeriesRef.current);
      mainSeriesRef.current = null;
    }

    // Remove old volume series
    if (volumeSeriesRef.current) {
      chart.removeSeries(volumeSeriesRef.current);
      volumeSeriesRef.current = null;
    }

    // Update timeScale timeVisible option
    chart.timeScale().applyOptions({
      timeVisible: timeRange === '1d' || timeRange === '5d',
    });

    // Create Main Series (Candlestick or Area)
    let mainSeries;
    if (chartType === 'candlestick') {
      mainSeries = chart.addCandlestickSeries({
        upColor: '#10b981',
        downColor: '#ef4444',
        borderUpColor: '#10b981',
        borderDownColor: '#ef4444',
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
      });
      mainSeries.setData(candles);
    } else {
      mainSeries = chart.addAreaSeries({
        topColor: 'rgba(16, 185, 129, 0.45)',
        bottomColor: 'rgba(16, 185, 129, 0.01)',
        lineColor: '#10b981',
        lineWidth: 2,
      });
      mainSeries.setData(
        candles.map((c) => ({
          time: c.time,
          value: c.close,
        }))
      );
    }
    mainSeriesRef.current = mainSeries;

    // Create Volume Series if enabled
    if (showVolume) {
      const volumeSeries = chart.addHistogramSeries({
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: '', // Overlay series
      });

      volumeSeries.priceScale().applyOptions({
        scaleMargins: {
          top: 0.75, // Volume is in the bottom 25% of the chart
          bottom: 0,
        },
      });

      const volumeData = candles.map((c) => ({
        time: c.time,
        value: c.volume,
        color: c.close >= c.open ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)',
      }));

      volumeSeries.setData(volumeData);
      volumeSeriesRef.current = volumeSeries;
    }

    // Fit content into view
    chart.timeScale().fitContent();

    // Crosshair move handler for tooltip display
    chart.subscribeCrosshairMove((param) => {
      if (
        !param.point ||
        !param.time ||
        param.point.x < 0 ||
        param.point.x > chartContainerRef.current?.clientWidth ||
        param.point.y < 0 ||
        param.point.y > chartContainerRef.current?.clientHeight
      ) {
        setHoverData(null);
        return;
      }

      // Find the candle corresponding to the hovered timestamp
      const candle = candles.find((c) => c.time === param.time);
      if (candle) {
        setHoverData({
          time: candle.time,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          volume: candle.volume,
        });
      } else {
        const seriesPrice = param.seriesData.get(mainSeries);
        if (seriesPrice) {
          setHoverData({
            time: param.time,
            close: seriesPrice.value ?? seriesPrice.close,
            open: seriesPrice.open,
            high: seriesPrice.high,
            low: seriesPrice.low,
          });
        }
      }
    });
  }, [chartData, chartType, showVolume, timeRange]);

  const latestCandle = chartData?.candles?.[chartData.candles.length - 1];
  const activeData = hoverData || latestCandle;

  return (
    <div className="relative w-full h-[440px] rounded-2xl overflow-hidden bg-[#090d16] border border-gray-800/90 shadow-xl flex flex-col">
      {/* Chart Top Bar Tooltip / OHLCV Display */}
      <div className="px-4 py-2.5 bg-[#0d131f]/80 border-b border-gray-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono-finance z-10">
        <div className="flex items-center space-x-3">
          <span className="text-gray-400">
            {activeData ? formatTooltipTime(activeData.time, timeRange) : 'Latest'}
          </span>
          {timeRange === '1d' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold uppercase">
              Intraday (5m)
            </span>
          )}
        </div>

        {activeData && (
          <div className="flex items-center space-x-3 text-xs">
            {activeData.open != null && (
              <div>
                <span className="text-gray-500 text-[10px] mr-1">O</span>
                <span className="font-semibold text-gray-200">${activeData.open.toFixed(2)}</span>
              </div>
            )}
            {activeData.high != null && (
              <div>
                <span className="text-gray-500 text-[10px] mr-1">H</span>
                <span className="font-semibold text-emerald-400">${activeData.high.toFixed(2)}</span>
              </div>
            )}
            {activeData.low != null && (
              <div>
                <span className="text-gray-500 text-[10px] mr-1">L</span>
                <span className="font-semibold text-red-400">${activeData.low.toFixed(2)}</span>
              </div>
            )}
            <div>
              <span className="text-gray-500 text-[10px] mr-1">C</span>
              <span className="font-semibold text-gray-100">${activeData.close.toFixed(2)}</span>
            </div>
            {activeData.volume != null && showVolume && (
              <div className="hidden sm:block">
                <span className="text-gray-500 text-[10px] mr-1">Vol</span>
                <span className="text-gray-300">{formatVolume(activeData.volume)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 bg-[#090d16]/75 backdrop-blur-sm flex flex-col items-center justify-center space-y-2">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-xs text-gray-300 font-medium">Loading stock chart...</p>
        </div>
      )}

      {/* Error Overlay */}
      {error && !isLoading && (
        <div className="absolute inset-0 z-20 bg-[#090d16]/90 flex flex-col items-center justify-center p-6 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="text-sm text-red-300 font-medium">{error}</p>
          <p className="text-xs text-gray-500">Please try selecting another time range or stock symbol.</p>
        </div>
      )}

      {/* Chart Canvas Container */}
      <div ref={chartContainerRef} className="flex-1 w-full relative" />
    </div>
  );
}
