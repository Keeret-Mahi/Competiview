export default function OnboardingHeader() {
  return (
    <header className="flex items-center whitespace-nowrap border-b border-solid border-[#e7f0f4] bg-white px-10 py-4 shadow-sm z-10">
      <div className="flex items-center gap-4 text-[#0d181c]">
        <div className="size-8 text-primary">
          <span className="material-symbols-outlined text-3xl">insights</span>
        </div>
        <h2 className="text-[#0d181c] text-xl font-bold leading-tight tracking-[-0.015em]">
          Competiview
        </h2>
      </div>
    </header>
  );
}
