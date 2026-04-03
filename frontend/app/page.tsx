import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">CyberSimulator</h1>
        <p className="text-gray-600 mb-8">Интерактивный веб-симулятор для повышения цифровой грамотности и безопасности</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/email" className="block bg-white p-6 rounded-lg shadow-md border-2 border-blue-500 hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-4">📧 Симулятор почты</h2>
            <p className="text-gray-600 mb-4">Обнаруживайте фишинговые письма и вредоносные вложения</p>
            <span className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Открыть</span>
          </Link>
          
          <Link href="/social" className="block bg-white p-6 rounded-lg shadow-md border-2 border-green-500 hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-4">📱 Социальные сети</h2>
            <p className="text-gray-600 mb-4">Распознавайте мошеннические сообщения и фейковые профили</p>
            <span className="inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Открыть</span>
          </Link>
          
          <div className="bg-white p-6 rounded-lg shadow-md border-2 border-purple-500 hover:shadow-lg transition">
            <h2 className="text-xl font-semibold mb-4">🌐 Браузер</h2>
            <p className="text-gray-600 mb-4">Изучите фишинговые сайты и поддельные формы ввода</p>
            <span className="inline-block bg-purple-500 text-white px-4 py-2 rounded">Скоро</span>
          </div>
        </div>

        <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <p className="text-yellow-800">⚠️ Выберите среду для начала. Каждая среда содержит реалистичные сценарии кибератак.</p>
        </div>
      </div>
    </main>
  )
}
