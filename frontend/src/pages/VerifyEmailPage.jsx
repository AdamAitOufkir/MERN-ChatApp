import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { verifyEmail } = useAuthStore();

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await verifyEmail(token);
        toast.success(response.message);
        setTimeout(() => navigate("/login"), 5000);
      } catch (err) {
        const errorMessage =
          err?.response?.data?.message || "Verification failed";
        toast.error(errorMessage);
      }
    };
    verify();
  }, [token, navigate, verifyEmail]);

  return (
    <div className="min-h-screen flex items-center justify-center w-[100vw]">
      <Loader className="text-primary" />
    </div>
  );
};

export default VerifyEmailPage;
