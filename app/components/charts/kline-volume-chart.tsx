import { useEffect, useRef } from "react";
import {
  CandlestickSeries,
  createChart,
  ColorType,
  HistogramSeries,
  LineSeries,
  LineStyle,
  type IChartApi,
  type CandlestickData,
  type HistogramData,
  type LineData,
  type UTCTimestamp,
} from "lightweight-charts";

export type KLinePoint = {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type KLineOverlayLine = {
  name?: string;
  color: string;
  lineWidth?: number;
  data: { time: UTCTimestamp; value: number }[];
};

export type KLineOverlayLevel = {
  title: string;
  value: number;
  color: string;
  lineStyle?: "solid" | "dashed" | "dotted";
};

export function KLineVolumeChart({
  data,
  height = 320,
  overlayLines = [],
  overlayLevels = [],
}: {
  data: KLinePoint[];
  height?: number;
  overlayLines?: KLineOverlayLine[];
  overlayLevels?: KLineOverlayLevel[];
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleRef = useRef<any>(null);
  const volumeRef = useRef<any>(null);
  const overlaySeriesRef = useRef<any[]>([]);
  const priceLinesRef = useRef<any[]>([]);

  useEffect(() => {
    if (!containerRef.current || chartRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#ffffff" },
        textColor: "#64748b",
      },
      width: containerRef.current.clientWidth,
      height,
      grid: {
        vertLines: { color: "#e2e8f0" },
        horzLines: { color: "#e2e8f0" },
      },
      rightPriceScale: {
        borderColor: "#cbd5e1",
        scaleMargins: { top: 0.1, bottom: 0.28 },
      },
      timeScale: {
        borderColor: "#cbd5e1",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candles = chart.addSeries(CandlestickSeries, {
      upColor: "#16a34a",
      downColor: "#dc2626",
      borderUpColor: "#16a34a",
      borderDownColor: "#dc2626",
      wickUpColor: "#16a34a",
      wickDownColor: "#dc2626",
      priceLineVisible: false,
    });

    const volumes = chart.addSeries(HistogramSeries, {
      priceScaleId: "",
      priceLineVisible: false,
      lastValueVisible: false,
      base: 0,
    });

    chart.priceScale("").applyOptions({
      scaleMargins: { top: 0.75, bottom: 0 },
    });

    chartRef.current = chart;
    candleRef.current = candles;
    volumeRef.current = volumes;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry || !chartRef.current) return;
      chartRef.current.applyOptions({ width: entry.contentRect.width, height });
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      candleRef.current = null;
      volumeRef.current = null;
      overlaySeriesRef.current = [];
      priceLinesRef.current = [];
    };
  }, [height]);

  useEffect(() => {
    if (!candleRef.current || !volumeRef.current || !chartRef.current) return;
    const candleData: CandlestickData[] = data.map((item) => ({
      time: item.time,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    }));
    const volumeData: HistogramData[] = data.map((item) => ({
      time: item.time,
      value: item.volume,
      color: item.close >= item.open ? "#16a34a88" : "#dc262688",
    }));

    candleRef.current.setData(candleData);
    volumeRef.current.setData(volumeData);

    overlaySeriesRef.current.forEach((series) => {
      chartRef.current?.removeSeries(series);
    });
    overlaySeriesRef.current = [];
    overlayLines.forEach((line) => {
      const lineSeries = chartRef.current?.addSeries(LineSeries, {
        color: line.color,
        lineWidth: line.lineWidth ?? 2,
        priceLineVisible: false,
        lastValueVisible: true,
        title: line.name,
      });
      if (!lineSeries) return;
      const lineData: LineData[] = line.data.map((point) => ({ time: point.time, value: point.value }));
      lineSeries.setData(lineData);
      overlaySeriesRef.current.push(lineSeries);
    });

    priceLinesRef.current.forEach((priceLine) => {
      candleRef.current.removePriceLine(priceLine);
    });
    priceLinesRef.current = overlayLevels.map((level) =>
      candleRef.current.createPriceLine({
        price: level.value,
        color: level.color,
        lineWidth: 2,
        lineStyle:
          level.lineStyle === "solid"
            ? LineStyle.Solid
            : level.lineStyle === "dotted"
              ? LineStyle.Dotted
              : LineStyle.Dashed,
        axisLabelVisible: true,
        title: level.title,
      })
    );

    chartRef.current.timeScale().fitContent();
  }, [data, overlayLines, overlayLevels]);

  return <div ref={containerRef} className="w-full" />;
}

