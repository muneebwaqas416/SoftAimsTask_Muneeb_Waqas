import { LogOut } from "lucide-react";
import WelcomeImg from "../../assets/welcome.svg";
import { deleteCookies, fetchCookieToken, fetchFromCookie } from "@/utils/user.utils";
import { useEffect } from "react";
import { clientApiFetch } from "@/utils/api.utils";
import { useNavigate } from "react-router-dom";

function AppPage() {
  const navigate = useNavigate();
  useEffect(() => {
    async function init(){
      const token : string | undefined = fetchCookieToken();
      if(token){
        const res = await clientApiFetch("http://localhost:3000/api/profile", {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
        })
        if(res.error){
          deleteCookies();
          navigate('/login');
        }
      }
    }

    init();
  })

  function logOut(){
    deleteCookies();
    navigate('/login');
  }

  return (
    <div>
      <div className="sticky top-0 z-40 w-full shadow-md backdrop-blur">
        <div className="py-4 mx-4 border-b border-slate-900/10 lg:px-8 lg:border-0 dark:border-slate-300/10 lg:mx-0">
          <div className="relative flex items-center justify-between">
            <div className="font-medium">Welcome to the chat application of Brack obama</div>
            <div className="flex">
              <p>{fetchFromCookie('username')}</p>
              <LogOut className="w-5 ml-4 cursor-pointer" onClick={logOut}/>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center mt-64 gap-7 lg:mt-32">
        <img alt="" src={WelcomeImg} className="h-40 w-50 lg:h-64" />
        <h1 className="text-2xl font-light lg:text-4xl">Welcome to the Application</h1>
      </div>
    </div>
  )
}

export default AppPage;