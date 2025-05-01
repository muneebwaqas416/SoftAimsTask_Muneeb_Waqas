import LoginForm from "@/components/LoginForm";
import GradientSplit from "@/layouts/GradientSplit";
import { Link } from "react-router-dom";

function Login() {
  return (
    <GradientSplit>
      <h2 className='mt-20 text-lg font-semibold text-gray-900'>
        Sign in to your account
      </h2>
      <p className='mt-2 text-sm text-gray-700'>
        Don't have an account? <Link to={'/register'} className='text-blue-600 hover:underline cursor-pointer'>Sign up</Link>
      </p>
      <LoginForm />
    </GradientSplit>
  )
}

export default Login;