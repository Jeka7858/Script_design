"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, BarChart3, TrendingUp, Users, Clock, Download } from "lucide-react"
import Link from "next/link"

interface CallResult {
  id: string
  scenarioId: string
  result: "success" | "rejection" | "postponed" | "other"
  notes: string
  stepHistory: string[]
  duration: number
  timestamp: string
}

interface ScenarioStats {
  total: number
  success: number
  rejection: number
  postponed: number
  other: number
}

interface Scenario {
  id: string
  name: string
  description: string
  steps: any[]
}

export default function ScenarioStatsPage() {
  const params = useParams()
  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [stats, setStats] = useState<ScenarioStats | null>(null)
  const [callResults, setCallResults] = useState<CallResult[]>([])

  useEffect(() => {
    // Загружаем сценарий
    const savedScenarios = localStorage.getItem("call-scenarios")
    if (savedScenarios) {
      const scenarios = JSON.parse(savedScenarios)
      const foundScenario = scenarios.find((s: Scenario) => s.id === params.id)
      setScenario(foundScenario)
    }

    // Загружаем статистику
    const savedStats = localStorage.getItem("scenario-stats")
    if (savedStats) {
      const allStats = JSON.parse(savedStats)
      setStats(
        allStats[params.id as string] || {
          total: 0,
          success: 0,
          rejection: 0,
          postponed: 0,
          other: 0,
        },
      )
    }

    // Загружаем результаты звонков
    const savedResults = localStorage.getItem("call-results")
    if (savedResults) {
      const allResults = JSON.parse(savedResults)
      const scenarioResults = allResults.filter((r: CallResult) => r.scenarioId === params.id)
      setCallResults(scenarioResults)
    }
  }, [params.id])

  const getSuccessRate = () => {
    if (!stats || stats.total === 0) return 0
    return Math.round((stats.success / stats.total) * 100)
  }

  const getAverageDuration = () => {
    if (callResults.length === 0) return 0
    const totalDuration = callResults.reduce((sum, result) => sum + result.duration, 0)
    return Math.round(totalDuration / callResults.length / 1000 / 60) // в минутах
  }

  const getResultColor = (result: string) => {
    switch (result) {
      case "success":
        return "bg-green-500"
      case "rejection":
        return "bg-red-500"
      case "postponed":
        return "bg-yellow-500"
      case "other":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getResultLabel = (result: string) => {
    switch (result) {
      case "success":
        return "Согласен"
      case "rejection":
        return "Отказ"
      case "postponed":
        return "Отложил"
      case "other":
        return "Другое"
      default:
        return result
    }
  }

  const exportStats = () => {
    const data = {
      scenario: scenario?.name,
      stats,
      results: callResults.map((r) => ({
        date: new Date(r.timestamp).toLocaleDateString("ru-RU"),
        time: new Date(r.timestamp).toLocaleTimeString("ru-RU"),
        result: getResultLabel(r.result),
        duration: Math.round(r.duration / 1000 / 60),
        notes: r.notes,
      })),
    }

    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `stats-${scenario?.name}-${new Date().toISOString().split("T")[0]}.json`
    link.click()
  }

  if (!scenario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка статистики...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href={`/scenarios/${scenario.id}`}>
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Статистика сценария</h1>
              <p className="text-gray-600">{scenario.name}</p>
            </div>
          </div>
          <Button onClick={exportStats} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Экспорт
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Всего звонков</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Успешных</p>
                  <p className="text-2xl font-bold text-green-600">{stats?.success || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Конверсия</p>
                  <p className="text-2xl font-bold text-blue-600">{getSuccessRate()}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Среднее время</p>
                  <p className="text-2xl font-bold text-purple-600">{getAverageDuration()} мин</p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Distribution */}
        {stats && stats.total > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Распределение результатов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { key: "success", label: "Согласен", value: stats.success },
                  { key: "rejection", label: "Отказ", value: stats.rejection },
                  { key: "postponed", label: "Отложил", value: stats.postponed },
                  { key: "other", label: "Другое", value: stats.other },
                ].map(({ key, label, value }) => (
                  <div key={key} className="flex items-center gap-4">
                    <div className="w-24 text-sm font-medium">{label}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                      <div
                        className={`h-4 rounded-full ${getResultColor(key)}`}
                        style={{ width: `${(value / stats.total) * 100}%` }}
                      />
                    </div>
                    <div className="w-16 text-sm text-gray-600 text-right">
                      {value} ({Math.round((value / stats.total) * 100)}%)
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Calls */}
        <Card>
          <CardHeader>
            <CardTitle>История звонков</CardTitle>
            <CardDescription>Последние результаты по этому сценарию</CardDescription>
          </CardHeader>
          <CardContent>
            {callResults.length > 0 ? (
              <div className="space-y-4">
                {callResults
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .slice(0, 10)
                  .map((result) => (
                    <div key={result.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getResultColor(result.result)}>{getResultLabel(result.result)}</Badge>
                          <span className="text-sm text-gray-500">
                            {new Date(result.timestamp).toLocaleString("ru-RU")}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">{Math.round(result.duration / 1000 / 60)} мин</span>
                      </div>
                      {result.notes && (
                        <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">{result.notes}</div>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Пока нет данных о звонках</p>
                <p className="text-sm">Начните использовать сценарий для сбора статистики</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
