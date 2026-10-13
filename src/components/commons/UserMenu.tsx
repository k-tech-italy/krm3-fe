import {CircleUserRound} from "lucide-react";
import DropDown from "./DropDown.tsx";
import {useLogout} from "../../hooks/useAuth.tsx";
import {useEffect, useState} from "react";
import {isValidUrl} from "../timesheet/utils/utils.ts";
import {useAuthContext} from "./AuthContext.tsx";

export default function UserMenu() {
  const { user } = useAuthContext();
  const { mutate: logoutUser } = useLogout();
  const [release, setRelease] = useState<any>(null);

  const validateJson = async (res: Response) => {
    if(res.ok){
      const releaseObj: Record<string, any>  = await res.json();
      if(releaseObj.be?.version && releaseObj.fe?.version) {
        return releaseObj
      }
    }
    return null;
  };

  useEffect(() => {
    if (release === null) {
      const unixTimestamp = Math.round(new Date().getTime() / 1000);
      fetch(`/static/release.json?${unixTimestamp}`)
        .then(validateJson)
        .then((user) => setRelease(user))
        .catch(() => setRelease(null));
    }
  });

  const beUrl = document.location.protocol + "//" + document.location.host;
  const sections = [
    {
      items: [
        {
          label: "Profile",
          href: user?.id ? `be/resource/${user.id}/` : undefined,
        },
        {
          label: "Documents",
          href: "be/documents/",
        },
        ...(user?.isStaff ? [{
          label: "Django Admin",
          href: `${beUrl}/admin/`,
        },
        ] : []),
      ]
    },
    {
      items: [
        {
          label: "Sign out",
          onClick: () => logoutUser(),
          testId: "logout-button"
        },
      ]
    },
    {
      isFooter: true,
      items: [
        {
          label: release ? (
            <>
              <b>BE</b>: v{release.be.version}<br/>
              <b>FE</b>: v{release.fe.version}
            </>
          ) : (
            "Version info unavailable"
          ),
          onClick: () => {},
          disabled: true
        }
      ]
    },
  ];

  return (
  <DropDown
    icon={user?.profile.picture && isValidUrl(user?.profile.picture) ? (
      <img
        data-testid={"user-profile-picture"}
        src={user?.profile.picture}
        alt="user profile picture"
        width="32"
        height="32"
        className="rounded-full mr-2"
      />
    ) : (
      <CircleUserRound
        data-testid={"user-default-picture"}
        color="#5e5e5e"
        strokeWidth={1.5}
        size={30}
        className="mr-2"
      />
    )}
    sections={sections}
    label={user?.email}
    testId="user-menu"
  />
);
}