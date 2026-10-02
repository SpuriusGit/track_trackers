import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import {
  ArrowDownWideNarrow,
  ArrowUpRight,
  Code2,
  Clock3,
  ExternalLink,
  LoaderCircle,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  TriangleAlert,
} from 'lucide-react'
import './App.css'

type Repo = {
  id: number
  name: string
  full_name: string
  html_url: string
  description: string | null
  stargazers_count: number
  language: string | null
  owner: { login: string; avatar_url: string }
}

type Locale = 'en' | 'uk'

type Category = {
  id: string
  name: string
  shortName: string
  emoji: string
  query: string
  color: string
}

type SearchData = { total: number; repos: Repo[]; updatedAt: number }
type SearchState = { data?: SearchData; loading: boolean; error?: string }

const CACHE_TTL = 60_000
const categories: Category[] = [
  { id: 'finance', name: 'Personal finance tracker', shortName: 'Finance', emoji: '↗', query: 'personal finance tracker', color: '#f26b4f' },
  { id: 'weather', name: 'Weather app', shortName: 'Weather', emoji: '☼', query: 'weather app', color: '#e4a93b' },
  { id: 'habits', name: 'Habit tracker', shortName: 'Habits', emoji: '◷', query: 'habit tracker', color: '#6b9a72' },
  { id: 'ai', name: 'AI wrapper', shortName: 'AI wrappers', emoji: '✳', query: 'AI wrapper', color: '#6b82c5' },
  { id: 'tasks', name: 'Task manager', shortName: 'Task managers', emoji: '☷', query: 'task management app', color: '#cc7e49' },
  { id: 'notes', name: 'Markdown notes', shortName: 'Notes', emoji: '▤', query: 'markdown notes app', color: '#9b729d' },
]

const messages = {
  en: {
    beta: 'BETA', githubStats: 'LIVE GITHUB STATS', eyebrow: 'A STUDY OF INDIE PROJECTS', titleLead: 'The index of', titleAccent: 'same old', titleEnd: 'ideas', introNote: 'Everyone has built a habit tracker. We just counted them.', updating: 'UPDATING DATA', partialData: 'PARTIAL DATA', liveData: 'LIVE DATA', publicRepos: 'PUBLIC REPOSITORIES', moreRepos: 'MORE REPOSITORIES',
    reposFound: 'REPOSITORIES FOUND', categorySummary: 'across 6 familiar genres', mostRepeated: 'MOST REPEATED', byMatches: 'by number of matches', lastUpdated: 'LAST UPDATED', waiting: 'pending', githubConnection: 'connecting to GitHub', partial: 'partial', unavailableCategories: 'some categories unavailable', gathering: 'gathering the numbers', caution: 'BEWARE', cloning: 'OF', ideas: 'IDEA CLONES',
    catalogKicker: 'THE REPEAT CATALOG', whatBuild: 'What are we building', today: 'today?', sortAscending: 'SORT LOW TO HIGH', sortDescending: 'SORT HIGH TO LOW', allGenres: 'All genres', filterCategories: 'Filter categories', emptyCategory: 'No entries in this category yet.', selectedGenre: 'SELECTED GENRE', freeSearch: 'CUSTOM SEARCH', repos: 'repositories', topStars: 'TOP BY STARS', sourceGithub: 'SOURCE: GITHUB API', noDescription: 'No description', loadingGithub: 'Loading from GitHub…', noResults: 'No results to show yet.',
    anotherIdea: 'GOT ANOTHER IDEA?', checkIt: 'Let’s check', too: 'that too.', customSearchHint: 'Any search query against public GitHub Search.', searchPlaceholder: 'e.g. AI meal planner', searchLabel: 'Search GitHub', searchButton: 'Search GitHub', clearSearch: 'Clear search',
    madeWithLove: 'Made with love for new old ideas.', cache: '60 SEC CACHE', approximate: 'COUNTS ARE APPROXIMATE', searchNotIndex: 'GITHUB SEARCH IS NOT A COMPLETE INDEX', refresh: 'REFRESH', refreshLabel: 'Refresh data', rateLimit: 'Some counts are unavailable. GitHub limits anonymous search requests.',
    chartLabel: 'Interactive 3D chart of category popularity', homeLabel: 'Vibe index home', languageLabel: 'Select language', languageEnglish: 'English', languageUkrainian: 'Ukrainian', totalAnnouncement: 'repositories found',
    categories: { finance: { name: 'Personal finance tracker', short: 'Finance' }, weather: { name: 'Weather app', short: 'Weather' }, habits: { name: 'Habit tracker', short: 'Habits' }, ai: { name: 'AI wrapper', short: 'AI wrappers' }, tasks: { name: 'Task manager', short: 'Task managers' }, notes: { name: 'Markdown notes', short: 'Notes' } },
    errors: { rateLimit: 'GitHub has temporarily rate-limited search. Try again in a minute.', invalid: 'GitHub could not accept this search query.', network: 'Could not connect to GitHub.', http: 'GitHub returned an error.' },
  },
  uk: {
    beta: 'БЕТА', githubStats: 'СТАТИСТИКА З GITHUB', eyebrow: 'ДОСЛІДЖЕННЯ ІНДІ-ЕКОСИСТЕМИ', titleLead: 'Індекс', titleAccent: 'однакових', titleEnd: 'ідей', introNote: 'Усі вже зробили трекер звичок. Ми просто порахували.', updating: 'ОНОВЛЮЄМО ДАНІ', partialData: 'ЧАСТКОВІ ДАНІ', liveData: 'ДАНІ НАЖИВО', publicRepos: 'ПУБЛІЧНІ РЕПОЗИТОРІЇ', moreRepos: 'БІЛЬШЕ РЕПОЗИТОРІЇВ',
    reposFound: 'ЗНАЙДЕНО РЕПОЗИТОРІЇВ', categorySummary: 'у 6 знайомих жанрах', mostRepeated: 'НАЙПОПУЛЯРНІШЕ', byMatches: 'за кількістю збігів', lastUpdated: 'ОСТАННЄ ОНОВЛЕННЯ', waiting: 'очікуємо', githubConnection: 'підключення до GitHub', partial: 'частково', unavailableCategories: 'частина категорій недоступна', gathering: 'ще збираємо цифри', caution: 'ОБЕРЕЖНО', cloning: 'КЛОНУВАННЯ', ideas: 'ІДЕЙ',
    catalogKicker: 'КАТАЛОГ ПОВТОРІВ', whatBuild: 'Що будуємо', today: 'сьогодні?', sortAscending: 'МЕНШЕ СПОЧАТКУ', sortDescending: 'БІЛЬШЕ СПОЧАТКУ', allGenres: 'Усі жанри', filterCategories: 'Фільтр категорій', emptyCategory: 'У цій категорії поки немає записів.', selectedGenre: 'ВИБРАНИЙ ЖАНР', freeSearch: 'ВІЛЬНИЙ ПОШУК', repos: 'репозиторіїв', topStars: 'ТОП ЗА ЗІРКАМИ', sourceGithub: 'ДЖЕРЕЛО: GITHUB API', noDescription: 'Без опису', loadingGithub: 'Завантажуємо з GitHub…', noResults: 'Поки немає результатів для показу.',
    anotherIdea: 'Є ІНША ІДЕЯ?', checkIt: 'Перевірмо її', too: 'теж.', customSearchHint: 'Будь-який запит до публічного GitHub Search.', searchPlaceholder: 'напр. AI meal planner', searchLabel: 'Пошук на GitHub', searchButton: 'Шукати на GitHub', clearSearch: 'Скинути пошук',
    madeWithLove: 'Зроблено з любов’ю до нових старих ідей.', cache: 'КЕШ 60 СЕК', approximate: 'ЦИФРИ ПРИБЛИЗНІ', searchNotIndex: 'ПОШУК GITHUB НЕ Є ПОВНИМ ІНДЕКСОМ', refresh: 'ОНОВИТИ', refreshLabel: 'Оновити дані', rateLimit: 'Деякі лічильники недоступні. GitHub обмежує частоту анонімного пошуку.',
    chartLabel: 'Інтерактивна 3D-діаграма популярності категорій', homeLabel: 'Вайб-індекс, на головну', languageLabel: 'Вибрати мову', languageEnglish: 'Англійська', languageUkrainian: 'Українська', totalAnnouncement: 'репозиторіїв знайдено',
    categories: { finance: { name: 'Трекер фінансів', short: 'Фінанси' }, weather: { name: 'Застосунок погоди', short: 'Погода' }, habits: { name: 'Трекер звичок', short: 'Звички' }, ai: { name: 'AI-обгортка', short: 'AI-обгортки' }, tasks: { name: 'Менеджер задач', short: 'Таск-менеджери' }, notes: { name: 'Markdown-нотатки', short: 'Нотатки' } },
    errors: { rateLimit: 'GitHub тимчасово обмежив пошук. Спробуйте за хвилину.', invalid: 'GitHub не прийняв цей пошуковий запит.', network: 'Не вдалося зв’язатися з GitHub.', http: 'GitHub відповів помилкою.' },
  },
} as const

function getInitialLocale(): Locale {
  try {
    return localStorage.getItem('vibe-index:locale') === 'uk' ? 'uk' : 'en'
  } catch {
    return 'en'
  }
}

function getErrorMessage(error: string, text: (typeof messages)[Locale]) {
  if (error === 'rate_limit') return text.errors.rateLimit
  if (error === 'invalid_query') return text.errors.invalid
  if (error === 'network') return text.errors.network
  return `${text.errors.http}${error.startsWith('http:') ? ` (${error.slice(5)})` : ''}`
}

const readCache = (key: string): SearchData | undefined => {
  try {
    const cached = sessionStorage.getItem(`vibe-index:${key}`)
    if (!cached) return undefined
    const parsed = JSON.parse(cached) as SearchData
    return Date.now() - parsed.updatedAt < CACHE_TTL ? parsed : undefined
  } catch {
    return undefined
  }
}

const inFlightSearches = new Map<string, Promise<SearchData>>()

function searchGitHub(query: string): Promise<SearchData> {
  const existingRequest = inFlightSearches.get(query)
  if (existingRequest) return existingRequest

  const request = (async () => {
    const response = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=6`,
      { headers: { Accept: 'application/vnd.github+json' } },
    )
    if (!response.ok) {
      if (response.status === 403 || response.status === 429) throw new Error('rate_limit')
      if (response.status === 422) throw new Error('invalid_query')
      throw new Error(`http:${response.status}`)
    }
    const result = (await response.json()) as { total_count: number; items: Repo[] }
    return { total: result.total_count, repos: result.items, updatedAt: Date.now() }
  })()

  inFlightSearches.set(query, request)
  void request.then(
    () => { if (inFlightSearches.get(query) === request) inFlightSearches.delete(query) },
    () => { if (inFlightSearches.get(query) === request) inFlightSearches.delete(query) },
  )
  return request
}

function useGitHubSearch(query: string, enabled = true) {
  const [state, setState] = useState<SearchState>({ loading: false })
  const [loadedQuery, setLoadedQuery] = useState('')
  const [revision, setRevision] = useState(0)
  const cached = revision === 0 ? readCache(query) : undefined

  useEffect(() => {
    if (!enabled || !query.trim()) return
    if (revision === 0 && readCache(query)) return
    let active = true
    searchGitHub(query)
      .then((data) => {
        if (!active) return
        sessionStorage.setItem(`vibe-index:${query}`, JSON.stringify(data))
        setState({ data, loading: false })
        setLoadedQuery(query)
      })
      .catch((error: unknown) => {
        if (!active) return
        const message = error instanceof Error && /^(rate_limit|invalid_query|http:\d+)$/.test(error.message) ? error.message : 'network'
        setState((current) => ({ ...current, loading: false, error: message }))
        setLoadedQuery(query)
      })
    return () => { active = false }
  }, [enabled, query, revision])

  const visibleState = cached ? { data: cached, loading: false } : loadedQuery === query ? state : { loading: enabled && Boolean(query.trim()) }
  return { ...visibleState, refresh: () => setRevision((value) => value + 1) }
}

function useCategorySearches() {
  const [revision, setRevision] = useState(0)
  const [states, setStates] = useState<Record<string, SearchState>>(() => Object.fromEntries(categories.map((category) => {
    const data = readCache(category.query)
    return [category.id, { data, loading: !data }]
  })))

  useEffect(() => {
    let active = true
    categories.forEach((category) => {
      if (revision === 0 && readCache(category.query)) return
      searchGitHub(category.query)
        .then((data) => {
          if (!active) return
          sessionStorage.setItem(`vibe-index:${category.query}`, JSON.stringify(data))
          setStates((current) => ({ ...current, [category.id]: { data, loading: false } }))
        })
        .catch((error: unknown) => {
          if (!active) return
          const message = error instanceof Error && /^(rate_limit|invalid_query|http:\d+)$/.test(error.message) ? error.message : 'network'
          setStates((current) => ({ ...current, [category.id]: { ...current[category.id], loading: false, error: message } }))
        })
    })
    return () => { active = false }
  }, [revision])

  const refreshAll = () => {
    setStates((current) => Object.fromEntries(categories.map((category) => [category.id, { ...current[category.id], loading: true, error: undefined }])))
    setRevision((value) => value + 1)
  }

  return { searches: categories.map((category) => states[category.id] ?? { loading: true }), refreshAll }
}

function CategoryScene({ counts, selectedId, onSelect, label, axisLabel, categoryLabel }: { counts: Record<string, number>; selectedId: string; onSelect: (id: string) => void; label: string; axisLabel: string; categoryLabel: (category: Category) => string }) {
  const mountRef = useRef<HTMLDivElement>(null)
  const selectRef = useRef(onSelect)
  const countsRef = useRef(counts)
  const selectedRef = useRef(selectedId)
  useEffect(() => { selectRef.current = onSelect }, [onSelect])
  useEffect(() => { countsRef.current = counts }, [counts])
  useEffect(() => { selectedRef.current = selectedId }, [selectedId])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    let disposed = false
    let disposeScene: (() => void) | undefined
    void import('three').then((THREE) => {
      if (disposed) return
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100)
    camera.position.set(8.5, 8.2, 11)
    camera.lookAt(0, 0.5, 0)
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0xffffff, 2.1))
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.4)
    keyLight.position.set(-5, 9, 7)
    keyLight.castShadow = true
    scene.add(keyLight)
    const fillLight = new THREE.PointLight(0xd6dfaa, 16, 18)
    fillLight.position.set(5, 4, -4)
    scene.add(fillLight)

    const floorMaterial = new THREE.MeshStandardMaterial({ color: '#eee9dc', roughness: 0.92 })
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 12), floorMaterial)
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -0.06
    floor.receiveShadow = true
    scene.add(floor)

    const grid = new THREE.GridHelper(12, 18, '#b5b09f', '#d6d0c0')
    grid.position.y = -0.045
    scene.add(grid)

    const group = new THREE.Group()
    scene.add(group)
    const barMaterials = categories.map((category) => new THREE.MeshStandardMaterial({ color: category.color, roughness: 0.48, metalness: 0.04 }))
    const geometry = new THREE.BoxGeometry(0.92, 1, 0.92)
    const bars = categories.map((category, index) => {
      const bar = new THREE.Mesh(geometry, barMaterials[index])
      bar.position.x = (index - (categories.length - 1) / 2) * 1.3
      bar.castShadow = true
      bar.userData.categoryId = category.id
      group.add(bar)
      return bar
    })
    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    const onPointerDown = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const hit = raycaster.intersectObjects(bars)[0]
      if (hit?.object.userData.categoryId) selectRef.current(hit.object.userData.categoryId as string)
    }
    renderer.domElement.addEventListener('pointerdown', onPointerDown)

    const resize = () => {
      const { width, height } = mount.getBoundingClientRect()
      if (!width || !height) return
      renderer.setSize(width, height, false)
      camera.aspect = width / height
      camera.updateProjectionMatrix()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(mount)
    resize()

    let frame = 0
    const animate = () => {
      frame = requestAnimationFrame(animate)
      const maxLog = Math.max(4, ...categories.map((category) => Math.log10((countsRef.current[category.id] ?? 0) + 1)))
      bars.forEach((bar, index) => {
        const category = categories[index]
        const value = countsRef.current[category.id] ?? 0
        const targetHeight = value === 0 ? 0.18 : 0.24 + (Math.log10(value + 1) / maxLog) * 3.1
        const selected = selectedRef.current === category.id
        bar.scale.y += (targetHeight - bar.scale.y) * 0.08
        bar.position.y = bar.scale.y / 2
        bar.scale.x += ((selected ? 1.12 : 1) - bar.scale.x) * 0.08
        bar.scale.z += ((selected ? 1.12 : 1) - bar.scale.z) * 0.08
      })
      group.rotation.y = Math.sin(performance.now() * 0.00018) * 0.055
      renderer.render(scene, camera)
    }
    animate()

    disposeScene = () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      renderer.domElement.removeEventListener('pointerdown', onPointerDown)
      geometry.dispose()
      barMaterials.forEach((material) => material.dispose())
      floor.geometry.dispose()
      floorMaterial.dispose()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
    }).catch(() => mount.classList.add('scene-error'))
    return () => {
      disposed = true
      disposeScene?.()
    }
  }, [])

  return <div className="scene-frame" aria-label={label}><div className="scene-axis">{axisLabel}<span>↑</span></div><div className="scene-labels">{categories.map((category) => <button className={selectedId === category.id ? 'scene-label is-active' : 'scene-label'} key={category.id} onClick={() => onSelect(category.id)}><i style={{ backgroundColor: category.color }} />{categoryLabel(category)}</button>)}</div><div className="scene-canvas" ref={mountRef} /></div>
}

function App() {
  const [locale, setLocale] = useState<Locale>(getInitialLocale)
  const text = messages[locale]
  const [selectedId, setSelectedId] = useState(categories[0].id)
  const [filter, setFilter] = useState('all')
  const [sortDescending, setSortDescending] = useState(true)
  const [customQuery, setCustomQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const { searches: categoryQueries, refreshAll } = useCategorySearches()
  const counts = Object.fromEntries(categories.map((category, index) => [category.id, categoryQueries[index].data?.total ?? 0]))
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0)
  const selected = categories.find((category) => category.id === selectedId) ?? categories[0]
  const selectedIndex = categories.findIndex((category) => category.id === selected.id)
  const selectedSearch = categoryQueries[selectedIndex]
  const customSearch = useGitHubSearch(submittedQuery, false)
  const displaySearch = submittedQuery ? customSearch : selectedSearch
  const anyLoading = categoryQueries.some((search) => search.loading)
  const anyError = categoryQueries.some((search) => search.error)
  const allCategoriesSettled = categoryQueries.every((search) => search.data || search.error)
  const allCategoriesLoaded = categoryQueries.every((search) => search.data)
  const timestamps = categoryQueries.map((search) => search.data?.updatedAt ?? 0).filter(Boolean)
  const latestUpdate = timestamps.length ? new Date(Math.max(...timestamps)) : null
  const formatNumber = (value: number) => value.toLocaleString(locale === 'en' ? 'en-US' : 'uk-UA')
  const categoryName = (category: Category) => text.categories[category.id as keyof typeof text.categories].name
  const categoryShortName = (category: Category) => text.categories[category.id as keyof typeof text.categories].short
  const sortedCategories = [...categories]
    .filter((category) => filter === 'all' || category.id === filter)
    .sort((left, right) => sortDescending ? (counts[right.id] ?? 0) - (counts[left.id] ?? 0) : (counts[left.id] ?? 0) - (counts[right.id] ?? 0))

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const query = customQuery.trim()
    if (!query) return
    setSubmittedQuery(query)
    setSelectedId('')
  }

  const resetSearch = () => {
    setCustomQuery('')
    setSubmittedQuery('')
    setSelectedId(categories[0].id)
  }

  useEffect(() => {
    document.documentElement.lang = locale
    document.title = locale === 'en' ? 'vibeindex — The Index of Same Old Ideas' : 'vibeindex — Індекс однакових ідей'
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (description) description.content = locale === 'en'
      ? 'A tongue-in-cheek index of repeated project ideas across public GitHub repositories.'
      : 'Іронічний індекс повторюваних ідей у публічних репозиторіях GitHub.'
    try {
      localStorage.setItem('vibe-index:locale', locale)
    } catch {
      // The language still works for this session when storage is unavailable.
    }
  }, [locale])

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" onClick={resetSearch} aria-label={text.homeLabel}><span className="brand-mark"><Sparkles size={17} strokeWidth={2.3} /></span><span>vibe<span className="brand-light">index</span></span><span className="brand-tag">{text.beta}</span></a>
        <div className="topbar-right"><span className="live-dot" /><span>{text.githubStats}</span><div className="language-switch" role="group" aria-label={text.languageLabel}><button className={locale === 'en' ? 'active' : ''} onClick={() => setLocale('en')} aria-label={text.languageEnglish} aria-pressed={locale === 'en'}>EN</button><button className={locale === 'uk' ? 'active' : ''} onClick={() => setLocale('uk')} aria-label={text.languageUkrainian} aria-pressed={locale === 'uk'}>UK</button></div><a className="github-link" href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub"><Code2 size={18} /></a></div>
      </header>

      <section className="intro" id="top">
        <div className="intro-copy"><div className="eyebrow"><span>{text.eyebrow}</span><span className="eyebrow-line" /></div><h1>{locale === 'en' ? <>{text.titleLead}<br /><span>{text.titleAccent}</span> {text.titleEnd}</> : <>{text.titleLead}<br /><span>{text.titleAccent}</span> {text.titleEnd}</>}<span className="period">.</span></h1><p className="intro-note">{text.introNote}</p><div className="intro-meta"><span><span className="live-dot" />{anyLoading ? text.updating : anyError ? text.partialData : text.liveData}</span><span className="meta-divider" /><span>{text.publicRepos}</span></div></div>
        <CategoryScene counts={counts} selectedId={selectedId} onSelect={(id) => { setSelectedId(id); setSubmittedQuery('') }} label={text.chartLabel} axisLabel={text.moreRepos} categoryLabel={categoryShortName} />
        <div className="intro-index">01 <span>/ 06</span></div>
      </section>

      <section className="stats-strip" aria-label={text.reposFound}>
        <div className="total-stat"><span className="stat-label">{text.reposFound}</span><strong>{!allCategoriesSettled ? <span className="loading-dashes">---</span> : allCategoriesLoaded ? formatNumber(total) : text.partial}</strong><span className="stat-caption">{allCategoriesLoaded ? text.categorySummary : allCategoriesSettled ? text.unavailableCategories : text.gathering}</span></div>
        <div className="stat-cell"><span className="stat-label">{text.mostRepeated}</span><strong>{categoryShortName([...categories].sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0))[0])}</strong><span className="stat-caption">{text.byMatches}</span></div>
        <div className="stat-cell"><span className="stat-label">{text.lastUpdated}</span><strong>{latestUpdate ? latestUpdate.toLocaleTimeString(locale === 'en' ? 'en-US' : 'uk-UA', { hour: '2-digit', minute: '2-digit' }) : text.waiting}</strong><span className="stat-caption">{latestUpdate ? latestUpdate.toLocaleDateString(locale === 'en' ? 'en-US' : 'uk-UA') : text.githubConnection}</span></div>
        <div className="stat-stamp"><span>{text.caution}</span><span>{text.cloning}</span><span>{text.ideas}</span><Sparkles size={18} /></div>
      </section>

      <section className="catalog" aria-labelledby="catalog-title">
        <div className="catalog-heading"><div><div className="section-kicker">{text.catalogKicker} <span>— 01.06</span></div><h2 id="catalog-title">{text.whatBuild} <em>{text.today}</em></h2></div><button className="icon-button sort-button" onClick={() => setSortDescending((value) => !value)} title={sortDescending ? text.sortAscending : text.sortDescending} aria-label={sortDescending ? text.sortAscending : text.sortDescending}><ArrowDownWideNarrow size={18} /><span>{sortDescending ? text.sortDescending : text.sortAscending}</span></button></div>
        <div className="catalog-tools"><div className="filter-chips" role="group" aria-label={text.filterCategories}><button className={filter === 'all' ? 'filter-chip active' : 'filter-chip'} onClick={() => setFilter('all')}>{text.allGenres} <span>{categories.length}</span></button>{categories.map((category) => <button className={filter === category.id ? 'filter-chip active' : 'filter-chip'} key={category.id} onClick={() => setFilter(filter === category.id ? 'all' : category.id)}>{categoryShortName(category)}</button>)}</div><span className="filter-icon"><SlidersHorizontal size={16} /></span></div>
        <div className="catalog-layout">
          <div className="category-list" role="list">
            {sortedCategories.map((category, index) => {
              const categoryIndex = categories.indexOf(category)
              const state = categoryQueries[categoryIndex]
              return <button className={`category-row ${selectedId === category.id && !submittedQuery ? 'selected' : ''}`} key={category.id} onClick={() => { setSelectedId(category.id); setSubmittedQuery('') }} role="listitem" aria-pressed={selectedId === category.id && !submittedQuery}>
                <span className="row-number">0{index + 1}</span><span className="category-icon" style={{ color: category.color }}>{category.emoji}</span><span className="category-title"><strong>{categoryName(category)}</strong><small>{category.query}</small></span><span className="category-count">{state.loading && !state.data ? <LoaderCircle className="spin" size={19} /> : state.data ? formatNumber(state.data.total) : state.error ? <TriangleAlert size={17} className="error-icon" aria-label={getErrorMessage(state.error, text)} /> : '—'}</span><span className="row-arrow"><ArrowUpRight size={17} /></span>
              </button>
            })}
            {sortedCategories.length === 0 && <div className="empty-list">{text.emptyCategory}</div>}
          </div>

          <aside className="detail-panel" aria-live="polite">
            <div className="detail-topline"><span>{submittedQuery ? text.freeSearch : text.selectedGenre}</span><span className="detail-dot" /></div>
            <h3>{submittedQuery || categoryName(selected)}</h3>
            <div className="detail-count">{displaySearch.loading && !displaySearch.data ? <LoaderCircle className="spin" size={23} /> : displaySearch.data ? formatNumber(displaySearch.data.total) : '—'}<span>{text.repos}</span></div>
            {displaySearch.error && <p className="error-message"><TriangleAlert size={15} />{getErrorMessage(displaySearch.error, text)}</p>}
            <div className="repo-list">
              {displaySearch.loading && !displaySearch.data ? <div className="repo-empty"><LoaderCircle className="spin" size={19} />{text.loadingGithub}</div> : displaySearch.data?.repos.length ? displaySearch.data.repos.slice(0, 4).map((repo) => <a className="repo-item" key={repo.id} href={repo.html_url} target="_blank" rel="noreferrer"><img src={repo.owner.avatar_url} alt="" /><span className="repo-copy"><strong>{repo.full_name}</strong><small>{repo.description || text.noDescription}</small></span><span className="repo-stars"><Star size={13} />{formatNumber(repo.stargazers_count)}</span><ExternalLink className="repo-external" size={14} /></a>) : !displaySearch.error && <div className="repo-empty">{text.noResults}</div>}
            </div>
            {displaySearch.data && <div className="detail-footer"><span>{text.topStars}</span><span>{text.sourceGithub}</span></div>}
          </aside>
        </div>
      </section>

      <section className="search-band"><div className="search-copy"><span className="section-kicker">{text.anotherIdea}</span><h2>{text.checkIt} <em>{text.too}</em></h2><p>{text.customSearchHint}</p></div><form className="search-form" onSubmit={submitSearch}><Search size={19} /><input aria-label={text.searchLabel} placeholder={text.searchPlaceholder} value={customQuery} onChange={(event) => setCustomQuery(event.target.value)} /><button type="submit" disabled={!customQuery.trim()} aria-label={text.searchButton}><ArrowUpRight size={20} /></button></form>{submittedQuery && <button className="clear-search" onClick={resetSearch}>{text.clearSearch} <span>×</span></button>}</section>

      <footer className="footer"><div className="footer-note"><Sparkles size={15} /><span>{text.madeWithLove}</span></div><div className="footer-right"><span><Clock3 size={14} />{text.cache}</span><span>{text.approximate} <i>·</i> {text.searchNotIndex}</span><button className="refresh-button" onClick={() => { refreshAll(); customSearch.refresh() }} title={text.refreshLabel} aria-label={text.refreshLabel}><RefreshCw size={15} />{text.refresh}</button></div></footer>
      {anyError && <div className="rate-note"><TriangleAlert size={14} />{text.rateLimit}</div>}
      {allCategoriesLoaded && <span className="sr-only">{formatNumber(total)} {text.totalAnnouncement}</span>}
    </main>
  )
}

export default App
