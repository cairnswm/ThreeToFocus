import { useEffect } from "react";
import { useSubscriptions } from "../../context/SubscriptionsContext";
import { accessElf } from "../../utils/accessElf";
import Navigation from "../../../application/Navigation";
import { useNavigate } from "react-router-dom";

const SubscriptionsPage = () => {
  const { userSubscriptions, userCredits, subscriptions } = useSubscriptions();
  const navigate = useNavigate();
  accessElf.track("SubscriptionsPage");

  return (
    <div className="flex flex-col w-full bg-white">
      <Navigation />
      

      <div className="flex justify-end px-4 mt-4">
        <button
          onClick={() => navigate("/subscriptions/buy")}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Buy Subscription
        </button>
      </div>


      <div className="flex flex-col items-center px-4 mt-4">
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <p className="mt-4">Manage your subscriptions here.</p>

        <h2 className="text-xl font-semibold mt-6">Subscriptions</h2>
        <div className="overflow-x-auto w-full mt-4">
          <table className="table-auto w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-200 px-4 py-2 text-left">Name</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Start Date</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              {userSubscriptions.map((subscription) => (
                <tr key={subscription.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2">{subscription.name}</td>
                  <td className="border border-gray-200 px-4 py-2">{subscription.start_date}</td>
                  <td className="border border-gray-200 px-4 py-2">{subscription.expiry_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="text-xl font-semibold mt-6">Credits</h2>
        <div className="overflow-x-auto w-full mt-4">
          <table className="table-auto w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-200 px-4 py-2 text-left">Name</th>
                <th className="border border-gray-200 px-4 py-2 text-left">Value</th>
              </tr>
            </thead>
            <tbody>
              {userCredits.map((credit) => (
                <tr key={credit.id} className="hover:bg-gray-50">
                  <td className="border border-gray-200 px-4 py-2">{credit.name}</td>
                  <td className="border border-gray-200 px-4 py-2">{credit.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionsPage;
