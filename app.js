// Global state
let currentScenario = null
let currentStepId = ""
let stepHistory = []
let callNotes = ""
let callStartTime = 0
let selectedResult = null
let editingScenarioId = null

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

function initializeApp() {
  // Initialize demo scenarios if none exist
  if (!localStorage.getItem("call-scenarios")) {
    initializeDemoScenarios()
  }

  // Load home page
  showHome()

  // Setup notes counter
  const notesTextarea = document.getElementById("callNotes")
  if (notesTextarea) {
    notesTextarea.addEventListener("input", updateNotesCounter)
  }
}

function initializeDemoScenarios() {
  const demoScenarios = [
    {
      id: "demo-sales",
      name: "Продажа услуг",
      description: "Расширенный сценарий для продажи услуг компании с обработкой возражений",
      steps: [
        {
          id: "step-1",
          title: "Приветствие",
          content: "Здравствуйте! Меня зовут [ИМЯ] из компании [КОМПАНИЯ]. У вас есть минутка?",
          options: [
            { text: "Да, слушаю", nextStep: "step-2" },
            { text: "Нет времени", nextStep: "step-busy" },
            { text: "Не интересно", nextStep: "step-objection" },
          ],
        },
        {
          id: "step-2",
          title: "Презентация услуги",
          content: "Мы предлагаем [УСЛУГА], которая поможет вам [ВЫГОДА]. Это займет всего несколько минут.",
          options: [
            { text: "Расскажите подробнее", nextStep: "step-details" },
            { text: "Сколько это стоит?", nextStep: "step-price" },
            { text: "Не подходит", nextStep: "step-objection" },
            { text: "У нас уже есть поставщик", nextStep: "step-competitor" },
          ],
        },
        {
          id: "step-busy",
          title: "Клиент занят",
          content: "Понимаю, что вы заняты. Когда будет удобное время для звонка?",
          options: [
            { text: "Назначили время", nextStep: "step-callback" },
            { text: "Отказался", nextStep: "end" },
          ],
        },
        {
          id: "step-objection",
          title: "Обработка возражений",
          content: "Понимаю ваши сомнения. Позвольте объяснить, почему это может быть полезно именно для вас.",
          options: [
            { text: "Готов выслушать", nextStep: "step-2" },
            { text: "Все равно не интересно", nextStep: "end" },
          ],
        },
        {
          id: "step-competitor",
          title: "Работа с конкурентами",
          content: "Понимаю, что у вас есть поставщик. Что если мы предложим лучшие условия?",
          options: [
            { text: "Интересно, какие условия?", nextStep: "step-benefits" },
            { text: "Мы довольны текущим поставщиком", nextStep: "step-objection" },
          ],
        },
        {
          id: "step-benefits",
          title: "Преимущества услуги",
          content: "Наши главные преимущества: качество, скорость, надежность.",
          options: [
            { text: "Звучит интересно", nextStep: "step-price" },
            { text: "Нужно подумать", nextStep: "step-callback" },
          ],
        },
        {
          id: "step-details",
          title: "Детали услуги",
          content: "Наша услуга включает полный комплекс работ. Мы работаем с компаниями как ваша уже 5 лет.",
          options: [
            { text: "Звучит интересно", nextStep: "step-price" },
            { text: "Нужно подумать", nextStep: "step-callback" },
          ],
        },
        {
          id: "step-price",
          title: "Обсуждение цены",
          content:
            "Стоимость услуги составляет 50000 рублей. Для компаний вашего размера мы предлагаем специальные условия.",
          options: [
            { text: "Приемлемо", nextStep: "step-close" },
            { text: "Дорого", nextStep: "step-discount" },
            { text: "Нужно обсудить с руководством", nextStep: "step-callback" },
          ],
        },
        {
          id: "step-discount",
          title: "Предложение скидки",
          content: "Понимаю ваши опасения по цене. Мы можем предложить скидку 15% при заключении договора сегодня.",
          options: [
            { text: "Согласен", nextStep: "step-close" },
            { text: "Все равно дорого", nextStep: "step-callback" },
          ],
        },
        {
          id: "step-close",
          title: "Закрытие сделки",
          content: "Отлично! Давайте оформим договор. Когда вам удобно встретиться для подписания?",
          options: [
            { text: "Договорились о встрече", nextStep: "end" },
            { text: "Передумал", nextStep: "step-objection" },
          ],
        },
        {
          id: "step-callback",
          title: "Назначение повторного звонка",
          content: "Хорошо, я понимаю, что вам нужно время. Когда мне лучше перезвонить?",
          options: [
            { text: "Назначили время", nextStep: "end" },
            { text: "Не нужно звонить", nextStep: "end" },
          ],
        },
      ],
      createdAt: new Date().toISOString(),
    },
  ]

  localStorage.setItem("call-scenarios", JSON.stringify(demoScenarios))
}

// Navigation functions
function showHome() {
  hideAllPages()
  document.getElementById("homePage").classList.remove("hidden")
  loadScenarios()
}

function showManageScenarios() {
  hideAllPages()
  document.getElementById("managePage").classList.remove("hidden")
  loadManageScenarios()
}

function showCreateScenario(scenarioId = null) {
  hideAllPages()
  document.getElementById("createPage").classList.remove("hidden")
  editingScenarioId = scenarioId

  if (scenarioId) {
    document.getElementById("createPageTitle").textContent = "Редактирование сценария"
    loadScenarioForEdit(scenarioId)
  } else {
    document.getElementById("createPageTitle").textContent = "Создание сценария"
    initializeNewScenario()
  }
}

function showScenario(scenarioId) {
  const scenarios = getScenarios()
  currentScenario = scenarios.find((s) => s.id === scenarioId)

  if (!currentScenario) {
    alert("Сценарий не найден")
    return
  }

  hideAllPages()
  document.getElementById("scenarioPage").classList.remove("hidden")

  // Initialize scenario
  currentStepId = currentScenario.steps[0]?.id || ""
  stepHistory = [currentStepId]
  callNotes = ""
  callStartTime = Date.now()

  // Update UI
  document.getElementById("scenarioTitle").textContent = currentScenario.name
  document.getElementById("scenarioDescription").textContent = currentScenario.description
  document.getElementById("callNotes").value = ""

  loadScenarioMap()
  updateCurrentStep()
  updateProgress()
}

function showStats() {
  if (!currentScenario) return

  hideAllPages()
  document.getElementById("statsPage").classList.remove("hidden")
  document.getElementById("statsScenarioName").textContent = currentScenario.name
  loadStats()
}

function backToScenario() {
  if (currentScenario) {
    showScenario(currentScenario.id)
  } else {
    showHome()
  }
}

function showInstructions() {
  alert("Инструкции будут добавлены в следующей версии")
}

function hideAllPages() {
  const pages = ["homePage", "scenarioPage", "managePage", "createPage", "statsPage"]
  pages.forEach((pageId) => {
    document.getElementById(pageId).classList.add("hidden")
  })
}

// Scenario loading functions
function loadScenarios() {
  const scenarios = getScenarios()
  const grid = document.getElementById("scenariosGrid")

  grid.innerHTML = ""

  scenarios.forEach((scenario) => {
    const card = createScenarioCard(scenario)
    grid.appendChild(card)
  })

  // Add "Create New" card
  const createCard = document.createElement("div")
  createCard.className =
    "scenario-card bg-white rounded-lg shadow-md border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer"
  createCard.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full min-h-[200px] p-6">
            <i class="fas fa-plus text-4xl text-gray-400 mb-4"></i>
            <span class="text-lg font-medium text-gray-600">Создать новый сценарий</span>
        </div>
    `
  createCard.onclick = () => showCreateScenario()
  grid.appendChild(createCard)
}

function createScenarioCard(scenario) {
  const card = document.createElement("div")
  card.className = "scenario-card bg-white rounded-lg shadow-md p-6 cursor-pointer"

  const createdDate = new Date(scenario.createdAt).toLocaleDateString("ru-RU")
  const lastUsedDate = scenario.lastUsed ? new Date(scenario.lastUsed).toLocaleDateString("ru-RU") : null

  card.innerHTML = `
        <div class="flex items-start justify-between mb-4">
            <div class="flex-1">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">${scenario.name}</h3>
                <p class="text-gray-600 text-sm">${scenario.description}</p>
            </div>
            <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">${scenario.steps.length} шагов</span>
        </div>
        <div class="space-y-2 mb-4">
            <div class="text-xs text-gray-500">Создан: ${createdDate}</div>
            ${lastUsedDate ? `<div class="text-xs text-gray-500">Последний раз: ${lastUsedDate}</div>` : ""}
        </div>
        <div class="flex gap-2">
            <button onclick="event.stopPropagation(); showScenario('${scenario.id}')" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                <i class="fas fa-play"></i>
                Начать звонок
            </button>
            <button onclick="event.stopPropagation(); showCreateScenario('${scenario.id}')" class="bg-white border border-gray-300 p-2 rounded-lg hover:bg-gray-50">
                <i class="fas fa-cog"></i>
            </button>
        </div>
    `

  return card
}

function loadManageScenarios() {
  const scenarios = getScenarios()
  const list = document.getElementById("scenariosList")

  list.innerHTML = ""

  if (scenarios.length === 0) {
    list.innerHTML = `
            <div class="text-center py-12">
                <i class="fas fa-phone text-6xl text-gray-300 mb-4"></i>
                <h3 class="text-xl font-medium text-gray-600 mb-2">Нет созданных сценариев</h3>
                <button onclick="showCreateScenario()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    <i class="fas fa-plus mr-2"></i>
                    Создать первый сценарий
                </button>
            </div>
        `
    return
  }

  scenarios.forEach((scenario) => {
    const item = createScenarioListItem(scenario)
    list.appendChild(item)
  })
}

function createScenarioListItem(scenario) {
  const item = document.createElement("div")
  item.className = "bg-white rounded-lg shadow-md p-6"

  const createdDate = new Date(scenario.createdAt).toLocaleDateString("ru-RU")
  const lastUsedDate = scenario.lastUsed ? new Date(scenario.lastUsed).toLocaleDateString("ru-RU") : null

  item.innerHTML = `
        <div class="flex items-start justify-between">
            <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                    <h3 class="text-lg font-semibold text-gray-900">${scenario.name}</h3>
                    <span class="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">${scenario.steps.length} шагов</span>
                    ${scenario.webhookUrl ? '<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Webhook</span>' : ""}
                </div>
                <p class="text-gray-600 mb-4">${scenario.description}</p>
                <div class="text-sm text-gray-500">
                    <div>Создан: ${createdDate}</div>
                    ${lastUsedDate ? `<div>Последний раз: ${lastUsedDate}</div>` : ""}
                </div>
            </div>
            <div class="flex gap-2">
                <button onclick="showScenario('${scenario.id}')" class="bg-white border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm">
                    Запустить
                </button>
                <button onclick="showCreateScenario('${scenario.id}')" class="bg-white border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteScenario('${scenario.id}')" class="bg-white border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 text-red-600 text-sm">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `

  return item
}

// Scenario runner functions
function loadScenarioMap() {
  const map = document.getElementById("scenarioMap")
  map.innerHTML = ""

  currentScenario.steps.forEach((step, index) => {
    const stepElement = createMapStep(step, index)
    map.appendChild(stepElement)
  })

  // Add end step
  const endStep = document.createElement("div")
  endStep.className = `p-3 border rounded-lg cursor-pointer transition-all ${!currentStepId ? "bg-red-100 border-red-500 text-red-900" : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"}`
  endStep.innerHTML = `
        <div class="flex items-center gap-3">
            <i class="fas fa-square text-red-600"></i>
            <div class="flex-1">
                <div class="font-medium text-sm">Завершение сценария</div>
                <div class="text-xs text-gray-500">Конец разговора</div>
            </div>
        </div>
    `
  endStep.onclick = () => showResultModal()
  map.appendChild(endStep)
}

function createMapStep(step, index) {
  const isActive = step.id === currentStepId
  const isCompleted = stepHistory.includes(step.id)

  let statusClass = "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
  let iconClass = "fas fa-circle text-gray-400"

  if (isActive) {
    statusClass = "bg-blue-100 border-blue-500 text-blue-900 shadow-md"
    iconClass = "fas fa-play text-blue-600"
  } else if (isCompleted) {
    statusClass = "bg-green-100 border-green-500 text-green-900"
    iconClass = "fas fa-check-circle text-green-600"
  }

  const stepElement = document.createElement("div")
  stepElement.className = `p-3 border rounded-lg cursor-pointer transition-all mb-2 ${statusClass}`
  stepElement.innerHTML = `
        <div class="flex items-center gap-3">
            <i class="${iconClass}"></i>
            <div class="flex-1">
                <div class="font-medium text-sm">${index + 1}. ${step.title}</div>
                <div class="text-xs text-gray-500">ID: ${step.id}</div>
            </div>
        </div>
    `

  stepElement.onclick = () => goToStep(step.id)
  return stepElement
}

function updateCurrentStep() {
  const currentStep = getCurrentStep()
  const card = document.getElementById("currentStepCard")

  if (!currentStep) {
    // Show completion message
    card.innerHTML = `
            <div class="text-center p-8">
                <i class="fas fa-check-circle text-6xl text-green-500 mb-4"></i>
                <h2 class="text-2xl font-semibold mb-2">Сценарий завершен!</h2>
                <p class="text-gray-600 mb-6">Вы успешно прошли все шаги сценария</p>
                <div class="flex gap-4 justify-center">
                    <button onclick="resetScenario()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        <i class="fas fa-redo mr-2"></i>
                        Начать заново
                    </button>
                    <button onclick="showHome()" class="bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">
                        Вернуться на главную
                    </button>
                </div>
            </div>
        `
    return
  }

  card.innerHTML = `
        <div class="flex items-center gap-2 mb-4">
            <i class="fas fa-phone text-blue-600"></i>
            <h3 class="text-lg font-semibold">${currentStep.title}</h3>
        </div>
        <div class="bg-blue-50 p-4 rounded-lg mb-6">
            <p class="text-lg leading-relaxed">${currentStep.content}</p>
        </div>
        <div class="space-y-3">
            <h4 class="font-medium text-gray-900">Варианты ответа клиента:</h4>
            ${currentStep.options
              .map(
                (option) => `
                <button onclick="selectOption('${option.nextStep}')" class="step-option w-full text-left p-4 border border-gray-300 rounded-lg hover:border-blue-500 hover:bg-gray-50">
                    ${option.text}
                </button>
            `,
              )
              .join("")}
            ${
              stepHistory.length > 1
                ? `
                <button onclick="goToPreviousStep()" class="w-full text-center p-2 text-gray-600 hover:text-gray-800">
                    ← Вернуться к предыдущему шагу
                </button>
            `
                : ""
            }
        </div>
    `
}

function getCurrentStep() {
  return currentScenario?.steps.find((step) => step.id === currentStepId)
}

function selectOption(nextStepId) {
  if (nextStepId === "end") {
    currentStepId = ""
    showResultModal()
    return
  }

  stepHistory.push(nextStepId)
  currentStepId = nextStepId

  updateCurrentStep()
  updateProgress()
  loadScenarioMap()
}

function goToStep(stepId) {
  if (stepId === "end") {
    currentStepId = ""
    showResultModal()
    return
  }

  if (!stepHistory.includes(stepId)) {
    stepHistory.push(stepId)
  }
  currentStepId = stepId

  updateCurrentStep()
  updateProgress()
  loadScenarioMap()
}

function goToPreviousStep() {
  if (stepHistory.length > 1) {
    stepHistory.pop()
    currentStepId = stepHistory[stepHistory.length - 1]

    updateCurrentStep()
    updateProgress()
    loadScenarioMap()
  }
}

function resetScenario() {
  if (!currentScenario) return

  currentStepId = currentScenario.steps[0]?.id || ""
  stepHistory = [currentStepId]
  callNotes = ""
  callStartTime = Date.now()

  document.getElementById("callNotes").value = ""
  updateNotesCounter()

  updateCurrentStep()
  updateProgress()
  loadScenarioMap()
}

function updateProgress() {
  if (!currentScenario) return

  const uniqueSteps = new Set(stepHistory)
  const progress = (uniqueSteps.size / currentScenario.steps.length) * 100

  document.getElementById("progressBar").style.width = `${progress}%`
  document.getElementById("progressText").textContent = `${uniqueSteps.size} из ${currentScenario.steps.length} шагов`
}

// Result modal functions
function showResultModal() {
  document.getElementById("resultModal").classList.add("show")
  selectedResult = null
  document.getElementById("resultNotes").value = ""
  document.getElementById("saveResultBtn").disabled = true

  // Reset button styles
  document.querySelectorAll(".result-btn").forEach((btn) => {
    btn.classList.remove("bg-blue-600", "text-white")
    btn.classList.add("border-gray-300")
  })
}

function closeResultModal() {
  document.getElementById("resultModal").classList.remove("show")
}

function selectResult(result) {
  selectedResult = result

  // Update button styles
  document.querySelectorAll(".result-btn").forEach((btn) => {
    btn.classList.remove("bg-blue-600", "text-white")
    btn.classList.add("border-gray-300")
  })

  const selectedBtn = document.querySelector(`[data-result="${result}"]`)
  selectedBtn.classList.add("bg-blue-600", "text-white")
  selectedBtn.classList.remove("border-gray-300")

  document.getElementById("saveResultBtn").disabled = false
}

function saveCallResult() {
  if (!selectedResult || !currentScenario) return

  const callResult = {
    id: `call-${Date.now()}`,
    scenarioId: currentScenario.id,
    result: selectedResult,
    notes:
      `${document.getElementById("callNotes").value}\n\nРезультат: ${document.getElementById("resultNotes").value}`.trim(),
    stepHistory: [...stepHistory],
    duration: Date.now() - callStartTime,
    timestamp: new Date().toISOString(),
  }

  // Save call result
  const results = getCallResults()
  results.push(callResult)
  localStorage.setItem("call-results", JSON.stringify(results))

  // Update scenario stats
  updateScenarioStats(currentScenario.id, selectedResult)

  // Update last used
  updateScenarioLastUsed(currentScenario.id)

  closeResultModal()
  updateCurrentStep() // This will show the completion message

  alert("Результат звонка сохранен!")
}

function updateScenarioStats(scenarioId, result) {
  const stats = getScenarioStats()

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

function updateScenarioLastUsed(scenarioId) {
  const scenarios = getScenarios()
  const scenario = scenarios.find((s) => s.id === scenarioId)
  if (scenario) {
    scenario.lastUsed = new Date().toISOString()
    localStorage.setItem("call-scenarios", JSON.stringify(scenarios))
  }
}

// Notes functions
function updateNotesCounter() {
  const textarea = document.getElementById("callNotes")
  const counter = document.getElementById("notesCounter")
  if (textarea && counter) {
    counter.textContent = `${textarea.value.length} символов`
  }
}

function copyNotes() {
  const textarea = document.getElementById("callNotes")
  if (textarea && textarea.value) {
    navigator.clipboard.writeText(textarea.value).then(() => {
      alert("Заметки скопированы в буфер обмена")
    })
  }
}

// Scenario creation/editing functions
function initializeNewScenario() {
  document.getElementById("scenarioName").value = ""
  document.getElementById("scenarioDescriptionInput").value = ""
  document.getElementById("scenarioWebhook").value = ""

  loadSteps([
    {
      id: "step-1",
      title: "Первый шаг",
      content: "",
      options: [{ text: "", nextStep: "" }],
    },
  ])
}

function loadScenarioForEdit(scenarioId) {
  const scenarios = getScenarios()
  const scenario = scenarios.find((s) => s.id === scenarioId)

  if (!scenario) return

  document.getElementById("scenarioName").value = scenario.name
  document.getElementById("scenarioDescriptionInput").value = scenario.description
  document.getElementById("scenarioWebhook").value = scenario.webhookUrl || ""

  loadSteps(scenario.steps)
}

function loadSteps(steps) {
  const container = document.getElementById("stepsContainer")
  container.innerHTML = ""

  steps.forEach((step, index) => {
    const stepElement = createStepElement(step, index)
    container.appendChild(stepElement)
  })
}

function createStepElement(step, index) {
  const stepDiv = document.createElement("div")
  stepDiv.className = "bg-white rounded-lg shadow-md p-6"
  stepDiv.dataset.stepId = step.id

  stepDiv.innerHTML = `
        <div class="flex items-center justify-between mb-4">
            <div>
                <h3 class="text-lg font-semibold">Шаг ${index + 1}</h3>
                <p class="text-sm text-gray-500">ID: ${step.id}</p>
            </div>
            <button onclick="removeStep('${step.id}')" class="text-red-600 hover:text-red-800">
                <i class="fas fa-trash"></i>
            </button>
        </div>
        
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Название шага</label>
                <input type="text" class="step-title w-full p-3 border border-gray-300 rounded-lg" value="${step.title}" placeholder="Название шага">
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Текст для произнесения</label>
                <textarea class="step-content w-full p-3 border border-gray-300 rounded-lg" rows="3" placeholder="Что нужно сказать клиенту на этом шаге">${step.content}</textarea>
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Варианты ответов клиента</label>
                <div class="step-options space-y-3">
                    ${step.options
                      .map(
                        (option, optionIndex) => `
                        <div class="flex gap-2 items-end">
                            <div class="flex-1">
                                <input type="text" class="option-text w-full p-2 border border-gray-300 rounded-lg" value="${option.text}" placeholder="Вариант ответа клиента">
                            </div>
                            <div class="flex-1">
                                <select class="option-next w-full p-2 border border-gray-300 rounded-lg">
                                    <option value="">Следующий шаг</option>
                                    <option value="end" ${option.nextStep === "end" ? "selected" : ""}>Завершить сценарий</option>
                                </select>
                            </div>
                            <button onclick="removeOption(this)" class="text-red-600 hover:text-red-800 p-2">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
                <button onclick="addOption('${step.id}')" class="w-full mt-3 p-2 border border-dashed border-gray-300 rounded-lg text-gray-600 hover:text-gray-800">
                    <i class="fas fa-plus mr-2"></i>
                    Добавить вариант ответа
                </button>
            </div>
        </div>
    `

  return stepDiv
}

function addStep() {
  const container = document.getElementById("stepsContainer")
  const stepCount = container.children.length

  const newStep = {
    id: `step-${Date.now()}`,
    title: `Новый шаг ${stepCount + 1}`,
    content: "",
    options: [{ text: "Продолжить", nextStep: "" }],
  }

  const stepElement = createStepElement(newStep, stepCount)
  container.appendChild(stepElement)

  updateStepSelects()
}

function removeStep(stepId) {
  if (!confirm("Удалить этот шаг?")) return

  const stepElement = document.querySelector(`[data-step-id="${stepId}"]`)
  if (stepElement) {
    stepElement.remove()
    updateStepSelects()
  }
}

function addOption(stepId) {
  const stepElement = document.querySelector(`[data-step-id="${stepId}"]`)
  const optionsContainer = stepElement.querySelector(".step-options")

  const optionDiv = document.createElement("div")
  optionDiv.className = "flex gap-2 items-end"
  optionDiv.innerHTML = `
        <div class="flex-1">
            <input type="text" class="option-text w-full p-2 border border-gray-300 rounded-lg" placeholder="Вариант ответа клиента">
        </div>
        <div class="flex-1">
            <select class="option-next w-full p-2 border border-gray-300 rounded-lg">
                <option value="">Следующий шаг</option>
                <option value="end">Завершить сценарий</option>
            </select>
        </div>
        <button onclick="removeOption(this)" class="text-red-600 hover:text-red-800 p-2">
            <i class="fas fa-trash"></i>
        </button>
    `

  optionsContainer.appendChild(optionDiv)
  updateStepSelects()
}

function removeOption(button) {
  button.parentElement.remove()
}

function updateStepSelects() {
  const steps = Array.from(document.querySelectorAll("[data-step-id]"))
  const selects = document.querySelectorAll(".option-next")

  selects.forEach((select) => {
    const currentValue = select.value

    // Clear existing step options
    Array.from(select.options).forEach((option) => {
      if (option.value !== "" && option.value !== "end") {
        option.remove()
      }
    })

    // Add step options
    steps.forEach((stepElement) => {
      const stepId = stepElement.dataset.stepId
      const stepTitle = stepElement.querySelector(".step-title").value || "Без названия"

      const option = document.createElement("option")
      option.value = stepId
      option.textContent = stepTitle
      if (currentValue === stepId) {
        option.selected = true
      }

      select.appendChild(option)
    })
  })
}

function saveScenario() {
  const name = document.getElementById("scenarioName").value.trim()
  const description = document.getElementById("scenarioDescriptionInput").value.trim()
  const webhookUrl = document.getElementById("scenarioWebhook").value.trim()

  if (!name) {
    alert("Введите название сценария")
    return
  }

  const steps = []
  const stepElements = document.querySelectorAll("[data-step-id]")

  stepElements.forEach((stepElement) => {
    const stepId = stepElement.dataset.stepId
    const title = stepElement.querySelector(".step-title").value.trim()
    const content = stepElement.querySelector(".step-content").value.trim()

    const options = []
    const optionElements = stepElement.querySelectorAll(".step-options > div")

    optionElements.forEach((optionElement) => {
      const text = optionElement.querySelector(".option-text").value.trim()
      const nextStep = optionElement.querySelector(".option-next").value

      if (text) {
        options.push({ text, nextStep })
      }
    })

    if (title && options.length > 0) {
      steps.push({ id: stepId, title, content, options })
    }
  })

  if (steps.length === 0) {
    alert("Добавьте хотя бы один шаг")
    return
  }

  const scenarios = getScenarios()
  const scenarioId =
    editingScenarioId ||
    name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")

  const scenario = {
    id: scenarioId,
    name,
    description,
    webhookUrl: webhookUrl || undefined,
    steps,
    createdAt: editingScenarioId
      ? scenarios.find((s) => s.id === editingScenarioId)?.createdAt || new Date().toISOString()
      : new Date().toISOString(),
  }

  if (editingScenarioId) {
    const index = scenarios.findIndex((s) => s.id === editingScenarioId)
    if (index !== -1) {
      scenarios[index] = scenario
    }
  } else {
    scenarios.push(scenario)
  }

  localStorage.setItem("call-scenarios", JSON.stringify(scenarios))

  alert("Сценарий сохранен!")
  showManageScenarios()
}

// Statistics functions
function loadStats() {
  if (!currentScenario) return

  const stats = getScenarioStats()[currentScenario.id] || {
    total: 0,
    success: 0,
    rejection: 0,
    postponed: 0,
    other: 0,
  }

  const callResults = getCallResults().filter((r) => r.scenarioId === currentScenario.id)

  // Load overview
  const overview = document.getElementById("statsOverview")
  overview.innerHTML = `
        <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-600">Всего звонков</p>
                    <p class="text-2xl font-bold text-gray-900">${stats.total}</p>
                </div>
                <i class="fas fa-users text-3xl text-blue-500"></i>
            </div>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-600">Успешных</p>
                    <p class="text-2xl font-bold text-green-600">${stats.success}</p>
                </div>
                <i class="fas fa-chart-line text-3xl text-green-500"></i>
            </div>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-600">Конверсия</p>
                    <p class="text-2xl font-bold text-blue-600">${stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0}%</p>
                </div>
                <i class="fas fa-percentage text-3xl text-blue-500"></i>
            </div>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-600">Среднее время</p>
                    <p class="text-2xl font-bold text-purple-600">${getAverageDuration(callResults)} мин</p>
                </div>
                <i class="fas fa-clock text-3xl text-purple-500"></i>
            </div>
        </div>
    `

  // Load distribution
  const distribution = document.getElementById("resultsDistribution")
  if (stats.total > 0) {
    distribution.innerHTML = `
            <h3 class="text-lg font-semibold mb-4">Распределение результатов</h3>
            <div class="space-y-4">
                ${createDistributionBar("Согласен", stats.success, stats.total, "bg-green-500")}
                ${createDistributionBar("Отказ", stats.rejection, stats.total, "bg-red-500")}
                ${createDistributionBar("Отложил", stats.postponed, stats.total, "bg-yellow-500")}
                ${createDistributionBar("Другое", stats.other, stats.total, "bg-gray-500")}
            </div>
        `
  } else {
    distribution.innerHTML = `
            <h3 class="text-lg font-semibold mb-4">Распределение результатов</h3>
            <p class="text-gray-500">Нет данных для отображения</p>
        `
  }

  // Load recent calls
  const recentCalls = document.getElementById("recentCalls")
  if (callResults.length > 0) {
    recentCalls.innerHTML = callResults
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
      .map(
        (result) => `
                <div class="border border-gray-200 rounded-lg p-4 mb-4">
                    <div class="flex items-start justify-between mb-2">
                        <div class="flex items-center gap-2">
                            <span class="px-2 py-1 rounded-full text-xs text-white ${getResultColor(result.result)}">${getResultLabel(result.result)}</span>
                            <span class="text-sm text-gray-500">${new Date(result.timestamp).toLocaleString("ru-RU")}</span>
                        </div>
                        <span class="text-sm text-gray-500">${Math.round(result.duration / 1000 / 60)} мин</span>
                    </div>
                    ${result.notes ? `<div class="text-sm text-gray-700 bg-gray-50 p-2 rounded">${result.notes}</div>` : ""}
                </div>
            `,
      )
      .join("")
  } else {
    recentCalls.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-chart-bar text-6xl mb-4 opacity-50"></i>
                <p>Пока нет данных о звонках</p>
                <p class="text-sm">Начните использовать сценарий для сбора статистики</p>
            </div>
        `
  }
}

function createDistributionBar(label, value, total, colorClass) {
  const percentage = Math.round((value / total) * 100)
  return `
        <div class="flex items-center gap-4">
            <div class="w-24 text-sm font-medium">${label}</div>
            <div class="flex-1 bg-gray-200 rounded-full h-4 relative">
                <div class="${colorClass} h-4 rounded-full" style="width: ${percentage}%"></div>
            </div>
            <div class="w-16 text-sm text-gray-600 text-right">
                ${value} (${percentage}%)
            </div>
        </div>
    `
}

function getAverageDuration(callResults) {
  if (callResults.length === 0) return 0
  const totalDuration = callResults.reduce((sum, result) => sum + result.duration, 0)
  return Math.round(totalDuration / callResults.length / 1000 / 60)
}

function getResultColor(result) {
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

function getResultLabel(result) {
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

// Utility functions
function getScenarios() {
  return JSON.parse(localStorage.getItem("call-scenarios") || "[]")
}

function getCallResults() {
  return JSON.parse(localStorage.getItem("call-results") || "[]")
}

function getScenarioStats() {
  return JSON.parse(localStorage.getItem("scenario-stats") || "{}")
}

function deleteScenario(scenarioId) {
  if (!confirm("Вы уверены, что хотите удалить этот сценарий?")) return

  const scenarios = getScenarios()
  const updatedScenarios = scenarios.filter((s) => s.id !== scenarioId)
  localStorage.setItem("call-scenarios", JSON.stringify(updatedScenarios))

  loadManageScenarios()
}

function filterScenarios() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase()
  const scenarios = getScenarios()

  const filteredScenarios = scenarios.filter(
    (scenario) =>
      scenario.name.toLowerCase().includes(searchTerm) || scenario.description.toLowerCase().includes(searchTerm),
  )

  const list = document.getElementById("scenariosList")
  list.innerHTML = ""

  if (filteredScenarios.length === 0) {
    list.innerHTML = `
            <div class="text-center py-12">
                <div class="text-gray-400 mb-4">${searchTerm ? "Сценарии не найдены" : "Нет созданных сценариев"}</div>
                ${
                  !searchTerm
                    ? `
                    <button onclick="showCreateScenario()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                        <i class="fas fa-plus mr-2"></i>
                        Создать первый сценарий
                    </button>
                `
                    : ""
                }
            </div>
        `
    return
  }

  filteredScenarios.forEach((scenario) => {
    const item = createScenarioListItem(scenario)
    list.appendChild(item)
  })
}

function exportScenarios() {
  const scenarios = getScenarios()
  const dataStr = JSON.stringify(scenarios, null, 2)
  const dataBlob = new Blob([dataStr], { type: "application/json" })
  const url = URL.createObjectURL(dataBlob)
  const link = document.createElement("a")
  link.href = url
  link.download = "call-scenarios.json"
  link.click()
  URL.revokeObjectURL(url)
}

function importScenarios() {
  document.getElementById("fileInput").click()
}

function handleFileImport(event) {
  const file = event.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const importedScenarios = JSON.parse(e.target.result)
      const scenarios = getScenarios()
      const updatedScenarios = [...scenarios, ...importedScenarios]
      localStorage.setItem("call-scenarios", JSON.stringify(updatedScenarios))
      alert("Сценарии успешно импортированы!")
      loadManageScenarios()
    } catch (error) {
      alert("Ошибка при импорте файла. Проверьте формат JSON.")
    }
  }
  reader.readAsText(file)

  // Reset file input
  event.target.value = ""
}

function exportStats() {
  if (!currentScenario) return

  const stats = getScenarioStats()[currentScenario.id]
  const callResults = getCallResults().filter((r) => r.scenarioId === currentScenario.id)

  const data = {
    scenario: currentScenario.name,
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
  link.download = `stats-${currentScenario.name}-${new Date().toISOString().split("T")[0]}.json`
  link.click()
  URL.revokeObjectURL(url)
}

// Event listeners for dynamic updates
document.addEventListener("input", (e) => {
  if (e.target.classList.contains("step-title")) {
    updateStepSelects()
  }
})
