"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react"
import Link from "next/link"

interface ScenarioStep {
  id: string
  title: string
  content: string
  options: {
    text: string
    nextStep: string
  }[]
}

interface Scenario {
  id: string
  name: string
  description: string
  webhookUrl?: string
  steps: ScenarioStep[]
  createdAt: string
}

export default function CreateScenarioPage() {
  const router = useRouter()
  const [scenario, setScenario] = useState<Scenario>({
    id: "",
    name: "",
    description: "",
    webhookUrl: "",
    steps: [
      {
        id: "step-1",
        title: "Первый шаг",
        content: "",
        options: [{ text: "", nextStep: "" }],
      },
    ],
    createdAt: new Date().toISOString(),
  })

  const updateScenario = (field: keyof Scenario, value: any) => {
    setScenario((prev) => ({ ...prev, [field]: value }))
  }

  const updateStep = (stepIndex: number, field: keyof ScenarioStep, value: any) => {
    const updatedSteps = [...scenario.steps]
    updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], [field]: value }
    setScenario((prev) => ({ ...prev, steps: updatedSteps }))
  }

  const addStep = () => {
    const newStep: ScenarioStep = {
      id: `step-${Date.now()}`, // Используем timestamp для уникальности
      title: `Шаг ${scenario.steps.length + 1}`,
      content: "",
      options: [{ text: "", nextStep: "" }],
    }
    setScenario((prev) => ({ ...prev, steps: [...prev.steps, newStep] }))
  }

  const removeStep = (stepIndex: number) => {
    if (scenario.steps.length > 1) {
      const updatedSteps = scenario.steps.filter((_, index) => index !== stepIndex)
      setScenario((prev) => ({ ...prev, steps: updatedSteps }))
    }
  }

  const addOption = (stepIndex: number) => {
    const updatedSteps = [...scenario.steps]
    updatedSteps[stepIndex].options.push({ text: "", nextStep: "" })
    setScenario((prev) => ({ ...prev, steps: updatedSteps }))
  }

  const updateOption = (stepIndex: number, optionIndex: number, field: "text" | "nextStep", value: string) => {
    const updatedSteps = [...scenario.steps]
    updatedSteps[stepIndex].options[optionIndex][field] = value
    setScenario((prev) => ({ ...prev, steps: updatedSteps }))
  }

  const removeOption = (stepIndex: number, optionIndex: number) => {
    const updatedSteps = [...scenario.steps]
    if (updatedSteps[stepIndex].options.length > 1) {
      updatedSteps[stepIndex].options.splice(optionIndex, 1)
      setScenario((prev) => ({ ...prev, steps: updatedSteps }))
    }
  }

  const saveScenario = () => {
    if (!scenario.name.trim()) {
      alert("Введите название сценария")
      return
    }

    const scenarioId = scenario.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
    const finalScenario = { ...scenario, id: scenarioId }

    const savedScenarios = localStorage.getItem("call-scenarios")
    const scenarios = savedScenarios ? JSON.parse(savedScenarios) : []
    scenarios.push(finalScenario)
    localStorage.setItem("call-scenarios", JSON.stringify(scenarios))

    router.push("/")
  }

  const getAvailableSteps = () => {
    return scenario.steps.map((step) => ({ id: step.id, title: step.title }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/scenarios/manage">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Создание сценария</h1>
              <p className="text-gray-600">Настройте новый сценарий для телефонных звонков</p>
            </div>
          </div>
          <Button onClick={saveScenario} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Сохранить сценарий
          </Button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Основная информация</CardTitle>
              <CardDescription>Укажите название и описание сценария</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Название сценария</Label>
                <Input
                  id="name"
                  value={scenario.name}
                  onChange={(e) => updateScenario("name", e.target.value)}
                  placeholder="Например: Продажа услуг"
                />
              </div>
              <div>
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  value={scenario.description}
                  onChange={(e) => updateScenario("description", e.target.value)}
                  placeholder="Краткое описание сценария"
                />
              </div>
              <div>
                <Label htmlFor="webhook">URL Webhook (опционально)</Label>
                <Input
                  id="webhook"
                  value={scenario.webhookUrl}
                  onChange={(e) => updateScenario("webhookUrl", e.target.value)}
                  placeholder="https://api.example.com/webhook"
                />
              </div>
            </CardContent>
          </Card>

          {/* Steps */}
          {scenario.steps.map((step, stepIndex) => (
            <Card key={step.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Шаг {stepIndex + 1}</CardTitle>
                    <CardDescription>ID: {step.id}</CardDescription>
                  </div>
                  {scenario.steps.length > 1 && (
                    <Button variant="outline" size="sm" onClick={() => removeStep(stepIndex)} className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Название шага</Label>
                  <Input
                    value={step.title}
                    onChange={(e) => updateStep(stepIndex, "title", e.target.value)}
                    placeholder="Название шага"
                  />
                </div>
                <div>
                  <Label>Текст для произнесения</Label>
                  <Textarea
                    value={step.content}
                    onChange={(e) => updateStep(stepIndex, "content", e.target.value)}
                    placeholder="Что нужно сказать клиенту на этом шаге"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Варианты ответов клиента</Label>
                  <div className="space-y-3 mt-2">
                    {step.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Input
                            value={option.text}
                            onChange={(e) => updateOption(stepIndex, optionIndex, "text", e.target.value)}
                            placeholder="Вариант ответа клиента"
                          />
                        </div>
                        <div className="flex-1">
                          <select
                            value={option.nextStep}
                            onChange={(e) => updateOption(stepIndex, optionIndex, "nextStep", e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          >
                            <option value="">Следующий шаг</option>
                            {getAvailableSteps().map((availableStep) => (
                              <option key={availableStep.id} value={availableStep.id}>
                                {availableStep.title}
                              </option>
                            ))}
                            <option value="end">Завершить сценарий</option>
                          </select>
                        </div>
                        {step.options.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeOption(stepIndex, optionIndex)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => addOption(stepIndex)} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Добавить вариант ответа
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add Step Button */}
          <Card className="border-dashed border-2">
            <CardContent className="flex items-center justify-center py-8">
              <Button onClick={addStep} variant="ghost" className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Добавить новый шаг
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
