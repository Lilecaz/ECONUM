"use client"

import { useEffect, useRef } from "react"
import { Chart, registerables } from "chart.js"

Chart.register(...registerables)

interface TemperatureChartProps {
  timestamps: string[]
  temperatures: number[]
}

export function TemperatureChart({ timestamps, temperatures }: TemperatureChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Détruire le graphique existant s'il y en a un
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext("2d")
    if (!ctx) return

    // Déterminer les couleurs en fonction des températures
    const getGradientColor = (ctx: CanvasRenderingContext2D) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, 400)
      gradient.addColorStop(0, "rgba(234, 88, 12, 0.8)")
      gradient.addColorStop(1, "rgba(234, 88, 12, 0.1)")
      return gradient
    }

    // Créer un nouveau graphique
    chartInstance.current = new Chart(ctx, {
      type: "line",
      data: {
        labels: timestamps,
        datasets: [
          {
            label: "Température du câble (°C)",
            data: temperatures,
            borderColor: "rgb(234, 88, 12)",
            backgroundColor: getGradientColor(ctx),
            borderWidth: 2,
            pointRadius: 3,
            pointBackgroundColor: "rgb(234, 88, 12)",
            pointBorderColor: "#fff",
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "rgb(234, 88, 12)",
            pointHoverBorderColor: "#fff",
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "top",
          },
          tooltip: {
            mode: "index",
            intersect: false,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            titleColor: "#fff",
            bodyColor: "#fff",
            borderColor: "rgba(255, 255, 255, 0.2)",
            borderWidth: 1,
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 10,
            },
          },
          y: {
            beginAtZero: false,
            grid: {
              color: "rgba(0, 0, 0, 0.05)",
            },
            ticks: {
              callback: (value) => value + " °C",
            },
          },
        },
        interaction: {
          mode: "nearest",
          axis: "x",
          intersect: false,
        },
        animations: {
          tension: {
            duration: 1000,
            easing: "linear",
          },
        },
      },
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [timestamps, temperatures])

  return <canvas ref={chartRef} />
}
