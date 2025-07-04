"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, FileText, Table, Download, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function InstructionsPage() {
  const downloadTemplate = () => {
    const template = {
      name: "Пример сценария",
      description: "Описание сценария",
      webhookUrl: "https://api.example.com/webhook",
      steps: [
        {
          id: "step-1",
          title: "Приветствие",
          content: "Здравствуйте! Меня зовут [ИМЯ] из компании [КОМПАНИЯ]",
          options: [
            {
              text: "Клиент согласился слушать",
              nextStep: "step-2",
            },
            {
              text: "Клиент не заинтересован",
              nextStep: "end",
            },
          ],
        },
        {
          id: "step-2",
          title: "Презентация",
          content: "Мы предлагаем услугу, которая поможет вам [ВЫГОДА]",
          options: [
            {
              text: "Интересно, расскажите подробнее",
              nextStep: "end",
            },
            {
              text: "Не подходит",
              nextStep: "end",
            },
          ],
        },
      ],
    }

    const dataStr = JSON.stringify(template, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = "scenario-template.json"
    link.click()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Инструкции</h1>
            <p className="text-gray-600">Руководство по созданию и настройке сценариев</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Обзор системы</CardTitle>
              <CardDescription>Call Assistant помогает проводить структурированные телефонные звонки</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Система позволяет создавать интерактивные сценарии для телефонных звонков с пошаговыми инструкциями и
                вариантами ответов клиентов. Каждый сценарий состоит из шагов, где каждый шаг содержит:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Текст для произнесения оператором</li>
                <li>Варианты возможных ответов клиента</li>
                <li>Переходы к следующим шагам в зависимости от ответа</li>
              </ul>
            </CardContent>
          </Card>

          {/* Creating Scenarios */}
          <Card>
            <CardHeader>
              <CardTitle>Создание сценариев</CardTitle>
              <CardDescription>Три способа создания сценариев в системе</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-2">1. Через веб-интерфейс</h4>
                <p className="text-gray-700 mb-2">Используйте встроенный редактор для создания сценариев пошагово:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                  <li>Перейдите в "Управление сценариями"</li>
                  <li>Нажмите "Создать сценарий"</li>
                  <li>Заполните основную информацию</li>
                  <li>Добавьте шаги и варианты ответов</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">2. Импорт JSON файла</h4>
                <p className="text-gray-700 mb-2">Создайте JSON файл со структурой сценария и импортируйте его:</p>
                <Button onClick={downloadTemplate} variant="outline" className="mb-2 bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Скачать шаблон JSON
                </Button>
              </div>

              <div>
                <h4 className="font-semibold mb-2">3. Подготовка в Google Docs/Sheets</h4>
                <p className="text-gray-700">
                  Структурируйте сценарий в Google Docs или Sheets, затем конвертируйте в JSON
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Google Docs Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Работа с Google Docs
              </CardTitle>
              <CardDescription>Как структурировать сценарий в Google Docs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Структура документа:</h4>
                <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                  <div className="space-y-2">
                    <div>
                      <strong>СЦЕНАРИЙ: Название сценария</strong>
                    </div>
                    <div>
                      <strong>ОПИСАНИЕ:</strong> Краткое описание
                    </div>
                    <div>
                      <strong>WEBHOOK:</strong> https://api.example.com/webhook
                    </div>
                    <div className="mt-4">
                      <div>
                        <strong>ШАГ 1: Приветствие</strong>
                      </div>
                      <div>ТЕКСТ: Здравствуйте! Меня зовут [ИМЯ]...</div>
                      <div>ВАРИАНТЫ:</div>
                      <div>- Да, слушаю → ШАГ 2</div>
                      <div>- Нет времени → ШАГ 3</div>
                      <div>- Не интересно → КОНЕЦ</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Правила оформления:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Используйте заголовки для названий шагов</li>
                  <li>Четко разделяйте текст для произнесения и варианты ответов</li>
                  <li>Указывайте переходы в формате "Ответ → Следующий шаг"</li>
                  <li>Используйте переменные в квадратных скобках: [ИМЯ], [КОМПАНИЯ]</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Google Sheets Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Table className="h-5 w-5" />
                Работа с Google Sheets
              </CardTitle>
              <CardDescription>Табличная структура для сценариев</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Структура таблицы:</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 p-2">ID Шага</th>
                        <th className="border border-gray-300 p-2">Название</th>
                        <th className="border border-gray-300 p-2">Текст</th>
                        <th className="border border-gray-300 p-2">Вариант 1</th>
                        <th className="border border-gray-300 p-2">Переход 1</th>
                        <th className="border border-gray-300 p-2">Вариант 2</th>
                        <th className="border border-gray-300 p-2">Переход 2</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 p-2">step-1</td>
                        <td className="border border-gray-300 p-2">Приветствие</td>
                        <td className="border border-gray-300 p-2">Здравствуйте!</td>
                        <td className="border border-gray-300 p-2">Да, слушаю</td>
                        <td className="border border-gray-300 p-2">step-2</td>
                        <td className="border border-gray-300 p-2">Не интересно</td>
                        <td className="border border-gray-300 p-2">end</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Экспорт из Google Sheets:</h4>
                <ol className="list-decimal list-inside space-y-1 text-gray-700">
                  <li>Файл → Скачать → Comma Separated Values (.csv)</li>
                  <li>Конвертируйте CSV в JSON используя онлайн-конвертеры</li>
                  <li>Импортируйте JSON файл в систему</li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Variables and Webhooks */}
          <Card>
            <CardHeader>
              <CardTitle>Переменные и Webhook</CardTitle>
              <CardDescription>Динамические данные в сценариях</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Использование переменных:</h4>
                <p className="text-gray-700 mb-2">
                  Переменные позволяют вставлять динамические данные в текст сценария:
                </p>
                <div className="bg-gray-50 p-3 rounded font-mono text-sm">
                  Здравствуйте, [ИМЯ]! Звоню из компании [КОМПАНИЯ] по поводу [УСЛУГА].
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Настройка Webhook:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>Укажите URL webhook при создании сценария</li>
                  <li>Система автоматически загрузит данные при запуске сценария</li>
                  <li>Данные сохраняются локально для избежания повторных запросов</li>
                  <li>Webhook должен возвращать JSON с парами ключ-значение</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Пример ответа Webhook:</h4>
                <div className="bg-gray-50 p-3 rounded font-mono text-sm">
                  {`{
  "ИМЯ": "Иван Петров",
  "КОМПАНИЯ": "ООО Технологии",
  "ТЕЛЕФОН": "+7 (999) 123-45-67",
  "УСЛУГА": "веб-разработка"
}`}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Best Practices */}
          <Card>
            <CardHeader>
              <CardTitle>Лучшие практики</CardTitle>
              <CardDescription>Рекомендации по созданию эффективных сценариев</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Делайте шаги короткими и понятными</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Предусматривайте различные варианты ответов клиентов</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Используйте переменные для персонализации</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Тестируйте сценарии перед использованием</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>Регулярно обновляйте сценарии на основе опыта</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Support */}
          <Card>
            <CardHeader>
              <CardTitle>Поддержка</CardTitle>
              <CardDescription>Дополнительные ресурсы и помощь</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Если у вас возникли вопросы или нужна помощь в настройке сценариев, вы можете обратиться к следующим
                ресурсам:
              </p>
              <div className="flex flex-wrap gap-4">
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <ExternalLink className="h-4 w-4" />
                  Документация API
                </Button>
                <Button variant="outline" className="flex items-center gap-2 bg-transparent">
                  <ExternalLink className="h-4 w-4" />
                  Примеры сценариев
                </Button>
                <Button onClick={downloadTemplate} variant="outline" className="flex items-center gap-2 bg-transparent">
                  <Download className="h-4 w-4" />
                  Шаблон JSON
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
