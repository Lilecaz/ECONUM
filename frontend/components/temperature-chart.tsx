"use client"

import { useEffect, useRef } from "react"

interface TemperatureChartProps {
  timestamps: string[]
  temperatures: number[]
}

export function TemperatureChart({ timestamps, temperatures }: TemperatureChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Import dynamique de Plotly uniquement côté client
    import("plotly.js-dist-min").then((Plotly) => {
      const trace = {
        x: timestamps,
        y: temperatures,
        type: "scatter",
        mode: "lines+markers",
        name: "Température du câble",
        line: {
          color: "rgb(234, 88, 12)",
          width: 3,
        },
        marker: {
          color: "rgb(234, 88, 12)",
          size: 6,
        },
        fill: "tozeroy",
        fillcolor: "rgba(234, 88, 12, 0.2)",
      }

      const layout = {
        title: {
          text: "Évolution de la température du câble",
          font: {
            family: "Inter, sans-serif",
            size: 18,
          },
        },
        autosize: true,
        height: 300,
        margin: { l: 50, r: 30, t: 50, b: 50 },
        xaxis: {
          title: {
            text: "Temps (minutes)",
            font: {
              family: "Inter, sans-serif",
              size: 14,
            },
          },
          gridcolor: "rgba(0, 0, 0, 0.05)",
        },
        yaxis: {
          title: {
            text: "Température (°C)",
            font: {
              family: "Inter, sans-serif",
              size: 14,
            },
          },
          gridcolor: "rgba(0, 0, 0, 0.1)",
        },
        plot_bgcolor: "rgba(0, 0, 0, 0)",
        paper_bgcolor: "rgba(0, 0, 0, 0)",
        hovermode: "closest" as const,
        hoverlabel: {
          bgcolor: "rgba(0, 0, 0, 0.8)",
          font: { color: "white" },
        },
      }

      const config = {
        responsive: true,
        displayModeBar: true,
        modeBarButtonsToRemove: ["lasso2d", "select2d"] as any, // Cast to any to satisfy type
        displaylogo: false,
        toImageButtonOptions: {
          format: "png" as "png",
          filename: "temperature_cable",
          height: 500,
          width: 700,
          scale: 2,
        },
      }

      Plotly.newPlot(chartRef.current!, [trace as any], layout, config)

      // Nettoyage
      return () => {
        if (chartRef.current) {
          Plotly.purge(chartRef.current)
        }
      }
    })
  }, [timestamps, temperatures])

  return <div ref={chartRef} className="w-full h-full" />
}
