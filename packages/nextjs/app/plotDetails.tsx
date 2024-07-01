export const PlotDetails = ({
  simulationDetails,
}: {
  simulationDetails: {
    data: string;
  };
}) => {
  return (
    <div className="flex text-sm rounded-3xl peer-checked:rounded-b-none min-h-0 bg-primary py-0 mt-3">
      <div className="flex-wrap collapse collapse-arrow">
        <input type="checkbox" className="min-h-0 peer" />

        <div className="collapse-title text-sm min-h-0 py-1.5 pl-4">
          <strong>Show Plot Details</strong>
        </div>

        <div className="collapse-content overflow-auto bg-secondary rounded-t-none rounded-3xl">
          <div className="flex pt-4">
            <pre className="mt-1">{simulationDetails.data}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};
