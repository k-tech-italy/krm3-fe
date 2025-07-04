import { MissionInterface } from '../../restapi/types';
import { CalendarDays, MapPin, User, Briefcase, Hash } from 'lucide-react';

interface Props {
  data: MissionInterface;
}

export default function MissionSummary(props: Props) {
  const calculateDays = () => {
    if (!props.data.fromDate || !props.data.toDate) return "N/A";

    const fromDate = new Date(props.data.fromDate);
    const toDate = new Date(props.data.toDate);
    const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days

    return diffDays;
  };

  return (
    <div className="shadow-md  border border-gray-300 rounded-lg mb-6 bg-white">
      <div className="border-b border-gray-300 p-5">
      <div className="flex items-center justify-between">
        <h4 className="text-xl font-bold text-gray-800">{props.data.title}</h4>
        <span className="bg-green-600 text-white text-xs font-medium rounded-full px-4 py-1">
        Attesa
        </span>
      </div>
      <div className="flex items-center mt-3 text-gray-600">
        <Hash size={18} className="mr-2 text-gray-500" />
        <small className="text-sm">Number Mission: {props.data.number}</small>
      </div>
      </div>

      <div className="p-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="flex items-start">
        <User size={22} className="text-krm3-primary mt-1 mr-3" />
        <div>
          <small className="uppercase text-gray-500 font-semibold text-xs">Resource</small>
          <p className="font-medium text-gray-800">
          {props.data.resource.firstName} {props.data.resource.lastName}
          </p>
        </div>
        </div>
        <div className="flex items-start">
        <Briefcase size={22} className="text-krm3-primary mt-1 mr-3" />
        <div>
          <small className="uppercase text-gray-500 font-semibold text-xs">Project</small>
          <p className="font-medium text-gray-800">{props.data.project.name}</p>
        </div>
        </div>
        <div className="flex items-start">
        <MapPin size={22} className="text-krm3-primary mt-1 mr-3" />
        <div>
          <small className="uppercase text-gray-500 font-semibold text-xs">Location</small>
          <p className="font-medium text-gray-800">{props.data.city.name}</p>
        </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-5">
        <div className="flex items-center mb-4">
        <CalendarDays size={20} className="text-krm3-primary mr-3" />
        <h6 className="text-gray-700 font-semibold text-sm">Date</h6>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <small className="text-gray-500 block text-xs">Date From</small>
          <span className="font-medium text-gray-800">{props.data.fromDate}</span>
        </div>
        <div>
          <small className="text-gray-500 block text-xs">Date To</small>
          <span className="font-medium text-gray-800">{props.data.toDate}</span>
        </div>
        <div>
          <small className="text-gray-500 block text-xs">Duration</small>
          <span className="font-medium text-gray-800">{calculateDays()} days</span>
        </div>
        </div>
      </div>
      </div>
    </div>
  );
}
