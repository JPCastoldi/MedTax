export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50 flex justify-center">
      <div className="w-full max-w-[440px] min-h-screen bg-slate-50 flex flex-col px-5 pt-8 pb-10">
        {children}
      </div>
    </main>
  )
}

export function AuthBrand({ subtitle = "Sua rotina financeira organizada." }: { subtitle?: string }) {
  return (
    <div className="flex flex-col items-center mt-4 mb-8">
      <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg mb-3 shadow-sm">
        M
      </div>
      <h1 className="text-[24px] font-semibold text-slate-950">Med Tax</h1>
      <p className="text-[14px] text-slate-500 mt-1 text-center">{subtitle}</p>
    </div>
  )
}

export function AuthField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <label className="block">
      <span className="block text-[13px] font-medium text-slate-500 mb-1.5">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full h-12 px-4 rounded-xl bg-white border border-slate-200 text-slate-950 text-[15px] placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition"
      />
    </label>
  )
}

export function AuthPrimaryButton({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="w-full h-12 rounded-full bg-blue-600 text-white font-semibold text-[15px] transition-colors hover:bg-blue-700 active:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  )
}

export function OnboardingProgress({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex gap-2 mb-6">
      {Array.from({ length: total }).map((_, index) => (
        <div
          key={index}
          className={`h-1.5 flex-1 rounded-full ${index < step ? "bg-blue-600" : "bg-slate-200"}`}
        />
      ))}
    </div>
  )
}
