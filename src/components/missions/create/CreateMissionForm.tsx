import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import Select, { SingleValue } from "react-select";
import moment from "moment";
import { MissionError, MissionInterface, Project } from "../../../restapi/types";
import {
  useGetClients,
  useGetResources,
  useGetProjects,
  useGetCountries,
  useGetCitiess,
} from "../../../hooks/useMissions";
import { useGetCurrencies } from "../../../hooks/useExpense";
import { useGetCurrentUser } from "../../../hooks/useAuth";
import { krm3SelectStyles } from "../../commons/selectStyles";
import "react-datepicker/dist/react-datepicker.css";

interface ResourceOption {
  value: number;
  label: string;
}

interface Props {
  mission: MissionInterface;
  error?: MissionError;
}

export function CreateMissionForm(props: Props) {
  const [mission, setMission] = useState<MissionInterface>(props.mission);
  const [error, setError] = useState<MissionError | undefined>(props.error);
  const [country, setCountry] = useState();
  const { data: currentUser, userCan } = useGetCurrentUser();
  // only mission managers can create missions for other resources (same rule as the backend)
  const canChooseResource = userCan(["core.manage_any_mission"]);
  const resources = useGetResources(canChooseResource);
  const clients = useGetClients();
  // non-managers always use their own resource
  const resourceId = canChooseResource ? mission?.resource?.id : currentUser?.resource?.id;
  // only the projects the resource is involved in today or later (same rule as the backend)
  const projects = useGetProjects(resourceId, !!resourceId);
  const countries = useGetCountries();
  const cities = useGetCitiess();
  const currencies = useGetCurrencies();

  useEffect(() => {
    setMission((prev) => props.mission);
  }, [JSON.stringify(props.mission)]);

  useEffect(() => {
    setError((prev) => props.error);
  }, [props.error]);

  useEffect(() => {
    // non-managers create missions for themselves: the select is not rendered
    if (!canChooseResource && currentUser?.resource) {
      props.mission.resource = currentUser.resource;
    }
  }, [canChooseResource, currentUser?.resource?.id]);

  function handleChangeResource(option: SingleValue<ResourceOption>): void {
    const selected = resources?.results.find((res) => res.id === option?.value);
    if (!selected || selected.id === mission?.resource?.id) return;
    props.mission.resource = selected;
    // the project list depends on the resource: the chosen project may not be valid anymore
    props.mission.project = undefined as unknown as Project;
    delete error?.resource;
    setMission({ ...mission, resource: selected, project: undefined as unknown as Project });
  }

  function handleChangeProject(e: any): void {
    if (projects) {
      const selected =
        projects.results.filter((res) => res.id === Number(e.target.value)).at(0) ||
        props.mission.project;
      props.mission.project = selected;
      delete error?.project;
      setMission({ ...mission, project: selected });
    }
  }

  function handleChangeCountry(e: any): void {
    if (countries) {
      setCountry((prev) => e.target.value);
    }
  }

  function handleChangeCity(e: any): void {
    if (cities) {
      const selected =
        cities.results.filter((c) => c.id === Number(e.target.value)).at(0) || props.mission.city;
      props.mission.city = selected;
      delete error?.city;
      setMission({ ...mission, city: selected });
    }
  }
  function handleChangeCurrency(e: any): void {
    if (currencies) {
      const selected =
        currencies.results.filter((c) => c.iso3 === e.target.value).at(0) ||
        props.mission.defaultCurrency;
      props.mission.defaultCurrency = selected;
      delete error?.defaultCurrency;
      setMission({ ...mission, defaultCurrency: selected });
    }
  }

  const resourceOptions: ResourceOption[] = (resources?.results || []).map((res) => ({
    value: res.id,
    label: `${res.firstName} ${res.lastName}`,
  }));
  const projectPlaceholder = !resourceId
    ? "Scegli prima la risorsa"
    : projects && projects.results.length === 0
      ? "Nessun progetto attivo per la risorsa"
      : "progetto";

  return (
    <form className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center">
        <label className="sm:w-1/4 font-semibold mb-2 sm:mb-0">Titolo (opzionale)</label>
        <div className="sm:w-2/4 w-full">
          <input
            data-testid="title-input"
            placeholder="Generato automaticamente all'invio se vuoto"
            className={`w-full border rounded-md p-2 ${
              error?.title ? "border-red-500" : "border-gray-300"
            } `}
            onChange={(e) => {
              props.mission.title = e.target.value;
              delete error?.title;
            }}
          />
          {!!error?.title && <p className="text-red-500 text-sm mt-1">{error.title}</p>}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center">
        <label className="sm:w-1/4 font-semibold mb-2 sm:mb-0">Risorsa</label>
        <div className="sm:w-2/4 w-full">
          {canChooseResource ? (
            <div data-testid="first-name-select">
              <Select<ResourceOption>
                inputId="create-mission-resource"
                aria-label="Risorsa"
                placeholder="Cerca risorsa..."
                noOptionsMessage={() => "Nessuna risorsa trovata"}
                isSearchable
                options={resourceOptions}
                value={resourceOptions.find((o) => o.value === mission?.resource?.id) ?? null}
                onChange={handleChangeResource}
                formatOptionLabel={({ label }) => (
                  <span className="notranslate" translate="no">
                    {label}
                  </span>
                )}
                styles={krm3SelectStyles<ResourceOption>(!!error?.resource)}
              />
            </div>
          ) : (
            <p data-testid="own-resource" className="p-2">
              {currentUser?.resource
                ? `${currentUser.resource.firstName} ${currentUser.resource.lastName}`
                : "Nessuna risorsa associata al tuo utente"}
            </p>
          )}
          {!!error?.resource && <p className="text-red-500 text-sm mt-1">{error.resource}</p>}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center">
        <label className="sm:w-1/4 font-semibold mb-2 sm:mb-0">Progetto</label>
        <div className="sm:w-2/4 w-full">
          <select
            data-testid="project-select"
            className={`w-full border rounded-md p-2 ${
              error?.project ? "border-red-500" : "border-gray-300"
            } `}
            value={mission?.project?.id ?? 0}
            onChange={handleChangeProject}
            disabled={!resourceId}
          >
            {[{ id: 0, name: projectPlaceholder } as Project, ...(projects?.results || [])].map(
              (res) => (
                <option key={res.id} value={res.id}>
                  {res.id
                    ? `${res.name} (${clients?.results.filter((c) => c.id === res.client).at(0)?.name})`
                    : res.name}
                </option>
              )
            )}
          </select>
          {!!error?.project && <p className="text-red-500 text-sm mt-1">{error.project}</p>}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center">
        <label className="sm:w-1/4 font-semibold mb-2 sm:mb-0">Paese</label>
        <div className="sm:w-2/4 w-full">
          <select
            data-testid="country-select"
            className="w-full border rounded-md p-2 border-gray-300"
            value={country}
            onChange={handleChangeCountry}
          >
            {[{ id: 0, name: "Paese" }, ...(countries?.results || [])].map((res) => (
              <option key={res.id} value={res.id}>
                {res.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center">
        <label className="sm:w-1/4 font-semibold mb-2 sm:mb-0">Città</label>
        <div className="sm:w-2/4 w-full">
          <select
            data-testid="city-select"
            className={`w-full border rounded-md p-2 ${
              error?.city ? "border-red-500" : "border-gray-300"
            } `}
            value={props.mission?.city?.id}
            onChange={handleChangeCity}
          >
            {[
              { id: 0, name: "Città" },
              ...(cities?.results.filter((c) => c.country === Number(country)) || []),
            ].map((res) => (
              <option key={res.id} value={res.id}>
                {res.name}
              </option>
            ))}
          </select>
          {!!error?.city && <p className="text-red-500 text-sm mt-1">{error.city}</p>}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center">
        <label className="sm:w-1/4 font-semibold mb-2 sm:mb-0">Valuta di base</label>
        <div className="sm:w-2/4 w-full">
          <select
            data-testid="currency-select"
            className={`w-full border rounded-md p-2 ${
              error?.defaultCurrency ? "border-red-500" : "border-gray-300"
            } `}
            value={props.mission?.defaultCurrency?.iso3}
            onChange={handleChangeCurrency}
          >
            {[{ iso3: "valuta", title: "valuta" }, ...(currencies?.results || [])].map((res) => (
              <option key={res.iso3} value={res.iso3}>
                {res.iso3}
              </option>
            ))}
          </select>
          {!!error?.defaultCurrency && (
            <p className="text-red-500 text-sm mt-1">{error.defaultCurrency}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center">
        <label className="sm:w-1/4 font-semibold mb-2 sm:mb-0">Dal giorno</label>
        <div className="sm:w-2/4 w-full">
          <DatePicker
            id="create-mission-form-from-date-picker"
            selected={mission.fromDate ? new Date(mission.fromDate) : new Date()}
            className="w-full border rounded-md p-2 border-gray-300"
            onChange={(date: Date | null) => {
              setMission({
                ...mission,
                fromDate: moment(date).format("YYYY-MM-DD"),
              });
              props.mission.fromDate = moment(date).format("YYYY-MM-DD");
            }}
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center">
        <label className="sm:w-1/4 font-semibold mb-2 sm:mb-0">Al giorno</label>
        <div className="sm:w-2/4 w-full">
          <DatePicker
            id="create-mission-form-to-date-picker"
            selected={mission.toDate ? new Date(mission.toDate) : new Date()}
            className="w-full border rounded-md p-2 border-gray-300"
            onChange={(date: Date | null) => {
              setMission({
                ...mission,
                toDate: moment(date).format("YYYY-MM-DD"),
              });
              props.mission.toDate = moment(date).format("YYYY-MM-DD");
            }}
          />
        </div>
      </div>
    </form>
  );
}
