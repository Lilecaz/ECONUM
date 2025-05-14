"use client"

import { useEffect, useRef } from "react"

interface TemperatureGaugeProps {
  value: number
}

export function TemperatureGauge({ value }: TemperatureGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Définir les dimensions du canvas
    const width = canvas.width
    const height = canvas.height
    const radius = (Math.min(width, height) / 2) * 0.8
    const centerX = width / 2
    const centerY = height

    // Nettoyer le canvas
    ctx.clearRect(0, 0, width, height)

    // Dessiner l'arc de fond
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, Math.PI, 0, false)
    ctx.lineWidth = 20
    ctx.strokeStyle = "#e5e7eb"
    ctx.stroke()

    // Calculer l'angle pour la valeur actuelle (0-120°C)
    const maxTemp = 120
    const angle = Math.PI - (value / maxTemp) * Math.PI

    // Dessiner l'arc de valeur
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, Math.PI, angle, false)

    // Déterminer la couleur en fonction de la température
    let color
    if (value > 90) {
      color = "#ef4444" // Rouge pour danger
    } else if (value > 70) {
      color = "#f97316" // Orange pour avertissement
    } else {
      color = "#22c55e" // Vert pour sécurité
    }

    ctx.lineWidth = 20
    ctx.strokeStyle = color
    ctx.stroke()

    // Dessiner le texte de la valeur
    ctx.font = "bold 24px Arial"
    ctx.fillStyle = "#1f2937"
    ctx.textAlign = "center"
    ctx.fillText(`${value.toFixed(1)}°C`, centerX, centerY - radius / 2)

    // Dessiner les graduations
    const drawTick = (temp: number, length: number, width: number, text?: string) => {
      const tickAngle = Math.PI - (temp / maxTemp) * Math.PI
      const innerRadius = radius - 10
      const outerRadius = innerRadius - length

      // Ligne de graduation
      ctx.beginPath()
      ctx.moveTo(centerX + innerRadius * Math.cos(tickAngle), centerY + innerRadius * Math.sin(tickAngle))
      ctx.lineTo(centerX + outerRadius * Math.cos(tickAngle), centerY + outerRadius * Math.sin(tickAngle))
      ctx.lineWidth = width
      ctx.strokeStyle = "#6b7280"
      ctx.stroke()

      // Texte de graduation
      if (text) {
        const textRadius = outerRadius - 15
        ctx.font = "12px Arial"
        ctx.fillStyle = "#6b7280"
        ctx.textAlign = "center"
        ctx.fillText(text, centerX + textRadius * Math.cos(tickAngle), centerY + textRadius * Math.sin(tickAngle))
      }
    }

    // Dessiner les graduations principales
    for (let temp = 0; temp <= maxTemp; temp += 30) {
      drawTick(temp, 15, 2, `${temp}°`)
    }

    // Dessiner les graduations secondaires
    for (let temp = 15; temp < maxTemp; temp += 30) {
      drawTick(temp, 10, 1)
    }
  }, [value])

  return (
    <div className="flex justify-center">
      <canvas ref={canvasRef} width={300} height={150} />
    </div>
  )
}
