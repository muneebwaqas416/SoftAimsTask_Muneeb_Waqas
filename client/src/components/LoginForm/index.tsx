import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import EgButton from "../EgButton";
import { clientApiFetch } from "@/utils/api.utils";
import { useNavigate } from "react-router-dom";
import { storeInCookie, storeTokenInCookie } from "@/utils/user.utils";

function LoginForm() {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | undefined>(undefined)

  async function formSubmit(e:React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    setApiError(undefined);
    if (email && email.length > 0 && password && password.length > 0) {
      setIsLoading(true);
      const res = await clientApiFetch("http://localhost:3000/api/signin", {
        method: 'POST',
        body: {
          email: email,
          password: btoa(password)
        }
      })
      if (!res.error) {
        storeTokenInCookie(res.data.access_token);
        storeInCookie('username', res.data.username);
        navigate('/app');
      }
      else {
        setApiError(res.message);
      }
      setIsLoading(false);
    }
  }

  return (
    <form className='mt-10 grid grid-cols-1 gap-y-8'>
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="email">Email</Label>
        <Input type="email" id="email" placeholder="Email" required onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="password">Password</Label>
        <Input type="password" id="password" placeholder="Password" required onChange={(e) => setPassword(e.target.value)} />
      </div>

      <EgButton onClick={formSubmit} isLoading={isLoading} type="submit">Sign In</EgButton>
      <p className="text-red-500 text-sm">{apiError}</p>
    </form>
  )
}

export default LoginForm;