import React from "react";
import { Bug, LightBulb, PersonCircle, Star } from "../../../icons";

function FeaturesSection() {
  return (
    <div className="py-12 bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="lg:text-center">
        <h2 className="text-base text-primary font-semibold tracking-wide uppercase">
          Features
        </h2>
        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          Everything you need to improve your product
        </p>
      </div>

      <div className="mt-10">
        <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
          <div className="relative">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
              <Star className="h-6 w-6" />
            </div>
            <div className="mt-5">
              <h3 className="text-lg font-medium text-gray-900">
                User Reviews
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Collect and manage user feedback to understand what your
                customers really think.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
              <LightBulb className="h-6 w-6" />
            </div>
            <div className="mt-5">
              <h3 className="text-lg font-medium text-gray-900">
                Feature Suggestions
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Let users suggest new features and vote on existing suggestions.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
              <Bug className="h-6 w-6" />
            </div>
            <div className="mt-5">
              <h3 className="text-lg font-medium text-gray-900">
                Bug Tracking
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Track and manage bug reports from your users efficiently.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FeaturesSection;
