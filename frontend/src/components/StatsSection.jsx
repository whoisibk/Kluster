import { IoStatsChartSharp } from "react-icons/io5";
import { PiUsers } from "react-icons/pi";
import { IoMdHeart } from "react-icons/io";
import { PiMapPinSimpleFill } from "react-icons/pi";




const stats = [
  { label: 'Cluster Volume', value: '₦12.4M', icon: <IoStatsChartSharp />, color: 'from-primary/20 to-primary/5' },
  { label: 'Active Traders', value: '1,240', icon: <PiUsers />, color: 'from-secondary-orange/20 to-secondary-orange/5' },
  { label: 'Cluster Health Score', value: '82/100', icon: <IoMdHeart />, color: 'from-success/20 to-success/5' },
  { label: 'Markets Mapped', value: '14', icon: <PiMapPinSimpleFill />, color: 'from-secondary-gold/20 to-secondary-gold/5' },
]

const StatsSection = () => {
  return (
    <section className="py-12 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-br ${stat.color} rounded-2xl p-6 text-center backdrop-blur-sm border border-gray-100 transition-all hover:shadow-lg card-hover`}
            >
              <div className="text-3xl mb-2 ml-[104px]">{stat.icon}</div>
              <div className="text-3xl font-bold text-secondary-slate">{stat.value}</div>
              <div className="text-sm text-secondary-slate/60 mt-1 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatsSection