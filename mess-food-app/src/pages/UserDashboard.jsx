import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { supabase, todayStr, MEALS } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import MealCard from '../components/MealCard'

export default function UserDashboard() {
  const { profile } = useAuth()
  const [menu, setMenu] = useState({})
  const [responses, setResponses] = useState({})
  const [drafts, setDrafts] = useState({})
  const [savingMeal, setSavingMeal] = useState(null)
  const [loading, setLoading] = useState(true)

  const date = todayStr()

  const loadMenu = useCallback(async () => {
    const { data } = await supabase.from('menu').select('*').eq('date', date)
    const byMeal = {}
    ;(data || []).forEach((row) => {
      byMeal[row.meal_type] = row.description
    })
    setMenu(byMeal)
  }, [date])

  const loadResponses = useCallback(async () => {
    if (!profile) return
    const { data } = await supabase
      .from('responses')
      .select('*')
      .eq('date', date)
      .eq('user_id', profile.id)
    const byMeal = {}
    ;(data || []).forEach((row) => {
      byMeal[row.meal_type] = { response: row.response, reason: row.reason }
    })
    setResponses(byMeal)
    setDrafts(byMeal)
  }, [date, profile])

  useEffect(() => {
    async function init() {
      setLoading(true)
      await Promise.all([loadMenu(), loadResponses()])
      setLoading(false)
    }
    init()
  }, [loadMenu, loadResponses])

  // Realtime: notify everyone the moment the cook changes today's menu.
  useEffect(() => {
    const channel = supabase
      .channel('menu-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'menu', filter: `date=eq.${date}` },
        (payload) => {
          const row = payload.new
          setMenu((prev) => ({ ...prev, [row.meal_type]: row.description }))
          toast.custom(
            (t) => (
              <div
                className={`bg-husk-950 text-husk-50 rounded-xl shadow-xl px-5 py-4 max-w-sm border border-saffron-500/40 ${
                  t.visible ? 'animate-in fade-in' : ''
                }`}
              >
                <p className="text-saffron-400 text-xs uppercase font-semibold tracking-wide mb-1">
                  Menu updated
                </p>
                <p className="font-display text-base">
                  {row.meal_type[0].toUpperCase() + row.meal_type.slice(1)}: {row.description}
                </p>
              </div>
            ),
            { duration: 6000 }
          )
        }
      )
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [date])

  function chooseResponse(mealType, value) {
    setDrafts((prev) => ({ ...prev, [mealType]: { ...prev[mealType], response: value } }))
  }

  function setReason(mealType, reason) {
    setDrafts((prev) => ({ ...prev, [mealType]: { ...prev[mealType], reason } }))
  }

  async function saveResponse(mealType) {
    const draft = drafts[mealType]
    if (!draft?.response) return
    setSavingMeal(mealType)
    try {
      const { error } = await supabase.from('responses').upsert(
        {
          user_id: profile.id,
          date,
          meal_type: mealType,
          response: draft.response,
          reason: draft.response === 'no' ? draft.reason || null : null,
        },
        { onConflict: 'user_id,date,meal_type' }
      )
      if (error) throw error
      setResponses((prev) => ({ ...prev, [mealType]: draft }))
      toast.success(`${mealType[0].toUpperCase() + mealType.slice(1)} response saved`)
    } catch (err) {
      toast.error(err.message || 'Could not save response')
    } finally {
      setSavingMeal(null)
    }
  }

  return (
    <div className="min-h-screen grain">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-husk-950 mb-1">
          Hi {profile?.full_name?.split(' ')[0]}, today's meals
        </h1>
        <p className="text-husk-800/70 mb-6">
          {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>

        {loading ? (
          <p className="text-husk-800/60">Loading today's menu…</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {MEALS.map((mealType) => (
              <MealCard
                key={mealType}
                mealType={mealType}
                menuText={menu[mealType]}
                response={drafts[mealType]?.response}
                reason={drafts[mealType]?.reason}
                onChoose={(v) => chooseResponse(mealType, v)}
                onReasonChange={(v) => setReason(mealType, v)}
                onSave={() => saveResponse(mealType)}
                saving={savingMeal === mealType}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
