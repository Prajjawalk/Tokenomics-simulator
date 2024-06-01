export const InvestorSimulationData = ({
  simulationDetails,
}: {
  simulationDetails: {
    finalTokenPrice: string;
    totalNewBuyers: string;
    finalCirculatingSupply: string;
    totalNewCommunityMembers: string;
    communitySentiments: Array<string>;
  };
}) => {
  return (
    <div className="flex text-sm rounded-3xl peer-checked:rounded-b-none min-h-0 bg-primary py-0 mt-3">
      <div className="flex-wrap collapse collapse-arrow">
        <input type="checkbox" className="min-h-0 peer" />

        <div className="collapse-title text-sm min-h-0 py-1.5 pl-4">
          <strong>Show Simulation Results</strong>
        </div>

        <div className="collapse-content overflow-auto bg-secondary rounded-t-none rounded-3xl">
          <div className="flex pt-4">
            <pre className="mt-1">Final token price: {simulationDetails.finalTokenPrice}</pre>
          </div>
          <div className="flex pt-4">
            <pre className="mt-1">Circulating supply: {simulationDetails.finalCirculatingSupply}</pre>
          </div>
          <div className="flex pt-4">
            <pre className="mt-1">Total new buyers: {simulationDetails.totalNewBuyers}</pre>
          </div>
          <div className="flex pt-4">
            <pre className="mt-1">Total new community members: {simulationDetails.totalNewCommunityMembers}</pre>
          </div>
          <div className="flex pt-4">
            <pre className="mt-1">Community Sentiments</pre>
          </div>
          <div className="h-[120px] w-[400px] overflow-auto mt-5 ">
            {simulationDetails.communitySentiments.map((i, idx) => (
              <p key={idx}>{i}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
