"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"

const scenarios = {
  office: {
    title: "🏢 Офис",
    levels: {
      1: {
        name: "Утренняя почта",
        attack: "Фишинг",
        theory: `
          <h3>📧 Что такое фишинг?</h3>
          <p>Фишинг — это вид социальной инженерии, при котором злоумышленники выдают себя за надёжные источники для кражи личных данных.</p>
          
          <h4>🔍 Признаки фишингового письма:</h4>
          <ul>
            <li><strong>Подозрительный отправитель</strong> — адрес не соответствует официальному домену организации</li>
            <li><strong>Срочность</strong> — "Срочно!", "Немедленно!", "Ваш аккаунт будет заблокирован..."</li>
            <li><strong>Общие обращения</strong> — "Уважаемый клиент" вместо вашего имени</li>
            <li><strong>Подозрительные ссылки</strong> — наведите курсор, чтобы увидеть настоящий URL</li>
            <li><strong>Орфографические ошибки</strong> — опечатки и грамматические ошибки</li>
          </ul>

          <h4>✅ Что делать:</h4>
          <ul>
            <li>Проверяйте адрес отправителя</li>
            <li>Не переходите по ссылкам из писем</li>
            <li>При сомнениях свяжитесь с отправителем другим способом</li>
            <li>Сообщайте о подозрительных письмах в IT-отдел</li>
          </ul>
        `,
        sandbox: "email-client",
        sandboxPort: 9082,
        action: "Проверьте входящие письма и определите фишинговые",
        correctAction: "Удалить подозрительные письма, не переходить по ссылкам"
      },
      2: {
        name: "USB-флешка",
        attack: "Вредоносное ПО",
        theory: `
          <h3>💾 Опасность USB-устройств</h3>
          <p>USB-накопители могут содержать вредоносное программное обеспечение, которое активируется при подключении к компьютеру.</p>
          
          <h4>⚠️ Типы угроз:</h4>
          <ul>
            <li><strong>BadUSB</strong> — перепрограммированная флешка, которая эмулирует клавиатуру</li>
            <li><strong>Autorun-вирусы</strong> — автоматически запускаются при подключении</li>
            <li><strong>Шпионское ПО</strong> — крадут файлы и данные</li>
            <li><strong>Физический ущерб</strong> — устройства, убивающие компьютеры</li>
          </ul>

          <h4>✅ Как защититься:</h4>
          <ul>
            <li>Никогда не подключайте найденные USB-устройства</li>
            <li>Отключите автозапуск (Autorun) на компьютере</li>
            <li>Используйте USB-ловушки для проверки портов</li>
            <li>Проверяйте устройства антивирусом перед открытием</li>
          </ul>
        `,
        sandbox: "phishing",
        sandboxPort: 9081,
        action: "Вам оставили USB-флешку на столе. Что делать?",
        correctAction: "Не подключать к компьютеру, сдать в IT-отдел"
      },
      3: {
        name: "Звонок \"IT-поддержки\"",
        attack: "Социальная инженерия",
        theory: `
          <h3>📞 Социальная инженерия по телефону</h3>
          <p>Злоумышленники могут звонить, представляясь сотрудниками поддержки, банков или других организаций.</p>
          
          <h4>🎭 Распространённые сценарии:</h4>
          <ul>
            <li><strong>"Ваш компьютер заражён"</strong> — пугают и выманивают доступ</li>
            <li><strong>"Мы из службы безопасности"</strong> — просят данные карты</li>
            <li><strong>"Вы выиграли приз"</strong> — требуют оплату "комиссии"</li>
            <li><strong>"Ваш родственник в беде"</strong> — давление на эмоции</li>
          </ul>

          <h4>✅ Правила безопасности:</h4>
          <ul>
            <li>Никогда не сообщайте пароли и PIN-коды</li>
            <li>Не позволяйте удалённый доступ посторонним</li>
            <li>Проверяйте информацию через официальные каналы</li>
            <li>Не торопитесь с решениями</li>
          </ul>
        `,
        sandbox: "social-network",
        sandboxPort: 9084,
        action: "Вам звонит \"сотрудник IT\" и просит пароль",
        correctAction: "Отказать, перезвонить в IT-отдел по официальному номеру"
      }
    }
  },
  home: {
    title: "🏠 Дом",
    levels: {
      1: {
        name: "Письмо из \"банка\"",
        attack: "Фишинг",
        theory: `
          <h3>🏦 Банковский фишинг</h3>
          <p>Мошенники часто притворяются банками, чтобы украсть данные карт и доступ к счетам.</p>
          
          <h4>🚩 Красные флаги банковского фишинга:</h4>
          <ul>
            <li><strong>Запрос полных данных карты</strong> — банк никогда не спрашивает CVC и полный номер</li>
            <li><strong>Ссылка на поддельный сайт</strong> — URL отличается от настоящего</li>
            <li><strong>Угрозы блокировки</strong> — "Срочно!", "Иначе заблокируем"</li>
            <li><strong>Незапрошенные письма</strong> — вы не делали никаких действий</li>
          </ul>

          <h4>✅ Проверяйте:</h4>
          <ul>
            <li>Официальный домен банка в адресе</li>
            <li>Наличие HTTPS (замок в адресной строке)</li>
            <li>Логичность письма (вы ожидали его?)</li>
            <li>Возможность войти через официальное приложение</li>
          </ul>
        `,
        sandbox: "phishing",
        sandboxPort: 9081,
        action: "Проверьте интернет-банк на подлинность",
        correctAction: "Распознать поддельный сайт и не вводить данные"
      },
      2: {
        name: "Сильный пароль",
        attack: "Безопасность паролей",
        theory: `
          <h3>🔐 Создание надёжных паролей</h3>
          <p>Слабые пароли — одна из главных причин взломов. Изучите принципы создания безопасных паролей.</p>
          
          <h4>❌ Плохие пароли:</h4>
          <ul>
            <li><strong>123456, password, qwerty</strong> — в топе по взлому</li>
            <li><strong>Даты рождения, имена</strong> — легко угадать</li>
            <li><strong>Одно слово</strong> — уязвимы к словарным атакам</li>
            <li><strong>Один пароль везде</strong> — компрометация всего</li>
          </ul>

          <h4>✅ Хорошие пароли:</h4>
          <ul>
            <li><strong>Длина от 12 символов</strong> — чем длиннее, тем лучше</li>
            <li><strong>Смешение регистров, цифр, спецсимволов</strong></li>
            <li><strong>Менеджер паролей</strong> — уникальные пароли везде</li>
            <li><strong>Двухфакторная аутентификация (2FA)</strong></li>
          </ul>
        `,
        sandbox: "phishing",
        sandboxPort: 9081,
        action: "Создайте новый пароль для аккаунта",
        correctAction: "Использовать менеджер паролей и 2FA"
      },
      3: {
        name: "Обновление системы",
        attack: "Социальная инженерия",
        theory: `
          <h3>⚙️ Фейковые обновления</h3>
          <p>Мошенники используют поддельные уведомления об обновлениях для распространения вредоносного ПО.</p>
          
          <h4>🎯 Методы атак:</h4>
          <ul>
            <li><strong>Фейковые сайты</strong> — имитируют официальные страницы обновлений</li>
            <li><strong>Всплывающие окна</strong> — пугают "критическим обновлением"</li>
            <li><strong>Email-рассылки</strong> — призывают срочно обновиться</li>
            <li><strong>Реклама в поисковиках</strong> — поддельные ссылки в топе</li>
          </ul>

          <h4>✅ Правила:</h4>
          <ul>
            <li>Обновляйтесь только через официальные настройки системы</li>
            <li>Никогда не переходите по ссылкам в письмах</li>
            <li>Проверяйте URL вручную</li>
            <li>Включите автоматические обновления</li>
          </ul>
        `,
        sandbox: "email-client",
        sandboxPort: 9082,
        action: "Найдите подозрительное письмо об обновлении",
        correctAction: "Обновляться только через официальные каналы"
      }
    }
  },
  public: {
    title: "📶 Общественный Wi-Fi",
    levels: {
      1: {
        name: "Выбор сети",
        attack: "Evil Twin",
        theory: `
          <h3>👻 Атака \"Злой двойник\" (Evil Twin)</h3>
          <p>Злоумышленник создаёт поддельную точку доступа с привлекательным названием для перехвата данных.</p>
          
          <h4>⚠️ Как это работает:</h4>
          <ul>
            <li><strong>Сканирование</strong> — мошенник видит доступные сети</li>
            <li><strong>Клонирование</strong> — создаёт точку с похожим названием</li>
            <li><strong>Перехват</strong> — весь трафик идёт через его устройство</li>
            <li><strong>Кража данных</strong> — пароли, cookies, личная информация</li>
          </ul>

          <h4>✅ Защита:</h4>
          <ul>
            <li>Уточняйте у персонала правильное название сети</li>
            <li>Избегайте сетей без пароля для важных дел</li>
            <li>Используйте VPN — он шифрует трафик</li>
            <li>Отключайте автоподключение к Wi-Fi</li>
          </ul>
        `,
        sandbox: "wifi-hotspot",
        sandboxPort: 9083,
        action: "Выберите безопасную сеть для подключения",
        correctAction: "Подключиться к официальной или защищённой сети"
      },
      2: {
        name: "Банкомат",
        attack: "Скимминг",
        theory: `
          <h3>💳 Скимминг</h3>
          <p>Преступники устанавливают считывающие устройства на банкоматы для кражи данных карт и PIN-кодов.</p>
          
          <h4>🔍 Как распознать скиммер:</h4>
          <ul>
            <li><strong>Накладка на картоприёмник</strong> — необычный цвет, форма, люфт</li>
            <li><strong>Накладка на клавиатуру</strong> — толщина, другие кнопки</li>
            <li><strong>Мини-камера</strong> — направлена на клавиатуру</li>
            <li><strong>Посторонние устройства</strong> — Bluetooth-модули, провода</li>
          </ul>

          <h4>✅ Правила безопасности:</h4>
          <ul>
            <li>Используйте банкоматы внутри банков</li>
            <li>Закрывайте клавиатуру рукой при вводе PIN</li>
            <li>Проверяйте банкомат перед использованием</li>
            <li>Не принимайте помощь от незнакомцев</li>
          </ul>
        `,
        sandbox: "atm-simulator",
        sandboxPort: 9085,
        action: "Проверьте банкомат на наличие скиммера",
        correctAction: "Обнаружить и не использовать заражённый банкомат"
      },
      3: {
        name: "Работа в кафе",
        attack: "Перехват данных",
        theory: `
          <h3>☕ Безопасность в общественных местах</h3>
          <p>Работа с конфиденциальными данными в кафе требует дополнительных мер предосторожности.</p>
          
          <h4>👀 Визуальное наблюдение:</h4>
          <ul>
            <li><strong>Shoulder surfing</strong> — подглядывание через плечо</li>
            <li><strong>Отражение в окнах</strong> — информация на экране видна</li>
            <li><strong>Камеры наблюдения</strong> — могут захватить ваш экран</li>
          </ul>

          <h4>🛡️ Защита данных:</h4>
          <ul>
            <li><strong>Защитная плёнка</strong> — сужает угол обзора экрана</li>
            <li><strong>VPN</strong> — шифрует весь интернет-трафик</li>
            <li><strong>Блокировка компьютера</strong> — уходите — блокируйте</li>
            <li><strong>Двухфакторная аутентификация</strong> — дополнительная защита</li>
          </ul>
        `,
        sandbox: "wifi-hotspot",
        sandboxPort: 9083,
        action: "Безопасно работайте с конфиденциальными данными",
        correctAction: "Использовать VPN и защитную плёнку"
      }
    }
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

export default function ScenarioLevelPage() {
  const params = useParams()
  const scenarioId = params.id as string
  const levelId = parseInt(params.level as string)
  
  const scenario = scenarios[scenarioId as keyof typeof scenarios]
  const level = scenario?.levels[levelId as keyof typeof scenario.levels]

  const [result, setResult] = useState<{success: boolean; message: string} | null>(null)
  const [showTheory, setShowTheory] = useState(true)
  const [completed, setCompleted] = useState(false)
  const [sandboxRunning, setSandboxRunning] = useState(false)
  const [sandboxLoading, setSandboxLoading] = useState(false)

  const startSandbox = async () => {
    if (!level?.sandbox) return
    setSandboxLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/v1/sandbox/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: level.sandbox })
      })
      const data = await res.json()
      if (data.status === 'started' || data.status === 'already_running') {
        setSandboxRunning(true)
      }
    } catch (err) {
      console.error('Failed to start sandbox:', err)
    } finally {
      setSandboxLoading(false)
    }
  }

  const stopSandbox = async () => {
    if (!level?.sandbox) return
    setSandboxLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/v1/sandbox/stop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: level.sandbox })
      })
      const data = await res.json()
      if (data.status === 'stopped' || data.status === 'not_running') {
        setSandboxRunning(false)
      }
    } catch (err) {
      console.error('Failed to stop sandbox:', err)
    } finally {
      setSandboxLoading(false)
    }
  }

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'sandbox-result') {
        setResult(event.data)
        setCompleted(true)
        if (event.data.success) {
          setShowTheory(false)
        }
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  if (!scenario || !level) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl mb-4">Сценарий не найден</h1>
          <Link href="/scenarios" className="text-cyan-400 hover:underline">
            ← Вернуться к сценариям
          </Link>
        </div>
      </div>
    )
  }

  const sandboxUrl = `http://localhost:${level.sandboxPort}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <header className="bg-slate-800/80 backdrop-blur-sm border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/scenarios" className="text-slate-400 hover:text-white transition">
                ← Сценарии
              </Link>
              <span className="text-slate-600">/</span>
              <Link href={`/scenarios/${scenarioId}`} className="text-slate-400 hover:text-white transition">
                {scenario.title}
              </Link>
              <span className="text-slate-600">/</span>
              <span className="text-white">Уровень {levelId}</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-full text-sm font-medium">
                {level.attack}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl overflow-hidden">
              <button 
                onClick={() => setShowTheory(!showTheory)}
                className="w-full p-4 bg-slate-700/50 flex items-center justify-between text-white hover:bg-slate-700 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📚</span>
                  <span className="font-semibold">Теория</span>
                </div>
                <span>{showTheory ? '▼' : '▶'}</span>
              </button>
              {showTheory && (
                <div className="p-6 text-slate-300 leading-relaxed">
                  <div dangerouslySetInnerHTML={{ __html: level.theory }} />
                </div>
              )}
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <h4 className="font-semibold text-amber-400 mb-1">Задание:</h4>
                  <p className="text-slate-300">{level.action}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <h4 className="font-semibold text-green-400 mb-1">Правильное решение:</h4>
                  <p className="text-slate-300">{level.correctAction}</p>
                </div>
              </div>
            </div>

            {result && (
              <div className={`rounded-xl p-4 ${
                result.success 
                  ? 'bg-green-500/20 border border-green-500/50' 
                  : 'bg-red-500/20 border border-red-500/50'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{result.success ? '🎉' : '😕'}</span>
                  <div>
                    <h4 className={`font-semibold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                      {result.success ? 'Отлично!' : 'Неверно'}
                    </h4>
                    <p className="text-slate-300">{result.message}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl overflow-hidden">
            <div className="bg-slate-700/50 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className={`w-3 h-3 rounded-full ${sandboxRunning ? 'bg-green-500' : 'bg-slate-500'}`}></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <span className="text-slate-400 text-sm ml-4">
                  Интерактивная среда — {level.sandbox}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {sandboxRunning ? (
                  <button
                    onClick={stopSandbox}
                    disabled={sandboxLoading}
                    className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1 rounded-lg text-sm flex items-center gap-2 transition disabled:opacity-50"
                  >
                    {sandboxLoading ? '⏳' : '✕'} Остановить
                  </button>
                ) : (
                  <button
                    onClick={startSandbox}
                    disabled={sandboxLoading}
                    className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 py-1 rounded-lg text-sm flex items-center gap-2 transition disabled:opacity-50"
                  >
                    {sandboxLoading ? '⏳' : '▶'} Запустить
                  </button>
                )}
              </div>
            </div>
            <div className="h-[600px] bg-slate-900">
              {completed && result?.success ? (
                <div className="h-full flex items-center justify-center text-center p-8">
                  <div>
                    <div className="text-6xl mb-4">✅</div>
                    <h3 className="text-2xl font-bold text-white mb-2">Задание выполнено!</h3>
                    <p className="text-slate-400 mb-6">Вы успешно справились с заданием.</p>
                    <Link 
                      href={`/scenarios/${scenarioId}`}
                      className="inline-block bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-6 py-3 rounded-xl transition"
                    >
                      Следующий уровень →
                    </Link>
                  </div>
                </div>
              ) : !sandboxRunning ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="text-6xl mb-4">🎮</div>
                  <h3 className="text-xl font-bold text-white mb-2">Песочница остановлена</h3>
                  <p className="text-slate-400 mb-6">Нажмите кнопку "Запустить" для начала работы</p>
                  <button
                    onClick={startSandbox}
                    disabled={sandboxLoading}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold px-6 py-3 rounded-xl transition disabled:opacity-50 flex items-center gap-2"
                  >
                    {sandboxLoading ? (
                      <>
                        <span className="animate-spin">⏳</span> Запуск...
                      </>
                    ) : (
                      <>
                        ▶ Запустить песочницу
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <iframe
                  src={sandboxUrl}
                  className="w-full h-full border-0"
                  title="Interactive Sandbox"
                  sandbox="allow-scripts allow-same-origin"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
