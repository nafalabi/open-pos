const PageNotFound = () => {
  return (
    <div className="flex flex-col min-h-[80vh] w-full justify-center items-center">
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
        404 Not Found
      </h1>
      <p className="text-xl text-muted-foreground">
        The page you are accessing can't be found
      </p>
    </div>
  );
};

export default PageNotFound;
