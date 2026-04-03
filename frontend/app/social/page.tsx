"use client"

import { useState } from "react"
import Link from "next/link"

export default function SocialSimulator() {
  const [posts, setPosts] = useState([
    {
      id: "1",
      user: "MegaShop",
      avatar: "🛒",
      content: "Поздравляем! Вы выиграли iPhone 15! Перейдите по ссылке для получения приза...",
      isThreat: true,
      threatType: "phishing",
    },
    {
      id: "2",
      user: "Иван Петров",
      avatar: "👤",
      content: "Всем привет! Хорошая погода сегодня, идем на прогулку?",
      isThreat: false,
    },
  ])
  const [selectedPost, setSelectedPost] = useState<string | null>(null)
  const [result, setResult] = useState<{correct: boolean; message: string} | null>(null)

  const handleAction = (postId: string, action: string) => {
    const post = posts.find(p => p.id === postId)
    if (!post) return

    const isCorrect = 
      (post.isThreat && action === "ignore") ||
      (!post.isThreat && action === "respond")

    setResult({
      correct: isCorrect,
      message: isCorrect 
        ? "Правильно! Вы поступили безопасно." 
        : "Неправильно. Подумайте еще раз."
    })
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-green-600 text-white p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">← На главную</Link>
          <h1 className="text-xl">📱 Симулятор соцсетей</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
          <h2 className="font-semibold mb-2">📱 Лента новостей</h2>
          <p className="text-gray-600 text-sm">Проанализируйте сообщения и определите, какие из них могут быть опасны.</p>
        </div>

        <div className="space-y-4">
          {posts.map(post => (
            <div 
              key={post.id}
              className={`bg-white rounded-lg shadow-md p-4 cursor-pointer border-2 ${
                selectedPost === post.id ? "border-green-500" : "border-transparent"
              } hover:border-green-300`}
              onClick={() => setSelectedPost(post.id)}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{post.avatar}</span>
                <div>
                  <p className="font-semibold">{post.user}</p>
                  <p className="text-gray-700 mt-1">{post.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedPost && (
          <div className="mt-4 bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold mb-2">Выберите действие:</h3>
            <div className="flex gap-2 flex-wrap">
              <button 
                onClick={() => handleAction(selectedPost, "respond")}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Ответить
              </button>
              <button 
                onClick={() => handleAction(selectedPost, "ignore")}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Проигнорировать
              </button>
              <button 
                onClick={() => handleAction(selectedPost, "report")}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
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
