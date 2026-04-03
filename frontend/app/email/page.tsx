"use client"

import { useState } from "react"
import Link from "next/link"

export default function EmailSimulator() {
  const [emails, setEmails] = useState([
    {
      id: "1",
      from: "support@bank-center.ru",
      name: "Центр-Инвест Банк",
      subject: "Срочно: Подтвердите ваш аккаунт",
      body: "Уважаемый клиент! Для предотвращения блокировки вашего счета подтвердите личные данные по ссылке...",
      attachments: ["document.pdf"],
      isThreat: true,
      threatType: "phishing",
    },
    {
      id: "2",
      from: "colleague@company.ru",
      name: "Иван Петров",
      subject: "Отчет за прошлый месяц",
      body: "Привет! Высылаю отчет, посмотри пожалуйста.",
      attachments: ["report.xlsx"],
      isThreat: false,
    },
  ])
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null)
  const [result, setResult] = useState<{correct: boolean; message: string} | null>(null)

  const handleAction = (emailId: string, action: string) => {
    const email = emails.find(e => e.id === emailId)
    if (!email) return

    const isCorrect = 
      (email.isThreat && action === "delete") ||
      (!email.isThreat && action === "open")

    setResult({
      correct: isCorrect,
      message: isCorrect 
        ? "Правильно! Вы идентифицировали угрозу." 
        : "Неправильно. Подумайте еще раз."
    })
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">← На главную</Link>
          <h1 className="text-xl">📧 Симулятор почты</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="font-semibold mb-2">📬 Входящие письма</h2>
          <p className="text-gray-600 text-sm">Проанализируйте письма и определите, какие из них могут быть опасны.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emails.map(email => (
            <div 
              key={email.id}
              className={`bg-white rounded-lg shadow-md p-4 cursor-pointer border-2 ${
                selectedEmail === email.id ? "border-blue-500" : "border-transparent"
              } hover:border-blue-300`}
              onClick={() => setSelectedEmail(email.id)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold">{email.name}</p>
                  <p className="text-sm text-gray-600">{email.from}</p>
                </div>
                <span className="text-2xl">📧</span>
              </div>
              <p className="font-medium mt-2">{email.subject}</p>
              {email.attachments.length > 0 && (
                <p className="text-sm text-gray-500 mt-1">Вложения: {email.attachments.join(", ")}</p>
              )}
            </div>
          ))}
        </div>

        {selectedEmail && (
          <div className="mt-4 bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold mb-2">Содержание письма:</h3>
            <p className="text-gray-700 mb-4">
              {emails.find(e => e.id === selectedEmail)?.body}
            </p>
            <div className="flex gap-2">
              <button 
                onClick={() => handleAction(selectedEmail, "open")}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Открыть вложение
              </button>
              <button 
                onClick={() => handleAction(selectedEmail, "delete")}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Удалить письмо
              </button>
              <button 
                onClick={() => handleAction(selectedEmail, "report")}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
              >
                Пожаловаться
              </button>
            </div>
          </div>
        )}

        {result && (
          <div className={`mt-4 p-4 rounded-lg ${result.correct ? "bg-green-100 border-green-500" : "bg-red-100 border-red-500"} border-l-4`}>
            <p className={`font-semibold ${result.correct ? "text-green-700" : "text-red-700"}`}>
              {result.message}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
