import { Leaf, Info } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { EnergyConsumptionDetails } from "./energy-consumption-details"
interface CarbonEmissionsCardProps {
    code_carbon_data: any
    note?: string
    showDetails?: boolean
}


interface CodeCarbonData {
    timestamp: string
    project_name: string
    run_id: string
    experiment_id: string
    duration: number
    emissions: number
    emissions_rate: number
    cpu_power: number
    gpu_power: number
    ram_power: number
    cpu_energy: number
    gpu_energy: number
    ram_energy: number
    energy_consumed: number
    country_name: string
    country_iso_code: string
    region: string
    cloud_provider: string
    cloud_region: string
    os: string
    python_version: string
    codecarbon_version: string
    cpu_count: number
    cpu_model: string
    gpu_count: number
    gpu_model: string
    longitude: number
    latitude: number
    ram_total_size: number
    tracking_mode: string
    on_cloud: string
    pue: number
}



export function CarbonEmissionsCard({ code_carbon_data, note, showDetails = false }: CarbonEmissionsCardProps) {
    const [showEnergyDetails, setShowEnergyDetails] = useState(showDetails)
    const getImpactLevel = (emissions: number) => {
        if (emissions < 0.001) return { label: "Très faible", color: "bg-green-500", percentage: 20 }
        if (emissions < 0.01) return { label: "Faible", color: "bg-green-400", percentage: 40 }
        if (emissions < 0.1) return { label: "Modéré", color: "bg-yellow-400", percentage: 60 }
        if (emissions < 1) return { label: "Élevé", color: "bg-orange-500", percentage: 80 }
        return { label: "Très élevé", color: "bg-red-500", percentage: 100 }
    }
    const emissionsKg = code_carbon_data.emissions
    const impact = getImpactLevel(emissionsKg)

    // Convertir en grammes si c'est moins de 1 kg avec 8 decimales
    const displayValue = emissionsKg < 1
        ? `${(emissionsKg * 1000).toFixed(6)} g`
        : `${emissionsKg.toFixed(4)} kg`


    const formatEmissions = (value?: number) => {
        if (typeof value !== "number" || isNaN(value)) return "N/A"
        if (value < 0.000001) return `${(value * 1e9).toFixed(2)} ng`
        if (value < 0.001) return `${(value * 1e6).toFixed(2)} µg`
        if (value < 1) return `${(value * 1000).toFixed(2)} mg`
        return `${value.toFixed(4)} kg`
    }
    const emissions = formatEmissions(code_carbon_data.emissions)
    // Équivalences pour contextualiser
    const getEquivalent = (emissions: number) => {
        if (emissions < 0.001) return "Équivalent à quelques secondes d'utilisation d'un smartphone"
        if (emissions < 0.01) return "Équivalent à l'envoi de quelques emails"
        if (emissions < 0.1) return "Équivalent à la charge d'un smartphone"
        if (emissions < 1) return "Équivalent à 1 km en voiture électrique"
        return "Équivalent à plusieurs km en voiture"
    }

    return (
        <>
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
                            <span className="font-medium text-lg">{formatEmissions(emissionsKg)} CO₂</span>
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

                        {code_carbon_data && (
                            <div className="flex justify-between items-center mt-4">
                                <div className="text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <Info className="h-4 w-4 mr-1" />
                                        <span>Mesuré avec CodeCarbon v{code_carbon_data.codecarbon_version}</span>
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" onClick={() => setShowEnergyDetails(!showEnergyDetails)}>
                                    {showEnergyDetails ? "Masquer les détails" : "Voir les détails"}
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card >
            {showEnergyDetails && code_carbon_data && <EnergyConsumptionDetails data={code_carbon_data} /> /* Afficher les détails de la consommation d'énergie */}
        </>
    )
}
