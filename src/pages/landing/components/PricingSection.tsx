import Button from "../../../components/Button";
import { PersonCircle } from "../../../icons";

const PricingSection = () => {
  return ( <div className="bg-gray-100 py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="lg:text-center">
        <h2 className="text-base text-primary font-semibold tracking-wide uppercase">Pricing</h2>
        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Simple, transparent pricing
        </p>
      </div>

      <div className="mt-10 space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto">
        {/* Monthly Plan */}
        <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white">
          <div className="p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Monthly</h3>
            <p className="mt-4 text-sm text-gray-500">Perfect for short-term projects</p>
            <p className="mt-8">
              <span className="text-4xl font-extrabold text-gray-900">$5</span>
              <span className="text-base font-medium text-gray-500">/mo</span>
            </p>
            <Button to="/signup" className="mt-8 block w-full bg-primary border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-indigo-700">
              Start free trial
            </Button>
          </div>
          <div className="pt-6 pb-8 px-6">
            <h4 className="text-sm font-medium text-gray-900 tracking-wide">What's included</h4>
            <ul className="mt-6 space-y-4">
              {['Unlimited reviews', 'Feature suggestions', 'Bug tracking', 'Basic analytics'].map((feature) => (
                <li key={feature} className="flex">
                  <PersonCircle className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="ml-3 text-sm text-gray-500">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Yearly Plan */}
        <div className="border border-gray-200 rounded-lg shadow-sm divide-y divide-gray-200 bg-white">
          <div className="p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Yearly</h3>
            <p className="mt-4 text-sm text-gray-500">Save 17% with annual billing</p>
            <p className="mt-8">
              <span className="text-4xl font-extrabold text-gray-900">$50</span>
              <span className="text-base font-medium text-gray-500">/yr</span>
            </p>
            <Button to="/signup" className="mt-8 block w-full bg-primary border border-transparent rounded-md py-2 text-sm font-semibold text-white text-center hover:bg-indigo-700">
              Start free trial
            </Button>
          </div>
          <div className="pt-6 pb-8 px-6">
            <h4 className="text-sm font-medium text-gray-900 tracking-wide">What's included</h4>
            <ul className="mt-6 space-y-4">
              {['Everything in Monthly', 'Priority support', 'Advanced analytics', 'Custom branding'].map((feature) => (
                <li key={feature} className="flex">
                  <PersonCircle className="flex-shrink-0 h-5 w-5 text-green-500" />
                  <span className="ml-3 text-sm text-gray-500">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>)
}

export default PricingSection;