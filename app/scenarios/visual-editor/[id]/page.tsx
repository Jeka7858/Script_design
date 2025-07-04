"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Play,
  GripVertical,
  Edit3,
  Check,
  X,
  ArrowRight,
  MessageSquare,
  Copy,
  Eye,
} from "lucide-react"
import Link from "next/link"

interface ScenarioStep {
  id: string
  title: string
  content: string
  options: {
    text: string
    nextStep: string
  }[]
  order: number
}

interface Scenario {
  id: string
  name: string
  description: string
  webhookUrl?: string
  steps: ScenarioStep[]
  createdAt: string
}

export default function TableEditorPage() {
  const params = useParams()
  const router = useRouter()
  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [editingStep, setEditingStep] = useState<string | null>(null)
  const [editingOption, setEditingOption] = useState<{ stepId: string; optionIndex: number } | null>(null)
  const [draggedStep, setDraggedStep] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState(false)

  useEffect(() => {
    const savedScenarios = localStorage.getItem("call-scenarios")
    if (savedScenarios) {
      const scenarios = JSON.parse(savedScenarios)
      const foundScenario = scenarios.find((s: Scenario) => s.id === params.id)

      if (foundScenario) {
        // Добавляем порядок для шагов, если его нет
        const stepsWithOrder = foundScenario.steps
          .map((step: ScenarioStep, index: number) => ({
            ...step,
            order: step.order !== undefined ? step.order : index,
          }))
          .sort((a, b) => a.order - b.order)

        setScenario({ ...foundScenario, steps: stepsWithOrder })
      }
    }
  }, [params.id])

  const saveScenario = () => {
    if (!scenario) return

    const savedScenarios = localStorage.getItem("call-scenarios")
    const scenarios = savedScenarios ? JSON.parse(savedScenarios) : []
    const updatedScenarios = scenarios.map((s: Scenario) => (s.id === scenario.id ? scenario : s))
    localStorage.setItem("call-scenarios", JSON.stringify(updatedScenarios))

    alert("Сценарий сохранен!")
  }

  const addNewStep = () => {
    if (!scenario) return

    const newStep: ScenarioStep = {
      id: `step-${Date.now()}`,
      title: `Новый шаг ${scenario.steps.length + 1}`,
      content: "",
      options: [{ text: "Продолжить", nextStep: "" }],
      order: scenario.steps.length,
    }

    setScenario({
      ...scenario,
      steps: [...scenario.steps, newStep],
    })
  }

  const updateStep = (stepId: string, updates: Partial<ScenarioStep>) => {
    if (!scenario) return

    setScenario({
      ...scenario,
      steps: scenario.steps.map((step) => (step.id === stepId ? { ...step, ...updates } : step)),
    })
  }

  const deleteStep = (stepId: string) => {
    if (!scenario) return
    if (!confirm("Удалить этот шаг?")) return

    setScenario({
      ...scenario,
      steps: scenario.steps.filter((step) => step.id !== stepId),
    })
  }

  const duplicateStep = (stepId: string) => {
    if (!scenario) return

    const stepToDuplicate = scenario.steps.find((s) => s.id === stepId)
    if (!stepToDuplicate) return

    const newStep: ScenarioStep = {
      ...stepToDuplicate,
      id: `step-${Date.now()}`,
      title: `${stepToDuplicate.title} (копия)`,
      order: scenario.steps.length,
    }

    setScenario({
      ...scenario,
      steps: [...scenario.steps, newStep],
    })
  }

  const moveStep = (fromIndex: number, toIndex: number) => {
    if (!scenario) return

    const newSteps = [...scenario.steps]
    const [movedStep] = newSteps.splice(fromIndex, 1)
    newSteps.splice(toIndex, 0, movedStep)

    // Обновляем порядок
    const updatedSteps = newSteps.map((step, index) => ({
      ...step,
      order: index,
    }))

    setScenario({
      ...scenario,
      steps: updatedSteps,
    })
  }

  const addOption = (stepId: string) => {
    const step = scenario?.steps.find((s) => s.id === stepId)
    if (!step) return

    const newOptions = [...step.options, { text: "", nextStep: "" }]
    updateStep(stepId, { options: newOptions })
  }

  const updateOption = (stepId: string, optionIndex: number, field: "text" | "nextStep", value: string) => {
    const step = scenario?.steps.find((s) => s.id === stepId)
    if (!step) return

    const newOptions = [...step.options]
    newOptions[optionIndex][field] = value
    updateStep(stepId, { options: newOptions })
  }

  const removeOption = (stepId: string, optionIndex: number) => {
    const step = scenario?.steps.find((s) => s.id === stepId)
    if (!step || step.options.length <= 1) return

    const newOptions = step.options.filter((_, i) => i !== optionIndex)
    updateStep(stepId, { options: newOptions })
  }

  const getStepByNextStep = (nextStepId: string) => {
    return scenario?.steps.find((s) => s.id === nextStepId)
  }

  const getStepConnections = (stepId: string) => {
    if (!scenario) return { incoming: [], outgoing: [] }

    const incoming = scenario.steps.filter((step) => step.options.some((option) => option.nextStep === stepId))

    const currentStep = scenario.steps.find((s) => s.id === stepId)
    const outgoing =
      currentStep?.options.map((option) => scenario.steps.find((s) => s.id === option.nextStep)).filter(Boolean) || []

    return { incoming, outgoing }
  }

  if (!scenario) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка редактора...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/scenarios/manage">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{scenario.name}</h1>
              <p className="text-sm text-gray-500">{scenario.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
              <Eye className="h-4 w-4 mr-2" />
              {previewMode ? "Редактор" : "Предпросмотр"}
            </Button>

            <Button variant="outline" size="sm" onClick={saveScenario}>
              <Save className="h-4 w-4 mr-2" />
              Сохранить
            </Button>

            <Link href={`/scenarios/${scenario.id}`}>
              <Button size="sm">
                <Play className="h-4 w-4 mr-2" />
                Тестировать
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Scenario Info */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Информация о сценарии</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="scenario-name">Название</Label>
                <Input
                  id="scenario-name"
                  value={scenario.name}
                  onChange={(e) => setScenario({ ...scenario, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="scenario-description">Описание</Label>
                <Input
                  id="scenario-description"
                  value={scenario.description}
                  onChange={(e) => setScenario({ ...scenario, description: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="scenario-webhook">Webhook URL</Label>
                <Input
                  id="scenario-webhook"
                  value={scenario.webhookUrl || ""}
                  onChange={(e) => setScenario({ ...scenario, webhookUrl: e.target.value })}
                  placeholder="https://api.example.com/webhook"
                />
              </div>
            </CardContent>
          </Card>

          {/* Steps Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Шаги сценария</CardTitle>
                <Button onClick={addNewStep} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Добавить шаг
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="w-8 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      <th className="w-12 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Порядок
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Название шага
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Содержимое
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Варианты ответов
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Связи
                      </th>
                      <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Действия
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {scenario.steps.map((step, index) => {
                      const connections = getStepConnections(step.id)
                      const isEditing = editingStep === step.id

                      return (
                        <tr
                          key={step.id}
                          className={`hover:bg-gray-50 transition-colors ${
                            draggedStep === step.id ? "bg-blue-50" : ""
                          }`}
                          draggable
                          onDragStart={() => setDraggedStep(step.id)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault()
                            if (draggedStep) {
                              const fromIndex = scenario.steps.findIndex((s) => s.id === draggedStep)
                              moveStep(fromIndex, index)
                              setDraggedStep(null)
                            }
                          }}
                        >
                          {/* Drag Handle */}
                          <td className="px-4 py-4">
                            <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                          </td>

                          {/* Order */}
                          <td className="px-4 py-4">
                            <Badge variant="outline" className="text-xs">
                              {index + 1}
                            </Badge>
                          </td>

                          {/* Title */}
                          <td className="px-4 py-4">
                            {isEditing ? (
                              <Input
                                value={step.title}
                                onChange={(e) => updateStep(step.id, { title: e.target.value })}
                                className="w-full"
                                autoFocus
                              />
                            ) : (
                              <div className="flex items-center gap-2">
                                <MessageSquare className="h-4 w-4 text-blue-500" />
                                <span className="font-medium text-gray-900">{step.title}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {step.id}
                                </Badge>
                              </div>
                            )}
                          </td>

                          {/* Content */}
                          <td className="px-4 py-4 max-w-xs">
                            {isEditing ? (
                              <Textarea
                                value={step.content}
                                onChange={(e) => updateStep(step.id, { content: e.target.value })}
                                className="w-full"
                                rows={2}
                              />
                            ) : (
                              <div className="text-sm text-gray-600 line-clamp-2">
                                {step.content || <span className="text-gray-400 italic">Нет содержимого</span>}
                              </div>
                            )}
                          </td>

                          {/* Options */}
                          <td className="px-4 py-4">
                            <div className="space-y-2">
                              {step.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center gap-2 text-sm">
                                  {editingOption?.stepId === step.id && editingOption?.optionIndex === optionIndex ? (
                                    <div className="flex items-center gap-1 w-full">
                                      <Input
                                        value={option.text}
                                        onChange={(e) => updateOption(step.id, optionIndex, "text", e.target.value)}
                                        className="flex-1 text-xs"
                                        placeholder="Текст ответа"
                                      />
                                      <ArrowRight className="h-3 w-3 text-gray-400" />
                                      <select
                                        value={option.nextStep}
                                        onChange={(e) => updateOption(step.id, optionIndex, "nextStep", e.target.value)}
                                        className="text-xs border border-gray-300 rounded px-2 py-1"
                                      >
                                        <option value="">Выберите шаг</option>
                                        {scenario.steps
                                          .filter((s) => s.id !== step.id)
                                          .map((s) => (
                                            <option key={s.id} value={s.id}>
                                              {s.title}
                                            </option>
                                          ))}
                                        <option value="end">Завершить</option>
                                      </select>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0"
                                        onClick={() => setEditingOption(null)}
                                      >
                                        <Check className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <div
                                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded w-full"
                                      onClick={() => setEditingOption({ stepId: step.id, optionIndex })}
                                    >
                                      <span className="text-blue-600 font-medium">{option.text || "Пустой ответ"}</span>
                                      <ArrowRight className="h-3 w-3 text-gray-400" />
                                      <span className="text-gray-600">
                                        {option.nextStep === "end"
                                          ? "Завершить"
                                          : getStepByNextStep(option.nextStep)?.title || "Не выбран"}
                                      </span>
                                      {step.options.length > 1 && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-4 w-4 p-0 ml-auto"
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            removeOption(step.id, optionIndex)
                                          }}
                                        >
                                          <X className="h-3 w-3 text-red-500" />
                                        </Button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              ))}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs h-6"
                                onClick={() => addOption(step.id)}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Добавить ответ
                              </Button>
                            </div>
                          </td>

                          {/* Connections */}
                          <td className="px-4 py-4">
                            <div className="space-y-1">
                              {connections.incoming.length > 0 && (
                                <div className="text-xs">
                                  <span className="text-green-600 font-medium">Входящие:</span>
                                  <div className="text-gray-600">
                                    {connections.incoming.map((s) => s.title).join(", ")}
                                  </div>
                                </div>
                              )}
                              {connections.outgoing.length > 0 && (
                                <div className="text-xs">
                                  <span className="text-blue-600 font-medium">Исходящие:</span>
                                  <div className="text-gray-600">
                                    {connections.outgoing
                                      .map((s) => s?.title)
                                      .filter(Boolean)
                                      .join(", ")}
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => setEditingStep(isEditing ? null : step.id)}
                              >
                                {isEditing ? <Check className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => duplicateStep(step.id)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600"
                                onClick={() => deleteStep(step.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {scenario.steps.length === 0 && (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Нет шагов</h3>
                  <p className="text-gray-500 mb-4">Добавьте первый шаг для начала создания сценария</p>
                  <Button onClick={addNewStep}>
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить первый шаг
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
