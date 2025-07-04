"use client"

import { useState, useEffect } from "react"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Edit, Trash2, Upload, Download } from "lucide-react"
import Link from "next/link"

interface Scenario {
  id: string
  name: string
  description: string
  webhookUrl?: string
  steps: any[]
  createdAt: string
  lastUsed?: string
}

export default function ManageScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    const savedScenarios = localStorage.getItem("call-scenarios")
    if (savedScenarios) {
      setScenarios(JSON.parse(savedScenarios))
    }
  }, [])

  const filteredScenarios = scenarios.filter(
    (scenario) =>
      scenario.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scenario.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const deleteScenario = (id: string) => {
    if (confirm("Вы уверены, что хотите удалить этот сценарий?")) {
      const updatedScenarios = scenarios.filter((s) => s.id !== id)
      setScenarios(updatedScenarios)
      localStorage.setItem("call-scenarios", JSON.stringify(updatedScenarios))
    }
  }

  const exportScenarios = () => {
    const dataStr = JSON.stringify(scenarios, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "call-scenarios.json"
    link.click()
  }

  const importScenarios = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedScenarios = JSON.parse(e.target?.result as string)
          const updatedScenarios = [...scenarios, ...importedScenarios]
          setScenarios(updatedScenarios)
          localStorage.setItem("call-scenarios", JSON.stringify(updatedScenarios))
          alert("Сценарии успешно импортированы!")
        } catch (error) {
          alert("Ошибка при импорте файла. Проверьте формат JSON.")
        }
      }
      reader.readAsText(file)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Управление сценариями</h1>
              <p className="text-gray-600">Создавайте, редактируйте и управляйте вашими сценариями</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportScenarios} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Экспорт
            </Button>
            <label>
              <Button variant="outline" className="cursor-pointer bg-transparent">
                <Upload className="h-4 w-4 mr-2" />
                Импорт
              </Button>
              <input type="file" accept=".json" onChange={importScenarios} className="hidden" />
            </label>
            <Link href="/scenarios/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Создать сценарий
              </Button>
            </Link>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Поиск сценариев..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Scenarios List */}
        <div className="space-y-4">
          {filteredScenarios.map((scenario) => (
            <Card key={scenario.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{scenario.name}</CardTitle>
                    <CardDescription className="mt-1">{scenario.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{scenario.steps.length} шагов</Badge>
                    {scenario.webhookUrl && <Badge variant="outline">Webhook</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    <div>Создан: {formatDate(scenario.createdAt)}</div>
                    {scenario.lastUsed && <div>Последний раз: {formatDate(scenario.lastUsed)}</div>}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/scenarios/${scenario.id}`}>
                      <Button variant="outline" size="sm">
                        Запустить
                      </Button>
                    </Link>
                    <Link href={`/scenarios/visual-editor/${scenario.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteScenario(scenario.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredScenarios.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">{searchTerm ? "Сценарии не найдены" : "Нет созданных сценариев"}</div>
            {!searchTerm && (
              <Link href="/scenarios/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Создать первый сценарий
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
