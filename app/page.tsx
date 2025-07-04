"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, Plus, Settings, BookOpen, Play } from "lucide-react"
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

export default function HomePage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([])

  useEffect(() => {
    const savedScenarios = localStorage.getItem("call-scenarios")
    if (savedScenarios) {
      setScenarios(JSON.parse(savedScenarios))
    } else {
      // Заменить demoScenario на два новых сценария:
      const demoScenarios: Scenario[] = [
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
                { text: "Пришлите коммерческое предложение", nextStep: "step-proposal" },
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
                { text: "Какие у вас преимущества?", nextStep: "step-benefits" },
                { text: "Покажите примеры работ", nextStep: "step-portfolio" },
              ],
            },
            {
              id: "step-competitor",
              title: "Работа с конкурентами",
              content: "Понимаю, что у вас есть поставщик. Что если мы предложим лучшие условия?",
              options: [
                { text: "Интересно, какие условия?", nextStep: "step-benefits" },
                { text: "Мы довольны текущим поставщиком", nextStep: "step-objection" },
                { text: "Можете сделать тестовое задание?", nextStep: "step-test" },
              ],
            },
            {
              id: "step-benefits",
              title: "Преимущества услуги",
              content: "Наши главные преимущества: [ПРЕИМУЩЕСТВО1], [ПРЕИМУЩЕСТВО2], [ПРЕИМУЩЕСТВО3].",
              options: [
                { text: "Звучит интересно", nextStep: "step-price" },
                { text: "Нужно подумать", nextStep: "step-callback" },
                { text: "Не убедительно", nextStep: "step-portfolio" },
                { text: "А что с ценами?", nextStep: "step-price" },
                { text: "Какие гарантии?", nextStep: "step-guarantee" },
                { text: "Сколько времени займет?", nextStep: "step-timeline" },
              ],
            },
            {
              id: "step-details",
              title: "Детали услуги",
              content: "Наша услуга включает [ДЕТАЛИ]. Мы работаем с компаниями как ваша уже [ВРЕМЯ] лет.",
              options: [
                { text: "Звучит интересно", nextStep: "step-price" },
                { text: "Нужно подумать", nextStep: "step-callback" },
                { text: "Не подходит", nextStep: "step-objection" },
              ],
            },
            {
              id: "step-price",
              title: "Обсуждение цены",
              content:
                "Стоимость услуги составляет [ЦЕНА]. Для компаний вашего размера мы предлагаем специальные условия.",
              options: [
                { text: "Приемлемо", nextStep: "step-close" },
                { text: "Дорого", nextStep: "step-discount" },
                { text: "Нужно обсудить с руководством", nextStep: "step-callback" },
                { text: "Есть ли рассрочка?", nextStep: "step-payment" },
                { text: "Что входит в эту цену?", nextStep: "step-details" },
              ],
            },
            {
              id: "step-discount",
              title: "Предложение скидки",
              content:
                "Понимаю ваши опасения по цене. Мы можем предложить скидку [СКИДКА]% при заключении договора сегодня.",
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
            {
              id: "step-proposal",
              title: "Коммерческое предложение",
              content: "Конечно! Я подготовлю персональное коммерческое предложение. На какой email отправить?",
              options: [{ text: "Дал email", nextStep: "step-callback" }],
            },
            {
              id: "step-portfolio",
              title: "Примеры работ",
              content: "У нас есть отличные кейсы работы с [ОТРАСЛЬ]. Могу показать конкретные результаты.",
              options: [
                { text: "Покажите", nextStep: "step-benefits" },
                { text: "Пришлите на email", nextStep: "step-proposal" },
                { text: "Не впечатляет", nextStep: "step-objection" },
              ],
            },
            {
              id: "step-test",
              title: "Тестовое задание",
              content: "Отличная идея! Мы можем выполнить небольшое тестовое задание бесплатно.",
              options: [
                { text: "Договорились", nextStep: "step-callback" },
                { text: "Сколько времени займет?", nextStep: "step-timeline" },
              ],
            },
            {
              id: "step-guarantee",
              title: "Гарантии",
              content: "Мы предоставляем гарантию [ГАРАНТИЯ] и полное сопровождение проекта.",
              options: [
                { text: "Устраивает", nextStep: "step-price" },
                { text: "Нужны дополнительные гарантии", nextStep: "step-objection" },
              ],
            },
            {
              id: "step-timeline",
              title: "Сроки выполнения",
              content: "Обычно проект занимает [СРОК]. Для вашей задачи это может быть [КОНКРЕТНЫЙ_СРОК].",
              options: [
                { text: "Подходящие сроки", nextStep: "step-price" },
                { text: "Слишком долго", nextStep: "step-objection" },
                { text: "Можно ли быстрее?", nextStep: "step-urgent" },
              ],
            },
            {
              id: "step-payment",
              title: "Условия оплаты",
              content: "Мы предлагаем гибкие условия оплаты: предоплата 50%, остальное по завершении.",
              options: [
                { text: "Устраивает", nextStep: "step-close" },
                { text: "Можно ли другие условия?", nextStep: "step-objection" },
              ],
            },
            {
              id: "step-urgent",
              title: "Срочное выполнение",
              content: "Да, можем выполнить в ускоренном режиме за [СРОЧНЫЙ_СРОК], но это будет стоить на 20% дороже.",
              options: [
                { text: "Согласен на доплату", nextStep: "step-close" },
                { text: "Тогда в обычном режиме", nextStep: "step-price" },
              ],
            },
          ],
          createdAt: new Date().toISOString(),
        },
        {
          id: "demo-support",
          name: "Техническая поддержка",
          description: "Сценарий для обработки обращений в техническую поддержку с диагностикой проблем",
          steps: [
            {
              id: "support-1",
              title: "Приветствие поддержки",
              content: "Здравствуйте! Техническая поддержка [КОМПАНИЯ]. Меня зовут [ИМЯ]. Как дела с вашим [ПРОДУКТ]?",
              options: [
                { text: "Все работает отлично", nextStep: "support-feedback" },
                { text: "Есть проблемы", nextStep: "support-problem" },
                { text: "Нужна помощь с настройкой", nextStep: "support-setup" },
                { text: "Хочу обновить тариф", nextStep: "support-upgrade" },
                { text: "Рассматриваю отказ от услуг", nextStep: "support-retention" },
              ],
            },
            {
              id: "support-problem",
              title: "Выяснение проблемы",
              content: "Понял, что возникли сложности. Расскажите подробнее, что именно не работает?",
              options: [
                { text: "Не загружается система", nextStep: "support-loading" },
                { text: "Ошибка при входе", nextStep: "support-login" },
                { text: "Медленно работает", nextStep: "support-performance" },
                { text: "Не сохраняются данные", nextStep: "support-data" },
                { text: "Другая проблема", nextStep: "support-other" },
              ],
            },
            {
              id: "support-loading",
              title: "Проблемы с загрузкой",
              content: "Проверим подключение. Какой у вас браузер и когда проблема началась?",
              options: [
                { text: "Chrome, сегодня утром", nextStep: "support-browser-fix" },
                { text: "Safari, вчера", nextStep: "support-browser-fix" },
                { text: "Firefox, неделю назад", nextStep: "support-escalate" },
                { text: "Edge, только что", nextStep: "support-browser-fix" },
              ],
            },
            {
              id: "support-login",
              title: "Проблемы со входом",
              content: "Какую ошибку вы видите при попытке войти в систему?",
              options: [
                { text: "Неверный пароль", nextStep: "support-password" },
                { text: "Аккаунт заблокирован", nextStep: "support-blocked" },
                { text: "Страница не отвечает", nextStep: "support-loading" },
              ],
            },
            {
              id: "support-password",
              title: "Восстановление пароля",
              content: "Давайте сбросим пароль. Подтвердите ваш email для отправки ссылки восстановления.",
              options: [{ text: "Email подтвержден", nextStep: "support-resolved" }],
            },
            {
              id: "support-blocked",
              title: "Разблокировка аккаунта",
              content: "Вижу, что аккаунт заблокирован из-за подозрительной активности. Разблокирую прямо сейчас.",
              options: [
                { text: "Спасибо, теперь работает", nextStep: "support-resolved" },
                { text: "Все еще не работает", nextStep: "support-escalate" },
              ],
            },
            {
              id: "support-performance",
              title: "Проблемы с производительностью",
              content: "Медленная работа может быть связана с нагрузкой. Попробуйте очистить кэш браузера.",
              options: [
                { text: "Помогло, стало быстрее", nextStep: "support-resolved" },
                { text: "Не помогло", nextStep: "support-escalate" },
              ],
            },
            {
              id: "support-data",
              title: "Проблемы с данными",
              content: "Проблемы с сохранением серьезны. Проверю логи системы и свяжусь с разработчиками.",
              options: [{ text: "Хорошо, жду решения", nextStep: "support-escalate" }],
            },
            {
              id: "support-other",
              title: "Другие проблемы",
              content: "Опишите проблему подробнее, я постараюсь помочь или передам специалисту.",
              options: [{ text: "Описал проблему", nextStep: "support-escalate" }],
            },
            {
              id: "support-browser-fix",
              title: "Исправление браузера",
              content: "Попробуйте обновить браузер и очистить кэш. Также проверьте, не блокирует ли антивирус.",
              options: [
                { text: "Помогло!", nextStep: "support-resolved" },
                { text: "Не помогло", nextStep: "support-escalate" },
              ],
            },
            {
              id: "support-setup",
              title: "Помощь с настройкой",
              content: "С удовольствием помогу с настройкой. Что именно нужно настроить?",
              options: [
                { text: "Интеграцию с CRM", nextStep: "support-integration" },
                { text: "Пользователей и права", nextStep: "support-users" },
                { text: "Отчеты", nextStep: "support-reports" },
              ],
            },
            {
              id: "support-integration",
              title: "Настройка интеграции",
              content: "Для интеграции с CRM нужны API ключи. Есть ли у вас доступ к настройкам CRM?",
              options: [
                { text: "Да, есть доступ", nextStep: "support-resolved" },
                { text: "Нет, нужно получить", nextStep: "support-callback" },
              ],
            },
            {
              id: "support-users",
              title: "Настройка пользователей",
              content:
                "Покажу как добавлять пользователей и настраивать права доступа. Сколько пользователей планируете?",
              options: [
                { text: "До 10 человек", nextStep: "support-resolved" },
                { text: "Больше 10", nextStep: "support-enterprise" },
              ],
            },
            {
              id: "support-reports",
              title: "Настройка отчетов",
              content: "Какие отчеты вам нужны? Могу настроить стандартные или создать кастомные.",
              options: [
                { text: "Стандартные подойдут", nextStep: "support-resolved" },
                { text: "Нужны кастомные", nextStep: "support-custom" },
              ],
            },
            {
              id: "support-upgrade",
              title: "Обновление тарифа",
              content: "Отлично! Какие дополнительные возможности вас интересуют?",
              options: [
                { text: "Больше пользователей", nextStep: "support-users-upgrade" },
                { text: "Дополнительные интеграции", nextStep: "support-integrations-upgrade" },
                { text: "Приоритетная поддержка", nextStep: "support-priority" },
              ],
            },
            {
              id: "support-retention",
              title: "Удержание клиента",
              content: "Жаль это слышать. Что вас не устраивает? Возможно, мы сможем решить проблему.",
              options: [
                { text: "Слишком дорого", nextStep: "support-discount" },
                { text: "Не хватает функций", nextStep: "support-features" },
                { text: "Сложно использовать", nextStep: "support-training" },
                { text: "Нашли другое решение", nextStep: "support-competitor" },
              ],
            },
            {
              id: "support-resolved",
              title: "Проблема решена",
              content: "Отлично! Проблема решена. Есть ли еще вопросы по работе с системой?",
              options: [
                { text: "Нет, все понятно", nextStep: "support-feedback" },
                { text: "Есть еще вопросы", nextStep: "support-1" },
              ],
            },
            {
              id: "support-escalate",
              title: "Эскалация проблемы",
              content: "Передаю вашу проблему техническим специалистам. Они свяжутся с вами в течение 2 часов.",
              options: [{ text: "Хорошо, жду", nextStep: "support-callback" }],
            },
            {
              id: "support-callback",
              title: "Обратный звонок",
              content: "Когда вам удобно получить обратный звонок от наших специалистов?",
              options: [
                { text: "Сегодня до 18:00", nextStep: "end" },
                { text: "Завтра утром", nextStep: "end" },
                { text: "В любое время", nextStep: "end" },
              ],
            },
            {
              id: "support-feedback",
              title: "Обратная связь",
              content: "Спасибо за обращение! Оцените качество поддержки от 1 до 5.",
              options: [
                { text: "5 - отлично", nextStep: "end" },
                { text: "4 - хорошо", nextStep: "end" },
                { text: "3 - нормально", nextStep: "end" },
                { text: "2 - плохо", nextStep: "support-improve" },
                { text: "1 - ужасно", nextStep: "support-improve" },
              ],
            },
            {
              id: "support-improve",
              title: "Улучшение сервиса",
              content: "Спасибо за честную оценку. Что мы можем улучшить в нашей поддержке?",
              options: [
                { text: "Быстрее отвечать", nextStep: "end" },
                { text: "Лучше объяснять", nextStep: "end" },
                { text: "Больше знать о продукте", nextStep: "end" },
              ],
            },
          ],
          createdAt: new Date().toISOString(),
        },
      ]

      setScenarios(demoScenarios)
      localStorage.setItem("call-scenarios", JSON.stringify(demoScenarios))
    }
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ru-RU")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Phone className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Call Assistant</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Профессиональный помощник для телефонных звонков с настраиваемыми сценариями
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <Link href="/scenarios/manage">
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <Settings className="h-4 w-4" />
              Управление сценариями
            </Button>
          </Link>
          <Link href="/instructions">
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <BookOpen className="h-4 w-4" />
              Инструкции
            </Button>
          </Link>
        </div>

        {/* Scenarios Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {scenarios.map((scenario) => (
            <Card key={scenario.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{scenario.name}</CardTitle>
                    <CardDescription className="mt-2">{scenario.description}</CardDescription>
                  </div>
                  <Badge variant="secondary">{scenario.steps.length} шагов</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-500">Создан: {formatDate(scenario.createdAt)}</div>
                  {scenario.lastUsed && (
                    <div className="text-sm text-gray-500">Последний раз: {formatDate(scenario.lastUsed)}</div>
                  )}
                  <div className="flex gap-2">
                    <Link href={`/scenarios/${scenario.id}`} className="flex-1">
                      <Button className="w-full flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        Начать звонок
                      </Button>
                    </Link>
                    <Link href={`/scenarios/visual-editor/${scenario.id}`}>
                      <Button variant="outline" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add New Scenario Card */}
          <Card className="border-dashed border-2 border-gray-300 hover:border-blue-400 transition-colors">
            <CardContent className="flex flex-col items-center justify-center h-full min-h-[200px]">
              <Link href="/scenarios/create">
                <Button variant="ghost" className="flex flex-col items-center gap-2 h-auto p-6">
                  <Plus className="h-12 w-12 text-gray-400" />
                  <span className="text-lg font-medium text-gray-600">Создать новый сценарий</span>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {scenarios.length === 0 && (
          <div className="text-center py-12">
            <Phone className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">Нет доступных сценариев</h3>
            <p className="text-gray-500 mb-6">Создайте свой первый сценарий для начала работы</p>
            <Link href="/scenarios/create">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Создать сценарий
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
