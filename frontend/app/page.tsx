"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, AlertTriangle, ThermometerSun } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TemperatureChart } from "@/components/temperature-chart"
import { CarbonEmissionsCard } from "@/components/carbon-emissions-card"

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

interface TemperatureData {
  code_carbon: CodeCarbonData
  temperatures: number[]
  execution_time_seconds: number
  timestamps: number[]
  carbon_emissions_kg: number | CodeCarbonData
  note?: string
}

export default function Home() {
  const [ambientTemp, setAmbientTemp] = useState("25.0")
  const [windSpeed, setWindSpeed] = useState("5.0")
  const [currentIntensity, setCurrentIntensity] = useState("100.0")
  const [initialTemp, setInitialTemp] = useState("25.0")
  const [method, setMethod] = useState("scipy")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<TemperatureData | null>(null)
  const [activeTab, setActiveTab] = useState("graph")

  const calculateTemperature = async () => {
    // Validation des entrées
    const ambientTempVal = Number.parseFloat(ambientTemp)
    const windSpeedVal = Number.parseFloat(windSpeed)
    const currentIntensityVal = Number.parseFloat(currentIntensity)
    const initialTempVal = Number.parseFloat(initialTemp)

    if (isNaN(ambientTempVal) || isNaN(windSpeedVal) || isNaN(currentIntensityVal) || isNaN(initialTempVal)) {
      setError("Veuillez entrer des valeurs numériques valides.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("http://localhost:8000/predict/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ambient_temperature: ambientTempVal,
          wind_speed: windSpeedVal,
          current_intensity: currentIntensityVal,
          initial_temp: initialTempVal,
          method: method,
        }),
      })

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`)
      }

      const responseData = await response.json()
      console.log("Données de la réponse:", responseData)

      // Traiter les données d'émissions de carbone
      const carbonData = responseData.carbon_emissions_kg

      // Si les données sont un objet, c'est probablement les données complètes de CodeCarbon
      if (typeof carbonData === "object" && carbonData !== null) {
        setData({
          ...responseData,
          carbon_emissions_kg: carbonData,
        })
      } else {
        // Sinon, créer un objet CodeCarbon simulé avec les données disponibles
        const simulatedCodeCarbonData: CodeCarbonData = {
          timestamp: new Date().toISOString(),
          project_name: "ECONUM",
          run_id: "0b3253a1-1807-4152-8193-5401ce598fa9",
          experiment_id: "5b0fa12a-3dd7-45bb-9766-cc326314d9f1",
          duration: responseData.execution_time_seconds,
          emissions: carbonData,
          emissions_rate: carbonData / responseData.execution_time_seconds,
          cpu_power: 0.63,
          gpu_power: 0.1,
          ram_power: 3.0,
          cpu_energy: 1.78e-10,
          gpu_energy: 4.73e-8,
          ram_energy: 7.31e-10,
          energy_consumed: 4.82e-8,
          country_name: "France",
          country_iso_code: "FRA",
          region: "",
          cloud_provider: "",
          cloud_region: "",
          os: "macOS-15.5-arm64-arm-64bit",
          python_version: "3.12.1",
          codecarbon_version: "3.0.1",
          cpu_count: 8,
          cpu_model: "Apple M2",
          gpu_count: 1,
          gpu_model: "Apple M2",
          longitude: 2.3387,
          latitude: 48.8582,
          ram_total_size: 8,
          tracking_mode: "machine",
          on_cloud: "N",
          pue: 1,
        }

        setData({
          ...responseData,
          carbon_emissions_kg: simulatedCodeCarbonData,
        })
      }
    } catch (err) {
      setError(`Erreur lors de la requête: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  const getMaxTemperature = () => {
    if (!data) return 0
    return Math.max(...data.temperatures)
  }

  const getTemperatureStatus = () => {
    const maxTemp = getMaxTemperature()
    if (maxTemp > 90) return "danger"
    if (maxTemp > 70) return "warning"
    return "safe"
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            <ThermometerSun className="inline-block mr-2 h-8 w-8 text-orange-500" />
            Prévision de Température de Câble
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            Simulez et analysez l'évolution de la température d'un câble électrique
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Paramètres</CardTitle>
              <CardDescription>Configurez les paramètres pour la simulation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ambient-temp">Température ambiante (°C)</Label>
                  <Input
                    id="ambient-temp"
                    type="number"
                    step="0.1"
                    value={ambientTemp}
                    onChange={(e) => setAmbientTemp(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wind-speed">Vitesse du vent (m/s)</Label>
                  <Input
                    id="wind-speed"
                    type="number"
                    step="0.1"
                    value={windSpeed}
                    onChange={(e) => setWindSpeed(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="current-intensity">Intensité du courant (A)</Label>
                  <Input
                    id="current-intensity"
                    type="number"
                    step="1"
                    value={currentIntensity}
                    onChange={(e) => setCurrentIntensity(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="initial-temp">Température initiale du câble (°C)</Label>
                  <Input
                    id="initial-temp"
                    type="number"
                    step="0.1"
                    value={initialTemp}
                    onChange={(e) => setInitialTemp(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calculation-method">Méthode de calcul</Label>
                  <Select value={method} onValueChange={setMethod}>
                    <SelectTrigger id="calculation-method">
                      <SelectValue placeholder="Sélectionnez une méthode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scipy">SciPy (Haute précision)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full" onClick={calculateTemperature} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Calcul en cours...
                    </>
                  ) : (
                    "Calculer la prédiction"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Résultats</CardTitle>
                  <CardDescription>Visualisation de l'évolution de la température</CardDescription>
                </div>
                {data && (
                  <Badge
                    variant={
                      getTemperatureStatus() === "danger"
                        ? "destructive"
                        : getTemperatureStatus() === "warning"
                          ? "secondary"
                          : "default"
                    }
                    className="ml-2"
                  >
                    {getMaxTemperature().toFixed(2)}°C Max
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Erreur</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {!data && !loading && !error && (
                <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500">
                  <ThermometerSun className="h-12 w-12 mb-4 text-gray-300" />
                  <p>Configurez les paramètres et lancez le calcul pour voir les résultats</p>
                </div>
              )}

              {data && (
                <>
                  <div className="mb-4 flex flex-wrap gap-4">
                    <div className="bg-gray-500 rounded-lg p-3 flex-1 text-center">
                      <p className="text-sm">Temps d'exécution</p>
                      <p className="text-lg font-semibold">{data.execution_time_seconds.toFixed(4)} s</p>
                    </div>
                    <div className="bg-gray-500 rounded-lg p-3 flex-1">
                      <p className="text-sm">Température maximale</p>
                      <p className="text-lg font-semibold">{getMaxTemperature().toFixed(2)} °C</p>
                    </div>
                    <div className="bg-gray-500 rounded-lg p-3 flex-1">
                      <p className="text-sm ">Température finale</p>
                      <p className="text-lg font-semibold">
                        {data.temperatures[data.temperatures.length - 1].toFixed(2)} °C
                      </p>
                    </div>
                  </div>

                  <CarbonEmissionsCard code_carbon_data={data.code_carbon} note={data.note} />

                  <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="graph">Graphique</TabsTrigger>
                      <TabsTrigger value="table">Tableau</TabsTrigger>
                    </TabsList>
                    <TabsContent value="graph" className="pt-4">
                      <div className="h-[300px]">
                        <TemperatureChart
                          timestamps={data.timestamps.map((t) => `${Math.floor(t / 60000)} ms`)}
                          temperatures={data.temperatures}
                        />
                      </div>
                    </TabsContent>
                    <TabsContent value="table" className="pt-4">
                      <div className="max-h-[300px] overflow-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Temps (ms)</TableHead>
                              <TableHead>Température (°C)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.temperatures.map((temp, index) => (
                              <TableRow key={index}>
                                <TableCell>{Math.floor(data.timestamps[index])}</TableCell>
                                <TableCell>{temp.toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TabsContent>
                  </Tabs>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
