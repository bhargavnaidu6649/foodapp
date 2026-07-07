const MEAL_LABELS = {
  breakfast: { label: 'Breakfast', icon: '🌅' },
  lunch: { label: 'Lunch', icon: '☀️' },
  dinner: { label: 'Dinner', icon: '🌙' },
}

export default function MealCard({ mealType, menuText, response, reason, onChoose, onReasonChange, onSave, saving }) {
  const meta = MEAL_LABELS[mealType]

  return (
    <div className="bg-husk-50 border border-husk-800/10 rounded-card shadow-sm p-6 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-saffron-600 font-semibold">
            {meta.icon} {meta.label}
          </p>
          <p className="font-display text-lg text-husk-950 mt-1">
            {menuText ? menuText : 'Menu not posted yet'}
          </p>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onChoose('yes')}
          className={`flex-1 rounded-xl py-2.5 font-semibold pill-btn border ${
            response === 'yes'
              ? 'bg-husk-900 text-husk-50 border-husk-900'
              : 'border-husk-800/20 text-husk-800 hover:border-husk-800/40'
          }`}
        >
          Yes, I'll eat
        </button>
        <button
          type="button"
          onClick={() => onChoose('no')}
          className={`flex-1 rounded-xl py-2.5 font-semibold pill-btn border ${
            response === 'no'
              ? 'bg-clay-500 text-white border-clay-500'
              : 'border-husk-800/20 text-husk-800 hover:border-husk-800/40'
          }`}
        >
          No, skip me
        </button>
      </div>

      {response === 'no' && (
        <textarea
          value={reason || ''}
          onChange={(e) => onReasonChange(e.target.value)}
          placeholder="Reason (optional) — e.g. traveling, not feeling well…"
          rows={2}
          className="w-full rounded-xl border border-husk-800/20 px-3 py-2 text-sm bg-white focus:border-saffron-500 outline-none resize-none"
        />
      )}

      <button
        type="button"
        disabled={!response || saving}
        onClick={onSave}
        className="self-end text-sm font-semibold text-saffron-700 hover:text-saffron-600 disabled:opacity-40 pill-btn"
      >
        {saving ? 'Saving…' : 'Save response'}
      </button>
    </div>
  )
}
