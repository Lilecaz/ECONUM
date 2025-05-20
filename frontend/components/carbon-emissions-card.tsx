import { Leaf } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface CarbonEmissionsCardProps {
    emissionsKg: number
    note?: string
}

export function CarbonEmissionsCard({ emissionsKg, note }: CarbonEmissionsCardProps) {
    // Fonction pour déterminer le niveau d'impact environnemental
    const getImpactLevel = (emissions: number) => {
        if (emissions < 0.001) return { label: "Très faible", color: "bg-green-500", percentage: 20 }
        if (emissions < 0.01) return { label: "Faible", color: "bg-green-400", percentage: 40 }
        if (emissions < 0.1) return { label: "Modéré", color: "bg-yellow-400", percentage: 60 }
        if (emissions < 1) return { label: "Élevé", color: "bg-orange-500", percentage: 80 }
        return { label: "Très élevé", color: "bg-red-500", percentage: 100 }
    }

    const impact = getImpactLevel(emissionsKg)

    // Convertir en grammes si c'est moins de 1 kg avec 8 decimales
    const displayValue = emissionsKg < 1
        ? `${(emissionsKg * 1000).toFixed(6)} g`
        : `${emissionsKg.toFixed(4)} kg`


    // Équivalences pour contextualiser
    const getEquivalent = (emissions: number) => {
        if (emissions < 0.001) return "Équivalent à quelques secondes d'utilisation d'un smartphone"
        if (emissions < 0.01) return "Équivalent à l'envoi de quelques emails"
        if (emissions < 0.1) return "Équivalent à la charge d'un smartphone"
        if (emissions < 1) return "Équivalent à 1 km en voiture électrique"
        return "Équivalent à plusieurs km en voiture"
    }

    return (
        <Card className="mb-4 border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Leaf className="h-5 w-5 text-green-500 mr-2" />
                        <CardTitle className="text-lg">Empreinte Carbone</CardTitle>
                    </div>
                    <span className="text-sm bg-green-100 text-green-800 py-1 px-2 rounded-full">
                        Impact {impact.label}
                    </span>
                </div>
                <CardDescription>
                    Estimation des émissions de CO₂ pour ce calcul
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="font-medium text-lg">{displayValue} CO₂</span>
                        <span className="text-sm text-gray-500">{getEquivalent(emissionsKg)}</span>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                            <span>Faible impact</span>
                            <span>Impact élevé</span>
                        </div>
                        <Progress value={impact.percentage} className="h-2" indicatorClassName={impact.color} />
                    </div>

                    {note && (
                        <p className="text-xs text-gray-500 italic mt-2">
                            {note}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
