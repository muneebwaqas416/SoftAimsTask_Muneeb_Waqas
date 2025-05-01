interface Props {
  children: React.ReactNode
}

function GradientSplit(props: Props) {
  return (
    <div className="absolute h-full w-full flex flex-col">
      <div className="relative flex min-h-full shrink-0 justify-center md:px-12 lg:px-0">
        <div className="hidden sm:contents lg:relative lg:block lg:flex-1 bg-gradient-to-r from-cyan-500 to-blue-500" />
        <div className="relative z-10 flex flex-1 flex-col bg-white px-4 py-10 shadow-2xl sm:justify-center md:flex-none md:px-28">
          <main className="mx-auto w-full max-w-md sm:px-4 md:w-96 md:max-w-sm md:px-0">
            {props.children}
          </main>
        </div>
      </div>
    </div>
  );
}

export default GradientSplit;
