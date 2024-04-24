import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useAuthState } from "../../guard/AuthProvider";
import { doLogin } from "../../api/auth";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  email: z.string(),
  password: z.string(),
});

type SchemaType = z.infer<typeof schema>;

export const LoginPage = () => {
  const { handleUpdateAuthToken } = useAuthState();

  const { register, handleSubmit } = useForm<SchemaType>({
    resolver: zodResolver(schema),
  });

  const handleLogin = handleSubmit(async (data) => {
    const result = await doLogin({
      email: data.email,
      password: data.password,
    });
    handleUpdateAuthToken(result.access_token);
  });

  return (
    <div className="h-screen content-center">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  {...register("email")}
                  placeholder="email@address.com"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  {...register("password")}
                  placeholder="password"
                  id="password"
                  type="password"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
