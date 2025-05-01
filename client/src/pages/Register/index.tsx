import RegisterForm from "@/components/RegisterForm";
import GradientSplit from "@/layouts/GradientSplit";
import { Link } from "react-router-dom";

function Register(){
  return (
    <GradientSplit>
      <h2 className='mt-20 text-lg font-semibold text-gray-900'>
        Register to get started
      </h2>
      <p className='mt-2 text-sm text-gray-700'>
        Already registered? <Link to={'/login'} className='text-blue-600 hover:underline cursor-pointer'>Sign in</Link> to your account
      </p>
      <RegisterForm />
    </GradientSplit>
  )
}

export default Register;