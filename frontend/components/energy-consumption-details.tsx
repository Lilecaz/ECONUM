import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Cpu, Zap, MemoryStickIcon as Memory, Globe, Clock, Server } from "lucide-react"

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

interface EnergyConsumptionDetailsProps {
    data: CodeCarbonData
}

export function EnergyConsumptionDetails({ data }: EnergyConsumptionDetailsProps) {
    // Formater les valeurs pour l'affichage
    const formatValue = (value: number, unit: string, decimals = 6) => {
        // Convertir les valeurs scientifiques en format plus lisible
        if (value < 0.000001) {
            return `${(value * 1e9).toFixed(decimals)} n${unit}`
        } else if (value < 0.001) {
            return `${(value * 1e6).toFixed(decimals)} µ${unit}`
        } else if (value < 1) {
            return `${(value * 1e3).toFixed(decimals)} m${unit}`
        } else {
            return `${value.toFixed(decimals)} ${unit}`
        }
    }

    // Calculer le pourcentage de chaque source d'énergie
    const totalEnergy = data.cpu_energy + data.gpu_energy + data.ram_energy
    const cpuPercentage = (data.cpu_energy / totalEnergy) * 100
    const gpuPercentage = (data.gpu_energy / totalEnergy) * 100
    const ramPercentage = (data.ram_energy / totalEnergy) * 100

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 text-yellow-500 mr-2" />
                    Détails de la Consommation Énergétique
                </CardTitle>
                <CardDescription>Mesures détaillées de l'impact énergétique du calcul</CardDescription>
            </CardHeader>
            <CardContent>
                <Tabs defaultValue="summary">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="summary">Résumé</TabsTrigger>
                        <TabsTrigger value="energy">Énergie</TabsTrigger>
                        <TabsTrigger value="hardware">Matériel</TabsTrigger>
                    </TabsList>

                    <TabsContent value="summary" className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-500 rounded-lg p-3">
                                <div className="flex items-center mb-1">
                                    <Clock className="h-4 w-4  mr-1" />
                                    <p className="text-sm ">Durée</p>
                                </div>
                                <p className="text-lg font-semibold">{data.duration.toFixed(2)} s</p>
                            </div>
                            <div className="bg-gray-500 rounded-lg p-3">
                                <div className="flex items-center mb-1">
                                    <Globe className="h-4 w-4  mr-1" />
                                    <p className="text-sm ">Émissions CO₂</p>
                                </div>
                                <p className="text-lg font-semibold">{formatValue(data.emissions, "kg")}</p>
                            </div>
                        </div>

                        <div className="bg-gray-500 rounded-lg p-4">
                            <h3 className="text-sm font-medium mb-2">Répartition de la consommation</h3>
                            <div className="space-y-2">
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span>CPU ({cpuPercentage.toFixed(1)}%)</span>
                                        <span>{formatValue(data.cpu_energy, "kWh")}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${cpuPercentage}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span>GPU ({gpuPercentage.toFixed(1)}%)</span>
                                        <span>{formatValue(data.gpu_energy, "kWh")}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${gpuPercentage}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span>RAM ({ramPercentage.toFixed(1)}%)</span>
                                        <span>{formatValue(data.ram_energy, "kWh")}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${ramPercentage}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-500 rounded-lg p-4">
                            <h3 className="text-sm font-medium mb-2">Localisation</h3>
                            <p className="text-sm">
                                {data.country_name} ({data.country_iso_code})
                            </p>
                            <p className="text-xs mt-1">
                                Lat: {data.latitude}, Long: {data.longitude}
                            </p>
                        </div>
                    </TabsContent>

                    <TabsContent value="energy" className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-500 rounded-lg p-3">
                                <p className="text-sm ">Énergie totale consommée</p>
                                <p className="text-lg font-semibold">{formatValue(data.energy_consumed, "kWh")}</p>
                            </div>
                            <div className="bg-gray-500 rounded-lg p-3">
                                <p className="text-sm ">Taux d'émission</p>
                                <p className="text-lg font-semibold">{formatValue(data.emissions_rate, "kg/s")}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-gray-500 rounded-lg p-3">
                                <div className="flex items-center mb-1">
                                    <Cpu className="h-4 w-4 text-blue-500 mr-1" />
                                    <p className="text-sm ">Puissance CPU</p>
                                </div>
                                <p className="text-base font-semibold">{data.cpu_power.toFixed(2)} W</p>
                            </div>
                            <div className="bg-gray-500 rounded-lg p-3">
                                <div className="flex items-center mb-1">
                                    <Server className="h-4 w-4 text-purple-500 mr-1" />
                                    <p className="text-sm ">Puissance GPU</p>
                                </div>
                                <p className="text-base font-semibold">{data.gpu_power.toFixed(2)} W</p>
                            </div>
                            <div className="bg-gray-500 rounded-lg p-3">
                                <div className="flex items-center mb-1">
                                    <Memory className="h-4 w-4 text-green-500 mr-1" />
                                    <p className="text-sm ">Puissance RAM</p>
                                </div>
                                <p className="text-base font-semibold">{data.ram_power.toFixed(2)} W</p>
                            </div>
                        </div>

                        <div className="bg-gray-500 rounded-lg p-4">
                            <h3 className="text-sm font-medium mb-2">Facteur PUE</h3>
                            <p className="text-base font-semibold">{data.pue}</p>
                            <p className="text-xs  mt-1">
                                Power Usage Effectiveness - Mesure l'efficacité énergétique du centre de données
                            </p>
                        </div>
                    </TabsContent>

                    <TabsContent value="hardware" className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-100 rounded-lg p-3">
                                <p className="text-sm text-gray-500">CPU</p>
                                <p className="text-base font-semibold">{data.cpu_model} ({data.cpu_count} cœurs)</p>
                            </div>
                            <div className="bg-gray-100 rounded-lg p-3">
                                <p className="text-sm text-gray-500">GPU</p>
                                <p className="text-base font-semibold">
                                    {data.gpu_count > 0 ? `${data.gpu_model} (${data.gpu_count})` : "Aucun"}
                                </p>
                            </div>
                            <div className="bg-gray-100 rounded-lg p-3">
                                <p className="text-sm text-gray-500">RAM totale</p>
                                <p className="text-base font-semibold">{(data.ram_total_size / 1024).toFixed(1)} Go</p>
                            </div>
                            <div className="bg-gray-100 rounded-lg p-3">
                                <p className="text-sm text-gray-500">OS</p>
                                <p className="text-base font-semibold">{data.os}</p>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
