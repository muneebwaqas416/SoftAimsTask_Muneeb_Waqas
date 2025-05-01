import { Button } from "../ui/button";
import { LoaderCircle } from "lucide-react";

interface Props {
  isLoading?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
  type?: 'submit' | 'reset' | 'button' | undefined;
}
function EgButton({ onClick, isLoading, children, type }: Props) {
  return (
    <Button className='bg-blue-600 hover:bg-blue-500' onClick={onClick} type={type}>{children}
      {
        isLoading && <LoaderCircle className="animate-spin ml-2 w-5" />
      }
    </Button>
  )
}

export default EgButton;