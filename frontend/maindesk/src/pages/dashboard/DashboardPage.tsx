import { useAuthState } from "../../guard/AuthProvider";

const DashboardPage = () => {
  const { handleResetAuthToken } = useAuthState();
  return (
    <>
      Dashboard Page
      <br />
      <button onClick={handleResetAuthToken}>log out</button>
    </>
  );
};

export default DashboardPage;
