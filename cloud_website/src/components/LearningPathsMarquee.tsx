const companies = [
  'Deloitte',
  'Accenture',
  'IBM',
  'Cognizant',
  'Infosys',
  'Capgemini',
  'TCS',
];

export default function LearningPathsMarquee() {
  return (
    <section className="border-y border-slate-100 bg-slate-50 py-10 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-slate-500 sm:text-base">
          Trusted by professionals from
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-slate-400 sm:text-[15px]">
          Master skills that top employers are hiring for — designed with industry leaders.
        </p>

        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 sm:gap-x-10 md:justify-between md:gap-x-4">
          {companies.map((name) => (
            <li
              key={name}
              className="text-lg font-bold tracking-tight text-slate-400 sm:text-xl md:text-[1.35rem]"
              style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
            >
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
