interface CheckboxGroupProps {
  label: string
  name: string
  options: readonly string[]
  selected?: string[]
}

export function CheckboxGroup({ label, name, options, selected = [] }: CheckboxGroupProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            key={option}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-sm cursor-pointer hover:bg-amber-50 hover:border-amber-300 has-[:checked]:bg-amber-100 has-[:checked]:border-amber-400 has-[:checked]:text-amber-800 transition-colors"
          >
            <input
              type="checkbox"
              name={name}
              value={option}
              defaultChecked={selected.includes(option)}
              className="sr-only"
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  )
}
