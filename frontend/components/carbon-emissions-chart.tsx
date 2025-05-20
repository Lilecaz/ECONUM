"use client"

import { useEffect, useRef } from "react"

interface CarbonEmissionsChartProps {
    timestamps: string[]
    emissions: number[]
}

export function CarbonEmissionsChart({ timestamps, emissions }: CarbonEmissionsChartProps) {
    const chartRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!chartRef.current) return

        // Import dynamique de Plotly uniquement côté client
        import("plotly.js-dist-min").then((Plotly) => {
            const trace = {
                x: timestamps,
                y: emissions,
                type: "scatter",
                mode: "lines+markers",
                name: "Émissions de CO₂",
                line: {
                    color: "rgb(34, 197, 94)",
                    width: 3,
                },
                marker: {
                    color: "rgb(34, 197, 94)",
                    size: 6,
                },
                fill: "tozeroy",
                fillcolor: "rgba(34, 197, 94, 0.2)",
            }

            const layout = {
                title: {
                    text: "Émissions de CO₂ cumulées",
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
                        text: "Émissions (kg CO₂)",
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
                modeBarButtonsToRemove: ["lasso2d", "select2d"] as any,
                displaylogo: false,
                toImageButtonOptions: {
                    format: "png" as "png",
                    filename: "carbon_emissions",
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
    }, [timestamps, emissions])

    return <div ref={chartRef} className="w-full h-full" />
}
