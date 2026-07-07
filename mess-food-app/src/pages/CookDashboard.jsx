import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { supabase, todayStr, MEALS } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'

const MEAL_LABELS = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner' }

export default function CookDashboard() {
  const { profile } = useAuth()
  const date = todayStr()

  const [menuDrafts, setMenuDrafts] = useState({ breakfast: '', lunch: '', dinner: '' })
  const [savedMenu, setSavedMenu] = useState({})
  const [savingMeal, setSavingMeal] = useState(null)
  const [rows, setRows] = useState([]) // raw responses joined with profile name
  const [loading, setLoading] = useState(true)

  const loadMenu = useCallback(async () => {
    const { data } = await supabase.from('menu').select('*').eq('date', date)
    const byMeal = {}
    ;(data || []).forEach((r) => (byMeal[r.meal_type] = r.description))
    setSavedMenu(byMeal)
    setMenuDrafts((prev) => ({ ...prev, ...byMeal }))
  }, [date])

  const loadResponses = useCallback(async () => {
    const { data } = await supabase
      .from('responses')
      .select('id, meal_type, response, reason, user_id, profiles ( full_name, phone )')
      .eq('date', date)
    setRows(data || [])
  }, [date])

  useEffect(() => {
    async function init() {
      setLoading(true)
      await Promise.all([loadMenu(), loadResponses()])
      setLoading(false)
    }
    init()
  }, [loadMenu, loadResponses])

  useEffect(() => {
    const channel = supabase
      .channel('responses-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'responses', filter: `date=eq.${date}` },
        () => loadResponses()
      )
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [date, loadResponses])

  async function saveMenu(mealType) {
    setSavingMeal(mealType)
    try {
      const { error } = await supabase.from('menu').upsert(
        {
          date,
          meal_type: mealType,
          description: menuDrafts[mealType] || '',
          updated_by: profile.id,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'date,meal_type' }
      )
      if (error) throw error
      setSavedMenu((prev) => ({ ...prev, [mealType]: menuDrafts[mealType] }))
      toast.success(`${MEAL_LABELS[mealType]} menu updated — residents are notified`)
    } catch (err) {
      toast.error(err.message || 'Could not update menu')
    } finally {
      setSavingMeal(null)
    }
  }

  function countsFor(mealType) {
    const forMeal = rows.filter((r) => r.meal_type === mealType)
    const yes = forMeal.filter((r) => r.response === 'yes').length
    const no = forMeal.filter((r) => r.response === 'no').length
    return { yes, no, total: forMeal.length }
  }

  return (
    <div className="min-h-screen grain">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-husk-950 mb-1">
            Today's menu
          </h1>
          <p className="text-husk-800/70 mb-6">Update any meal and residents get notified instantly.</p>

          <div className="grid gap-5 sm:grid-cols-3">
            {MEALS.map((mealType) => (
              <div key={mealType} className="bg-husk-50 border border-husk-800/10 rounded-card shadow-sm p-5 flex flex-col gap-3">
                <p className="text-xs uppercase tracking-wide text-saffron-600 font-semibold">
                  {MEAL_LABELS[mealType]}
                </p>
                <textarea
                  rows={3}
                  value={menuDrafts[mealType]}
                  onChange={(e) => setMenuDrafts((prev) => ({ ...prev, [mealType]: e.target.value }))}
                  placeholder="e.g. Idli, sambar, coconut chutney"
                  className="w-full rounded-xl border border-husk-800/20 px-3 py-2 text-sm bg-white focus:border-saffron-500 outline-none resize-none"
                />
                <button
                  disabled={savingMeal === mealType}
                  onClick={() => saveMenu(mealType)}
                  className="self-start text-sm font-semibold bg-husk-900 text-husk-50 rounded-full px-4 py-2 pill-btn disabled:opacity-50"
                >
                  {savedMenu[mealType] === menuDrafts[mealType]
                    ? 'Saved'
                    : savingMeal === mealType
                    ? 'Updating…'
                    : 'Update menu'}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display text-xl font-semibold text-husk-950 mb-4">Today's head count</h2>
          {loading ? (
            <p className="text-husk-800/60">Loading responses…</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-3">
              {MEALS.map((mealType) => {
                const { yes, no, total } = countsFor(mealType)
                const skips = rows.filter((r) => r.meal_type === mealType && r.response === 'no')
                return (
                  <div key={mealType} className="bg-husk-50 border border-husk-800/10 rounded-card shadow-sm p-5">
                    <p className="text-xs uppercase tracking-wide text-saffron-600 font-semibold mb-3">
                      {MEAL_LABELS[mealType]}
                    </p>
                    <div className="flex items-baseline gap-3 mb-3">
                      <span className="font-display text-3xl text-husk-950">{yes}</span>
                      <span className="text-sm text-husk-800/60">eating · {no} skipping · {total} replied</span>
                    </div>
                    {skips.length > 0 && (
                      <div className="border-t border-husk-800/10 pt-3 space-y-2">
                        {skips.map((r) => (
                          <div key={r.id} className="text-sm">
                            <span className="font-medium text-husk-900">{r.profiles?.full_name || 'Unknown'}</span>
                            {r.reason && <span className="text-husk-800/60"> — {r.reason}</span>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
