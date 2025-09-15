interface RequestStat {
  "Number of requests": number;
  "Total traffic": number;
  "Average response time": number;
  "Success rate": number;
}

interface Props {
  stats: RequestStat;
}

export default function RequestStat({ stats }: Props) {
  return (
    <div className="bg-gray-900">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-px bg-white/5 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(stats).map(([name, value]) => (
            <div key={name} className="bg-gray-900 px-4 py-6 sm:px-6 lg:px-8">
              <p className="text-sm/6 font-medium text-gray-400">{name}</p>
              <p className="mt-2 flex items-baseline gap-x-2">
                <span className="text-4xl font-semibold tracking-tight text-white">{value}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
