"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Phone,
  RotateCcw,
  CheckCircle,
  Map,
  X,
  StickyNote,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  Clock,
  MessageCircle,
} from "lucide-react"
import Link from "next/link"
import { ScenarioMap } from "@/components/scenario-map"

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
  webhookData?: any
}

interface CallResult {
  id: string
  scenarioId: string
  result: "success" | "rejection" | "postponed" | "other"
  notes: string
  stepHistory: string[]
  duration: number
  timestamp: string
}

export default function ScenarioPage() {
  const params = useParams()
  const router = useRouter()
  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [currentStepId, setCurrentStepId] = useState<string>("")
  const [stepHistory, setStepHistory] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [webhookData, setWebhookData] = useState<any>(null)
  const [showMap, setShowMap] = useState(true)
  const [notes, setNotes] = useState("")
  const [callStartTime] = useState(Date.now())
  const [showResultDialog, setShowResultDialog] = useState(false)
  const [selectedResult, setSelectedResult] = useState<"success" | "rejection" | "postponed" | "other" | null>(null)
  const [resultNotes, setResultNotes] = useState("")

  useEffect(() => {
    const loadScenario = async () => {
      const savedScenarios = localStorage.getItem("call-scenarios")
      if (savedScenarios) {
        const scenarios = JSON.parse(savedScenarios)
        const foundScenario = scenarios.find((s: Scenario) => s.id === params.id)

        if (foundScenario) {
          setScenario(foundScenario)
          const firstStepId = foundScenario.steps[0]?.id || ""
          setCurrentStepId(firstStepId)
          setStepHistory([firstStepId])

          // Загружаем данные из webhook если есть URL
          if (foundScenario.webhookUrl && !foundScenario.webhookData) {
            try {
              const response = await fetch(foundScenario.webhookUrl)
              const data = await response.json()
              setWebhookData(data)

              // Сохраняем данные в сценарий
              foundScenario.webhookData = data
              const updatedScenarios = scenarios.map((s: Scenario) => (s.id === foundScenario.id ? foundScenario : s))
              localStorage.setItem("call-scenarios", JSON.stringify(updatedScenarios))
            } catch (error) {
              console.error("Ошибка загрузки данных webhook:", error)
            }
          } else if (foundScenario.webhookData) {
            setWebhookData(foundScenario.webhookData)
          }

          // Обновляем время последнего использования
          foundScenario.lastUsed = new Date().toISOString()
          const updatedScenarios = scenarios.map((s: Scenario) => (s.id === foundScenario.id ? foundScenario : s))
          localStorage.setItem("call-scenarios", JSON.stringify(updatedScenarios))
        }
      }
      setIsLoading(false)
    }

    loadScenario()
  }, [params.id])

  const getCurrentStep = () => {
    return scenario?.steps.find((step) => step.id === currentStepId)
  }

  const handleOptionClick = (nextStepId: string) => {
    if (nextStepId === "end") {
      setCurrentStepId("") // Устанавливаем пустой ID для завершения
      setShowResultDialog(true) // Показываем диалог результата
      return
    }

    setStepHistory([...stepHistory, nextStepId])
    setCurrentStepId(nextStepId)
  }

  const handleStepSelect = (stepId: string) => {
    if (stepId === "end") {
      setCurrentStepId("") // Устанавливаем пустой ID для завершения
      setShowResultDialog(true) // Показываем диалог результата
      return
    }

    // Добавляем выбранный шаг в историю если его там нет
    if (!stepHistory.includes(stepId)) {
      setStepHistory([...stepHistory, stepId])
    }
    setCurrentStepId(stepId)
  }

  const goToPreviousStep = () => {
    if (stepHistory.length > 1) {
      const newHistory = stepHistory.slice(0, -1)
      setStepHistory(newHistory)
      setCurrentStepId(newHistory[newHistory.length - 1])
    }
  }

  const resetScenario = () => {
    const firstStepId = scenario?.steps[0]?.id || ""
    setCurrentStepId(firstStepId)
    setStepHistory([firstStepId])
    setNotes("")
    setShowResultDialog(false)
    setSelectedResult(null)
    setResultNotes("")
  }

  const saveCallResult = (result: "success" | "rejection" | "postponed" | "other") => {
    if (!scenario) return

    const callResult: CallResult = {
      id: `call-${Date.now()}`,
      scenarioId: scenario.id,
      result,
      notes: `${notes}\n\nРезультат: ${resultNotes}`.trim(),
      stepHistory,
      duration: Date.now() - callStartTime,
      timestamp: new Date().toISOString(),
    }

    // Сохраняем результат звонка
    const savedResults = localStorage.getItem("call-results")
    const results = savedResults ? JSON.parse(savedResults) : []
    results.push(callResult)
    localStorage.setItem("call-results", JSON.stringify(results))

    // Обновляем статистику сценария
    updateScenarioStats(scenario.id, result)

    // Закрываем диалог результата
    setShowResultDialog(false)
    alert("Результат звонка сохранен!")
  }

  const updateScenarioStats = (scenarioId: string, result: "success" | "rejection" | "postponed" | "other") => {
    const savedStats = localStorage.getItem("scenario-stats")
    const stats = savedStats ? JSON.parse(savedStats) : {}

    if (!stats[scenarioId]) {
      stats[scenarioId] = {
        total: 0,
        success: 0,
        rejection: 0,
        postponed: 0,
        other: 0,
      }
    }

    stats[scenarioId].total++
    stats[scenarioId][result]++

    localStorage.setItem("scenario-stats", JSON.stringify(stats))
  }

  const getProgress = () => {
    if (!scenario) return 0
    const uniqueSteps = new Set(stepHistory)
    return (uniqueSteps.size / scenario.steps.length) * 100
  }

  const replaceVariables = (text: string) => {
    if (!webhookData) return text

    let result = text
    Object.keys(webhookData).forEach((key) => {
      const placeholder = `[${key.toUpperCase()}]`
      result = result.replace(new RegExp(placeholder, "g"), webhookData[key] || placeholder)
    })
    return result
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка сценария...</p>
        </div>
      </div>
    )
  }

  if (!scenario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center p-6">
            <h2 className="text-xl font-semibold mb-2">Сценарий не найден</h2>
            <p className="text-gray-600 mb-4">Запрашиваемый сценарий не существует</p>
            <Link href="/">
              <Button>Вернуться на главную</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentStep = getCurrentStep()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex h-screen">
        {/* Sidebar with Map */}
        <div
          className={`${showMap ? "w-80" : "w-0"} transition-all duration-300 overflow-hidden border-r border-gray-200 bg-white`}
        >
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Карта сценария</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowMap(false)} className="lg:hidden">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <ScenarioMap
                scenario={scenario}
                currentStepId={currentStepId}
                stepHistory={stepHistory}
                onStepSelect={handleStepSelect}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <Button variant="outline" size="icon">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                {!showMap && (
                  <Button variant="outline" size="sm" onClick={() => setShowMap(true)} className="lg:hidden">
                    <Map className="h-4 w-4 mr-2" />
                    Карта
                  </Button>
                )}
                <div>
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-900">{scenario.name}</h1>
                  <p className="text-gray-600 text-sm lg:text-base">{scenario.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  Активный звонок
                </Badge>
                <Button variant="outline" onClick={resetScenario} size="sm">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Сначала
                </Button>
                <Link href={`/scenarios/stats/${scenario.id}`}>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Статистика
                  </Button>
                </Link>
              </div>
            </div>

            {/* Progress */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Прогресс</span>
                <span className="text-sm text-gray-500">
                  {new Set(stepHistory).size} из {scenario.steps.length} шагов
                </span>
              </div>
              <Progress value={getProgress()} className="h-2" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-auto p-4 space-y-6">
            {/* Current Step */}
            {currentStep && !showResultDialog ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-blue-600" />
                    {currentStep.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <p className="text-lg leading-relaxed">{replaceVariables(currentStep.content)}</p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Варианты ответа клиента:</h4>
                    {currentStep.options.map((option, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full justify-start text-left h-auto p-4 bg-transparent"
                        onClick={() => handleOptionClick(option.nextStep)}
                      >
                        <span className="flex-1">{option.text}</span>
                      </Button>
                    ))}

                    {stepHistory.length > 1 && (
                      <Button variant="ghost" onClick={goToPreviousStep} className="w-full mt-4">
                        ← Вернуться к предыдущему шагу
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : !currentStep && !showResultDialog ? (
              <Card>
                <CardContent className="text-center p-8">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">Сценарий завершен!</h2>
                  <p className="text-gray-600 mb-6">Вы успешно прошли все шаги сценария</p>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={resetScenario}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Начать заново
                    </Button>
                    <Link href="/">
                      <Button variant="outline">Вернуться на главную</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {/* Result Dialog - показывается независимо от currentStep */}
            {showResultDialog && (
              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Результат звонка
                  </CardTitle>
                  <CardDescription>Выберите результат разговора для анализа и статистики</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Result Buttons */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Button
                      variant={selectedResult === "success" ? "default" : "outline"}
                      className="h-auto p-4 flex flex-col items-center gap-2"
                      onClick={() => setSelectedResult("success")}
                    >
                      <ThumbsUp className="h-6 w-6" />
                      <span className="text-sm font-medium">Согласен</span>
                    </Button>

                    <Button
                      variant={selectedResult === "rejection" ? "default" : "outline"}
                      className="h-auto p-4 flex flex-col items-center gap-2"
                      onClick={() => setSelectedResult("rejection")}
                    >
                      <ThumbsDown className="h-6 w-6" />
                      <span className="text-sm font-medium">Отказ</span>
                    </Button>

                    <Button
                      variant={selectedResult === "postponed" ? "default" : "outline"}
                      className="h-auto p-4 flex flex-col items-center gap-2"
                      onClick={() => setSelectedResult("postponed")}
                    >
                      <Clock className="h-6 w-6" />
                      <span className="text-sm font-medium">Отложил</span>
                    </Button>

                    <Button
                      variant={selectedResult === "other" ? "default" : "outline"}
                      className="h-auto p-4 flex flex-col items-center gap-2"
                      onClick={() => setSelectedResult("other")}
                    >
                      <MessageCircle className="h-6 w-6" />
                      <span className="text-sm font-medium">Другое</span>
                    </Button>
                  </div>

                  {/* Result Notes */}
                  <div>
                    <Label htmlFor="result-notes">Дополнительные заметки о результате</Label>
                    <Textarea
                      id="result-notes"
                      value={resultNotes}
                      onChange={(e) => setResultNotes(e.target.value)}
                      placeholder="Опишите детали разговора, причины решения клиента, договоренности..."
                      rows={3}
                      className="mt-2"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={() => selectedResult && saveCallResult(selectedResult)}
                      disabled={!selectedResult}
                      className="flex-1"
                    >
                      Сохранить результат
                    </Button>
                    <Button variant="outline" onClick={() => setShowResultDialog(false)}>
                      Отмена
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notes Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <StickyNote className="h-5 w-5 text-yellow-600" />
                  Заметки во время разговора
                </CardTitle>
                <CardDescription>Записывайте важную информацию, возражения клиента, договоренности</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Записывайте заметки во время разговора...
• Возражения клиента
• Важные детали
• Договоренности
• Контактная информация"
                  rows={6}
                  className="w-full"
                />
                <div className="mt-3 flex justify-between items-center text-sm text-gray-500">
                  <span>{notes.length} символов</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(notes)}
                    disabled={!notes}
                  >
                    Копировать заметки
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Webhook Data Display */}
            {webhookData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Данные клиента</CardTitle>
                  <CardDescription>Информация, полученная из внешней системы</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(webhookData).map(([key, value]) => (
                      <div key={key} className="bg-gray-50 p-3 rounded">
                        <div className="text-sm font-medium text-gray-700 uppercase">{key}</div>
                        <div className="text-gray-900">{String(value)}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
