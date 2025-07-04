"use client"
import { CheckCircle, Circle, Play, Square } from "lucide-react"
import { Button } from "@/components/ui/button"

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
  steps: ScenarioStep[]
}

interface ScenarioMapProps {
  scenario: Scenario
  currentStepId: string
  stepHistory: string[]
  onStepSelect: (stepId: string) => void
}

export function ScenarioMap({ scenario, currentStepId, stepHistory, onStepSelect }: ScenarioMapProps) {
  const getStepStatus = (stepId: string) => {
    if (stepId === currentStepId) return "current"
    if (stepHistory.includes(stepId)) return "completed"
    return "pending"
  }

  const getStatusIcon = (stepId: string) => {
    const status = getStepStatus(stepId)
    switch (status) {
      case "current":
        return <Play className="h-4 w-4 text-blue-600" />
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      default:
        return <Circle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStepStyle = (stepId: string) => {
    const status = getStepStatus(stepId)
    switch (status) {
      case "current":
        return "bg-blue-100 border-blue-500 text-blue-900 shadow-md"
      case "completed":
        return "bg-green-100 border-green-500 text-green-900"
      default:
        return "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
    }
  }

  const getStepTitle = (stepId: string) => {
    const step = scenario.steps.find((s) => s.id === stepId)
    return step?.title || stepId
  }

  // Получаем все уникальные шаги из сценария, включая те, на которые есть ссылки
  const getAllSteps = () => {
    const steps = [...scenario.steps]
    const referencedSteps = new Set<string>()

    // Собираем все ссылки на шаги
    scenario.steps.forEach((step) => {
      step.options.forEach((option) => {
        if (option.nextStep && option.nextStep !== "end") {
          referencedSteps.add(option.nextStep)
        }
      })
    })

    return steps
  }

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="p-4 space-y-2">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">Шаги сценария</h4>

        {getAllSteps().map((step, index) => (
          <Button
            key={step.id}
            variant="outline"
            className={`w-full justify-start text-left h-auto p-3 border transition-all duration-200 ${getStepStyle(step.id)}`}
            onClick={() => onStepSelect(step.id)}
          >
            <div className="flex items-center gap-3 w-full">
              <div className="flex-shrink-0">{getStatusIcon(step.id)}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {index + 1}. {getStepTitle(step.id)}
                </div>
                <div className="text-xs text-gray-500 mt-1">ID: {step.id}</div>
              </div>
            </div>
          </Button>
        ))}

        {/* Завершение сценария */}
        <Button
          variant="outline"
          className={`w-full justify-start text-left h-auto p-3 border transition-all duration-200 ${
            !currentStepId ? "bg-red-100 border-red-500 text-red-900" : "bg-gray-50 border-gray-200 text-gray-700"
          }`}
          onClick={() => onStepSelect("end")}
        >
          <div className="flex items-center gap-3 w-full">
            <div className="flex-shrink-0">
              <Square className="h-4 w-4 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">Завершение сценария</div>
              <div className="text-xs text-gray-500 mt-1">Конец разговора</div>
            </div>
          </div>
        </Button>
      </div>

      {/* Легенда */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Статус шагов</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <Play className="h-3 w-3 text-blue-600" />
            <span>Текущий шаг</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-3 w-3 text-green-600" />
            <span>Пройденный шаг</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="h-3 w-3 text-gray-400" />
            <span>Доступный шаг</span>
          </div>
        </div>
      </div>
    </div>
  )
}
