import { useGetCurrentUser } from "../hooks/useAuth";
import LoadSpinner from "../components/commons/LoadSpinner";
import { CircleUserRound } from "lucide-react";

export function User() {
  const { data: user } = useGetCurrentUser();

  return (
    <>
      {!!user ? (
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap">
            <div className="w-full md:w-2/3 px-4">
              <div className="bg-white shadow-md rounded-lg p-6">
                <div className="border-b pb-4 mb-4">
                  <h4 className="text-lg font-semibold">Edit Profile</h4>
                </div>
                <form>
                  <div className="flex flex-wrap -mx-2">
                    <div className="w-full md:w-1/3 px-2 mb-4">
                      <label className="block text-sm font-medium mb-1">
                        Username
                      </label>
                      <input
                        value={user.username}
                        placeholder="Username"
                        type="text"
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div className="w-full md:w-2/3 px-2 mb-4">
                      <label className="block text-sm font-medium mb-1">
                        Email address
                      </label>
                      <input
                        value={user.email}
                        placeholder="Email"
                        type="email"
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap -mx-2">
                    <div className="w-full md:w-1/2 px-2 mb-4">
                      <label className="block text-sm font-medium mb-1">
                        First Name
                      </label>
                      <input
                        value={user.firstName}
                        placeholder="First name"
                        type="text"
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                    <div className="w-full md:w-1/2 px-2 mb-4">
                      <label className="block text-sm font-medium mb-1">
                        Last Name
                      </label>
                      <input
                        value={user.lastName}
                        placeholder="Last Name"
                        type="text"
                        className="w-full border rounded-lg px-3 py-2"
                      />
                    </div>
                  </div>
                  <button
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm bg-krm3-primary hover:bg-yellow-700 text-white"
                    type="button"
                  >
                    Update Profile
                  </button>
                </form>
              </div>
            </div>
            <div className="w-full md:w-1/3 px-4">
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="bg-yellow-400 h-24"></div>
                <div className="p-6 text-center">
                  <div className="mb-4">
                    {/* <img
                      alt="..."
                      className="w-24 h-24 rounded-full mx-auto border-2 border-gray-300"
                      src=""
                    /> */}
                    <CircleUserRound
                      color="#5e5e5e"
                      strokeWidth={1.5}
                      size={30}
                      className="w-24 h-24 rounded-full mx-auto border-gray-300"
                    />
                  </div>
                  <h5 className="text-lg font-semibold">
                    {user.firstName} {user.lastName}
                  </h5>
                  <p className="text-sm text-gray-500">id: {user.id}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <LoadSpinner />
      )}
    </>
  );
}
