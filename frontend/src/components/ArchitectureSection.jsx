import { TiDownload } from "react-icons/ti";
import { FaMapLocationDot } from "react-icons/fa6";
import { RiRobot2Fill } from "react-icons/ri";
import { GrPlug } from "react-icons/gr";

const architectureSteps = [
  {
    title: 'Ingestion & Harmonization',
    description: 'We aggregate disparate unstructured data sources across informal supply chains into a unified, encrypted ledger.',
    icon: <TiDownload />,
    color: 'primary',
  },
  {
    title: 'Node Mapping',
    description: 'Identity resolution creates verified economic actors.',
    icon: <FaMapLocationDot />,
    color: 'secondary-orange',
  },
  {
    title: 'Predictive Engines',
    description: 'Machine learning models forecast demand signals and creditworthiness.',
    icon: <RiRobot2Fill />,
    color: 'secondary-gold',
  },
  {
    title: 'Financial Access API',
    description: 'Exposing verified economic potential to formal financial institutions via secure, standardized endpoints.',
    icon: <GrPlug />,
    color: 'success',
  },
]

const ArchitectureSection = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-secondary-slate mb-4">
            System Architecture.
          </h2>
          <p className="text-lg text-secondary-slate/60 max-w-2xl mx-auto">
            From raw fragmented data to actionable economic intelligence.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-primary via-secondary-orange to-secondary-gold mx-auto mt-6 rounded-full" />
        </div>

        {/* Architecture Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connecting lines (desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-primary/20 via-secondary-orange/20 to-secondary-gold/20 -translate-y-1/2 z-0" />
          
          {architectureSteps.map((step, idx) => (
            <div
              key={idx}
              className="relative bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 group z-10 card-hover"
            >
              <div className={`w-12 h-12 rounded-xl bg-${step.color}/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <span className="text-2xl">{step.icon}</span>
              </div>
              <h3 className="text-lg font-bold text-secondary-slate mb-2">{step.title}</h3>
              <p className="text-secondary-slate/60 text-sm leading-relaxed">{step.description}</p>
              {/* Step number */}
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary-deep text-white flex items-center justify-center text-sm font-bold shadow-md">
                {idx + 1}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/5 rounded-full px-5 py-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm text-primary-deep font-medium">Real-time intelligence layer — powering financial inclusion</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ArchitectureSection