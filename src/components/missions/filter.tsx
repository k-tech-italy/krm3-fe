import React from 'react';
import { Page, MissionInterface } from '../../restapi/types';
import { FunnelPlus, FunnelX } from 'lucide-react';

interface Props {
  handleFilter: (e: any) => void;
  data: Page<MissionInterface>;
  isAdmin?: boolean;
}

export default function FilterResource(props: Props) {
  function handleFilterName(e: any) {
    const wordArray: string[] = e.target.value.toLowerCase().split(' ');
    const res = props.data?.results.filter((mission) =>
      wordArray.every(
        (word) =>
          mission.resource.firstName.toLowerCase().includes(word) ||
          mission.resource.lastName.toLowerCase().includes(word)
      )
    );
    props.handleFilter(res);
  }

  function handleFilterDate(e: any) {
    const res = props.data?.results.filter(
      (mission) =>
        new Date(mission.fromDate) >= new Date(dateFrom) &&
        new Date(mission.toDate) <= new Date(dateTo)
    );
    props.handleFilter(res);
  }

  const [dateFrom, setDateFrom] = React.useState('');
  const [dateTo, setDateTo] = React.useState('');

  return (
    <form>
      <div className="card mb-4 p-4 shadow bg-card rounded-lg border border-app">
        <div>
          <div className="mb-6">
            {props.isAdmin && (
              <>
                <label
                  htmlFor="filterInput"
                  className="block text-sm font-medium text-app mb-2"
                >
                  Filtro:
                </label>
                <input
                  type="text"
                  id="filterInput"
                  placeholder="Inserisci nome"
                  onChange={handleFilterName}
                  className="w-full rounded-lg border border-app shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2 bg-card text-app"
                />
              </>
            )}
            {!props.isAdmin && (
              <div className="grid grid-cols-2 gap-6 mb-4">
                <div>
                  <label
                    htmlFor="dateFrom"
                    className="block text-sm font-medium text-gray-800 mb-2"
                  >
                    Dal:
                  </label>
                  <input
                    type="date"
                    id="dateFrom"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2"
                  />
                </div>
                <div>
                  <label
                    htmlFor="dateTo"
                    className="block text-sm font-medium text-gray-800 mb-2"
                  >
                    Al:
                  </label>
                  <input
                    type="date"
                    id="dateTo"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm p-2"
                  />
                </div>
              </div>
            )}
          </div>
          {!props.isAdmin && (
            <div className="flex justify-between items-center">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 -sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={(e) => {
                  setDateFrom('');
                  setDateTo('');
                  props.handleFilter(props.data.results);
                }}
              >
                <FunnelX size={16} className="mr-2" />
                Reset
              </button>
              <button
                type="button"
                disabled={!dateFrom || !dateTo}
                className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white ${
                  dateFrom && dateTo
                    ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                    : 'bg-gray-400 cursor-not-allowed'
                } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                onClick={(e) => {
                  handleFilterDate(e);
                }}
              >
                <FunnelPlus size={16} className="mr-2" />
                Filter
              </button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
