import { useEffect } from "react";
import { accessElf } from "../../utils/accessElf";
import Navigation from "../../../application/Navigation";

const PaidSubscriptionsPage = () => {
  useEffect(() => {
    accessElf.track("PaidSubscriptionsPage");
  }, []);

  return (
    <div className="flex flex-col w-full bg-white">
      <Navigation />
      <div className="flex flex-col items-center px-4 mt-4">
        <h1 className="text-2xl font-bold">Paid Subscriptions</h1>
        <p className="mt-4">View your paid subscriptions here.</p>
      </div>
    </div>
  );
};

export default PaidSubscriptionsPage;
